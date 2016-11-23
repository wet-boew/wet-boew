/**
 * @title WET-BOEW Favicon Plugin
 * @overview Provides the ability to add and update a page's favicons
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 *
 * This plugin provides the ability to add and update the favicon's on a web page. Its default behaviour is to add a mobile favicon to web pages that have a favicon defined by a `<link rel='icon'>` element.
 *
 * The mobile favicon's file name, rel, path and sizes can be set with data attributes on the `<link rel='icon'/>`:
 *
 * -**data-filename:** filename of the mobile favicon (defaults to "favicon-mobile.png"). This will be appended to the favicon's path.
 * -**data-path:** path to the mobile favicon (defaults to using the same path as the shortcut icon).
 * -**data-rel:** rel attribute of the mobile favicon (defaults to "apple-touch-icon").
 * -**data-sizes:** sizes attribute of the mobile favicon (defaults to "57x57 72x72 114x114 144x144 150x150").
 *
 * For example, the following overides the rel and file name attributes of the mobile favicon:
 *
 *     <link href="favion.ico" rel='icon' data-rel="apple-touch-icon-precomposed" data-filename="my-mobile-favicon.ico"/>
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-favicon",
	selector = "link[rel='icon']",
	initEvent = "wb-init." + componentName,
	updatedEvent = "wb-updated." + componentName,
	mobileEvent = "mobile." + componentName,
	iconEvent = "icon." + componentName,
	$document = wb.doc,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		filename: "favicon-mobile.png",
		path: null,
		rel: "apple-touch-icon",
		sizes: "57x57 72x72 114x114 144x144 150x150"
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector, true ),
			$favicon, settings;

		if ( elm ) {
			$favicon = $( elm );

			// Merge default settings with overrides from the selected plugin element.
			settings = $.extend( {}, defaults, $favicon.data() );

			$favicon.trigger( mobileEvent, settings );

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	},

	/**
	 * Adds, or updates, the mobile favicon on a page. Mobile favicons are identified by the
	 * `apple` prefix in the `<link>` elements rel attribute.
	 * @method mobile
	 * @param {DOM element} favicon Favicon element
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {Object} data Key-value data object passed with the event
	 */
	mobile = function( favicon, event, data ) {
		var faviconPath,
			faviconMobile = $( "link[rel^='apple']" ),
			isFaviconMobile = faviconMobile.length !== 0;

		// Create the mobile favicon if it doesn't exist
		if ( !isFaviconMobile ) {
			faviconMobile = $( "<link rel='" + data.rel + "' sizes='" + data.sizes + "' class='" + componentName + "'/>" );
		}

		// Only add/update a mobile favicon that was created by the plugin
		if ( faviconMobile.hasClass( componentName ) ) {
			faviconPath = data.path !== null ? data.path : getPath( favicon.getAttribute( "href" ) );
			faviconMobile.attr( "href", faviconPath + data.filename );

			if ( !isFaviconMobile ) {
				favicon.parentNode.insertBefore( faviconMobile[ 0 ], favicon );
			}
		}

		$document.trigger( updatedEvent, [ "mobile" ] );
	},

	/**
	 * Updates the the page's shortcut icon
	 * @method icon
	 * @param {DOM element} favicon Favicon element
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {Object} data Key-value data object passed with the event
	 */
	icon = function( favicon, event, data ) {
		var faviconPath = data.path !== null ? data.path : getPath( favicon.getAttribute( "href" ) );
		favicon.setAttribute( "href", faviconPath + data.filename );

		$document.trigger( updatedEvent, [ "icon" ] );
	},

	/**
	 * Given a full file path, returns the path without the filename
	 * @method getPath
	 * @param {string} filepath The full path to file, including filename
	 * @returns {string} The path to the file
	 */
	getPath = function( filepath ) {
		return filepath.substring( 0, filepath.lastIndexOf( "/" ) + 1 );
	};

// Bind the init event
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Bind the mobile and icon events
$document.on( mobileEvent + " " + iconEvent, selector, function( event, data ) {
	var eventTarget = event.target;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		switch ( event.type ) {
		case "mobile":
			mobile( eventTarget, event, data );
			break;

		case "icon":
			icon( eventTarget, event, data );
			break;
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
