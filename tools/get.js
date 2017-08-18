/**
 * Created by dingyang on 2017/2/22.
 */
const myRedis = new (require("../lib/myredis"))();
const redisClient = require('redis').createClient(6379, '127.0.0.1');
const fs = require('fs');


redisClient.hget('event:828','info', function (err, result) {
    if (err) return console.log((new Error(err)));
 //   console.log(result);
    let json = JSON.parse(result);
    for(let key in json.nodes){
//        console.log(JSON.stringify(json.nodes[key]));
        if(key.indexOf('result')>=0){
            console.log(JSON.stringify(json.nodes[key]));
            let str = JSON.stringify(json.nodes[key]);
	fs.appendFile('myfile',str,null,function(){console.log('done')});
        }
    }
});

