/**
 * Created by dingyang on 2016/10/26.
 */
'use strict';
var socketioJwt = require('socketio-jwt');
var async = require('async');
var jwt = require('jsonwebtoken');
var request = require('request');
var TokenVerify = require('./tokenVerify');
const _ = require('lodash');


/**
 * system消息说明
 * type:
 *      'join' 进入房间
 *      'leave' 离开房间
 *      'addMember' 新成员加入
 *      'deleteMember' 成员退出
 *
 */

module.exports = function () {
    this.onConnect = function (io) {
        // io.use(socketioJwt.authorize({
        //     secret: 'test',
        //     handshake: true
        // }));
        io.use(function (socket, next) {
            // console.log('11111111111111111111111111111111111111111111',io,socket)
            let token = '';
            try {
                console.log('1212121212121212', socket.id, socket.request.headers.referer);
                // token = socket.request.headers.cookie.split('missionToken=')[1].split(';')[0];
                token = socket.request.headers.referer.split('token=')[1].split(';')[0];
                socket.synergy = socket.request.headers.referer.match(/synergy/);
                // console.log('synergy:', socket.synergy);
                // console.log(token);
                let tokenVerify = new TokenVerify(token);
                tokenVerify.verifyMoudle(function (err, result) {
                    if (err || !result) {
                        console.log(err);
                        return next('UnauthorizedError');
                    }
                    socket.decoded_token = {
                        userID: tokenVerify.decoded_token.user_id,
                        userName: result.koal_cert_g,
                        exp: tokenVerify.decoded_token.exp
                    };
                    // console.log('socket verify');
                    return next();
                });
            } catch (err) {
                console.log(err);
                // console.log('cookie', socket.request.headers.referer);
                return next('invalid_token');
            }
        });

        io.on('connection', function (socket) {
            async.waterfall([
                function (callback) {            //更新用户状态
                    // 更新用户登录状态
                    redisData.updateUserTime(socket.decoded_token.userID, Date.now(), 'login', function (err, result) {
                        if (err) {
                            console.log(new Error(err));
                            callback({first: '更新用户状态失败'}, null);
                            return;
                        }
                        callback(null, result);
                    });
                }, function (isExist, callback) { //如果没有存储该用户信息，调用用户系统api
                    if (isExist) {
                        callback(null, null);
                        return;
                    }

                    //todo 调用获取用户信息接口
                    callback(null, null);

                }, function (nothing, callback) {  //绑定事件
                    socket.setMaxListeners(0);
                    console.log('hello! ', socket.decoded_token);
                    if(socket.request.headers.referer.indexOf('monitor') >= 0) {
                        socket.roomID = socket.decoded_token.userID;
                    }
                    redisData.getMeetingIDs(socket.decoded_token.userID, function (err, meetings) {
                        if (err) {
                            console.log(new Error(err));
                            return;
                        }
                        for (let meeting of meetings) {
                            io.to('/' + meeting).emit('system', {
                                type: 'online',
                                meetingID: '',
                                userID: socket.decoded_token.userID,
                                userName: socket.decoded_token.userName
                            });
                        }
                    });


                    //绑定断开连接事件
                    onDisconnect(socket, io);
                    //绑定确认消息事件
                    onReceipt(socket, io);
                    //绑定消息事件
                    onMessage(socket, io);
                    //绑定离开房间消息
                    onLeaveRoom(socket, io);
                    //绑定加入房间事件
                    onJoinRoom(socket, io);
                    //绑定监视用户
                    onJoinMonitor(socket, io);
                    //绑定跳转监视页面
                    onJumpMonitor(socket, io)
                    callback(null, null);
                }
            ], function (err, result) {
                //todo 异常处理
                if (!err);
                else if (err.first) {

                } else if (err.second) {

                }
            })

        });

    };

    /**
     * 断开连接事件
     * @param socket
     * @param io
     */
    function onDisconnect(socket, io) {
        socket.on('disconnect', function () {
            console.log('disconnect ' + socket.decoded_token.userName, io.sockets.adapter);
            redisData.updateUserTime(socket.decoded_token.userID, Date.now(), 'logout', function (err, result) {
                if (err) {
                    console.log(new Error(err));
                    return;
                }
            });

            redisData.getMeetingIDs(socket.decoded_token.userID, function (err, meetings) {
                if (err) {
                    console.log(new Error(err));
                    return;
                }
                //如果下线，更新成员状态
                for (let room of meetings) {
                    //离开房间通知
                    // io.to('/' + room).emit('system', {
                    io.to('/' + room).emit('system', {
                        type: 'logout',
                        meetingID: room,
                        userID: socket.decoded_token.userID,
                        userName: socket.decoded_token.userName
                    });
                    redisData.updateMemberStatus(room, socket.decoded_token.userID, 'leave', Date.now(),
                        function (err, result) {
                            if (err) {
                                console.log(new Error(err));
                            }
                        })
                }
            });


        });
    }

    /**
     * 确认消息事件
     * @param socket
     * @param io
     */
    function onReceipt(socket, io) {
        socket.on('receipt', function (receipt) {
            redisData.getMemberMessageStatus(receipt.meetingID, socket.decoded_token.userID, function (err, data) {
                if (err) {
                    console.log(new Error(err));
                    return;
                }
                //lastMessageID
                if (Number(data[0]) < Number(receipt.messageID)) {
                    redisData.updataMemberMessageStatus(receipt.meetingID, socket.decoded_token.userID, receipt.messageID, 'sent',
                        function (err, result) {
                            if (err) {
                                console.log(new Error(err));
                                return;
                            }
                        })
                }
            })
        })
    }

    /**
     * 收到消息事件
     * @param socket
     * @param io
     */
    function onMessage(socket, io) {
        socket.on('message', function (message) {
            //用户身份判定
            if (message.sendUserID != socket.decoded_token.userID) {
                console.log(new Error("Invalid userID! " + message.sendUserID));
                message.sendUserID = socket.decoded_token.userID;
            }

            async.waterfall([function (cb) {
                redisData.getMeetingInfo(message.meetingID, cb)
            }, function (meetingInfo, cb) {
                //如果房间不是正常状态，不处理消息
                if (meetingInfo.status != 1) return cb(null);

                //房间判定
                for (let room in socket.rooms) {
                    if (room == ('/' + message.meetingID)) {
                        console.log(room, 'have new message');
                        //记录信息
                        message.sendUserName = socket.decoded_token.userName;
                        message.sendTime = Date.now();
                        redisData.insertMessage(
                            message.meetingID,
                            message.attachmentIDList,
                            message.message,
                            message.objectList,
                            message.callbackData || '',
                            message.sendUserID,
                            message.sendUserName,
                            message.recvUserID,
                            message.recvUserName,
                            message.sendTime,
                            function (err, result) {
                                message.messageID = result.messageID;
                                delete message.attachmentIDList;
                                delete message.objectList;
                                if (err) {
                                    console.log(new Error(err));
                                    message.invalid = true;
                                    message.message = '';
                                    message.attachementInfo = [];
                                    io.to(room).emit('message', [message]);
                                    return;
                                }
                                message.attachmentInfo = result.attachmentInfo;
                                message.callbackData = _.get(result, 'callbackData', '');
                                message.invalid = false;
                                console.log('send to', room, message);
                                //广播消息
                                io.to(room).emit('message', [message]);
                                //更新在线用户未读计数
                                redisData.getMembers(message.sendUserID, message.meetingID, 'all',
                                    function (err, members) {
                                        if (err) {
                                            console.log(new Error(err));
                                            return;
                                        }
                                        message.message = '';
                                        for (let id in io.sockets.connected) {
                                            //协同账号
                                            if (io.sockets.connected[id].decoded_token.userID == socket.decoded_token.userID
                                                && io.sockets.connected[id].synergy) {
                                                io.sockets.connected[id].emit('message', [message]);
                                            }

                                            if (io.sockets.connected[id].roomList.indexOf(message.meetingID) >= 0) continue;

                                            for (let member of members) {
                                                if (member.userID == io.sockets.connected[id].decoded_token.userID
                                                    && member.userID != message.sendUserID) {
                                                    io.sockets.connected[id].emit('message', [message]);
                                                }
                                            }
                                        }
                                    }
                                )
                            }
                        );
                        break;
                    }
                }
            }]);
        });
    }

    function onLeaveRoom(socket, io) {
        socket.on('leave room', function (roomID, resp) {
            let roomPath = '/' + roomID;
            let now = Date.now();
            for (let room of socket.rooms) {
                if (room == roomPath) {
                    socket.leave(room);
                    //离开房间通知
                    io.to(roomPath).emit('system', {
                        type: 'leave',
                        meetingID: roomID,
                        userID: socket.decoded_token.userID,
                        userName: socket.decoded_token.userName,
                        lastLogoutTime: now
                    });
                    //删除记录
                    let index = socket.roomList.indexOf(roomID);
                    if (index >= 0)
                        socket.roomList.splice(index, 1);

                    console.log(socket.decoded_token.userID, '离开', roomID);
                    redisData.updateMemberStatus(roomID, socket.decoded_token.userID, 'leave', now,
                        function (err, result) {
                            //todo 未处理该错误
                            if (err) {
                                console.log(new Error(err));
                                resp(false);
                                return;
                            }
                            resp(true);
                        });


                    break;
                }
            }
        })
    }

    function onJoinMonitor(socket, io) {
        socket.on('get online', function (data, resp) {
            let arr = [];
            for (let r in io.sockets.sockets) {
                if (io.sockets.sockets[r].roomID) {
                    arr.push(io.sockets.sockets[r].roomID);
                }
            }
            resp(null, _.uniq(arr));
        })
    }

    function onJumpMonitor(socket, io) {
        socket.on('jump monitor', function (data) {
            console.log('3333', data);
            for (let i in io.sockets.sockets) {
                if (io.sockets.sockets[i].hasOwnProperty('roomID') && io.sockets.sockets[i].roomID == data[0]) {
                    io.to(i).emit('jump monitor', data[1]);
                }
            }
        })
    }

    /**
     * 申请进入房间事件
     * @param socket
     * @param io
     */
    function onJoinRoom(socket, io) {
        if (!socket.roomList)
            socket.roomList = [];
        socket.on('join room', function (roomID, resp) {
            console.log('join room:', roomID);
            //判断该用户是否能进入改房间
            redisData.getMeetings(socket.decoded_token['userID'], function (err, meetings) {
                var meeting = null;
                for (let index in meetings) {
                    if (meetings[index].meetingID == roomID) {
                        meeting = meetings[index];
                        break;
                    }
                }

                if (!meeting) {
                    resp('无法进入该房间 ' + socket.decoded_token['userID']);
                    return;
                }

                let roomPath = '/' + roomID;
                let now = Date.now();
                //离开曾经的房间   临时方案，后续支持多房间同时存在
                for (var oldRoom in socket.rooms) {
                    if (oldRoom == socket.id || oldRoom == roomPath) continue;

                    socket.leave(socket.rooms[oldRoom]);
                    console.log(socket.id, '离开', oldRoom);
                    //TODO 需要async
                    // 更新曾经房间的成员状态
                    redisData.updateMemberStatus(oldRoom.substr(1), socket.decoded_token.userID, 'leave', now,
                        function (err, result) {
                            //todo 未处理该错误
                            if (err) {
                                console.log(new Error(err));
                                return;
                            }
                            //暂不通知
                            // io.to(oldRoom).emit('system', {
                            //     type: 'leave',
                            //     meetingID: oldRoom.substr(1),
                            //     userID: socket.decoded_token.userID,
                            //     userName: socket.decoded_token.userName,
                            //     lastLogoutTime: now
                            // });
                        })
                }
                socket.roomList = [];

                //已连接，跳过
                if (socket.rooms[roomPath]) {
                    console.log('111111',meeting);
                    resp(null, meeting);
                    return;
                }

                //更新新进入房间的成员状态
                redisData.updateMemberStatus(roomID, socket.decoded_token.userID, 'join', now,
                    function (err, result) {
                        if (err) {
                            console.log(new Error(err));
                            resp('在线状态更新失败');
                            return;
                        }

                        //进入房间通知   暂不通知
                        // io.to(roomPath).emit('system', {
                        //     type: 'join',
                        //     meetingID: roomID,
                        //     userID: socket.decoded_token.userID,
                        //     userName: socket.decoded_token.userName,
                        //     lastLoginTime: now
                        // });
                        //进入选定的房间
                        socket.join(roomPath);
                        //发送该房间最近的n条信息
                        async.waterfall([
                            function (callback) {
                                redisData.getLastMessageID(roomID, callback);
                            },
                            function (id, callback) {
                                redisData.getMessage(roomID, Number(id) - 200 + 1, 200, callback);
                            }
                        ], function (err, result) {
                            if (err) {
                                console.log("发送历史消息失败,", err);
                                return;
                            }
                            socket.emit('message', result);
                            socket.roomList.push(roomID);

                            console.log(socket.id, '进入', roomID);
                        });
                        resp(null, meeting);


                    });

            });

        });
    }

};
