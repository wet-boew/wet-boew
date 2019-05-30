
/*
 * @title WET-BOEW Geomap
 * @overview Displays a dynamic map over which information from additional sources can be overlaid.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
/*global wet_boew_geomap: false, ol: false, proj4: false*/
( function( $, window, document, wb ) {
"use strict";

var componentName = "wb-geomap",
	selector = "." + componentName,
	$document = wb.doc,
	colourIndex = 0,
	mapArray = [],
	mobile = false,
	i18n, i18nText, tooltip,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		overlays: [],
		tables: [],
		useScaleLine: false,
		useMousePosition: false,
		useLegend: false,
		useMapControls: true,
		useGeocoder: false,
		useGeolocation: false,
		useAOI: false
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		var elm = event.target,
			className = elm.className.split( /\s+/ ),
			settings = {},
			$elm, overrides;

		if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) ) {
			mobile = true;
		}

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			$elm = $( elm );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					add: i18n( "add" ),
					close: i18n( "close" ),
					colon: i18n( "colon" ),
					err: i18n( "err" ),
					hiddenLayer: i18n( "geo-hdnlyr" ),
					toggleLayer: i18n( "geo-tgllyr" ),
					labelSelect: i18n( "geo-lblsel" ),
					select: i18n( "geo-sel" ),
					zoomFeature: i18n( "geo-zmfeat" ),
					zoomin: i18n( "geo-zmin" ),
					zoomout: i18n( "geo-zmout" ),
					zoomworld: i18n( "geo-zmwrld" ),
					baseMapTitle: i18n( "geo-bmapttl" ),
					baseMapURL: i18n( "geo-bmap-url" ),
					baseMapMatrixSet: i18n( "geo-bmap-matrix-set" ),
					scaleline: i18n( "geo-sclln" ),
					mouseposition: i18n( "geo-msepos" ),
					access: i18n( "geo-ally" ),
					accessTitle: i18n( "geo-allyttl" ),
					attribLink: i18n( "geo-attrlnk" ),
					attribTitle: i18n( "geo-attrttl" ),
					ariaMap: i18n( "geo-ariamap" ),
					geoLocationURL: i18n( "geo-locurl-geogratis" ),
					geoCoderPlaceholder: i18n( "geo-loc-placeholder" ),
					geoCoderLabel: i18n( "geo-loc-label" ),
					aoiNorth: i18n( "geo-aoi-north" ),
					aoiEast: i18n( "geo-aoi-east" ),
					aoiSouth: i18n( "geo-aoi-south" ),
					aoiWest: i18n( "geo-aoi-west" ),
					aoiInstructions: i18n( "geo-aoi-instructions" ),
					aoiTitle: i18n( "geo-aoi-title" ),
					aoiBtnDraw: i18n( "geo-aoi-btndraw" ),
					aoiBtnClear: i18n( "geo-aoi-btnclear" ),
					aoiBtnClose: i18n( "close" ),
					geolocBtn: i18n( "geo-geoloc-btn" ),
					geolocFail: i18n( "geo-geoloc-fail" ),
					geolocUncapable: i18n( "geo-geoloc-uncapable" ),
					geoLgndGrphc: i18n( "geo-lgnd-grphc" ),
					dismiss: i18n( "dismiss" )
				};
			}

			// Class-based overrides - use undefined where no override should occur
			overrides = {
				useScaleLine: className.indexOf( "scaleline" ) !== -1 ? true : undefined,
				useMousePosition: className.indexOf( "position" ) !== -1 ? true : undefined,
				useLegend: className.indexOf( "legend" ) !== -1,
				useMapControls: className.indexOf( "static" ) !== -1 ? false : true,
				useGeocoder: className.indexOf( "geocoder" ) !== -1 ? true : false,
				useGeolocation: className.indexOf( "geolocation" ) !== -1 ? true : false,
				useAOI: className.indexOf( "aoi" ) !== -1 ? true : false,
				useAOIOpen: className.indexOf( "aoi-open" ) !== -1 ? true : false
			};

			// Merge default settings with overrides from the selected plugin element.
			$.extend( settings, defaults, overrides, wb.getData( $elm, componentName ) );

			// Load configuration file
			if ( settings.layersFile ) {

				$.ajax( {
					url: settings.layersFile,
					async: true,
					dataType: "script",
					success: function() {

						// Extend settings with data loaded from the
						// configuration file (through wet_boew_geomap)
						settings = $.extend( settings, wet_boew_geomap );

						// Support OSM basemap as defined prior v4.0.30, to be removed in v5.0
						// Check if the basemap type is defined to xyz, if so change it to osm
						if ( settings && settings.basemap && settings.basemap.type && settings.basemap.type === "xyz" ) {
							settings.basemap.type = "osm";
						}

						// Create Geomap Object and add to map array
						elm.geomap = new Geomap( { target: $elm, settings: settings } );
						mapArray.push( elm.geomap );

					}
				} );

			} else {

				// Create Geomap Object and add to map array
				elm.geomap = new Geomap( { target: $elm, settings: settings } );
				mapArray.push( elm.geomap );
			}

		}

		// Provide for easy access to OpenLayers olMap object
		wb.getMap = function( id ) {
			return getMapById( id );
		};

		//Provide for easy access to OpenLayers olLayer object
		wb.getLayer = function( map, id ) {
			return getLayerById( map, id );
		};

	},

	/**
	 * Geomap Object
	 */
	Geomap = function( options ) {

		var $elm = options.target,
			viewOptions = {};

		this.id = $elm.attr( "id" );
		this.mapLayers = [];
		this.layerDiv = $elm.find( ".wb-geomap-layers" ).attr( "id", "geomap-layers-" + this.id );
		this.legendDiv = $elm.find( ".wb-geomap-legend" ).attr( "id", "geomap-legend-" + this.id );
		this.mapDiv = $elm.find( ".wb-geomap-map" ).attr( "id", "geomap-map-" + this.id );
		this.settings = options.settings;
		this.settings.aspectRatio = ( this.settings.basemap &&
				this.settings.basemap.mapOptions &&
					this.settings.basemap.mapOptions.aspectRatio !== undefined ) ?
						this.settings.basemap.mapOptions.aspectRatio : 0.8;

		this.map = createOLMap( this );
		this.legend = new MapLegend( this );

		// Add basemap data
		viewOptions = this.addBasemap();

		// The map view is set from the basedata
		this.map.setView( new ol.View( viewOptions ) );

		// Add map layers
		this.addMapLayers();

		// If an extent was configured, fit the map to it
		if ( viewOptions.extent ) {
			this.map.getView().fit( viewOptions.extent, this.map.getSize() );
		}

		// Get layer(s) by name
		// Build a layer object containing features with "OL2 friendly" properties
		// (( To be removed on next major version ))
		var mapLayersCached = this.mapLayers;
		this.map.getLayersByName = function( layerName ) {
			var i, i_lyr,
				i_len = mapLayersCached.length,
				feature = {
					popup: {
						visible: function() {
							return true;
						}
					},
					geometry: {
						bounds: ol.proj.transform( this.getOverlays().getArray()[ 0 ].getPosition(), "EPSG:3978", "EPSG:4326" )
					}
				};

			for ( i = 0; i !== i_len; i += 1 ) {
				i_lyr = mapLayersCached[ i ];
				if ( i_lyr.id && i_lyr.id === layerName ) {
					return [ { features: [ feature ] } ];
				}
			}
		};

		// Load Controls
		this.loadControls();

		// Set the title and aria-label text
		this.accessibilize();

		// Add the popup
		this.createPopup();

		// Do some housekeeping once map is ready
		$document.on( "wb-ready.wb-geomap", "#" + this.id, function() {

			// Remove the loader
			$( "#" + this.id ).find( ".geomap-progress" ).remove();

		} );

	}, // End Geomap Object

	/**
	 * MapLayer Object
	 *
	 * @param Object {Geomap}
	 * @param Object {options} MapLayer options
	 * @return Object {MapLayer}
	 */
	MapLayer = function( map, options ) {

		var _this = this,
			visibilytyCallBackArr = [];

		this.map = map;
		this.settings = options;
		this.id = this.settings.tableId ? this.settings.tableId : generateGuid();
		this.layer = this.createOLLayer();
		this.settings.accessible = ( typeof this.settings.accessible === "undefined" ) ? true : this.settings.accessible;
		this.settings.visible = ( typeof this.settings.visible === "undefined" ) ? true : this.settings.visible;
		this.settings.zoom = typeof this.settings.zoom === "undefined" ? true : this.settings.zoom;

		// Add a section to hold the data table
		if ( this.settings.accessible ) {
			this.map.layerDiv.append( "<div class='panel panel-default'><div class='panel-heading'><div class='panel-title' role='heading'>" +
					this.settings.title + "</div></div><div class='panel-body'><div data-layer='" +
					this.id + "' class='geomap-table-wrapper' style='display:none;'></div></div></div>" );
		}

		// Make isVisibile Reactive
		Object.defineProperty( _this, "isVisible", {
			get: function get() {
				return _this.visibilityState;
			},
			set: function set( newVal ) {
				_this.visibilityState = newVal;

				// Notify
				visibilytyCallBackArr.forEach( function( signalHandler ) {

					return signalHandler( newVal );
				} );
			}
		} );

		// Skip if layer is null
		if ( !_this.layer ) {
			return null;
		}

		// Allow the properties to be observed
		this.observeVisibility = function( callback ) {
			visibilytyCallBackArr.push( callback );
		};

		this.observeVisibility( function( vis ) {

			var $table = $( "div[ data-layer='" + _this.id + "' ].geomap-table-wrapper" );

			if ( !vis ) {
				$table.fadeOut();
				$table.parent().append( "<div class='layer-msg'><p>" + i18nText.hiddenLayer + "</p></div>" ).fadeIn();
			} else {
				$table.fadeIn();
				$table.parent().find( ".layer-msg" ).remove();
			}

			_this.layer.setVisible( _this.isVisible );
		} );


		// Add to legend if legend is configured
		if ( this.map.legendDiv.length !== 0 ) {
			this.addToLegend();
		}

		this.isVisible = this.settings.visible;

		return this;
	},

	/**
	 * MapLegend Object
	 *
	 * @param {Geomap}
	 * @return {MapLegend}
	 */
	MapLegend = function( map ) {

		this.map = map;
		this.symbolMapArray = [];
		this.target = $( "#" + map.id + ".wb-geomap" ).find( ".wb-geomap-legend" );
		this.target.attr( "id", "geomap-legend-" + map.id );

		// remove the placehoders
		this.target.empty();

		return this;
	},

	/**
	 * Get ol.interaction.Interaction
	 */
	getMapInteraction = function( map, interactionType ) {
		var intrctn;
		map.getInteractions().forEach( function( interaction ) {
			if ( interaction instanceof interactionType ) {
				intrctn = interaction;
			}
		} );
		return intrctn;
	},

	setRendererDimensions = function( id, map, feature, symbolWidth, symbolHeight ) {

		var gb = feature.getGeometry().getExtent(),
			gw = ol.extent.getWidth( gb ),
			gh = ol.extent.getHeight( gb ),
			el = $( "#" + id ),
			bhalfw, bhalfh, bounds, center, resolution, height, width;

		/*
		 * Determine resolution based on the following rules:
		 * 1) always use value specified in config
		 * 2) if not specified, use max res based on width or height of element
		 * 3) if no width or height, assume a resolution of 1
		 */
		resolution = 1;
		if ( !resolution ) {
			resolution = Math.max(
					gw / symbolWidth || 0,
					gh / symbolHeight || 0
			) || 1;
		}
		map.setView( new ol.View( {
			minResolution: resolution,
			maxResolution: resolution,
			projection: new ol.proj.Projection( {
				code: "",
				units: "pixels"
			} )
		} ) );

		// determine height and width of element
		width = Math.max( symbolWidth, gw / resolution );
		height = Math.max( symbolHeight, gh / resolution );

		// determine bounds of renderer
		center = ol.extent.getCenter( gb );
		bhalfw = width * resolution / 2;
		bhalfh = height * resolution / 2;
		bounds = [ center[ 0 ] - bhalfw, center[ 1 ] - bhalfh, center[ 0 ] + bhalfw, center[ 1 ] + bhalfh ];
		el.width( Math.round( width ) );
		el.height( Math.round( height ) );

		map.updateSize();
		map.getView().fit( bounds, map.getSize() );

	},

	defaultColors = function() {

		var fill = hexToRGB( wb.drawColours[ colourIndex ], 0.5 ),
			stroke = hexToRGB( wb.drawColours[ colourIndex ], 1.0 ),
			colors = { fill: fill, stroke: stroke, transparent: [ 0, 0, 0, 0 ] };

		// Increment the colour index
		colourIndex += 1;
		if ( colourIndex === wb.drawColours.length ) {
			colourIndex = 0;
		}

		return colors;
	},

	StyleFactory = function() {

		var colors = defaultColors(),
			externalGraphic, graphicHeight, graphicWidth, graphicName, style, styleType,
			fillColor, opacity, radius, strokeColor, strokeDash, strokeWidth;

		this.createStyleFunction = function( theStyle, featureType ) {
			style = theStyle;
			featureType = featureType;
			styleType = style && style.type ? style.type : "default";

			// called on each feature
			return function( feature ) {

				if ( styleType === "rule" ) {

					return new RuleStyle( feature, featureType );

				} else if ( styleType === "symbol" ) {

					return new SymbolStyle();

				} else if ( styleType === "default" ) {

					return new DefaultStyle( feature, featureType );

				} else if ( styleType === "unique" ) {

					return new UniqueStyle( feature, featureType );

				} else if ( styleType === "select" ) {

					return new SelectStyle( feature, featureType );

				}

			};

		};

		var RuleStyle = function( feature ) {

			var styleRule = style.rule,
				len = styleRule.length,
				operators = {
					"EQUAL_TO": function( a, b ) {
						return String( a ) === String( b[ 0 ] );
					},
					"GREATER_THAN": function( a, b ) {
						return a > b[ 0 ];
					},
					"LESS_THAN": function( a, b ) {
						return a < b[ 0 ];
					},
					"BETWEEN": function( a, b ) {
						return a >= b[ 0 ] && a <= b[ 1 ];
					}
				},
				featureType = feature && feature.getGeometry() ? feature.getGeometry().getType() : "Polygon",
				rule, ruleFilter;

			for ( var i = 0; i !== len; i += 1 ) {

				// Set the filter
				rule = styleRule[ i ];
				ruleFilter = rule.filter;

				// Set the style elements
				strokeDash = rule.init.strokeDash ? rule.init.strokeDash : [ 1, 0 ];
				strokeWidth = rule.init.strokeWidth ? rule.init.strokeWidth : 1.0;
				opacity = rule.init.fillOpacity ? rule.init.fillOpacity : rule.init.graphicOpacity ? rule.init.graphicOpacity : 0.5;
				radius = rule.init.pointRadius ? rule.init.pointRadius : 5;
				strokeColor = rule.init.strokeColor ? hexToRGB( rule.init.strokeColor, opacity ) : colors.transparent;
				fillColor = hexToRGB( rule.init.fillColor, opacity );
				graphicName = rule.init.graphicName ? rule.init.graphicName : null;
				externalGraphic = rule.init.externalGraphic ? rule.init.externalGraphic : null;
				graphicHeight = rule.init.graphicHeight ? rule.init.graphicHeight : 25;
				graphicWidth = rule.init.graphicWidth ? rule.init.graphicWidth : 25;

				if ( operators[ ruleFilter ]( feature.attributes[ rule.field ], rule.value ) ) {
					switch ( featureType ) {
					case "Polygon" || "MultiPolygon":
						return getPolygonStyle( {
							fill: new ol.style.Fill( { color: fillColor } ),
							stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
						} );
					case "Point" || "MultiPoint":
						if ( graphicName ) {
							return getSymbolStyle( {
								symbol: graphicName,
								fill: new ol.style.Fill( { color: fillColor } ),
								stroke: new ol.style.Stroke( { color: strokeColor, lineDash: strokeDash } ),
								radius: radius
							} );
						} else if ( externalGraphic ) {
							return getIconStyle( {
								src: externalGraphic,
								opacity: opacity,
								size: [ graphicWidth, graphicHeight ]
							} );
						} else {
							return getPointStyle( {
								radius: radius,
								fill: new ol.style.Fill( { color: fillColor } ),
								stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
							} );
						}
					case "LineString" || "MultiLineString":
						return getLineStyle( {
							stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
						} );
					default:
						return getPolygonStyle( {
							fill: new ol.style.Fill( { color: fillColor } ),
							stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
						} );
					}

				}
			}

		};

		var SymbolStyle = function() {

			// Set the style elements
			opacity = style.init.fillOpacity ? style.init.fillOpacity : style.init.graphicOpacity ? style.init.graphicOpacity : 1.0;
			radius = style.init.pointRadius ? style.init.pointRadius : 5;
			strokeColor = style.init.strokeColor ? hexToRGB( style.init.strokeColor, opacity ) : colors.transparent;
			fillColor = hexToRGB( style.init.fillColor, opacity );
			graphicName = style.init.graphicName ? style.init.graphicName : null;
			externalGraphic = style.init.externalGraphic ? style.init.externalGraphic : null;
			graphicHeight = style.init.graphicHeight ? style.init.graphicHeight : 25;
			graphicWidth = style.init.graphicWidth ? style.init.graphicWidth : 25;

			if ( graphicName ) {
				return getSymbolStyle( {
					symbol: style.init.graphicName,
					fill: new ol.style.Fill( { color: fillColor } ),
					stroke: new ol.style.Stroke( { color: strokeColor, lineDash: strokeDash } ),
					radius: radius
				} );
			} else if ( externalGraphic ) {
				return getIconStyle( {
					src: externalGraphic,
					opacity: opacity,
					size: [ graphicWidth, graphicHeight ]
				} );
			} else {
				return getPointStyle( {
					radius: radius,
					fill: new ol.style.Fill( { color: fillColor } ),
					stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth } )
				} );
			}

		};

		var DefaultStyle = function() {

			opacity = style.fillOpacity ? style.fillOpacity : style.graphicOpacity ? style.graphicOpacity : 1.0;
			fillColor = style.fillColor ? hexToRGB( style.fillColor, opacity ) : colors.transparent;
			strokeColor = style.strokeColor ? hexToRGB( style.strokeColor, opacity ) : colors.transparent;
			strokeWidth = style.strokeWidth ? style.strokeWidth : 1.0;
			strokeDash = style.strokeDash ? style.strokeDash : [ 1, 0 ];

			return [ new ol.style.Style( {
				image: new ol.style.Circle( {
					fill: new ol.style.Fill( { color: fillColor } ),
					stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } ),
					radius: 5
				} ),
				fill: new ol.style.Fill( { color: fillColor } ),
				stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
			} ) ];

		};

		var UniqueStyle = function( feature, featureType ) {

			var field = style.field,
				obj, objStyle;

			for ( obj in style.init ) {
				objStyle = style.init[ obj ];

				strokeDash = objStyle.strokeDash ? objStyle.strokeDash : [ 1, 0 ];
				strokeWidth = objStyle.strokeWidth ? objStyle.strokeWidth : 1.0;
				opacity = objStyle.fillOpacity ? objStyle.fillOpacity : objStyle.graphicOpacity ? objStyle.graphicOpacity : 0.5;
				radius = objStyle.pointRadius ? objStyle.pointRadius : 5;
				strokeColor = objStyle.strokeColor ? hexToRGB( objStyle.strokeColor, opacity ) : colors.transparent;
				fillColor = objStyle.fillColor ? hexToRGB( objStyle.fillColor, opacity ) : null;
				name = objStyle.name ? objStyle.name : null;
				graphicHeight = objStyle.graphicHeight ? objStyle.graphicHeight : 25;
				externalGraphic = objStyle.externalGraphic;
				graphicWidth = objStyle.graphicWidth ? objStyle.graphicWidth : 25;

				switch ( featureType ) {
				case "Polygon" || "MultiPolygon":
					if ( feature.attributes && feature.attributes[ field ] === obj ) {
						return getPolygonStyle( {
							fill: new ol.style.Fill( { color: fillColor } ),
							stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
						} );
					}
					break;
				case "Point" || "MultiPoint":
					if ( externalGraphic ) {
						if ( feature.attributes && feature.attributes[ field ] === obj ) {
							return getIconStyle( {
								src: externalGraphic,
								opacity: opacity,
								size: [ graphicWidth, graphicHeight ]
							} );
						}
					} else {
						if ( feature.attributes && feature.attributes[ field ] === obj ) {
							return getPointStyle( {
								radius: radius,
								fill: new ol.style.Fill( { color: fillColor } ),
								stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
							} );
						}
					}
					break;
				case "LineString" || "MultiLineString":
					if ( feature.attributes && feature.attributes[ field ] === obj ) {
						return getLineStyle( {
							stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
						} );
					}
					break;
				default:
					if ( feature.attributes && feature.attributes[ field ] === obj ) {
						return getPolygonStyle( {
							fill: new ol.style.Fill( { color: fillColor } ),
							stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
						} );
					}
					break;
				}

			}

		};

		var SelectStyle = function( feature, featureType ) {

			strokeDash = style.strokeDash ? style.strokeDash : [ 1, 0 ];
			strokeWidth = style.strokeWidth ? style.strokeWidth : 1.0;
			opacity = style.fillOpacity ? style.fillOpacity : style.graphicOpacity ? style.graphicOpacity : 0.5;
			radius = style.pointRadius ? style.pointRadius : 5;
			strokeColor = style.strokeColor ? hexToRGB( style.strokeColor, opacity ) : colors.transparent;
			fillColor = style.fillColor ? hexToRGB( style.fillColor, opacity ) : null;
			name = style.name ? style.name : null;
			graphicHeight = style.graphicHeight ? style.graphicHeight : 25;
			externalGraphic = style.externalGraphic;
			graphicWidth = style.graphicWidth ? style.graphicWidth : 25;

			switch ( featureType ) {
			case "Polygon" || "MultiPolygon":
				return getPolygonStyle( {
					fill: new ol.style.Fill( { color: fillColor } ),
					stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
				} );
			case "Point" || "MultiPoint":
				if ( externalGraphic ) {
					return getIconStyle( {
						src: externalGraphic,
						opacity: opacity,
						size: [ graphicWidth, graphicHeight ]
					} );
				} else {
					return getPointStyle( {
						radius: radius,
						fill: new ol.style.Fill( { color: fillColor } ),
						stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
					} );
				}

			case "LineString" || "MultiLineString":
				return getLineStyle( {
					stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
				} );

			default:
				return getPolygonStyle( {
					fill: new ol.style.Fill( { color: fillColor } ),
					stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
				} );
			}

		};

	},

	/**
	 * Symbol Style
	 * @param symbolizer { obj } - style attributes
	 */

	//TODO: add stroke width
	getSymbolStyle = function( symbolizer ) {

		var symbols = {
			"square": [ new ol.style.Style( {
				image: new ol.style.RegularShape( {
					fill: symbolizer.fill,
					stroke: symbolizer.stroke,
					points: 4,
					radius: symbolizer.radius,
					angle: Math.PI / 4
				} )
			} ) ],
			"triangle": [ new ol.style.Style( {
				image: new ol.style.RegularShape( {
					fill: symbolizer.fill,
					stroke: symbolizer.stroke,
					points: 3,
					radius: symbolizer.radius,
					rotation: Math.PI / 4,
					angle: 0
				} )
			} ) ],
			"star": [ new ol.style.Style( {
				image: new ol.style.RegularShape( {
					fill: symbolizer.fill,
					stroke: symbolizer.stroke,
					points: 5,
					radius: symbolizer.radius,
					radius2: symbolizer.radius * 0.4,
					angle: 0
				} )
			} ) ],
			"cross": [ new ol.style.Style( {
				image: new ol.style.RegularShape( {
					fill: symbolizer.fill,
					stroke: symbolizer.stroke,
					points: 4,
					radius: symbolizer.radius,
					radius2: 0,
					angle: 0
				} )
			} ) ],
			"x": [ new ol.style.Style( {
				image: new ol.style.RegularShape( {
					fill: symbolizer.fill,
					stroke: symbolizer.stroke,
					points: 4,
					radius: symbolizer.radius,
					radius2: 0,
					angle: Math.PI / 4
				} )
			} ) ]
		};

		return symbols[ symbolizer.symbol ];
	},

	/**
	 * Icon Style
	 * @param symbolizer { obj } - style attributes
	 */
	getIconStyle = function( symbolizer ) {

		return [ new ol.style.Style( {
			image: new ol.style.Icon( ( {
				opacity: symbolizer.opacity,
				src: symbolizer.src,
				size: symbolizer.size
			} ) )
		} ) ];

	},

	/**
	 * Point Style
	 * @param symbolizer { obj } - style attributes
	 */
	getPointStyle = function( symbolizer ) {

		return [ new ol.style.Style( {
			image: new ol.style.Circle( ( {
				radius: symbolizer.radius,
				fill: symbolizer.fill,
				stroke: symbolizer.stroke
			} ) )
		} ) ];

	},

	/**
	 * Polygon Style
	 * @param symbolizer { obj } - style attributes
	 */
	getPolygonStyle = function( symbolizer ) {
		return [ new ol.style.Style( {
			fill: symbolizer.fill,
			stroke: symbolizer.stroke
		} ) ];
	},

	/**
	 * Line Style
	 * @param symbolizer { obj } - style attributes
	 */
	getLineStyle = function( symbolizer ) {
		return [ new ol.style.Style( {
			stroke: symbolizer.stroke
		} ) ];
	},

	// Convert a hexidecimal color string to 0..255 R,G,B for backwards compatibility
	hexToRGB = function( code, alpha ) {

		var hex = ( code + "" ).trim(),
			rgb = null,
			match = hex.match( /^#?(([0-9a-zA-Z]{3}){1,3})$/ ),
			a = alpha ? alpha : 1.0;

		if ( !match ) {
			return code;
		}

		hex = match[ 1 ];

		if ( hex.length === 6 ) {
			rgb = [ parseInt( hex.substring( 0, 2 ), 16 ), parseInt( hex.substring( 2, 4 ), 16 ), parseInt( hex.substring( 4, 6 ), 16 ), a ];
		} else if ( hex.length === 3 ) {
			rgb = [ parseInt( hex.substring( 0, 1 ) + hex.substring( 0, 1 ), 16 ), parseInt( hex.substring( 1, 2 ) + hex.substring( 1, 2 ), 16 ), parseInt( hex.substring( 2, 3 ) + hex.substring( 2, 3 ), 16 ), a ];
		}

		return rgb;
	},

	/**
	 * Add the checkbox to the column
	 *
	 */
	addChkBox = function( mapLayer, feature ) {

		return "<td><label class='wb-inv' for='cb_" + feature.getId() + "'>" +
					i18nText.labelSelect + "</label><input type='checkbox' id='cb_" +
					feature.getId() + "' class='geomap-cbx' data-map='" + mapLayer.map.id +
					"' data-layer='" + feature.layerId + "' data-feature='" +
					feature.getId() + "' /></td>";
	},

	/**
	 * Add zoom button to table columns
	 */
	addZoomTo = function( mapLayer, feature ) {
		return "<td class='text-right'><a href='javascript:;' data-map='" + mapLayer.map.id +
			"' data-layer='" + feature.layerId + "' data-feature='" + feature.getId() +
			"' class='btn btn-link geomap-zoomto' alt='" + i18nText.zoomFeature + "' role='button'><span class='glyphicon glyphicon-zoom-in'></span></a></td>";
	},

	/**
	 * Show popup
	 */
	showPopup = function( evt, feature, map ) {

		if ( !feature ) {
			return;
		}

		var overlay = map.getOverlays().getArray()[ 0 ],
			$popup = $( document.getElementById( "popup-geomap-map-" + map.id ) ),
			content = "",
			layer = getLayerById( map, feature.layerId );

		if ( feature && feature.attributes ) {
			var geometry = feature.getGeometry(),
				coord = geometry.getType() === "Point" ? geometry.getCoordinates() : event.mapBrowserEvent.coordinate,
				obj = feature.attributes,
				key, regex;

			if ( layer.popupsInfo ) {

				content += layer.popupsInfo.content;

				for ( key in obj ) {
					if ( obj.hasOwnProperty( key ) ) {
						regex = new RegExp( "_" + key, "igm" );
						content = content.replace( regex, obj[ key ] );
					}
				}

			} else {

				for ( key in obj ) {
					if ( obj.hasOwnProperty( key ) ) {
						content += "<tr><th><strong>" + key + "</strong></th><td> " + obj[ key ] + "</td></tr>";
					}
				}

			}

			$popup.find( ".popup-content" ).html( "<h5>" + feature.layerTitle + "</h5><table style='width:100%;'>" + content + "</table>" );
			overlay.setPosition( coord );

		} else {
			overlay.setPosition( undefined );
		}

	},

	/**
	 * Parse layer configuration keys
	 */
	getLayerKeys = function( obj ) {
		var key, keys = {};
		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				if ( key !== "type" && key !== "caption" && key !== "url" && key !== "title" ) {
					keys[ key ] = obj[ key ];
				}
			}
		}
		return keys;
	},

	/**
	 * Remove key
	 */
	removeKeys = function( obj, k ) {
		var key, keys = {};
		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				if ( $.inArray( key, k ) < 0 ) {
					keys[ key ] = obj[ key ];
				}
			}
		}
		return keys;
	},

	/*
	 * Remove null keys
	 */
	removeNullKeys = function( obj ) {
		var key, keys = {};
		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				if ( obj[ key ] !== null ) {
					keys[ key ] = obj[ key ];
				}
			}
		}
		return keys;
	},

	/**
	 * Create map
	 *
	 * @return {ol.map} an OpenLayers map.
	 */
	createOLMap = function( geomap ) {

		var controls = geomap.settings.useMapControls ? ol.control.defaults( {
				attributionOptions: ( {
					collapsible: false
				} )
			} ) : [],
			interactions = geomap.settings.useMapControls ? ol.interaction.defaults( {
				mouseWheelZoom: true
			} ) : [],
			intrctn;

		// Add projection for default base map
		proj4.defs( "EPSG:3978", "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs" );

		// Add projection alias
		proj4.defs( "urn:ogc:def:crs:OGC:1.3:CRS84", proj4.defs( "EPSG:4326" ) );

		// Create the OpenLayers Map Object
		var map = new ol.Map( {
			controls: controls,
			interactions: interactions,
			logo: false,
			target: geomap.mapDiv.attr( "id" )
		} );

		intrctn = getMapInteraction( map, ol.interaction.MouseWheelZoom );

		// Disable the mouseWheelZoom until the user focuses on the map
		if ( geomap.settings.useMapControls && intrctn ) {
			intrctn.setActive( false );
		}

		geomap.mapDiv.height( geomap.mapDiv.width() * geomap.settings.aspectRatio );
		map.set( "aspectRatio", geomap.settings.aspectRatio );
		map.id = geomap.id;

		// Once the map is rendered fire ready event
		map.once( "postrender", function() {

			// v4.0.x transition function to support static map.
			// The following makes assumption the geometry only inlude a point and it is WKT format
			// The following should be removed in WET 5
			map.getLayer = function( strSelector ) {

				var geometryElm = document.querySelector( strSelector + " [data-geometry][data-type]" ),
					geometry = geometryElm.dataset.geometry,
					geometryType = geometryElm.dataset.type,
					latitudes, longitudes;

				// Provide support wkt with a POINT geometry, like the demo of the Static map with open layer 2
				if ( geometryType === "wkt" && geometry.indexOf( "POINT" ) !== -1 ) {
					geometry = geometry.replace( /,/, "" );
					geometry = geometry.substring( geometry.indexOf( "(" ) + 1,  geometry.indexOf( ")" ) );
					geometry = geometry.split( " " );

					latitudes = parseFloat( geometry[ 0 ] );
					longitudes = parseFloat( geometry[ 1 ] );

				}
				return {
					getDataExtent: function() {
						return [ latitudes, longitudes ];
					}
				};
			};

			map.zoomToExtent = function( layerCoordinates ) {
				map.getView().setCenter( ol.proj.transform( [ layerCoordinates[ 0 ], layerCoordinates[ 1 ] ], "EPSG:4326", "EPSG:3978" ) );
				map.getView().setZoom( 5 );
			};

			wb.ready( $( "#" + geomap.id ), componentName, [ map ] );
		} );

		// Everytime the map view is changed, fire the updated event
		map.on( "moveend", function() {
			$( geomap.id ).trigger( "wb-updated" + selector, [ geomap.map ] );
		} );

		geomap.mapDiv.append( "<div id='tooltip_" + geomap.id + "' style='display:none;'><span class='tooltip-txt'></span></div>" );

		var displayFeatureInfo = function( pixel ) {

			tooltip = $( "#tooltip_" + geomap.id );

			var tooltipTxt = $( "#tooltip_" + geomap.id + " span.tooltip-txt" ),
				feature;

			tooltip.css(  {
				left: pixel[ 0 ] + "px",
				top: ( pixel[ 1 ] - 15 ) + "px",
				position: "absolute"
			} );

			feature = map.forEachFeatureAtPixel( pixel, function( feature ) {
				return feature;
			} );

			if ( feature && feature.tooltip ) {
				tooltip.hide();
				tooltipTxt.html( feature.tooltip );
				tooltip.show();
			} else {
				tooltip.hide();
			}
		};

		map.on( "pointermove", function( event ) {

			tooltip = $( "#tooltip_" + geomap.id );

			if ( event.dragging ) {
				tooltip.hide();
				return;
			}
			displayFeatureInfo( map.getEventPixel( event.originalEvent ) );

			return;
		} );

		return map;

	},

	/**
	 * Get the OpenLayers map object by id
	 *
	 * @return {Geomap}
	 */
	getMapById = function( id ) {

		var mapArrayItem, len;

		for ( len = mapArray.length - 1; len !== -1; len -= 1 ) {
			mapArrayItem = mapArray[ len ];
			if ( mapArrayItem.id === id ) {
				return mapArrayItem;
			}
		}
		return;
	},

	/**
	 * Area of Interest (AOI) Widget
	 */
	AOIWidget = function( geomap ) {

		var interaction = new ol.interaction.DragBox(),
			projLatLon = new ol.proj.Projection( { code: "EPSG:4326" } ),
			projMap = geomap.map.getView().getProjection();

		// Handle the draw end event
		interaction.on( "boxend", function() {

			var extent = interaction.getGeometry().transform( projMap, projLatLon ).getExtent();

			geomProj = drawAOI( geomap, extent );

			// zoom to extent of feature
			geomap.map.getView().fit( geomProj.getGeometry().getExtent(), geomap.map.getSize() );

			$( "#geomap-aoi-minx-" + geomap.id ).val( extent[ 0 ] );
			$( "#geomap-aoi-maxx-" + geomap.id ).val( extent[ 2 ] );
			$( "#geomap-aoi-maxy-" + geomap.id ).val( extent[ 3 ] );
			$( "#geomap-aoi-miny-" + geomap.id ).val( extent[ 1 ] );

			$( "#geomap-aoi-extent-" + geomap.id ).val( geomProj.getGeometry().getExtent() ).trigger( "change" );
			$( "#geomap-aoi-extent-lonlat-" + geomap.id ).val( extent[ 0 ] + ", " + extent[ 1 ] + ", " + extent[ 2 ] + ", " + extent[ 3 ] ).trigger( "change" );

		} );

		// Clear selection when drawing a new box and when clicking on the map
		interaction.on( "boxstart", function() {
			getLayerById( geomap.map, "locLayer" ).getSource().clear( true );
		} );

		geomap.map.addInteraction( interaction );

		interaction.setActive( false );

		if ( geomap.settings.useAOIOpen ) {
			geomap.mapDiv.before( "<div class='geomap-aoi panel panel-default'><div id='geomap-aoi-" + geomap.id + "' class='panel-body'></div></div>" );
		} else {
			geomap.mapDiv.before( "<details class='geomap-aoi'><summary>" + i18nText.aoiTitle + "</summary><div id='geomap-aoi-" + geomap.id + "'></div></details>" );
		}

		var aoiDiv = $( "#geomap-aoi-" + geomap.id ),
			extent, left, bottom, right, top, geomProj;

		aoiDiv.append( "<fieldset id='form-aoi-" + geomap.id + "'>" +
				"<legend tabindex='-1'>" + i18nText.aoiInstructions + "</legend>" +
				"<div class='row'>" +
					"<div class='col-md-2 form-group'>" +
						"<label for='geomap-aoi-maxy-" + geomap.id + "' class='wb-inv'>" + i18nText.aoiNorth + "</label>" +
						"<div class='input-group input-group-sm'>" +
							"<span class='input-group-addon'>" + i18nText.aoiNorth.charAt( 0 ) + "</span>" +
							"<input type='number' id='geomap-aoi-maxy-" + geomap.id + "' placeholder='90' class='form-control input-sm' min='-90' max='90' step='0.000001'></input>" +
						"</div>" +
					"</div>" +
					"<div class='col-md-2 form-group'>" +
						"<label for='geomap-aoi-maxx-" + geomap.id + "' class='wb-inv'>" + i18nText.aoiEast + "</label>" +
						"<div class='input-group input-group-sm'>" +
							"<span class='input-group-addon'>" + i18nText.aoiEast.charAt( 0 ) + "</span>" +
							"<input type='number' id='geomap-aoi-maxx-" + geomap.id + "' placeholder='180' class='form-control input-sm' min='-180' max='180' step='0.000001'></input> " +
						"</div>" +
					"</div>" +
					"<div class='col-md-2 form-group'>" +
						"<label for='geomap-aoi-miny-" + geomap.id + "' class='wb-inv'>" + i18nText.aoiSouth + "</label>" +
						"<div class='input-group input-group-sm'>" +
							"<span class='input-group-addon'>" + i18nText.aoiSouth.charAt( 0 ) + "</span>" +
							"<input type='number' id='geomap-aoi-miny-" + geomap.id + "' placeholder='-90' class='form-control input-sm' min='-90' max='90' step='0.000001'></input> " +
						"</div>" +
					"</div>" +
					"<div class='col-md-2 form-group'>" +
						"<label for='geomap-aoi-minx-" + geomap.id + "' class='wb-inv'>" + i18nText.aoiWest + "</label>" +
						"<div class='input-group input-group-sm'>" +
							"<span class='input-group-addon'>" + i18nText.aoiWest.charAt( 0 ) + "</span>" +
							"<input type='number' id='geomap-aoi-minx-" + geomap.id + "' placeholder='-180' class='form-control input-sm' min='-180' max='180' step='0.000001'></input> " +
						"</div>" +
					"</div>" +
					"<div class='col-md-4'>" +
						"<button class='btn btn-default btn-sm' id='geomap-aoi-btn-draw-" + geomap.id + "'>" + i18nText.add + "</button> " +
						"<button class='btn btn-default btn-sm' id='geomap-aoi-btn-clear-" + geomap.id + "'>" + i18nText.aoiBtnClear + "</button> " +
					"</div>" +
				"</div>" +
				"<input type='hidden' id='geomap-aoi-extent-" + geomap.id + "'></input>" +
				"<input type='hidden' id='geomap-aoi-extent-lonlat-" + geomap.id + "'></input>" +
			"</fieldset>" );

		$( "#geomap-aoi-btn-clear-" + geomap.id ).after( "<button id='geomap-aoi-toggle-mode-draw-" + geomap.id +
				"' href='#' class='btn btn-sm btn-default geomap-geoloc-aoi-btn' title='" + i18nText.aoiBtnDraw +
				"'><i class='glyphicon glyphicon-edit'></i> " +
				i18nText.aoiBtnDraw + "</button>" );

		// toggle draw mode
		$document.on( "click", "#geomap-aoi-toggle-mode-draw-" + geomap.id, function( event ) {

			event.preventDefault();

			var drawInteraction = getMapInteraction( geomap.map, ol.interaction.DragBox ),
				selectInteraction = getMapInteraction( geomap.map, ol.interaction.Select ),
				active = interaction.getActive(),
				$aoiElm = $( "#geomap-aoi-" + geomap.id );

			$( this ).toggleClass( "active" );

			if ( !active ) {
				$aoiElm.find( "legend" ).trigger( "setfocus.wb" );
			}

			drawInteraction.setActive( !active );
			selectInteraction.setActive( active );

		} );

		// clear drawn features
		$document.on( "click", "#geomap-aoi-btn-clear-" + geomap.id, function( event ) {

			event.preventDefault();

			$( "#geomap-aoi-extent-" + geomap.id ).val( "" );
			$( "#geomap-aoi-extent-lonlat-" + geomap.id ).val( "" );
			$( "#geomap-aoi-minx-" + geomap.id ).val( "" ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-miny-" + geomap.id ).val( "" ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-maxx-" + geomap.id ).val( "" ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-maxy-" + geomap.id ).val( "" ).parent().removeClass( "has-error" );

			getLayerById( geomap.map, "locLayer" ).getSource().clear( true );

		} );

		// draw feature from input coordinates
		$document.on( "click", "#geomap-aoi-btn-draw-" + geomap.id, function( event ) {

			event.preventDefault();

			$( "#geomap-aoi-extent-" + geomap.id ).val( "" );
			$( "#geomap-aoi-extent-lonlat-" + geomap.id ).val( "" );
			$( "#geomap-aoi-minx-" + geomap.id ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-maxx-" + geomap.id ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-maxy-" + geomap.id ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-miny-" + geomap.id ).parent().removeClass( "has-error" );

			getLayerById( geomap.map, "locLayer" ).getSource().clear( true );

			var left = parseFloat( $( "#geomap-aoi-minx-" + geomap.id ).val() ),
				bottom = parseFloat( $( "#geomap-aoi-miny-" + geomap.id ).val() ),
				right = parseFloat( $( "#geomap-aoi-maxx-" + geomap.id ).val() ),
				top = parseFloat( $( "#geomap-aoi-maxy-" + geomap.id ).val() ),
				isValid = true,
				geomProj,
				extent;

			if ( !left || left < -180 || left > 180 ) {
				$( "#geomap-aoi-minx-" + geomap.id ).parent().addClass( "has-error" );
				isValid = false;
			}

			if ( !right || right < -180 || right > 180 ) {
				$( "#geomap-aoi-maxx-" + geomap.id ).parent().addClass( "has-error" );
				isValid = false;
			}

			if ( !top || top < -90 || top > 90 ) {
				$( "#geomap-aoi-maxy-" + geomap.id ).parent().addClass( "has-error" );
				isValid = false;
			}

			if ( !bottom || bottom < -90 || bottom > 90 ) {
				$( "#geomap-aoi-miny-" + geomap.id ).parent().addClass( "has-error" );
				isValid = false;
			}

			if ( isValid === false ) {
				return false;
			}

			extent = [ left, bottom, right, top ];

			geomProj = drawAOI( geomap, extent );

			// zoom to extent of feature
			geomap.map.getView().fit( geomProj.getGeometry().getExtent(), geomap.map.getSize() );

			$( "#geomap-aoi-extent-" + geomap.id ).val( geomProj.getGeometry().getExtent() ).trigger( "change" );
			$( "#geomap-aoi-extent-lonlat-" + geomap.id ).val( left + ", " + bottom + ", " + right + ", " + top ).trigger( "change" );

		} );

		// if a default AOI is provided add it to the map and zoom to it
		if ( geomap.aoiExtent ) {

			extent = geomap.aoiExtent.split( "," );
			left = extent[ 0 ].trim();
			bottom = extent[ 1 ].trim();
			right = extent[ 2 ].trim();
			top = extent[ 3 ].trim();
			geomProj = drawAOI( geomap, extent );

			// zoom to extent of feature
			geomap.map.getView().fit( geomProj.getGeometry().getExtent(), geomap.map.getSize() );

			$( "#geomap-aoi-minx-" + geomap.id ).val( left );
			$( "#geomap-aoi-maxx-" + geomap.id ).val( right );
			$( "#geomap-aoi-maxy-" + geomap.id ).val( top );
			$( "#geomap-aoi-miny-" + geomap.id ).val( bottom );
			$( "#geomap-aoi-extent-" + geomap.id ).val( geomProj.getBounds().toBBOX() );
			$( "#geomap-aoi-extent-lonlat-" + geomap.id ).val( left + ", " + bottom + ", " + right + ", " + top );

		}
	},

	//
	// Param:
	// - geomap = geomap Object
	// - extext = array with 4 point ( West, South, East, North)
	// - dontAddFeat = boolean (default:false) if true, no delimiter box would be added to the map
	//
	drawAOI = function( geomap, extent, dontAddFeat ) {

		var coords = [],
			dens, len, feat,
			projLatLon = new ol.proj.Projection( { code: "EPSG:4326" } ),
			projMap = geomap.map.getView().getProjection();

		dens = densifyBBox( parseFloat( extent[ 0 ] ), parseFloat( extent[ 1 ] ), parseFloat( extent[ 2 ] ), parseFloat( extent[ 3 ] ) );

		for ( len = dens.length - 1; len !== -1; len -= 1 ) {
			coords.push( [ dens[ len ].getCoordinates()[ 0 ], dens[ len ].getCoordinates()[ 1 ] ] );
		}

		feat = new ol.Feature( {
			geometry: new ol.geom.Polygon( [ coords ] ).transform( projLatLon, projMap )
		} );

		if ( !dontAddFeat ) {
			getLayerById( geomap.map, "locLayer" ).getSource().addFeature( feat );
		}

		return feat;

	},

	/**
	 * Help Control - displays navigation help popup
	 */
	HelpControl = function( geomap ) {

		var button = document.createElement( "button" ),
			element = document.createElement( "div" );

		button.innerHTML = "?";
		button.title = i18nText.accessTitle;

		button.addEventListener( "click", function() {

			var dialog = document.createElement( "div" ),
				header = document.createElement( "header" ),
				h3 = document.createElement( "h3" ),
				closeButton = document.createElement( "a" ),
				panel = document.createElement( "div" ),
				role = document.createAttribute( "role" ),
				title = document.createAttribute( "title" ),
				href = document.createAttribute( "href" );

			dialog.className = "panel panel-default geomap-help-dialog ol-control ";
			header.className = "panel-heading";

			h3.innerHTML = i18nText.accessTitle;
			h3.className = "panel-title";

			header.appendChild( h3 );

			title.value = i18nText.dismiss;
			closeButton.setAttributeNode( title );
			href.value = "#";
			closeButton.setAttributeNode( href );
			role.value = "button";
			closeButton.setAttributeNode( role );
			closeButton.innerHTML = "&#xd7;<span class='wb-inv'>" + i18nText.dismiss + "</span>";
			closeButton.className = "btn btn-link";

			dialog.appendChild( closeButton );

			panel.innerHTML = "<p>" + i18nText.access + "</p>";
			panel.className = "panel-body";

			dialog.appendChild( header );
			dialog.appendChild( panel );

			var myControl = new ol.control.Control( { element: dialog } );

			// Handle the close button event
			closeButton.addEventListener( "click", function( event ) {

				event.preventDefault();

				$( event.target ).closest( ".geomap-help-dialog" ).fadeOut( function() {
					geomap.map.removeControl( myControl );
				} );

			} );

			geomap.map.addControl( myControl );

		}, false );

		element.className = "geomap-help-btn ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element
		} );

		geomap.map.addControl( this );

	},

	/*
	 * Geocoder Widget - search for place names (e.g. cities/towns, addresses,
	 * streets, postal codes)
	 */
	GeocodeControl = function( geomap ) {

		var element = document.createElement( "div" ),
			setFocusEvent = "setfocus.wb",
			url = i18nText.geoLocationURL,
			mapObj = {
				"quebec": "<abbr title='Quebec'>QC</abbr>",
				"québec": "<abbr title='Québec'>QC</abbr>",
				"british columbia": "<abbr title='British Columbia'>BC</abbr>",
				"colombie-britannique": "<abbr title='Colombie-Britannique'>BC</abbr>",
				"alberta": "<abbr title='Alberta'>AB</abbr>",
				"saskatchewan": "<abbr title='Saskatchewan'>SK</abbr>",
				"manitoba": "<abbr title='Manitoba'>MB</abbr>",
				"ontario": "<abbr title='Ontario'>ON</abbr>",
				"newfoundland and labrador": "<abbr title='Newfoundland and Labrador'>NL</abbr>",
				"terre-neuve-et-labrador": "<abbr title='Terre-Neuve-et-Labrador'>NL</abbr>",
				"prince edward island": "<abbr title='Prince Edward Island'>PE</abbr>",
				"île-du-prince-édouard": "<abbr title='Île-du-prince-Édouard'>PE</abbr>",
				"nova scotia": "<abbr title='Nova Scotia'>NS</abbr>",
				"nouvelle-écosse": "<abbr title='Nouvelle-Écosse'>NS</abbr>",
				"new brunswick": "<abbr title='New Brunswick'>NB</abbr>",
				"nouveau-brunswick": "<abbr title='Nouveau-Brunswick'>NB</abbr>",
				"yukon": "<abbr title='Yukon'>YT</abbr>",
				"northwest territories": "<abbr title='Northwest Territories'>NT</abbr>",
				"territoires du nord-ouest": "<abbr title='Territoires du Nord-Ouest'>NT</abbr>",
				"nunavut": "<abbr title='Nunavut'>NU</abbr>"
			},
			iconObj = {
				"ca.gc.nrcan.geoloc.data.model.Street": "<span class='glyphicon glyphicon-road' aria-hidden='true'></span>",
				"ca.gc.nrcan.geoloc.data.model.Intersection": "<span class='glyphicon glyphicon-road' aria-hidden='true'></span>",
				"ca.gc.nrcan.geoloc.data.model.Geoname": "<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>",
				"ca.gc.nrcan.geoloc.data.model.PostalCode": "<span class='glyphicon glyphicon-envelope' aria-hidden='true'></span>",
				"ca.gc.nrcan.geoloc.data.model.NTS": "<span class='glyphicon glyphicon-globe' aria-hidden='true'></span>"
			},
			width, x;

		element.innerHTML =
			"<label for='wb-geomap-geocode-search-" + geomap.id + "' class='wb-inv'>" + i18nText.geoCoderLabel + "</label>" +
			"<input type='text' class='form-control' id='wb-geomap-geocode-search-" + geomap.id + "' placeholder='" + i18nText.geoCoderPlaceholder + "' ></input>" +
			"<div class='wb-geomap-geoloc-al-cnt'><ul role='listbox' id='wb-geomap-geoloc-al-" + geomap.id + "' class='wb-geomap-geoloc-al hide' aria-hidden='true' aria-live='polite'></ul></div>";

		element.className = "geomap-geoloc ol-unselectable ol-control";

		ol.control.Control.call( this, {
			element: element
		} );

		geomap.map.addControl( this );

		// Adds WAI-ARIA
		$( "#wb-geomap-geocode-search-" + geomap.id ).attr( "autocomplete", "off" );
		$( "#wb-geomap-geocode-search-" + geomap.id ).attr( "role", "textbox" );
		$( "#wb-geomap-geocode-search-" + geomap.id ).attr( "aria-haspopup", "true" );
		$( "#wb-geomap-geocode-search-" + geomap.id ).attr( "aria-autocomplete", "list" );
		$( "#wb-geomap-geocode-search-" + geomap.id ).attr( "aria-owns", "wb-geomap-geoloc-al-" + geomap.id );
		$( "#wb-geomap-geocode-search-" + geomap.id ).attr( "aria-activedescendent", "" );

		width = parseFloat( $( ".geomap-geoloc" ).parent().width() );
		x = width > 768 ? .6 : .8;

		if ( !mobile ) {
			$( ".geomap-geoloc" ).css( { "width": width * x } );
			$( ".wb-geomap-geoloc-al-cnt" ).css( { "width": width * x } );
		} else {
			$( ".geomap-geoloc" ).css( { "width": width - 10 + "px" } );
			$( ".wb-geomap-geoloc-al-cnt" ).css( { "width": width - 10 + "px" } );
		}

		function panZoomToFeature( bbox, ll ) {

			var bnds,
				coords = [],
				dens,
				feat,
				len,
				projLatLon = new ol.proj.Projection( { code: "EPSG:4326" } ),
				projMap = geomap.map.getView().getProjection(),
				zoom;

			getLayerById( geomap.map, "locLayer" ).getSource().clear( true );

			if ( bbox && typeof bbox !== "undefined" ) {

				bnds = bbox.split( "," );
				dens = densifyBBox( parseFloat( bnds[ 0 ] ), parseFloat( bnds[ 1 ] ), parseFloat( bnds[ 2 ] ), parseFloat( bnds[ 3 ] ) );

				for ( len = dens.length - 1; len !== -1; len -= 1 ) {
					coords.push( [ dens[ len ].getCoordinates()[ 0 ], dens[ len ].getCoordinates()[ 1 ] ] );
				}

				feat = new ol.Feature( {
					geometry: new ol.geom.Polygon( [ coords ] ).transform( projLatLon, projMap )
				} );

				getLayerById( geomap.map, "locLayer" ).getSource().addFeature( feat );

				// zoom to extent of feature
				geomap.map.getView().fit( feat.getGeometry().getExtent(), geomap.map.getSize() );

			} else if ( ll && typeof ll !== "undefined" ) {

				zoom = geomap.map.getView().getZoom() === 0 ? 12 : geomap.map.getView().getZoom();
				feat = new ol.Feature( {
					geometry: new ol.geom.Point( ll.split( "," ) ).transform( projLatLon, projMap )
				} );
				getLayerById( geomap.map, "locLayer" ).getSource().addFeature( feat );

				// zoom to feature
				geomap.map.getView().setZoom( zoom );
				geomap.map.getView().setCenter( feat.getGeometry().getCoordinates() );

			}

		}

		$document.on( "keydown", "#wb-geomap-geocode-search-" + geomap.id, function( event ) {

			// TODO: find another way to do this, maybe setting negative tabindex
			getMapInteraction( geomap.map, ol.interaction.KeyboardPan ).setActive( false );

			var which = event.which;

			if ( !( event.ctrlKey || event.metaKey ) ) {
				return keyboardHandlerInput( which, event );
			}

		} );

		/**
		 * Hides all the options
		 * @method closeOptions
		 * @param {DOM element} input The polyfilled input field
		 */
		function closeOptions( input ) {
			var autolist = input.nextSibling.firstChild;

			// TODO: find another way to do this, maybe setting negative tabindex
			getMapInteraction( geomap.map, ol.interaction.KeyboardPan ).setActive( true );

			autolist.className += " hide";
			autolist.innerHTML = "";
			autolist.setAttribute( "aria-hidden", "true" );
			input.setAttribute( "aria-expanded", "false" );
			input.setAttribute( "aria-activedescendent", "" );
		}

		/**
		 * Returns the available options based upon the input in the input field.
		 * @method showOptions
		 * @param {DOM element} input The input field
		 */
		function showOptions( input, value ) {

			var options = "",
				$input = $( "#wb-geomap-geocode-search-" + geomap.id ),
				$autolist = $( "#wb-geomap-geoloc-al-" + geomap.id ),
				abbrProv = function( str, mapObj ) {
					var re = new RegExp( Object.keys( mapObj ).join( "|" ), "gi" );
					return str.replace( re, function( matched ) {
						return mapObj[ matched.toLowerCase() ];
					} );
				};

			if ( !value || value.length < 3 ) {
				$autolist.empty();
			}

			$.ajax( {
				type: "GET",
				url: url,
				data: { q: value + "*" },
				success: function( data ) {

					if ( data.length > 0 ) {

						var len = data.length,
							icon = "",
							i, item, label, title, bnd, ll;

						for ( i = 0; i !== len; i += 1 ) {

							item = data[ i ];
							title = item.title
								.replace( /&/g, "&amp;" )
								.replace( /"/g, "&quot;" )
								.replace( /'/g, "&#39;" )
								.replace( /</g, "&lt;" )
								.replace( />/g, "&gt;" );
							bnd = item.bbox ? item.bbox[ 0 ] + ", " + item.bbox[ 1 ] + ", " + item.bbox[ 2 ] + ", " + item.bbox[ 3 ] : "";
							ll = item.geometry && item.geometry.type === "Point" ? item.geometry.coordinates[ 0 ] + ", " + item.geometry.coordinates[ 1 ] : "";
							icon = iconObj[ item.type ] ? iconObj[ item.type ] : "<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
							title = abbrProv( title, mapObj );
							label = title.replace( /<(?:.|\n)*?>/gm, "" );

							options += "<li id='al-opt-" + geomap.id + "-" + i +
								"' class='al-opt' data-lat-lon='" + ll +
								"' data-bbox='" + bnd +
								"' data-type='" + item.type + "'>" +
								"<a href='javascript:;' tabindex='-1'>" + icon +
								"<span class='al-val'>" + title + "</span>" +
								"<span class='al-lbl wb-inv' aria-hidden='true'>" + label + "</span>" +
								"</a></li>";

						}

						$autolist.empty().append( options );
						$autolist.removeClass( "hide" ).attr( "aria-hidden", "false" );
						$input.attr( "aria-expanded", "true" );

						// bind events to the options
						// TODO: do this in the wb-update event
						$( ".al-opt a" ).on( "keydown click vclick", function( event ) {
							var link = event.target,
								eventType = event.type,
								which = event.which;

							switch ( eventType ) {
							case "keydown":
								if ( !( event.ctrlKey || event.metaKey ) ) {
									return keyboardHandlerAutolist( which, link );
								}
								break;
							case "click":
							case "vclick":
							case "touchstart":

								// Ignore middle/right mouse buttons
								if ( !which || which === 1 ) {
									return clickHandlerAutolist( link );
								}
								break;
							}

						} );

					} else {
						$autolist.empty();
						$autolist.addClass( "hide" ).attr( "aria-hidden", "true" );
						$autolist.attr( "aria-expanded", "false" );
					}

				},
				dataType: wb.ielt10 ? "jsonp" : "json",
				cache: false
			} );

		}

		/**
		 * Keyboard event handler for the polyfilled input field
		 * @param {integer} which Value for event.which
		 * @param {jQuery Event} event The event that triggered this method call
		 */
		function keyboardHandlerInput( which, event ) {

			var input = event.target,
				autolist = input.nextSibling.firstChild,
				autolistHidden = ( autolist.className.indexOf( "hide" ) !== -1 ),
				options, dest, value, len;

			// Unmodified keystrokes only
			if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {

				// Spacebar, a - z keys, 0 - 9 keys punctuation, and symbols
				if ( which === 32 || ( which > 47 && which < 91 ) ||
					( which > 95 && which < 112 ) || ( which > 159 && which < 177 ) ||
					( which > 187 && which < 223 ) ) {
					if ( !event.altKey ) {
						showOptions( input, input.value + String.fromCharCode( which ) );
					}

				// Backspace
				} else if ( which === 8 && !event.altKey ) {
					value = input.value;
					len = value.length;

					if ( len !== 0 ) {
						showOptions( input, value.substring( 0, len - 1 ) );
					}

				// Up / down arrow
				} else if ( ( which === 38 || which === 40 ) && input.getAttribute( "aria-activedescendent" ) === "" ) {

					if ( autolistHidden ) {
						showOptions( input );
					}

					options = autolist.getElementsByTagName( "a" );

					if ( options.length === 0 ) {
						return false;
					}

					dest = options[ ( which === 38 ? options.length - 1 : 0 ) ];

					input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );

					// Assign focus to dest
					$( dest ).trigger( setFocusEvent );

					return false;

				} else if ( !autolistHidden ) {

					// Tab or Escape key
					if ( ( which === 9 || which === 27 ) || ( which === 27 && !event.altKey ) ) {
						closeOptions( input );
					}
				}
			}
		}

		/**
		 * Click / Touch event handler for the autolist of the polyfilled input field
		 * @param {integer} eventTarget Value for event.target
		 */
		function clickHandlerAutolist( eventTarget ) {

			var nodeName = eventTarget.nodeName.toLowerCase(),
				link = nodeName === "a" ? eventTarget : eventTarget.parentNode,
				autolist = link.parentNode.parentNode,
				input = autolist.parentNode.previousSibling,
				$input = $( input ),
				span = link.getElementsByTagName( "span" ),
				value = span[ 2 ].innerHTML;

			input.value = value;

			panZoomToFeature( link.parentNode.getAttribute( "data-bbox" ), link.parentNode.getAttribute( "data-lat-lon" ) );

			$input.trigger( setFocusEvent );
			closeOptions( input );

			return false;
		}

		/**
		 * Keyboard event handler for the autolist of the polyfilled input field
		 * @param {integer} which Value for event.which
		 * @param {DOM element} link Link element that is the target of the event
		 */
		function keyboardHandlerAutolist( which, link ) {
			var autolist = link.parentNode.parentNode,
				input = autolist.parentNode.previousSibling,
				$input = $( input ),
				span, dest, value, len, children;

			// Unmodified keystrokes only
			if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {

				// Spacebar, a - z keys, 0 - 9 keys punctuation, and symbols
				if ( which === 32 || ( which > 47 && which < 91 ) ||
					( which > 95 && which < 112 ) || ( which > 159 && which < 177 ) ||
					( which > 187 && which < 223 ) ) {

					input.value += String.fromCharCode( which );
					$input.trigger( setFocusEvent );
					showOptions( input, input.value );

					return false;

				// Backspace
				} else if ( which === 8 ) {
					value = input.value;
					len = value.length;

					if ( len !== 0 ) {
						input.value = value.substring( 0, len - 1 );
						showOptions( input, input.value );
					}

					$input.trigger( setFocusEvent );

					return false;

				// Enter key
				} else if ( which === 13 ) {
					span = link.getElementsByTagName( "span" );
					value = span[ 2 ].innerHTML;

					input.value = value;

					panZoomToFeature( link.parentNode.getAttribute( "data-bbox" ), link.parentNode.getAttribute( "data-lat-lon" ) );

					$input.trigger( setFocusEvent );
					closeOptions( input );

					return false;

				// Tab or Escape key
				} else if ( which === 9 || which === 27 ) {
					$input.trigger( setFocusEvent );
					closeOptions( input );

					return false;

				// Up or down arrow
				} else if ( which === 38 || which === 40 ) {

					// Up arrow
					if ( which === 38 ) {
						dest = link.parentNode.previousSibling;
						if ( !dest ) {
							children = autolist.getElementsByTagName( "li" );
							dest = children[ children.length - 1 ];
						}

					// Down arrow
					} else {
						dest = link.parentNode.nextSibling;
						if ( !dest ) {
							dest = autolist.getElementsByTagName( "li" )[ 0 ];
						}
					}
					dest = dest.getElementsByTagName( "a" )[ 0 ];

					input.setAttribute( "aria-activedescendent", dest.parentNode.getAttribute( "id" ) );
					$( dest ).trigger( setFocusEvent );

					return false;
				}
			}

		}

	},

	/*
	 * Geolocation control - locate client and display icon on map
	 */
	GeolocationControl = function( options ) {

		var opts = options || {},
			_this = this,
			accuracyFeature, positionFeature,
			button, coordinates, element;

		$( "body" ).append(
			"<section id='overlay-location-error' class='wb-overlay modal-content overlay-def wb-bar-t bg-danger'>" +
			"<header><h2 class='modal-title'>Geolocation error.</h2></header>" +
			"</section>"
		);

		$( "#overlay-location-error" ).trigger( "wb-init.wb-overlay" );

		button = document.createElement( "button" );
		button.setAttribute( "type", "button" );
		button.setAttribute( "title", i18nText.geolocBtn );
		button.innerHTML = "<span class='glyphicon glyphicon-screenshot'></span>";

		element = document.createElement( "div" );
		element.className = "ol-geolocate ol-unselectable ol-control";

		element.appendChild( button );

		_this.geolocation = new ol.Geolocation( opts );

		function createFeatures() {

			positionFeature = new ol.Feature();
			accuracyFeature = new ol.Feature();

			positionFeature.setStyle( getPointStyle( {
				radius: 6,
				fill: new ol.style.Fill( {
					color: "#3399CC"
				} ),
				stroke: new ol.style.Stroke( {
					color: "#fff",
					width: 2
				} ) } )
			);

			return [ accuracyFeature, positionFeature ];
		}

		ol.control.Control.call( this, {
			element: element,
			target: opts.target
		} );

		_this.geolocation.on( "change:accuracyGeometry", function() {
			accuracyFeature.setGeometry( _this.geolocation.getAccuracyGeometry() );
		} );

		_this.geolocation.on( "change:position", function() {
			coordinates = _this.geolocation.getPosition();
			positionFeature.setGeometry( coordinates ?
					new ol.geom.Point( coordinates ) : null );

			// zoom to feature
			var extent = _this.featuresOverlay.getSource().getExtent();
			_this.getMap().getView().fit( extent, _this.getMap().getSize() );

			$( button ).html( "<span style='color:#3399CC;' class='glyphicon glyphicon-screenshot'></span>" );

		} );

		/* Handle errors.
		 * Codes:
			PERMISSION_DENIED: 1
			POSITION_UNAVAILABLE: 2
			TIMEOUT: 3
		*/
		_this.geolocation.on( "error", function( error ) {
			if ( error.code === 2 ) {
				$( "#overlay-location-error h2.modal-title" ).text( i18nText.geolocUncapable );
				$( "#overlay-location-error" ).trigger( "open.wb-overlay" );
			} else {
				$( "#overlay-location-error h2.modal-title" ).text( i18nText.geolocFail );
				$( "#overlay-location-error" ).trigger( "open.wb-overlay" );
			}
		} );

		button.addEventListener( "click", function() {

			$( this ).html( "<span style='font-size:.9em;' class='glyphicon glyphicon-refresh glyphicon-spin'></span>" );

			if ( typeof _this.featuresOverlay === "undefined" ) {

				_this.featuresOverlay = new ol.layer.Vector( {
					map: _this.getMap(),
					source: new ol.source.Vector( { } )
				} );

				_this.featuresOverlay.getSource().addFeatures( createFeatures() );
				_this.geolocation.setTracking( true );

			} else if ( _this.featuresOverlay.getSource().getFeatures().length === 0 ) {

				_this.featuresOverlay.getSource().addFeatures( createFeatures() );
				_this.geolocation.setTracking( true );

			} else {

				_this.geolocation.setTracking( false );
				_this.featuresOverlay.getSource().clear();

				$( this ).html( "<span class='glyphicon glyphicon-screenshot'></span>" );

			}

		}, false );

	},

	/*
	 * Construct a polygon and densify the latitudes to show the curvature
	 */
	densifyBBox = function( minX, minY, maxX, maxY ) {

		var left = parseFloat( minX ),
			bottom = parseFloat( minY ),
			right = parseFloat( maxX ),
			top = parseFloat( maxY ),
			newbounds = [ ],
			j;

		if ( left.length === 0 || bottom.length === 0 ||
			right.length === 0 || top.length === 0 ) {

			return false;
		}

		// If default BBOX, make it fit in view showing Canada and not the world.
		if ( left === -180.0 ) {
			left += 0.1;
		}
		if ( right === 180.0 ) {
			right = -5.0;
		}
		if ( top === 90.0 ) {
			top -= 3;
		}
		if ( bottom === -90.0 ) {
			bottom = 35.0;
		}

		for ( j = left; j < right; j += 0.5 ) {
			newbounds.push( new ol.geom.Point( [ j, bottom ] ) );
		}

		newbounds.push( new ol.geom.Point( [ right, bottom ] ) );

		for ( j = right; j > left; j -= 0.5 ) {
			newbounds.push( new ol.geom.Point( [ j, top ] ) );
		}

		newbounds.push( new ol.geom.Point( [ left, top ] ) );
		newbounds.push( new ol.geom.Point( [ left, bottom ] ) );

		return newbounds;
	},

	/*
	 * Refresh WET plugins
	 */
	refreshPlugins = function() {
		$( ".wb-tables" ).trigger( "wb-init.wb-tables" );
	},

	getLayerById = function( map, id ) {
		var layer;

		map.getLayers().forEach( function( lyr ) {
			if ( id === lyr.id ) {
				layer = lyr;
				return;
			}
		} );

		return layer;
	},

	// Retrieve the map, layer and feature using data attributes on an element
	getMapLayerFeature = function( elm ) {

		var geomap = getMapById( elm.getAttribute( "data-map" ) ),
			layer;

		if ( elm.getAttribute( "data-layer" ) ) {
			layer = getLayerById( geomap.map, elm.getAttribute( "data-layer" ) );

			return [
				geomap.map,
				layer,
				elm.getAttribute( "data-feature" ) ? layer.getSource().getFeatureById( elm.getAttribute( "data-feature" ) ) : null
			];

		} else {
			return [ geomap.map, null, null ];
		}
	},

	/**
	 * Create a random Guid.
	 *
	 * @return {String} a random Guid value.
	 */
	generateGuid = function() {
		return Math.random().toString( 36 ).slice( 2 );
	};

// Handle the Zoom to button events
$document.on( "click", ".geomap-zoomto", function( event ) {
	var which = event.which,
		target = ( event.target.tagName === "A" ) ? event.target : $( event.target ).closest( "a" )[ 0 ],
		mapId, mapLayerFeature, geometry, extent, view;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		event.preventDefault();
		mapId = target.getAttribute( "data-map" );
		mapLayerFeature = getMapLayerFeature( target );
		geometry = mapLayerFeature[ 2 ].getGeometry();
		extent = geometry.getExtent();
		view = mapLayerFeature[ 0 ].getView();

		//TODO: rework, using undocumented function
		if ( geometry.getType() === "Point" ) {
			view.fit( extent, mapLayerFeature[ 0 ].getSize() );
			view.setZoom( 10 );
		} else {
			view.fit( extent, mapLayerFeature[ 0 ].getSize() );
		}

		$( "#" + mapId + " .wb-geomap-map" ).trigger( "setfocus.wb" );
	}
} );

