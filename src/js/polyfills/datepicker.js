/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Datepicker
 */
/*global pe: false, XRegExp: false*/
(function ($) {
	"use strict";
	var container;
	$.fn.datepicker = function () {
		return $(this).each(function () {
			var addLinksToCalendar,
				addSelectedDateToField,
				calendar = pe.fn.calendar,
				createToggleIcon,
				date = new Date(),
				format = 'YYYY-MM-DD',
				formatDate,
				hide,
				hideAll,
				ieFix,
				maxDate,
				minDate,
				month = date.getMonth(),
				setFocus,
				setSelectedDate,
				toggle,
				year = date.getFullYear(),
				elm = $(this);

			if (elm.hasClass('picker-field')) {
				return;
			}

			elm.addClass('picker-field');

			createToggleIcon = function (fieldid) {
				var fieldLabel = $('label[for="' + fieldid + '"]').text(),
					objToggle = $('<a id="' + fieldid + '-picker-toggle" class="picker-toggle-hidden wb-invisible" href="javascript:;"><img class="image-actual" src="' + pe.add.liblocation + 'images/datepicker/calendar-month.png" alt="' + pe.dic.get('%datepicker-show') + ' ' + fieldLabel + '"/></a>');

				objToggle.on('click vclick touchstart', function () {
					toggle(fieldid);
					return false;
				});

				elm.after(objToggle);
				container.slideUp(0);

				// Delay revealing of the toggle button to give time for the image to load
				setTimeout(function() {
					objToggle.removeClass('wb-invisible');
				}, 10);
			};

			addLinksToCalendar = function (fieldid, year, month, days, minDate, maxDate, format) {
				var field = $('#' + pe.string.jqescape(fieldid)),
					lLimit,
					hLimit;

				if (field.attr('min') !== undefined) {
					minDate = field.attr('min');
				} else {
					minDate = '1800-01-01';
				}

				if (field.attr('max') !== undefined) {
					maxDate = field.attr('max');
				} else {
					maxDate = '2100-01-01';
				}

				minDate = pe.date.from_iso_format(minDate);
				maxDate = pe.date.from_iso_format(maxDate);

				lLimit = (year === minDate.getFullYear() && month === minDate.getMonth());
				hLimit = (year === maxDate.getFullYear() && month === maxDate.getMonth());

				days.each(function (index, value) {
					if ((!lLimit && !hLimit) || (lLimit === true && index >= minDate.getDate()) || (hLimit === true && index <= maxDate.getDate())) {
						var obj = $(value).children('div'),
							link = $('<a href="javascript:;"></a>'),
							parent = obj.parent();
						parent.empty();
						link.append(obj.html());
						link.appendTo(parent);

						// Keyboard nav
						link.on('keydown', function (event) {
							var container = $(this).closest('.cal-container'),
								calendarid = container.attr('id');
							if (!(event.ctrlKey || event.altKey || event.metaKey)) {
								switch (event.keyCode) {
								case 27: // escape key
									toggle(fieldid);
									return false;
								case 32: // spacebar
									$(this).trigger('click');
									return false;
								case 33:
									if (event.shiftKey) { // shift + page up
										setFocus(calendarid, year, month, minDate, maxDate, new Date(year - 1, month, index + 1));
									} else { // page up
										setFocus(calendarid, year, month, minDate, maxDate, new Date(year, month - 1, index + 1));
									}
									return false;
								case 34:
									if (event.shiftKey) { // shift + page down
										setFocus(calendarid, year, month, minDate, maxDate, new Date(year + 1, month, index + 1));
									} else { // page down
										setFocus(calendarid, year, month, minDate, maxDate, new Date(year, month + 1, index + 1));
									}
									return false;
								case 35: // end key
									pe.focus($(this).closest('ol').children('li').children('a').last());
									return false;
								case 36: // home key
									pe.focus($(this).closest('ol').children('li').children('a').first());
									return false;
								case 37: // left arrow
									setFocus(calendarid, year, month, minDate, maxDate, new Date(year, month, index));
									return false;
								case 38: // up arrow
									setFocus(calendarid, year, month, minDate, maxDate, new Date(year, month, index - 6));
									return false;
								case 39: // right arrow
									setFocus(calendarid, year, month, minDate, maxDate, new Date(year, month, index + 2));
									return false;
								case 40: // down arrow
									setFocus(calendarid, year, month, minDate, maxDate, new Date(year, month, index + 8));
									return false;
								}
							} else {
								if (event.ctrlKey && !(event.altKey || event.metaKey)) {
									switch (event.keyCode) {
									case 35: // end
										setFocus(calendarid, year, month, minDate, maxDate, new Date(year, 11, 31));
										return false;
									case 36: // home
										setFocus(calendarid, year, month, minDate, maxDate, new Date(year, 0, 1));
										return false;
									}
								}
							}
						});

						link.on('click vclick touchstart', {fieldid: fieldid, year: year, month : month, day: index + 1, days: days, format: format}, function (event) {
							addSelectedDateToField(event.data.fieldid, event.data.year, event.data.month + 1, event.data.day, event.data.format);
							setSelectedDate(event.data.fieldid, event.data.year, event.data.month, event.data.days, event.data.format);
							//Hide the calendar on selection
							toggle(event.data.fieldid);
							return false;
						});
					}
				});
			};

			setFocus = function (calendarid, year, month, minDate, maxDate, targetDate) {
				if (targetDate.getTime() < minDate.getTime()) {
					targetDate = minDate;
					targetDate.setDate(targetDate.getDate() + 1);
				} else if (targetDate.getTime() > maxDate.getTime()) {
					targetDate = maxDate;
					targetDate.setDate(targetDate.getDate() + 1);
				}

				if (targetDate.getMonth() !== month || targetDate.getFullYear() !== year) {
					calendar.create(calendarid, targetDate.getFullYear(), targetDate.getMonth(), true, minDate, maxDate);
				}

				pe.focus(container.find('.cal-day-list').children('li:eq(' + (targetDate.getDate() - 1) + ')').children('a'));
			};

			setSelectedDate = function (fieldid, year, month, days, format) {
				var pattern, date, cpntDate, regex;
				//Reset selection state
				$(days).removeClass('datepicker-selected');
				$(days).find('.datepicker-selected-text').detach();

				//Create regular expression to match value (Note: Using a, b and c to avoid replacing conflicts)
				format = format.replace('DD', '(?<a> [0-9]{2})');
				format = format.replace('D', '(?<a> [0-9] )');
				format = format.replace('MM', '(?<b> [0-9]{2})');
				format = format.replace('M', '(?<b> [0-9])');
				format = format.replace('YYYY', '(?<c> [0-9]{4})');
				format = format.replace('YY', '(?<c /> [0-9]{2})');
				pattern = '^' + format + '$';

				//Get the date from the field
				date = $('#' + pe.string.jqescape(fieldid)).val();
				regex = new XRegExp(pattern, 'x');

				try {
					if (date !== '') {
						cpntDate = $.parseJSON(date.replace(regex, '{"year":"$1", "month":"$2", "day":"$3"}'));
						if (parseInt(cpntDate.year, 10) === year && parseInt(cpntDate.month, 10) === month + 1) {
							$(days[cpntDate.day - 1]).addClass('datepicker-selected');
							$(days[cpntDate.day - 1]).children('a').append('<span class="wb-invisible datepicker-selected-text"> [' + pe.dic.get('%datepicker-selected') + ']</span>');
						}
					}
				} catch (e) {

				}
			};

			addSelectedDateToField = function (fieldid, year, month, day, format) {
				container.parent().find('#' + pe.string.jqescape(fieldid)).val(formatDate(year, month, day, format));
			};

			toggle = function (fieldid) {
				var escFieldID = pe.string.jqescape(fieldid),
					field = $('#' + escFieldID),
					wrapper = field.parent(),
					toggle = wrapper.find('#' + escFieldID + '-picker-toggle'),
					targetDate = pe.date.from_iso_format(field.val());

				toggle.toggleClass('picker-toggle-hidden picker-toggle-visible');

				if (field.attr('min') !== undefined) {
					minDate = field.attr('min');
				} else {
					minDate = '1800-01-01';
				}

				if (field.attr('max') !== undefined) {
					maxDate = field.attr('max');
				} else {
					maxDate = '2100-01-01';
				}

				container.attr({
					'aria-labelledby': fieldid + '-picker-toggle',
					'aria-controls': fieldid
				});
				calendar.create('wb-picker', year, month, true, minDate, maxDate);
				field.after(container);

				container.unbind('focusout.calendar');
				container.unbind('focusin.calendar');

				if (toggle.hasClass('picker-toggle-visible')) {
					//Hide all other calendars
					hideAll(fieldid);

					//Enable the tabbing of all the links when calendar is visible
					container.find('a').attr('tabindex', 0);
					container.slideDown('fast', function () {
						ieFix($(this));
					});
					container.attr('aria-hidden', 'false');
					toggle.children('a').children('span').text(pe.dic.get('%datepicker-hide'));

					if (targetDate !== null) {
						targetDate.setDate(targetDate.getDate() + 1);
						setFocus('wb-picker', year, month, pe.date.from_iso_format(minDate), pe.date.from_iso_format(maxDate), targetDate);
					} else {
						if (container.find('.cal-prevmonth a').length !== 0) {
							pe.focus(container.find('.cal-prevmonth a'));
						} else {
							if (container.find('.cal-nextmonth a').length !== 0) {
								pe.focus(container.find('.cal-nextmonth a'));
							} else {
								pe.focus(container.find('.cal-goto a'));
							}
						}
					}
				} else {
					hide($('#' + escFieldID));

					pe.focus(wrapper.find('#' + escFieldID));
				}
			};

			hideAll = function (exception) {
				$('.picker-field').each(function () {
					if ($(this).attr('id') !== exception) {
						hide($(this));
					}
				});
			};

			hide = function (pickerField) {
				var fieldid,
					toggle,
					fieldLabel;

				fieldid = pickerField.attr('id');
				toggle = $('#' + pe.string.jqescape(fieldid) + '-picker-toggle');
				fieldLabel = $('label[for="' + fieldid + '"]').text();

				//Disable the tabbing of all the links when calendar is hidden
				container.find('a').attr('tabindex', '-1');
				container.slideUp('fast', function () { ieFix($(this)); });
				container.attr('aria-hidden', 'true');
				calendar.hideGoToForm('wb-picker');
				toggle.children('a').children('span').text(pe.dic.get('%datepicker-show') + ' ' + fieldLabel);
				toggle.removeClass('picker-toggle-visible');
				toggle.addClass('picker-toggle-hidden');
			};

			ieFix = function (container) {
				//IE Fix for when the page is too small to display the calendar
				var wbMainIn = $('#wb-main-in'),
					calendarBottom;
				if (pe.ie === 7) {
					calendarBottom = container.height() + container.offset().top - wbMainIn.offset().top + 50;
					if (wbMainIn.height() >= calendarBottom) {
						wbMainIn.css('min-height', '');
					} else if (wbMainIn.height() < calendarBottom) {
						wbMainIn.css('min-height', calendarBottom);
					}
				} else if (pe.preIE7) {
					calendarBottom = container.height() + container.offset().top - wbMainIn.offset().top + 50;
					if (wbMainIn.height() >= calendarBottom) {
						wbMainIn.css('height', '');
					} else if (wbMainIn.height() < calendarBottom) {
						wbMainIn.css('height', calendarBottom);
					}
				}
			};

			formatDate = function (year, month, day, format) {
				var output = format;
				output = output.replace('DD', pe.string.pad(day, 2));
				output = output.replace('D', day);
				output = output.replace('MM', pe.string.pad(month, 2));
				output = output.replace('M', month);
				output = output.replace('YYYY', year);
				output = output.replace('YY', year.toString().substr(2, 2));

				return output;
			};

			if (container === undefined) {
				container = $('<div id="wb-picker" class="picker-overlay" role="dialog" aria-hidden="true"></div>');

				// Escape key to close overlay
				container.on('keyup', function (e) {
					if (e.keyCode === 27) {
						hideAll();
						pe.focus(container.parent().find('#' + container.attr('aria-controls')));
					}
				});

				container.on('calendarDisplayed', function (e, year,  month, days) {
					var $this = $(this),
						fieldid = $this.attr('aria-controls');

					addLinksToCalendar(fieldid, year, month, days, minDate, maxDate, format);
					setSelectedDate(fieldid, year, month, days, format);

					$this.on('click vclick touchstart focusin', function (e) {
						if (e.stopPropagation) {
							e.stopImmediatePropagation();
						} else {
							e.cancelBubble = true;
						}
					});
				});

				pe.document.on('click vclick touchstart focusin', function () {
					if (container.attr('aria-hidden') === 'false') {
						hide(container.parent().find('#' + pe.string.jqescape(container.attr('aria-controls'))));
						return false;
					}
				});

				// Close button
				$('<a class="picker-close" role="button" href="javascript:;"><img src="' + pe.add.liblocation + 'images/datepicker/cross-button.png" alt="' + pe.dic.get('%datepicker-hide') + '" class="image-actual" /></a>').appendTo(container)
					.click(function () {
						toggle(container.attr('aria-controls'));
					});

				// Disable the tabbing of all the links when calendar is hidden
				container.find('a').attr('tabindex', '-1');

				pe.bodydiv.after(container);
			}

			if (elm.attr('id') !== undefined) {
				createToggleIcon(elm.attr('id'));
			}
		});
	};
	$('input[type="date"]').datepicker();
}(jQuery));