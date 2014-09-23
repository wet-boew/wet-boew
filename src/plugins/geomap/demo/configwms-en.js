/*
 * @title WET-BOEW Geomap English config file
 * @overview Example English configuration file for Geomap
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */

/*
 * Global overrides for individual components
 *
 * Map Overlays (i.e. layers)
 * Overlays will be added in the order that they are provided
 * (i.e. the first overlay will be added first, then the next
 * on top, and so on).
 *
 * Note that the basemap can be set globally in settings.js.
 */
/*jshint unused:false*/
var wet_boew_geomap = {
	// OPTIONAL: note that Geomap will provide a default basemap if not specified here.
	basemap: {
		title: "WMS-Toporama",
		type: "wms",
		url: "http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en",
		version: "1.1.1",
		format: "image/jpeg",
		layers: "WMS-Toporama",
		mapOptions: {
			maxExtent: "-141, 41, -52, 84",
			restrictedExtent: "-141, 41, -52, 84",
			maxResolution: "auto",
			projection: "EPSG:4269",
			units: "m",
			displayProjection: "EPSG:4269",
			aspectRatio: 0.8
		}
	},
	overlays: []
};
