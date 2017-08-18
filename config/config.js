/**
 * Created by dingyang on 2017/1/3.
 */

module.exports = {
    /**
     *  registerUrl: 系统注册
     *  userListUrl：用户列表
     *  localHost：本服务
     *  loginUrl: 平台主页
     *  redirectURL: 跳转
     *  systemInfoURL: 获取系统信息
     *  mongoUrl: mongo
     *  apipermsUrl:接口注册
     *  systemInfoUrl
     */
    // url: {
    //     registerUrl: 'http://192.168.169.150:80/v1/hb/mtlp/modperms/',
    //     userListUrl: 'http://192.168.169.150:80/v1/hb/mtlp/employee/',
    //     localHost: '192.168.169.100:3050',
    //     loginUrl: 'http://192.168.169.168:8080/laboratory/',
    //     redirectUrl: '192.168.169.101:3050/redirect/',
    //     mongoUrl: 'mongodb://127.0.0.1:27017/meeting',
    //     apipermsUrl: 'http://192.168.169.150:80/v1/hb/mtlp/apiperms/bulk_create/',
    //     systemInfoUrl: 'http://192.168.169.150:80/v1/hb/mtlp/modperms'
    // },
    url: {
        registerUrl: 'http://10.0.0.182:3000/v1/hb/mtlp/modperms/',
        userListUrl: 'http://10.0.0.182:3000/v1/hb/mtlp/employee/',
        // localHost: '10.0.0.74:3050',
        localHost: '127.0.0.1:3050',
        loginUrl: 'http://10.0.0.182:3000/',
        // redirectUrl: '10.0.0.74:3050/redirect/',
        redirectUrl: '10.0.0.182:3050/redirect/',
        mongoUrl: 'mongodb://10.0.0.182:27017/meeting',
        //mongoUrl: 'mongodb://10.0.0.74:27017/meeting',
        apipermsUrl: 'http://192.168.169.150:80/v1/hb/mtlp/apiperms/bulk_create/',
        systemInfoUrl: 'http://192.168.169.150:80/v1/hb/mtlp/modperms',

    },
    redis: {

        ip: "10.0.0.182",
        // ip: "127.0.0.1",
        port: 6379
    },
    proxy: {
        missionServer: "127.0.0.1:10010"
    }
};
