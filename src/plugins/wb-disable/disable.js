/**
 * @title WET-BOEW Disable Event
 * @overview Event creates the active offer for users that have disabled the event.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @gc
 */
( function( $, window, wb ) {
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
		var elm = wb.init( event, componentName, selector, true ),
			nQuery = "?",
			$html = wb.html,
			i18n = wb.i18n,
			pageUrl = wb.pageUrlParts,
			li, param,
			noticeHeader = i18n( "disable-notice-h" ),
			noticeBody = i18n( "disable-notice" ),
			noticehtml = "<section",
			noticehtmlend = "</a>.</p></section>";

		if ( elm ) {
			li = document.createElement( "li" );
			li.className = "wb-slc";

			// Rebuild the query string
			for ( param in pageUrl.params ) {
				if ( param && pageUrl.params.hasOwnProperty( param ) && param !== "wbdisable" ) {
					nQuery += param + "=" + pageUrl.params[ param ] + "&#38;";
				}
			}

			try {
				if ( wb.isDisabled || ( wb.ie && wb.ielt7 ) ) {
					$html.addClass( "wb-disable" );

					try {

						// Store preference for WET plugins and polyfills to be disabled in localStorage
						localStorage.setItem( "wbdisable", "true" );
					} catch ( e ) {}

					// Add notice and link to re-enable WET plugins and polyfills
					noticehtml = noticehtml + " class='alert alert-warning text-center'><h2>" + noticeHeader + "</h2><p>" + noticeBody + "</p><p><a rel='alternate' property='significantLink' href='" + nQuery + "wbdisable=false'>" + i18n( "wb-enable" ) + noticehtmlend;
					$( elm ).after( noticehtml );
					return true;
				} else {
					$html.addClass( "wb-enable" );

					if ( localStorage ) {

						// Store preference for WET plugins and polyfills to be enabled in localStorage
						localStorage.setItem( "wbdisable", "false" );
					}

					// Remove variable from URL
					var lc = window.location.href.replace( "wbdisable=false", "" ).replace( "?#", "#" );
					if ( lc.indexOf( "?" ) === ( lc.length - 1 ) ) {
						lc = lc.replace( "?", "" );
					}
					window.history.replaceState( "", "", lc );
				}
			} catch ( error ) {
			}

			// Append the Basic HTML version link version
			li.innerHTML = "<a class='wb-sl' rel='alternate' href='" + nQuery + "wbdisable=true'>" + i18n( "wb-disable" ) + "</a>";

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

} )( jQuery, window, wb );
