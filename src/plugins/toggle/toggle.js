/**
 * @title WET-BOEW Toggle
 * @overview Plugin that allows a link to toggle elements between on and off states.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-toggle",
	$document = wb.doc,
	$window = wb.win,
	states = {},
	defaults = {
		stateOn: "on",
		stateOff: "off"
	},

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var $link, data,
			link = event.target;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === link ) {

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			wb.remove( selector );

			// Merge the elements settings with the defaults
			$link = $( link );
			data = $.extend( {}, defaults, $link.data( "toggle" ) );
			$link.data( "toggle", data );

			// Initialize the aria-controls attribute of the link
			$link.trigger( "aria.wb-toggle", data );
		}
	},

	/**
	 * Sets the aria attribute for a given toggle element
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	setAria = function( event, data ) {
		var i, len, $elm, $parent, $tab,
			ariaControls = "",
			link = event.target,
			prefix = "wb-" + new Date().getTime(),
			$elms = getElements( link, data );

		// Group toggle elements with a parent are assumed to be a tablist
		if ( data.group != null && data.parent != null ) {
			$parent = $( data.parent );

			// Check that the group toggle widget hasn't already been initialized
			if ( !$parent.data( "init" ) ) {
				$parent.attr( "role", "tablist" );
				$parent.find( ".tab" ).attr( "role", "tab" );
				$parent.find( ".panel" ).attr( "role", "panel" );

				// Create the tab/panel relationships
				$elms = $parent.find( data.group );
				for ( i = 0, len = $elms.length; i !== len; i += 1 ) {
					$elm = $elms.eq( i );
					$tab = $elm.find( ".tab" );
					if ( !$tab.attr( "id" ) ) {
						$tab.attr( "id", prefix + i );
					}
					$elm.find( ".panel" ).attr( "aria-labelledby", $tab.attr( "id" ) );
				}

				// Mark this group toggle widget as initialized
				$parent.data( "init", true );
			}

		// Set the elements this link controls
		} else {
			for ( i = 0, len = $elms.length; i !== len; i += 1 ) {
				$elm = $elms.eq( i );
				if ( !$elm.attr( "id" ) ) {
					$elm.attr( "id", prefix + i );
				}
				ariaControls += $elm.attr( "id" ) + " ";
			}
			link.setAttribute( "aria-controls", ariaControls.slice( 0, -1 ) );
		}
	},

	/**
	 * Click handler for the toggle links
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {DOM element} link The toggle link that was clicked
	 */
	click = function( event, link ) {
		var $link = $( link );

		$link.trigger( "toggle.wb-toggle", $link.data( "toggle" ) );
		event.preventDefault();

		// Assign focus to eventTarget
		$link.trigger( "setfocus.wb" );
	},

	/**
	 * Toggles the elements a link controls between the on and off states.
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	toggle = function( event, data ) {
		var dataGroup, $elmsGroup,
			link = event.target,
			$elms = getElements( link, data ),
			stateFrom = getState( link, data ),
			isGroup = !!data.group,
			isTablist = isGroup && !!data.parent,
			isToggleOn = stateFrom === data.stateOff,
			stateTo = isToggleOn ? data.stateOn : data.stateOff;

		// Group toggle behaviour: only one element in the group open at a time.
		if ( isGroup ) {

			// Get the grouped elements using data.group as the CSS selector
			dataGroup = $.extend( {}, data, { selector: data.group } );
			$elmsGroup = getElements( link, dataGroup );

			// Toggle all grouped elements to "off"
			setState( link, dataGroup, data.stateOff );
			$elmsGroup.wb( "toggle", data.stateOff, data.stateOn );
			$elmsGroup.trigger( "toggled.wb-toggle", {
				isOn: false,
				isTablist: isTablist,
				elms: $elmsGroup
			});
		}

		// Toggle all elements identified by data.selector to the requested state
		setState( link, data, stateTo );
		$elms.wb( "toggle", stateTo, stateFrom );
		$elms.trigger( "toggled.wb-toggle", {
			isOn: isToggleOn,
			isTablist: isTablist,
			elms: $elms
		});
	},

	/**
	 * Executed once the toggle has been completed. Used to set the aria
	 * attributes and ensure opened group toggle element is visisble.
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	toggled = function( event, data ) {
		var top,
			isOn = data.isOn,
			$elms = data.elms;

		if ( data.isTablist ) {

			// Set the required aria attributes
			$elms.find( ".tab" ).attr( "aria-selected", isOn );
			$elms.find( ".panel" ).attr({
				"aria-hidden": !isOn,
				"aria-expanded": isOn
			});

			// Check that the top of the open element is in view.
			if ( isOn && $elms.length === 1 ) {
				top = $elms.offset().top;
				if ( top < $window.scrollTop() ) {
					$window.scrollTop( top );
				}
			}
		}
	},

	/**
	 * Sets the required property and attribute for toggling open/closed a details element
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	toggleDetails = function( event, data ) {
		var isOn = data.isOn,
			$detail = $( this );

		// Native details support
		$detail.prop( "open", isOn );

		// Polyfill details support
		if ( !Modernizr.details ) {
			$detail.attr( "open", isOn ? null : "open" );
			$detail.find( "summary" ).trigger( "toggle.wb-details" );
		}
	},

	/**
	 * Returns the elements a given toggle element controls.
	 * @param {DOM element} link Toggle element that was clicked
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 * @returns {jQuery Object} DOM elements the toggle link controls
	 */
	getElements = function( link, data ) {
		var selector = data.selector !== undefined ? data.selector : link,
			parent = data.parent !== undefined ? data.parent : null;

		return parent !== null ? $( parent ).find( selector ) : $( selector );
	},

	/**
	 * Gets the current toggle state of elements controlled by the given link.
	 * @param {DOM element} link Toggle link that was clicked
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	getState = function( link, data ) {
		var parent = data.parent,
			selector = data.selector,
			type = data.type;

		// No toggle type: get the current on/off state of the elements specified by the selector and parent
		if ( !type ) {
			if ( !selector ) {
				return $( link ).data( "state" ) || data.stateOff;

			} else if ( states.hasOwnProperty( selector ) ) {
				return states[ selector ].hasOwnProperty( parent ) ?
					states[ selector ][ parent ] :
					states[ selector ].all;
			}
			return data.stateOff;
		}

		// Type: get opposite state of the type. Toggle reverses this to the requested state.
		return type === data.stateOn ? data.stateOff : data.stateOn;
	},

	/**
	 * Sets the current toggle state of elements controlled by the given link.
	 * @param {DOM element} link Toggle link that was clicked
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 * @param {String} state The current state of the elements: "on" or "off"
	 */
	setState = function( link, data, state ) {
		var prop,
			parent = data.parent,
			selector = data.selector,
			elmsState = states[ selector ],
			$elms = getElements( link, data );

		if ( selector ) {

			// Check the selector object has been created
			if ( !elmsState ) {
				elmsState = { all: data.stateOff };
				states[ selector ] = elmsState;
			}

			// If there's a parent, set its state
			if ( parent ) {
				elmsState[ parent ] = state;

			// No parent means set all states for the given selector. This is
			// because toggle links that apply to the entire DOM also affect
			// links that are restricted by parent.
			} else {
				for ( prop in elmsState ) {
					if ( elmsState.hasOwnProperty( prop ) ) {
						elmsState[ prop ] = state;
					}
				}
			}
		}

		// Store the state on the elements as well. This allows a link to toggle itself.
		$elms.data( "state", state );
	};

// Bind the plugin's events
$document.on( "timerpoke.wb aria.wb-toggle toggle.wb-toggle toggled.wb-toggle click", selector, function( event, data ) {
	var eventType = event.type;

	switch ( eventType ) {
	case "click":
		click( event, this );
		break;
	case "toggle":
		toggle( event, data );
		break;
	case "toggled":
		toggled( event, data );
		break;
	case "aria":
		setAria( event, data );
		break;
	case "timerpoke":
		init( event );
		break;
	}
});
$document.on( "toggled.wb-toggle", "details", toggleDetails );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
