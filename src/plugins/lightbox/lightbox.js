/**
 * @title WET-BOEW Lightbox
 * @overview Helps build a photo gallery on a web page.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, document, wb, undef ) {
"use strict";

	wb.LightboxPlugin = wb.BasePlugin.extend({
		componentName: "wb-lbx",
	  deps: ["site!deps/jquery.magnific-popup" + wb.getMode() + ".js"],
		setFocusEvent: "setfocus.wb",

		constructor: function() {
			this.base()
			wb.doc.on( "open" + this.selector, $.proxy( this.open, this ));
			wb.doc.on( "click", ".popup-modal-dismiss", $.proxy( this.dismiss, this ));
			wb.doc.on( "click vclick", ".mfp-wrap a[href^='#']", $.proxy( this.linkclick, this ));
			wb.doc.on( "focusin", "body", $.proxy( this.bodyfocus, this ));
			wb.doc.on( "focus", ".lbx-end", $.proxy( this.focusout, this ));
			wb.doc.on( "keydown", ".mfp-wrap", $.proxy( this.keydown, this ));
    },

		callbacks: {
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

				$wrap.append( "<span tabindex='0' class='lbx-end wb-inv'></span>" )
											.find( ".activate-open" )
											.trigger( "wb-activate" );

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

				// Provide the ability to filter the AJAX response HTML
				// by the URL hash or a selector
				// TODO: Should be dealt with upstream by Magnific Popup
				if ( selector ) {
					$response = $( "<div>" + mfpResponse.data + "</div>" ).find( selector );
				} else {
					$response = $( mfpResponse.data );
				}

				$response
					.find( ".modal-title, h1" )
						.first()
							.attr( "id", "lbx-title" );

				mfpResponse.data = $response;
			}
		},

		initonce: function() {
			$.extend( true, $.magnificPopup.defaults, this.i18nText );
		},

		getsettings: function( elm ) {
			return {
				callbacks: this.callbacks
			}
		},

		init: function ( elm ) {
			var settings = this.getsettings( elm );
			var firstLink;
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
					window[ this.componentName ],
					wb.getData( $( elm ), this.componentName )
				);
				$( elm ).magnificPopup(
					settings
				).data( "wbLbxFilter", settings.filter );
			}
		},

		openlbx: function ( items, isModal, isGallery, titleSrc, ajax ) {
			$.magnificPopup.open( $.extend(true, this.getsettings(), {
				items: items,
				modal: isModal,
				gallery: {
					enabled: isGallery
				},
				image: {
					titleSrc: titleSrc
				},
				ajax: ajax
			}) );
		},

		open: function ( event, items, modal, title, ajax ) {
			if ( event.namespace === this.componentName ) {
				var isGallery = items.length > 1,
					isModal = modal && !isGallery ? modal : false,
					titleSrc = title ? function() {
							return title[ $.magnificPopup.instance.index ];
						} : "title";

				event.preventDefault();

				// Ensure the dependencies are loaded first
				wb.doc.one( 'wb-ready' + this.selector, $.proxy( this.openlbx, this, items, isModal, isGallery, titleSrc, ajax ) );

				this.setup()
			}
		},

		dismiss: function ( event ) {
			event.preventDefault();
			$.magnificPopup.close();
		},

		linkclick: function ( event ) {
			var which = event.which,
				eventTarget = event.target,
				$lightbox, linkTarget;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				$lightbox = $( eventTarget ).closest( ".mfp-wrap" );
				linkTarget = document.getElementById( eventTarget.getAttribute( "href" ).substring( 1 ) );

				// Ignore same page links to within the overlay and modal popups
				if ( linkTarget && !$.contains( $lightbox[ 0 ], linkTarget ) ) {
					if ( $lightbox.find( ".popup-modal-dismiss" ).length === 0 ) {

						// Stop propagation of the click event
						if ( event.stopPropagation ) {
							event.stopImmediatePropagation();
						} else {
							event.cancelBubble = true;
						}

						// Close the overlay and set focus to the same page link
						$.magnificPopup.close();
						$( linkTarget ).trigger( this.setFocusEvent );
					} else {
						return false;
					}
				}
			}
		},

		bodyfocus: function ( event ) {
			if ( this.initialized && $.magnificPopup.instance.currItem &&
				$( event.target ).closest( ".mfp-wrap" ).length === 0 &&
				$( ".popup-modal-dismiss" ).length === 0 ) {

				// Close the popup
				$.magnificPopup.close();
			}
		},

		focusout: function ( event ) {
			event.preventDefault();
			$( event.target )
				.closest( ".mfp-wrap" )
					.find( ":focusable" )
						.eq( 0 )
							.trigger( this.setFocusEvent );

			/*
			 * Since we are working with events we want to ensure that we are being passive about our control,
			 * so returning true allows for events to always continue
			 */
			return true;
		},

		keydown: function ( event ) {
			var $elm, $focusable, index, length;

			// If the tab key is used and filter out any events triggered by descendants
			if ( this.initialized && event.which === 9 ) {
				event.preventDefault();
				$elm = $( event.target );
				$focusable = $elm.find( ":focusable" );
				length = $focusable.length;
				index = $focusable.index( event.target ) + ( event.shiftKey ? -1 : 1 );
				if ( index === -1 ) {
					index = length - 2;
				} else if ( index === length - 1 ) {
					index = 0;
				}
				$focusable.eq( index ).trigger( this.setFocusEvent );
			}

			/*
			 * Since we are working with events we want to ensure that we are being passive about our control,
			 * so returning true allows for events to always continue
			 */
			return true;
		},

		i18n: function ( i18n ) {
			return {
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
		},
	})

	var lbx = new wb.LightboxPlugin;

} )( jQuery, window, document, wb );
