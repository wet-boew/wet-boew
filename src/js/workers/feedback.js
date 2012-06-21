/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Form validation plugin
 */
/*global jQuery: false, pe: false, wet_boew_feedback: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.feedback = {
		type: 'plugin',
		depends: [],
		_exec: function (elm) {
			var feedback = elm.find('#feedback').attr('aria-controls', 'web'),
				web = elm.find('#web'),
				access = web.find('#access').attr('aria-controls', 'mobile computer'),
				mobile = web.find('#mobile'),
				computer = web.find('#computer'),
				contact_coord = elm.find('contact-coord'),
				contact1 = contact_coord.find('#contact1'),
				contact2 = contact_coord.find('#contact2'),
				info = contact_coord.find('#info'),
				referrerUrl = document.referrer;

			// Web Questions
			feedback.on("keyup click load", function () {
				if ($(this).val() === 'web') {
					web.attr('aria-hidden', 'false').show("slow");
				} else {
					web.attr('aria-hidden', 'true').hide("slow");
				}
			});
			// Automatically select the reason if specified in the query string
			feedback.find('option[value="' + pe.url(document.location).params.feedback + '"]').attr("selected", "selected").trigger("load");

			// Computer and Mobile
			access.on("keyup click load", function () {
				if (access.val() === 'mobile') {
					mobile.attr('aria-hidden', 'false').show("slow");
					computer.attr('aria-hidden', 'true').hide("slow");
				} else {
					computer.attr('aria-hidden', 'false').show("slow");
					mobile.attr('aria-hidden', 'true').hide("slow");
				}
			}).trigger("load");

			// Contact info first selection
			contact1.on("keyup click load", function () {
				if ($(this).val() === 'yes') {
					info.attr('aria-hidden', 'false').show("slow");
				} else if ($(this).val() === 'no' && (contact2.val() === 'no' || contact2.val() === null)) {
					info.attr('aria-hidden', 'true').hide("slow");
				}
			}).trigger("load");

			// Contact info second selection
			contact2.on("keyup click load", function () {
				if ($(this).val() === 'yes') {
					info.attr('aria-hidden', 'false').show("slow");
				} else if ($(this).val() === 'no' && (contact1.val() === 'no' || contact1.val() === null)) {
					info.attr('aria-hidden', 'true').hide("slow");
				}
			}).trigger("load");

			// Prepopulates URL form field with referrer
			web.find('#page').attr('value', referrerUrl);

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));