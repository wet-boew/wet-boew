/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * tabbedinterface plugin
 */
/*jshint unused: false */
/*global console */
(function( $, win, doc ) {
	"use strict";
	var selector = ".wet-boew-tabbedinterface",
		init = function() {
			var pluginElements = $(this);
			win._timer.remove( selector );
			// your code here...
			console.log(this);
		};
	
	// Bind the init event of the plugin
	$(doc).on( "wb.timerpoke", selector, init );

	// Add the timer poke to initialize the plugin
	win._timer.add( selector );

}( jQuery, window, document ));