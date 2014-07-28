/**
 * @title WET-BOEW Footnotes
 * @overview Provides a consistent, accessible way of handling footnotes across websites.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @EricDunsworth
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var pluginName = "wb-fnote",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	readyEvent = "wb-ready" + selector,
	setFocusEvent = "setfocus.wb",
	$document = wb.doc,

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var elm = event.target,
			$elm, footnoteDd, footnoteDt, i, len, dd, dt, dtId, $returnLinks;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === elm &&
			elm.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			elm.className += " " + initedClass;

			$elm = $( elm );
			footnoteDd = elm.getElementsByTagName( "dd" );
			footnoteDt = elm.getElementsByTagName( "dt" );

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			wb.remove( selector );

			// Apply aria-labelledby and set initial event handlers for return to referrer links
			len = footnoteDd.length;
			for ( i = 0; i !== len; i += 1 ) {
				dd = footnoteDd[ i ];
				dt = footnoteDt[ i ];
				dtId = dd.id + "-dt";
				dd.setAttribute( "tabindex", "-1" );
				dd.setAttribute( "aria-labelledby", dtId );
				dt.id = dtId ;
			}

			// Remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
			$returnLinks = $elm.find( "dd p.fn-rtn a span span" ).remove();

			$elm.trigger( readyEvent );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Listen for footnote reference links that get clicked
$document.on( "click vclick", "main :not(" + selector + ") sup a.fn-lnk", function( event ) {
	var eventTarget = event.target,
		which = event.which,
		refId, $refLinkDest;

	// Ignore middle/right mouse button
	if ( !which || which === 1 ) {
		refId = "#" + wb.jqEscape( eventTarget.getAttribute( "href" ).substring( 1 ) );
		$refLinkDest = $document.find( refId );

		$refLinkDest.find( "p.fn-rtn a" )
					.attr( "href", "#" + eventTarget.parentNode.id );

		// Assign focus to $refLinkDest
		$refLinkDest.trigger( setFocusEvent );
		return false;
	}
} );

// Listen for footnote return links that get clicked
$document.on( "click vclick", selector + " dd p.fn-rtn a", function( event ) {
	var which = event.which,
		refId;

	// Ignore middle/right mouse button
	if ( !which || which === 1 ) {
		refId = "#" + wb.jqEscape( event.target.getAttribute( "href" ).substring( 1 ) );

		// Assign focus to the link
		$document.find( refId + " a" ).trigger( setFocusEvent );
		return false;
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
