/*
 * @title Responsive overlay
 * @overview Provides multiple styles of overlays such as panels and pop-ups
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard, @pjackson28
 */
(function ( $, window, document, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-overlay",
	headerClass = "overlay-hd",
	closeClass = "overlay-close",
	linkClass = "overlay-lnk",
	sourceLinks = {},
	modalOpen = false,
	$document = vapour.doc,
	i18n, i18nText,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var elm = event.target,
			overlayHeader = elm.children[ 0 ],
			overlayClose;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === event.target ) {

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = window.i18n;
				i18nText = {
					close: i18n( "close-esc" )
				};
			}

			// if no overlay header then add one
			if ( !overlayHeader || overlayHeader.className.indexOf( headerClass ) === -1 ) {
				overlayHeader = document.createElement( "div" );
				overlayHeader.className = headerClass;

				elm.insertBefore( overlayHeader, elm.firstChild );
			}

			if ( elm.className.indexOf( "modal" ) === -1 ) {

				// Add close button
				overlayClose = "<a href='javascript:;' class='" + closeClass +
					"' role='button'><span class='glyphicon glyphicon-remove'></span>" +
					"<span class='wb-inv'> " + i18nText.close + "</span></a>";

				overlayHeader.appendChild( $( overlayClose )[ 0 ] );
			}

			elm.setAttribute( "aria-hidden", "true" );
		}
	},

	openOverlay = function( overlayId ) {
		var $overlay = $( "#" + overlayId );

		$overlay
			.addClass( "open" )
			.attr( "aria-hidden", "false" )
			.trigger( "setfocus.wb" );

		if ( $overlay.hasClass( "modal" ) ) {
			modalOpen = true;
		}
	},

	closeOverlay = function( overlayId ) {
		var $overlay = $( "#" + overlayId );

		$overlay
			.removeClass( "open" )
			.attr( "aria-hidden", "true" );

		if ( $overlay.hasClass( "modal" ) ) {
			modalOpen = false;
		}

		// Returns focus to the source link for the overlay
		$( sourceLinks[ overlayId ] ).trigger( "setfocus.wb" );

		// Delete the source link reference
		delete sourceLinks[ overlayId ];
	};

$document.on( "timerpoke.wb keydown open.wb-overlay close.wb-overlay", selector, function( event ) {
	var eventType = event.type,
		which = event.which,
		overlayId = event.currentTarget.id,
		overlay;

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
		if ( which === 27 && overlay.className.indexOf( "modal" ) === -1 ) {
			closeOverlay( overlayId );
		}
	}
});

// Handler for clicking on the close button of the overlay
$document.on( "click vclick", "." + closeClass, function( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		event.preventDefault();
		closeOverlay( event.currentTarget.parentNode.parentNode.id );
	}
});

// Handler for clicking on a source link for the overlay
$document.on( "click vclick", "." + linkClass, function( event ) {
	var which = event.which,
		sourceLink = event.target,
		overlayId = sourceLink.hash.substring( 1 );

	// Ignore middle/right mouse buttons and if modal open
	if ( !modalOpen && ( !which || which === 1 ) ) {
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
$document.on( "click vclick touchstart focusin", function ( event ) {
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
				!$.contains( overlay, eventTarget ) ) {

				if ( overlay.className.indexOf( "modal" ) !== -1 ) {
					return false;
				} else {

					// Close the overlay
					closeOverlay( overlayId );
				}
			}
		}
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );