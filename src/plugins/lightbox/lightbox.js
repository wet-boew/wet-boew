/*
Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
plugin	:	Lightbox
author	:	@pjackson28
notes	:	Plugin that helps to build a photo gallery on a web page..
licence	:	wet-boew.github.io/wet-boew/License-en.html /
			wet-boew.github.io/wet-boew/Licence-fr.html
*/
(function( $, window, vapour ) {
	"use strict";

	var selector = ".wb-lightbox",
		$document = vapour.doc,
		i18n,
		i18nText,
		extendedGlobal = false,
		plugin = {
			init: function ( $elm ) {
				// all plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
				window._timer.remove( selector );

				// read the selector node for parameters
				var modeJS = vapour.getMode() + ".js";

				// Only initialize the i18nText once
				if ( !i18nText ) {
					i18n = window.i18n;
					i18nText = {
						tClose: i18n( "%close-esc" ),
						tLoading: i18n( "%loading" ),
						gallery: {
							tPrev: i18n( "%previous-left" ),
							tNext: i18n( "%next-left" ),
							tCounter: i18n( "%lb-current40" )
						},
						image: {
							tError: i18n( "%lb-img-error" ) + " (<a href=\"%url%\">)"
						},
						ajax: {
							tError: i18n( "%lb-xhr-error" ) + " (<a href=\"%url%\">)"
						}
					};
				}

				// Load Magnific Popup dependency and bind the init event handler
				window.Modernizr.load({
					load: "site!deps/jquery.magnific-popup" + modeJS,
					complete: function() {
						var settings = {},
							children;

						// Set the dependency i18nText only once
						if ( !extendedGlobal ) {
							$.extend( true, $.magnificPopup.defaults, i18nText );
							extendedGlobal = true;
						}

						// TODO: Add support for long description, aria-describedby and alternate title
						// TODO: How to support other options available in Magnific Popup
						// TODO: Ensure there is alt text on the resultant image
						// TODO: Fix AJAX support (works fine with "grunt server" but not locally)
						// TODO: Add WAI-ARIA and proper keyboard handling
						// TODO: Add swipe support
						
						// Is the element a single lightbox item or a group?
						// TODO: Add support for multiple non-gallery items of possibly mixed content
						if ( $elm[ 0 ].nodeName.toLowerCase() !== "a" ) {
							settings.delegate = "a";
							settings.type = "image";
							
							// Is the element a gallery?
							// TODO: Add support for ajax, inline and iframe galleries (also try to figure out mixed content galleries)
							if ( $elm.hasClass( "lb-gallery" ) || $elm.hasClass( "lb-hidden-gallery" ) ) {
								settings.gallery = {
									enabled: true,
								};
							}

							$elm.magnificPopup( settings );
						} else {
							children = $elm.children();
							if ( children.length !== 0 && children[ 0 ].nodeName.toLowerCase() === "img" ) {
								settings.type = "image";
							} else if ( $elm.attr( "href" ).slice( 0, 1 ) === "#" ) {
								settings.type = "inline";
							} else if ( $elm.hasClass( "lb-iframe" ) ) {
								settings.type = "iframe";
							} else {
								settings.type = "ajax";
							}
							$elm.magnificPopup( settings );
						}
					}
				});
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function ( event ) {
		// "this" is cached for all events to utilize
		var eventType = event.type,
			$elm = $( this );

		switch ( eventType ) {
		case "timerpoke":
			plugin.init.apply( this, [ $elm ] );
		}
		return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, vapour );
