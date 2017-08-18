'use strict';
let express = require('express');
let router = express.Router();

/**
 * 获取会战列表
 */
router.post('/list', function (req, res, next) {
    redisData.getMeetings(req.userInfo.userID, function (err, result) {
        if (err) {
            console.log(new Error(err));
            //todo 异常返回
            res.json({err: '获取会战列表失败', message: ''});
            return;
        }
        res.json(result);
    });
});

router.post('/info', function (req, res, next) {
    redisData.getMeeting(req.userInfo.userID, req.roomID, function (err, result) {
        if (err) {
            console.log(new Error(err));
            return res.json({err: err, message: ''});
        }

        res.json(result);
    })
});

/**
 * 创建会战
 */
router.post('/add', function (req, res, next) {
    var memberInfo = req.body.memberInfo;
    let addTime = Date.now();
    redisData.addMeeting(req.body.parentID, req.body.roomName, req.userInfo.userID, addTime, req.body.desc,
        function (err, meeting) {
            if (err) {
                console.log(new Error(err));
                //todo 异常返回
                res.json({err: '创建会战失败', message: '无法创建会战'});
                return;
            }
            //添加创建者
            memberInfo.push(req.userInfo.userID);

            redisData.addMembers(memberInfo, meeting.meetingID, addTime, function (err, result) {
                if (err) {
                    console.log(new Error(err));
                    //todo 异常返回
                    res.json({err: '创建会战失败', message: '无法添加用户'});
                    return;
                }
                for (let member of result) {
                    if (member.userID == req.userInfo.userID)continue;
                    for (let id in io.sockets.connected) {
                        if (io.sockets.connected[id].decoded_token.userID == member.userID) {
                            io.sockets.connected[id].emit('system', {
                                type: 'addMeeting',
                                meetingInfo: meeting
                            })
                        }
                    }
                }
                let eventInfo = {
                    id: meeting.meetingID,
                    uid: meeting.createUserID,
                    uname: req.userInfo.userName,
                    name: meeting.name,
                    pid: meeting.parentID,
                    desc: meeting.desc
                };
                redisData.insertEvent(req.userInfo.userID, meeting.meetingID, 0, addTime, JSON.stringify(eventInfo), function (err) {
                    if (err) console.log(new Error(err));
                });
                res.json(meeting);
            })
        }
    )
    ;
});

/**
 *  停止会战
 */
router.post('/over', function (req, res, next) {
    let now = Date.now();
    redisData.updateMeetingStatus(req.userInfo.userID, req.body.roomID, now, 0, function (err, result) {
        if (err) {
            console.log(new Error(err));
            //todo 异常返回
            res.json({err: '停止会战失败', message: '无法停止会战'});
            return;
        }

        redisData.getMeeting(req.userInfo.userID, req.body.roomID, function (err, info) {
            if (err) {
                console.log(new Error(err));
                return;
            }

            let now = Date.now();
            let eventInfo = {
                id: info.meetingID,
                uid: req.userInfo.userID,
                uname: req.userInfo.userName,
                name: info.name,
                pid: info.parentID
            };
            redisData.insertEvent(req.userInfo.userID, req.body.roomID, 7, now, JSON.stringify(eventInfo), function (err) {
                if (err) console.log(new Error(err));
            })
        });

        res.json(result);
    })
});

/**
 * 关闭会战
 */
router.post('/disable', function (req, res, next) {
    let now = Date.now();
    redisData.updateMeetingStatus(req.userInfo.userID, req.body.roomID, now, -1, function (err, result) {
        if (err) {
            console.log(new Error(err));
            //todo 异常返回
            res.json({err: '关闭会战失败', message: '无法关闭会战'});
            return;
        }
        // io.to('/' + roomID);
        redisData.getMeetingInfo(req.body.roomID, function (err, info) {
            if (err) {
                console.log(new Error(err));
                return;
            }
            let eventInfo = {
                id: info.meetingID,
                uid: req.userInfo.userID,
                uname: req.userInfo.userName,
                name: info.name,
                pid: info.parentID
            };
            redisData.insertEvent(req.userInfo.userID, req.body.roomID, 6, now, JSON.stringify(eventInfo), function (err) {
                if (err) console.log(new Error(err));
            })
        });

        res.json(result);
    });
});

module.exports = router;
