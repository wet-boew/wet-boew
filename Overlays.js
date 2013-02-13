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
		    visible: false,
		    attributes: {
		    	name: 'Product Title',
		    	description: 'Description'
		    },
		    strokeColor: '#FF00FF',
		    fillColor: '#FF00FF'
		},
		{
		    title: 'ATOM Demo',
		    caption: 'This is a sample ATOM feed loaded locally by Geomap.',
		    type: 'atom',
		    url: 'data/sample.atom',
		    attributes: {
		    	title: 'Title',
		    	summary: 'About this dataset'
		    },
		    visible: false
		},
		{
			title: 'GeoRSS Demo',
			caption: 'This is a sample GeoRSS feed loaded locally by Geomap.',
			type: 'georss',
			url: 'data/sample.rss',	
			attributes: {
				title: 'Title',
				description: 'Description',
				link: 'More Info'
			},
			visible: false,
			strokeColor: '#000000',
			fillColor: '#999999'
		},
		{
			title: 'JSON (GeoGratis)',
			caption: 'This is a sample dataset loaded from a remote JSON resource, in this case the GeoGratis API.',
			type: 'json',					
			url: 'http://geogratis.gc.ca/api/en/nrcan-rncan/ess-sst',
			params: {
				'alt': 'json',
				'q': 'alluvial'
			},
			visible: false,
			root: 'products',			
			attributes: {
				title: 'Title',
				summary: 'Abstract',				
				author: 'Author'
			},
			strokeColor: '#336600',
			fillColor: '#00CC00'
		},
		{
			title: 'GeoJSON (CartoDB)',
			caption: 'This is a sample dataset loaded from a remote GeoJSON resource, in this case traffic cameras in the city of Ottawa from the CartoDB API.',
			type: 'geojson',					
			url: 'http://stephenott.cartodb.com/api/v2/sql',
			params: {
				'format': 'GeoJSON',
				'q': 'SELECT * FROM traffic_cameras LIMIT 10'
			},
			attributes: {				
				location_desc: 'Location',
				longitude: 'Latitude',
				latitude: 'Longitude',				
				updated_at: 'Last updated'
			},
			visible: false,			
			strokeColor: '#800080',
			fillColor: '#FF00FF'
		}		
	]
};
