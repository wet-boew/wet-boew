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
			toDateISO = vapour.date.toDateISO,
			compare = vapour.date.compare,
			i, sorted, sortedEntry;
		
		sorted = entries.sort( function( a, b ) {
			return compare( b.publishedDate, a.publishedDate );
		});

		for ( i = 0; i !== cap; i += 1 ) {
			sortedEntry = sorted[ i ];
			result += "<li><a href='" + sortedEntry.link + "'>" + sortedEntry.title + "</a>" +
				( sortedEntry.publishedDate !== "" ? " <span class='feeds-date'>[" +
				toDateISO( sortedEntry.publishedDate, true ) + "]</span>" : "" ) + "</li>";
		}
		return $elm.empty().append( result );
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
