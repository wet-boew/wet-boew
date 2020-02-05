/**
 * @title WET-BOEW Randomize
 * @overview This plugin randomly picks one of the child component to be shown on the browser.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @masterbee @namjohn920
 */
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-randomize",
	selector = ".provisional[data-wb-randomize]",
	initEvent = "wb-init" + selector,
	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm = $( elm ),
			setting = $elm.data( "wb-randomize" ),
			selected = $( setting.selector, $( elm ) );

		if ( selected.length === 0 || !setting.selector ) {
			console.error( "selector attribute in data-wb-randomize plugin is undefined or not valid" );
			return;
		}

		if ( setting.shuffle ) {
			selected = wb.shuffleDOM( selected );
		}

		if ( setting.toggle ) {
			selected = wb.pickElements( selected, setting.number ? setting.number : 1  );
			selected.toggleClass( setting.toggle );
		}

		wb.ready( $( elm ), componentName );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
