/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {fn: {} };
	/* local reference */
	_pe.fn.calendar = {
		create: function (containerid, year, month, shownav, mindate, maxdate) {
			var objCalendar,
				container = $('#' + containerid),
				minDate,
				maxDate,
				calHeader,
				monthNav,
				days,
				daysList;

			container.addClass("cal-container");
			container.removeClass("cal-container-extended");

			//Converts min and max date from string to date objects
			minDate = _pe.fn.calendar.getDateFromISOString(mindate);
			if (minDate === null) {
				minDate = new Date();
				minDate.setFullYear(year - 1, month, 1);
			}
			maxDate = _pe.fn.calendar.getDateFromISOString(maxdate);
			if (maxDate === null) {
				maxDate = new Date();
				maxDate.setFullYear(year + 1, month, 1);
			}

			//Validates that the year and month are in the min and max date range
			if (year > maxDate.getFullYear() || (year === maxDate.getFullYear() && month > maxDate.getMonth())) {
				year = maxDate.getFullYear();
				month = maxDate.getMonth();
			} else if (year < minDate.getFullYear() || (year === minDate.getFullYear() && month < minDate.getMonth())) {
				year = minDate.getFullYear();
				month = minDate.getMonth();
			}

			//Reset calendar if the calendar previously existed
			if (container.children("div#cal-" + containerid + "-cnt").length > 0) {
				container.children("div#cal-" + containerid + "-cnt").find("ol#cal-" + containerid + "-weekdays, .cal-month, div#cal-" + containerid + "-days").remove();
				objCalendar = container.children("div#cal-" + containerid + "-cnt");
			} else {
				objCalendar = $('<div id="cal-' + containerid + '-cnt" class="cal-cnt"></div>');
				container.append(objCalendar);
			}

			//Creates the calendar header
			if (container.children("div#cal-" + containerid + "-cnt").children(".cal-header").length > 0) {
				calHeader = container.children("div#cal-" + containerid + "-cnt").children(".cal-header");
			} else {
				calHeader = $('<div class="cal-header"></div>');
			}

			calHeader.prepend('<div class="cal-month">' + pe.dic.get("%calendar-monthNames")[month] + ' ' + year + '</div>');

			if (shownav) {
				//Create the month navigation
				monthNav = _pe.fn.calendar.createMonthNav(containerid, year, month, minDate, maxDate);
				if ($("#cal-" + containerid + "-monthnav").length < 1) {
					calHeader.append(monthNav);
				}

				if (container.children("div#cal-" + containerid + "-cnt").children(".cal-header").children(".cal-goto").length < 1) {
					//Create the go to form
					calHeader.append(_pe.fn.calendar.createGoToForm(containerid, year, month, minDate, maxDate));
				}
			}
			objCalendar.append(calHeader);

			//Create the calendar body

			//Creates weekdays | Cree les jours de la semaines
			objCalendar.append(_pe.fn.calendar.createWeekdays(containerid));

			//Creates the rest of the calendar | Cree le reste du calendrier
			days = _pe.fn.calendar.createDays(containerid, year, month);
			daysList = days.children("ol.cal-day-list").children("li");
			objCalendar.append(days);

			//Trigger the calendarDisplayed Event
			container.trigger('calendarDisplayed', [year, month, daysList]);
		},

		createMonthNav : function (calendarid, year, month, minDate, maxDate) {
			var monthNav, suffix, titleSuffix, newMonth, newYear, showButton, btnCtn, btn, n, alt;
			if ($("#cal-" + calendarid + "-monthnav").length > 0) {
				monthNav = $("#cal-" + calendarid +  "-monthnav");
			} else {
				monthNav = $("<div id=\"cal-" + calendarid +  "-monthnav\"></div>");
			}

			//Create month navigation links | Cree les liens de navigations
			for (n = 0; n < 2; n += 1) {
				showButton = true;
				btnCtn = null;
				btn = null;
				//Set context for each button
				switch (n) {
				case 0:
					suffix = "prevmonth";
					titleSuffix = pe.dic.get('%calendar-previousMonth');
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
					break;
				case 1:
					suffix = "nextmonth";
					titleSuffix = pe.dic.get('%calendar-nextMonth');
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
					break;
				}

				if (monthNav.children(".cal-" + suffix).length > 0) {
					btnCtn = monthNav.children(".cal-" + suffix);
				}
				if (showButton) {
					alt = titleSuffix + pe.dic.get('%calendar-monthNames')[newMonth] + " " + newYear;

					if (btnCtn) {
						btn = btnCtn.children("a");
						btn.children("img").attr("alt", alt).unbind();
					} else {
						btnCtn = $('<div class="cal-' + suffix + '"></div>');
						btn = $('<a href="javascript:;" role="button"><img src="' + pe.add.liblocation + 'images/calendar/' + suffix.substr(0, 1) + '.gif" alt="' + alt + '" /></a>');

						btnCtn.append(btn);
						monthNav.append(btnCtn);
					}
					btn.bind('click', {calID: calendarid, year: newYear, month : newMonth, mindate: _pe.fn.calendar.getISOStringFromDate(minDate), maxdate: _pe.fn.calendar.getISOStringFromDate(maxDate)}, _pe.fn.calendar.buttonClick);
				} else {
					if (btnCtn) {
						btnCtn.remove();
					}
				}
			}
			return monthNav;
		},
		buttonClick : function (event) {
			_pe.fn.calendar.create(event.data.calID, event.data.year, event.data.month, true, event.data.mindate, event.data.maxdate);
			pe.focus($(this));
		},
		yearChanged : function (event) {
			var year = $(this).val(),
				minDate = event.data.minDate,
				maxDate = event.data.maxDate,
				monthField = event.data.monthField,
				minMonth = 0,
				maxMonth = 11,
				month,
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
				monthField.append('<option value="' + i + '"' + ((i === month) ? ' selected="selected"' : "") + '>' + pe.dic.get('%calendar-monthNames')[i] + '</option>');
			}
		},

		createGoToForm : function (calendarid, year, month, minDate, maxDate) {
			var goToForm = $('<div class="cal-goto"></div>'),
				form = $('<form id="cal-' + calendarid + '-goto" role="form" style="display:none;" action=""><fieldset><legend>' + pe.dic.get("%calendar-goToTitle") + '</legend></fieldset></form>'),
				fieldset,
				yearContainer,
				yearField,
				y,
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
			fieldset = form.children("fieldset");

			//Create the year field
			yearContainer = $('<div class="cal-goto-year"><label for="cal-' + calendarid + '-goto-year" class="wb-invisible">' + pe.dic.get("%calendar-goToYear") + '</label></div>');
			yearField = $('<select id="cal-' + calendarid + '-goto-year"></select>');
			for (y = minDate.getFullYear(); y <= maxDate.getFullYear(); y += 1) {
				yearField.append($('<option value="' + y + '"' + (y === year ? " selected=\"selected\"" : "") + '>' + y + '</option>'));
			}

			yearContainer.append(yearField);
			fieldset.append(yearContainer);

			//Create the list of month field
			monthContainer = $('<div class="cal-goto-month"><label for="cal-' + calendarid + '-goto-month" class="wb-invisible">' + pe.dic.get("%calendar-goToMonth") + '</label></div>');
			monthField = $("<select id=\"cal-" + calendarid + "-goto-month\"></select>");

			monthContainer.append(monthField);
			fieldset.append(monthContainer);

			// FIXME: Handle month filtering for IE6
			if (pe.ie === 6) {
				$(pe.dic.get('%calendar-monthNames')).each(function (index, value) {
					monthField.append('<option value="' + index + '"' + ((index === month) ? " selected=\"selected\"" : "") + '>' + value + '</option>');
				});
			} else {
				// Update the list of available months when changing the year
				yearField.bind('change', {minDate: minDate, maxDate: maxDate, monthField: monthField}, _pe.fn.calendar.yearChanged);
				yearField.change(); // Populate initial month list        
			}

			buttonContainer = $('<div class="cal-goto-button"></div>');
			button = $('<input type="submit" value="' + pe.dic.get("%calendar-goToButton") + '\" />');
			buttonContainer.append(button);
			fieldset.append(buttonContainer);

			buttonCancelContainer = $('<div class="cal-goto-button"></div>');
			buttonCancel = $('<input type="button" value="' + pe.dic.get("%calendar-cancelButton") + '" />');
			buttonCancel.click(function () {
				_pe.fn.calendar.hideGoToForm(calendarid);
			});
			buttonCancelContainer.append(buttonCancel);
			fieldset.append(buttonCancelContainer);

			goToLinkContainer = $('<p class="cal-goto-link" id="cal-' + calendarid + '-goto-link"></p>');
			goToLink = $('<a href="javascript:;" role="button" aria-controls="cal-' + calendarid + '-goto" aria-expanded="false">' + pe.dic.get("%calendar-goToLink") + '</a>');
			goToLink.on('click', function () {
				_pe.fn.calendar.showGoToForm(calendarid);
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
				txt = pe.dic.get('%calendar-weekDayNames')[wd];
				wday = $('<li id="cal-' + calendarid + '-wd' + (wd + 1) + '" class="cal-wd' + (wd + 1) + '"><abbr title="' + txt + '">' + txt.substr(0, 1) + '</abbr></li>');
				if (wd === 0 || wd === 6) {
					wday.addClass = "we";
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
				child,
				isCurrentDate,
				suffix;
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
						element = $("<li></li>");
						child = $("<div></div>");

						if (pe.language === 'en') {
							suffix = "";
							if (daycount > 10 && daycount < 20) {
								suffix = "th";
							} else {
								switch (daycount % 10) {
								case 1:
									suffix = "st";
									break;
								case 2:
									suffix = "nd";
									break;
								case 3:
									suffix = "rd";
									break;
								default:
									suffix = "th";
								}
							}
							child.append('<span class="wb-invisible">' + pe.dic.get('%calendar-weekDayNames')[day] + ' ' + pe.dic.get('%calendar-monthNames')[month] + ' </span>' + daycount + '<span class="wb-invisible">' + suffix + ' ' + year + ((isCurrentDate) ? pe.dic.get('%calendar-currentDay') : "") + '</span>');
						} else if (pe.language === 'fr') {
							child.append('<span class="wb-invisible">' + pe.dic.get('%calendar-weekDayNames')[day] + ' </span>' + daycount + '<span class="wb-invisible"> ' + pe.dic.get('%calendar-monthNames')[month].toLowerCase() + ' ' + year + ((isCurrentDate) ? pe.dic.get('%calendar-currentDay') : "") + '</span>');
						}
						element.append(child);
						elementParent = days;
					}
					element.attr("id", "cal-" + calendarid + "-w" + week + "d" + (day + 1)).addClass("cal-w" + week + "d" + (day + 1) + " cal-index-" + daycount);

					if (day === 0 || day === 6) {
						element.addClass("cal-we");
					}
					if (isCurrentDate) {
						element.addClass("cal-currentday");
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
			$("#cal-" + calendarid +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").addClass("wb-invisible").children("a").attr("aria-hidden", "true");

			var link = $("#cal-" + calendarid + "-goto-link"),
				form = $("#cal-" + calendarid + "-goto");

			link.stop().slideUp(0);
			form.stop().slideDown(0).queue(function () {
				pe.focus($(this).find(":input:eq(0)"));
			});

			link.children("a").attr("aria-hidden", "true").attr("aria-expanded", "true");
			$("#" + calendarid).addClass("cal-container-extended");
		},

		hideGoToForm : function (calendarid) {
			var link = $("#cal-" + calendarid + "-goto-link"),
				form = $("#cal-" + calendarid + "-goto");

			form.stop().slideUp(0).queue(function () {
				//Show the month navigation
				$("#cal-" + calendarid +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").removeClass("wb-invisible").children("a").attr("aria-hidden", "false");
				$("#" + calendarid).removeClass("cal-container-extended");
			});
			link.stop().slideDown(0).children("a").attr("aria-hidden", "false").attr("aria-expanded", "false");
		},

		onGoTo : function (calendarid, minDate, maxDate) {
			var container = $("#" + calendarid),
				fieldset = container.find("fieldset"),
				month = parseInt(fieldset.find(".cal-goto-month select option:selected").attr('value'), 10),
				year = parseInt(fieldset.find(".cal-goto-year select").attr("value"), 10);

			if (!(month < minDate.getMonth() && year <= minDate.getFullYear()) && !(month > maxDate.getMonth() && year >= maxDate.getFullYear())) {
				_pe.fn.calendar.create(calendarid, year, month, true, _pe.fn.calendar.getISOStringFromDate(minDate), _pe.fn.calendar.getISOStringFromDate(maxDate));
				_pe.fn.calendar.hideGoToForm(calendarid);

				//Go to the first day to avoid having to tab opver the navigation again.
				pe.focus($("#cal-" + calendarid + "-days").find("a:eq(0)"));
			}
		},

		getDateFromISOString : function (strdate) {
			var date = null;
			if (strdate) {
				if (strdate.match(/\d{4}-\d{2}-\d{2}/)) {
					date = new Date();
					date.setFullYear(strdate.substr(0, 4), strdate.substr(5, 2) - 1, strdate.substr(8, 2) - 1);
				}
				return date;
			}
			return null;
		},

		getISOStringFromDate : function (date) {
			return date.getFullYear() + '-' + _pe.fn.calendar.strPad(date.getMonth() + 1, 2, '0') + '-' + _pe.fn.calendar.strPad(date.getDate() + 1, 2, '0');
		},

		strPad : function (i, l, s) {
			var o = i.toString();
			if (!s) {
				s = '0';
			}
			while (o.length < l) {
				o = s + o;
			}
			return o;
//		}
		},
//	},
//		dates = {
		dates: {
			/** dates
			*  a date function to help with the data comparison
			*/
			convert : function (d) {
				// Converts the date in d to a date-object. The input can be:
				//   a date object: returned without modification
				//  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
				//   a number     : Interpreted as number of milliseconds
				//                  since 1 Jan 1970 (a timestamp)
				//   a string     : Any format supported by the javascript engine, like
				//                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
				//  an object     : Interpreted as an object with year, month and date
				//                  attributes.  **NOTE** month is 0-11.
				return (
					d.constructor === Date ? d : d.constructor === Array ? new Date(d[0], d[1] - 1, d[2]) :
							d.constructor === Number ? new Date(d) :
									d.constructor === String ? new Date(d) :
											typeof d === "object" ? new Date(d.year, d.month, d.date) : NaN
				);
			},
			compare : function (a, b) {
				// Compare two dates (could be of any type supported by the convert
				// function above) and returns:
				//  -1 : if a < b
				//   0 : if a = b
				//   1 : if a > b
				// NaN : if a or b is an illegal date
				// NOTE: The code inside isFinite does an assignment (=).
				return (
					isFinite(a = _pe.fn.calendar.dates.convert(a).valueOf()) && isFinite(b = _pe.fn.calendar.dates.convert(b).valueOf()) ? (a > b) - (a < b) : NaN
				);
			},
			inRange : function (d, start, end) {
				// Checks if date in d is between dates in start and end.
				// Returns a boolean or NaN:
				//    true  : if d is between start and end (inclusive)
				//    false : if d is before start or after end
				//    NaN   : if one or more of the dates is illegal.
				// NOTE: The code inside isFinite does an assignment (=).
				return (
					isFinite(d = _pe.fn.calendar.dates.convert(d).valueOf()) && isFinite(start = _pe.fn.calendar.dates.convert(start).valueOf()) && isFinite(end = _pe.fn.calendar.dates.convert(end).valueOf()) ? start <= d && d <= end : NaN
				);
			},
			daysInMonth: function (iYear, iMonth) {
				// Simplfied function to allow for us to get the days in specific months
				return 32 - new Date(iYear, iMonth, 32).getDate();
			},
			daysBetween: function (datelow, datehigh) {
				// simplified conversion to date object
				var date1 = _pe.fn.calendar.dates.convert(datelow),
					date2 = _pe.fn.calendar.dates.convert(datehigh),
					DSTAdjust = 0,
					oneMinute = 1000 * 60,
					oneDay = oneMinute * 60 * 24,
					diff;
				// equalize times in case date objects have them
				date1.setHours(0);
				date1.setMinutes(0);
				date1.setSeconds(0);
				date2.setHours(0);
				date2.setMinutes(0);
				date2.setSeconds(0);
				// take care of spans across Daylight Saving Time changes
				if (date2 > date1) {
					DSTAdjust = (date2.getTimezoneOffset() - date1.getTimezoneOffset()) * oneMinute;
				} else {
					DSTAdjust = (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * oneMinute;
				}
				diff = Math.abs(date2.getTime() - date1.getTime()) - DSTAdjust;
				return Math.ceil(diff / oneDay);
			}
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));