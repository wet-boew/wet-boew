/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title data-picture Plugin
 * @overview Event driven port of the Picturefill library: https://github.com/scottjehl/picturefill
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function ( $, window, vapour ) {

"use strict";

var plugin = {
	selector: "[data-picture]",

	//Initialize the [data-picture] elements
	init: function() {
		window._timer.remove( plugin.selector );
		$( this ).trigger( "picturefill.wb-data-picture" );
	},

	//Handles window resize so images can be updated as new media queries match
	resize: function() {
		$( plugin.selector ).trigger( "picturefill.wb-data-picture" );
	},

	 //Updates the image displayed according to media queries.  This is the logic
	 //ported from Picturefill.
	picturefill: function() {
		var i, len, matchedElm, media,
			matches = [ ],
			img = this.getElementsByTagName( "img" )[ 0 ],
			sources = this.getElementsByTagName( "span" );

		// Loop over the data-media elements and find matching media queries
		for ( i = 0, len = sources.length; i < len; i++ ) {
			media = sources[ i ].getAttribute( "data-media" );
			if ( media === undefined || window.Modernizr.mq( media ) ) {
				matches.push( sources[ i ] );
			}
		}

		// If a media query match was found, add the image to the page
		if ( matches.length !== 0 ) {
			matchedElm = matches.pop( );
			if ( img === undefined ) {
				img = vapour.doc[ 0 ].createElement( "img" );
				img.alt = this.getAttribute( "data-alt" );
			}
			img.src = matchedElm.getAttribute( "data-src" );
			matchedElm.appendChild( img );

		// No match and an image exists: delete it
		} else if ( img !== undefined ) {
			img.parentNode.removeChild( img );
		}
	}
};

// Bind the plugin's events
vapour.doc.on( "timerpoke.wb picturefill.wb-data-picture", plugin.selector, function( event ) {
	switch ( event.type ) {
	case "timerpoke":
		plugin.init.apply( this, arguments );
		break;
	case "picturefill":
		plugin.picturefill.apply( this, arguments );
		break;
	}
});

vapour.doc.on( "text-resize.wb window-resize-width.wb window-resize-height.wb", plugin.resize );

// Add the timer poke to initialize the plugin
window._timer.add( plugin.selector );

}( jQuery, window, vapour ) );
