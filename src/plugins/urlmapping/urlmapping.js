/**
 * @title WET-BOEW URL mapping
 * @overview Execute pre-configured action based on url query string
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-urlmapping",
	selector = "[data-" + componentName + "]",
	initEvent = "wb-init." + componentName,
	actionEvent = "action." + componentName,
	doMappingEvent = "domapping." + componentName,
	$document = wb.doc,
	authTrigger,
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
			$elm;

		if ( elm ) {
			$elm = $( elm );

			// Only allow the first wb-urlmapping instance to trigger WET
			if ( !authTrigger ) {
				authTrigger = elm;
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );

			if ( !wb.isReady ) {

				// Execution of any action after WET is ready
				$document.one( "wb-ready.wb", function( ) {
					$elm.trigger( doMappingEvent );
				} );
			} else {
				$elm.trigger( doMappingEvent );
			}
		}
	},
	executeAction = function( $elm, cValue, actions ) {

		var i, i_len, i_cache, cache_action,
			regMatchValue,
			pattern, cValueParsed,
			defaultValue;

		if ( !$.isArray( actions ) ) {
			actions = [ actions ];
		} else {
			actions = $.extend( [], actions );
		}

		i_len = actions.length;
		for ( i = 0; i !== i_len; i += 1 ) {
			i_cache = $.extend( {}, actions[ i ] );

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
					cValueParsed = !!cValueParsed ? cValueParsed : defaultValue;
				} catch ( e ) { }
			}

			if ( !i_cache.qval && cValueParsed ) {
				i_cache.qval = cValueParsed;
			}

			$elm.trigger( cache_action + "." + actionEvent, i_cache );
		}
		return true;
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
	};

$document.on( doMappingEvent, selector, function( event ) {

	var elm = event.target,
		$elm = $( elm ),
		queryString = encodeURI( decodeURI( window.location.search.replace( /^\?/, "" ) ) ).replace( /'/g, "%27" ).split( "&" ),
		i, i_len = queryString.length,
		keyQuery, strings,
		cKey, cValue, settingQuery,
		settings = $.extend( {}, window[ componentName ] || { }, wb.getData( $elm, componentName ) );

	for ( i = 0; i !== i_len; i += 1 ) {
		if ( ( keyQuery = queryString[ i ] ) !== null ) {

			strings = keyQuery.split( "=" );
			cKey = decodeURI( strings[ 0 ] );
			cValue = decodeURI( strings[ 1 ] );

			settingQuery = settings[ keyQuery ] || settings[ cKey ];

			if ( typeof settingQuery === "object" ) {
				executeAction( $elm, cValue, settingQuery );
				if ( !settings.multiplequery ) {
					break;
				}
			}
		}
	}
} );

$document.on( "patch." + actionEvent, selector, function( event, data ) {

	// Prepare patches operation for execution by the json-manager
	var source = data.source,
		ops = data.patches,
		basePntr = data.base || "/",
		isCumulative = !!data.cumulative,
		cValue = data.qval;

	if ( !ops ) {
		ops = [ patchDefault ];
		isCumulative = true;
	}

	if ( !$.isArray( ops ) ) {
		ops = [ ops ];
	}

	ops = patchFixArray( ops, cValue, basePntr );

	$( source ).trigger( {
		type: "patches.wb-jsonmanager",
		patches: ops,
		cumulative: isCumulative // Ensure the patches would remain as any other future update.
	} );
} );

$document.on( "ajax." + actionEvent, selector, function( event, data ) {
	var $container, containerID, ajxType;

	if ( !data.container ) {
		containerID = wb.getId();
		$container = $( "<div id='" + containerID + "'></div>" );
		$( event.target ).after( $container );
	} else {
		$container = $( data.container );
	}

	if ( data.trigger && event.target === authTrigger ) {
		$container.attr( "data-trigger-wet", "true" );
	}

	ajxType = data.type ? data.type : "replace";
	$container.attr( "data-ajax-" + ajxType, replaceMappingKeys( data.url, data.qval ) );

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
} );

// addClass action
$document.on( "addClass." + actionEvent, selector, function( event, data ) {
	if ( !data.source || !data.class ) {
		return;
	}
	$( data.source ).addClass( data.class );
} );

// removeClass action
$document.on( "removeClass." + actionEvent, selector, function( event, data ) {
	if ( !data.source || !data.class ) {
		return;
	}
	$( data.source ).removeClass( data.class );
} );

// Apply the filtering
$document.on( "tblfilter." + actionEvent, selector, function( event, data ) {
	if ( event.namespace === actionEvent ) {
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
		column = ( colInt === true ) ? colInt : column;
		$datatable.column( column ).search( replaceMappingKeys( data.value, data.qval ), regex, smart, caseinsen ).draw();
	}
} );

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );


// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
