/**
 * Created by admin on 2016/12/7.
 */
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
let rMap = {
    room: 30,
    subroom: 28,
    app: 30,
    customapp: 30,
    object: 22,
    backobject: 22,
    result: 22,
    end: 30,
    custom: 22
};

let rSelectMap = {
    room: 40,
    subroom: 30,
    app: 40,
    object: 20,
    backobject: 20
};

let isOverRoom = false;
let linkInfo = {};

var width = $("#eventgraph").width(),
    height = $("#eventgraph").height(),
    ctrlKey,
    shiftKey,
    scaleX = d3.scale.linear().domain([0, width]).range([0, width]),
    scaleY = d3.scale.linear().domain([0, height]).range([0, height]),
    zoomer = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .x(scaleX)
        .y(scaleY)
        .on("zoom", redraw),
    svg = d3.select("#eventgraph").attr("tabindex", 1).on("keydown.brush", keydown).on("keyup.brush", keyup).each(function () {
        this.focus();
    }).append("svg").attr({"width": width, "height": height}),//.style("background", "radial-gradient(circle, #566D7B, #2F414D, #1C232D)"),
    force = d3.layout.force()
        .gravity(0)
        // .friction(0.9)
        .linkDistance(function (d) {
            return 100 + d.target.weight * 10;
        })
        .linkStrength(10)
        .charge(-100)
        // .chargeDistance(2000)
        .size([width, height]),
    forceNodesT = [],
    forceNodes = force.nodes(),
    forceLinks = force.links(),
    zoomG = svg.append("svg:g").attr("class", "zoom").call(zoomer),
    // rect = zoomG.append("svg:rect")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("fill", "transparent")
    //     //.attr("opacity", 0.5)
    //     .attr("stroke", "transparent")
    //     // .attr("stroke-width", 1)
    //     //.attr("pointer-events", "all")
    //     .attr("id", "zrect"),
    brush = zoomG.append("svg:g")
        .datum(function () {
            return {selectedByMouse: false, previouslySelectedByMouse: false};
        })
        .attr("class", "brush"),
    elementsG = zoomG.append("svg:g").attr("class", "elementsG"),
    linksG = elementsG.append("g").attr("class", "linksG"),
    nodesG = elementsG.append("g").attr("class", "nodesG"),
    tipsG = elementsG.append("g").attr("class", "tipsG"),
    links = linksG.selectAll("line.link"),
    nodes = nodesG.selectAll("g.node"),
    tips = tipsG.selectAll("g.tip"),
    nodesMap = {},
    eventToNode = {};

$(function () {
    d3.select(window).on("resize", function (e) {
        width = $("#eventgraph").width();
        height = $("#eventgraph").height();
        svg.attr({
            width: $("#eventgraph").width(),
            height: $("#eventgraph").height()
        });
        // rect.attr({
        //     width: $("#eventgraph").width(),
        //     height: $("#eventgraph").height()
        // });
        // tree.size([height * 2, width]);
        force.size([width, height]);
        init(forceNodes, forceLinks);
        scaleX = d3.scale.linear().domain([0, width]).range([0, width]);
        scaleY = d3.scale.linear().domain([0, height]).range([0, height]);
        zoomer.x(scaleX).y(scaleY);
        // zoomer.on("zoom", null);
        // zoomer.on("zoom", redraw);
        // init(forceNodes, forceLinks);
        // zoomFit();
    });


    $("#eventgraph").on("resize", function (e) {
        width = $("#eventgraph").width();
        height = $("#eventgraph").height();
        svg.attr({
            width: $("#eventgraph").width(),
            height: $("#eventgraph").height()
        });
        // rect.attr({
        //     width: $("#eventgraph").width(),
        //     height: $("#eventgraph").height()
        // });
        // tree.size([height * 2, width]);
        force.size([width, height]);
        init(forceNodes, forceLinks);
        scaleX = d3.scale.linear().domain([0, width]).range([0, width]);
        scaleY = d3.scale.linear().domain([0, height]).range([0, height]);
        zoomer.x(scaleX).y(scaleY);
        // zoomer.on("zoom", null);
        // zoomer.on("zoom", redraw);
        // init(forceNodes, forceLinks);
        // zoomFitAuto();
    });

    /*生成自定义对象选择菜单*/
    var customObjectMenu = new CustomObjectMenu(document.querySelector('#customObjectMenu'), configObjData);
    try {
        document.querySelector('.add_custom_object_btn').addEventListener('click', function (eve) {
            eve.stopPropagation();
            customObjectMenu.show({
                top: eve.target.offsetTop + 'px',
                left: eve.target.offsetWidth + eve.target.offsetLeft + 'px'
            });

            document.onclick = function (event) {
                //console.log('我已经被调用', event.target, event);
                if (!customObjectMenu.testMouseIn(event)) {
                    customObjectMenu.close();
                }
            }
        });
    } catch (e) {
        console.log(e);
    }

});

function zoomFit() {
    let fullWidth = $("#eventgraph").width();
    let fullHeight = $("#eventgraph").height();
    let bounds = elementsG.node().getBBox();
    let parent = elementsG.node().parentElement;
    let width = bounds.width,
        height = bounds.height;
    let midX = bounds.x + width / 2,
        midY = bounds.y + height / 2;
    if (width == 0 || height == 0) return; // nothing to fit
    let scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
    if (scale > 2) {
        scale = 2
    }
    let translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    // console.trace("zoomFit", translate, scale);
    elementsG
        .transition()
        .duration(500) // milliseconds
        .call(zoomer.translate(translate).scale(scale).event);
}

//自动概览缩放聚焦
let zoomAuto = true;
function zoomFitAuto() {
    if (zoomAuto) zoomFit();
}

//自动概览缩放聚焦开关
function changeZoomAuto() {
    zoomAuto = !zoomAuto;
    let thisLi = $("#changeZoomAuto");
    thisLi.toggleClass("fa-stop fa-crosshairs");
    if (zoomAuto) zoomFit();
}


//tree
// let tree = d3.layout.tree().size([height * 2, width]).separation(function (a, b) {
//     console.log(a.parent == b.parent ? (rMap[a.nodeType] + rMap[b.nodeType]) : 2);
//     return (a.parent == b.parent ? (rMap[a.nodeType] + rMap[b.nodeType]) : (rMap[a.nodeType] + rMap[b.nodeType]));
// });
let tree = d3.layout.tree().nodeSize([40, 40]).separation(function (a, b) {
    return (a.parent == b.parent ? 3 : 2);
});

let treeNodes = null;
let treeLinks;
let treeDiagonal = d3.svg.diagonal()
    .projection(function (d) {
        return [d.y, d.x];
    });
let treeDiagonalC = function (l) {
    let source = {
        x: l.source.x,
        y: l.source.y + (rMap[l.source.nodeType] || 18)
    };

    let target = {
        x: l.target.x,
        y: l.target.y - (rMap[l.target.nodeType] || 18)
    };

    return treeDiagonal({source: source, target: target})
};


