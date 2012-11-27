/*!
 *	Flash IE6/IE7 fix for safe flash unloading and loading
 *	@credits: http://www.longtailvideo.com/support/forums/jw-player/bug-reports/10374/javascript-error-with-embed
 */
(function () {
	var setRemoveCallback = function () {
			__flash__removeCallback = function (instance, name) {
				if (instance) {
					instance[name] = null;
				}
			};
			window.setTimeout(setRemoveCallback, 10);
		};
	setRemoveCallback();
})();
