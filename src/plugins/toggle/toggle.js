/*
Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
plugin	:	Toggle
author	:	@patheard
notes	:	Plugin that allows a link to toggle elements between on and off states.
licence	:	wet-boew.github.io/wet-boew/License-en.html /
			wet-boew.github.io/wet-boew/Licence-fr.html
*/
( function ( $, window, vapour ) {

"use strict";

var $document = vapour.doc,
	plugin = {
		selector: ".wb-toggle",
		state: {},
		stateOn: "on",
		stateOff: "off",


		//Initialize the plugin
		init: function ( ) {
			var link = $( this );
			window._timer.remove( plugin.selector );

			// Initialize the aria-controls attribute of the link
			if ( link.data( "selector" ) !== undefined ) {
				link.trigger( "ariaControls.wb-toggle", {
					selector: link.data( "selector" ),
					parent: link.data( "parent" )
				} );
			}
			else {
				$.error(
					".wb-toggle: you must specify a [data-selector] attribute with the CSS selector of the element(s) the toggle link controls."
				);
			}
		},

		/**
		 * Sets the aria-controls attribute for a given link element
		 * @param {jQuery Event} event The event that triggered this invocation
		 * @param {Object} data Simple key/value data object passed when the event was triggered
		 */
		setAriaControls: function ( event, data ) {
			var elm, i, len,
				elms = data.parent !== undefined ? $( data.parent ).find( data.selector ) : $( data.selector ),
				ariaControls = "",
				link = $( this );

			// Find the elements this link controls
			for ( i = 0, len = elms.length; i < len; i++ ) {
				elm = elms.eq( i );

				if ( elm.attr( "id" ) === undefined ) {
					elm.attr( "id", "wb-toggle_" + i );
				}

				ariaControls += elm.attr( "id" ) + " ";
			}

			link.attr( "aria-controls", ariaControls.slice( 0, -1 ) );
		},

		/**
		 * Click handler for the toggle links
		 * @param {jQuery Event} event The event that triggered this invocation
		 */
		click: function ( event ) {
			var link = $( this );

			link.trigger( "toggle.wb-toggle", {
				selector: link.data( "selector" ),
				parent: link.data( "parent" ),
				type: link.data( "type" )
			} );

			event.preventDefault( );
			event.target.focus( );
		},

		/**
		 * Toggles the elements a link controls between the on and off states.
		 * @param {jQuery Event} event The event that triggered this invocation
		 * @param {Object} data Simple key/value data object passed when the event was triggered
		 */
		toggle: function ( event, data ) {
			var elms = data.parent !== undefined ? $( data.parent ).find( data.selector ) : $( data.selector ),

				stateFrom = plugin.getState( data.selector, data.parent, data.type ), // Current state of elements
				stateTo = stateFrom === plugin.stateOn ? plugin.stateOff : plugin.stateOn; // State to set the elements

			// Update the element state and store the new state
			elms.wb( "toggle", stateTo, stateFrom );
			plugin.setState( data.selector, data.parent, stateTo );
		},

		/**
		 * Gets the current toggle state of a link given set of elements (based on selector and parent).
		 * @param {String} selector CSS selector of the elements the link controls
		 * @param {String} parent CSS selector of the parent DOM element the link is restricted to.
		 * @param {String} type The type of link: undefined (toggle), "on" or "off"
		 */
		getState: function ( selector, parent, type ) {

			// No toggle type: get the current on/off state of the elements specified by the selector and parent
			if ( type === undefined ) {
				if ( plugin.state.hasOwnProperty( selector ) ) {
					return plugin.state[ selector ].hasOwnProperty( parent ) ?
						plugin.state[ selector ][ parent ] :
						plugin.state[ selector ].all;
				}
				return plugin.stateOff;
			}

			// Toggle type: get opposite state of the requested type.  plugin.toggle will then reverse this to the requested state
			return type === plugin.stateOn ? plugin.stateOff : plugin.stateOn;
		},

		/**
		 * Sets the current toggle state of a links given set of elements (based on selector and parent)
		 * @param {String} selector CSS selector of the elements the link controls
		 * @param {String} parent CSS selector of the parent DOM element the link is restricted to.
		 * @param {String} state Current state of the elements: "on" or "off"
		 */
		setState: function ( selector, parent, state ) {
			var prop;

			// Check the selector object has been created
			if ( plugin.state[ selector ] === undefined ) {
				plugin.state[ selector ] = {
					all: plugin.stateOff
				};
			}

			// If there's a parent, set its state
			if ( parent !== undefined ) {
				plugin.state[ selector ][ parent ] = state;

				// No parent means set all states for the given selector.  This is
				// because toggle links that apply to the entire DOM also affect
				// links that are restricted by parent.
			}
			else {
				for ( prop in plugin.state[ selector ] ) {
					if ( plugin.state[ selector ].hasOwnProperty( prop ) ) {
						plugin.state[ selector ][ prop ] = state;
					}
				}
			}
		}
	};

// Bind the plugin's events
$document.on( "timerpoke.wb ariaControls.wb-toggle toggle.wb-toggle click",
	plugin.selector, function ( event ) {
		switch ( event.type ) {
		case "click":
			plugin.click.apply( this, arguments );
			break;
		case "toggle":
			plugin.toggle.apply( this, arguments );
			break;
		case "ariaControls":
			plugin.setAriaControls.apply( this, arguments );
			break;
		case "timerpoke":
			plugin.init.apply( this, arguments );
			break;
		}
	} );


// Add the timer poke to initialize the plugin
window._timer.add( plugin.selector );

}( jQuery, window, vapour ) );
