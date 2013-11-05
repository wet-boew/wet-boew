/*
 * @title WET-BOEW Session Timeout
 * @overview Helps Web asset owners to provide session timeout and inactivity timeout functionality.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, document, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-session-timeout",
	$document = vapour.doc,
	i18n, i18nText,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		inactivity: 1200000,		// default inactivity period 20 minutes
		reactionTime: 180000,		// default confirmation period of 3 minutes
		sessionalive: 1200000,		// default keepalive period of 20 minutes
		refreshCallbackUrl: null,	// refresh callback if using AJAX keepalive (no default)
		logouturl: "./",			// logout URL once the session has expired
		refreshOnClick: true,		// refresh session if user clicks on the page
		refreshLimit: 200000		// default period of 2 minutes (ajax calls happen only once during this period)
	},

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @function init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var elm = event.target,
			$elm, settings;
	
		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			$elm = $( elm );

			// Merge default settings with overrides from the selected plugin element. There may be more than one, so don't override defaults globally!
			settings = $.extend( {}, defaults, $elm.data( "wet-boew" ) );

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = window.i18n;
				i18nText = {
					buttonContinue: i18n( "%st-btn-cont" ),
					buttonEnd: i18n( "%st-btn-end" ),
					buttonSignin: i18n( "%tmpl-signin" ),
					timeoutBegin: i18n( "%st-to-msg-bgn" ),
					timeoutEnd: i18n( "%st-to-msg-end" ),
					timeoutTitle: i18n( "%st-msgbx-ttl" ),
					timeoutAlready: i18n( "%st-alrdy-to-msg" )
				};
			}

			// Setup the modal dialog behaviour
			$document.one( "ready.wb-modal", function() {
				// Initialize the keepalive and inactive timeouts of the plugin
				$elm.trigger( "reset.wb-session-timeout", settings );

				// Setup the refresh on click behaviour
				initRefreshOnClick( $elm, settings );
			});
		}
	},

	/*
	 * Initialize the refresh on click keepalive behaviour. This will cause a `keepalive.wb-session-timeout`
	 * event to be triggered when the document is clicked, limited by the settings.refreshLimit value.
	 * @function initRefreshOnClick
	 * @param {jQuery DOM Element} $elm DOM element to trigger the event on
	 * @param {Object} settings Key-value object that will be passed when event is triggered.
	 */
	initRefreshOnClick = function( $elm, settings ) {
		if ( settings.refreshOnClick ) {
			$document.on( "click", function() {
				var lastActivity = $elm.data( "lastActivity" ),
					currentTime = getCurrentTime();
				if ( !lastActivity || ( currentTime - lastActivity ) > settings.refreshLimit ) {
					$elm
						.trigger( "reset.wb-session-timeout", settings )
						.trigger( "keepalive.wb-session-timeout", settings );
				}
				$elm.data( "lastActivity", currentTime );
			});
		}
	},

	/*
	 * Keepalive session event handler. Sends the POST request to determine if the session is still alive.
	 * @function keepalive
	 * @param {jQuery Event} event `keepalive.wb-session-timeout` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	keepalive = function( event, settings ) {
		var $buttonSignin, building,
			$elm = $( event.target );
		if ( settings.refreshCallbackUrl !== null ) {
			$.post( settings.refreshCallbackUrl, function( response ) {
				// Session is valid
				if ( response && response.replace( /\s/g, "" ) === "true" ) {
					$elm.trigger( "reset.wb-session-timeout", settings );

				// Session has timed out - let the user know they need to sign in again
				} else {
					building = $.Deferred();
					$buttonSignin = $( "<button type='button' class='wb-session-timeout-confirm btn btn-primary'>" + i18nText.buttonSignin + "</button>" );
					$buttonSignin.data( "logouturl", settings.logouturl );

					// Build the modal dialog
					$document.trigger( "build.wb-modal", {
						content: "<p>" + i18nText.timeoutAlready + "</p>",
						buttons: $buttonSignin,
						deferred: building
					});

					building.done( function( $modal ) {
						// End the inactivity timeouts since the session is already kaput
						clearTimeout( $elm.data( "inactivity.wb-session-timeout" ) );
						clearTimeout( $elm.data( "keepalive.wb-session-timeout" ) );

						// Let the user know their session is dead
						setTimeout(function() {
							// Open the popup
							$document.trigger( "show.wb-modal", {
								modal: true,
								mainClass: "mfp-zoom-in",
								items: { src: $modal, type: "inline" }
							});
						}, Modernizr.csstransitions ? 500 : 0 );
					});
				}
			});
		}
	},

	/**
	 * Inactivity check event handler. Displays the modal dialog to allow the user to confirm their activity.
	 * @function inactivity
	 * @param {jQuery Event} event `inactivity.wb-session-timeout` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	inactivity = function( event, settings ) {
		var $buttonContinue, $buttonEnd, countdownInterval,
			activeElement = $document[ 0 ].activeElement,
			building = $.Deferred(),
			time = getTime( settings.reactionTime ),
			timeoutBegin = i18nText.timeoutBegin
				.replace( "#min#", "<span class='min'>" + time.minutes + "</span>" )
				.replace( "#sec#", "<span class='sec'>" + time.seconds + "</span>" ),
			$modal = $( "#wb-session-modal" );

		// Modal does not exists: build it
		if ( $modal.length === 0 ) {
			$buttonContinue = $( "<button type='button' class='wb-session-timeout-confirm btn btn-primary'>" +
				i18nText.buttonContinue + "</button>" );
			$buttonEnd = $( "<button type='button' class='wb-session-timeout-confirm btn btn-default'>" +
				i18nText.buttonEnd + "</button>" );

			// Build the modal
			$document.trigger( "build.wb-modal", {
				id: "wb-session-modal",
				title: i18nText.timeoutTitle,
				content: "<p class='content'>" + timeoutBegin + "<br />" + i18nText.timeoutEnd + "</p>",
				buttons: [ $buttonContinue, $buttonEnd ],
				deferred: building
			});

		// Modal already exists: get element references and resolve the deferred object (causes the modal to be displayed)
		} else {
			$buttonContinue = $modal.find( ".btn-primary" );
			$buttonEnd = $modal.find( ".btn-default" );
			$modal.find( ".content" ).html( timeoutBegin + "<br />" + i18nText.timeoutEnd );

			// Trigger the deferred object's done callback by resolving it
			building.resolve( $modal );
		}

		// Display the modal when it's finished being built
		building.done( function( $modal, isNew ) {

			if ( isNew === true ) {
				$document.find( "body" ).append( $modal );
			}

			// Add the session timeout settings to the buttons
			$buttonEnd.data( "logouturl", settings.logouturl );
			$buttonContinue
				.data( settings )
				.data( "start", getCurrentTime() );

			// Open the modal dialog
			$document.trigger( "show.wb-modal", {
				modal: true,
				mainClass: "mfp-zoom-in",
				removalDelay: Modernizr.csstransitions ? 500 : 0,
				items: {
					src: $modal,
					type: "inline"
				},
				callbacks: {
					// Start the time countdown when the popup opens
					open: function() {
						var $minutes = $modal.find( ".min" ),
							$seconds = $modal.find( ".sec" );
						countdownInterval = setInterval(function() {
							if ( countdown( $minutes, $seconds ) ) {
								clearInterval( countdownInterval );

								// Let the user know their session has timed out
								$modal.find( ".content" ).text( i18nText.timeoutAlready );
								$buttonContinue.text( i18nText.buttonSignin );
								$buttonEnd.hide();
							}
						}, 1000 );
					},

					// Stop the countdown and restore focus to the original active element
					afterClose: function() {
						clearInterval( countdownInterval );

						// Assign focus to activeElement
						$( activeElement ).trigger( "focus.wb" );
					}
				}
			});
		});
	},

	/*
	 * Initialize the inactivity and keepalive timeouts of the plugin
	 * @function reset
	 * @param {jQuery Event} event `reset.wb-session-timeout` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	reset = function( event, settings ) {
		var $elm = $( event.target );

		initEventTimeout( $elm, "inactivity.wb-session-timeout", settings.inactivity, settings );
		if ( settings.refreshCallbackUrl !== null ) {
			initEventTimeout( $elm, "keepalive.wb-session-timeout", settings.sessionalive, settings );
		}
	},

	/*
	 * Checks if the user wants to keep their session alive.
	 * @function inactivity
	 * @param {jQuery Event} event `confirm.wb-session-timeout` event that triggered the function call
	 */
	confirm = function( event ) {
		var elm = event.target,
			$elm = $( elm ),
			settings = $elm.data();

		event.preventDefault();
		$.magnificPopup.close();

		// User wants their session maintained
		if ( settings.start !== undefined && ( getCurrentTime() - settings.start ) <= settings.reactionTime ) {
			$( selector )
				.trigger( "reset.wb-session-timeout", settings )
				.trigger( "keepalive.wb-session-timeout", settings );

		// Negative confirmation or the user took too long; logout
		} else {
			window.location.href = settings.logouturl;
		}
	},

	/*
	 * Initializes a timeout that triggers an event
	 * @function initEventTimeout
	 * @param {jQuery DOM Element} $elm Element to trigger the event on
	 * @param {string} eventName Name of the event to trigger on setTimeout
	 * @param {mixed} time Time to wait before triggering the event
	 * @param {Object} settings Key-value object
	 */
	initEventTimeout = function( $elm, eventName, time, settings ) {
		// Clear any existing timeout for the event
		clearTimeout( $elm.data( eventName ) );

		// Create the new timeout that will trigger the event
		$elm.data( eventName, setTimeout(function() {
			$elm.trigger( eventName, settings );
		}, parseTime( time ) ) );
	},

	/*
	 * Returns the current time in milliseconds
	 * @function getCurrentTime
	 * @returns {integer} Current time in milliseconds
	 */
	getCurrentTime = function() {
		return ( new Date() ).getTime();
	},

	/*
	 * Parses a time value into a milliseconds integer value.
	 * @function parseTime
	 * @param {Mixed} value The time value to parse (integer or string)
	 * @returns {integer} Millisecond integer value parsed from the time value
	 */
	parseTime = function( value ) {
		var result, num, mult,
			powers = {
				"ms": 1,
				"cs": 10,
				"ds": 100,
				"s": 1000,
				"das": 10000,
				"hs": 100000,
				"ks": 1000000
			};

		if ( value == null ) {
			return null;
		}

		result = /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/.exec( $.trim( value.toString() ) );
		if ( result[ 2 ] ) {
			num = parseFloat( result[ 1 ] );
			mult = powers[ result[ 2 ] ] || 1;
			return num * mult;
		}
		return value;
	},

	/*
	 * Converts a millisecond value into minutes and seconds
	 * @function getTime
	 * @param {integer} milliseconds The time value in milliseconds
	 * @returns {Object} An object with a seconds and minutes property
	 */
	getTime = function( milliseconds ) {
		var time = { minutes: "", seconds: "" };

		if ( milliseconds != null ) {
			time.minutes = parseInt( ( milliseconds / ( 1000 * 60 ) ) % 60, 10 );
			time.seconds = parseInt( ( milliseconds / 1000 ) % 60, 10 );
		}
		return time;
	},

	/*
	 * Given 2 elements representing minutes and seconds, decrement their time value by 1 second
	 * @function countdown
	 * @param {jQuery DOM Element} $minutes Element that contains the minute value
	 * @param {jQuery DOM Element} $seconds Element that contains the second value
	 * @returns {boolean} Is the countdown finished?
	 */
	countdown = function( $minutes, $seconds ) {
		var minutes = parseInt( $minutes.text(), 10 ),
			seconds = parseInt( $seconds.text(), 10 );

		// Decrement seconds and minutes
		if ( seconds > 0 ) {
			seconds -= 1;
		} else if ( minutes > 0 ) {
			minutes -= 1;
			seconds = 59;
		}

		// Update the DOM elements
		$minutes.text( minutes );
		$seconds.text( seconds );

		return minutes === 0 && seconds === 0;
	};

// Bind the plugin events
$document.on( "timerpoke.wb keepalive.wb-session-timeout inactivity.wb-session-timeout reset.wb-session-timeout", selector, function( event, settings ) {
	var eventType = event.type;

	switch ( eventType ) {
	case "timerpoke":
		init( event );
		break;

	case "keepalive":
		keepalive( event, settings );
		break;

	case "inactivity":
		inactivity( event, settings );
		break;

	case "reset":
		reset( event, settings );
		break;
	}
});

$document.on( "click", ".wb-session-timeout-confirm", confirm );

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );
