/*
 * @title WET-BOEW Twitter embedded timeline
 * @overview This plugin helps with implementing Twitter embedded timelines.
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
	i18n, i18nText,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( _elm, $elm ) {

		var $loading, $content,	protocol;

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = window.i18n;
			i18nText = {
				loading: i18n( "%loading" )
			};
		}

		$loading = $( "<a class='widget-state-loading'><img src='assets/ajax-loader.gif' alt='" + i18nText.loading + "' /></a>" );
		$content = $elm.find( ".twitter-timeline" );
		$content.append( $loading );

		protocol = vapour.pageUrlParts.protocol;
		window.Modernizr.load( {
			load: ( protocol.indexOf( "http" ) === -1 ? "http" : protocol ) + "://platform.twitter.com/widgets.js"
		});
	};

$document.on( "timerpoke.wb", selector, function() {
	init( this, $( this ) );

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control, 
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
