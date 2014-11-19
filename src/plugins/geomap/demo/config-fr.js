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
			caption: "Ceci est un exemple de fichier KML chargé localement par Géocarte.",
			type: "kml",
			url: "demo/proposed_roads.kml",
			visible: false,
			datatable: false,
			tab: true,
			popups: true,
			attributes: {
				RD_NAME: "RD_NAME",
				RD_SUFFIX: "RD_SUFFIX"
			},
			style: {
				init: {
					strokeWidth: 2,
					strokeColor: "#FF0000"
				}
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
					graphicWidth: 30,
					graphicHeight: 30,
					externalGraphic: "demo/trafficcamera_active.png",
					graphicOpacity: 1.0
				}
			}

			// unique value style
			/*style: {
				type: "unique",
				field: "Location",
				init: {
					"Bayshore & Richmond": {
						graphicName: "x",
						pointRadius: 8,
						strokeWidth: 1,
						fillColor: "red",
						fillOpacity: 0.9,
						strokeColor: "red"
					},
					"Baseline & Greenbank": {
						graphicName: "x",
						pointRadius: 8,
						fillOpacity: 0.9,
						strokeWidth: 1,
						fillColor: "green",
						strokeColor: "green"
					}
				},
				select: {
					pointRadius: 8,
					fillOpacity: 0.9,
					strokeWidth: 1,
					fillColor: "blue",
					strokeColor: "blue",
					label: "${Location}"
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
						graphicName: "triangle",
						pointRadius: "5",
						strokeColor: "green",
						fillColor: "green"
					}
				},
				{
					field: "Longitude",
					value: [45.37, 45.42],
					filter: "BETWEEN",
					init: {
						graphicName: "triangle",
						pointRadius: "10",
						strokeColor: "orange",
						fillColor: "orange"
					}
				},
				{
					field: "Longitude",
					value: [45.42],
					filter: "GREATER_THAN",
					init: {
						graphicName: "triangle",
						pointRadius: "15",
						strokeColor: "red",
						fillColor: "red"
					}
				}]
			}*/
		}
	]
};
