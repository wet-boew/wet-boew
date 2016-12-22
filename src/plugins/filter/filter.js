( function( $, window, wb ) {
"use strict";

var componentName = "wb-filter",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	filterClass = "wb-fltr-out",
	defaults = {
		selector: "li"
	},
	i18n, i18nText,
	wait,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm;
		if ( elm ) {
			$elm = $( elm );
			$elm.data( $.extend( true, {}, defaults, window[ componentName ], wb.getData( $elm, componentName ) ) );

			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {

					// TODO: Move string to the i18n file
					filter_label: i18n( "fltr-lbl" ) || "Filter<span class=\"wb-inv\"> content: results appear below as you type.”</span>"
				};
			}

			Modernizr.addTest( "stringnormalize", "normalize" in String );
			Modernizr.load( {
				test: Modernizr.stringnormalize,
				nope: [
					"site!deps/unorm" + wb.getMode() + ".js"
				]
			} );

			$elm.prepend( "<div class=\"input-group\"><label for=\"" + elm.id + "-inpt\" class=\"input-group-addon\"><span class=\"glyphicon glyphicon-filter\" aria-hidden=\"true\"></span> " + i18nText.filter_label + "</label><input id=\"" + elm.id + "-inpt\" class=\"form-control wb-fltr-inpt\" type=\"search\"></div>" );

			wb.ready( $elm, componentName );
		}
	},
	filter = function( $field, $elm, settings ) {
		var unAccent = function( str ) {
				return str.normalize( "NFD" ).replace( /[\u0300-\u036f]/g, "" );
			},
			filter = unAccent( $field.val() ),
			$items = $elm.find( settings.selector ),
			$itemsLength = $items.length,
			i, $item, text;

		$elm.find( "." + filterClass ).removeClass( filterClass );

		for ( i = 0; i < $itemsLength; i += 1 ) {
			$item = $items.eq( i );
			text = unAccent( $item.text() );

			if ( !text.match( new RegExp( filter, "i" ) ) ) {
				$item.addClass( filterClass );
			}
		}

		if ( settings.filterCallback && typeof settings.filterCallback === "function"  ) {
			settings.filterCallback.apply( this, arguments );
		}
	};

$document.on( "keyup", selector, function( event ) {
	var $input = $( event.target ),
		$elm = $( event.currentTarget );

	if ( $input.hasClass( "wb-fltr-inpt" ) ) {
		if ( wait ) {
			clearTimeout( wait );
		}
		wait = setTimeout( filter.bind( this, $input, $elm, $elm.data() ), 250 );
	}
} );

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );
} )( jQuery, window, wb );
