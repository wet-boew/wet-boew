/**
 * @title WET-BOEW Tables
 * @overview Integrates the DataTables plugin into WET providing searching, sorting, filtering, pagination and other advanced features for tables.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @jeresiv
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-tables",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	idCount = 0,
	i18n, i18nText, defaults,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			elmId;

		if ( elm ) {
			elmId = elm.id;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = componentName + "-id-" + idCount;
				idCount += 1;
				elm.id = elmId;
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
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
			}

			defaults = {
				asStripeClasses: [],
				language: i18nText,
				dom: "<'top'ilf>rt<'bottom'p><'clear'>"
			};

			Modernizr.load({
				load: [ "site!deps/jquery.dataTables" + wb.getMode() + ".js" ],
				complete: function() {
					var $elm = $( "#" + elmId ),
						dataTableExt = $.fn.dataTableExt;

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
							return wb.formattedNumCompare( a, b );
						},
						"formatted-num-desc": function( a, b ) {
							return wb.formattedNumCompare( b, a );
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
					$elm.dataTable( $.extend( true, {}, defaults, window[ componentName ], wb.getData( $elm, componentName ) ) );
				}
			});
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Handle the draw.dt event
$document.on( "init.dt draw.dt", selector, function( event, settings ) {
	var $elm = $( event.target );

	// Update the aria-pressed properties on the pagination buttons
	// Should be pushed upstream to DataTables
	$( ".dataTables_paginate a" )
		.attr( "role", "button" )
		.not( ".previous, .next" )
			.attr( "aria-pressed", "false" )
			.filter( ".current" )
				.attr( "aria-pressed", "true" );

	if ( event.type === "init" ) {

		// Identify that initialization has completed
		wb.ready( $elm, componentName );
	}

	// Identify that the table has been updated
	$elm.trigger( "wb-updated" + selector, [ settings ] );
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
