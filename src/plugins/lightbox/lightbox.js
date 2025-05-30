/**
 * @title WET-BOEW Lightbox
 * @overview Helps build a photo gallery on a web page.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, DOMPurify, window, document, wb, undef ) {
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
	dependenciesLoadedEvent = "deps-loaded" + selector,
	modalHideSelector = "#wb-tphp, body > header, body > main, body > footer",
	$document = wb.doc,
	callbacks, i18n, i18nText,
	defaults = {

		// exclude 'times' from screen reader with aria-hidden span
		closeMarkup: "<button type='button' class='mfp-close'><span class='mfp-close' aria-hidden='true'>&times;</span><span class='wb-inv'>%title%</span></button>"
	},

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

			// Ensure the dependencies are loaded first
			$document.one( dependenciesLoadedEvent, function() {
				var elm = document.getElementById( elmId ),
					$elm = $( elm ),
					settings = {},
					firstLink;

				if ( !elm ) {
					return;
				}

				// TODO: Add swipe support

				settings.callbacks = callbacks;

				if ( elm.nodeName.toLowerCase() !== "a" ) {
					settings.delegate = "a:not(" + selector + "-skip)";
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

				if ( firstLink ) {
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
					if ( elm.className.indexOf( "lbx-ajax" ) !== -1 ) {
						settings.type = "ajax";
					}
					if ( elm.className.indexOf( "lbx-image" ) !== -1 ) {
						settings.type = "image";
					}
					if ( elm.className.indexOf( "lbx-inline" ) !== -1 ) {
						settings.type = "inline";
					}

					// Extend the settings with window[ "wb-lbx" ] then data-wb-lbx
					settings = $.extend(
						true,
						settings,
						window[ componentName ],
						wb.getData( $elm, componentName )
					);
					$elm.magnificPopup(
						settings
					).data( "wbLbxFilter", settings.filter );
				}

				// Identify that initialization has completed
				wb.ready( $elm, componentName );
			} );

			// Load dependencies as needed
			setup();
		}
	},

	/**
	 * @method setup
	 */
	setup = function() {

		// Only initialize the i18nText and callbacks once
		if ( !i18nText ) {
			i18n = wb.i18n;
			i18nText = {
				close: i18n( "close" ),
				oClose: i18n( "overlay-close" ),
				tClose: i18n( "close" ) + i18n( "space" ) + i18n( "overlay-close" ) + i18n( "space" ) + i18n( "esc-key" ),
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
						$container = $wrap.find( ".mfp-container" ),
						$containerParent = $container.parent(),
						$modal = $wrap.find( ".modal-dialog" ),
						$buttons = $wrap.find( ".mfp-arrow" ),
						len = $buttons.length,
						i, button;

					createCloseButton( $modal );

					$document.find( "body" ).addClass( "wb-modal" );
					$document.find( modalHideSelector ).attr( "aria-hidden", "true" );
					for ( i = 0; i !== len; i += 1 ) {
						button = $buttons[ i ];
						button.innerHTML += "<span class='wb-inv'> " + button.title + "</span>";
					}

					if ( $item.type === "image" ) {
						$content.find( ".mfp-bottom-bar" ).attr( "id", "lbx-title" );
					} else {
						$content.attr( "role", "document" );
					}

					this.contentContainer.attr( "data-pgtitle", document.getElementsByTagName( "H1" )[ 0 ].textContent );

					trapTabbing( $wrap );

					if ( !$containerParent.is( "dialog" ) ) {
						$container.wrap( "<dialog class='mfp-container' open='open'></dialog>" );
					} else {
						$containerParent.attr( "open", "open" );
					}
				},
				close: function() {
					$document.find( "body" ).removeClass( "wb-modal" );
					$document.find( modalHideSelector ).removeAttr( "aria-hidden" );
					this.wrap.find( "dialog" ).removeAttr( "open" );

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

					$content.attr( "aria-labelledby", "lbx-title" );
				},
				parseAjax: function( mfpResponse ) {
					var currItem = this.currItem,
						currEl = currItem.el,
						urlHash = currItem.src.split( "#" )[ 1 ],
						filter = currEl ? currEl.data( "wbLbxFilter" ) : undef,
						selector = filter || ( urlHash ? "#" + urlHash : false ),
						$response;

					// Sanitize the response
					mfpResponse.data = DOMPurify.sanitize( mfpResponse.data );

					// Provide the ability to filter the AJAX response HTML
					// by the URL hash or a selector
					// TODO: Should be dealt with upstream by Magnific Popup
					if ( selector ) {
						$response = $( "<div>" + mfpResponse.data + "</div>" ).find( selector );
					} else {
						$response = $( mfpResponse.data );
					}
					createCloseButton( $response );

					$response
						.find( ".modal-title, h1" )
						.first()
						.attr( "id", "lbx-title" );

					mfpResponse.data = $response;
				},
				ajaxContentAdded: function() {
					trapTabbing( this.wrap );
				}
			};
		}

		// Load Magnific Popup dependency and bind the init event handler
		Modernizr.load( {
			load: "site!deps/jquery.magnific-popup" + wb.getMode() + ".js",
			testReady: function() {
				return $.magnificPopup;
			},
			complete: function() {

				// Set the dependency i18nText only once
				$.extend( true, $.magnificPopup.defaults, i18nText, defaults );

				$document.trigger( dependenciesLoadedEvent );
			}
		} );
	},
	createCloseButton = function( $modal ) {
		if ( $modal !== null && $modal.hasClass( "modal-dialog" ) ) {
			var footer = $modal.find( ".modal-footer" ).first(),
				hasFooter = footer.length,
				hasButton = hasFooter && $( footer ).find( ".popup-modal-dismiss" ).length !== 0,
				closeClassFtr = "popup-modal-dismiss",
				closeTextFtr = i18nText.close,
				spanTextFtr = i18nText.oClose,
				overlayCloseFtr;

			if ( !hasButton ) {
				if ( !hasFooter ) {
					footer = document.createElement( "div" );
					footer.setAttribute( "class", "modal-footer" );
				}

				overlayCloseFtr = "<button type='button' class='btn btn-sm btn-primary pull-left " + closeClassFtr +
					"'>" +
					closeTextFtr +
					"<span class='wb-inv'>" + spanTextFtr + "</span></button>";

				$( footer ).append( overlayCloseFtr );
				if ( !hasFooter ) {
					$( footer ).insertAfter( $modal.find( ".modal-body" ) );
				}
			}
		}
	},
	trapTabbing = function( $wrap ) {

		$wrap.on( "keydown", function( e ) {
			if ( e.which === 9 ) {
				var tabbable = $wrap.find( ".mfp-container :tabbable" ),
					firstTabbable = tabbable.first()[ 0 ],
					lastTabbable = tabbable.last()[ 0 ],
					currentFocus = $( document.activeElement )[ 0 ];

				if ( !e.shiftKey && currentFocus === lastTabbable ) {
					e.preventDefault();
					firstTabbable.focus();
				} else if ( e.shiftKey && ( currentFocus === firstTabbable || currentFocus === $wrap[ 0 ] ) ) {
					e.preventDefault();
					lastTabbable.focus();
				}
			}
		} );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Handler for clicking on a same page link within the overlay to outside the overlay
$document.on( "click", ".mfp-wrap a[href^='#']", function( event ) {
	var which = event.which,
		eventTarget = event.currentTarget,
		$lightbox, linkTarget;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		$lightbox = $( eventTarget ).closest( ".mfp-wrap" );
		linkTarget = document.getElementById( eventTarget.getAttribute( "href" ).substring( 1 ) );

		// Ignore same page links to within the overlay
		if ( linkTarget && !$.contains( $lightbox[ 0 ], linkTarget ) ) {

			// Stop propagation of the click event
			if ( event.stopPropagation ) {
				event.stopImmediatePropagation();
			} else {
				event.cancelBubble = true;
			}

			// Close the overlay and set focus to the same page link
			$.magnificPopup.close();
			$( linkTarget ).trigger( setFocusEvent );
		}
	}
} );

