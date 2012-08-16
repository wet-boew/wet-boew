 /*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Zebra stripping functionality for block level elements
 */
/*global jQuery: false, wet_boew_zebra: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.zebra = {
		type : 'plugin',
		_exec : function (elem) {
			var $trs,
				$cols,
				$lis,
				parity,
				tblparser,
				i,
				j,
				opts,
				overrides,
				getCellHeaders,
				autoRemoveTimeout,
				lstDlItems = [],
				isodd = false,
				dlitem = [];
			// Defaults Options
			opts = {
				noheaderhighlight: false,
				norowheaderhighlight: false,
				nocolheaderhighlight: false,
				columnhighlight: false,
				nohover: false,
				justgroup: false
			};
			// Option to force to do not get header highlight
			overrides = {
				noheaderhighlight: elem.hasClass("noheaderhighlight") ? true : undefined,
				norowheaderhighlight: elem.hasClass("norowheaderhighlight") ? true : undefined,
				nocolheaderhighlight: elem.hasClass("nocolheaderhighlight") ? true : undefined,
				columnhighlight: elem.hasClass("columnhighlight") ? true : undefined,
				nohover: elem.hasClass("nohover") ? true : undefined,
				justgroup: elem.hasClass("justgroup") ? true : undefined
			};
			// Extend the defaults with settings passed through settings.js (wet_boew_zebra), class-based overrides and the data attribute
			//$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_zebra !== 'undefined' && wet_boew_zebra !== null) {
				$.extend(opts, wet_boew_zebra, overrides); //, elem.metadata());
			} else {
				$.extend(opts, overrides); //, elem.metadata());
			}
			if (opts.norowheaderhighlight && opts.nocolheaderhighlight) {
				opts.noheaderhighlight = true;
			}
			if (elem.is('table')) {
				// Parse the table
				if (!$(elem).data().tblparser) {
					_pe.fn.parsertable._exec($(elem));
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
						for (j = 0; j < tblparser.row[i].cell.length; j += 1) {
							if (tblparser.row[i].cell[j].type === 3) {
								if (tblparser.row[i].cell[j].col.type === 3) {
									$(tblparser.row[i].cell[j].elem).addClass('table-summarycol' + tblparser.row[i].cell[j].collevel); // collevel is a number
								}
								if (tblparser.row[i].type === 3) {
									$(tblparser.row[i].cell[j].elem).addClass('table-summaryrow' + tblparser.row[i].cell[j].rowlevel); // rowlevel is a number
									if (tblparser.row[i].level === 0 && tblparser.row[i].header.elem) {
										// Special case for heading in that row
										$(tblparser.row[i].header.elem).addClass('table-summaryrow' + tblparser.row[i].cell[j].rowlevel); // rowlevel is a number
									}
								}
							}
						}
						// Summary group styling
						if (tblparser.row[i].type && tblparser.row[i].type === 3 && tblparser.row[i].rowgroup.elem && i > 0 && tblparser.row[i-1].type && tblparser.row[i-1].type === 3 && tblparser.row[i-1].rowgroup.uid !== tblparser.row[i].rowgroup.uid) {
							$(tblparser.row[i].rowgroup.elem).addClass('table-rowgroupmarker');
						}
					}
				}
				// Header Group
				$('th', elem).each(function () {
					var $this = $(this);
					if ($this.data().tblparser.type === 7) {
						$this.addClass('table-headgroup' + $this.data().tblparser.scope + $this.data().tblparser.level);  // level is a number, scope either "row" || "col"
					}
				});
				
				// Data Column Group
				if (tblparser.colgroup) {
					for (i = 0; i < tblparser.colgroup.length; i += 1) {
						if (tblparser.colgroup[i].elem && ((i > 0 && tblparser.colgroup[i].type === 3 && tblparser.colgroup[i - 1].type === 3 && tblparser.colgroup[i - 1].level > tblparser.colgroup[i].level) ||
						(tblparser.colgroup[i].type === 2 && (i > 0 && tblparser.colgroup[0].type === 2 || i > 1 && tblparser.colgroup[0].type === 1)))) {
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
							tblparser = $(elem).data().tblparser;
						// Get column Headers
						if (tblparser.row && tblparser.row.header && !opts.norowheaderhighlight) {
							if (!$.isArray(tblparser.row.header)) {
								cellsheader.push(tblparser.row.header.elem);
							} else {
								for (i = 0; i < tblparser.row.header.length; i += 1) {
									cellsheader.push(tblparser.row.header[i].elem);
								}
							}
						}
						if (tblparser.col && tblparser.col.header && !opts.nocolheaderhighlight) {
							for (i = 0; i < tblparser.col.header.length; i += 1) {
								cellsheader.push(tblparser.col.header[i].elem);
							}
						}
						$(elem).data().cellsheader = cellsheader;
					};

					// Cell Header Highlight
					$('td, th', elem).on('mouseenter focusin', function () {
						var tblparser = $(this).data().tblparser,
							oldThHover,
							$this = $(this);
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
								var i;
								if (tblparser.type === 1) {
									$(elem).removeClass('table-hover');
									delete $(elem).data().zebrafor;
									return;
								}
								for (i = 0; i < $(elem).data().cellsheader.length; i += 1) {
									if ($($(elem).data().cellsheader[i]).data().zebrafor === tblparser.uid) {
										$($(elem).data().cellsheader[i]).removeClass('table-hover');
										delete $($(elem).data().cellsheader[i]).data().zebrafor;
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
				
				$trs.on('mouseleave focusout', function (e) {
					e.stopPropagation();
					$(this).removeClass('table-hover');
				});
				$trs.on('mouseenter focusin', function (e) {
					e.stopPropagation();
					$(this).addClass('table-hover');
				});
			
				if (!opts.justgroup) {
					if (!opts.columnhighlight) {
						// note: even/odd's indices start at 0
						$trs.filter(':odd').addClass('table-even');
						$trs.filter(':even').addClass('table-odd');
					} else {
						$cols = [];
						for (i = 0; i < tblparser.col.length; i += 1) {
							if (tblparser.col[i].elem) {
								$cols.push(tblparser.col[i].elem);
							}
						}
						$($cols).filter(':odd').addClass('table-even');
						$($cols).filter(':even').addClass('table-odd');
					}
				}
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
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
