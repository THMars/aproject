/**
 * Created by dingyang on 16/4/29.
 */
"use strict";
let redis = require('redis');
let _ = require('underscore');
let async = require('async');
const myConfig = require('../config/config');
//let redisClient = redis.createClient(6379, "127.0.0.1");
let redisClient = redis.createClient(myConfig.redis.port, myConfig.redis.ip);
redisClient.on('error', function (err) {
    console.log(new Error(err));
});

redisClient.on('connect', function () {
    console.log('redis connected');
    // redisClient.keys('event4User:*', function (err, r) {
    //     console.log(r)
    //     redisClient.del(r);
    // })
});


module.exports = function () {

    this.getAppInfo = function (callback) {
        redisClient.hgetall('appInfo', callback);
    };

    this.setAppInfo = function (info, callback) {
        let option = [];
        for (let param in info) {
            option.push(param, info[param]);
        }
        redisClient.hmset('appInfo', option, callback);
    };

    this.getMeetingInfo = function (meetingID, callback) {
        redisClient.hgetall('meeting-' + meetingID, callback)
    };

    /**
     * 获取会战信息（判断了用户是否在会战中）
     * @param userID 用户ID
     * @param meetingID 会战ID
     * @param callback
     */
    this.getMeeting = function (userID, meetingID, callback) {
        let batch = redisClient.batch();
        batch.zrangebyscore(['mymeetings-' + userID, 0, 1]);
        batch.hgetall('meeting-' + meetingID);


        batch.exec(function (err, result) {
            if (err) {
                console.log(new Error(err));
            }

            let meetingInfo = {};
            if (result[0].indexOf(String(meetingID)) >= 0) {
                meetingInfo = result[1];
            } else {
                err = '无访问权限';
            }

            if (err) {
                console.error(new Error(err));
            }

            if (callback)
                callback(err, meetingInfo);
        })
    };

    this.getLastMessageID = function (meetingID, callback) {
        redisClient.get('messageID-' + meetingID, function (err, id) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, id);
        })
    };

    /**
     * 获取消息
     * @param meetingID
     * @param offsetID
     * @param size
     * @param callback 返回message结构数组
     */
    this.getMessage = function (meetingID, offsetID, size, callback) {
        redisClient.zrangebyscore(['messages-' + meetingID, offsetID, offsetID + size - 1],
            function (err, messages) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }
                let batch = redisClient.batch();
                let messageKey = '';
                let dataList = [];

                for (let message of messages) {
                    messageKey = 'message-' + meetingID + '-' + message;
                    batch.hgetall(messageKey, function (mk) {
                        return function (err, data) {
                            if (err) {
                                console.log(new Error(err));
                                return;
                            }
                            if (!data) {
                                console.log('no message ' + mk);
                                return;
                            }
                            dataList.push(data);
                        }
                    }(messageKey));
                }

                batch.exec(function (err, reply) {
                    if (err) {
                        console.log(new Error(err));
                        callback(err);
                        return;
                    }
                    for (let i in dataList) {
                        dataList[i].attachmentInfo = [];
                        let attachmentList;
                        try {
                            attachmentList = JSON.parse(dataList[i].attachmentIDList);
                        } catch (e) {
                            console.log(e);
                            console.log(':', dataList[i].attachmentIDList);
                            continue;
                        }
                        delete dataList[i].attachmentIDList;
                        for (let attachmentID of attachmentList) {
                            batch.hgetall('attachment-' + meetingID + '-' + attachmentID, function (index) {
                                return function (err, attachment) {
                                    if (err) {
                                        console.log(new Error(err));
                                        return;
                                    }
                                    dataList[index].attachmentInfo.push(attachment);
                                }
                            }(i))
                        }
                    }
                    batch.exec(function (err) {
                        if (err) {
                            console.log(new Error(err));
                            callback(err);
                            return;
                        }
                        callback(null, dataList);
                    });
                })
            })

    };

    /**
     * 添加消息
     * @param meetingID
     * @param attachmentIDList
     * @param message
     * @param sendUserID
     * @param sendUserName
     * @param recvUserID
     * @param recvUserName
     * @param callbackData
     * @param sendTime
     * @param standardObjs
     * @param callback   返回messageID
     */
    this.insertMessage = function (meetingID, attachmentIDList, message, standardObjs, callbackData,
                                   sendUserID, sendUserName, recvUserID, recvUserName, sendTime, callback) {
        redisClient.incr('messageID-' + meetingID, function (err, messageID) {
            if (err) {
                console.log(new Error(err));
                if (callback)
                    callback(err, messageID);
            }


            let multi = redisClient.multi();
            let messageKey = 'message-' + meetingID + '-' + messageID;
            let setOpt = [];
            let strList = '[]';
            let batch = redisClient.batch();
            let callbackDataID = '';
            if (attachmentIDList && attachmentIDList.length > 0) {
                strList = JSON.stringify(attachmentIDList);
                for (let attachmentID of attachmentIDList) {
                    setOpt.push(sendUserID, attachmentID);
                    batch.hgetall('attachment-' + meetingID + '-' + attachmentID);
                }
                multi.zadd('attachmentList-' + meetingID, setOpt);
            }

            if (callbackData) {
                callbackDataID = 'backobject-' + meetingID + '-' + messageID;
                multi.hmset(callbackDataID, 'id', callbackDataID,
                    'messageID', messageID,
                    'meetingID', meetingID,
                    'attachmentIDList', strList,
                    'message', message,
                    'sendUserID', sendUserID,
                    'sendUserName', sendUserName,
                    'recvUserID', recvUserID,
                    'recvUserName', recvUserName,
                    'sendTime', sendTime,
                    'type', callbackData.type,
                    'from', callbackData.id
                );
                try {
                    let eventInfo = {
                        time: sendTime,
                        mid: meetingID,
                        mname: '',
                        did: '',
                        dname: '',
                        objid: callbackData.id,
                        lastEventID: '',
                        uid: sendUserID,
                        uname: sendUserName,
                        callbackdata: callbackData,
                        callbackdataid: callbackDataID
                    };
                    //创建事件
                    insertEvent(sendUserID, meetingID, 5, sendTime, JSON.stringify(eventInfo), function (err) {
                            if (err) console.error(new Error(err));
                        }
                    );
                } catch (e) {
                    console.error(e);
                }
            }

            multi.hmset(messageKey,
                [
                    'messageID', messageID,
                    'meetingID', meetingID,
                    'attachmentIDList', strList,
                    'message', message,
                    'sendUserID', sendUserID,
                    'sendUserName', sendUserName,
                    'recvUserID', recvUserID,
                    'recvUserName', recvUserName,
                    'callbackData', callbackDataID,
                    'sendTime', sendTime
                ]);
            multi.zadd('messages-' + meetingID, messageID, messageID);
            multi.exec(function (err, result) {
                if (err) {
                    console.log(new Error(err));
                    callback(err, messageID);
                    return;
                }
                // redisClient.rpush('messageList',
                //     '{"messageID":"' + messageID +
                //     '","meetingID":"' + meetingID +
                //     '","attachmentIDList":"' + strList +
                //     '","message":"' + message +
                //     '","sendUserID":"' + sendUserID +
                //     '","sendUserName":"' + sendUserName +
                //     '","recvUserID":"' + recvUserID +
                //     '","recvUserName":"' + recvUserName +
                //     '","sendTime":"' + sendTime + '"}',
                //     function (err) {
                //         if (err)
                //             console.log(new Error(err));
                //     });

                batch.exec(function (err, attachmentInfo) {
                    if (err) {
                        console.log(new Error(err));
                        callback(err);
                        return;
                    }
                    // console.log('attachmentInfo', attachmentInfo);

                    for (let i = 0; i < attachmentInfo.length; ++i) {
                        let eventInfo = {
                            type: 'standardfile',
                            id: 'standardfile-' + meetingID + '-' + attachmentInfo[i].attachmentID,
                            name: attachmentInfo[i].attachmentName,
                            uid: sendUserID,
                            uname: sendUserName,
                            mid: meetingID,
                            msgid: messageID,
                            data: attachmentInfo[i].attachmentObj
                        };
                        // console.log(1111111, JSON.stringify(eventInfo));
                        insertEvent(sendUserID, meetingID, 1, sendTime, JSON.stringify(eventInfo), function (err) {
                            if (err) console.log(new Error(err));
                        })
                    }

                    insertStandardObjects(standardObjs, meetingID, messageID, sendTime, sendUserID, sendUserName, function (err) {
                        if (!err) {
                            for (let standardObj of standardObjs) {
                                let eventInfo = {
                                    type: standardObj.label,
                                    id: 'object-' + standardObj.id + '-' + meetingID + '-' + messageID + '-' + sendUserID + '-' + standardObj.objectId,
                                    name: standardObj.objectName,
                                    uid: sendUserID,
                                    uname: sendUserName,
                                    mid: meetingID,
                                    msgid: messageID,
                                    data: JSON.stringify(standardObj)
                                };
                                // console.log(1111111, standardObj, JSON.stringify(eventInfo));
                                insertEvent(sendUserID, meetingID, 1, sendTime, JSON.stringify(eventInfo), function (err) {
                                    if (err) console.log(new Error(err));
                                })
                            }
                        }
                        callback(err, {
                            messageID: messageID,
                            attachmentInfo: attachmentInfo,
                            callbackData: callbackDataID
                        })
                    });
                })

            })

        });
    };


    var insertStandardObjects = this.insertStandardObjects = function (standardobjs, meetingID, messageID, sendTime, sendUserID, sendUserName, callback) {
        let batch = redisClient.batch();
        for (let standardobj of standardobjs) {
            let objectKey = 'object-' + standardobj.id + '-' + meetingID + '-' + messageID + '-' + sendUserID + '-' + standardobj.objectId;
            let dataInfo = [];
            dataInfo.push('sendUserID');
            dataInfo.push(sendUserID);
            dataInfo.push('sendUserName');
            dataInfo.push(sendUserName);
            dataInfo.push('sendTime');
            dataInfo.push(sendTime);
            dataInfo.push('messageID');
            dataInfo.push(messageID);
            dataInfo.push('meetingID');
            dataInfo.push(meetingID);
            dataInfo.push('type');
            dataInfo.push(standardobj.label);
            dataInfo.push('name');
            dataInfo.push(standardobj.objectName);
            dataInfo.push('id');
            dataInfo.push(objectKey);


            console.log(standardobj);
            let data = {};
            for (let key in standardobj) {
                if (!standardobj.hasOwnProperty(key)) continue;
                if (key === 'objectId' || key === 'type' || key === 'objectName') continue;
                data[key] = standardobj[key];
            }

            dataInfo.push('data');
            dataInfo.push(JSON.stringify(data));

            batch.hmset(objectKey, dataInfo);
        }

        batch.exec(callback);
    };

    this.insertFileObjects = function (standardfileobjs, meetingID, messageID, sendTime, sendUserID, sendUserName, callback) {
        let batch = redisClient.batch();
        for (let standardobj of standardfileobjs) {
            var type = standardobj.type;
            var dataArr = transdatatoList(standardobj);
            dataArr.push('userID');
            dataArr.push(sendUserID);
            dataArr.push('sendUserName');
            dataArr.push(sendUserName);
            dataArr.push('sendTime');
            dataArr.push(sendTime);
            dataArr.push('messageID');
            dataArr.push(messageID);
            dataArr.push('meetingID');
            dataArr.push(meetingID);
            dataArr.push('type');
            dataArr.push(type);


            batch.hmset(standardobj.objectId, dataArr);
        }

        batch.exec(callback);
    };


    /**
     * 插入结果数据
     * @param results 结果数据的json字符串
     * @param source 数据来源json对象
     * @param callback  (err,id) => (错误信息，数据id)
     */
    this.insertResultObjects = function (results, source, callback) {
        let options = [];
        redisClient.incr('resultObjects', function (err, id) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }
            let option = transdatatoList(source);
            option.unshift('hmset', 'resultObjects-' + id, 'id', 'resultObjects-' + id, 'data', results);
            options.push(option);
            redisClient.batch(options).exec(function (err) {
                if (err) {
                    console.log(new Error(err));
                    return callback(err);
                }

                return callback(null, 'resultObjects-' + id);
            })
        })
    };

    this.getAttachment = function (meetingID, attachmentID, callback) {
        redisClient.hgetall('attachment-' + meetingID + '-' + attachmentID, function (err, attachment) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return;
            }
            callback(null, attachment);
        })
    };

    /**
     * 获取会战附件列表
     * @param meetingID
     * @param offset
     * @param size
     * @param callback
     */
    this.getAttachmentList = function (meetingID, offset, size, callback) {
        let option = [];
        if (Number(size) != 0) {
            option = ['attachmentList-' + meetingID, 'limit', offset, size, 'desc'];
        } else {
            option = ['attachmentList-' + meetingID, 'desc'];
        }
        redisClient.sort(option, function (err, list) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return;
            }

            let batch = redisClient.batch();
            for (let id of list) {
                batch.hgetall('attachment-' + meetingID + '-' + id);
            }

            batch.exec(function (err, attachmentList) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }
                callback(null, attachmentList);

            });
        })
    };


    /**
     * 添加附件
     * @param meetingID
     * @param uploadUserID
     * @param uploadUserName
     * @param attachmentName
     * @param attachmentPath
     * @param attachmentType
     * @param attachmentSize
     * @param attachmentMD5
     * @param attachmentObj
     * @param uploadTime
     * @param callback
     */
    this.addAttachment = function (meetingID, uploadUserID, uploadUserName, attachmentName, attachmentPath, attachmentType,
                                   attachmentSize, attachmentMD5, attachmentObj, uploadTime, callback) {
        redisClient.incr('attachmentID-' + meetingID, function (err, result) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return;
            }
            redisClient.hmset('attachment-' + meetingID + '-' + result,
                [
                    'attachmentID', result,
                    'attachmentName', attachmentName,
                    'attachmentType', attachmentType,
                    'attachmentPath', attachmentPath,
                    'attachmentSize', String(attachmentSize),
                    'attachmentMD5', attachmentMD5,
                    'attachmentObj', attachmentObj,
                    'uploadUserID', String(uploadUserID),
                    'uploadUserName', uploadUserName,
                    'uploadTime', uploadTime,
                    'delTime', ''
                ], function (err) {
                    if (err) {
                        console.log(new Error(err));
                        if (callback) {
                            callback(err);
                            return;
                        }

                    }
                    callback(null, {
                        'attachmentID': result,
                        'attachmentName': attachmentName,
                        'attachmentType': attachmentType,
                        'attachmentPath': attachmentPath,
                        'attachmentSize': String(attachmentSize),
                        'attachmentMD5': attachmentMD5,
                        'attachmentObj': attachmentObj,
                        'uploadUserID': String(uploadUserID),
                        'uploadUserName': uploadUserName,
                        'uploadTime': uploadTime,
                        'delTime': ''
                    });
                })
        });

    };

    /**
     * 获取会战内在线成员
     * @param meetingID
     * @param callback 返回在线成员userID数组
     */
    this.getOnlineUserInMeeting = function (meetingID, callback) {
        let membersKey = 'members-' + meetingID;
        redisClient.zrangebyscore([membersKey, 1, 1], function (err, members) {
            if (callback)
                callback(err, members);
        })
    };


    /**
     * 获取成员状态 0: 不在线 1: 在线  -1: 移除  null: 不存在
     * @param meetingID
     * @param userID
     * @param callback
     */
    this.getMemberStatus = function (meetingID, userID, callback) {
        redisClient.zscore('members-' + meetingID, userID, function (err, result) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }
            if (!result) {
                return callback(null, -1);
            }
            return callback(null, result);
        })
    };


    /**
     * 删除成员
     * @param meetingID
     * @param userID
     * @param delTime
     * @param recursively  递归删除
     * @param callback
     */
    this.delMember = function (meetingID, userID, delTime, recursively, callback) {
        let batch = redisClient.batch();
        async.waterfall([function (cb) {
            batch.zrem('mymeetings-' + userID, meetingID);
            batch.hset('member-' + meetingID + '-' + userID, 'delTime', delTime);
            batch.zadd(['members-' + meetingID, -1, userID]);

            if (!recursively) {
                batch.exec(function (err) {
                    if (err) {
                        console.log(new Error(err));
                        cb(err);
                        return;
                    }
                    cb(null, []);
                    return;
                });
                return;
            }

            redisClient.zrangebyscore('mymeetings-' + userID, -1, 1, function (err, meetings) {
                if (err) {
                    console.log(new Error(err));
                    cb(err);
                    return;
                }

                let subMeetings = [];

                for (let meeting of meetings) {
                    if (meeting.indexOf(String(meetingID) + '-') == 0) {
                        batch.zrem('mymeetings-' + userID, meeting);
                        batch.hset('member-' + meeting + '-' + userID, 'delTime', delTime);
                        batch.zadd(['members-' + meeting, -1, userID]);
                        subMeetings.push(meeting);
                    }
                }

                batch.exec(function (err) {
                    if (err) {
                        console.log(new Error(err));
                        cb(err);
                        return;
                    }
                    cb(null, subMeetings);
                    return;
                });
            });
        }], function (err, subMeetings) {
            if (err) {
                callback(err);
                return;
            }
            redisClient.hget('user-' + userID, 'userName', function (err, userName) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }
                subMeetings.push(meetingID);
                callback(null, {member: {userID: userID, userName: userName}, meetings: subMeetings});
            })
        });

    };

    /**
     *  更新会战中成员的状态
     * @param meetingID
     * @param userID
     * @param status leave join
     * @param updateTime
     * @param callback
     */
    this.updateMemberStatus = function (meetingID, userID, status, updateTime, callback) {
        let membersKey = 'members-' + meetingID;
        let batch = redisClient.batch();
        if (status == 'join') {
            batch.hmset('member-' + meetingID + '-' + userID, 'lastLoginTime', updateTime);
            status = 1;
        } else if (status == 'leave') {
            batch.hmset('member-' + meetingID + '-' + userID, 'lastLogoutTime', updateTime);
            status = 0
        } else {
            if (callback) callback('invalid args');
            return;
        }
        batch.zadd([membersKey, status, userID]);
        batch.exec(function (err) {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }

            redisClient.hgetall('member-' + meetingID + '-' + userID, callback);
        });
    };


    /**
     * 更新用户上下线时间
     * 每次只更新一个时间字段，通过lastLoginTime和lastLogoutTime的大小关系判断在线状态
     * @param userID
     * @param time
     * @param status  login  logout
     * @param callback
     */
    this.updateUserTime = function (userID, time, status, callback) {
        if (status == 'login') {
            status = 'lastLoginTime';
        } else if (status == 'logout') {
            status = 'lastLogoutTime';
        } else {
            callback('invalid args');
            return;
        }
        let userKey = 'user-' + userID;
        redisClient.exists(userKey, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            if (result == 0) {
                callback(null, false);
                return;
            }

            redisClient.hmset(userKey, status, time, function (err, result) {
                if (err) {
                    callback(err);
                    return;
                }
                return callback(null, true);
            })

        })

    };

    /**
     * 创建会战室（房间）
     * @param parentID if exist , create room
     * @param name
     * @param createUserID
     * @param createTime
     * @param callback 返回meetingID
     */
    this.addMeeting = function (parentID, name, createUserID, createTime, desc, callback) {
        let meetingKey = '';
        if (!parentID) {
            parentID = '';
            meetingKey = 'meetingID';
        } else {
            if (isNaN(parentID)) {
                callback('invalid parentID:' + parentID);
                return;
            }
            meetingKey = 'roomID';
        }

        redisClient.incr(meetingKey, function (err, id) {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }

            let meetingID = id; //meeting

            if (parentID) { //room
                meetingID = parentID + '-' + id;
            }

            meetingKey = 'meeting-' + meetingID;
            let batch = redisClient.batch();
            batch.hmset(meetingKey,
                [
                    'parentID', String(parentID),
                    'meetingID', String(meetingID),
                    'name', name,
                    'createUserID', String(createUserID),
                    'createTime', String(createTime),
                    'desc', desc,
                    'endTime', '',
                    'status', '1'
                ]);

            //初始化消息信息
            batch.hmset('message-' + meetingID + '-0', [
                'messageID', '0',
                'meetingID', String(meetingID),
                'attachmentIDList', '[]',
                'message', '',
                'sendUserID', 'system',
                'sendUserName', 'system',
                'recvUserID', '',
                'recvUserName', '',
                'sendTime', String(createTime)
            ]);

            batch.zadd('messages-' + meetingID, 0, 0);

            batch.exec(function (err) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }
                callback(null, {
                    meetingID: meetingID,
                    parentID: parentID,
                    name: name,
                    createUserID: createUserID,
                    createTime: createTime,
                    lastMessageID: -1,
                    newMessageID: 0,
                    desc: desc
                });
            })
        })
    };


    /**
     * 结束或关闭会战室 0:不存在 1:成功
     * @param userID
     * @param meetingID
     * @param endTime
     * @param status 0:结束 -1:关闭
     * @param callback false true
     */
    this.updateMeetingStatus = function (userID, meetingID, endTime, status, callback) {
        if (status != 0 && status != -1) {
            console.log(new Error('未知状态'));
            if (callback)
                callback('未知状态');
            return
        }
        let meetingKey = 'meeting-' + meetingID;
        redisClient.hgetall(meetingKey, function (err, result) {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            if (result.createUserID != userID) {
                if (callback)
                    callback('当前用户无操作权限');
                return;
            }

            redisClient.hset(meetingKey, 'endTime', endTime, function (err, result) {
                if (err) {
                    console.log(new Error('无法变更会战状态失败'));
                    if (callback)
                        callback('无法变更会战状态失败');
                    return;
                }
                redisClient.zrange(['members-' + meetingID, 0, -1], function (err, members) {//not delete
                    if (err) {
                        console.log('获取会战成员状态失败');
                        if (callback)
                            callback('获取会战成员状态失败');
                        return;
                    }

                    let batch = redisClient.batch();
                    for (let member of members) {
                        batch.zadd(['mymeetings-' + member, status, meetingID]);
                    }

                    batch.hset(meetingKey, 'status', status);
                    batch.exec(function (err) {
                        if (err) {
                            console.log(new Error('无法操作会战'));
                            callback('无法操作会战', members.length > 0);
                            return;
                        }
                        callback(null, members.length > 0);
                    })
                })
            });
        })
    };

    this.delEventByMeeting = function (meetingID, callback) {
        redisClient.zrange(['event4Meeting:' + meetingID, 0, -1], function (err, events) {
            if (err) {
                console.log(new Error(err));
                if (callback) callback(err);
                return;
            }

            let batch = redisClient.batch();
            for (let event of events) {
                batch.del('event:' + event);
            }
            batch.exec(function (err) {
                if (callback) callback(err);
            })
        })
    };


    /**
     * 获取房间创建者id
     * @param meetingID
     * @param callback
     */
    this.getCreator = function (meetingID, callback) {
        let creators = {};
        let batch = redisClient.batch();
        batch.hget('meeting-' + meetingID, 'createUserID', function (err, creator) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return;
            }
            creators.selfID = creator;
        });

        //find parent
        let index = meetingID.indexOf('-');
        if (index > 0) {
            batch.hget('meeting-' + meetingID.substring(0, index), 'createUserID', function (err, creator) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                }
                creators.parentID = creator;
            });
        }

        batch.exec(function (err) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return;
            }
            callback(null, creators);
        })
    };

    /**
     * 批量添加成员
     * @param members  userID list
     * @param meetingID
     * @param addTime
     * @param callback 返回数组 {userID,userName,userPost,userLocation,userDepartment}
     */
    this.addMembers = function (members, meetingID, addTime, callback) {
        let batch = redisClient.batch();
        async.waterfall([function (cb) {
            let users = [];
            for (let member of members) {
                batch.hget('member-' + meetingID + '-' + member, 'delTime', function (userID) {
                    return function (err, result) {
                        if (err) {
                            cb(new Error(err));
                            return;
                        }
                        if (result == '')  //if null : no exist, if '' : repetition,return , else deleted
                            return;
                        let info = {userID: userID};
                        users.push(info);
                    }
                }(member));
            }

            batch.exec(function (err) {
                if (err) {
                    cb(new Error(err));
                    return;
                }
                cb(null, users);
            })
        }, function (users, cb) {
            for (let user of users) {
                batch.hgetall('user-' + user.userID, function (u) {
                    return function (err, result) {
                        if (err) {
                            cb(new Error(err));
                            return;
                        }
                        // console.log('user', users, result)
                        u.userName = result.userName;
                        u.userLocation = result.userLocation;
                        u.userDepartment = result.userDepartment;
                        u.userPost = result.userPost;

                        //初始化成员信息
                        batch.hmset('member-' + meetingID + '-' + u.userID,
                            [
                                'userID', String(u.userID),
                                'userName', u.userID,
                                'meetingID', String(meetingID),
                                'addTime', String(addTime),
                                'delTime', '',
                                'lastLoginTime', '',
                                'lastLogoutTime', '',
                                'lastMessageID', '-1',
                                'lockMessageID', ''
                            ], function (err) {
                                if (err) console.log(err);
                            });

                        // batch.zadd('messages-' + meetingID, 0, 0);
                        //更新用户的会战列表
                        batch.zadd(['mymeetings-' + u.userID, 1, meetingID]);
                        //更新会战的成员列表
                        batch.zadd(['members-' + meetingID, 0, u.userID]);
                    }
                }(user))
            }

            batch.exec(function (err) {
                if (err) {
                    cb(new Error(err));
                    return;
                }
                cb(null, users);
            })
        }
        ], function (err, users) {
            if (err) {
                console.log(err);
                callback(err);
            }

            batch.exec(function (err) {
                if (err) {
                    callback(new Error(err));
                    return;
                }
                callback(null, users);
            })

        });
        // for (let member of members) {
        //     batch.hget('member-' + meetingID + '-' + member, 'delTime', function (userID) {
        //         return function (err, result) {
        //             if (err) {
        //                 callback(err);
        //                 console.log(new Error(err));
        //                 return;
        //             }
        //             if (result == '')  //if null : no exist, if '' : repetition,return , else deleted
        //                 return;
        //
        //             //初始化成员信息
        //             batch.hmset('member-' + meetingID + '-' + userID,
        //                 [
        //                     'userID', String(userID),
        //                     'userName', userID,
        //                     'meetingID', String(meetingID),
        //                     'addTime', String(addTime),
        //                     'delTime', '',
        //                     'lastLoginTime', '',
        //                     'lastLogoutTime', '',
        //                     'lastMessageID', '-1',
        //                     'lockMessageID', ''
        //                 ]);
        //
        //             //初始化用户信息
        //             // batch.hmset('user-' + member.userID,
        //             //     [
        //             //         'userID', String(member.userID),
        //             //         'userName', member.userName,
        //             //         'userPost', member.userPost,
        //             //         'userLocation', member.userLocation,
        //             //         'userDepartment', member.userDepartment
        //             //     ]);
        //
        //             batch.zadd('messages-' + meetingID, 0, 0);
        //             batch.zadd(['mymeetings-' + userID, 1, meetingID]);
        //             batch.zadd(['members-' + meetingID, 0, userID]);
        //             ++count;
        //         }
        //     }(member));
        // }
        // batch.exec(function (err, result) {
        //     if (err) {
        //         if (callback) callback(err);
        //         return;
        //     }
        //     batch.exec(function (err) {
        //         if (err) {
        //             console.log(new Error(err));
        //             if (callback) callback(err);
        //             return;
        //         }
        //         callback(null, count);
        //     })
        // });
    };

    /**
     * 更新用户信息
     * @param users {userID,userName,userPost,userLocation,userDepartment}
     * @param callback
     */
    this.updateUserInfo = function (users, callback) {
        let batch = redisClient.batch();
        for (let user of users) {
            batch.hmset('user-' + user.userID,
                [
                    'userID', String(user.userID),
                    'userName', user.userName,
                    'userPost', user.userPost,
                    'userLocation', user.userLocation,
                    'userDepartment', user.userDepartment
                ]);
        }

        batch.exec(function (err, result) {
            if (callback)
                callback(err, result);
        })
    };

    this.refreshUserInfo = function (users, callback) {
        async.waterfall([(cb) => {
            redisClient.keys('user-*', cb);
        }, (all, cb) => {
            let multi = redisClient.multi();
            all.forEach((key) => {
                multi.del(key);
            });

            for (let user of users) {
                multi.hmset('user-' + user.userID,
                    [
                        'userID', String(user.userID),
                        'userName', user.userName,
                        'userPost', user.userPost,
                        'userLocation', user.userLocation,
                        'userDepartment', user.userDepartment
                    ]);
            }

            multi.exec(function (err, result) {
                if (callback)
                    callback(err, result);
            })
        }])

    }


    /**
     * 模拟用户系统返回用户列表
     * @param userID  if null , all
     * @param callback
     */
    this.getUsers4Test = function (userID, callback) {
        if (!userID) userID = '*';
        let batch = redisClient.batch();
        redisClient.keys('user-' + userID, function (err, userKeys) {
            if (err) {
                callback(err);
                return;
            }
            for (let userKey of userKeys) {
                batch.hgetall(userKey);
            }
            batch.exec(function (err, data) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }
                data.forEach(function (user) {
                    if (!user.hasOwnProperty('lastLoginTime')) {
                        user.status = 'offline';
                    } else if (!user.hasOwnProperty('lastLogoutTime')) {
                        user.status = 'online';
                    } else if (Number(user.lastLogoutTime) >= Number(user.lastLoginTime)) {
                        user.status = 'offline';
                    } else {
                        user.status = 'online';
                    }
                });
                callback(null, data);
            });
        })

    };


    /**
     * 更新成员消息状态
     * @param meetingID
     * @param userID
     * @param messageID
     * @param status 'sending' 'sent'
     * @param callback
     */
    this.updataMemberMessageStatus = function (meetingID, userID, messageID, status, callback) {
        let statusOpts = ['member-' + meetingID + '-' + userID];
        if (status == 'sending') {
            statusOpts.push('lockMessageID', String(messageID));
        } else if (status == 'sent') {
            statusOpts.push(
                'lockMessageID', '',
                'lastMessageID', String(messageID));
        } else {
            if (callback)
                callback('invalid args');
            return;
        }

        redisClient.hmset(statusOpts, function (err, result) {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            callback(null, null);
        })

    };

    /**
     * 获取成员消息状态
     * @param meetingID
     * @param userID
     * @param callback 返回[lastMessageID,lockMessageID]  不存在成员配置时值都为null
     */
    this.getMemberMessageStatus = function (meetingID, userID, callback) {
        redisClient.hmget('member-' + meetingID + '-' + userID, 'lastMessageID', 'lockMessageID',
            function (err, data) {
                if (callback) callback(err, data);
                return;
            })
    };

    // /**
    //  * 移除成员 0:不存在 1:成功
    //  * @param meetingID
    //  * @param userID
    //  * @param delTime
    //  * @param callback
    //  */
    // this.delMember = function (meetingID, userID, delTime, callback) {
    //     let memberKey = 'member-' + meetingID + '-' + userID;
    //     redisClient.exists(memberKey, function (err, result) {
    //         if (err) {
    //             if (callback)
    //                 callback(err);
    //             return;
    //         }
    //         if (result == 0) {
    //             if (callback)
    //                 callback(null, 0);
    //             return;
    //         }
    //
    //         let bacth = redisClient.batch();
    //         bacth.zadd(['members-' + meetingID, -1, userID]);
    //         batch.zrem(['mymeetings-' + userID]);
    //         bacth.exec(function (err, result) {
    //             if (err) {
    //                 if (callback)
    //                     callback(err);
    //                 return;
    //             }
    //             redisClient.hset(memberKey, ['delTime', delTime], function (err, result) {
    //                 if (err) {
    //                     if (callback)
    //                         callback(err);
    //                     return;
    //                 }
    //                 callback(null, 1);
    //             })
    //         })
    //     });
    // };

    this.getSubMeetingID = function (meetingID, userID, callback) {
        redisClient.zrangebylex(['mymeetings-' + userID, '[' + meetingID, '(' + (Number(meetingID) + 1)],
            function (err, meetings) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }
                callback(null, meetings);
            });
    };

    /**
     * 获取用户参与的会战列表
     * @param userID
     * @param callback
     */
    this.getMeetingIDs = function (userID, callback) {
        redisClient.zrangebyscore('mymeetings-' + userID, 1, 1, callback);
    };

    /**
     * 获取参与的会战信息  当前版本只获取未关闭的
     * @param userID
     * @param callback 会战（房间）信息数组
     */
    this.getMeetings = function (userID, callback) {
        //获取状态正常的会战
        redisClient.zrangebyscore(['mymeetings-' + userID, 0, 1], function (err, meetings) {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }

            let meetingList = new Array(meetings.length);
            let i = 0;
            let batch = redisClient.batch();
            for (let meeting of meetings) {
                meetingList[i] = {};
                batch.hgetall('meeting-' + meeting, function (index) {
                    return function (err, data) {
                        for (let key in data)
                            meetingList[index][key] = data[key];
                    }
                }(i));

                batch.hget('member-' + meeting + '-' + userID, 'lastMessageID',
                    function (index) {
                        return function (err, data) {
                            meetingList[index]['lastMessageID'] = data;
                        }

                    }(i));

                batch.get('messageID-' + meeting, function (index) {
                    return function (err, data) {
                        meetingList[index]['newMessageID'] = data ? data : 0;
                    }
                }(i));
                ++i;
            }

            batch.exec(function (err) {
                if (err)
                    console.log(new Error(err));
                if (callback)
                    callback(err, meetingList);
            })
        });
    };

    /**
     * 获取成员列表
     * @param userID
     * @param meetingID
     * @param status 'all':全部  'online':在线  默认 'all'
     * @param callback  userID数组
     */
    let getMembers = this.getMembers = function (userID, meetingID, status, callback) {
        //判断是否该会战成员
        redisClient.exists('member-' + meetingID + '-' + userID, function (err, result) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return;
            }

            if (result != '1') {
                callback('无操作权限');
                return;
            }

            let getOptions = ['members-' + meetingID];
            if (status == null || status == 'all') {
                getOptions.push(0, 1);
            } else if (status == 'online') {
                getOptions.push(1, 1);
            } else {
                if (callback)
                    callback('invalid args');
                return;
            }

            getOptions.push('withscores');
            redisClient.zrangebyscore(getOptions, function (err, memberList) { //查询符合条件成员
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return;
                }

                let batch = redisClient.batch();
                let newMemberList = _.toArray(_.groupBy(memberList, function (first, second) {
                    return Math.floor(second / 2);
                }));

                let members = [];
                for (let member of newMemberList) {
                    //不获取请求者的信息
                    // if (member[0] == userID)continue;
                    //获取成员信息
                    batch.hgetall('user-' + member[0], function (score) {
                        return function (err, data) {
                            if (err || !data)return;
                            //1 在线  0 不在线
                            if (score == '1') {
                                //暂时不提供加入状态
                                data.status = 'online';
                                // data.status = 'join';
                            } else if (Number(data.lastLoginTime) > Number(data.lastLogoutTime)) {
                                data.status = 'online';
                            } else {
                                data.status = 'offline';
                            }
                            members.push(data);
                        }
                    }(member[1]));

                }
                batch.exec(function (err) {
                    if (callback)
                        callback(err, members);
                })
            });
        });
    }

    /**
     * anno 2016-12-2
     */
    /**
     * 得到会战房间对象列表
     */
    this.getObjectList = function (meetingId, callback) {
        let batch = redisClient.batch();
        redisClient.keys('object' + '-*-' + meetingId + '-*', function (err, keys) {
            if (err) {
                console.log(new Error(err));
                callback(err);
                return
            }
            for (var key of keys) {
                batch.hgetall(key);
            }
            batch.exec(function (err, objects) {
                if (err) {
                    console.log(new Error(err));
                    callback(err);
                    return
                }
                callback(null, objects)
            })
        })
    };


    /**
     * 获取标准对象数据
     * @param objectIDList
     * @param callback
     */
    this.getObjectData = function (objectIDList, callback) {
        let batch = redisClient.batch();
        let ret = [];
        for (let objectID of objectIDList) {
            batch.hgetall('data-' + objectID, function (id) {
                return function (err, data) {
                    ret.push({'objectID': id, 'data': data || ''});
                }
            }(objectID));
        }

        batch.exec(function (err) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            callback(null, ret);
        })
    };

    /**
     * 得到某一个类对象
     * @param type
     * @param meetingId
     * @param callback
     */
    this.getObjectByType = function (meetingId, type, callback) {
        let batch = redisClient.batch()
        redisClient.keys('object-' + type + '*-' + meetingId + '-*', function (err, keys) {
            if (err) {
                console.log(new Error(err))
                callback(err)
                return
            }
            for (let key of keys) {
                batch.hgetall(key)
            }
            batch.exec(function (err, objects) {
                if (err) {
                    console.log(new Error(err))
                    callback(err)
                    return
                }
                callback(null, objects)
            })
        })
    };


    /**
     * 插入事件
     * @param userID
     * @param meetingID
     * @param eventType
     * @param eventTime
     * @param info
     * @param callback (err,id)
     */
    var insertEvent = this.insertEvent = function (userID, meetingID, eventType, eventTime, info, callback) {
        async.waterfall([function (cb) {
            redisClient.incr('eventID', cb);
        }, function (id, cb) {
            let options = [
                ['hmset', 'event:' + id, 'eventType', eventType, 'eventID', id,
                    'eventTime', eventTime, 'info', info],
                ['zadd', 'eventList', eventTime, id],
            ];

            options.push(['zadd', 'event4User:' + userID, id, id]);
            //如果是会战中事件，为所有成员添加事件
            if (meetingID != '') {
                getMembers(userID, meetingID, 'all', function (err, members) {
                    if (err) {
                        return cb(err)
                    }
                    options.push(['zadd', 'event4Meeting:' + meetingID, id, id]);
                    options.push(['zadd', 'event4MeetingTime:' + meetingID, eventTime, id]);
                    //不包含自己
                    for (let member of members) {
                        // console.log('member', member);
                        options.push(['zadd', 'event4User:' + member.userID, id, id]);
                        options.push(['zadd', 'event4UserTime:' + member.userID, eventTime, id])
                    }
                    options.push(['zadd', 'event4User:' + userID, id, id]);
                    options.push(['zadd', 'event4UserTime:' + userID, eventTime, id]);
                    cb(null, options, id);

                })
            } else { //如果不是会战中事件，只添加相关用户
                cb(null, options, id);
            }
        }], function (err, options, id) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            redisClient.batch(options).exec(function (err) {
                if (err) {
                    console.log(new Error(err));
                    return callback(err);
                }
                return callback(null, id);
            })
        });
        // redisClient.incr('eventID', function (err, id) {
        //     if (err) {
        //         console.log(new Error(err));
        //         return callback(err);
        //     }
        //
        //
        //     let options = [
        //         ['hmset', 'event:' + id, 'eventType', eventType, 'eventID', id,
        //             'eventTime', eventTime, 'info', info],
        //         ['zadd', 'eventList', eventTime, id],
        //     ];
        //
        //
        //     redisClient.batch(options).exec(function (err) {
        //         if (err) {
        //             console.log(new Error(err));
        //             return callback(err);
        //         }
        //         return callback(null, id);
        //     })
        // });
    };

    /**
     * 获取最新事件信息
     * @param lastID  最后已获取的事件ID
     * @param callback
     */
    this.getNewEvent = function (lastID, callback) {
        redisClient.get('eventID', function (err, id) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            let batch = redisClient.batch();
            let arr = [];
            for (let i = parseInt(lastID) + 1; i <= id; ++i) {
                batch.hgetall('event:' + i, function (err, r) {
                    if (err || !r) return;
                    arr.push(r);
                });
            }

            batch.exec(function (err, r) {
                callback(err, arr)
            });
        })
    };

    /**
     * 获取用户相关的事件
     * @param lastID
     * @param userID
     * @param callback
     */
    this.getNewEventByUser = function (lastID, userID, callback) {
        redisClient.zrangebyscore('event4User:' + userID, '(' + lastID, 'inf', function (err, idList) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            let batch = redisClient.batch();
            let arr = [];
            for (let i of idList) {
                // console.log('idlist', i)
                batch.hgetall('event:' + i, function (err, r) {
                    if (err || !r) return;
                    arr.push(r);
                });
            }

            batch.exec(function (err, r) {
                callback(err, arr)
            });
        })
    };


    /**
     * 获取会战相关事件
     * @param lastID
     * @param meetingID
     * @param callback
     */
    this.getNewEventByMeeting = function (lastID, meetingID, callback) {
        redisClient.zrangebyscore('event4Meeting:' + meetingID, '(' + lastID, 'inf', function (err, idList) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            let batch = redisClient.batch();
            let arr = [];
            for (let i of idList) {
                // console.log('idlist', i);
                batch.hgetall('event:' + i, function (err, r) {
                    if (err || !r) return;
                    arr.push(r);
                });
            }

            batch.exec(function (err, r) {
                callback(err, arr)
            });
        })
    };
    /**
     * 通过时间获取事件信息
     * @param beginTime 闭区间 起始时间
     * @param endTime 闭区间 结束时间
     * @param callback
     */
    this.getEventByTime = function (beginTime, endTime, callback) {
        redisClient.zrangebyscore('eventList', beginTime, endTime, function (err, idList) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            let batch = redisClient.batch();
            for (let i in idList) {
                batch.hgetall('event:' + idList[i]);
            }

            batch.exec(callback);
        })
    }

    /**
     * 通过时间获取用户相关事件
     * @param userID
     * @param beginTime
     * @param endTime
     * @param callback
     */
    this.getEventByTimeUser = function (userID, beginTime, endTime, callback) {
        redisClient.zrangebyscore('event4UserTime:' + userID, beginTime, endTime, function (err, idList) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            let batch = redisClient.batch();
            for (let i in idList) {
                batch.hgetall('event:' + idList[i]);
            }

            batch.exec(callback);
        })
    };

    /**
     * 通过时间获取会战相关事件
     * @param meetingID
     * @param beginTime
     * @param endTime
     * @param callback
     */
    this.getEventByTimeMeeting = function (meetingID, beginTime, endTime, callback) {
        redisClient.zrangebyscore('event4MeetingTime:' + meetingID, beginTime, endTime, function (err, idList) {
            if (err) {
                console.log(new Error(err));
                return callback(err);
            }

            let batch = redisClient.batch();
            for (let i in idList) {
                batch.hgetall('event:' + idList[i]);
            }

            batch.exec(callback);
        })
    };

    this.getParamsList = function (cb) {
        redisClient.keys('parameter:*', function (err, result) {
            if (err) {
                console.log(new Error(err));
                return cb(err);
            }
            cb(null, result);
        })
    };

    this.getFiltersList = function (cb) {
        redisClient.keys('response:*', function (err, result) {
            if (err) {
                console.log(new Error(err));
                return cb(err);
            }
            cb(null, result);
        })
    };

    this.getParamsListByParam = function (params, cb) {
        let batch = redisClient.batch();
        params.forEach(function (param) {
            batch.keys('parameter:*:' + param);
        });
        batch.exec(cb);
    };

    /**
     * 获取字段名信息
     * @param keyList  字段名数组
     * @param cb(err,ret) 回调函数
     * cb - err为错误信息，
     * cb - ret为字段信息数组
     * cb - ret[].desc 字段描述
     * cb - ret[].format 字段格式类型
     * cb - ret[].keys 字段能够对应的parameter参数数组
     */
    this.getParamsInfoByKey = (keyList, cb) => {
        let batch = redisClient.batch();
        let ret = {};
        let options = [];
        for (let key of keyList) {
            batch.hmget(key, 'name', 'desc', 'format', function (err, info) {
                if (err)return err;
                ret[info[0]] = {
                    'desc': info[1],
                    'format': info[2],
                    'keys': []
                };

                batch.keys(info[2] + ':parameter:*', function (name) {
                    return function (err, keys) {
                        if (err) {
                            return err;
                        }
                        ret[name].keys = keys;
                    }
                }(info[0]))
            })
        }

        batch.exec(function (err) {
            if (err) {
                console.log(new Error(err));
                return cb(err);
            }

            batch.exec(function (err) {
                if (err) {
                    console.log(new Error(err));
                    return cb(err)
                }
                return cb(null, ret);
            })

        })
    };

    this.getParamValues = function (params, cb) {
        let batch = redisClient.batch();
        let children = [];
        params.forEach(function (param) {
            batch.hgetall(param, function (id) {
                return function (err, ret) {
                    let child = {
                        id: id,
                        info: ret,
                        children: []
                    };
                    children.push(child)
                }
            }(param));
        });

        batch.exec(function (err) {
            if (err) {
                console.log(new Error(err));
                return cb(err);
            }

            return cb(err, children);
        });
    };

    this.getApisListValues = function (params, cb) {
        let reg = /(\d+)\.(\d+)\.(\d+)\.(\d+):([\w|\/|\-|\{|\}])+:\w+/;
        let apisParam = [];
        params.children.forEach(function (param) {
            apisParam.push(reg.exec(param.id)[0]);
        });
        let batch = redisClient.batch();
        apisParam.forEach(function (api) {
            batch.keys('api:' + api);
        });
        batch.exec(function (err, apis) {
            let batch = redisClient.batch();
            let tempApis = [];
            apis.forEach(function (api) {
                api.forEach(function (subApi) {
                    if (!tempApis.includes(subApi)) {
                        tempApis.push(subApi);
                    }
                });
            });
            tempApis.forEach(function (api) {
                batch.hgetall(api, function (key) {
                    return function (err, value) {
                        let child = {
                            id: key,
                            info: value,
                            children: []
                        };
                        for (let c of params.children) {

                            if (c.id.indexOf(key.split('api')[1]) != -1) {
                                c.children.push(child);
                            }
                        }
                    }
                }(api));
            });
            batch.exec(function (err) {
                if (err) {
                    console.log(new Error);
                    return cb(err);
                }
                cb(err, params);
            })
        });
    };

    this.getResponsesValues = function (data, cb) {
        let responseKeys = [];
        let reg = /(\d+)\.(\d+)\.(\d+)\.(\d+):([\w|\/|\-|\{|\}])+:\w+/;
        data.children.forEach(function (child) {
            responseKeys.push('response:' + reg.exec(child.id)[0] + ':*');
        });
        let batch = redisClient.batch();
        responseKeys.forEach(function (key) {
            batch.keys(key);
        });
        batch.exec(function (err, keys) {
            let batch = redisClient.batch();
            let tempKeys = [];
            keys.forEach(function (key) {
                tempKeys = tempKeys.concat(key);
            });
            tempKeys.forEach(function (key) {
                batch.hgetall(key, function (id) {
                    return function (err, value) {
                        let child = {
                            id: id,
                            info: value,
                            children: []
                        };
                        for (let c of data.children) {

                            if (c.id.indexOf(reg.exec(id)[0]) != -1) {
                                c.children[0].children.push(child);
                            }
                        }
                    }
                }(key))
            });
            batch.exec(function (err) {
                if (err) {
                    console.log(new Error(err));
                    return cb(err);
                }
                cb(err, data);
            })
        });
    }


};
// let reg = /(\d+)\.(\d+)\.(\d+)\.(\d+):([\w|\/|\-])+:\w+/;
/**
 * json转换array
 */
