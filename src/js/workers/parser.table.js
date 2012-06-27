/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * Table Parser - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	
	
	//if(!_pe.fn.parser){_pe.fn.parser = {};}
	_pe.fn.parsertable = {
		type : 'plugin',
		_exec : function (elm) {
			
			// elm need to be a table
			if($(elm).get(0).nodeName.toLowerCase() != 'table'){
				return;
			}
			
			
			var obj = elm;

			// Event handler for issue error found durring the table parsing process
			var errorTrigger = function(err, obj){
				$(obj).trigger('parser.table.error', err, obj);
				console.log("Trigger ERROR: " + err);
			}

			// Check if this table was already parsed, if yes we exit by throwing an error
			if($(obj).tblparser){
				errorTrigger("The table was already parsed, Why you want to parse it a second time ?", obj);
				return;
			}
			

		
		/*
		//
		// JQuery Data set for an array of Element - testing
		//
		
		// For all td, set a shared data
		
		$('td', obj).data('table.col', '45');
		
		console.log('data : "table.col" was set for all td cells');
		
		// Retreive the data for the 3 and 7 data cell
		
		console.log('data "table.col" : for the 4th td cell');
		console.log($('td:eq(3)').data('table.col'));
		
		console.log('data "table.col" : for the 7th td cell');
		console.log($('td:eq(7)').data('table.col'));
		
		console.log('make a change only to the 5th cell');
		$('td:eq(4)').data('table.col', '99');
		
		console.log('data "table.col" : for the 4th td cell');
		console.log($('td:eq(3)').data('table.col'));
		
		console.log('data "table.col" : for the 7th td cell');
		console.log($('td:eq(7)').data('table.col'));

		console.log('data "table.col" : for the 5th td cell');
		console.log($('td:eq(4)').data('table.col'));
		
		
		return;
		*/
		
		
		var groupZero = {
			/*layoutCell: [], // List of layout cell
			data: {  // List of sub data cell 
				row: [],
				col: [] 
			},
			header: {  // List of sub header cell
				row: [],
				col: []
			},
			dataset: { // eg. tr and col element
				row: [],
				col: []
			},
			headergroup: { // eg. thead or colgroup
				row: [],
				col: []
			},
			datagroup: { // eg. tbody or colgroup
				row: [],
				col: []
			},
			summarygroup: { // eg. tfoot or colgroup
				row: [],
				col: []
			},
			*/
			allParserObj: []/*,
			
			nestedHeader: {
				row: [],
				col: []
			},
			
			// Direct Property
			elem: {}, // eg. caption element for the groupZero
			struct: {}, //eg. table element for the groupZero
			value: {}, // Content inside the summary tag, otherwise the same as the elem property
			desc: {}, // Content of the details tag, otherwise empty
			
			colpos: 0, // Zero for the groupZero
			rowpos: 0, // Zero for the groupZero
			
			level: 0, // Zero for the groupZero
			nblevel: 0 // Number of existing sub level based on this group*/
			, nbDescriptionRow: 0,
			
		};
		
		$(obj).data().tblparser = groupZero;
		
		
		var colgroupFrame = []; // Temporary used before to get the colgroup type
		var columnFrame = []; // Temporary used before to be at the data row group parsing
		groupZero.colgroup = colgroupFrame;
		
		var uidElem = 0;
		
		var currentRowLevel = 0;
		var currentRowPos = 0;
		var spannedRow = [];
		var tableCellWidth = 0;
		
		var rowgroupHeaderRowStack = [];
		var headerRowGroupCompleted = false;
		var summaryRowGroupEligible = false;
		var rowgroupLevel = 1; // Default RowGroupLevel
		var currentRowHeader = [];

		if(!groupZero.rowgroup){
			groupZero.rowgroup = [];
		}
		
		if(!groupZero.lstrowgroup){
			groupZero.lstrowgroup = [];
		}
		
		var currentTbodyID = undefined;
		var pastTbodyID = undefined;
		
		
		
		var theadRowStack = [];
		var stackRowHeader = false;
		
		function processCaption(elem){
			groupZero.elem = elem;
			groupZero.struct = obj[0];
			
			groupZero.uid = uidElem;
			uidElem++;
			groupZero.allParserObj.push(groupZero);

			$('details:eq(0)', elem).each(function(){
				groupZero.value = $('summary', this)[0];
				groupZero.desc = this;
			});
		}
		
		function processColgroup(elem){
			
			var colgroup = {
				elem: {},
				start: 0,
				end: 0,
				col: [],
				row: [],
				groupZero: groupZero
			}
			colgroup.elem = elem;
			
			$(elem).data().tblparser = colgroup;
			
			
			colgroup.uid = uidElem;
			uidElem++;
			groupZero.allParserObj.push(colgroup);
			

			if(colgroupFrame.length != 0){
				colgroup.start = colgroupFrame[colgroupFrame.length -1].end + 1;
			} else {
				colgroup.start = 1;
			}

			var colgroupspan = 0;
	
			// Add any exist structural col element
			$('col', elem).each(function(){
				var width = $(this).attr('span') != undefined ? parseInt($(this).attr('span')) : 1;
				
				var col = {
					elem: {},
					start: 0,
					end: 0
				}

				col.uid = uidElem;
				uidElem++;
				groupZero.allParserObj.push(col);
				
				col.start = colgroup.start + colgroupspan;
				col.end = colgroup.start + colgroupspan + width - 1; // Minus one because the default value was already calculated
				col.elem = this;
				
				col.groupZero = groupZero;
				
				$(this).data().tblparser = col;
				
				
				// var colCopy = jQuery.extend(true, {}, col);
				colgroup.col.push(col);
				columnFrame.push(col);
				
				colgroupspan += width;
			});
	
			// If no col element check for the span attribute
			if(colgroup.col.length == 0){
				var width = $(elem).attr('span') != undefined ? parseInt($(elem).attr('span')) : 1;
				colgroupspan += width;
				
				// Create virtual column 
				for(i= colgroup.start; i< (colgroup.start + colgroupspan); i++){
					var col = {
						start: 0,
						end: 0,
						groupZero: groupZero
					}
					col.uid = uidElem;
					uidElem++;
					groupZero.allParserObj.push(col);
					
					col.start = i;
					col.end = i;
					
					colgroup.col.push(col);
					columnFrame.push(col);
					
				}
			}
			
			// Set the parent colgroup for each column
			// $(colgroup.cols).each(function(){
			//	elem.parent = colgroup;
			// });
			
			
			colgroup.end = colgroup.start + colgroupspan - 1;
	
			colgroupFrame.push(colgroup);
		}
		
		function processRowgroupHeader(colgroupHeaderColEnd){ // thead row group processing
			
			// TODO: AVOID to go in that function more than once
			
			
			
			if(colgroupHeaderColEnd && colgroupHeaderColEnd > 0){
				// The first colgroup must match the colgroupHeaderColEnd
				if(colgroupFrame.length > 0 && (colgroupFrame[0].start != 1 || (colgroupFrame[0].end != colgroupHeaderColEnd && colgroupFrame[0].end != (colgroupHeaderColEnd + 1)))){
					errorTrigger('The first colgroup must be spanned either ' + colgroupHeaderColEnd + ' or ' + (colgroupHeaderColEnd + 1));
					
					// Destroy any existing colgroup, because they are not valid
					colgroupFrame = [];
				} 
				
				
				if(colgroupFrame.length == 0){
					// Create the colgroup Header
					var colgroup = {
						start: 1,
						end: colgroupHeaderColEnd,
						col: [],
						row: [],
						type: 1 // Set colgroup heading type
					}
					colgroup.uid = uidElem;
					uidElem++;
					
					colgroupFrame.push(colgroup);
					groupZero.allParserObj.push(colgroup);
					
					// Create the column
					// Create virtual column 
					for(i= 1; i<= colgroupHeaderColEnd; i++){
						var col = {
							start: 0,
							end: 0
						}
						col.uid = uidElem;
						uidElem++;
						groupZero.allParserObj.push(col);
						
						col.start = i;
						col.end = i;
						
						colgroup.col.push(col);
						columnFrame.push(col);
						
					}
				}
				
				// Associate the colgroup Header in the group Zero
				groupZero.colgrouphead = colgroupFrame[0];
				groupZero.colgrouphead.type = 1; // Set the first colgroup type :-)
				
			} else {
				colgroupHeaderColEnd = 0; // This mean that are no colgroup designated to be a colgroup header
			}
			
			// Associate any descriptive cell to his top header
			for(i=0; i<theadRowStack.length; i++){
				
				// var currentRow = theadRowStack[i];
				
				if(!theadRowStack[i].type){
					theadRowStack[i].type = 1;
				}
				
				for(j=0; j<theadRowStack[i].cell.length; j++){
					theadRowStack[i].cell[j].scope = "col";
										
					// var currentCell = theadRowStack[i].cell[j];
					
					// check if we have a layout cell at the top, left
					if(i==0 && j==0 && $(theadRowStack[i].cell[j].elem).html().length == 0){
						// That is a layout cell
						theadRowStack[i].cell[j].type = 6; // Layout cell
						if(!groupZero.layoutCell){
							groupZero.layoutCell = [];
						}
						groupZero.layoutCell.push(theadRowStack[i].cell[j]);
						
						j= theadRowStack[i].cell[j].width -1;
						if(j>=theadRowStack[i].cell.length){
							break;
						}

					}

					// Check the next row to see if they have a corresponding description cell					
					if(!theadRowStack[i].cell[j].descCell && 
						theadRowStack[i].cell[j].elem.nodeName.toLowerCase() == 'th' && 
						!theadRowStack[i].cell[j].type && 
						theadRowStack[i+1] && 
						theadRowStack[i+1].uid != theadRowStack[i].cell[j].uid && 
						!theadRowStack[i+1].cell[j].type &&
						theadRowStack[i+1].cell[j].elem.nodeName.toLowerCase() == 'td' && 
						theadRowStack[i+1].cell[j].width == theadRowStack[i].cell[j].width &&
						theadRowStack[i+1].cell[j].height == 1){
						
						theadRowStack[i+1].type = 5; // Mark the next row as a row description
						theadRowStack[i+1].cell[j].type = 5; // Mark the cell as a cell description
						theadRowStack[i+1].cell[j].row = theadRowStack[i+1];
						
						theadRowStack[i].cell[j].descCell = theadRowStack[i+1].cell[j];
						
						// Add the description cell to the complete listing
						if(!groupZero.desccell){
							groupZero.desccell = [];
						}
						groupZero.desccell.push(theadRowStack[i+1].cell[j]);
						
						j= theadRowStack[i].cell[j].width -1;
						if(j>=theadRowStack[i].cell.length){
							break;
						}
						
					}
					
					if(!theadRowStack[i].cell[j].type){
						theadRowStack[i].cell[j].type = 1;
					}
				
				}
			}
			
			// Clean the theadRowStack by removing any descriptive row
			var tmpStack = [];
			for(i=0; i<theadRowStack.length; i++){
				
				if(theadRowStack[i].type == 5) {
				
					// Check if all the cell in it are set to the type 5
					for(j=0; j<theadRowStack[i].cell.length; j++){
						if(theadRowStack[i].cell[j].type != 5 && theadRowStack[i].cell[j].height == 1){
							errorTrigger(' You have an invalid cell inside a row description', theadRowStack[i].cell[j].elem);
						}
						

						// Check the row before and modify their height value
						if(theadRowStack[i].cell[j].uid == theadRowStack[i - 1].cell[j].uid){
							theadRowStack[i].cell[j].height --;
							
						}
						
					}
					groupZero.nbDescriptionRow ++;
					
				
				} else {
					tmpStack.push(theadRowStack[i]);
				}
				
			}
			theadRowStack = tmpStack;
			
			
			groupZero.colgrp = []; // Array based on level as indexes for columns and group headers
			
			
			// Parser any cell in the colgroup header
			if(colgroupHeaderColEnd >0 && colgroupFrame.length == 1 || colgroupFrame.length == 0){
				// There are no colgroup element defined, All the cell will be considerated to be a data cell
				
				var colgroup = {
					start: (colgroupFrame.length == 0 ? 1 : colgroupFrame[0].end +1),
					end: tableCellWidth,
					col: [],
					row: [],
					type: 2 // Set colgroup data type
				}
				colgroup.uid = uidElem;
				uidElem++;
				groupZero.allParserObj.push(colgroup);
				
				if(colgroup.start > colgroup.end){
					errorTrigger('You need at least one data colgroup, review your table structure');
				}
				
				colgroupFrame.push(colgroup);
				
				// Create the column
				// Create virtual column 
				for(i= colgroup.start; i<= colgroup.end; i++){
					var col = {
						start: 0,
						end: 0,
						parent: colgroup //{}
					}
					col.uid = uidElem;
					uidElem++;
					groupZero.allParserObj.push(col);
					
					col.start = i;
					col.end = i;
					
					colgroup.col.push(col);
					columnFrame.push(col);
					
				}
			} else {
				// They exist colgroup element, 
				
	
				//
				// -----------------------------------------------------
				//
				// Build data column group based on the data column group and summary column group.
				//
				// Suggestion: In the future, may be allow the use of a HTML5 data or CSS Option to force a colgroup to be a data group instead of a summary group
				//
				
				
				
				var lstRealColgroup = []; // List of real colgroup

				var currColPos = (colgroupHeaderColEnd == 0 ? 1 : colgroupFrame[0].end +1); // Set the current column position
				
				var colgroup = {
					start: currColPos, 
					end: undefined,
					col: [],
					row: [],
					type: 2 // Set colgroup data type, that is the initial colgroup type
				}
				
				var currColgroupStructure = [];
				
				var colFrmId = 0;
				

				var bigTotalColgroupFound = false;
				
				$.each(colgroupFrame, function(){
					var curColgroupFrame = this;
				
					
					
					colFrmId++;
					
					if(bigTotalColgroupFound || groupZero.colgrp[0]){
						errorTrigger("The Lowest column group have been found, You may have an error in you column structure", curColgroupFrame);
						return;
					}
					
					if(curColgroupFrame.start < currColPos){
						if(colgroupHeaderColEnd != curColgroupFrame.end){
							errorTrigger("The initial colgroup should group all the header, there are no place for any data cell", curColgroupFrame);
						}
						// Skip this colgroup, this should happend only once and should represent the header colgroup
						return;
					}
					
					var groupLevel = undefined;
					
					// Get the colgroup level
					for(i =0; i<theadRowStack.length; i++){
						
						if((theadRowStack[i].cell[curColgroupFrame.end -1].colpos + theadRowStack[i].cell[curColgroupFrame.end -1].width- 1) == curColgroupFrame.end && (theadRowStack[i].cell[curColgroupFrame.end -1].colpos >= curColgroupFrame.start )){
							if(!groupLevel || groupLevel > (i+1)){
								groupLevel =  (i+1) // would equal at the current data cell level. The lowest row level win
							}
						}
					}
					
					
					
					if(!groupLevel){
						errorTrigger("Imposible to find the colgroup level, Check you colgroup definition or/and your table structure"); // That happend if we don't able to find an ending cell at the ending colgroup position.
					}
					
					
					// All the cells at higher level (Bellow the group level found) of witch one found, need to be inside the colgroup
					for(i =(groupLevel-1); i<theadRowStack.length; i++){
					
						// Test each cell in that group
						for(j = curColgroupFrame.start -1; j < curColgroupFrame.end; j++){
							
							if(theadRowStack[i].cell[j].colpos < 
								curColgroupFrame.start || 
								(theadRowStack[i].cell[j].colpos + theadRowStack[i].cell[j].width -1) > 
								curColgroupFrame.end){
								
								errorTrigger("Error in you header row group, there are cell that are crossing more than one colgroup under the level:" + groupLevel);
								return;
							}
						
						}
					}
					
					

					// Add virtual colgroup Based on the top header
					for(i = currColgroupStructure.length; i < (groupLevel-1); i++){
						
						// Use the top cell at level minus 1, that cell must be larger 
						if(theadRowStack[i].cell[curColgroupFrame.start-1].uid != theadRowStack[i].cell[curColgroupFrame.end-1].uid || 
							theadRowStack[i].cell[curColgroupFrame.start-1].colpos > curColgroupFrame.start || 
							theadRowStack[i].cell[curColgroupFrame.start-1].colpos + theadRowStack[i].cell[curColgroupFrame.start-1].width -1 < curColgroupFrame.end){
							//console.log(' i:' + i +
							//			' colpos: ' + theadRowStack[i].cell[curColgroupFrame.start-1].colpos +
							//			' start: ' + curColgroupFrame.start + 
							//			' width: ' + theadRowStack[i].cell[curColgroupFrame.start-1].width +
							//			' end: ' + curColgroupFrame.end);
							//console.log(theadRowStack[i].cell[curColgroupFrame.start-1]);
							//console.log(theadRowStack[i].cell[curColgroupFrame.end-1]);
							
							errorTrigger("The cell used to represent the data at level :" + (groupLevel -1) + " must encapsulate his group and be the same");
							return;
						}
					

						
						var cgrp = {
							level: (i+1)
						}
						
						cgrp.start = theadRowStack[i].cell[curColgroupFrame.start-1].colpos;
						cgrp.end = theadRowStack[i].cell[curColgroupFrame.start-1].colpos + theadRowStack[i].cell[curColgroupFrame.start-1].width -1;
						cgrp.header =[];
						cgrp.header.push(theadRowStack[i].cell[curColgroupFrame.start-1]);
						cgrp.repheader = theadRowStack[i].cell[curColgroupFrame.start-1]; // Header representative of this group
						theadRowStack[i].cell[curColgroupFrame.start-1].colgroup = cgrp;
						
						cgrp.type = 2; // A combinaison of Data group with a summary group always result in a data group
						
						
						cgrp.parentHeader = [];
						for(i=0; i<currColgroupStructure.length; i++){
							cgrp.parentHeader.push(currColgroupStructure[i]);
						}

						
						currColgroupStructure.push(cgrp);
						
						if(!groupZero.virtualColgroup){
							groupZero.virtualColgroup =  []
						}
						groupZero.virtualColgroup.push(cgrp);
						
						// Add the group into the level colgroup perspective
						if(!groupZero.colgrp[(i+1)]){
							groupZero.colgrp[(i+1)] = [];
						}
						groupZero.colgrp[(i+1)].push(cgrp);
						
					}
					
					
					// Set the header list for the current group
					curColgroupFrame.header = [];
					for(i = groupLevel- (groupLevel >=2? 2:1); i<theadRowStack.length; i++){
						
						for(j=curColgroupFrame.start; j<=curColgroupFrame.end; j++){
							
							if(theadRowStack[i].cell[j-1].rowpos == i+1){
								
								curColgroupFrame.header.push(theadRowStack[i].cell[j-1]);
								// Attach the current colgroup to this header
								theadRowStack[i].cell[j-1].colgroup = curColgroupFrame;
							}
							j += theadRowStack[i].cell[j-1].width -1;
						}
						
					}
					
					// Assign the parent header to the current header
					var parentHeader = [];
					for(i=0; i<currColgroupStructure.length-1; i++){
						parentHeader.push(currColgroupStructure[i]);
					}
					curColgroupFrame.parentHeader = parentHeader;
					
					// Check to set if this group are a data group
					if(currColgroupStructure.length < groupLevel){
						// This colgroup are a data colgroup
						// The current colgroup are a data colgroup
						
						
						if(!curColgroupFrame.type){ // TODO: Remove this condition when this function will be called only once
							curColgroupFrame.type = 2; // Set Data group type
							curColgroupFrame.level = groupLevel;
						}
						
						currColgroupStructure.push(curColgroupFrame);
						
						// Add the group into the level colgroup perspective
						if(!groupZero.colgrp[groupLevel]){
							groupZero.colgrp[groupLevel] = [];
						}
						groupZero.colgrp[groupLevel].push(curColgroupFrame);
						
					}
					
					
					
					//
					// Preparing the current stack for the next colgroup and set if the current are a summary group
					//
					
					// Check if we need to pop out the current header colgroup 
					var summaryAttached = false;
					for(i=currColgroupStructure.length-1; i >= 0 ; i--){
						
						if(currColgroupStructure[i].end <= curColgroupFrame.end){
							
							if(currColgroupStructure[i].level < groupLevel){
								curColgroupFrame.type = 3;
							}
							
							// Attach the Summary group to the colgroup poped if current colgroup are type 3
							if(curColgroupFrame.type == 3 && !summaryAttached){
								currColgroupStructure[currColgroupStructure.length-1].summary = curColgroupFrame;
								summaryAttached = true; // This are used to do not attach a summary of level 4 to an inapropriate level 1 for exampled
							}

							currColgroupStructure.pop();

						}
						
					
					}
					

					
					// Catch the second and the third possible grouping at level 1
					if(groupLevel == 1 && groupZero.colgrp[1] && groupZero.colgrp[1].length > 1){
						
						// Check if in the group at level 1 if we don't already have a summary colgroup
						for(i=0; i<groupZero.colgrp[1].length; i++){
							if(groupZero.colgrp[1][i].type == 3){
								// Congrat, we found the last possible colgroup, 
								curColgroupFrame.level = 0;
								if(!groupZero.colgrp[0]){
									groupZero.colgrp[0] = [];
								}
								groupZero.colgrp[0].push(curColgroupFrame);
								groupZero.colgrp[1].pop();
								
								bigTotalColgroupFound = true;
								break;
							}
						}
						
						curColgroupFrame.type = 3;
					}
					
					
					// Set the representative header "caption" element for a group at level 0
					if(curColgroupFrame.level== 1 && curColgroupFrame.type == 2){
						curColgroupFrame.repheader = 'caption';
					}
					

					// TODO: Build a collection with all the column based on the column position, each of them will have as a structure element "col" if available, otherwise nothing. Also they will have the headerset ref and header ref and if applicable, description.
					if(!groupZero.col){
						groupZero.col = [];
					}
					
					$.each(curColgroupFrame.col, function(){
						
						var column = this;
						
						groupZero.col.push(column);
						
						// TODO: column.parent = curColgroupFrame; // ?? Use the parent level header ??
						
						column.type = curColgroupFrame.type;
						column.level = curColgroupFrame.level;
						
						
						// TODO: Change the block of code above for All the header starting at the level 
						//       and the cells bellow but within the column scope
						//for(i=curColgroupFrame.level -1; i< theadRowStack.length; i++){
						//	if(i<0){i=0;}
							
						//}
						
						column.header = [];
						// Find the lowest header that would represent this column
						// for(j= (theadRowStack.length -1); j >= (curColgroupFrame.level -1); j-- ){
						for(j= (theadRowStack.length -1); j >= (groupLevel -1); j-- ){
							
							for(i =(curColgroupFrame.start -1); i< curColgroupFrame.end; i++){
							
								
								
			// column.start -------- column.end
								
								
						//		if(theadRowStack[j].cell[i].colpos <= column.start && 
						//			column.end <= theadRowStack[j].cell[i].colpos){
								
								
							
								if(theadRowStack[j].cell[i].colpos >= column.start && 
									theadRowStack[j].cell[i].colpos <= column.end || 
									
									theadRowStack[j].cell[i].colpos <= column.start &&
									(theadRowStack[j].cell[i].colpos + theadRowStack[j].cell[i].width -1) >= column.end ||
									
									(theadRowStack[j].cell[i].colpos + theadRowStack[j].cell[i].width -1) <= column.start && 
									(theadRowStack[j].cell[i].colpos + theadRowStack[j].cell[i].width -1) >= column.end ){
										
									if(column.header.length == 0 || 
										column.header.length > 0 && column.header[column.header.length - 1].uid != theadRowStack[j].cell[i].uid){
										// This are the header that would represent this column
										column.header.push(theadRowStack[j].cell[i]);
										theadRowStack[j].cell[i].level = curColgroupFrame.level;
									}
								}
							}
						}
					});
					
				});
				
				
			}
			
		}
		
		function processRow(elem){
		
			currentRowPos ++;
			var columnPos = 1;
			var lastCellType = "";
			var lastHeadingColPos = false;
			var rowPattern = "";
		
			var cells = $(elem).children();

			/*
			if(tableWidth != 0 && tableWidth != cells.length){
				errorTrigger('Each row must have the same width', this);
				currentRowPos --;
				return;
			}
			if(tableWidth != 0){
				// Let the first row to be the tablewidth
				tableWidth = cells.length;
			}
			*/
			
			var row = {
				colgroup: [], // == Build from colgroup object ==

				cell: [], // == Build from Cell Object ==

				elem: elem, // Row Structure jQuery element
				
				patern: "",
				rowpos: currentRowPos
			};
			
			$(elem).data().tblparser = row;
			
			row.uid = uidElem;
			uidElem++;
			groupZero.allParserObj.push(row);
			
			var colgroup = {
				cell: [],
				cgsummary: undefined, // ?? Not sure because this will be better in the data colgroup object ?? Summary Colgroup Associated
				type: false // 1 == header, 2 == data, 3 == summary, 4 == key, 5 == description
			}

			colgroup.uid = uidElem;
			uidElem++;
			groupZero.allParserObj.push(colgroup);
			
			
			var isRowHeadingFound = false;
			
			var fnPreProcessGroupHeaderCell = function(headerCell){
				if(!colgroup.type){
					colgroup.type = 1;
				}
				if(colgroup.type != 1){
					// Creation of a new colgroup
					row.colgroup.push(colgroup); // Add the previous colgroup
					
					// Create a new colgroup
					colgroup = {
						cell: [],
						type: 1
					};
					colgroup.uid = uidElem;
					uidElem++;
					groupZero.allParserObj.push(colgroup);
				}
				colgroup.cell.push(headerCell);
				
				lastHeadingColPos = headerCell.colpos + headerCell.width - 1;
				/*
				// Check for datacell at the left side of the heading, they can be key cell or description cell
				if(row.colgroup.length > 1 && row.colgroup[row.colgroup.length-1].type == 2){

					$.each(row.colgroup[row.colgroup.length-1].cell, function(){
						
					});
					
				}
				*/
				
			}
			
			var fnPreProcessGroupDataCell = function(dataCell){
				if(!colgroup.type){
					colgroup.type = 2;
				}
				
				// TODO: Check if we need to create a summary colgroup (Based on the top colgroup definition)
				
				if(colgroup.type != 2){
					// Creation of a new colgroup
					row.colgroup.push(colgroup); // Add the previous colgroup
					
					// Create a new colgroup
					colgroup = {
						cell: [],
						type: 2
					};
					colgroup.uid = uidElem;
					uidElem++;
					groupZero.allParserObj.push(colgroup);
				}

				colgroup.cell.push(dataCell);
			}
			
			
			var fnParseSpannedRowCell = function(){
				// Check for spanned row
				$.each(spannedRow, function(){
					// console.log('width:' + this.width +
					//			' colpos:' + this.colpos +
					//			' columnPos:' + columnPos +
					//			' spanHeight:' + this.spanHeight
					//			);
					//if(this.uid == 28){
						// console.log(this);
						// console.log('columnPos: ' + columnPos + ' currentRowPos: ' + currentRowPos);
					// }
						// OLD if
						//(this.width + this.colpos - 1) <= columnPos && 
						//columnPos >= this.colpos  && this.spanHeight > 0 && 
						//(this.height + this.rowpos - this.spanHeight == currentRowPos)){

					if(this.colpos == columnPos && this.spanHeight > 0 && (this.height + this.rowpos - this.spanHeight == currentRowPos)){

						
						
						if(this.elem.nodeName.toLowerCase() == 'th'){
							fnPreProcessGroupHeaderCell(this);
						}
						
						if(this.elem.nodeName.toLowerCase() == 'td'){
							fnPreProcessGroupDataCell(this);
						}
						
						this.spanHeight --;
						
						// Increment the column position
						columnPos += this.width;
						
						// Add the column
						for(i=1; i<=this.width; i++){
							row.cell.push(this);
						}

						
						
						lastCellType = this.elem.nodeName.toLowerCase();
						rowPattern = rowPattern + this.elem.nodeName.toLowerCase() + '(' + this.width + ',' + this.height + ')';
						
						//TODO: Change the next line of code
						this.parent = colgroup; // May be not good, I think that should rely on the master colgroup as is parent.
						
					}
				});
			};
			fnParseSpannedRowCell(); // This are for any row that have spanned row in is first cells
			
			// Read the row
			$.each(cells, function(){
				
				
				var width = $(this).attr('colspan') != undefined ? parseInt($(this).attr('colspan')) : 1,
					height = $(this).attr('rowspan') != undefined ? parseInt($(this).attr('rowspan')) : 1;
				
				switch (this.nodeName.toLowerCase()){
					case 'th': // cell header
						
						var headerCell = {
							rowpos: currentRowPos,
							colpos: columnPos,
							width: width,
							height: height,
							data: [],
							summary: [],
							elem: this,
						};
						
						$(this).data().tblparser = headerCell;
						headerCell.groupZero = groupZero;
						
						headerCell.uid = uidElem;
						uidElem++;
						groupZero.allParserObj.push(headerCell);
						
						fnPreProcessGroupHeaderCell(headerCell);

						headerCell.parent = colgroup;
						
						// Check if needs to be added to the spannedRow collection
						if(height > 1){
							headerCell.spanHeight = height - 1;
							spannedRow.push(headerCell);
						}
						
						// Increment the column position
						columnPos += headerCell.width;

						for(i=1; i<=width; i++){
							row.cell.push(headerCell);
						}
						
						// Check for any spanned cell
						fnParseSpannedRowCell(); 
						
						break;
					case 'td': // data cell
					
						var dataCell = {
							rowpos: currentRowPos,
							colpos: columnPos,
							width: width,
							height: height,
							elem: this
						};
						
						$(this).data().tblparser = dataCell;
						dataCell.groupZero = groupZero;
						
						dataCell.uid = uidElem;
						uidElem++;
						groupZero.allParserObj.push(dataCell);
						
						fnPreProcessGroupDataCell(dataCell);

						dataCell.parent = colgroup;

						// Check if needs to be added to the spannedRow collection
						if(height > 1){
							dataCell.spanHeight = height - 1;
							spannedRow.push(dataCell);
						}
						
						// Increment the column position
						columnPos += dataCell.width;
						
						for(i=1; i<=width; i++){
							row.cell.push(dataCell);
						}
						
						// Check for any spanned cell
						fnParseSpannedRowCell();
						break;
					default:
						errorTrigger('tr element need to only have th or td element as his child', this);
						break;
				}
				
				lastCellType = this.nodeName.toLowerCase();
				rowPattern = rowPattern + this.nodeName.toLowerCase() + '(' + width + ',' + height + ')';
				
				// columnPos ++;
			});
			
			// Check for any spanned cell
			fnParseSpannedRowCell();
			
			// Check if this the number of column for this row are equal to the other
			if(tableCellWidth == 0){
				// If not already set, we use the first row as a guideline
				tableCellWidth = row.cell.length;
			}
			if(tableCellWidth != row.cell.length){
				row.spannedRow = spannedRow;
				//console.log(row);
				errorTrigger('The row do not have a good width', row.elem);
			}
			
			// Check if we are into a thead rowgroup, if yes we stop here.
			if(stackRowHeader){
				theadRowStack.push(row);
				return;
			}
			
			
			// Add the last colgroup
			row.colgroup.push(colgroup);
			
			row.patern = rowPattern;
			

			
			
			
			//
			// Diggest the row
			//
			
			if(lastCellType == 'th'){
				// Digest the row header
				row.type = 1;
				
				//console.log('This is a header row');
				
				
				//
				// Check the validity of this header row
				//

				if(row.colgroup.length == 2 && currentRowPos == 1){
					// Check if the first is a data colgroup with only one cell 
					if(row.colgroup[0].type == 2 && row.colgroup[0].cell.length == 1){
						// Valid row header for the row group header
						
						// REQUIRED: That cell need to be empty
						if($(row.colgroup[0].cell[0].elem).html().length == 0){
							// console.log('This is a valide row for the rowgroup header with a layout cell');
							
							// We stack the row
							theadRowStack.push(row);
							
							return; // We do not go further
							
						} else {
							errorTrigger('ERROR: Seems to be an row in the row group header, but the layout cell are not empty');
						}
					} else {
						// Invalid row header
						errorTrigger('This is an INVALID row header and CAN NOT be Assigned to the rowgroup header');
					}
				} 
				
				if(row.colgroup.length == 1){
					
					
					if(row.colgroup[0].cell.length > 1){
						// this is a row associated to a header row group

						if(!headerRowGroupCompleted){
							// Good row
							// console.log('This is an valid row header for the header row group');
							
							// We stack the row
							theadRowStack.push(row);
							
							return; // We do not go further
							
							
						} else {
							// Bad row, remove the row or split the table
							errorTrigger('This is an INVALID row header for the header row group, split the table or remove the row');
						}
					} else {
						if(currentRowPos != 1){
							
							// Stack the row found for the rowgroup header
							rowgroupHeaderRowStack.push(row);
							
							// This will be processed on the first data row 
							
							// console.log('this header row will be considerated to be a rowgroup header row');
							headerRowGroupCompleted = true; // End of any header row group (thead)
							
							return;
						} else {
							errorTrigger('You can not set a header row for a rowgroup in the first table row');
						}
					}
				}
				
				if(row.colgroup.length > 1  && currentRowPos != 1){
					errorTrigger('This is an invalid row header because they can not mix data cell with header cell');
				}
				
				//
				// If Valid, process the row
				//
				
			} else {
				// Digest the data row
				row.type = 2;
				//console.log('this is a data row');
				
				
				
				// This mark the end of any row group header (thead)
				headerRowGroupCompleted = true;
				
				
				//
				// 
				// TODO: Process any row used to defined the rowgroup label
				//
				//
				
				if(rowgroupHeaderRowStack.length > 0 && currentRowHeader.length == 0){
					// TODO: check if the current stack of the current rowgroup need to have 0 datarow inside
					// Set the number of level for this group, also this group will be a data rowgroup
					

					// we start at the level 1 for the first heading
					
					// Calculate the starting row level by using preceding row level
					
					var iniRowGroupLevel = (groupZero.lstrowgroup.length > 1? (rowgroupHeaderRowStack.length - groupZero.lstrowgroup[groupZero.lstrowgroup -1].level): 1) -1;

				
					// Create virtual rowgroup
					for(i=iniRowGroupLevel; i<(rowgroupHeaderRowStack.length-1); i++){
						
						var grpRowHeader = {
							groupZero: groupZero,
							header: [],
							level: (i+1)
						};
						
						grpRowHeader.uid = uidElem;
						uidElem++;
						groupZero.allParserObj.push(grpRowHeader);	
						
						//rowgroupHeaderRowStack[i].row.cell[0]
						
						grpRowHeader.elem = rowgroupHeaderRowStack[i].row.cell[0].elem;
						grpRowHeader.struct = rowgroupHeaderRowStack[i].row.elem;
						
						rowgroupHeaderRowStack[i].row.cell[0].scope = "row";
						rowgroupHeaderRowStack[i].row.cell[0].level = (i+1);
						
						
						rowgroupHeaderRowStack[i].row.type = 1;
						
						currentRowHeader.push(grpRowHeader);
						
						// Include this virtual row group in the current one
					}
					
					// Set the level for the current rowgroup

					rowgroupHeaderRowStack[rowgroupHeaderRowStack.length-1].cell[0].scope = "row";
					rowgroupHeaderRowStack[rowgroupHeaderRowStack.length-1].cell[0].level = rowgroupHeaderRowStack.length;
					// rowgroupHeaderRowStack[rowgroupHeaderRowStack.length-1].cell[0].rowgroup = currentRowHeader;
					// rowgroupHeaderRowStack[rowgroupHeaderRowStack.length-1].rowgroup = currentRowHeader;
					rowgroupHeaderRowStack[rowgroupHeaderRowStack.length-1].type = 1;
					
					currentRowHeader.push(rowgroupHeaderRowStack[rowgroupHeaderRowStack.length-1].cell[0]);		

					pastTbodyID	= currentTbodyID;
				}
				
				
				if(currentTbodyID != pastTbodyID){
					row.type = 3;
					
					currentRowHeader = groupZero.row[groupZero.row.length-1].levelheader;
					
					//pastTbodyID	= currentTbodyID;
					/*					
					// Retreive the previous currentRowHeader
					for(i=groupZero.row.length-1; i>0; i++){
						if(groupZero.row[i].type == 2){
							// We got our summary level
						}
					}*/
				}
					// We have a summary row group
					
				row.levelheader = currentRowHeader;
				row.level = (currentRowHeader.length > 0?currentRowHeader[currentRowHeader.length -1].level:0);
				
				
				
				
				// Adjust if required, the lastHeadingColPos if colgroup are present, that would be the first colgroup
				if(colgroupFrame[0] && lastHeadingColPos && !(colgroupFrame[0].end == lastHeadingColPos)){
					if(colgroupFrame[0].end == (lastHeadingColPos + 1)){
						lastHeadingColPos ++;
					} else {
						// The colgroup are not representating the table structure
						errorTrigger('The first colgroup need to be used as an header colgroup', colgroupFrame[0].elem);
					}
				}
				row.lastHeadingColPos = lastHeadingColPos;
				
				
				// Build the initial colgroup structure
				// If an cell header exist in that row....
				
				
				if(lastHeadingColPos){
					// Process the heading colgroup associated to this row.
					
					
					var headingRowCell = [];
					
					
					var rowheader = undefined; // This are the most precise cell header for this row
					
					var colKeyCell = [];
					
					for(i=0; i<lastHeadingColPos; i++){
						
						
						// Check for description cell or key cell
						if(row.cell[i].elem.nodeName.toLowerCase() == "td"){
							
							if(!row.cell[i].type && row.cell[i-1] && !(row.cell[i-1].descCell) && row.cell[i-1].type == 1 && row.cell[i-1].height == row.cell[i].height){
								row.cell[i].type = 5;
								
								row.cell[i-1].descCell = row.cell[i];
								
								if(!row.desccell){row.desccell = [];}
								row.desccell.push(row.cell[i]);
								
								if(!groupZero.desccell){groupZero.desccell = [];}
								groupZero.desccell.push(row.cell[i]);
								
								row.cell[i].scope = "row"; // Specify the scope of this description cell
								

							}
							
							// Check if this cell can be an key cell associated to an cell heading
							if(!row.cell[i].type){
								colKeyCell.push(row.cell[i]);
							}
							
						}
						
						
						// Set for the most appropriate header that can represent this row
						if(row.cell[i].elem.nodeName.toLowerCase() == "th"){
							row.cell[i].type = 1; // Mark the cell to be an header cell
							row.cell[i].scope = "row";
							if(rowheader && rowheader.uid != row.cell[i].uid){
								if(rowheader.height > row.cell[i].height){
									
									// The current cell are a child of the previous rowheader 
									if(!rowheader.subheader){
										rowheader.subheader = [];
										rowheader.isgroup = true;
									}
									rowheader.subheader.push(row.cell[i]);
									
									// Change the current row header
									rowheader = row.cell[i];
									headingRowCell.push(row.cell[i]);

								} else {
									// This case are either paralel heading of growing header, this are an error.
									if(rowheader.height == row.cell[i].height){
										errorTrigger('You can not have paralel row heading, do a cell merge to fix this');
									} else {
										errorTrigger('For a data row, the heading hiearchy need to be the Generic to the specific');
									}
								}
							} 
							if(!rowheader){
								rowheader = row.cell[i];
								headingRowCell.push(row.cell[i]);
							}
							
							$.each(colKeyCell, function(){
								if(!(this.type) && !(row.cell[i].keycell) && this.height == row.cell[i].height){
									this.type = 4;
									row.cell[i].keycell = this;
									
									if(!row.keycell){row.keycell = [];}
									row.keycell.push(this);
									
									if(!groupZero.keycell){groupZero.keycell = [];}
									groupZero.keycell.push(this);
								}
							});
							
							
						}
					}
					
					// All the cell that have no "type" in the colKeyCell collection are problematic cells;
					$.each(colKeyCell, function(){
						if(!(this.type)){
							errorTrigger('You have a problematic cell, in your colgroup heading, that can not be understood by the parser');
							if(!row.errorcell){row.errorcell = [];}
							row.errorcell.push(this);
						}
					});
					row.headerset = headingRowCell;
					row.header = rowheader;
					
				} else {
					// There are only at least one colgroup,
					// Any colgroup tag defined but be equal or greater than 0.
					// if colgroup tag defined, they are all data colgroup. 
					lastHeadingColPos = 0;
				}
				
				
				
				
				
				
				
				
				
				
				//
				// Process the table row heading and colgroup if required
				//
				if(colgroupFrame.length != 0){
					
					// We check the first colgroup to know if a colgroup type has been defined
					if(!(colgroupFrame[0].type)){
						
						processRowgroupHeader(lastHeadingColPos);
						
						// Match the already defined colgroup tag with the table rowgroup heading section
						
						// If the table don't have a rowgroup heading section and nothing found for colgroup heading, let all the colgroup to be a datagroup
						// If the table don't have a row group heading section but have a colgroup heading, the first group must match the founded colgroup heading, the second colgroup will be a datagroup and the third will be a summary colgroup. It would be the same if only one row are found in the rowgroup heading section.
					
					}
					
				} else {
					processRowgroupHeader(lastHeadingColPos);
					
					// If the table have a table rowgroup heading section, let that to be transformed into colgroup
					
						// The number of colgroup level are directly related to the number of row heading included in the thead or tbody.
					
					// If the table don't have a heading section, let run the code, the colgroup would be created later
				}
				
				if(lastHeadingColPos != 0){
					lastHeadingColPos = colgroupFrame[0].end; // colgroupFrame must be defined here
				}
				









				//
				// Associate the data cell type with the colgroup if any, 
				
				// Process the data cell. There are a need to have at least one data cell per data row.
				if(!row.datacell){
					row.datacell = [];
				}
				for(i=lastHeadingColPos; i<row.cell.length; i++){
					
					// console.log("Process Cell Nb:" + i);
					// console.log("Colgroup Start ID:" + (lastHeadingColPos == 0 ? 0 : 1));
					var isDataCell = true;
					var IsDataColgroupType = true; // TODO: Remove this variable
					
					for(j=(lastHeadingColPos == 0 ? 0 : 1); j<colgroupFrame.length; j++){ // If colgroup, the first are always header colgroup
						if(colgroupFrame[j].start <= row.cell[i].colpos && row.cell[i].colpos <= colgroupFrame[j].end){
						
							if(row.type == 3 || colgroupFrame[j].type == 3){
								row.cell[i].type = 3; // Summary Cell
							} else {
								row.cell[i].type = 2;
							}
							
							if(row.type == 3 && colgroupFrame[j].type == 3){
								// TODO: Test if this cell are a layout cell
							}
							
							row.cell[i].collevel = colgroupFrame[j].level;
							row.datacell.push(row.cell[i]);
							
							// Here the column group type must be defined before
							// because the colgroup will define the type of cell
						/*
							// row.cell[i].colgroup = colgroupFrame[j];
							if(IsDataColgroupType || lastHeadingColPos == 0){
								if(!colgroupFrame[j].type){
									colgroupFrame[j].type = 2;
								}
								// May be just add the cell in the colgroup, after expand the cell own in the colgroup if needed.
								if(!row.cell[i].type){
									// if(!colgroupFrame[j].cell){
									//	colgroupFrame[j].cell = [];
									//}
									//colgroupFrame[j].cell.push(row.cell[i]);
								}
								
								
								row.cell[i].type = 2;
								row.datacell.push(row.cell[i]);
								if(colgroupFrame[j].type != 2){
									errorTrigger("Something weird with your colgroup versus your data row [NOT DATA COLGROUP]");
								}
								
								
								/*
								// if(!colgroupFrame[j].row[row.rowpos]){
								// 	colgroupFrame[j].row[row.rowpos] = [];
								// }
								// if(!colgroupFrame[j].row[row.rowpos][row.cell[i].colpos]){
								//	colgroupFrame[j].row[row.rowpos][row.cell[i].colpos] = {};
								// }
								// colgroupFrame[j].row[row.rowpos][row.cell[i].colpos] = row.cell[i];
								
								
							} else {
								if(!colgroupFrame[j].type){
									colgroupFrame[j].type = 3;
								}
								if(!row.cell[i].type){
									// May be just add the cell in the colgroup, after expand the cell own in the colgroup if needed.
									// if(!colgroupFrame[j].cell){
									// 	colgroupFrame[j].cell = [];
									// }
									// colgroupFrame[j].cell.push(row.cell[i]);
								}
								
								row.cell[i].type = 3;
								if(!row.summarycell){row.summarycell = [];}
								row.summarycell.push(row.cell[i]);
								if(colgroupFrame[j].type != 3){
									errorTrigger("Something weird with your colgroup versus your data row [NOT Summary COLGROUP]");
								}
								
								
								
								// if(!colgroupFrame[j].row[row.rowpos]){
								// 	colgroupFrame[j].row[row.rowpos] = [];
								// }
								// if(!colgroupFrame[j].row[row.rowpos][row.cell[i].colpos]){
								//	colgroupFrame[j].row[row.rowpos][row.cell[i].colpos] = {};
								// }
								// colgroupFrame[j].row[row.rowpos][row.cell[i].colpos] = row.cell[i];
								
							}*/
						}
						
						IsDataColgroupType = !IsDataColgroupType;
					}
					
					if(colgroupFrame.length == 0){
						// There are no colgroup definition, this cell are set to be a datacell
						row.cell[i].type = 2;
						row.datacell.push(row.cell[i]);
					}
				
				}
				
				var createGenericColgroup = (colgroupFrame.length == 0?true:false);
				
				
				// Associate the row with the cell and Colgroup/Col association
				for(i=0; i<row.cell.length; i++){
					row.cell[i].row = row;
					
					row.cell[i].rowlevel = row.level;
					row.cell[i].rowlevelheader = currentRowHeader;
					
					// Insert The cells in the appropriate column and colgroup
					if(createGenericColgroup){
						
						if(colgroupFrame.length == 0 ||( 
							(colgroupFrame[colgroupFrame.length -1]) &&  colgroupFrame[colgroupFrame.length -1].type != row.cell[i].type))
						{
							
							var skipColgroupCreation = false;
							
							if(row.cell[i].type == 4 || row.cell[i].type == 5 || row.cell[i].type == 1){
								
								if(colgroupFrame.length > 0){
									
									if(colgroupFrame[colgroupFrame.length -1].type == 1){
										// Do Not Create a new group
										skipColgroupCreation = true;
									}
								}
							}
						
							if(!skipColgroupCreation){
								// Create a new colgroup
						
								var colgroup = {
									start: row.cell[i].colpos,
									end: row.cell[i].colpos + row.cell[i].width -1,
									col: [],
									row: [],
									cell: []
								}
							
								colgroup.uid = uidElem;
								uidElem++;
							
								colgroupFrame.push(colgroup);
								
								if(row.cell[i].type == 4 || row.cell[i].type == 5 || row.cell[i].type == 1){
									colgroup.type = 1;
								} else {
									colgroup.type = 2;
								}
							}

						}
					}
					
					
					
					// Associate the row cell in the appropriate colgroup.....
					/*
					var currColgroupID = 0;
					
					if(createGenericColgroup && colgroupFrame[colgroupFrame.length - 1].end < (row.cell[i].colpos + row.cell[i].width - 1)){
						// currColgroupID = colgroupFrame.length - 1;
						colgroupFrame[colgroupFrame.length - 1].end = row.cell[i].colpos + row.cell[i].width -1;
					} 
					
					
					// Find the correct colgroup Frame
					for(j=0; j<colgroupFrame.length; j++){
						if(colgroupFrame[j].start <= row.cell[i].colpos && colgroupFrame[j].end >= (row.cell[i].colpos + row.cell[i].width - 1)){
							currColgroupID = j;
							break;
						}
					}

					
					row.cell[i].colgroup = colgroupFrame[currColgroupID];
				

					if(!(row.cell[i].spanHeight && row.cell[i].spanHeight +1 != row.cell[i].Height)){
						if(!(colgroupFrame[currColgroupID].cell.length > 0 &&
				colgroupFrame[currColgroupID].cell[colgroupFrame[currColgroupID].cell.length -1].uid == row.cell[i].uid)){
							colgroupFrame[currColgroupID].cell.push(row.cell[i]);
						}
					}
					// colgroupFrame[colgroupFrame.length - 1].row[row.cell[i].rowpos] = [];
					
					
					// for(j=row.cell[i].colpos; j< (row.cell[i].colpos + row.cell[i].width); j++){
					//	colgroupFrame[j].row[row.rowpos][row.cell[i].colpos] = row.cell[i];
					// }
					*/

				}
				
				
				
				
				// Add the cell in his appropriate column
				
				for(i=0; i<groupZero.col.length; i++){
					
					for(j=(groupZero.col[i].start -1); j<groupZero.col[i].end; j++){
						
						if(!groupZero.col[i].cell){
							groupZero.col[i].cell = [];
						}
						// Be sure to do not include twice the same cell for a column spanned in 2 or more column
						if(!(j>(groupZero.col[i].start -1) && groupZero.col[i].cell[groupZero.col[i].cell.length -1].uid ==  row.cell[j].uid)){
							groupZero.col[i].cell.push(row.cell[j]);
							row.cell[j].col = groupZero.col[i];
						}
					}
										
				}
				
				
				
				summaryRowGroupEligible = true;
			}
			
			currentRowLevel ++;

			
			// Add the row to the groupZero
			if(!groupZero.row){
				groupZero.row = [];
			}
			groupZero.row.push(row);
			
groupZero.colgroupFrame = colgroupFrame;







delete row.colgroup;
//delete row.lastHeadingColPos;
delete row.patern;
			//console.log(row);



		} // End processRow function
		
		
		
		$(obj).children().each(function(){
			switch (this.nodeName.toLowerCase()){
				case 'caption':groupZero
					processCaption(this);
					
					break;
				case 'colgroup':
					processColgroup(this);
					break;
					
				case 'thead':
					
					// The table should not have any row at this point
					if(theadRowStack.length != 0 || groupZero.row && groupZero.row.length > 0){
						errorTrigger('You can not define any row before the thead group', this);
					}
					
					$(this).data("tblparser", groupZero);
					
					stackRowHeader = true;
					
					// This is the rowgroup header, Colgroup type can not be defined here
					$(this).children().each(function(){
						if(this.nodeName.toLowerCase() != 'tr'){
							// ERROR
							errorTrigger('thead element need to only have tr element as his child', this);
						}
						
						processRow(this);
						
					});
					
					stackRowHeader = false;
					
					
					
					// Here it's not possible to  Diggest the thead and the colgroup because we need the first data row to be half processed before
					
					
					break;
				case 'tbody':
					
					/*
					*
					*
					*
					* First tbody = data
					* All tbody with header == data
					* Subsequent tbody without header == summary
					* 
					*
					
					
					* 
					* 
					* 
					*/
					// $(this).data("tblparser", currentRowHeader);
					
					// New row group
					
					$(this).children().each(function(){
						if(this.nodeName.toLowerCase() != 'tr'){
							// ERROR
							errorTrigger('tbody element need to only have tr element as his child', this);
							return;
						}
						
						processRow(this);
						
					});
					
					
					// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
					$.each(spannedRow, function(){
						if(this.spanHeight > 0){
							// That row are spanned in 2 different row group
							errorTrigger('You can not span cell in 2 different rowgroup', this);
						}
					});
					
					spannedRow = []; // Cleanup of any spanned row
					
					rowgroupHeaderRowStack = []; // Remove any rowgroup header found.
					
					currentRowHeader = [];
					
					// TODO: Check for sub-rowgroup defined inside the actual row group, like col1 have row spanned in 4 row constantly...
					
					currentTbodyID ++;
					
					break;
				case 'tfoot':
					
					// The rowpos are not incremented here because this is a summary rowgroup for the GroupZero
					
					// TODO: Question: Stack any row and processed them at the really end ???
					
					break;
				case 'tr':
					// This are suppose to be a simple table
					
					processRow(this);
					
					break;
				default:
					// There is a DOM Structure error
					errorTrigger('Use the appropriate table markup', this);
					break;
			}
		});
		
		
		groupZero.theadRowStack = theadRowStack;
		
		
		
		
		// Do a test, highlight summary data cell at level 0;
		/*
		for(i = 0; i< groupZero.row.length; i++){
			
			for(j = 0; j<groupZero.row[i].cell.length; j++){

				if(groupZero.row[i].cell[j].type == 3 && groupZero.row[i].cell[j].collevel == 0){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'black');
					$(groupZero.row[i].cell[j].elem).css('color', 'white');
					
				}

				
				if(groupZero.row[i].cell[j].type == 3 && groupZero.row[i].cell[j].collevel == 1){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'pink');
					
				}
				if(groupZero.row[i].cell[j].type == 2 && groupZero.row[i].cell[j].collevel == 1){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'red');
					$(groupZero.row[i].cell[j].elem).css('color', 'white');
				}

				
				if(groupZero.row[i].cell[j].type == 3 && groupZero.row[i].cell[j].collevel == 2){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'cyan');
					
				}
				if(groupZero.row[i].cell[j].type == 2 && groupZero.row[i].cell[j].collevel == 2){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'blue');
					$(groupZero.row[i].cell[j].elem).css('color', 'white');
					
					
				}
				
				if(groupZero.row[i].cell[j].type == 3 && groupZero.row[i].cell[j].collevel == 3){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'lightgreen');
					
					
				}
				if(groupZero.row[i].cell[j].type == 2 && groupZero.row[i].cell[j].collevel == 3){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'green');
					$(groupZero.row[i].cell[j].elem).css('color', 'white');
					
					
				}
				
				if(groupZero.row[i].cell[j].type == 3 && groupZero.row[i].cell[j].collevel == 4){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'lightgray');
					
					
				}
				if(groupZero.row[i].cell[j].type == 2 && groupZero.row[i].cell[j].collevel == 4){
					$(groupZero.row[i].cell[j].elem).css('background-color', 'gray');
					$(groupZero.row[i].cell[j].elem).css('color', 'white');
					
					
				}

				
				$(groupZero.row[i].cell[j].elem).hover(
					function() {
						
						// Save the current cell color
						$(this).data().zebraPrevBgColor = $(this).css('background-color');
						$(this).data().zebraPrevColor = $(this).css('color');
						
						// Default hover cell color
						$(this).css('background-color', 'white');
						$(this).css('color', 'black');
						
						var relRowPos = ($(this).data()['tblparser'].rowpos - groupZero.theadRowStack.length - 1 - groupZero.nbDescriptionRow);
						
						// Highligh the column
						for(m = 0; m<groupZero.row.length; m ++){
							if(m != relRowPos){
								
								// Save Previous Color
								$(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).data().zebraPrevBgColor = $(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).css('background-color');
								$(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).data().zebraPrevColor = $(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).css('color');
								
								// Set Highlight
								$(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).css('background-color', '#F0FAFA');
								$(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).css('color', 'black');
							}
						}
						
						// Highlight the row
						for(m=0; m<groupZero.row[relRowPos].cell.length; m++){
							if(m != $(this).data()['tblparser'].colpos - 1){
								// Save Previous Color
								$(groupZero.row[relRowPos].cell[m].elem).data().zebraPrevBgColor = $(groupZero.row[relRowPos].cell[m].elem).css('background-color');
								$(groupZero.row[relRowPos].cell[m].elem).data().zebraPrevColor = $(groupZero.row[relRowPos].cell[m].elem).css('color');
								
								// Set Highlight
								$(groupZero.row[relRowPos].cell[m].elem).css('background-color', '#F0FAFA');
								$(groupZero.row[relRowPos].cell[m].elem).css('color', 'black');
							}
						}
						
					}, 
					function(){

						// Column Restore previous color
						for(m = 0; m<groupZero.row.length; m ++){
							
							$(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).css('background-color', $(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).data().zebraPrevBgColor);
							$(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).css('color', $(groupZero.row[m].cell[$(this).data()['tblparser'].colpos - 1].elem).data().zebraPrevColor);
					
						}
						
						
						// Row Restore previous color
						var relRowPos = ($(this).data()['tblparser'].rowpos - groupZero.theadRowStack.length - 1 - groupZero.nbDescriptionRow);
						for(m=0; m<groupZero.row[relRowPos].cell.length; m++){
							$(groupZero.row[relRowPos].cell[m].elem).css('background-color', $(groupZero.row[relRowPos].cell[m].elem).data().zebraPrevBgColor);
							$(groupZero.row[relRowPos].cell[m].elem).css('color', $(groupZero.row[relRowPos].cell[m].elem).data().zebraPrevColor);
						}
					}
					
				);
				
			}
			
		}*/
		
		
		// Logging : GroupZero
		// console.log('GroupZero');
		// console.log(groupZero);
		// console.log('END');
		
		// Logging : Colgroup, col
		//console.log('Colgroup, Col');
		//console.log(colgroupFrame);
		//console.log(columnFrame);
		// console.log('END');	
		
		
	
			
			
			
			
			
			
			
			
			
			
			
			
		} // end of exec
	};
	
	
	window.pe = _pe;
	return _pe;
}(jQuery));
