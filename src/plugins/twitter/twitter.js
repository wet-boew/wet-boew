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
	i18n, i18nText,

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
			const twitterLink = eventTarget.querySelector( "a.twitter-timeline" );

			// Ignore IE11
			// Note: Twitter's widget no longer supports it...
			if ( wb.ie11 ) {
				wb.ready( $( eventTarget ), componentName );
				return;
			}

			// Process the Twitter link
			if ( twitterLink ) {
				const loadingDiv = document.createElement( "div" );
				let observer;

				// Only initialize the i18nText once
				if ( !i18nText ) {
					i18n = wb.i18n;
					i18nText = {
						startNotice: i18n( "twitter-start-notice" ),
						endNotice: i18n( "twitter-end-notice" ),
						skipEnd: i18n( "twitter-skip-end" ),
						skipStart: i18n( "twitter-skip-start" ),
						timelineTitle: i18n( "twitter-timeline-title" )
					};
				}

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

				// Add a loading icon below the link
				loadingDiv.className = "twitter-timeline-loading";
				twitterLink.after( loadingDiv );

				// Observe DOM mutations
				observer = new MutationObserver( function( mutations ) {
					mutations.forEach( function( mutation ) {
						switch ( mutation.type ) {

						// Check for attribute changes
						case "attributes": {
							const mutationTarget = mutation.target;

							// Override the timeline iframe's title right after Twitter's widget script adds it
							// Note: The timeline's iframe title is English-only and written in title case ("Twitter Timeline")... This replaces it with an i18n version written in sentence case.
							if ( mutationTarget.nodeName === "IFRAME" && mutationTarget.title !== i18nText.timelineTitle ) {
								mutationTarget.title = i18nText.timelineTitle;
							}
							break;
						}

						// Check for node removals
						case "childList": {
							mutation.removedNodes.forEach( function( removedNode ) {

								// If the removed node was a Twitter link, remove its adjacent loading icon, add skip links and stop observing
								// Note: Twitter's widget script removes "a.twitter-timeline" upon displaying the timeline iframe's content... at which point the loading icon is no longer useful
								if ( removedNode === twitterLink && mutation.nextSibling === loadingDiv ) {
									const iframeContainer = loadingDiv.previousElementSibling;

									loadingDiv.remove();
									addSkipLinks( iframeContainer );
									observer.disconnect();
								}
							} );
						}
						}
					} );
				} );

				// Observe changes to the plugin container's child elements and title attributes
				observer.observe( eventTarget, {
					attributeFilter: [ "title" ],
					childList: true,
					subtree: true
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
	},

	// Add skip links immediately before and after the timeline widget
	// Note: Verified account timelines may contain several hundred interactive elements... this provides a mechanism to spare keyboard-only users from needing to tab through everything to move past the widget.
	addSkipLinks = function( iframeContainer ) {
		const timelineIframe = iframeContainer.getElementsByTagName( "iframe" )[ 0 ];
		const username = getTwitterUsername( timelineIframe.src );
		const noticeClass = componentName + "-" + "notice";
		const skipClass = componentName + "-" + "skip";
		const startText = "start";
		const endText = "end";
		let startNotice;
		let endNotice;
		let skipToEndLink;
		let skipToStartLink;

		// Abort if Twitter username is falsy
		// Note: Unlikely to happen unless the username doesn't exist... in which case Twitter's third party widget script will have already failed and triggered an exception by this point
		if ( !username ) {
			return;
		}

		// Add a start of timeline notice
		startNotice = createNotice( i18nText.startNotice, username, timelineIframe.id, noticeClass, startText );
		iframeContainer.before( startNotice );

		// Add an end of timeline notice
		endNotice = createNotice( i18nText.endNotice, username, timelineIframe.id, noticeClass, endText );
		iframeContainer.after( endNotice );

		// Add a skip to end link
		skipToEndLink = createSkipLink( i18nText.skipEnd, username, endNotice.id, skipClass, endText );
		startNotice.after( skipToEndLink );

		// Add a skip to start link
		skipToStartLink = createSkipLink( i18nText.skipStart, username, startNotice.id, skipClass, startText );
		endNotice.before( skipToStartLink );

		// Focus onto the destination of a clicked skip link
		$document.on( "click", "." + skipClass + " a", function( event ) {
			const currentTarget = event.currentTarget;
			const linkDestId = "#" + wb.jqEscape( currentTarget.getAttribute( "href" ).substring( 1 ) );
			const $linkDest = $document.find( linkDestId );

			// Assign focus to the skip link's destination
			// Note: The focus event's scrolling behaviour is more graceful than "jumping" to an anchor link's destination
			$linkDest.trigger( "setfocus.wb" );

			// Don't engage normal link navigation behaviour (i.e. "jumping" to the link destination, changing address/navigation history)
			return false;
		} );
	},

	// Extract a Twitter username from the iframe's timeline URL
	getTwitterUsername = function( iframeSrc ) {
		let username = iframeSrc.match( /\/screen-name\/([^?]+)/ );
		username = username ? username[ 1 ] : null;

		return username;
	},

	// Create a timeline notice
	createNotice = function( textTemplate, username, iframeId, noticeClass, position ) {
		const spanElm = document.createElement( "span" );
		const pElm = document.createElement( "p" );

		spanElm.innerHTML = textTemplate.replace( "%username%", username );

		pElm.id = iframeId + "-" + position;
		pElm.className = noticeClass + "-" + position;
		pElm.prepend( spanElm );

		// Hide the notice upon losing focus
		// Removes its tabindex attribute to make its CSS hide it from screen readers
		pElm.addEventListener( "blur", function( e ) {
			e.target.removeAttribute( "tabindex" );
		} );

		return pElm;
	},

	// Create a skip link
	createSkipLink = function( textTemplate, username, linkDestId, skipClass, linkDir ) {
		const spanElm = document.createElement( "span" );
		const aElm = document.createElement( "a" );
		const pElm = document.createElement( "p" );

		spanElm.innerHTML = textTemplate.replace( "%username%", username );

		aElm.href = "#" + linkDestId;
		aElm.prepend( spanElm );

		pElm.className = skipClass + " " + skipClass + "-" + linkDir;
		pElm.prepend( aElm );

		return pElm;
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
