/* $(document).ready(function(){*/
$('#memberGrid').hide()
/*});*/
function createMemberTable(roominfo, membersdata) {
    if (!membersdata || membersdata.length < 1)return false;
    cleanMemberTable();
    createSurvey(roominfo);
    var table = document.createElement('table'),
        caption = document.createElement('caption'),
        thead = document.createElement('thead'),
        tbody = document.createElement('tbody'),
        headers = ["姓名", "地域", "级别", "部门"],
        tr = document.createElement("tr"),
        th,
        td;
    thead.appendChild(tr);
    caption.innerText = "参与人员";
    table.appendChild(caption);
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
        districtTd = document.createElement("td");
        districtTd.innerText = membersdata[i].userLocation;
        tr.appendChild(districtTd);
        postTd = document.createElement("td");
        postTd.innerText = membersdata[i].userPost;
        tr.appendChild(postTd);
        departmentTd = document.createElement("td");
        departmentTd.innerText = membersdata[i].userDepartment;
        tr.appendChild(departmentTd);
        tbody.appendChild(tr);
    }
    document.getElementById("memberGrid").appendChild(table);
    $("#memberGrid").show();
}

function createSurvey(d) {
    var memberGrid = document.getElementById("memberGrid"),
        p = document.createElement("p"),
        createDate = new Date(Number(d.info.eventTime));
    p.innerText = "会战概况：创建时间（" + createDate.toLocaleDateString() + createDate.toLocaleTimeString() + "）,会战名称（" + JSON.parse(d.info.info).name + "） ";
    memberGrid.appendChild(p);
}

function cleanMemberTable() {
    var memberGrid = document.getElementById("memberGrid"),
        table = memberGrid.getElementsByTagName('table')[0],
        p = memberGrid.getElementsByTagName("p")[0];
    if (table) {
        memberGrid.removeChild(table);
        memberGrid.removeChild(p);
    }
    $("#memberGrid").hide();
}

function getURLParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}