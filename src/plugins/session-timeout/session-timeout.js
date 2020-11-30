/**
 * @title WET-BOEW Session Timeout
 * @overview Helps Web asset owners to provide session timeout and inactivity timeout functionality.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $modal, $modalLink, countdownInterval, i18n, i18nText,
	$document = wb.doc,
	componentName = "wb-sessto",
	selector = "." + componentName,
	confirmClass = componentName + "-confirm",
	initEvent = "wb-init" + selector,
	resetEvent = "reset" + selector,
	keepaliveEvent = "keepalive" + selector,
	inactivityEvent = "inactivity" + selector,
	dataAttr = componentName,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		inactivity: 1200000,		/* default inactivity period 20 minutes */
		reactionTime: 180000,		/* default confirmation period of 3 minutes */
		sessionalive: 1200000,		/* default keepalive period of 20 minutes */
		refreshCallbackUrl: null,	/* refresh callback if using AJAX keepalive (no default) */
		logouturl: "./",			/* logout URL once the session has expired */
		refreshOnClick: true,		/* refresh session if user clicks on the page */
		refreshLimit: 120000,		/* default period of 2 minutes (ajax calls happen only once during this period) */
		method: "POST",				/* the request method to use */
		additionalData: null,		/* additional data to send with the request */
		refreshCallback: function( response ) {	/* callback function used to check the server response */
			return response.replace( /\s/g, "" ) === "true";
		}
	},

	/**
	 * @function init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, settings, onReady;

		if ( elm ) {
			$elm = $( elm );

			// For backwards compatibility where data-wet-boew was used instead of data-wb-sessto
			if ( !$elm.attr( "data-" + componentName ) ) {
				dataAttr = "wet-boew";
			}

			// Merge default settings with overrides from the plugin element
			// and save back to the element for future reference
			settings = $.extend( {}, defaults, window[ componentName ], $elm.data( dataAttr ) );
			$elm.data( dataAttr, settings );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					buttonContinue: i18n( "st-btn-cont" ),
					buttonEnd: i18n( "st-btn-end" ),
					buttonSignin: i18n( "tmpl-signin" ),
					timeoutBegin: i18n( "st-to-msg-bgn" ),
					timeoutEnd: i18n( "st-to-msg-end" ),
					timeoutTitle: i18n( "st-msgbx-ttl" ),
					timeoutAlready: i18n( "st-alrdy-to-msg" )
				};
			}

			onReady = function() {

				// Setup the refresh on click behaviour
				initRefreshOnClick( $elm, settings );

				// Initialize the keepalive and inactive timeouts of the plugin
				$elm.trigger( resetEvent, settings );

				// Identify that initialization has completed
				wb.ready( $elm, componentName );
			};

			// Create the modal dialog
			initModalDialog( onReady );
		}
	},

	/**
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
		$elm.data( eventName, setTimeout( function() {
			$elm.trigger( eventName, settings );
		}, parseTime( time ) ) );
	},

	/**
	 * Creates the modal dialog element, appends to the <body> and initializes the lightbox plugin
	 * that is used to create the dialog behaviour.
	 * @function initModalDialog
	 */
	initModalDialog = function( callback ) {
		var modalID = "#" + componentName + "-modal",
			child, modal, temp;

		if ( $document.find( modalID ).length === 0 ) {
			modal = document.createDocumentFragment();
			temp = document.createElement( "div" );

			// Create the modal dialog.  A temp <div> element is used so that its innerHTML can be set as a string.
			temp.innerHTML = "<a class='wb-lbx lbx-modal mfp-hide' href='#" + componentName + "-modal'>" + i18nText.timeoutTitle + "</a>" +
				"<section id='" + componentName + "-modal' class='mfp-hide modal-dialog modal-content overlay-def'>" +
				"<header class='modal-header'><h2 class='modal-title'>" + i18nText.timeoutTitle + "</h2></header>" +
				"<div class='modal-body'></div>" +
				"<div class='modal-footer'></div>" +
				"</section>";

			// Get the temporary <div>'s top level children and append to the fragment
			while ( ( child = temp.firstChild ) !== null ) {
				modal.appendChild( child );
			}
			document.body.appendChild( modal );

			$modal = $document.find( modalID );

			// Get object references to the modal and its triggering link
			$modalLink = $modal.prev()
				.one( "wb-ready.wb-lbx", callback )
				.trigger( "wb-init.wb-lbx" );
		} else {
			callback();
		}
	},

	/**
	 * Initialize the refresh on click keepalive behaviour. This will cause a `keepalive.wb-sessto`
	 * event to be triggered when the document is clicked, limited by the settings.refreshLimit value.
	 * @function initRefreshOnClick
	 * @param {jQuery DOM Element} $elm DOM element to trigger the event on
	 * @param {Object} settings Key-value object that will be passed when event is triggered.
	 */
	initRefreshOnClick = function( $elm, settings ) {
		if ( settings.refreshOnClick ) {
			$document.on( "click", function( event ) {
				var className = event.target.className,
					lastActivity, currentTime;

				// Ignore clicks when the modal dialog is open
				if ( ( !className || className.indexOf( confirmClass ) === -1 ) &&
					$( ".mfp-ready ." + confirmClass ).length === 0 ) {

					lastActivity = $elm.data( "lastActivity" );
					currentTime = getCurrentTime();
					if ( !lastActivity || ( currentTime - lastActivity ) > settings.refreshLimit ) {
						$elm
							.trigger( resetEvent, settings )
							.trigger( keepaliveEvent, settings );
						$elm.data( "lastActivity", currentTime );
					}
				}
			} );
		}
	},

	/**
	 * Keepalive session event handler. Sends the POST request to determine if the session is still alive.
	 * @function keepalive
	 * @param {jQuery Event} event `keepalive.wb-sessto` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	keepalive = function( event, settings ) {
		var $elm = $( event.target );
		if ( settings.refreshCallbackUrl !== null ) {
			$.ajax( {
				url: settings.refreshCallbackUrl,
				data: settings.additionalData,
				dataType: "text",
				method: settings.method,
				success: function( response ) {

					// Session is valid
					if ( response && settings.refreshCallback( response ) ) {
						$elm.trigger( resetEvent, settings );

					// Session has timed out - let the user know they need to sign in again
					} else {

						// End the inactivity timeouts since the session is already kaput
						clearTimeout( $elm.data( inactivityEvent ) );
						clearTimeout( $elm.data( keepaliveEvent ) );

						openModal( {
							body: "<p>" + i18nText.timeoutAlready + "</p>",
							buttons: $( "<button type='button' class='" + confirmClass +
								" btn btn-primary popup-modal-dismiss'>" + i18nText.buttonSignin + "</button>" )
								.data( "logouturl", settings.logouturl )
						} );
					}
				}
			} );
		}
	},

	/**
	 * Inactivity check event handler. Displays the modal dialog to allow the user to confirm their activity.
	 * @function inactivity
	 * @param {jQuery Event} event `inactivity.wb-sessto` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	inactivity = function( event, settings ) {
		var $buttonContinue, $buttonEnd,
			time = getTime( settings.reactionTime ),
			timeoutBegin = i18nText.timeoutBegin
				.replace( "#min#", "<span class='min'>" + time.minutes + "</span>" )
				.replace( "#sec#", "<span class='sec'>" + time.seconds + "</span>" ),
			buttonStart = "<button type='button' class='",
			buttonEnd = "</button>";

		// Clear the keepalive timeout to avoid double firing of requests
		clearTimeout( $( event.target ).data( keepaliveEvent ) );

		$buttonContinue = $( buttonStart + confirmClass +
			" btn btn-primary popup-modal-dismiss'>" + i18nText.buttonContinue + buttonEnd )
			.data( settings )
			.data( "start", getCurrentTime() );
		$buttonEnd = $( buttonStart + confirmClass + " btn btn-default'>" +
			i18nText.buttonEnd + buttonEnd )
			.data( "logouturl", settings.logouturl );

		openModal( {
			body: "<p>" + timeoutBegin + "<br />" + i18nText.timeoutEnd + "</p>",
			buttons: [ $buttonContinue, $buttonEnd ],
			open: function() {
				var $minutes = $modal.find( ".min" ),
					$seconds = $modal.find( ".sec" );
				countdownInterval = setInterval( function() {
					if ( countdown( $minutes, $seconds ) ) {
						clearInterval( countdownInterval );

						// Let the user know their session has timed out
						$modal.find( "p" ).text( i18nText.timeoutAlready );
						$buttonContinue.text( i18nText.buttonSignin );
						$buttonEnd.hide();
					}
				}, 1000 );
			}
		} );
	},

	/**
	 * Initialize the inactivity and keepalive timeouts of the plugin
	 * @function reset
	 * @param {jQuery Event} event `reset.wb-sessto` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	reset = function( event, settings ) {
		var $elm = $( event.target );

		initEventTimeout( $elm, inactivityEvent, settings.inactivity, settings );
		if ( settings.refreshCallbackUrl !== null ) {
			initEventTimeout( $elm, keepaliveEvent, settings.sessionalive, settings );
		}
	},

	/**
	 * Checks if the user wants to keep their session alive.
	 * @function inactivity
	 * @param {jQuery Event} event `confirm.wb-sessto` event that triggered the function call
	 */
	confirm = function( event ) {
		var elm = event.target,
			$elm = $( elm ),
			settings = $elm.data();

		event.preventDefault();
		$.magnificPopup.close();
		clearInterval( countdownInterval );

		// User wants their session maintained
		if ( settings.start !== undefined && ( getCurrentTime() - settings.start ) <= settings.reactionTime ) {
			$( selector )
				.trigger( resetEvent, settings )
				.trigger( keepaliveEvent, settings );

		// Negative confirmation or the user took too long; logout
		} else {
			window.location.href = settings.logouturl;
		}
	},

	/**
	 * Add the modal dialog's content and display it to the user
	 * @function openModal
	 * @param {Object} data Key-value object
	 */
	openModal = function( data ) {

		// Detach the modal to prevent reflows while updating the element
		$modal = $modal.detach();
		$modal.find( ".modal-body" ).html( data.body );
		$modal.find( ".modal-footer" ).empty().append( data.buttons );

		// Re-attach the modal and open the dialog
		$modal = $modal.insertAfter( $modalLink );
		$modalLink.magnificPopup( "open" );

		// Execute the open callback if it exists
		if ( data.open ) {
			data.open();
		}
	},

	/**
	 * Returns the current time in milliseconds
	 * @function getCurrentTime
	 * @returns {integer} Current time in milliseconds
	 */
	getCurrentTime = function() {
		return ( new Date() ).getTime();
	},

	/**
	 * Parses a time value into a milliseconds integer value.
	 * @function parseTime
	 * @param {Mixed} value The time value to parse (integer or string)
	 * @returns {integer} Millisecond integer value parsed from the time value
	 */
	parseTime = function( value ) {
		var result, num, mult,
			powers = {
				ms: 1,
				cs: 10,
				ds: 100,
				s: 1000,
				das: 10000,
				hs: 100000,
				ks: 1000000
			};

		if ( value == null ) { //eslint-disable-line no-eq-null
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

	/**
	 * Converts a millisecond value into minutes and seconds
	 * @function getTime
	 * @param {integer} milliseconds The time value in milliseconds
	 * @returns {Object} An object with a seconds and minutes property
	 */
	getTime = function( milliseconds ) {
		var time = { minutes: "", seconds: "" };

		if ( milliseconds != null ) { //eslint-disable-line no-eq-null
			time.minutes = parseInt( ( milliseconds / ( 1000 * 60 ) ) % 60, 10 );
			time.seconds = parseInt( ( milliseconds / 1000 ) % 60, 10 );
		}
		return time;
	},

	/**
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
$document.on( "timerpoke.wb " + initEvent + " " + keepaliveEvent + " " +
inactivityEvent + " " + resetEvent, selector, function( event, settings ) {

	var eventType = event.type;

	switch ( eventType ) {
	case "timerpoke":
	case "wb-init":
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
} );

$document.on( "click", "." + confirmClass, confirm );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
