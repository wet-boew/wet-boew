/*
 * @title WET-BOEW Tables
 * @overview Integrates the DataTables plugin into WET providing searching, sorting, filtering, pagination and other advanced features for tables.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @jeresiv
 */
(function( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-tables",
	$document = vapour.doc,
	i18n, i18nText, defaults,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 */
	init = function( event ) {

		var $elm = $( event.target );
	
		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = window.i18n;
			i18nText = {
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
				sInfoFiltered: i18n( "%infoFilt" ),
				sInfoThousands: i18n( "%info1000" ),
				sLengthMenu: i18n( "%lenMenu" ),
				sLoadingRecords: i18n( "%load" ),
				sProcessing: i18n( "%process" ),
				sSearch: i18n( "%srch" ),
				sZeroRecords: i18n( "%infoEmpty" )
			};
		}

		defaults = {
			asStripeClasses : [],
			oLanguage: i18nText
		};
		

		window.Modernizr.load([{
			load: [ "site!deps/jquery.dataTables" + vapour.getMode() + ".js" ],
			complete: function() {
				$elm.dataTable( $.extend( true, defaults, vapour.getData( $elm, "wet-boew" ) ) );
			}
		}]);
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, init );

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );