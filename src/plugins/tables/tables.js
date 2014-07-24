/**
 * @title WET-BOEW Tables
 * @overview Integrates the DataTables plugin into WET providing searching, sorting, filtering, pagination and other advanced features for tables.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @jeresiv
 */
(function( $, window, wb ) {
"use strict";

wb.plugins.tables = wb.plugin.extend({
	pluginName: "wb-tables",
	dependencies: [ "site!deps/jquery.dataTables" + wb.getMode() + ".js" ],
	readyEvent: function() {
		return "wb-ready" + this.selector();
	},
	init: function($elm) {
		var dataTableExt = $.fn.dataTableExt;

		/*
		 * Extend sorting support
		 */
		$.extend( dataTableExt.type.order, {
			// Enable internationalization support in the sorting
			"html-pre": function( a ) {
				return wb.normalizeDiacritics(
					!a ? "" : a.replace ?
						a.replace( /<.*?>/g, "" ).toLowerCase() : a + ""
				);
			},
			"string-case-pre": function( a ) {
				return wb.normalizeDiacritics( a );
			},
			"string-pre": function( a ) {
				return wb.normalizeDiacritics( a );
			},

			// Formatted number sorting
			"formatted-num-asc": function( a, b ) {
				return wb.formattedNumCompare( b, a );
			},
			"formatted-num-desc": function( a, b ) {
				return wb.formattedNumCompare( a, b );
			}
		} );

		/*
		 * Extend type detection
		 */
		// Formatted numbers detection
		// Based on: http://datatables.net/plug-ins/type-detection#formatted_numbers
		dataTableExt.aTypes.unshift(
			function( sData ) {

				// Strip off HTML tags and all non-alpha-numeric characters (except minus sign)
				var deformatted = sData.replace( /<[^>]*>/g, "" ).replace( /[^\d\-\/a-zA-Z]/g, "" );
				if ( $.isNumeric( deformatted ) || deformatted === "-" ) {
					return "formatted-num";
				}
				return null;
			}
		);

		// Remove HTML tags before doing any filtering for formatted numbers
		dataTableExt.type.search[ "formatted-num" ] = function( data ) {
			return data.replace( /<[^>]*>/g, "" );
		};

		// Add the container or the sorting icons
		$elm.find( "th" ).append( "<span class='sorting-cnt'><span class='sorting-icons'></span></span>" );

		// Create the DataTable object
		$elm.dataTable( $.extend( true, {}, this.defaults($elm), window[ this.pluginName ], wb.getData( $elm, this.pluginName ) ) );
	},
	i18nTextSetup: function(i18n) {
		return {
			aria: {
				sortAscending: i18n( "sortAsc" ),
				sortDescending: i18n( "sortDesc" )
			},
			emptyTable: i18n( "emptyTbl" ),
			info: i18n( "infoEntr" ),
			infoEmpty: i18n( "infoEmpty" ),
			infoFiltered: i18n( "infoFilt" ),
			lengthMenu: i18n( "lenMenu" ),
			loadingRecords: i18n( "load" ),
			paginate: {
				first: i18n( "first" ),
				last: i18n( "last" ),
				next: i18n( "nxt" ),
				previous: i18n( "prv" )
			},
			processing: i18n( "process" ),
			search: i18n( "filter" ),
			thousands: i18n( "info1000" ),
			zeroRecords: i18n( "infoEmpty" )
		};
	},
	defaults: function($elm) {
		var readyEvent = this.readyEvent();
		return {
			asStripeClasses: [],
			language: this.i18nText,
			dom: "<'top'ilf>rt<'bottom'p><'clear'>",
			drawCallback: function( settings ) {
					// Update the aria-pressed properties on the pagination buttons
					// Should be pushed upstream to DataTables
					$( ".dataTables_paginate a" )
						.attr( "role", "button" )
						.not( ".previous, .next" )
							.attr( "aria-pressed", "false" )
							.filter( ".current" )
								.attr( "aria-pressed", "true" );

					// Trigger the wb-ready.wb-tables callback event
					$elm.trigger( readyEvent, [ this, settings ] );
				}
		};
	}
});
wb.plugins.tables.setup();
})( jQuery, window, wb );
