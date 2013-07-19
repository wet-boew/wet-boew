/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Charts for WET 3.1.x
 */
/*global jQuery: false, wet_boew_charts: false*/
(function ($) {
	'use strict';
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.chartsGraph = {
		generate: function (elm) {
			var options = {},
				self = $(elm),
				srcTbl = self,
				smallestHorizontalFlotDelta,
				smallestVerticalFlotDelta; 

			function colourNameToHex(colour) {
				// colorsAccent = ['#8d201c', '#EE8310', '#2a7da6', '#5a306b', '#285228', '#154055', '#555555', '#f6d200', '#d73d38', '#418541', '#87aec9', '#23447e', '#999999'];
				var colours = {
					// HTML colors
					aliceblue: '#f0f8ff',
					antiquewhite: '#faebd7',
					aqua: '#00ffff',
					aquamarine: '#7fffd4',
					azure: '#f0ffff',
					beige: '#f5f5dc',
					bisque: '#ffe4c4',
					black: '#000000',
					blanchedalmond: '#ffebcd',
					blue: '#0000ff',
					blueviolet: '#8a2be2',
					brown: '#a52a2a',
					burlywood: '#deb887',
					cadetblue: '#5f9ea0',
					chartreuse: '#7fff00',
					chocolate: '#d2691e',
					coral: '#ff7f50',
					cornflowerblue: '#6495ed',
					cornsilk: '#fff8dc',
					crimson: '#dc143c',
					cyan: '#00ffff',
					darkblue: '#00008b',
					darkcyan: '#008b8b',
					darkgoldenrod: '#b8860b',
					darkgray: '#a9a9a9',
					darkgreen: '#006400',
					darkkhaki: '#bdb76b',
					darkmagenta: '#8b008b',
					darkolivegreen: '#556b2f',
					darkorange: '#ff8c00',
					darkorchid: '#9932cc',
					darkred: '#8b0000',
					darksalmon: '#e9967a',
					darkseagreen: '#8fbc8f',
					darkslateblue: '#483d8b',
					darkslategray: '#2f4f4f',
					darkturquoise: '#00ced1',
					darkviolet: '#9400d3',
					deeppink: '#ff1493',
					deepskyblue: '#00bfff',
					dimgray: '#696969',
					dodgerblue: '#1e90ff',
					firebrick: '#b22222',
					floralwhite: '#fffaf0',
					forestgreen: '#228b22',
					fuchsia: '#ff00ff',
					gainsboro: '#dcdcdc',
					ghostwhite: '#f8f8ff',
					gold: '#ffd700',
					goldenrod: '#daa520',
					gray: '#808080',
					green: '#008000',
					greenyellow: '#adff2f',
					honeydew: '#f0fff0',
					hotpink: '#ff69b4',
					indianred : '#cd5c5c',
					indigo : '#4b0082',
					ivory: '#fffff0',
					khaki: '#f0e68c',
					lavender: '#e6e6fa',
					lavenderblush: '#fff0f5',
					lawngreen: '#7cfc00',
					lemonchiffon: '#fffacd',
					lightblue: '#add8e6',
					lightcoral: '#f08080',
					lightcyan: '#e0ffff',
					lightgoldenrodyellow: '#fafad2',
					lightgrey: '#d3d3d3',
					lightgreen: '#90ee90',
					lightpink: '#ffb6c1',
					lightsalmon: '#ffa07a',
					lightseagreen: '#20b2aa',
					lightskyblue: '#87cefa',
					lightslategray: '#778899',
					lightsteelblue: '#b0c4de',
					lightyellow: '#ffffe0',
					lime: '#00ff00',
					limegreen: '#32cd32',
					linen: '#faf0e6',
					magenta: '#ff00ff',
					maroon: '#800000',
					mediumaquamarine: '#66cdaa',
					mediumblue: '#0000cd',
					mediumorchid: '#ba55d3',
					mediumpurple: '#9370d8',
					mediumseagreen: '#3cb371',
					mediumslateblue: '#7b68ee',
					mediumspringgreen: '#00fa9a',
					mediumturquoise: '#48d1cc',
					mediumvioletred: '#c71585',
					midnightblue: '#191970',
					mintcream: '#f5fffa',
					mistyrose: '#ffe4e1',
					moccasin: '#ffe4b5',
					navajowhite: '#ffdead',
					navy: '#000080',
					oldlace: '#fdf5e6',
					olive: '#808000',
					olivedrab: '#6b8e23',
					orange: '#ffa500',
					orangered: '#ff4500',
					orchid: '#da70d6',
					palegoldenrod: '#eee8aa',
					palegreen: '#98fb98',
					paleturquoise: '#afeeee',
					palevioletred: '#d87093',
					papayawhip: '#ffefd5',
					peachpuff: '#ffdab9',
					peru: '#cd853f',
					pink: '#ffc0cb',
					plum: '#dda0dd',
					powderblue: '#b0e0e6',
					purple: '#800080',
					red: '#ff0000',
					rosybrown: '#bc8f8f',
					royalblue: '#4169e1',
					saddlebrown: '#8b4513',
					salmon: '#fa8072',
					sandybrown: '#f4a460',
					seagreen: '#2e8b57',
					seashell: '#fff5ee',
					sienna: '#a0522d',
					silver: '#c0c0c0',
					skyblue: '#87ceeb',
					slateblue: '#6a5acd',
					slategray: '#708090',
					snow: '#fffafa',
					springgreen: '#00ff7f',
					steelblue: '#4682b4',
					tan: '#d2b48c',
					teal: '#008080',
					thistle: '#d8bfd8',
					tomato:  '#ff6347',
					turquoise:	'#40e0d0',
					violet:  '#ee82ee',
					wheat:	'#f5deb3',
					white:	'#ffffff',
					whitesmoke:  '#f5f5f5',
					yellow: '#ffff00',
					yellowgreen: '#9acd32',
				
					// Accent Colors
					'accent-1': '#8d201c', 
					'accent-2': '#EE8310', 
					'accent-3': '#2a7da6', 
					'accent-4': '#5a306b', 
					'accent-5': '#285228', 
					'accent-6': '#154055', 
					'accent-7': '#555555', 
					'accent-8': '#f6d200', 
					'accent-9': '#d73d38', 
					'accent-10': '#418541', 
					'accent-11': '#87aec9', 
					'accent-12': '#23447e', 
					'accent-13': '#999999'
				};
				
				if (typeof colour === 'number')  {
					colour = 'accent-' + (colour + 1);
				}
				
				return (colours[colour.toLowerCase()] !== 'undefined' ? colours[colour.toLowerCase()] : ($.isArray(options.colors) ? options.colors[0] : options.colors));
			}
			
			// Function to Convert Class instance to JSON
			function setClassOptions (sourceOptions, strClass, namespace) {
				var separatorNS = '',
					separator = '',
					autoCreate = false,
					arrNamespace,
					arrClass;
				// Test: optSource
				if (typeof sourceOptions !== 'object') {
					// Empty source
					return {};
				}
				// Get a working copy for the sourceOptions
				sourceOptions = jQuery.extend(true, {}, sourceOptions);
				
				// Test: strClass
				if (typeof strClass !== 'string' || strClass.lenght === 0) {
					// no string class;
					return sourceOptions;
				}
				// Test: namespace
				if (typeof namespace !== 'string' || namespace.lenght === 0) {
					// Try to get the default namespace
					if (sourceOptions['default-namespace'] && (typeof sourceOptions['default-namespace'] === 'string' || $.isArray(sourceOptions['default-namespace']))) {
						namespace = sourceOptions['default-namespace'];
					} else {
						// This a not a valid namespace (no namespace)
						return sourceOptions;
					}
				}
				// Get the namespace separator if defined (optional)
				if (sourceOptions['default-namespace-separator'] && typeof sourceOptions['default-namespace-separator'] === 'string') {
					separatorNS = sourceOptions['default-namespace-separator'];
				} else {
					separatorNS = '-'; // Use the default
				}
				// Get the option separator if defined (optional)
				if (sourceOptions['default-separator'] && typeof sourceOptions['default-separator'] === 'string') {
					separator = sourceOptions['default-separator'];
				} else {
					separator = ' '; // Use the default
				}
				// Check if the the Auto Json option creation are authorized from class
				if (sourceOptions['default-autocreate']) {
					autoCreate = true;
				}
				arrClass = strClass.split(separator); // Get each defined class
				$.each(arrClass, function () {
					var arrParameter,
						// That variable is use for synchronization
						currObj = sourceOptions,
						// Set the default property name (this can be overwrited later)
						propName,
						i, _ilen,
						j,
						valIsNext,
						isVal,
						arrValue,
						arrayOverwrite = false,
						autoCreateMe = false,
						jsonString,
						val;
					// Get only the item larger than the namespace and remove the namespace
					
					
					if ($.isArray(namespace)) {
						// support to an array of namespace for backward compatibility and syntax error eg. wb-charts and wb-chart and wb-graph would be equivalent
						for (i = 0, _ilen = namespace.length; i < _ilen; i += 1) {
							if (namespace[i] === (this.length > namespace[i].length + separatorNS.length ? this.slice(0, namespace[i].length) : '')) {
								arrNamespace = namespace[i].split(separatorNS);
								arrParameter = this.split(separatorNS).slice(arrNamespace.length);
								break;
							}
						}
					} else {
						// One unique namespace
						if (namespace === (this.length > namespace.length + separatorNS.length ? this.slice(0, namespace.length) : '')) {
							arrNamespace = namespace.split(separatorNS);
							arrParameter = this.split(separatorNS).slice(arrNamespace.length);
						}
					}
					if (arrParameter && arrNamespace[arrNamespace.length - 1]) {
						// This is a valid parameter, start the convertion to a JSON object
						// Get all defined parameter
						for (i = 0, _ilen = arrParameter.length; i < _ilen; i += 1) {
							valIsNext = i + 2 === _ilen;
							isVal = i + 1 === _ilen;
							// Check if that is the default value and make a reset to the parameter name if applicable
							if (isVal && _ilen) {
								if (sourceOptions[arrParameter[i] + '-autocreate'] || (sourceOptions[arrParameter[i]] &&  sourceOptions[arrParameter[i] + '-typeof'] && sourceOptions[arrParameter[i] + '-typeof'] === "boolean")) {
									// 1. If match an existing option and that option is boolean
									arrParameter.push('true');
									propName = arrParameter[i];
									i += 1;
									_ilen = arrParameter.length;
								} else if (currObj.preset && currObj.preset[arrParameter[i]]) { 
									// 2. It match a preset, overide the current setting
									currObj = jQuery.extend(true, currObj, currObj.preset[arrParameter[i]]);
									break;
								} else if (_ilen === 1) { 
									// 3. Use the Default set
									propName = sourceOptions['default-option'] ? sourceOptions['default-option'] : undefined;
								} else {
									propName = undefined;
								}
							} else if (!isVal) {
								propName = arrParameter[i];
							}
							// Get the type of the current option (if available)
							// (Note: an invalid value are defined by 'undefined' value)
							// Check if the type are defined
							if (currObj[propName + '-typeof']) {
								// Repair the value if needed
								arrValue = [];
								for (j = (i + 1); j < _ilen; j += 1) {
									arrValue.push(arrParameter[j]);
								}
								if (i < _ilen - 1) {
									arrParameter[i] = arrValue.join(separatorNS);
								}
								valIsNext = false;
								isVal = true;
								switch (currObj[propName + '-typeof']) {
								case 'boolean':
									if (arrParameter[i] === 'true' || arrParameter[i] === '1' || arrParameter[i] === 'vrai' || arrParameter[i] === 'yes' || arrParameter[i] === 'oui') {
										arrParameter[i] = true;
									} else if (arrParameter[i] === 'false' || arrParameter[i] === '0' || arrParameter[i] === 'faux' || arrParameter[i] === 'no' || arrParameter[i] === 'non') {
										arrParameter[i] = false;
									} else {
										arrParameter[i] = undefined;
									}
									break;
								case 'number':
									if (!isNaN(parseInt(arrParameter[i], 10))) {
										arrParameter[i] = parseInt(arrParameter[i], 10);
									} else {
										arrParameter[i] = undefined;
									}
									break;
								case 'string':
									break;
								case 'undefined':
								case 'function':
								case 'locked':
									arrParameter[i] = undefined;
									break;
								default:
									// that include the case 'object'
									break;
								}
							}
							// Get the type of overwritting, default are replacing the value
							if (currObj[propName + '-overwrite-array-mode']) {
								arrayOverwrite = true;
							}
							// Check if this unique option can be autocreated
							if (currObj[propName + '-autocreate']) {
								autoCreateMe = true;
							}
							if (valIsNext && arrParameter[i] !== undefined) {
								// Keep the Property Name
								propName = arrParameter[i];
							} else if (isVal && arrParameter[i] !== undefined) {
								if (currObj[propName] && arrayOverwrite) {
									// Already one object defined and array overwriting authorized
									if ($.isArray(currObj[propName])) {
										currObj[propName].push(arrParameter[i]);
									} else {
										val = currObj[propName];
										currObj[propName] = [];
										currObj[propName].push(val);
										currObj[propName].push(arrParameter[i]);
									}
								} else if (currObj[propName] || autoCreate || autoCreateMe || currObj[propName] === 0 || currObj[propName] === false) {
									// Set the value by extending the options
									jsonString = '';
									if (typeof arrParameter[i] === 'boolean' || typeof arrParameter[i] === 'number') {
										jsonString = '{\"' + propName + '\": ' + arrParameter[i] + '}';
									} else {
										jsonString = '{\"' + propName + '\": \"' + arrParameter[i] + '\"}';
									}
									currObj = jQuery.extend(true, currObj, jQuery.parseJSON(jsonString));
								}
								i = _ilen; // Make sur we don't iterate again
							} else {
								// Create a sub object
								if (arrParameter[i] !== undefined && currObj[arrParameter[i]]) {
									// The object or property already exist, just get the reference of it
									currObj = currObj[arrParameter[i]];
									propName = arrParameter[i];
								} else if ((autoCreate || autoCreateMe) && arrParameter[i] !== undefined) {
									jsonString = '{\"' + arrParameter[i] + '\": {}}';
									currObj = jQuery.extend(true, currObj, jQuery.parseJSON(jsonString));
									currObj = currObj[arrParameter[i]];
								} else {
									// This configuration are rejected
									i = _ilen; // We don't iterate again
								}
							}
						}
					}
				});
				return sourceOptions;
			}

			if (!_pe.fn.chartsGraph.O){
				// 1. Charts Default Setting
				options = {
					'default-namespace': ['wb-charts', 'wb-chart', 'wb-graph'],
					'graphclass-autocreate': true, // This add the ability to set custom css class to the figure container.
					'graphclass-overwrite-array-mode': true,
					'graphclass-typeof': 'string',
					'noencapsulation-autocreate': true,
					'noencapsulation-typeof': 'boolean',

					// Force to have an uniform tick
					uniformtick: true,
					'uniformtick-typeof': 'boolean',
					'uniformtick-autocreate': true,

					// Force to use which row in the thead for the label
					'labelposition-typeof': 'number',
					'labelposition-autocreate': true,

					// Legend Management
					'legendinline-typeof': 'boolean',
					'legendinline-autocreate': true,
					'nolegend-typeof': 'boolean',
					'nolegend-autocreate': true,
					'percentlegend-typeof': 'boolean',
					'percentlegend-autocreate': true,

					// Force the Top and Bottom Value for a graph
					'topvalue-autocreate': true,
					'topvalue-typeof': 'number',
					'topvaluenegative-autocreate': true,
					'topvaluenegative-typeof': 'boolean',
					'bottomvalue-autocreate': true,
					'bottomvalue-typeof': 'number',
					'bottomvaluenegative-autocreate': true,
					'bottomvaluenegative-typeof': 'boolean',
					// Ticks => Number of ticks for the y-axis
					'ticks-autocreate': true,
					'ticks-typeof': 'number',

					// Pie chart option
					// set a decimal precision
					'decimal-autocreate': true,
					'decimal-typeof': 'number',
					'pieradius': 100, // Pie radius
					'pieradius-typeof': 'number',
					'pielblradius': 100, // Pie label radius
					'pielblradius-typeof': 'number',
					'piethreshold-autocreate': true, // Hides the labels of any pie slice that is smaller than the specified percentage (ranging from 0 to 100)
					'piethreshold-typeof': 'number',
					'pietilt-autocreate': true, // Percentage of tilt ranging from 0 and 100, where 100 has no change (fully vertical) and 0 is completely flat (fully horizontal -- in which case nothing actually gets drawn)
					'pietilt-typeof': 'number',
					'pieinnerradius-autocreate': true, // Sets the radius of the donut hole. If value is between 0 and 100 (inclusive) then it will use that as a percentage of the radius, otherwise it will use the value as a direct pixel length.
					'pieinnerradius-typeof': 'number',
					'piestartangle-autocreate': true, // Factor of PI used for the starting angle (in radians) It can range between 0 and 200 (where 0 and 200 have the same result).
					'piestartangle-typeof': 'number',
					'piehighlight-autocreate': true, //  Opacity of the highlight overlay on top of the current pie slice. (Range from 0 to 100) Currently this just uses a white overlay, but support for changing the color of the overlay will also be added at a later date.
					'piehighlight-typeof': 'number',
					'piehoverable-autocreate': true, // Hoverable pie slice
					'piehoverable-typeof': 'boolean',

					// General option
					'default-option': 'type', // Default CSS Options
					// Graph Type
					type: 'bar', // this be one of or an array of: area, pie, line, bar, stacked
					'type-autocreate': true,
					//
					// Graph Layout
					//
					width: $(elm).width(), // width of canvas - defaults to table height
					'width-typeof': 'number',
					height: $(elm).height(), // height of canvas - defaults to table height
					'height-typeof': 'number',
					//
					// Data Table and Graph Orientation
					//
					parsedirection: 'x', // which direction to parse the table data
					'parsedirection-typeof': 'string',
					'parsedirection-autocreate': true,
					getcellvalue: function(elem) {
						// Parameter: elem = HTML DOM node (td element)
						//
						// If this function return an array, it would be assume that the first item correspond at the cell numbered value and the second item correspond at the cell unit
						// Example 
						// return 25.14
						// return 44
						// return [44, "%"]
						// return [5.1, "g"]

						// Default Cell value extraction
						var cellRawValue = $(elem).text().trim();

						//remove spaces inside the string;
						cellRawValue = cellRawValue.replace(/\s/g, '');
						return [parseFloat(cellRawValue.match(/[\+\-0-9]+[0-9,\. ]*/)), cellRawValue.match(/[^\+\-\.\, 0-9]+[^\-\+0-9]*/)];
					},
					preset: {
						donnut: {
							// Donnut setting
							type: 'pie',
							height: 250,
							percentlegend: true,
							pieinnerradius: 45,
							pietilt: 50,
							piehoverable: true,
							decimal: 1,
							piethreshold: 8,
							legendinline: true,
							piestartangle: 100
						},
						usnumber: {
							getcellvalue: function(elem) {
								var raw = $(elem).text().trim().replace(/,/g, '');
								return [parseFloat(raw.match(/[\+\-0-9]+[0-9,\. ]*/)), raw.match(/[^\+\-\.\, 0-9]+[^\-\+0-9]*/)];
							}
						},
						germannumber: {
							getcellvalue: function(elem) {
								var raw = $(elem).text().trim().replace(/\./g, '');
								return [parseFloat(raw.match(/[\+\-0-9]+[0-9,\. ]*/)), raw.match(/[^\+\-\.\, 0-9]+[^\-\+0-9]*/)];
							}
						}
					}
				};

				// 2. Global "setting.js"
				if (typeof wet_boew_charts !== 'undefined') {
					// a. if exisit copy and take care of preset separatly (Move away before extending)
					if (wet_boew_charts.preset) {
						_pe.fn.chartsGraph.O = jQuery.extend(true, {}, wet_boew_charts.preset);
						delete wet_boew_charts.preset;
					}
					// b. Overwrite the chart default setting
					$.extend(true, options, wet_boew_charts);
					// c. Separatly extend the preset to at the current chart default seting
					if (_pe.fn.chartsGraph.O) {
						$.extend(true, options.preset, _pe.fn.chartsGraph.O);
					}
				}
				_pe.fn.chartsGraph.O = options; // ---- Save the setting here in a case of a second graphic on the same page
			}
			options = _pe.fn.chartsGraph.O;

			// 3. [Table element] CSS Overwrite - [Keep a list of required plugin "defaultnamespace-plugin" eg. wb-charts-donnut]
			options = setClassOptions(options, (self.attr('class') !== undefined ? self.attr('class') : ''));

			// 4. [Table element] HTML5 Data Overwrite property
			$.each(self.data(), function(idx, val) {
				// Check if the prefix "wbcharts" is used
				if (idx.slice(0, 8) === "wbcharts") {
					options[idx.slice(8)] = val;
				}
			});

			// 5. Load the requested preset
			// a. If the preset are a string => Use that as an url where it could find the setting
			// ---- Keep the url and his content for future reference for example second chart.
			// b. If the preset are an object => Overwrite the default.

			// Add headers information to the table parsed data structure
			// Similar sample of code as the HTML Table validator
			function addTblHeaders(tblparser) {
			var i, j, k, m, currRow, currCell;
			
			// Set ID and Header for the table head
			for (i = 0; i < tblparser.theadRowStack.length; i += 1) {
				currRow = tblparser.theadRowStack[i];
			
				for (j = 0; j < currRow.cell.length; j += 1) {
					currCell = currRow.cell[j];
				
					if ((currCell.type === 1 || currCell.type === 7) && (
							!(j > 0 && currCell.uid === currRow.cell[j - 1].uid) &&
							!(i > 0 && currCell.uid === tblparser.theadRowStack[i - 1].cell[j].uid)
						) ) {
					
						if (!currCell.header) { // Imediate header
							currCell.header = [];
						}
						if (!currCell.headers) { // all the headers
							currCell.headers = [];
						}
						
						if (!currCell.child) { // Imediate sub cell
							currCell.child = [];
						}
						if (!currCell.childs) { // All the sub cell
							currCell.childs = [];
						}
					
						// Set the header of the current cell if required
						if (i > 0) {
							// All the header cells
							for (k = 0; k < tblparser.theadRowStack[i - 1].cell[j].header.length; k += 1) {
								currCell.headers.push(tblparser.theadRowStack[i - 1].cell[j].header[k]);
								tblparser.theadRowStack[i - 1].cell[j].header[k].childs.push(currCell);
							}
							// Imediate header cell
							currCell.headers.push(tblparser.theadRowStack[i - 1].cell[j]);
							currCell.header.push(tblparser.theadRowStack[i - 1].cell[j]);
							tblparser.theadRowStack[i - 1].cell[j].child.push(currCell);
						}
					
					
						// Set the header on his descriptive cell if any 
						if (currCell.descCell) {
							currCell.descCell.header = currCell;
							currCell.descCell.headers = currCell;
						}
					}
				
				}
			
			}
			
			// Set Id/headers for header cell and data cell in the table.
			for (i = 0; i < tblparser.row.length; i += 1) {
				currRow = tblparser.row[i];
				var rowheadersgroup = [],
					rowheaders = [],
					currrowheader = [],
					ongoingRowHeader = [], 
					coldataheader = [];
				
				// Get or Generate a unique ID for each header in this row
				if (currRow.headerset && !currRow.idsheaderset) { 
					for (j = 0; j < currRow.headerset.length; j += 1) {
						rowheadersgroup = rowheadersgroup.concat(currRow.headerset[j]);
					}
					currRow.idsheaderset = rowheadersgroup;
				}
				
				if (currRow.header) { 
					for (j = 0; j < currRow.header.length; j += 1) {
						rowheaders = rowheaders.concat(currRow.header[j]);
					}
				}
				rowheaders = currRow.idsheaderset.concat(rowheaders);
				for (j = 0; j < currRow.cell.length; j += 1) {
					
					if ((j === 0) || (j > 0 && currRow.cell[j].uid !== currRow.cell[(j - 1)].uid)){
						currCell = currRow.cell[j];
						coldataheader = [];
						
						if (!currCell.header) { // Imediate header
							currCell.header = [];
						}
						if (!currCell.headers) { // all the headers
							currCell.headers = [];
						}
						
						
						if (currCell.col && !currCell.col.dataheader) {
							var currCol = currCell.col;
							var colheaders = [],
								colheadersgroup = [];
							if (currCol.headerLevel) { 
								for (m = 0; m < currCol.headerLevel.length; m += 1) {
									colheadersgroup = colheadersgroup.concat(currCol.headerLevel[m]);
								}
							}
							if (currCol.header) { 
								for (m = 0; m < currCol.header.length; m += 1) {
									colheaders = colheaders.concat(currCol.header[m]);
								}
							}
							
							if(!currCol.dataheader) {
								currCol.dataheader = [];
							}

							currCol.dataheader = currCol.dataheader.concat(colheadersgroup);
							currCol.dataheader = currCol.dataheader.concat(colheaders);
						}
						
						if (currCell.col && currCell.col.dataheader) {
							coldataheader = currCell.col.dataheader;
						}
						

						
						if (currCell.type === 1) {

							if (!currCell.child) { // Imediate sub cell
								currCell.child = [];
							}
							if (!currCell.childs) { // All the sub cell
								currCell.childs = [];
							}
								
							for (m = 0; m < ongoingRowHeader.length; m += 1) {

								if (currCell.colpos === (ongoingRowHeader[m].colpos + ongoingRowHeader[m].width)) {
									var childLength = ongoingRowHeader[m].child.length;
									if(childLength === 0 || (childLength > 0 && ongoingRowHeader[m].child[childLength - 1].uid !== currCell.uid)) {
										ongoingRowHeader[m].child.push(currCell);
									}
								}
								ongoingRowHeader[m].childs.push(currCell);
							}
							
							for (m = 0; m < currRow.idsheaderset.length; m += 1) {
							
								if (!currRow.idsheaderset[m].childs) { // All the sub cell
									currRow.idsheaderset[m].childs = [];
								}
								currRow.idsheaderset[m].childs.push(currCell);
							}
							
							currCell.header = currCell.header.concat(ongoingRowHeader); 
							
							currCell.headers = currCell.headers.concat(coldataheader);
							currCell.headers = currCell.headers.concat(currRow.idsheaderset);
							currCell.headers = currCell.headers.concat(ongoingRowHeader); 

							ongoingRowHeader = ongoingRowHeader.concat(currCell);
						}
						
						
						if (currCell.type === 2 || currCell.type === 3) {
							
							// Get Current Column Headers
							currrowheader = rowheaders;
							
							if (currCell.addcolheaders) {
								for (m = 0; m < currCell.addcolheaders.length; m += 1) {
									coldataheader = coldataheader.concat(currCell.addcolheaders[m]);
								}
							}
							
							if (currCell.addrowheaders) {
								for (m = 0; m < currCell.addrowheaders.length; m += 1) {
									currrowheader = currrowheader.concat(currCell.addrowheaders[m]);
								}
							}
							
							
							currCell.headers = currCell.headers.concat(coldataheader);
							currCell.headers = currCell.headers.concat(currrowheader);

							currCell.header = currCell.headers;
							
						}
						
										
					}
				}
			}

		}
			
			var tblMultiplier = [],
				calcTick = [],
				UseHeadRow,
				uniformCumul;
			
			// Determine an appropriate tick for the colgroup head (first colgroup)
			function helper1CalcVTick(parsedDataCell, headerlevel){
				var kIndex;
				headerlevel += 1;
				tblMultiplier.push([parsedDataCell.child.length, headerlevel]);
				for (kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1) {
					if (parsedDataCell.child[kIndex].child.length > 0){
						headerlevel = helper1CalcVTick(parsedDataCell.child[kIndex], headerlevel);
					}
				}
				headerlevel -= 1;
				return headerlevel;
			}
			function helper2CalcVTick(parsedDataCell, headerlevel){
				var kIndex;
				
				
				headerlevel += 1;
				var internalCumul = 0;
				internalCumul = parsedDataCell.flotValue - parsedDataCell.flotDelta;
				
				var flotDelta = (parsedDataCell.flotDelta / parsedDataCell.child.length);
				if (!smallestVerticalFlotDelta || flotDelta < smallestVerticalFlotDelta){
					smallestVerticalFlotDelta = flotDelta;
				}
				for (kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1) {
					parsedDataCell.child[kIndex].flotDelta = flotDelta;
					internalCumul = internalCumul + flotDelta;
					parsedDataCell.child[kIndex].flotValue = internalCumul;
					
					if (headerlevel === UseHeadRow) {
						calcTick.push([(parsedDataCell.child[kIndex].flotValue - flotDelta), $(parsedDataCell.child[kIndex].elem).text()]);
					}
					if (parsedDataCell.child[kIndex].child.length > 0){
						helper2CalcVTick(parsedDataCell.child[kIndex], headerlevel);
					}
				}
				headerlevel -= 1;
			}
			function calculateVerticalTick(parsedData) {
				
				// Get the appropriate ticks
				var nbCells = 0;
				// var tblMultiplier = [];
				
				var headerlevel = 0;
				var parsedDataCell;
				var i;
				
				tblMultiplier = [];
				
				if (!parsedData.colgrouphead) {
					return;
				}
				
				for (i = 0; i < parsedData.colgrouphead.col[0].cell.length; i += 1) {

					parsedDataCell = parsedData.colgrouphead.col[0].cell[i];
					
					if (i === 0 || (i > 0 && parsedData.colgrouphead.col[0].cell[i - 1].uid !== parsedDataCell.uid)) {
						
						if (parsedDataCell.rowgroup && parsedDataCell.rowgroup.type === 3) {
							// We only process the first column data group
							break;
						}
						
						if (parsedDataCell.type === 1 || parsedDataCell.type === 7)  {
							nbCells += 1;
							
							if (parsedDataCell.child.length > 0){
								headerlevel = helper1CalcVTick(parsedDataCell, headerlevel);
							}
						}
					}
				}
				
				tblMultiplier.push([nbCells, headerlevel]);
				
				var TotalRowValue = tblMultiplier[0][0];
				
				for (i = 1; i < tblMultiplier.length; i += 1){
					TotalRowValue = TotalRowValue * tblMultiplier[i][0];
				}
				
				
				//
				// Get the tick
				//
				// From an option that would choose the appropriate row.			
				// UseHeadRow get a number that represent the row to use to draw the label
				
				UseHeadRow = parsedData.colgrouphead.col.length - 1;
				
				
				// var calcTick = [];
				calcTick = [];
				
				var cumulFlotValue = 0;
				
				headerlevel = 0;
				// Set the associate tick value along with the headers
				for (i = 0; i < parsedData.colgrouphead.col[0].cell.length; i += 1) {
					
					parsedDataCell = parsedData.colgrouphead.col[0].cell[i];
					
					if (i === 0 || (i > 0 && parsedData.colgrouphead.col[0].cell[i - 1].uid !== parsedDataCell.uid)){

						if (parsedDataCell.rowgroup && parsedDataCell.rowgroup.type === 3) {
							// We only process the first column data group
							break;
						}
						
						if (parsedDataCell.type === 1 || parsedDataCell.type === 7)  {
							
							parsedDataCell.flotDelta = (TotalRowValue / nbCells);
							
						
							if (!smallestVerticalFlotDelta || parsedDataCell.flotDelta < smallestVerticalFlotDelta){
								smallestVerticalFlotDelta = parsedDataCell.flotDelta;
							}
							
							cumulFlotValue += parsedDataCell.flotDelta;
							
							parsedDataCell.flotValue = cumulFlotValue;
							if (headerlevel === UseHeadRow || 
							
								((parsedDataCell.colpos - 1) < UseHeadRow && UseHeadRow <= ((parsedDataCell.colpos - 1) + (parsedDataCell.width - 1)))){
								calcTick.push([(parsedDataCell.flotValue - parsedDataCell.flotDelta), $(parsedDataCell.elem).text()]);
							}
							
							if (parsedDataCell.child.length > 0){
								helper2CalcVTick(parsedDataCell, headerlevel);
							}
						}
					}
				}
				return calcTick;
			}
			
			function helper1CalcHTick(parsedDataCell, headerlevel){
				var kIndex;
				if (parsedDataCell.child.length === 0) {
					return;
				}
				headerlevel += 1;
				tblMultiplier.push([parsedDataCell.child.length, headerlevel]);
				for (kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1) {
					helper1CalcHTick(parsedDataCell.child[kIndex], headerlevel);
				}
				headerlevel -= 1;
			}
			
			
			function helper2CalcHTick(parsedDataCell, headerlevel){
				var kIndex,
					theadRowStack_len = parsedDataCell.groupZero.theadRowStack.length - 1;
				if (parsedDataCell.child.length === 0) {
					return;
				}
				headerlevel += 1;
				var internalCumul = 0;
				internalCumul = parsedDataCell.flotValue;
				
				var flotDelta = (!options.uniformtick ? (parsedDataCell.flotDelta / parsedDataCell.child.length): 1);
				if (!smallestHorizontalFlotDelta || flotDelta < smallestHorizontalFlotDelta){
					smallestHorizontalFlotDelta = flotDelta;
				}
				for (kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1) {
					parsedDataCell.child[kIndex].flotDelta = flotDelta;
					
					if (headerlevel === UseHeadRow) {
						calcTick.push([(!options.uniformtick ? internalCumul : uniformCumul), $(parsedDataCell.child[kIndex].elem).text()]);
					}
					
					if (headerlevel === theadRowStack_len || 
						((parsedDataCell.rowpos - 1) < theadRowStack_len && 
						theadRowStack_len <= ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))) ||
						theadRowStack_len === ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))) {
							
						uniformCumul += flotDelta;
					}
					
					parsedDataCell.child[kIndex].flotValue = internalCumul;
					internalCumul = internalCumul + flotDelta;
					
					helper2CalcHTick(parsedDataCell.child[kIndex], headerlevel);
				}
				headerlevel -= 1;
			}
			
			// Determine an appropriate tick for the rowgroup head (thead)
			function calculateHorisontalTick(parsedData) {
				
				if (!parsedData.theadRowStack) {
					return;
				}
				
					
				// Find the range of the first data colgroup
				var dataColgroupStart = -1;
				var dataColgroupEnd = -1;
				var i;
				for (i = 0; i < parsedData.colgroup.length; i += 1) {
					if (parsedData.colgroup[i].type === 2){
						dataColgroupStart = parsedData.colgroup[i].start;
						dataColgroupEnd = parsedData.colgroup[i].end;
						break;
					}
				}
				
				// Get the appropriate ticks
				var nbCells = 0,
					parsedDataCell,
					nbTotSlots = 0,
					headerlevel = 0;
					
				tblMultiplier = [];
				for (i = 0; i < parsedData.theadRowStack[0].elem.cells.length; i += 1) {
					
					parsedDataCell = $(parsedData.theadRowStack[0].elem.cells[i]).data().tblparser;
					
					if (parsedDataCell.colgroup && parsedDataCell.colgroup.type === 3) {
						// We only process the first column data group
						break;
					}
					
					if (parsedDataCell.colpos >= dataColgroupStart && (parsedDataCell.type === 1 || parsedDataCell.type === 7))  {
						nbCells += 1;
						
						nbTotSlots += parsedDataCell.width;
						
						
						
						
						helper1CalcHTick(parsedDataCell, headerlevel);
					}
				}
				tblMultiplier.push([nbCells, headerlevel]);
				
				var TotalRowValue = tblMultiplier[0][0];
				
				for (i = 1; i < tblMultiplier.length; i += 1){
					TotalRowValue = TotalRowValue * tblMultiplier[i][0];
				}
				
				
				//
				// Get the tick
				//
				// From an option that would choose the appropriate row.			
				// UseHeadRow get a number that represent the row to use to draw the label
				
				UseHeadRow = (!options.labelposition || (options.labelposition && options.labelposition > parsedData.theadRowStack.length) ? parsedData.theadRowStack.length : options.labelposition) - 1;
				
				calcTick = [];
				
				var cumulFlotValue = 0;
				uniformCumul = 0;

				headerlevel = 0;
				// Set the associate tick value along with the headers
				for (i = 0; i < parsedData.theadRowStack[0].elem.cells.length; i += 1) {
					
					parsedDataCell = $(parsedData.theadRowStack[0].elem.cells[i]).data().tblparser;
					
					if (parsedDataCell.colgroup && parsedDataCell.colgroup.type === 3) {
						// We only process the first column data group
						break;
					}
					
					if (parsedDataCell.colpos >= dataColgroupStart && (parsedDataCell.type === 1 || parsedDataCell.type === 7))  {

						parsedDataCell.flotDelta = (!options.uniformtick ? (TotalRowValue / nbCells) : 1);
						
						
						if (!smallestHorizontalFlotDelta || parsedDataCell.flotDelta < smallestHorizontalFlotDelta){
							smallestHorizontalFlotDelta = parsedDataCell.flotDelta;
						}
						parsedDataCell.flotValue = cumulFlotValue;

						if (headerlevel === UseHeadRow || ((parsedDataCell.rowpos - 1) < UseHeadRow && UseHeadRow <= ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1)))) {
							calcTick.push([(!options.uniformtick ? cumulFlotValue : uniformCumul), $(parsedDataCell.elem).text()]);
						}
						
						if (headerlevel === (parsedData.theadRowStack.length - 1) || 
						
							((parsedDataCell.rowpos - 1) < (parsedData.theadRowStack.length - 1) && 
							(parsedData.theadRowStack.length - 1) <= ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))) ||
									
							(parsedData.theadRowStack.length - 1) === ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))){
							
							uniformCumul += parsedDataCell.flotDelta;
							
						}
						
						cumulFlotValue += parsedDataCell.flotDelta;
						
						helper2CalcHTick(parsedDataCell, headerlevel);
					}
				}
				return calcTick;
			}

			
			// Function to switch the series order, like make it as vertical series to horizontal series (see Task #2997)
			function swapTable() {
				// function swapTable for request #2799, transforming horizontal table to virtical table; 
				// Government of Canada. Contact Qibo or Pierre for algorithm info and bug-fixing; 
				// important table element: id or class, th; 
				var sMatrix = [],
					i = 0,
					_ilen,
					j = 0,
					capVal = 'Table caption tag is missing',
					maxRowCol = 10, //basic;
					s = 0,
					t,
					tMatrix = [],
					swappedTable,
					html2,
					headStr,
					arr,
					tr;
				capVal =  $('caption', srcTbl).text();
				$('tr ', srcTbl).each(function () {
					maxRowCol += 1;
					if (s < 1) {
						$('td,th', $(this)).each(function () {
							if ($(this).attr('colspan') === undefined) {
								$(this).attr('colspan', 1);
							}
							maxRowCol += Number($(this).attr('colspan'));
							// block change, 20120118 fix for defect #3226, jquery 1.4 problem about colspan attribute, qibo; 
						});
					}
					s += 1;
				});
				// prepare the place holding matrix;
				for (s = 0; s < maxRowCol; s += 1) {
					tMatrix[s] = [];
					for (t = 0; t < maxRowCol; t += 1) {
						tMatrix[s][t] = 0;
					}
				}
				$('tr ', srcTbl).each(function () {
					j = 0;
					var attrCol = 1,
						attrRow = 1;
					$('td,th', $(this)).each(function () {
						if ($(this).attr('colspan') === undefined) {
							$(this).attr('colspan', 1);
						}
						if ($(this).attr('rowspan') === undefined) {
							$(this).attr('rowspan', 1);
						}
						attrCol = Number($(this).attr('colspan'));
						attrRow = Number($(this).attr('rowspan'));
						// block change, 20120118 fix for defect #3226, jquery 1.4 problem about colspan attribute, qibo; 
						while (tMatrix[i][j] === 3) {
							j += 1;
						}
						var ii = i,
							stopRow = i + attrRow - 1,
							jj,
							stopCol,
							ss1;
						if (attrRow > 1 && attrCol > 1) {
							jj = j;
							stopCol = j + attrCol - 1;
							for (jj = j; jj <= stopCol; jj += 1) {
								for (ii = i; ii <= stopRow; ii += 1) {
									tMatrix[ii][jj] = 3; //random number as place marker; 
								}
							}
						} else if (attrRow > 1) {
							for (ii = i; ii <= stopRow; ii += 1) {
								tMatrix[ii][j] = 3; // place holder; 
							}
						}
						ss1 = $(this).clone(); // have a copy of it, not destroying the look of the original table; 
						// transforming rows and cols and their properties; 
						ss1.attr('colspan', attrRow);
						ss1.attr('rowspan', attrCol);
						(sMatrix[j] = sMatrix[j] || [])[i] = ss1;
						j = j + attrCol;
					});
					i += 1;
				});
				// now creating the swapped table from the transformed matrix;
				swappedTable = $('<table>');
				$.each(sMatrix, function (s) {
					var oneRow = $('<tr>');
					swappedTable.append(oneRow);
					$.each(sMatrix[s], function (ind, val) {
						oneRow.append(val);
					});
				});
				// now adding the missing thead; 
				html2 = swappedTable.html();
				headStr = '<table id="swappedGraph">' + '<caption>' + capVal + ' (Horizontal to Vertical)</caption><thead>';
				html2 = html2.replace(/<tbody>/gi, headStr);
				html2 = html2.replace(/<\/tbody>/gi, '</tbody></table>');
				html2 = html2.replace(/\n/g, '');
				html2 = html2.replace(/<tr/gi, '\n<tr');
				arr = html2.split('\n');
				for (i = 0, _ilen = arr.length; i < _ilen; i += 1) {
					tr = arr[i];
					if (tr.match(/<td/i) !== null) {
						arr[i] = '</thead><tbody>' + tr;
						break;
					}
				}
				html2 = arr.join('\n');
				$(html2).insertAfter(srcTbl).hide(); //visible, for debugging and checking;
				return $(html2);
			}
			
			
			
			
			if (options.parsedirection === 'y') {
				self = swapTable(srcTbl);
			}
			
			// Parse the table
			if (!$(self).data().tblparser) {
				_pe.fn.parsertable.parse($(self));
			}
			
			var RowDefaultOptions = {
				'default-option': 'type', // Default CSS Options
				'default-namespace': ['wb-charts', 'wb-chart', 'wb-graph'],
				'type-autocreate': true,
				'color-typeof': 'string',
				'color-autocreate': true
			},
				parsedData = $(self).data().tblparser, // Retrieve the parsed data
				horizontalCalcTick,
				verticalCalcTick;
			
			// Fix the parsed data
			addTblHeaders(parsedData);
			
			//
			// Calculate the tick for a table where x is horizontal
			//
			horizontalCalcTick = calculateHorisontalTick(parsedData);

			//
			// Reverse the axis for the data table
			//
			verticalCalcTick = calculateVerticalTick(parsedData);
			
		
			calcTick = horizontalCalcTick;
			
			var allSeries = [],
				isPieChart,
				dataSeries = [],
				valueCumul = 0,
				header,
				rIndex,
				i,
				j,
				figCaptionElem,
				tblCaptionHTML,
				$placeHolder,
				tblSrcContainer,
				tblSrcContainerSummary,
				cellValue;
			

			
			if (options.type === 'pie') {
				// Use Reverse table axes
				// Create a chart/ place holder, by series
				var pieLabelFormater,
					mainFigureElem = $('<figure />').insertAfter(srcTbl),
					_graphclasslen;
				
				pieLabelFormater = function (label, series) {
					var textlabel;
					if (!options.decimal) {
						textlabel = Math.round(series.percent);
					} else {
						textlabel = Math.round(series.percent * Math.pow(10, options.decimal));
						textlabel = textlabel / Math.pow(10, options.decimal);
					}
					if (options.nolegend) {
						// Add the series label
						textlabel = label + '<br/>' + textlabel;
					}
					return textlabel + '%';
				};
				mainFigureElem.addClass('wb-charts'); // Default
				if (options.graphclass) {
					if ($.isArray(options.graphclass)) {
						for (i = 0, _graphclasslen = options.graphclass.length; i < _graphclasslen; i += 1) {
							mainFigureElem.addClass(options.graphclass[i]);
						}
					} else {
						mainFigureElem.addClass(options.graphclass);
					}
				}
				
				figCaptionElem = $('<figcaption />');
				
				$(mainFigureElem).append(figCaptionElem);
				tblCaptionHTML = $('caption', srcTbl).html();
				var tblCaptionText = $('caption', srcTbl).text();
				$(figCaptionElem).append(tblCaptionHTML);
				
				
				
				
				var dataGroup = (parsedData.colgroup[0].type === 1 ? parsedData.colgroup[1]: parsedData.colgroup[0]);
				
				for (rIndex=parsedData.lstrowgroup[0].row.length - 1; rIndex >= 0; rIndex -= 1) {
					
					
					for (i=0;i<dataGroup.col.length; i += 1) {
						dataSeries = [];
						valueCumul = 0;
						
						// For each cells
						for(j=0; j<dataGroup.col[i].cell.length; j += 1){
							
							
							if(dataGroup.col[i].cell[j].rowgroup.type !== 2 || (j > 0 && dataGroup.col[i].cell[j -1].rowgroup.uid !== dataGroup.col[i].cell[j].rowgroup.uid) ){
								break;
							}
						
							// Get's the value
							header = dataGroup.col[i].cell[j].row.header;
							
							cellValue = options.getcellvalue(dataGroup.col[i].cell[rIndex].elem);
							
							dataSeries.push(
								[
									valueCumul, 
									typeof cellValue === "object" ? cellValue[0] : cellValue
								]);
							
							valueCumul += header[header.length - 1].flotDelta;
						
							break;
						}
						var tdOptions =  setClassOptions(RowDefaultOptions,				
				($(dataGroup.col[i].cell[rIndex].elem).attr('class') !== undefined ? 
				$(dataGroup.col[i].cell[rIndex].elem).attr('class') : ''));
						
						allSeries.push({ data: dataSeries, label: $(dataGroup.col[i].dataheader[dataGroup.col[i].dataheader.length - 1].elem).text(), color: (!tdOptions.color?colourNameToHex(i):colourNameToHex(tdOptions.color))});
					}

					
					// Create the Canvas
					$placeHolder = $('<div />');
					
					// Create a sub Figure or use the main one ?
					var pieChartLabelText = '';
					if (parsedData.lstrowgroup[0].row.length === 1 && 
						($(parsedData.lstrowgroup[0].row[0].header[0].elem).html() === tblCaptionHTML || 
						parsedData.lstrowgroup[0].row[0].header.length === 0)) {
						
						pieChartLabelText = tblCaptionText;
						
						// Use the main Container
						$(mainFigureElem).append($placeHolder);
						
					} else {
					
						// Use a sub container
						var $subFigureElem = $('<figure />').appendTo(mainFigureElem),
							$subfigCaptionElem = $('<figcaption />');
						
						header = parsedData.lstrowgroup[0].row[rIndex].header;
						
						pieChartLabelText = $(header[header.length - 1].elem).text();
						
						$subFigureElem.append($subfigCaptionElem);
						$subfigCaptionElem.append($(header[header.length - 1].elem).html());
						
						$subFigureElem.append($placeHolder);
					}
						
					
					// Canvas Size
					$placeHolder.css('height', options.height).css('width', options.width);

					
					
					$placeHolder.attr('role', 'img');
					// Add a aria label to the svg build from the table caption with the following text prepends ' Chart. Details in table following.'
					$placeHolder.attr('aria-label', pieChartLabelText + ' ' + _pe.dic.get('%table-following')); // 'Chart. Details in table following.'
					
					//
					// Pie Charts Options
					//
					var pieOptions = {
						series: {
							pie: {
								show: true
							}
						}
					};
					// Hide the legend,
					if (options.nolegend) {
						pieOptions.legend = {show: false};
					}
					// Add pie chart percentage label on slice
					if (options.percentlegend) {
						pieOptions.series.pie.radius = options.pieradius / 100;
						pieOptions.series.pie.label = {
							show: true,
							radius: options.pielblradius / 100,
							formatter: pieLabelFormater
						};
						// Hides the labels of any pie slice that is smaller than the specified percentage (ranging from 0 to 100)
						if (options.piethreshold) {
							pieOptions.series.pie.label.threshold = options.piethreshold / 100;
						}
					}
					// Percentage of tilt ranging from 0 and 100, where 100 has no change (fully vertical) and 0 is completely flat (fully horizontal -- in which case nothing actually gets drawn)
					if (options.pietilt) {
						pieOptions.series.pie.tilt = options.pietilt / 100;
					}
					// Sets the radius of the donut hole. If value is between 0 and 100 (inclusive) then it will use that as a percentage of the radius, otherwise it will use the value as a direct pixel length.
					if (options.pieinnerradius) {
						pieOptions.series.pie.innerRadius = options.pieinnerradius / 100;
					}
					// Factor of PI used for the starting angle (in radians) It can range between 0 and 200 (where 0 and 200 have the same result).
					if (options.piestartangle) {
						pieOptions.series.pie.startAngle = options.piestartangle / 100;
					}
					//	Opacity of the highlight overlay on top of the current pie slice. (Range from 0 to 100) Currently this just uses a white overlay, but support for changing the color of the overlay will also be added at a later date.
					if (options.piehighlight) {
						pieOptions.series.pie.highlight = options.piehighlight / 100;
					}
					// hoverable
					if (options.piehoverable) {
						pieOptions.grid = {
							hoverable: true
						};
					}
					
					// Create the graphic
					$.plot($placeHolder, allSeries, pieOptions);
					
					if (!options.legendinline) {
						// Move the legend under the graphic
						$('.legend > div', $placeHolder).remove();
						$('.legend > table', $placeHolder).removeAttr('style').addClass('font-small');
						$placeHolder.css('height', 'auto');
					}
					$('canvas:eq(1)', $placeHolder).css('position', 'static');

					// Remove any "pieLabel" ids set by the flotPie.js plugin at line #457
					$('.pieLabel').removeAttr('id');
					
					allSeries = [];

				}
				
				if (!options.noencapsulation) { // eg of use:	wb-charts-noencapsulation-true
					// Use a details/summary to encapsulate the table
					// Add a aria label to the table element, build from his caption prepend the word ' Table'
					// For the details summary, use the table caption prefixed with Table.
					tblSrcContainer = $('<details />');
					tblSrcContainerSummary = $('<summary />');
					$(tblSrcContainer).appendTo(mainFigureElem);
					// set the title for the ability to show or hide the table as a data source
					$(tblSrcContainerSummary).text(tblCaptionHTML + ' ' + _pe.dic.get('%table-mention'))
						.appendTo(tblSrcContainer)
						.after(srcTbl);

					_pe.polyfills.enhance('detailssummary', tblSrcContainer);
					
				} else {
					// Move the table inside the figure element
					$(srcTbl).appendTo(mainFigureElem);
				}
				
				// Destroy the temp table if used
				if (options.parsedirection === 'y') {
					$(self).remove();
				}
				return;
			}
			
			var nbBarChart = 0,
				barDelta,
				rowOptions;
			
			
			// Count nbBarChart, 
			for (i=0;i<parsedData.lstrowgroup[0].row.length; i++) {
				rowOptions = setClassOptions(RowDefaultOptions,				
				($(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).attr('class') !== undefined ? 
				$(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).attr('class') : ''));
				 
				 
				 
				if ((!rowOptions.type && (options.type === 'bar' || options.type === 'stacked')) || (rowOptions.type && (rowOptions.type === 'bar' || rowOptions.type === 'stacked'))) {
					nbBarChart += 1;
					rowOptions.chartBarOption = nbBarChart;
					if (!barDelta && ((rowOptions.type && rowOptions.type === 'bar') || (!rowOptions.type && options.type === 'bar'))) {
						barDelta = true;
					}
				}

				parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].chartOption = rowOptions;
			}
			
			// First rowgroup assume is a data row group. 
			// For all row....
			for (i=0;i<parsedData.lstrowgroup[0].row.length; i++) {
				dataSeries = [];
				var datacolgroupfound = 0;
				valueCumul = 0;
				
				rowOptions = parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].chartOption;

				// For each cells
				for(j=0; j<parsedData.lstrowgroup[0].row[i].cell.length; j++){
					
					if(datacolgroupfound > 1 && parsedData.lstrowgroup[0].row[i].cell[j].col.groupstruct.type !== 2){
						break;
					}
					
					if(parsedData.lstrowgroup[0].row[i].cell[j].col.groupstruct.type === 2){
					
						// Get's the value
						
						header = parsedData.lstrowgroup[0].row[i].cell[j].col.header;
						var valuePoint = valueCumul;
						
						// Bar chart case, re-evaluate the calculated point
						if (barDelta && rowOptions.chartBarOption) {
							// Position bar
							valuePoint = valueCumul - (smallestHorizontalFlotDelta / 2)  + ((smallestHorizontalFlotDelta / nbBarChart) * (rowOptions.chartBarOption - 1));
							
							if (nbBarChart === 1) {
								valuePoint = valueCumul;
							}
							
						}
						
						cellValue = options.getcellvalue(parsedData.lstrowgroup[0].row[i].cell[j].elem);
							
						// Add the data point
						dataSeries.push(
							[
								valuePoint, 
								typeof cellValue === "object" ? cellValue[0] : cellValue
							]);
						valueCumul += header[header.length - 1].flotDelta;
						datacolgroupfound++;
					}
				}
				
				
				
				// Get the graph type
				
				if (!rowOptions.type) {
					rowOptions.type = options.type;
				}
				
				if (rowOptions.type === 'line') {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color))});
				} else if (rowOptions.type === 'area') {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color)),
					lines: { show: true, fill: true }
					});
				} else if (rowOptions.type === 'bar' || (barDelta && rowOptions.type === 'stacked')) {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color)),
					bars: {
						show: true,
						barWidth: (1 / nbBarChart * 0.9),
						align: 'center'
					}});
					
				} else if (rowOptions.type === 'stacked') {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color)),
					bars: {
						show: true,
						barWidth: 0.9,
						align: 'center'
					}});
				} else if (rowOptions.type === 'pie') {
					
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color))});
					
					isPieChart = true;
				}
				
				
			}
			
			
			var figureElem = $('<figure />').insertAfter(srcTbl),
				_graphclasslen2;
			figureElem.addClass('wb-charts'); // Default
			if (options.graphclass) {
				if ($.isArray(options.graphclass)) {
					for (i = 0, _graphclasslen2 = options.graphclass.length; i < _graphclasslen2; i += 1) {
						figureElem.addClass(options.graphclass[i]);
					}
				} else {
					figureElem.addClass(options.graphclass);
				}
			}
			
			figCaptionElem = $('<figcaption />');
			
			$(figureElem).append(figCaptionElem);
			tblCaptionHTML = $('caption', srcTbl).html();
			$(figCaptionElem).append(tblCaptionHTML);
			
			// Create the placeholder
			$placeHolder = $('<div />');
			
			$(figureElem).append($placeHolder);
			
			// Canvas Size
			$placeHolder.css('height', options.height).css('width', options.width);
			
			
			$placeHolder.attr('role', 'img');
			// Add a aria label to the svg build from the table caption with the following text prepends ' Chart. Details in table following.'
			$placeHolder.attr('aria-label', $('caption', srcTbl).text() + ' ' + _pe.dic.get('%table-following')); // 'Chart. Details in table following.'
			
			
			if (!options.noencapsulation) { // eg of use:	wb-charts-noencapsulation-true
				// Use a details/summary to encapsulate the table
				// Add a aria label to the table element, build from his caption prepend the word ' Table'
				// For the details summary, use the table caption prefixed with Table.
				tblSrcContainer = $('<details />');
				tblSrcContainerSummary = $('<summary />');
				$(tblSrcContainer).appendTo(figureElem);
				// set the title for the ability to show or hide the table as a data source
				$(tblSrcContainerSummary).text(tblCaptionHTML + ' ' + _pe.dic.get('%table-mention'))
					.appendTo(tblSrcContainer)
					.after(srcTbl);

				_pe.polyfills.enhance('detailssummary', tblSrcContainer);
				
			} else {
				// Move the table inside the figure element
				$(srcTbl).appendTo(figureElem);
			}
	
			// Create the graphic
			
			var plotParameter = {
					xaxis: (calcTick.length > 0 ? {ticks: calcTick} : { })
				};
			if (options.topvalue) {
				if (!plotParameter.yaxis) {
					plotParameter.yaxis = {};
				}
				if (options.topvaluenegative) {
					options.topvalue *= -1;
				}
				plotParameter.yaxis.max = options.topvalue;
			}
			if (options.bottomvalue) {
				if (!plotParameter.yaxis) {
					plotParameter.yaxis = {};
				}
				if (options.bottomvaluenegative) {
					options.bottomvalue *= -1;
				}
				plotParameter.yaxis.min = options.bottomvalue;
			}
			if (options.steps) {
				if (!plotParameter.yaxis) {
					plotParameter.yaxis = {};
				}
				plotParameter.yaxis.ticks = options.steps;
			} 
			 
			$.plot($placeHolder, allSeries, plotParameter);
			
			
			if (!options.legendinline) {
				// Move the legend under the graphic
				$('.legend > div', $placeHolder).remove();
				$('.legend > table', $placeHolder).removeAttr('style').addClass('font-small');
				$placeHolder.css('height', 'auto');
			}
			if (options.nolegend) {
				// Remove the legend
				$('.legend', $placeHolder).remove();
			}
			$('canvas:eq(1)', $placeHolder).css('position', 'static');
			
			// Destroy the temp table if used
			if (options.parsedirection === 'y') {
				$(self).remove();
			}
				
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
