/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Deselectable radio buttons plugin
 */
/*global jQuery: false, pe:false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.deselectradio = {
		type : 'plugin',
		depends : [],
		_exec : function (elm) {
			var radio = $('input:radio').attr('role', 'radio').attr('aria-checked', 'false');
			radio.filter(':checked').attr('aria-checked', 'true');
			radio.closest('fieldset').attr('role', 'radiogroup');
			radio.on("click vclick", function () {
				var $this = $(this);
				if ($this.attr('aria-checked') === 'true') {
					$this.prop('checked', false).attr('aria-checked', 'false');
				} else {
					$this.closest('fieldset').find('input:radio').prop('checked', false).attr('aria-checked', 'false');
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