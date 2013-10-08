/*
 * @title WET-BOEW JavaScript Carousel
 * @overview Explain the plug-in or any third party lib that it is inspired by
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function ( $, window, vapour ) {
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
		onTimerPoke = function ( $elm ) {
			var _setting,
				_dataDelay = $elm.attr( "data-delay" ),
				_delay;

			if ( !_dataDelay ) {
				$elm.trigger( "init.wb-carousel" );
				return false;
			}

			/* state stopped*/
			if ( $elm.hasClass( "stopped" ) ) {
				return false;
			}
			/* continue;*/

			/* add settings and counter*/
			_setting = parseFloat( _dataDelay );
			_delay = parseFloat( $elm.attr( "data-ctime" ) ) + 0.5;

			/* check if we need*/
			if ( _setting < _delay ) {
				$elm.trigger( "shift.wb-carousel" );
				_delay = 0;
			}
			$elm.attr( "data-ctime", _delay );
		},

		/*  
		 * @method onInit
		 * @param {jQuery DOM element} $elm The plugin element
		 */
		onInit = function ( $elm ) {
			var _interval = 6;

			if ( $elm.hasClass( "slow" ) ) {
				_interval = 9;
			} else if ( $elm.hasClass( "fast" ) ) {
				_interval = 3;
			}
			$elm.find( ".item:not(.in)" )
				.addClass( "out" );
			$elm.attr( {
				"data-delay": _interval,
				"data-ctime": 0
			} );
		},

		/*  
		 * @method onShift
		 * @param {jQuery DOM element} $elm The plugin element
		 */
		onShift = function ( $elm, event ) {
			var _items = $elm.find( ".item" ),
				_len = _items.length,
				_current = $elm.find( ".item.in" ).prevAll( ".item" ).length,
				_shiftto = ( event.shiftto ) ? event.shiftto : 1,
				_next = _current > _len ? 0 : _current + _shiftto;

			_next = ( _next > _len - 1 || _next < 0 ) ? 0 : _next;
			_items.eq( _current ).removeClass( "in" ).addClass( "out" );
			_items.eq( _next ).removeClass( "out" ).addClass( "in" );
		},

		/*  
		 * @method onShift
		 * @param {jQuery DOM element} $elm The plugin element
		 * @param {integer} shifto The item to shift to
		 */
		onCycle = function ( $elm, shifto ) {
			$elm.trigger( "shift.wb-carousel", {
				shiftto: shifto
			} );
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb init.wb-carousel shift.wb-carousel", selector, function ( event ) {
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
		}
		
        /*
         * Since we are working with events we want to ensure that we are being passive about our control, 
         * so returning true allows for events to always continue
         */
		return true;
	} );

	/*
	 * Next / Prev
	 */
	$document.on( "click", controls, function ( event ) {
		event.preventDefault( );
		var $elm = $( this ),
			_sldr = $elm.parents( ".wb-carousel" ),
			_action = $elm.attr( "class" );

		switch ( _action ) {
		case "prv":
			onCycle( $elm, 1 );
			break;
		case "nxt":
			onCycle( $elm, -1 );
			break;
		default:
			_sldr.toggleClass( "stopped" );
		}
		_sldr.attr( "data-ctime", 0 );

        /*
         * Since we are working with events we want to ensure that we are being passive about our control, 
         * so returning true allows for events to always continue
         */
		return true;
	} );

	// Add the timer poke to initialize the plugin

	window._timer.add( ".wb-carousel" );
})( jQuery, window, vapour );
