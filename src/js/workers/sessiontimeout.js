/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Session timeout plugin
 */
/*global wet_boew_sessiontimeout: false, alert: false, confirm: false */
(function ($) {
    "use strict";
    var _pe = window.pe || {
        fn: {}
    };
    /* local reference */
    _pe.fn.sessiontimeout = {
        type: 'plugin',
        _exec: function (elm) {
            var opts,
                // An overlay over the screen when showing the dialog message
                // Added &#160; to fix Chrome bug (received from Charlie Lavers - PWGSC)
                overLay = '<div class="sOverlay jqmOverlay">&#160;</div>',
                liveTimeout,
                sessionTimeout,
                keep_session,
                start_liveTimeout,
                start_sessionTimeout,
                displayTimeoutMessage,
                logout,
                getCurrentTimeMs,
                redirect,
                timeParse,
                getExpireTime,
                alreadyTimeoutMsg = _pe.dic.get('%st-already-timeout-msg'),
                timeoutMsgBegin = _pe.dic.get('%st-timeout-msg-bgn'),
                timeoutMsgEnd = _pe.dic.get('%st-timeout-msg-end'),
                lastActivity,
                lastAjaxCall = 0;

            // Defaults
            opts = {
                ajaxLimiter: 200000,        // default period of 2 minutes (ajax calls happen only once during this period)
                inactivity: 1200000,        // default inactivity period 20 minutes
                reactionTime: 180000,       // default confirmation period of 3 minutes
                sessionalive: 1200000,      // default session alive period 20 minutes
                logouturl: './',            // can't really set a default logout URL
                refreshOnClick: true,       // refresh session if user clicks on the page
                // Ajax call back url function to server to keep the session alive, this has to return true or false from server on success
                refreshCallbackUrl: './',   // Can't really set a default callbackurl
                regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
                powers: {
                    'ms': 1,
                    'cs': 10,
                    'ds': 100,
                    's': 1000,
                    'das': 10000,
                    'hs': 100000,
                    'ks': 1000000
                }
            };

            // Extend the defaults with settings passed through settings.js (wet_boew_sessiontimeout) and the data-wet-boew attribute
            $.extend(opts, (typeof wet_boew_sessiontimeout !== 'undefined' ? wet_boew_sessiontimeout : {}), _pe.data.getData(elm, 'wet-boew'));

            //------------------------------------------------------ Main functions

            keep_session = function () {
                // If the refreshCallbackUrl not present then dont show any error
                if (opts.refreshCallbackUrl.length > 2) {
                    $.post(opts.refreshCallbackUrl, function (responseData) {
                        // if the response data returns anything but "true", we should display that the session has timed out.
                        if (responseData && responseData.replace(/\s/g, '') === 'true') {
                            start_sessionTimeout();
                        } else {
                            alert(alreadyTimeoutMsg);
                            redirect();
                        }
                    });
                }
            };

            start_liveTimeout = function () {
                clearTimeout(liveTimeout);
                liveTimeout = setTimeout(logout, timeParse(opts.inactivity));
            };

            start_sessionTimeout = function () {
                clearTimeout(sessionTimeout);
                sessionTimeout = setTimeout(keep_session, timeParse(opts.sessionalive));
            };

            // code to display the alert message
            displayTimeoutMessage = function () {
                var expireTime = getExpireTime(opts.reactionTime),
                    timeoutMsg = timeoutMsgBegin.replace('#min#', expireTime.minutes).replace('#sec#', expireTime.seconds) + ' ' + timeoutMsgEnd,
                    $where_was_i = document.activeElement, // Grab where the focus in the page was BEFORE the modal dialog appears
                    result;

                $(document.body).append(overLay);
                result = confirm(timeoutMsg);
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
                    keep_session();
                    start_liveTimeout();
                    start_sessionTimeout();
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

            /*
             * Converts a millisecond value into minutes and seconds
             * @function getExpireTime
             * @param {integer} milliseconds The time value in milliseconds
             * @returns {Object} An object with a seconds and minutes property
             */
            getExpireTime = function( milliseconds ) {
                var time = { minutes: "", seconds: "" };

                if ( milliseconds != null ) {
                    time.minutes = parseInt( ( milliseconds / ( 1000 * 60 ) ) % 60, 10 );
                    time.seconds = parseInt( ( milliseconds / 1000 ) % 60, 10 );
                }
                return time;
            };

            start_liveTimeout();
            start_sessionTimeout();

            if (opts.refreshOnClick) {
                _pe.document.on('click', function (e) {

                    // If there is a click on the page
                    if (typeof e.button === 'undefined' || e.button === _pe.leftMouseButton) { //ignore middle and right button
                        if (lastActivity >= 1 && (getCurrentTimeMs() - lastAjaxCall) > opts.ajaxLimiter) {
                            // Set the time of the last ajax call
                            lastAjaxCall = getCurrentTimeMs();
                            // Reset the activity counter
                            lastActivity = 0;
                            keep_session();
                        } else {
                            lastActivity = getCurrentTimeMs();
                        } // END OF if (lastActivity >= 1 && ...
                        start_liveTimeout();
                        start_sessionTimeout();
                    }
                });
            }

            return elm;
        } // end of exec
    };
    window.pe = _pe;
    return _pe;
}
(jQuery));
