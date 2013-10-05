/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Session Timeout Plugin
 * @overview Provides session keepalive and inactivity checks
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function ( $, window, vapour ) {

"use strict";

/**
 * @class Session Timeout
 */
var plugin = {
	selector: ".wb-session-timeout",
	i18nText: null,
	defaults: {
		inactivity: 1200000,		// default inactivity period 20 minutes
		reaction: 30000,			// default confirmation period of 30 seconds
		keepalive: 1200000,			// default keepalive period of 20 minutes
		keepaliveurl: null,			// refresh callback if using AJAX keepalive (no default)
		logouturl: "./",			// logout URL once the session has expired
		refreshonclick: false,		// refresh session if user clicks on the page
		refreshlimit: 200000		// default period of 2 minutes (ajax calls happen only once during this period)
	},

	/**
	 * Initialize the plugin.
	 * @method init
	 */
	init: function() {
		var $elm = $( this ),
			settings = $.extend( {}, plugin.defaults, $elm.data() );

		window._timer.remove( plugin.selector );

		// Initialize the internationalized strings
		if ( plugin.i18nText === null ) {
		    plugin.i18nText = {
		        timeout: window.i18n( "%st-timeout-msg" ),
		        timeoutAlready: window.i18n( "%st-already-timeout-msg" )
		    };
		}

		// Initialize the keepalive and inactive timeouts of the plugin
		$elm.trigger( "reset.wb-session-timeout", settings );

		// Setup the refresh on click behaviour
		plugin.initRefreshOnClick( $elm, settings );

	},

	/**
	 * Initialize the refresh on click keepalive behaviour.  This will cause a `keepalive.wb-session-timeout`
	 * event to be triggered when the document is clicked, limited by the settings.refreshlimit value.
	 * @param {jQuery DOM Element} $elm DOM element to trigger the event on
	 * @param {Object} settings Key-value object that will be passed when event is triggered.
	 */
	initRefreshOnClick: function( $elm, settings ) {
		if ( settings.refreshonclick ) {
			vapour.doc.on( "click", function() {
				var lastActivity = $elm.data( "lastActivity" );
				if ( lastActivity === undefined || ( plugin.getCurrentTime() - lastActivity ) > settings.refreshlimit ) {
					$elm
						.trigger( "reset.wb-session-timeout", settings )
						.trigger( "keepalive.wb-session-timeout", settings );
				}
				$elm.data( "lastActivity", plugin.getCurrentTime() );
			});
		}
	},

	/**
	 * Keepalive session event handler.  Sends the POST request to determine if the session is still alive.
	 * @method keepalive
	 * @param {jQuery Event} event Event that triggered this handler.
	 * @param {Object} settings Key-value object
	 */
	keepalive: function( event, settings ) {
		if ( settings.keepaliveurl !== null ) {
			$.post( settings.keepaliveurl, function( response ) {
				if ( response && response.replace( /\s/g, "" ) === "true" ) {
					$( this ).trigger( "reset.wb-session-timeout", settings );
				} else {
					window.alert( plugin.i18nText.timeoutAlready );
					window.location.href = settings.logouturl;
				}
		});
		}
	},

	/**
	 * Inactivity check event handler.  Checks if the user wants to keep their session alive.
	 * @method inactivity
	 * @param {jQuery Event} event Event that triggered this handler.
	 * @param {Object} settings Key-value object
	 */
	inactivity: function( event, settings ) {
		var start = plugin.getCurrentTime();

		if ( plugin.confirmTimeout( settings.reaction ) && ( plugin.getCurrentTime() - start ) <= settings.reaction ) {
			$( this )
				.trigger( "reset.wb-session-timeout", settings )
				.trigger( "keepalive.wb-session-timeout", settings );
		} else {
			window.location.href = settings.logouturl;
		}
	},

	/**
	 * Initialize the inactivity and keepalive timeouts of the plugin
	 * @method reset
	 * @param {jQuery Event} event Event that triggered this handler.
	 * @param {Object} settings Key-value object
	 */
	reset: function( event, settings ) {
		var $elm = $( this );

		plugin.initEventTimeout( $elm, "inactivity.wb-session-timeout", settings.inactivity, settings );
		if ( settings.keepaliveurl !== null ) {
			plugin.initEventTimeout( $elm, "keepalive.wb-session-timeout", settings.keepalive, settings );
		}
	},

	/**
	 * Initializes a timeout that triggers an event
	 * @method initEventTimeout
	 * @param {jQuery DOM Element} $elm Element to trigger the event on
	 * @param {string} eventName Name of the event to trigger on setTimeout
	 * @param {mixed} time Time to wait before triggering the event
	 * @param {Object} settings Key-value object
	 */
	initEventTimeout: function( $elm, eventName, time, settings ) {
		// Clear any existing timeout for the event
		clearTimeout( $elm.data( eventName ) );

		// Create the new timeout that will trigger the event
		$elm.data( eventName, setTimeout( function() {
			$elm.trigger( eventName, settings );
		}, plugin.parseTime( time ) ) );
	},

	/**
	 * Displays the confirm dialog to check if the user wants to keep their session alive.
	 * @method confirmTimeout
	 * @param {integer} reaction Time in milliseconds the user has to interact with the confirm dialog
	 */
	confirmTimeout: function( reaction ) {
		var isConfirmed,
			activeElement = vapour.doc[0].activeElement;

		isConfirmed = window.confirm( plugin.i18nText.timeout.replace( "#expireTime#", plugin.getExpireTime( reaction ) ) );
		activeElement.focus();
		return isConfirmed;
	},

	/**
	 * Returns the current time in milliseconds
	 * @method getCurrentTime
	 * @returns {integer} Current time in milliseconds
	 */
	getCurrentTime: function() {
		return ( new Date() ).getTime();
	},

	/**
	 * Parses a time value into a milliseconds integer value.
	 * @method parseTime
	 * @param {Mixed} value The time value to parse (integer or string)
	 * @returns {integer} Millisecond integer value parsed from the time value
	 */
	parseTime: function( value ) {
		var result, num, mult,
			powers = { "ms": 1, "cs": 10, "ds": 100, "s": 1000, "das": 10000, "hs": 100000, "ks": 1000000 };

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

	/**
	 * Returns a formatted, human readable, string with the amount of time left before
	 * the inactivity check will expire.
	 * @method getExpireTime
	 * @param {integer} reaction Time in milliseconds the user has to interact with the confirm dialog
	 * @returns {string} Formatted time string until inactivity expires
	 */
	getExpireTime: function( reaction ) {
		var expire = new Date( plugin.getCurrentTime() + reaction ),
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
	}
};

// Bind the plugin events
vapour.doc.on( "timerpoke.wb keepalive.wb-session-timeout inactivity.wb-session-timeout reset.wb-session-timeout", plugin.selector, function( event ) {
	switch ( event.type ) {
	case "timerpoke":
		plugin.init.apply( this, arguments );
		break;
	case "keepalive":
		plugin.keepalive.apply( this, arguments );
		break;
	case "inactivity":
		plugin.inactivity.apply( this, arguments );
		break;
	case "reset":
		plugin.reset.apply( this, arguments );
		break;
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( plugin.selector );

}( jQuery, window, vapour ) );
