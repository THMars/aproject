window.onload = function () {
    let begin = Date.now();
    /************************************************************************
     *  初始化时间线
     ************************************************************************/
    let options = {
        // template: function(item) {
        //     let html = '<table class="tl-table">'
        //     for (let attr in item) {
        //         if( attr != 'id' && attr != 'start') {
        //             html += '<tr><td>' + attr + '</td><td>' + item[attr] + '</td></tr>'
        //         } else if( attr === 'start' ) {
        //             html += '<tr><td>' + attr + '</td><td>' + new Date(item[attr]).toLocaleDateString() + '</td></tr>'
        //         }
        //     }
        //     html += '</table>'
        //     return html
        // },
        template: function (item) {
            let html = '<div class="info" data-info="' + item.description + '">' +
                '<div class="header">' +
                '<span>' + item.title + '</span>' +
                '</div>' +
                '<div data-field=' + item.content + '>' +
                '</div>' +
                '</div>';
            return html
        },
        align: 'center',
        width: '100%',
        height: '100%',
        min: new Date(2015, 0, 1),
        max: new Date(2020, 0, 1),
        margin: {
            item: 5
        },

        minHeight: 100,
        start: new Date(),
        multiselect: true,
        showCurrentTime: true,
        zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 2,
        zoomMin: 1000 * 60 * 5
    }
    let items = new vis.DataSet();
    let container = document.querySelector('#mytimeline');
    let selarea = false; // 判断是否移除分区
    timeline = new vis.Timeline(container, items, options);
    // 时间范围改变的监听事件

    let newId = 0;


    function ShowitemInfoById(ids) {
        console.log(ids);
        filterNodesById(ids)
        let html = "";
        for (id of ids) {
            info = JSON.parse(JSON.parse(items._data[id].content).info);
            html += generateTableByObj(info)
        }
        $('.details-p').show();
        $('#itemInfo').html(html);

    }

    function generateTableByObj(obj) {
        let table = "<table class='table table-bordered'>";
        for (let k in obj) {
            let v = obj[k];
            if (typeof(obj[k]) == 'object') {
                v = generateTableByDict(obj[k])
            }
            table += "<tr><td>" + k + "</td><td style='word-break: break-all'>" + v + "</td></tr>"
        }
        table += "</tr></table>";
        return table;
    }

    timeline.on('rangechange', function (obj) {
        // 拖动时间轴
        if (obj.byUser == false) { //非用户改变时间轴
            return;//Not drag by User
        } else { //用户拖动改变，这个地方应该做数据预载，注意和推送到知识图的分开
            //console.log(obj);
        }

    });

    timeline.on('select', function (obj) {
        //选中
        ShowitemInfoById(obj.items);
    });

    timeline.on('itemover', function (obj) {
        //鼠标悬浮
    });


    timeline.on('timechange', function (obj) {
        //自定义轴拖动的时候
        let date = obj.time
        let timePeriod = items.get('timePeriod')
        timePeriod.end = date
        items.update(timePeriod)
        updateSelectedArea(date)
    });

    function updateSelectedArea(end) {
        // 清除操作
        let selectedItems = []
        $('.vis-selected').removeClass('vis-selected')
        // 高亮选中区域
        let datas = items._data
        for (let index in datas) {
            let item = datas[index]
            if (item.type != 'background' && checkDateRange(end, item.start)) {
                item.className += ' vis-selected'
                selectedItems.push(item)
            }
        }
        let timer = {
            start: timeline.getDataRange().min.getTime(),
            end: end.getTime()
        };
        filterNodesByTime(timer)
        // 判断是否为空
        if (selectedItems.length != 0) {
            items.update(selectedItems)
        }
    }

    function checkDateRange(maxDate, date) {
        let minDate = timeline.getDataRange().min
        return date < maxDate && date > minDate;

    }

    // let initUrl = 'http://' + window.location.host + '/synergy/show/new';
    let initUrl = 'synergy/show/range';
    setRangeData(0, initUrl);
    // setTimer(1000);

    function getURLParams(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /************************************************************************
     *  处理点击事件
     ************************************************************************/
    var auto = true;
    var tempTimer = 0;
    setAutoRun(auto);
    $("#auto_btn").click(function (e) {
        auto = !auto
        if (auto) {
            e.target.innerText = '停止自动';
            setAutoRun(auto);
        } else {
            e.target.innerText = '开启自动';
            setAutoRun(auto)
        }
    });

    $('#overview_btn').click(function () {
        $('.vis-selected').removeClass('vis-selected')
        changeHighlightAll()
        items.remove('timePeriod')
        if ($('.vis-select-time').length != 0) {
            timeline.removeCustomTime("vis-select-time")
            selarea = false
        }
        timeline.fit();
    });


    $("#jumpcurrent_btn").click(function () {
        timeline.moveTo(Date.now());
    });


    $("#selarea_btn").click(function () {
        let winobj = timeline.getWindow();
        selarea = !selarea;
        if (selarea) {
            let customTime = new Date(winobj.end - (winobj.end - winobj.start) / 2)
            let earliesTime = timeline.getItemRange().min
            timeline.addCustomTime(customTime, "vis-select-time");
            items.add({
                id: 'timePeriod',
                start: earliesTime,
                end: customTime,
                type: 'background'
            })
            // 建立选区初始化操作
            updateSelectedArea(customTime)
        } else {
            if ($('.vis-select-time').length != 0) {
                timeline.removeCustomTime("vis-select-time");
            }
            items.remove('timePeriod')

            changeHighlightAll();
            // 清除选中的
            $('.vis-selected').removeClass('vis-selected')
            clearSelectedItems(items)
        }

    });

    /************************************************************************
     *  异步获取信息并设置
     ************************************************************************/
    var isQuery = false;

    function setRangeData(newID, url) {
        if (isQuery) return;
        isQuery = true;
        $.ajax({
            type: "POST",
            url: url + '?token=' + getURLParams('token'),
            data: JSON.stringify({"lastID": newID, beginTime: begin}),
            contentType: "application/json",
            success: successHandler,
            fail: function (err) {
                if (err) {
                    console.log(new Error(err))
                }
                isQuery = false;
            }
        });
        /**
         * 成功处理
         * @param result
         */
        function successHandler(result) {
            if (!result || result[0] == null) {
                isQuery = false;
                return
            }
            let op = ''
            if (result.length > 1) {
                op += '<p class="message-item"><span class="message-time">' + new Date().toLocaleString() + '</span>' +
                    '<span class="message-info">正在初始化内容,请稍后...</span></p>'
            } else {
                op = '<p class="message-item"><span class="message-time">' + new Date(parseInt(result[0].eventTime)).toLocaleString() + '</span>' +
                    '<span class="message-info"> ' + JSON.parse(result[0].info).uname + ',他搞了一点事</span></p>'
            }
            $('#message_list').find('.messages').prepend(op)
            // $('#message_list').animate({
            //     bottom: '20px'
            // }, 500, function() {
            //     setTimeout(function() {
            //         $('#message_list').animate({
            //             bottom: '-520px'
            //         }, 500)
            //     }, 2000)
            // })

            let set = eventsParserHandler(result);
            /*
             标准添加item,见 item.json
             */
            console.log(result);
            addNodeAndEdge(result);
            init(forceNodes, forceLinks);
            addSet(set);
            isQuery = false;
        }

        function eventsParserHandler(events) {
            console.log(events)
            let items = [];
            for (let index in events) {
                let event = events[index];
                let style = cssconfig[event.eventType];
                items.push({
                    className: style,
                    id: event.eventID,
                    title: varconfig[event.eventType],
                    start: new Date(parseInt(event.eventTime)),
                    description: JSON.stringify(event.info),
                    content: JSON.stringify(event),
                    type: 'box'
                });
                newId = event.eventID;
            }
            return items
        }

        function addSet(set) {
            items.add(set);
            if (auto) {
                timeline.focus(set[set.length - 1].id);
            }
            console.log(newId)
        }
    }

    /************************************************************************
     *  更新知识图
     ************************************************************************/
    function updateGraph() {

    }

    function updateGraphbyTime(start, end) {

    }

    function noticeSelectedNode() {

    }

    /************************************************************************
     *  其他处理函数
     ************************************************************************/

    /**
     * 设置自动化运行
     * @param auto
     */

    function setAutoRun(auto) {
        if (auto) {
            tempTimer = setTimer(1000);
            $('#overview_btn').attr('disabled', 'disabled')
            $('#jumpcurrent_btn').attr('disabled', 'disabled')
            $('#selarea_btn').attr('disabled', 'disabled')
            items.remove('timePeriod')
            if ($('.vis-select-time').length !== 0) {
                timeline.removeCustomTime('vis-select-time')
                selarea = false
            }
            // 去除选中
            $('.vis-selected').removeClass('vis-selected')
        } else {
            clearInterval(tempTimer)
            $('#overview_btn').removeAttr('disabled')
            $('#jumpcurrent_btn').removeAttr('disabled')
            $('#selarea_btn').removeAttr('disabled')
        }
    }

    /**
     * 设置定时器
     * @param interval
     * @returns {number}
     */
    function setTimer(interval) {
        //timeline.itemsData.clear();
        return window.setInterval(function () {
            setRangeData(newId, initUrl);
            // if (auto) {
            timeline.moveTo(Date.now());
            // }
        }, interval)
    }

    function clearSelectedItems(ms) {
        let newArr = [];
        for (let item in ms._data) {
            if ((ms._data[item].className).indexOf('vis-selected') !== -1) {
                ms._data[item].className = ms._data[item].className.replace(/vis-selected/g, '')
                newArr.push(ms._data[item])
            }
        }
        items.update(newArr)
    }

};

function changeAnimate() {
    $(".animent").addClass("pt-page-delay").removeClass("z-index");
    $(".svg").addClass("pt-page pt-page-delay300").addClass("z-index");
}