/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/*
 * DataTables
 */
/*global jQuery: false, wet_boew_tables: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.tables = {
		type : 'plugin',
		depends : ['metadata', 'datatables'],
		dependscss : ['datatables'],
		_exec : function(elm) {
			var opts, overrides;
			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {};
			//Defaults
			opts = {
				aaSorting:[[1, 'asc']],
				aColumns : [],		
				aLengthMenu : [10, 25, 50, 100],
				aMobileColumns : false,
				bPaginate : true,
				bSearch : true,
				bSort : true,
				bVisible : true,
				bZebra : false,
				iDisplayLength: 10
			};
			// Extend the defaults with settings passed through settings.js (wet_boew_tables), class-based overrides and the data attribute
			$.metadata.setType('attr', 'data-wet-boew');
			if ( typeof wet_boew_tables !== 'undefined' && wet_boew_tables !== null) {
				$.extend(opts, wet_boew_tables, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}
			elm.dataTable({
				'aaSorting': opts.aaSorting,
				'aoColumnDefs' : [{
					'bVisible' : (opts.bVisible === true),
					'aTargets' : ((_pe.mobile) ? ((opts.aMobileColumns === false) ? opts.aColumns : opts.aMobileColumns) : opts.aColumns)
				}],
				'asStripeClasses' : ((opts.bZebra === true) ? ['odd', 'even'] : []),
				'bFilter' : (opts.bSearch === true),
				'bPaginate' : (opts.bPaginate === true),
				'iDisplayLength' : opts.iDisplayLength,
				'aLengthMenu' : opts.aLengthMenu,
				'bSort' : (opts.bSort === true),
				'oLanguage' : {
					'oAria' : {
						'sSortAscending' : _pe.dic.get('%sSortAscending'),
						'sSortDescending' : _pe.dic.get('%sSortDecending')
					},
					'oPaginate' : {
						'sFirst' : _pe.dic.get('%first'),
						'sLast' : _pe.dic.get('%last'),
						'sNext' : _pe.dic.get('%next'),
						'sPrevious' : _pe.dic.get('%previous')
					},
					'sEmptyTable': _pe.dic.get('%sEmptyTable'),
					'sInfo': _pe.dic.get('%sInfo'),
					'sInfoEmpty': _pe.dic.get('%sInfoEmpty'),
					'sInfoFiltered': _pe.dic.get('%sInfoFiltered'),
					'sInfoThousands': _pe.dic.get('%sInfoThousands'),
					'sLengthMenu': _pe.dic.get('%sLengthMenu'),
					'sLoadingRecords': _pe.dic.get('%loading'),
					'sProcessing': _pe.dic.get('%processing'),
					'sSearch': _pe.dic.get('%filter') + _pe.dic.get('%colon'),
					'sZeroRecords': _pe.dic.get('%no-match-found')
				},
				'fnDrawCallback': function() {
					// Re-equalize element heights if the equalize plugin is active on #wb-main
					if(_pe.main.hasClass('wet-boew-equalize')) {
						_pe.fn.equalize._exec(_pe.main);
					}
				}
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
