/* 对MongoDB数据库的操作 */
var co = require('co');
var dbConnect = require('./mongoconnect');
var mongodb = require('mongodb');
var myutils = require('./myutils');

module.exports = function() {
    var self = this;
    //用户参与的会战室
    this.allRoomsByUser = function(userid, callback) {
        var retArr = [];
        co(function*() {
            var db = yield dbConnect.connection2();
            var roomAttr = [];
            var docs_room = yield  db.collection('member').find({userID:userid}, {fields:{roomID:1}}).toArray();
            if (docs_room.length > 0) {
                for (var i = 0; i < docs_room.length; i++) {
                    roomAttr.push(new mongodb.ObjectID(docs_room[i].roomID));
                }
            }
            if (roomAttr.length>0){
                var docs = yield  db.collection('room').find({_id:{$in:roomAttr},endTime:{$in:[null]}},{'_id':1,'roomName':1,'parentID':1,'createUserID':1}).toArray();
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].createUserID){
                            if (docs[i].createUserID===userid) docs[i].owner=1;
                            else docs[i].owner=0;
                        }
                        else docs[i].owner=0;
                        retArr.push(docs[i]);
                    }
                }
            }
            callback(null,retArr);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };
    /*会战室管理*/
    this.disableRooms = function(id, callback) {
        co(function*() {
            var timestamp=Math.round(Date.now()/1000);
            var db = yield dbConnect.connection2();
            var col = db.collection('room');
            var mongoId = new mongodb.ObjectID(id);
            var r = yield col.updateOne({_id:mongoId},{$set:{endTime:timestamp}});
            var r = yield col.updateMany({parentID:id,endTime:{$in:[null]}},{$set:{endTime:timestamp}});
            callback(null,true);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };
    //用户参与的会战室
    this.attendRoomsByUser = function(userid, callback) {
        var retArr = [];
        co(function*() {
            var db = yield dbConnect.connection2();
            var roomAttr = [];
            var docs_attendroom = yield  db.collection('member').find({userID:userid}, {fields:{roomID:1}}).toArray();
            if (docs_attendroom.length > 0) {
                for (var i = 0; i < docs_attendroom.length; i++) {
                   roomAttr.push(new mongodb.ObjectID(docs_attendroom[i].roomID));//roomID非ObjectID字段形式产生 Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
                }
            }
            if (roomAttr.length>0){
                var docs = yield  db.collection('room').find({_id:{$in:roomAttr},endTime:{$in:[null]}},{'_id':1,'roomName':1,'parentID':1,'createUserID':1}).toArray();
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        var row = self.filterSelfRow('room', docs[i]);
                        retArr.push(row);
                    }
                }
            }
            callback(null,retArr);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };
    /*会战室成员*/
    //this.addMember = function(rowInfo, callback) {
    //    co(function*() {
    //        var db = yield dbConnect.connection2();
    //        //var r = yield db.collection('member').insertOne(rowInfo,{forceServerObjectId:true});
    //        var newitems=[];
    //        var roomids=[];
    //        newitems.push(rowInfo);
    //        roomids.push(rowInfo.roomID);
    //        var col = db.collection('room');
    //        var mongoId = new mongodb.ObjectID(rowInfo['roomID']);
    //        var doc = yield col.findOne({_id:mongoId}, {fields:{parentID:1}});
    //        if (doc.parentID){
    //            roomids.push(doc.parentID);
    //            var rowInfo_p={};
    //            for(var p in rowInfo) {
    //                rowInfo_p[p]=rowInfo[p];
    //            }
    //            rowInfo_p.roomID=doc.parentID;
    //            newitems.push(rowInfo_p);
    //            //var r = yield db.collection('member').insertOne(rowInfo);
    //        }
    //        var r = yield db.collection('member').deleteMany({userID:rowInfo.userID, roomID:{$in:roomids}});
    //        var r = yield db.collection('member').insertMany(newitems);
    //        callback(null,true);
    //    }).catch(function(err) {
    //        callback(err);
    //        //errmsg=err;
    //    }).then(function(){
    //    });
    //};
    this.addMembersToOneRoom = function(userInfo,roomid, callback) {
        co(function*() {
            var userids=[];
            var newitems=[];
            for (var i = 0; i < userInfo.length; i++) {
                userInfo[i].addTime = Math.round(Date.now()/1000);
                userInfo[i].roomID =roomid;
                userids.push( userInfo[i].userID);
                newitems.push(userInfo[i]);
            }
            var roomids=[];
            roomids.push(roomid);

            var db = yield dbConnect.connection2();
            //var r = yield db.collection('member').insertOne(rowInfo,{forceServerObjectId:true});
            var col = db.collection('room');
            var mongoId = new mongodb.ObjectID(roomid);
            var doc = yield col.findOne({_id:mongoId}, {fields:{parentID:1}});
            if (doc.parentID){
                roomids.push(doc.parentID);
                for (var i = 0; i < userInfo.length; i++) {
                    var rowInfo_p={};
                    for(var p in userInfo[i]) {
                        rowInfo_p[p]=userInfo[i][p];
                    }
                    rowInfo_p.roomID=doc.parentID;
                    newitems.push(rowInfo_p);
                }
                //var r = yield db.collection('member').insertOne(rowInfo);
            }
            //var r = yield db.collection('member').deleteMany({userID:rowInfo.userID, roomID:{$in:roomids}});
            var r = yield db.collection('member').deleteMany({userID:{$in:userids}, roomID:{$in:roomids}});
            var r = yield db.collection('member').insertMany(newitems);
            callback(null,true);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };

    this.listMemberForChoice = function(roomid, callback) {
        var retArr = [];
        co(function*() {
            var db = yield dbConnect.connection2();
            var mongoId = new mongodb.ObjectID(roomid);
            var doc = yield db.collection('room').findOne({_id:mongoId}, {fields:{parentID:1}});
            if (doc.parentID) {
                var docs = yield  db.collection('member').find({roomID: doc.parentID}).toArray();
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        retArr.push(docs[i]);
                    }
                }
            }
            else {
                var docs = yield  db.collection('user').find().toArray();
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        retArr.push(docs[i]);
                    }
                }
            }
            callback(null,retArr);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };

    this.deleteMember = function(roomid, userid, callback) {
        co(function*() {
            var db = yield dbConnect.connection2();
            var roomAttr = [];
            roomAttr.push(roomid)
            var docs_childroom = yield db.collection('room').find({parentID:roomid}, {fields:{_id:1}}).toArray();
            if (docs_childroom.length > 0) {
                for (var i = 0; i < docs_childroom.length; i++) {
                    roomAttr.push(docs_childroom[i]._id.toString());
                }
            }
            var r = yield db.collection('member').deleteMany({userID:userid, roomID:{$in:roomAttr}});
            callback(null,true);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };
//
    this.getNextMessage = function(whereJson, orderByJson, fieldsJson, size, callback) {
        var retArr = [];
        co(function*() {
            var db = yield dbConnect.connection2();
            if(whereJson['_id']){
                whereJson['_id'] =  {$lt:new mongodb.ObjectID(whereJson['_id'])};
            }
            //var docs = yield db.collection('message').find(whereJson,fieldsJson).limit(size).toArray();
            var docs = yield db.collection('message').find(whereJson).sort(orderByJson).limit(size).project(fieldsJson).toArray();
            if (docs.length > 0) {
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        var row = self.filterSelfRow('message', docs[i]);
                        retArr.push(row);
                    }
                }
            }
            callback(null,retArr);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };
    this.getPreviousMessage = function(whereJson, orderByJson, fieldsJson, size, callback) {
        var retArr = [];
        co(function*() {
            var db = yield dbConnect.connection2();
            if(whereJson['_id']){
                whereJson['_id'] =  {$gt:new mongodb.ObjectID(whereJson['_id'])};
            }
            //var docs = yield db.collection('message').find(whereJson,fieldsJson).limit(size).toArray();
            var docs = yield db.collection('message').find(whereJson).sort(orderByJson).limit(size).project(fieldsJson).toArray();
            if (docs.length > 0) {
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        var row = self.filterSelfRow('message', docs[i]);
                        retArr.push(row);
                    }
                }
            }
            callback(null,retArr);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };
    this.getRecentMessage= function(whereJson, orderByJson, fieldsJson, callback) {
        var retArr = [];
        co(function*() {
            var db = yield dbConnect.connection2();
            if(whereJson['_id']){
                whereJson['_id'] =  {$gt:new mongodb.ObjectID(whereJson['_id'])};
            }
            var docs = yield db.collection('message').find(whereJson).sort(orderByJson).project(fieldsJson).toArray();
            if (docs.length > 0) {
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        var row = self.filterSelfRow('message', docs[i]);
                        retArr.push(row);
                    }
                }
            }
            callback(null,retArr);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };

    this.find = function(tableName, whereJson, orderByJson, limitJson, fieldsJson, callback) {
        var retArr = [];
        dbConnect.connection(function (err, db) {
            db.collection(tableName, function (err, collection) {
                var cursor = collection.find(whereJson, fieldsJson);
                if (orderByJson) {
                    cursor.sort(orderByJson);
                }
                if (limitJson) {
                    var skip = limitJson['skip'] ? limitJson['skip'] : 0;
                    cursor.limit(limitJson['num']).skip(skip);
                }
                cursor.toArray(function (err, docs) {
                    if (err) {
                        callback(err);//callback(err);
                    } else {
                        if (docs) {
                            for (var i = 0; i < docs.length; i++) {
                                row = self.filterSelfRow(tableName, docs[i]);
                                retArr.push(row);
                            }
                        }
                        callback(null, retArr);
                    }
                });
                cursor.rewind();
            });
        });
    };

    this.insertOne = function(tableName, rowInfo, callback){
        co(function*() {
            var db = yield dbConnect.connection2();
            var col = db.collection(tableName);
            var r = yield col.insertOne(rowInfo);
            callback(null,r);//true
        }).catch(function(err) {
            callback(err);
        }).then(function(){
        });
    };

    this.insertMany = function(tableName, rows, callback){
        co(function*() {
            var db = yield dbConnect.connection2();
            var col = db.collection(tableName);
            var r = yield col.insertMany(rows);
            callback(null,r);//true
        }).catch(function(err) {
            callback(err);
        }).then(function(){
        });
    };

    this.deletemany = function(tableName,filter, callback) {
        co(function*() {
            var db = yield dbConnect.connection2();
            var col = db.collection(tableName);
            var r = yield col.deleteMany(filter);
            callback(null,true);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    };

    this.updateOne = function(tableName, filter, rowInfo,callback) {
        co(function*() {
            var db = yield dbConnect.connection2();
            var col = db.collection(tableName);
            if(filter['_id']){
                filter['_id'] = new mongodb.ObjectID(filter['_id']);
            }
            var r = yield col.updateOne(filter,{$set:rowInfo},{upsert:true});
            callback(null,true);
        }).catch(function(err) {
            callback(err);
            //errmsg=err;
        }).then(function(){
        });
    }


    this.filterSelfRow = function(tableName,rowInfo){
        switch (tableName) {
            case "room":
                if(rowInfo['createTime']) rowInfo['createTime'] = myutils.timestampToDate(rowInfo['createTime']);
                if(rowInfo['endTime']) rowInfo['endTime'] = myutils.timestampToDate(rowInfo['endTime']);
                break;
        }
        return rowInfo;
    };

    //this.insert = function(tableName, rowInfo, callback){
    //    dbConnect.connection(function (err, db) {
    //        db.collection(tableName, function (err, collection) {
    //            collection.insert(rowInfo, function(err, objects){
    //                if (err) {
    //                    callback(err);
    //                } else {
    //                    callback(null,objects);//insertedCount,insertedIds
    //                }
    //            });
    //        });
    //    });
    //};

    //this.update = function(tableName, id, rowInfo, callback) {
    //    dbConnect.connection(function (err, db) {
    //        db.collection(tableName, function (err, collection) {
    //            var mongoId = new mongodb.ObjectID(id);
    //            collection.update({'_id':mongoId}, rowInfo,{safe:true}, function(err){
    //                if (err) {
    //                    callback(false);
    //                } else {
    //                    callback(null,true);
    //                }
    //            });
    //        });
    //    });
    //}
}