function renderTree(source) {
    let nodes = tree.nodes(treeNodes).reverse();
    renderNodes(nodes, source);
    renderLinks(nodes, source);

    let depth = null;
    d3.selectAll("circle").filter(function (d) {
        return d3.select(this).attr("r") < 1;
    }).each(function (d) {
        if (depth == null) {
            depth = d.depth;
            return;
        }

        if (d.depth < depth) {
            depth = d.depth;
        }
    });

    if (depth > 0) depth -= 1;

    trans(depth);

    //                console.log(_links);n
}
function unfoldChild(targetMenu, d) {
    d3.event.stopPropagation();
    var node = targetMenu[0][0].parentNode.parentNode;
    var d3Node = d3.select('#' + node.getAttribute('id'));
    var nodeId = node.getAttribute('id');
    var radius = {innerRadius: rMap[d.nodeType] + 37, outerRadius: rMap[d.nodeType] + 67};
    var position = [0, 0];
    var nodeData = d3.select('#' + nodeId)[0][0]['__data__'];
    var pieNodeDataArr = [];
    if (!nodeData['_children'] || nodeData['_children'].length === 0) return;
    var _childrenData = nodeData['_children'];
    var length = _childrenData.length;
    for (var i = 0; i < length; i++) {
        pieNodeDataArr.push({
            id: _childrenData[i].name,
            label: _childrenData[i].label,
            clickHandle: function (targetPieNode) {
                d3.event.stopPropagation();
                console.log(nodeData);
                var nodeClass = targetPieNode.select('path').attr('class');
                _childrenData.forEach(function (obj, index, arr) {
                    console.log(obj, nodeClass);
                    if (obj.name === nodeClass) {
                        _childrenData.splice(index, 1);
                        if (nodeData.children instanceof Array) {
                            nodeData.children.push(obj);
                        } else {
                            nodeData.children = [obj];
                        }
                    }
                });
                if (_childrenData.length === 0) {
                    $(node).removeClass('shrinkedNode');
                }
                $(targetPieNode[0][0]).parent().remove();
                d3.selectAll('g[class*="PieMenu"]').remove();
                renderTree(treeNodes);
            }
        });
    }
    renderPieMenu(d3Node, position, radius, null, pieNodeDataArr, 'secondPieMenu');
}
function renderNodes(nodes, source) {
    nodes.forEach(function (d) {
        d.y = d.depth * 180;
    });

    let enterTimer = NaN;
    let ifexcute = false;
    let node = nodesG.selectAll("g.node")
        .data(nodes, function (d) {
            return d.name;
        });
    let nodeUpdate = node.transition().duration(300)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    let nodeEnter = node.enter().append("svg:g")
        .attr({
            id: function (d) {
                return "g-" + d.name;
            },
            class: function (d) {
                return 'node ' + d.nodeType;
            }
        })
        // .attr("transform", function (d) {
        //     return "translate(" + source.y0 + "," + source.x0 + ")";
        // })
        //绑定移入移出事件
        .on('mouseenter', function () {
            enterTimer = setTimeout(function (nodeId) {
                switchLinkTextVisual(nodeId);
                ifexcute = true;
            }, 800, d3.select(this).attr('id'));
        })
        .on('mouseleave', function () {
            if (enterTimer) {
                clearTimeout(enterTimer);
            }
            if (ifexcute) {
                switchLinkTextVisual();
            }
        })
        .on("mousedown", function (d) {
            // toggleTree(d);
            // renderTree(d);
            if (d.nodeType == 'result' || d.nodeType == 'custom') {
                // addTab(d)
                // let left;
                // let rightClick = isRightClick(event);
                // if (rightClick) {
                //     console.debug(d);
                //     if ((window.width - event.clientX) < (200 + $("#splitterRight").width())) {
                //         left = event.offsetX - 200;
                //     } else {
                //         left = event.offsetX;
                //     }
                //     $(".spinner").show();
                //     $('#message_tabs').show('fast',function () {
                //         addNodeInfo(d);
                //     }).css({
                //         top: event.offsetY,
                //         left: left
                //     });
                // }
            }

            if (d3.event.defaultPrevented) return;
            if (!shiftKey) {
                //如果未按下shift键，取消所有选择
                node.classed("selected", function (p) {
                    return p.selectedByMouse = p.previouslySelectedByMouse = false;
                })
            }
            // 选取这个节点
            d3.select(this).classed("selected", d.selectedByMouse = !d.previouslySelectedByMouse);
        }).on('click', function (d) {
            //若是drag事件，则取消click事件触发
            //if (d3.event.defaultPrevented) return;
            console.log(d);
            if (enterTimer) {
                clearTimeout(enterTimer);
            }
            d3.event.stopPropagation();
            if (d3.select(this).select('g.firstPieMenu').size() > 0) { //重复左键取消菜单
                d3.selectAll('g[class*="PieMenu"]').remove();
                return;
            } else {
                d3.selectAll('g[class*="PieMenu"]').remove();
            }
            var $node = $(this),
                d3Node = d3.select(this);
            var data = {
                particular: {
                    id: 'particular', label: '详情', clickHandle: function (targetMenu) {
                        d3.event.stopPropagation();
                        var nodeId = targetMenu[0][0].parentNode.parentNode.getAttribute('id');
                        d3.selectAll('g[class*="PieMenu"]').remove();
                        $("#report_top_wrap").hide();
                        $("#report_foot_wrap").hide();
                        $('#full-tabs').show();
                        let nodeClass = $('#' + nodeId);
                        let title = $(nodeClass.html())[2].innerText;
                        let apiId = nodeId.substring(2);
                        var opts = {
                            'authorization': getURLParams('token') // String | token字串
                        };
                        console.log(apiId)
                        if (nodeClass.hasClass('object')) {
                            clickParticulars('ObjectApi', title, apiId, opts);
                        } else if (nodeClass.hasClass('result')) {
                            clickParticulars('ResultApi', title, apiId, opts, 'result');
                        } else if (nodeClass.hasClass('custom')) {
                            clickParticulars('ResultApi', title, apiId, opts, 'custom');
                        } else if (nodeClass.hasClass('backobject')) {
                            clickParticulars('CallbackApi', title, apiId, opts, 'backobject');
                        }
                    }
                }, report: {
                    id: 'report', label: '报告', clickHandle: function (targetMenu) {
                        d3.event.stopPropagation();
                        // console.log('报告');
                        var nodeId = targetMenu[0][0].parentNode.parentNode.getAttribute('id');
                        d3.selectAll('g[class*="PieMenu"]').remove();
                        nodeId = nodeId.substring(2);
                        // console.log(nodeId,objectID);
                        $('#show_table-excle').trigger('click', [nodeId]);
                    }
                }, rename: {
                    id: 'rename', label: '更名', clickHandle: function (targetMenu) {
                        d3.event.stopPropagation();
                        let id = targetMenu[0][0].parentNode.parentNode.getAttribute('id');
                        d3.selectAll('g[class*="PieMenu"]').remove();
                        console.log('改名');
                        swal({
                            title: '请输入修改名称',
                            input: 'text',
                            showCancelButton: true,
                            confirmButtonText: '确认',
                            cancelButtonText: '取消',
                            inputValidator: function (value) {
                                return new Promise(function (resolve, reject) {
                                    console.log('alert:', arguments);
                                    if (value) {
                                        resolve()
                                    } else {
                                        reject('请输入有效字符！')
                                    }
                                })
                            }
                        }).then(function (result) {
                            let apiInstance = new missionClient.EventApi();
                            let nodeInfo = d3.select('#' + id)[0][0].__data__;
                            let info = {}; // Info |
                            info.nodeID = nodeInfo.name;
                            info.nodeType = nodeInfo.nodeType;
                            info.fieldName = 'label';
                            info.value = result;
                            info.eventID = nodeInfo.info.eventID;
                            console.log(nodeInfo, info);
                            let opts = {
                                'authorization': getURLParams('token') // String | token字串
                            };
                            apiInstance.updateNodeInfo(info, opts).then(function (data) {
                                console.log('API called successfully. Returned data: ', data);
                                if (data.ri.rc === 0) {
                                    throw data.ri.msg;
                                }
                                $($(d3.select('#' + id)[0][0]).find('text')[0]).text(data.d);
                                toastr.info(data.d, '你已成功修改房间名');
                            }, function (error) {
                                throw error;
                            }).catch(function (err) {
                                console.log(err)
                            });
                        }).catch(swal.noop);
                    }
                }, shrink: {
                    id: 'shrink', label: '隐藏', clickHandle: function (targetMenu) {
                        if (enterTimer) {
                            clearTimeout(enterTimer);
                        }
                        var nodeId = targetMenu[0][0].parentNode.parentNode.getAttribute('id');
                        d3.selectAll('g[class*="PieMenu"]').remove();
                        shrinkIntoNode(nodeId);
                        d3.event.stopPropagation();
                        console.log('收缩', targetMenu, targetMenu[0][0].parentNode.parentNode);
                    }
                }, extend: {
                    id: 'extend', label: '展开', clickHandle: (targetMenu) => {
                        unfoldChild(targetMenu, d);
                    }
                }, delete: {
                    id: 'delete', label: '删除', clickHandle: (targetMenu) => {
                        d3.event.stopPropagation();
                        let id = targetMenu[0][0].parentNode.parentNode.getAttribute('id');
                        d3.selectAll('g[class*="PieMenu"]').remove();
                        swal({
                            title: '将删除当前节点所在事件',
                            showCancelButton: true,
                            confirmButtonText: '确认',
                            cancelButtonText: '取消',
                        }).then(function () {
                            let nodeInfo = d3.select('#' + id)[0][0].__data__;
                            let eventID = nodeInfo.info.eventID;
                            console.log('删除事件', eventID);
                            let apiInstance = new missionClient.EventApi();
                            let opts = {
                                'authorization': getURLParams('token') // String | token字串
                            };
                            apiInstance.deleteEventByID(eventID, opts).then(function (data) {
                                console.log('API called successfully. Returned data: ', data);
                                if (data.ri.rc === 0) {
                                    throw data.ri.msg;
                                }
                                toastr.info('', '删除成功');
                                //重绘d3
                                deleteEventByID(eventID);
                            }, function (error) {
                                throw error;
                            }).catch(function (err) {
                                console.error(err);
                                toastr.error('', '删除失败');
                            });
                        }).catch(swal.noop);
                    }
                }
            };
            // }
            let configData = [];
            switch (d.nodeType) {
                case 'room':
                    configData = [
                        data.particular,
                        data.extend
                    ];
                    break;
                case 'app':
                case 'customapp':
                    configData = [
                        data.particular,
                        data.extend,
                        data.delete
                    ]
                    break;
                default:
                    configData = Object.values(data);
            }
            var radius = {innerRadius: rMap[d.nodeType] + 5, outerRadius: rMap[d.nodeType] + 35},
                position = [0, 0];
            renderPieMenu(d3Node, position, radius, null, configData, 'firstPieMenu');
            /*            if ($node.is('.result, .backobject, .custom, .object')) {
             renderPieMenu(d3Node, position, radius, null, data);
             }*/
        });

    nodeEnter.append("svg:circle")
    // .style("fill", function (d) {
    //     return d._children ? "lightsteelblue" : "#fff";
    // })
        .style("fill-opacity", "1")
        .attr({
            r: 1e-6,
            width: function (d) {
                return d.name.length * 8 + 30
            }, height: "18px", x: function (d) {
                return -(d.name.length * 8 + 30) / 2
            }, y: function (d) {
                return "0px";
            }
        })

    node.on(".drag", null);

    let nodeExit = node.exit();
    nodeExit.selectAll('image').transition().duration(300)
        .style(
            "opacity", 0
        );
    nodeExit.selectAll('circle').transition().duration(300)
        .attr("r", 1e-6)
        .each('end', d => {
            nodeExit.remove();
        });

    // nodeExit.transition().attr("transform", function (d) {
    //     return "translate(" + source.y + "," + source.x + ")";
    // }) .remove();
    // nodeExit.select("circle")
    //     .attr("r", 1e-6);

    // renderLabels(nodeEnter, nodeUpdate, nodeExit);

    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}
function clickParticulars(type, title, id, opts, nodeClass) {
    let Flag = false;
    $('.hadCountForTab').each(function () {
        console.log(id, $(this).attr('data'));
        if (id === $(this).attr('data')) {
            let index = $(this).parents('.jqx-reset').index();
            $('#full-tabs').jqxTabs('select', index);
            Flag = true;
        }
    });
    if (Flag) {
        return false;
    }
    let getType = '';
    switch (nodeClass) {
        case 'result':
            getType = 'getResultDetail';
            break;
        case 'custom':
            getType = 'getCustomResult';
            break;
        case 'backobject':
            getType = 'getCallbackObject';
            break;
        default :
            getType = 'getObjectView';
            break;
    }
    let apiInstance = new missionClient[type]();
    apiInstance[getType](id, opts).then(function (result) {
        console.log(result);
        if (result.ri.rc === 0) {
            throw result.ri.msg
        }
        if (nodeClass) {
            result = changeDataToBack(result);
        }
        if (nodeClass === 'backobject') {
            let tempHtml = renderResultToTableView(result.d.object, title, false, true, true);
            dataPresentation();
            AddTabDataCache(JSON.parse(result.d.object.data).data, result.d.object.id);
            AddDataTableUnderD3(title, tempHtml, result.d.object.id);
        } else {
            let tempHtml = renderResultToTableView(result.d, title, false, true, true);
            dataPresentation();
            AddTabDataCache(JSON.parse(result.d.data).data, result.d.id);
            AddDataTableUnderD3(title, tempHtml, result.d.id);
        }
    }, function (error) {
        throw error;
    }).catch(err => {
        console.error(err);
        toastr.error(title, '获取数据失败', {timeOut: 2000});
    });
}
function renderLinks(nodes, source) {
    treeLinks = tree.links(nodes);
    // var link = linksG.selectAll("path.tree-linked")
    var link = linksG.selectAll("g.tree-linked")
        .data(treeLinks, function (d) {
            return d.source.name + '-' + d.target.name;
        });

    link.selectAll("path").transition().duration(300)
        .attr("d", treeDiagonalC)
        .each("end", function (d) {
            d3.select('#g-' + d.source.name + '-' + d.target.name).select("text")
                .attr({
                    "text-anchor": "middle",
                    width: "0px",
                    height: "8px",
                    dy: function (d) {
                        return (d.source.x + d.target.x) / 2 - 2 + 'px'; //- parseInt(d3.select(this).style("font-size").replace("px", "")) + "px";
                    },
                    dx: function (d) {
                        return (d.source.y + d.target.y) / 2 + 'px';
                    }
                });
        });

    // link.enter().insert("svg:path", "g")
    link.enter().insert("svg:g")
        .attr("id", function (d) {
            return "g-" + d.source.name + '-' + d.target.name;
        })
        .attr("class", "tree-link");

    // linksG.selectAll("path.tree-linked")


    link.exit().selectAll('path').transition().duration(300)
        .attr("d", function (d) {
            // var o = {
            //     x: source.x,
            //     y: source.y
            // };
            let o = {
                x: d.source.x,
                y: d.source.y
            };
            return treeDiagonal({
                source: o,
                target: o
            });
        })
        .each('end', d => {
            link.exit().remove();
        });

}

var transing = false;
function trans(depth) {
    if (depth > d3.max(forceNodes, function (d) {
            return d.depth;
        })) {
        transing = false;
        return;
    }

    transing = true;
    let filterNodes = nodesG.selectAll("g.node").filter(function (d) {
        return d.depth === depth;
    }).attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
    });

    if (filterNodes[0].length === 0) {
        transing = false;
        return;
    }


    zoomFitAuto();
    depth += 1;

    let filterCircle = filterNodes.selectAll("circle");

    if (filterCircle[0].length === 0) {
        transing = false;
        return;
    }

    filterCircle.transition().duration(300)
        .style("fill-opacity", "1")
        .attr({
            r: function (d) {
                return rMap[d.nodeType] || 18
            }
        })
        // .style("fill", function(d) {
        //     return d._children ? "lightsteelblue" : "#fff";
        // })
        .each("end", function (d, index) {
            let select = nodesG.select("#g-" + d.name);
            // let iconSvg = $("#icon-node-" + d.nodeType).find("svg").getSVGElement();
            if (select.select("image.icon").empty()) {
                select.append("image")
                    .attr({
                        "class": "icon",
                        "aria-hidden": true,
                        width: function (d) {
                            return rMap[d.nodeType] * 4 / 3;
                        },
                        height: function (d) {
                            return rMap[d.nodeType] * 4 / 3;

                        },
                        x: function (d) {
                            return 0 - rMap[d.nodeType] * 2 / 3;
                        },
                        y: function (d) {
                            return 0 - rMap[d.nodeType] * 2 / 3;
                        },
                    })
                    // .append("use")
                    .attr("xlink:href", function (d) {
                        return "/svg/" + d.nodeType + ".svg";
                    })
                    .style("color", "#fff");

                select.append("svg:text").attr({

                    "text-anchor": "middle",
                    width: "0px",
                    height: "14px",
                    dy: function (d) {
                        return (rMap[d.nodeType] || 18) +
                            parseInt(d3.select(this).style("font-size").replace("px", "")) + "px";
                    }
                }).text(function (d) {
                    return d.label;
                }).style('fill-opacity', _.get(d3, ['event', 'scale'], null) < 0.3 ? 0 : 1);
            }


            // let filterLinks = d3.selectAll("path.tree-link").filter(function (l) {
            let filterLinks = d3.selectAll("g.tree-link").filter(function (l) {
                return l.source.name === d.name;
            });

            if (filterLinks[0].length === 0) {
                transing = false;
            }

            filterLinks.attr("class", "tree-linked")
                .append("svg:path")
                .attr("d", function (l) {
                    let o = {
                        x: d.x0,
                        y: d.y0
                    };

                    return treeDiagonal({
                        source: o,
                        target: o
                    });
                })
                .transition().ease("linear").duration(300)
                .attr("d", treeDiagonalC)
                //                            .style("opacity", "1")
                .each("start", function () {
                    if (index != 0) return;
                    nodesG.selectAll("g.node").filter(function (d) {
                        return d.depth == depth;
                    }).attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });
                    zoomFitAuto();
                })
                .each("end", function (d) {
                    /*console.log('#g-' + d.source.name + '-' + d.target.name);*/
                    d3.select('#g-' + d.source.name + '-' + d.target.name).append("svg:text")
                        .attr({
                            "text-anchor": "middle",
                            width: "0px",
                            height: "8px",
                            dy: function (d) {
                                return (d.source.x + d.target.x) / 2 - 2 + 'px'; //- parseInt(d3.select(this).style("font-size").replace("px", "")) + "px";
                            },
                            dx: function (d) {
                                return (d.source.y + d.target.y) / 2 + 'px';
                            }
                        })
                        .style('fill-opacity', _.get(d3, ['event', 'scale'], null) < 0.3 ? 0 : 1)
                        .text(function (d) {
                            return _.get(linkInfo, [d.source.name + '-' + d.target.name, 'label'], '');
                            // let links = null;
                            // try {
                            //     links = JSON.parse(d.target.info.info).links;
                            // } catch (e) {
                            //     links = null;
                            // }
                            // if (!links) return '';
                            // let name = d.source.name;
                            // if (d.source.nodeType == 'app' || d.source.nodeType == 'customapp') {
                            //     return '';
                            //     name = name.substring(name.indexOf('-') + 1);
                            // }
                            // // console.log(name);
                            // for (let l of links) {
                            //     if (l.from == name) {
                            //         return configFields[l.label] || l.label;
                            //     }
                            // }
                            // return '';
                        });

                    if ((index + 1) == filterCircle[0].length) {
                        trans(depth);
                    }

                });
            // 最后一层
            let maxNodeDepth = d3.max(forceNodes, function (d) {
                return d.depth;
            });

            if (maxNodeDepth === (depth - 1)) {
                transing = false;
                if (isOverRoom)
                    drawEndNode(maxNodeDepth);
            }
        });

    //                _bodyG.selectAll("path.linked").attr("d", _diagonal);
}

function drawEndNode(maxNodeDepth) {
    let endArray = [];
    let headG = null;
    let endNode = null;
    let maxDepthNode = null;

    // 初始化
    if (endArray.length == 0 && headG == null && maxDepthNode == null) {
        setHeadElement();
        addEndsArray();
        setMaxDepthNode();
    }
    if (endNode == null) {
        endNode = {};
        endNode.y = treeNodes.x;
        endNode.x = maxDepthNode.y + 180;
        endNode.name = 'end-' + ($("#nameHeader h1").text() || mission.roomID);
        endNode.nodeType = 'end';
        addChilds();
        drawLines();

        let node = nodesG.selectAll('g.end')
            .data([endNode], function (d) {
                return d.name;
            });
        node.transition()
            .duration(300)
            .attr('transform', function (d) {
                return 'translate(' + endNode.x + ',' + endNode.y + ')';
            })
            .each('end', function () {
                zoomFitAuto();
            });
        let nodeEnter = node.enter().append("svg:g")
            .attr({
                id: function (d) {
                    return "g-" + d.name;
                },
                class: function (d) {
                    return 'end node';
                },
                transform: function (d) {
                    return 'translate(' + endNode.x + ',' + endNode.y + ')';
                }
            });

        nodeEnter.append("svg:circle")
            .style("fill-opacity", "1")
            .attr({
                r: rMap[endNode.nodeType],
                width: function (d) {
                    return d.name.length * 8 + 30
                }, height: "18px", x: function (d) {
                    return endNode.x
                }, y: function (d) {
                    return endNode.y;
                }
            });

        let gEndNode = nodesG.select('#g-' + endNode.name);


        gEndNode.append("svg:text").attr({
            "text-anchor": "middle",
            width: "0px",
            height: "14px",
            dy: function (d) {
                return (rMap[d.nodeType] || 18) +
                    parseInt(d3.select(this).style("font-size").replace("px", "")) + "px";
            }
        }).text("会战结束");

        node.exit()
            .transition()
            .duration(300)
            .attr('transform', function (d) {
                return 'translate(' + endNode.x + ',' + endNode.y + ')';
            })
            .remove();

        zoomFitAuto();

    }


    function debug(tag, msg) {
        console.debug(tag, msg);
    }

    function setHeadElement() {
        for (let node of forceNodes) {
            if (node.depth == 1) {
                headG = node;
            }
        }
    }

    function setMaxDepthNode() {
        forceNodes.forEach(function (node) {
            if (node.depth == maxNodeDepth) {
                maxDepthNode = node;
            }
        })
    }

    function addEndsArray() {
        forceNodes.forEach(function (node) {
            if (node.children == undefined) {
                endArray.push(node)
            }
        })
    }

    function addChilds() {
        endArray.forEach(function (end) {
            end.children = endNode;
        })
    }

    function drawLines() {
        let target = {
            name: "end",
            x: endNode.y,
            y: endNode.x
        };
        let lines = [];
        endArray.forEach(function (end) {
            lines.push({
                source: end,
                target: target
            });
        });

        let link = linksG.selectAll("polyline.tree-linked")
            .data(lines, function (d) {
                return d.source.name + '-' + d.target.name;
            });
        link.enter().insert("svg:polyline", "g")
            .attr("class", "tree-linked")
            .attr('fill', 'none')
            .attr('stroke', '#fc5457')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')
            .attr('points', function (line) {
                return line.source.y + ',' + line.source.x + ' ' +
                    (line.target.y - 50) + ',' + line.source.x + ' ' +
                    (line.target.y - 50) + ',' + line.target.x + ' ' +
                    (line.target.y - rMap[endNode.nodeType]) + ',' + line.target.x + ' ';
            })

    }
}

function toggleTree(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

function toggleAll(d) {
    if (d.children) {
        d.children.forEach(toggleAll);
        toggle(d);
    }
}

//end tree

//定义brusher
var brusher = d3.svg.brush()
    .x(scaleX)
    .y(scaleY)
    .on("brushstart", function (d) {
        nodes.each(function (d) {
            d.previouslySelectedByMouse = shiftKey && d.selectedByMouse;
        });
    })
    .on("brush", function () {
        var extent = d3.event.target.extent();

        nodes.classed("selected", function (d) {
            return d.selectedByMouse = d.previouslySelectedByMouse ^
                (extent[0][0] <= d.x && d.x < extent[1][0]
                && extent[0][1] <= d.y && d.y < extent[1][1]);
        });
    })
    .on("brushend", function () {
        d3.event.target.clear();
        d3.select(this).call(d3.event.target);
    });

brush.call(brusher).on("mousedown.brush", () => {
    d3.selectAll('g[class*="PieMenu"]').remove();
})
    .on("touchstart.brush", null)
    .on("touchmove.brush", null)
    .on("touchend.brsuh", null);

brush.select('.background').style('cursor', 'auto');

//定义鼠标点击
function keydown() {
    shiftKey = d3.event.shiftKey || d3.event.metaKey;
    ctrlKey = d3.event.ctrlKey;
    if (d3.event.keyCode == 67) {   //the 'c' key
        // center_view();
        zoomFit();
    }
    if (shiftKey) {
        zoomG.call(zoomer)
            .on("mousedown.zoom", function () {
                d3.select(".node").remove;
            })
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

        //svg_graph.on('zoom', null);
        elementsG.selectAll('g.nodes')
            .on('mousedown.drag', null);
        brush.select('.background').style('cursor', 'crosshair');
        brush.call(brusher);
    }
}

function keyup() {
    shiftKey = d3.event.shiftKey || d3.event.metaKey;
    ctrlKey = d3.event.ctrlKey;
    brush.call(brusher)
    // .on("mousedown.brush", null)
        .on("touchstart.brush", null)
        .on("touchmove.brush", null)
        .on("touchend.brush", null);
    brush.select('.background').style('cursor', 'auto');
    zoomG.call(zoomer);
}


function zoomstart() {
    nodes.each(function (d) {
        d.selectedByMouse = false;
        d.previouslySelectedByMouse = false;
    });
    nodes.classed("selected", false);
}

function redraw() {
    if (d3.event.scale < 0.3) {
        d3.selectAll('g.elementsG text').style("fill-opacity", 0);
        d3.selectAll('g.pieMenu').style("fill-opacity", 0);
    } else {
        d3.selectAll('g.elementsG text').style("fill-opacity", 1);
        d3.selectAll('g.pieMenu').style("fill-opacity", 1);
    }
    elementsG.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
}

//拖拽回调
function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d.selectedByMouse && !shiftKey) {
        // if this node isn't selected, then we have to unselect every other node
        nodes.classed("selected", function (p) {
            return p.selectedByMouse = p.previouslySelectedByMouse = false;
        });
    }
    d3.select(this).classed("selected", function (p) {
        d.previouslySelectedByMouse = d.selectedByMouse;
        return d.selectedByMouse = true;
    });
    nodes.filter(function (d) {
        return d.selectedByMouse;
    }).each(function (d) {
        d.fixed |= 2;
    })
}

