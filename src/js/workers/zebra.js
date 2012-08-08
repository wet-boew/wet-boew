 /*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Zebra stripping functionality for block level elements
 */
/*global jQuery: false, pe: false, wet_boew_zebra: false*/
(function ($) {
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
				autoRemoveTimeout;
			if (elem.is('table')) {
				// Defaults
				opts = {
					noheaderhighlight: false,
					norowheaderhighlight: false,
					nocolheaderhighlight: false,
					columnhighlight: false
				};
				// Option to force to do not get header highlight
				overrides = {
					noheaderhighlight: elem.hasClass("noheaderhighlight") ? true : undefined,
					norowheaderhighlight: elem.hasClass("norowheaderhighlight") ? true : undefined,
					nocolheaderhighlight: elem.hasClass("nocolheaderhighlight") ? true : undefined,
					columnhighlight: elem.hasClass("columnhighlight") ? true : undefined
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
								}
							}
						}
						if (tblparser.row[i].type && tblparser.row[i].type === 3) {
							$(tblparser.row[i].elem).parent().addClass('table-summary');
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
				$trs.on('hover focusin focusout', function (e) {
					e.stopPropagation();
					$(this).toggleClass('table-hover');
				});
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
			} else {
				$lis = elem.children('li');
				parity = (elem.parents('li').length + 1) % 2;
				$lis.filter(':odd').addClass(parity === 0 ? 'list-odd' : 'list-even');
				$lis.filter(':even').addClass(parity === 1 ? 'list-odd' : 'list-even');
				$lis.on('mouseover mouseout focusin focusout', function (e) {
					e.stopPropagation();
					$(this).toggleClass('list-hover');
				});
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));