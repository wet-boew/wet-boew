/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Zebra
 * @overview Apply Zebra stripping on a complex data table and simulate column hovering effect
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 *
 */
(function( $, window, document, wb ) {
"use strict";

/**
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
 var pluginName = "wb-zebra",
	selector = "." + pluginName,
	hoverColClass = pluginName + "-col-hover",
	selectorHoverCol = "." + hoverColClass + " td, " + hoverColClass + " th",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	readyEvent = "wb-ready" + selector,
	tableParsingEvent = "passiveparse.wb-tableparser",
	tableParsingCompleteEvent = "parsecomplete.wb-tableparser",
	$document = wb.doc,
	idCount = 0,
	i18n, i18nText,

	/**
	 * Main Entry function to apply the complex zebra stripping
	 * @method zebraTable
	 * @param {jQuery DOM element} $elm table element use to apply complex zebra stripping
	 */
	zebraTable = function( $elm ) {
		var i, iLength, tblGroup,
			tblparser = $elm.data().tblparser; // Cache the table parsed results

		function addCellClass( arr, className ) {
			var i, iLength;

			for ( i = 0, iLength = arr.length; i !== iLength; i += 1 ) {
				$( arr[i].elem ).addClass( className );
			}
		}
		// Key Cell
		if ( tblparser.keycell ) {
			addCellClass( tblparser.keycell, "wb-cell-key" );
		}
		// Description Cell
		if ( tblparser.desccell ) {
			addCellClass( tblparser.desccell, "wb-cell-desc" );
		}
		// Layout Cell
		if ( tblparser.layoutCell ) {
			addCellClass( tblparser.layoutCell, "wb-cell-layout" );
		}

		// Summary Row Group
		if ( tblparser.lstrowgroup ) {
			for ( i = 0, iLength = tblparser.lstrowgroup.length; i !== iLength; i += 1 ) {
				tblGroup = tblparser.lstrowgroup[ i ];
				// Add a class to the row
				if ( tblGroup.type === 3 || tblGroup.row[ 0 ].type === 3) {
					$( tblGroup.elem ).addClass( "wb-group-summary" );
				}
			}
		}

		// Summary Column Group
		if ( tblparser.colgroup ) {
			for ( i = 0, iLength = tblparser.colgroup.length; i !== iLength; i += 1 ) {
				tblGroup = tblparser.colgroup[ i ];
				// Add a class to the row
				if ( tblGroup.type === 3 ) {
					$( tblGroup.elem ).addClass( "wb-group-summary" );
				}
			}
		}

		$elm.trigger( readyEvent );
	},

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {DOM element} elm The plugin element being initialized
	 */
	init = function( elm ) {
		var elmId = elm.id,
			modeJS = wb.getMode() + ".js",
			deps = [
				"site!deps/tableparser" + modeJS
			];

		if ( elm.className.indexOf( initedClass ) === -1 ) {
			wb.remove( selector );

			elm.className += " " + initedClass;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = pluginName + "-id-" + idCount;
				idCount += 1;
				elm.id = elmId;
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					tableMention: i18n( "hyphen" ) + i18n( "tbl-txt" ),
					tableFollowing: i18n( "hyphen" ) + i18n( "tbl-dtls" )
				};
			}

			// Load the required dependencies
			Modernizr.load({

				// For loading multiple dependencies
				load: deps,
				complete: function() {

					// Let's parse the table
					$( "#" + elmId ).trigger( tableParsingEvent );
				}
			});
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + tableParsingCompleteEvent, selector, function( event ) {
	var eventType = event.type,
		elm = event.target;

	if ( event.currentTarget !== elm ) {
		return true;
	}

	switch ( eventType ) {

	/*
	 * Init
	 */
	case "timerpoke":
		init( elm );
		break;

	/*
	 * Data table parsed
	 */
	case "parsecomplete":
		zebraTable( $( elm ) );
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Applying the hover, Simulate Column Hovering Effect
$document.on( "mouseenter focusin", selectorHoverCol, function( event ) {
	var tblparserCell = $( event.currentTarget ).data().tblparser;

	if ( tblparserCell.col && tblparserCell.col.elem ) {
		$( tblparserCell.col.elem ).addClass( "table-hover" );
	}
});

// Removing the hover, Simulate Column Hovering Effect
$document.on( "mouseleave focusout", selectorHoverCol, function( event ) {
	var tblparserCell = $( event.currentTarget ).data().tblparser;

	if ( tblparserCell.col && tblparserCell.col.elem ) {
		$( tblparserCell.col.elem ).removeClass( "table-hover" );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
