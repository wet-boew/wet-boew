/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * row Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, pe: false*/
(function ($) {

	var _pe = window.pe || {
		fn : {}
	};

	$.extend($.expr[":"], {tblheader: function (elem, i, match, array) {

	// query Example: $('table:eq(4):keycell').css('background-color', 'yellow');

	// Is elem are a valid element for this selector ?
		if (!$(elem).data().tblparser) {
			// Get the table element
			var tblElem = elem,
				ElemNodeName;

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
			if ($(elem).data().tblparser.type !== 1) {
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
			tblElem,
			ElemNodeName,
			stack,
			i;

		if (!scope || !(scope === "row" | scope === "col")) {
			scope = "row";
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
			break;
		case "col": // Vector

			if (!$(obj).data().tblparser && !$(obj).data().tblparser.header) {
				return $(); // A col object is required
			}

			stack = [];

			for (i = 0; i < $(obj).data().tblparser.header.length; i += 1) {
				stack.push($(obj).data().tblparser.header[i].elem);
			}
			return $(stack);
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector

			if (!$(obj).data().tblparser && !$(obj).data().tblparser.header) {
				return $(); // A col object is required
			}

			stack = [];
			stack.push($(obj).data().tblparser.header.elem);
			return $(stack);

		case "th": // Cell
			return true;
		case "td": // Cell

			stack = [];
			if (scope === "row") {

				stack.push($(obj).data().tblparser.row.header.elem);
				return $(stack);

			} else {

				for (i = 0; i < $(obj).data().tblparser.col.header.length; i += 1) {
					stack.push($(obj).data().tblparser.col.header[i].elem);
				}
				return $(stack);
			}
			return $();

			stack = [];
			stack.push($(obj).data().tblparser.row.elem);
			return $(stack);

			// array.push($(elem).data().tblparser.row.elem);

			// var ret = $($(obj).data().tblparser.row.elem);
			// ret.prevObject = obj;
			// return this.pushStack(ret, "row", "");

			// Return true if this are a key cell otherwise false

		}
		return $();
	}

	window.pe = _pe;
	return _pe;
}(jQuery));