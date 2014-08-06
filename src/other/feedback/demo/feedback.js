/**
 * @title WET-BOEW Feedback form
 * @overview Allows users to submit feedback for a specific Web page or Web site.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-fdbck",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	fbrsn, fbaxs, fbcntc1, fbcntc2, $fbweb, $fbmob, $fbcomp, $fbinfo,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			referrerUrl = document.referrer,
			$elm, $fbrsn, urlParams;

		if ( elm ) {
			$elm = $( elm );
			$fbrsn = $elm.find( "#fbrsn" );
			urlParams = wb.pageUrlParts.params;

			// Cache the form areas
			fbrsn = $fbrsn[ 0 ];
			fbaxs = document.getElementById( "fbaxs" );
			fbcntc1 = document.getElementById( "fbcntc1" );
			fbcntc2 = document.getElementById( "fbcntc2" );
			$fbweb = $elm.find( "#fbweb" );
			$fbmob = $fbweb.find( "#fbmob" );
			$fbcomp = $fbweb.find( "#fbcomp" );
			$fbinfo = $elm.find( "#fbinfo" );

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

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	},

	/**
	 * @method showHide
	 * @param {DOM element} elm The element triggering the show/hide
	 */
	showHide = function( elm ) {
		var $hide, $show,
			classHide = "hide",
			classShow = "show",
			funcToggle = "toggle",
			targetId = elm.id;

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
			$show
				.attr( "aria-hidden", "false" )
				.wb( funcToggle, classShow, classHide );
		}

		// Element to hide
		if ( $hide ) {
			$hide
				.attr( "aria-hidden", "true" )
				.wb( funcToggle, classHide, classShow );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

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

		// Manually reset the form as this event handler can be triggered
		// before the browser invokes the native form reset.
		event.target.form.reset();

		showHide( fbrsn );
		showHide( fbaxs );
		showHide( fbcntc1 );
		showHide( fbcntc2 );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
