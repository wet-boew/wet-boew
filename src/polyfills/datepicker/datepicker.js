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
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var selector = "input[type=date]",
	$document = vapour.doc,
	date = new Date(),
	month = date.getMonth(),
	year = date.getFullYear(),
	format = "YYYY-MM-DD",
	i18n, i18nText, $container,

	/*
	 * Init runs once per polyfill element on the page. There may be multiple elements.
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {DOM element} _input The input field to be polyfilled
	 * @param {jQuery DOM element} $input The input field to be polyfilled
	 */
	init = function( event ) {
		var elm = event.target,
			elmId = elm.id,
			modeJS = vapour.getMode() + ".js";

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		if ( elm.className.indexOf( "picker-field" ) !== -1 ) {
			return;
		}

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = window.i18n;
			i18nText = {
				datepickerShow: i18n( "%datepicker-show" ) + i18n( "%interword-space" ),
				datepickerHide: i18n( "%datepicker-hide" ),
				datepickerSelected: i18n( "%datepicker-selected" )
			};
		}

		elm.className += " picker-field";

		if ( !$container) {
			$container = $( "<div id='wb-picker' class='picker-overlay' role='dialog' aria-hidden='true'></div>" );

			// Close button
			$( "<a class='picker-close' role='button' href='javascript:;'><img src='" + vapour.getPath( "/assets" ) + "/cross-button.png' alt='" + i18nText.datepickerHide + "' /></a>" )
				.appendTo( $container )
				.click(function( event ) {
					var which = event.which;

					// Ignore middle/right mouse buttons
					if ( !which || which === 1 ) {
						toggle( $container.attr( "aria-controls") );
					}
				});

			// Disable the tabbing of all the links when calendar is hidden
			$container.find( "a" ).attr( "tabindex", "-1" );

			$( "body > main > div" ).after( $container );
		}

		if ( elmId ) {
			createToggleIcon( elmId );
		}
		
		// Load Magnific Popup dependency and bind the init event handler
		window.Modernizr.load({
			load: "site!deps/xregexp" + modeJS
		});
	},

	createToggleIcon = function( fieldId ) {
		var fieldLabel = $( "label[for=" + fieldId + "]" ).text(),
			objToggle = "<a id='" + fieldId + "-picker-toggle' class='picker-toggle' href='javascript:;'><img src='" +
				vapour.getPath( "/assets" ) + "/calendar-month.png' alt='" + i18nText.datepickerShow + fieldLabel + "'/></a>";

		$( "#" + fieldId ).after( objToggle );
		$container.slideUp( 0 );
	},

	addLinksToCalendar = function( fieldId, year, month, days, format ) {
		var field = document.getElementById( fieldId ),
			minDate = field.getAttribute( "min" ),
			maxDate = field.getAttribute( "max" ),
			fromDateISO = vapour.date.fromDateISO,
			lLimit, hLimit;

		minDate = fromDateISO( ( minDate ? minDate : "1800-01-01" ) );
		maxDate = fromDateISO( ( maxDate ? maxDate : "2100-01-01" ) );

		lLimit = ( year === minDate.getFullYear() && month === minDate.getMonth() );
		hLimit = ( year === maxDate.getFullYear() && month === maxDate.getMonth() );

		days.each(function (index, value) {
			if ((!lLimit && !hLimit) || (lLimit === true && index >= minDate.getDate()) || (hLimit === true && index <= maxDate.getDate())) {
				var obj = $(value).children("div"),
					link = $("<a href='javascript:;'></a>"),
					parent = obj.parent();
				parent.empty();
				link.append(obj.html());
				link.appendTo(parent);

				link.on("click vclick touchstart", {fieldId: fieldId, year: year, month : month, day: index + 1, days: days, format: format}, function (event) {
					var which = event.which,
						fieldId = event.data.fieldId,
						year = event.data.year,
						month = event.data.month,
						format = event.data.format;

					// Ignore middle/right mouse buttons
					if ( !which || which === 1 ) { 
						var $field = $("#" + event.data.fieldId),
							prevDate = $field.val();

						$field.val( formatDate( year, month + 1, event.data.day, format) );
						if ( prevDate !== $field.val() ) {
							$field.trigger( "change" );
						}

						setSelectedDate( fieldId, year, month, event.data.days, format );

						//Hide the calendar on selection
						toggle( fieldId );

						return false;
					}
				});
			}
		});
	},

	setFocus = function( calendarId, year, month, minDate, maxDate, targetDate ) {
		if (targetDate.getTime() < minDate.getTime()) {
			targetDate = minDate;
			targetDate.setDate(targetDate.getDate() + 1);
		} else if (targetDate.getTime() > maxDate.getTime()) {
			targetDate = maxDate;
			targetDate.setDate(targetDate.getDate() + 1);
		}

		if ( targetDate.getMonth() !== month || targetDate.getFullYear() !== year ) {
			$document.trigger( "create.wb-calendar", [
					calendarId,
					targetDate.getFullYear(),
					targetDate.getMonth(),
					true,
					minDate,
					maxDate
				]
			);
		}

		$container.find(".cal-day-list").children("li:eq(" + (targetDate.getDate() - 1) + ")").children("a").trigger( "focus.wb" );
	},

	setSelectedDate = function( fieldId, year, month, days, format ) {
		var pattern, date, cpntDate, regex;
		// Reset selection state
		$(days).removeClass("datepicker-selected").find(".datepicker-selected-text").detach();

		// Create regular expression to match value (Note: Using a, b and c to avoid replacing conflicts)
		format = format
			.replace( "DD", "(?<a> [0-9]{2})" )
			.replace( "D", "(?<a> [0-9] )" )
			.replace( "MM", "(?<b> [0-9]{2})" )
			.replace( "M", "(?<b> [0-9])" )
			.replace( "YYYY", "(?<c> [0-9]{4})" )
			.replace( "YY", "(?<c /> [0-9]{2})" );
		pattern = "^" + format + "$";

		//Get the date from the field
		date = document.getElementById( fieldId ).value;
		regex = new XRegExp( pattern, "x" );

		try {
			if ( date !== "" ) {
				cpntDate = $.parseJSON(date.replace(regex, "{\"year\":\"$1\", \"month\":\"$2\", \"day\":\"$3\"}"));
				if ( parseInt( cpntDate.year, 10 ) === year && parseInt( cpntDate.month, 10 ) === month + 1 ) {
					$( days[ cpntDate.day - 1 ] )
						.addClass( "datepicker-selected" )
						.children( "a" )
						.append( "<span class='wb-invisible datepicker-selected-text'> [" + i18nText.datepickerSelected + "]</span>");
				}
			}
		} catch ( error ) {
		}
	},

	toggle = function( fieldId ) {
		var field = document.getElementById( fieldId ),
			$field = $( field ),
			minDate = field.getAttribute( "min" ),
			maxDate = field.getAttribute( "max" ),
			toggle = $( "#" + fieldId + "-picker-toggle" ),
			fromDateISO = vapour.date.fromDateISO,
			targetDate = fromDateISO( field.value ),
			prevMonthLink, nextMonthLink;

		if ( !minDate ) {
			minDate = "1800-01-01";
		}

		if ( !maxDate ) {
			maxDate = "2100-01-01";
		}

		$container.attr({
			"aria-labelledby": fieldId + "-picker-toggle",
			"aria-controls": fieldId
		});

		$document.trigger( "create.wb-calendar", [
				"wb-picker",
				year,
				month,
				true,
				minDate,
				maxDate
			]
		);
		$field.after( $container );

		$container
			.unbind( "focusout.calendar" )
			.unbind( "focusin.calendar" );

		if ( $container.attr( "aria-hidden" ) !== "false" ) {

			// Hide all other calendars
			hideAll( fieldId );

			// Enable the tabbing of all the links when calendar is visible
			$container
				.slideDown( "fast" )
				.attr( "aria-hidden", "false")
				.find( "a" ).attr( "tabindex", 0 );
			toggle.children( "a" ).children( "span" ).text( i18nText.datepickerHide );

			if (targetDate !== null) {
				targetDate.setDate( targetDate.getDate() + 1 );
				setFocus( "wb-picker", year, month, fromDateISO( minDate ), fromDateISO( maxDate ), targetDate );
			} else {
				prevMonthLink = $container.find( ".cal-prevmonth a" );
				if ( prevMonthLink.length !== 0 ) {
					prevMonthLink.trigger( "focus.wb" );
				} else {
					nextMonthLink = $container.find( ".cal-nextmonth a" );
					if ( nextMonthLink.length !== 0 ) {
						nextMonthLink.trigger( "focus.wb" );
					} else {
						$container.find( ".cal-goto a" ).trigger( "focus.wb" );
					}
				}
			}
		} else {
			hide( fieldId );
			$field.trigger( "focus.wb" );
		}
	},

	hideAll = function( exception ) {
		var pickerFields = $( ".picker-field" ).get(),
			len = pickerFields.length,
			i, pickerFieldId;

		for ( i = 0; i !== len; i += 1 ) {
			pickerFieldId = pickerFields[ i ].id;
			if ( pickerFieldId !== exception ) {
				hide( pickerFieldId );
			}
		}
	},

	hide = function( fieldId ) {
		var toggle = $("#" + fieldId + "-picker-toggle"),
			fieldLabel = $( "label[for=" + fieldId + "]" ).text();

		// Disable the tabbing of all the links when calendar is hidden
		$container.find("a").attr("tabindex", "-1");
		$container
			.slideUp( "fast" )
			.attr( "aria-hidden", "true" )
			.trigger( "hideGoToForm.wb-calendar" );
		toggle.children("a").children("span").text(i18nText.datepickerShow + fieldLabel);
	},

	formatDate = function( year, month, day, format ) {
		var pad = vapour.string.pad;
		return format
			.replace( "DD", pad( day, 2 ) )
			.replace( "D", day)
			.replace( "MM", pad( month, 2 ) )
			.replace( "M", month )
			.replace( "YYYY", year )
			.replace( "YY", year.toString().substr( 2, 2 ) );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, init );

