'use strict';
let express = require('express');

let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let cors = require('cors');//remove
let request = require('request');
// let swaggerTools = require('swagger-tools');
// var swaggerObject = require('./tools/swagger.json');
let index = require('./routes/index');
let rooms = require('./routes/rooms');
let members = require('./routes/members');
let messages = require('./routes/messages');
let attachments = require('./routes/attachments');
let uploadfile = require('./routes/uploadfile');
let register = require('./routes/register');
let standardobjects = require('./routes/objects');
let synergy = require('./routes/synergy');
let TokenVerify = require('./lib/tokenVerify');
let redirect = require('./routes/redirect');
let show = require('./routes/show');
let monitor = require('./routes/monitor');
let cust = require('./routes/customize');
let searchdemo = require('./routes/searchdemo');

let getRoad = require('./routes/getRoad');//测试
let test2 = require('./routes/test2');
let testApi = require('./routes/testApi');
let chooseApi = require('./routes/chooseApi');


const jwt = require('jsonwebtoken');
const myConfig = require('./config/config');
const proxy = require('express-http-proxy');
const url = require('url');


let app = express();


app.use(cors());//todo 针对每个接口配置
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json({limit: "5000kb"}));
app.use(bodyParser.urlencoded({extended: false, limit: '5000kb'}));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

//登录验证
app.use(loginVerify);
//
// var loginUrl = 'http://192.168.169.100:3000/';
// var returnUrl = 'http://192.168.169.100:3050/';
// var tokenVerifyUrl = 'http://192.168.169.150:80/v1/hb/tokenverify/';
// var userListUrl = 'http://61.183.159.162:8000/v1/hb/mtlp/employee/';
// let userListUrl = 'http://192.168.169.150:80/v1/hb/mtlp/employee/';
let userListUrl = myConfig.url.userListUrl;

// var loginUrl = 'http://192.168.169.168:8080/laboratory/';
let loginUrl = myConfig.url.loginUrl;
// var loginUrl = 'http://10.0.0.182:3000/';
// var returnUrl = 'http://192.168.169.100:3050/';
let returnUrl = 'http://' + myConfig.url.localHost;
// var tokenVerifyUrl = 'http://10.0.0.182:3000/v1/smcli/tokenverify/';
// var userListUrl = 'http://10.0.0.182:3000/v1/smcli/mtlp/employee/';


app.use('/', index);
app.use('/show', show);
app.use('/monitor', monitor);
app.use('/rooms', rooms);
app.use('/members', members);
app.use('/messages', messages);
app.use('/attachments', attachments);
app.use('/uploadfile', uploadfile);
app.use('/register', register);
app.use('/objects', standardobjects);
app.use('/synergy', synergy);
// app.use('/redirect', redirect);
app.use('/customize', cust);
// app.use('/config', require('./routes/config'));

app.use('/searchdemo',searchdemo);

app.use('/getroad',getRoad);
app.use('/test2',test2);
app.use('/testApi',testApi);
app.use('/chooseapi',chooseApi);
app.use('/config', proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);

app.use('/objects', proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);

app.use('/redirect', proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);
app.use('/test',proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);
app.use('/result', proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);

app.use('/callback', proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);

app.use('/event', proxy(myConfig.proxy.missionServer,
    {
        limit: '5mb',
        forwardPath: function (req) {
            return req.originalUrl;
        }
    })
);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
let lastUpdataTime = 0;
function updateUserInfo(token, time) {
    // return;
    if (time - lastUpdataTime < 3600 * 1000)return;

    lastUpdataTime = time;
    request({
        url: userListUrl,
        headers: {
            'Authorization': ' JWT ' + token
        }
    }, function (err, res, body) {
        if (err) {
            console.log(new Error(err));
            return;
        }

        if (res.statusCode != 200) {
            console.log(new Error(res.statusCode));
            return;
        }

        body = JSON.parse(body);

        if (body.detail !== 'ok') {
            console.log(new Error(body));
            return;
        }


        redisData.refreshUserInfo(body.results.map(function (user) {
            return {
                userID: user.id,
                userName: user.koal_cert_g || user.user,
                userPost: user.rank || '未知',
                userLocation: user.koal_cert_o || '未知',
                userDepartment: user.dept_name || '未知'
            }
        }), function (err) {
            if (err) {
                console.log(new Error(err));
            }
        })
    })
}


