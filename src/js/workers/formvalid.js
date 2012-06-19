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
				submitted = false;

			// Load different language strings if page is not in English
			if (pe.language !== "en") {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/messages_' + pe.language + pe.suffix + '.js');
			}
			if (pe.language === "de" || pe.language === "nl" || pe.language === "pt") {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/methods_' + pe.language + pe.suffix + '.js');
			}
			
			// Add WAI-ARIA roles
			form.find('input:text, input:password').attr('role', 'textbox').attr('aria-multiline', 'false');
			if (pe.ie > 0 && pe.ie < 8) {
				form.find('.required').attr('aria-required', 'true').attr('required', 'required');
			} else {
				form.find('.required').attr('aria-required', 'true');
			}
			form.find('input:submit').attr('role', 'button');

			// The jQuery validation plug-in in action
			form.validate({
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
						$errorFormId = 'errors-' + form.attr('id'),
						summaryContainer = form.find('#' + $errorFormId),
						summary;

					if (errors.length > 0) {
						// Create our container if one doesn't already exist
						if (summaryContainer.length === 0) {
							summaryContainer = $('<div id="' + $errorFormId + '" class="errorContainer" role="alert" tabindex="-1"/>').prependTo(form);
						} else {
							summaryContainer.empty();
						}

						// Post process
						summary = $('<ul></ul>');
						errors.each(function (index) {
							var $this = $(this),
								prefix = '<span class="prefix">' + pe.dic.get("%error") + '&#160;' + (index + 1) + pe.dic.get("%colon") + ' </span>',
								label = $this.closest("label");
							$this.find("span.prefix").detach();
							summary.append('<li><a href="#' + label.attr("for") + '">' + prefix + label.find('.field-name').html() + ' - ' + $this.html() + '</a></li>');
							$this.attr("role", "alert").removeAttr("for").prepend('<span class="prefix">' + pe.dic.get("%error") + '&#160;' + (index + 1) + pe.dic.get("%colon") + ' </span>');
						});

						// Output our error summary and place it in the error container
						summaryContainer.append($('<p>' + pe.dic.get("%form-not-submitted") + this.numberOfInvalids() + (this.numberOfInvalids() !== 1 ? pe.dic.get("%errors-found") : pe.dic.get("%error-found")) + '</p>'));
						pe.focus(summaryContainer.append(summary));

						// Move the focus to the associated input when error message link is triggered
						// a simple href anchor link doesnt seem to place focus inside the input
						if (pe.ie === 0 || pe.ie > 7) {
							form.find(".errorContainer a").on("click", function () {
								pe.focus($($(this).attr("href")).focus());
							});
						}

						submitted = false;
					} else {
						summaryContainer.detach();
					}
				}, //end of showErrors()
				invalidHandler: function (form, validator) {
					submitted = true;
				},
				onkeyup: function (element, event) {
					// Only change the error message when there is a keypress that will change the actual field value (versus navigating there)
					if ((event.keyCode < 9 || event.keyCode > 45) && !event.shiftKey && (element.name in this.submitted || element === this.lastElement)) {
						this.element(element);
					}
				}
			}); //end of validate()

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));