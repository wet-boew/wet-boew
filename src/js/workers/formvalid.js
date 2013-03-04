/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Form validation plugin
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.formvalid = {
		type: 'plugin',
		depends: ['validate', 'validateAdditional', 'metadata'],
		languages: ['@wet-boew-build.validlanguagelist@'],
		methods: ['@wet-boew-build.validlanguagemethod@'],
		_exec: function (elm) {
			var form = elm.find('form'),
				formDOM = form.get(0),
				labels = formDOM.getElementsByTagName('label'),
				labels_len = labels.length,
				formElms = form.find('input, select, textarea'),
				formElmsDOM = formElms.get(),
				formElm,
				$inputs = formElms.filter('input'),
				inputs = $inputs.get(),
				inputs_len = inputs.length,
				input,
				i,
				len,
				index,
				string,
				nativeAttribute,
				submitted = false,
				required = form.find('[required]').attr('aria-required', 'true'),
				$errorFormId = 'errors-' + (form.attr('id') === undefined ? 'default' : form.attr('id')),
				validator,
				vlang = pe.language.replace('-', '_'),
				lang = pe.get_language(vlang, _pe.fn.formvalid.languages, '_'),
				mthdlang = pe.get_language(vlang, _pe.fn.formvalid.methods, '_');

			// Load different language strings if page is not in English
			if (lang !== null) {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/messages_' + lang + pe.suffix + '.js');
			}
			
			if (mthdlang !== null) {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/methods_' + mthdlang + pe.suffix + '.js');
			}

			// Add space to the end of the labels (so separation between label and error when CSS turned off)
			len = labels_len;
			while (len--) {
				labels[len].innerHTML += ' ';
			}

			// Move class="{validate:{...}}" to data-rule="{...}
			for (i = 0, len = formElmsDOM.length; i !== len; i += 1) {
				formElm = formElmsDOM[i];
				string = formElm.className;
				index = string.indexOf('{validate');
				if (index !== -1) {
					formElm.setAttribute('data-rule', string.substring(string.indexOf('{', index + 1), string.indexOf('}', index + 1) + 1));
				}
			}
			
			// Remove the pattern attribute until it is safe to use with jQuery Validation
			len = inputs_len;
			if (len !== 0 && inputs[0].hasAttribute !== undefined) {
				while (len--) {
					input = inputs[len];
					if (nativeAttribute) {
						if (input.hasAttribute('pattern')) {
							input.removeAttribute('pattern');
						}
					} else {
						$(input).removeAttr('pattern');
					}
				}
			}

			// TODO: Remove class part when updated to jQuery Validation 1.11.0 or later
			function addValidation(target, key, value) {
				var targetclass = target.attr('class'), // Remove in jQuery Validation 1.11.0
					pair = key + ':' + value,
					datarule = target.attr('data-rule'),
					index1 = (targetclass !== undefined ? targetclass.search(/validate\s?:\s?\{/) : -1), // Remove value in jQuery Validation 1.11.0 (keep variable)
					len,
					valstring;
				/**** Remove in jQuery Validation 1.11.0 ****/
				if (index1 !== -1) { // validate:{ already exists
					if (targetclass.search("/" + key + "\\s?:/") === -1) {
						valstring = targetclass.substring(index1, targetclass.indexOf('{', index1) + 1);
						target.attr('class', targetclass.replace(valstring, valstring + pair + ', '));
					}
				} else { // validate:{ doesn't exist
					target.addClass('{validate:{' + pair + '}}');
				}
				/**********/
				if (datarule !== undefined) { // data-rule already exists
					len = datarule.length;
					index1 = datarule.indexOf('{');
					if (len === 0) {
						datarule = '{' + pair + '}';
					} else {
						datarule = '{' + pair + ',' + datarule.substring(1) + (index !== -1 ? '}' : '');
					}
				} else {
					datarule = '{' + pair + '}';
				}
				target.attr('data-rule', datarule);
				return;
			}

			// Change form attributes and values that intefere with validation in IE7/8
			if (pe.ie > 0 && pe.ie < 9) {
				required.removeAttr('required').each(function () {
					addValidation($(this), 'required', 'true'); // Adds required:true to validation:{}
				});
				$inputs.filter('[type="date"]').each(function () {
					var $this = $(this),
						parent = $this.wrap('<div/>').parent(),
						newelm = $(parent.html().replace('type=' + $this.attr('type'), 'type=text'));
					parent.replaceWith(newelm);
				});
			}

			// Special handling for mobile
			if (pe.mobile) {
				formDOM.setAttribute('data-ajax', 'false');
				$inputs.filter('[type="checkbox"]').closest('fieldset').attr('data-role', 'controlgroup');
			}

			// The jQuery validation plug-in in action
			validator = form.validate({
				meta: 'validate',
				focusInvalid: false,

				//Set the element which will wrap the inline error messages
				errorElement: 'strong',

				// Location for the inline error messages
				// In this case we will place them in the associated label element
				errorPlacement: function (error, element) {
					error.appendTo(form.find('label[for="' + element.attr('id') + '"]'));
				},

				// Create our error summary that will appear before the form
				showErrors: function (errorMap, errorList) {
					this.defaultShowErrors();
					var errors = form.find('strong.error').filter(':not(:hidden)'),
						errorfields = form.find('input.error, select.error, textarea.error'),
						summaryContainer = form.find('#' + $errorFormId),
						prefixStart = '<span class="prefix">' + pe.dic.get("%error") + '&#160;',
						prefixEnd = pe.dic.get("%colon") + ' </span>',
						summary;

					form.find('[aria-invalid="true"]').removeAttr("aria-invalid");
					if (errors.length > 0) {
						// Create our container if one doesn't already exist
						if (summaryContainer.length === 0) {
							summaryContainer = $('<div id="' + $errorFormId + '" class="errorContainer" tabindex="-1"/>').prependTo(form);
						} else {
							summaryContainer.empty();
						}

						// Post process
						summary = '<p>' + pe.dic.get('%form-not-submitted') + errors.length + (errors.length !== 1 ? pe.dic.get('%errors-found') : pe.dic.get('%error-found')) + '</p><ul>';
						errorfields.attr('aria-invalid', 'true');
						errors.each(function (index) {
							var $this = $(this),
								prefix = prefixStart + (index + 1) + prefixEnd,
								label = $this.closest('label');
							$this.find('span.prefix').detach();
							summary += '<li><a href="#' + label.attr('for') + '">' + prefix + label.find('.field-name').html() + ' - ' + this.innerHTML + '</a></li>';
							$this.prepend(prefix);
						});
						summary += '</ul>';

						// Output our error summary and place it in the error container
						summaryContainer.append(summary);

						// Put focus on the error if the errors are generated by an attempted form submission
						if (submitted) {
							pe.focus(summaryContainer);
						}

						// Move the focus to the associated input when error message link is triggered
						// a simple href anchor link doesnt seem to place focus inside the input
						if (pe.ie === 0 || pe.ie > 7) {
							form.find('.errorContainer a').on('click vclick', function () {
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
			$inputs.filter('[type="reset"]').on('click vclick touchstart', function () {
				validator.resetForm();
				var summaryContainer = form.find('#' + $errorFormId);
				if (summaryContainer.length > 0) {
					summaryContainer.empty();
				}
				form.find('[aria-invalid="true"]').removeAttr('aria-invalid');
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
