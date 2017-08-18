//全局变量
// var mission = {
//     roomID: null,
//     roomName: '',
//     parentID: null,
//     userID: "u2",
//     userName: "李斯",
//     userPost: "处长",
//     userDepartment: "部门一",
//     userLocation: "湖南长沙",
//     msgStartID: null,
//     msgEndID: 0,
//     scrollFlag: true
// };
var meetingIDForShowPage = -1;
var mission = JSON.parse($('#userInfo').text());
mission.scrollFlag = true;
mission.msgStartID = null;
mission.msgEndID = 0;
console.log(mission);


myMissionEvent = {
    event: [],
    eventHandle: [],
    trigger: function (type, MissonInfo) {
        var index = this.event.indexOf(type);
        if (index >= 0) {
            for (var i in this.eventHandle[index]) {
                this.eventHandle[index][i](MissonInfo);
            }
        }
        // console.log(this.eventHandle);
        // console.log(this.event);
    },
    bind: function (type, func) {
        var index = this.event.indexOf(type);
        if (index < 0) {
            index = this.event.push(type) - 1;
            this.eventHandle.push([]);
        }
        this.eventHandle[index].push(func);
    }
};


$(function () {
    $("#displayName").text(mission.userName);
    $("#displayDment").text(mission.userDepartment);
    $("#j-text").jqxEditor('focus');
    setSplitter();
    arrowsShrink();
    // restMissionVar('57e73e9dde3c33279825627b');
    $('#meeting_tab').on('selected', function (event) {
        let currentId = event.args.item;
        console.log(currentId);
        if(currentId === 2) {

        }
    })
});


function arrowsShrink() {
    //11.24修改 收缩
    $(".jqx-splitter-splitbar-horizontal").hover(function () {
        if ($(this).hasClass("jqx-splitter-splitbar-collapsed")) { //判断当前状态，是否收缩
            $(this).find(".jqx-splitter-collapse-button-horizontal").css({
                "top": "-20px"
            }).addClass("fa fa-angle-double-up fa-2x").attr("aria-hidden", "true");
        } else {
            $(this).find(".jqx-splitter-collapse-button-horizontal").css({
                "top": "0",
                "color": "#fff"
            }).addClass("fa fa-angle-double-down fa-2x").attr("aria-hidden", "true");
        }
        $(this).find(".jqx-splitter-collapse-button-horizontal").css({
            "height": "5px",
            "z-index": "10",
            "text-align": "center",
            "background": "none",
        });
    }, function () {
        $(this).find(".jqx-splitter-collapse-button-horizontal").css({
            "height": "5px",
            "top": "0"
        }).removeClass("fa fa-angle-double-down fa-angle-double-up fa-2x");
    });
    $(".jqx-splitter-splitbar-vertical").hover(function () {
        if ($(this)[0] == $(".jqx-splitter-splitbar-vertical")[0]) {//左边收缩和右边收缩样式不一样
            if ($(this).hasClass("jqx-splitter-splitbar-collapsed")) {
                $("#ascrail2000-hr").find("div").hide();
                $(this).find(".jqx-splitter-collapse-button-vertical").css({
                    "position": "absolute",
                    "left": "5px"
                }).addClass("fa fa-angle-double-right fa-2x").attr("aria-hidden", "true");
            } else {
                $(this).find(".jqx-splitter-collapse-button-vertical").css({
                    "position": "absolute",
                    "left": "-15px"
                }).addClass("fa fa-angle-double-left fa-2x");
            }
        } else {
            if ($(this).hasClass("jqx-splitter-splitbar-collapsed")) {
                $(this).find(".jqx-splitter-collapse-button-vertical").css({
                    "position": "absolute",
                    "left": "-15px"
                }).addClass("fa fa-angle-double-left fa-2x").attr("aria-hidden", "true");
            } else {
                $(this).find(".jqx-splitter-collapse-button-vertical").css({
                    "position": "absolute",
                    "left": "5px"
                }).addClass("fa fa-angle-double-right fa-2x");
            }
        }
        $(this).find(".jqx-splitter-collapse-button-vertical").css({
            "width": "30px",
            "z-index": "10",
            "line-height": "45px",
            "background": "none"
        });
    }, function () {
        $(this).find(".jqx-splitter-collapse-button-vertical").css({
            "width": "5px",
            "left": "0",
        }).removeClass("fa fa-angle-double-left fa-angle-double-right fa-2x");
    });
}

