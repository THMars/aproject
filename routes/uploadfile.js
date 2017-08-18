'use strict';
var express = require('express');
var router = express.Router();
var FormidableGrid = require('formidable-grid');
var mongo = require('mongodb');
var csv = require('node-csv').createParser();
var async = require('async');
const myConfig = require('../config/config');

var db = null;
// mongo.MongoClient.connect('mongodb://10.0.0.182:27017/meeting', {native_parser: true}, function (err, dbn) {
mongo.MongoClient.connect(myConfig.url.mongoUrl, {native_parser: true}, function (err, dbn) {

    console.log("connect", myConfig.url.mongoUrl);
    db = dbn;

    // let dataTotal = '';
    // let bucket = new mongo.GridFSBucket(db);
    // bucket.openDownloadStream(mongo.ObjectId(String('5865260be8cf4d543fb25fc7')))
    //     .on('data', function (data) {
    //         dataTotal += data.toString('utf-8');
    //         // fs.writeFileSync('temp.csv', data.toString('utf-8'));
    //     })
    //     .on('end', function () {
    //         console.log(3333333)
    //         csv.parse(dataTotal, function (err, data) {
    //             console.log(1231231231, data[0], data[1], data[data.length - 1]);
    //             if (err) {
    //                 return callback(err, {err: "csv文件无法解析", message: "csv文件无法解析"});
    //             } else {
    //             }
    //         })
    //     })
});
//
// csv.parse("1,2,3\n4,5,6", function (err, data) {
//     console.log(1231231231, data[0], data[1], data[data.length - 1]);
//     if (err) {
//         // return callback(err, {err: "csv文件无法解析", message: "csv文件无法解析"});
//     } else {
//         /*data[0].map(function (item, index) {
//          if (data[0][index].toUpperCase() == 'IMEI') {
//          imeiIndex = index;
//          obj.key = "IMEI";
//          }
//          });
//          if (imeiIndex) {
//          obj.IMEI = {type:"Array"};
//          for (var i = 1, length = data.length; i < length; i++) {
//          imeiArr.push(data[i][imeiIndex]);
//          }
//          obj.IMEI.value = imeiArr;
//          //console.log("result", result);
//          return callback(null, obj);
//          } else {
//          return callback(null, null);
//          }*/
//         console.log(22222222222);
//         // return callback(null, data)
//     }
// });

router.post('/', function (req, res, next) {
    async.waterfall([function (cb) {
        redisData.getMeetingInfo(req.query.roomID, cb);

    }, function (meetingInfo, cb) {
        if (meetingInfo.status != 1) return cb({err: '上传附件失败', message: '当前房间已结束'});

        redisData.getMemberStatus(req.query.roomID, req.userInfo.userID, cb);

    }, function (result, cb) {
        // if (err) {
        //     console.log(new Error(err));
        //     return cb({err: '上传附件失败', message: '无法获取用户状态'});
        // }
        if (result == null || Number(result) < 0) {
            return cb({err: '上传附件失败', message: '当前用户无操作权限'});
        }

        if (!db) {
            console.log(new Error('上传附件失败'));
            return cb({err: '上传附件失败', message: '无法操作数据'});
        }

        var form = new FormidableGrid(db, mongo, {
            root: 'fs'
        });

        let fs = require('fs');
        form.parse(req)
            .then(function (formDatas) {
                // console.log("打印formdatas", formDatas);
                for (let formData of formDatas) {
                    if (formData.field == 'files[]') {
                        db.collection('fs.files').findOne({filename: formData.value}, function (err, doc) {
                            //console.log("打印headers", req.headers);
                            //console.log("打印doc", doc);
                            //console.log("打印formData", formData);
                            async.waterfall([function (callback) {
                                var bucket = new mongo.GridFSBucket(db);
                                var dataTotal = '';
                                /*var imeiArr = [];
                                 var imeiIndex;
                                 var obj = {};*/
                                // console.log(doc,JSON.stringify());
                                // if (formData.file_name.indexOf('csv') > -1) {
                                if (doc.contentType.indexOf('csv') > -1) {
                                    bucket.openDownloadStream(mongo.ObjectId(String(doc._id)))
                                        .on('data', function (data) {
                                            dataTotal += data.toString('utf-8');
                                        })
                                        .on('end', function () {
                                            return callback(null, dataTotal)
                                        })
                                        .on('error', function (error) {
                                            callback({err: "获取csv文件失败", message: "无法获取csv文件"})
                                        })
                                } else {
                                    return callback(null, '');
                                }
                            }, function (dataTotal, callback) {
                                if (dataTotal === '') return callback(null, '');

                                csv.parse(dataTotal, function (err, data) {
                                    let formatData = {};
                                    for (let i = 0; i < data[0].length; ++i) {
                                        data[0][i] = data[0][i].replace(' ', '');
                                        formatData[data[0][i]] = [];
                                    }

                                    for (let i = 1; i < data.length; ++i) {
                                        for (let j = 0; j < data[0].length; ++j) {
                                            formatData[data[0][j]].push(data[i][j]);
                                        }
                                    }

                                    if (err) {
                                        return callback(err, {err: "csv文件无法解析", message: "csv文件无法解析"});
                                    } else {
                                        return callback(null, formatData)
                                    }
                                });
                            }, function (data, callback) {
                                redisData.addAttachment(
                                    req.query.roomID,
                                    req.userInfo.userID,
                                    req.userInfo.userName,
                                    formData.file_name,
                                    doc._id.toString(),
                                    formData.mime_type,
                                    String(doc.length),
                                    doc.md5,
                                    JSON.stringify(data),
                                    String(doc.uploadDate.getTime()),
                                    function (err, result) {
                                        if (err) {
                                            console.log(new Error(err));
                                            return callback(err);
                                        }
                                        return callback(null, result);
                                    }
                                )
                            }], function (err, result) {
                                if (err) {
                                    console.log(new Error(err));
                                    return cb({err: '上传附件失败', message: '无法上传文件'});
                                }
                                console.log(result);
                                return cb(null, result);
                            });
                            /*                            redisData.addAttachment(
                             req.query.roomID,
                             req.userInfo.userID,
                             req.userInfo.userName,
                             formData.file_name,
                             doc._id.toString(),
                             formData.mime_type,
                             String(doc.length),
                             doc.md5,
                             String(doc.uploadDate.getTime()),
                             function (err, result) {
                             if (err) {
                             console.log(new Error(err));
                             res.json({err: '上传附件失败', message: '无法上传文件'});
                             return;
                             }
                             console.log(result, formData.file_name);
                             if(formData.file_name.indexOf('csv') > -1){
                             console.log("csv");
                             csvToJson(db, String(doc._id), result, res);
                             return;
                             }else {
                             res.json(result);
                             return;
                             }
                             }
                             )*/
                        });
                    }
                }

            })
            .catch(next);
    }], function (err, ret) {
        if (err) {
            return res.json(err);
        }

        return res.json(ret);
    });
});


module.exports = router;
