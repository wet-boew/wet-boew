/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/**
 * row Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false, alert: false, prettyPrint: false*/
(function ($) {
	"use strict";
	$(document).ready(function() {
		$('#resultTableIdHeaders').empty();
		$('#resultTableIdHeaders').append('<pre>Nothing to being displayed</pre>');

		$('form').submit(function() {
			$('#inputHTMLtable').focus();
			return false;
		});


		var _pe = window.pe || {
			fn : {}
		},
			nbErrorFound = 0,
			ErrorMessage = {
				"%tblparser1":  "Only table can be parsed with this parser",
				"%tblparser2":  "The table was already parsed.",
				"%tblparser3":  'The first colgroup must be spanned to represent the header column group',
				"%tblparser3Tech": 6,
				"%tblparser4":  ' You have an invalid cell inside a row description',
				"%tblparser4Tech": 4,
				"%tblparser5":  'You need at least one data colgroup, review your table structure',
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
				"%tblparser14":  'You can not have a summary at level under 0, add a group header or merge a tbody togheter',
				"%tblparser14Tech": 3,
				"%tblparser15":  'tr element need to only have th or td element as his child',
				"%tblparser16":  'The row do not have a good width',
				"%tblparser16Tech": 12,
				"%tblparser17":  'The layout cell is not empty',
				"%tblparser17Tech": 11,
				"%tblparser18":  'Row group header not well structured.',
				"%tblparser18Tech": 7,
				"%tblparser21":  'Move the row used as the column cell heading in the thead row group',
				"%tblparser21Tech": 7,
				"%tblparser23":  'Avoid the use of have paralel row headers, it\'s recommended do a cell merge to fix it',
				"%tblparser23Tech": 3,
				"%tblparser24":  'For a data row, the heading hiearchy need to be the Generic to the specific',
				"%tblparser24Tech": 3,
				"%tblparser25":  'You have a problematic key cell',
				"%tblparser25Tech": 0,
				"%tblparser26":  'You can not define any row before the thead group',
				"%tblparser26Tech": 12,
				"%tblparser27":  'thead element need to only have tr element as his child',
				"%tblparser27Tech": 12,
				"%tblparser29":  'You cannot span cell in 2 different rowgroup',
				"%tblparser29Tech": 12,
				"%tblparser30":  'Use the appropriate table markup',
				"%tblparser30Tech": 12,
				"%tblparser31":  'Internal Error, Number of virtual column must be set [function processColgroup()]',
				"%tblparser32":  'Check your row cell headers structure',
				"%tblparser32Tech": 3,
				"%tblparser34":  'Mark properly your data row group.',
				"%tblparser34Tech": 1,
				"%tblparser35":  'Column, col element, are not correctly defined',
				"%tblparser35Tech": 12},
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
				"http://www.w3.org/TR/html5/spec.html"], // 13
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
				"HTML5 Specification"], // 13;
			tableOpenTag = '&lt;table&gt;',
			tableOpenTagNoEncode = '<table>',
			tableOpenTagZebra = '&lt;table class=&quot;wet-boew-zebra&quot;&gt;',
			tableOpenTagZebraNoEncode = '<table class="wet-boew-zebra">',
			errorHandlerAttached = false,
			fnParserLoaded = function () {
				_pe.fn.parsertable.onParserError = function(numerr, obj){
					var msgListItem = '<li><span class="wb-invisible">' + numerr + '</span> ',
						err;

					// Retreive the Error message
					if (ErrorMessage['%tblparser' + numerr]) {
						err = ErrorMessage['%tblparser' + numerr];

						// Check if a technique exist related to the error
						if (ErrorMessage['%tblparser' + numerr + 'Tech'] !== undefined) {
							var techNum = ErrorMessage['%tblparser' + numerr + 'Tech'];
							err = '<a href="' + techniqueURL[techNum] + '" title="' + techniqueName[techNum] + '">' + err + '</a>';
						}

					} else {
						err = 'Error found, but not documented. Error Number:' + numerr;
					}


					if(numerr === 23 || numerr === 18) {
						msgListItem += 'Warning: ';

					} else {
						msgListItem += 'Error: ';
						nbErrorFound += 1;
					}
					$('#errorList').append($(msgListItem + err + '</li>'));
					if (obj) {
						$(obj).css('background-color', 'red');
					}
				};
				errorHandlerAttached = true;
			},
			displayTableResult = function (){
				// Missing colgroup and col if any
				var tblelement = $('#directOutput table:eq(0)');

				// Show the result
				$('#resultTableIdHeaders').show();

				$('#resultTableIdHeaders').empty();
				$('#resultTableIdHeaders').html('<pre class="prettyprint"><code>' + ('<table>' + $(tblelement).html() + '</table>').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '</code></pre>');



				prettyPrint();

				if($('#addzebra').is(':checked')){
					_pe.fn.zebra._exec(tblelement);
				}
			},
			optimizeAccessibilitySet = function (tpAccessibility){
				//var noErrorList = '<li>No Error Found</li>',
				var noErrorList = '<li>Table passed, see the resulting source code bellow</li>',
					ErrorParsedByForce = '<li>Forced the HTML results, It\'s recommended to fix the errors.</li>',
					emptyTable = '<li>Empty Table</li>',
					qualifiedSimple = '<li>You have a <strong>Simple Table</strong></li>',
					qualifiedSimpleGrouping = '<li>You have a <strong>Simple Grouping Table</strong> (Acessibility set with scope attribute)</li>',
					qualifiedComplex = '<li>You have a <strong>Complex Table</strong> (Acessibility set with id/headers attribute)</li>',
					bypassOnError = false,
					ScopeColgroupEligible = true,
					i,
					j;

				nbErrorFound = 0;




				if (!errorHandlerAttached){
					fnParserLoaded();
				}

				_pe.fn.parsertable.parse($('#directOutput table:eq(0)'));

				if ($('#byPassOnErrorStop').is(':checked')) {
					bypassOnError = true;
				}

				if (nbErrorFound === 0 || bypassOnError) {

					var tblparser = $('#directOutput table:eq(0)').data().tblparser;

					if (!tblparser.row) {
						alert('Your table must have at least one row');
						$('#directOutput').empty();
						$('#errorList').empty();
						$('#errorList').append($(emptyTable));
						return;
					}

					$('#errorList').empty();
					if(nbErrorFound === 0){
						$('#errorList').append($(noErrorList));
					} else {
						$('#errorList').append($(ErrorParsedByForce));
					}

					// Clean the markup if requested
					if (!$('#chkCleanMarkup').is(':checked')) {
						$('#directOutput table:eq(0) [headers]').each(function () {
							$(this).removeAttr('headers');
						});
						$('#directOutput table:eq(0) [aria-describedby]').each(function () {
							$(this).removeAttr('aria-describedby');
						});

						$('#directOutput table:eq(0) [id]').each(function () {
							$(this).removeAttr('id');
						});

						$('#directOutput table:eq(0) [scope]').each(function () {
							$(this).removeAttr('scope');
						});

						$('#directOutput table:eq(0) [class]').each(function () {
							$(this).removeAttr('class');
						});
					}

					// Auto-Detect the best way to make the table accessible WCAG 2.0

					// Si le tableau a 2 row pour les colones
					//		* Toute les cells des 2 ligne doit avoir une hauteur de 1, (Sans tenir compte du column header group)
					//		* Toute les cell de la 1er ligne doit avoir une largeur egale ou plus grande que 2.
					//
					//		* Les cells de la première ligne doit exatement correspondre au colgroup definie
					//		*
					if (tblparser.theadRowStack.length !== 2) {
						ScopeColgroupEligible = false;
					} else {
						i = 0;
						if (tblparser.colgroup[0] && tblparser.colgroup[0].type === 1 && tblparser.theadRowStack[0].cell[0].type === 6) {
							i = tblparser.colgroup[0].end;
						} else if (tblparser.colgroup[0].type === 2) {
							i = 0;
						} else {
							// This is a complex table.
							ScopeColgroupEligible = false;
						}
						// Test the first row
						if (ScopeColgroupEligible) {
							for (i; i < tblparser.theadRowStack[0].cell.length; i += 1) {
								if (tblparser.theadRowStack[0].cell[i].colgroup &&
									(tblparser.theadRowStack[0].cell[i].colgroup.start === tblparser.theadRowStack[0].cell[i].colgroup.end ||
									tblparser.theadRowStack[0].cell[i].colgroup.start !== tblparser.theadRowStack[0].cell[i].colpos ||
									tblparser.theadRowStack[0].cell[i].colgroup.end !==
									(tblparser.theadRowStack[0].cell[i].colpos + tblparser.theadRowStack[0].cell[i].width - 1) ||
									tblparser.theadRowStack[0].cell[i].colgroup.type !== 2)) {

									// This cell DO NOT fit in the colgroup patern
									ScopeColgroupEligible = false;
									break;
								}
							}
						}
						// Test the second row
						/*if (ScopeColgroupEligible) {
							if (tblparser.colgroup[0].type === 1) {
								i = tblparser.colgroup[0].end - 1;
							} else {
								i = 0;
							}
							for (i; i < tblparser.theadRowStack[1].cell.length; i += 1) {

							}
						}*/

					}



					// Is Simple Table ?
					if ((tblparser.theadRowStack.length <= 1 || ScopeColgroupEligible) && // One Row for column headers
						!tblparser.desccell && // No Description Cell
						!tblparser.keycell // && // No Key Cell
						/*((tblparser.colgroup.length === 2 && tblparser.colgroup[0].type === 1 && tblparser.colgroup[0].col.length === 1) || // an header column group build with one column followed by a data column group
						tblparser.colgroup.length === 1)*/){ // One data colum group

						// Without grouping
						if (tpAccessibility === "auto" && (tblparser.theadRowStack.length <= 1 && (tblparser.lstrowgroup.length === 1 || (tblparser.lstrowgroup[0].type === 2 && tblparser.lstrowgroup[1].type === 3 && tblparser.lstrowgroup[1].level === 0)))) { // Only one row group or one data group with a summary group at level 0 (tfoot)

							// This table is qualified to be an simple table
							$('#errorList').append($(qualifiedSimple));

							displayTableResult();
							return;
						}


						var qualifySimpleGrouping = true;
						// Simple Row grouping (Need to be at only at level 0, 1 or 2 and no summary)
						for (i = 0; i < tblparser.lstrowgroup.length; i += 1) {
							if (!((tblparser.lstrowgroup[i].type === 2 && tblparser.lstrowgroup[i].level <= 2) || (tblparser.lstrowgroup[i].type === 3 && tblparser.lstrowgroup[i].level === 0))) {
								// Sorry, but this table are not qualify for simple row grouping
								qualifySimpleGrouping = false;
								break;
							}
						}

						if (qualifySimpleGrouping && (tpAccessibility === "auto" || tpAccessibility === "scope")) {
							// Do the simple row grouping
							$('#errorList').append($(qualifiedSimpleGrouping));

							for (i = 0; i < tblparser.lstrowgroup.length; i += 1) {
								if (tblparser.lstrowgroup[i].headerlevel && tblparser.lstrowgroup[i].headerlevel[0]) {
									$(tblparser.lstrowgroup[i].headerlevel[0].elem).attr('scope', 'rowgroup');
								}
								for (j = 0; j < tblparser.lstrowgroup[i].row.length; j += 1) {
									if (tblparser.lstrowgroup[i].row[j].cell[0].type === 1) {
										$(tblparser.lstrowgroup[i].row[j].cell[0].elem).attr('scope', 'row');
									}
								}
							}
							if (tblparser.theadRowStack.length === 2) {
								if (tblparser.colgroup[0].type === 1) {
									i = tblparser.colgroup[0].end;
								} else {
									i = 0;
								}
								for (i; i < tblparser.theadRowStack[0].cell.length; i += 1) {
									if (i === 0 || (tblparser.theadRowStack[0].cell[i - 1].uid !== tblparser.theadRowStack[0].cell[i].uid)){
										$(tblparser.theadRowStack[0].cell[i].elem).attr('scope', 'colgroup');
									}
								}
							}
							if (tblparser.theadRowStack.length === 1 || tblparser.theadRowStack.length === 2) {
								for (i = 0; i < tblparser.theadRowStack[(tblparser.theadRowStack.length === 1 ? 0 : 1)].cell.length; i += 1) {
									if (tblparser.theadRowStack[(tblparser.theadRowStack.length === 1 ? 0 : 1)].cell[i].type === 1){
										$(tblparser.theadRowStack[(tblparser.theadRowStack.length === 1 ? 0 : 1)].cell[i].elem).attr('scope', 'col');
									}
								}
							}
							displayTableResult();
							return;
						}

					}

					// All Others Cases
					$('#errorList').append($(qualifiedComplex));
					generateIdHeaders();

				}
			},
			generateIdHeaders = function(){
				//var noErrorList = '<li>No Error Found</li>',
				var m,
					colgroupelem,
					currCellId;
				/*
				nbErrorFound = 0;


				if (!errorHandlerAttached){
					fnParserLoaded();
				}

				_pe.fn.parsertable.parse($('#directOutput table:eq(0)'));

				if ($('#byPassOnErrorStop').is(':checked')) {
					bypassOnError = true;
				}
				*/
				// if(nbErrorFound === 0 || bypassOnError){

					// Add id, headers attribute to each cell

					var tblparser = $('#directOutput table:eq(0)').data().tblparser,
						tblelement = $('#directOutput table:eq(0)'),
						i,
						j,
						currRow,
						currCell,
						idPrefix = $('#idprefix').val() || 'usabletblparsed',
						resetIds = false;

					/*

					// Remove any headers and aria-describedby attribute

					$('#directOutput table:eq(0) [headers]').each(function () {
						$(this).removeAttr('headers');
					});
					$('#directOutput table:eq(0) [aria-describedby]').each(function () {
						$(this).removeAttr('aria-describedby');
					});

					if ($('#idreset:checked').length > 0) {
						$('#directOutput table:eq(0) [id]').each(function () {
							$(this).removeAttr('id');
						});
					}

					if($('#removeScope:checked').length > 0) {
						$('#directOutput table:eq(0) [scope]').each(function () {
							$(this).removeAttr('scope');
						});
					}
					*/

					// Set ID and Header for the table head
					for (i = 0; i < tblparser.theadRowStack.length; i += 1) {
						currRow = tblparser.theadRowStack[i];

						for (j = 0; j < currRow.cell.length; j += 1) {
							currCell = currRow.cell[j];

							if ((currCell.type === 1 || currCell.type === 7) && (
									!(j > 0 && currCell.uid === currRow.cell[j - 1].uid) &&
									!(i > 0 && currCell.uid === tblparser.theadRowStack[i - 1].cell[j].uid)
								) ) {


								// If there no id, add an uid
								currCellId = $(currCell.elem).attr('id');
								if (currCellId === undefined || currCellId === '' || resetIds) {
									// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
									currCellId = idPrefix + currCell.uid; // Generate a new ID
									$(currCell.elem).attr('id', currCellId);
								}

								// Set the header of the current cell if required
								if (i > 0) {
									var headersCurrCell = $(tblparser.theadRowStack[i - 1].cell[j].elem).attr('id');

									if ($(tblparser.theadRowStack[i-1].cell[j].elem).attr('headers') !== undefined) {
										headersCurrCell = $(tblparser.theadRowStack[i - 1].cell[j].elem).attr('headers') + ' ' + headersCurrCell;
									}
									$(currCell.elem).attr('headers', headersCurrCell);
									if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
										$(currCell.elem).removeAttr('headers');
									}
								}


								// Set the header on his descriptive cell is any (May be better aria-describedby
								if (currCell.descCell) {
									$(currCell.descCell.elem).attr('headers', currCellId);
									if ($(currCell.descCell.elem).attr('headers') === undefined || $(currCell.descCell.elem).attr('headers') === '') {
										$(currCell.descCell.elem).removeAttr('headers');
									}
									var currCellDescId = $(currCell.descCell.elem).attr('id');
									if (currCellDescId === undefined || currCellDescId === '' || resetIds) {
										// currCellDescId = idPrefix + new Date().getTime() + currCell.descCell.uid; // Generate a new ID
										$(currCell.descCell.elem).attr('id', currCellDescId);
									}
									$(currCell.elem).attr('aria-describedby', currCellDescId);
								}
							}

						}

					}

					var rowheadersgroup,
						rowheaders,
						currrowheader,
						ongoingRowHeader,
						coldataheader;
					// Set Id/headers for header cell and data cell in the table.
					for (i = 0; i < tblparser.row.length; i += 1) {
						currRow = tblparser.row[i];
						rowheadersgroup = "";
						rowheaders = "";
						currrowheader = "";
						ongoingRowHeader = "";

						// Get or Generate a unique ID for each header in this row
						if (currRow.headerset && !currRow.idsheaderset) {
							for (j = 0; j < currRow.headerset.length; j += 1) {
								currCellId = $(currRow.headerset[j].elem).attr('id');
								if (currCellId === undefined || currCellId === '' || resetIds) {
									// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
									currCellId = idPrefix + currRow.headerset[j].uid; // Generate a new ID
									$(currRow.headerset[j].elem).attr('id', currCellId);
								}
								rowheadersgroup= (rowheadersgroup ? rowheadersgroup + ' ' + currCellId : currCellId);
							}
							currRow.idsheaderset = rowheadersgroup;
						}

						if (currRow.header) {
							for (j = 0; j < currRow.header.length; j += 1) {
								currCellId = $(currRow.header[j].elem).attr('id');
								if (currCellId === undefined || currCellId === '' || resetIds) {
									// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
									currCellId = idPrefix + currRow.header[j].uid; // Generate a new ID
									$(currRow.header[j].elem).attr('id', currCellId);
								}
								rowheaders = (rowheaders ? rowheaders + ' ' + currCellId : currCellId);
							}
						}
						rowheaders = (currRow.idsheaderset ? currRow.idsheaderset + ' ' + rowheaders : rowheaders);
						for (j = 0; j < currRow.cell.length; j += 1) {

							if ((j === 0) || (j > 0 && currRow.cell[j].uid !== currRow.cell[(j - 1)].uid)){
								currCell = currRow.cell[j];
								coldataheader = "";

								if (currCell.col && !currCell.col.dataheader) {
									var currCol = currCell.col;
									var colheaders = "",
										colheadersgroup = "";
									if (currCol.headerLevel) {
										for (m = 0; m < currCol.headerLevel.length; m += 1) {
											currCellId = $(currCol.headerLevel[m].elem).attr('id');
											if (currCellId === undefined || currCellId === '' || resetIds) {
												// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
												currCellId = idPrefix + currCol.headerLevel[m].uid; // Generate a new ID
												$(currCol.headerLevel[m].elem).attr('id', currCellId);
											}
											colheadersgroup = (colheadersgroup ? colheadersgroup + ' ' + currCellId : currCellId);
										}
									}
									if (currCol.header) {
										for (m = 0; m < currCol.header.length; m += 1) {
											currCellId = $(currCol.header[m].elem).attr('id');
											if (currCellId === undefined || currCellId === '' || resetIds) {
												// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
												currCellId = idPrefix + currCol.header[m].uid; // Generate a new ID
												$(currCol.header[m].elem).attr('id', currCellId);
											}
											colheaders = (colheaders ? colheaders + ' ' + currCellId : currCellId);
										}
									}
									currCol.dataheader = (colheadersgroup ? colheadersgroup + ' ' + colheaders : colheaders);
								}

								if (currCell.col && currCell.col.dataheader) {
									coldataheader = currCell.col.dataheader;
								}



								if (currCell.type === 1) {

									$(currCell.elem).attr('headers', (coldataheader ? coldataheader : '') +
														(currRow.idsheaderset && coldataheader ? ' ' : '') +
														(currRow.idsheaderset ? currRow.idsheaderset : '') +
														((currRow.idsheaderset && ongoingRowHeader) || (coldataheader && ongoingRowHeader && !currRow.idsheaderset) ? ' ' : '') +
														(ongoingRowHeader ? ongoingRowHeader : ''));

									if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
										$(currCell.elem).removeAttr('headers');
									}

									var currCellId5 = $(currCell.elem).attr('id');
									if (currCellId5 === undefined || currCellId5 === '' || resetIds) {
										// currCellId5 = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
										currCellId5 = idPrefix + currCell.uid; // Generate a new ID
										$(currCell.elem).attr('id', currCellId5);
									}

									ongoingRowHeader = (ongoingRowHeader !== '' ? ongoingRowHeader + ' ' : '') + currCellId5;
								}


								if (currCell.type === 2 || currCell.type === 3) {

									// Get Current Column Headers
									currrowheader = rowheaders;

									if (currCell.addcolheaders) {
										for (m = 0; m < currCell.addcolheaders.length; m += 1) {
											currCellId = $(currCell.addcolheaders[m].elem).attr('id');
											if (currCellId === undefined || currCellId === '' || resetIds) {
												// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
												currCellId = idPrefix + currCell.addcolheaders[m].uid; // Generate a new ID
												$(currCell.addcolheaders[m].elem).attr('id', currCellId);
											}
											coldataheader = (coldataheader ? coldataheader + ' ' + currCellId : currCellId);
										}
									}

									if (currCell.addrowheaders) {
										for (m = 0; m < currCell.addrowheaders.length; m += 1) {
											currCellId = $(currCell.addrowheaders[m].elem).attr('id');
											if (currCellId === undefined || currCellId === '' || resetIds) {
												// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
												currCellId = idPrefix + currCell.addrowheaders[m].uid; // Generate a new ID
												$(currCell.addrowheaders[m].elem).attr('id', currCellId);
											}
											currrowheader = (currrowheader ? currrowheader + ' ' + currCellId : currCellId);
										}
									}

									$(currCell.elem).attr('headers', (coldataheader ? coldataheader : '') + (currrowheader && coldataheader ? ' ' : '') + (currrowheader ? currrowheader : ''));
									if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
										$(currCell.elem).removeAttr('headers');
									}
								}

								if (currCell.type === 4 || currCell.type === 5) {
									var descHeaders = "";

									if (currCell.describe) {
										for (m = 0; m < currCell.describe.length; m += 1) {
											currCellId = $(currCell.describe[m].elem).attr('id');
											if (currCellId === undefined || currCellId === '' || resetIds) {
												// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
												currCellId = idPrefix + currCell.describe[m].uid; // Generate a new ID
												$(currCell.describe[m].elem).attr('id', currCellId);
											}
											descHeaders = (descHeaders ? descHeaders + ' ' + currCellId : currCellId);
											if (currCell.type === 5 && !$(currCell.describe[m].elem).attr('aria-describedby')) {
												currCellId = $(currCell.elem).attr('id');
												if (currCellId === undefined || currCellId === '' || resetIds) {
													// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
													currCellId = idPrefix + currCell.uid; // Generate a new ID
													$(currCell.elem).attr('id', currCellId);
												}
												$(currCell.describe[m].elem).attr('aria-describedby', currCellId);
											}
										}
									}
									if (currCell.type !== 4) {
										$(currCell.elem).attr('headers', (coldataheader ? coldataheader : '') + (coldataheader && descHeaders ? ' ' : '') + (descHeaders || ''));
										if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
											$(currCell.elem).removeAttr('headers');
										}
									} else if (!$(currCell.elem).attr('aria-describedby')) {
										$(currCell.elem).attr('aria-describedby', descHeaders || '');
										$(currCell.elem).attr('headers', coldataheader || '');
										if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
											$(currCell.elem).removeAttr('headers');
										}
									}
								}
							}
						}
					}

					// Check for any description that are related to the an group header cell

					for (i = 0; i < tblparser.lstrowgroup.length; i += 1) {

						if (tblparser.lstrowgroup[i].headerlevel.length > 0) {
							for (j = 0; j < tblparser.lstrowgroup[i].headerlevel.length; j += 1){

								if (tblparser.lstrowgroup[i].headerlevel[j].descCell) {
									// Set the aria-describedby
									var currDescCellId = $(tblparser.lstrowgroup[i].headerlevel[j].descCell.elem).attr('id');
									if (currDescCellId === undefined || currDescCellId === '' || resetIds) {
										// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
										currDescCellId = idPrefix + tblparser.lstrowgroup[i].headerlevel[j].descCell.uid; // Generate a new ID
										$(tblparser.lstrowgroup[i].headerlevel[j].descCell.elem).attr('id', currDescCellId);
									}
									$(tblparser.lstrowgroup[i].headerlevel[j].elem).attr('aria-describedby', currDescCellId);

									// Set the headers
									currCellId = $(tblparser.lstrowgroup[i].headerlevel[j].elem).attr('id');
									if (currCellId === undefined || currCellId === '' || resetIds) {
										// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
										currCellId = idPrefix + tblparser.lstrowgroup[i].headerlevel[j].uid; // Generate a new ID
										$(tblparser.lstrowgroup[i].headerlevel[j].elem).attr('id', currCellId);
									}
									$(tblparser.lstrowgroup[i].headerlevel[j].descCell.elem).attr('headers', currCellId);
								}

							}
						}
					}


					// Horay, now all the table cell have theirs id/headers set as the table was parsed,

					// Suggestion: Add some aria-label to annonce the data summary, I will ask the WAI Interrest Mailing List to get some liable solution

					// tfoot question: do I force it as exclusive column summaries as the HTML5 spec define it if it used as table footnote ??

					// Add the missing tag if they are missing, "colgroup, col, thead, tbody", remove tfoot ????
					var previousColgroup = false,
						column;
					for (i = 0; i < tblparser.colgroup.length; i += 1) {
					if (tblparser.colgroup[i].elem === undefined) {
						// Create a colgroup element
						colgroupelem = $('<colgroup></colgroup>');

						// Create the column
						for (j = 0; j < tblparser.colgroup[i].col.length; j += 1) {
							column = $('<col />');
							$(colgroupelem).append(column);
							tblparser.colgroup[i].col[j].elem = $(column).get(0);
							$(column).data().tblparser = tblparser.colgroup[i].col[j];
						}

						if (previousColgroup) {
							$(previousColgroup).after(colgroupelem);
						} else {
							if ($(tblelement).has('caption')) {
								$('caption:eq(0)', tblelement).after(colgroupelem);
							} else {
								$(tblelement).prepend(colgroupelem);
							}
						}
						previousColgroup = colgroupelem;

						tblparser.colgroup[i].elem = $(colgroupelem).get(0);
						$(colgroupelem).data().tblparser = tblparser.colgroup[i];
					} else {
						// Remove the span attribute if exist
						colgroupelem = tblparser.colgroup[i].elem;

						$(colgroupelem).removeAttr('span');

						// Create the column
						for (j = 0; j < tblparser.colgroup[i].col.length; j += 1) {
							if (tblparser.colgroup[i].col[j].elem === undefined) {
								column = $('<col />');
								$(colgroupelem).append(column);
								tblparser.colgroup[i].col[j].elem = $(column).get(0);
								$(column).data().tblparser = tblparser.colgroup[i].col[j];
							}
						}

					}
				}

				// TODO: Rebuild the thead, tbody section

				displayTableResult();
				// }




			};





		// setTimeout(function(){
		//	_pe.wb_load({'dep': ['parserTable']}, "depsTableParserLoaded")
		//	}, 2000);

		$('#analysetable').click(function(){
			//var noErrorList = '<li>No Error Found</li>',
			var genericMessage = '<li>Use the above text field to analyse your HTML Complex Table Source Code</li>',
				parsingInProgress = '<li>Please wait, you will see the result in a moment.</li>',
				tpAccessibility, // value: ["auto", "scope", "headers"]
				elemTableExist;

			nbErrorFound = 0;

			$('#resultTableIdHeaders').val('');
			$('#resultTableIdHeaders').empty();
			$('#resultTableIdHeaders').append('<pre>Nothing to being displayed</pre>');


			$('#errorList').empty();
			$('#directOutput').empty();


			$('#directOutput').after('<div id="tmpWorker"></div>');
			$('#tmpWorker').css('display', 'none');
			$('#tmpWorker').append($('#inputHTMLtable').val());

			if ($('#tmpWorker table:eq(0)').length !== 0) {
				elemTableExist = true;
			}


			if($('#addzebra').is(':checked')){
				$('#directOutput').append(tableOpenTagZebraNoEncode + '</table>');
			} else {
				$('#directOutput').append(tableOpenTagNoEncode + '</table>');
			}


			if (elemTableExist) {
				$('#directOutput table:eq(0)').append($('#tmpWorker table:eq(0) > *'));
			} else {
				$('#directOutput table:eq(0)').append($('#inputHTMLtable').val());

			}
			$('#tmpWorker').remove();

			/*
			if($('#addzebra').is(':checked')){
				$('#directOutput').append(tableOpenTagZebraNoEncode + $('#inputHTMLtable').val() + '</table>');
			} else {
				$('#directOutput').append(tableOpenTagNoEncode + $('#inputHTMLtable').val() + '</table>');
			}*/

			if ($('#directOutput table:eq(0)').length === 0) {
				alert('Please add HTML Table code');
				// $('#directOutput').empty();
				$('#errorList').append($(genericMessage));
				return;
			}


			if($('#chkHassum').is(':checked')){
				$('#directOutput table:eq(0)').addClass('hassum');
			}

			// Accessibility Options
			if($('#access-1').is(':checked')) {
				// Auto (default)
				tpAccessibility = 'auto';
			} else if($('#access-2').is(':checked')) {
				// Scope
				tpAccessibility = 'scope';
			} else {
				// Ids/Headers
				tpAccessibility = 'headers';
			}

			// Generate Unique Ids prefix
			if($('#uniqueprefix').is(':checked')) {
				$('#idprefix').val('tbl' + new Date().getTime() + '-');
			}



			$('#errorList').append($(parsingInProgress));

			if (_pe.fn.parsertable) {
				optimizeAccessibilitySet(tpAccessibility);
			} else {
				$(document).on('depsTableParserLoaded', function() {
					optimizeAccessibilitySet(tpAccessibility);
				});
				_pe.wb_load({'dep': ['parserTable']}, "depsTableParserLoaded");
			}
		});

		$('#addzebra').click(function () {
			if($('#addzebra').is(':checked')) {
				$('#tableopentag').html(tableOpenTagZebra);
			} else {
				$('#tableopentag').html(tableOpenTag);
			}
		});

		if($('#addzebra').is(':checked')){
			$('#tableopentag').html(tableOpenTagZebra);
		} else {
			$('#tableopentag').html(tableOpenTag);
		}

		$('#chkHassum').click(function () {
			if($('#chkHassum').is(':checked')){
				$('#hassumoption').show();
			} else {
				$('#hassumoption').hide();
			}
		});

		if($('#chkHassum').is(':checked')){
			$('#hassumoption').show();
		} else {
			$('#hassumoption').hide();
		}

	});

}(jQuery));