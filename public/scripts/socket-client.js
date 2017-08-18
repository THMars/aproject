/**
 * Created by dingyang on 2016/10/26.
 */
// var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IjEyMzEyMyIsInVzZXJJRCI6InUyIiwiaWF0IjoxNDc3NTYzMjAxfQ.iA5HW13lZwvmx_jnExZWKEU6jszFmXSgTKahLt09M6E';


socket = io.connect(window.location.host);
console.log(socket)
isAuthorized = false;

myMissionEvent.bind('changeMission', function (missionInfo) {
    joninRoom(missionInfo.roomID);
});

socket.on('connect', function () {
    console.log('connect');
    isAuthorized = true;
    if (mission.roomID) {
        joninRoom(mission.roomID);

    }
});


socket.on('reconnecting', function () {
    console.log('reconnect');
    if (!mission.roomID) return;
    $('.my-chat .title').text('重新进入会战...');
    $('.svgRoomTitle').text('重新进入会战...');
    toastr.warning(mission.roomName, '正在重新进入会战...', {timeOut: 2000});
});

socket.on("error", function (error) {
    if (error == "UnauthorizedError" || error == "invalid_token") {
        // redirect user to login page perhaps?
        console.log(error);
        isAuthorized = false;
        $('.my-chat .title').text('身份认证失败，请重新登录');
        $('.svgRoomTitle').text('身份认证失败，请重新登录');
        toastr.error('', '身份认证失败,请重新登录', {timeOut: 2000});
    }
});

socket.on('message', function (messages) {
    //todo 目前messages里只有一个元素
    console.log(messages);
    if (!messages || messages.length <= 0)return;
    // $('.scroll').append(loadingAnimate());
    addmsg(messages);
    if (mission.roomID == messages[0].meetingID) {
        socket.emit('receipt', messages[messages.length - 1]);
        if (messages[0].attachmentInfo && messages[0].attachmentInfo.length > 0) {
            fileAdd(messages[0].attachmentInfo);
        }
        //todo 优化
        objectReflush(messages[0].meetingID)
    }
    $(".scroll>.loader").remove();
    $('.scroll>.spinner').remove();
});

socket.on('system', function (info) {
    console.log(info);

    if (info.type == 'join') {                 //进入会战
        // memberUpdate('join', info.userID);
        memberUpdate('online', info.userID);

    } else if (info.type == 'leave' || info.type == 'online') {         //离开会战
        memberUpdate('online', info.userID);

    } else if (info.type == 'logout') {        //下线
        memberUpdate('offline', info.userID);

    } else if (info.type == 'addMeeting') {
        createRoomSuccess(info.meetingInfo);
        toastr.info(info.meetingInfo.name, '被邀请到会战', {timeOut: 2000});
    }

    //当前会战消息
    if (info.meetingID != mission.roomID)return;

    if (info.type == 'addMember') {     //新成员加入会战
        memberUpdate('add', '', info.member);
        toastr.info(info.member.userName, '新成员加入会战', {timeOut: 1000});

    } else if (info.type == 'deleteMember') {  //成员退出会战
        memberUpdate('delete', info.userID);
        toastr.info(info.userName, '有成员离开了会战', {timeOut: 1000});
    } else {

    }
});

socket.on('reconnect_failed', function () {
    if (!mission.roomID) return;
    $('.my-chat .title').text('进入失败');
    $('.svgRoomTitle').text('进入失败');
    toastr.error('', '进入失败', {timeOut: 2000});
});

socket.on('disconnect', function () {
    console.log('disconnect');
    if (!mission.roomID) return;
    toastr.warning(mission.roomName, '已离开会战', {timeOut: 2000});
    $('.my-chat .title').text('未进入会战');
    $('.svgRoomTitle').text('未进入会战');
});

function joninRoom(roomID) {
    if (!isAuthorized) {
        toastr.error('请重新登录系统', '无法进入会战', {timeOut: 2000});
        // $('.scroll').find(".loader").remove();
    }
    console.log('join room:', roomID);
    socket.emit('join room', roomID, function (err, resp) {
        if (!err) {
            console.log(resp)
            $('.my-chat .title').text("协同会战平台——" + resp.name);
            $('.svgRoomTitle').text("协同会战平台——" + resp.name);
            $('#room_desc_text').text(resp.desc);
            toastr.success(resp, '已进入会战', {timeOut: 2000});
            // $('.scroll').find(".loader").remove();
            console.log('join:', resp);
            if (meetingIDForShowPage != roomID) {
                meetingIDForShowPage = roomID;
            }
            return;
        }
        $('.my-chat .title').text(err);
        $('.svgRoomTitle').text(err);
        toastr.error('', err, {timeOut: 2000});
        console.log(err);
    });
}