// Bind the init function to the geomap.wb event
$document.on( "geomap.wb", selector, init );

// Update the map when the window is resized
$document.on( wb.resizeEvents, function( event ) {

	mapArray.forEach( function( geomap ) {

		var $mapDiv = $( geomap.map.getTargetElement() ),
			$myDiv = $mapDiv.find( ".geomap-geoloc" ),
			width = $mapDiv.width();

		$mapDiv.height( width * geomap.map.get( "aspectRatio" ) );

		geomap.map.updateSize();

		if ( $myDiv ) {
			if ( event.type === "mediumview" || event.type === "largeview" || event.type === "xlargeview" ) {
				$myDiv.css( { "width": "60%" } );
			} else {
				$myDiv.css( { "width": "80%" } );
			}
		}

	} );

} );

// Handle clicking of checkboxes within the tables
$document.on( "change", ".geomap-cbx", function( event ) {

	var target = event.target,
		feature = getMapLayerFeature( target )[ 2 ],
		map = getMapLayerFeature( target )[ 0 ],
		selectInteraction = getMapInteraction( map, ol.interaction.Select ),
		checked = target.checked;

	if ( checked ) {
		selectInteraction.getFeatures().push( feature );
	} else {
		selectInteraction.getFeatures().remove( feature );
	}

} );

