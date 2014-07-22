/**
 * @title WET-BOEW Focus
 * @overview User agent safe way of assigning focus to an element
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, wb ) {
"use strict";

var $document = wb.doc,
	hash = wb.pageUrlParts.hash,
	clickEvents = "click vclick",
	setFocusEvent = "setfocus.wb",
	linkSelector = "a[href]",
	$linkTarget;

// Bind the setfocus event
$document.on( setFocusEvent, function( event ) {
	if ( event.namespace === "wb" ) {
		var $elm = $( event.target );

		// Set the tabindex to -1 (as needed) to ensure the element is focusable
		$elm
			.filter( ":not([tabindex], a[href], button, input, textarea, select)" )
				.attr( "tabindex", "-1" );

		// Assigns focus to an element (delay allows for revealing of hidden content)
		setTimeout(function() {
			$elm.trigger( "focus" );

			var $topBar = $( ".wb-bar-t[aria-hidden=false]" );

			// Ensure the top bar overlay does not conceal the focus target
			if ( $topBar.length !== 0 ) {
				document.documentElement.scrollTop -= $topBar.outerHeight();
			}

			return $elm;
		}, 100 );
	}
});

// Set focus to the target of a deep link from a different page
// (helps browsers that can't set the focus on their own)
if ( hash && ( $linkTarget = $( hash ) ).length !== 0 ) {
	$linkTarget.trigger( setFocusEvent );
}

// Helper for browsers that can't change keyboard and/or event focus on a same page link click
$document.on( clickEvents, linkSelector, function( event ) {
	var testHref = event.currentTarget.getAttribute( "href" );

	// Same page links only
	if ( testHref.charAt( 0 ) === "#" && !event.isDefaultPrevented() &&
		( $linkTarget = $( testHref ) ).length !== 0 ) {

		$linkTarget.trigger( setFocusEvent );
	}
});

})( jQuery, wb );
