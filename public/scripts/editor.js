configObjData = {
    entries: [
        {
            id: "serverbtn",
            name: "服务器",
            classname: "configbtn"
        },
        {
            id: "personbtn",
            name: "人物信息",
            classname: "configbtn"
        },
        {
            id: "samplebtn",
            name: "样本信息",
            classname: "configbtn"
        },
        {
            id: "scbtn",
            name: "威胁信息",
            classname: "configbtn"
        },
        {
            id: "imeibtn",
            name: "IMEI",
            classname: "configbtn"
        },
        // {
        //     id: "verifybtn",
        //     name: "身份认证",
        //     classname: "configbtn"
        // },
        {
            id: "app_info_btn",
            name: "APP信息",
            classname: "configbtn"
        }
    ],
    //key == entries.id 关联关系
    "app_info_btn": {
        id: "app_info_config",
        label: "APP信息",
        classname: "configWindow",
        elements: [
            {
                id: "program_name",
                label: "程序名",
                element: "input",
                elementTYpe: "text",
                validator: "nameCheck"
            },
            {
                id: "package_name",
                label: "包名",
                element: "input",
                elementTYpe: "text",
                validator: "nameCheck"
            }
        ]
    },
    "serverbtn": {
        id: "serverconfig",
        label: "服务器信息输入",
        classname: "configWindow",
        elements: [
            {
                id: "regip",
                label: "IP地址",
                element: "input",
                elementType: "text",
                validator: "ipCheck"
            },
            {
                id: "mac",
                label: "MAC地址",
                element: "input",
                elementType: "text",
                validator: "macCheck"
            },
            {
                id: "domain",
                label: "域名",
                element: "input",
                elementType: "text",
                validator: "domainCheck"
            }
        ]
    },
    "samplebtn": {
        id: "sampleconfig",
        label: "样本信息输入",
        classname: "configWindow",
        elements: [
            {
                id: "id",
                label: "样本id",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            },
            {
                id: "hash",
                label: "样本hash",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            }
        ]
    },
    "scbtn": {
        id: "scconfig",
        label: "威胁信息",
        classname: "configWindow",
        elements: [
            {
                id: "email",
                label: "邮箱查询",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            },
            {
                id: "domain",
                label: "域名查询",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            }
        ]
    },
    "verifybtn": {
        id: "verifyconfig",
        label: "身份认证",
        classname: "configWindow",
        elements: [
            {
                id: "username",
                label: "用户名",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            },
            {
                id: "password",
                label: "密码",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            }
        ]
    },
    "imeibtn": {
        id: "imeiconfig",
        label: "IMEI",
        classname: "configWindow",
        elements: [
            {
                id: "imei",
                label: "IMEI",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            }
        ]
    },
    "personbtn": {
        id: "personconfig",
        label: "人物信息输入",
        classname: "configWindow",
        elements: [
            {
                id: "realname",
                label: "姓名",
                element: "input",
                elementType: "text",
                validator: "nameCheck"
            },
            {
                id: "imei",
                label: "IMSI",
                element: "input",
                elementType: "text",
                validator: "imsiCheck"
            },
            {
                id: "imei",
                label: "IMEI",
                element: "input",
                elementType: "text",
                validator: "imeiCheck"
            },
            {
                id: "misdn",
                label: "MISDN",
                element: "input",
                elementType: "text",
                validator: "misdnCheck"
            },
            {
                id: "email",
                label: "EmailId",
                element: "input",
                elementType: "text",
                validator: "emailCheck"
            },
            {
                id: "regip",
                label: "IP地址",
                element: "input",
                elementType: "text",
                validator: "ipCheck"
            },
            {
                id: "mac",
                label: "MAC地址",
                element: "input",
                elementType: "text",
                validator: "macCheck"
            }
        ]
    }
};

configObjDataInfo = {};

for (var entriy in configObjData.entries) {
    if (!configObjDataInfo[configObjData.entries[entriy].id]) {
        configObjDataInfo[configObjData[configObjData.entries[entriy].id].id] = {label: configObjData.entries[entriy].name};
        for (var elIndex = 0; elIndex < configObjData[configObjData.entries[entriy].id].elements.length; ++elIndex) {
            configObjDataInfo[configObjData[configObjData.entries[entriy].id].id][configObjData[configObjData.entries[entriy].id].elements[elIndex].id] = {label: configObjData[configObjData.entries[entriy].id].elements[elIndex].label}
        }

    }
}
// console.log(configObjDataInfo);

