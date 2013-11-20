/*
 * @title WET-BOEW Focus
 * @overview User agent safe way of assigning focus to an element
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, vapour ) {
"use strict";

var $document = vapour.doc,
	linkFocusTested = false,
	clickEvents = "click.wb-focus vclick.wb-focus",
	focusOutEvent = "focusout.wb-focus",
	linkSelector = "a[href]",
	testHref = "",
	testTimeout;

// Test and helper for browsers that can't change focus on a same page link click
$document.on( clickEvents, linkSelector, function( event ) {
	var testHref = event.currentTarget.getAttribute( "href" ),
		$linkTarget;

	// Same page links only
	if ( testHref.charAt( 0 ) === "#" &&
		( $linkTarget = $( testHref ) ).length !== 0 ) {

		// Ensure the test is run only once
		if ( linkFocusTested ) {
			$linkTarget.trigger( "setfocus.wb" );
		} else {

			// If the focus changes before the timeout expires, then the
			// browser can change focus on a same page link click
			$document.one( focusOutEvent, testHref, function() {

				// Browser can change focus on a same page link click so disable help
				clearTimeout( testTimeout );
				$document.off( clickEvents, linkSelector );
			});

			// If the timeout expires before focus changes, then the browser
			// can't change focus on a same page link click
			testTimeout = setTimeout(function() {

				// Browser can't change focus on a same page link click so enable help
				$document.off( focusOutEvent, testHref );
				linkFocusTested = true;

				$linkTarget.trigger( "setfocus.wb" );
			}, 20 );
		}
	}
});


// Bind the setfocus event
$document.on( "setfocus.wb", function ( event ) {
	var $elm = $( event.target );

	// If link focus test is underway and hasn't been completed then stop the test
	if ( !linkFocusTested && testHref.length !== 0 ) {
		clearTimeout( testTimeout );
		$document.off( focusOutEvent, testHref );
		testHref = "";
	}
	
	// Set the tabindex to -1 (as needed) to ensure the element is focusable
	$elm
		.filter( ":not([tabindex], a, button, input, textarea, select)" )
			.attr( "tabindex", "-1" );

	// Assigns focus to an element
	setTimeout(function () {
		return $elm.focus();
	}, 0 );
});

})( jQuery, vapour );
