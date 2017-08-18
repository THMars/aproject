window.onload = function() {
    /************************************************************************
     *  初始化时间线
     ************************************************************************/
    var options = {
        // template: function(item) {
        //     var html = '<table class="tl-table">'
        //     for (var attr in item) {
        //         if( attr != 'id' && attr != 'start') {
        //             html += '<tr><td>' + attr + '</td><td>' + item[attr] + '</td></tr>'
        //         } else if( attr === 'start' ) {
        //             html += '<tr><td>' + attr + '</td><td>' + new Date(item[attr]).toLocaleDateString() + '</td></tr>'
        //         }
        //     }
        //     html += '</table>'
        //     return html
        // },
        template: function(item) {
            var html = '<div class="info" data-info="' + item.description + '">' +
                            '<div class="header">' +
                                '<span>' + item.title + '</span>' +
                            '</div>'+
                            '<div data-field='+item.content+'>'+
                            //     '<p>时间: ' + new Date(item.start).toLocaleDateString() + '</p>' +
                            //     '<a href="javascript:void(0)">右键查看详细信息</a>' +
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

        minHeight:100,
        start: new Date(),
        multiselect:true,
        showCurrentTime: true,
        zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 2,
        zoomMin: 1000 * 60 * 5
    }
    var items = new vis.DataSet();
    var container = document.querySelector('#mytimeline');
    timeline = new vis.Timeline(container, items, options);
    var centerTime = 0;
    var max = 0;
    var min = 0;
    var flag = true; // 是否记录最大最小时间
    // 时间范围改变的监听事件
    timeline.on('rangechange', function(prop) {
        var maxDate = prop.end.getTime();
        var minDate = prop.start.getTime();
        if(flag) {
            max = maxDate;
            min = minDate;
            flag = !flag;
        }
        if(prop.byUser === true) {
            if(maxDate > max && minDate > min && maxDate - max >= 5 * 60 * 1000) {

            } else if(min > minDate && max > maxDate && min - minDate >= 5 * 60 * 1000){

            }
        }
    });
    var newId = 0;


    function ShowitemInfoById(ids){
        console.log(ids);
        var html ="";
        for(id of ids) {
            info = JSON.parse(JSON.parse(items._data[id].content).info);
            html+=generateTableByObj(info)
        }
        $('#itemInfo').html(html);

    }

    function generateTableByObj(obj){
        var table = "<table class='table table-bordered'>";
        for(var k in obj){
            var v= obj[k];
            if(typeof(obj[k])=='object'){
                v = generateTableByDict(obj[k])
            }
            table+="<tr><td>"+k+"</td><td style='word-break: break-all'>"+v+"</td></tr>"
        }
        table+="</tr></table>";
        return table;
    }

    timeline.on('rangechange', function(obj) {
        // 拖动时间轴
        if(obj.byUser==false){ //非用户改变时间轴
            return;//Not drag by User
        }else{ //用户拖动改变，这个地方应该做数据预载，注意和推送到知识图的分开
            console.log(obj);
        }

    });

    timeline.on('select',function(obj){
        //选中
        ShowitemInfoById(obj.items);
    });

    timeline.on('itemover',function(obj){
        //鼠标悬浮
    });

    timeline.on('timechange',function(obj){
        //自定义轴拖动的时候
    });

    var initUrl = 'http://10.0.0.74:3050/synergy/show/new';
    setRangeData(0, initUrl);
    setTimer(1000);

    /************************************************************************
     *  处理点击事件
     ************************************************************************/
    var auto = true;
    $("#auto_btn").click(function(e){
        if(auto) {
            e.target.innerText = '开启自动';
            // timeline.setOptions({
            //     showCurrentTime: true
            // });
            setAutoRun(auto);
            // 每一分钟请求一次数据
        } else {
            e.target.innerText = '停止自动';
            // timeline.setOptions({
            //     showCurrentTime: false
            // });
            setAutoRun(auto)
        }
        auto = !auto
    });

    $('#overview_btn').click(function(){
        timeline.fit();
    });


    $("#jumpcurrent_btn").click(function(){
        timeline.moveTo(Date.now());
    });

    var selarea = false;
    $("#selarea_btn").click(function(){
        var winobj = timeline.getWindow();
        selarea = !selarea;
        if(selarea){
            timeline.addCustomTime(new Date(winobj.end-(winobj.end-winobj.start)/2),"vis-select-time");
        }else{
            timeline.removeCustomTime("vis-select-time");
        }

    });

    /************************************************************************
     *  异步获取信息并设置
     ************************************************************************/
    function setRangeData(newID, url) {
        $.ajax({
            type:"POST",
            url: url + '?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InQxIiwib3JpZ19pYXQiOjE0ODE3MDI2MjEsInVzZXJfaWQiOjIsImVtYWlsIjoiIiwiZXhwIjoxNDgxNzg5MDIxfQ.QtxkHbGPP0kpSNvtcphze3K9GQH5Vx6wsOs2oP1G6J0',
            data:JSON.stringify({"lastID":newID}),
            contentType:"application/json",
            success: successHandler,
            fail: function(err) {
                if(err) {
                    console.log(new Error(err))
                }
            }
        });
        /**
         * 成功处理
         * @param result
         */
        function successHandler(result) {
            if(!result||result[0]==null) {
                return
            }

            var set = eventsParserHandler(result);
            /*
             标准添加item,见 item.json
             */
            console.log(result);
            addNodeAndEdge(result);
            init(forceNodes,forceLinks);
            addSet(set)
        }

        function eventsParserHandler(events) {
            var items = [];
            for(var index in events) {
                var event = events[index];
                var style = cssconfig[event.eventType];
                items.push({
                    className:style,
                    id: event.eventID,
                    title: varconfig[event.eventType],
                    start: new Date(parseInt(event.eventTime)),
                    description: JSON.stringify(event.info),
                    content:JSON.stringify(event),
                    type:'box'
                })
            }
            return items
        }

        function addSet(set) {
            items.add(set);
            if(auto){
                timeline.focus(set[set.length-1].id);
            }
            newId = items.length;
        }
    }
    /************************************************************************
     *  更新知识图
     ************************************************************************/
    function updateGraph(){

    }

    function updateGraphbyTime(start,end){

    }

    function noticeSelectedNode(){

    }

    /************************************************************************
     *  其他处理函数
     ************************************************************************/

    /**
     * 设置自动化运行
     * @param auto
     */
    var temp = 0;

    function setAutoRun(auto) {
        if(auto) {
            temp = setTimer(1000)
        } else {
            clearInterval(temp)
        }
    }

    /**
     * 设置定时器
     * @param interval
     * @returns {number}
     */
    function setTimer(interval) {
        //timeline.itemsData.clear();
        return window.setInterval(function() {
            setRangeData(newId, initUrl);
            if(auto){
                // timeline.moveTo(Date.now());
            }
        }, interval)
    }
}