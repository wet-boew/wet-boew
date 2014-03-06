/* jshint node: true, onevar: false */
module.exports = function( grunt ) {
	"use strict";
	grunt.registerMultiTask("ie8csscleaning", "Manual cleaning of Minified CSS for IE8", function() {

		this.files.forEach(function( f ) {

		/**
		 * @type {string[]}
		 */
		var sources = f.src.filter(function( filepath ) {

			// Warn on and remove invalid source files (if nonull was set).
			if ( !grunt.file.exists( filepath ) ) {
				grunt.log.warn( "Source file '" + filepath + "' not found." );
				return false;
			} else {
				return true;
			}
		});

		// Write the destination file, or source file if destination isn't specified.
		if ( typeof f.dest !== "undefined" ) {

			// Concat specified files.
			var css = sources.map(function( filepath ) {
				return grunt.file.read( filepath );
			}).join( grunt.util.linefeed );

			grunt.file.write( f.dest, ie8Replacements( css ) );
			grunt.log.writeln( "Cleaned file '" + f.dest + "' created." );

		} else {

			sources.forEach(function(filepath) {
				grunt.file.write(filepath, ie8Replacements( grunt.file.read( filepath ) ) );
				grunt.log.writeln( "File '" + filepath + "' prefixed." );
			});
		}

		});

		function ie8Replacements( css ) {
			return css.replace( /@/g, grunt.util.linefeed + "@" );
		}
	});
};