function dragged(d) {
    nodes.filter(function (d) {
        return d.selectedByMouse;
    }).each(function (d) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        d.px += d3.event.dx;
        d.py += d3.event.dy;
    });
    force.resume();
}

function dragended(d) {
    nodes.filter(function (d) {
        return d.selectedByMouse;
    }).each(function (d) {
        d.fixed &= ~6;
    })
}

function UpdateNodeIndex(id) {
    var index = findNodeIndex(id);
    if (index == null) {
        nodesMap[id] = forceNodes.length - 1;
    } else {
        nodesMap[id] = index;
    }
}


function ShowPageClearAll() {
    // forceNodes = [];
    forceNodes.splice(0, forceNodes.length);
    // forceLinks = [];
    forceLinks.splice(0, forceLinks.length);
    eventToNode = {};
    nodesMap = {};
    treeNodes = null;
    d3.selectAll('g.node').remove();
    d3.selectAll('line.link').remove();
    d3.selectAll('g.linksG > g').remove();
    d3.selectAll('g.linksG > path').remove();
    d3.selectAll('g.linksG > polyline').remove();

}

function addNodeAndEdge(events) {
    for (var event of events) {
        if (eventToNode[event.eventID])continue;
        // console.log(event.eventID);
        var nodeID, meetingID,
            sourceID, targetID, linkID,
            info = JSON.parse(event.info);
        // console.log(meetingInfo)
        switch (event.eventType) {
            /*case "0":
             meetingID = "meeting" + "-" + info.id;
             event.timer = [event.eventTime];
             eventToNode[event.eventID] = [meetingID];
             if (info.pid === "") {
             forceNodesT.push(event);
             forceNodes.push({label: info.name, name: meetingID, nodeType: 'room', info: event});
             UpdateNodeIndex(meetingID);
             } else {
             forceNodesT.push(event);
             forceNodes.push({label: info.name, name: meetingID, nodeType: 'subroom', info: event});
             UpdateNodeIndex(meetingID);
             eventToNode[event.eventID].push("meeting" + "-" + info.pid);
             forceLinks.push(createLink(findNodeIndex(meetingID), findNodeIndex("meeting" + "-" + info.pid), ""));
             }

             break;*/
            case "0":
                meetingID = "meeting" + "-" + info.id;
                treeNodes = {
                    x0: height / 2,
                    y0: 50,
                    label: info.name,
                    name: meetingID,
                    nodeType: 'room',
                    info: event,
                    children: []
                };
                event.timer = [event.eventTime];
                isOverRoom = false;
                $('#message_list').find('.messages').children().remove();
                break;
            case "1":
                nodeID = info.id;
                // console.log(info);
                meetingID = "meeting-" + info.mid;

                eventToNode[event.eventID] = [nodeID, meetingID];
                /*if (nodesMap.hasOwnProperty(meetingID)) {
                 findNode(meetingID).info.timer.push(event.eventTime)
                 } else {
                 event.timer = [event.eventTime];
                 forceNodesT.push(event);
                 eventToNode[event.eventID] = [meetingID];
                 //todo 判断是否子房间
                 forceNodes.push({name: meetingID, nodeType: 'room', info: event});
                 UpdateNodeIndex(meetingID);

                 }*/
                if (nodesMap.hasOwnProperty(nodeID)) {
                    findNode(nodeID).info.timer.push(event.eventTime);
                } else {
                    event.timer = [event.eventTime];
                    forceNodesT.push(event);
                    let node = {label: info.name, name: nodeID, nodeType: 'object', info: event, children: []};
                    forceNodes.push(node);
                    if (treeNodes && treeNodes.name == meetingID) {
                        if (!treeNodes.children) treeNodes.children = [];

                        treeNodes.children.push(node)
                    }
                    UpdateNodeIndex(nodeID);
                }

                /*forceLinks.push(createLink(findNodeIndex(meetingID), findNodeIndex(nodeID), ""));*/
                break;
            case "2":
                addSourceSys(event, info);
                addApi(event, info);
                addTargetSys(event, info);
                break;
            case "3":
                //console.log(info);
                eventToNode[event.eventID] = [];
                for (let nodeID in info.nodes) {
                    if (!info.nodes.hasOwnProperty(nodeID)) continue;
                    let keyID = nodeID;
                    if (info.nodes[nodeID].nodeType === 'app') {
                        keyID = event.eventID + '-' + nodeID;
                    }
                    if (nodesMap.hasOwnProperty(keyID)) {
                        findNode(keyID).info.timer.push(event.eventTime);
                    } else {
                        event.timer = [event.eventTime];
                        // if (info.nodes[nodeID].nodeType == "result") {
                        //     let label = getLabel(info.nodes[nodeID].info);
                        //     if (label)
                        //         info.nodes[nodeID].label = label.label + ":" + label.value;
                        // }
                        forceNodes.push({
                            label: info.nodes[nodeID].label,
                            name: keyID,
                            nodeType: info.nodes[nodeID].nodeType,
                            info: event,
                            children: []
                        });
                        UpdateNodeIndex(keyID);
                        eventToNode[event.eventID].push(keyID);
                    }
                }
                // console.log(event)
                for (let l = 0; l < info.links.length; ++l) {
                    // console.log(l, info.links[l], info.nodes);
                    if (info.links[l].from.indexOf('app') === 0) {
                        info.links[l].from = event.eventID + '-' + info.links[l].from;
                    }

                    if (info.links[l].to.indexOf('app') === 0) {
                        info.links[l].to = event.eventID + '-' + info.links[l].to;
                    }


                    let link = createLink(findNodeIndex(info.links[l].from), findNodeIndex(info.links[l].to, info.links[l].label));

                    if (link === null) {
                        // console.log(info.links[l].from, info.links[l].to);
                        continue;
                    }

                    linkInfo[info.links[l].from + '-' + info.links[l].to] = info.links[l];
                    let fromNode = findNode(info.links[l].from);
                    let toNode = findNode(info.links[l].to);
                    if (!fromNode.children) fromNode.children = [];

                    fromNode.children.push(toNode);

                    forceLinks.push(link);
                }

                break;
            case "4":
                if (!info.did) info.did = 16;
                sourceID = info.objid;
                nodeID = event.eventID + "-app-" + info.did;
                eventToNode[event.eventID] = [nodeID, sourceID];
                if (nodesMap.hasOwnProperty(nodeID)) {
                    findNode(nodeID).info.timer.push(event.eventTime);
                    // if (!isApiIn(info.dapi, findLink("object" + "-" + info.objid).text)) {
                    //     findLink("object" + "-" + info.objid).text.push(info.dapi);
                    // }
                } else {
                    event.timer = [event.eventTime];
                    forceNodesT.push(event);
                    forceNodes.push({label: info.dname, name: nodeID, nodeType: 'app', info: event, children: []});
                    UpdateNodeIndex(nodeID);
                }
                // console.log(forceLinks, info.did);
                let link = createLink(findNodeIndex(sourceID), findNodeIndex(nodeID), info.dapi);
                if (link) {
                    let fromNode = findNode(sourceID);
                    let toNode = findNode(nodeID);
                    if (!fromNode.children) fromNode.children = [];

                    fromNode.children.push(toNode);

                    forceLinks.push(link);
                }
                break;
            case "5":
                nodeID = info.callbackdataid;
                console.log(info);

                // if (!info.did) info.did = 16;
                targetID = info.objid;
                // console.log(targetID);
                if (nodesMap[targetID]) {
                    // console.log(findNode(targetID), info, nodesMap[targetID], forceNodes);
                    findNode(targetID).info.timer.push(event.eventTime);
                } else {
                    forceNodesT.push(event);
                    forceNodes.push({label: info.dname, name: targetID, nodeType: 'result', info: event, children: []});
                    UpdateNodeIndex(targetID);
                }

                if (nodesMap.hasOwnProperty(nodeID)) {
                    // console.log(findNode(nodeID), nodeID, nodesMap);
                    findNode(nodeID).info.timer.push(event.eventTime);
                } else {
                    forceNodesT.push({
                        nodeID: nodeID, type: "commonObject", timer: [event.eventTime], info: {
                            mid: info.mid, mname: info.mname, did: info.did
                        }
                    });
                    forceNodes.push({
                        label: '回传数据',
                        name: nodeID, nodeType: 'backobject', info: event,
                        // {

                        // nodeID: nodeID, type: "commonObject", timer: [event.eventTime], info: {
                        //     mid: info.mid,
                        //     mname: info.mname,
                        //     did: info.did,
                        //     objid: info.objid,
                        //     lastEventID: info.lastEventID,
                        //     uid: info.uid,
                        //     uname: info.uname,
                        //     data: info.callbackdata,
                        //     dname: info.dname,
                        //     did: info.did
                        // }
                        // },
                        children: []
                    });
                    eventToNode[event.eventID] = [nodeID, targetID, "meeting-" + info.mid];
                    UpdateNodeIndex(nodeID);
                    // console.log(findNodeIndex(targetID), findNodeIndex(nodeID))
                    let link = createLink(findNodeIndex(targetID), findNodeIndex(nodeID), "");
                    if (link) {
                        let fromNode = findNode(targetID);
                        let toNode = findNode(nodeID);
                        if (!fromNode.children) fromNode.children = [];

                        fromNode.children.push(toNode);

                        forceLinks.push(link);
                    }
                    // forceLinks.push(createLink(findNodeIndex(nodeID), findNodeIndex("meeting-" + info.mid), ""));
                }
                break;
            case '7':
                isOverRoom = true;
                break;
            case "8":
                // 自定义数据
                eventToNode[event.eventID] = [];

                for (let nodeID in info.nodes) {
                    if (!info.nodes.hasOwnProperty(nodeID)) continue;
                    let keyID = nodeID;
                    if (info.nodes[nodeID].nodeType === 'customapp') {
                        keyID = event.eventID + '-' + nodeID;
                    }
                    if (nodesMap.hasOwnProperty(keyID)) {
                        findNode(keyID).info.timer.push(event.eventTime);
                    } else {
                        event.timer = [event.eventTime];
                        // if (info.nodes[nodeID].nodeType == "custom") {
                        //     let label = getLabel(info.nodes[nodeID].info);
                        //     if (label)
                        //         info.nodes[nodeID].label = label.label + ":" + label.value;
                        // }
                        forceNodes.push({
                            label: info.nodes[nodeID].label,
                            name: keyID,
                            nodeType: info.nodes[nodeID].nodeType,
                            info: event,
                            children: []
                        });
                        UpdateNodeIndex(keyID);
                        eventToNode[event.eventID].push(keyID);
                    }
                    for (let l = 0; l < info.links.length; ++l) {
                        if (info.links[l].from.indexOf('app-custom') === 0) {
                            info.links[l].from = event.eventID + '-' + info.links[l].from;
                        }

                        if (info.links[l].to.indexOf('app-custom') === 0) {
                            info.links[l].to = event.eventID + '-' + info.links[l].to;
                        }


                        let link = createLink(findNodeIndex(info.links[l].from), findNodeIndex(info.links[l].to, info.links[l].label));

                        if (link === null) {
                            // console.log(info.links[l].from, info.links[l].to);
                            continue;
                        }

                        linkInfo[info.links[l].from + '-' + info.links[l].to] = info.links[l];
                        let fromNode = findNode(info.links[l].from);
                        let toNode = findNode(info.links[l].to);
                        if (!fromNode.children) fromNode.children = [];

                        fromNode.children.push(toNode);

                        forceLinks.push(link);
                    }
                }

                break;
        }

        if (treeNodes)
            $('#message_list').find('.messages').prepend('<p class="message-item"><span class="message-time">' + new Date(parseInt(event.eventTime)).toLocaleString() + '</span>' +
                '<span class="message-info message-text' + event.eventType + '"> ' + descEvent(event) + '</span></p>');
    }

}

