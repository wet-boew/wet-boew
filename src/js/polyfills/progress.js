/*! HTML5 Progress polyfill | Jonathan Stipe | https://github.com/jonstipe/progress-polyfill*/
(function ($) {
	document.createElement('progress');
	var updatePolyfill = function (progressElem, progressBarDiv) {
		var params = $([(progressElem.attr('max') || '1.0'), progressElem.attr('value')]).map(function () {
			if (/^\-?\d+(?:\.\d+)?$/.test(this)) {
				return parseFloat(this);
			}
		}).get(),
			max = params[0],
			val = params[1],
			amt;

		if (val > max) {val = max; }
		amt = (val / max) * 100.0;
		progressBarDiv.css("width", amt + "%");
	};
	$('progress[value]').each(function (index) {
		var progressDiv = $('<div class="progress-frame"><div class="progress-bar"/></div>');
		$(this).append(progressDiv);
		$(this).on("DOMAttrModified propertychange", function (event) {
			updatePolyfill($(this), progressDiv.children('.progress-bar'));
		});
		$(this).trigger('DOMAttrModified');
	});

	$('progress:not([value])').each(function (index) {
		var progressDiv = $('<div class="progress-undefined"/>');
		$(this).append(progressDiv);
	});
}(jQuery));