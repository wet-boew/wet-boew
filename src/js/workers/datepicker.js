/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Datepicker
 */
/*global jQuery: false, pe: false, wet_boew_datepicker: false, calendar: false, XRegExp: false*/
(function ($) {
	var _pe = window.pe || {fn: {} };
	/* local reference */
	_pe.fn.datepicker = {
		type: 'plugin',
		depends: ['calendar', 'xregexp'],
		_exec: function (elm) {
			var addLinksToCalendar,
				calendar = _pe.fn.calendar,
				createToggleIcon,
				date = new Date(),
				defaultFormat = "YYYY-MM-DD",
				formatDate,
				hideAll,
				ieFix,
				month = date.getMonth(),
				setSelectedDate,
				toggle,
				year = date.getFullYear(),
				addSelectedDateToField,
				id,
				minDate,
				maxDate,
				format,
				field,
				containerid,
				container,
				wrapper;

			createToggleIcon = function (fieldid, containerid) {
				var fieldLabel = wrapper.find("label[for='" + fieldid + "']").text(),
					objToggle = $('<a id="' + containerid + '-toggle" class="picker-toggle-hidden" href="javascript:;"><img src="' + pe.add.liblocation + 'images/datepicker/icon.png" alt="' + pe.dic.get('%datepicker-show') + fieldLabel + '"/></a>');

				objToggle.on('click', function () {
					toggle(fieldid, containerid);
				});

				elm.after(objToggle);
				container.slideUp(0);
			};
			addLinksToCalendar = function (fieldid, year, month, days, minDate, maxDate, format) {
				minDate = calendar.getDateFromISOString(minDate);
				maxDate = calendar.getDateFromISOString(maxDate);

				var lLimit = (year === minDate.getFullYear() && month === minDate.getMonth()),
					hLimit = (year === maxDate.getFullYear() && month === maxDate.getMonth());

				days.each(function (index, value) {
					if ((!lLimit && !hLimit) || (lLimit === true && index >= minDate.getDate()) || (hLimit === true && index <= maxDate.getDate())) {
						var obj = $(value).children("div"),
							link = $("<a href=\"javascript:;\"></a>"),
							parent = obj.parent();
						parent.empty();
						link.append(obj.html());
						link.appendTo(parent);
						link.bind('click', {fieldid: fieldid, year: year, month : month, day: index + 1, days: days, format: format}, function (event) {
							addSelectedDateToField(event.data.fieldid, event.data.year, event.data.month + 1, event.data.day, event.data.format);
							setSelectedDate(event.data.fieldid, event.data.year, event.data.month, event.data.days, event.data.format);
							//Hide the calendar on selection
							toggle(event.data.fieldid, event.data.fieldid + "-picker");
						});
					}
				});
			};
			setSelectedDate = function (fieldid, year, month, days, format) {
				var pattern, date, cpntDate, regex;
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
				pattern = "^" + format + "$";

				//Get the date from the field
				date = $("#" + fieldid).attr("value");
				regex = new XRegExp(pattern, "x");

				try {
					if (date !== '') {
						cpntDate = $.parseJSON(date.replace(regex, '{"year":"${c}", "month":"${b}", "day":"${a}"}'));
						if (cpntDate.year === year && cpntDate.month === month + 1) {
							$(days[cpntDate.day - 1]).addClass("datepicker-selected");
							$(days[cpntDate.day - 1]).children("a").append('<span class="wb-invisible datepicker-selected-text"> [' + pe.dic.get("%datepicker-selected") + ']</span>');
						}
					}
				} catch (e) {

				}
			};
			addSelectedDateToField = function (fieldid, year, month, day, format) {
				wrapper.find("#" + fieldid).attr("value", formatDate(year, month, day, format));
			};
			toggle = function (fieldid, containerid) {
				var toggle = wrapper.find("#" + containerid + "-toggle"),
					fieldLabel;
				toggle.toggleClass("picker-toggle-hidden picker-toggle-visible");

				container.unbind("focusout.calendar");
				container.unbind("focusin.calendar");

				if (toggle.hasClass("picker-toggle-visible")) {
					//Hide all other calendars
					hideAll(fieldid);

					//Enable the tabbing of all the links when calendar is visible
					container.find("a").attr("tabindex", 0);
					container.slideDown('fast', function () {
						ieFix($(this));
					});
					container.attr("aria-hidden", "false");
					toggle.children("a").children("span").text(pe.dic.get('%datepicker-hide'));

					pe.focus($('.cal-prevmonth a'));
				} else {
					//Disable the tabbing of all the links when calendar is hidden
					container.find("a").attr("tabindex", "-1");
					container.slideUp('fast', function () {
						ieFix($(this));
					});
					calendar.hideGoToForm(containerid);
					fieldLabel = wrapper.find("label[for='" + fieldid + "']").text();
					toggle.children("a").children("span").text(pe.dic.get('%datepicker-show') + fieldLabel);
					container.attr("aria-hidden", "true");

					pe.focus(wrapper.find("#" + fieldid));
				}
			};
			hideAll = function (exception) {
				$("#wet-boew-datepicker").each(function (index, value) {
					var fieldid, containerid, container, toggle, fieldLabel;
					if ($(this).attr("id") !== exception) {
						fieldid = $(this).attr("id");
						containerid = fieldid + '-picker';
						toggle = wrapper.find("#" + containerid + "-toggle");

						//Disable the tabbing of all the links when calendar is hidden
						container.find("a").attr("tabindex", "-1");
						container.slideUp('fast');
						container.attr("aria-hidden", "true");
						calendar.hideGoToForm(containerid);
						fieldLabel = $("label[for='" + fieldid + "']").text();
						toggle.children("a").children("span").text(pe.dic.get('%datepicker-show') + fieldLabel);
						toggle.removeClass("picker-toggle-visible");
						toggle.addClass("picker-toggle-hidden");
					}
				});
			};
			ieFix = function (container) {
				//IE Fix for when the page is too small to display the calendar
				var wbMainIn = $('#wb-main-in'),
					calendarBottom;
				if (pe.ie === 7) {
					calendarBottom = container.height() + container.offset().top - wbMainIn.offset().top + 50;
					if (wbMainIn.height() >= calendarBottom) {
						wbMainIn.css("min-height", "");
					} else if (wbMainIn.height() < calendarBottom) {
						wbMainIn.css("min-height", calendarBottom);
					}
				} else if (pe.ie > 0 && pe.ie < 7) {
					calendarBottom = container.height() + container.offset().top - wbMainIn.offset().top + 50;
					if (wbMainIn.height() >= calendarBottom) {
						wbMainIn.css("height", "");
					} else if (wbMainIn.height() < calendarBottom) {
						wbMainIn.css("height", calendarBottom);
					}
				}
			};
			formatDate = function (year, month, day, format) {
				var output = format;
				output = output.replace("DD", calendar.strPad(day, 2, '0'));
				output = output.replace("D", day);
				output = output.replace("MM", calendar.strPad(month, 2, '0'));
				output = output.replace("M", month);
				output = output.replace("YYYY", year);
				output = output.replace("YY", year.toString().substr(2, 2));

				return output;
			};

			if (elm.attr("id") !== undefined) {
				id = elm.attr("id");
				if (elm.attr("data-min-date") !== undefined) {
					minDate = elm.attr("data-min-date");
				} else {
					minDate = '1800-01-01';
				}

				if (elm.attr("data-max-date") !== undefined) {
					maxDate = elm.attr("data-max-date");
				} else {
					maxDate = '2100-01-01';
				}

				if (elm.attr("data-date-format") !== undefined) {
					format = elm.attr("data-date-format");
				} else {
					format = defaultFormat;
				}

				id = elm.attr("id");
				field = elm;
				wrapper = elm.parent();
				containerid = id + '-picker';
				container = $('<div id="' + containerid + '" class="picker-overlay" role="dialog" aria-controls="' + id + '" aria-labelledby="' + containerid + '-toggle"></div>');

				// Escape key to close popup
				container.on('keyup', function (e) {
					if (e.keyCode === 27) {
						hideAll();
						pe.focus(elm.parent().find('#' + id + '-picker-toggle'));
					}
				});

				field.parent().after(container);

				container.bind("calendarDisplayed", function (e, year,  month, days) {
					addLinksToCalendar(id, year, month, days, minDate, maxDate, format);
					setSelectedDate(id, year, month, days, format);

					// Close the popup a second after blur
					container.find('a, select').blur(function () {
						window.setTimeout(function () {
							if (container.find(':focus').length === 0) {
								hideAll();
							}
						}, 1000);
					});
				});

				calendar.create(containerid, year, month, true, minDate, maxDate);
				createToggleIcon(id, containerid);

				// 'Hide' link at the bottom of calendar to close the popup without selecting a date
				/* $('<a class="picker-close" href="javascript:;">' + pe.dic.get('%datepicker-hide') + '</a>').appendTo(container)
					.click(function(){
						pe.fn.toggle(id, containerid);
					}); */

				//Disable the tabbing of all the links when calendar is hidden
				container.find("a").attr("tabindex", "-1");

				//Resize the form element to fit a standard date
				field.addClass("picker-field");
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));