// Event handler for closing a modal popup via the close button
$( document ).on( "click", ".popup-modal-dismiss", function( event ) {
	if ( !this.hasAttribute( "target" ) ) {
		event.preventDefault();
	}

	$.magnificPopup.close();
} );

// Event handler for closing a modal popup via the Escape key
$( document ).on( "keydown", ".mfp-wrap:not(.mfp-close-btn-in)", function( event ) {

	// If the Escape key was pressed...
	if ( event.key === "Escape" ) {
		const closeButtons = event.currentTarget.querySelectorAll( ".popup-modal-dismiss" );

		// Trigger a "fake" click on the last close button
		// Notes:
		// -Allows Escape key presses to "piggyback" on additional functionality in close button click handlers (such as preventDefault and the session timeout plugin's confirm method)
		// -Targets the last close button link to accomodate plugins that use multiple close buttons (such as exit script)... the last button is more likely to represent no in those scenarios
		$( closeButtons[ closeButtons.length - 1 ] ).trigger( "click" );
	}
} );

// Event handler for opening a popup via a button link and the spacebar key
$( document ).on( "keydown", "." + componentName, function( event ) {
	const sourceLink = event.currentTarget;

	// If the link contains a role="button" attribute and the spacebar key was pressed...
	if ( sourceLink.getAttribute( "role" ) === "button" && event.key === " " ) {

		// Don't scroll down (typical spacebar behaviour)
		event.preventDefault();

		// Trigger a "fake" click on the button link
		$( sourceLink ).trigger( "click" );
	}
} );

// Event handler for opening a popup without a link
$( document ).on( "open" + selector, function( event, items, modal, title, ajax ) {
	if ( event.namespace === componentName ) {
		var isGallery = items.length > 1,
			isModal = modal && !isGallery ? modal : false,
			titleSrc = title ? function() {
				return title[ $.magnificPopup.instance.index ];
			} : "title";

		event.preventDefault();

		// Ensure the dependencies are loaded first
		$document.one( dependenciesLoadedEvent, function() {
			$.magnificPopup.open( {
				items: items,
				modal: isModal,
				gallery: {
					enabled: isGallery
				},
				image: {
					titleSrc: titleSrc
				},
				callbacks: callbacks,
				ajax: ajax
			} );

			wb.ready( undef, componentName );
		} );

		// Load dependencies as needed
		setup();
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, DOMPurify, window, document, wb );
