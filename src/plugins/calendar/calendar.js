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
var $document = wb.doc,
	i18n, i18nText,

	/**
	 * Creates a calendar instance
	 * @method create
	 */
	create = function( event, calendarId, year, month, shownav, mindate,
		maxdate, day, ariaControls, ariaLabelledBy ) {

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
		$calendar.trigger( "displayed.wb-cal", [ year, month, $daysList, day ] );
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
				$document.trigger( "create.wb-cal", [
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
			).trigger( "setfocus.wb" );

			return false;
		}
	},

	yearChanged = function( event ) {
		var year = parseInt( this.value, 10 ),
			eventData = event.data,
			minDate = eventData.minDate,
			maxDate = eventData.maxDate,
			$monthField = eventData.$monthField,
			minMonth = 0,
			maxMonth = 11,
			monthNames = i18nText.monthNames,
			month, i;

		if ( year === minDate.getFullYear() ) {
			minMonth = minDate.getMonth();
		}

		if ( year === maxDate.getFullYear() ) {
			maxMonth = maxDate.getMonth() + 1;
		}

		month = $monthField.val();

		// Can't use $monthField.empty() or .html("") on <select> in IE
		// http://stackoverflow.com/questions/3252382/why-does-dynamically-populating-a-select-drop-down-list-element-using-javascript
		for ( i = $monthField.length - 1 ; i !== -1; i -= 1 ) {
			$monthField[ i ].remove( i );
		}

		for ( i = minMonth; i !== maxMonth; i += 1 ) {
			$monthField.append( "<option value='" + i + "'" + ( (i === month ) ? " selected='selected'" : "" ) +
				">" + monthNames[ i ] + "</option>" );
		}
	},

	createGoToForm = function( calendarId, year, month, minDate, maxDate ) {
		var $goToForm = $( "<div class='cal-goto'></div>" ),
			$form = $( "<form id='cal-" + calendarId + "-goto' role='form' style='display:none;' action=''></form>" ),
			$yearContainer, $yearField, y, ylen, $monthContainer, $monthField, $buttonSubmit,
			$buttonCancel, $goToLink;

		$form.on( "submit", function( event ) {
			event.preventDefault();
			onGoTo( calendarId, minDate, maxDate );
			return false;
		});

		// Create the year field
		$yearContainer = $( "<div class='cal-goto-yr'></div>" );
		$yearField = $( "<select title='" + i18nText.goToYear + "' id='cal-" + calendarId + "-goto-year'></select>" );
		for ( y = minDate.getFullYear(), ylen = maxDate.getFullYear(); y <= ylen; y += 1 ) {
			$yearField.append( $( "<option value='" + y + "'" + (y === year ? " selected='selected'" : "" ) + ">" + y + "</option>" ) );
		}

		// Create the month field
		$monthContainer = $( "<div class='cal-goto-mnth'></div>" );
		$monthField = $( "<select title='" + i18nText.goToMonth + "' id='cal-" + calendarId + "-goto-month'></select>" );

		$monthContainer.append( $monthField );

		// Create the year field
		$yearContainer.append( $yearField );

		// Update the list of available months when changing the year
		$yearField.on( "change", { minDate: minDate, maxDate: maxDate, $monthField: $monthField }, yearChanged );

		// Populate initial month list
		$yearField.trigger( "change" );

		$buttonSubmit = $( "<div class='cal-goto-btn'><input type='submit' class='btn btn-primary' value='" +
			i18nText.goToBtn + "' /></div>" );

		$buttonCancel = $( "<div class='cal-goto-btn'><input type='button' class='btn btn-default' value='" +
			i18nText.cancelBtn + "' /></div>" );
		$buttonCancel.on( "click", "input", function( event ) {
			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				$( "#" + calendarId ).trigger( "hideGoToFrm.wb-cal" );
			}
		});

		$form
			.append( $monthContainer )
			.append( $yearContainer )
			.append( "<div class='clearfix'></div>" )
			.append( $buttonSubmit )
			.append( $buttonCancel );

		$goToLink = $( "<div id='cal-" +
			calendarId + "-goto-lnk'><a href='javascript:;' role='button' aria-controls='cal-" +
			calendarId + "-goto' class='cal-goto-lnk' aria-expanded='false'>" +
			i18nText.monthNames[ month ] + " " + year + "</a></div>" );
		$goToLink.on( "click", "a", function( event ) {
			event.preventDefault();

			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				showGoToForm( calendarId );
			}
		} );

		$goToForm
			.append( $goToLink )
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

					cells += "<td id='" + id + "' class='" + ( isCurrentDate ? "cal-currday " : "" ) + className + "'><div><time datetime='" + year + "-" +
						( month < 9 ? "0" : "" ) + ( month + 1 ) + "-" + ( dayCount < 10 ? "0" : "" ) + dayCount + "'><span class='wb-inv'>" + textWeekDayNames[ day ] +
						( frenchLang ? ( " </span>" + dayCount + "<span class='wb-inv'> " + textMonthNames[ month ].toLowerCase() + " " ) :
						( " " + textMonthNames[ month ] + " </span>" + dayCount + "<span class='wb-inv'>&nbsp;" ) ) + year +
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
		var gotoId = "#cal-" + calendarId + "-goto",
			$form = $( gotoId ),
			$buttons = $( "#" + calendarId ).find( gotoId + "-lnk, .cal-prvmnth, .cal-nxtmnth" );

		$buttons
			.addClass( "hide" )
			.attr( "aria-hidden", "true" )
			.filter( "a" )
				.attr( "aria-expanded", "true" );

		// TODO: Replace with CSS animation
		$form.stop().slideDown( 0 ).queue(function() {
			$( this ).find( ":input:eq(0)" ).trigger( "setfocus.wb" );
		});
	},

	hideGoToFrm = function( event ) {
		var calendarId = event.target.id,
			gotoId = "#cal-" + calendarId + "-goto",
			$form = $( gotoId ),
			$buttons = $( "#" + calendarId ).find( gotoId + "-lnk, .cal-prvmnth, .cal-nxtmnth" );

		$buttons
			.removeClass( "hide" )
			.attr( "aria-hidden", "false" )
			.filter( "a" )
				.attr( "aria-expanded", "false" );

		// TODO: Replace with CSS animation
		$form.stop().slideUp( 0 );
	},

	onGoTo = function( calendarId, minDate, maxDate ) {
		var $container = $( "#" + calendarId ),
			$form = $container.find( "#cal-" + calendarId + "-goto" ),
			month = parseInt( $form.find( ".cal-goto-mnth select option:selected" ).val(), 10 ),
			year = parseInt( $form.find( ".cal-goto-yr select" ).val(), 10 );

		if (!(month < minDate.getMonth() && year <= minDate.getFullYear()) && !(month > maxDate.getMonth() && year >= maxDate.getFullYear())) {
			$document.trigger( "create.wb-cal", [
				calendarId,
				year,
				month,
				true,
				minDate,
				maxDate
			]);
			$container.trigger( "hideGoToFrm.wb-cal" );

			// Go to the first day to avoid having to tab over the navigation again.
			$( "#cal-" + calendarId + "-days a" )
				.eq( 0 )
				.trigger( "setfocus.wb" );
		}
	},

	setFocus = function( event, calendarId, year, month, minDate, maxDate, targetDate ) {
		var time = targetDate.getTime();

		if ( time < minDate.getTime() ) {
			targetDate = minDate;
		} else if ( time > maxDate.getTime() ) {
			targetDate = maxDate;
		}

		if ( targetDate.getMonth() !== month || targetDate.getFullYear() !== year ) {
			$document.trigger( "create.wb-cal", [
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
	};

// Event binding
$document.on( "create.wb-cal", create );

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
		date = fromDateISO( elm.getElementsByTagName( "time" )[ 0 ].getAttribute( "datetime" ) ),
		currYear = date.getFullYear(),
		currMonth = date.getMonth(),
		currDay = date.getDate(),
		days = $monthContainer.find( "td > a" ).get(),
		maxDay = days.length,
		field, minDate, maxDate, modifier;

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

		// end key
		case 35:
			date.setDate( maxDay );
			break;

		// home key
		case 36:
			date.setDate( 1 );
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

		// Move focus to the new date
		if ( currYear !== date.getFullYear() || currMonth !== date.getMonth() ) {
			$document.trigger( "setFocus.wb-cal", [
					calendarId,
					currYear,
					currMonth,
					minDate,
					maxDate,
					date
				]
			);
		} else if ( currDay !== date.getDate() ) {
			$( days[ date.getDate() - 1 ] ).trigger( "setfocus.wb" );
		}

		return false;
	}
});

$document.on( "hideGoToFrm.wb-cal", ".cal-cnt", hideGoToFrm );

$document.on( "setFocus.wb-cal", setFocus );

})( jQuery, window, document, wb );
