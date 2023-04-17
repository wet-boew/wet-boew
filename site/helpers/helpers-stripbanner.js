/**
 * Handlebars helpers: Strip banner
 * Removes the banner (i.e. first multi-line comment) from CSS/JavaScript code
 * Regex derived from Ryan Wheale's answer in https://stackoverflow.com/a/15123777
 */
"use strict";

// Export helper
// eslint-disable-next-line no-undef
module.exports.register = function( Handlebars, options ) {

	// eslint-disable-next-line no-unused-vars
	options = options || {};

	Handlebars.registerHelper( "stripbanner", function( options ) {
		return options.fn( this ).replace( /^\/\*[\s\S]*?\*\/\r?\n?/m, "" );
	} );
};
