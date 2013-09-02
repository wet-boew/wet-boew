/*
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/
/*
* Zebra stripping functionality for block level elements
*/
/*global jQuery: false, wet_boew_zebra: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.zebra = {
		type: 'plugin',
		fnZebraComplexTable: function (elem, opts) {
			var tblparser,
				i,
				getCellHeaders,
				autoRemoveTimeout,
				$trs,
				$cols,
				col_length;

			// Parse the table
			if (!$(elem).data().tblparser) {
				_pe.fn.parsertable.parse($(elem));
			}
			tblparser = $(elem).data().tblparser; // Create an alias
			// Key Cell
			if (tblparser.keycell) {
				for (i = 0; i < tblparser.keycell.length; i += 1) {
					$(tblparser.keycell[i].elem).addClass('table-keycell');
				}
			}
			// Description Cell
			if (tblparser.desccell) {
				for (i = 0; i < tblparser.desccell.length; i += 1) {
					$(tblparser.desccell[i].elem).addClass('table-desccell');
				}
			}
			// Layout Cell
			if (tblparser.layoutCell) {
				for (i = 0; i < tblparser.layoutCell.length; i += 1) {
					$(tblparser.layoutCell[i].elem).addClass('table-layoutCell');
				}
			}
			// Summary Cell
			if (tblparser.row) {
				for (i = 0; i < tblparser.row.length; i += 1) {
					
					// Add a class to the row
					if (tblparser.row[i].type === 3) {
						$(tblparser.row[i].elem).addClass('table-summary');
					}
					
					// Summary group styling
					if (tblparser.row[i].type && tblparser.row[i].type === 3 && tblparser.row[i].rowgroup.elem && i > 0 && tblparser.row[i - 1].type && tblparser.row[i - 1].type === 3 && tblparser.row[i - 1].rowgroup.uid !== tblparser.row[i].rowgroup.uid) {
						$(tblparser.row[i].rowgroup.elem).addClass('table-rowgroupmarker');
					}
				}
			}
			
			// Header Group Cell
			/*
			 * Currently unused. 
			 * Uncomment to be able to apply custom styling to an header group cells.
			 * 
			+-----------------------------------------------------+
			| FYI - 'tblparser.type' property (See the docs related to the parserTable.js dependency)
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
			 * 
			 * 
			$('th', elem).each(function () {
				var $this = $(this),
					tblparser = $this.data().tblparser;
				if (tblparser.type === 7) {
					$this.addClass('table-headgroup' + tblparser.scope + tblparser.level);	// level is a number, scope either "row" || "col"
				}
			});
			*/

			// Data Column Group
			if (tblparser.colgroup) {
				for (i = 0; i < tblparser.colgroup.length; i += 1) {
					
					if(tblparser.colgroup[i].type === 3) {
						$(tblparser.colgroup[i].elem).addClass('table-summary');
					}
					
					if (tblparser.colgroup[i].elem && ((i > 0 && tblparser.colgroup[i].type === 3 && tblparser.colgroup[i - 1].type === 3 && tblparser.colgroup[i - 1].level > tblparser.colgroup[i].level) ||
						(tblparser.colgroup[i].type === 2 && ((i > 0 && tblparser.colgroup[0].type === 2) || (i > 1 && tblparser.colgroup[0].type === 1))))) {
						$(tblparser.colgroup[i].elem).addClass('table-colgroupmarker');
					}
				}
			}

			// Data Row Group
			if (tblparser.lstrowgroup) {
				for (i = 0; i < tblparser.lstrowgroup.length; i += 1) {
					if (tblparser.lstrowgroup[i].elem && tblparser.lstrowgroup[i].type === 2 && i > 0) {
						$(tblparser.lstrowgroup[i].elem).addClass('table-rowgroupmarker');
					}
				}
			}

			/* The Heading highlight take times to be set up in ÌE and just a little bit more in Firefox
			*
			*/
			if (!opts.noheaderhighlight || opts.columnhighlight) {
				getCellHeaders = function (elem) {
					var cellsheader = [],
						$elem = $(elem),
						tblparser = $elem.data().tblparser,
						len;
					if (tblparser.row && tblparser.row.header && !opts.norowheaderhighlight) {
						for (i = 0, len = tblparser.row.header.length; i !== len; i += 1) {
							cellsheader.push(tblparser.row.header[i].elem);
						}
						if (tblparser.addrowheaders) {
							for (i = 0, len = tblparser.addrowheaders.length; i !== len; i += 1) {
								cellsheader.push(tblparser.addrowheaders[i].elem);
							}
						}
					}
					if (tblparser.col && tblparser.col.header && !opts.nocolheaderhighlight) {
						for (i = 0, len = tblparser.col.header.length; i !== len; i += 1) {
							cellsheader.push(tblparser.col.header[i].elem);
						}
						if (tblparser.addcolheaders) {
							for (i = 0, len = tblparser.addcolheaders.length; i !== len; i += 1) {
								cellsheader.push(tblparser.addcolheaders[i].elem);
							}
						}
					}
					$(elem).data().cellsheader = cellsheader;
				};

				// Cell Header Highlight
				$('td, th', elem).on('mouseenter focusin', function () {
					var $this = $(this),
						tblparser = $this.data().tblparser,
						oldThHover;
					if (!opts.noheaderhighlight) {
						clearTimeout(autoRemoveTimeout);
						oldThHover = $('th.table-hover', elem);
						if (tblparser.type !== 1) {
							if (!$this.data().cellsheader) {
								getCellHeaders(this);
							}
							//$($this.data().cellsheader).addClass('table-hover');
							$.each($this.data().cellsheader, function () {
								var $cheader = $(this);
								$cheader.addClass('table-hover');
								$cheader.data().zebrafor = tblparser.uid;
							});
						} else {
							if (tblparser.scope === "row" && !opts.norowheaderhighlight) {
								$this.addClass('table-hover');
								$this.data().zebrafor = tblparser.uid;
							}
						}
						// Remove previous highlight, if required
						$.each(oldThHover, function () {
							var $old = $(this);
							if ($old.data().zebrafor && $old.data().zebrafor !== tblparser.uid) {
								$old.removeClass('table-hover');
								delete $old.data().zebrafor;
							}
						});
					}
					if (opts.columnhighlight && tblparser.col && tblparser.col.elem) {
						$(tblparser.col.elem).addClass('table-hover');
					}
				});
				$('td, th', elem).on('mouseleave focusout', function () {
					var tblparser = $(this).data().tblparser,
						elem = this;
					if (!opts.noheaderhighlight) {
						autoRemoveTimeout = setTimeout(function () {
							var i,
								len,
								$elem = $(elem),
								$cellheader;
							if (tblparser.type === 1) {
								$elem.removeClass('table-hover');
								delete $elem.data().zebrafor;
								return;
							}
							for (i = 0, len = $elem.data().cellsheader.length; i !== len; i += 1) {
								$cellheader = $($(elem).data().cellsheader[i]);
								if ($cellheader.data().zebrafor === tblparser.uid) {
									$cellheader.removeClass('table-hover');
									delete $cellheader.data().zebrafor;
								}
							}
						}, 25);
					}
					if (opts.columnhighlight && tblparser.col && tblparser.col.elem) {
						$(tblparser.col.elem).removeClass('table-hover');
					}
				});
			}


			// Default Zebra
			$trs = (elem.children('tr').add(elem.children('tbody').children('tr'))).filter(function () {
				return $(this).children('td').length > 0;
			});

			if (!opts.nohover) {
				if (!opts.norowheaderhighlight && !opts.noheaderhighlight) {
					elem.addClass('rowhover');
				} else {
					elem.addClass('rowtdhover');
				}
				if (_pe.preIE9) {
					$trs.on('mouseleave focusout', function (e) {
						e.stopPropagation();
						$(this).removeClass('table-hover');
					});
					$trs.on('mouseenter focusin', function (e) {
						e.stopPropagation();
						$(this).addClass('table-hover');
					});
				}
			}
			
			if (opts.vectorstripe) {
				if (!opts.columnhighlight) {
					elem.addClass('rowzebra');
					if (_pe.preIE9) {
						$trs.filter(':odd').addClass('table-odd');
					}
				} else {
					elem.addClass('colzebra');

					if (_pe.preIE9) {
						$cols = [];
						for (i = 0, col_length = tblparser.col.length; i < col_length; i += 1) {
							if (tblparser.col[i].elem) {
								$cols.push(tblparser.col[i].elem);
							}
						}
						$($cols).filter(':odd').addClass('table-odd');
					}
				}
			}

		},
		_exec: function (elem) {
			var $trs,
				$cols,
				$lis,
				parity,
				isSimpleTable = true,
				i,
				opts,
				overrides,
				lstDlItems = [],
				isodd,
				dlitem = [],
				domTable;
			// Defaults Options
			opts = {
				noheaderhighlight: false,
				norowheaderhighlight: false,
				nocolheaderhighlight: false,
				columnhighlight: false,
				nohover: false,
				vectorstripe: false,
				complextableparsing: false // Option to force simple table detection to be anaylsed as a complex table
			};
			// Option to force to do not get header highlight
			overrides = {
				noheaderhighlight: elem.hasClass('noheaderhighlight') ? true : undefined,
				norowheaderhighlight: elem.hasClass('norowheaderhighlight') ? true : undefined,
				nocolheaderhighlight: elem.hasClass('nocolheaderhighlight') ? true : undefined,
				columnhighlight: elem.hasClass('columnhighlight') ? true : undefined,
				nohover: elem.hasClass('nohover') ? true : undefined,
				vectorstripe: elem.hasClass('vectorstripe') ? true : undefined,
				complextableparsing: elem.hasClass('complextableparsing') ? true : undefined
			};
			// Extend the defaults with settings passed through settings.js (wet_boew_zebra), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_zebra !== 'undefined' ? wet_boew_zebra : {}), overrides); 
			
			if (elem.is('table')) {

				// Perform a test to know if we need to completly parse the table
				//
				// Simple Table Condition :
				// * No CSS Options set
				// * 0-1 row for the columns
				// * 0-1 row in the thead
				// * 0-1 tbody row group
				// * 0-1 cell headers per row. That cell headers would need to be located at the first column position
				// * 0-2 colgroup
				// * n col element
				// * 0-1 tfoot row group

				if (opts.complextableparsing || opts.nocolheaderhighlight || opts.vectorstripe) {
					isSimpleTable = false;
				}
				// option now available since WxT 3.1 for simple table: noheaderhighlight, norowheaderhighlight 

				if (isSimpleTable && (elem.children('tbody').length > 1 || elem.children('thead').children('tr').length > 1 || elem.children('colgroup').length > 2)) {
					isSimpleTable = false;
				}

				if (isSimpleTable && (elem.children('colgroup').length === 2 && elem.children('colgroup:first').children('col').length > 1)) {
					isSimpleTable = false;
				}

				if (isSimpleTable && ($('tr:first th, tr:first td, tr', elem).length) < $('th', elem).length) {
					isSimpleTable = false;
				}
				i = 0;
				$('tr:eq(2)', elem).children().each(function () {
					var nn = this.nodeName.toLowerCase();
					if (!isSimpleTable) {
						return;
					}
					if (nn === 'th' && i > 0) {
						isSimpleTable = false;
						return;
					}
					i += 1;
				});

				if (isSimpleTable) {
					// Check if the first row is an header row, move it in a thead section
					domTable = elem.get(0);
					if (!domTable.tHead && domTable.rows[0].cells[domTable.rows[0].cells.length - 1].nodeName === "TH") {
						
						
						$('tr:first()', elem).appendTo($(domTable.createTHead()));
					}
					
					if (!_pe.preIE9) {
						
						if (!opts.columnhighlight) {
							elem.addClass('rowzebra');
						} else {
							elem.addClass('colzebra');
						}
						
						if (!opts.nohover) {
							if (!opts.norowheaderhighlight && !opts.noheaderhighlight) {
								elem.addClass('rowhover');
							} else {
								elem.addClass('rowtdhover');
							}
						}
						
						return;  // Simple Table Zebra Striping done
					} else {

	

						
						// Default Zebra
						$trs = (elem.children('tr').add(elem.children('tbody').children('tr'))).filter(function () {
							return $(this).children('td').length > 0;
						});

						if (!opts.nohover) {
							if (!opts.norowheaderhighlight && !opts.noheaderhighlight) {
								elem.addClass('rowhover');
							} else {
								elem.addClass('rowtdhover');
							}

							// The action "removeClass" and "addClass" instead of the toggle because, if the mouse hover a row and you hit refresh, that row get the hover class when it mouse out, The reverse is wanted. That is the explaination of using removing, adding class.
							$trs.on('mouseleave focusout', function (e) {
								e.stopPropagation();
								$(this).removeClass('table-hover');
							});
							$trs.on('mouseenter focusin', function (e) {
								e.stopPropagation();
								$(this).addClass('table-hover');
							});
						}
	
	
						if (!opts.columnhighlight) {
							elem.addClass('rowzebra');
							
							$trs.filter(':odd').addClass('table-odd');
						} else {
							elem.addClass('colzebra');
							
							$cols = elem.children('colgroup:last').children('col');
	
							$cols.filter(':odd').addClass('table-odd');
						}
						
						return; // Simple Table Zebra Striping done
					}
				}

				

				// Delayed Processing, The complex table parser need to loaded 

				if (_pe.fn.parsertable) {
					_pe.fn.zebra.fnZebraComplexTable(elem, opts);
					return;
				}

				if (_pe.fn.zebra.complexTblStack) {
					_pe.fn.zebra.complexTblStack.push(elem);
					_pe.fn.zebra.complexTblOptsStack.push(jQuery.extend(true, {}, opts));
					return;
				}

				_pe.fn.zebra.complexTblStack = [];
				_pe.fn.zebra.complexTblOptsStack = [];
				_pe.fn.zebra.complexTblStack.push(elem);
				_pe.fn.zebra.complexTblOptsStack.push(jQuery.extend(true, {}, opts));


				_pe.document.on('depsTableParserLoaded', function () {
					while (_pe.fn.zebra.complexTblStack.length > 0) {
						_pe.fn.zebra.fnZebraComplexTable(_pe.fn.zebra.complexTblStack.shift(), _pe.fn.zebra.complexTblOptsStack.shift());
					}
				});

				_pe.wb_load({'dep': ['parserTable']}, 'depsTableParserLoaded');

			} else if (elem.is('dl')) {
				// Create a list based on "dt" element with their one or more "dd" after each of them
				$(elem).children().each(function () {
					var $this = $(this);
					switch (this.nodeName.toLowerCase()) {
					case 'dt':
						if (isodd) {
							isodd = false;
							$this.addClass('list-even');
						} else {
							isodd = true;
							$this.addClass('list-odd');
						}
						dlitem = [];
						lstDlItems.push($this.get(0));
						$this.data().dlitem = dlitem;
						dlitem.push($this.get(0));
						break;
					case 'dd':
						if (isodd) {
							$this.addClass('list-odd');
						} else {
							$this.addClass('list-even');
						}
						lstDlItems.push($this.get(0));
						$this.data().dlitem = dlitem;
						dlitem.push($this.get(0));
						break;
					default:
						break;
					}
				});

				if (!opts.nohover) {
					$(lstDlItems).on('mouseleave focusout', function (e) {
						e.stopPropagation();
						$($(this).data().dlitem).removeClass('list-hover');
					});
					$(lstDlItems).on('mouseenter focusin', function (e) {
						e.stopPropagation();
						$($(this).data().dlitem).addClass('list-hover');
					});
				}
			} else {
				
				if (!opts.nohover) {
					elem.addClass('zebra-hover');
				}
				
				if (_pe.preIE9) {
					
					$lis = elem.children('li');
					parity = (elem.parents('li').length + 1) % 2;
					$lis.filter(':odd').addClass(parity === 0 ? 'list-odd' : 'list-even');
					$lis.filter(':even').addClass(parity === 1 ? 'list-odd' : 'list-even');
					if (!opts.nohover) {
						$lis.on('mouseleave focusout', function (e) {
							e.stopPropagation();
							$(this).removeClass('list-hover');
						});
						$lis.on('mouseenter focusin', function (e) {
							e.stopPropagation();
							$(this).addClass('list-hover');
						});
					}
				}
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
