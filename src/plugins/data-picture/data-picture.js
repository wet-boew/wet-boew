/*
Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
plugin	:	Picturefill
author	:	@patheard
notes	:	Wrapper for @scottjehl's Picturefill library
licence	:	wet-boew.github.io/wet-boew/License-en.html /
			wet-boew.github.io/wet-boew/Licence-fr.html
*/
(function( $, window, vapour ) {
	"use strict";
	var $document = vapour.doc,
		plugin = {
			events: false,
			selector: "[data-picture]",

			/**
			 * Initialize the plugin
			 */
			init: function() {
				window._timer.remove( plugin.selector );

				// Load picturefill dependencies and bind the init event handler
				window.Modernizr.load({
					test: window.matchMedia,
					nope: "site!deps/matchMedia.min.js",
					load: "site!deps/picturefill.min.js",
					complete: function() {
						if ( plugin.events === false ) {
							plugin.events = true;
							$document.on( "init.wb-data-picture", window.picturefill );
						}
						$document.trigger( "init.wb-data-picture" );
					}
				});
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", plugin.selector, plugin.init );

	// Add the timer poke to initialize the plugin
	window._timer.add( plugin.selector );

}( jQuery, window, vapour ));
