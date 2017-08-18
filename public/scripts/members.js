$(document).ready(function () {
    //initui开始
    //初始化房间内现有成员展示列表memberGrid
    $('#memberGrid').jqxGrid(
        {
            width: '100%',
            height: '98%',
            sortable: true,
            // filterable: true,
            // filtermode: 'excel',
            autoshowfiltericon: false,
            autoshowloadelement: false,
            columnsresize: true,
            altrows: true,
            columns: [
                {text: '姓名', datafield: 'userName', width: '30%', cellsrenderer: cellRender},
                {text: '地域', datafield: 'userLocation', width: '20%'/*, width: 90*//*, filtertype: 'checkedlist'*/},
                {text: '级别', datafield: 'userPost', width: '20%'/*, filtertype: 'checkedlist'*/},
                {text: '部门', datafield: 'userDepartment', width: '30%'/*, filtertype: 'checkedlist'*/}
            ]
        }
    );
    $("#memberContainer").show();

    //初始化房间内成员搜索框
    $("#memberInput").jqxInput({placeHolder: "请输入成员名", height: 23, width: '100%', minLength: 1});
    //初始化房间内成员搜索点击按钮
    $("#memberSearch").jqxButton({
        width: 25,
        height: 25,
        imgSrc: '../css/images/search_lg.png',
        imgWidth: 16,
        imgHeight: 16,
        imgPosition: 'center'
    });
    //初始化房间内现有成员列表的对话菜单
    var contexMenu = $("#gridMenu").jqxMenu({width: 200, height: 29, autoOpenPopup: false, mode: 'popup'});
    //初始化删除房间内现有成员窗口
    $("#deleteWindow").jqxWindow({
        height: 110,
        width: 250,
        resizable: false,
        isModal: true,
        autoOpen: false,
        modalOpacity: 0.01
    });
    //初始化删除取消按钮和删除确认按钮
    $("#deleteCancel").jqxButton();
    $("#deleteConfirm").jqxButton();

    //填充待加成员列表
    $('#setMemberBtn').mousedown(function () {
        if (mission.parentID) {
            getNotInUsers(mission.parentID, mission.userID, freshMemberSearchedList);
        } else {
            getNotInUsers('', mission.userID, freshMemberSearchedList);
        }
    });
    var height = $(window).height();
    //初始化管理成员窗口
    $("#popoverMember").jqxPopover({
        offset: {left: 0, top: height/6},
        isModal: true,
        arrowOffsetValue: -height/6,
        position: "right",
        title: "先搜索后添加",
        showCloseButton: true,
        selector: $("#setMemberBtn"),
        /*height:400,*/
        width: 360
    });
    //初始化筛选搜索框
    $("#searchMemberInput").jqxInput({placeHolder: "请输入成员名", height: 23, width: '92%', minLength: 1});
    //初始化筛选按钮
    $("#searchMember").jqxButton({
        width: 25,
        height: 25,
        imgSrc: '../css/images/search_lg.png',
        imgWidth: 16,
        imgHeight: 16,
        imgPosition: 'center'
    });

    $(window).on("resize", function () {
        height = $(window).height();
        $("#memberSearchedList").jqxGrid({height:height/4})
    });
    //初始化系统内成员展示列表
    $("#memberSearchedList").jqxGrid({
        width: '100%',
        pageable: false,
        selectionmode: 'checkbox',
        columns: [
            {text: '姓名', datafield: 'userName', width: 80},
            {text: '地域', datafield: 'userLocation', width: 60},
            {text: '级别', datafield: 'userPost', width: 60},
            {text: '部门', datafield: 'userDepartment'}],
        height:height/4
    });


    //iconList生成函数
    function createIconList(data) {
        var length = data.length,
            fileGridWrap = document.getElementById("fileGridWrap");
        for (var i = length - 1; i >= 0; i--) {
            var iconWrap = document.createElement('div'),
                img = document.createElement('img'),
                span = document.createElement('span');
            iconWrap.setAttribute('class', 'iconWrap');
            span.innerHTML = data[i].attachmentName;
            img.setAttribute("src", '/images/' + data[i].attachmentType + '.png');
            iconWrap.appendChild(img);
            iconWrap.appendChild(span);
            fileGridWrap.appendChild(iconWrap);
        }
    }

    //initui结束


    //所有控件开始绑定事件
    //图片上传控件绑定监听事件
    $("#imageUpload").on('uploadEnd', function (event) {
        var args = event.args;
        var fileName = args.file;
        var stopIndex = fileName.indexOf('.');
        var name = fileName.slice(0, stopIndex);
        var extension = fileName.slice(stopIndex);
        var iconUrl;
        var serverResponse = args.response;
        $("#editor", 'insertHTML', "<div><img src ='" + "../images/nav1.png'" + "' style= 'display: inline; width: 16px; margin-right: 5px;' /><span>" + name + "<strong>" + extension + "</strong></span></div>");
    });


    //文件上传控件绑定监听事件
    $("#fileUpload").on('uploadEnd', function (event) {
        var args = event.args;
        var fileName = args.file;
        var stopIndex = fileName.indexOf('.');
        var name = fileName.slice(0, stopIndex);
        var extension = fileName.slice(stopIndex);
        var iconUrl;
        var serverResponse = args.response;
        $("#editor", 'insertHTML', "<div><img src ='" + "../images/nav1.png'" + "' style= 'display: inline; width: 16px; margin-right: 5px;' /><span>" + name + "<strong>" + extension + "</strong></span></div>");
    });


    //定义一个input控件select事件之后的回调函数
    function inputSelect() {
        var searchText = $(this).val(),
            filtergroup = new $.jqx.filter(),
            filter_or_operator = 1,
            filtervalue = searchText,
            filtercondition = 'contains',
            filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        filtergroup.addfilter(filter_or_operator, filter);
        if (searchText.length > 0) {
            switch ($(this).attr("id")) {
                case "memberInput":
                    /*console.log(searchText);*/
                    $("#memberInput").unbind("change");
                    $("#memberGrid").jqxGrid("addfilter", 'userName', filtergroup);
                    //调用过滤器
                    $("#memberGrid").jqxGrid('applyfilters');
                    /*                    $("#memberGrid").on("filter", gridFilter);*/
                    break;
                case "searchMemberInput":
                    $("#searchMemberInput").unbind("change");
                    $("#memberSearchedList").jqxGrid("addfilter", 'userName', filtergroup);
                    //调用过滤器
                    $("#memberSearchedList").jqxGrid('applyfilters');
                    break;
                case "fileInput":
                    $("#fileInput").unbind("change");
                    $("#fileGrid").jqxGrid("addfilter", 'attachmentName', filtergroup);
                    //调用过滤器
                    $("#fileGrid").jqxGrid('applyfilters');
                    break;
            }
        }
    }

    //定义一个input控件change事件之后的回调函数
    function inputChange() {
        switch ($(this).attr("id")) {
            case "memberInput":
                console.log("输入改变");
                $("#memberGrid").jqxGrid("clearfilters");
                /*$("#memberGrid").jqxGrid("refresh");*/
                break;
            case "searchMemberInput":
                $("#memberSearchedList").jqxGrid("clearfilters");
                break;
            case "fileInput":
                $("#fileGrid").jqxGrid("clearfilters");
                break;
        }
    }


    //成员列表下方搜索框绑定select事件
    $("#memberInput").on('select', inputSelect);
    //成员列表下方搜索框绑定change事件
    /*$("#memberInput").on('change', inputChange);*/
    //成员列表标题下方搜索，搜索按钮绑定点击事件
    $("#memberSearch").click(function () {
        var searchText = $("#memberInput").val();

        if (searchText.length > 0) {
            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var filtervalue = searchText;
            var filtercondition = 'contains';
            var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);
            $("#memberGrid").jqxGrid("addfilter", 'userName', filtergroup);
            //调用过滤器
            $("#memberGrid").jqxGrid('applyfilters');
        }
    });

    //取消房间内现有成员列表整体对contextMenu事件的监听
    $("#memberGrid").on("contextmenu", function () {
        return false;
    });


    //房间内现有成员列表绑定filter事件
    $("#memberGrid").on("filter", gridFilter);


    //房间内现有成员列表的列表项绑定contextMenu事件
    $("#memberGrid").on('rowclick', function (event) {
        if (event.args.rightclick) {
            $("#memberGrid").jqxGrid('selectrow', event.args.rowindex);
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            contexMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 5 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);

            return false;
        }
    });


    //系统内现有成员搜索框绑定select事件
    $("#searchMemberInput").on("select", inputSelect);
    //系统内现有成员筛选按钮绑定点击事件
    $("#searchMember").click(function () {
        var searchText = $("#searchMemberInput").val();
        if (searchText.length > 0) {
            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var filtervalue = searchText;
            var filtercondition = 'contains';
            var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);
            $("#memberSearchedList").jqxGrid("addfilter", 'userName', filtergroup);
            //调用过滤器
            $("#memberSearchedList").jqxGrid('applyfilters');
        }
    });

    $("#memberSearchedList").on("filter", gridFilter);

    //添加成员窗口确认按钮绑定点击事件
    $("#addMember").on("click", function () {
        if ($("#memberSearchedList").jqxGrid("getselectedrowindexes").length > 0) {
            var preparedMembers = ($("#memberSearchedList").jqxGrid('getselectedrowindexes')).map(function (item) {
                return $("#memberSearchedList").jqxGrid('getrowdata', item)
            });
            var userinfo = preparedMembers.map(function (item) {
                /*return {
                 userID: item.userID,
                 userName: item.userName,
                 userPost: item.userPost,
                 userLocation: item.userLocation
                 }*/
                return item.userID;
            });
            /*            console.log(userinfo);*/
            addMemberToOneRoom(mission.roomID, userinfo, addMemberToOneRoomSuccess);
        } else {
            alert("请选择成员，然后点击确定");
        }
    });


    //添加成员窗口取消按钮绑定点击事件
    $("#disAdd").on("click", function () {
        $("#searchMemberInput").jqxInput("source", []);
        $("#memberSearchedList").jqxGrid("source", getAdapter([]));
        $("#memberSearchedList").jqxGrid('clearselection');
        $("#memberSearchedList").jqxGrid('clearfilters');
        $("#popoverMember").jqxPopover('close');
    });
    //所有控件绑定事件结束
});


