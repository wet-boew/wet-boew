/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Template for WET-BOEW v3.x plugins
 */
/*global jQuery: false, pe: false, wet_boew_geomap: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	var map;
	/* local reference */
	_pe.fn.geomap = {
		type: 'plugin',
		// This is an example from tabbed interface, to show how to call required libraries when they are needed
		//depends: (pe.mobile ? [] : ['geomap/OpenLayers']),
		depends: ['openlayers', 'proj4js', 'metadata'],
		//Specifies polyfill needed by the plugin (for elements created at runtime)
		polyfills:['progress','detailssummary'],
		// Don't include a mobile function if your plugin shouldn't run in mobile mode.
//		mobile: function (elm) {
//			// If applicaple, convert html elements and attributes into the format that jQuery mobile expects.
//			return elm;
//		},
	
		accessibilize: function (useLayerSwitcher) {	
			
			/*
			 *	Add alt text to map controls and make tab-able
			 */ 
			
			$('div.olButton').each(function(){
				
				var $div = $(this);
				var $img = $(this).find('img.olAlphaImg');								
				var altTxt = _pe.language === 'en' ? 'Map control' : 'Contrôle de la carte';				
				var actn = this.action;				
				
				if(actn != undefined) {
					
					this.tabIndex = 0;
					
					// add alt text
					switch (actn) {
					case "panup": 
						altTxt =  _pe.language === 'en' ? 'Pan up' : 'Déplacer ver le haut';
						break;
					case "pandown": 
						altTxt = _pe.language === 'en' ? 'Pan down' : 'Déplacer ver le bas';
						break;
					case "panleft": 
						altTxt = _pe.language === 'en' ? 'Pan left' : 'Déplacer ver la gauche';
						break;
					case "panright": 
						altTxt = _pe.language === 'en' ? 'Pan right' : 'Déplacer ver la droite';
						break;
					case "zoomin": 
						altTxt = _pe.language === 'en' ? 'Zoom in' : 'Zoom avant'; 
						break;
					case "zoomout": 
						altTxt = _pe.language === 'en' ? 'Zoom out' : 'Zoom arrière'; 
						break;
					case "zoomworld": 
						altTxt = _pe.language === 'en' ? 'Zoom to map extent' : ' Zoom sur l’étendue de la carte'; 
						break;				
					}
					
					$img.attr('alt', altTxt);
					$div.attr('title', altTxt);
				}
			});
		
			
			/*
			 *	Configure OpenLayers LayerSwitcher control
			 */ 
			
			if(useLayerSwitcher) {
			
				OpenLayers.Control.LayerSwitcher.prototype.redraw = function() {
					//if the state hasn't changed since last redraw, no need 
					// to do anything. Just return the existing div.
					if (!this.checkRedraw()) { 
						return this.div; 
					} 
					// make LayerSwitcher expandable with the keyboard
					this.maximizeDiv.tabIndex = 0;
					var filterMax = function(evt) {
						if (evt.keyCode == 13 || evt.keyCode == 32) {
							this.maximizeControl(evt);
							this.minimizeDiv.focus();
						}
					};
					OpenLayers.Event.observe(this.maximizeDiv, "keydown", OpenLayers.Function.bindAsEventListener(filterMax, this));
					this.minimizeDiv.tabIndex = 0;
					var filterMin = function(evt) {
						if (evt.keyCode == 13 || evt.keyCode == 32) {
							this.minimizeControl(evt);
							this.maximizeDiv.focus();
						}
					};
					OpenLayers.Event.observe(this.minimizeDiv, "keydown", OpenLayers.Function.bindAsEventListener(filterMin, this));
					// make the max/min divs focusable on click (ignores if IE since IE6 - IE8 throws an error)
					if (!$.browser.msie) {
						var that = this;
						$(this.minimizeDiv).click(function(){that.maximizeDiv.focus()});
						$(this.maximizeDiv).click(function(){that.minimizeDiv.focus()});
					}
					// add alt and title attributes to the min/max buttons
					this.minimizeDiv.title = (pe.language==='en' ? "Close Layer Switcher" : "Fermer le sélecteur de couche");
					this.minimizeDiv.firstChild.alt = (pe.language==='en' ? "Close Layer Switcher" : "Fermer le sélecteur de couche");
					this.maximizeDiv.title = (pe.language==='en' ? "Open Layer Switcher" : "Ouvrir le sélecteur de couche");
					this.maximizeDiv.firstChild.alt = (pe.language==='en' ? "Open Layer Switcher" : "Ouvrir le sélecteur de couche");
					
					// fix for the defect #3203 http://tbs-sct.ircan-rican.gc.ca/issues/3203
					// change the label "Base layer" to French if needed. OpenLayer.js 2.10 does not have French translations. There are French translations in OpenLayer.js 2.11. No need to set the label manually after upgrading to 2.11.
					this.baseLbl.innerHTML = (pe.language==='en' ? "Base Layer" : "Fond de carte");
					this.dataLbl.innerHTML = (pe.language==='en' ? "Overlays" : "Couche thématique ");
					
					//clear out previous layers 
					this.clearLayersArray("base");
					this.clearLayersArray("data");
					var containsOverlays = false;
					var containsBaseLayers = false;
					// Save state -- for checking layer if the map state changed.
					// We save this before redrawing, because in the process of redrawing
					// we will trigger more visibility changes, and we want to not redraw
					// and enter an infinite loop.
					var len = this.map.layers.length;
					this.layerStates = new Array(len);
					for (var i=0; i <len; i++) {
						var layer = this.map.layers[i];
						this.layerStates[i] = {
							'name': layer.name, 
							'visibility': layer.visibility,
							'inRange': layer.inRange,
							'id': layer.id
						};
					}	 
					var layers = this.map.layers.slice();
					if (!this.ascending) { layers.reverse(); }
					for(var i=0, len=layers.length; i<len; i++) {
						var layer = layers[i];
						var baseLayer = layer.isBaseLayer;
						if (layer.displayInLayerSwitcher) {
							if (baseLayer) {
								containsBaseLayers = true;
							} else {
								containsOverlays = true;
							}
							// only check a baselayer if it is *the* baselayer, check data
							//	layers if they are visible
							var checked = (baseLayer) ? (layer == this.map.baseLayer) : layer.getVisibility();
							// create input element
							var inputElem = document.createElement("input");
							inputElem.id = this.id + "_input_" + layer.name;
							inputElem.name = (baseLayer) ? this.id + "_baseLayers" : layer.name;
							inputElem.type = (baseLayer) ? "radio" : "checkbox";
							inputElem.value = layer.name;
							inputElem.checked = checked;
							inputElem.defaultChecked = checked;
							if (!baseLayer && !layer.inRange) {
								inputElem.disabled = true;
							}
							var context = {
								'inputElem': inputElem,
								'layer': layer,
								'layerSwitcher': this
							};
							OpenLayers.Event.observe(inputElem, "mouseup", OpenLayers.Function.bindAsEventListener(this.onInputClick, context));
							// make the radio buttons tab-able
							inputElem.tabIndex = 0;
							var filterInput = function(evt) {
								if (evt.keyCode == 13 || evt.keyCode == 32) {
									this.layerSwitcher.onInputClick.call(this, evt);
								} else if (37 <= evt.keyCode && evt.keyCode <= 40) {
									// prevent up/down/left/right keys from moving map while focus is on inputElem
									evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
								}
							};
							OpenLayers.Event.observe(inputElem, "keydown", OpenLayers.Function.bindAsEventListener(filterInput, context));
							// create span
							var labelSpan = document.createElement("span");
							OpenLayers.Element.addClass(labelSpan, "labelSpan");
							if (!baseLayer && !layer.inRange) {
								labelSpan.style.color = "gray";
							}
							labelSpan.innerHTML = layer.name;
							labelSpan.style.verticalAlign = (baseLayer) ? "bottom" : "baseline";
							// create label
							var label = document.createElement("label");
							label.setAttribute("for", this.id + "_input_" + layer.name);
							OpenLayers.Event.observe(label, "click", OpenLayers.Function.bindAsEventListener(this.onInputClick, context));
							// create line break
							var br = document.createElement("br");
							var groupArray = (baseLayer) ? this.baseLayers : this.dataLayers;
							groupArray.push({
								'layer': layer,
								'inputElem': inputElem,
								'labelSpan': labelSpan
							});
							var groupDiv = (baseLayer) ? this.baseLayersDiv : this.dataLayersDiv;
							groupDiv.appendChild(inputElem);
							label.appendChild(labelSpan);
							groupDiv.appendChild(label);
							groupDiv.appendChild(br);
						}
					}
					// if no overlays, dont display the overlay label
					this.dataLbl.style.display = (containsOverlays) ? "" : "none";		  
					// if no baselayers, dont display the baselayer label
					this.baseLbl.style.display = (containsBaseLayers) ? "" : "none";		
					
					// move radio buttons after min/max buttons
					$('.olControlLayerSwitcher > .minimizeDiv').detach().prependTo('.olControlLayerSwitcher');
					$('.olControlLayerSwitcher > .maximizeDiv').detach().prependTo('.olControlLayerSwitcher');
					
					return this.div;
				};
				
				OpenLayers.Control.LayerSwitcher.prototype.onInputClick = function(e) {
					if (!this.inputElem.disabled) {
						if (this.inputElem.type == "radio") {
							this.inputElem.checked = true;
							this.layer.map.setBaseLayer(this.layer);
						} else {
							this.inputElem.checked = !this.inputElem.checked;
							this.layerSwitcher.updateMap();
						}
						// keep the focus on the radio button after it's clicked/pressed
						document.getElementById(this.inputElem.id).focus();
					}
					OpenLayers.Event.stop(e);
				};
			}
		}, // end accessibilize function		
	 
		onFeatureSelect: function(feature) {					
			$("tr#" + feature.id.replace(/\W/g, "_")).attr('class', 'background-highlight');
		},
 
		onFeatureUnselect: function(feature) {
			$("tr#" + feature.id.replace(/\W/g, "_")).attr('class', 'background-white');
		},
		
		getMap: function() {			
			return map;
		},
		
		/* 
		 * Create a table for vector features added in Load Overlays
		 */
		createTable: function(index, title, caption) {
			
			// create a table object
			var $table = $('<table>'); 
			$table.attr('aria-label', title);
			$table.attr('id', "overlay_" + index);
			$table.append('<caption>' + caption + '</caption>');
			var $thead = $('<thead>');
			var $row = $('<tr>');  
			$row.append('<th>Title</th>');	  
			$row.append('<th>Description</th>'); 
			//$row.append('<th>Geometry</th>');			
			$thead.append($row);
			$table.append($thead);
						
			return $table;	
		},		
		
		/*
		 * Random Color Generator
		 */
		randomColor: function() { 
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.round(Math.random() * 15)];
			}			
			return color;
		},
		

		/* 
		 * Add layer data
		 */
		
		addLayerData: function(featureTable, enabled, olLayerId) {			
			
			if ($('.wet-boew-geomap-legend')) {
				pe.fn.geomap.addToLegend(featureTable, enabled, olLayerId);
			};
			
			pe.fn.geomap.addToTabs(featureTable, enabled, olLayerId);
		},
		
		/* 
		 * Create Legend
		 */
		
		addToLegend: function(featureTable, enabled, olLayerId) {			
			var $div = $(".wet-boew-geomap-legend");
			
			if($div.length != 0) {
				var $checked = enabled ? 'checked="checked"' : '';
				var $ul;
				if(!$div.find('ul').length) {
					$ul = $('<ul>', { 'class': 'list-bullet-none' }).appendTo($div);					
				} else {
					$ul = $div.find('ul');
				}
				
				var $chkBox = $('<input type="checkbox" id="cb_' 
						+ $(featureTable).attr('id') + '" value="' 
						+ $(featureTable).attr('id') + '"' + $checked + ' />');
				
				$chkBox.change(function() {				
					map = pe.fn.geomap.getMap();
					layer = map.getLayer(olLayerId);				
					visibility = $('#cb_' + $(featureTable).attr('id')).prop('checked') ? true : false;	
					layer.setVisibility(visibility);	
					
					var $table = $('#' + $(featureTable).attr('id'));		
					var $tableContainer = $table.parent();
					var $alert = $tableContainer.find("div.module-alert");
					
					if($alert.length != 0) { 
						$alert.fadeToggle();
					} else { 
						$tableContainer.append('<div class="module-alert module-simplify"><p>This layer is currently hidden.</p></div>');				
					}					
					
					$table.fadeToggle();									
				})
				
				var $label = $('<label>', {
					'html': $(featureTable).attr('aria-label'),			   
					'for': '#tabs_'	+ $(featureTable).attr('id'),
					'class': 'form-checkbox'
				}).append($chkBox);
				
				$ul.append($("<li>", {'class': 'margin-right-small'}).append($label));			
			}	
		},
		
		/*
		 * Create tabs - one for each layer added
		 */
		addToTabs: function(featureTable, enabled, olLayerId) {				
			
			var $div = $("div#wet-boew-geomap-layers");
			var $tabs = $div.find("ul.tabs");
			var $tabsPanel = $div.find("div.tabs-panel");			
			var $link = $("<a>", {
				'text': $(featureTable).attr('aria-label'),			   
				'href': '#tabs_'	+ $(featureTable).attr('id')
			});

			$tabs.append($("<li>").append($link));
			
			$layerTab = $("<div>").attr('id', 'tabs_' + $(featureTable).attr('id'));
			$layerTab.append(featureTable);		
			$tabsPanel.append($layerTab);		
			
			if(enabled === false) {				
				$layerTab.append('<div class="module-alert module-simplify"><p>This layer is currently hidden!</p></div>');	
				featureTable.fadeOut();
			}			
		},
		
		/*
		 * Generate StyleMap
		 */
		getStyleMap: function(style) {

			// set random color, if color suplied, overrides them.
			var strokeColor = pe.fn.geomap.randomColor();
			var fillColor = strokeColor

			if (typeof(style) != "undefined"){
				if (typeof(style.strokeColor) != "undefined" && typeof(style.fillColor) != "undefined"){
				strokeColor = style.strokeColor;
				fillColor = style.fillColor;
				}
			}

			var my_style = new OpenLayers.StyleMap({ 
				"default": new OpenLayers.Style( 
					{ 
						'strokeColor': strokeColor, 
						'fillColor': fillColor,
						'fillOpacity': 0.5,
						'pointRadius': 5,
						'strokeWidth': 0.5
					}),
				"select": new OpenLayers.Style( 
					{ 
						'strokeColor': "#0000ff", 
						'fillColor': "#0000ff",
						'fillOpacity': 0.4,
						'pointRadius': 5,
						'strokeWidth': 2.0
					})
			});

			return my_style;
		},
		
		/*
		 * Create a linked table row
		 * 
		 * TODO: provide for an array of configured table columns.
		 */
		createRow: function(context) {			
			// add a row for each feature
			var $row = $('<tr>');
			// replace periods with underscores for jQuery!
			$row.attr('id', context.id.replace(/\W/g, "_"));										
			$tdTitle = $('<td>', { 'class': 'select' });
			$tdDesc = $('<td>', { 'html': context.description });
			$link = $('<a>', {				
				'html': context.title,
				'href': '#'
			}).appendTo($tdTitle);		
			
			// Hover events
			$link.hover(
				function(){
					$(this).closest('tr').attr('class', 'background-highlight');
					context.selectControl.unselectAll();
					context.selectControl.select(context.feature);
				}, 
				function(){
					$(this).closest('tr').attr('class', 'background-white');
					context.selectControl.unselectAll();
					context.selectControl.unselect(context.feature);
				}
			);

			// Keybord events
			$link.focus(function(){
					$(this).closest('tr').attr('class', 'background-highlight');
					context.selectControl.unselectAll();
					context.selectControl.select(context.feature);
				}	
			);
			$link.blur(function(){
					$(this).closest('tr').attr('class', 'background-white');
					context.selectControl.unselectAll();
					context.selectControl.select(context.feature);
				}	
			);
			
			$row.append($tdTitle, $tdDesc);
			
			return $row;	
			
		},
		
		_exec: function (elm) {
			
			// Don't include this if statement if your plugin shouldn't run in mobile mode.
//			if (pe.mobile) {
//				return _pe.fn.geomap.mobile(elm).trigger('create');
//			}
			var opts,
				overrides,				
				queryLayers = [],
				selectControl;			
			
			// Defaults
			opts = {
				mapOptions: {
					controls: [],
					maxExtent: new OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),
					maxResolution: 'auto',
					projection: 'EPSG:3978', 
					restrictedExtent: new OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),
					units: 'm',
					displayProjection: new OpenLayers.Projection('EPSG:4269') /* only used by specific controls (i.e. MousePosition) */ ,
					numZoomLevels: 12,
					autoUpdateSize: true,
					fractionalZoom: true,
					theme: null
				},
				overlays: [],
				features: [],
				tables: [],
				useLayerSwitcher: false,
				useScaleLine: false,
				useMousePosition: false,
				debug: false
			};			

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				useLayerSwitcher: elm.hasClass('layerswitcher') ? true : undefined,
				useScaleLine: elm.hasClass('scaleline') ? true : undefined,
				useMousePosition: elm.hasClass('position') ? true : undefined,
				debug: elm.hasClass('debug') ? true : false
			};			

			// Extend the defaults with settings passed through settings.js (wet_boew_geomap), class-based overrides and the data-wet-boew attribute
			// Only needed if there are configurable options (has 'metadata' dependency)
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_geomap !== 'undefined' && wet_boew_geomap !== null) {
				$.extend(opts, wet_boew_geomap, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			if(opts.debug) {
				console.log("WET-Geomap: running in DEBUG mode");
			}	
						
			// Set the language for OpenLayers
			_pe.language === 'fr' ? OpenLayers.Lang.setCode('fr') : OpenLayers.Lang.setCode('en');
			
			// Set the image path for OpenLayers
			OpenLayers.ImgPath = pe.add.liblocation + "/images/geomap/";
			
			// Add projection for default base map
			Proj4js.defs['EPSG:3978'] = "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
					
			// Initiate the map
			elm.attr('id', 'geomap');
			elm.height(elm.width() * 0.8);			
			
			map = new OpenLayers.Map('geomap', opts.mapOptions);			
			
			// Read the layer file
			$.ajax({
				url: opts.layersFile,
				dataType: "script",
				async: false,
				success: function (data) {
					console.log('WET-Geomap: overlays load was performed.');},
				error: function (data){
					console.log('WET-Geomap: overlays was not loaded!');}	
			});
			
			// Check to see if a base map has been configured. If not add the
			// default base map (the Canada Transportation Base Map (CBMT))
			if(wet_boew_geomap.basemap){
				var basemap = wet_boew_geomap.basemap;				
				map.addLayer(new OpenLayers.Layer.WMS(
					basemap.title, 
					basemap.url, 
					{ layers: basemap.layers, version: basemap.version, format: basemap.format },
					basemap.options 
				));					
			} else {
				if(opts.debug) {
					console.log("WET-Geomap: using default basemap");
				}
				
				// Add the Canada Transportation Base Map (CBMT)			
				map.addLayer(new OpenLayers.Layer.WMS(
					"CBMT", 
					"http://geogratis.gc.ca/maps/CBMT", 
					{ layers: 'CBMT', version: '1.1.1', format: 'image/png' },
					{ isBaseLayer: true, 
						singleTile: true, 
						ratio: 1.0, 
						displayInLayerSwitcher: false,
						projection: 'EPSG:3978' 
					} 
				));			
			}
			
			// Create projection objects
			var projLatLon = new OpenLayers.Projection('EPSG:4326');
			var projMap = map.getProjectionObject();						

			if(opts.debug) {
				console.log("WET-Geomap: using projection " + projMap.getCode());
			}			
			
			var selectControl = new OpenLayers.Control.SelectFeature();			
			
			/*
			 * Load overlays			 * 
			 * TODO: turn this into a public function
			 */			
						
			if(wet_boew_geomap.overlays){				
				$.each(wet_boew_geomap.overlays, function(index, layer) {	
					
					var $table = pe.fn.geomap.createTable(index, layer.title, layer.caption);
					
					if(layer.type=='wms') {
						map.addLayer(
							new OpenLayers.Layer.WMS(
								layer.title, 
								layer.url, 
								{ layers: layer.layers, transparent: 'true', format: layer.format },
								{ visibility: layer.visible }
							)
						);
					} else if (layer.type=='kml') {	
						var olLayer = new OpenLayers.Layer.Vector(
							layer.title, {							
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
								url: layer.url,
								format: new OpenLayers.Format.KML({
									//extractStyles: true,									
									extractAttributes: true,
									internalProjection: map.getProjectionObject(),
									externalProjection: new OpenLayers.Projection('EPSG:4269')
									})
								}),
								onFeatureInsert: function(feature) {									
									var context = {
										'id': feature.id.replace(/\W/g, "_"),
										'title': feature.attributes.name,
										'description': feature.attributes.description,
										//'geometry': feature.attributes.geometry,
										'feature': feature,
										'selectControl': selectControl
									};									
									$row = pe.fn.geomap.createRow(context);									
									$table.append($row);									
								},
								styleMap: pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						)
						olLayer.visibility=layer.visible;						
						map.addLayer(olLayer);
						queryLayers.push(olLayer);						
						pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id);						
					} else if (layer.type=='atom') {
						var olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.Atom()									
								}),
								onFeatureInsert: function(feature) {									
									var context = {
										'id': feature.id.replace(/\W/g, "_"),
										'title': feature.attributes.title,
										'description': feature.attributes.description,
										'feature': feature,
										'selectControl': selectControl
									};									
									$row = pe.fn.geomap.createRow(context);									
									$table.append($row);									
								},
								styleMap: pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						)
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);						
						pe.fn.geomap.createTable(olLayer);						
						pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id);						
					} else if (layer.type=='georss') {
						var olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.GeoRSS()
								}),
								onFeatureInsert: function(feature) {									
									var context = {
										'id': feature.id.replace(/\W/g, "_"),
										'title': feature.attributes.title,
										'description': feature.attributes.description,
										'feature': feature,
										'selectControl': selectControl
									};									
									$row = pe.fn.geomap.createRow(context);									
									$table.append($row);									
								},
								styleMap: pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						)
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);						
						pe.fn.geomap.createTable(olLayer);						
						pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id);
					} else if (layer.type=='json') {
						var olLayer = new OpenLayers.Layer.Vector( 
							layer.title, { 
								projection: map.displayProjection, 
								strategies: [new OpenLayers.Strategy.Fixed()], 
								protocol: new OpenLayers.Protocol.Script({ 
									url: layer.url,
									params: layer.params,
									format: new OpenLayers.Format.GeoJSON({										
										read: function(json) {
											var features = [];
											var row, feature, atts = {}, features = [];
											
											for (var i = 0; i < json.products.length; i++) {												
												row = json.products[i];				
												feature = new OpenLayers.Feature.Vector();												
												feature.geometry = this.parseGeometry(row.geometry);
												
												// parse and store the attributes
												atts = {};
												var a = layer.attributes;
												
												for (var name in a) {
													if (a.hasOwnProperty(name)) {
														atts[name] = row[a[name]];
													}
												}
												
												feature.attributes = atts;												
											
												// if no geometry, don't add it
												if (feature.geometry) {
													features.push(feature);
												}
											} 
											return features;
										}
									})
								}),
								eventListeners: {
									"featuresadded": function (evt) {										
										$.each(evt.features, function(index, feature) {											
											var context = {
													'id': feature.id.replace(/\W/g, "_"),
													'title': feature.attributes.title,
													'description': feature.attributes.description,
													'feature': feature,
													'selectControl': selectControl
												};									
												$row = pe.fn.geomap.createRow(context);									
												$table.append($row);
										});
									}
								}						

						});						
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);						
						pe.fn.geomap.createTable(olLayer);						
						pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id);
					}
					
				});
			}

			/*
			 * Add vector features (consider removing - not used) 
			 * 
			 * TODO: turn this into a public function and add associated markup
			 */ 
			
			var vectorLayer = new OpenLayers.Layer.Vector('Features');			
			
			$.each(opts.features, function(index, feature) {
								
				var wktParser = new OpenLayers.Format.WKT({						
					'internalProjection': projMap, 
					'externalProjection': projLatLon
				});
				
				vectorLayer.addFeatures([										 
					wktParser.read(feature)															 
				]);						
				
			});			
			
			map.addLayer(vectorLayer);		
			
			/*
			 * Add tabluar data
			 *			  
			 * TODO: turn this into a public function
			 * 
			 * Sample tables object:
			 * 
			 *	tables: [ 
			 *		{ id: 'cityE' }, 
			 *		{ id: 'bbox', strokeColor: '#FF0000', fillcolor: '#FF0000' } 
			 *	] 
			 */	
			
			$.each(opts.tables, function(index, table) {
				
				$table = $("table#" + table.id);
				
				// get color if specified
				var colorAr;				
				if (table.fillColor != "undefined" || table.strokeColor!= "undefined"){
					colorAr = { strokeColor: table.strokeColor, fillColor: table.fillColor };
				}			

				var tableLayer = new OpenLayers.Layer.Vector($table.find('caption').text(), { styleMap: pe.fn.geomap.getStyleMap(colorAr) });

				var wktParser = new OpenLayers.Format.WKT({						
					'internalProjection': projMap, 
					'externalProjection': projLatLon
				});

				$.each($("table#" + table.id + ' td.geometry'), function(index, feature) {		

					if($(feature).hasClass('bbox')) {								

						bbox = $(feature).text().split(',');
						wktFeature = "POLYGON((" 
							+ bbox[0] + " " + bbox[1] + ", " 
							+ bbox[0] + " " + bbox[3] + ", " 
							+ bbox[2] + " " + bbox[3] + ", " 
							+ bbox[2] + " " + bbox[1] + ", " 
							+ bbox[0] + " " + bbox[1] + 
						"))";
					} else {						
						wktFeature = $(feature).text();
					}

					var vectorFeatures = wktParser.read(wktFeature);

					var $tr = $(this).parent();

					$tr.attr('id', vectorFeatures.id.replace(/\W/g, "_"));

					$select = $tr.find('td.select');

					if($select.length) {
						$link = $select.find('a');
						if($link.length) {
							$link.hover(function(){
									$tr.attr('class', 'background-highlight');
									selectControl.select(vectorFeatures);
								}, 
								function(){
									$tr.attr('class', 'background-white');
									selectControl.unselect(vectorFeatures);
								}
							);

							// Keybord events
							$link.focus(function(){
									$tr.attr('class', 'background-highlight');
									selectControl.select(vectorFeatures);
								}	
							);
							$link.blur(function(){
									$tr.attr('class', 'background-white');
									selectControl.unselect(vectorFeatures);
								}	
							);
						} else { 
							if(opts.debug) {
								$select.append('<div class="module-attention"><h3>WET-Geomap ERROR</h3><p>This cell has the <em>select</em> class but no link was found. Please add a link to this cell.</p></div>');		
							}
						}
					} else {
						if(opts.debug) {
							$tr.closest('table').before('<div class="module-attention"><h3>WET-Geomap ERROR</h3><p>This table contains rows that do not have a cell with the <em>select</em> class. Please ensure that each row has exactly one cell with the <em>select</em> class and that the cell includes a link.</p></div>');
						}
					}										
					tableLayer.addFeatures([vectorFeatures]);	
				});
				
				map.addLayer(tableLayer);
				queryLayers.push(tableLayer);
				
				pe.fn.geomap.addToLegend($table, true, tableLayer.id);
				
			});	
			
			/*
			 * Load Controls
			 */ 
			
			// TODO: ensure WCAG compliance before enabling			
			selectControl = new OpenLayers.Control.SelectFeature(
				queryLayers,
				{ onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect }
			);			
			
			map.addControl(selectControl);			
			selectControl.activate();			
			
			if(opts.useMousePosition) { map.addControl(new OpenLayers.Control.MousePosition()) };
			if(opts.useScaleLine) { map.addControl(new OpenLayers.Control.ScaleLine()) };					
			map.addControl(new OpenLayers.Control.PanZoomBar({ zoomWorldIcon: true }));
			map.addControl(new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
			map.addControl(new OpenLayers.Control.KeyboardDefaults());			
			
			// add accessibility enhancements
			this.accessibilize(opts.useLayerSwitcher);					
			if(opts.useLayerSwitcher) { map.addControl(new OpenLayers.Control.LayerSwitcher()) };

			map.zoomToMaxExtent();			
			
			// fix for the defect #3204 http://tbs-sct.ircan-rican.gc.ca/issues/3204
			$("#" + map.div.id).before((_pe.language == "en") ? '<p><strong>Keyboard users:</strong> Use the arrow keys to move the map and use plus and minus to zoom.</p>' : '<p><strong>Utilisateurs de clavier :</strong> Utiliser les touches flèches pour déplacer la carte et utiliser les touches plus et négatif pour faire un zoom.</p>');
			
			// add a listener on the window to update map when resized
			window.onresize = function() {				
				$("#" + map.div.id).height($("#" + map.div.id).width() * 0.8);
				map.updateSize();
				map.zoomToMaxExtent();
			}
			
			/*
			 * General debug and warning messages - only shown if debug class is found
			 */
			
			// Check to see if a legend container is provided			
			if($(".wet-boew-geomap-legend").length == 0 && $(".wet-boew-geomap").hasClass("debug")) {		
				$("div#wb-main-in").prepend('<div class="module-alert span-8"><h3>WET-Geomap WARNING</h3><p>No div element with a class of <em>wet-boew-geomap-legend</em> was found. If you require a legend either add a div with a class of <em>wet-boew-geomap-legend</em> or enable the default OpenLayers legend by adding the <em>layerswitcher</em> class to the <em>wet-boew-geomap</em> div.</p></div>');	
			}	
			
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

