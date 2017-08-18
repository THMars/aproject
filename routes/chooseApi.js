var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var client = require('redis').createClient(config.redis.port,config.redis.ip);
var axios = require('axios');
let apis = [];
client.keys("api:*",function(err,replies){
    replies.forEach(function(reply,i){
      client.hgetall(reply,function(err,obj){
        apis.push(obj);
      })
    })  
});
//redis 取出所有的api:*数据


let exept=["返回数据","返回数据头","返回状态码","结果信息","返回数据偏移","返回结果条数","查询结果总条数","结果数据集"];	


router.get('/',function (req,res,next) {
    res.send("chooseApi!");
})
router.get("/apicanbeuse",function(req,res,next){
	res.json(getApisConfig());
})

Array.prototype.del=function(val){
  for (var i = 0; i < this.length; i++) {
    if (this[i]==val) {
       this.splice(i,1);
    }
  }
  return this;
}
// var arr=[1,2,3,4,5];
// arr.del(2);
// console.log(arr);


//获取所有的api并以规定格式输出
function getApisConfig(){
	let a=[];
	for (var i = 0; i < apis.length; i++) {
    // a.push({id:apis[i].id,summary:apis[i].summary})
    var obj = {};
    obj.hash = apis[i].hash;
    obj.desc = apis[i].desc;
    var paramsFull = JSON.parse(apis[i].paramConfig).api.parameters;
    obj.params=[]
    for (var j = 0; j < paramsFull.length; j++) {
      obj.params.push(change(paramsFull[j].desc));
    }
    obj.res=[];
    var resFull = JSON.parse(apis[i].respConfig);
    for(var k in resFull){
      if (exept.indexOf(resFull[k].desc)==-1) {
        obj.res.push(change(resFull[k].desc));
      }
    }
    obj.params.del("time_begin");
    a.push(obj);
  }
  return a;
}


function change(str){
  switch(str){
    case "包名":
      return "package_name";
    case "packagename":
      return "package_name";
    case "开发者":
      return "developers";
    case "敏感URL":
      return "sensitive_strings_sp";
    case "敏感domain":
      return "sensitive_strings_domain";
    case "敏感IP":
      return "sensitive ip";
    case "用户认证信息":
      return "authentication"
    case "应用hash":
      return "app_hash"
    default:
    return str;
  }
}



module.exports = router;