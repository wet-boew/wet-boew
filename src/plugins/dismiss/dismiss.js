/**
 * @title WET-BOEW Dismiss plugin
 * @overview A dismissible notice plugin for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */
//(function( $, window, document, wb ) {
(function( $ ) {
"use strict";

if ( typeof(Storage) !== "undefined" ) {

	$("details.alert").each(function(index) {

		var details_id = $(this).attr("id");

		if (localStorage.getItem("alert-dismiss-state-" + details_id)) {

			// Set open/closed state for existing localStorage keys
			if (localStorage.getItem("alert-dismiss-state-" + details_id) === "open") {
				$(this).attr("open");
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

})( jQuery );
