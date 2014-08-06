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
var componentName = "wb-meter",
	selector = "meter",
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
			meter( elm );

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	},

	/**
	 * Create and update the meter visuals
	 * @method meter
	 * @param {DOM element} elm Element to be polyfilled
	 */
	meter = function( elm ) {
		var $elm = $( elm ),
			min = parseFloat( $elm.attr( "min" ) || 0 ),
			max = parseFloat( $elm.attr( "max" ) || 1 ),
			high = parseFloat( $elm.attr( "high" ) ),
			low = parseFloat( $elm.attr( "low" ) ),
			optimum = parseFloat( $elm.attr( "optimum" ) ),
			value = $elm.attr( "value" ) !== null ? parseFloat( $elm.attr( "value" ) ) : ( elm.textContent ? elm.textContent : elm.innerText ),
			children = elm.children,
			indicator, width;

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

		indicator = children.length === 0 ? document.createElement( "div" ) : children[ 0 ];
		indicator.style.width = Math.ceil( width ) + "px";

		if ( children.length === 0 ) {
			elm.appendChild( indicator );
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
		}).trigger( "wb-updated." + componentName );
	};

// Bind the events of the polyfill
$document.on( "timerpoke.wb " + initEvent + " "  + updateEvent, selector, function( event ) {
	var eventTarget = event.target;

	if ( event.type === "wb-update" ) {
		if ( event.namespace === componentName &&
			event.currentTarget === eventTarget ) {

			meter( eventTarget );
		}
	} else {
		init( event );
	}
});

// Add the timer poke to initialize the polyfill
wb.add( selector );

})( jQuery, window, wb );
