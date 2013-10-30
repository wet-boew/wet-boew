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

	// Lets test to see if we have any
	if ( $elm.data( "ajax-fetch" ) ) {
		$document.trigger({
			type: "ajax-fetch.wb",
			element: $elm,
			fetch: $elm.data( "ajax-fetch" )
		});
	}

	//anything else
},
/*
 * Lets set some aria states and attributes
 * @method drizzleAria
 * @param {jQuery DOM elements} collection of elements
 */
drizzleAria = function( $elements ){
	var length = $elements.length,
		elm, subMenu, i;

	// lets tweak for aria
	for ( i = 0; i <= length; i++ ) {
		elm = $elements.eq( i );
		subMenu = elm.siblings( ".sbmnu" );

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
	var $menu = $ajaxed.find( "[role=menubar] .item" );

	$ajaxed.find( ":discoverable" )
		.attr( "tabindex", "-1" );

	$menu.eq(0).attr( "tabindex", "0" );
	$menu.filter( "[href^=#]" )
		.append( "<span class='expandicon'></span>" );

	drizzleAria( $menu );

	// Now lets replace the html since we were working off canvas for performance
	if ( $elm.has( "[data-post-remove]" ) ) {
		$elm.removeClass( $elm.data( "post-remove" ) )
			.removeAttr( "data-post-remove" );
	}

	// replace elements
	$elm.html( $ajaxed.html() );

	// recalibrate context
	$elm.data({
		self: $elm,
		menu: $elm.find( "[role=menubar] .item" ),
		items: $elm.find( ".sbmnu" )
	});

},

/*
 * @method onSelect
 * @param {jQuery event} event The current event
 */
onSelect = function( event ) {

	setTimeout(function () {
		event.goto.focus();
		if ( event.special ) {
			onReset( event.goto.parents( selector ) );
		}
	}, 0 );

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
 * @param {jQuery DOM element} element The plugin element
 */
onReset = function( $elm ) {
	$elm.find( ".open, .active" ).removeClass( "open active" );
},

/*
 * @method onDisplay
 * @param {jQuery DOM element} element The plugin element
 * @param {jQuery event} event The current event
 */
onDisplay = function( $elm, event ) {
	var $item = event.ident;

	// lets reset the menus to ensure no overlap
	$elm.trigger({
		type: "reset.wb-menu"
	});
	// add the open state classes
	$item.addClass( "active" )
		.find( ".sbmnu" )
		.addClass( "open" );
},

/*
 * @method onHoverFocus
 * @param {jQuery event} event The current event
 */
onHoverFocus = function( event ) {
	var ref = expand( event.target ),
		$container = ref[ 0 ],
		$elm = ref[ 3 ];

		$container.trigger({
			type: "display.wb-menu",
			ident: $elm.parent()
		});
};

// Bind the events of the plugin
$document.on("timerpoke.wb mouseleave select.wb-menu ajax-fetched.wb increment.wb-menu reset.wb-menu display.wb-menu", selector, function( event ) {
	event.stopPropagation();
	var eventType = event.type,
		$elm = $( this );

	switch ( eventType ) {
	case "ajax-fetched":
		onAjaxLoaded( $elm, event.pointer );
		return false;
	case "select":
		onSelect( event );
		break;
	case "mouseleave":
		onReset( $elm );
		break;
	case "timerpoke":
		onInit( $elm );
		break;
	case "increment":
		onIncrement( $elm, event );
		break;
	case "reset":
		onReset( $elm );
		break;
	case "display":
		onDisplay( $elm, event );
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});


/*
 * Menu Keyboard bindings
 */
$document.on( "mouseover focusin", selector + " .item", function( event ) {
	event.stopPropagation();
	onHoverFocus( event );
});




// TODO: Convert rest of events to plugin template
$document.on( "keydown", selector + " .item", function( event ) {
	event.stopPropagation();

	var ref = expand( event.target ),
		$container = ref[ 0 ],
		$menu = ref[ 1 ],
		$elm = ref[ 3 ],
		$code = event.which,
		$index = $menu.index( $elm.get( 0 ) ),
		$goto;

	switch ( $code ) {
	case 13:
	case 40:
		if ( $elm.find( ".expandicon" ).length > 0 ) {
			event.preventDefault();
			$goto = $elm.closest( "li" ).find( ".sbmnu [role=menuitem]" ).first();

			$container.trigger({
				type: "increment.wb-menu",
				cnode: $menu,
				increment: 0,
				current: $index
			}).trigger({
					type: "select.wb-menu",
					goto: $goto
				});
		}
		break;
	case 9:
		onReset( $container );
		break;
	case 37:
		event.preventDefault();
		$container.trigger({
			type: "increment.wb-menu",
			cnode: $menu,
			increment: -1,
			current: $index
		});
		break;
	case 39:
		event.preventDefault();
		$container.trigger({
			type: "increment.wb-menu",
			cnode: $menu,
			increment: 1,
			current: $index
		});
		break;
	}
});

/*
 * Item Keyboard bindings
 */
$document.on( "keydown", selector + " [role=menu]", function( event ) {

	event.stopPropagation();
	var ref = expand( event.target, true ),
		$container = ref[ 0 ],
		$menu = ref[ 1 ],
		$items = ref[ 2 ],
		$elm = ref[ 3 ],
		$code = event.which,
		$links = $items.find( ":focusable" ),
		$index = $links.index( $elm.get( 0 ) ),
		$goto;

	switch ( $code ) {
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
	case 38:
		event.preventDefault();
		$container.trigger({
			type: "increment.wb-menu",
			cnode: $links,
			increment: -1,
			current: $index
		});
		break;
	case 9:
		onReset( $container );
		break;
	case 40:
		event.preventDefault();
		$container.trigger({
			type: "increment.wb-menu",
			cnode: $links,
			increment: 1,
			current: $index
		});
		break;
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
