/**
 * @title WET-BOEW Calendar library
 * @overview A library for building calendar interfaces
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once
 * per page, not once per instance of plugin on the page. So, this is a good
 * place to define variables that are common to all instances of the plugin on a
 * page.
 */
var namespace = "wb-cal",
	setFocusEvent = "setfocus.wb",
	createEvent = "create." + namespace,
	displayedEvent = "displayed." + namespace,
	hideGoToFrmEvent = "hideGoToFrm." + namespace,
	setFocusCalEvent = "setFocus." + namespace,
	$document = wb.doc,
	i18n, i18nText,

	/**
	 * Creates a calendar instance
	 * @method create
	 */
	create = function( event, calendarId, year, month, shownav, mindate,
		maxdate, day, ariaControls, ariaLabelledBy ) {

		if ( event.namespace === namespace ) {
			var calendar = document.getElementById( calendarId ),
				$calendar = $( calendar ),
				objCalendarId = "#cal-" + calendarId + "-cnt",
				fromDateISO = wb.date.fromDateISO,
				$objCalendar, $calendarHeader, $oldCalendarHeader, $days, $daysList,
				maxDateYear, maxDateMonth, minDateYear, minDateMonth;

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					monthNames: i18n( "mnths" ),
					prevMonth: i18n( "prvMnth" ),
					nextMonth: i18n( "nxtMnth" ),
					goToTitle: i18n( "cal-goToTtl" ),
					goToYear: i18n( "cal-goToYr" ),
					goToMonth: i18n( "cal-goToMnth" ),
					goToLink: i18n( "cal-goToLnk" ),
					goToBtn: i18n( "cal-goToBtn" ),
					cancelBtn: i18n( "cancel" ),
					dayNames: i18n( "days" ),
					currDay: i18n( "currDay" )
				};
			}

			$calendar
				.addClass( "cal-cnt" )
				.attr( "id", calendarId );

			if ( ariaLabelledBy ) {
				$calendar.attr({
					"aria-controls": ariaControls,
					"aria-labelledby": ariaLabelledBy
				});
			}

			// Converts min and max date from string to date objects
			if ( typeof mindate === "string" ) {
				mindate = fromDateISO( mindate );
			} else if ( !( typeof mindate === "object" && mindate.getFullYear() ) ) {
				mindate = null;
			}
			if ( mindate === null ) {
				mindate = new Date();
				mindate.setFullYear( year - 1, month, 1 );
			}

			if ( typeof maxdate === "string" ) {
				maxdate = fromDateISO( maxdate );
			} else if ( typeof maxdate !== "object" || maxdate.constructor !== Date ) {
				maxdate = new Date();
				maxdate.setFullYear( year + 1, month, 1 );
			}

			// Validates that the year and month are in the min and max date range
			maxDateYear = maxdate.getFullYear();
			maxDateMonth = maxdate.getMonth();
			minDateYear = mindate.getFullYear();
			minDateMonth = mindate.getMonth();
			if ( year > maxDateYear || ( year === maxDateYear && month > maxDateMonth ) ) {
				year = maxDateYear;
				month = maxDateMonth;
			} else if ( year < minDateYear || ( year === minDateYear && month < minDateMonth ) ) {
				year = minDateYear;
				month = minDateMonth;
			}

			// Reset calendar if the calendar previously existed
			$objCalendar = $( objCalendarId );
			if ( $objCalendar.length !== 0 ) {
				$objCalendar.find( "#cal-" + calendarId + "-wd, .cal-mnth, #cal-" + calendarId + "-days").remove();
				$objCalendar = $calendar.children("#cal-" + calendarId + "-cnt");
			} else {
				$objCalendar = $( "<table id='cal-" + calendarId + "-cnt' class='cal-cnt'></table>" );
				$calendar.append( $objCalendar );
			}

			// Creates the calendar header
			$calendarHeader = $( "<div class='cal-hd'></div>" );

			// Create the month navigation
			$calendarHeader.append( shownav ?
				createMonthNav( calendarId, year, month, mindate, maxdate, minDateYear, maxDateYear ) :
				"<div class='cal-mnth'>" + i18nText.monthNames[ month ] + " " + year + "</div>"
			);

			$oldCalendarHeader = $objCalendar.prev( ".cal-hd" );
			if ( $oldCalendarHeader.length === 0 ) {
				$objCalendar.before( $calendarHeader );
			} else {
				$oldCalendarHeader.replaceWith( $calendarHeader );
			}

			// Create the calendar body

			// Creates weekdays
			$objCalendar.append( createWeekdays( calendarId ) );

			// Creates the rest of the calendar
			$days = createDays( calendarId, year, month );
			$daysList = $days.find( "td:not(.cal-empty)" );

			$objCalendar.append( $days );

			// Trigger the displayed.wb-cal event
			$calendar.trigger( displayedEvent, [ year, month, $daysList, day ] );
		}
	},

	createMonthNav = function( calendarId, year, month, minDate, maxDate, minDateYear, maxDateYear ) {
		var monthNames = i18nText.monthNames,
			$monthNav = $( "<div id='cal-" + calendarId + "-mnthnav'></div>" ),
			buttonStart = "<button type='button' class='cal-",
			buttonSpecs = [
				[
					"prvmnth",
					-1,
					i18nText.prevMonth,
					"prepend"
				],
				[
					"nxtmnth",
					1,
					i18nText.nextMonth,
					"append"
				]
			],
			alt, $btn, buttonSpec, buttonClass, newMonth, newYear, hideButton, index;

		// Create the go to form
		$monthNav.append( createGoToForm( calendarId, year, month, minDate, maxDate ) );

		for ( index = 0; index !== 2; index += 1 ) {
			buttonSpec = buttonSpecs[ index ];
			buttonClass = buttonSpec[ 0 ];
			newMonth = month + buttonSpec[ 1 ];
			if ( newMonth < 0 ) {
				newMonth = 11;
				newYear = year - 1;
			} else if ( newMonth > 11 ) {
				newMonth = 0;
				newYear = year + 1;
			} else {
				newYear = year;
			}

			hideButton = ( index === 0 ?
				( ( newYear === minDateYear && newMonth < minDate.getMonth() ) || newYear < minDateYear ) :
				( ( newYear === maxDateYear && newMonth > maxDate.getMonth() ) || newYear > maxDateYear )
			);
			alt = buttonSpec[ 2 ] + monthNames[ newMonth ] + " " + newYear;
			$btn = $monthNav.find( ".cal-" + buttonClass );

			$btn = $( buttonStart + buttonClass + "' title='" + alt +
				"'><span class='glyphicon glyphicon-arrow-" +
				( buttonSpec[ 0 ] === "prvmnth" ? "left" : "right" ) +
				"'></span><span class='wb-inv'>" + alt + "</button>" );
			$monthNav[ buttonSpec[ 3 ] ]( $btn );

			$btn.toggleClass( "active", !hideButton );

			if ( !hideButton ) {
				$btn
					.removeAttr( "disabled" )
					.on( "click", {
						calID: calendarId,
						year: newYear,
						month: newMonth,
						mindate: minDate,
						maxdate: maxDate
					}, changeMonth );
			} else {
				$btn
					.attr( "disabled", "disabled" )
					.off( "click" );
			}
		}

		return $monthNav;
	},

	changeMonth = function( event ) {
		event.preventDefault();

		var which = event.which,
			btn = event.target,
			$btn = $( btn ),
			classes = btn.className,
			eventData = event.data,
			$container = $btn.closest( ".cal-cnt" );

		// Ignore middle/right mouse buttons
		if ( !which || which === 1 ) {

			if ( typeof eventData !== "undefined" ) {
				$document.trigger( createEvent, [
					eventData.calID,
					eventData.year,
					eventData.month,
					true,
					eventData.mindate,
					eventData.maxdate
				]);
			}

			$container.find( classes.indexOf( "wb-inv" ) !== -1 ?
				".cal-goto-lnk a" :
				"." + classes.match( /cal-[a-z]*mnth/i )
			).trigger( setFocusEvent );

			return false;
		}
	},

	yearChanged = function( event ) {
		var year = parseInt( this.value, 10 ),
			eventData = event.data,
			minDate = eventData.minDate,
			maxDate = eventData.maxDate,
			$monthField = eventData.$monthField,
			value = $monthField.val(),
			month = value ? value : eventData.month,
			minMonth = 0,
			maxMonth = 12,
			monthNames = i18nText.monthNames,
			newMonthField = "<select id='" + $monthField.attr( "id" ) +
				"' title='" + $monthField.attr( "title" ) + "'>",
			i;

		if ( year === minDate.getFullYear() ) {
			minMonth = minDate.getMonth();
		}

		if ( year === maxDate.getFullYear() ) {
			maxMonth = maxDate.getMonth() + 1;
		}

		for ( i = minMonth; i !== maxMonth; i += 1 ) {
			newMonthField += "<option value='" + i + "'" + ( ( i === month ) ? " selected='selected'" : "" ) +
				">" + monthNames[ i ] + "</option>";
		}
		$monthField.replaceWith( newMonthField + "</select>" );
	},

	createGoToForm = function( calendarId, year, month, minDate, maxDate ) {
		var $goToForm = $( "<div class='cal-goto'></div>" ),
			$form = $( "<form id='cal-" + calendarId + "-goto' role='form' style='display:none;' action=''></form>" ),
			$yearContainer, yearField, $yearField, y, ylen, $monthContainer, $monthField;

		$form.on( "submit", function( event ) {
			event.preventDefault();
			onGoTo( calendarId, minDate, maxDate );
			return false;
		});

		// Create the year field
		$yearContainer = $( "<div class='cal-goto-yr'></div>" );
		yearField = "<select title='" + i18nText.goToYear + "' id='cal-" + calendarId + "-goto-year'>";
		for ( y = minDate.getFullYear(), ylen = maxDate.getFullYear() + 1; y !== ylen; y += 1 ) {
			yearField += "<option value='" + y + "'" + ( y === year ? " selected='selected'" : "" ) + ">" + y + "</option>";
		}
		$yearField = $( yearField + "</select>" );

		// Create the month field
		$monthContainer = $( "<div class='cal-goto-mnth'></div>" );
		$monthField = $( "<select title='" + i18nText.goToMonth + "' id='cal-" + calendarId + "-goto-month'></select>" );

		$monthContainer.append( $monthField );

		// Create the year field
		$yearContainer.append( $yearField );

		// Update the list of available months when changing the year
		$yearField.on( "change", { minDate: minDate, maxDate: maxDate, month: month, $monthField: $monthField }, yearChanged );

		// Populate initial month list
		$yearField.trigger( "change" );

		$form
			.append( $monthContainer )
			.append( $yearContainer )
			.append( "<div class='clearfix'></div>" +
				"<div class='cal-goto-btn'><input type='submit' class='btn btn-primary' value='" +
				i18nText.goToBtn + "' /></div>" +
				"<div class='cal-goto-btn'><input type='button' class='btn btn-default cal-goto-cancel' value='" +
				i18nText.cancelBtn + "' /></div>" );

		$goToForm
			.append( "<div id='cal-" +
				calendarId + "-goto-lnk'><a href='javascript:;' role='button' aria-controls='cal-" +
				calendarId + "-goto' class='cal-goto-lnk' aria-expanded='false'>" +
				i18nText.monthNames[ month ] + " " + year + "</a></div>" )
			.append( $form );

		return $goToForm;
	},

	createWeekdays = function( calendarId ) {
		var weekdays = "<thead id='cal-" + calendarId + "-days' class='cal-wd' role='presentation'><tr>",
			dayNames = i18nText.dayNames,
			wd, wd1, dayName;
		for ( wd = 0; wd < 7; wd += 1 ) {
			dayName = dayNames[ wd ];
			wd1 = wd + 1;
			weekdays += "<th id='cal-" + calendarId + "-wd" + wd1 + "' class='cal-wd cal-wd" + wd1 +
				( wd === 0 || wd === 6 ? "we" : "" ) + "' role='columnheader'><abbr title='" + dayName + "'>" +
				dayName.charAt( 0 ) + "</abbr></th>";
		}

		return $( weekdays + "</tr></thead>" );
	},

	createDays = function( calendarId, year, month ) {
		var cells = "<tbody id='cal-" + calendarId + "-days' class='cal-days'>",
			date = new Date(),
			textWeekDayNames = i18nText.dayNames,
			textMonthNames = i18nText.monthNames,
			textCurrentDay = i18nText.currDay,
			frenchLang = ( document.documentElement.lang === "fr" ),
			breakAtEnd = false,
			dayCount = 0,
			firstDay, lastDay, week, day, currYear, currMonth, currDay, id, className, isCurrentDate;

		// Get the day of the week of the first day of the month | Determine le jour de la semaine du premier jour du mois
		date.setFullYear( year, month, 1 );
		firstDay = date.getDay();

		// Get the last day of the month | Determine le dernier jour du mois
		date.setFullYear( year, month + 1, 0 );
		lastDay = date.getDate() - 1;

		// Get the current date
		date = new Date();
		currYear = date.getFullYear();
		currMonth = date.getMonth();
		currDay = date.getDate();

		for ( week = 1; week < 7; week += 1 ) {
			cells += "<tr>";
			for ( day = 0; day < 7; day += 1 ) {

				id = "cal-" + calendarId + "-w" + week + "d" + ( day + 1 );
				className = ( day === 0 || day === 6 ? "cal-we" : "" ) +
					"cal-w" + week + "d" + ( day + 1 );

				if ( ( week === 1 && day < firstDay ) || ( dayCount > lastDay ) ) {

					// Creates empty cells | Cree les cellules vides
					cells += "<td id='" + id + "' class='cal-empty " + className + "'>&#160;</td>";
				} else {

					// Creates date cells | Cree les cellules de date
					dayCount += 1;
					className += " cal-index-" + dayCount;
					isCurrentDate = ( dayCount === currDay && month === currMonth && year === currYear );

					cells += "<td id='" + id + "' class='" + ( isCurrentDate ? "cal-currday " : "" ) +
						className + "'><div><time datetime='" + year + "-" +
						( month < 9 ? "0" : "" ) + ( month + 1 ) + "-" + ( dayCount < 10 ? "0" : "" ) +
						dayCount + "'><span class='wb-inv'>" + textWeekDayNames[ day ] +
						( frenchLang ? ( " </span>" + dayCount + "<span class='wb-inv'> " +
						textMonthNames[ month ].toLowerCase() + " " ) :
						( " " + textMonthNames[ month ] + " </span>" + dayCount +
						"<span class='wb-inv'>&#160;" ) ) + year +
						( isCurrentDate ? textCurrentDay : "" ) + "</span></time></div></td>";

					if ( dayCount > lastDay ) {
						breakAtEnd = true;
					}
				}
			}
			cells += "</tr>";
			if ( breakAtEnd ) {
				break;
			}
		}
		cells += "</tbody>";

		return $( cells );
	},

	showGoToForm = function( calendarId ) {
		var gotoId = "#cal-" + calendarId + "-goto";

		$( "#" + calendarId )
			.find( gotoId + "-lnk, .cal-prvmnth, .cal-nxtmnth" )
				.addClass( "hide" )
				.attr( "aria-hidden", "true" )
				.filter( "a" )
					.attr( "aria-expanded", "true" );

		// TODO: Replace with CSS animation
		$( gotoId ).stop().slideDown( 0 ).queue(function() {
			$( this ).find( ":input:eq(0)" ).trigger( setFocusEvent );
		});
	},

	hideGoToFrm = function( event ) {
		if ( event.namespace === namespace ) {
			var calendarId = event.target.id,
				gotoId = "#cal-" + calendarId + "-goto";

			$( "#" + calendarId )
				.find( gotoId + "-lnk, .cal-prvmnth, .cal-nxtmnth" )
					.removeClass( "hide" )
					.attr( "aria-hidden", "false" )
					.filter( "a" )
						.attr( "aria-expanded", "false" );

			// TODO: Replace with CSS animation
			$( gotoId ).stop().slideUp( 0 );
		}
	},

	onGoTo = function( calendarId, minDate, maxDate ) {
		var $container = $( "#" + calendarId ),
			$form = $container.find( "#cal-" + calendarId + "-goto" ),
			month = parseInt( $form.find( ".cal-goto-mnth select option:selected" ).val(), 10 ),
			year = parseInt( $form.find( ".cal-goto-yr select" ).val(), 10 );

		if ( !( month < minDate.getMonth() && year <= minDate.getFullYear() ) && !( month > maxDate.getMonth() && year >= maxDate.getFullYear() ) ) {
			$document.trigger( createEvent, [
				calendarId,
				year,
				month,
				true,
				minDate,
				maxDate
			]);
			$container.trigger( hideGoToFrmEvent );

			// Go to the first day to avoid having to tab over the navigation again.
			$( "#cal-" + calendarId + "-days a" )
				.eq( 0 )
				.trigger( setFocusEvent );
		}
	},

	setFocus = function( event, calendarId, year, month, minDate, maxDate, targetDate ) {
		var time;

		if ( event.namespace === namespace ) {
			time = targetDate.getTime();

			if ( time < minDate.getTime() ) {
				targetDate = minDate;
			} else if ( time > maxDate.getTime() ) {
				targetDate = maxDate;
			}

			if ( targetDate.getMonth() !== month || targetDate.getFullYear() !== year ) {
				$document.trigger( createEvent, [
						calendarId,
						targetDate.getFullYear(),
						targetDate.getMonth(),
						true,
						minDate,
						maxDate,
						targetDate.getDate()
					]
				);
			}
		}
	};

