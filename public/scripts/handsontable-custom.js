/**
 * Created by zxy on 2017/6/5.
 */
(function(Handsontable){
    let CustomTimeEditor = Handsontable.editors.TextEditor.prototype.extend();
    CustomTimeEditor.prototype.init = function () {
        Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
        let _this = this;
        $(this.TEXTAREA).clockpicker({
            placement: 'bottom',
            'default': 'now',
            align: 'left',
            autoclose: true,
            afterDone: function(){
                _this.finishEditing();
            }
        });
        $(this.TEXTAREA).clockpicker('show').clockpicker('hide');
        $('.clockpicker-popover').off('mousedown').on('mousedown',function(){
            event.stopPropagation();
        });
    };

    CustomTimeEditor.prototype.open = function() {
        Handsontable.editors.TextEditor.prototype.open.apply(this, arguments);
        let input = $(this.TEXTAREA);
        setTimeout(function(){
            input.clockpicker('show');
        },0);
    };

    CustomTimeEditor.prototype.getValue = function() {
        return $(this.TEXTAREA).val();
    };

    CustomTimeEditor.prototype.setValue = function(newValue) {
        $(this.TEXTAREA).val(newValue);
    };

    CustomTimeEditor.prototype.close = function() {
        Handsontable.editors.TextEditor.prototype.close.apply(this, arguments);

        $(this.TEXTAREA).clockpicker('hide');

    };

    Handsontable.editors.CustomTimeEditor = CustomTimeEditor;
    Handsontable.editors.registerEditor('customTime', CustomTimeEditor);

    let CustomDateTimeEditor = Handsontable.editors.TextEditor.prototype.extend();
    CustomDateTimeEditor.prototype.createElements = function () {
        // Call the original createElements method
        Handsontable.editors.TextEditor.prototype.createElements.apply(this, arguments);

        // Create password input and update relevant properties
        this.TEXTAREA = document.createElement('input');
        this.TEXTAREA.setAttribute('type', 'text');
        this.TEXTAREA.className = 'handsontableInput';
        this.textareaStyle = this.TEXTAREA.style;
        this.textareaStyle.width = 0;
        this.textareaStyle.height = 0;

        // Replace textarea with password input
        Handsontable.dom.empty(this.TEXTAREA_PARENT);
        this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
    };
    CustomDateTimeEditor.prototype.init = function () {
        Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
        let _this = this;
        let datetimepickerOption = {
            // dateFormat: 'yy-mm-dd',
            // dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
            // closeText: '关闭',
            // prevText: '< 上月',
            // prevStatus: '显示上月',
            clearText: '清除',
            clearStatus: '清除已选日期',
            closeText: '关闭',
            closeStatus: '不改变当前选择',
            prevText: '< 上月',
            prevStatus: '显示上月',
            prevBigText: '<<',
            prevBigStatus: '显示上一年',
            nextText: '下月>',
            nextStatus: '显示下月',
            nextBigText: '>>',
            nextBigStatus: '显示下一年',
            currentText: '现在',
            currentStatus: '显示本月',
            monthNames: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'],
            monthNamesShort: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'],
            monthStatus: '选择月份',
            yearStatus: '选择年份',
            weekHeader: '周',
            weekStatus: '年内周次',
            dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
            dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
            dayNamesMin: ['日','一','二','三','四','五','六'],
            dayStatus: '设置 DD 为一周起始',
            dateStatus: '选择 m月 d日, DD',
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            initStatus: '请选择日期',
            showMonthAfterYear: true,
            isRTL: false,
            changeMonth: false,
            changeYear: false,
            showAnim: 'show',
            yearSuffix: '年',
            timeText: '时间',
            hourText: '时',
            minuteText: '分',
            secondText: '秒',
            onClose: function () {
                _this.finishEditing();
            }
        };
        $(this.TEXTAREA).datetimepicker(datetimepickerOption);

        $('#ui-datepicker-div').off('mousedown').on('mousedown',function(){
            event.stopPropagation();
        });
    }
    Handsontable.editors.CustomDateTimeEditor = CustomDateTimeEditor;
    Handsontable.editors.registerEditor('customDateTime', CustomDateTimeEditor);


})(Handsontable);

