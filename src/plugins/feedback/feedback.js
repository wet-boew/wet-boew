/*
 * @title WET-BOEW Feedback form
 * @overview Allows users to submit feedback for a specific Web page or Web site.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-feedback",
	$document = vapour.doc,
	feedback, access, contact1, contact2, $web, $mobile, $computer, $info,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var eventTarget = event.target,
			referrerUrl = document.referrer,
			$elm, $feedback, urlParams;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === eventTarget ) {
			$elm = $( eventTarget );
			$feedback = $elm.find( "#feedback" );
			urlParams = vapour.pageUrlParts.params;

			// Cache the form areas
			feedback = $feedback[ 0 ];
			access = document.getElementById( "access" );
			contact1 = document.getElementById( "contact1" );
			contact2 = document.getElementById( "contact2" );
			$web = $elm.find( "#web" );
			$mobile = $web.find( "#mobile" );
			$computer = $web.find( "#computer" );
			$info = $elm.find( "#info" );
				
			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			// Set the initial value for the feedback field based on the query string
			if ( !urlParams.submit && urlParams.feedback ) {
				$feedback.find( "option[value='" + urlParams.feedback + "']" ).attr( "selected", "selected" );
			}

			// Set aria-controls
			feedback.setAttribute( "aria-controls", "web" );
			access.setAttribute( "aria-controls", "mobile computer" );
		
			// Set the initial show/hide state of the form
			showHide( feedback );
			showHide( access );
			showHide( contact1 );
			showHide( contact2 );

			// Prepopulates URL form field with referrer
			document.getElementById( "page" ).setAttribute( "value", referrerUrl );
		}
	},

	/*
	 * @method showHide
	 * @param {DOM element} elm The element triggering the show/hide
	 */
	showHide = function( elm ) {
		var targetId = elm.id,
			$show,
			$hide;

		switch ( targetId ) {
		case "feedback":
			if ( elm.value === "web" ) {
				$show = $web;
			} else {
				$hide = $web;
			}
			break;
		case "access":
			if ( elm.value === "mobile" ) {
				$show = $mobile;
				$hide = $computer;
			} else {
				$show = $computer;
				$hide = $mobile;
			}
			break;
		case "contact1":
		case "contact2":
			if ( document.getElementById( "contact1" ).checked || document.getElementById( "contact2" ).checked ) {
				$show = $info;
			} else {
				$hide = $info;
			}
			break;
		}
				
		// Element to show
		if ( $show ) {
			// TODO: Use CSS transitions instead
			$show.attr( "aria-hidden", "false" ).show( "slow" );
		}

		// Element to hide
		if ( $hide ) {
			// TODO: Use CSS transitions instead
			$hide.attr( "aria-hidden", "true" ).hide( "slow" );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, init );

// Show/hide form areas when certain form fields are changed
$document.on( "keydown click", "#feedback, #access, #contact1, #contact2", function( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		showHide( event.target );
	}
} );

// Return to the form defaults when the reset button is activated
$document.on( "click", selector + " input[type=reset]", function( event ) {
	var which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		showHide( feedback );
		showHide( access );
		showHide( contact1 );
		showHide( contact2 );
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );