/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Progress
 */

(function ($) {
	"use strict";
	$.fn.progress = function () {
		return $(this).each(function () {
			var $this = $(this),
				progress = $this.children('.wb-progress-outer, .wb-progress-undefined'),
				params,
				amt,
				attr = {'role': 'progressbar'};

			$this.off('DOMAttrModified propertychange');
			if ($this.is('[value]')) {
				if (progress.length < 1) {
					progress = $('<div class="wb-progress-outer"><div class="wb-progress-inner"/></div>');
					$this.append(progress);
				}
				params = $([$this.attr('max') || '1.0', $this.attr('value')]).map(function () {
					try {
						return parseFloat(this);
					} catch (e) { return null; }
				});
				attr['aria-valuemin'] = 0;
				attr['aria-valuemax'] = params[0];
				attr['aria-valuenow'] = params[1];

				if (attr['aria-valuenow'] > attr['aria-valuemax']) {attr['aria-valuenow'] = attr['aria-valuemax']; }
				amt = (attr['aria-valuenow'] / attr['aria-valuemax']) * 100.0;
				progress.children('.wb-progress-inner').css('width', amt + '%');

			} else if ($this.not('[value]') && progress.length < 1) {
				progress = $('<div class="wb-progress-undefined"/>');
				$this.append(progress);
			}

			$this.attr(attr);
			setTimeout(function () {
				$this.on('DOMAttrModified propertychange', function () {
					$this.progress();
				});
			}, 0);
		});
	};
	$('progress').progress();
}(jQuery));