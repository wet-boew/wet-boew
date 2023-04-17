/**
 * Handlebars helpers: Escape expression
 * Encodes special characters (like HTML tags) for code samples
 * Uses https://handlebarsjs.com/api-reference/utilities.html#handlebars-escapeexpression-string
 */
"use strict";

// Export helper
// eslint-disable-next-line no-undef
module.exports.register = function( Handlebars, options ) {

	// eslint-disable-next-line no-unused-vars
	options = options || {};

	Handlebars.registerHelper( "escape", function( options ) {
		return Handlebars.escapeExpression( options.fn( this ) );
	} );
};
