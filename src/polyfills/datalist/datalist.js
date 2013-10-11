/*
 * @title WET-BOEW Datalist polyfill
 * @overview Adds auto-complete functionality to specific text input fields by dynamically displaying a list of words that match the user's input.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var selector = "input[list]",
	$document = vapour.doc,
	initialized = false,

	/*
	 * Init runs once per polyfill element on the page. There may be multiple elements. 
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {DOM element} _input The input field to be polyfilled
	 * @param {jQuery DOM element} $input The input field to be polyfilled
	 */
	init = function( _input, $input ) {
		var inputId = _input.id,
			autolist = "<ul role='listbox' id='wb-autolist-" + _input.id + "' class='wb-autolist al-hide' aria-hidden='true' aria-live='polite'></ul>",
			datalist = document.getElementById( _input.getAttribute( "list" ) ),
			options = datalist.getElementsByTagName( "option" ),
			len = options.length,
			option, value, label, i;
			//uniqueId = elmId + "-datalist";

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );
		
		_input.setAttribute( "autocomplete", "off" );
		_input.setAttribute( "role", "textbox" );
		_input.setAttribute( "aria-haspopup", "true" );
		_input.setAttribute( "aria-autocomplete", "list" );
		_input.setAttribute( "aria-owns", "wb-autolist-" + inputId );
		_input.setAttribute( "aria-activedescendent", "" );
		/*$input.wrap( "<div class='wb-al-container' role='application' aria-" +
			( label.length !== 0 ? "labelledby='" + uniqueid : "-label='" +
			_input.getAttribute( "title" ) ) + "'/>" );*/

		autolist += "<ul id='wb-autolist-" + _input.id + "-src' class='wb-autolist-src' aria-hidden='true'>";
		for ( i = 0; i !== len; i += 1 ) {
			option = options[ i ];
			value = option.getAttribute( "value" );
			label = option.getAttribute( "label" );
			if ( !value ) {
				value = option.innerHTML;
			}
			autolist += "<li class='al-option' id='al-option-" + inputId + "-" + i + "'><a href='javascript:;'><span class='al-value'>" + ( !value ? "" : value  ) + "</span><span class='al-label'>" + ( !label || label === value ? "" : label ) + "</span></a></li>";
		}
		$input.after( autolist + "</ul>" );

		initialized = true;
	},

	/*
	 * Shows/hides the available options based upon the input in the polyfilled input field.
	 * @method showOptions
	 * @param {DOM element} _input The polyfilled input field
	 */
	showOptions = function( _input, value ) {
		var $autolist = $( _input.nextSibling ),
			$options = $autolist.next().children().clone(),
			comparator;

		if ( value && value.length !== 0) {
			comparator = value.toLowerCase();
			$options = $options.filter( function() {
				var $this = $( this ),
					value = $this.find( "span.al-value" ).html();
				if ( value.length === 0 ) {
					value = $this.find( "span.al-label" ).html();
				}
				return ( comparator.length === 0 || value.toLowerCase().indexOf( comparator ) !== -1 );
			});
		}

		// Add the visible options to the autolist
		$autolist.empty().append( $options );

		if ( $options.length !== 0 ) {
			correctWidth( _input );
			$autolist.removeClass( "al-hide" );
			_input.setAttribute( "aria-expanded", "true" );
		} else {
			$autolist.addClass( "al-hide" );
			_input.setAttribute( "aria-expanded", "false" );
		}
	},

	/*
	 * Hides all the options
	 * @method closeOptions
	 * @param {DOM element} _input The polyfilled input field
	 */
	closeOptions = function( _input ) {
		var _autolist = _input.nextSibling;

		_autolist.className += " al-hide";
		_autolist.innerHTML = "";			
		_input.setAttribute( "aria-expanded", "false" );
		_input.setAttribute( "aria-activedescendent", "" );
	},

	/*
	 * Corrects the width of the autolist for the polyfilled input field
	 * @method correctWidth
	 * @param {DOM element} _input The polyfilled input field
	 */
	correctWidth = function( _elm ) {
		var $elm = $( _elm ),
			$autolist = $elm.next();

		$autolist.css( "width", $elm.innerWidth() );
	},

	/*
	 * Keyboard event handler for the polyfilled input field
	 * @method correctWidth
	 * @param {integer} eventWhich Value for event.which
	 * @param {jQuery Event} event The event that triggered this method call
	 */
	keyboardHandlerInput = function( eventWhich, event ) {
		var _input = event.target,
			_autolist = _input.nextSibling,
			_alHide = ( _autolist.className.indexOf( "al-hide" ) !== -1 ),
			options, dest, value, len;

		// Spacebar, a - z keys, 0 - 9 keys punctuation, and symbols
		if ( eventWhich === 32 || ( eventWhich > 47 && eventWhich < 91 ) || 
			( eventWhich > 95 && eventWhich < 112 ) || ( eventWhich > 159 && eventWhich < 177 ) || 
			( eventWhich > 187 && eventWhich < 223 ) ) {
			if ( !event.altKey ) {
				showOptions( _input, _input.value + String.fromCharCode( eventWhich ) );
			}
		}

		// Backspace
		else if ( eventWhich === 8 && !event.altKey ) {
			value = _input.value;
			len = value.length;

			if ( len !== 0 ) {
				showOptions( _input, value.substring( 0, len - 1 ) );
			}
		}
		
		// Up / down arrow
		else if ( ( eventWhich === 38 || eventWhich === 40) && _input.getAttribute( "aria-activedescendent" ) === "" ) {
			if ( _alHide ) {
				showOptions( _input );
			}

			options = _autolist.getElementsByTagName( "a" );
			dest = options[ ( eventWhich === 38 ? options.length - 1 : 0 ) ];

			_input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );
				
			// Assign focus to dest
			$( dest ).trigger( "focus.wb" );

			return false;
		}
		
		else if ( _alHide ) {

			// Escape key
			if ( eventWhich === 27 && !event.altKey ) {
				
				closeOptions( _input );
			}
		}
	},

	/*
	 * Keyboard event handler for the autolist of the polyfilled input field
	 * @method correctWidth
	 * @param {integer} eventWhich Value for event.which
	 * @param {DOM element} link Link element that is the target of the event
	 */
	keyboardHandlerAutolist = function( eventWhich, link ) {
		var	_autolist = link.parentNode.parentNode,
			_input = _autolist.previousSibling,
			$input = $( _input ),
			_span, dest, value, len, children;

		// Spacebar, a - z keys, 0 - 9 keys punctuation, and symbols
		if ( eventWhich === 32 || ( eventWhich > 47 && eventWhich < 91 ) || 
			( eventWhich > 95 && eventWhich < 112 ) || ( eventWhich > 159 && eventWhich < 177 ) || 
			( eventWhich > 187 && eventWhich < 223 ) ) {

			_input.value += String.fromCharCode( eventWhich );
			$input.trigger( "focus.wb" );
			showOptions( _input, _input.value );

			return false;
		}

		// Backspace
		else if ( eventWhich === 8 ) {
			value = _input.value;
			len = value.length;

			if ( len !== 0 ) {
				_input.value = value.substring( 0, len - 1 );
				showOptions( _input, _input.value );
			}

			$input.trigger( "focus.wb" );

			return false;
		}

		// Enter key
		else if ( eventWhich === 13) {
			_span = link.getElementsByTagName( "span" );

			// .al-value
			value = _span[ 0 ].innerHTML;

			if ( value.length === 0 ) {

				// .al-label
				value = _span[ 1 ].innerHTML;
			}

			_input.value = value;
			$input.trigger( "focus.wb" );
			closeOptions( _input );

			return false;
		}

		// Tab or Escape key
		else if ( eventWhich === 9 || eventWhich === 27 ) {
			$input.trigger( "focus.wb" );
			closeOptions( _input );

			return false;
		}
		
		// Up or down arrow
		else if ( eventWhich === 38 || eventWhich === 40 ) { 

			// Up arrow
			if ( eventWhich === 38 ) {
				dest = link.parentNode.previousSibling;
				if ( dest === null ) {
					dest = _autolist.getElementsByTagName( "li" )[ 0 ];
				}
			}

			// Down arrow
			else {
				dest = link.parentNode.nextSibling;
				if ( dest === null ) {
					children = _autolist.getElementsByTagName( "li" );
					dest = children[ children.length - 1 ];
				}
			}
			dest = dest.getElementsByTagName( "a" )[ 0 ];

			_input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );
			$( dest ).trigger( "focus.wb" );

			return false;
		}
	},

	/*
	 * Click / Touch event handler for the autolist of the polyfilled input field
	 * @method correctWidth
	 * @param {integer} eventTarget Value for event.target
	 * @param {jQuery Event} event The event that triggered this method call
	 */
	clickHandlerAutolist = function( eventTarget ) {
		var	nodeName = eventTarget.nodeName.toLowerCase(),
			link = ( nodeName === "a" ? eventTarget : eventTarget.parentNode ),
			_autolist = link.parentNode.parentNode,
			_input = _autolist.previousSibling,
			$input = $( _input ),
			_span, value;

		_span = link.getElementsByTagName( "span" );

		// .al-value
		value = _span[ 0 ].innerHTML;

		if ( value.length === 0 ) {

			// .al-label
			value = _span[ 1 ].innerHTML;
		}

		_input.value = value;
		$input.trigger( "focus.wb" );
		closeOptions( _input );

		return false;
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb keydown click vclick touchstart", selector, function( event ) {
	var eventType = event.type,
		eventWhich = event.which,
		_input = event.target;

	switch ( eventType ) {
	case "timerpoke":
		init( _input, $( _input ) );
		break;
	case "keydown":
		if ( !(event.ctrlKey || event.metaKey ) ) {
			return keyboardHandlerInput( eventWhich, event );
		}
		break;
	case "click":
	case "vclick":
	case "touchstart":

		// Ignore middle/right mouse buttons
		if ( !eventWhich || eventWhich === 1 ) {
			if ( _input.nextSibling.className.indexOf( "al-hide" ) === -1 ) { 
				closeOptions( _input );
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

$document.on( "keydown click vclick touchstart", ".wb-autolist a, .wb-autolist span", function( event ) {
	var eventType = event.type,
		eventWhich = event.which,
		link = event.target;

	switch ( eventType ) {
	case "keydown":
		if ( !(event.ctrlKey || event.metaKey ) ) {
			return keyboardHandlerAutolist( eventWhich, link );
		}
		break;
	case "click":
	case "vclick":
	case "touchstart":

		// Ignore middle/right mouse buttons
		if ( !eventWhich || eventWhich === 1 ) {
			return clickHandlerAutolist( link );
		}
		break;		
	}
});

// Handle focus and resize events
$document.on( "focus text-resize.wb window-resize-width.wb window-resize-height.wb", function() {
	var focusEvent = ( event.type === "focus" ),
		eventTarget = event.target,
		eventTargetId = eventTarget.id,
		_inputs, _input, _autolist, i, len;

	// Only correct width if the polyfill has been initialized
	if ( initialized ) {
		_inputs = $document.find( selector ).get();
		len = _inputs.length;
		for ( i = 0; i !== len; i += 1 ) {
			_input = _inputs[ i ];
			if ( focusEvent ) {
				_autolist = _input.nextSibling;
				if ( _autolist.className.indexOf( "al-hide" ) === -1 && eventTargetId !== _input.id && eventTargetId !== _autolist.id && !$.contains( _autolist, eventTarget ) ) {
					closeOptions( _input );
				}
			} else {
				correctWidth( _input );
			}
		}
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );
