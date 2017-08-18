function createReportComponent(nodeId) {
    var anchorIndex = 0;
    var nodeData = d3.select('#' + nodeId)[0][0]['__data__'];
    var toEasyReadTimeString = function (timestr) {
        var date = new Date(Number(timestr));
        var weekDayArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日' + weekDayArr[date.getDay()] + date.getHours() + '时' + date.getMinutes() + '分' + date.getSeconds() + '秒';
    };
    var getSysInfo = function (nodeData) {
        var nodeName = nodeData.name;
        var info = JSON.parse(nodeData.info.info);
//        console.log(info);
        var sysInfo = null;
        var descArr = info.desc.match(/【[\S]+】/g)[0].split('】的【');
        sysInfo = {
            sys: descArr[0],
            api: descArr[1],
            sourceItem: info.links[0].label
        };
        //console.log(sysInfo);
        return sysInfo;
    };
    var getResultData = function (nodeData) {
        var nodeName = nodeData.name;
        var info = JSON.parse(nodeData.info.info);
        var nodeInfo = null;
        if (nodeData.nodeType === 'object') {
            nodeInfo = function () {
                var temporary = JSON.parse(info.data);
                if (temporary.objectId) delete temporary.objectId;
                if (temporary.objectName) delete temporary.objectName;
                if (temporary.type) delete temporary.type;
                return temporary;
            }();
        } else if (nodeData.nodeType === 'backobject') {
            nodeInfo = nodeData.label;
        } else {
            nodeInfo = info.nodes[nodeName];
        }
        return nodeInfo;
    };
    var reportStrIndexArr = [1, 0, 5, 2, 3, 4/*, 6, 5*/];
    var itemShowSourceData = ['时间', '操作员', '系统', '功能', '结果数据',/* '结果数据详情', */'源数据'/*, '源数据详情'*/];
    var itemCheckIndexArr = [0, 1, 2, 3, 4, 5];
    $('#show_item_list').jqxDropDownList({
        checkboxes: true,
        source: itemShowSourceData,
        width: 200,
        height: 26,
        placeHolder: '请选择展示的报告项目'
    });
    (function () {
        itemCheckIndexArr.forEach(function (currentValue) {
            $('#show_item_list').jqxDropDownList('checkIndex', currentValue);
        });
    })()
    $('#show_item_list').on('checkChange', function () {
        insertAllElement();
    });
    $('#export_report_btn').jqxButton({width: '80px', height: 26, value: '报告导出'});

    $('#export_report_btn').on('click', function () {
        var previousContent = document.getElementById('report_content').innerHTML;
        var selectItems = document.querySelectorAll('div#report_content select');
        var spanReplacement = null;
        for (var i = 0, length = selectItems.length; i < length; i++) {
            spanReplacement = document.createElement('span');
            spanReplacement.setAttribute('class', selectItems[i].classname);
            spanReplacement.innerText = selectItems[i].value;
            //console.trace(selectItems[i], selectItems[i].parentNode);
            selectItems[i].parentNode.insertBefore(spanReplacement, selectItems[i]);
        }
        for (var i = 0, length = selectItems.length; i < length; i++) {
            selectItems[i].parentNode.removeChild(selectItems[i]);
        }
        let title = $("#nameHeader h1").text() || mission.roomName || "";
        $('#report_export').wordExport(title + '会战报告');
        document.getElementById('report_content').innerHTML = previousContent;
    });
    var reportDataArr = [];
    var reportDataItem = null;
    while (nodeData && (nodeData.depth >= 0)) {
        reportDataItem = null;
        //console.log(nodeData)
        switch (nodeData.nodeType) {
            case 'room':
                console.log(nodeData);
                reportDataItem = {
                    type: 'room',
                    Time: toEasyReadTimeString(nodeData.info.eventTime),
                    label: nodeData.label,
                    User: JSON.parse(nodeData.info.info).uname
                };
                break;

            case 'result':
            case 'custom':
                reportDataItem = {
                    type: nodeData.nodeType,
                    Time: toEasyReadTimeString(nodeData.info.eventTime),
                    User: JSON.parse(nodeData.info.info).uname,
                    Sys: getSysInfo(nodeData),
                    //resultData: getResultData(nodeData),
                    resultDataLabel: nodeData.label,
                    sourceDataLabel: d3.select('#g-' + nodeData.parent.parent.name)[0][0]['__data__'].label || ""/*,
                    sourceData: getResultData(d3.select('#g-' + nodeData.parent.parent.name)[0][0]['__data__'])*/
                };
                break;

            case 'backobject':
                console.log(nodeData);
                reportDataItem = {
                    type: 'backobject',
                    Time: toEasyReadTimeString(nodeData.info.eventTime),
                    User: JSON.parse(nodeData.info.info).uname,
                    label: nodeData.label
                    // Sys: getSysInfo(nodeData),
                    // resultData: getResultData(nodeData),
                    // sourceData: getSourceData(nodeData)
                };
                break;

            case 'object':
                reportDataItem = {
                    type: 'object',
                    Time: toEasyReadTimeString(nodeData.info.eventTime),
                    User: JSON.parse(nodeData.info.info).uname,
                    label: nodeData.label/*,
                    resultData: (function () {
                        var temporary = JSON.parse(JSON.parse(nodeData.info.info).data);
                        if (temporary.objectId) delete temporary.objectId;
                        if (temporary.type) delete temporary.type;
                        if (temporary.objectName) delete temporary.objectName;
                        return temporary;
                    }())*/
                };
                break;
        }

        if (reportDataItem)
            reportDataArr.unshift(reportDataItem);

        // nodeData = nodeData.parent ? nodeData.parent.parent : null;
        nodeData = nodeData.parent || null;
    }
    function insertReportPElement (reportItem) {
        var content = document.querySelector('.full-tabs-parent #report_content');
        var contentStr = content.innerHTML;
        var htmlStr = '';
        switch (reportItem.type) {
            case 'room':
                if ($('#show_item_list').jqxDropDownList('getItem', 1).checked) {
                    htmlStr += '<span class="user">' + reportItem.User + '</span>';
                    //console.trace('debug1', reportItem, htmlStr);
                }
                if ($('#show_item_list').jqxDropDownList('getItem', 0).checked) {
                    htmlStr += '在<span class="time">' + reportItem.Time + '</span>';
                    //console.trace('debug2', htmlStr);
                }
                htmlStr += "创建了会战：" + reportItem.label + "。";
                break;
            case 'result':
            case 'custom':
                for (var i in reportStrIndexArr) {
                    if (reportStrIndexArr[i] === 7) {
                        break;
                    }
                    if ($('#show_item_list').jqxDropDownList('getItem', reportStrIndexArr[i]).checked) {
                        htmlStr = htmlStr + createReportItemStr(reportItem, reportStrIndexArr[i]);
                    }
                }
                break;
            case 'backobject':
                // for (var i in reportStrIndexArr) {
                //     if (reportStrIndexArr[i] === 7) {
                //         break;
                //     }
                //     if ($('#show_item_list').jqxDropDownList('getItem', reportStrIndexArr[i]).checked) {
                //         htmlStr = htmlStr + createReportItemStr(reportItem, reportStrIndexArr[i]);
                //     }
                // }
                if ($('#show_item_list').jqxDropDownList('getItem', 1).checked) {
                    htmlStr += '<span class="user">' + reportItem.User + '</span>';
                    //console.trace('debug1', reportItem, htmlStr);
                }
                if ($('#show_item_list').jqxDropDownList('getItem', 0).checked) {
                    htmlStr += '在<span class="time">' + reportItem.Time + '</span>';
                    //console.trace('debug2', htmlStr);
                }
                htmlStr += '回传了' + reportItem.label + '。';
                break;
            case 'object':
                if ($('#show_item_list').jqxDropDownList('getItem', 1).checked) {
                    htmlStr += '<span class="user">' + reportItem.User + '</span>';
                    //console.trace('debug1', reportItem, htmlStr);
                }
                if ($('#show_item_list').jqxDropDownList('getItem', 0).checked) {
                    htmlStr += '在<span class="time">' + reportItem.Time + '</span>';
                    //console.trace('debug2', htmlStr);
                }
                if ($('#show_item_list').jqxDropDownList('getItem', 4).checked) {
                    anchorIndex = 0;
                    // htmlStr += '输入<select style ="color: #000;" class="result">';
                    // htmlStr += '<option>' + key + ':' + reportItem.resultData[key] + '</option>';
                    // for (var key in reportItem.resultData) {
                    //     if (key !== 'objectId' && key !== 'objectName' && key !== 'type') {
                    //         htmlStr += '<option>' + key + ':' + reportItem.resultData[key] + '</option>';
                    //     }
                    // }
                    // htmlStr += '</select>数据';
                    htmlStr += '输入了【' + reportItem.label + "】。";
/*                    htmlStr += ( $('#show_item_list').jqxDropDownList('getItem', 5).checked ? '<sub><a href="#' + anchorIndex + 'r"' + '>'/!* + anchorIndex + 'r' *!/+ '源数据详情</a></sub>' : '');*/
                }
                break;
        }

        if (htmlStr) {
            contentStr = contentStr + '<p style="text-indent: 2em">' + htmlStr + '</p>';
            content.innerHTML = contentStr;
        }
    }

    function insertReportTableElement (reportItem) {
        var appendixes = document.getElementById('report_appendixes');
        var appendix = null;
        var captionElement = null;
        var thElements = null;
        var tdElements = null;
        var showItemList = $('#show_item_list');
        var anchorElement = null;
/*        if (showItemList.jqxDropDownList('getItem', 6).checked && reportItem.sourceData) {
            appendix = JsonHuman.format(reportItem.sourceData.info ? reportItem.sourceData.info : reportItem.sourceData);
            anchorElement = document.createElement('span');
            captionElement = document.createElement('caption');
            captionElement.setAttribute('style', 'border-left:1px solid #000; border-right:1px solid #000; background:#fff; text-align:center; color:#000');
            captionElement.innerText = /!*'第' + (new ArabToChinese(anchorIndex + 1).numberToChines()) +*!/ '源数据详情';
            appendix.insertBefore(captionElement, appendix.firstChild);
            //anchorElement.setAttribute('name', anchorIndex + 's');
            anchorElement.text = anchorIndex + 's';
            thElements = appendix.getElementsByTagName('th');
            for (var i = 0, length = thElements.length; i < length; i++) {
                thElements[i].setAttribute('style', 'border:1px solid #000')
            }
            tdElements = appendix.getElementsByTagName('td');
            for (var i = 0, length = tdElements.length; i < length; i++) {
                tdElements[i].setAttribute('style', 'border:1px solid #000')
            }
            appendix.setAttribute('style', 'border-collapse:collapse; width: 100%; text-align:center; margin-top: 5px; margin-left: 5px; margin-right: 5px; margin-bottom: 0px; border: 1px solid #000; background:#fff; color:#000');
            appendix.setAttribute('id', anchorIndex + 's');
            appendix.setAttribute('name', anchorIndex + 's');
            appendixes.appendChild(appendix);
            appendixes.appendChild(anchorElement);
            appendixes.appendChild(document.createElement('br'));
        }*/
        if (showItemList.jqxDropDownList('getItem', 6).checked) {
            appendix = JsonHuman.format(reportItem.resultData.info ? reportItem.resultData.info : reportItem.resultData);
            anchorElement = document.createElement('span');
            //anchorElement.setAttribute('name', anchorIndex + 'r');
            anchorElement.innerText = anchorIndex + 'r';
            captionElement = document.createElement('caption');
            captionElement.setAttribute('style', 'border-left:1px solid #000; border-right:1px solid #000; background:#fff; text-align:center; color:#000');
            captionElement.innerText =/* '第' + ( new ArabToChinese(anchorIndex + 1).numberToChines()) + */'源数据详情';
            appendix.insertBefore(captionElement, appendix.firstChild);
            thElements = appendix.getElementsByTagName('th');
            for (var i = 0, length = thElements.length; i < length; i++) {
                thElements[i].setAttribute('style', 'border:1px solid #000')
            }
            tdElements = appendix.getElementsByTagName('td');
            for (var i = 0, length = tdElements.length; i < length; i++) {
                tdElements[i].setAttribute('style', 'border:1px solid #000')
            }
            appendix.setAttribute('style', 'border-collapse:collapse; width: 100%; text-align:center; margin-top: 5px; margin-left: 5px; margin-right: 5px; margin-bottom: 0px; background:#fff; color:#000');
            appendix.setAttribute('id', anchorIndex + 'r');
            appendix.setAttribute('name', anchorIndex + 'r');
            appendix.getElementsByTagName('th');
            appendixes.appendChild(appendix);
            appendixes.appendChild(anchorElement);
            appendixes.appendChild(document.createElement('br'));
        }
    }
    function createReportItemStr (reportItem, itemShowSourceDataIndex) {
        var str = '';
        var reportItemResultDataInfo = null;
        var reportItemSourceDataInfo = null;
        //console.log(reportItem);
        switch (itemShowSourceDataIndex) {
            case 0:
                str = '在<span class="time">' + reportItem.Time + '</span>';
                break;
            case 1:
                str = '<span class="user" style="text-indent: 2em">' + reportItem.User + '</span>';
                break;
            case 2:
                str = '查询<span class="sys">' + reportItem.Sys.sys + '】</span>系统';
                break;
            case 3:
                str = '<span class="api">【' + reportItem.Sys.api + '</span>接口';
                break;
            case 4:
                /*reportItemResultDataInfo = reportItem.resultData.info;
                str = '得到<select style="color: #000;" class="result">';
                for (var key in reportItemResultDataInfo) {
                    str += '<option>' + key + '：' + reportItemResultDataInfo[key] + '</option>';
                }
                str += '</select>数据' + ($('#show_item_list').jqxDropDownList('getItem', 5).checked ? '<sub><a href="#' + anchorIndex + 'r"' + '>' + anchorIndex + 'r' + '</a></sub>' : '');*/
                //todo 暂时显示
                str = '得到结果数据。';
                break;
/*            case 5:
                reportItemResultDataInfo = reportItem.resultData.info;
                str = JsonHuman.format(reportItemResultDataInfo);
                break;*/
            case 5:
/*                reportItemSourceDataInfo = reportItem.sourceData.info ? reportItem.sourceData.info : reportItem.sourceData;
                str = '通过<select style="color: #000;" class="source">';
                for (var key in reportItemSourceDataInfo) {
                    if (key !== 'objectId' && key !== 'objectName' && key !== 'type') {
                        str += '<option>' + key + '：' + reportItemSourceDataInfo[key] + '</option>'
                    }
                }
                str += '</select>数据' + ($('#show_item_list').jqxDropDownList('getItem', 6).checked ? '<sub><a href="#' + anchorIndex + 's"' + '>' + anchorIndex + 's' + '</a></sub>' : '');*/
                //todo 暂时显示效果
                str = '通过【' + reportItem.sourceDataLabel + '】' + '的' + reportItem.Sys.sourceItem + '数据';
                break;
/*            case 6:
                reportItemSourceDataInfo = reportItem.sourceData.info;
                str = JsonHuman.format(reportItemSourceDataInfo);
                break;*/
        }
        return str;
    };
    function insertAllElement () {
        $('.full-tabs-parent #report_content').html('');
        $('.full-tabs-parent #report_appendixes').html('');
        for (var i in reportDataArr) {
            anchorIndex = +i;
            insertReportPElement(reportDataArr[i]);
/*            if (reportDataArr[i].type === 'object') {
                insertReportTableElement(reportDataArr[i]);
            }*/
        }
    }

    insertAllElement();
}
function closeReportComponent() {
    $('#show_item_list').jqxDropDownList('uncheckAll');
    $('#export_report_btn').unbind('click');
    $('#report_content').html('');
    $('#report_appendixes').html('');
}
//阿拉伯数字转中文数字
function ArabToChinese(num) {
    var chineseNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var chineseUnitSection = ["", "万", "亿", "万亿", "亿亿"];
    var chineseUnitChar = ["", "十", "百", "千"];
    var sectionToChinese = function (section) {
        var strIns = '',
            chnStr = '',
            unitPos = 0,
            zero = true;
        while (section > 0) {
            var v = section % 10;
            if (v === 0) {
                if (!zero) {
                    zero = true;
                    chnStr = chineseNumChar[v] + chnStr;
                }
            } else {
                zero = false;
                strIns = chineseNumChar[v];
                strIns += chineseUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    };
    this.numberToChines = function () {
        var unitPos = 0,
            strIns = '',
            chnStr = '',
            needZero = false;

        if (num === 0) {
            return chineseNumChar[0];
        }

        while (num > 0) {
            var section = num % 10000;
            if (needZero) {
                chnStr = chineseNumChar[0] + chnStr;
            }
            strIns = sectionToChinese(section);
            strIns += (section !== 0) ? chineseUnitSection[unitPos] : chineseUnitSection[0];
            chnStr = strIns + chnStr;
            needZero = (section < 1000) && (section > 0);
            num = Math.floor(num / 10000);
            unitPos++;
        }
        return chnStr;
    };
    this.num = num;
}
