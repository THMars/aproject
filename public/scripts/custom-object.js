$(function () {

    const oQueryContainer = $('#query_container'),
        types = configFields,
        htmlPanel = $('#add_template').html(),
        htmlInput = $('#input_template').html();
    //下拉列表的生成
    let tableCombox;
    let dropdownMenuList = '';
    let apiInstance = new missionClient.ConfigApi();
    let opts = {
        'authorization': getURLParams('token') // String | token字串
    };
    apiInstance.getConfigAll(opts).then(function (data) {
        console.log('请求成功: ', data);
        tableCombox = data.d;
        if (Array.isArray(data.d)) {
            for (let obj of data.d) {
                if (obj.hasOwnProperty('label')) {
                    dropdownMenuList += `<li><div>${ obj.label }</div></li>`;
                }
            }
        }
        flatternDropdown();

    }, function (error) {
        console.log('请求失败！', error);
        //alert('数据请求失败！');
    });

    // if(Object.keys(types).length){
    //     for (let key of Object.keys(types)) {
    //         dropdownMenuList += `<li><div data-key="${ key }">${ types[key] }(${ key })</div></li>`;
    //     }
    // }
    //数据可状态信息的存储
    //$('.input-body-json').data();
    let isInputSubmit = true;

    // let clock = oQueryContainer.find('.current-time').FlipClock({
    //     clockFace: 'TwentyFourHourClock'
    // });
    //oQueryContainer.find('.current-time span').text(new Date().toLocaleString());

    //删除子分组
    $(document).on('click', '.delete-panel', function (e) {
        let that = $(e.target);

        that.parent().parent().parent().remove();

        if ($('.input-body-json').children().length === 0) {
            inputBody.html($('#add_template').html()).find('.group-label').remove();
        }

    });
    //添加子分组
    $(document).on('click', '.add-panel', function (e) {
        let that = $(e.target),
            oPanelBody = that.parent().parent();
        if (oPanelBody.children()) {}
        oPanelBody.append(htmlPanel);

        flatternDropdown();

    });
    //添加子末端
    $(document).on('click', '.add-query', function (e) {
        let that = $(e.target);
        // let cloneHtml = that.parents('.input-item').clone(true);
        let inputsHtml = $(htmlPanel).find('.inputs').clone(true);
        // console.log('inputsHtml', inputsHtml);
        that.parent().parent().append(inputsHtml);
        // cloneHtml.find('input:last').val('');
        // that.parents('.inputs').append(cloneHtml);

        flatternDropdown();

    });
    //删除子末端
    $(document).on('click', '.input-delete', function (e) {
        let that = $(e.target),
            oInputItems = that.parents('.input-item');
        let topParent = oInputItems.parent().parent().parent().parent();
        if (topParent.hasClass('input-body-json') && oInputItems.parent().siblings()) {
            oInputItems.remove();
            return false;
        }
        console.log('元素：', oInputItems.parent().siblings().filter('.inputs,.panel'));
        if (oInputItems.parent().siblings().filter('.inputs,.panel').length == 0) {
            oInputItems.parent().parent().parent().remove();
        } else {
            oInputItems.parent().remove();
        }
        //let panelBody = that.parents('.panel-body');
        //console.log(oInputItems.parent().parent());
        // panelBody.each(function () {
        //     let children = $(this).children().filter('.inputs,.panel');
        //     if (!children.length) {
        //         this.parent().remove();
        //     }
        // });
        //findParentEmpty(oInputItems.parent().parent());
        // if($('.input-body-json').children().length === 0){
        //     inputBody.html($('#add_template').html()).find('.group-label').remove();
        // }

    });

    // function findParentEmpty(ele) {
    //     //ele为jq对象 panel-body
    //     console.log('ele: ',ele);
    //     if (ele && ele.length) {
    //         let panelBody = ele;
    //         let prePanelBody = panelBody.parent();
    //         if (!panelBody.children().filter('.inputs,.panel').length) {
    //             panelBody.parent().remove()
    //         }
    //         if (prePanelBody.hasClass('panel-body')) {
    //             findParentEmpty(prePanelBody);
    //         }
    //     }
    // }
    //下拉框点击事件
    $(document).on('click', '#query_container .dropdown-menu li', function (e) {
        let that = $(e.target),
            oInput = that.parents('.input-group-btn').next(),
            desInput = that.parents('.input-group-btn').prev();

        that.parents('.dropdown-menu').next().show().text(that.text());
        if (!desInput.val()) {
            desInput.val(that.text());
        }
        oInput.attr({
            placeholder: `请输入${ that.text() }的值`
        });
        desInput.attr({
            'data-key': that.text()
        });
        if (!$(this).parents('.input-group-btn').prev().val()) {
            $(this).parents('.input-group-btn').prev().focus();
        } else {
            oInput.removeAttr('disabled');
        }

        desValidate();

    });
    //提交按钮
    $('#submit_query').click(function () {

        let oSystemTitle = $('#system_title');
        let oSystemDes = $('#system_des');
        let id, name;

        if (location.pathname == "/") {
            id = mission.roomID;
            name = mission.roomName;
        } else {
            id = meetingInfo.id;
            name = meetingInfo.name;
        }

        let params;
        params = currentRightSelectedStandardObj;

        let key = {};
        for (k of Object.keys(params)) {
            if (k != "objectId" && k != "type" && k != "objectName") {
                key[k] = params[k];
            }
        }
        //console.log('customJson:',customJson);
        // return false;


        //console.log(infoInputOrTable);
        let info = {};
        let paramsArr = [];
        if (infoInputOrTable === 'input') {
            let htmlJson = {};
            let header = {};
            let customJson = {};
            parseHtmlToJson(oQueryContainer.find('.body.input-body-json').children(), htmlJson, header);

            customJson.header = header;
            customJson.data = htmlJson;

            if (!isInputSubmit) return false;
            info = customJson;
            console.log('customJson:', customJson);
        } else if (infoInputOrTable === 'table') {
            //表格提示信息
            console.log(infoInputOrTable);
            let container = $('#table-content');
            let table = container.find('.table-custom-ajax').eq(0);
            let hot = table.handsontable('getInstance');
            submitJsonData = container.data('tableJsonData');
            if (hot) {
                if (table.data('isDesEmpty')) {
                    alert('描述行为主键行，不能为空！');
                    return false;
                }
                if (table.data('isTypeEmpty')) {
                    alert('type行为系统识别字段，不能为空！');
                    return false;
                }
                if (table.data('isRepeat')) {
                    alert('描述行为主键行，不能重复！');
                    return false;
                }
                if (table.data('isComboxRowRepeat')) {
                    alert('主键相同，type必须相同！');
                    return false;
                }
                //submitJsonData = $('#table-content').data('tableJsonData');
                if (!submitJsonData) {
                    alert('发送数据不能为空！');
                    return false;
                }
            }
            info = submitJsonData;
        }
        // paramsArr.push(params);
        /*let paramasObj = {};
         paramasObj.from = [];
         paramasObj.id = Object.keys(params)[0];
         let fromObj = {};
         fromObj.id = Object.keys(params)[0];
         fromObj.value = params[Object.keys(params)[0]];
         fromObj.objectID = rightClickobjectID;
         fromObj.objectType = 'customobject';
         paramasObj.from.push(fromObj);
         paramsArr.push(paramasObj);*/
        params = params.from || params;
        console.log(params);
        for (let key in params) {
            let paramasObj = {};
            paramasObj.from = [];
            paramasObj.id = key;
            if(Array.isArray(params[key])) {
                for(let p of params[key]) {
                    let fromObj = {};
                    fromObj.id = key;
                    fromObj.value = p;
                    fromObj.objectID = currentRightSelectedStandardObj.oid || rightClickobjectID;
                    fromObj.objectType = 'customobject';
                    paramasObj.from.push(fromObj);
                }
                paramsArr.push(paramasObj);
            }else {
                let fromObj = {};
                fromObj.id = key;
                fromObj.value = params[key];
                fromObj.objectID = currentRightSelectedStandardObj.oid || rightClickobjectID;
                fromObj.objectType = 'customobject';
                paramasObj.from.push(fromObj);
                paramsArr.push(paramasObj);
            }
        }


        console.log(paramsArr)

        //提交
        let apiInstance = new missionClient.EventApi();
        let mID = id;
        let opts = {
            'authorization': getURLParams('token') // String | token字串
        };
        let eventInfo = {
            sysTitle: (oSystemTitle.val() ? oSystemTitle.val() : '人工业务分析'),
            actionDesc: (oSystemDes.val() ? oSystemDes.val() : '人工业务描述'),
            params: paramsArr,
            result: info,
        };
        console.log('mId:', id);
        console.log('objectID:', rightClickobjectID);
        console.log('eventInfo:', eventInfo);
        console.log('提交的数据:', info);
        // return;
        apiInstance.postCustomEvent(mID, eventInfo, opts).then(function (data) {
            //console.log('数据发送成功: ', data);
            oQueryContainer.find('.body>.panel>.panel-body>.panel').remove();
            oQueryContainer.find('.input-item').remove();
            oQueryContainer.find('.inputs').append($('#input_template').html());
            $('#system_title').val('');
            $('#system_des').val('');
            flatternDropdown();
            oQueryContainer.find('#cancel_query').click();
            getData(mID);
            //初始化
            //$('#table-input-toggle').html('表单展示').trigger('click');
        }, function (error) {
            alert('数据发送失败！');
            console.log('数据发送失败！', error);
        });

    });

    //退出按钮
    $('#cancel_query').click(function () {
        oQueryContainer.find('.body>.panel>.panel-body>.panel').remove();
        oQueryContainer.find('.input-item').remove();
        oQueryContainer.find('.inputs').append($('#input_template').html());
        $('#system_title').val('');
        $('#system_des').val('');
        flatternDropdown();
        oQueryContainer.find('.content-box').velocity('transition.shrinkOut', { complete: function (ele) {
            oQueryContainer.hide();
        } });
        let delButton = oQueryContainer.find('.input-body-json').children('.panel').eq(0).children().children('.buttons').children('button:last');
        //初始化
        $('#table-input-toggle').html('表单展示').click();
        delButton.click();

    });
    //描述输入框的blur事件
    $(document).on('blur','#query_container .input-body-json input.custom-description',function(){
        // let desInputs = $(this).parents('.input-body-json').find('input.custom-description').not(this);
        // let currTypeBox = $(this).next().children('.shidden').eq(0);
        // for(let desInput of desInputs){
        //     if($(this).val() && $(desInput).val() === $(this).val()){
        //         let hKey = $(desInput).next().children('.shidden').eq(0).text();
        //         let htmlLis = `<li><div>${ hKey }</div></li>`;
        //         $(this).next().children('.dropdown-menu').html(htmlLis);
        //         let newHKey = currTypeBox.text();
        //         if(hKey && newHKey.length && newHKey !== hKey){
        //             currTypeBox.addClass('btn-danger');
        //             isInputSubmit = false; //是否提交判定条件
        //         }
        //     }else{
        //         if($(this).next().children('.dropdown-menu').length <= 1) {
        //             //$(this).next().children('.dropdown-menu').html(dropdownMenuList);
        //         }
        //     }
        // }
        desValidate();

    });
    //描述框添加keyup事件
    $(document).on('keyup', '#query_container .input-body-json input.custom-description', function () {
        let currTypeBox = $(this).next().children('.shidden').eq(0);
        if ($(this).val() && currTypeBox.text()) {
            $(this).siblings('input').removeAttr('disabled');
        } else {
            $(this).siblings('input').attr('disabled', 'disabled');
        }
        if (currTypeBox.hasClass('btn-danger')) {
            currTypeBox.removeClass('btn-danger');
        }
    });
    //类型下拉框点击事件
    $(document).on('click', '#query_container .input-body-json .input-group-btn button.dropdown-toggle', function () {

        desValidate();


    });
    //分组输入框keyup事件
    $(document).on('keyup', '#query_container .input-body-json input', function () {
        let value = $(this).val();
        if (value) {
            $(this).removeClass('has-error');
            isInputSubmit = true; //是否提交判定条件
        }
    });
    //分组输入框blur事件 判定同级key是否相同
    $(document).on('blur', '#query_container .input-body-json .group-label input', function () {
        desValidate();
        validateSiblingKey(this);
    });
    function desValidate() {
        let desInputs = $('.input-body-json').find('input.custom-description');
        let desArr = $.makeArray(desInputs.map(function () {
            return $(this).val();
        }));
        let typesBtn = desInputs.next().children('.shidden');
        typeArr = $.makeArray(typesBtn.map(function () {
            return $(this).text();
        }));

        console.log(desArr, typeArr);
        desArr.forEach(function (value, index, arr) {
            let currType = typeArr[index];
            let currTypeBtn = typesBtn.eq(index);
            let desArr2 = arr.filter(function (value2, index2) {
                return index2 !== index;
            });
            let desInputsArr2 = $.makeArray(desInputs).filter(function (input, index2) {
                return index2 !== index;
            });
            let typeArr2 = typeArr.filter(function (value2, index2) {
                return index2 !== index;
            });
            let typesBtnArr2 = $.makeArray(typesBtn).filter(function (input, index2) {
                return index2 !== index;
            });
            let htmlList = '';
            let sameCount1 = 0;
            let sameCount2 = 0;
            let sameType = [];
            desArr2.forEach(function(value2,index2){
                if(value && value === value2){
                    sameCount1++;
                    if(currType && typeArr2[index2] && currType !== typeArr2[index2]){
                        if(!currTypeBtn.hasClass('btn-danger')){
                            currTypeBtn.addClass('btn-danger');
                            isInputSubmit = false;
                        }

                    }else{
                        sameCount2++;
                    }
                    if(typeArr2[index2] && currType !== typeArr2[index2]){
                        if(!sameType.includes(typeArr2[index2])){
                            sameType.push(typeArr2[index2]);

                            htmlList += `<li><div>${ typeArr2[index2] }</div></li>`;

                        }
                    }
                }
            });
            if(htmlList){
                currTypeBtn.prev().html(htmlList);
            }else{
                currTypeBtn.prev().html(dropdownMenuList);
            }

            if(sameCount1 && sameCount1 === sameCount2){
                if(currTypeBtn.hasClass('btn-danger')){
                    currTypeBtn.removeClass('btn-danger');
                    isInputSubmit = true;
                }
            }
            //console.log(desInputsArr2);
            // if (arr2.includes(value) && value !== '' && value !== null) {
            //     input.addClass('has-error');
            //     isInputSubmit = false;
            // } else {
            //     input.removeClass('has-error');
            // }
        });
    }
    function validateSiblingKey(sibling){
        let siblingKeys = $(sibling).parent().parent().parent().parent().children('.panel');
        let siblingDesKeys = $(sibling).parent().parent().parent().parent().children('.inputs').find('.custom-description');
        let keys = siblingKeys.find('.group-label input').map(function(){
            return $(this).val();
        });
        let desKeys = siblingDesKeys.map(function(){
            return $(this).val();
        });
        console.log(desKeys);
        $.makeArray(keys).forEach(function (value, index, arr) {
            console.log(arguments);
            let input = siblingKeys.eq(index).find('.group-label input');
            let arr2 = arr.filter(function (value2, index2) {
                return index2 !== index;
            });
            if (arr2.includes(value) || $.makeArray(desKeys).includes(value) && value !== '' && value !== null) {
                input.addClass('has-error');
                isInputSubmit = false;
            } else {
                input.removeClass('has-error');
            }
        });

    }

    //下拉框的生成
    function flatternDropdown() {
        oQueryContainer.find('.body .dropdown-menu').html(dropdownMenuList);
    }

    //判断单值还是数组
    function valueConvertArray(object, key, value) {
        if ($.isPlainObject(object)) {
            if(object.hasOwnProperty(key)){
                if(object[key] instanceof Array){
                    object[key].push(value);
                }else{
                    object[key] = [object[key], value];
                }
            }else{
                object[key] = value;
            }
        }

    }

    function parseHtmlToJson(childs, json, header) {

        if (childs.length) {
            for (let i = 0; i < childs.length; i++) {
                let child = childs.eq(i),
                    oInputs = child.children('.panel-body').children('.inputs').find('input.custom-value'); //value值
                let desInputs = child.children('.panel-body').children('.inputs').find('input.custom-description'); //value值
                let childLabel = child.children('.panel-body').children('.group-label');
                let currLabel = '';

                if (childLabel.length) {
                    currLabel = childLabel.children('input').eq(0).val();
                    let allInInputs = child.find('input');
                    let b = false;
                    allInInputs.each(function () {
                        if($(this).val()){
                            b = true;
                        }
                    });
                    if (b && !currLabel) {
                        childLabel.children('input').eq(0).addClass('has-error').focus();
                        isInputSubmit = false; //是否提交判定条件
                        return false;
                    }else if (b){
                        childLabel.children('input').eq(0).removeClass('has-error')
                    }

                    if (currLabel) {
                        let siDesInputs = child.siblings('.inputs').find('input.custom-description');
                        siDesInputs.each(function (index,ele) {
                            if ($(this).val() == currLabel) {
                                $(this).addClass('has-error');
                                childLabel.children('input').eq(0).addClass('has-error');
                                isInputSubmit = false; //是否提交判定条件
                                return false;
                            }else{
                                $(this).removeClass('has-error');
                                childLabel.children('input').eq(0).removeClass('has-error');
                            }
                        });
                    }

                }
                for (let j = 0; j < oInputs.length; j++) {
                    let hKey = desInputs.eq(j).attr('data-key'),
                        value = oInputs.eq(j).val();
                    let key = desInputs.eq(j).val();

                    if(!header.hasOwnProperty(key)){
                        let oKey = tableCombox.find(function (val) {
                            return val.label === hKey;
                        });
                        header[key] = oKey ? oKey.id : hKey;
                    }
                    if (key && key.length && value && value.length) {
                        if (currLabel) {
                            if (!json.hasOwnProperty(currLabel)) json[currLabel] = {};
                            valueConvertArray(json[currLabel], key, value);
                        }else{
                            valueConvertArray(json, key, value);
                        }

                    }else if(key.length === 0){
                        desInputs.eq(j).addClass('has-error').focus();
                        isInputSubmit = false; //是否提交判定条件
                        return false;
                    }else if(value.length === 0){
                        oInputs.eq(j).addClass('has-error').focus();
                        isInputSubmit = false; //是否提交判定条件
                        return false;
                    }
                }
                //let label = childLabel.children('input').eq(0).val();
                let sunPanels = child.children('.panel-body').children('.panel');
                if (sunPanels.length) {
                    if (currLabel) {
                        if (!json.hasOwnProperty(currLabel)) json[currLabel] = {};
                        parseHtmlToJson(sunPanels, json[currLabel], header);
                    }else{
                        parseHtmlToJson(sunPanels, json, header);
                    }

                }
            }
        }

        return json;
    }

//创建表格
    let oContentBox = $('.content-box .body').addClass('input-body-json');
    let oTables = $('<div class="body table-body-json" style="display: none;">').append($('#tables-input').html()).insertAfter(oContentBox[0]);

    let submitJsonData, tableDataExport;
    let infoInputOrTable = 'input';
    let tableBody = $('.table-body-json');
    let inputBody = $('.input-body-json');

    let tableInputToggle = $('#table-input-toggle');
    tableInputToggle.click(function () {
        if ($(this).html() == '表格展示') {
            $(this).html('表单展示');
            infoInputOrTable = 'table';
            inputBody.hide();
            tableBody.show();
            inputBody.html($('#add_template').html()).find('.group-label').remove();
            if (tableBody.find('.table-custom-json').length > 0) return;
            getInitTableData();
            //creatBlackTable();

        } else {
            $(this).html('表格展示');
            infoInputOrTable = 'input';
            inputBody.show();
            tableBody.hide();
            tableBody.html($('#tables-input').html());
            flatternDropdown();
        }
    });


    $(document).on('click', '#table-toggle', function () {
        $(this).next().toggle();
    });

    $(document).on('click', '.dropdown-menu-table li', function () {
        let text = $(this).text();
        let type = $(this).attr('type');
        $(this).parent().hide();
        if(type === 'exportCSV') return;
        $('#table-btn').text(text).attr('data-action', type);
        if (type === 'creatBlackTable') {
            // creatBlackTable();
            getInitTableData();
        }
        if (type === 'introCSV') {
            introCSV();
        }
        if (type === 'introJson') {
            introJson();
        }
    });

//下拉按钮组
    $(document).on('click', '#table-btn', function () {
        let action = $(this).attr('data-action');
        if (action === 'creatBlackTable') {
            // creatBlackTable();
            getInitTableData();
        }
        if (action === 'introCSV') {
            introCSV();
        }
        if (action === 'introJson') {
            introJson();
        }
    });
//ESC取消键
    $(document).keyup(function (e) {
        if (e.keyCode === 27 && $("#query_container").is(":visible")) {
            $('#cancel_query').trigger('click');
        }
    });

    $(document).click(function () {
        $('#table-toggle').next().hide();
    });
//表格加载时ajax请求表格头数据
    function getInitTableData() {
        let apiInstance = new missionClient.ConfigApi();
        let opts = {
            'authorization': getURLParams('token') // String | token字串
        };

        apiInstance.getConfigAll(opts).then(function (data) {
            console.log('请求成功: ', data);
            creatComboxTable(data.d);
            tableCombox = data.d;
        }, function (error) {
            console.log('请求失败！', error);
            alert('数据请求失败！');
        });
    }

//取出系统到文件的隐藏字段
    function removeCustomTail(csvString) {
        let resString = "";
        let relationMap = {};
        let x = csvString.split('\n');
        for(let l of x){
            if(l!==""){
                let i = l.indexOf('=N\(\"');
                if (i != -1) {
                    let idx = csvString.indexOf('=N\(\"');
                    e = l.lastIndexOf('\"');
                    try{
                        relationMap = JSON.parse(l.substring(i+4, e).replace(/'/g, "\"").replace(/\|/g, "\,"));
                    } catch(e) {
                        console.log(e)
                    }
                } else {
                    resString += l + "\n"
                }
            }
        }
        //console.log(relationMap,resString);

        return [relationMap,resString]
    }

//导入csv文件
    function introCSV() {
        let inputFile = $('.table-body-json .table-header .input-file');
        inputFile.fileupload({
            //dataType: 'json',
            add: function (e, data) {
                $.each(data.files, function (index, file) {
                    let reader = new FileReader();//新建一个FileReader
                    reader.readAsText(file, "UTF-8");//读取文件
                    reader.onload = function (evt) { //读取完文件之后会回来这里
                        let fileString = evt.target.result;
                        let res = removeCustomTail(fileString);
                        //console.log('csv文件转化1：',fileString, res);
                        if(res[1] !== ""){
                            fileString = res[1];
                            //console.log('format: ',res[0]);
                            //发送Res[0]到丁，获取每一列的format，生成combox并选中对应的format
                        }
                        //console.log('csv文件转化2：',fileString, res);
                        let csvToJson = Papa.parse(fileString, {header: true});
                        let tableDataArr = Papa.parse(fileString);
                        //console.log('csv文件转化2：', tableDataArr);
                        if (file.name.split('.').pop() !== 'csv') {
                            alert('请导入csv格式文件');
                            return;
                        }
                        // console.log('导入的json格式为：',evt.target.result);
                        // console.log('fileString：',fileString);
                        // console.log('tableDataArr：',tableDataArr);
                        if (Array.isArray(tableDataArr.data)) creatBlackTable(tableDataArr.data, res[0]);
                        //将初始化的数据
                        let json = {};
                        // console.log('csvToJson:',csvToJson);
                        if (!Array.isArray(csvToJson.data)) return false;
                        for (let i = 0; i < csvToJson.data.length; i++) {
                            for (let p in csvToJson.data[i]) {
                                if (!json.hasOwnProperty(p)) {
                                    json[p] = [];
                                }
                                json[p][i] = csvToJson.data[i][p];
                            }
                        }
                        //submitJsonData = json;
                    }

                });
            },
            done: function (e, data) {
                //alert('上传成功！');
            },
            fail: function (e, data) {
                // alert('上传失败！');
            }
        });
        inputFile.trigger('click');
    }

//导入json文件
    function introJson() {
        let inputFile = $('.table-body-json .table-header .input-file');
        inputFile.fileupload({
            add: function (e, data) {
                $.each(data.files, function (index, file) {
                    let reader = new FileReader();//新建一个FileReader
                    reader.readAsText(file, "UTF-8");//读取文件
                    reader.onload = function (evt) { //读取完文件之后会回来这里
                        let fileString = evt.target.result;
                        try {
                            let jsonData = JSON.parse(fileString);
                            if (jsonData && jsonData instanceof Object) tableShow(jsonData);

                        } catch (e) {
                            console.log(e);
                            alert('请导入json格式文件！');
                            //swal('请导入json格式文件！','','error');
                        }

                    }
                });
            }
        });
        inputFile.trigger('click');
    }

//将json数据用表格展示
    function tableShow(jsonData) {
        tableDataExport = '';
        submitJsonData = '';
        let tableContainer = $('#table-content');
        tableContainer.next('.table-footer').hide();
        tableContainer.prev('.table-header').find('.dropdown-menu-table').children(':last').html('导出Json文件');
        let setting = {
            //data: data0,
            // manualColumnResize: true, //改变列宽度
            // manualColumnMove: true,  //移动列
            // manualRowResize: true,  //改变列宽度
            // manualRowMove: true,
            // comments: true,
            minRows: 6,
            stretchH: 'all',
            minSpareRows: 1,
            fillHandle: false,
            margeCells: true,
            mergeCells: [],
            undo: false,
            currentRowClassName: 'currentRow',
            currentColClassName: 'currentCol',

            contextMenu: {
                callback: function (key, option) {
                    console.log('右键菜单：',arguments);
                },
                items: {
                    'row_above': {
                        disabled: function () {
                            //if first row, disable this option
                            return (this.getSelected() && this.getSelected()[0] === 0 || this.getSelected()[0] === 1 || this.getSelected()[2] === 0 || this.getSelected()[2] === 1);
                        }
                    },
                    "row_below": {
                        disabled: function () {
                            //if first row, disable this option
                            return (this.getSelected() && this.getSelected()[0] === 0 || this.getSelected()[0] === 1 || this.getSelected()[2] === 0 || this.getSelected()[2] === 1);
                        }
                    },
                    "hsep1": "---------",
                    "col_left": {},
                    "col_right": {},
                    "hsep2": "---------",
                    "remove_row": {
                        disabled: function () {
                            //if first row, disable this option
                            if (hotOne) return (this.getSelected() && this.getSelected()[0] !== this.getSelected()[2] || this.getSelected()[0] === 0 || this.getSelected()[0] === 1 || this.getSelected()[2] === 0 || this.getSelected()[2] === 1);
                            return (this.getSelected() && this.getSelected()[0] === 0 || this.getSelected()[0] === 1 || this.getSelected()[2] === 0 || this.getSelected()[2] === 1);
                        }
                    },
                    "remove_col": {
                        disabled: function () {
                            //if first row, disable this option
                            let merge = this.mergeCells.mergedCellInfoCollection;
                            let colArr = merge.map(function (valObj) {
                                return valObj.col;
                            });
                            let selected = this.getSelected();
                            if (hotOne) return true;
                            return (selected && colArr.length && colArr.some(function (val) {
                                return Math.min(selected[1], selected[3]) <= val && val <= Math.max(selected[1], selected[3]);
                            }));
                        }
                    },
                    "hsep3": "---------",
                    "alignment": {}
                }
            },
            cells: function (row, col, prop) {  //表格渲染
                let cellProperties = {};
                if (row === 0) {
                    cellProperties.renderer = firstRowRenderer;
                }
                else if (row === 1) {
                    cellProperties.renderer = comboxRowRenderer;
                }
                else {
                    cellProperties.renderer = otherRowsRenderer;//调用自定义渲染方法
                }
                return cellProperties;
            },
            afterLoadData: function (firstTime) {
                console.log('afterLoadData:',arguments);
                if (hot.length) tableHotsValidate();
                if (hotOne) hotOneDataToJson();
            },
            afterChange: function (change, source) {  //单元格数据变化之后 change是一个数组，row,col,初始值，改变后的值
                console.log('单元格数据变化之后',arguments);
                if ((source == 'edit' || source == 'CopyPaste.paste')) {

                    if (hot.length) {
                        tableHotsValidate();
                    }
                    if (hotOne) {
                        hotOneDataToJson();
                    }
                }

            },
            afterSelectionEnd: function (r, c, r2, c2) {

                if (r === r2 && c === c2) {
                    let key = this.getDataAtCell(0, c);
                    let markCell = this.table.accessKey + '#' + key + '#' + (r - 2);
                    if (markArr.hasOwnProperty(markCell)) {
                        let color = markArr[markCell];
                        if (Array.isArray(hot)) {
                            for (let core of hot) {
                                if (markArr.hasOwnProperty(core.table.accessKey) && (markArr[core.table.accessKey] == color)) {
                                    $(core.rootElement).css({"border": "1px solid red"});
                                    let scrollTop = $(core.rootElement).offset().top - $(core.rootElement).parent().offset().top;
                                    $('#query_container').find('.table-body-json').scrollTop(scrollTop);
                                    //$('#query_container').find('.table-body-json').velocity("scroll", { duration: 500, easing: "easeOutQuart" }).scrollTop(scrollTop);
                                    //$(core.rootElement).velocity("scroll", { container: $('#query_container').find('.table-body-json') });
                                    //滚动条动画

                                } else {
                                    $(core.rootElement).css({"border": "none"});
                                }
                            }
                        }

                    } else {
                        if (Array.isArray(hot)) {
                            for (let core of hot) {
                                $(core.rootElement).css({"border": "none"});
                                $(this.rootElement).css({"border": "1px solid red"});
                            }
                        }
                    }
                }
                desRowValidate(this);
            },
            afterCreateRow: function (row, col, source) {
                console.log('afterCreateRow: ', arguments);
                if (hotOne) {
                    (function (i) {
                        let mergeCells = hotOne.mergeCells.mergedCellInfoCollection;

                        if (source === 'ContextMenu.rowBelow') {  //向下添加行
                            let mergeCell = mergeCells.getInfo(i - 1, 0);
                            if (mergeCell) {
                                //console.log('添加新行 true：',i);
                                mergeCells.setInfo({ row: mergeCell.row, col: 0, rowspan: mergeCell.rowspan + 1, colspan: 1 })
                            }else{
                                //console.log('添加新行 false：',i);
                            }
                        }else if (source === 'ContextMenu.rowAbove') {
                            let mergeCell = mergeCells.getInfo(i, 0);
                            if (mergeCell) {
                                //console.log('添加新行 true：',i);
                                mergeCells.setInfo({ row: mergeCell.row, col: 0, rowspan: mergeCell.rowspan + 1, colspan: 1 });
                            }else{
                                //console.log('添加新行 false：',i);
                                let mergeCell = mergeCells.getInfo(i + 1, 0);
                                if (mergeCell) {
                                    //console.log('获取数据： ', hotOne.getDataAtCell(i+1,0));
                                    mergeCell.row = mergeCell.row - 1;
                                    mergeCell.rowspan = mergeCell.rowspan + 1;
                                    hotOne.setDataAtCell(mergeCell.row, mergeCell.col,hotOne.getDataAtCell(i+1,0));
                                    //hotOne.render();
                                }
                            }
                        }
                    })(row)
                }
                if (Array.isArray(hot) && hot.length) {
                    let mergeCells = this.mergeCells.mergedCellInfoCollection;
                    let sourceData = this.getSourceData();
                    for (let cell of mergeCells) {
                        sourceData.forEach(function (valArr, index, arr) {
                            if (index >= row && (source === 'ContextMenu.rowBelow' || source === 'ContextMenu.rowAbove')) {
                                valArr[cell.col] = (index + 1) === arr.length ? null : arr[index + 1][cell.col];
                            }
                            if (source === 'auto' && afterRemoveRowSaveData[index][cell.col]) {
                                valArr[cell.col] = afterRemoveRowSaveData[index][cell.col];
                            }
                        });
                    }
                    tableHotsValidate();
                }
            },
            afterCreateCol: function () {
                let _this = this;
                setTimeout(function () {
                    _this.render();
                },0);
            },
            beforeRemoveRow: function (startRow, amount, logicalRows) {
                afterRemoveRowSaveData = this.getData();
                console.log('afterRemoveRowSaveData', afterRemoveRowSaveData);
                for (let row of logicalRows) {
                    afterRemoveRowSaveData[row] = this.getDataAtRow(row);
                }

                if (hotOne) {
                    let mergeCells = hotOne.mergeCells.mergedCellInfoCollection;
                    let removeRowInfo = mergeCells.getInfo(startRow, 0);
                    if (removeRowInfo.row === startRow) {
                        let cellData = hotOne.getDataAtCell(startRow, 0);
                        removeRowInfo.row = removeRowInfo.row + 1;
                        removeRowInfo.rowspan = removeRowInfo.rowspan - 1;
                        hotOne.setDataAtCell(removeRowInfo.row, 0, cellData);
                        if (removeRowInfo.rowspan === 0) {
                            mergeCells.removeInfo(removeRowInfo.row, 0);
                        }
                    }else{
                        removeRowInfo.rowspan = removeRowInfo.rowspan - 1;
                    }
                }

            },
            afterRemoveRow: function (row, amount, logicalRows) {
                console.log('beforeRemoveRow: ', arguments);
                if (Array.isArray(hot) && hot.length) {
                    let mergeCells = this.mergeCells.mergedCellInfoCollection;
                    let sourceData = this.getSourceData();
                    let minRow = Math.min.apply(Math, logicalRows);
                    console.log('afterRemoveRowSaveData', afterRemoveRowSaveData, minRow);
                    for (let cell of mergeCells) {
                        sourceData.forEach(function (valArr, index, arr) {
                            if (index >= minRow && afterRemoveRowSaveData[index][cell.col]) {
                                valArr[cell.col] = afterRemoveRowSaveData[index][cell.col];
                            }
                        });
                    }
                }

            },
            afterBeginEditing: function (row, col) {
                let input = this.getActiveEditor();
                if (row === 1) $(input.TEXTAREA).attr('readonly', 'readonly');
            }
        };

        //设置默认表头
        let headerCombox = tableCombox.map(function (value, index) {
            if (Object(value) === value) {
                return value.label;
            }
        });

        let hot = [];
        let hotOne;
        let tableDataMark = {};
        let hotMerge = {};
        let initMergeCells = [];
        let afterRemoveRowSaveData; //保存删除行时的数据
        // window.test1 = afterRemoveRowSaveData;
        // tableContainer.data('tables',hot);

        markArr = {}; //清理全局变量
        //tableContainer.find('.table-custom-ajax').velocity("transition.bounceRightOut", { stagger: 100, drag: true, backwards: true });
        if (typeof jsonData === 'object') {  //json数据输入
            tableContainer.html('');
            let data;
            let header;
            let route;

            if (isCustomArray(jsonData)) route = 'array-c';
            else route = 'object-c';
            if ($.isPlainObject(jsonData) && !$.isEmptyObject(jsonData)) {
                let keysArr = Object.keys(jsonData);
                if (keysArr.length === 2 && keysArr.includes('header') && keysArr.includes('data')) { //系统导出文件
                    header = jsonData.header;
                    if (isCustomArray(jsonData.data)) route = 'array-c';
                    else route = 'object-c';
                    jsonData = jsonData.data;
                }else route = 'object-c';  //不是系统导出json文件
            }

            function isCustomArray (json) {
                if (Array.isArray(json) && json.length) {
                    return json.every(function (value) {
                        return $.isPlainObject(value) && !$.isEmptyObject(value) && Object.values(value).every(function (val) {
                                return  !$.isPlainObject(val);
                            });
                    });
                }else{
                    return false;
                }
            }

            if (route === 'array-c') {
                customArrayObject();
            }
            if (route === 'object-c') {
                customObject();
            }

            function customArrayObject () {
                let tableJson = [];
                let tableHeader = {};
                tableHeader['Marge'] = 'Marge';
                for (let obj of jsonData) {
                    let keys = Object.keys(obj);
                    keys.forEach(function (value) {
                        if (!tableHeader.hasOwnProperty(value)) {
                            tableHeader[value] = value;
                        }
                    });
                    let values = Object.values(obj);
                    if (values.some(function (value) { return Array.isArray(value); })) {
                        let l;
                        values.forEach(function (value) {
                            if (Array.isArray(value)) {
                                if (!l || l < value.length) {
                                    l = value.length;
                                }
                            }
                        });

                        for (let i = 0; l && i < l; i++) {
                            let o = {};
                            for (let k in obj) {
                                if (Array.isArray(obj[k])) {
                                    if (obj[k][i]) {
                                        o[k] = obj[k][i];
                                    }else{
                                        o[k] = '';
                                    }
                                }else{
                                    o[k] = i > 0 ? '' : obj[k];
                                }
                            }
                            tableJson.push(o);
                        }
                        tableDataMark[tableJson.length - l] = tableJson.length;

                    }else{
                        tableJson.push(_.cloneDeep(obj));
                        tableDataMark[tableJson.length - 1] = tableJson.length;
                    }
                }

                tableJson.unshift(tableHeader);
                data = tableJson;

                let el = $('<div class="table-custom-ajax">');  //虚拟dom
                el.appendTo(tableContainer);

                let defaultCombox = (function () {
                    let obj = _.cloneDeep(data[0]);
                    for (let key in obj) {
                        obj[key] = '其他';
                    }
                    return obj;
                })();
                if ($.isPlainObject(header) && !$.isEmptyObject(header)) {
                    for (let i in defaultCombox) {
                        if (header.hasOwnProperty(i)) {
                            defaultCombox[i] = tableCombox.find(function (value) {
                                return header[i] === value.id;
                            }).label;
                        }
                    }
                }
                data.splice(1,0,defaultCombox);
                //console.log('填充数据',data);
                setting.data = data;
                setting.height = function () {
                    return tableContainer.eq(0).height();
                };
                //console.log('settingData: ',setting.data);

                hotOne = new Handsontable(el[0], setting);

                //合并单元格
                initMergeCells = [
                    {row: 0, col: 0, rowspan: 2, colspan: 1}
                ];
                let index = 0;
                for (let row in tableDataMark) {
                    initMergeCells.push({
                        row: parseInt(row) + 2,
                        col: 0,
                        rowspan: tableDataMark[row] - row,
                        colspan: 1
                    });
                    index++;
                    hotOne.setDataAtCell((parseInt(row) + 2), 0, index)
                }
                hotOne.updateSettings({ mergeCells: initMergeCells });
                setTimeout(function () {
                    hotOne.render();
                },0);
            }

            function customObject () {
                data = flattenJsonToSheet(flatten(jsonData));
                for (let p in data) {
                    let el = $('<div class="table-custom-ajax" style="margin-bottom: 20px;">');  //虚拟dom
                    el.appendTo(tableContainer);
                    data[p].splice(1,0,_.fill(Array(data[p][0].length),'其他'));

                    if ($.isPlainObject(header) && !$.isEmptyObject(header)) {
                        for (let i = 0; i < data[p][0].length; i++) {
                            if (header.hasOwnProperty(data[p][0][i])) {
                                data[p][1][i] = tableCombox.find(function (value) {
                                    return header[data[p][0][i]] === value.id;
                                }).label;
                            }
                        }
                    }

                    setting.data = data[p];
                    el.handsontable(setting);
                    let hot1 = el.handsontable('getInstance');

                    hot1.updateSettings({height: function () {
                        return $(hot1.rootElement).find('table').eq(0).height() + 6;
                    },minRows: hot1.countRows()});
                    hot1.table.accessKey = p;
                    hot.push(hot1);
                    el.velocity("transition.bounceDownIn", {  drag: true, queue: 'hots' });
                    setTimeout(function () {
                        hot1.render();
                    },0);
                }
            }

            //合并单元格
            if (Array.isArray(hot) && hot.length) {
                setTimeout(function () {
                    for (let k in hotMerge) {
                        let h = hot.find(function (value) {
                            return value.table.accessKey === k;
                        });
                        if (h) {
                            if (Array.isArray(hotMerge[k])) {
                                let merge = [];
                                for (let m of hotMerge[k]) {
                                    merge.push({row: 0, col: m, rowspan: 2, colspan: 1});
                                }
                                h.updateSettings({mergeCells: merge});
                            }else{
                                h.updateSettings({mergeCells: [{row: 0, col: hotMerge[k], rowspan: 2, colspan: 1}]});
                            }
                        }
                    }
                },0);
            }

        }

        // window.hots = hot;
        // window.hot = hotOne;
        // window.m = hotMerge;
        //window.da = tableContainer.find('.table-custom-ajax').eq(0).data();
        //渲染完成 动画
        if (Array.isArray(hot) && hot.length) {
            //tableContainer.find('.table-custom-ajax').velocity("transition.bounceDownIn", {  drag: true, backwards: true, queue: 'hots' });
            setTimeout(function () {
                tableContainer.find('.table-custom-ajax').dequeue('hots');
            },100)
        }
        if (hotOne) {
            tableContainer.find('.table-custom-ajax').velocity("transition.bounceDownIn", { drag: true, queue: 'hot' });
            setTimeout(function () {
                tableContainer.find('.table-custom-ajax').dequeue('hot');
            },0);
        }



        function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            if (!$(td).hasClass('htPlaceholder')) $(td).css({
                'font-weight': 'bold',
                'color': 'white',
                'text-align': 'center',
                'vertical-align': 'middle'
            });
            else $(td).css({'text-align': 'center'});
            cellProperties.placeholder = '请添加描述(主键)';
            let color = markArr[instance.table.accessKey];
            if (Array.isArray(color)) {
                $(td).css({
                    'background-color': color[0]
                });
            }
            if (col === 0) {
                cellProperties.readOnly = true;
            }

        }

        function comboxRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
            if (!$(td).hasClass('htPlaceholder')) $(td).css({
                'font-weight': 'bold',
                'color': 'white',
                'text-align': 'center'
            });
            else $(td).css({'text-align': 'center'});
            cellProperties.placeholder = '请选择列头';
            if (cellProperties.type !== 'dropdown') {
                cellProperties.type = 'dropdown';
                cellProperties.source = headerCombox;
                cellProperties.validator = function (value, callback) {
                    callback(true);
                };
            }

        }

        //自定义渲染
        function otherRowsRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);

            if (markArr.hasOwnProperty(instance.table.accessKey)) {
                let color = markArr[instance.table.accessKey];
                $(instance.getCell(row, col)).css({'background-color': color[0], "color": "white"});
            }
            if (instance.table.accessKey) {
                let markTd = instance.table.accessKey + '#' + instance.getDataAtCell(0, col) + '#' + (row - 2);
                if (markArr.hasOwnProperty(markTd)) {
                    let color = markArr[markTd];
                    $(instance.getCell(row, col)).css({
                        "background-color": color[0],
                        "color": "white",
                        "text-align": "center"
                    });
                    cellProperties.customKey = 1;
                    if (!hotMerge.hasOwnProperty(instance.table.accessKey)) {
                        hotMerge[instance.table.accessKey] = col;
                    }else{
                        if (Array.isArray(hotMerge[instance.table.accessKey]) && !hotMerge[instance.table.accessKey].includes(col)) {
                            hotMerge[instance.table.accessKey].push(col);
                        } else if (!Array.isArray(hotMerge[instance.table.accessKey]) && col !== hotMerge[instance.table.accessKey]) {
                            let a = hotMerge[instance.table.accessKey];
                            hotMerge[instance.table.accessKey] = [a, col];
                        }
                    }
                }
                let colReadOnly = instance.table.accessKey + '#' + instance.getDataAtCell(0, col) + '#' + 0;
                if (markArr.hasOwnProperty(colReadOnly)) {
                    cellProperties.readOnly = true;
                }
            }
            if (hotOne) {
                //居中只读
                if (col === 0) {
                    $(td).css({
                        'text-align': 'center',
                        'vertical-align': 'middle'
                    });
                    cellProperties.readOnly = true;
                }
            }

        }
        //第一行描述行验证
        function desRowValidate(core) {
            let el = tableContainer.find('.table-custom-ajax').eq(0);

            let rowDes = core.getDataAtRow(0);
            rowDes.forEach(function (value, index, arr) {
                let td = core.getCell(0, index);
                let arr2 = arr.filter(function (value2, index2) {
                    return index2 !== index;
                });
                if (arr2.includes(value) && value !== '' && value !== null) {
                    $(td).addClass('htInvalid');
                    el.data('isRepeat', true);
                } else {
                    $(td).removeClass('htInvalid');
                }

                //判断为空
                let colData = core.getDataAtCol(index);
                colData.shift();
                colData.shift();
                let isColEmpty = colData.every(function (value, index) {
                    return value === null || value === '';
                });
                if (!isColEmpty && (value  === '' || value === null)) {
                    let cell = core.getCell(0, index);
                    $(cell).addClass('htInvalid-a');//.css('color','white');
                    el.data('isDesEmpty', true);
                }
                if (!isColEmpty && (core.getDataAtCell(1, index)  === '' || core.getDataAtCell(1, index) === null)) {
                    let cell = core.getCell(1, index);
                    $(cell).addClass('htInvalid-a');//.css('color','white');
                    el.data('isTypeEmpty', true);
                }

            });
            if (el.data('isRepeat') || el.eq(0).data('isDesEmpty') || el.data('isTypeEmpty')) return true;
        }
        //将表格数据转换成json数据  要依赖俩个全局变量hot  markArr
        function changeSouceData() {
            if (!Array.isArray(hot)) return;
            let json = {};
            let mark = [];
            for (let k in markArr) {
                if (k.indexOf('#') !== -1) {
                    let a = k.split('#');
                    a.pop();
                    mark.push(a.join('#'));
                }
            }

            for (let core of hot) {
                let data = core.getData();  //表数据 [[],[]...]
                let table = core.table.accessKey;

                for (let row = 2; row < data.length; row++) { //行

                    let l = data[row].length;
                    for (let i = 0; i < l; i++) { //列
                        let key = table + '.' + data[0][i] + '[' + (row - 2) + ']';
                        let key2 = table + '#' + data[0][i];
                        if (table === 'data0') {
                            key = data[0][i] + '[' + (row - 2) + ']';
                        }
                        if (!mark.includes(key2)) {
                            json[key] = data[row][i];
                        }
                    }

                }
            }

            let unflattenArr = unflatten(json);

            delnull(unflattenArr);

            return unflattenArr;
        }

        function hotOneDataToJson () {
            //状态值保存
            let el = tableContainer.find('.table-custom-ajax').eq(0);
            el.data('isRepeat', false);
            el.data('isDesEmpty', false);
            el.data('isTypeEmpty', false);
            if (desRowValidate(hotOne)) return false;
            if (hotOne) {
                //console.log(hotOne.mergeCells.mergedCellInfoCollection);
                let mergeCells = hotOne.mergeCells.mergedCellInfoCollection;
                let hotOneData = hotOne.getData();
                let desData = hotOneData[0];
                let comboxData = hotOneData[1];
                let resultData = [];
                //console.log(desData,comboxData);
                let cloneDesHeader = _.cloneDeep(desData);
                let cloneComboxHeader = _.cloneDeep(comboxData);
                cloneDesHeader.shift();
                cloneComboxHeader.shift();

                if (!comboxRowValidate(cloneComboxHeader)) return false;
                let header = comboxHeaderJson(cloneDesHeader,cloneComboxHeader);
                mergeCells = mergeCells.length === 0 ? initMergeCells : mergeCells;
                for (let mergeCell of mergeCells) {
                    if (mergeCell.row === 0) continue;
                    let obj = {};
                    for (let d = 1; d < desData.length; d++) {
                        let colArr = [];
                        for (let c = mergeCell.row; c < (mergeCell.rowspan + mergeCell.row); c++) {
                            colArr.push(hotOneData[c][d]);
                        }
                        for (let i = colArr.length - 1; i >= 0; i--) {
                            if (colArr[i] === null || colArr[i] === '' || colArr[i] === undefined) {
                                colArr.pop();
                            }else{
                                break;
                            }
                        }
                        if (!obj.hasOwnProperty(desData[d]) && colArr.length) {
                            obj[desData[d]] = colArr.length === 1 ? colArr[0] : colArr;
                        }
                    }
                    resultData.push(obj);
                }

                tableContainer.data('tableJsonData', {header: header, data: Array.isArray(resultData) ? {data: resultData} : resultData});
                tableContainer.data('tableDataExport', {data: resultData, header: header});//tableDataExport
                tableContainer.data('tableHeaderHash', header);
            }

        }

        function comboxHeaderJson (desHeader, comboxHeader) {
            let header = {};
            //console.log('第一行：', desHeader);
            //console.log('第二行：', comboxHeader);
            if (desHeader && comboxHeader && Array.isArray(desHeader) && Array.isArray(comboxHeader)) {
                for (let i = 0; i < desHeader.length; i++) {
                    if (!header.hasOwnProperty(desHeader[i])) {
                        header[desHeader[i]] = tableCombox.find(function (value) {
                            return value.label === comboxHeader[i];
                        }).id;
                    }else{
                        if (header[desHeader[i]] !== tableCombox.find(function (value) {return value.label === comboxHeader[i];}).id) {
                            console.log('主键相同，类型必须相同！');
                        }

                    }
                }
            }
            return header;
        }

        function comboxRowValidate (combox) {
            if (Array.isArray(combox)) {
                return combox.every(function (value) {
                    let b = value !== null && value !== '';
                    if (!b) tableContainer.find('.table-custom-ajax').eq(0).data('isComboxRow', false);
                    return b;
                })
            }
        }

        function tableHotsValidate () {
            if (Array.isArray(hot) && hot.length) {
                let headerArr = [];

                //状态值保存
                let el = tableContainer.find('.table-custom-ajax').eq(0);
                el.data('isRepeat', false);
                el.data('isDesEmpty', false);
                el.data('isTypeEmpty', false);
                el.data('isComboxRowRepeat', false);

                for (let i = 0; i < hot.length; i++) {

                    if (desRowValidate(hot[i])) return true;

                    let descArr = hot[i].getDataAtRow(0);
                    let combArr = hot[i].getDataAtRow(1);

                    descArr.forEach(function (value,index) {

                        if (value) {
                            let arr = [];
                            if (!hot[i].getCellMeta(2,index).hasOwnProperty("customKey")) {
                                arr.push(value);
                                let h = tableCombox.find(function (value) {return value.label === combArr[index];});
                                if (h) {
                                    arr.push(h.id);
                                }else{
                                    arr.push('');
                                    console.log('非系统字段！');
                                }
                                arr.instance = hot[i];
                                arr.col = index;
                                headerArr.push(arr);
                            }
                        }
                    });

                }
                //开始验证
                let labelAll = tableCombox.map(function (value) {
                    return value.label;
                });
                headerArr.forEach(function (value, index, arr) {
                    let td = value.instance.getCell(1, value.col);
                    let arr2 = arr.filter(function (value2, index2) {
                        return index2 !== index;
                    });
                    let arr3 = arr2.filter(function (value2, index2, arr2) {
                        return value2[0] === value[0] && value2[1] !== value[1];
                    });
                    if (arr3 && arr3.length) {
                        let newCombox = [];
                        arr3.forEach(function (value2, index2) {
                            let label = tableCombox.find(function (value3) {
                                return value2[1] === value3.id;
                            });
                            if (label && !newCombox.includes(label.label)) {
                                newCombox.push(label.label);
                            }
                        });
                        //console.log(newCombox);
                        value.instance.setCellMeta(1, value.col, 'source', newCombox.length === 0 ? headerCombox : newCombox);
                        $(td).addClass('htInvalid');
                        // tableContainer.data('isRepeat', true);
                        tableContainer.find('.table-custom-ajax').eq(0).data('isComboxRowRepeat', true);
                    } else {
                        $(td).removeClass('htInvalid');

                        if (value.instance.getCellMeta(1, value.col).source.length < labelAll.length) {
                            value.instance.setCellMeta(1, value.col, 'source', labelAll);
                        }
                    }
                });
                let result = {};
                //header
                result.header = {};
                for (let arr of headerArr) {
                    if (Array.isArray(arr)) {
                        if (!result.header.hasOwnProperty(arr[0])) {
                            result.header[arr[0]] = arr[1];
                        } else {
                            if (result.header[arr[0]] !== arr[1]) {
                                tableContainer.find('.table-custom-ajax').data('isComboxRow', false);
                                console.log('error:','主键相同，类型必须相同！');
                            }
                        }
                    }
                }
                //data
                result.data = changeSouceData();
                //数据存储
                tableContainer.data('tableJsonData',result);
                tableContainer.data('tableDataExport', {data: result.data, header: result.header});//tableDataExport
                tableContainer.data('tableHeaderHash',result.header);
            }
        }
    }

