'use strict'
const express = require('express'),
    router = express.Router(),
    async = require('async'),
    redisData = new (require('../lib/myredis'));

router.post('/', function (req, res) {
    let info = req.body.info,
        eventType = 8,
        redirectID = req.body.redirectID,
        meetingID = redirectID.meetingID,
        systemTitle = req.body.systemTitle,
        params = req.body.params,
        objectID = req.body.objectID;

    let resultObject = redirectID.objectID;

    async.waterfall([
        function (cb) {
            let appID = `app-custom-${ systemTitle }`;
            let eventInfo = {
                uname: req.userInfo.userName,
                uid: req.userInfo.userID,
                desc: `${ req.userInfo.userName } 创建【 人工业务分析 】`,
                nodes: {},
                links: []
            };

            eventInfo.nodes[resultObject] = {
                nodeType: 'custom',
                label: '人工业务分析结果',
                nodeID: resultObject,
                info: info
            };

            eventInfo.nodes[appID] = {
                nodeType: 'customapp',
                label: systemTitle,
                nodeID: appID,
                info: JSON.stringify({
                    systemTitle: "人工业务分析",
                    apiTitle: systemTitle,
                    type: "customapp"
                })
            };


            let tempLabel = "";
            tempLabel += Object.keys(params).join();

            eventInfo.links = [
                {
                    from: objectID,
                    to: appID,
                    label: tempLabel,
                    linkType: '',
                    info: '',
                }, {
                    from: appID,
                    to: resultObject,
                    label: '返回',
                    linkType: '',
                    info: ''
                }
            ];
            redisData.insertEvent(req.userInfo.userID, meetingID, eventType, Date.now(), JSON.stringify(eventInfo),
                function (err, eventID) {
                    if (err) {
                        console.log(new Error(err));
                        return cb(err);
                    }
                    redirectID.lastEventID = eventID;
                    cb(null, resultObject);
                });
        },
    ], function (err, resultObjID) {
        if (err) {
            return res.json({
                message: '人工业务分析数据失败',
                error: {
                    status: '',
                    stack: err.message
                }
            });
        }
        return res.json({
            title: '人工业务分析结果',
            info: {
                meetingID: meetingID,
                meetingName: meetingID,
                token: req.query.token,
                sysTitle: systemTitle,
                apiTitle: '人工业务分析',
                dataID: resultObjID,
                data: info
            }
        });
    });


});

module.exports = router;