$(document).ready(function () {
    //定义全局变量
    //获取富文本编辑框的frame
    var editorFrame = null;
    var frameDocument = null;
    var apiConfigData = null;
    var editorInit = false;
    var configApi = new missionClient.ConfigApi();
    var opts = {
        'authorization': getURLParams('token')
    };
    /*业务系统查询api集合配置窗口*/
//TODO:自定义查询api集合的ajax处理
    function prepareAPIConfigWindow() {
        var $apiConfigWindow = $('.apiConfigWindow');
        var timer = NaN;
        $('.apiConfigWindow .add_sys_api').click(function () {
            $('#sys_api_list').show();
            timer = setTimeout(function () {
                $('#sys_api_list').hide()
            }, 2000);
            $('#sys_api_list').one('mouseenter', function () {
                clearTimeout(timer);
                $('#sys_api_list').one('mouseleave', function () {
                    $('#sys_api_list').hide();
                });
            });
        });
        $('#cancel_sys_set_btn').click(function () {
            $('#sys_api_list_set').empty();
            $('.apiConfigWindow').hide();
        });
        $('#confirm_sys_set_btn').click(function () {
            var apiNameInputAll = true,
                apiValueInputOne = false;
            if (!$("#sys_name").val()) {
                alert('请输入配置名称！');
                return;
            }
            $('#sys_api_list_set input').each(function () {
                var $this = $(this);
                console.log('11111111');
                if ($this.hasClass('apiNameInput') && (!!!$this.val())) {
                    apiNameInputAll = false;
                    return;
                } else if ($this.hasClass('apiValueInput') && (!!$this.val())) {
                    apiValueInputOne = true;
                }
            });
            if (!(apiNameInputAll && apiValueInputOne)) {
                alert('请输入全部的api名称并且至少输入一个api的值');
                return;
            }
            var objectConfig = {
                id: "34139ab68d7ab605434d283cfe7aa68bc9e30f0f",
                label: $('#sys_name').val(),
                params: []
            };
            var opts = {
                'authorization': 'JWT ' + getURLParams('token')
            };
            $('#sys_api_list_set label').each(function (labelNode) {
                objectConfig.params.push({
                    id: $(this).attr('title'),
                    label: $(this).prev().val(),
                    value: $(this).next().val()
                });
            });
            $('#sys_api_list_set').empty();
            $('.apiConfigWindow').hide();
            createVisualModal(objectConfig);
            disEdit();
            objectConfig.params.forEach(function (obj) {
                delete obj.value;
            });
            configApi.postCustomObjectConfig(objectConfig, $('#perpetual_sys_set_btn').prop('checked'), opts).then(function (data) {
                editorRender(data.d);
                console.info('API called successfully. Returned data: ' + data);
            }, function (error) {
                console.error(error);
            });
        });
        $('#perpetual_sys_set_btn').click(function () {
            console.info('永久保存');
        });
    }

    prepareAPIConfigWindow();
    configApi.getObjectConfig(opts).then(function (data) {
        if (isClass(data) === 'Object') {
            //console.log('API called successfully. Returned data: ' + data);
            apiConfigData = data;
            editorRender(data);
            //获取富文本编辑框的frame
            editorFrame = window.frames[1];
            frameDocument = editorFrame.document;

            /*文本编辑器绑定鼠标右键点击事件*/
            frameDocument.oncontextmenu = function (e) {
                //console.log('鼠标右键', frameDocument.getSelection());
                if (!frameDocument.getSelection().isCollapsed) {
                    e.preventDefault();
                    var selectedRange = new SelectedRange(window.frames[1]);
                    var editorFrameDocumentOffset = $(".advanced-text .jqx-editor-content").offset();
                    var customObjectConfigWindow = new CustomObjectConfigWindow({
                        x: selectedRange.coordinate.right + editorFrameDocumentOffset.left,
                        y: selectedRange.coordinate.top + editorFrameDocumentOffset.top
                    }, selectedRange);
                    customObjectConfigWindow.show();
                }
            };
        }
    }, function (error) {
        editorRender();
        console.error(error);
    });
    configApi.getConfigAll(opts).then(function (data) {
        var source = {
            datatype: "array",
            datafields: [{name: "label", type: "string"},
                {name: "id", type: "string"}],
            localdata: data.d
        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        if (isClass(data) === 'Object') {
            $('#sys_api_list').jqxListBox({source: dataAdapter, displayMember: 'label', width: 200, height: 100});
            $('#sys_api_list').on('select', function (evt) {
                var configData = evt.args.item.originalItem;
                console.info(evt);
                $('#sys_api_list_set').append($("<div>" +
                    "<input class='apiNameInput' placeholder='请输入名称' type='text' value='" + configData.label + "' />" +
                    "<label title=" + configData.id + ">" + configData.label + "</label>" +
                    "<input class='apiValueInput' placeholder='请输入值' type='text' />" +
                    "</div>"));
            });
        }
    }, function (error) {
        console.error(error);
    });

    /*editorRender({
     "ri": {
     "rc": 1,
     "msg": "成功"
     },
     "d": [
     {
     "id": "8d4ba065ae312536d8bdc5b787d19bb682bdc302",
     "label": "服务器",
     "params": [
     {
     "id": "ea424d38af72dd1366a08aad1f47eca3e7ec3d24",
     "label": "ip地址"
     },
     {
     "id": "a8df7b671cd72e7f847737d5b5be88444ad977a4",
     "label": "mac地址"
     },
     {
     "id": "83456a5aeebcdf24beebe7224c4fca40ab2a8379",
     "label": "域名"
     }
     ]
     }
     ]
     });*/


    //根据配置信息生成编辑器上的按钮
    function editorRender(data) {
        //console.log(data);
        if (!editorInit) {
            editorInit = true;
            var totalTools = "bold italic underline | format font size | color background | left center right | outdent indent | ul ol | link | clean | html | fileupload",
                iconObject = {
                    serverbtn: "fa fa-server",
                    personbtn: "fa fa-user-o",
                    samplebtn: "fa fa-bug",
                    scbtn: "fa fa-info",
                    imeibtn: "fa fa-mobile",
                    verifybtn: "fa fa-check"
                },
                addTools = [],
                entries = data ? data.d : [];
            //console.log(entries);
            // console.log(entries);
            for (var i = 0, length = entries.length; i < length - 1; i++) {
                if (entries[i].id) {
                    totalTools += " | " + entries[i].id;
                    addTools.push(entries[i].id);
                }
            }
            totalTools += " | apiConfig";
            addTools.push("apiConfig");
//            console.log(totalTools);
            //console.log(totalTools);
            $("#editor").jqxEditor({
                height: "100%",
                width: '100%',
                pasteMode: 'html',
                tools: totalTools,
                stylesheets: ['css/custom.css'],
                //lineBreak: 'p',
                createCommand: function (name) {
                    switch (name) {
                        case "fileupload":
                            return {
                                type: "button",
                                tooltip: "上传附件",
                                init: function (widget) {
                                    widget.jqxButton({width: 80, height: 25});
                                    widget.html("<span style='line-height: 25px;'>" + "<i class='" + 'fa fa-paperclip' + "' aria-hidden='true' style='color:#fff;'></i>    " + '附件' + "</span>")
                                },
                                action: function (widget) {
                                    $('#fileWindow').jqxWindow("open");
                                }
                            };
                        default:
                            return

                    }
                }
            });


            $("#editor").jqxEditor({
                "createCommand": function (tool) {
                    //console.log("创建命令");
                    var toolname;
                    // for (var entry of entries) {
                    //     if (entry.id === tool) {
                    //         toolname = entry.name;
                    //     }
                    // }
                    for (var entry in entries) {
                        if (entries[entry].id === tool) {
                            toolname = entries[entry].label
                        }
                    }
                    for (var i in addTools) {
                        if (tool === addTools[i]) {
                            return {
                                type: "button",
                                init: function (widget) {
                                    widget.jqxButton({width: 120, height: 25});
                                    if (tool === "apiConfig") {
                                        widget.html("<span style='line-height: 25px;'>" + "<i class='" + "fa fa-plus" + "' aria-hidden='true'></i>   自定义数据</span>")
                                        return;
                                    }
                                    widget.html("<span style='line-height: 25px;'>" + "<i class='" + "fa fa-quora" + "' aria-hidden='true'></i>    " + toolname + "</span>")
                                },
                                refresh: function (widget, style) {
                                    //当selection发生变化时，做些什么
                                },
                                action: function (widget, editor) {
                                    //当点击了该button时，做些什么
                                    var offset = widget.offset();
                                    if (tool === "apiConfig") {
                                        $('#perpetual_sys_set_btn').prop('checked', false);
                                        cleanConfigWindow();
                                        $('.apiConfigWindow').show().offset({
                                            left: offset.left,
                                            top: offset.top + widget.height()
                                        });
                                        return;
                                    }
                                    var configInfo = entries.filter(function (obj) {
                                            return obj.id === tool;
                                        })[0],
                                        configWindow = createConfigWindow(configInfo);
                                    /*console.log(configWindow);*/
                                    $("#" + tool).attr("style", "left:" + offset.left + "px;top:" + (offset.top + widget.height()) + "px");
                                    var fn = function () {
                                        //获取输入域的值包装成json
                                        if (hasOneValue(configInfo)) {
                                            var json = createJson(configInfo);
                                            createVisualModal(json);
                                            disEdit();
                                            cleanConfigWindow(configWindow);
                                        } else {
                                            alert("请至少输入一个值");
                                        }
                                    };
                                    addConfigWindowEvent(configInfo, configWindow, fn);
                                }
                            };
                        }
                    }
                }
            });
            let body = document.getElementsByTagName('iframe')[1].contentWindow.document;
            body.onkeydown = function (event) {
                if (event.keyCode == 13 && event.ctrlKey) {
                    $("#j-send").trigger("click");
                } else if (event.keyCode === 13) {
                    if ($('.configWindow').css('display') === 'block') {
                        $('#Save').trigger('click');
                    }
                } else if (event.keyCode === 27) {
                    if ($('.configWindow').css('display') === 'block') {
                        $('#Cancel').trigger('click');
                    }
                }
            };
        } else {
            $("#editor").jqxEditor({
                //如果用this取tools会形成promise
                "tools": $('#editor').jqxEditor('tools').replace('apiConfig', data.id + ' | apiConfig'),
                "createCommand": function (tool) {
                    if (tool === data.id) {
                        return {
                            type: "button",
                            init: function (widget) {
                                widget.jqxButton({width: 120, height: 25});
                                widget.html("<span style='line-height: 25px;'>" + "<i class='" + "fa fa-quora" + "' aria-hidden='true'></i>    " + data.label + "</span>")
                            },
                            refresh: function () {
                                //当selection发生变化时，做些什么
                            },
                            action: function (widget) {
                                //当点击了该button时，做些什么
                                var offset = widget.offset();
                                var configWindow = createConfigWindow(data);
                                $("#" + tool).attr("style", "left:" + offset.left + "px;top:" + (offset.top + widget.height()) + "px");
                                var fn = function () {
                                    //获取输入域的值包装成json
                                    if (hasOneValue(data)) {
                                        var json = createJson(data);
                                        createVisualModal(json);
                                        disEdit();
                                        cleanConfigWindow(configWindow);
                                    } else {
                                        alert("请至少输入一个值");
                                    }
                                };
                                addConfigWindowEvent(data, configWindow, fn);
                            }
                        };
                    }
                }
            });
        }
    }

    /*    //获取富文本编辑框的frame
     var editorFrame = window.frames[1];
     var frameDocument = editorFrame.document;

     /!*文本编辑器绑定鼠标右键点击事件*!/
     frameDocument.oncontextmenu = function (e) {
     //console.log('鼠标右键', frameDocument.getSelection());
     if (!frameDocument.getSelection().isCollapsed) {
     e.preventDefault();
     var selectedRange = new SelectedRange(window.frames[1]);
     var editorFrameDocumentOffset = $(".advanced-text .jqx-editor-content").offset();
     var customObjectConfigWindow = new CustomObjectConfigWindow({
     x: selectedRange.coordinate.right + editorFrameDocumentOffset.left,
     y: selectedRange.coordinate.top + editorFrameDocumentOffset.top
     }, selectedRange);
     customObjectConfigWindow.show();
     }
     };*/
    /*    frameDocument.onmousedown = function () {
     console.log('鼠标下击');
     var sel = null;
     if ((typeof  frameDocument.onselectionchange) !== 'function') {
     frameDocument.onselectionchange = function () {
     sel = editorFrame.getSelection();
     }
     }
     if ((typeof  frameDocument.onmouseup) !== 'function') {
     frameDocument.onmouseup = function () {
     console.log('鼠标上松')
     if ((typeof frameDocument.oncontextmenu) !== 'function') {
     frameDocument.oncontextmenu = function() {
     console.log('鼠标右键点击');
     }
     }
     }
     }
     };*/
    //初始化图片上传窗口
    /*$("#imageWindow").jqxWindow({
     width: 300,
     height: 150,
     autoOpen: false,
     title: '<b>请上传图片</b>',
     resizable: false,
     isModal: true
     });
     //初始化图片上传控件
     $("#imageUpload").jqxFileUpload({accept: 'image/!*', uploadUrl: '#', fileInputName: 'imageToUpload'})
     .on('uploadEnd', function (event) {
     var args = event.args;
     var fileName = args.file;
     var stopIndex = fileName.indexOf('.');
     var name = fileName.slice(0, stopIndex);
     var extension = fileName.slice(stopIndex);
     var iconUrl;
     var serverResponse = args.response;
     $("#editor", 'insertHTML', "<div><img src ='" + "../images/nav3.png'" + "' style= 'display: inline; width: 16px; margin-right: 5px;' /><span>" + name + "<strong>" + extension + "</strong></span></div>");
     });*/

    /*初始化文件上传窗口*/
    $("#fileWindow").jqxWindow({
        width: 300,
        minHeight: 200,
        autoOpen: false,
        title: '<b>请上传文件</b>',
        resizable: false,
        isModal: true
    });

    /*初始化自定义标准对象窗口*/
    $('#custom_object_window').jqxWindow({
        width: 300,
        minHeight: 200,
        autoOpen: false,
        title: '<b>请配置自定义对象</b>',
        resizable: false
    });

    /*为filedisplay div绑定点击事件*/
    $("#fileDisplay").delegate("button", "click", function () {
        $(this).parent().parent().remove();
    });

    //初始化文件上传控件
    /*$("#fileUpload").jqxFileUpload({accept: 'doc/!*', uploadUrl: '#', fileInputName: 'fileToUpload'});*/


    //获取富文本编辑器中插入的visualModal设置其contentEditable为false
    function disEdit() {
        var disEdits = frameDocument.getElementsByClassName("disEdit");
        for (var i = disEdits.length - 1; i >= 0; i--) {
            disEdits[i].setAttribute('contentEditable', 'false');
        }
    }

    //定义生成configWindow之后的绑定事件函数
    function addConfigWindowEvent(configInfo, element, fn) {
        $(".configWindow" + " #Cancel").one("click", function () {
            cleanConfigWindow(element);
        });
        $(".configWindow" + " #Save").one("click", function () {
            fn();
        })
    }


    //根据生成的json生成可视化模块
    function createVisualModal(json) {
        var jsonStr = JSON.stringify(json),
            title = getOneValue(json),
            infoWrap = "&nbsp;<div datafield=" + jsonStr + " class='disEdit customizeObj'" + "'>" +
                title + "</div>&nbsp;",
            modalObj;
        $("#editor").jqxEditor('execute', 'insertHTML', infoWrap);
        $("#editor").jqxEditor('focus');
        //永远获取class为json.classname的最后一个节点，就是当前加入的节点
        //console.log(infoWrap);
        modalObj = frameDocument.getElementsByClassName('customizeObj')[frameDocument.getElementsByClassName('customizeObj').length - 1];
        //console.log(modalObj);
        addModalEvent(modalObj);
    }


    /*document.getElementById("testButton").onclick = nameCheck;*/


    //定义获取元素页面绝对位置的函数
    function getOffset(element) {
        var actualLeft = element.offsetLeft,
            actualTop = element.offsetHeight,
            currentParent = element.offsetParent;

        while (currentParent !== null) {
            actualLeft += currentParent.offsetLeft;
            actualTop += currentParent.offsetTop;
        }
        return {actualLeft: actualLeft, actualTop: actualTop};
    }


    /*    //定义visualDiv模块的函数
     function applyEditor(json) {
     $("#editor").jsonEditor(json);
     }*/


    //根据传入的元素给输入域监听对应的失焦事件，并绑定相应的输入印证
    function inputAddEvent(element, validatorType, label) {
        var reMap = new Map([
            ["nameCheck", /[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*/],
            ["macCheck", /^([0-9A-Fa-f]{2})(-[0-9A-Fa-f]{2}){5}|([0-9A-Fa-f]{2})(:[0-9A-Fa-f]{2}){5}/],
            ["ipCheck", /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/],
            ["domainCheck", /((https|http|ftp|rtsp|mms):\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)/g],
            ["imsiCheck", /^4600[0,1,2,3,5,6,7]\d{10}$/g],
            ["imeiCheck", /^\d{15}$/],
            ["misdnCheck", /\d+\+\d+\+\d+/],
            ["emailCheck", /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/]
        ]);
        element.addEventListener("blur", function (event) {
            var str = event.target.value,
                re = reMap.get(validatorType);
            if (str && (!re.test(str))) {
                event.target.nextSibling.style.visibility = 'visible';
                event.target.nextSibling.setAttribute('title', label + '格式不正确，请修改！');
                event.target.focus();
            } else {
                event.target.nextSibling.style.visibility = 'hidden';
            }
        })
    }

    /*富文本编辑器监听dragenter事件，显示占位元素，通过占位元素监听文件drop事件，模拟出富文本监听file drop事件*/
    document.querySelector('.chat-input').addEventListener('dragenter', function () {
        "use strict";
        var editorPlaceHolder = document.querySelector('#editorPlaceHolder');
        editorPlaceHolder.style.display = 'block';
    }, false);
    document.querySelector('#editorPlaceHolder').addEventListener('dragleave', function () {
        "use strict";
        var editorPlaceHolder = document.querySelector('#editorPlaceHolder');
        editorPlaceHolder.style.display = 'none';
    });

    document.querySelector('.chat-input').addEventListener('drop', function () {
        "use strict";
        var editorPlaceHolder = document.querySelector('#editorPlaceHolder');
        editorPlaceHolder.style.display = 'none';
        $("#editor").jqxEditor('focus');
    });
});

/*判断标准对象输入窗口是否有输入值
 * parame:无
 * return:boolean(true/false)*/
function hasOneValue(configInfo) {
    var configDiv = document.getElementById(configInfo.id);
    var inputs = configDiv.getElementsByTagName('input');
    for (var input in inputs) {
        if (inputs[input].type === 'text' && inputs[input].value) {
            return true;
        }
    }
    return false;
}

//定义一个获取json对象elements对象数组第一个非空的value,然后生成title
function getOneValue(json) {
    var title;
    for (var element in json.params) {
        if (json.params[element].value) {
            title = json.label + ":" + json.params[element].value;
            break;
        }
    }
    return title;
}

//根据changeConfigWindow中修改的值修改visualModal显示的信息
function changeVisualModal(json, element) {
    var title = getOneValue(json),
        jsonStr = JSON.stringify(json);
    element.innerText = title;
    element.setAttribute('datafield', jsonStr);
}
function isClass(obj) {
    if (obj === null) {
        return "null";
    }
    else if (obj === undefined) {
        return "undefined";
    }
    else return Object.prototype.toString.call(obj).slice(8, -1);
}
//定义javascript中深度复制函数
function deepClone(obj) {
    var result,
        objClass = isClass(obj);
    if (objClass === "Array") {
        result = [];
    } else if (objClass === "Object") {
        result = {};
    } else return obj;

    for (key in obj) {
        if (isClass(obj[key]) == "Array" || "Object") {
            result[key] = arguments.callee(obj[key]);
        } else {
            result[key] = obj[key]
        }
    }
    return result;
}
//获取该控件的配置信息，然后根据控件信息获取输入域的值包装成一个json
function createJson(configInfo) {
    var jsonNew = deepClone(configInfo),
        value;
    //jsonNew.classname = jsonNew.id.slice(0, -6) + "VisualModal";
    for (var element in jsonNew.params) {
        jsonNew.params[element].value = document.getElementById(jsonNew.params[element].id).value;
    }
    return jsonNew;
}
//清除自定义window
function cleanConfigWindow(element) {
    $('.configWindow, .apiConfigWindow').each(function () {
        var $this = $(this);
        if ($this.hasClass('apiConfigWindow')) {
            $('#sys_api_list_set').empty();
            $('#sys_name').val('');
            $this.hide();
            return;
        }
        $this.remove();
    });
}


//定义生成changeConfigWindow之后的绑定事件函数
function addChangeConfigWindowEvent(configInfo, modal, element) {
    /*console.log(element);*/
    var configInfoClassname = configInfo.classname;
    $(".configWindow #Cancel").one("click", function (event) {
        cleanConfigWindow(element);
    });
    $(".configWindow #Save").one("click", function () {
        //获取输入域的值包装成json
        if (hasOneValue(configInfo)) {
            var json = createJson(configInfo);
            //console.log(json);
            changeVisualModal(json, modal);
            cleanConfigWindow(element);
        } else {
            alert("请至少填入一个值");
        }
    })
}


//根据配置信息configid生成window
function createConfigWindow(configInfo) {
    var configWindowBefore = document.getElementsByClassName("configWindow")[0],
        changeConfigWindowBefore = document.getElementsByClassName("changeConfigWindow")[0],
        apiConfigWindowBefore = document.getElementsByClassName("apiConfigWindow")[0],
        configWindow,
        configDiv = document.createElement("div"),
        titleDiv = document.createElement("div"),
        windowLabel = document.createTextNode(configInfo.label),
        footerDiv = document.createElement("div"),
        body = document.getElementsByTagName("body")[0];
    configDiv.setAttribute("id", configInfo.id);
    configDiv.setAttribute("class", "configWindow");
    titleDiv.appendChild(windowLabel);
    configDiv.appendChild(titleDiv);
    if (configWindowBefore || changeConfigWindowBefore || apiConfigWindowBefore) {
        cleanConfigWindow();
    }
    for (var element in configInfo.params) {
        var wrapNode = document.createElement("div"),
            inputNode = document.createElement('input'),
            labelNode = document.createElement("span"),
            labelTextNode = document.createTextNode(configInfo.params[element].label + ":"),
            validatorNode = document.createElement('span');
        validatorNode.innerHTML = '*';
        validatorNode.setAttribute('title', '格式不正确，请修改');
        inputNode.setAttribute("id", configInfo.params[element].id);
        inputNode.setAttribute("type", 'text');
        /*inputAddEvent(inputNode, configInfo.elements[element].validator, configInfo.elements[element].label);*/
        //判断element是否有value属性，有value属性就填进输入框
        if (configInfo.params[element].value) {
            inputNode.value = configInfo.params[element].value;
        }
        labelNode.appendChild(labelTextNode);
        wrapNode.appendChild(labelNode);
        wrapNode.appendChild(inputNode);
        wrapNode.appendChild(validatorNode);
        configDiv.appendChild(wrapNode);
    }
    footerDiv.innerHTML = '<input type="button" id="Save" value="确定" /><input id="Cancel" type="button" value="取消" />';
    configDiv.appendChild(footerDiv);
    body.appendChild(configDiv);
    configWindow = document.getElementsByClassName('.configWindow')[0];
    return configWindow;
}

//定义生成configWindow之后的绑定事件函数
function addConfigWindowEvent(configInfo, element, fn) {
    $("." + configInfo.classname + " #Cancel").one("click", function (eve) {
        eve.stopPropagation();
        cleanConfigWindow(element);
    });
    $("." + configInfo.classname + " #Save").one("click", function (eve) {
        eve.stopPropagation();
        fn();
    })
}

//定义获取元素数据块json对象的函数
function getJson(element) {
    var jsonStr = element.getAttribute('datafield'),
        jsonNew = JSON.parse(jsonStr);
    return jsonNew;
}


//定义生成json展示模块的函数
function createMenu(json) {
    cleanMenu();
    var menuTree = document.createElement("div"),
        dlTag = document.createElement("dl");
    menuTree.setAttribute("class", "menuTree");
    dlTag.setAttribute("class", "treeRoot");
    for (var element in json.params) {
        var ddTag = document.createElement("dd"),
            aTag = document.createElement("a"),
            divTag = document.createElement("div"),
            text = json.params[element].label + ":" + json.params[element].value;
        aTag.setAttribute("class", "firstLevel");
        divTag.setAttribute("class", "secondLevel");
        aTag.innerText = text;
        ddTag.appendChild(aTag);
        if (json.params[element].handle) {
            var handles = json.params[element].handle;
            for (var handle in handles) {
                aTag = document.createElement("a");
                aTag.innerText = handles[handle];
                divTag.appendChild(aTag);
            }
            ddTag.appendChild(divTag);
        }
        dlTag.appendChild(ddTag);
    }
    menuTree.appendChild(dlTag);
    document.body.appendChild(menuTree);
}
//清除前面生成的menuTree
function cleanMenu() {
    var menuTreeBefore = document.getElementsByClassName('menuTree')[0];
    if (menuTreeBefore) {
        document.body.removeChild(menuTreeBefore);
    }
}

//传入visualModal的父节点，并根据event.target来调用相应的事件处理程序
function addModalEvent(modal) {
    var iframOffset = $(".advanced-text .jqx-editor-content").offset(),
        changeConfigWindowBefore = null;
    modal.addEventListener("click", function () {
        cleanMenu();
        var configInfo = getJson(modal),
            modalHeight = modal.offsetHeight,
            modalWidth = modal.offsetWidth;        //configInfo.classname = "changeConfigWindow";
        var changeConfigWindow = createConfigWindow(configInfo);
        $('#' + configInfo.id).attr("style", "left:" + (modal.offsetLeft + iframOffset.left) + "px; top:" + (modal.offsetTop + iframOffset.top + modalHeight) + "px");
        addChangeConfigWindowEvent(configInfo, modal, changeConfigWindow);
    }, false);
    modal.addEventListener("contextmenu", function (event) {
        var modalHeight = modal.offsetHeight,
            modalWidth = modal.offsetWidth;
        if (changeConfigWindowBefore = document.getElementsByClassName("changeConfigWindow")[0]) {
            cleanConfigWindow(changeConfigWindowBefore);
        }
        event.preventDefault();
        cleanConfigWindow(modal);
        createMenu(getJson(modal));
        $(".menuTree").attr("style", "left:" + (modal.offsetLeft + iframOffset.left + modalWidth) + "px; top:" + (modal.offsetTop + iframOffset.top) + "px");
        /*        $(".menuTree dd").hover(function () {
         $(".secondLevel", this).show();
         });
         $(".menuTree dd").mouseleave(function () {
         $(".secondLevel", this).hide();
         });*/
        $(".menuTree").hover(function (event) {
            $(".menuTree").show();
        }, function (event) {
            $(".menuTree").remove();
            $('#editor').jqxEditor('focus');
        })
    })
}
//向聊天窗口发送附件消息
function sendAttachmentMsg() {
    var aid = [];
    $("#fileDisplay").find("div").each(function () {
        aid.push($(this).attr("aid"));
    });
    if (aid.length > 0) {
        addMessage(mission.roomID, mission.userID, mission.userName, '', aid, []);
    }
    $('#fileWindow').jqxWindow('close');
}

//清空附件上传展示区的文件展示
function fileDisplayClear() {
    $('#fileDisplay').children('div').remove();
    $('#fileWindow').jqxWindow('close');
}
/*获取当前文本框中选中区域生成自定义对象，构造函数模式
 * param: 文本编辑区域节点
 * return: 含有选中文字区域坐标属性（coordinate：bottom, left, right, top）和range(surroundContents)的对象*/
function SelectedRange(win) {
    var win = win || window;
    var doc = win.document;
    var sel = doc.selection;
    this.coordinate = null;
    this.range = null;
    this.dirc = false;
    if (sel) {
        if (sel.type != 'Control') {
            this.range = sel.createRange();
            this.range.collapse(false);
            this.coordinate = {
                x: this.range.boundingLeft + this.range.boundingWidth,
                y: this.range.boundingTop + this.range.boundingHeight,
            }
        }
    } else if (win.getSelection) {
        sel = win.getSelection();
        this.dirc = sel.anchorOffset > sel.focusOffset;
        this.range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
        this.coordinate = this.range.getBoundingClientRect ? this.range.getBoundingClientRect() : null;
    }
    this.surroundNode = function (node) {
        $("#editor").jqxEditor('focus');
        this.range.surroundContents(node);
        var newRange = document.createRange();
        newRange.selectNode(node);
        newRange.collapse(this.dirc);
        sel.removeAllRanges();
        sel.addRange(newRange);
        newRange.detach();
        newRange = null;
    };
    this.disable = function () {
        this.range.detach();
        this.range = null;
    }
}

/*生成配置自定义对象的窗口，构造函数模式
 * param: 窗口坐标（数组），二级菜单数据(标准对象)
 * return: 自定义窗口对象
 * */
/*custom_object_type_list"></div>
 <div id="custom_object_api_list*/
function CustomObjectConfigWindow(coordinate, range) {
    this.show = function () {
        $('#custom_object_window').jqxWindow({
            position: coordinate
        });
        $('#custom_object_window').jqxWindow('open');
        $('#custom_object_type_list').jqxDropDownList({
            source: ['app', 'page'],
            width: 140,
            height: 26,
            autoDropDownHeight: true,
            placeHolder: '请选择类型'
        });
        $('#custom_object_type_list').on('select', function (event) {
            var args = event.args;
            $('#custom_object_api_list').jqxDropDownList('source', testListData[args.item.label]);
        });
        $('#custom_object_api_list').jqxDropDownList({
            source: ['名称', '体积', '发布者'],
            width: 140,
            height: 26,
            autoDropDownHeight: true,
            placeHolder: '请选择api'
        });
        (function (that) {
            $('#confirm_configuration_btn').on('click', function () {
                //onsole.log('调用一次');
                that.confirm();
            });

            $('#cancel_configuration_btn').on('click', function () {
                that.cancel();
            })
        })(this)
    };
    this.confirm = function () {
        var type = $('#custom_object_type_list').jqxDropDownList('getSelectedItem'),
            api = $('#custom_object_api_list').jqxDropDownList('getSelectedItem');
        if (type && api) {
            var div = document.createElement('div');
            var span = document.createElement('span');
            span.innerHTML = '&nbsp;';
            div.contentEditable = 'false';
            div.className = 'customizeObj';
            div.setAttribute('datafield', type + api);
            $('#custom_object_window').jqxWindow('close');
            window.frames[1].document.body.focus;
            range.surroundNode(div);
            if (!div.nextElementSibling) {
                div.parentNode.appendChild(span);
            }
            this.removeEvent();
            return true;
        } else {
            console.log('两个下拉列表都要选择哦！')
        }
    };
    this.cancel = function () {
        var type = $('#custom_object_type_list').jqxDropDownList('getSelectedItem'),
            api = $('#custom_object_api_list').jqxDropDownList('getSelectedItem');
        if (!type) {
            $('#custom_object_type_list').jqxDropDownList('focus')
        } else if (!api) {
            $('#custom_object_api_list').jqxDropDownList('focus')
        }
        this.removeEvent();
    };
    this.removeEvent = function () {
        $('#confirm_configuration_btn').unbind('click');
        $('#cancel_configuration_btn').unbind('click');
    }
}

var testListData = {
    app: ['名称', '体积', '发布者'],
    page: ['域名', 'IP', '端口']
};