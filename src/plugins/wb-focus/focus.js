/**
 * @title WET-BOEW Focus
 * @overview User agent safe way of assigning focus to an element
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	$window = wb.win,
	clickEvents = "click vclick",
	setFocusEvent = "setfocus.wb",
	linkSelector = "a[href]",
	$linkTarget,

	/**
	 * @method processHash
	 */
	processHash = function() {
		var hash = wb.pageUrlParts.hash;

		if ( hash && ( $linkTarget = $( "#" + wb.jqEscape( hash.substring( 1 ) ) ) ).length !== 0 ) {
			$linkTarget.trigger( setFocusEvent );
		}
	};

// Bind the setfocus event
$document.on( setFocusEvent, function( event ) {
	if ( event.namespace === "wb" ) {
		var $elm = $( event.target ),
			$closedParents = $elm.not( "summary" ).parents( "details, [role='tabpanel']" ),
			$closedPanels, $closedPanel, len, i;

		if ( $closedParents.length !== 0 ) {

			// Open any closed ancestor details elements
			$closedParents.not( "[open]" ).children( "summary" ).trigger( "click" );

			// Open any closed tabpanels
			$closedPanels = $closedParents.filter( "[aria-hidden='true']" );
			len = $closedPanels.length;
			for ( i = 0; i !== len; i += 1 ) {
				$closedPanel = $closedPanels.eq( i );
				$closedPanel.closest( ".wb-tabs" )
					.find( "#" + $closedPanel.attr( "aria-labelledby" ) )
					.trigger( "click" );
			}
		}

		// Set the tabindex to -1 (as needed) to ensure the element is focusable
		$elm
			.filter( ":not([tabindex], a[href], button, input, textarea, select)" )
			.attr( "tabindex", "-1" );

		// Assigns focus to an element (delay allows for revealing of hidden content)
		setTimeout( function() {
			$elm.trigger( "focus" );

			var $topBar = $( ".wb-bar-t[aria-hidden=false]" );

			// Ensure the top bar overlay does not conceal the focus target
			if ( $topBar.length !== 0 ) {
				document.documentElement.scrollTop -= $topBar.outerHeight();
			}

			return $elm;
		}, 100 );
	}
} );

// Set focus to the target of a deep link from a different page
// (helps browsers that can't set the focus on their own)
$document.on( "wb-ready.wb", processHash );

// Handle any changes to the URL hash after the page has loaded
$window.on( "hashchange", function() {
	wb.pageUrlParts.hash = window.location.hash;
	if ( !wb.ignoreHashChange ) {
		processHash();
	}
} );

// Helper for browsers that can't change keyboard and/or event focus on a same page link click
$document.on( clickEvents, linkSelector, function( event ) {
	var testHref = event.currentTarget.getAttribute( "href" );

	// Same page links only
	if ( testHref.length > 1 && testHref.charAt( 0 ) === "#" && !event.isDefaultPrevented() &&
		( $linkTarget = $( "#" + wb.jqEscape( testHref.substring( 1 ) ) ) ).length !== 0 ) {
		wb.ignoreHashChange = true;
		$linkTarget.trigger( setFocusEvent );
	}
} );

} )( jQuery, wb );
