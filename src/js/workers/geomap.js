/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/*
 * GeoMap plugin
 */
/*global jQuery: false, wet_boew_geomap: false, OpenLayers: false, Proj4js: false, ActiveXObject: false*/
(function($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};

	var overlayTimeout = 2000, // timeout for overlay loading in milliseconds
		uniqueid = 0,
		mapArray= [],
		selectedFeature;
		
	/* local reference */
	_pe.fn.geomap = {
		type: 'plugin',				
		depends: ['openlayers', 'proj4js'],
		polyfills: ['detailssummary'],
		debug: false,
		_exec: function(elm) {	
			var opts,
				geomap,
				overrides,
				lib = _pe.add.liblocation;	

			// defaults
			opts = {
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
			};

			// class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {				
				useScaleLine: elm.hasClass('scaleline') ? true : undefined,
				useMousePosition: elm.hasClass('position') ? true : undefined,
				debug: elm.hasClass('debug'),
				useLegend: elm.hasClass('legend'),
				useTab: elm.hasClass('tab'),
				useMapControls: elm.hasClass('static') ? false : true
			};			

			// extend the defaults with settings passed through settings.js (wet_boew_geomap), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_geomap !== 'undefined' ? wet_boew_geomap : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			// set the language for OpenLayers
			OpenLayers.Lang.setCode(_pe.language);

			// set the image path for OpenLayers
			OpenLayers.ImgPath = lib + 'images/geomap/';

			// add projection for default base map
			Proj4js.defs['EPSG:3978'] = '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';

			_pe.document.on('wb-init-loaded', function() {
				_pe.document.one('geomap-init', function () {
					if (opts.debug) {
						_pe.fn.geomap_debug.init();
					}
					
					// set the geomap object
					uniqueid += 1;
					geomap = _pe.fn.geomap.setGeomapObject(elm);

					// load configuration file
					if (typeof opts.layersFile !== 'undefined') {
						$.ajax({
							url: opts.layersFile,
							dataType: 'script',
							async: false,					
							success: function() {
								// extend opts with data loaded from the configuration file (through wet_boew_geomap)
								$.extend(opts, wet_boew_geomap);

								_pe.fn.geomap.createMap(geomap, opts);
								if (opts.debug) {
									_pe.document.trigger('geomap-overlayLoad');
								}
							},
							error: function() {
								if (opts.debug) {
									_pe.document.trigger('geomap-overlayNotLoad');
								}
							}
						}); // end ajax
					} else {
						_pe.fn.geomap.createMap(geomap, opts);
						if (opts.debug) {
							_pe.document.trigger('geomap-overlayNotSpecify');
						}
					} // end load configuration file

					// if there are overlays, wait before calling the plugins
					if (!geomap.overlays) {
						_pe.fn.geomap.refreshPlugins(geomap);
					}
				});
				if (opts.debug) {
					_pe.fn.geomap.debug = true;
					_pe.add._load(lib + 'dependencies/geomap-debug' + _pe.suffix + '.js', 'geomap-init');
				} else {
					_pe.document.trigger('geomap-init');
				}
			});

			return elm;
		}, // end of exec
		
		/*
		 * Set the geomap array that will be use to generate Geomap
		 */
		setGeomapObject: function(elm){
			var geomap= {
					uniqueid: uniqueid,
					map: null,
					selectControl: null,
					queryLayers: [],
					overlays: 0,
					overlaysLoaded: 0,
					overlaysLoading: {} // status of overlayLoading (true = still loading)
				},
				elmMap = elm.find('.wet-boew-geomap-map');
			
			// test to see if wet-boew-geomap-map class exist. If not, we need to set the object differently.
			// this other method has been deprecated in version v3.1.2
			if (elmMap.length !== 0) {
				geomap.gmap = elmMap.attr('id', 'geomap-map-' + uniqueid).height(elmMap.width() * 0.8);
				geomap.glegend = elm.find('.wet-boew-geomap-legend').attr('id', 'geomap-legend-' + uniqueid);
				geomap.glayers = elm.find('.wet-boew-geomap-layers').attr('id', 'geomap-layers-' + uniqueid);
			} else {
				geomap.gmap = elm.attr('id', 'geomap-map-' + uniqueid).height(elm.width() * 0.8).addClass('wet-boew-geomap-map');
				geomap.glegend = _pe.main.find('.wet-boew-geomap-legend').attr('id', 'geomap-legend-' + uniqueid);
				geomap.glayers = _pe.main.find('.wet-boew-geomap-layers').attr('id', 'geomap-layers-' + uniqueid);
			}
			
			return geomap;
		},
		
		addPanZoomBar: function(geomap) {
			
			var panZoomBar = new OpenLayers.Control.PanZoomBar({zoomStopHeight: 6});
			OpenLayers.Util.extend(panZoomBar, {
				draw: function() {
					// initialize our internal div
					var oButtons = this,
						centered = new OpenLayers.Pixel(7.5, 81),
						buttonArray = ['zoomworld', 'zoomout', 'zoomin', 'pandown', 'panright', 'panup', 'panleft'],
						buttonImg = ['zoom-world-mini', 'zoom-minus-mini', 'zoom-plus-mini', 'south-mini', 'east-mini', 'north-mini', 'west-mini'],
						len = buttonArray.length;
					OpenLayers.Control.prototype.draw.apply(oButtons, arguments);
			
					// place the controls
					oButtons.buttons = [];
					
					while (len--) {
						oButtons._addButton(buttonArray[len], buttonImg[len] + '.png');
					}
					oButtons._addZoomBar(centered.add(7.5,0));
			
					// add custom CSS styles
					$(oButtons.slider).attr('class', 'olControlSlider').find('img').attr('class', 'olControlSlider');
					$(oButtons.zoombarDiv).attr('class', 'olControlBar');
					return oButtons.div;
				}
			});
			
			geomap.map.addControl(panZoomBar);
			
			/*
			 * Add alt text to map controls and make tab-able
			 * TODO: Fix in OpenLayers so alt text loaded there rather than overriden here (needs to be i18n)
			 */
			var controlBar = geomap.gmap.find('.olControlPanZoomBar')[0],
				controls = controlBar.getElementsByTagName('div'),
				len = controls.length,
				control,
				img,
				altTxt,
				actn;

			controlBar.setAttribute('role', 'toolbar');
			while (len--) {
				control = controls[len];
				img = control.getElementsByTagName('img')[0];

				if (typeof img !== 'undefined') {
					actn = control.action;
					if (actn !== undefined) {
						// add alt text
						altTxt = _pe.dic.get('%geo-' + actn);
						control.setAttribute('aria-label', altTxt);
						control.setAttribute('title', altTxt);
						control.setAttribute('role', 'button');
						control.className += ' olControl' + actn;
						control.tabIndex = 0;
					} else {
						// special handling for the zoom slider
						altTxt = _pe.dic.get('%geo-zoomslider');
						control.setAttribute('aria-label', altTxt);
						control.setAttribute('title', altTxt);
					}
					img.setAttribute('alt', altTxt);
					img.className +=  ' olControl' + actn;
				}
			}
		}, // end addPanZoomBar function

		/*
		 * Map feature select
		 */
		onFeatureSelect: function(feature) {					
			$('#' + feature.id.replace(/\W/g, '_')).addClass('background-highlight');
			$('#cb_' + feature.id.replace(/\W/g, '_')).prop('checked', true);
		},

		/*
		 *	Map feature unselect
		 */
		onFeatureUnselect: function(feature) {
			$('#' + feature.id.replace(/\W/g, '_')).removeClass('background-highlight');
			$('#cb_' + feature.id.replace(/\W/g, '_')).prop('checked', false);
			
			// if there is a popup attached, hide it.
			if (feature.popup !== null && feature.popup.visible()) {
				feature.popup.hide();
			}
		},

		/*
		 *	Select and unselect map feature on click
		 */
		onFeatureClick: function(feature) {
			var selectControl = feature.layer.map.getControlsByClass('OpenLayers.Control.SelectFeature')[0];
			if (typeof feature._lastHighlighter !== 'undefined') {
				selectControl.unselect(feature);
			} else {
				selectControl.select(feature);				
				
				if (feature.layer.popups !== undefined) {
					
					// if a popup is already shown, hide it
					if (selectedFeature !== undefined && selectedFeature.popup !== null && selectedFeature.popup.visible()) {
						selectedFeature.popup.hide();
					}
				
					// if no popup, create it, otherwise show it.
					selectedFeature = feature;
					if (feature.popup === null) {
						_pe.fn.geomap.createPopup(feature);
					} else {
						feature.popup.toggle();
					}
				}	
			}
		},
		
		/*
		 *	Create popup
		 */
		createPopup: function(feature) {
			
			var popupsInfo = feature.layer.popupsInfo,
				id,
				height,
				width,
				close,
				content,
				name,
				popup,
				icon,
				featureid = feature.id.replace(/\W/g, '_'),
				buttonText = _pe.dic.get('%close'),
				mapSize = feature.layer.map.size;
			
			if (popupsInfo) {
				id = (typeof popupsInfo.id !== 'undefined' ? popupsInfo.id : 'popup_') + '_' +	featureid;
				height = typeof popupsInfo.height !== 'undefined' ? popupsInfo.height : mapSize.size.h / 2;
				width = typeof popupsInfo.width !== 'undefined' ? popupsInfo.width : mapSize.size.w / 2;
				close = typeof popupsInfo.width !== 'undefined' ? popupsInfo.close : true;
				content = '<h3>' + $('#' + feature.layer.name).attr('aria-label') + '</h3>' + popupsInfo.content;
				
				// update content from feature
				for (name in feature.attributes) {
					if (feature.attributes.hasOwnProperty(name) && name.length !== 0) {
						var regex = new RegExp('_'+ name, 'igm');
						content = content.replace(regex, feature.attributes[name]);
					}
				}
			} else {
				id = 'popup_' + featureid;
				height = mapSize.h / 2;
				width = mapSize.w / 2;
				close = true; 
				content = '<h3>' + $('#' +feature.layer.name).attr('aria-label') + '</h3>';
				
				// Update content from feature
				for (name in feature.attributes) {					
					if (feature.attributes.hasOwnProperty(name) && name.length !== 0) {						
						content += "<p><strong>" + name + _pe.dic.get('%colon') + "</strong><br />" + feature.attributes[name] + "</p>";
					}
				}	
			}

			// create the popup
			popup = new OpenLayers.Popup.FramedCloud(
				id,
				feature.geometry.getBounds().getCenterLonLat(),
				new OpenLayers.Size(width, height),
				content,
				null,
				close,
				null);
													
			popup.maxSize = new OpenLayers.Size(width, height);
			feature.popup = popup;
			feature.layer.map.addPopup(popup);

			// add wb-icon class
			icon = document.createElement('span');
			icon.setAttribute('class', 'wb-icon-x-alt2 close_' + featureid);
			icon.setAttribute('aria-label', buttonText);
			icon.setAttribute('title', buttonText);
			icon.setAttribute('role', 'button');
			icon.setAttribute('tabindex', '0');
			feature.popup.closeDiv.appendChild(icon);
			$('.close_' + featureid).on('keypress click', function(e) {
				if (e.keyCode === 13) {
					feature.popup.hide();
				}
				if (e.type === 'click') {
					feature.layer.map.getControlsByClass('OpenLayers.Control.SelectFeature')[0].unselect(selectedFeature);
				}
			});
		},

		/*
		 * Get the OpenLayers map object
		 */
		getMap: function(index) {			
			return mapArray[index];
		},

		/*
		 *	Create legend
		 */
		createLegend: function() {
			// create legend div if not there
			if (_pe.fn.geomap.debug && !($('.wet-boew-geomap-legend').length)) {	
				_pe.document.trigger('geomap-warningLegend');		
			}		
		},

		/*
		 *	Create layer holder to add all tabs data (HTML and overlay) and overlay data.
		 */
		createLayerHolder: function(geomap, tab) {
			// user wants tabs
			if (tab) {
				// user has specified where they want to put the tabs
				var $tabs = geomap.glayers.find('.wet-boew-geomap-tabs');
				if ($tabs.length !== 0) {
					$tabs.attr({
						'class': 'wet-boew-tabbedinterface auto-height-none',
						'id': 'geomap-tabs-' + uniqueid
					}).append('<ul class="tabs"></ul><div class="tabs-panel"></div>');
				// user hasn't specified where they want the tabs
				} else {
					geomap.glayers.attr('id', 'geomap-tabs-' + uniqueid).append('<div class="clear"></div><div class="wet-boew-geomap-tabs wet-boew-tabbedinterface auto-height-none" style="width: ' + geomap.glayers.width() + 'px;"><ul class="tabs"></ul><div class="tabs-panel"></div></div><div class="clear"></div>');
				}
			}
		},

		/*
		 * Create a table for vector features added in Load Overlays
		 */
		createTable: function(index, title, caption, datatable) {
			return $('<table class="table-simplify' + (datatable ? ' wet-boew-tables' : '') + ' width-100" aria-label="' + title + '" id="overlay_' + index + '">' + '<caption>' + caption + '</caption><thead></thead><tbody></tbody>' + (datatable ? '<tfoot></tfoot></table><div class="clear"></div>' : '</table>'));
		},		

		/*
		 * Random Color Generator
		 */
		randomColor: function() {
			var letters = '0123456789ABCDEF'.split(''),
				color = '#',
				i;
			for (i = 0; i !== 6; i += 1) {
				color += letters[Math.round(Math.random() * 15)];
			}			
			return color;
		},

		/*
		 * Add layer data
		 */		
		addLayerData: function(geomap, featureTable, enabled, olLayerId, tab) {						
			// add layer to legend
			if (geomap.glegend.length !== 0) {
				_pe.fn.geomap.addToLegend(geomap, featureTable, enabled, olLayerId);
			}

			var $divLayer = geomap.glayers,
				featureTableId = $(featureTable).attr('id'),
				$layerTab = $('<div id="tabs_' + featureTableId + '">'),
				title = featureTable[0].attributes['aria-label'].value,
				$layerTitle = $('<h3 class="background-light">' + title + '</h3>'),
				$alert = $('<div id="msg_' + featureTableId + '" class="module-attention module-simplify margin-top-medium margin-bottom-medium"><p>' + _pe.dic.get('%geo-hiddenlayer') + '</p></div>');

			if (_pe.fn.geomap.debug && ($divLayer.length === 0)) {
				_pe.document.trigger('geomap-layersNotSpecify');
			}
			
			// if tabs are specified
			if (tab && $('.wet-boew-geomap-tabs').length !== 0) {
				_pe.fn.geomap.addToTabs(geomap, featureTable, enabled, olLayerId);
			// tabs are not specified
			} else {
				$layerTab.append($layerTitle, featureTable);
				$divLayer.append($layerTab, '<div class="clear"></div>');	

				// if layer visibility is false, add the hidden layer message and hide the table data
				if (!enabled) {				
					$layerTab.append($alert);	
					featureTable.fadeOut();
				}			
			}

			if (_pe.fn.geomap.debug && tab && ($('.wet-boew-geomap-tabs').length === 0)) {
				_pe.document.trigger('geomap-warningTab');
			}
		},

		/*
		 * Create Legend
		 */		
		addToLegend: function(geomap, featureTable, enabled, olLayerId) {
			var $featureTable = $(featureTable),
				featureTableId = $featureTable.attr('id'),
				$fieldset,
				$ul,
				$checked,
				$chkBox,
				$label;	

			if (typeof geomap.glegend !== 'undefined') {			
				// if no legend or fieldset add them
				$fieldset = geomap.glegend.find('fieldset');
				if ($fieldset.length === 0) {
					$fieldset = $('<fieldset name="legend" data-role="controlgroup"><legend class="wb-invisible">' + _pe.dic.get('%geo-togglelayer') + '</legend></fieldset>').appendTo(geomap.glegend);
				}

				$checked = enabled ? 'checked="checked"' : '';

				$ul = geomap.glegend.find('ul');
				if ($ul.length === 0) {
					$ul = $('<ul class="list-bullet-none margin-left-none"></ul>').appendTo($fieldset);
				}

				$chkBox = $('<input type="checkbox" id="cb_' + featureTableId + '" value="' + featureTableId + '"' + $checked + ' />');

				$chkBox.on('change', function() {				
					var layer = geomap.map.getLayer(olLayerId),				
						visibility = geomap.glegend.find('#cb_' + featureTableId).prop('checked') ? true : false,
						$table = geomap.glayers.find('#' + featureTableId),
						$parent = $table.parent(),
						$alert;
					layer.setVisibility(visibility);	

					if (!$parent.hasClass('dataTables_wrapper')) {
						$parent = $table;
					}

					$alert = $('#msg_' + featureTableId);

					if ($alert.length !== 0) {
						$alert.fadeToggle();					
					} else {
						$parent.after('<div id="msg_' + featureTableId + '" class="module-attention module-simplify margin-bottom-medium margin-top-medium"><p>' + _pe.dic.get('%geo-hiddenlayer') + '</p></div>');				
					}					

					if (visibility) {
						$parent.css('display', 'table');
					} else {
						$parent.css('display', 'none');
					}
				});	

				$label = $('<label class="form-checkbox" for="cb_' + featureTableId + '">' + $featureTable.attr('aria-label') + '</lable>');
				$ul.append($('<li>').append($chkBox, $label));			
			}	
		},

		/*
		 * Create tabs - one for each layer added
		 */
		addToTabs: function(geomap, featureTable, enabled) {	
			var $div = geomap.glayers.find('.wet-boew-geomap-tabs'),
				$tabs = $div.find('ul.tabs'),
				$tabsPanel = $div.find('div.tabs-panel'),
				$featureTable = $(featureTable),
				featureTableId = $featureTable.attr('id'),
				$layerTab;

			$tabs.append('<li><a href="#tabs_' + featureTableId + '">' + $featureTable.attr('aria-label') + '</a></li>');
			$layerTab = $('<div id="tabs_' + featureTableId + '">').append(featureTable);
			$tabsPanel.append($layerTab);
			if (!enabled) {
				$layerTab.append('<div id="msg_' + featureTableId + '" class="module-attention module-simplify"><p>' + _pe.dic.get('%geo-hiddenlayer') + '</p></div>');	
				featureTable.fadeOut();
			}			
		},

		/*
		 * Generate StyleMap
		 */
		getStyleMap: function(elm) {
			var styleMap, filter, select,
				strokeColor = _pe.fn.geomap.randomColor(), // set random color
				fillColor = strokeColor,
				defaultStyle = {
					'strokeColor': strokeColor,
					'fillColor': fillColor,
					'fillOpacity': 0.5,
					'pointRadius': 5,
					'strokeWidth': 0.5
				},
				selectStyle = {
					'strokeColor': "#00f",
					'fillColor': "#00f",
					'fillOpacity': 0.4,
					'strokeWidth': 2.0
				};

			// if style is supplied, create it. If not, create the default one.
			if (typeof elm.style !== 'undefined') {
				// check the style type (by default, no type are supplied).
				if (elm.style.type === 'unique') {
					// set the select style then the unique value.
					select = typeof elm.style.select !== 'undefined' ? elm.style.select : selectStyle;
					styleMap = new OpenLayers.StyleMap({'select': new OpenLayers.Style(select)});
					styleMap.addUniqueValueRules('default', elm.style.field, elm.style.init);
				} else if (elm.style.type === 'rule') {	
					// set the rules and add to the style
					var rules = [],
						i,
						len,
						style = new OpenLayers.Style();

					for (i = 0, len = elm.style.rule.length; i !== len; i += 1) {
						// set the filter
						var rule = elm.style.rule[i];
												
						if (rule.filter === 'LESS_THAN') {
							filter = OpenLayers.Filter.Comparison.LESS_THAN;
						} else if (rule.filter === 'LESS_THAN_OR_EQUAL_TO') {
							filter = OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
						} else if (rule.filter === 'GREATER_THAN_OR_EQUAL_TO') {
							filter = OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO;
						} else if (rule.filter === 'GREATER_THAN') {
							filter = OpenLayers.Filter.Comparison.GREATER_THAN;
						} else if (rule.filter === 'BETWEEN') {
							filter = OpenLayers.Filter.Comparison.BETWEEN;
						} else if (rule.filter === 'EQUAL_TO') {
							filter = OpenLayers.Filter.Comparison.EQUAL_TO;
						} else if (rule.filter === 'NOT_EQUAL_TO') {
							filter = OpenLayers.Filter.Comparison.NOT_EQUAL_TO;
						} else if (rule.filter === 'LIKE') {
							filter = OpenLayers.Filter.Comparison.LIKE;
						}

						if (rule.filter !== 'BETWEEN') {
							rules.push(new OpenLayers.Rule({
								filter: new OpenLayers.Filter.Comparison({
									type: filter,
									property: rule.field,
									value: rule.value[0]}),
									symbolizer: rule.init
								})
							);
						} else {
							rules.push(new OpenLayers.Rule({
								filter: new OpenLayers.Filter.Comparison({
									type: filter,
									property: rule.field,
									lowerBoundary: rule.value[0],
									upperBoundary: rule.value[1]}),
									symbolizer: rule.init
								})
							);
						}
					}
					style.addRules(rules);

					// set the select style then the rules.
					select = typeof elm.style.select !== 'undefined' ? elm.style.select : selectStyle;
					styleMap = new OpenLayers.StyleMap({
						'default': style,
						'select': new OpenLayers.Style(select)
					});					
				} else {
					// set the select style then the default.
					select = typeof elm.style.select !== 'undefined' ? elm.style.select : selectStyle;
					styleMap = new OpenLayers.StyleMap({
						'default': new OpenLayers.Style(elm.style.init),
						'select': new OpenLayers.Style(select)
					});
				}
			} // end of (typeof elm.style !== 'undefined')
			else {
				styleMap = new OpenLayers.StyleMap({
					'default': new OpenLayers.Style(defaultStyle),
					'select': new OpenLayers.Style(selectStyle)
				});
			}

			return styleMap;
		},

		/*
		 * Create a linked table row
		 *
		 * TODO: provide for an array of configured table columns.
		 */
		createRow: function(geomap, context, zoomTo) {
			// add a row for each feature
			var $row = $('<tr>'),
				cols = [],
				$chkBox,
				attributes = context.feature.attributes,
				featureId = context.feature.id.replace(/\W/g, '_');

			// replace periods with underscores for jQuery!
			if (context.type !== 'head') {
				$row.attr('id', featureId);
				$chkBox = $('<td><label class="wb-invisible" for="cb_' + featureId + '">' + _pe.dic.get('%geo-labelselect') + '</label><input type="checkbox" id="cb_' + featureId + '"/></td>');
				cols.push($chkBox);
			}

			$.each(attributes, function(key, value) {
				var $col;
				// TODO: add regex to replace text links with hrefs.
				if (context.type === 'head') {
					$col = $('<th>' + key + '</th>');
				} else {
					$col = $('<td>' + value + '</td>');
				}
				cols.push($col);
			});		

			if (zoomTo) {
				cols.push(_pe.fn.geomap.addZoomTo(geomap, $row, context.feature));
			}

			if (context.type !== 'head') {
				$chkBox.on('change', function() {
					if (!$('#cb_' + featureId).prop('checked')) {
						geomap.selectControl.unselect(context.feature);
					} else {
						geomap.selectControl.select(context.feature);
					}
				});
			}
			$row.append(cols);

			return $row;
		},
		
		/*
		 * Handle features once they have been added to the map
		 *
		 */
		onFeaturesAdded: function(geomap, $table, evt, zoomTo, datatable) {
			var $head = _pe.fn.geomap.createRow(geomap, { 'type':'head', 'feature': evt.features[0] }),
				$foot = _pe.fn.geomap.createRow(geomap, { 'type':'head', 'feature': evt.features[0] }),
				thZoom,
				thSelect = ('<th>' + _pe.dic.get('%geo-select') + '</th>'),
				$targetTable = $('table#' + $table.attr('id')),
				$targetTableBody = $targetTable.find('tbody');
			if (zoomTo) {
				thZoom = '<th>' + _pe.dic.get('%geo-zoomfeature') + '</th>';
				$head.append(thZoom);
				$foot.append(thZoom);
			}

			$head.prepend(thSelect);
			$foot.prepend(thSelect);
			
			$targetTable.find('thead').append($head);
			$targetTable.find('tfoot').append($foot);
			$.each(evt.features, function(index, feature) {												
				var context = {
					'type': 'body',
					'id': feature.id.replace(/\W/g, '_'),
					'feature': feature,
					'selectControl': geomap.selectControl
				};									
				$targetTableBody.append(_pe.fn.geomap.createRow(geomap, context, zoomTo));
			});

			if (datatable) {	
				$targetTable.addClass('createDatatable');
			}
		},
		
		/*
		 * Handle overlays once loading has ended
		 *
		 */
		onLoadEnd: function(geomap) {
			// TODO: fix no alt attribute on tile image in OpenLayers rather than use this override
			geomap.gmap.find('.olTileImage').attr('alt', '');

			// we need to call it here as well because if we use a config outside the domain it is called
			// before the table is created. We need to call it only once loading for all overlays has ended
			geomap.overlaysLoaded += 1;
			if (geomap.overlays === geomap.overlaysLoaded) {
				_pe.fn.geomap.refreshPlugins(geomap);
				geomap.overlays = 0;
				geomap.overlaysLoaded = 0;
			}
		},

		/*
		 * Handle features once they have been added to the map for tabular data
		 *
		 */
		onTabularFeaturesAdded: function(geomap, feature, zoomColumn) {
			// find the row
			var featureId = feature.id.replace(/\W/g, '_'),
				$tr = geomap.glayers.find('tr#' + featureId),
				$chkBox;

			// add select checkbox
			$chkBox = $('<td><label class="wb-invisible" for="cb_' + featureId + '">' + _pe.dic.get('%geo-labelselect') + '</label><input type="checkbox" id="cb_' + featureId + '"/></td>');
			$tr.prepend($chkBox);
			
			// add zoom column
			if (zoomColumn) {
				$tr.append(_pe.fn.geomap.addZoomTo(geomap, $tr, feature));
			}
			
			$chkBox.on('change', function() {
				if (!$('#cb_' + featureId).prop('checked')) {
					geomap.selectControl.unselect(feature);
				} else {
					geomap.selectControl.select(feature);
				}
			});
		},

		/*
		 *	Add the zoom to column
		 *
		 */
		addZoomTo: function(geomap, row, feature){
			var $ref = $('<td><a href="javascript:;" class="button"><span class="wb-icon-target"></span>' + _pe.dic.get('%geo-zoomfeature') + '</a></td>').on('click', 'a', function(e) {
				var type = e.type;
				if (type === 'click') {
					e.preventDefault();			
					geomap.map.zoomToExtent(feature.geometry.bounds);	
					$.mobile.silentScroll(_pe.focus(geomap.gmap).offset().top);
				}
			});
			return $ref;
		},

		/*
		 *	Set the default basemap
		 */
		setDefaultBaseMap: function(geomap, opts) {
			var _zoomOffset = 0,
				_resolutions = [38364.660062653464,
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
								4.6302175937685215],
				mapWidth = geomap.gmap.width(),
				offset;
						
			if (opts.debug) {
				_pe.document.trigger('geomap-basemapDefault');
			}

			// in function of map width size, set the proper resolution and zoom offset
			if (mapWidth > 260 && mapWidth <= 500) {
				_zoomOffset = 1;
			} else if (mapWidth > 500 && mapWidth <= 725) {
				_zoomOffset = 2;
			} else if (mapWidth > 725 && mapWidth <= 1175) {
				_zoomOffset = 3;
			} else if (mapWidth > 1175 && mapWidth <= 2300) {
				_zoomOffset = 4;
			} else {
				_zoomOffset = 5;
			}
 
			offset = _zoomOffset;
			while (offset--) {
				_resolutions.shift();
			}

			// add the Canada Transportation Base Map (CBMT)			
			// matrix identifiers are integers corresponding to the map zoom level. Do not have to define. We set zoomOffset to 3 to start at this scale.
			geomap.map.addLayer(new OpenLayers.Layer.WMTS({
				name: _pe.dic.get('%geo-basemaptitle'),
				url: _pe.dic.get('%geo-basemapurl'),
				layer: _pe.dic.get('%geo-basemaptitle'),
				matrixSet: 'nativeTileMatrixSet',
				tileSize: new OpenLayers.Size(256, 256),
				format: 'image/jpg',
				style: 'default',
				requestEncoding: 'REST',
				isBaseLayer: true,
				isSingleTile: false,
				tileOrigin: new OpenLayers.LonLat(-3.46558E7,  3.931E7),
				zoomOffset: _zoomOffset,
				resolutions: _resolutions
			}));		
		},

		/*
		 * Set default map option
		 */
		setDefaultMapOptions: function() {
			// use map options for the Canada Transportation Base Map (CBMT)
			var mapOptions = {
				maxExtent: new OpenLayers.Bounds(-2750000.0, -900000.0, 3600000.0, 4630000.0),
				restrictedExtent: new OpenLayers.Bounds(-2850000.0, -1000000.0, 3700000.0, 4730000.0),			
				maxResolution: 'auto',
				projection: 'EPSG:3978',
				units: 'm',
				displayProjection: new OpenLayers.Projection('EPSG:4269') /* only used by specific controls (i.e. MousePosition) */ ,
				aspectRatio: 0.8,
				fractionalZoom: false
			};

			return mapOptions;
		},

		/*
		 *	Add baseMap data
		 */		
		addBasemapData: function(geomap, opts) {			
			var mapOptions = {},
				mapOpts,
				hasBasemap = (typeof opts.basemap !== 'undefined' && opts.basemap.length !== 0),
				basemap;

			// set aspect ratio
			geomap.gmap.height(geomap.gmap.width() * mapOptions.aspectRatio);
			
			if (hasBasemap) {
				basemap = opts.basemap;
				if (basemap.mapOptions) {				
					mapOpts = basemap.mapOptions;
					try {
						mapOptions.maxExtent = new OpenLayers.Bounds(mapOpts.maxExtent.split(','));
						mapOptions.maxResolution = mapOpts.maxResolution;
						mapOptions.projection = mapOpts.projection;
						mapOptions.restrictedExtent = new OpenLayers.Bounds(mapOpts.restrictedExtent.split(','));
						mapOptions.units = mapOpts.units;
						mapOptions.displayProjection = new OpenLayers.Projection(mapOpts.displayProjection);
						mapOptions.numZoomLevels = mapOpts.numZoomLevels;
						mapOptions.aspectRatio = mapOpts.aspectRatio;
					} catch (err) {
						if (opts.debug) {
							_pe.document.trigger('geomap-baseMapMapOptionsLoadError');
						}
					}
				}
			} else {
				// use map options for the Canada Transportation Base Map (CBMT)
				mapOptions = _pe.fn.geomap.setDefaultMapOptions();
			}

			geomap.map = new OpenLayers.Map(geomap.gmap.attr('id'), $.extend(opts.config, mapOptions));		

			// check to see if a base map has been configured. If not add the
			// default base map (the Canada Transportation Base Map (CBMT))
			if (hasBasemap) {
				if (!basemap.options) {
					basemap.options = {};
				} //projection: 'EPSG:4326' };

				basemap.options.isBaseLayer = true;					

				if (basemap.type === 'wms') {
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
				} else if (basemap.type ==='esri') {						
					geomap.map.addLayer(
						new OpenLayers.Layer.ArcGIS93Rest(
							basemap.title,
							basemap.url
						)
					);									
				}
			} else {
				_pe.fn.geomap.setDefaultBaseMap(geomap, opts);
			}
		},

		/*
		 *	Add overlay data
		 */
		addOverlayData: function(geomap, opts) {
			var overlayData = opts.overlays,
				olLayer;
			if (overlayData.length !== 0) {
				geomap.overlays = overlayData.length;
				$.each(overlayData, function(index, layer) {	
					var $table = _pe.fn.geomap.createTable(index, layer.title, layer.caption, layer.datatable);

					if (layer.type === 'kml') {	
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.KML({
										extractStyles: !layer.style,
										extractAttributes: true,
										internalProjection: geomap.map.getProjectionObject(),
										externalProjection: new OpenLayers.Projection('EPSG:4269'),
										read: function(data) {
											
											var items, row, $row, i, len, feature, atts, features = [],
												layerAttributes = layer.attributes,
												name;

											// when read from server, data is string instead of #document
											if (typeof data === 'string') {
												// with IE we cant use DOMParser
												if (_pe.ie > 0) {
													var xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
													xmlDocument.async = false;
													xmlDocument.loadXML(data);
													data = xmlDocument;
												} else {
													data = (new DOMParser()).parseFromString(data, 'text/xml');
												}
											}
											items = this.getElementsByTagNameNS(data, '*', 'Placemark');

											for (i = 0, len = items.length; i !== len; i += 1) {
												row = items[i];
												$row = $(row);
												feature = new OpenLayers.Feature.Vector();
												feature.geometry = this.parseFeature(row).geometry;

												// parse and store the attributes
												// TODO: test on nested attributes
												atts = {};
												for (name in layerAttributes) {
													if (layerAttributes.hasOwnProperty(name)) {
														atts[layerAttributes[name]] = $row.find(name).text();
													}
												}
												feature.attributes = atts;
												features.push(feature);
											}
											return features;
										}
									})
								}),
								eventListeners: {
									'featuresadded': function(evt) {
										_pe.fn.geomap.onFeaturesAdded(geomap, $table, evt, (layer.zoom && opts.useMapControls), layer.datatable);
										if (geomap.overlaysLoading[layer.title]) {
											_pe.fn.geomap.onLoadEnd(geomap);
										}
									},
									'loadstart': function() {
										geomap.overlaysLoading[layer.title] = true;
										setTimeout(function () {
											if (geomap.overlaysLoading[layer.title]) {
												_pe.fn.geomap.onLoadEnd(geomap);
											}
										}, overlayTimeout);
									}
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.popupsInfo = layer.popupsInfo;
						olLayer.popups = layer.popups;
						olLayer.visibility = true; // to force featuresadded listener
						geomap.queryLayers.push(olLayer);
						geomap.map.addLayer(olLayer);
						_pe.fn.geomap.addLayerData(geomap, $table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;
					} else if (layer.type === 'atom') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: geomap.map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.Atom({
										read: function(data) {
											var items = this.getElementsByTagNameNS(data, '*', 'entry'),
												row, $row, i, len, feature, atts, features = [],
												layerAttributes = layer.attributes,
												name;

											for (i = 0, len = items.length; i !== len; i += 1) {
												row = items[i];
												$row = $(row);
												feature = new OpenLayers.Feature.Vector();
												feature.geometry = this.parseFeature(row).geometry;

												// parse and store the attributes
												// TODO: test on nested attributes
												atts = {};
												for (name in layerAttributes) {
													if (layerAttributes.hasOwnProperty(name)) {
														atts[layerAttributes[name]] = $row.find(name).text();
													}
												}
												feature.attributes = atts;
												features.push(feature);
											}
											return features;
										}
									})
								}),						
								eventListeners: {
									'featuresadded': function(evt) {
										_pe.fn.geomap.onFeaturesAdded(geomap, $table, evt, (layer.zoom && opts.useMapControls), layer.datatable);
										if (geomap.overlaysLoading[layer.title]) {
											_pe.fn.geomap.onLoadEnd(geomap);
										}
									},
									'loadstart': function() {
										geomap.overlaysLoading[layer.title] = true;
										setTimeout(function () {
											if (geomap.overlaysLoading[layer.title]) {
												_pe.fn.geomap.onLoadEnd(geomap);
											}
										}, overlayTimeout);
									}								
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.popupsInfo = layer.popupsInfo;
						olLayer.popups = layer.popups;
						olLayer.visibility = true;	// to force featuresadded listener		
						geomap.queryLayers.push(olLayer);
						geomap.map.addLayer(olLayer);									
						_pe.fn.geomap.addLayerData(geomap, $table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;					
					} else if (layer.type === 'georss') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: geomap.map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.GeoRSS({									
										read: function(data) {											
											var items = this.getElementsByTagNameNS(data, '*', 'item'),
												row, $row, i, len, feature, atts, features = [],
												layerAttributes = layer.attributes,
												name;

											for (i = 0, len = items.length; i !== len; i += 1) {												
												row = items[i];
												$row = $(row);			
												feature = new OpenLayers.Feature.Vector();											
												feature.geometry = this.createGeometryFromItem(row);

												// parse and store the attributes
												// TODO: test on nested attributes
												atts = {};
												for (name in layerAttributes) {
													if (layerAttributes.hasOwnProperty(name)) {
														atts[layerAttributes[name]] = $row.find(name).text();														
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
									'featuresadded': function(evt) {
										_pe.fn.geomap.onFeaturesAdded(geomap, $table, evt, (layer.zoom && opts.useMapControls), layer.datatable);
										if (geomap.overlaysLoading[layer.title]) {
											_pe.fn.geomap.onLoadEnd(geomap);
										}
									},
									'loadstart': function() {
										geomap.overlaysLoading[layer.title] = true;
										setTimeout(function () {
											if (geomap.overlaysLoading[layer.title]) {
												_pe.fn.geomap.onLoadEnd(geomap);
											}
										}, overlayTimeout);
									}							
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.popupsInfo = layer.popupsInfo;
						olLayer.popups = layer.popups;
						olLayer.visibility = true;	// to force featuresadded listener		
						geomap.queryLayers.push(olLayer);
						geomap.map.addLayer(olLayer);											
						_pe.fn.geomap.addLayerData(geomap, $table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;
					} else if (layer.type === 'json') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: geomap.map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.Script({
									url: layer.url,
									params: layer.params,
									format: new OpenLayers.Format.GeoJSON({										
										read: function(data) {											
											var items = data[layer.root] ? data[layer.root] : data,
												row, i, len, feature, atts, features = [],
												layerAttributes = layer.attributes,
												name;

											for (i = 0, len = items.length; i !== len; i += 1) {												
												row = items[i];												
												feature = new OpenLayers.Feature.Vector();												
												feature.geometry = this.parseGeometry(row.geometry);

												// parse and store the attributes
												// TODO: test on nested attributes
												atts = {};
												for (name in layerAttributes) {
													if (layerAttributes.hasOwnProperty(name)) {
														atts[layerAttributes[name]] = row[name];														
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
									'featuresadded': function(evt) {
										_pe.fn.geomap.onFeaturesAdded(geomap, $table, evt, (layer.zoom && opts.useMapControls), layer.datatable);
										if (geomap.overlaysLoading[layer.title]) {
											_pe.fn.geomap.onLoadEnd(geomap);
										}
									},
									'loadstart': function() {
										geomap.overlaysLoading[layer.title] = true;
										setTimeout(function () {
											if (geomap.overlaysLoading[layer.title]) {
												_pe.fn.geomap.onLoadEnd(geomap);
											}
										}, overlayTimeout);
									}
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);	
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.popupsInfo = layer.popupsInfo;
						olLayer.popups = layer.popups;
						olLayer.visibility = true;	// to force featuresadded listener		
						geomap.queryLayers.push(olLayer);
						geomap.map.addLayer(olLayer);											
						_pe.fn.geomap.addLayerData(geomap, $table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;			
					} else if (layer.type ==='geojson') {						
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: geomap.map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.Script({
									url: layer.url,
									params: layer.params,
									format: new OpenLayers.Format.GeoJSON({
										read: function(data) {
											var items = data.features,
												i, len, row, feature, atts, features = [],
												layerAttributes = layer.attributes,
												name;

											for (i = 0, len = items.length; i !== len; i += 1) {												
												row = items[i];												
												feature = new OpenLayers.Feature.Vector();												
												feature.geometry = this.parseGeometry(row.geometry);

												// parse and store the attributes
												// TODO: test on nested attributes
												atts = {};
												for (name in layerAttributes) {
													if (layerAttributes.hasOwnProperty(name)) {
														atts[layerAttributes[name]] = row.properties[name];														
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
									'featuresadded': function(evt) {
										_pe.fn.geomap.onFeaturesAdded(geomap, $table, evt, (layer.zoom && opts.useMapControls), layer.datatable);
										if (geomap.overlaysLoading[layer.title]) {
											_pe.fn.geomap.onLoadEnd(geomap);
										}
									},
									'loadstart': function() {
										geomap.overlaysLoading[layer.title] = true;
										setTimeout(function () {
											if (geomap.overlaysLoading[layer.title]) {
												_pe.fn.geomap.onLoadEnd(geomap);
											}
										}, overlayTimeout);
									}
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.popupsInfo = layer.popupsInfo;
						olLayer.popups = layer.popups;
						olLayer.visibility = true;	// to force featuresadded listener		
						geomap.queryLayers.push(olLayer);
						geomap.map.addLayer(olLayer);										
						_pe.fn.geomap.addLayerData(geomap, $table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;
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
		addTabularData: function(geomap, opts, projLatLon, projMap) {
			var thZoom = '<th>' + _pe.dic.get('%geo-zoomfeature') + '</th>',
				thSelect = ('<th>' + _pe.dic.get('%geo-select') + '</th>'),
				wktFeature,
				wktParser = new OpenLayers.Format.WKT({						
					'internalProjection': projMap,
					'externalProjection': projLatLon
				});
			$.each(opts.tables, function(index, table) {
				var $table = $('#' + table.id),
					attr = [],
					tableLayer = new OpenLayers.Layer.Vector($table.find('caption').text(), {
						styleMap: _pe.fn.geomap.getStyleMap(opts.tables[index])
					});

				// get the attributes from table header
				$table.find('th').each(function(index, attribute) {
					attr[index] = attribute.textContent;
				});				

				// if zoomTo add the header and footer column headers
				if (opts.tables[index].zoom && opts.useMapControls) {
					$table.find('thead').find('tr').append(thZoom);
					$table.find('tfoot').find('tr').append(thZoom);					
				}

				// add select checkbox
				$table.find('thead').find('tr').prepend(thSelect);
				$table.find('tfoot').find('tr').prepend(thSelect);	
					
				// loop through each row
				$table.find('tr').each(function(index, row) {

					// create an array of attributes: value
					var attrMap = {},
						$row = $(row),
						geomType = $row.attr('data-type'), // get the geometry type
						vectorFeatures;
					$row.find('td').each(function(index, feature) {	
						attrMap[attr[index]] = feature.innerText;
					});

					if (typeof geomType !== 'undefined') {
						if (geomType === 'bbox') {
							var bbox = $row.attr('data-geometry').split(',');
							wktFeature = 'POLYGON((' +
								bbox[0] + ' ' + bbox[1] + ', ' +
								bbox[0] + ' ' + bbox[3] + ', ' +
								bbox[2] + ' ' + bbox[3] + ', ' +
								bbox[2] + ' ' + bbox[1] + ', ' +
								bbox[0] + ' ' + bbox[1] +
							'))';
						} else if (geomType === 'wkt') {
							wktFeature = $(row).attr('data-geometry');
						}

						vectorFeatures = wktParser.read(wktFeature);

						// set the table row id
						$row.attr('id', vectorFeatures.id.replace(/\W/g, '_'));

						// add the attributes to the feature then add it to the map
						vectorFeatures.attributes = attrMap;										
						tableLayer.addFeatures([vectorFeatures]);
					}
				});

				tableLayer.id = '#' + table.id;
				tableLayer.datatable = opts.tables[index].datatable;
				tableLayer.popupsInfo = opts.tables[index].popupsInfo;
				tableLayer.popups = opts.tables[index].popups;
				tableLayer.name = table.id;
				geomap.map.addLayer(tableLayer);
				geomap.queryLayers.push(tableLayer);

				if (opts.tables[index].tab) {
					_pe.fn.geomap.addLayerData(geomap, $table, true, tableLayer.id, opts.tables[index].tab);
				} else if (geomap.glegend) {
					_pe.fn.geomap.addToLegend(geomap, $table, true, tableLayer.id);
				}
				
				if (opts.tables[index].datatable) {
					$table.addClass('wet-boew-tables');
				}
			});		
		},

		/*
		 *	Load controls
		 */
		loadControls: function(geomap, opts){
			var $mapDiv = geomap.gmap,
				map = geomap.map;

			// TODO: ensure WCAG compliance before enabling			
			geomap.selectControl = new OpenLayers.Control.SelectFeature(
				geomap.queryLayers,
				{
					onSelect: this.onFeatureSelect,
					onUnselect: this.onFeatureUnselect,
					clickFeature: this.onFeatureClick
				}
			);	
			
			// add the select control to every tabular feature. We need to this now because the select control needs to be set.
			$.each(opts.tables, function(indexT, table) {
					var tableId = '#' + table.id;
				$.each(geomap.queryLayers, function(index, layer) {
					if (layer.id === tableId){
						$.each(layer.features, function(index, feature) {
							_pe.fn.geomap.onTabularFeaturesAdded(geomap, feature, (opts.tables[indexT].zoom && opts.useMapControls));
						});
					}
				});
	
				if (table.datatable) {
					$(tableId).addClass('createDatatable');
				}
			});
				
			if(opts.useMapControls) {

				map.addControl(geomap.selectControl);			
				geomap.selectControl.activate();			
					
				if (opts.useMousePosition) {
					map.addControl(new OpenLayers.Control.MousePosition());
					map.getControlsByClass('OpenLayers.Control.MousePosition')[0].div.setAttribute('aria-label', _pe.dic.get('%geo-mouseposition'));
					map.getControlsByClass('OpenLayers.Control.MousePosition')[0].div.setAttribute('title', _pe.dic.get('%geo-mouseposition'));
				}
				if (opts.useScaleLine) {
					map.addControl(new OpenLayers.Control.ScaleLine());
					map.getControlsByClass('OpenLayers.Control.ScaleLine')[0].div.setAttribute('aria-label', _pe.dic.get('%geo-scaleline'));
					map.getControlsByClass('OpenLayers.Control.ScaleLine')[0].div.setAttribute('title', _pe.dic.get('%geo-scaleline'));
				}
	
				map.addControl(new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
				map.addControl(new OpenLayers.Control.KeyboardDefaults());			
				map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].deactivate();
	
				// enable the keyboard navigation when map div has focus. Disable when blur
				// enable the wheel zoom only on hover
				$mapDiv.attr('tabindex', '0').on('mouseenter mouseleave focusin focusout', function(e) {
					var type = e.type,
						$this = $(this);
					if (type === 'mouseenter' || type === 'focusin') {
						if (!$this.hasClass('active')) {
							map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].activate();
							map.getControlsByClass('OpenLayers.Control.Navigation')[0].activate();
							$this.addClass('active');
						}
					} else if (type === 'mouseleave' || type === 'focusout') {
						if ($this.hasClass('active')) {
							map.getControlsByClass('OpenLayers.Control.Navigation')[0].deactivate();
							map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].deactivate();
							$this.removeClass('active');
						}
					}
				});
	
				// add pan zoom bar
				_pe.fn.geomap.addPanZoomBar(geomap);					
	
				// fix for the defect #3204 http://tbs-sct.ircan-rican.gc.ca/issues/3204
				if (!_pe.mobile) {
					$mapDiv.before('<details id="geomap-details-' + geomap.uniqueid + '" class="wet-boew-geomap-detail" style="width:' + ($mapDiv.width() - 10) + 'px;"><summary>' + _pe.dic.get('%geo-accessibilizetitle') + '</summary><p>' + _pe.dic.get('%geo-accessibilize') + '</p></details>');
					_pe.polyfills.enhance('detailssummary', _pe.main.find('#geomap-details-' + geomap.uniqueid));
				}
			}

			// zoom to the maximum extent specified
			map.zoomToMaxExtent();			
			
			// add a listener on the window to update map when resized
			window.onresize = function() {		
				$mapDiv.height($mapDiv.width() * 0.8);
				map.updateSize();
				map.zoomToMaxExtent();
			};			
		},

		/*
		 *	Create the map after we load the config file.
		 */
		createMap: function(geomap, opts) {
			// add basemap data
			_pe.fn.geomap.addBasemapData(geomap, opts);

			// create projection objects
			var projLatLon = new OpenLayers.Projection('EPSG:4326'),
				projMap = geomap.map.getProjectionObject();						

			if (opts.debug) {
				_pe.document.trigger('geomap-projection', projMap.getCode());
			}		

			// global variable
			geomap.selectControl = new OpenLayers.Control.SelectFeature();

			// create legend and tab
			if (opts.useLegend) {
				_pe.fn.geomap.createLegend();
			}
			
			// add layer holder
			_pe.fn.geomap.createLayerHolder(geomap, opts.useTab);

			// add tabular data
			_pe.fn.geomap.addTabularData(geomap, opts, projLatLon, projMap);

			// add overlay data
			_pe.fn.geomap.addOverlayData(geomap, opts);

			// load Controls
			_pe.fn.geomap.loadControls(geomap, opts);

			// add WCAG element for the map div
			geomap.gmap.attr({
				'role': 'img',
				'aria-label': _pe.dic.get('%geo-ariamap')
			});
		},

		refreshPlugins: function(geomap) {
			_pe.wb_load({
				'plugins': {
					'tabbedinterface': geomap.glayers.find('.wet-boew-geomap-tabs'),
					'tables': geomap.glayers.find('.createDatatable')
				}
			});
			
			if (_pe.mobile) {
				// enhance the checkboxes with jQuery Mobile
				geomap.glegend.trigger('create');
			}
			
			mapArray[uniqueid] = geomap.map;
			_pe.document.trigger('geomap-ready');
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
