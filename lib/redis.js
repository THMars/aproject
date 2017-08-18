/**
 * Created by dingyang on 16/4/29.
 */
var redis = require('redis');
var client = redis.createClient(6379, "10.0.0.182");
// var client = redis.createClient(6379, "10.0.0.88");
client.on('error', function (err) {
    console.log(err);
})

module.exports = client;