// Event binding
$document.on( createEvent, create );

// Keyboard nav
$document.on( "keydown", ".cal-days a", function( event ) {
	var elm = event.target,
		$elm = $( elm ),
		$monthContainer = $elm.closest( ".cal-cnt" ),
		$container = $monthContainer.parent().closest( ".cal-cnt" ),
		calendarId = $container.attr( "id" ),
		fieldId = $container.attr( "aria-controls" ),
		which = event.which,
		fromDateISO = wb.date.fromDateISO,
		date = fromDateISO(
			(
				elm.className.indexOf( "cal-evt-lnk" ) === -1 ?
					elm : elm.parentNode.parentNode.previousSibling
			).getElementsByTagName( "time" )[ 0 ].getAttribute( "datetime" )
		),

		// Clone the date to keep a copy of the current date
		currDate = new Date( date.getTime() ),
		currYear = currDate.getFullYear(),
		currMonth = currDate.getMonth(),
		currDay = currDate.getDate(),
		field, minDate, maxDate, modifier, $links, $link,
		events, i, len, eventDate;

	if ( fieldId ) {
		field = document.getElementById( fieldId );
		minDate = field.getAttribute( "min" );
		maxDate = field.getAttribute( "max" );
	} else {
		minDate = $container.data( "minDate" );
		maxDate = $container.data( "maxDate" );
	}

	minDate = fromDateISO( ( minDate ? minDate : "1800-01-01" ) );
	maxDate = fromDateISO( ( maxDate ? maxDate : "2100-01-01" ) );

	if ( !event.altKey && !event.metaKey && which > 31 && which < 41 ) {
		switch ( which ) {

		// spacebar
		case 32:
			$elm.trigger( "click" );
			return false;

		// page up / page down
		case 33:
		case 34:
			modifier = ( which === 33 ? -1 : 1 );

			if ( event.ctrlKey ) {
				date.setYear( currYear + modifier );
			} else {
				date.setMonth( currMonth + modifier );
			}
			break;

		// end / home
		case 35:
		case 36:
			$links = $monthContainer.find( "td > a" );
			$link = which === 35 ? $links.last() : $links.first();
			date.setDate( fromDateISO( $link.find( "time" ).attr( "datetime" ) ).getDate() );
			break;

		// left arrow key
		case 37:
			date.setDate( currDay - 1 );
			break;

		// up arrow key
		case 38:
			date.setDate( currDay - 7 );
			break;

		// right arrow key
		case 39:
			date.setDate( currDay + 1 );
			break;

		// down arrow key
		case 40:
			date.setDate( currDay + 7 );
			break;
		}

		// If in a calendar of events then correct the date to the
		// appropriate event date if the new date is in a different year
		// or month or the date in the current month doesn't have a link
		if ( $container.hasClass( "wb-calevt-cal" ) &&
			( currYear !== date.getFullYear() || currMonth !== date.getMonth() ||
			$monthContainer.find( ".cal-index-" + date.getDate() + " > a" ).length === 0 ) ) {

			events = $container.data( "calEvents" ).list;
			len = events.length;

			// New date is later than the current date so find
			// the first event date after the new date
			if ( currDate < date ) {
				for ( i = 0; i !== len; i += 1 ) {
					eventDate = events[ i ].date;
					if ( eventDate.getTime() >= date.getTime() ) {
						break;
					}
				}

			// New date is earlier than the current date so find
			// the first event date before the new date
			} else {
				for ( i = len - 1; i !== -1; i -= 1 ) {
					eventDate = events[ i ].date;
					if ( eventDate.getTime() <= date.getTime() ) {
						break;
					}
				}
			}

			// Update new date if appropriate event date was found
			if ( ( i !== len && i !== -1 ) ||
				( i === len && currDate < eventDate ) ||
				( i === -1 && currDate > eventDate ) ) {

				date = eventDate;
			} else {
				date = currDate;
			}
		}

		// Move focus to the new date
		if ( currYear !== date.getFullYear() || currMonth !== date.getMonth() ) {
			$document.trigger( setFocusCalEvent, [
					calendarId,
					currYear,
					currMonth,
					minDate,
					maxDate,
					date
				]
			);
		} else if ( currDay !== date.getDate() ) {
			$monthContainer.find( ".cal-index-" + date.getDate() + " > a" ).trigger( setFocusEvent );
		}

		return false;
	}
});

$document.on( hideGoToFrmEvent, ".cal-cnt", hideGoToFrm );

$document.on( setFocusCalEvent, setFocus );

$document.on( "click", ".cal-goto-lnk", function( event ) {
	event.preventDefault();

	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		showGoToForm( $( event.currentTarget ).closest( ".cal-cnt" ).attr( "id" ) );
	}
});

$document.on( "click", ".cal-goto-cancel", function( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		$( event.currentTarget ).closest( ".cal-cnt" ).trigger( hideGoToFrmEvent );
	}
});

})( jQuery, window, document, wb );
