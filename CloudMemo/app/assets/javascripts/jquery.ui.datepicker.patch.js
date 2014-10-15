// datepickerの修正および機能追加
(function ($) {
    $.extend($.datepicker, {
        // インラインのdatepickerでのshowBeforeイベント対応
        _inlineDatepicker_orig: $.datepicker._inlineDatepicker,
        _inlineDatepicker: function (target, inst) {
            this._inlineDatepicker_orig(target, inst);
            var beforeShow = $.datepicker._get(inst, 'beforeShow');
            if (beforeShow) {
                beforeShow.apply(target, [target, inst]);
            }
        },
        // onChangeMonthYearイベントで引数に正しい月が渡ってこない場合がある問題の修正
        _notifyChange_orig: $.datepicker._notifyChange,
        _notifyChange: function (inst) {
            var onChange = this._get(inst, 'onChangeMonthYear');
            if (onChange) {
                var year = inst.selectedYear;
                var month = inst.selectedMonth;
                var day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month));
                var date = this._restrictMinMax(inst,
                    this._daylightSavingAdjust(new Date(year, month, day)));

                inst.currentMonth = inst.selectedMonth = inst.drawMonth = date.getMonth();
                inst.currentYear = inst.selectedYear = inst.drawYear = date.getFullYear();
                inst.currentDay = 1;
                onChange.apply((inst.input ? inst.input[0] : null),
                    [inst.selectedYear, inst.selectedMonth +  1, inst]);
            }
        },
        // monthSuffixに対応
        _generateMonthYearHeader_orig: $.datepicker._generateMonthYearHeader,
        _generateMonthYearHeader: function (inst, drawMonth, drawYear, minDate, maxDate,
                                      secondary, monthNames, monthNamesShort) {
            var html = this._generateMonthYearHeader_orig(inst, drawMonth, drawYear, minDate, maxDate,
                           secondary, monthNames, monthNamesShort);
            var month_suffix = this._get(inst, 'monthSuffix');
            if (month_suffix) {
                html = html.replace(/(<select class="ui-datepicker-month".*?<\/select>)/, "$1" + month_suffix);
            }
            return html;
        },
        _selectDate_orig: $.datepicker._selectDate,
        _selectDate: function (id, dateStr) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
            if (inst.input)
                inst.input.val(dateStr);
            this._updateAlternate(inst);
            var onSelect = this._get(inst, 'onSelect');
            if (onSelect)
                var doUpdate = onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
            else if (inst.input)
                inst.input.trigger('change');
            if (inst.inline && doUpdate !== false)
                this._updateDatepicker(inst);
            else {
                this._hideDatepicker();
                this._lastInput = inst.input[0];
                if (typeof(inst.input[0]) != 'object')
                    inst.input.focus();
                this._lastInput = null;
            }
        }
    });
}(jQuery));
