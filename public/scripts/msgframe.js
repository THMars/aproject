/**
 * Created by wxy on 2016/10/5.
 */
var count = 0,
    sortFlag = false,
    missionRoomRightClick = {},
    currentRightSelectedStandardObj,
    $parentId,
    aid,
    $userID;
missionRoomRightClick.rightClickApiMap = new Map();
missionRoomRightClick.rightClickBallData = new Map();
missionRoomRightClick.selectDataMap = new Map();


function getMessageComplete() {
    mission.scrollFlag = true;
}
//utc时间戳转换为北京时间
function getLocalTime(nS) {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
}
// 刷新消息
function addScrollTopNewmsg(data) {
    var $meet = data[0].meetingID.length + 1;
    console.log(data);
    for (var j = data.length - 1; j >= 0; j--) {
        if (data[j].messageID - $("#add-element").children()[0].id.slice($meet) < 0) {
            break;
        } else {
            data.splice(j, 1);
        }
    }
    console.log(data);
    var message = data;
    var current = $(".scroll>ul").height();    //获取当前位置
    data.reverse();  //数组倒序
    for (var i = 0; i < data.length; i++) {
        if (data[i].sendUserID == mission.userID && data[i].sendUserID != "system") {
            AddSingleMessage(message[i], true, false);
        } else if (data[i].sendUserID != mission.userID && data[i].sendUserID != "system") {
            AddSingleMessage(message[i], false, false);
        }
    }
    msgWidth();
    if (data.length > 0) {
        $(".scroll").scrollTop($(".scroll>ul").height() - current);
    }
}
//向下滚动获取数据
function addScrollBottomNewmsg(data) {
    let $addElement = $('#add-element');
    if ($addElement.children().length > 0) {
        var $meet = data[0].meetingID.length + 1;
        for (var j = data.length - 1; j >= 0; j--) {
            if (data[j].messageID - $addElement.children()[$addElement.children().length - 1].id.slice($meet) > 0) {
                break;
            } else {
                data.splice(j, 1);
            }
        }
        var message = data;
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].sendUserID == mission.userID && data[i].sendUserID != "system") {
                    AddSingleMessage(message[i], true, true);
                } else if (data[i].sendUserID != mission.userID && data[i].sendUserID != "system") {
                    AddSingleMessage(message[i], false, true);
                }
            }
        }
        msgWidth();
    }
}
//发送消息  获取数据

