/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/**
 * col Selector - Table usability - Core plugin
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

	$.extend($.expr[":"], {col: function (elem, i, match, array) {
		var tblElem,
			ElemNodeName,
			tblparser = $(elem).data().tblparser,
			_ilen;

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
				array.push(tblparser.col[i].elem);
			}
			break;
		case "col": // Vector
			return true;
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector
			break;
		case "th": // Cell
			if (tblparser.type !== 1) {
				return false;
			}
			if (tblparser.scope === "col") {
				return true;
			}
			break;
		case "td": // Cell
			if (tblparser.col.elem) {
				array.push(tblparser.col.elem);
			}
			return false;
		}
		return false;
	}});

	$.fn.col = function (elem) {
		var obj = (elem ? $(elem) : this),
			objDOM = (elem ? $(elem) : this).get(0),
			tblElem,
			ElemNodeName,
			stack,
			i, _ilen,
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
			stack = [];
			for (i = 0, _ilen = tblparser.col.length; i < _ilen; i += 1) {
				stack.push(tblparser.col[i].elem);
			}
			return $(stack);
		case "col": // Vector
			return elem;
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector
			break;
		case "th": // Cell
			if (tblparser.type !== 1) {
				return $();
			}
			if (tblparser.scope === "col") {
				return obj;
			}
			break;
		case "td": // Cell
			if (tblparser.col.elem) {
				stack = [];
				stack.push(tblparser.col.elem);
				return $(stack);
			}
			break;
			// array.push($(elem).data().tblparser.row.elem);

			// var ret = $(tblparser.row.elem);
			// ret.prevObject = obj;
			// return this.pushStack(ret, "row", "");

			// Return true if this are a key cell otherwise false
		}
		return $();
	};
	window.pe = _pe;
	return _pe;
}(jQuery));