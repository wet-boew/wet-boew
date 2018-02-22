/**
 * @title WET-BOEW Overlay
 * @overview Provides multiple styles of overlays such as panels and pop-ups
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard, @pjackson28
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-overlay",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	closeClass = "overlay-close",
	linkClass = "overlay-lnk",
	ignoreOutsideClass = "outside-off",
	OverlayOpenFlag = "wb-overlay-dlg",
	initialized = false,
	sourceLinks = {},
	setFocusEvent = "setfocus.wb",
	$document = wb.doc,
	i18n, i18nText,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, footer, closeTextFtr, overlayCloseFtr, $header, closeText, overlayClose;

		if ( elm ) {
			$elm = $( elm );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					close: i18n( "close" ),
					colon: i18n( "colon" ),
					space: i18n( "space" ),
					esc: i18n( "esc-key" ),
					closeOverlay: i18n( closeClass )
				};
			}

			// One left and right panels add close button
			var isPanel = ( $elm.attr( "class" ).indexOf( "wb-panel" ) > -1 ) ? true : false,
				isPopup = ( $elm.attr( "class" ).indexOf( "wb-popup" ) > -1 ) ? true : false;
			if ( isPanel || isPopup ) {
				var hasFooter, closeClassFtr, spanTextFtr, buttonStyle = "";

				footer = $elm.find( ".modal-footer" )[ 0 ];
				hasFooter = ( footer && footer.length !== 0 ) ? true : false;
				closeClassFtr = ( $elm.hasClass( "wb-panel-l" ) ? "pull-right " : "pull-left " )  + closeClass;

				if ( hasFooter ) {
					spanTextFtr = footer.innerHTML + i18nText.space + i18nText.esc;
				} else {
					footer = document.createElement( "div" );
					footer.setAttribute( "class", "modal-footer" );
					spanTextFtr = i18nText.esc;
				}

				closeTextFtr = i18nText.close;
				spanTextFtr = spanTextFtr.replace( "'", "&#39;" );

				if ( isPopup ) {
					footer.style.border = "0";
				}

				overlayCloseFtr = "<button type='button' class='btn btn-sm btn-primary " + closeClassFtr +
					"' style='" + buttonStyle +
					"' title='" + closeTextFtr + " " + spanTextFtr + "'>" +
					closeTextFtr +
					"<span class='wb-inv'>" + spanTextFtr + "</span></button>";

				$( footer ).append( overlayCloseFtr );
				if ( !hasFooter ) {
					$elm.append( footer );
				}
			}

			// Add close button
			$header = $elm.find( ".modal-title" );
			if ( $header.length !== 0 ) {
				closeText = i18nText.close + i18nText.colon + i18nText.space +
					$header.text() + i18nText.space + i18nText.esc;
			} else {
				closeText = i18nText.closeOverlay;
			}
			closeText = closeText.replace( "'", "&#39;" );
			overlayClose = "<button type='button' class='mfp-close " + closeClass +
				"' title='" + closeText + "'>&#xd7;<span class='wb-inv'> " +
				closeText + "</span></button>";

			$elm.append( overlayClose );
			elm.setAttribute( "aria-hidden", "true" );

			// Identify that initialization has completed
			initialized = true;
			wb.ready( $elm, componentName );
		}
	},

	openOverlay = function( overlayId, noFocus ) {
		var $overlay = $( "#" + wb.jqEscape( overlayId ) );

		$overlay
			.addClass( "open" )
			.attr( "aria-hidden", "false" );

		if ( $overlay.hasClass( "wb-popup-full" ) || $overlay.hasClass( "wb-popup-mid" ) ) {
			$overlay.attr( "data-pgtitle", document.getElementsByTagName( "H1" )[ 0 ].textContent );
			$document.find( "body" ).addClass( OverlayOpenFlag );
		}

		if ( !noFocus ) {
			$overlay
				.scrollTop( 0 )
				.trigger( setFocusEvent );
		}

		// Register the overlay if it wasn't previously registered
		// (only required when opening through an event)
		if ( !sourceLinks[ overlayId ] ) {
			setTimeout( function() {
				sourceLinks[ overlayId ] = null;
			}, 1 );
		}
	},

	closeOverlay = function( overlayId, noFocus, userClosed ) {
		var $overlay = $( "#" + overlayId ),
			sourceLink = sourceLinks[ overlayId ];

		$overlay
			.removeClass( "open" )
			.attr( "aria-hidden", "true" );

		if ( $overlay.hasClass( "wb-popup-full" ) || $overlay.hasClass( "wb-popup-mid" ) ) {
			$document.find( "body" ).removeClass( OverlayOpenFlag );
		}

		if ( userClosed ) {
			$overlay.addClass( "user-closed" );
		}

		if ( !noFocus && sourceLink ) {

			// Returns focus to the source link for the overlay
			$( sourceLink ).trigger( setFocusEvent );
		}

		// Delete the source link reference
		delete sourceLinks[ overlayId ];
	};

$document.on( "timerpoke.wb " + initEvent + " keydown open" + selector +
" close" + selector, selector, function( event ) {

	var eventType = event.type,
		which = event.which,
		eventTarget = event.target,
		eventTurrentTarget = event.currentTarget,
		overlayId = eventTurrentTarget.id,
		overlay, $focusable, index, length;

	switch ( eventType ) {
	case "timerpoke":
	case "wb-init":
		init( event );
		break;

	case "open":
		if ( eventTurrentTarget === eventTarget ) {
			openOverlay( overlayId, event.noFocus );
		}
		break;

	case "close":
		if ( eventTurrentTarget === eventTarget ) {
			closeOverlay( overlayId, event.noFocus );
		}
		break;

	default:
		overlay = document.getElementById( overlayId );

		switch ( which ) {

		// Tab key
		case 9:

			// No special tab handling when ignoring outside activity
			if ( overlay.className.indexOf( ignoreOutsideClass ) === -1 ) {
				$focusable = $( overlay ).find( ":focusable:not([tabindex='-1'])" );
				length = $focusable.length;
				index = $focusable.index( event.target ) + ( event.shiftKey ? -1 : 1 );

				if ( index === -1 || index === length ) {
					event.preventDefault();
					$focusable.eq( index === -1 ? length - 1 : 0 )
						.trigger( setFocusEvent );
				}
			}
			break;

		// Escape key
		case 27:
			if ( !event.isDefaultPrevented() ) {
				closeOverlay( overlayId, false, true );
			}
			break;
		}
	}
} );

// Handler for clicking on the close button of the overlay
$document.on( "click vclick", "." + closeClass, function( event ) {
	var which = event.which;

	// Ignore if not initialized and middle/right mouse buttons
	if ( initialized && ( !which || which === 1 ) ) {
		closeOverlay(
			$( event.currentTarget ).closest( selector ).attr( "id" ),
			false,
			true
		);
	}
} );

// Handler for clicking on a source link for the overlay
$document.on( "click vclick keydown", "." + linkClass, function( event ) {
	var which = event.which,
		sourceLink = event.currentTarget,
		overlayId = sourceLink.hash.substring( 1 );

	// Ignore if not initialized and middle/right mouse buttons
	if ( initialized && ( !which || which === 1 || which === 32 ) ) {
		event.preventDefault();

		// Introduce a delay to prevent outside activity detection
		setTimeout( function() {

			// Stores the source link for the overlay
			sourceLinks[ overlayId ] = sourceLink;

			// Opens the overlay
			openOverlay( overlayId );
		}, 1 );
	}
} );

// Handler for clicking on a same page link within the overlay to outside the overlay
$document.on( "click vclick", selector + " a[href^='#']", function( event ) {
	var which = event.which,
		eventTarget = event.target,
		href, overlay, linkTarget;

	// Ignore if not initialized and middle/right mouse buttons
	if ( initialized && ( !which || which === 1 ) ) {
		overlay = $( eventTarget ).closest( selector )[ 0 ];
		href = eventTarget.getAttribute( "href" );
		linkTarget = document.getElementById( href.substring( 1 ) );

		// Ignore same page links to within the overlay
		if ( href.length > 1 && !$.contains( overlay, linkTarget ) ) {

			// Stop propagation of the click event
			if ( event.stopPropagation ) {
				event.stopImmediatePropagation();
			} else {
				event.cancelBubble = true;
			}

			// Close the overlay and set focus to the same page link
			closeOverlay( overlay.id, true );
			$( linkTarget ).trigger( setFocusEvent );
		}
	}
} );

// Outside activity detection
$document.on( "click vclick touchstart focusin", "body", function( event ) {
	var eventTarget = event.target,
		which = event.which,
		overlayId, overlay;

	// Ignore if not initialized and middle/right mouse buttons
	if ( initialized && ( !which || which === 1 ) ) {

		// Close any overlays with outside activity
		for ( overlayId in sourceLinks ) {
			overlay = document.getElementById( overlayId );
			if ( overlay && overlay.getAttribute( "aria-hidden" ) === "false" &&
				eventTarget.id !== overlayId &&
				overlay.className.indexOf( ignoreOutsideClass ) === -1 &&
				!$.contains( overlay, eventTarget ) ) {

				// Close the overlay
				closeOverlay( overlayId );
			}
		}
	}
} );

// Ensure any element in focus outside an overlay is visible
$document.on( "keyup", function( ) {
	var elmInFocus, elmInFocusRect, focusAreaBelow, focusAreaAbove,
		overlayId, overlay, overlayRect;

	// Ignore if not initialized
	if ( initialized ) {
		elmInFocus = document.activeElement;
		elmInFocusRect = elmInFocus.getBoundingClientRect();
		focusAreaBelow = 0;
		focusAreaAbove = window.innerHeight;

		// Ensure that at least one overlay is visible, and that the element in focus is not an overlay,
		// a child of an overlay, or the body element
		if ( $.isEmptyObject( sourceLinks ) || elmInFocus.className.indexOf( componentName ) !== -1 ||
			$( elmInFocus ).parents( selector ).length !== 0 || elmInFocus === document.body ) {
			return;
		}

		// Determine the vertical portion of the viewport that is not obscured by an overlay
		for ( overlayId in sourceLinks ) {
			overlay = document.getElementById( overlayId );
			if ( overlay && overlay.getAttribute( "aria-hidden" ) === "false" ) {
				overlayRect = overlay.getBoundingClientRect();
				if ( overlay.className.indexOf( "wb-bar-t" ) !== -1 ) {
					focusAreaBelow = Math.max( overlayRect.bottom, focusAreaBelow );
				} else if ( overlay.className.indexOf( "wb-bar-b" ) !== -1 ) {
					focusAreaAbove = Math.min( overlayRect.top, focusAreaAbove );
				}
			}
		}

		// Ensure the element in focus is visible
		// TODO: Find a solution for when there isn't enough page to scoll up or down
		if ( elmInFocusRect.top < focusAreaBelow ) {

			// Scroll down till the top of the element is visible
			window.scrollBy( 0, focusAreaBelow - elmInFocusRect.top );
		} else if ( elmInFocusRect.bottom > focusAreaAbove ) {

			// Scroll up till the bottom of the element is visible
			window.scrollBy( 0, elmInFocusRect.bottom - focusAreaAbove );
		}
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
