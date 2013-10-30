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
								sSortAscending: i18n( "%sortAsc" ),
								sSortDescending: i18n( "%sortDesc" )
							},
							oPaginate: {
								sFirst: i18n( "%first" ),
								sLast: i18n( "%last" ),
								sNext: i18n( "%nxt" ),
								sPrevious: i18n( "%prv" )
							},
							sEmptyTable: i18n( "%emptyTbl" ),
							sInfo: i18n( "%infoEntr" ),
							sInfoEmpty: i18n( "%infoEmpty" ),
							sInforFiltered: i18n( "%infoFilt" ),
							sInfoThousands: i18n( "%info1000" ),
							sLengthMenu: i18n( "%lenMenu" ),
							sLoadingRecords: i18n( "%load" ),
							sProcessing: i18n( "%process" ),
							sSearch: i18n( "%srch" ),
							sZeroRecords: i18n( "%infoEmpty" )
						}
					},
					mode = vapour.getMode(),
					_settings = $.extend( true, defaults, vapour.getData( $elm, "wet-boew" ) );

				window.Modernizr.load( [{
					load: [ "site!deps/jquery.dataTables" + mode + ".js" ],
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