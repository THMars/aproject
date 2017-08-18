/**
 * Created by wxy on 2017/7/11.
 */
var socket = io.connect(window.location.host);

socket.on('connect', function () {
    console.log('connect');
});
socket.on('jump monitor',function (data) {
    $('#app').attr('src',data)
});

socket.on('disconnect', function () {
    console.log('disconnect');
});