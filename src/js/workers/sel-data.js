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
/*global jQuery: false, pe: false*/
(function ($) {

var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {data:function(elem, i, match, array){  

	// query Example: $('table:eq(4):summary').css('background-color', 'yellow');

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
		
		if($(elem).data().tblparser.row){
			for(i=0; i<$(elem).data().tblparser.row.length; i++){
				for(j=0; j<$(elem).data().tblparser.row[i].cell.length; j++){
					if($(elem).data().tblparser.row[i].cell[j].type == 2){
						array.push($(elem).data().tblparser.row[i].cell[j].elem);
					}
				}
				
			}
		}
		break;
	case "caption": // Cell
		// TODO: Return all the data cell
		break;
	case "colgroup": // Group
		if($(elem).data().tblparser.type == 2){
			return true;
		}
		break;
	case "col": // Vector
		if($(elem).data().tblparser.type == 2){
			return true;
		}
		//if($(elem).data().tblparser.cell){
		//	for(i=0; i<$(elem).data().tblparser.cell.length; i++){
		//		if($(elem).data().tblparser.cell[i].type == 2){
		//			array.push($(elem).data().tblparser.cell[i].elem);
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
		if($(elem).data().tblparser.type == 2){
			return true;
		}
		break;
	case "th": // Cell
		if($(elem).data().tblparser.type != 1){
			return false; // To Exclude any layout cell
		}
		
		// return false;
		
		// If there are no TD in the stack, we would fill the stack
		for(i=0; i< array.length; i++){
			if(array[i].nodeName.toLowerCase() == "td"){
				// console.log('No td added from th');
				return false;
			}
		};
		
		// Check for the th scope if is column or row, Invalid for layout th
		if($(elem).data().tblparser.scope == "row"){
			
			if($(elem).data().tblparser.height == 1){
				// Only one row, go strait forward
				for(i=0; i< $(elem).data().tblparser.row.cell.length; i++){
					if($(elem).data().tblparser.row.cell[i].type == 2){
						array.push($(elem).data().tblparser.row.cell[i].elem);
					}
				}
				return false;
			}
			
			
			for(i=0; i< $(elem).data().tblparser.groupZero.row.length; i++){
				if($(elem).data().tblparser.groupZero.row[i].rowpos > ($(elem).data().tblparser.rowpos + $(elem).data().tblparser.height -1)){
					break;
				}				
				if($(elem).data().tblparser.groupZero.row[i].rowpos >= $(elem).data().tblparser.rowpos &&
					$(elem).data().tblparser.groupZero.row[i].rowpos <= ($(elem).data().tblparser.rowpos + $(elem).data().tblparser.height -1)){
					
					for(j=0; j<$(elem).data().tblparser.groupZero.row[i].cell.length; j++){
						if($(elem).data().tblparser.groupZero.row[i].cell[j].type == 2){
							array.push($(elem).data().tblparser.groupZero.row[i].cell[j].elem);
						}
					}
					
				}
			}
			
			
		}
		
		// Column scope
		if($(elem).data().tblparser.scope == "col"){
			
			
			for(i=0; i< $(elem).data().tblparser.groupZero.col.length; i++){
				if($(elem).data().tblparser.groupZero.col[i].end > ($(elem).data().tblparser.colpos + $(elem).data().tblparser.width -1)){
					break;
				}				
				if($(elem).data().tblparser.groupZero.col[i].start >= $(elem).data().tblparser.colpos &&
					$(elem).data().tblparser.groupZero.col[i].end <= ($(elem).data().tblparser.colpos + $(elem).data().tblparser.width -1)){
					
					for(j=0; j<$(elem).data().tblparser.groupZero.col[i].cell.length; j++){
						if($(elem).data().tblparser.groupZero.col[i].cell[j].type == 2){
							array.push($(elem).data().tblparser.groupZero.col[i].cell[j].elem);
						}
					}
					
				}
			}
			
			
		}
		break;
		
	case "td": // Cell

		if($(elem).data().tblparser.type == 2){
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






$.fn.tbldata = function(level){
	
	
	var obj = this;
	var objDOM = $(this).get(0);
	

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
			
			
			if($(obj).data().tblparser.type == 2 &&(!level?true: $(obj).data().tblparser.collevel == level)){
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