function addmsg(message) {
    let $id,
        $back = $('.back'),
        $mainContainer = $('#main-container'),
        $addEl = $('#add-element'),
        $scroll = $('.scroll');
    let $ul = $addEl.children().length;
    $mainContainer.find("div").each(function () { //判断是不是选中的
        if ($(this).attr("select") == "y") {
            $id = $(this).attr("data-role");
        }
    }).end().find("li").each(function () {
        if ($(this).attr("select") == "y") {
            $id = $(this).attr("data-role");
        }
    });
    if (message[0].meetingID == $id) {
        //判断消息框是否有消息
        if ($ul > 0) {
            // var $li = $("#add-element li").eq($ul - 1).attr("data");
            if (message[message.length - 1].messageID > mission.msgEndID) {
                mission.msgEndID = message[message.length - 1].messageID;
                //判断当前位置
                if (($addEl.height() - $scroll.scrollTop() - $scroll.height()) < 250) {
                    addlist(message);
                    //设置msg的最大宽度
                    msgWidth();
                    //滚动条在最下方
                    $scroll.scrollTop($scroll[0].scrollHeight);
                }
                else {
                    //当前位置不在最下方
                    $back.show();
                    count++;
                    console.log(count);
                    if (count > 0) {
                        if (count > 99) {
                            $back.css({"background": "#007ACC"}).text("99+");
                        } else {
                            $back.css({"background": "#007ACC"}).text(count);
                        }
                    }
                }
            }
        } else {
            addlist(message);
            //设置msg的最大宽度
            msgWidth();
            //滚动条在最下方
            $scroll.scrollTop($scroll[0].scrollHeight);
        }
        if ($addEl.children().length > 200) {
            var lt = $addEl.children().length - 200;
            $('.scroll>ul>li:lt(' + lt + ')').remove();
        }
    } else {
        mission.msgEndID = message[message.length - 1].messageID;
        if (message[0].meetingID.indexOf("-") > 0) {
            $("#meetingTree" + message[0].meetingID).parent().parent().prev().find(".tree-meet").addClass("tree-meet-flash");
        }
        $("#meetingTree" + message[0].meetingID).attr("data-nid", mission.msgEndID);
        countUnread();
        //新消息自动排序
        if (sortFlag) {
            let meetingId;
            if (message[0].meetingID.indexOf('-') != -1) {
                meetingId = message[0].meetingID.substring(0, message[0].meetingID.indexOf('-'));
            } else {
                meetingId = message[0].meetingID;
            }
            $mainContainer.find('div').each(function () {
                if ($(this).attr('data-role') == meetingId) {
                    if ($mainContainer.find('#pinned').length == 0) {
                        $mainContainer.prepend($(this).next());
                        $mainContainer.prepend($(this));
                    } else {
                        $(this).next().insertAfter('#pinned');
                        $(this).insertAfter('#pinned');
                    }
                }
            });
        }
    }
}
//添加list
function addlist(message) {
    if (message) {
        if ($("#add-element").children().length > 0) {
            for (var j = message.length - 1; j >= 0; j--) {
                if (message[j].messageID - $(".scroll>ul>li:last-child").attr("data") > 0) {
                    break;
                } else {
                    message.splice(j, 1);
                }
            }
        }
        for (var i = 0; i < message.length; i++) {
            if (message[i].sendUserID == mission.userID && message[i].sendUserID != "system") {
                AddSingleMessage(message[i], true, true);
            } else if (message[i].sendUserID != mission.userID && message[i].sendUserID != "system") {
                AddSingleMessage(message[i], false, true);
            }
        }
    }
    $("#meetingTree" + message[0].meetingID).attr("data-nid", mission.msgEndID).attr("data-lid", mission.msgEndID);
}

function getURLParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
/*function StandardObjGetValueByType(typename) {
 console.log(currentRightSelectedStandardObj, typename);
 for (var e of currentRightSelectedStandardObj.elements) {
 if (e.id == typename) {
 return e.value;
 }
 }
 return null
 }*/
var isChatTabListRightClick = false;

var CurrentLeftMenuDestParams;
function GetRedirectRequestParamsByMenuData(dataFieldParams) { //刚点击API菜单左键时调用
    CurrentLeftMenuDestParams = {};
    for (let p of dataFieldParams) {
        let tmpP = {};
        tmpP["id"] = p.id;  //目标API字段ID
        tmpP["from"] = [];
        for (let i of p.inputVal) {
            if (i !== '') {
                tmpP['from'].push({
                    value: i,
                    id: p.jumpId || p.id,
                    objectID: p.jumpObjectID,
                    objectType: p.jumpType
                })
            }
        }
        CurrentLeftMenuDestParams[p.id] = tmpP;
    }
}

function GenereateAPIRequestParams() {
    var resparams = [];
    for (let k in CurrentLeftMenuDestParams) {
        if (CurrentLeftMenuDestParams[k].from.length !== 0) {
            resparams.push(CurrentLeftMenuDestParams[k]);
        }
    }
    return resparams;
}
//*** SourceParams 构成
// *id
// String
// 来源数据字段ID
// *value
// String
// 来源数据字段值
// *objectID
// String
// 来源数据主体id
// *objectType
// String
// 来源数据主体类型

