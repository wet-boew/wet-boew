/**
 * @title WET-BOEW Data Json [data-json-after], [data-json-append],
 * [data-json-before], [data-json-prepend], [data-json-replace], [data-json-replacewith] and [data-wb-json]
 * @overview Insert content extracted from JSON file.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
/*global jsonpointer */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-data-json",
	shortName = "wb-json",
	selectors = [
		"[data-json-after]",
		"[data-json-append]",
		"[data-json-before]",
		"[data-json-prepend]",
		"[data-json-replace]",
		"[data-json-replacewith]",
		"[data-" + shortName + "]"
	],
	allowJsonTypes = [ "after", "append", "before", "prepend", "val" ],
	allowAttrNames = /(href|src|data-*|pattern|min|max|step|low|high)/,
	allowPropNames = /(checked|selected|disabled|required|readonly|multiple|hidden)/,
	selectorsLength = selectors.length,
	selector = selectors.join( "," ),
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	contentUpdatedEvent = "wb-contentupdated",
	dataQueue = componentName + "-queue",
	$document = wb.doc,
	s,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {string} ajaxType The type of JSON operation, either after, append, before or replace
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm;

		if ( elm ) {

			var jsonCoreTypes = [
					"before",
					"replace",
					"replacewith",
					"after",
					"append",
					"prepend"
				],
				jsonType, jsondata,
				i, i_len = jsonCoreTypes.length, i_cache,
				lstCall = [],
				url;

			$elm = $( elm );

			for ( i = 0; i !== i_len; i += 1 ) {
				jsonType = jsonCoreTypes[ i ];
				url = elm.getAttribute( "data-json-" + jsonType );
				if ( url !== null ) {
					lstCall.push( {
						type: jsonType,
						url: url
					} );
				}
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );

			jsondata = wb.getData( $elm, shortName );

			if ( jsondata && jsondata.url ) {
				lstCall.push( jsondata );
			} else if ( jsondata && $.isArray( jsondata ) ) {
				i_len = jsondata.length;
				for ( i = 0; i !== i_len; i += 1 ) {
					lstCall.push( jsondata[ i ] );
				}
			}

			// Save it to the dataJSON object.
			$elm.data( dataQueue, lstCall );

			i_len = lstCall.length;
			for ( i = 0; i !== i_len; i += 1 ) {
				i_cache = lstCall[ i ];
				loadJSON( elm, i_cache.url, i, i_cache.nocache, i_cache.nocachekey, i_cache.data, i_cache.contenttype, i_cache.method );
			}

		}
	},

	loadJSON = function( elm, url, refId, nocache, nocachekey, data, contentType, method ) {
		var $elm = $( elm ),
			fetchObj = {
				url: url,
				refId: refId,
				nocache: nocache,
				nocachekey: nocachekey,
				data: data,
				contentType: contentType,
				method: method
			};

		$elm.trigger( {
			type: "json-fetch.wb",
			fetch: fetchObj
		} );
	},


	// Manage JSON value After the json data has been fetched. This function can deal with array.
	jsonFetched = function( event ) {

		var elm = event.target,
			$elm = $( elm ),
			lstCall = $elm.data( dataQueue ),
			fetchObj = event.fetch,
			itmSettings = lstCall[ fetchObj.refId ],
			jsonType = itmSettings.type,
			attrname = itmSettings.prop || itmSettings.attr,
			showEmpty = itmSettings.showempty,
			content = fetchObj.response,
			typeOfContent = typeof content,
			jQueryCaching;

		if ( showEmpty || typeOfContent !== "undefined" ) {

			if ( showEmpty && typeOfContent === "undefined" ) {
				content = "";
			}

			//Prevents the force caching of nested resources
			jQueryCaching = jQuery.ajaxSettings.cache;
			jQuery.ajaxSettings.cache = true;

			// "replace" and "replaceWith" doesn't map to a jQuery function
			if ( !jsonType ) {
				jsonType = "template";
				applyTemplate( elm, itmSettings, content );

				// Trigger wet
				if ( itmSettings.trigger ) {
					$elm
						.find( wb.allSelectors )
						.addClass( "wb-init" )
						.filter( ":not(#" + elm.id + " .wb-init .wb-init)" )
						.trigger( "timerpoke.wb" );
				}
			} else if ( jsonType === "replace" ) {
				$elm.html( content );
			} else if ( jsonType === "replacewith" ) {
				$elm.replaceWith( content );
			} else if ( jsonType === "addclass" ) {
				$elm.addClass( content );
			} else if ( jsonType === "removeclass" ) {
				$elm.removeClass( content );
			} else if ( jsonType === "prop" && attrname && allowPropNames.test( attrname ) ) {
				$elm.prop( attrname, content );
			} else if ( jsonType === "attr" && attrname && allowAttrNames.test( attrname ) ) {
				$elm.attr( attrname, content );
			} else if ( typeof $elm[ jsonType ] === "function" && allowJsonTypes.indexOf( jsonType ) !== -1 ) {
				$elm[ jsonType ]( content );
			} else {
				throw componentName + " do not support type: " + jsonType;
			}

			//Resets the initial jQuery caching setting
			jQuery.ajaxSettings.cache = jQueryCaching;

			$elm.trigger( contentUpdatedEvent, { "json-type": jsonType, "content": content } );
		}
	},

	// Apply the template as per the configuration
	applyTemplate = function( elm, settings, content ) {

		var mapping = settings.mapping || [ {} ],
			mapping_len,
			filterTrueness = settings.filter || [],
			filterFaslseness = settings.filternot || [],
			queryAll = settings.queryall,
			i, i_len, i_cache,
			j, j_cache, j_cache_attr,
			basePntr,
			clone, selElements,
			cached_node,
			cached_textContent,
			cached_value,
			selectorToClone = settings.tobeclone,
			elmClass = elm.className,
			elmAppendTo = elm,
			dataTable,
			dataTableAddRow,
			template = settings.source ? document.querySelector( settings.source ) : elm.querySelector( "template" );

		// If combined with wb-tables plugin
		if ( elm.tagName === "TABLE" && elmClass.indexOf( "wb-tables" ) !== -1 ) {

			//  Wait for its initialization before to applyTemplate
			if ( elmClass.indexOf( "wb-tables-inited" ) === -1 ) {
				$( elm ).one( "wb-ready.wb-tables,init.dt", function( ) {
					applyTemplate( elm, settings, content );
				} );
				return;
			}

			// Edge case, when both plugin are ready at the same time, just wait for the next tick
			if ( !$.fn.dataTable.isDataTable( elm ) && elmClass.indexOf( componentName + "-dtwait" ) === -1 ) {
				elm.classList.add( componentName + "-dtwait" );
				setTimeout( function( ) {
					applyTemplate( elm, settings, content );
				}, 50 );
				return;
			}

			dataTable = $( elm ).dataTable( { "retrieve": true } ).api();
			dataTableAddRow = dataTable.row.add;
			selectorToClone = "tr"; // Only table row can be added
		}

		if ( !$.isArray( content ) ) {
			if ( typeof content !== "object" ) {
				content = [ content ];
			} else {
				content = $.map( content, function( val, index ) {
					if ( typeof val === "object" && !$.isArray( val ) ) {
						if ( !val[ "@id" ] ) {
							val[ "@id" ] = index;
						}
					} else {
						val = {
							"@id": index,
							"@value": val
						};
					}
					return [ val ];
				} );
			}
		}
		i_len = content.length;

		if ( !$.isArray( mapping ) ) {
			mapping = [ mapping ];
		}
		mapping_len = mapping.length;

		if ( !template ) {
			return;
		}

		// Needed when executing sub-template that wasn't polyfill, like in IE11
		if ( !template.content ) {
			wb.tmplPolyfill( template );
		}

		if ( settings.appendto ) {
			elmAppendTo = $( settings.appendto ).get( 0 );
		}

		for ( i = 0; i < i_len; i += 1 ) {
			i_cache = content[ i ];

			if ( filterPassJSON( i_cache, filterTrueness, filterFaslseness ) ) {

				basePntr = "/" + i;

				if ( !selectorToClone ) {
					clone = template.content.cloneNode( true );
				} else {
					clone = template.content.querySelector( selectorToClone ).cloneNode( true );
				}

				if ( queryAll ) {
					selElements = clone.querySelectorAll( queryAll );
				}

				for ( j = 0; j < mapping_len || j === 0; j += 1 ) {
					j_cache = mapping[ j ];

					// Get the node used to insert content
					if ( selElements ) {
						cached_node = selElements[ j ];
					} else if ( j_cache.selector ) {
						cached_node = clone.querySelector( j_cache.selector );
					} else {
						cached_node = clone;
					}
					j_cache_attr = j_cache.attr;
					if ( j_cache_attr ) {
						if ( !cached_node.hasAttribute( j_cache_attr ) ) {
							cached_node.setAttribute( j_cache_attr, "" );
						}
						cached_node = cached_node.getAttributeNode( j_cache_attr );
					}

					// Get the value
					if ( typeof i_cache === "string" ) {
						cached_value = i_cache;
					} else if ( typeof j_cache === "string" ) {
						cached_value = jsonpointer.get( content, basePntr + j_cache );
					} else {
						cached_value = jsonpointer.get( content, basePntr + j_cache.value );
					}

					// Placeholder text replacement if any
					if ( j_cache.placeholder ) {
						cached_textContent = cached_node.textContent || "";
						cached_value = cached_textContent.replace( j_cache.placeholder, cached_value );
					}

					// Set the value to the node
					if ( $.isArray( cached_value ) ) {
						applyTemplate( cached_node, j_cache, cached_value );
					} else if ( j_cache.isHTML ) {
						cached_node.innerHTML = cached_value;
					} else {
						cached_node.textContent = cached_value;
					}
				}

				if ( dataTableAddRow ) {

					// If wb-tables, use its API to add rows
					dataTableAddRow( $( clone ) );
				} else {
					elmAppendTo.appendChild( clone );
				}
			}
		}

		// Refresh the dataTable display
		if ( dataTableAddRow ) {
			dataTable.draw();
		}
	},

	// Filtering a JSON
	// Return true if trueness && falseness
	// Return false if !( trueness && falseness )
	// trueness and falseness is an array of { "path": "", "value": "" } object
	filterPassJSON = function( obj, trueness, falseness ) {
		var i, i_cache,
			trueness_len = trueness.length,
			falseness_len = falseness.length,
			compareResult = false,
			isEqual;

		if ( trueness_len || falseness_len ) {

			for ( i = 0; i < trueness_len; i += 1 ) {
				i_cache = trueness[ i ];
				isEqual = _equalsJSON( jsonpointer.get( obj, i_cache.path ), i_cache.value );

				if ( i_cache.optional ) {
					compareResult = compareResult || isEqual;
				} else if ( !isEqual ) {
					return false;
				} else {
					compareResult = true;
				}
			}
			if ( trueness_len && !compareResult ) {
				return false;
			}

			for ( i = 0; i < falseness_len; i += 1 ) {
				i_cache = falseness[ i ];
				isEqual = _equalsJSON( jsonpointer.get( obj, i_cache.path ), i_cache.value );

				if ( isEqual && !i_cache.optional || isEqual && i_cache.optional ) {
					return false;
				}
			}

		}
		return true;
	},

	//
	_equalsJSON = function( a, b ) {
		switch ( typeof a ) {
		case "undefined":
			return false;
		case "boolean":
		case "string":
		case "number":
			return a === b;
		case "object":
			if ( a === null ) {
				return b === null;
			}
			var i, l;
			if ( $.isArray( a ) ) {
				if (  $.isArray( b ) || a.length !== b.length ) {
					return false;
				}
				for ( i = 0, l = a.length; i < l; i++ ) {
					if ( !_equalsJSON( a[ i ], b[ i ] ) ) {
						return false;
					}
				}
				return true;
			}
			var bKeys = _objectKeys( b ),
				bLength = bKeys.length;
			if ( _objectKeys( a ).length !== bLength ) {
				return false;
			}
			for ( i = 0; i < bLength; i++ ) {
				if ( !_equalsJSON( a[ i ], b[ i ] ) ) {
					return false;
				}
			}
			return true;
		default:
			return false;
		}
	},
	_objectKeys = function( obj ) {
		var keys;
		if ( $.isArray( obj ) ) {
			keys = new Array( obj.length );
			for ( var k = 0; k < keys.length; k++ ) {
				keys[ k ] = "" + k;
			}
			return keys;
		}
		if ( Object.keys ) {
			return Object.keys( obj );
		}
		keys = [];
		for ( var i in obj ) {
			if ( Object.prototype.hasOwnProperty.call( obj, i ) ) {
				keys.push( i );
			}
		}
		return keys;
	},

	// Manage JSON value After the json data has been fetched
	jsonUpdate = function( event ) {
		var elm = event.target,
			$elm = $( elm ),
			lstCall = $elm.data( dataQueue ),
			refId = lstCall.length,
			wbJsonConfig = event[ "wb-json" ];

		if ( !( wbJsonConfig.url && ( wbJsonConfig.type || wbJsonConfig.source ) ) ) {
			throw "Data JSON update not configured properly";
		}

		lstCall.push( wbJsonConfig );
		$elm.data( dataQueue, lstCall );

		loadJSON( elm, wbJsonConfig.url, refId );
	};

$document.on( "json-failed.wb", selector, function( ) {
	throw "Bad JSON Fetched from url in " + componentName;
} );

// Load template polyfill
Modernizr.load( {
	test: ( "content" in document.createElement( "template" ) ),
	nope: "site!deps/template" + wb.getMode() + ".js"
} );

$document.on( "timerpoke.wb " + initEvent + " " + updateEvent + " json-fetched.wb", selector, function( event ) {

	if ( event.currentTarget === event.target ) {
		switch ( event.type ) {

		case "timerpoke":
		case "wb-init":
			init( event );
			break;
		case "wb-update":
			jsonUpdate( event );
			break;
		default:
			jsonFetched( event );
			break;
		}
	}

	return true;
} );

// Add the timerpoke to initialize the plugin
for ( s = 0; s !== selectorsLength; s += 1 ) {
	wb.add( selectors[ s ] );
}

} )( jQuery, window, wb );
