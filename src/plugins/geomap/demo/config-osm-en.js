///*
// * @title WET-BOEW Geomap English config file
// * @overview Example English configuration file for Geomap with MapQuest OSM basemap
// * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
// * @author @jvanulde
// */
/*jshint unused:false*/
var wet_boew_geomap = {
	basemap: {
		title: "MapQuest OSM Map",
		type: "xyz",
		url: [
			"http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
			"http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
			"http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
			"http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png"
		],
		mapOptions: {
			projection: "EPSG:900913",
			center: [ -123, 49 ],
			zoomLevel: 5
		}
	}
};
