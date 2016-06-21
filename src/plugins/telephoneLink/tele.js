/**
* @title WET-BOEW Telephone Link
* @overview Automatically add links to telephone numbers in a Web page on a extra small screen (mobile phones).
* @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
* @author @atamsingh
*/

( function( $, window, document, wb ) {
	"use strict";



	var componentName = "wb-telLink",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,

	/**
	* @method init
	* @param {jQuery Event} event Event that triggered the function call
	*/
	init = function() {
		// var elm = wb.init( event, componentName, selector );
		// var setup = function() {
			if( screen.width < 650 ) {
				var regex = /(|\()(\d{3}).{0,2}(\d{3}).{0,1}(\d{4})(?!([^<]*>)|(((?!<a).)*<\/a>))/g;
				var text = $( "main" ).html();

				text = text.replace( regex, "<a href=\"tel:$&\">$&</a>" );
				//console.log(text);
				$( "main" ).html( text );
			}
		// };
		// setup();
		//wb.ready( $( elm ), componentName );
		wb.ready( componentName );
	};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb " + initEvent, selector, init );

	// Add the timer poke to initialize the plugin
	wb.add( selector );

} )( jQuery, window, document, wb );
