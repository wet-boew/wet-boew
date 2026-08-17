/**
 * @title WET-BOEW Action Manager
 * @overview API that coordinate actions with other wet-boew plugin
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, wb, document ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,
	componentName = "wb-actionmng",
	selector = "." + componentName,
	selectorPreset = "[data-" + componentName + "]",
	runCssFlag = componentName + "Rn",
	initEvent = "wb-init." + componentName,
	actionEvent = componentName + selector,
	postponePreActions = { },
	postponeActions = { },
	groupPostAction = { },
	actionMngEvent = [
		"mapfilter",
		"tocsv",
		"loadJSON",
		"patch",
		"ajax",
		"addClass",
		"removeClass",
		"tblfilter",
		"withInput",
		"run"
	].join( "." + actionEvent + " " ) + "." + actionEvent,

	patchDefault = {
		op: "move",
		path: "{base}",
		from: "{base}/{qval}"
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm,
			actions, i, i_len, i_cache, i_trggrp;

		if ( elm ) {
			$elm = $( elm );

			actions = wb.getData( $elm, componentName );

			if ( actions ) {
				if ( !$.isArray( actions ) ) {
					actions = [ actions ];
				}
				i_len = actions.length;
				for ( i = 0; i !== i_len; i += 1 ) {
					i_cache = actions[ i ];
					i_trggrp = i_cache.trggroup;
					if ( i_trggrp && i_cache.action ) {
						addDelayedAction( i_trggrp, groupPostAction, i_cache );
					}
				}
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	},
	addDelayedAction = function( k, a, o ) {
		if ( !a[ k ] ) {
			a[ k ] = [ ];
		}
		a[ k ].push( o );
	},
	executePostAction = function( $elm, k, a ) {
		var actions, i_cache, i_action;

		actions = a[ k ];
		while ( ( i_cache = actions.shift() ) ) {
			i_action = i_cache.action;
			if ( !i_action ) {
				continue;
			}
			$elm.trigger( i_action + "." + actionEvent, i_cache );
			delete i_cache.action;
		}
	},
	patchAct = function( event, data ) {

		// Prepare patches operation for execution by the json-manager
		var source = data.source,
			ops = data.patches,
			isCumulative = !!data.cumulative;

		if ( !ops ) {
			return;
		}

		if ( !$.isArray( ops ) ) {
			ops = [ ops ];
		}

		$( source ).trigger( {
			type: "patches.wb-jsonmanager",
			patches: ops,
			fpath: data.fpath,
			filter: data.filter || [],
			filternot: data.filternot || [],
			cumulative: isCumulative // Ensure the patches would remain as any other future update.
		} );

	},
	ajaxAct = function( event, data ) {
		var $container, containerID, ajxType;

		if ( !data.container ) {
			containerID = wb.getId();
			$container = $( "<div id='" + containerID + "'></div>" );
			$( event.target ).after( $container );
		} else {
			$container = $( data.container );
		}

		if ( data.trigger ) {
			$container.attr( "data-trigger-wet", "true" );
		}

		ajxType = data.type ? data.type : "replace";
		$container.attr( "data-ajax-" + ajxType, data.url );

		$container.one( "wb-contentupdated", function( event, data ) {
			var updtElm = event.currentTarget,
				trigger = updtElm.getAttribute( "data-trigger-wet" );

			updtElm.removeAttribute( "data-ajax-" + data[ "ajax-type" ] );
			if ( trigger ) {
				$( updtElm )
					.find( wb.allSelectors )
					.addClass( "wb-init" )
					.filter( ":not(#" + updtElm.id + " .wb-init .wb-init)" )
					.trigger( "timerpoke.wb" );
				updtElm.removeAttribute( "data-trigger-wet" );
			}
		} );
		$container.trigger( "wb-update.wb-data-ajax" );
	},
	addClassAct = function( event, data ) {
		var $elm = $( data.source || event.target );
		if ( !data.class ) {
			return;
		}
		$elm.addClass( data.class );
	},
	remClassAct = function( event, data ) {
		var $elm = $( data.source || event.target );
		if ( !data.class ) {
			return;
		}
		$elm.removeClass( data.class );
	},
	tblflrAct = function( event, data ) {
		var elm = event.target,
			$source = $( data.source || elm ),
			$datatable,
			column = data.column,
			colInt = parseInt( column, 10 ),
			regex = !!data.regex,
			smart = ( !data.smart ) ? true : !!data.smart,
			caseinsen = ( !data.caseinsen ) ? true : !!data.caseinsen;

		if ( $source.get( 0 ).nodeName !== "TABLE" ) {
			throw "Table filtering can only applied on table";
		}

		$datatable = $source.dataTable( { "retrieve": true } ).api();

		if ( column ) {
			column = ( colInt === true ) ? colInt : column;
			$datatable.column( column ).search( data.value, regex, smart, caseinsen ).draw();
		} else {
			$datatable.search( data.value, regex, smart, caseinsen ).draw();
		}
	},
	geomapAOIAct = function( event, data ) {
		var $source = $( data.source || event.target ),
			map = $source.get( 0 ).geomap,
			tpFilter = data.filter,
			value = data.value;

		// if aoi => There will be 4 coordinate space separated (Sequence: N E S W)
		if ( tpFilter === "aoi" ) {
			map.zoomAOI( value );
		}

		// if layer => The layer name
		if ( tpFilter === "layer" ) {
			map.showLayer( value, true );
		}
	},

	// @source => jQuery selector to an HTML table
	// @fname => Filename to save the csv
	tblToCSV = function( source, fname ) {

		var $table = $( source ),
			table = $table.get( 0 ),
			isDataTable = table.classList.contains( "wb-tables" ),
			csvText = "",
			fileName = fname || ( table.caption || "table" ) + ".csv",
			rows = table.rows,
			i, rows_len = rows.length,
			j, columns_len = rows[ 0 ].cells.length,
			$datatable;

		// Is a table enhanced with the datatable plugin?
		if ( isDataTable ) {
			$datatable = $table.dataTable( { "retrieve": true } ).api();
			rows_len = $datatable.rows()[ 0 ].length;

			// Need to add the first row, because the header are not included in the list of rows returned by the datatable plugin.
			for ( j = 0; j < columns_len; j = j + 1 ) {
				cellCSVText = rows[ 0 ].cells[ j ].textContent;
				cellCSVText = cellCSVText.replace( /"/g, "\"\"" );
				if ( j ) {
					csvText = csvText + ",\"" + cellCSVText + "\"";
				} else {
					csvText = csvText + "\"" + cellCSVText + "\"";
				}
			}
			csvText = csvText + "\n";
		}

		for ( i = 0; i < rows_len; i = i + 1 ) {

			for ( j = 0; j < columns_len; j = j + 1 ) {
				var cellCSVText;
				if ( isDataTable ) {

					// I would like to use ".node()" instead of ".data()" but it is not possible to get the referencied
					// node because it don't exist if the table have multiple pages.
					cellCSVText = $datatable.cell( i, j, { "page": "all" } ).data();

					// If the content of the cell is HTML, the content will be parsed through a document fragment to extract
					// it's textContent equivalent value
					if ( cellCSVText.indexOf( "<" ) !== -1 ) {
						var div = document.createElement( "div" );
						div.innerHTML = cellCSVText;
						cellCSVText = div.textContent;
					}
				} else {
					cellCSVText = rows[ i ].cells[ j ].textContent;
				}
				cellCSVText = cellCSVText.replace( /"/g, "\"\"" );
				cellCSVText = cellCSVText + "\"";
				if ( j ) {
					csvText = csvText + ",\"" + cellCSVText;
				} else {
					csvText = csvText + "\"" + cellCSVText;
				}
			}

			csvText = csvText + "\n";
		}

		wb.download( new Blob( [ "\ufeff" + csvText ], { type: "text/plain;charset=utf-8" } ), fileName );

	},

	loadJSON = function( data ) {

		// All the options need to be documented
		// * url -> URL of the JSON file to load
		// * nocache -> related to JSON-fetch, see similar
		// * nocachekey -> related to JSON-fetch, see similar
		// * source -> JQuery selector of with has a JSON-MANAGER


		var source = data.source,
			fileUrl = data.url;

		// Add a flag to the JSON-Manager to put in a reload mode to avoid conflict with patches
		$( source ).attr( "data-wb-jsonmanager-reload", "" );

		// Trigger a JSON load on the source
		$( source ).trigger( {
			type: "json-fetch.wb",
			fetch: {
				url: fileUrl,
				nocache: data.nocache,
				nocachekey: data.nocachekey,
				data: data.data,
				contentType: data.contenttype,
				method: data.method
			}
		} );

	},

	// From a user input or a predefined input, apply some tranformation to the command prior to execute it
	// This functionality was already in the URL mapping and was moved here to be reused by any user input
	withInput = function( event, data ) {

		// * data.srcInput; // ex. jQuery Selector pointing to an input
		// If cValue is specified (like from the URL mapping), the second parameter is ignored
		var cValue = data.cValue || $( data.srcInput ).val() || "",
			settingQuery = data,
			dontTriggerWET = data.dntwb, // do not trigger WET
			elm = event.target;

		// Test is actions is an array, in false this action must be rejected. The docs should contains that info too.

		executePreRenderAction( elm.id, cValue, settingQuery.actions, dontTriggerWET );


	},

	executePreRenderAction = function( elmID, cValue, actions, dontTriggerWET ) {

		var i, i_len, i_cache, cache_action,
			regMatchValue,
			pattern, cValueParsed,
			defaultValue;


		if ( !$.isArray( actions ) ) {
			actions = [ actions ];
		} else {
			actions = $.extend( [], actions );
		}

		// Fix any action that was defined as query dependent
		i_len = actions.length;
		for ( i = 0; i !== i_len; i += 1 ) {
			i_cache = actions[ i ];

			cache_action = i_cache.action;
			if ( !cache_action ) {
				continue;
			}

			regMatchValue = i_cache.match;
			defaultValue = i_cache.default;
			cValueParsed = false;

			// Abort if we try to match and there is no default set
			if ( regMatchValue && !defaultValue ) {
				throw "'match' and 'default' property need to be set";
			}

			// Validate the value if it match the regular expression / string pattern.
			if ( !!defaultValue && cValue.length && typeof regMatchValue === "string" ) {
				try {
					pattern = new RegExp( regMatchValue );
					cValueParsed = pattern.exec( cValue );

					// Fall back on default if no match found
					cValueParsed = cValueParsed ? cValueParsed : defaultValue;
				} catch ( e ) {

					// continue regardless of error
				}
			} else if ( !cValueParsed && !!defaultValue && !cValue ) {
				cValueParsed = defaultValue;
			}

			if ( !i_cache.qval && cValueParsed ) {
				i_cache.qval = cValueParsed;
			}


			switch ( cache_action ) {

			case "patch":
				var ops = i_cache.patches,
					basePntr = i_cache.base || "/";
				if ( !ops ) {
					ops = [ patchDefault ];
					i_cache.cumulative = true;
				}
				if ( !$.isArray( ops ) ) {
					ops = [ ops ];
				}
				ops = patchFixArray( ops, i_cache.qval, basePntr );
				i_cache.patches = ops;
				break;
			case "ajax":
				if ( i_cache.trigger && dontTriggerWET ) {
					i_cache.trigger = false;
				}
				i_cache.url = replaceMappingKeys( i_cache.url, i_cache.qval );
				break;
			case "tblfilter":
				i_cache.value = replaceMappingKeys( i_cache.value, i_cache.qval );
				break;
			default:

				// Just do the action as defined.
				break;

			}

			// Postpone the action to be executed after the "withInput" action
			addDelayedAction( elmID, postponeActions, i_cache );
		}

	},
	patchFixArray = function( patchArray, val, basePointer ) {

		var i, i_len = patchArray.length, i_cache,
			patchesFixed = [], patch_cache;

		if ( !basePointer ) {
			basePointer = "/";
		}

		for ( i = 0; i !== i_len; i += 1 ) {
			i_cache = patchArray[ i ];
			patch_cache = $.extend( { }, i_cache );
			if ( i_cache.path ) {
				patch_cache.path = replaceMappingKeys( i_cache.path, val, basePointer );
			}
			if ( i_cache.from ) {
				patch_cache.from = replaceMappingKeys( i_cache.from, val, basePointer );
			}
			if ( i_cache.value ) {
				patch_cache.value = replaceMappingKeys( i_cache.value, val, basePointer );
			}
			patchesFixed.push( patch_cache );
		}
		return patchesFixed;
	},
	replaceMappingKeys = function( search, val, basePointer ) {
		if ( !val ) {
			return search;
		}
		if ( !basePointer ) {
			return search.replace( /\{qval\}/, val );
		} else {
			return search.replace( /\{qval\}/, val ).replace( /\{base\}/, basePointer );
		}
	},

	runAct = function( event, data ) {

		var elm = event.target,
			$elm = $( elm ),
			grpAction = groupPostAction[ data.trggroup ],
			i, i_len, i_cache, i_action;

		if ( grpAction && !$elm.hasClass( runCssFlag ) ) {
			$elm.addClass( runCssFlag );

			i_len = grpAction.length;
			for ( i = 0; i !== i_len; i += 1 ) {
				i_cache = grpAction[ i ];

				i_action = i_cache.action;
				if ( !i_action ) {
					continue;
				}
				$elm.trigger( i_action + "." + actionEvent, i_cache );
			}
			$elm.removeClass( runCssFlag );
		}
	};

// Main entry to submit wet-boew plugin actions
// It will be only executed once per event chain
$document.on( "do." + actionEvent, function( event ) {
	var elm =  event.element || event.target,
		$elm, elmID = elm.id,
		actions = event.actions || [ ],
		i, i_len, i_cache,
		i_action, i_target, i_trggrp;

	// Filter out any events triggered by descendants
	if ( ( elm === event.target || event.currentTarget === event.target ) && elm.className.indexOf( componentName ) === -1 ) {

		if ( !$.isArray( actions ) ) {
			actions = [ actions ];
		}

		i_len = actions.length;

		// Add a CSS selector to trigger action Events
		if ( i_len ) {
			$elm = $( elm );
			$elm.addClass( componentName );
		}

		// For this elements, check if we do not have some postponed pre action to execute.
		if ( elmID && postponePreActions[ elmID ] ) {
			executePostAction( $elm, elmID, postponePreActions );
		}

		for ( i = 0; i !== i_len; i += 1 ) {
			i_cache = actions[ i ];

			i_action = i_cache.action;
			if ( !i_action ) {
				continue;
			}

			i_target = i_cache.target;
			if ( i_target ) {

				if ( !i_cache.trgbefore ) {
					addDelayedAction( i_target, postponeActions, i_cache );
				} else {
					addDelayedAction( i_target, postponePreActions, i_cache );
				}

				// If the target are in a group
				i_trggrp = i_cache.trggroup;
				if ( i_trggrp ) {
					addDelayedAction( i_trggrp, groupPostAction, i_cache );
				}
			} else {
				$elm.trigger( i_action + "." + actionEvent, i_cache );
			}
		}

		// For this elements, check if we do not have some postponed action to execute.
		if ( elmID && postponeActions[ elmID ] ) {
			executePostAction( $elm, elmID, postponeActions );
		}

		$( event.target ).removeClass( componentName );
	}
} );

//Remove any action for grouped postponed action
$document.on( "clean." + actionEvent, function( event ) {
	var elm =  event.element || event.target,
		targetGroup = event.trggroup,
		actionsGrp, i_cache;

	// Filter out any events triggered by descendants
	if ( elm === event.target || event.currentTarget === event.target ) {
		if ( targetGroup && groupPostAction[ targetGroup ] ) {
			actionsGrp = groupPostAction[ targetGroup ];
			while ( ( i_cache = actionsGrp.shift() ) ) {
				delete i_cache.action;
			}
		}
	}
} );

$document.on( actionMngEvent, selector, function( event, data ) {

	var eventType = event.type;

	if ( actionEvent === event.namespace ) {
		switch ( eventType ) {
		case "run":
			runAct( event, data );
			break;
		case "tblfilter":
			tblflrAct( event, data );
			break;
		case "addClass":
			addClassAct( event, data );
			break;
		case "removeClass":
			remClassAct( event, data );
			break;
		case "ajax":
			ajaxAct( event, data );
			break;
		case "patch":
			patchAct( event, data );
			break;
		case "mapfilter":
			geomapAOIAct( event, data );
			break;
		case "tocsv":
			tblToCSV( data.source, data.filename );
			break;
		case "loadJSON":
			loadJSON( data );
			break;
		case "withInput":
			withInput( event, data );
			break;
		}
	}
} );

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selectorPreset, init );

// Add the timer poke to initialize the plugin
wb.add( selectorPreset );

} )( jQuery, wb, document );
