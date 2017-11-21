( function( $, window, document, wb, undef ) {

var i18nText,
	$document = wb.doc,
	selector = ".wb-clndr",
	navigateEvent = "wb-navigate" + selector,
	inited = false,
	currDate = new Date(),
	currYear = currDate.getFullYear(),
	currMonth = currDate.getMonth(),
	defaults = {
		year: currYear,
		month: currMonth,
		minDate: new Date( currYear, 0, 1 ),
		maxDate: new Date( currYear, 11, 31 )
	},
	$calBase,

	init = function() {
		var i18n = wb.i18n,
			textWeekDayNames, textMonthNames;

		i18nText = {
			monthNames: i18n( "mnths" ),
			prevMonth: i18n( "prvMnth" ),
			nextMonth: i18n( "nxtMnth" ),
			goToYear: i18n( "cal-goToYr" ),
			goToMonth: i18n( "cal-goToMnth" ),
			dayNames: i18n( "days" ),
			currDay: i18n( "currDay" ),
			format: i18n( "cal-format" )
		};

		textWeekDayNames = i18nText.dayNames;
		textMonthNames = i18nText.monthNames;

		$calBase = $( "<div class='wb-clndr' role='application'>" +
			"<div class='cal-nav'>" +
				"<button type='button' class='btn pull-left cal-month-prev'>" +
					"<span class='glyphicon glyphicon-arrow-left'></span>" +
					"<span class='wb-inv'>" + i18nText.prevMonth + "<span></span></span>" +
				"</button>" +
				"<button type='button' class='btn pull-right cal-month-next'>" +
					"<span class='glyphicon glyphicon-arrow-right'></span>" +
					"<span class='wb-inv'>" + i18nText.nextMonth + "<span></span></span>" +
				"</button>" +
				"<div class='form-group'>" +
					"<select title='" + i18nText.goToYear + "' class='cal-year'></select>\n" +
					"<select title='" + i18nText.goToMonth + "' class='cal-month'>" +
						( function() {
							var months = "",
								m;

							for ( m = 0; m < 12; m += 1 ) {
								months += "<option value='" + m + "'>" + textMonthNames[ m ] + "</option>";
							}

							return months;
						} )() +
					"</select>" +
				"</div>" +
			"</div>" +
			"<table>" +
				"<thead role='presentation'>" +
					"<tr>" +
						( function() {
							var days = "",
								d;

							for ( d = 0; d < 7; d += 1 ) {
								days += "<th role='columnheader'><abbr title='" + textWeekDayNames[ d ] + "'>" + textWeekDayNames[ d ].substr( 0, 1 ) + "</abbr></th>";
							}

							return days;
						} )() +
					"</tr>" +
				"</thead>" +
				"<tbody class='cal-days'></tbody>" +
			"</table>" +
		"</div>" );

		inited = true;
	},

	createCalendar = function( $container, settings ) {
		var calendar = {
				reInit: initCalendar
			}, $calendarObj, calendarObj;

		if ( !inited ) {
			init();
		}

		$calendarObj = $calBase.clone();
		calendarObj = $calendarObj.get( 0 );

		calendar.$o = $calendarObj;
		calendar.o = calendarObj;
		calendarObj.lib = calendar;

		$calendarObj.appendTo( $container );

		calendar.reInit( settings );

		return calendar;
	},

	initCalendar = function( settings ) {
		var years = "",
			$calendarObj = this.$o,
			$yearField, lastYear, y, defaultsPartial;

		settings = settings || {};

		if ( settings.year !== undef && settings.month !== undef ) {
			defaultsPartial = {
				minDate: new Date( settings.year, 0, 1 ),
				maxDate: new Date( settings.year, 11, 31 )
			};
			$.extend( this, defaultsPartial, settings );
		} else {
			$.extend( this, defaults );
		}

		//Generates the list of years
		lastYear = this.maxDate.getFullYear();
		$yearField = $calendarObj.find( ".cal-year" ).empty();
		for ( y = this.minDate.getFullYear(); y <= lastYear; y += 1 ) {
			years += "<option value='" + y + "'>" + y + "</option>";
		}
		$yearField.append( years );

		$calendarObj
			.trigger( {
				type: navigateEvent,
				year: this.year,
				month: this.month
			} );
	},

	createDays = function( calendar, year, month ) {
		var $container = $( calendar ).find( ".cal-days" ),
			dayCount = 1,
			textCurrentDay = i18nText.currDay,
			lib = calendar.lib,
			minDate = lib.minDate,
			maxDate = lib.maxDate,
			callback = lib.daysCallback,
			cells = "",
			date, firstDay, lastDay, currYear, currMonth, currDay, week, day, className, isCurrentDate, isoDate, printDate, breakAtEnd, days, inRange;

		date = new Date( year, month, 1 );

		firstDay = date.getDay();
		date.setMonth( month + 1, 0 );
		lastDay = date.getDate();

		// Get the current date
		date = new Date();
		currYear = date.getFullYear();
		currMonth = date.getMonth();
		currDay = date.getDate();

		for ( week = 1; week < 7; week += 1 ) {
			cells += "<tr>";
			for ( day = 0; day < 7; day += 1 ) {

				if ( ( week === 1 && day < firstDay ) || ( dayCount > lastDay ) ) {

					// Creates empty cells | Cree les cellules vides
					cells += "<td class='cal-empty'>&#160;</td>";
				} else {

					// Creates date cells | Cree les cellules de date
					isCurrentDate = ( dayCount === currDay && month === currMonth && year === currYear );
					className = "cal-index-" + dayCount + ( isCurrentDate ? " cal-curr-day " : "" );

					date.setFullYear( year, month, dayCount );
					isoDate = date.toLocalISOString().substr( 0, 10 );
					printDate = displayDate( date ) + ( isCurrentDate ? "<span class='wb-inv'>" + textCurrentDay + "</span>" : "" );

					cells += "<td class='" + className + "'><time datetime='" + isoDate  + "'>" + printDate + "</time></td>";

					if ( dayCount >= lastDay ) {
						breakAtEnd = true;
					}

					dayCount += 1;
				}
			}
			cells += "</tr>";
			if ( breakAtEnd ) {
				break;
			}
		}

		$container.empty().append( cells );

		if ( callback ) {
			days = $container.find( "time" );
			inRange = {};

			if ( year === minDate.getFullYear() && month === minDate.getMonth() ) {
				inRange.min = minDate.getDate() - 1;
			}

			if ( year === maxDate.getFullYear() && month === maxDate.getMonth() ) {
				inRange.max = maxDate.getDate() - 1;
			}

			callback.call( calendar.lib, year, month, days, inRange );
		}
	},

	displayDate = function( date ) {
		var textWeekDayNames = i18nText.dayNames,
			textMonthNames = i18nText.monthNames;

		return i18nText.format.replace( /\{ddd\}|\{d\}|\{M\}|\{Y\}/g, function( match ) {
			switch ( match ) {
			case "{ddd}":
				return textWeekDayNames[ parseInt( date.getDay(), 10 ) ];
			case "{d}":
				return parseInt( date.getDate(), 10 );
			case "{M}":
				return textMonthNames[ parseInt( date.getMonth(), 10 ) ];
			case "{Y}":
				return date.getFullYear();
			}
		} );
	};

wb.calendar = {
	create: createCalendar
};

$document.on( navigateEvent, selector, function( event ) {
	var calendarObj = event.currentTarget,
		$calendar = $( calendarObj ),
		year = event.year,
		month = event.month,
		lib = calendarObj.lib,
		maxYear = lib.maxDate.getFullYear(),
		maxMonth = lib.maxDate.getMonth(),
		minYear = lib.minDate.getFullYear(),
		minMonth = lib.minDate.getMonth(),
		$prevArrow = $calendar.find( ".cal-month-prev" ),
		$nextArrow = $calendar.find( ".cal-month-next" ),
		$monthField = $calendar.find( ".cal-month" ),
		disabled = "disabled";

	if ( year !== undef ) {
		lib.year = year;
	}

	if ( month !== undef ) {
		lib.month = month;
	}

	//Update UI
	$calendar.find( ".cal-year" ).val( year );

	$monthField.val( month );

	$monthField.children( ":" + disabled ).removeAttr( disabled );

	if ( year < minYear || ( year === minYear && month <= minMonth ) ) {
		$prevArrow.attr( disabled, disabled );
	} else {
		$prevArrow.removeAttr( disabled );
	}

	if ( year > maxYear || ( year === maxYear && month >= maxMonth ) ) {
		$nextArrow.attr( disabled, disabled );
	} else {
		$nextArrow.removeAttr( disabled );
	}

	if ( year === minYear ) {
		$monthField.children( ":lt(" + minMonth + ")" ).attr( disabled, disabled );
	}

	if ( year === maxYear ) {
		$monthField.children( ":gt(" + maxMonth + ")" ).attr( disabled, disabled );
	}

	createDays( event.currentTarget, event.year, event.month );
} );

$document.on( "change", selector, function( event ) {
	var target = event.target,
		calendar = event.currentTarget,
		year, month;

	switch ( target.className ) {
	case "cal-year":
		year = parseInt( target.value, 10 );
		month = calendar.lib.month;
		break;
	case "cal-month":
		year = calendar.lib.year;
		month = parseInt( target.value, 10 );
		break;
	}

	$( calendar ).trigger( {
		type: navigateEvent,
		year: year,
		month: month
	} );
} );

$document.on( "click vclick touchstart", ".cal-month-prev, .cal-month-next", function( event ) {
	var $calendar = $( event.currentTarget ).closest( selector ),
		calendar = $calendar.get( 0 ),
		className = event.currentTarget.className,
		modifier = className.indexOf( "cal-month-prev" ) !== -1 ? -1 : 1,
		date = new Date( calendar.lib.year, calendar.lib.month + modifier, 1 );

	$calendar.trigger( {
		type: navigateEvent,
		year: date.getFullYear(),
		month: date.getMonth()
	} );
	if ( wb.ie11 ) {
		$calendar.trigger( "focusin" );
	}
} );

$document.on( "keydown", selector, function( event ) {
	var calendar = event.currentTarget,
		$days = $( event.currentTarget ).find( ".cal-days" ),
		target = event.target,
		which = event.which,
		lib = calendar.lib,
		date = new Date( lib.year, lib.month, 1 ),
		minDate = lib.minDate,
		maxDate = lib.maxDate,
		currentDate = new Date( date ),
		navigate = true,
		classMatch, isDayLink, lastDay, modifier, day;

	if ( !event.altKey && !event.metaKey && which > 32 && which < 41 ) {

		classMatch = target.parentNode.className.match( /cal-index-(\d{1,2})/ );
		isDayLink = classMatch !== null;

		//Key binding for the entire calendar
		switch ( which ) {

		//page up
		case 33:
			date.setDate( minDate.getDate() );

			/* falls through */

		//page down
		case 34:
			modifier = ( which === 33 ? -1 : 1 );

			if ( event.ctrlKey || event.shiftKey || event.altKey ) {
				date.setYear( date.getFullYear() + modifier );
			} else {
				date.setMonth( date.getMonth() + modifier );
			}
			break;
		}

		//Key binding for navigating calendar days
		if ( isDayLink ) {
			day = parseInt( classMatch[ 1 ], 10 );
			date.setMonth( date.getMonth() + 1, 0 );
			lastDay = date.getDate();
			date.setDate( day > lastDay ? lastDay : day );

			switch ( which ) {

			// end / home
			case 35:
				date.setDate( lastDay );
				break;
			case 36:
				date.setDate( 1 );
				break;

			// left / up / right / down arrows
			case 37:
				date.setDate( day - 1 );
				break;
			case 38:
				date.setDate( day - 7 );
				break;
			case 39:
				date.setDate( day + 1 );
				break;
			case 40:
				date.setDate( day + 7 );
				break;
			}
		}

		if ( date < minDate || date > maxDate ) {
			if ( which === 35 ) {
				date.setDate( maxDate.getDate() );
			} else if ( which === 36 ) {
				date = minDate;
			} else {
				navigate = false;
			}
		}

		if ( navigate && ( date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear() ) ) {
			$( calendar ).trigger( {
				type: navigateEvent,
				year: date.getFullYear(),
				month: date.getMonth()
			} );
		}

		if ( isDayLink ) {
			$days.find( ".cal-index-" + date.getDate() + " a:first" ).focus();
		}

		event.preventDefault();
		return false;
	}

} );

( function() {

	function pad( number ) {
		if ( number < 10 ) {
			return "0" + number;
		}
		return number;
	}

	Date.prototype.toLocalISOString = function() {
		var tz = this.getTimezoneOffset();
		if ( tz === 0 ) {
			return this.toISOString();
		}
		return this.getFullYear() +
			"-" + pad( this.getMonth() + 1 ) +
			"-" + pad( this.getDate() ) +
			"T" + pad( this.getHours() ) +
			":" + pad( this.getMinutes() ) +
			":" + pad( this.getSeconds() ) +
			"." + ( this.getMilliseconds() / 1000 ).toFixed( 3 ).slice( 2, 5 ) +
			( tz < 0 ? "+" : "-" ) +
			pad( Math.floor( Math.abs( tz / 60 ) ) ) +
			":" + pad( tz % 60 );
	};

	if ( !Date.prototype.toISOString ) {
		Date.prototype.toISOString = function() {
			return this.getUTCFullYear() +
				"-" + pad( this.getUTCMonth() + 1 ) +
				"-" + pad( this.getUTCDate() ) +
				"T" + pad( this.getUTCHours() ) +
				":" + pad( this.getUTCMinutes() ) +
				":" + pad( this.getUTCSeconds() ) +
				"." + ( this.getUTCMilliseconds() / 1000 ).toFixed( 3 ).slice( 2, 5 ) +
				"Z";
		};
	}
}() );

} )( jQuery, window, document, wb );
