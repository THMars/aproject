/**
 * Created by wxy on 2017/4/24.
 */
$(function () {
    let $body = $(document);
    let subDomCancel, subDomConfirm;
    /*    $body.on('click',function (e) {
     console.log(this,$(e.target));
     })*/
    $('#main-container').on('click', '.eventForClick, .tab', function (event) {
        // console.log(event.target,event,(event.target.nodeName == 'H3'),event.target==$(this).find('.tree-meet')[0]);
        if ((event.target.nodeName == 'H3') || (event.target == $(this).find('.tree-meet')[0])) {

            $(this).next().slideToggle("fast", function () {
                $("#main-container").getNiceScroll().resize();
            });
            return false;
        }
        parentClick($(this).find('.parent'));
    });
    $body.on('keydown', function (e) {
        if (e.keyCode === 27) {
            /*用户按下ESC*/
            if ($('#customWindow').css('display') === 'block') {
                subDomCancel = '#cancelButton';
            } else if ($('#popoverMember').css('display') === 'block') {
                subDomCancel = '#disAdd'
            } else if ($('#showConfigWindow').css('display') === 'block') {
                subDomCancel = '#api-close'
            } else if ($('#message_tabs').css('display') === 'block') {
                subDomCancel = '#hide_tabs'
            } else if ($('#popoverOther').css('display') === 'block') {
                subDomCancel = '.jqx-popover-close-button-meeting'
            } else if ($('#float_rightclick').css('display') === 'block') {
                subDomCancel = '#floatdivClose'
            } else if ($('.apiConfigWindow').css('display') === 'block') {
                subDomCancel = '#cancel_sys_set_btn'
            }
            $(subDomCancel).trigger('click');
            subDomCancel = '';
        } else if (e.keyCode === 13) {
            /*用户按下ENTER*/
            if ($('#customWindow').css('display') === 'block') {
                subDomConfirm = '#searchTextButton';
            } else if ($('#popoverMember').css('display') === 'block') {
                subDomConfirm = '#addMember'
            } else if ($('#showConfigWindow').css('display') === 'block') {
                subDomConfirm = '#api-send'
            } else if ($('#message_tabs').css('display') === 'block') {
                subDomConfirm = '#full_tabs_btn'
            } else if ($('#float_rightclick').css('display') === 'block') {
                subDomConfirm = '#floatdivSend'
            } else if ($('.apiConfigWindow').css('display') === 'block') {
                subDomConfirm = '#confirm_sys_set_btn'
            }
            $(subDomConfirm).trigger('click');
            subDomConfirm = '';
        }
    });
    $(document).bind('contextmenu', function () {
        return false;
    });
    $body.on('blur', '.rightClickApiInput', function () {
        $('.userInputApiList').removeClass('hadMatchingApi');
    });
    $body.on('focus', '.rightClickApiInput', function () {
        $('.rightClickApiInput').attr('id', '').removeClass('changeInputBorderColor');
        $(this).attr('id', 'userInputApiCopy');
        $('.userInputApiList').removeClass('hadMatchingApi');
        let _backApiHashArray = $(this).attr('arrayH').substring(2).split(',');
        for (let b of _backApiHashArray) {
            $(missionRoomRightClick.rightClickApiMap[b]).addClass('hadMatchingApi');
        }

    });
    $body.on('keyup', '.rightClickApiInput', function () {
        let _backApiForJumpArray = '.backApiForJumpArray';
        if ($(this).val() === '') {
            $(this).parent().find(_backApiForJumpArray).removeClass('userHadInputApi');
            return;
        }
        if ($(this).parent().find(_backApiForJumpArray).length !== 0) {
            $(this).parent().find(_backApiForJumpArray).addClass('userHadInputApi');
        }
    });
    /*    $body.on('click', function (event) {
     let eventTarget = $(event.target).attr('class');
     switch (eventTarget) {
     case 'backApiForJumpArray':
     let _input = $(event.target).parent().find('input');
     let _userInputValue = _input.val();
     if (_userInputValue === '')return;
     _input.val('');
     $(event.target).removeClass('userHadInputApi');
     $(event.target).parent().next()
     .append($(createDomNode('e', 'userInputArrayValue')).text(_userInputValue).append(createDomNode('e', 'userInputArrayValueRemove fa fa-close')));
     break;
     case 'userInputArrayValueRemove':
     $(event.target).parent().remove();
     break;
     case 'hadMatchingApi':
     let _value = $(event.target).find('.userInputApiValue').text(),
     _userInputApiCopy = $('#userInputApiCopy'),
     _h = $(event.target).attr('h');
     _userInputApiCopy.val(_value).addClass('isDisabledInput').attr('disabled', 'disabled').parent().append(createDomNode('span', 'fa fa-close clearInputApiFromLeft'));
     _userInputApiCopy.attr('fromId', _h);
     break;
     case 'clearInputApiFromLeft':
     $(event.target).parent().find('.rightClickApiInput').removeClass('isDisabledInput').removeAttr('disabled').val('').removeAttr('fromId');
     $(event.target).remove();
     break;
     case 'userInputApiList':
     if ($(event.target).hasClass('hadMatchingApi')) {
     return false;
     }
     let _h = $(event.target).attr('h'),
     _value = $(event.target).find('.userInputApiValue').text(),
     _rightHadMatchingLabel = [];
     $('.rightClickApiInput').each(function () {
     if ($(this).attr('arrayH').indexOf(_h) !== -1) {
     _rightHadMatchingLabel.push($(event.target));
     }
     });
     if (_rightHadMatchingLabel.length === 1) {
     _rightHadMatchingLabel[0].addClass('isDisabledInput').val(_value).attr('disabled', 'disabled').parent().append(createDomNode('span', 'fa fa-close clearInputApiFromLeft'));
     _rightHadMatchingLabel[0].attr('fromId', _h);
     } else if (_rightHadMatchingLabel.length > 1) {
     _rightHadMatchingLabel.forEach(function (item) {
     item.addClass('changeInputBorderColor');
     })
     }
     break;
     }
     });*/
    $body.on('click', '.backApiForJumpArray', function () {
        let _input = $(this).parent().find('input');
        let _userInputValue = _input.val();
        if (_userInputValue === '')return;
        _input.val('');
        $(this).removeClass('userHadInputApi');
        $(this).parent().next()
            .append($(createDomNode('e', 'userInputArrayValue')).text(_userInputValue).append(createDomNode('e', 'userInputArrayValueRemove fa fa-close')));
    });
    $body.on('click', '.userInputArrayValueRemove', function () {
        $(this).parent().remove();
    });
    $body.on('click', '.hadMatchingApi', function () {
        let _value = $(this).find('.userInputApiValue').text(),
            _userInputApiCopy = $('#userInputApiCopy'),
            _h = $(this).attr('h');
        _userInputApiCopy.val(_value).addClass('isDisabledInput').attr('disabled', 'disabled').parent().append(createDomNode('span', 'fa fa-close clearInputApiFromLeft'));
        _userInputApiCopy.attr('fromId', _h);
    });
    $body.on('click', '.clearInputApiFromLeft', function () {
        $(this).parent().find('.rightClickApiInput').removeClass('isDisabledInput').removeAttr('disabled').val('').removeAttr('fromId');
        $(this).remove();
    });
    $body.on('click', '.userInputApiList', function () {
        if ($(this).hasClass('hadMatchingApi')) {
            return false;
        }
        let _h = $(this).attr('h'),
            _value = $(this).find('.userInputApiValue').text(),
            _rightHadMatchingLabel = [];
        $('.rightClickApiInput').each(function () {
            if ($(this).attr('arrayH').indexOf(_h) !== -1) {
                _rightHadMatchingLabel.push($(this));
            }
        });
        if (_rightHadMatchingLabel.length === 1) {
            _rightHadMatchingLabel[0].addClass('isDisabledInput').val(_value).attr('disabled', 'disabled').parent().append(createDomNode('span', 'fa fa-close clearInputApiFromLeft'));
            _rightHadMatchingLabel[0].attr('fromId', _h);
        } else if (_rightHadMatchingLabel.length > 1) {
            _rightHadMatchingLabel.forEach(function (item) {
                item.addClass('changeInputBorderColor');
            })
        }
    });
    $body.on('click', '#api-close', function () {
        $(".rightmenuapi").hide();
        $('#showConfigWindow').remove();
    });
    $body.on('click', '#dataPage_up', function () {
        var apiInstance = new missionClient.RedirectApi();

        var redirectID = "redirectID_example"; // String | 跳转Api ID

        var mID = mission.roomID; // String | 会战ID

        var params = new missionClient.Params4Api(); // Params4Api |

        var opts = {
            'authorization': getURLParams('token'), // String | token字串
            'queryOffset': 3.4, // Number | 分页起始记录偏移量
            'queryLimit': 3.4 // Number | 分页最大记录条数
        };
        apiInstance.redirectApi(redirectID, mID, params, opts).then(function (data) {
            console.log('API called successfully. Returned data: ', data);
        }, function (error) {
            console.error(error);
        });
    })
});
$(function () { /*数据聚合列表事件*/
    $(document).on("mousedown", ".chatTabValueLists", function (event) {
        let rightClick = isRightClick(event);
        if (rightClick) {
            isChatTabListRightClick = true;
            $parentId = $(this).closest(".clearfix")[0].getAttribute("id");
            let objKey = JSON.parse($(this).data("info").replace(/'/g, "\""));
            currentRightSelectedStandardObj = objKey;
            let key = Object.keys(objKey);
            rightClickMenu(key, $('#jqxMenu_tabs'), event);
        }
    });
    $(document).on('click', '.jsonListGather', function () {
        let _dataId = $(this).parent().parent().prev().find('span').attr('data') || $(this).parent().parent().prev().prev().find('span').attr('data') || $(this).parent().parent().parent().prev().attr('data') || objectID;
        let temp1data = missionRoomRightClick.rightClickBallData[_dataId];
        console.log(temp1data,_dataId)
        let formDiv = $(this).parent().parent().parent().find('.tabBoxForScroll');
        if ($(this).parent().find('.hadClickTabListB').length === 0) {
            let position = $(this).parents('.chatList').parent().find('.littleBtnBox');
            let backDataA = $(createDomNode('div', 'backCsvData table-exports-aLink fa fa-file-excel-o')).attr('title', '导出csv文件')/*.text('导出csv文件')*/;
            // $(backDataA).insertAfter(position);
            $(position).append(backDataA);
            let clearSelect = $(createDomNode('span', 'clearSelect fa fa-repeat')).attr('title', '清除选中')/*.text('清除选中')*/;
            // $(clearSelect).insertAfter(position);
            $(position).append(clearSelect);
            $('.clearSelect').click(function () {
                $('.chatList li').removeClass('hadClickTabList hadClickTabListB');
                $(this).parent().parent().find('.table-json').remove();
                $(this).parent().parent().find('table').show();
                $(this).prev().remove();
                $(this).remove();
                formDiv.removeData();
                $('#closeFloatdiv').trigger('click');
                $('#selected_obj').hide();
            });
        }
        let item = $(this).attr("h");
      /*  let keyhashmap = {};
        keyhashmap["srcIP"] = "";
        $('.table-exports-aLink').click(function () {
            let tableDataExport = $(this).parents('.littleBtnBox').siblings('.tabBoxForScroll').data('tableDataExport');
            if (!tableDataExport) {
                tableDataExport = $(this).parents('.littleBtnBox').next().children('.tabBoxForScroll').data('tableDataExport');
            }

            let csvStr = Papa.unparse(tableDataExport);
            for (let i = 0; i < 100; i++) {
                csvStr += "\n";
            }
            csvStr += '=N("' + JSON.stringify(keyhashmap).replace(/"/g, "'") + '")';
            let str = encodeURIComponent(csvStr);
            this.href = "data:text/csv;charset=utf-8," + str;
            // let _this = this;
            // swal({
            //     title: '请输入csv文件名',
            //     input: 'text',
            //     showCancelButton: true,
            //     inputValidator: function (value) {
            //         return new Promise(function (resolve, reject) {
            //             console.log('alert:',arguments);
            //             if (value) {
            //                 resolve()
            //             } else {
            //                 reject('写点东西吧，不要空着！')
            //             }
            //         })
            //     }
            // }).then(function (result) {
            //     $(_this).attr('download',result+'.csv');
            //     $(_this).click();
            //     // swal({
            //     //     type: 'success',
            //     //     html: 'You entered: ' + result
            //     // })
            // });
            //return false;

        });*/
        if ($(this).hasClass('hadClickTabList') || $(this).hasClass('hadClickTabListB')) {
            $(this).removeClass('hadClickTabList hadClickTabListB');
            let temp2data = [];
            temp2data.push(item);
            displayTable(temp2data, formDiv);
        } else {
            var temp = {};
            if ($(this).parents('.chatTabKeys').prev().find('.dy-isSort').hasClass('dy-checked')) {
                temp[item] = temp1data.tempData2[item];
            }else{
                console.log(temp1data)
                temp[item] = temp1data.tempData1[item];
            }

            displayTable(temp, formDiv, searchHighKeys(item).flag);
            if ($(this).hasClass('active-a')) {
                $(this).addClass('hadClickTabListB')
            } else {
                $(this).addClass('hadClickTabList');
            }
        }
        formDiv.find('.jh-type-object-0').hide();
        formDiv.find('.jh-type-array-0').hide();
        if (($(this).parent().find('.hadClickTabListB').length === 0) && ($(this).parent().find('.hadClickTabList').length === 0)) {
            let tempDom = $(this).parent().parent().parent();
            tempDom.find('.table-json').remove();
            tempDom.find('table').show();
            tempDom.find('.clearSelect').remove();
            tempDom.find('.backCsvData').remove();
            formDiv.removeData();
            $('#closeFloatdiv').trigger('click');
            $('#selected_obj').hide();
        }
    });
    $(document).on('click', '.tab_changeBar', function (event) {
        //let that = $(this).parent().parent();
        //console.log($(this).parent().text());
        /*        let height = that.find('.chatTabKeys').height();
         let startHeight, endHeight;
         if (height !== 0) {
         startHeight = '0px';
         endHeight = '42px';
         //$(this).parent().text('源数据');
         }else {
         startHeight = '42px';
         endHeight = '0px';
         //$(this).parent().text('聚合数据');
         }
         that.find('.chatTabKeys').animate({
         height: startHeight
         }, 100);
         that.find('.tabParamsWrap').animate({
         height: endHeight
         }, 100)*/
        // console.log(event, $(this).parent().parent());
        let that = $(this).parent(),
            findTaht = $(this).find('.tab_changeBarBtn');
        if (that.hasClass('chatList')) {
            if (that.height() > 40) {
                that.addClass('changeParentHeight');
                $(this).next().addClass('changeHeight');
                findTaht.removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
            } else {
                that.removeClass('changeParentHeight');
                $(this).next().removeClass('changeHeight');
                findTaht.removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
            }
        } else if (that.hasClass('dataOrigin')) {
            if ($(this).next().height() < 30) {
                $(this).next().addClass('changeOtherHeight');
                findTaht.removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
            } else {
                $(this).next().removeClass('changeOtherHeight');
                findTaht.removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
            }
        }
        /*        if($(this).parent().parent().height() > 40){
         // $(this).parent().parent().height($(this).parent().height());
         $(this).parent().parent().addClass('changeParentHeight');
         // $(this).parent().next().height(0)
         $(this).parent().next().addClass('changeHeight')
         }else {
         // $(this).parent().parent().height($(this).parent().height());
         // $(this).parent().next().height(0)
         $(this).parent().parent().removeClass('changeParentHeight');
         $(this).parent().next().removeClass('changeHeight');
         if($(this).parent().next().height() < 40) {
         $(this).parent().next().height('50px');
         }
         }*/
    })
});
$(function () { /*右键动态绑定事件*/
    let $ul = $('#add-element');
    let menuTab = $("#jqxMenu_index");
    let leftClickMenu = $('.left_click');
    $ul.on('mousedown', 'div[class*="customizeObj"]', function (event) {
        if (menuTab.css("display") == "block") {
            menuTab.hide();
        }
        let data = JSON.parse(event.target.getAttribute('datafield')),
            that = $(this);
        if (isRightClick(event)) {
            let paramsId = [];
            data.params.forEach(function (item) {
                if (item.value) {
                    paramsId.push(item.id);
                }
            });
            currentRightSelectedStandardObj = data;
            $parentId = $(this).closest(".clearfix")[0].getAttribute("id");
            $userID = $(this).closest(".clearfix")[0].getAttribute("data-sendid");
            rightClickMenu(paramsId, menuTab, event, that);
            return false;
        }
        //点击的是左键
        leftClickMenu.find('ul').children().remove();

        for (let d of data.params) { //开始画左键展示
            $('.left_click>ul').append("<li>" + d.label + "：<span>" + d.value + "</span></li>");
        }
        let y = $(this).offset().top + $(this).height();
        let x = $(this).offset().left + $(this).width() + 15;
        leftClickMenu.css({top: y, left: x}).show().find("li").each(function () {
            if (this.offsetWidth < this.scrollWidth) {
                $(this).attr("title", $(this).text());
            } else {
                $(this).removeAttr("title");
            }
        });
        $(document).on('mousedown', function (e) {
            let _leftClick = $('.left_click');
            if (_leftClick.find(e.target).length === 0 && e.target != event.target) {
                _leftClick.hide();
                $(document).off('mousedown');
            }
        });
        $('.left_click span').click(function () {
            let clipboard = new Clipboard('.left_click span', {
                text: function (trigger) {
                    return trigger.innerHTML;
                }
            });
            clipboard.off().on('success', function (e) {
                toastr.info(e.text, '你已成功复制');
                e.clearSelection();
                clipboard.destroy();
            });
            clipboard.off().on('error', function () {
                $('.left_click>span').click(function () {
                    toastr.info($(this).text(), '复制失败');
                });
                clipboard.destroy();
            });
        });

    });
    $('body').on('click', '.canCopyText', function () {
        let clipboard = new Clipboard('.canCopyText', {
            text: function (trigger) {
                return trigger.innerHTML;
            }
        });
        clipboard.off().on('success', function (e) {
            toastr.info(e.text, '你已成功复制');
            e.clearSelection();
            clipboard.destroy();
        });
        clipboard.off().on('error', function () {
            $('.canCopyText').click(function () {
                toastr.info($(this).text(), '复制失败');
            });
            clipboard.destroy();
        });
    });
    $ul.on('mousedown', '.active-a', function (event) {
        if (menuTab.css("display") == "block") {
            menuTab.hide();
        }
        rightClickobjectID = $(this).parents('.dataOrigin').attr('objid') || $(this).parents('.tabDivWrap').find('p').attr('data');
        var key = $(this).attr('h') || $(this).prev().attr('h');
        if(typeof allHashKeyName[key] !== 'object') {
            key = allHashKeyName[key]
        }
        key = key.substring(0, 40);
        let dataApi = {};
        dataApi[key] = event.target.innerText;
        currentRightSelectedStandardObj = dataApi;
        let k = [];
        k.push(key);
        if (isRightClick(event)) {
            $parentId = $(this).closest(".clearfix")[0].getAttribute("id");
            rightClickMenu(k, $("#jqxMenu_tabs"), event);
            return false;
        }
    });
    //附件右键
    $ul.on('mousedown', '.msg_attaches>li', function (event) {
        if (menuTab.css("display") == "block") {
            menuTab.hide();
        }
        let dataField = $(this).attr('datafield');
        var rightClick = isRightClick(event);
        aid = $(this).attr("aid");
        currentRightSelectedStandardObj = JSON.parse(dataField);
        if (rightClick) {
            if (dataField) {
                $parentId = $(this).closest(".clearfix")[0].getAttribute("id");
                rightClickMenu(dataField, $("#jqxMenu_tabs"), event);
                return false;
            }
        }
    });
});
$(function () {/*可视化球的右键*/
    let eventGraph = $('#eventgraph');
    let mtDiv = $("#message_tabs");
    var currentNodeData = null;
    function mtDomRemove(d) {
        d.hide().find("#message-node-info").children().remove();
        d.find('.chatList').remove();
        d.find('.dataOrigin').remove();
        d.find('.littleBtnBox').remove();
        d.find('#message-node-info').append(loadingAnimate());
        d.show();
    }


    eventGraph.on('mousedown', '.result, .custom', function (event) {
        if (isRightClick(event)) {
            console.log(event.currentTarget, $(event.currentTarget));
            // let title = $(this).text();
            let title = $($(this).html())[2].innerText;
            mtDomRemove(mtDiv);
            let data = {},
                id = $(this).attr("id");
            data["json"] = true;
            data["id"] = id.slice(2);
            let apiInstance = new missionClient.ResultApi();
            let opts = {
                'authorization': getURLParams('token') // String | token字串
            };
            if ($(this).hasClass('custom')) {
                apiInstance.getCustomResult(id.slice(2), opts).then(function (result) {
                    console.log('API called successfully. Returned data: ', result);
                    if (result.ri.rc === 0) {
                        throw result.ri.msg;
                    }
                    result = changeDataToBack(result);
                    currentNodeData = result.d;
                    renderResultToTableView(result.d, title, true);
                    // mtDiv.show(0, function () {
                    //     console.log(result);
                    //     currentNodeData = result.d;
                    //     renderResultToTableView(result.d, title, true);
                    // });
                }, function (error) {
                    throw error;
                }).catch(function (error) {
                    console.log(error);
                });
                DragFloatTab('message-node-title');
                return false;
            }
            apiInstance.getResultDetail(id.slice(2), opts).then(function (result) {
                if (result.ri.rc === 0) {
                    throw result.ri.msg;
                }
                result = changeDataToBack(result);
                console.log(result, JSON.parse(result.d.data).data)
                AddTabDataCache(JSON.parse(result.d.data).data, result.d.id);
                currentNodeData = result.d;
                renderResultToTableView(result.d, title);
            }, function (error) {
                throw error
            }).catch(err => {
                console.error(err);
                mtDiv.hide();
                toastr.error(title, '获取数据失败', {timeOut: 2000});
            });
            DragFloatTab('message-node-title');
            return false;
        }
    });
    eventGraph.on('mousedown', '.object', function (event) {
        if (isRightClick(event)) {
            // let title = $(this).text();
            let title = $($(this).html())[2].innerText;
            mtDomRemove(mtDiv);
            let data = {},
                id = $(this).attr("id");
            data["json"] = true;
            data["id"] = id.slice(2);
            var apiInstance = new missionClient.ObjectApi();
            var opts = {
                'authorization': getURLParams('token') // String | token字串
            };
            apiInstance.getObjectView(id.slice(2), opts).then(function (result) {
                if (result.ri.rc === 0) {
                    throw result.ri.msg;
                }
                console.log(result)
                // result = changeDataToBack(result);
                currentNodeData = result.d;
                renderResultToTableView(result.d, title, false, true);
            }, function (error) {
                throw error;
            }).catch(err => {
                mtDiv.hide();
                console.error(err);
                toastr.error(title, '获取数据失败', {timeOut: 2000});
            });
            DragFloatTab('message-node-title');
        }
    });
    eventGraph.on('mousedown', '.backobject', function (event) {
        if (isRightClick(event)) {
            // let title = $(this).text();
            let title = $($(this).html())[2].innerText;
            mtDomRemove(mtDiv);
            let data = {},
                id = $(this).attr("id");
            data["json"] = true;
            data["id"] = id.slice(2);
            var apiInstance = new missionClient.CallbackApi();
            var opts = {
                'authorization': getURLParams('token') // String | token字串
            };
            apiInstance.getCallbackObject(id.slice(2), opts).then(function (result) {
                console.log('API called successfully. Returned data: ', result, id.slice(2));
                if (result.ri.rc === 0) {
                    throw result.ri.msg;
                }
                result = changeDataToBack(result);
                currentNodeData = result.d;
                renderResultToTableView(result.d.object, title, false, true);
            }, function (error) {
                throw error;
            }).catch(err => {
                console.error(err);
                mtDiv.hide();
                toastr.error(title, '获取数据失败', {timeOut: 2000});
            });
            DragFloatTab('message-node-title');
        }
    });
});


/**
 * 提取右键公共部分
 * @param params 发送后台参数
 * @param dom 当前右键对象出相应的Menu
 * @param event 当前右键节点event
 * @param isObject 确定是否为标准对象
 * */

function rightClickMenu(params, dom, event, isObject) {
    let contextMenu;
    let api = new missionClient.ConfigApi();
    let opts1 = {'authorization': getURLParams('token')};
    api.getApiConfig(params, opts1).then(function (res) {
        if (res.ri.rc === 0) {
            console.log(res.ri.msg);
            return;
        }
        data = res.d;
        if (!data) return;
        if (!contextMenu) {
            contextMenu = dom.jqxMenu({
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
                theme: "meeting"
            });
        }
        var scrollTop = $(event.target).scrollTop();
        var scrollLeft = $(event.target).scrollLeft();
        if (data.length == 0) {
            contextMenu.jqxMenu('source',
                {lable: "无可查询系统"}
            );
        } else {
            contextMenu.jqxMenu('source', getSource(data));
        }
        if (isObject) {
            let $x = $(event.target).width() + scrollLeft + 15;
            if (isObject.parent().parent().parent().hasClass("m-message") || isObject.parent().parent().hasClass("m-message")) {
                dom.jqxMenu('rtl', true);
                $x = -dom.width();
            } else {
                dom.jqxMenu('rtl', false);
            }
            contextMenu.jqxMenu('open', $(event.target).offset().left + $x, $(event.target).offset().top + scrollTop);
        } else {
            contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
        }
    }, function (error) {
        console.error(error);
    });
}

/**
 * 右键出菜单列 表用户可填写
 * @param params 右键菜单返回的api数据
 * */
function rightClickMenuList(params) {
    let $params = params.parameters;
    $(".rightmenuapi").show().find("ol").children().remove();//清除上一次缓存
    let tempParamsData;
    let rightOl = $(".rightmenuapi ol"),
        userInputApi;
    console.log(currentRightSelectedStandardObj);
    if (currentRightSelectedStandardObj.params) {
        tempParamsData = currentRightSelectedStandardObj.params;
        $(rightOl).append($(createDomNode('li', 'descForTitle')).text(currentRightSelectedStandardObj.label));
        for (let e of tempParamsData) {
            userInputApi = createDomNode('li', 'userInputApiList');
            $(userInputApi).append($(createDomNode('span', 'userInputApiDesc')).text(e.label + '：'), $(createDomNode('span', 'userInputApiValue')).text(e.value))
                .attr('h', e.id);
            rightOl.append(userInputApi);
            missionRoomRightClick.rightClickApiMap[e.id] = userInputApi;
        }
    } else {
        $(rightOl).append($(createDomNode('li', 'descForTitle')).text('回传数据'));
        for (let c in currentRightSelectedStandardObj) {
            userInputApi = createDomNode('li', 'userInputApiList');
            let label = searchHighKeys(c).name;
            $(userInputApi).append($(createDomNode('span', 'userInputApiDesc')).text(label + '：'), $(createDomNode('span', 'userInputApiValue')).text(currentRightSelectedStandardObj[c]))
                .attr('h', c);
            rightOl.append(userInputApi);
            missionRoomRightClick.rightClickApiMap[c] = userInputApi;
        }
    }
    let backApiForJump = createDomNode('div', 'changeConfigWindow', 'showConfigWindow');
    $(backApiForJump).append($(createDomNode('div', 'descForTitle')).text(params.desc));
    $params.forEach(function (item, index) {
        /*创建api输入框*/
        /* if(index > 2) {
         item.params = ['83456a5aeebcdf24beebe7224c4fca40ab2a8379','a8df7b671cd72e7f847737d5b5be88444ad977a4','ea424d38af72dd1366a08aad1f47eca3e7ec3d24'];
         }*/
        let backApiForJumpDiv = createDomNode('div', 'rightClickApiDiv'),
            backApiForJumpDesc = createDomNode('span', 'rightClickApiDesc'),
            backApiForJumpInput = createDomNode('input', 'rightClickApiInput');
        // let _inputValFromSroce = '';
        if (item.params.length === 1) {
            let _inputValFromSroce = $(missionRoomRightClick.rightClickApiMap[item.params[0]]).find('.userInputApiValue').text();
            console.log(_inputValFromSroce, $(missionRoomRightClick.rightClickApiMap[item.params[0]]));
            $(backApiForJumpInput).addClass('isDisabledInput').val(_inputValFromSroce).attr('disabled', 'disabled');
            $(backApiForJumpDiv).append(createDomNode('span', 'fa fa-close clearInputApiFromLeft'));
        } else if (item.params.length > 1) {
            $(backApiForJumpInput).addClass('changeInputBorderColor');
            for (let i of item.params) {
                $(missionRoomRightClick.rightClickApiMap[i]).addClass('hadMatchingApi');
            }
            /*  if(index === ($params.length-1)) { //input聚焦？？？
             $($('.changeInputBorderColor')[0]).focus();
             }*/
        }
        if (item.required) {/*是否必填*/
            $(backApiForJumpDiv).append($(createDomNode('span', 'apiIsRequired')).text('*'));
        }
        $(backApiForJump).append($(backApiForJumpDiv).append($(backApiForJumpDesc).html(item.desc + '：'), $(backApiForJumpInput).attr('arrayH', index + '-' + item.params)));
        if (item.isArray) {
            /*判断是否可自定义添加api*/
            $(backApiForJumpDiv).prepend($(createDomNode('span', 'backApiForJumpArray')).text('+'));
            $(backApiForJump).append(createDomNode('div', 'sendApiArrayLabel'));
        }
    });
    $('body').append(backApiForJump);
    $(backApiForJump).append("<div><span id='api-send'>提交</span><span id='api-close'>取消</span></div>").css({
        'margin-top': -$(backApiForJump).height() / 2,
        'margin-left': -$(backApiForJump).width() / 2
    });

    rightOl.css({
        "top": $(backApiForJump).offset().top,
        "left": $(backApiForJump).offset().left - rightOl.width() - 5
    });
    tips($(rightOl), 'span');
}

/**
 * 用户填好api发送查询请求
 * @param params 右键菜单返回的api数据
 * @param source 标明回传数据右键还是标准对象右键...
 */
function sendApiToJump(params, source) {
    let $params = params.parameters,
        redirectID = {},
        sendApi = {};
    $('body').off('click').on('click', '#api-send', function () {
        /*if ($('.clearInputApiFromLeft').length === 0) { //不是标准对象有来源数据？？暂时没有对照表
         alert('至少一项来源于对象数据');
         return false;
         }*/
        if (rightClickobjectID) {
            objectID = rightClickobjectID;
            rightClickobjectID = null;
        } else {
            objectID = 'object-' + currentRightSelectedStandardObj.id + '-' + $parentId + '-' + $userID + '-' + currentRightSelectedStandardObj.objectId;
            for (let c of currentRightSelectedStandardObj.params) {
                sendApi[c.label] = c.value;
            }
            sendApi = currentRightSelectedStandardObj;
            redirectID = {
                meetingID: $parentId.substring(0, $parentId.lastIndexOf("-")),
                meetingName: mission.roomName,
                objectID: objectID,
                type: source
            };
            redirectID = JSON.stringify(redirectID);
        }
        $('.rightClickApiInput').each(function () {
            let _sendValue = [];
            let arrayH = $(this).attr('arrayH'),
                value = $(this).val(),
                _fromId = $(this).attr('fromId') || Object.keys(currentRightSelectedStandardObj)[0],
                eValue = $(this).parent().next().find('.userInputArrayValue');
            if (eValue.length !== 0) {
                eValue.each(function () {
                    _sendValue.push($(this).text());
                });
            }
            $params.forEach(function (item, index) {
                if ((index + '-' + item.params.join(',')) === arrayH) {
                    _sendValue.push(value);
                    item.inputVal = _sendValue;
                    item.jumpId = _fromId;
                    if (item.params.join(',') !== '') {
                        item.jumpObjectID = objectID;
                        item.jumpType = source;
                    } else {
                        item.jumpObjectID = '';
                        item.jumpType = '';
                    }
                }
            });
        });
        GetRedirectRequestParamsByMenuData($params);
        if (params.t == "api") {
            var url = 'http://' + params.url;
            var token = getURLParams("token");
            if (params.type == "url") {
                window.open(encodeURI(url + "?" + "params=" + JSON.stringify(sendApi) + "&token=" + token + "&redirectID=" + redirectID));
            } else if (params.type == "api") {
                $('#showConfigWindow').remove();
                let apiInstance = new missionClient.RedirectApi(),
                    redirectId = params.url,
                    mID = mission.roomID,
                    api_params = GenereateAPIRequestParams(),
                    opts = {
                        'authorization': getURLParams('token'), // String | token字串
                        'queryOffset': 5, // Number | 分页起始记录偏移量
                        'queryLimit': 10 // Number | 分页最大记录条数
                    };
                console.log("SEND:", api_params);
                apiInstance.redirectApi(redirectId, mID, api_params, opts).then(function (result) {

                    if (result.ri.rc === 0) {
                        throw result.ri.msg
                    }
                    result = changeDataToBack(result);
                    // if (!result.d.data) {
                    //     return;
                    // }
                    console.log('1111111111111111', result);
                    $('#meeting_tab').jqxTabs('select', 1);
                    var tab_html = CreateHTMLFromNodeResultData(result.d);
                    dataPresentation();
                    AddTabDataCache(JSON.parse(result.d.data).data, result.d.id);
                    AddDataTableUnderD3(result.d.dstSystemTitle, tab_html, result.d.id);
                    getData(mID);
                }, function (error) {
                    throw error;
                }).catch(function (error) {
                    console.warn(error);
                    toastr.error('', '查询失败', {timeOut: 2000});
                });
            }
        }
        $(".rightmenuapi").hide();
    });
}
/**
 * @param data
 * @return newData
 * */
function changeDataToBack(data) {
    let newData = {};
    if(data.d.object) {
        newData['data'] = data.d.object.data;
        newData['header'] = data.d.object.dict;
        newData['resultInfo'] = data.d.object.resultInfo;
        data.d.object.data = JSON.stringify(newData);
        return data;
    }
    newData['data'] = data.d.data;
    newData['header'] = data.d.dict;
    newData['resultInfo'] = data.d.resultInfo;
    data.d.data = JSON.stringify(newData);
    return data;
}
function ShowElement(element) {
    var oldhtml = element.innerHTML;   //获得元素之前的内容
    var newobj = document.createElement('input','', 'rename');   //创建一个input元素
    newobj.type = 'text';   //为newobj元素添加类型
    //设置newobj失去焦点的事件
    newobj.onblur = function () {
        element.innerHTML = this.value ? this.value : oldhtml;   //当触发时判断newobj的值是否为空，为空则不修改，并返回oldhtml。
    };
    element.innerHTML = '';   //设置元素内容为空
    element.appendChild(newobj);   //添加子元素
    newobj.focus();   //获得焦点
}

$(document).on('click', '.dy-isSort', function (e) {

    if ($(this).parents('.tabDivWrap').find('.table-json').length) return false;  //会战浮动窗口
    if ($(this).parents('.message-tabs').find('.table-json').length) return false;  //聊天窗口
    if ($(this).parents('.jqx-tabs-content-element').find('.table-json').length) return false;  //会战固定窗口

    if ($(this).hasClass('dy-checked')) {
        $(this).removeClass('dy-checked');
    }else{
        $(this).addClass('dy-checked');
    }
    e.stopPropagation();
});
