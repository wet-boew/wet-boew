/*!
 * Web Experience Toolkit (WET) / Bo�te � outils de l'exp�rience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * Summary Cell Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, array: false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};

	$.extend($.expr[":"], {collevel: function (elem, i, match, array) {
		var tblElem,
			ElemNodeName;
		// query Example: $('table:eq(4):summary:collevel(1)').css('background-color', 'yellow');

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
			break;
		case "th": // Cell
			if (match[3]) {
				if ($(elem).data().tblparser.collevel === match[3]) {
					return true;
				}
			}
			break;
		case "td": // Cell
			if (match[3]) {
				if ($(elem).data().tblparser.collevel === match[3]) {
					return true;
				}
			}
			break;
		}

		return false;
	}});

	$.fn.collevel = function (level) {
		var obj = this,
			objDOM = $(this).get(0),
			tblElem,
			ElemNodeName,
			stack;

		if (!level) {
			level = 1; // Default Level
		}

		if (!$(obj).data().tblparser) {
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
			if ($(obj).data().tblparser.level === level) {
				stack = [];
				stack.push($(obj).data().tblparser.elem);
				return $(stack);
			}
			break;
		case "col": // Vector
			//return elem;
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
			if ($(obj).data().tblparser.scope === "col") {
				if ($(obj).data().tblparser.colgroup.level === level) {
					stack = [];
					stack.push($(obj).data().tblparser.elem);
					return $(stack);
				}
			}
			break;
		case "td": // Cell
			if ($(obj).data().tblparser.collevel === level) {
				stack = [];
				stack.push($(obj).data().tblparser.elem);
				return $(stack);
			}
			break;
			// array.push($(elem).data().tblparser.row.elem);

			// var ret = $($(obj).data().tblparser.row.elem);
			// ret.prevObject = obj;
			// return this.pushStack(ret, "row", "");

			// Return true if this are a key cell otherwise false
		}
		return $();
	};
	window.pe = _pe;
	return _pe;
}(jQuery));