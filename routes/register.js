/**
 * Created by dingyang on 2016/11/28.
 */
'use strict';
let router = require('express').Router();
let request = require('request');
let appClientGen = require('../lib/appClientGen');
let async = require('async');
let myConfig = require('../config/config');

const Crypto = require('../lib/myCrypto');
// let apipermsURL = 'http://192.168.169.150:80/v1/hb/mtlp/apiperms/bulk_create/';
let apipermsURL = myConfig.url.apipermsUrl;
// let systemInfoURL = 'http://192.168.169.150:80/v1/hb/mtlp/modperms';
let systemInfoURL = myConfig.url.systemInfoUrl;

router.post('/', function (req, res, next) {
    // console.log(req.body.data);
    if (!req.body.type || !(req.body.type === 'url' || req.body.type || 'api')) {
        res.json({
            "response": {
                "code": "0",
                "message": "错误的类型:type=" + req.body.type || '空'
            }
        });
        return;
    }
    let client = new appClientGen();
    async.waterfall([
        function (cb) {
            try {
                client.processRequest(req.body.data, req.body.type, function (title, callback) {
                    return getSystemInfo(title, req.token, callback);
                }, cb)
            } catch (e) {
                return cb(e);
            }
        }, function (requestID, cb) {   //获取应用系统ID
            console.log('获取应用系统ID:', requestID);
            return cb(null, 1, JSON.stringify({'detail': 'ok'}));
            request({
                url: systemInfoURL + '?name=' + encodeURI(client.getInfo().info.title),
                headers: {
                    'Authorization': ' JWT ' + req.token
                }
            }, function (err, res, body) {
                cb(err, requestID, body)
            })

        }, function (requestID, body, cb) {
            body = JSON.parse(body);
            if (body.detail !== 'ok' || body.count <= 0) {
                console.log(new Error(client.getInfo().info.title, body.detail));
                return cb('no ' + client.getInfo().info.title);
            }

            let apisInfo = [];
            for (let api in client.getInfo().default.apis) {
                if (!client.getInfo().default.apis.hasOwnProperty(api)) continue;

                let apiInfo = client.getInfo().default.apis[api];
                apisInfo.push({
                    depend_app: client.getInfo().info.systemID,
                    url: apiInfo.url,
                    desc: apiInfo.description || '未填',
                    method: apiInfo.method,
                    name: apiInfo.summary
                })

            }

            return cb(null);
            request.post({
                    url: apipermsURL,
                    headers: {
                        'Authorization': ' JWT ' + req.token
                    },
                    json: true,
                    body: apisInfo
                },
                function (err, response, body) {
                    if (err) {
                        console.log(new Error(err));
                        return;
                    }

                    if (response.statusCode !== 200) {
                        console.log(new Error(response.statusCode));
                        try {
                            console.log(new Error(JSON.stringify(body)));
                        } catch (e) {
                            console.log(new Error(e));
                        }
                        return cb('失败');
                    }
                    cb(null);
                }
            )
        }
    ], function (err) {
        if (err) {
            if (!err.stack)
                err = new Error(err);

            console.log(err);
            return res.json({
                "response": {
                    "code": "0",
                    "message": "请求审批系统失败。"
                }
            });
        }

        res.json({
            "response": {
                "code": "1",
                "message": "审批系统接受了审批。"
            }
        })
    });


});

router.get('/', function (req, res, next) {
    if (!req.query.params) {
        return res.json({
            code: '0',
            message: '无效的参数',
            detail: '无效的params:' + req.query.params || '空',
            data: []
        });
    }

    let type = req.query.type || 'url';
    let params;
    try {
        params = JSON.parse(req.query.params);
        // params = JSON.parse(Crypto.decrypto(req.query.params, req.userInfo.userID));
    } catch (e) {
        console.log(new Error(e));
        res.json({
            code: '0',
            message: '无效的参数',
            detail: '无效的params:' + req.query.params || '空',
            data: []
        });
        return;
    }

    let arr = params.filter(function (p) {
        return (p !== 'token' && p !== 'Authorization' && p !== 'queryOffset' || p !== 'queryLimit')
    });

    let client = new appClientGen();
    client.getApiInfoByParam(arr, type, function (data) {
        return Crypto.encrypto(data, req.userInfo.userID);
    }, function (err, info) {
        if (err) {
            return res.json({
                code: '0',
                message: '获取数据失败',
                detail: '失败',
                data: []
            });
        }

        //todo 系统与api权限判断

        return res.json({
            code: '1',
            message: '成功',
            detail: '成功',
            data: info
        });
    });
});

router.post('/info', function (req, res, next) {
    if (!req.body.params) {
        return res.json({
            code: '0',
            message: '无效的参数',
            detail: '无效的params:' + req.query.params || '空',
            data: []
        });
    }

    redisData.getParamsInfoByKey(req.body.params, (err, paramInfo) => {
        if (err) {
            return res.json({
                code: '0',
                message: '查询失败',
                detail: err,
                data: []
            });
        }

        return res.json({
            code: '0',
            message: '查询失败',
            detail: err,
            data: paramInfo
        });
    });
});

function getSystemInfo(title, token, callback) {
    return callback(null, {id: title});
    request({
        url: systemInfoURL + '?name=' + encodeURI(title),
        headers: {
            'Authorization': ' JWT ' + token
        }
    }, function (err, res, body) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        body = JSON.parse(body);
        if (body.detail !== 'ok' || body.count <= 0) {
            console.log(new Error(title, body.detail));
            return callback('no ' + title);
        }
        return callback(err, body.results[0]);
    })
}
module.exports = router;
