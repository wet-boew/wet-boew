/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Deselectable radio buttons plugin
 */
/*global jQuery: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.deselectradio = {
		type : 'plugin',
		depends : [],
		_exec : function (elm) {
			var radio = $('input[type="radio"]:not(.deselectable, .deselect-off)').attr('role', 'radio').attr('aria-checked', 'false').addClass('deselectable');
			radio.filter(':checked').attr('aria-checked', 'true');
			radio.closest('fieldset').attr('role', 'radiogroup');
			radio.on("click vclick", function () {
				var $this = $(this);
				if ($this.attr('aria-checked') === 'true') {
					$this.prop('checked', false).attr('aria-checked', 'false');
				} else {
					$this.closest('fieldset').find('input[type="radio"]').prop('checked', false).attr('aria-checked', 'false');
					$this.prop('checked', true).attr('aria-checked', 'true');
				}
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