//创建空白表格
    function creatBlackTable(data, fields) {

        let container = $('#table-content');
        container.removeData();
        container.html('').next('.table-footer').html('').hide();
        container.prev('.table-header').find('.dropdown-menu-table').children(':last').html('导出csv文件');
        submitJsonData = '';

        let el = $('<div class="table-custom-ajax">');  //虚拟dom
        el.appendTo('#table-content');

        let setting = {
            startCols: 3,
            startRows: 20,
            minRows: 20,
            stretchH: 'all',
            colHeaders: true,
            fillHandle: false,
            undo: false,
            //manualColumnResize: true, //改变列宽度
            //manualColumnMove: true,  //移动列

            margeCells: true,
            mergeCells: [],
            currentRowClassName: 'currentRow',
            currentColClassName: 'currentCol',

            // fixedRowsTop: 2,
            contextMenu: {
                callback: function (key, option) {
                    //console.log(arguments);
                },
                items: {
                    'row_above': {
                        disabled: function () {
                            //if first row, disable this option
                            return (hot.getSelected() && hot.getSelected()[0] === 0 || hot.getSelected()[0] === 1);
                        }
                    },
                    "row_below": {
                        disabled: function () {
                            //if first row, disable this option
                            return (hot.getSelected() && hot.getSelected()[0] === 0);
                        }
                    },
                    "hsep1": "---------",
                    "col_left": {},
                    "col_right": {},
                    "hsep2": "---------",
                    "remove_row": {
                        disabled: function () {
                            //if first row, disable this option
                            return (hot.getSelected() && hot.getSelected()[0] === 0 || hot.getSelected()[0] === 1 || hot.getSelected()[2] === 0 || hot.getSelected()[2] === 1);
                        }
                    },
                    "remove_col": {},
                    // "hsep3": "---------",
                    // "undo": {},
                    // "redo": {},
                    "hsep4": "---------",
                    "alignment": {}
                }
            },
            cells: function (row, col, prop) {
                let cellProperties = {};
                if (row === 0) {
                    cellProperties.renderer = firstRowRenderer;
                }
                else if (row === 1) {
                    cellProperties.renderer = comboxRowRenderer;
                }
                // else{
                //     cellProperties.renderer = otherRowRenderer;
                // }
                return cellProperties;
            },
            beforePaste: function (data, coords) {
                //console.log('粘贴之前事件: ',arguments);
                let startRow = coords[0].startRow;
                let startCol = coords[0].startCol;
                let endRow = (startRow + data.length - 1) > coords[0].endRow ? (startRow + data.length - 1) : coords[0].endRow;
                let endCol = (startCol + data[0].length - 1) > coords[0].endCol ? (startCol + data[0].length - 1) : coords[0].endCol;
                if (startRow === 1) {
                    alert('combox行只可选，不能贴！');
                    return;
                }

                //description row and combox row don't accept paste option

                if (startRow <= 2) {

                    if (data.length > 1 && startRow === 0 || startRow === 1) { //在表头粘贴 粘贴数据存在多行时
                        //data.unshift([]);
                        data.forEach(function (value, row) {
                            value.forEach(function (value, col) {
                                if (startRow === 1) hot.setDataAtCell((startRow + 1 + row), (startCol + col), value);
                                if (startRow === 0) hot.setDataAtCell((startRow + 2 + row), (startCol + col), value);
                            })
                        });
                        return false;
                    }
                }
            },
            afterPaste: function (pasteData, coords) {
                console.log('粘贴结束事件：', arguments);
                let startRow = coords[0].startRow;
                let startCol = coords[0].startCol;
                let endRow = (startRow + pasteData.length - 1) > coords[0].endRow ? (startRow + pasteData.length - 1) : coords[0].endRow;
                let endCol = (startCol + pasteData[0].length - 1) > coords[0].endCol ? (startCol + pasteData[0].length - 1) : coords[0].endCol;

                let dataArr = hot.getData();

                let currIndex = currPageIndex * currPageSize;
                let addArr = [];

                data.splice(currIndex, currDelCount); //先删除

                for (let row = 2; row < dataArr.length; row++) {  //加入
                    if (!this.isEmptyRow(row)) {
                        addArr.push(dataArr[row]);
                    }
                }
                currDelCount = addArr.length;
                for (let i = 0; i < addArr.length; i++) {
                    data.splice(currIndex + i, 0, addArr[i]);
                }

                transformTableData();
            },
            afterChange: function (changes, source) {
                //console.log('afterChange',arguments);

                if (source !== 'edit') return;

                if (this.isEmptyCol(changes[0][1]) && this.getCellMeta(1, changes[0][1]).type === 'dropdown') { //删除处理
                    hot.setCellMetaObject(1, changes[0][1], {type: 'dropdown', source: headerCombox});
                }

                if (changes[0][0] === 1) { //第二行
                    let colDes = hot.getDataAtCell(0, changes[0][1]);
                    if (colDes === '' || colDes === null) {
                        hot.setDataAtCell(0, changes[0][1], changes[0][3]);
                    }
                }

                if (changes[0][0] > 2 && changes[0][2] !== changes[0][3]) {
                    let currIndex = currPageIndex * currPageSize + changes[0][0] - 2;
                    try {
                        //data[currIndex][changes[0][1]] = changes[0][3];
                    }catch (e) {
                        console.log(e);
                    }

                }

                transformTableData();

            },
            afterCreateCol: function (index, amount, source) {
                let l = hot.getDataAtRow(0).length;
                data.forEach(function (valArr) {
                    if (valArr.length !== l) {
                        valArr.splice(index, 0, null);
                    }
                });
                setTimeout(function () {
                    hot.render();
                },0);
            },
            afterRemoveCol: function (index, amount, source) {
                //console.log('afterRemoveCol: ', arguments);
                let l = hot.getDataAtRow(0).length;
                data.forEach(function (valArr) {
                    if (valArr.length !== l) {
                        valArr.splice(index, 1);
                    }
                });

                transformTableData();
            },
            afterRemoveRow: function (index, amount, source) {
                data.splice(index - 2, 1);
                transformTableData();
            },
            afterBeginEditing: function (row, col) {
                let input = hot.getActiveEditor();
                if (row === 1) $(input.TEXTAREA).attr('readonly', 'readonly');
            }
        };

        let isPagination = false;
        let currPageIndex = 0;
        let currPageSize = 18;
        let currDelCount = currPageSize;

        //设置默认表头
        let headerCombox = tableCombox.map(function (value, index) {
            if (Object(value) === value) {
                return value.label;
            }
        });
        if (data.length > currPageSize) { //让分页符占位
            container.next('.table-footer').show();
            //setting.height = container.height();
        }
        setting.height = container.height();
        //表格渲染
        el.handsontable(setting);
        let hot = el.handsontable('getInstance');
        el.velocity("transition.bounceDownIn", { drag: true, queue: 'hot' });
        setTimeout(function () {
            el.dequeue('hot');
        },0);
        //文件判断
        //console.log('csv文件导入：', fields);
        if (Object.keys(fields).length) { //是系统导出文件
            let desHeader = data.shift();
            let comboxHeader = data.shift();
            //console.log('系统导出文件');
            tablePagination(data, desHeader, comboxHeader)
        }
        else {
            swal({
                title: '导入的csv文件是否带有表头？',
                type: 'question',
                showCancelButton: true,
                cancelButtonText: '否',
                confirmButtonText: '是',
            }).then(function (result) {
                console.log('非系统导出文件，带有表头！');
                let desHeader = data.shift();
                tablePagination(data, desHeader, []);
            },function (dismiss) {
                console.log('非系统导出文件！');
                if (dismiss === 'cancel') {
                    console.log('不带有表头！');
                    tablePagination(data, [], []);
                }else{
                    $('.dropdown-menu-table li:first').trigger('click');
                }
            }).catch(swal.noop)

        }

        function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            if (!$(td).hasClass('htPlaceholder')) $(td).css({
                'font-weight': 'bold',
                'color': 'white',
                'text-align': 'center'
            });
            else $(td).css({'text-align': 'center'});
            cellProperties.placeholder = '请添加描述(主键)';
        }

        function comboxRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
            if (!$(td).hasClass('htPlaceholder')) $(td).css({
                'font-weight': 'bold',
                'color': 'white',
                'text-align': 'center'
            });
            else $(td).css({'text-align': 'center'});
            cellProperties.placeholder = '请选择列头';
            if (cellProperties.type !== 'dropdown') {
                cellProperties.type = 'dropdown';
                cellProperties.source = headerCombox;
                cellProperties.validator = function (value, callback) {
                    callback(true);
                };
            }
        }

        function tablePagination(data, desHeader, comboxHeader) {
            let currPageData = data.slice(0, currPageSize);
            console.log('currPageData:',currPageData);
            if (comboxHeader.length) { //有combox行
                currPageData.unshift(comboxHeader);
            }else{
                comboxHeader = _.fill(Array(data[0].length),'其他');
                currPageData.unshift(comboxHeader);
            }
            if (desHeader.length) { //描述行存在
                currPageData.unshift(desHeader);
            }else{
                desHeader = new Array(data[0].length);
                desHeader = desHeader.map(function () {
                    return '';
                });
                console.log('desHeader: ',desHeader);
                currPageData.unshift(desHeader);
            }
            //console.log('csv:',currPageData);
            hot.loadData(currPageData);
            transformTableData();
            //console.log('currPageData: ',currPageData);
            //combox判定
            let fields = [];
            for (let col = 0; col < data[0].length; col++){
                for (let row = 0; row < data.length; row++) {
                    if (data[row][col] !== '' && data[row][col] !== null) {
                        fields.push(data[row][col]);
                        break;
                    }
                }
            }
            let apiInstance = new missionClient.ConfigApi();
            //let fields = ["fields_example"]; // [String] | 字段内容列表
            let opts = {
                'authorization': getURLParams('token'), // String | token字串
            };
            apiInstance.getFieldType(fields, opts).then(function(aData) {
                console.log('combox判定：',aData);
                if($.isArray(aData.d)){
                    for(let oVal of aData.d){
                        if($.isArray(oVal.typeList)){
                            if (!oVal.typeList.length) return;
                            if(oVal.typeList.length === 1){
                                let index = fields.indexOf(oVal.field);
                                if (index === -1) return;
                                hot.setDataAtCell(1,fieldsCol[index],oVal.typeList[0].label);
                                hot.setCellMetaObject(1,fieldsCol[index],{type: 'dropdown', source: [oVal.typeList[0].label]});
                            }else{
                                let index = fields.indexOf(oVal.field);
                                let newCombox = oVal.typeList.map(function(value){
                                    return value.label;
                                });
                                if (index === -1) return;
                                hot.setCellMetaObject(1,fieldsCol[index],{type: 'dropdown', source: newCombox});
                                fields.splice(index, 1);
                                fieldsCol.splice(index, 1);
                            }
                        }
                    }

                }
            }, function(error) {
                console.log('combox判定失败！',error);
            });


            if (data.length > currPageSize) {  //要分页

                let pageEle = $('<div class="pagination">');
                $(pageEle).appendTo(container.next().eq(0));

                let paginationBt = BootstrapPagination(pageEle, {
                    layoutScheme: "lefttext,firstpage,prevgrouppage,prevpage,pagenumber,nextpage,nextgrouppage,lastpage,pageinput,righttext",
                    //记录总数。 //pagesizelist,设置当前显示数据条数
                    total: data.length,
                    //分页尺寸。指示每页最多显示的记录数量。
                    pageSize: 18,
                    //当前页索引编号。从其开始（从0开始）的整数。
                    pageIndex: 0,
                    //指示分页导航栏中最多显示的页索引数量。
                    pageGroupSize: 5,
                    //位于导航条左侧的输出信息格式化字符串
                    leftFormateString: "本页{count}条记录/共{total}条记录",
                    //位于导航条右侧的输出信息格式化字符串
                    rightFormateString: "第{pageNumber}页/共{totalPages}页",
                    //页码文本格式化字符串。
                    pageNumberFormateString: "{pageNumber}",
                    //分页尺寸输出格式化字符串
                    pageSizeListFormateString: "每页显示{pageSize}条记录",
                    //上一页导航按钮文本。
                    prevPageText: "上一页",
                    //下一页导航按钮文本。
                    nextPageText: "下一页",
                    //上一组分页导航按钮文本。
                    prevGroupPageText: "上一组",
                    //下一组分页导航按钮文本。
                    nextGroupPageText: "下一组",
                    //首页导航按钮文本。
                    firstPageText: "首页",
                    //尾页导航按钮文本。
                    lastPageText: "尾页",
                    //设置页码输入框中显示的提示文本。
                    pageInputPlaceholder: "GO",
                    //接受用户输入内容的延迟时间。单位：毫秒
                    pageInputTimeout: 800,
                    //分页尺寸列表。
                    pageSizeList: [18,19,20,21,22,23,24],
                    //当分页更改后引发此事件。
                    pageChanged: function (pageIndex, pageSize) {
                        currPageIndex = pageIndex;
                        currPageSize = pageSize;
                        currDelCount = pageSize;
                        let start = pageIndex * pageSize;
                        let end = (pageIndex + 1) * pageSize;
                        currPageData = data.slice(start, end);
                        currPageData.unshift(comboxHeader);
                        currPageData.unshift(desHeader);
                        hot.loadData(currPageData);
                        desRowValidate();
                    },
                });
            }

        }
        //第一行描述行验证
        function desRowValidate() {
            el.data('isRepeat', false);
            el.data('isDesEmpty', false);
            el.data('isTypeEmpty', false);
            let rowDes = hot.getDataAtRow(0);
            console.log('data: ', data);
            rowDes.forEach(function (value, index, arr) {
                let td = hot.getCell(0, index);
                let arr2 = arr.filter(function (value2, index2) {
                    return index2 !== index;
                });
                if (arr2.includes(value) && value !== '' && value !== null) {
                    $(td).addClass('htInvalid');
                    el.data('isRepeat', true);
                } else {
                    $(td).removeClass('htInvalid');
                }

                //判断为空
                let colData = hot.getDataAtCol(index);
                colData.shift();
                colData.shift();
                let isColEmpty = data.every(function (value) {
                    return value[index] === null || value[index] === '' || value[index] === undefined;
                });
                console.log(isColEmpty);
                if (!isColEmpty && (value  === '' || value === null)) {
                    let cell = hot.getCell(0, index);
                    $(cell).addClass('htInvalid-a');//.css('color','white');
                    el.data('isDesEmpty', true);
                }
                if (!isColEmpty && (hot.getDataAtCell(1, index)  === '' || hot.getDataAtCell(1, index) === null)) {
                    let cell = hot.getCell(1, index);
                    $(cell).addClass('htInvalid-a');//.css('color','white');
                    el.data('isTypeEmpty', true);
                }
            });

            if (el.data('isRepeat') || el.data('isDesEmpty') || el.data('isTypeEmpty')) return false;
        }
        //数据转换
        function transformTableData() { //将表格数据转化成json数据
            if (desRowValidate()) return false;
            //console.log('数据转换！');
            let secondRowData = hot.getDataAtRow(1);
            let firstRowData = hot.getDataAtRow(0);
            // let dataArr = {};
            let result = {
                header: {},
                data: {}
            };
            secondRowData.forEach(function (value, index, arr) {  //字段转换
                if (value) {
                    let colData = data.map(function (value1) {
                        return value1[index];
                    });

                    for (let i = colData.length - 1; i >= 0; i--) {
                        if (colData[i] === '' || colData[i] === null || colData[i] === undefined) {
                            colData.pop();
                        }else{
                            break;
                        }
                    }

                    // result.header["0"].push(firstRowData[index]);
                    let headerObj = tableCombox.find(function (ele) {
                        return ele.label === value;
                    });
                    result.header[firstRowData[index]] = headerObj.id;
                    //result.header.push(obj);
                    // result.header["1"].push(headerObj.id);
                    if (!headerObj) { //用户自定义
                        console.log('自定义combox！');
                        return;
                    }
                    if (!result.data.hasOwnProperty(firstRowData[index])) {
                        result.data[firstRowData[index]] = colData;
                    }
                }
            });
            container.data('tableJsonData',result);
            let comboxHeader = hot.getDataAtRow(1);
            let desHeader = hot.getDataAtRow(0);
            let dataCopy = data.map(function (value1) {
                return value1;
            });
            dataCopy.unshift(comboxHeader);
            dataCopy.unshift(desHeader);
            container.data('tableDataExport', dataCopy);
            container.data('tableHeaderHash',result.header);

        }

    }

//动态生成表头 combox
    function creatComboxTable(data) {

        let container = $('#table-content');
        container.html('').next('.table-footer').html('').hide();
        container.removeData();
        container.prev('.table-header').find('.dropdown-menu-table').children(':last').html('导出csv文件');
        submitJsonData = '';

        let setting = {
            readOnly: false,
            startCols: 5,
            startRows: 18,
            minRows: 18,
            minSpareRows: 1,
            stretchH: 'all',
            colHeaders: true,
            manualColumnResize: true, //改变列宽度
            // manualColumnMove: true,  //移动列
            fillHandle: false,
            margeCells: true,
            mergeCells: [],
            undo: false,
            // currentRowClassName: 'currentRow',
            // currentColClassName: 'currentCol',

            height: container.height(),
            // fixedRowsTop: 2,
            contextMenu: {
                callback: function (key, option) {
                    //console.log(arguments);
                },
                items: {
                    'row_above': {
                        disabled: function () {
                            //if first row, disable this option
                            return (hot.getSelected() && hot.getSelected()[0] === 0 || hot.getSelected()[0] === 1);
                        }
                    },
                    "row_below": {
                        disabled: function () {
                            //if first row, disable this option
                            return (hot.getSelected() && hot.getSelected()[0] === 0);
                        }
                    },
                    "hsep1": "---------",
                    "col_left": {},
                    "col_right": {},
                    "hsep2": "---------",
                    "remove_row": {
                        disabled: function () {
                            //if first row, disable this option
                            return (hot.getSelected() && hot.getSelected()[0] === 0 || hot.getSelected()[0] === 1 || hot.getSelected()[2] === 0 || hot.getSelected()[2] === 1);
                        }
                    },
                    "remove_col": {},
                    // "hsep3": "---------",
                    // "undo": {},
                    // "redo": {},
                    "hsep4": "---------",
                    "alignment": {}
                }
            },
            cells: function (row, col, prop) {
                let cellProperties = {};
                if (row === 0) {
                    cellProperties.renderer = firstRowRenderer;
                }
                else if (row === 1) {
                    cellProperties.renderer = comboxRowRenderer;
                }
                else{
                    cellProperties.renderer = otherRowRenderer;
                }
                return cellProperties;
            },
            beforePaste: function (data, coords) {
                //console.log('粘贴之前事件: ',arguments);
                let startRow = coords[0].startRow;
                let startCol = coords[0].startCol;
                let endRow = (startRow + data.length - 1) > coords[0].endRow ? (startRow + data.length - 1) : coords[0].endRow;
                let endCol = (startCol + data[0].length - 1) > coords[0].endCol ? (startCol + data[0].length - 1) : coords[0].endCol;

                let pasteHeader = data[0];
                let isHeader = pasteHeader.some(function (value, index) {
                    return headerCombox.includes(value);
                });
                if (isHeader) { //判断粘贴的数据有没有带表头
                    pasteHeader = data.shift();
                    pasteHeader.forEach(function (value, index) {
                        hot.setDataAtCell(1, (startCol + index), value);
                    })
                }else{
                    let fields = [];
                    let fieldsCol = [];
                    pasteHeader.forEach(function(value,index){
                        let colData = hot.getDataAtCol(startCol + index);
                        let colDes = colData.shift();
                        let colHeader = colData.shift();
                        let isEmpty = colData.every(function (value) {
                            return value === null || value === '';
                        });
                        if (isEmpty && colHeader == '') {
                            if(value){
                                fields.push(value);
                                fieldsCol.push(startCol + index);
                            }else{
                                data.forEach(function(value2, index2){
                                    if(value2[index]){
                                        fields.push(value2[index]);
                                        fieldsCol.push(startCol + index);
                                        return false;
                                    }
                                })
                            }
                        }

                    });
                    //console.log('粘贴数据：',data);
                    //console.log('粘贴判定字段：', fields);
                    //console.log('粘贴判定字段:',fieldsCol);
                    if (fields.length) {
                        //combox判定
                        let apiInstance = new missionClient.ConfigApi();
                        //let fields = ["fields_example"]; // [String] | 字段内容列表
                        let opts = {
                            'authorization': getURLParams('token'), // String | token字串
                        };
                        console.log('字段', fields, fieldsCol);
                        apiInstance.getFieldType(fields,opts).then(function(aData) {
                            console.log('combox判定：',aData);

                            if($.isArray(aData.d)){
                                for(let oVal of aData.d){
                                    if($.isArray(oVal.typeList)){
                                        if (!oVal.typeList.length) return;
                                        if(oVal.typeList.length === 1){
                                            let index = fields.indexOf(oVal.field);
                                            if (index === -1) continue;
                                            hot.setDataAtCell(1,fieldsCol[index],oVal.typeList[0].label);
                                            hot.setCellMetaObject(1,fieldsCol[index],{type: 'dropdown', source: [oVal.typeList[0].label]});
                                        }else{
                                            let index = fields.indexOf(oVal.field);
                                            let newCombox = oVal.typeList.map(function(value){
                                                return value.label;
                                            });
                                            if (index === -1) continue;
                                            hot.setCellMetaObject(1,fieldsCol[index],{type: 'dropdown', source: newCombox});
                                            fields.splice(index, 1);
                                            fieldsCol.splice(index, 1);
                                        }
                                    }
                                }

                            }
                        }, function(error) {
                            console.log(error);
                        });

                    }
                }

                if (startRow <= 2) {

                    if (data.length > 1 && startRow === 0 || startRow === 1) { //在表头粘贴 粘贴数据存在多行时
                        //data.unshift([]);
                        data.forEach(function (value, row) {
                            value.forEach(function (value, col) {
                                if (startRow === 1) hot.setDataAtCell((startRow + 1 + row), (startCol + col), value);
                                if (startRow === 0) hot.setDataAtCell((startRow + 2 + row), (startCol + col), value);
                            })
                        });
                        return false;
                    }
                }
            },
            afterChange: function (changes, source) {
                console.log('afterChange: ', arguments);
                if(source === 'loadData') return;

                if (this.isEmptyCol(changes[0][1]) && this.getCellMeta(1, changes[0][1]).type === 'dropdown') { //删除处理
                    hot.setCellMetaObject(1, changes[0][1], {type: 'dropdown', source: headerCombox});
                }
                let colData = hot.getData();
                let b = true;
                if (Array.isArray(colData)) {
                    for (let i = 2; i < colData.length; i++) {
                        if (colData[i][changes[0][1]]) b = false;
                    }
                }
                if (b && this.getCellMeta(1, changes[0][1]).source.length < headerCombox.length) hot.setCellMetaObject(1, changes[0][1], {type: 'dropdown', source: headerCombox});
                if (changes[0][0] === 1) { //第二行
                    let colDes = hot.getDataAtCell(0, changes[0][1]);
                    if (colDes === '' || colDes === null) {
                        hot.setDataAtCell(0, changes[0][1], changes[0][3]);
                    }
                }

                transformTableData();

            },
            afterSelectionEnd: function (r, c, r2, c2) {

                desRowValidate();
            },
            afterBeginEditing: function (row, col) {
                //console.log('开始编辑之后事件：',arguments);
                let input = hot.getActiveEditor();
                if (row === 1) $(input.TEXTAREA).attr('readonly', 'readonly');
                $(input.TEXTAREA).off('keyup');
                $(input.TEXTAREA).keyup(function () {
                    let colData = hot.getDataAtCol(col);
                    // let colDes = colData.shift();
                    let colHeader = colData.shift();
                    let isEmpty = colData.every(function (value, index) {
                        return value === null || value === '';
                    });
                    if (isEmpty && row > 1 && colHeader == '' && $(this).val()) {//发送点击请求
                        //combox判定
                        let apiInstance = new missionClient.ConfigApi();
                        let fields = [$(this).val()]; // [String] | 字段内容列表
                        let opts = {
                            'authorization': getURLParams('token'), // String | token字串
                        };
                        apiInstance.getFieldType(fields,opts).then(function(aData) {
                            console.log('combox判定：',aData);
                            if(aData.d.length && $.isArray(aData.d[0].typeList)){
                                console.log(aData.d[0].typeList);
                                if (!aData.d[0].typeList.length) return;
                                if(aData.d[0].typeList.length === 1){
                                    hot.setDataAtCell(1,col,aData.d[0].typeList[0].label);
                                    hot.setCellMetaObject(1,col,{type: 'dropdown', source: [aData.d[0].typeList[0].label]});
                                    setTimeout(function () {
                                        $(input.TEXTAREA).val(fields[0]);
                                    },0)

                                }else{
                                    let newCombox = aData.d[0].typeList.map(function(value,index){
                                        return value.label;
                                    });
                                    hot.setCellMetaObject(1,col,{type: 'dropdown', source: newCombox})
                                }
                            }
                        }, function(error) {
                            console.log(error);
                        });
                    }
                    console.log('是否为空', hot.isEmptyCol(col));
                    if(!$(this).val() && hot.isEmptyCol(col)){
                        hot.setCellMetaObject(1,col,{type: 'dropdown', source: headerCombox});
                        console.log('恢复初始headerCombox！');
                    }
                });
            },
            afterRemoveRow: function () {
                transformTableData();
            },
            afterRemoveCol: function () {
                transformTableData();
            }

        };
        //设置默认表头
        let headerCombox = data.map(function (value, index) {
            if (Object(value) === value) {
                return value.label;
            }
        });

        let el = $('<div class="table-custom-ajax">'); //虚拟dom
        el.appendTo(container);
        el.velocity("transition.bounceDownIn", { drag: true });
        el.handsontable(setting);
        let hot = el.handsontable('getInstance');

        let hotData = hot.getData();
        let initHeader = hotData[0].map(function (value, index) {
            return '';
        });
        hotData.shift();
        hotData.unshift(initHeader);
        let decHeader = hotData[0].map(function (value, index) {
            return '';
        });
        hotData.unshift(decHeader);
        //让表格在高度上充满
        let hotHeight = parseInt((el.height() - el.find('.ht_master .htCore thead').height()) / (el.find('.ht_master .htCore tbody td').height() + 2));
        hot.updateSettings({data: hotData, minRows: hotHeight});

        function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            if (!$(td).hasClass('htPlaceholder')) $(td).css({
                'font-weight': 'bold',
                'color': 'white',
                'text-align': 'center'
            });
            else $(td).css({'text-align': 'center'});
            cellProperties.placeholder = '请添加描述(主键)';
        }

        function comboxRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
            if (!$(td).hasClass('htPlaceholder')) $(td).css({
                'font-weight': 'bold',
                'color': 'white',
                'text-align': 'center'
            });
            else $(td).css({'text-align': 'center'});
            cellProperties.placeholder = '请选择列头';
            if (cellProperties.type !== 'dropdown') {
                cellProperties.type = 'dropdown';
                cellProperties.source = headerCombox;
                cellProperties.validator = function (value, callback) {
                    callback(true);
                };
            }
        }

        function otherRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            let comboxValue = instance.getDataAtCell(1,col);
            if(comboxValue === '日期') {
                cellProperties.type = 'date';
                cellProperties.dateFormat = 'YYYY/MM/DD';
                cellProperties.validator = function (value, callback) {
                    callback(true);
                };

            }
            else if (comboxValue === '时间') {
                cellProperties.editor = 'customDateTime';
            }
            else{
                delete cellProperties.type;
                delete cellProperties.dateFormat;
                delete cellProperties.validator;
                delete cellProperties.editor;

            }

        }

        //第一行描述行验证
        function desRowValidate() {
            el.data('isRepeat', false);
            el.data('isDesEmpty', false);
            el.data('isTypeEmpty', false);
            let rowDes = hot.getDataAtRow(0);
            rowDes.forEach(function (value, index, arr) {
                let td = hot.getCell(0, index);
                let arr2 = arr.filter(function (value2, index2) {
                    return index2 !== index;
                });
                if (arr2.includes(value) && value !== '' && value !== null) {
                    $(td).addClass('htInvalid');
                    el.data('isRepeat', true);
                } else {
                    $(td).removeClass('htInvalid');
                }

                //判断为空
                let colData = hot.getDataAtCol(index);
                colData.shift();
                colData.shift();
                let isColEmpty = colData.every(function (value, index) {
                    return value === null || value === '';
                });
                if (!isColEmpty && (value  === '' || value === null)) {
                    let cell = hot.getCell(0, index);
                    $(cell).addClass('htInvalid-a');//.css('color','white');
                    el.data('isDesEmpty', true);
                }
                if (!isColEmpty && (hot.getDataAtCell(1, index)  === '' || hot.getDataAtCell(1, index) === null)) {
                    let cell = hot.getCell(1, index);
                    $(cell).addClass('htInvalid-a');//.css('color','white');
                    el.data('isTypeEmpty', true);
                }
            });
            if (el.data('isRepeat') || el.data('isDesEmpty') || el.data('isTypeEmpty')) return false;
        }

        //数据转换
        function transformTableData() { //将表格数据转化成json数据
            if (desRowValidate()) return false;

            let secondRowData = hot.getDataAtRow(1);
            let firstRowData = hot.getDataAtRow(0);

            let result = {
                header: {},
                data: {}
            };
            secondRowData.forEach(function (value, index, arr) {  //字段转换
                if (value !== '请选择列头' && value !== '' && value !== null) {
                    let colData = hot.getDataAtCol(index);
                    colData.shift(); //去掉描述行
                    colData.shift(); //去掉combox行

                    let headerObj = data.find(function (ele) {
                        return ele.label === value;
                    });
                    result.header[firstRowData[index]] = headerObj.id;

                    if (!headerObj) { //用户自定义
                        console.log('自定义combox！');
                        return;
                    }
                    if (!result.data.hasOwnProperty(firstRowData[index])) {
                        result.data[firstRowData[index]] = colData;
                    }
                }
            });
            delnull(result.data);

            tableDataExport = hot.getData();

            container.data('tableJsonData',result);
            container.data('tableDataExport', tableDataExport);
            container.data('tableHeaderHash',result.header);

        }
    }


//将表格转换成json对象 一张表格时
    function tableDataToObj(dataArr) {  //接受表格数组格式
        if (!Array.isArray(dataArr)) return;
        let json = {};
        let keyArr = dataArr.shift();  //表头

        for (let i = 0; i < dataArr.length; i++) {  //行
            for (let j = 0; j < dataArr[i].length; j++) {  //列
                if (keyArr[j] !== null && keyArr[j] !== '') {  //表头为空则该列数据无效
                    let key = keyArr[j] + '[' + i + ']';
                    json[key] = dataArr[i][j];
                }
            }
        }

        let unflattenJson = unflatten(json);  //表头不能接受小数，会将小数点解析成对象的点号

        delnull(unflattenJson);

        return unflattenJson;
    }


//删除json中数组末尾为空的值
    function delnull(unflattenArr) {
        for (let k in unflattenArr) {
            if (unflattenArr[k] instanceof Array) {
                let b = true;
                for (let i = unflattenArr[k].length - 1; i >= 0; i--) {
                    if (unflattenArr[k][i] instanceof Object) delnull(unflattenArr[k][i]);
                    else {
                        if ((unflattenArr[k][i] === '' || unflattenArr[k][i] === null) && b) {
                            unflattenArr[k].pop();
                        } else b = false;
                    }
                }
                if (unflattenArr[k].length === 1) {
                    unflattenArr[k] = unflattenArr[k][0];
                }
            }
            else {
                delnull(unflattenArr[k]);
            }
        }
    }


});

