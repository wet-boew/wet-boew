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
		   type: 'kml',
		   url: 'data/sample.kml',		   
		   visible: true,
		   strokeColor: '#FF00FF',
		   fillColor: '#FF00FF'
		},
		{
		   title: 'ATOM Demo',
		   type: 'atom',
		   url: 'data/sample.atom',		   
		   visible: true
		},
		{
		   title: 'GeoRSS Demo',
		   type: 'georss',
		   url: 'data/sample.rss',		   
		   visible: true,
		   strokeColor: '#000000',
		   fillColor: '#000000'
		}			
	]
};
