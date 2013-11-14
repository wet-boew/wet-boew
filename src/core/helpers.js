/*
 * @title WET-BOEW JQuery Helper Methods
 * @overview Helper methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 * Credits: http://kaibun.net/blog/2013/04/19/a-fully-fledged-coffeescript-boilerplate-for-jquery-plugins/
 */
(function( $ , vapour ) {
	vapour.getData = function( element, dataName ) {
		var elm = !element.jquery ? element : element[ 0 ],
			dataAttr = elm.getAttribute( "data-" + dataName ),
			dataObj;

		if ( dataAttr ) {
			try {
				dataObj = JSON.parse( dataAttr );
			} catch ( error ) {
				$.error( "Bad JSON array in data-" + dataName + " attribute" );
			}
		}

		$.data( elm, dataName, dataObj );
		return dataObj;
	};
})( jQuery, vapour );

(function( vapour ) {
	"use strict";

	// Escapes the characters in a string for use in a jQuery selector
	// Based on http://totaldev.com/content/escaping-characters-get-valid-jquery-id
	vapour.jqEscape = function( selector ) {
		return selector.replace( /([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, "\\$1" );
	};

	/*
	 * @namespace vapour.string
	 */
	vapour.string = {
		/*
		 * Left-pads a number with zeros.
		 * @memberof vapour.string
		 * @param {number} number The original number to pad.
		 * @param {number} length The width of the resulting padded number, not the number of zeros to add to the front of the string.
		 * @return {string} The padded string
		 */
		pad: function( number, length ) {
			var str = number + "",
				diff = length - str.length,
				i;
			for ( i = 0; i !== diff; i += 1 ) {
				str = "0" + str;
			}
			return str;
		}
	};

	/*
	 * A suite of date related functions for easier parsing of dates
	 * @namespace vapour.date
	 */
	vapour.date = {
		/*
		 * Converts the date to a date-object. The input can be:
		 * <ul>
		 * <li>a Date object: returned without modification.</li>
		 * <li>an array: Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
		 * <li>a number: Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
		 * <li>a string: Any format supported by the javascript engine, like 'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.</li>
		 * <li>an object: Interpreted as an object with year, month and date attributes. **NOTE** month is 0-11.</li>
		 * </ul>
		 * @memberof vapour.date
		 * @param {Date | number[] | number | string | object} dateValue
		 * @return {Date | NaN}
		 */
		convert: function( dateValue ) {
			var dateConstructor = dateValue.constructor;

			switch ( dateConstructor ) {
			case Date:
				return dateConstructor;
			case Array:
				return new Date( dateValue[ 0 ], dateValue[ 1 ], dateValue[ 2 ] );
			case Number:
			case String:
				return new Date( dateValue );
			default:
				return typeof dateValue === "object" ? new Date( dateValue.year, dateValue.month, dateValue.date ) : NaN;
			}
		},

		/*
		 * Compares two dates (input can be any type supported by the convert function).
		 * @memberof vapour.date
		 * @param {Date | number[] | number | string | object} dateValue1
		 * @param {Date | number[] | number | string | object} dateValue2
		 * @return {number | NaN}
		 * @example returns
		 * -1 if dateValue1 < dateValue2
		 * 0 if dateValue1 = dateValue2
		 * 1 if dateValue1 > dateValue2
		 * NaN if dateValue1 or dateValue2 is an illegal date
		 */
		compare: function( dateValue1, dateValue2 ) {
			var convert = vapour.date.convert;

			if ( isFinite( dateValue1 = convert( dateValue1 ).valueOf() ) && isFinite( dateValue2 = convert( dateValue2 ).valueOf() ) ) {
				return ( dateValue1 > dateValue2 ) - ( dateValue1 < dateValue2 );
			}
			return NaN;
		},

		/*
		 * Cross-browser safe way of translating a date to ISO format
		 * @memberof vapour.date
		 * @param {Date | number[] | number | string | object} dateValue
		 * @param {boolean} withTime Optional. Whether to include the time in the result, or just the date. False if blank.
		 * @return {string}
		 * @example
		 * toDateISO( new Date() )
		 * returns "2012-04-27"
		 * toDateISO( new Date(), true )
		 * returns "2012-04-27 13:46"
		 */
		toDateISO: function( dateValue, withTime ) {
			var date = vapour.date.convert( dateValue ),
				pad = vapour.string.pad;

			return date.getFullYear() + "-" + pad( date.getMonth() + 1, 2, "0" ) + "-" + pad( date.getDate(), 2, "0" ) +
				( withTime ? " " + pad( date.getHours(), 2, "0" ) + ":" + pad( date.getMinutes(), 2, "0" ) : "" );
		},

		/*
		 * Cross-browser safe way of creating a date object from a date string in ISO format
		 * @memberof vapour.date
		 * @param {string} dateISO Date string in ISO format
		 * @return {Date}
		 */
		fromDateISO: function ( dateISO ) {
			var date = null;

			if ( dateISO && dateISO.match( /\d{4}-\d{2}-\d{2}/ ) ) {
				date = new Date();
				date.setFullYear( dateISO.substr( 0, 4 ), dateISO.substr( 5, 2 ) - 1, dateISO.substr( 8, 2 ) );
			}
			return date;
		}
	};

})( vapour );

(function( $ ) {
	"use strict";

	var methods,
		_settings = {
			"default": "wet-boew"
		};

	methods = {

		init: function( options ) {
			return $.extend( _settings, options || {} );
		},

		toggle: function( to, from ) {
			$( this )
				.addClass( to )
				.removeClass( from );
		}
	};

	$.fn.wb = function( method ) {

		if ( methods[ method ] ) {
			methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		}
		else if ( typeof method === "object" || !method ) {
			methods.init.apply( this, arguments );
		}
		else {
			$.error( "Method " + method + " does not exist on jquery.wb" );
		}
	};

})( jQuery );

/*
:focusable and :tabable jQuery helper expressions - https://github.com/jquery/jquery-ui/blob/24756a978a977d7abbef5e5bce403837a01d964f/ui/jquery.ui.core.js
*/
(function ( $ ) {
	"use strict";

	function focusable( element, isTabIndexNotNaN, visibility ) {
		var map, mapName, img,
			nodeName = element.nodeName.toLowerCase( );
		if ( "area" === nodeName ) {
			map = element.parentNode;
			mapName = map.name;
			if ( !element.href || !mapName || map.nodeName.toLowerCase( ) !== "map" ) {
				return false;
			}
			img = $( "img[usemap=#" + mapName + "]" )[ 0 ];
			return !!img && visible( img );
		}
		if ( visibility ) {
			return ( /input|select|textarea|button|object/.test( nodeName ) ? !element.disabled :
				"a" === nodeName ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN ) &&
			// the element and all of its ancestors must be visible
			visible( element );
		}
		else {
			return ( /input|select|textarea|button|object/.test( nodeName ) ? !element.disabled :
				"a" === nodeName ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN );
		}
	}

	function visible( element ) {
		return $.expr.filters.visible( element ) && !$( element )
			.parents( )
			.addBack( )
			.filter(function() {
				return $.css( this, "visibility" ) === "hidden";
			})
			.length;
	}

	$.extend( $.expr[ ":" ], {
		data: $.expr.createPseudo ? $.expr.createPseudo(function(dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		} ) :
		// support: jQuery <1.8

		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},
		focusable: function( element ) {
			return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
		},
		discoverable: function( element ) {
			return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
		},
		tabbable: function( element ) {
			var tabIndex = $.attr( element, "tabindex" ),
				isTabIndexNaN = isNaN( tabIndex );
			return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !
				isTabIndexNaN );
		}
	});

})( jQuery );
/*
Peformant micro templater
@credit: https://github.com/premasagar/tim/blob/master/tinytim.js
@todo: caching
*/
(function ( window, undef ) {
	"use strict";
	var tmpl = (function () {
		var start = "{{",
			end = "}}",
			path = "[a-z0-9_$][\\.a-z0-9_]*", // e.g. config.person.name
			pattern = new RegExp( start + "\\s*(" + path + ")\\s*" + end, "gi" );
		return function( template, data ) {
			// Merge data into the template string
			return template.replace( pattern, function( tag, token ) {
				var path = token.split( "." ),
					len = path.length,
					lookup = data,
					i = 0;
				for ( ; i < len; i++ ) {
					lookup = lookup[ path[ i ] ];
					// Property not found
					if ( lookup === undef ) {
						throw "tim: '" + path[ i ] + "' not found in " + tag;
					}
					// Return the required value
					if ( i === len - 1 ) {
						return lookup;
					}
				}
			});
		};
	}());

	window.tmpl = tmpl;

})( window );
