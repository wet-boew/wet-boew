/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
WET-BOEW-Settings
 */
var wet_boew_properties = {
	/** global plugins are called via a array of dependency names **/
	globals : ['equalize', 'deselectradio', 'css3ie', 'datemodified']
};

/*
Global overrides for individual components
 */

// Share widget
var wet_boew_share = {
	sites : ['facebook', 'google', 'linkedin', 'reddit', 'stumbleupon', 'twitter', 'yahoobuzz']
};

// Charts widget 
// var wet_boew_charts = { };

// Geomap widget
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
	}*/	
	
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
			]
};