/**
* @title WET-BOEW Telephone Link
* @overview Automatically add links to telephone numbers in a Web page on a extra small screen (mobile phones).
* @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
* @author @atamsingh
*/

( function( $, window ) {
	"use strict";

	// Recognizes safari on iPhones, and default BlackBerry Browser
	// These browsers support click-to-call feature by default
	if (
			 (navigator.userAgent.match(/iPhone/i) && navigator.userAgent.indexOf("Safari") === 1) ||		/* iPhone */
			 (navigator.userAgent.match(/BlackBerry/i) && navigator.userAgent.indexOf("Mozilla") === 1) ||	/* Blacberry - playbook */
			 (navigator.userAgent.match(/BB10/i) && navigator.userAgent.indexOf("Mozilla") === 1)	/* BB10 browsers */
		 ) {
		// Do nothing since iPhone safari or BlackBerry Mozilla/Default browsers
	}
	else if ( window.matchMedia("only screen and (max-width: 760px)").matches ) {
		var regex = /(|\()(\d{3}).{0,2}(\d{3}).{0,1}(\d{4})(?!([^<]*>)|(((?!<a).)*<\/a>))/g;
		var text = $( "main" ).html();

		text = text.replace( regex, ('<a href=\"tel:$&'.replace(/[^0-9]/g, ''))+'\">$&</a>' );	// Can add RDFa here if required, TODO: remove 
		//console.log(text);
		$( "main" ).html( text );
	}

} )( jQuery, window );
