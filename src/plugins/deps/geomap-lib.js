/*
 * @title WET-BOEW Geomap
 * @overview Displays a dynamic map over which information from additional sources can be overlaid.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
/*global wet_boew_geomap: false, OpenLayers: false, proj4: false*/
(function( $, window, document, wb ) {
"use strict";

var pluginName = "wb-geomap",
	selector = "." + pluginName,
	$document = wb.doc,

	// timeout for overlay loading in milliseconds
	overlayTimeout = 2000,
	uniqueId = 0,
	colourIndex = 0,
	mapArray = [],
	debug = false,
	selectedFeature, geomap, i18n, i18nText,

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
		useMapControls: true
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
					ariaMap: i18n( "geo-ariamap")
				};
			}

			// Class-based overrides - use undefined where no override should occur
			overrides = {
				useScaleLine: className.indexOf( "scaleline" ) !== -1 ? true : undefined,
				useMousePosition: className.indexOf( "position" ) !== -1 ? true : undefined,
				debug: className.indexOf( "debug" ) !== -1 ? true : undefined,
				useLegend: className.indexOf( "legend" ) !== -1,
				useTab: className.indexOf( "tab" ) !== -1,
				useMapControls: className.indexOf( "static" ) !== -1 ? false : true
			};

			// Merge default settings with overrides from the selected plugin element.
			$.extend( settings, defaults, overrides, window[ pluginName ], wb.getData( $elm, pluginName ) );

			// Bind the merged settings to the element node for faster access in other events.
			$elm.data( { settings: settings } );

			// Store the debug setting globally
			debug = settings.debug;

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

				$document.trigger( "debug" + selector );
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
							$document.trigger( "overlayLoad" + selector );
						}
					},
					error: function() {
						if ( debug ) {
							$document.trigger( "overlayNotLoad" + selector );
						}
					}
				});
			} else {
				createMap( geomap, settings );
				if ( debug ) {
					$document.trigger( "overlayNotSpecify" + selector );
				}
			}

			// If there are overlays, wait before calling the plugins
			if ( !geomap.overlays ) {
				refreshPlugins( geomap );
			}
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

				// status of overlayLoading (true = still loading)
				overlaysLoading: {}
			},
			$elmMap = $elm.find( ".wb-geomap-map" );

		geomap.gmap = $elmMap.attr( "id", "geomap-map-" + uniqueId ).height( $elmMap.width() * 0.8 );
		geomap.glegend = $elm.find( ".wb-geomap-legend" ).attr( "id", "geomap-legend-" + uniqueId );
		geomap.glayers = $elm.find( ".wb-geomap-layers" ).attr( "id", "geomap-layers-" + uniqueId );

		return geomap;
	},

	addPanZoom = function( geomap ) {
		var panZoom = new OpenLayers.Control.PanZoom();
		OpenLayers.Util.extend( panZoom, {
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

		geomap.map.addControl( panZoom );
		setPanZoom( geomap );
	},

	setPanZoom = function( geomap ) {

		/*
		 * Add alt text to map controls and make tab-able
		 * TODO: Fix in OpenLayers so alt text loaded there rather than overriden here (needs to be i18n)
		 */
		var panZoom = geomap.gmap.find( ".olControlPanZoom" )[ 0 ],
			controls = panZoom.getElementsByTagName( "div" ),
			len = controls.length,
			i, control, img, altTxt, actn;

		panZoom.setAttribute( "role", "toolbar" );
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
		var featureId = feature.id.replace( /\W/g, "_" );
		$( "#" + featureId ).addClass( "background-highlight" );
		$( "#cb_" + featureId ).prop( "checked", true );
	},

	/*
	 * Map feature unselect
	 */
	onFeatureUnselect = function( feature ) {
		var featureId = feature.id.replace( /\W/g, "_" ),
			popup = feature.popup;
		$( "#" + featureId ).removeClass( "background-highlight" );
		$( "#cb_" + featureId ).prop( "checked", false );

		// If there is a popup attached, hide it.
		if ( popup && popup.visible() ) {
			popup.hide();
		}
	},

	/*
	 * Select and unselect map feature on click
	 */
	onFeatureClick = function( feature ) {
		var selectControl = feature.layer.map.getControlsByClass( "OpenLayers.Control.SelectFeature" )[ 0 ];

		if ( feature._lastHighlighter ) {
			selectControl.unselect( feature );
		} else {
			selectControl.select( feature );

			if ( feature.layer.popups ) {

				// If a popup is already shown, hide it
				if ( selectedFeature && selectedFeature.popup && selectedFeature.popup.visible() ) {
					selectedFeature.popup.hide();
				}

				// If no popup, create it, otherwise show it.
				if ( !feature.popup ) {
					createPopup( feature );
				} else {
					feature.popup.toggle();
				}
			}
		}
	},

	/*
	 * Create popup
	 */
	createPopup = function( feature ) {

		var popupsInfo = feature.layer.popupsInfo,
			featureid = feature.id.replace( /\W/g, "_" ),
			buttonText = i18nText.close,
			colon = i18nText.colon,
			mapSize = feature.layer.map.size,
			content = "<h3>" + document.getElementById( feature.layer.name ).getAttribute( "aria-label" ) + "</h3>",
			id, height, width, close, name, popup, icon, regex,
			popupsInfoId, popupsInfoWidth, popupsInfoHeight;

		if ( popupsInfo ) {
			popupsInfoId = popupsInfo.id;
			popupsInfoWidth = popupsInfo.width;
			popupsInfoHeight = popupsInfo.height;
			id = ( popupsInfoId ? popupsInfoId : "popup_" ) + "_" + featureid;
			height = popupsInfoHeight ? popupsInfoHeight : mapSize.h / 2;
			width = popupsInfoWidth ? popupsInfoWidth : mapSize.w / 2;
			close = popupsInfoWidth ? popupsInfo.close : true;
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
		icon.setAttribute( "data-map", geomap.mapid );
		icon.setAttribute( "data-layer", feature.layer.id );
		icon.setAttribute( "data-feature", feature.id );
		icon.setAttribute( "aria-label", buttonText );
		icon.setAttribute( "title", buttonText );
		icon.setAttribute( "role", "button" );
		icon.setAttribute( "tabindex", "0" );
		feature.popup.closeDiv.appendChild( icon );
	},

	/*
	 * Create legend
	 */
	createLegend = function() {

		// Create legend div if not there
		if ( debug && !( $( ".wb-geomap-legend" ).length ) ) {
			$document.trigger( "warningLegend" + selector );
		}
	},

	/*
	 * Create layer holder to add all tabs data (HTML and overlay) and overlay data.
	 */
	createLayerHolder = function( geomap, tab ) {

		// User wants tabs
		if ( tab ) {

			// User has specified where they want to put the tabs
			var $tabs = geomap.glayers.find( ".wb-geomap-tabs" );
			if ( $tabs.length !== 0 ) {

				$tabs
					.attr({
						"class": "wb-tabs auto-height-none",
						id: "geomap-tabs-" + uniqueId
					});

			// User hasn't specified where they want the tabs
			} else {
				geomap
					.glayers
						.prepend( "<div id='geomap-tabs-" + uniqueId +
							"' class='wb-geomap-tabs wb-tabs auto-height-none' style='width: " +
							geomap.glayers.width() + "px;'>" );
			}
		}
	},

	/*
	 * Create a table for vector features added in Load Overlays
	 */
	createTable = function( index, title, caption, datatable ) {

		return $( "<table class='table " + ( datatable ? " wb-tables" : " table-condensed" ) +
			"' aria-label='" + title + "' id='overlay_" + index + "'>" + "<caption>" +
			caption + "</caption><thead></thead><tbody></tbody>" + "</table>" );
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
			featureTableId = featureTable[ 0 ].id,
			$layerTab = $( "<div id='tabs_" + featureTableId + "'>" ),
			title = featureTable[ 0 ].attributes[ "aria-label" ].value,
			$layerTitle = $( "<h3>" + title + "</h3>" ),
			$alert = $( "<div id='msg_" + featureTableId + "' class='alert alert-warning'><p>" +
				i18nText.hiddenLayer + "</p></div>" );

		if ( debug && ( $divLayer.length === 0 ) ) {
			$document.trigger( "layersNotSpecify" + selector );
		}

		// If tabs are specified
		if ( tab && $( ".wb-geomap-tabs" ).length !== 0 ) {
			addToTabs( geomap, featureTable, enabled, olLayerId );

		// Tabs are not specified
		} else {
			$layerTab.append( $layerTitle, featureTable );
			$divLayer.append( "<div class='col-md-12'>" + $layerTab.html() + "</div>" );

			// if layer visibility is false, add the hidden layer message and hide the table data
			if ( !enabled ) {
				$layerTab.append( $alert );
				featureTable.fadeOut();
			}
		}

		if ( debug && tab && $( ".wb-geomap-tabs" ).length === 0 ) {
			$document.trigger( "warningTab" + selector );
		}
	},

	/*
	 * Create Legend
	 */
	addToLegend = function( geomap, featureTable, enabled, olLayerId ) {

		var $featureTable = $( featureTable ),
			featureTableId = featureTable[ 0 ].id,
			glegend = geomap.glegend,
			$fieldset, $ul, checked, $chkBox, $label, $li;

		if ( geomap.glegend ) {

			// If no legend or fieldset add them
			$fieldset = glegend.find( "fieldset" );
			if ( $fieldset.length === 0 ) {
				$fieldset = glegend.append( "<fieldset name='legend'><legend class='wb-inv'>" +
					i18nText.toggleLayer + "</legend></fieldset>" );
			}

			checked = enabled ? "checked='checked'" : "";

			$ul = glegend.find( "ul" );
			if ( $ul.length === 0 ) {
				$ul = $( "<ul class='list-unstyled'></ul>" ).appendTo( $fieldset );
			}

			$chkBox = $( "<input type='checkbox' id='cb_" + featureTableId +
				"' class='geomap-lgnd-cbx' value='" + featureTableId +
				"' " + checked + " data-map='" + geomap.mapid +
					"' data-layer='" + olLayerId + "' />" );

			$label = $( "<label>", {
				"for": "cb_" + featureTableId,
				text: $featureTable.attr( "aria-label" )
			}).prepend( $chkBox );

			$li = $( "<li class='checkbox'>" )
					.append( $label, "<div id='sb_" + featureTableId + "'></div>" );

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
			filter, filterType, symbolizer, i, j, rule;

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
							rule = style.rules[ j ];
							filter = rule.filter;
							filterType = filter.type;
							if ( filterType === "==" ) {
								filterType = colon;
							}
							symbolizer = rule.symbolizer;

							symbolText += "<li class='margin-bottom-medium'>" +
								filter.property + " " + (
									filter.value !== null ?
										filterType + " " + filter.value :
										filter.lowerBoundary + " " + filterType +
											" " + filter.upperBoundary + "</label>"
								) + getLegendSymbol( symbolizer ) + "</li>";
						}
						symbolText += "</ul>";
					} else if ( styleDefault.fillColor ) {
						symbolText += getLegendSymbol( styleDefault );
					} else if ( styleDefault.externalGraphic ) {
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

		if ( fillColor ) {
			symbolStyle += "background-color: " + fillColor + ";";
		}

		if ( strokeColor ) {
			symbolStyle += "border-style: solid; border-width: 2px; border-color: " + strokeColor + ";";
		}

		if ( fillOpacity ) {
			symbolStyle += "opacity: " + fillOpacity + ";";
		}

		return "<div class='geomap-legend-symbol'" +
			( symbolStyle !== "" ?
				" style='" + symbolStyle + "'/>" :
				"/>"
			);
	},

	getLegendGraphic = function( style, alt ) {
		var symbolStyle = "",
			altText = alt ? alt : "",
			graphicOpacity = style.graphicOpacity,
			pointRadius = style.pointRadius,
			graphicHeight = style.graphicHeight,
			graphicWidth = style.graphicWidth;

		if ( graphicOpacity ) {
			symbolStyle += "opacity: " + graphicOpacity + ";";
		}

		if ( pointRadius ) {
			symbolStyle += "height: " + pointRadius + "px; width: " + pointRadius + "px;";
		} else if ( graphicHeight && graphicWidth ) {
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
			featureTableId = featureTable[ 0 ].id,
			$featureTable = $( featureTable ), $details,
			title = $featureTable.attr( "aria-label" );

		$details = $( "<details>", {
			id: "details-" + featureTableId
		}).append( "<summary>" + title + "</summary>", featureTable );

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
		var styleMap, filterPrefs, rules, rule, i, len, style, styleType,
			stylePrefs, styleRule, styleSelect, ruleFilter,
			strokeColor = wb.drawColours[ colourIndex ],
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

		// Increment the colour index
		colourIndex += 1;
		if ( colourIndex === wb.drawColours.length ) {
			colourIndex = 0;
		}

		// If style is supplied, create it. If not, create the default one.
		if ( elmStyle ) {

			// Check the style type (by default, no type are supplied).
			styleType = elmStyle.type;
			styleSelect = elmStyle.select;
			stylePrefs = {
				select: new OpenLayers.Style( styleSelect ? styleSelect : selectStyle )
			};
			if ( styleType === "rule" ) {

				// set the rules and add to the style
				rules = [];
				style = new OpenLayers.Style();
				styleRule = elmStyle.rule;
				len = styleRule.length;
				for ( i = 0; i !== len; i += 1 ) {

					// Set the filter
					rule = styleRule[ i ];
					ruleFilter = rule.filter;
					filterPrefs = {
						type: OpenLayers.Filter.Comparison[ ruleFilter ],
						property: rule.field
					};

					if ( ruleFilter !== "BETWEEN" ) {
						filterPrefs.value = rule.value[ 0 ];
					} else {
						filterPrefs.lowerBoundary = rule.value[ 0 ];
						filterPrefs.upperBoundary = rule.value[ 1 ];
					}

					rules.push(
						new OpenLayers.Rule({
							filter: new OpenLayers.Filter.Comparison( filterPrefs ),
							symbolizer: rule.init
						})
					);
				}
				stylePrefs[ "default" ] = style.addRules( rules );
			} else if ( styleType !== "unique" ) {
				stylePrefs[ "default" ] = new OpenLayers.Style( elmStyle.init );
			}
		} else {
			stylePrefs = {
				"default": new OpenLayers.Style( defaultStyle ),
				select: new OpenLayers.Style( selectStyle )
			};
		}

		styleMap = new OpenLayers.StyleMap( stylePrefs );
		if ( elmStyle && styleType === "unique" ) {
			styleMap.addUniqueValueRules( "default", elmStyle.field, elmStyle.init );
		}

		return styleMap;
	},

	/*
	 * Create a linked table row
	 *
	 * TODO: provide for an array of configured table columns.
	 */
	createRow = function( geomap, context, zoom, mapControl ) {

		// Add a row for each feature
		var feature = context.feature,
			attributes = feature.attributes,
			isHead = context.type === "head",
			row, key,

			// Replace periods with underscores for jQuery!
			featureId = feature.id.replace( /\W/g, "_" );

		if ( isHead ) {
			row = "<tr><th>" + i18nText.select + "</th>";
		} else {
			row = "<tr id='featureId'>" + addChkBox( geomap, feature, featureId );
		}

		for ( key in attributes ) {
			if ( attributes.hasOwnProperty( key ) ) {

				// TODO: add regex to replace text links with hrefs.
				if ( isHead ) {
					row += "<th>" + key + "</th>";
				} else {
					row += "<td>" + attributes[ key ] + "</td>";
				}
			}
		}

		if ( zoom ) {
			if ( !isHead ) {
				row += addZoomTo( geomap, context.feature );
			} else if ( mapControl ) {
				row += "<th>" + i18nText.zoomFeature + "</th>";
			}
		}

		return row + "</tr>";
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
			targetTable = document.getElementById( $table.attr( "id" ) ),
			targetTableHead = targetTable.getElementsByTagName( "thead" )[ 0 ],
			targetTableBody = targetTable.getElementsByTagName( "tbody" )[ 0 ],
			selectControl = geomap.selectControl,
			features = evt.features,
			len = features.length,
			geoRegex = /\W/g,
			headRow = createRow( geomap, rowObj, zoom, mapControl ),
			tableBody = targetTableBody.innerHTML,
			feature, i;

		for ( i = 0; i !== len; i += 1 ) {
			feature = features[ i ];
			tableBody += createRow(
				geomap,
				{
					type: "body",
					id: feature.id.replace( geoRegex, "_" ),
					feature: feature,
					selectControl: selectControl
				},
				zoom,
				mapControl
			);
		}

		// Temporary fix for unknown runtime error in IE8
		if ( wb.ielt9 ) {
			$( targetTableHead ).html( headRow );
			$( targetTableBody ).html( tableBody );
		} else {
			targetTableHead.innerHTML = headRow;
			targetTableBody.innerHTML += tableBody;
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
			tr = document.getElementById( featureId ),
			newTr = addChkBox( geomap, feature, featureId ) + tr.innerHTML +
				( mapControl && zoom ? addZoomTo( geomap, feature ) : "" );

		// Add select checkbox and zoom column
		// Temporary fix for IE8 unknown runtime error bug
		if ( wb.ielt9 ) {
			$( tr ).html( newTr );
		} else {
			tr.innerHTML = newTr;
		}
	},

	/*
	 * Add the checkbox to the column
	 *
	 */
	addChkBox = function( geomap, feature, featureId ) {
		return "<td><label class='wb-inv' for='cb_" + featureId + "'>" +
					i18nText.labelSelect + "</label><input type='checkbox' id='cb_" +
					featureId + "' class='geomap-cbx' data-map='" + geomap.mapid +
					"' data-layer='" + feature.layer.id + "' data-feature='" +
					feature.id + "' /></td>";
	},

	/*
	 * Add the zoom to the column
	 *
	 */
	addZoomTo = function( geomap, feature ) {
		return "<td><a href='javascript:;' data-map='" + geomap.mapid +
			"' data-layer='" + feature.layer.id + "' data-feature='" + feature.id +
			"' class='btn btn-default btn-sm geomap-zoomto'>" + i18nText.zoomFeature + "</a></td>";
	},

	/*
	 * Set the default basemap
	 */
	setDefaultBaseMap = function( geomap ) {
		var mapWidth = geomap.gmap.width(),
			offset,
			option = {
				name: i18nText.baseMapTitle,
				url: i18nText.baseMapURL,
				layer: i18nText.baseMapTitle,
				matrixSet: "nativeTileMatrixSet",
				tileSize: new OpenLayers.Size( 256, 256 ),
				format: "image/jpg",
				style: "default",
				requestEncoding: "REST",
				isBaseLayer: true,
				isSingleTile: false,
				tileOrigin: new OpenLayers.LonLat( -3.46558E7, 3.931E7 ),
				zoomOffset: 5,
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
				],
				transitionEffect: "resize"
			};

		if ( debug ) {
			$document.trigger( "basemapDefault" + selector );
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
		}

		for ( offset = option.zoomOffset - 1; offset !== -1; offset -= 1 ) {
			option.resolutions.shift();
		}

		// Add the Canada Transportation Base Map (CBMT) data and text
		geomap.map.addLayer( new OpenLayers.Layer.WMTS( option ) );

		option.url = i18nText.baseMapURLTxt;
		option.isBaseLayer = false;
		delete option.transitionEffect;
		geomap.map.addLayer( new OpenLayers.Layer.WMTS( option ) );
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
	 * Add baseMap data
	 */
	addBasemapData = function( geomap, opts ) {
		var mapOptions, mapOpts,
			basemap = opts.basemap,
			hasBasemap = basemap && basemap.length !== 0;

		if ( hasBasemap ) {
			mapOpts = basemap.mapOptions;
			if ( mapOpts ) {
				try {
					mapOptions = {
						maxExtent: new OpenLayers.Bounds( mapOpts.maxExtent.split( "," ) ),
						maxResolution: mapOpts.maxResolution,
						projection: mapOpts.projection,
						restrictedExtent: new OpenLayers.Bounds( mapOpts.restrictedExtent.split( "," ) ),
						units: mapOpts.units,
						displayProjection: new OpenLayers.Projection( mapOpts.displayProjection ),
						numZoomLevels: mapOpts.numZoomLevels,
						aspectRatio: mapOpts.aspectRatio,
						tileManager: null
					};
				} catch ( error ) {
					mapOptions = {};
					if ( debug ) {
						$document.trigger( "baseMapMapOptionsLoadError" + selector );
					}
				}
			}
		} else {

			// Use map options for the Canada Transportation Base Map (CBMT)
			mapOptions = setDefaultMapOptions();
		}

		// set aspect ratio
		geomap.gmap.height( geomap.gmap.width() * mapOptions.aspectRatio );

		geomap.map = new OpenLayers.Map( geomap.gmap.attr( "id" ), $.extend( opts.config, mapOptions ) );

		// Initialize control to []. If not, all maps share the same
		// set of controls. This maybe a OpenLayers bug
		geomap.map.controls = [];

		// Check to see if a base map has been configured. If not add the
		// default base map (the Canada Transportation Base Map (CBMT))
		if ( hasBasemap ) {
			if ( !basemap.options ) {
				basemap.options = {};
			} //projection: 'EPSG:4326' };

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
			setDefaultBaseMap( geomap );
			geomap.showAttribNRCan = true;
		}
	},

	/*
	 * Add overlay data
	 */
	addOverlayData = function( geomap, opts ) {
		var overlayData = opts.overlays,
			overlayDataLen = overlayData.length,
			olLayer;
		if ( overlayDataLen !== 0 ) {
			geomap.overlays = overlayDataLen;
			$.each( overlayData, function( index, layer ) {
				var layerType = layer.type,
					layerTitle = layer.title,
					layerVisible = layer.visible,
					layerURL = layer.url,
					$table = createTable( index, layerTitle, layer.caption, layer.datatable );

				if ( layerType === "kml" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.HTTP({
								url: layerURL,
								format: new OpenLayers.Format.KML({
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
										if ( typeof data === "string" ) {

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
				} else if ( layerType === "atom" ) {
					olLayer = new OpenLayers.Layer.Vector(
						layerTitle, {
							strategies: [ new OpenLayers.Strategy.Fixed() ],
							protocol: new OpenLayers.Protocol.HTTP({
								url: layerURL,
								format: new OpenLayers.Format.Atom({
									read: function( data ) {
										var items = this.getElementsByTagNameNS( data, "*", "entry" ),
											row, $row, i, len, feature, atts,
											bnds, ring, geom, geomProj,
											firstComponent, name, g,
											features = [],
											layerAttributes = layer.attributes,
											projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											$row = $( row );
											g = this.parseFeature( row );
											feature = new OpenLayers.Feature.Vector();
											firstComponent = g.geometry.components[ 0 ];

											// if we have a bounding box polygon, densify the coordinates
											if ( g.geometry.CLASS_NAME === "OpenLayers.Geometry.Polygon" &&
												firstComponent.components.length === 5 ) {

												bnds = densifyBBox(
													firstComponent.components[ 1 ].x,
													firstComponent.components[ 1 ].y,
													firstComponent.components[ 3 ].x,
													firstComponent.components[ 3 ].y
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
												if ( layerAttributes.hasOwnProperty( name ) ) {
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
									onFeaturesAdded(
										geomap,
										$table,
										evt,
										layer.zoom,
										layer.datatable,
										opts.useMapControls
									);
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
											row, $row, i, len, bnds, ring,
											geom, geomProj, feature, atts,
											firstComponent, name, g,
											features = [],
											layerAttributes = layer.attributes,
											projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											$row = $( row );
											g = this.createFeatureFromItem( row );
											feature = new OpenLayers.Feature.Vector();
											firstComponent = g.geometry.components[ 0 ];

											// if we have a bounding box polygon, densify the coordinates
											if ( g.geometry.CLASS_NAME === "OpenLayers.Geometry.Polygon" &&
												firstComponent.components.length === 5 ) {

												bnds = densifyBBox(
													firstComponent.components[ 1 ].x,
													firstComponent.components[ 1 ].y,
													firstComponent.components[ 3 ].x,
													firstComponent.components[ 3 ].y
												);

												ring = new OpenLayers.Geometry.LinearRing( bnds );
												geom = new OpenLayers.Geometry.Polygon( ring );
												geomProj = geom.transform(projLatLon, projMap );
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
											row, i, len, feature, atts, name,
											bnds, ring, geom, geomProj,
											firstComponent,
											features = [],
											layerAttributes = layer.attributes,
											projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject();

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											feature = new OpenLayers.Feature.Vector();
											firstComponent = row.geometry.coordinates[ 0 ];

											// if we have a bounding box polygon, densify the coordinates
											if ( row.geometry.type === "Polygon" &&
												firstComponent.length === 5 ) {

												bnds = densifyBBox(
													firstComponent[ 1 ][ 0 ],
													firstComponent[ 1 ][ 1 ],
													firstComponent[ 3 ][ 0 ],
													firstComponent[ 3 ][ 1 ]
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
											features = [],
											layerAttributes = layer.attributes,
											projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
											projMap = geomap.map.getProjectionObject(),
											i, len, row, feature, atts, name,
											bnds, geom, ring, geomProj,
											firstComponent;

										for ( i = 0, len = items.length; i !== len; i += 1 ) {
											row = items[ i ];
											feature = new OpenLayers.Feature.Vector();
											firstComponent = row.geometry.coordinates[ 0 ];

											// if we have a bounding box polygon, densify the coordinates
											if ( row.geometry.type === "Polygon" &&
												firstComponent.length === 5 ) {

												bnds = densifyBBox(
													firstComponent[ 1 ][ 0 ],
													firstComponent[ 1 ][ 1 ],
													firstComponent[ 3 ][ 0 ],
													firstComponent[ 3 ][ 1 ]
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
	* tables: [
	*   { id: 'cityE', strokeColor: '#F00', fillcolor: '#F00' }
	* ]
	*/
	addTabularData = function( geomap, opts, projLatLon, projMap ) {
		var $table, table, openLayersTable, attr, theadTr, tableLayer, thElms, thLen,
			trElms, trLen, useMapControls, attrMap, trElmsInd, geomType,
			vectorFeatures, features, len, feature, script, bbox, wktFeature,
			feat, vertices, vertLen, lenTable,
			thZoom = "<th>" + i18nText.zoomFeature + "</th>",
			thSelect = "<th>" + i18nText.select + "</th>",
			wktParser = new OpenLayers.Format.WKT({
				internalProjection: projMap,
				externalProjection: projLatLon
			}),
			thRegex = /<\/?[^>]+>/gi,
			vectRegex = /\W/g;

		for ( lenTable = opts.tables.length - 1; lenTable !== -1; lenTable -= 1 ) {
			table = document.getElementById( opts.tables[ lenTable ].id );
			$table = $( table );
			openLayersTable = opts.tables[ lenTable ];
			attr = [];
			tableLayer = new OpenLayers.Layer.Vector( $table.find( "caption" ).text(), {
				styleMap: getStyleMap( openLayersTable )
			});
			thElms = table.getElementsByTagName( "th" );
			trElms = table.getElementsByTagName( "tr" );
			trLen = trElms.length;
			useMapControls = opts.useMapControls;

			// Get the attributes from table header
			for ( thLen = thElms.length - 1; thLen !== -1; thLen -= 1 ) {
				attr[ thLen ] = thElms[ thLen ].innerHTML.replace( thRegex, "" );
			}

			// If zoomTo add the header column headers
			theadTr = $table.find( "thead tr" );
			if ( openLayersTable.zoom && useMapControls ) {
				theadTr.append( thZoom );
			}

			// Add select checkbox
			theadTr.prepend( thSelect );

			// Loop through each row
			for ( trLen = trElms.length - 1; trLen !== -1; trLen -= 1 ) {

				// Create an array of attributes: value
				attrMap = {};
				trElmsInd = trElms[ trLen ];

				// Get the geometry type
				geomType = trElmsInd.getAttribute( "data-type" );
				features = trElmsInd.getElementsByTagName( "td" );

				for ( len = features.length - 1; len !== -1; len -= 1 ) {

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
							vertices += feat[ vertLen ].x + " " + feat[ vertLen ].y + ", ";
						}

						vertices = vertices.slice( 0, -2 );
						wktFeature = "POLYGON ((" + vertices + "))";

					} else if ( geomType === "wkt" ) {
						wktFeature = trElmsInd.getAttribute( "data-geometry" );
					}

					vectorFeatures = wktParser.read( wktFeature );

					// Set the table row id
					trElmsInd.setAttribute( "id", vectorFeatures.id.replace( vectRegex, "_" ) );

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
		}
	},

	/*
	 * Load controls
	 */
	loadControls = function( geomap, opts ) {
		var $mapDiv = geomap.gmap,
			map = geomap.map,
			i18nMousePosition = i18nText.mouseposition,
			i18nScaleLine = i18nText.scaleline,
			useMapControls = opts.useMapControls,
			tables = opts.tables,
			tablesLen = tables.length,
			layers = geomap.queryLayers,
			layersLen = layers.length,
			mousePositionDiv, scaleLineDiv, attribHref, attribTxt,
			table, tableId, layer, features, featuresLen,
			zoom, i, j, k;

		// TODO: Ensure WCAG compliance before enabling
		geomap.selectControl = new OpenLayers.Control.SelectFeature(
			geomap.queryLayers,
			{
				onSelect: onFeatureSelect,
				onUnselect: onFeatureUnselect,
				clickFeature: onFeatureClick
			}
		);
		map.addControl( geomap.selectControl );
		geomap.selectControl.activate();

		// Add the select control to every tabular feature.
		// We need to do this now because the select control needs to be set.
		for ( i = 0; i !== tablesLen; i += 1 ) {
			table = tables[ i ];
			tableId = "#" + table.id;
			zoom = table.zoom;
			for ( j = 0; j !== layersLen; j += 1 ) {
				layer = layers[ j ];
				if ( layer.id === tableId ) {
					features = layer.features;
					featuresLen = features.length;
					for ( k = 0; k !== featuresLen; k += 1 ) {
						onTabularFeaturesAdded(
							geomap,
							features[ k ],
							zoom,
							useMapControls
						);
					}
				}
			}
		}

		if ( useMapControls ) {

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

			// Add the map div to the tabbing order
			$mapDiv.attr({
				tabindex: "0",
				"data-map": geomap.mapid
			});

			// Add pan zoom
			addPanZoom( geomap );

			$mapDiv.before(
				"<details id='geomap-details-" + geomap.uniqueId +
				"' class='wb-geomap-detail' style='width:" +
				( $mapDiv.width() - 10 ) + "px;'><summary>" +
				i18nText.accessTitle + "</summary><p>" + i18nText.access +
				"</p></details>"
			);
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
				attribHref.setAttribute( "href", opts.attribution.href );
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
	},

	// Construct a polygon and densify the latitudes to show the curvature
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
			newbounds.push( new OpenLayers.Geometry.Point( j, bottom ) );
		}

		newbounds.push( new OpenLayers.Geometry.Point( right, bottom ) );

		for ( j = right; j > left; j -= 0.5 ) {
			newbounds.push( new OpenLayers.Geometry.Point( j, top ) );
		}

		newbounds.push( new OpenLayers.Geometry.Point( left, top ) );
		newbounds.push( new OpenLayers.Geometry.Point( left, bottom ) );

		return newbounds;
	},

	/*
	 * Create the map after we load the config file.
	 */
	createMap = function( geomap, opts ) {

		// Add basemap data
		addBasemapData( geomap, opts );

		// Create projection objects
		var projLatLon = new OpenLayers.Projection( "EPSG:4326" ),
			projMap = geomap.map.getProjectionObject();

		if ( debug ) {
			$document.trigger( "projection" + selector, projMap.getCode() );
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

		// Add WCAG element for the map div
		geomap.gmap.attr({
			role: "dialog",
			"aria-label": i18nText.ariaMap
		});
	},

	/*
	 * Get the OpenLayers map object
	 */
	getMap = function() {
		var mapArrayItem,
			map = {},
			len;

		for ( len = mapArray.length - 1; len !== -1; len -= 1 ) {
			mapArrayItem = mapArray[ len ];
			map[ mapArrayItem.id ] = mapArrayItem;
		}

		return map;
	},

	getMapById = function( mapId ) {
		var mapArrayItem, len;

		for ( len = mapArray.length - 1; len !== -1; len -= 1 ) {
			mapArrayItem = mapArray[ len ];
			if ( mapArrayItem.id === mapId ) {
				return mapArrayItem;
			}
		}
		return;
	},

	refreshPlugins = function( geomap ) {
		var glayers = geomap.glayers;

		glayers.find( ".wb-tables" ).trigger( "wb-init.wb-tables" );
		glayers.find( ".wb-geomap-tabs" ).trigger( "wb-init.wb-tabs" );

		// Symbolize legend
		symbolizeLegend( geomap );

		// Set map id to be able to access by getMap.
		geomap.map.id = geomap.mapid;
		mapArray.push( geomap.map );

		// If all geomap instance are loaded, trigger ready.wb-geomap
		if ( mapArray.length === $( selector ).length ) {

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

			geomap.map.events.on({
				moveend: function() {

					// Every time we zoom/pan we need to put back the alt for OpenLayers tiles
					$( ".olTileImage" ).attr( "alt", "" );
				}
			});

			wb.doc.trigger( "geomap.ready", [ getMap() ]);
		}
	},

	// Retrieve the map, layer and feature using data attributes on an element
	getMapLayerFeature = function( elm ) {
		var map = getMapById( elm.getAttribute( "data-map" ) ),
			layer = map.getLayer( elm.getAttribute( "data-layer" ) );
		return [
			map,
			layer,
			layer.getFeatureById( elm.getAttribute( "data-feature" ) )
		];
	};

// Bind the init function to the geomap.wb event
$document.on( "geomap.wb", selector, init );

// Handle the Zoom to button events
$document.on( "click", ".geomap-zoomto", function( event ) {
	var which = event.which,
		target = event.target,
		mapId, mapLayerFeature;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		event.preventDefault();
		mapId = target.getAttribute( "data-map" );
		mapLayerFeature = getMapLayerFeature( target );
		mapLayerFeature[ 0 ].zoomToExtent(
			mapLayerFeature[ 2 ].geometry.bounds
		);
		$( "#" + mapId + " .wb-geomap-map" ).trigger( "setfocus.wb" );
	}
});

// Update the map when the window is resized
$document.on( wb.resizeEvents, function() {
	if ( mapArray.length !== 0 ) {
		var maps = getMap(),
			mapId, map, $mapDiv;
		for ( mapId in maps ) {
			if ( maps.hasOwnProperty( mapId ) ) {
				map = maps[ mapId ];
				$mapDiv = $( map.div );
				$mapDiv.height( $mapDiv.width() * 0.8 );
				map.updateSize();
				map.zoomToMaxExtent();
			}
		}
	}
});

// Handle clicking of checkboxes within the tables
$document.on( "change", ".geomap-cbx", function( event ) {
	var target = event.target,
		feature = getMapLayerFeature( target )[ 2 ];

	if ( target.checked ) {
		onFeatureClick( feature );
	} else {
		geomap.selectControl.unselect( feature );
	}
});

// Handle clicks to the legend checkboxes
$document.on( "change", ".geomap-lgnd-cbx", function( event ) {
	var target = event.target,
		layer = getMapLayerFeature( target )[ 1 ],
		featureTableId = target.value,
		visibility = document.getElementById( "cb_" + featureTableId ).checked,
		$table = geomap.glayers.find( "#" + featureTableId ),
		$parent = $table.parent(),
		$alert = $( "#msg_" + featureTableId );

	layer.setVisibility( visibility );

	if ( !$parent.hasClass( "dataTables_wrapper" ) ) {
		$parent = $table;
	}

	if ( $alert.length !== 0 ) {
		$alert.fadeToggle();
	} else {
		$parent.after( "<div id='msg_" + featureTableId + "'><p>" +
							i18nText.hiddenLayer + "</p></div>" );
	}

	$parent.css( "display", ( visibility ? "table" : "none" ) );
});

// Enable the keyboard navigation when map div has focus. Disable when blur
// Enable the wheel zoom only on hover
$document.on( "mouseenter mouseleave focusin focusout", ".wb-geomap-map", function( event ) {
	var type = event.type,
		target = event.currentTarget,
		map = getMapById( target.getAttribute( "data-map" ) ),
		keyboardDefaults = "OpenLayers.Control.KeyboardDefaults",
		navigation = "OpenLayers.Control.Navigation",
		isActive;

	if ( map ) {
		isActive = target.className.indexOf( "active" );
		if ( type === "mouseenter" || type === "focusin" ) {
			if ( !isActive ) {
				map.getControlsByClass( keyboardDefaults )[ 0 ].activate();
				map.getControlsByClass( navigation )[ 0 ].activate();
				$( target ).addClass( "active" );
			}
		} else if ( isActive ) {
			map.getControlsByClass( navigation )[ 0 ].deactivate();
			map.getControlsByClass( keyboardDefaults )[ 0 ].deactivate();
			$( target ).removeClass( "active" );
		}
	}
});

$document.on( "keydown click", ".olPopupCloseBox span", function( event ) {
	var which = event.which,
		target = event.currentTarget;
	if ( event.type === "keydown" ) {
		if ( which === 13 ) {
			getMapLayerFeature( target )[ 2 ].popup.hide();
		}
	} else if ( !which || which === 1 ) {
		getMapById( target.getAttribute( "data-map" ) )
			.getControlsByClass( "OpenLayers.Control.SelectFeature" )[ 0 ]
				.unselect( selectedFeature );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
