/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * Summary Cell Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
(function ($) {

var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {summary:function (elem, i, match, array) {

	// query Example: $('table:eq(4):summary').css('background-color', 'yellow');

	// Is elem are a valid element ?
	if (!$(elem).data().tblparser) {
		// Get the table element
		var tblElem = elem;
		
		while (true) {
			var ElemNodeName = tblElem.nodeName.toLowerCase();
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
			for (i = 0; i<$(elem).data().tblparser.row.length; i += 1) {
				for (j = 0; j<$(elem).data().tblparser.row[i].cell.length; j += 1) {
					if ($(elem).data().tblparser.row[i].cell[j].type === 3) {
						array.push($(elem).data().tblparser.row[i].cell[j].elem);
					}
				}
				
			}
		}
		break;
	case "caption": // Cell
		break;
	case "colgroup": // Group
		if ($(elem).data().tblparser.type === 3) {
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

		if ($(elem).data().tblparser.type === 3) {
			return true;
		}
		break;
	
	}



	 return false;
}});



$.fn.summary = function (level) {
	
	
	var obj = this;
	var objDOM = $(this).get(0);
	

	if (!$(obj).data().tblparser) {

		// Get the table element
		var tblElem = obj;
		
		while (true) {
			var ElemNodeName = tblElem.nodeName.toLowerCase();
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
			if ($(obj).data().tblparser.type === 3) {
				var stack = [];
				stack.push($(obj).data().tblparser.elem);
				return $(stack);
			}
			break;
		case "col": // Vector
			return elem;
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
			
			if ($(obj).data().tblparser.type !== 1) {
				return $();
			}
			if ($(obj).data().tblparser.scope === "col") {
				return obj;
			}
			break;
			
		case "td": // Cell
			
			
			
			if ($(obj).data().tblparser.type === 3 &&(!level?true: $(obj).data().tblparser.collevel === level)) {
				var stack = [];
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
}
	window.pe = _pe;
	return _pe;
}(jQuery));
