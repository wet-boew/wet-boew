/**
 * Handlebars Helpers: strip html tags
 * TODO: Remove when https://github.com/assemble/handlebars-helpers/pull/179 lands
 */
"use strict";


// The module to be exported
var helpers = {


	/**
	 * {{striphtml}}
	 * @author: Laurent Goderre <https://github.com/LaurentGoderrre>
	 * @param  {Object} options
	 * @return {String}
	 */
	striptags: function( options ) {
		return options.fn( this ).replace( /<[^>]*?>/g, "" );
	}
};


// Export helpers
// eslint-disable-next-line no-undef
module.exports.register = function( Handlebars, options ) {
	// eslint-disable-next-line no-unused-vars
	options = options || {};
	for ( var helper in helpers ) {
		if ( helpers.hasOwnProperty( helper ) ) {
			Handlebars.registerHelper( helper, helpers[ helper ] );
		}
	}
};
