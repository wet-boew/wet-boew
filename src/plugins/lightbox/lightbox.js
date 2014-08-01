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
var componentName = "wb-lbx",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	setFocusEvent = "setfocus.wb",
	extendedGlobal = false,
	$document = wb.doc,
	idCount = 0,
	callbacks, i18n, i18nText,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			elmId;

		if ( elm ) {
			elmId = elm.id;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = componentName + "-id-" + idCount;
				idCount += 1;
				elm.id = elmId;
			}

			// read the selector node for parameters

			// Only initialize the i18nText and callbacks once
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

				callbacks = {
					open: function() {

						// TODO: Better if dealt with upstream by Magnific popup
						var $item = this.currItem,
							$content = this.contentContainer,
							$wrap = this.wrap,
							$buttons = $wrap.find( ".mfp-close, .mfp-arrow" ),
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

						$wrap.append( "<span tabindex='0' class='lbx-end wb-inv'></span>" );
					},
					change: function() {
						var $item = this.currItem,
							$content = this.contentContainer,
							$el, $bottomBar, $source, $target,
							description, altTitleId, altTitle;

						if ( $item.type === "image" ) {
							$el = $item.el;
							$target = $item.img;
							$bottomBar = $content.find( ".mfp-bottom-bar" );

							if ( $el ) {
								$source = $el.find( "img" );
								$target.attr( "alt", $source.attr( "alt" ) );

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
								$target.attr( "alt", $bottomBar.find( ".mfp-title" ).html() );
							}
						} else {
							$content
								.find( ".modal-title, h1" )
								.first()
								.attr( "id", "lbx-title" );
						}
					}
				};
			}

			// Load Magnific Popup dependency and bind the init event handler
			Modernizr.load({
				load: "site!deps/jquery.magnific-popup" + wb.getMode() + ".js",
				complete: function() {
					var elm = document.getElementById( elmId ),
						$elm = $( elm ),
						settings = {},
						firstLink;

					if ( !elm ) {
						return;
					}

					// Set the dependency i18nText only once
					if ( !extendedGlobal ) {
						$.extend( true, $.magnificPopup.defaults, i18nText );
						extendedGlobal = true;
					}

					// TODO: Add swipe support

					settings.callbacks = callbacks;

					if ( elm.nodeName.toLowerCase() !== "a" ) {
						settings.delegate = "a";
						firstLink = elm.getElementsByTagName( "a" )[ 0 ];

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

					// Extend the settings with data-wb-lbx then
					$elm.magnificPopup(
						$.extend(
							true,
							settings,
							window[ componentName ],
							wb.getData( $elm, componentName )
						)
					);

					// Identify that initialization has completed
					wb.ready( $elm, componentName );
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
			index = length - 2;
		} else if ( index === length - 1 ) {
			index = 0;
		}
		$focusable.eq( index ).trigger( setFocusEvent );
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

/*
 * Sends focus to the close button if focus moves beyond the Lightbox (Jaws fix)
 */
$document.on( "focus", ".lbx-end", function( event ) {
	event.preventDefault();
	$( this )
		.closest( ".mfp-wrap" )
			.find( ":focusable" )
				.eq( 0 )
					.trigger( setFocusEvent );

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Outside focus detection (for screen readers that exit the lightbox
// outside the normal means)
$document.on( "focusin", "body", function( event ) {

	if ( extendedGlobal && $.magnificPopup.instance.currItem &&
		$( event.target ).closest( ".mfp-wrap" ).length === 0 &&
		$( ".popup-modal-dismiss" ).length === 0 ) {

		// Close the popup
		$.magnificPopup.close();
	}
});

// Handler for clicking on a same page link within the overlay to outside the overlay
$document.on( "click vclick", ".mfp-wrap a[href^='#']", function( event ) {
	var which = event.which,
		eventTarget = event.target,
		href, $lightbox, linkTarget;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		$lightbox = $( eventTarget ).closest( ".mfp-wrap" );
		href = eventTarget.getAttribute( "href" );
		linkTarget = document.getElementById( href.substring( 1 ) );

		// Ignore same page links to within the overlay and modal popups
		if ( href.length > 1 && !$.contains( $lightbox[ 0 ], linkTarget ) ) {
			if ( $lightbox.find( ".popup-modal-dismiss" ).length === 0 ) {

				// Stop propagation of the click event
				if ( event.stopPropagation ) {
					event.stopImmediatePropagation();
				} else {
					event.cancelBubble = true;
				}

				// Close the overlay and set focus to the same page link
				$.magnificPopup.close();
				$( linkTarget ).trigger( setFocusEvent );
			} else {
				return false;
			}
		}
	}
});

// Event handler for closing a modal popup
$( document ).on( "click", ".popup-modal-dismiss", function( event ) {
	event.preventDefault();
	$.magnificPopup.close();
});

// Event handler for opening a popup without a link
$( document ).on( "open" + selector, function( event, items, modal, title ) {
	if ( event.namespace === componentName ) {
		var isGallery = items.length > 1,
			isModal = modal && !isGallery ? modal : false,
			titleSrc = title ? function() {
					return title[ $.magnificPopup.instance.index ];
				} : "title";

		event.preventDefault();
		$.magnificPopup.open({
			items: items,
			modal: isModal,
			gallery: {
				enabled: isGallery
			},
			image: {
				titleSrc: titleSrc
			},
			callbacks: callbacks
		});
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
