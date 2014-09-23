/*!
 * Web Experience Toolkit ( WET ) / Boîte à outils de l'expérience Web ( BOEW )
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/**
 * Table Validation - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, alert: false */
( function( $, wb ) {
	"use strict";

	var componentName = "wb-tblvalidator",
		selector = "." + componentName,
		tableParserSelector = ".wb-tableparser",
		tableParsingEvent = "passiveparse" + tableParserSelector,
		tableParsingCompleteEvent = "parsecomplete" + tableParserSelector,
		$document = wb.doc,
		addidheadersEvent = "idsheaders" + selector,
		addscopeEvent = "scope" + selector,
		addnothingEvent = "simple" + selector,
		showHTMLEvent = "showhtml" + selector,
		logEvent = "log" + selector,
		formSelector = "#formtablevalidator",
		ErrorMessage = {
				"%tblparser1":  "Only table can be parsed with this parser",
				"%tblparser2":  "The table was already parsed.",
				"%tblparser3":  "The first colgroup must be spanned to represent the header column group",
				"%tblparser3Tech": 6,
				"%tblparser4":  " You have an invalid cell inside a row description",
				"%tblparser4Tech": 4,
				"%tblparser5":  "You need at least one data colgroup, review your table structure",
				"%tblparser5Tech": 8,
				"%tblparser6":  "The Lowest column group level have been found, You may have an error in you column structure",
				"%tblparser6Tech": 9,
				"%tblparser7":  "The initial colgroup should group all the header, there are no place for any data cell",
				"%tblparser7Tech": 4,
				"%tblparser9":  "Error in you header row group, there are cell that are crossing more than one colgroup",
				"%tblparser9Tech": 4,
				"%tblparser10":  "The header group cell used to represent the data at level must encapsulate his group",
				"%tblparser10Tech": 7,
				"%tblparser12":  "Last summary row group already found",
				"%tblparser12Tech": 3,
				"%tblparser13":  "Error, Row group not calculated",
				"%tblparser14":  "You can not have a summary at level under 0, add a group header or merge a tbody togheter",
				"%tblparser14Tech": 3,
				"%tblparser15":  "tr element need to only have th or td element as his child",
				"%tblparser16":  "The row do not have a good width",
				"%tblparser16Tech": 12,
				"%tblparser17":  "The layout cell is not empty",
				"%tblparser17Tech": 11,
				"%tblparser18":  "Row group header not well structured.",
				"%tblparser18Tech": 7,
				"%tblparser21":  "Move the row used as the column cell heading in the thead row group",
				"%tblparser21Tech": 7,
				"%tblparser23":  "Avoid the use of have paralel row headers, it's recommended do a cell merge to fix it",
				"%tblparser23Tech": 3,
				"%tblparser24":  "For a data row, the heading hiearchy need to be the Generic to the specific",
				"%tblparser24Tech": 3,
				"%tblparser25":  "You have a problematic key cell",
				"%tblparser25Tech": 0,
				"%tblparser26":  "You can not define any row before the thead group",
				"%tblparser26Tech": 12,
				"%tblparser27":  "thead element need to only have tr element as his child",
				"%tblparser27Tech": 12,
				"%tblparser29":  "You cannot span cell in 2 different rowgroup",
				"%tblparser29Tech": 12,
				"%tblparser30":  "Use the appropriate table markup",
				"%tblparser30Tech": 12,
				"%tblparser31":  "Internal Error, Number of virtual column must be set [ function processColgroup( ) ]",
				"%tblparser32":  "Check your row cell headers structure",
				"%tblparser32Tech": 3,
				"%tblparser34":  "Mark properly your data row group.",
				"%tblparser34Tech": 1,
				"%tblparser35":  "Column, col element, are not correctly defined",
				"%tblparser35Tech": 12 },
		techniqueURL = [
				"keycell-techniques.html", // 1
				"rowgrouping-techniques.html", // 2
				"summariesrowgroup-techniques.html", // 3
				"headerrowgroupstructure-techniques.html", // 4
				"rowheader-description-techniques.html", // 5
				"rowgroupheader-description-techniques.html", // 6
				"colgroupheader-techniques.html", // 7
				"headercolgroupstructure-techniques.html", // 8
				"datacolgroup-techniques.html", // 9
				"colgroupsummary-techniques.html", // 10
				"colheader-description-techniques.html", // 11
				"layoutcell-techniques.html", // 12
				"http://www.w3.org/TR/html5/spec.html" ], // 13
			techniqueName = [
				"Defining a Key Cell", // 1
				"Defining a Data Row Group in a Data Table", // 2
				"Summaries a Data Row Group in a Data Table", // 3
				"Structuring the Header Row in a Data Table", // 4
				"Describing a Row Header Cell in a Data Table", // 5
				"Describing a Row Group Header Cell in a Data Table", // 6
				"Defining Column Group Header in a Data Table", // 7
				"Structuring the Header Column Cell in a Data Table", // 8
				"Defining a Data Column Group in a Data Table", // 9
				"Summaries a Data Column Group in a Data Table", // 10
				"Describing a Column Header Cell in a Data Table", // 11
				"Defining a Layout Cell in a Data Table", // 12
				"HTML5 Specification" ] // 13;
		;

// Prevent any form to submit
$document.on( "submit", formSelector, function( ) {
	return false;
});

// Take the source code of the HTML table to be encoded and displayed
$document.on( showHTMLEvent, "#visualoutput > table:eq( 0 )", function( event ) {
	var elm = event.target,
		$elm,
		$output = $( "#results" ),
		tableHTMLstring;

	if ( event.currentTarget !== elm ) {
		return true;
	}
	$elm = $( elm );

	tableHTMLstring = ( "<table>" + $elm.html( ) + "</table>" ).replace( /<col>/g, "<col />" ).replace( /<br>/g, "<br />" ).replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /"/g, "&quot;" );

	// Show the result
	$output.html( "<pre class='prettyprint'><code>" + tableHTMLstring  + "</code></pre>" );

	if ( typeof window.prettyPrint === "function" ) {
		window.prettyPrint( );
	}

	$( formSelector ).trigger( {
			type: logEvent,
			logtype: "Information",
			logmessage: "Result Displayed"
		}
	);
} );

// Check the minimum accessibility requirement
$document.on( addidheadersEvent, "#visualoutput > table:eq( 0 )", function( event ) {
	var elm = event.target,
		$elm, options,
		tblparser,
		i,
		m,
		colgroupelem,
		currCellId,
		tblelement = $elm,
		j,
		currRow,
		currCell,
		idPrefix,
		resetIds = false,
		headersCurrCell,
		currCellDescId,
		rowheadersgroup,
		rowheaders,
		currrowheader,
		ongoingRowHeader,
		coldataheader,
		currCol,
		colheaders,
		colheadersgroup,
		currDescCellId,
		previousColgroup = false,
		column,
		currCellId5,
		descHeaders;

	if ( event.currentTarget !== elm ) {
		return true;
	}

	$( formSelector ).trigger( {
			type: logEvent,
			logtype: "Information",
			logmessage: "Accessibility Strategy: Ids/Headers"
		}
	);

	$elm = $( elm );
	tblparser = $elm.data( ).tblparser;

	options = $elm.data( ).wbvalidateoptions;

	idPrefix = options.prefix || "wb-tablevalidated";

	// Set ID and Header for the table head
	for ( i = 0; i < tblparser.theadRowStack.length; i += 1 ) {
		currRow = tblparser.theadRowStack[ i ];

		for ( j = 0; j < currRow.cell.length; j += 1 ) {
			currCell = currRow.cell[ j ];

			if ( ( currCell.type === 1 || currCell.type === 7 ) && (
					!( j > 0 && currCell.uid === currRow.cell[ j - 1 ].uid ) &&
					!( i > 0 && currCell.uid === tblparser.theadRowStack[ i - 1 ].cell[ j ].uid )
				) ) {

				// If there no id, add an uid
				currCellId = $( currCell.elem ).attr( "id" );
				if ( currCellId === undefined || currCellId === "" || resetIds ) {
					// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
					currCellId = idPrefix + currCell.uid; // Generate a new ID
					$( currCell.elem ).attr( "id", currCellId );
				}

				// Set the header of the current cell if required
				if ( i > 0 ) {
					headersCurrCell = $( tblparser.theadRowStack[ i - 1 ].cell[ j ].elem ).attr( "id" );

					if ( $( tblparser.theadRowStack[ i - 1 ].cell[ j ].elem ).attr( "headers" ) !== undefined ) {
						headersCurrCell = $( tblparser.theadRowStack[ i - 1 ].cell[ j ].elem ).attr( "headers" ) + " " + headersCurrCell;
					}
					$( currCell.elem ).attr( "headers", headersCurrCell );
					if ( $( currCell.elem ).attr( "headers" ) === undefined || $( currCell.elem ).attr( "headers" ) === "" ) {
						$( currCell.elem ).removeAttr( "headers" );
					}
				}

				// Set the header on his descriptive cell is any ( May be better aria-describedby
				if ( currCell.descCell ) {
					$( currCell.descCell.elem ).attr( "headers", currCellId );
					if ( $( currCell.descCell.elem ).attr( "headers" ) === undefined || $( currCell.descCell.elem ).attr( "headers" ) === "" ) {
						$( currCell.descCell.elem ).removeAttr( "headers" );
					}
					currCellDescId = $( currCell.descCell.elem ).attr( "id" );
					if ( currCellDescId === undefined || currCellDescId === "" || resetIds ) {
						// currCellDescId = idPrefix + new Date( ).getTime( ) + currCell.descCell.uid; // Generate a new ID
						$( currCell.descCell.elem ).attr( "id", currCellDescId );
					}
					$( currCell.elem ).attr( "aria-describedby", currCellDescId );
				}
			}
		}
	}

	// Set Id/headers for header cell and data cell in the table.
	for ( i = 0; i < tblparser.row.length; i += 1 ) {
		currRow = tblparser.row[ i ];
		rowheadersgroup = "";
		rowheaders = "";
		currrowheader = "";
		ongoingRowHeader = "";

		// Get or Generate a unique ID for each header in this row
		if ( currRow.headerset && !currRow.idsrowheaders ) {
			for ( j = 0; j < currRow.headerset.length; j += 1 ) {
				currCellId = $( currRow.headerset[ j ].elem ).attr( "id" );
				if ( currCellId === undefined || currCellId === "" || resetIds ) {
					// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
					currCellId = idPrefix + currRow.headerset[ j ].uid; // Generate a new ID
					$( currRow.headerset[ j ].elem ).attr( "id", currCellId );
				}
				rowheadersgroup = ( rowheadersgroup ? rowheadersgroup + " " + currCellId : currCellId );
			}
			currRow.idsrowheaders = rowheadersgroup;
		}

		if ( currRow.header ) {
			for ( j = 0; j < currRow.header.length; j += 1 ) {
				currCellId = $( currRow.header[ j ].elem ).attr( "id" );
				if ( currCellId === undefined || currCellId === "" || resetIds ) {
					// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
					currCellId = idPrefix + currRow.header[ j ].uid; // Generate a new ID
					$( currRow.header[ j ].elem ).attr( "id", currCellId );
				}
				rowheaders = ( rowheaders ? rowheaders + " " + currCellId : currCellId );
			}
		}
		rowheaders = ( currRow.idsrowheaders ? currRow.idsrowheaders + " " + rowheaders : rowheaders );
		for ( j = 0; j < currRow.cell.length; j += 1 ) {

			if ( !currRow.cell[ j ].processed && ( ( j === 0 ) || ( j > 0 && currRow.cell[ j ].uid !== currRow.cell[ j - 1 ].uid ) ) ) {
				currCell = currRow.cell[ j ];
				coldataheader = "";

				if ( currCell.col && !currCell.col.dataheaders ) {
					currCol = currCell.col;
					colheaders = "";
					colheadersgroup = "";
					if ( currCol.headerLevel ) {
						for ( m = 0; m < currCol.headerLevel.length; m += 1 ) {
							currCellId = $( currCol.headerLevel[ m ].elem ).attr( "id" );
							if ( currCellId === undefined || currCellId === "" || resetIds ) {
								// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
								currCellId = idPrefix + currCol.headerLevel[ m ].uid; // Generate a new ID
								$( currCol.headerLevel[ m ].elem ).attr( "id", currCellId );
							}
							colheadersgroup = ( colheadersgroup ? colheadersgroup + " " + currCellId : currCellId );
						}
					}
					if ( currCol.header ) {
						for ( m = 0; m < currCol.header.length; m += 1 ) {
							currCellId = $( currCol.header[ m ].elem ).attr( "id" );
							if ( currCellId === undefined || currCellId === "" || resetIds ) {
								// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
								currCellId = idPrefix + currCol.header[ m ].uid; // Generate a new ID
								$( currCol.header[ m ].elem ).attr( "id", currCellId );
							}
							colheaders = ( colheaders ? colheaders + " " + currCellId : currCellId );
						}
					}
					currCol.dataheaders = ( colheadersgroup ? colheadersgroup + " " + colheaders : colheaders );
				}

				if ( currCell.col && currCell.col.dataheaders ) {
					coldataheader = currCell.col.dataheaders;
					/*
					for ( var x = 0; x < currCell.col.dataheader.length; x += 1 ) {
						coldataheader = ( coldataheader ? " ": "" );
						coldataheader = $( currCell.col.dataheader[ x ].elem ).attr( "id" );
					}
					*/
				}

				if ( currCell.type === 1 ) {

					$( currCell.elem ).attr( "headers", ( coldataheader ? coldataheader : "" ) +
										( currRow.idsrowheaders && coldataheader ? " " : "" ) +
										( currRow.idsrowheaders ? currRow.idsrowheaders : "" ) +
										( ( currRow.idsrowheaders && ongoingRowHeader ) || ( coldataheader && ongoingRowHeader && !currRow.idsrowheaders ) ? " " : "" ) +
										( ongoingRowHeader ? ongoingRowHeader : "" ) );

					if ( $( currCell.elem ).attr( "headers" ) === undefined || $( currCell.elem ).attr( "headers" ) === "" ) {
						$( currCell.elem ).removeAttr( "headers" );
					}

					currCellId5 = $( currCell.elem ).attr( "id" );
					if ( currCellId5 === undefined || currCellId5 === "" || resetIds ) {
						// currCellId5 = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
						currCellId5 = idPrefix + currCell.uid; // Generate a new ID
						$( currCell.elem ).attr( "id", currCellId5 );
					}

					ongoingRowHeader = ( ongoingRowHeader !== "" ? ongoingRowHeader + " " : "" ) + currCellId5;
				}

				if ( currCell.type === 2 || currCell.type === 3 ) {

					// Get Current Column Headers
					currrowheader = rowheaders;

					if ( currCell.addcolheaders ) {
						for ( m = 0; m < currCell.addcolheaders.length; m += 1 ) {
							currCellId = $( currCell.addcolheaders[ m ].elem ).attr( "id" );
							if ( currCellId === undefined || currCellId === "" || resetIds ) {
								// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
								currCellId = idPrefix + currCell.addcolheaders[ m ].uid; // Generate a new ID
								$( currCell.addcolheaders[ m ].elem ).attr( "id", currCellId );
							}
							coldataheader = ( coldataheader ? coldataheader + " " + currCellId : currCellId );
						}
					}

					if ( currCell.addrowheaders ) {
						for ( m = 0; m < currCell.addrowheaders.length; m += 1 ) {
							currCellId = $( currCell.addrowheaders[ m ].elem ).attr( "id" );
							if ( currCellId === undefined || currCellId === "" || resetIds ) {
								// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
								currCellId = idPrefix + currCell.addrowheaders[ m ].uid; // Generate a new ID
								$( currCell.addrowheaders[ m ].elem ).attr( "id", currCellId );
							}
							currrowheader = ( currrowheader ? currrowheader + " " + currCellId : currCellId );
						}
					}

					$( currCell.elem ).attr( "headers", ( coldataheader ? coldataheader : "" ) + ( currrowheader && coldataheader ? " " : "" ) + ( currrowheader ? currrowheader : "" ) );
					if ( $( currCell.elem ).attr( "headers" ) === undefined || $( currCell.elem ).attr( "headers" ) === "" ) {
						$( currCell.elem ).removeAttr( "headers" );
					}
				}

				if ( currCell.type === 4 || currCell.type === 5 ) {
					descHeaders = "";

					if ( currCell.describe ) {
						for ( m = 0; m < currCell.describe.length; m += 1 ) {
							currCellId = $( currCell.describe[ m ].elem ).attr( "id" );
							if ( currCellId === undefined || currCellId === "" || resetIds ) {
								// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
								currCellId = idPrefix + currCell.describe[ m ].uid; // Generate a new ID
								$( currCell.describe[ m ].elem ).attr( "id", currCellId );
							}
							descHeaders = ( descHeaders ? descHeaders + " " + currCellId : currCellId );
							if ( currCell.type === 5 && !$( currCell.describe[ m ].elem ).attr( "aria-describedby" ) ) {
								currCellId = $( currCell.elem ).attr( "id" );
								if ( currCellId === undefined || currCellId === "" || resetIds ) {
									// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
									currCellId = idPrefix + currCell.uid; // Generate a new ID
									$( currCell.elem ).attr( "id", currCellId );
								}
								$( currCell.describe[ m ].elem ).attr( "aria-describedby", currCellId );
							}
						}
					}
					if ( currCell.type !== 4 ) {
						$( currCell.elem ).attr( "headers", ( coldataheader ? coldataheader : "" ) + ( coldataheader && descHeaders ? " " : "" ) + ( descHeaders || "" ) );
						if ( $( currCell.elem ).attr( "headers" ) === undefined || $( currCell.elem ).attr( "headers" ) === "" ) {
							$( currCell.elem ).removeAttr( "headers" );
						}
					} else if ( !$( currCell.elem ).attr( "aria-describedby" ) ) {
						$( currCell.elem ).attr( "aria-describedby", descHeaders || "" );
						$( currCell.elem ).attr( "headers", coldataheader || "" );
						if ( $( currCell.elem ).attr( "headers" ) === undefined || $( currCell.elem ).attr( "headers" ) === "" ) {
							$( currCell.elem ).removeAttr( "headers" );
						}
					}
				}

				currCell.processed = true;
			}
		}
	}

	// Check for any description that are related to the an group header cell
	for ( i = 0; i < tblparser.lstrowgroup.length; i += 1 ) {

		if ( tblparser.lstrowgroup[ i ].headerlevel.length > 0 ) {
			for ( j = 0; j < tblparser.lstrowgroup[ i ].headerlevel.length; j += 1 ) {

				if ( tblparser.lstrowgroup[ i ].headerlevel[ j ].descCell ) {
					// Set the aria-describedby
					currDescCellId = $( tblparser.lstrowgroup[ i ].headerlevel[ j ].descCell.elem ).attr( "id" );
					if ( currDescCellId === undefined || currDescCellId === "" || resetIds ) {
						// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
						currDescCellId = idPrefix + tblparser.lstrowgroup[ i ].headerlevel[ j ].descCell.uid; // Generate a new ID
						$( tblparser.lstrowgroup[ i ].headerlevel[ j ].descCell.elem ).attr( "id", currDescCellId );
					}
					$( tblparser.lstrowgroup[ i ].headerlevel[ j ].elem ).attr( "aria-describedby", currDescCellId );

					// Set the headers
					currCellId = $( tblparser.lstrowgroup[ i ].headerlevel[ j ].elem ).attr( "id" );
					if ( currCellId === undefined || currCellId === "" || resetIds ) {
						// currCellId = idPrefix + new Date( ).getTime( ) + currCell.uid; // Generate a new ID
						currCellId = idPrefix + tblparser.lstrowgroup[ i ].headerlevel[ j ].uid; // Generate a new ID
						$( tblparser.lstrowgroup[ i ].headerlevel[ j ].elem ).attr( "id", currCellId );
					}
					$( tblparser.lstrowgroup[ i ].headerlevel[ j ].descCell.elem ).attr( "headers", currCellId );
				}

			}
		}
	}

	// Horay, now all the table cell have theirs id/headers set as the table was parsed,
	// Suggestion: Add some aria-label to annonce the data summary, I will ask the WAI Interrest Mailing List to get some liable solution
	// tfoot question: do I force it as exclusive column summaries as the HTML5 spec define it if it used as table footnote ??
	// Add the missing tag if they are missing, "colgroup, col, thead, tbody", remove tfoot ????
	for ( i = 0; i < tblparser.colgroup.length; i += 1 ) {
		if ( tblparser.colgroup[ i ].elem === undefined ) {
			// Create a colgroup element
			colgroupelem = $( "<colgroup></colgroup>" );

			// Create the column
			for ( j = 0; j < tblparser.colgroup[ i ].col.length; j += 1 ) {
				column = $( "<col />" );
				$( colgroupelem ).append( column );
				tblparser.colgroup[ i ].col[ j ].elem = $( column ).get( 0 );
				$( column ).data( ).tblparser = tblparser.colgroup[ i ].col[ j ];
			}

			if ( previousColgroup ) {
				$( previousColgroup ).after( colgroupelem );
			} else {
				if ( $( tblelement ).has( "caption" ) ) {
					$( "caption:eq( 0 )", tblelement ).after( colgroupelem );
				} else {
					$( tblelement ).prepend( colgroupelem );
				}
			}
			previousColgroup = colgroupelem;

			tblparser.colgroup[ i ].elem = $( colgroupelem ).get( 0 );
			$( colgroupelem ).data( ).tblparser = tblparser.colgroup[ i ];
		} else {
			// Remove the span attribute if exist
			colgroupelem = tblparser.colgroup[ i ].elem;

			$( colgroupelem ).removeAttr( "span" );

			// Create the column
			for ( j = 0; j < tblparser.colgroup[ i ].col.length; j += 1 ) {
				if ( tblparser.colgroup[ i ].col[ j ].elem === undefined ) {
					column = $( "<col />" );
					$( colgroupelem ).append( column );
					tblparser.colgroup[ i ].col[ j ].elem = $( column ).get( 0 );
					$( column ).data( ).tblparser = tblparser.colgroup[ i ].col[ j ];
				}
			}

		}
	}
	$elm.trigger( showHTMLEvent );
} );

// Simple grougpin table
$document.on( addscopeEvent, "#visualoutput > table:eq( 0 )", function( event ) {
	var elm = event.target,
		$elm,
		tblparser,
		i, j;

	if ( event.currentTarget !== elm ) {
		return true;
	}

	$( formSelector ).trigger( {
			type: logEvent,
			logtype: "Information",
			logmessage: "Accessibility Strategy: Scope"
		}
	);

	$elm = $( elm );
	tblparser = $elm.data( ).tblparser;

	for ( i = 0; i < tblparser.lstrowgroup.length; i += 1 ) {
		if ( tblparser.lstrowgroup[ i ].headerlevel && tblparser.lstrowgroup[ i ].headerlevel[ 0 ] ) {
			$( tblparser.lstrowgroup[ i ].headerlevel[ 0 ].elem ).attr( "scope", "rowgroup" );
		}
		for ( j = 0; j < tblparser.lstrowgroup[ i ].row.length; j += 1 ) {
			if ( tblparser.lstrowgroup[ i ].row[ j ].cell[ 0 ].type === 1 ) {
				$( tblparser.lstrowgroup[ i ].row[ j ].cell[ 0 ].elem ).attr( "scope", "row" );
			}
		}
	}
	if ( tblparser.theadRowStack.length === 2 ) {
		if ( tblparser.colgroup[ 0 ].type === 1 ) {
			i = tblparser.colgroup[ 0 ].end;
		} else {
			i = 0;
		}
		for ( i; i < tblparser.theadRowStack[ 0 ].cell.length; i += 1 ) {
			if ( i === 0 || ( tblparser.theadRowStack[ 0 ].cell[ i - 1 ].uid !== tblparser.theadRowStack[ 0 ].cell[ i ].uid ) ) {
				$( tblparser.theadRowStack[ 0 ].cell[ i ].elem ).attr( "scope", "colgroup" );
			}
		}
	}
	if ( tblparser.theadRowStack.length === 1 || tblparser.theadRowStack.length === 2 ) {
		for ( i = 0; i < tblparser.theadRowStack[ ( tblparser.theadRowStack.length === 1 ? 0 : 1 ) ].cell.length; i += 1 ) {
			if ( tblparser.theadRowStack[ ( tblparser.theadRowStack.length === 1 ? 0 : 1 ) ].cell[ i ].type === 1 ) {
				$( tblparser.theadRowStack[ ( tblparser.theadRowStack.length === 1 ? 0 : 1 ) ].cell[ i ].elem ).attr( "scope", "col" );
			}
		}
	}
	$elm.trigger( showHTMLEvent );
} );

// Simple table
$document.on( addnothingEvent, "#visualoutput > table:eq( 0 )", function( event ) {
	var elm = event.target,
		$elm;

	if ( event.currentTarget !== elm ) {
		return true;
	}

	$( formSelector ).trigger( {
			type: logEvent,
			logtype: "Information",
			logmessage: "Accessibility Strategy: Nothing"
		}
	);

	$elm = $( elm );

	$elm.trigger( showHTMLEvent );

} );

// Check the minimum accessibility requirement
$document.on( tableParsingCompleteEvent, "#visualoutput > table:eq( 0 )", function( event ) {
	var elm = event.target,
		$elm, options,
		tblparser,
		i;

	if ( event.currentTarget !== elm ) {
		return true;
	}

	$elm = $( elm );
	tblparser = $elm.data( ).tblparser;

	options = $elm.data( ).wbvalidateoptions;

	// Quick Complex Tables Detection
	if ( options.accessibilty === "headers" ||
			tblparser.theadRowStack.length > 2 ||
			tblparser.desccell || tblparser.keycell ||
			( tblparser.colgroup[ 0 ].type === 2 && tblparser.colgroup[ 0 ].col.length > 2 ) ) {
		$elm.trigger( addidheadersEvent );
		return;
	}

	// Test each row group to test their complexity
	for ( i = 0; i < tblparser.lstrowgroup.length; i += 1 ) {
		if ( !( ( tblparser.lstrowgroup[ i ].type === 2 && tblparser.lstrowgroup[ i ].level <= 2 ) || ( tblparser.lstrowgroup[ i ].type === 3 && tblparser.lstrowgroup[ i ].level === 0 ) ) ) {
			// Sorry, but this table are not qualify for simple row grouping
			$elm.trigger( addidheadersEvent );
			return;
		}
	}

	// Test if the table can use scope colgorup
	// - Adjust the pointer for testing the table
	if ( tblparser.colgroup[ 0 ] && tblparser.colgroup[ 0 ].type === 1 && tblparser.theadRowStack[ 0 ].cell[ 0 ].type === 6 ) {
		i = tblparser.colgroup[ 0 ].end;
	} else if ( tblparser.colgroup[ 0 ].type === 2 ) {
		i = 0;
	} else {
		// This is a complex table.
		$elm.trigger( addidheadersEvent );
		return;
	}
	// - Test each header cell in the thead fit in the scope colgroup partern as per the HTML5 spec.
	for ( i; i < tblparser.theadRowStack[ 0 ].cell.length; i += 1 ) {
		if ( tblparser.theadRowStack[ 0 ].cell[ i ].colgroup &&
				( tblparser.theadRowStack[ 0 ].cell[ i ].colgroup.start === tblparser.theadRowStack[ 0 ].cell[ i ].colgroup.end ||
				tblparser.theadRowStack[ 0 ].cell[ i ].colgroup.start !== tblparser.theadRowStack[ 0 ].cell[ i ].colpos ||
				tblparser.theadRowStack[ 0 ].cell[ i ].colgroup.end !==
				( tblparser.theadRowStack[ 0 ].cell[ i ].colpos + tblparser.theadRowStack[ 0 ].cell[ i ].width - 1 ) ||
				tblparser.theadRowStack[ 0 ].cell[ i ].colgroup.type !== 2 ) ) {

			// This cell DO NOT fit in the colgroup patern
			$elm.trigger( addidheadersEvent );
			return;
		}
	}

	// it is a simple table.
	if ( options.accessibilty === "auto" && tblparser.theadRowStack.length <= 1 &&
			( tblparser.lstrowgroup.length === 1 ||
			( tblparser.lstrowgroup[ 0 ].type === 2 && tblparser.lstrowgroup[ 1 ].type === 3 && tblparser.lstrowgroup[ 1 ].level === 0 ) ) ) {
		$elm.trigger( addnothingEvent );
		return;
	}

	// Simple Grouping Table
	if ( options.accessibilty === "auto" || options.accessibilty === "scope" ) {
		$elm.trigger( addscopeEvent );
		return;
	}

	// Just in case if it wasn't catch
	$elm.trigger( addidheadersEvent );
	return;

} );

// On error detected in the table
$document.on( "error" + tableParserSelector, "#visualoutput > table:eq( 0 )", function( event ) {
	var numerr = event.err,
		html = "#" + numerr + ", ",
		errorHTML = "",
		techNum;

	errorHTML = ErrorMessage[  "%tblparser" + numerr  ];

	// Check if a technique exist related to the error
	if ( ErrorMessage[  "%tblparser" + numerr + "Tech"  ] !== undefined ) {
		techNum = ErrorMessage[  "%tblparser" + numerr + "Tech"  ];
		errorHTML = "<a href='" + techniqueURL[  techNum  ] + "' title='" + techniqueName[  techNum  ] + "'>" + errorHTML + "</a>";
	}

	html = html + errorHTML;

	$( formSelector ).trigger( {
			type: logEvent,
			logtype: "Error",
			logmessage: html
		}
	);
} );

// On warning detected in the table
$document.on( "warning" + tableParserSelector, "#visualoutput > table:eq( 0 )", function( event ) {
	var numerr = event.err,
	html = "#" + numerr + ", ",
	errorHTML = "",
	techNum;

	errorHTML = ErrorMessage[  "%tblparser" + numerr  ];

	// Check if a technique exist related to the error
	if ( ErrorMessage[  "%tblparser" + numerr + "Tech"  ] !== undefined ) {
		techNum = ErrorMessage[  "%tblparser" + numerr + "Tech"  ];
		errorHTML = "<a href='" + techniqueURL[  techNum  ] + "' title='" + techniqueName[  techNum  ] + "'>" + errorHTML + "</a>";
	}

	html = html + errorHTML;

	$( formSelector ).trigger( {
			type: logEvent,
			logtype: "Warning",
			logmessage: html
		}
	);
} );

// When the user validate the table in input
$document.on( "click", "#validatetable", function( ) {
	var $tbl;

	// 2.5. Reset form output values
	$( "#visualoutput" ).empty( );
	$( "#errors" ).empty( );

	// 1. Insert the user input into the DOM
	$( "#visualoutput" ).append( $( "#inputsourcecode" ).val( ) );

	// Cache the table object
	$tbl = $( "#visualoutput > table:eq( 0 )" );

	// 2. Validate if the user have entered something
	if ( !$tbl.length ) {

		$( formSelector ).trigger( {
				type: logEvent,
				logtype: "Error",
				logmessage: "No HTML Table code provided in input"
			}
		);

		alert( "Please add HTML Table code" );
		$( "#inputsourcecode" ).focus();
	}

	// Clean the markup if requested
	if ( !$( "#chkCleanMarkup" ).is( ":checked" ) ) {
		$( "[ headers ]", $tbl ).each( function( ) {
			$( this ).removeAttr( "headers" );
		} );
		$( "[ aria-describedby ]", $tbl ).each(function( ) {
			$( this ).removeAttr( "aria-describedby" );
		} );

		$( "[ id ]", $tbl ).each( function( ) {
			$( this ).removeAttr( "id" );
		} );

		$( "[ scope ]", $tbl ).each( function( ) {
			$( this ).removeAttr( "scope" );
		} );

		$( "[ class ]", $tbl ).each( function( ) {
			$( this ).removeAttr( "class" );
		} );
	}

	// 3. Prepare JSON option
	$tbl.data( ).wbvalidateoptions = detectValidationOptions( $tbl );

	// 4. Load the table parser and trigger the table parsing
	Modernizr.load( {
		// For loading multiple dependencies
		load: [ "site!deps/tableparser" + wb.getMode( ) + ".js" ],
		complete: function( ) {

			// Let's parse the table
			$tbl.trigger( tableParsingEvent );
		}
	} );

	// Add a default zebra stipping
	$tbl.addClass( "table table-lined" );

} );

// Log an error
$document.on( logEvent, formSelector, function( event ) {
	var htmlLogItem = "<li><strong>" + event.logtype + ":</strong> " + event.logmessage + "</li>";

	if ( !$( "#errorslist" ).length ) {
		$( "#errors" ).append( "<ul id='errorslist'></ul>" );
	}

	$( "#errorslist" ).append( htmlLogItem );

} );

function detectValidationOptions( $tbl ) {
	var opts = { };

	// Has Summary Group
	if ( $( "#chkHassum" ).is( ":checked" ) ) {
		$tbl.addClass( "hassum" );
	}

	// Accessibility Options
	if ( $( "#access-1" ).is( ":checked" ) ) {
		// Auto ( default )
		opts.accessibilty = "auto";
	} else if ( $( "#access-2" ).is( ":checked" ) ) {
		// Scope
		opts.accessibilty = "scope";
	} else {
		// Ids/Headers
		opts.accessibilty = "headers";
	}

	opts.prefix = $( "#idprefix" ).val( );

	if ( $( "#uniqueprefix" ).is( ":checked" ) ) {
		opts.prefix = "tbl" + ( new Date( ).getTime( ) + "-" ).substring( 5 );
	}

	return opts;
}

}( jQuery, wb ) );
