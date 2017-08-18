
window.clientSocket = {
        socket: io(),
        userInfo: {
            userId: '',
            userName: ''
        },
        message:{
            sendTime:''
        },
        meetingId : '',
        on: function (meetingId,callback) {
            this.socket.on(meetingId, function (obj,msg) {
                obj.content = msg;
                callback(obj.dataId || Math.ceil(Math.random() * Math.pow(10, 10)) ,obj.userId,obj.content,obj.sendTime || Date.now());
            });
        },
        emit: function (msg) {
           /* console.log(this.meetingId+ '___'+msg);
            console.log(this.socket);
            this.socket.emit('1-1',msg);*/
        },
        join: function () {
            this.socket.emit('join', this.userInfo.userId, this.meetingId);
        },
        remove: function (userId, meetingId) {
            this.socket.emit(this.meetingId + 'remove', userId, meetingId);
            this.socket.removeAllListeners(this.meetingId);
        }
    };

