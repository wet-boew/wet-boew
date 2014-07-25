/**
 * @title WET-BOEW Data Ajax [data-ajax-after], [data-ajax-append],
 * [data-ajax-before], [data-ajax-prepend] and [data-ajax-replace]
 * @overview A basic AjaxLoader wrapper that inserts AJAXed-in content
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once
 * per page, not once per instance of plugin on the page. So, this is a good
 * place to define variables that are common to all instances of the plugin on a
 * page.
 */
var pluginName = "wb-data-ajax",
	selector = "[data-ajax-after], [data-ajax-append], [data-ajax-before], " +
		"[data-ajax-prepend], [data-ajax-replace]",
	inited = "-inited",
	initEvent = "wb-init." + pluginName,
	readyEvent = "wb-ready." + pluginName,
	$document = wb.doc,

	/**
	 * Init runs once per plugin element on the page. There may be multiple
	 * elements. It will run more than once per plugin if you don't remove the
	 * selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 * @param {string} ajaxType The type of AJAX operation, either after, append, before or replace
	 */
	init = function( $elm, ajaxType ) {
		var url = $elm.data( "ajax-" + ajaxType ),
			initedClass = pluginName + "-" + ajaxType + inited;

		// Only initialize the element once for the ajaxType
		if ( !$elm.hasClass( initedClass ) ) {
			wb.remove( selector );
			$elm.addClass( initedClass );

			$document.trigger({
				type: "ajax-fetch.wb",
				element: $elm,
				fetch: {
					url: url
				}
			});
		}
	};

$document.on( "timerpoke.wb " + initEvent + " ajax-fetched.wb", selector, function( event ) {
	var eventTarget = event.target,
		eventType = event.type,
		ajaxTypes = [
			"before",
			"replace",
			"after",
			"append",
			"prepend"
		],
		len = ajaxTypes.length,
		$elm, ajaxType, i, content;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		$elm = $( eventTarget );

		for ( i = 0; i !== len; i += 1 ) {
			ajaxType = ajaxTypes[ i ];
			if ( this.getAttribute( "data-ajax-" + ajaxType ) !== null ) {
				break;
			}
		}

		switch ( eventType ) {

		case "timerpoke":
		case "wb-init":
			init( $elm, ajaxType );
			break;

		default:

			// ajax-fetched event
			content = event.fetch.pointer.html();
			$elm.removeAttr( "data-ajax-" + ajaxType );

			// "replace" is the only event that doesn't map to a jQuery function
			if ( ajaxType === "replace") {
				$elm.html( content );
			} else {
				$elm[ ajaxType ]( content );
			}

			$elm.trigger( readyEvent, [ ajaxType ] );
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being
	 * passive about our control, so returning true allows for events to always
	 * continue
	 */
	return true;
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
