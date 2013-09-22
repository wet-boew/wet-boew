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
			selector: "[data-picture]",

			/**
			 * Initialize the plugin
			 */
			init: function() {
				var mode = vapour.getMode();
				window._timer.remove( plugin.selector );

				// Load picturefill dependencies and bind the init event handler
				window.Modernizr.load({
					test: window.matchMedia,
					nope: "site!deps/matchMedia" + mode + ".js",
					load: "site!deps/picturefill" + mode + ".js",
					complete: function() {
						$document.trigger( "picturefill.wb-data-picture" );
					}
				});
			},

			/**
			 * Invoke the picturefill library if it has been loaded
			 */
			picturefill: function() {
				if ( window.picturefill !== undefined ) {
					window.picturefill();
				}
			}
		};

	// Bind the plugin's events
	$document
		.on( "timerpoke.wb", plugin.selector, plugin.init)
		.on( "picturefill.wb-data-picture", plugin.picturefill );

	// Add the timer poke to initialize the plugin
	window._timer.add( plugin.selector );

}( jQuery, window, vapour ));
