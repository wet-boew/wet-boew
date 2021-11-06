/**
 * @title WET-BOEW Datepicker
 * @overview Polyfills for the HTML5 input type="date" in browsers without built in calendar style date pickers.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */

( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var componentName = "wb-date",
	selector = "input[type=date]",
	initEvent = "wb-init." + componentName,
	setFocusEvent = "setfocus.wb",
	containerName = "wb-picker",
	toggleSuffix = "-picker-toggle",
	today = new Date(),
	$document = wb.doc,
	fromDateISO = wb.date.fromDateISO,
	defaults = {
		minDate: new Date( 1800, 0, 1 ),
		maxDate: new Date( 2100, 0, 1 ),
		year: today.getFullYear(),
		month: today.getMonth(),
		daysCallback: function( year, month, $days, range ) {
			var $inRange = $days,
				selectedDate = this.date,
				linkFocus;

			if ( range ) {
				if ( range.max ) {
					$inRange = $inRange.filter( ":lt(" + ( range.max + 1 ) + ")" );
				}

				if ( range.min ) {
					$inRange = $inRange.filter( ":gt(" + ( range.min - 1 ) + ")" );
				}
			}

			$inRange.wrap( "<a href='javascript:;' tabindex='-1'></a>" );

			if ( selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() ) {
				linkFocus = $days.eq( selectedDate.getDate() - 1 );

				linkFocus.parent().attr( "aria-selected", true );
			} else if ( year === today.getFullYear() && month === today.getMonth() ) {
				linkFocus = $days.eq( today.getDate() - 1 );
			} else {
				linkFocus = $inRange.eq( 0 );
			}

			linkFocus.parent().removeAttr( "tabindex" );
		}
	},
	i18n, i18nText, $container, calendar, focusOutTimer,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			state = {},
			elmId, space, settings, minDate, maxDate, initDate;

		if ( elm ) {
			elmId = elm.id;

			if ( elm.className.indexOf( "picker-field" ) !== -1 ) {
				return;
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				space = i18n( "space" ).replace( "&#32;", " " ).replace( "&#178;", "" );
				i18nText = {
					show: i18n( "date-show" ).replace( "\\'", "'" ) + space,
					hide: i18n( "date-hide" ).replace( "\\'", "'" ) + space +
						space + i18n( "esc-key" ).replace( "\\'", "'" ),
					selected: i18n( "date-sel" ).replace( "\\'", "'" )
				};
			}

			elm.className += " picker-field";

			//Build the calendar state
			settings = {
				field: this,
				$field: $( this ),
				labelText: $( "label[for=" + wb.jqEscape( elm.id ) + "]" )
					.clone()
					.find( ".datepicker-format, .error" )
					.remove()
					.end()
					.text()
			};

			minDate = fromDateISO( elm.getAttribute( "min" ) );
			maxDate = fromDateISO( elm.getAttribute( "max" ) );

			if ( minDate ) {
				settings.minDate = minDate;
			}

			if ( maxDate ) {
				settings.maxDate = maxDate;
			}

			elm.state = $.extend( state, defaults, settings );

			if ( today >= state.minDate && today <= state.maxDate ) {
				initDate = today;
			} else if ( state.minDate > today ) {
				initDate = state.minDate;
			} else {
				initDate = state.maxDate;
			}

			if ( initDate ) {
				state.year = initDate.getFullYear();
				state.month = initDate.getMonth();
			}

			updateState.call( elm );

			if ( !calendar ) {
				createCalendar( elm );
			}

			if ( elmId ) {
				createToggleIcon( elm );
			}

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	},

	createCalendar = function( elm ) {
		var closeText = i18nText.hide;

		$container = $( "<div id='" + containerName + "' class='picker-overlay' role='dialog' tabindex='-1' aria-hidden='true'></div>" );

		// Disable the tabbing of all the links when calendar is hidden
		$container.find( "a" ).attr( "tabindex", "-1" );

		$( "main" ).after( $container );

		calendar = wb.calendar.create( $container, elm.state );

		// Close button
		$( "<button type='button' class='picker-close mfp-close overlay-close' title=\"" +
			closeText + "\">&#xd7;<span class='wb-inv'> " + closeText + "</span></button>" )
			.appendTo( $container );
	},

	createToggleIcon = function( elm ) {
		var fieldId = elm.id,
			fieldLabelText = elm.state.labelText,
			showFieldLabelText = i18nText.show + fieldLabelText,
			objToggle = "<span class='input-group-btn'><a href='javascript:;' button id='" + fieldId + "-picker-toggle' class='btn btn-default picker-toggle' href='javascript:;' title=\"" +
				showFieldLabelText + "\"><span class='glyphicon glyphicon-calendar'></span><span class='wb-inv'>" +
				showFieldLabelText + "</span></a></span>";

		$( "#" + wb.jqEscape( fieldId ) )
			.wrap( "<span class='wb-date-wrap input-group'></span>" )
			.after( objToggle );
		$container.slideUp( 0 );
	},

	updateState = function() {
		var state = this.state,
			minDate = fromDateISO( this.getAttribute( "min" ) ) || state.minDate,
			maxDate = fromDateISO( this.getAttribute( "max" ) ) || state.maxDate,
			date = fromDateISO( this.value );

		this.state.minDate = minDate;
		this.state.maxDate = maxDate;

		if ( date && date >= minDate && date <= maxDate ) {
			state.date = date;
			state.year = date.getFullYear();
			state.month = date.getMonth();
		} else {
			state.date = null;
		}
	},

	toggle = function( field ) {
		if ( $container.attr( "aria-hidden" ) !== "false" ) {
			show( field );
		} else {
			hide();
		}
	},

	hide = function() {
		var field = calendar.field,
			$field = calendar.$field,
			labelText = i18nText.show + calendar.labelText;

		$( "#" + wb.jqEscape( field.id + toggleSuffix ) )
			.attr( "title", labelText.replace( "&#32;", " " ) )
			.children( ".wb-inv" )
			.html( labelText );

		$container
			.removeClass( "open" )
			.attr( "aria-hidden", "true" );

		$field.trigger( setFocusEvent );
	},

	show = function( field ) {
		var fieldId = field.id,
			closeText = i18nText.hide;

		updateState.call( field );
		calendar.reInit( field.state );

		position();

		$container
			.addClass( "open" )
			.attr( {
				"aria-controls": fieldId,
				"aria-labelledby": fieldId + toggleSuffix,
				"aria-hidden": "false"
			} )
			.get( 0 ).focus();

		$( "#" + wb.jqEscape( fieldId + toggleSuffix ) )
			.attr( "title", closeText )
			.children( ".wb-inv" )
			.text( closeText );
	},

	position = function() {
		var field = calendar.field,
			position = calendar.$field.offset();

		$container
			.attr( "style", "top:" + ( position.top + field.offsetHeight ) + "px;left:" + position.left + "px" );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

$document.on( "focusout focusin", "#" + containerName + " .wb-clndr",  function( event ) {

	// Hide the calendar when the focus leaves the calendar
	switch ( event.type ) {
	case "focusout":
		focusOutTimer = setTimeout( hide, 10 );
		break;
	case "focusin":
		clearTimeout( focusOutTimer );
	}
} );

$document.on( "keydown", "#" + containerName, function( event ) {

	// Escape key to close overlay
	if ( event.which === 27 ) {
		hide();
	}

} );

$document.on( "click", ".picker-overlay .cal-days a", function( event ) {
	var which = event.which,
		field = calendar.field;

	// Ignore middle/right mouse buttons
	if ( ( !which || which === 1 ) && !field.disabled && !field.readOnly ) {
		field.value = $( event.currentTarget ).find( "time" ).attr( "datetime" );
		$( field ).trigger( "change" );

		// Hide the calendar on selection
		hide();

		return false;
	}
} );

$document.on( "click", ".picker-toggle", function( event ) {
	event.preventDefault();

	var which = event.which,
		pickerId, field;

	// Ignore middle/right mouse buttons
	if ( ( !which || which === 1 ) ) {
		pickerId = event.currentTarget.id;
		field = $( "#" + wb.jqEscape( pickerId.substring( 0, pickerId.indexOf( toggleSuffix ) ) ) ).get( 0 );
		if ( !field.disabled && !field.readOnly ) {
			toggle( field );
			return false;
		}
	}
} );

$document.on( "click", ".picker-close", function( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {

		// Stop propagation of the click event
		if ( event.stopPropagation ) {
			event.stopImmediatePropagation();
		} else {
			event.cancelBubble = true;
		}

		hide();
	}
} );

$document.on( "txt-rsz.wb win-rsz-width.wb win-rsz-height.wb", function() {
	if ( $container && $container.hasClass( "open" ) ) {
		position();
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