$document.on( "click vclick touchstart focusin", function ( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		if ( $container.attr("aria-hidden") === "false" && !$.contains( $container[ 0 ], event.target ) ) {
			hide( $container.attr( "aria-controls") );
			return false;
		}
	}
});

// Keyboard nav
$document.on( "keydown", ".cal-day-list a", function ( event ) {
	var $elm = $( this ),
		calendarId = $container.attr( "id" ),
		className = this.className,
		index = className.substring( className.indexOf( "cal-index-" ) ),
		which = event.which,
		shiftKey = event.shiftKey,
		field = document.getElementById( $container.attr( "aria-controls" ) ),
		minDate = field.getAttribute( "min" ),
		maxDate = field.getAttribute( "max" ),
		fromDateISO = vapour.date.fromDateISO,
		nextDate, links;

	minDate = fromDateISO( ( minDate ? minDate : "1800-01-01" ) );
	maxDate = fromDateISO( ( maxDate ? maxDate : "2100-01-01" ) );

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {
		switch ( which ) {

		// escape key
		case 27:
			toggle( $container.attr( "aria-controls" ) );
			return false;

		// spacebar
		case 32:
			$elm.trigger( "click" );
			return false;

		case 33:
			if ( shiftKey ) {
				// shift + page up
				nextDate = new Date( year - 1, month, index + 1 );
			} else {
				// page up
				nextDate = new Date( year, month - 1, index + 1 );
			}
			break;

		case 34:
			if ( shiftKey ) {
				// shift + page down
				nextDate = new Date( year + 1, month, index + 1 );
			} else {
				// page down
				nextDate = new Date( year, month + 1, index + 1 );
			}
			break;

		// end or home key
		case 35:
		case 36:
			links = $elm.closest( "ol" ).find( "li a" );
			links.eq( ( which === 35 ? links.length - 1 : 0 ) ).trigger( "focus.wb" );
			return false;

		// left arrow
		case 37:
			nextDate = new Date( year, month, index );
			break;

		// up arrow
		case 38:
			nextDate = new Date( year, month, index - 6 );
			break;

		// right arrow
		case 39:
			nextDate = new Date( year, month, index + 2 );
			break;

		// down arrow	
		case 40:
			nextDate = new Date( year, month, index + 8 );
			break;
		}
	} else {
		if ( event.ctrlKey && !( event.altKey || event.metaKey ) ) {
			if ( which === 35 ) {
				// end
				nextDate = new Date( year, 11, 31 );
				return false;
			} else if ( which === 36 ) {
				// home
				nextDate = new Date( year, 0, 1 );
			}
		}
	}

	// Move focus to the new date
	if ( nextDate ) {
		setFocus( calendarId, year, month, minDate, maxDate, nextDate );
		return false;
	}
});

$document.on( "keydown calendarDisplayed.wb-calendar", "#wb-picker", function ( event, year, month, days ) {
	var $container = $( this ),
		eventType = event.type,
		which = event.which,
		fieldId = $container.attr( "aria-controls" );

	switch ( eventType ) {
	case "keydown":

		// Escape key to close overlay
		if ( which === 27 ) {
			hideAll();
			$( "#" + fieldId ).trigger( "focus.wb" );
		}
		break;

	case "calendarDisplayed":
		addLinksToCalendar( fieldId, year, month, days, format );
		setSelectedDate( fieldId, year, month, days, format );
		break;

	case "click":
	case "vclick":
	case "touchstart":
	case "focusin":
		if ( $container.attr( "aria-hidden" ) === false ) {

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				if ( event.stopPropagation ) {
					event.stopImmediatePropagation();
				} else {
					event.cancelBubble = true;
				}
			}
		}
	}
});

$document.on( "click vclick touchstart", ".picker-toggle", function ( event ) {
	var which = event.which,
		pickerId;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		pickerId = this.id;
		toggle( pickerId.substring( 0, pickerId.indexOf( "-picker-toggle" ) ) );
		return false;
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );