'use strict'
var express = require('express');
var router = express.Router();
var async = require('async');

router.post('/', function (req, res, next) {
    // console.log(req.body.roomID);
    redisData.getMembers(req.userInfo.userID, req.body.roomID, 'all', function (err, members) {
        // console.log(members);
        if (err) {
            console.log(new Error(err));
            //异常返回
            res.json({});
            return;
        }
        res.json(members);
    })
});

router.post('/getNotInUsers', function (req, res, next) {
    if (!req.body.roomID || req.body.roomID <= 0) { //所有人
        redisData.getUsers4Test(null, function (err, users) {
            if (err) {
                console.log(new Error(err));
                //异常返回
                res.json({});
                return;
            }
            for (let i in users) {
                if (users[i].userID == req.userInfo.userID) {
                    users.splice(i, 1);
                    break;
                }
            }
            res.json(users);
        });
        return;
    }

    //某个房间
    redisData.getMembers(req.userInfo.userID, req.body.roomID, 'all', function (err, users) {
        if (err) {
            console.log(new Error(err));
            //todo  异常返回
            res.json({});
            return;
        }

        res.json(users);

    })

});


router.post('/add', function (req, res, next) {
    redisData.getCreator(req.body.roomID,  //获取创建者ID
        function (err, result) {
            if (err) {
                console.log(new Error(err));
                //todo 异常返回
                res.json({err: '添加成员失败', message: '获取用户操作权限失败'});
                return;
            }

            //非创建者，无操作权限
            if (result.selfID != req.userInfo.userID && result.parentID != req.userInfo.userID) {
                //todo 异常返回
                res.json({err: '添加成员失败', message: '当前用户无操作权限'});
                return;
            }

            redisData.addMembers(req.body.userInfo, req.body.roomID, Date.now(),
                function (err, members) {
                    if (err) {
                        console.log(new Error(err));
                        //todo 异常返回
                        res.json({err: '添加成员失败', message: '无法添加成员'});
                        return;
                    }

                    for (let member of members) {
                        member.status = 0;
                        //通知房间内在线用户有新用户
                        io.to('/' + req.body.roomID).emit('system', {
                            type: 'addMember',
                            meetingID: req.body.roomID,
                            member: member
                        });
                    }

                    res.json(members);
                })
        });
});


router.post('/delete', function (req, res, next) {
    async.waterfall([function (cb) {
        redisData.getCreator(req.body.roomID,  //获取创建者ID
            function (err, creator) {
                if (err) {
                    console.log(new Error(err));
                    res.json({err: '删除成员失败', message: '获取用户操作权限失败'});
                    return;
                }

                //非创建者，无操作权限
                if (creator.selfID != req.userInfo.userID && creator.parentID != req.userInfo.userID) {
                    res.json({err: '删除成员失败', message: '当前用户无操作权限'});
                    return;
                }

                if (req.userInfo.userID == req.body.userID) {
                    res.json({err: '删除成员失败', message: '无法删除自己'});
                    return;
                }

                //父节点判断
                cb(null, !creator.hasOwnProperty('parentID'));
            });
    }, function (recursively, cb) {
        redisData.delMember(req.body.roomID, req.body.userID, Date.now(), recursively, function (err, memberInfo) {
            if (err) {
                res.json({err: '删除成员失败', message: '无法删除该成员'});
                return;
            }
            cb(null, memberInfo);
        });
    }, function (memberInfo) {
        for (let subMeeting of memberInfo.meetings) {
            io.to('/' + subMeeting).emit('system', {
                type: 'deleteMember',
                meetingID: subMeeting,
                userID: req.body.userID,
                userName: memberInfo.member.userName
            });
        }
        res.json(memberInfo.member);
        return;
    }]);


});

module.exports = router;