//定义一个input控件select事件之后的回调函数
function inputSelect() {
    var searchText = $(this).val(),
        filtergroup = new $.jqx.filter(),
        filter_or_operator = 1,
        filtervalue = searchText,
        filtercondition = 'contains',
        filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
    filtergroup.addfilter(filter_or_operator, filter);
    if (searchText.length > 0) {
        switch ($(this).attr("id")) {
            case "memberInput":
                /*console.log(searchText);*/
                $("#memberInput").unbind("change");
                $("#memberGrid").jqxGrid("addfilter", 'userName', filtergroup);
                //调用过滤器
                $("#memberGrid").jqxGrid('applyfilters');
                /*                    $("#memberGrid").on("filter", gridFilter);*/
                break;
            case "searchMemberInput":
                $("#searchMemberInput").unbind("change");
                $("#memberSearchedList").jqxGrid("addfilter", 'userName', filtergroup);
                //调用过滤器
                $("#memberSearchedList").jqxGrid('applyfilters');
                break;
            case "fileInput":
                $("#fileInput").unbind("change");
                $("#fileGrid").jqxGrid("addfilter", 'attachmentName', filtergroup);
                //调用过滤器
                $("#fileGrid").jqxGrid('applyfilters');
                break;
        }
    }
}

//定义grid的filter事件回调函数
function gridFilter() {
    switch ($(this).attr("id")) {
        case "memberGrid":
            /*console.log("已过滤");*/
            $("#memberInput").one("input", function () {
                $("#memberGrid").jqxGrid("clearfilters")
            });
            break;
        case "memberSearchedList":
            $("#searchMemberInput").one("input", function () {
                $("#memberSearchedList").jqxGrid("clearfilters");
            });
            break;
        case "fileGrid":
            $("#fileInput").one("input", function () {
                $("#fileGrid").jqxGrid("clearfilters");
            });
            break;
    }
}