function loginVerify(req, res, next) {

    // console.log(req.path, req.ip, req.xhr);
    // let  test = jwt.verify(req.cookies.missonToken, 'test');
    // if (req.cookies.missionToken) {
    //     try {
    //         let now = Date.now();
    //         let tokenVerify = new TokenVerify(req.cookies.missionToken);
    //         console.log(1231231, req.cookies.missionToken);
    //         console.log(jwt.verify(req.cookies.missionToken, 'test'))
    //         // let {token, userInfo, exp, orig_iat} = jwt.verify(req.cookies.missonToken, 'test');
    //         let {token, userInfo, exp, orig_iat} = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VyTmFtZSI6InQxIiwidXNlcklEIjoxMCwidXNlckRlcGFydG1lbnQiOiIiLCJleHAiOjE0ODE4NTk5MzV9LCJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeWJtRnRaU0k2SW5ReElpd2liM0pwWjE5cFlYUWlPakUwT0RFM056TTFNelVzSW5WelpYSmZhV1FpT2pFd0xDSmxiV0ZwYkNJNklpSXNJbVY0Y0NJNk1UUTRNVGcxT1Rrek5YMC5LZG9pTXNOVWxyYVFVTTVxbUVfZzU3ZTNPOVhqUktBOGx3NEUzYV9QX19VIiwib3JpZ19pYXQiOjE0ODE3NzM1MzUsImV4cCI6MTQ4MTg1OTkzNSwiaWF0IjoxNDgxNzg0MjEyfQ.Kf_v_hD3rbzfk5Qeo-llLJpOkqf-4uyLJPXoyFbilZk', 'test');
    //         if (exp < now / 1000) throw 'timeout';
    //
    //         if (exp - now < now - orig_iat) { //更新token
    //             tokenVerify.getNewToken(function (err, newToken) {
    //                 if (err) return;
    //                 token = newToken;
    //                 req.token = newToken;
    //                 req.userInfo = userInfo;
    //                 let missionToken = jwt.sign(
    //                     {
    //                         userInfo: req.userInfo,
    //                         token: newToken,
    //                         orig_iat: tokenVerify.decoded_token.orig_iat,
    //                         exp: tokenVerify.decoded_token.exp
    //                     }, 'test'
    //                 );
    //                 res.cookie('missionToken', missionToken, {httpOnly: true});
    //                 updateUserInfo(token, Date.now());
    //                 return next();
    //             })
    //         } else {
    //             updateUserInfo(token, Date.now());
    //             return next()
    //         }
    //         return;
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    //准备请求用户管理系统
    let token;
    // if (req.path == '/' || req.path == '/register' || req.path == '/messages/callback') {

    try {
        token = req.query.token || req.get('Authorization').replace(/ *JWT */i, '');
    } catch (e) {
        console.log(e);
        console.log("path", req.path);
        token = null;
    }
    // console.log('Authorization:', req.get('Authorization'));
    // console.log('query', req.query);
    // } else {
    //     console.log(new Error("wrong path,redirect"));
    //     return res.redirect(loginUrl + '?returnUrl=' + returnUrl);
    // }

    if (!token) {
        console.log(new Error("no token,redirect"));
        if (req.xhr === true) {
            return res.json({err: 'redirect', message: '无效token', redirect: loginUrl + '?returnUrl=' + returnUrl});
        } else
            return res.redirect(loginUrl + '?returnUrl=' + returnUrl);
    }

    let tokenVerify = new TokenVerify(token);
    tokenVerify.verifyMoudle(function (err, result) {
        // if (err || !result) {
        if (err) {
            console.log(err, result);
            if (req.xhr === true) {
                return res.json({err: 'redirect', message: '没有权限', redirect: loginUrl + '?returnUrl=' + returnUrl});
            } else
                return res.redirect(loginUrl + '?returnUrl=' + returnUrl);
        }

        // console.log('koal', JSON.stringify(result));
        req.userInfo = {
            userName: result.koal_cert_g || tokenVerify.decoded_token.userName,
            userID: tokenVerify.decoded_token.user_id,
            userDepartment: result.dept_name || '',
            exp: tokenVerify.decoded_token.exp
        };
        updateUserInfo(token, Date.now());
        req.token = token;
        let missionToken = jwt.sign(
            {
                userInfo: req.userInfo,
                token: token,
                orig_iat: tokenVerify.decoded_token.orig_iat,
                exp: tokenVerify.decoded_token.exp
            }, 'test'
        );
        res.cookie('missionToken', missionToken, {httpOnly: true});
        return next();
    })
}

