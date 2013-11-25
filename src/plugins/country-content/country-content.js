/*
 * @title WET-BOEW Country Content
 * @overview A basic AjaxLoader wrapper that inserts AJAXed in content based on a visitors country as resolved by http://freegeoip.net
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @nschonni
 */
(function( $, window, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once
 * per page, not once per instance of plugin on the page. So, this is a good
 * place to define variables that are common to all instances of the plugin on a
 * page.
 */
var $document = vapour.doc,
	selector = "[data-country-content]",

	/**
	 * Init runs once per plugin element on the page. There may be multiple
	 * elements. It will run more than once per plugin if you don"t remove the
	 * selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {

		var url = $elm.data( "countryContent" );

		// All plugins need to remove their reference from the timer in the init
		// sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		$.when( getCountry() ).then( function( countryCode ) {

			if ( countryCode === "") {
				// Leave default content since we couldn"t find the country
				return;
			} else {
				// @TODO: Handle bad country values or any whitelist of countries.
			}

			url = url.replace( "{country}", countryCode );

			$elm.removeAttr( "data-country-content" );

			$elm.load(url);
		});
	},
	getCountry = function() {
		var dfd = $.Deferred(),
			countryCode = localStorage.getItem( "countryCode" );

		// Couldn"t find a value in the session
		if ( countryCode === null ) {

			// From https://github.com/aFarkas/webshim/blob/master/src/shims/geolocation.js#L89-L127
			$.ajax({
				url: "http://freegeoip.net/json/",
				dataType: "jsonp",
				cache: true,
				jsonp: "callback",
				success: function( data ) {
					if( data ) {
						countryCode = data.country_code;
						localStorage.setItem( "countryCode", countryCode );
					}

					dfd.resolve( countryCode );
				},
				error: function(){
					dfd.reject( "" );
				}
			});
		} else {
			dfd.resolve( countryCode );
		}

		return dfd.promise();
	};

$document.on( "timerpoke.wb", selector, function( event ) {
	var eventTarget = event.target;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		init( $( eventTarget ) );
	}

	/*
	 * Since we are working with events we want to ensure that we are being
	 * passive about our control, so returning true allows for events to always
	 * continue
	 */
	return true;
} );

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
