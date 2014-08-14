/**
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

/**
 * @method getUrlParts
 * @param {String} url of URL to examine
 * @return {Object} of the parts of passed URL
 */
var getUrlParts = function( url ) {
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
			params: (function() {
				var results = {},
					queryString = a.search.replace( /^\?/, "" ).split( "&" ),
					len = queryString.length,
					key, strings, i;

				for ( i = 0; i !== len; i += 1 ) {
					if ( key = queryString[ i ] ) {
						strings = key.split( "=" );
						results[ strings[ 0 ] ] = strings[ 1 ];
					}
				}
				return results;
			}())
		};
	},

	/**
	 * @variable $src
	 * @return {jQuery Element} of wb script element
	 */
	$src = $( "script[src*='wet-boew.js'],script[src*='wet-boew.min.js']" )
		.last(),

	/**
	 * @variable i18n
	 * @return {string} of HTML document language
	 */
	lang = document.documentElement.lang,

	/**
	 * @variable $homepath
	 * @return {string} of version current path to JS directory
	 */
	$homepath = $src.prop( "src" )
		.split( "?" )[ 0 ].split( "/" )
		.slice( 0, -1 )
		.join( "/" ),

	/**
	 * @variable $homecss
	 * @return {string} of version current path to CSS directory
	 */
	$homecss = $homepath.substring( 0, $homepath.length - 2 ) + "css",

	/**
	 * @variable $mode
	 * @return {string} of version of JS [development or production]
	 */
	$mode = $src.prop( "src" )
		.indexOf( ".min" ) < 0 ? "" : ".min",

	/**
	 * @variable oldie
	 * @return {integer} of IE version
	 */
	oldie = (function() {
		var undef,
			v = 3,
			div = document.createElement( "div" ),
			all = div.getElementsByTagName( "i" );

		while (
			div.innerHTML = "<!--[if gt IE " + ( v += 1 ) + "]><i></i><![endif]-->",
			all[ 0 ]
		) {}

		return v > 4 ? v : undef;
	}()),

	/**
	 * @variable currentpage
	 * @return {Object} of parts of the current page URL
	 */
	currentpage = getUrlParts( window.location.href ),

	/**
	 * @variable disabled
	 * @return {boolean} of state of disabled flag
	 */
	disabled = (function() {
		var disabled = currentpage.params.wbdisable || ( !localStorage ? "false" : localStorage.getItem( "wbdisable" ) );
		return ( typeof disabled === "string" ) ? ( disabled.toLowerCase() === "true" ) : Boolean( disabled );
	}()),

	/*-----------------------------
	 * Core Library Object
	 *-----------------------------
	 */
	wb = {
		"/": $homepath,
		"/assets": $homepath + "/../assets",
		"/templates": $homepath + "/assets/templates",
		"/deps": $homepath + "/deps",
		lang: lang,
		mode: $mode,
		doc: $( document ),
		win: $( window ),
		html: $( "html" ),
		pageUrlParts: currentpage,
		getUrlParts: getUrlParts,
		isDisabled: disabled,
		isStarted: false,
		isReady: false,
		initQueue: 0,

		getPath: function( property ) {
			return this.hasOwnProperty( property ) ? this[ property ] : undef;
		},

		getMode: function() {
			return this.mode;
		},

		init: function( event, componentName, selector ) {
			var	eventTarget = event.target,
				isEvent = !!eventTarget,
				node = isEvent ? eventTarget : event,
				initedClass = componentName + "-inited",
				isDocumentNode = node === document;

			// Filter out any events triggered by descendants and only initializes
			// the element once (if is an event and document node is not the target)
			if ( !isEvent || isDocumentNode || ( event.currentTarget === node &&
				node.className.indexOf( initedClass ) === -1 ) ) {

				this.initQueue += 1;
				this.remove( selector );
				if ( !isDocumentNode ) {
					node.className += " " + initedClass;
				}

				return node;
			}

			return undef;
		},

		ready: function( $elm, componentName, context ) {
			if ( $elm ) {
				$elm.trigger( "wb-ready." + componentName, context );
				this.initQueue -= 1;
			}

			if ( !this.isReady && this.isStarted && this.initQueue < 1 ) {
				this.isReady = true;
				this.doc.trigger( "wb-ready.wb" );
			}
		},

		// Lets load some variables into wb for IE detection
		other:  !oldie,
		desktop: ( window.orientation === undefined ),
		ie:     !!oldie,
		ie6:    ( oldie === 6 ),
		ie7:    ( oldie === 7 ),
		ie8:    ( oldie === 8 ),
		ie9:    ( oldie === 9 ),
		ielt7:  ( oldie < 7 ),
		ielt8:  ( oldie < 8 ),
		ielt9:  ( oldie < 9 ),
		ielt10: ( oldie < 10 ),

		selectors: [],

		resizeEvents: "xxsmallview.wb xsmallview.wb smallview.wb mediumview.wb largeview.wb xlargeview.wb",

		// For Charts and Geomap
		drawColours: [
			"#8d201c",
			"#EE8310",
			"#2a7da6",
			"#5a306b",
			"#285228",
			"#154055",
			"#555555",
			"#f6d200",
			"#d73d38",
			"#418541",
			"#87aec9",
			"#23447e",
			"#999999"
		],

		// Add a selector to be targeted by timerpoke
		add: function( selector ) {
			var exists = false,
				len = wb.selectors.length,
				i;

			// Lets ensure we are not running if things are disabled
			if ( wb.isDisabled && selector !== "#wb-tphp" ) {
				return 0;
			}

			// Check to see if the selector is already targeted
			for ( i = 0; i !== len; i += 1 ) {
				if ( wb.selectors[ i ] === selector ) {
					exists = true;
					break;
				}
			}

			// Add the selector if it isn't already targeted
			if ( !exists ) {
				wb.selectors.push( selector );
			}
		},

		// Remove a selector targeted by timerpoke
		remove: function( selector ) {
			var len = this.selectors.length,
				i;

			for ( i = 0; i !== len; i += 1 ) {
				if ( this.selectors[ i ] === selector ) {
					this.selectors.splice( i, 1 );
					break;
				}
			}
		},

		// Handles triggering of timerpoke events
		timerpoke: function() {
			var selectorsLocal = wb.selectors.slice( 0 ),
				len = selectorsLocal.length,
				selector, $elms, i;

			for ( i = 0; i !== len; i += 1 ) {
				selector = selectorsLocal[ i ];
				$elms = $( selector );

				// If the selector returns elements, trigger a timerpoke event
				if ( $elms.length !== 0 ) {
					$elms.trigger( "timerpoke.wb" );

				// If the selector returns no elements, remove the selector
				} else {
					this.remove( selector );
				}
			}
		},

		start: function() {

			// Initiate timerpoke events right way
			wb.timerpoke( true );
			this.isStarted = true;
			this.ready();

			// Initiate timerpoke events again every half second
			setInterval( wb.timerpoke, 500 );
		},

		i18nDict: {},
		i18n: function( key, state, mixin ) {
			var dictionary = wb.i18nDict,

				// eg. 000 or 001 ie. 0 or 1
				truthiness = ( typeof key === "string" && key !== "" ) |

					// eg. 000 or 010 ie. 0 or 2
					( typeof state === "string" && state !== "" ) << 1 |

					// eg. 000 or 100 ie. 0 or 4
					( typeof mixin === "string" && mixin !== "" ) << 2;

			switch ( truthiness ) {
				case 1:

					// only key was provided
					return dictionary[ key ];

				case 3:

					// key and state were provided
					return dictionary[ key ][ state ];

				case 7:

					// key, state, and mixin were provided
					return dictionary[ key ][ state ].replace( "[MIXIN]", mixin );
				default:
					return "";
			}
		}
	};

