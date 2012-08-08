/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * col Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, array: false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};

	$.extend($.expr[":"], {col: function (elem, i, match, array) {
		var tblElem,
			ElemNodeName;

		// query Example: $('table:eq(4):keycell').css('background-color', 'yellow');

		// Is elem are a valid element for this selector ?
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
			for (i = 0; i < $(elem).data().tblparser.col.length; i += 1) {
				array.push($(elem).data().tblparser.col[i].elem);
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
			if ($(elem).data().tblparser.type !== 1) {
				return false;
			}
			if ($(elem).data().tblparser.scope === "col") {
				return true;
			}
			break;
		case "td": // Cell
			if ($(elem).data().tblparser.col.elem) {
				array.push($(elem).data().tblparser.col.elem);
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
			i;

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
			stack = [];
			for (i = 0; i < $(obj).data().tblparser.col.length; i += 1) {
				stack.push($(obj).data().tblparser.col[i].elem);
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
			if ($(obj).data().tblparser.type !== 1) {
				return $();
			}
			if ($(obj).data().tblparser.scope === "col") {
				return obj;
			}
			break;
		case "td": // Cell
			if ($(obj).data().tblparser.col.elem) {
				stack = [];
				stack.push($(obj).data().tblparser.col.elem);
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