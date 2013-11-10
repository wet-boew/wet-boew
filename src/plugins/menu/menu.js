/*
 * @title WET-BOEW Menu plugin
 * @overview A Menu plugin for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */

(function( $, window, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-menu",
	$document = vapour.doc,

	// Used for half second delay on showing/hiding menus because of mouse hover
	hoverDelay = 500,
	menuCount = 0,
	globalTimeout = {},

/*
 * Lets leverage JS assigment deconstruction to reduce the code output
 * @method expand
 * @param {DOM element} element The plugin element
 * @param {boolean} scopeitems ***Description needed***
 */
expand = function( element, scopeitems ) {
	var $elm = $( element ),
		_elm = $elm.hasClass( "wb-menu" ) ? $elm.data() : $elm.parents( ".wb-menu" )
			.first()
			.data(),
		_items = scopeitems ? _elm.items.has( element ) : _elm.items;
	return [ _elm.self, _elm.menu, _items, $elm ];
},

/*
 * Lets set some aria states and attributes
 * @method onInit
 * @param {jQuery DOM element} element The plugin element
 */
onInit = function( $elm ) {

	// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
	window._timer.remove( selector );

	// Ensure the container has an id attribute
	if ( !$elm.attr( "id" ) ) {
		$elm.attr( "id", "wb-menu-" + menuCount );
	}
	menuCount += 1;

	// Lets test to see if we have any
	if ( $elm.data( "ajax-fetch" ) ) {
		$document.trigger({
			type: "ajax-fetch.wb",
			element: $elm,
			fetch: $elm.data( "ajax-fetch" )
		});
	} else {
		$elm.trigger( "loaded.wb-menu" );
	}
},

/*
 * Lets set some aria states and attributes
 * @method drizzleAria
 * @param {jQuery DOM elements} collection of elements
 */
drizzleAria = function( $elements ){
	var length = $elements.length,
		elm, subMenu, i;

	// Lets tweak for aria
	for ( i = 0; i <= length; i++ ) {
		elm = $elements.eq( i );
		subMenu = elm.siblings( ".sm" );

		elm.attr({
			"aria-posinset": ( i + 1 ),
			"aria-setsize": length,
			"role": "menuitem"
		});

		// if there is a submenu lets put in the aria for it
		if ( subMenu.length > 0 ) {

			elm.attr({
				"aria-haspopup": "true"
			});

			subMenu.attr({
				"aria-expanded": "false",
				"aria-hidden": "true"
			});

			// recurse into submenu
			drizzleAria( subMenu.find( ":discoverable" ) );
		}
	}
},

/*
 * @method onAjaxLoaded
 * @param {jQuery DOM elements} element The plugin element
 */
onAjaxLoaded = function( $elm, $ajaxed ) {

	//Some hooks for post transformation
	// - @data-post-remove : removes the space delimited class for the element. This is more a feature to fight the FOUC
	var $menu = $ajaxed.find( "[role='menubar'] .item" ),
		$panel,
		$wbsec = $( "#wb-sec" );

	// lets see if we need to add a dynamic navigation section ( secondary nav )
	if ( $wbsec.length !== 0 ) {
		$panel = $ajaxed.find( ".pnl-strt" );
		$panel.before( "<section id='dyn-nvgtn' class='" + $panel.siblings( ".wb-nav" ).eq( 0 ).attr( "class" ) + "'>" + $wbsec.html() + "</section>" );
	}

	$ajaxed.find( ":discoverable" )
		.attr( "tabindex", "-1" );

	$menu.eq( 0 ).attr( "tabindex", "0" );
	$menu.filter( "[href^=#]" )
		.append( "<span class='expicon'></span>" );

	drizzleAria( $menu );

	// Now lets replace the html since we were working off canvas for performance
	if ( $elm.has( "[data-post-remove]" ) ) {
		$elm.removeClass( $elm.data( "post-remove" ) )
			.removeAttr( "data-post-remove" );
	}

	// Replace elements
	$elm.html( $ajaxed.html() );

	// Recalibrate context
	$elm.data({
		self: $elm,
		menu: $elm.find( "[role=menubar] .item" ),
		items: $elm.find( ".sm" )
	});

},


/*
 * @method onSelect
 * @param {jQuery event} event The current event
 */
onSelect = function( event ) {

	event.goto.trigger( "focus.wb" );
	if ( event.special ) {
		onReset( event.goto.parents( selector ), true, true );
	}

},

/*
 * @method onIncrement
 * @param {jQuery DOM element} element The plugin element
 * @param {jQuery event} event The current event
 */
onIncrement = function( $elm, event ) {
	var $links = event.cnode,
		$next = event.current + event.increment,
		$index = $next;

	if ( $next >= $links.length ) {
		$index = 0;
	} else if ( $next < 0 ) {
		$index = $links.length - 1;
	}

	$elm.trigger({
		type: "select.wb-menu",
		goto: $links.eq( $index )
	});
},

/*
 * @method onReset
 * @param {jQuery DOM element} $elm The plugin element
 * @param {boolean} cancelDelay Whether or not to delay the closing of the menus (false by default)
 * @param {boolean} keeptActive Whether or not to leave the active class alone (false by default)
 */
onReset = function( $elm, cancelDelay, keepActive ) {
	var id = $elm.attr( "id" ),
		$openActive = $elm.find( ".open, .active" );

	// Clear any timeouts for open/closing menus
	clearTimeout( globalTimeout[ id ] );

	if ( cancelDelay ) {
		$openActive.removeClass( "open sm-open" );
		if ( !keepActive ) {
			$openActive.removeClass( "active" );
		}
	} else {

		// Delay the closing of the menus
		globalTimeout[ id ] = setTimeout( function() {
				$openActive.removeClass( "open sm-open active" );
		}, hoverDelay );
	}
},

/*
 * @method onDisplay
 * @param {jQuery DOM element} $elm The plugin element
 * @param {jQuery event} event The current event

 */
onDisplay = function( $elm, event ) {
	var menuItem = event.ident,
		menuLink = menuItem.children( "a" );

	// Lets reset the menus with no delay to ensure no overlap
	$elm.find( ".open, .active" ).removeClass( "open sm-open active" );

	// Ignore if doesn't have a submenu
	if ( menuLink.attr( "aria-haspopup" ) === "true" ) {

		// Add the open state classes
		menuItem
			.addClass( "active sm-open" )
			.find( ".sm" )
			.addClass( "open" );
	}
},

/*
 * @method onHoverFocus
 * @param {jQuery event} event The current event
 */
onHoverFocus = function( event ) {
	var ref = expand( event.target ),
		$container = ref[ 0 ],
		$elm = ref[ 3 ];

	if ( $container ) {

		// Clear the any timeouts for open/closing menus
		clearTimeout( globalTimeout[ $container.attr( "id" ) ] );

		$container.trigger({
			type: "display.wb-menu",
			ident: $elm.parent(),
			cancelDelay: event.type === "focusin"
		});
	}
},

/*
 * Causes clicks on panel menu items to open and close submenus (except for mouse)
 * @method onPanelClick
 * @param {jQuery event} event The current event
 */
onPanelClick = function( event ) {
	var which = event.which,
		$this;

	if ( which === 1 ) {
		event.preventDefault();
	} else if ( !which ) {
		event.preventDefault();
		$this = $( this );
		if ( $( "#wb-sm" ).find( ".nav-close" ).is( ":visible" ) ) {
			$this.trigger( "focusin" );
		} else if ( !which ) {
			event.preventDefault();
			onReset( $this, true );
		}
	}
};

// Bind the events of the plugin
$document.on( "timerpoke.wb mouseleave select.wb-menu ajax-fetched.wb increment.wb-menu display.wb-menu", selector, function( event ) {
	var elm = event.target,
		eventType = event.type,
		$elm = $( elm );

	switch ( eventType ) {
	case "ajax-fetched":

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			onAjaxLoaded( $elm, event.pointer );
		}
		return false;

	case "select":
		onSelect( event );
		break;

	case "timerpoke":

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			onInit( $elm );
		}
		break;

	case "increment":
		onIncrement( $elm, event );
		break;

	case "mouseleave":

		// Make sure we are dealing with the top level container
		if ( !$elm.hasClass( "wb-menu" ) ) {
			$elm = $elm.closest( ".wb-menu" );
		}
		onReset( $elm );
		break;

	case "display":
		if ( event.cancelDelay ) {
			onDisplay( $elm, event );
		} else {
			globalTimeout[ $elm.attr( "id" ) ] = setTimeout( function() {
				onDisplay( $elm, event );
			}, hoverDelay );
		}
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});


// Panel clicks on menu items should open submenus
$document.on( "click vclick", selector + " .item", onPanelClick );

/*
 * Menu Keyboard bindings
 */
$document.on( "mouseover focusin", selector + " .item[aria-haspopup]", onHoverFocus );

$document.on( "keydown", selector + " .item", function( event ) {
	var elm = event.target,
		which = event.which,
		ref = expand( elm ),
		$container = ref[ 0 ],
		$menu = ref[ 1 ],
		$elm = ref[ 3 ],
		$index = $menu.index( $elm[ 0 ] ),
		$goto, $parent, $subMenu;

	switch ( which ) {

	// Enter key, up/down arrow
	case 13:
	case 38:
	case 40:
		if ( $elm.find( ".expicon" ).length !== 0 ) {
			event.preventDefault();
			$parent = $elm.parent();
			$subMenu = $parent.find( ".sm" );
			$goto = $subMenu.find( "a" ).first();

			// Open the submenu if it is not already open
			if ( !$subMenu.hasClass( "open" ) ) {
				$container.trigger({
					type: "display.wb-menu",
					ident: $parent,
					cancelDelay: true
				});
			}

			$container
				.trigger({
					type: "increment.wb-menu",
					cnode: $menu,
					increment: 0,
					current: $index
				})
				.trigger({
					type: "select.wb-menu",
					goto: $goto
				});
		}
		break;

	// Tab/escape key
	case 9:
	case 27:
		onReset( $container, true, ( which === 27 ) );
		break;

	// Left/right arrow
	case 37:
	case 39:
		event.preventDefault();
		$container.trigger({
			type: "increment.wb-menu",
			cnode: $menu,
			increment: ( which === 37 ? -1 : 1 ),
			current: $index
		});
		break;
	}
});

/*
 * Item Keyboard bindings
 */
$document.on( "keydown", selector + " [role=menu]", function( event ) {
	var elm = event.target,
		which = event.which,
		ref = expand( elm, true ),
		$container = ref[ 0 ],
		$menu = ref[ 1 ],
		$items = ref[ 2 ],
		$elm = ref[ 3 ],
		$links = $items.find( ":focusable" ),
		$index = $links.index( $elm[ 0 ] ),
		$goto;

	switch ( which ) {

	// Escape key/left arrow
	case 27:
	case 37:
		event.preventDefault();
		$goto = $menu.filter( "[href=#" + $items.attr( "id" ) + "]" );
		$container.trigger({
			type: "select.wb-menu",
			goto: $goto,
			special: "reset"
		});
		break;

	// Up/down arrow
	case 38:
	case 40:
		event.preventDefault();
		$container.trigger({
			type: "increment.wb-menu",
			cnode: $links,
			increment: ( which === 38 ? -1 : 1 ),
			current: $index
		});
		break;

	// Tab key
	case 9:
		onReset( $container, true );
		break;
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
