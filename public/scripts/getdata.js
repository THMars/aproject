/*AJAX取得数据*/


function getRooms(userid) {
    $.ajax({
        type: "POST",
        url: '/rooms/list',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            userID: userid
        }),
        beforeSend: function () {

        },
        complete: redirectFunc,
        success: function (data) {
            if (errFunc(data))return;
            getMyRoomSuccess(data);
        },
        error: redirectFunc,
        global: false
    });
}

function getRoom(roomID, callback) {
    $.ajax({
        type: "POST",
        url: '/info',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomID
        }),
        beforeSend: function () {
        },
        complete: redirectFunc,
        success: function (data) {
            if (callback) callback(data);
        },
        error: redirectFunc,
        global: false
    });
}

function createRoom(name, desc, parentid, userid, memberinfo, callback) {
    $.ajax({
        type: "POST",
        url: '/rooms/add',
        contentType: 'application/json',
        dataType: 'json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        data: JSON.stringify({
            roomName: name,
            parentID: parentid,
            userID: userid,
            memberInfo: memberinfo,
            desc: desc
        }),
        beforeSend: function () {
            //$('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            callback(data);
        },
        error: redirectFunc,
        global: false
    });
}
function disableRoom(roomID, callback) {
    $.ajax({
        type: "POST",
        url: '/rooms/disable',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        async: false,
        data: JSON.stringify({
            roomID: roomID
        }),
        beforeSend: function () {
            //$('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            if (callback) callback();
        },
        error: redirectFunc,
        global: false
    });
}

function overRoom(roomID, callback) {
    $.ajax({
        type: "POST",
        url: '/rooms/over',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        async: false,
        data: JSON.stringify({
            roomID: roomID
        }),
        beforeSend: function () {
            // $('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            if (callback) callback();
        },
        error: redirectFunc,
        global: false
    });
}

function getMember(roomid) {
    $.ajax({
        type: "POST",
        url: '/members',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomid
        }),
        beforeSend: function () {
            $('#memberContainer').append(loadingAnimate());
        },
        complete: function () {
            $('#memberContainer').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            getMemberSuccess(data);
        },
        error: redirectFunc,
        global: false
    });
}


function getNotInUsers(roomID, userID, callback) {
    $.ajax({
        type: "POST",
        url: '/members/getNotInUsers',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomID,
            userID: userID
        }),
        beforeSend: function () {
            //$('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            callback(data);
        },
        error: redirectFunc,
        global: false
    });
}
function addMemberToOneRoom(roomid, userinfo, callback) {
    $.ajax({
        type: "POST",
        url: '/members/add',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomid,
            userInfo: userinfo
            /*[{userID : userid,
             userName : username,
             userPost : userpost,
             userLocation : userlocation}]*/
        }),
        beforeSend: function () {
            //$('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            callback();
        },
        error: redirectFunc,
        global: false
    });
}
function deleteMember(roomid, userid) {
    $.ajax({
        type: "POST",
        url: '/members/delete',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomid,
            userID: userid
        }),
        beforeSend: function () {
            // $('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            deleteMemberSuccess(data);
        },
        error: redirectFunc,
        global: false
    });
}
function getMessage(roomid, msgid, size, callback) {
    $.ajax({
        type: "POST",
        url: '/messages/history',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomid,
            msgID: msgid,
            size: size
        }),
        beforeSend: function () {
            //$('.scroll').append(loadingAnimate());
        },
        complete: function () {
            //$('.scroll').find(".loader").remove();
            getMessageComplete();
        },
        success: function (data) {
            if (errFunc(data))return;
            callback(null, data);
        },
        error: redirectFunc,
        global: false
    });
}

function addMessage(roomid, userid, username, content, aids, standardObjects,resultId) {
    if (!isAuthorized) {
        toastr.error('请重新进入会战', '发送消息失败', {timeOut: 2000});
        return;
    }
    socket.emit('message', {
        meetingID: roomid,
        sendUserID: userid,
        message: content,
        attachmentIDList: aids,
        objectList: standardObjects,
        recvUserID: '',
        recvUserName: '',
        callbackData: resultId
    });
    $('.editor').val('');


    $('#fileDisplay').children('div').remove();
    $('#uploadProgress').css(
        'width', '0%'
    );
}

