let oTabs,
    newData,
    objectID,
    timeline, items, tempTimer = 0,
    auto = true,  //是否自动
    // initUrl = 'http://' + window.location.host + '/synergy/show/new',  // 初始化链接
    initUrl = '/synergy/show/range',  // 初始化链接
    meetingUrl = '/synergy/show/meeting/new',
    isQuery = false, // 查询是否成功的标志
    meetingInfo = null, // 会战信息
    newId = 0;  // 新消息id
customTimeOut = NaN;
// let beginTime = Date.now();
let beginTime = 0;

let rightClickobjectID;
$(function () {
    oTabs = $('#tabs');
    /************************************************************************
     *  初始化变量
     ************************************************************************/


    // let meetingUrl = 'http://10.0.0.74:3050/synergy/show/meeting/new'
    /************************************************************************
     *  初始化时间线
     ************************************************************************/
    let options = {
        template: function (item) {
            let html = '<div class="info">' +
                '<div class="header">' +
                '<span>' + item.title + '</span>' +
                '</div>' +
                '<div>' +
                '</div>' +
                '</div>';
            return html
        },
        align: 'center',
        width: '100%',
        height: '100%',
        min: new Date(2015, 0, 1),
        max: new Date(2020, 0, 1),
        margin: {
            item: 5
        },

        minHeight: 100,
        start: new Date(),
        multiselect: true,
        showCurrentTime: false,
        zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 2,
        zoomMin: 1000 * 60 * 5
    };
    items = new vis.DataSet();
    let container = document.querySelector('#mytimeline');
    let selarea = false; // 判断是否移除分区
    timeline = new vis.Timeline(container, items, options);
    // 时间范围改变的监听事件

    function ShowitemInfoById(ids) {
        console.log(ids);
        filterNodesById(ids);
        let html = "";
        for (id of ids) {
            info = JSON.parse(JSON.parse(items._data[id].content).info);
            html += generateTableByObj(info);
        }
    }

    function generateTableByObj(obj) {
        let table = "<table class='table table-bordered'>";
        for (let k in obj) {
            let v = obj[k];
            if (typeof(obj[k]) == 'object') {
                v = generateTableByObj(obj[k]);
            }
            table += "<tr><td>" + k + "</td><td style='word-break: break-all'>" + v + "</td></tr>";
        }
        table += "</tr></table>";
        return table;
    }

    timeline.on('rangechange', function (obj) {
        // 拖动时间轴
        if (obj.byUser == false) { //非用户改变时间轴
            return;//Not drag by User
        } else { //用户拖动改变，这个地方应该做数据预载，注意和推送到知识图的分开
            //console.log(obj);
        }

    });

    timeline.on('select', function (obj) {
        //选中
        ShowitemInfoById(obj.items);
    });


    timeline.on('timechange', function (obj) {
        //自定义轴拖动的时候
        let date = obj.time;
        let timePeriod = items.get('timePeriod');
        timePeriod.end = date;
        items.update(timePeriod);
        updateSelectedArea(date);
    });

    function updateSelectedArea(end) {
        // 清除操作
        let selectedItems = [];
        $('.vis-selected').removeClass('vis-selected');
        // 高亮选中区域
        let datas = items._data;
        for (let index in datas) {
            let item = datas[index];
            if (item.type != 'background' && checkDateRange(end, item.start)) {
                item.className += ' vis-selected';
                selectedItems.push(item);
            }
        }
        let timer = {
            start: timeline.getDataRange().min.getTime(),
            end: end.getTime()
        };
        filterNodesByTime(timer);
        // 判断是否为空
        if (selectedItems.length != 0) {
            items.update(selectedItems)
        }
    }

    function checkDateRange(maxDate, date) {
        let minDate = timeline.getDataRange().min;
        return date < maxDate && date > minDate;

    }


    function getURLParams(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /************************************************************************
     *  请求meetingID
     ************************************************************************/
    let pathname = location.pathname;
    switch (pathname) {
        case '/':
            if (meetingIDForShowPage != -1) {
                setAutoRun(auto, meetingIDForShowPage);
            } else {
                console.log("First Refresh")
            }
            break;
        default:
            setAutoRun(auto);
            break;
    }

    /************************************************************************
     *  处理点击事件
     ************************************************************************/
    // 点击会战室
    $('#explain_info-p .room-item').click(function () {
        let room = $(this).find('a').data('room');
        $("#close_tabs-btn").trigger("click");
        let mtDiv = $("#message_tabs");
        mtDiv.hide().find('.chatList').remove();
        mtDiv.find('.littleBtnBox').remove();
        initIndexForShowPage(room.meetingID);
    });


    $("#message_shrink").click(function () {
        let height = $("#message_list div:first-child").height() + 4;
        if ($(this).hasClass("fa-arrow-circle-down")) {
            $("#message_list").animate({height: height}, 100);
            $(this).removeClass("fa-arrow-circle-down").addClass("fa-arrow-circle-up");
        } else {
            $("#message_list").animate({height: "16%"}, 100);
            $(this).removeClass("fa-arrow-circle-up").addClass("fa-arrow-circle-down");
        }
    });

    $("#auto_btn").click(function (e) {
        changeHighlightAll();
        auto = !auto;
        if (auto) {
            e.target.innerText = '停止自动';
            setAutoRun(auto);
        } else {
            e.target.innerText = '开启自动';
            setAutoRun(auto);
        }
    });

    $('#overview_btn').click(function () {
        $('.vis-selected').removeClass('vis-selected');
        changeHighlightAll();
        items.remove('timePeriod');
        if ($('.vis-select-time').length != 0) {
            timeline.removeCustomTime("vis-select-time");
            selarea = false;
        }
        timeline.fit();
    });


    $("#jumpcurrent_btn").click(function () {
        changeHighlightAll();
        timeline.moveTo(Date.now());
    });


    $("#selarea_btn").click(function () {
        let winobj = timeline.getWindow();
        selarea = !selarea;
        if (selarea) {
            let customTime = new Date(winobj.end - (winobj.end - winobj.start) / 2);
            let earliesTime = timeline.getItemRange().min;
            timeline.addCustomTime(customTime, "vis-select-time");
            items.add({
                id: 'timePeriod',
                start: earliesTime,
                end: customTime,
                type: 'background'
            });
            // 建立选区初始化操作
            updateSelectedArea(customTime)
        } else {
            if ($('.vis-select-time').length != 0) {
                timeline.removeCustomTime("vis-select-time");
            }
            items.remove('timePeriod');

            changeHighlightAll();
            // 清除选中的
            $('.vis-selected').removeClass('vis-selected');
            clearSelectedItems(items);
        }

    });

    $("#changelayout_btn").click(function () {
        if (init == renderTreeW) {
            init = renderForceW;
        } else {
            init = renderTreeW;
        }

        init(forceNodes, forceLinks);
    });


    // $(document).on('click', '.delete-key', function (event) {
    //     let oDelete = $(event.currentTarget);
    //     let data = {};
    //     let parent = oDelete.data('parent');
    //     let key = oDelete.data('key');
    //     deleteKeyFromJson(data, key, parent);
    //     oDelete.parent().parent().remove();
    // });

    $('#full-tabs').on('selected', function (event) {
        statusFlag = true;
        $(".littleBtnBox").parent().find(".tabBoxForScroll").show();
        currentId = event.args.item;
        objectID = $(event.target.firstChild.firstChild).children().eq(currentId).find("span").attr("data");
        $('.tabBoxForScroll>table').show();
        $('.table-json').remove();
        $('.clearSelect').remove();
        $('.backCsvData').remove();
        countListforhighlight = 0;
        $('.chatList li').removeClass('hadClickTabList hadClickTabListB');
        $('.tabBoxForScroll').removeData();
    });
    // 搜索timeline 的eventID
    function returnTimelineEventID(eid) {
        let ret = returnEventType(JSON.parse(JSON.parse(items._data[eid].content).info));
        let info = ret.info;
        let id = ret.id;
        // let id = items._data[eid].id
        let title = items._data[eid].title;
        return {info: JSON.parse(info), label: title, id: id, type: 1}
    }

    function returnEventType(eventInfo) {
        // let info = JSON.parse(JSON.parse(items._data[eid].content).info)
        for (let item in eventInfo.nodes) {
            if (eventInfo.nodes[item].nodeType === 'result') {
                return {info: eventInfo.nodes[item].info, id: eventInfo.nodes[item].nodeID}
            }
        }
        return {}
    }

    $('#hide_tabs').on('click', function () {
        let mtDiv = $("#message_tabs");
        let _dataId = mtDiv.find('#message-node-title').find('span').attr('data');
        //delete missionRoomRightClick.rightClickBallData[_dataId];
        mtDiv.hide().find("#message-node-info").children().remove();
        mtDiv.find('.chatList').remove();
        mtDiv.find('.dataOrigin').remove();
        mtDiv.find('.littleBtnBox').remove();
    });

    function deleteKeyFromJson() {
        let data = arguments[0];
        let key = arguments[1];
        let parent = arguments[2];
        scanJson(data, key, parent);
    }


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

    /************************************************************************
     *  其他处理函数
     ************************************************************************/
    if (location.pathname != "/") {
        $(document).on('click', '.translate_data', function (e) {
            let info = JSON.parse($(e.target).data('info').info);
            callbackDataShowSingle(info);
        });
        function callbackDataShowSingle(data) {
            let token = getURLParams('token');
            $.ajax({
                method: 'POST',
                url: 'http://' + location.host + '/messages/callback',
                type: 'json',
                data: {
                    redirectID: data.redirectID,
                    data: JSON.stringify(data.data)
                },
                headers: {
                    Authorization: 'JWT ' + token
                },
                success: function (data) {
                    if (data.response.code != '1') {
                        window.alert(data.response.message);
                        return;
                    }
                },
                error: function (err) {
                    window.alert('回传数据失败')
                }
            })
        }
    }
    $('#full-tabs').on('removed', function (event) {
        let _objectID = $(event.target.firstChild.firstChild).children().eq(event.args.item).find("span").attr("data");
        // RmTabDataCache(event.args.item);
    });
    var contextMenu;
    // 右键部分
    $(document).on('contextmenu', function (event) {
        return false
    });

    $('#show_jqxMenu').off().on('itemclick', function (event) {
            var element = event.args;
            if (rightClickobjectID) {
                objectID = rightClickobjectID
            }
            let mtDiv = $("#message_tabs");
            mtDiv.hide().find('.chatList').remove();
            mtDiv.find('.littleBtnBox').remove();
            // if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
            if ($(element).children().data('type') == 'customize') {
                currentRightSelectedStandardObj = newData;
                // objectID = rightClickobjectID;
                // $("#close_tabs-btn").trigger("click");
                // $("#message_tabs").hide().find('.chatList').remove();
                // $('#query_container').show(0, function () {
                //     //$('#table-input-toggle').html('表格展示').click().hide();
                // });
                $('#query_container').show().find('.content-box').velocity('transition.shrinkIn');

            } else {
                //let params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
                //let sendApi = {};
                //let $params = params.parameters;
                //let element = event.args;
                //if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
                let params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
                rightClickMenuList(params);
                sendApiToJump(params, 'resultobject');
                /*let newDataKey = Object.keys(newData)[0];
                 let valArray = [];
                 valArray = _.concat(valArray, newData[newDataKey]);
                 $params.forEach(function (item) {
                 item.inputVal = valArray;
                 item.jumpId = newDataKey;
                 if (item.params.join(',') !== '') {
                 item.jumpObjectID = objectID;
                 item.jumpType = 'resultobject';
                 } else {
                 item.jumpObjectID = '';
                 item.jumpType = '';
                 }
                 });
                 console.log($params);
                 GetRedirectRequestParamsByMenuData($params);
                 let typeObject;
                 if (objectID.indexOf("result") != -1) {
                 typeObject = "resultobject";
                 } else if (objectID.indexOf("back") != -1) {
                 typeObject = "backobject";
                 isInMessageWindow = true;
                 } else {
                 typeObject = "standardobject";
                 isInMessageWindow = true;
                 }
                 var redirectID = {
                 meetingID: meetingInfo.id,
                 meetingName: meetingInfo.name,
                 objectID: rightClickobjectID,
                 type: typeObject
                 };
                 if (params.t == "api") {
                 var url = 'http://' + params.url;
                 var token = getURLParams("token");
                 if (params.type == "url") {
                 window.open(encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + JSON.stringify(redirectID)));
                 } else if (params.type == "api") {
                 let apiInstance = new missionClient.RedirectApi(),
                 redirectId = params.url,
                 mID = mission.roomID,
                 api_params = GenereateAPIRequestParams(),
                 opts = {
                 'authorization': getURLParams('token') // String | token字串
                 };
                 apiInstance.redirectApi(redirectId, mID, api_params, opts).then(function (result) {  //调用其他业务系统
                 if (result.ri.rc === 0) {
                 throw result.ri.msg;
                 }
                 dataPresentation();
                 AddTabDataCache(JSON.parse(result.d.data).data, result.d.id);
                 var tab_html = CreateHTMLFromNodeResultData(result.d);
                 AddDataTableUnderD3(result.d.dstSystemTitle, tab_html, result.d.id);
                 console.log('API called successfully. Returned data: ', data);
                 }, function (error) {
                 throw error;
                 }).catch(function (error) {
                 console.warn(error);
                 toastr.error('', '查询失败', {timeOut: 2000});
                 });
                 }
                 }*/
            }
        }
    );

    $('body').on('mousedown', '.active-a', function (event) {
        if (isRightClick(event)) {
            let $this = $(this);
            rightClickobjectID = $(this).parents('.dataOrigin').attr('objid') || $(this).parents('.message-tabs').find('.tabForCount').attr('data') || objectID;
            $("#show_jqxMenu").hide();
            if ($this.parents('#message_tabs').length != 0) {
                isInMessageWindow = true;
            } else {
                isInMessageWindow = false;
            }

            var key = $(this).attr('h') || $(this).prev().attr('h');  //获取jsonhuman种的hash值
            console.log($(this).attr('h'),$(this).prev().attr('h'),key)
            if (allHashKeyName.hasOwnProperty(key) && typeof allHashKeyName[key] !== 'object') {
                key = allHashKeyName[key]
            }
            if ($(this).hasClass('toggleC')) {
                let tempJsonData = {};
                newData = JSON.parse($(this).prev().attr('data'));
                tempJsonData[$(this).prev().attr('h')] = newData[$(this).prev().text()].v;
                newData.from = tempJsonData;
                newData.oid = $(this).prev().attr('o');
                currentRightSelectedStandardObj = newData;
            } else {
                console.log(key)
                key = key.substring(0, 40);
                let value = event.target.innerText;
                console.log(event.target.innerText);
                newData = {}; //清空全局变量，稍后选择API时从这里发出数据
                newData[key] = value;
                currentRightSelectedStandardObj = newData;
            }
            var k = [];
            k.push(key);
            let api = new missionClient.ConfigApi();
            let opts = {'authorization': getURLParams('token')};
            api.getApiConfig(k, opts).then(function (res) {
                if (res.ri.rc === 0) {
                    console.log(res.ri.msg);
                    return;
                }
                data = res.d;
                if (!data) return;
                if (!contextMenu) {
                    contextMenu = $("#show_jqxMenu").jqxMenu({
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
                        theme: 'meeting'
                    });
                }
                if ((window.width - event.clientX) < 200) {
                    $("#show_jqxMenu").jqxMenu('rtl', true);
                } else {
                    $("#show_jqxMenu").jqxMenu('rtl', false);
                }
                contextMenu.jqxMenu('source', getSource(data));
                var scrollTop = $(window).scrollTop();
                var scrollLeft = $(window).scrollLeft();
                contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
            }, function (error) {
                console.error(error);
            });
            return false;
        }
    });
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
        // if (!data.flag) {
        source.unshift({"html": "<div data-type='customize'>人工业务分析</div>"});
        // }
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

    function getTypeList_API(api) {
        // console.log(api);
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
    }

    $("#full_tabs_btn").click(function () {
        // if ($('#rename').css('display') === 'block') {
        //     alert('请先填写名称！');
        //     return false;
        // }
        $("#report_top_wrap").hide();
        $("#report_foot_wrap").hide();
        let $messageNodeTitle = '#message-node-title';
        let objectid = $(this).parent().find($messageNodeTitle).find("span").attr("data");
        console.log(objectid);
        let undownFlag = false;
        $('#full-tabs').show();
        $('.hadCountForTab').each(function () {
            console.log(objectid, $(this).attr('data'));
            if (objectid === $(this).attr('data')) {
                let index = $(this).parents('.jqx-reset').index();
                $('#full-tabs').jqxTabs('select', index);
                undownFlag = true;
            }
        });
        $('.tabForCount').addClass('hadCountForTab');

        let mtDiv = $("#message_tabs"),
            $fullTabsParent = $('.full-tabs-parent');
        let rightClickPanelHTML;
        if ($(this).parent().find('.dataOrigin')[0]) {
            rightClickPanelHTML = $(this).parent().find('.chatList')[0].outerHTML + $(this).parent().find('.dataOrigin')[0].outerHTML + $(this).parent().find('.littleBtnBox')[0].outerHTML + $(this).parent().find('#message-node-info')[0].innerHTML;
        } else {
            rightClickPanelHTML = $(this).parent().find('.chatList')[0].outerHTML + $(this).parent().find('.littleBtnBox')[0].outerHTML + $(this).parent().find('#message-node-info')[0].innerHTML;
        }
        let title = $(this).parent().find($messageNodeTitle).html();
        objectID = $(this).parent().find($messageNodeTitle).find("span").attr("data");
        mtDiv.find('.chatList').remove();
        mtDiv.find('.littleBtnBox').remove();
        mtDiv.find('.dataOrigin').remove();
        mtDiv.find('.tabBoxForScroll').remove();
        mtDiv.hide();
        if (undownFlag) {
            return;
        }
        $("#show_tabs").prepend(loadingAnimate());
        if ($fullTabsParent.css("display") == "none") {
            dataPresentation();
            $fullTabsParent.show(0, function () {
                AddDataTableUnderD3(title, rightClickPanelHTML, objectid);
            });
        } else {
            customTimeOut = setTimeout(function () {
                AddDataTableUnderD3(title, rightClickPanelHTML, objectid);
            }, 0);
        }
    });

    $('#show_table-excle').on('click', function (event, nodeId) {
        console.log(nodeId);
        //return false;
        $(".full-tabs").hide();
        $("#report_top_wrap").show();
        $("#report_foot_wrap").show();
        changeHighlightAll();
        if (!nodeId) {
            nodeId = $(this).next().find("span").attr("data");
        }
        highlightParentNode('g-' + nodeId);
        let mtDiv = $("#message_tabs");
        mtDiv.hide().find('.chatList').remove();
        mtDiv.find('.littleBtnBox').remove();
        $("#message_list").css({bottom: "50%"});
        $("#eventgraph").css({height: "50%"});
        $("#show_tabs").css({
            "border-top": "1px solid rgba(255, 255, 255, 0.05)",
            "height": "50%",
            "overflow": "hidden"
        });
        $("svg").css({height: "100%"});
        $(".row").css({height: "50%"});
        $(".full-tabs-parent").show().css({"height": "100%"});

        createReportComponent('g-' + nodeId);
        /*        $("a[class*=r]").click(function () {
         $("#show_tabs").animate({
         scrollTop: $("#" + $(this).attr("class")).offset().top - 534
         }, 500);
         });
         $("a[class*=s]").click(function () {
         $("#show_tabs").animate({
         scrollTop: $("#" + $(this).attr("class")).offset().top - 534
         }, 500);
         });*/
    });

    function hideTimeLineBtnClick() {
        let $fullTabsParent = $('.full-tabs-parent');
        $fullTabsParent.height('100%');
        $(".tabBoxForScroll").height($fullTabsParent.height() - $('.chatList').height() - 70).animate({
            scrollTop: 0
        });
        $("#back_bottom").css('bottom', '1%');
    }

    function showTimeLineBtnClick() {
        let $fullTabParent = $('.full-tabs-parent'),
            $chatlist = $('.chatList');
        $fullTabParent.height('50%');
        $(".tabBoxForScroll").height($fullTabParent.height() - $chatlist.height() - 70).animate({
            scrollTop: $('.tabBoxForScroll>table').height() + $chatlist.height() + 25
        });
    }

    $('#timeLineShowAndHide').click(function (event) {
        let that = $(this);
        switch (that.attr('class')) {
            case 'back-bottom fa fa-arrow-circle-o-down':
                that.removeClass('back-bottom fa fa-arrow-circle-o-down').addClass('back-top fa fa-arrow-circle-o-up');
                showTimeLineBtnClick();
                break;
            case 'back-top fa fa-arrow-circle-o-up':
                that.removeClass('back-top fa fa-arrow-circle-o-up').addClass('back-bottom fa fa-arrow-circle-o-down');
                hideTimeLineBtnClick();
                break;
        }
    });
    $("#close_tabs-btn").click(function () {
        $("#report_top_wrap").hide();
        $("#report_foot_wrap").hide();
        $('#hide_tabs').trigger('click');
        let $fullTab = $('#full-tabs');
        TabDataCache = [];
        if (customTimeOut) {
            clearTimeout(customTimeOut);
            customTimeOut = NaN;
        }
        changeHighlightAll();
        let length = $fullTab.jqxTabs('length') - 1;
        for (let i = length; i >= 0; i--) {
            $fullTab.jqxTabs('removeAt', i);
        }
        $(".row").css({height: "100%"});
        $("#eventgraph").css({height: "80%"});
        $("svg").css({height: "100%"});
        $(".full-tabs-parent").hide();
        // $("#show_tabs").css({height: "20%"});
        $("#message_list").css({bottom: "20%"});
        $("#show_tabs").css({
            "height": "20%",
            "border-top": "none"
        });
        closeReportComponent();
        // clearTableData();
    });
//    说明点击事件
    $("#explain_info>span").click(function () {
        let height = $("#explain_info>h3").height(),
            $explainInfo = $('#explain_info'),
            $explainInfoP = $('#explain_info-p');
        if ($(this).hasClass("fa-arrow-circle-up")) {
            $explainInfo.height(height);
            $explainInfoP.hide();
            $(this).removeClass("fa-arrow-circle-up").addClass("fa-arrow-circle-down");
        } else {
            $explainInfo.height("20%");
            $explainInfoP.show();
            $(this).removeClass("fa-arrow-circle-down").addClass("fa-arrow-circle-up");
        }
    });
    //tab移除完切换形态
    $('#full-tabs').on('removed', function () {
        if ($("#full-tabs>div:first-child").find("ul").children().length == 0) {
            $("#close_tabs-btn").trigger("click");
        }
    });
    $("#hide_api").click(function () {
        if ($(this).hasClass("fa-arrow-circle-down")) {
            $(this).parent().parent().animate({height: ($(this).parent().height() + 4)}, 100);
            $(this).removeClass("fa-arrow-circle-down").addClass("fa-arrow-circle-up");
        } else {
            $(this).parent().parent().animate({height: "110px"}, 100);
            $(this).removeClass("fa-arrow-circle-up").addClass("fa-arrow-circle-down");
        }
    });
    let shrinkFlag = false;
    $("#allshrink").click(function () {
        if ($("#showMemberGrid").find("table").css("display") != "none") {
            $("#memberGrid-shrink").trigger("click");
        }
        if ($("#explain_info-p").css("display") == "block") {
            $("#explain_info>span").trigger("click");
        }
        if ($("#message_list").height() >= 35) {
            $("#message_shrink").trigger("click");
        }
        if ($("#cutline").height() >= 25) {
            $("#hide_api").trigger("click");
        }
        if (shrinkFlag) {
            $("#hide_api").trigger("click");
            $("#memberGrid-shrink").trigger("click");
            $("#explain_info>span").trigger("click");
            $("#message_shrink").trigger("click");
            shrinkFlag = false;
            return false;
        }
        shrinkFlag = true;
    });
    $("#sliderShrink").click(function () {
        let jscb = ".jqx-splitter-collapse-button-vertical-meeting",
            myBattle = $(".my-battle"),
            spLeft = $("#splitterLeft"),
            $search = $('.search');
        if (myBattle.width() != 0 && $search.width() != 0) {
            spLeft.find(jscb).trigger("click");
            $search.parent().prev().find(jscb).trigger("click");
        } else if (myBattle.width() != 0) {
            spLeft.find(jscb).trigger("click");
        } else if ($search.width() != 0) {
            $search.parent().prev().find(jscb).trigger("click");
        } else if (myBattle.width() == 0 && $search.width() == 0) {
            spLeft.find(jscb).trigger("click");
            $search.parent().prev().find(jscb).trigger("click");
        }
        DragFloatTab('message-node-title');
    });
    $('#roomDesc').on('click', function () {
        if ($('#room_desc_p').css('display') === 'none') {
            $('#room_desc_p').velocity("transition.expandIn", {duration: 650});
        }
    });
    $('#close_desc').on('click', function () {
        $('#room_desc_p').velocity("transition.expandOut", {duration: 650});
    });
    $(document).on('click', '.fa-angle-double-left, .fa-angle-double-right', function () {
        DragFloatTab('message-node-title');
    });
    $(document).on('click', '#closeFloatdiv', function () {
        $(this).parent().remove();
        $('.table-json').find('.table-td-isClick').each(function () {
            $(this).removeClass('table-td-isClick');
        });
    });
    $(document).on('click', '#minusFloatdiv', function () {
        $('#selected_obj').show().removeClass('changeOpacity');
        $(this).parent().hide();
    });
    $(document).on('click', '.toggleC', function () {
        $(this).parent().toggleClass('toggleOnce');
        // $(this).next().toggleClass('toggleOnce');
    });
    $('#selected_obj').click(function () {
        $(this).hide();
        $('#float_rightclick').show('fast', function () {
            tips($('#floarUl'), 'div');
        });
    });
});
/**
 * 繁琐的DOM操作不集中就出现一堆 $ 看着心慌
 * */
function dataPresentation() {
    $("#report_top_wrap").hide();
    $("#report_foot_wrap").hide();
    $("#message_list").css({bottom: "50%"});
    $("#eventgraph").css({height: "50%"});
    $(".full-tabs").show();
    $("#show_tabs").css({
        "border-top": "1px solid rgba(255, 255, 255, 0.05)",
        "height": "50%",
        "overflow": "hidden"
    });
    $("svg").css({height: "100%"});
    $('.full-tabs-parent').show();
    $(".row").show().css({height: "50%"});
}

/**
 * 使Dom可拖拽
 * @param id 想要拖拽目标的ID
 * */
function DragFloatTab(id) {
    var $$ = function (flag) {
        return document.getElementById(flag);
    };
    $$(id).onmousedown = function (e) {
        var d = document;
        var page = {
            event: function (evt) {
                var ev = evt || window.event;
                return ev;
            },
            pageX: function (evt) {
                var e = this.event(evt);
                return (e.clientX + document.body.scrollLeft - document.body.clientLeft - 5);
            },
            pageY: function (evt) {
                var e = this.event(evt);
                return (e.clientY + document.body.scrollTop - document.body.clientTop);
            },
            offsetX: function (evt) {
                var e = this.event(evt);
                return e.offsetX;
            },
            offsetY: function (evt) {
                var e = this.event(evt);
                return e.offsetY;
            }
        };
        var x = page.offsetX(e);
        var y = page.offsetY(e);
        if ($$(id).setCapture) {
            $$(id).setCapture();
        }
        else if (window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }
        d.onmousemove = function (e) {
            var tx = page.pageX(e) - x;
            var ty = page.pageY(e) - y;
            $$(id).parentNode.style.left = tx + "px";
            $$(id).parentNode.style.top = ty + "px";
        };
        d.onmouseup = function () {
            if ($$(id).releaseCapture) {
                $$(id).releaseCapture();
            }
            else if (window.releaseEvents) {
                window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            d.onmousemove = null;
            d.onmouseup = null;
        };
    }
}

/**
 *消息框表格消息栏点击按钮的添加
 * @param data json 点击按钮要展示的数据
 * @param paramsData 查询输入的源数据
 * @return 根据数据对应的html
 */
function anywhereDataList(data, paramsData) {
    let toolBar = createDomNode('div', 'tab_changeBar');
    $(toolBar).text('聚合数据').prepend(createDomNode('span', 'tab_changeBarBtn fa fa-angle-double-up')).append('<div class="dy-isSort fa fa-life-ring" title="是否要排序"></div>');
    let toolBarOne = createDomNode('div', 'tab_changeBar');

    let eleJS = createDomNode('span', 'sourceDataBall fa fa-dot-circle-o focusBall');
    $(eleJS).attr('title', '聚焦到源数据球');
    $(toolBarOne).text('源数据').prepend(createDomNode('span', 'tab_changeBarBtn fa fa-angle-double-down')).append(eleJS);
    /***************************************
     * 聚合数据画按钮
     * *************************************/
    let tempData = {};
    jsonData2Array(data, '无数据', function (k, d) {
        let key = k.substring(0, 40);
        if (!tempData.hasOwnProperty(key)) {
            tempData[key] = [];
        }
        tempData[key].push(d);
    });
    data = tempData;
    let keys = Object.keys(data);
    keys.sort();
    let li = '<ul class="chatTabKeys">';
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let active = '';
        let label = "";
        // console.log(key)
        if (allHashKeyName.hasOwnProperty(key.substring(0, 40))) {
            label = searchHighKeys(key).name;
            active = 'active-a'
        } else {
            label = key;
        }
        li += '<li class="jsonListGather ' + active + '" h="' + key + '">' + label + '</li>';
    }
    li += '</ul>';
    // li = '<div class="chatList">' + li + '</div>';
    /***************************************
     * 输入源数据画表格
     * *************************************/
    let chatListDiv = createDomNode('div', 'chatList'),
        objID = '',
        objType = '';
    $(chatListDiv).append(toolBar, li);
    if (paramsData) {
        // console.log(JSON.parse(paramsData));
        // console.log('1212', JSON.parse(paramsData));
        let paramsDataObj = {};
        let paramsdata = JSON.parse(paramsData);
        for (let p of paramsdata) {
            let objId = p.desc,
                objFrom = p.from;
            paramsDataObj[objId] = [];
            for (let f of objFrom) {
                if (f.objectID && f.objectType) {
                    objID = f.objectID;
                    objType = f.objectType;
                }
                paramsDataObj[objId].push(f.value);
            }
            let tempObj = {};
            tempObj[p.desc] = p.id;
            PushobjectoAllHashkeyName(tempObj);
        }
        let tabParams = createDomNode('div', 'tabParamsWrap');

        $(tabParams).append(JsonHuman.format(paramsDataObj))/*.css('height', '0')*/;
        let dataOrigin = createDomNode('div', 'dataOrigin');
        $(dataOrigin).attr('objid', objID).attr('objtype', objType).append(toolBarOne, tabParams);
        return (dataOrigin.outerHTML + chatListDiv.outerHTML);
    }
    return (chatListDiv.outerHTML);
}
/**
 * 创建JSON表格上的导航栏
 * @param data 返回的数据包含resultInfo
 * @param position 判断是否加上回传按钮
 * @return 创建的按钮的HTML
 * */
function createEl(data, position) {
    // console.log(data);
    let eleA = '';
    if (!position) {
        eleA = createDomNode('a', 'translate_data callback-view fa fa-reply');
        $(eleA).attr('title', '回传数据');
    }
    let eleJ = createDomNode('span', 'fa fa-dot-circle-o focusBall');
    $(eleJ).attr('title', '聚焦到数据球');
    let totalSpan = createDomNode('span', 'pageUpSpan'),
        countSpan = createDomNode('span', 'pageUpSpan'),
        pageUp = createDomNode('span', 'pageUpSpan fa fa-angle-left dataPage_up'),
        pageDown = createDomNode('span', 'pageUpSpan fa fa-angle-right dataPage_down');
    $(pageUp).attr('title', '上一页');
    $(pageDown).attr('title', '下一页');
    $(totalSpan).text('总数：').append($('<span>' + data.total + '</span>'));
    $(countSpan).text('已查询：').append($('<span>' + data.retCount + '</span>'));
    let littleBtnBox = createDomNode('div', 'littleBtnBox');
    $(littleBtnBox).append(totalSpan, countSpan, pageUp, pageDown, eleA, eleJ);
    return littleBtnBox.outerHTML;
}
/**
 * 再可视化对球右键添加的Tab
 * @param title 标题
 * @param TabHTMLFromRightClick 名字这么明显就不用解释了
 * @param objectId 当前操作的对象ID
 * */
function AddDataTableUnderD3(title, TabHTMLFromRightClick, objectId) {
    let tempTitle = '<span class="hadCountForTab" data="' + objectId + '">' + title + '</span>',
        $fullTabs = $('#full-tabs');
    if (!tabExist) {
        $(".full-tabs-parent").show().css({height: "100%"});
        $fullTabs.show().css({height: "100%"}).jqxTabs({
            width: '100%',
            showCloseButtons: true,
        });
        tabExist = true;
        $fullTabs.jqxTabs('addLast', tempTitle, TabHTMLFromRightClick);
        $fullTabs.jqxTabs('removeAt', 0);
    } else {
        if (IsDuplicateTabExist(objectId) == false) {
            $fullTabs.jqxTabs('addLast', tempTitle, TabHTMLFromRightClick);
        }
    }
    $("#show_tabs").find(".loader").remove();
    $('.highlight').addClass('active-a').next().addClass('active-a');
    $(".tabBoxForScroll").scroll(function () {
        if ($(this).scrollTop() > 20) {
            $("#back_top").show();
        }
    });
}
var tabExist = false;
var currentId = 0;
var isInMessageWindow = false;

/**
 * loading动画加载创建Dom
 * */
function loadingAnimate() {
    let div = document.createElement('div');
    div.className = 'loader';
    let subDiv = document.createElement('div');
    subDiv.className = 'loader-inner line-scale-pulse-out';
    div.appendChild(subDiv);
    let i = 1;
    while (i < 6) {
        let nothingDiv = document.createElement('div');
        subDiv.appendChild(nothingDiv);
        i++;
    }
    return div;
}
var allHashKeyName = {};
/**
 * 数据整合
 * @param obj 返回需要聚合的数据
 * */
function PushobjectoAllHashkeyName(obj) {
    _.extend(allHashKeyName, obj)
}
/**
 * 汉化能读的数据
 * @param key 需要汉化的key值
 * */
function searchHighKeys(key) {
    // console.log(key.substring(0, 40), allHashKeyName);
    let desc = _.get(allHashKeyName, [key.substring(0, 40), 'desc'], '');

    let tail = key.length > 40 ? key.substring(40) : "";
    // console.log('1', desc, key);
    if (!desc) {
        return {name: key + tail, flag: true, key: key.substring(0, 40)}
    } else {
        return {name: desc + tail, flag: true, key: key.substring(0, 40)}
    }
}
function parseReturn(result) {
    let data = {};
    // data.id = result.redirectID;
    let info = JSON.parse(result.info);

    data.id = info.dataID;
    data.label = result.title;
    data.info = info.data;
    return data;
}
/**
 * 右键查询返回数据添加新Tab
 * @param result 通过API查询返回的数据
 * @param position 判断是否加上回传按钮
 * */
function CreateHTMLFromNodeResultData(result, position) {
    if (!result.data || result.data.length <= 0) {
        return ""
    }
    var d = document.createElement("div");
    var dataobj = JSON.parse(result.data);
    PushobjectoAllHashkeyName(dataobj.header);
    let tempDiv = createDomNode('div', 'tabBoxForScroll');
    $(tempDiv).attr('objectid', result.id);
    //console.log('2121',dataobj.data);
    // let dataKey = Object.keys(dataobj.data)[0];
    //console.log('2121',dataKey,searchHighKeys(dataKey).name);
    // let dataKeyRename = searchHighKeys(dataKey).name;
    let tabledata = JsonHuman.format(dataobj.data);
    $(tempDiv).append($(tabledata));
    let chatListhtml;
    if (!result.params) {
        chatListhtml = anywhereDataList(dataobj.data)
    } else {
        chatListhtml = anywhereDataList(dataobj.data, result.params)
    }
    console.log(JSON.parse(result.params));
    let banner = createEl(dataobj.resultInfo, position); //画Banner
    $(d).append(chatListhtml, banner, tempDiv);
    tips($('.chatTabKeys'), 'li');
    tips($('.jh-type-object-0'), 'th');
    // $(tabledata).prepend($(createDomNode('caption')).text(dataKeyRename));
    return d.innerHTML
}
/**
 * 球右键添加新Tab
 * @param result 球右键返回的数据
 * @param title 球已有Tab的标题
 * @param custom 判断是否自定义
 * @param position
 * */
function renderResultToTableView(result, title, custom, position, details) {
    let mniDiv = $('#message-node-info'),
        tabs = $("#message_tabs");
    let _title = '<span data="' + result.id + '" class="tabForCount" id="tab-' + result.id + '">' + title + '</span>';
    $('#message-node-title').html(_title);
    var dataobj = JSON.parse(result.data);
    AddTabDataCache(dataobj.data, result.id);
    // console.log('121212', dataobj, JSON.parse(result.params));
    PushobjectoAllHashkeyName(dataobj.header);

    //console.log('2121',dataKey,searchHighKeys(dataKey).name);
    // let dataKeyRename = searchHighKeys(dataKey).name;
    let info;
    if (custom) {
        // console.log(dataobj.data)
        info = JsonHuman.format(dataobj.data);
    } else {
        // let dataKey = Object.keys(dataobj.data)[0];
        info = JsonHuman.format(dataobj.data);
    }
    let chatListhtml = anywhereDataList(dataobj.data, result.params);
    let banner = createEl(dataobj.resultInfo, position); //画Banner
    let listAndbanner = chatListhtml + banner;
    if (details) {
        let div = createDomNode('div');
        $(div).append(listAndbanner, $(createDomNode('div', 'tabBoxForScroll')).attr('objectid', result.id).html(info));
        tabs.find(".loader").remove();
        $('.highlight').addClass('active-a').next().addClass('active-a');
        return div.innerHTML;
    }
    mniDiv.html($(createDomNode('div', 'tabBoxForScroll')).attr('objectid', result.id).html(info));
    $(listAndbanner).insertBefore(mniDiv);
    tabs.find(".loader").remove();
    tips($('.chatTabKeys'), 'li');
    tips($('.jh-type-object-0'), 'th');
    // if (!custom) {
    //     $(info).prepend($(createDomNode('caption')).text(dataKeyRename));
    // }
    $('.highlight').addClass('active-a').next().addClass('active-a');
}

/**
 * 这个函数应该废掉了 但是有一处调用 不敢乱动
 * */
function addTab(result) {
    let data = {};
    if (result.json) {
        data = result
    } else {
        data = parseDHandler(result)
    }
    if (returnTabIndex('tab-' + data.id) == null) {
        let title = '<span id="tab-' + data.id + '">' + data.label + '</span>';
        let tDiv = document.createElement('div');
        let infoHtml = JsonHuman.format(data.info);
        $(infoHtml).find(".active-a").each(function () {
            if (!$(this).attr("data-oid")) {
                $(this).attr("data-oid", data.id);
            }
        });
        $(tDiv).html(infoHtml);
        let outHtml = tDiv.innerHTML;

        tDiv = null;
        oTabs.jqxTabs('addFirst', title, outHtml);
        $('.highlight').addClass('active-a').next().addClass('active-a');
    } else {
        setActiveTab(data.id)
    }
    showTabs();
    oTabs.jqxTabs('removeAt', 1);
}

function parseDHandler(d) {
    let data = {};
    data.label = d.label;
    data.id = d.name;
    let info = typeof (d.info.info) === 'string' ? JSON.parse(d.info.info) : d.info.info;
    data.info = typeof (info.nodes[d.name].info) === 'string' ? JSON.parse(info.nodes[d.name].info) : info.nodes[d.name].info;
    return data;
}
// 传入id 激活tab
function setActiveTab(id) {
    let tid = 'tab-' + id;
    let index = returnTabIndex(tid);
    if (index != null) {
        oTabs.jqxTabs('select', index);
        showTabs();
    }
}

function IsDuplicateTabExist(dataid) {
    let liArr = $('#message_tabs').find('li');
    for (let index in liArr) {
        if (liArr.eq(index).find('#' + dataid).length !== 0) {
            return true;
        }
    }
    return false;
}

function returnTabIndex(id) {
    let liArr = $("#full-tabs").find('li');
    for (let index in liArr) {
        if (liArr.eq(index).find('#' + id).length !== 0) {
            return parseInt(index);
        }
    }
    return null
}

function showTabs() {
    $("#message_tabs").show();
}

/**
 * 设置自动化运行
 * @param auto
 */
function setAutoRun(auto, meetingID) {
    if (auto) {
        clearInterval(tempTimer);
        tempTimer = setTimer(5000, meetingID);
        $('#overview_btn').attr('disabled', 'disabled');
        $('#jumpcurrent_btn').attr('disabled', 'disabled');
        $('#selarea_btn').attr('disabled', 'disabled');
        items.remove('timePeriod');
        if ($('.vis-select-time').length != 0) {
            timeline.removeCustomTime('vis-select-time');
            selarea = false
        }
        // 去除选中
        $('.vis-selected').removeClass('vis-selected')
    } else {
        clearInterval(tempTimer);
        $('#overview_btn').removeAttr('disabled');
        $('#jumpcurrent_btn').removeAttr('disabled');
        $('#selarea_btn').removeAttr('disabled');
    }
}

/**
 * 设置定时器
 * @param interval
 * @param meetingID
 * @returns {number}
 */
function setTimer(interval, meetingID) {
    getData(meetingID);
    return window.setInterval(function (meetingID) {
        getData(meetingID);
    }, interval)
}


function getData(meetingID) {
    if (meetingInfo != null && meetingID != -1) {
        setRangeData({lastID: newId, meetingID: meetingInfo.id}, meetingUrl);
    } else if (meetingID !== -1 && typeof(meetingID) != "undefined" && meetingInfo == null) {
        setRangeData({lastID: newId, meetingID: meetingID + ''}, meetingUrl);
    } else {
        setRangeData({lastID: newId, beginTime: beginTime}, initUrl);
    }

    timeline.moveTo(Date.now());
}

function clearSelectedItems(ms) {
    let newArr = [];
    for (let item in ms._data) {
        if ((ms._data[item].className).indexOf('vis-selected') != -1) {
            ms._data[item].className = ms._data[item].className.replace(/vis-selected/g, '');
            newArr.push(ms._data[item]);
        }
    }
    items.update(newArr);
}

/************************************************************************
 *  异步获取信息并设置
 ************************************************************************/
function setRangeData(data, url) {
    if (isQuery) return;
    isQuery = true;
    $.ajax({
        type: "POST",
        url: url + '?token=' + getURLParams('token'),
        data: JSON.stringify(data),
        contentType: "application/json",
        success: successHandler,
        fail: function (err) {
            if (err) {
                isQuery = false;
                console.log(new Error(err))
            }
        }
    });
}

/**
 * 成功处理
 * @param result
 */
function successHandler(result) {
    if (!result || result[0] == null) {
        isQuery = false;
        return
    }

    let index = result.length - 1;
    if (meetingInfo != null) {
        meetingEventParserHandler(result);
        addNodeAndEdge(result);
        init(forceNodes, forceLinks);
        result = result.sort(function (f, s) {
            return f.eventTime - s.eventTime;
        });
    } else {
        index = eventsParserHandler(result);
    }
    newId = result[index].eventID;
    isQuery = false;
    let tabID = getURLParams('tabID');
    if (tabID != null) {
        let data = returnTimelineEventID(tabID);
        addTab(data)
    }

}

function eventsParserHandler(events) {
    let tmp_items = [];
    let events4d3 = [];
    let index;
    for (index in events) {
        let event = events[index];
        if (meetingInfo != null && event.eventType == 0) {
            break;
        }

        // 处理meetingInfo
        if (meetingInfo == null && event.eventType == 0) {
            events4d3.push(event);
            // changeAnimate();
            console.debug(event);
            meetingInfo = JSON.parse(event.info);
            if (location.pathname != '/') {
                $(".single-animent").addClass("single-page-delay").removeClass("z-index");
                $(".svg").addClass("single-page single-page-delay300").addClass("z-index");
                createMemberTable(meetingInfo);
            }
            let style = cssconfig[event.eventType];
            tmp_items.push({
                className: style,
                id: event.eventID,
                title: varconfig[event.eventType],
                start: new Date(parseInt(event.eventTime)),
                description: JSON.stringify(event.info),
                content: JSON.stringify(event),
                type: 'box'
            });

            continue;

        }

        if (meetingInfo != null) {
            events4d3.push(event);
            let style = cssconfig[event.eventType];
            tmp_items.push({
                className: style,
                id: event.eventID,
                title: varconfig[event.eventType],
                start: new Date(parseInt(event.eventTime)),
                description: JSON.stringify(event.info),
                content: JSON.stringify(event),
                type: 'box'
            });
        }
    }
    addNodeAndEdge(events4d3);

    init(forceNodes, forceLinks);

    items.add(tmp_items);
    return index;
}

function meetingEventParserHandler(events) {
    let items = [];
    for (let index in events) {
        let event = events[index];
        let style = cssconfig[event.eventType];
        items.push({
            className: style,
            id: event.eventID,
            title: varconfig[event.eventType],
            start: new Date(parseInt(event.eventTime)),
            description: JSON.stringify(event.info),
            content: JSON.stringify(event),
            type: 'box'
        });

    }
    addSet(items);
}

function descEvent(event) {
    let info = JSON.parse(event.info);
    switch (event.eventType) {
        case '0':
            return info.uname + ' 创建了会战【' + info.name + '】';
        case '1':
            return info.uname + ' 输入了数据【' + info.name + '】';
        case '3':
            return info.desc;
        case '4':
            return info.uname + ' 跳转到【' + info.dname + '】的【' + info.dapiname + '】';
        case '5':
            return info.uname + ' 将结果数据回传';
        case '8':
            return `${ info.uname } 进行了人工业务分析`;
        default:
            return info.uname + ' 进行了操作';
    }
}


function initIndexForShowPage(meetingID) {
    meetingInfo = null;
    newId = 0;
    items.clear();
    auto = true;
    ShowPageClearAll();
    $('#auto_btn').text('停止自动');

    setAutoRun(true, meetingID)
}

function addSet(set) {
    items.add(set);
    if (auto) {
        timeline.focus(set[set.length - 1].id);
    }
}

//对当前数据进行表格绘制
function displayTable(operationData, tableContainer, addClass) {
    console.log(operationData, tableContainer, addClass)
    let setting = {
        editor: false,
        manualColumnResize: true, //改变列宽度
        // manualColumnMove: true,  //移动列
        stretchH: 'all',
        readOnly: true,
        fillHandle: false,
        afterChange: function (change, source) {
            if (source === 'loadData') {
                $('.ht_master > .wtHolder').scrollLeft(9999);
            }
        },
        cells: function (row, col, prop) {
            let cellProperties = {};
            cellProperties.renderer = otherRowRenderer;
            return cellProperties;
        },
        afterSelectionEnd: function (r, c, r2, c2) {
            //console.log('选区事件');
            if (isHeaderMove) return;
            if (c > c2) {
                let tmp = c;
                c = c2;
                c2 = tmp;
            }
            if (r > r2) {
                let tmp = r;
                r = r2;
                r2 = tmp;
            }
            for (let col = c; col <= c2; col++) {
                let colHeader = this.getColHeader(col);

                if (isClickHeader) {
                    if (!isClickAll.hasOwnProperty(colHeader)) {
                        isClickAll[colHeader] = 1;
                    } else if (isClickAll[colHeader] === 1) {
                        isClickAll[colHeader] = 0;
                    } else if (isClickAll[colHeader] === 0) {
                        isClickAll[colHeader] = 1;
                    } else {
                        isClickAll[colHeader] = 1;
                    }
                } else {
                    isClickAll[colHeader] = 2;
                }

                for (let row = r; row <= r2; row++) {
                    let cellData = this.getDataAtCell(row, col);
                    let td = this.getCell(row, col);
                    if (cellData !== null && cellData !== '' && cellData !== undefined) {

                        let key = colHeader + '|' + row;
                        let newCellData = cellData + "|" + row;
                        let hash = $(td).attr('h');
                        let objectId = objectID ? objectID : '不存在';
                        if ($(this.rootElement).parents('.message').length) {
                            objectId = $(this.rootElement).parents('.message').find('.tabDivWrap').children('p').attr('data');
                        }else if ($(this.rootElement).parents('.message-tabs').length) {
                            objectId = $(this.rootElement).parents('.message-tabs').find('#message-node-title').children().attr('data');
                        }
                        if (isClickAll[colHeader] === 1) {  //全选
                            $(td).addClass('table-td-isClick');
                            if (!tableCellIsClick.hasOwnProperty(key)) {
                                tableCellIsClick[key] = cellData;
                            }
                            if (!missionRoomRightClick.selectDataMap.hasOwnProperty(colHeader)) {
                                missionRoomRightClick.selectDataMap[colHeader] = {
                                    h: hash,
                                    o: objectId,
                                    v: []
                                };
                            }
                            if (!missionRoomRightClick.selectDataMap[colHeader].v.includes(newCellData)) {
                                missionRoomRightClick.selectDataMap[colHeader].v.push(newCellData);
                            }


                        } else if (isClickAll[colHeader] === 0) { //全不选
                            $(td).removeClass('table-td-isClick');
                            if (tableCellIsClick.hasOwnProperty(key)) {
                                delete tableCellIsClick[key];
                            }

                            if (missionRoomRightClick.selectDataMap.hasOwnProperty(colHeader)) {
                                let index = missionRoomRightClick.selectDataMap[colHeader].v.indexOf(newCellData);
                                if (index !== -1) missionRoomRightClick.selectDataMap[colHeader].v.splice(index, 1);
                                if (missionRoomRightClick.selectDataMap[colHeader].length === 0) delete missionRoomRightClick.selectDataMap[colHeader];
                            }


                        } else { //反选
                            $(td).toggleClass('table-td-isClick');
                            if (!tableCellIsClick.hasOwnProperty(key)) {
                                tableCellIsClick[key] = cellData;
                            }
                            else {
                                delete tableCellIsClick[key];
                            }

                            if (!missionRoomRightClick.selectDataMap.hasOwnProperty(colHeader)) {
                                missionRoomRightClick.selectDataMap[colHeader] = {
                                    h: hash,
                                    o: objectId,
                                    v: []
                                };
                            }
                            if (!missionRoomRightClick.selectDataMap[colHeader].v.includes(newCellData)) {
                                missionRoomRightClick.selectDataMap[colHeader].v.push(newCellData);
                            } else {
                                let index = missionRoomRightClick.selectDataMap[colHeader].v.indexOf(newCellData);
                                if (index !== -1) missionRoomRightClick.selectDataMap[colHeader].v.splice(index, 1);
                                if (missionRoomRightClick.selectDataMap[colHeader].length === 0) delete missionRoomRightClick.selectDataMap[colHeader];
                            }
                        }

                    }
                }

            }

            // getClickCell(sendObj);
            sendCellValue(missionRoomRightClick.selectDataMap);

        },
        afterOnCellMouseDown: function (MouseEvent, WalkontableCellCoords) {
            //console.log('mousedown事件',arguments);

            if (WalkontableCellCoords.row === -1) {
                let colHeader = this.getColHeader(WalkontableCellCoords.col);
                el.data(colHeader, true);

                isClickHeader = true;

            } else {

                isClickHeader = false;
            }

        },
        beforeColumnMove: function () {
            //console.log('afterColumnMove :',arguments);
            isHeaderMove = true;
        }

    };
    //创建table节点
    let el = $('<div class="table-json">');  //虚拟dom

    el.appendTo(tableContainer);

    //添加源数据
    if (!$(tableContainer).data().hasOwnProperty('tableJsonData')) {
        $(tableContainer).data('tableJsonData', {});
    }
    let tableJsonData = $(tableContainer).data('tableJsonData');
    //添加点击标记
    if (!$(tableContainer).data().hasOwnProperty('tableCellIsClick')) {
        $(tableContainer).data('tableCellIsClick', {});
    }
    let tableCellIsClick = $(tableContainer).data('tableCellIsClick');
    //添加高亮标记
    if (!$(tableContainer).data().hasOwnProperty('tableCollHeightLight')) {
        $(tableContainer).data('tableCollHeightLight', []);
    }
    let tableCollHeightLight = $(tableContainer).data('tableCollHeightLight');
    //添加表头点击状态
    if (!$(tableContainer).data().hasOwnProperty('isClickAll')) {
        $(tableContainer).data('isClickAll', {});
    }
    let isClickAll = $(tableContainer).data('isClickAll'); //标记是否全选： 全选1，全不选0，反选 ..
    let isClickHeader;
    //配置表格数据
    setting.data = addDataToTable(operationData);
    setting.colHeaders = setting.data.shift().map(function (value, index) {
        return searchHighKeys(value).name;
    });
    //表格渲染
    el.handsontable(setting);
    let hot = el.handsontable('getInstance');
    // $(tableContainer).find('.table-json').eq(0).remove();
    if ($(tableContainer).find('.table-json').length === 2) {
        $(tableContainer).find('.table-json').eq(0).remove();
    }
    //表头节点添加属性
    let keys = Object.keys(tableJsonData).forEach(function (value, index) {
        el.find('.ht_clone_top th').eq(index).attr('h', value);
        el.find('.ht_clone_top th .relative').eq(index).addClass('info-number').attr('data-content', tableJsonData[value].length);
    });

    //添加表格导出数据
    let tableDataExport = hot.getData();
    tableDataExport.unshift(setting.colHeaders);
    $(tableContainer).data('tableDataExport', tableDataExport);

    let isHeaderMove = false;

    function otherRowRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        let colHeader = instance.getColHeader(col);
        let key = colHeader + '|' + row;
        let colVal = value + '|' + row;

        // if (tableCellIsClick.hasOwnProperty(key)) {
        //     $(td).addClass('table-td-isClick');
        // }
        if (tableCollHeightLight.includes(colHeader)) {
            let colHeader = instance.getColHeader(col);

            let hash = Object.keys(tableJsonData).find(function (value, index) {
                return searchHighKeys(value).name === colHeader;
            });

            $(td).addClass('active-a').attr('h', hash);
        }
        if (missionRoomRightClick.selectDataMap.hasOwnProperty(colHeader)) {
            if (missionRoomRightClick.selectDataMap[colHeader].v.includes(colVal)) {
                $(td).addClass('table-td-isClick');
            }
        }
    }

    function addDataToTable(data) { //data为 1.obj {K:[v1,v2, ...]} 表示添加数据 2.array [k1,k2, ...] 表示删除数据
        //console.log(data);
        if (Object(data) === data && !Array.isArray(data)) { //添加数据
            for (let key in data) {
                if (tableJsonData.hasOwnProperty(key)) { //表示table中已有该字段 做插入操作处理

                } else {
                    tableJsonData[key] = data[key];
                }
                if (addClass) {
                    tableCollHeightLight.push(searchHighKeys(key).name);
                }
            }
        }
        if (Array.isArray(data)) { //做删除操作 数组中是要删除的字段
            for (let value of data) {
                if (tableJsonData.hasOwnProperty(value)) {
                    delete tableJsonData[value];
                } else {
                    alert('该字段不在表格中！');
                }
            }
        }
        //将数据转换成table数组
        let tableArr = [];
        let row = 0;
        for (let k in tableJsonData) {
            if (Array.isArray(tableJsonData[k])) {
                let l = tableJsonData[k].length;
                if (row < l) row = l;

            }
        }
        for (let i = 0; i < row; i++) {
            let rowData = [];
            for (let k in tableJsonData) {
                rowData.push(tableJsonData[k][i]);
            }
            tableArr[i] = rowData;
        }
        tableArr.unshift(Object.keys(tableJsonData));
        return tableArr;
    }

    //
    function getClickCell(clickJson) {

        for (let key in clickJson) {
            let reKey = key.split('|').shift();
            let row = key.split('|').pop();
            if (!missionRoomRightClick.selectDataMap.hasOwnProperty(reKey)) {
                missionRoomRightClick.selectDataMap[reKey] = [];
            }
            let newValue = clickJson[key] + '|' + row;
            let index = missionRoomRightClick.selectDataMap[reKey].indexOf(newValue);
            if (index !== -1) {
                missionRoomRightClick.selectDataMap[reKey].splice(index, 1);
                if (missionRoomRightClick.selectDataMap[reKey].length === 0)
                    delete missionRoomRightClick.selectDataMap[reKey];
            } else {
                missionRoomRightClick.selectDataMap[reKey].push(newValue);
            }

        }

    }
}
function sendCellValue(dataJson) {
    console.log(dataJson);
    let _ul = $('#floarUl');
    _ul.children().remove();
    let $selectde = $('#selected_obj');
    if ($selectde.css('display') === 'block') {
        $selectde.addClass('changeOpacity');
    }
    $selectde.show();
    let div = $('body');
    if (div.find('.floatdivRightclick').length == 0) {
        let floatdivRightclick = $('<div></div>').addClass('floatdivRightclick').attr('id', 'float_rightclick'),
            p = $('<p></p>').attr('id', 'tempid').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;选中对象'),
            close = $('<span></span>').attr('id', 'closeFloatdiv').addClass('fa fa-close'),
            minus = $('<span></span>').attr('id', 'minusFloatdiv').addClass('fa fa-minus'),
            ul = $('<ul></ul>').attr('id', 'floarUl');
        floatdivRightclick.append(p, close, minus, ul, '<div id="floatdivFooter"><span id="floatdivClose">取消</span><span id="floatdivSend">发送</span></div>');
        div.append(floatdivRightclick);
        $('#floatdivClose').click(function () {
            $('#minusFloatdiv').trigger('click');
        });
        $('#floatdivSend').click(function () {

        });
    }
    for (let i in dataJson) {
        let tempJson = {};
        tempJson[i] = dataJson[i];
        let div1 = document.createElement('div'),
            div2 = document.createElement('div'),
            li = document.createElement('li'),
            heightCount = 1,
            tempI = i;
        $(li).append($(div1).addClass('toggleC firstDiv')).append($(div2).addClass('toggleC lastDiv'));
        div1.innerHTML = tempI;
        $(div1).attr('h', dataJson[tempI].h).attr('o',dataJson[tempI].o);
        if (Array.isArray(dataJson[tempI].v)) {
            for (let j of dataJson[tempI].v) {
                let subdiv = document.createElement('div');
                $(subdiv).text(j);
                div2.appendChild(subdiv);
            }
            heightCount = dataJson[tempI].v.length;
        } else {
            $(div2).text(dataJson[tempI].v);
        }
        div.find('.floatdivRightclick').find('ul').append($(li));
        $(div2).addClass('active-a').height(heightCount * 21);
        $(div1).attr('data', JSON.stringify(tempJson)).height(heightCount * 21).css('line-height', heightCount * 21 + 'px');
    }
    DragFloatTab('tempid');
    // if (($selectde.css('display') == 'none') && ($('#float_rightclick').css('display') == 'none')) {
    //
    // }
    if ($('#floarUl').children().length === 0) $selectde.removeClass('changeOpacity').hide();
    // _ul.scrollTop(_ul[0].scrollHeight);
    $('#floarUl').scrollTop($('#floarUl')[0].scrollHeight);
}
var TabDataCache = [];
/**
 * 球数据存储
 * @param data 请求的数据用作扁平化
 * @param id 记录map中的ID
 * */
// function AddTabDataCache(data, id) {
//     let temp1data = data;
//     let tempData = {};
//     jsonData2Array(temp1data, '无数据', function (k, d) {
//         let key = k.substring(0, 40);
//         if (!tempData.hasOwnProperty(key)) {
//             tempData[key] = []
//         }
//         tempData[key].push(d);
//     });
//     if (!missionRoomRightClick.rightClickBallData[id]) {
//         missionRoomRightClick.rightClickBallData[id] = tempData;
//     }
//     // TabDataCache.push(tempData)
// }
function AddTabDataCache(data, id) {
    let temp1data = data;
    let tempData1 = {};
    let tempData2 = {};
    jsonData2Array(temp1data, '无数据', function (k, d) {
        let key = k.substring(0, 40);
        if (!tempData1.hasOwnProperty(key)) {
            tempData1[key] = []
        }
        tempData1[key].push(d);
    });
    if (Array.isArray(data)) {
        jsonData3Array(data, tempData2);
    } else {
        tempData2 = jsonData3Object(tempData1);
    }
    if (!missionRoomRightClick.rightClickBallData[id]) {
        missionRoomRightClick.rightClickBallData[id] = {tempData1: tempData1, tempData2: tempData2};
    }
    // TabDataCache.push(tempData)
}


