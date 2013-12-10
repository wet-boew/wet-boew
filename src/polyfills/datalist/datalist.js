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
var pluginName = "wb-datalist",
	selector = "input[list]",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init." + pluginName,
	setFocusEvent = "setfocus.wb",
	initialized = false,
	$document = wb.doc,

	/**
	 * Init runs once per polyfill element on the page. There may be multiple elements.
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var input = event.target,
			inputId = input.id,
			$input, autolist, datalist, options, len, option, value, label, i;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === input &&
			input.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			input.className += " " + initedClass;

			$input = $( input );
			autolist = "<ul role='listbox' id='wb-al-" + input.id + "' class='wb-al hide' aria-hidden='true' aria-live='polite'></ul>";
			datalist = document.getElementById( input.getAttribute( "list" ) );
			options = datalist.getElementsByTagName( "option" );
			len = options.length;

			input.setAttribute( "autocomplete", "off" );
			input.setAttribute( "role", "textbox" );
			input.setAttribute( "aria-haspopup", "true" );
			input.setAttribute( "aria-autocomplete", "list" );
			input.setAttribute( "aria-owns", "wb-al-" + inputId );
			input.setAttribute( "aria-activedescendent", "" );

			autolist += "<ul id='wb-al-" + input.id + "-src' class='wb-al-src hide' aria-hidden='true'>";
			for ( i = 0; i !== len; i += 1 ) {
				option = options[ i ];
				value = option.getAttribute( "value" );
				label = option.getAttribute( "label" );
				if ( !value ) {
					value = option.innerHTML;
				}
				autolist += "<li id='al-opt-" + inputId + "-" + i +
					"'><a href='javascript:;' tabindex='-1'><span class='al-val'>" +
					( !value ? "" : value ) + "</span><span class='al-lbl'>" +
					( !label || label === value ? "" : label ) + "</span></a></li>";
			}
			$input.after( autolist + "</ul>" );

			initialized = true;
		}
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
		var _autolist = input.nextSibling;

		_autolist.className += " hide";
		_autolist.innerHTML = "";
		_autolist.setAttribute( "aria-hidden", "true" );
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
			_autolist = input.nextSibling,
			_alHide = ( _autolist.className.indexOf( "hide" ) !== -1 ),
			options, dest, value, len;

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
			if ( _alHide ) {
				showOptions( input );
			}

			options = _autolist.getElementsByTagName( "a" );
			dest = options[ ( which === 38 ? options.length - 1 : 0 ) ];

			input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );

			// Assign focus to dest
			$( dest ).trigger( setFocusEvent );

			return false;
		} else if ( !_alHide ) {

			// Tab or Escape key
			if ( ( which === 9 || which === 27 ) || ( which === 27 && !event.altKey ) ) {
				closeOptions( input );
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
		var _autolist = link.parentNode.parentNode,
			input = _autolist.previousSibling,
			$input = $( input ),
			_span, dest, value, len, children;

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
			_span = link.getElementsByTagName( "span" );

			// .al-val
			value = _span[ 0 ].innerHTML;

			if ( value.length === 0 ) {

				// .al-lbl
				value = _span[ 1 ].innerHTML;
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
					children = _autolist.getElementsByTagName( "li" );
					dest = children[ children.length - 1 ];
				}

			// Down arrow
			} else {
				dest = link.parentNode.nextSibling;
				if ( !dest ) {
					dest = _autolist.getElementsByTagName( "li" )[ 0 ];
				}
			}
			dest = dest.getElementsByTagName( "a" )[ 0 ];

			input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );
			$( dest ).trigger( setFocusEvent );

			return false;
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
$document.on( "timerpoke.wb " + initEvent + " keydown click vclick touchstart", selector, function( event ) {
	var input = event.target,
		eventType = event.type,
		which = event.which;

	switch ( eventType ) {
	case "timerpoke":
	case "wb-init":
		init( event );
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
			return false;
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
		inputs, input, _autolist, i, len;

	// Only correct width if the polyfill has been initialized
	if ( initialized ) {
		inputs = $document.find( selector ).get();
		len = inputs.length;
		for ( i = 0; i !== len; i += 1 ) {
			input = inputs[ i ];
			if ( focusEvent ) {
				_autolist = input.nextSibling;
				if ( _autolist.className.indexOf( "hide" ) === -1 &&
					eventTargetId !== input.id && eventTargetId !== _autolist.id &&
					!$.contains( _autolist, eventTarget ) ) {

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
