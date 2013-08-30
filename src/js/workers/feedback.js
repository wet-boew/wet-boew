/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Feedback form plugin
 */
/*global jQuery: false*/
(function () {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.feedback = {
		type: 'plugin',
		depends: [],
		_exec: function (elm) {
			var feedback = elm.find('#feedback'),
				web = elm.find('#web'),
				access = web.find('#access'),
				mobile = web.find('#mobile'),
				computer = web.find('#computer'),
				contact_coord = elm.find('#contact-coord'),
				contact1 = contact_coord.find('#contact1'),
				contactType = contact1.attr('type'),
				contactCheckbox = (typeof contactType !== 'undefined' && contactType.toLowerCase() === 'checkbox'),
				contact2 = contact_coord.find('#contact2'),
				info = contact_coord.find('#info'),
				referrerUrl = document.referrer,
				urlParams = _pe.url(window.location.href).params;

			// Web Questions
			feedback.attr('aria-controls', 'web').on('keyup click load', function (e) {
				var load = (e.type === 'load'),
					button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					if (!load && this.value === 'web') {
						this.setAttribute('aria-hidden', 'false');
						web.show('slow');
					} else {
						this.setAttribute('aria-hidden', 'true');
						if (load) {
							web.css('display', 'none');
						} else {
							web.hide('slow');
						}
					}
				}
			});
			// Automatically select the reason if specified in the query string

			if (urlParams.submit === undefined && urlParams.feedback !== undefined) {
				feedback.find('option[value="' + urlParams.feedback + '"]').attr('selected', 'selected');
			}
			feedback.trigger('load');

			// Computer and Mobile
			access.attr('aria-controls', 'mobile computer').on('keyup click load', function (e) {
				var load = (e.type === 'load'),
					button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					if (!load && this.value === 'mobile') {
						mobile.attr('aria-hidden', 'false').show('slow');
						computer.attr('aria-hidden', 'true').hide('slow');
					} else {
						computer.attr('aria-hidden', 'false');
						mobile.attr('aria-hidden', 'true');
						if (load) {
							computer.css('display', 'block');
							mobile.css('display', 'none');
						} else {
							computer.show('slow');
							mobile.hide('slow');
						}
					}
				}
			}).trigger('load');

			// Contact info first selection
			contact1.on('keyup click load', function (e) {
				var load = (e.type === 'load'),
					button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					if (!load && (this.checked || (!contactCheckbox && this.value === 'yes'))) {
						info.attr('aria-hidden', 'false').show('slow');
					} else if (load || (!this.checked && !contact2.prop('checked')) || (!contactCheckbox && this.value !== 'yes' && contact2.val() !== 'yes')) {
						info.attr('aria-hidden', 'true');
						if (load) {
							info.css('display', 'none');
						} else {
							info.hide('slow');
						}
					}
				}
			}).trigger('load');

			// Contact info second selection
			contact2.on('keyup click load', function (e) {
				var load = (e.type === 'load'),
					button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					if (!load && (this.checked || (!contactCheckbox && this.value === 'yes'))) {
						info.attr('aria-hidden', 'false').show('slow');
					} else if (load || (!this.checked && !contact1.prop('checked')) || (!contactCheckbox && this.value !== 'yes' && contact1.val() !== 'yes')) {
						info.attr('aria-hidden', 'true');
						if (load) {
							info.css('display', 'none');
						} else {
							info.hide('slow');
						}
					}
				}
			}).trigger('load');

			// Prepopulates URL form field with referrer
			web.find('#page').attr('value', referrerUrl);

			// Return to the form defaults when the reset button is activated
			elm.find('input[type=reset]').on('click', function (e) {
				var button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					feedback.trigger('load');
					access.trigger('load');
					contact1.trigger('load');
					contact2.trigger('load');
				}
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
