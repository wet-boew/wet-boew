/*
 * @title WET-BOEW Web feeds
 * @overview Aggregates and displays entries from one or more Web feeds.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function ( $, window, vapour ) {
	"use strict";

	$.ajaxSettings.cache = false;

	/* 
	 * Variable and function definitions. 
	 * These are global to the plugin - meaning that they will be initialized once per page,
	 * not once per instance of plugin on the page. So, this is a good place to define
	 * variables that are common to all instances of the plugin on a page.
	 */
	var selector = ".wb-webfeeds",
		$document = vapour.doc,
        i18n,
        i18nText,

		weather = {
			_parse_entries: function ( entries, limit, $elm ) {
				var entry = entries[ 1 ],
					result = "<li><a href='" + entry.link + "'>" + entry.title + "</a> <span class='widget-datestamp'>[" +
						to_iso_format( entry.publishedDate, true ) + "]</span></li>";
				return $elm.empty().append( result );
			},
			_map_entries: function ( data ) {
				return data.responseData.feed.entries;
			},
			_json_request: function ( url, limit ) {
				var rl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
							encodeURIComponent(
								decodeURIComponent(
									url.replace( /^.*?\.gc\.ca\/([a-z]+).+\/(.*?)_[a-z]+_([ef])\.html/i, "http://weather.gc.ca/rss/$1/$2_$3.xml" )
								)
							);
				
				if ( limit > 0 ) {
					rl += "&num=" + limit;
				}
				return rl;
			}
		},

		rss = {
			_parse_entries: function ( entries, limit, elm ) {
				var cap = ( limit > 0 && limit < entries.length ? limit : entries.length ),
					result = "",
					i, sorted, sorted_entry;
				
				sorted = entries.sort( function ( a, b ) {
					return compare( b.publishedDate, a.publishedDate );
				} );

				for ( i = 0; i !== cap; i += 1 ) {
					sorted_entry = sorted[ i ];
					result += "<li><a href='" + sorted_entry.link + "'>" + sorted_entry.title + "</a>" +
						( sorted_entry.publishedDate !== "" ?  " <span class='widget-datestamp'>[" +
						to_iso_format( sorted_entry.publishedDate, true ) + "]</span>" : "" ) + "</li>";
				}
				return elm.empty().append( result );
			},

			_map_entries: function ( data ) {
				return data.responseData.feed.entries;
			},

			_json_request: function ( url, limit ) {
				var rl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent( decodeURIComponent( url ) );
				if ( limit > 0 ) {
					rl += "&num=" + limit;
				}
				return rl;
			}
		},

		/*
		 * Init runs once per plugin element on the page. There may be multiple elements. 
		 * It will run more than once per plugin if you don't remove the selector from the timer.
		 * @method init
		 * @param {jQuery DOM element} $elm The plugin element being initialized
		 */
		init = function ( _elm, $elm ) {

			var $loading, $content,	feeds, limit, typeObj, entries,	i, last, process_entries,
				parse_entries, _results, finalize, deferred, protocol, loadingTag, type;

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

            // Only initialize the i18nText once
            if ( !i18nText ) {
                i18n = window.i18n;
                i18nText = {
                    loading: i18n( "%loading" )
                };
            }

			limit = getLimit( _elm );
			feeds = $elm.find( "a" ).map( function () {
				var a = this.href;
				if ( !type && /twitter.com/i.test( a ) ) {
					type = "twitter";
				}
				if ( !type && /weather.gc.ca/i.test( a ) ) {
					type = "weather";
				}
				if ( !type ) {
					type = "rss";
				}
				return a;
			});

			loadingTag = type === "twitter" ? "a" : "li";
			$loading = $( "<" + loadingTag + " class='widget-state-loading'><img src='assets/ajax-loader.gif' alt='" + i18nText.loading + "' /></" + loadingTag + ">" );
			$content = $elm.find( ".widget-content, .twitter-timeline" );
			$content.append( $loading );

			if ( type !== "twitter" ) {
				typeObj = ( type === "rss" ? rss : weather );

				last = feeds.length - 1;
				entries = [ ];
				parse_entries = typeObj._parse_entries;
				i = last;
				_results = [ ];

				process_entries = function ( data ) {
					var k, len;

					data = typeObj._map_entries( data );
					len = data.length;
					for ( k = 0; k !== len; k += 1 ) {
						entries.push( data[ k ] );
					}
					if ( !last ) {
						parse_entries( entries, limit, $content );
					}

					last -= 1;
					return last;
				};

				finalize = function () {
					$loading.remove();
					// TODO: Use CSS instead
					$content.find( "li" ).show();
				};

				deferred = [ ];
				while ( i >= 0 ) {
					deferred[ i ] = $.ajax( {
						url: typeObj._json_request( feeds[ i ], limit ),
						dataType: "json",
						timeout: 1000
					} ).done( process_entries );
					_results.push( i -= 1 );
				}
				$.when.apply( null, deferred ).always( finalize );

				$.extend( {}, _results );
			} else {
				protocol = vapour.pageUrlParts.protocol;
				window.Modernizr.load( {
					load: ( protocol.indexOf( "http" ) === -1 ? "http" : protocol ) + "://platform.twitter.com/widgets.js"
				});
			}
		},

		// TODO: Should these be added as central helpers? They were in v3.1
		
		/*
		 * Returns a class-based set limit on plugin instances
		 * @method getLimit
		 * @param {DOM object} elm The element to search for a class of the form blimit-5
		 * @return {number} 0 if none found, which means the plugin default
		 */
		getLimit = function ( _elm ) {
			var count = _elm.className.match( /\blimit-\d+/ );
			if ( !count ) {
				return 0;
			}
			return Number( count[ 0 ].replace( /limit-/i, "" ) );
		},

		/*
		 * Left-pads a number with zeros.
		 * @param {number} number The original number to pad.
		 * @param {number} length The width of the resulting padded number, not the number of zeros to add to the front of the string.
		 * @return {string} The padded string
		 */
		pad = function (number, length) {
			var str = String(number);
			while (str.length < length) {
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
		 * @param {Date | number[] | number | string | object} d
		 * @return {Date | NaN}
		 */
		convert =  function ( d ) {
			if ( d.constructor === Date ) {
				return d;
			} else if ( d.constructor === Array ) {
				return new Date( d[ 0 ], d[ 1 ], d[ 2 ] );
			} else if ( d.constructor === Number || d.constructor === String ) {
				return new Date( d );
			} else if ( typeof d === "object" ) {
				return new Date( d.year, d.month, d.date );
			}
			return NaN;
		},

		/*
		 * Compares two dates (input can be any type supported by the convert function). NOTE: This function uses pe.date.isFinite, and the code inside isFinite does an assignment (=).
		 * @param {Date | number[] | number | string | object} a
		 * @param {Date | number[] | number | string | object} b
		 * @return {number | NaN}
		 * @example returns
		 * -1 if a < b
		 * 0 if a = b
		 * 1 if a > b
		 * NaN if a or b is an illegal date
		 */
		compare = function ( a, b ) {
			if ( isFinite( a = convert( a ).valueOf() ) && isFinite( b = convert( b ).valueOf() ) ) {
				return ( a > b ) - ( a < b );
			}
			return NaN;
		},

		/*
		 * Cross-browser safe way of translating a date to ISO format
		 * @param {Date | number[] | number | string | object} d
		 * @param {boolean} timepresent Optional. Whether to include the time in the result, or just the date. False if blank.
		 * @return {string}
		 * @example
		 * to_iso_format( new Date() )
		 * returns "2012-04-27"
		 * to_iso_format( new Date(), true )
		 * returns "2012-04-27 13:46"
		 */
		to_iso_format = function ( d, timepresent ) {
			var date = convert( d );
				if ( timepresent ) {
					return date.getFullYear() + "-" + pad( date.getMonth() + 1, 2, "0" ) + "-" + pad( date.getDate(), 2, "0" ) +
						" " + pad( date.getHours(), 2, "0" ) + ":" + pad( date.getMinutes(), 2, "0" );
				}
				return date.getFullYear() + "-" + pad( date.getMonth() + 1, 2, "0" ) + "-" + pad( date.getDate(), 2, "0" );
		};

	$document.on( "timerpoke.wb", selector, function () {
		init( this, $( this ) );

		/*
		 * Since we are working with events we want to ensure that we are being passive about our control, 
		 * so returning true allows for events to always continue
		 */
		return true;
	} );

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );

} )( jQuery, window, vapour );
