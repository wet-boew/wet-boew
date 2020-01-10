/**
 * @title WET-BOEW Set background image sourceset
 * @overview Detects the change in screen width and replace the background image accordingly
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @namjohn920
 */
( function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,
	$window = wb.win,
	componentName = "wb-bgimg-srcset",
	selector = ".provisional[data-bgimg-srcset]",
	inputs = {},
	elm,
	ids = [],

	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		elm = wb.init( event, componentName, selector );

		if ( elm ) {
			ids.push( elm.id );
			var userInputs;
			if ( elm.dataset.bgimgSrcset ) {
				userInputs = elm.dataset.bgimgSrcset.split( "," );
			};

			var i_len = userInputs.length;
			inputs[ elm.id ] = [];

			for ( var i = 0; i < i_len; i++ ) {
				userInputs[ i ] = userInputs[ i ].trim();
				userInputs[ i ] = userInputs[ i ].split( " " );
				userInputs[ i ][ 1 ] = parseInt( userInputs[ i ][ 1 ].substring( 0, userInputs[ i ][ 1 ].length - 1 ) );
				inputs[ elm.id ].push( userInputs[ i ] );
			}

			inputs[ elm.id ].sort(
				function( a, b ) {
					return a[ 1 ] > b[ 1 ] ? 1 : -1;
				}
			);

			selectImage();

				// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	},

	selectImage = function() {
		var screenWidth = window.innerWidth,
			optimizedLink = {},
			i_len = ids.length;

		for ( var i = 0; i < i_len; i++ ) {
			var optimizedSize = Infinity,
				currentId = inputs[ ids[ i ] ],
				currentId_len = inputs[ ids[ i ] ].length;

			for ( var j = 0; j < currentId_len; j++ ) {
				var currentInput = currentId[ j ];
				if ( currentInput[ 1 ] >= screenWidth ) {
					if ( optimizedSize > currentInput[ 1 ] ) {
						optimizedSize = currentInput[ 1 ];
						optimizedLink[ ids[ i ] ] = currentInput[ 0 ];
					}
				}
			}
			if ( optimizedSize === Infinity ) {
				optimizedLink[ ids[ i ] ] = currentId[ currentId_len - 1 ][ 0 ];
			}
		}

		for ( var link in optimizedLink ) {
			var elm = document.getElementById( link );
			elm.style.backgroundImage = "url(" + optimizedLink[ link ] + ")";
		}
	};

$window.on( "resize", selectImage );

	// Bind the init event of the plugin
$document.on( "timerpoke.wb wb-init." + componentName, selector, init );

	// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
