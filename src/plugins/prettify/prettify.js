/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Prettify Plugin
 * @overview Wrapper for Google Code Prettify library: https://code.google.com/p/google-code-prettify/
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 *
 * Syntax highlighting of source code snippets in an html page using [google-code-prettify](http://code.google.com/p/google-code-prettify/).
 *
 * 1. Apply `class="prettyprint"` to a `pre` or `code` element to apply syntax highlighting. Alternatively use `class="all-pre"` to apply syntax highlighting to all `pre` elements on the page.
 * 2. Apply `class="linenums"` to a `pre` or `code` element to add line numbers. Alternatively use `class="all-linenums"` to all applicable `pre` elements. Specify the starting number by adding `linenums:#` before `linenums`.
 * 3. Add extra language support by applying `class="lang-*"` to each applicable `pre` or `code` element.  Supported language syntax CSS classes are as follows:
 *    - lang-apollo
 *    - lang-clj
 *    - lang-css
 *    - lang-dart
 *    - lang-go
 *    - lang-hs
 *    - lang-lisp
 *    - lang-lua
 *    - lang-ml
 *    - lang-n
 *    - lang-proto
 *    - lang-scala
 *    - lang-sql
 *    - lang-tex
 *    - lang-vb
 *    - lang-vhdl
 *    - lang-wiki
 *    - lang-xq
 *    - lang-yaml
 */
(function ( $, window, vapour ) {

"use strict";

/*
 * Global variable and function definitions.
 */
var selector = ".wb-prettify",
	defaults = {
		linenums: false,
		allpre: false
	},

	/**
	 * Initialize the plugin. This only runs once on the DOM.
	 * @function init
	 */
	init = function() {
		var i, len, $pre,
			$elm = $( this ),
			classes = $elm.attr( "class" ).split( " " ),
			modeJS = vapour.getMode() + ".js",
			deps = [ "site!deps/prettify" + modeJS ],
			settings = $.extend( {}, defaults, $elm.data() );

		window._timer.remove( selector );

		// Check the element for `lang-*` syntax CSS classes
		for ( i = 0, len = classes.length; i < len; i++ ) {
			if ( classes[ i ].indexOf( "lang-" ) === 0 ) {
				deps.push( "site!deps/" + classes[ i ] + modeJS );
			}
		}

		// CSS class overides of settings
		settings.allpre = settings.allpre || $elm.hasClass( "all-pre" );
		settings.linenums = settings.linenums || $elm.hasClass( "linenums" );

		// Apply global settings
		if ( settings.allpre || settings.linenums ) {
			$pre = vapour.doc.find( "pre" );
			if ( settings.allpre ) {
				$pre.addClass( "prettyprint" );
			}
			if ( settings.linenums ) {
				$pre.filter( ".prettyprint" ).addClass( "linenums" );
			}
		}

		// Load the required dependencies and prettify the code once finished
		window.Modernizr.load({
			load: deps,
			complete: function() {
				vapour.doc.trigger( "prettyprint.wb-prettify" );
			}
		});
	},

	/**
	 * Invoke the Google pretty print library if it has been initialized
	 * @function prettyprint
	 */
	prettyprint = function() {
		if ( typeof window.prettyPrint === "function" ) {
			window.prettyPrint();
		}
	};

// Bind the plugin events
vapour.doc
	.on( "timerpoke.wb", selector, init )
	.on( "prettyprint.wb-prettify", prettyprint );

// Add the timer poke to initialize the plugin
window._timer.add( selector );

}( jQuery, window, vapour ) );
