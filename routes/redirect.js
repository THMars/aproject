/**
 * Created by dingyang on 2016/12/12.
 */
'use strict';
let router = require('express').Router();
let async = require('async');
let request = require('request');
const myConfig = require('../config/config');
const Crypto = require('../lib/myCrypto');


// const systemInfoURL = 'http://192.168.169.150:80/v1/hb/mtlp/modperms/';
const systemInfoURL = myConfig.url.systemInfoUrl;

router.get('/:id',
    function (req, res) {
        let dstInfo = null;
        let dstInfoStr = '';
        let srcInfo = {};
        let meetingID = '';
        let redirectID = null;
        redirectID = JSON.parse(req.query.redirectID);
        meetingID = redirectID.meetingID;
        async.waterfall([function (cb) {
            redisData.getMeeting(req.userInfo.userID, meetingID, function (err, result) {
                if (err || !result) {
                    return cb('获取会战信息失败');
                }

                if (parseInt(result.status) !== 1) {
                    return cb('会战已关闭');
                }

                return cb(null);
            })
        }, function (cb) { //获取发起系统的系统信息
            if (!req.query.systemID) { //发起系统为会战系统
                if (!req.query.redirectID) {
                    return cb('错误的参数');
                }
                return cb(null, null);
            }
            request({
                url: systemInfoURL + '/' + req.query.systemID + '/',
                headers: {
                    'Authorization': ' JWT ' + req.token
                }
            }, function (err, res, body) {
                if (err) return cb(err);

                body = JSON.parse(body);
                if (res.statusCode !== 200) {
                    console.log(new Error(req.query.systemID));
                    return cb('没有找到系统:' + req.query.systemID);
                }
                return cb(null, body)
            });

        }, function (sysInfo, cb) { //获取跳转相关信息
            srcInfo = sysInfo;
            let params = {};
            try {
                if (req.query.hasOwnProperty('params'))
                    params = JSON.parse(req.query.params);

                dstInfoStr = Crypto.decrypto(req.params.id, req.userInfo.userID);

                dstInfo = JSON.parse(dstInfoStr);
            } catch (e) {
                console.log(e);
                return cb(e.message);
            }

            return cb(null, params);

        }], function (err, params) {
            if (err) {
                console.log(new Error(err));
                return res.render('error', {
                    message: '跳转失败',
                    error: {
                        status: 500,
                        stack: err
                    }
                });
            }

            let eventInfo = null;
            let eventType;
            // let meetingID = '';
            // let redirectID = null;
            // let query = /\?.*/g.exec(req.url)[0];
            let query = '';
            let cryptoID = '';
            let url = dstInfo.url;
            // let params = JSON.parse(req.query.params);
            // req.query.params = JSON.parse(req.query.params);

            try {
                if (!srcInfo) { //判断发起请求的系统是会战系统

                    //替换url中path部分
                    if (params.path) {
                        for (let path in params.path) {
                            if (params.path.hasOwnProperty(path))
                                url = url.replace('{' + path + '}', params.path[path]);
                        }
                    }

                    //创建url中查询参数部分
                    if (params.query) {
                        for (let param in params.query) {
                            if (params.query.hasOwnProperty(param)) {
                                query += '&';
                                query += param + '=' + params.query[param];
                            }
                        }
                    }

                    // redirectID = JSON.parse(req.query.redirectID);
                    // meetingID = redirectID.meetingID;
                    redirectID.systemID = dstInfo.systemID;
                    redirectID.systemTitle = dstInfo.systemTitle;

                    if (dstInfo.type === 'api') {
                        delete req.query.token;
                        delete  req.query.redirectID;
                        // console.log('req.query', req.query.params, url, dstInfo.method);
                        let resultData = null;
                        async.waterfall([function (cb) {
                            if (redirectID.type === 'standardfile') {
                                redisData.getAttachment(redirectID.meetingID, redirectID.objectID.substr(redirectID.objectID.lastIndexOf('-') + 1)
                                    , function (err, attachment) {
                                        if (err) return cb(err);
                                        let attObj = JSON.parse(attachment.attachmentObj);
                                        for (let key in params.body) {
                                            if (params.body.hasOwnProperty(key))
                                                params.body[key] = attObj[key]
                                        }
                                        // console.log('attObj', params.body);
                                        cb(null)
                                    });
                            } else
                                cb(null)
                        }, function (cb) {
                            const fs = require('fs');
                            fs.readFile("tools/myfile.json", "utf8", (err, data) => {
                                if (err) return cb(err);
                                try {
                                    if (data) {
                                        data = JSON.parse(data);
                                    }
                                } catch (e) {
                                    return cb(e)
                                }

                                return cb(err, data);
                            });

                            // console.log('params', params);
                            // request({
                            //     method: dstInfo.method.toUpperCase(),
                            //     url: 'http://' + url + '?token=' + req.token + query,
                            //     headers: {
                            //         'Authorization': 'JWT ' + req.token
                            //     },
                            //     qs: {queryOffset: 0, queryLimit: 500},
                            //     json: true,
                            //     body: params.body
                            // }, function (err, response, body) {
                            //     if (err) {
                            //         console.log(err);
                            //         return cb(err);
                            //     }
                            //
                            //     if (response.statusCode !== 200) {
                            //         console.log(new Error(response.statusCode),
                            //             'http://' + url + '/?token=' + req.token + query,
                            //             body);
                            //         return cb({
                            //             message: '查询' + dstInfo.systemTitle + '无数据'
                            //         });
                            //     }
                            //     return cb(null, body);
                            // });
                        }, function (body, cb) {
                            resultData = body;
                            let sourceInfo = {
                                params: req.query.params,
                                userID: req.userInfo.userID,
                                userName: req.userInfo.userName,
                                dstSystemID: dstInfo.systemID,
                                dstSystemTitle: dstInfo.systemTitle,
                                url: url,
                                method: dstInfo.method,
                                srcSystemID: 0,
                                srcSystemTitle: '协同会战'
                            };

                            redisData.insertResultObjects(JSON.stringify(resultData), sourceInfo, cb);

                        }, function (resultObjID, cb) {
                            let objID = redirectID.objectID;
                            let appID = 'app-' + dstInfo.systemID;

                            eventType = 3;
                            eventInfo = {
                                uname: req.userInfo.userName,
                                uid: req.userInfo.userID,
                                desc: req.userInfo.userName + ' 查询了【' + dstInfo.systemTitle + '】的【' + dstInfo.apiTitle + '】',
                                nodes: {},
                                links: []
                            };
                            eventInfo.nodes[resultObjID] = {
                                nodeType: 'result',
                                label: dstInfo.systemTitle + "结果数据",
                                nodeID: resultObjID,
                                info: resultData
                            };

                            eventInfo.nodes[appID] = {
                                nodeType: 'app',
                                label: dstInfo.systemTitle,
                                nodeID: appID,
                                info: dstInfoStr
                            };

                            let tempLabel = "";
                            for (let key in params) {
                                if (!params.hasOwnProperty(key)) continue;
                                tempLabel += Object.keys(params[key]).join();
                            }

                            eventInfo.links = [{
                                from: objID,
                                to: appID,
                                label: tempLabel,
                                linkType: '',
                                info: dstInfoStr
                            }, {
                                from: appID,
                                to: resultObjID,
                                label: dstInfo.apiTitle,
                                linkType: '',
                                info: ''
                            }];

                            redisData.insertEvent(req.userInfo.userID, meetingID, eventType, Date.now(), JSON.stringify(eventInfo),
                                function (err, eventID) {
                                    if (err) {
                                        console.log(new Error(err));
                                        return cb(err);
                                    }
                                    redirectID.lastEventID = eventID;
                                    cb(null, resultObjID);
                                })
                        }], function (err, resultObjID) {
                            console.log(resultData);
                            if (err) {
                                if (dstInfo.type === 'api') {
                                    return res.json({
                                        title: dstInfo.apiTitle + '查询结果',
                                        info: JSON.stringify({
                                            meetingID: redirectID.meetingID,
                                            meetingName: redirectID.meetingName,
                                            token: req.token,
                                            sysTitle: dstInfo.systemTitle,
                                            apiTitle: dstInfo.apiTitle,
                                            redirectID: "",
                                            dataID: "",
                                            data: ""
                                        })
                                    })
                                } else {
                                    return res.render('error', {
                                        message: '查询无数据',
                                        error: {
                                            status: '',
                                            stack: err.message
                                        }
                                    });
                                }
                            }
                            cryptoID = Crypto.encrypto(JSON.stringify(redirectID), req.userInfo.userID);
                            //加密跳转标签
                            query += '&redirectID=' + cryptoID;
                            if (req.query.json) {
                                return res.json({
                                    title: dstInfo.apiTitle + '查询结果',
                                    info: JSON.stringify({
                                        meetingID: redirectID.meetingID,
                                        meetingName: redirectID.meetingName,
                                        token: req.token,
                                        sysTitle: dstInfo.systemTitle,
                                        apiTitle: dstInfo.apiTitle,
                                        redirectID: cryptoID,
                                        dataID: resultObjID,
                                        data: resultData
                                    })
                                })
                            } else {
                                return res.json({
                                    title: dstInfo.apiTitle + '查询结果',
                                    info: JSON.stringify({
                                        meetingID: redirectID.meetingID,
                                        meetingName: redirectID.meetingName,
                                        token: req.token,
                                        sysTitle: dstInfo.systemTitle,
                                        apiTitle: dstInfo.apiTitle,
                                        redirectID: cryptoID,
                                        dataID: resultObjID,
                                        data: resultData
                                    })
                                });
                                // return res.render('data_table', {
                                //     title: dstInfo.apiTitle + '查询结果',
                                //     info: JSON.stringify({
                                //         meetingID: redirectID.meetingID,
                                //         meetingName: redirectID.meetingName,
                                //         token: req.token,
                                //         sysTitle: dstInfo.systemTitle,
                                //         apiTitle: dstInfo.apiTitle,
                                //         redirectID: cryptoID,
                                //         dataID: resultObjID,
                                //         data: resultData
                                //     })
                                // })
                            }
                        });

                    }
                    else if (dstInfo.type === 'url') {
                        eventType = 4;
                        eventInfo = {
                            mid: redirectID.meetingID,
                            mname: redirectID.meetingName,
                            objid: redirectID.objectID,
                            did: dstInfo.systemID,
                            dname: dstInfo.systemTitle,
                            uid: req.userInfo.userID,
                            uname: req.userInfo.userName,
                            dapi: dstInfo.url,
                            dapiname: dstInfo.apiTitle,
                            query: req.query.params
                        };
                        redisData.insertEvent(req.userInfo.userID, meetingID, eventType, Date.now(), JSON.stringify(eventInfo),
                            function (err, id) {
                                if (err) {
                                    console.log(new Error(err));
                                    return res.render('error', {
                                        message: '跳转失败，数据录入失败',
                                        error: {
                                            status: '',
                                            stack: err
                                        }
                                    });
                                }

                                redirectID.lastEventID = id;
                                cryptoID = Crypto.encrypto(JSON.stringify(redirectID), req.userInfo.userID);
                                //加密跳转标签
                                query += '&redirectID=' + cryptoID;

                                // console.log('http', 'http://' + url + '?token=' + req.token + query);
                                return res.redirect('http://' + url + '?token=' + req.token + query);
                            });
                    } else {
                        return res.render('error', {
                            message: '跳转失败，参数错误',
                            error: {
                                status: '',
                                stack: '不支持的调用类型'
                            }
                        });
                    }

                } else {  //从应用系统发起
                    eventType = 2;
                    eventInfo = {
                        sid: srcInfo.id,
                        sname: srcInfo.name,
                        did: dstInfo.systemID,
                        dname: dstInfo.systemTitle,
                        uid: req.userInfo.userID,
                        uname: req.userInfo.userName,
                        dapi: dstInfo.apiTitle,
                        query: req.query.params
                    };

                    if (dstInfo.type === 'url') { //只支持url跳转
                        redisData.insertEvent(req.userInfo.userID, meetingID, eventType, Date.now(), JSON.stringify(eventInfo),
                            function (err) {
                                if (err) {
                                    console.log(new Error(err));
                                    return res.render('error', {
                                        message: '跳转失败，数据录入失败',
                                        error: {
                                            status: '',
                                            stack: err
                                        }
                                    });
                                }
                                // redirectID.eventID = id;
                                // cryptoID = Crypto.encrypto(JSON.stringify(redirectID), req.userInfo.userID);
                                //加密跳转标签
                                // query += '&redirectID=' + cryptoID;
                                for (let param in req.query) {
                                    if (req.query.hasOwnProperty(param) && param !== 'token') {
                                        query += '&';
                                        query += param + '=' + req.query[param];
                                    }
                                }
                                // console.log('http', 'http://' + url + '?token=' + req.token + query);
                                return res.redirect('http://' + url + '?token=' + req.token + query);
                            });
                    } else {
                        return res.render('error', {
                            message: '跳转失败，参数错误',
                            error: {
                                status: '',
                                stack: '不支持直接调用其他系统API'
                            }
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                return res.render('error', {
                    message: '跳转失败，参数错误',
                    error: {
                        status: '',
                        stack: e.message
                    }
                });
            }


        });

    }
);


module.exports = router;