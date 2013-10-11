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
 * @method onAjaxLoaded
 * @param {jQuery DOM element} element The plugin element
 */
onAjaxLoaded = function( $elm ) {

	//Some hooks for post transformation
	// - @data-post-remove : removes the space delimited class for the element. This is more a feature to fight the FOUC
	var $menu = $elm.find( ".menu :focusable" ),
		$items = $elm.find( ".item" );

	if ( $elm.has( "[data-post-remove]" ) ) {
		$elm.removeClass( $elm.data( "post-remove" ) )
			.removeAttr( "data-post-remove" );
	}

	$elm.find( ":discoverable" )
		.attr( "tabindex", "-1" )
		.eq( 0 )
		.attr( "tabindex", "0" );

	$menu.filter( "[href^='#']" )
		.append( "<span class='expandicon'></span>" );

	$elm.data({
		"self": $elm,
		"menu": $menu,
		"items": $items
	});
},

/*  
 * @method onSelect
 * @param {jQuery event} event The current event
 */
onSelect = function( event ) {
	event.goto.trigger( "focus.wb" );
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
	$elm.find( ".open" ).removeClass( "open" );
	$elm.find( ".active" ).removeClass( "active" );
},

/*  
 * @method onDisplay
 * @param {jQuery DOM element} element The plugin element
 * @param {jQuery event} event The current event
 */
onDisplay = function( $elm, event ) {
	$elm.trigger({
		type: "reset.wb-menu"
	});
	$elm.find( ".menu [href='" + event.ident + "']" ).addClass( "active" );
	$elm.find( event.ident ).addClass( "open" );
},

/*  
 * @method onHoverFocus
 * @param {jQuery event} event The current event
 */
onHoverFocus = function( event ) {
	var _ref = expand( event.target ),
		$menu = _ref[ 1 ],
		$elm = _ref[ 3 ];

	$menu.trigger( "reset.wb-menu" );
	if ( $elm.find( ".expandicon" ).length > 0 ) {
		$menu.trigger({
			type: "display.wb-menu",
			ident: $elm.attr( "href" )
		});
	}
};

// Bind the events of the plugin
$document.on("ajax-replace-loaded.wb mouseleave focusout select.wb-menu increment.wb-menu reset.wb-menu display.wb-menu", selector, function( event ) {
	var eventType = event.type,
		$elm = $( this );

	switch ( eventType ) {
	case "ajax-replace-loaded":
		event.stopPropagation();
		onAjaxLoaded( $elm );
		return false;
	case "mouseleave":
	case "focusout":
		$elm.trigger( "reset.wb-menu" );
		break;
	case "select":
		event.stopPropagation();
		onSelect( event );
		break;
	case "increment":
		event.stopPropagation();
		onIncrement( $elm, event );
		break;
	case "reset":
		event.stopPropagation();
		onReset( $elm );
		break;
	case "display":
		event.stopPropagation();
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
$document.on( "mouseover focusin", selector + " .menu :focusable", function( event ) {
	event.stopPropagation();
	onHoverFocus( event );
});

// TODO: Convert rest of events to plugin template
$document.on( "keydown", selector + " .menu", function( event ) {
	event.stopPropagation();

	var _ref = expand( event.target ),
		$container = _ref[ 0 ],
		$menu = _ref[ 1 ],
		$items = _ref[ 2 ],
		$elm = _ref[ 3 ],
		$code = event.which,
		$index = $menu.index( $elm.get( 0 ) ),
		$anchor,
		$goto;

	switch ( $code ) {
	case 13:
	case 40:
		if ( $elm.find( ".expandicon" ).length > 0 ) {
			event.preventDefault();
			$anchor = $elm.attr( "href" ).slice( 1 );
			$goto = $items.filter( "[id='" + $anchor + "']" ).find( ":discoverable" ).first();

			$container.trigger({
				type: "display.wb-menu",
				ident: $elm.attr( "href" )
			})
				.trigger({
					type: "select.wb-menu",
					goto: $goto
				});
		}
		break;
	case 9:
		$container.trigger({
			type: "reset.wb-menu"
		});
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
$document.on( "keydown", selector + " .item", function( event ) {

	event.stopPropagation();
	var _ref = expand( event.target, true ),
		$container = _ref[ 0 ],
		$menu = _ref[ 1 ],
		$items = _ref[ 2 ],
		$elm = _ref[ 3 ],
		$code = event.which,
		$links = $items.find( ":focusable" ),
		$index = $links.index( $elm.get( 0 ) ),
		$goto;

	switch ( $code ) {
	case 27:
	case 37:
		event.preventDefault();
		$goto = $menu.filter( "[href='#" + $items.attr( "id" ) + "']" );
		$container.trigger({
			type: "select.wb-menu",
			goto: $goto
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

})( jQuery, window, vapour );
