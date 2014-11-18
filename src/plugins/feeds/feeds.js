/**
 * @title WET-BOEW Feeds
 * @overview Aggregates and displays entries from one or more Web feeds.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, wb, undef ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-feeds",
	selector = "." + componentName,
	feedLinkSelector = "li > a",
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	patt = /\\u([\d\w]{4})/g,
	limitTypes = [ "load", "display" ],
	i18n, i18nText,

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
			content = content.replace( /(<br>\n?)+/gi, "<br />" );

			return "<li class='media'><a class='pull-left' href=''><img src='" +
				data.fIcon + "' alt='" + data.author +
				"' height='64px' width='64px' class='media-object'/></a><div class='media-body'>" +
				"<h4 class='media-heading'><a href='" + data.link + "'><span class='wb-inv'>" +
				title[ 0 ] + " - </span>" + data.author + "</a>  " +
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

			var seed = "id" + wb.guid(),
				title = data.title,
				media = data.media.m,
				thumbnail = media.replace( "_m.", "_s." ),
				image = media.replace("_m", ""),
				description = data.description.replace( /^\s*<p>(.*?)<\/p>\s*<p>(.*?)<\/p>/i, "");

			// due to CORS we cannot default to simple ajax pulls of the image. We have to inline the content box
			return "<li><a class='wb-lbx' href='#" + seed + "'><img src='" + thumbnail + "' alt='" + title + "' title='" + title + "' class='img-responsive'/></a>" +
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
			var seed = "id" + wb.guid(),
				mediaGroup = data.media$group,
				title = mediaGroup.media$title.$t,
				thumbnail = mediaGroup.media$thumbnail[ 1 ].url,
				description = mediaGroup.media$description.$t,
				videoid = mediaGroup.yt$videoid.$t;

			// Due to CORS we cannot default to simple ajax pulls of the image. We have to inline the content box
			return "<li class='col-md-4 col-sm-6' ><a class='wb-lbx' href='#" + seed + "'><img src='" + thumbnail + "' alt='" + title + "' title='" + title + "' class='img-responsive' /></a>" +
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

			return "<li><a href='" + data.link + "'>" + data.title + "</a><br />" +
				( data.publishedDate !== "" ? " <small class='feeds-date'><time>" +
				wb.date.toDateISO( data.publishedDate, true ) + "</time></small>" : "" ) + "</li>";
		}
	},

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
	 * Helper function that returns a class-based set limit on plugin instances
	 * @method getLimit
	 * @param {DOM object} elm The element to search for a class of the form {limit-type}-5
	 * @param {string} type The type of limit ("load" or "display")
	 * @return {number} 0 if none found, which means the plugin default
	 */
	getLimit = function( elm, type ) {
		var re = new RegExp( "\\b" + type + "-(\\d+)", "i" ),
			limit = elm.className.match( re );

		if ( !limit ) {
			return 0;
		}

		return Number( limit[ 1 ] );
	},

	/**
	 * Helper function that builds the URL for the JSON request
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
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			fetch, url, $content, loadLimit, displayLimit, feeds, fType, last, i, callback, fElem, fIcon;

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = wb.i18n;
			i18nText = {
				previous: i18n( "prv" ),
				next: i18n( "nxt" )
			};
		}

		if ( elm ) {
			$content = $( elm ).find( ".feeds-cont" );
			loadLimit = getLimit( elm, limitTypes[ 0 ] );
			displayLimit = getLimit( elm, limitTypes[ 1 ] );
			feeds = $content.find( feedLinkSelector );
			last = feeds.length - 1;

			// Ensure load and display limits are either non-zero or both zero
			if ( loadLimit === 0 && displayLimit !== 0 ) {
				loadLimit = displayLimit;
			} else if ( displayLimit === 0 && loadLimit !== 0 ) {
				displayLimit = loadLimit;
			}

			// Lets bind some variables to the node to ensure safe ajax thread counting

			$content.data( "toProcess", feeds.length )
					.data( "startAt", 0 )
					.data( "loadLimit", loadLimit )
					.data( "displayLimit", displayLimit )
					.data( "entries", [] );

			for ( i = last; i !== -1; i -= 1 ) {
				fElem = feeds.eq( i );
				fIcon = fElem.find( "> img" );

				fetch = {
					dataType: "jsonp",
					timeout: 3000
				};

				if ( fElem.attr( "data-ajax" ) ) {

					if ( fElem.attr( "href" ).indexOf( "flickr" ) !== -1 ) {
						fType =  "flickr";
						callback = "jsoncallback";
						$content.data( componentName + "-postProcess", [ ".wb-lbx" ] );
					} else {
						fType = "youtube";
						$content.data( componentName + "-postProcess", [ ".wb-lbx", ".wb-mltmd" ] );
					}

					// We need a Gallery so lets add another plugin
					// #TODO: Lightbox review for more abstraction we should not have to add a wb.add() for overlaying
					fetch.url = fElem.attr( "data-ajax" );
					fetch.jsonp = callback;
				} else {
					url = jsonRequest( fElem.attr( "href" ), loadLimit );
					fetch.url = url;

					// Let's bind the template to the Entries
					if ( url.indexOf( "facebook.com" ) !== -1 ) {
						fType = "facebook";
					} else {
						fType = "generic";
					}
				}

				fetch.jsonp = callback;

				fetch.context = {
					fIcon: ( fIcon.length !== 0 ) ? fIcon.attr( "src" ) : "",
					feedType: fType,
					_content: $content
				};

				fElem.trigger({
					type: "ajax-fetch.wb",
					fetch: fetch
				});
			}
		}
	},

	/**
	 * Process Feed/JSON Entries
	 * @method processEntries
	 * @param  {data} JSON formatted data to process
	 * @return {string}	of HTML output
	 */
	processEntries = function( data ) {
		var items = data,
			entries = [],
			icon = this.fIcon,
			$content = this._content,
			toProcess = $content.data( "toProcess" ),
			i, len;

		len = items.length;
		for ( i = 0; i !== len; i += 1 ) {
			items[ i ].fIcon =  icon ;

			if ( items[ i ].publishedDate === undef && items[ i ].published !== undef ) {
				items[ i ].publishedDate = items[ i ].published;
			}

			entries.push( items[ i ] );
		}
		// lets merge with latest entries
		entries = $.merge( entries, $content.data( "entries" ) );

		if ( toProcess === 1 ) {
			parseEntries( entries, $content.data( "startAt" ), $content.data( "displayLimit" ), $content, this.feedType );
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
	 * Parses the results from a JSON request and appends to an element
	 * @method parseEntries
	 * @param {object} entries Results from a JSON request.
	 * @param {integer} startAt Entry from which to start appending results to the element.
	 * @param {integer} limit Limit on the number of results to append to the element.
	 * @param {jQuery DOM element} $elm Element to which the elements will be appended.
	 * @return {url} The URL for the JSON request
	 */
	parseEntries = function( entries, startAt, limit, $elm, feedtype ) {
		var cap = ( limit > 0 && limit < ( entries.length - startAt ) ? limit : ( entries.length - startAt ) ) + startAt,
			displaying = cap - startAt,
			showPagination = (displaying <= entries.length),
			result = "",
			compare = wb.date.compare,
			$details = $elm.closest( "details" ),
			activate = true,
			feedContSelector = ".feeds-cont",
			hasVisibilityHandler = "vis-handler",
			i, sorted, sortedEntry, $tabs;

		$elm.data( "displaying", displaying );

		sorted = entries.sort( function( a, b ) {
			return compare( b.publishedDate, a.publishedDate );
		});

		for ( i = startAt; i !== cap; i += 1 ) {
			sortedEntry = sorted[ i ];
			result += Templates[ feedtype ]( sortedEntry );
		}
		$elm.data( componentName + "-result", result );

		// Check to see if feed should be activated (only if visible)
		// and add handler to determine visibility
		if ( $details.length !== 0 ) {
			if ( $details.attr( "role" ) === "tabpanel" ) {
				if ( $details.attr( "aria-hidden" ) === "true" ) {
					activate = false;
					$elm.empty().addClass( "waiting" );
					$tabs = $details.closest( ".wb-tabs" );
					if ( !$tabs.hasClass( hasVisibilityHandler ) ) {
						$tabs
							.on( "wb-updated.wb-tabs", function( event, $newPanel ) {
								var $feedCont = $newPanel.find( feedContSelector );
								if ( !$feedCont.hasClass( "feed-active" ) ) {
									activateFeed( $feedCont, showPagination );
								}
							})
							.addClass( hasVisibilityHandler );
					}
				}
			} else if ( !$details.attr( "open" ) ) {
				activate = false;
				$elm.empty().addClass( "waiting" );
				$details
					.children( "summary" )
						.on( "click.wb-feeds", function( event ) {
							var $summary = $( event.currentTarget ).off( "click.wb-feeds" );
							activateFeed( $summary.parent().find( feedContSelector ), showPagination );
						});
			}
		}

		if ( activate ) {
			activateFeed( $elm, showPagination );
		}

		return true;
	},

	/**
	 * Activates feed results view
	 * @method activateFeed
	 * @param = {jQuery object} $elm Feed container
	 * @param = {boolean} showPagination Show pagination if `true`
	 */
	activateFeed = function( $elm, showPagination ) {
		var result = $elm.data( componentName + "-result" ),
			postProcess = $elm.data( componentName + "-postProcess" ),
			i, postProcessSelector, paginationMarkup;

		$elm.empty()
			.removeClass( "waiting" )
			.addClass( "feed-active" )
			.append( result );

		if ( showPagination ) {
			//Check for and remove outdated pagination markup
			if ( $elm.hasClass( "mrgn-bttm-0" ) ) {
				$elm.removeClass( "mrgn-bttm-0" );
				$elm.next().remove();
				$elm.next().remove();
			}

			paginationMarkup = "<div class=\"clearfix\"></div><ul class=\"pager mrgn-tp-sm\"><li";

			if ( $elm.data( "startAt" ) === 0 ) {
				paginationMarkup += " class=\"disabled\"";
			}

			paginationMarkup += "><a href=\"#\" rel=\"prev\">" + i18nText.previous + "</a></li><li";

			if ( ( $elm.data( "entries" ).length - $elm.data( "startAt" ) - $elm.data( "displaying" ) ) <= 0 ) {
				paginationMarkup += " class=\"disabled\"";
			}

			paginationMarkup += "><a href=\"#\" rel=\"next\">" + i18nText.next + "</a></li></ul>";

			$elm.addClass( "mrgn-bttm-0" ).after( paginationMarkup );
		}

		if ( postProcess ) {
			for ( i = postProcess.length - 1; i !== -1; i -= 1 ) {
				postProcessSelector = postProcess[ i ];
				$elm.find( postProcessSelector )
					.trigger( "wb-init" + postProcessSelector );
			}
		}

		// Identify that the feed has now been displayed
		$elm.trigger( "wb-feed-ready" + selector );
	};

$document.on( "ajax-fetched.wb", selector + " " + feedLinkSelector, function( event, context ) {
	var response = event.fetch.response,
		eventTarget = event.target,
		data;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		data = ( response.responseData ) ? response.responseData.feed.entries : response.items || response.feed.entry;

		// Identify that initialization has completed
		// if there are no entries left to process
		if ( processEntries.apply( context, [ data ] ) === 0 ) {
			wb.ready( $( eventTarget ).closest( selector ), componentName );
		}
	}
});

// Listen for clicks on pagination links
$document.on( "click vclick", ".wb-feeds .pager a[rel]", function( event ) {
	var $linkCtx = $(event.target),
		$content = $(event.target).closest(".wb-feeds").find(".feeds-cont"),
		newStartAt;

	if ( $linkCtx.attr("rel") === "next" ) {
		newStartAt = $content.data( "startAt" ) + $content.data( "displayLimit" );

		// Ensure that the next page's starting entry isn't higher than the highest entry
		if ( newStartAt < $content.data( "entries" ).length ) {

			// Set the new start entry's number
			$content.data( "startAt", newStartAt);

			// Update the feed entries that are shown
			// TODO: Don't force "generic"
			parseEntries( $content.data( "entries" ), newStartAt, $content.data( "displayLimit" ), $content, "generic" );
		}
	} else {
		newStartAt = $content.data( "startAt" ) - $content.data( "displayLimit" );

		// Ensure that the previous page's starting entry isn't smaller than 0
		if ( newStartAt >= 0 ) {

			// Set the new start entry's number
			$content.data( "startAt", newStartAt );

			// Update the feed entries that are shown
			// TODO: Don't force "generic"
			parseEntries( $content.data( "entries" ), newStartAt, $content.data( "displayLimit" ), $content, "generic" );
		}
	}
} );

// Bind the init event to the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
