/**
 * @title WET-BOEW Progress polyfill
 * @overview The <progress> element displays the progress of a task.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var componentName = "wb-progress",
	selector = "progress",
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {
			progress( elm );

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	},

	/**
	 * Create and update the progress visuals
	 * @method meter
	 * @param {DOM element} elm Element to be polyfilled
	 */
	progress = function( elm ) {
		var $elm = $( elm ),
			$progress = $elm.children( ".progress, .undef" ),
			$span = $elm.children( ".wb-inv" ),
			ariaValueMax = 1.0,
			ariaValueNow,
			$progressbar;

		if ( elm.getAttribute( "value" ) !== null ) {
			if ( $progress.length === 0 ) {
				$progress = $( "<div class='progress'><div class='progress-bar' role='progressbar' /></div>" );
				$elm.append( $progress );
			}

			try {
				ariaValueMax = parseFloat( elm.getAttribute( "max" ) );
			} catch ( error ) {

				/* swallow error */
			}

			ariaValueNow = elm.getAttribute( "value" );
			if ( ariaValueNow > ariaValueMax ) {
				ariaValueNow = ariaValueMax;
			}

			$progressbar = $progress.children( ".progress-bar" );

			$progressbar.css( "width", ( ( ariaValueNow / ariaValueMax ) * 100 ) + "%" )
				.attr( {
					"aria-valuemin": 0,
					"aria-valuemax": ariaValueMax,
					"aria-valuenow": ariaValueNow
				} );

			$span.detach();
			$span.appendTo( $progressbar );

		} else if ( $progress.length === 0 ) {
			$elm.append( "<div class='undef'/>" );
		}

		$elm.trigger( "wb-updated." + componentName );
	};

// Bind the events of the polyfill
$document.on( "timerpoke.wb " + initEvent + " "  + updateEvent, selector, function( event ) {
	var eventTarget = event.target;

	if ( event.type === "wb-update" ) {
		if ( event.namespace === componentName &&
			event.currentTarget === eventTarget ) {

			progress( eventTarget );
		}
	} else {
		init( event );
	}
} );

// Add the timer poke to initialize the polyfill
wb.add( selector );

} )( jQuery, window, wb );
