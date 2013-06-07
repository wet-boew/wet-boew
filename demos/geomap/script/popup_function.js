var mapSample,
	_pe = window.pe;

_pe.document.on('geomap-ready', function() {
	"use strict";
	var mapLocation;
	// get the sample_map to use in zoomFeature function
	mapSample = _pe.fn.geomap.getMap('sample_map');
	
	// zoom to location on location_map
	mapLocation = _pe.fn.geomap.getMap('location_map');
	mapLocation.zoomToExtent(mapLocation.layers[2].features[0].geometry.bounds); 
});

function zoomFeature() {
	"use strict";
	var layer = mapSample.getLayersByName('cities')[0],
		feats = layer.features,
		len = layer.features.length;
		
	while (len--) {
		if (feats[len].popup) {
			if (feats[len].popup.visible()) {
				mapSample.zoomToExtent(feats[len].geometry.bounds);
			}
		}
	}
}
