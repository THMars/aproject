'use strict';
const express = require('express');
const router = express.Router();
// 获取当前会战室对象
router.post('/', function (req, res, next) {
    let meetingId = req.body.meetingId;
    redisData.getObjectList(meetingId, function (err, objects) {
        // 获取成功后
        if (err) {
            console.log(new Error(err));
            res.json({});
            return
        }
        // console.log(objects);
        res.json(objects)
    })
});

/**
 * 通过标准对象id列表获取标准对象数据
 */
router.post('/data', function (req, res, next) {
    redisData.getObjectData(req.body.objectIDList, function (err, ret) {
        if (err) {
            console.log(new Error(err));
            return res.json({});
        }

        return res.json(ret);
    })
});

router.post('/type', function (req, res, next) {
    let type = req.body.type;
    let meetingId = req.body.meetingId;
    redisData.getObjectByType(meetingId, type, function (err, objects) {
        if (err) {
            console.log(new Error(err));
            res.json({});
            return
        }
        res.json(objects)
    })
});



module.exports = router;