/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * GeoMap plugin
 */
/*global jQuery: false, wet_boew_geomap: false, OpenLayers: false, Proj4js: false*/
(function($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};

	var map,
		selectControl,
		queryLayers = [],
		overlays = 0,
		overlaysLoaded = 0;

	/* local reference */
	_pe.fn.geomap = {
		type: 'plugin',				
		depends: ['openlayers', 'proj4js'],
		debug: false,
		_exec: function(elm) {	
			var opts,
				overrides,
				lib = _pe.add.liblocation;	

			// Defaults
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
				useTab: false
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {				
				useScaleLine: elm.hasClass('scaleline') ? true : undefined,
				useMousePosition: elm.hasClass('position') ? true : undefined,
				debug: elm.hasClass('debug') ? true : false,
				useLegend: elm.hasClass('legend') ? true : false,
				useTab: elm.hasClass('tab') ? true : false
			};			

			// Extend the defaults with settings passed through settings.js (wet_boew_geomap), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_geomap !== 'undefined' ? wet_boew_geomap : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			// Set the language for OpenLayers
			OpenLayers.Lang.setCode(_pe.language);

			// Set the image path for OpenLayers
			OpenLayers.ImgPath = lib + 'images/geomap/';

			// Add projection for default base map
			Proj4js.defs['EPSG:3978'] = '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';

			// Initiate the map. Height set by default. Will be reinitialize by value from user if provided.
			elm.attr('id', 'geomap').height(elm.width() * 0.8);

			_pe.document.on('wb-init-loaded', function() {
				_pe.document.one('geomap-init', function () {
					if (opts.debug) {
						_pe.fn.geomap_debug.init();
					}

					// Load configuration file
					if (typeof opts.layersFile !== 'undefined') {
						$.ajax({
							url: opts.layersFile,
							dataType: 'script',
							async: false,					
							success: function() {
								// Extend opts with data loaded from the configuration file (through wet_boew_geomap)
								$.extend(opts, wet_boew_geomap);

								_pe.fn.geomap.createMap(opts);
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
						_pe.fn.geomap.createMap(opts);
						if (opts.debug) {
							_pe.document.trigger('geomap-overlayNotSpecify');
						}
					} // end load configuration file

					// If there are overlays, wait before calling the plugins
					if (!overlays) {
						_pe.fn.geomap.refreshPlugins();
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
		
		addPanZoomBar: function() {
			
			var panZoomBar = new OpenLayers.Control.PanZoomBar();
			OpenLayers.Util.extend(panZoomBar, {
				draw: function() {
					// initialize our internal div
					var oButtons = this;
					var centered = new OpenLayers.Pixel(7.5, 81);
					OpenLayers.Control.prototype.draw.apply(oButtons, arguments);
			
					// place the controls
					oButtons.buttons = [];
					
					oButtons._addButton('panup', 'transparent.png');
					oButtons._addButton('panleft', 'transparent.png');
					oButtons._addButton('panright', 'transparent.png');
					oButtons._addButton('pandown', 'transparent.png');				
					oButtons._addButton('zoomin', 'transparent.png');
					oButtons._addZoomBar(centered.add(7.5,0));
					oButtons._addButton('zoomout', 'transparent.png');
					oButtons._addButton('zoomworld', 'transparent.png');
			
					// add custom CSS styles
					$(oButtons.slider).attr('class', 'olControlSlider').find('img').attr('class', 'olControlSlider');
					$(oButtons.zoombarDiv).attr('class', 'olControlBar');
					return oButtons.div;
				}
			});
			
			map.addControl(panZoomBar);
			
			/*
			 * Add alt text to map controls and make tab-able
			 * TODO: Fix in OpenLayers so alt text loaded there rather than overriden here (needs to be i18n)
			 */
			var controls = _pe.main.find('div.olControlPanZoomBar div').get(),
				len = controls.length,
				control,
				img,
				altTxt,
				actn;

			while (len--) {
				control = controls[len];
				img = control.getElementsByTagName('img')[0];

				if (typeof img !== 'undefined') {
					actn = control.action;
					if (actn !== undefined) {
						// add alt text
						altTxt = _pe.dic.get('%geo-' + actn);
						control.setAttribute('title', altTxt);
						control.classList.add('olControl' + actn);
						img.tabIndex = 0;
					} else {
						// Add null alt text to slider image since should be ignored
						altTxt = '';
					}
					img.setAttribute('alt', altTxt);
					img.classList.add('olControl' + actn);
				}
			}
		}, // end addPanZoomBar function

		/*
		 * Map feature select
		 */
		onFeatureSelect: function(feature) {					
			$('tr#' + feature.id.replace(/\W/g, '_')).addClass('background-highlight');
		},

		/*
		 *	Map feature unselect
		 */
		onFeatureUnselect: function(feature) {
			$('tr#' + feature.id.replace(/\W/g, '_')).removeClass('background-highlight');
		},

		/*
		 * Get the OpenLayers map object
		 */
		getMap: function() {			
			return map;
		},

		/*
		 *	Create legend
		 */
		createLegend: function() {
			// Create legend div if not there
			if (_pe.fn.geomap.debug && !($('.wet-boew-geomap-legend').length)) {	
				_pe.document.trigger('geomap-warningLegend');		
			}		
		},

		/*
		 *	Create layer holder to add all tabs data (HTML and overlay) and overlay data.
		 */
		createLayerHolder: function(tab) {
			// user wants tabs
			if (tab) {
				// user has specified where they want to put the tabs
				var $tabs = $('.wet-boew-geomap-tabs');
				if ($tabs.length !== 0) {
					$tabs.addClass('wet-boew-tabbedinterface auto-height-none').append('<ul class="tabs"></ul><div class="tabs-panel"></div>');
				// user hasn't specified where they want the tabs
				} else {
					$('.wet-boew-geomap-layers').append('<div class="clear"></div><div class="wet-boew-geomap-tabs wet-boew-tabbedinterface auto-height-none span-8"><ul class="tabs"></ul><div class="tabs-panel"></div></div><div class="clear"></div>');
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
		addLayerData: function(featureTable, enabled, olLayerId, tab) {						
			// add layer to legend
			if ($('.wet-boew-geomap-legend').length !== 0) {
				_pe.fn.geomap.addToLegend(featureTable, enabled, olLayerId);
			}

			var $div = $('.wet-boew-geomap-layers'),
				featureTableId = $(featureTable).attr('id'),
				$layerTab = $('<div id="tabs_' + featureTableId + '">'),
				title = featureTable[0].attributes['aria-label'].value,
				$layerTitle = $('<h3 id="' + featureTableId + '" class="background-light">' + title + '</h3>'),
				$alert = $('<div id="msg_' + featureTableId + '" class="module-attention module-simplify margin-top-medium margin-bottom-medium"><p>' + _pe.dic.get('%geo-hiddenlayer') + '</p></div>');

			if (_pe.fn.geomap.debug && ($div.length === 0)) {
				_pe.document.trigger('geomap-layersNotSpecify');
			}
			
			// if tabs are specified
			if (tab && $('.wet-boew-geomap-tabs').length !== 0) {
				_pe.fn.geomap.addToTabs(featureTable, enabled, olLayerId);
			// tabs are not specified
			} else {
				$layerTab.append($layerTitle, featureTable);
				$div.append($layerTab, '<div class="clear"></div>');	

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
		addToLegend: function(featureTable, enabled, olLayerId) {
			var $div = $('.wet-boew-geomap-legend'),
				$featureTable = $(featureTable),
				featureTableId = $featureTable.attr('id'),
				$fieldset,
				$ul,
				$checked,
				$chkBox,
				$label;	

			if ($div.length !== 0) {			
				// if no legend or fieldset add them
				$fieldset = $div.find('fieldset');
				if ($fieldset.length === 0) {
					$fieldset = $('<fieldset name="legend" data-role="controlgroup"><legend class="wb-invisible">' + _pe.dic.get('%geo-togglelayer') + '</legend></fieldset>').appendTo($div);
				}

				$checked = enabled ? 'checked="checked"' : '';

				$ul = $div.find('ul');
				if ($ul.length === 0) {
					$ul = $('<ul class="list-bullet-none margin-left-none"></ul>').appendTo($fieldset);
				}

				$chkBox = $('<input type="checkbox" id="cb_' + featureTableId + '" value="' + featureTableId + '"' + $checked + ' />');

				$chkBox.on('change', function() {				
					map = _pe.fn.geomap.getMap();
					var layer = map.getLayer(olLayerId),				
						visibility = $('#cb_' + featureTableId).prop('checked') ? true : false,
						$table = $('table#' + featureTableId),
						$parent = $table.parent(),
						$alert;
					layer.setVisibility(visibility);	

					if (!$parent.hasClass('dataTables_wrapper')) {
						$parent = $table;
					}

					$alert = $('div#msg_' + featureTableId);

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
		addToTabs: function(featureTable, enabled) {	
			var $div = $('.wet-boew-geomap-tabs'),
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
				// Check the style type (by default, no type are supplied).
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
		createRow: function(context, zoomTo) {
			// add a row for each feature
			var $row = $('<tr>'),
				cols = [],
				attributes = context.feature.attributes;

			// replace periods with underscores for jQuery!
			if (context.type !== 'head') {
				$row.attr('id', context.id.replace(/\W/g, '_'));
				$row.attr('tabindex', '0');
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
				cols.push(_pe.fn.geomap.addZoomTo($row, context.feature));
			}

			if (context.type !== 'head') {

				// Hover events
				$row.on('mouseenter mouseleave', function(e) {
					var type = e.type,
						$this = $(this),
						selectControl = context.selectControl;
					if (type === 'mouseenter') {
						$this.closest('tr').addClass('background-highlight');
						selectControl.unselectAll();
						selectControl.select(context.feature);
					} else {
						$this.closest('tr').removeClass('background-highlight');
						selectControl.unselectAll();
						selectControl.unselect(context.feature);
					}
				});

				// Keybord events
				$row.on('focus blur', function(e) {
					var type = e.type,
						selectControl = context.selectControl;
					if (type === 'focus') {
						$row.addClass('background-highlight');
						selectControl.unselectAll();
						selectControl.select(context.feature);
					} else {
						$row.removeClass('background-highlight');
						selectControl.unselectAll();
						selectControl.select(context.feature);
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
		onFeaturesAdded: function($table, evt, zoomTo, datatable) {
			var $head = _pe.fn.geomap.createRow({ 'type':'head', 'feature': evt.features[0] }),
				$foot = _pe.fn.geomap.createRow({ 'type':'head', 'feature': evt.features[0] }),
				thZoom,
				$targetTable = $('table#' + $table.attr('id')),
				$targetTableBody = $targetTable.find('tbody');
			if (zoomTo) {
				thZoom = '<th>' + _pe.dic.get('%geo-zoomfeature') + '</th>';
				$head.append(thZoom);
				$foot.append(thZoom);
			}

			$targetTable.find('thead').append($head);
			$targetTable.find('tfoot').append($foot);
			$.each(evt.features, function(index, feature) {												
				var context = {
					'type': 'body',
					'id': feature.id.replace(/\W/g, '_'),
					'feature': feature,
					'selectControl': selectControl
				};									
				$targetTableBody.append(_pe.fn.geomap.createRow(context, zoomTo));
			});

			if (datatable) {	
				$targetTable.addClass('createDatatable');
			}
		},
		
		/*
		 * Handle overlays once loading has ended
		 *
		 */
		onLoadEnd: function() {
			// TODO: Fix no alt attribute on tile image in OpenLayers rather than use this override
			_pe.main.find('.olTileImage').attr('alt', '');

			// we need to call it here as well because if we use a config outside the domain it is called
			// before the table is created. We need to call it only once loading for all overlays has ended
			overlaysLoaded += 1;
			if (overlays === overlaysLoaded) {
				_pe.fn.geomap.refreshPlugins();
				overlays = 0;
				overlaysLoaded = 0;
			}
		},

		/*
		 * Handle features once they have been added to the map for tabular data
		 *
		 */
		onTabularFeaturesAdded: function(feature, zoomColumn, table) {
			// Find the row
			var $tr = $('tr#' + feature.id.replace(/\W/g, '_'));

			// add zoom column
			if (zoomColumn) {
				$tr.append(_pe.fn.geomap.addZoomTo($tr, feature));
			}

			$tr.attr('tabindex', '0');						
			$tr.on('mouseenter mouseleave', function(e) {
				var type = e.type;
				if (type === 'mouseenter') {
					$tr.addClass('background-highlight');
					selectControl.select(feature);
				} else {
					$tr.removeClass('background-highlight');
					selectControl.unselect(feature);
				}
			});

			// Keybord events
			$tr.on('focus blur', function(e) {
				var type = e.type;
				if (type === 'focus') {
					$tr.addClass('background-highlight');
					selectControl.select(feature);
				} else {
					$tr.removeClass('background-highlight');
					selectControl.unselect(feature);
				}
			});
		},

		/*
		 *	Add the zoom to column
		 *
		 */
		addZoomTo: function(row, feature){
			var $ref = $('<td><a href="javascript:;" class="button"><span class="wb-icon-target"></span>' + _pe.dic.get('%geo-zoomfeature') + '</a></td>').on('click focus blur', 'a', function(e) {
				var type = e.type;
				if (type === 'click') {
					e.preventDefault();			
					map.zoomToExtent(feature.geometry.bounds);	
					row.closest('tr').attr('class', 'background-highlight');
					selectControl.unselectAll();
					selectControl.select(feature);
					$.mobile.silentScroll(_pe.focus(_pe.main.find('#geomap')).offset().top);
				} else if (type === 'focus') {
					row.addClass('background-highlight');
					selectControl.unselectAll();
					selectControl.select(feature);
				} else {
					row.removeClass('background-highlight');
					selectControl.unselectAll();
					selectControl.unselect(feature);
				}
			});
			return $ref;
		},

		/*
		 *	Set the default basemap
		 */
		setDefaultBaseMap: function(opts) {			
			if (opts.debug) {
				_pe.document.trigger('geomap-basemapDefault');
			}

			// Add the Canada Transportation Base Map (CBMT)			
			map.addLayer(new OpenLayers.Layer.WMS(
				_pe.dic.get('%geo-basemaptitle'),
				_pe.dic.get('%geo-basemapurl'),
				{
					layers: _pe.dic.get('%geo-basemaptitle'),
					version: '1.1.1',
					format: 'image/png'
				},
				{
					isBaseLayer: true,
					singleTile: true,
					ratio: 1.0,
					projection: 'EPSG:3978'
				}
			));		
		},

		/*
		 * Set default map option
		 */
		setDefaultMapOptions: function() {
			// use map options for the Canada Transportation Base Map (CBMT)
			var mapOptions = {
				maxExtent: new OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),			
				maxResolution: 'auto',
				projection: 'EPSG:3978',
				restrictedExtent: new OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),
				units: 'm',
				displayProjection: new OpenLayers.Projection('EPSG:4269') /* only used by specific controls (i.e. MousePosition) */ ,
				numZoomLevels: 12,
				aspectRatio: 0.8
			};

			return mapOptions;
		},

		/*
		 *	Add baseMap data
		 */		
		addBasemapData: function(opts) {			
			var mapOptions = {},
				mapOpts,
				hasBasemap = (typeof opts.basemap !== 'undefined' && opts.basemap.length !== 0),
				basemap,
				$div = $('#geomap');

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

			map = new OpenLayers.Map('geomap', $.extend(opts.config, mapOptions));		

			// Check to see if a base map has been configured. If not add the
			// default base map (the Canada Transportation Base Map (CBMT))
			if (hasBasemap) {
				if (!basemap.options) {
					basemap.options = {};
				} //projection: 'EPSG:4326' };

				basemap.options.isBaseLayer = true;					

				if (basemap.type === 'wms') {
					map.addLayer(
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
					map.addLayer(
						new OpenLayers.Layer.ArcGIS93Rest(
							basemap.title,
							basemap.url
						)
					);									
				}
			} else {
				_pe.fn.geomap.setDefaultBaseMap(opts);
			}
			
			// Set aspect ratio
			$div.height($div.width() * mapOptions.aspectRatio);
		},

		/*
		 *	Add overlay data
		 */
		addOverlayData: function(opts) {
			var overlayData = opts.overlays,
				olLayer;
			if (overlayData.length !== 0) {
				overlays = overlayData.length;
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
										internalProjection: map.getProjectionObject(),
										externalProjection: new OpenLayers.Projection('EPSG:4269'),
										read: function(data) {
											var items = this.getElementsByTagNameNS(data, '*', 'Placemark'),
												row, $row, i, len, feature, atts, features = [],
												layerAttributes = layer.attributes,
												name;

											// When read from server, data is string instead of #document
											if (typeof data === 'string') {
												data = (new DOMParser()).parseFromString(data, 'text/xml');
											} 

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
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									},
									'loadend': function() {
										_pe.fn.geomap.onLoadEnd();
									}
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.visibility = true; // to force featuresadded listener
						map.addLayer(olLayer);
						queryLayers.push(olLayer);
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;
					} else if (layer.type === 'atom') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
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
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									},
									'loadend': function() {
										_pe.fn.geomap.onLoadEnd();
									}									
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.visibility = true;	// to force featuresadded listener		
						queryLayers.push(olLayer);
						map.addLayer(olLayer);									
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;					
					} else if (layer.type === 'georss') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
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
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									},
									'loadend': function() {
										_pe.fn.geomap.onLoadEnd();
									}								
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.visibility = true;	// to force featuresadded listener		
						queryLayers.push(olLayer);
						map.addLayer(olLayer);											
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;
					} else if (layer.type === 'json') {
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
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
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									},
									'loadend': function() {
										_pe.fn.geomap.onLoadEnd();
									}									
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);	
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;					
						olLayer.visibility = true;	// to force featuresadded listener		
						queryLayers.push(olLayer);
						map.addLayer(olLayer);											
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
						olLayer.visibility = layer.visible;			
					} else if (layer.type ==='geojson') {						
						olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
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
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									},
									'loadend': function() {
										_pe.fn.geomap.onLoadEnd();
									}
								},
								styleMap: _pe.fn.geomap.getStyleMap(overlayData[index])
							}
						);
						olLayer.name = 'overlay_' + index;
						olLayer.datatable = layer.datatable;
						olLayer.visibility = true;	// to force featuresadded listener		
						queryLayers.push(olLayer);
						map.addLayer(olLayer);										
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
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
		addTabularData: function(opts, projLatLon, projMap) {
			var thZoom = '<th>' + _pe.dic.get('%geo-zoomfeature') + '</th>',
				wktFeature,
				wktParser = new OpenLayers.Format.WKT({						
					'internalProjection': projMap,
					'externalProjection': projLatLon
				});
			$.each(opts.tables, function(index, table) {
				var $table = $('table#' + table.id),
					attr = [],
					tableLayer = new OpenLayers.Layer.Vector($table.find('caption').text(), {
						styleMap: _pe.fn.geomap.getStyleMap(opts.tables[index])
					});

				// Get the attributes from table header
				$table.find('th').each(function(index, attribute) {
					attr[index] = attribute.textContent;
				});				

				// If zoomTo add the header and footer column headers
				if (opts.tables[index].zoom) {
					$table.find('thead').find('tr').append(thZoom);
					$table.find('tfoot').find('tr').append(thZoom);					
				}

				// Loop through each row
				$table.find('tr').each(function(index, row) {

					// Create an array of attributes: value
					var attrMap = {},
						$row = $(row),
						geomType = $row.attr('data-type'), // get the geometry type
						vectorFeatures;
					$row.find('td').each(function(index, feature) {	
						attrMap[attr[index]] = feature.lastChild.textContent;
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

						// Set the table row id
						$row.attr('id', vectorFeatures.id.replace(/\W/g, '_'));

						// Add the attributes to the feature then add it to the map
						vectorFeatures.attributes = attrMap;										
						tableLayer.addFeatures([vectorFeatures]);
					}
				});

				tableLayer.id = 'table#' + table.id;
				tableLayer.datatable = opts.tables[index].datatable;
				tableLayer.name = table.id;
				map.addLayer(tableLayer);
				queryLayers.push(tableLayer);

				if (opts.tables[index].tab) {
					_pe.fn.geomap.addLayerData($table, true, tableLayer.id, opts.tables[index].tab);
				} else if ($('.wet-boew-geomap-legend')) {
					_pe.fn.geomap.addToLegend($table, true, tableLayer.id);
				}
				
				if (opts.tables[index].datatable) {
					$table.addClass('wet-boew-tables');
				}
			});		
		},

		/*
		 *	Load controls
		 */
		loadControls: function(opts){
			var $geomap = _pe.main.find('.wet-boew-geomap'),
				$mapDiv = $('#' + map.div.id);

			// TODO: ensure WCAG compliance before enabling			
			selectControl = new OpenLayers.Control.SelectFeature(
				queryLayers,
				{
					onSelect: this.onFeatureSelect,
					onUnselect: this.onFeatureUnselect
				}
			);			

			map.addControl(selectControl);			
			selectControl.activate();			

			// Add the select control to every tabular feature. We need to this now because the select control needs to be set.
			$.each(opts.tables, function(index, table) {
				var zoomColumn = opts.tables[index].zoom,
					tableId = 'table#' + table.id;
				$.each(queryLayers, function(index, layer) {
					if (layer.id === tableId){
						$.each(layer.features, function(index, feature) {
							_pe.fn.geomap.onTabularFeaturesAdded(feature, zoomColumn, opts.tables[index], opts);
						});
					}
				});

				if (table.datatable) {
					$(tableId).addClass('createDatatable');
				}
			});

			if (opts.useMousePosition) {
				map.addControl(new OpenLayers.Control.MousePosition());
			}
			if (opts.useScaleLine) {
				map.addControl(new OpenLayers.Control.ScaleLine());
			}

			map.addControl(new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
			map.addControl(new OpenLayers.Control.KeyboardDefaults());			
			map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].deactivate();

			// enable the keyboard navigation when map div has focus. Disable when blur
			// Enable the wheel zoom only on hover
			$geomap.attr('tabindex', '0').on('mouseenter mouseleave focus blur', function(e) {
				var type = e.type;
				if (type === 'mouseenter') {
					map.getControlsByClass('OpenLayers.Control.Navigation')[0].activate();
				} else if (type === 'mouseleave') {
					map.getControlsByClass('OpenLayers.Control.Navigation')[0].deactivate();					
				} else if (type === 'focus') {
					map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].activate();
				} else {
					map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].deactivate();
				}
			});

			// add pan zoom bar
			_pe.fn.geomap.addPanZoomBar();					

			// zoom to the maximum extent specified
			map.zoomToMaxExtent();			

			// fix for the defect #3204 http://tbs-sct.ircan-rican.gc.ca/issues/3204
			if (!_pe.mobile) {
				$mapDiv.before('<p><strong>' + _pe.dic.get('%geo-accessibilize') + '</p>');
			}

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
		createMap: function(opts) {
			// Add basemap data
			_pe.fn.geomap.addBasemapData(opts);

			// Create projection objects
			var projLatLon = new OpenLayers.Projection('EPSG:4326'),
				projMap = map.getProjectionObject(),
				$geomap = _pe.main.find('.wet-boew-geomap');						

			if (opts.debug) {
				_pe.document.trigger('geomap-projection', projMap.getCode());
			}		

			// Global variable
			selectControl = new OpenLayers.Control.SelectFeature();

			// Create legend and tab
			if (opts.useLegend) {
				_pe.fn.geomap.createLegend();
			}
			_pe.fn.geomap.createLayerHolder(opts.useTab);

			// Add tabular data
			_pe.fn.geomap.addTabularData(opts, projLatLon, projMap);

			// Add overlay data
			_pe.fn.geomap.addOverlayData(opts);

			// Load Controls
			_pe.fn.geomap.loadControls(opts);

			// Add WCAG element for the map div
			$geomap.attr({
				'role': 'img',
				'aria-label': _pe.dic.get('%geo-ariamap')
			});
		},

		refreshPlugins: function() {
			_pe.wb_load({
				'plugins': {
					'tables': _pe.main.find('.createDatatable'),
					'tabbedinterface': _pe.main.find('.wet-boew-tabbedinterface')
				}
			});

			if (_pe.mobile) {
				// Enhance the checkboxes with jQuery Mobile
				_pe.main.find('.wet-boew-geomap-legend').trigger('create');
			}
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