// 通过全局的变量 newData 或 多参数的那个全局变量XX 画出源数据面板。里面应该包含 上面参数。
function LinkSourceParamsToRedirectParams(sourceParams, redirectParamsId) {  //当自动填充后调用，或者用户点击某个redirectParam之后再点击源字段时调用
    if (!CurrentLeftMenuDestParams.hasOwnProperty(redirectParamsId)) {
        CurrentLeftMenuDestParams[redirectParamsId] = {id: redirectParamsId, frommap: {}, from: []}
    }
    if (CurrentLeftMenuDestParams[redirectParamsId].frommap.hasOwnProperty(sourceParams.id)) {
        return;
    } else {
        CurrentLeftMenuDestParams[redirectParamsId].from.push(sourceParams);
    }
}

function BeforeSendApiCollectParams() {
    //判断是否存在仍然可以Edit的Input
    // for {
    //     LinkSourceParamsToRedirectParams({value:$input},redirectParamsId)
    // }
    //
}

function RemoveSourceParamsFromRediectParams(sourceParams, redirectParamsId) { //用户点X取消自动填充后调用
    CurrentLeftMenuDestParams[redirectParamsId].frommap.delete(sourceParams.key)
    for (let i = 0; i < CurrentLeftMenuDestParams[redirectParamsId].from.length; i++) {
        if (CurrentLeftMenuDestParams[redirectParamsId].from.id == sourceParams.id) {
            CurrentLeftMenuDestParams[redirectParamsId].from.splice(i, 1)
        }
    }
    if (CurrentLeftMenuDestParams[redirectParamsId].frommap.length == 0) {
        CurrentLeftMenuDestParams.delete(redirectParamsId);
    }

}

