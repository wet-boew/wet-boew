( function( $, window, wb ) {
"use strict";

var componentName = "wb-meter-circular",
	selector = "meter." + componentName,
	initEvent = "wb-init" + "." + componentName,
	$document = wb.doc,
	meterPrefix = "mtr-",
	selectorValue = "." + meterPrefix + "val",
	selectorLabel = "." + meterPrefix + "lbl",
	clsOptimal = meterPrefix + "optimal",
	clsSubOptimal = meterPrefix + "suboptimal",
	clsLessGood = meterPrefix + "lessgood",
	jQueryValHookFlag,

	updateProgress = function( elm, value ) {

		if ( elm.className.indexOf( componentName + "-inited" ) !== -1 ) {

			// Get the information
			var $elm = $( elm ),
				elmId = elm.id,
				$mtrElm = $( "#" + meterPrefix + elmId ),
				min = parseFloat( $elm.attr( "min" ) || 0 ),
				max = parseFloat( $elm.attr( "max" ) || 1 ),
				high = parseFloat( $elm.attr( "high" ) ) || max,
				low = parseFloat( $elm.attr( "low" ) ) || min,
				optimum = parseFloat( $elm.attr( "optimum" ) ),
				label = $elm.attr( "aria-label" ),
				clsRegionLow,
				clsRegionMiddle,
				clsRegionHigh;

			// Boundary adjustment for: max, value, low, high, optimum
			if ( max < min ) {
				max = min;
			}
			if ( value < min ) {
				value = min;
			} else if ( value > max ) {
				value = max;
			}
			if ( low < min ) {
				low = min;
			} else if ( low > max ) {
				low = max;
			}
			if ( high < low ) {
				high = low;
			} else if ( high > max ) {
				high = max;
			}
			if ( !optimum ) {
				optimum = ( ( max - min ) / 2 + min );
			} else if ( optimum < min ) {
				optimum = min;
			} else if ( optimum > max ) {
				optimum = max;
			}

			// Set Aria and update value
			$mtrElm.find( selectorValue ).html( value + "" );
			$mtrElm.attr( "aria-valuenow", value );
			$mtrElm.attr( "aria-valuemax", max );
			$mtrElm.attr( "aria-valuemin", "0" );

			// Find the quadrant to animate the meter circle bar
			var percent = value / max * 100,
				quadrant = percent / ( 100 / 12 ),
				roundQuadrant = Math.round( quadrant ),
				clsToAdd;

			if ( roundQuadrant === 0 && value > 0 ) {
				clsToAdd = "r3m";
			} else if ( roundQuadrant === 12 && value !== max ) {
				clsToAdd = "r57m";
			} else if ( roundQuadrant === 6 && percent > 50 ) {
				clsToAdd = "r33m";
			} else if ( roundQuadrant === 6 && percent < 50 ) {
				clsToAdd = "r27m";
			} else {
				clsToAdd = "r" + roundQuadrant;
			}
			$mtrElm.removeClass( clsOptimal + " " + clsSubOptimal + " " + clsLessGood + " r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r33m r27m r57m r3m" );
			void $mtrElm[ 0 ].offsetWidth; // Force the animation reset

			// Set mtr color based on regions of the gauge
			if ( low <= optimum && optimum <= high ) {
				clsRegionLow = clsSubOptimal;
				clsRegionMiddle = clsOptimal;
				clsRegionHigh = clsSubOptimal;
			} else if ( optimum < low ) {
				clsRegionLow = clsOptimal;
				clsRegionMiddle = clsSubOptimal;
				clsRegionHigh = clsLessGood;
			} else if ( optimum > high ) {
				clsRegionLow = clsLessGood;
				clsRegionMiddle = clsSubOptimal;
				clsRegionHigh = clsOptimal;
			}

			clsToAdd = clsToAdd + " ";
			if ( low <= value && value <= high ) {
				clsToAdd = clsToAdd + clsRegionMiddle;
			} else if ( value < low ) {
				clsToAdd = clsToAdd + clsRegionLow;
			} else if ( value > high ) {
				clsToAdd = clsToAdd + clsRegionHigh;
			}

			// Update the label if any
			if ( label ) {
				$mtrElm.find( selectorLabel ).html( label );
				clsToAdd = clsToAdd + " wlbl";
			}

			// Animate the meter
			$mtrElm.addClass( clsToAdd );
		}
	},
	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm, elmId, meterUI, meterID;

		if ( elm ) {
			$elm = $( elm );

			elmId = elm.id;
			if ( !elmId ) {
				elmId = wb.getId();
				elm.id = elmId;
			}
			meterID = meterPrefix + elmId;

			// Add the valHook
			if ( !jQueryValHookFlag ) {
				jQuery.valHooks.meter = {
					set: updateProgress
				};
				jQueryValHookFlag = true;
			}

			meterUI = "<div id='" + meterID + "' class='mtr-rnd' role='progressbar'><span class='mtr-l'><span class='mtr-b'></span></span><span class='mtr-r'><span class='mtr-b'></span></span><div class='mtr-val'></div><div class='mtr-lbl'></div></div>";

			$elm.after( meterUI );
			$elm.hide().attr( "aria-controls", meterID );

			updateProgress( elm, $elm.attr( "value" ) !== null ? parseFloat( $elm.attr( "value" ) ) : ( elm.textContent ? elm.textContent : elm.innerText ) );

			wb.ready( $elm, componentName );
		}
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );
} )( jQuery, window, wb );
