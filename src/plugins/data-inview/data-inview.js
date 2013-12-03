/**
 * @title WET-BOEW Data InView
 * @overview A simplified data-attribute driven plugin that responds to moving in and out of the viewport.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-inview",
	$elms = $( selector ),
	$document = wb.doc,
	$window = wb.win,

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		wb.remove( selector );

		$elm.trigger( "scroll.wb-inview" );
	},

	/**
	 * @method onInView
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onInView = function( $elm ) {
		var elementWidth = $elm.outerWidth(),
			elementHeight = $elm.outerHeight(),
			scrollTop = $window.scrollTop(),
			scrollBottom = scrollTop + $window.height(),
			scrollRight = $window.scrollLeft() + elementWidth,
			x1 = $elm.offset().left,
			x2 = x1 + elementWidth,
			y1 = $elm.offset().top,
			y2 = y1 + elementHeight,
			oldViewState = $elm.attr( "data-inviewstate" ),
			inView = ( scrollBottom < y1 || scrollTop > y2 ) || ( scrollRight < x1 || scrollRight > x2 ),

			// this is a bit of a play on true/false to get the desired effect. In short this variable depicts
			// the view state of the element
			// all - the whole element is in the viewport
			// partial - part of the element is in the viewport
			// none - no part of the element is in the viewport
			viewState = ( scrollBottom > y2 && scrollTop < y1 ) ? "all" : inView ? "none" : "partial",
			$dataInView, show;

		// Only if the view state has changed
		if ( viewState !== oldViewState ) {

			// Show on "partial"/"none" (default) or just "none" (requires "show-none" class)
			show = inView || ( $elm.hasClass( "show-none" ) ? false : viewState === "partial" );

			$elm.attr( "data-inviewstate", viewState );
			$dataInView = $( "#" + $elm.attr( "data-inview" ) );

			// Keep closed if the user closed the inView result
			if ( !$dataInView.hasClass( "user-closed" ) ) {
				if ( $dataInView.hasClass( "wb-overlay" ) ) {
					if ( !oldViewState ) {
						$dataInView.addClass( "outside-off" );
					}
					$dataInView.trigger(
						( show ? "open" : "close" ) + ".wb-overlay"
					);
				} else {
					$dataInView
						.attr( "aria-hidden", !show )
						.toggleClass( "in", !show )
						.toggleClass( "out", show );
				}
			}
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb scroll.wb-inview", selector, function( event ) {
	var eventTarget = event.target,
		eventType = event.type,
		$elm;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		$elm = $( eventTarget );

		switch ( eventType ) {
		case "timerpoke":
			init( $elm );
			break;
		case "scroll":
			onInView( $elm );
			break;
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

$window.on( "scroll scrollstop", function() {
	$elms.trigger( "scroll.wb-inview" );
});

$document.on( "text-resize.wb window-resize-width.wb window-resize-height.wb", function() {
	$elms.trigger( "scroll.wb-inview" );
});

// Add the timer poke to initialize the plugin

wb.add( selector );

})( jQuery, window, wb );
