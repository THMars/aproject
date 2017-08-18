/**
 * Created by ad on 2016/10/5.
 */
/*弹窗开始*/
$(function () {
    var customButtonsDemo = (function () {
        var _collapsed = false;

        function _addEventListeners() {
            $('#showWindowButton').click(function () {
                getNotInUsers('', mission.userID, function (data) {
                    var dataFiltered = data.filter(function (item) {
                        return item.userID !== mission.userID;
                    });
                    $("#memberList").jqxGrid('source', getAdapter(dataFiltered));
                });
                // $('#customWindow h3').text('创建会战：');
                $("#customWindowWarp").show();
                $('#customWindow').attr("num", '').show();
                // $(".battle").css("opacity", "0.3");
            });
        }

        function _createElements() {
            // console.log($('#customWindow'));
            $('#searchTextButton').jqxButton({width: '80px', disabled: false});
            $('#cancelButton').jqxButton({width: '80px', disabled: false});
        }

        return {
            init: function () {
                _createElements();
                _addEventListeners();
            }
        };
    }());
    customButtonsDemo.init();
    /*addEventListeners();*/
    createElements();
    function capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    function createElements() {
        /*        var jqxWidget = $('#jqxWidget');
         var offset = jqxWidget.offset();*/
        $('#eventWindow').jqxWindow({
            autoOpen: false,
            height: 100, width: 270,
            resizable: false, isModal: true, modalOpacity: 0.3,
            okButton: $('#ok'), cancelButton: $('#cancel'),
            initContent: function () {
                $('#ok').jqxButton({width: '65px'});
                $('#cancel').jqxButton({width: '65px'});
                $('#ok').focus();
            }
        });
    }

    /*    $("#jqxWidget").css('visibility', 'visible');*/
    /*11.22修复选中添加房间bug*/
    $("#cancelButton").click(function () {
        $("#memberList").jqxGrid("clearselection");
        $('#customWindow #searchTextInput').val('');
        $("#customWindowWarp").hide();
        $('#customWindow').hide();
        // $(".battle").css("opacity", "1");
        $("#main-container").find("div").each(function () {
            if ($(this).attr("select") == "y") {
                mission.roomID = $(this).attr("data-role");
            }
        });
        $("#main-container").find("li").each(function () {
            if ($(this).attr("select") == "y") {
                mission.roomID = $(this).attr("data-role");
            }
        });
    });
    $('#searchTextButton').click(function () {
        let nameFlag = false;
        var name = $('#customWindow #searchTextInput').val();
        $('#main-container').find('span').each(function () {
            if ($(this).text() == name) {
                alert('请不要重复房间名！');
                $('#searchTextInput').focus();
                nameFlag = true;
                return false;
            }
        });
        if (nameFlag) return;
        var desc = $('#explain').text();
        /*添加成员开始*/
        var memberinfo = ($("#memberList").jqxGrid('getselectedrowindexes')).map(function (index, item) {
            return $("#memberList").jqxGrid('getrowdata', index)
        });
        memberinfo = memberinfo.map(function (item) {
            return item.userID;
        });
        /*添加成员介绍*/
        var num = $("#customWindow").attr("num");
        var parentid = num == null || num == undefined ? null : num;
        if (name != "") {
            $('#searchTextInput').val('');
            $('#explain').text('');
            $('#customWindow').hide();
            $('#customWindowWarp').append(loadingAnimate());
            createRoom(name, desc, parentid, mission.userID, memberinfo, createRoomSuccess);
        } else {
            alert('请在输入框中输入您想要的名称');
            $("#searchTextInput").focus();
        }
        $("#memberList").jqxGrid("clearselection");
    });
    $('#ok').click(function () {
        var num = $("#eventWindow").attr("num");
        disableRoom(num, function (data) {
            $("#main-container").find("span").each(function () {
                if ($(this).parent().attr("data-role") === num) {
                    if ($(this).parent().hasClass("tab")) {
                        $(this).parent().next().remove();
                    }
                    if ($(this).parent().attr("select") == "y") {
                        $(this).parent().remove();
                        parentClick($($("#main-container").children()[0]).find(".parent"));
                    } else {
                        $(this).parent().remove();
                    }
                }
            });
            $("#eventWindow").jqxWindow('close');
            $("#main-container").getNiceScroll().resize();
        });
    });

    $("#memberList").jqxGrid({
        width: '100%',
        height: '100%',
        pageable: false,
        selectionmode: 'checkbox',
        altrows: true,
        columns: [
            {text: '姓名', datafield: 'userName', width: "30%"},
            {text: '地域', datafield: 'userLocation', width: "20%"},
            {text: '级别', datafield: 'userPost', width: "20%"},
            {text: '部门', datafield: 'userDepartment'}]
    });
    $(".tree-addroom").click(function () {
        getNotInUsers(mission.roomID, mission.userID, function (data) {
            var dataFiltered = data.filter(function (item) {
                return item.userID !== mission.userID;
            });
            $("#memberList").jqxGrid('source', getAdapter(dataFiltered));
        });
        $("#customWindowWarp").show();
        $('#customWindow').show();
        // $(".battle").css("opacity", "0.3");
        $('#ok').jqxButton({disabled: false});
        $('#customWindow h3').text("创建房间：");
    });
    $(".tree-reroom").click(function () {
        var offset,
            roomName;
        $("#main-container").find("span").each(function () {
            if ($(this).parent().attr("data-remove") === "y") {
                offset = $(this).offset();
                roomName = $(this).text();
                if ($(this).parent().hasClass("tab")) {
                    if ($(this).parent().next().find("ul").children().length > 0) {
                        $("#eventWindow").jqxWindow('open');
                        $("#eventWindow").jqxWindow('position', [offset.left + 232, offset.top]);
                        $("#eventWindow").find("p").text("请您先删除" + roomName + "大厅下的子房间");
                        $('#ok').jqxButton({disabled: true});
                    } else {
                        $("#eventWindow").jqxWindow('open');
                        $("#eventWindow").jqxWindow('position', [offset.left + 232, offset.top]);
                        $("#eventWindow").find("p").text("您确定将" + roomName + "大厅删除");
                        $('#ok').jqxButton({disabled: false});
                        var pid = $(this).parent().attr("data-role");
                        $("#eventWindow").attr("num", pid);
                    }
                } else {
                    $("#eventWindow").jqxWindow('open');
                    $("#eventWindow").jqxWindow('position', [offset.left + 254, offset.top]);
                    $("#eventWindow").find("p").text("您确定将" + roomName + "房间删除");
                    $('#ok').jqxButton({disabled: false});
                    var pid = $(this).parent().attr("data-role");
                    $("#eventWindow").attr("num", pid);
                }
            }
            $(this).parent().attr("data-remove", "");
        });
    });
    // $('#customWindowContent').niceScroll({
    //     cursoropacitymax: 0
    // });

    //初始化fileGrid
    $('#fileGrid').jqxGrid(
        {
            width: '98%',
            height: '98%',
            sortable: true,
            filterable: true,
            filtermode: 'excel',
            autoshowfiltericon: false,
            columnsresize: true,
            altrows: true,
            columns: [
                {text: '文件名', datafield: 'attachmentName', width: '30%'},
                {text: '类型', datafield: 'attachmentType', width: '13%'/*, width: 90*//*, filtertype: 'checkedlist'*/},
                {text: '上传用户', datafield: 'uploadUserName', width: '20%'/*, filtertype: 'checkedlist'*/},
                {text: '上传时间', datafield: 'uploadTime', width: '27%'/*, filtertype: 'checkedlist'*/},
                {
                    text: '下载',
                    datafield: 'attachmentID',
                    width: '10%',
                    filterable: false,
                    // columntype: 'button',
                    cellsrenderer: function (row, columnfield, value) {
                        // return '<div>' + value + '</div>';
                        return '<a style="display:inline-block; color: #ffffff; width: 100%; height: 100%;line-height: 2.5em; text-align: center" target="_blank" href=http://' + window.location.host + '/attachments/download/?roomID=' + mission.roomID + '&attachmentID=' + value + '&token=' + getURLParams('token') + '><i class="fa fa-download" aria-hidden="true"></i></a>';
                    }
                }
            ]
        }
    );
    $('#fileContainer').show();


    //初始化房间内附件搜索框
    $("#fileInput").jqxInput({placeHolder: "请输入文件名", height: 23, width: '100%', minLength: 1});
    //初始化房间内附件搜索点击按钮
    $('#fileSearch').jqxButton({
        width: 25,
        height: 25,
        imgSrc: '../css/images/search_lg.png',
        imgWidth: 16,
        imgHeight: 16,
        imgPosition: 'center'
    });


    //附件搜索框绑定select事件
    $("#fileInput").on('select', inputSelect);
    //附件搜索按钮绑定点击事件
    $("#fileSearch").click(function () {
        var searchText = $("#fileInput").val();

        if (searchText.length > 0) {
            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var filtervalue = searchText;
            var filtercondition = 'contains';
            var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);
            $("#fileGrid").jqxGrid("addfilter", 'userName', filtergroup);
            //调用过滤器
            $("#fileGrid").jqxGrid('applyfilters');
        }
    });


    //附件列表绑定filter事件
    $("#fileGrid").on("filter", gridFilter);


    function createIconList(data) {
        var containier = document.getElementById("fileGridWrap"),
            length = data.length;
        for (var i = length - 1; i >= 0; i--) {
            var wrap = document.createElement("div"),
                img = document.createElement("img"),
                span = document.createElement("span");
            wrap.setAttribute("class", "iconWrap");
            wrap.appendChild(img);
            span.innerHTML = data[i]["attachmentName"];
            wrap.appendChild(span);
            container.appendChild(wrap);
        }
    }
    /*附件展示区显示拖拽文件提示*/
    document.querySelector('#fileGridWrap').addEventListener('dragenter', function (e) {
        "use strict";
        var dropZone = document.querySelector('#fileDropZone');
        dropZone.style.display = 'block';
    }, false);
    document.querySelector('#fileDropZone').addEventListener('dragleave', function(e){
        var dropZone = document.querySelector('#fileDropZone');
        dropZone.style.display = 'none';
    }, false);
    document.querySelector('#fileDropZone').addEventListener('drop', function(e){
        var dropZone = document.querySelector('#fileDropZone');
        dropZone.style.display = 'none';
    }, false);
});

