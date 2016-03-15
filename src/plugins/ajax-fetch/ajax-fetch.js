/**
 * @title WET-BOEW Ajax Fetch [ ajax-fetch ]
 * @overview A basic AjaxLoader wrapper for WET-BOEW
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
( function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc;

// Event binding
$document.on( "ajax-fetch.wb", function( event ) {

	// TODO: Remove event.element in future versions
	var caller = event.element || event.target,
		fetchOpts = event.fetch,
		urlParts = fetchOpts.url.split( " " ),
		url = urlParts[ 0 ],
		urlHash = url.split( "#" )[ 1 ],
		selector = urlParts[ 1 ] || ( urlHash ? "#" + urlHash : false ),
		fetchData, callerId;

	// Separate the URL from the filtering criteria
	if ( selector ) {
		fetchOpts.url = urlParts[ 0 ];
	}

	// Filter out any events triggered by descendants
	if ( caller === event.target || event.currentTarget === event.target ) {

		if ( !caller.id ) {
			caller.id = wb.getId();
		}
		callerId = caller.id;

		$.ajax( fetchOpts )
			.done( function( response, status, xhr ) {
				var responseType = typeof response;

				if ( selector ) {
					response = $( "<div>" + response + "</div>" ).find( selector );
				}

				fetchData = {
					response: response,
					status: status,
					xhr: xhr
				};

				fetchData.pointer = $( "<div id='" + wb.getId() + "' data-type='" + responseType + "' />" )
										.append( responseType === "string" ? response : "" );

				$( "#" + callerId ).trigger( {
					type: "ajax-fetched.wb",
					fetch: fetchData
				}, this );
			} )
			.fail( function( xhr, status, error ) {
				$( "#" + callerId ).trigger( {
					type: "ajax-failed.wb",
					fetch: {
						xhr: xhr,
						status: status,
						error: error
					}
				}, this );
			}, this );
	}
} );

} )( jQuery, wb );
