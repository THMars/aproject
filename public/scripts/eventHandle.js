/**
 * Created by wxy on 2017/7/14.
 */
$(function () {
    let $scroll = $('.scroll'),
        $mainContainer = $('#main-container'),
        $jCommon = $('#j-common');
    $("#meeting_tab").on('selected', function (event) {
        var clickedItem = event.args.item;
        if (clickedItem === 1) {
            zoomFitAuto();
        }
        $('.configWindow').hide();
    });
    //房间列表右键菜单
    let rightClickDiv, overRoomRole;
    $mainContainer.off().on("mousedown", ".tab, li", function (event) {
        overRoomRole = $(this).attr("data-role");
        let rightClick = isRightClick(event);
        let $this = $(this);
        rightClickDiv = $(this);
        let contextMenu;
        $mainContainer.find("span").each(function () {
            $(this).parent().attr("data-remove", "");
        });
        if ($this.hasClass("tab")) {
            let id = $this.attr("data-role");
            mission.roomID = id;
            $("#customWindow").attr("num", id);
            $this.attr('data-remove', 'y');
        } else {
            $this.attr('data-remove', 'y');
        }
        if (rightClick) {
            contextMenu = $("#tree-room_menu").jqxMenu({
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
            if ($this.attr("data-uid") == mission.userID && $this.hasClass("tab")) {
                contextMenu.jqxMenu('source', [{label: "删除会战"}, {label: "添加房间"}, {label: "停止会战"}, {label: "会战置顶"}]);
            } else if ($this.hasClass("tab")) {
                contextMenu.jqxMenu('source', [{label: "添加房间"}, {label: "会战置顶"}]);
            } else if ($this.attr("data-uid") == mission.userID) {
                contextMenu.jqxMenu('source', [{label: "删除房间"}, {label: "停止房间"}]);
            }
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
            return false;
        }
    });
    $("#tree-room_menu").on("itemclick", function (event) {
        let element = event.args;
        if ($(element).text() == "删除会战" || $(element).text() == "删除房间") {
            $('.tree-reroom').trigger('click');
        } else if ($(element).text() == "添加房间") {
            $('.tree-addroom').trigger('click');
        } else if ($(element).text() == "会战置顶") {
            if ($mainContainer.find('#pinned').length == 0) {
                $mainContainer.prepend('<div id="pinned" />');
            }
            rightClickDiv.css('background', '#35353A');
            $('#pinned').prepend(rightClickDiv.next(), rightClickDiv);
            // $('#pinned').prepend(rightClickDiv);
        } else if ($(element).text() == "停止会战" || $(element).text() == "停止房间") {
            overRoom(overRoomRole, function (data) {
                $mainContainer.find("div").each(function () {
                    if ($(this).attr("data-role") == overRoomRole) {
                        $(this).attr("data-status", 0);
                        isStopRoom = true;
                        $(this).find("span").css({"color": "#777"});
                        $('<div class="isStop"></div>').appendTo($(this).find("h3"));
                    }
                }).end().find("li").each(function () {
                    if ($(this).attr("data-role") == overRoomRole) {
                        $(this).attr("data-status", 0);
                        isStopRoom = true;
                        $(this).find("span").css("color", "#777");
                        $('<div class="isStop" style="height:42px;"></div>').appendTo($(this));
                    }
                });
            });
        }
    });
    //普通输入框
    $('#j-text').jqxEditor({
        height: '100%',
        width: '100%',
        tools: '',
        stylesheets: ['css/custom.css']
    });
    let $body;
    // 监听键盘事件
    if ($jCommon.css("display") == "block") {
        $body = document.getElementsByTagName('iframe')[0].contentWindow.document;
        $body.onkeydown = function (event) {
            if (event.ctrlKey && event.keyCode == 13) {
                $("#j-send").trigger("click");
            }
        };
    }
    $("#new-msg_sort").click(function () {
        $(this).toggleClass("sort-color");
        if ($(this).hasClass("sort-color")) {
            $(this).css("color", "#20c5d8");
            sortFlag = true;
        } else {
            $(this).css("color", "#3c89a7");
            sortFlag = false;
        }
    });
    $('#user_sort').click(function () {
        let arr = [];
        for (let i of $mainContainer.children()) {
            arr.push($(i).data("uid"));
        }
        arr = arr.filter(function (item) {
            return Boolean(item);
        });
        arr = arr.splice(0, arr.lastIndexOf(mission.userID));
        let temp = arr.filter(function (item) {
            return item != mission.userID;
        });
        if (temp.length > 0) {
            $mainContainer.find('div').each(function () {
                if ($(this).hasClass('tab') && $(this).parent().attr('id') != "pinned") {
                    if ($(this).attr('data-uid') == mission.userID) {
                        if ($mainContainer.find("#pinned").length == 0) {
                            $mainContainer.prepend($(this).next());
                            $mainContainer.prepend($(this));
                        } else {
                            let $pinned = $('#pinned');
                            $(this).next().insertAfter($pinned);
                            $(this).insertAfter($pinned);
                        }
                    } else {
                        let $next = $(this).next();
                        $mainContainer.append($(this).next());
                        $(this).insertBefore($next);
                    }
                }
            });
        }
    });

    $('#input_sort').on('keyup', function () {
        let val = $(this).val();
        if (val == "") {
            $mainContainer.find('div').each(function () {
                if ($(this).attr('id') == 'pinned') {
                    $mainContainer.prepend($(this));
                } else if ($(this).css('display') == 'none' && $(this).hasClass('tab')) {
                    $(this).css({display: "block"});
                }
            });
            return;
        }
        $mainContainer.find('span').each(function () {
            if ($(this).text().indexOf(val) >= 0) {
                if ($(this).parent().hasClass('tab')) {
                    if ($(this).parent().css('display') == 'none') $(this).parent().css({display: "block"});
                }
            } else {
                if ($(this).parent().hasClass('tab')) {
                    $(this).parent().css({display: "none"});
                    $(this).parent().next().css({display: "none"});
                }
            }
        });
    });
    //点击发送添加dom元素
    $("#j-send").click(sendadvancedMsg);
    //    滚动条事件
    var ulHeight = $(".scroll>ul").height();
    var n = 50;
    var $msgid = [];
    $mainContainer.scroll(function () {
        $("#tree-room_menu").hide();
    });
    $scroll.scroll(function () {
        menuHide();
        let $addElement = $('#add-element');
        let $length = $addElement.children().length;
        if ($length <= 0) {
            return;
        }
        $(".smart_menu_body").hide();
        $(".menuTree").hide();
        let minData = parseInt($(".scroll>ul>li:first-child").attr("data")),
            maxData = parseInt($(".scroll>ul>li:last-child").attr("data")),
            nowHeight = $scroll.scrollTop(),
            res = ulHeight - nowHeight,
            l;
        ulHeight = nowHeight;
        let $back = $(".back");
        l = $(".scroll>ul").height() - $scroll.scrollTop() - $scroll.height();
        if (l > 50 || l < -50) {
            if ($back.text() == "") {
                $back.show().css({
                    "background": "url('../images/bottom.png') no-repeat center center",
                    "backgroundSize": "30px 30px"
                });
                if ($('.scroll').scrollTop() == 0) {
                    $back.hide()
                }
            } else {
                $back.show()
            }
        }
        let reqOffset = 0;
        let reqSize = 3 * n;
        //up
        if (res >= 0) {
            if ((ulHeight < 50) && (mission.scrollFlag == true) && (minData > 1)) {
                if (minData - reqSize <= 1) {
                    reqOffset = 1;
                    reqSize = minData - 1;
                } else {
                    reqOffset = minData - reqSize;
                }
                mission.scrollFlag = false;
                console.log(reqOffset, reqSize);
                getMessage(mission.roomID, reqOffset, reqSize,
                    function (err, data) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        addScrollTopNewmsg(data);
                        if ($('.scroll>ul').children().length > 200) {
                            $('.scroll>ul>li:gt(199)').remove();
                        }
                        //设置msg的最大宽度
                        msgWidth();
                    });
            }
        }
        //down
        if (res <= 0) {
            l = $(".scroll>ul").height() - ulHeight - $scroll.height();
            if (l <= 50) {
                $back.hide().css({
                    "background": "url('../images/bottom.png') no-repeat center center",
                    "backgroundSize": "30px 30px"
                }).text('');
                count = 0;
            }
            if ((l < 50) && (mission.scrollFlag == true)) {
                if (maxData < mission.msgEndID) {
                    console.log(maxData, mission.msgEndID);
                    if (mission.msgEndID - maxData < reqSize) {
                        reqSize = mission.msgEndID - maxData;
                    }
                    mission.scrollFlag = false;
                    getMessage(mission.roomID, maxData + 1, reqSize,
                        function (err, data) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log(data);
                            addScrollBottomNewmsg(data);
                            if ($addElement.children().length > 200) {
                                $('.scroll>ul>li:lt(' + ($('.scroll>ul').children().length - 200) + ')').remove();
                            }
                            //设置滚动条的位置
                            $scroll.scrollTop($scroll.scrollTop() + $("#" + mission.roomID + "-" + maxData).offset().top);
                            //设置msg的最大宽度
                            msgWidth();
                        });
                }
            }
        }
        //滚动滑轮查看未读消息
        var $nu = mission.roomID.length + 1;
        $msgid.splice(0, $msgid.length);
        for (var j = 0; j < $addElement.children().length; j++) {
            //取msgID 然后push到数组里面
            $msgid.push(($addElement.children()[j].id).slice($nu));
        }
        if ($msgid.some(findLid)) {
            if (mission.msgEndID != mission.msgStartID) {
                if (mission.msgStartID >= 0) {
                    if (($("#" + mission.roomID + "-" + mission.msgStartID).offset().top - $scroll.offset().top) >= 0) {
                        $(".newMsg").hide();
                    }
                } else {
                    if ($(".scroll>ul>li:first-child").offset().top - $scroll.offset().top >= 0) {
                        $(".newMsg").hide();
                    }
                }

            }
        }
        // chatTableIconScroll();

    });

    //点击弹框查看未读消息
    $(".newMsg").click(function () {
        $(this).hide();
        var msgSid = mission.msgStartID;
        //未读小于两百条，滚动条直接跳转
        if (mission.msgEndID - mission.msgStartID <= 200) {
            if (mission.msgStartID == -1) {
                mission.msgStartID = 1;
            }
            $scroll.scrollTop($scroll.scrollTop() + $("#" + mission.roomID + "-" + mission.msgStartID).offset().top);
        } else if (mission.msgEndID - mission.msgStartID > 200) {  //未读大于两百条，请求数据
            var starid = parseInt(mission.msgStartID);
            if (starid > 50) {
                // 如果历史消息大于50，给用户缓存50
                starid = starid - 50;
            }
            getMessage(mission.roomID, starid, 200,
                function (err, data) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(data);
                    backBottom(data);
                    //设置msg的最大宽度
                    msgWidth();
                    //设置滚动条位置
                    console.log(msgSid);
                    $scroll.scrollTop($scroll.scrollTop() + $("#" + mission.roomID + "-" + msgSid).offset().top);
                });
        }
        mission.msgStartID = mission.msgEndID;
    });
    //点击高级按钮出现高级输入
    $("#j-advanced").click(function () {
        var jText = $("#j-text").val();
        let $editor = $("#editor"),
            $splitter = $('#SplitterChat'),
            $chatInput = $('.chat-input'),
            $back = $('.back');
        $(this).hide();
        $(".text").hide();
        $(".advanced-text").show();
        $editor.val(jText);
        $jCommon.show();
        var panels = [{collapsible: false, size: '50%'}, {}];
        $splitter.jqxSplitter({panels: panels});
        $splitter.jqxSplitter('refresh');
        $chatInput.css("height", $chatInput.parent().height() - $(".btn-box").height() - 1);
        // $('#editor').jqxEditor('focus');
        $editor.jqxEditor({
            height: "100%"
        });
        $scroll.scrollTop($scroll[0].scrollHeight);
        $back.css({
            "background": "url('../images/bottom.png') no-repeat center center",
            "backgroundSize": "30px 30px"
        }).text('');
        count = 0;
        $back.hide();
        arrowsShrink();
    });
    //点击普通按钮出现普通输入
    $jCommon.click(function () {
        let $splitter = $('#SplitterChat'),
            $chatInput = $('.chat-input'),
            $text = $('#j-text'),
            $back = $('.back');
        $(this).hide();
        $("#j-advanced").show();
        $(".text").show();
        $(".advanced-text").hide();
        $text.val("");
        $text.focus();
        var panels = [{collapsible: false, size: '70%'}, {}];
        $splitter.jqxSplitter({panels: panels});
        $splitter.jqxSplitter('refresh');
        $chatInput.css("height", $chatInput.parent().height() - $(".btn-box").height() - 1);
        $('#editor').jqxEditor('focus');
        $text.jqxEditor({
            height: "100%"
        });
        $scroll.scrollTop($scroll[0].scrollHeight);
        $back.css({
            "background": "url('../images/bottom.png') no-repeat center center",
            "backgroundSize": "30px 30px"
        }).text('');
        count = 0;
        $back.hide();
        arrowsShrink();
    });
//    返回底部
    $(".back").click(function () {
        $(this).hide().end().css({
            "background": "url('../images/bottom.png') no-repeat center center",
            "backgroundSize": "30px 30px"
        });
        $(this).text("");
        count = 0;
        var $limaxid = $("#add-element>li").eq(199).attr("data");
        // console.log($limaxid, mission.msgEndID);
        if ($limaxid) {
            if ($limaxid == mission.msgEndID) {
                //滚动条在最下方
                $scroll.scrollTop($scroll[0].scrollHeight);
            } else {
                if (mission.msgEndID - $limaxid > 200) {
                    getMessage(mission.roomID, mission.msgEndID - 200 + 1, 200,
                        function (err, data) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log(data);
                            backBottom(data);
                        });
                    mission.scrollFlag = false;
                    $scroll.scrollTop($scroll[0].scrollHeight);
                } else {
                    var reSize = mission.msgEndID - $limaxid;
                    // console.log(reSize, $limaxid);
                    getMessage(mission.roomID, parseInt($limaxid) + 1, reSize,
                        function (err, data) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            addScrollBottomNewmsg(data);
                            if ($('#add-element').children().length > 200) {
                                $('.scroll>ul>li:lt(' + ($('.scroll>ul').children().length - 200) + ')').remove();
                            }
                        });
                    mission.scrollFlag = false;
                    $scroll.scrollTop($scroll[0].scrollHeight);
                }
            }
        } else {
            $scroll.scrollTop($scroll[0].scrollHeight);
        }

    });
    $('#jqxMenu_tabs').on('itemclick', function (event) {
        let element = event.args;
        if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
        let params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
        rightClickMenuList(params);
        sendApiToJump(params, 'resultobject');
    });
    $('#jqxMenu_index').on('itemclick', function (event) {
        let element = event.args;
        if ($(element).parent().hasClass("jqx-menu-ul"))return; //点击的不是第二级菜单return
        let params = JSON.parse(element.getAttribute("item-value").replace(/'/g, "\""));
        rightClickMenuList(params);
        sendApiToJump(params, 'standardobject');
    });
});