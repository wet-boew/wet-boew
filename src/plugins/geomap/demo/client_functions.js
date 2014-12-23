/*
 * @title WET-BOEW Geomap client functions
 * @overview OpenLayers popup loader for Geomap
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, wb ) {
"use strict";

var $document = wb.doc,
	mapSample;

$document.zoomFeature = function() {
	var layer = mapSample.getLayersByName( "cities" )[ 0 ],
		feats = layer.features,
		len;

	for ( len = layer.features.length - 1; len !== -1; len -= 1 ) {
		if ( feats[ len ].popup ) {
			if ( feats[ len ].popup.visible() ) {
				mapSample.zoomToExtent( feats[ len ].geometry.bounds );
			}
		}
	}
};

$document.on( "wb-ready.wb-geomap", "#sample_map", function( event, map ) {

	// Get the sample_map to use in zoomFeature function
	mapSample = map;
	var $aoiExtent = $( "#geomap-aoi-extent-" + mapSample.id ),
		$aoiExtentLonLat = $( "#geomap-aoi-extent-lonlat-" + mapSample.id );

	if ( $aoiExtent ) {

		$aoiExtent.on( "change", function() {
			//console.log( "BBox: " + $( this ).val() );
		} );

		$aoiExtentLonLat.on("change", function() {
			//console.log( "BBox LonLat: " + $( this ).val() );
		} );
	}
});

$document.on( "wb-ready.wb-geomap", "#location_map", function( event, map ) {

	// Zoom to location on location_map
	map.zoomToExtent( map.getLayer( "#addNRCan" ).getDataExtent() );
});

})( jQuery, wb );
