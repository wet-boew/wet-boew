/**
 * @title WET-BOEW Ajax Fetch [ ajax-fetch ]
 * @overview A basic AjaxLoader wrapper for WET-BOEW
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, wb ) {
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
	var caller = event.element,
		fetchOpts = event.fetch,
		fetchData;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === event.target ) {
		$.ajax( fetchOpts )
			.done(function( response, status, xhr ) {
				fetchData = {
					response: response,
					status: status,
					xhr: xhr
				};

				fetchData.pointer = $( "<div id='" + wb.guid() + "' />" )
										.append( typeof response === "string" ? response : "" );

				$( caller ).trigger({
					type: "ajax-fetched.wb",
					fetch: fetchData
				}, this );
			})
			.fail(function( xhr, status, error ) {
				$( caller ).trigger({
					type: "ajax-failed.wb",
					fetch: {
						xhr: xhr,
						status: status,
						error: error
					}
				}, this );
			}, this );
	}
});

})( jQuery, wb );
