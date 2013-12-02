/**
 * @title Responsive overlay
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
var selector = ".wb-overlay",
	closeClass = "overlay-close",
	linkClass = "overlay-lnk",
	ignoreOutsideClass = "outside-off",
	sourceLinks = {},
	$document = wb.doc,
	i18n, i18nText,

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var elm = event.target,
			overlayClose;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === event.target ) {

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			wb.remove( selector );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					close: i18n( "overlay-close" ) + i18n( "space" ) + i18n( "esc-key" )
				};
			}

			// Add close button
			overlayClose = "<button class='mfp-close " + closeClass +
				"' title='" + i18nText.close + "'>×</button>";

			elm.appendChild( $( overlayClose )[ 0 ] );
			elm.setAttribute( "aria-hidden", "true" );
		}
	},

	openOverlay = function( overlayId, noFocus ) {
		var $overlay = $( "#" + overlayId );

		$overlay
			.addClass( "open" )
			.attr( "aria-hidden", "false" );

		if ( !noFocus ) {
			$overlay.trigger( "setfocus.wb" );
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
			$( sourceLink ).trigger( "setfocus.wb" );

			// Delete the source link reference
			delete sourceLinks[ overlayId ];
		}
	};

$document.on( "timerpoke.wb keydown open.wb-overlay close.wb-overlay", selector, function( event ) {
	var eventType = event.type,
		which = event.which,
		overlayId = event.currentTarget.id,
		overlay, $focusable, index, length;

	switch ( eventType ) {
	case "timerpoke":
		init( event );
		break;

	case "open":
		openOverlay( overlayId );
		break;

	case "close":
		closeOverlay( overlayId );
		break;

	default:
		overlay = document.getElementById( overlayId );

		switch ( which ) {

		// Tab key
		case 9:

			// No special tab handling when ignoring outside activity
			if ( overlay.className.indexOf( ignoreOutsideClass ) === -1 ) {
				event.preventDefault();
				$focusable = $( overlay ).find( ":focusable" );
				length = $focusable.length;
				index = $focusable.index( event.target ) + ( event.shiftKey ? -1 : 1 );
				if ( index === -1 ) {
					index = length - 1;
				} else if ( index === length ) {
					index = 0;
				}
				$focusable.eq( index ).trigger( "setfocus.wb" );
			}
			break;

		// Escape key
		case 27:
			closeOverlay( overlayId, false, true );
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
			$( event.currentTarget ).closest( ".wb-overlay" ).attr( "id" ),
			false,
			true
		);
	}
});

// Handler for clicking on a source link for the overlay
$document.on( "click vclick", "." + linkClass, function( event ) {
	var which = event.which,
		sourceLink = event.target,
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
			if ( overlay.getAttribute( "aria-hidden" ) === "false" &&
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
