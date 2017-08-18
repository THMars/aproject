/**
 * Created by admin on 2016/12/7.
 */
var rMap = {
    room: 30,
    subroom: 20,
    app: 30,
    object: 15,
    backobject: 15
};

var rSelectMap = {
    room: 40,
    subroom: 30,
    app: 40,
    object: 20,
    backobject: 20
}

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
    }).append("svg").attr({"width": width, "height": height}).style("background-color", "rgb(28,28,28)"),
    force = d3.layout.force().friction(0.2).linkDistance(100).charge(-3000).size([width, height]),
    forceNodes = [],
    forceNodes2 = force.nodes(),
    forceLinks = force.links(),
    zoomG = svg.append("svg:g").attr("class", "zoom").call(zoomer),
    rect = zoomG.append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        //.attr("opacity", 0.5)
        .attr("stroke", "transparent")
        .attr("stroke-width", 1)
        //.attr("pointer-events", "all")
        .attr("id", "zrect"),
    brush = zoomG.append("svg:g")
        .datum(function () {
            return {selected: false, previouslySelected: false};
        })
        .attr("class", "brush"),
    elementsG = zoomG.append("svg:g").attr("class", "elementsG"),
    linksG = elementsG.append("g").attr("class", "linksG"),
    nodesG = elementsG.append("g").attr("class", "nodesG"),
    links = linksG.selectAll("line.link"),
    nodes = nodesG.selectAll("g.node"),
    nodesMap = {},
    eventToNode = {};


//定义brusher
var brusher = d3.svg.brush()
    .x(scaleX)
    .y(scaleY)
    .on("brushstart", function (d) {
        nodes.each(function (d) {
            d.previouslySelected = shiftKey && d.selected;
        });
    })
    .on("brush", function () {
        var extent = d3.event.target.extent();

        nodes.classed("selected", function (d) {
            return d.selected = d.previouslySelected ^
                (extent[0][0] <= d.x && d.x < extent[1][0]
                && extent[0][1] <= d.y && d.y < extent[1][1]);
        });
    })
    .on("brushend", function () {
        d3.event.target.clear();
        d3.select(this).call(d3.event.target);
    });

brush.call(brusher).on("mousedown.brush", null)
    .on("touchstart.brush", null)
    .on("touchmove.brush", null)
    .on("touchend.brsuh", null);

brush.select('.background').style('cursor', 'auto');

//定义鼠标点击
function keydown() {
    shiftKey = d3.event.shiftKey || d3.event.metaKey;
    ctrlKey = d3.event.ctrlKey;
    if (d3.event.keyCode == 67) {   //the 'c' key
        center_view();
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
        .on("mousedown.brush", null)
        .on("touchstart.brush", null)
        .on("touchmove.brush", null)
        .on("touchend.brush", null);
    brush.select('.background').style('cursor', 'auto');
    zoomG.call(zoomer);
}


function zoomstart() {
    nodes.each(function (d) {
        d.selected = false;
        d.previouslySelected = false;
    });
    nodes.classed("selected", false);
}

function redraw() {
    elementsG.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
}

//拖拽回调
function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d.selected && !shiftKey) {
        // if this node isn't selected, then we have to unselect every other node
        nodes.classed("selected", function (p) {
            return p.selected = p.previouslySelected = false;
        });
    }
    d3.select(this).classed("selected", function (p) {
        d.previouslySelected = d.selected;
        return d.selected = true;
    });
    nodes.filter(function (d) {
        return d.selected;
    })
        .each(function (d) {
            d.fixed |= 2;
        })
}

function dragged(d) {
    nodes.filter(function (d) {
        return d.selected;
    })
        .each(function (d) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            d.px += d3.event.dx;
            d.py += d3.event.dy;
        });
    force.resume();
}

function dragended(d) {
    nodes.filter(function (d) {
        return d.selected;
    })
        .each(function (d) {
            d.fixed &= ~6;
        })
}

function UpdateNodeIndex(id) {
    var index = findNodeIndex(id);
    if (index == null) {
        nodesMap[id] = forceNodes2.length - 1;
    } else {
        nodesMap[id] = index;
    }
}

