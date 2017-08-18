/**
 * Created by dingyang on 2016/12/8.
 */
'use strict';
let request = require('request');

class Log2s {
    static log(userInfo, refer, time) {
        time = new Date(time);
        time = time.getFullYear() + '-' + time.getMonth() + '-' + time.getDate() + 'T'
            + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + 'Z';
        console.log(time);
        logRaw(Log2s.serverURL, userInfo.auth,
            {
                "operation_record": {
                    "action": '登录',
                    "target": '协同会战',
                    "resource": '协同会战'
                },
                "operation_user": userInfo.user,
                "operation_time": time,
                "operation_refer": refer,
                "operation_ipaddr": userInfo.ip
            }, function (err, body) {
                if (err || body.detail != 'ok')
                    console.log(err, body);
            })
    }
}

Log2s.serverURL = 'http://192.168.169.150:80/v1/hb/mtlp/auditlogs/';


function logRaw(url, auth, info, callback) {
    // console.log(JSON.stringify(info));
    request.post({
        url: url,
        // url: 'http://127.0.0.1:4000',
        headers: {
            'Authorization': 'JWT ' + auth,
            // 'Content-Type': 'application/json'
        },
        json: true,
        body: info
    }, function (err, res, body) {
        if (err)
            callback(err, body);
    })
}

// Log2s.log({
//     user: 't1', ip: '192.168.169.101',
//     auth: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InQxIiwib3JpZ19pYXQiOjE0ODEyNDc0OTQsInVzZXJfaWQiOjEwLCJlbWFpbCI6IiIsImV4cCI6MTQ4MTMzMzg5NH0.58J-KyHRSMae3b3kMwvYybf3XLfNZsWKlqONIK-2Gt8'
// }, '协同会战', (new Date()).toLocaleString());

module.exports = Log2s;

