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

var plugin = {
	selector: ".prettyprint",
	executed: false,
	defaults: {
		allLinenums: false,
		allPre: false
	},

	/**
	 * Initialize the plugin. This only runs once on the DOM.
	 */
	init: function() {
		var cssClass, cssClasses, deps, i, j, lenClasses, lenPres, modeJS, pre, pres, settings;

		window._timer.remove( plugin.selector );

		// Only initialize this plugin once.  The prettify lib updates the DOM in one pass.
		if ( plugin.executed === false ) {
			plugin.executed = true;

			pres = vapour.doc[0].getElementsByTagName( "pre" );
			modeJS = vapour.getMode() + ".js";
			settings = $.extend( {}, plugin.defaults );
			deps = [ "site!deps/prettify" + modeJS ];

			// Check the <pre> CSS classes to determine plugin settings
			for ( i = 0, lenPres = pres.length; i < lenPres; i++ ) {
				pre = pres[ i ];
				cssClasses = typeof pre.className === "string" ? pre.className : "";

				// Add line numbers to all <pre> elements
				if ( !settings.allLinenums && /all\-linenums/.test( cssClasses ) ) {
					settings.allLinenums = true;
				}

				// Prettify all <pre> elements
				if ( !settings.allPre && /all\-pre/.test( cssClasses ) ) {
					settings.allPre = true;
				}

				// Language syntax file
				cssClasses = pre.className.split( " " );
				for ( j = 0, lenClasses = cssClasses.length; j < lenClasses; j++ ) {
					cssClass = cssClasses[ j ];
					if ( cssClass.indexOf( "lang-" ) === 0 ) {
						deps.push( "site!deps/" + cssClass + modeJS );
					}
				}
			}

			// Apply global plugin settings
			if ( settings.allPre || settings.allLinenums ) {
				pres = $( pres );
				if ( settings.allPre ) {
					pres.addClass( plugin.selector.substring( 1 ) );
				}
				if ( settings.allLinenums ) {
					pres.filter( plugin.selector ).addClass( "linenums" );
				}
			}

			// Load the required dependencies and prettify the code once finished
			window.Modernizr.load({
				load: deps,
				complete: function() {
					vapour.doc.trigger( "prettyprint.wb-prettify" );
				}
			});
		}
	},

	/**
	 * Invoke the Google pretty print library if it has been initialized
	 */
	prettyprint: function() {
		if ( typeof window.prettyPrint === "function" ) {
			window.prettyPrint();
		}
	}
};

// Bind the plugin events
vapour.doc
	.on( "timerpoke.wb", plugin.selector, plugin.init )
	.on( "prettyprint.wb-prettify", plugin.prettyprint );

// Add the timer poke to initialize the plugin
window._timer.add( plugin.selector );

}( jQuery, window, vapour ) );