function transdatatoList(data) {
    let arr = [];
    for (let attr in data) {
        if (!data.hasOwnProperty(attr)) continue;
        arr.push(attr);
        arr.push(data[attr]);
    }
    return arr
}

// var r = module.exports;
// var c = new r();
//
// c.getParamsInfoByKey(['hash'], console.log)
// redisClient.sort(['attachmentList-3','limit',1,3,'desc'],redis.print);
// c.getMeeting(2, 76, function (err, meeting) {
//     console.log(err, meeting)
// })
// c.getMessage(1, 0, 10, function (err, data) {
//     console.log(data);
// });
// c.insertMessage(0, 10, '', 3, '111111',4, 'haha', 5, 'xixi', '2016/10/18', redis.print);
// c.updateMembers(1, 9, 0)
// redisClient.hset('key', 'a', '1231', redis.print);
// c.updateMeetingStatus(1, 12312, '-2', function (err) {
//     console.log(err);
// });
// redisClient.zrangebyscore(['', 0, 1], redis.print);

// c.addMembers([{userID: "1", userName: "test1"}, {userID: "2", userName: "test2"}], 1, Date.now(), redis.print);
// var fs = require('fs');
// var userJson = [];
// try {
//     var str = fs.readFileSync('user.json');
//     userJson = JSON.parse(str);
// } catch (e) {
//     console.log(e)
// }
// // redisClient.zrangebyscore('members-3', 0, 1, 'withscores', redis.print);
// //
// console.log(userJson);
// c.updateUserInfo(userJson, redis.print);
// c.getUsers4Test(function (err, data) {
//     console.log(data)
// });
// var jwt = require('jsonwebtoken');
// var token = jwt.sign(
//     {
//         userName: "123123",
//         userID: 'u2'
//     }, "test"
// );
// console.log(token);
// console.log(jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IngxIiwib3JpZ19pYXQiOjE0Nzg1MTIwMTgsInVzZXJfaWQiOjM1LCJlbWFpbCI6IiIsImV4cCI6MTQ3ODc3MTIxOH0.9fQ5e23DpdLL6kpy97EISq_fJoJjnWcBoOAIEl6q97c'
// ));