function withdrawMessage(messageid, userid) {
    $.ajax({
        type: "POST",
        url: '/messages/withdraw',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            senderID: userid,
            messageID: messageid
        }),
        beforeSend: function () {
        },
        complete: function () {
        },
        success: function (data) {
            if (errFunc(data))return;
        },
        error: redirectFunc,
        global: false
    });
}

function getAttachment(roomid, callback) {
    $.ajax({
        type: "POST",
        url: '/attachments',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomid,
            offset: 0,
            size: 0
        }),
        beforeSend: function () {
            $('#fileContainer').append(loadingAnimate());
        },
        complete: function () {
            $('#fileContainer').find(".loader").remove();
        },
        success: function (data) {
            if (errFunc(data))return;
            if (callback)
                callback(null, data);
        },
        error: redirectFunc,
        global: false
    });
}
function addAttachment(roomid, userid, filename) {
    $.ajax({
        type: "POST",
        url: '/attachments/add',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            roomID: roomid,
            uploadUserID: userid,
            fileName: filename
        }),
        beforeSend: function () {
        },
        complete: function () {
        },
        success: function (data) {
            if (errFunc(data))return;
        },
        error: redirectFunc,
        global: false
    });
}
function deleteAttachment(attachmentid, userid) {
    $.ajax({
        type: "POST",
        url: '/attachments/delete',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            attachementID: attachmentid,
            uploadUserID: userid
        }),
        beforeSend: function () {
        },
        complete: function () {
        },
        success: function (data) {
            if (errFunc(data))return;
        },
        error: redirectFunc,
        global: false
    });
}
function errFunc(data) {
    if (data.err) {
        switch (data.err) {
            case 'redirect' :
                window.location.href = data.redirect;
                break;
            default:
                toastr.error(data.message, data.err, {timeOut: 2000});
        }
        return true;
    }
    return false;
}

function redirectFunc(xhr, statusText, err) {
    console.log(xhr);
    if (xhr.status == '302') {
        console.log(xhr);
    }
}

/**
 * anno 2016-12-2
 */
/**
 * 获取会战室的对象
 * @param meetingId
 */
function getMeetingObjects(meetingId) {
    // $.ajax({
    //     type: 'POST',
    //     url: '/objects',
    //     contentType: 'application/json',
    //     headers: {
    //         'Authorization': 'JWT ' + getURLParams("token")
    //     },
    //     dataType: 'json',
    //     data: JSON.stringify({
    //         meetingId: meetingId
    //     }),
    //     success: function (result) {
    //         if (errFunc(result))
    //             return;
    //         $.each(result, function (index, el) {
    //             el.value = JSON.stringify(el)
    //         });
    //         for (let d = 0; d < result.length; ++d) {
    //             if (configObjDataInfo[result[d].type])
    //                 result[d].label = configObjDataInfo[result[d].type].label;
    //             else result[d].label = result[d].type;
    //         }
    //         console.log(result);
    //         initOtherGrid(result);
    //         freshOtherSearchList(result)
    //     }
    //
    // });

    let apiInstance = new missionClient.ObjectApi();

    let opts = {
        'authorization': 'JWT' + getURLParams('token') // String | token字串
    };

    let $obj = $('#otherContainer .otherHeaderparent');
    $obj.append(loadingAnimate());
    apiInstance.getObjectsInfo(meetingId, opts).then(function (data) {
        // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        let source = {
            localdata: _.map(data.d, (val) => {
                return {
                    label: val.type,
                    sendUserName: val.sendUserName,
                    sendTime: val.sendTime,
                    value: val.id
                };
            }),
            datatype: 'array',
            datafields: [
                {name: 'label', type: 'string'},
                {name: 'sendUserName', type: 'string'},
                {name: 'sendTime', type: 'date'},
                {name: 'value'}

            ],
            updaterow: function (rowid, rowdata, commit) {
                // console.log(rowdata)
            },
            deleterow: function (rowid, commit) {

            }
        };
        //
        let dataAdapter = new $.jqx.dataAdapter(source);
        $obj.find(".loader").remove();
        $('#otherGrid').jqxGrid({source: dataAdapter});
        let $getObjectInfo = $('.getObjectInfo');
        if ($getObjectInfo.length !== 0) {
            $getObjectInfo.jqxButton({width: '100%', height: '100%'})
        }
    }, function (error) {

    });
}


