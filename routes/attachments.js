'use strict';
let express = require('express');
let router = express.Router();
// let gridstream = require('gridfs-stream');
// let mongoClient = require('mongodb').MongoClient;
let mongo = require("mongodb");
let assert = require("assert");
// var DBhelp = require('../lib/dbhelp');
// var dbAccess = new DBhelp();
const myConfig = require('../config/config');

router.post('/', function (req, res, next) {
    // dbAccess.find(tableName, whereJson, orderByJson, limitJson, fieldsJson,function(err,result){
    //     if (err) {
    //         res.json({});//err:返回空对象 数据查询失败
    //         return;
    //     }
    //     res.json(result);
    // });
    redisData.getAttachmentList(req.body.roomID, req.body.offset, req.body.size,
        function (err, result) {
            if (err) {
                res.json({});
                return;
            }
            res.json(result);
        });
});


router.get('/download', function (req, res, next) {
    //todo 权限验证

    redisData.getAttachment(req.query.roomID, req.query.attachmentID, function (err, attachment) {
        if (err) {
            console.log(new Error(err));
            res.render('error', {
                message: '下载失败',
                error: {
                    status: '无法获取下载文件信息',
                    stack: err
                }
            });
            return;
        }

        if (!attachment) {
            res.render('error', {
                message: '下载失败',
                error: {
                    status: '无法获取下载文件信息',
                    stack: '文件不存在'
                }
            });
        }

        // let uri = 'mongodb://127.0.0.1:27017/meeting';
        let uri = myConfig.url.mongoUrl;
        mongo.MongoClient.connect(uri, function (error, db) {
            assert.ifError(error);
            // console.log(attachment);
            res.setHeader('Content-disposition', "attachment;filename=" + encodeURIComponent(attachment.attachmentName));
            // res.setHeader('');
            var bucket = new mongo.GridFSBucket(db);
            bucket.openDownloadStream(mongo.ObjectId(attachment.attachmentPath))
                .pipe(res)
                .on('error', function (error) {
                    // assert.ifError(error);
                    res.render('error', {
                        message: '下载失败',
                        error: {
                            status: '无法下载文件',
                            stack: error
                        }
                    });
                }).on('finish', function () {
                // console.log('done!');
                return;
            });
        });
    });

});


// router.post('/add', function (req, res, next) {
//     var rowInfo = {};
//     rowInfo.roomID = req.body.roomID;
//     rowInfo.fileName = req.body.fileName;
//     //rowInfo.filePath =
//     //rowInfo.fileMD5 =
//     rowInfo.uploadUserID = req.body.uploadUserID;
//     rowInfo.uploadTime = Math.round(Date.now() / 1000);
//     redisData.addAttachment(
//         req.body.roomID,
//         req.body.uploadUserID,
//         '',
//         req.body.fileName,
//         '',
//         '',
//         0,
//         '',
//         Date.now(),
//         function (err, result) {
//             if (err) {
//                 res.json({err: err});
//                 return;
//             }
//             res.json({result: result});
//         }
//     );
// });

// router.post('/delete', function (req, res, next) {
//     var filter = {};
//     filter['_id'] = req.body.attachementID;
//     var rowInfo = {};
//     rowInfo.delTime = Math.round(Date.now() / 1000);
//     // dbAccess.updateOne('attachment',filter,rowInfo, function(err,result){
//     //     if (err) {
//     //         res.json({});
//     //         return;
//     //     }
//     //     res.json(result);
//     // });
//     res.json({});
// });

module.exports = router;
