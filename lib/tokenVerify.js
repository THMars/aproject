/**
 * Created by dingyang on 2016/12/6.
 */
'use strict';
let request = require('request');
let fs = require('fs');
let jwt = require('jsonwebtoken');
const myConfig = require('../config/config');

class TokenVerify {
    constructor(token) {
        this.token = token;
        try {
            this.decoded_token = jwt.decode(token)
        } catch (e) {
            this.decoded_token = null;
        }
    }

    verifyMoudle(callback) {
        this.getUserInfo(function (err, info) {
            if (err) {
                return callback(err);
            }
            // for (let permission of info.moudle_perm) {
            //     if (permission.name == '协同办公') {
            //         return callback(null, info);
            //     }
            // }
            // return callback("无应用权限");
            return callback(null, info);
        })
    }

    getNewToken(callback) {
        request.post(
            {
                url: TokenVerify.registerUrl,
                headers: {
                    'Authorization': 'JWT ' + this.token
                },
                json: true,
                body: {
                    token: this.token
                }
            }, function (err, response, body) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                if (response.statusCode != 200 || body.results != 'ok' || !body.token) {
                    console.log(new Error(body));
                    return callback(response.statusCode);
                }

                callback(null, body.token);
            }
        );
    }

    appRegister(callback) {
        request.post(
            {
                url: TokenVerify.registerUrl,
                headers: {
                    'Authorization': 'JWT ' + this.token
                },
                json: true,
                body: {
                    url: '192.168.169.100:3050',
                    name: '协同会战',
                    img_b64: 'data:image/png;base64,' + new Buffer(fs.readFileSync('../public/images/icon.png')).toString('base64')
                }
            }, function (err, response, body) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                if (response.statusCode != 201) {
                    console.log(new Error(body));
                    return callback(response.statusCode);
                }

                callback(null, body);
            }
        );
    }

    getAllUser(callback) {
        request(
            {
                url: TokenVerify.userListUrl,
                headers: {
                    'Authorization': ' JWT ' + this.token
                },
            }, function (err, response, body) {
                if (err) {
                    callback({
                        message: '无法获取权限',
                        stack: err.stack
                    });
                    return;
                }

                if (response.statusCode != 200) {
                    callback({
                        message: response.statusCode + ': 无效的权限',
                        stack: body
                    });
                    return;
                }

                try {
                    body = JSON.parse(body)
                } catch (e) {
                    callback({
                        message: '无效的权限',
                        stack: body
                    });
                    return;
                }

                callback(null, body)
            })
    }

    getUserInfo(callback) {
        let decoded = this.decoded_token;
        // return callback(null, {userID: decoded.user_id, koal_cert_g: '周福生'});
        if (!decoded) {
            callback({
                message: '无效的token',
                stack: '无效的token:' + this.token
            });
            return;
        }

        let token = this.token;
        request(
            {
                url: TokenVerify.userListUrl + decoded.user_id,
                headers: {
                    'Authorization': ' JWT ' + token
                },
            }, function (err, response, body) {
                if (err) {
                    callback({
                        message: '无法获取权限',
                        stack: err.stack
                    });
                    return;
                }

                if (response.statusCode != 200) {
                    callback({
                        message: response.statusCode + ': 无效的权限',
                        stack: body
                    });
                    return;
                }

                try {
                    body = JSON.parse(body)
                } catch (e) {
                    callback({
                        message: '无效的权限',
                        stack: body
                    });
                    return;
                }

                callback(null, body)
            })
    }
}
// TokenVerify.registerUrl = 'http://61.183.159.162:8000/v1/hb/mtlp/modperms/';
TokenVerify.registerUrl = myConfig.url.registerUrl;
// TokenVerify.registerUrl = 'http://192.168.169.150:80/v1/hb/mtlp/modperms/';
// TokenVerify.newTokenUrl = 'http://192.168.169.150:80/v1/hb/tokenrefresh';
// TokenVerify.loginUrl = 'http://10.0.0.182:3000/';
TokenVerify.loginUrl = myConfig.url.loginUrl;
TokenVerify.userListUrl = myConfig.url.userListUrl;
// TokenVerify.userListUrl = 'http://61.183.159.162:8000/v1/hb/mtlp/employee/';
TokenVerify.localHost = myConfig.url.localHost;

module.exports = TokenVerify;
// // console.log(new Buffer(fs.readFileSync('../public/images/icon.png')).toString('base64'))
// let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InQxIiwib3JpZ19pYXQiOjE0ODE3MDI2MjEsInVzZXJfaWQiOjIsImVtYWlsIjoiIiwiZXhwIjoxNDgxNzg5MDIxfQ.QtxkHbGPP0kpSNvtcphze3K9GQH5Vx6wsOs2oP1G6J0';
// let t = new TokenVerify(token);
// t.appRegister(function (err, r) {
//     console.log(err, r);
//     // { id: 7,
//     //     img_b64: 'data:image/png;base64,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',
//     //     url: '10.0.0.74:3050',
//     //     name: '协同会战',
//     //     desc: null,
//     //     company: null,
//     //     createtime: '2016-12-14T10:07:55.731148Z',
//     //     status: '0' }
// })
// // t.getUserInfo(function (err, r) {
// //     console.log(r)
// // });
// t.verifyMoudle(function (err, r) {
//     console.log(err, r)
// });