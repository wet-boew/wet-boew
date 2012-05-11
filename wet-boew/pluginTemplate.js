/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Template for WET-BOEW v3.x plugins
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.pluginName = {
		type: 'plugin',
		// This is an example from tabbed interface, to show how to call required libraries
		depends: ['easytabs', 'equalheights'],
		// Don't include a mobile function if your plugin shouldn't run in mobile mode.
		mobile: function (elm) {
			// If applicaple, convert html elements and attributes into the format that jQuery mobile expects.
			return elm;
		},
		_exec: function (elm) {
			// Don't include this if statement if your plugin shouldn't run in mobile mode.
			if (pe.mobile) {
				return _pe.fn.pluginName.mobile(elm);
			}
			var opts,
				aVariable,
				anotherVariable;
			opts = {
				// This is an example from tabbedinterface, to show how to pass configuration parameters from the html element to the plugin.
				// There are some simple examples here, along with some more complicated ones.
				defaultElm: ((elm.find(".default").length) ? ".default" : "li:first-child"),
				autoHeight: (elm.hasClass("auto-height-none") ? false : true),
				cycle: (elm.hasClass("cycle-slow") ? 8000 : (elm.hasClass("cycle-fast") ? 2000 : (elm.hasClass("cycle") ? 6000 : false))),
				carousel: (/style-carousel/i.test(elm.attr('class'))) ? true : false,
				autoPlay: (elm.hasClass("auto-play") ? true : false),
				animate: (elm.hasClass("animate") || elm.hasClass("animate-slow") || elm.hasClass("animate-fast") ? true : false),
				animationSpeed: (elm.hasClass("animate-slow") ? "slow" : (elm.hasClass("animate-fast") ? "fast" : "normal"))
			};
			// Do plugin stuff here...
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));