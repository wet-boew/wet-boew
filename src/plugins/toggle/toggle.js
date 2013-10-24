/*
 * @title WET-BOEW Toggle
 * @overview Plugin that allows a link to toggle elements between on and off states.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-toggle",
	$document = vapour.doc,
	state = {},
	stateOn = "on",
	stateOff = "off",


	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 */
	init = function( event ) {
		var $link = $( event.target ),
			selector = $link.data( "selector" );

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		// Initialize the aria-controls attribute of the link
		if ( selector ) {
			$link.trigger( "ariaControls.wb-toggle", {
				selector: selector,
				parent: $link.data( "parent" )
			});
		} else {
			$.error(
				".wb-toggle: you must specify a [data-selector] attribute with the CSS selector of the element(s) the toggle link controls."
			);
		}
	},

	/*
	* Sets the aria-controls attribute for a given link element
	* @param {jQuery Event} event The event that triggered this invocation
	* @param {Object} data Simple key/value data object passed when the event was triggered
	*/
	setAriaControls = function( event, data ) {
		var elm, i, len,
			elms = data.parent !== undefined ? $( data.parent ).find( data.selector ) : $( data.selector ),
			ariaControls = "",
			link = event.target;

		// Find the elements this link controls
		for ( i = 0, len = elms.length; i < len; i++ ) {
			elm = elms.eq( i );
			if ( elm.attr( "id" ) === undefined ) {
				elm.attr( "id", "wb-toggle_" + i );
			}
			ariaControls += elm.attr( "id" ) + " ";
		}
		link.setAttribute( "aria-controls", ariaControls.slice( 0, -1 ) );
	},

	/*
	 * Click handler for the toggle links
	 * @param {jQuery Event} event The event that triggered this invocation
	 */
	click = function( event ) {
		var eventTarget = event.target,
			$link = $( eventTarget );

		$link.trigger( "toggle.wb-toggle", {
			selector: $link.data( "selector" ),
			parent: $link.data( "parent" ),
			type: $link.data( "type" )
		});

		event.preventDefault();
		
		// Assign focus to eventTarget
		$( eventTarget ).trigger( "focus.wb" );
	},

	/*
	 * Toggles the elements a link controls between the on and off states.
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	toggle = function( event, data ) {
		var $elms = data.parent !== undefined ? $( data.parent ).find( data.selector ) : $( data.selector ),

			// Current state of elements
			stateFrom = getState( data.selector, data.parent, data.type ),

			// State to set the elements
			stateTo = stateFrom === stateOn ? stateOff : stateOn;

		// Update the element state and store the new state
		$elms.wb( "toggle", stateTo, stateFrom );
		setState( data.selector, data.parent, stateTo );
	},

	/*
	 * Gets the current toggle state of a link given set of elements (based on selector and parent).
	 * @param {String} selector CSS selector of the elements the link controls
	 * @param {String} parent CSS selector of the parent DOM element the link is restricted to.
	 * @param {String} type The type of link: undefined (toggle), "on" or "off"
	 */
	getState = function( selector, parent, type ) {

		// No toggle type: get the current on/off state of the elements specified by the selector and parent
		if ( !type ) {
			if ( state.hasOwnProperty( selector ) ) {
				return state[ selector ].hasOwnProperty( parent ) ?
					state[ selector ][ parent ] :
					state[ selector ].all;
			}
			return stateOff;
		}

		// Toggle type: get opposite state of the requested type. toggle will then reverse this to the requested state
		return type === stateOn ? stateOff : stateOn;
	},

	/*
	 * Sets the current toggle state of a links given set of elements (based on selector and parent)
	 * @param {String} selector CSS selector of the elements the link controls
	 * @param {String} parent CSS selector of the parent DOM element the link is restricted to.
	 * @param {String} state Current state of the elements: "on" or "off"
	 */
	setState = function( selector, parent, state ) {
		var prop;

		// Check the selector object has been created
		if ( !state[ selector ] ) {
			state[ selector ] = {
				all: stateOff
			};
		}

		// If there's a parent, set its state
		if ( parent ) {
			state[ selector ][ parent ] = state;

			// No parent means set all states for the given selector. This is
			// because toggle links that apply to the entire DOM also affect
			// links that are restricted by parent.
		} else {
			for ( prop in state[ selector ] ) {
				if ( state[ selector ].hasOwnProperty( prop ) ) {
					state[ selector ][ prop ] = state;
				}
			}
		}
	};

// Bind the plugin's events
$document.on( "timerpoke.wb ariaControls.wb-toggle toggle.wb-toggle click",	selector, function( event, data ) {
	var eventType = event.type;

	switch ( eventType ) {
	case "click":
		click( event );
		break;
	case "toggle":
		toggle( event, data );
		break;
	case "ariaControls":
		setAriaControls( event, data );
		break;
	case "timerpoke":
		init( event );
		break;
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
