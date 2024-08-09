( function( $, window, wb ) {
"use strict";

var componentName = "wb-filter",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	filterClass = "wb-fltr-out",
	tagFilterClass = "wb-tgfltr-out",
	notFilterClassSel = ":not(." + filterClass + "):not(." + tagFilterClass + ")",
	inputClass = "wb-fltr-inpt",
	dtNameFltrArea = "wbfltrid",
	selectorInput = "." + inputClass,
	defaults = {
		live : true,
		std: {
			selector: "li"
		},
		grp: {
			selector: "li",
			section: ">section"
		},
		tbl: {
			selector: "tr",
			section: ">tbody"
		},
		tblgrp: {
			selector: " th:not([scope])" + notFilterClassSel,
			hdnparentuntil: "tbody",
			section: ">tbody"
		}
	},
	i18n, i18nText,
	wait,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm, elmTagName, filterUI, prependUI,
			settings, setDefault,
			itemsObserver,
			inptId, totalEntries,
			secSelector,
			uiTemplate, uiInpt, uiInfo,
			uiNbItems, uiTotal, uiInfoID;

		if ( elm ) {
			$elm = $( elm );
			elmTagName = elm.nodeName;
			uiInfoID = elm.id + "-info";

			if ( [ "DIV", "SECTION", "ARTICLE" ].indexOf( elmTagName ) >= 0 ) {
				setDefault = defaults.grp;
				prependUI = true;
			} else if ( elmTagName === "TABLE" ) {
				if ( $elm.find( "tbody" ).length > 1 ) {
					setDefault = defaults.tblgrp;
				} else {
					setDefault = defaults.tbl;
				}
			} else {
				setDefault = defaults.std;
			}
			setDefault.live = defaults.live;

			settings = $.extend( true, {}, setDefault, window[ componentName ], wb.getData( $elm, componentName ) );
			
			$.data( elm, componentName, settings ); 	//	wb-filter
			//$elm.data( componentName, settings ); 	//	wbFilter
			//$elm.data( componentName ).live;	//	Undefined
			
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					filter_label: i18n( "fltr-lbl" ),
					fltr_info: i18n( "fltr-info" )
				};
			}

			Modernizr.addTest( "stringnormalize", "normalize" in String );
			Modernizr.load( {
				test: Modernizr.stringnormalize,
				nope: [
					"site!deps/unorm" + wb.getMode() + ".js"
				]
			} );

			if ( !elm.id ) {
				elm.id = wb.getId();
			}

			if ( settings.uiTemplate ) {
				uiTemplate = document.querySelector( settings.uiTemplate );
				uiInpt = uiTemplate.querySelector( "input[type=search]" );

				if ( uiInpt ) {
					uiInfo = uiTemplate.querySelector( ".wb-fltr-info" );

					uiInpt.classList.add( inputClass );
					uiInpt.setAttribute( "data-" + dtNameFltrArea, elm.id );
					uiInpt.setAttribute( "aria-controls", elm.id );

					if ( uiInfo ) {
						uiInfoID = uiInfo.id || uiInfoID;
						uiInfo.id = uiInfoID;
						uiInfo.setAttribute( "role", "status" );
					}
				} else {
					console.error( componentName + ": " + "an <input type=\"search\"> is required in your UI template." );
				}

				if ( settings.source ) {
					console.warn( componentName + ": " + "the 'source' option is not compatible with the 'uiTemplate' option. If both options are defined, only 'uiTemplate' will be registered." );
				}
			} else {
				inptId = elm.id + "-inpt";
				filterUI = $( "<div class=\"input-group\">" +
					"<label for=\"" + inptId + "\" class=\"input-group-addon\"><span class=\"glyphicon glyphicon-filter\" aria-hidden=\"true\"></span> " + i18nText.filter_label + "</label>" +
					"<input id=\"" + inptId + "\" class=\"form-control " + inputClass + "\" data-" + dtNameFltrArea + "=\"" + elm.id + "\" aria-controls=\"" + elm.id + "\" type=\"search\">" +
					"</div>" +
					"<p role=\"status\" id=\"" + uiInfoID + "\">" + i18nText.fltr_info + "</p>" );

				if ( settings.source ) {
					$( settings.source ).prepend( filterUI );
				} else if ( prependUI ) {
					$elm.prepend( filterUI );
				} else {
					$elm.before( filterUI );
				}
			}

			secSelector = ( settings.section || "" ) + " ";
			totalEntries = $elm.find( secSelector + settings.selector ).length;
			uiNbItems = document.querySelector( "#" + uiInfoID + " [data-nbitem]" );
			uiTotal = document.querySelector( "#" + uiInfoID + " [data-total]" );

			if ( uiNbItems ) {
				uiNbItems.textContent = totalEntries;

				itemsObserver = new MutationObserver( function() {
					uiNbItems.textContent = $elm.find( secSelector + settings.selector + notFilterClassSel ).length;
				} );

				itemsObserver.observe( elm, { attributes: true, subtree: true } );
			}

			if ( uiTotal ) {
				uiTotal.textContent = totalEntries;
			}

			wb.ready( $elm, componentName );
		}
	},

	/*
	 * Takes in the text from the filter box
	 * Returns:
	 *  An array of search words
	 *      Special characters are escaped
	 *      Double and single quotes removed
	 */
	filterQueryParser = function( filter ) {

		// Pattern to separate the filter text into "words"
		var pattern = /[^\s"]+|"([^"]*)"/gi;

		// Make strings safe again for regex
		// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
		filter = filter.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );

		// Apply the word match pattern and return
		return filter.match( pattern );
	},

	/**
	 * Build the Regular Expression that we are going
	 * to use to filter content
	 * This involves identifying the type of search being
	 * applied and then breaking up the search string into
	 * words
	 */
	buildSearchFilterRegularExp =  function( filterType, filter ) {

		var words, wordRegExFilter = filter,
			i, i_len;

		switch ( filterType ) {

			case "and":
				words = filterQueryParser( filter );
				if ( words ) {
					wordRegExFilter = ".*";
					i_len = words.length;
					for ( i = 0; i < i_len; i++ ) {
						wordRegExFilter = wordRegExFilter + ( "(?=.*" + words[ i ] + ")" );
					}
				}
				break;

			case "or": // If one word fall back on default
				words = filterQueryParser( filter );
				if ( words ) {
					wordRegExFilter =  words.join( "|" );
				}
				break;

			default:
				break;

		}

		return new RegExp( wordRegExFilter, "i" );

	},

	filter = function( $field, $elm, settings ) {
		var unAccent = function( str ) {
				return str.normalize( "NFD" ).replace( /[\u0300-\u036f]/g, "" );
			},
			filter = unAccent( $field.val().trim() ),
			fCallBack = settings.filterCallback,
			secSelector = ( settings.section || "" )  + " ",
			hndParentSelector = settings.hdnparentuntil,
			$items = $elm.find( secSelector + settings.selector ),
			itemsLength = $items.length,
			that = this || $field.get(0),
			i, $item, text, searchFilterRegularExp;

		$elm.find( "." + filterClass ).removeClass( filterClass );

		searchFilterRegularExp = buildSearchFilterRegularExp( settings.filterType, filter );

		for ( i = 0; i < itemsLength; i += 1 ) {
			$item = $items.eq( i );
			text = unAccent( $item.text() );

			if ( !searchFilterRegularExp.test( text ) ) {
				if ( hndParentSelector ) {
					$item = $item.parentsUntil( hndParentSelector );
				}
				$item.addClass( filterClass );
			}
		}

		if ( !fCallBack || typeof fCallBack !== "function"  ) {
			fCallBack = filterCallback;
		}

		$elm.trigger( "wb-contentupdated" );
		
		//	Tag filter calls wb-contentupdated and needs to make changes before we hide or show the content section when a button is used.
		fCallBack.apply( that, arguments );
	},
	filterCallback = function( $field, $elm, settings ) {
		var $sections =	$elm.find( settings.section ),
			sectionsLength = $sections.length,
			fndSelector = notFilterClassSel + settings.selector,
			s, $section;

		//	Hide each parent that has no visible child
		for ( s = 0; s < sectionsLength; s += 1 ) {
			$section = $sections.eq( s );
			if ( $section.find( fndSelector ).length === 0 ) {
				$section.addClass( filterClass );
			}
		}
	};

$document.on( "keyup", selectorInput, function( event ) {
	var target = event.target,
		$input = $( target ),
		$elm = $( "#" + $input.data( dtNameFltrArea ) ),
		live = $elm.data( componentName ).live;
	
	if ( !!live ) {
		if ( wait ) {
			clearTimeout( wait );
		}
		wait = setTimeout( filter.bind( this, $input, $elm, $elm.data( componentName ) ), 250 );
	}
} );

//	Trigger on form submit if not live changes
$document.on( "submit", selector + " form", function( event )  {
	const target = event.target,
		$input = $( target ).find( selectorInput ),
		$elm = $( "#" + $input.data( dtNameFltrArea ) ),
		live = $elm.data( componentName ).live;
	
	if ( !live ) {
		filter( $input, $elm, $elm.data( componentName ) );
	}
	event.preventDefault();
} );

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );
} )( jQuery, window, wb );
