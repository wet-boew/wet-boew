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
var selector = ".wb-fdbck",
	$document = vapour.doc,
	fbrsn, fbaxs, fbcntc1, fbcntc2, $fbweb, $fbmob, $fbcomp, $fbinfo,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var eventTarget = event.target,
			referrerUrl = document.referrer,
			$elm, $fbrsn, urlParams;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === eventTarget ) {
			$elm = $( eventTarget );
			$fbrsn = $elm.find( "#fbrsn" );
			urlParams = vapour.pageUrlParts.params;

			// Cache the form areas
			fbrsn = $fbrsn[ 0 ];
			fbaxs = document.getElementById( "fbaxs" );
			fbcntc1 = document.getElementById( "fbcntc1" );
			fbcntc2 = document.getElementById( "fbcntc2" );
			$fbweb = $elm.find( "#fbweb" );
			$fbmob = $fbweb.find( "#fbmob" );
			$fbcomp = $fbweb.find( "#fbcomp" );
			$fbinfo = $elm.find( "#fbinfo" );
				
			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			// Set the initial value for the fbrsn field based on the query string
			if ( !urlParams.submit && urlParams.fbrsn ) {
				$fbrsn.find( "option[value='" + urlParams.fbrsn + "']" ).attr( "selected", "selected" );
			}

			// Set aria-controls
			fbrsn.setAttribute( "aria-controls", "fbweb" );
			fbaxs.setAttribute( "aria-controls", "fbmob fbcomp" );
		
			// Set the initial show/hide state of the form
			showHide( fbrsn );
			showHide( fbaxs );
			showHide( fbcntc1 );
			showHide( fbcntc2 );

			// Prepopulates URL form field with referrer
			document.getElementById( "fbpg" ).setAttribute( "value", referrerUrl );
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
		case "fbrsn":
			if ( elm.value === "web" ) {
				$show = $fbweb;
			} else {
				$hide = $fbweb;
			}
			break;
		case "fbaxs":
			if ( elm.value === "mobile" ) {
				$show = $fbmob;
				$hide = $fbcomp;
			} else {
				$show = $fbcomp;
				$hide = $fbmob;
			}
			break;
		case "fbcntc1":
		case "fbcntc2":
			if ( document.getElementById( "fbcntc1" ).checked || document.getElementById( "fbcntc2" ).checked ) {
				$show = $fbinfo;
			} else {
				$hide = $fbinfo;
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
$document.on( "keydown click change", "#fbrsn, #fbaxs, #fbcntc1, #fbcntc2", function( event ) {
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
		showHide( fbrsn );
		showHide( fbaxs );
		showHide( fbcntc1 );
		showHide( fbcntc2 );
	}
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );