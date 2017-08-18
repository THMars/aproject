/**
 * Created by qiangxl on 2017/3/16.
 */

let flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {  //基本数据类型
            result[prop] = cur;
        }
        else if (Array.isArray(cur)) {  //为数组
            for(var i=0, l=cur.length; i<l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        }
        else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};

let unflatten = function(data) {
    "use strict";
    if (Object(data) !== data || Array.isArray(data))
        return data;
    let regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
        resultholder = {};
    for (let p in data) {
        let cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            // console.debug(m);
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
};



let markArr = {};  //标记颜色

//扁平化的数据转化成表格格式
function flattenJsonToSheet(flattenJson){
    let flattenJsonArr = flattenJsonToArr(flattenJson);  //将扁平的数据值转换成数组形式
    //console.log('flattenJsonArr:',flattenJsonArr);
    let color = 0;
    let resultholder = {};
    for (let p in flattenJsonArr) {
        let keyArr = p.split('.');

        let lastStr = keyArr.pop(); //每张表的key值
        let keyStr = keyArr.join('.');
        if(keyStr.length === 0) keyStr = 'data0';
        if(!resultholder.hasOwnProperty(keyStr)){ //生成表
            resultholder[keyStr] = {};
        }

        if(lastStr.indexOf(']') != -1){  //数组集
            let index1 = lastStr.indexOf('[');
            let index2 = lastStr.indexOf(']');
            let index = lastStr.substring(index1+1,index2);
            let key = lastStr.substring(0,index1);
            if(!resultholder[keyStr].hasOwnProperty(key)){
                resultholder[keyStr][key] = [];
            }
            resultholder[keyStr][key][index] = flattenJsonArr[p];
        }

    }
    //console.log('resultholder:',resultholder);
    for(let p in resultholder){
        if(p !== 'data0') { //有嵌套层

            color = Please.make_color();
            let obj = {};
            obj[p] = color;
            markArr[p] = color;
            let keyArr = p.split('.');
            let lastStr = keyArr.pop();
            // console.log('keyArr:',keyArr);
            let keyStr = keyArr.length === 0 ? 'data0' : keyArr.join('.');
            if(lastStr.indexOf(']') !== -1){  //数组集
                let index1 = lastStr.indexOf('[');
                let index2 = lastStr.indexOf(']');
                let index = lastStr.substring(index1 + 1,index2);
                let key = lastStr.substring(0,index1);

                if(!resultholder.hasOwnProperty(keyStr)) resultholder[keyStr] = {};
                if(!resultholder[keyStr].hasOwnProperty(key)){
                    resultholder[keyStr][key] = [];
                }
                resultholder[keyStr][key][index] =  "数组集"+index;
                let obj = {};
                let keyColor = keyStr + '#' + key + '#' + index;
                //obj[keyColor] = color;
                markArr[keyColor] = color;

            }
            else{ //对象集
                if(!resultholder[keyStr].hasOwnProperty(lastStr)){
                    resultholder[keyStr][lastStr] = [];
                }
                resultholder[keyStr][lastStr][0] = '对象集';
                let obj = {};
                let keyColor = keyStr + '#' + lastStr + '#' + 0;
                //obj[keyColor] = color;
                markArr[keyColor] = color;

            }
        }
    }
    markArr['data0'] = Please.make_color();
    //console.log('markColor:',Please.make_color());
    let sheetHolder = {};
    for(let k in resultholder){
        sheetHolder[k] = [];
        let rows = 0; //放数组的最大长度
        for(let v in resultholder[k]){
            if(Array.isArray(resultholder[k][v])){
                if(rows < resultholder[k][v].length) rows = resultholder[k][v].length;
            }
        }

        for(let i=0; i<rows; i++){  //创建行 i 为行数
            let obj = [];  //创建一行
            for(let j in resultholder[k]){  // j 为列数

                if(resultholder[k][j].length - 1 < i) obj[obj.length] = '';
                else obj[obj.length] = resultholder[k][j][i];

            }
            sheetHolder[k].push(obj);
        }
        sheetHolder[k].unshift(Object.keys(resultholder[k]));  //添加表头

    }
    return sheetHolder;
}

function flattenJsonToArr(flattenJson){
    let jsonArr = {};
    if(flattenJson instanceof Object){
        for(let p in flattenJson){
            let lastStr = p.split('.').pop();
            if(lastStr.indexOf(']') == -1){
                let k = p + '[0]';
                jsonArr[k] = flattenJson[p];
            }else{
                jsonArr[p] = flattenJson[p];
            }
        }
    }
    return jsonArr;
}