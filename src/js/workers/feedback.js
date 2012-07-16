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
			var feedback = elm.find('#feedback'),
				web = elm.find('#web'),
				access = web.find('#access'),
				mobile = web.find('#mobile'),
				computer = web.find('#computer'),
				contact_coord = elm.find('#contact-coord'),
				contact1 = contact_coord.find('#contact1'),
				contact2 = contact_coord.find('#contact2'),
				info = contact_coord.find('#info'),
				referrerUrl = document.referrer,
				urlParams = pe.url(document.location).params,
				load;

			// Web Questions
			feedback.attr('aria-controls', 'web').on("keyup click load", function (e) {
				load = (e.type === "load");
				if (!load && $(this).val() === 'web') {
					web.attr('aria-hidden', 'false').show("slow");
				} else {
					web.attr('aria-hidden', 'true').hide((load ? "" : "slow"));
				}
			});
			// Automatically select the reason if specified in the query string

			if (urlParams.submit === undefined && urlParams.feedback !== undefined) {
				feedback.find('option[value="' + urlParams.feedback + '"]').attr("selected", "selected");
			}
			feedback.trigger("load");

			// Computer and Mobile
			access.attr('aria-controls', 'mobile computer').on("keyup click load", function (e) {
				load = (e.type === "load");
				if (!load && access.val() === 'mobile') {
					mobile.attr('aria-hidden', 'false').show("slow");
					computer.attr('aria-hidden', 'true').hide("slow");
				} else {
					computer.attr('aria-hidden', 'false').show((load ? "" : "slow"));
					mobile.attr('aria-hidden', 'true').hide((load ? "" : "slow"));
				}
			}).trigger("load");

			// Contact info first selection
			contact1.on("keyup click load", function (e) {
				load = (e.type === "load");
				if (!load && $(this).val() === 'yes') {
					info.attr('aria-hidden', 'false').show("slow");
				} else if (load || (($(this).val() === 'no' || $(this).val() === null) && (contact2.val() === 'no' || contact2.val() === null))) {
					info.attr('aria-hidden', 'true').hide((load ? "" : "slow"));
				}
			}).trigger("click");

			// Contact info second selection
			contact2.on("keyup click load", function (e) {
				load = (e.type === "load");
				if (!load && $(this).val() === 'yes') {
					info.attr('aria-hidden', 'false').show("slow");
				} else if (load || (($(this).val() === 'no' || $(this).val() === null) && (contact1.val() === 'no' || contact1.val() === null))) {
					info.attr('aria-hidden', 'true').hide((load ? "" : "slow"));
				}
			}).trigger("load");

			// Prepopulates URL form field with referrer
			web.find('#page').attr('value', referrerUrl);

			// Return to the form defaults when the reset button is activated
			elm.find('input[type=reset]').on('click', function () {
				feedback.trigger("load");
				access.trigger("load");
				contact1.trigger("load");
				contact2.trigger("load");
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));