/**
 * @title WET-BOEW Twitter embedded timeline
 * @overview Helps with implementing Twitter embedded timelines.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-twitter",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var eventTarget = wb.init( event, componentName, selector ),
			protocol = wb.pageUrlParts.protocol;

		if ( eventTarget ) {
			const twitterLink = eventTarget.firstElementChild;

			// Ignore IE11
			// Note: Twitter's widget no longer supports it...
			if ( wb.ie11 ) {
				wb.ready( $( eventTarget ), componentName );
				return;
			}

			// If the plugin container's first child element is a Twitter link...
			if ( twitterLink && twitterLink.matches( "a.twitter-timeline" ) ) {
				const loadingDiv = document.createElement( "div" );
				let observer;

				// Add a loading icon below the link
				loadingDiv.className = "twitter-timeline-loading";
				twitterLink.after( loadingDiv );

				// Remove the loading icon after the timeline widget appears
				// Note: Twitter's widget script removes "a.twitter-timeline" upon filling-in the timeline's content... at which point the loading icon is no longer useful
				observer = new MutationObserver( function( mutations ) {

					// Check for DOM mutations
					mutations.forEach( function( mutation ) {

						// Deal only with removed HTML nodes
						mutation.removedNodes.forEach( function( removedNode ) {

							// If the removed node was a Twitter link, remove its adjacent loading icon and stop observing
							if ( removedNode === twitterLink && mutation.nextSibling === loadingDiv ) {
								loadingDiv.remove();
								observer.disconnect();
							}
						} );
					} );
				} );

				// Observe changes to the plugin container's direct child elements
				observer.observe( eventTarget, {
					childList: true
				} );
			}

			Modernizr.load( {
				load: ( protocol.indexOf( "http" ) === -1 ? "http:" : protocol ) + "//platform.twitter.com/widgets.js",
				complete: function() {

					// Identify that initialization has completed
					wb.ready( $( eventTarget ), componentName );
				}
			} );
		}
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
