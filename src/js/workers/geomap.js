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
	var selectControl;
	var queryLayers = [];
	/* local reference */
	_pe.fn.geomap = {
		type: 'plugin',
		// This is an example from tabbed interface, to show how to call required libraries when they are needed
		//depends: (pe.mobile ? [] : ['geomap/OpenLayers']),
		depends: ['openlayers', 'proj4js', 'metadata', 'datatables'],
		dependscss: ['datatables'],
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
						$(this.minimizeDiv).click(function(){ that.maximizeDiv.focus(); });
						$(this.maximizeDiv).click(function(){ that.minimizeDiv.focus(); });
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
	 
		/* 
		 * Map feature select
		 */
		onFeatureSelect: function(feature) {					
			$("tr#" + feature.id.replace(/\W/g, "_")).attr('class', 'background-highlight');
		},
		
		/*
		 *	Map feature unselect
		 */
		onFeatureUnselect: function(feature) {
			$("tr#" + feature.id.replace(/\W/g, "_")).attr('class', 'background-white');
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
			if (!($(".wet-boew-geomap-legend").length)) {	
				
				// Check to see if a legend container is provided			
				if($(".wet-boew-geomap").hasClass("debug")) {		
					$("div#wb-main-in").prepend('<div class="module-attention span-8"><h3>' + pe.fn.geomap.getLocalization('warning') + '</h3><p>' + pe.fn.geomap.getLocalization('warningLegend') + '</p></div>');	
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
				if ($(".wet-boew-geomap-tabs").length) {
					$(".wet-boew-geomap-tabs").append('<ul class="tabs"></ul><div class="tabs-panel"></div>');
				// user hasn't specified where they want the tabs
				} else { 
					$(".wet-boew-geomap-layers").append('<div class="clear"></div><div class="wet-boew-geomap-tabs"><ul class="tabs"></ul><div class="tabs-panel"></div></div><div class="clear"></div>');
				}
			}
			
		},
		
		/* 
		 * Create a table for vector features added in Load Overlays
		 */
		createTable: function(index, title, caption, datatable) {

			var $table = $('<table>', { 'class': 'table-simplify' }); 
			
			if(datatable) {
				$table.addClass('wet-boew-tables');
				$table.css('width', '100%');
			} else {
				$table.css('width', '100%');
			}
			
			$table.attr('aria-label', title);
			$table.attr('id', "overlay_" + index);
			$table.append('<caption>' + caption + '</caption>', '<thead>', '<tbody>');
			if(datatable) $table.append('<tfoot>');
			
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
		addLayerData: function(featureTable, enabled, olLayerId, tab) {						
			
			// add to layer to legend
			if ($('.wet-boew-geomap-legend')) {
				pe.fn.geomap.addToLegend(featureTable, enabled, olLayerId);
			};
			
			var $div = $(".wet-boew-geomap-layers");
			var $layerTab = $("<div>", { 'id': 'tabs_' + $(featureTable).attr('id') });				
			var title = featureTable[0].attributes['aria-label'].value;
			var $layerTitle = $("<h4>", { 'id': $(featureTable).attr('id'),	'html': title, 'class': 'background-light' });
			var $alert = $('<div id="msg_' + $(featureTable).attr('id') + '" class="module-attention module-simplify margin-top-medium margin-bottom-medium"><p>' + pe.fn.geomap.getLocalization('hiddenLayer') + '</p></div>');
		
			// TODO: add debug message for div with id 'wet-boew-geomap-layers' can't be found and prompt to have it added
			
			// if tabs are specified
			if (tab && $(".wet-boew-geomap-tabs").length) {			
				pe.fn.geomap.addToTabs(featureTable, enabled, olLayerId);
			// tabs are not specified
			} else {				

				$layerTab.append($layerTitle, featureTable);
				$div.append($layerTab, '<div class="clear"></div>');	

				
				// if layer visibility is false, add the hidden layer message and hide the table data
				if(enabled === false) {				
					$layerTab.append($alert);	
					featureTable.fadeOut();
				}			
			}
			
			if (tab && (!$('.wet-boew-geomap-tabs').length)) {
				if($(".wet-boew-geomap").hasClass("debug")) {		
					$("div#wb-main-in").prepend('<div class="module-attention span-8"><h3>' + pe.fn.geomap.getLocalization('warning') + '</h3><p>' + pe.fn.geomap.getLocalization('warningTab') + '</p></div>');	
				}
			}
		},
		
		/* 
		 * Create Legend
		 */		
		addToLegend: function(featureTable, enabled, olLayerId) {			

			var $div = $(".wet-boew-geomap-legend");
			var $legend = $('<legend>', { 'html': pe.fn.geomap.getLocalization('legendFieldsetLegend') });
			var $fieldset = $('<fieldset>', { 'name': 'legend' }).appendTo($div);
			
			if($div.length != 0) {
				var $checked = enabled ? 'checked="checked"' : '';
				var $ul;
				if(!$div.find('ul').length) {
					$ul = $('<ul>', { 'class': 'list-bullet-none margin-left-none' }).appendTo($div);					
				} else {
					$ul = $div.find('ul');
				}
				
				var $chkBox = $('<input type="checkbox" id="cb_' 
						+ $(featureTable).attr('id') + '" value="' 
						+ $(featureTable).attr('id') + '"' + $checked + ' />');
				
				$chkBox.change(function() {				
					map = _pe.fn.geomap.getMap();
					var layer = map.getLayer(olLayerId);				
					var visibility = $('#cb_' + $(featureTable).attr('id')).prop('checked') ? true : false;	
					layer.setVisibility(visibility);	
					
					var $table = $('table#' + $(featureTable).attr('id'));	
					
					
					var $parent;
					if($table.parent().hasClass('dataTables_wrapper')) {
						$parent = $table.parent();
					} else {
						$parent = $table;
					}
					
					var $alert = $("div#msg_" + $(featureTable).attr('id'));
					
					if($alert.length != 0) { 
						$alert.fadeToggle();					
					} else { 
						$parent.after('<div id="msg_' + $(featureTable).attr('id') + '" class="module-attention module-simplify margin-bottom-medium margin-top-medium"><p>' + pe.fn.geomap.getLocalization('hiddenLayer') + '</p></div>');				
					}					
					
					$parent.fadeToggle();
														
				});	
				
				var $label = $('<label>', {
					'html': $(featureTable).attr('aria-label'),			   
					'for': 'cb_'	+ $(featureTable).attr('id'),
					'class': 'form-checkbox'
				}).append($chkBox);
				
				$ul.append($("<li>").append($label));			
			}	
		},
		
		/*
		 * Create tabs - one for each layer added
		 */
		addToTabs: function(featureTable, enabled, olLayerId) {				
			
			var $div = $(".wet-boew-geomap-tabs");
			var $tabs = $div.find("ul.tabs");
			var $tabsPanel = $div.find("div.tabs-panel");			
			var $link = $("<a>", {
				'text': $(featureTable).attr('aria-label'),			   
				'href': '#tabs_'	+ $(featureTable).attr('id')
			});

			$tabs.append($("<li>").append($link));
			
			var $layerTab = $("<div>").attr('id', 'tabs_' + $(featureTable).attr('id'));
			$layerTab.append(featureTable);		
			$tabsPanel.append($layerTab);		
			
			if(enabled === false) {				
				$layerTab.append('<div id="msg_' + $(featureTable).attr('id') + '" class="module-attention module-simplify"><p>' + _pe.fn.geomap.getLocalization('hiddenLayer') + '</p></div>');	
				featureTable.fadeOut();
			}			
		},
		
		/*
		 * Generate StyleMap
		 */
		getStyleMap: function(elm) {

			var styleMap, filter;
			
			// set random color
			var strokeColor = _pe.fn.geomap.randomColor();
			var fillColor = strokeColor;		

			var defaultStyle = {				
				'strokeColor': strokeColor, 
				'fillColor': fillColor,
				'fillOpacity': 0.5,
				'pointRadius': 5,
				'strokeWidth': 0.5
			};
			
			var selectStyle = { 
				'strokeColor': "#0000ff", 
				'fillColor': "#0000ff",
				'fillOpacity': 0.4,
				'pointRadius': 5,
				'strokeWidth': 2.0
			};
			
			// if style is supplied, create it. If not, create the default one.
			if (typeof(elm.style) != "undefined") {
				// Check the style type (by default, no type are supplied).
				switch(elm.style.type) {
				case 'unique':
					// set the select style then the unique value.
					var select = ((typeof(elm.style.select) != "undefined") ? elm.style.select : selectStyle);
					var styleMap = new OpenLayers.StyleMap({"select": new OpenLayers.Style(select)});
					styleMap.addUniqueValueRules("default", elm.style.field, elm.style.init);
					break;

				case 'rule':
					// set the rules and add to the style
					var rules = [];
					for (var i=0; i < elm.style.rule.length; i++){

						// set the filter						
						switch(elm.style.rule[i].filter){
						case 'LESS_THAN':
							filter = OpenLayers.Filter.Comparison.LESS_THAN;
							break;
						case 'LESS_THAN_OR_EQUAL_TO':
							filter = OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
							break;
						case 'GREATER_THAN_OR_EQUAL_TO':
							filter = OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO;
							break;
						case 'GREATER_THAN':
							filter = OpenLayers.Filter.Comparison.GREATER_THAN;
							break;
						case 'BETWEEN':
							filter = OpenLayers.Filter.Comparison.BETWEEN;
							break;
						case 'EQUAL_TO':
							filter = OpenLayers.Filter.Comparison.EQUAL_TO;
							break;
						case 'NOT_EQUAL_TO':
							filter = OpenLayers.Filter.Comparison.NOT_EQUAL_TO;
							break;
						case 'LIKE':
							filter = OpenLayers.Filter.Comparison.LIKE;
							break;
						}

						if (elm.style.rule[i].filter != "BETWEEN"){
							rules.push(new OpenLayers.Rule({
								filter: new OpenLayers.Filter.Comparison({
									type: filter,
									property: elm.style.rule[i].field,
									value: elm.style.rule[i].value[0]}),
									symbolizer: elm.style.rule[i].init
								})
							);
						} else {
							rules.push(new OpenLayers.Rule({
								filter: new OpenLayers.Filter.Comparison({
									type: filter,
									property: elm.style.rule[i].field,
									lowerBoundary:elm.style.rule[i].value[0],
									upperBoundary:elm.style.rule[i].value[1]}),
									symbolizer: elm.style.rule[i].init
								})
							);
						}
					}
					
					var style = new OpenLayers.Style();
					style.addRules(rules);

					// set the select style then the rules.
					var select = ((typeof(elm.style.select) != "undefined") ? elm.style.select : selectStyle);					
					styleMap = new OpenLayers.StyleMap({
						"default": style, 
						"select": new OpenLayers.Style(select)
					});					
					break;
				default:
					// set the select style then the default.
					var select = ((typeof(elm.style.select) != "undefined") ? elm.style.select : selectStyle);
					styleMap = new OpenLayers.StyleMap({ 
						"default": new OpenLayers.Style(elm.style.init),
						"select": new OpenLayers.Style(select)
					});
					break;
				}
			} // end of (typeof(elm.style) != "undefined"
			else {
				var styleMap = new OpenLayers.StyleMap({ 
					"default": new OpenLayers.Style(defaultStyle),
					"select": new OpenLayers.Style(selectStyle)
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
			var $row = $('<tr>');
			
			// replace periods with underscores for jQuery!
			if(context.type != 'head') $row.attr('id', context.id.replace(/\W/g, "_"));
			
			var cols = [];
			var a = context.feature.attributes;

			for (var name in a) {
				var $col;
				// TODO: add regex to replace text links with hrefs.				
				if (a.hasOwnProperty(name)) {					
					if(context.type == 'head') {
						$col = $('<th>', { 'html': name });
					} else {
						$col = $('<td>', { 'html': a[name] });
					}
					cols.push($col);
				}
			}			

			if (zoomTo == true) {	
				
				var $zoom = $('<td>');
				
				cols.push($zoom);
				$(cols[cols.length -1]).empty().append(_pe.fn.geomap.addZoomTo($row, context.feature, context.selectControl)); 
				
			}
				
			if(context.type != 'head') {

				// TODO: support user configured column for link, currently defaults to first column.
				var $link = $('<a>', {				
					'html': $(cols[0]).html(),
					'href': '#'
				});
				
				$(cols[0]).empty().append($link);
				
				// Hover events
				$row.hover(
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
						$row.attr('class', 'background-highlight');
						context.selectControl.unselectAll();
						context.selectControl.select(context.feature);
					}	
				);
				$link.blur(function(){
						$row.attr('class', 'background-white');
						context.selectControl.unselectAll();
						context.selectControl.select(context.feature);
					}	
				);
			}

			$row.append(cols);
			
			return $row;	
			
		},
		
		/*
		 * Handle features once they have been added to the map
		 * 
		 */
		onFeaturesAdded: function($table, evt, zoomTo, datatable) {

			var $head = _pe.fn.geomap.createRow({ 'type':'head', 'feature': evt.features[0] });
			var $foot = _pe.fn.geomap.createRow({ 'type':'head', 'feature': evt.features[0] });
			if(zoomTo) {	
				$head.append($('<th>' + _pe.fn.geomap.getLocalization('zoomFeature') + '</th>'));
				$foot.append($('<th>' + _pe.fn.geomap.getLocalization('zoomFeature') + '</th>'));
			} 
			
			$table.find('thead').append($head);
			$table.find('tfoot').append($foot);
			$.each(evt.features, function(index, feature) {												
				var context = {
					'type': 'body',
					'id': feature.id.replace(/\W/g, "_"),
					'feature': feature,
					'selectControl': selectControl

				};											
				var $row = _pe.fn.geomap.createRow(context, zoomTo);									
				$table.find('tbody').append($row);
			});
			
			// TODO use the plugin tables instead
			// Run the datatable plugin to generate the nice table
			if (datatable) $('table#' + $table.attr('id')).dataTable();
		},
		
		/*
		 * Handle features once they have been added to the map for tabular data
		 * 
		 */
		onTabularFeaturesAdded: function(feature, zoomColumn, table, opts) {

			// Find the row
			var $tr = $('tr#' + feature.id.replace(/\W/g, "_"));
				
			// add zoom column
			if ( zoomColumn == true) {						
				$tr.append('<td></td>').find('td:last').append(_pe.fn.geomap.addZoomTo($tr, feature));
			}
																						
			var $select = $tr.find('td.select');						
			if($select.length) {
				var $link = $select.find('a');
				if($link.length) {
					$tr.hover(function(){
						$tr.attr('class', 'background-highlight');
						selectControl.select(feature);
					}, 
					function(){
						$tr.attr('class', 'background-white');
						selectControl.unselect(feature);
						}
					);
									
					// Keybord events
					$link.focus(function(){
						$tr.attr('class', 'background-highlight');
						selectControl.select(feature);
						}	
					);
					$link.blur(function(){
						$tr.attr('class', 'background-white');
						selectControl.unselect(feature);
						}	
					);
				} else { 
					if(opts.debug) {
						$select.append('<div class="module-alert"><h3>' + _pe.fn.geomap.getLocalization('error') + '</h3><p>' + _pe.fn.geomap.getLocalization('errorSelect') + '</p></div>');		
					}
				}
				} else {
					if(opts.debug) {
						$tr.closest('table').before('<div class="module-alert"><h3>' + _pe.fn.geomap.getLocalization('error') + '</h3><p>' + _pe.fn.geomap.getLocalization('errorNoSelect') + '</p></div>');
					}
				}
		},
		
		/*
		 *	Add the zoom to column
		 * 
		 */
		addZoomTo: function(row, feature){
			
			var $ref = $('<a>', {
				'click':function(e) { 
						e.preventDefault();			
						map.zoomToExtent(feature.geometry.bounds);	
						row.closest('tr').attr('class', 'background-highlight');
						selectControl.unselectAll();
						selectControl.select(feature);	
			 },
				'href': '#',
				'class': 'button',
			});
					
			// Add icon	
			$('<span>', {
				'class': 'wb-icon-target',	
			}).appendTo($ref);

			// Add text
			$ref.append(document.createTextNode(_pe.fn.geomap.getLocalization('zoomFeature')));
			
			// Keybord events
			$ref.focus(function(){
				row.attr('class', 'background-highlight');
				selectControl.unselectAll();
				selectControl.select(feature);
			});
			$ref.blur(function(){
				row.attr('class', 'background-white');
				selectControl.unselectAll();
				selectControl.unselect(feature);
			});
			
			return $ref;
		},
		
		/*
		 *	Set the default basemap
		 */
		setDefaultBaseMap: function(opts) {			
			if(opts.debug) {
				console.log(_pe.fn.geomap.getLocalization('basemapDefault'));
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
		},
		
		/*
		 * Set default map option
		 */
		setDefaultMapOptions: function(){
			// use map options for the Canada Transportation Base Map (CBMT)
			var mapOptions = {
				maxExtent: new OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),			
				maxResolution: 'auto',
				projection: 'EPSG:3978', 
				restrictedExtent: new OpenLayers.Bounds(-3000000.0, -800000.0, 4000000.0, 3900000.0),
				units: 'm',
				displayProjection: new OpenLayers.Projection('EPSG:4269') /* only used by specific controls (i.e. MousePosition) */ ,
				numZoomLevels: 12
			};
			
			return mapOptions;
		},
		
		/*
		 *	Add baseMap data
		 */		
		addBasemapData: function(wet_boew_geomap, opts) {			
			var mapOptions = {};
			if (typeof(wet_boew_geomap) != "undefined"){
				if(wet_boew_geomap.basemap && wet_boew_geomap.basemap.mapOptions) {				
					var mapOpts = wet_boew_geomap.basemap.mapOptions;
					
					try {
						mapOptions['maxExtent'] =  new OpenLayers.Bounds(mapOpts.maxExtent.split(','));
						mapOptions['maxResolution'] = mapOpts.maxResolution;
						mapOptions['projection'] = mapOpts.projection; 
						mapOptions['restrictedExtent'] = new OpenLayers.Bounds(mapOpts.restrictedExtent.split(','));
						mapOptions['units'] = mapOpts.units;
						mapOptions['displayProjection'] = new OpenLayers.Projection(mapOpts.displayProjection);
						mapOptions['numZoomLevels'] = mapOpts.numZoomLevels;
					} catch (err) {
						if(opts.debug) {
							console.log(_pe.fn.geomap.getLocalization('baseMapMapOptionsLoadError'));
						}
					}
					
				} else if(!wet_boew_geomap.basemap) {
					// use map options for the Canada Transportation Base Map (CBMT)
					mapOptions = mapOptions = _pe.fn.geomap.setDefaultMapOptions();
				}
			} else { mapOptions = _pe.fn.geomap.setDefaultMapOptions(); }
			
			map = new OpenLayers.Map('geomap', $.extend(opts.config, mapOptions));		
			
			// Check to see if a base map has been configured. If not add the
			// default base map (the Canada Transportation Base Map (CBMT))
			if (typeof(wet_boew_geomap) != "undefined"){
				if(wet_boew_geomap.basemap) {
					var basemap = wet_boew_geomap.basemap;
					
					if(!basemap.options) basemap.options = {}; //projection: 'EPSG:4326' };
					
					basemap.options['isBaseLayer'] = true;
					basemap.options['displayInLayerSwitcher'] = false;
					
					if(basemap.type=='wms') {
						map.addLayer(
							new OpenLayers.Layer.WMS(
								basemap.title, 
								basemap.url, 
								{ layers: basemap.layers, version: basemap.version, format: basemap.format },
								basemap.options
							)
						);
					} else if (basemap.type=='esri') {						
						map.addLayer(
							new OpenLayers.Layer.ArcGIS93Rest(
								basemap.title, 
								basemap.url
							)
						);									
					}
				} else { _pe.fn.geomap.setDefaultBaseMap(opts); }
			} else { _pe.fn.geomap.setDefaultBaseMap(opts); }
		},
		
		/*
		 *	Add overlay data
		 */
		addOverlayData: function(wet_boew_geomap){
			
			if (typeof(wet_boew_geomap) != "undefined")
			{			
			if(wet_boew_geomap.overlays){				
				$.each(wet_boew_geomap.overlays, function(index, layer) {	
					
					var $table = _pe.fn.geomap.createTable(index, layer.title, layer.caption, layer.datatable);
					
					if (layer.type=='kml') {	
						var olLayer = new OpenLayers.Layer.Vector(
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
										var items = this.getElementsByTagNameNS(data, "*", "Placemark");
										
										var row, feature, atts = {}, features = [];
												
											for (var i = 0; i < items.length; i++) {												
												row = items[i];			
																								
												feature = new OpenLayers.Feature.Vector();														
																								
												feature.geometry = this.parseFeature(row).geometry;
												
												// parse and store the attributes
												atts = {};
												var a = layer.attributes;
												
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
									"featuresadded": function (evt) {	
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									}									
								},
								styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						);
						olLayer.visibility=layer.visible;						
						map.addLayer(olLayer);
						queryLayers.push(olLayer);						
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);						
					} else if (layer.type=='atom') {
						var olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.Atom({
											read: function(data) {											
												var items = this.getElementsByTagNameNS(data, "*", "entry");
												
												var row, feature, atts = {}, features = [];
												
												for (var i = 0; i < items.length; i++) {												
													row = items[i];			
																									
													feature = new OpenLayers.Feature.Vector();														
																									
													feature.geometry = this.parseFeature(row).geometry;
													
													// parse and store the attributes
													atts = {};
													var a = layer.attributes;
													
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
									"featuresadded": function (evt) {											
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									}									
								},
								styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						);
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);									
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);						
					} else if (layer.type=='georss') {
						var olLayer = new OpenLayers.Layer.Vector(
							layer.title, {
								projection: map.displayProjection,
								strategies: [new OpenLayers.Strategy.Fixed()],
								protocol: new OpenLayers.Protocol.HTTP({
									url: layer.url,
									format: new OpenLayers.Format.GeoRSS({									
										read: function(data) {											
											var items = this.getElementsByTagNameNS(data, "*", "item");
											
											var row, feature, atts = {}, features = [];
											
											for (var i = 0; i < items.length; i++) {												
												row = items[i];			
																								
												feature = new OpenLayers.Feature.Vector();											
												
												feature.geometry = this.createGeometryFromItem(row);
												
												// parse and store the attributes
												atts = {};
												var a = layer.attributes;
												
												// TODO: test on nested attributes
												for (var name in a) {
													if (a.hasOwnProperty(name)) {
														 atts[a[name]] = $(row).find(name).text();														
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
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									}									
								},
								styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						);
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);											
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
					} else if (layer.type=='json') {
						var olLayer = new OpenLayers.Layer.Vector( 
							layer.title, { 
								projection: map.displayProjection, 
								strategies: [new OpenLayers.Strategy.Fixed()], 
								protocol: new OpenLayers.Protocol.Script({ 
									url: layer.url,
									params: layer.params,
									format: new OpenLayers.Format.GeoJSON({										
										read: function(data) {											
											var items = data[layer.root] ? data[layer.root] : data;
											var row, feature, atts = {}, features = [];
											
											for (var i = 0; i < items.length; i++) {												
												row = items[i];												
												feature = new OpenLayers.Feature.Vector();												
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
									"featuresadded": function (evt) {	
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									}									
								},
								styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						);						
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);											
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);					
					} else if (layer.type=='geojson') {						
						var olLayer = new OpenLayers.Layer.Vector( 
							layer.title, { 
								projection: map.displayProjection, 
								strategies: [new OpenLayers.Strategy.Fixed()], 
								protocol: new OpenLayers.Protocol.Script({ 
									url: layer.url,
									params: layer.params,
									format: new OpenLayers.Format.GeoJSON({
										read: function(data) {

											var items = data.features;
											var row, feature, atts = {}, features = [];
											
											for (var i = 0; i < items.length; i++) {												
												row = items[i];												
												feature = new OpenLayers.Feature.Vector();												
												feature.geometry =	this.parseGeometry(row.geometry);
												
												// parse and store the attributes
												atts = {};
												var a = layer.attributes;
												
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
									"featuresadded": function (evt) {
										_pe.fn.geomap.onFeaturesAdded($table, evt, layer.zoom, layer.datatable);
									}
								},
								styleMap: _pe.fn.geomap.getStyleMap(wet_boew_geomap.overlays[index])
							}
						);
						olLayer.visibility=layer.visible;
						queryLayers.push(olLayer);
						map.addLayer(olLayer);										
						_pe.fn.geomap.addLayerData($table, layer.visible, olLayer.id, layer.tab);
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
		*		{ id: 'cityE' }, 
		*		{ id: 'bbox', strokeColor: '#FF0000', fillcolor: '#FF0000' } 
		*	] 
		*/	
		addTabularData: function(opts, projLatLon, projMap){
			
			$.each(opts.tables, function(index, table) {
				
				var $table = $("table#" + table.id);
				var wktFeature;		
				var tableLayer = new OpenLayers.Layer.Vector($table.find('caption').text(), {styleMap: _pe.fn.geomap.getStyleMap(opts.tables[index])} );
				
				var wktParser = new OpenLayers.Format.WKT({						
					'internalProjection': projMap, 
					'externalProjection': projLatLon
				});
				
				// Get the attributes from table header
				var attr = [];
				$.each($("table#" + table.id + ' th'), function(index, attribute) {
					if (attribute.textContent.toLowerCase() != 'geometry'){
						attr[index] = attribute.textContent;
					}
				});
				
				// If datatable is specified				
				if(table.datatable) {
					//$table.addClass('wet-boew-tables'); /* this won't work */
				} 
				
				// If zoomTo add the header and footer column headers
				if (opts.tables[index].zoom){
					$table.find('thead').find('tr').append($('<th>' + pe.fn.geomap.getLocalization('zoomFeature') + '</th>'));
					$table.find('tfoot').find('tr').append($('<th>' + pe.fn.geomap.getLocalization('zoomFeature') + '</th>'));					
				} 
				
				// Loop trought each row
				$.each($("table#" + table.id + ' tr'), function(index, row) {
					
					// Create an array of attributes: value
					var attrMap = {};
					$(row).find('td').each(function(index, feature) {	
						if (!($(feature).hasClass('geometry'))) {
							attrMap[attr[index]] = feature.lastChild.textContent;
						}
					});
				
					$(row).find('td').each(function(index, feature) {		
						
						if ($(feature).hasClass('geometry')) {
							if($(feature).hasClass('bbox')) {								
		
								var bbox = $(feature).text().split(',');
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
	
						// Set the table row id
						var $tr = $(this).parent();
						$tr.attr('id', vectorFeatures.id.replace(/\W/g, "_"));
						
						// Add the attributes to the feature then add it to the map
						vectorFeatures.attributes = attrMap;										
						tableLayer.addFeatures([vectorFeatures]);
						}	
					});
				}); 
				
				tableLayer.id = "table#" + table.id;
				map.addLayer(tableLayer);
				queryLayers.push(tableLayer);
				if ($('.wet-boew-geomap-legend')) {
					pe.fn.geomap.addToLegend($table, true, tableLayer.id);
				};				

				//if (opts.tables[index].tab) pe.fn.geomap.addLayerData($table, true, tableLayer.id, opts.tables[index].tab);
			});		
		},
		
		/*
		 *	Load controls
		 */
		loadControls: function(opts){
			
			// TODO: ensure WCAG compliance before enabling			
			selectControl = new OpenLayers.Control.SelectFeature(
				queryLayers,
				{ onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect }
			);			
			
			map.addControl(selectControl);			
			selectControl.activate();			
			
			// Add the select control to every tabular feature. We need to this now because the select control needs to be set.
			$.each(opts.tables, function(index, table) {
				var zoomColumn = opts.tables[index].zoom;
				for (var i=0; i<queryLayers.length; i++){
					if (queryLayers[i].id == "table#" + table.id){
						$.each(queryLayers[i].features, function(index, feature) {
							_pe.fn.geomap.onTabularFeaturesAdded(feature, zoomColumn, opts.tables[index], opts);
						});
					}
				}
				
				// TODO use the plugin tables instead
				// run the datatable here because if we run it before there is an error
				if (opts.tables[index].datatable) $("table#" + table.id).dataTable()
			});
				
			if(opts.useMousePosition) { map.addControl(new OpenLayers.Control.MousePosition()); }
			if(opts.useScaleLine) { map.addControl(new OpenLayers.Control.ScaleLine()); }					
			map.addControl(new OpenLayers.Control.PanZoomBar({ zoomWorldIcon: true }));
			map.addControl(new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }));
			map.addControl(new OpenLayers.Control.KeyboardDefaults());			
			var c=map.getControlsByClass('OpenLayers.Control.KeyboardDefaults');
					c[0].deactivate();
					
			// enable the keyboard navigation when map div has focus. Disable when blur
			// Enable the wheel zoom only on hover
			$('.wet-boew-geomap').attr('tabindex', '0');
			$('.wet-boew-geomap').css("border", "solid 1px white");
			$('.wet-boew-geomap').hover(function(){
					var c=map.getControlsByClass('OpenLayers.Control.Navigation');
					c[0].activate();
					$(this).css("border", "solid 1px blue");
				},
				function(){
					var c=map.getControlsByClass('OpenLayers.Control.Navigation');
					c[0].deactivate();
					$(this).css("border", "solid 1px white");
				}
			);
			$('.wet-boew-geomap').focus(function(){
					var c=map.getControlsByClass('OpenLayers.Control.KeyboardDefaults');
					c[0].activate();
					$(this).css("border", "solid 1px blue");
				}	
			);
			$('.wet-boew-geomap').blur(function(){
					var c=map.getControlsByClass('OpenLayers.Control.KeyboardDefaults');
					c[0].deactivate();
					$(this).css("border", "solid 1px white");
				}	
			);
			
			// add accessibility enhancements
			this.accessibilize(opts.useLayerSwitcher);					
			if(opts.useLayerSwitcher) { map.addControl(new OpenLayers.Control.LayerSwitcher()); }

			map.zoomToMaxExtent();			
			
			// fix for the defect #3204 http://tbs-sct.ircan-rican.gc.ca/issues/3204
			$("#" + map.div.id).before((_pe.language == "en") ? '<p><strong>' + _pe.fn.geomap.getLocalization('accessibilize') + '</p>' : '<p><strong>' + _pe.fn.geomap.getLocalization('accessibilize') + '</p>');
			
			// add a listener on the window to update map when resized
			window.onresize = function() {				
				$("#" + map.div.id).height($("#" + map.div.id).width() * 0.8);
				map.updateSize();
				map.zoomToMaxExtent();
			};			

		},
		
		/*
		 *	Create the map after we load the config file.
		 */
		createMap: function(wet_boew_geomap, opts){
			
			// Add basemap data
			_pe.fn.geomap.addBasemapData(wet_boew_geomap, opts);
					
			// Create projection objects
			var projLatLon = new OpenLayers.Projection('EPSG:4326');
			var projMap = map.getProjectionObject();						

			if(opts.debug) {
				console.log(_pe.fn.geomap.getLocalization('projection') + ' ' + projMap.getCode());
			}			
			
			// Global variable
			selectControl = new OpenLayers.Control.SelectFeature();
			
			// Create legend and tab
			if (opts.useLegend) _pe.fn.geomap.createLegend();
			_pe.fn.geomap.createLayerHolder(opts.useTab);
			
			// Add tabular data
			_pe.fn.geomap.addTabularData(opts, projLatLon, projMap);
			
			// Add overlay data
			_pe.fn.geomap.addOverlayData(wet_boew_geomap);
			
			// Load Controls
			_pe.fn.geomap.loadControls(opts);
			
			// Add WCAG element for the map div
			$('.wet-boew-geomap').attr('role', 'img');
			$('.wet-boew-geomap').attr('aria-label', _pe.fn.geomap.getLocalization('ariaMap'));
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
				accessibilize: 'Keyboard users:</strong> Use the arrow keys to move the map and use plus and minus to zoom.',
				warning: 'WET-Geomap WARNING',
				warningLegend: 'No div element with a class of <em>wet-boew-geomap-legend</em> was found. If you require a legend either add a div with a class of <em>wet-boew-geomap-legend</em> or enable the default OpenLayers legend by adding the <em>layerswitcher</em> class to the <em>wet-boew-geomap</em> div.',
				hiddenLayer: 'This layer is currently hidden!',
				overlayNotSpecify: 'WET-Geomap: overlays file not specified',
				baseMapMapOptionsLoadError: "WET-Geomap: an error occurred when loading the mapOptions in your basemap configuration. Please ensure that you have the following options set: maxExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), maxResolution (e.g. 'auto'), projection (e.g. 'EPSG:3978'), restrictedExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), units (e.g. 'm'), displayProjection: (e.g. 'EPSG:4269'), numZoomLevels: (e.g. 12).",
				zoomFeature: 'Zoom to feature',
				ariaMap: 'Map object. The map features description is in the table below.',
				warningTab: 'No class <em>tab</tab> in wet-boew-geomap but a table has tab attribute set to true.',
				legendFieldsetLegend: 'Map legend listing layers currently available in the map'
			};
			
			var french = {
				debugMode: 'BOEW-Geomap: mode débogage activé',
				debugMess:'Lors de l\'exécution en mode débogage Geomap donne des messages d\'erreur, des messages d\'aide et donneras de l\'information utile dans la console de débogage. Désactiver le mode débogage en supprimant la classe <em>debug</em>.',
				overlayLoad: 'BOEW-Geomap: Les couches de superpositions ont été chargées avec succès',
				overlayNotLoad: 'BOEW-Geomap: une erreur est survenue lors du chargement des couches de superpositions',
				basemapDefault: 'BOEW-Geomap: la carte de base par défaut est utilisée',
				projection: 'BOEW-Geomap: la projection utilisée est',
				error: 'BOEW-Geomap ERREUR',
				errorSelect: 'Cette cellule a la classe <em>select</em> mais aucun lien n\'a été trouvé. S\'il vous plaît, ajouter un lien à cette cellule.',
				errorNoSelect: 'Cette table contient des lignes qui n\'ont pas de cellule avec la classe <em>select</em>. S\'il vous plaît, assurer vous que chaque ligne a exactement une cellule avec la classe <em>select</em> et celle-ci doit contenir un lien.',
				accessibilize: 'Utilisateurs de clavier :</strong> Utiliser les touches flèches pour déplacer la carte et utiliser les touches plus et négatif pour faire un zoom.',
				warning: 'BOEW-Geomap AVERTISSEMENT',
				warningLegend: 'Aucun élément div comportant une classe <em>wet-boew-geomap-legend</em> n\' été trouvé. Si vous avez besoin d\'une légende, vous pouvez ajouter un élément div avec une classe <em>wet-boew-geomap-legend</em> ou bien activer la légende par défaut de <em>OpenLayers</em> en ajoutant le paremètre <em>layerswitcher</em> à la classe <em>wet-boew-geomap</em> du div.',
				hiddenLayer: 'Cette couche est présentement cachée!',
				overlayNotSpecify: 'BOEW-Geomap: fichier des couches de superpositions non spécifié',
				baseMapMapOptionsLoadError: 'BOEW-Geomap: une erreur est survenue lors du chargement des options de configuration de votre carte de base. S\'il vous plaît, vérifiez que vous avez l\'ensemble des options suivantes: maxExtent (ex: \'-3000000,0, -800000,0, 4000000,0, 3900000,0\'), maxResolution (ex: \'auto\'), projection (ex: \'EPSG: 3978\'), restrictedExtent (ex: \'-3000000,0 , -800000,0, 4000000,0, 3900000,0\'), units (ex: \'m\'), displayProjection (ex: \'EPSG: 4269\'), numZoomLevels (ex: 12).',	
				zoomFeature: 'Zoom à l\'élément',
				ariaMap: 'Objet carte. La descriptions des élément sur la carte sont contenus dans la tables ci-dessous.',
				warningTab: 'Il n\'y a pas de classe <em>tab</em> dans wet-boew-geomap mais une table a l\'attribut égal vrai.',
				legendFieldsetLegend: 'TRANSLATE - Map legend listing layers currently available in the map'
			};
			
			var message = (_pe.language == "en") ? english[mess] : french[mess];
			return message;
		},
		
		fnZebraComplexTable: function (wet_boew_geomap, opts) {
			_pe.fn.geomap.createMap(wet_boew_geomap, opts);
						
						$('#wet-boew-geomap-tabs').addClass('wet-boew-tabbedinterface');
		},
		
		_exec: function (elm) {
			
			// Don't include this if statement if your plugin shouldn't run in mobile mode.
//			if (pe.mobile) {
//				return _pe.fn.geomap.mobile(elm).trigger('create');
//			}
			var opts, overrides;	
			
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
				useLayerSwitcher: false,
				useScaleLine: false,
				useMousePosition: false,
				debug: false,
				useLegend: false,
				useTab: false
			};			

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				useLayerSwitcher: elm.hasClass('layerswitcher') ? true : undefined,
				useScaleLine: elm.hasClass('scaleline') ? true : undefined,
				useMousePosition: elm.hasClass('position') ? true : undefined,
				debug: elm.hasClass('debug') ? true : false,
				useLegend: elm.hasClass('legend') ? true : false,
				useTab: elm.hasClass('tab') ? true : false
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
				console.log(pe.fn.geomap.getLocalization('debugMode'));
				$('#wb-main-in').prepend('<div class="module-attention span-8"><h3>' + pe.fn.geomap.getLocalization('debugMode') + '</h3><p>' + pe.fn.geomap.getLocalization('debugMess') + '</p></div>');
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

			// Read the layer file
			if (typeof(opts.layersFile) != "undefined") {
				$.ajax({
					url: opts.layersFile,
					dataType: "script",
					async: false,
					success: function (data) {
						
						_pe.fn.geomap.createMap(wet_boew_geomap, opts);
						
						$('.wet-boew-geomap-tabs').addClass('wet-boew-tabbedinterface');
						pe.wb_load({'plugins': {'tabbedinterface': $('.wet-boew-tabbedinterface')}});
						
						if(opts.debug) {
							console.log(_pe.fn.geomap.getLocalization('overlayLoad'));
						}
					},
					error: function (data){
						if(opts.debug) {
							console.log(_pe.fn.geomap.getLocalization('overlayNotLoad'));
						}
					}
				}); // end ajax
			} else {
				
				_pe.fn.geomap.createMap(undefined, opts);
				
				if(opts.debug) {
					console.log(_pe.fn.geomap.getLocalization('overlayNotSpecify'));
				}
			} // end load configuration file
			
		return elm; // end of exec

		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

