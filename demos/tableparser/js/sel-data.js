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

	$.extend($.expr[":"], {data: function (elem, i, match, array) {
		var tblElem,
			ElemNodeName,
			j, _ilen, _jlen,
			tblparser = $(elem).data().tblparser,
			row, col;
		// query Example: $('table:eq(4):summary').css('background-color', 'yellow');

		// Is elem are a valid element ?
		if (!$(elem).data().tblparser) {
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
			if (tblparser.row) {
				for (i = 0, _ilen = tblparser.row.length; i < _ilen; i += 1) {
					row = tblparser.row[i];
					for (j = 0, _jlen = row.cell.length; j < _jlen; j += 1) {
						if (row.cell[j].type === 2) {
							array.push(row.cell[j].elem);
						}
					}
				}
			}
			break;
		case "caption": // Cell
			// TODO: Return all the data cell
			break;
		case "colgroup": // Group
			if (tblparser.type === 2) {
				return true;
			}
			break;
		case "col": // Vector
			if (tblparser.type === 2) {
				return true;
			}
			//if (tblparser.cell) {
			//	for (i = 0, _ilen = tblparser.cell.length; i < _ilen; i += 1) {
			//		if (tblparser.cell[i].type === 2) {
			//			array.push(tblparser.cell[i].elem);
			//		}
			//	}
			//}
			break;
		case "thead": // Group
			// There are no data cell in the thead, if they are that is an table design layout issue
			return false;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			// There are no data cell in the tfoot, if there are that is an table design layout issue
			return false;
		case "tr": // Vector
			if (tblparser.type === 2) {
				return true;
			}
			break;
		case "th": // Cell
			if (tblparser.type !== 1) {
				return false; // To Exclude any layout cell
			}

			// return false;

			// If there are no TD in the stack, we would fill the stack
			for (i = 0, _ilen = array.length; i < _ilen; i += 1) {
				if (array[i].nodeName.toLowerCase() === "td") {
					// console.log('No td added from th');
					return false;
				}
			}

			// Check for the th scope if is column or row, Invalid for layout th
			if (tblparser.scope === "row") {

				if (tblparser.height === 1) {
					// Only one row, go strait forward
					row = tblparser.row;
					for (i = 0, _ilen = row.cell.length; i < _ilen; i += 1) {
						if (row.cell[i].type === 2) {
							array.push(row.cell[i].elem);
						}
					}
					return false;
				}

				for (i = 0, _ilen = tblparser.groupZero.row.length; i < _ilen; i += 1) {
					row = tblparser.groupZero.row[i];
					if (row.rowpos > (tblparser.rowpos + tblparser.height - 1)) {
						break;
					}
					if (row.rowpos >= tblparser.rowpos && row.rowpos <= (tblparser.rowpos + tblparser.height - 1)) {

						for (j = 0, _jlen = row.cell.length; j < _jlen; j += 1) {
							if (row.cell[j].type === 2) {
								array.push(row.cell[j].elem);
							}
						}
					}
				}
			}

			// Column scope
			if (tblparser.scope === "col") {
				for (i = 0, _ilen = tblparser.groupZero.col.length; i < _ilen; i += 1) {
					col = tblparser.groupZero.col[i];
					if (col.end > (tblparser.colpos + tblparser.width - 1)) {
						break;
					}
					if (col.start >= tblparser.colpos && col.end <= (tblparser.colpos + tblparser.width - 1)) {

						for (j = 0, _jlen = col.cell.length; j < _jlen; j += 1) {
							if (col.cell[j].type === 2) {
								array.push(col.cell[j].elem);
							}
						}
					}
				}
			}
			break;
		case "td": // Cell
			if (tblparser.type === 2) {
				// console.log('dataCellFound');
				return true;
			}
			// console.log($(elem));
			// console.log(array);
			// console.log('dataCellNOTFound');
			// return false;
			break;
		}

		return false;
	}});

	$.fn.tbldata = function (level) {
		var obj = this,
			objDOM = $(this).get(0),
			tblElem,
			ElemNodeName,
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
			if (tblparser.type === 2 && (!level ? true : tblparser.collevel === level)) {
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