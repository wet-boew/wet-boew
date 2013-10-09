/*
 * @title WET-BOEW Session Timeout
 * @overview Helps Web asset owners to provide session timeout and inactivity timeout functionality.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function ( $, window, document, vapour ) {
    "use strict";

    /* 
     * Variable and function definitions. 
     * These are global to the plugin - meaning that they will be initialized once per page,
     * not once per instance of plugin on the page. So, this is a good place to define
     * variables that are common to all instances of the plugin on a page.
     */
    var selector = ".wb-session-timeout",
		$document = vapour.doc,
        i18n,
        i18nText,
		
        /*
         * Plugin users can override these defaults by setting attributes on the html elements that the
         * selector matches.
         * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
         */
		defaults = {
			inactivity: 1200000,		// default inactivity period 20 minutes
			reaction: 30000,			// default confirmation period of 30 seconds
			keepalive: 1200000,			// default keepalive period of 20 minutes
			keepaliveurl: null,			// refresh callback if using AJAX keepalive (no default)
			logouturl: "./",			// logout URL once the session has expired
			refreshonclick: false,		// refresh session if user clicks on the page
			refreshlimit: 200000		// default period of 2 minutes (ajax calls happen only once during this period)
		},


        /*
         * Init runs once per plugin element on the page. There may be multiple elements. 
         * It will run more than once per plugin if you don't remove the selector from the timer.
         * @method init
         */
		init = function( event ) {
			var $elm = $( event.target ),

				// Merge default settings with overrides from the selected plugin element. There may be more than one, so don't override defaults globally!
				settings = $.extend( {}, defaults, $elm.data( "wet-boew" ) );

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
            window._timer.remove( selector );

            // Only initialize the i18nText once
            if ( !i18nText ) {
                i18n = window.i18n;
                i18nText = {
					timeout: i18n( "%st-timeout-msg" ),
					timeoutAlready: i18n( "%st-already-timeout-msg" )
				};
			}

			// Initialize the keepalive and inactive timeouts of the plugin
			$elm.trigger( "reset.wb-session-timeout", settings );

			// Setup the refresh on click behaviour
			initRefreshOnClick( $elm, settings );
		},

		/*
		 * Initialize the refresh on click keepalive behaviour.  This will cause a `keepalive.wb-session-timeout`
		 * event to be triggered when the document is clicked, limited by the settings.refreshlimit value.
		 * @method initRefreshOnClick
		 * @param {jQuery DOM Element} $elm DOM element to trigger the event on
		 * @param {Object} settings Key-value object that will be passed when event is triggered.
		 */
		initRefreshOnClick = function( $elm, settings ) {
			if ( settings.refreshonclick ) {
				$document.on( "click", function () {
					var lastActivity = $elm.data( "lastActivity" ),
						currentTime = getCurrentTime();
					if ( !lastActivity || ( currentTime - lastActivity ) > settings.refreshlimit ) {
						$elm
							.trigger( "reset.wb-session-timeout", settings )
							.trigger( "keepalive.wb-session-timeout", settings );
					}
					$elm.data( "lastActivity", currentTime );
				});
			}
		},

		/*
		 * Keepalive session event handler.  Sends the POST request to determine if the session is still alive.
		 * @method keepalive
		 * @param {jQuery Event} event Event that triggered this handler.
		 * @param {Object} settings Key-value object
		 */
		keepalive = function( event, settings ) {
			var keepaliveurl = settings.keepaliveurl;
			if ( keepaliveurl !== null ) {
				$.post( keepaliveurl, function( response ) {
					if ( response && response.replace( /\s/g, "" ) === "true" ) {
						$( event.target ).trigger( "reset.wb-session-timeout", settings );
					} else {
						window.alert( i18nText.timeoutAlready );
						window.location.href = settings.logouturl;
					}
				} );
			}
		},

		/*
		 * Inactivity check event handler.  Checks if the user wants to keep their session alive.
		 * @method inactivity
		 * @param {jQuery Event} event Event that triggered this handler.
		 * @param {Object} settings Key-value object
		 */
		inactivity = function( event, settings ) {
			var start = getCurrentTime(),
				reaction = settings.reaction;

			if ( confirmTimeout( reaction ) && ( getCurrentTime() - start ) <= reaction ) {
				$( event.target )
					.trigger( "reset.wb-session-timeout", settings )
					.trigger( "keepalive.wb-session-timeout", settings );
			} else {
				window.location.href = settings.logouturl;
			}
		},

		/*
		 * Initialize the inactivity and keepalive timeouts of the plugin
		 * @method reset
		 * @param {jQuery Event} event Event that triggered this handler.
		 * @param {Object} settings Key-value object
		 */
		reset = function( event, settings ) {
			var $elm = $( event.target );

			initEventTimeout( $elm, "inactivity.wb-session-timeout", settings.inactivity, settings );
			if ( settings.keepaliveurl !== null ) {
				initEventTimeout( $elm, "keepalive.wb-session-timeout", settings.keepalive, settings );
			}
		},

		/*
		 * Initializes a timeout that triggers an event
		 * @method initEventTimeout
		 * @param {jQuery DOM Element} $elm Element to trigger the event on
		 * @param {string} eventName Name of the event to trigger on setTimeout
		 * @param {mixed} time Time to wait before triggering the event
		 * @param {Object} settings Key-value object
		 */
		initEventTimeout = function( $elm, eventName, time, settings ) {
			// Clear any existing timeout for the event
			clearTimeout( $elm.data( eventName ) );

			// Create the new timeout that will trigger the event
			$elm.data( eventName, setTimeout( function() {
				$elm.trigger( eventName, settings );
			}, parseTime( time ) ) );
		},

		/*
		 * Displays the confirm dialog to check if the user wants to keep their session alive.
		 * @method confirmTimeout
		 * @param {integer} reaction Time in milliseconds the user has to interact with the confirm dialog
		 */
		confirmTimeout = function( reaction ) {
			var isConfirmed,
				activeElement = document.activeElement;

			isConfirmed = window.confirm( i18nText.timeout.replace( "#expireTime#", getExpireTime( reaction ) ) );
			// TODO: Replace with use of global focus function
			setTimeout( function () {
				activeElement.focus();
			}, 0 );
			return isConfirmed;
		},

		/*
		 * Returns the current time in milliseconds
		 * @method getCurrentTime
		 * @returns {integer} Current time in milliseconds
		 */
		getCurrentTime = function() {
			return ( new Date() ).getTime();
		},

		/*
		 * Parses a time value into a milliseconds integer value.
		 * @method parseTime
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
		 * Returns a formatted, human readable, string with the amount of time left before
		 * the inactivity check will expire.
		 * @method getExpireTime
		 * @param {integer} reaction Time in milliseconds the user has to interact with the confirm dialog
		 * @returns {string} Formatted time string until inactivity expires
		 */
		getExpireTime = function( reaction ) {
			var expire = new Date( getCurrentTime() + reaction ),
				hours = expire.getHours(),
				minutes = expire.getMinutes(),
				seconds = expire.getSeconds(),
				timeformat = hours < 12 ? " AM" : " PM";

			hours = hours % 12;
			if ( hours === 0 ) {
				hours = 12;
			}

			// Add a zero if needed in the time
			hours = hours < 10 ? "0" + hours : hours;
			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			return hours + ":" + minutes + ":" + seconds + timeformat;
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

    // Add the timer poke to initialize the plugin
    window._timer.add( selector );

} )( jQuery, window, document, vapour );
