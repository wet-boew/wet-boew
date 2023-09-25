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
	allowOnDisableClass = "wb-disable-allow",
	allowedPlugins = [
		{
			selectors: "[data-wb-jsonmanager]",
			initEvent: "wb-jsonmanager"
		},
		{
			selectors: "[data-wb-postback]",
			initEvent: "wb-postback"
		},
		{
			selectors: [
				"[data-ajax-after]",
				"[data-ajax-append]",
				"[data-ajax-before]",
				"[data-ajax-prepend]",
				"[data-ajax-replace]",
				"[data-wb-ajax]"
			],
			initEvent: "wb-data-ajax"
		},
		{
			selectors: [
				"[data-json-after]",
				"[data-json-append]",
				"[data-json-before]",
				"[data-json-prepend]",
				"[data-json-replace]",
				"[data-json-replacewith]",
				"[data-wb-json]"
			],
			initEvent: "wb-data-json"
		}
	],

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
			param,
			noticeHeader = i18n( "disable-notice-h" ),
			noticeBody = i18n( "disable-notice" ),
			noticehtml = "<section",
			noticehtmlend = "</a>.</p></section>",
			canonicalUrl,
			canonicalLink;

		if ( elm ) {

			// Rebuild the query string
			for ( param in pageUrl.params ) {
				if ( param && Object.prototype.hasOwnProperty.call( pageUrl.params, param ) && param !== "wbdisable" ) {
					nQuery += param + "=" + pageUrl.params[ param ] + "&";
				}
			}

			try {
				if ( wb.isDisabled || wb.ie ) {
					$html.addClass( "wb-disable" );

					try {

						// Store preference for WET plugins and polyfills to be disabled in localStorage
						localStorage.setItem( "wbdisable", "true" );
					} catch ( e ) {

						/* swallow error */
					}

					// Trigger initialization of plugins that are needed in basic mode
					runAllowedPlugins();

					// Add canonical link if not already present
					if ( !document.querySelector( "link[rel=canonical]" ) ) {

						// Remove wbdisable from URL
						canonicalUrl = window.location.href.replace( /&?wbdisable=true/gi, "" ).replace( "?&", "?" ).replace( "?#", "#" );

						if ( canonicalUrl.indexOf( "?" ) === ( canonicalUrl.length - 1 ) ) {
							canonicalUrl = canonicalUrl.replace( "?", "" );
						}

						canonicalLink = document.createElement( "link" );
						canonicalLink.rel = "canonical";
						canonicalLink.href = canonicalUrl;

						document.head.appendChild( canonicalLink );
					}

					// Add notice and link to re-enable WET plugins and polyfills
					let significantLinkId = wb.getId();
					noticehtml = noticehtml + " class='container-fluid bg-warning text-center mrgn-tp-sm py-4'><h2 class='mrgn-tp-0'>" + noticeHeader + "</h2><p>" + noticeBody + "</p><p><a id='" + significantLinkId + "' rel='alternate' href='" + nQuery + "wbdisable=false'>" + i18n( "wb-enable" ) + noticehtmlend;
					$( elm ).after( noticehtml );
					document.querySelector( "#" + significantLinkId ).setAttribute( "property", "significantLink" );
					return true;
				} else {
					$html.addClass( "wb-enable" );

					if ( localStorage ) {

						// Store preference for WET plugins and polyfills to be enabled in localStorage
						localStorage.setItem( "wbdisable", "false" );
					}

					// Remove variable from URL
					var lc = window.location.href.replace( /&?wbdisable=false/gi, "" ).replace( "?&", "?" ).replace( "?#", "#" );
					if ( lc.indexOf( "?" ) === ( lc.length - 1 ) ) {
						lc = lc.replace( "?", "" );
					}
					window.history.replaceState( "", "", lc );
				}
			} catch ( error ) {

				/* swallow error */
			}

			// Append the Basic HTML version link version
			// Add link to disable WET plugins and polyfills
			wb.addSkipLink( i18n( "wb-disable" ), {
				href: nQuery + "wbdisable=true",
				rel: "alternate"
			}, false, true );

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	},

	// Trigger initialization of plugins that are needed in basic mode
	// TODO: Remove once basic initialization is implemented at the core level
	runAllowedPlugins = function() {
		allowedPlugins.forEach( allowedPlugin => {
			if ( typeof( allowedPlugin.selectors ) === "object" ) {
				allowedPlugin.selectors = allowedPlugin.selectors.join( "." + allowOnDisableClass + "," );
			}

			allowedPlugin.selectors = allowedPlugin.selectors + "." + allowOnDisableClass;

			$( allowedPlugin.selectors ).trigger( "wb-init." + allowedPlugin.initEvent );
		} );
	};

// Bind the events
$document.on( "timerpoke.wb", selector, init );

// Go through allowed plugins once again when content has been added dynamically
$document.on( "wb-contentupdated", function() {
	runAllowedPlugins();
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
