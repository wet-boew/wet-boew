/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * WET-BOEW Form validation
 */
(function ( $, window, document, vapour, undefined ) {
    "use strict";

    var selector = ".wb-formvalid",
        $document = vapour.doc,
		i18n,
		i18nText,
        plugin = {
            init: function ( $elm ) {
                // all plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
                window._timer.remove( selector );

                // read the selector node for parameters
                var mode = vapour.getMode();
					//lang = document.documentElement.lang.replace( "-", "_" );

                // Only initialize the i18nText once
                if ( i18nText === undefined ) {
					i18n = window.i18n;
                    i18nText = {
						colon: i18n( "%colon" ),
						hyphen: i18n( "%hyphen" ),
						error: i18n( "%error" ),
						errorFound: i18n( "%error-found" ),
						errorsFound: i18n( "%errors-found" ),
						formNotSubmitted: i18n( "%form-not-submitted" )
                    };
                }

                window.Modernizr.load( {
                    // For loading multiple dependencies
                    both: [
                        "site!deps/jquery.validate" + mode + ".js",
						"site!deps/additional-methods" + mode + ".js"
						// TODO: Need more elegant way to do these loads. Shouldn't load at all if English or if language file doesn't exist because complete never happens.
						//"site!deps/messages_" + lang + mode + ".js",
						//"site!deps/methods_" + lang + mode + ".js"
                    ],
                    complete: function() {
                        var form = $elm.find( "form" ),
							formDOM = form.get( 0 ),
							labels = formDOM.getElementsByTagName( "label" ),
							labels_len = labels.length,
							formElms = form.find( "input, select, textarea" ),
							$inputs = formElms.filter( "input" ),
							pattern = $inputs.filter( "[pattern]" ),
							i,
							len,
							string,
							submitted = false,
							required = form.find( "[required]" ).attr( "aria-required", "true" ),
							$errorFormId = "errors-" + ( form.attr( "id" ) === undefined ? "default" : form.attr( "id" ) ),
							validator,
							ariaLive = $( "<div class=\"arialive wb-invisible\" aria-live=\"polite\" aria-relevant=\"all\"></div>" );

						// Append the aria-live region (for provide message updates to screen readers)
						$elm.append( ariaLive );

						// Add space to the end of the labels (so separation between label and error when CSS turned off)
						len = labels_len;
						for ( i = 0; i !== len; i += 1 ) {
							labels[ i ].innerHTML += " ";
						}

						// Remove the pattern attribute until it is safe to use with jQuery Validation
						len = pattern.length;
						for ( i = 0; i !== len; i += 1 ) {
							pattern.eq( i ).removeAttr( "pattern" );
						}

						// Clear the form and remove error messages on reset
						$inputs.filter( "[type=reset]" ).on( "click vclick touchstart", function( event ) {
							var summaryContainer,
								button = event.button;
							if ( button === undefined || button === 1 ) { // Ignore middle/right mouse buttons
								validator.resetForm();
								summaryContainer = form.find( "#" + $errorFormId );
								if ( summaryContainer.length > 0 ) {
									summaryContainer.empty();
								}
							}
							form.find( "[aria-invalid=true]" ).removeAttr( "aria-invalid" );
							if ( ariaLive.html().length !== 0 ) {
								ariaLive.empty();
							}
						});

						// Change form attributes and values that interfere with validation in IE7/8
						// TODO: Need better way of dealing with this rather than browser sniffing
						if ( ( ( /(MSIE) ([\w.]+)/.exec(navigator.userAgent ) || [] )[ 2 ] || "0" ) < 9 ) {
							len = required.length;
							required.removeAttr( "required" );
							for ( i = 0; i !== len; i += 1) {
								required[i].setAttribute( "data-rule-required", "true" );
							}
							$inputs.filter( "[type=date]" ).each( function() {
								var $this = $( this ),
									parent = $this.wrap( "<div/>" ).parent(),
									newelm = $( parent.html().replace( "type=date", "type=text" ) );
								parent.replaceWith( newelm );
							});
							formElms = form.find( "input, select, textarea" );
						}

						// The jQuery validation plug-in in action
						validator = form.validate( {
							meta: "validate",
							focusInvalid: false,

							//Set the element which will wrap the inline error messages
							errorElement: "strong",

							// Location for the inline error messages
							// In this case we will place them in the associated label element
							errorPlacement: function( error, element ) {
								var type = element.attr( "type" ),
									fieldset,
									legend;

								error.data( "element-id", element.attr( "id" ) );
								if ( type !== undefined ) {
									type = type.toLowerCase();
									if ( type === "radio" || type === "checkbox" ) {
										fieldset = element.closest( "fieldset" );
										if ( fieldset.length !== 0 ) {
											legend = fieldset.find( "legend" ).first();
											if ( legend.length !== 0 && fieldset.find( "input[name=" + element.attr( "name" ) + "]" ) !== 1) {
												error.appendTo( legend );
												return;
											}
										}
									}
								}
								error.appendTo( form.find( "label[for=" + element.attr( "id" ) + "]" ) );
								return;
							},

							// Create our error summary that will appear before the form
							showErrors: function( errorMap ) {
								this.defaultShowErrors();
								var _i18nText = i18nText,
									errors = form.find( "strong.error" ).filter( ":not(:hidden)" ),
									errorfields = form.find( "input.error, select.error, textarea.error" ),
									summaryContainer = form.find( "#" + $errorFormId ),
									prefixStart = "<span class=\"prefix\">" + _i18nText.error + "&#160;",
									prefixEnd = _i18nText.colon + " </span>",
									separator = _i18nText.hyphen,
									summary,
									key;

								form.find( "[aria-invalid=true]" ).removeAttr( "aria-invalid" );
								if (errors.length !== 0) {
									// Create our container if one doesn't already exist
									if ( summaryContainer.length === 0 ) {
										summaryContainer = $( "<div id=\"" + $errorFormId + "\" class=\"errorContainer\" tabindex=\"-1\"/>" ).prependTo( form );
									} else {
										summaryContainer.empty();
									}

									// Post process
									summary = "<p>" + _i18nText.formNotSubmitted + errors.length + ( errors.length !== 1 ? _i18nText.errorsFound : _i18nText.errorFound ) + "</p><ul>";
									errorfields.attr( "aria-invalid", "true" );
									errors.each( function( index ) {
										var $error = $( this ),
											prefix = prefixStart + ( index + 1 ) + prefixEnd,
											fieldName = $error.closest( "label" ).find( ".field-name" ),
											fieldset;

										// Try to find the field name in the legend (if one exists)
										if ( fieldName.length === 0 ) {
											fieldset = $error.closest( "fieldset" );
											if ( fieldset.length !== 0 ) {
												fieldName = fieldset.find( "legend .field-name" );
											}
										}

										$error.find( "span.prefix" ).detach();
										summary += "<li><a href=\"#" + $error.data( "element-id" ) + "\">" + prefix + ( fieldName.length !== 0 ? fieldName.html() + separator : "" ) + this.innerHTML + "</a></li>";
										$error.prepend( prefix );
									});
									summary += "</ul>";

									// Output our error summary and place it in the error container
									summaryContainer.append( summary );

									// Put focus on the error if the errors are generated by an attempted form submission
									if ( submitted ) {
										// TODO: Replace with use of global focus function
										setTimeout( function () {
											summaryContainer.focus();
										}, 0 );
									} else {
										// Update the aria-live region as necessary
										i = 0;
										for ( key in errorMap ) {
											if ( errorMap.hasOwnProperty( key ) ) {
												i += 1;
												break;
											}
										}
										if ( i !== 0 ) {
											string = errors.filter( "[for=" + key + "]" )[ 0 ].innerHTML;
											if ( string !== ariaLive.html() ) {
												ariaLive.html( string );
											}
										} else if ( ariaLive.html().length !== 0 ) {
											ariaLive.empty();
										}
									}

									// Move the focus to the associated input when an error message link is clicked
									// and scroll to the top of the label or legend that contains the error
									form.find( ".errorContainer a" ).on( "click vclick", function( event ) {
										var hash = this.href.substring( this.href.indexOf( "#" ) ),
											input = $( hash ),
											label = input.prev(),
											legend = label.length === 0 ? input.closest( "fieldset" ).find( "legend" ) : [],
											errorTop = label.length !== 0 ? label.offset().top : ( legend.length !== 0 ? legend.offset().top : -1 ),
											button = event.which;
										if ( button === undefined || button === 1 ) { // Ignore middle/right mouse buttons
											// TODO: Replace with use of global focus function
											setTimeout( function () {
												input.focus();
											}, 0 );

											if ( errorTop !== -1 ) {
												window.scroll( 0, errorTop );
											}
											return false;
										}
									});
									submitted = false;
								} else {
									// Update the aria-live region as necessary
									if ( ariaLive.html().length !== 0 ) {
										ariaLive.empty();
									}
									summaryContainer.detach();
								}
							}, //end of showErrors()
							invalidHandler: function() {
								submitted = true;
							}
						} ); //end of validate()
                    }
                } );
            }
		};

    // Bind the init event of the plugin
    $document.on( "timerpoke.wb", selector, function (event) {
        // "this" is cached for all events to utilize
        var eventType = event.type,
            $elm = $(this);

        switch (eventType) {
        case "timerpoke":
			plugin.init.apply( this, [ $elm ] );
        }
        return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
    });

    // Add the timer poke to initialize the plugin
    window._timer.add( selector );
})( jQuery, window, document, vapour );