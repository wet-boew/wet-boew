/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/**
 * row Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, array: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};

	$.extend($.expr[":"], {cell: function (elem, i, match, array) {
		var tblElem,
			ElemNodeName,
			j, _ilen, _jlen, col,
			tblparser = $(elem).data().tblparser;

		// query Example: $('table:eq(4):keycell').css('background-color', 'yellow');

		// Is elem are a valid element for this selector ?
		if (!tblparser) {
			// Get the table element
			tblElem = elem;

			while (true) {
				ElemNodeName = tblElem.nodeName.toLowerCase();
				if (ElemNodeName !== "table" && ElemNodeName !== "caption" &&
						ElemNodeName !== "colgroup" && ElemNodeName !== "col" &&
						ElemNodeName !== "thead" && ElemNodeName !== "tbody" &&
						ElemNodeName !== "tfoot" && ElemNodeName !== "tr" &&
						ElemNodeName !== "th" && ElemNodeName !== "td") {

					return false; // elem are not valid
				}

				if (ElemNodeName === "table") {
					break; // Horay we have found the table, now we can do the parsing
				}

				// Get the parent
				tblElem = $(tblElem).parent().get(0);
			}

			// Call the table parser before to filter the result
			_pe.fn.parsertable._exec($(tblElem));
		}

		switch (elem.nodeName.toLowerCase()) {
		case "table": // Matrix
			break;
		case "caption": // Cell
			break;
		case "colgroup": // Group
			for (i = 0, _ilen = tblparser.col.length; i < _ilen; i += 1) {
				col = tblparser.col[i];
				for (j = 0, _jlen = col.cell.length; j < _jlen; j += 1) {
					array.push(col.cell[j].elem);
				}
			}

			return false;
		case "col": // Vector
			for (i = 0, _ilen = tblparser.cell.length; i < _ilen; i += 1) {
				array.push(tblparser.cell[i].elem);
			}
			return false;
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector
			for (i = 0, _ilen = tblparser.cell.length; i < _ilen; i += 1) {
				array.push(tblparser.cell[i].elem);
			}
			return false;
		case "th": // Cell
			// console.log('Cell selector called for th');
			return true;
		case "td": // Cell
			// console.log('Cell selector called for td');
			return true;
		}

		return false;
	}});

	$.fn.cell = function (elem) {
		var obj = (elem ? $(elem) : this),
			objDOM = (elem ? $(elem) : this).get(0),
			tblElem,
			ElemNodeName,
			i, _ilen,
			j, _jlen,
			col,
			stack,
			tblparser = $(obj).data().tblparser;

		if (!tblparser) {
			// Get the table element
			tblElem = obj;

			while (true) {
				ElemNodeName = tblElem.nodeName.toLowerCase();
				if (ElemNodeName !== "table" && ElemNodeName !== "caption" &&
						ElemNodeName !== "colgroup" && ElemNodeName !== "col" &&
						ElemNodeName !== "thead" && ElemNodeName !== "tbody" &&
						ElemNodeName !== "tfoot" && ElemNodeName !== "tr" &&
						ElemNodeName !== "th" && ElemNodeName !== "td") {

					return false; // elem are not valid
				}

				if (ElemNodeName === "table") {
					break; // Horay we have found the table, now we can do the parsing
				}

				// Get the parent
				tblElem = $(tblElem).parent().get(0);
			}

			// Call the table parser before to filter the result
			_pe.fn.parsertable._exec($(tblElem));
		}

		// Check what is "this"
		switch (objDOM.nodeName.toLowerCase()) {
		case "table": // Matrix
			break;
		case "caption": // Cell
			// A Caption can not have any key cell
			return $();
		case "colgroup": // Group
			for (i = 0, _ilen = tblparser.col.length; i < _ilen; i += 1) {
				col = tblparser.col[i];
				for (j = 0, _jlen = col.cell.length; j < _jlen; j += 1) {
					array.push(col.cell[j].elem);
				}
			}
			break;
		case "col": // Vector
			stack = [];
			for (i = 0, _ilen = tblparser.cell.length; i < _ilen; i += 1) {
				stack.push(tblparser.cell[i].elem);
			}
			return $(stack);
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector
			stack = [];
			for (i = 0, _ilen = tblparser.cell.length; i < _ilen; i += 1) {
				stack.push(tblparser.cell[i].elem);
			}
			return $(stack);
		case "th": // Cell
			return obj;
		case "td": // Cell
			return obj;
		}
		return $();
	};
	window.pe = _pe;
	return _pe;
}(jQuery));