/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Charts for WET 3.1.x
 */
/*global jQuery: false, pe:false, wet_boew_charts: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.chartsGraph = {
		// type: 'plugin',
		// depends: ['raphael', 'parserTable'],
		// polyfills: ['detailssummary'],
		generate: function (elm) {
			var options = {},
				o,
				self = $(elm),
				// graphStartExecTime = new Date().getTime(), // This variable is used to autogenerate ids for the given tables.
				smallestHorizontalFlotDelta,
				smallestVerticalFlotDelta; // Default Colors set
			// console.log('graph start exec time ' + graphStartExecTime);
			if (typeof (wet_boew_charts) !== 'undefined' && wet_boew_charts !== null) {
				options = wet_boew_charts;
			}
			//configuration
			o = $.extend(true, {
				"default-namespace": ["wb-charts", "wb-chart", "wb-graph"],
				"graphclass-autocreate": true, // This add the ability to set custom css class to the figure container.
				"graphclass-overwrite-array-mode": true,
				"graphclass-typeof": "string",
				"noencapsulation-autocreate": true,
				
				// Force to have an uniform tick
				uniformtick: true,
				"uniformtick-typeof": "boolean",
				"uniformtick-autocreate": true,
				
				// Force to use which row in the thead for the label
				"labeltheadrownum-typeof": "number",
				"labeltheadrownum-autocreate": true,
				
				// Legend Management
				"legendinline-typeof": "boolean",
				"legendinline-autocreate": true,
				"nolegend-typeof": "boolean",
				"nolegend-autocreate": true,
				
				// Force the Top and Bottom Value for a graph
				"topvalue-autocreate": true,
				"topvalue-typeof": "number",
				"topvaluenegative-autocreate": true,
				"topvaluenegative-typeof": "boolean",
				"bottomvalue-autocreate": true,
				"bottomvalue-typeof": "number",
				"bottomvaluenegative-autocreate": true,
				"bottomvaluenegative-typeof": "boolean",
				"nocutaxis-autocreate": true,
				"nocutaxis-typeof": "boolean",
				// This is to set a predefined interval
				// Note: Any Top or bottom value will be overwritten with an pre-defined interval
				"steps-autocreate": true,
				"steps-typeof": "number",
				// This is to set a decimal precision for the pie chart
				"decimal-autocreate": true,
				"decimal-typeof": "number",
				// This is to set the delayed execution timer
				"execdelay-autocreate": true,
				"execdelay-typeof": "number",
				// This is the default option for a series
				serie: {
					type: 'line',
					color: 'blue' // Line color or Fill Color
				},
				serie2dAxis: {
					dasharray: "",
					fillopacity: 100 // Use for Area graph type
				},
				heading2dAxis: {
					fill: 'white', // Color used to fill the Heading zone
					fillover: 'blue', // Color used to fill the Heading on a mouse over
					foreground: 'black', // foreground color for the Heading
					foregroundover: 'red' // foreground color on mouse over
				},
				'default-option': 'type', // Default CSS Options
				// Graph Type
				type: 'bar', // this be one of or an array of: area, pie, line, bar, stacked
				"type-autocreate": true,
				optionsClass: {
					'default-option': 'type', // Default CSS Options
					"type-autocreate": true,
					"color-autocreate": true,
					"overcolor-autocreate": true,
					"default-namespace": ["wb-charts", "wb-chart", "wb-graph"],
					"dasharray-autocreate": true,
					"noencapsulation-autocreate": true,
					"fillopacity-autocreate": true,
					"fillopacity-typeof": "number"
				},
				//
				// Graph Layout
				//
				width: $(elm).width(), // width of canvas - defaults to table height
				"width-typeof": "number",
				height: $(elm).height(), // height of canvas - defaults to table height
				"height-typeof": "number",
				maxwidth: '9999',// '590',
				// "maxwidth-typeof": "locked", //Remove the lock, that will allow zomming feature in the canvas to fit it in the webpage
				"maxwidth-typeof": "number",
				widthPadding: 2, // That is to fix the svg positioning offset (left: -0.5px; top: -0.56665px)
				//
				// Colors
				//
				colors: ['#be1e2d', '#666699', '#92d5ea', '#ee8310', '#8d10ee', '#5a3b16', '#26a4ed', '#f45a90', '#e9e744'], // Serie colors set
				textColors: [], //corresponds with colors array. null/undefined items will fall back to CSS
				//
				// Data Table and Graph Orientation
				//
				parsedirection: 'x', // which direction to parse the table data
				"parsedirection-typeof": "string",
				"parsedirection-autocreate": true,
				drawDirection: 'x', // TODO Not implemented yet - which direction are the dependant axis
				//
				// Pie Graph Option 
				//
				pieMargin: 20, //pie charts only - spacing around pie
				pieLabelsAsPercent: true,
				pieLabelPos: 'inside',
				//
				// Line, Area, Bar, Stacked Option
				//
				lineWeight: 4, // for line and area - stroke weight
				barGroupMargin: 10,
				barMargin: 1, // space around bars in bar chart (added to both sides of bar)
				//
				// Font Option * NEW v2.0
				//
				font: {
					height: 20, // Number of pixel
					width: 10, // Number of pixel (Minimum Value = half size of the height)
					size: 14 // Font Size
				},
				//
				// Axis Draw Option * NEW v2.0
				//
				axis: {
					top: {
						tick: null, // Draw the top tick line (If specified the axis.tick would be ignored)
						lenght: null, // Number of pixel (If specified the axis.lenght would be ignored)
						padding: null // Padding at the top of x-axis
					},
					right: {
						tick: null, // Draw the right tick line (If specified the axis.tick would be ignored)
						lenght: null, // Number of pixel (If specified the axis.lenght would be ignored)
						padding: null // Padding at the right of x-axis
					},
					bottom: {
						tick: null, // Draw the bottom tick line (If specified the axis.tick would be ignored)
						lenght: null, // Number of pixel (If specified the axis.lenght would be ignored)
						padding: null // Padding at the bottom of x-axis
					},
					left: {
						tick: null, // Draw the left tick line (If specified the axis.tick would be ignored)
						lenght: null, // Number of pixel (If specified the axis.lenght would be ignored)
						padding: null // Padding at the left of x-axis
					},
					tick: true, // Draw the tick line
					lenght: 4, // Number of pixel
					padding: 4, // Number of pixel, distance between the axes/graph limit and the text
					minNbIncrementStep: 6 // Minimum Number of incrementing step, that's mean an auto resize if needed and no Axis cut
				}
			}, options);
			
			// Set the new class options if defined
			o = setClassOptions(o, ($(self).attr('class') !== undefined ? $(self).attr('class') : ""));
			
			function colourNameToHex(colour) {
				// colorsAccent = ["#8d201c", "#EE8310", "#2a7da6", "#5a306b", "#285228", "#154055", "#555555", "#f6d200", "#d73d38", "#418541", "#87aec9", "#23447e", "#999999"];
				var colours = {"aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff", "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887", "cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff", "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f", "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1", "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dodgerblue": "#1e90ff", "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff", "gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f", "honeydew": "#f0fff0", "hotpink": "#ff69b4", "indianred ": "#cd5c5c", "indigo ": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c", "lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2", "lightgrey": "#d3d3d3", "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de", "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6", "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5", "navajowhite": "#ffdead", "navy": "#000080", "oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6", "palegoldenrod": "#eee8aa", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080", "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1", "saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4", "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato":  "#ff6347", "turquoise":	"#40e0d0", "violet":  "#ee82ee", "wheat":  "#f5deb3", "white":	"#ffffff", "whitesmoke":  "#f5f5f5", "yellow": "#ffff00", "yellowgreen": "#9acd32",
				
				// Accent Colors
				"accent-1": "#8d201c", 
				"accent-2": "#EE8310", 
				"accent-3": "#2a7da6", 
				"accent-4": "#5a306b", 
				"accent-5": "#285228", 
				"accent-6": "#154055", 
				"accent-7": "#555555", 
				"accent-8": "#f6d200", 
				"accent-9": "#d73d38", 
				"accent-10": "#418541", 
				"accent-11": "#87aec9", 
				"accent-12": "#23447e", 
				"accent-13": "#999999"
				};
				
				if (typeof (colour) === "number")  {
					colour = "accent-" + (colour + 1);
				}
				
				return (colours[colour.toLowerCase()] !== 'undefined' ? colours[colour.toLowerCase()] : ($.isArray(o.colors) ? o.colors[0] : o.colors));
			}
			
			// Function to Convert Class instance to JSON
			function setClassOptions (sourceOptions, strClass, namespace) {
				var separatorNS = "",
					separator = "",
					autoCreate = false,
					arrNamespace,
					arrClass;
				// Test: optSource
				if (typeof (sourceOptions) !== "object") {
					// console.log("Empty source");
					return {};
				}
				// Get a working copy for the sourceOptions
				sourceOptions = jQuery.extend(true, {}, sourceOptions);
				/*
				// Check if some option need to be removed
				function unsetOption(opt, currLevel, maxLevel) {
					if (currLevel > maxLevel || !$.isArray(opt)) {
						return;
					}
					var arrToRemove = [],
						i,
						_ilen;
					for (key in opt) {
						// if the key are ending "-remove", get the key to remove
						if (key.lenght > 7 && key.substr(key.lenght - 7) === "-remove") {
							arrToRemove.push(key.substr(0, key.lenght - 7));
						} else {
							// get it deeper if applicable
							if (typeof(opt[key])) === "object") {
								currLevel ++;
								if (currLevel < maxLevel) {
									unsetOption(opt[key], currLevel, maxLevel);
								}
							}
						}
					}
					for (i = 0, _ilen =  arrToRemove.length; i < _ilen; i += 1) {
						delete opt[arrToRemove[i]];
					}
				}
				
				// Check for an unsetOptionsLevel, if defined to the unset
				if (sourceOptions['default-unsetoptionlevel'] && typeof(sourceOptions['default-unsetoptionlevel']) === "number") {
					unsetOption(sourceOptions, 1, sourceOptions['default-unsetoptionlevel']);
				}*/
				// Test: strClass
				if (typeof (strClass) !== "string" || strClass.lenght === 0) {
					// console.log("no string class");
					return sourceOptions;
				}
				// Test: namespace
				if (typeof (namespace) !== "string" || namespace.lenght === 0) {
					// Try to get the default namespace
					if (sourceOptions['default-namespace'] && (typeof (sourceOptions['default-namespace']) === "string" || $.isArray(sourceOptions['default-namespace']))) {
						namespace = sourceOptions['default-namespace'];
					} else {
						// This a not a valid namespace
						// console.log("no namespace");
						return sourceOptions;
					}
				}
				// Get the namespace separator if defined (optional)
				if (sourceOptions['default-namespace-separator'] && typeof (sourceOptions['default-namespace-separator']) === "string") {
					separatorNS = sourceOptions['default-namespace-separator'];
				} else {
					separatorNS = "-"; // Use the default
				}
				// Get the option separator if defined (optional)
				if (sourceOptions['default-separator'] && typeof (sourceOptions['default-separator']) === "string") {
					separator = sourceOptions['default-separator'];
				} else {
					separator = " "; // Use the default
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
							if (namespace[i] === (this.length > namespace[i].length + separatorNS.length ? this.slice(0, namespace[i].length) : "")) {
								arrNamespace = namespace[i].split(separatorNS);
								arrParameter = this.split(separatorNS).slice(arrNamespace.length);
								propName = arrNamespace[arrNamespace.length - 1];
								break;
							}
						}
					} else {
						// One unique namespace
						if (namespace === (this.length > namespace.length + separatorNS.length ? this.slice(0, namespace.length) : "")) {
							arrNamespace = namespace.split(separatorNS);
							arrParameter = this.split(separatorNS).slice(arrNamespace.length);
							propName = arrNamespace[arrNamespace.length - 1];
						}
					}
					
					if (arrParameter && propName) {
						// This is a valid parameter, start the convertion to a JSON object
						// Get all defined parameter
						
						for (i = 0, _ilen = arrParameter.length; i < _ilen; i += 1) {
							valIsNext = (i + 2 === _ilen ? true : false);
							isVal = (i + 1 === _ilen ? true : false);
							// console.log('propName:' + propName + ' value:' + arrParameter[i] + ' valIsNext:' + valIsNext + ' isVal:' + isVal);
							// Check if that is the default value and make a reset to the parameter name if applicable
							if (isVal && _ilen === 1 && sourceOptions['default-option']) {
								propName = sourceOptions['default-option'];
							} else if (!isVal) {
								propName = arrParameter[i];
							}
							// Get the type of the current option (if available)
							// (Note: an invalid value are defined by "undefined" value)
							// Check if the type are defined
							if (currObj[propName + '-typeof']) {
								// Repair the value if needed
								arrValue = [];
								for (j = (i + 1); j < _ilen; j += 1) {
									arrValue.push(arrParameter[j]);
								}
								arrParameter[i] = arrValue.join(separatorNS);
								valIsNext = false;
								isVal = true;
								switch (currObj[propName + '-typeof']) {
								case "boolean":
									if (arrParameter[i] === "true" || arrParameter[i] === "1" || arrParameter[i] === "vrai" || arrParameter[i] === "yes" || arrParameter[i] === "oui") {
										arrParameter[i] = true;
									} else if (arrParameter[i] === "false" || arrParameter[i] === "0" || arrParameter[i] === "faux" || arrParameter[i] === "no" || arrParameter[i] === "non") {
										arrParameter[i] = false;
									} else {
										arrParameter[i] = undefined;
									}
									break;
								case "number":
									// console.log(arrParameter[i]);
									if (!isNaN(parseInt(arrParameter[i], 10))) {
										arrParameter[i] = parseInt(arrParameter[i], 10);
									} else {
										arrParameter[i] = undefined;
									}
									break;
								case "string":
									break;
								case "undefined":
								case "function":
								case "locked":
									arrParameter[i] = undefined;
									break;
								default:
									// that include the case "object"
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
							// console.log('After propName:' + propName + ' value:' + arrParameter[i] + ' valIsNext:' + valIsNext + ' isVal:' + isVal);
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
									if (typeof (arrParameter[i]) === "boolean" || typeof (arrParameter[i]) === "number") {
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
			
			// Add headers information to the table parsed data structure
			// Similar sample of code as the HTML Table validator
			function addTblHeaders(tblparser) {
			var i, j, k, m, currRow;
			
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
					ongoingRowHeader = [];
				
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
				// rowheaders = (currRow.idsheaderset ? currRow.idsheaderset + ' ' + rowheaders : rowheaders);
				rowheaders = currRow.idsheaderset.concat(rowheaders);
				for (j = 0; j < currRow.cell.length; j += 1) {
					
					if ((j === 0) || (j > 0 && currRow.cell[j].uid !== currRow.cell[(j - 1)].uid)){
						var currCell = currRow.cell[j],
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
						
						/*
						if (currCell.type === 4 || currCell.type === 5) {
							var descHeaders = "";
							
							if (currCell.describe) {
								for (m = 0; m < currCell.describe.length; m += 1) {
									var currCellId = $(currCell.describe[m].elem).attr('id');
									if (currCellId === undefined || currCellId === '' || resetIds) {
										// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
										currCellId = idPrefix + currCell.describe[m].uid; // Generate a new ID
										$(currCell.describe[m].elem).attr('id', currCellId);
									}
									descHeaders = (descHeaders ? descHeaders + ' ' + currCellId : currCellId);
									if (currCell.type === 5 && !$(currCell.describe[m].elem).attr('aria-describedby')) {
										var currCellId = $(currCell.elem).attr('id');
										if (currCellId === undefined || currCellId === '' || resetIds) {
											// currCellId = idPrefix + new Date().getTime() + currCell.uid; // Generate a new ID
											currCellId = idPrefix + currCell.uid; // Generate a new ID
											$(currCell.elem).attr('id', currCellId);
										}
										$(currCell.describe[m].elem).attr('aria-describedby', currCellId);
									}
								}
							}
							if (currCell.type !== 4) {
								$(currCell.elem).attr('headers', (coldataheader ? coldataheader : '') + (coldataheader && descHeaders ? ' ' : '') + (descHeaders || ''));
								if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
									$(currCell.elem).removeAttr('headers');
								}
							} else if (!$(currCell.elem).attr('aria-describedby')) {
								$(currCell.elem).attr('aria-describedby', descHeaders || '');
								$(currCell.elem).attr('headers', coldataheader || '');
								if ($(currCell.elem).attr('headers') === undefined || $(currCell.elem).attr('headers') === '') {
									$(currCell.elem).removeAttr('headers');
								}
							}
						}*/					
					}
				}
			}

		}
			
			// Helper Function to get data cell units and value
			function getCellValue(cellRawValue) {
				//trim spaces in the string;
				cellRawValue = cellRawValue.replace(/\s\s+/g, " ");
				cellRawValue = cellRawValue.replace(/^\s+|\s+$/g, "");
				// Return the result
				var result = {
				cellUnit: cellRawValue.match(/[^\+\-\.\, 0-9]+[^\-\+0-9]*/), // Type: Float - Hint: You can use the JS function "parseFloat(string)"
				cellValue: parseFloat(cellRawValue.match(/[\+\-0-9]+[0-9,\. ]*/)) // Type: String
				};
				return result;
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
				
				/*if (parsedDataCell.child.length === 0) {
					return;
				}*/
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
				
				// console.log(tblMultiplier);
				
				var TotalRowValue = tblMultiplier[0][0];
				
				for (i = 1; i < tblMultiplier.length; i += 1){
					TotalRowValue = TotalRowValue * tblMultiplier[i][0];
				}
				// console.log(tblMultiplier);
				// console.log(TotalRowValue);
				
				
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
							// console.log(parsedDataCell);
							if (headerlevel === UseHeadRow || 
							
								((parsedDataCell.colpos - 1) < UseHeadRow && UseHeadRow <= ((parsedDataCell.colpos - 1) + (parsedDataCell.width - 1)))){
								calcTick.push([(parsedDataCell.flotValue - parsedDataCell.flotDelta), $(parsedDataCell.elem).text()]);
							}
							
							// console.log(parsedDataCell);
							
							
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
				var kIndex;
				if (parsedDataCell.child.length === 0) {
					return;
				}
				headerlevel += 1;
				var internalCumul = 0;
				// internalCumul = (parsedDataCell.flotValue - parsedDataCell.flotDelta);
				internalCumul = parsedDataCell.flotValue;
				
				
				// var flotDelta = (!o.uniformtick ? (parsedDataCell.flotDelta / parsedDataCell.child.length): (TotalRowValue / nbTotSlots));
				var flotDelta = (!o.uniformtick ? (parsedDataCell.flotDelta / parsedDataCell.child.length): 1);
				if (!smallestHorizontalFlotDelta || flotDelta < smallestHorizontalFlotDelta){
					smallestHorizontalFlotDelta = flotDelta;
				}
				for (kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1) {
					parsedDataCell.child[kIndex].flotDelta = flotDelta;
					
					if (headerlevel === UseHeadRow) {
						calcTick.push([(!o.uniformtick ? internalCumul : uniformCumul), $(parsedDataCell.child[kIndex].elem).text()]);
						/*
						if (UseHeadRow === (parsedData.theadRowStack.length - 1)
						uniformCumul += flotDelta;
						*/
						// calcTick.push([(parsedDataCell.child[kIndex].flotValue - flotDelta), $(parsedDataCell.child[kIndex].elem).text()]);
					}
					
					if (headerlevel === (parsedData.theadRowStack.length - 1) || 
						((parsedDataCell.rowpos - 1) < (parsedData.theadRowStack.length - 1) && 
						(parsedData.theadRowStack.length - 1) <= ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))) ||
						
						(parsedData.theadRowStack.length - 1) === ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))) {
							
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
				var nbCells = 0;
				var parsedDataCell;
				var nbTotSlots = 0;
				// var tblMultiplier = [];
				tblMultiplier = [];
				var headerlevel = 0;
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
				// console.log(tblMultiplier);
				// console.log(TotalRowValue);
				
				
				//
				// Get the tick
				//
				// From an option that would choose the appropriate row.			
				// UseHeadRow get a number that represent the row to use to draw the label
				
				o.labeltheadrownum = 2;
				
				UseHeadRow = (!o.labeltheadrownum || (o.labeltheadrownum && o.labeltheadrownum > parsedData.theadRowStack.length) ? parsedData.theadRowStack.length : o.labeltheadrownum) - 1;
				
				
				// var calcTick = [];
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
						
						
						
						// parsedDataCell.flotDelta = (!o.uniformtick ? (TotalRowValue / nbCells) : (TotalRowValue / nbTotSlots));
						parsedDataCell.flotDelta = (!o.uniformtick ? (TotalRowValue / nbCells) : 1);
						
						
						if (!smallestHorizontalFlotDelta || parsedDataCell.flotDelta < smallestHorizontalFlotDelta){
							smallestHorizontalFlotDelta = parsedDataCell.flotDelta;
						}
						parsedDataCell.flotValue = cumulFlotValue;
						// console.log(parsedDataCell);
						if (headerlevel === UseHeadRow || 
						
							((parsedDataCell.rowpos - 1) < UseHeadRow && UseHeadRow <= ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1)))){
							
							calcTick.push([(!o.uniformtick ? cumulFlotValue : uniformCumul), $(parsedDataCell.elem).text()]);
							/* uniformCumul += parsedDataCell.flotDelta; */
							
							// calcTick.push([(parsedDataCell.flotValue - parsedDataCell.flotDelta), $(parsedDataCell.elem).text()]);
						}
						
						if (headerlevel === (parsedData.theadRowStack.length - 1) || 
						
							((parsedDataCell.rowpos - 1) < (parsedData.theadRowStack.length - 1) && 
							(parsedData.theadRowStack.length - 1) <= ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))) ||
									
							(parsedData.theadRowStack.length - 1) === ((parsedDataCell.rowpos - 1) + (parsedDataCell.height - 1))){
							
							uniformCumul += parsedDataCell.flotDelta;
							
							// calcTick.push([(parsedDataCell.flotValue - parsedDataCell.flotDelta), $(parsedDataCell.elem).text()]);
						}
						
						cumulFlotValue += parsedDataCell.flotDelta;
						
						// console.log(parsedDataCell);
						
						helper2CalcHTick(parsedDataCell, headerlevel);
					}
				}
				// console.log(calcTick);
				return calcTick;
			}

			
			// Parse the table
			if (!$(self).data().tblparser) {
				_pe.fn.parsertable.parse($(self));
			}
			
			var currentTable = self;
			
			var RowDefaultOptions = {
				'default-option': 'type', // Default CSS Options
				"default-namespace": ["wb-charts", "wb-chart", "wb-graph"],
				"type-autocreate": true,
				"color-typeof": "string",
				"color-autocreate": true
			};


			// Retrieve the parsed data
			var parsedData = $(currentTable).data().tblparser;
			
			// Fix the parsed data
			addTblHeaders(parsedData);
			// setTblCells(parsedData);
			
			var horizontalCalcTick,
				verticalCalcTick;
			
			//
			// Calculate the tick for a table where x is horizontal
			//
			horizontalCalcTick = calculateHorisontalTick(parsedData);

			// console.log('Horizontal Tick: done');

			//
			// Reverse the axis for the data table
			//
			verticalCalcTick = calculateVerticalTick(parsedData);
			
			// console.log('TICK Measure :');
			// console.log(horizontalCalcTick);
			// console.log(verticalCalcTick);
			
			calcTick = horizontalCalcTick;
			
			var allSeries = [];
			var isPieChart = false;
			var dataSeries = [],
				valueCumul = 0,
				header,
				rIndex,
				i,
				j,
				figCaptionElem,
				tblCaptionHTML,
				placeHolder,
				tblSrcContainer,
				tblSrcContainerSummary;
			
			if (o.type === "pie") {
				// Use Reverse table axes
				// Create a chart/ place holder, by series
				
				
				var mainFigureElem = $('<figure />').insertAfter(self);
				figCaptionElem = $('<figcaption />');
				
				$(mainFigureElem).append(figCaptionElem);
				tblCaptionHTML = $('caption', self).html();
				var tblCaptionText = $('caption', self).text();
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
							
							
							dataSeries.push(
								[
									valueCumul, 
								// $(parsedData.lstrowgroup[0].row[i].cell[j].col.header[0].elem).text(), 
								
								getCellValue($(dataGroup.col[i].cell[rIndex].elem).text()).cellValue]);
							
							valueCumul += header[header.length - 1].flotDelta;
						
						}
						var tdOptions =  setClassOptions(RowDefaultOptions,				
				($(dataGroup.col[i].cell[rIndex].elem).attr('class') !== undefined ? 
				$(dataGroup.col[i].cell[rIndex].elem).attr('class') : ""));
						
						allSeries.push({ data: dataSeries, label: $(dataGroup.col[i].dataheader[dataGroup.col[i].dataheader.length - 1].elem).text(), color: (!tdOptions.color?colourNameToHex(i):colourNameToHex(tdOptions.color))});
					}

					
					// Create the Canvas
					placeHolder = $('<div />');
					
					// Create a sub Figure or use the main one ?
					var pieChartLabelText = "";
					if (parsedData.lstrowgroup[0].row.length === 1 && 
						($(parsedData.lstrowgroup[0].row[0].header[0].elem).html() === tblCaptionHTML || 
						parsedData.lstrowgroup[0].row[0].header.length === 0)) {
						
						pieChartLabelText = tblCaptionText;
						
						// Use the main Container
						$(mainFigureElem).append(placeHolder);
						
					} else {
					
						// Use a sub container
						var subFigureElem = $('<figure />').appendTo(mainFigureElem);
						var subfigCaptionElem = $('<figcaption />');
						
						header = parsedData.lstrowgroup[0].row[rIndex].header;
						
						pieChartLabelText = $(header[header.length - 1].elem).text();
						
						$(subFigureElem).append(subfigCaptionElem);
						$(subfigCaptionElem).append($(header[header.length - 1].elem).html());
						
						$(subFigureElem).append(placeHolder);
					}
						
					
					// Canvas Size
					$(placeHolder).css('height', o.height);
					$(placeHolder).css('width', o.width);

					
					
					$(placeHolder).attr('role', 'img');
					// Add a aria label to the svg build from the table caption with the following text prepends " Chart. Details in table following."
					$(placeHolder).attr('aria-label', pieChartLabelText + ' ' + _pe.dic.get('%table-following')); // 'Chart. Details in table following.'
					
					// Create the graphic
					$.plot(placeHolder, allSeries, {
						series: {
							pie: {
								show: true
							}
						}
					});
					
					if (!o.legendinline) {
						// Move the legend under the graphic
						$('.legend > div', placeHolder).remove();
						$('.legend > table', placeHolder).removeAttr('style').addClass('font-small');
						$(placeHolder).css('height', 'auto');
					}
					if (o.nolegend) {
						// Remove the legend
						$('.legend', placeHolder).remove();
					}
			
					/*
					chartPlacement(allSeries, {
						series: {
							pie: {
								show: true
							}
						}
					});*/
					
					allSeries = [];

				}
				
				if (!o.noencapsulation) { // eg of use:	wb-charts-noencapsulation-true
					// Use a details/summary to encapsulate the table
					// Add a aria label to the table element, build from his caption prepend the word " Table"
					// For the details summary, use the table caption prefixed with Table.
					tblSrcContainer = $('<details />');
					tblSrcContainerSummary = $('<summary />');
					$(tblSrcContainer).appendTo(mainFigureElem);
					// set the title for the ability to show or hide the table as a data source
					$(tblSrcContainerSummary).text(tblCaptionHTML + _pe.dic.get('%table-mention'))
						.appendTo(tblSrcContainer)
						.after(self);

					_pe.polyfills.enhance('detailssummary', tblSrcContainer);
					
				} else {
					// Move the table inside the figure element
					$(self).appendTo(mainFigureElem);
				}
				
				/*
				ChartPlacement(allSeries, {
						series: {
							pie: {
								show: true
							}
						}); */
				
				return;
			}
			
			
			var nbBarChart = 0;
			var barDelta;
			var rowOptions;
			
			// Count nbBarChart, 
			for (i=0;i<parsedData.lstrowgroup[0].row.length; i++) {
				rowOptions = setClassOptions(RowDefaultOptions,				
				($(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).attr('class') !== undefined ? 
				$(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).attr('class') : ""));
				 
				 
				 
				if ((!rowOptions.type && (o.type === "bar" || o.type === "stacked")) || (rowOptions.type && (rowOptions.type === "bar" || rowOptions.type === "stacked"))) {
					nbBarChart += 1;
					rowOptions.chartBarOption = nbBarChart;
					if (!barDelta && ((rowOptions.type && rowOptions.type === "bar") || (!rowOptions.type && o.type === "bar"))) {
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
							// fyi- smallestVerticalFlotDelta
							
							// Zero Value
							// fyi -  valueCumul - (smallestHorizontalFlotDelta / 2) 
							
							// one section width
							// fyi - smallestHorizontalFlotDelta / nbBarChart
							
							// Position bar
							valuePoint = valueCumul - (smallestHorizontalFlotDelta / 2)  + ((smallestHorizontalFlotDelta / nbBarChart) * (rowOptions.chartBarOption - 1));
							
							/*
							console.log("---- " + nbBarChart + " bars");
							console.log(valueCumul - (smallestHorizontalFlotDelta / 2));
							console.log(rowOptions.chartBarOption);
							console.log(valuePoint);
							*/
						}
						
						dataSeries.push(
							[
								valuePoint, 
							// $(parsedData.lstrowgroup[0].row[i].cell[j].col.header[0].elem).text(), 
							
							getCellValue($(parsedData.lstrowgroup[0].row[i].cell[j].elem).text()).cellValue]);
						
						valueCumul += header[header.length - 1].flotDelta;

						// dataSeries.push([datacolgroupfound, getCellValue($(parsedData.lstrowgroup[0].row[i].cell[j].elem).text()).cellValue]);
						datacolgroupfound ++;
					}
				}
				
				
				
				// Get the graph type
				
				
				
				// console.log(($(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).attr('class') !== undefined ? 
				// $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).attr('class') : ""));
				
				if(!rowOptions.type){
					// console.log('defaultSET');
					rowOptions.type = o.type;
				}
				
				
				// console.log(rowOptions.type);
				
				if (rowOptions.type === "line") {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color))});
				} else if (rowOptions.type === "area") {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color)),
					lines: { show: true, fill: true }
					});
				} else if (rowOptions.type === "bar" || (barDelta && rowOptions.type === "stacked")) {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color)),
					bars: {
						show: true,
						barWidth: (1 / nbBarChart * 0.9),
						align: "center"
					}});
					
					/*
					// Need to tweek flot.js
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: colorsAccent[i],
					lines: { show: true },
					points: { show: true }});
					*/ 
					
				} else if (rowOptions.type === "stacked") {
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color)),
					bars: {
						show: true,
						barWidth: 0.9,
						align: "center"
					}});
				} else if (rowOptions.type === "pie") {
					
					allSeries.push({ data: dataSeries, label: $(parsedData.lstrowgroup[0].row[i].header[parsedData.lstrowgroup[0].row[i].header.length - 1].elem).text(), color: (!rowOptions.color?colourNameToHex(i):colourNameToHex(rowOptions.color))});
					
					isPieChart = true;
				}
				
				
			}
			
			// chartPlacement(allSeries, {xaxis: (calcTick.length > 0 ? {ticks: calcTick} : { })});
			
			
			var figureElem = $('<figure />').insertAfter(self);
			figCaptionElem = $('<figcaption />');
			
			$(figureElem).append(figCaptionElem);
			tblCaptionHTML = $('caption', self).html();
			$(figCaptionElem).append(tblCaptionHTML);
			
			// Create the placeholder
			placeHolder = $('<div />');
			
			$(figureElem).append(placeHolder);
			
			// Canvas Size
			$(placeHolder).css('height', o.height);
			$(placeHolder).css('width', o.width);
			
			
			$(placeHolder).attr('role', 'img');
			// Add a aria label to the svg build from the table caption with the following text prepends " Chart. Details in table following."
			$(placeHolder).attr('aria-label', $('caption', self).text() + ' ' + _pe.dic.get('%table-following')); // 'Chart. Details in table following.'
			
			
			if (!o.noencapsulation) { // eg of use:	wb-charts-noencapsulation-true
				// Use a details/summary to encapsulate the table
				// Add a aria label to the table element, build from his caption prepend the word " Table"
				// For the details summary, use the table caption prefixed with Table.
				tblSrcContainer = $('<details />');
				tblSrcContainerSummary = $('<summary />');
				$(tblSrcContainer).appendTo(figureElem);
				// set the title for the ability to show or hide the table as a data source
				$(tblSrcContainerSummary).text(tblCaptionHTML + _pe.dic.get('%table-mention'))
					.appendTo(tblSrcContainer)
					.after(self);

				_pe.polyfills.enhance('detailssummary', tblSrcContainer);
				
			} else {
				// Move the table inside the figure element
				$(self).appendTo(figureElem);
			}
	
			// Create the graphic
			$.plot(placeHolder, allSeries, {xaxis: (calcTick.length > 0 ? {ticks: calcTick} : { })});
			
			
			if (!o.legendinline) {
				// Move the legend under the graphic
				$('.legend > div', placeHolder).remove();
				$('.legend > table', placeHolder).removeAttr('style').addClass('font-small');
				$(placeHolder).css('height', 'auto');
			}
			if (o.nolegend) {
				// Remove the legend
				$('.legend', placeHolder).remove();
			}
				
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
