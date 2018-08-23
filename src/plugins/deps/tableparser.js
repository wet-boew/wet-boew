/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Table Parser Plugin
 * @overview Digest complex tabular data and validate complex table
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 *
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-tableparser",
	selector = "." + componentName,
	errorEvent = "error" + selector,
	warningEvent = "warning" + selector,
	$document = wb.doc,

	/**
	* @method init
	* @param {jQuery Event} event Event that triggered this handler
	*/
	init = function( event ) {
		if ( event.namespace !== componentName ) {
			return;
		}

		var $obj = $( event.target ),
			groupZero = {
				allParserObj: [],
				nbDescriptionRow: 0 /* To remove ?? */
			},
			colgroupFrame = [],
			columnFrame = [],
			uidElem = 0,
			currentRowPos = 0,
			spannedRow = [],
			tableCellWidth = 0,
			headerRowGroupCompleted = false,
			theadRowStack = [],
			stackRowHeader = false,

			// Row Group Variable
			rowgroupHeaderRowStack = [],
			currentRowGroup,
			currentRowGroupElement,
			lstRowGroup = [],
			rowgroupheadercalled = false,
			hasTfoot = $obj.has( "tfoot" ),
			lastHeadingSummaryColPos,
			previousDataHeadingColPos,
			tfootOnProcess = false,
			hassumMode = false;

		// obj need to be a table
		if ( $obj.get( 0 ).nodeName.toLowerCase() !== "table" ) {
			$obj.trigger( {
				type: errorEvent,
				pointer: $obj,
				err: 1
			} );
			return;
		}

		// Check if this table was already parsed, if yes we exit by throwing an error
		if ( $obj.tblparser ) {
			$obj.trigger( {
				type: errorEvent,
				pointer: $obj,
				err: 2
			} );
			return;
		}

		// Check for hassum mode
		hassumMode = $obj.hasClass( "hassum" );

		/*
		+-----------------------------------------------------+
		| FYI - Here the value and signification of each type |
		+-------+---------------+-----------------------------+
		| Type	| Signification | Technicality
		+-------+---------------+------------------------------
		|	1	| Header		| TH element only
		+-------+---------------+------------------------------
		|	2	| Data			| TD element only
		+-------+---------------+------------------------------
		|	3	| Summary		| TD element and TD of type 2 exist
		+-------+---------------+------------------------------
		|	4	| Key			| TD element applicable to right TH, Only available on row
		+-------+---------------+------------------------------
		|	5	| Description	| TD element applicable to left or top TH
		+-------+---------------+------------------------------
		|	6	| Layout		| Can be only: Top Left cell or/and Summmary group intersection
		+-------+---------------+------------------------------
		|	7	| Header Group	| TH element only, visual heading grouping, this type are an extension of the type 1
		+-------+---------------+------------------------------
		*/
		$obj.data().tblparser = groupZero;
		groupZero.colgroup = colgroupFrame;
		if ( !groupZero.rowgroup ) {
			groupZero.rowgroup = [];
		}
		if ( !groupZero.lstrowgroup ) {
			groupZero.lstrowgroup = lstRowGroup;
		}
		groupZero.elem = $obj;
		groupZero.uid = uidElem;

		// Set the uid for the groupZero
		uidElem += 1;

		// Group Cell Header at level 0, scope=col
		groupZero.colcaption = {};
		groupZero.colcaption.uid = uidElem;
		uidElem += 1;
		groupZero.colcaption.elem = undefined;
		groupZero.colcaption.type = 7;
		groupZero.colcaption.dataset = [];
		groupZero.colcaption.summaryset = [];

		// Group Cell Header at level 0, scope=row
		groupZero.rowcaption = {};
		groupZero.rowcaption.uid = uidElem;
		uidElem += 1;
		groupZero.rowcaption.elem = undefined;
		groupZero.rowcaption.type = 7;
		groupZero.rowcaption.dataset = [];
		groupZero.rowcaption.summaryset = [];
		groupZero.col = [];

		function processCaption( elem ) {
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
			if ( $( elem ).children().length !== 0 ) {

				// Use the contents function to retrieve the caption
				$( elem ).contents().filter( function() {

					// Text Node
					if ( !caption && this.nodeType === 3 ) {

						// Doesn't matter what it is, but this will be
						// considered as the caption if is not empty
						caption = $( this ).text().replace( /^\s+|\s+$/g, "" );
						if ( caption.length !== 0 ) {
							caption = this;
							captionFound = true;
							return;
						}
						caption = false;
					} else if ( !caption && this.nodeType === 1 ) {

						// Doesn't matter what it is, the first children
						// element will be considered as the caption
						caption = this;
						return;
					}
				} );

				// Use the children function to retrieve the description
				$( elem ).children().filter( function() {

					// if the caption is an element, we should ignore the first one
					if ( captionFound ) {
						description.push( this );
					} else {
						captionFound = true;
					}
				} );
			} else {
				caption = elem;
			}

			// Move the description in a wrapper if there is more than one element
			if ( description.length > 1 ) {
				groupheadercell.description = $( description );
			} else if ( description.length === 1 ) {
				groupheadercell.description = description[ 0 ];
			}
			if ( caption ) {
				groupheadercell.caption = caption;
			}
			groupheadercell.groupZero = groupZero;
			groupheadercell.type = 1;
			groupZero.groupheadercell = groupheadercell;
			$( elem ).data().tblparser = groupheadercell;
		}
		function processColgroup( elem, nbvirtualcol ) {

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
				width, i, iLen, col;
			colgroup.elem = elem;
			if ( elem ) {
				$( elem ).data().tblparser = colgroup;
			}
			colgroup.uid = uidElem;
			uidElem += 1;
			groupZero.allParserObj.push( colgroup );
			if ( colgroupFrame.length !== 0 ) {
				colgroup.start = colgroupFrame[ colgroupFrame.length - 1 ].end + 1;
			} else {
				colgroup.start = 1;
			}

			// Add any exist structural col element
			if ( elem ) {
				$( "col", elem ).each( function() {
					var $this = $( this ),
						width = $this.attr( "span" ) !== undefined ?
							parseInt( $this.attr( "span" ), 10 ) :
							1,
						col = {
							elem: {},
							start: 0,
							end: 0,
							groupZero: groupZero
						};
					col.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push( col );
					col.start = colgroup.start + colgroupspan;

					// Minus one because the default value was already calculated
					col.end = colgroup.start + colgroupspan + width - 1;
					col.elem = this;
					col.groupZero = groupZero;
					$this.data().tblparser = col;
					colgroup.col.push( col );
					columnFrame.push( col );
					colgroupspan += width;
				} );
			}

			// If no col element check for the span attribute
			if ( colgroup.col.length === 0 ) {
				if ( elem ) {
					width = $( elem ).attr( "span" ) !== undefined ?
						parseInt( $( elem ).attr( "span" ), 10 ) :
						1;
				} else if ( typeof nbvirtualcol === "number" ) {
					width = nbvirtualcol;
				} else {
					$obj.trigger( {
						type: errorEvent,
						pointer: $obj,
						err: 31
					} );
					return;
				}
				colgroupspan += width;

				// Create virtual column
				for ( i = colgroup.start, iLen = ( colgroup.start + colgroupspan ); i !== iLen; i += 1 ) {
					col = {
						start: 0,
						end: 0,
						groupZero: groupZero,
						elem: undefined
					};
					col.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push( col );
					col.start = i;
					col.end = i;
					colgroup.col.push( col );
					columnFrame.push( col );
				}
			}
			colgroup.end = colgroup.start + colgroupspan - 1;
			colgroupFrame.push( colgroup );
		}

		// thead row group processing
		function processRowgroupHeader( colgroupHeaderColEnd ) {
			var i, iLen, j, jLen, m, mLen,
				tmpStack = [], tmpStackCurr, tmpStackCell,
				dataColgroup, dataColumns, colgroup, col,
				hcolgroup, currColPos,
				currColgroupStructure, bigTotalColgroupFound,
				theadRSNext, theadRSNextCell, cell, gzCol, theadRS;

			if ( groupZero.colgrouphead || rowgroupheadercalled ) {

				// Prevent multiple call
				return;
			}
			rowgroupheadercalled = true;
			if ( colgroupHeaderColEnd && colgroupHeaderColEnd > 0 ) {

				// The first colgroup must match the colgroupHeaderColEnd
				if ( colgroupFrame.length > 0 && ( colgroupFrame[ 0 ].start !== 1 ||
					( colgroupFrame[ 0 ].end !== colgroupHeaderColEnd &&
					colgroupFrame[ 0 ].end !== ( colgroupHeaderColEnd + 1 ) ) ) ) {

					$obj.trigger( {
						type: warningEvent,
						pointer: $obj,
						err: 3
					} );

					// Destroy any existing colgroup, because they are not valid
					colgroupFrame = [];
				}
			} else {

				// This mean that are no colgroup designated to be a colgroup header
				colgroupHeaderColEnd = 0;
			}

			// Associate any descriptive cell to his top header
			for ( i = 0, iLen = theadRowStack.length; i !== iLen; i += 1 ) {
				theadRS = theadRowStack[ i ];
				if ( !theadRS.type ) {
					theadRS.type = 1;
				}

				for ( j = 0, jLen = theadRS.cell.length; j < jLen; j += 1 ) {
					cell = theadRowStack[ i ].cell[ j ];
					cell.scope = "col";

					// check if we have a layout cell at the top, left
					if ( i === 0 && j === 0 && cell.elem.innerHTML.length === 0 ) {

						// That is a layout cell
						cell.type = 6;
						if ( !groupZero.layoutCell ) {
							groupZero.layoutCell = [];
						}
						groupZero.layoutCell.push( cell );

						j = cell.width - 1;
						if ( j >= jLen ) {
							break;
						}
					}

					// Check the next row to see if they have a corresponding description cell
					theadRSNext = theadRowStack[ i + 1 ];
					theadRSNextCell = theadRSNext ? theadRSNext.cell[ j ] : "";
					if ( !cell.descCell &&
							cell.elem.nodeName.toLowerCase() === "th" &&
							!cell.type &&
							theadRSNext &&
							theadRSNext.uid !== cell.uid &&
							theadRSNextCell &&
							!theadRSNextCell.type &&
							theadRSNextCell.elem.nodeName.toLowerCase() === "td" &&
							theadRSNextCell.width === cell.width &&
							theadRSNextCell.height === 1 ) {

						// Mark the next row as a row description
						theadRSNext.type = 5;

						// Mark the cell as a cell description
						theadRSNextCell.type = 5;
						theadRSNextCell.row = theadRS;
						cell.descCell = theadRSNextCell;

						// Add the description cell to the complete listing
						if ( !groupZero.desccell ) {
							groupZero.desccell = [];
						}
						groupZero.desccell.push( theadRSNextCell );

						j = cell.width - 1;
						if ( j >= jLen ) {
							break;
						}
					}

					if ( !cell.type ) {
						cell.type = 1;
					}
				}
			}

			// Clean the theadRowStack by removing any descriptive row
			for ( i = 0, iLen = theadRowStack.length; i !== iLen; i += 1 ) {
				theadRS = theadRowStack[ i ];
				if ( theadRS.type === 5 ) {

					// Check if all the cell in it are set to the type 5
					for ( j = 0, jLen = theadRS.cell.length; j !== jLen; j += 1 ) {
						cell = theadRS.cell[ j ];
						if ( cell.type !== 5 && cell.type !== 6 && cell.height === 1 ) {
							$obj.trigger( {
								type: warningEvent,
								pointer: cell.elem,
								err: 4
							} );
						}

						// Check the row before and modify their height value
						if ( cell.uid === theadRowStack[ i - 1 ].cell[ j ].uid ) {
							cell.height -= 1;
						}
					}
					groupZero.nbDescriptionRow += 1;
				} else {
					tmpStack.push( theadRS );
				}
			}

			// Array based on level as indexes for columns and group headers
			groupZero.colgrp = [];

			// Parser any cell in the colgroup header
			if ( colgroupHeaderColEnd > 0 &&
				( colgroupFrame.length === 1 || colgroupFrame.length === 0 ) ) {

				// There are no colgroup elements defined.
				// All cells will be considered to be a data cells.
				// Data Colgroup
				dataColgroup = {};
				dataColumns = [];
				colgroup = {
					start: ( colgroupHeaderColEnd + 1 ),
					end: tableCellWidth,
					col: [],
					groupZero: groupZero,
					elem: undefined,

					// Set colgroup data type
					type: 2
				};
				colgroup.uid = uidElem;
				uidElem += 1;
				groupZero.allParserObj.push( colgroup );

				if ( colgroup.start > colgroup.end ) {
					$obj.trigger( {
						type: warningEvent,
						pointer: $obj,
						err: 5
					} );
				}

				dataColgroup = colgroup;

				// Create the column
				// Create virtual column
				for ( i = colgroup.start, iLen = colgroup.end; i <= iLen; i += 1 ) {
					col = {
						start: 0,
						end: 0,
						groupZero: groupZero,
						elem: undefined
					};
					col.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push( col );

					if ( !groupZero.col ) {
						groupZero.col = [];
					}
					dataColumns.push( col );

					col.start = i;
					col.end = i;
					col.groupstruct = colgroup;

					colgroup.col.push( col );

					// Check to remove "columnFrame"
					columnFrame.push( col );
				}

				// Default Level => 1
				groupZero.colgrp[ 1 ] = [];
				groupZero.colgrp[ 1 ].push( groupZero.colcaption );

				// Header Colgroup
				if ( colgroupHeaderColEnd > 0 ) {
					hcolgroup = {
						start: 1,
						elem: undefined,
						end: colgroupHeaderColEnd,
						col: [],
						groupZero: groupZero,

						// Set colgroup data type
						type: 1
					};
					hcolgroup.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push( hcolgroup );

					colgroupFrame.push( hcolgroup );
					colgroupFrame.push( dataColgroup );
					groupZero.colcaption.dataset = dataColgroup.col;

					// Create the column
					// Create virtual column
					for ( i = hcolgroup.start, iLen = hcolgroup.end; i <= iLen; i += 1 ) {
						col = {
							start: 0,
							end: 0,
							groupZero: groupZero,
							elem: undefined
						};
						col.uid = uidElem;
						uidElem += 1;
						groupZero.allParserObj.push( col );

						if ( !groupZero.col ) {
							groupZero.col = [];
						}
						groupZero.col.push( col );

						col.start = i;
						col.end = i;
						col.groupstruct = hcolgroup;

						hcolgroup.col.push( col );
						columnFrame.push( col );
					}

					for ( i = 0, iLen = dataColumns.length; i !== iLen; i += 1 ) {
						groupZero.col.push( dataColumns[ i ] );
					}
				}

				if ( colgroupFrame.length === 0 ) {
					colgroupFrame.push( dataColgroup );
					groupZero.colcaption.dataset = dataColgroup.col;
				}

				// Set the header for each column
				for ( i = 0, iLen = groupZero.col.length; i !== iLen; i += 1 ) {
					gzCol = groupZero.col[ i ];
					gzCol.header = [];
					for ( j = 0, jLen = tmpStack.length; j !== jLen; j += 1 ) {
						for ( m = gzCol.start, mLen = gzCol.end; m <= mLen; m += 1 ) {
							cell = tmpStack[ j ].cell[ m - 1 ];
							if ( ( j === 0 || ( j > 0 &&
								cell.uid !== tmpStack[ j - 1 ].cell[ m - 1 ].uid ) ) &&
								cell.type === 1 ) {

								gzCol.header.push( cell );
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
				// List of real colgroup
				currColPos = (
					colgroupHeaderColEnd === 0 ?
						1 :

						// Set the current column position
						colgroupFrame[ 0 ].end + 1
				);

				colgroup = {
					start: currColPos,
					end: undefined,
					col: [],
					row: [],

					// Set colgroup data type, that is the initial colgroup type
					type: 2
				};
				currColgroupStructure = [];
				bigTotalColgroupFound = false;

				$.each( colgroupFrame, function() {
					var curColgroupFrame = this,
						groupLevel,
						cgrp,
						parentHeader,
						summaryAttached;

					if ( bigTotalColgroupFound || groupZero.colgrp[ 0 ] ) {
						$obj.trigger( {
							type: errorEvent,
							pointer: curColgroupFrame,
							err: 6
						} );
						return;
					}

					$.each( curColgroupFrame.col, function() {
						var column = this;
						if ( !groupZero.col ) {
							groupZero.col = [];
						}
						groupZero.col.push( column );

						column.type = 1;
						column.groupstruct = curColgroupFrame;
					} );

					if ( curColgroupFrame.start < currColPos ) {
						if ( colgroupHeaderColEnd !== curColgroupFrame.end ) {
							$obj.trigger( {
								type: warningEvent,
								pointer: curColgroupFrame,
								err: 7
							} );
						}

						// Skip this colgroup, this should happened only once and should represent the header colgroup

						// Assign the headers for this group
						for ( i = 0, iLen = curColgroupFrame.col.length; i !== iLen; i += 1 ) {
							gzCol = curColgroupFrame.col[ i ];
							gzCol.header = [];
							for ( j = 0, jLen = tmpStack.length; j !== jLen; j += 1 ) {
								for ( m = gzCol.start, mLen = gzCol.end; m <= mLen; m += 1 ) {
									if ( ( j === 0 || ( j > 0 &&
										tmpStack[ j ].cell[ m - 1 ].uid !== tmpStack[ j - 1 ].cell[ m - 1 ].uid ) ) &&
										tmpStack[ j ].cell[ m - 1 ].type === 1 ) {
										gzCol.header.push( tmpStack[ j ].cell[ m - 1 ] );
									}
								}
							}
						}

						return;
					}

					groupLevel = undefined;

					// Get the colgroup level
					for ( i = 0, iLen = tmpStack.length; i !== iLen; i += 1 ) {
						tmpStackCell = tmpStack[ i ].cell[ curColgroupFrame.end - 1 ];
						if ( !tmpStackCell && curColgroupFrame.end > tmpStack[ i ].cell.length ) {

							// Number of column are not corresponding to the table width
							$obj.trigger( {
								type: warningEvent,
								pointer: $obj,
								err: 3
							} );
							break;
						}
						if ( ( tmpStackCell.colpos + tmpStackCell.width - 1 ) === curColgroupFrame.end &&
							( tmpStackCell.colpos >= curColgroupFrame.start ) ) {

							if ( !groupLevel || groupLevel > ( i + 1 ) ) {

								// would equal at the current data cell level.
								// The lowest row level wins.
								groupLevel = ( i + 1 );
							}
						}
					}

					if ( !groupLevel ) {

						// Default colgroup data Level, this happen when there
						// is no column header (same as no thead).
						groupLevel = 1;
					}

					// All the cells at higher level (below the group level found)
					// of which one found, need to be inside the colgroup
					for ( i = ( groupLevel - 1 ), iLen = tmpStack.length; i !== iLen; i += 1 ) {
						tmpStackCurr = tmpStack[ i ];

						// Test each cell in that group
						for ( j = curColgroupFrame.start - 1, jLen = curColgroupFrame.end; j !== jLen; j += 1 ) {
							tmpStackCell = tmpStackCurr.cell[ j ];
							if ( tmpStackCell.colpos < curColgroupFrame.start ||
								( tmpStackCell.colpos + tmpStackCell.width - 1 ) > curColgroupFrame.end ) {

								$obj.trigger( {
									type: errorEvent,
									pointer: $obj,
									err: 9
								} );
								return;
							}
						}
					}

					// Add virtual colgroup Based on the top header
					for ( i = currColgroupStructure.length, iLen = ( groupLevel - 1 ); i !== iLen; i += 1 ) {
						tmpStackCell = tmpStack[ i ].cell[ curColgroupFrame.start - 1 ];

						// Use the top cell at level minus 1, that cell must be larger
						if ( tmpStackCell.uid !== tmpStack[ i ].cell[ curColgroupFrame.end - 1 ].uid ||
								tmpStackCell.colpos > curColgroupFrame.start ||
								tmpStackCell.colpos + tmpStackCell.width - 1 < curColgroupFrame.end ) {
							$obj.trigger( {
								type: errorEvent,
								pointer: $obj,
								err: 10
							} );
							return;
						}

						// Convert the header in a group header cell
						cgrp = tmpStackCell;
						cgrp.level = i + 1;

						cgrp.start = cgrp.colpos;
						cgrp.end = cgrp.colpos + cgrp.width - 1;

						// Group header cell
						cgrp.type = 7;

						currColgroupStructure.push( cgrp );

						if ( !groupZero.virtualColgroup ) {
							groupZero.virtualColgroup = [];
						}
						groupZero.virtualColgroup.push( cgrp );

						// Add the group into the level colgroup perspective
						if ( !groupZero.colgrp[ i + 1 ] ) {
							groupZero.colgrp[ i + 1 ] = [];
						}
						groupZero.colgrp[ i + 1 ].push( cgrp );
					}

					// Set the header list for the current group
					curColgroupFrame.header = [];
					for ( i  = groupLevel - ( groupLevel >= 2 ? 2 : 1 ), iLen = tmpStack.length; i !== iLen; i += 1 ) {
						for ( j = curColgroupFrame.start; j <= curColgroupFrame.end; j += 1 ) {
							if ( tmpStack[ i ].cell[ j - 1 ].rowpos === i + 1 ) {
								curColgroupFrame.header.push( tmpStack[ i ].cell[ j - 1 ] );

								// Attach the current colgroup to this header
								tmpStack[ i ].cell[ j - 1 ].colgroup = curColgroupFrame;
							}
							j += tmpStack[ i ].cell[ j - 1 ].width - 1;
						}
					}

					// Assign the parent header to the current header
					parentHeader = [];
					for ( i = 0; i < currColgroupStructure.length - 1; i += 1 ) {
						parentHeader.push( currColgroupStructure[ i ] );
					}
					curColgroupFrame.parentHeader = parentHeader;

					// Check to set if this group are a data group
					if ( currColgroupStructure.length < groupLevel ) {

						// This colgroup are a data colgroup
						// The current colgroup are a data colgroup
						if ( !curColgroupFrame.type ) {
							curColgroupFrame.type = 2;

							// Set Data group type
							curColgroupFrame.level = groupLevel;
						}

						currColgroupStructure.push( curColgroupFrame );

						// Add the group into the level colgroup perspective
						if ( !groupZero.colgrp[ groupLevel ] ) {
							groupZero.colgrp[ groupLevel ] = [];
						}
						groupZero.colgrp[ groupLevel ].push( curColgroupFrame );
					}

					//
					// Preparing the current stack for the next colgroup and set if the current are a summary group
					//

					// Check if we need to pop out the current header colgroup
					summaryAttached = false;
					for ( i = currColgroupStructure.length - 1; i !== -1; i -= 1 ) {

						if ( currColgroupStructure[ i ].end <= curColgroupFrame.end ) {

							if ( currColgroupStructure[ i ].level < groupLevel && theadRowStack.length > 0 ) {
								curColgroupFrame.type = 3;
							}

							// Attach the Summary group to the colgroup
							// popped if current colgroup are type 3
							if ( curColgroupFrame.type === 3 && !summaryAttached ) {
								currColgroupStructure[ currColgroupStructure.length - 1 ].summary = curColgroupFrame;

								// This are used to do not attach a summary of level 4
								// to an inappropriate level 1 for example
								summaryAttached = true;
							}

							currColgroupStructure.pop();
						}
					}

					if ( !hassumMode ) {
						curColgroupFrame.type = 2;
					}

					// Catch the second and the third possible grouping at level 1
					if ( groupLevel === 1 && groupZero.colgrp[ 1 ] &&
						groupZero.colgrp[ 1 ].length > 1 && theadRowStack.length > 0 ) {

						// Check if in the group at level 1 if
						// we don't already have a summary colgroup
						for ( i = 0; i < groupZero.colgrp[ 1 ].length; i += 1 ) {
							if ( groupZero.colgrp[ 1 ][ i ].type === 3 ) {

								// Congrats, we found the last possible colgroup,
								curColgroupFrame.level = 0;
								if ( !groupZero.colgrp[ 0 ] ) {
									groupZero.colgrp[ 0 ] = [];
								}
								groupZero.colgrp[ 0 ].push( curColgroupFrame );
								groupZero.colgrp[ 1 ].pop();

								bigTotalColgroupFound = true;
								break;
							}
						}
						if ( hassumMode ) {
							curColgroupFrame.type = 3;
						}
					}

					// Set the representative header "caption" element for a group at level 0
					if ( curColgroupFrame.level === 1 && curColgroupFrame.type === 2 ) {
						curColgroupFrame.repheader = "caption";
					}

					if ( !groupZero.col ) {
						groupZero.col = [];
					}

					$.each( curColgroupFrame.col, function() {
						var column = this,
							colStart = column.start,
							colEnd = column.end,
							colpos, cellWidth, cell, colHeaderLen;

						column.type = curColgroupFrame.type;
						column.level = curColgroupFrame.level;
						column.groupstruct = curColgroupFrame;

						column.header = [];

						// Find the lowest header that would represent this column
						for ( j = ( groupLevel - 1 ); j < tmpStack.length; j += 1 ) {
							for ( i = ( curColgroupFrame.start - 1 ); i < curColgroupFrame.end; i += 1 ) {
								cell = tmpStack[ j ].cell[ i ];
								colpos = cell.colpos;
								cellWidth = cell.width - 1;
								if ( ( colpos >= colStart && colpos <= colEnd ) ||
									( colpos <= colStart &&
									( colpos + cellWidth ) >= colEnd ) ||
									( ( colpos + cellWidth ) <= colStart &&
									( colpos + cellWidth ) >= colEnd ) ) {

									colHeaderLen = column.header.length;
									if ( colHeaderLen === 0 || ( colHeaderLen > 0 && column.header[ colHeaderLen - 1 ].uid !== cell.uid ) ) {

										// This are the header that would represent this column
										column.header.push( cell );
										tmpStack[ j ].cell[ i ].level = curColgroupFrame.level;
									}
								}
							}
						}
					} );
				} );

				if ( !groupZero.virtualColgroup ) {
					groupZero.virtualColgroup = [];
				}

				// Set the Virtual Group Header Cell, if any
				$.each( groupZero.virtualColgroup, function() {
					var vGroupHeaderCell = this;

					// Set the headerLevel at the appropriate column
					for ( i = ( vGroupHeaderCell.start - 1 ); i < vGroupHeaderCell.end; i += 1 ) {
						if ( !groupZero.col[ i ].headerLevel ) {
							groupZero.col[ i ].headerLevel = [];
						}
						groupZero.col[ i ].headerLevel.push( vGroupHeaderCell );
					}
				} );
			}

			// Associate the colgroup Header in the group Zero
			if ( colgroupFrame.length > 0 && colgroupHeaderColEnd > 0 ) {
				groupZero.colgrouphead = colgroupFrame[ 0 ];

				// Set the first colgroup type :-)
				groupZero.colgrouphead.type = 1;
			}
		}

		function finalizeRowGroup() {

			// Check if the current rowgroup has been go in the rowgroup setup, if not we do
			if ( !currentRowGroup.type || !currentRowGroup.level ) {

				// Colgroup Setup,
				rowgroupSetup();
			}

			// If the current row group are a data group, check each row if we can found a pattern about to increment the data level for this row group
			// Update, if needed, each row and cell to take in consideration the new row group level
			// Add the row group in the groupZero Collection
			lstRowGroup.push( currentRowGroup );
			currentRowGroup = {};
		}

		function initiateRowGroup() {

			// Finalisation of any existing row group
			if ( currentRowGroup && currentRowGroup.type ) {
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
		}

		function rowgroupSetup( forceDataGroup ) {

			var i, iLen, previousRowGroup, tmpHeaderLevel;

			if ( tfootOnProcess ) {
				currentRowGroup.type = 3;
				currentRowGroup.level = 0;
				rowgroupHeaderRowStack = [];
				return;
			}

			// Check if the current row group, already have some row,
			// if yes this is a new row group
			if ( rowgroupHeaderRowStack.length !== 0 ) {

				// if more than 0 cell in the stack, mark this row group as a data
				// row group and create the new row group (can be only virtual)
				if ( currentRowGroup && currentRowGroup.type &&
					currentRowGroup.row.length > 0 ) {

					currentRowGroupElement = {};
					initiateRowGroup();
				}

				// We have a data row group
				currentRowGroup.type = 2;

				// Set the group header cell
				currentRowGroup.row = rowgroupHeaderRowStack;
				for ( i = 0, iLen = rowgroupHeaderRowStack.length; i !==  iLen; i += 1 ) {
					rowgroupHeaderRowStack[ i ].cell[ 0 ].type = 7;
					rowgroupHeaderRowStack[ i ].cell[ 0 ].scope = "row";
					rowgroupHeaderRowStack[ i ].cell[ 0 ].row = rowgroupHeaderRowStack[ i ];
					currentRowGroup.headerlevel.push( rowgroupHeaderRowStack[ i ].cell[ 0 ] );
				}
			}

			// if no cell in the stack but first row group, mark this row group as a data row group
			if ( rowgroupHeaderRowStack.length === 0 && lstRowGroup.length === 0 ) {

				if ( currentRowGroup.type && currentRowGroup.type === 1 ) {
					currentRowGroupElement = {};
					initiateRowGroup();
				}

				// This is the first data row group at level 1
				currentRowGroup.type = 2;

				// Default row group level
				currentRowGroup.level = 1;
			}

			// if no cell in the stack and not the first row group, this are a summary group
			// This is only valid if the first colgroup is a header colgroup.
			if ( rowgroupHeaderRowStack.length === 0 && lstRowGroup.length > 0 &&
				!currentRowGroup.type && colgroupFrame[ 0 ] &&
				( colgroupFrame[ 0 ].type === 1 || ( !colgroupFrame[ 0 ].type && colgroupFrame.length > 0 ) ) &&
				!forceDataGroup ) {

				currentRowGroup.type = 3;
			} else {
				currentRowGroup.type = 2;
			}

			if ( currentRowGroup.type === 3 && !hassumMode ) {
				currentRowGroup.type = 2;
				currentRowGroup.level = lstRowGroup[ lstRowGroup.length - 1 ].level;
			}

			// Set the Data Level for this row group
			// Calculate the appropriate row group level based on the previous rowgroup
			//	* a Summary Group decrease the row group level
			//	* a Data Group increase the row group level based of his number of row group header and the previous row group level
			//	* Dont forget to set the appropriate level to each group header cell inside this row group.
			if ( !currentRowGroup.level ) {

				// Get the level of the previous group
				if ( lstRowGroup.length > 0 ) {
					previousRowGroup = lstRowGroup[ lstRowGroup.length - 1 ];

					if ( currentRowGroup.type === 2 ) {

						// Data Group
						if ( currentRowGroup.headerlevel.length === previousRowGroup.headerlevel.length ) {

							// Same Level as the previous one
							currentRowGroup.level = previousRowGroup.level;
						} else if ( currentRowGroup.headerlevel.length < previousRowGroup.headerlevel.length ) {

							// add the missing group heading cell
							tmpHeaderLevel = currentRowGroup.headerlevel;
							currentRowGroup.headerlevel = [];

							for ( i = 0; i < ( previousRowGroup.headerlevel.length - currentRowGroup.headerlevel.length ); i += 1 ) {
								currentRowGroup.headerlevel.push( previousRowGroup.headerlevel[ i ] );
							}
							for ( i = 0; i < tmpHeaderLevel.length; i += 1 ) {
								currentRowGroup.headerlevel.push( tmpHeaderLevel[ i ] );
							}
							currentRowGroup.level = previousRowGroup.level;
						} else if ( currentRowGroup.headerlevel.length > previousRowGroup.headerlevel.length ) {

							// This are a new set of heading, the level equal the number of group header cell found
							currentRowGroup.level = currentRowGroup.headerlevel.length + 1;
						}
					} else if ( currentRowGroup.type === 3 ) {

						// Summary Group
						if ( previousRowGroup.type === 3 ) {
							currentRowGroup.level = previousRowGroup.level - 1;
						} else {
							currentRowGroup.level = previousRowGroup.level;
						}
						if ( currentRowGroup.level < 0 ) {

							// This is an error, Last summary row group was already found.
							$obj.trigger( {
								type: warningEvent,
								pointer: $obj,
								err: 12
							} );
						}

						// Set the header level with the previous row group
						for ( i = 0; i < previousRowGroup.headerlevel.length; i += 1 ) {
							if ( previousRowGroup.headerlevel[ i ].level < currentRowGroup.level ) {
								currentRowGroup.headerlevel.push( previousRowGroup.headerlevel[ i ] );
							}
						}
					} else {

						// Error
						currentRowGroup.level = "Error, not calculated";
						$obj.trigger( {
							type: warningEvent,
							pointer: $obj,
							err: 13
						} );
					}
				} else {
					currentRowGroup.level = 1 + rowgroupHeaderRowStack.length;
				}
			}

			// Ensure that each row group cell heading have their level set
			for ( i = 0; i < currentRowGroup.headerlevel.length; i += 1 ) {
				currentRowGroup.headerlevel[ i ].level = i + 1;
				currentRowGroup.headerlevel[ i ].rowlevel = currentRowGroup.headerlevel [ i ].level;
			}

			// reset the row header stack
			rowgroupHeaderRowStack = [];

			if ( currentRowGroup.level === undefined || currentRowGroup.level < 0 ) {
				$obj.trigger( {
					type: warningEvent,
					pointer: currentRowGroup.elem,
					err: 14
				} );
			}
		}

		function processRow( elem ) {

			// In this function there are a possible confusion about the colgroup variable name used here vs the real colgroup table, In this function the colgroup is used when there are no header cell.
			currentRowPos += 1;
			var columnPos = 1,
				lastCellType = "",
				lastHeadingColPos = false,
				cells = $( elem ).children(),
				row = {
					colgroup: [], /* === Build from colgroup object == */
					cell: [], /* === Build from Cell Object == */
					elem: elem, /* Row Structure jQuery element */
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
				isDataColgroupType;

			$( elem ).data().tblparser = row;

			row.uid = uidElem;
			uidElem += 1;
			row.groupZero = groupZero;
			groupZero.allParserObj.push( row );

			colgroup = {
				cell: [],
				cgsummary: undefined, /* ?? Not sure because this will be better in the data colgroup object ?? Summary Colgroup Associated */
				type: false /* 1 === header, 2 === data, 3 === summary, 4 === key, 5 === description, 6 === layout, 7 === group header */
			};

			colgroup.uid = uidElem;
			uidElem += 1;
			groupZero.allParserObj.push( colgroup );

			fnPreProcessGroupHeaderCell = function( headerCell ) {
				if ( !colgroup.type ) {
					colgroup.type = 1;
				}
				if ( colgroup.type !== 1 ) {

					// Creation of a new colgroup
					// Add the previous colgroup
					row.colgroup.push( colgroup );

					// Create a new colgroup
					colgroup = {
						cell: [],
						type: 1
					};
					colgroup.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push( colgroup );
				}
				colgroup.cell.push( headerCell );
				lastHeadingColPos = headerCell.colpos + headerCell.width - 1;
			};

			fnPreProcessGroupDataCell = function( dataCell ) {
				if ( !colgroup.type ) {
					colgroup.type = 2;
				}

				// Check if we need to create a summary colgroup (Based on the top colgroup definition)
				if ( colgroup.type !== 2 ) {

					// Creation of a new colgroup
					// Add the previous colgroup
					row.colgroup.push( colgroup );

					// Create a new colgroup
					colgroup = {
						cell: [],
						type: 2
					};
					colgroup.uid = uidElem;
					uidElem += 1;
					groupZero.allParserObj.push( colgroup );
				}

				colgroup.cell.push( dataCell );
			};

			fnParseSpannedRowCell = function() {
				var j,
					currCell;

				// Check for spanned row
				while ( columnPos <= tableCellWidth ) {
					if ( !spannedRow[ columnPos ] ) {
						break;
					}
					currCell = spannedRow[ columnPos ];

					if ( currCell.spanHeight && currCell.spanHeight > 0 && currCell.colpos === columnPos ) {
						if ( currCell.height + currCell.rowpos - currCell.spanHeight !== currentRowPos ) {
							break;
						}

						lastCellType = currCell.elem.nodeName.toLowerCase();

						if ( lastCellType === "th" ) {
							fnPreProcessGroupHeaderCell( currCell );
						} else if ( lastCellType === "td" ) {
							fnPreProcessGroupDataCell( currCell );
						}

						// Adjust the spanned value for the next check
						if ( currCell.spanHeight === 1 ) {
							delete currCell.spanHeight;
						} else {
							currCell.spanHeight -= 1;
						}

						for ( j = 0; j < currCell.width; j += 1 ) {
							row.cell.push( currCell );
						}

						// Increment the column position
						columnPos += currCell.width;
					} else {
						break;
					}
				}

			};

			// Read the row
			$.each( cells, function() {
				var $this = $( this ),
					width = $this.attr( "colspan" ) !== undefined ? parseInt( $this.attr( "colspan" ), 10 ) : 1,
					height = $this.attr( "rowspan" ) !== undefined ? parseInt( $this.attr( "rowspan" ), 10 ) : 1,
					headerCell,
					dataCell,
					i;

				switch ( this.nodeName.toLowerCase() ) {

				// cell header
				case "th":

					// Check for spanned cell between cells
					fnParseSpannedRowCell();

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
					groupZero.allParserObj.push( headerCell );

					fnPreProcessGroupHeaderCell( headerCell );

					headerCell.parent = colgroup;

					headerCell.spanHeight = height - 1;

					for ( i = 0; i < width; i += 1 ) {
						row.cell.push( headerCell );
						spannedRow[ columnPos + i ] = headerCell;
					}

					// Increment the column position
					columnPos += headerCell.width;

					break;

				// data cell
				case "td":

					// Check for spanned cell between cells
					fnParseSpannedRowCell();

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
					groupZero.allParserObj.push( dataCell );

					fnPreProcessGroupDataCell( dataCell );

					dataCell.parent = colgroup;

					dataCell.spanHeight = height - 1;

					for ( i = 0; i < width; i += 1 ) {
						row.cell.push( dataCell );
						spannedRow[ columnPos + i ] = dataCell;
					}

					// Increment the column position
					columnPos += dataCell.width;

					break;
				default:
					$obj.trigger( {
						type: warningEvent,
						pointer: this,
						err: 15
					} );
					break;
				}

				lastCellType = this.nodeName.toLowerCase();

			} );

			// Check for any spanned cell
			fnParseSpannedRowCell();

			// Check if this the number of column for this row are equal to the other
			if ( tableCellWidth === 0 ) {

				// If not already set, we use the first row as a guideline
				tableCellWidth = row.cell.length;
			}
			if ( tableCellWidth !== row.cell.length ) {
				row.spannedRow = spannedRow;
				$obj.trigger( {
					type: warningEvent,
					pointer: row.elem,
					err: 16
				} );
			}

			// Check if we are into a thead rowgroup, if yes we stop here.
			if ( stackRowHeader ) {
				theadRowStack.push( row );
				return;
			}

			// Add the last colgroup
			row.colgroup.push( colgroup );

			//
			// Diggest the row
			//
			if ( lastCellType === "th" ) {

				// Digest the row header
				row.type = 1;

				//
				// Check the validity of this header row
				//

				if ( row.colgroup.length === 2 && currentRowPos === 1 ) {

					// Check if the first is a data colgroup with only one cell
					if ( row.colgroup[ 0 ].type === 2 && row.colgroup[ 0 ].cell.length === 1 ) {

						// Valid row header for the row group header

						// REQUIRED: That cell need to be empty
						if ( $( row.colgroup[ 0 ].cell [ 0 ].elem ).html().length === 0 ) {

							// We stack the row
							theadRowStack.push( row );

							// We do not go further
							return;
						}
						$obj.trigger( {
							type: warningEvent,
							pointer: $obj,
							err: 17
						} );
					} else {

						// Invalid row header
						$obj.trigger( {
							type: warningEvent,
							pointer: $obj,
							err: 18
						} );
					}
				}

				if ( row.colgroup.length === 1 ) {
					if ( row.colgroup[ 0 ].cell.length > 1 ) {

						// this is a row associated to a header row group
						if ( !headerRowGroupCompleted ) {

							// Good row, stack the row
							theadRowStack.push( row );

							// We do not go further
							return;
						}

						// Bad row, remove the row or split the table
						$obj.trigger( {
							type: warningEvent,
							pointer: $obj,
							err: 18
						} );
					} else {
						if ( currentRowPos !== 1 || row.cell[ 0 ].uid === row.cell[ row.cell.length - 1 ].uid ) {

							// Stack the row found for the rowgroup header
							rowgroupHeaderRowStack.push( row );

							// This will be processed on the first data row
							// End of any header row group (thead)
							headerRowGroupCompleted = true;

							return;
						}
						$obj.trigger( {
							type: warningEvent,
							pointer: $obj,
							err: 18
						} );
					}
				}

				if ( row.colgroup.length > 1 && currentRowPos !== 1 ) {
					$obj.trigger( {
						type: warningEvent,
						pointer: $obj,
						err: 21
					} );
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
				if ( rowgroupHeaderRowStack.length > 0 && row.cell[ 0 ].uid === row.cell[ row.cell.length - 1 ].uid ) {

					// Horay this row are a description cell for the preceding heading

					row.type = 5;
					row.cell[ 0 ].type = 5;
					row.cell[ 0 ].row = row;
					if ( !row.cell[ 0 ].describe ) {
						row.cell[ 0 ].describe = [];
					}
					rowgroupHeaderRowStack[ rowgroupHeaderRowStack.length - 1 ].cell[ 0 ].descCell = row.cell[ 0 ];
					row.cell[ 0 ].describe.push( rowgroupHeaderRowStack[ rowgroupHeaderRowStack.length - 1 ].cell[ 0 ] );
					if ( !groupZero.desccell ) {
						groupZero.desccell = [];
					}
					groupZero.desccell.push( row.cell[ 0 ] );

					// FYI - We do not push this row in any stack because this row is a description row

					// Stop the processing for this row
					return;
				}

				//
				// Process any row used to defined the rowgroup label
				//
				if ( rowgroupHeaderRowStack.length > 0 || !currentRowGroup.type ) {
					rowgroupSetup();
				}
				row.type = currentRowGroup.type;
				row.level = currentRowGroup.level;

				if ( colgroupFrame[ 0 ] && lastHeadingColPos && colgroupFrame[ 0 ].end !== lastHeadingColPos && colgroupFrame[ 0 ].end === ( lastHeadingColPos + 1 ) ) {

					// Adjust if required, the lastHeadingColPos if colgroup are present, that would be the first colgroup
					lastHeadingColPos += 1;
				}
				row.lastHeadingColPos = lastHeadingColPos;
				if ( !currentRowGroup.lastHeadingColPos ) {
					currentRowGroup.lastHeadingColPos = lastHeadingColPos;
				}
				if ( !previousDataHeadingColPos ) {
					previousDataHeadingColPos = lastHeadingColPos;
				}
				row.rowgroup = currentRowGroup;

				if ( currentRowGroup.lastHeadingColPos !== lastHeadingColPos ) {
					if ( ( !lastHeadingSummaryColPos && currentRowGroup.lastHeadingColPos < lastHeadingColPos ) || ( lastHeadingSummaryColPos && lastHeadingSummaryColPos === lastHeadingColPos ) ) {

						// This is a virtual summary row group

						// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
						$.each( spannedRow, function() {
							if ( this && this.spanHeight > 0 ) {

								// That row are spanned in 2 different row group
								$obj.trigger( {
									type: warningEvent,
									pointer: this,
									err: 29
								} );
							}
						} );

						// Cleanup of any spanned row
						spannedRow = [];

						// Remove any rowgroup header found.
						rowgroupHeaderRowStack = [];

						finalizeRowGroup();

						currentRowGroupElement = undefined;
						initiateRowGroup();
						rowgroupSetup();

						// Reset the current row type
						row.type = currentRowGroup.type;

					} else if ( lastHeadingSummaryColPos && previousDataHeadingColPos === lastHeadingColPos ) {

						// This is a virtual data row group

						// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
						$.each( spannedRow, function() {
							if ( this && this.spanHeight > 0 ) {

								// That row are spanned in 2 different row group
								$obj.trigger( {
									type: warningEvent,
									pointer: this,
									err: 29
								} );
							}
						} );

						// Cleanup of any spanned row
						spannedRow = [];

						// Remove any rowgroup header found.
						rowgroupHeaderRowStack = [];

						finalizeRowGroup();

						currentRowGroupElement = undefined;
						initiateRowGroup();
						rowgroupSetup( true );

						// Reset the current row type
						row.type = currentRowGroup.type;

						$obj.trigger( {
							type: warningEvent,
							pointer: row.elem,
							err: 34
						} );

					} else {
						$obj.trigger( {
							type: warningEvent,
							pointer: $obj,
							err: 32
						} );
					}
				}
				if ( !currentRowGroup.lastHeadingColPos ) {
					currentRowGroup.lastHeadingColPos = lastHeadingColPos;
				}

				if ( currentRowGroup.type === 3 && !lastHeadingSummaryColPos ) {
					lastHeadingSummaryColPos = lastHeadingColPos;
				}

				// Build the initial colgroup structure
				// If an cell header exist in that row....
				if ( lastHeadingColPos ) {

					// Process the heading colgroup associated to this row.
					headingRowCell = [];

					rowheader = undefined; /* This is the most precise cell header for this row */
					colKeyCell = [];

					for ( i = 0; i < lastHeadingColPos; i += 1 ) {

						// Check for description cell or key cell
						if ( row.cell[ i ].elem.nodeName.toLowerCase() === "td" ) {

							if ( !row.cell[ i ].type && row.cell[ i - 1 ] && !( row.cell[ i - 1 ].descCell ) && row.cell[ i - 1 ].type === 1 && row.cell[ i - 1 ].height === row.cell[ i ].height ) {
								row.cell[ i ].type = 5;
								row.cell[ i - 1 ].descCell = row.cell[ i ];

								if ( !row.cell[ i ].describe ) {
									row.cell[ i ].describe = [];
								}
								row.cell[ i ].describe.push( row.cell[ i - 1 ] );

								if ( !row.desccell ) {
									row.desccell = [];
								}
								row.desccell.push( row.cell[ i ] );

								if ( !groupZero.desccell ) {
									groupZero.desccell = [];
								}
								groupZero.desccell.push( row.cell[ i ] );

								// Specify the scope of this description cell
								row.cell[ i ].scope = "row";
							}

							// Check if this cell can be an key cell associated to an cell heading
							if ( !row.cell[ i ].type ) {
								colKeyCell.push( row.cell[ i ] );
							}
						}

						// Set for the most appropriate header that can represent this row
						if ( row.cell[ i ].elem.nodeName.toLowerCase() === "th" ) {

							// Mark the cell to be an header cell
							row.cell[ i ].type = 1;
							row.cell[ i ].scope = "row";
							if ( rowheader && rowheader.uid !== row.cell[ i ].uid ) {
								if ( rowheader.height >= row.cell[ i ].height ) {
									if ( rowheader.height === row.cell[ i ].height ) {
										$obj.trigger( {
											type: warningEvent,
											pointer: $obj,
											err: 23
										} );
									}

									// The current cell are a child of the previous rowheader
									if ( !rowheader.subheader ) {
										rowheader.subheader = [];
										rowheader.isgroup = true;
									}
									rowheader.subheader.push( row.cell[ i ] );

									// Change the current row header
									rowheader = row.cell[ i ];
									headingRowCell.push( row.cell[ i ] );
								} else {

									// This case are either paralel heading of growing header, this are an error.
									$obj.trigger( {
										type: warningEvent,
										pointer: $obj,
										err: 24
									} );
								}
							}
							if ( !rowheader ) {
								rowheader = row.cell[ i ];
								headingRowCell.push( row.cell[ i ] );
							}
							for ( j = 0; j < colKeyCell.length; j += 1 ) {
								if ( !( colKeyCell[ j ].type ) && !( row.cell[ i ].keycell ) && colKeyCell[ j ].height === row.cell[ i ].height ) {
									colKeyCell[ j ].type = 4;
									row.cell[ i ].keycell = colKeyCell[ j ];

									if ( !row.keycell ) {
										row.keycell = [];
									}
									row.keycell.push( colKeyCell[ j ] );

									if ( !groupZero.keycell ) {
										groupZero.keycell = [];
									}
									groupZero.keycell.push( colKeyCell[ j ] );

									if ( !colKeyCell[ j ].describe ) {
										colKeyCell[ j ].describe = [];
									}
									colKeyCell[ j ].describe.push( row.cell[ i ] );
								}
							}
						}
					}

					// All the cell that have no "type" in the colKeyCell collection are problematic cells
					$.each( colKeyCell, function() {
						if ( !( this.type ) ) {
							$obj.trigger( {
								type: warningEvent,
								pointer: $obj,
								err: 25
							} );
							if ( !row.errorcell ) {
								row.errorcell = [];
							}
							row.errorcell.push( this );
						}
					} );
					row.header = headingRowCell;
				} else {

					// There are only at least one colgroup,
					// Any colgroup tag defined but be equal or greater than 0.
					// if colgroup tag defined, they are all data colgroup.
					lastHeadingColPos = 0;

					if ( colgroupFrame.length === 0 ) {
						processColgroup( undefined, tableCellWidth );
					}
				}

				//
				// Process the table row heading and colgroup if required
				//
				processRowgroupHeader( lastHeadingColPos );

				row.headerset = ( currentRowGroup.headerlevel || [] );

				if ( lastHeadingColPos !== 0 ) {
					lastHeadingColPos = colgroupFrame[ 0 ].end;  /* colgroupFrame must be defined here */
				}

				//
				// Associate the data cell type with the colgroup if any,
				// Process the data cell. There are a need to have at least one data cell per data row.
				if ( !row.datacell ) {
					row.datacell = [];
				}
				for ( i = lastHeadingColPos; i < row.cell.length; i += 1 ) {
					isDataColgroupType = true;

					for ( j = ( lastHeadingColPos === 0 ? 0 : 1 ); j < colgroupFrame.length; j += 1 ) {

						// If colgroup, the first are always header colgroup
						if ( colgroupFrame[ j ].start <= row.cell[ i ].colpos && row.cell[ i ].colpos <= colgroupFrame[ j ].end ) {
							if ( row.type === 3 || colgroupFrame[ j ].type === 3 ) {
								row.cell[ i ].type = 3; /* Summary Cell */
							} else {
								row.cell[ i ].type = 2;
							}

							// Test if this cell is a layout cell
							if ( row.type === 3 && colgroupFrame[ j ].type === 3 && ( $( row.cell[ i ].elem ).text().length === 0 ) ) {
								row.cell[ i ].type = 6;
								if ( !groupZero.layoutCell ) {
									groupZero.layoutCell = [];
								}
								groupZero.layoutCell.push( row.cell[ i ] );
							}

							row.cell[ i ].collevel = colgroupFrame[ j ].level;
							row.datacell.push( row.cell[ i ] );
						}
						isDataColgroupType = !isDataColgroupType;
					}

					if ( colgroupFrame.length === 0 ) {

						// There are no colgroup definition, this cell are set to be a datacell
						row.cell[ i ].type = 2;
						row.datacell.push( row.cell[ i ] );
					}

					// Add row header when the cell is span into more than one row
					if ( row.cell[ i ].rowpos < currentRowPos ) {
						if ( !row.cell[ i ].addrowheaders ) {

							// addrowheaders for additional row headers
							row.cell[ i ].addrowheaders = [];
						}
						if ( row.header ) {
							for ( j = 0; j < row.header.length; j += 1 ) {
								if ( ( row.header[ j ].rowpos === currentRowPos && row.cell[ i ].addrowheaders.length === 0 ) || ( row.header[ j ].rowpos === currentRowPos && row.cell[ i ].addrowheaders[ row.cell[ i ].addrowheaders.length - 1 ].uid !== row.header[ j ].uid ) ) {

									// Add the current header
									row.cell[ i ].addrowheaders.push( row.header[ j ] );
								}
							}
						}
					}
				}

				// Add the cell in his appropriate column
				if ( !groupZero.col ) {
					groupZero.col = [];
				}

				for ( i = 0; i < groupZero.col.length; i += 1 ) {
					for ( j = ( groupZero.col[ i ].start - 1 ); j < groupZero.col[ i ].end; j += 1  ) {
						if ( !groupZero.col[ i ].cell ) {
							groupZero.col[ i ].cell = [];
						}

						// Be sure to do not include twice the same cell for a column spanned in 2 or more column
						if ( !( j > ( groupZero.col[ i ].start - 1 ) && groupZero.col[ i ].cell[ groupZero.col[ i ].cell.length - 1 ].uid === row.cell[ j ].uid ) ) {
							if ( row.cell[ j ] ) {
								groupZero.col[ i ].cell.push( row.cell[ j ] );
								if ( !row.cell[ j ].col ) {
									row.cell[ j ].col = groupZero.col[ i ];
								}
							} else {
								$obj.trigger( {
									type: warningEvent,
									pointer: $obj,
									err: 35
								} );
							}
						}
					}
				}

				// Associate the row with the cell and Colgroup/Col association
				for ( i = 0; i < row.cell.length; i += 1 ) {
					if ( !row.cell[ i ].row ) {
						row.cell[ i ].row = row;
					}
					row.cell[ i ].rowlevel = currentRowGroup.level;
					row.cell[ i ].rowlevelheader = currentRowGroup.headerlevel;
					row.cell[ i ].rowgroup = currentRowGroup;

					if ( i > 0 && row.cell[ i - 1 ].uid === row.cell[ i ].uid && row.cell[ i ].type !== 1 && row.cell[ i ].type !== 5 && row.cell[ i ].rowpos === currentRowPos && row.cell[ i ].colpos <= i ) {
						if ( !row.cell[ i ].addcolheaders ) {

							// addcolheaders for additional col headers
							row.cell[ i ].addcolheaders = [];
						}

						// Add the column header if required
						if ( groupZero.col[ i ] && groupZero.col[ i ].header ) {
							for ( j = 0; j < groupZero.col[ i ].header.length; j += 1 ) {
								if ( groupZero.col[ i ].header[ j ].colpos === ( i + 1 ) ) {

									// Add the current header
									row.cell[ i ].addcolheaders.push( groupZero.col[ i ] .header[ j ] );
								}
							}
						}
					}
				}
			}

			// Add the row to the groupZero
			if ( !groupZero.row ) {
				groupZero.row = [];
			}
			groupZero.row.push( row );
			currentRowGroup.row.push( row );

			delete row.colgroup;
		} /* End processRow function */

		// Add headers information to the table parsed data structure
		// Similar sample of code as the HTML Table validator
		function addHeaders( tblparser ) {
			var headStackLength = tblparser.theadRowStack.length,
				addColHeadersLength, addRowHeadersLength,
				cellHeaderLength, cellLength, childLength, coldataheader,
				colheaders, colheadersgroup, currCell, currCol, currRow,
				currrowheader, headerLength, headerLevelLength, i, j, k, m, ongoingRowHeader, ongoingRowHeaderLength,
				rowheaders,
				rowheadersgroup, rowLength;

			// Set ID and Header for the table head
			for ( i = 0; i < headStackLength; i += 1 ) {
				currRow = tblparser.theadRowStack[ i ];

				for ( j = 0, cellLength = currRow.cell.length; j < cellLength; j += 1 ) {
					currCell = currRow.cell[ j ];

					if ( ( currCell.type === 1 || currCell.type === 7 ) && (
							!( j > 0 && currCell.uid === currRow.cell[ j - 1 ].uid ) &&
							!( i > 0 && currCell.uid === tblparser.theadRowStack[ i - 1 ].cell[ j ].uid )
						) ) {

						// Imediate header
						currCell.header = currCell.header || [];

						// all the headers
						currCell.headers = currCell.headers || [];

						// Imediate sub cell
						currCell.child = currCell.child || [];

						// All the sub cell
						currCell.childs = currCell.childs || [];

						// Set the header of the current cell if required
						if ( i > 0 ) {

							// All the header cells
							for ( k = 0, cellHeaderLength = tblparser.theadRowStack[ i - 1 ].cell[ j ].header.length; k < cellHeaderLength; k += 1 ) {
								currCell.headers.push( tblparser.theadRowStack[ i - 1 ].cell[ j ].header[ k ] );
								tblparser.theadRowStack[ i - 1 ].cell[ j ].header[ k ].childs.push( currCell );
							}

							// Imediate header cell
							currCell.headers.push( tblparser.theadRowStack[ i - 1 ].cell[ j ] );
							currCell.header.push( tblparser.theadRowStack[ i - 1 ].cell[ j ] );
							tblparser.theadRowStack[ i - 1 ].cell[ j ].child.push( currCell );
						}

						// Set the header on his descriptive cell if any
						if ( currCell.descCell ) {
							currCell.descCell.header = currCell;
							currCell.descCell.headers = currCell;
						}
					}

				}

			}

			// Set Id/headers for header cell and data cell in the table.
			for ( i = 0, rowLength = tblparser.row.length; i < rowLength; i += 1 ) {
				currRow = tblparser.row[ i ];
				rowheadersgroup = [];
				rowheaders = [];
				currrowheader = [];
				ongoingRowHeader = [];
				coldataheader = [];

				// Get or Generate a unique ID for each header in this row
				if ( currRow.headerset && !currRow.idsheaderset ) {
					for ( j = 0; j < currRow.headerset.length; j += 1 ) {
						rowheadersgroup = rowheadersgroup.concat( currRow.headerset[ j ] );
					}
					currRow.idsheaderset = rowheadersgroup;
				}

				if ( currRow.header ) {
					for ( j = 0; j < currRow.header.length; j += 1 ) {
						rowheaders = rowheaders.concat( currRow.header[ j ] );
					}
				}
				rowheaders = currRow.idsheaderset.concat( rowheaders );
				for ( j = 0; j < currRow.cell.length; j += 1 ) {

					if ( j === 0 || ( j > 0 && currRow.cell[ j ].uid !== currRow.cell[ ( j - 1 ) ].uid ) ) {
						currCell = currRow.cell[ j ];
						coldataheader = [];

						// Imediate header
						currCell.header = currCell.header || [];

						// all the headers
						currCell.headers = currCell.headers || [];

						if ( currCell.col && !currCell.col.dataheader ) {
							currCol = currCell.col;
							colheaders = [];
							colheadersgroup = [];
							if ( currCol.headerLevel ) {
								for ( m = 0, headerLevelLength = currCol.headerLevel.length; m < headerLevelLength; m += 1 ) {
									colheadersgroup = colheadersgroup.concat( currCol.headerLevel[ m ] );
								}
							}
							if ( currCol.header ) {
								for ( m = 0, headerLength = currCol.header.length; m < headerLength; m += 1 ) {
									colheaders = colheaders.concat( currCol.header[ m ] );
								}
							}

							if ( !currCol.dataheader ) {
								currCol.dataheader = [];
							}

							currCol.dataheader = currCol.dataheader.concat( colheadersgroup );
							currCol.dataheader = currCol.dataheader.concat( colheaders );
						}

						if ( currCell.col && currCell.col.dataheader ) {
							coldataheader = currCell.col.dataheader;
						}

						if ( currCell.type === 1 ) {

							// Imediate sub cell
							currCell.child = currCell.child || [];

							// All the sub cell
							currCell.childs = currCell.childs || [];

							for ( m = 0, ongoingRowHeaderLength = ongoingRowHeader.length; m < ongoingRowHeaderLength; m += 1 ) {

								if ( currCell.colpos === ( ongoingRowHeader[ m ].colpos + ongoingRowHeader[ m ].width ) ) {
									childLength = ongoingRowHeader[ m ].child.length;
									if ( childLength === 0 || ( childLength > 0 && ongoingRowHeader[ m ].child[ childLength - 1 ].uid !== currCell.uid ) ) {
										ongoingRowHeader[ m ].child.push( currCell );
									}
								}
								ongoingRowHeader[ m ].childs.push( currCell );
							}

							for ( m = 0; m < currRow.idsheaderset.length; m += 1 ) {

								// All the sub cell
								if ( !currRow.idsheaderset[ m ].childs ) {
									currRow.idsheaderset[ m ].childs = [];
								}
								currRow.idsheaderset[ m ].childs.push( currCell );
							}

							currCell.header = currCell.header.concat( ongoingRowHeader );

							currCell.headers = currCell.headers.concat( coldataheader )
								.concat( currRow.idsheaderset )
								.concat( ongoingRowHeader );

							ongoingRowHeader = ongoingRowHeader.concat( currCell );
						}

						if ( currCell.type === 2 || currCell.type === 3 ) {

							// Get Current Column Headers
							currrowheader = rowheaders;

							if ( currCell.addcolheaders ) {
								for ( m = 0, addColHeadersLength = currCell.addcolheaders.length; m < addColHeadersLength; m += 1 ) {
									coldataheader = coldataheader.concat( currCell.addcolheaders[ m ] );
								}
							}

							if ( currCell.addrowheaders ) {
								for ( m = 0, addRowHeadersLength = currCell.addrowheaders.length; m < addRowHeadersLength; m += 1 ) {
									currrowheader = currrowheader.concat( currCell.addrowheaders[ m ] );
								}
							}

							currCell.headers = currCell.headers.concat( coldataheader )
								.concat( currrowheader );

							currCell.header = currCell.headers;
						}
					}
				}
			}
		} /* END addHeaders function*/

		//
		// Main Entry For The Table Parsing
		//
		if ( hasTfoot ) {

			// If there is a tfoot element, be sure to add it at the end of all the tbody. FYI - HTML 5 spec allow now tfoot to be at the end
			$( "tfoot", $obj ).appendTo( $( "tbody:last", $obj ).parent() );
		}
		$obj.children().each( function() {
			var $this = $( this ),
				nodeName = this.nodeName.toLowerCase();

			if ( nodeName === "caption" ) {
				processCaption( this );
			} else if ( nodeName === "colgroup" ) {
				processColgroup( this );
			} else if ( nodeName === "thead" ) {
				currentRowGroupElement = this;

				// The table should not have any row at this point
				if ( theadRowStack.length !== 0 || ( groupZero.row && groupZero.row.length > 0 ) ) {
					$obj.trigger( {
						type: warningEvent,
						pointer: this,
						err: 26
					} );
				}

				$( this ).data( "tblparser", groupZero );
				stackRowHeader = true;

				// This is the rowgroup header, Colgroup type can not be defined here
				$( this ).children().each( function() {
					if ( this.nodeName.toLowerCase() !== "tr" ) {

						// ERROR
						$obj.trigger( {
							type: warningEvent,
							pointer: this,
							err: 27
						} );
					}
					processRow( this );
				} );

				stackRowHeader = false;

				// Here it"s not possible to Diggest the thead and the colgroup because we need the first data row to be half processed before
			} else if ( nodeName === "tbody" || nodeName === "tfoot" ) {

				if ( nodeName === "tfoot" ) {
					tfootOnProcess = true;
				}

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

				// New row group
				$this.children().each( function() {
					if ( this.nodeName.toLowerCase() !== "tr" ) {

						// ERROR
						$obj.trigger( {
							type: warningEvent,
							pointer: this,
							err: 27
						} );
						return;
					}
					processRow( this );
				} );

				finalizeRowGroup();

				// Check for residual rowspan, there can not have cell that overflow on two or more rowgroup
				$.each( spannedRow, function() {
					if ( this && this.spanHeigh && this.spanHeight > 0 ) {

						// That row are spanned in 2 different row group
						$obj.trigger( {
							type: warningEvent,
							pointer: this,
							err: 29
						} );
					}
				} );

				spannedRow = []; /* Cleanup of any spanned row */
				rowgroupHeaderRowStack = []; /* Remove any rowgroup header found. */

			} else if ( nodeName === "tr" ) {

				// This are suppose to be a simple table
				processRow( this );
			} else {

				// There is a DOM Structure error
				$obj.trigger( {
					type: errorEvent,
					pointer: this,
					err: 30
				} );
			}
		} );

		groupZero.theadRowStack = theadRowStack;

		delete groupZero.colgroupFrame;
		groupZero.colgrouplevel = groupZero.colgrp;
		delete groupZero.colgrp;

		addHeaders( groupZero );

		$obj.trigger( "parsecomplete" + selector );
	};

// Bind the init event of the plugin on passive table parsing request
$document.on( "passiveparse" + selector, init );

} )( jQuery, window, document, wb );
