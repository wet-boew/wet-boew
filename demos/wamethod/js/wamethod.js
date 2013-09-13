/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Web Accessibility Assessment Methodology
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.wamethod = {
		type: 'plugin',
		_exec: function (elm) {
			var summary = elm.find('#summary'),
				summarytd = summary.find('td'),
				input = elm.find('#checklist input'),
				calcfields = summary.find('span').html('0'),
				aaaIncluded = calcfields.filter('#rsltAAA').length > 0; // Test to see if AAA Success Criteria are included

			// Apply WAI-ARIA
			summarytd.find('td').attr('aria-live', 'polite').attr('aria-relevant', 'text').attr('aria-atomic', 'true').attr('aria-busy', 'false');

			// Event handler
			input.on('change', function () {
				var a = input.filter('[id^="ap"]:checked, [id^="an"]:checked').length,
					aeval = a + input.filter('[id^="af"]:checked').length,
					aa = input.filter('[id^="aap"]:checked, [id^="aan"]:checked').length,
					aaeval = aa + input.filter('[id^="aaf"]:checked').length,
					aaa = input.filter('[id^="aaap"]:checked, [id^="aaan"]:checked').length,
					aaaeval = aaa + input.filter('[id^="aaaf"]:checked').length,
					na = input.filter('[id^="an"]:checked, [id^="aan"]:checked, [id^="aaan"]:checked').length;

				//Update number of Success Criteria evaluated and passed
				summarytd.attr('aria-busy', 'true');
				calcfields.filter('#rsltA').html(a);
				calcfields.filter('#percA').html(Math.round(a / 0.25));
				calcfields.filter('#rsltAA').html(aa);
				calcfields.filter('#percAA').html(Math.round(aa / 0.13));
				calcfields.filter('#naTotal').html(na);
				if (aaaIncluded) {
					calcfields.filter('#rsltAAA').html(aaa);
					calcfields.filter('#percAAA').html(Math.round(aaa / 0.23));
				}
				calcfields.filter('#evalTotal').html(aeval + aaeval + aaaeval);
				calcfields.filter('#percEvalTotal').html(Math.round((aeval + aaeval + aaaeval) / 0.61));
				calcfields.filter('#rsltTotal').html(a + aa + aaa);
				calcfields.filter('#percTotal').html(Math.round((a + aa + aaa) / 0.61));
				calcfields.filter('#percNATotal').html(Math.round(na / 0.61));
				summarytd.attr('aria-busy', 'false');
			});

			function removeCorners() {
				elm.find('h2, #checklist h3, .last').each(function () {
					var $this = $(this);
					$this.before('<' + $this.get(0).tagName + ' class="print">' + $this.text() + '</' + $this.get(0).tagName + '>');
					$this.hide();
				});
			}

			function restoreCorners() {
				elm.find('h2, #checklist h3, .last').each(function () {
					elm.find('.print').remove();
					elm.find('h2, #checklist h3, .last').show();
				});
			}

			// Disable rounded corners before printing and restore after printing (rounded corners do not print well in IE6 - IE8)
			if (pe.ie > 0 && pe.ie < 9) {
				window.onbeforeprint = removeCorners;
				window.onafterprint = restoreCorners;
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