function getObjectData(objectIDList, callback) {
    $.ajax({
        type: 'POST',
        url: '/objects/data',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            objectIDList: objectIDList
        }),
        error: function (err) {
            console.log(new Error(err))
        },
        success: function (data) {
            if (callback)
                callback(data);
        }

    })
}

/**
 *  通过类型获取对象列表
 * @param type
 * @param meetingId
 */
function getObjectListByType(type, meetingId) {
    if (meetingId == undefined) {
        return
    }
    $.ajax({
        type: 'POST',
        url: '/objects/type',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify({
            type: type,
            meetingId: meetingId
        }),
        error: function (err) {
            console.log(new Error(err))
        },
        success: function (data) {
            setGridSource(data, $('#otherConditionGrid'))
        }
    })
}

function addCustomEvent(data, callback) {
    $.ajax({
        type: 'POST',
        url: '/customize',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        dataType: 'json',
        data: JSON.stringify(data),
        error: function (err) {
            console.log(new Error(err))
        },
        success: function (data) {
            if (callback)
                callback(data);
        }
    })
}


// function getUser() {
//     $.ajax({
//         type: "POST",
//         url: '/users',
//         //url: 'http://10.0.0.182:3000/users',
//         contentType: 'application/json',
//         dataType: 'json',
// //            data: JSON.stringify({
// //            }),
//         beforeSend: function () {
//         },
//         complete: function () {
//         },
//         success: function (data) {
//             getUserSuccess(data);
//             if (!$.isEmptyObject(data)) {
// //                console.warn(data);
//             }
//             else {
//             }
//         },
//         error: function () {
//         },
//         global: false
//     });
// }

//function uploadFile(){
//    var formData = new FormData($("#frmUploadFile")[0]);
//    $.ajax({
//        url: '/uploadfile',
//        type: 'POST',
//        data: formData,
//        async: false,
//        cache: false,
//        contentType: false,
//        processData: false,
//        success: function(data){
//            if(200 === data.code) {
//                $("#imgShow").attr('src', data.msg.url);
//                $("#spanMessage").html("上传成功");
//            } else {
//                $("#spanMessage").html("上传失败");
//            }
//            console.log('imgUploader upload success, data:', data);
//        },
//        error: function(){
//            $("#spanMessage").html("与服务器通信发生错误");
//        }
//    });
//}

/*返回具有标准对象详情的标准对象list
 * param:meetingID、messageID、objectID、callback:
 * return:undefined
 * */
function getObjectList(idList, callback) {
    $.ajax({
        type: 'POST',
        url: '/objects/data',
        contentType: 'application/json',
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        data: JSON.stringify({
            objectIDList: idList
        }),
        dataType: 'json',
        error: function (err) {
            callback(null, err);
        },
        success: function (data) {
            if (callback)
                callback(data);
        }
    })
}

let tempTestData = {
    "nodeType": "result",
    "label": "多维分析结果数据",
    "nodeID": "resultObjects-224"
};
function getDataByObjectID(objectId, callback) {
    var url = "/register/info";
    $.ajax({
        type: "POST",
        dataType: "json",
        url: url,
        data: {params: objectId},
        headers: {
            'Authorization': 'JWT ' + getURLParams("token")
        },
        complete: function () {
            $('.scroll').find('.spinner').remove();
        },
        success: function (data) {
            if (errFunc(data)) return;
            data = tempTestData;
            // console.log(data);
            callback(data);
        }
    });
    // return data
}