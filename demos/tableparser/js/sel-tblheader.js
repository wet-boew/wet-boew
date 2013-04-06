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
/*global jQuery: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {tblheader:function (elem, i, match, array) {
	var tblElem,
		ElemNodeName,
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
		break;
	case "col": // Vector
		break;
	case "thead": // Group
		break;
	case "tbody": // Group
		break;
	case "tfoot": // Group
		break;
	case "tr": // Vector
		array.push($(elem).data().tblparser.header.elem);
		return false;
	case "th": // Cell
		if (tblparser.type !== 1) {
			return false;
		}
		return true;
	case "td": // Cell
		return false;
	}
	return false;
}});


$.fn.tblheader = function (scope) {
	var obj = this,
		objDOM = $(this).get(0),
		tblparser = $(obj).data().tblparser,
		tblElem,
		ElemNodeName,
		stack,
		header,
		i, _ilen;

	if (!scope || !(scope === "row" || scope === "col")) {
		scope = "row";
	}

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
			break;
		case "col": // Vector
			if (!tblparser && !tblparser.header) {
				return $(); // A col object is required
			}
			stack = [];
			
			for (i = 0, _ilen = tblparser.header.length; i < _ilen; i += 1) {
				stack.push(tblparser.header[i].elem);
			}
			return $(stack);
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector
			if (!tblparser && !tblparser.header) {
				return $(); // A col object is required
			}
			stack = [];
			stack.push(tblparser.header.elem);
			return $(stack);
		case "th": // Cell
			return true;
		case "td": // Cell
			stack = [];
			if (scope === "row") {
				stack.push(tblparser.row.header.elem);
				return $(stack);
			} else {
				header = tblparser.col.header;
				for (i = 0, _ilen = header.length; i < _ilen; i += 1) {
					stack.push(header[i].elem);
				}
				return $(stack);
			}
			return $();
			
			/* **** Unreachable ****
			stack = [];
			stack.push(tblparser.row.elem);
			return $(stack);*/

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
