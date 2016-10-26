/**
 * @title WET-BOEW Toggle
 * @overview Plugin that allows a link to toggle elements between on and off states.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-toggle",
	selector = "." + componentName,
	selectorPanel = ".tgl-panel",
	selectorTab = ".tgl-tab",
	initEvent = "wb-init" + selector,
	toggleEvent = "toggle" + selector,
	toggledEvent = "toggled" + selector,
	setFocusEvent = "setfocus.wb",
	states = {},
	$document = wb.doc,
	$window = wb.win,

	defaults = {
		stateOn: "on",
		stateOff: "off"
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var link = wb.init( event, componentName, selector, true ),
			$link, data, persistState;

		if ( link ) {

			// Merge the elements settings with the defaults
			$link = $( link );
			data = $.extend( {}, defaults, $link.data( "toggle" ) );
			$link.data( "toggle", data );

			// Add aria attributes of the toggle element
			initAria( link, data );

			// Persist toggle state across page loads
			if ( data.persist ) {
				persistState = initPersist( $link, data );
			}

			// Toggle behaviour when the page is printed
			if ( data.print ) {
				initPrint( $link, data );
			}

			// Set the initial state if the state has been specified and
			// the persistent state has not been set
			if ( !persistState && data.state ) {
				setState( $link, data, data.state );
			}

			// Identify that initialization has completed
			wb.ready( $link, componentName );
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
			hasOpen = false;

		// Group toggle elements with a parent are assumed to be a tablist
		if ( data.group != null && data.parent != null ) { //eslint-disable-line no-eq-null
			parent = document.querySelector( data.parent );

			// Check that the tablist widget hasn't already been initialized
			if ( parent.getAttribute( "role" ) !== "tablist" ) {

				// Only apply the tablist role if the parent is not the tabbed interface container
				// or the page is currently in "smallview", "xsmallview" or "xxsmallview"
				if ( parent.className.indexOf( "wb-tabs" ) === -1 ||
					document.documentElement.className.indexOf( "smallview" ) !== -1 ) {
					parent.setAttribute( "role", "tablist" );
				}

				elms = parent.querySelectorAll( data.group );
				tabs = parent.querySelectorAll( data.group + " " + selectorTab );

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
						tab.setAttribute( "id", wb.getId() );
					}
					tab.setAttribute( "role", "tab" );
					tab.setAttribute( "aria-selected", isOpen );
					tab.setAttribute( "tabindex", isOpen ? "0" : "-1" );
					tab.setAttribute( "aria-posinset", i + 1 );
					tab.setAttribute( "aria-setsize", len );

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
					elm.id = wb.getId();
				}
				ariaControls += elm.id + " ";
			}
			link.setAttribute( "aria-controls", ariaControls.slice( 0, -1 ) );
		}
	},

	/**
	 * Initializes persistent behaviour of the toggle element
	 * @param {jQuery Object} $link The toggle element to initialize
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 * @returns {string} Persistent state
	 */
	initPersist = function( $link, data ) {
		var state,
			link = $link[ 0 ];

		// Store the persistence type and key for later use
		data.persist = data.persist === "session" ? sessionStorage : localStorage;
		data.persistKey = componentName + ( data.group ? data.group : "" ) + link.id;

		// If there's a saved toggle state, trigger the change to that state
		state = data.persist.getItem( data.persistKey );
		if ( state ) {
			$link.trigger( toggleEvent, $.extend( {}, data, { type: state } ) );
		}

		return state;
	},

	/**
	 * Initialize open on print behaviour of the toggle element
	 * @param {jQuery Object} $link The toggle element to initialize
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	initPrint = function( $link, data ) {
		var mediaQuery,
			printEvent = "beforeprint";

		$window.on( printEvent, function() {
			$link.trigger( toggleEvent, $.extend( {}, data, { type: data.print } ) );
		} );

		// Fallback for browsers that don't support print events
		if ( window.matchMedia ) {
			mediaQuery = window.matchMedia( "print" );
			if ( mediaQuery.addListener ) {
				mediaQuery.addListener( function( query ) {
					if ( query.matches ) {
						$window.trigger( printEvent );
					}
				} );
			}
		}
	},

	/**
	 * Click handler for the toggle links
	 * @param {jQuery Event} event The event that triggered this invocation
	 */
	click = function( event ) {
		var $link = $( event.currentTarget );

		$link.trigger( toggleEvent, $link.data( "toggle" ) );
		event.preventDefault();

		// Assign focus to eventTarget
		$link.trigger( setFocusEvent );
	},

	/**
	 * Toggles the elements a link controls between the on and off states.
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {Object} data Simple key/value data object passed when the event was triggered
	 */
	toggle = function( event, data ) {
		if ( event.namespace === componentName ) {
			var dataGroup, key, $elmsGroup,
				isGroup = !!data.group,
				isPersist = !!data.persist,
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
				} );

				// Remove all grouped persistence keys
				if ( isPersist ) {
					for ( key in data.persist ) {
						if ( key.indexOf( componentName + data.group ) === 0 ) {
							data.persist.removeItem( key );
						}
					}
				}
			}

			// Set the toggle state. For tab lists, this is set on the tab element
			setState( isTablist ? $link : $elms, data, stateTo );

			// Toggle all elements to the requested state
			$elms.wb( "toggle", stateTo, stateFrom );
			$elms.trigger( toggledEvent, {
				isOn: isToggleOn,
				isTablist: isTablist,
				elms: $elms
			} );

			// Store the toggle link's current state if persistence is turned on.
			// Try/catch is required to address exceptions thrown when using BB10 or
			// private browsing in iOS.
			if ( isPersist ) {
				try {
					data.persist.setItem( data.persistKey, stateTo );
				} catch ( error ) {
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
		if ( event.namespace === componentName && event.target === event.currentTarget ) {
			var top,
				isOn = data.isOn,
				$elms = data.elms,
				$this = $( this ),
				$detail = $this.is( "summary" ) ? $this.parent() : $this;

			// Stop propagation of the toggleDetails event
			if ( event.stopPropagation ) {
				event.stopImmediatePropagation();
			} else {
				event.cancelBubble = true;
			}

			$detail.prop( "open", isOn );

			if ( data.isTablist ) {

				// Set the required aria attributes
				$elms.find( selectorTab ).attr( {
					"aria-selected": isOn,
					tabindex: isOn ? "0" : "-1"
				} );
				$elms.find( selectorPanel ).attr( {
					"aria-hidden": !isOn,
					"aria-expanded": isOn
				} );

				// Check that the top of the open element is in view.
				if ( isOn && $elms.length === 1 ) {
					top = $elms.offset().top;
					if ( top < $window.scrollTop() ) {
						$window.scrollTop( top );
					}
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

		// Get opposite state of the type. Toggle reverses this
		// to the requested state.
		if ( type ) {
			return type === "on" ? data.stateOff : data.stateOn;

		// <details> elements use the open attribute to determine state
		} else if ( $link[ 0 ].nodeName.toLowerCase() === "summary" ) {
			return $link.parent().attr( "open" ) ? data.stateOn : data.stateOff;

		// When no selector, use the data attribute of the link
		} else if ( !selector ) {
			return $link.data( componentName + "-state" ) || data.stateOff;

		// Get the current on/off state of the elements specified by the selector and parent
		} else if ( states.hasOwnProperty( selector ) ) {
			return states[ selector ].hasOwnProperty( parent ) ?
				states[ selector ][ parent ] :
				states[ selector ].all;
		}
		return data.stateOff;
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
		$elms.data( componentName + "-state", state );
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
} );

$document.on( toggledEvent, "summary, details", toggleDetails );

// Keyboard handling for the accordion
$document.on( "keydown", selectorTab, function( event ) {
	var which = event.which,
		data, $elm, $parent, $group, $newPanel, index;

	if ( !event.ctrlKey && which > 34 && which < 41 ) {
		event.preventDefault();
		$elm = $( event.currentTarget );
		data = $elm.data( "toggle" );
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
				.trigger( setFocusEvent );
	}
} );

$document.on( "keydown", selectorPanel, function( event ) {

	// Ctrl + Up arrow
	if ( event.ctrlKey && event.which === 38 ) {

		// Move focus to the summary element
		$( event.currentTarget )
			.prev()
				.trigger( setFocusEvent );
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
