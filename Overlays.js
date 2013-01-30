/*var Ellipses = {
		title: 'CBMT',
		type: 'ArcGISRest',
		url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer/export',
		options: { singleTile: false, ratio: 1.0, projection: 'EPSG:3978', fractionalZoom: true }
};*/

alert("tets");
var overlays = [
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
		   visible: false
		},
		{
		   title: 'ATOM Demo',
		   type: 'atom',
		   url: 'data/sample.atom',		   
		   visible: false
		},
		{
		   title: 'GeoRSS Demo',
		   type: 'georss',
		   url: 'data/sample.rss',		   
		   visible: true
		}				
	];
