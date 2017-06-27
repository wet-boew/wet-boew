/**
* @title WET-BOEW Facebook embedded page
* @overview Helps with implementing Facebook embedded pages.
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
var componentName = "wb-facebook",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	fbinited = false,

	/**
	* @method init
	* @param {jQuery Event} event Event that triggered the function call
	*/
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var ele = wb.init( event, componentName, selector ),
			protocol = wb.pageUrlParts.protocol;

		if ( ele ) {
			Modernizr.load(
				{
					load: [ ( protocol.indexOf( "http" ) === -1 ? "http:" : protocol ) + "//connect.facebook.net/" + wb.lang + "_US/sdk.js" ],
					complete: function() {
						if ( !fbinited ) {
							window.FB.init( {
								version: "v2.4"
							} );
							fbinited = true;
						}

						window.FB.XFBML.parse( ele[ 0 ] );
						wb.ready( $( ele ), componentName );
					}
				}
			);
		}
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
