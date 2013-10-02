/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * WET-BOEW Form validation
 */
(function ( $, window, document, vapour ) {
	"use strict";

	var selector = ".wb-feedback",
		$document = vapour.doc,
		plugin = {
			init: function ( $elm ) {
				// all plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
				window._timer.remove( selector );

				var $feedback = $elm.find( "#feedback" ),
					$web = $elm.find( "#web" ),
					access = document.getElementById( "access" ),
					$mobile = $web.find( "#mobile" ),
					$computer = $web.find( "#computer" ),
					contact1 = document.getElementById( "contact1" ),
					contact2 = document.getElementById( "contact2" ),
					$info = $elm.find( "#info" ),
					referrerUrl = document.referrer,
					urlParams = vapour.pageUrlParts.params,
					loadEventName = "load.wb-feedback",
					$loadFeedback = $.Event( loadEventName, { target: $feedback[0] } ),
					$loadAccess = $.Event( loadEventName, { target: access } ),
					$loadContact1 = $.Event( loadEventName, { target: contact1 } ),
					$loadContact2 = $.Event( loadEventName, { target: contact2 } );

				$document.on( "keydown click " + loadEventName, "#feedback, #access, #contact1, #contact2", function ( event ) {
					var load = ( event.type === "load" ),
						targetId = this.id,
						button = event.which,
						$show,
						$hide;
					if ( load || ( button !== 2 && button !== 3 ) ) { // Ignore middle/right mouse buttons
						switch (targetId) {
						case "feedback":
							if ( this.value === "web" ) {
								$show = $web;
							} else {
								$hide = $web;
							}
							break;
						case "access":
							if ( this.value === "mobile" ) {
								$show = $mobile;
								$hide = $computer;
							} else {
								$show = $computer;
								$hide = $mobile;
							}
							break;
						case "contact1":
						case "contact2":
							if ( document.getElementById("contact1").checked || document.getElementById("contact2").checked ) {
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

						return true;
					}
				});
				
				// Set aria-controls and trigger load.wb-feedback events
				if ( !urlParams.submit && urlParams.feedback ) {
					$feedback.find( "option[value=\"" + urlParams.feedback + "\"]" ).attr( "selected", "selected" );
				}
				$feedback.attr( "aria-controls", "web" );
				access.setAttribute( "aria-controls", "mobile computer" );
				$document.trigger( $loadFeedback ).trigger( $loadAccess ).trigger( $loadContact1 ).trigger( $loadContact2 );

				// Prepopulates URL form field with referrer
				document.getElementById( "page" ).setAttribute( "value", referrerUrl );

				// Return to the form defaults when the reset button is activated
				$document.on( "click", ".wb-feedback input[type=reset]", function ( event ) {
					var button = event.which;
					if ( button !== 2 && button !== 3 ) { // Ignore middle/right mouse buttons
						$document.trigger( $loadFeedback ).trigger( $loadAccess ).trigger( $loadContact1 ).trigger( $loadContact2 );
					}
				});
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function ( event ) {
		// "this" is cached for all events to utilize
		var eventType = event.type,
			$elm = $( this );

		switch ( eventType ) {
		case "timerpoke":
			plugin.init.apply( this, [ $elm ] );
		}
		return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, document, vapour );