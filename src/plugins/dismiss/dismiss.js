/**
 * @title WET-BOEW Dismiss plugin
 * @overview A dismissible notice plugin for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */
(function( $, window, document, wb ) {
"use strict";

if ( typeof(Storage) !== "undefined" ) {
	// Code for localStorage/sessionStorage.

	/*
	 * Init State
	 */
	$("details.alert").each(function (index) {
		if (index.attr("open")) {
			if (index.attr("id")) {
				localStorage.setItem("alert-dismiss-state-" + index.attr("id"), "open");
			}
		} else {
			if (index.attr("id")) {
				localStorage.setItem("alert-dismiss-state-" + index.attr("id"), "close");
			}
		}
	});

	/*
	 * On page load events
	 */
	for( var key in localStorage ) {

		$("details.alert").each(function (index) {

		});

		if ( localStorage.getItem(key) == "" )
		localStorage.getItem(key);
	}

	/*
	 * Event listeners for details elements
	 */


	// Retrieve
	localStorage.getItem("lastname");

} else {
	// Sorry! No Web Storage support..
}

})( jQuery, window, document, wb );
