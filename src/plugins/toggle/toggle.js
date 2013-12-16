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
var pluginName = "wb-toggle",
	selector = "." + pluginName,
	selectorPanel = ".tgl-panel",
	selectorTab = ".tgl-tab",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	toggleEvent = "toggle" + selector,
	toggledEvent = "toggled" + selector,
	states = {},
	$document = wb.doc,
	$window = wb.win,

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
		// and only initialize the element once
		if ( event.currentTarget === link &&
			link.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			link.className += " " + initedClass;

			// Merge the elements settings with the defaults
			$link = $( link );
			data = $.extend( {}, defaults, $link.data( "toggle" ) );
			$link.data( "toggle", data );

			// Initialize the aria attributes of the toggle element
			initAria( link, data );
		}
	},

	/**
	 * Initialize the aria attributes for a given toggle element
	 * @param {DOM element} link The toggle element to initialize
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	initAria = function( link, data ) {
		var i, len, elm, elms, parent, tabs, tab, panel, isOpen,
			ariaControls = "",
			hasOpen = false,
			prefix = "wb-" + new Date().getTime();

		// Group toggle elements with a parent are assumed to be a tablist
		if ( data.group != null && data.parent != null ) {
			parent = document.querySelector( data.parent );

			// Check that the tablist widget hasn't already been initialized
			if ( parent.getAttribute( "role" ) !== "tablist" ) {
				parent.setAttribute( "role", "tablist" );
				elms = parent.querySelectorAll( data.group );
				tabs = parent.querySelectorAll( data.group + " " + selectorTab );
				
				// Initialize the detail/summaries
				$( tabs ).trigger( "wb-init.wb-details" );

				// Set the tab and panel aria attributes
				for ( i = 0, len = elms.length; i !== len; i += 1 ) {
					elm = elms[ i ];
					tab = tabs[ i ];
					panel = elm.querySelector( selectorPanel );
					
					// Check if the element is toggled on based on the 
					// open attribute or "on" CSS class
					isOpen = elm.nodeName.toLowerCase() === "details" ?
						!!elm.getAttribute( "open" ) :
						( " " + tab.className + " " ).indexOf( " " + data.stateOn + " " );
					if ( isOpen ) {
						hasOpen = true;
					}
					
					if ( !tab.getAttribute( "id" ) ) {
						tab.setAttribute( "id", prefix + i );
					}
					tab.setAttribute( "role", "tab" );
					tab.setAttribute( "aria-selected", isOpen );
					tab.setAttribute( "tabindex", isOpen ? "0" : "-1" );
					
					panel.setAttribute( "role", "tabpanel" );
					panel.setAttribute( "aria-labelledby", tab.getAttribute( "id" ) );
					panel.setAttribute( "aria-expanded", isOpen );
					panel.setAttribute( "aria-hidden", !isOpen );
				}
				
				// No open panels so put the first summary in the tab order
				if ( !hasOpen ) {
					tabs[ 0 ].setAttribute( "tabindex", "0" );
				}
			}

		// Set the elements this link controls
		} else {
			elms = getElements( link, data );
			for ( i = 0, len = elms.length; i !== len; i += 1 ) {
				elm = elms[ i ];
				if ( !elm.id ) {
					elm.id = prefix + i;
				}
				ariaControls += elm.id + " ";
			}
			link.setAttribute( "aria-controls", ariaControls.slice( 0, -1 ) );
		}
	},

	/**
	 * Click handler for the toggle links
	 * @param {jQuery Event} event The event that triggered this invocation
	 */
	click = function( event ) {
		var $link = $( event.target );

		$link.trigger( toggleEvent, $link.data( "toggle" ) );
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
			isGroup = !!data.group,
			isTablist = isGroup && !!data.parent,
			link = event.currentTarget,
			$link = $( link ),
			stateFrom = getState( $link, data ),
			isToggleOn = stateFrom === data.stateOff,
			stateTo = isToggleOn ? data.stateOn : data.stateOff,
			$elms = isTablist ?	$link.parent( data.group ) : getElements( link, data );

		// Group toggle behaviour: only one element in the group open at a time.
		if ( isGroup ) {

			// Get the grouped elements using data.group as the CSS selector
			// and filter to only retrieve currently open grouped elements
			dataGroup = $.extend( {}, data, { selector: data.group } );
			$elmsGroup = getElements( link, dataGroup ).filter( "." + data.stateOn + ", [open]" );

			// Set the toggle state to "off".  For tab lists, this is stored on the tab element
			setState( isTablist ? $( data.parent ).find( selectorTab ) : $elmsGroup,
				dataGroup, data.stateOff );

			// Toggle all grouped elements to "off"
			$elmsGroup.wb( "toggle", data.stateOff, data.stateOn );
			$elmsGroup.trigger( toggledEvent, {
				isOn: false,
				isTablist: isTablist,
				elms: $elmsGroup
			});
		}

		// Set the toggle state. For tab lists, this is set on the tab element
		setState( isTablist ? $link : $elms, data, stateTo );

		// Toggle all elements to the requested state
		$elms.wb( "toggle", stateTo, stateFrom );
		$elms.trigger( toggledEvent, {
			isOn: isToggleOn,
			isTablist: isTablist,
			elms: $elms
		});
	},

	/**
	 * Sets the required property and attribute for toggling open/closed a details element
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	toggleDetails = function( event, data ) {
		var top,
			isOn = data.isOn,
			$elms = data.elms,
			$detail = $( this );

		// Native details support
		$detail.prop( "open", isOn );

		// Polyfill details support
		if ( !Modernizr.details ) {
			$detail
				.attr( "open", isOn ? null : "open" )
				.find( "summary" ).trigger( "toggle.wb-details" );
		}

		if ( data.isTablist ) {

			// Set the required aria attributes
			$elms.find( selectorTab ).attr({
				"aria-selected": isOn,
				tabindex: isOn ? "0" : "-1"
			});
			$elms.find( selectorPanel ).attr({
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
	 * Returns the elements a given toggle element controls.
	 * @param {DOM element} link Toggle element that was clicked
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 * @returns {jQuery Object} DOM elements the toggle link controls
	 */
	getElements = function( link, data ) {
		var selector = data.selector || link,
			parent = data.parent || null;

		return parent !== null ? $( parent ).find( selector ) : $( selector );
	},

	/**
	 * Gets the current toggle state of elements controlled by the given link.
	 * @param {jQuery Object} $link Toggle link that was clicked
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	getState = function( $link, data ) {
		var parent = data.parent,
			selector = data.selector,
			type = data.type;

		if ( $link[ 0 ].nodeName.toLowerCase() === "summary" ) {

			// Use the open attribute to determine state
			return $link.parent().attr( "open" ) ? data.stateOn : data.stateOff;
		} else {

			// No toggle type: get the current on/off state of the elements
			// specified by the selector and parent
			if ( !type ) {
				if ( !selector ) {
					return $link.data( "state" ) || data.stateOff;

				} else if ( states.hasOwnProperty( selector ) ) {
					return states[ selector ].hasOwnProperty( parent ) ?
						states[ selector ][ parent ] :
						states[ selector ].all;
				}

				return data.stateOff;
			}

			// Type: get opposite state of the type. Toggle reverses this
			// to the requested state.
			return type === data.stateOn ? data.stateOff : data.stateOn;
		}
	},

	/*
	 * Sets the current toggle state of elements controlled by the given link.
	 * @param {DOM element} link Toggle link that was clicked
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 * @param {String} state The current state of the elements: "on" or "off"
	 */
	setState = function( $elms, data, state ) {
		var prop,
			parent = data.parent,
			selector = data.selector,
			elmsState = states[ selector ];

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
$document.on( "timerpoke.wb " + initEvent + " " + toggleEvent +
	" click", selector, function( event, data ) {

	var eventType = event.type;

	switch ( eventType ) {
	case "click":
		click( event );
		break;
	case "toggle":
		toggle( event, data );
		break;
	case "timerpoke":
	case "wb-init":
		init( event );
		break;
	}
});

$document.on( toggledEvent, "details", toggleDetails );

// Keyboard handling for the accordion
$document.on( "keydown", selectorTab, function( event ) {
	var which = event.which,
		data, $elm, $parent, $group, $newPanel, index;
	
	if ( !event.ctrlKey && which > 34 && which < 41 ) {
		event.preventDefault();
		$elm = $( event.currentTarget ),
		data = $elm.data( "toggle" ),
		$parent = $document.find( data.parent );
		$group = $parent.find( data.group );
		index = $group.index( $elm.parent() );

		switch ( which ) {

		// End
		case 35:
			$newPanel = $group.last();
			break;

		// Home
		case 36:
			$newPanel = $group.first();
			break;

		// Left / up arrow
		case 37:
		case 38:
			if ( index === 0 ) {
				$newPanel = $group.last();
			} else {
				$newPanel = $group.eq( index - 1 );
			}
			break;

		// Right / down arrow
		case 39:
		case 40:
			if ( index === $group.length - 1 ) {
				$newPanel = $group.first();
			} else {
				$newPanel = $group.eq( index + 1 );
			}
			break;
		}

		$newPanel
			.children( "summary" )
				.trigger( "click" );
	}
});

$document.on( "keydown", selectorPanel, function( event ) {

	// Ctrl + Up arrow
	if ( event.ctrlKey && event.which === 38 ) {

		// Move focus to the summary element
		$( event.currentTarget )
			.prev()
				.trigger( "setfocus.wb" );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
