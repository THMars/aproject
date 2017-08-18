/**
 * Created by dingyang on 2016/12/8.
 */

socket = io.connect(window.location.host);

socket.on('connect', function () {
    console.log('connect');
    toastr.info('', '登录成功', {timeOut: 2000});
});


socket.on('reconnecting', function () {
    console.log('reconnect');
    toastr.warning('', '正在重新进入连接...', {timeOut: 2000});
});

socket.on("error", function (error) {
    if (error == "UnauthorizedError" || error == "invalid_token") {
        // redirect user to login page perhaps?
        console.log(error);
        isAuthorized = false;
        toastr.error('', '身份认证失败,请重新登录', {timeOut: 2000});
    }
});

socket.on('message', function (messages) {
    //todo 目前messages里只有一个元素
    console.log(messages);
    if (!messages || messages.length <= 0)return;

    toastr.info(messages.length + '条', '有消息', {timeOut: 2000});
    // addmsg(messages);
    // if (mission.roomID == messages[0].meetingID) {
    //     socket.emit('receipt', messages[messages.length - 1]);
    //     if (messages[0].attachmentInfo && messages[0].attachmentInfo.length > 0) {
    //         fileAdd(messages[0].attachmentInfo);
    //     }
    //     //todo 优化
    //     objectReflush(messages[0].meetingID)
    // }
});

socket.on('system', function (info) {
    console.log(info);

    // if (info.type == 'join') {                 //进入会战
    //     // memberUpdate('join', info.userID);
    //     memberUpdate('online', info.userID);

    // } else if (info.type == 'leave' || info.type == 'online') {         //离开会战
    //     memberUpdate('online', info.userID);

    // } else if (info.type == 'logout') {        //下线
    //     memberUpdate('offline', info.userID);

    if (info.type == 'addMeeting') {
        createRoomSuccess(info.meetingInfo);
        toastr.info(info.meetingInfo.name, '被邀请到会战', {timeOut: 2000});
    }

    // //当前会战消息
    // if (info.meetingID != mission.roomID)return;

    // if (info.type == 'addMember') {     //新成员加入会战
    //     memberUpdate('add', '', info.member);
    //     toastr.info(info.member[0].userName, '新成员加入会战', {timeOut: 1000});
    //
    // } else if (info.type == 'deleteMember') {  //成员退出会战
    //     memberUpdate('delete', info.userID);
    //     toastr.info(info.userName, '有成员离开了会战', {timeOut: 1000});
    // } else {
    //
    // }
});

socket.on('reconnect_failed', function () {
    toastr.error('', '登录系统失败', {timeOut: 2000});
});

socket.on('disconnect', function () {
    console.log('disconnect');
    toastr.warning('', '已断开', {timeOut: 2000});
});
