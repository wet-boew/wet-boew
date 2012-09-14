/*!
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
*/
/**
* Table Parser - Table usability - Core plugin
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
	_pe.fn.parsertable = {
		type : 'plugin',
		onParserError: undefined,
		_exec : function (elm) {
			var obj = elm,
			// Event handler for issue error found durring the table parsing process
				errorTrigger = function (numerr, obj) {
					// FYI - 31 Type of Error can be raised
					if (typeof _pe.fn.parsertable.onParserError === "function") {
						_pe.fn.parsertable.onParserError(numerr, obj);
					}
					// $(obj).trigger('parser.table.error', err, obj);
					// console.log("Trigger ERROR: " + err); // Debug Mode
				},
				groupZero = {
					allParserObj: [],
					nbDescriptionRow: 0 // To remove ??
				},
				colgroupFrame = [],
				columnFrame = [],
				uidElem = 0,
				currentRowLevel = 0,
				currentRowPos = 0,
				spannedRow = [],
				tableCellWidth = 0,
				headerRowGroupCompleted = false,
				summaryRowGroupEligible = false,
				currentRowHeader = [],
				currentTbodyID,
				theadRowStack = [],
				stackRowHeader = false,
				// Row Group Variable
				rowgroupHeaderRowStack = [],
				currentRowGroup,
				currentRowGroupElement,
				lstRowGroup = [],
				rowgroupheadercalled = false,
				hasTfoot = $(obj).has('tfoot'),
				lastHeadingSummaryColPos,
				previousDataHeadingColPos;
			// elm need to be a table
			if ($(elm).get(0).nodeName.toLowerCase() !== 'table') {
				errorTrigger(1, elm);
				return;
			}
			// Check if this table was already parsed, if yes we exit by throwing an error
			if ($(obj).tblparser) {
				errorTrigger(2, obj);
				return;
			}
			/*
			+-----------------------------------------------------+
			| FYI - Here the value and signification of each type |
			+-------+---------------+-----------------------------+
			| Type  | Signification | Technicality
			+-------+---------------+------------------------------
			|	1	| Header		| TH element only
			+-------+---------------+------------------------------
			|	2	| Data			| TD element only
			+-------+---------------+------------------------------
			|	3	| Summary		| TD element and TD of type 2 exist
			+-------+---------------+------------------------------
			|	4	| Key			| TD element applicable to right TH, Only available on row
			+-------+---------------+------------------------------
			|	5	| Description   | TD element applicable to left or top TH
			+-------+---------------+------------------------------
			|	6	| Layout		| Can be only: Top Left cell or/and Summmary group intersection
			+-------+---------------+------------------------------
			|	7	| Header Group  | TH element only, visual heading grouping, this type are an extension of the type 1
			+-------+---------------+------------------------------
			*/
			$(obj).data().tblparser = groupZero;
			groupZero.colgroup = colgroupFrame;
			if (!groupZero.rowgroup) {
				groupZero.rowgroup = [];
			}
			if (!groupZero.lstrowgroup) {
				// groupZero.lstrowgroup = [];
				groupZero.lstrowgroup = lstRowGroup;
			}
			groupZero.elem = obj;
			groupZero.uid = uidElem;
			uidElem += 1; // Set the uid for the groupZero
			groupZero.colcaption = {}; // Group Cell Header at level 0, scope=col
			groupZero.colcaption.uid = uidElem;
			uidElem += 1;
			groupZero.colcaption.elem = undefined;
			groupZero.colcaption.type = 7;
			groupZero.colcaption.dataset = [];
			groupZero.colcaption.summaryset = [];
			groupZero.rowcaption = {}; // Group Cell Header at level 0, scope=row
			groupZero.rowcaption.uid = uidElem;
			uidElem += 1;
			groupZero.rowcaption.elem = undefined;
			groupZero.rowcaption.type = 7;
			groupZero.rowcaption.dataset = [];
			groupZero.rowcaption.summaryset = [];
			groupZero.col = [];
			function processCaption(elem) {
				groupZero.colcaption.elem = elem;
				groupZero.rowcaption.elem = elem;
				var groupheadercell = {
						colcaption: groupZero.colcaption,
						rowcaption: groupZero.rowcaption,
						elem: elem
					},
					caption,
					captionFound,
					description = [];

				// Extract the caption vs the description
				// There are 2 techniques,
				//	Recommanded is encapsulate the caption with "strong"
				//	Use Details/Summary element
				//	Use a simple paragraph
				if ($(elem).children().length > 0) {
					// Use the contents function to retreive the caption
					$(elem).contents().filter(function () {
						if (!caption && this.nodeType === 3) { // Text Node
							// Doesn't matter what it is, but this will be considerated as the caption
							// if is not empty
							caption = $(this).text().replace(/^\s+|\s+$/g, "");
							if (caption.length !== 0) {
								caption = this;
								captionFound = true;
								return;
							}
							caption = false;
						} else if (!caption && this.nodeType === 1) {
							// Doesn't matter what it is, the first children element will be considerated as the caption
							caption = this;
							return;
						}
					});
					// Use the children function to retreive the description
					$(elem).children().filter(function () {
						// if the caption are an element, we should ignore the first one
						if (captionFound) {
							description.push(this);
						} else {
							captionFound = true;
						}
					});
				} else {
					caption = elem;
				}
				// console.log(caption);
				// Move the descriptin in a wrapper if there is more than one element
				if (description.length > 1) {
					groupheadercell.description = $(description);
				} else if (description.length === 1) {
					groupheadercell.description = description[0];
				}
				if (caption) {
					groupheadercell.caption = caption;
				}
				groupheadercell.groupZero = groupZero;
				groupheadercell.type = 1;
				groupZero.groupheadercell = groupheadercell;
				$(elem).data().tblparser = groupheadercell;
			}
			function processColgroup(elem, nbvirtualcol) {
				// if elem is undefined, this mean that is an big empty colgroup
				// nbvirtualcol if defined is used to create the virtual colgroup
				var colgroup = {
						elem: {},
						start: 0,
						end: 0,
						col: [],
						groupZero: groupZero
					},
					colgroupspan = 0,
					width,
					i,
					_ilen,
					col;
				colgroup.elem = elem;
				if (elem) {
					$(elem).data().tblparser = colgroup;
				}
				colgroup.uid = uidElem;
				uidElem += 1;
				groupZero.allParserObj.push(colgroup);
				if (colgroupFrame.length !== 0) {
					colgroup.start = colgroupFrame[colgroupFrame.length - 1].end + 1;
				} else {
					colgroup.start = 1;
				}

				// Add any exist structural col element
				if (elem) {
					$('col', elem).each(function () {
						var $this = $(this),
							width = $this.attr('span') !== undefined ? parseInt($this.attr('span'), 10) : 1,
							col = {
								elem: {},
								start: 0,
								end: 0,
								groupZero: groupZero
							};
						col.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(col);
						col.start = colgroup.start + colgroupspan;
						col.end = colgroup.start + colgroupspan + width - 1; // Minus one because the default value was already calculated
						col.elem = this;
						col.groupZero = groupZero;
						$this.data().tblparser = col;
						colgroup.col.push(col);
						columnFrame.push(col);
						colgroupspan += width;
					});
				}
				// If no col element check for the span attribute
				if (colgroup.col.length === 0) {
					if (elem) {
						width = $(elem).attr('span') !== undefined ? parseInt($(elem).attr('span'), 10) : 1;
					} else if (typeof nbvirtualcol === "number") {
						width = nbvirtualcol;
					} else {
						errorTrigger(31);
						return;
					}
					colgroupspan += width;
					// Create virtual column 
					for (i = colgroup.start, _ilen = (colgroup.start + colgroupspan); i < _ilen; i += 1) {
						col = {
							start: 0,
							end: 0,
							groupZero: groupZero,
							elem: undefined
						};
						col.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(col);
						col.start = i;
						col.end = i;
						colgroup.col.push(col);
						columnFrame.push(col);
					}
				}
				colgroup.end = colgroup.start + colgroupspan - 1;
				colgroupFrame.push(colgroup);
			}
			function processRowgroupHeader(colgroupHeaderColEnd) { // thead row group processing
				var i, _ilen,
					j, _jlen,
					m, _mlen,
					tmpStack = [],
					tmpStackCurr,
					tmpStackCell,
					dataColgroup,
					dataColumns,
					colgroup,
					col,
					hcolgroup,
					lstRealColgroup,
					currColPos,
					currColgroupStructure,
					colFrmId,
					bigTotalColgroupFound,
					theadRSNext,
					theadRSNextCell,
					cell,
					gzCol,
					theadRS;

				if (groupZero.colgrouphead || rowgroupheadercalled) {
					return; // Prevent multiple call
				}
				rowgroupheadercalled = true;
				if (colgroupHeaderColEnd && colgroupHeaderColEnd > 0) {
					// The first colgroup must match the colgroupHeaderColEnd
					if (colgroupFrame.length > 0 && (colgroupFrame[0].start !== 1 || (colgroupFrame[0].end !== colgroupHeaderColEnd && colgroupFrame[0].end !== (colgroupHeaderColEnd + 1)))) {
						errorTrigger(3);

						// Destroy any existing colgroup, because they are not valid
						colgroupFrame = [];
					}
				} else {
					colgroupHeaderColEnd = 0; // This mean that are no colgroup designated to be a colgroup header
				}
				// console.log('Call ProcessRowGroupHeader');

				// Associate any descriptive cell to his top header
				for (i = 0, _ilen = theadRowStack.length; i < _ilen; i += 1) {
					theadRS = theadRowStack[i];
					if (!theadRS.type) {
						theadRS.type = 1;
					}

					for (j = 0, _jlen = theadRS.cell.length; j < _jlen; j += 1) {
						cell = theadRowStack[i].cell[j];
						cell.scope = "col";

						// check if we have a layout cell at the top, left
						if (i === 0 && j === 0 && $(cell.elem).html().length === 0) {
							// That is a layout cell
							cell.type = 6; // Layout cell
							if (!groupZero.layoutCell) {
								groupZero.layoutCell = [];
							}
							groupZero.layoutCell.push(cell);

							j = cell.width - 1;
							if (j >= _jlen) {
								break;
							}
						}

						// Check the next row to see if they have a corresponding description cell
						theadRSNext = theadRowStack[i + 1];
						theadRSNextCell = (theadRSNext ? theadRSNext.cell[j] : "");
						if (!cell.descCell &&
								cell.elem.nodeName.toLowerCase() === 'th' &&
								!cell.type &&
								theadRSNext &&
								theadRSNext.uid !== cell.uid &&
								theadRSNextCell &&
								!theadRSNextCell.type &&
								theadRSNextCell.elem.nodeName.toLowerCase() === 'td' &&
								theadRSNextCell.width === cell.width &&
								theadRSNextCell.height === 1) {

							theadRSNext.type = 5; // Mark the next row as a row description
							theadRSNextCell.type = 5; // Mark the cell as a cell description
							theadRSNextCell.row = theadRS;
							cell.descCell = theadRSNextCell;

							// Add the description cell to the complete listing
							if (!groupZero.desccell) {
								groupZero.desccell = [];
							}
							groupZero.desccell.push(theadRSNextCell);

							j = cell.width - 1;
							if (j >= _jlen) {
								break;
							}
						}

						if (!cell.type) {
							cell.type = 1;
						}
					}
				}

				// Clean the theadRowStack by removing any descriptive row
				for (i = 0, _ilen = theadRowStack.length; i < _ilen; i += 1) {
					theadRS = theadRowStack[i];
					if (theadRS.type === 5) {
						// Check if all the cell in it are set to the type 5
						for (j = 0, _jlen = theadRS.cell.length; j < _jlen; j += 1) {
							cell = theadRS.cell[j];
							if (cell.type !== 5 && cell.type !== 6 && cell.height === 1) {
								errorTrigger(4, cell.elem);
							}

							// Check the row before and modify their height value
							if (cell.uid === theadRowStack[i - 1].cell[j].uid) {
								cell.height -= 1;
							}
						}
						groupZero.nbDescriptionRow += 1;
					} else {
						tmpStack.push(theadRS);
					}
				}
				groupZero.colgrp = []; // Array based on level as indexes for columns and group headers

				// Parser any cell in the colgroup header
				if (colgroupHeaderColEnd > 0 && (colgroupFrame.length === 1 || colgroupFrame.length === 0)) {
					// There are no colgroup element defined, All the cell will be considerated to be a data cell
					// Data Colgroup
					dataColgroup = {};
					dataColumns = [];
					colgroup = {
						start: (colgroupHeaderColEnd + 1),
						end: tableCellWidth,
						col: [],
						groupZero: groupZero,
						elem: undefined,
						type: 2 // Set colgroup data type
					};
					colgroup.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push(colgroup);

					if (colgroup.start > colgroup.end) {
						errorTrigger(5);
					}

					dataColgroup = colgroup;

					// Create the column
					// Create virtual column 
					for (i = colgroup.start, _ilen = colgroup.end; i <= _ilen; i += 1) {
						col = {
							start: 0,
							end: 0,
							groupZero: groupZero,
							elem: undefined
						};
						col.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(col);

						if (!groupZero.col) {
							groupZero.col = [];
						}
						dataColumns.push(col);

						col.start = i;
						col.end = i;
						col.groupstruct = colgroup;

						colgroup.col.push(col);
						columnFrame.push(col); // Check to remove "columnFrame"
					}

					// Default Level => 1
					groupZero.colgrp[1] = [];
					groupZero.colgrp[1].push(groupZero.colcaption);

					// Header Colgroup
					if (colgroupHeaderColEnd > 0) {
						hcolgroup = {
							start: 1,
							elem: undefined,
							end: colgroupHeaderColEnd,
							col: [],
							groupZero: groupZero,
							type: 1 // Set colgroup data type
						};
						hcolgroup.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(hcolgroup);

						colgroupFrame.push(hcolgroup);
						colgroupFrame.push(dataColgroup);
						groupZero.colcaption.dataset = dataColgroup.col;

						// Create the column
						// Create virtual column 
						for (i = hcolgroup.start, _ilen = hcolgroup.end; i <= _ilen; i += 1) {
							col = {
								start: 0,
								end: 0,
								groupZero: groupZero,
								elem: undefined
							};
							col.uid = uidElem;
							uidElem += 1;
							groupZero.allParserObj.push(col);

							if (!groupZero.col) {
								groupZero.col = [];
							}
							groupZero.col.push(col);

							col.start = i;
							col.end = i;
							col.groupstruct = hcolgroup;

							hcolgroup.col.push(col);
							columnFrame.push(col);
						}

						for (i = 0, _ilen = dataColumns.length; i < _ilen; i += 1) {
							groupZero.col.push(dataColumns[i]);
						}
					}

					if (colgroupFrame.length === 0) {
						colgroupFrame.push(dataColgroup);
						groupZero.colcaption.dataset = dataColgroup.col;
					}

					// Set the header for each column
					for (i = 0, _ilen = groupZero.col.length; i < _ilen; i += 1) {
						gzCol = groupZero.col[i];
						gzCol.header = [];
						for (j = 0, _jlen = tmpStack.length; j < _jlen; j += 1) {
							for (m = gzCol.start, _mlen = gzCol.end; m <= _mlen; m += 1) {
								if ((j === 0 || (j > 0 && tmpStack[j].cell[m - 1].uid !== tmpStack[j - 1].cell[m - 1].uid)) && tmpStack[j].cell[m - 1].type === 1) {
									gzCol.header.push(tmpStack[j].cell[m - 1]);
								}
							}
						}
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
					// -----------------------------------------------------
					//
					lstRealColgroup = []; // List of real colgroup
					currColPos = (colgroupHeaderColEnd === 0 ? 1 : colgroupFrame[0].end + 1); // Set the current column position
					colgroup = {
						start: currColPos,
						end: undefined,
						col: [],
						row: [],
						type: 2 // Set colgroup data type, that is the initial colgroup type
					};
					currColgroupStructure = [];
					colFrmId = 0;
					bigTotalColgroupFound = false;

					$.each(colgroupFrame, function () {
						var curColgroupFrame = this,
							groupLevel,
							cgrp,
							parentHeader,
							summaryAttached;

						colFrmId += 1;

						if (bigTotalColgroupFound || groupZero.colgrp[0]) {
							errorTrigger(6, curColgroupFrame);
							return;
						}

						$.each(curColgroupFrame.col, function () {
							var column = this;
							if (!groupZero.col) {
								groupZero.col = [];
							}
							groupZero.col.push(column);

							column.type = 1;
							column.groupstruct = curColgroupFrame;
						});

						if (curColgroupFrame.start < currColPos) {
							if (colgroupHeaderColEnd !== curColgroupFrame.end) {
								errorTrigger(7, curColgroupFrame);
							}

							// Skip this colgroup, this should happened only once and should represent the header colgroup

							// Assign the headers for this group
							for (i = 0, _ilen = curColgroupFrame.col.length; i < _ilen; i += 1) {
								gzCol = curColgroupFrame.col[i];
								gzCol.header = [];
								for (j = 0, _jlen = tmpStack.length; j < _jlen; j += 1) {
									for (m = gzCol.start, _mlen = gzCol.end; m <= _mlen; m += 1) {
										if ((j === 0 || (j > 0 && tmpStack[j].cell[m - 1].uid !== tmpStack[j - 1].cell[m - 1].uid)) && tmpStack[j].cell[m - 1].type === 1) {
											gzCol.header.push(tmpStack[j].cell[m - 1]);
										}
									}
								}
							}

							return;
						}

						groupLevel = undefined;

						// Get the colgroup level
						for (i = 0, _ilen = tmpStack.length; i < _ilen; i += 1) {
							tmpStackCell = tmpStack[i].cell[curColgroupFrame.end - 1];
							if ((tmpStackCell.colpos + tmpStackCell.width - 1) === curColgroupFrame.end && (tmpStackCell.colpos >= curColgroupFrame.start)) {
								if (!groupLevel || groupLevel > (i + 1)) {
									groupLevel = (i + 1); // would equal at the current data cell level. The lowest row level win
								}
							}
						}

						if (!groupLevel) {
							groupLevel = 1; // Default colgroup data Level, this happen when there is no column header, (same as no thead)
							// errorTrigger(8, "Impossible to find the colgroup level, Check you colgroup definition or/and your table structure"); // That happened if we don't able to find an ending cell at the ending colgroup position.
						}

						// All the cells at higher level (Bellow the group level found) of witch one found, need to be inside the colgroup
						for (i = (groupLevel - 1), _ilen = tmpStack.length; i < _ilen; i += 1) {
							tmpStackCurr = tmpStack[i];
							// Test each cell in that group
							for (j = curColgroupFrame.start - 1, _jlen = curColgroupFrame.end; j < _jlen; j += 1) {
								tmpStackCell = tmpStackCurr.cell[j];
								if (tmpStackCell.colpos < curColgroupFrame.start || (tmpStackCell.colpos + tmpStackCell.width - 1) > curColgroupFrame.end) {
									errorTrigger(9);
									return;
								}
							}
						}


						// Add virtual colgroup Based on the top header
						for (i = currColgroupStructure.length, _ilen = (groupLevel - 1); i < _ilen; i += 1) {
							tmpStackCell = tmpStack[i].cell[curColgroupFrame.start - 1];
							// Use the top cell at level minus 1, that cell must be larger 
							if (tmpStackCell.uid !== tmpStack[i].cell[curColgroupFrame.end - 1].uid ||
									tmpStackCell.colpos > curColgroupFrame.start ||
									tmpStackCell.colpos + tmpStackCell.width - 1 < curColgroupFrame.end) {
								errorTrigger(10);
								return;
							}

							// Convert the header in a group header cell
							cgrp = tmpStackCell;
							cgrp.level = (i + 1);

							cgrp.start = cgrp.colpos;
							cgrp.end = cgrp.colpos + cgrp.width - 1;

							cgrp.type = 7; // Group Header Cell

							currColgroupStructure.push(cgrp);

							if (!groupZero.virtualColgroup) {
								groupZero.virtualColgroup = [];
							}
							groupZero.virtualColgroup.push(cgrp);

							// Add the group into the level colgroup perspective
							if (!groupZero.colgrp[(i + 1)]) {
								groupZero.colgrp[(i + 1)] = [];
							}
							groupZero.colgrp[(i + 1)].push(cgrp);
						}

						// Set the header list for the current group
						curColgroupFrame.header = [];
						for (i = groupLevel - (groupLevel >= 2 ? 2 : 1); i < tmpStack.length; i += 1) {
							for (j = curColgroupFrame.start; j <= curColgroupFrame.end; j += 1) {
								if (tmpStack[i].cell[j - 1].rowpos === i + 1) {
									curColgroupFrame.header.push(tmpStack[i].cell[j - 1]);
									// Attach the current colgroup to this header
									tmpStack[i].cell[j - 1].colgroup = curColgroupFrame;
								}
								j += tmpStack[i].cell[j - 1].width - 1;
							}
						}

						// Assign the parent header to the current header
						parentHeader = [];
						for (i = 0; i < currColgroupStructure.length - 1; i += 1) {
							parentHeader.push(currColgroupStructure[i]);
						}
						curColgroupFrame.parentHeader = parentHeader;

						// Check to set if this group are a data group
						if (currColgroupStructure.length < groupLevel) {
							// This colgroup are a data colgroup
							// The current colgroup are a data colgroup
							if (!curColgroupFrame.type) {
								curColgroupFrame.type = 2; // Set Data group type
								curColgroupFrame.level = groupLevel;
							}

							currColgroupStructure.push(curColgroupFrame);

							// Add the group into the level colgroup perspective
							if (!groupZero.colgrp[groupLevel]) {
								groupZero.colgrp[groupLevel] = [];
							}
							groupZero.colgrp[groupLevel].push(curColgroupFrame);
						}

						//
						// Preparing the current stack for the next colgroup and set if the current are a summary group
						//

						// Check if we need to pop out the current header colgroup 
						summaryAttached = false;
						for (i = currColgroupStructure.length - 1; i >= 0; i -= 1) {

							if (currColgroupStructure[i].end <= curColgroupFrame.end) {

								if (currColgroupStructure[i].level < groupLevel && theadRowStack.length > 0) {
									curColgroupFrame.type = 3;
								}

								// Attach the Summary group to the colgroup poped if current colgroup are type 3
								if (curColgroupFrame.type === 3 && !summaryAttached) {
									currColgroupStructure[currColgroupStructure.length - 1].summary = curColgroupFrame;
									summaryAttached = true; // This are used to do not attach a summary of level 4 to an inapropriate level 1 for exampled
								}

								currColgroupStructure.pop();
							}
						}

						// Catch the second and the third possible grouping at level 1
						if (groupLevel === 1 && groupZero.colgrp[1] && groupZero.colgrp[1].length > 1 && theadRowStack.length > 0) {

							// Check if in the group at level 1 if we don't already have a summary colgroup
							for (i = 0; i < groupZero.colgrp[1].length; i += 1) {
								if (groupZero.colgrp[1][i].type === 3) {
									// Congrat, we found the last possible colgroup, 
									curColgroupFrame.level = 0;
									if (!groupZero.colgrp[0]) {
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
						if (curColgroupFrame.level === 1 && curColgroupFrame.type === 2) {
							curColgroupFrame.repheader = 'caption';
						}

						if (!groupZero.col) {
							groupZero.col = [];
						}

						$.each(curColgroupFrame.col, function () {
							var column = this;

							column.type = curColgroupFrame.type;
							column.level = curColgroupFrame.level;
							column.groupstruct = curColgroupFrame;

							column.header = [];
							// Find the lowest header that would represent this column
							for (j = (groupLevel - 1); j < tmpStack.length; j += 1) {
								for (i = (curColgroupFrame.start - 1); i < curColgroupFrame.end; i += 1) {
									if ((tmpStack[j].cell[i].colpos >= column.start &&
											tmpStack[j].cell[i].colpos <= column.end) ||
											(tmpStack[j].cell[i].colpos <= column.start &&
											(tmpStack[j].cell[i].colpos + tmpStack[j].cell[i].width - 1) >= column.end) ||
											((tmpStack[j].cell[i].colpos + tmpStack[j].cell[i].width - 1) <= column.start &&
											(tmpStack[j].cell[i].colpos + tmpStack[j].cell[i].width - 1) >= column.end)) {

										if (column.header.length === 0 || (column.header.length > 0 && column.header[column.header.length - 1].uid !== tmpStack[j].cell[i].uid)) {
											// This are the header that would represent this column
											column.header.push(tmpStack[j].cell[i]);
											tmpStack[j].cell[i].level = curColgroupFrame.level;
										}
									}
								}
							}
						});
					});

					if (!groupZero.virtualColgroup) {
						groupZero.virtualColgroup = [];
					}
					// Set the Virtual Group Header Cell, if any
					$.each(groupZero.virtualColgroup, function () {
						var vGroupHeaderCell = this;

						// Set the headerLevel at the appropriate column
						for (i = (vGroupHeaderCell.start - 1); i < vGroupHeaderCell.end; i += 1) {
							if (!groupZero.col[i].headerLevel) {
								groupZero.col[i].headerLevel = [];
							}
							groupZero.col[i].headerLevel.push(vGroupHeaderCell);
						}
					});
				}

				// Associate the colgroup Header in the group Zero
				if (colgroupFrame.length > 0 && colgroupHeaderColEnd > 0) {
					groupZero.colgrouphead = colgroupFrame[0];
					groupZero.colgrouphead.type = 1; // Set the first colgroup type :-)
				}
			}

			function finalizeRowGroup() {

				// Check if the current rowgroup has been go in the rowgroup setup, if not we do
				if (!currentRowGroup.type || !currentRowGroup.level) {
					// Colgroup Setup,
					rowgroupSetup();
				}


				// console.log('Row Group Finalization');

				// If the current row group are a data group, check each row if we can found a pattern about to increment the data level for this row group
				// Update, if needed, each row and cell to take in consideration the new row group level
				// Add the row group in the groupZero Collection
				lstRowGroup.push(currentRowGroup);
				currentRowGroup = {};
			}

			function initiateRowGroup() {
				// console.log('Row Group Initialization');
				// Finalisation of any exisiting row group
				if (currentRowGroup && currentRowGroup.type) {
					finalizeRowGroup();
				}

				// Initialisation of the a new row group 
				currentRowGroup = {};
				currentRowGroup.elem = currentRowGroupElement;
				currentRowGroup.row = [];
				currentRowGroup.headerlevel = [];
				currentRowGroup.groupZero = groupZero;
				currentRowGroup.uid = uidElem;
				uidElem += 1;
				//currentRowGroup.type = 2 // (1 if elem is a thead or if detected in the table, 2 default, 3 if summary data) // FYI Here the existance of the "type" property is used to determined the real type of row group
			}

			function rowgroupSetup(forceDataGroup) {
				// console.log('Row Group Setup');
				var i,
					previousRowGroup,
					tmpHeaderLevel;

				// Check if the current row group, already have some row, if yes this is a new row group
				if (rowgroupHeaderRowStack.length > 0) {
					// if more than 0 cell in the stack, mark this row group as a data row group and create the new row group (can be only virtual)
					if (currentRowGroup && currentRowGroup.type && currentRowGroup.row.length > 0) {
						currentRowGroupElement = {};
						initiateRowGroup();
					}

					// We have a data row group
					currentRowGroup.type = 2;

					// Set the group header cell
					currentRowGroup.row = rowgroupHeaderRowStack;
					for (i = 0; i < rowgroupHeaderRowStack.length; i += 1) {
						// if (rowgroupHeaderRowStack[i].cell.length !== 1) {
						//	errorTrigger(11, "Seem to have a row header for the data that have 2 or more cell inside it");
						// }
						rowgroupHeaderRowStack[i].cell[0].type = 7;
						rowgroupHeaderRowStack[i].cell[0].scope = "row";
						rowgroupHeaderRowStack[i].cell[0].row = rowgroupHeaderRowStack[i];
						currentRowGroup.headerlevel.push(rowgroupHeaderRowStack[i].cell[0]);
					}
				}

				// if no cell in the stack but first row group, mark this row group as a data row group
				// console.log('rowgroupHeaderRowStack.length: ' + rowgroupHeaderRowStack.length);
				// console.log(currentRowGroup);
				// console.log('lstRowGroup.length: ' + lstRowGroup.length);
				if (rowgroupHeaderRowStack.length === 0 &&
						// (!currentRowGroup || (currentRowGroup.type && currentRowGroup.type === 1)) &&
						lstRowGroup.length === 0) {

					if (currentRowGroup.type && currentRowGroup.type === 1) {
						currentRowGroupElement = {};
						initiateRowGroup();
					}

					// This is the first data row group at level 1
					currentRowGroup.type = 2;
					currentRowGroup.level = 1; // Default Row Group Level
				}

				// if no cell in the stack and not the first row group, this are a summary group
				// This is only valid if the first colgroup is a header colgroup.
				//console.log('rowgroupHeaderRowStack.length: ' + rowgroupHeaderRowStack.length + ' lstRowGroup.length: ' + lstRowGroup.length + ' currentRowGroup.type: ' + currentRowGroup.type);
				// console.log(' colgroupFrame[0]: ' + colgroupFrame[0] + ' colgroupFrame[0].type: ' + colgroupFrame[0].type + ' forceDataGroup: ' + forceDataGroup);
				if (rowgroupHeaderRowStack.length === 0 && lstRowGroup.length > 0 && !currentRowGroup.type && colgroupFrame[0] && (colgroupFrame[0].type === 1 || (!colgroupFrame[0].type && colgroupFrame.length > 0)) && !forceDataGroup) {
					currentRowGroup.type = 3;
				} else {
					currentRowGroup.type = 2;
					// currentRowGroup.level = 1; // Default Row Group Level
				}

				// console.log(rowgroupHeaderRowStack); rowlevel
				// console.log(currentRowGroup);



				// Set the Data Level for this row group
				// Calculate the appropriate row group level based on the previous rowgroup 
				//	* a Summary Group decrease the row group level
				//	* a Data Group increase the row group level based of his number of row group header and the previous row group level
				//	* Dont forget to set the appropriate level to each group header cell inside this row group.
				if (!currentRowGroup.level) {
					// Get the level of the previous group
					if (lstRowGroup.length > 0) {
						previousRowGroup = lstRowGroup[lstRowGroup.length - 1];

						if (currentRowGroup.type === 2) {
							// Data Group
							if (currentRowGroup.headerlevel.length === previousRowGroup.headerlevel.length) {
								// Same Level as the previous one
								currentRowGroup.level = previousRowGroup.level;
							} else if (currentRowGroup.headerlevel.length < previousRowGroup.headerlevel.length) {
								// add the missing group heading cell 
								tmpHeaderLevel = currentRowGroup.headerlevel;
								currentRowGroup.headerlevel = [];

								for (i = 0; i < (previousRowGroup.headerlevel.length - currentRowGroup.headerlevel.length); i += 1) {
									currentRowGroup.headerlevel.push(previousRowGroup.headerlevel[i]);
								}
								for (i = 0; i < tmpHeaderLevel.length; i += 1) {
									currentRowGroup.headerlevel.push(tmpHeaderLevel[i]);
								}
								currentRowGroup.level = previousRowGroup.level;
							} else if (currentRowGroup.headerlevel.length > previousRowGroup.headerlevel.length) {
								// This are a new set of heading, the level equal the number of group header cell found
								currentRowGroup.level = currentRowGroup.headerlevel.length + 1;
							}
						} else if (currentRowGroup.type === 3) {
							// Summary Group
							if (previousRowGroup.type === 3) {
								currentRowGroup.level = previousRowGroup.level - 1;
							} else {
								currentRowGroup.level = previousRowGroup.level;
							}
							if (currentRowGroup.level < 0) {
								// This is an error, Last summary row group was already found.
								errorTrigger(12);
							}

							// Set the header level with the previous row group
							for (i = 0; i < previousRowGroup.headerlevel.length; i += 1) {
								if (previousRowGroup.headerlevel[i].level < currentRowGroup.level) {
									currentRowGroup.headerlevel.push(previousRowGroup.headerlevel[i]);
								}
							}
						} else {
							// Error
							currentRowGroup.level = "Error, not calculated";
							errorTrigger(13);
						}
					} else {
						currentRowGroup.level = 1 + rowgroupHeaderRowStack.length;
					}
				}

				// Ensure that each row group cell heading have their level set
				for (i = 0; i < currentRowGroup.headerlevel.length; i += 1) {
					currentRowGroup.headerlevel[i].level = i + 1;
					currentRowGroup.headerlevel[i].rowlevel = currentRowGroup.headerlevel[i].level;
				}

				rowgroupHeaderRowStack = []; // reset the row header stack	

				if (currentRowGroup.level === undefined || currentRowGroup.level < 0) {
					errorTrigger(14, currentRowGroup.elem);
				}
			}

			function processRow(elem) {
				// In this function there are a possible confusion about the colgroup variable name used here vs the real colgroup table, In this function the colgroup is used when there are no header cell.
				currentRowPos += 1;
				var columnPos = 1,
					lastCellType = "",
					lastHeadingColPos = false,
					cells = $(elem).children(),
					row = {
						colgroup: [], // === Build from colgroup object ==
						cell: [], // === Build from Cell Object ==
						elem: elem, // Row Structure jQuery element
						rowpos: currentRowPos
					},
					colgroup,
					fnPreProcessGroupHeaderCell,
					fnPreProcessGroupDataCell,
					fnParseSpannedRowCell,
					headingRowCell,
					rowheader,
					colKeyCell,
					i,
					j,
					isDataCell,
					isDataColgroupType,
					createGenericColgroup;

				$(elem).data().tblparser = row;

				row.uid = uidElem;
				uidElem += 1;
				row.groupZero = groupZero;
				groupZero.allParserObj.push(row);

				colgroup = {
					cell: [],
					cgsummary: undefined, // ?? Not sure because this will be better in the data colgroup object ?? Summary Colgroup Associated
					type: false // 1 === header, 2 === data, 3 === summary, 4 === key, 5 === description, 6 === layout, 7 === group header
				};

				colgroup.uid = uidElem;
				uidElem += 1;
				groupZero.allParserObj.push(colgroup);

				fnPreProcessGroupHeaderCell = function (headerCell) {
					if (!colgroup.type) {
						colgroup.type = 1;
					}
					if (colgroup.type !== 1) {
						// Creation of a new colgroup
						row.colgroup.push(colgroup); // Add the previous colgroup

						// Create a new colgroup
						colgroup = {
							cell: [],
							type: 1
						};
						colgroup.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(colgroup);
					}
					colgroup.cell.push(headerCell);
					lastHeadingColPos = headerCell.colpos + headerCell.width - 1;
				};

				fnPreProcessGroupDataCell = function (dataCell) {
					if (!colgroup.type) {
						colgroup.type = 2;
					}

					// Check if we need to create a summary colgroup (Based on the top colgroup definition)
					if (colgroup.type !== 2) {
						// Creation of a new colgroup
						row.colgroup.push(colgroup); // Add the previous colgroup

						// Create a new colgroup
						colgroup = {
							cell: [],
							type: 2
						};
						colgroup.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(colgroup);
					}

					colgroup.cell.push(dataCell);
				};

				fnParseSpannedRowCell = function () {
					var i;

					// Check for spanned row
					$.each(spannedRow, function () {
						if (this.colpos === columnPos && this.spanHeight > 0 && (this.height + this.rowpos - this.spanHeight === currentRowPos)) {

							if (this.elem.nodeName.toLowerCase() === 'th') {
								fnPreProcessGroupHeaderCell(this);
							}

							if (this.elem.nodeName.toLowerCase() === 'td') {
								fnPreProcessGroupDataCell(this);
							}

							this.spanHeight -= 1;

							// Increment the column position
							columnPos += this.width;

							// Add the column
							for (i = 1; i <= this.width; i += 1) {
								row.cell.push(this);
							}

							lastCellType = this.elem.nodeName.toLowerCase();
						}
					});
				};
				fnParseSpannedRowCell(); // This are for any row that have spanned row in is first cells

				// Read the row
				$.each(cells, function () {
					var $this = $(this),
						width = $this.attr('colspan') !== undefined ? parseInt($this.attr('colspan'), 10) : 1,
						height = $this.attr('rowspan') !== undefined ? parseInt($this.attr('rowspan'), 10) : 1,
						headerCell,
						dataCell,
						i;

					switch (this.nodeName.toLowerCase()) {
					case 'th': // cell header					
						headerCell = {
							rowpos: currentRowPos,
							colpos: columnPos,
							width: width,
							height: height,
							data: [],
							summary: [],
							elem: this
						};

						$this.data().tblparser = headerCell;
						headerCell.groupZero = groupZero;

						headerCell.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(headerCell);

						fnPreProcessGroupHeaderCell(headerCell);

						headerCell.parent = colgroup;

						// Check if needs to be added to the spannedRow collection
						if (height > 1) {
							headerCell.spanHeight = height - 1;
							spannedRow.push(headerCell);
						}

						// Increment the column position
						columnPos += headerCell.width;

						for (i = 1; i <= width; i += 1) {
							row.cell.push(headerCell);
						}

						// Check for any spanned cell
						fnParseSpannedRowCell();
						break;
					case 'td': // data cell
						dataCell = {
							rowpos: currentRowPos,
							colpos: columnPos,
							width: width,
							height: height,
							elem: this
						};

						$this.data().tblparser = dataCell;
						dataCell.groupZero = groupZero;

						dataCell.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push(dataCell);

						fnPreProcessGroupDataCell(dataCell);

						dataCell.parent = colgroup;

						// Check if needs to be added to the spannedRow collection
						if (height > 1) {
							dataCell.spanHeight = height - 1;
							spannedRow.push(dataCell);
						}

						// Increment the column position
						columnPos += dataCell.width;

						for (i = 1; i <= width; i += 1) {
							row.cell.push(dataCell);
						}

						// Check for any spanned cell
						fnParseSpannedRowCell();
						break;
					default:
						errorTrigger(15, this);
						break;
					}

					lastCellType = this.nodeName.toLowerCase();
				});

				// Check for any spanned cell
				fnParseSpannedRowCell();

				// Check if this the number of column for this row are equal to the other
				if (tableCellWidth === 0) {
					// If not already set, we use the first row as a guideline
					tableCellWidth = row.cell.length;
				}
				if (tableCellWidth !== row.cell.length) {
					row.spannedRow = spannedRow;
					errorTrigger(16, row.elem);
				}

				// Check if we are into a thead rowgroup, if yes we stop here.
				if (stackRowHeader) {
					theadRowStack.push(row);
					return;
				}

				// Add the last colgroup
				row.colgroup.push(colgroup);

				//
				// Diggest the row
				//
				if (lastCellType === 'th') {
					// Digest the row header
					row.type = 1;

					//
					// Check the validity of this header row
					//

					if (row.colgroup.length === 2 && currentRowPos === 1) {
						// Check if the first is a data colgroup with only one cell 
						if (row.colgroup[0].type === 2 && row.colgroup[0].cell.length === 1) {
							// Valid row header for the row group header

							// REQUIRED: That cell need to be empty
							if ($(row.colgroup[0].cell[0].elem).html().length === 0) {
								// console.log('This is a valide row for the rowgroup header with a layout cell');

								// We stack the row
								theadRowStack.push(row);

								return; // We do not go further
							}
							errorTrigger(17);
						} else {
							// Invalid row header
							errorTrigger(18);
						}
					}

					if (row.colgroup.length === 1) {
						if (row.colgroup[0].cell.length > 1) {
							// this is a row associated to a header row group
							if (!headerRowGroupCompleted) {
								// Good row
								// console.log('This is an valid row header for the header row group');

								// We stack the row
								theadRowStack.push(row);

								return; // We do not go further
							}
							// Bad row, remove the row or split the table
							errorTrigger(18);
						} else {
							if (currentRowPos !== 1) {
								// Stack the row found for the rowgroup header
								rowgroupHeaderRowStack.push(row);

								// This will be processed on the first data row 

								// console.log('this header row will be considerated to be a rowgroup header row');
								headerRowGroupCompleted = true; // End of any header row group (thead)

								return;
							}
							errorTrigger(18);
						}
					}

					if (row.colgroup.length > 1  && currentRowPos !== 1) {
						errorTrigger(21);
					}

					//
					// If Valid, process the row
					//
				} else {
					// Digest the data row or summary row
					row.type = 2;

					// This mark the end of any row group header (thead)
					headerRowGroupCompleted = true;

					// Check if this row is considerated as a description row for a header
					if (rowgroupHeaderRowStack.length > 0 && row.cell[0].uid === row.cell[row.cell.length - 1].uid) {
						// Horay this row are a description cell for the preceding heading

						row.type = 5;
						row.cell[0].type = 5;
						row.cell[0].row = row;
						if (!row.cell[0].describe) {
							row.cell[0].describe = [];
						}
						rowgroupHeaderRowStack[rowgroupHeaderRowStack.length - 1].cell[0].descCell = row.cell[0];
						row.cell[0].describe.push(rowgroupHeaderRowStack[rowgroupHeaderRowStack.length - 1].cell[0]);
						if (!groupZero.desccell) {
							groupZero.desccell = [];
						}
						groupZero.desccell.push(row.cell[0]);

						// FYI - We do not push this row in any stack because this row is a description row

						return; // Stop the processing for this row
					}

					//
					// Process any row used to defined the rowgroup label
					//
					if (rowgroupHeaderRowStack.length > 0 || !currentRowGroup.type) {
						rowgroupSetup();
					}
					row.type = currentRowGroup.type;
					row.level = currentRowGroup.level;


					if (colgroupFrame[0] && lastHeadingColPos && colgroupFrame[0].end !== lastHeadingColPos && colgroupFrame[0].end === (lastHeadingColPos + 1)) {
						lastHeadingColPos += 1; // Adjust if required, the lastHeadingColPos if colgroup are present, that would be the first colgroup
					}
					row.lastHeadingColPos = lastHeadingColPos;
					if (!currentRowGroup.lastHeadingColPos) {
						currentRowGroup.lastHeadingColPos = lastHeadingColPos;
					}
					if (!previousDataHeadingColPos) {
						previousDataHeadingColPos = lastHeadingColPos;
					}
					row.rowgroup = currentRowGroup;


					if (currentRowGroup.lastHeadingColPos !== lastHeadingColPos) {
						if ((!lastHeadingSummaryColPos && currentRowGroup.lastHeadingColPos < lastHeadingColPos) || (lastHeadingSummaryColPos && lastHeadingSummaryColPos === lastHeadingColPos)) {
							// This is a virtual summary row group

							// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
							$.each(spannedRow, function () {
								if (this.spanHeight > 0) {
									// That row are spanned in 2 different row group
									errorTrigger(29, this);
								}
							});

							spannedRow = []; // Cleanup of any spanned row
							rowgroupHeaderRowStack = []; // Remove any rowgroup header found.
							currentRowHeader = [];

							currentTbodyID += 1;
							finalizeRowGroup();

							currentRowGroupElement = undefined;
							initiateRowGroup();
							rowgroupSetup();

							row.type = currentRowGroup.type; // Reset the current row type

						} else if (lastHeadingSummaryColPos && previousDataHeadingColPos === lastHeadingColPos) {
							// This is a virtual data row group

							// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
							$.each(spannedRow, function () {
								if (this.spanHeight > 0) {
									// That row are spanned in 2 different row group
									errorTrigger(29, this);
								}
							});

							spannedRow = []; // Cleanup of any spanned row
							rowgroupHeaderRowStack = []; // Remove any rowgroup header found.
							currentRowHeader = [];

							currentTbodyID += 1;
							finalizeRowGroup();

							currentRowGroupElement = undefined;
							initiateRowGroup();
							rowgroupSetup(true);

							row.type = currentRowGroup.type; // Reset the current row type

							errorTrigger(34, row.elem);

						} else {
							errorTrigger(32);
						}
					}
					if (!currentRowGroup.lastHeadingColPos) {
						currentRowGroup.lastHeadingColPos = lastHeadingColPos;
					}

					if (currentRowGroup.type === 3 && !lastHeadingSummaryColPos) {
						lastHeadingSummaryColPos = lastHeadingColPos;
					}



					// Build the initial colgroup structure
					// If an cell header exist in that row....
					if (lastHeadingColPos) {
						// Process the heading colgroup associated to this row.
						headingRowCell = [];
						rowheader = undefined; // This are the most precise cell header for this row
						colKeyCell = [];

						for (i = 0; i < lastHeadingColPos; i += 1) {
							// Check for description cell or key cell
							if (row.cell[i].elem.nodeName.toLowerCase() === "td") {

								if (!row.cell[i].type && row.cell[i - 1] && !(row.cell[i - 1].descCell) && row.cell[i - 1].type === 1 && row.cell[i - 1].height === row.cell[i].height) {
									row.cell[i].type = 5;
									row.cell[i - 1].descCell = row.cell[i];

									if (!row.cell[i].describe) {
										row.cell[i].describe = [];
									}
									row.cell[i].describe.push(row.cell[i - 1]);

									if (!row.desccell) {
										row.desccell = [];
									}
									row.desccell.push(row.cell[i]);

									if (!groupZero.desccell) {
										groupZero.desccell = [];
									}
									groupZero.desccell.push(row.cell[i]);

									row.cell[i].scope = "row"; // Specify the scope of this description cell
								}

								// Check if this cell can be an key cell associated to an cell heading
								if (!row.cell[i].type) {
									colKeyCell.push(row.cell[i]);
								}
							}

							// Set for the most appropriate header that can represent this row
							if (row.cell[i].elem.nodeName.toLowerCase() === "th") {
								row.cell[i].type = 1; // Mark the cell to be an header cell
								row.cell[i].scope = "row";
								if (rowheader && rowheader.uid !== row.cell[i].uid) {
									if (rowheader.height >= row.cell[i].height) {
										if (rowheader.height === row.cell[i].height) {
											errorTrigger(23);
										}
									
										// The current cell are a child of the previous rowheader 
										if (!rowheader.subheader) {
											rowheader.subheader = [];
											rowheader.isgroup = true;
										}
										rowheader.subheader.push(row.cell[i]);

										// Change the current row header
										rowheader = row.cell[i];
										headingRowCell.push(row.cell[i]);
									} else {
										// This case are either paralel heading of growing header, this are an error.
										errorTrigger(24);
									}
								}
								if (!rowheader) {
									rowheader = row.cell[i];
									headingRowCell.push(row.cell[i]);
								}
								for (j = 0; j < colKeyCell.length; j += 1) {
									if (!(colKeyCell[j].type) && !(row.cell[i].keycell) && colKeyCell[j].height === row.cell[i].height) {
										colKeyCell[j].type = 4;
										row.cell[i].keycell = colKeyCell[j];

										if (!row.keycell) {
											row.keycell = [];
										}
										row.keycell.push(colKeyCell[j]);

										if (!groupZero.keycell) {
											groupZero.keycell = [];
										}
										groupZero.keycell.push(colKeyCell[j]);


										if (!colKeyCell[j].describe) {
											colKeyCell[j].describe = [];
										}
										colKeyCell[j].describe.push(row.cell[i]);
									}
								}
								/*$.each(colKeyCell, function () {
									if (!(this.type) && !(row.cell[i].keycell) && this.height === row.cell[i].height) {
										this.type = 4;
										row.cell[i].keycell = this;

										if (!row.keycell) {
											row.keycell = [];
										}
										row.keycell.push(this);

										if (!groupZero.keycell) {
											groupZero.keycell = [];
										}
										groupZero.keycell.push(this);
									}
								});*/
							}
						}

						// All the cell that have no "type" in the colKeyCell collection are problematic cells
						$.each(colKeyCell, function () {
							if (!(this.type)) {
								errorTrigger(25);
								if (!row.errorcell) {
									row.errorcell = [];
								}
								row.errorcell.push(this);
							}
						});
						row.header = headingRowCell;
					} else {
						// There are only at least one colgroup,
						// Any colgroup tag defined but be equal or greater than 0.
						// if colgroup tag defined, they are all data colgroup. 
						lastHeadingColPos = 0;

						if (colgroupFrame.length === 0) {
							processColgroup(undefined, tableCellWidth);
						}
					}



					//
					// Process the table row heading and colgroup if required
					//
					processRowgroupHeader(lastHeadingColPos);

					row.headerset = (currentRowGroup.headerlevel || []);
					/*if (colgroupFrame.length !== 0) {

						// We check the first colgroup to know if a colgroup type has been defined
						if (!(colgroupFrame[0].type)) {

							// processRowgroupHeader(lastHeadingColPos);

							// Match the already defined colgroup tag with the table rowgroup heading section

							// If the table don't have a rowgroup heading section and nothing found for colgroup heading, let all the colgroup to be a datagroup
							// If the table don't have a row group heading section but have a colgroup heading, the first group must match the founded colgroup heading, the second colgroup will be a datagroup and the third will be a summary colgroup. It would be the same if only one row are found in the rowgroup heading section.
						}
					}*/
					/* else {
						// processRowgroupHeader(lastHeadingColPos);

						// If the table have a table rowgroup heading section, let that to be transformed into colgroup

						// The number of colgroup level are directly related to the number of row heading included in the thead or tbody.

						// If the table don't have a heading section, let run the code, the colgroup would be created later
					}*/

					if (lastHeadingColPos !== 0) {
						lastHeadingColPos = colgroupFrame[0].end; // colgroupFrame must be defined here
					}

					//
					// Associate the data cell type with the colgroup if any, 

					// Process the data cell. There are a need to have at least one data cell per data row.
					if (!row.datacell) {
						row.datacell = [];
					}
					for (i = lastHeadingColPos; i < row.cell.length; i += 1) {
						isDataCell = true;
						isDataColgroupType = true;

						for (j = (lastHeadingColPos === 0 ? 0 : 1); j < colgroupFrame.length; j += 1) { // If colgroup, the first are always header colgroup
							if (colgroupFrame[j].start <= row.cell[i].colpos && row.cell[i].colpos <= colgroupFrame[j].end) {
								if (row.type === 3 || colgroupFrame[j].type === 3) {
									row.cell[i].type = 3; // Summary Cell
								} else {
									row.cell[i].type = 2;
								}

								// Test if this cell is a layout cell
								if (row.type === 3 && colgroupFrame[j].type === 3 && ($(row.cell[i].elem).text().length === 0)) {
									row.cell[i].type = 6;
									if (!groupZero.layoutCell) {
										groupZero.layoutCell = [];
									}
									groupZero.layoutCell.push(row.cell[i]);
								}

								row.cell[i].collevel = colgroupFrame[j].level;
								row.datacell.push(row.cell[i]);
							}
							isDataColgroupType = !isDataColgroupType;
						}

						if (colgroupFrame.length === 0) {
							// There are no colgroup definition, this cell are set to be a datacell
							row.cell[i].type = 2;
							row.datacell.push(row.cell[i]);
						}


						// Add row header when the cell is span into more than one row
						if (row.cell[i].rowpos < currentRowPos) {
							if (!row.cell[i].addrowheaders) {
								row.cell[i].addrowheaders = []; // addrowheaders for additional row headers
							}
							if (row.header) {
								for (j = 0; j < row.header.length; j += 1) {
									if ((row.header[j].rowpos === currentRowPos && row.cell[i].addrowheaders.length === 0) || (row.header[j].rowpos === currentRowPos && row.cell[i].addrowheaders[row.cell[i].addrowheaders.length - 1].uid !==  row.header[j].uid)) {
										row.cell[i].addrowheaders.push(row.header[j]); // Add the current header
									}
								}
							}
						}
					}

					createGenericColgroup = (colgroupFrame.length === 0);
					if (colgroupFrame.length === 0) {
						// processRowgroupHeader(lastHeadingColPos);
						createGenericColgroup = false;
					}



					// Add the cell in his appropriate column
					if (!groupZero.col) {
						groupZero.col = [];
					}

					for (i = 0; i < groupZero.col.length; i += 1) {
						for (j = (groupZero.col[i].start - 1); j < groupZero.col[i].end; j += 1) {
							if (!groupZero.col[i].cell) {
								groupZero.col[i].cell = [];
							}
							// Be sure to do not include twice the same cell for a column spanned in 2 or more column
							if (!(j > (groupZero.col[i].start - 1) && groupZero.col[i].cell[groupZero.col[i].cell.length - 1].uid === row.cell[j].uid)) {
								groupZero.col[i].cell.push(row.cell[j]);
								if (!row.cell[j].col) {
									row.cell[j].col = groupZero.col[i];
								}
							}
						}
					}

					// Associate the row with the cell and Colgroup/Col association
					for (i = 0; i < row.cell.length; i += 1) {
						if (!row.cell[i].row) {
							row.cell[i].row = row;
						}
						row.cell[i].rowlevel = currentRowGroup.level;
						row.cell[i].rowlevelheader = currentRowGroup.headerlevel;
						row.cell[i].rowgroup = currentRowGroup;

						if (i > 0 && row.cell[i - 1].uid === row.cell[i].uid && row.cell[i].type !== 1 && row.cell[i].type !== 5 && row.cell[i].rowpos === currentRowPos && row.cell[i].colpos <= i) {
							if (!row.cell[i].addcolheaders) {
								row.cell[i].addcolheaders = []; // addcolheaders for additional col headers
							}

							// Add the column header if required
							if (groupZero.col[i] && groupZero.col[i].header) {
								for (j = 0; j < groupZero.col[i].header.length; j += 1) {
									if (groupZero.col[i].header[j].colpos === (i + 1)) {
										row.cell[i].addcolheaders.push(groupZero.col[i].header[j]); // Add the current header
									}
								}
							}
						}
					}
					summaryRowGroupEligible = true;
				}
				currentRowLevel += 1;

				// Add the row to the groupZero
				if (!groupZero.row) {
					groupZero.row = [];
				}
				groupZero.row.push(row);
				currentRowGroup.row.push(row);

				delete row.colgroup;
			} // End processRow function

			//
			// Main Entry For The Table Parsing
			//
			if (hasTfoot) {
				// If there is a tfoot element, be sure to add it at the end of all the tbody. FYI - HTML 5 spec allow now tfoot to be at the end
				$('tfoot', obj).appendTo($('tbody:last', obj).parent());
			}
			$(obj).children().each(function () {
				var $this = $(this);
				switch (this.nodeName.toLowerCase()) {
				case 'caption':
					processCaption(this);
					break;
				case 'colgroup':
					processColgroup(this);
					break;
				case 'thead':
					currentRowGroupElement = this;
					// The table should not have any row at this point
					if (theadRowStack.length !== 0 || (groupZero.row && groupZero.row.length > 0)) {
						errorTrigger(26, this);
					}

					$(this).data("tblparser", groupZero);
					stackRowHeader = true;

					// This is the rowgroup header, Colgroup type can not be defined here
					$(this).children().each(function () {
						if (this.nodeName.toLowerCase() !== 'tr') {
							// ERROR
							errorTrigger(27, this);
						}
						processRow(this);
					});

					stackRowHeader = false;

					// Here it's not possible to  Diggest the thead and the colgroup because we need the first data row to be half processed before
					break;
				case 'tbody':
				case 'tfoot':

					// Currently there are no specific support for tfoot element, the tfoot is understood as a normal tbody

					currentRowGroupElement = this;
					initiateRowGroup();

					$this.data().tblparser = currentRowGroup;

					/*
					*
					*
					*
					* First tbody = data
					* All tbody with header === data
					* Subsequent tbody without header === summary
					* 
					*/
					// $this.data("tblparser", currentRowHeader);

					// New row group					
					$this.children().each(function () {
						if (this.nodeName.toLowerCase() !== 'tr') {
							// ERROR
							errorTrigger(27, this);
							return;
						}
						processRow(this);
					});

					finalizeRowGroup();
					
					// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
					$.each(spannedRow, function () {
						if (this.spanHeight > 0) {
							// That row are spanned in 2 different row group
							errorTrigger(29, this);
						}
					});

					spannedRow = []; // Cleanup of any spanned row
					rowgroupHeaderRowStack = []; // Remove any rowgroup header found.
					currentRowHeader = [];

					currentTbodyID += 1;
					break;
					// case 'tfoot':
					//currentRowGroupElement = this;

					// The rowpos are not incremented here because this is a summary rowgroup for the GroupZero

					// Question: Stack any row and processed them at the really end ? Do we allow tfoot to be used as a footnote for the tabular data ?
					// break;
				case 'tr':
					// This are suppose to be a simple table
					processRow(this);
					break;
				default:
					// There is a DOM Structure error
					errorTrigger(30, this);
					break;
				}
			});

			groupZero.theadRowStack = theadRowStack;

			delete groupZero.colgroupFrame;
			groupZero.colgrouplevel = groupZero.colgrp;
			delete groupZero.colgrp;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
