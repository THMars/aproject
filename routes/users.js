var express = require('express');
var router = express.Router();
//var fs  = require('fs');
//var sys = require('util');
var DBhelp = require('../lib/dbhelp');
var dbAccess = new DBhelp();
//router.post('/', function(req, res, next){
//  var userJson = {};
//  try{
//    var str = fs.readFileSync('user.json','utf8');
//    userJson = JSON.parse(str);
//  }catch(e){
//    sys.debug("JSON parse fails")
//  }
//  res.json(userJson);
//});
router.post('/', function(req, res, next){
  var tableName = 'user';
  var whereJson={};
  var orderByJson  = null;
  var limitJson = null;
  var fieldsJson = {};
  dbAccess.find(tableName, whereJson, orderByJson, limitJson, fieldsJson,function(err,result){
    if (err) {
      res.json({});//err:返回空对象 数据查询失败
      return;
    }
    res.json(result);
    //res.header('Content-type','application/json');
    //res.header('Charset','utf8');
    //res.header('Access-Control-Allow-Origin','*');
    //if (err) {
    //  res.json({});//err:返回空对象 数据查询失败
    //  return;
    //}
    //res.send(JSON.stringify(result));
  });
});

module.exports = router;
