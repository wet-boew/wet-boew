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
	/*basemap: {
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
	},*/
	overlays: [
		{
			title: "KML Demo",
			caption: "This is a sample KML file loaded locally by Geomap.",
			type: "kml",
			url: "demo/sample.kml",
			visible: false,
			datatable: false,
			tab: true,
			popups: true,
			attributes: {
				name: "Product Title",
				description: "Description"
			}
		},
		{
			title: "ATOM Demo",
			caption: "This is a sample ATOM feed loaded locally by Geomap.",
			type: "atom",
			url: "demo/sample.atom",
			tab: true,
			attributes: {
				title: "Title",
				summary: "About this dataset"
			},
			visible: false
		},
		{
			title: "GeoRSS Demo",
			caption: "This is a sample GeoRSS feed loaded locally by Geomap.",
			type: "georss",
			url: "demo/sample.rss",
			attributes: {
				title: "Title",
				description: "Description",
				link: "More Info"
			},
			visible: false,
			datatable: false,
			tab: true
		},
		{
			title: "JSON (GeoGratis)",
			caption: "This is a sample dataset loaded from a remote JSON resource, in this case the GeoGratis API.",
			type: "json",
			url: "http://geogratis.gc.ca/api/en/nrcan-rncan/ess-sst",
			params: {
				alt: "json",
				q: "alluvial"
			},
			visible: false,
			root: "products",
			popups: true,
			tab: true,
			attributes: {
				title: "Title",
				summary: "Abstract",
				author: "Author"
			}
		},
		{
			title: "GeoJSON (CartoDB)",
			caption: "This is a sample dataset loaded from a remote GeoJSON resource, in this case traffic cameras in the city of Ottawa from the CartoDB API.",
			type: "geojson",
			url: "http://stephenott.cartodb.com/api/v2/sql",
			params: {
				format: "GeoJSON",
				q: "SELECT * FROM traffic_cameras LIMIT 25"
			},
			attributes: {
				location_desc: "Location",
				longitude: "Latitude",
				latitude: "Longitude",
				updated_at: "Last updated"
			},
			visible: false,
			zoom: true,
			datatable: true,
			tab: true,

			// default style
			style: {
				type: "symbol",
				init: {
					graphicWidth: 30,
					graphicHeight: 30,
					externalGraphic: "demo/trafficcamera.png",
					graphicOpacity: 1.0
				},
				select: {
					graphicWidth: 20,
					graphicHeight: 20,
					externalGraphic: "demo/trafficcamera_active.png",
					graphicOpacity: 0.5
				}
			}

			/*
			// unique value style
			style: {
				type: "unique",
				field: "Location",
				init: {
					"Bayshore & Richmond": {
						pointRadius: "25",
						strokeWidth: "20",
						strokeColor: "#800080"
					},
					"Baseline & Greenbank": {
						pointRadius: "25",
						strokeWidth: "10",
						fillColor: "#800080"
					}
				},
				select: {
					pointRadius: 30,
					externalGraphic: "demo/icons/OverIcon.png",
					label: "${Location}",
					fillOpacity: 0.90
				}
			}

			// rule style
			style: {
				type: "rule",
				rule: [{
					field: "Longitude",
					value: [45.36],
					filter: "LESS_THAN",
					init: {
						pointRadius: "15",
						strokeColor: "#800000",
						fillColor: "#FFFFFF",
						fillOpacity: 0.90
					}
				},
				{
					field: "Longitude",
					value: [45.37, 45.42],
					filter: "BETWEEN",
					init: {
						pointRadius: "25",
						strokeColor: "#000000",
						fillColor: "#222222",
						fillOpacity: 0.90
					}
				},
				{
					field: "Longitude",
					value: [45.42],
					filter: "GREATER_THAN",
					init: {
						pointRadius: "10",
						strokeColor: "#800080",
						fillColor: "#800080"
					}
				}],
				select: {
					pointRadius: "30",
					externalGraphic: "demo/icons/OverIcon.png",
					label: "Selected",
					fillOpacity: 0.90
				}
			}
			*/
		}
	]
};