// function loginVerifyB(req, res, next) {
//     let missionToken = req.cookies.missionToken;
//     console.log(missionToken);
//     if (missionToken) { //如果有mission-token，验证
//         try {
//             let decoded = jwt.verify(missionToken, 'test');
//             //todo 判断jwt时效
//             res.cookie('missionToken', missionToken, {httpOnly: true});
//             req.userInfo = jwt.decode(missionToken);
//             next(); //验证成功
//             return;
//         } catch (err) { //mission-token验证失败
//             //pass，请求用户管理系统认证
//         }
//     }
//
//     console.log(req.path);
//     console.log('Authorization:', req.get('Authorization'));
//     console.log('query', req.query);
//     //准备请求用户管理系统
//     let token;
//     if (req.path == '/' || req.path == '/register' || req.path == '/messages/callback') {
//         try {
//             token = req.query.token || req.get('Authorization').replace(/ *JWT */i, '');
//         } catch (e) {
//         }
//     } else {
//         console.log(new Error("redirect"));
//         return res.redirect(loginUrl + '?returnUrl=' + returnUrl);
//     }
//
//     if (!token) {
//         console.log(new Error("redirect"));
//         return res.redirect(loginUrl + '?returnUrl=' + returnUrl);
//     }
//
//     console.log('get token', token);
//     //请求用户管理系统
//     request.post(
//         {
//             url: tokenVerifyUrl,
//             form: {token: token}
//         },
//         function (err, httpResponse, body) {
//             if (err) { //用户登录验证请求错误
//                 next(err);
//                 return;
//             }
//
//             console.log(body);
//             body = JSON.parse(body);
//             if (httpResponse.statusCode == 200 && body.results == 'ok') {
//                 let decoded = jwt.decode(token);
//                 console.log('tokenverify', decoded);
//                 //用户权限认证
//                 request(
//                     {
//                         url: userListUrl + decoded.user_id,
//                         headers: {
//                             'Authorization': ' JWT ' + token
//                         },
//                     }, function (err, response, body) {
//                         if (err) {
//                             next(err);
//                             return;
//                         }
//
//                         if (response.statusCode != 200) {
//                             res.render('error', {
//                                 message: body.detail,
//                                 error: {
//                                     stack: body.results,
//                                     status: response.statusCode
//                                 }
//                             });
//                             return;
//                         }
//
//                         body = JSON.parse(body);
//                         // console.log(response.statusCode, body);
//                         //todo 验证用户权限
//                         // for (let sys of body.moudle_perm) {
//                         //     if (sys.hasOwnProperty('')) {
//                         //
//                         //     }
//                         // }
//
//                         //todo 生成mission-token
//                         let myToken = jwt.sign(
//                             {
//                                 userName: body.koal_cert_g || decoded.username,
//                                 userID: decoded.user_id,
//                                 userDepartment: body.department,
//                                 exp: decoded.exp
//                             }, 'test'
//                         );
//                         console.log(666, body);
//                         //设置新mission-token ,配置
//                         res.cookie('missionToken', myToken, {httpOnly: true});
//                         res.cookie('token', token);
//                         req.userInfo = {
//                             userName: body.koal_cert_g || decoded.username,
//                             userID: decoded.user_id,
//                             userDepartment: body.department,
//                             exp: decoded.exp
//                         };
//                         updateUserInfo(token, Date.now());
//                         req.token = token;
//                         return next();
//
//
//                     })
//             } else { //用户登录验证失败
//                 console.log(err, httpResponse, body);
//                 res.render('error', {
//                     message: body.detail,
//                     error: {
//                         stack: body.results,
//                         status: httpResponse.statusCode
//                     }
//                 });
//                 return;
//             }
//         });
// }
module.exports = app;
