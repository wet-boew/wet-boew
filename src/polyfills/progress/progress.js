/**
 * @title WET-BOEW Progress polyfill
 * @overview The <progress> element displays the progress of a task.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var pluginName = "wb-progress",
	selector = "progress",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init." + pluginName,
	$document = wb.doc,

	/**
	 * Init runs once per polyfill element on the page. There may be multiple elements.
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var eventTarget = event.target;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === eventTarget &&
			eventTarget.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			eventTarget.className += " " + initedClass;

			progress( eventTarget );
		}
	},

	progress = function( elm ) {
		var $elm = $( elm ),
			$progress = $elm.children( ".progress, .undef" ),
			$span = $elm.children(".wb-inv"),
			ariaValueMax = 1.0,
			ariaValueNow,
			$progressbar;

		$elm.off( "DOMAttrModified propertychange" );

		if ( elm.getAttribute( "value" ) !== null ) {
			if ( $progress.length === 0 ) {
				$progress = $( "<div class='progress'><div class='progress-bar' role='progressbar' /></div>" );
				$elm.append( $progress );
			}

			try {
				ariaValueMax = parseFloat( elm.getAttribute( "max" ) );
			} catch ( error ) {
			}

			ariaValueNow = elm.getAttribute( "value" );
			if ( ariaValueNow > ariaValueMax ) {
				ariaValueNow = ariaValueMax;
			}

			$progressbar = $progress.children( ".progress-bar" );

			$progressbar.css( "width", ( ( ariaValueNow / ariaValueMax ) * 100 ) + "%" )
				.attr({
					"aria-valuemin": 0,
					"aria-valuemax": ariaValueMax,
					"aria-valuenow": ariaValueNow
				});

			$span.detach();
			$span.appendTo( $progressbar );

		} else if ( $progress.length === 0 ) {
			$elm.append( "<div class='undef'/>" );
		}

		setTimeout( function() {
			$elm.on( "DOMAttrModified propertychange", function() {
				progress( this );
			});
		}, 0 );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