function addNodeAndEdge(events) {
    for (var event of events) {
        if (eventToNode[event.eventID])continue;
        console.log(event.eventID);
        var nodeID, meetingID,
            info = JSON.parse(event.info);
        switch (event.eventType) {
            case "0":
                meetingID = "meeting" + "-" + info.id;
                event.timer = [event.eventTime];
                eventToNode[event.eventID] = [meetingID];
                if (info.pid === "") {
                    forceNodes.push(event);
                    forceNodes2.push({label: info.name, name: meetingID, nodeType: 'room', info: event});
                    UpdateNodeIndex(meetingID);
                } else {
                    forceNodes.push(event);
                    forceNodes2.push({label: info.name, name: meetingID, nodeType: 'subroom', info: event});
                    UpdateNodeIndex(meetingID);
                    eventToNode[event.eventID].push("meeting" + "-" + info.pid);
                    forceLinks.push(createLink(findNodeIndex(meetingID), findNodeIndex("meeting" + "-" + info.pid), ""));
                }

                break;
            case "1":
                nodeID = "object" + "-" + info.mid + "-" + info.msgid + "-" + info.id;
                console.log(info);
                meetingID = "meeting-" + info.mid;

                eventToNode[event.eventID] = [nodeID, meetingID];
                if (nodesMap.hasOwnProperty(meetingID)) {
                    findNode(meetingID).info.timer.push(event.eventTime)
                } else {
                    event.timer = [event.eventTime];
                    forceNodes.push(event);
                    eventToNode[event.eventID] = [meetingID];
                    //todo 判断是否子房间
                    forceNodes2.push({name: meetingID, nodeType: 'room', info: event});
                    UpdateNodeIndex(meetingID);

                }
                if (nodesMap.hasOwnProperty(nodeID)) {
                    findNode(nodeID).info.timer.push(event.eventTime)
                } else {
                    event.timer = [event.eventTime];
                    forceNodes.push(event);
                    forceNodes2.push({label: info.name, name: nodeID, nodeType: 'object', info: event});
                    UpdateNodeIndex(nodeID);
                }

                forceLinks.push(createLink(findNodeIndex(meetingID), findNodeIndex(nodeID), ""));
                break;
            case "2":
                addSourceSys(event, info);
                addApi(event, info);
                addTargetSys(event, info);
                break;
            case "4":
                if (!info.did) info.did = 16;
                nodeID = "app" + "-" + info.did;
                eventToNode[event.eventID] = [nodeID, "object" + "-" + info.mid + '-' + info.objid];
                if (nodesMap.hasOwnProperty(nodeID)) {
                    findNode(nodeID).info.timer.push(event.eventTime);
                    // if (!isApiIn(info.dapi, findLink("object" + "-" + info.objid).text)) {
                    //     findLink("object" + "-" + info.objid).text.push(info.dapi);
                    // }
                } else {
                    event.timer = [event.eventTime];
                    forceNodes.push(event);
                    forceNodes2.push({label: info.dname, name: nodeID, nodeType: 'app', info: event});
                    UpdateNodeIndex(nodeID);
                }
                console.log(forceLinks, "object" + "-" + info.mid + '-' + info.objid);
                forceLinks.push(createLink(findNodeIndex("object" + "-" + info.mid + '-' + info.objid), findNodeIndex(nodeID), info.dapi));
                break;
            case "5":
                nodeID = "backobject" + "-" + info.callbackdataid;
                if (!info.did) info.did = 16;
                if (nodesMap["app" + "-" + info.did]) {
                    console.log(findNode("app-" + info.did), info, nodesMap["app" + "-" + info.did], forceNodes2);
                    findNode("app-" + info.did).info.timer.push(event.eventTime);
                } else {
                    forceNodes.push(event);
                    forceNodes2.push({label: info.dname, name: "app" + "-" + info.did, nodeType: 'app', info: event});
                    UpdateNodeIndex("app" + "-" + info.did);
                }

                if (nodesMap.hasOwnProperty(nodeID)) {
                    console.log(findNode(nodeID), nodeID, nodesMap);
                    findNode(nodeID).info.timer.push(event.eventTime);
                } else {
                    forceNodes.push({
                        nodeID: nodeID, type: "commonObject", timer: [event.eventTime], info: {
                            mid: info.mid, mname: info.mname, did: info.did
                        }
                    });
                    forceNodes2.push({
                        label: info.dname + '处理结果',
                        name: nodeID, nodeType: 'backobject', info: {
                            nodeID: nodeID, type: "commonObject", timer: [event.eventTime], info: {
                                mid: info.mid, mname: info.mname, did: info.did
                            }
                        }
                    });
                    eventToNode[event.eventID] = [nodeID, "app-" + info.did, "meeting-" + info.mid];
                    UpdateNodeIndex(nodeID);
                    console.log(findNodeIndex("app-" + info.did), findNodeIndex(nodeID), findNodeIndex("meeting-" + info.mid))
                    forceLinks.push(createLink(findNodeIndex("app-" + info.did), findNodeIndex(nodeID), ""));
                    forceLinks.push(createLink(findNodeIndex(nodeID), findNodeIndex("meeting-" + info.mid), ""));
                }
        }
    }

}

function findNodeIndex(id) {
    for (var i in nodesMap) {
        if (id === i) {
            return nodesMap[i];
        }
    }
}

