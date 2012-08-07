 /*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Zebra stripping functionality for block level elements
 */
/*global jQuery: false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.zebra = {
		type : 'plugin',
		_exec : function (elem) {
			var $trs,
				$lis,
				parity;
			if (elem.is('table')) {
				var tblparser,
					i,
					j;
				// TODO: Add an option to force the default zebra
				
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
							if(tblparser.row[i].cell[j].type === 3){
								if(tblparser.row[i].cell[j].col.type === 3){
									$(tblparser.row[i].cell[j].elem).addClass('table-summarycol' + tblparser.row[i].cell[j].collevel); // collevel is a number
								}
								if(tblparser.row[i].type === 3){
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
					if ($(this).data().tblparser.type === 7) {
						$(this).addClass('table-headgroup' + $(this).data().tblparser.scope + $(this).data().tblparser.level);  // level is a number, scope either "row" || "col"
					}
				});
				
				/* The Heading highlight take times to be set up in ÌE and just a little bit more in Firefox
				 *
				 */
				/*
				var getCellHeaders = function (elem) {
					var cellsheader = [],
						tblparser = $(elem).data().tblparser;
					// Get column Headers
					if (tblparser.row && tblparser.row.header) {
						if (!$.isArray(tblparser.row.header)) { 
							cellsheader.push(tblparser.row.header.elem);
						} else {
							for (i = 0; i < tblparser.row.header.length; i += 1) {
								cellsheader.push(tblparser.row.header[i].elem);
							}
						}
					}
					if (tblparser.col && tblparser.col.header){
						for (i = 0; i < tblparser.col.header.length; i += 1) {
							cellsheader.push(tblparser.col.header[i].elem);
						}
					}
					$(elem).data().cellsheader = cellsheader;
				};
				
				// Cell Header Highlight
				var autoRemoveTimeout;
				$('td, th', elem).on('mouseenter focusin', function (e) {
					var tblparser = $(this).data().tblparser;
					clearTimeout(autoRemoveTimeout);
					var oldThHover = $('th.table-hover', elem);
					if (tblparser.type !== 1){
						if (!$(this).data().cellsheader) {
							getCellHeaders(this);
						}
						//$($(this).data().cellsheader).addClass('table-hover');
						$.each($(this).data().cellsheader, function () {
							$(this).addClass('table-hover');
							$(this).data().zebrafor = tblparser.uid;
						});
					} else {
						if (tblparser.scope === "row") {
							$(this).addClass('table-hover');
							$(this).data().zebrafor = tblparser.uid;
						}
					}
					// Remove previous highlight, if required
					$.each(oldThHover, function () {
						if ($(this).data().zebrafor && $(this).data().zebrafor !== tblparser.uid) {
							$(this).removeClass('table-hover');
							delete $(this).data().zebrafor;
						}
					});

				});
				$('td, th', elem).on('mouseleave focusout', function (e) {
					var tblparser = $(this).data().tblparser,
						elem = this;
					autoRemoveTimeout = setTimeout(function () {
						var i;
						if (tblparser.type === 1){
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
				});
				*/
				
				
				// Default Zebra
				$trs = (elem.children('tr').add(elem.children('tbody').children('tr'))).filter(function () {
					return $(this).children('td').length > 0;
				});
				// note: even/odd's indices start at 0
				$trs.filter(':odd').addClass('table-even');
				$trs.filter(':even').addClass('table-odd');
				$trs.on('hover focusin focusout', function (e) {
					e.stopPropagation();
					$(this).toggleClass('table-hover');
				});
				
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