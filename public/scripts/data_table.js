totalData = $('#callback_btn').data('info')
infoData = totalData.data;
// let data = JSON.parse(infoData)
let data = infoData;
let newData = data;
// let rightData = {};
let oTabs;
let tabslast = true;

initPage(data)
function isRightClick(event) {
    var rightclick;
    if (!event) var event = window.event;
    if (event.which) rightclick = (event.which == 3);
    else if (event.button) rightclick = (event.button == 2);
    return rightclick;
}
var contextMenu;
// let oid;
$(function () {
/*    $(document).bind('contextmenu', function (event) {
        return false
    })*/
    /*$('#jqxMenu').on('itemclick', function (event) {
        console.log(event);
        var element = event.args;
        if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
        let params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
        console.log(params)
        var sendApi = {};
        let $params = params.parameters;
        for (let i = 0; i < $params.length; i++) {
            let value = rightData[$params[i].name] || null;
            // for (let e in newData) {
            //     if (e == $params[i].name) {
            //         value = newData[e];
            //         break;
            //     }
            // }
            if (!value) continue;
            if (!sendApi[$params[i].in]) {
                sendApi[$params[i].in] = {};
            }
            if ($params[i].type == 'item') {
                sendApi[$params[i].in][$params[i].name] = [value];
            } else
                sendApi[$params[i].in][$params[i].name] = value;
        }
        console.log(sendApi);
        var redirectID = {
            meetingID: totalData.meetingID,
            meetingName: totalData.meetingName,
            objectID: oid,
            type: "returnobject"
        };
        if (params.t == "api") {
            let url = 'http://' + params.url;
            let token = getURLParams("token");
            if (params.type == "url") {
                window.open(encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + JSON.stringify(redirectID)));
            } else {
                $.getJSON(url,
                    {
                        params: JSON.stringify(sendApi),
                        token: token,
                        redirectID: JSON.stringify(redirectID),
                        json: true
                    }, function (data) {

                        data.json = true;
                        // data.redirectID = parseInt(Math.random() * 100);
                        addTab(data);
                    })
            }
        }
    });*/

/*    $('#data_bottom').off().on('mousedown', '.active-a', function (event) {
        $this = $(this);

        var key = $(this).prev().find('.delete-key').data('key');
        oid = $(this).attr("data-oid");
        rightData[key] = event.currentTarget.innerText
        var k = [];
        k.push(key);

        key = {
            params: JSON.stringify(k),
            type: 'all'
        };

        var rightClick = isRightClick(event);
        if (rightClick) {
            console.log(key)

            $.when($.getJSON('/register?token=' + totalData.token, key))
                .done(function (res) {
                    data = res.data;
                    if (!data || data.length <= 0) return;
                    if (!contextMenu) {
                        contextMenu = $("#jqxMenu").jqxMenu({
                            source: [],
                            width: "170px",
                            keyboardNavigation: "true",
                            autoOpenPopup: false,
                            mode: 'popup',
                            showTopLevelArrows: true,
                            animationShowDelay: 10,
                            animationShowDuration: 50,
                            animationHideDuration: 1,
                            autoCloseOnClick: true,

                        });
                    }
                    // if ($this.parents(".message")[0].getAttribute("class").indexOf("m-message")) {
                    //     $("#jqxMenu").jqxMenu('rtl', true);
                    // } else {
                    //     $("#jqxMenu").jqxMenu('rtl', false);
                    // }
                    contextMenu.jqxMenu('source', getSource(data));
                    // if ($("#jqxMenu").jqxMenu('rtl') == false) {
                    //     $(".jqx-menu-dropdown").find("e").css({"float": "right"});
                    // } else {
                    //     $(".jqx-menu-dropdown").find("e").css({"float": "left"});
                    // }
                    var scrollTop = $(window).scrollTop();
                    var scrollLeft = $(window).scrollLeft();
                    contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);

                });
            return false;

        }


    });


    $(document).on('click', '.delete-key', function (event) {
        let oDelete = $(event.currentTarget);
        let parent = oDelete.data('parent');
        let key = oDelete.data('key');
        deleteKeyFromJson(data, key, parent);
        oDelete.parent().parent().remove();
        initPage(data)
    });*/

    $('#callback_btn').click(function () {
        callbackData(newData)
        // callbackData(data)
    });

    // $('td, th').hover(function () {
    //     $(this).children('.delete-key').show('fast')
    // }, function () {
    //     $(this).children('.delete-key').hide('fast')
    // });

/*    function deleteKeyFromJson() {
        let data = arguments[0];
        let key = arguments[1];
        let parent = arguments[2];
        scanJson(data, key, parent);
    }*/

    function scanJson(data, key, parent) {
        if (parent != 'undefined') {
            if (parent == 'data') {
                delete data.data.splice(key, 1)
            } else if (parent == 'meta') {
                delete data.meta[key]
            } else {
                delete data.data[parent][key]
            }
        } else {
            delete data[key]
        }

    }


});
function initPage(data) {
    oTabs = $('#list_tab');
    // TODO 添加tabs
    $('#list_tab').jqxTabs({
        width: '100%',
        showCloseButtons: true
    });

    oTabs.on('add', function () {
        if (tabslast) {
            oTabs.jqxTabs('removeLast')
        }
        tabslast = false
    });
    addTab(data);
    // $('#table_container').html(JsonHuman.format(data));
    // $('.highlight').next().addClass('active-a');
    $('#callback_btn').data('info', JSON.stringify(data));
    $('#sys_title').text(totalData.sysTitle);
    $('#api_title').text(totalData.apiTitle);

    // $('td, th').hover(function () {
    //     $(this).children('.delete-key').show('fast')
    // }, function () {
    //     $(this).children('.delete-key').hide('fast')
    // })
}

