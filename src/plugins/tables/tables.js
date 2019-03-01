/**
 * @title WET-BOEW Tables
 * @overview Integrates the DataTables plugin into WET providing searching, sorting, filtering, pagination and other advanced features for tables.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @jeresiv
 */
/*jshint scripturl:true*/
( function( $, window, wb ) {
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
						previous: i18n( "prv" ),
						page: i18n( "page" )
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
				dom: "<'top'fil>rt<'bottom'p><'clear'>"
			};

			Modernizr.load( {
				load: [ "site!deps/jquery.dataTables" + wb.getMode() + ".js" ],
				testReady: function() {
					return ( $.fn.dataTable && $.fn.dataTable.version );
				},
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

					// Add the container or the sorting icons
					$elm.find( "th" ).append( "<span class='sorting-cnt'><span class='sorting-icons'></span></span>" );

					// Create the DataTable object
					$elm.dataTable( $.extend( true, {}, defaults, window[ componentName ], wb.getData( $elm, componentName ) ) );
				}
			} );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Handle the draw.dt event
$document.on( "init.dt draw.dt", selector, function( event, settings ) {
	var $elm = $( event.target ),
		pagination = $elm.next( ".bottom" ).find( "div:first-child" ),
		paginate_buttons = $elm.next( ".bottom" ).find( ".paginate_button" ),
		ol = document.createElement( "OL" ),
		li = document.createElement( "LI" );

	// Determine if Pagination required
	if ( paginate_buttons.length === 1 || ( pagination.find( ".previous, .next" ).length === 2 && paginate_buttons.length < 4 ) ) {
		pagination.addClass( "hidden" );
	} else {

		// Make sure Pagination is visible
		pagination.removeClass( "hidden" );

		// Update Pagination List
		for ( var i = 0; i < paginate_buttons.length; i++ ) {
			var item = li.cloneNode( true );
			item.appendChild( paginate_buttons[ i ] );
			ol.appendChild( item );
		}

		ol.className = "pagination mrgn-tp-0 mrgn-bttm-0";
		pagination.empty();
		pagination.append( ol );

		// Update the aria-pressed properties on the pagination buttons
		// Should be pushed upstream to DataTables
		$elm.next( ".bottom" ).find( ".paginate_button" )
			.attr( {
				"role": "button",
				"href": "javascript:;"
			} )
			.not( ".previous, .next" )
				.attr( "aria-pressed", "false" )
				.html( function( index, oldHtml ) {
					return "<span class='wb-inv'>" + i18nText.paginate.page + " </span>" + oldHtml;
				} )
				.filter( ".current" )
					.attr( "aria-pressed", "true" );
	}

	if ( event.type === "init" ) {

		// Identify that initialization has completed
		wb.ready( $elm, componentName );
	}

	// Identify that the table has been updated
	$elm.trigger( "wb-updated" + selector, [ settings ] );
} );

// Handle the draw.dt event
$document.on( "submit", ".wb-tables-filter", function( event ) {

	event.preventDefault();

	var $form = $( this ),
		$datatable = $( "#" + $form.data( "bind-to" ) ).dataTable( { "retrieve": true } ).api();

	// Lets reset the search;
	$datatable.search( "" ).columns().search( "" );

	// Lets loop throug all options
	var $value = "", $lastColumn = -1, $startDate = "1800-01-01", $endDate = "2100-01-31";
	$form.find( "[name]" ).each( function() {
		var $elm = $( this ),
			$column = parseInt( $elm.attr( "data-column" ), 10 );

		if ( $elm.is( "select" ) ) {
			$value = $elm.find( "option:selected" ).val();
		} else if ( $elm.is( ":checkbox" ) ) {
			if ( $column !== $lastColumn && $lastColumn !== -1 ) {
				$value = "";
			}
			$lastColumn = $column;

			if ( $elm.is( ":checked" ) ) {
				$value += ( $value.length > 0 ) ? "|" : "";
				$value += $elm.val();
			}
		} else if ( $elm.is( "input[type='date']" ) && $elm.val() ) {
			if ( $elm.is( "[name*='start']" ) ) {
				$startDate = $elm.val();
			} else if ( $elm.is( "[name*='end']" ) ) {
				$endDate = $elm.val();
			}

			var $filteredData = $datatable.column( $column ).data().filter( function( obj ) {
				var date1 = new Date( $startDate ),
					date2 = new Date( $endDate ),
					objDate = new Date( obj );

				if ( !isValidDate( date1 ) || !isValidDate( date2 ) || !isValidDate( objDate ) ) {
					return;
				}

				date1.setDate( date1.getDate() + 1 );
				date2.setDate( date2.getDate() + 1 );

				date1.setHours( 0, 0, 0, 0 );
				date2.setHours( 23, 59, 59, 999 );
				objDate.setHours( 0, 0, 0, 0 );

				return ( objDate >= date1 && objDate <= date2 );
			} );

			var data = $filteredData.join( "|" );
			$value = ( data ) ? data : "9999-99-99";
		} else {
			$value = $elm.val();
		}

		if ( $value ) {
			$value = $value.replace( /\s/g, "\\s*" );
			$datatable.column( $column ).search( "(" + $value + ")", true ).draw();
		}
	} );

	return false;
} );

$document.on( "click", ".wb-tables-filter [type='reset']", function( event ) {
	event.preventDefault();

	var $form = $( this ).closest( ".wb-tables-filter" ),
		$datatable = $( "#" + $form.data( "bind-to" ) ).dataTable( { "retrieve": true } ).api();

	$datatable.search( "" ).columns().search( "" ).draw();

	$form.find( "select" ).prop( "selectedIndex", 0 );
	$form.find( "input:checkbox" ).prop( "checked", false );
	$form.find( "input[type=date]" ).val( "" );

	return false;
} );

// Used to check if browser supports the date format being used
function isValidDate( date ) {
	return date instanceof Date && !isNaN( date );
}

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
