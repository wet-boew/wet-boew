/*
Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
plugin	:	Lightbox
author	:	@pjackson28
notes	:	Plugin that helps to build a photo gallery on a web page..
licence	:	wet-boew.github.io/wet-boew/License-en.html /
			wet-boew.github.io/wet-boew/Licence-fr.html
*/
(function( $, window, vapour, undefined ) {
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
                var mode = vapour.getMode();

                // Only initialize the i18nText once
                if ( i18nText === undefined ) {
					i18n = window.i18n;
                    i18nText = {
						tClose: i18n( "%close" ),
						tLoading: i18n( "%loading" ),
						gallery: {
							tPrev: i18n( "%lb-previous" ),
							tNext: i18n( "%lb-next" ),
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
					load: "site!deps/jquery.magnific-popup" + mode + ".js",
					complete: function() {
						// Set the dependency i18nText only once
						if ( !extendedGlobal ) {
							$.extend( true, $.magnificPopup.defaults, i18nText );
							extendedGlobal = true;
						}

						if ( $elm.hasClass( "popup-gallery" ) ) {
							$elm.magnificPopup( {
								type: "image",
								delegate: "a",
								gallery: {
									enabled: true,
									navigateByImgClick: true
								}
							} );
						} else {
							$elm.magnificPopup( {
								type: "image"
							} );
						}
					}
				});			
			}
		};

    // Bind the init event of the plugin
    $document.on( "timerpoke.wb", selector, function (event) {
        // "this" is cached for all events to utilize
        var eventType = event.type,
            $elm = $(this);

        switch (eventType) {
        case "timerpoke":
			plugin.init.apply( this, [ $elm ] );
        }
        return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
    });

    // Add the timer poke to initialize the plugin
    window._timer.add( selector );
})( jQuery, window, vapour );
