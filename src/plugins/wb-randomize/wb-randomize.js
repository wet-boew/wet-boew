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
	selector = ".provisional[data-wb-randomize]",
	initEvent = "wb-init" + selector,
	defaults = {},

	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm, settings, $selectedElm;

		if ( elm ) {
			$elm = $( elm );
			settings = $.extend(
				true,
				{},
				defaults,
				window[ componentName ],
				wb.getData( $elm, componentName )
			);

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

			wb.ready( $elm, componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
