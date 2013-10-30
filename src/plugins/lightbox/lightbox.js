/*
 * @title WET-BOEW Lightbox
 * @overview Helps build a photo gallery on a web page.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-lightbox",
	$document = vapour.doc,
	i18n, i18nText,
	extendedGlobal = false,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( _elm, $elm ) {
		// read the selector node for parameters
		var modeJS = vapour.getMode() + ".js";

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = window.i18n;
			i18nText = {
				tClose: i18n( "%close-esc" ),
				tLoading: i18n( "%loading" ),
				gallery: {
					tPrev: i18n( "%prv-l" ),
					tNext: i18n( "%nxt-r" ),
					tCounter: i18n( "%lb-curr" )
				},
				image: {
					tError: i18n( "%lb-img-err" ) + " (<a href=\"%url%\">)"
				},
				ajax: {
					tError: i18n( "%lb-xhr-err" ) + " (<a href=\"%url%\">)"
				}
			};
		}

		// Load Magnific Popup dependency and bind the init event handler
		window.Modernizr.load({
			load: "site!deps/jquery.magnific-popup" + modeJS,
			complete: function() {
				var settings = {},
					firstLink;

				// Set the dependency i18nText only once
				if ( !extendedGlobal ) {
					$.extend( true, $.magnificPopup.defaults, i18nText );
					extendedGlobal = true;
				}

				// TODO: How to support other options available in Magnific Popup
				// TODO: Fix AJAX support (works fine with "grunt connect watch" but not locally)
				// TODO: Fix visible focus and hidden text for buttons
				// TODO: Add swipe support
				// TODO: Should support be added for multiple non-gallery items of possibly mixed content? Would come at a performance code.

				settings.callbacks = {
					open: function() {

						// TODO: Better if dealt with upstream by Magnific popup
						var $item = this.currItem,
							$content = this.contentContainer,
							$bottomBar;
						
						this.wrap.attr({
							"role": "dialog",
							"aria-live": "polite",
							"aria-labelledby": "lb-title",
						});
						
						if ( $item.type === "image" ) {
							$bottomBar = $content.find( ".mfp-bottom-bar" ).attr( "id", "lb-title" );

							// Wrap image and bottom bar in figure and figcaption as needed
							$item.img.add( $bottomBar ).wrapAll( "<figure/>" );
							$bottomBar.wrap( "<figcaption/>" );
						} else {
							$content.attr( "role", "document" );
						}
					},
					change: function() {
						var $item = this.currItem,
							$content = this.contentContainer,
							$el, $bottomBar, $source, $target, description, altTitleId, altTitle;

						// TODO: Better if dealt with upstream by Magnific Popup
						if ( $item.type === "image" ) {
							$el = $item.el;
							$source = $el.find( "img" );
							$target = $item.img.attr( "alt", $source.attr( "alt" ) );
							$bottomBar = $content.find( ".mfp-bottom-bar" );

							// Replicate aria-describedby if it exists
							description = $source.attr( "aria-describedby" );
							if ( description ) {
								$target.attr( "aria-describedby", description );
							}

							// Replicate longdesc if it exists
							description = $source.attr( "longdesc" );
							if ( description ) {
								$target.attr( "longdesc", description );
							}
							
							// Handle alternate titles
							altTitleId = $el.attr( "data-title" );
							if ( altTitleId ) {
								altTitle = document.getElementById( altTitleId );
								if ( altTitle !== null ) {
									$bottomBar.find( ".mfp-title" ).html( altTitle.innerHTML );
								}
							}
						} else {
							$content
								.find( ".modal-title, h1" )
								.first()
								.attr( "id", "lb-title" );
						}
					}
				};
				
				if ( _elm.nodeName.toLowerCase() !== "a" ) {
					settings.delegate = "a";
					firstLink = _elm.getElementsByTagName( "a" )[0];

					// Is the element a gallery?
					// TODO: Should we support mixed content galleries? Could come at a performance cost and not very usable unless a hidden gallery (since always goes to first item).
					if ( _elm.className.indexOf( "-gallery" ) !== -1 ) {
						settings.gallery = {
							enabled: true,
						};
					}
				} else {
					firstLink = _elm;
				}

				
				if ( firstLink.getAttribute( "href" ).charAt( 0 ) === "#" ) {
					settings.type = "inline";
				} else if ( firstLink.className.indexOf( "lb-iframe" ) !== -1 ) {
					settings.type = "iframe";
				} else if ( firstLink.getElementsByTagName( "img" ).length === 0 ) {
					settings.type = "ajax";
				} else {
					settings.type = "image";
				}

				$elm.magnificPopup( settings );
			}
		});
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function() {
	init( this, $( this ) );

	// since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	return true;
});

$document.on( "keydown", ".mfp-wrap", function( event ) {
	var eventTarget = event.target,
		$elm;

	// If the tab key is used
	if ( event.which === 9 ) {
		if ( event.shiftKey ) {
			if ( eventTarget.className.indexOf("mfp-wrap") !== -1 ) {
				$( this ).find( ":focusable" ).last().trigger( "focus.wb" );
				return false;
			}
		} else {
			$elm = $( this );
			if ( $elm.find( ":focusable" ).last().is( $( eventTarget ) ) ) {
				$elm.trigger( "focus.wb" );
				return false;
			}
		}
	}

	// since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );
