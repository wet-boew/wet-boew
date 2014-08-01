/**
 * @title WET-BOEW Overlay
 * @overview Provides multiple styles of overlays such as panels and pop-ups
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard, @pjackson28
 */
(function( $, window, document, wb ) {
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
			$elm, $header, closeText, overlayClose;

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

			// Add close button
			$header = $elm.find( ".modal-title" );
			if ( $header.length !== 0 ) {
				closeText = i18nText.close + i18nText.colon + i18nText.space +
					$header.text() + i18nText.space + i18nText.esc;
			} else {
				closeText = i18nText.closeOverlay;
			}
			closeText = closeText.replace( "'", "&#39;" );
			overlayClose = "<button class='mfp-close " + closeClass +
				"' title='" + closeText + "'>&#xd7;<span class='wb-inv'> " +
				closeText + "</span></button>";

			$elm.append( overlayClose );
			elm.setAttribute( "aria-hidden", "true" );

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	},

	openOverlay = function( overlayId, noFocus ) {
		var $overlay = $( "#" + overlayId );

		$overlay
			.addClass( "open" )
			.attr( "aria-hidden", "false" );

		if ( !noFocus ) {
			$overlay
				.scrollTop( 0 )
				.trigger( setFocusEvent );
		}

		// Register the overlay if it wasn't previously registered
		// (only required when opening through an event)
		if ( !sourceLinks[ overlayId ] ) {
			setTimeout(function() {
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

		if ( userClosed ) {
			$overlay.addClass( "user-closed" );
		}

		if ( !noFocus && sourceLink ) {

			// Returns focus to the source link for the overlay
			$( sourceLink ).trigger( setFocusEvent );

			// Delete the source link reference
			delete sourceLinks[ overlayId ];
		}
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
});

// Handler for clicking on the close button of the overlay
$document.on( "click vclick", "." + closeClass, function( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		closeOverlay(
			$( event.currentTarget ).closest( selector ).attr( "id" ),
			false,
			true
		);
	}
});

// Handler for clicking on a source link for the overlay
$document.on( "click vclick", "." + linkClass, function( event ) {
	var which = event.which,
		sourceLink = event.currentTarget,
		overlayId = sourceLink.hash.substring( 1 );

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		event.preventDefault();

		// Introduce a delay to prevent outside activity detection
		setTimeout(function() {

			// Stores the source link for the overlay
			sourceLinks[ overlayId ] = sourceLink;

			// Opens the overlay
			openOverlay( overlayId );
		}, 1 );
	}
});

// Handler for clicking on a same page link within the overlay to outside the overlay
$document.on( "click vclick", selector + " a[href^='#']", function( event ) {
	var which = event.which,
		eventTarget = event.target,
		href, overlay, linkTarget;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
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
});

// Outside activity detection
$document.on( "click vclick touchstart focusin", "body", function( event ) {
	var eventTarget = event.target,
		which = event.which,
		overlayId, overlay;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {

		// Close any overlays with outside activity
		for ( overlayId in sourceLinks ) {
			overlay = document.getElementById( overlayId );
			if ( overlay !== null && overlay.getAttribute( "aria-hidden" ) === "false" &&
				eventTarget.id !== overlayId &&
				overlay.className.indexOf( ignoreOutsideClass ) === -1 &&
				!$.contains( overlay, eventTarget ) ) {

				// Close the overlay
				closeOverlay( overlayId );
			}
		}
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
