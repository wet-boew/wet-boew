/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 *
 * Version: @wet-boew-build.version@
 *
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.calendar = {
		create: function (containerid, year, month, shownav, mindate, maxdate) {
			var objCalendar,
				container = $('#' + containerid),
				calHeader,
				defaultMinDate = new Date().setFullYear(year - 1, month, 1),
				defaultMaxDate = new Date().setFullYear(year + 1, month, 1),
				monthNav,
				days,
				daysList;

			container.addClass('cal-container');
			container.removeClass('cal-container-extended');

			//Converts min and max date from string to date objects
			if (typeof mindate === 'object') {
				//Object is not a date object
				if (typeof mindate.getFullYear === 'undefined') {
					mindate = defaultMinDate;
				}
			} else if (typeof mindate === 'string') {
				mindate = _pe.date.from_iso_format(mindate);
				if (mindate === null) {
					mindate = defaultMinDate;
				}
			} else {
				mindate = defaultMinDate;
			}
			if (typeof maxdate === 'object') {
				//Object is not a date object
				if (typeof maxdate.getFullYear === 'undefined') {
					maxdate = defaultMaxDate;
				}
			} else if (typeof maxdate === 'string') {
				maxdate = _pe.date.from_iso_format(maxdate);
				if (maxdate === null) {
					maxdate = defaultMaxDate;
				}
			} else {
				maxdate = defaultMaxDate;
			}

			//Validates that the year and month are in the min and max date range
			if (year > maxdate.getFullYear() || (year === maxdate.getFullYear() && month > maxdate.getMonth())) {
				year = maxdate.getFullYear();
				month = maxdate.getMonth();
			} else if (year < mindate.getFullYear() || (year === mindate.getFullYear() && month < mindate.getMonth())) {
				year = mindate.getFullYear();
				month = mindate.getMonth();
			}

			//Reset calendar if the calendar previously existed
			if (container.children('#cal-' + containerid + '-cnt').length > 0) {
				container.children('#cal-' + containerid + '-cnt').find('#cal-' + containerid + '-weekdays, .cal-month, #cal-' + containerid + '-days').remove();
				objCalendar = container.children('#cal-' + containerid + '-cnt');
			} else {
				objCalendar = $('<div id="cal-' + containerid + '-cnt" class="cal-cnt"></div>');
				container.append(objCalendar);
			}

			//Creates the calendar header
			if (container.children('#cal-' + containerid + '-cnt').children('.cal-header').length > 0) {
				calHeader = container.children('#cal-' + containerid + '-cnt').children('.cal-header');
			} else {
				calHeader = $('<div class="cal-header"></div>');
			}

			calHeader.prepend('<div class="cal-month">' + _pe.dic.get('%calendar-monthNames')[month] + ' ' + year + '</div>');

			if (shownav) {
				//Create the month navigation
				monthNav = _pe.fn.calendar.createMonthNav(containerid, year, month, mindate, maxdate);
				if ($('#cal-' + containerid + '-monthnav').length < 1) {
					calHeader.append(monthNav);
				}
			}
			objCalendar.append(calHeader);

			//Create the calendar body

			//Creates weekdays | Cree les jours de la semaines
			objCalendar.append(_pe.fn.calendar.createWeekdays(containerid));

			//Creates the rest of the calendar | Cree le reste du calendrier
			days = _pe.fn.calendar.createDays(containerid, year, month);
			daysList = days.children('ol.cal-day-list').children('li');
			objCalendar.append(days);

			//Trigger the calendarDisplayed Event
			container.trigger('calendarDisplayed', [year, month, daysList]);
		},

		createMonthNav : function (calendarid, year, month, minDate, maxDate) {
			var alt,
				btnCtn,
				btn,
				container = $('#' + calendarid),
				i,
				monthNames = _pe.dic.get('%calendar-monthNames'),
				monthNav = $('#cal-' + calendarid + '-monthnav'),
				newMonth,
				newYear,
				showButton,
				suffix,
				titleSuffix;

			if (monthNav.length === 0) {
				monthNav = $('<div id="cal-' + calendarid +  '-monthnav"></div>');
			} else {
				container.off('swiperight swipeleft');
			}

			//Create month navigation links | Cree les liens de navigations
			for (i = 0; i < 2; i += 1) {
				showButton = true;
				btnCtn = null;
				btn = null;
				//Set context for each button
				if (i === 0) {
					suffix = 'prevmonth';
					titleSuffix = _pe.dic.get('%calendar-previousMonth');
					if (month > 0) {
						newMonth = month - 1;
						newYear = year;
					} else {
						newMonth = 11;
						newYear = year - 1;
					}

					if ((newMonth < minDate.getMonth() && newYear <= minDate.getFullYear()) || newYear < minDate.getFullYear()) {
						showButton = false;
					}
				} else {
					if ($('#' + calendarid).children('#cal-' + calendarid + '-cnt').children('.cal-header').find('.cal-goto').length < 1) {
						//Create the go to form
						monthNav.append(_pe.fn.calendar.createGoToForm(calendarid, year, month, minDate, maxDate));
					}
					suffix = 'nextmonth';
					titleSuffix = _pe.dic.get('%calendar-nextMonth');
					if (month < 11) {
						newMonth = month + 1;
						newYear = year;
					} else {
						newMonth = 0;
						newYear = year + 1;
					}

					if ((newMonth > maxDate.getMonth() && newYear >= maxDate.getFullYear()) || newYear > maxDate.getFullYear()) {
						showButton = false;
					}
				}

				if (monthNav.children('.cal-' + suffix).length > 0) {
					btnCtn = monthNav.children('.cal-' + suffix);
				}

				if (showButton) {
					alt = titleSuffix + monthNames[newMonth] + ' ' + newYear;

					if (btnCtn) {
						btn = btnCtn.children('a').off();
						btn.children('img').attr('alt', alt);
					} else {
						btnCtn = $('<div class="cal-' + suffix + '"></div>');
						btn = $('<a href="javascript:;" role="button"><img class="image-actual" src="' + pe.add.liblocation + 'images/calendar/' + suffix.substr(0, 1) + '.png" alt="' + alt + '" /></a>');

						btnCtn.append(btn);
						if (i === 0) {
							monthNav.prepend(btnCtn);
						} else {
							monthNav.append(btnCtn);
						}
					}
					if (i === 0) {
						container.on('swiperight', {
							calID: calendarid,
							year: newYear,
							month: newMonth,
							mindate: minDate,
							maxdate: maxDate
						}, _pe.fn.calendar.prevMonth);

						btn.on('click', {
							calID: calendarid,
							year: newYear,
							month : newMonth,
							mindate: minDate,
							maxdate: maxDate
						}, _pe.fn.calendar.prevMonth);
					} else {
						container.on('swipeleft', {
							calID: calendarid,
							year: newYear,
							month: newMonth,
							mindate: minDate,
							maxdate: maxDate
						}, _pe.fn.calendar.nextMonth);

						btn.on('click', {
							calID: calendarid,
							year: newYear,
							month: newMonth,
							mindate: minDate,
							maxdate: maxDate
						}, _pe.fn.calendar.nextMonth);
					}
				} else {
					if (btnCtn) {
						btnCtn.remove();
					}
				}
			}
			return monthNav;
		},
		prevMonth : function (event) {
			var button = event.button,
				ctn = $(this).closest('.cal-container'),
				btnClass = 'cal-prevmonth';
			if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
				_pe.fn.calendar.create(event.data.calID, event.data.year, event.data.month, true, event.data.mindate, event.data.maxdate);

				if (ctn.find('.' + btnClass).length < 1) {
					_pe.focus(ctn.find('.cal-goto-link a'));
				} else {
					_pe.focus(ctn.find('.' + btnClass + ' a'));
				}
			}
		},
		nextMonth : function (event) {
			var button = event.button,
				ctn = $(this).closest('.cal-container'),
				btnClass = 'cal-nextmonth';
			if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
				_pe.fn.calendar.create(event.data.calID, event.data.year, event.data.month, true, event.data.mindate, event.data.maxdate);

				if (ctn.find('.' + btnClass).length < 1) {
					_pe.focus(ctn.find('.cal-goto-link a'));
				} else {
					_pe.focus(ctn.find('.' + btnClass + ' a'));
				}
			}
		},
		yearChanged : function (event) {
			var year = parseInt($(this).val(), 10),
				minDate = event.data.minDate,
				maxDate = event.data.maxDate,
				monthField = event.data.monthField,
				minMonth = 0,
				maxMonth = 11,
				month,
				monthNames = _pe.dic.get('%calendar-monthNames'),
				i;
			if (year === minDate.getFullYear()) {
				minMonth = minDate.getMonth();
			}

			if (year === maxDate.getFullYear()) {
				maxMonth = maxDate.getMonth();
			}

			month = monthField.val();

			// Can't use monthField.empty() or .html('') on <select> in IE
			// http://stackoverflow.com/questions/3252382/why-does-dynamically-populating-a-select-drop-down-list-element-using-javascript
			while (monthField.children('option').length) {
				monthField.get(0).remove(0);
			}

			for (i = minMonth; i <= maxMonth; i += 1) {
				monthField.append('<option value="' + i + '"' + ((i === month) ? ' selected="selected"' : '') + '>' + monthNames[i] + '</option>');
			}
		},

		createGoToForm : function (calendarid, year, month, minDate, maxDate) {
			var goToForm = $('<div class="cal-goto"></div>'),
				form = $('<form id="cal-' + calendarid + '-goto" role="form" style="display:none;" action=""><fieldset><legend>' + _pe.dic.get('%calendar-goToTitle') + '</legend></fieldset></form>'),
				fieldset,
				yearContainer,
				yearField,
				y,
				_ylen,
				monthContainer,
				monthField,
				buttonContainer,
				button,
				buttonCancelContainer,
				buttonCancel,
				goToLinkContainer,
				goToLink;
			form.submit(function () {
				_pe.fn.calendar.onGoTo(calendarid, minDate, maxDate);
				return false;
			});
			fieldset = form.children('fieldset');

			//Create the year field
			yearContainer = $('<div class="cal-goto-year"></div>');
			yearField = $('<select title="' + _pe.dic.get('%calendar-goToYear') + '" id="cal-' + calendarid + '-goto-year"></select>');
			for (y = minDate.getFullYear(), _ylen = maxDate.getFullYear(); y <= _ylen; y += 1) {
				yearField.append($('<option value="' + y + '"' + (y === year ? ' selected="selected"' : '') + '>' + y + '</option>'));
			}

			yearContainer.append(yearField);
			fieldset.append(yearContainer);

			//Create the list of month field
			monthContainer = $('<div class="cal-goto-month"></div>');
			monthField = $('<select title="' + _pe.dic.get('%calendar-goToMonth') + '" id="cal-' + calendarid + '-goto-month"></select>');

			monthContainer.append(monthField);
			fieldset.append(monthContainer);

			// Update the list of available months when changing the year
			yearField.bind('change', {minDate: minDate, maxDate: maxDate, monthField: monthField}, _pe.fn.calendar.yearChanged);
			yearField.change(); // Populate initial month list		

			buttonContainer = $('<div class="cal-goto-button"></div>');
			button = $('<input type="submit" class="button button-accent" value="' + _pe.dic.get('%calendar-goToButton') + '" />');
			buttonContainer.append(button);
			fieldset.append(buttonContainer);

			buttonCancelContainer = $('<div class="cal-goto-button"></div>');
			buttonCancel = $('<input type="button" class="button button-dark" value="' + _pe.dic.get('%calendar-cancelButton') + '" />');
			buttonCancel.on('click', function (e) {
				var button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					_pe.fn.calendar.hideGoToForm(calendarid);
				}
			});
			buttonCancelContainer.append(buttonCancel);
			fieldset.append(buttonCancelContainer);

			goToLinkContainer = $('<p class="cal-goto-link" id="cal-' + calendarid + '-goto-link"></p>');
			goToLink = $('<a href="javascript:;" role="button" aria-controls="cal-' + calendarid + '-goto" aria-expanded="false">' + _pe.dic.get('%calendar-goToLink') + '</a>');
			goToLink.on('click', function (e) {
				var button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					_pe.fn.calendar.showGoToForm(calendarid);
				}
			});
			goToLinkContainer.append(goToLink);

			goToForm.append(goToLinkContainer);
			goToForm.append(form);

			return goToForm;
		},

		createWeekdays : function (calendarid) {
			var weekdays = $('<ol id="cal-' + calendarid + '-weekdays" class="cal-weekdays" role="presentation"></ol>'),
				wd,
				txt,
				wday;
			for (wd = 0; wd < 7; wd += 1) {
				txt = _pe.dic.get('%calendar-weekDayNames')[wd];
				wday = $('<li id="cal-' + calendarid + '-wd' + (wd + 1) + '" class="cal-wd' + (wd + 1) + '"><abbr title="' + txt + '">' + txt.substr(0, 1) + '</abbr></li>');
				if (wd === 0 || wd === 6) {
					wday.addClass = 'we';
				}
				weekdays.append(wday);
			}
			return weekdays;
		},

		createDays : function (calendarid, year, month) {
			var cells = $('<div id="cal-' + calendarid + '-days" class="cal-days"></div>'),
				days = $('<ol id="cal-' + calendarid + '-' + month + '_' + year + '" class="cal-day-list"></ol>'),
				date = new Date(),
				firstday,
				lastday,
				daycount,
				breakAtEnd,
				week,
				day,
				element,
				elementParent,
				isCurrentDate,
				textWeekDayNames = _pe.dic.get('%calendar-weekDayNames'),
				textMonthNames = _pe.dic.get('%calendar-monthNames'),
				textCurrentDay = _pe.dic.get('%calendar-currentDay'),
				frenchLang = (_pe.language === 'fr');

			//Get the day of the week of the first day of the month | Determine le jour de la semaine du premier jour du mois
			date.setFullYear(year, month, 1);
			firstday = date.getDay();

			//Get the last day of the month | Determine le dernier jour du mois
			date.setFullYear(year, month + 1, 0);
			lastday = date.getDate() - 1;

			//Get the current date
			date = new Date();
			date.getDate();

			daycount = 0;
			breakAtEnd = false;

			for (week = 1; week < 7; week += 1) {
				for (day = 0; day < 7; day += 1) {
					if ((week === 1 && day < firstday) || (daycount > lastday)) {
						//Creates empty cells | Cree les cellules vides
						element = $('<span class="cal-empty">' + String.fromCharCode(160) + '</span>');
						elementParent = cells;
					} else {
						//Creates date cells | Cree les cellules de date
						daycount += 1;
						isCurrentDate = (daycount === date.getDate() && month === date.getMonth() && year === date.getFullYear());

						if (daycount === 1) {
							cells.append(days);
						}
						if (daycount > lastday) {
							breakAtEnd = true;
						}
						element = $('<li><div><span class="wb-invisible">' + textWeekDayNames[day] + (frenchLang ? (' </span>' + daycount + '<span class="wb-invisible"> ' + textMonthNames[month].toLowerCase() + ' ') : (' ' + textMonthNames[month] + ' </span>' + daycount + '<span class="wb-invisible"> ')) + year + (isCurrentDate ? textCurrentDay : '') + '</span></div></li>');
						elementParent = days;
					}
					element.attr('id', 'cal-' + calendarid + '-w' + week + 'd' + (day + 1)).addClass('cal-w' + week + 'd' + (day + 1) + ' cal-index-' + daycount);

					if (day === 0 || day === 6) {
						element.addClass('cal-we');
					}
					if (isCurrentDate) {
						element.addClass('cal-currentday');
					}
					elementParent.append(element);
				}
				if (breakAtEnd) {
					break;
				}
			}

			return cells;
		},

		showGoToForm : function (calendarid) {
			//Hide the month navigation
			$('#cal-' + calendarid +  '-monthnav').children('.cal-prevmonth, .cal-nextmonth').addClass('wb-invisible').children('a').attr('aria-hidden', 'true');

			var link = $('#cal-' + calendarid + '-goto-link'),
				form = $('#cal-' + calendarid + '-goto');

			link.stop().slideUp(0);
			form.stop().slideDown(0).queue(function () {
				_pe.focus($(this).find(':input:eq(0)'));
			});

			link.children('a').attr('aria-hidden', 'true').attr('aria-expanded', 'true');
			$('#' + calendarid).addClass('cal-container-extended');
		},

		hideGoToForm : function (calendarid) {
			var link = $('#cal-' + calendarid + '-goto-link'),
				form = $('#cal-' + calendarid + '-goto');

			form.stop().slideUp(0).queue(function () {
				//Show the month navigation
				$('#cal-' + calendarid +  '-monthnav').children('.cal-prevmonth, .cal-nextmonth').removeClass('wb-invisible').children('a').attr('aria-hidden', 'false');
				$('#' + calendarid).removeClass('cal-container-extended');
			});
			link.stop().slideDown(0).children('a').attr('aria-hidden', 'false').attr('aria-expanded', 'false');
		},

		onGoTo : function (calendarid, minDate, maxDate) {
			var container = $('#' + calendarid),
				fieldset = container.find('fieldset'),
				month = parseInt(fieldset.find('.cal-goto-month select option:selected').val(), 10),
				year = parseInt(fieldset.find('.cal-goto-year select').val(), 10);

			if (!(month < minDate.getMonth() && year <= minDate.getFullYear()) && !(month > maxDate.getMonth() && year >= maxDate.getFullYear())) {
				_pe.fn.calendar.create(calendarid, year, month, true, minDate, maxDate);
				_pe.fn.calendar.hideGoToForm(calendarid);

				//Go to the first day to avoid having to tab opver the navigation again.
				_pe.focus($('#cal-' + calendarid + '-days').find('a:eq(0)'));
			}
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));