//定义fileGrid的数据适配器
function getFileAdapter(data) {
    var source = {
        localdata: data,
        datatype: "array",
        datafields: [
            {name: 'attachmentID', type: 'string'},
            {name: 'attachmentName', type: 'string'},
            {name: 'attachmentType', type: 'string'},
            {name: 'uploadTime', type: 'string'},
            {name: 'uploadUserName', type: 'string'},
            {name: 'attachmentPath', type: 'string'}
        ],
        updaterow: function (rowid, rowdata, commit) {
            //同步向服务器发送updateRow命令
            //如果与服务器同步成功则调用含有参数true的commit命令
            //否则调用含有false参数的commit命令
            commit(true);
        },
        deleterow: function (rowid, commit) {
            //同步向服务器发送deleteRow命令
            //如果与服务器同步成功则调用含有参数true的commit命令
            //否则调用含有false参数的commit命令
            commit(true);
        }
    };
    var dataAdapter = new $.jqx.dataAdapter(source);
    /*console.log(dataAdapter);*/
    return dataAdapter;
}
//定义file展示模块的刷新函数
function fileRefresh(data) {
    var searchFiles = [];
    for (var i in data) {
        data[i].uploadTime = (new Date(Number(data[i].uploadTime))).toLocaleString();
        searchFiles.push(data[i].attachmentName)
    }
    $('#fileGrid').jqxGrid('source', getFileAdapter(data));
    $("#fileInput").jqxInput('source', searchFiles);
}

