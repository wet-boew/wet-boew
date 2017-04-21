/**
 * @title WET-BOEW Vapour loader
 * @overview Helper methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
/*
 * Vapour Object that will store tombstone data for plugins to leverage
 */
( function( $, window, document, undef ) {
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
			params: ( function() {
				var results = {},
					queryString = encodeURI( decodeURI( a.search.replace( /^\?/, "" ) ) ).replace( /'/g, "%27" ).split( "&" ),
					len = queryString.length,
					key, strings, i;

				for ( i = 0; i !== len; i += 1 ) {
					if ( ( key = queryString[ i ] ) !== null ) {
						strings = key.split( "=" );
						results[ strings[ 0 ] ] = strings[ 1 ];
					}
				}
				return results;
			}() )
		};
	},

	/**
	 * @variable seed
	 * @return a unique number for auto-generating ids
	 */
	seed = 0,

	/**
	 * @variable $src
	 * @return {jQuery Element} of wb script element
	 */
	$src = $( "script[src*='wet-boew.js'],script[src*='wet-boew.min.js'],script[data-wb-core]" )
		.last(),

	/**
	 * @variable i18n
	 * @return {string} of HTML document language
	 */
	lang = document.documentElement.lang,

	paths = ( function( ele ) {
		var paths = {};

		paths.home = ele.prop( "src" )
				.split( "?" )[ 0 ].split( "/" )
				.slice( 0, -1 )
				.join( "/" );
		paths.asset = paths.home + "/../assets";
		paths.template = paths.home + "/assets/templates";
		paths.dep = paths.home + "/deps";
		paths.js = paths.home;
		paths.css = paths.home.substring( 0, paths.home.length - 2 ) + "css";
		paths.mode = ele.prop( "src" ).indexOf( ".min" ) < 0 ? "" : ".min";

		if ( ele[ 0 ].hasAttribute( "data-wb-core" ) ) {
			$.extend( paths, {
				home: ele.attr( "data-home" ),
				asset: ele.attr( "data-asset" ),
				template: ele.attr( "data-template" ),
				dep: ele.attr( "data-dep" ),
				js: ele.attr( "data-js" ),
				css: ele.attr( "data-css" ),
				mode: ele.attr( "data-mode" )
			} );
		}

		return paths;
	}( $src ) ),

	/**
	 * @variable oldie
	 * @return {integer} of IE version
	 */
	oldie = ( function() {
		var undef,
			v = 3,
			div = document.createElement( "div" ),
			all = div.getElementsByTagName( "i" );

		while ( (
			div.innerHTML = "<!--[if gt IE " + ( v += 1 ) + "]><i></i><![endif]-->",
			all[ 0 ]
		) ) {};

		return v > 4 ? v : undef;
	}() ),

	/**
	 * @variable currentpage
	 * @return {Object} of parts of the current page URL
	 */
	currentpage = getUrlParts( window.location.href ),

	/**
	 * @variable disabled
	 * @return {boolean} of state of disabled flag
	 */
	disabled = ( function() {
		var disabledSaved = "false",
			disabled;

		try {
			disabledSaved = localStorage.getItem( "wbdisable" ) || disabledSaved;
		} catch ( e ) {}

		disabled = currentpage.params.wbdisable || disabledSaved;
		return ( typeof disabled === "string" ) ? ( disabled.toLowerCase() === "true" ) : Boolean( disabled );
	}() ),

	/*-----------------------------
	 * Core Library Object
	 *-----------------------------
	 */
	wb = {
		"/": paths.home,
		"/assets": paths.asset,
		"/templates": paths.template,
		"/deps": paths.dep,
		lang: lang,
		mode: paths.mode,
		doc: $( document ),
		win: $( window ),
		html: $( "html" ),
		pageUrlParts: currentpage,
		getUrlParts: getUrlParts,
		isDisabled: disabled,
		isStarted: false,
		isReady: false,
		ignoreHashChange: false,
		initQueue: 0,

		getPath: function( property ) {
			return this.hasOwnProperty( property ) ? this[ property ] : undef;
		},

		getMode: function() {
			return this.mode;
		},

		getId: function() {
			return "wb-auto-" + ( seed += 1 );
		},

		init: function( event, componentName, selector, noAutoId ) {
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

					if ( !noAutoId && !node.id ) {
						node.id = wb.getId();
					}
				}

				return node;
			}

			return undef;
		},

		ready: function( $elm, componentName, context ) {
			if ( $elm ) {

				// Trigger any nested elements (excluding nested within nested)
				$elm
					.find( wb.allSelectors )
						.addClass( "wb-init" )
						.filter( ":not(#" + $elm.attr( "id" ) + " .wb-init .wb-init)" )
							.trigger( "timerpoke.wb" );

				// Identify that the component is ready
				$elm.trigger( "wb-ready." + componentName, context );
				this.initQueue -= 1;
			} else {
				this.doc.trigger( "wb-ready." + componentName, context );
			}

			// Identify that global initialization is complete
			if ( !this.isReady && this.isStarted && this.initQueue < 1 ) {
				this.isReady = true;
				this.doc.trigger( "wb-ready.wb" );
			}
		},

		// Lets load some variables into wb for IE detection
		other: !oldie,
		desktop: ( window.orientation === undefined ),
		ie: !!oldie,
		ie6: ( oldie === 6 ),
		ie7: ( oldie === 7 ),
		ie8: ( oldie === 8 ),
		ie9: ( oldie === 9 ),
		ielt7: ( oldie < 7 ),
		ielt8: ( oldie < 8 ),
		ielt9: ( oldie < 9 ),
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

		// Get and generate a unique session id
		sessionGUID: function() {
			var sessionId = sessionStorage.getItem( "wb-session-GUID" );
			if ( !sessionId ) {
				sessionId = wb.guid();
				sessionStorage.setItem( "wb-session-GUID", sessionId );
			}
			return sessionId;
		},

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
		timerpoke: function( initial ) {
			var selectorsLocal = wb.selectors.slice( 0 ),
				len = selectorsLocal.length,
				selector, $elms, $foundElms, i;

			if ( initial ) {
				$foundElms = $();
				for ( i = 0; i !== len; i += 1 ) {
					selector = selectorsLocal[ i ];
					$elms = $( selector );
					if ( $elms.length !== 0 ) {
						$foundElms = $foundElms.add( $elms );

					// If the selector returns no elements, remove the selector
					} else {
						wb.remove( selector );
					}
				}

				// Keep only the non-nested plugin/polyfill elements
				$elms = $foundElms.filter( ":not(.wb-init .wb-init)" ).addClass( "wb-init" );
			} else {
				$elms = $( selectorsLocal.join( ", " ) );
			}
			$elms.trigger( "timerpoke.wb" );
		},

		start: function() {

			// Save a copy of all the possible selectors
			wb.allSelectors = wb.selectors.join( ", " );

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
		},

		hashString: function( str ) {

			// Sources:
			//	http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
			//	http://jsperf.com/hashing-strings
			var hash = 0,
				chr, i;

			if ( str.length === 0 ) {
				return hash;
			}

			for ( i = 0; i < str.length; i++ ) {
				chr = str.charCodeAt( i );
				hash = ( ( hash << 5 ) - hash ) + chr;

				// Convert to 32bit integer
				hash = hash & hash;
			}

			return hash;
		},

		stripWhitespace: function( str ) {
			return str.replace( /\s+/g, "" );
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
	resourceObj.url = paths.js + "/" + resourceObj.url;
	return resourceObj;
} );

/**
 * @prefix: plyfll! - builds the path for the polyfill resource
 */
yepnope.addPrefix( "plyfll", function( resourceObj ) {
	var path,
		url = resourceObj.url;

	if ( disabled && url.indexOf( "svg" ) === -1 ) {
		resourceObj.bypass = true;
	} else if ( !paths.mode ) {
		url = url.replace( ".min", "" );
	}

	if ( url.indexOf( ".css" ) !== -1 ) {
		resourceObj.forceCSS = true;
		path = paths.css;
	} else {
		path = paths.js;
	}
	resourceObj.url = path + "/polyfills/" + url;

	return resourceObj;
} );

/**
 * @prefix: i18n! - adds the correct document language for our i18n library
 */
yepnope.addPrefix( "i18n", function( resourceObj ) {
	resourceObj.url = paths.js + "/" + resourceObj.url + lang + paths.mode + ".js";
	return resourceObj;
} );

/*-----------------------------
 * Modernizr Polyfill Loading
 *-----------------------------*/
Modernizr.load( [
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
					Modernizr.load( {
						load: "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=Accessible",
						complete: function() {

							// Identify that initialization has completed
							wb.ready( $document, componentName );
						}
					} );
				} );

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
] );

} )( jQuery, window, document );