function findNode(nodeID) {
    for (var i in forceNodes2) {
        if (forceNodes2[i].name === nodeID) {
            return forceNodes2[i];
        }
    }
}

function findLink(targetNodeIndex) {
    for (var i in forceLinks) {
        if (forceLinks[i].target === targetNodeIndex) {
            return forceLinks[i];
        }
    }
}

function createLink(sourceIndex, targetIndex, text) {
    return {source: sourceIndex, target: targetIndex, text: [text]};
}

function addSourceSys(event, info) {
    var nodeID = "app" + "-" + info.sid;
    if (nodesMap[nodeID]) {
        forceNodes[findNodeIndex(nodeID)].timer.push(event.eventTime);
        forceNode2[findNodeIndex(nodeID)].info.timer.push(event.eventTime);
    } else {
        forceNodes.push({
            eventType: "sourceApp",
            nodeID: nodeID,
            timer: [event.eventTime],
            info: {sid: info.sid, sname: info.sname}
        });
        forceNodes2.push({
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
        forceNodes[findNodeIndex(nodeID)].timer.push(event.eventTime);
        if (!isApiIn(info.api, findLink(findNodeIndex(nodeID).text))) {
            findLink(findNodeIndex(nodeID)).text.push(info.api);
        }
    } else {
        forceNodes.push({
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
        forceNodes[findNodeIndex(nodeID)].timer.push(event.eventTime);
        forceNode2[findNodeIndex(nodeID)].info.timer.push(event.eventTime);
    } else {
        forceNodes.push({
            eventType: "targetApp",
            nodeID: nodeID,
            timer: [event.eventTime],
            info: {did: info.did, dname: info.sname}
        });
        eventToNode[event.eventID] = [nodeID];
        forceNodes2.push({
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


function init(forceNodes, forceLinks) {
    force.stop();
    links = linksG.selectAll("line").data(forceLinks).attr("class", "link");
    var linksEnter = links.enter().append("line").attr("class", "link").attr("marker-end", "url(#arrow)");
    links.exit().remove();


    nodes = nodesG.selectAll("g.node").data(forceNodes);
    console.log(nodes);
    var nodesEnter = nodes.enter().append("svg:g").attr('class', function (d) {
        return 'node ' + d.nodeType;
    }).on("dblclick", function (d) {
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
                    cleanMemberTable();
                    createSurvey(d);
                    createMemberTable(data);
                }
            });
        } else {
            //cleanMemberTable();
        }

        if (d3.event.defaultPrevented) return;
        if (!shiftKey) {
            //如果未按下shift键，取消所有选择
            nodes.classed("selected", function (p) {
                return p.selected = p.previouslySelected = false;
            })
        }
        // 选取这个节点
        d3.select(this).classed("selected", d.selected = !d.previouslySelected);
    }).on("mouseup", function (d) {
        return;
    }).call(d3.behavior.drag()
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended));

    nodesEnter.append("circle")
        .attr({
            r: function (d) {
                return rMap[d.nodeType] || 18;
            },
            width: function (d) {
                console.log(d);
                return d.name.length * 8 + 30
            }, height: "18px", x: function (d) {
                return -(d.name.length * 8 + 30) / 2
            }, y: function (d) {
                return "0px";
            }
        });
    nodesEnter.append("svg:image").attr({
        "xLink:href": function (d) {
            switch (d.nodeType) {
                case "room":
                    return "css/images/room.png";
                    break;
                case "subroom":
                    return "css/images/room.png";
                    break;
                case "object":
                    return "css/images/object.png";
                    break;
            }
        },
        width: function (d) {
            switch (d.nodeType) {
                case "room":
                    return "36px";
                    break;
                case "subroom":
                    return "28px";
                    break;
                case "object":
                    return "18px";
                    break;
            }
        },
        height: function (d) {
            switch (d.nodeType) {
                case "room":
                    return "36px";
                    break;
                case "subroom":
                    return "28px";
                    break;
                case "object":
                    return "18px";
                    break;
            }
        },
        x: function (d) {
            switch (d.nodeType) {
                case "room":
                    return "-18px";
                    break;
                case "subroom":
                    return "-14px";
                    break;
                case "object":
                    return "-9px";
                    break;
            }
        },
        y: function (d) {
            switch (d.nodeType) {
                case "room":
                    return "-18px";
                    break;
                case "subroom":
                    return "-14px";
                    break;
                case "object":
                    return "-9px";
                    break;
            }
        }
    });
    nodesEnter.append("svg:text").attr({
        "text-anchor": "middle",
        width: "8px",
        height: "14px",
        dy: function (d) {
            return (rMap[d.nodeType] || 18) + 14 + 'px';
        }
    }).text(function (d) {
        console.log(d.label);
        return d.label;
    });
    nodes.exit().remove();
    console.log("N", forceNodes2);
    console.log("L", forceLinks);
    force.start();
    // force.on("tick", function (x) {
    //     d3.selectAll("g.node").attr("transform", function (d) {
    //         return "translate(" + d.x + "," + d.y + ")";
    //     });
    //     d3.selectAll("line.link")
    //         .attr({
    //             x1: function (d) {
    //                 return d.source.x
    //             }, y1: function (d) {
    //                 return d.source.y
    //             }, x2: function (d) {
    //                 return d.target.x
    //             }, y2: function (d) {
    //                 return d.target.y
    //             }
    //         });
    //     /*.transition()
    //      .duration(500)*/
    //     /*.attr({x2: function (d) {return d.target.x}, y2: function (d) {return d.target.y}});*/
    // })


    //运动刷新
    force.on("tick", function (d) {
        d3.selectAll("line.link").attr("x1", function (d) {
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
        d3.selectAll("g.node").attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });

}
init(forceNodes2, forceLinks);


function filterNodesByTime(timer) {
    force.stop();
    var start = timer.start,
        end = timer.end,
        // nodes = d3.selectAll("g.node").filter(function (node) {
        //     return !node.highlight
        // }),
        nodes = nodesG.selectAll("g.node").filter(function(node){
            return !node.selectedById;
        }),
        links = d3.selectAll("line.link")/*.filter(function (link) {
            console.log(link.selectedById);
            return !link.selectedById;
        })*/;

    /*nodes.select('circle').attr({
        r: function (d) {
            return (d.info.timer.some(function (time) {
                return (time > start && time < end);
            })) ? rSelectMap[d.nodeType] : rMap[d.nodeType]
        }
    });*/
    nodes.attr({
        class: function (d) {
            return 'node ' + ((d.info.timer.some(function (time) {
                    return (time > start && time < end);
                })) ? d.nodeType + " selected" : d.nodeType + ' unselected')
        }
    });

    nodes.each(function(d){
        if (d.info.timer.some(function (time) {
                return (time > start && time < end);
            })) {
            d.selectedByTime = true;
        }else{
            d.selectedByTime = false;
        }
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

    links.attr("class", function (d) {
        if((d.source.selectedByTime || d.source.selectedById)&&(d.target.selectedByTime || d.target.selectedById)){
            return "link selected"
        }else{
            return "link unselected";
        }
    });

    links.attr("marker-end", function (d) {
        if((d.source.selectedByTime || d.source.selectedById)&&(d.target.selectedByTime || d.target.selectedById)){
            return "url(#arrow)"
        }else{
            return "url(#unselected_arrow)";
        }
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
    force.start();
}

function filterNodesById(idArr) {
    force.stop();
    var nodeIdArr = [],
        nodes = d3.selectAll("g.node").filter(function (node) {
            return !node.selectedByTime
        }),
        links = d3.selectAll("line.link");
    for (var i in idArr) {
        nodeIdArr = nodeIdArr.concat(eventToNode[idArr[i]]);
    }

    console.log(nodes, links);
/*   nodes.select('circle').attr({
        r: function (d) {
            return (nodeIdArr.some(function (id) {
                console.log(nodeIdArr, d.name);
                return id == d.name;
            })) ? rSelectMap[d.nodeType] : rMap[d.nodeType]
        }
    });*/
    nodes.attr('class', function (d) {
            return (nodeIdArr.some(function (id) {
                    return id == d.name;
                }) ? 'node ' + d.nodeType + " selected" : 'node ' + d.nodeType + ' unselected')
        });
    nodes.each(function(d){
      if(nodeIdArr.some(function (id) {
              return id == d.name;
          })){
          d.selectedById = true;
      }else{
          d.selectedById = false;
      }
    });

    links.attr("class", function (d) {
        if((d.source.selectedByTime || d.source.selectedById)&&(d.target.selectedByTime || d.target.selectedById)){
            return "link selected"
        }else{
            return "link unselected";
        }
    });

    links.attr("marker-end", function (d) {
        if((d.source.selectedByTime || d.source.selectedById)&&(d.target.selectedByTime || d.target.selectedById)){
            return "url(#arrow)"
        }else{
            return "url(#unselected_arrow)";
        }
    });

    force.start()
}

function changeHighlightAll() {
    console.log("调用changeall");
    force.stop();
    // d3.selectAll("g.node").classed("highlight", false);
    // d3.selectAll("line.link").classed("highlight", false);
    var nodes = nodesG.selectAll("g.node");
    nodes.each(function(d){
        d.selectedByTime = false;
        d.selectedById = false;
    })
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
    links.attr({class:"link", "marker-end":"url(#arrow)"});

    force.start();
}
