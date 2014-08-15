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

	/*
	 * Init State
	 */
	$("details.alert").each(function(index) {

		localStorage.setItem("Test", "test");
		//alert(localStorage.getItem("Test"));
		
		console.log(this.attr("id"));
		//alert(index.attr("id"));

		/*
		if (localStorage.getItem("alert-dismiss-state-" + this.attr("id"))) {

			// Set open/closed state for existing localStorage keys
			if (localStorage.setItem("alert-dismiss-state-" + this.attr("id")), "open") {
				this.attr("open");
			} else if (localStorage.setItem("alert-dismiss-state-" + this.attr("id")), "closed") {
				this.removeAttr("open");
			}

		} else {

			// Set new localStorage values
			if (this.attr("open")) {
				if (this.attr("id")) {
					localStorage.setItem("alert-dismiss-state-" + this.attr("id"), "open");
				}
			} else {
				if (this.attr("id")) {
					localStorage.setItem("alert-dismiss-state-" + this.attr("id"), "closed");
				}
			}

		}
		*/

	});

	/*
	 * Event listeners for details elements
	 */

} else {
	// Sorry! No Web Storage support..
}

})( jQuery );
