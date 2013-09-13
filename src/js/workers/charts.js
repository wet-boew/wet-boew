/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.htm / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Charts for WET 3.1
 */
(function () {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.charts = {
		type: 'plugin',
		depends: (_pe.preIE9 ? ['parserTable', 'excanvas', 'flot', 'charts'] : ['parserTable', 'flot', 'charts']),
		polyfills: ['detailssummary'],
		_exec: function (elm) {
			_pe.fn.chartsGraph.generate(elm);
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}());
