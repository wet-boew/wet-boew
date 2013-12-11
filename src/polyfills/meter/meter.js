/**
 * @title WET-BOEW Meter polyfill
 * @overview The <meter> element displays a gauge. Based on code from https://gist.github.com/667320
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @nschonni
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var pluginName = "wb-meter",
	selector = "meter",
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

			meter( eventTarget );
		}
	},

	// create polyfill
	meter = function( elm ) {
		var $elm = $( elm ),
			min = parseFloat( $elm.attr( "min" ) || 0 ),
			max = parseFloat( $elm.attr( "max" ) || 1 ),
			high = parseFloat( $elm.attr( "high" ) ),
			low = parseFloat( $elm.attr( "low" ) ),
			optimum = parseFloat( $elm.attr( "optimum" ) ),
			value = $elm.attr( "value" ) !== null ? parseFloat( $elm.attr( "value" ) ) : ( elm.textContent ? elm.textContent : elm.innerText ),
			indicator, width;

		$elm.off( "DOMAttrModified propertychange" );

		if ( elm.textContent ) {
			elm.textContent = "";
		} else if ( elm.innerText ) {
			elm.innerText = "";
		}

		/*
		 * The following inequalities must hold, as applicable:
		 * minimum ≤ value ≤ maximum
		 * minimum ≤ low ≤ maximum (if low is specified)
		 * minimum ≤ high ≤ maximum (if high is specified)
		 * minimum ≤ optimum ≤ maximum (if optimum is specified)
		 * low ≤ high (if both low and high are specified)
		 */

		if ( value < min ) {
			value = min;
		} else if ( value > max ) {
			value = max;
		}

		if ( low !== null && low < min ) {
			low = min;
			$elm.attr( "low", low );
		}

		if ( optimum !== null && ( optimum < min || optimum > max ) ) {
			optimum = ( max - min ) / 2;
		}

		if ( high !== null && high > max ) {
			high = max;
			$elm.attr( "high", high );
		}

		width = elm.offsetWidth * ( ( value - min ) / ( max - min ) );

		indicator = elm.children.length === 0 ? document.createElement( "div" ) : elm.children[ 0 ];
		indicator.style.width = Math.ceil( width ) + "px";

		if (elm.children.length === 0) {
			elm.appendChild(indicator);
		}

		if ( high && value >= high ) {
			$elm.addClass( "meterValueTooHigh" );
		} else if ( low && value <= low ) {
			$elm.addClass( "meterValueTooLow" );
		} else {
			$elm.removeClass( "meterValueTooHigh meterValueTooLow" );
		}

		if ( value >= max ) {
			$elm.addClass( "meterIsMaxed" );
		} else {
			$elm.removeClass( "meterIsMaxed" );
		}

		// Set defaults as per HTML5 spec
		$elm.attr({
			min: min,
			max: max,
			value: value,
			title: $elm.attr( "title" ) || value
		});
		
		setTimeout( function() {
			$elm.on( "DOMAttrModified propertychange", function() {
				meter( this );
			});
		}, 0 );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