/**
 * anno
 * @param data
 */
function objectReflush(data) {
    getMeetingObjects(data)
}

function fileAdd(data) {
    console.log(data);
    var dataNow = $('#fileGrid').jqxGrid('getrows'),
        searchFiles = [];
    for (var i in data) {
        data[i].uploadTime = (new Date(Number(data[i].uploadTime))).toLocaleString();
        dataNow.unshift(data[i]);
    }

    for (var j in dataNow) {
        searchFiles.push(dataNow[j].attachmentName);
    }
    $('#fileGrid').jqxGrid('source', getFileAdapter(dataNow));
    $("#fileInput").jqxInput('source', searchFiles);
}
function dataSort(data) {
    var value;
    data.sort(function (first, second) {
        if (first.parentID && second.parentID) {
            return first.parentID - second.parentID
        } else if (first.parentID && !second.parentID) {
            value = first.parentID - second.meetingID;
            if (value == 0) {
                return 1;
            }
            return value;
        } else if (!first.parentID && second.parentID) {
            value = first.meetingID - second.parentID;
            if (value == 0)
                return -1;
            return value;
        } else {
            return first.meetingID - second.meetingID;
        }
    });
    data.sort(function (f, s) {
        return f.status - s.status;
    });
    return data;
}
function getMyRoomSuccess(data) {
    dataSort(data);
    var temp = null;
    var tempID = null;
    for (var i = 0; i < data.length; i++) {
        if (!data[i].parentID) {
            if (temp) {
                $('#main-container').prepend(temp);
                temp = null;
            }
            tempID = data[i].meetingID;
            temp = $('<div data-status="' + data[i].status + '" data-nid="' + data[i].newMessageID + '" data-lid="' + data[i].lastMessageID + '" id="meetingTree' + data[i].meetingID + '" class="tab tabNoSelected" data-uid="' + data[i].createUserID + '" data-pid="' + data[i].parentID + '" data-role="' + data[i].meetingID + '">' +
                '<h3><span class="tree-meet fa fa-users"></span></h3>' +
                '<span class="parent-a parent">' + data[i].name + '</span>' +
                '<p id="unread"></p><e class="newCreate"></e></div><div id="' + tempID + 'Body" class="tabBody">' +
                '<ul class="tabBodyOptions"></ul></div>');
        } else {
            temp.find('ul').prepend($('<li class="eventForClick" data-status="' + data[i].status + '" data-nid="' + data[i].newMessageID + '" data-lid="' + data[i].lastMessageID + '" id="meetingTree' + data[i].meetingID + '"  data-uid="' + data[i].createUserID + '" data-pid="' + data[i].parentID + '" data-role="' + data[i].meetingID + '">' +
                '<span class="parent-s parent"><span class="tree-room fa fa-users"></span>' + data[i].name + '</span>' +
                '<p id="unread"></p><e class="newCreate"></e></li>'));
        }
    }
    if (temp) {
        $('#main-container').prepend(temp);
    }
    tips($("#main-container"), "span");
    countUnread();
    masterRoom();
    $("#main-container").find("div").each(function () {
        if ($(this).attr("data-status") == 0) {
            $(this).find("span").css({"color": "#777"});
            $('<div class="isStop"></div>').appendTo($(this).find("h3"));
            // $(this).find(".parent").prepend('<i class="fa fa-stop-circle-o" style="font-size:14px; color: #ff3831; margin-right: 5px"></i>');
        }
    }).end().find("li").each(function () {
        if ($(this).attr("data-status") == 0) {
            $(this).find("span").css("color", "#777");
            $('<div class="isStop" style="height:42px;"></div>').appendTo($(this));
            // $(this).css({"border-left":"8px solid rgb(97, 98, 99)"});
            //$('<i class="fa fa-stop-circle-o" style="font-size:14px;color:#ff3831;margin-right:5px"></i>').insertAfter($(this).find(".tree-room"));
        }
    });
    $("#main-container").getNiceScroll().resize();
}
function createRoomSuccess(data) {
  /*  let tempDom = $("#meetingTree" + data.meetingID + " .parent"),
        tempH3 = $('#meetingTree' + data.meetingID + ' h3');*/
    if (data.parentID != null && data.parentID != "") {
        $("#main-container").find("div").each(function () {
            if ($(this).attr("data-role") === data.parentID) {
                $('<li class="eventForClick" data-lid="' + data.lastMessageID + '" data-nid="' + data.newMessageID + '" id="meetingTree' + data.meetingID + '" data-uid="' + data.createUserID + '" data-pid="' + data.parentID + '" data-role="' + data.meetingID + '">' +
                    '<span class="parent-s parent">' +
                    '<span class="tree-room fa fa-users">' +
                    '</span>' + data.name + '</span><p id="unread"></p>' +
                    '<e class="newCreate"></e></li>').prependTo($(this).next().find("ul"));
            }
        });
    } else {
        let newCreateRoom = $('<div data-lid="' + data.lastMessageID + '" data-nid="' + data.newMessageID + '" id="meetingTree' + data.meetingID + '"  data-uid="' + data.createUserID + '"  data-pid="' + data.parentID + '" data-role="' + data.meetingID + '" class="tab tabNoSelected">' +
            '<h3><span class="tree-meet fa fa-users"></span></h3>' +
            '<span class="parent-a parent">' + data.name + '</span><p id="unread"></p>' +
            '<e class="newCreate"></e></div>' +
            '<div id="' + data.meetingID + 'Body" class="tabBody">' +
            '<ul class="tabBodyOptions"></ul></div>');
        if ($('#main-container').find("#pinned").length == 0) {
            $("#main-container").prepend(newCreateRoom);
        } else {
            newCreateRoom.insertAfter($("#pinned"));
        }
    }
    if (data.createUserID == mission.userID) {
        if (data.parentID != "" && data.parentID != "") {
            $("#meetingTree" + data.meetingID + " .parent").parent().parent().parent().slideDown();
            $("#meetingTree" + data.meetingID + " .parent").trigger("click");
        } else {
            $("#meetingTree" + data.meetingID).trigger("click");
        }
    }
    $("#customWindowWarp").hide().children().remove();

    $("#main-container").getNiceScroll().resize();
    tips($("#main-container"), "span");
    masterRoom();
}


