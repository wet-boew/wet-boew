/**
 * @title WET-BOEW Lightbox
 * @overview Helps build a photo gallery on a web page.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var pluginName = "wb-lbx",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	extendedGlobal = false,
	$document = wb.doc,
	idCount = 0,
	i18n, i18nText,

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var elm = event.target,
			elmId = elm.id,
			modeJS;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === elm &&
			elm.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			elm.className += " " + initedClass;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = pluginName + "-id-" + idCount;
				idCount += 1;
				elm.id = elmId;
			}

			// read the selector node for parameters
			modeJS = wb.getMode() + ".js";

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					tClose: i18n( "overlay-close" ) + i18n( "space" ) + i18n( "esc-key" ),
					tLoading: i18n( "load" ),
					gallery: {
						tPrev: i18n( "prv-l" ),
						tNext: i18n( "nxt-r" ),
						tCounter: i18n( "lb-curr" )
					},
					image: {
						tError: i18n( "lb-img-err" ) + " (<a href=\"url%\">)"
					},
					ajax: {
						tError: i18n( "lb-xhr-err" ) + " (<a href=\"url%\">)"
					}
				};
			}

			// Load Magnific Popup dependency and bind the init event handler
			Modernizr.load({
				load: "site!deps/jquery.magnific-popup" + modeJS,
				complete: function() {
					var elm = document.getElementById( elmId ),
						$elm = $( elm ),
						settings = {},
						firstLink;

					// Set the dependency i18nText only once
					if ( !extendedGlobal ) {
						$.extend( true, $.magnificPopup.defaults, i18nText );
						extendedGlobal = true;
					}

					// TODO: Add swipe support

					settings.callbacks = {
						open: function() {

							// TODO: Better if dealt with upstream by Magnific popup
							var $item = this.currItem,
								$content = this.contentContainer,
								$buttons = this.wrap.find( ".mfp-close, .mfp-arrow" ),
								len = $buttons.length,
								i, button, $bottomBar;

							for ( i = 0; i !== len; i += 1 ) {
								button = $buttons[ i ];
								button.innerHTML += "<span class='wb-inv'> " + button.title + "</span>";
							}

							if ( $item.type === "image" ) {
								$bottomBar = $content.find( ".mfp-bottom-bar" ).attr( "id", "lbx-title" );
							} else {
								$content.attr( "role", "document" );
							}
						},
						change: function() {
							var $item = this.currItem,
								$content = this.contentContainer,
								$el, $bottomBar, $source, $target,
								description, altTitleId, altTitle;

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
									.attr( "id", "lbx-title" );
							}
						}
					};

					if ( elm.nodeName.toLowerCase() !== "a" ) {
						settings.delegate = "a";
						firstLink = elm.getElementsByTagName( "a" )[0];

						// Is the element a gallery?
						if ( elm.className.indexOf( "-gal" ) !== -1 ) {
							settings.gallery = {
								enabled: true
							};
						}
					} else {
						firstLink = elm;
					}

					if ( firstLink.getAttribute( "href" ).charAt( 0 ) === "#" ) {
						settings.type = "inline";
					} else if ( firstLink.className.indexOf( "lbx-iframe" ) !== -1 ) {
						settings.type = "iframe";
					} else if ( firstLink.getElementsByTagName( "img" ).length === 0 ) {
						settings.type = "ajax";
					} else {
						settings.type = "image";
					}

					if ( elm.className.indexOf( "lbx-modal" ) !== -1 ) {
						settings.modal = true;
					}

					// Extend the settings with data-wet-boew then
					$elm.magnificPopup(
						$.extend(
							true,
							settings,
							wb.getData( $elm, "wet-boew" )
						)
					);
				}
			});
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

$document.on( "keydown", ".mfp-wrap", function( event ) {
	var $elm, $focusable, index, length;

	// If the tab key is used and filter out any events triggered by descendants
	if ( extendedGlobal && event.which === 9 ) {
		event.preventDefault();
		$elm = $( this );
		$focusable = $elm.find( ":focusable" );
		length = $focusable.length;
		index = $focusable.index( event.target ) + ( event.shiftKey ? -1 : 1 );
		if ( index === -1 ) {
			index = length - 1;
		} else if ( index === length ) {
			index = 0;
		}
		$focusable.eq( index ).trigger( "setfocus.wb" );
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Event handler for closing a modal popup
$(document).on( "click", ".popup-modal-dismiss", function( event ) {
	event.preventDefault();
	$.magnificPopup.close();
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
