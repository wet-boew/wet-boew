/**
 * @title WET-BOEW Feeds
 * @overview Aggregates and displays entries from one or more Web feeds.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var pluginName = "wb-feeds",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	patt = /\\u([\d\w]{4})/g,

    /**
     * Helper function that returns the string representaion of a unicode character
     * @method decode
     * @param  {regex} match  unicode pattern
     * @param  {string} code  string where unicode is needed to be converted
     * @return {string}	unicode string character
     */
    decode = function( match, code ) {
        return String.fromCharCode( parseInt( code, 16 ) );
    },

    /**
     * Helper wrapper function that performs unicode decodes on a string
     * @method fromCharCode
     * @param  {string} s string to sanitize with escaped unicode characters
     * @return {string}	sanitized string
     */
    fromCharCode = function(s) {
        return s.replace( patt, decode );
    },

	/**
	 * @object Templates
	 * @properties {function}
	 * @param {object} requires a entry object of various ATOM based properties
	 * @returns {string} modified string with appropiate markup/format for a entry object
	 */
	Templates = {

		/**
		 * [facebook template]
		 * @param  {entry object} data
		 * @return {string}	HTML string of formatted using Media Object (twitter bootstrap)
		 */
		facebook: function( data ) {

			// Facebook feeds does not really do titles in ATOM RSS. It simply truncates content at 150 characters. We are using a JS based sentence
			// detection algorithm to better split content and titles
			var content = fromCharCode( data.content ),
				title = content.replace( /(<([^>]+)>)/ig, "" ).match( /\(?[^\.\?\!]+[\.!\?]\)?/g );

			// Sanitize the HTML from Facebook - extra 'br' tags
			content = content.replace( /(<br>\n?)+/gi, "<br>" );

			return "<li class='media'><a class='pull-left' href=''><img src='" + data.fIcon + "' alt='" + data.author +
				"' height='64px' width='64px' class='media-object'/></a><div class='media-body'>" +
				"<h4 class='media-heading'><a href='" + data.link + "'><span class='wb-inv'>" + title[0] + " - </span>" + data.author + "</a>  " +
				( data.publishedDate !== "" ? " <small class='feeds-date text-right'>[" +
				wb.date.toDateISO( data.publishedDate, true ) + "]</small>" : "" ) +
				"</h4><p>" + content + "</p></div></li>";
		},
		/**
		 * [generic template]
		 * @param  {entry object}	data
		 * @return {string}	HTML string of formatted using a simple list / anchor view
		 */
		generic: function( data ) {

			return "<li><a href='" + data.link + "'>" + data.title + "</a>" +
				( data.publishedDate !== "" ? " <span class='feeds-date'>[" +
				wb.date.toDateISO( data.publishedDate, true ) + "]</span>" : "" ) + "</li>";
		}
	},

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var elm = event.target,
			entries = [],
			processEntries = function( data ) {
				var feedUrl = data.responseData.feed.feedUrl,
					items = data.responseData.feed.entries,
					icon = this.fIcon,
					k, len, feedtype;

				// lets bind the template to the Entries
				if ( feedUrl && feedUrl.indexOf( "facebook.com" ) > -1 ) {
					feedtype = "facebook";
				} else {
					feedtype = "generic";
				}

				len = items.length;
				for ( k = 0; k !== len; k += 1 ) {
					items[ k ].fIcon =  icon ;
					entries.push( items[ k ] );
				}
				if ( !last ) {
					parseEntries( entries, limit, $content, feedtype );
				}

				last -= 1;
				return last;
			},
			$content, limit, feeds, last, i,  fElem, fIcon;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === elm &&
			elm.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			elm.className += " " + initedClass;

			$content = $( elm ).find( ".feeds-cont" );
			limit = getLimit( elm );
			feeds = $content.find( "li > a" );
			last = feeds.length - 1;
			i = last;

			while ( i >= 0 ) {
				fElem = feeds.eq( i );
				fIcon = fElem.find( "> img" );

				$.ajax({
					url: jsonRequest( fElem.attr( "href" ), limit ),
					dataType: "json",
					fIcon: ( fIcon.length > 0 )  ? fIcon.attr( "src" ) : "",
					timeout: 1000
					}).done( processEntries );

				i -= 1;
			}
			//$.extend( {}, results );
		}
	},

	/**
	 * Returns a class-based set limit on plugin instances
	 * @method getLimit
	 * @param {DOM object} elm The element to search for a class of the form limit-5
	 * @return {number} 0 if none found, which means the plugin default
	 */
	getLimit = function( elm ) {
		var count = elm.className.match( /\blimit-\d+/ );
		if ( !count ) {
			return 0;
		}
		return Number( count[ 0 ].replace( /limit-/i, "" ) );
	},

	/**
	 * Builds the URL for the JSON request
	 * @method jsonRequest
	 * http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=https%3A%2F%2Fwww.facebook.com%2Ffeeds%2Fpage.php%3Fid%3D318424514044%26format%3Drss20&num=20
	 * @param {url} url URL of the feed.
	 * @param {integer} limit Limit on the number of results for the JSON request to return.
	 * @return {url} The URL for the JSON request
	 */
	jsonRequest = function( url, limit ) {

		var requestURL = wb.pageUrlParts.protocol + "//ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent( decodeURIComponent( url ) );

		// API returns a maximum of 4 entries by default so only override if more entries should be returned
		if ( limit > 4 ) {
			requestURL += "&num=" + limit;
		}
		return requestURL;
	},

	/**
	 * Parses the results from a JSON request and appends to an element
	 * @method parseEntries
	 * @param {object} entries Results from a JSON request.
	 * @param {integer} limit Limit on the number of results to append to the element.
	 * @param {jQuery DOM element} $elm Element to which the elements will be appended.
	 * @return {url} The URL for the JSON request
	 */
	parseEntries = function( entries, limit, $elm, feedtype ) {
		var cap = ( limit > 0 && limit < entries.length ? limit : entries.length ),
			result = "",
			compare = wb.date.compare,
			i, sorted, sortedEntry;

		sorted = entries.sort( function( a, b ) {
			return compare( b.publishedDate, a.publishedDate );
		});

		for ( i = 0; i !== cap; i += 1 ) {
			sortedEntry = sorted[ i ];
			result += Templates[ feedtype ]( sortedEntry );
		}
		return $elm.empty().append( result );
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
