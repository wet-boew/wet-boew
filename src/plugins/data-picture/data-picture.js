/*
 * @title WET-BOEW Data Picture
 * @overview Event driven port of the Picturefill library: https://github.com/scottjehl/picturefill
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = "[data-picture]",
	$document = vapour.doc,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		$elm.trigger( "picturefill.wb-data-picture" );
	},

	/*
	 * Updates the image displayed according to media queries.
	 * This is the logic ported from Picturefill.
	 * @method picturefill
	 * @param {DOM element} elm The element containing the images to be updated
	 */
	picturefill = function( elm ) {
		var matches = [],
			img = elm.getElementsByTagName( "img" )[ 0 ],
			sources = elm.getElementsByTagName( "span" ),
			i, len, matchedElm, media;

		// Loop over the data-media elements and find matching media queries
		for ( i = 0, len = sources.length; i !== len; i += 1 ) {
			media = sources[ i ].getAttribute( "data-media" );
			if ( !media || Modernizr.mq( media ) ) {
				matches.push( sources[ i ] );
			}
		}

		// If a media query match was found, add the image to the page
		if ( matches.length !== 0 ) {
			matchedElm = matches.pop();
			if ( !img ) {
				img = $document[ 0 ].createElement( "img" );
				img.alt = elm.getAttribute( "data-alt" );
			}
			img.src = matchedElm.getAttribute( "data-src" );
			matchedElm.appendChild( img );

		// No match and an image exists: delete it
		} else if ( img ) {
			img.parentNode.removeChild( img );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb picturefill.wb-data-picture", selector, function( event ) {
	var eventTarget = event.target,
		eventType = event.type;
		
	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		switch ( eventType ) {
		case "timerpoke":
			init( $( eventTarget ) );
			break;
		case "picturefill":
			picturefill( eventTarget );
			break;
		}
	}
});

// Handles window resize so images can be updated as new media queries match
$document.on( "text-resize.wb window-resize-width.wb window-resize-height.wb", function() {
	$( selector ).trigger( "picturefill.wb-data-picture" );
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
