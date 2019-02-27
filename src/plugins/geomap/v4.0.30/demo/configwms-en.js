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
		format: "image/png",
		layers: "limits",
		mapOptions: {
			maxExtent: "-2650000.0, -900000.0, 3600000.0, 4630000.0",
			restrictedExtent: "-2750000.0, -1000000.0, 3700000.0, 4730000.0",
			maxResolution: "auto",
			projection: "EPSG:3978",
			units: "m",
			displayProjection: "EPSG:4269",
			aspectRatio: 0.8
		}
	},
	overlays: []
};