//定义一个数据适配器构造函数
function getAdapter(data1) {
    //准备数据
    var data = data1;

    var source = {
        localdata: data,
        datatype: "array",
        datafields: [
            // {name: '_id', type: 'string'},
            {name: 'userLocation', type: 'string'},
            {name: 'userID', type: 'string'},
            {name: 'userName', type: 'string'},
            {name: 'userDepartment', type: 'string'},
            {name: 'userPost', type: 'string'},
            {name: 'status', type: 'string'}
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


//memberGrid更新函数
function memberUpdate(type, userid, userinfo) {
    var memberGridData = $('#memberGrid').jqxGrid('getrows');
    switch (type) {
        case 'join':
            memberJoin(memberGridData, userid);
            break;
        case 'online':
            memberOnline(memberGridData, userid);
            break;
        case 'offline':
            memberOffline(memberGridData, userid);
            break;
        case 'add':
            memberAdd(memberGridData, userinfo);
            break;
        case 'delete':
            memberDelete(memberGridData, userid);
            break;
    }
}

function memberJoin(data, userid) {
    changeMemberStatus(data, userid, 'join');
    getMemberSuccess(data);
}

function memberOnline(data, userid) {
    changeMemberStatus(data, userid, 'online');
    getMemberSuccess(data);
}

function memberOffline(data, userid) {
    changeMemberStatus(data, userid, 'offline');
    getMemberSuccess(data);
}

function memberAdd(data, userinfo) {
    data = data.concat(userinfo);
    memberSort(data);
    getMemberSuccess(data);
}

function memberDelete(data, userid) {
    data.forEach(function (item, index, array) {
        if (item['userID'] == userid) {
            data.splice(index, 1);
        }
    });

    getMemberSuccess(data);
}
//memberSearchedList模块刷新函数
function freshMemberSearchedList(data) {
    var dataNow = $("#memberGrid").jqxGrid("getRows"),
        dataFiltered = data.filter(function (dataItem) {
            return dataNow.every(function (dataNowItem) {
                return dataNowItem.userID != dataItem.userID;
            });
        }),
        searchMembers = dataFiltered.map(function (member) {
            return member.userName
        });
    $("#searchMemberInput").jqxInput("source", searchMembers);
    $("#memberSearchedList").jqxGrid("source", getAdapter(dataFiltered));
}


//获取房间内现有成员成功后的函数
function getMemberSuccess(data) {
    var searchMembers = [],
        dataSorted = memberSort(data);
    for (var i in data) {
        searchMembers.push(data[i].userName)
    }
    $("#memberInput").jqxInput("source", searchMembers);
    $("#memberGrid").jqxGrid('source', getAdapter(dataSorted));
}

//删除房间内某个成员成功后的函数
function deleteMemberSuccess(userid) {
    //根据userid查找rowid
    /*console.log("删除成功之后的函数");*/
    var rowid = $("#memberGrid").jqxGrid("getrowid", $("#memberGrid").jqxGrid("getselectedrowindex"));
    console.log(rowid);
    $("#memberGrid").jqxGrid("deleterow", rowid);
    $("#deleteWindow").jqxWindow("close");
}

//获取系统内所有成员成功后的函数
/*function getUserSuccess(data){
 var searchMembers = data.map(function(member){return member.userName});
 $("#memberInput").jqxInput("source", searchMembers);
 $("#memberSearchedList").jqxGrid("source", getAdapter(data));
 }
 function getUserSuccess1(data){
 var searchMembers = data.map(function(member){return member.userName});
 $("#searchMemberInput").jqxInput("source", searchMembers);
 $("#memberSearchedList").jqxGrid("source", getAdapter(data));
 }*/
//如果当前房间为子房间推大厅的所有成员，如果当前房间为大厅推大厅外系统成员
function listMemberForChoiceSuccess(data) {
    var searchMembers = data.map(function (member) {
        return member.userName
    });
    $("#searchMemberInput").jqxInput("source", searchMembers);
    $("#memberSearchedList").jqxGrid("source", getAdapter(data));
}


//向房间内添加成员成功后的函数
function addMemberToOneRoomSuccess(data) {
    getMember(mission.roomID);
    $("#memberSearchedList").jqxGrid("clearselection");
    $("#popoverMember").jqxPopover("close");
    /*$("#memberGrid").jqxGrid("addrow", null, $);*/
}


//房间内现有成员列表的右键弹出菜单的菜单项绑定点击事件,方便以后添加更多操作选项
function gridMenuEvent() {
    $("#gridMenu").on('itemclick', function (event) {
        var args = event.args;
        var rowindex = $("#memberGrid").jqxGrid('getselectedrowindex');
        if ($.trim($(args).text()) == "修改成员名片") {
            editrow = rowindex;
            var offset = $("#memberGrid").offset();
            $("#editMemberWindow").jqxWindow({position: {x: parseInt(offset.left) + 60, y: parseInt(offset.top) + 60}});

            // 获取选中行的数据，并初始化输入域
            var dataRecord = $("#memberGrid").jqxGrid('getrowdata', editrow);
            $("#name").val(dataRecord.name);
            $("#district").val(dataRecord.district);
            $("#grade").val(dataRecord.grade);
            $("#department").val(dataRecord.department);

            // 显示弹出窗口
            $("#editMemberWindow").jqxWindow('show');
        }
        else {
            var rowid = $("#memberGrid").jqxGrid('getrowid', rowindex);
            var dataRecord = $("#memberGrid").jqxGrid('getrowdata', rowindex);
            console.log(rowid);
            /*
             console.log(dataRecord);*/
            $("#deleteName").text(dataRecord.userName);
            //这里弹出删除确认window
            var offset = $("#memberGrid").offset();
            $("#deleteWindow").jqxWindow({position: {x: parseInt(offset.left) + 60, y: parseInt(offset.top) + 60}});
            $("#deleteWindow").jqxWindow("isModal", true);
            $("#deleteWindow").jqxWindow("open");
            $("#deleteCancel").on("click", function (event) {
                $("#deleteWindow").jqxWindow("close");
            });
            $("#deleteConfirm").one("click", function (event) {
                /*console.log("开始删除成员");*/
                // if (mission.userID !== createUserID) {
                //     alert('对不起，您无法操作非自己创建的房间！');
                // } else if (mission.userID === dataRecord.userID) {
                //     alert('对不起，您无法删除本人！');
                // } else {
                deleteMember(mission.roomID, dataRecord.userID);
                // }
            });
        }
    });
}


//将获取到的member数据按照status进行排序，将在房间的排在前面，反之，排在后面
function memberSort(data) {
    for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].status === 'join') {
            data[i].sort = 1;
        } else if (data[i].status === 'online') {
            data[i].sort = 2;
        } else {
            data[i].sort = 3;
        }
    }
    data.sort(function (a, b) {
        if (a.sort != b.sort) {
            return a.sort - b.sort;
        } else if (a.sort == 1 || a.sort == 2) {
            return Number(b.lastLoginTime) - Number(a.lastLoginTime);
        } else {
            return Number(b.lastLogoutTime) - Number(a.lastLogoutTime);
        }
    });
    return data;
}


//membergrid cell渲染
function cellRender(rowindex, columnfield, value) {
    var rowdata = $('#memberGrid').jqxGrid('getrowdata', rowindex);
    if (rowdata.status === 'join') {
        return '<div class="cellJoin">' + value + '</div>';
    } else if (rowdata.status === 'online') {
        return '<div class="cellOnline">' + value + '</div>';
    } else {
        return '<div class="cellOffline">' + value + '</div>';
    }
}


//memberGrid成员状态改变的函数
function changeMemberStatus(data, userid, status) {
    console.log(data);
    data.forEach(function (data) {
        if (data['userID'] == userid) {
            data['status'] = status;
        }
    });
    memberSort(data);
}