window.wb = wb;

/*-----------------------------
 * Yepnope Prefixes
 *-----------------------------*/
/*
 * Establish the base path to be more flexible in terms of WCMS where JS can
 * reside in theme folders and not in the root of sites
 * @TODO: For modularity the prefixes where written independently as we are
 * flushing out some use cases on better grouping and optimization of polyfills.
 * Once this more hashed out, we could optimize the prefixes down to one or two
 * prefixes "site" and "disabled" to thin out the codeblock a bit more
 * increase performance due to redundant chaining of the prefixes.
 */

/**
 * @prefix: site! - adds the root js directory of yepnope resources
 */
yepnope.addPrefix( "site", function( resourceObj ) {
	resourceObj.url = $homepath + "/" + resourceObj.url;
	return resourceObj;
});

/**
 * @prefix: plyfll! - builds the path for the polyfill resource
 */
yepnope.addPrefix( "plyfll", function( resourceObj ) {
	var path;

	if ( disabled ) {
		resourceObj.bypass = true;
	} else if ( !$mode ) {
		resourceObj.url = resourceObj.url.replace( ".min", "" );
	}

	if ( resourceObj.url.indexOf( ".css" ) !== -1 ) {
		resourceObj.forceCSS = true;
		path = $homecss;
	} else {
		path = $homepath;
	}
	resourceObj.url = path + "/polyfills/" + resourceObj.url;

	return resourceObj;
});