/**
 * Add/remove map border based on mouse pointer location
 */
$document.on( "focusin focusout mouseover mouseout", ".wb-geomap-map", function( event ) {

	var target = event.currentTarget,
		type = event.type,
		isActive = target.className.indexOf( "active" ),
		geomap = getMapById( target.getAttribute( "data-map" ) ),
		mouseWheelZoom = getMapInteraction( geomap.map, ol.interaction.MouseWheelZoom );

	// disable mouseWheelZoom so that page scrolling isn't interupted
	if ( geomap.settings.useMapControls ) {
		mouseWheelZoom.setActive( false );
	}

	if ( type === "mouseover" || type === "focusin" ) {
		if ( isActive ) {
			$( target ).addClass( "active" );
		}

		// enable mouseWheelZoom if using map controls and user has focused in on map
		if ( type === "focusin" && geomap.settings.useMapControls ) {
			mouseWheelZoom.setActive( true );
		}
	} else if ( isActive > 0 ) {
		$( target ).removeClass( "active" );
	}

} );

/*
	* Add basemap data
	*/
Geomap.prototype.addBasemap = function() {

	var _this = this,
		basemap = _this.settings.basemap,
		hasBasemap = basemap && basemap.length !== 0,
		viewOptions = {},
		urls = [],
		mapOpts = {},
		olLayers = [],
		params, z,
		projection, resolutions, mapWidth, zoomOffset, offset, matrixIds;

	if ( _this.settings.attribution ) {
		mapOpts.attributions = [ new ol.Attribution( {
			html: _this.settings.attribution.text
		} ) ];
	}

	// Check to see if a base map has been configured. If not add the
	// default base map (the Canada Transportation Base Map (CBMT))
	if ( hasBasemap ) {

		// map OL2 params to OL3 view properties
		viewOptions.extent = ( basemap.mapOptions && basemap.mapOptions.maxExtent ) ? basemap.mapOptions.maxExtent.split( "," ).map( Number ) : null;
		viewOptions.projection = ( basemap.mapOptions && basemap.mapOptions.projection ) ? basemap.mapOptions.projection : "EPSG:3857";
		viewOptions.center = ( _this.settings && _this.settings.center ) ? ol.proj.transform( _this.settings.center, "EPSG:4326", viewOptions.projection ) : ( basemap.mapOptions && basemap.mapOptions.center ) ? ol.proj.transform( basemap.mapOptions.center, "EPSG:4326", viewOptions.projection ) : ( basemap.mapOptions && basemap.mapOptions.maxExtent ) ? ol.extent.getCenter( viewOptions.extent ) : [ 0, 0 ];
		viewOptions.zoom = ( _this.settings && _this.settings.zoom ) ? _this.settings.zoom : ( basemap.mapOptions && basemap.mapOptions.zoomLevel ) ? basemap.mapOptions.zoomLevel : 2;

		if ( basemap.type === "wms" ) {

			params = removeKeys( basemap, [ "mapOptions", "url" ] );
			params.srs = viewOptions.projection;
			params.crs = viewOptions.projection;

			olLayers.push(
				new ol.layer.Image( {
					extent: viewOptions.extent,
					source: new ol.source.ImageWMS( {
						url: basemap.url,
						params: params
					} )
				} )
			);

		} else if ( basemap.type === "esri" ) {

			// Backwards compatibility with OL2 configurations
			// TODO: this should only be tried if resource is not found
			mapOpts.url = basemap.url.replace( "/MapServer/export", "/MapServer" );

			olLayers.push(
				new ol.layer.Tile( {
					extent: viewOptions.extent,
					source: new ol.source.TileArcGISRest( mapOpts )
				} )
			);

		} else if ( basemap.type === "xyz" ) {

			// Backwards compatibility with OL2 configurations
			// TODO: test with known configurations
			if ( $.isArray( basemap.url ) ) {
				$.each( basemap.url, function( index, url ) {
					urls.push( url.replace( /\${/g, "{" ) );
				} );
				mapOpts.urls = urls;
			} else {
				mapOpts.url = basemap.url.replace( /\${/g, "{" );
			}

			olLayers.push(
				new ol.layer.Tile( {
					source: new ol.source.XYZ( mapOpts )
				} )
			);

		} else if ( basemap.type === "osm" ) {

			olLayers.push(
				new ol.layer.Tile( {
					source: new ol.source.OSM( { attributions: [ ol.source.OSM.ATTRIBUTION ] } )
				} )
			);

		} else if ( basemap.type === "mapquest" ) {
			olLayers.push(
				new ol.layer.Tile( {
					source: new ol.source.MapQuest( { layer: "sat" } )
				} )
			);
		}

	// No basemap configured so use default
	} else {

		projection = ol.proj.get( "EPSG:3978" );

		resolutions = [
			38364.660062653464,
			22489.62831258996,
			13229.193125052918,
			7937.5158750317505,
			4630.2175937685215,
			2645.8386250105837,
			1587.5031750063501,
			926.0435187537042,
			529.1677250021168,
			317.50063500127004,
			185.20870375074085,
			111.12522225044451,
			66.1459656252646,
			38.36466006265346,
			22.48962831258996,
			13.229193125052918,
			7.9375158750317505,
			4.6302175937685215
		];

		mapWidth = this.mapDiv.width();
		zoomOffset = 5;

		// In function of map width size, set the proper resolution and zoom offset
		if ( mapWidth > 260 && mapWidth <= 500 ) {
			zoomOffset = 1;
		} else if ( mapWidth > 500 && mapWidth <= 725 ) {
			zoomOffset = 2;
		} else if ( mapWidth > 725 && mapWidth <= 1175 ) {
			zoomOffset = 3;
		} else if ( mapWidth > 1175 && mapWidth <= 2300 ) {
			zoomOffset = 4;
		}

		for ( offset = zoomOffset - 1; offset !== -1; offset -= 1 ) {
			resolutions.shift();
		}

		matrixIds = new Array( resolutions.length );

		for ( z = 0; z < resolutions.length; ++z ) {
			matrixIds[ z ] = zoomOffset + z;
		}

		viewOptions = {
			extent: [ -2750000.0, -900000.0, 3600000.0, 4630000.0 ],
			resolutions: resolutions,
			projection: projection
		};

		olLayers.push( new ol.layer.Tile( {
			source: new ol.source.WMTS( {
				attributions: [ new ol.Attribution( {
					html: "<a href='" + i18nText.attribLink + "'>" + i18nText.attribTitle + "</a>"
				} ) ],
				url: i18nText.baseMapURL,
				layer: i18nText.baseMapTitle,
				matrixSet: i18nText.baseMapMatrixSet,
				projection: projection,
				tileGrid: new ol.tilegrid.WMTS( {
					extent: [ -2750000.0, -900000.0, 3600000.0, 4630000.0 ],
					origin: [ -3.46558E7, 3.931E7 ],
					resolutions: resolutions,
					matrixIds: matrixIds
				} ),
				style: "default"
			} )
		} ) );

	}

	// Add the base layers to the map
	for ( var lyrLen = olLayers.length - 1; lyrLen !== -1; lyrLen -= 1 ) {
		_this.map.addLayer( olLayers[ lyrLen ] );
	}

	return removeNullKeys( viewOptions );

};

/**
 * Create Legend
 */
MapLayer.prototype.addToLegend = function() {

	var _this = this,
		legendDiv = this.map.legend.target,
		$fieldset, $ul, checked, $chkBox, $label, $li;

	// If no legend or fieldset add them
	$fieldset = legendDiv.find( "fieldset" );
	if ( $fieldset.length === 0 ) {
		$fieldset = $( "<fieldset name='legend'><legend class='wb-inv'>" +
			i18nText.toggleLayer + "</legend></fieldset>" ).appendTo( legendDiv );
	}

	checked = this.isVisibile ? "checked='checked'" : "";

	$ul = legendDiv.find( "ul.geomap-lgnd" );
	if ( $ul.length === 0 ) {
		$ul = $( "<ul class='list-unstyled geomap-lgnd'></ul>" ).appendTo( $fieldset );
	}

	$chkBox = $( "<input type='checkbox' id='cb_" + this.id +
			"' class='geomap-lgnd-cbx' value='" + this.id +
						"' " + checked + " data-map='" + this.map.id +
								"' data-layer='" + this.id + "' />" );

	_this.observeVisibility( function( visibility ) {

		// Show/hide legend symbols
		$( "#sb_" + _this.id ).toggle( visibility );

		// Refresh the legend
		_this.map.legend.refresh();

		$chkBox.get( 0 ).checked = visibility;
	} );

	// Handle the change event to Show/hide layer
	$chkBox.change( function() {
		_this.isVisible = $( this ).is( ":checked" );
	} );

	$label = $( "<label>", {
		"for": "cb_" + this.id,
		text: this.settings.title
	} ).prepend( $chkBox );

	$li = $( "<li class='checkbox geomap-lgnd-layer'>" )
			.append( $label, "<div id='sb_" + this.id + "'></div>" );

	$ul.append( $li );

	if ( this.settings.options && this.settings.options.legendUrl ) {
		$( "#sb_" + this.id ).append( "<img src='" + this.settings.options.legendUrl + "' alt='" + i18nText.geoLgndGrphc + "'/>" );
	} else if ( this.settings.options && this.settings.options.legendHTML ) {
		$( "#sb_" + this.id ).append( this.settings.options.legendHTML );
	} else if ( this.settings.type !== "wms" ) {
		this.map.legend.symbolize( this );
	}

};

/**
 * Add tabluar data
 */
Geomap.prototype.addTabularData = function() {

	var $table, table, featureTable, featureArray, attr, theadTr, thElms, thLen,
		trElms, trLen, useMapControls, attrMap, trElmsInd, geomType,
		feat, feature, features, vectorFeature, wktFeature,
		script, bbox, vertices, len, vertLen, lenTable,
		thZoom = "<th><span class='wb-inv'>" + i18nText.zoomFeature + "</span></th>",
		thSelect = "<th><span class='wb-inv'>" + i18nText.select + "</span></th>",
		wktParser = new ol.format.WKT(),
		thRegex = /<\/?[^>]+>/gi,
		vectRegex = /\W/g,
		visibility,
		style, colors, mapLayer;

	for ( lenTable = this.settings.tables.length - 1; lenTable !== -1; lenTable -= 1 ) {

		table = document.getElementById( this.settings.tables[ lenTable ].id );

		// If the table is not found continue
		if ( !table ) {
			continue;
		}

		$table = $( table ).wrap( "<div data-layer='" + this.settings.tables[ lenTable ].id + "' class='geomap-table-wrapper'></div>" );

		featureTable = this.settings.tables[ lenTable ];
		featureArray = [];
		attr = [];
		thElms = table.getElementsByTagName( "th" );
		trElms = table.getElementsByTagName( "tr" );
		trLen = trElms.length;
		useMapControls = this.settings.useMapControls;

		if ( $table.hasClass( "wb-tables" ) && typeof $table.attr( "data-wb-tables" ) === "undefined" ) {
			$table.attr( "data-wb-tables", "{ \"order\": [], \"columnDefs\": [ { \"targets\": [ 0, " + ( thElms.length + 1 ) + " ], \"orderable\": false } ] }" );
		}

		// If visibility is not set to false, show the layer
		visibility = this.settings.tables[ lenTable ].visible === false ? false : true;

		// Get the attributes from table header
		for ( thLen = thElms.length - 1; thLen !== -1; thLen -= 1 ) {
			attr[ thLen ] = thElms[ thLen ].innerHTML.replace( thRegex, "" );
		}

		// If zoomTo add the header column headers
		theadTr = $table.find( "thead tr" );
		if ( featureTable.zoom && useMapControls ) {
			theadTr.append( thZoom );
		}

		// Add select checkbox
		theadTr.prepend( thSelect );

		colors = defaultColors();

		style = typeof featureTable.style === "undefined" ?
				{ "strokeColor": colors.stroke, "fillColor": colors.fill } :
					featureTable.style;

		// Loop through each row
		for ( trLen = trElms.length - 1; trLen !== -1; trLen -= 1 ) {

			// Create an array of attributes: value
			attrMap = {};

			trElmsInd = trElms[ trLen ];

			// Get the geometry type
			geomType = trElmsInd.getAttribute( "data-type" );
			features = trElmsInd.getElementsByTagName( "td" );

			for ( len = 0; len < features.length; len += 1 ) {

				// Use innerHTML instead of innerText or textContent because they react differently in different browser
				// remove script tag from the attribute
				feature = features[ len ];
				script = feature.getElementsByTagName( "script" )[ 0 ];
				if ( script ) {
					script.parentNode.removeChild( script );
				}
				attrMap[ attr[ len ] ] = feature.innerHTML;
			}

			if ( geomType !== null ) {
				if ( geomType === "bbox" ) {
					bbox = trElmsInd.getAttribute( "data-geometry" ).split( "," );

					feat = densifyBBox(
						bbox[ 0 ],
						bbox[ 1 ],
						bbox[ 2 ],
						bbox[ 3 ]
					);

					vertices = "";

					for ( vertLen = feat.length - 1; vertLen !== -1; vertLen -= 1 ) {
						vertices += feat[ vertLen ].getCoordinates()[ 0 ] + " " + feat[ vertLen ].getCoordinates()[ 1 ] + ", ";
					}

					vertices = vertices.slice( 0, -2 );
					wktFeature = "POLYGON ((" + vertices + "))";

				} else if ( geomType === "wkt" ) {
					wktFeature = trElmsInd.getAttribute( "data-geometry" );

					// Backward compatibility fix
					// REMOVE in next major version of WET
					if ( wktFeature.indexOf( "POINT" ) !== -1 ) {
						wktFeature = wktFeature.replace( ",", "" );
					}
				}

				vectorFeature = wktParser.readFeature( wktFeature, {
					dataProjection: "EPSG:4326",
					featureProjection: this.map.getView().getProjection()
				} );

				vectorFeature.setId( generateGuid() );
				vectorFeature.layerId = featureTable.id;
				vectorFeature.layerTitle = $table.attr( "aria-label" );

				if ( featureTable.tooltips ) {
					vectorFeature.tooltip = featureTable.tooltipText ? attrMap[ featureTable.tooltipText ] : attrMap[ Object.keys( attrMap )[ 0 ] ];
				}

				// Set the table row id
				trElmsInd.setAttribute( "id", vectorFeature.getId().replace( vectRegex, "_" ) );

				// Add the checkboxes and zoom controls
				$( trElmsInd ).html( addChkBox( this, vectorFeature ) + trElmsInd.innerHTML +
				( useMapControls && featureTable.zoom ? addZoomTo( this, vectorFeature ) : "" ) );

				// Add the attributes to the feature then add it to the feature array
				vectorFeature.attributes = attrMap;
				featureArray.push( vectorFeature );

			}
		}

		mapLayer = new MapLayer( this, {
			tableId: $table.attr( "id" ),
			type: "wkt",
			visible: visibility,
			datatable: featureTable.datatable,
			popupsInfo: featureTable.popupsInfo,
			popups: featureTable.popups,
			tooltips: featureTable.tooltips,
			tooltipText: featureTable.tooltipText,
			name: featureTable.id,
			title: $table.attr( "aria-label" ),
			features: featureArray,
			style: style
		} );

		this.mapLayers.push( mapLayer );

	}
};

/**
 * Create layers
 */
Geomap.prototype.addMapLayers = function() {

	var _this = this,
		olLayer, mapLayer;

	// Add tabular data first
	_this.addTabularData();

	// Add overlays second
	$.each( _this.settings.overlays, function( index, layer ) {
		mapLayer = new MapLayer( _this, layer );
		_this.mapLayers.push( mapLayer );
	} );

	// Add geocoder and AOI layer
	olLayer = new ol.layer.Vector( {
		source: new ol.source.Vector(),
		style: new ol.style.Style( {
			fill: new ol.style.Fill( {
				color: "rgba( 255, 0, 20, 0.1 )"
			} ),
			stroke: new ol.style.Stroke( {
				color: "#ff0033",
				width: 2
			} ),
			image: new ol.style.RegularShape( {
				fill: new ol.style.Fill( {
					color: "#ff0033"
				} ),
				stroke: new ol.style.Stroke( {
					color: "#ff0033",
					width: 5
				} ),
				points: 4,
				radius: 10,
				radius2: 0,
				angle: 0
			} )
		} )
	} );

	olLayer.id = "locLayer";
	_this.map.addLayer( olLayer );

	// Finally add the layers to the map
	for ( var lyrLen = _this.mapLayers.length - 1; lyrLen !== -1; lyrLen -= 1 ) {
		if ( _this.mapLayers[ lyrLen ].layer ) {
			_this.map.addLayer( _this.mapLayers[ lyrLen ].layer );
		}
	}

};

/**
 * Create a table for vector features
 * @return { table }
 */
MapLayer.prototype.populateDataTable = function() {

	if ( !this.settings.accessible ) {
		return;
	}

	var _this = this,
		attributes = _this.settings.attributes,
		len = attributeLen(),
		$table = $( "<table class='table' aria-label='" + _this.settings.title + "' id='" + _this.id + "'><caption>" + _this.settings.caption + "</caption></table>" ),
		head = "<th><span class='wb-inv'>" + i18nText.select + "</span></th>",
		body = "",
		features = _this.layer.getSource().getFeatures(),
		key, attKey;

	if ( _this.settings.datatable ) {
		$table.addClass( "wb-tables" );
		$table.attr( "data-wb-tables", "{ \"order\": [], \"columnDefs\": [ { \"targets\": [ 0, " + ( len + 1 ) + " ], \"orderable\": false } ] }" );
	} else {
		$table.addClass( "table-condensed" );
	}

	// Create the header row
	for ( key in attributes ) {
		if ( attributes.hasOwnProperty( key ) ) {
			attKey = attributes[ key ].alias ? attributes[ key ].alias : attributes[ key ];
			head += "<th>" + attKey + "</th>";
		}
	}

	head = "<thead><tr>" + head + ( _this.map.settings.useMapControls && _this.settings.zoom ? "<th><span class='wb-inv'>" + i18nText.zoomFeature + "</span></th>" : "" ) + "</tr></thead>";

	// Create the table body rows
	// for ( var i = 0; i < features.length || ( function() { refreshPlugins( _this.map ); return false; }() ); i += 1 ) {
	for ( var i = 0; i < features.length; i += 1 ) {

		body += "<tr>" + addChkBox( _this, features[ i ] );

		attributes = features[ i ].attributes;

		for ( key in attributes ) {
			if ( attributes.hasOwnProperty( key ) ) {
				body += "<td>" + attributes[ key ] + "</td>";
			}
		}

		body += _this.map.settings.useMapControls && _this.settings.zoom ? addZoomTo( _this.map, features[ i ] ) : "";

	}

	$table.append( head, "<tbody>" + body + "</tbody>" );

	$( "div[ data-layer='" + _this.id + "'].geomap-table-wrapper" ).append( $table );

	function attributeLen() {
		var len = 0;
		for ( var key in attributes ) {
			if ( attributes.hasOwnProperty( key ) ) {
				len += 1;
			}
		}
		return len;
	}

	refreshPlugins( _this.map );

	return $table;
};

/**
 * Create OpenLayers Layer
 * @returns {ol.Layer}
 */
MapLayer.prototype.createOLLayer = function() {

	var _this = this,
		layerAttributes = _this.settings.attributes,
		colors, olLayer, styleFactory, atts, featureGeometry, key, source;

	if ( _this.settings.type === "wms" ) {

		var keys = getLayerKeys( _this.settings ),
			opacity = keys.options.opacity ? keys.options.opacity : 1;

		olLayer = new ol.layer.Image( {
			opacity: opacity,
			visible: _this.settings.visible,
			source: new ol.source.ImageWMS( {
				url: _this.settings.url,
				params: keys
			} )
		} );

		// Image layers don't have features, so don't create table
		_this.settings.accessible = false;

	} else if ( _this.settings.type === "wkt" ) {

		styleFactory = new StyleFactory();

		// TODO pass data into this rather than taking features from mapLayer
		// create a new layer with the feature array
		olLayer = new ol.layer.Vector( {
			visible: _this.settings.visible,
			source: new ol.source.Vector( {
				features: _this.settings.features
			} ),
			style: styleFactory.createStyleFunction( _this.settings.style, _this.settings.featureType )
		} );

		// TODO set this in the addTabular data stream
		_this.settings.accessible = false;

	} else if ( _this.settings.type === "kml" ) {

		var extractStyles = !_this.settings.style;

		styleFactory = new StyleFactory();
		colors = defaultColors();

		//TODO: KML styles are getting overridden, don't do this
		olLayer = new ol.layer.Vector( {
			visible: _this.settings.visible,
			source: new ol.source.Vector( {
				url: _this.settings.url,
				format: new ol.format.KML( {
					extractStyles: extractStyles
				} )
			} )
		} );

		// TODO: this overrides style in KML - please fix
		if ( typeof _this.settings.style === "undefined" ) {

			// TODO: create a defaultStyle object
			_this.settings.style = { "strokeColor": colors.stroke, "fillColor": colors.fill };
		}

		// Set the style
		olLayer.getSource().once( "addfeature", function( event ) {
			featureGeometry = event.feature.getGeometry().getType();

			if ( !extractStyles ) {
				var style = styleFactory.createStyleFunction(
						_this.settings.style,
						featureGeometry
				);
				olLayer.setStyle( style );
			}
		} );

		source = olLayer.getSource();

		key = source.on( "change", function() {

			if ( source.getState() === "ready" ) {
				source.unByKey( key );

				var features = this.getFeatures();

				for ( var i = 0, len = features.length; i < len; i += 1 ) {

					var feature = features[ i ];

					if ( _this.settings.style.select ) {
						_this.settings.style.select.type = "select";
						var selStyleFactory = new StyleFactory(),
							selStyle = selStyleFactory.createStyleFunction(
									_this.settings.style.select,
									feature.getGeometry().getType()
							);
						feature.selectStyle = selStyle;
					}

					feature.setId( generateGuid() );
					feature.layerId = olLayer.id;
					feature.layerTitle = olLayer.title;

					atts = {};

					//TODO: densify coordinates

					// Parse and store the attributes
					// TODO: test on nested attributes
					for ( var name in layerAttributes ) {
						if ( layerAttributes.hasOwnProperty( name ) ) {
							atts[ layerAttributes[ name ] ] = feature.getProperties()[ name ];
						}
					}
					feature.attributes = atts;

					if ( _this.settings.tooltips ) {
						feature.tooltip = _this.settings.tooltipText ? atts[ _this.settings.tooltipText ] : atts[ Object.keys( atts )[ 0 ] ];
					}

				}

				// Populate table with feature data
				_this.populateDataTable();

				_this.map.legend.symbolize( _this );
			}
		}, source );


	} else if ( _this.settings.type === "json" ) {

		var olSource = new ol.source.Vector();

		styleFactory = new StyleFactory();
		colors = defaultColors();

		if ( typeof _this.settings.style === "undefined" ) {

			// TODO: create a defaultStyle object
			_this.settings.style = { "strokeColor": colors.stroke, "fillColor": colors.fill };
		}

		if ( _this.settings.cluster ) {
			olLayer = new ol.layer.Vector( {
				visible: _this.settings.visible,
				source: new ol.source.Cluster( {
					distance: 40,
					source: olSource
				} )
			} );
		} else {
			olLayer = new ol.layer.Vector( {
				visible: _this.settings.visible,
				source: olSource
			} );
		}

		// Set the style
		olSource.once( "addfeature", function() {
			olLayer.setStyle( styleFactory.createStyleFunction( _this.settings.style, featureGeometry ) );
		} );

		function getCoordKey( feature ) {

			var geomKey;

			$.each( feature, function( k, v ) {
				if ( v.coordinates ) {
					geomKey = k;
				}
			} );

			return geomKey;
		}

		var successHandler = function( data ) {

			var layerRoot = _this.settings.root,
				features = data[ layerRoot ] ? data[ layerRoot ] : data.features ? data.features : data,
				atts, bnds, feature, firstComponent, geom, geomProj, geomKey, i, len, path;

			// in some cases an array is not returned, so create one
			if ( features instanceof Array === false ) {
				features = $.map( features, function( obj ) {
					return obj;
				} );
			}

			for ( i = 0, len = features.length; i < len; i += 1 ) {

				feature = features[ i ];

				// look for a property named "coordinates" - lots to go wrong here
				// TODO: use regex to find something that looks like coordinates
				if ( !geomKey ) {
					geomKey = getCoordKey( feature );
				}

				if ( !feature[ geomKey ] ) {
					continue;
				}

				firstComponent = feature[ geomKey ].coordinates[ 0 ];

				// if we have a bounding box polygon, densify the coordinates
				if ( feature[ geomKey ].type === "Polygon" &&
					firstComponent.length === 5 ) {

					bnds = densifyBBox(
						firstComponent[ 1 ][ 0 ],
						firstComponent[ 1 ][ 1 ],
						firstComponent[ 3 ][ 0 ],
						firstComponent[ 3 ][ 1 ]
					);

					var coordinates = [];

					for ( var j = 0, len2 = bnds.length; j < len2; j += 1 ) {
						var point = bnds[ j ];
						coordinates.push( point.getCoordinates() );
					}

					geom = new ol.geom.Polygon( [ coordinates ] );

				} else if ( feature[ geomKey ].type === "Point" ) {

					geom = new ol.geom.Point( [ feature[ geomKey ].coordinates[ 1 ], feature[ geomKey ].coordinates[ 0 ] ] );

				} else if ( feature[ geomKey ].type === "LineString" ) {

					geom = new ol.geom.LineString( feature[ geomKey ].coordinates );

				}

				// transform the feature
				// TODO: support GeoJSON projections via OGC CRS URNs such as:
				//		"urn:ogc:def:crs:OGC:1.3:CRS84"
				geomProj = geom.transform( "EPSG:4326", _this.map.map.getView().getProjection() );

				// Parse and store the attributes
				// TODO: test on nested attributes
				// NOTE: it is possible that a feature is missing a value, in
				// which case we show an empty string in it's place
				atts = {};

				for ( var name in layerAttributes ) {
					path = null;
					if ( layerAttributes.hasOwnProperty( name ) ) {
						path = layerAttributes[ name ].path;
						if ( path ) {
							atts[ layerAttributes[ name ].alias ] = feature[ name ] ? feature[ name ][ path ] : "";
						} else {
							atts[ layerAttributes[ name ] ] = feature[ name ] ? feature[ name ] : "";
						}
					}
				}

				feature = new ol.Feature();
				feature.setId( generateGuid() );
				feature.layerId = olLayer.id;
				feature.layerTitle = olLayer.title;
				feature.attributes = atts;
				feature.setGeometry( geomProj );
				olSource.addFeature( feature );

				if ( _this.settings.tooltips ) {
					feature.tooltip = _this.settings.tooltipText ? atts[ _this.settings.tooltipText ] : atts[ Object.keys( atts )[ 0 ] ];
				}

			}

			// Populate table with feature data
			_this.populateDataTable();

			_this.map.legend.symbolize( _this );
		};

		// Get the file
		$.getJSON( _this.settings.url, _this.settings.params, successHandler );

	} else if ( _this.settings.type === "geojson" || _this.settings.type === "esrijson" || _this.settings.type === "topojson" ) {

		var layerURL;

		styleFactory = new StyleFactory();
		colors = defaultColors();

		if ( typeof _this.settings.style === "undefined" ) {

			// TODO: create a defaultStyle object
			_this.settings.style = { "strokeColor": colors.stroke, "fillColor": colors.fill };
		}

		layerURL = _this.settings.params ? _this.settings.url + "?" + $.param( _this.settings.params ) : _this.settings.url;

		if ( _this.settings.type === "geojson" ) {
			olLayer = new ol.layer.Vector( {
				visible: _this.settings.visible,
				source: new ol.source.Vector( {
					url: layerURL,
					format: new ol.format.GeoJSON(),
					strategy: ol.loadingstrategy.bbox
				} )
			} );
		} else if ( _this.settings.type === "topojson" ) {
			olLayer = new ol.layer.Vector( {
				visible: _this.settings.visible,
				source: new ol.source.Vector( {
					url: layerURL,
					format: new ol.format.TopoJSON()
				} )
			} );
		} else {
			olLayer = new ol.layer.Vector( {
				visible: _this.settings.visible,
				source: new ol.source.Vector( {
					url: layerURL,
					format: new ol.format.EsriJSON(),
					strategy: ol.loadingstrategy.bbox
				} )
			} );
		}

		// Set the style
		olLayer.getSource().once( "addfeature", function( event ) {
			featureGeometry = event.feature.getGeometry().getType();
			var style = styleFactory.createStyleFunction(
					_this.settings.style,
					featureGeometry
			);
			olLayer.setStyle( style );
		} );

		// Wait until all features are loaded, then build table and symbolize legend
		source = olLayer.getSource();

		key = source.on( "change", function() {

			if ( source.getState() === "ready" ) {
				source.unByKey( key );

				var features = this.getFeatures();

				for ( var i = 0, len = features.length; i < len; i += 1 ) {

					var feature = features[ i ];

					feature.setId( generateGuid() );
					feature.layerId = olLayer.id;
					feature.layerTitle = olLayer.title;
					atts = {};

					//TODO: densify coordinates

					// Parse and store the attributes
					// TODO: test on nested attributes
					for ( var name in layerAttributes ) {
						if ( layerAttributes.hasOwnProperty( name ) ) {
							atts[ layerAttributes[ name ] ] = feature.getProperties()[ name ];
						}
					}

					feature.attributes = atts;

					if ( _this.settings.tooltips ) {
						feature.tooltip = _this.settings.tooltipText ? atts[ _this.settings.tooltipText ] : atts[ Object.keys( atts )[ 0 ] ];
					}

				}

				// Populate table with feature data
				_this.populateDataTable();

				_this.map.legend.symbolize( _this );
			}

		}, source );

	}

	if ( olLayer ) {
		olLayer.id = _this.id;
		olLayer.title = _this.settings.title;
		olLayer.datatable = _this.settings.datatable;
		olLayer.popupsInfo = _this.settings.popupsInfo;
		olLayer.popups = _this.settings.popups;

		return olLayer;

	} else {

		return null;

	}

};


/**
 * Load controls and interactions
 */
Geomap.prototype.loadControls = function() {

	var _this = this,
		map = _this.map,
		popups = false,
		extentCtrl, mouseCtrl, scaleCtrl, selectInteraction;

	// Add a select interaction
	selectInteraction = new ol.interaction.Select( {
		layers: _this.layers
	} );

	selectInteraction.getFeatures().on( "remove", function( event ) {
		var feature = event.element;
		feature.setStyle( null );
		$( "#cb_" + feature.getId() ).prop( "checked", false ).closest( "tr" ).removeClass( "active" );
	} );

	selectInteraction.getFeatures().on( "add", function( event ) {
		var feature = event.element;
		if ( feature.selectStyle ) {
			feature.setStyle( feature.selectStyle );
		}
		$( "#cb_" + feature.getId() ).prop( "checked", true ).closest( "tr" ).addClass( "active" );
	} );

	// Add select event handler
	selectInteraction.on( "select", function( event ) {

		var _this = this,
			selected = event.selected ? event.selected : _this.getFeatures();

		if ( selected && selected.length > 0 && typeof selected[ 0 ].layerTitle !== "undefined" ) {
			popups = getLayerById( _this.getMap(), selected[ 0 ].layerId ).popups;

			selected[ 0 ].layerTitle = _this.getLayer( event.selected[ 0 ] ).title;

			if ( popups ) {
				showPopup( event, selected[ 0 ], map );
			}
		}

		// if there are no selected features then hide the popup
		if ( selected && selected.length === 0 ) {
			showPopup( event, null, map );
		}

	}, selectInteraction );

	// Add the interaction to the map
	map.getInteractions().extend( [ selectInteraction ] );

	if ( _this.settings.useMapControls ) {

		var element = document.createElement( "span" );

		element.className = "glyphicon glyphicon-home";

		extentCtrl = new ol.control.ZoomToExtent( {
			extent: map.getView().calculateExtent( map.getSize() ),
			label: element
		} );

		map.addControl( extentCtrl );

		extentCtrl.element.setAttribute( "aria-label", i18nText.zoomworld );
		extentCtrl.element.setAttribute( "title", i18nText.zoomworld );

		if ( _this.settings.useMousePosition ) {
			mouseCtrl = new ol.control.MousePosition( {
				coordinateFormat: ol.coordinate.createStringXY( 4 ),
				projection: "EPSG:4326",
				undefinedHTML: ""
			} );
			map.addControl( mouseCtrl );
			mouseCtrl.element.setAttribute( "aria-label", i18nText.mouseposition );
			mouseCtrl.element.setAttribute( "title", i18nText.mouseposition );
		}

		if ( _this.settings.useScaleLine ) {
			scaleCtrl =  new ol.control.ScaleLine();
			map.addControl( scaleCtrl );
			scaleCtrl.element.setAttribute( "aria-label", i18nText.scaleline );
			scaleCtrl.element.setAttribute( "title", i18nText.scaleline );
		}

	}

	// Add the geocoder widget
	if ( _this.settings.useGeocoder ) {
		new GeocodeControl( _this );
	}

	// Add the AOI widget
	if ( _this.settings.useAOI ) {
		new AOIWidget( _this );
	}

	// Add the geolocation widget
	if ( _this.settings.useGeolocation ) {
		_this.map.addControl( new GeolocationControl( { projection: _this.map.getView().getProjection() } ) );
	}

};

/**
 * Create an overlay to anchor the popup to the map.
 */
Geomap.prototype.createPopup = function() {

	var _this = this,
		$closer, overlay, $popup;

	$popup = $( "<div id='popup-" + _this.mapDiv.attr( "id" ) + "' class='ol-popup'></div>" );
	$closer = $( "<a href='#' title='" + i18nText.dismiss + "' class='ol-popup-closer' role='button'>&#xd7;<span class='wb-inv'>" + i18nText.dismiss + "</span></a>" );
	$popup.append( $closer, "<div class='popup-content'></div>" );

	// Add the popup container
	$( "#" + _this.mapDiv.attr( "id" ) ).append( $popup );

	overlay = new ol.Overlay( {
		element: document.getElementById( "popup-" + _this.mapDiv.attr( "id" ) ),
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	} );

	// Add a click handler to hide the popup
	$closer.on( "click", function( event ) {
		event.preventDefault();
		overlay.setPosition( undefined );
		this.blur();
		return false;
	} );

	_this.map.addOverlay( overlay );
};

/**
 * Add accessibility enhancements
 */
Geomap.prototype.accessibilize = function() {

	var _this = this,
		$ctrlZoomIn = _this.mapDiv.find( ".ol-zoom-in" ),
		$ctrlZoomOut = _this.mapDiv.find( ".ol-zoom-out" );

	$ctrlZoomIn.attr( "aria-label", i18nText.zoomin );
	$ctrlZoomIn.attr( "title", i18nText.zoomin );
	$ctrlZoomOut.attr( "aria-label", i18nText.zoomout );
	$ctrlZoomOut.attr( "title", i18nText.zoomout );

	// Add the map div to the tabbing order
	_this.mapDiv.attr( {
		tabindex: "0",
		"data-map": _this.id
	} );

	// Add WCAG element for the map div
	_this.mapDiv.attr( {
		role: "dialog",
		"aria-label": i18nText.ariaMap
	} );

	if ( _this.settings.useMapControls ) {

		// Add the map instructions
		new HelpControl( _this );
	}

};

/**
 * Zoom to an area of interest
 *
 * Param
 * -----
 * top = North || space separated list with all of them || WKT || empty
 * right = East
 * bottom = South
 * left = West
 */
Geomap.prototype.zoomAOI = function( top, right, bottom, left ) {

	var _this = this,
		OLmap = _this.map,
		olView = OLmap.getView(),
		extentCoordinate,
		extent,
		vectorFeature,
		isTopString = ( typeof top === "string" );

	if ( isTopString && !top.length ) {

		// Reset the zoom and center the map
		olView.setZoom( olView.getMaxZoom );
		return;

	} else if ( isTopString && top.substring( 0, 1 ).match( /[a-z]/gi ) !== null ) {

		// This is wkt type
		var wktParser = new ol.format.WKT();

		vectorFeature = wktParser.readFeature( top, {
			dataProjection: "EPSG:4326",
			featureProjection: olView.getProjection()
		} );

	} else {

		// Just 4 cardinal point was given
		if ( !right && isTopString ) {
			extentCoordinate = top.split( " " );
			if ( extentCoordinate.length !== 4 ) {
				throw "4 cardinal point must be provided";
			}
			top = extentCoordinate[ 0 ];
			right = extentCoordinate[ 1 ];
			bottom = extentCoordinate[ 2 ];
			left = extentCoordinate[ 3 ];
		} else if ( !right || !bottom || !left ) {
			throw "Cardinal point must be provided";
		}
		extentCoordinate = [ parseFloat( left ), parseFloat( bottom ), parseFloat( right ), parseFloat( top ) ];

		vectorFeature = drawAOI( _this, extentCoordinate, true );
	}

	extent = vectorFeature.getGeometry().getExtent();

	olView.fit( extent, OLmap.getSize() );
};

/*
 * Select a layer
 *
 * layerName = String or []<string>: Layer name to apply a state
 * state = Boolean, default false: Visibility state that are going to be set
 * onlyThose = Boolean, default false: If true, the inverse visibility state would be set for all the other layers.
 *
 */
Geomap.prototype.showLayer = function( layerName, state ) {

	var layerNameArray = [],
		geomapLayers = this.mapLayers,
		i, i_len = geomapLayers.length,
		i_lyr, i_lyr_title;

	state = !!state;

	if ( Array.isArray( layerName ) ) {
		layerNameArray = layerName;
	} else {
		layerNameArray.push( layerName );
	}

	for ( i = 0; i !== i_len; i = i + 1 ) {
		i_lyr = geomapLayers[ i ];
		i_lyr_title = i_lyr.layer.title;

		if ( !layerName || layerNameArray.indexOf( i_lyr_title ) !== -1 ) {
			i_lyr.isVisible = state;
		} else if ( i_lyr_title ) {
			i_lyr.isVisible = !state;
		}
	}
};

/**
 * Add the layer symbology to the legend
 */
MapLegend.prototype.symbolize = function( mapLayer ) {

	if ( !mapLayer.layer ) {
		return;
	}

	var _this = this,
		style = mapLayer.settings.style,
		layerName = mapLayer.id,
		feature = mapLayer.layer.getSource().getFeatures()[ 0 ],
		symbolItems = [],
		symbolList = "",
		title = "",
		filter, ruleLen, symbolizer, i, j, len, rule, spanId;

	if ( typeof style !== "undefined" && style.rule ) {

		ruleLen = style.rule.length;

		if ( ruleLen ) {

			for ( j = 0; j !== ruleLen; j += 1 ) {
				rule = style.rule[ j ];
				filter = rule.filter;
				symbolizer = rule.init;
				title = "";
				spanId = "ls_" + layerName + "_" + j;

				if ( filter && !rule.name ) {
					if ( filter.name ) {
						title = filter.name;
					} else {
						switch ( filter ) {
						case "EQUAL_TO":
							title = rule.field + " = " + rule.value[ 0 ];
							break;
						case "GREATER_THAN":
							title = rule.field + " > " + rule.value[ 0 ];
							break;
						case "LESS_THAN":
							title = rule.field + " < " + rule.value[ 0 ];
							break;
						case "BETWEEN":
							title = rule.field + " " + rule.value[ 0 ] + " - " + rule.value[ 1 ];
							break;
						}
					}
				} else if ( rule && rule.name ) {
					title = rule.name;
				}

				symbolList += "<li>" +
					"<div class='geomap-legend-element'>" +
						"<div id='" + spanId + "' class='geomap-legend-symbol'></div>" +
						"<span class='geomap-legend-symbol-text'><small>" + title + "</small></span>" +
					"</div>" +
				"</li>";

				symbolItems.push( { "id": spanId, "feature": feature, "symbolizer": symbolizer } );
			}

		}

	}  else if ( typeof style !== "undefined" && style.type === "unique" ) {

		j = 0;

		for ( var obj in style.init ) {
			spanId = "ls_" + layerName + "_" + j;
			symbolizer = style.init[ obj ];
			title = symbolizer.name ? symbolizer.name : obj;

			symbolList += "<li>" +
				"<div class='geomap-legend-element'>" +
					"<div id='" + spanId + "' class='geomap-legend-symbol'></div>" +
					"<span class='geomap-legend-symbol-text'><small>" + title + "</small></span>" +
				"</div>" +
			"</li>";

			symbolItems.push( { "id": spanId, "feature": feature, "symbolizer": symbolizer } );

			j += 1;
		}
	} else if ( typeof style !== "undefined" && style.type === "symbol" ) {

		spanId = "ls_" + layerName + "_0";
		symbolizer = style.init;
		title = symbolizer.name ? symbolizer.name : "";

		symbolList += "<li>" +
			"<div class='geomap-legend-element'>" +
				"<div id='" + spanId + "' class='geomap-legend-symbol'></div>" +
				"<span class='geomap-legend-symbol-text'><small>" + title + "</small></span>" +
			"</div>" +
		"</li>";

		symbolItems.push( { "id": spanId, "feature": feature, "symbolizer": symbolizer } );

	} else {

		spanId = "ls_" + layerName + "_0";
		symbolizer = {
			"fillColor": style.fillColor,
			"strokeColor": style.strokeColor,
			"strokeWidth": style.strokeWidth,
			"strokeDash": style.strokeDash
		};

		symbolList += "<li>" +
			"<div class='geomap-legend-element'>" +
				"<div id='" + spanId + "' class='geomap-legend-symbol'></div>" +
				"<span class='geomap-legend-symbol-text'><small>" + title + "</small></span>" +
			"</div>" +
		"</li>";

		symbolItems.push( { "id": spanId, "feature": feature, "symbolizer": symbolizer } );

	}

	// append the list to the legend
	$( "#sb_" + layerName ).html( "<ul class='list-unstyled'>" + symbolList + "</ul>" );

	// create the legend symbols
	for ( i = 0, len = symbolItems.length; i !== len; i += 1 ) {
		var symbol = symbolItems[ i ];
		_this.getSymbol( symbol.id, symbol.feature, symbol.symbolizer );
	}

};

/**
 * Get legend symbols
 */
MapLegend.prototype.getSymbol = function( id, feature, symbolizer ) {

	var colors = defaultColors(), //TODO: symbolizer must have colors else legend won't match

		featureType = feature && feature.getGeometry() ? feature.getGeometry().getType() : "Polygon",
		opacity = symbolizer.fillOpacity ? symbolizer.fillOpacity : symbolizer.graphicOpacity ? symbolizer.graphicOpacity : 1.0,
		fillColor = symbolizer.fillColor ? hexToRGB( symbolizer.fillColor, opacity ) : colors.transparent,
		radius = symbolizer.pointRadius ? symbolizer.pointRadius : 5,
		strokeColor = symbolizer.strokeColor ? hexToRGB( symbolizer.strokeColor ) : colors.transparent,
		strokeWidth = symbolizer.strokeWidth ? symbolizer.strokeWidth : 1,
		strokeDash = symbolizer.strokeDash ? symbolizer.strokeDash : [ 1, 0 ],
		externalGraphic = symbolizer.externalGraphic ? symbolizer.externalGraphic : null,
		graphicName = symbolizer.graphicName ? symbolizer.graphicName : null,
		graphicHeight = symbolizer.graphicHeight ? symbolizer.graphicHeight : 30,
		graphicWidth = symbolizer.graphicWidth ? symbolizer.graphicWidth : 30,
		height = graphicHeight < radius * 2 ? radius * 2 : graphicHeight,
		width = graphicWidth < radius * 2 ? radius * 2 : graphicWidth,
		pseudoFeature, rendererMap, source, style;

	switch ( featureType ) {
	case "Polygon" || "MultiPolygon":
		pseudoFeature = new ol.Feature( {
			geometry: new ol.geom.Polygon( [ [ [ -10, -7 ], [ 10, -7 ],
					[ 10, 7 ], [ -10, 7 ] ] ] )
		} );
		style = getPolygonStyle( {
			fill: new ol.style.Fill( {
				color: fillColor
			} ),
			stroke: new ol.style.Stroke( {
				color: strokeColor,
				width: strokeWidth,
				lineDash: strokeDash
			} )
		} );
		pseudoFeature.setStyle( style );
		break;
	case "Point" || "MultiPoint":
		pseudoFeature = new ol.Feature( {
			geometry: new ol.geom.Point( [ 0, 0 ] )
		} );
		if ( graphicName ) {
			style = getSymbolStyle( {
				symbol: graphicName,
				fill: new ol.style.Fill( { color: fillColor } ),
				stroke: new ol.style.Stroke( { color: strokeColor, lineDash: strokeDash } ),
				radius: radius
			} );
		} else if ( externalGraphic ) {
			style = getIconStyle( {
				src: externalGraphic,
				opacity: opacity,
				size: [ graphicWidth, graphicHeight ]
			} );
		} else {
			style = getPointStyle( {
				radius: radius,
				fill: new ol.style.Fill( { color: fillColor } ),
				stroke: new ol.style.Stroke( { color: strokeColor, width: strokeWidth, lineDash: strokeDash } )
			} );
		}
		pseudoFeature.setStyle( style );
		break;
	case "LineString" || "MultiLineString":
		pseudoFeature = new ol.Feature( {
			geometry: new ol.geom.LineString( [ [ -9, -4 ], [ -4, 4 ], [ 4, -4 ], [ 9, 4 ] ] )
		} );
		style = getLineStyle( {
			stroke: new ol.style.Stroke( {
				color: strokeColor,
				width: strokeWidth,
				lineDash: strokeDash
			} )
		} );
		pseudoFeature.setStyle( style );
		break;
	default:
		pseudoFeature = new ol.Feature( {
			geometry: new ol.geom.Polygon( [ [ [ -10, -7 ], [ 10, -7 ], [ 10, 7 ], [ -10, 7 ] ] ] )
		} );
		style = getPolygonStyle( {
			fill: new ol.style.Fill( {
				color: fillColor
			} ),
			stroke: new ol.style.Stroke( {
				color: strokeColor,
				width: strokeWidth,
				lineDash: strokeDash
			} )
		} );
		pseudoFeature.setStyle( style );
		break;
	}

	// create a map for the symbol
	rendererMap = new ol.Map( {
		controls: [],
		interactions: [],
		layers: [ new ol.layer.Vector( {
			source: new ol.source.Vector()
		} ) ]
	} );

	if ( rendererMap ) {
		this.symbolMapArray.push( rendererMap );
		source = rendererMap.getLayers().item( 0 ).getSource();
		source.clear();
		source.addFeature( pseudoFeature );
	}

	rendererMap.setTarget( id );
	setRendererDimensions( id, rendererMap, pseudoFeature, width, height );

};

/**
 * Refresh the legend symbols
 */
MapLegend.prototype.refresh = function() {

	if ( this.symbolMapArray.length !== 0 ) {
		var len, map;
		for ( len = this.symbolMapArray.length - 1; len !== -1; len -= 1 ) {
			map = this.symbolMapArray[ len ];
			if ( $( "#" + map.getTarget() ).is( ":visible" ) ) {
				map.updateSize();
			}
		}
	}

};

ol.inherits( GeolocationControl, ol.control.Control );
ol.inherits( HelpControl, ol.control.Control );
ol.inherits( GeocodeControl, ol.control.Control );


/**
 * Event Geomap filter
 *
 * Apply AOI and Layer filter
 * - only the <select> element is currently supported
 *
 */
wb.doc.on( "submit", ".wb-geomap-filter", function( event ) {

	event.preventDefault();

	var $form = $( this ),
		map = document.getElementById( $form.data( "bind-to" ) ).geomap;

	// Loops though the form group
	$form.find( "select[data-filter]" ).each( function() {
		var $elm = $( this ),
			$optSelected = $elm.find( "option:selected" ),
			value = $optSelected.val(),
			tpFilter = $elm.attr( "data-filter" ); // "layer || aoi"

		// if aoi => There will be 4 coordinate space separated (Sequence: N E S W)
		if ( tpFilter === "aoi" ) {
			map.zoomAOI( value );
		}

		// if layer => The layer name
		if ( tpFilter === "layer" ) {
			map.showLayer( value, true );
		}
	} );
} );

/*
 * Reset the view on the map and manually reset the layer filter
 *
 */
wb.doc.on( "click", ".wb-geomap-filter [type=reset]", function( ) {

	var $form = $( this.form ),
		geomap = document.getElementById( $form.data( "bind-to" ) ).geomap,
		OLmap = geomap.map,
		mapGetView = OLmap.getView();

	OLmap.getView().fit( mapGetView.calculateExtent( OLmap.getSize() ), OLmap.getSize() );

	$form.find( "select[data-filter=layer] option" ).each( function() {
		if ( this.defaultSelected ) {
			geomap.showLayer( this.value, true );
		}
	} );
	$form.find( "select[data-filter=aoi] option" ).each( function() {
		if ( this.defaultSelected ) {
			geomap.zoomAOI( this.value );
		}
	} );
} );


} )( jQuery, window, document, wb );
