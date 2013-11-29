/*
 * @title WET-BOEW Disable Event
 * @overview Event creates the active offer for users that have disabled the event.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @gc
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the event - meaning that they will be initialized once per page,
 * not once per instance of event on the page.
 */
var selector = "#wb-tphp",
	$document = wb.doc,

	/*
	 * createOffer runs once per plugin element on the page.
	 * @method createOffer
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	createOffer = function( event ) {
		var elm = event.target,
			nQuery = "?",
			$html = wb.html,
			i18n = window.i18n,
			pageUrl = wb.pageUrlParts,
			li, param;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {

			// Let remove ourselves from the queue we only run once
			wb.remove( selector );

			li = document.createElement( "li" );
			li.className = "wb-slc";

			// Rebuild the query string
			for ( param in pageUrl.params ) {
				if ( pageUrl.params.hasOwnProperty( param ) && param !== "wbdisable" ) {
					nQuery += param + "=" + pageUrl.params[ param ] + "&#38;";
				}
			}

			if ( wb.isDisabled || ( wb.ie && wb.ielt7 ) ) {
				$html.addClass( "no-js wb-disable" );
				if ( localStorage ) {

					// Store preference for WET plugins and polyfills to be disabled in localStorage
					localStorage.setItem( "wbdisable", "true");
				}

				// Append the Standard version link
				li.innerHTML = "<a class='wb-sl' href='" + nQuery + "wbdisable=false'>" + i18n( "wb-enable" ) + "</a>";

				// Add link to re-enable WET plugins and polyfills
				elm.appendChild( li );
				return true;
			} else if ( localStorage ) {

				// Store preference for WET plugins and polyfills to be enabled in localStorage
				localStorage.setItem( "wbdisable", "false" );
			}

			// Append the Basic HTML version link version
			li.innerHTML = "<a class='wb-sl' href='" + nQuery + "wbdisable=true'>" + i18n( "wb-disable" ) + "</a>";
			elm.appendChild( li ); // Add link to disable WET plugins and polyfills
		}
	};

// Bind the events
$document.on( "timerpoke.wb", selector, createOffer );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