function isRightClick(event) {
    var rightclick;
    if (!event) var event = window.event;
    if (event.which) rightclick = (event.which == 3);
    else if (event.button) rightclick = (event.button == 2);
    return rightclick;
}
function getSource(data) {
    return convertJSONtoSource_Company(data)
}
function getTypeList_APIS(apis) {
    var types = [];
    for (api of apis) {
        types = _.union(types, getTypeList_API(api));
    }
    types = _.uniq(types);
    return types
}
function getTypeList_API(api) {
    var types = [];
    for (p of api.parameters) {
        types.push(p.type);
    }
    types = _.uniq(types);
    return types
}
function convertJSONtoSource_Company(data) {
    var source = [];
    for (d of data) {
        var items = {};
        items["html"] = "<span>" + d.sysTitle + "</span><span class='menuSystem'>（系统）</span>";
        var v = JSON.stringify({
            "sysVersion": d.sysVersion,
            'sysDesc': d.sysDesc,
            'types': getTypeList_APIS(d.apiList),
            't': 'company'
        });
        items["value"] = v.replace(/\"/g, "'");
        items["items"] = convertJSONtoSource_API(d.apiList);
        source.push(items);
    }
    return source
}
function convertJSONtoSource_API(data) {
    var source = [];
    for (d of data) {
        var items = {};
        if (d.type == "api") {
            items["label"] = "<span>" + d.summary + "</span><span class='menuSystem'>（查询）</span>";
        } else if (d.type == "url") {
            items["label"] = "<span>" + d.summary + "</span><span class='menuSystem'>（跳转）</span>";
        }
        d["t"] = "api";
        d["types"] = getTypeList_API(d);
        items["value"] = JSON.stringify(d).replace(/\"/g, "'");
        // items["items"] = convertJSONtoSource_Params(d.parameters);
        source.push(items);
    }
    return source;
}
/* 第三极菜单 */
/*function convertJSONtoSource_Params(data) {
 var source = [];
 var html;
 for (d of data) {
 var items = {};

 d["t"] = "params";
 if (d["required"] == "true") {
 html = "<e class='bdline'></e><span>" + d["desc"] + "</span>";
 } else {
 html = "<span>" + d["desc"] + "</span>";
 }
 items["html"] = html;
 items["value"] = JSON.stringify(d).replace(/\"/g, "'");
 source.push(items);
 }
 return source;
 }*/
//菜单消失
function menuHide() {
    $(".jqx-menu-dropdown").hide();
    $("#jqxMenu_index").hide();
    $(".left_click").hide();
}
//图片大小转换  11/16修改
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function searchHighKey(key) {
    for (let field in configFields) {
        if (field == key) {
            return {name: configFields[field], flag: true}
        }
    }
    return {name: key, flag: false}
}
function AddSingleMessage(message, beself, position) {
    let nameclass = "o-name",
        msgclass = "o-message",
        timeclass = "o-time",
        attachclass = 'o-attach',
        headclass = "o-head-portrait",
        iconpart = '<i class="fa fa-3x fa-user-circle-o" aria-hidden="true"></i>';
    if (beself == true) {
        nameclass = "m-name";
        msgclass = "m-message";
        timeclass = "m-time";
        headclass = "m-head-portrait";
        // attachclass = 'm-attach';

        iconpart = '<i class="fa fa-3x fa-user-circle" aria-hidden="true"></i>';
    }
    //应用系统返回数据
    if (message.callbackData) {
        console.log('1121111211121',message.callbackData)
        let apiInstance = new missionClient.CallbackApi();

        let id = message.callbackData; // String | 返回id

        let opts = {
            'authorization': getURLParams('token') // String | token字串
        };

        let temp = document.createElement('div'),
            tabDivWrap = document.createElement('div'),
            p = document.createElement('p'),
            div = document.createElement('div');
        div.setAttribute('id', id);
        $(tabDivWrap).addClass('tabDivWrap').append($(p).text('回传数据结果').attr('data', id)).append($(div));
        temp.appendChild(tabDivWrap);
        let loading = loadingAnimate();
        $(tabDivWrap).append(loading);
        apiInstance.getCallbackObject(id, opts).then(function (data) {
            $(loading).remove();
            $('#' + message.meetingID + '-' + message.messageID).find(".loader").remove();
            if (data.ri.rc !== 1) {
                throw data.ri.msg;
            }
            console.log(data);
            data = changeDataToBack(data);
            if (!missionRoomRightClick.rightClickBallData[id]) {
                AddTabDataCache(JSON.parse(data.d.object.data).data, id);
            }
            let tempTab = CreateHTMLFromNodeResultData(data.d.object, true);
            $('#' + id).append($(tempTab));
            $('.highlight').addClass('active-a').next().addClass('active-a');
            $(tempTab).find('.tabBoxForScroll').height('calc(100% - 135px)');
            $(".scroll").scrollTop($(".scroll")[0].scrollHeight);
        }, function (error) {
            throw error;
        }).catch(function (error) {
            console.error(error);
            toastr.error('', '获取回传数据失败', {timeOut: 2000});
        });
        message.message = temp.innerHTML;
    }

    var msg_html = '<li class="clearfix visible1" data="' + message.messageID + '" id="' + message.meetingID + '-' + message.messageID + '" data-sendID="' + message.sendUserID + '">' +
        '<div class="head-portrait ' + headclass + '">' + iconpart + '</div>' +
        '<div class="show-name ' + nameclass + '"><span>' + message.sendUserName + ':</span></div>' +
        '<div class="message ' + msgclass + '"><div>' + message.message + '</div>';


    if (message.attachmentInfo.length > 0) {
        msg_html += '<ul class="msg_attaches">';
        for (var i = 0; i < message.attachmentInfo.length; i++) {
            var iconFile;
            if (message.attachmentInfo[i].attachmentType.indexOf('image') == 0) {
                iconFile = 'fa-file-image-o';
            } else if (message.attachmentInfo[i].attachmentType == 'application/pdf') {
                iconFile = 'fa-file-pdf-o'
            } else if (message.attachmentInfo[i].attachmentType.indexOf('audio') == 0) {
                iconFile = 'fa-file-audio-o'
            } else if (message.attachmentInfo[i].attachmentType.indexOf('video') == 0) {
                iconFile = 'fa-file-video-o'
            } else if (message.attachmentInfo[i].attachmentType == 'application/zip') {
                iconFile = 'fa-file-archive-o'
            } else if (message.attachmentInfo[i].attachmentType.indexOf('wordprocessingml.document') > 0) {
                iconFile = 'fa-file-word-o';
            } else if (message.attachmentInfo[i].attachmentType.indexOf('presentationml.presentation') > 0) {
                iconFile = 'fa-file-powerpoint-o';
            } else if (message.attachmentInfo[i].attachmentType.indexOf('spreadsheetml.sheet') > 0) {
                iconFile = 'fa-file-excel-o';
            } else if (message.attachmentInfo[i].attachmentType.indexOf('text') == 0) {
                iconFile = 'fa-file-text-o';
            } else {
                iconFile = 'fa-file';
            }
            console.log(message.attachmentInfo[i]);
            let params = [];
            for (let keyName in JSON.parse(message.attachmentInfo[i].attachmentObj)) {
                params.push(keyName);
            }
            // msg_html += '<li aid=' + message.attachmentInfo[i].attachmentID + ' datafield=' + JSON.stringify(JSON.parse(message.attachmentInfo[i].attachmentObj)[0]) + '><i class="fa fa-2x ' + iconFile + '" aria-hidden="true"></i><a href="#">' + message.attachmentInfo[i].attachmentName + '(' + bytesToSize(message.attachmentInfo[i].attachmentSize) + ')</a></li>'
            msg_html += '<li aid=' + message.attachmentInfo[i].attachmentID + ' datafield=' + JSON.stringify(params) + '><i class="fa fa-2x ' + iconFile + '" aria-hidden="true"></i><a href="' + 'attachments/download/?roomID=' + mission.roomID + '&attachmentID=' + message.attachmentInfo[i].attachmentID + '&token=' + getURLParams('token') + '">' + message.attachmentInfo[i].attachmentName + '(' + bytesToSize(message.attachmentInfo[i].attachmentSize) + ')</a></li>'
        }
        msg_html += '</ul>';
    }
    msg_html += '</div>';
    msg_html += '<div class="show-time clearfix ' + timeclass + '"><span>' + getLocalTime(message.sendTime) + '</span></div></li>';
    if (position === true) {
        $("#add-element").append(msg_html);
    } else {
        $("#add-element").prepend(msg_html);
    }
    $('.highlight').next().addClass('active-a');
}
//发送按钮
function sendadvancedMsg() {
    //发送消息时判断是否选择房间
    let isNotSelect = true;
    $("#main-container").find("div").each(function () {
        if ($(this).attr("select") == "y") {
            isNotSelect = false;
            return false;
        }
    }).end().find("li").each(function () {
        if ($(this).attr("select") == "y") {
            isNotSelect = false;
            return false;
        }
    });
    if (isNotSelect) {
        toastr.warning("请选择房间！！！", "发送失败！");
        return false;
    }
    //判断会战是否结束
    if (isStopRoom) {
        toastr.warning("会战已结束！！！", "发送失败！");
        return false;
    }
    var aid = [],
        standardObjects = getStandards();
    $("#fileDisplay").find("div").each(function () {
        aid.push($(this).attr("aid"));
    });
    if ($("#j-advanced").css("display") == "block") {
        let $jText = $('#j-text');
        var chatText = $jText.val();
        if (chatText != "") {
            addMessage(mission.roomID, mission.userID, mission.userName, chatText, aid, standardObjects);
            $jText.jqxEditor('focus');
        }
    } else {
        let $editor = $('#editor');
        var editorVal = $editor.val();
        if (editorVal != "" || aid.length > 0) {  //添加附件后可以发送空消息
            addMessage(mission.roomID, mission.userID, mission.userName, editorVal, aid, standardObjects);
            $editor.jqxEditor('focus');
        }
        $editor.val("");
    }

}
//发消息时div.msg宽度变化
function msgWidth() {
    var maxWidth = $(".scroll").width() - 200;
    $(".message").css({"max-width": maxWidth, "word-wrap": "break-word"});
}
//直接返回底部
function backBottom(data) {
    $("#add-element").children().remove();
    var message = data;
    for (var i = 0; i < data.length; i++) {
        if (data[i].sendUserID == mission.userID && data[i].sendUserID != "system") {
            AddSingleMessage(message[i], true, true);
        } else if (data[i].sendUserID != mission.userID && data[i].sendUserID != "system") {
            AddSingleMessage(message[i], false, true);
        }
    }
    $(".scroll").scrollTop($(".scroll")[0].scrollHeight);
    msgWidth();
    // menuClick();
}

function findLid(lid) {
    if (mission.msgStartID == -1) {
        mission.msgStartID = 1;
    }
    return lid == mission.msgStartID;
}


//获取高级文本框内的标准对象
function getStandards() {
    let editorBody = window.parent.frames[1].document.body,
        standardDivs = editorBody.getElementsByClassName("disEdit"),
        i = 0;
    return _.map(standardDivs, standardDiv => {
        let json = JSON.parse(standardDiv.getAttribute('datafield'));
        json.objectName = json.label;
        json.objectId = i;
        standardDiv.setAttribute('datafield', JSON.stringify(json));
        ++i;
        return json;
    });
}

/**
 *扁平化json对象数据
 *@param obj 原json对象数据
 */
function objFlatten(obj) {
    return Object.keys(obj).reduce(function (a, b) {
        if (Object.prototype.toString.call(obj[b]) === '[object Array]') {
            var isArray = obj[b].every(function (value) {
                return typeof value !== 'object'
            });

            if (isArray) {
                return a.concat({[b]: obj[b]})
            }
        }
        return a.concat(Object.prototype.toString.call(obj[b]) === '[object Object]' || Object.prototype.toString.call(obj[b]) === '[object Array]' ? objFlatten(obj[b]) : {[b]: obj[b]})
    }, [])
}
function jsonData2Array(source, key, pushData) {
    if (typeof source != 'object' || source == null) {
        pushData(key, source);
        return;
    }

    if (Array.isArray(source)) {
        for (let i of source) {
            jsonData2Array(i, key, pushData);
        }
        return;
    }
    //object
    for (let k in source) {
        source[k];
        jsonData2Array(source[k], k, pushData);
    }
    // return;
}

function jsonData3Array (source, tempData2) {

    if (Array.isArray(source)) {
        source.forEach(function (value1, index1, arr1) {
            if (Object(value1) === value1) {
                for (let k in value1) {
                    if (typeof value1[k] != 'object') {
                        let key = k.substring(0, 40);
                        if (!tempData2.hasOwnProperty(key)) {
                            tempData2[key] = []
                        }
                        tempData2[key][index1] = value1[k];
                    }
                }
            }
        });
    }

}

function jsonData3Object (source){
    if ($.isPlainObject(source)) {
        let json = {};
        for (let key in source) {
            json[key] = [source[key][0]];
        }
        return json;
        // for (let key in source) {
        //     if (Array.isArray(source[key])) {
        //         let unitValue = source[key].every(function (value) {
        //             return typeof value != 'object';
        //         });
        //         if (unitValue && !tempData2.hasOwnProperty(key)) {
        //             tempData2[key] = [source[key][0]];
        //         } else if (!unitValue) {
        //
        //         }
        //         for (let val of source[key]) {
        //             if (typeof val == 'object') jsonData3Object(val, tempData2);
        //             else if (!tempData2.hasOwnProperty(key)) {
        //
        //             }
        //         }
        //     } else if ($.isPlainObject(source[key])) {
        //         jsonData3Object(source[key], tempData2);
        //     } else {
        //         if (!tempData2.hasOwnProperty(key)) {
        //             tempData2[key] = [source[key]];
        //         }
        //     }
        // }
    }
}

//会战名过长出现tips...
function tips(dom, subDom) {
    dom.find(subDom).each(function () {
        if (this.offsetWidth < this.scrollWidth) {
            $(this).attr("title", $(this).text());
        } else {
            $(this).removeAttr("title");
        }
    });
}