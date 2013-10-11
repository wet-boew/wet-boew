/*
 * @title WET-BOEW Focus
 * @overview User agent safe way of assigning focus to an element
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function ( $, vapour ) {
	"use strict";

	/* 
	 * Variable and function definitions. 
	 * These are global to the plugin - meaning that they will be initialized once per page,
	 * not once per instance of plugin on the page. So, this is a good place to define
	 * variables that are common to all instances of the plugin on a page.
	 */
	var $document = vapour.doc,

		/*
		 * Assigns focus to an element
		 * @method test
		 * @param {jQuery Event} event The event that triggered this method call
		 */
		focus = function ( event ) {
			setTimeout( function () {
				return $( event.target ).focus();
			}, 0 );
		};

	// Bind the focus event
	$document.on( "focus.wb", focus );

} )( jQuery, vapour );