/**
 * 编辑窗口自定义线索按钮
 * @param position array 表格控件的位置，array[0]为left，array[1]为top
 * 采用构造函数设计模式，提供两个api：getTableData获取表格json数据，tableRemove为表格控件窗口移除
 */
function editorCustomTable(position) {
    let setting = {
        startCols: 4,
        startRows: 6,
        stretchH: 'all',
        colHeaders: true,
        manualColumnResize: true, //改变列宽度
        manualColumnMove: true,  //移动列
        width: 300,
        height: 170,
        contextMenu: {
            callback: function (key, option) {
                //console.log(arguments);
            },
            items: {
                'row_above': {
                    disabled: function () {
                        //if first row, disable this option
                        return (hot.getSelected() && hot.getSelected()[0] === 0);
                    }
                },
                "row_below": {},
                "hsep1": "---------",
                "col_left": {},
                "col_right": {},
                "hsep2": "---------",
                "remove_row": {},
                "remove_col": {},
                "hsep3": "---------",
                "undo": {},
                "redo": {},
                "hsep4": "---------",
                "make_read_only": {},
                "alignment": {}
            }
        },
        cells: function (row, col, prop) {
            let cellProperties = {};
            if (row === 0) {
                cellProperties.renderer = firstRowRenderer;
            }
            return cellProperties;
        },
        afterChange: function (changes, source) {
            if (source === 'edit') {
                if (changes[0][2] !== changes[0][3]) {
                    let tableData = {};
                    let tableAlert = {};
                    let tableHeader = hot.getDataAtRow(0);
                    tableHeader.forEach(function (value, index) {
                        let colData = hot.getDataAtCol(index);
                        colData.shift();
                        let isEmpty = colData.every(function (value, index) {
                            return value === null;
                        });
                        if (value !== null && value !== '') {

                            let l = colData.length;
                            for (let i = l - 1; i >= 0; i--) {
                                if (colData[i] === null || colData === '') {
                                    colData.pop();
                                }
                            }

                            if (!tableData.hasOwnProperty(value)) {
                                tableData[value] = colData;
                            } else {
                                if (!tableAlert.hasOwnProperty("same")) {
                                    tableAlert["same"] = [];
                                }
                                tableAlert["same"].push(value);
                            }

                        } else {
                            if (!isEmpty) {
                                if (!tableAlert.hasOwnProperty("empty")) {
                                    tableAlert["empty"] = [];
                                }
                                tableAlert["empty"].push(index);
                            }
                        }
                    });
                    el.data('tableJsonData', tableData);
                    el.data('tableAlert', tableAlert);
                }

                //console.log(el.data());
            }
        },
        afterSelectionEnd: function (r, c, r2, c2) {
            //console.log('选区结束事件：',arguments);
            if (r === 0 || r2 === 0) {
                this.updateSettings({fillHandle: false});
            }
            else {
                this.updateSettings({fillHandle: true});
            }
        },

    };
    let eidtorTableContainer = $('<div class="editor-table-container configWindow">');
    let el = $('<div class="editor-custom-table">'); //虚拟dom
    let editorTableHeader = $('<div>自定义线索</div>');
    let editorTableBtn = $('<div><input type="button" value="取消"><input type="button" value="确定"></div>')
    editorTableHeader.appendTo(eidtorTableContainer);
    el.appendTo(eidtorTableContainer);
    editorTableBtn.appendTo(eidtorTableContainer);

    eidtorTableContainer.appendTo('html body');
    eidtorTableContainer.css({"position": "absolute", "left": position[0], "top": position[1]});
    el.handsontable(setting);
    let hot = el.handsontable('getInstance');

    //绑定数据
    el.data('tableJsonData', {});
    el.data('tableAlert', {same: [], empty: []});

    this.getTableData = function () {
        return el.data('tableJsonData');
    };
    this.tableRemove = function () {
        eidtorTableContainer.remove();
    };
    function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({'text-align': 'center'});
        cellProperties.placeholder = '列头';
    }
}

