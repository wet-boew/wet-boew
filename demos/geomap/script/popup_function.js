var map,
_pe = window.pe;

_pe.document.on('geomap-ready', function() {
	"use strict";
	map = _pe.fn.geomap.getMap(); 
});

function zoomFeature() {
	"use strict";
	var layer = map.getLayersByName('cities')[0],
		feats = layer.features,
		len = layer.features.length;
		
	while (len--) {
		if (feats[len].popup) {
			if (feats[len].popup.visible()) {
				map.zoomToExtent(feats[len].geometry.bounds);
			}
		}
	}
}
