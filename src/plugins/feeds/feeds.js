/*
 * @title WET-BOEW Feeds
 * @overview Aggregates and displays entries from one or more Web feeds.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, vapour ) {
"use strict";

$.ajaxSettings.cache = false;

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-feeds",
	$document = vapour.doc,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( _elm ) {

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		var $content = $( _elm ).find( ".feeds-cont" ),
			limit = getLimit( _elm ),
			feeds = _elm.getElementsByTagName( "a" ),
			last = feeds.length - 1,
			i = last,
			entries = [],
			_results = [],
			deferred = [],
			processEntries = function( data ) {
				var k, len;

				data = data.responseData.feed.entries;
				len = data.length;
				for ( k = 0; k !== len; k += 1 ) {
					entries.push( data[ k ] );
				}
				if ( !last ) {
					parseEntries( entries, limit, $content );
				}

				last -= 1;
				return last;
			},
			finalize = function() {

				// TODO: Use CSS instead
				$content.find( "li" ).show();
			};

		while ( i >= 0 ) {
			deferred[ i ] = $.ajax({
				url: jsonRequest( feeds[ i ].href, limit ),
				dataType: "json",
				timeout: 1000
			}).done( processEntries );
			_results.push( i -= 1 );
		}
		$.when.apply( null, deferred ).always( finalize );

		$.extend( {}, _results );
	},

	// TODO: Should these be added as central helpers? They were in v3.1
	
	/*
	 * Returns a class-based set limit on plugin instances
	 * @method getLimit
	 * @param {DOM object} elm The element to search for a class of the form blimit-5
	 * @return {number} 0 if none found, which means the plugin default
	 */
	getLimit = function( _elm ) {
		var count = _elm.className.match( /\blimit-\d+/ );
		if ( !count ) {
			return 0;
		}
		return Number( count[ 0 ].replace( /limit-/i, "" ) );
	},
	
	/*
	 * Builds the URL for the JSON request
	 * @method jsonRequest
	 * @param {url} url URL of the feed.
	 * @param {integer} limit Limit on the number of results for the JSON request to return.
	 * @return {url} The URL for the JSON request
	 */
	jsonRequest = function( url, limit ) {
		var requestURL = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent( decodeURIComponent( url ) );
		
		// API returns a maximum of 4 entries by default so only override if more entries should be returned
		if ( limit > 4 ) {
			requestURL += "&num=" + limit;
		}
		return requestURL;
	},

	/*
	 * Parses the results from a JSON request and appends to an element
	 * @method parseEntries
	 * @param {object} entries Results from a JSON request.
	 * @param {integer} limit Limit on the number of results to append to the element.
	 * @param {jQuery DOM element} $elm Element to which the elements will be appended.
	 * @return {url} The URL for the JSON request
	 */
	parseEntries = function( entries, limit, $elm ) {
		var cap = ( limit > 0 && limit < entries.length ? limit : entries.length ),
			result = "",
			i, sorted, sortedEntry;
		
		sorted = entries.sort( function( a, b ) {
			return compare( b.publishedDate, a.publishedDate );
		});

		for ( i = 0; i !== cap; i += 1 ) {
			sortedEntry = sorted[ i ];
			result += "<li><a href='" + sortedEntry.link + "'>" + sortedEntry.title + "</a>" +
				( sortedEntry.publishedDate !== "" ?  " <span class='feeds-date'>[" +
				dataISO( sortedEntry.publishedDate, true ) + "]</span>" : "" ) + "</li>";
		}
		return $elm.empty().append( result );
	},

	/*
	 * Left-pads a number with zeros.
	 * @param {number} number The original number to pad.
	 * @param {number} length The width of the resulting padded number, not the number of zeros to add to the front of the string.
	 * @return {string} The padded string
	 */
	pad = function( number, length ) {
		var str = String( number );
		while ( str.length < length ) {
			str = "0" + str;
		}
		return str;
	},
	
	/*
	 * Converts the date to a date-object. The input can be:
	 * <ul>
	 * <li>a Date object: returned without modification.</li>
	 * <li>an array: Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
	 * <li>a number: Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
	 * <li>a string: Any format supported by the javascript engine, like 'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.</li>
	 * <li>an object: Interpreted as an object with year, month and date attributes. **NOTE** month is 0-11.</li>
	 * </ul>
	 * @param {Date | number[] | number | string | object} dateValue
	 * @return {Date | NaN}
	 */
	convert =  function( dateValue ) {
		var dateConstructor = dateValue.constructor;
		if ( dateConstructor === Date ) {
			return dateConstructor;
		} else if ( dateConstructor === Array ) {
			return new Date( dateValue[ 0 ], dateValue[ 1 ], dateValue[ 2 ] );
		} else if ( dateConstructor === Number || dateConstructor === String ) {
			return new Date( dateValue );
		} else if ( typeof dateValue === "object" ) {
			return new Date( dateValue.year, dateValue.month, dateValue.date );
		}
		return NaN;
	},

	/*
	 * Compares two dates (input can be any type supported by the convert function).
	 * @param {Date | number[] | number | string | object} dateValue1
	 * @param {Date | number[] | number | string | object} dateValue2
	 * @return {number | NaN}
	 * @example returns
	 * -1 if dateValue1 < dateValue2
	 * 0 if dateValue1 = dateValue2
	 * 1 if dateValue1 > dateValue2
	 * NaN if dateValue1 or dateValue2 is an illegal date
	 */
	compare = function( dateValue1, dateValue2 ) {
		if ( isFinite( dateValue1 = convert( dateValue1 ).valueOf() ) && isFinite( dateValue2 = convert( dateValue2 ).valueOf() ) ) {
			return ( dateValue1 > dateValue2 ) - ( dateValue1 < dateValue2 );
		}
		return NaN;
	},

	/*
	 * Cross-browser safe way of translating a date to ISO format
	 * @param {Date | number[] | number | string | object} dateValue
	 * @param {boolean} withTime Optional. Whether to include the time in the result, or just the date. False if blank.
	 * @return {string}
	 * @example
	 * dataISO( new Date() )
	 * returns "2012-04-27"
	 * dataISO( new Date(), true )
	 * returns "2012-04-27 13:46"
	 */
	dataISO = function( dateValue, withTime ) {
		var date = convert( dateValue );
		if ( withTime ) {
			return date.getFullYear() + "-" + pad( date.getMonth() + 1, 2, "0" ) + "-" + pad( date.getDate(), 2, "0" ) +
				" " + pad( date.getHours(), 2, "0" ) + ":" + pad( date.getMinutes(), 2, "0" );
		}
		return date.getFullYear() + "-" + pad( date.getMonth() + 1, 2, "0" ) + "-" + pad( date.getDate(), 2, "0" );
	};

$document.on( "timerpoke.wb", selector, function() {
	init( this );

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control, 
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
