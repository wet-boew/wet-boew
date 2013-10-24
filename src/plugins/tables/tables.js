/*
 * Web Experience Toolkit (WET) / Boîte à outils de l"expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Datatables integration plugin
 */
(function( $, window, vapour, undefined ) {
	"use strict";

	var selector = ".wb-tables",
		$document = vapour.doc,

		plugin = {
			init: function( $elm ) {
				window._timer.remove( selector );
				var i18n = window.i18n,
					defaults = {
						asStripeClasses : [],
						oLanguage: {
							oAria: {
								sSortAscending: i18n( "%sSortAscending" ),
								sSortDescending: i18n( "%sSortDescending" )
							},
							oPaginate: {
								sFirst: i18n( "%first" ),
								sLast: i18n( "%last" ),
								sNext: i18n( "%next" ),
								sPrevious: i18n( "%previous" )
							},
							sEmptyTable: i18n( "%sEmptyTable" ),
							sInfo: i18n( "%sInfo" ),
							sInfoEmpty: i18n( "%sInfoEmpty" ),
							sInforFiltered: i18n( "%sInforFiltered" ),
							sInfoThousands: i18n( "%sInfoThousands" ),
							sLengthMenu: i18n( "%sLengthMenu" ),
							sLoadingRecords: i18n( "%sLoadingRecords" ),
							sProcessing: i18n( "%sProcessing" ),
							sSearch: i18n( "%sSearch" ),
							sZeroRecords: i18n( "%sZeroRecords" )
						}
					},
					mode = vapour.getMode(),
					_settings = $.extend( true, defaults, vapour.getData( $elm, "wet-boew" ) );

				window.Modernizr.load( [{
					load: ["site!deps/jquery.dataTables" + mode + ".js"],
					complete: function(){
						$elm.dataTable( _settings );
					}
				}]);
			}
		};

	$document.on( "timerpoke.wb", selector, function() {
		var $elm = $( this );

		plugin.init.apply( this, [ $elm ] );
		return true;
	});

	window._timer.add( selector );
})( jQuery, window, vapour );