(function($) {
    // private functions
    var backup = function(index) {
        var input = this;
        if (index !== undefined) {
            input.prevValues[index] = $($(input).find(".ipv4-cell")[index]).val();
        } else {
            $(input).find(".ipv4-cell").each(function(i, cell) {
                input.prevValues[i] = $(cell).val();
            });
        }
    };

    var revert = function(index) {
        var input = this;
        if (index !== undefined) {
            $($(input).find(".ipv4-cell")[index]).val(input.prevValues[index]);
        } else {
            $(input).find(".ipv4-cell").each(function(i, cell) {
                $(cell).val(input.prevValues);
            });
        }
    };

    var selectCell = function(index) {
        var input = this;
        if (index === undefined && index < 0 && index > 3) return;
        $($(input).find(".ipv4-cell")[index]).focus();
    };

    var isValidIPStr = function(ipString) {
        if (typeof ipString !== "string") return false;

        var ipStrArray = ipString.split(".");
        if (ipStrArray.length !== 4) return false;

        return ipStrArray.reduce(function(prev, cur) {
            if (prev === false || cur.length === 0) return false;
            return (Number(cur) >= 0 && Number(cur) <= 255) ? true : false;
        }, true);
    };

    var getCurIPStr = function() {
        var str = "";
        this.find(".ipv4-cell").each(function(index, element) {
            str += (index == 0) ? $(element).val() : "." + $(element).val();
        });
        return str;
    };

    // function for text input cell
    var getCursorPosition = function() {
        var cell = this;
        if ('selectionStart' in cell) {
            // Standard-compliant browsers
            return cell.selectionStart;
        } else if (document.selection) {
            // IE
            cell.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -cell.value.length);
            return sel.text.length - selLen;
        }
        throw new Error("cell is not an input");
    };

    $.fn.ipv4_input = function(action, value) {
        this.each(function() {
            // only initialize in the first time
            if ($(this).hasClass("ipv4-input")) return;
            var input = this;
            input.prevValues = [];


            $(input).toggleClass("ipv4-input", true);
            $(input).html(
                '<input type="text" class="ipv4-cell" />' +
                '<label class="ipv4-dot">.</label>' +
                '<input type="text" class="ipv4-cell" />' +
                '<label class="ipv4-dot">.</label>' +
                '<input type="text" class="ipv4-cell" />' +
                '<label class="ipv4-dot">.</label>' +
                '<input type="text" class="ipv4-cell" />'
            );


            $(this).find(".ipv4-cell").focus(function() {
                $(this).select(); // input select all when tab in
                $(input).toggleClass("selected", true);
            });

            $(this).find(".ipv4-cell").focusout(function() {
                $(input).toggleClass("selected", false);
            });

            $(this).find(".ipv4-cell").each(function(index, cell) {
                $(cell).keydown(function(e) {
                    if(e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105)
                    {	// numbers, backup last status
                        backup.call(input, index);
                    }
                    else if(e.keyCode == 37 || e.keyCode == 39)
                    {	// left key ,right key
                        if (e.keyCode == 37 && getCursorPosition.call(cell) === 0)
                        {
                            selectCell.call(input, index - 1);
                            e.preventDefault();
                        }
                        else if (e.keyCode == 39 && getCursorPosition.call(cell) === $(cell).val().length)
                        {
                            selectCell.call(input, index + 1);
                            e.preventDefault();
                        }
                    }
                    else if(e.keyCode == 9)
                    {	// allow tab
                    }
                    else if(e.keyCode == 8 || e.keyCode == 46)
                    {	// allow backspace, delete
                    }
                    else
                    {
                        e.preventDefault();
                    }
                });

                $(cell).keyup(function(e) {
                    if(e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105)
                    {	// numbers
                        var val = $(this).val();
                        var num = Number(val);

                        if (num > 255)
                            revert.call(input, index);
                        else if (val.length > 1 && val[0] === "0")
                            revert.call(input, index);
                        else if (val.length === 3)
                            selectCell.call(input, index + 1)
                    }
                });
            });
        });

        if (action == "value") {
            if (value === undefined)	// get func
                return getCurIPStr.call(this);

            // set func
            if (!isValidIPStr(value)) throw new Error("invalid ip address");

            var strArray = value.split(".");
            this.find(".ipv4-cell").each(function(index, cell) {
                $(cell).val(strArray[index]);
            });
        }

        if (action == "valid") {
            return isValidIPStr(getCurIPStr.call(this));
        }

        if (action == "clear") {
            this.find(".ipv4-cell").each(function(index, cell) {
                $(cell).val("");
            });
        }

        return this;
    };

}(jQuery));
