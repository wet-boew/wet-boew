/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Favicon Plugin
 * @overview Provides the ability to add and update a page's favicons
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 *
 * This plugin provides the ability to add and update the favicon's on a web page.  Its default behaviour is to add a mobile favicon to web pages that have a favicon defined by a `<link rel="shortcut icon">` element.
 *
 * The mobile favicon's file name, rel, path and sizes can be set with data attributes on the `<link rel="shortcut icon">`:
 *
 * -**data-filename:** filename of the mobile favicon (defaults to "favicon-mobile.png").  This will be appended to the favicon's path.
 * -**data-path:** path to the mobile favicon (defaults to using the same path as the shortcut icon).
 * -**data-rel:** rel attribute of the mobile favicon (defaults to "apple-touch-icon").
 * -**data-sizes:** sizes attribute of the mobile favicon (defaults to "57x57 72x72 114x114 144x144 150x150").
 *
 * For example, the following overides the rel and file name attributes of the mobile favicon:
 *
 *     <link href="favion.ico" rel="shortcut icon" data-rel="apple-touch-icon-precomposed" data-filename="my-mobile-favicon.ico">
 */
(function ( $, window, vapour ) {

"use strict";

/**
 * @class Favicon
 */
var plugin = {
	selector: "link[rel='shortcut icon']",
	defaults: {
		filename: "favicon-mobile.png",
		path: null,
		rel: "apple-touch-icon",
		sizes: "57x57 72x72 114x114 144x144 150x150"
	},

	/**
	 * Initialize the plugin
	 * @method init
	 */
	init: function() {
		var $favicon = $( this ),
			settings = $.extend( {}, plugin.defaults, $favicon.data() );

		window._timer.remove( plugin.selector );
		$favicon.trigger( "mobile.wb-favicon", settings );
	},

	/**
	 * Adds, or updates, the mobile favicon on a page.  Mobile favicons are identified by the
	 * `apple` prefix in the `<link>` elements rel attribute.
	 * @method mobile
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {Object} data Key-value data object passed with the event
	 */
	mobile: function( event, data ) {
		var faviconPath,
			favicon = this,
			faviconMobile = $( "link[rel^='apple']" ),
			isFaviconMobile = faviconMobile.length !== 0;

		// Create the mobile favicon if it doesn't exist
		if ( !isFaviconMobile ) {
			faviconMobile = $( "<link rel='" + data.rel + "' sizes='" + data.sizes + "' class='wb-favicon'>" );
		}

		// Only add/update a mobile favicon that was created by the plugin
		if ( faviconMobile.hasClass( "wb-favicon" ) ) {
			faviconPath = data.path !== null ? data.path : plugin.getPath( favicon.getAttribute( "href" ) );
			faviconMobile.attr( "href", faviconPath + data.filename );

			if ( !isFaviconMobile ) {
				favicon.parentNode.insertBefore( faviconMobile[0], favicon );
			}
		}
	},

	/**
	 * Updates the the page's shortcut icon
	 * @method icon
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {Object} data Key-value data object passed with the event
	 */
	icon: function( event, data ) {
		var faviconPath = data.path !== null ? data.path : plugin.getPath( this.getAttribute( "href" ) );
		this.setAttribute( "href", faviconPath + data.filename );
	},

	/**
	 * Given a full file path, returns the path without the filename
	 * @method getPath
	 * @param {string} filepath The full path to file, including filename
	 * @returns {string} The path to the file
	 */
	getPath: function( filepath ) {
		return filepath.substring( 0, filepath.lastIndexOf( "/" ) + 1 );
	}
};

// Bind the plugin events
vapour.doc.on( "timerpoke.wb mobile.wb-favicon icon.wb-favicon", plugin.selector, function( event ) {
	switch ( event.type ) {
	case "timerpoke":
		plugin.init.apply( this, arguments );
		break;
	case "mobile":
		plugin.mobile.apply( this, arguments );
		break;
	case "icon":
		plugin.icon.apply( this, arguments );
		break;
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( plugin.selector );

}( jQuery, window, vapour ) );