// function RmTabDataCache(dataIndex) {
//     if (TabDataCache.length > 0) {
//         TabDataCache.splice(dataIndex, 1)
//     }
// }
function removeTableClickMark(json) {
    let tables = $('.tabBoxForScroll > .table-json');
    tables.each(function () {
        let hot = $(this).handsontable('getInstance');
        let tableCellIsClick = $(this).parent().data('tableCellIsClick');

        if (Object.keys(json).length && tableCellIsClick) {
            for (let key in json) {
                console.log(json[key]);
                if ($.isArray(json[key])) {
                    for (let val of json[key]) {
                        let arr = val.split('|');
                        let newKey = key + "|" + arr[1];
                        let value = arr[0];

                        if (tableCellIsClick.hasOwnProperty(newKey) && tableCellIsClick[newKey] === value) {
                            delete tableCellIsClick[newKey];
                            let tableHeader = hot.getSettings().colHeaders;
                            let index = tableHeader.indexOf(key);
                            let td = hot.getCell(arr[1], index);
                            if ($(td).hasClass('table-td-isClick')) {
                                $(td).removeClass('table-td-isClick');
                            }
                        }
                    }
                }

            }
        }
    });
}

/**
 * 创建Dom节点
 * @param nodeName 节点类型
 * @param nodeClass 节点class
 * @param nodeId 节点ID
 * */
function createDomNode(nodeName, nodeClass, nodeId) {
    let element = document.createElement(nodeName);
    element.className = nodeClass || '';
    element.setAttribute('id', nodeId || '');
    return element;
}