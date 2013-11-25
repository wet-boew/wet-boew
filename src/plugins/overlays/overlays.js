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
var selector = ".wb-panel-l, .wb-panel-r, .wb-bar-t, .wb-bar-b, .wb-popup-mid, .wb-popup-full",
	headerClass = "overlay-hd",
	closeClass = "overlay-close",
	linkClass = "overlay-lnk",
	sourceLinks = {},
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
			overlayClose, closeIcon, closeText;

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

			// Add close button
			overlayClose = document.createElement( "a" );
			overlayClose.id = elm.id + "_0";
			overlayClose.href = "#" + overlayClose.id;
			overlayClose.className = closeClass;
			overlayClose.setAttribute( "role", "button" );

			closeIcon = document.createElement( "span" );
			closeIcon.className = "glyphicon glyphicon-remove";
			overlayClose.appendChild( closeIcon );

			closeText = document.createElement( "span" );
			closeText.className = "wb-inv";
			closeText.appendChild( document.createTextNode( " " + i18nText.close ) );
			overlayClose.appendChild( closeText );

			overlayHeader.appendChild( overlayClose );

			elm.setAttribute( "aria-hidden", "true" );
		}
	},

	closeOverlay = function( overlayId ) {
		var overlay = document.getElementById( overlayId );

		// Hides the overlay
		window.location.hash += "_0";
		overlay.setAttribute( "aria-hidden", "true" );

		// Returns focus to the source link for the overlay
		$( sourceLinks[ overlayId ] ).trigger( "setfocus.wb" );

		// Delete the source link reference
		delete sourceLinks[ overlayId ];
	};

$document.on( "timerpoke.wb keydown", selector, function( event ) {
	if ( event.type === "timerpoke" ) {
		init( event );
	} else if ( event.which === 27 ) {
		closeOverlay( event.currentTarget.id );
	}
});

// Handler for clicking on the close button of the overlay
$document.on( "click vclick", "." + closeClass, function( event ) {
	event.preventDefault();
	closeOverlay( event.currentTarget.parentNode.parentNode.id );
});

// Handler for clicking on a source link for the overlay
$document.on( "click vclick", "." + linkClass, function( event ) {
	var sourceLink = event.target,
		overlayId = sourceLink.hash.substring( 1 ),
		overlay = document.getElementById( overlayId );

	// Introduce a delay to prevent outside activity detection
	setTimeout(function() {

		// Stores the source link for the overlay
		sourceLinks[ overlayId ] = sourceLink;

		overlay.setAttribute( "aria-hidden", "false" );
	}, 1 );
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
		
				// Close the overlay
				closeOverlay( overlayId );
			}
		}
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );