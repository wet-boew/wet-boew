/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/**
 * Summary Cell Selector - Table usability - Core plugin
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

$.extend($.expr[":"], {summary:function (elem, i, match, array) {
	var tblElem,
		ElemNodeName,
		j, _ilen, _jlen,
		row,
		tblparser = $(elem).data().tblparser;
	// query Example: $('table:eq(4):summary').css('background-color', 'yellow');

	// Is elem are a valid element ?
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
		if ($(elem).data().tblparser.row) {
			for (i = 0, _ilen = tblparser.row.length; i < _ilen; i += 1) {
				row = $(elem).data().tblparser.row[i];
				for (j = 0, _jlen = row.cell.length; j < _jlen; j += 1) {
					if (row.cell[j].type === 3) {
						array.push(row.cell[j].elem);
					}
				}
			}
		}
		break;
	case "caption": // Cell
		break;
	case "colgroup": // Group
		if (tblparser.type === 3) {
			return true;
		}
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
		break;
	case "th": // Cell
		break;
	case "td": // Cell
		if (tblparser.type === 3) {
			return true;
		}
		break;
	}
	return false;
}});


$.fn.summary = function (level) {
	var obj = this,
		objDOM = $(this).get(0),
		tblparser = $(obj).data().tblparser,
		tblElem,
		stack,
		ElemNodeName;

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
			if (tblparser.type === 3) {
				stack = [];
				stack.push(tblparser.elem);
				return $(stack);
			}
			break;
		case "col": // Vector
			return obj;
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
			if (tblparser.type === 3 && (!level ? true : tblparser.collevel === level)) {
				stack = [];
				stack.push(tblparser.elem);
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
