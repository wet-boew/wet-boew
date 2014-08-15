/**
 * @title WET-BOEW Dismiss plugin
 * @overview Dismiss alerts (details/summary)
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the event - meaning that they will be initialized once per page,
 * not once per instance of event on the page.
 */
var componentName = "wb-dismiss",
	selector = "details.alert",
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {

			if ( typeof(Storage) !== "undefined" ) {

				$("details.alert").each(function(index) {

					var details_id = $(this).attr("id");

					if (localStorage.getItem("alert-dismiss-state-" + details_id)) {

						// Set open/closed state for existing localStorage keys
						if (localStorage.getItem("alert-dismiss-state-" + details_id) === "open") {
							$(this).attr("open", "open");
						} else if (localStorage.getItem("alert-dismiss-state-" + details_id) === "closed") {
							$(this).removeAttr("open");
						}

					} else {

						// Set new localStorage values
						if ($(this).attr("open")) {
							if (details_id) {
								localStorage.setItem("alert-dismiss-state-" + details_id, "open");
							}
						} else {
							if (details_id) {
								localStorage.setItem("alert-dismiss-state-" + details_id, "closed");
							}
						}

					}

					// Set event listeners for details/summary open/close actions
					$(this).children().eq(0).click(function(index) {

						if ($(this).parent().attr("open")) {
							if (details_id) {
								$(this).removeAttr("open");
								localStorage.setItem("alert-dismiss-state-" + details_id, "closed");
							}
						} else {
							if (details_id) {
								$(this).attr("open");
								localStorage.setItem("alert-dismiss-state-" + details_id, "open");
							}
						}

					});

				});

			}

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	};

// Bind the events
$document.on( "timerpoke.wb", selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