function findNodeIndex(id) {
    for (var i in nodesMap) {
        if (id === i) {
            return nodesMap[i];
        }
    }
    return null;
}

function findNode(nodeID) {
    for (var i in forceNodes) {
        if (forceNodes[i].name === nodeID) {
            return forceNodes[i];
        }
    }
    return null
}

function findLink(targetNodeIndex) {
    for (var i in forceLinks) {
        if (forceLinks[i].target === targetNodeIndex) {
            return forceLinks[i];
        }
    }
}

function createLink(sourceIndex, targetIndex, text) {
    if (sourceIndex === null || targetIndex === null)return null;
    return {source: sourceIndex, target: targetIndex, text: [text]};
}

function addSourceSys(event, info) {
    var nodeID = "app" + "-" + info.sid;
    if (nodesMap[nodeID]) {
        forceNodesT[findNodeIndex(nodeID)].timer.push(event.eventTime);
        forceNode2[findNodeIndex(nodeID)].info.timer.push(event.eventTime);
    } else {
        forceNodesT.push({
            eventType: "sourceApp",
            nodeID: nodeID,
            timer: [event.eventTime],
            info: {sid: info.sid, sname: info.sname}
        });
        forceNodes.push({
            label: info.sname,
            name: nodeID,
            nodeType: 'app',
            info: {
                eventType: "sourceApp",
                nodeID: nodeID,
                timer: [event.eventTime],
                info: {sid: info.sid, sname: info.sname}
            }
        })
        nodesMap[nodeID] = findNodeIndex(nodeID);
    }
}

function addApi(event, info) {
    var nodeID = "api" + "-" + info.sid + "-" + info.did,
        targetNode = null,
        api;
    if (nodesMap[nodeID]) {
        forceNodesT[findNodeIndex(nodeID)].timer.push(event.eventTime);
        if (!isApiIn(info.api, findLink(findNodeIndex(nodeID).text))) {
            findLink(findNodeIndex(nodeID)).text.push(info.api);
        }
    } else {
        forceNodesT.push({
            eventType: "api",
            nodeID: nodeID,
            timer: [event.eventTime],
            info: {sid: info.sid, sname: info.sname, did: info.did, dname: info.dname, dapi: info.dapi}
        });
        createLink(findNodeIndex("app" + "-" + info.sid), findNodeIndex(nodeID), info.dapi);
    }
}

function addTargetSys(event, info) {
    var nodeID = "app" + "-" + info.did;
    if (nodesMap[nodeID]) {
        forceNodesT[findNodeIndex(nodeID)].timer.push(event.eventTime);
        forceNode2[findNodeIndex(nodeID)].info.timer.push(event.eventTime);
    } else {
        forceNodesT.push({
            eventType: "targetApp",
            nodeID: nodeID,
            timer: [event.eventTime],
            info: {did: info.did, dname: info.sname}
        });
        eventToNode[event.eventID] = [nodeID];
        forceNodes.push({
            label: info.dname,
            name: nodeID,
            nodeType: 'app',
            info: {
                eventType: "targetApp",
                nodeID: nodeID,
                timer: [event.eventTime],
                info: {did: info.did, dname: info.sname}
            }
        })
        createLink(findNodeIndex("api" + "-" + info.sid + info.did), findNodeIndex(nodeID), info.dapi);
    }
}

function isApiIn(api, apiArr) {
    for (var i in apiArr) {
        if (apiArr[i] === api) {
            return true;
        }
    }
    return false;
}
//
// $.ajax({
//     type: "POST",
//     url: 'http://10.0.0.74:3050/synergy/show/new?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InQxIiwib3JpZ19pYXQiOjE0ODE2MTU0MjMsInVzZXJfaWQiOjIsImVtYWlsIjoiIiwiZXhwIjoxNDgxNzAxODIzfQ.bwe2RNv5PbXd42qeGw2pLONYpty_-Zm5xQ-csP-xAug',
//     dataType: "json",
//     contentType:'application/json',
//     data:JSON.stringify({lastID:0}),
//     async: false,
//     success: function(array) {
//         addNodeAndEdge(array);
//     }
// });

//定义箭头
svg.append("defs").selectAll("marker")
    .data(["regular"]) //这里可以绑定数据，不同的线段使用不同样式箭头
    .enter().append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 9.8)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 14)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");

//定义箭头
svg.append("defs").selectAll("marker")
    .data(["regular"]) //这里可以绑定数据，不同的线段使用不同样式箭头
    .enter().append("marker")
    .attr("id", "unselected_arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 9.8)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 14)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");


//绘制节点之间的连线，并且连线不超过节点边缘
function drawCurve(d) {
    var sourceX = d.source.x;
    var sourceY = d.source.y;
    var targetX = d.target.x;
    var targetY = d.target.y;

    var theta = Math.atan((targetX - sourceX) / (targetY - sourceY));
    var phi = Math.atan((targetY - sourceY) / (targetX - sourceX));

    var sinTheta = scale(d.source['influence']) * Math.sin(theta);
    var cosTheta = scale(d.source['influence']) * Math.cos(theta);
    var sinPhi = scale(d.target['influence']) * Math.sin(phi);
    var cosPhi = scale(d.target['influence']) * Math.cos(phi);

    // 设置线条在源节点的端点位置
    // 这样它在靠近目标节点的边缘
    if (d.target.y > d.source.y) {
        sourceX = sourceX + sinTheta;
        sourceY = sourceY + cosTheta;
    }
    else {
        sourceX = sourceX - sinTheta;
        sourceY = sourceY - cosTheta;
    }

    // 设置线条在目标节点的端点位置
    // 这样它靠近源节点的边缘
    if (d.source.x > d.target.x) {
        targetX = targetX + cosPhi;
        targetY = targetY + sinPhi;
    }
    else {
        targetX = targetX - cosPhi;
        targetY = targetY - sinPhi;
    }

    // 绘制一条弧线连接两个节点
    var dx = targetX - sourceX,
        dy = targetY - sourceY,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + sourceX + "," + sourceY + "L" + targetX + "," + targetY;
}


function renderTreeW(forceNodes, forceLinks) {
    linksG.selectAll("line").data([]).exit().remove();
    if (force) force.stop();
    if (treeNodes)
        renderTree(treeNodes);
}

function renderForceW(forceNodes, forceLinks) {
    linksG.selectAll(".tree-linked").data([]).exit().remove();
    linksG.selectAll(".tree-link").data([]).exit().remove();
    // forceNodesT.forEach(function (node) {
    //     let x = node.y;
    //     let y = node.x;
    //     node.x = y;
    //     node.y = x;
    // })
    renderForce(forceNodes, forceLinks);
}

// var init = renderForceW;
var init = renderTreeW;


