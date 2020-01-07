/**
 * @title WET-BOEW Twitter embedded timeline
 * @overview Helps with implementing Twitter embedded timelines.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */

var componentName = "wb-twitter",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {
		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var eventTarget = wb.init( event, componentName, selector ),
			protocol = wb.pageUrlParts.protocol;
		if ( eventTarget ) {
			Modernizr.load( {
				load: ( protocol.indexOf( "http" ) === -1 ? "http:" : protocol ) + "//platform.twitter.com/widgets.js",
				complete: function() {

					// Identify that initialization has completed
					wb.ready( $( eventTarget ), componentName );
				}
			} );		
		}
	};

var ua = navigator.userAgent;
/* If the user's browser is IE, don't load the Twitter widget and display a message */
if (ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1) {
   $( '.wb-twitter a' ).removeClass( 'twitter-timeline' );
   $( '.wb-twitter' ).after( '<p id="ieNotSupportedMessage">' );
   var pathName = window.location.pathname; 
   var pageLanguage = pathName.substring(1, 3);
   if (pageLanguage === "en") {
      $('#ieNotSupportedMessage').text("Your browser does not support the display of the Twitter feed. Please try another browser.");
   }
   else if (pageLanguage === "fr") {
      $('#ieNotSupportedMessage').text("Votre navigateur ne supporte pas l'affichage du fil Twitter. Veuillez essayer un autre navigateur.");
   }
}
/* Any other browsers, load the Twitter widget */
else {
   $document.on( "timerpoke.wb " + initEvent, selector, init );
}
// Add the timer poke to initialize the plugin
wb.add( selector );
} )( jQuery, window, wb );
