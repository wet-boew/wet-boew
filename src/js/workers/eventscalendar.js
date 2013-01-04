/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Events Calendar
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.eventscalendar = {
		type: 'plugin',
		depends: ['calendar', 'xregexp'],
		_exec: function (elm) {
			var date = new Date(),
				calendar = _pe.fn.calendar,
				year = date.getFullYear(),
				month = date.getMonth(),
				elm_year = elm.find('.year'),
				elm_month = elm.find('.month'),
				digit,
				events,
				containerid,
				getEvents,
				randomId,
				addEvents,
				showOnlyEventsFor,
				keyboardNavEvents,
				keyboardNavCalendar,
				mouseOnDay,
				mouseOutDay,
				focusDay,
				blurDay,
				blurEvent,
				focusEvent;

			getEvents = function (obj) {
				// set some defaults due to classing over-rides
				var direct_linking = !($(obj).hasClass('event-anchoring')), // do we want to link to event calendar or not - this will forced the links in the calendar to be page id if true
					events = {
						minDate: null,
						maxDate: null,
						iCount: 0,
						list: [
							{
								a: 1
							}
						]
					},
					objEventsList = null;

				if (obj.find('ol').length > 0) {
					objEventsList = obj.find('ol');
				} else if (obj.find('ul').length > 0) {
					objEventsList = obj.find('ul');
				}

				if (objEventsList.length > 0) {
					objEventsList.children('li').each(function () {
						var event = $(this),
							_objTitle = event.find('*:header:first'),
							title = _objTitle.text(),
							_origLink = event.find('a').first(),
							link = _origLink.attr('href'),
							link_id,
							date,
							tCollection,
							strDate1,
							strDate2,
							strDate,
							z,
							_zlen;

						/** Modification direct-linking or page-linking
						*	- added the ability  to have class set the behaviour of the links
						*	- default is to use the link of the item as the event link in the calendar
						*	- 'event-anchoring' class dynamically generates page anchors on the links it maps to the event
						***/
						if (!direct_linking) {
							link_id = (event.attr('id') !== undefined) ? event.attr('id') : randomId(6);
							event.attr('id', link_id);

							//Fixes IE tabbing error (http://www.earthchronicle.com/ECv1point8/Accessibility01IEAnchoredKeyboardNavigation.aspx)
							if (pe.ie > 0) {
								event.attr('tabindex', '-1');
							}
							link = '#' + link_id;
						}
						/*** Modification XHTML 1.0 strict compatible
						*	- XHTML 1.0 Strict does not contain the time element
						****/
						date = new Date();
						tCollection = event.find('time, span.datetime');
						/** Date spanning capability
						*	- since there maybe some dates that are capable of spanning over months we need to identify them
						*	the process is see how many time nodes are in the event. 2 nodes will trigger a span
						*/
						if (tCollection.length > 1) {
							// this is a spanning event
							strDate1 = ($(tCollection[0]).get(0).nodeName.toLowerCase() === 'time') ? $(tCollection[0]).attr('datetime').substr(0, 10).split('-') :  $(tCollection[0]).attr('class').match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split('-');
							strDate2 = ($(tCollection[1]).get(0).nodeName.toLowerCase() === 'time') ? $(tCollection[1]).attr('datetime').substr(0, 10).split('-') :  $(tCollection[1]).attr('class').match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split('-');

							date.setFullYear(strDate1[0], strDate1[1] - 1, strDate1[2]);

							// now loop in events to load up all the days that it would be on tomorrow.setDate(tomorrow.getDate() + 1);
							for (z = 0, _zlen = pe.date.daysBetween(strDate1, strDate2) + 1; z <= _zlen; z += 1) {
								if (events.minDate === null || date < events.minDate) {
									events.minDate = date;
								}
								if (events.maxDate === null || date > events.maxDate) {
									events.maxDate = date;
								}

								events.list[events.iCount] = { 'title': title, 'date': new Date(date.getTime()), 'href': link };
								date = new Date(date.setDate(date.getDate() + 1));
								// add a viewfilter
								if (!_objTitle.hasClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2))) {
									_objTitle.addClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2));
								}
								events.iCount += 1;
							}

						} else if (tCollection.length === 1) {
							// this is a single day event
							strDate = ($(tCollection[0]).get(0).nodeName.toLowerCase() === 'time') ? $(tCollection[0]).attr('datetime').substr(0, 10).split('-') : $(tCollection[0]).attr('class').match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split('-');

							date.setFullYear(strDate[0], strDate[1] - 1, strDate[2]);

							if (events.minDate === null || date < events.minDate) {
								events.minDate = date;
							}
							if (events.maxDate === null || date > events.maxDate) {
								events.maxDate = date;
							}
							events.list[events.iCount] = {'title' : title, 'date' : date, 'href' : link};
							// add a viewfilter
							if (!_objTitle.hasClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2))) {
								_objTitle.addClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2));
							}
							events.iCount += 1;
						}

					// end of loop through objects/events
					});
				}

				window.events = events;
				return events;
			};
			randomId = function (sint) {
				var s = '',
					randomchar,
					n;
				randomchar = function () {
					n = Math.floor(Math.random() * 62);
					if (n < 10) {
						return n; //1-10
					}
					if (n < 36) {
						return String.fromCharCode(n + 55); //A-Z
					}
					return String.fromCharCode(n + 61); //a-z
				};
				while (s.length < sint) {
					s += randomchar();
				}
				return 'id' + s;
			};

			keyboardNavCalendar = function (event) {
				var i, evt;
				switch (event.keyCode) {
				case 13: // enter key
				case 32: // spacebar
				case 38: // up arrow
				case 40: // down arrow
					pe.focus(event.data.details.find('a').first());
					return false;
				case 37: // left arrow
					i = $(this).closest('li').index();
					evt = $(this).closest('ol').children('li:lt(' + i + ')').children('a').last();
					pe.focus(evt);
					return false;
				case 39: // right arrow
					i = $(this).closest('li').index();
					evt = $(this).closest('ol').children('li:gt(' + i + ')').children('a').first();
					pe.focus(evt);
					return false;
				case 27: // escape
					$(this).siblings('.ev-details').removeClass('ev-details').addClass('wb-invisible');
					return false;
				}
			};

			keyboardNavEvents = function (event) {
				var i, evt, length;
				switch (event.keyCode) {
				case 38: // up arrow
					i = $(this).closest('li').index();
					length = $(this).closest('ul').children('li').length;
					pe.focus($(this).closest('ul').children('li').eq((i - 1) % length).children('a'));
					// $(this).trigger('focus');
					return false;
				case 40: // down arrow
					i = $(this).closest('li').index();
					length = $(this).closest('ul').children('li').length;
					pe.focus($(this).closest('ul').children('li').eq((i + 1) % length).children('a'));
					return false;
				case 37: // left arrow
					i = $(this).closest('li[id^=cal-]').index();
					evt = $(this).closest('ol').children('li:lt(' + i + ')').children('a').last();
					pe.focus(evt);
					return false;
				case 39: // right arrow
					i = $(this).closest('li[id^=cal-]').index();
					evt = $(this).closest('ol').children('li:gt(' + i + ')').children('a').first();
					pe.focus(evt);
					return false;
				case 27: // escape
					pe.focus($(this).closest('li[id^=cal-]').children('.cal-event'));
					return false;
				}
			};

			mouseOnDay = function (event) {
				event.data.details.dequeue();
				event.data.details.removeClass('wb-invisible');
				event.data.details.addClass('ev-details');
			};

			mouseOutDay = function (event) {
				event.data.details.delay(100).queue(function () {
					$(this).removeClass('ev-details');
					$(this).addClass('wb-invisible');
					$(this).dequeue();
				});
			};

			focusDay = function (event) {
				event.data.details.removeClass('wb-invisible');
				event.data.details.addClass('ev-details');
			};

			blurDay = function (event) {
				setTimeout(function () {
					if (event.data.details.find('a:focus').length === 0) {
						event.data.details.removeClass('ev-details');
						event.data.details.addClass('wb-invisible');
					}
				}, 5);
			};

			blurEvent = function (event) {
				setTimeout(function () {
					if (event.data.details.find('a:focus').length === 0) {
						event.data.details.removeClass('ev-details');
						event.data.details.addClass('wb-invisible');
					}
				}, 5);
			};

			focusEvent = function (event) {
				event.data.details.removeClass('wb-invisible');
				event.data.details.addClass('ev-details');
			};

			addEvents = function (year, month, days, containerid, eventslist) {
				var e,
					_elen,
					date,
					day,
					content,
					dayEvents,
					link,
					eventDetails,
					item_link;

				//Fix required to make up with the IE z-index behavior mismatch
				days.each(function (index, day) {
					$(day).css('z-index', 31 - index);
				});
				//Determines for each event, if it occurs in the display month
				//@modification - the author used a jQuery native $.each function for looping. This is a great function, but has a tendency to like HTMLELEMENTS and jQuery objects better. We have modified this to a for loop to ensure that all the elements are accounted for.
				for (e = 0, _elen = eventslist.length; e !== _elen; e += 1) {
					date = new Date(eventslist[e].date);

					if (date.getMonth() === month && date.getFullYear() === year) {
						day = $(days[date.getDate() - 1]);
						//Gets the day cell to display an event
						content = day.children('div').html();

						// lets see if the cell is empty is so lets create the cell
						if (day.children('a').length < 1) {
							day.empty();
							link = $('<a href="#ev-' + day.attr('id') + '" class="cal-event">' + content + '</a>');
							day.append(link);
							dayEvents = $('<ul class="wb-invisible"></ul>');

							link.on('keydown', {details: dayEvents}, keyboardNavCalendar);

							//Show day events on mouse over
							day.on('mouseover', {details: dayEvents}, mouseOnDay);

							//Hide days events on mouse out
							day.on('mouseout', {details: dayEvents}, mouseOutDay);

							//Show day events when tabbing in
							link.on('focus', {details: dayEvents}, focusDay);
							//hide day events when tabbing out
							link.on('blur', {details: dayEvents}, blurDay);

							day.append(dayEvents);
						} else {
							// Modification - added and else to the date find due to event collisions not being handled. So the pointer was getting lost
							dayEvents = day.find('ul.wb-invisible');
						}

						eventDetails = $('<li><a href="' + eventslist[e].href +  '">' + eventslist[e].title + '</a></li>');

						if (pe.cssenabled) {
							eventDetails.children('a').attr('tabindex', '-1');
						}

						dayEvents.append(eventDetails);

						item_link = eventDetails.children('a');

						item_link.on('keydown', keyboardNavEvents);

						//Hide day events when the last event for the day loose focus
						item_link.on('blur', {details: dayEvents}, blurEvent);

						//Show day events when tabbing in
						item_link.on('focus', {details: dayEvents}, focusEvent);
					} // end of date range visible
				} // end of event list loop
			};
			showOnlyEventsFor = function (year, month, calendarid) {
				$('.' + calendarid + ' li.calendar-display-onshow').addClass('wb-invisible');
				$('.' + calendarid + ' li.calendar-display-onshow').has(':header[class*=filter-' + year + '-' + pe.string.pad(parseInt(month, 10) + 1, 2) + ']').removeClass('wb-invisible');
			};

			if (elm_year.length > 0 && elm_month.length > 0) {
				year = elm_year.text(); // we are going to assume this is always a number
				if (elm_month.hasClass('textformat')) {
					digit = $.inArray(elm_month.text(), pe.dic.get('%calendar-monthNames'));
					month = digit;
				} else {
					month = elm_month.text() - 1;
				}
			}

			events = getEvents(elm);
			containerid = $(elm).attr('class').split(' ').slice(-1);

			if ($('#wb-main-in').css('padding-left') === '0px') {
				$('#' + containerid).css('margin-left', '10px');
			}

			$('#' + containerid).on('calendarDisplayed', function (e, year, month, days) {
				addEvents(year, month, days, containerid, events.list);
				showOnlyEventsFor(year, month, containerid);
			});
			calendar.create(containerid, year, month, true, events.minDate, events.maxDate);

			$('#' + containerid).attr('role', 'application');
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