function renderForce(forceNodes, forceLinks) {
    force.stop();
    nodes = nodesG.selectAll("g.node").data(forceNodes, function (d) {
        return d.name || Date.now();
    });

    nodes.attr("transform", function (d) {
        d.px = d.y;
        d.py = d.x;
        d.x = d.px;
        d.y = d.py;
        return "translate(" + d.x + "," + d.y + ")";
    });

    nodes.on("dblclick", function (d) {
        d3.event.stopPropagation();
    }).on("click", function (d) {
        if (d.nodeType == "room" || d.nodeType == "subroom") {
            // // console.log(d);

            $.ajax({
                type: "POST",
                url: '/members',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'JWT ' + getURLParams("token")
                },
                dataType: 'json',
                data: JSON.stringify({
                    roomID: JSON.parse(d.info.info).id
                }),
                beforeSend: function () {
                },
                complete: function () {
                },
                success: function (data) {
                    //加一个获取roominfo
                    createMemberTable(roominfo, data);
                }
            });
        } else if (d.nodeType == 'result') {
            let rightClick = isRightClick(event);
            if (rightClick) {
                addNodeInfo(d);
            }
        }

        if (d3.event.defaultPrevented) return;
        if (!shiftKey) {
            //如果未按下shift键，取消所有选择
            nodes.classed("selected", function (p) {
                return p.selectedByMouse = p.previouslySelectedByMouse = false;
            })
        }
        // 选取这个节点
        d3.select(this).classed("selected", d.selectedByMouse = !d.previouslySelectedByMouse);
        /*判断节点内部是否有环形菜单，若没有则展开环形菜单，否则do nothing*/
//        console.log(d3.select(this).select('g.firstPieMenu'));
        if (d3.select(this).select('g.firstPieMenu').size() > 0) { //重复左键取消菜单
            d3.selectAll('g[class*="PieMenu"]').remove();
            return;
        } else {
            d3.selectAll('g[class*="PieMenu"]').remove();
        }
        var $node = $(this),
            d3Node = d3.select(this),
            data = [{
                id: 'particular', label: '详情', clickHandle: function () {
                    d3.event.stopPropagation();
                    d3.selectAll('g[class*="PieMenu"]').remove();
                    console.log('详情')
                }
            }, {
                id: 'link', label: '报告', clickHandle: function () {
                    d3.event.stopPropagation();
                    d3.selectAll('g[class*="PieMenu"]').remove();
                    console.log('报告')
                }
            }, {
                id: 'shrink', label: '隐藏', clickHandle: function (targetMenu) {
                    var nodeId = targetMenu[0][0].parentNode.parentNode.getAttribute('id');
                    d3.selectAll('g[class*="PieMenu"]').remove();
                    shrinkIntoNode(nodeId);
                    d3.event.stopPropagation();
                    console.log('收缩', targetMenu[0][0].parentNode.parentNode);
                }
            }, {
                id: 'extend', label: '展开', clickHandle: (targetMenu) => {
                    unfoldChild(targetMenu, d);
                }

            }],
            radius = {innerRadius: rMap[d.nodeType] + 5, outerRadius: rMap[d.nodeType] + 35},
            position = [0, 0];
        renderPieMenu(d3Node, position, radius, null, data, 'firstPieMenu');
        /*        if ($node.is('.result, .backobject, .custom, .object')) {
         renderPieMenu(d3Node, position, radius, null, data)
         }*/
    }).on("mouseup", function (d) {
        return;
    }).call(d3.behavior.drag()
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended));

    // console.log(nodes);
    let dataTips = [];
    var nodesEnter = nodes.enter().append("svg:g")
        .attr({
            id: function (d) {
                return "g-" + d.name;
            },
            class: function (d) {
                return 'node ' + d.nodeType;
            },
            // x: width / 2,
            // y: height / 2
        })
        .on("dblclick", function (d) {
            d3.event.stopPropagation();
        }).on("click", function (d) {
            if (d.nodeType == "room" || d.nodeType == "subroom") {
                // console.log(d);

                $.ajax({
                    type: "POST",
                    url: '/members',
                    contentType: 'application/json',
                    headers: {
                        'Authorization': 'JWT ' + getURLParams("token")
                    },
                    dataType: 'json',
                    data: JSON.stringify({
                        roomID: JSON.parse(d.info.info).id
                    }),
                    beforeSend: function () {
                    },
                    complete: function () {
                    },
                    success: function (data) {
                        //加一个获取roominfo
                        createMemberTable(roominfo, data);
                    }
                });
            } else if (d.nodeType == 'result') {
                let rightClick = isRightClick(event);
                if (rightClick) {
                    addNodeInfo(d);
                }
            }

            if (d3.event.defaultPrevented) return;
            if (!shiftKey) {
                //如果未按下shift键，取消所有选择
                nodes.classed("selected", function (p) {
                    return p.selectedByMouse = p.previouslySelectedByMouse = false;
                })
            }
            // 选取这个节点
            d3.select(this).classed("selected", d.selectedByMouse = !d.previouslySelectedByMouse);
        }).on("mouseup", function (d) {
            return;
        }).call(d3.behavior.drag()
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended));
// nodesEnter.attr({style: 'opacity:0'})
//     .transition().duration(2000)
//     .attr({
//         style: 'opacity : 1'
//     });

    nodes.selectAll("circle").filter(function (d) {
        return d3.select(this).attr("r") == 1e-6;
    }).transition().duration(600)
        .attr({
            r: function (d) {
                return rMap[d.nodeType] || 18
            }
        })
        .each("end", function (d) {
            let select = nodesG.select("#g-" + d.name);
            select.append("image")
                .attr({
                    "class": "icon",
                    "aria-hidden": true,
                    width: function (d) {
                        return rMap[d.nodeType] * 4 / 3;
                    },
                    height: function (d) {
                        return rMap[d.nodeType] * 4 / 3;

                    },
                    x: function (d) {
                        return 0 - rMap[d.nodeType] * 2 / 3;
                    },
                    y: function (d) {
                        return 0 - rMap[d.nodeType] * 2 / 3;
                    },
                })
                // .append("use")
                .attr("xlink:href", function (d) {
                    return "/svg/" + d.nodeType + ".svg";
                })
            // select.append("svg")
            //     .attr({
            //         "class": "icon",
            //         "aria-hidden": true,
            //         width: function (d) {
            //             return rMap[d.nodeType] * 4 / 3;
            //         },
            //         height: function (d) {
            //             return rMap[d.nodeType] * 4 / 3;
            //         },
            //         x: function (d) {
            //             return 0 - rMap[d.nodeType] * 2 / 3;
            //         },
            //         y: function (d) {
            //             return 0 - rMap[d.nodeType] * 2 / 3;
            //
            //         }
            //     })
            //     .append("use")
            //     .attr("xlink:href", function (d) {
            //         switch (d.nodeType) {
            //             case "object":
            //                 return "#icon-bar-chart";
            //                 break;
            //             case "app":
            //                 return "#icon-research";
            //                 break;
            //             case "result":
            //                 return "#icon-analytics-1";
            //                 break;
            //         }
            //     });
            select.append("svg:text").attr({
                "text-anchor": "middle",
                width: "8px",
                height: "14px",
                dy: function (d) {
                    return (rMap[d.nodeType] || 18) + 14 + 'px';
                }
            }).text(function (d) {
                // console.log(d.label);
                return d.label;
            });
        });


    nodesEnter.append("circle")
        .attr({
            r: 1e-6,
            width: function (d) {
                // console.log(d);
                return d.name.length * 8 + 30
            }, height: "18px", x: function (d) {
                return -(d.name.length * 8 + 30) / 2
            }, y: function (d) {
                return "0px";
            }
        })
        .transition().duration(600)
        .attr({
            r: function (d) {
                return rMap[d.nodeType] || 18
            }
        })
        .each("end", function (d) {
            let select = nodesG.select("#g-" + d.name);
            select.append("image")
                .attr({
                    "class": "icon",
                    "aria-hidden": true,
                    width: function (d) {
                        return rMap[d.nodeType] * 4 / 3;
                    },
                    height: function (d) {
                        return rMap[d.nodeType] * 4 / 3;

                    },
                    x: function (d) {
                        return 0 - rMap[d.nodeType] * 2 / 3;
                    },
                    y: function (d) {
                        return 0 - rMap[d.nodeType] * 2 / 3;
                    },
                })
                // .append("use")
                .attr("xlink:href", function (d) {
                    return "/svg/" + d.nodeType + ".svg";
                });

            select.append("svg:text").attr({
                "text-anchor": "middle",
                width: "8px",
                height: "14px",
                dy: function (d) {
                    return (rMap[d.nodeType] || 18) + 14 + 'px';
                }
            }).text(function (d) {
                // console.log(d.label);
                return d.label;
            });
        });

    nodes.exit().remove();


    links = linksG.selectAll("line").data(forceLinks).attr("class", "link")
    var linksEnter = links.enter().append("line").attr("class", "link")
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        })
        .attr('marker-end', function (d, index) {
            svg.append("defs").selectAll("marker")
                .data(["regular"]) //这里可以绑定数据，不同的线段使用不同样式箭头
                .enter().append("marker")
                .attr("id", "arrow" + index)
                .attr("class", "arrow")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 9.8)
                .attr("refY", 0)
                .attr("markerWidth", 8)
                .attr("markerHeight", 14)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5");
            return "url(#arrow" + index + ")"
        })//.attr("marker-end", "url(#arrow)");


    links.exit().remove();
    //console.log("N", forceNodes);
    //console.log("L", forceLinks);

    force.on("start", function () {
        zoomFitAuto();
    });
    force.on("end", function () {
        zoomFitAuto();
    });

    // force.on("start", function () {
    //     while (force.alpha() > 0.001) {
    //         force.tick()
    //     }
    // });

//运动刷新
    force.on("tick", function (d) {
        // // console.log(d)
        nodesG.selectAll("g.node").data(forceNodes, function (d) {
            return d.name || Date.now();
        })//.transition().duration(300)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        d3.selectAll("line.link")//.transition().duration(300)
            .attr("x1", function (d) {
                var distance = Math.sqrt((d.target.y - d.source.y) * (d.target.y - d.source.y) + (d.target.x - d.source.x) * (d.target.x - d.source.x));
                var x_distance = (d.target.x - d.source.x) / distance * rMap[d.source.nodeType];
                return d.source.x + x_distance;
            }).attr("y1", function (d) {
            var distance = Math.sqrt((d.target.y - d.source.y) * (d.target.y - d.source.y) + (d.target.x - d.source.x) * (d.target.x - d.source.x));
            var y_distance = (d.target.y - d.source.y) / distance * rMap[d.source.nodeType];
            return d.source.y + y_distance;
        }).attr("x2", function (d) {
            var distance = Math.sqrt((d.target.y - d.source.y) * (d.target.y - d.source.y) + (d.target.x - d.source.x) * (d.target.x - d.source.x));
            var x_distance = (d.target.x - d.source.x) / distance * rMap[d.target.nodeType];
            return d.target.x - x_distance;
        }).attr("y2", function (d) {
            var distance = Math.sqrt((d.target.y - d.source.y) * (d.target.y - d.source.y) + (d.target.x - d.source.x) * (d.target.x - d.source.x));
            var y_distance = (d.target.y - d.source.y) / distance * rMap[d.target.nodeType];
            return d.target.y - y_distance;
        });

        // let k = d.alpha * 100;
        // if (k == parseInt(k)) {
        //     // console.log(d.alpha);
        //     zoomFit();
        // }
        // var k = d.alpha * .2;
        //
        // let objNodes = force.nodes().filter(function (d) {
        //     return d.nodeType == "object"
        // });
        // let endX = ((width - 100 ) / (objNodes.length + 1));
        // objNodes.forEach(function (node, index) {
        //     node.endX = endX * (index + 1);
        //     node.x += (node.endX - node.x) * k * 5;
        //     node.y += (100 - node.y) * k * 5;
        //     d3.select("#g-" + node.name).attr("transform", function (d) {
        //         return "translate(" + d.x + "," + d.y + ")";
        //     });
        // });
        //
        // force.links().forEach(function (d) {
        //     let yLen = 0;
        //     d.target.x += (d.source.x - d.target.x) * k;
        //     if (d.source.nodeType == 'object') {
        //         yLen = 100;
        //     }
        //     d.target.y += (d.source.y + 50 + yLen - d.target.y) * k;
        //     d.target.endX = d.source.endX;
        //     d3.select("#g-" + d.target.name).attr("transform", function (d) {
        //         return "translate(" + d.x + "," + d.y + ")";
        //     });
        // });

        // d3.selectAll("g.tip").attr("transform", function (d) {
        //     return "translate(" + d.x + "," + d.y + ")";
        // });
        // if (d.alpha <= 0.1)
        //     scaleSVG()

        // if (i == 0) {
        //     i = 9;
        // }
        // if (parseInt(d.alpha * 100) == i) {
        //     zoomFitAuto();
        //     --i;
        // }

    });
    force.start();
    // let i = 300;
    // while (--i) {
    //     force.tick()
    // }
    // while (force.alpha() > 0.005) {
    //     force.tick()
    // }
}
// init(forceNodes, forceLinks);


