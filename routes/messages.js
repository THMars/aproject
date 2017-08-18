'use strict';
var express = require('express');
var router = express.Router();
var async = require('async');
const Crypto = require('../lib/myCrypto');
// var DBhelp = require('../lib/dbhelp');
// var dbAccess = new DBhelp();
// var mongodb = require('mongodb');

router.post('/history', function (req, res, next) {
    async.waterfall([
            function (callback) {   //获取成员状态
                redisData.getMemberStatus(req.body.roomID, req.userInfo.userID, function (err, result) {
                    if (err) {
                        callback('获取成员状态失败');
                        return;
                    }
                    callback(err, result);
                });
            },
            function (result, callback) {
                if (result < 0) {   //已移除或非成员
                    callback('当前用户无操作权限');
                    return;
                }

                if (req.body.msgID) { //非空消息ID直接获取
                    callback(null, req.body.msgID);
                    return;
                }

                //空消息ID，获取最新消息ID
                redisData.getLastMessageID(req.body.roomID, function (err, lastMessageID) {
                    if (!err) {
                        callback(null, Number(lastMessageID) - Number(req.body.size));
                        return;
                    }
                    callback('获取消息状态失败');
                });
            },
            function (messageID, callback) {
                redisData.getMessage(req.body.roomID, messageID, req.body.size, function (err, result) {
                    if (err) {
                        callback('无法获取消息');
                        return;
                    }
                    callback(err, result);
                });
            }
        ],
        function (err, data) {
            if (err) {
                console.log(new Error(err));
                res.json({err: '获取消息失败', message: err});
                return;
            }
            res.json(data);
        })

});

router.post('/callbackmsg', function (req, res, next) {
    if (!req.body.redirectID) {
        res.json({
            response: {
                code: '0',
                message: '无效的ID：' + req.body.redirectID || '空'
            }
        });
        return;
    }

    try {
        //     req.body.redirectID = JSON.parse(Crypto.decrypto(req.body.redirectID, req.userInfo.userID));
        //     console.log('redirectID', req.body.redirectID);
        req.body.redirectID = JSON.parse(req.body.redirectID);
    } catch (e) {
        console.log(e);
        return res.json({
            response: {
                code: '0',
                message: '无效的ID：' + req.body.redirectID || '空'
            }
        });
    }

    // console.log('callback', req.body);
    let now = Date.now();
    let message = {
        meetingID: req.body.redirectID.meetingID,
        attachmentIDList: [],
        objectList: [],
        message: '',
        sendUserID: req.userInfo.userID,
        sendUserName: req.userInfo.userName,
        recvUserID: '',
        recvUserName: '',
        callbackData: {from: req.body.redirectID.objectID, data: req.body.data},
        sendTime: String(now)
    };

    for (let id in io.sockets.connected) {
        if (message.sendUserID == io.sockets.connected[id].decoded_token.userID) {
            addMsg(message, io.sockets.connected[id], io, function (err, messageID) {
                if (err) {
                    res.json({
                        response: {
                            code: '0',
                            message: err
                        }
                    });
                    return;
                }

                try {
                    let eventInfo = {
                        time: now,
                        mid: req.body.redirectID.meetingID,
                        mname: req.body.redirectID.meetingName,
                        did: req.body.redirectID.systemID,
                        dname: req.body.redirectID.systemTitle,
                        objid: req.body.redirectID.objectID,
                        lastEventID: req.body.redirectID.lastEventID,
                        uid: req.userInfo.userID,
                        uname: req.userInfo.userName,
                        callbackdata: JSON.stringify(req.body.data),
                        callbackdataid: 'backobject-' + req.body.redirectID.meetingID + '-' + messageID
                    };
                    //创建事件
                    redisData.insertEvent(req.userInfo.userID, req.body.redirectID.meetingID, 5, now, JSON.stringify(eventInfo), function (err) {
                        if (err) console.log(new Error(err));
                    });
                } catch (e) {
                    console.log(e);
                }

                res.json({
                    response: {
                        code: '1',
                        message: '回传成功'
                    }
                });
            });
            return;
        }
    }

    //if not find
    redisData.getMeetingInfo(message.meetingID, function (err, info) {
        if (err) {
            console.log(new Error(err));
            res.json({
                response: {
                    code: '0',
                    message: '无法获取此会战'
                }
            });
            return;
        }

        res.json({
            response: {
                code: '0',
                message: '请在协同会战系统登录房间：' + info.name
            }
        });

        return;
    });
});

