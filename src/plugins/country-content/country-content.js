/**
 * @title WET-BOEW Country Content
 * @overview A basic AjaxLoader wrapper that inserts AJAXed in content based on a visitors country as resolved by http://freegeoip.net
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @nschonni
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once
 * per page, not once per instance of plugin on the page. So, this is a good
 * place to define variables that are common to all instances of the plugin on a
 * page.
 */
var componentName = "wb-ctrycnt",
	selector = "[data-ctrycnt]",
	initEvent = "wb-init." + componentName,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, url;

		if ( elm ) {
			$elm = $( elm );
			url = $elm.data( "ctrycnt" );

			$.when( getCountry() ).then( function( countryCode ) {

				if ( countryCode === "" ) {

					// Leave default content since we couldn't find the country
					return;
				} else {

					// @TODO: Handle bad country values or any whitelist of countries.
				}

				url = url.replace( "{country}", countryCode.toLowerCase() );

				$elm.load( url, function() {

					// Identify that initialization has completed
					wb.ready( $elm, componentName );
				} );
			} );
		}
	},
	getCountry = function() {
		var dfd = $.Deferred(),
			countryCode = localStorage.getItem( "countryCode" );

		// Couldn"t find a value in the session
		if ( countryCode === null ) {

			// From https://github.com/aFarkas/webshim/blob/master/src/shims/geolocation.js#L89-L127
			$.ajax( {
				url: "https://freegeoip.net/json/",
				dataType: "jsonp",
				cache: true,
				jsonp: "callback",
				success: function( data ) {
					if ( data ) {
						countryCode = data.country_code;
						try {
							localStorage.setItem( "countryCode", countryCode );
						} catch ( error ) {
						}
					}

					dfd.resolve( countryCode );
				},
				error: function() {
					dfd.reject( "" );
				}
			} );
		} else {
			dfd.resolve( countryCode );
		}

		return dfd.promise();
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
