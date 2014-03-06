/*
 * @title WET-BOEW Geomap
 * @overview Displays a dynamic map over which information from additional sources can be overlaid.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
/*global wet_boew_geomap: false, OpenLayers: false, proj4: false*/
(function( $, window, wb ) {
"use strict";

var selector = ".wb-geomap",
	$document = wb.doc,

	// timeout for overlay loading in milliseconds
	overlayTimeout = 2000,
	uniqueId = 0,
	mapArray = [],
	debug = false,
	/*mapSample, */selectedFeature, geomap, i18n, i18nText,
	locStyle,
	locLayer,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		config: {
			controls: [],
			autoUpdateSize: true,
			fractionalZoom: true,
			theme: null
		},
		overlays: [],
		features: [],
		tables: [],
		useScaleLine: false,
		useMousePosition: false,
		debug: false,
		useLegend: false,
		useTab: false,
		useMapControls: true,
		useGeolocation: false
	},

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var elm = event.target,
			className = elm.className,
			settings = {},
			$elm, modeJS, overrides;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			$elm = $( elm );
			modeJS = wb.getMode() + ".js";

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			wb.remove( selector );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					close: i18n( "close" ),
					colon: i18n( "colon" ),
					hiddenLayer: i18n( "geo-hdnlyr" ),
					toggleLayer: i18n( "geo-tgllyr" ),
					labelSelect: i18n( "geo-lblsel" ),
					select: i18n( "geo-sel" ),
					zoomFeature: i18n( "geo-zmfeat" ),
					zoomin: i18n( "geo-zmin" ),
					zoomout: i18n( "geo-zmout" ),
					zoomwrld: i18n( "geo-zmwrld" ),
					baseMapTitle: i18n( "geo-bmapttl" ),
					baseMapURL: i18n( "geo-bmapurl" ),
					baseMapURLTxt: i18n( "geo-bmapurltxt" ),
					scaleline: i18n( "geo-sclln" ),
					mouseposition: i18n( "geo-msepos" ),
					access: i18n( "geo-ally" ),
					accessTitle: i18n( "geo-allyttl" ),
					attribLink: i18n( "geo-attrlnk" ),
					attribTitle: i18n( "geo-attrttl" ),
					ariaMap: i18n( "geo-ariamap"),
					geoLocationURL: i18n( "geo-locurl" ),
					geoLocationPlaceholder: i18n( "geo-loc-placeholder" ),
					geoLocationLabel: i18n( "geo-loc-label" ),
					aoiNorth: i18n( "geo-aoi-north" ),
					aoiEast: i18n( "geo-aoi-east" ),
					aoiSouth: i18n( "geo-aoi-south" ),
					aoiWest: i18n( "geo-aoi-west" ),
					aoiInstructions: i18n( "geo-aoi-instructions" ),
					aoiBtnDraw: i18n( "geo-aoi-btndraw" ),
					aoiBtnClear: i18n( "geo-aoi-btnclear" ),
					aoiBtnClose: i18n( "geo-aoi-btnclose" )
				};
			}

			// Class-based overrides - use undefined where no override should occur
			overrides = {
				useScaleLine: className.indexOf( "scaleline" ) !== -1 ? true : undefined,
				useMousePosition: className.indexOf( "position" ) !== -1 ? true : undefined,
				debug: className.indexOf( "debug" ) !== -1 ? true : undefined,
				useLegend: className.indexOf( "legend" ) !== -1,
				useTab: className.indexOf( "tab" ) !== -1,
				useMapControls: className.indexOf( "static" ) !== -1 ? false : true,
				useGeolocation: className.indexOf( "geolocation" ) !== -1 ? true : false
			};
			
			// Merge default settings with overrides from the selected plugin element.
			// There may be more than one, so don't override defaults globally!
			$.extend( settings, defaults, overrides, wb.getData( $elm, "wet-boew" ) );

			// Bind the merged settings to the element node for faster access in other events.
			$elm.data( { settings: settings } );

			// Store the debug setting globally
			debug = settings.debug;

			Modernizr.load([ {
				// For loading multiple dependencies
				both: [
					"site!deps/proj4" + modeJS,
					"site!deps/openlayers" + modeJS
				],
				complete: function() {

					// Set the proj4 dependency name to match OpenLayers
					window.Proj4js = {
						Proj: function( code ) {
							return proj4( window.Proj4js.defs[ code ] );
						},
						defs: proj4.defs,
						transform: proj4
					};
					
					// Set the language for OpenLayers
					OpenLayers.Lang.setCode( document.documentElement.lang );

					// Set the image path for OpenLayers
					OpenLayers.ImgPath = wb.getPath( "/assets" ) + "/";
					
					// Add projection for default base map
					proj4.defs( "EPSG:3978", "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");
					  
					if ( debug ) {
						Modernizr.load( [ {
							load: "site!../assets/geomap-debug" + modeJS
						} ] );

						$document.trigger( "debug.wb-geomap" );
					}

					// Set the Geomap object
					uniqueId += 1;
					geomap = setGeomapObject( $elm );

					// Load configuration file
					if ( settings.layersFile ) {
						$.ajax({
							url: settings.layersFile,
							dataType: "script",
							async: false,
							success: function() {

								// Extend settings with data loaded from the
								// configuration file (through wet_boew_geomap)
								$.extend( settings, wet_boew_geomap );
																
								createMap( geomap, settings );
								if ( debug ) {
									$document.trigger( "overlayLoad.wb-geomap" );
								}
							},
							error: function() {
								if ( debug ) {
									$document.trigger( "overlayNotLoad.wb-geomap" );
								}
							}
						});
					} else {
						createMap( geomap, settings );
						if ( debug ) {
							$document.trigger( "overlayNotSpecify.wb-geomap" );
						}
					}

					// If there are overlays, wait before calling the plugins
					if ( !geomap.overlays ) {
						refreshPlugins( geomap );
					}
				}
			} ]);
		}
	},
			
	/*
	 * Set the geomap array that will be use to generate Geomap
	 */
	setGeomapObject = function( $elm ) {
		var geomap = {
				uniqueId: uniqueId,
				mapid: $elm.attr( "id" ),
				map: null,
				selectControl: null,
				showAttribNRCan: false,
				queryLayers: [],
				overlays: 0,
				overlaysLoaded: 0,
				overlaysLoading: {} // status of overlayLoading (true = still loading)
			},
			$elmMap = $elm.find( ".wb-geomap-map" );

		// Test to see if wb-geomap-map class exist. If not, we need to set the object differently.
		// this other method has been deprecated in version v3.1.2
		if ( $elmMap.length !== 0 ) {
			geomap.gmap = $elmMap.attr( "id", "geomap-map-" + uniqueId ).height( $elmMap.width() * 0.8 );
			geomap.glegend = $elm.find( ".wb-geomap-legend" ).attr( "id", "geomap-legend-" + uniqueId );
			geomap.glayers = $elm.find( ".wb-geomap-layers" ).attr( "id", "geomap-layers-" + uniqueId );
		} else {
			geomap.gmap = $elm.attr( "id", "geomap-map-" + uniqueId ).height( $elm.width() * 0.8 ).addClass( "wb-geomap-map" );
			geomap.glegend = $( ".wb-geomap-legend" ).attr( "id", "geomap-legend-" + uniqueId );
			geomap.glayers = $( ".wb-geomap-layers" ).attr( "id", "geomap-layers-" + uniqueId );
		}

		return geomap;
	},

	addPanZoomBar = function( geomap ) {
		var panZoomBar = new OpenLayers.Control.PanZoomBar();
		OpenLayers.Util.extend(panZoomBar, {
			draw: function() {

				// Initialize our internal div
				var oButtons = this,
					buttonArray = [
						"zoomin",
						"zoomout",
						"zoomworld"
					],
					buttonImg = [
						"zoom-plus-mini",
						"zoom-minus-mini",
						"zoom-world-mini"
					],
					len = buttonArray.length,
					i;

				OpenLayers.Control.prototype.draw.apply( oButtons, arguments );

				// Place the controls
				oButtons.buttons = [];

				for ( i = 0; i !== len; i += 1 ) {
					oButtons._addButton( buttonArray[ i ], buttonImg[ i ] + ".png" );
				}

				return oButtons.div;
			}
		});

		geomap.map.addControl( panZoomBar );
		setPanZoomBar( geomap );
	},

	setPanZoomBar = function( geomap ) {

		/*
		 * Add alt text to map controls and make tab-able
		 * TODO: Fix in OpenLayers so alt text loaded there rather than overriden here (needs to be i18n)
		 */
		var controlBar = geomap.gmap.find( ".olControlPanZoomBar" )[ 0 ],
			controls = controlBar.getElementsByTagName( "div" ),
			len = controls.length,
			i, control, img, altTxt, actn;

		controlBar.setAttribute("role", "toolbar");
		for ( i = 0; i !== len; i += 1 ) {
			control = controls[ i ];
			img = control.getElementsByTagName( "img" )[ 0 ];

			if ( img ) {
				actn = control.action;

				// Add alt text
				altTxt = i18nText[ actn ];
				control.setAttribute( "aria-label", altTxt );
				control.setAttribute( "title", altTxt );
				control.setAttribute( "role", "button" );
				control.className += " olControl" + actn;
				control.tabIndex = 0;
				img.setAttribute( "alt", altTxt );
				img.className += " olControl" + actn;
			}
		}
	},

	/*
	 * Map feature select
	 */
	onFeatureSelect = function( feature ) {
		$( "#" + feature.id.replace( /\W/g, "_" ) ).addClass( "background-highlight" );
		$( "#cb_" + feature.id.replace( /\W/g, "_" ) ).prop( "checked", true );
	},

	/*
	 *	Map feature unselect
	 */
	onFeatureUnselect = function( feature ) {
		$( "#" + feature.id.replace( /\W/g, "_" ) ).removeClass( "background-highlight" );
		$( "#cb_" + feature.id.replace( /\W/g, "_" ) ).prop( "checked", false );

		// If there is a popup attached, hide it.
		if ( feature.popup && feature.popup.visible() ) {
			feature.popup.hide();
		}
	},

	/*
	 *	Select and unselect map feature on click
	 */
	onFeatureClick = function( feature ) {
		var selectControl = feature.layer.map.getControlsByClass( "OpenLayers.Control.SelectFeature" )[ 0 ];

		if ( typeof feature._lastHighlighter !== "undefined" ) {
			selectControl.unselect(feature);
		} else {
			selectControl.select(feature);

			if ( feature.layer.popups !== undefined ) {

				// If a popup is already shown, hide it
				if ( selectedFeature !== undefined && selectedFeature.popup !== null && selectedFeature.popup.visible() ) {
					selectedFeature.popup.hide();
				}

				// If no popup, create it, otherwise show it.
				selectedFeature = feature;
				if ( feature.popup === null ) {
					createPopup( feature );
				} else {
					feature.popup.toggle();
				}
			}
		}
	},

	/*
	 *	Create popup
	 */
	createPopup = function( feature ) {

		var popupsInfo = feature.layer.popupsInfo,
			featureid = feature.id.replace( /\W/g, "_" ),
			buttonText = i18nText.close,
			colon = i18nText.colon,
			mapSize = feature.layer.map.size,
			content = "<h3>" + document.getElementById( feature.layer.name ).getAttribute( "aria-label" ) + "</h3>",
			id, height, width, close, name, popup, icon, regex;

		if ( popupsInfo ) {
			id = ( typeof popupsInfo.id !== "undefined" ? popupsInfo.id : "popup_" ) + "_" + featureid;
			height = typeof popupsInfo.height !== "undefined" ? popupsInfo.height : mapSize.size.h / 2;
			width = typeof popupsInfo.width !== "undefined" ? popupsInfo.width : mapSize.size.w / 2;
			close = typeof popupsInfo.width !== "undefined" ? popupsInfo.close : true;
			content += popupsInfo.content;

			// update content from feature
			for ( name in feature.attributes ) {
				if ( feature.attributes.hasOwnProperty( name ) && name.length !== 0 ) {
					regex = new RegExp( "_" + name, "igm" );
					content = content.replace( regex, feature.attributes[ name ] );
				}
			}
		} else {
			id = "popup_" + featureid;
			height = mapSize.h / 2;
			width = mapSize.w / 2;
			close = true;

			// Update content from feature
			for ( name in feature.attributes ) {
				if ( feature.attributes.hasOwnProperty( name ) && name.length !== 0 ) {
					content += "<p><strong>" + name + colon + "</strong><br />" + feature.attributes[ name ] + "</p>";
				}
			}
		}

		// create the popup
		popup = new OpenLayers.Popup.FramedCloud(
			id,
			feature.geometry.getBounds().getCenterLonLat(),
			new OpenLayers.Size( width, height ),
			content,
			null,
			close,
			null
		);

		popup.maxSize = new OpenLayers.Size( width, height );
		feature.popup = popup;
		feature.layer.map.addPopup( popup );

		// add wb-icon class
		icon = document.createElement( "span" );
		icon.className = "glyphicon glyphicon-remove-circle close_" + featureid;
		icon.setAttribute( "aria-label", buttonText );
		icon.setAttribute( "title", buttonText );
		icon.setAttribute( "role", "button");
		icon.setAttribute( "tabindex", "0" );
		feature.popup.closeDiv.appendChild( icon );

		$( ".close_" + featureid).on( "keydown click", function( event ) {
			var which = event.which;
			if ( event.type === "keydown" ) {
				if ( which === 13) {
					feature.popup.hide();
				}
			} else if ( !which || which === 1 ) {
				feature.layer.map.getControlsByClass( "OpenLayers.Control.SelectFeature" )[ 0 ].unselect( selectedFeature );
			}
		});
	},

	/*
	 * Get the OpenLayers map object
	 */
	getMap = function( id ) {
		var map, mapArrayItem, i;

		for ( i = mapArray.length - 1; i !== -1; i -= 1 ) {
			mapArrayItem = mapArray[ i ];
			if ( mapArrayItem.id === id ) {
				map = mapArrayItem;
				break;
			}
		}

		return map;
	},

	/*
	 *	Create legend
	 */
	createLegend = function() {

		// Create legend div if not there
		if ( debug && !( $( ".wb-geomap-legend" ).length ) ) {
			$document.trigger( "warningLegend.wb-geomap" );
		}
	},

	/*
	 *	Create layer holder to add all tabs data (HTML and overlay) and overlay data.
	 */
	createLayerHolder = function( geomap, tab ) {

		// User wants tabs
		if ( tab ) {

			// User has specified where they want to put the tabs
			var $tabs = geomap.glayers.find( ".wb-geomap-tabs" );
			if ( $tabs.length !== 0 ) {

				$tabs
					.attr({
						"class": "wb-tabbedinterface auto-height-none",
						id: "geomap-tabs-" + uniqueId
					});

			// User hasn't specified where they want the tabs
			} else {
				geomap
					.glayers
						.attr( "id", "geomap-tabs-" + uniqueId )
						.append( "<div class='clear'></div><div class='wb-geomap-tabs wb-tabs auto-height-none' style='width: " +
							geomap.glayers.width() + "px;'>" );
			}
		}
	},

	/*
	 * Create a table for vector features added in Load Overlays
	 */
	createTable = function( index, title, caption, datatable ) {

		return $( "<table class='table" + ( datatable ? " wb-tables" : "" ) +
			"' aria-label='" + title + "' id='overlay_" + index + "'>" + "<caption>" +
			caption + "</caption><thead></thead><tbody></tbody>" +
			(datatable ? "<tfoot></tfoot></table><div class='clear'></div>" : "</table>" ));
	},

	/*
	 * Random Color Generator
	 */
	randomColor = function() {
		var letters = "0123456789ABCDEF".split( "" ),
			color = "#",
			i;
		for (i = 0; i !== 6; i += 1 ) {
			color += letters[ Math.round( Math.random() * 15 ) ];
		}
		return color;
	},

	/*
	 * Add layer data
	 */
	addLayerData = function( geomap, featureTable, enabled, olLayerId, tab ) {
		
		// Add layer to legend
		if ( geomap.glegend.length !== 0 ) {
			addToLegend( geomap, featureTable, enabled, olLayerId );
		}

		var $divLayer = geomap.glayers,
			featureTableId = featureTable[0].id,
			$layerTab = $( "<div id='tabs_" + featureTableId + "'>" ),
			title = featureTable[ 0 ].attributes[ "aria-label" ].value,
			$layerTitle = $( "<h3 class='background-light'>" + title + "</h3>" ),
			$alert = $( "<div id='msg_" + featureTableId + "' class='module-attention module-simplify margin-top-medium margin-bottom-medium'><p>" +
				i18nText.hiddenLayer + "</p></div>" );

		if ( debug && ( $divLayer.length === 0 ) ) {
			$document.trigger( "layersNotSpecify.wb-geomap" );
		}

		// If tabs are specified
		if ( tab && $( ".wb-geomap-tabs" ).length !== 0 ) {
			addToTabs( geomap, featureTable, enabled, olLayerId );
		// Tabs are not specified
		} else {
			$layerTab.append( $layerTitle, featureTable );
			$divLayer.append("<div class='col-md-12'>" + $layerTab.html() + "</div>", "<div class='clear'></div>");
			// if layer visibility is false, add the hidden layer message and hide the table data
			if ( !enabled ) {
				$layerTab.append( $alert );
				featureTable.fadeOut();
			}
		}

		if ( debug && tab && $( ".wb-geomap-tabs" ).length === 0 ) {
			$document.trigger( "warningTab.wb-geomap" );
		}
	},

	/*
	 * Create Legend
	 */
	addToLegend = function( geomap, featureTable, enabled, olLayerId ) {
		
		var $featureTable = $(featureTable),
			featureTableId = featureTable[0].id,
			$fieldset, $ul, $checked, $chkBox, $label, $li;
		
		if ( typeof geomap.glegend !== "undefined" ) {

			// If no legend or fieldset add them
			$fieldset = geomap.glegend.find( "fieldset" );
			if ($fieldset.length === 0 ) {
				$fieldset = $( "<fieldset name='legend'><legend class='wb-inv'>" +
					i18nText.toggleLayer + "</legend></fieldset>" ).appendTo( geomap.glegend );
			}

			$checked = enabled ? "checked='checked'" : "";

			$ul = geomap.glegend.find( "ul" );
			if ( $ul.length === 0 ) {
				$ul = $( "<ul class='list-unstyled'></ul>" ).appendTo( $fieldset );
			}

			$chkBox = $( "<input type='checkbox' id='cb_" + featureTableId + "' value='" + featureTableId + "' " + $checked + " />" ); //.appendTo( '<div class="geomap-legend-chk"></div>' );
			
			$chkBox.on( "change", function() {
				var layer = geomap.map.getLayer( olLayerId ),
					visibility = geomap.glegend.find( "#cb_" + featureTableId ).prop( "checked" ) ? true : false,
					$table = geomap.glayers.find( "#" + featureTableId ),
					$parent = $table.parent(),
					$alert;
				layer.setVisibility( visibility );

				if ( !$parent.hasClass( "dataTables_wrapper" ) ) {
					$parent = $table;
				}
				
				$alert = $("#msg_" + featureTableId);

				if ( $alert.length !== 0 ) {
					$alert.fadeToggle();
				} else {
					$parent.after( "<div id='msg_" + featureTableId + "'><p>" + i18nText.hiddenLayer + "</p></div>" );
				}

				$parent.css( "display", ( visibility ? "table" : "none" ) );
			});

			$label = $( "<label>", {
				"for": "cb_" + featureTableId,
				text: $featureTable.attr( "aria-label" )
			}).prepend( $chkBox );
			
			$li = $( "<li class='checkbox'>").append($label, "<div id='sb_" + featureTableId + "'></div>" );
			
			$ul.append( $li );

		}
	},

	/*
	 * Add the layer symbology to the legend
	 */
	symbolizeLegend = function( geomap ) {
		var len = geomap.map.layers.length,
			colon = i18nText.colon,
			ruleLen, $symbol, symbolText, layer, style, styleDefault,
			filter, filterType, symbolizer, i, j;
		
		for ( i = 0; i !== len; i += 1 ) {
			layer = geomap.map.layers[ i ];
			if ( !layer.isBaseLayer ) {
				$symbol = $( "#sb_" + layer.name );
				symbolText = "";

				if ( $symbol.length ) {
					style = layer.styleMap.styles[ "default" ];
					styleDefault = style.defaultStyle;
					ruleLen = style.rules.length;

					if ( ruleLen ) {
						symbolText += "<ul class='list-unstyled'>";
						for ( j = 0; j !== ruleLen; j += 1 ) {
							
							filter = style.rules[ j ].filter;
							filterType = filter.type;
							symbolizer = style.rules[ j ].symbolizer;

							if ( filterType === "==" ) {
								filterType = colon;
							}

							symbolText += "<li class='margin-bottom-medium'>" + filter.property + " ";
							if ( filter.value !== null ) {
								symbolText += ( filterType + " " + filter.value + getLegendSymbol( symbolizer ) + "</li>" );
							} else {
								symbolText += ( filter.lowerBoundary + " " + filterType + " " + filter.upperBoundary + "</label>" +
									getLegendSymbol(symbolizer) + "</li>" );
							}
						}
						symbolText += "</ul>";
					} else if ( typeof styleDefault.fillColor !== "undefined" ) {
						symbolText += getLegendSymbol( styleDefault );
					} else if ( typeof styleDefault.externalGraphic !== "undefined" ) {
						symbolText += getLegendGraphic( styleDefault );
					}

					$symbol.append( symbolText );
				}
			}
		}
	},

	/*
	 * Get the div object with the proper style
	 */
	getLegendSymbol = function( style ) {
		var symbolStyle = "",
			fillColor = style.fillColor,
			strokeColor = style.strokeColor,
			fillOpacity = style.fillOpacity;

		if ( typeof fillColor !== "undefined" ) {
			symbolStyle += "background-color: " + fillColor + ";";
		}

		if ( typeof strokeColor !== "undefined" ) {
			symbolStyle += "border-style: solid; border-width: 2px; border-color: " + strokeColor + ";";
		}

		if (typeof fillOpacity !== "undefined") {
			symbolStyle += "opacity: " + fillOpacity + ";";
		}

		return "<div class='geomap-legend-symbol'" + ( symbolStyle !== "" ? " style='" +
			symbolStyle + "'/>" : "/>" );
	},

	getLegendGraphic = function( style, alt ) {
		var symbolStyle = "",
			altText = typeof alt !== "undefined" ? alt : "",
			graphicOpacity = style.graphicOpacity,
			pointRadius = style.pointRadius,
			graphicHeight = style.graphicHeight,
			graphicWidth = style.graphicWidth;

		if ( typeof graphicOpacity !== "undefined" ) {
			symbolStyle += "opacity: " + graphicOpacity + ";";
		}

		if ( typeof pointRadius !== "undefined" ) {
			symbolStyle += "height: " + pointRadius + "px; width: " + pointRadius + "px;";
		} else if ( ( typeof graphicHeight !== "undefined" ) && ( typeof graphicWidth !== "undefined" ) ) {
			symbolStyle += "height: " + graphicHeight + "px; width: " + graphicWidth + "px;";
		}

		return "<img src='" + style.externalGraphic + "' alt='" + altText +
			( symbolStyle !== "" ? "' style='" + symbolStyle + "' />" : "' />" );
	},

	/*
	 * Create tabs - one for each layer added
	 */
	addToTabs = function( geomap, featureTable, enabled ) {
		var $div = geomap.glayers.find( ".wb-geomap-tabs" ),
			$tabs = $div.find( "ul" ),
			featureTableId = featureTable[0].id,
			$featureTable = $( featureTable ), $details,
			title = $featureTable.attr( "aria-label" );
		
		$details = $("<details>", {
			id: "details-" + featureTableId
		}).append("<summary>" + title + "</summary>", featureTable);

		$tabs.append( "<li><a href='#tabs_" + featureTableId + "'>" + title + "</a></li>" );
		
		$div.append( $details );
		if ( !enabled ) {
			$details.append( "<div id='msg_" + featureTableId + "'><p>" +
				i18nText.hiddenLayer + "</p></div>" );
			featureTable.fadeOut();
		}
	},

	/*
	 * Generate StyleMap
	 */
	getStyleMap = function( elm ) {
		var styleMap, filter, select, rules, rule, i, len, style, styleType,
			styleRule, styleSelect, ruleFilter, comparison,
			strokeColor = randomColor(),
			fillColor = strokeColor,
			defaultStyle = {
				strokeColor: strokeColor,
				fillColor: fillColor,
				fillOpacity: 0.5,
				pointRadius: 5,
				strokeWidth: 0.5
			},
			selectStyle = {
				strokeColor: "#00f",
				fillColor: "#00f",
				fillOpacity: 0.4,
				strokeWidth: 2.0
			},
			elmStyle = elm.style;

		// If style is supplied, create it. If not, create the default one.
		if ( typeof elmStyle !== "undefined" ) {

			// Check the style type (by default, no type are supplied).
			styleType = elmStyle.type;
			styleSelect = elmStyle.select;
			select = new OpenLayers.Style( ( typeof styleSelect !== "undefined" ? styleSelect : selectStyle ) );
			if ( styleType === "unique" ) {

				// Set the select style then the unique value.
				styleMap = new OpenLayers.StyleMap({
					select: select
				});
				styleMap.addUniqueValueRules( "default", elmStyle.field, elmStyle.init );
			} else if ( styleType === "rule" ) {

				// set the rules and add to the style
				rules = [];
				style = new OpenLayers.Style();
				styleRule = elmStyle.rule;
				len = styleRule.length;
				for ( i = 0; i !== len; i += 1 ) {

					// Set the filter
					rule = styleRule[ i ];
					ruleFilter = rule.filter;
					comparison = OpenLayers.Filter.Comparison;

					switch ( ruleFilter ) {
					case "LESS_THAN":
						filter = comparison.LESS_THAN;
						break;
					case "LESS_THAN_OR_EQUAL_TO":
						filter = comparison.LESS_THAN_OR_EQUAL_TO;
						break;
					case "GREATER_THAN_OR_EQUAL_TO":
						filter = comparison.GREATER_THAN_OR_EQUAL_TO;
						break;
					case "GREATER_THAN":
						filter = comparison.GREATER_THAN;
						break;
					case "BETWEEN":
						filter = comparison.BETWEEN;
						break;
					case "EQUAL_TO":
						filter = comparison.EQUAL_TO;
						break;
					case "NOT_EQUAL_TO":
						filter = comparison.NOT_EQUAL_TO;
						break;
					case "LIKE":
						filter = comparison.LIKE;
						break;
					}

					if ( ruleFilter !== "BETWEEN" ) {
						rules.push( new OpenLayers.Rule({
							filter: new OpenLayers.Filter.Comparison({
								type: filter,
								property: rule.field,
								value: rule.value[ 0 ]
							}),
							symbolizer: rule.init
						}));
					} else {
						rules.push( new OpenLayers.Rule({
							filter: new OpenLayers.Filter.Comparison({
								type: filter,
								property: rule.field,
								lowerBoundary: rule.value[ 0 ],
								upperBoundary: rule.value[ 1 ]
							}),
							symbolizer: rule.init
						}));
					}
				}
				style.addRules( rules );

				// Set the select style then the rules.
				styleMap = new OpenLayers.StyleMap({
					"default": style,
					select: select
				});
			} else {

				// Set the select style then the default.				
				styleMap = new OpenLayers.StyleMap({
					"default": new OpenLayers.Style( elmStyle.init ),
					select: select
				});
			}
		} else {
			styleMap = new OpenLayers.StyleMap({
				"default": new OpenLayers.Style( defaultStyle ),
				select: new OpenLayers.Style( selectStyle )
			});
		}

		return styleMap;
	},

	/*
	 * Create a linked table row
	 *
	 * TODO: provide for an array of configured table columns.
	 */
	createRow = function( geomap, context, zoom ) {

		// Add a row for each feature
		var $row = $( "<tr>" ),
			cols = [],
			$chkBox,
			attributes = context.feature.attributes,
			featureId = context.feature.id.replace( /\W/g, "_" );

		// Replace periods with underscores for jQuery!
		if ( context.type !== "head" ) {
			$row.attr( "id", featureId );
			$chkBox = $( "<td><label class='wb-inv' for='cb_" + featureId + "'>" + i18nText.labelSelect + "</label><input type='checkbox' id='cb_" + featureId + "'/></td>" );
			cols.push( $chkBox );
		}

		$.each( attributes, function( key, value ) {
			var $col;

			// TODO: add regex to replace text links with hrefs.
			if ( context.type === "head" ) {
				$col = $( "<th>" + key + "</th>" );
			} else {
				$col = $( "<td>" + value + "</td>" );
			}
			cols.push( $col );
		});

		if ( zoom ) {
			cols.push( addZoomTo( geomap, $row, context.feature, zoom ) );
		}

		if ( context.type !== "head" ) {
			$chkBox.on( "change", function() {
				if ( !$( "#cb_" + featureId ).prop( "checked" ) ) {
					geomap.selectControl.unselect( context.feature );
				} else {
					onFeatureClick( context.feature );
				}
			});
		}
		$row.append( cols );

		return $row;
	},

	/*
	 * Handle features once they have been added to the map
	 *
	 */
	onFeaturesAdded = function( geomap, $table, evt, zoom, datatable, mapControl ) {
		var rowObj = {
				type: "head",
				feature: evt.features[ 0 ]
			},
			$head = createRow( geomap, rowObj ),
			$foot = createRow( geomap, rowObj ),
			thSelect = ( "<th>" + i18nText.select + "</th>" ),
			$targetTable = $( "table#" + $table.attr( "id" ) ),
			$targetTableBody = $targetTable.find( "tbody" ),
			thZoom;
		if ( mapControl && zoom ) {
			thZoom = "<th>" + i18nText.zoomFeature + "</th>";
			$head.append( thZoom );
			$foot.append( thZoom );
		}

		$head.prepend( thSelect );
		$foot.prepend( thSelect );

		$targetTable
			.find( "thead" )
				.append( $head );
		$targetTable
			.find( "tfoot" )
				.append( $foot );
		$.each( evt.features, function( index, feature ) {
			var context = {
				type: "body",
				id: feature.id.replace( /\W/g, "_" ),
				feature: feature,
				selectControl: geomap.selectControl
			};
			$targetTableBody.append( createRow( geomap, context, zoom ) );
		});

		if ( datatable ) {
			$targetTable.addClass( "createDatatable" );
		}
	},

	/*
	 * Handle overlays once loading has ended
	 *
	 */
	onLoadEnd = function( geomap ) {

		// TODO: fix no alt attribute on tile image in OpenLayers rather than use this override
		geomap.gmap.find( ".olTileImage" ).attr( "alt", "" );

		// We need to call it here as well because if we use a config outside the domain it is called
		// before the table is created. We need to call it only once loading for all overlays has ended
		geomap.overlaysLoaded += 1;
		if ( geomap.overlays === geomap.overlaysLoaded ) {
			refreshPlugins( geomap );
			geomap.overlays = 0;
			geomap.overlaysLoaded = 0;
		}
	},

	/*
	 * Handle features once they have been added to the map for tabular data
	 *
	 */
	onTabularFeaturesAdded = function( geomap, feature, zoom, mapControl ) {

		// Find the row
		var featureId = feature.id.replace( /\W/g, "_" ),
			$tr = geomap.glayers.find( "tr#" + featureId ),
			$chkBox;

		// Add select checkbox
		$chkBox = $( "<td><label class='wb-inv' for='cb_" + featureId + "'>" + i18nText.labelSelect +
			"</label><input type='checkbox' id='cb_" + featureId + "'/></td>" );
		$tr.prepend( $chkBox );

		// Add zoom column
		if ( mapControl && zoom ) {
			$tr.append( addZoomTo( geomap, $tr, feature, zoom ) );
		}

		$chkBox.on( "change", function() {
			if ( !$( "#cb_" + featureId ).prop( "checked") ) {
				geomap.selectControl.unselect( feature );
			} else {
				onFeatureClick( feature );
			}
		});
	},

	/*
	 *	Add the zoom to column
	 *
	 */
	addZoomTo = function( geomap, row, feature, zoom ) {
		var val = "<td><a href='javascript:;' class='button' title='" +  i18nText.zoomFeature + "'>",
			$ref;

		if ( zoom[ 1 ].type === "text" ) {
			$ref = $( val + i18nText.zoomFeature + "</a></td>" );
		} else {
			$ref = $( val + "<span class='wb-icon-target'></span></a></td>" );
		}

		$ref.on( "click", "a", function( event ) {
			var which = event.which;

			// Ignore middle/right mouse buttons
			if ( !which || which === 1 ) {
				event.preventDefault();
				geomap.map.zoomToExtent( feature.geometry.bounds );
				geomap.gmap.trigger( "focus.wb" );
			}
		});

		return $ref;
	},

	/*
	 *	Set the default basemap
	 */
	setDefaultBaseMap = function( geomap, opts ) {
		var mapWidth = geomap.gmap.width(),
			offset,
			option = {
				matrixSet: "nativeTileMatrixSet",
				tileSize: new OpenLayers.Size( 256, 256 ),
				format: "image/jpg",
				style: "default",
				requestEncoding: "REST",
				isBaseLayer: true,
				isSingleTile: false,
				tileOrigin: new OpenLayers.LonLat( -3.46558E7, 3.931E7 ),
				zoomOffset: 0,
				resolutions: [
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
				]
			};

		if ( opts.debug ) {
			$document.trigger( "basemapDefault.wb-geomap" );
		}

		// In function of map width size, set the proper resolution and zoom offset
		if ( mapWidth > 260 && mapWidth <= 500 ) {
			option.zoomOffset = 1;
		} else if ( mapWidth > 500 && mapWidth <= 725 ) {
			option.zoomOffset = 2;
		} else if ( mapWidth > 725 && mapWidth <= 1175 ) {
			option.zoomOffset = 3;
		} else if ( mapWidth > 1175 && mapWidth <= 2300 ) {
			option.zoomOffset = 4;
		} else {
			option.zoomOffset = 5;
		}

		offset = option.zoomOffset;
		while (offset--) {
			option.resolutions.shift();
		}
		// Add the Canada Transportation Base Map (CBMT) data and text
		geomap.map.addLayer(new OpenLayers.Layer.WMTS({
			name: i18nText.baseMapTitle,
			url: i18nText.baseMapURL,
			layer: i18nText.baseMapTitle,
			matrixSet: "nativeTileMatrixSet",
			tileSize: option.tileSize,
			format: option.format,
			style: option.style,
			requestEncoding: option.requestEncoding,
			isBaseLayer: option.isBaseLayer,
			isSingleTile: option.isSingleTile,
			tileOrigin: option.tileOrigin,
			zoomOffset: option.zoomOffset,
			resolutions: option.resolutions,
			transitionEffect: "resize"
		}));

		geomap.map.addLayer(new OpenLayers.Layer.WMTS({
			name: i18nText.baseMapTitle,
			url: i18nText.baseMapURLTxt,
			layer: i18nText.baseMapTitle,
			matrixSet: "nativeTileMatrixSet",
			tileSize: option.tileSize,
			format: option.format,
			style: option.style,
			requestEncoding: option.requestEncoding,
			isBaseLayer: false,
			isSingleTile: option.isSingleTile,
			tileOrigin: option.tileOrigin,
			zoomOffset: option.zoomOffset,
			resolutions: option.resolutions
		}));
	},

	/*
	 * Set default map option
	 */
	setDefaultMapOptions = function() {

		// Use map options for the Canada Transportation Base Map (CBMT)
		var mapOptions = {
			maxExtent: new OpenLayers.Bounds( -2750000.0, -900000.0, 3600000.0, 4630000.0 ),
			restrictedExtent: new OpenLayers.Bounds( -2850000.0, -1000000.0, 3700000.0, 4730000.0 ),
			maxResolution: "auto",
			projection: "EPSG:3978",
			units: "m",

			// Only used by specific controls (i.e. MousePosition)
			displayProjection: new OpenLayers.Projection( "EPSG:4269" ),
			aspectRatio: 0.8,
			fractionalZoom: false,
			tileManager: null
		};

		return mapOptions;
	},

	/*
	 *	Add baseMap data
	 */
	addBasemapData = function( geomap, opts ) {
				
		var mapOptions = {},
			mapOpts,
			hasBasemap = ( typeof opts.basemap !== "undefined" && opts.basemap.length !== 0 ),
			basemap;

		// set aspect ratio
		geomap.gmap.height( geomap.gmap.width() * mapOptions.aspectRatio );
					
		if ( hasBasemap ) {
			basemap = opts.basemap;
			if (basemap.mapOptions) {
				mapOpts = basemap.mapOptions;
				try {
					mapOptions.maxExtent = new OpenLayers.Bounds( mapOpts.maxExtent.split( ",") );
					mapOptions.maxResolution = mapOpts.maxResolution;
					mapOptions.projection = mapOpts.projection;
					mapOptions.restrictedExtent = new OpenLayers.Bounds (mapOpts.restrictedExtent.split( "," ) );
					mapOptions.units = mapOpts.units;
					mapOptions.displayProjection = new OpenLayers.Projection( mapOpts.displayProjection );
					mapOptions.numZoomLevels = mapOpts.numZoomLevels;
					mapOptions.aspectRatio = mapOpts.aspectRatio;
					mapOptions.tileManager = null;
				} catch ( error ) {
					if ( opts.debug ) {
						$document.trigger( "baseMapMapOptionsLoadError.wb-geomap" );
					}
				}
			}
		} else {
			// Use map options for the Canada Transportation Base Map (CBMT)
			mapOptions = setDefaultMapOptions();
		}

		geomap.map = new OpenLayers.Map( geomap.gmap.attr( "id" ), $.extend( opts.config, mapOptions ) );
				
		// Check to see if a base map has been configured. If not add the
		// default base map (the Canada Transportation Base Map (CBMT))
		if ( hasBasemap ) {
			if ( !basemap.options ) {
				basemap.options = {};
			}

			basemap.options.isBaseLayer = true;

			if ( basemap.type === "wms" ) {
				geomap.map.addLayer(
					new OpenLayers.Layer.WMS(
						basemap.title,
						basemap.url,
						{
							layers: basemap.layers,
							version: basemap.version,
							format: basemap.format
						},
						basemap.options
					)
				);
			} else if ( basemap.type === "esri" ) {
				geomap.map.addLayer(
					new OpenLayers.Layer.ArcGIS93Rest(
						basemap.title,
						basemap.url
					)
				);
			}
		} else {
			setDefaultBaseMap( geomap, opts );
			geomap.showAttribNRCan = true;
		}
	},

	/*
	 *	Add overlay data
	 */
	addOverlayData = function( geomap, opts ) {
		var overlayData = opts.overlays,
			olLayer;
		if ( overlayData.length !== 0 ) {
			geomap.overlays = overlayData.length;
			$.each( overlayData, function( index, layer ) {
				var $table = createTable( index, layer.title, layer.caption, layer.datatable ),
					layerType = layer.type,
					layerTitle = layer.title,
					layerVisible = layer.visible,
					layerURL = layer.url;

				if ( layerType === "kml" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.HTTP( {
								url: layerURL,
								format: new OpenLayers.Format.KML( {
									extractStyles: !layer.style,
									extractAttributes: true,
									internalProjection: geomap.map.getProjectionObject(),
									externalProjection: new OpenLayers.Projection( "EPSG:4269" ),
									read: function( data ) {

										var items, row, $row, len, feature, atts, xmlDocument,
											i = 0,
											features = [],
											layerAttributes = layer.attributes,
											name;

										// When read from server, data is string instead of #document
										if ( typeof data === "string") {
										
											// With IE we cant use DOMParser
											if ( wb.ie ) {
												xmlDocument = new window.ActiveXObject( "Microsoft.XMLDOM" );
												xmlDocument.async = false;
												xmlDocument.loadXML( data );
												data = xmlDocument;
											} else {
												data = ( new DOMParser() ).parseFromString( data, "text/xml" );
											}
										}
										items = this.getElementsByTagNameNS( data, "*", "Placemark" );

										for ( len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											$row = $( row );
											feature = new OpenLayers.Feature.Vector();
											feature.geometry = this.parseFeature( row ).geometry;

											// Parse and store the attributes
											// TODO: test on nested attributes
											atts = {};
											for ( name in layerAttributes ) {
												if ( layerAttributes.hasOwnProperty( name ) ) {
													atts[ layerAttributes[ name ] ] = $row.find( name ).text();
												}
											}
											feature.attributes = atts;
											features.push( feature );
										}
										return features;
									}
								})
							}),
							eventListeners: {
								featuresadded: function( evt ) {
									onFeaturesAdded( geomap, $table, evt, layer.zoom, layer.datatable, opts.useMapControls );
									if ( geomap.overlaysLoading[ layerTitle ] ) {
										onLoadEnd( geomap );
									}
								},
								loadstart: function() {
									geomap.overlaysLoading[ layerTitle ] = true;
									setTimeout(function() {
										if (geomap.overlaysLoading[ layerTitle ] ) {
											onLoadEnd( geomap );
										}
									}, overlayTimeout );
								}
							},
							styleMap: getStyleMap( overlayData[ index ] )
						}
					);
					olLayer.name = "overlay_" + index;
					olLayer.datatable = layer.datatable;
					olLayer.popupsInfo = layer.popupsInfo;
					olLayer.popups = layer.popups;

					// To force featuresadded listener
					olLayer.visibility = true;
					geomap.queryLayers.push( olLayer );
					geomap.map.addLayer( olLayer );
					addLayerData( geomap, $table, layerVisible, olLayer.id, layer.tab );
					olLayer.visibility = layerVisible;
				} else if ( layerType === "atom" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.HTTP({
								url: layerURL,
								format: new OpenLayers.Format.Atom({
									read: function( data ) {
										var items = this.getElementsByTagNameNS( data, "*", "entry" ),
											row, $row, i, len, feature, atts, bnds, ring, geom, geomProj,
											features = [], layerAttributes = layer.attributes,
											name, g, projLatLon = new OpenLayers.Projection("EPSG:4326"),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											$row = $( row );
											g = this.parseFeature( row );
											feature = new OpenLayers.Feature.Vector();
											
											// if we have a bounding box polygon, densify the coordinates
											if (g.geometry.CLASS_NAME === "OpenLayers.Geometry.Polygon" && g.geometry.components[ 0 ].components.length === 5) {
												bnds = densifyBBox(
													g.geometry.components[ 0 ].components[ 1 ].x,
													g.geometry.components[ 0 ].components[ 1 ].y,
													g.geometry.components[ 0 ].components[ 3 ].x,
													g.geometry.components[ 0 ].components[ 3 ].y
												);
													
												ring = new OpenLayers.Geometry.LinearRing( bnds );
												geom = new OpenLayers.Geometry.Polygon( ring );
												geomProj = geom.transform( projLatLon, projMap );
												
												feature.geometry = geomProj;
											} else {
												feature.geometry = this.parseFeature( row ).geometry.transform( projLatLon, projMap );
											}

											// Parse and store the attributes
											// TODO: test on nested attributes
											atts = {};
											for ( name in layerAttributes ) {
												if (layerAttributes.hasOwnProperty( name ) ) {
													atts[ layerAttributes[ name ] ] = $row.find ( name ).text();
												}
											}
											feature.attributes = atts;
											features.push( feature );
										}
										return features;
									}
								})
							}),
							eventListeners: {
								featuresadded: function( evt ) {
									onFeaturesAdded( geomap, $table, evt, layer.zoom, layer.datatable, opts.useMapControls );
									if ( geomap.overlaysLoading[ layerTitle ] ) {
										onLoadEnd( geomap );
									}
								},
								loadstart: function() {
									geomap.overlaysLoading[ layerTitle ] = true;
									setTimeout(function() {
										if ( geomap.overlaysLoading[ layerTitle ] ) {
											onLoadEnd( geomap );
										}
									}, overlayTimeout );
								}
							},
							styleMap: getStyleMap( overlayData[ index ] )
						}
					);
					olLayer.name = "overlay_" + index;
					olLayer.datatable = layer.datatable;
					olLayer.popupsInfo = layer.popupsInfo;
					olLayer.popups = layer.popups;

					// to force featuresadded listener
					olLayer.visibility = true;
					geomap.queryLayers.push( olLayer );
					geomap.map.addLayer( olLayer );
					addLayerData( geomap, $table, layerVisible, olLayer.id, layer.tab );
					olLayer.visibility = layerVisible;
				} else if ( layerType === "georss" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.HTTP({
								url: layerURL,
								format: new OpenLayers.Format.GeoRSS( {
									read: function( data ) {
										var items = this.getElementsByTagNameNS( data, "*", "item" ),
											row, $row, i, len, bnds, ring, geom, geomProj, feature, atts,
											features = [], layerAttributes = layer.attributes,
											name, g, projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											$row = $( row );
											g = this.createFeatureFromItem( row );
											feature = new OpenLayers.Feature.Vector();
											
											// if we have a bounding box polygon, densify the coordinates
											if (g.geometry.CLASS_NAME === "OpenLayers.Geometry.Polygon" && g.geometry.components[ 0 ].components.length === 5) {
												bnds = densifyBBox(
													g.geometry.components[ 0 ].components[ 1 ].x,
													g.geometry.components[ 0 ].components[ 1 ].y,
													g.geometry.components[ 0 ].components[ 3 ].x,
													g.geometry.components[ 0 ].components[ 3 ].y
												);
												
												ring = new OpenLayers.Geometry.LinearRing( bnds );
												geom = new OpenLayers.Geometry.Polygon( ring );
												geomProj = geom.transform(projLatLon, projMap);
												feature.geometry = geomProj;
											} else {
												feature.geometry = this.parseFeature( row ).geometry.transform( projLatLon, projMap );
											}

											// Parse and store the attributes
											// TODO: test on nested attributes
											atts = {};
											for ( name in layerAttributes ) {
												if (layerAttributes.hasOwnProperty( name ) ) {
													atts[ layerAttributes[ name ] ] = $row.find (name ).text();
												}
											}
											feature.attributes = atts;
											features.push( feature );
										}
										return features;
									}
								})
							}),
							eventListeners: {
								featuresadded: function( evt ) {
									onFeaturesAdded( geomap, $table, evt, layer.zoom, layer.datatable, opts.useMapControls );
									if ( geomap.overlaysLoading[ layerTitle ] ) {
										onLoadEnd( geomap );
									}
								},
								loadstart: function() {
									geomap.overlaysLoading[ layerTitle] = true;
									setTimeout(function() {
										if ( geomap.overlaysLoading[ layerTitle ] ) {
											onLoadEnd( geomap );
										}
									}, overlayTimeout );
								}
							},
							styleMap: getStyleMap( overlayData[ index ] )
						}
					);
					olLayer.name = "overlay_" + index;
					olLayer.datatable = layer.datatable;
					olLayer.popupsInfo = layer.popupsInfo;
					olLayer.popups = layer.popups;

					// To force featuresadded listener
					olLayer.visibility = true;
					geomap.queryLayers.push( olLayer );
					geomap.map.addLayer( olLayer );
					addLayerData( geomap, $table, layerVisible, olLayer.id, layer.tab );
					olLayer.visibility = layerVisible;
				} else if ( layerType === "json" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.Script({
								url: layerURL,
								params: layer.params,
								format: new OpenLayers.Format.GeoJSON({
									internalProjection: geomap.map.getProjectionObject(),
									externalProjection: new OpenLayers.Projection( "EPSG:4269" ),
									read: function( data ) {
										var layerRoot = layer.root,
											items = data[ layerRoot ] ? data[ layerRoot ] : data,
											row, i, len, feature, atts, name, bnds, ring, geom, geomProj,
											features = [], layerAttributes = layer.attributes,
											projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											feature = new OpenLayers.Feature.Vector();
											
											// if we have a bounding box polygon, densify the coordinates
											if (row.geometry.type === "Polygon" && row.geometry.coordinates[ 0 ].length === 5) {
												bnds = densifyBBox(
													row.geometry.coordinates[ 0 ][ 1 ][ 0 ],
													row.geometry.coordinates[ 0 ][ 1 ][ 1 ],
													row.geometry.coordinates[ 0 ][ 3 ][ 0 ],
													row.geometry.coordinates[ 0 ][ 3 ][ 1 ]
												);
												ring = new OpenLayers.Geometry.LinearRing( bnds );
												geom = new OpenLayers.Geometry.Polygon( ring );
												geomProj = geom.transform( projLatLon, projMap );
												feature.geometry = geomProj;
											} else {
												feature.geometry = this.parseGeometry( row.geometry );
											}

											// Parse and store the attributes
											// TODO: test on nested attributes
											atts = {};
											for ( name in layerAttributes ) {
												if ( layerAttributes.hasOwnProperty( name ) ) {
													atts[ layerAttributes[ name ] ] = row[ name ];
												}
											}
											feature.attributes = atts;

											// If no geometry, don't add it
											if ( feature.geometry ) {
												features.push( feature );
											}
										}
										return features;
									}
								})
							}),
							eventListeners: {
								featuresadded: function( evt ) {
									onFeaturesAdded( geomap, $table, evt, layer.zoom, layer.datatable, opts.useMapControls );
									if ( geomap.overlaysLoading[ layerTitle ] ) {
										onLoadEnd( geomap );
									}
								},
								loadstart: function() {
									geomap.overlaysLoading[ layerTitle ] = true;
									setTimeout(function() {
										if ( geomap.overlaysLoading[ layerTitle ] ) {
											onLoadEnd( geomap );
										}
									}, overlayTimeout );
								}
							},
							styleMap: getStyleMap( overlayData[ index ] )
						}
					);
					olLayer.name = "overlay_" + index;
					olLayer.datatable = layer.datatable;
					olLayer.popupsInfo = layer.popupsInfo;
					olLayer.popups = layer.popups;

					// To force featuresadded listener
					olLayer.visibility = true;
					geomap.queryLayers.push( olLayer );
					geomap.map.addLayer( olLayer );
					addLayerData( geomap, $table, layerVisible, olLayer.id, layer.tab );
					olLayer.visibility = layerVisible;
				} else if ( layerType === "geojson" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.Script({
								url: layerURL,
								params: layer.params,
								format: new OpenLayers.Format.GeoJSON({
									internalProjection: geomap.map.getProjectionObject(),
									externalProjection: new OpenLayers.Projection( "EPSG:4269" ),
									read: function( data ) {
										var items = data.features,
											i, len, row, feature, atts, name, bnds, geom, ring, geomProj,
											features = [], layerAttributes = layer.attributes,
											projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											feature = new OpenLayers.Feature.Vector();
											
											// if we have a bounding box polygon, densify the coordinates
											if (row.geometry.type === "Polygon" && row.geometry.coordinates[0].length === 5) {
												bnds = densifyBBox(
													row.geometry.coordinates[ 0 ][ 1 ][ 0 ],
													row.geometry.coordinates[ 0 ][ 1 ][ 1 ],
													row.geometry.coordinates[ 0 ][ 3 ][ 0 ],
													row.geometry.coordinates[ 0 ][ 3 ][ 1 ]
												);
												ring = new OpenLayers.Geometry.LinearRing( bnds );
												geom = new OpenLayers.Geometry.Polygon( ring );
												geomProj = geom.transform( projLatLon, projMap );
												feature.geometry = geomProj;
											} else {
												feature.geometry = this.parseGeometry( row.geometry );
											}

											// Parse and store the attributes
											// TODO: test on nested attributes
											atts = {};
											for ( name in layerAttributes ) {
												if ( layerAttributes.hasOwnProperty( name ) ) {
													atts[ layerAttributes[ name ]] = row.properties[ name ];
												}
											}
											feature.attributes = atts;

											// if no geometry, don't add it
											if ( feature.geometry ) {
												features.push( feature );
											}
										}
										return features;
									}
								})
							}),
							eventListeners: {
								featuresadded: function( evt ) {
									onFeaturesAdded( geomap, $table, evt, layer.zoom, layer.datatable, opts.useMapControls );
									if ( geomap.overlaysLoading[ layerTitle ] ) {
										onLoadEnd( geomap );
									}
								},
								loadstart: function() {
									geomap.overlaysLoading[ layerTitle ] = true;
									setTimeout(function() {
										if ( geomap.overlaysLoading[ layerTitle ] ) {
											onLoadEnd( geomap );
										}
									}, overlayTimeout );
								}
							},
							styleMap: getStyleMap( overlayData[ index ] )
						}
					);
					olLayer.name = "overlay_" + index;
					olLayer.datatable = layer.datatable;
					olLayer.popupsInfo = layer.popupsInfo;
					olLayer.popups = layer.popups;

					// to force featuresadded listener
					olLayer.visibility = true;
					geomap.queryLayers.push( olLayer );
					geomap.map.addLayer( olLayer );
					addLayerData( geomap, $table, layerVisible, olLayer.id, layer.tab );
					olLayer.visibility = layerVisible;
				}
			});
		}
	},

	/*
	* Add tabluar data
	*
	* Sample tables object:
	*
	*	tables: [
	*		{ id: 'cityE', strokeColor: '#F00', fillcolor: '#F00' }
	*	]
	*/
	addTabularData = function( geomap, opts, projLatLon, projMap ) {
		var $table, table, openLayersTable, attr, thead_tfoot_tr, tableLayer, thElms, thlen,
			trElms, trlen, useMapControls, attrMap, trElmsInd, geomType,
			vectorFeatures, features, len, feature, script, bbox, wktFeature,
			thZoom = "<th>" + i18nText.zoomFeature + "</th>",
			thSelect = "<th>" + i18nText.select + "</th>",
			wktParser = new OpenLayers.Format.WKT({
				internalProjection: projMap,
				externalProjection: projLatLon
			}),
			lenTable = opts.tables.length,
			feat, vertices, f;

		while (lenTable--) {
			table = document.getElementById( opts.tables[ lenTable ].id );
			$table = $( table );
			openLayersTable = opts.tables[ lenTable ];
			attr = [];
			tableLayer = new OpenLayers.Layer.Vector( $table.find( "caption" ).text(), {
				styleMap: getStyleMap( openLayersTable )
			});
			thElms = table.getElementsByTagName( "th" );
			thlen = thElms.length;
			trElms = table.getElementsByTagName( "tr" );
			trlen = trElms.length;
			useMapControls = opts.useMapControls;

			// Get the attributes from table header
			while (thlen--) {
				attr[ thlen ] = thElms[ thlen ].innerHTML.replace( /<\/?[^>]+>/gi, "" );
			}

			// If zoomTo add the header and footer column headers
			thead_tfoot_tr = $table.find( "thead tr, tfoot tr" );
			if ( openLayersTable.zoom && useMapControls ) {
				thead_tfoot_tr.append( thZoom );
			}

			// Add select checkbox
			thead_tfoot_tr.prepend( thSelect );

			// Loop through each row
			while ( trlen-- ) {

				// Create an array of attributes: value
				attrMap = {};
				trElmsInd = trElms[ trlen ];

				// Get the geometry type
				geomType = trElmsInd.getAttribute( "data-type" );
				features = trElmsInd.getElementsByTagName( "td" );
				len = features.length;

				while ( len-- ) {

					// Use innerHTML instead of innerText or textContent because they react differently in different browser
					// remove script tag from the attribute
					feature = features[ len ];
					script = feature.getElementsByTagName( "script" )[ 0 ];
					if ( typeof script !== "undefined" ) {
						script.parentNode.removeChild( script );
					}
					attrMap[ attr[ len ] ] = feature.innerHTML;
				}

				if ( geomType !== null ) {
					if ( geomType === "bbox" ) {
						bbox = trElmsInd.getAttribute( "data-geometry" ).split( "," );
						
						feat = densifyBBox( bbox[ 0 ], bbox[ 1 ], bbox[ 2 ], bbox[ 3 ] );
						vertices = "";
					
						for ( f in feat ) {
							vertices += f.x + " " + f.y + ", ";
						}
						
						// add the closing coordinate
						vertices += feat[ 0 ].x + " " + feat[ 0 ].y;
					
						wktFeature = "POLYGON((' + vertices + '))";
						
					} else if ( geomType === "wkt" ) {
						wktFeature = trElmsInd.getAttribute( "data-geometry" );
					}

					vectorFeatures = wktParser.read( wktFeature );

					// Set the table row id
					trElmsInd.setAttribute( "id", vectorFeatures.id.replace( /\W/g, "_" ) );

					// Add the attributes to the feature then add it to the map
					vectorFeatures.attributes = attrMap;
					tableLayer.addFeatures( [ vectorFeatures ] );
				}
			}

			tableLayer.id = "#" + openLayersTable.id;
			tableLayer.datatable = openLayersTable.datatable;
			tableLayer.popupsInfo = openLayersTable.popupsInfo;
			tableLayer.popups = openLayersTable.popups;
			tableLayer.name = openLayersTable.id;
			geomap.map.addLayer( tableLayer );
			geomap.queryLayers.push( tableLayer );

			if ( openLayersTable.tab ) {
				addLayerData( geomap, $table, true, tableLayer.id, openLayersTable.tab );
			} else if ( geomap.glegend ) {
				addToLegend( geomap, $table, true, tableLayer.id );
			}

			if ( openLayersTable.datatable ) {
				$table.addClass( "wb-tables" );
			}
		}
	},

	/*
	 *	Load controls
	 */
	loadControls = function( geomap, opts ) {
		var $mapDiv = geomap.gmap,
			map = geomap.map,
			i18nMousePosition = i18nText.mouseposition,
			i18nScaleLine = i18nText.scaleline,
			mousePositionDiv, scaleLineDiv, attribHref, attribTxt;

		// TODO: Ensure WCAG compliance before enabling
		geomap.selectControl = new OpenLayers.Control.SelectFeature(
			geomap.queryLayers,
			{
				onSelect: onFeatureSelect,
				onUnselect: onFeatureUnselect,
				clickFeature: onFeatureClick
			}
		);

		// Add the select control to every tabular feature. We need to this now because the select control needs to be set.
		$.each( opts.tables, function( indexT, table ) {
				var tableId = "#" + table.id;
			$.each( geomap.queryLayers, function( index, layer ) {
				if ( layer.id === tableId ) {
					$.each( layer.features, function( index, feature ) {
						onTabularFeaturesAdded( geomap, feature, opts.tables[ indexT ].zoom, opts.useMapControls );
					});
				}
			});

			if ( table.datatable ) {
				$( tableId ).addClass( "createDatatable" );
			}
		});

		if ( opts.useMapControls ) {

			map.addControl( geomap.selectControl );
			geomap.selectControl.activate();

			if ( opts.useMousePosition ) {
				map.addControl( new OpenLayers.Control.MousePosition() );
				mousePositionDiv = map.getControlsByClass( "OpenLayers.Control.MousePosition" )[ 0 ].div;
				mousePositionDiv.setAttribute( "aria-label", i18nMousePosition );
				mousePositionDiv.setAttribute( "title", i18nMousePosition );
			}
			if ( opts.useScaleLine ) {
				map.addControl( new OpenLayers.Control.ScaleLine() );
				scaleLineDiv = map.getControlsByClass( "OpenLayers.Control.ScaleLine" )[ 0 ].div;
				scaleLineDiv.setAttribute( "aria-label", i18nScaleLine );
				scaleLineDiv.setAttribute( "title", i18nScaleLine );
			}

			map.addControl( new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
			map.addControl( new OpenLayers.Control.KeyboardDefaults() );
			map.getControlsByClass( "OpenLayers.Control.KeyboardDefaults" )[ 0 ].deactivate();

			// Enable the keyboard navigation when map div has focus. Disable when blur
			// Enable the wheel zoom only on hover
			$mapDiv.attr( "tabindex", "0" ).on( "mouseenter mouseleave focusin focusout", function( event ) {
				var type = event.type,
					keyboardDefaults = "OpenLayers.Control.KeyboardDefaults",
					navigation = "OpenLayers.Control.Navigation";
				if ( type === "mouseenter" || type === "focusin" ) {
					if ( this.className.indexOf( "active" ) === -1 ) {
						map.getControlsByClass( keyboardDefaults )[ 0 ].activate();
						map.getControlsByClass( navigation )[ 0 ].activate();
						$( this ).addClass( "active" );
					}
				} else if ( this.className.indexOf( "active" ) !== -1 ) {
					map.getControlsByClass( navigation )[ 0 ].deactivate();
					map.getControlsByClass( keyboardDefaults )[ 0 ].deactivate();
					$( this ).removeClass( "active" );
				}
			});

			// Add pan zoom bar
			addPanZoomBar( geomap );

			// Fix for the defect #3204 http://tbs-sct.ircan-rican.gc.ca/issues/3204
			$mapDiv.before(
				"<details id='geomap-details-" + geomap.uniqueId +
				"' class='wb-geomap-detail' style='width:" +
				( $mapDiv.width() - 10 ) + "px;'><summary><small>" +
				i18nText.accessTitle + "</small></summary><p><small>" + i18nText.access +
				"<small></p></details>"
			);
			$( "#geomap-details-" + geomap.uniqueId ).trigger( "timerpoke.wb" );
		}

		// Add attribution
		if ( geomap.showAttribNRCan || opts.attribution ) {
			map.addControl( new OpenLayers.Control.Attribution() );

			if ( geomap.showAttribNRCan ) {
				attribHref = document.createElement( "a" );
				attribHref.setAttribute( "href", i18nText.attribLink );
				attribTxt = "\u00A9" + i18nText.attribTitle;
			} else if ( opts.attribution.href ) {
				attribHref = document.createElement( "a" );
				attribHref.setAttribute( "href", opts.attribution.href);
				attribTxt = opts.attribution.text;
			} else {
				attribHref = document.createElement( "p" );
				attribTxt = opts.attribution.text;
			}

			attribHref.appendChild (document.createTextNode( attribTxt ) );
			map.getControlsByClass( "OpenLayers.Control.Attribution" )[ 0 ].div.appendChild( attribHref );
		}

		// Zoom to the maximum extent specified
		map.zoomToMaxExtent();

		// Update the map when the window is resized
		$document.on( "window-resize-width.wb window-resize-height.wb", function() {
			$mapDiv.height( $mapDiv.width() * 0.8 );
			map.updateSize();
			map.zoomToMaxExtent();
		});
	},
	
	// Construct a polygon and densify the latitudes to show the curvature	
	densifyBBox = function(minx, miny, maxx, maxy) {
		
		var left = parseFloat(minx),
			bottom = parseFloat(miny),
			right = parseFloat(maxx),
			top = parseFloat(maxy),
			newbounds = [ ], newPoint, j;
		
		if (left.length === 0 || bottom.length === 0 || right.length === 0 || top.length === 0) { return false; }
	
		// If default BBOX, make it fit in view showing Canada and not the world.
		if (left === -180.0) { left = -179.9; }
		if (right === 180.0) { right = -5.0; }
		if (top === 90.0) { top = 87.0; }
		if (bottom === -90.0) { bottom = 35.0; }
		
		newbounds = [ ];
		newPoint = new OpenLayers.Geometry.Point( j, bottom );
		
		for ( j = left; j < right; j = j + 0.5) {
			newPoint = new OpenLayers.Geometry.Point( j, bottom );
			newbounds.push( newPoint );
		}
		
		newPoint = new OpenLayers.Geometry.Point( right, bottom );
		newbounds.push( newPoint );
		
		for ( j = right; j > left; j = j - 0.5 ) {
			newPoint = new OpenLayers.Geometry.Point( j, top );
			newbounds.push( newPoint );
		}
		
		newPoint = new OpenLayers.Geometry.Point( left, top );
		newbounds.push( newPoint );
		newPoint = new OpenLayers.Geometry.Point( left, bottom );
		newbounds.push( newPoint );
		
		return newbounds;
		
	},

	/*
	 * Create the map after we load the config file.
	 */
	createMap = function( geomap, opts ) {
		
		// Add basemap data
		addBasemapData( geomap, opts );
		
		// Add geolocation and AOI layer
		locStyle = new OpenLayers.Style( { pointRadius: 10, strokeColor: "#ff0000", fillColor: "#333333" } );
		locLayer = new OpenLayers.Layer.Vector( "Location Features", {
			styleMap: new OpenLayers.StyleMap( {
				pointRadius: 10,
				graphicName: "cross",
				strokeWidth: 4,
				strokeOpacity: 0.6,
				strokeColor: "#FF0033",
				fillColor: "#FF0033",
				fillOpacity: 0
			})
		});
	
		geomap.map.addLayer( locLayer );

		// Create projection objects
		var projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
			projMap = geomap.map.getProjectionObject();
		
		if ( opts.debug ) {
			$document.trigger( "projection.wb-geomap", projMap.getCode() );
		}

		// Global variable
		geomap.selectControl = new OpenLayers.Control.SelectFeature();

		// Create legend and tab
		if ( opts.useLegend ) {
			createLegend();
		}

		// Add layer holder
		createLayerHolder( geomap, opts.useTab );

		// Add tabular data
		addTabularData( geomap, opts, projLatLon, projMap );

		// Add overlay data
		addOverlayData( geomap, opts );

		// Load Controls
		loadControls( geomap, opts );
		
		if ( opts.useGeolocation ) {
		
			// Add the geolocation widget
			createGeolocationWidget( geomap );
			
			// Add the AOI widget
			createAOIWidget( geomap );
		
		}

		// Add WCAG element for the map div
		geomap.gmap.attr({
			role: "dialog",
			"aria-label": i18nText.ariaMap
		});
	},
	
	createAOIWidget = function( geomap ) {
		
		geomap.drawControl = new OpenLayers.Control.DrawFeature(
			locLayer,
			OpenLayers.Handler.RegularPolygon, {
				handlerOptions: {
                    sides: 4,
                    irregular: true
                },
				eventListeners: {
					featureadded: function( e ) {
						var projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
							projMap = geomap.map.getProjectionObject(),
							bnds = e.feature.geometry.getBounds(),
							bndsLL = bnds.transform( projMap, projLatLon );
						
						$( "#geomap-aoi-extent-" + uniqueId ).val( bnds.toString() );
						$( "#geomap-aoi-extent-latlon-" + uniqueId ).val( bndsLL.toString() );
						$( "#geomap-aoi-minx-" + uniqueId ).val( bndsLL.toArray()[ 0 ].toFixed( 6 ) );
						$( "#geomap-aoi-miny-" + uniqueId ).val( bndsLL.toArray()[ 1 ].toFixed( 6 ) );
						$( "#geomap-aoi-maxx-" + uniqueId ).val( bndsLL.toArray()[ 2 ].toFixed( 6 ) );
						$( "#geomap-aoi-maxy-" + uniqueId ).val( bndsLL.toArray()[ 3 ].toFixed( 6 ) );
						
						$( "#geomap-aoi-btn-draw-" + uniqueId ).click();
					}
				}
			}
		);
		
		geomap.map.addControl( geomap.drawControl );
				
		geomap.gmap.before( "<div class='geomap-aoi panel panel-default'><div id='geomap-aoi-" + uniqueId + "' class='panel-body'></div></div>" );
		
		$("#wb-geomap-geoloc-btn-search-" + uniqueId).after("<button id='geomap-aoi-toggle-mode-draw-" + uniqueId + "' href='#' class='btn btn-primary'><i class='glyphicon glyphicon-edit'><span class='sr-only'>Draw extent</span></i></button>");
		
		$( "#geomap-aoi-" + uniqueId ).parent().hide();
		
		$( "#geomap-aoi-" + uniqueId ).append(
			"<form id='form-aoi-" + uniqueId + "' role='form'>" +
				"<p><small>" + i18nText.aoiInstructions + "</small></p>" +
				"<div class='form-group form-inline'>" +
					"<div class='form-group'>" +
						"<label for='geomap-aoi-maxy-" + uniqueId + "' class='input-sm'>" + i18nText.aoiNorth + "</label>" +
						"<input type='number' id='geomap-aoi-maxy-" + uniqueId + "' placeholder='90' class='form-control input-sm' min='-90' max='90' step='0.000001'/> " +
					"</div>" +
					"<div class='form-group'>" +
						"<label for='geomap-aoi-maxx-" + uniqueId + "' class='input-sm'>" + i18nText.aoiEast + "</label>" +
						"<input type='number' id='geomap-aoi-maxx-" + uniqueId + "' placeholder='180' class='form-control input-sm' min='-180' max='180' step='0.000001'/> " +
					"</div>" +
					"<div class='form-group'>" +
						"<label for='geomap-aoi-miny-" + uniqueId + "' class='input-sm'>" + i18nText.aoiSouth + "</label>" +
						"<input type='number' id='geomap-aoi-miny-" + uniqueId + "' placeholder='-90' class='form-control input-sm' min='-90' max='90' step='0.000001'/> " +
					"</div>" +
					"<div class='form-group'>" +
						"<label for='geomap-aoi-minx-" + uniqueId + "' class='input-sm'>" + i18nText.aoiWest + "</label>" +
						"<input type='number' id='geomap-aoi-minx-" + uniqueId + "' placeholder='-180' class='form-control input-sm' min='-180' max='180' step='0.000001'/> " +
					"</div>" +
					"</div>" +
				"<button class='btn btn-default btn-sm' id='geomap-aoi-btn-draw-" + uniqueId + "'>" + i18nText.aoiBtnDraw + "</button> " +
				"<button class='btn btn-default btn-sm' id='geomap-aoi-btn-clear-" + uniqueId + "'>" + i18nText.aoiBtnClear + "</button> " +
				"<button class='btn btn-primary btn-sm pull-right' id='geomap-aoi-btn-close-" + uniqueId + "'>" + i18nText.aoiBtnClose + "</button>" +
				"<input type='hidden' id='geomap-aoi-extent-" + uniqueId + "'/>" +
				"<input type='hidden' id='geomap-aoi-extent-latlon-" + uniqueId + "'/>" +
			"</form>" +
		"</div>" +
		"<div class='clear'></div>");
		
		$( "#geomap-aoi-toggle-mode-draw-" + uniqueId ).on( "click", function( evt ) {
			evt.preventDefault();
			geomap.map.getControlsByClass( "OpenLayers.Control.DrawFeature" )[ 0 ].activate();
			$( "#geomap-aoi-" + uniqueId ).parent().slideDown();
			geomap.map.updateSize();
		});
		
		$( "#geomap-aoi-btn-close-" + uniqueId).on( "click", function( evt ) {
			evt.preventDefault();
			geomap.map.getControlsByClass( "OpenLayers.Control.DrawFeature" )[ 0 ].deactivate();
			$( "#geomap-aoi-" + geomap.uniqueId ).parent().slideUp();
			geomap.map.updateSize();
		});
		
		$( "#geomap-aoi-btn-draw-" + uniqueId ).on( "click", function( evt ) {
			
			evt.preventDefault();
			
			$( "#geomap-aoi-extent-" + uniqueId ).val( "" );
			$( "#geomap-aoi-extent-latlon-" + uniqueId ).val( "" );
			$( "#geomap-aoi-minx-" + uniqueId ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-maxx-" + uniqueId ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-maxy-" + uniqueId ).parent().removeClass( "has-error" );
			$( "#geomap-aoi-miny-" + uniqueId ).parent().removeClass( "has-error" );
			
			locLayer.removeAllFeatures();
			
			var left = parseFloat( $( "#geomap-aoi-minx-" + uniqueId ).val() ),
				bottom = parseFloat( $( "#geomap-aoi-miny-" + uniqueId ).val() ),
				right = parseFloat( $( "#geomap-aoi-maxx-" + uniqueId ).val() ),
				top = parseFloat( $( "#geomap-aoi-maxy-" + uniqueId ).val() ),
				isValid = true,
				bnds,
				ring,
				geom,
				projLatLon,
				projMap,
				geomProj,
				feat;
			
			if ( !left || left < -180 || left > 180 ) {
				$( "#geomap-aoi-minx-" + uniqueId ).parent().addClass( "has-error" );
				isValid = false;
			}
			
			if ( !right || right < -180 || right > 180 ) {
				$( "#geomap-aoi-maxx-" + uniqueId ).parent().addClass( "has-error" );
				isValid = false;
			}
			
			if ( !top || top < -90 || top > 90) {
				$( "#geomap-aoi-maxy-" + uniqueId ).parent().addClass( "has-error" );
				isValid = false;
			}
			
			if ( !bottom || bottom < -90 || bottom > 90 ) {
				$( "#geomap-aoi-miny-" + uniqueId ).parent().addClass( "has-error" );
				isValid = false;
			}
			
			if ( isValid === false ) { return false; }
			
			bnds = densifyBBox( left, bottom, right, top );
			ring = new OpenLayers.Geometry.LinearRing( bnds );
			geom = new OpenLayers.Geometry.Polygon( ring );
			projLatLon = new OpenLayers.Projection( "EPSG:4326" );
			projMap = geomap.map.getProjectionObject();
			geomProj = geom.transform( projLatLon, projMap );
			feat = new OpenLayers.Feature.Vector( geomProj );
			
			locLayer.addFeatures( [ feat ] );
			
			geomap.map.zoomToExtent( locLayer.getDataExtent() );
			
			$( "#geomap-aoi-extent-" + uniqueId ).val( geomProj.getBounds().toBBOX() );
			$( "#geomap-aoi-extent-latlon-" + uniqueId ).val( left + ", " + bottom + ", " + right + ", " + top );
			
		} );
		
		$("#geomap-aoi-btn-clear-" + uniqueId ).on( "click", function( evt ) {
			evt.preventDefault();
			$( "#geomap-aoi-extent-" + uniqueId ).val( "" );
			$( "#geomap-aoi-extent-latlon-" + uniqueId ).val( "" );
			$( "#geomap-aoi-minx-" + uniqueId ).val( "" );
			$( "#geomap-aoi-miny-" + uniqueId ).val( "" );
			$( "#geomap-aoi-maxx-" + uniqueId ).val( "" );
			$( "#geomap-aoi-maxy-" + uniqueId ).val( "" );
			locLayer.removeAllFeatures();
		});
	},
	
	createGeolocationWidget = function( geomap ) {
		
		geomap.gmap.before(
			"<div class='geomap-geoloc input-group'>" +
				"<label for='wb-geomap-geoloc-search-" + uniqueId + "' class='input-group-addon hidden-xs'>" + i18nText.geoLocationLabel + "</label>" +
				"<input type='text' class='form-control' name='wb-geomap-geoloc-search-" + uniqueId + "' id='wb-geomap-geoloc-search-" + uniqueId + "' placeholder='" + i18nText.geoLocationPlaceholder + "' list='wb-geomap-geoloc-results-" + uniqueId + "' autocomplete='off'>" +
				"<datalist id='wb-geomap-geoloc-results-" + uniqueId + "'></datalist>" +
				"<span class='input-group-btn'>" +
					"<button id='wb-geomap-geoloc-btn-search-" + uniqueId + "' class='btn btn-primary' type='button'><i class='glyphicon glyphicon-screenshot'><span class='sr-only'>Search</span></i></button>" +
				"</span>" +
			"</div>"
		);

		$("#wb-geomap-geoloc-btn-search-" + uniqueId).on( "click", function() {
			
			var bbox,
				bnds,
				coords,
				dens,
				feat,
				geom,
				geomProj,
				lonlat,
				ll,
				pnt,
				projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
				projMap = geomap.map.getProjectionObject(),
				ring,
				val,
				zoom;
			
			locLayer.destroyFeatures();
			
			val = $("#wb-geomap-geoloc-search-" + uniqueId).val();
			
			if( !val ) {
				$("#wb-geomap-geoloc-search-" + uniqueId).parent().addClass( "has-error" );
				setTimeout(	function() {
					$("#wb-geomap-geoloc-search-" + uniqueId).parent().removeClass( "has-error" );
				}, 5000 );
				return;
			}
			
			bbox = $( "#wb-geomap-geoloc-results-" + uniqueId + " option" ).filter( function() {
				return this.value === val;
			}).data("bbox");
			
			ll = $( "#wb-geomap-geoloc-results-" + uniqueId	+ " option" ).filter(function() {
				return this.value === val;
			} ).data( "lat-lon" );
			
			coords = { bbox: bbox, lonlat: ll	};
			
			if (coords.bbox != null) {
				
				bnds = new OpenLayers.Bounds.fromString( coords.bbox );
				dens = densifyBBox( bnds.left, bnds.bottom, bnds.right, bnds.top );
				ring = new OpenLayers.Geometry.LinearRing( dens );
				geom = new OpenLayers.Geometry.Polygon( ring );
				geomProj = geom.transform( projLatLon, projMap );
				feat = new OpenLayers.Feature.Vector( geomProj );
				locLayer.addFeatures( [ feat ] );
				geomap.map.zoomToExtent( geomProj.getBounds() );
				
			} else if ( coords.lonlat != null ) {
				
				zoom = geomap.map.getZoom() === 0 ? geomap.map.numZoomLevels * 0.85	: geomap.map.getZoom();
				lonlat = new OpenLayers.LonLat( ( coords.lonlat ).split( "," ) ).transform( projLatLon, projMap );
				pnt = new OpenLayers.Geometry.Point( lonlat.lon, lonlat.lat );
				feat = new OpenLayers.Feature.Vector( pnt );
				locLayer.addFeatures( [ feat ] );
				geomap.map.setCenter( lonlat, zoom );
				
			}
			
		});
		
		var xhr, timer;
		 
		$( "#wb-geomap-geoloc-search-" + uniqueId ).on( "keyup", function( evt ) {
			
			var $dataList,
				val,
				bnd,
				ll,
				keycode;
			
			$("#wb-geomap-geoloc-search-" + uniqueId).parent().removeClass( "has-error" );
			
			$dataList = $("#wb-geomap-geoloc-results-" + uniqueId);
			val = $( this ).val();
			keycode = evt.which;
			
			if ( val === "" || val.length <= 2 || keycode === 13 || keycode === 9 || keycode === 40 || keycode === 39 || keycode === 38 ) { return; }
			
			if (xhr) { xhr.abort(); }
			
		    clearTimeout(timer);

			timer = setTimeout(	function() {
				xhr = $.get( i18nText.geoLocationURL, { q: val + "*" }, function( res ) {
					$dataList.empty();
					if ( res.length ) {
						for ( var i = 0, len = res.length; i < len; i++ ) {
							bnd = res[ i ].bbox ? res[ i ].bbox[ 0 ] + ", " + res[ i ].bbox[ 1 ] + ", " + res[ i ].bbox[ 2 ] + ", " + res[ i ].bbox[ 3 ] : null;
							ll = res[ i ].geometry && res[ i ].geometry.type === "Point" ? res[ i ].geometry.coordinates[ 0 ] + ", " + res[ i ].geometry.coordinates[ 1] : null;
							$dataList.append( "<option value='" + res[ i ].title + "' data-lat-lon='" + ll + "' data-bbox='" + bnd + "'/>" );
						}
					}
				}, "json" );
			}, 500 );
		} );
	},

	refreshPlugins = function( geomap ) {

		// Symbolize legend
		symbolizeLegend( geomap );

		// Trigger tabbed interface, data tables and details/summary enhancement
		geomap.glayers.find( ".wb-geomap-tabs" ).trigger( "timerpoke.wb" );
		geomap.glayers.find( ".createDatatable" ).trigger( "timerpoke.wb" );
		$( ".geomap-legend" + geomap.uniqueId ).trigger( "timerpoke.wb" );

		// Set map id to be able to access by getMap.
		geomap.map.id = geomap.mapid;
		mapArray.push( geomap.map );

		// If all geomap instance are loaded, trigger ready.wb-geomap
		if ( mapArray.length === $( ".wb-geomap" ).length ) {

			// Set the alt attributes for images to fix the missing alt
			// attribute. Need to do it after zoom because each zoom brings
			// new tiles to solve this modifications needs to be done to
			// OpenLayers core code OpenLayers.Util.createImage and
			// OpenLayers.Util.createAlphaImageDiv
			// TODO: fix no alt attribute on tile image in OpenLayers rather
			// than use this override wait 2 seconds for all tile to be loaded
			// in the page
			setTimeout(function() {
				geomap.gmap.find( "img" ).attr( "alt", "" );
				$( ".olTileImage" ).attr( "alt", "" );
			}, 2000 );

			geomap.map.events.on({ moveend: function() {
				// Every time we zoom/pan we need to put back the alt for OpenLayers tiles
				$( ".olTileImage" ).attr( "alt", "" );
			} });
		}
	};

// Bind the init function to the timerpoke event
$document.on( "timerpoke.wb init.wb-geomap", selector, init );
				
// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
