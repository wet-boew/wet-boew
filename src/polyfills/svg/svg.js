/**
 * @title WET-BOEW SVG image replacer
 * @overview Replaces SVG images with PNG images where SVG support is absent
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $ ) {
"use strict";

var $svgObjects = $( "object[data$='.svg']" ),
	$svgImages = $( "img[src$='.svg']" ),
	len = $svgObjects.length,
	i, alt, id, $svg;

for ( i = 0; i !== len; i += 1 ) {
	$svg = $svgObjects.eq( i );
	alt = $svg.attr( "aria-label" );
	id = $svg.attr( "id" );
	$svg.replaceWith( "<img src='" + $svg.attr( "data" ).replace( ".svg", ".png" ) +
		"' alt='" + ( !alt ? "" : alt ) + "'" + ( !id ? "" :  "id='" + id + "'" ) +  "/>" );
}

len = $svgImages.length;
for ( i = 0; i !== len; i += 1 ) {
	$svg = $svgImages.eq( i );
	$svg.attr( "src", $svg.attr( "src" ).replace( ".svg", ".png" ) );
}

})( jQuery );
