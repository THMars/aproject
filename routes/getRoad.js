var express = require('express');
var router = express.Router();
var axios = require("axios");
var async = require("async");
var url = "http://localhost:3050/";
var mermaidData = require("../public/scripts/mermaid/mermaid_Main.js");



router.get('/',function (req,res,next) {
	var token = req.query.token;
	async.waterfall([
		function(cb){
			allApiURL = `${url}config/type?token=${token}`;
			axios.get(allApiURL,{})
			.then(function(response){
				cb(null,response.data)
			})
			.catch(function(response){
				console.log(response)
			})
		},
		function(apis,cb){
			let apiEnter = [];
			var data = apis.d;
			data.forEach(function(item,idx){
				apiConfigURL = `${url}config/api-by-param?params=${item.id}&token=${token}`;
				getApiConfig(apiConfigURL,idx,function(apiinfo,idx){
					apiEnter.push(apiinfo);
					if(idx === data.length-1){
						cb(null,apiEnter);
					}
				});
			})

		},
		function(result,cb){
			let apiCanBeUse = new Set();
			result.forEach(function(item){
				item.d[0].apiList.forEach(function(api){
					apiCanBeUse.add(api.url);
				})
			})
			apiInfo([...apiCanBeUse],url,token,function(apis){
				let deployApi = {};
				apis.forEach(function(item,idx){
                    for (var i = 0; i < item.params.length; i++) {
                        var obj={};
                        obj["hash"]=item.hash;
                        obj["res"] = item.res;
                        deployApi[item.params[i]]=[];
                        deployApi[item.params[i]].push(obj);
                    }
				})
				var apiRoad=selectApi(deployApi,apis);
				
				res.send(mermaidData.treeToListStart(apiRoad));
			})
		}
	])
	
})
function selectApi(apis,myApis){
	var road=[];
	var n = 0;
	for(var k in apis){
		var obj={};
		obj.nodeId=n;
		obj.nodeInfo={};
		obj.children=[];
		obj.nodeInfo.hash=apis[k][0].hash;
		obj.nodeInfo.param=k;
		obj.nodeInfo.res=apis[k][0].res;
		road.push(obj);
		n++;
	}

	for (var i = 0; i < road.length; i++) {
		for(var j=0;j<road[i].nodeInfo.res.length;j++){
			var res = road[i].nodeInfo.res[j];
			dg(res,road[i]);
			function dg(keyWord,node){
				if(isInObj(keyWord,apis)){
					var obj={};
					obj.nodeId = n++;
					obj.nodeInfo={};
					obj.children=[];
					obj.nodeInfo.hash=apis[keyWord][0].hash;
					obj.nodeInfo.param=keyWord;
					obj.nodeInfo.res=apis[keyWord][0].res;
					for(var i=0;i<apis[keyWord][0].res.length;i++){
						var key = apis[keyWord][0].res[i];
						dg(key,obj);
					}
					node.children.push(obj);
				}else{  
					return false;
				}
			}
		}
	}
	return road;
}

function isInObj(k,a){
	var arr=[];
	for(var key in a){
		arr.push(key);
	}
	if(arr.indexOf(k)!=-1){
		return true;
	}else{
		return false;
	}
}

function getApiConfig(url,idx,cb){
	axios.get(url,{})
		.then(function(response){
			if(response.data.d.length>0){
				cb(response.data,idx);
			}
		})
		.catch(function(response){
			console.log(response);
		})
}

function apiInfo(arr,url,token,cb) {
	chooseApiURL=`${url}chooseApi/apicanbeuse?token=${token}`;
	axios.get(chooseApiURL,{})
	.then(function(response){
		let apis = [];
		arr.forEach(function (hash,idx) {
			response.data.forEach(function (item) {
				if (item.hash == hash){
					apis.push(item);
				}
			})
		})
		cb(apis);
	})
	.catch(function(response){
		console.log(response);
	})
}





module.exports = router;