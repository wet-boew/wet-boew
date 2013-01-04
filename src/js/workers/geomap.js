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
	
		accessibilize: function () {	
			
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
		}, // end accessibilize function		
		
		onPopupClose: function(evt) {
			selectControl.unselect(selectedFeature);
		},
 
		onFeatureSelect: function(feature) {			
			text = "<h4>"+feature.attributes.name + "</h4>" + feature.attributes.description;
			popup = new OpenLayers.Popup("popup", 
				feature.geometry.getBounds().getCenterLonLat(),
				null,
				text,
				true, this.onPopupClose
			);
			feature.popup = popup;
			popup.setOpacity(0.7);
			map.addPopup(popup);
		},
 
		onFeatureUnselect: function(feature) {
			map.removePopup(feature.popup);
			feature.popup.destroy();
			feature.popup = null;
		},
		
		_exec: function (elm) {
			
			// Don't include this if statement if your plugin shouldn't run in mobile mode.
//			if (pe.mobile) {
//				return _pe.fn.geomap.mobile(elm).trigger('create');
//			}
			var opts,
				overrides,				
				queryLayers = [];			
			
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
				features: [],
				useLayerSwitcher: false,
				useScaleLine: false,
				useMousePosition: false
			};			

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				useLayerSwitcher: elm.hasClass('layerswitcher') ? true : undefined,
				useScaleLine: elm.hasClass('scaleline') ? true : undefined,
				useMousePosition: elm.hasClass('position') ? true : undefined					
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_geomap), class-based overrides and the data-wet-boew attribute
			// Only needed if there are configurable options (has 'metadata' dependency)
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_geomap !== 'undefined' && wet_boew_geomap !== null) {
				$.extend(opts, wet_boew_geomap, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
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
				console.log("WET-Geomap: using default basemap");
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
			
			console.log("WET-Geomap: using projection " + projMap.getCode());
			
			/*
			 * Load overlays
			 * 
			 * TODO: turn this into a public function
			 */
			
			if(wet_boew_geomap.overlays){				
				$.each(wet_boew_geomap.overlays, function(index, layer) {				
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
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {							
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
								url: layer.url,
								format: new OpenLayers.Format.KML({
									extractStyles: true, 
									extractAttributes: true,
									internalProjection: map.getProjectionObject(),
									externalProjection: new OpenLayers.Projection('EPSG:4269')
									})
								})
							}
						)
						olLayer.visibility=layer.visible;
						map.addLayer(olLayer);
						queryLayers.push(olLayer);
					} else if (layer.type=='atom') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
								url: layer.url,
								format: new OpenLayers.Format.Atom({
									// TODO: extract data fields for query
									})
								})
							}
						)
						olLayer.visibility=layer.visible;
						map.addLayer(olLayer);
						queryLayers.push(olLayer);
					} else if (layer.type=='georss') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
								url: layer.url,
								format: new OpenLayers.Format.GeoRSS({
									// TODO: extract data fields for query
									})
								})
							}
						)
						olLayer.visibility=layer.visible;
						map.addLayer(olLayer);
						queryLayers.push(olLayer);
					}				
				});
			}
			
			/*
			 * Add vector features
			 * 
			 * TODO: turn this into a public function
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
			 * Load Controls
			 */ 
			
			// TODO: ensure WCAG compliance before enabling			
//			var selectControl = new OpenLayers.Control.SelectFeature(
//				queryLayers,
//				{ onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect }
//			);			
//			map.addControl(selectControl);
//			selectControl.activate();			
			
			if(opts.useMousePosition) { map.addControl(new OpenLayers.Control.MousePosition()) };
			if(opts.useScaleLine) { map.addControl(new OpenLayers.Control.ScaleLine()) };					
			map.addControl(new OpenLayers.Control.PanZoomBar({ zoomWorldIcon: true }));
			map.addControl(new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
			map.addControl(new OpenLayers.Control.KeyboardDefaults());
			
			// TODO: enable TouchNavigation for mobile clients			
			//map.addControl(new OpenLayers.Control.TouchNavigation();
			
			// add accessibility enhancements
			this.accessibilize();					
			
			if(opts.useLayerSwitcher) { map.addControl(new OpenLayers.Control.LayerSwitcher()) };	// needs to be added after accessibilize		

			map.zoomToMaxExtent();			
			
			// fix for the defect #3204 http://tbs-sct.ircan-rican.gc.ca/issues/3204
			$("#" + map.div.id).before((_pe.language == "en") ? '<p><strong>Keyboard users:</strong> Use the arrow keys to move the map and use plus and minus to zoom.</p>' : '<p><strong>Utilisateurs de clavier :</strong> Utiliser les touches flèches pour déplacer la carte et utiliser les touches plus et négatif pour faire un zoom.</p>');
							
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
