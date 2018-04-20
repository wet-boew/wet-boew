/**
 * @title WET-BOEW Form validation
 * @overview Provides generic validation and error message handling for Web forms.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-frmvld",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	setFocusEvent = "setfocus.wb",
	$document = wb.doc,
	idCount = 0,
	i18n, i18nText,

	defaults = {
		hdLvl: "h2",
		ignore: ":hidden"
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var eventTarget = wb.init( event, componentName, selector ),
			elmId, modeJS;

		if ( eventTarget ) {
			elmId = eventTarget.id;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = componentName + "-id-" + idCount;
				idCount += 1;
				eventTarget.id = elmId;
			}

			// Read the selector node for parameters
			modeJS = wb.getMode() + ".js";

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					colon: i18n( "colon" ),
					hyphen: i18n( "hyphen" ),
					error: i18n( "err" ),
					errorFound: i18n( "err-fnd" ),
					errorsFound: i18n( "errs-fnd" ),
					formNotSubmitted: i18n( "frm-nosubmit" )
				};
			}

			Modernizr.load( {

				// For loading multiple dependencies
				both: [
					"site!deps/jquery.validate" + modeJS,
					"site!deps/additional-methods" + modeJS
				],
				testReady: function() {
					return ( window.fromValid && window.fromValid.additional );
				},
				complete: function() {
					var $elm = $( "#" + elmId ),
						$form = $elm.find( "form" ),
						formDOM = $form.get( 0 ),
						formId = $form.attr( "id" ),
						labels = formDOM.getElementsByTagName( "label" ),
						$formElms = $form.find( "input, select, textarea" ),
						$inputs = $formElms.filter( "input" ),
						$pattern = $inputs.filter( "[pattern]" ),
						submitted = false,
						$required = $formElms.filter( "[required], [data-rule-required], .required" ),
						errorFormId = "errors-" + ( !formId ? "default" : formId ),
						settings = $.extend(
							true,
							{},
							defaults,
							window[ componentName ],
							wb.getData( $elm, componentName )
						),
						summaryHeading = settings.hdLvl,
						i, len, validator;

					// Append the aria-live region (for provide message updates to screen readers)
					$elm.append( "<div class='arialive wb-inv' aria-live='polite' aria-relevant='all'></div>" );

					// Add space to the end of the labels (so separation between label and error when CSS turned off)
					len = labels.length;
					for ( i = 0; i !== len; i += 1 ) {
						labels[ i ].innerHTML += " ";
					}

					// Remove the pattern attribute until it is safe to use with jQuery Validation
					len = $pattern.length;
					for ( i = 0; i !== len; i += 1 ) {
						$pattern.eq( i ).removeAttr( "pattern" );
					}

					// Change form attributes and values that interfere with validation in IE7/8
					// TODO: Need better way of dealing with this rather than browser sniffing
					if ( wb.ieVersion > 0 && wb.ieVersion < 9 ) {
						len = $required.length;
						$required.removeAttr( "required" );
						for ( i = 0; i !== len; i += 1 ) {
							$required[ i ].setAttribute( "data-rule-required", "true" );
						}
						$inputs.filter( "[type=date]" ).each( function() {
							var $this = $( this ),
								$parent = $this.wrap( "<div/>" ).parent(),
								newElm = $( $parent.html().replace( "type=date", "type=text" ) );
							$parent.replaceWith( newElm );
						} );
						$formElms = $form.find( "input, select, textarea" );
					}

					// The jQuery validation plug-in in action
					validator = $form.validate( {
						meta: "validate",
						focusInvalid: false,
						ignore: settings.ignore,

						// Set the element which will wrap the inline error messages
						errorElement: "strong",

						// Location for the inline error messages
						// In this case we will place them in the associated label element
						errorPlacement: function( $error, $element ) {
							var type = $element.attr( "type" ),
								group = $element.attr( "data-rule-require_from_group" ),
								$fieldset, $legend;

							$error.data( "element-id", $element.attr( "id" ) );
							if ( type ) {
								type = type.toLowerCase();
								if ( type === "radio" || type === "checkbox" ) {
									$fieldset = $element.closest( "fieldset" );
									if ( $fieldset.length !== 0 ) {
										$legend = $fieldset.find( "legend" ).first();
										if ( $legend.length !== 0 && $fieldset.find( "input[name='" + $element.attr( "name" ) + "']" ) !== 1 ) {
											$error.appendTo( $legend );
											return;
										}
									}
								}
							}

							if ( group ) {
								$fieldset = $element.closest( "fieldset" );
								if ( $fieldset.length !== 0 ) {
									$legend = $fieldset.find( "legend" ).first();
									if ( $legend.length !== 0 && $fieldset.find( "input[name='" + $element.attr( "name" ) + "']" ) !== 1 ) {
										var $strong = $legend.find( "strong.error" ),
											id = $legend.attr( "id" );

										if ( $strong.length > 0 ) {
											$strong.remove();
										}

										if ( !id ) {
											id = "required-group-" + idCount;
											idCount += 1;

											$legend.attr( "id", id );
										}

										$error.data( "element-id", id );
										$error.attr( "id", id );
										$error.appendTo( $legend );

										return;
									}
								}
							}

							$error.appendTo( $form.find( "label[for='" + $element.attr( "id" ) + "']" ) );
							return;
						},

						// Create our error summary that will appear before the form
						showErrors: function( errorMap ) {
							this.defaultShowErrors();
							var $errors = $form.find( "strong.error" ).filter( ":not(:hidden)" ),
								$errorfields = $form.find( "input.error, select.error, textarea.error" ),
								prefixStart = "<span class='prefix'>" + i18nText.error + "&#160;",
								prefixEnd = i18nText.colon + " </span>",
								separator = i18nText.hyphen,
								ariaLive = $form.parent().find( ".arialive" )[ 0 ],
								$summaryContainer, summary, key, i, len, $error, prefix, $fieldName, $fieldset, label, labelString;

							// Correct the colouring of fields that are no longer invalid
							$form
								.find( ".has-error [aria-invalid=false]" )
									.closest( ".has-error" )
										.removeClass( "has-error" );

							if ( $errors.length !== 0 ) {

								// Post process
								summary = "<" + summaryHeading + ">" +
									i18nText.formNotSubmitted + $errors.length +
									(
										$errors.length !== 1 ?
											i18nText.errorsFound :
											i18nText.errorFound
									) + "</" + summaryHeading + "><ul>";
								$errorfields
									.closest( ".form-group" )
										.addClass( "has-error" );
								len = $errors.length;
								for ( i = 0; i !== len; i += 1 ) {
									$error = $errors.eq( i );
									prefix = prefixStart + ( i + 1 ) + prefixEnd;
									$fieldName = $error.closest( "label" ).find( ".field-name" );

									// Try to find the field name in the legend (if one exists)
									if ( $fieldName.length === 0 ) {
										$fieldset = $error.closest( "fieldset" );
										if ( $fieldset.length !== 0 ) {
											$fieldName = $fieldset.find( "legend .field-name" );
										}
									}

									$error.find( "span.prefix" ).detach();
									summary += "<li><a href='#" + $error.data( "element-id" ) +
										"'>" + prefix + ( $fieldName.length !== 0 ? $fieldName.html() + separator : "" ) +
										$error.text() + "</a></li>";
									$error.html( "<span class='label label-danger'>" + prefix + $error.text() + "</span>" );
								}
								summary += "</ul>";

								if ( !submitted ) {

									// Update the aria-live region as necessary
									i = 0;
									for ( key in errorMap ) {
										if ( errorMap.hasOwnProperty( key ) ) {
											i += 1;
											break;
										}
									}
									if ( i !== 0 ) {
										len = $errors.length;
										for ( i = 0; i !== len; i += 1 ) {
											label = $errors[ i ].parentNode;
											if ( label.getAttribute( "for" ) === key ) {
												labelString = label.innerHTML;
												if ( labelString !== ariaLive.innerHTML ) {
													ariaLive.innerHTML = labelString;
												}
												break;
											}
										}
									} else if ( ariaLive.innerHTML.length !== 0 ) {
										ariaLive.innerHTML = "";
									}
								}

								// Delay updating the summary container in case a summary link was clicked
								setTimeout( function() {
									$summaryContainer = $form.find( "#" + errorFormId );

									// Output our error summary and place it in the error container
									// Create our container if one doesn't already exist
									if ( $summaryContainer.length === 0 ) {
										$summaryContainer = $( "<section id='" + errorFormId + "' class='alert alert-danger' tabindex='-1'>" + summary + "</section>" ).prependTo( $form );
									} else {
										$summaryContainer.empty().append( summary );
									}

									// Put focus on the error if the errors are generated by an attempted form submission
									if ( submitted ) {

										// Assign focus to $summaryContainer
										$summaryContainer.trigger( setFocusEvent );
										submitted = false;
									}
								}, 100 );
							} else {

								// Update the aria-live region as necessary
								if ( ariaLive.innerHTML.length !== 0 ) {
									ariaLive.innerHTML = "";
								}
								$form.find( "#" + errorFormId ).detach();
							}

						}, /* End of showErrors() */

						invalidHandler: function() {
							submitted = true;
						},

						/* adds on tab validation */
						onfocusout: function( element ) {
							this.element( element );
						}

					} ); /* end of validate() */

					/* fixes validation issue (see PR #7913) */
					$form.on( "change", "input[type=date], input[type=file], select", function() {
						$form.validate().element( this );
					} );

					// Clear the form and remove error messages on reset
					$document.on( "click vclick touchstart", selector + " input[type=reset]", function( event ) {
						var which = event.which,
							ariaLive;

						// Ignore middle/right mouse buttons
						if ( !which || which === 1 ) {
							validator.resetForm();
							$( "#" + errorFormId ).detach();

							ariaLive = $form.parent().find( ".arialive" )[ 0 ];
							if ( ariaLive.innerHTML.length !== 0 ) {
								ariaLive.innerHTML = "";
							}

							// Correct the colouring of fields that are no longer invalid
							$form.find( ".has-error" ).removeClass( "has-error" );
						}
					} );

					// Tell the i18n file to execute to run any $.validator extends
					$form.trigger( "formLanguages.wb" );

					// Identify that initialization has completed
					wb.ready( $( eventTarget ), componentName );
				}
			} );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