function parentClick(parent) {
    objectID = null;
    missionRoomRightClick.rightClickBallData.clear();
    missionRoomRightClick.rightClickApiMap.clear();
    missionRoomRightClick.selectDataMap.clear();
    isStopRoom = false;
    $(".title").text('连接中...');
    $(".svgRoomTitle").text('连接中...');
    $("#close_tabs-btn").trigger("click");
    if (parent.parent().data("status") == 0) {
        isStopRoom = true;
    }
    //点击切换房间时清除掉对话框中的消息
    if (parent.parent().attr("select") != "y") {
        $('.scroll').append(loadingAnimate());
        $("#add-element").children().remove();
    }
    $("li").removeClass("tabSelected");
    $(".tab").removeClass("tabSelected").addClass("tabNoSelected");
    parent.parent().removeClass("tabNoSelected").addClass("tabSelected");
    mission.roomID = parent.parent().attr('data-role');
    mission.roomName = parent.text();
    mission.parentID = parent.parent().attr('data-pid');

    //清空选中
    $(".tab").attr("select", "");
    $(".tabBodyOptions li").attr("select", "");
    parent.parent().parent().parent().prev().find(".tree-meet").css({"animation": "none"});
    //选中自己
    parent.parent().attr({select: "y"});
    $("#message_tabs").hide();
    //触发事件
    myMissionEvent.trigger('changeMission', {
        roomID: parent.parent().attr('data-role'),
        parentID: parent.parent().attr('data-pid'),
        createUserID: parent.parent().attr('data-uid')
    });
    $(".back").hide();
    $(".newMsg").hide();
    // $("#unread").hide();
    parent.parent().find("e").hide();
    parent.parent().find("p").hide();
    // $(".newCreate").hide();
    mission.msgEndID = parent.parent().attr('data-nid');
    mission.msgStartID = parent.parent().attr('data-lid');
    //获取未读消息的数量
    if (mission.msgEndID - mission.msgStartID > 20) {
        if (mission.msgStartID != -1) {
            $(".newMsg").show().find("span").text(mission.msgEndID - mission.msgStartID);
        } else {
            $(".newMsg").show().find("span").text(mission.msgEndID);
        }
    }
    // for (let i = 0; i < 501; i++) {
    //     (function (i){
    //         addMessage(mission.roomID, mission.userID, mission.userName, i, '', '');
    //     })(i)
    // }
}

