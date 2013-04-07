/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/*
 * Form validation plugin
 */
/*global jQuery: false*/
(function($) {
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
		_exec: function(elm) {
			var form = elm.find('form'),
				formDOM = form.get(0),
				labels = formDOM.getElementsByTagName('label'),
				labels_len = labels.length,
				formElms = form.find('input, select, textarea'),
				formElm,
				$inputs = formElms.filter('input'),
				pattern = $inputs.filter('[pattern]'),
				i,
				len,
				index,
				valItems,
				string,
				submitted = false,
				required = form.find('[required]').attr('aria-required', 'true'),
				$errorFormId = 'errors-' + (form.attr('id') === undefined ? 'default' : form.attr('id')),
				validator,
				vlang = _pe.language.replace('-', '_'),
				lang = _pe.get_language(vlang, _pe.fn.formvalid.languages, '_'),
				mthdlang = _pe.get_language(vlang, _pe.fn.formvalid.methods, '_'),
				liblocation = _pe.add.liblocation,
				suffixExt = _pe.suffix + '.js',
				ariaLive = $('<div class="arialive" aria-live="polite" aria-relevant="all"></div>');

			// Append the aria-live region (for provide message updates to screen readers)
			elm.append(ariaLive);

			// Load different language strings if page is not in English
			if (lang !== null) {
				_pe.add._load(liblocation + 'i18n/formvalid/messages_' + lang + suffixExt);
			}

			if (mthdlang !== null) {
				_pe.add._load(liblocation + 'i18n/formvalid/methods_' + mthdlang + suffixExt);
			}

			// Add space to the end of the labels (so separation between label and error when CSS turned off)
			len = labels_len;
			while (len--) {
				labels[len].innerHTML += ' ';
			}

			// Remove the pattern attribute until it is safe to use with jQuery Validation
			len = pattern.length;
			while (len--) {
				pattern.eq(len).removeAttr('pattern');
			}

			// Special handling for mobile
			if (_pe.mobile) {
				formDOM.setAttribute('data-ajax', 'false');
				$inputs.filter('[type="checkbox"]').closest('fieldset').attr('data-role', 'controlgroup');
			}

			// Clear the form and remove error messages on reset
			$inputs.filter('[type="reset"]').on('click vclick touchstart', function() {
				validator.resetForm();
				var summaryContainer = form.find('#' + $errorFormId);
				if (summaryContainer.length > 0) {
					summaryContainer.empty();
				}
				form.find('[aria-invalid="true"]').removeAttr('aria-invalid');
				if (ariaLive.html().length !== 0) {
					ariaLive.empty();
				}
			});

			// Change form attributes and values that intefere with validation in IE7/8
			if (_pe.ie > 0 && _pe.ie < 9) {
				required.removeAttr('required').each(function() {
					this.setAttribute('data-rule-required', 'true');
				});
				$inputs.filter('[type="date"]').each(function() {
					var $this = $(this),
						parent = $this.wrap('<div/>').parent(),
						newelm = $(parent.html().replace('type=date', 'type=text'));
					parent.replaceWith(newelm);
				});
				formElms = form.find('input, select, textarea');
			}

			// The jQuery validation plug-in in action
			validator = form.validate({
				meta: 'validate',
				focusInvalid: false,

				//Set the element which will wrap the inline error messages
				errorElement: 'strong',

				// Location for the inline error messages
				// In this case we will place them in the associated label element
				errorPlacement: function(error, element) {
					var type = element.attr('type'),
						fieldset,
						legend;

					error.data('element-id', element.attr('id'));
					if (typeof type !== 'undefined') {
						type = type.toLowerCase();
						if (type === 'radio' || type === 'checkbox') {
							fieldset = element.closest('fieldset');
							if (fieldset.length !== 0) {
								legend = fieldset.children('legend');
								if (legend.length !== 0 && fieldset.find('input[name="' + element.attr('name') + '"]') !== 1) {
									error.appendTo(legend);
									return;
								}
							}
						}
					}
					error.appendTo(form.find('label[for="' + element.attr('id') + '"]'));
					return;
				},

				// Create our error summary that will appear before the form
				showErrors: function(errorMap) {
					this.defaultShowErrors();
					var errors = form.find('strong.error').filter(':not(:hidden)'),
						errorfields = form.find('input.error, select.error, textarea.error'),
						summaryContainer = form.find('#' + $errorFormId),
						prefixStart = '<span class="prefix">' + _pe.dic.get('%error') + '&#160;',
						prefixEnd = _pe.dic.get('%colon') + ' </span>',
						separator = _pe.dic.get('%hyphen'),
						summary,
						key;

					form.find('[aria-invalid="true"]').removeAttr('aria-invalid');
					if (errors.length !== 0) {
						// Create our container if one doesn't already exist
						if (summaryContainer.length === 0) {
							summaryContainer = $('<div id="' + $errorFormId + '" class="errorContainer" tabindex="-1"/>').prependTo(form);
						} else {
							summaryContainer.empty();
						}

						// Post process
						summary = '<p>' + _pe.dic.get('%form-not-submitted') + errors.length + (errors.length !== 1 ? _pe.dic.get('%errors-found') : _pe.dic.get('%error-found')) + '</p><ul>';
						errorfields.attr('aria-invalid', 'true');
						errors.each(function(index) {
							var $error = $(this),
								prefix = prefixStart + (index + 1) + prefixEnd,
								fieldName = $error.closest('label').find('.field-name'),
								fieldset;

							// Try to find the field name in the legend (if one exists)
							if (fieldName.length === 0) {
								fieldset = $error.closest('fieldset');
								if (fieldset.length !== 0) {
									fieldName = fieldset.find('legend .field-name');
								}
							}

							$error.find('span.prefix').detach();
							summary += '<li><a href="#' + $error.data('element-id') + '">' + prefix + (fieldName.length !== 0 ? fieldName.html() + separator : '') + this.innerHTML + '</a></li>';
							$error.prepend(prefix);
						});
						summary += '</ul>';

						// Output our error summary and place it in the error container
						summaryContainer.append(summary);

						// Put focus on the error if the errors are generated by an attempted form submission
						if (submitted) {
							_pe.focus(summaryContainer);
						} else {
							// Update the aria-live region as necessary
							i = 0;
							for (key in errorMap) {
								if (errorMap.hasOwnProperty(key)) {
									i += 1;
									break;
								}
							}
							if (i !== 0) {
								string = errors.filter('[for=' + key + ']')[0].innerHTML;
								if (string !== ariaLive.html()) {
									ariaLive.html(string);
								}
							} else if (ariaLive.html().length !== 0) {
								ariaLive.empty();
							}
						}

						// Move the focus to the associated input when an error message link is clicked
						// and scroll to the top of the label or legend that contains the error
						form.find('.errorContainer a').on('click vclick', function() {
							var hash = this.href.substring(this.href.indexOf('#')),
								input = $(hash),
								label = input.prev(),
								legend = label.length === 0 ? input.closest('fieldset').find('legend') : [],
								errorTop = label.length !== 0 ? label.offset().top : (legend.length !== 0 ? legend.offset().top : -1);
							_pe.focus(input);
							if(errorTop !== -1) {
								$.mobile.silentScroll(errorTop);
							}
							return false;
						});
						submitted = false;
					} else {
						// Update the aria-live region as necessary
						if (ariaLive.html().length !== 0) {
							ariaLive.empty();
						}
						summaryContainer.detach();
					}
				}, //end of showErrors()
				invalidHandler: function() {
					submitted = true;
				}
			}); //end of validate()

			// Add class="{validate:{...}}" as jQuery Validation rules
			valItems = formElms.filter('[class*="{validate"]');
			for (i = 0, len = valItems.length; i !== len; i += 1) {
				formElm = valItems.eq(i);
				string = formElm.attr('class');
				index = string.indexOf('{validate');
				formElm.rules('add', _pe.data.toObject(string.substring(string.indexOf('{', index + 1), string.indexOf('}', index + 1) + 1)));
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