/*function callbackData(data) {
    let token = getURLParams('token');
    $.ajax({
        method: 'POST',
        url: 'http://' + location.host + '/messages/callback',
        type: 'json',
        data: {
            redirectID: totalData.redirectID,
            data: JSON.stringify(data)
        },
        headers: {
            Authorization: 'JWT ' + token
        },
        success: function (data) {
            if (data.response.code != '1') {
                window.alert(data.response.message);
                return;
            }
            window.alert(data.response.message);
        },
        error: function (err) {
            window.alert('回传数据失败')
        }
    })
}*/
/*function getURLParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}*/

/*function searchHighKey(key) {
    for (let field in configFields) {
        if (field == key) {
            return {name: configFields[field], flag: true}
        }
    }
    return {name: key, flag: false}
}*/

/*function getSource(data) {
    return convertJSONtoSource_Company(data)
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
/!*第三级*!/
// function convertJSONtoSource_Params(data) {
//     var source = [];
//     var html;
//     for (d of data) {
//         var items = {};
//         // items["label"] = d["desc"];
//         d["t"] = "params";
//         if (d["required"] == "true") {
//             html = "<e class='bdline'></e><span>" + d["desc"] + "</span>";
//         } else {
//             html = "<span>" + d["desc"] + "</span>";
//         }
//         items["html"] = html;
//         items["value"] = JSON.stringify(d).replace(/\"/g, "'");
//         source.push(items);
//     }
//     return source;
// }
function getTypeList_API(api) {
    console.log(api);
    var types = [];
    for (p of api.parameters) {
        types.push(p.type);
    }
    types = _.uniq(types);
    return types
}
function getTypeList_APIS(apis) {
    var types = [];
    for (api of apis) {
        types = _.union(types, getTypeList_API(api));
    }
    types = _.uniq(types);
    return types
}*/

function addTab(result) {
    let adata = {};
    if (result.json) {
        adata = parseReturn(result);
    } else {
        adata = parseResult(result);
    }
    console.log('adata', adata);
    if (returnTabIndex('tab' + adata.id) == null) {
        let title = '<span id="tab' + adata.id + '">' + adata.label + '</span>';
        let tDiv = document.createElement('div');
        $(tDiv).html(JsonHuman.format(adata.info, {
            showArrayIndex: false,
        }));
        let outHtml = tDiv.innerHTML;
        tDiv = null;
        oTabs.jqxTabs('addFirst', title, outHtml);
        $('.highlight').next().addClass('active-a');
        $(document).find(".active-a").each(function () {
            if (!$(this).attr("data-oid")) {
                $(this).attr("data-oid", adata.id);
            }
        });
    } else {
        setActiveTab(adata.id)
    }
}

function parseResult(result) {
    let data = {};
    // data.id = totalData.redirectID;
    data.id = totalData.dataID;
    data.label = totalData.apiTitle;
    data.info = result;
    return data;
}
function parseReturn(result) {
    console.log(result);
    let data = {};
    // data.id = result.redirectID;
    let info = JSON.parse(result.info);
    data.id = info.dataID;
    data.label = result.title;
    data.info = info.data;
    return data;
}

// 传入id 激活tab
function setActiveTab(id) {
    let tid = 'tab' + id;
    let index = returnTabIndex(tid);
    if (index != null) {
        oTabs.jqxTabs('select', index);
    }
}
function returnTabIndex(id) {
    let liArr = oTabs.find('li');
    for (let index in liArr) {
        if (liArr.eq(index).find('#' + id).length !== 0) {
            return index
        }
    }
    return null
}
