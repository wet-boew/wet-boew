/*
 * @title WET-BOEW Vapour loader
 * @overview Helper methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */

/* 
 * Vapour Object that will store tombstone data for plugins to leverage
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
	
	oldie = (function(){
				var undef,
					v = 3,
					div = document.createElement("div"),
					all = div.getElementsByTagName("i");
	
				while (
					div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><i></i><![endif]-->",
					all[0]
				){}
	
				return v > 4 ? v : undef;
			}()),
	
	getUrlParts = function( url ) {
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
	
	vapour = {
		"/": $homepath,
		"/assets": "" + $homepath + "/assets",
		"/templates": "" + $homepath + "/assets/templates",
		"/deps": "" + $homepath + "/deps",
		mode: $mode,
		doc: $( document ),
		win: $( window ),
		html: $( "html" ),
		pageUrlParts: getUrlParts( window.location.href),
		getUrlParts: getUrlParts,

		getPath: function( property ) {
			var resource;
			resource = this.hasOwnProperty( property ) ? this[ property ] : undef;
			return resource;
		},
	
		getMode: function() {
			return this.mode;
		},

		// Lets load some variables into vapour for IE detection
		other:  !oldie,
		desktop: ( window.orientation === undefined ),
		ie:     !!oldie,
		ie6:    ( oldie === 6 ),
		ie7:    ( oldie === 7 ),
		ie8:    ( oldie === 8 ),
		ie9:    ( oldie === 9),
		ielt7:  ( oldie < 7 ),
		ielt8:  ( oldie < 8 ),
		ielt9:  ( oldie < 9 ),
		ielt10: ( oldie < 10 ),

		isDisabled: function() {
			return ( $.isFunction( this.wbDisable ) ) ? this.wbDisable() : this.wbDisable;
		},

		// A generic function for enabling/disabling WET plugins and polyfills
		wbDisable: function() {
			var pageQueryParams = vapour.pageUrlParts.params,
					wbDisableLocalStorage = ( localStorage ) ? localStorage.getItem( "wbdisable" ) : null;

			// let override the function for optimization
			vapour.wbDisable = ( pageQueryParams.wbdisable ) ? pageQueryParams.wbdisable : wbDisableLocalStorage;

			// convert to true boolean
			vapour.wbDisable = ( vapour.wbDisable.toLowerCase() === "true" );
			
			return vapour.wbDisable;
		}
	};
	
	window.vapour = vapour;
	
})( jQuery, window, document );

/*
Establish the base path to be more flexible in terms of WCMS where JS can reside in theme folders and not in the root of sites
@TODO: For modularity the prefixes where written independantly as we are flushing out some use cases on better grouping and optimization of polyfills.
	Once this more hashed out, we could optimize the prefixes down to one or two prefixes "site" and "disabled" to thin out the codeblock a bit more
	increase performance due to redundant chaining of the prefixes.
*/
(function( yepnope, vapour ) {
	"use strict";
	
	var i18n = document.documentElement.lang,
		mode = vapour.getMode();
	
	/*
	 @prefix: site! - adds the root js directory of yepnope resources 
	*/
	yepnope.addPrefix( "site", function( resourceObj ) {
		var _path = vapour.getPath( "/" );
		resourceObj.url = _path + "/" + resourceObj.url;
		return resourceObj;
	});
	
	/*
	 @prefix: i18n! - adds the correct document langugage for our i18n library
	*/
	yepnope.addPrefix( "i18n", function( resourceObj ) {
		resourceObj.url = resourceObj.url + i18n + mode + ".js";
		return resourceObj;
	});
	
	/*
	 @prefix: modejs! - adds the correct document langugage for our i18n library
	*/
	yepnope.addPrefix( "modejs", function( resourceObj ) {
		if ( !mode ){
			resourceObj.url = resourceObj.url.replace(".min","");
		}
		return resourceObj;
	});
	
	/*
	 @prefix: disabled! - checks if the user has disabled settings and bypassed the resource
	*/
	yepnope.addPrefix( "disabled", function( resourceObj ) {
		if ( vapour.isDisabled() ){
			resourceObj.bypass = true;
		}
		return resourceObj;
	});
	
})( yepnope, vapour );

/*
 * Modernizr Load call
 */
(function( Modernizr, window, vapour ) {

	"use strict";
	// Our Base timer for all event driven plugins
	window._timer = {
		_elms: [],
	
		add: function( _selector ) {
			var _obj = vapour.doc.find( _selector );
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
			// lets ensure we are not running if things are disabled
			if ( vapour.isDisabled() ){
				return 1;
			}
			/* Lets start our clock right away. We we need to test to ensure that there will not be any
			 * instances on Mobile were the DOM is not ready before the timer starts. That is why 0.5 seconds 
			 * was used a buffer.
			 */
			window._timer.touch();
			// lets keep it ticking after
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
	Modernizr.load([
		{
			test: Modernizr.localstorage,
			nope: "site!modejs!polyfills/localstorage.min.js"
		},{
			// localStorage polyfill always loads in both Standard and Basic HTML versions so user preference can be stored
			load: "site!i18n!modejs!i18n/",
			complete: function() {
				if ( vapour.isDisabled() ) {
					vapour.doc.trigger( "disable.wb" );
				}
			}
		},{
			test: Modernizr.canvas,
			nope: "disabled!site!modejs!polyfills/excanvas.min.js"
		}, {
			test: Modernizr.details,
			nope: "disabled!site!modejs!polyfills/detailssummary.min.js"
		}, {
			test: Modernizr.input.list,
			nope: "disabled!site!modejs!polyfills/datalist.min.js"
		}, {
			test: Modernizr.inputtypes.range,
			nope: "disabled!site!modejs!polyfills/slider.min.js"
		}, {
			test: Modernizr.sessionstorage,
			nope: "disabled!site!modejs!polyfills/sessionstorage.min.js"
		}, {
			test: Modernizr.progress,
			nope: "disabled!site!modejs!polyfills/progress.min.js"
		}, {
			test: Modernizr.meter,
			nope: "disabled!site!modejs!/polyfills/meter.min.js"
		}, {
			test: Modernizr.touch,
			yep: "disabled!site!modejs!/polyfills/mobile.min.js"
		}, {
			test: vapour.ie && vapour.desktop,
			yep: "disabled!site!modejs!polyfills/jawsariafixes.min.js",
			complete: function (){
				window._timer.start();
			}
		}
	]);

})( Modernizr, window, vapour );
