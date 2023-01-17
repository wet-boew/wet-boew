/**
 * String.prototype.includes() polyfill
 * @author Ricokola
 * @license MIT
 */
if ( !String.prototype.includes ) {
	String.prototype.includes = function( string ) {

		return this.indexOf( string ) !== -1;

	};
}