//树列表显示未读消息的条数
function countUnread() {
    $("#main-container").find("div").each(function () {
        var $nid = $(this).attr('data-nid');
        var $lid = $(this).attr('data-lid');
        var unread;
        if ($lid >= 0) {
            $(this).find("e").hide();
            unread = $nid - $lid;
        } else if ($lid == -1) {
            unread = $nid;
        }
        if (unread > 0) {
            if (unread > 99) {
                $(this).find("p").show().text("99+");
            } else {
                $(this).find("p").show().text(unread);
            }
        }
    });
    $("#main-container").find("li").each(function () {
        var $nid = $(this).attr('data-nid');
        var $lid = $(this).attr('data-lid');
        var unread = $nid - $lid;
        if ($lid >= 0) {
            $(this).find("e").hide();
        } else if ($lid == -1) {
            unread = $nid;
        }
        if (unread > 0) {
            if (unread > 99) {
                $(this).find("p").show().text("99+");
            } else {
                $(this).find("p").show().text(unread);
            }
        }
    });
}

function masterRoom() {
    $('.tab').each(function () {
       if($(this).attr('data-uid') == mission.userID) {
           $(this).find('.tree-meet').css({"color": "#7debff"});
       }
    });
    $('.eventForClick').each(function () {
        if($(this).attr('data-uid') == mission.userID) {
            $(this).find('.tree-room').css({"color": "#7debff"});
        }
    });
}

