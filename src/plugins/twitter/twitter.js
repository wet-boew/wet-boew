/*
 * @title WET-BOEW Twitter embedded timeline
 * @overview Helps with implementing Twitter embedded timelines.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-twitter",
	$document = vapour.doc,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {

		// Filter out any events triggered by descendants
		if ( event.currentTarget === event.target ) {
			var protocol = vapour.pageUrlParts.protocol;

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			Modernizr.load( {
				load: ( protocol.indexOf( "http" ) === -1 ? "http:" : protocol ) + "//platform.twitter.com/widgets.js"
			});
		}
	};

$document.on( "timerpoke.wb", selector, init );

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
