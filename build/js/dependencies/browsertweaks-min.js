/*!
 *	Flash IE6/IE7 fix for safe flash unloading and loading
 *	@credits: http://www.longtailvideo.com/support/forums/jw-player/bug-reports/10374/javascript-error-with-embed
 */
(function(){var a=function(){__flash__removeCallback=function(b,c){if(b){b[c]=null}};window.setTimeout(a,10)};a()})();