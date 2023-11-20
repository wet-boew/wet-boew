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
			const twitterLinks = eventTarget.querySelectorAll( "a.twitter-timeline" );

			// Ignore IE11
			// Note: Twitter's widget no longer supports it...
			if ( wb.ie11 ) {
				wb.ready( $( eventTarget ), componentName );
				return;
			}

			// Process each Twitter link
			twitterLinks.forEach( function( twitterLink ) {

				// Set Chinese (Simplfified)'s language code to "zh-cn"
				// If the link doesn't specify a widget language and its "in-page" language code is "zh-Hans"...
				// Notes:
				// -WET uses "zh-Hans", Twitter uses "zh-ch" and falls back to English if the former is used
				// -Language code sourced from https://developer.twitter.com/en/docs/twitter-for-websites/supported-languages
				if ( !twitterLink.dataset.lang && twitterLink.closest( "[lang='zh-Hans']" ) ) {
					twitterLink.dataset.lang = "zh-cn";
				}

				// Match the Facebook page plugin's default height
				// If data-height is set to "fb-page" OR the widget has a tweet limit and lacks a custom height...
				// Notes:
				// -Counteracts enormous default widget heights that can reach tens of thousands of pixels without a scrollbar
				// -Timeline widgets stopped honouring tweet limits on July 21, 2023 and began showing up to 100 tweets at a time ("verified" accounts only)
				// -Facebook page plugin's default height is documented in https://developers.facebook.com/docs/plugins/page-plugin#settings
				if ( twitterLink.dataset.height === "fb-page" || ( twitterLink.dataset.tweetLimit && !twitterLink.dataset.height ) ) {
					twitterLink.dataset.height = "500";
				}

				// Add a "do not track" parameter (i.e. data-dnt="true" attribute) unless it's already been set
				// Note: Covered in https://developer.twitter.com/en/docs/twitter-for-websites/webpage-properties
				if ( !twitterLink.dataset.dnt ) {
					twitterLink.dataset.dnt = "true";
				}

				// Display a loading icon
				// If the plugin container's first child element is a Twitter link...
				if ( twitterLink === eventTarget.firstElementChild ) {
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
			} );

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
