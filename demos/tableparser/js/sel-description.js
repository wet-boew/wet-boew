/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/**
 * Description Cell Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, console: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {description:function (elem, i, match, array) {
	var ret,
		ElemNodeName,
		tblElem,
		tblparser = $(elem).data().tblparser,
		j, _ilen, _jlen,
		desccell, thRS,
		data, cell, row,
		stack,
		keycell = tblparser.keycell;

	// query Example: $('table:eq(4):description').css('background-color', 'yellow');

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
		// Return all the description cell
		if (tblparser.desccell) {
			desccell = tblparser.desccell;
			for (i = 0, _ilen = desccell.length; i < _ilen; i += 1) {
				ret = desccell[i].elem;
				array.push(ret);
				ret.prevObject = elem;
			}
		}
		break;
	case "caption": // Cell
		// A Caption can not have any description cell
		// Question: Return the details element if any ?
		break;
	case "colgroup": // Group
		
		// return any description cell in the thead
		data = tblparser;
		thRS = data.groupZero.theadRowStack;
		for (i = 0, _ilen = thRS.length; i < _ilen; i += 1) {
			for (j = 0; j< thRS[i].cell.length; j += 1) {
				cell = thRS[i].cell[j];
				
				if ((cell.type === 5 || cell.descCell)  && cell.colpos >= data.start && (cell.colpos + cell.width -1) <= data.end) {
					if (cell.descCell) {
						cell = cell.descCell;
					}
					ret = cell.elem;
					array.push(ret);
					ret.prevObject = elem;
				}
			}
			
		}
		// return any description cell in the colgroup header if selected
		if (data.start === 1) {
			for (i = 0, _ilen = i < data.groupZero.row.length; i < _ilen; i += 1) {
				row = data.groupZero.row;
				for (j = 0, _jlen = row[i].cell.length; j < _jlen; j += 1) {
					cell = row.cell[j];
					if (cell.type === 5 && cell.colpos >= data.start && (cell.colpos + cell.width -1) <= data.end) {
						ret = cell.elem;
						array.push(ret);
						ret.prevObject = elem;
					}
				}
				
			}
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
		// Return all the description cell for this row
		if (keycell) {
			stack = [];
			for (i = 0, _ilen = keycell.length; i < _ilen; i += 1) {
				stack.push(keycell[i].elem);
			}
			return stack;
		}
		return $();
	case "th": // Cell
		// Return the associative key cell
		if (keycell) {
			ret = $(keycell.elem);
			console.log('add in push stack');
			ret.prevObject = elem;
			console.log(ret);
			return this.pushStack(ret, "parsertablekey", "");
			//return $(keycell.elem);
		}
		break;
	case "td": // Cell
		// Return true if this are a key cell otherwise false
		if (tblparser.type === 5) {
			return true;
		}
		break;
	}
	return false;
}});
	window.pe = _pe;
	return _pe;
}(jQuery));