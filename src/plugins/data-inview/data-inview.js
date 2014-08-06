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
var componentName = "wb-inview",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	scrollEvent = "scroll" + selector,
	$document = wb.doc,
	$window = wb.win,
	$elms = $(),

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm;

		if ( elm ) {
			$elm = $( elm );
			$elms = $elms.add( $elm );

			// Allow other plugins to run first
			setTimeout(function() {
				onInView( $elm );

				// Identify that initialization has completed
				wb.ready( $elm, componentName );
			}, 1 );
		}
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

			if ( $dataInView.length !== 0 ) {

				// Keep closed if the user closed the inView result
				if ( !$dataInView.hasClass( "user-closed" ) ) {
					if ( $dataInView.hasClass( "wb-overlay" ) ) {
						if ( !oldViewState ) {
							$dataInView.addClass( "outside-off" );
						}
						$dataInView.trigger({
							type: ( show ? "open" : "close" ),
							namespace: "wb-overlay",
							noFocus: true
						});
					} else {
						$dataInView
							.attr( "aria-hidden", !show )
							.toggleClass( "in", !show )
							.toggleClass( "out", show );
					}
				}
			}

			// Trigger an event on the element identifying that the view state has changed
			// (e.g., "all.wb-inview", "partial.wb-inview", "none.wb-inview")
			$elm.trigger( viewState + selector );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + scrollEvent, selector, function( event ) {
	var eventTarget = event.target,
		eventType = event.type;

	switch ( eventType ) {
	case "timerpoke":
	case "wb-init":
		init( event );
		break;

	case "scroll":

		// Filter out any events triggered by descendants
		if ( event.currentTarget === eventTarget ) {
			onInView( $( eventTarget ) );
		}
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

$window.on( "scroll scrollstop", function() {
	$elms.trigger( scrollEvent );
});

$document.on( "txt-rsz.wb win-rsz-width.wb win-rsz-height.wb", function() {
	$elms.trigger( scrollEvent );
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