// console.log(Crypto.decrypto('79758ce5474f9cc25752dd0ae3c8f28aa9ced5988b370d603d170f8076544cfc7bc9e301b8df6edbaf35f9250709bb5fd758903f274fc29d6ad7b3d9a8eb3adb2dd6a62957036981f6516bb4625b1c00', 8))
router.post('/callback', function (req, res, next) {
    if (!req.body.redirectID) {
        res.json({
            response: {
                code: '0',
                message: '无效的ID：' + req.body.redirectID || '空'
            }
        });
        return;
    }

    try {
        req.body.redirectID = JSON.parse(Crypto.decrypto(req.body.redirectID, req.userInfo.userID));
        // console.log('redirectID', req.body.redirectID);
    } catch (e) {
        console.log(e);
        return res.json({
            response: {
                code: '0',
                message: '无效的ID：' + req.body.redirectID || '空'
            }
        });
    }

    // console.log('callback', req.body);
    let now = Date.now();
    let message = {
        meetingID: req.body.redirectID.meetingID,
        attachmentIDList: [],
        objectList: [],
        message: '',
        sendUserID: req.userInfo.userID,
        sendUserName: req.userInfo.userName,
        recvUserID: '',
        recvUserName: '',
        callbackData: {from: req.body.redirectID.objectID, data: req.body.data},
        sendTime: String(now)
    };

    for (let id in io.sockets.connected) {
        if (message.sendUserID == io.sockets.connected[id].decoded_token.userID) {
            addMsg(message, io.sockets.connected[id], io, function (err, messageID) {
                if (err) {
                    res.json({
                        response: {
                            code: '0',
                            message: err
                        }
                    });
                    return;
                }

                try {
                    let eventInfo = {
                        time: now,
                        mid: req.body.redirectID.meetingID,
                        mname: req.body.redirectID.meetingName,
                        did: req.body.redirectID.systemID,
                        dname: req.body.redirectID.systemTitle,
                        objid: req.body.redirectID.objectID,
                        lastEventID: req.body.redirectID.lastEventID,
                        uid: req.userInfo.userID,
                        uname: req.userInfo.userName,
                        callbackdata: JSON.stringify(req.body.data),
                        callbackdataid: 'backobject-' + req.body.redirectID.meetingID + '-' + messageID
                    };
                    //创建事件
                    redisData.insertEvent(req.userInfo.userID, req.body.redirectID.meetingID, 5, now, JSON.stringify(eventInfo), function (err) {
                        if (err) console.log(new Error(err));
                    });
                } catch (e) {
                    console.log(e);
                }

                res.json({
                    response: {
                        code: '1',
                        message: '回传成功'
                    }
                });
            });
            return;
        }
    }

    //if not find
    redisData.getMeetingInfo(message.meetingID, function (err, info) {
        if (err) {
            console.log(new Error(err));
            res.json({
                response: {
                    code: '0',
                    message: '无法获取此会战'
                }
            });
            return;
        }

        res.json({
            response: {
                code: '0',
                message: '请在协同会战系统登录房间：' + info.name
            }
        });

        return;
    });
});

function addMsg(message, socket, io, callback) {
    let roomPath = '/' + message.meetingID;
    // let room = socket.rooms[roomPath];
    // if (!room) {
    //     callback("未登录会战:" + message.meetingID);
    //     return;
    // }
    //房间判定
    // console.log(roomPath, ' have new message');
    async.waterfall([function (cb) {
        redisData.insertMessage(
            message.meetingID,
            message.attachmentIDList,
            message.message,
            message.objectList,
            message.callbackData,
            message.sendUserID,
            message.sendUserName,
            message.recvUserID,
            message.recvUserName,
            message.sendTime, cb)
    }, function (result, cb) {
        message.messageID = result.messageID;
        delete message.attachmentIDList;
        message.attachmentInfo = result.attachmentInfo;
        message.invalid = false;
        // console.log('send to', roomPath, message);
        //广播消息
        io.to(roomPath).emit('message', [message]);

        redisData.getMembers(message.sendUserID, message.meetingID, 'all', function (err, members) {
            if (err) {
                console.log(new Error(err));
                return cb('无法获取会战信息');
            }
            // message.message = '';
            for (let id in io.sockets.connected) {
                if (io.sockets.connected[id].roomList.indexOf(message.meetingID) >= 0) continue;

                for (let member of members) {
                    if (member.userID == io.sockets.connected[id].decoded_token.userID
                        && member.userID != message.sendUserID) {
                        io.sockets.connected[id].emit('message', [message]);
                    }
                }
            }
            cb(null);
        });
    }], function (err) {
        if (err) {
            callback('录入消息失败');
            return;
        }
        callback(null, message.messageID);
    });

    return;
}

module.exports = router;
