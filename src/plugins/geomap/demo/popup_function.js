/*
 * @title WET-BOEW Geomap popup function
 * @overview OpenLayers popup loader for Geomap
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, wb ) {
"use strict";

var mapSample;

wb.doc.zoomFeature = function() {
	var layer = mapSample.getLayersByName( "cities" )[ 0 ],
		feats = layer.features,
		len = layer.features.length;

	while ( len-- ) {
		if ( feats[ len ].popup ) {
			if ( feats[ len ].popup.visible() ) {
				mapSample.zoomToExtent( feats[ len ].geometry.bounds );
			}
		}
	}
};

wb.doc.on( "geomap.ready", function( event, maps ) {
	var mapLocation;

	// Get the sample_map to use in zoomFeature function
	mapSample = maps.sample_map;

	// Zoom to location on location_map
	mapLocation = maps.location_map;

	if ( mapLocation ) {
		mapLocation.zoomToExtent( mapLocation.layers[ 2 ].features[ 0 ].geometry.bounds );
	}
});

})( jQuery, wb );
