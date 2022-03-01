/**
 * @title WET-BOEW wb-data-scrub
 * @overview This plugin delete Personal Identifiable Information (PII) from the flagged form fields before form submit
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @polmih, @duboisp, @GormFrank
 **/
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-data-scrub",
	selector = "[data-rule-wbscrub]",
	initEvent = "wb-init" + componentName,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		if ( elm && $( elm.form ).data( "scrub-inited" ) !== "" ) {

			var	form = elm.form;

			$( elm.form ).data( "scrub-inited", "" );

			form.addEventListener( "submit", function() {
				var isScrubbed = false,
					$inputScrubEngaged = $( "input[data-wbscrub-flag]", elm.form );

				// identify form elements that were assigned to be scrubbed
				$( selector, form ).each( function() {

					var $elmInput = $( this ),
						elmInputVal = $elmInput.val(),
						inpValLenght = elmInputVal.length;

					// if the helper find any PII values clean the PII and assign new value to the form element with the output string
					$elmInput.val( wb.findPotentialPII( elmInputVal, true ) === false ? elmInputVal : wb.findPotentialPII( elmInputVal, true ) );

					//if the output is not the same as the initial value, PII was deleted
					if ( $elmInput.val().length !== inpValLenght ) {
						isScrubbed = true;
					}
				} );

				// if the publisher added the input with inputScrubEngaged and no PII was found/removed, do not submit that input
				if ( $inputScrubEngaged ) {
					$inputScrubEngaged.prop( "disabled", !isScrubbed );
				}
			} );

			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
