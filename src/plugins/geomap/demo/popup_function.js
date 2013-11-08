/*
 * @title WET-BOEW Geomap popup function
 * @overview OpenLayers popup loader for Geomap
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, vapour ) {
"use strict";

var mapSample,
	$document = vapour.doc;

	/*zoomFeature = function() {
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
	};*/

$document.on( "ready.geomap", function( event ) {
	var mapLocation;

	// Get the sample_map to use in zoomFeature function
	mapSample = event.sampleMap;
	
	// Zoom to location on location_map
	mapLocation = event.locationMap;
	
	if ( mapLocation ) {
		mapLocation.zoomToExtent( mapLocation.layers[ 2 ].features[ 0 ].geometry.bounds );
	}
});

})( jQuery, vapour );