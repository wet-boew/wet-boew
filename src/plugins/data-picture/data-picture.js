/**
 * @title WET-BOEW Data Picture
 * @overview Event driven port of the Picturefill library: https://github.com/scottjehl/picturefill
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var imgClass,
	pluginName = "wb-pic",
	selector = "[data-pic]",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init." + pluginName,
	readyEvent = "wb-ready." + pluginName,
	picturefillEvent = "picfill." + pluginName,
	$document = wb.doc,

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {

		// Only initialize the element once
		if ( !$elm.hasClass( initedClass ) ) {
			wb.remove( selector );
			$elm.addClass( initedClass );

			// Store the class attribute of the plugin element.  It
			// will be added to the image created by the plugin.
			imgClass = $elm.data( "class" ) || "";

			$elm.trigger( picturefillEvent );
		}
	},

	/**
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
				img.className = imgClass;
			}
			img.src = matchedElm.getAttribute( "data-src" );
			matchedElm.appendChild( img );

			// Fixes bug with IE8 constraining the height of the image
			// when the .img-responsive class is used.
			if ( wb.ielt9 ) {
				img.removeAttribute( "width" );
				img.removeAttribute( "height" );
			}

		// No match and an image exists: delete it
		} else if ( img ) {
			img.parentNode.removeChild( img );
		}

		$( elm ).trigger( readyEvent );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + picturefillEvent, selector, function( event ) {
	var eventTarget = event.target,
		eventType = event.type;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		switch ( eventType ) {
		case "timerpoke":
		case "wb-init":
			init( $( eventTarget ) );
			break;
		case "picfill":
			picturefill( eventTarget );
			break;
		}
	}
});

// Handles window resize so images can be updated as new media queries match
$document.on( "txt-rsz.wb win-rsz-width.wb win-rsz-height.wb", function() {
	$( selector ).trigger( picturefillEvent );
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
