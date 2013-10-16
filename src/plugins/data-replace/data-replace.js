/*
 * @title WET-BOEW Ajax Loader [ data-replace ]
 * @overview A basic AjaxLoader wrapper for WET-BOEW for replacing elements
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, window, vapour ) {
"use strict";

$.ajaxSettings.cache = false;

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = "[data-ajax-replace]",
	$document = vapour.doc,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function ( $elm ) {

		var _url = $elm.data( "ajax-replace" );

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		$document.trigger( {
			type: "ajax-fetch.wb",
			element: $elm,
			fetch: _url
		});

	};

$document.on( "timerpoke.wb ajax-fetched.wb", selector, function( event ) {
	var eventType = event.type,
		$elm = $( this );

	switch ( eventType ) {
	case "timerpoke":
		init( $elm );
		break;
	case "ajax-fetched":
		$elm.removeAttr( "data-ajax-replace" )
			.html( event.pointer.html() )
			.trigger( "ajax-replace-loaded.wb" );
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
