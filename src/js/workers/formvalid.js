/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Form validation plugin
 */
/*global jQuery: false, pe: false, wet_boew_formvalid: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.formvalid = {
		type: 'plugin',
		depends: ['validate', 'validateAdditional', 'metadata'],
		_exec: function (elm) {
			var form = elm.find('form'),
				submitted = false,
				required = form.find('[required]').attr('aria-required', 'true'),
				$errorFormId = 'errors-' + (form.attr('id') === undefined ? 'default' : form.attr('id')),
				validator;

			// Load different language strings if page is not in English
			if (pe.language !== "en") {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/messages_' + pe.language + pe.suffix + '.js');
			}
			if (pe.language === "de" || pe.language === "nl" || pe.language === "pt") {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/methods_' + pe.language + pe.suffix + '.js');
			}

			// Add WAI-ARIA roles
			required.attr('aria-required', 'true');

			// Add space to the end of the labels (so separation between label and error when CSS turned off)
			form.find("label").each(function () {
				var $this = $(this);
				$this.html($this.html() + " ");
			});

			function addValidation(target, key, value) {
				var targetclass = target.attr('class'),
					index1 = (targetclass !== undefined ? targetclass.search(/validate\s?:\s?\{/) : -1),
					valstring;
				if (index1 > -1) { // validate:{ already exists
					//if (targetclass.indexOf(key + ':', index1) === -1) {
					if (targetclass.search("/" + key + "\\s?:/") === -1) {
						valstring = targetclass.substring(index1, targetclass.indexOf('{', index1) + 1);
						target.attr('class', targetclass.replace(valstring, valstring + key + ':' + value + ', '));
					}
				} else { // validate:{ doesn't exist
					target.addClass('{validate:{' + key + ':' + value + '}}');
				}
				return;
			}

			// Remove the pattern attribute until it is safe to use with jQuery Validation
			form.find('input[pattern]').removeAttr('pattern');

			// Change form attributes and values that intefere with validation in IE7/8
			if (pe.ie > 0 && pe.ie < 9) {
				required.removeAttr('required').each(function () {
					addValidation($(this), 'required', 'true'); // Adds required:true to validation:{}
				});
				form.find('input[type="date"]').each(function () {
					var $this = $(this),
						parent = $this.wrap('<div/>').parent(),
						newelm = $(parent.html().replace('type=' + $this.attr('type'), 'type=text'));
					parent.replaceWith(newelm);
				});
			}

			// Special handling for mobile
			if (pe.mobile) {
				form.attr('data-ajax', 'false').find('input:checkbox').closest('fieldset').attr('data-role', 'controlgroup');
			}

			// The jQuery validation plug-in in action
			validator = form.validate({
				meta: "validate",
				focusInvalid: false,

				//Set the element which will wrap the inline error messages
				errorElement: "strong",

				// Location for the inline error messages
				// In this case we will place them in the associated label element
				errorPlacement: function (error, element) {
					error.appendTo(form.find('label[for="' + $(element).attr('id') + '"]'));
				},

				// Create our error summary that will appear before the form
				showErrors: function (errorMap, errorList) {
					this.defaultShowErrors();
					var errors = form.find("strong.error:not(:hidden)"),
						errorfields = form.find("input.error, select.error, textarea.error"),
						summaryContainer = form.find('#' + $errorFormId),
						summary;

					form.find('[aria-invalid="true"]').removeAttr("aria-invalid");
					if (errors.length > 0) {
						// Create our container if one doesn't already exist
						if (summaryContainer.length === 0) {
							summaryContainer = $('<div id="' + $errorFormId + '" class="errorContainer" role="alert" tabindex="-1"/>').prependTo(form);
						} else {
							summaryContainer.empty();
						}

						// Post process
						summary = $('<ul></ul>');
						errorfields.attr("aria-invalid", "true");
						errors.each(function (index) {
							var $this = $(this),
								prefix = '<span class="prefix">' + pe.dic.get("%error") + '&#160;' + (index + 1) + pe.dic.get("%colon") + ' </span>',
								label = $this.closest("label");
							$this.find("span.prefix").detach();
							summary.append('<li><a href="#' + label.attr("for") + '">' + prefix + label.find('.field-name').html() + ' - ' + $this.html() + '</a></li>');
							$this.prepend('<span class="prefix">' + pe.dic.get("%error") + '&#160;' + (index + 1) + pe.dic.get("%colon") + ' </span>');
						});

						// Output our error summary and place it in the error container
						summaryContainer.append($('<p>' + pe.dic.get("%form-not-submitted") + errors.length + (errors.length !== 1 ? pe.dic.get("%errors-found") : pe.dic.get("%error-found")) + '</p>'));
						summaryContainer.append(summary);

						// Put focus on the error if the errors are generated by an attempted form submission
						if (submitted) {
							pe.focus(summaryContainer);
						}

						// Move the focus to the associated input when error message link is triggered
						// a simple href anchor link doesnt seem to place focus inside the input
						if (pe.ie === 0 || pe.ie > 7) {
							form.find(".errorContainer a").on("click vclick", function () {
								var label_top = pe.focus($($(this).attr("href"))).prev().offset().top;
								if (pe.mobile) {
									$.mobile.silentScroll(label_top);
								} else {
									$(document).scrollTop(label_top);
								}
								return false;
							});
						}

						submitted = false;
					} else {
						summaryContainer.detach();
					}
				}, //end of showErrors()
				invalidHandler: function (form, validator) {
					submitted = true;
				}
			}); //end of validate()

			// Clear the form and remove error messages on reset
			form.find('input[type=reset]').on('click', function () {
				validator.resetForm();
				var summaryContainer = form.find('#' + $errorFormId);
				if (summaryContainer.length > 0) {
					summaryContainer.empty();
				}
				form.find('[aria-invalid="true"]').removeAttr("aria-invalid");
				form.find('#' + $errorFormId);
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));