function setSplitter() {
    $('#main').jqxSplitter({
        splitBarSize: 5,
        width: '99%',
        height: '98%',
        orientation: 'vertical',
        panels: [
            {size: "75%", min: "50%", collapsible: false},
            {size: '25%', min: "10%"}
        ]
    }).on('resize', function (event) {
        $("#main-container").getNiceScroll().resize();
        tips($("#main-container"), "span");
    });

    $('#splitterLeft').jqxSplitter({
        splitBarSize: 5,
        width: "100%", height: "100%", panels: [
            {size: '30%', min: '15%'}, {size: "70%", min: "70%"}]
    }).on('resize', function (event) {
        $("#main-container").getNiceScroll().resize();
        tips($("#main-container"), "span");
    });

    $("#splitterleftMain").jqxSplitter({
        splitBarSize: 5,
        orientation: 'horizontal',
        width: "100%", height: "100%", panels: [{size: "50%", collapsible: false}, {size: "50%"}]
    }).on('resize', function (event) {
        $("#main-container").getNiceScroll().resize();
    });

    $('#splitterRight').jqxSplitter({
        splitBarSize: 5,
        orientation: 'horizontal', width: "100%", height: "100%", panels: [
            {size: "50%", collapsible: false}, {size: '50%'}]
    }).on('resize', function (event) {
        $("#main-container").getNiceScroll().resize();
        tips($("#main-container"), "span");
    });

    $('#SplitterChat').jqxSplitter({
        splitBarSize: 5,
        orientation: 'horizontal', width: "100%", height: $(window).height() - 30,
        panels: [
            {size: "50%", collapsible: false}, {size: "50%"}]
    }).css('border', 'none').on('resize', function (event) {
        $("#main-container").getNiceScroll().resize();
        $(".chat-input").css("height", event.args.panels[1].size - $(".btn-box").height() - 1);
    });
    $(".chat-input").css("height", ($(".chat-input").parent().height()) - $(".btn-box").height() - 1);

    $("#main-container").getNiceScroll().resize();
}

function monitorScreen() {
    if ($(".scroll").scrollTop() == 0) {
        $(".back").hide();
    }
    tips($("#main-container"), "span");
    var winWidth = $(window).width();
    var winHeight = $(window).height() * 0.98;
    var chatWidth = winWidth - $(".my-battle").width() - $(".search").width() - 60;
    var maxWidth = chatWidth - 200;
    $(".message").css({"max-width": maxWidth, "word-wrap": "break-word"});
    $(".chat-input").css("min-width", 250);
    $("#SplitterChat").jqxSplitter({height: winHeight - 58});
    $(".chat-input").height($(".chat-input").parent().height() - $(".btn-box").height());
}
$(function () {
    var fileContainerDroped = false;
    document.querySelector('#fileContainer').addEventListener('drop', function (e) {
        fileContainerDroped = true;
    });
    //$('#fileupload').fileupload();
    myMissionEvent.bind('changeMission', function (MissionInfo) {
        mission.createUserID = MissionInfo.createUserID;

        initIndexForShowPage(MissionInfo.roomID);

        $("#memberGrid").jqxGrid('clear');
        getMember(MissionInfo.roomID);

        $('#otherGrid').jqxGrid('clear');
        getMeetingObjects(MissionInfo.roomID);

        $("#fileInput").jqxInput('clear');
        getAttachment(MissionInfo.roomID, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            fileRefresh(data);
        });
        //上传附件
        $('#fileupload').fileupload({
            url: '/uploadfile?roomID=' + MissionInfo.roomID + '&token=' + getURLParams("token"),
            dataType: 'json',
            done: function (e, data) {
                var file = data.result;
                if (errFunc(file))return;
                $("#uploadProgress").animate({width: '0%'}, 50, 'linear');
                if (fileContainerDroped) {
                    //fileAdd([file]);
                    //AddSingleMessage()
                    fileContainerDroped = false;
                    addMessage(mission.roomID, mission.userID, mission.userName, '', [file.attachmentID], []);
                } else {
                    $('<div aid=' + file.attachmentID + '>' + '<span>' + file.attachmentName + '<button type="button" style="outline: 0; opacity: 1; text-shadow:0px 0px 0px #fff" class="close btn btn-xs"><span aria-hidden="true" style="color: #fff">&times;</span><span class="sr-only">Close</span></button>' + '</span>' + '</div>').appendTo($("#fileDisplay"));
                }
            },
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#uploadProgress').animate(
                    {width: progress + "%"},
                    500,
                    'linear'
                );
            }
        });
    });

    gridMenuEvent();
    getRooms(mission.userID);

    //获取全部用户信息
    // getNotInUsers(null, mission.userID, function (data) {
    //     getMemberSuccess(data);
    // });
    //初始化用户屏幕尺寸
    monitorScreen();
    $(".search-file").css({"width": "calc(100% - 1.25em)"});
    //监听用户屏幕尺寸变化
    $(window).on("resize", monitorScreen);
});
/*
 $(document).bind('drop dragover', function (e) {
 e.preventDefault();
 });
 */
function throttle(method, context) { /*避免连续触发resize*/
    clearTimeout(method.tId);
    method.tId = setTimeout(function () {
        method.call(context);
    }, 200);
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
