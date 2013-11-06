/*
 * @title WET-BOEW Carousel
 * @overview Interface for cycling through content
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, window, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-carousel",
	$document = vapour.doc,
	controls = selector + " .prv, " + selector + " .nxt, " + selector + " .plypause",

	/*
	 * @method onTimerPoke
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onTimerPoke = function( $elm ) {
		var setting,
			dataDelay = $elm.attr( "data-delay" ),
			delay;

		if ( !dataDelay ) {
			$elm.trigger( "init.wb-carousel" );
			return false;
		}

		/* state stopped*/
		if ( $elm.hasClass( "stopped" ) ) {
			return false;
		}
		/* continue;*/

		/* add settings and counter*/
		setting = parseFloat( dataDelay );
		delay = parseFloat( $elm.attr( "data-ctime" ) ) + 0.5;

		/* check if we need*/
		if ( setting < delay ) {
			$elm.trigger( "shift.wb-carousel" );
			delay = 0;
		}
		$elm.attr( "data-ctime", delay );
	},

	/*
	 * @method onInit
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onInit = function( $elm ) {
		var interval = 6;

		if ( $elm.hasClass( "slow" ) ) {
			interval = 9;
		} else if ( $elm.hasClass( "fast" ) ) {
			interval = 3;
		}
		$elm.find( ".item:not(.in)" )
			.addClass( "out" );
		$elm.attr( {
			"data-delay": interval,
			"data-ctime": 0
		});
	},

	/*
	 * @method onShift
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onShift = function( $elm, event ) {
		var items = $elm.find( ".item" ),
			len = items.length,
			current = $elm.find( ".item.in" ).prevAll( ".item" ).length,
			shiftto = ( event.shiftto ) ? event.shiftto : 1,
			next = current > len ? 0 : current + shiftto;

		next = ( next > len - 1 ) ? 0 : ( next < 0 ) ? len - 1 : next;
		items.eq( current ).removeClass( "in" ).addClass( "out" );
		items.eq( next ).removeClass( "out" ).addClass( "in" );
	},

	/*
	 * @method onSelect Assumes the clicked element was an <a> inside an <li>.
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery event} event The current event
	 */
	onSelect = function( $elm, event ) {
		var items = $elm.find( ".item" ),
			current = $elm.find( ".item.in" ).prevAll( ".item" ).length,
			// Using index here because we added the <ul> ourself, so we know it only contains the <li>s we put there.
			target = $( event.target ).parent().index();
		
		items.eq( current ).removeClass( "in" ).addClass( "out" );
		items.eq( target ).removeClass( "out" ).addClass( "in" );
	},
	
	/*
	 * @method onCycle
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {integer} shifto The item to shift to
	 */
	onCycle = function( $elm, shifto ) {
		$elm.trigger( {
			type: "shift.wb-carousel",
			shiftto: shifto
		});
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb init.wb-carousel shift.wb-carousel select.wb-carousel", selector, function( event ) {
	var eventType = event.type,

		// "this" is cached for all events to utilize
		$elm = $( this );

	switch ( eventType ) {
	case "timerpoke":
		onTimerPoke( $elm );
		break;

	/*
	 * Init
	 */
	case "init":
		onInit( $elm );
		break;

	/*
	 * Change Slides
	 */
	case "shift":
		onShift( $elm, event );
		break;
		
	/*
	 * Select a specific slide
	 */
	case "select":
		onSelect( $elm, event );
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

/*
 * Next / Prev
 */
$document.on( "click", controls, function( event ) {
	event.preventDefault();
	var $elm = $( this ),
		sldr = $elm.parents( ".wb-carousel" ),
		action = $elm.attr( "class" );

	switch ( action ) {
	case "prv":
		onCycle( $elm, -1 );
		break;
	case "nxt":
		onCycle( $elm, 1 );
		break;
	default:
		sldr.toggleClass( "stopped" );
	}
	sldr.attr( "data-ctime", 0 );

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( ".wb-carousel" );

})( jQuery, window, vapour );
