/*
 * @title WET-BOEW Geomap English config file
 * @overview Exemple d'un fichier de configuration français pour Géocarte
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */

/*
 * Les composantes individuelles seront substituées par les compasantes globales
 *
 * Les couche de superpositions seront ajoutés dans l'ordre où ils sont fournis
 * (c'est à dire la première couche sera ajouté en premier, puis la suivante
 * sur le dessus, et ainsi de suite).
 *
 * Prennez note, la carte de base peut être définie globalement dans le fichier settings.js.
 */
/*jshint unused:false*/
var wet_boew_geomap = {

	// OPTIONNEL: Géomap va fournir une carte de base par défaut si aucune carte de base n"est spécifié ici.
		/*basemap: {
		title: "WMS-Toporama",
		type: "wms",
		url: "http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en",
		version: "1.1.1",
		format: "image/jpeg",
		layers: "WMS-Toporama",
		mapOptions: {
			maxExtent: "-2650000.0, -900000.0, 3600000.0, 4630000.0",
			restrictedExtent: "-2750000.0, -1000000.0, 3700000.0, 4730000.0",
			maxResolution: "auto",
			projection: "EPSG:3978",
			units: "m",
			displayProjection: "EPSG:4269",
			aspectRatio: 0.8
		}
	},*/
	overlays: [
		{
			title: "WMS Demo",
			caption: " Ceci est un exemple de service WMS chargé à l’aide de Géomap.",
			type: "wms",
			url: "http://geo.weather.gc.ca/geomet/?Lang=F",
			visible: false,
			version: "1.1.1",
			format: "image/png",
			layers: "GDPS.ETA_PR",
			transparent: true,
			options: {
				opacity: 0.5,

				//legendGraphicUrl: "http://geo.weather.gc.ca/geomet/?Lang=E&LAYERS=GDPS.ETA_PR&VERSION=1.1.1&FORMAT=image%2Fpng&SERVICE=WMS&REQUEST=GetLegendGraphic&STYLE=PRECIPMM"
				legendHTML: "<small>GeoMet Precipitation (mm)</small>" +
						"<ul class='list-unstyled'>" +
						"<li><span style='background-color:#800000;display:inline-block;height:20px;width:20px'/> <small>100.0</small></li>" +
						"<li><span style='background-color:#FF0000;display:inline-block;height:20px;width:20px'/> <small>50.0</small></li>" +
						"<li><span style='background-color:#FF4500;display:inline-block;height:20px;width:20px'/> <small>25.0</small></li>" +
						"<li><span style='background-color:#FFA500;display:inline-block;height:20px;width:20px'/> <small>20.0</small></li>" +
						"<li><span style='background-color:#FFD700;display:inline-block;height:20px;width:20px'/> <small>15.0</small></li>" +
						"<li><span style='background-color:#E5E500;display:inline-block;height:20px;width:20px'/> <small>10.0</small></li>" +
						"<li><span style='background-color:#7FFF00;display:inline-block;height:20px;width:20px'/> <small>7.5</small></li>" +
						"<li><span style='background-color:#7FFFD4;display:inline-block;height:20px;width:20px'/> <small>5.0</small></li>" +
						"<li><span style='background-color:#00FFFF;display:inline-block;height:20px;width:20px'/> <small>2.5</small></li>" +
						"<li><span style='background-color:#87CEFA;display:inline-block;height:20px;width:20px'/> <small>1.0</small></li>" +
						"<li><span style='background-color:#1E90FF;display:inline-block;height:20px;width:20px'/> <small>0.5</small></li>" +
						"<li><span style='background-color:#0000CD;display:inline-block;height:20px;width:20px'/> <small>0.25</small></li>" +
						"<li><span style='background-color:#000080;display:inline-block;height:20px;width:20px'/> <small>0.10</small></li>" +
						"</ul>"
			}
		},
		{
			title: "KML Demo",
			caption: "Ceci est un exemple de fichier KML chargé localement par Géocarte.",
			type: "kml",
			url: "demo/sample_fr.kml",
			visible: false,
			datatable: true,
			tab: true,
			popups: true,
			attributes: {
				name: "Titre du produit",
				description: "Description"
			}
		},
		{
			title: "ATOM Demo",
			caption: "Ceci est un exemple de fil ATOM chargé localement par Géocarte.",
			type: "atom",
			url: "demo/sample_fr.atom",
			attributes: {
				title: "Titre",
				summary: "À propos de ce jeux de données"
			},
			visible: false,
			datatable: false,
			tab: true
		},
		{
			title: "GeoRSS Demo",
			caption: "Ceci est un exemple de fil GeoRSS chargé localement par Géocarte.",
			type: "georss",
			url: "demo/sample_fr.rss",
			attributes: {
				title: "Titre",
				description: "Description",
				link: "Pour plus d'information"
			},
			visible: false,
			datatable: false,
			tab: true
		},
		{
			title: "JSON (GeoGratis)",
			caption: "Ceci est un exemple d'un jeu de données JSON chargé à partir d'un site externe, dans ce cas-ci Géogratis.",
			type: "json",
			url: "http://geogratis.gc.ca/api/fr/nrcan-rncan/ess-sst",
			params: {
				alt: "json",
				q: "alluvial"
			},
			visible: false,
			datatable: false,
			tab: true,
			popups: true,
			root: "products",
			attributes: {
				title: "Titre",
				summary: "Résumé",
				author: "Autheur"
			}
		},
		{
			title: "GeoJSON (CartoDB)",
			caption: "Ceci est un exemple d'un jeu de données JSON chargé à partir d'un site externe, dans ce cas-ci les caméras de circulation de la ville d'Ottawa à partir du site Carto DB.",
			type: "geojson",
			url: "http://stephenott.cartodb.com/api/v2/sql",
			params: {
				format: "GeoJSON",
				q: "SELECT * FROM traffic_cameras LIMIT 25"
			},
			attributes: {
				location_desc: "Emplacement",
				longitude: "Latitude",
				latitude: "Longitude",
				updated_at: "Dernière mise à jour"
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

			// unique value style
			/*style: {
				type: "unique",
				field: "Emplacement",
				init: {
					"Albert & Booth": {
						pointRadius: "25",
						strokeWidth: "20",
						fillColor: "#800080"
					},
					"Baseline & Greenbank": {
						pointRadius:"25",
						strokeWidth: "10",
						fillColor: "#800080"
					}
				},
				select: {
					pointRadius: 30,
					externalGraphic: "demo/icons/trafficcamera.png",
					label: "${Emplacement}",
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
					label: "Selectionné",
					fillOpacity: 0.90
				}
			}
			*/
		}
	]
};