function filterNodesByTime(timer) {
    // force.stop();
    var treeLinks = d3.selectAll('g.tree-linked');
    var start = timer.start,
        end = timer.end,
        // nodes = d3.selectAll("g.node").filter(function (node) {
        //     return !node.highlight
        // }),
        nodes = nodesG.selectAll("g.node").each(function (node) {
            node.selected = false;
        }),
        links = d3.selectAll("line.link");
    /*.filter(function (link) {
     // console.log(link.selectedById);
     return !link.selectedById;
     })*/

    /*nodes.select('circle').attr({
     r: function (d) {
     return (d.info.timer.some(function (time) {
     return (time > start && time < end);
     })) ? rSelectMap[d.nodeType] : rMap[d.nodeType]
     }
     });*/
    nodes.attr({
        class: function (d) {
            var nodeTimer = d.info.timer ? d.info.timer : [d.info.eventTime];
            return 'node ' + ((nodeTimer.some(function (time) {
                    return (time > start && time < end);
                })) ? d.nodeType : d.nodeType + ' unselected')
        }
    });

    nodes.each(function (d) {
        var nodeTimer = d.info.timer ? d.info.timer : [d.info.eventTime];
        if (nodeTimer.some(function (time) {
                return (time > start && time < end);
            })) {
            d.selected = true;
        }
        /* else {
         d.selected = false;
         }*/
    });

    /*    nodes.exit().remove();*/
    /*links.classed("selected", function (d) {
     return d.source.info.timer.some(function (time) {
     return (time > start && time < end)
     }) && d.target.info.timer.some(function (time) {
     return time > start && time < end
     })
     });*/

    /*    links.attr("class", function (d) {
     if(d.source.info.timer.some(function (time) {
     return (time > start && time < end)
     }) && d.target.info.timer.some(function (time) {
     return time > start && time < end
     })){
     return "link selected"
     }else{
     return "link unselected";
     }
     });*/

    /*    links.attr("class", function (d) {
     if ((d.source.selectedByTime || d.source.selectedById) && (d.target.selectedByTime || d.target.selectedById)) {
     return "link selected"
     }
     return "link unselected"
     });*/

    links.classed("unselected", function (d) {
        if (d.source.selected && d.target.selected) {
            return false;
        }
        return true;
    });


    links.attr("marker-end", function (d, index) {
        if (d.source.selected && d.target.selected) {
            return "url(#arrow" + index + ")";
        } else {
            return "url(#unselected_arrow)";
        }
    });
    treeLinks.classed('unselected', function (d) {
        "use strict";
        if (d.source.selected && d.target.selected) {
            return false;
        }
        return true;
    });
    // nodes.classed("highlight", function (d) {
    //     return d.info.timer.some(function (time) {
    //         return time > start && time < end
    //     })
    // });
    // links.classed("highlight", function (d) {
    //     return d.source.info.timer.some(function (time) {
    //             return time > start && time < end
    //         }) && d.target.info.timer.some(function (time) {
    //             return time > start && time < end
    //         })
    // })
    // force.start();
}

function filterNodesById(idArr) {
    // force.stop();
    var nodeIdArr = [],
        nodes = d3.selectAll("g.node").each(function (node) {
            return node.selected = false;
        }),
        links = d3.selectAll("line.link"),
        treeLinks = d3.selectAll('g.tree-linked');
    for (var i in idArr) {
        nodeIdArr = nodeIdArr.concat(eventToNode[idArr[i]]);
    }

    //// console.log(idArr, nodeIdArr, nodes, links);
    /*   nodes.select('circle').attr({
     r: function (d) {
     return (nodeIdArr.some(function (id) {
     // console.log(nodeIdArr, d.name);
     return id == d.name;
     })) ? rSelectMap[d.nodeType] : rMap[d.nodeType]
     }
     });*/
    nodes.attr('class', function (d) {
        return (nodeIdArr.some(function (id) {
            return id == d.name;
        }) ? 'node ' + d.nodeType : 'node ' + d.nodeType + ' unselected')
    });
    nodes.each(function (d) {
        if (nodeIdArr.some(function (id) {
                return id == d.name;
            })) {
            d.selected = true;
        }
        /* else {
         d.selected = false;
         }*/
    })

    links.attr("class", function (d) {
        if (d.source.selected && d.target.selected) {
            return "link selected"
        } else {
            return "link unselected";
        }
    });

    links.attr("marker-end", function (d, index) {
        if (d.source.selected && d.target.selected) {
            return "url(#arrow" + index + ")"
        } else {
            return "url(#unselected_arrow)";
        }
    });

    treeLinks.classed('unselected', function (d) {
        "use strict";
        if (d.source.selected && d.target.selected) {
            return false;
        }
        return true;
    });

    // force.start()
}

function changeHighlightAll() {
    //// console.log("调用changeall");
    // force.stop();
    // d3.selectAll("g.node").classed("highlight", false);
    // d3.selectAll("line.link").classed("highlight", false);
    var nodes = nodesG.selectAll("g.node");
    var treeLinks = d3.selectAll('g.tree-linked');
    nodes.each(function (d) {
        d.selected = false;
    });
    // nodes.select('circle').attr({
    //     r: function (d) {
    //         return rMap[d.nodeType];
    //     }
    //
    // });
    nodes.attr({
        class: function (d) {
            return 'node ' + d.nodeType;
        }
    });
    links.attr({
            class: 'link',
            "marker-end": function (d, index) {
                return "url(#arrow" + index + ")"
            }
        }
    );
    treeLinks.classed('unselected', false);
    // force.start();
}

function findDataFromJson(json) {
    if (typeof( json) !== 'object') return null;
    let data = null;
    for (let key in json) {
        if (!json[key]) {
            continue;
        }

        if (typeof( json[key]) == 'object') {
            let res = findDataFromJson(json[key]);
            if (res) {
                return res;
            }
            else {
                continue;
            }

        } else {
            // console.log(key)
            if (!configFields.hasOwnProperty(key)) continue;
            data = {};
            data.value = json[key];
            data.key = key;
            data.label = configFields[key];
            break;
        }

    }
    return data;
}

function getLabel(data) {
    return findDataFromJson(data);
}

function switchForceState(state) {
    let lockLi = document.querySelector('#set_btn_group > li:nth-child(1)');
    if (state === 1) {
        d3.selectAll('g.node').each(function (d) {
            d.fixed = false;
        });
        d3.select('g.zoom').call(zoomer);
        //force.resume();
        /*d3.selectAll('g.node').call(d3.behavior.drag()
         .on("dragstart", dragstarted)
         .on("drag", dragged)
         .on("dragend", dragended));*/

        lockLi.setAttribute('class', 'fa fa-unlock');
        lockLi.setAttribute('onclick', 'switchForceState(0)');
    } else if (state === 0) {
        d3.selectAll('g.node').each(function (d) {
            d.fixed = true;
        });
        d3.select('g.zoom').on('mousedown.drag', null);
        lockLi.setAttribute('class', 'fa fa-lock');
        lockLi.setAttribute('onclick', 'switchForceState(1)');
    }
}

function isRightClick(event) {
    let rightclick;
    if (!event) var event = window.event;
    if (event.which) rightclick = (event.which == 3);
    else if (event.button) rightclick = (event.button == 2);
    return rightclick;
}

//按F键触发缩放
function zoomOnSelectedZone(xMin, xMax, yMin, yMax) {
    let fullWidth = $("#eventgraph").width();
    let fullHeight = $("#eventgraph").height();
    let width = xMax - xMin,
        height = yMax - yMin;
    let midX = minX + width / 2,
        midY = minY + height / 2;
    if (width == 0 || height == 0) return;
    let scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
    if (scale > 2) {
        scale = 2
    }
    let translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    // console.trace("zoomFit", translate, scale);
    elementsG
        .transition()
        .duration(500) // milliseconds
        .call(zoomer.translate(translate).scale(scale).event);
}

/*根据传入的坐标，将画布移动动到所选区域中心
 * params:最小横坐标、最大横坐标、最小纵坐标、最大纵坐标
 * return: true*/
function transformOnSelectedZone(xMin, xMax, yMin, yMax) {
    let fullWidth = $("#eventgraph").width();
    let fullHeight = $("#eventgraph").height();
    let width = xMax - xMin,
        height = yMax - yMin;
    let midX = xMin + width / 2,
        midY = yMin + height / 2;
    let scale = zoomer.scale();
    if (width == 0 || height == 0) return;
    let translate = [fullWidth / 2 - midX * 2, fullHeight / 2 - midY * 2];

    // console.trace("zoomFit", translate, scale);
    elementsG
        .transition()
        .duration(500) // milliseconds
        .call(zoomer.translate(translate).scale(2).event);
    return true;
}

function zoomOnNodes(nodeIdArr) {
    let fullWidth = $("#eventgraph").width();
    let fullHeight = $("#eventgraph").height();
    let scale = zoomer.scale();
    let midX = 0;
    let midY = 0;
    let xMin = 0;
    let xMax = 0;
    let yMin = 0;
    let yMax = 0;
    let nodesPositionXArr = nodeIdArr.map(item => getNodePosition(item)[0]);
    let nodesPositionYArr = nodeIdArr.map(item => getNodePosition(item)[1]);
    if (nodeIdArr.length < 0) {
        throw new Error('无可用节点');
    } else if (nodeIdArr.length === 1) {
        midX = nodesPositionXArr[0];
        midY = nodesPositionYArr[0];
        let translate = [fullWidth / 2 - midX * 2, fullHeight / 2 - midY * 2];
        elementsG
            .transition()
            .duration(500) // milliseconds
            .call(zoomer.translate(translate).scale(2).event);
    } else if (nodeIdArr.length === 2) {
        midX = Math.min.apply(Math, nodesPositionXArr) + Math.abs(nodesPositionXArr[0] - nodesPositionXArr[1]) / 2;
        midY = Math.min.apply(Math, nodesPositionYArr) + Math.abs(nodesPositionYArr[0] - nodesPositionYArr[1]) / 2;
        let translate = [fullWidth / 2 - midX * 2, fullHeight / 2 - midY * 2];
        elementsG
            .transition()
            .duration(500) // milliseconds
            .call(zoomer.translate(translate).scale(2).event);
    } else {
        xMin = Math.min.apply(Math, nodesPositionXArr);
        xMax = Math.max.apply(Math, nodesPositionXArr);
        yMin = Math.min.apply(Math, nodesPositionYArr);
        yMax = Math.max(Math, nodesPositionYArr);
        transformOnSelectedZone(xMin, xMax, yMin, yMax);
    }
}


function getNodePosition(nodeID) {
    var posArr = new Array(2);
    posArr[0] = parseFloat($('#' + nodeID).attr('transform').match(/[-\d\.]+/g)[0]);
    posArr[1] = parseFloat($('#' + nodeID).attr('transform').match(/[-\d\.]+/g)[1]);
    return posArr;
}

