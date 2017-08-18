exports.timestampToDate = function (t){
    var d=new Date(t*1000);
    d= d.toLocaleString();
    return d;
}

exports.isEmptyObject = function (obj){
    for (var n in obj) {
        return false
    }
    return true;
}

function getFileDir() {
    var basePath = require('../config').G.FILEPATH;
    var day = new Date();
    var dayStr = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
    return basePath + dayStr + '/' + day.getTime() + '/';
}

