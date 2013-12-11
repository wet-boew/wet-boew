/**
 * @title WET-BOEW MathML polyfill
 * @overview The <math> element allows for the display of complex mathematical equations
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var selector = "math",

	/**
	 * Init runs once per polyfill element on the page. There may be multiple elements.
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 */
	init = function() {

		// All plugins need to remove their reference from the timer in the
		// init sequence unless they have a requirement to be poked every 0.5 seconds
		wb.remove( selector );

		// Load the MathML dependency. Since the polyfill is only loaded
		// when !Modernizr.mathml, we can skip the test here.
		Modernizr.load( "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=Accessible" );
	};

// Bind the init event of the plugin
wb.doc.on( "timerpoke.wb", selector, init );

wb.add( selector );

})( wb );
