$(function () {
    let meetingTabs = $('#meeting_tab');
    meetingTabs.jqxTabs({
        width: '100%',
        height: '100%'
    });

    meetingTabs.on('selected', function (event) {
        let index = event.args.item;
        if (index === 1) {

        }
    });
    $(document).on('click', '.focusBall', function (event) {
        $('#meeting_tab').jqxTabs('select', 1);
        let ballIdArr = [];
        let ballId;
        // console.log($(this).attr('class'))
        if($(this).hasClass('sourceDataBall')) {
            // console.log(212121)
            ballId = $(this).parents('.message-tabs').find('.dataOrigin').attr('objid') || $(this).parents('.tabDivWrap').find('.dataOrigin').attr('objid') || $(this).parents('.jqx-tabs-content-element').find('.dataOrigin').attr('objid');
        }else {
            ballId = $(this).parents('.message-tabs').find('.tabForCount').attr('data') || $(this).parents('.tabDivWrap').find('p').attr('data') || objectID;
        }
        ballId = 'g-' + ballId;
        ballIdArr.push(ballId);
        // console.log(ballIdArr);
        zoomOnNodes(ballIdArr);
        ballIdArr.forEach((nodeId) => {
            d3.select('#' + nodeId).classed('selected', true)
        });
        event.stopPropagation();
    });

    $(document).on('click', '.translate_data', function () {
        let objectId = $(this).parents('.message-tabs').find('.tabForCount').attr('data') || objectID;
        // console.log(objectId);
        $('#meeting_tab').jqxTabs('select', 0);
        $('#message_tabs').hide();
        let type = '';
        if (objectId.indexOf('result') !== -1) {
            type = 'resultobject';
        } else if (objectId.indexOf('custom') !== -1) {
            type = 'customobject';
        }
        addMessage(mission.roomID, mission.userID, mission.userName, '', '', '', {id: objectId, type: type});
    });
    // $(document).on('click', '.translate_data', function (e) {
    //     let info;
    //     // info = infodataForJump.get("change-" + objectID);
    //     // console.log(info);
    //     if(!objectID) {
    //         objectID = $(this).parent().prev().prev().find('span').attr('data');
    //     }
    //     info = JSON.parse(d3.select("#g-" + objectID)[0][0].__data__.info.info);
    //     let systemID;
    //     for (let i in info.nodes) {
    //         if (info.nodes[i].nodeType == 'app' || info.nodes[i].nodeType == 'customapp') {
    //             systemID = info["nodes"][i].nodeID;
    //         }
    //     }
    //     let redirectid = {
    //         meetingID: meetingInfo.id,
    //         meetingName: meetingInfo.name,
    //         objectID: objectID,
    //         lastEventID: d3.select("#g-" + objectID)[0][0].__data__.info.eventID,
    //         systemID: systemID
    //     };
    //     let data = {
    //         data: info.nodes[objectID].info,
    //         redirectID: redirectid
    //     };
    //     callbackDataNoskip(data);
    //
    //     // if(info.hasOwnProperty("noskip")){
    //     //     callbackDataNoskip(data);
    //     // }else {
    //     //     callbackData(data);
    //     // }
    //
    //     // if ($(e.target).data('info').info) {
    //     //     info = JSON.parse($(e.target).data('info').info);
    //     //     callbackData(info);
    //     // } else {
    //     //     info = $(e.target).data('info');
    //     //     callbackDataNoskip(info);
    //     // }
    // });
});
/*
 function callbackData(data) {
 let token = getURLParams('token');
 $.ajax({
 method: 'POST',
 url: 'http://' + location.host + '/messages/callback',
 type: 'json',
 data: {
 redirectID: data.redirectID,
 data: JSON.stringify(data.data)
 },
 headers: {
 Authorization: 'JWT ' + token
 },
 beforeSend: function () {
 let tempDiv = document.createElement('div');
 tempDiv.className = 'warpForLoading';
 $(tempDiv).prepend(loadingAnimate());
 $('body').append(tempDiv);
 },
 complete: function () {
 $('body').find(".warpForLoading").remove();
 },
 success: function (data) {
 if (data.response.code != '1') {
 window.alert(data.response.message);
 return;
 }
 $('#meeting_tab').jqxTabs('select', 0);
 },
 error: function (err) {
 window.alert('回传数据失败')
 }
 })
 }
 function callbackDataNoskip(data) {
 let token = getURLParams('token');
 $.ajax({
 method: 'POST',
 url: 'http://' + location.host + '/messages/callbackmsg',
 type: 'json',
 data: {
 redirectID: JSON.stringify(data.redirectID),
 data: JSON.stringify(data.data)
 },
 headers: {
 Authorization: 'JWT ' + token
 },
 beforeSend: function () {
 let tempDiv = document.createElement('div');
 tempDiv.className = 'warpForLoading';
 $(tempDiv).prepend(loadingAnimate());
 $('body').append(tempDiv);
 },
 complete: function () {
 $('body').find(".warpForLoading").remove();
 },
 success: function (data) {
 if (data.response.code != '1') {
 window.alert(data.response.message);
 return;
 }
 $('#meeting_tab').jqxTabs('select', 0);
 },
 error: function (err) {
 window.alert('回传数据失败')
 }
 })
 }*/