/**
 * @prefix: i18n! - adds the correct document language for our i18n library
 */
yepnope.addPrefix( "i18n", function( resourceObj ) {
	resourceObj.url = $homepath + "/" + resourceObj.url + lang + $mode + ".js";
	return resourceObj;
});

/*-----------------------------
 * Modernizr Polyfill Loading
 *-----------------------------*/
Modernizr.load([
	{
		test: Modernizr.details,
		nope: [
			"plyfll!details.min.js",
			"plyfll!details.min.css"
		]
	}, {
		test: Modernizr.input.list,
		nope: [
			"plyfll!datalist.min.js",
			"plyfll!datalist.min.css"
		]
	}, {
		test: Modernizr.inputtypes.date,
		nope: [
			"plyfll!datepicker.min.js",
			"plyfll!datepicker.min.css"
		]
	}, {
		test: Modernizr.inputtypes.range,
		nope: [
			"plyfll!slider.min.js",
			"plyfll!slider_wrapper.min.js",
			"plyfll!slider.min.css"
		],
		callback: function( url ) {
			if ( url === "slider.min.js" ) {
				window.fdSlider.onDomReady();
			}
		}
	}, {
		test: Modernizr.progressbar,
		nope: [
			"plyfll!progress.min.js",
			"plyfll!progress.min.css"
		]
	}, {
		test: Modernizr.mathml,

		// Cleanup Modernizr test and add selector to global timer
		complete: function() {
			var	componentName = "wb-math",
				selector = "math",
				math = document.getElementsByTagName( selector ),
				$document = wb.doc;

			// Cleanup elements that Modernizr.mathml test leaves behind.
			if ( math.length ) {
				document.body.removeChild( math[ math.length - 1 ].parentNode );
			}

			// Defer loading the polyfill till an element is detected due to the size
			if ( !Modernizr.mathml ) {

				// Bind the init event of the plugin
				$document.one( "timerpoke.wb wb-init." + componentName, selector, function() {

					// Start initialization
					wb.init( document, componentName, selector );

					// Load the MathML dependency. Since the polyfill is only loaded
					// when !Modernizr.mathml, we can skip the test here.
					Modernizr.load({
						load: "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=Accessible",
						complete: function() {

							// Identify that initialization has completed
							wb.ready( $document, componentName );
						}
					});
				});

				wb.add( selector );
			}
		}
	}, {
		test: Modernizr.meter,
		nope: [
			"plyfll!meter.min.js",
			"plyfll!meter.min.css"
		]
	}, {
		test: Modernizr.touch,
		yep: "plyfll!mobile.min.js"
	}, {
		test: Modernizr.svg,
		nope: "plyfll!svg.min.js"
	}, {
		load: "i18n!i18n/",
		complete: function() {
			wb.start();
		}
	}
]);

})( jQuery, window, document );
