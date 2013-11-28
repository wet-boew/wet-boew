/*
 * @title Geolocation
 * @overview Plugin to get the visitor's physical location based on their IP address using ipinfodb.com.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
(function ( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-geolocation",
	$document = vapour.doc,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		api: "ip-country",
		apiKey: ""
	},

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {

		// read the selector node for parameters
		var settings = $.extend( {}, defaults, $elm.data() ),
			wsGeoLocFld = "geoloc";

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );
		
		if ( !sessionStorage.getItem( wsGeoLocFld ) && settings[ "apiKey" ].length !== 0 ) {
			$.getJSON( "http://api.ipinfodb.com/v3/" + settings[ "api" ] + "/" + "?key=" + settings[ "apiKey" ] + "&format=json", function( data ) {
				if ( data[ "statusCode" ] == "OK" ) {
					sessionStorage.setItem( wsGeoLocFld, JSON.stringify( data ) );
				} else {
					//	@todo	Handling of status code !== OK
				}
			} );
		}

		// Bind the merged settings to the element node for faster access in other events.
		$elm.data({ settings: settings });
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function( event ) {
	var eventTarget = event.target;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		init( $( eventTarget ) );
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control, 
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );