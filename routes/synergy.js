/**
 * Created by dingyang on 2016/12/8.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();


router.get('/', function (req, res, next) {
    res.render('synergy', {
        title: '协同系统',
        userInfo: JSON.stringify(req.userInfo)
    });
});

router.post('/show/new', function (req, res, next) {
    if (req.body.lastID != 0 && !req.body.lastID) {
        return res.json({
            err: '参数错误',
            message: '参数错误'
        })
    }

    redisData.getNewEventByUser(req.body.lastID, req.userInfo.userID, function (err, data) {
        if (err) {
            return res.json({
                err: '失败',
                message: err
            })
        }
        res.json(data);
    })
});

router.post('/show/range', function (req, res, next) {
    // console.log(req.body);
    if (_.isUndefined(req.body.beginTime)) {
        return res.json({
            err: '参数错误',
            message: '参数错误'
        })
    }

    redisData.getEventByTimeUser(req.userInfo.userID, req.body.beginTime, req.body.endTime || 'inf', function (err, data) {
        if (err) {
            return res.json({
                err: '失败',
                message: err
            })
        }
        res.json(data);
    })
});

router.post('/show/meeting/new', function (req, res, next) {
    if (req.body.lastID != 0 && !req.body.lastID) {
        return res.json({
            err: '参数错误',
            message: '参数错误'
        })
    }

    redisData.getNewEventByMeeting(req.body.lastID, req.body.meetingID, function (err, data) {
        if (err) {
            return res.json({
                err: '失败',
                message: err
            })
        }
        res.json(data);
    })
});


router.post('/show/meeting/range', function (req, res, next) {
    if (!req.body.beginTime || !req.body.endTime) {
        return res.json({
            err: '参数错误',
            message: '参数错误'
        })
    }

    redisData.getEventByTimeMeeting(req.body.meetingID, req.body.beginTime, req.body.endTime, function (err, data) {
        if (err) {
            return res.json({
                err: '失败',
                message: err
            })
        }
        res.json(data);
    })
});

module.exports = router;
