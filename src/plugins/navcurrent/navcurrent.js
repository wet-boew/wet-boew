/*
 * @title WET-BOEW NavCurrent
 * @overview Identify URL in a navigation system that matches current page URL or a URL in the breadcrumb trail. Call by applying .trigger( "navcurrent.wb", breadcrumb ) where the breadcrumb parameter is an optional object (DOM or jQuery)
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = vapour.doc,
	breadcrumbLinksArray, breadcrumbLinksUrlArray,
	navClass = "wb-navcurrent",

	/*
	 * We start the logic for what the plugin truly does
	 * For demonstration purposes lets display some text with an alert 
	 * @method otherEvent
	 * @param {jQuery Event} event The event that triggered this method call
	 * @param {jQuery DOM element | DOM element} breadcrumb Optional breadcrumb element
	 */
	navCurrent = function( event, breadcrumb ) {
		var menuLinks = event.target.getElementsByTagName( "a" ),
			menuLinksArray = [],
			menuLinksUrlArray = [],
			windowLocation = window.location,
			pageUrl = windowLocation.hostname + windowLocation.pathname.replace( /^([^\/])/, "/$1" ),
			pageUrlQuery = windowLocation.search,
			match = false,
			len = menuLinks.length,
			i, j, link, linkHref, linkUrl, linkUrlLen, linkQuery, linkQueryLen,
			_breadcrumbLinks, _breadcrumbLinksArray, _breadcrumbLinksUrlArray;

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
			if ( !_breadcrumbLinksArray ) {
				// Pre-process the breadcrumb links
				_breadcrumbLinksArray = [];
				_breadcrumbLinksUrlArray = [];
				_breadcrumbLinks = ( !breadcrumb.jquery ? breadcrumb[ 0 ] : breadcrumb ).getElementsByTagName( "a" );
				len = _breadcrumbLinks.length;
				for ( i = 0; i !== len; i += 1) {
					link = _breadcrumbLinks[ i ];
					linkHref = link.getAttribute( "href" );
					if ( linkHref.length !== 0 && linkHref.slice( 0, 1 ) !== "#" ) {
						_breadcrumbLinksArray.push( link );
						_breadcrumbLinksUrlArray.push( link.hostname + link.pathname.replace( /^([^\/])/, "/$1" ) );
					}
				}
				
				// Cache the data in case of more than one execution (e.g., site menu + secondary navigation)
				breadcrumbLinksArray = _breadcrumbLinksArray;
				breadcrumbLinksUrlArray = _breadcrumbLinksUrlArray;
			} else {
				// Retrieve the cached data
				_breadcrumbLinksArray = breadcrumbLinksArray;
				_breadcrumbLinksUrlArray = breadcrumbLinksUrlArray;
			}
		
			// Try to match each breadcrumb link
			len = menuLinksArray.length;
			for ( i = 0; i !== len; i += 1 ) {
				link = menuLinksArray[ i ];
				linkUrl = menuLinksUrlArray[ i ];
				linkUrlLen = linkUrl.length;
				linkQuery = link.search;
				linkQueryLen = linkQuery.length;
				j = _breadcrumbLinksArray.length - 1;
				for ( j = _breadcrumbLinksArray.length - 1; j !== -1; j -= 1 ) {
					if ( _breadcrumbLinksUrlArray[ j ].slice( -linkUrlLen ) === linkUrl && ( linkQueryLen === 0 || _breadcrumbLinksArray[ j ].search.slice( -linkQueryLen ) === linkQuery ) ) {
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
			link.className += " " + navClass;
		}
	};

// Bind the navcurrent event of the plugin
$document.on( "navcurrent.wb", navCurrent );

})( jQuery, window, vapour );