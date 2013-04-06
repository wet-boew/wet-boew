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
(function ($) {

var _pe = window.pe || {
		fn : {}
	};




$.extend($.expr[":"], {rowlevel:function (elem, i, match, array) {

	// query Example: $('table:eq(4):summary:collevel(1)').css('background-color', 'yellow');
	

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
			if ($(elem).data().tblparser.rowlevel === match[3]) {
				return true;
			}
		}
		break;
	case "td": // Cell
		if (match[3]) {
			if ($(elem).data().tblparser.rowlevel === match[3]) {
				return true;
			}
		}
		break;
	
	}



	 return false;
}});

$.fn.rowlevel = function (level) {

	// TODO add the function (.next()) at the end to loop all the elements

	var obj = this;
	var objDOM = $(this).get(0);
	
	if (!level) {
		level = 1; // Default Level
	}

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
			if ($(obj).data().tblparser.scope === "row") {
				if ($(obj).data().tblparser.rowlevel === level) {
					var stack = [];
					stack.push($(obj).data().tblparser.elem);
					return $(stack);
				}
			}
			break;
			
		case "td": // Cell
			
			
			
			if ($(obj).data().tblparser.rowlevel === level) {
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
