/**
 * Created by dingyang on 2016/11/30.
 */
'use strict';
let swagger = require('swagger-client');
let async = require('async');
const myConfig = require('../config/config');
const crypto = require('crypto');
// let redisClient = require('redis').createClient(6379, '127.0.0.1');
let redisClient = require('redis').createClient(myConfig.redis.port, myConfig.redis.ip);

// var redirectURL = '192.168.169.101:3050/redirect/';
// var redirectURL = '127.0.0.1:3050/redirect/';
let redirectURL = myConfig.url.redirectUrl;

module.exports = function () {
    let client;
    this.getInfo = function () {
        return client;
    };


    /**
     *
     * @param data
     * @param type
     * @param getSystemInfo
     * @param callbcak
     */
    this.processRequest = function (data, type, getSystemInfo, callbcak) {
        let requestID = null;
        let systemID = null;
        async.waterfall([function (cb) {  //新建请求
            redisClient.incr('requestID', cb);

        }, function (requestid, cb) {   //创建请求客户端
            requestID = requestid;
            try {
                let tempData = JSON.parse(data);
                createAppClient(tempData, function (err, c) {
                    cb(err, c);
                })
            } catch (e) {
                console.log('data', data);
                console.error(e);

                return cb(e);
            }

        }, function (c, cb) { //通过系统标题信息获取系统ID
            client = c;
            if (!client.info) return cb('解析失败');
            getSystemInfo(client.info.title, cb);

        }, function (systeminfo, cb) { //创建请求信息
            client.info.systemID = systemID = systeminfo.id;
            redisClient.hmset('request:' + requestID, ['systemID', systemID || '',
                'title', client.info.title,
                'addTime', String(Date.now()),
                'status', '0',
                'type', type || 'api',
                'raw', data
            ], cb);

        }, function (r, cb) {  // 处理请求客户端
            try {
                processClient(requestID, systemID, client, type, cb)
            } catch (e) {
                console.error(e);
                cb(e);
            }

        }], function (err) {
            if (err) {
                if (!err.stack)
                    err = new Error(err);
                console.error(err);
                callbcak(err);
                return;
            }
            callbcak(null, requestID)
        });
    };


    this.getApiInfoByParam = function (params, type, crypt, callback) {
        // console.log('params:', params);
        if (params.length <= 0) {
            callback(null, []);
            return;
        }

        let sys = {};
        let tempArr = {};
        let batch = redisClient.batch();

        async.waterfall([function (cb) {
                let apiFlags = [];
                for (let param of params) {
                    batch.keys('parameter:*:' + param, function (name) {
                        return function (err, result) {
                            if (err) {
                                console.error(new Error(err));
                                return
                            }
                            for (let key of result) {
                                let reg = new RegExp("parameter:(.*):" + name);
                                let apiFlag = reg.exec(key);
                                if (!apiFlag)return;
                                apiFlag = apiFlag[1];
                                if (!tempArr[apiFlag]) {
                                    tempArr[apiFlag] = [];
                                    apiFlags.push(apiFlag);
                                }
                            }
                        }
                    }(param))
                }
                batch.exec(function (err) {
                    cb(err, apiFlags);
                });

            }, function (apiFlags, cb) {
                // console.log('apiFlags:', apiFlags);
                let paramKeys = [];
                for (let apiFlag of apiFlags) {
                    batch.keys('parameter:' + apiFlag + ':*', function (err, Keys) {
                        if (err) {
                            console.error(new Error(err));
                            return;
                        }
                        paramKeys = paramKeys.concat(Keys);
                        // console.log(paramKeys);
                    });

                    let apiKey = 'api:' + apiFlag;
                    batch.hgetall(apiKey, function (err, apiInfo) {
                        if (err) {
                            console.error(new Error(err));
                            return;
                        }

                        if (!apiInfo) return;

                        if (type !== "all" && type !== apiInfo['type']) return;

                        if (!sys[apiInfo.sysTitle]) {
                            sys[apiInfo.sysTitle] = {
                                sysID: apiInfo.systemID,
                                sysTitle: apiInfo.sysTitle,
                                sysVersion: apiInfo.sysVersion,
                                sysDesc: apiInfo.sysDesc,
                                apiList: []
                            }
                        }

                        //加密url
                        let url = redirectURL + crypt(JSON.stringify({
                                url: apiInfo.url,
                                params: params,
                                systemID: apiInfo.systemID,
                                systemTitle: apiInfo.sysTitle,
                                apiTitle: apiInfo.summary,
                                type: apiInfo.type,
                                method: apiInfo.method
                            }));

                        let api = {
                            desc: apiInfo.desc,
                            summary: apiInfo.summary,
                            key: apiInfo.url,
                            url: url,
                            type: apiInfo.type,
                            method: apiInfo.method,
                            parameters: []
                        };

                        sys[apiInfo.sysTitle].apiList.push(api);
                    });
                }
                batch.exec(function (err) {
                    cb(err, paramKeys);
                });

            }, function (paramKeys, cb) {
                for (let paramKey of paramKeys) {
                    batch.hgetall(paramKey, function (err, paramInfo) {
                        if (err) {
                            console.error(new Error(err));
                            return;
                        }
                        // console.log(paramInfo);
                        // console.log(paramInfo.url + ':' + paramInfo.method);
                        //默认token不展示
                        if (paramInfo.name === 'token' || paramInfo.name === 'Authorization') return;

                        let key = paramInfo.url + ':' + paramInfo.method;

                        // console.log(paramInfo.url);
                        // delete paramInfo.url;
                        // delete paramInfo.method;
                        tempArr[key].push(paramInfo);
                    });
                }
                batch.exec(cb);

            }], function (err) {
                if (err) {
                    console.error(new Error(err));
                    callback(err);
                    return;
                }

                let result = [];
                for (let s in sys) {
                    for (let api of sys[s].apiList) {
                        api.parameters = tempArr[api.key + ':' + api.method];
                        for (let param of api.parameters) {
                            param.url = api.url;
                        }
                        delete api.key;
                    }
                    result.push(sys[s])
                }

                callback(null, result);
            }
        );
    };

    function createAppClient(spec, callback) {
        try {
            client = new swagger({
                spec: spec,
                success: function () {
                    callback(null, client);
                }
            })
        } catch (err) {
            callback(err);
        }
    }

    /**
     *
     * @param requestID
     * @param systemID
     * @param client
     * @param type
     * @param callback
     */
    function processClient(requestID, systemID, client, type, callback) {
        let info = client.info;
        let findOld = [];
        let newData = [];
        let delKeys = [];
        async.waterfall([function (cb) {
            for (let i in client.default.apis) {
                if (!client.default.apis.hasOwnProperty(i)) continue;

                let api = client.default.apis[i];
                let url = api.host + api.basePath + api.path;
                client.default.apis[i].url = url;
                let method = api.method;
                let summary = api.summary;
                let description = api.description;
                let apiKey = url + ':' + method + ':' + requestID;
                let apikeyHash = crypto.createHash('sha1').update('api:' + apiKey).digest('hex');
                let tokenPath = 'header';
                let paramConfig = {
                    sysID: systemID || '',
                    sysVersion: info.version || '',
                    sysTitle: info.title || '',
                    sysDesc: info.description || '',
                    api: {
                        type: type || 'api',
                        method: method,
                        url: apikeyHash,
                        desc: description || '',
                        summary: summary || '',
                        parameters: []
                    }
                };
                let respConfig = {};

                //查询旧的同名API配置
                // findOld.push(['keys', '*:' + apiKey + '*']); //api,parameter,response,format

                //删除旧的输入参数formatMap配置
                findOld.push(['keys', 'formatApi:*:' + url + ':' + method + ':*']);

                //解析新请求的API
                if (!processApi(api, function (err, paramType, param, field) {
                        if (err) {
                            console.error(err);
                            return false;
                        }

                        if (!field.hasOwnProperty('format') || !field.format) {
                            field.format = 'OTHER';
                        } else {
                            field.format = field.format.toUpperCase();
                        }

                        if (!field.hasOwnProperty('name') || !field.name) {
                            console.error('无效的字段名:', field);
                            return false;
                        }

                        if (!field.hasOwnProperty('description') || !field.description) {
                            console.error('无效的描述:', field);
                            return false;
                        }


                        let fieldKey = paramType + ':' + apiKey + ':' + field.path + field.name;
                        let fieldHash = crypto.createHash('sha1').update(fieldKey).digest('hex');
                        if (field.name === 'Authorization' || field.name === 'token') tokenPath = field.in;
                        if (paramType === 'parameter'
                            && field.format !== 'OBJECT' && field.format !== 'ARRAY'
                            && field.name !== 'Authorization'
                            && field.name !== 'token'
                            && field.name !== 'queryOffset'
                            && field.name !== 'queryLimit') {  //默认参数不展示
                            paramConfig.api.parameters.push({
                                isArray: field.name === 'items',
                                desc: field.description,
                                id: fieldHash,
                                type: field.type,
                                format: field.format,
                                required: param.required || 'false',
                                params: []
                            });
                            if (field.format !== 'OTHER' && field.format !== 'TIME')
                                newData.push(['set', 'formatApi:' + field.format + ':' + apiKey + ':' + apikeyHash, apikeyHash])
                        } else if (paramType === 'response') {
                            respConfig[fieldHash] = {
                                desc: field.description
                            };
                            newData.push(['set', 'sourceField:' + fieldHash, field.format]);
                        }
                        //API参数配置
                        // newData.push(['hmset', fieldKey + ":" + fieldHash, 'in', param.in || '',
                        newData.push(['hset', 'fieldDesc', fieldHash, field.description]);
                        newData.push(['hmset', paramType + ':' + fieldHash, 'in', param.in || '',
                            'name', field.name || '',
                            'required', param.required || 'false',
                            'url', url || '',
                            'method', api.method || '',
                            'type', field.type,
                            'path', field.path,
                            'id', fieldKey,
                            'hash', fieldHash,
                            'desc', field.description || '',
                            'format', field.format || '']);
                        newData.push(['set', 'fieldHash:' + fieldKey, fieldHash]);
                        newData.push(['hset', 'formatField', fieldHash, field.format]);
                        //生成format和key的对应关系
                        // newData.push(['set', 'formatMap:' + field.format + ':' + fieldKey + ":" + fieldHash, fieldKey]);
                        return true;
                    })) {
                    return cb('解析API失败:', apiKey);
                }

                //生成API新配置
                newData.push(['zadd', 'requestApi:' + requestID, 0, apiKey + ':' + apikeyHash]);
                // newData.push(['hmset', 'api:' + apiKey + ":" + apikeyHash,
                newData.push(['hmset', 'api:' + apikeyHash,
                    'paramConfig', JSON.stringify(paramConfig),
                    'respConfig', JSON.stringify(respConfig),
                    'type', type || 'api',
                    'systemID', systemID || '',
                    'requestID', requestID,
                    'index', i,
                    'tokenPath', tokenPath,
                    'path', api.path,
                    'basePath', api.basePath,
                    'nickname', api.nickname,
                    'method', method,
                    'id', 'api:' + apiKey,
                    'hash', apikeyHash,
                    'url', url,
                    'desc', description || '',
                    'summary', summary || '',
                    'sysVersion', info.version || '',
                    'sysTitle', info.title || '',
                    'sysDesc', info.description || '',
                    'sysContactName', info.contact.name || '',
                    'sysContactEmail', info.contact.email || '']);
            }

            //删除旧的同名api配置
            redisClient.batch(findOld).exec(function (err, oldKeys) {
                if (err) {
                    console.error(new Error(err));
                    return cb(err);
                }

                for (let keys of oldKeys) {
                    keys.forEach(function (k) {
                        delKeys.push(k);
                    })
                }

                if (delKeys.length > 0)
                    return redisClient.del(delKeys, (err) => {
                        return cb(err);
                    });

                return cb(null);
            })

        }, function (cb) {
            //插入API新配置
            redisClient.batch(newData).exec(cb);
        }], function (err) {
            if (err) {
                console.error(new Error(err));
                //错误状态更新
                redisClient.batch([
                    ['zadd', 'requestStatus', -1, requestID],
                    ['hmset', 'request:' + requestID, 'status', -1, 'err', err],
                ]).exec(function (e) {
                    if (e) {
                        console.error(new Error(e));
                    }
                    return callback(err);
                });
                return;
            }

            redisClient.batch([
                ['zadd', 'requestStatus', 1, requestID],
                ['hset', 'request:' + requestID, 'status', 1],
            ]).exec((err) => {
                callback(err, requestID);
            })

        });

    }

    function processApi(api, callback) {
        for (let parameter of api.parameters) {
            if (!processField(parameter, function (param) {
                    return function (err, field) {
                        if (err) {
                            console.error(new Error(err));
                            callback(err);
                            return false;
                        }
                        return callback(null, 'parameter', param, field);
                    }
                }(parameter))) {
                return false;
            }
        }

        if (!api.successResponse || !api.successResponse['200']) return true;
        api.successResponse['200'].name = '200';
        return processField(api.successResponse['200'], function (err, field) {
            if (err) {
                console.error(new Error(err));
                callback(err);
                return false;
            }
            callback(null, 'response', api.successResponse['200'], field);
            return true;
        })
    }

    function processField(field, updateField) {
        if (!field.hasOwnProperty('path')) field.path = '';
        if (field.type === 'array') {
            if (!field.hasOwnProperty('name') || !field.name) {
                updateField("无效的数组格式:" + JSON.stringify(Object.assign({}, field)));
                return false;
            }

            field.format = "ARRAY";
            updateField(null, field);

            field.items.path = field.path + field.name + '.';
            field.items.name = 'items';

            if (!field.items.hasOwnProperty('description'))
                field.items.description = field.description;

            // field.items.type = 'item';
            return processField(field.items, updateField);

        } else if (field.type === 'object') {
            field.format = "OBJECT";
            updateField(null, field);

            for (let p in field.properties) {
                if (!field.properties.hasOwnProperty(p)) continue;

                field.properties[p].name = p;
                field.properties[p].path = field.path + field.name;
                if (field.properties[p].path.length > 0) field.properties[p].path += '.';
                if (!processField(field.properties[p], updateField))
                    return false;
            }

        } else if (field.type) {
            return updateField(null, field);
        } else if (field.definition) {
            field.definition.name = field.name;
            if (!field.definition.hasOwnProperty('description'))
                field.definition.description = field.description;
            return processField(field.definition, updateField);

        } else if (field.schema) {
            field.schema.name = field.name;
            if (!field.schema.hasOwnProperty('description'))
                field.schema.description = field.description;
            return processField(field.schema, updateField);

        } else if (field['$ref']) {
            let ref = getRef(field.$ref);
            if (ref && client.models.hasOwnProperty(ref)) {
                client.models[ref].name = field.name;
                client.models[ref].path = field.path;
                if (!client.models[ref].hasOwnProperty('description'))
                    client.models[ref].description = field.description;
                return processField(client.models[ref], updateField);
            } else {
                updateField('无效的ref:' + JSON.stringify($ref));
                return false;
            }

        } else if (field.models) {

        } else {
            let err = new Error(JSON.stringify(Object.assign({}, field)));
            console.error(err);
            // cb(err);
        }
        return true;
    }

    function getRef(name) {
        if (typeof name === 'undefined') {
            return null;
        }

        if (name.indexOf('#/definitions/') === 0) {
            return name.substring('#/definitions/'.length);
        } else {
            return name;
        }
    }

};
// let json = require('../tools/swagger.json');
// let client = new swagger({
//     spec: json,
//     success: function () {
//         // console.log(client);
//         client.config.getConfigAll({
//             Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VyTmFtZSI6ImFkbWluIiwiZGVwdF9uYW1lIjoiZGVwMSIsImV4cCI6MTQ5MTg4ODM5MTYyNiwiaWF0IjoxNDkxODg0NzkxfQ.hEh4jNO9x8MHDo-CRWdfo8B5uMDFUVsTm7j9oPWLOlQ",
//         },function (data) {
//             // console.log(data.obj);
//         })
//         client.config.getConfigAll.help();
//         client.object.getObjectsDetail.help();
//         client.object.getObjectsInfo.help();
//     }
// });


// var fs = require('fs');
// var p = new module.exports();
// var test = p.createAppClient(JSON.parse(fs.readFileSync("../test.json", 'UTF-8')), function (err, client) {
//     console.log(client.default.apis.post_testapi);
//     p.processClient(client, function (err) {
//         console.log(err)
//     })
// });

