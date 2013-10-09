/*
 * @title WET-BOEW Footnotes
 * @overview Provides a consistent, accessible way of handling footnotes across websites.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @EricDunsworth
 */
(function ( $, window, vapour ) {
	"use strict";
	
	/* 
	 * Variable and function definitions. 
	 * These are global to the plugin - meaning that they will be initialized once per page,
	 * not once per instance of plugin on the page. So, this is a good place to define
	 * variables that are common to all instances of the plugin on a page.
	 */
	var selector = ".wb-footnotes",
		$document = vapour.doc,

		/*
		 * Init runs once per plugin element on the page. There may be multiple elements. 
		 * It will run more than once per plugin if you don't remove the selector from the timer.
		 * @method init
		 * @param {DOM element} _elm The plugin element being initialized
		 * @param {jQuery DOM element} $elm The plugin element being initialized
		 */
		init = function ( _elm, $elm ) {
			var footnote_dd = _elm.getElementsByTagName( "dd" ),
				footnote_dt = _elm.getElementsByTagName( "dt" ),
				i, len, dd, dt, dtId, $returnLinks;

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			// Apply aria-labelledby and set initial event handlers for return to referrer links
			len = footnote_dd.length;
			for ( i = 0; i !== len; i += 1 ) {
				dd = footnote_dd[ i ];
				dt = footnote_dt[ i ];
				dtId = dd.id + "-dt";
				dd.setAttribute( "tabindex", "-1" );
				dd.setAttribute( "aria-labelledby", dtId );
				dt.id = dtId ;
			}

			// Remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
			$returnLinks = $elm.find( "dd p.footnote-return a span span" ).remove();
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function () {
		init( this, $( this ) );

		return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	});
	
	// Listen for footnote reference links that get clicked
	$document.on( "click vclick", "main :not(.wb-footnotes) sup a.footnote-link", function ( event ) {
		var button = event.which,
			refId, $refLinkDest;

		// Ignore middle/right mouse button
		if ( !button || button === 1 ) {
			refId = "#" + vapour.jqEscape( this.getAttribute( "href" ).substring( 1 ) );
			$refLinkDest = $document.find( refId );
		
			$refLinkDest.find( "p.footnote-return a" )
						.attr( "href", "#" + this.parentNode.id );

			//TODO: Replace with global focus function
			setTimeout( function () {
				$refLinkDest.focus();
			}, 0 );
			return false;
		}
	} );

	// Listen for footnote return links that get clicked
	$document.on( "click.wb-footnotes vclick.wb-footnotes", selector + " dd p.footnote-return a", function( event ) {
		var button = event.which,
			refId;

		// Ignore middle/right mouse buttons
		if ( !button || button === 1 ) {
			refId = "#" + vapour.jqEscape( this.getAttribute( "href" ).substring( 1 ) );

			//TODO: Replace with global focus function
			setTimeout( function () {
				$document.find( refId + " a" ).focus();
			}, 0 );
			return false;
		}
	} );

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );

} )( jQuery, window, vapour );
