/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
WET-BOEW-Geomap-Configuration
 */

/*
Global overrides for individual components
 */

/*
Map Overlays (i.e. layers)

Overlays will be added in the order that they are provided 
(i.e. the first overlay will be added first, then the next 
on top, and so on) using the painters model.
 */
var wet_boew_geomap = {
overlays : [
	{
	   title: 'WMS Demo FR',
	   type: 'wms',
	   url: 'http://www2.dmsolutions.ca/cgi-bin/mswms_gmap',
	   layers: 'bathymetry,land_fn,park,drain_fn,drainage,prov_bound,fedlimit,rail,road,popplace',		   
	   format: 'image/png',
	   visible: false
	},
	{
	   title: 'KML Demo FR',
	   type: 'kml',
	   url: 'data/sample.kml',		   
	   visible: false
	},
	{
	   title: 'ATOM Demo FR',
	   type: 'atom',
	   url: 'data/sample.atom',		   
	   visible: true
	},
	{
	   title: 'GeoRSS Demo FR',
	   type: 'georss',
	   url: 'data/sample.rss',		   
	   visible: true
	}				
]
};
