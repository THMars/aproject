/**
 * Created by dingyang on 2017/2/22.
 */
const myRedis = new (require("../lib/myredis"))();
const redisClient = require('redis').createClient(6379, '127.0.0.1');


redisClient.keys('meeting-*', function (err, result) {
    if (err) return console.log((new Error(err)));


    for (let meetingKey of result) {
        if (meetingKey === 'meeting-59') continue;
        console.log(meetingKey);

        myRedis.delEventByMeeting(meetingKey);


        redisClient.hgetall(meetingKey, function (err, meetingInfo) {
            if (err) return console.log(new Error(err));
            console.log(meetingInfo);
            myRedis.updateMeetingStatus(meetingInfo.createUserID, meetingInfo.meetingID, Date.now(), -1, function (err, ret) {
                if (err) return console.log(new Error(err));
                console.log(ret)
            })
        })
    }

});

