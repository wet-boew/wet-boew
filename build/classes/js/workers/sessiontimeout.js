/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Share widget plugin
 */
/*global jQuery: false, pe:false, wet_boew_sessiontimeout:false, alert:false, confirm:false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.sessiontimeout = {
		type : 'plugin',
		depends : ['metadata'],
		_exec : function (elm) {
			var opts,
				// An overlay over the screen when showing the dialog message
				// Added &nbsp; to fix Chrome bug (received from Charlie Lavers - PWGSC)
				overLay = '<div class="sOverlay jqmOverlay">&#160;</div>',
				liveTimeout,
				sessionTimeout,
				keep_session,
				start_liveTimeout,
				displayTimeoutMessage,
				logout,
				getCurrentTimeMs,
				redirect,
				stay_logged_in,
				timeParse,
				getExpireTime;

			// Defaults
			opts = {
				inactivity: 1200000,		// default inactivity period 20 minutes
				reactionTime: 30000,		// default confirmation period of 30 seconds
				sessionalive: 1200000,		// default session alive period 20 minutes
				logouturl: './',			// can't really set a default logout URL
				refreshOnClick: true,		// refresh session if user clicks on the page
				// Ajax call back url function to server to keep the session alive, this has to return true or false from server on success
				refreshCallbackUrl: './',	// Can't really set a default callbackurl
				regex:	/^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
				powers:	{'ms': 1, 'cs': 10, 'ds': 100, 's': 1000, 'das': 10000, 'hs': 100000, 'ks': 1000000}
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_sessiontimeout), class-based overrides and the data attribute
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_sessiontimeout !== 'undefined' && wet_boew_sessiontimeout !== null) {
				$.extend(opts, wet_boew_sessiontimeout, elm.metadata());
			} else {
				$.extend(opts, elm.metadata());
			}
		
			//------------------------------------------------------ Main functions

			keep_session = function () {
				clearTimeout(sessionTimeout);
				// If the refreshCallbackUrl not present then dont show any error
				if (opts.refreshCallbackUrl.length > 2) {
					$.post(opts.refreshCallbackUrl,	function (responseData) {
						// if the response data returns "false", we should display that the session has timed out.
						if (responseData && responseData.replace(/\s/g, "") !== "false") {
							sessionTimeout = setTimeout(keep_session, timeParse(opts.sessionalive));
						} else {
							alert(pe.dic.get('%st-already-timeout-msg'));
							redirect();
						}	
					});
				}
			};

			start_liveTimeout = function () {
				clearTimeout(liveTimeout);
				liveTimeout = setTimeout(logout, timeParse(opts.inactivity));
				if (opts.sessionalive) {
					keep_session();
				}
			};

			// code to display the alert message
			displayTimeoutMessage = function () {
				var expireTime = getExpireTime(),
					$where_was_i = document.activeElement, // Grab where the focus in the page was BEFORE the modal dialog appears
					result;

				$(document.body).append(overLay);
				result = confirm(pe.dic.get('%st-timeout-msg').replace("#expireTime#", expireTime));
				$where_was_i.focus();
				$('.jqmOverlay').detach();
				return result;
			};

			logout = function () {
				var start = getCurrentTimeMs();

				// because of short circuit evaluation, this statement 
				// will show the dialog before evaluating the time, thus the 
				// getCurrentTimeMs() will return the time after the alert
				// box is shown.
				if (displayTimeoutMessage() && getCurrentTimeMs() - start <= opts.reactionTime) {
					stay_logged_in();
				} else {
					redirect();
				}
			};

			//--------------------------------------------------- Utility functions
	
			getCurrentTimeMs = function () {
				return (new Date()).getTime();
			};

			redirect = function () {
				window.location.href = opts.logouturl;
			};

			stay_logged_in = start_liveTimeout;
		
			// Parsing function for time period
			timeParse = function (value) {
				var result, num, mult;
				if (typeof value === 'undefined' || value === null) {
					return null;
				}

				result = opts.regex.exec($.trim(value.toString()));
				if (result[2]) {
					num = parseFloat(result[1]);
					mult = opts.powers[result[2]] || 1;
					return num * mult;
				} else {
					return value;
				}
			};

			getExpireTime = function () {
				var expire = new Date(getCurrentTimeMs() + opts.reactionTime),
					hours = expire.getHours(), 
					minutes = expire.getMinutes(), 
					seconds = expire.getSeconds(),
					timeformat = hours < 12 ? " AM" : " PM";
					
				hours = hours % 12;
				if (hours === 0) {
					hours = 12;
				}

				// Add a zero if needed in the time
				hours = hours < 10 ? '0' + hours : hours;
				minutes = minutes < 10 ? '0' + minutes : minutes;
				seconds = seconds < 10 ? '0' + seconds : seconds;

				return hours + ":" + minutes + ":" + seconds + timeformat;
			};
		
			start_liveTimeout();
			if (opts.refreshOnClick) {
				$(document).on('click', start_liveTimeout);
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
