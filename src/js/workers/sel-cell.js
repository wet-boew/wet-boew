/*!
 * Web Experience Toolkit (WET) / Bo�te � outils de l'exp�rience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * row Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
(function ($) {

var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {cell:function(elem, i, match, array){  

	// query Example: $('table:eq(4):keycell').css('background-color', 'yellow');

	// Is elem are a valid element for this selector ?
	if(!$(elem).data().tblparser){
		// Get the table element
		var tblElem = elem;
		
		while(true){
			var ElemNodeName = tblElem.nodeName.toLowerCase();
			if(ElemNodeName != "table" && ElemNodeName != "caption" &&
				ElemNodeName != "colgroup" && ElemNodeName != "col" && 
				ElemNodeName != "thead" && ElemNodeName != "tbody" && 
				ElemNodeName != "tfoot" && ElemNodeName != "tr" && 
				ElemNodeName != "th" && ElemNodeName != "td"){
			
				return false; // elem are not valid
			}
			
			if(ElemNodeName == "table"){
				break; // Horay we have found the table, now we can do the parsing
			}
			
			// Get the parent
			tblElem = $(tblElem).parent().get(0);
			
		}
		
		// Call the table parser before to filter the result
		_pe.fn.parsertable._exec($(tblElem));
	}
	
	switch(elem.nodeName.toLowerCase()){
	
	case "table": // Matrix
		break;
	case "caption": // Cell
		break;
	case "colgroup": // Group
		
		for(i=0; i<$(elem).data().tblparser.col.length; i++){
			for(j=0; j< $(elem).data().tblparser.col[i].cell.length; j++){
				array.push($(elem).data().tblparser.col[i].cell[j].elem);
			}
		}
		
		return false;
	case "col": // Vector
		for(i=0; i< $(elem).data().tblparser.cell.length; i++){
			array.push($(elem).data().tblparser.cell[i].elem);
		}
		return false;
	case "thead": // Group
		break;
	case "tbody": // Group
		break;
	case "tfoot": // Group
		break;
	case "tr": // Vector
		for(i=0; i< $(elem).data().tblparser.cell.length; i++){
			array.push($(elem).data().tblparser.cell[i].elem);
		}
		return false;
	case "th": // Cell
		// console.log('Cell selector called for th');
		return true;
	case "td": // Cell
		// console.log('Cell selector called for td');
		return true;
	}

	 return false;
}});

$.fn.cell = function(elem){

	var obj = (elem?$(elem):this);
	var objDOM = (elem?$(elem):this).get(0);

	if(!$(obj).data().tblparser){

		// Get the table element
		var tblElem = obj;
		
		while(true){
			var ElemNodeName = tblElem.nodeName.toLowerCase();
			if(ElemNodeName != "table" && ElemNodeName != "caption" &&
				ElemNodeName != "colgroup" && ElemNodeName != "col" && 
				ElemNodeName != "thead" && ElemNodeName != "tbody" && 
				ElemNodeName != "tfoot" && ElemNodeName != "tr" && 
				ElemNodeName != "th" && ElemNodeName != "td"){
			
				return false; // elem are not valid
			}
			
			if(ElemNodeName == "table"){
				break; // Horay we have found the table, now we can do the parsing
			}
			
			// Get the parent
			tblElem = $(tblElem).parent().get(0);
			
		}
		
		// Call the table parser before to filter the result
		_pe.fn.parsertable._exec($(tblElem));
	}


	

	// Check what is "this"
	switch(objDOM.nodeName.toLowerCase()){
	
		case "table": // Matrix
			break;
		case "caption": // Cell
			// A Caption can not have any key cell
			return $();
		case "colgroup": // Group
			for(i=0; i<$(obj).data().tblparser.col.length; i++){
				for(j=0; j< $(obj).data().tblparser.col[i].cell.length; j++){
					array.push($(obj).data().tblparser.col[i].cell[j].elem);
				}
			}
			break;
		case "col": // Vector
			var stack = [];
			for(i=0; i<$(obj).data().tblparser.cell.length; i++){
				stack.push($(obj).data().tblparser.cell[i].elem);
			}
			return $(stack);
			break;
		case "thead": // Group
			break;
		case "tbody": // Group
			break;
		case "tfoot": // Group
			break;
		case "tr": // Vector
			var stack = [];
			for(i=0; i<$(obj).data().tblparser.cell.length; i++){
				stack.push($(obj).data().tblparser.cell[i].elem);
			}
			return $(stack);

		case "th": // Cell
			return obj;
		case "td": // Cell
			return obj;
	}
	return $();
}

	window.pe = _pe;
	return _pe;
}(jQuery));
