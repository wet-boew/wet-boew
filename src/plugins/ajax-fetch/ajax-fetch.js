/*
 * @title WET-BOEW Ajax Fetch [ ajax-fetch ]
 * @overview A basic AjaxLoader wrapper for WET-BOEW
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, vapour ) {
"use strict";

$.ajaxSettings.cache = false;

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = vapour.doc,

	/*
	 * @method generateSerial
	 * @param {integer} Length of the random string to be generated
	 */
	generateSerial = function( len ) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
			string_length = len,
			randomstring = "",
			counter = 0,
			letterOrNumber,
			newNum,
			rnum;

		for ( counter; counter !== string_length; counter += 1 ) {
			letterOrNumber = Math.floor( Math.random( ) * 2 );
			if ( letterOrNumber === 0 ) {
				newNum = Math.floor( Math.random( ) * 9 );
				randomstring += newNum;
			} else {
				rnum = Math.floor( Math.random( ) * chars.length );
				randomstring += chars.substring( rnum, rnum + 1 );
			}
		}
		return randomstring;
	};

// Event binding
$document.on( "ajax-fetch.wb", function( event ) {
	var caller = event.element,
		url = event.fetch,
		id;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === event.target ) {
		id = "wb" + ( generateSerial( 8 ) );

		$( "<div id='" + id + "' />" )
			.load( url, function() {
				$( caller )
					.trigger( {
						type: "ajax-fetched.wb",
						pointer: $( this )
					});
			});
	}
});

})( jQuery, vapour );
