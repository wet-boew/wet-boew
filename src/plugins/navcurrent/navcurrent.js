/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * WET-BOEW NavCurrent - Identify URL in a navigation system that matches current page URL or a URL in the breadcrumb trail
 * Call by applying .trigger( "navcurrent.wb", breadcrumb ) where the breadcrumb parameter is an optional object (DOM or jQuery)
 */
(function ( $, window, vapour ) {
	"use strict";

	var $document = vapour.doc,
		plugin = {
			breadcrumbLinksArray: null,
			breadcrumbLinksUrlArray: null,
			navClass: "wb-navcurrent",
			navCurrent: function( event, breadcrumb ) {
				var menuLinks = event.target.getElementsByTagName( "a" ),
					menuLinksArray = [],
					menuLinksUrlArray = [],
					windowLocation = window.location,
					pageUrl = windowLocation.hostname + windowLocation.pathname.replace( /^([^\/])/, "/$1" ),
					pageUrlQuery = windowLocation.search,
					match = false,
					len = menuLinks.length,
					i, j, link, linkHref, linkUrl, linkUrlLen, linkQuery, linkQueryLen,
					breadcrumbLinks, breadcrumbLinksArray, breadcrumbLinksUrlArray;

				// Try to find a match with the page Url and cache link + Url for later if no match found
				for ( i = 0; i !== len; i += 1 ) {
					link = menuLinks[ i ];
					linkHref = link.getAttribute( "href" );
					if ( linkHref !== null ) {
						if ( linkHref.length !== 0 && linkHref.slice( 0, 1 ) !== "#" ) {
							linkUrl = link.hostname + link.pathname.replace( /^([^\/])/, "/$1" );
							linkQuery = link.search;
							linkQueryLen = linkQuery.length;
							if ( pageUrl.slice( -linkUrl.length ) === linkUrl && ( linkQueryLen === 0 || pageUrlQuery.slice( -linkQueryLen ) === linkQuery ) ) {
								match = true;
								break;
							}
							menuLinksArray.push( link );
							menuLinksUrlArray.push( linkUrl );
						}
					}
				}

				// No page Url match found, try a breadcrumb link match instead
				if ( !match && breadcrumb ) {
					// Check to see if the data has been cached already
					if ( !plugin.breadcrumbLinksArray ) {
						// Pre-process the breadcrumb links
						breadcrumbLinksArray = [];
						breadcrumbLinksUrlArray = [];
						breadcrumbLinks = ( typeof breadcrumb.jquery !== "undefined" ? breadcrumb[0] : breadcrumb ).getElementsByTagName( "a" );
						len = breadcrumbLinks.length;
						for ( i = 0; i !== len; i += 1) {
							link = breadcrumbLinks[ i ];
							linkHref = link.getAttribute( "href" );
							if ( linkHref.length !== 0 && linkHref.slice( 0, 1 ) !== "#" ) {
								breadcrumbLinksArray.push( link );
								breadcrumbLinksUrlArray.push( link.hostname + link.pathname.replace( /^([^\/])/, "/$1" ) );
							}
						}
						
						// Cache the data in case of more than one execution (e.g., site menu + secondary navigation)
						plugin.breadcrumbLinksArray = breadcrumbLinksArray;
						plugin.breadcrumbLinksUrlArray = breadcrumbLinksUrlArray;
					} else {
						// Retrieve the cached data
						breadcrumbLinksArray = plugin.breadcrumbLinksArray;
						breadcrumbLinksUrlArray = plugin.breadcrumbLinksUrlArray;
					}
				
					// Try to match each breadcrumb link
					len = menuLinksArray.length;
					for ( i = 0; i !== len; i += 1 ) {
						link = menuLinksArray[ i ];
						linkUrl = menuLinksUrlArray[ i ];
						linkUrlLen = linkUrl.length;
						linkQuery = link.search;
						linkQueryLen = linkQuery.length;
						j = breadcrumbLinksArray.length - 1;
						for ( j = breadcrumbLinksArray.length - 1; j !== -1; j -= 1 ) {
							if ( breadcrumbLinksUrlArray[ j ].slice( -linkUrlLen ) === linkUrl && ( linkQueryLen === 0 || breadcrumbLinksArray[ j ].search.slice( -linkQueryLen ) === linkQuery ) ) {
								match = true;
								break;
							}
						}
						if ( match ) {
							break;
						}
					}
				}

				if ( match ) {
					link.className += " " + plugin.navClass;
				}
			}
		};

	// Bind the navcurrent event of the plugin
	$document.on( "navcurrent.wb", plugin.navCurrent );

})( jQuery, window, vapour );