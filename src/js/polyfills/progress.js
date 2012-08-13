/*! HTML5 Progress polyfill | Jonathan Stipe | https://github.com/jonstipe/progress-polyfill*/
/* Updated by Laurent Goderre | https://github.com/LaurentGoderre/progress-polyfill */
(function ($) {
	$.fn.progress = function () {
		return $(this).each(function () {
			var $this = $(this),
				progress = $this.children('.progress-frame, .progress-undefined'),
				params,
				amt,
				attr = {'role': 'progressbar'};

			if ($this.is('[value]')) {
				if (progress.length < 1) {
					progress = $('<div class="progress-frame"><div class="progress-bar"/></div>');
					$this.on('DOMAttrModified propertychange', function () {
						$this.progress();
					});
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
				progress.children('.progress-bar').css('width', amt + '%');

			} else if ($this.not('[value]') && progress.length < 1) {
				progress = $('<div class="progress-undefined"/>');
			}
			$this.append(progress);
			$this.attr(attr);
		});
	};
	$('progress').progress();
}(jQuery));