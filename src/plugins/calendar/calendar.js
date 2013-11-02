/*
 * @title WET-BOEW Calendar library
 * @overview A library for building calendar interfaces
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once
 * per page, not once per instance of plugin on the page. So, this is a good
 * place to define variables that are common to all instances of the plugin on a
 * page.
 */
var $document = vapour.doc,
	i18n, i18nText,

	/*
	 * Creates a calendar instance
	 * @method create
	 */
	create = function( event, calendarId, year, month, shownav, mindate, maxdate, day ) {
		var calendar = document.getElementById( calendarId ),
			$calendar = $( calendar ),
			objCalendarId = "#cal-" + calendarId + "-cnt",
			fromDateISO = vapour.date.fromDateISO,
			$objCalendar, $calendarHeader, $days, $daysList,
			maxDateYear, maxDateMonth, minDateYear, minDateMonth;

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = window.i18n;
			i18nText = {
				monthNames: i18n( "%mnths" ),
				prevMonth: i18n( "%prvMnth" ),
				nextMonth: i18n( "%nxtMnth" ),
				goToTitle: i18n( "%cal-goToTtl" ),
				goToYear: i18n( "%cal-goToYr" ),
				goToMonth: i18n( "%cal-goToMnth" ),
				goToLink: i18n( "%cal-goToLnk" ),
				goToBtn: i18n( "%cal-goToBtn" ),
				cancelBtn: i18n( "%cancel" ),
				dayNames: i18n( "%days" ),
				currDay: i18n( "%currDay" )
			};
		}

		$calendar
			.addClass( "cal-cnt" )
			.removeClass( "cal-cnt-ext" );

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
			$objCalendar = $( "<div id='cal-" + calendarId + "-cnt' class='cal-cnt'></div>" );
			$calendar.append( $objCalendar );
		}

		// Creates the calendar header
		$calendarHeader = $objCalendar.children( ".cal-hd" );
		if ( $calendarHeader.length === 0 ) {
			$calendarHeader = $( "<div class='cal-hd'></div>" );
		}

		$calendarHeader.prepend( "<div class='cal-mnth'>" + i18nText.monthNames[ month ] + " " + year + "</div>" );

		if ( shownav ) {
			// Create the month navigation
			if ( document.getElementById( "#cal-" + calendarId + "-mnthnav" ) === null ) {
				$calendarHeader.append( createMonthNav( calendarId, year, month, mindate, maxdate, minDateYear, maxDateYear ) );
			}
		}
		$objCalendar.append( $calendarHeader );

		// Create the calendar body

		// Creates weekdays | Cree les jours de la semaines
		$objCalendar.append( createWeekdays( calendarId ) );

		// Creates the rest of the calendar | Cree le reste du calendrier
		$days = createDays( calendarId, year, month );
		$daysList = $days.find( ".cal-day-lst li" );
		$objCalendar.append( $days );
				
		// Trigger the displayed.wb-cal Event
		$calendar.trigger( "displayed.wb-cal", [ year, month, $daysList, day ] );
	},

	createMonthNav = function( calendarId, year, month, minDate, maxDate, minDateYear, maxDateYear ) {
		var monthNames = i18nText.monthNames,
			$monthNav = $( "#cal-" + calendarId + "-mnthnav" ),
			assetsPath = vapour.getPath( "/assets" ),
			buttonStart = "<a href='javascript:;' role='button' class='cal-",
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
				],
			],
			alt, $btn, buttonSpec, buttonClass, newMonth, newYear, hideButton, index;

		if ( $monthNav.length === 0 ) {
			$monthNav = $( "<div id='cal-" + calendarId + "-mnthnav'></div>" );
		}
		
		// Create the go to form if one doesn't already exist
		if ( $( "#" + calendarId + " .cal-goto" ).length === 0 ) {
			$monthNav.append( createGoToForm( calendarId, year, month, minDate, maxDate ) );
		}

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
			
			if ( $btn.length !== 0 ) {
				$btn
					.off()
					.children( "img" )
						.attr( "alt", alt );
			} else {
				$btn = $( buttonStart + buttonClass + "'><img src='" + assetsPath + "/" + buttonClass.substring( 0, 1 ) + ".png' alt='" + alt + "' /></a>" );
				$monthNav[ buttonSpec[ 3 ] ]( $btn );
			}
			$btn
				.toggleClass( "hide", hideButton )
				.attr( "aria-hidden", hideButton );

			if ( !hideButton ) {
				$btn.on( "click", {
					calID: calendarId,
					year: newYear,
					month : newMonth,
					mindate: minDate,
					maxdate: maxDate
				}, changeMonth );
			}
		}

		return $monthNav;
	},

	changeMonth = function( event ) {
		var which = event.which,
			$btn = $( event.target ),
			eventData = event.data,
			$container = $btn.closest( ".cal-cnt" );

		// Ignore middle/right mouse buttons
		if ( !which || which === 1 ) {
			$document.trigger( "create.wb-cal", [
				eventData.calID,
				eventData.year,
				eventData.month,
				true,
				eventData.mindate,
				eventData.maxdate
			]);

			if ( $btn.hasClass( "wb-inv" ) ) {
				$container.find( ".cal-goto-lnk a" ).trigger( "focus.wb" );
			} else {
				$btn.trigger( "focus.wb" );
			}
		}
	},

	yearChanged = function( event ) {
		var year = parseInt( this.value, 10 ),
			eventData = event.data,
			minDate = eventData.minDate,
			maxDate = eventData.maxDate,
			monthField = eventData.monthField,
			minMonth = 0,
			maxMonth = 11,
			monthNames = i18nText.monthNames,
			month, i;

		if ( year === minDate.getFullYear() ) {
			minMonth = minDate.getMonth();
		}

		if ( year === maxDate.getFullYear() ) {
			maxMonth = maxDate.getMonth();
		}

		month = monthField.val();

		// Can't use monthField.empty() or .html("") on <select> in IE
		// http://stackoverflow.com/questions/3252382/why-does-dynamically-populating-a-select-drop-down-list-element-using-javascript
		for ( i = monthField.length - 1 ; i !== -1; i -= 1 ) {
			monthField[ i ].remove( i );
		}

		for ( i = minMonth; i !== maxMonth; i += 1 ) {
			monthField.append( "<option value='" + i + "'" + ( (i === month ) ? " selected='selected'" : "" ) +
				">" + monthNames[ i ] + "</option>" );
		}
	},

	createGoToForm = function( calendarId, year, month, minDate, maxDate ) {
		var goToForm = $( "<div class='cal-goto'></div>" ),
			form = $( "<form id='cal-" + calendarId + "-goto' role='form' style='display:none;' action=''><fieldset><legend>" +
				i18nText.goToTitle + "</legend></fieldset></form>" ),
			fieldset, yearContainer, yearField, y, _ylen, monthContainer, monthField, buttonContainer,
			button, buttonCancelContainer, buttonCancel, goToLinkContainer, goToLink;

		form.on( "submit", function( event ) {
			event.preventDefault();
			onGoTo( calendarId, minDate, maxDate );
			return false;
		});
		fieldset = form.children( "fieldset" );

		// Create the year field
		yearContainer = $( "<div class='cal-goto-yr'></div>" );
		yearField = $( "<select title='" + i18nText.goToYear + "' id='cal-" + calendarId + "-goto-year'></select>" );
		for ( y = minDate.getFullYear(), _ylen = maxDate.getFullYear(); y <= _ylen; y += 1 ) {
			yearField.append( $( "<option value='" + y + "'" + (y === year ? " selected='selected'" : "" ) + ">" + y + "</option>" ) );
		}

		yearContainer.append( yearField );
		fieldset.append( yearContainer );

		// Create the list of month field
		monthContainer = $( "<div class='cal-goto-mnth'></div>" );
		monthField = $( "<select title='" + i18nText.goToMonth + "' id='cal-" + calendarId + "-goto-month'></select>" );

		monthContainer.append(monthField);
		fieldset.append(monthContainer);

		// Update the list of available months when changing the year
		yearField.bind("change", {minDate: minDate, maxDate: maxDate, monthField: monthField}, yearChanged);
		yearField.change(); // Populate initial month list		

		buttonContainer = $( "<div class='cal-goto-btn'></div>" );
		button = $( "<input type='submit' class='btn btn-primary' value='" + i18nText.goToBtn + "' />" );
		buttonContainer.append(button);
		fieldset.append(buttonContainer);

		buttonCancelContainer = $( "<div class='cal-goto-btn'></div>" );
		buttonCancel = $( "<input type='button' class='btn btn-default' value='" + i18nText.cancelBtn + "' />" );
		buttonCancel.on("click", function( event ) {
			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				$( "#" + calendarId ).trigger( "hideGoToFrm.wb-cal" );
			}
		});
		buttonCancelContainer.append(buttonCancel);
		fieldset.append(buttonCancelContainer);

		goToLinkContainer = $( "<p class='cal-goto-lnk' id='cal-" + calendarId + "-goto-lnk'></p>" );
		goToLink = $( "<a href='javascript:;' role='button' aria-controls='cal-" +
			calendarId + "-goto' aria-expanded='false'>" + i18nText.goToLink + "</a>" );
		goToLink.on( "click", function( event ) {
			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				showGoToForm( calendarId );
			}
		} );
		goToLinkContainer.append( goToLink );

		goToForm.append( goToLinkContainer );
		goToForm.append( form );

		return goToForm;
	},

	createWeekdays = function( calendarId ) {
		var weekdays = "<ol id='cal-" + calendarId + "-days' class='cal-wd' role='presentation'>",
			dayNames = i18nText.dayNames,
			wd, wd1, dayName;
		for ( wd = 0; wd < 7; wd += 1 ) {
			dayName = dayNames[ wd ];
			wd1 = wd + 1;
			weekdays += "<li id='cal-" + calendarId + "-wd" + wd1 + "' class='cal-wd" + wd1 +
				( wd === 0 || wd === 6 ? "we" : "" ) + "' role='columnheader'><abbr title='" + dayName + "'>" +
				dayName.substr( 0, 1 ) + "</abbr></li>";
		}

		return $( weekdays + "</ol>" );
	},

	createDays = function( calendarId, year, month ) {
		var cells = "<div id='cal-" + calendarId + "-days' class='cal-days'>",
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
			for ( day = 0; day < 7; day += 1 ) {
				
				id = "cal-" + calendarId + "-w" + week + "d" + ( day + 1 );
				className = ( day === 0 || day === 6 ? "cal-we " : "" ) +
					"cal-w" + week + "d" + ( day + 1 ) + " cal-index-" + ( dayCount + 1 );
				
				if ( ( week === 1 && day < firstDay ) || ( dayCount > lastDay ) ) {

					// Creates empty cells | Cree les cellules vides
					cells += "<span id='" + id + "' class='cal-empty " + className + "'>&#160;</span>";
				} else {

					// Creates date cells | Cree les cellules de date
					dayCount += 1;
					isCurrentDate = ( dayCount === currDay && month === currMonth && year === currYear );

					if (dayCount === 1) {
						cells += "<ol id='cal-" + calendarId + "-" + month + "_" + year + "' class='cal-day-lst' role='grid'>";
					}

					cells += "<li id='" + id + "' class='" + ( isCurrentDate ? "cal-currday " : "" ) + className + "' role='grid-cell'><div><time datetime='" + currYear + "-" +
						( month < 9 ? "0" : "" ) + ( month + 1 ) + "-" + ( dayCount < 10 ? "0" : "" ) + dayCount + "'><span class='wb-inv'>" + textWeekDayNames[ day ] +
						( frenchLang ? ( " </span>" + dayCount + "<span class='wb-inv'> " + textMonthNames[ month ].toLowerCase() + " " ) :
						( " " + textMonthNames[ month ] + " </span>" + dayCount + "<span class='wb-inv'> " ) ) + year +
						( isCurrentDate ?  textCurrentDay : "" ) + "</span></time></div></li>";
						
					if ( dayCount > lastDay ) {
						cells += "</ol>";
						breakAtEnd = true;
					}
				}
			}
			if ( breakAtEnd ) {
				break;
			}
		}
		cells += "</div>";

		return $( cells += "</div>" );
	},

	showGoToForm = function( calendarId ) {
		var link = $("#cal-" + calendarId + "-goto-lnk"),
			form = $("#cal-" + calendarId + "-goto");

		// Hide the month navigation
		$( "#cal-" + calendarId +  "-mnthnav" )
			.children( ".cal-prvmnth, .cal-nxtmnth" )
				.addClass( "hide" )
				.attr( "aria-hidden", "true" );

		// TODO: Replace with CSS animation
		link.stop().slideUp( 0 );
		form.stop().slideDown( 0 ).queue(function() {
			$( this ).find( ":input:eq(0)" ).trigger( "focus.wb" );
		});

		link
			.children( "a" )
				.attr({
					"aria-hidden": "true",
					"aria-expanded": "true"
				});
		document.getElementById( calendarId ).className += " cal-cnt-ext";
	},

	hideGoToFrm = function( event ) {
		var calendarId = event.target.id,
			$link = $( "#cal-" + calendarId + "-goto-lnk" ),
			$form = $( "#cal-" + calendarId + "-goto" );

		// TODO: Replace with CSS animation
		$form.stop().slideUp( 0 ).queue(function () {
			// Show the month navigation
			$( "#cal-" + calendarId +  "-mnthnav" )
				.children( ".cal-prvmnth, .cal-nxtmnth" )
					.removeClass( "wb-inv" )
					.attr( "aria-hidden", "false" );
			$( "#" + calendarId ).removeClass( "cal-cnt-ext" );
		});
		$link
			.stop()
			.slideDown( 0 )
			.children( "a" )
				.attr({
					"aria-hidden": "false",
					"aria-expanded": "false"
				});
	},

	onGoTo = function( calendarId, minDate, maxDate ) {
		var $container = $( "#" + calendarId ),
			fieldset = $container.find( "fieldset" ),
			month = parseInt( fieldset.find( ".cal-goto-mnth select option:selected" ).val(), 10 ),
			year = parseInt( fieldset.find( ".cal-goto-yr select" ).val(), 10 );

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
				.trigger( "focus.wb" );
		}
	},
	
	setFocus = function( event, calendarId, year, month, minDate, maxDate, targetDate ) {
		var time = targetDate.getTime();

		if ( time < minDate.getTime() ) {
			targetDate = minDate;
			targetDate.setDate( targetDate.getDate() + 1 );
		} else if ( time > maxDate.getTime() ) {
			targetDate = maxDate;
			targetDate.setDate( targetDate.getDate() + 1 );
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
$document.on( "create.wb-cal" , create );

// Keyboard nav
$document.on( "keydown", ".cal-day-lst a", function ( event ) {
	var elm = event.target,
		$elm = $( elm ),
		$container = $elm.closest( ".cal-cnt" ),
		calendarId = $container.parent().attr( "id" ),
		fieldId = $container.attr( "aria-controls" ),
		which = event.which,
		fromDateISO = vapour.date.fromDateISO,
		date = fromDateISO( elm.getElementsByTagName( "time" )[ 0 ].getAttribute( "datetime" ) ),
		currYear = date.getFullYear(),
		currMonth = date.getMonth(),
		currDay = date.getDate(),
		days = elm.parentNode.parentNode.getElementsByTagName( "a" ),
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
	
	if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {
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
		return false;
	} else if ( currDay !== date.getDate() ) {
		$( days[ date.getDate() - 1 ] ).trigger( "focus.wb" );
		return false;
	}
});

$document.on( "hideGoToFrm.wb-cal", ".cal-cnt", hideGoToFrm );

$document.on( "setFocus.wb-cal", setFocus );

$document.on( "click", ".cal-prvmnth, .cal-nxtmnth", changeMonth );

})( jQuery, window, document, vapour );