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
	
	/*
	If AOI widget is enabled Geomap will populate two 
	hidden inputs with the coordinates input by the
	user. 
	
	For example if the uniqueId of the map is 1:
	
		<input type="hidden" id="geomap-aoi-extent-1">
		<input type="hidden" id="geomap-aoi-extent-lonlat-1">
	
	*/
	var $aoiExtent = $( "#geomap-aoi-extent-" + mapSample.uniqueId ),
		$aoiExtentLonLat = $( "#geomap-aoi-extent-lonlat-" + mapSample.uniqueId );
	
	if ( $aoiExtent ) {
		
		$aoiExtent.on( "change", function() {
			console.log( "BBox: " +  $( this ).val() );
		});
		
		$aoiExtentLonLat.on( "change", function() {
			console.log( "BBox LonLat: " + $( this ).val() );
		});
		
	}
	
	// Zoom to location on location_map
	mapLocation = maps.location_map;

	if ( mapLocation ) {
		mapLocation.zoomToExtent( mapLocation.layers[ 3 ].features[ 0 ].geometry.bounds );
	}
});

})( jQuery, wb );
