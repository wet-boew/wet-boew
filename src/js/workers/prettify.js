/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Text highlighting functionality 
 */
/*global jQuery: false, pe: false, wet_boew_prettify: false, prettyPrint: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.prettify = {
		type: 'plugin',
		depends : ['prettify'],
		executed : false,
		_exec: function (elm) {
			// Make sure only executes once
			if (!pe.fn.prettify.executed) {
				var opts,
					overrides,
					pre = $('body').find('pre'),
					classes = elm.attr('class').split(' '),
					i;

				// Load language extensions as needed (called by adding lang-* in class, e.g., lang-css)
				for (i = 0; i < classes.length; i += 1) {
					if (classes[i].length < 12 && classes[i].indexOf('lang-') === 0) {
						pe.add._load([pe.add.liblocation + 'dependencies/prettify/' + classes[i] + pe.suffix + '.js']);
					}
				}

				// Defaults
				opts = {
					linenums : false,
					allpre : false
				};

				// Class-based overrides - use undefined where no override of defaults or settings.js should occur
				overrides = {
					linenums : elm.hasClass("linenums") ? true : undefined,
					allpre : elm.hasClass("all-pre") ? true : undefined
				};

				// Extend the defaults with settings passed through settings.js (wet_boew_prettify) and class-based overrides
				if (typeof wet_boew_prettify !== 'undefined' && wet_boew_prettify !== null) {
					$.extend(opts, wet_boew_prettify, overrides);
				} else {
					$.extend(opts, overrides);
				}

				if (opts.allpre) {
					pre.addClass('prettyprint');
				}
				if (opts.linenums) {
					pre.filter('.prettyprint').addClass('linenums');
				}

				prettyPrint();
				pe.fn.prettify.executed = true;
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));