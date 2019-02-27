///*
// * @title WET-BOEW Geomap English config file
// * @overview Example English configuration file for Geomap with Tile basemap
// * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
// * @author @jvanulde
// */
/*jshint unused:false*/
var wet_boew_geomap = {
	basemap: {
		title: "Tile (XYZ) Source Map",
		type: "osm",
		url: [
			"//otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
			"//otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
			"//otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
			"//otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png"
		],
		mapOptions: {
			projection: "EPSG:900913",
			center: [ -123, 49 ],
			zoomLevel: 5
		}
	}
};
