/**
 * @title WET-BOEW Datepicker
 * @overview Polyfills for the HTML5 input type="date" in browsers without built in calendar style date pickers.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */

(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var pluginName = "wb-date",
	selector = "input[type=date]",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init." + pluginName,
	setFocusEvent = "setfocus.wb",
	containerName = "wb-picker",
	date = new Date(),
	month = date.getMonth(),
	year = date.getFullYear(),
	format = "YYYY-MM-DD",
	initialized = false,
	$document = wb.doc,
	i18n, i18nText, $container,

	/**
	 * Init runs once per polyfill element on the page. There may be multiple elements.
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var elm = event.target,
			elmId = elm.id;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === elm &&
			elm.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			elm.className += " " + initedClass;

			if ( elm.className.indexOf( "picker-field" ) !== -1 ) {
				return;
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					show: i18n( "date-show" ) + i18n( "space" ),
					hide: i18n( "date-hide" ),
					selected: i18n( "date-sel" ),
					close: i18n( "overlay-close" ) + i18n( "space" ) + i18n( "esc-key" )
				};
			}

			elm.className += " picker-field";

			if ( !$container ) {
				$container = $( "<div id='" + containerName + "' class='picker-overlay' role='dialog' aria-hidden='true'></div>" );

				// Close button
				$( "<button type='button' class='picker-close mfp-close overlay-close' title='" +
					i18nText.close + "'>×<span class='wb-inv'> " + i18nText.close + "</span></button>" )
					.appendTo( $container )
					.on( "click", function( event ) {
						var which = event.which;

						// Ignore middle/right mouse buttons
						if ( !which || which === 1 ) {
							toggle( $container.attr( "aria-controls" ) );
						}
					});

				// Disable the tabbing of all the links when calendar is hidden
				$container.find( "a" ).attr( "tabindex", "-1" );

				$( "body > main" ).after( $container );
			}

			if ( elmId ) {
				createToggleIcon( elmId );
			}

			initialized = true;
		}
	},

	createToggleIcon = function( fieldId ) {
			var fieldLabel = $( "label" )
					.filter( "[for='" + fieldId + "']" )
						.clone()
						.find( ".datepicker-format" )
							.remove()
							.end()
						.text(),
			showFieldLabel = i18nText.show + fieldLabel,
			objToggle = "<button id='" + fieldId + "-picker-toggle' class='picker-toggle' href='javascript:;' title='" +
				showFieldLabel + "'><span class='glyphicon glyphicon-calendar'></span><span class='wb-inv'>" +
				showFieldLabel + "</span></button>";

		$( "#" + fieldId ).after( objToggle );
		$container.slideUp( 0 );
	},

	addLinksToCalendar = function( fieldId, year, month, $days, targetDay ) {
		var field = document.getElementById( fieldId ),
			minDate = field.getAttribute( "min" ),
			maxDate = field.getAttribute( "max" ),
			fromDateISO = wb.date.fromDateISO,
			len = $days.length,

			// $parent = $days.parent(),
			focusDay = ( targetDay ? targetDay - 1 : 0 ),
			lowLimit, highLimit, minDay, maxDay, index, day;

		minDate = fromDateISO( ( minDate ? minDate : "1800-01-01" ) );
		minDay = minDate.getDate() - 1;
		maxDate = fromDateISO( ( maxDate ? maxDate : "2100-01-01" ) );
		maxDay = maxDate.getDate();

		lowLimit = ( year === minDate.getFullYear() && month === minDate.getMonth() );
		highLimit = ( year === maxDate.getFullYear() && month === maxDate.getMonth() );

		// TODO: Find a way to keep detach()
		// $days.detach();
		for ( index = 0; index !== len; index += 1 ) {
			if ( ( !lowLimit && !highLimit ) || ( lowLimit && index >= minDay ) || ( highLimit && index < maxDay ) ) {
				day = $days[ index ];
				day.innerHTML = "<a href='javascript:;' tabindex='" +
					( index === focusDay ? "0" : "-1" ) +
					"'>" + day.getElementsByTagName( "div" )[ 0 ].innerHTML + "</a>";
			}
		}

		// $parent.append( $days );

		if ( targetDay ) {
			$days.eq( targetDay - 1 ).find( "a" ).trigger( setFocusEvent );
		}
	},

	setSelectedDate = function( fieldId, year, month, days ) {
		var date, cpntDate;

		// Reset selection state
		$( days )
			.removeClass( "picker-sel" )
			.find( ".picker-sel-text" )
				.detach();

		// Get the date from the field
		date = document.getElementById( fieldId ).value;

		try {
			if ( date !== "" ) {
				cpntDate = new Date( date );
				if ( cpntDate.getUTCFullYear() === year && cpntDate.getUTCMonth() === month ) {
					$( days[ cpntDate.getUTCDate() - 1 ] )
						.addClass( "picker-sel" )
						.children( "a" )
						.attr( "aria-selected", "true" )
						.append( "<span class='wb-inv picker-sel-text'> [" +
							i18nText.selected + "]</span>" );
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
			fromDateISO = wb.date.fromDateISO,
			targetDate = fromDateISO( field.value );

		if ( !minDate ) {
			minDate = "1800-01-01";
		}

		if ( !maxDate ) {
			maxDate = "2100-01-01";
		}

		$document.trigger( "create.wb-cal", [
				containerName,
				year,
				month,
				true,
				minDate,
				maxDate,
				undefined,
				fieldId,
				fieldId + "-picker-toggle"
			]
		);

		$field.after( $container );

		if ( $container.attr( "aria-hidden" ) !== "false" ) {

			// Hide all other calendars
			hideAll( fieldId );

			// Enable the tabbing of all the links when calendar is visible
			// TODO: Replace with CSS animation
			$container
				.slideDown( "fast" )
				.attr( "aria-hidden", "false");
			$( "#" + fieldId + "-picker-toggle" )
				.children( "a" )
					.children( "span" )
						.text( i18nText.hide );

			if ( targetDate !== null ) {
				$document.trigger( "setFocus.wb-cal", [
						containerName,
						year,
						month,
						fromDateISO( minDate ),
						fromDateISO( maxDate ),
						targetDate.setDate( targetDate.getDate() + 1 )
					]
				);
			} else {
				$( "#" + containerName ).trigger( setFocusEvent );
			}
		} else {
			hide( fieldId );
			$field.trigger( setFocusEvent );
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
		var toggle = $( "#" + fieldId + "-picker-toggle" ),
			fieldLabel = $( "label[for=" + fieldId + "]" ).text();

		$container
			.slideUp( "fast" )
			.attr( "aria-hidden", "true" )
			.trigger( "hideGoToFrm.wb-cal" );
		toggle.children( "a" ).children( "span" ).text( i18nText.show + fieldLabel );
	},

	formatDate = function( year, month, day, format ) {
		var pad = wb.string.pad;
		return format
			.replace( "DD", pad( day, 2 ) )
			.replace( "D", day)
			.replace( "MM", pad( month, 2 ) )
			.replace( "M", month )
			.replace( "YYYY", year )
			.replace( "YY", year.toString().substr( 2, 2 ) );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

$document.on( "click vclick touchstart focusin", function( event ) {
	var which = event.which,
		container;

	// Ignore middle/right mouse buttons
	if ( initialized && ( !which || which === 1 ) ) {
		container = document.getElementById( containerName );

		if ( container !== null &&
			container.getAttribute( "aria-hidden" ) === "false" &&
			event.target.id !== container.id &&
			!$.contains( container, event.target ) ) {

			hide( container.getAttribute( "aria-controls") );
			return false;
		}
	}
});

$document.on( "keydown displayed.wb-cal", "#" + containerName, function( event, year, month, $days, day ) {
	var $container = $( this ),
		eventType = event.type,
		which = event.which,
		fieldId = $container.attr( "aria-controls" );

	switch ( eventType ) {
	case "keydown":

		// Escape key to close overlay
		if ( which === 27 ) {
			hideAll();
			$( "#" + fieldId ).trigger( setFocusEvent );
		}
		break;

	case "displayed":
		addLinksToCalendar( fieldId, year, month, $days, day );
		setSelectedDate( fieldId, year, month, $days );
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

$document.on( "click", ".picker-toggle", function( event ) {
	event.preventDefault();

	var which = event.which,
		pickerId;

	// Ignore middle/right mouse buttons
	if ( which === 1 ) {
		pickerId = this.id;
		toggle( pickerId.substring( 0, pickerId.indexOf( "-picker-toggle" ) ) );
		return false;
	}
});

$document.on( "click", ".cal-days a", function( event ) {
	var which = event.which,
		fieldId, date, year, month, day, $field;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		fieldId = document.getElementById( containerName )
			.getAttribute( "aria-controls" );
		date = wb.date.fromDateISO( this.getElementsByTagName( "time" )[ 0 ]
			.getAttribute( "datetime" ) );
		year = date.getFullYear();
		month = date.getMonth();
		day = date.getDate();

		$field = $( "#" + fieldId );
		$field.val( formatDate( year, month + 1, day, format ) );

		setSelectedDate( fieldId, year, month, day );

		// Hide the calendar on selection
		toggle( fieldId );

		return false;
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
