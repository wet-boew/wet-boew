/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Charts and graphs
 */
/*global jQuery: false, pe:false, wet_boew_charts: false, Raphael: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.charts = {
		type: 'plugin',
		depends: ['parserTable', 'flot', 'flotPie', 'charts'],
		polyfills: ['detailssummary'],
		_exec: function (elm) {
			_pe.fn.chartsGraph.generate(elm);
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