//导出文件
$(document).on('click','.table-exports-aLink',function () {
    let aElement = $('#export-csv');
    let tableExport;
    let tableHash;
    if($(this).parents('.littleBtnBox').siblings('.tabBoxForScroll').length){
        tableExport = $(this).parents('.littleBtnBox').siblings('.tabBoxForScroll').data('tableDataExport');
    }
    else if($(this).parents('.littleBtnBox').next().children('.tabBoxForScroll').length){
        tableExport = $(this).parents('.littleBtnBox').next().children('.tabBoxForScroll').data('tableDataExport');
    }
    else if($(this).parents('#query_container').find('#table-content').length){  //人工分析
        tableExport = $(this).parents('#query_container').find('#table-content').data('tableDataExport');
        tableHash = $(this).parents('#query_container').find('#table-content').data('tableHeaderHash');
        console.log('表格数据：',tableExport);
    }
    if(!tableExport) {
        swal({
            type: 'error',
            html: '导出数据有误！',
            confirmButtonText: '确认',
            timer: 2000
        }).catch(swal.noop);
        return;
    }
    console.log('导出数据：', tableExport, tableHash);
    //导出逻辑
    if (Array.isArray(tableExport) && tableExport.length) { //csv
        for (let i = tableExport.length; i > 0; i--) {
            if (Array.isArray(tableExport[i])) {
                let b = tableExport[i].every(function (ele, index) {
                    return ele == '' || ele == null || ele == undefined;
                });
                if (b) {
                    tableExport.pop();
                }else{
                    break;
                }
            }
        }
        console.log('导出数据如下', tableExport);
        let keyhashmap = {};
        if(tableHash && Object.keys(tableHash).length){
            keyhashmap = tableHash
        }
        let csvStr = Papa.unparse(tableExport);
        for (let i = 0; i < 100; i++) {
            csvStr += "\n";
        }

        csvStr += '=N("' + JSON.stringify(keyhashmap).replace(/"/g, "'").replace(/,/g, "|") + '")';
        let str = encodeURIComponent(csvStr);
        //aElement.href = "data:text/csv;charset=utf-8," + str;

        aElement.attr('href',"data:text/csv;charset=utf-8,\ufeff" + str);
        swal({
            title: '请输入csv导出文件名',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (value) {
                        resolve()
                    } else {
                        reject('写点东西吧，不要空着！')
                    }
                })
            }
        }).then(function (result) {

            swal({
                type: 'success',
                html: '成功导出文件：' + result + '.csv',
                showConfirmButton: false,
                timer: 2000
            }).catch(swal.noop);
            aElement.attr('download',result+'.csv');
            aElement.get(0).click();
        }).catch(swal.noop);
    }

    if ($.isPlainObject(tableExport) && !$.isEmptyObject(tableExport)) {
        console.log('导出Json数据：',tableExport);
        let txtFile = "test.txt";
        // let file = new File([],txtFile);
        let str = JSONstringify(tableExport);


        // file.open("write"); // open file with write access
        // file.write(str);
        // file.close();
        let dataUri = encodeURIComponent(str);
        //aElement.attr('download','download.json');
        aElement.attr('href',"data:application/json;charset=utf-8,\ufeff" + dataUri);
        //aElement.get(0).click();
        //console.log('json文件：', file);
        //JSONstringify(tableExport);

        swal({
            title: '请输入导出json文件名',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            html: '<pre class="custom-json-code">' + JSONstringify2(tableExport.data) + '</pre>',
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    console.log('alert:',arguments);
                    if (value) {
                        resolve()
                    } else {
                        reject('写点东西吧，不要空着！')
                    }
                })
            }
        }).then(function (result) {

            swal({
                type: 'success',
                html: '成功导出文件：' + result + '.csv',
                showConfirmButton: false,
                timer: 2000
            }).catch(swal.noop);
            aElement.attr('download',result+'.json');
            aElement.get(0).click();
        }).catch(swal.noop);
    }

    // $('.swal2-container').find('pre').mCustomScrollbar({
    //     scrollButtons:{
    //         enable:true
    //     }
    // });


});


function JSONstringify(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, '\t');
    }

    let
        arr = [],
        _string = 'color:green',
        _number = 'color:darkorange',
        _boolean = 'color:blue',
        _null = 'color:magenta',
        _key = 'color:red';

    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let style = _number;
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                style = _key;
            } else {
                style = _string;
            }
        } else if (/true|false/.test(match)) {
            style = _boolean;
        } else if (/null/.test(match)) {
            style = _null;
        }
        arr.push(style);
        arr.push('');
        return match;
    });
    return json;
}

function JSONstringify2(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, '\t');
    }

    var
        arr = [],
        _string = 'color:#0ee60e',
        _number = 'color:darkorange',
        _boolean = 'color:blue',
        _null = 'color:magenta',
        _key = 'color:red';

    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let style = _number;
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                style = _key;
            } else {
                style = _string;
            }
        } else if (/true|false/.test(match)) {
            style = _boolean;
        } else if (/null/.test(match)) {
            style = _null;
        }
        arr.push(style);
        arr.push('');
        return '<span style="' + style + '">' + match + '</span>';
    });
    return json;
}