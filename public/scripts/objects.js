$(document).ready(function () {
    var data = configObjData;
    // 初始化表格容器
    $('#otherGrid').jqxGrid({
        width: '98%',
        height: '98%',
        sortable: true,
        autoshowfiltericon: false,
        autoshowloadelement: false,
        columnsresize: true,
        altrows: true,
        columns: [
            {text: '类型', datafield: 'label', width: '20%'},
            {text: '发送人', datafield: 'sendUserName', width: '30%'},
            {text: '时间', datafield: 'sendTime', cellsformat: 'yyyy-MM-dd', width: '30%'},
            {
                text: '详情', datafield: 'value', width: '20%', filterable: false,
                cellsrenderer: function (row, columnfield, value) {
                    var cell = $('<div class="getObjectInfo">详情</div>');
                    cell.jqxButton({width: '100%', height: '100%'});
                    return cell[0].outerHTML;
                },
            }
        ]
    });

    // 显示容器
    $('#otherContainer').show();

    // $('#otherGrid').on('rowclick', function (event) {
    //     let args = event.args;
    //
    //     if (args.rightclick) {
    //         let value = JSON.parse(args.row.bounddata.value);
    //
    //         let typeName = value.type;
    //         currentRightSelectedStandardObj = {};
    //         for (let i = 0; i < getIdsByTypeName(typeName).length; i++) {
    //             if (value.hasOwnProperty(getIdsByTypeName(typeName)[i])) {
    //                 currentRightSelectedStandardObj[getIdsByTypeName(typeName)[i]] = value[getIdsByTypeName(typeName)[i]];
    //             }
    //         }
    //         // console.log('debug', getIdsByTypeName(typeName))
    //         let params = {
    //             params: JSON.stringify(getIdsByTypeName(typeName)),
    //             type: 'all'
    //         };
    //         let labels = [];
    //         for (let key of getIdsByTypeName(typeName)) {
    //             let jsonstr = "{\"" + key + "\":\"" + value[key] + "\"}";
    //             labels.push(JSON.parse(jsonstr));
    //         }
    //
    //         let api = new missionClient.ConfigApi();
    //         let opts = {'authorization': getURLParams('token')};
    //         api.getApiConfig(labels, opts).then(function (res) {
    //             if (res.ri.rc === 0) {
    //                 console.log(res.ri.msg);
    //                 return;
    //             }
    //             let result = res.d;
    //             if (!result || result.length <= 0) return;
    //             let c = null;
    //
    //             if (!c) {
    //                 c = $("#jqxMenu_object").jqxMenu({
    //                     source: [],
    //                     width: "170px",
    //                     keyboardNavigation: "true",
    //                     autoOpenPopup: false,
    //                     mode: 'popup',
    //                     rtl: true,
    //                     showTopLevelArrows: true,
    //                     animationShowDelay: 10,
    //                     animationShowDuration: 50,
    //                     animationHideDuration: 1,
    //                     autoCloseOnClick: true,
    //                     theme: "meeting"
    //                 });
    //
    //                 var scrollTop = $(window).scrollTop();
    //                 var scrollLeft = $(window).scrollLeft();
    //                 // let $x = $(args.originalEvent.target).width() + scrollLeft + 15;
    //                 // if ($(this).parent().parent().parent().hasClass("m-message") || $(this).parent().parent().hasClass("m-message")) {
    //                 //     $("#jqxMenu_object").jqxMenu('rtl', true);
    //                 //     $x = -$("#jqxMenu_object").width();
    //                 // } else {
    //                 //     $("#jqxMenu_object").jqxMenu('rtl', false);
    //                 // }
    //                 $('.rightmenuapi ul').children().remove();
    //                 c.jqxMenu('source', getSource(result));
    //                 // if ($("#jqxMenu_object").jqxMenu('rtl') == false) {
    //                 //     $(".jqx-menu-dropdown").find("e").css({"float": "right"});
    //                 // } else {
    //                 //     $(".jqx-menu-dropdown").find("e").css({"float": "left"});
    //                 // }
    //
    //                 c.jqxMenu('open', parseInt(args.originalEvent.clientX) + 5 + scrollLeft, parseInt(args.originalEvent.clientY) + 5 + scrollTop);
    //             }
    //             $('#jqxMenu_object').on('itemclick', function (event) {
    //                 var element = event.args;
    //                 let titleText = $($(element).children()[0]).text();
    //                 if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
    //                 var sendApi = {};
    //                 let sendTab = {};
    //                 let $params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\"")).parameters;
    //                 for (let iv of $params) {
    //                     let value = null;
    //                     for (let e in currentRightSelectedStandardObj) {
    //                         if (e == iv.name) {
    //                             value = currentRightSelectedStandardObj[e];
    //                             break;
    //                         }
    //                     }
    //                     if (!value) continue;
    //                     if (!sendApi[iv.in]) {
    //                         sendApi[iv.in] = {};
    //                     }
    //                     if (iv.type == 'item') {
    //                         sendApi[iv.in][iv.name] = [value];
    //                         sendTab[iv.name] = [value];
    //                     } else {
    //                         sendApi[iv.in][iv.name] = value;
    //                         sendTab[iv.name] = value;
    //                     }
    //                 }
    //                 console.debug(sendTab);
    //
    //                 var params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
    //                 var apitype = [];
    //                 $(element).parent().children().each(function () {
    //                     if (JSON.parse($(this).attr("item-value").replace(/'/g, "\"")).required == "true") {
    //                         apitype.push(JSON.parse($(this).attr("item-value").replace(/'/g, "\"")).type);
    //                     }
    //                 });
    //                 $(".rightmenuapi").show().find("ol").children().remove();//清除上一次缓存
    //                 $(".rightmenuapi").show().find("ul").children().remove();//清除上一次缓存
    //                 for (e of labels) {//循环画出参数表
    //                     for (let key in e) {
    //                         if (_.indexOf(apitype, e.id) >= 0) {//判断是不是必填项
    //                             $(".rightmenuapi ul").append("<li><span class='elabel'>" + key + ":</span><e class='bdline'></e><input class='apiinput' type='text' value='" + e[key] + "'></li>");
    //
    //                         } else {
    //                             $(".rightmenuapi ul").append("<li><span class='elabel'>" + key + ":</span><input class='apiinput' type='text' value='" + e[key] + "'></li>");
    //                         }
    //                         $(".rightmenuapi ol").append("<li><span class='elabel'>" + key + ":</span><span class='eval'>" + e[key] + "</span></li>");
    //                     }
    //                 }
    //                 //判断必填项对应的输入款是否为空
    //
    //                 $(".rightmenuapi ul").append("<li><span class='api-send'>发送</span><span class='api-close'>取消</span></li>")
    //                     .css({"margin-top": (-$(".rightmenuapi ul").height())});
    //                 $(".rightmenuapi ol").css({
    //                     "top": $(".rightmenuapi ul").offset().top,
    //                     "left": $(".rightmenuapi ul").offset().left - $(".rightmenuapi ol").width() - 5
    //                 });
    //                 $(".eval").click(function () {
    //                     let text = $(this).text();
    //                     let index = $(this).parent().index();
    //                     // if($(".rightmenuapi>ul>li").eq(index).find("input").val() == ""){
    //                     $(".rightmenuapi>ul>li").eq(index).find("input").val(text);
    //                     // }
    //                 });
    //                 $(".api-close").click(function () {
    //                     $(".rightmenuapi").hide();
    //                 });
    //                 $(".apiinput").focus(function () {
    //                     let i = $(this).parent().index();
    //                     $(".rightmenuapi>ol>li").eq(i).css({"background": "#007ACC"}).siblings().css({"background": "#64686d"});
    //                 });
    //                 $(".api-send").click(function () {
    //                     var apiFlag = true;
    //                     $(this).parent().parent().find("e").each(function () {
    //                         if ($(this).parent().find("input").val() == "") {
    //                             $(this).parent().find("input").focus();
    //                             apiFlag = false;
    //                         }
    //                     });
    //                     var objectID = 'object-' + value.type + '-' + value.meetingID + '-' + value.messageID + "-" + value.userID + '-' + value.objectId;
    //                     var redirectID = {
    //                         meetingID: mission.roomID,
    //                         meetingName: mission.roomName,
    //                         objectID: objectID,
    //                         type: "standardobject"
    //                     };
    //                     redirectID = JSON.stringify(redirectID);
    //                     if (params.type == "api") {
    //                         var url = 'http://' + params.url;
    //                         var method = params.method.toLowerCase();
    //                         var token = getURLParams("token");
    //                         // console.log('url', encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID))
    //                         url = encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID);
    //                         $.getJSON(url, {}, function (data) {
    //                             // $('.translate_data>a').eq(0).data('info', data);
    //                             $('#meeting_tab').jqxTabs('select', 1);
    //                             let resultData = JSON.parse(data.info);
    //                             console.log(resultData);
    //                             resultData.objectID = resultData.dataID;
    //                             data.json = true;
    //                             dataPresentation();
    //                             let nodeinfo = JsonHuman.format(sendTab).outerHTML;
    //                             let title = titleText;
    //                             let objectid = objectID;
    //                             $(".full-tabs-parent").show('fast', function () {
    //                                 AddNewNodeInfo(title, nodeinfo, objectid, data);
    //                                 insertAtAnyWhere(data);
    //                             }).css({height: "100%"});
    //                         });
    //                         // window.open(encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID));
    //                     }
    //                     $(".rightmenuapi").hide();
    //                 });
    //             });
    //         }, function (error) {
    //             console.error(error);
    //         });
    //         /*            $.when($.getJSON('/register?token=' + getURLParams('token') + '&' + Date.now(), params))
    //          .done(function (res) {
    //          let result = res.data;
    //          if (!result || result.length <= 0) return;
    //          let c = null;
    //
    //          if (!c) {
    //          c = $("#jqxMenu_object").jqxMenu({
    //          source: [],
    //          width: "170px",
    //          keyboardNavigation: "true",
    //          autoOpenPopup: false,
    //          mode: 'popup',
    //          rtl: true,
    //          showTopLevelArrows: true,
    //          animationShowDelay: 10,
    //          animationShowDuration: 50,
    //          animationHideDuration: 1,
    //          autoCloseOnClick: true,
    //          theme: "meeting"
    //          });
    //
    //          var scrollTop = $(window).scrollTop();
    //          var scrollLeft = $(window).scrollLeft();
    //          // let $x = $(args.originalEvent.target).width() + scrollLeft + 15;
    //          // if ($(this).parent().parent().parent().hasClass("m-message") || $(this).parent().parent().hasClass("m-message")) {
    //          //     $("#jqxMenu_object").jqxMenu('rtl', true);
    //          //     $x = -$("#jqxMenu_object").width();
    //          // } else {
    //          //     $("#jqxMenu_object").jqxMenu('rtl', false);
    //          // }
    //          $('.rightmenuapi ul').children().remove();
    //          c.jqxMenu('source', getSource(result));
    //          // if ($("#jqxMenu_object").jqxMenu('rtl') == false) {
    //          //     $(".jqx-menu-dropdown").find("e").css({"float": "right"});
    //          // } else {
    //          //     $(".jqx-menu-dropdown").find("e").css({"float": "left"});
    //          // }
    //
    //          c.jqxMenu('open', parseInt(args.originalEvent.clientX) + 5 + scrollLeft, parseInt(args.originalEvent.clientY) + 5 + scrollTop);
    //
    //
    //          }
    //
    //          $('#jqxMenu_object').on('itemclick', function (event) {
    //          var element = event.args;
    //          let titleText = $($(element).children()[0]).text();
    //          if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
    //          var sendApi = {};
    //          let sendTab = {};
    //          let $params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\"")).parameters;
    //          for (let iv of $params) {
    //          let value = null;
    //          for (let e in currentRightSelectedStandardObj) {
    //          if (e == iv.name) {
    //          value = currentRightSelectedStandardObj[e];
    //          break;
    //          }
    //          }
    //          if (!value) continue;
    //          if (!sendApi[iv.in]) {
    //          sendApi[iv.in] = {};
    //          }
    //          if (iv.type == 'item') {
    //          sendApi[iv.in][iv.name] = [value];
    //          sendTab[iv.name] = [value];
    //          } else {
    //          sendApi[iv.in][iv.name] = value;
    //          sendTab[iv.name] = value;
    //          }
    //          }
    //          console.debug(sendTab);
    //
    //          var params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
    //          var apitype = [];
    //          $(element).parent().children().each(function () {
    //          if (JSON.parse($(this).attr("item-value").replace(/'/g, "\"")).required == "true") {
    //          apitype.push(JSON.parse($(this).attr("item-value").replace(/'/g, "\"")).type);
    //          }
    //          });
    //          $(".rightmenuapi").show().find("ol").children().remove();//清除上一次缓存
    //          $(".rightmenuapi").show().find("ul").children().remove();//清除上一次缓存
    //          for (e of labels) {//循环画出参数表
    //          for (let key in e) {
    //          if (_.indexOf(apitype, e.id) >= 0) {//判断是不是必填项
    //          $(".rightmenuapi ul").append("<li><span class='elabel'>" + key + ":</span><e class='bdline'></e><input class='apiinput' type='text' value='" + e[key] + "'></li>");
    //
    //          } else {
    //          $(".rightmenuapi ul").append("<li><span class='elabel'>" + key + ":</span><input class='apiinput' type='text' value='" + e[key] + "'></li>");
    //          }
    //          $(".rightmenuapi ol").append("<li><span class='elabel'>" + key + ":</span><span class='eval'>" + e[key] + "</span></li>");
    //          }
    //          }
    //          //判断必填项对应的输入款是否为空
    //
    //          $(".rightmenuapi ul").append("<li><span class='api-send'>发送</span><span class='api-close'>取消</span></li>")
    //          .css({"margin-top": (-$(".rightmenuapi ul").height())});
    //          $(".rightmenuapi ol").css({
    //          "top": $(".rightmenuapi ul").offset().top,
    //          "left": $(".rightmenuapi ul").offset().left - $(".rightmenuapi ol").width() - 5
    //          });
    //          $(".eval").click(function () {
    //          let text = $(this).text();
    //          let index = $(this).parent().index();
    //          // if($(".rightmenuapi>ul>li").eq(index).find("input").val() == ""){
    //          $(".rightmenuapi>ul>li").eq(index).find("input").val(text);
    //          // }
    //          });
    //          $(".api-close").click(function () {
    //          $(".rightmenuapi").hide();
    //          });
    //          $(".apiinput").focus(function () {
    //          let i = $(this).parent().index();
    //          $(".rightmenuapi>ol>li").eq(i).css({"background": "#007ACC"}).siblings().css({"background": "#64686d"});
    //          });
    //          $(".api-send").click(function () {
    //          var apiFlag = true;
    //          $(this).parent().parent().find("e").each(function () {
    //          if ($(this).parent().find("input").val() == "") {
    //          $(this).parent().find("input").focus();
    //          apiFlag = false;
    //          }
    //          });
    //          var objectID = 'object-' + value.type + '-' + value.meetingID + '-' + value.messageID + "-" + value.userID + '-' + value.objectId;
    //          var redirectID = {
    //          meetingID: mission.roomID,
    //          meetingName: mission.roomName,
    //          objectID: objectID,
    //          type: "standardobject"
    //          };
    //          redirectID = JSON.stringify(redirectID);
    //          if (params.type == "api") {
    //          var url = 'http://' + params.url;
    //          var method = params.method.toLowerCase();
    //          var token = getURLParams("token");
    //          // console.log('url', encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID))
    //          url = encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID);
    //          $.getJSON(url, {}, function (data) {
    //          // $('.translate_data>a').eq(0).data('info', data);
    //          $('#meeting_tab').jqxTabs('select', 1);
    //          let resultData = JSON.parse(data.info);
    //          console.log(resultData);
    //          resultData.objectID = resultData.dataID;
    //          data.json = true;
    //          dataPresentation();
    //          let nodeinfo = JsonHuman.format(sendTab).outerHTML;
    //          let title = titleText;
    //          let objectid = objectID;
    //          $(".full-tabs-parent").show('fast',function () {
    //          AddNewNodeInfo(title, nodeinfo, objectid, data);
    //          insertAtAnyWhere(data);
    //          }).css({height: "100%"});
    //          });
    //          // window.open(encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID));
    //          }
    //          $(".rightmenuapi").hide();
    //          });
    //          });
    //          });*/
    //         return false;
    //     }
    // });

    function getIdsByTypeName(typeName) {
        let ids = [];
        let elements = [];
        for (let index in data) {
            let config = data[index];
            if (config.id === typeName) {
                elements = config.elements;
                break
            }
        }
        for (let element of elements) {
            ids.push(element.id);
        }
        return ids;
    }


    $('#otherGrid').on('columnclick', function (event) {

    });

    $(document.body).append('<div id="itemInfo"><div id="itemContent"></div></div>');
    $('#otherGrid').on("cellclick", function (event) {
        if (event.args.datafield !== 'value') return;
        let objectId = event.args.value;
        let objectApi = new missionClient.ObjectApi();
        let opts = {
            'authorization': 'JWT' + getURLParams('token') // String | token字串
        };
        objectApi.getObjectsDetail(objectId, opts).then(function (data) {
            console.log('API called successfully. Returned data: ' + JSON.stringify(data));
            let oHtml = '<div id=""><table class="objInfoTable">';
            let objData = JSON.parse(data.d.data);
            _.forEach(objData.params, (val) => {
                oHtml += '<tr><td>' + val.label + '</td><td>' + val.value + '</td></tr>'
            });
            oHtml += '</table></div>';
            $('#itemInfo').jqxPopover({
                offset: {left: 0, top: 0},
                isModal: false,
                arrowOffsetValue: 0,
                position: 'left',
                title: '[' + data.d.type + ']的详细信息',
                showCloseButton: true,
                selector: event.args.originalEvent.target,
                width: 300
            });
            $('#itemContent').html(oHtml);
        }, function (error) {
            throw error
        }).catch(error => {
            console.log(error);
            //todo handle this
        });

        // var args = event.args;
        // var datafield = args.datafield;
        // var standardobject, id;
        // if (datafield.toUpperCase() === 'VALUE') {
        //     standardobject = JSON.parse(args.value),
        //         id = standardobject.id;
        // }
        //'object-' + standardObj.type + '-' + meetingID + '-' + messageID + '-' + sendUserID + '-' + standardObj.objectId
        // function callBack(data, err) {
        //     if (err) {
        //         console.log(err)
        //     }
        //     if (data && data.length) {
        //         data = data[0].data;
        //         data.label = (configObjDataInfo[data.type] && configObjDataInfo[data.type].label) || data.type;
        //         var type = data.type;
        //         var oHtml = '<div id=""><table class="objInfoTable">';
        //         for (var obj in data) {
        //             var text = matchType(obj, type);
        //             if (obj != 'sendTime' && obj != 'id' && obj != 'userID'
        //                 && obj != 'type' && obj != 'messageID' && obj != 'meetingID' && obj != 'objectId' && obj != 'objectName' && obj != 'label') {
        //                 oHtml += '<tr><td>' + text + '</td><td>' + data[obj] + '</td></tr>'
        //             } else if (obj == 'sendTime') {
        //                 var time = new Date(parseInt(data[obj]));
        //                 oHtml += '<tr><td>' + text + '</td><td>' + time.toLocaleString() + '</td></tr>'
        //             }
        //         }
        //         oHtml += '</table></div>';
        //         $('#itemInfo').jqxPopover({
        //             offset: {left: 0, top: 0},
        //             isModal: false,
        //             arrowOffsetValue: 0,
        //             position: 'left',
        //             title: '[' + data.label + ']的详细信息',
        //             showCloseButton: true,
        //             selector: args.originalEvent.target,
        //             width: 300
        //         });
        //         $('#itemContent').html(oHtml)
        //     }
        // }
        //
        // getObjectList([id], callBack);
    });

    function matchType(label, type) {
        for (var key in data.entries) {
            var id = data.entries[key].id;
            var desc = data[id];
            if (desc.id === type) {
                // 取得对应的对象描述
                var elements = desc.elements;
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].id === label) {
                        return elements[i].label
                    } else if (label === 'label') {
                        return '类型'
                    } else if (label === 'sendUserName') {
                        return '发送者'
                    } else if (label === 'sendTime') {
                        return '发送时间'
                    }
                }
            }
        }
        return label
    }

    //系统内现有对象筛选按钮绑定点击事件
    $('#otherInput').on('select', inputSelect);
    // 绑定搜索事件
    $('#otherSearch').click(function () {
        var searchText = $('#otherInput').val();
        if (searchText.length > 0) {
            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var filtervalue = searchText;
            var filtercondition = 'contains';
            var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);

            $('#otherGrid').jqxGrid('addfilter', 'sendUserName', filtergroup);
            // 调用过滤器
            $('#otherGrid').jqxGrid('applyfilters')
        }

    });


    $('#otherGrid').on('filter', gridFilter);
    $('#otherSearchList').on('filter', gridFilter);
    // 获取信息后执行操作


    // 高级搜索
    $('#popoverOther').jqxPopover({
        offset: {left: -10, top: 30},
        isModal: true,
        arrowOffsetValue: 5,
        position: 'left',
        title: '添加条件',
        showCloseButton: true,
        width: '50%',
        selector: $('#mutilConditionSearch')
    });
    //选择类型
    // 点击按钮进行初始化
    $('#mutilConditionSearch').click(function () {
        // 初始化对象
        var objectHtml = '';
        for (key in data.entries) {
            var entry = data.entries[key];
            var objEntry = data[data.entries[key].id];
            objectHtml += '<div class="typeCheckBox" data-id="' + entry.id + '" data-type="' + objEntry.id + '">' + entry.name + '</div>'
        }

        $('#otherConditionType').html(objectHtml);

        $('.typeCheckBox').jqxCheckBox({groupName: 'type'}).on('change', typeChange);
        $('.typeBtn').jqxButton({
            width: '95px',
            height: '24px',
        });

        //点击搜索
        $('#typeConditionSearch').on('click', conditionSearch)
    });
    // 关闭弹出框，把弹出框内容初始化
    $('#popoverOther').on('close', function () {
        $('.typeCheckBox').jqxCheckBox({checked: false});
        $('#otherConditionType').show(100);
        $('#otherConditionContainer').html('');
        $('.typeBtn').hide(100);
        $('#otherConditionGrid').hide(100)
    });


