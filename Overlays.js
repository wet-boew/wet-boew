var wet_boew_geomap = {
	// OPTIONAL: note that geomap will provide a default basemap if not specified here.
	/* basemap : {
		title: 'CBMT',
		type: 'wms',
		url: 'http://geogratis.gc.ca/maps/CBMT',
		layers: 'CBMT',
		format: 'image/png',
		version: '1.1.1',
		options: { singleTile: false, ratio: 1.0, projection: 'EPSG:3978', fractionalZoom: true }
	*/
	overlays : [
		{
		    title: 'WMS Demo',
		    type: 'wms',
		    url: 'http://www2.dmsolutions.ca/cgi-bin/mswms_gmap',
		    layers: 'bathymetry,land_fn,park,drain_fn,drainage,prov_bound,fedlimit,rail,road,popplace',		   
		    format: 'image/png',
		    visible: false
		},
		{
		    title: 'KML Demo',
		    caption: 'This is a sample KML file loaded locally by Geomap.',
		    type: 'kml',
		    url: 'data/sample.kml',		   
		    visible: true,
		    strokeColor: '#FF00FF',
		    fillColor: '#FF00FF'
		},
		{
		    title: 'ATOM Demo',
		    caption: 'This is a sample ATOM feed loaded locally by Geomap.',
		    type: 'atom',
		    url: 'data/sample.atom',		   
		    visible: false
		},
		{
			title: 'GeoRSS Demo',
			caption: 'This is a sample GeoRSS feed loaded locally by Geomap.',
			type: 'georss',
			url: 'data/sample.rss',		   
			visible: false,
			strokeColor: '#000000',
			fillColor: '#999999'
		},
		{
			title: 'JSON Demo',
			caption: 'This is a sample dataset loaded from a remote JSON resource, in this case the GeoGratis API.',
			type: 'json',					
			url: 'http://geogratis.gc.ca/api/en/nrcan-rncan/ess-sst',
			params: {
				'alt': 'json',
				'q': 'alluvial'
			},
			visible: true,
			root: 'products',
			attributes: {
				title: 'title',
				description: 'summary',
				geometry: 'geometry',
				author: 'author'
			},
			strokeColor: '#336600',
			fillColor: '#00CC00'
		}
	]
};
