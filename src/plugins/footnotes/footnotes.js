/**
 * @title WET-BOEW Footnotes
 * @overview Provides a consistent, accessible way of handling footnotes across websites.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @EricDunsworth
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-fnote",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	setFocusEvent = "setfocus.wb",
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, footnoteDd, footnoteDt, i, len, dd, dt;

		if ( elm ) {
			$elm = $( elm );
			footnoteDd = elm.getElementsByTagName( "dd" );
			footnoteDt = elm.getElementsByTagName( "dt" );

			// Apply aria-labelledby and set initial event handlers for return to referrer links
			len = footnoteDd.length;
			for ( i = 0; i !== len; i += 1 ) {
				dd = footnoteDd[ i ];
				dt = footnoteDt[ i ];
				dd.setAttribute( "tabindex", "-1" );
				dt.id = dd.id + "-dt";
			}

			// Remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
			$elm.find( "dd p.fn-rtn a span span" ).remove();

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
					ref,
					refId;

				// Ignore middle/right mouse button
				if ( !which || which === 1 ) {
					ref = event.target.getAttribute( "href" );

					// Focus on associated referrer link (if the return link points to an ID)
					if ( ref.charAt( 0 ) === "#" ) {
						refId = "#" + wb.jqEscape( ref.substring( 1 ) );

						// Assign focus to the link
						$document.find( refId + " a" ).trigger( setFocusEvent );
						return false;
					}
				}
			} );

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
