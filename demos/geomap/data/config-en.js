/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/*
 * Example English configuration file for Geomap
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
var wet_boew_geomap = {
	// OPTIONAL: note that Geomap will provide a default basemap if not specified here.
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
			title: 'KML Demo EN',
			caption: 'This is a sample KML file loaded locally by Geomap.',
			type: 'kml',
			url: 'data/sample.kml',		
			visible: true,
			datatable: true,
			tab: true,
			attributes: {
				name: 'Product Title',
				description: 'Description'
			}
		},
		{
			title: 'ATOM Demo EN',
			caption: 'This is a sample ATOM feed loaded locally by Geomap.',
			type: 'atom',
			url: 'data/sample.atom',
			tab: true,
			attributes: {
				title: 'Title',
				summary: 'About this dataset'
			},
			visible: false
		},
		{
			title: 'GeoRSS Demo EN',
			caption: 'This is a sample GeoRSS feed loaded locally by Geomap.',
			type: 'georss',
			url: 'data/sample.rss',				
			attributes: {
				title: 'Title',
				description: 'Description',
				link: 'More Info'
			},
			visible: false,
			datable:false,
			tab: true
		},
		{
			title: 'JSON (GeoGratis) EN',
			caption: 'This is a sample dataset loaded from a remote JSON resource, in this case the GeoGratis API.',
			type: 'json',					
			url: 'http://geogratis.gc.ca/api/en/nrcan-rncan/ess-sst',
			params: {
				'alt': 'json',
				'q': 'alluvial'
			},
			visible: false,
			root: 'products',	
			tab: true,
			attributes: {
				title: 'Title',
				summary: 'Abstract',				
				author: 'Author'
			}
		},
		{
			title: 'GeoJSON (CartoDB) EN',
			caption: 'This is a sample dataset loaded from a remote GeoJSON resource, in this case traffic cameras in the city of Ottawa from the CartoDB API.',
			type: 'geojson',					
			url: 'http://stephenott.cartodb.com/api/v2/sql',
			params: {
				'format': 'GeoJSON',
				'q': 'SELECT * FROM traffic_cameras LIMIT 25'
			},
			attributes: {				
				location_desc: 'Location',
				longitude: 'Latitude',
				latitude: 'Longitude',				
				updated_at: 'Last updated'
			},
			visible: true,	
			zoom:  true,
			datatable: true,
			tab: true,		
			// default style			
			style: {
				type: 'symbol',
				init: { 'pointRadius': '15', 'externalGraphic': '../../demos/geomap/data/icons/trafficcamera.png', 'fillOpacity': 1.0 },
				select: { 'pointRadius': '15', 'externalGraphic': '../../demos/geomap/data/icons/trafficcamera_active.png', 'fillOpacity': 1.0 }
			}
			/*
			// unique value style
			style: {
				type: 'unique',
				field: 'Location',
				init: {'Bayshore & Richmond': {'pointRadius':'25', 'strokeWidth':'20', 'strokeColor': '#800080'},'Baseline & Greenbank': {'pointRadius':'25', 'strokeWidth':'10', 'fillColor': '#800080'}},
				select: {'pointRadius': 30, 'externalGraphic': '../../OverIcon.png', 'label': "${Location}", 'fillOpacity': 0.90}
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

