/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * DataTables
 */
/*global jQuery: false, wet_boew_tables: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.tables = {
		type: 'plugin',
		depends: ['datatables'],
		_exec: function (elm) {
			var opts,
				overrides;
			
			//Defaults
			opts = {
				paginate: true,
				search: true,
				sort: true,
				vColumns: [],
				visible: true,
				zebra: false
			};
			
			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {};
			
			// Extend the defaults with settings passed through settings.js (wet_boew_tables), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_tables !== 'undefined' ? wet_boew_tables : {}), overrides, _pe.data.getData(elm, 'wet-boew'));
			
			elm.dataTable({
				'aoColumnDefs': [ { 'bVisible': (opts.visible === true), 'aTargets': opts.vColumns } ],
				'asStripeClasses': ((opts.zebra === true) ? ['odd', 'even'] : []),
				'bFilter': (opts.search === true),
				'bPaginate': (opts.paginate === true),
				'bSort': (opts.sort === true),
				'oLanguage': {
					'oAria': {
						'sSortAscending': _pe.dic.get('%sSortAscending'),
						'sSortDescending': _pe.dic.get('%sSortDecending')
					},
					'oPaginate': {
						'sFirst': _pe.dic.get('%first'),
						'sLast': _pe.dic.get('%last'),
						'sNext': _pe.dic.get('%next'),
						'sPrevious': _pe.dic.get('%previous')
					},
					'sEmptyTable': _pe.dic.get('sEmptyTable'),
					'sInfo': _pe.dic.get('%sInfo'),
					'sInfoEmpty': _pe.dic.get('%sInfoEmpty'),
					'sInfoFiltered': _pe.dic.get('%sInfoFiltered'),
					'sInfoThousands': _pe.dic.get('%sInfoThousands'),
					'sLengthMenu': _pe.dic.get('%sLengthMenu'),
					'sLoadingRecords': _pe.dic.get('%loading'),
					'sProcessing': _pe.dic.get('%processing'),
					'sSearch': _pe.dic.get('%search') + _pe.dic.get('%colon'),
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