function highlightParentNode(nodeID) {
    var nodeData = d3.select('#' + nodeID)[0][0]['__data__'];
    var nodeIDArr = new Array(nodeID);
    var treeLinks = d3.selectAll('g.tree-linked');
    while (nodeData.parent) {
        nodeIDArr.push('g-' + nodeData.parent.name);
        nodeData = nodeData.parent;
    }
    d3.selectAll('g.node').classed('unselected', function (d) {
        return !(nodeIDArr.some(function (nodeID) {
            return nodeID.indexOf(d.name) > 0;
        }));
    }).each(function (d) {
        if (nodeIDArr.some(function (nodeID) {
                return nodeID.indexOf(d.name) > 0;
            })) {
            d.selected = true;
        } else {
            d.selected = false;
        }
    });
    links.attr("class", function (d) {
        if (d.source.selected && d.target.selected) {
            return "link selected"
        } else {
            return "link unselected";
        }
    });

    links.attr("marker-end", function (d, index) {
        if (d.source.selected && d.target.selected) {
            return "url(#arrow" + index + ")"
        } else {
            return "url(#unselected_arrow)";
        }
    });
    d3.selectAll('path.tree-linked').attr('class', function (d) {
        if (d.source.selected && d.target.selected) {
            return "tree-linked selected"
        } else {
            return "tree-linked unselected";
        }
    });
    treeLinks.classed('unselected', function (d) {
        "use strict";
        if (d.source.selected && d.target.selected) {
            return false;
        }
        return true;
    });
}

/*透明/可视指定节点前面线条的文字
 * param:nodeID(圆形节点DOMid,该参数为可选)
 * return:true(显示线条文字)/false(不显示线条文字)*/
function switchLinkTextVisual(nodeID) {
    var nodeData = null;
    var treeLinks = d3.selectAll('g.tree-linked');
    var selectionPrototype = Object.getPrototypeOf(treeLinks);
    var linksAll = Object.setPrototypeOf([treeLinks[0].concat(links[0])], selectionPrototype);
    if (nodeID) {
        nodeData = d3.select('#' + nodeID)[0][0]['__data__'];
        do {
            nodeData.linkTextVisual = true;
            nodeData = nodeData.parent;
        } while (nodeData);
        linksAll.each(function (d) {
            if (d.source.linkTextVisual && d.target.linkTextVisual) {
                d3.select(this).classed('linkTextShow', true);
            } else {
                d3.select(this).classed('linkTextShow', false);
            }
        });
        return true;
    } else {
        d3.selectAll('g.node').each(function (d) {
            delete d.linkTextVisual;
        });
        linksAll.each(function (d) {
            d3.select(this).classed('linkTextShow', false);
        });
        return false;
    }
}

//导出指定区域为word文档并另存,element参数为原生的DOM对象，name参数为字符串
function exportWord(element, name) {
    $(element).wordExport(name);
}


/*自定义对象选择并编辑菜单，构造函数模式
 * param:ele(生成菜单的元素),自定义对象配置文件(Object)
 * return:自定义对象多级选择并编辑菜单实例*/

function CustomObjectMenu(ele, data) {
    var ul = document.createElement('ul');
    this.type = '';
    for (var i in data.entries) {
        var nameLi = document.createElement('li');
        nameLi.className = data.entries[i].id;
        nameLi.innerText = data.entries[i].name;
        ul.appendChild(nameLi);
    }
    ele.appendChild(ul);
    (function (that) {
        ele.addEventListener('click', function (eve) {
            if (eve.target.nodeName === 'LI') {
                //// console.log('进入', eve.target, data[eve.target.className]);
                that.createConfigWindow(data[eve.target.className]);
            }
        });
    })(this);
    this.on = function (eventTypeStr, fn) {
        var menu = document.querySelector('#customObjectMenu');
        menu['on' + 'eventTypeStr'] = fn;
    };
    this.show = function (position) {
        if (ele.style.display === 'block') {
            return true;
        }
        ele.style.display = 'block';
        ele.style.top = position.top;
        ele.style.left = position.left;
    };
    this.close = function () {
        ele.style.display = 'none';
        document.onclick = null;
    };
    this.confirm = function (data) {
        var req = new XMLHttpRequest();
        req.setRequestHeader('Authorization', 'JWT ' + getURLParams("token"));
        req.setRequestHeader('Content-type', 'application/json');
        req.open('post', '#', true);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status === 200) {
                // console.log(req.responseText);
            }
        };
        req.send(data);
    };
    this.createConfigWindow = function (data) {
        var configWindow = createConfigWindow(data),
            width = configWindow.offsetWidth,
            height = configWindow.offsetHeight,
            clientHeight = document.documentElement.clientHeight,
            clientWidth = document.documentElement.clientWidth;
        configWindow.style.top = Math.round(clientHeight / 2 - height / 2) + 'px';
        configWindow.style.left = Math.round(clientWidth / 2 - width / 2) + 'px';
        var fn = function () {
            if (hasOneValue(data)) {
                var jsonNew = createJson(data);
                var jsonStr = JSON.stringify(jsonNew),
                    title = getOneValue(jsonNew),
                    type = jsonNew.id,
                    objectName = title,
                    infoWrap = "<div objectId='0' objectName='" + title + "' datafield=" + jsonStr + " class= '" + jsonNew.classname + " disEdit customizeObj' >" + title + "</div>",
                    standardObject = {objectId: '0', type: type, objectName: jsonNew.label},
                    elements = jsonNew.elements,
                    j = 0,
                    jLength = elements.length;
                for (; j < jLength; j++) {
                    standardObject[elements[j].id] = elements[j].value ? elements[j].value : "";
                }
                addMessage(mission.roomID, mission.userID, mission.userName, infoWrap, [], [standardObject]);
                cleanConfigWindow(configWindow);
            } else {
                alert('至少输入一个值！');
            }
        };
        addConfigWindowEvent(data, configWindow, fn);
    };
    this.testMouseIn = function (position) {
        if (!position) {
            return false;
        }
        var elePosition = ele.getBoundingClientRect();
        var configWindow = document.querySelector('.configWindow');
        if ((elePosition.left <= position.clientX && position.clientX <= elePosition.right) && (elePosition.top <= position.clientY && position.clientY <= elePosition.bottom)) {
            return true;
        }
        if (configWindow) {
            var configWindowPosition = configWindow.getBoundingClientRect();
            if ((configWindowPosition.left <= position.clientX && position.clientX <= configWindowPosition.right) && (configWindowPosition.top <= position.clientY && position.clientY <= configWindowPosition.bottom)) {
                return true;
            }
        }
        return false;
    }
}


/*绘制环形菜单
 * param:position, radius(内外半径), angle(环形菜单总体角度),data(渲染环形菜单的数据)
 * return :环形菜单节点对象*/

function renderPieMenu(d3Node, position, radius, angle, data, pieMenuType) {
    var x = position ? position[0] : NaN,
        y = position ? position[1] : NaN,
        colors = d3.scale.category20(),
        endAngle = angle ? angle : 2 * Math.PI,
        renderData = (function () {
            var count = 0,
                eachAngle = endAngle / data.length;
            return data.map(function (obj) {
                //console.log((count * eachAngle).toFixed(1), (eachAngle * (count += 1)).toFixed(1));
                return {
                    startAngle: (count * eachAngle).toFixed(3),
                    endAngle: (eachAngle * (count += 1)).toFixed(3),
                    id: obj.id,
                    label: obj.label,
                    clickHandle: obj.clickHandle
                }
            });
        })(),
        arc = d3.svg.arc().outerRadius(radius.outerRadius).innerRadius(radius.innerRadius);
    if (data.length > 1) {
        arc = arc.padAngle(0.02);
    }
    d3.selectAll('g.pieMenu').remove();
    var menuG = d3Node.append('g');
    menuG.classed(pieMenuType, true);
    var arcG = menuG.attr('transform', 'translate(' + position[0] + ',' + position[1] + ')').selectAll('g.arc')
        .data(renderData).enter()
        .append('g')
        .attr('class', 'arc')
        .on('mouseover', function (d, i) {
            d3.event.stopPropagation();
            d3.select(this).select('path').attr('fill', '#1b96e9');
        }).on('mouseout', function (d, i) {
            d3.event.stopPropagation();
            d3.select(this).select('path').attr('fill', 'rgba(37, 48, 55, 0.9)');
        }).on('click', function (d, i) {
            d.clickHandle(d3.select(this));
        });
    arcG.append('path')
        .attr('fill', function (d, i) {
            return 'rgba(37, 48, 55, 0.9)';
        }).attr('d', function (d, i) {
        return arc(d, i);
    }).attr('class', function (d) {
        return d.id;
    }).transition().duration(500)
        .attrTween("d", function (d) {
            var start = {startAngle: 0, endAngle: 0};
            var interpolate = d3.interpolate(start, d);
            return function (t) {
                return arc(interpolate(t));
            }
        }).each('end', function (d) {
        d3.select(this.parentNode).append('text').attr('transform', function (d) {
            return 'translate(' + arc.centroid(d) + ')';
        }).attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d.label;
            });
    });
    /*    arcG.append('text').transition().duration(500)
     .attr('transform', function (d) {
     return 'translate(' + arc.centroid(d) + ')';
     }).attr('dy', '.35em')
     .attr('text-anchor', 'middle')
     .text(function (d) {
     return d.label;
     });*/
}

function deleteEventByID(eventID) {
    if (!eventToNode.hasOwnProperty(eventID)) return;

    let links = treeLinks.filter(d => {
        return eventToNode[eventID].find(node => {
            return node === d.target.name;
        })
    })

    links.forEach(link => {
        link.source.children = link.source.children.filter(child => {
            return !eventToNode[eventID].find(node => {
                return node === child.name;
            })
        })
    })
    init(forceNodes, forceLinks);
}

function shrinkIntoNode(nodeId) {
    //console.log(nodeId);
    let [l] = treeLinks.filter(d => {
        return d.target.name === nodeId.substring(2);
    });
    if (!l) return;
    console.log(l);
    let {source: source, target: target} = l;
    //console.log(l);
    if (!source || !target) return;
    source.children = source.children.filter(v => {
        return v.name !== nodeId.substring(2);
    });
    if (!source.hasOwnProperty('_children')) source._children = [];
    source._children.push(target);
    d3.select('#g-' + source.name).classed('shrinkedNode', true);
    init(forceNodes, forceLinks);
}


/*dy*/
/*
 * function shrinkIntoNode(nodeId) {
 console.log(nodeId);
 let [l] = treeLinks.filter(d => {
 return d.target.name === nodeId;
 });
 if (!l) return;
 let {source: source, target: target} = l;
 console.log(l);
 if (!source || !target) return;

 source.children = source.children.filter(v => {
 return v.name !== nodeId;
 });
 if (!source.hasOwnProperty('_children')) source._children = [];
 source._children.push(target);
 renderTree(treeNodes);
 }*/


