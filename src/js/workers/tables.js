/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * DataTables
 */
/*global jQuery: false, pe:false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.tables = {
		type: 'plugin',
		depends: ['datatables'],
		dependscss: ['datatables'],
		_exec: function (elm) {
			elm.dataTable({
				'oLanguage': {
					'oAria': {
						'sSortAscending': pe.dic.get('%sSortAscending'),
						'sSortDescending': pe.dic.get('%sSortDecending')
					},
					'oPaginate': {
						'sFirst': pe.dic.get('%first'),
						'sLast': pe.dic.get('%last'),
						'sNext': pe.dic.get('%next'),
						'sPrevious': pe.dic.get('%previous')
					},
					'sEmptyTable': pe.dic.get('sEmptyTable'),
					'sInfo': pe.dic.get('%sInfo'),
					'sInfoEmpty': pe.dic.get('%sInfoEmpty'),
					'sInfoFiltered': pe.dic.get('%sInfoFiltered'),
					'sInfoThousands': pe.dic.get('%sInfoThousands'),
					'sLengthMenu': pe.dic.get('%sLengthMenu'),
					'sLoadingRecords': pe.dic.get('%loading'),
					'sProcessing': pe.dic.get('%processing'),
					'sSearch': pe.dic.get('%search') + pe.dic.get('%colon'),
					'sZeroRecords': pe.dic.get('%no-match-found')
				}
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
