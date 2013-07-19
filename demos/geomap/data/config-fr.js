/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*
 * Exemple d'un fichier de configuration français pour Géocarte
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
var wet_boew_geomap = {
	// OPTIONNEL: Géomap va fournir une carte de base par défaut si aucune carte de base n'est spécifié ici.
	/*
	basemap : {
		title: 'CBMT',
		type: 'wms',
		url: 'http://geogratis.gc.ca/maps/CBMT',
		layers: 'CBMT',
		format: 'image/png',
		version: '1.1.1',
		options: { singleTile: false, ratio: 1.0, projection: 'EPSG:3978', fractionalZoom: true },
		mapOptions: {
			maxExtent: '-3000000.0, -800000.0, 4000000.0, 3900000.0',			
			maxResolution: 'auto',
			projection: 'EPSG:3978',
			restrictedExtent: '-3000000.0, -800000.0, 4000000.0, 3900000.0',
			units: 'm',
			displayProjection: 'EPSG:4269',
			numZoomLevels: 12
		}
	},
	*/	
	/*
	basemap : {
		title: 'WMS Demo',
		type: 'wms',	
		url: 'http://vmap0.tiles.osgeo.org/wms/vmap0',
		layers: 'basic'
	},
	*/	
	overlays : [		
		{
			title: 'KML Demo FR',
			caption: 'Ceci est un exemple de fichier KML chargé localement par Géocarte.',
			type: 'kml',
			url: 'data/sample_fr.kml',		
			visible: true,
			datatable: true,
			tab: true,
			popups: true,
			attributes: {
				name: 'Titre du produit',
				description: 'Description'
			}
		},
		{
			title: 'ATOM Demo FR',
			caption: 'Ceci est un exemple de fil ATOM chargé localement par Géocarte.',
			type: 'atom',
			url: 'data/sample_fr.atom',
			attributes: {
				title: 'Titre',
				summary: 'À propos de ce jeux de données'
			},
			visible: false,
			datatable: false,
			tab: true
		},
		{
			title: 'GeoRSS Demo FR',
			caption: 'Ceci est un exemple de fil GeoRSS chargé localement par Géocarte.',
			type: 'georss',
			url: 'data/sample_fr.rss',	
			attributes: {
				title: 'Titre',
				description: 'Description',
				link: 'Pour plus d\'information'
			},
			visible: false,
			datatable: false,
			tab: true
		},
		{
			title: 'JSON (GeoGratis) FR',
			caption: 'Ceci est un exemple d\'un jeu de données JSON chargé à partir d\'un site externe, dans ce cas-ci Géogratis.',
			type: 'json',					
			url: 'http://geogratis.gc.ca/api/fr/nrcan-rncan/ess-sst',
			params: {
				'alt': 'json',
				'q': 'alluvial'
			},
			visible: false,
			datatable: false,
			tab: true,
			popups: true,
			root: 'products',			
			attributes: {
				title: 'Titre',
				summary: 'Résumé',				
				author: 'Autheur'
			}
		},
		{
			title: 'GeoJSON (CartoDB) FR',
			caption: 'Ceci est un exemple d\'un jeu de données JSON chargé à partir d\'un site externe, dans ce cas-ci les caméras de circulation de la ville d\'Ottawa à partir du site Carto DB.',
			type: 'geojson',					
			url: 'http://stephenott.cartodb.com/api/v2/sql',
			params: {
				'format': 'GeoJSON',
				'q': 'SELECT * FROM traffic_cameras LIMIT 25'
			},
			attributes: {				
				location_desc: 'Emplacement',
				longitude: 'Latitude',
				latitude: 'Longitude',				
				updated_at: 'Dernière mise à jour'
			},
			visible: true,	
			zoom:  [true, {type: 'text'}],
			datatable: true,
			tab: true,		
			// default style			
			style: {
				type: 'symbol',
				init: {'graphicWidth': 30, 'graphicHeight': 30, 'externalGraphic': '../../demos/geomap/data/icons/trafficcamera.png', 'graphicOpacity': 1.0 },
				select: {'graphicWidth': 20, 'graphicHeight': 20, 'externalGraphic': '../../demos/geomap/data/icons/trafficcamera_active.png', 'graphicOpacity': 0.5 }
			}
			
			// unique value style
			/*style: {
				type: 'unique',
				field: 'Emplacement',
				init: {'Albert & Booth': {'pointRadius':'25', 'strokeWidth':'20', 'fillColor': '#800080'},'Baseline & Greenbank': {'pointRadius':'25', 'strokeWidth':'10', 'fillColor': '#800080'}},
				select: {'pointRadius': 30, 'externalGraphic': '../../demos/geomap/data/icons/trafficcamera.png', 'label': "${Emplacement}", 'fillOpacity': 0.90}
			}
			
			// rule style
			style: {
				type: 'rule',
				rule: [{
						field: 'Longitude',
						value: [45.36],
						filter: 'LESS_THAN',
						init: {'pointRadius': '15', 'strokeColor': '#800000','fillColor': '#FFFFFF', 'fillOpacity': 0.90}
				},
						{
						field: 'Longitude',
						value: [45.37, 45.42],
						filter: 'BETWEEN',
						init: {'pointRadius': '25', 'strokeColor': '#000000','fillColor': '#222222', 'fillOpacity': 0.90}
				},
						{
						field: 'Longitude',
						value: [45.42],
						filter: 'GREATER_THAN',
						init: {'pointRadius': '10', 'strokeColor': '#800080','fillColor': '#800080'}
				}],
				select: {'pointRadius': '30', 'externalGraphic': '../../OverIcon.png', 'label': "Selected", 'fillOpacity': 0.90}
			}
			*/
		}	
	]
};
