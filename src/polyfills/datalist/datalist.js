/**
 * @title WET-BOEW Datalist polyfill
 * @overview Adds auto-complete functionality to specific text input fields by dynamically displaying a list of words that match the user's input.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var componentName = "wb-datalist",
	selector = "input[list]",
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	setFocusEvent = "setfocus.wb",
	initialized = false,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var input = wb.init( event, componentName, selector );

		if ( input ) {

			// Adds WAI-ARIA
			input.setAttribute( "autocomplete", "off" );
			input.setAttribute( "role", "textbox" );
			input.setAttribute( "aria-haspopup", "true" );
			input.setAttribute( "aria-autocomplete", "list" );
			input.setAttribute( "aria-owns", "wb-al-" + input.id );
			input.setAttribute( "aria-activedescendent", "" );

			populateOptions( input );

			// Identify that initialization has completed
			wb.ready( $( input ), componentName );
			initialized = true;
		}
	},

	populateOptions = function( input ) {
		var $input = $( input ),
			autolist = "<ul role='listbox' id='wb-al-" + input.id + "' class='wb-al hide' aria-hidden='true' aria-live='polite'></ul>",
			datalist = document.getElementById( input.getAttribute( "list" ) ),
			options = datalist.getElementsByTagName( "option" ),
			len = options.length,
			option, value, label, i;

		autolist += "<ul id='wb-al-" + input.id + "-src' class='wb-al-src hide' aria-hidden='true'>";
		for ( i = 0; i !== len; i += 1 ) {
			option = options[ i ];
			value = option.getAttribute( "value" );
			label = option.getAttribute( "label" );
			if ( !value ) {
				value = option.innerHTML;
			}
			autolist += "<li id='al-opt-" + input.id + "-" + i +
				"'><a href='javascript:;' tabindex='-1'><span class='al-val'>" +
				( !value ? "" : value ) + "</span><span class='al-lbl'>" +
				( !label || label === value ? "" : label ) + "</span></a></li>";
		}
		$input.after( autolist + "</ul>" );
	},

	/**
	 * Shows/hides the available options based upon the input in the polyfilled input field.
	 * @method showOptions
	 * @param {DOM element} input The polyfilled input field
	 */
	showOptions = function( input, value ) {
		var $autolist = $( input.nextSibling ),
			$options = $autolist.next().children().clone(),
			comparator;

		if ( value && value.length !== 0) {
			comparator = value.toLowerCase();
			$options = $options.filter( function() {
				var $this = $( this ),
					value = $this.find( "span.al-val" ).html();
				if ( value.length === 0 ) {
					value = $this.find( "span.al-lbl" ).html();
				}
				return ( comparator.length === 0 || value.toLowerCase().indexOf( comparator ) !== -1 );
			});
		}

		// Add the visible options to the autolist
		$autolist.empty().append( $options );

		if ( $options.length !== 0 ) {
			correctWidth( input );
			$autolist.removeClass( "hide" ).attr( "aria-hidden", "false" );
			input.setAttribute( "aria-expanded", "true" );
		} else {
			$autolist.addClass( "hide" ).attr( "aria-hidden", "true" );
			input.setAttribute( "aria-expanded", "false" );
		}
	},

	/**
	 * Hides all the options
	 * @method closeOptions
	 * @param {DOM element} input The polyfilled input field
	 */
	closeOptions = function( input ) {
		var autolist = input.nextSibling;

		autolist.className += " hide";
		autolist.innerHTML = "";
		autolist.setAttribute( "aria-hidden", "true" );
		input.setAttribute( "aria-expanded", "false" );
		input.setAttribute( "aria-activedescendent", "" );
	},

	/**
	 * Corrects the width of the autolist for the polyfilled input field
	 * @method correctWidth
	 * @param {DOM element} input The polyfilled input field
	 */
	correctWidth = function( input ) {
		var $elm = $( input ),
			$autolist = $elm.next();

		$autolist.css({
			width: $elm.outerWidth(),
			left: $elm.position().left
		});
	},

	/**
	 * Keyboard event handler for the polyfilled input field
	 * @method correctWidth
	 * @param {integer} which Value for event.which
	 * @param {jQuery Event} event The event that triggered this method call
	 */
	keyboardHandlerInput = function( which, event ) {
		var input = event.target,
			autolist = input.nextSibling,
			autolistHidden = ( autolist.className.indexOf( "hide" ) !== -1 ),
			options, dest, value, len;

		// Unmodified keystrokes only
		if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {

			// Spacebar, a - z keys, 0 - 9 keys punctuation, and symbols
			if ( which === 32 || ( which > 47 && which < 91 ) ||
				( which > 95 && which < 112 ) || ( which > 159 && which < 177 ) ||
				( which > 187 && which < 223 ) ) {
				if ( !event.altKey ) {
					showOptions( input, input.value + String.fromCharCode( which ) );
				}

			// Backspace
			} else if ( which === 8 && !event.altKey ) {
				value = input.value;
				len = value.length;

				if ( len !== 0 ) {
					showOptions( input, value.substring( 0, len - 1 ) );
				}

			// Up / down arrow
			} else if ( ( which === 38 || which === 40) && input.getAttribute( "aria-activedescendent" ) === "" ) {
				if ( autolistHidden ) {
					showOptions( input );
				}

				options = autolist.getElementsByTagName( "a" );
				dest = options[ ( which === 38 ? options.length - 1 : 0 ) ];

				input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );

				// Assign focus to dest
				$( dest ).trigger( setFocusEvent );

				return false;
			} else if ( !autolistHidden ) {

				// Tab or Escape key
				if ( ( which === 9 || which === 27 ) || ( which === 27 && !event.altKey ) ) {
					closeOptions( input );
				}
			}
		}
	},

	/**
	 * Keyboard event handler for the autolist of the polyfilled input field
	 * @method correctWidth
	 * @param {integer} which Value for event.which
	 * @param {DOM element} link Link element that is the target of the event
	 */
	keyboardHandlerAutolist = function( which, link ) {
		var autolist = link.parentNode.parentNode,
			input = autolist.previousSibling,
			$input = $( input ),
			span, dest, value, len, children;

		// Unmodified keystrokes only
		if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {

			// Spacebar, a - z keys, 0 - 9 keys punctuation, and symbols
			if ( which === 32 || ( which > 47 && which < 91 ) ||
				( which > 95 && which < 112 ) || ( which > 159 && which < 177 ) ||
				( which > 187 && which < 223 ) ) {

				input.value += String.fromCharCode( which );
				$input.trigger( setFocusEvent );
				showOptions( input, input.value );

				return false;

			// Backspace
			} else if ( which === 8 ) {
				value = input.value;
				len = value.length;

				if ( len !== 0 ) {
					input.value = value.substring( 0, len - 1 );
					showOptions( input, input.value );
				}

				$input.trigger( setFocusEvent );

				return false;

			// Enter key
			} else if ( which === 13) {
				span = link.getElementsByTagName( "span" );

				// .al-val
				value = span[ 0 ].innerHTML;

				if ( value.length === 0 ) {

					// .al-lbl
					value = span[ 1 ].innerHTML;
				}

				input.value = value;
				$input.trigger( setFocusEvent );
				closeOptions( input );

				return false;

			// Tab or Escape key
			} else if ( which === 9 || which === 27 ) {
				$input.trigger( setFocusEvent );
				closeOptions( input );

				return false;

			// Up or down arrow
			} else if ( which === 38 || which === 40 ) {

				// Up arrow
				if ( which === 38 ) {
					dest = link.parentNode.previousSibling;
					if ( !dest ) {
						children = autolist.getElementsByTagName( "li" );
						dest = children[ children.length - 1 ];
					}

				// Down arrow
				} else {
					dest = link.parentNode.nextSibling;
					if ( !dest ) {
						dest = autolist.getElementsByTagName( "li" )[ 0 ];
					}
				}
				dest = dest.getElementsByTagName( "a" )[ 0 ];

				input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );
				$( dest ).trigger( setFocusEvent );

				return false;
			}
		}
	},

	/**
	 * Click / Touch event handler for the autolist of the polyfilled input field
	 * @method correctWidth
	 * @param {integer} eventTarget Value for event.target
	 */
	clickHandlerAutolist = function( eventTarget ) {
		var nodeName = eventTarget.nodeName.toLowerCase(),
			link = nodeName === "a" ? eventTarget : eventTarget.parentNode,
			autolist = link.parentNode.parentNode,
			input = autolist.previousSibling,
			$input = $( input ),
			span = link.getElementsByTagName( "span" ),

			// .al-val
			value = span[ 0 ].innerHTML;

		if ( value.length === 0 ) {

			// .al-lbl
			value = span[ 1 ].innerHTML;
		}

		input.value = value;
		$input.trigger( setFocusEvent );
		closeOptions( input );

		return false;
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + updateEvent + " keydown click vclick touchstart", selector, function( event ) {
	var input = event.target,
		eventType = event.type,
		which = event.which;

	switch ( eventType ) {
	case "timerpoke":
	case "wb-init":
		init( event );
		break;

	case "wb-update":
		if ( event.namespace === componentName ) {
			populateOptions( event.target );
		}
		break;

	case "keydown":
		if ( !(event.ctrlKey || event.metaKey ) ) {
			return keyboardHandlerInput( which, event );
		}
		break;

	case "click":
	case "vclick":
	case "touchstart":

		// Ignore middle/right mouse buttons
		if ( !which || which === 1 ) {
			if ( input.nextSibling.className.indexOf( "hide" ) === -1 ) {
				closeOptions( input );
			} else {
				showOptions( input, input.value );
			}
		}
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

$document.on( "keydown click vclick touchstart", ".wb-al a, .wb-al span", function( event ) {
	var link = event.target,
		eventType = event.type,
		which = event.which;

	switch ( eventType ) {
	case "keydown":
		if ( !(event.ctrlKey || event.metaKey ) ) {
			return keyboardHandlerAutolist( which, link );
		}
		break;
	case "click":
	case "vclick":
	case "touchstart":

		// Ignore middle/right mouse buttons
		if ( !which || which === 1 ) {
			return clickHandlerAutolist( link );
		}
		break;
	}
});

// Handle focus and resize events
$document.on( "focusin txt-rsz.wb win-rsz-width.wb win-rsz-height.wb", function( event ) {
	var focusEvent = ( event.type === "focusin" ),
		eventTarget = event.target,
		eventTargetId = ( eventTarget ? eventTarget.id : null ),
		inputs, input, autolist, i, len;

	// Only correct width if the polyfill has been initialized
	if ( initialized ) {
		inputs = $document.find( selector ).get();
		len = inputs.length;
		for ( i = 0; i !== len; i += 1 ) {
			input = inputs[ i ];
			if ( focusEvent ) {
				autolist = input.nextSibling;
				if ( autolist.className.indexOf( "hide" ) === -1 &&
					eventTargetId !== input.id && eventTargetId !== autolist.id &&
					!$.contains( autolist, eventTarget ) ) {

					closeOptions( input );
				}
			} else {
				correctWidth( input );
			}
		}
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
