/*
	WET-BOEW Vapour loader
*/
/*
Vapour Object that will store tombstone data for plugins to leverage
*/
(function( $, window, document, undef ) {
	"use strict";

	var $src = $( "script[src$='vapour.js'],script[src$='vapour.min.js']" )
		.last(),

	$homepath = $src.prop( "src" )
		.split( "?" )[ 0 ].split( "/" )
		.slice( 0, -1 )
		.join( "/" ),

	$mode = $src.prop( "src" )
		.indexOf( ".min" ) < 0 ? "" : ".min",

	vapour = {
		"/": $homepath,
		"/assets": "" + $homepath + "/assets",
		"/templates": "" + $homepath + "/assets/templates",
		"/deps": "" + $homepath + "/deps",
		mode: $mode,
		doc: $( document ),
		win: $( window ),
		html: $( "html" ),
		pageUrlParts: null,

		getPath: function( property ) {
			var resource;
			resource = this.hasOwnProperty( property ) ? this[ property ] : undef;
			return resource;
		},

		getMode: function() {
			return this.mode;
		},

		getUrlParts: function( url ) {
			var a = document.createElement( "a" );
			a.href = url;
			return {
				href: a.href,
				absolute: a.href,
				host: a.host,
				hostname: a.hostname,
				port: a.port,
				pathname: a.pathname,
				protocol: a.protocol,
				hash: a.hash,
				search: a.search,
				// A collection of the parameters of the query string part of the URL.
				params: ( function() {
					var key, strings, segment, _i,	_len,
						results = {};
					segment = a.search.replace( /^\?/, "" ).split( "&" );
					_len = segment.length;
					for ( _i = 0; _i !== _len; _i += 1 ) {
						key = segment[ _i ];
						if ( key ) {
							strings = key.split( "=" );
							results[ strings[ 0 ] ] = strings[ 1 ];
						}
					}
					return results;
				}())
			};
		},

		// Escapes the characters in a string for use in a jQuery selector
		// Based on http://totaldev.com/content/escaping-characters-get-valid-jquery-id
		jqEscape: function( string ) {
			return string.replace( /([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, "\\$1" );
		},

		// TODO: Come up with a more elegant way of identify specific IE versions so can automatically disable plugins and polyfills for them (e.g., IE6)
		ieVersion: ( ( /(MSIE) ([\w.]+)/.exec( navigator.userAgent ) || [] )[ 2 ] || "0" ),

		// A generic function for enabling/disabling WET plugins and polyfills
		wbDisable: function() {
			var pageQueryParams = vapour.pageUrlParts.params,
				pageQueryParam,
				newQuery = "?",
				wbDisableLocalStorage = ( localStorage ? localStorage.getItem( "wbdisable" ) : null ),
				wbDisableQuery = pageQueryParams.wbdisable,
				wbDisable = ( wbDisableQuery ? wbDisableQuery : wbDisableLocalStorage ),
				wbTphp = document.getElementById( "wb-tphp" ),
				li = document.createElement( "li" ),
				$html = this.html,
				i18n = window.i18n;

			if ( wbTphp ) {
				for ( pageQueryParam in pageQueryParams ) { // Rebuild the query string
					if ( pageQueryParams.hasOwnProperty( pageQueryParam ) && pageQueryParam !== "wbdisable" ) {
						newQuery += pageQueryParam + "=" + pageQueryParams[ pageQueryParam ] + "&#38;";
					}
				}

				// TODO: Find better way than browser sniffing to single out IE6
				if ( wbDisable === "true" || ( vapour.ieVersion > 0 && vapour.ieVersion < 7 && wbDisable !== "false" ) ) {
					$html.addClass( "no-js wb-disable" );
					if ( localStorage ) {
						// Store preference for WET plugins and polyfills to be disabled in localStorage
						localStorage.setItem( "wbdisable", "true");
					}

					// Append the Standard version link
					li.innerHTML = "<a href='" + newQuery + "wbdisable=false'>" + i18n( "%wb-enable" ) + "</a>";
					wbTphp.appendChild( li ); // Add link to re-enable WET plugins and polyfills
					return true;
				} else if ( localStorage ) {
					localStorage.setItem( "wbdisable", "false" ); // Store preference for WET plugins and polyfills to be enabled in localStorage
				}

				// Append the Basic HTML version link version
				li.innerHTML = "<a href='" + newQuery + "wbdisable=true'>" + i18n( "%wb-disable" ) + "</a>";
				wbTphp.appendChild( li ); // Add link to disable WET plugins and polyfills
			}
			return false;
		}
	};

	window.vapour = vapour;

})( jQuery, window, document );
/*
Establish the base path to be more flexible in terms of WCMS where JS can reside in theme folders and not in the root of sites
*/
(function( yepnope, vapour ) {
	"use strict";

	yepnope.addPrefix( "site", function( resourceObj ) {
		var _path = vapour.getPath( "/" );
		resourceObj.url = _path + "/" + resourceObj.url;
		return resourceObj;
	});
})( yepnope, vapour );
/*
Modernizr Load call
*/
(function( Modernizr, window, vapour ) {
	"use strict";

	var modeJS = vapour.getMode() + ".js";

	// Our Base timer for all event driven plugins
	window._timer = {
		_elms: [],
		_cache: [],

		add: function( _selector ) {
			var _obj;
			if ( this._cache.length < 1 ) {
				this._cache = $( document.body );
			}
			_obj = this._cache.find( _selector );
			if ( _obj.length > 0 ) {
				this._elms.push( _obj );
			}
		},

		remove: function( _selector ) {
			var elms = this._elms,
				$elm,
				len = elms.length,
				i;
			for ( i = 0; i !== len; i += 1 ) {
				$elm = elms[ i ];
				if ( $elm && $elm.selector === _selector ) {
					this._elms.splice( i, 1 );
					break;
				}
			}
		},

		start: function() {
			setInterval( function() {
				window._timer.touch();
			}, 500 );
		},

		touch: function() {
			var elms = this._elms,
				$elm,
				len = elms.length,
				i;
			for ( i = 0; i !== len; i += 1 ) {
				$elm = elms[ i ];
				if ( $elm ) {
					$elm.trigger( "timerpoke.wb" );
				}
			}
		}
	};

	/* ------- Modernizr load calls -----------*/
	Modernizr.load( [{

		test: Modernizr.localstorage,
		nope: "site!polyfills/localstorage" + modeJS
	}, {

		// localStorage polyfill always loads in both Standard and Basic HTML versions so user preference can be stored
		load: "site!i18n/" + document.documentElement.lang + modeJS,
		complete: function() {
			// Process the page URL and cache the results in the vapour object
			vapour.pageUrlParts = vapour.getUrlParts( window.location.href );

			// Only load plugins and polyfills if running in Standard version
			if ( !vapour.wbDisable() ) {
				Modernizr.load( [{

					test: Modernizr.canvas,
					nope: "site!polyfills/excanvas" + modeJS
				}, {

					test: Modernizr.details,
					nope: "site!polyfills/detailssummary" + modeJS
				}, {

					test: Modernizr.input.list,
					nope: "site!polyfills/datalist" + modeJS
				}, {

					test: Modernizr.inputtypes.range,
					nope: "site!polyfills/slider" + modeJS
				}, {

					test: Modernizr.sessionstorage,
					nope: "site!polyfills/sessionstorage" + modeJS
				}, {

					test: Modernizr.progress,
					nope: "site!polyfills/progress" + modeJS
				}, {

					test: Modernizr.meter,
					nope: "site!/polyfills/meter" + modeJS
				}, {

					test: Modernizr.touch,
					yep: "site!polyfills/mobile" + modeJS
				}, {

					test: navigator.userAgent.indexOf( "Win" ) !== -1 && navigator.userAgent.match(
						/^((?!mobi|tablet).)*$/i ) !== null,
					yep: "site!polyfills/jawsariafixes" + modeJS
				}]);

				window._timer.start();
			}
		}
	}]);

})( Modernizr, window, vapour );
