/*
 * @title Responsive overlay
 * @overview Provides multiple styles of overlays such as panels and pop-ups
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
(function ( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-panel-left, .wb-panel-right, .wb-bar-top, .wb-bar-bottom, .wb-pop-up-centred, .wb-pop-up-full-screen",
	headerClass = "overlay-header",
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
					close: i18n( "close" )
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
			overlayClose.className = "overlay-close";
			overlayClose.setAttribute( "role", "button" );

			closeIcon = document.createElement( "span" );
			closeIcon.className = "glyphicon glyphicon-remove";
			overlayClose.appendChild( closeIcon );

			closeText = document.createElement( "span" );
			closeText.className = "wb-inv";
			closeText.appendChild( document.createTextNode( " " + i18nText.close ) );
			overlayClose.appendChild( closeText );

			overlayHeader.appendChild( overlayClose );

			/*
			 *	@todo	Add ARIA attributes.
			 */
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, init );

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );