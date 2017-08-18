/* $(document).ready(function(){*/
$('#showMemberGrid').hide()
/*});*/
function createMemberTable(roominfo) {
    console.log(roominfo)
    var membersdata = [];
    $.ajax({
        type: "POST",
        url: '/members',
        async: false,
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roominfo.id
        }),
        beforeSend: function () {
        },
        complete: function () {
        },
        success: function (data) {
            membersdata = data;
        }
    });

    // if (membersdata.length < 1)return false;
    cleanMemberTable();
    createSurvey(roominfo);
    var table = document.createElement('table'),
        caption = document.createElement('caption'),
        captionT = document.createElement('caption'),
        thead = document.createElement('thead'),
        tbody = document.createElement('tbody'),
        // headers = ["姓名", "地域", "级别", "部门"],
        headers = ["姓名", "部门"],
        tr = document.createElement("tr"),
        th,
        td;
    thead.appendChild(tr);
    // caption.innerText = roominfo.desc;//+ "参与人员";
    // captionT.innerText = "参与人员:";
    $("#explain_info_desc").text(roominfo.desc);
    // $("#showMemberGrid").appendChild(caption);
    table.appendChild(captionT);
    table.appendChild(thead);
    table.appendChild(tbody);
    for (var i = 0, length = headers.length; i < length; i++) {
        th = document.createElement("th");
        th.innerText = headers[i];
        tr.appendChild(th);
    }

    for (var i in membersdata) {
        tr = document.createElement("tr");
        nameTd = document.createElement("td");
        nameTd.innerText = membersdata[i].userName;
        tr.appendChild(nameTd);
        // districtTd = document.createElement("td");
        // districtTd.innerText = membersdata[i].userLocation;
        // tr.appendChild(districtTd);
        // postTd = document.createElement("td");
        // postTd.innerText = membersdata[i].userPost;
        // tr.appendChild(postTd);
        departmentTd = document.createElement("td");
        departmentTd.innerText = membersdata[i].userDepartment;
        tr.appendChild(departmentTd);
        tbody.appendChild(tr);
    }
    document.getElementById("showMemberGrid").appendChild(table);
    $("#showMemberGrid").show();
    $("#memberGrid-shrink").click(function () {
        if ($(this).hasClass("fa-arrow-circle-up")) {
            $("#showMemberGrid table").hide();
            $(this).removeClass("fa-arrow-circle-up").addClass("fa-arrow-circle-down");
        } else {
            $("#showMemberGrid table").show();
            $(this).removeClass("fa-arrow-circle-down").addClass("fa-arrow-circle-up");
        }
    })
}

function createSurvey(d) {
    var memberGrid = document.getElementById("showMemberGrid"),
        p = document.createElement("p"),
        p2 = document.createElement("p"),
        span = document.createElement("span");
    span.className = "fa fa-arrow-circle-up";
    span.id = "memberGrid-shrink";
    // createDate = new Date(Number(d..eventTime));
    var nameDiv = document.createElement('div');
    if ($('#nameHeader').length > 0) {
        $('#nameHeader').remove();
    }
    var nameHeader = document.createElement('h1');
    nameHeader.innerHTML = "协同会战平台——" + d.name;
    nameHeader.setAttribute("title", d.desc);
    nameDiv.setAttribute("id", "nameHeader");
    nameDiv.appendChild(nameHeader);
    document.getElementById("eventgraph").insertBefore(nameDiv, document.getElementById("showMemberGrid"));
    p.innerHTML = "参与人员";
    p.appendChild(span);
    p.style.padding = "2px 8px 0";
    p.style.fontWeight = "bold";
    memberGrid.appendChild(p);
    $('#nameHeader').on('click', function () {
        // $.ajax({
        //     type: "POST",
        //     url: '/show/clear',
        //     contentType: 'application/json',
        //     dataType: 'json',
        //     headers: {
        //         'Authorization': 'JWT ' + getURLParams("token")
        //     },
        //     data: JSON.stringify({}),
        //     beforeSend: function () {
        //     },
        //     complete: function () {
        //     },
        //     success: function (data) {
        //         window.alert("清除成功");
        //     },
        //     global: false
        // });
    });
}

function cleanMemberTable() {
    var memberGrid = document.getElementById("showMemberGrid"),
        table = memberGrid.getElementsByTagName('table')[0],
        p = memberGrid.getElementsByTagName("p")[0];
    if (table) {
        memberGrid.removeChild(table);
        memberGrid.removeChild(p);
    }
    $("#showMemberGrid").hide();
}

function getURLParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

