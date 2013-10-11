/*
 * @title WET-BOEW Disable Event
 * @overview Event creates the active offer for users that have disabled the event.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @gc
 */
(function( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the event - meaning that they will be initialized once per page,
 * not once per instance of event on the page. 
 */
var selector = "wb-tphp",
	$document = vapour.doc,


/*
 * createOffer runs once per plugin element on the page. 
 * @method createOffer
 */
createOffer = function( elm ) {
	var li = document.createElement( "li" ),
		pageUrl = vapour.pageUrlParts,
		nQuery = "?",
		param,
		$html = vapour.html,
		i18n = window.i18n;

	li.className = "wb-skip";
	
	for ( param in pageUrl.params ) { // Rebuild the query string
			if ( pageUrl.params.hasOwnProperty( param ) && param !== "wbdisable" ) {
				nQuery += param + "=" + pageUrl.params[ param ] + "&#38;";
			}
		}

		// TODO: Find better way than browser sniffing to single out IE6
		if ( vapour.wbDisable || ( vapour.ie && vapour.ielt7 ) ) {
			$html.addClass( "no-js wb-disable" );
			if ( localStorage ) {
				// Store preference for WET plugins and polyfills to be disabled in localStorage
				localStorage.setItem( "wbdisable", "true");
			}

			// Append the Standard version link
			li.innerHTML = "<a class='wb-skip-link' href='" + nQuery + "wbdisable=false'>" + i18n( "%wb-enable" ) + "</a>";
			elm.appendChild( li ); // Add link to re-enable WET plugins and polyfills
			return true;
		} else if ( localStorage ) {
			localStorage.setItem( "wbdisable", "false" ); // Store preference for WET plugins and polyfills to be enabled in localStorage
		}

		// Append the Basic HTML version link version
		li.innerHTML = "<a class='wb-skip-link' href='" + nQuery + "wbdisable=true'>" + i18n( "%wb-disable" ) + "</a>";
		elm.appendChild( li ); // Add link to disable WET plugins and polyfills
};

	
// Bind the events
$document.on( "disable.wb", function() {
	var topOfPage = document.getElementById(selector);
	if ( topOfPage ) {
		createOffer( topOfPage );
	}
	
});

})( jQuery, window, vapour );
