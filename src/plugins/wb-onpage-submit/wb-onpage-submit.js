/**
 * @title WET-BOEW wb-onpage-submit
 * @overview This plugin implements AJAX request for form data
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @masterbee, @namjohn920
 **/

( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-onpage-submit",
	selector = ".provisional." + componentName,
	initEvent = "wb-init" + selector,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		elm.addEventListener( "submit", function( e ) {
			e.preventDefault();
			var $elm = $( this );
			try {
				$.ajax( {
					type: $elm.attr( "method" ),
					url: $elm.attr( "action" ),
					data: $elm.serialize() // serializes the form's elements.
				} );
			} catch ( error ) {
				$( this.querySelector( ".formContents" ) ).toggleClass( "hidden" );
				$( this.querySelector( ".failureMessage" ) ).toggleClass( "hidden" );
				throw error;
			}
			$( this.querySelector( ".formContents" ) ).toggleClass( "hidden" );
			$( this.querySelector( ".successMessage" ) ).toggleClass( "hidden" );

			return true;
		} );

		wb.ready( $( elm ), componentName );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
