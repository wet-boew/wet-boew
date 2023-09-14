/**
 * @title WET-BOEW Randomize
 * @overview This plugin randomly picks one of the child component to be shown on the browser.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @masterbee @namjohn920
 */
( function( $, window, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-randomize",
	selector = "[data-wb-randomize]",
	initEvent = "wb-init" + selector,
	defaults = {},

	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm, settings, $selectedElm, valuesList;

		if ( elm ) {
			$elm = $( elm );
			settings = $.extend(
				true,
				{},
				defaults,
				window[ componentName ],
				wb.getData( $elm, componentName )
			);

			if ( settings.attribute ) {
				if ( settings.values && Array.isArray( settings.values ) ) {
					valuesList = settings.values;
					shuffleArray( valuesList );
					elm.setAttribute( settings.attribute, valuesList[ 0 ] );
				} else {
					throw componentName + ": You must define the property \"values\" to an array of strings when \"attribute\" property is defined.";
				}
			} else {
				$selectedElm = settings.selector ? $( settings.selector, $elm ) : $elm.children();

				if ( !$selectedElm.length ) {
					throw componentName + " selector setting is invalid or no children";
				}

				if ( settings.shuffle ) {
					$selectedElm = wb.shuffleDOM( $selectedElm );
				}

				if ( settings.toggle ) {
					$selectedElm = wb.pickElements( $selectedElm, settings.number );
					$selectedElm.toggleClass( settings.toggle );
				}
			}

			wb.ready( $elm, componentName );
		}
	},

	shuffleArray = function( array ) {
		for ( let i = array.length - 1; i > 0; i-- ) {
			const j = Math.floor( Math.random() * ( i + 1 ) );
			[ array[ i ], array[ j ] ] = [ array[ j ], array[ i ] ];
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
