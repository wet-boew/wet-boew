/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * Description Cell Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, pe: false*/
(function ($) {

var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {description:function(elem, i, match, array){  

	// query Example: $('table:eq(4):description').css('background-color', 'yellow');

	// Is elem are a valid element ?
	
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
		// Return all the description cell
		if($(elem).data().tblparser.desccell){
			for(i=0; i<$(elem).data().tblparser.desccell.length; i++){

				var ret = $(elem).data().tblparser.desccell[i].elem;
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
		var data = $(elem).data().tblparser;
		for(i=0; i<data.groupZero.theadRowStack.length; i++){
			
			for(j=0; j< data.groupZero.theadRowStack[i].cell.length; j++){
				var cell = data.groupZero.theadRowStack[i].cell[j];
				
				if((cell.type == 5 || cell.descCell)  && cell.colpos >= data.start && (cell.colpos + cell.width -1) <= data.end){
					if(cell.descCell){
						cell = cell.descCell;
					}
					var ret = cell.elem;
					array.push(ret);
					ret.prevObject = elem;
				}
			}
			
		}
		// return any description cell in the colgroup header if selected
		if(data.start == 1){
			
			for(i=0; i<data.groupZero.row.length; i++){
			
				for(j=0; j< data.groupZero.row[i].cell.length; j++){
					var cell = data.groupZero.row[i].cell[j];
					
					if(cell.type == 5 && cell.colpos >= data.start && (cell.colpos + cell.width -1) <= data.end){
						var ret = cell.elem;
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
		
		if($(obj).data().tblparser.keycell){
			var stack = [];
			for(i=0; i<$(obj).data().tblparser.keycell.length; i++){
				stack.push($(obj).data().tblparser.keycell[i].elem);
			}
			return stack;
		}
		return $();
	case "th": // Cell
	
		// Return the associative key cell
		if($(obj).data().tblparser.keycell){
			var ret = $($(obj).data().tblparser.keycell.elem);
			console.log('add in push stack');
			ret.prevObject = obj;
			console.log(ret);
			return this.pushStack(ret, "parsertablekey", "");
			//return $($(obj).data().tblparser.keycell.elem);
		}
		break;
		
	case "td": // Cell
		
		// Return true if this are a key cell otherwise false
		if($(elem).data().tblparser.type == 5){
			return true;
		}
		break;
	
	}



	 return false;
}});

	window.pe = _pe;
	return _pe;
}(jQuery));