// 选择类型
    function typeChange(event) {
        var args = event.args;
        if (args.checked === true) {
            $('#otherConditionType').hide();
            $('#typeSelectBtn').show(100).click(function () {
                $('#otherConditionType').show(100);
                $('.typeCheckBox').jqxCheckBox({checked: false});
                $('#otherConditionContainer').hide(100);
                $('.typeBtn').hide(100);
                $('#otherConditionGrid').hide(100)
            });
            $('#typeConditionSearch').show(100);
            var type = $(this).data('id');
            var id = $(this).data('type');


            // 数据列
            var columns = [];
            // var dataAdapter = null

            var pHtml = '<div style="overflow: hidden; padding: 8px 4px">';
            $.each(data[type].elements, function (index, el) {
                var item = {text: el.label, datafield: el.id};
                columns.push(item);
                pHtml += '<div style="float: left; padding: 8px 4px;"><div style="float: left" class="jqxcheckbox" data-value="' + el.id + '">' +
                    el.label +
                    '</div><input data-value="' + el.id + '" class="condition" type="text" /></div>'
            });
            pHtml += '</div>';
            $('#otherConditionContainer').show(100).html(pHtml);

            //控件初始化,条件控制
            $('.jqxcheckbox').jqxCheckBox({}).on('change', conditionChange);
            $('.condition').jqxInput({
                height: 20,
                width: 100,
            }).hide();

            $('#otherConditionGrid').jqxGrid({
                width: '100%',
                height: '98%',
                sortable: true,
                autoshowfiltericon: false,
                autoshowloadelement: false,
                columnsresize: true,
                altrows: true,
                columns: columns
            }).show(100);

            getObjectListByType(id, mission.roomID);
        }
    }


    function conditionChange(event) {
        var args = event.args;
        var oInput = $(this).next();
        if (args.checked === true) {
            oInput.show(100)
        } else {
            oInput.hide(100);
            oInput.val('');
            // 去除过滤器
            $('#otherConditionGrid').jqxGrid('removefilter', oInput.data('value'), true)
        }
        // $('#otherConditionGrid').jqxGrid('clearfilters')
    }

    function conditionSearch(event) {
        var oInputArr = $('.condition'),
            filter_or_opertor = 1,
            filtercondition = 'contains';

        for (var i = 0; i < oInputArr.length; i++) {
            var filtergroup = new $.jqx.filter(),
                oInput = oInputArr.eq(i);
            var filtervalue = oInput.val();
            if (filtervalue != '') {
                var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition),
                    datafield = oInput.data('value');
                filtergroup.addfilter(filter_or_opertor, filter);
                $('#otherConditionGrid').jqxGrid('addfilter', datafield, filtergroup, true)
            }
        }

    }


});
function initOtherGrid(data) {

    var source = {
        localdata: data,
        datatype: 'array',
        datafields: [
            {name: 'label', type: 'string'},
            {name: 'sendUserName', type: 'string'},
            {name: 'sendTime', type: 'date'},
            {name: 'value'}

        ],
        updaterow: function (rowid, rowdata, commit) {
            console.log(rowdata)
        },
        deleterow: function (rowid, commit) {

        }
    };
    //
    var dataAdapter = new $.jqx.dataAdapter(source);
    $('#otherGrid').jqxGrid({source: dataAdapter});
    if ($('.getObjectInfo').length != 0) {

        $('.getObjectInfo').jqxButton({width: '100%', height: '100%'})
    }
}

function freshOtherSearchList(data) {
    var dataNow = $('#otherGrid').jqxGrid('getRows'),
        dataFiltered = data.filter(function (dataItem) {
            return dataNow.every(function (dataNowItem) {
                return dataNowItem.uid != dataItem.uid
            })
        });

    searchOthers = dataFiltered.map(function (other) {
        return other.sendUserName
    });
}

function setGridSource(data, ele) {
    var datafields = [];
    for (var key in data[0]) {
        datafields.push({name: key, type: 'string'})
    }

    var source = {
        localdata: data,
        datatype: 'array',
        datafields: datafields
    };
    var dataAdapter = new $.jqx.dataAdapter(source);

    ele.jqxGrid({source: dataAdapter})
}