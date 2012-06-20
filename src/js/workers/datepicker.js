/*!
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
*/
/*
* Datepicker
*/
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {fn: {} };
	/* local reference */
	_pe.fn.datepicker = {
		type: 'plugin',
        depends: ['calendar', 'xregexp'],
		_exec: function (elm) {
            var addLinksToCalendar, createToggleIcon, date, defaultFormat, formatDate, hideAll, ieFix, month, setSelectedDate, toggle, year, addSelectedDateToField;
            date = (new Date);
            year = date.getFullYear();
            month = date.getMonth();
            defaultFormat = "YYYY-MM-DD";

            createToggleIcon = function(fieldid, containerid){
                var fieldLabel = $("label[for='" + fieldid + "']").text()
                objToggle = $('<a id="' + containerid +'-toggle" class="picker-toggle-hidden" href="javascript:;"><img src="' + pe.add.liblocation + 'images/datepicker/icon.png" alt="' + pe.dic.get('%datepicker-show') + fieldLabel +'"/></a>');
                objToggle.click(function(){pe.fn.datepicker.toggle(fieldid, containerid);})
                var field = $('#' + fieldid);
                field.after(objToggle);
                
                var container = $('#' + containerid);
                container.slideUp(0);
            };

            if(elm.attr("id")){
                var minDate;
                if (elm.attr("data-min-date") != null) {
                    minDate = elm.attr("data-min-date");
                }
                else {
                    minDate = '1800-01-01';
                }
                
                var maxDate;
                if (elm.attr("data-max-date") != null) {
                    maxDate = elm.attr("data-max-date");
                }
                else {
                    maxDate = '2100-01-01';
                }
                
                var format
                if (elm.attr("data-date-format") != null) {
                    format = elm.attr("data-date-format") 
                }
                else {
                    format = defaultFormat;
                }
                
                var id = elm.attr("id")
                var field = elm;
                var containerid = id + '-picker'
                var container = $('<div id="' + containerid + '" class=\"picker-overlay\" role="dialog" aria-controls="' + id + '" aria-labelledby="' + containerid +'-toggle"></div>');

                // Escape key to close popup
                container.bind('keyup', function(e){ 
                    if (e.keyCode == 27) {
                        pe.fn.datepicker.hideAll();
                        $('#' + id + '-picker-toggle').focus();
                    }
                });

                field.parent().after(container)
                
                container.bind("calendarDisplayed", function(e, year,  month, days) {
                    pe.fn.datepicker.addLinksToCalendar(id, year, month, days, minDate, maxDate, format);
                    pe.fn.datepicker.setSelectedDate(id, year, month, days, format);

                    // Close the popup a second after blur
                    container.find('a, select').blur(function(){
                        window.setTimeout(function(){
                            if(container.find(':focus').length === 0) {
                                pe.fn.datepicker.hideAll();
                            }
                        }, 1000);
                    });                    
                });
                calendar.create(containerid, year, month, true, minDate, maxDate); 
                createToggleIcon(id, containerid);

                // 'Hide' link at the bottom of calendar to close the popup without selecting a date
                /* $('<a class="picker-close" href="javascript:;">' + pe.dic.get('%datepicker-hide') + '</a>').appendTo(container)
                    .click(function(){
                        pe.fn.datepicker.toggle(id, containerid);
                    }); */
                
                //Disable the tabbing of all the links when calendar is hidden
                container.find("a").attr("tabindex", -1);

                //Resize the form element to fit a standard date
                field.addClass("picker-field");
            }
		}, // end of exec
        addLinksToCalendar : function(fieldid, year, month, days, minDate, maxDate, format){
            minDate = calendar.getDateFromISOString(minDate);
            maxDate = calendar.getDateFromISOString(maxDate);
            
            var lLimit = (year == minDate.getFullYear() && month == minDate.getMonth())? true : false;
            var hLimit = (year == maxDate.getFullYear() && month == maxDate.getMonth())? true : false;

            days.each(function(index, value){
                if ((!lLimit && !hLimit) || (lLimit == true && index >= minDate.getDate()) || (hLimit == true && index <= maxDate.getDate())){
                    var obj = $(value).children("div");
                    var link = $("<a href=\"javascript:;\"></a>");
                    var parent = obj.parent()
                    parent.empty();
                    link.append(obj.html());
                    link.appendTo(parent);
                    link.bind('click', {fieldid: fieldid, year: year, month : month, day: index + 1, days:days, format: format}, 
                        function(event){
                            pe.fn.datepicker.addSelectedDateToField(event.data.fieldid, event.data.year, event.data.month+1, event.data.day, event.data.format); 
                            pe.fn.datepicker.setSelectedDate(event.data.fieldid, event.data.year, event.data.month, event.data.days, event.data.format);
                            //Hide the calendar on selection
                            pe.fn.datepicker.toggle(event.data.fieldid , event.data.fieldid + "-picker");
                        }
                    );
                }
            });
        },
        setSelectedDate : function(fieldid, year, month, days, format){
            //Reset selection state
            $(days).removeClass("datepicker-selected");
            $(days).find(".datepicker-selected-text").detach();
            
            //Create regular expression to match value (Note: Using a, b and c to avoid replacing conflicts)
            format = format.replace("DD", "(?<a> [0-9]{2})");
            format = format.replace("D", "(?<a> [0-9] )");
            format = format.replace("MM", "(?<b> [0-9]{2})");
            format = format.replace("M", "(?<b> [0-9])");
            format = format.replace("YYYY", "(?<c> [0-9]{4})");
            format = format.replace("YY", "(?<c> [0-9]{2})");
            var pattern = "^" + format + "$";
            
            //Get the date from the field
            var date = $("#" + fieldid).attr("value");
            regex = XRegExp(pattern, "x");
            
            try{
                if (date != '')
                {
                    var cpntDate =  $.parseJSON(date.replace(regex, '{"year":"${c}", "month":"${b}", "day":"${a}"}'));
                    if (cpntDate.year == year && cpntDate.month== month+1){
                        $(days[cpntDate.day - 1]).addClass("datepicker-selected");
                        $(days[cpntDate.day - 1]).children("a").append("<span class=\"cn-invisible datepicker-selected-text\"> [" + pe.dic.get('%datepicker-selected') + "]</span>");
                    }
                }
            }catch(e){

            }
        },
        addSelectedDateToField : function (fieldid, year, month, day, format){
            $("#" + fieldid).attr("value", this.formatDate(year, month, day, format));
        },
        toggle : function (fieldid, containerid){
            var toggle = $("#" + containerid + "-toggle");
            toggle.toggleClass("picker-toggle-hidden picker-toggle-visible");
            var container = $('#' + containerid);
            
            container.unbind("focusout.calendar");
            container.unbind("focusin.calendar");
            
            if(toggle.hasClass("picker-toggle-visible")){
                //Hide all other calendars
                pe.fn.datepicker.hideAll(fieldid);
                
                //Enable the tabbing of all the links when calendar is visible
                container.find("a").attr("tabindex", 0);
                container.slideDown('fast', function(){pe.fn.datepicker.ieFix($(this))});
                container.attr("aria-hidden","false");
                toggle.children("a").children("span").text(pe.dic.get('%datepicker-hide'));

                $('.cal-prevmonth a').focus();
            }else{
                //Disable the tabbing of all the links when calendar is hidden
                container.find("a").attr("tabindex", -1);
                container.slideUp('fast', function(){pe.fn.datepicker.ieFix($(this))});
                calendar.hideGoToForm(containerid);
                var fieldLabel = $("label[for='" + fieldid + "']").text()
                toggle.children("a").children("span").text(pe.dic.get('%datepicker-show') + fieldLabel);
                container.attr("aria-hidden","true");
                
                $("#" + fieldid).focus();
            }
        },
        hideAll : function(exception){
            $(".date-picker").each(function(index, value){
                if($(this).attr("id") != exception){
                    var fieldid = $(this).attr("id")
                    var containerid =  fieldid+ '-picker';
                    var container = $("#" + containerid);
                    var toggle = $("#" + containerid + "-toggle");
                    
                    //Disable the tabbing of all the links when calendar is hidden
                    container.find("a").attr("tabindex", -1);
                    container.slideUp('fast');
                    container.attr("aria-hidden","true");
                    calendar.hideGoToForm(containerid);
                    var fieldLabel = $("label[for='" + fieldid + "']").text()
                    toggle.children("a").children("span").text(pe.dic.get('%datepicker-show') + fieldLabel);
                    toggle.removeClass("picker-toggle-visible");
                    toggle.addClass("picker-toggle-hidden");
                }
            });
        },
        ieFix : function (container){
            //IE Fix for when the page is too small to display the calendar
            if ( /MSIE 7/.test(navigator.userAgent) ) {
                var calendarBottom = container.height() + container.offset().top - $("#cn-centre-col-inner").offset().top + 50;
                if ($("#cn-centre-col-inner").height() >= calendarBottom) 
                    $("#cn-centre-col-inner").css("min-height", "");
                else if ($("#cn-centre-col-inner").height() < calendarBottom) 
                    $("#cn-centre-col-inner").css("min-height", calendarBottom);
            } else if (/MSIE ((5\.5)|6)/.test(navigator.userAgent)) {
                var calendarBottom = container.height() + container.offset().top - $("#cn-centre-col-inner").offset().top; + 50
                if ($("#cn-centre-col-inner").height() >= calendarBottom) 
                    $("#cn-centre-col-inner").css("height", "");
                else if ($("#cn-centre-col-inner").height() < calendarBottom) 
                    $("#cn-centre-col-inner").css("height", calendarBottom);
            }
        },
        formatDate : function (year, month, day, format){
            output = format;
            output = output.replace("DD", calendar.strPad(day, 2, '0'));
            output = output.replace("D", day);
            output = output.replace("MM", calendar.strPad(month, 2, '0'));
            output = output.replace("M", month);
            output = output.replace("YYYY", year);
            output = output.replace("YY", year.toString().substr(2,2));
            
            return output
        }
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
