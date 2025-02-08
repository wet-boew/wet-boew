/**
 * @title WET-BOEW wb-postback
 * @overview This plugin implements AJAX request for form data to submit on same page without refresh
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @masterbee, @namjohn920, @GormFrank
 **/
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-postback",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	failEvent = "fail" + selector,
	successEvent = "success" + selector,
	defaults = {},

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {
			var $elm = $( elm ),
				settings = $.extend(
					true,
					{},
					defaults,
					wb.getData( $elm, componentName )
				),
				multiple = typeof $elm.data( componentName + "-multiple" ) !== "undefined",
				classToggle = settings.toggle || "hide",
				selectorSuccess = settings.success,
				selectorFailure = settings.failure || selectorSuccess;
			const attrBlocked = "data-wb-blocked",
				attrPIIBlocked = "data-wb-pii-blocked",
				attrSending = "data-wb-sending";

			elm.addEventListener( "submit", function( e ) {

				// Prevent regular form submit
				e.preventDefault();

				//Check if the form use the validation plugin
				if ( elm.parentElement.classList.contains( "wb-frmvld" ) ) {

					// Block invalid forms and allow valid ones
					if ( !$elm.valid() ) {
						$( this ).attr( attrBlocked, "true" );
					} else {
						$( this ).removeAttr( attrBlocked );
					}
				}

				// Submit the form unless it's blocked or currently being sent
				if ( !$( this ).attr( attrBlocked ) && !$( this ).attr( attrSending ) && !$( this ).attr( attrPIIBlocked ) ) {
					$elm.trigger( componentName + ".submit", e.submitter );
				}
			} );

			$elm.on( componentName + ".submit", function( event, submitter ) {
				var data = $elm.serializeArray(),
					$selectorSuccess = $( selectorSuccess ),
					$selectorFailure = $( selectorFailure );

				// Indicate that the form is currently being sent (to prevent multiple submissions in parallel)
				$( this ).attr( attrSending, true );

				// If the submit button contains a variable, add it to the form's parameters
				// Note: Submitting a form via Enter will act as if the FIRST submit button was pressed. Therefore, that button's variable will be added (as opposed to nothing). This is in line with default form submission behaviour.
				if ( submitter && submitter.name ) {
					data.push( { name: submitter.name, value: submitter.value } );
				}

				// Hide feedback messages
				$selectorFailure.addClass( classToggle );
				$selectorSuccess.addClass( classToggle );

				// Send the form through ajax and ignore the response body.
				$.ajax( {
					type: this.method,
					url: this.action,
					data: $.param( data )
				} )
					.done( function() {
						$elm.trigger( successEvent );
						$selectorSuccess.removeClass( classToggle );
					} )
					.fail( function( response ) {
						$elm.trigger( failEvent, response );
						$selectorFailure.removeClass( classToggle );
					} )
					.always( function() {

						// Hide the form unless multiple submits are allowed
						if ( !multiple ) {
							$elm.addClass( classToggle );
						}

						// Remove the sending indicator now that submission is fully complete (i.e. HTTP response code has been received)
						$elm.removeAttr( attrSending );
					} );
			} );

			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
