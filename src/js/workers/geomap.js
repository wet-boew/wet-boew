/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * GeoMap plugin
 */
/*global jQuery: false, pe: false, wet_boew_geomap: false*/
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
		accessibilize: function() {	
			
			/*
			 *	Add alt text to map controls and make tab-able
			 */
			var mapControl = _pe.dic.get('%geo-mapcontrol');
			$('div.olButton').each(function() {
				
				var $div = $(this),
					$img = $div.find('img.olAlphaImg'),
					altTxt = mapControl,
					actn = this.action;

				if (actn !== undefined) {
					this.tabIndex = 0;

					// add alt text
					altTxt = _pe.dic.get('%geo-' + actn);
					$img.attr('alt', altTxt);
					$div.attr('title', altTxt);
				}
			});			
			
		}, // end accessibilize function		
	 
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
			if (!($('.wet-boew-geomap-legend').length)) {	

				// Check to see if a legend container is provided			
				if ($('.wet-boew-geomap').hasClass('debug')) {		
					$('div#wb-main-in').prepend('<div class="module-attention span-8"><h3>' + _pe.fn.geomap.getLocalization('warning') + '</h3><p>' + _pe.fn.geomap.getLocalization('warningLegend') + '</p></div>');	
				}	
				
				// removed this for now - we need to rethink this as it is difficult 
				// to ensure a semantically and structurally sound markup
				//$('.wet-boew-geomap').parent().after('<div class=".wet-boew-geomap-legend"><h2>Legend</h2><div class="wet-boew-geomap-legend"></div></div><div class="clear"></div>');			
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
				if ($tabs.length) {
					$tabs.addClass('wet-boew-tabbedinterface auto-height-none').append('<ul class="tabs"></ul><div class="tabs-panel"></div>');
				// user hasn't specified where they want the tabs
				} else { 
					$('.wet-boew-geomap-layers').append('<div class="clear"></div><div class="wet-boew-geomap-tabs wet-boew-tabbedinterface auto-height-none"><ul class="tabs"></ul><div class="tabs-panel"></div></div><div class="clear"></div>');
				}
			}
		},
		
		/* 
		 * Create a table for vector features added in Load Overlays
		 */
		createTable: function(index, title, caption, datatable) {
			return $('<table class="table-simplify' + (datatable ? ' wet-boew-tables' : '') + ' width-100" aria-label="' + title + '" id="overlay_' + index + '">' + '<caption>' + caption + '</caption><thead></thead><tbody></tbody>' + (datatable ? '<tfoot></tfoot>' : '') + '</table>');
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

			// TODO: add debug message for div with id 'wet-boew-geomap-layers' can't be found and prompt to have it added

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

			if (tab && ($('.wet-boew-geomap-tabs').length === 0)) {
				if ($('.wet-boew-geomap').hasClass('debug')) {		
					$('div#wb-main-in').prepend('<div class="module-attention span-8"><h3>' + _pe.fn.geomap.getLocalization('warning') + '</h3><p>' + _pe.fn.geomap.getLocalization('warningTab') + '</p></div>');	
				}
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
					//'pointRadius': 5,
					'strokeWidth': 2.0
				};

			// if style is supplied, create it. If not, create the default one.
			if (typeof elm.style !== 'undefined') {
				// Check the style type (by default, no type are supplied).
				switch(elm.style.type) {
				case 'unique':
					// set the select style then the unique value.
					select = typeof elm.style.select !== 'undefined' ? elm.style.select : selectStyle;
					styleMap = new window.OpenLayers.StyleMap({'select': new window.OpenLayers.Style(select)});
					styleMap.addUniqueValueRules('default', elm.style.field, elm.style.init);
					break;

				case 'rule':
					// set the rules and add to the style
					var rules = [],
						i,
						len;
					for (i = 0, len = elm.style.rule.length; i !== len; i += 1){

						// set the filter						
						switch(elm.style.rule[i].filter){
						case 'LESS_THAN':
							filter = window.OpenLayers.Filter.Comparison.LESS_THAN;
							break;
						case 'LESS_THAN_OR_EQUAL_TO':
							filter = window.OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
							break;
						case 'GREATER_THAN_OR_EQUAL_TO':
							filter = window.OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO;
							break;
						case 'GREATER_THAN':
							filter = window.OpenLayers.Filter.Comparison.GREATER_THAN;
							break;
						case 'BETWEEN':
							filter = window.OpenLayers.Filter.Comparison.BETWEEN;
							break;
						case 'EQUAL_TO':
							filter = window.OpenLayers.Filter.Comparison.EQUAL_TO;
							break;
						case 'NOT_EQUAL_TO':
							filter = window.OpenLayers.Filter.Comparison.NOT_EQUAL_TO;
							break;
						case 'LIKE':
							filter = window.OpenLayers.Filter.Comparison.LIKE;
							break;
						}

						if (elm.style.rule[i].filter !== 'BETWEEN') {
							rules.push(new window.OpenLayers.Rule({
								filter: new window.OpenLayers.Filter.Comparison({
									type: filter,
									property: elm.style.rule[i].field,
									value: elm.style.rule[i].value[0]}),
									symbolizer: elm.style.rule[i].init
								})
							);
						} else {
							rules.push(new window.OpenLayers.Rule({
								filter: new window.OpenLayers.Filter.Comparison({
									type: filter,
									property: elm.style.rule[i].field,
									lowerBoundary: elm.style.rule[i].value[0],
									upperBoundary: elm.style.rule[i].value[1]}),
									symbolizer: elm.style.rule[i].init
								})
							);
						}
					}

					var style = new window.OpenLayers.Style();
					style.addRules(rules);

					// set the select style then the rules.
					select = typeof elm.style.select !== 'undefined' ? elm.style.select : selectStyle;
					styleMap = new window.OpenLayers.StyleMap({
						"default": style, 
						"select": new window.OpenLayers.Style(select)
					});					
					break;
				default:
					// set the select style then the default.
					select = typeof elm.style.select !== 'undefined' ? elm.style.select : selectStyle;
					styleMap = new window.OpenLayers.StyleMap({ 
						"default": new window.OpenLayers.Style(elm.style.init),
						"select": new window.OpenLayers.Style(select)
					});
					break;
				}
			} // end of (typeof elm.style !== 'undefined'
			else {
				styleMap = new window.OpenLayers.StyleMap({ 
					"default": new window.OpenLayers.Style(defaultStyle),
					"select": new window.OpenLayers.Style(selectStyle)
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
				$row.attr('id', context.id.replace(/\W/g, "_"));
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
				cols.push($('<td>'));
				$(cols[cols.length - 1]).empty().append(_pe.fn.geomap.addZoomTo($row, context.feature, context.selectControl));
			}
				
			if (context.type !== 'head') {

				// TODO: support user configured column for link, currently defaults to first column.
				var $col0 = $(cols[0]),
					$link = $('<a href="javascript:;">' + $col0.html() + '</a>');

				$col0.empty().append($link);

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
				$link.on('focus blur', function(e) {
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
					'id': feature.id.replace(/\W/g, "_"),
					'feature': feature,
					'selectControl': selectControl
				};									
				$targetTableBody.append(_pe.fn.geomap.createRow(context, zoomTo));
			});
			
			if (datatable) {	
				$targetTable.addClass('createDatatable');
				//$targetTable.parent().attr('style', 'display: table; width: 100%');
			}
			
			// we need to call it here as well because if we use a config outside the domain it is called
			// before the table is created. We need to call it only once when all overlays are loaded.
			overlaysLoaded += 1;
			if (overlays === overlaysLoaded) {
				_pe.fn.geomap.refreshPlugins();
				overlays = 0;
			}
		},
		
		/*
		 * Handle features once they have been added to the map for tabular data
		 * 
		 */
		onTabularFeaturesAdded: function(feature, zoomColumn, table, opts) {

			// Find the row
			var $tr = $('tr#' + feature.id.replace(/\W/g, '_')),
				$select,
				$link;
				
			// add zoom column
			if (zoomColumn) {
				$tr.append('<td>' + _pe.fn.geomap.addZoomTo($tr, feature).html() + '</td>');
			}

			$select = $tr.find('td.select');						
			if ($select.length !== 0) {
				$link = $select.find('a');
				if ($link.length) {
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
					$link.on('focus blur', function(e) {
						var type = e.type;
						if (type === 'focus') {
							$tr.addClass('background-highlight');
							selectControl.select(feature);
						} else {
							$tr.removeClass('background-highlight');
							selectControl.unselect(feature);
						}
					});
				} else { 
					if (opts.debug) {
						$select.append('<div class="module-alert"><h3>' + _pe.fn.geomap.getLocalization('error') + '</h3><p>' + _pe.fn.geomap.getLocalization('errorSelect') + '</p></div>');		
					}
				}
			} else {
				if (opts.debug) {
					$tr.closest('table').before('<div class="module-alert"><h3>' + _pe.fn.geomap.getLocalization('error') + '</h3><p>' + _pe.fn.geomap.getLocalization('errorNoSelect') + '</p></div>');
				}
			}
		},
		
		/*
		 *	Add the zoom to column
		 * 
		 */
		addZoomTo: function(row, feature){
			var $ref = $('<a href="javascript:;" class="button"><span class="wb-icon-target"></span>' + _pe.dic.get('%geo-zoomfeature') + '</a>').on('click focus blur', function(e) {
				var type = e.type;
				if (type === 'click') {
					e.preventDefault();			
					map.zoomToExtent(feature.geometry.bounds);	
					row.closest('tr').attr('class', 'background-highlight');
					selectControl.unselectAll();
					selectControl.select(feature);
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
				window.console.log(_pe.fn.geomap.getLocalization('basemapDefault'));
			}
	
			// Add the Canada Transportation Base Map (CBMT)			
			map.addLayer(new window.OpenLayers.Layer.WMS(
				"CBMT", 
				"http://geogratis.gc.ca/maps/CBMT", 
				{
					layers: 'CBMT',
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
		setDefaultMapOptions: function(){
			// use map options for the Canada Transportation Base Map (CBMT)
			var mapOptions = {
				maxExtent: new window.OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),			
				maxResolution: 'auto',
				projection: 'EPSG:3978', 
				restrictedExtent: new window.OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),
				units: 'm',
				displayProjection: new window.OpenLayers.Projection('EPSG:4269') /* only used by specific controls (i.e. MousePosition) */ ,
				numZoomLevels: 12
			};

			return mapOptions;
		},
		
		/*
		 *	Add baseMap data
		 */		
		addBasemapData: function(wet_boew_geomap, opts) {			
			var mapOptions = {},
				mapOpts,
				basemap;
			if (typeof wet_boew_geomap !== 'undefined') {
				if (wet_boew_geomap.basemap && wet_boew_geomap.basemap.mapOptions) {				
					mapOpts = wet_boew_geomap.basemap.mapOptions;
					try {
						mapOptions.maxExtent = new window.OpenLayers.Bounds(mapOpts.maxExtent.split(','));
						mapOptions.maxResolution = mapOpts.maxResolution;
						mapOptions.projection = mapOpts.projection; 
						mapOptions.restrictedExtent = new window.OpenLayers.Bounds(mapOpts.restrictedExtent.split(','));
						mapOptions.units = mapOpts.units;
						mapOptions.displayProjection = new window.OpenLayers.Projection(mapOpts.displayProjection);
						mapOptions.numZoomLevels = mapOpts.numZoomLevels;
					} catch (err) {
						if (opts.debug) {
							window.console.log(_pe.fn.geomap.getLocalization('baseMapMapOptionsLoadError'));
						}
					}
				} else if (!wet_boew_geomap.basemap) {
					// use map options for the Canada Transportation Base Map (CBMT)
					mapOptions = _pe.fn.geomap.setDefaultMapOptions();
				}
			} else {
				mapOptions = _pe.fn.geomap.setDefaultMapOptions();
			}

			map = new window.OpenLayers.Map('geomap', $.extend(opts.config, mapOptions));		

			// Check to see if a base map has been configured. If not add the
			// default base map (the Canada Transportation Base Map (CBMT))
			if (typeof wet_boew_geomap !== 'undefined') {
				if (wet_boew_geomap.basemap) {
					basemap = wet_boew_geomap.basemap;

					if (!basemap.options) {
						basemap.options = {};
					} //projection: 'EPSG:4326' };

					basemap.options.isBaseLayer = true;					

					if (basemap.type === 'wms') {
						map.addLayer(
							new window.OpenLayers.Layer.WMS(
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
							new window.OpenLayers.Layer.ArcGIS93Rest(
								basemap.title, 
								basemap.url
							)
						);									
					}
				} else {
					_pe.fn.geomap.setDefaultBaseMap(opts);
				}
			} else {
				_pe.fn.geomap.setDefaultBaseMap(opts);
			}
		},
		
		/*
		 *	Add overlay data
		 */
		addOverlayData: function(wet_boew_geomap) {
			
			if (typeof wet_boew_geomap !== 'undefined')	{
				if (wet_boew_geomap.overlays) {
					var olLayer;
					overlays = wet_boew_geomap.overlays.length;	
					$.each(wet_boew_geomap.overlays, function(index, layer) {	
						var $table = _pe.fn.geomap.createTable(index, layer.title, layer.caption, layer.datatable);

						if (layer.type === 'kml') {	
							olLayer = new window.OpenLayers.Layer.Vector(
								layer.title, {							
									strategies: [new window.OpenLayers.Strategy.Fixed()],
									protocol: new window.OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new window.OpenLayers.Format.KML({
										extractStyles: !layer.style,									
										extractAttributes: true,
										internalProjection: map.getProjectionObject(),
										externalProjection: new window.OpenLayers.Projection('EPSG:4269'),

										read: function(data) {
											var items = this.getElementsByTagNameNS(data, '*', 'Placemark'),
												row, i, len, feature, atts = {}, features = [],
												a = layer.attributes;

												for (i = 0, len = items.length; i !== len; i += 1) {												
													row = items[i];			
													feature = new window.OpenLayers.Feature.Vector();														
													feature.geometry = this.parseFeature(row).geometry;

													// parse and store the attributes
													atts = {};

													// TODO: test on nested attributes
													for (var name in a) {
														if (a.hasOwnProperty(name)) {
															atts[a[name]] = $(row).find(name).text();
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
										"featuresadded": function(evt) {	
											_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
										}									
									},
									styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
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
							olLayer = new window.OpenLayers.Layer.Vector(
								layer.title, {
									projection: map.displayProjection,
									strategies: [new window.OpenLayers.Strategy.Fixed()],
									protocol: new window.OpenLayers.Protocol.HTTP({
										url: layer.url,
										format: new window.OpenLayers.Format.Atom({
												read: function(data) {											
													var items = this.getElementsByTagNameNS(data, '*', 'entry'),
														row, $row, i, len, feature, atts = {}, features = [],
														a = layer.attributes;

													for (i = 0, len = items.length; i !== len; i += 1) {												
														row = items[i];
														$row = $(row);
														feature = new window.OpenLayers.Feature.Vector();														
														feature.geometry = this.parseFeature(row).geometry;

														// parse and store the attributes
														atts = {};

														// TODO: test on nested attributes
														for (var name in a) {
															if (a.hasOwnProperty(name)) {
																atts[a[name]] = $row.find(name).text();														
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
										"featuresadded": function(evt) {											
											_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
										}									
									},
									styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
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
							olLayer = new window.OpenLayers.Layer.Vector(
								layer.title, {
									projection: map.displayProjection,
									strategies: [new window.OpenLayers.Strategy.Fixed()],
									protocol: new window.OpenLayers.Protocol.HTTP({
										url: layer.url,
										format: new window.OpenLayers.Format.GeoRSS({									
											read: function(data) {											
												var items = this.getElementsByTagNameNS(data, "*", "item"),
													row, $row, i, len, feature, atts = {}, features = [];

												for (i = 0, len = items.length; i !== len; i += 1) {												
													row = items[i];
													$row = $(row);			
																									
													feature = new window.OpenLayers.Feature.Vector();											
													
													feature.geometry = this.createGeometryFromItem(row);
													
													// parse and store the attributes
													atts = {};
													var a = layer.attributes;
													
													// TODO: test on nested attributes
													for (var name in a) {
														if (a.hasOwnProperty(name)) {
															atts[a[name]] = $row.find(name).text();														
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
										"featuresadded": function(evt) {
											_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
										}									
									},
									styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
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
							olLayer = new window.OpenLayers.Layer.Vector( 
								layer.title, { 
									projection: map.displayProjection, 
									strategies: [new window.OpenLayers.Strategy.Fixed()], 
									protocol: new window.OpenLayers.Protocol.Script({ 
										url: layer.url,
										params: layer.params,
										format: new window.OpenLayers.Format.GeoJSON({										
											read: function(data) {											
												var items = data[layer.root] ? data[layer.root] : data,
													row, i, len, feature, atts = {}, features = [];
												
												for (i = 0, len = items.length; i !== len; i += 1) {												
													row = items[i];												
													feature = new window.OpenLayers.Feature.Vector();												
													feature.geometry =	this.parseGeometry(row.geometry);
													
													// parse and store the attributes
													atts = {};
													var a = layer.attributes;
													
													// TODO: test on nested attributes
													for (var name in a) {
														if (a.hasOwnProperty(name)) {
															atts[a[name]] = row[name];														
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
										"featuresadded": function(evt) {	
											_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
										}									
									},
									styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
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
							olLayer = new window.OpenLayers.Layer.Vector( 
								layer.title, { 
									projection: map.displayProjection, 
									strategies: [new window.OpenLayers.Strategy.Fixed()], 
									protocol: new window.OpenLayers.Protocol.Script({ 
										url: layer.url,
										params: layer.params,
										format: new window.OpenLayers.Format.GeoJSON({
											read: function(data) {

												var items = data.features,
													i, len, row, feature, atts = {}, features = [],
													a = layer.attributes;
												
												for (i = 0, len = items.length; i !== len; i += 1) {												
													row = items[i];												
													feature = new window.OpenLayers.Feature.Vector();												
													feature.geometry = this.parseGeometry(row.geometry);
													
													// parse and store the attributes
													atts = {};
													
													// TODO: test on nested attributes
													for (var name in a) {
														if (a.hasOwnProperty(name)) {
															atts[a[name]] = row.properties[name];														
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
										"featuresadded": function(evt) {
											_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
										}
									},
									styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
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
			}
		},
		
		/*
		* Add tabluar data
		* 
		* Sample tables object:
		* 
		*	tables: [ 
		*		{ id: 'cityE', strokeColor: '#FF0000', fillcolor: '#FF0000' } 
		*	] 
		*/	
		addTabularData: function(opts, projLatLon, projMap) {
			var thZoom = '<th>' + _pe.dic.get('%geo-zoomfeature') + '</th>',
				wktFeature,
				wktParser = new window.OpenLayers.Format.WKT({						
					'internalProjection': projMap, 
					'externalProjection': projLatLon
				});
			$.each(opts.tables, function(index, table) {
				var $table = $('table#' + table.id),
					attr = [],
					tableLayer = new window.OpenLayers.Layer.Vector($table.find('caption').text(), {
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
						if (!($(feature).hasClass('geometry'))) {
							attrMap[attr[index]] = feature.lastChild.textContent;
						}
					});

					if (typeof geomType !== 'undefined') {
						if (geomType === 'bbox') {
							var bbox = $row.attr('data-geometry').split(',');
							wktFeature = "POLYGON((" + 
								bbox[0] + " " + bbox[1] + ", " +
								bbox[0] + " " + bbox[3] + ", " +
								bbox[2] + " " + bbox[3] + ", " +
								bbox[2] + " " + bbox[1] + ", " +
								bbox[0] + " " + bbox[1] + 
							"))";
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
			var $geomap = $('.wet-boew-geomap'),
				$mapDiv = $('#' + map.div.id);
			
			// TODO: ensure WCAG compliance before enabling			
			selectControl = new window.OpenLayers.Control.SelectFeature(
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
				map.addControl(new window.OpenLayers.Control.MousePosition());
			}
			if (opts.useScaleLine) {
				map.addControl(new window.OpenLayers.Control.ScaleLine());
			}
			map.addControl(new window.OpenLayers.Control.PanZoomBar({ zoomWorldIcon: true }));
			map.addControl(new window.OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
			
			map.addControl(new window.OpenLayers.Control.KeyboardDefaults());			
			map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].deactivate();
					
			// enable the keyboard navigation when map div has focus. Disable when blur
			// Enable the wheel zoom only on hover
			$geomap.attr('tabindex', '0').css('border', 'solid 1px #CCC').on('mouseenter mouseleave focus blur', function(e) {
				var type = e.type,
					$this = $(this);
				if (type === 'mouseenter') {
					map.getControlsByClass('OpenLayers.Control.Navigation')[0].activate();
					$this.css('border', 'solid 1px blue');
				} else if (type === 'mouseleave') {
					map.getControlsByClass('OpenLayers.Control.Navigation')[0].deactivate();					
					$this.css('border', 'solid 1px #CCC');
				} else if (type === 'focus') {
					map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].activate();
					$this.css('border', 'solid 1px blue');
				} else {
					map.getControlsByClass('OpenLayers.Control.KeyboardDefaults')[0].deactivate();
					$this.css('border', 'solid 1px #FFF');
				}
			});
			
			// add accessibility enhancements
			this.accessibilize();					
			
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
		createMap: function(wet_boew_geomap, opts) {
			
			// Add basemap data
			_pe.fn.geomap.addBasemapData(wet_boew_geomap, opts);
					
			// Create projection objects
			var projLatLon = new window.OpenLayers.Projection('EPSG:4326'),
				projMap = map.getProjectionObject(),
				$geomap = $('.wet-boew-geomap');						

			if (opts.debug) {
				window.console.log(_pe.fn.geomap.getLocalization('projection') + ' ' + projMap.getCode());
			}			
			
			// Global variable
			selectControl = new window.OpenLayers.Control.SelectFeature();
			
			// Create legend and tab
			if (opts.useLegend) {
				_pe.fn.geomap.createLegend();
			}
			_pe.fn.geomap.createLayerHolder(opts.useTab);
						
			// Add tabular data
			_pe.fn.geomap.addTabularData(opts, projLatLon, projMap);
			
			// Add overlay data
			_pe.fn.geomap.addOverlayData(wet_boew_geomap);

			// Load Controls
			_pe.fn.geomap.loadControls(opts);

			// Add WCAG element for the map div
			$geomap.attr({'role': 'img', 'aria-label': _pe.dic.get('%geo-ariamap')});
		},
		
		/*
		 *	Localization for debug message
		 * 
		 * TODO: do it for accessibilize function after new icon
		 */
		getLocalization: function(mess) {
			
			var english = {
				debugMode: 'WET-Geomap: running in DEBUG mode',
				debugMess:'When running in debug mode Geomap will provide inline error and help messages and write useful debugging information into the console. Disable debug mode by removing the <em>debug</em> class.',
				overlayLoad: 'WET-Geomap: overlays were loaded successfully',
				overlayNotLoad: 'WET-Geomap: an error occurred while loading overlays',
				basemapDefault: 'WET-Geomap: using default basemap',
				projection: 'WET-Geomap: using projection',
				error: 'WET-Geomap ERROR',
				errorSelect: 'This cell has the <em>select</em> class but no link was found. Please add a link to this cell.',
				errorNoSelect: 'This table contains rows that do not have a cell with the <em>select</em> class. Please ensure that each row has exactly one cell with the <em>select</em> class and that the cell includes a link.',
				warning: 'WET-Geomap WARNING',
				warningLegend: 'No div element with a class of <em>wet-boew-geomap-legend</em> was found. If you require a legend either add a div with a class of <em>wet-boew-geomap-legend</em>.',
				overlayNotSpecify: 'WET-Geomap: overlays file not specified',
				baseMapMapOptionsLoadError: "WET-Geomap: an error occurred when loading the mapOptions in your basemap configuration. Please ensure that you have the following options set: maxExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), maxResolution (e.g. 'auto'), projection (e.g. 'EPSG:3978'), restrictedExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), units (e.g. 'm'), displayProjection: (e.g. 'EPSG:4269'), numZoomLevels: (e.g. 12).",
				warningTab: 'No class <em>tab</em> in wet-boew-geomap but a table has tab attribute set to true.'
			};
			
			var french = {
				debugMode: 'BOEW-Géocarte : mode débogage activé',
				debugMess:'Lors de l\'exécution en mode débogage Geomap donne des messages d\'erreur, des messages d\'aide et donneras de l\'information utile dans la console de débogage. Désactiver le mode débogage en supprimant la classe <em>debug</em>.',
				overlayLoad: 'BOEW-Géocarte : Les couches de superpositions ont été chargées avec succès',
				overlayNotLoad: 'BOEW-Géocarte : une erreur est survenue lors du chargement des couches de superpositions',
				basemapDefault: 'BOEW-Géocarte : la carte de base par défaut est utilisée',
				projection: 'BOEW-Géocarte : la projection utilisée est',
				error: 'BOEW-Géocarte ERREUR',
				errorSelect: 'Cette cellule a la classe <em>select</em> mais aucun lien n\'a été trouvé. S\'il vous plaît, ajouter un lien à cette cellule.',
				errorNoSelect: 'Cette table contient des lignes qui n\'ont pas de cellule avec la classe <em>select</em>. S\'il vous plaît, assurer vous que chaque ligne a exactement une cellule avec la classe <em>select</em> et celle-ci doit contenir un lien.',
				warning: 'BOEW-Geomap AVERTISSEMENT',
				warningLegend: 'Aucun élément div comportant une classe <em>wet-boew-geomap-legend</em> n\' été trouvé. Si vous avez besoin d\'une légende, vous pouvez ajouter un élément div avec une classe <em>wet-boew-geomap-legend</em> .',
				overlayNotSpecify: 'BOEW-Géocarte : fichier des couches de superpositions non spécifié',
				baseMapMapOptionsLoadError: 'BOEW-Géocarte : une erreur est survenue lors du chargement des options de configuration de votre carte de base. S\'il vous plaît, vérifiez que vous avez l\'ensemble des options suivantes: maxExtent (ex: \'-3000000,0, -800000,0, 4000000,0, 3900000,0\'), maxResolution (ex: \'auto\'), projection (ex: \'EPSG: 3978\'), restrictedExtent (ex: \'-3000000,0 , -800000,0, 4000000,0, 3900000,0\'), units (ex: \'m\'), displayProjection (ex: \'EPSG: 4269\'), numZoomLevels (ex: 12).',	
				warningTab: 'Il n\'y a pas de classe <em>tab</em> dans wet-boew-geomap mais une table a l\'attribut égal vrai.'
			};
			
			var message = (_pe.language === 'en') ? english[mess] : french[mess];
			return message;
		},
				
		refreshPlugins: function() {
			var $holder,
				$createDatatable = $('.createDatatable'),
				$tabbedInterface = $('.wet-boew-tabbedinterface');
			if (!pe.mobile) {
				_pe.wb_load({'plugins': {'tables': $createDatatable, 'tabbedinterface': $tabbedInterface}});
					
				// For each datatable in tabs, set some style to solve the layout problem
				$createDatatable.each(function(index, $feature) {
					$holder = ($('table#' + $feature.id)).parent();
					if ($holder.attr('id') === 'tabs_' + $feature.id) {
						$holder.attr('style', 'display: table; width: 100%');
					}
				});
			} else {
				// In mobile we need to do it the oposite order.
				_pe.wb_load({'plugins': {'tabbedinterface': $tabbedInterface, 'tables': $createDatatable}});
				
				// For each datatable, create the wrapper around it and set display:table to solve layout problem.
				$createDatatable.each(function(index, $feature) {
					$holder = ($('table#' + $feature.id));
					$holder.wrap('<div id="' + $feature.id + '_wrapper" class="dataTables_wrapper width-100" style="display: table"></div>');
				});
				
				// Set the opacity to solve transparency problem.
				$('.wet-boew-tables').addClass('opacity-100');
				$('.table-simplify').addClass('opacity-100');
				
				// Set display table to solve the table and hidden message appears at the same time
				//$('.table-simplify').css('dispaly', 'table');
			}
		},
		
		_exec: function(elm) {	
			var opts,
				overrides;	

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


			if (opts.debug) {
				window.console.log(_pe.fn.geomap.getLocalization('debugMode'));
				$('#wb-main-in').prepend('<div class="module-attention span-8"><h3>' + _pe.fn.geomap.getLocalization('debugMode') + '</h3><p>' + pe.fn.geomap.getLocalization('debugMess') + '</p></div>');
			}	

			// Set the language for OpenLayers
			window.OpenLayers.Lang.setCode(_pe.language);

			// Set the image path for OpenLayers
			window.OpenLayers.ImgPath = pe.add.liblocation + '/images/geomap/';
			
			// Add projection for default base map
			window.Proj4js.defs['EPSG:3978'] = "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
					
			// Initiate the map
			elm.attr('id', 'geomap').height(elm.width() * 0.8);

			// Load configuration file
			if (typeof opts.layersFile !== 'undefined') {
				$.ajax({
					url: opts.layersFile,
					dataType: "script",
					async: false,					
					success: function() {
						_pe.fn.geomap.createMap(wet_boew_geomap, opts);

						if (opts.debug) {
							window.console.log(_pe.fn.geomap.getLocalization('overlayLoad'));
						}
					},
					error: function(){
						if (opts.debug) {
							window.console.log(_pe.fn.geomap.getLocalization('overlayNotLoad'));
						}
					}
				}); // end ajax
			} else {
				
				_pe.fn.geomap.createMap(undefined, opts);
				
				if (opts.debug) {
					window.console.log(_pe.fn.geomap.getLocalization('overlayNotSpecify'));
				}
			} // end load configuration file
		
			$(document).on('wb-init-loaded', function() {
				// If there are overlays, wait before calling the plugins
				if (!overlays) {
					_pe.fn.geomap.refreshPlugins();
				}
			});

			return elm; // end of exec
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
