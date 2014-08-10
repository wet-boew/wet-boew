/**
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
var componentName = "wb-disable",
	selector = "#wb-tphp",
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			nQuery = "?",
			$html = wb.html,
			i18n = wb.i18n,
			pageUrl = wb.pageUrlParts,
			li, param;

		if ( elm ) {
			li = document.createElement( "li" );
			li.className = "wb-slc";

			// Rebuild the query string
			for ( param in pageUrl.params ) {
				if ( pageUrl.params.hasOwnProperty( param ) && param !== "wbdisable" ) {
					nQuery += param + "=" + pageUrl.params[ param ] + "&#38;";
				}
			}

			try {
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
			} catch ( error ) {
			}

			// Append the Basic HTML version link version
			li.innerHTML = "<a class='wb-sl' href='" + nQuery + "wbdisable=true'>" + i18n( "wb-disable" ) + "</a>";

			// Add link to disable WET plugins and polyfills
			elm.appendChild( li );

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	};

// Bind the events
$document.on( "timerpoke.wb", selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
