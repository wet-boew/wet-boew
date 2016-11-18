/**
 * @title WET-BOEW JSON Fetch [ json-fetch ]
 * @overview Load and filter data from a JSON file
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
/*global jsonpointer */
( function( $, wb, window ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,
	component = "json-fetch",
	fetchEvent = component + ".wb",
	jsonCache = component + "cache",
	jsonCacheBacklog = component + "backlog",
	completeJsonFetch = function( callerId, response, status, xhr, selector ) {
		if ( selector ) {
			response = jsonpointer.get( response, selector );
		}

		$( "#" + callerId ).trigger( {
			type: "json-fetched.wb",
			fetch: {
				response: response,
				status: status,
				xhr: xhr
			}
		}, this );
	};

// Event binding
$document.on( fetchEvent, function( event ) {

	// TODO: Remove event.element in future versions
	var caller = event.element || event.target,
		fetchOpts = event.fetch,
		urlParts = fetchOpts.url.split( "#" ),
		url = urlParts[ 0 ],
		selector = urlParts[ 1 ] || false,
		callerId,
		uri = "json:" + url, cachedResponse;

	// Separate the URL from the filtering criteria
	if ( selector ) {
		fetchOpts.url = url;
	}

	// Filter out any events triggered by descendants
	if ( caller === event.target || event.currentTarget === event.target ) {

		Modernizr.load( {

			load: "site!deps/jsonpointer" + wb.getMode() + ".js",

			complete: function() {

				if ( !caller.id ) {
					caller.id = wb.getId();
				}
				callerId = caller.id;

				if ( !window[ jsonCache ] ) {
					window[ jsonCache ] = { };
					window[ jsonCacheBacklog ] = { };
				}

				if ( !fetchOpts.nocache ) {
					cachedResponse = window[ jsonCache ][ uri ];

					if ( cachedResponse ) {
						completeJsonFetch( callerId, cachedResponse, "success", undefined, selector );
						return;
					} else {
						if ( !window[ jsonCacheBacklog ][ uri ] ) {
							window[ jsonCacheBacklog ][ uri ] = [ ];
						} else {
							window[ jsonCacheBacklog ][ uri ].push( {
								"callerId": callerId,
								"selector": selector
							} );
							return;
						}
					}
				}

				$.ajax( fetchOpts )
					.done( function( response, status, xhr ) {
						var i, i_len, i_cache, backlog;
						if ( !fetchOpts.nocache ) {
							try {
								window[ jsonCache ][ uri ] = response;
							} catch ( error ) {
								return;
							}
						}

						completeJsonFetch( callerId, response, status, xhr, selector );

						if ( window[ jsonCacheBacklog ][ uri ] ) {
							backlog = window[ jsonCacheBacklog ][ uri ];

							i_len = backlog.length;

							for ( i = 0; i !== i_len; i += 1 ) {
								i_cache = backlog[ i ];
								completeJsonFetch( i_cache.callerId, response, status, xhr, i_cache.selector );
							}
						}

					} )
					.fail( function( xhr, status, error ) {
						$( "#" + callerId ).trigger( {
							type: "json-failed.wb",
							fetch: {
								xhr: xhr,
								status: status,
								error: error
							}
						}, this );
					}, this );
			}
		} );
	}
} );

} )( jQuery, wb, window );
