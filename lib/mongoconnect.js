// 创建MongoDB连接，并保持
var MongoClient = require('mongodb').MongoClient,
    dbconfig = require('../config/dbconfig');
var db;
var self=this;
exports.connection = function (callback){
    if(!db){
        console.log('Begin connect server before execute query.');
        self.createConnection(function(err, dbObject) {
            if(err) {
                callback(err);
                //return;
            }
            else{
                callback(null, dbObject);
            }
        });
    }
    else {
        callback(null, db);
    }
};

exports.createConnection = function(callback) {
    MongoClient.connect(dbconfig.dbUrl, function(err, dbObject) {
        if (err){
            console.log('Cannot connect: ' + err);
            callback(err);
            //return;
        }
        else{
            console.log("Connected succesfully to server.DB:"+dbObject.databaseName);
            db = dbObject;

            db.on('close', function() {
                db = undefined;
                console.log('Connection was closed!!!');
            });

            callback(null,db);
        }
    });
};

exports.connection2 = function (){
    return new Promise(function (resolve, reject) {
        if (!db) {
            console.log('Begin connect server return promise.');
            self.createConnection(function (err, dbObject) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(dbObject);
                }
            });
        }
        else {
            resolve(db);
        }
    });
};
