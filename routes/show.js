/**
 * Created by wxy on 2016/12/14.
 */
'use strict';
var express = require('express');
var router = express.Router();
const myConfig = require("../config/config");


/* GET home page. */
router.get('/', function (req, res, next) {
    redisData.getMeetings(req.userInfo.userID, function (err, result) {
        if (err) {
            console.log(new Error(err));
            //todo 异常返回
            res.json({err: '获取会战列表失败', message: ''});
            return;
        }
        res.render('show/show_single', {
            rooms: result
        });
    });
});

router.get('/single', function (req, res, next) {
    // res.sendfile('./views/show/show.html');
    redisData.getMeetings(req.userInfo.userID, function (err, result) {
        if (err) {
            console.log(new Error(err));
            //todo 异常返回
            res.json({err: '获取会战列表失败', message: ''});
            return;
        }
        res.render('show/show_single', {
            rooms: result
        });
    });

});

router.get('/meetings', function(req, res, next) {
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

router.post('/clear', function (req, res) {
    let redisClient = require('redis').createClient(myConfig.redis.port, myConfig.redis.ip);
    redisClient.on('connect', function () {
        redisClient.keys('event4User*', function (err, r) {
            redisClient.del(r);
            res.json(r);
        })
    });
});
module.exports = router;
