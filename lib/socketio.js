exports.connectors = {};

exports.connect = connect;

exports.listenJoin = listenJoin;

function connect (io,meetingId) {
    if (meetingStart(this.connectors, meetingId)) {
        ioConnect(io, meetingId);
    }
};

function meetingStart (connectors, meetingId) {

    return connectors.hasOwnProperty(meetingId);
};

function ioConnect (io,meetingId) {
    io.on('connection', function (socket) {
        socket.on(meetingId, function (obj,msg) {
            console.log(msg);
            socket.emit(meetingId, obj, msg);
            socket.broadcast.emit(meetingId, obj, msg);
        });

    });
};

function listenJoin (io) {
    io.on('connection', function (socket) {
        socket.on('join', function (userId, meetingId) {
            if (!meetingStart(exports.connectors,meetingId)) {
                exports.connectors[meetingId] = [userId];
                ioConnect(io,meetingId);
            }else{
                var hasUser = false;
                exports.connectors[meetingId].forEach(function (v, i, a) {
                    if (userId == v) {
                        return hasUser = true;
                    }
                });
                if (!hasUser) {
                    exports.connectors[meetingId].push(userId);
                }
            }
            console.log('------------join---------------');
            console.log(exports.connectors);

            socket.on('disconnect',function () {
                removeConnector(this,userId, meetingId);
            });
        });
        socket.on('remove', function (userId, meetingId) {
            removeConnector(this,userId, meetingId);
        })
    });
};

function removeConnector (socket,userId, meetingId) {
    console.log('------------remove-------------');
    console.log(meetingId + '-----------------' + userId);
    /*socket.broadcast.emit('remove', meetingId);
     socket.removeAllListeners(meetingId);*/
    var index = exports.connectors[meetingId].indexOf(userId);
    if (index > -1) {
        exports.connectors[meetingId].splice(index, 1);
        socket.emit('remove', meetingId);
    }
    console.log(exports.connectors[meetingId].length);
    if (exports.connectors[meetingId].length <= 0) {
        /*delete exports.connectors[meetingId];*/
        socket.broadcast.emit('remove', meetingId);
        socket.removeAllListeners(meetingId);
      /*  socket.destory();*/
    }
}