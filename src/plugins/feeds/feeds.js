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
	feedLinkSelector = "li > a",
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
     * Process Feed Entries
     * @method processFeedEntries
     * @param  {responseObject} JSON formatted response object
     * @return {string}	of HTML output
     */
     // TODO: Refactor processEntries and processJSON since they share almost 80% of the same code
     processEntries = function( data ) {
		var feedUrl = data.responseData.feed.feedUrl,
			items = data.responseData.feed.entries,
			icon = this.fIcon,
			entries = [],
			$content = this._content,
			toProcess = $content.data( "toProcess" ),
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
		// lets merge with latest entries
		entries = $.merge( entries, $content.data( "entries" ) );

		if ( toProcess === 1 ) {
			parseEntries( entries, $content.data( "feedLimit" ), $content, feedtype );
			return 0;
		}

		toProcess -= 1 ;
		$content.data({
			"toProcess": toProcess,
			"entries": entries
		});

		return toProcess;
	},

	  /**
     * Process JSON Entries
     * @method processJson
     * @param  {responseObject} JSON formatted response object
     * @return {string}	of HTML output
     */
     processJson = function( data ) {
		var items = ( data.items ) ? data.items : data.feed.entry,
			icon = this.fIcon,
			entries = [],
			feedtype = this.feedType,
			$content = this._content,
			toProcess = $content.data( "toProcess" ),
			k, len;

			len = items.length;

		for ( k = 0; k !== len; k += 1 ) {
			items[ k ].fIcon =  icon ;
			items[ k ].publishedDate = items[ k ].published;
			entries.push( items[ k ] );
		}
		// lets merge with latest entries
		entries = $.merge( entries, $content.data( "entries" ) );

		if ( toProcess === 1 ) {
			parseEntries( entries, $content.data( "feedLimit" ), $content, feedtype );
			return 0;
		}

		toProcess -= 1 ;
		$content.data({
			"toProcess": toProcess,
			"entries": entries
		});

		return toProcess;

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
		 * [fickr template]
		 * @param  {entry object} data
		 * @return {string}	HTML string for creating a photowall effect
		 */
		flickr: function( data ) {

			var title = data.title,
				thumbnail = data.media.m.replace( "_m.", "_s." ),
				seed = "id" + wb.guid(),
				description = data.description.replace( /^\s*<p>(.*?)<\/p>\s*<p>(.*?)<\/p>/i, ""),
				image = data.media.m.replace("_m", "");

			// due to CORS we cannot default to simple ajax pulls of the image. We have to inline the content box
			return "<li class='col-md-4 col-sm-6'><a class='wb-lbx' href='#" + seed + "' title='" + title + "'><img src='" + thumbnail + "' alt='" + title + "' class='img-responsive'/></a>" +
					"<section id='" + seed + "' class='mfp-hide modal-dialog modal-content overlay-def'>" +
					"<header class='modal-header'><h2 class='modal-title'>" + title + "</h2></header>" +
					"<div class='modal-body'><img src='" + image + "' class='thumbnail center-block' alt='" + title + "' />" +
					description + "</div></section>" +
					"</li>";
		},

		/**
		 * [Youtube template]
		 * @param  {entry object} data
		 * @return {string}	HTML string for creating a photowall effect
		 */
		youtube: function( data ) {
			var title = data.media$group.media$title.$t,
				thumbnail = data.media$group.media$thumbnail[1].url,
				seed = "id" + wb.guid(),
				description = data.media$group.media$description.$t,
				videoid = data.media$group.yt$videoid.$t;

				// due to CORS we cannot default to simple ajax pulls of the image. We have to inline the content box
			return "<li class='col-md-4 col-sm-6' ><a class='wb-lbx' href='#" + seed + "' title='" + title + "'><img src='" + thumbnail + "' alt='" + title + "' class='img-responsive' /></a>" +
					"<section id='" + seed + "' class='mfp-hide modal-dialog modal-content overlay-def'>" +
					"<header class='modal-header'><h2 class='modal-title'>" + title + "</h2></header>" +
					"<div class='modal-body'>" +
					"<figure class='wb-mltmd'><video title='" + title + "'>" +
					"<source type='video/youtube' src='http://www.youtube.com/watch?v=" + videoid + "' />" +
					"</video><figcaption><p>" +  description + "</p>" +
					"</figcaption></figure>" +
					"</div></section>" +
					"</li>";
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
			fetch, $content, limit, feeds, fType, last, i, callback, fElem, fIcon;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === elm &&
			elm.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			elm.className += " " + initedClass;

			$content = $( elm ).find( ".feeds-cont" );
			limit = getLimit( elm );
			feeds = $content.find( feedLinkSelector );
			last = feeds.length - 1;
			i = last;

			// Lets bind some varialbes to the node to ensure safe ajax thread counting

			$content.data( "toProcess", feeds.length )
					.data( "feedLimit", limit )
					.data( "entries", []);

			while ( i >= 0 ) {
				fElem = feeds.eq( i );
				fIcon = fElem.find( "> img" );

				fetch = {
					dataType: "jsonp",
					timeout: 3000
				};

				if ( fElem.attr( "data-ajax" ) ) {

					if ( fElem.attr( "href" ).indexOf( "flickr" ) > -1 ) {
						fType =  "flickr";
						callback = "jsoncallback";
						$content.data( "postProcess", [ ".wb-lbx" ] );
					} else {
						fType = "youtube";
						$content.data( "postProcess", [ ".wb-lbx", ".wb-mltmd" ] );
					}

					// We need a Gallery so lets add another plugin
					// #TODO: Lightbox review for more abstraction we should not have to add a wb.add() for overlaying
					fetch.url = fElem.attr( "data-ajax");
					fetch.jsonp = callback;
				} else {
					fetch.url = jsonRequest( fElem.attr( "href" ), limit );
				}

				fetch.jsonp = callback;

				fetch.context = {
					fIcon: ( fIcon.length > 0 )  ? fIcon.attr( "src" ) : "",
					feedType: fType,
					_content: $content
				};

				$document.trigger({
					type: "ajax-fetch.wb",
					element: fElem,
					fetch: fetch
				});

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
			postProcess = $elm.data( "postProcess" ),
			compare = wb.date.compare,
			i, sorted, sortedEntry;

		sorted = entries.sort( function( a, b ) {
			return compare( b.publishedDate, a.publishedDate );
		});

		for ( i = 0; i !== cap; i += 1 ) {
			sortedEntry = sorted[ i ];
			result += Templates[ feedtype ]( sortedEntry );
		}
		$elm.empty().append( result );

		if ( postProcess ) {

			for ( i = postProcess.length - 1; i >= 0; i--) {
				wb.add( postProcess[i] );
			}

		}
		return true;
	};

$document.on( "ajax-fetched.wb", selector + " " + feedLinkSelector, function( event, context ) {
	var data;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === event.target ) {
		data = event.fetch.response;
		if ( $( this ).attr( "data-ajax" ) ) {
			processJson.apply( context, [ data ] );
		} else {
			processEntries.apply( context, [ data ] );
		}
	}
});

$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
