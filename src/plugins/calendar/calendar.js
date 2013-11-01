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
	create = function( event, calendarId, year, month, shownav, mindate, maxdate ) {
		var calendar = document.getElementById( calendarId ),
			$calendar = $( calendar ),
			objCalendarId = "#cal-" + calendarId + "-cnt",
			fromDateISO = vapour.date.fromDateISO,
			$objCalendar, $calendarHeader, days, daysList,
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
			.addClass( "cal-container" )
			.removeClass( "cal-container-extended" );

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
			$objCalendar.find( "#cal-" + calendarId + "-weekdays, .cal-month, #cal-" + calendarId + "-days").remove();
			$objCalendar = $calendar.children("#cal-" + calendarId + "-cnt");
		} else {
			$objCalendar = $( "<div id='cal-" + calendarId + "-cnt' class='cal-cnt'></div>" );
			$calendar.append( $objCalendar );
		}

		// Creates the calendar header
		$calendarHeader = $objCalendar.children( ".cal-header" );
		if ( $calendarHeader.length === 0 ) {
			$calendarHeader = $( "<div class='cal-header'></div>" );
		}

		$calendarHeader.prepend( "<div class='cal-month'>" + i18nText.monthNames[ month ] + " " + year + "</div>" );

		if ( shownav ) {
			// Create the month navigation
			if ( document.getElementById( "#cal-" + calendarId + "-monthnav" ) === null ) {
				$calendarHeader.append( createMonthNav( calendarId, year, month, mindate, maxdate, minDateYear, maxDateYear ) );
			}
		}
		$objCalendar.append($calendarHeader);

		// Create the calendar body

		// Creates weekdays | Cree les jours de la semaines
		$objCalendar.append( createWeekdays( calendarId ) );

		// Creates the rest of the calendar | Cree le reste du calendrier
		days = createDays(calendarId, year, month);
		daysList = days.children("ol.cal-day-list").children("li");
		$objCalendar.append(days);

		// Trigger the calendarDisplayed.wb-calendar Event
		$calendar.trigger( "calendarDisplayed.wb-calendar", [ year, month, daysList ] );
	},

	createMonthNav = function( calendarId, year, month, minDate, maxDate, minDateYear, maxDateYear ) {
		var monthNames = i18nText.monthNames,
			monthNav = $( "#cal-" + calendarId + "-monthnav" ),
			alt, btnCtn, btn, i, newMonth, newYear, showButton,	suffix,	titleSuffix;

		if ( monthNav.length === 0 ) {
			monthNav = $( "<div id='cal-" + calendarId + "-monthnav'></div>" );
		}

		//Create month navigation links | Cree les liens de navigations
		for (i = 0; i < 2; i += 1) {
			showButton = true;
			btnCtn = null;
			btn = null;
			//Set context for each button
			if (i === 0) {
				suffix = "prevmonth";
				titleSuffix = i18nText.prevMonth;
				if (month > 0) {
					newMonth = month - 1;
					newYear = year;
				} else {
					newMonth = 11;
					newYear = year - 1;
				}

				if ((newMonth < minDate.getMonth() && newYear <= minDateYear) || newYear < minDateYear) {
					showButton = false;
				}
			} else {
				if ($("#" + calendarId).children("#cal-" + calendarId + "-cnt").children(".cal-header").find(".cal-goto").length < 1) {
					//Create the go to form
					monthNav.append(createGoToForm(calendarId, year, month, minDate, maxDate));
				}
				suffix = "nextmonth";
				titleSuffix = i18nText.nextMonth;
				if (month < 11) {
					newMonth = month + 1;
					newYear = year;
				} else {
					newMonth = 0;
					newYear = year + 1;
				}

				if ( (newMonth > maxDate.getMonth() && newYear >= maxDateYear) || newYear > maxDateYear ) {
					showButton = false;
				}
			}

			if (monthNav.children(".cal-" + suffix).length > 0) {
				btnCtn = monthNav.children(".cal-" + suffix);
			}

			alt = titleSuffix + monthNames[newMonth] + " " + newYear;

			if ( btnCtn ) {
				btnCtn.toggleClass( "wb-inv", !showButton );
				btn = btnCtn.children( "a" ).off();
				btn.children( "img" ).attr( "alt", alt );
			} else {
				btnCtn = $( "<div class='cal-" + suffix + ( showButton ? "" : " wb-inv" ) + "'></div>" );
				btn = $( "<a href='javascript:;' role='button'><img src='" + vapour.getPath( "/assets" ) + "/" + suffix.substr( 0, 1 ) + ".png' alt='" + alt + "' /></a>" );

				btnCtn.append(btn);
				if (i === 0) {
					monthNav.prepend(btnCtn);
				} else {
					monthNav.append(btnCtn);
				}
			}

			if ( showButton ) {
				if (i === 0) {
					btn.on("click", {
						calID: calendarId,
						year: newYear,
						month : newMonth,
						mindate: minDate,
						maxdate: maxDate
					}, prevMonth);
				} else {
					btn.on("click", {
						calID: calendarId,
						year: newYear,
						month: newMonth,
						mindate: minDate,
						maxdate: maxDate
					}, nextMonth);
				}
			}
		}
		return monthNav;
	},

	prevMonth = function( event ) {
		var which = event.which,
			$container = $( this ).closest( ".cal-container" ),
			btnClass = "cal-prevmonth";

		// Ignore middle/right mouse buttons
		if ( !which || which === 1 ) {
			$document.trigger( "create.wb-calendar", [
				event.data.calID,
				event.data.year,
				event.data.month,
				true,
				event.data.mindate,
				event.data.maxdate
			]);

			if ( $container.find( "." + btnClass + ".wb-inv" ).length === 0 ) {
				$container.find(".cal-goto-link a").trigger( "focus.wb" );
			} else {
				$container.find("." + btnClass + " a").trigger( "focus.wb" );
			}
		}
	},

	nextMonth = function( event ) {
		var which = event.which,
			$container = $( this ).closest( ".cal-container" ),
			btnClass = "cal-nextmonth";

		// Ignore middle/right mouse buttons
		if ( !which || which === 1 ) {
			$document.trigger( "create.wb-calendar", [
				event.data.calID,
				event.data.year,
				event.data.month,
				true,
				event.data.mindate,
				event.data.maxdate
			]);

			if ( $container.find( "." + btnClass + ".wb-inv" ).length === 0 ) {
				$container.find(".cal-goto-link a").trigger( "focus.wb" );
			} else {
				$container.find("." + btnClass + " a").trigger( "focus.wb" );
			}
		}
	},

	yearChanged = function( event ) {
		var year = parseInt($(this).val(), 10),
			minDate = event.data.minDate,
			maxDate = event.data.maxDate,
			monthField = event.data.monthField,
			minMonth = 0,
			maxMonth = 11,
			monthNames = i18nText.monthNames,
			month, i;
		if (year === minDate.getFullYear()) {
			minMonth = minDate.getMonth();
		}

		if (year === maxDate.getFullYear()) {
			maxMonth = maxDate.getMonth();
		}

		month = monthField.val();

		// Can't use monthField.empty() or .html("") on <select> in IE
		// http://stackoverflow.com/questions/3252382/why-does-dynamically-populating-a-select-drop-down-list-element-using-javascript
		while (monthField.children("option").length) {
			monthField.get(0).remove(0);
		}

		for ( i = minMonth; i !== maxMonth; i += 1 ) {
			monthField.append( "<option value='" + i + "'" + ( (i === month ) ? " selected='selected'" : "" ) + ">" + monthNames[ i ] + "</option>" );
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
		fieldset = form.children("fieldset");

		// Create the year field
		yearContainer = $( "<div class='cal-goto-year'></div>" );
		yearField = $( "<select title='" + i18nText.goToYear + "' id='cal-" + calendarId + "-goto-year'></select>" );
		for ( y = minDate.getFullYear(), _ylen = maxDate.getFullYear(); y <= _ylen; y += 1 ) {
			yearField.append( $( "<option value='" + y + "'" + (y === year ? " selected='selected'" : "" ) + ">" + y + "</option>" ) );
		}

		yearContainer.append(yearField);
		fieldset.append(yearContainer);

		//Create the list of month field
		monthContainer = $( "<div class='cal-goto-month'></div>" );
		monthField = $( "<select title='" + i18nText.goToMonth + "' id='cal-" + calendarId + "-goto-month'></select>" );

		monthContainer.append(monthField);
		fieldset.append(monthContainer);

		// Update the list of available months when changing the year
		yearField.bind("change", {minDate: minDate, maxDate: maxDate, monthField: monthField}, yearChanged);
		yearField.change(); // Populate initial month list		

		buttonContainer = $( "<div class='cal-goto-button'></div>" );
		button = $( "<input type='submit' class='btn btn-primary' value='" + i18nText.goToBtn + "' />" );
		buttonContainer.append(button);
		fieldset.append(buttonContainer);

		buttonCancelContainer = $( "<div class='cal-goto-button'></div>" );
		buttonCancel = $( "<input type='button' class='btn btn-default' value='" + i18nText.cancelBtn + "' />" );
		buttonCancel.on("click", function( event ) {
			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				$( "#" + calendarId ).trigger( "hideGoToForm.wb-calendar" );
			}
		});
		buttonCancelContainer.append(buttonCancel);
		fieldset.append(buttonCancelContainer);

		goToLinkContainer = $( "<p class='cal-goto-link' id='cal-" + calendarId + "-goto-link'></p>" );
		goToLink = $( "<a href='javascript:;' role='button' aria-controls='cal-" +
			calendarId + "-goto' aria-expanded='false'>" + i18nText.goToLink + "</a>" );
		goToLink.on("click", function ( event ) {
			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				showGoToForm(calendarId);
			}
		});
		goToLinkContainer.append(goToLink);

		goToForm.append(goToLinkContainer);
		goToForm.append(form);

		return goToForm;
	},

	createWeekdays = function( calendarId ) {
		var weekdays = "<ol id='cal-" + calendarId + "-weekdays' class='cal-weekdays' role='presentation'>",
			dayNames = i18nText.dayNames,
			wd, wd1, dayName;
		for ( wd = 0; wd < 7; wd += 1 ) {
			dayName = dayNames[ wd ];
			wd1 = wd + 1;
			weekdays += "<li id='cal-" + calendarId + "-wd" + wd1 + "' class='cal-wd" + wd1 + ( wd === 0 || wd === 6 ? "we" : "" ) + "'><abbr title='" + dayName + "'>" + dayName.substr( 0, 1 ) + "</abbr></li>";
		}

		return $( weekdays + "</ol>" );
	},

	createDays = function( calendarId, year, month ) {
		var cells = $( "<div id='cal-" + calendarId + "-days' class='cal-days'></div>" ),
			days = $( "<ol id='cal-" + calendarId + "-" + month + "_" + year + "' class='cal-day-list'></ol>" ),
			date = new Date(),
			textWeekDayNames = i18nText.dayNames,
			textMonthNames = i18nText.monthNames,
			textCurrentDay = i18nText.currDay,
			frenchLang = ( document.documentElement.lang === "fr" ),
			firstday, lastday, daycount, breakAtEnd, week, day, element, elementParent, isCurrentDate;

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
					element = $( "<span class='cal-empty'>&#160;</span>" );
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
					element = $( "<li><div><span class='wb-inv'>" + textWeekDayNames[ day ] +
						( frenchLang ? ( " </span>" + daycount + "<span class='wb-inv'> " +
						textMonthNames[ month ].toLowerCase() + " " ) : ( " " + textMonthNames[ month ] +
						" </span>" + daycount + "<span class='wb-inv'> " ) ) + year +
						( isCurrentDate ? textCurrentDay : "" ) + "</span></div></li>" );
					elementParent = days;
				}
				element
					.attr( "id", "cal-" + calendarId + "-w" + week + "d" + ( day + 1 ) )
					.addClass( "cal-w" + week + "d" + (day + 1) + " cal-index-" + daycount );

				if (day === 0 || day === 6) {
					element.addClass("cal-we");
				}
				if (isCurrentDate) {
					element.addClass("cal-currentday");
				}
				elementParent.append(element);
			}
			if ( breakAtEnd ) {
				break;
			}
		}

		return cells;
	},

	showGoToForm = function( calendarId ) {
		// Hide the month navigation
		$("#cal-" + calendarId +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").addClass("wb-inv").children("a").attr("aria-hidden", "true");

		var link = $("#cal-" + calendarId + "-goto-link"),
			form = $("#cal-" + calendarId + "-goto");

		link.stop().slideUp(0);
		form.stop().slideDown(0).queue(function() {
			$(this).find(":input:eq(0)").trigger( "focus.wb" );
		});

		link.children("a").attr("aria-hidden", "true").attr("aria-expanded", "true");
		document.getElementById( calendarId ).className += " cal-container-extended";
	},

	hideGoToForm = function( event ) {
		var calendarId = event.target.id,
			$link = $("#cal-" + calendarId + "-goto-link"),
			$form = $("#cal-" + calendarId + "-goto");

		$form.stop().slideUp(0).queue(function () {
			// Show the month navigation
			$( "#cal-" + calendarId +  "-monthnav" )
				.children(".cal-prevmonth, .cal-nextmonth")
					.removeClass("wb-inv")
					.children("a")
						.attr("aria-hidden", "false");
			$( "#" + calendarId ).removeClass( "cal-container-extended" );
		});
		$link
			.stop()
			.slideDown(0)
			.children("a")
				.attr("aria-hidden", "false")
				.attr("aria-expanded", "false");
	},

	onGoTo = function( calendarId, minDate, maxDate ) {
		var $container = $( "#" + calendarId ),
			fieldset = $container.find( "fieldset" ),
			month = parseInt( fieldset.find( ".cal-goto-month select option:selected" ).val(), 10 ),
			year = parseInt( fieldset.find( ".cal-goto-year select" ).val(), 10 );

		if (!(month < minDate.getMonth() && year <= minDate.getFullYear()) && !(month > maxDate.getMonth() && year >= maxDate.getFullYear())) {
			$document.trigger( "create.wb-calendar", [
				calendarId,
				year,
				month,
				true,
				minDate,
				maxDate
			]);
			$container.trigger( "hideGoToForm.wb-calendar" );

			// Go to the first day to avoid having to tab over the navigation again.
			$( "#cal-" + calendarId + "-days a" )
				.eq( 0 )
				.trigger( "focus.wb" );
		}
	};

// Event binding
$document.on( "create.wb-calendar", create );

$document.on( "hideGoToForm.wb-calendar", ".cal-container", hideGoToForm );

})( jQuery, window, document, vapour );