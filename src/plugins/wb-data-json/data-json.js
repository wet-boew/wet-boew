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
	allowAttrNames = /(href|src|data-*|aria-*|role|pattern|min|max|step|low|high|lang|hreflang|action)/,
	allowPropNames = /(checked|selected|disabled|required|readonly|multiple|hidden)/,
	selectorsLength = selectors.length,
	selector = selectors.join( "," ),
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	contentUpdatedEvent = "wb-contentupdated",
	dataQueue = componentName + "-queue",
	$document = wb.doc,
	isExtensionRegistered,
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
			jsSettings = window[ componentName ] || { },
			prop,
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

			// Extend but not overwrite the functionTest and the functionForOperand if some was added
			if ( !isExtensionRegistered ) {
				if ( jsSettings.functionForTest ) {
					for ( prop in jsSettings.functionForTest ) {
						if ( !functionForTest[ prop ] ) {
							functionForTest[ prop ] = jsSettings.functionForTest[ prop ];
						}
					}
				}
				if ( jsSettings.functionForOperand ) {
					for ( prop in jsSettings.functionForOperand ) {
						if ( !functionForOperand[ prop ] ) {
							functionForOperand[ prop ] = jsSettings.functionForOperand[ prop ];
						}
					}
				}
				isExtensionRegistered = true;
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );

			jsondata = wb.getData( $elm, shortName );

			if ( jsondata && jsondata.url ) {
				lstCall.push( jsondata );
			} else if ( jsondata && Array.isArray( jsondata ) ) {
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
				if ( itmSettings.trigger && !wb.isDisabled ) {
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

		var elmClass = elm.className,
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
			settings.tobeclone = "tr"; // Only table row can be added
		}

		if ( !template ) {
			return;
		}

		// Needed when executing sub-template that wasn't polyfill, like in IE11
		if ( !template.content ) {
			wb.tmplPolyfill( template );
		}

		if ( !settings.streamline ) {
			dataIterator( elm, content, settings );
		} else {
			processMapping( elm, elm, content, settings );
		}

		// Refresh the dataTable display
		if ( dataTableAddRow ) {
			dataTable.draw();
		}
	},

	// Iterate over the dataset
	dataIterator = function( elm, content, mappingConfig, useClone ) {

		var i, i_len, i_cache,
			elmAppendTo = elm,
			clone, template,
			dataTable, dataTableAddRow;

		if ( mappingConfig.appendto ) {
			elmAppendTo = $( mappingConfig.appendto ).get( 0 );
		}

		// Connection with data table plugin
		if ( elm.tagName === "TABLE" && elm.className.indexOf( "wb-tables" ) !== -1 ) {
			dataTable = $( elm ).dataTable( { "retrieve": true } ).api();
			dataTableAddRow = dataTable.row.add;
			mappingConfig.tobeclone = "tr";
		}


		// if content is object, transform into array @id and @value
		if ( !Array.isArray( content ) ) {
			if ( typeof content !== "object" ) {
				content = [ content ];
			} else {
				content = $.map( content, function( val, index ) {
					if ( val && typeof val === "object" && !Array.isArray( val ) ) {
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

		// Get the template to be iterated.
		if ( !useClone && mappingConfig.source ) {
			template = document.querySelector( mappingConfig.source );
		} else if ( !useClone && mappingConfig.template ) {
			template = elm.querySelector( mappingConfig.template );
		} else if ( !useClone ) {
			template = elm.querySelectorAll( ":scope > template" );
			if ( template.length === 1 || template[ 0 ].attributes.length === 0 ) {

				// Only when there is one choice or take the first one only if only there is no attribute set on the element
				template = template[ 0 ];
			} else {

				// let the mapping instructions to define which template to use
				template = false;
			}
		}

		// Iterate the data array
		for ( i = 0; i < i_len; i += 1 ) {
			i_cache = content[ i ];


			// If the data are filtered. This is deprecated and are only for backward compatible purpose
			if ( !filterPassJSON( i_cache, mappingConfig.filter, mappingConfig.filternot ) ) {
				continue;
			}

			// Get the template (if applicable)
			if ( !clone && useClone ) {
				clone = useClone;
			}

			// Create a clone if one unique template is found
			if ( !useClone && template && !mappingConfig.tobeclone ) {
				clone = template.content.cloneNode( true );
			} else if ( !useClone && template ) {
				clone = template.content.querySelector( mappingConfig.tobeclone ).cloneNode( true );
			}

			// process the mapping, return value is the new clone object if applicable
			var tmpClone;
			tmpClone = processMapping( elm, clone, i_cache, mappingConfig );

			// Remove the template flag, to ensure we do reuse it for the subsequent iteration
			if ( tmpClone ) {
				delete mappingConfig.template;
				clone = tmpClone;
			}

			// Add the clone object
			if ( dataTableAddRow ) {
				dataTableAddRow( $( clone ) ); // If wb-tables, use its API to add rows
			} else if ( !useClone && template ) {
				elmAppendTo.appendChild( clone );
			}
		}

		// Refresh the dataTable display (if applicable)
		if ( dataTableAddRow ) {
			dataTable.draw();
		}

	},

	// Check if the mapping are met or not
	canProcessMapping = function( content, mappingConfig ) {

		var rawValue, value,
			testableData,
			operand = mappingConfig.operand || "softEq",
			operandOutcome;

		if ( !mappingConfig.test ) {
			return;
		}

		// Get the value to be tested
		try {
			rawValue = getRawValue( content, mappingConfig.assess || mappingConfig.value );
			value = getValue( rawValue );
		} catch ( ex ) {

			// If this is an error, the path probably don't exist
			rawValue = undefined;
			value = undefined;
		}

		// Get the function to use
		if ( !functionForTest[ mappingConfig.test ] ) {
			console.error( "The test function '" + mappingConfig.test + "' don't exist. Default to false test result" );
			console.error( mappingConfig );
			return false;
		}
		testableData = functionForTest[ mappingConfig.test ].call( mappingConfig, value, rawValue );

		// Run the operand
		if ( !functionForOperand[ operand ] ) {
			console.error( "The operand '" + operand + "' don't exist" );
			console.error( mappingConfig );
			operand = "softEq";
		}
		operandOutcome = functionForOperand[ operand ].call( mappingConfig, testableData, mappingConfig.expect );

		// If not true, go next
		if ( !operandOutcome ) {
			return false;
		}

		// Run mapping if satisfied
		return true;
	},

	// Special mapping typed function
	functionForTypedMapping = {

		"rdf:Alt": function( elm, clone, content, mappingConfig ) {

			var mapping = mappingConfig.mapping,
				i, i_cache,
				i_len = mapping.length,
				value = content;

			for ( i = 0; i < i_len || i === 0; i += 1 ) {
				i_cache = mapping[ i ];

				if ( canProcessMapping( content, i_cache ) ) {

					// Clone the object to avoid conflict when it is reused for other data
					i_cache = $.extend( true, {}, i_cache );

					// Remove the test, because it was checked
					delete i_cache.test;

					// Navigate the content if specified
					if ( i_cache.value ) {
						value = getValue( content, i_cache.value );
					}

					// Process the mapping
					processMapping( elm, clone, value, i_cache );

					// End
					return;
				}
			}
		}
	},

	// Function called for testing the mapping condition, which can be extend via the js configuration
	functionForTest = {

		"fn:isArray": function( value ) {
			return Array.isArray( value );
		},

		"fn:isLiteral": function( value ) {

			// Check if the value are set under the JSON-LD parameter @value
			if ( value && value[ "@value" ] ) {
				value = value[ "@value" ];
			}

			if ( value && typeof value !== "object" ) {
				return true;
			}

			return false;
		},

		"fn:getType": function( value, rawValue ) {

			var tp = value[ "@type" ] || rawValue[ "@type" ];

			if ( tp === "@json" ) {
				return "rdf:JSON";
			} else if ( Array.isArray( tp ) && tp.indexOf( "@json" ) !== -1 ) {
				tp[ tp.indexOf( "@json" ) ] = "rdf:JSON";
			}

			if ( tp ) {
				return tp;
			} else {
				return typeof value;
			}
		},

		"fn:getValue": function( value ) {

			return value;

		},

		"fn:guessType": function( value, rawValue ) {

			var guessType;

			if ( !value ) {
				guessType = "undefined";
			} else if ( value[ "@type" ] ) {
				guessType = value[ "@type" ];
			} else if ( rawValue[ "@type" ] ) {
				guessType = rawValue[ "@type" ];
			} else if ( value[ "@value" ] ) {

				// Only if we are in JSON ld mode
				// Check if the value are set under the JSON-LD parameter @value
				value = value[ "@value" ];
			}

			// Edge case to convert the @json data type into its RDF form
			if ( guessType && guessType !== "undefined" ) {
				if ( guessType === "@json" ) {
					guessType = "rdf:JSON";
				} else if ( Array.isArray( guessType ) && guessType.indexOf( "@json" ) !== -1 ) {
					guessType[ guessType.indexOf( "@json" ) ] = "rdf:JSON";
				}
			}

			if ( !guessType ) {
				if ( typeof value === "string" && value.match( /^([a-z][a-z0-9+\-.]*):/i ) ) {
					guessType = [ "xsd:anyURI", "rdfs:Literal" ];
				} else if ( typeof value === "string" ) {
					guessType = [ "xsd:string", "rdfs:Literal" ];
				} else if ( typeof value === "boolean" ) {
					guessType = [ "xsd:boolean", "rdfs:Literal" ];
				} else if ( typeof value === "number" ) {
					guessType = [ "xsd:double", "rdfs:Literal" ];
				} else if ( typeof value === "undefined" ) {
					guessType = "undefined";
				} else if ( Array.isArray( value ) ) {
					guessType = "rdfs:Container";
				} else {

					// The type is a generic Object
					guessType = "rdfs:Resource";
				}
			}

			return guessType;
		}

	},

	// Operand used to evaluate the testable output from functionForTest to determine if the mapping condition is met or not, which can be extend via the js configuration
	functionForOperand = {

		"softEq": function( value, expect ) {
			var i, i_len;

			if ( Array.isArray( value ) && !Array.isArray( expect ) && value.indexOf( expect ) !== -1 ) {
				return true;
			} else if ( Array.isArray( value ) &&  Array.isArray( expect ) ) {
				i_len = expect.length;
				for ( i = 0; i !== i_len; i++ ) {
					if ( value.indexOf( expect[ i ] ) ) {
						return true;
					}
				}
			} else if ( expect && value === expect ) {
				return true;
			} else if ( !expect && value ) {
				return true;
			}

			return false;

		},

		"eq": function( value, expect ) {

			if ( _equalsJSON( value, expect ) ) {
				return true;
			}

			return false;
		},

		"neq": function( value, expect ) {
			if ( !_equalsJSON( value, expect ) ) {
				return true;
			}

			return false;
		},

		"in": function( value, expect ) {

			var i;

			if ( !expect ) {
				console.error( "Expected value is missing. Defaulting to false." );
				console.error( this );
				return false;
			}

			if ( Array.isArray( value ) && !Array.isArray( expect ) && value.indexOf( expect ) !== -1 ) {
				return true;
			} else if ( Array.isArray( value ) &&  Array.isArray( expect ) ) {
				for ( i = 0; i !== expect.length; i++ ) {
					if ( value.indexOf( expect[ i ] ) ) {
						return true;
					}
				}
			} else if ( !Array.isArray( value ) &&  Array.isArray( expect ) && expect.indexOf( value ) !== -1  ) {
				return true;
			} else if ( value === expect ) {
				return true;
			}

			return false;
		},

		"nin": function( value, expect ) {
			return !functionForOperand.in.call( this, value, expect );
		}
	},

	// Mapping the data into a template or into a node
	processMapping = function( elm, clone, content, mappingConfig ) {

		var j, j_cache,
			cached_node, cached_value,
			cached_value_is_HTML, cached_value_is_JSON, cached_value_is_IRI,
			queryAll = mappingConfig.queryall,
			selElements,
			mapping = mappingConfig.mapping,
			mapping_len,
			upstreamClone, template;


		// Is this mapping a special mapping type?
		if ( mappingConfig[ "@type" ] ) {
			functionForTypedMapping[ mappingConfig[ "@type" ] ].call( content, elm, clone, content, mappingConfig );
			return;
		}

		// Can we proceed?
		if ( mappingConfig.test && !canProcessMapping( content, mappingConfig ) ) {
			return;
		}

		// Check if there is some mapping configuration
		if ( !mapping && !queryAll && !mappingConfig.template && typeof mapping !== "object" ) {
			return;
		}

		// Clone mappingConfig to ensure it don't interfere with subsequent data iteration
		mappingConfig = $.extend( true, {}, mappingConfig );

		// If there is no clone, let use the element (parent)
		clone = clone || elm;

		// If there is a "template" property, get the inner template
		if ( mappingConfig.template ) {
			template = clone.querySelector( mappingConfig.template );

			upstreamClone = clone; // Keep reference of the top clone

			clone = template.content.cloneNode( true );

			// Ensure we don't recreated it if during a subsequent iteration
			delete mappingConfig.template;
		}


		// Is content an array? then iterate the content
		if ( Array.isArray( content ) ) {


			dataIterator( clone, content, mappingConfig, clone );

			// Case of where a template is associated with this mapping action
			if ( template ) {
				if ( template.parentNode ) {

					if ( !mappingConfig.append ) {
						template.parentNode.insertBefore( clone, template );
					} else {
						template.parentNode.appendChild( clone );
					}
				} else {
					upstreamClone.appendChild( clone );
				}

				return elm;

			}
			return;
		}

		// Prepare the mapping object to be iterated
		if ( !mapping ) {
			mapping = [ {} ];
		}
		if ( !Array.isArray( mapping ) ) {
			mapping = [ mapping ];
		}
		mapping_len = mapping.length;

		// Ensure the mapping is an array of Mapping Object
		for ( j = 0; j < mapping_len || j === 0; j += 1 ) {
			if ( typeof mapping[ j ] === "string" ) {
				mapping[ j ] = {
					value: mapping[ j ]
				};
			}
		}

		if ( queryAll ) {
			selElements = clone.querySelectorAll( queryAll );

			// Replicate this setting the in the mapping
			for ( j = 0; j < selElements.length || j === 0; j += 1 ) {
				if ( !mapping[ j ].selector && queryAll.indexOf( "nth-child" ) === -1 ) {
					mapping[ j ].selector = queryAll + ":nth-child(" + ( j + 1 ) + ")";
				} else if ( !mapping[ j ].selector ) {
					mapping[ j ].selector = queryAll;
				}
			}
		}


		//
		// Process the mapping
		//
		for ( j = 0; j < mapping_len || j === 0; j += 1 ) {
			j_cache = mapping[ j ];

			// Reset the cache value special type flag
			cached_value_is_IRI = false;
			cached_value_is_HTML = false;
			cached_value_is_JSON = false;

			// Get the element to be updated
			if ( j_cache.selector ) {
				cached_node = clone.querySelector( j_cache.selector );
			} else {
				cached_node = clone;
			}

			// Get the value to be set
			try {
				cached_value = getRawValue( content, j_cache );
			} catch ( ex ) {

				// The path don't exist, let continue to the next mapping item
				console.info( "JSON selector path for mapping don't exist in content" );
				console.info( j_cache );
				console.info( content );
				continue;
			}

			// Go to the next mapping if the value of JSON node don't exist to ensure we keep the default text set in the template, but move ahead if empty or null
			if ( typeof cached_value === "undefined" ) {
				continue;
			}

			// Do the cache value contain special @type
			if ( cached_value && cached_value[ "@value" ] && cached_value[ "@type" ] ) {
				if ( !Array.isArray( cached_value[ "@type" ] ) ) {
					cached_value[ "@type" ] = [ cached_value[ "@type" ] ];
				}
				cached_value_is_IRI = cached_value[ "@type" ].indexOf( "@id" ) !== -1;
				cached_value_is_HTML = cached_value[ "@type" ].indexOf( "rdf:HTML" ) !== -1;
				cached_value_is_JSON = cached_value[ "@type" ].indexOf( "rdf:JSON" ) !== -1 || cached_value[ "@type" ].indexOf( "@json" ) !== -1;
			}

			// Action the value
			if ( Array.isArray( cached_value ) && ( j_cache.mapping || j_cache.queryall ) ) {

				// Deep dive into the content if a mapping exist
				dataIterator( cached_node, cached_value, j_cache );

			} else if ( j_cache.mapping || j_cache.queryall || !j_cache.mapping && typeof j_cache.mapping === "object" ) {
				try {

					// Map the inner mapping
					processMapping( template || elm, cached_node, cached_value, j_cache );
				} catch ( ex ) {

					if ( ex === "cached_node: null" && typeof cached_value === "object" ) {

						// If it fail, let iterate the cached_value object
						dataIterator( cached_node, cached_value, j_cache );
					} else {
						throw ex;
					}
				}
			} else if ( cached_value_is_IRI && cached_value_is_HTML ) {

				// The import file type are expected to be HTML
				// Add the data-ajax instruction so the content would be added once the JSON mapping is completed and added on the page.
				cached_node.dataset.wbAjax = JSON.stringify( {
					url: cached_value[ "@value" ],
					type: "replace",
					dataType: cached_value_is_JSON ? "json" : null,
					encode: j_cache.encode
				} );
			} else if ( cached_value_is_HTML && cached_value_is_JSON && !cached_value_is_IRI ) {

				// Get content from the "@value" property which contain JSON value and use it as a string value
				cached_value = JSON.stringify( cached_value[ "@value" ] );

				// Map the value in the element
				mapValue( cached_node, cached_value, j_cache );

			} else if ( !cached_node && typeof cached_value === "object" ) {
				throw "cached_node: null";
			} else if ( mappingConfig.mapping !== null ) {

				cached_value = getValue( cached_value );

				// Serialize the value if it is an JS object and its not a null object
				if ( typeof cached_value === "object" &&  cached_value !== null ) {
					cached_value = JSON.stringify( cached_value );
				}

				// Map the value in the element
				mapValue( cached_node, cached_value, j_cache );
			}

		}

		// Add the template, if applicable
		if ( template ) {
			if ( template.parentNode ) {

				if ( !mappingConfig.append ) {
					template.parentNode.insertBefore( clone, template );
				} else {
					template.parentNode.appendChild( clone );
				}
			} else {
				upstreamClone.appendChild( clone );
			}

			return elm;
		}

	},

	// Extract the value of an JS object
	getValue = function( source, pointer ) {

		var value = getRawValue( source, pointer );

		// for JSON-LD @value support
		if ( typeof value === "object" && value !== null && Object.prototype.hasOwnProperty.call( value, "@value" ) ) {
			value = value[ "@value" ];
		}

		return value;
	},

	// Extract the value without considering it possible JSON-LD value
	getRawValue = function( source, pointer ) {

		var value;
		pointer = pointer || false; // Ensure pointer is defined

		// Get the value if source is string or pointer is pointing to root
		if ( typeof source === "string" || pointer === "/" || pointer === "/@value" || pointer.value === "/" || pointer.value === "/@value" ) {
			value = source;
		} else if ( typeof pointer === "string" ) {
			value = jsonpointer.get( source, pointer );
		} else if ( pointer.value ) {
			value = jsonpointer.get( source, pointer.value );
		} else {
			value = source;
		}

		return value;
	},

	// Map a value into an HTML element or attribute
	mapValue = function( element, value, mappingConfig ) {

		var attributeName, placeholderText;

		attributeName = mappingConfig.attr;
		if ( attributeName ) {
			if ( !element.hasAttribute( attributeName ) ) {
				element.setAttribute( attributeName, "" );
			}
			element = element.getAttributeNode( attributeName );
		}

		// Placeholder text replacement if any
		if ( mappingConfig.placeholder ) {
			placeholderText = element.textContent || "";
			value = placeholderText.replace( mappingConfig.placeholder, value );
		}

		// Exclude null values and replace with default text
		if ( value !== null ) {
			if ( mappingConfig.isHTML ) {
				element.innerHTML = value;
			} else {
				element.textContent = value;
			}
		}
	},


	// Filtering a JSON
	// Return true if trueness && falseness
	// Return false if !( trueness && falseness )
	// trueness and falseness is an array of { "path": "", "value": "" } object
	filterPassJSON = function( obj, trueness, falseness ) {
		var i, i_cache,
			trueness_len = trueness ? trueness.length : 0,
			falseness_len = falseness ? falseness.length : 0,
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
				if ( Array.isArray( a ) ) {
					if (  !Array.isArray( b ) || a.length !== b.length ) {
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
				for ( i in a ) {
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
		if ( Array.isArray( obj ) ) {
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

$document.on( "json-failed.wb", selector, function( event ) {

	var elm = event.currentTarget,
		$elm = $( elm ),
		lstCall = $elm.data( dataQueue ),
		fetchObj = event.fetch,
		xhrResponse = fetchObj.xhr,
		itmSettings = lstCall[ fetchObj.refId ],
		failSettings = itmSettings.fail;

	if ( failSettings ) {

		// Mapping is always streamline because the data structure is a static object not an array
		failSettings.streamline = true;

		// apply the templaty to display an error message
		applyTemplate( elm, failSettings, {
			error: fetchObj.error.message || xhrResponse.statusText,
			status: fetchObj.status,
			url: fetchObj.fetchOpts.url,
			response: {
				text: xhrResponse.responseText || "",
				status: xhrResponse.status,
				statusText: xhrResponse.statusText
			}
		} );
	}

	console.info( event.currentTarget );
	console.error( "Error or bad JSON Fetched from url in " + componentName );
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
