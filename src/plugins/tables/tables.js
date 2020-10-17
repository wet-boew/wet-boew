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
$document.on( "draw.dt", selector, function( event, settings ) {
	var $elm = $( event.target ),
		pagination = $elm.next( ".bottom" ).find( "div:first-child" ),
		paginate_buttons = $elm.next( ".bottom" ).find( ".paginate_button" ),
		pbLength = paginate_buttons.length,
		pHasLF = pagination.find( ".last, .first" ).length === 2,
		pHasPN = pagination.find( ".previous, .next" ).length === 2,
		ol = document.createElement( "OL" ),
		li = document.createElement( "LI" );

	// Determine if Pagination required
	if (
		pbLength === 1 ||
		(
			pbLength === 3 &&
			(
				pHasLF ||
				pHasPN
			)
		) ||
		(
			pbLength === 5 &&
			pHasLF &&
			pHasPN
		)
	) {
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
				"href": "#" + $elm.get( 0 ).id
			} )

			// This is required to override the datatable.js (v1.10.13) behavior to cancel the event propagation on anchor element.
			.on( "keypress", function( evn ) {
				if ( evn.keyCode === 13 ) {
					window.location = evn.target.href;
				}
			} )

			.not( ".previous, .next" )
				.attr( "aria-pressed", "false" )
				.html( function( index, oldHtml ) {
					return "<span class='wb-inv'>" + i18nText.paginate.page + " </span>" + oldHtml;
				} )
				.filter( ".current" )
					.attr( "aria-pressed", "true" );
	}

	// Identify that the table has been updated
	$elm.trigger( "wb-updated" + selector, [ settings ] );
} );

// Identify that initialization has completed
$document.on( "init.dt", function( event ) {
	wb.ready( $( event.target ), componentName );
} );

// Handle the draw.dt event
$document.on( "submit", ".wb-tables-filter", function( event ) {

	event.preventDefault();

	var $form = $( this ),
		$datatable = $( "#" + $form.data( "bind-to" ) ).dataTable( { "retrieve": true } ).api(),
		$toNumber = function stringToNumber( number ) {
			number = number.replace( /[^0-9\-\,\.]+/g, "" );
			if ( /[\,]\d{1,2}$/.test( number ) ) {
				number = number.replace( /(\d{2})$/, ".$1" );
			}
			number = number.replace( /\,/g, "" );
			return parseFloat( number );
		};

	// Lets reset the search
	$datatable.search( "" ).columns().search( "" ).draw();

	// Lets loop throug all options
	var $prevCol = -1, $cachedVal = "";
	$form.find( "[name]" ).each( function() {
		var $elm = $( this ),
			$value = "",
			$regex = "",
			$column = parseInt( $elm.attr( "data-column" ), 10 ),
			$isAopts = $elm.data( "aopts" ),
			$aoptsSelector = "[data-aopts*='\"column\": \"" + $column + "\"']:checked",
			$aopts = $( $aoptsSelector ),
			$aoType = ( $aopts && $aopts.data( "aopts" ) ) ? $aopts.data( "aopts" ).type.toLowerCase() : "";

		// Ignore the advanced options fields
		if ( $isAopts ) {
			return;
		}

		// Verifies if filtering the same column
		if ( $column !== $prevCol || $prevCol === -1 ) {
			$cachedVal = "";
		}
		$prevCol = $column;

		// Filters based on input type
		if ( $elm.is( "select" ) ) {
			$value = $elm.find( "option:selected" ).val();
		} else if ( $elm.is( "input[type='number']" ) ) {
			var $val = $elm.val(), $minNum, $maxNum, $fData;

			// Retain minimum number (always the first number input)
			if ( $cachedVal === "" ) {
				$cachedVal = parseFloat( $val );
				$cachedVal = ( $cachedVal ) ? $cachedVal : "-0";
			}
			$minNum = $cachedVal;

			// Maximum number is always the current selected number
			$maxNum = parseFloat( $val );

			// Generates a list of numbers (within the min and max number)
			if ( !isNaN( $minNum ) && !isNaN( $maxNum ) ) {
				$fData = $datatable.column( $column ).data().filter( function( obj ) {
					var $num = $toNumber( obj.toString() );

					if ( !isNaN( $num ) ) {
						if ( $aoType === "and" ) {
							if ( $cachedVal !== $maxNum && $cachedVal !== "-0" && $num >= $minNum && $num <= $maxNum ) {
								return true;
							}
						} else {
							if ( $cachedVal === $maxNum && $num >= $minNum ) {
								return true;
							} else if ( $cachedVal === "-0" && $num <= $maxNum ) {
								return true;
							} else if ( $cachedVal !== "-0" && $num >= $minNum && $num <= $maxNum ) {
								return true;
							}
						}
					}
					return false;
				} );
				$fData = $fData.join( "|" );

				// If no numbers match set as -0, so no results return
				$value = ( $fData ) ? $fData : "-0";
				$regex = "(" + $value.replace( /\&nbsp\;|\s/g, "\\s" ).replace( /\$/g, "\\$" ) + ")";
			}
		} else if ( $elm.is( ":checkbox" ) ) {

			// Verifies if checkbox is checked before setting value
			if ( $elm.is( ":checked" ) ) {
				if ( $aoType === "both" ) {
					$cachedVal += "(?=.*\\b" + $elm.val() + "\\b)";
				} else {
					$cachedVal += ( $cachedVal.length > 0 ) ? "|" : "";
					$cachedVal += $elm.val();
				}

				$value = $cachedVal;
				$value = $value.replace( /\s/g, "\\s*" );

				// Adjust regex based on advanced options
				switch ( $aoType ) {
				case "both":
					$regex = "(" + $value + ").*";
					break;
				case "either":
					$regex = "^(" + $value + ")$";
					break;
				case "and":
					$regex = ( $value.indexOf( "|" ) > -1 ) ? "^(" + $value + "|[,\\s])(" + $value + "|[,\\s])+$" : "(" + $value + ")";
					break;
				case "any":
				default:
					$regex = "(" + $value + ")";
					break;
				}
			}
		} else {
			$value = $elm.val();
		}

		if ( $value ) {

			// Verifies if regex was preset, if not preset use 'contains value' as default
			if ( !$regex ) {
				$value = $value.replace( /\s/g, "\\s*" );
				$regex = "(" + $value + ")";
			}

			$datatable.column( $column ).search( $regex, true ).draw();
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
	$form.find( "input:radio" ).prop( "checked", false );
	$form.find( "input[type=date]" ).val( "" );

	return false;
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
