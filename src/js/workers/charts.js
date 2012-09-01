/*!
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
*/
/*
* Chart for WET 3.0
*/
/*global jQuery: false, pe:false, wet_boew_charts: false, Raphael: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.charts = {
		type: 'plugin',
		depends: ['raphael'],
		polyfills: ['detailssummary'],
		_exec: function (elm) {
			var options = {},
				o,
				self = $(elm),
				graphStartExecTime = new Date().getTime(), // This variable is used to autogenerate ids for the given tables.
				charts = {},
				parser = {},
				fnNewParser,
				DesignerHeadingLevel,
				GraphTypeTableDefault = '';
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
			function colourNameToHex(colour) {
				var colours = {"aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff", "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887", "cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff", "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f", "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1", "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dodgerblue": "#1e90ff", "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff", "gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f", "honeydew": "#f0fff0", "hotpink": "#ff69b4", "indianred ": "#cd5c5c", "indigo ": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c", "lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2", "lightgrey": "#d3d3d3", "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de", "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6", "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5", "navajowhite": "#ffdead", "navy": "#000080", "oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6", "palegoldenrod": "#eee8aa", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080", "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1", "saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4", "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato":  "#ff6347", "turquoise":  "#40e0d0", "violet":  "#ee82ee", "wheat":  "#f5deb3", "white":  "#ffffff", "whitesmoke":  "#f5f5f5", "yellow": "#ffff00", "yellowgreen": "#9acd32"};
				return (colours[colour.toLowerCase()] !== 'undefined' ? colours[colour.toLowerCase()] : ($.isArray(o.colors) ? o.colors[0] : o.colors));
			}
			/**
			* Chart plugin v2.0.1
			* 
			* @author: Pierre Dubois
			*/
			charts.circleGraph = {
				height: undefined, // Height of the draw area
				width: undefined, // Width of the draw area
				offset: { // with the Offset it's possible to determine the drawing area
					top: undefined,
					right: undefined,
					bottom: undefined,
					left: undefined
				},
				sizeMode: 'minimal', // 'maximal' => would take all the available width space to draw, 'minimal' => Would just reserve the minimal space requirement to draw
				maxWidth: 600,
				minWidth: 150, // That is the minimal width for first level
				strokeWidth: 3, // For each pie quarter
				minLevelWidth: 25, // That is the value of the radius
				levelPadding: 10, // Padding to add between each level
				nbPieByRow: undefined, // Set something to force the number of pie by row
				props: {
					minWidth: 100,
					minLevelWidth: 50
				},
				captionFontSize: 20,
				fontSize: 10,
				piePadding: 10,
				graphPadding: 10,
				// Designer Props
				pieByRow: undefined,
				minPieWidth: undefined,
				// Graphic itself
				graphTitle: undefined,
				legendContainer: undefined,
				paperContainer: undefined,
				paper: undefined,
				paperDOM: undefined,
				// Series Information
				series: {},
				options: {},
				init: function (series, options) {
					// Reset to the default value [That fix an issue for the second Pie chart generated]
					charts.circleGraph.width = undefined;
					charts.circleGraph.minWidth = 150;
					charts.circleGraph.minLevelWidth = 25;
					charts.circleGraph.levelPadding = 10;
					// set the options and series
					charts.circleGraph.series = series;
					charts.circleGraph.options = options;
					charts.circleGraph.width = charts.circleGraph.options.width;
					var pieByRow = 1, // For the time being use 1 pie by Row (in the future try to calculate how many pie can be by row)
						nbExtraLevel = charts.circleGraph.series.nbColLevel - 1,
					// Adapt the sector with based on the available space,
						XtraLevelWidth = (nbExtraLevel * ((charts.circleGraph.minLevelWidth * 2) + (charts.circleGraph.levelPadding * 2)) + (nbExtraLevel * (charts.circleGraph.strokeWidth * 2))),
						centerWidth = charts.circleGraph.minWidth + (charts.circleGraph.levelPadding * 2) + (charts.circleGraph.strokeWidth * 2),
						minWidth = XtraLevelWidth + centerWidth,
						centerRatio,
						XtraLevelRatio;
					charts.circleGraph.pieByRow = pieByRow;
					if (!charts.circleGraph.width || minWidth > charts.circleGraph.width) {
						// Set the minimal width for the graphic
						charts.circleGraph.width = minWidth;
					} else {
						// TODO: Add the choice of strategy of growing [like ExtraLevel only, keep a specific ratio, stop at a maximum grow, ....
						// Adap the sector width proportionally
						centerRatio = charts.circleGraph.minWidth / minWidth;
						XtraLevelRatio = charts.circleGraph.minLevelWidth / minWidth;
						charts.circleGraph.minWidth = Math.floor(centerRatio * (charts.circleGraph.width));
						charts.circleGraph.minLevelWidth = Math.floor(XtraLevelRatio * (charts.circleGraph.width));
					}
					// Calculate the height
					charts.circleGraph.height = charts.circleGraph.width;
					/*
					// Note: Each pie are in a separate Paper
					// console.log(charts.circleGraph);
					if (!charts.circleGraph.height || charts.circleGraph.height < ((charts.circleGraph.width + (charts.circleGraph.levelPadding*2) + charts.circleGraph.options.font.height) * charts.circleGraph.series.series.length) / charts.circleGraph.series.series.length) {
						
						// Set the minimal height
						charts.circleGraph.height = ((charts.circleGraph.width + charts.circleGraph.levelPadding + charts.circleGraph.options.font.height) * charts.circleGraph.series.series.length) / charts.circleGraph.series.series.length + charts.circleGraph.levelPadding;
						
					}
					*/
					//
					// Log the caption for each series
					//
					/*
				charts.circleGraph.minWidth = charts.circleGraph.options.width;
				
				// Get Number of Pie to be written (Each serie are a Pie)
				var NbPie = charts.circleGraph.series.series.length;
				
				
				
				var minPieWidth = (NbPie * charts.circleGraph.props.minWidth) + ((charts.circleGraph.series.nbColLevel - 1) * charts.circleGraph.props.minLevelWidth);
				
				var realMinSize = charts.circleGraph.minWidth + (2* charts.circleGraph.graphPadding);
				
				
				var pieOverPieces = realMinSize % (minPieWidth + (2*charts.circleGraph.graphPadding));
				
				var pieByRow = (charts.circleGraph.minWidth - pieOverPieces) / minPieWidth;
				
				
				// Minimum Width Size: pieByRow * minPieWidth + (2* charts.circleGraph.graphPadding) 
				if (pieByRow === 0) {
					// Force the change of the width for the minimum requirement
					charts.circleGraph.width = minPieWidth + (2* charts.circleGraph.graphPadding); 
				} else {
					// Check what kind of strategy is used, like take full width or keep it as minimal space
					
					if (charts.circleGraph.sizeMode === 'minimal') {
						charts.circleGraph.width = (pieByRow * minPieWidth) + (2* charts.circleGraph.graphPadding);
						charts.circleGraph.height = Math.floor(NbPie / pieByRow * minPieWidth + (2* charts.circleGraph.graphPadding));
					} else if (charts.circleGraph.sizeMode === 'maximal') {
						// TO BE IMPLEMENTED IN THE FUTURE
					} else {
						// TO BE IMPLEMENTED IN THE FUTURE
					}

					
				}
				
				
				charts.circleGraph.pieByRow = pieByRow;
				charts.circleGraph.minPieWidth = minPieWidth;
				
				// console.log('minPieWidth: ' + minPieWidth + ' pieByRow: ' + pieByRow + ' charts.circleGraph.options.width:' + charts.circleGraph.options.width);
				
				*/
				},
				generateGraph: function (paperContainer, paper) {
					charts.circleGraph.paperContainer = paperContainer;
					charts.circleGraph.paper = paper;
					// For each series,
					//	- Get his center position
					//	- For each cell calculate their percentage
					//	- Draw the first level
					var currPosition = 1,
						currRowPos = 1,
						currColPos = 0,
						currRowPos2 = 0,
						legendGenerated = false;
					$.each(charts.circleGraph.series.series, function () {
						var chartsLabels = [],
							lastPathObj, // This represent the last created item in the pie chart, it's used to ordered the text label on mouse over and to do overlap with each pie quarter					
							legendList,
							currentPaper,
							total,
							InvalidSerie,
							cx,
							cy,
							r,
							stroke,
							start,
							angle,
							rad,
							lastEndAngle,
							ms,
							CurrentLevel,
							GroupingSeries = [];
						legendGenerated = false;
						legendList = $('<ul>').appendTo(($.isArray(charts.circleGraph.paperContainer) ?  $(charts.circleGraph.paperContainer[currRowPos - 1]) : charts.circleGraph.paperContainer));
						charts.circleGraph.legendContainer = legendList;
						// var currentPaper = charts.circleGraph.paper[charts.circleGraph.series.series.length - currRowPos];
						currentPaper = ($.isArray(charts.circleGraph.paper) ? charts.circleGraph.paper[currRowPos - 1] : charts.circleGraph.paper);
						currRowPos += 1;
						if (currPosition >= (charts.circleGraph.pieByRow  * (currRowPos + 1))) {
							// currRowPos ++;
							currColPos = 0;
						}
						/*
						// Write the pie label (That is the Series Header)
						var serieTitleX = (charts.circleGraph.width/2) + (charts.circleGraph.width * currColPos);
						var serieTitleY = ((charts.circleGraph.width + charts.circleGraph.levelPadding + charts.circleGraph.options.font.height) * currRowPos2) + (charts.circleGraph.options.font.height/2); // + charts.circleGraph.levelPadding;

						var serieTxt = currentPaper.text(serieTitleX, serieTitleY, this.header.rawValue).attr({fill: '#000', stroke: "none", "font-size": charts.circleGraph.captionFontSize, "text-anchor": "middle"});					
						
						*/
						// Calcule the percent based on their range
						total = 0;
						InvalidSerie = false;
						// Get Top and Bottom Serie value
						$.each(this.cell, function () {
							if (this.value < 0) {
								InvalidSerie = true;
							}
							// Check if the decimal precision was added
							if (charts.circleGraph.options.decimal) {
								this.value = Math.floor(this.value * Math.pow(10, charts.circleGraph.options.decimal));
							}
							total += this.value;
						});
						/*
						if (InvalidSerie) {
							alert('This series are invalid, only positive number are acceptable');
						}
						*/
						cx = (charts.circleGraph.width / 2) + (charts.circleGraph.width * currColPos);
						cy = (charts.circleGraph.width / 2) + (charts.circleGraph.width * currColPos);
						/*
					var cx = (charts.circleGraph.width/2) + (charts.circleGraph.width * currColPos),
						cy = (charts.circleGraph.width/2) + ((charts.circleGraph.width + charts.circleGraph.levelPadding + charts.circleGraph.options.font.height) * currRowPos2);
					*/
						stroke = '#000';
						start = 0;
						angle = 90;// 0,
						rad = Math.PI / 180;
						ms = 500; // animation time
						function getRBottom(level, height) {
							var r1 = (charts.circleGraph.minWidth / 2) + // CenterPie
								charts.circleGraph.strokeWidth + // CenterPie Stroke
								charts.circleGraph.levelPadding + // CenterPie Padding
								(charts.circleGraph.series.nbColLevel - level - height - 1) * // Number of under existing Level
								(charts.circleGraph.levelPadding + (charts.circleGraph.strokeWidth * 2) + charts.circleGraph.minLevelWidth);
							return r1;
						}
						function getRTop(level, height) {
							return (getRBottom(level, height) + charts.circleGraph.minLevelWidth + charts.circleGraph.strokeWidth);
						}
						CurrentLevel = charts.circleGraph.series.nbColLevel;
						// For each cell get the Total value base on SerieRange
						$.each(this.cell, function () {
							// Get the Cell Heading
							var cellColPos = this.colPos,
								currentHeading = '',
								HeadingLevel = CurrentLevel,
								SuperiorHeading = [],
								path = [],
								angleplus,
								startAngle,
								x1,
								y1,
								endAngle,
								x2,
								y2,
								bcolor,
								color,
								percent,
								fillColor,
								PaperPath,
								legendItem,
								legendPaperEle,
								legendPaper,
								legendRect,
								popangle,
								txt,
								txtBorder,
								txtBackGround,
								startColor,
								fillOverColor;
							// Current Heading
							$.each(charts.circleGraph.series.heading, function () {
								// Check if the Heading correspond with the colPos and the rowPos
								if (this.colPos < cellColPos && cellColPos <= (this.colPos + this.width)) {
									// Get the information for the current heading
									if (this.level <= CurrentLevel && CurrentLevel <= (this.level + this.height)) {
										currentHeading = this.header;
										HeadingLevel = this.level;
									} else { // if (this.level < CurrentLevel) {
										// Compute this series
										var serieComputed = {
											level: this.level,
											height: this.height,
											id: this.id,
											header: this.header,
											param: this.param
										};
										SuperiorHeading.push(serieComputed);
									}
								}
							});
							//
							// Determine the Path for the sector
							//
							// Add the center Pos
							path.push("M", cx, cy);
							// Get the pie Angle
							angleplus = 360 * this.value / total;
							// Check if the pie quarter need to be expend in some level
							r = (charts.circleGraph.minWidth / 2);
							if (HeadingLevel < (CurrentLevel - 1)) {
								//charts.circleGraph.levelPadding
								r += ((charts.circleGraph.minLevelWidth + charts.circleGraph.levelPadding + (charts.circleGraph.strokeWidth * 2)) * ((CurrentLevel - 1) - HeadingLevel));
							}
							// Calculate the pos of the first segment
							startAngle = angle;
							x1 = cx + r * Math.cos(-startAngle * rad);
							y1 = cy + r * Math.sin(-startAngle * rad);
							// Draw the line
							path.push("L", x1, y1);
							// Calculate the pos of the second segment
							endAngle = angle + angleplus;
							x2 = cx + r * Math.cos(-endAngle * rad);
							y2 = cy + r * Math.sin(-endAngle * rad);
							lastEndAngle = endAngle;
							// Draw the Curve (Elipsis)
							path.push("A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2);
							// Close the path
							path.push("z");
							$.each(SuperiorHeading, function () {
								// This cell have a supperior heading
								var supHeading = this,
									AddToIt = true,
									r2,
									r1;
								supHeading.still = false; // Just a flag to know if is computed or not
								// Check if can be computed
								$.each(GroupingSeries, function () {
									if (this.id === supHeading.id) {
										// Compute the data, add the new point to the path
										supHeading.still = true;
										this.still = true;
										AddToIt = false;
										return false;
									}
								});
								if (!this.topX1) {
									r2 = getRBottom(this.level, this.height);
									r1 = getRTop(this.level, this.height);
									// Set the starting point
									this.topX1 = cx + r1 * Math.cos(-startAngle * rad);
									this.topY1 = cy + r1 * Math.sin(-startAngle * rad);
									this.bottomX1 = cx + r2 * Math.cos(-startAngle * rad);
									this.bottomY1 = cy + r2 * Math.sin(-startAngle * rad);
									// Add the radius
									this.r1 = r1;
									this.r2 = r2;
									this.startAngle = startAngle;
									this.bcolor = Raphael.hsb(start, 1, 1);
									this.color = Raphael.hsb(start, 0.75, 1);
									this.start = start;
									start += 0.05;
								}
								if (AddToIt) {
									// Add it to the GroupingSeries
									this.still = true;
									GroupingSeries.push(this);
								}
							});
							$.each(GroupingSeries, function () {
								// There are currently existing superior heading
								if (!this.still  && !this.ignoreMe) {
									// Draw this group
									var r2 = getRBottom(this.level, this.height),
										r1 = getRTop(this.level, this.height),
										topX2 = cx + r1 * Math.cos(-startAngle * rad),
										topY2 = cy + r1 * Math.sin(-startAngle * rad),
										bottomX2 = cx + r2 * Math.cos(-startAngle * rad),
										bottomY2 = cy + r2 * Math.sin(-startAngle * rad),
										p = [],
										percent = (startAngle - this.startAngle) / 360 * 100,
										fillColor = "90-" + this.bcolor + "-" + this.color,
										legendItem,
										legendPaperEle,
										legendPaper,
										legendRect,
										PaperPath,
										popangle,
										txt,
										txtBorder,
										txtBackGround,
										startColor,
										fillOverColor;
									p.push("M", this.topX1, this.topY1);
									p.push("A", r1, r1, 0, +(startAngle - this.startAngle > 180), 0, Math.ceil(topX2), Math.ceil(topY2));
									p.push("L", Math.ceil(bottomX2), Math.ceil(bottomY2));
									p.push("A", r2, r2, 0, +(startAngle - this.startAngle > 180), 1, Math.ceil(this.bottomX1), Math.ceil(this.bottomY1));
									p.push("z");
									// Adjust the percent to the precision requested
									if (charts.circleGraph.options.decimal) {
										percent = percent * (Math.pow(10, charts.circleGraph.options.decimal));
									}
									percent = Math.ceil(percent * 1000);
									percent = Math.floor(percent / 1000);
									if (charts.circleGraph.options.decimal) {
										percent = percent / (Math.pow(10, charts.circleGraph.options.decimal));
									}
									if (this.param.color) {
										fillColor = colourNameToHex(this.param.color);
									}
									if (!legendGenerated) {
										legendItem = $('<li></li>').appendTo($(legendList));
										legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
										legendPaper = new Raphael($(legendPaperEle).get(0), charts.circleGraph.options.font.size, charts.circleGraph.options.font.size);
										legendRect = legendPaper.rect(2, 2, charts.circleGraph.options.font.size - (2 * 2) + (2 / 2), charts.circleGraph.options.font.size - (2 * 2) + (2 / 2));
										$(legendItem).append(this.header);
										legendRect.attr("fill", fillColor);
									}
									PaperPath = currentPaper.path(p).attr({fill: fillColor, stroke: stroke, "stroke-width": 3, "title": this.header + ' (' + percent + '%)'});
									// That the following was replaced by the Tooltip functionality
									popangle = ((startAngle - this.startAngle) / 2) + this.startAngle;
									// Old Caption : this.header + ' (' + percent + '%)'
									txt = currentPaper.text(cx + (r1 * Math.cos(-popangle * rad)), cy + (r1 * Math.sin(-popangle * rad)), percent + '%').attr({fill: '#000', stroke: "none", opacity: 1, "font-size": charts.circleGraph.fontSize});
									txtBorder = txt.getBBox();
									txtBackGround = currentPaper.rect(txtBorder.x - 10, txtBorder.y - 10, txtBorder.width + (2 * 10), txtBorder.height + (2 * 10)).attr({fill: '#FFF', stroke: "black", "stroke-width": "1", opacity: 1});
									chartsLabels.push({txt: txt, bg: txtBackGround});
									startColor = this.start;
									fillOverColor = Raphael.hsb(startColor, 1, 0.3);
									if (this.param.overcolor) {
										fillOverColor = colourNameToHex(this.param.overcolor);
									}
									PaperPath.mouseover(function () {
										PaperPath.stop().attr({fill: fillOverColor});
										// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
										txtBackGround.stop().attr({"stroke-width": "3"});
										//PaperPath.stop().animate({opacity: 0.3}, ms, "linear");
										// Move the label on top
										txt.insertAfter(lastPathObj);
										txtBackGround.insertBefore(txt);
										lastPathObj = txt;
									}).mouseout(function () {
										PaperPath.stop().attr({fill: fillColor});
										// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
										txtBackGround.stop().attr({"stroke-width": "1"});
										//PaperPath.stop().animate({opacity: 1}, ms);
									});
									txtBackGround.mouseover(function () {
										PaperPath.stop().attr({fill: fillOverColor});
										// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
										txtBackGround.stop().attr({"stroke-width": "3"});
										// Move the label on top
										txt.insertAfter(lastPathObj);
										txtBackGround.insertBefore(txt);
										lastPathObj = txt;
									}).mouseout(function () {
										PaperPath.stop().attr({fill: fillColor});
										// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
										txtBackGround.stop().attr({"stroke-width": "1"});
									});
									txt.mouseover(function () {
										PaperPath.stop().attr({fill: fillOverColor});
										// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
										txtBackGround.stop().attr({"stroke-width": "3"});
										// Move the label on top
										txt.insertAfter(lastPathObj);
										txtBackGround.insertBefore(txt);
										lastPathObj = txt;
									}).mouseout(function () {
										PaperPath.stop().attr({fill: fillColor});
										// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
										txtBackGround.stop().attr({"stroke-width": "1"});
									});
									this.ignoreMe = true;
								}
								this.still = false;
							});
							// Add the new path
							bcolor = Raphael.hsb(start, 1, 1);
							color = Raphael.hsb(start, 0.75, 1);
							percent = (endAngle - startAngle) / 360 * 100;
							// Adjust the percent to the precision requested
							if (charts.circleGraph.options.decimal) {
								percent = percent * (Math.pow(10, charts.circleGraph.options.decimal));
							}
							percent = Math.ceil(percent * 1000);
							percent = Math.floor(percent / 1000);
							if (charts.circleGraph.options.decimal) {
								percent = percent / (Math.pow(10, charts.circleGraph.options.decimal));
							}
							fillColor = "90-" + bcolor + "-" + color;
							if (this.param.color) {
								fillColor = colourNameToHex(this.param.color);
							}
							// console.log(this);
							// USE this.colPos if defined
							// and get charts.circleGraph.series.ColHeading for the default color, and to build the legend.
							PaperPath = currentPaper.path(path).attr({fill: fillColor, stroke: stroke, "stroke-width": 3, "title": currentHeading + ' (' + percent + '%)'});
							if (!legendGenerated) {
								// Create the legend
								legendItem = $('<li></li>').appendTo($(legendList));
								legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
								legendPaper = new Raphael($(legendPaperEle).get(0), charts.circleGraph.options.font.size, charts.circleGraph.options.font.size);
								legendRect = legendPaper.rect(2, 2, charts.circleGraph.options.font.size - (2 * 2) + (2 / 2), charts.circleGraph.options.font.size - (2 * 2) + (2 / 2));
								$(legendItem).append(currentHeading);
								legendRect.attr("fill", fillColor);
							}
							// var currentHeading = '';
							// var HeadingLevel = CurrentLevel;
							// Replaced by the Tooltip functionality
							popangle = angle + (angleplus / 2);
							// old caption : currentHeading + ' (' + percent + '%)'
							txt = currentPaper.text(cx + (r * Math.cos(-popangle * rad)), cy + (r * Math.sin(-popangle * rad)), percent + '%').attr({fill: '#000', stroke: "none", opacity: 1, "font-size": charts.circleGraph.fontSize});
							txtBorder = txt.getBBox();
							txtBackGround = currentPaper.rect(txtBorder.x - 10, txtBorder.y - 10, txtBorder.width + (2 * 10), txtBorder.height + (2 * 10)).attr({fill: '#FFF', stroke: "black", "stroke-width": "1", opacity: 1});
							chartsLabels.push({txt: txt, bg: txtBackGround});
							startColor = start;
							fillOverColor = Raphael.hsb(startColor, 1, 0.3);
							if (this.param.overcolor) {
								fillOverColor = colourNameToHex(this.param.overcolor);
							}
							PaperPath.mouseover(function () {
								PaperPath.stop().attr({fill: fillOverColor});
								// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
								txtBackGround.stop().attr({"stroke-width": "3"});
								//PaperPath.stop().animate({opacity: 0.3}, ms, "linear");
								// Move the label on top
								txt.insertAfter(lastPathObj);
								txtBackGround.insertBefore(txt);
								lastPathObj = txt;
							}).mouseout(function () {
								PaperPath.stop().attr({fill: fillColor});
								// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
								txtBackGround.stop().attr({"stroke-width": "1"});
								//PaperPath.stop().animate({opacity: 1}, ms);
							});
							txtBackGround.mouseover(function () {
								PaperPath.stop().attr({fill: fillOverColor});
								// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
								txtBackGround.stop().attr({"stroke-width": "3"});
								// Move the label on top
								txt.insertAfter(lastPathObj);
								txtBackGround.insertBefore(txt);
								lastPathObj = txt;
							}).mouseout(function () {
								PaperPath.stop().attr({fill: fillColor});
								// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
								txtBackGround.stop().attr({"stroke-width": "1"});
							});
							txt.mouseover(function () {
								PaperPath.stop().attr({fill: fillOverColor});
								// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
								txtBackGround.stop().attr({"stroke-width": "3"});
								// Move the label on top
								txt.insertAfter(lastPathObj);
								txtBackGround.insertBefore(txt);
								lastPathObj = txt;
							}).mouseout(function () {
								PaperPath.stop().attr({fill: fillColor});
								// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
								txtBackGround.stop().attr({"stroke-width": "1"});
							});
							angle += angleplus;
							start += 0.1;
							currPosition += 1;
							currColPos += 1;
						});
						// Close any pending grouping
						$.each(GroupingSeries, function () {
							// There are currently existing superior heading
							if (!this.ignoreMe) {
								// Draw this group
								var r2 = getRBottom(this.level, this.height),
									r1 = getRTop(this.level, this.height),
									topX2 = cx + r1 * Math.cos(-lastEndAngle * rad),
									topY2 = cy + r1 * Math.sin(-lastEndAngle * rad),
									bottomX2 = cx + r2 * Math.cos(-lastEndAngle * rad),
									bottomY2 = cy + r2 * Math.sin(-lastEndAngle * rad),
									p = [],
									percent,
									fillColor,
									legendRect,
									legendPaper,
									legendPaperEle,
									legendItem,
									PaperPath,
									popangle,
									txt,
									txtBorder,
									txtBackGround,
									startColor,
									fillOverColor;
								p.push("M", this.topX1, this.topY1);
								p.push("A", r1, r1, 0, +(lastEndAngle - this.startAngle > 180), 0, Math.ceil(topX2), Math.ceil(topY2));
								p.push("L", Math.ceil(bottomX2), Math.ceil(bottomY2));
								p.push("A", r2, r2, 0, +(lastEndAngle - this.startAngle > 180), 1, Math.ceil(this.bottomX1), Math.ceil(this.bottomY1));
								p.push("z");
								percent = (lastEndAngle - this.startAngle) / 360 * 100;
								// Adjust the percent to the precision requested
								if (charts.circleGraph.options.decimal) {
									percent = percent * (Math.pow(10, charts.circleGraph.options.decimal));
								}
								percent = Math.ceil(percent * 1000);
								percent = Math.floor(percent / 1000);
								if (charts.circleGraph.options.decimal) {
									percent = percent / (Math.pow(10, charts.circleGraph.options.decimal));
								}
								fillColor = "90-" + this.bcolor + "-" + this.color;
								if (this.param.color) {
									fillColor = colourNameToHex(this.param.color);
								}
								if (!legendGenerated) {
									legendItem = $('<li></li>').appendTo($(legendList));
									legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
									legendPaper = new Raphael($(legendPaperEle).get(0), charts.circleGraph.options.font.size, charts.circleGraph.options.font.size);
									legendRect = legendPaper.rect(2, 2, charts.circleGraph.options.font.size - (2 * 2) + (2 / 2), charts.circleGraph.options.font.size - (2 * 2) + (2 / 2));
									$(legendItem).append(this.header);
									legendRect.attr("fill", fillColor);
								}
								PaperPath = currentPaper.path(p).attr({fill: fillColor, stroke: stroke, "stroke-width": 3, "title": this.header + ' (' + percent + '%)'});
								// Replaced by the tooltip functionality
								popangle = ((lastEndAngle - this.startAngle) / 2) + this.startAngle;
								// old caption: this.header + ' (' + percent + '%)'
								txt = currentPaper.text(cx + (r1 * Math.cos(-popangle * rad)), cy + (r1 * Math.sin(-popangle * rad)), percent + '%').attr({fill: '#000', stroke: "none", opacity: 1, "font-size": charts.circleGraph.fontSize});
								txtBorder = txt.getBBox();
								txtBackGround = currentPaper.rect(txtBorder.x - 10, txtBorder.y - 10, txtBorder.width + (2 * 10), txtBorder.height + (2 * 10)).attr({fill: '#FFF', stroke: "black", "stroke-width": "1", opacity: 1});
								chartsLabels.push({txt: txt, bg: txtBackGround});
								startColor = this.start;
								fillOverColor = Raphael.hsb(startColor, 1, 0.3);
								if (this.param.overcolor) {
									fillOverColor = colourNameToHex(this.param.overcolor);
								}
								PaperPath.mouseover(function () {
									PaperPath.stop().attr({fill: fillOverColor});
									// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
									txtBackGround.stop().attr({"stroke-width": "3"});
									//PaperPath.stop().animate({opacity: 0.3}, ms, "linear");
									// Move the label on top
									txt.insertAfter(lastPathObj);
									txtBackGround.insertBefore(txt);
									lastPathObj = txt;
								}).mouseout(function () {
									PaperPath.stop().attr({fill: fillColor});
									// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
									txtBackGround.stop().attr({"stroke-width": "1"});
									//PaperPath.stop().animate({opacity: 1}, ms);
								});
								txtBackGround.mouseover(function () {
									PaperPath.stop().attr({fill: fillOverColor});
									// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
									txtBackGround.stop().attr({"stroke-width": "3"});
									// Move the label on top
									txt.insertAfter(lastPathObj);
									txtBackGround.insertBefore(txt);
									lastPathObj = txt;
								}).mouseout(function () {
									PaperPath.stop().attr({fill: fillColor});
									// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
									txtBackGround.stop().attr({"stroke-width": "1"});
								});
								txt.mouseover(function () {
									PaperPath.stop().attr({fill: fillOverColor});
									// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, .3)});
									txtBackGround.stop().attr({"stroke-width": "3"});
									// Move the label on top
									txt.insertAfter(lastPathObj);
									txtBackGround.insertBefore(txt);
									lastPathObj = txt;
								}).mouseout(function () {
									PaperPath.stop().attr({fill: fillColor});
									// PaperPath.stop().attr({fill: Raphael.hsb(startColor, 1, 1)});
									txtBackGround.stop().attr({"stroke-width": "1"});
								});
								this.ignoreMe = true;
							}
						});
						// Create a hidden rect to get the lastelement
						lastPathObj = currentPaper.rect(0, 0, 1, 1).attr({opacity: 0});
						$.each(chartsLabels, function () {
							this.txt.insertAfter(lastPathObj);
							this.bg.insertBefore(this.txt);
						});
						// Set the realy last object
						lastPathObj = chartsLabels[chartsLabels.length - 1].txt;
						chartsLabels = [];
						legendGenerated = true;
					});
				}
			};
			/**
			* Chart plugin v2.0.2
			* 
			* @author: Pierre Dubois
			*/
			charts.graph2dAxis = {
				// Drawing Property
				drawDirection: 'x',
				height: undefined, // Height of the draw area
				width: undefined, // Width of the draw area
				offset: { // with the Offset it's possible to determine the drawing area
					top: undefined,
					right: undefined,
					bottom: undefined,
					left: undefined
				},
				cuttingOffset: undefined,
				xAxisOffset: undefined, // Exact Y Position of the x Axis [old: xAxisYPos]
				cuttingPosPaper: undefined, // [old: cutingPosPaper]
				// Informative Property for drawing
				NbColumnHeading: 0, // Number of Heading without any grouping
				NbColumnHeaderLevel: undefined, // Number of Grouping level
				zeroPos: undefined, // Position [in labeling position] of the 0 axes
				cuttingPos: undefined, // Position [in labeling position] of the cutting axes
				incrementation: undefined, // Incrementation step for each labeling position [old: interval]
				nbStep: undefined, //  Number of Incrementation step [TODO: including the 0 axes and the cutting axes if apply]
				// Layout Information
				layout: {
					headingMinSize: undefined,
					nbColHeading: undefined
				},
				// Graphic Value
				top: undefined,
				bottom: undefined,
				// Graphic itself
				graphTitle: undefined,
				legendContainer: undefined,
				paperContainer: undefined,
				paper: undefined,
				paperDOM: undefined,
				// Series Information
				series: {},
				options: {},
				setNbColumnHeading: function () {
					// Adapted for Horizontal Drawing
					charts.graph2dAxis.NbColumnHeading = 0;
					charts.graph2dAxis.NbColumnHeaderLevel = 0;
					var headingSize,
						headingWidth = [];
					// Count the number of unique column
					$.each(charts.graph2dAxis.series.heading, function () {
						if (!this.isGroup && (this.colPos + this.width) > charts.graph2dAxis.series.nbRowLevel) {
							charts.graph2dAxis.NbColumnHeading += 1;
							if (!headingWidth[this.level] || (this.header.length * charts.graph2dAxis.options.font.width) > (headingWidth[this.level] * charts.graph2dAxis.options.font.width)) {
								headingWidth[this.level] = this.header.length * charts.graph2dAxis.options.font.width;
							}
						}
						if (this.level > charts.graph2dAxis.NbColumnHeaderLevel || charts.graph2dAxis.NbColumnHeaderLevel === undefined) {
							charts.graph2dAxis.NbColumnHeaderLevel = this.level;
						}
					});
					charts.graph2dAxis.NbColumnHeaderLevel += 1; // Increment to get the count value;
					// headingSize: would be Top or Bottom Offset depend of client param or Negative/Positive data
					headingSize = (charts.graph2dAxis.options.font.height * charts.graph2dAxis.NbColumnHeaderLevel) + (charts.graph2dAxis.options.axis.top.padding !== null ? charts.graph2dAxis.options.axis.top.padding : charts.graph2dAxis.options.axis.padding);
					charts.graph2dAxis.layout.headingMinSize = headingSize;
				},
				utils: {
					topRound: function (val) {
						if (val >= 0) {
							val = Math.ceil(val);
						} else {
							val = Math.floor(val);
						}
						return val;
					}
				},
				setHeightXLabel: function () {
					// There are no Maximum regarding the height of the graph, just a minimum
					// Top Offset, half size of the Font height
					charts.graph2dAxis.offset.top = (charts.graph2dAxis.options.font.height / 2);
					// Get the available Height for the draw area
					var nbVerticalStep = Math.ceil((charts.graph2dAxis.options.height - charts.graph2dAxis.layout.headingMinSize) / charts.graph2dAxis.options.font.height),
						// Remove the number of step required for drawing the label
						nbNumberVertical = nbVerticalStep - charts.graph2dAxis.NbColumnHeaderLevel;
					// Check if we meet the minimum requirement regarding the height size
					if (nbNumberVertical < charts.graph2dAxis.options.axis.minNbIncrementStep) {
						// Force a minimum height
						nbNumberVertical = charts.graph2dAxis.options.axis.minNbIncrementStep;
						nbVerticalStep = charts.graph2dAxis.options.axis.minNbIncrementStep + charts.graph2dAxis.NbColumnHeaderLevel;
					}
					// Set Nb Of Incrementing Available Step
					charts.graph2dAxis.nbStep = nbNumberVertical;
					// Reset the height of the graphic
					charts.graph2dAxis.options.height = (charts.graph2dAxis.options.font.height * nbVerticalStep);// + charts.graph2dAxis.layout.headingMinSize;
					// Overload the result, now calculated base on nbStep
					// charts.graph2dAxis.options.height = (charts.graph2dAxis.options.font.height * charts.graph2dAxis.nbStep) + charts.graph2dAxis.layout.headingMinSize;
					// console.log('new height:' + charts.graph2dAxis.options.height + ' font.height:' + charts.graph2dAxis.options.font.height + ' headingMinSize:' + charts.graph2dAxis.layout.headingMinSize + ' nbVerticalStep:' + nbVerticalStep);
				},
				setLeftOffset: function () {
					// Calculate the space used for the Y-Label
					if (charts.graph2dAxis.top.toString().length > charts.graph2dAxis.bottom.toString().length) {
						charts.graph2dAxis.offset.left = charts.graph2dAxis.options.font.width * charts.graph2dAxis.top.toString().length;
					} else {
						charts.graph2dAxis.offset.left = charts.graph2dAxis.options.font.width * charts.graph2dAxis.bottom.toString().length;
					}
				},
				setBottomOffset: function () {
					// The Bottom Offset is base on the number of y Incrementation
					charts.graph2dAxis.offset.bottom = charts.graph2dAxis.options.height - (charts.graph2dAxis.nbStep * charts.graph2dAxis.options.font.height);
					if (charts.graph2dAxis.cuttingPos > 0) {
						charts.graph2dAxis.offset.bottom -= (2 * charts.graph2dAxis.options.font.height);
					}
				},
				setMetric: function () {
					var TopValue, // Max Value of the axe
						BottomValue, // Min Value of the axe
						interval, // Incrementation Step Between Max to Min
						zeroPos, // Position into the axes of the 0 Value
						cutingPos = 0,  // If needed, Axe cutting Postion, Before of After the 0 Value, 0 Position = no cut
						idealTopValue,
						range,
						IntervalTop,
						IntervalBottom,
						IntervalWithAxeCut;
					// Set TopValue and BottomValue if defined in the table parameter
					if (charts.graph2dAxis.options.topvalue) {
						if (charts.graph2dAxis.options.topvaluenegative) {
							TopValue = -(charts.graph2dAxis.options.topvalue);
						} else {
							TopValue = charts.graph2dAxis.options.topvalue;
						}
					}
					if (charts.graph2dAxis.options.bottomvalue) {
						if (charts.graph2dAxis.options.bottomvaluenegative) {
							BottomValue = -(charts.graph2dAxis.options.bottomvalue);
						} else {
							BottomValue = charts.graph2dAxis.options.bottomvalue;
						}
					}
					// Get Top and Bottom Serie value
					$.each(charts.graph2dAxis.series.series, function () {
						$.each(this.cell, function () {
							if (TopValue === undefined) {
								TopValue = this.value;
							}
							if (TopValue < this.value) {
								TopValue = this.value;
							}
							if (BottomValue === undefined) {
								BottomValue = this.value;
							}
							if (BottomValue > this.value) {
								BottomValue = this.value;
							}
						});
					});
					// Initial Top and Bottom Value
					if (TopValue > 0) {
						idealTopValue = Math.floor(TopValue);
						TopValue = (TopValue - idealTopValue > 0 ? idealTopValue + 1 : idealTopValue);
						// TopValue = Math.floor(TopValue);
					} else {
						TopValue = Math.ceil(TopValue);
					}
					BottomValue = Math.floor(BottomValue);
					if (TopValue === BottomValue) { // See Issue #4278
						if (TopValue > 0) {
							BottomValue = 0;
						} else if (TopValue < 0) {
							TopValue = 0;
						} else {
							BottomValue = -5;
							TopValue = 5;
						}
					}
					// Get Ìntitial Range and Interval
					range = charts.graph2dAxis.utils.topRound(TopValue - BottomValue);
					interval = charts.graph2dAxis.utils.topRound(range / charts.graph2dAxis.nbStep);
					// TODO, Validate the Precision, currently no decimal are authorized for the interval
					// Set the Zero Position 
					zeroPos = Math.round(charts.graph2dAxis.nbStep * TopValue / range);
					if (zeroPos > charts.graph2dAxis.nbStep) {
						zeroPos = charts.graph2dAxis.nbStep;
					}
					if (zeroPos < 0) {
						zeroPos = 1;
					}
					// Get Best TopValue and BottomValue Interval
					IntervalTop = charts.graph2dAxis.utils.topRound(TopValue / (zeroPos - 1));
					IntervalBottom = Math.abs(charts.graph2dAxis.utils.topRound(BottomValue / (charts.graph2dAxis.nbStep - zeroPos)));
					// Set the Interval
					// Positive and negative Or Positive only table
					if (IntervalTop > interval && (BottomValue >= 0 || (TopValue > 0 && 0 > BottomValue))) {
						interval = IntervalTop;
					}
					// Positive and negative Or Negative only table
					if (IntervalBottom > interval && (TopValue <= 0 || (TopValue > 0 && 0 > BottomValue))) {
						interval = IntervalBottom;
					}
					// Check if we can cut the Axe
					IntervalWithAxeCut = charts.graph2dAxis.utils.topRound(range / (charts.graph2dAxis.nbStep - 2)); // Minus 2 because we don't count the 0 position plus the cutting point
					if (!charts.graph2dAxis.options.nocutaxis) {
						// Positive Table with Small range posibility
						if (IntervalWithAxeCut < IntervalTop && BottomValue > 0) {
							cutingPos = (charts.graph2dAxis.nbStep - 1);
							//
							// Change the NbIncrementStep Variable for charts.graph2dAxis.nbStep
							//
							charts.graph2dAxis.nbStep = charts.graph2dAxis.nbStep - 2; // 2 step are lose for the 0 position and the cut
							interval = IntervalWithAxeCut;
						}
						// Negative Table with Small range posibility
						if (IntervalWithAxeCut < IntervalBottom && TopValue < 0) {
							cutingPos = 2;
							//
							// Change the NbIncrementStep Variable for charts.graph2dAxis.nbStep
							//
							charts.graph2dAxis.nbStep = charts.graph2dAxis.nbStep - 2; // 2 step are lose for the 0 position and the cut
							interval = IntervalWithAxeCut;
						}
					}
					// Overwrite the Interval if requested
					if (charts.graph2dAxis.options.steps) {
						interval = charts.graph2dAxis.options.steps;
					}
					// Set the new Top and Bottom Value with the new interval found
					if (cutingPos === 0) {
						TopValue = charts.graph2dAxis.utils.topRound((zeroPos - 1) * interval);
						BottomValue = Math.floor(TopValue - ((charts.graph2dAxis.nbStep - 1) * interval));
					} else {
						// TopValue = TopValue;
						BottomValue = Math.floor(TopValue - ((charts.graph2dAxis.nbStep - 1) * interval));
					}
					// Set the Object Property
					charts.graph2dAxis.top = TopValue;
					charts.graph2dAxis.bottom = BottomValue;
					charts.graph2dAxis.zeroPos = zeroPos;
					charts.graph2dAxis.cuttingPos = cutingPos;
					charts.graph2dAxis.incrementation = interval;
				},
				init: function (series, options) {
					charts.graph2dAxis.series = series;
					charts.graph2dAxis.options = options;
					// Get Nb of Row Heading [Used to label the x Axis]
					// Get the available remaining space height for the y axis [minimum of 3 step are required]
					// Determine the width of the y axis
					charts.graph2dAxis.setNbColumnHeading();
					if (charts.graph2dAxis.drawDirection === 'x') {
						charts.graph2dAxis.setHeightXLabel();
						charts.graph2dAxis.setMetric();
						// Set the Cutting Pos Offset if needed
						charts.graph2dAxis.cuttingOffset = 0;
						if (charts.graph2dAxis.cuttingPos === (charts.graph2dAxis.nbStep - 1)) {
							charts.graph2dAxis.cuttingOffset = charts.graph2dAxis.options.font.height;
						}
					}
				},
				generateGraph: function (paperContainer, paper) {
					charts.graph2dAxis.paperContainer = paperContainer;
					charts.graph2dAxis.paper = paper;
					if (charts.graph2dAxis.drawDirection === 'x') {
						// Get Top and Bottom Value for the Number of Step
						// Get the Graph Width
						// Set Left Offset
						charts.graph2dAxis.setLeftOffset();
						// Set Bottom Offset
						charts.graph2dAxis.setBottomOffset();
						// Draw x-Axis
						charts.graph2dAxis.xAxis();
						// Draw x-Label
						charts.graph2dAxis.xLabel();
						// Draw y-Axis and y-Label
						charts.graph2dAxis.yAxisLabel();
						// Draw the graph
						charts.graph2dAxis.graph();
					} // else {
					// There are a Maximum and a Minimum regarding the width of the graph, 
					// If is not possible to meet that requirement check if we can reverse the draw of the graphic, if not that graph are invalid
					//}
					/*if (nbCircleGraph > 0) {
					// Prepare the Drawing Zone
					charts.graph2dAxis.paperContainer = $('<div style="margin-top:10px; margin-bottom:10px" \/>').insertAfter(parser.sourceTblSelf);
					// Create the drawing object
					charts.graph2dAxis.paper = Raphael($(charts.graph2dAxis.paperContainer).get(0), charts.graph2dAxis.options.width, charts.graph2dAxis.options.height);
					// Draw the graph
					charts.graph2dAxis.graph();
				}*/
				},
				xAxis: function () {
					// 
					// Draw the x-axis
					//
					//
					// TODO: Developper NOTE:
					//	Here they are a glitch when we draw the x axis, because his lenght is too long regarding the graph generated,
					// 
					charts.graph2dAxis.xAxisOffset = (charts.graph2dAxis.options.font.height * (charts.graph2dAxis.zeroPos - 1) + charts.graph2dAxis.offset.top + charts.graph2dAxis.cuttingOffset);
					/*
				var DrawXaxisTick = true;
				var xAxisTickTop = 4; // Number of Pixel for the line up on the x axis;
				var xAxisTickDown = 4; // Number of Pixel for the line down on the x axis;
				*/
					var xAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.xAxisOffset + ' ',
						maxPos,
						minPos,
						centerPos,
						i,
						_ilen;
					for (i = 1, _ilen = charts.graph2dAxis.NbColumnHeading; i <= _ilen; i += 1) {
						// Valeur Maximale
						maxPos = (i * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading));
						if (charts.graph2dAxis.options.axis.tick || (charts.graph2dAxis.options.axis.top.tick !== null ? charts.graph2dAxis.options.axis.top.tick : false) || (charts.graph2dAxis.options.axis.bottom.tick !== null ? charts.graph2dAxis.options.axis.bottom.tick : false)) {
							// Calculer la position centrale
							minPos = ((i - 1) * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading));
							centerPos = ((maxPos - minPos) / 2) + minPos;
							// Add the Calculated Left Padding
							centerPos += charts.graph2dAxis.offset.left;
							// Ligne Droite
							xAxisPath += 'L ' + centerPos + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
							// Draw the Top Tick
							if (charts.graph2dAxis.options.axis.top.tick !== null ? charts.graph2dAxis.options.axis.top.tick : charts.graph2dAxis.options.axis.tick) {
								xAxisPath += 'L ' + centerPos + ' ' + (charts.graph2dAxis.xAxisOffset - (charts.graph2dAxis.options.axis.top.lenght !== null ? charts.graph2dAxis.options.axis.top.lenght : charts.graph2dAxis.options.axis.lenght))  + ' ';
							}
							// Draw the Bottom Tick
							if (charts.graph2dAxis.options.axis.bottom.tick !== null ? charts.graph2dAxis.options.axis.bottom.tick : charts.graph2dAxis.options.axis.tick) {
								xAxisPath += 'L ' + centerPos + ' ' + (charts.graph2dAxis.xAxisOffset + (charts.graph2dAxis.options.axis.bottom.lenght !== null ? charts.graph2dAxis.options.axis.bottom.lenght : charts.graph2dAxis.options.axis.lenght))  + ' ';
							}
							// Retour a zero
							xAxisPath += 'L ' + centerPos + ' ' + charts.graph2dAxis.xAxisOffset  + ' ';
						}
						// Finir la ligne au MaxPos
						maxPos += charts.graph2dAxis.offset.left;
						xAxisPath += 'L ' + maxPos + ' ' + charts.graph2dAxis.xAxisOffset  + ' ';
						// Write the appropriate label
					}
					try {
						charts.graph2dAxis.paper.path(xAxisPath);
					} catch (ex) {
						// console.log('Error xAxisPath: ' + xAxisPath);
					}
				},
				xLabel: function () {
					//
					// Draw the X Label
					//
					// TODO
					// for (i = 0, _ilen = tBodySeries.nbRowLevel; i < _ilen; i += 1) {
					// Draw a background for each row
					// }
					// For each column Header, calculate his position and add the label
					$.each(charts.graph2dAxis.series.heading, function () {
						// Min Pos + Max Pos
						var xMinPos = this.colPos,
							xMaxPos = (this.colPos + this.width),
							xMinPosPaper,
							xMaxPosPaper,
							xPos,
							textAnchor = 'middle',
							hMin,
							YLabelBg,
							headingText,
							YLabel,
							topPos,
							bottomPos,
							middlePos,
							leftPos,
							width,
							height,
							fillColor,
							fillOverColor;
						if (xMinPos >= charts.graph2dAxis.series.nbRowLevel) {
							// Get the starting x-axis position of the header area
							xMinPos -= charts.graph2dAxis.series.nbRowLevel;
							xMaxPos = xMaxPos - charts.graph2dAxis.series.nbRowLevel;
							xMinPosPaper = Math.floor((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / (charts.graph2dAxis.NbColumnHeading) * xMinPos);
							xMaxPosPaper = Math.floor((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / (charts.graph2dAxis.NbColumnHeading) * xMaxPos);
							// Get the middle position
							xPos = xMinPosPaper;
							xPos = Math.floor((xMaxPosPaper - xMinPosPaper) / 2) + xMinPosPaper;
							// Add the Offset
							xPos += charts.graph2dAxis.offset.left;
							// Calculate the Label position into the Y perpective
							// TODO NOTE: for draw-x use nbColLevel, and for draw-y use nbRowLevel
							hMin = (charts.graph2dAxis.series.nbColLevel - this.height - this.level);
							// var hMax = hMin + (this.height-1);
							// Get the Top and Bottom Position;
							// var topPos = (charts.graph2dAxis.options.height - charts.graph2dAxis.offset.bottom) + (charts.graph2dAxis.options.font.height * hMin);
							topPos = (charts.graph2dAxis.options.height - charts.graph2dAxis.layout.headingMinSize) + (charts.graph2dAxis.options.font.height * hMin);
							bottomPos = topPos + (this.height * charts.graph2dAxis.options.font.height);
							// Get the Middle pos for the label
							middlePos = topPos + ((bottomPos - topPos) / 2);
							// var h = ((charts.graph2dAxis.options.height -30) + ((((hMax-hMin) / 2) + hMin) * charts.graph2dAxis.options.font.height) - charts.graph2dAxis.options.font.height + charts.graph2dAxis.offset.top + charts.graph2dAxis.cuttingOffset + (4 * 2));
							// var h = (charts.graph2dAxis.options.height + ((((hMax-hMin) / 2) + hMin) * charts.graph2dAxis.options.font.height) - charts.graph2dAxis.options.font.height - charts.graph2dAxis.offset.top - charts.graph2dAxis.cuttingOffset - (4 * 2));
							// TopPos => offset.top + 
							leftPos = xMinPosPaper + charts.graph2dAxis.offset.left;
							// var topPos = (charts.graph2dAxis.options.height + (hMin * charts.graph2dAxis.options.font.height) -charts.graph2dAxis.options.font.height + charts.graph2dAxis.offset.top + charts.graph2dAxis.cuttingOffset);
							// var topPos = (charts.graph2dAxis.options.height + (hMin * charts.graph2dAxis.options.font.height) -charts.graph2dAxis.options.font.height - charts.graph2dAxis.offset.top - charts.graph2dAxis.cuttingOffset);
							width = ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / (charts.graph2dAxis.NbColumnHeading)) * (this.width);
							height = bottomPos - topPos;
							// Draw a background
							// var fillColor = '90-#ee7-#ddd'; //'lightgreen';
							fillColor = '50-#F4F4F4-#FFF'; //'lightgreen';
							//var fillOverColor = colourNameToHex('lightblue');
							// var fillOverColor = '90-#ddd-#7ee';
							fillOverColor = '90-#FFF-#F4F4F4';
							if (this.param.fill) {
								fillColor = colourNameToHex(this.param.fill);
							}
							if (this.param.fillover) {
								fillOverColor = colourNameToHex(this.param.fillover);
							}
							YLabelBg = charts.graph2dAxis.paper.rect(leftPos, topPos, width, height);
							YLabelBg.attr('fill', fillColor);
							YLabelBg.attr('stroke-width', '0');
							// var YLabel = paper.text(xPos, h, (this.level === 1 ? this.header.substring(0,1):this.header) ); // Test Only for (2lines-eng) by default use the second commented instruction.
							headingText = this.header;
							// TODO: replace in the headingTest any "<br />" or "<br>" by "\n" (if the SVG context are keeped vs Canvas)
							// TODO: calculate the heading lenght based on the longer line when the heading is breaked in serveral lineHeight
							// TODO: when the heading box size are calculated, do that based on the hightest number of breaked line for a given series
							// Check if the heading text fit in the area
							if ((headingText.length * charts.graph2dAxis.options.font.width) > width) {
								// Set the best width
								headingText = headingText.substring(0, Math.floor(width / charts.graph2dAxis.options.font.width));
							}
							YLabel = charts.graph2dAxis.paper.text(xPos, middlePos, headingText);
							YLabel.attr("text-anchor", textAnchor);
							YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
							YLabel.attr('title', this.header);
							YLabelBg.mouseover(function () {
								YLabelBg.attr('fill', fillOverColor);
							}).mouseout(function () {
								YLabelBg.attr('fill', fillColor);
							});
							YLabel.mouseover(function () {
								YLabelBg.attr('fill', fillOverColor);
							}).mouseout(function () {
								YLabelBg.attr('fill', fillColor);
							});
						}
					});
				},
				yAxisLabel: function () {
					var yAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.offset.top + ' ',
						YLabel,
						i,
						_ilen,
						yAxis;
					charts.graph2dAxis.cuttingPosPaper = 0;
					if (charts.graph2dAxis.top < 0) {
						// Draw the 0 label
						YLabel = charts.graph2dAxis.paper.text(charts.graph2dAxis.offset.left - 4, charts.graph2dAxis.offset.top, 0);
						YLabel.attr("text-anchor", "end");
						YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
						// Draw the 0 axis line
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.offset.top + ' '; // Bas
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 4) + ' ' + charts.graph2dAxis.offset.top + ' '; // Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 2) + ' ' + charts.graph2dAxis.offset.top + ' '; // Gauche
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.offset.top + ' '; // Retour
						// Draw a axis Top cut line
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height / 4)) + ' '; // Bas
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + (charts.graph2dAxis.options.font.height)) + ' '; // Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + (charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height / 2)) + ' '; // Gauche
						charts.graph2dAxis.paper.path(yAxisPath); // axis-end
						// Draw a axis Down cut
						yAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height + (charts.graph2dAxis.options.font.height / 4)) + ' '; // Depart
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height + (charts.graph2dAxis.options.font.height / 2)) + ' '; // Bas Gauche
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height) + ' '; // Haut Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left) + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height + (charts.graph2dAxis.options.font.height / 4)) + ' '; // Retour Centre
						charts.graph2dAxis.cuttingPosPaper = (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height);
						// Adjust the charts.graph2dAxis.offset.top
						charts.graph2dAxis.offset.top += (2 * charts.graph2dAxis.options.font.height);
					}
					for (i = 0, _ilen = charts.graph2dAxis.nbStep; i < _ilen; i += 1) {
						if (charts.graph2dAxis.cuttingPos === 0 || (charts.graph2dAxis.cuttingPos > i && charts.graph2dAxis.bottom > 0) || charts.graph2dAxis.top < 0) {
							// No Cutting currently normal way to do the data
							// y axis label
							YLabel = charts.graph2dAxis.paper.text(charts.graph2dAxis.offset.left - 4, charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height), (charts.graph2dAxis.top - (i * charts.graph2dAxis.incrementation)));
							YLabel.attr("text-anchor", "end");
							YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
							// y axis line
							yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Bas
							yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 4) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Droite
							yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 2) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Gauche
							yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Retour
						}
					}
					if (charts.graph2dAxis.cuttingPos > charts.graph2dAxis.nbStep && charts.graph2dAxis.bottom > 0) {
						// Draw a axis Top cut
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height / 4)) + ' '; // Bas
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height / 2)) + ' '; // Gauche
						charts.graph2dAxis.paper.path(yAxisPath); // axis-end
						// Draw a axis Down cut
						yAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) + (charts.graph2dAxis.options.font.height / 4)) + ' '; // Depart
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) + (charts.graph2dAxis.options.font.height / 2)) + ' '; // Bas Gauche
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Haut Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) + (charts.graph2dAxis.options.font.height / 4)) + ' '; // Retour Centre
						// Draw the 0 label
						YLabel = charts.graph2dAxis.paper.text(charts.graph2dAxis.offset.left - 4, charts.graph2dAxis.offset.top + ((i + 1) * charts.graph2dAxis.options.font.height), 0);
						YLabel.attr("text-anchor", "end");
						YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
						// Draw the 0 y-axis point
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + ((i + 1) * charts.graph2dAxis.options.font.height)) + ' '; // Bas
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 4) + ' ' + (charts.graph2dAxis.offset.top + ((i + 1) * charts.graph2dAxis.options.font.height)) + ' '; // Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 2) + ' ' + (charts.graph2dAxis.offset.top + ((i + 1) * charts.graph2dAxis.options.font.height)) + ' '; // Gauche
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + ((i + 1) * charts.graph2dAxis.options.font.height)) + ' '; // Retour
						charts.graph2dAxis.cuttingPosPaper = (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height));
						charts.graph2dAxis.options.height -= (2 * charts.graph2dAxis.options.font.height); // Remove the 0 level and the cutting point to the drawing graph area
					}
					yAxis = charts.graph2dAxis.paper.path(yAxisPath);
				},
				graph: function () {
					//
					// Calculate the space required for bar and stacked
					//
					var nbGraphBarSpace = 0,
						PreviousGraphType,
						GraphType = 'line', // That is the default
						currGraphTypePos,
						legendList,
						CurrentSerieID;
					$.each(charts.graph2dAxis.series.series, function () {
						GraphType = this.type; // The first row are the default
						if (GraphType === 'bar') { // && (PreviousGraphType !== 'bar' || PreviousGraphType === undefined)) {
							nbGraphBarSpace += 1;
							PreviousGraphType = 'bar';
						}
						if (GraphType === 'stacked'  && (PreviousGraphType !== 'stacked' || PreviousGraphType === undefined)) {
							nbGraphBarSpace += 1;
							PreviousGraphType = 'stacked';
						}
					});
					PreviousGraphType = undefined;
					currGraphTypePos = -1;
					legendList = $('<ul>').appendTo($(charts.graph2dAxis.paperContainer));
					CurrentSerieID = 0;
					charts.graph2dAxis.legendContainer = legendList;
					$.each(charts.graph2dAxis.series.series, function () {
						var currentSerie = this,
							legendItem = $('<li></li>').appendTo($(legendList)),
							legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem)),
							legendPaper = new Raphael($(legendPaperEle).get(0), charts.graph2dAxis.options.font.size, charts.graph2dAxis.options.font.size),
							legendRect = legendPaper.rect(2, 2, charts.graph2dAxis.options.font.size - (2 * 2) + (2 / 2), charts.graph2dAxis.options.font.size - (2 * 2) + (2 / 2)),
							Color,
							StrokeDashArray = "",
							dataCellPos = 0,
							WorkingSpace,
							HeaderText,
							path,
							firstPos,
							lastPos,
							c,
							percentPaddingStart,
							percentPaddingEnd,
							nbSmallSegment,
							EmptyStartWorkingSpace,
							EmptyEndWorkingSpace,
							RealWorkingSpace,
							SegmentWidth,
							StartPos,
							EndPos;
						GraphType = this.type;
						//			StrokeDashArray
						//			[“”, “-”, “.”, “-.”, “-..”, “. ”, “- ”, “--”, “- .”, “--.”, “--..”]
						//			none,
						//			Dash,
						//			Dot,
						//			DashDot,
						//			DashDotDot,
						//			DotSpace,
						//			DashSpace,
						//			DashDash,
						//			DashSpaceDot,
						//			DashDashDot,
						//			DashDashDotDot,
						if (charts.graph2dAxis.options.colors[CurrentSerieID]) {
							Color = charts.graph2dAxis.options.colors[CurrentSerieID];
						} else {
							Color = charts.graph2dAxis.options.colors[0];
						}
						if (currentSerie.param.color) {
							Color = colourNameToHex(currentSerie.param.color);
						}
						if (currentSerie.param.dasharray) {
							StrokeDashArray = currentSerie.param.dasharray.toLowerCase();
							// Do the appropriate find and replace in the string
							StrokeDashArray = StrokeDashArray.replace("space", " ").replace("dash", "-").replace("dot", ".").replace("none", "");
						}
						if (HeaderText === undefined) {
							HeaderText = currentSerie.header.rawValue;
						}
						// For each value calculate the path
						$.each(this.cell, function () {
							var minPos = (dataCellPos * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading)),
								maxPos = ((dataCellPos + 1) * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading)),
								centerPos = ((maxPos - minPos) / 2) + minPos + charts.graph2dAxis.offset.left;
							if (!this.isHeader) {
								this.graphMinPos = minPos;
								this.graphMaxPos = maxPos;
								this.graphCenterPos = centerPos;
								this.graphValue = (((charts.graph2dAxis.top - this.value) * (charts.graph2dAxis.options.font.height * (charts.graph2dAxis.nbStep - 1)) / (charts.graph2dAxis.top - charts.graph2dAxis.bottom)) + charts.graph2dAxis.offset.top);
								if (WorkingSpace === undefined) {
									WorkingSpace = maxPos - minPos;
								}
								dataCellPos += 1;
							}
						});
						$(legendItem).append(HeaderText);
						// Draw the appropriate graph
						if (GraphType === 'line' || GraphType === 'area') {
							// TODO: area graphic
							// - Relay the area zone always to the 0 axis
							// - Consider the cut axis pos if applicable
							// - Consider the GraphValue can be positive and negative in the same series (Always relay the area to the 0 axis)
							$.each(this.cell, function () {
								if (!this.isHeader) {
									if (path === undefined) {
										path = 'M ' + this.graphCenterPos + ' ';
									} else {
										path += 'L ' + this.graphCenterPos + ' ';
									}
									path +=  this.graphValue + ' ';
									if (firstPos === undefined) {
										firstPos = this.graphCenterPos;
									}
									lastPos = this.graphCenterPos;
								}
							});
							if (GraphType === 'area') {
								// Check if an axis cut exist
								if (charts.graph2dAxis.cuttingPosPaper === 0) {
									// Finish the draw
									path += 'L ' + lastPos + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
									path += 'L ' + firstPos + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
									path += 'z';
								} else {
									// Find the cut position and cut the bar
									if (charts.graph2dAxis.top < 0) {
										// Negative Table
										path += ' L ' + lastPos + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height / 2));
										path += ' L ' + firstPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' z';
										c = charts.graph2dAxis.paper.path(path);
										c.attr("stroke", Color);
										c.attr("stroke-dasharray", StrokeDashArray);
										if (GraphType === 'area') {
											c.attr("fill", Color);
											c.attr("fill-opacity", (30 / 100));
										}
										// Second bar
										path = 'M ' + firstPos + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height / 2));
										path += ' L ' + lastPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' L ' + lastPos + ' ' + charts.graph2dAxis.xAxisOffset;
										path += ' L ' + firstPos + ' ' + charts.graph2dAxis.xAxisOffset;
										path += ' z';
									} else {
										// Positive Table
										path += ' L ' + lastPos + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height / 2));
										path += ' L ' + firstPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' z';
										c = charts.graph2dAxis.paper.path(path);
										c.attr("stroke", Color);
										c.attr("stroke-dasharray", StrokeDashArray);
										if (GraphType === 'area') {
											c.attr("fill", Color);
											c.attr("fill-opacity", (30 / 100));
										}
										// Second bar
										path = 'M ' + firstPos + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height / 2));
										path += ' L ' + lastPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' L ' + lastPos + ' ' + charts.graph2dAxis.xAxisOffset;
										path += ' L ' + firstPos + ' ' + charts.graph2dAxis.xAxisOffset;
										path += ' z';
									}
								}
							}
							c = charts.graph2dAxis.paper.path(path);
							c.attr("stroke", Color);
							legendRect.attr("stroke", Color);
							c.attr("stroke-dasharray", StrokeDashArray);
							legendRect.attr("stroke-dasharray", StrokeDashArray);
							if (GraphType === 'area') {
								c.attr("fill", Color);
								legendRect.attr("fill", Color);
								c.attr("fill-opacity", (30 / 100));
								legendRect.attr("fill-opacity", (30 / 100));
							} else {
								legendRect.attr("fill", Color);
							}
						}
						if (GraphType === 'bar' || GraphType === 'stacked') {
							if ((PreviousGraphType !== 'stacked' && GraphType !== 'stacked') || PreviousGraphType !== GraphType) {
								currGraphTypePos += 1;
							}
							PreviousGraphType = GraphType;
							// Calculare the space for the bar
							// 0 Bar space between each bar [That can be set to something else (May be a percentage of the real bar space)]
							// 1/4 bar space at the begin [That can be set to something else (May be a percentage of the real bar space)]
							// 1/4 bar space at the end [That can be set to something else (May be a percentage of the real bar space)]
							// (nbGraphBarSpace * 4) + 1 + 1 = Nombre Total de segment
							// (nbGraphBarSpace * 100) + 25 + 25 = Nombre Total de petit-segment sur une base de 100 pour 1 segment
							percentPaddingStart = 50;
							percentPaddingEnd = 50;
							nbSmallSegment = (nbGraphBarSpace * 100) + percentPaddingStart + percentPaddingEnd; // Ou 25 = EmptyStartWorkingspace et l'autre 25 = empty end working space
							EmptyStartWorkingSpace = (percentPaddingStart * WorkingSpace / nbSmallSegment);
							EmptyEndWorkingSpace = (percentPaddingEnd * WorkingSpace / nbSmallSegment);
							RealWorkingSpace = WorkingSpace - EmptyStartWorkingSpace - EmptyEndWorkingSpace;
							SegmentWidth = RealWorkingSpace / nbGraphBarSpace;
							StartPos = SegmentWidth * currGraphTypePos;
							EndPos = StartPos + SegmentWidth;
							$.each(this.cell, function () {
								if (!this.isHeader) {
									var xTopLeft = this.graphMinPos + StartPos + EmptyStartWorkingSpace + charts.graph2dAxis.offset.left, // That never change
										yTopLeft,
										height,
										width = SegmentWidth,
										path = "",
										bar;
									// Check if the graphValue are below the 0 axis or top of 
									if (charts.graph2dAxis.xAxisOffset >= this.graphValue) {
										// The Point are below the 0 axis
										yTopLeft = this.graphValue;
										height = charts.graph2dAxis.xAxisOffset - this.graphValue;
									} else {
										// The Point are upper the 0 axis
										yTopLeft = charts.graph2dAxis.xAxisOffset;
										height = this.graphValue - charts.graph2dAxis.xAxisOffset;
									}
									// Check if the y-axis is cut, if true cut the bar also
									if (charts.graph2dAxis.cuttingPosPaper === 0) {
										// Draw it the none cut bar
										path = 'M ' + xTopLeft + ' ' + yTopLeft;
										path += ' L ' + (xTopLeft + width) + ' ' + yTopLeft;
										path += ' L ' + (xTopLeft + width) + ' ' + (yTopLeft + height);
										path += ' L ' + xTopLeft + ' ' + (yTopLeft + height);
										path += ' z';
									} else {
										// Find the cut position and cut the bar
										if (charts.graph2dAxis.top < 0) {
											// Negative Table
											path = 'M ' + xTopLeft + ' ' + yTopLeft;
											path += ' L ' + (xTopLeft + width) + ' ' + yTopLeft;
											path += ' L ' + (xTopLeft + width) + ' ' + charts.graph2dAxis.cuttingPosPaper;
											path += ' L ' + xTopLeft + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height / 2));
											path += ' z';
											bar = charts.graph2dAxis.paper.path(path);
											bar.attr("fill", Color);
											if (currentSerie.param.fillopacity) {
												bar.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
											}
											// Second bar
											path = 'M ' + xTopLeft + ' ' + charts.graph2dAxis.cuttingPosPaper;
											path += ' L ' + (xTopLeft + width) + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height / 2));
											path += ' L ' + (xTopLeft + width) + ' ' + (yTopLeft + height);
											path += ' L ' + xTopLeft + ' ' + (yTopLeft + height);
											path += ' z';
										} else {
											// Positive Table
											path = 'M ' + xTopLeft + ' ' + yTopLeft;
											path += ' L ' + (xTopLeft + width) + ' ' + yTopLeft;
											path += ' L ' + (xTopLeft + width) + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height / 2));
											path += ' L ' + xTopLeft + ' ' + charts.graph2dAxis.cuttingPosPaper;
											path += ' z';
											bar = charts.graph2dAxis.paper.path(path);
											bar.attr("fill", Color);
											if (currentSerie.param.fillopacity) {
												bar.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
											}
											// Second bar
											path = 'M ' + xTopLeft + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height / 2));
											path += ' L ' + (xTopLeft + width) + ' ' + charts.graph2dAxis.cuttingPosPaper;
											path += ' L ' + (xTopLeft + width) + ' ' + (yTopLeft + height);
											path += ' L ' + xTopLeft + ' ' + (yTopLeft + height);
											path += ' z';
										}
									}
									bar = charts.graph2dAxis.paper.path(path);
									bar.attr("fill", Color);
									legendRect.attr("fill", Color);
									if (currentSerie.param.fillopacity) {
										bar.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
										legendRect.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
									}
								}
							});
							/*
						if (GraphType === 'bar' && (PreviousGraphType !== 'bar' || PreviousGraphType === undefined)) {
							currGraphTypePos ++;
							PreviousGraphType = 'bar';
						}
						if (GraphType === 'stacked'  && (PreviousGraphType !== 'stacked' || PreviousGraphType === undefined)) {
							currGraphTypePos ++;
							PreviousGraphType = 'stacked';
						}	*/
						}
						CurrentSerieID += 1;
					});
				}
			};
			//
			// Table Parser Object
			//
			parser = {
				sourceTblSelf: undefined,
				param: {}, // TO BE ELIMINATED WITH THE DEFAULT JS OPTIONS
				parse: function () {
					parser.sourceTblSelf = self;
					// Swap the table is requested
					if (parser.param.parsedirection === 'y' || o.parsedirection === 'y') {
						self = parser.swapTable(parser.sourceTblSelf);
					}
					parser.setSeriesHeadingLenght();
					// The following variable is used for auto add ids/headers to the table
					var columnIds = [], // The array lenght must equal of parser.seriesHeadingLenght and each item are ids separated by space
						rowsIds = [];
					// Parse the Table Cell Data and Serie Heading
					$('tbody', self).each(function () {
						var SpannedRow = [],
							Series = {
								headerList: [],
								series: [],
								param: parser.classToJson(this)
							};
						// FOR EACH row get the series
						$('tr', this).each(function () {
							var currentSerieLevel = 0,
								CurrColPosition = 0,
								CurrentGroupingID = 0,
								arrAllCell = $(this).children(),
								cellOrdered = [],
								cellHeadingOrdered = [],
								serieHeaderText = '', // That would contain the current on process serie header
								serieHeader, // JQuery object of the native Header for the current serie
								isRejected = false,
								rejectedRaison = "",
								serie;
							// Check if the first cell was spanned
							$.each(SpannedRow, function () {
								if (this.colpos === CurrColPosition && this.rowspan > 0) {
									// Calculate the width of the spanned row
									var w = Number($(this.ele.obj).attr('colspan') !== undefined ? $(this.ele.obj).attr('colspan') : 1),
										i;
									for (i = 1; i <= w; i += 1) {
										this.ele.colPos = i + CurrColPosition;
										if (this.ele.isHeader) {
											cellHeadingOrdered.push(jQuery.extend(true, {}, this.ele));
										} else {
											cellOrdered.push(jQuery.extend(true, {}, this.ele));
										}
									}
									CurrColPosition += w;
									if ($(this.ele.obj).get(0).nodeName.toLowerCase() === 'th' && parser.seriesHeadingLenght > CurrColPosition) {
										currentSerieLevel += 1; // That would say on witch heading level we are
										if (this.rowspan >= 1) {
											// Change the Grouping ID on the next iteration
											CurrentGroupingID = this.ele.id;
										}
									}
									this.rowspan -= 1;
								}
							});
							// Get the Row heading Width
							$('th, td', this).each(function () {
								parser.cellID += 1;
								var IgnoreCurrentCell = false, // TODO check if wet-graph-ignore class is set, if yes use the cell value data as non numerical data
								// Get the cell Value
									cellValueObj = parser.getCellValue($(this).text()),
									cellInfo = {
										id : parser.cellID,
										isHeader: false,
										rowPos: parser.rowPos,
										rawValue: $(this).text(),
										value: cellValueObj.cellValue,
										unit: cellValueObj.cellUnit,
										obj: $(this),
										param: parser.classToJson(this)
									},
								// Get the dimension for the cell
									w = Number($(this).attr('colspan') !== undefined ? $(this).attr('colspan') : 1),
									RowSpan = ($(this).attr('rowspan') !== undefined ? $(this).attr('rowspan') : 1),
								// Set the header for the cells, if applicable
								// console.log(' width: ' + w  + 'CurrColPosition: ' + CurrColPosition);
								// console.log(typeof(w)  + ' ' + typeof(CurrColPosition));
								// console.log('rowpos:' + parser.rowPos + ' CurrColPosition:' + CurrColPosition );
									cellColHeaders = "",
									i,
									_ilen,
									cellRowHeaders = "",
									header,
									cellId,
									cellPos,
									NbRowToBeSpan,
									tblCellColHeaders;
								for (i = CurrColPosition, _ilen = (CurrColPosition + w); i < _ilen; i += 1) {
									if (columnIds[i] !== undefined) {
										if (cellColHeaders === '') {
											// Normal cell
											cellColHeaders = columnIds[i];
										} else {
											// This is for about colspaned cell
											tblCellColHeaders = parser.removeDuplicateElement(cellColHeaders.split(' ').concat(columnIds[i].split(' ')));
											cellColHeaders  = tblCellColHeaders.join(' ');
										}
									}
								}
								if (rowsIds[parser.rowPos] !== undefined) {
									cellRowHeaders = rowsIds[parser.rowPos];
								}
								// Commented to because this will be moved in a new widget based on the table parser
								// $(this).attr('headers', cellColHeaders + (cellColHeaders !== "" && cellRowHeaders !== ""? ' ': '') + cellRowHeaders);
								// cellUnit will be use as global for the entire row group
								if (this.nodeName.toLowerCase() === 'th') {
									// Mark the current cell as Header 
									cellInfo.isHeader = true;
									// Generate a cell ID if none + add it inside the heading list
									cellId = $(this).attr('id');
									if (cellId === undefined || cellId === '') {
										cellId = 'graphcellid' + graphStartExecTime + 'row' + parser.rowPos + 'col' + CurrColPosition; // Generate a new unique ID
										$(this).attr('id', cellId); // Add the new ID to the table
									}
									// This loop make sur all column have their column set
									for (i = 0; i < RowSpan; i += 1) {
										cellPos = i + parser.rowPos;
										// console.log(cellPos);
										if (rowsIds[cellPos] === undefined) {
											rowsIds[cellPos] = cellId;
										} else {
											rowsIds[cellPos] = rowsIds[cellPos] + ' ' + cellId;
										}
									}
								}
								// Check if is a rowspan, if that row span are an header (th) that mean it a grouping of series
								if (RowSpan > 1) {

									NbRowToBeSpan = RowSpan - 1;
									// Add the row to the list to be spanned
									SpannedRow.push({ele: cellInfo, rowspan: NbRowToBeSpan, colpos: CurrColPosition, groupId : CurrentGroupingID});
									// Check if is a header, if yes this series would be a inner series and that header are a goup header
									if (cellInfo.isHeader && parser.seriesHeadingLenght > CurrColPosition) {
										// This represent a sub row grouping
										currentSerieLevel += 1; // Increment the heading level
										// Mark the current cell as Header 
										cellInfo.isHeader = true;
										header = {
											id : parser.cellID,
											level : currentSerieLevel,
											width : RowSpan,
											height: w,
											header : $(this).text(),
											groupId : CurrentGroupingID,
											isGroup : true,
											rowPos: parser.rowPos,
											param: parser.classToJson(this)
										};
										Series.headerList.push(header);
										CurrentGroupingID = parser.cellID;
									}
								}
								// Add the current Row
								for (i = 1; i <= w; i += 1) {
									cellInfo.colPos = i + CurrColPosition;
									if (cellInfo.isHeader) {
										cellHeadingOrdered.push(jQuery.extend(true, {}, cellInfo));
									} else {
										cellOrdered.push(jQuery.extend(true, {}, cellInfo));
									}
								}
								CurrColPosition += w; // Increment the Current ColPos
								if (parser.seriesHeadingLenght === CurrColPosition) {
									// That should correspond to a th element, if not that is a error
									if (!cellInfo.isHeader) {
										isRejected = true;
										rejectedRaison = 'Serie heading not good, current cell value:' + $(this).text();
									}
									serieHeaderText = $(this).text();
									serieHeader = $(this);
									// Add it to header listing
									header = {
										id: parser.cellID,
										level : currentSerieLevel,
										width : RowSpan,
										height: w,
										header : $(this).text(),
										groupId : CurrentGroupingID,
										isGroup : false,
										rowPos: parser.rowPos,
										param: parser.classToJson(this)
									};
									Series.headerList.push(header);
								}
								// Check for span row
								$.each(SpannedRow, function () {
									if (this.colpos === CurrColPosition && this.rowspan > 0) {
										// Calculate the width of the spanned row
										var w = Number($(this.ele.obj).attr('colspan') !== undefined ? $(this.ele.obj).attr('colspan') : 1),
											CurrCellHeaders,
											tblCellColHeaders;
										for (i = 1; i <= w; i += 1) {
											this.ele.colPos = i + CurrColPosition;
											if (this.ele.isHeader) {
												cellHeadingOrdered.push(jQuery.extend(true, {}, this.ele));
											} else {
												cellOrdered.push(jQuery.extend(true, {}, this.ele));
											}
										}
										CurrColPosition += w;
										// Concat the new row heading as needed
										CurrCellHeaders = ($(this.ele.obj).attr('headers') !== undefined ? $(this.ele.obj).attr('headers') : '');
										tblCellColHeaders = parser.removeDuplicateElement(CurrCellHeaders.split(' ').concat(rowsIds[parser.rowPos].split(' ')));
										$(this.ele.obj).attr('headers', tblCellColHeaders.join(' '));
										this.rowspan -= 1;
									}
								});
							});
							// Create the serie object and add it the current collection
							serie = {
								cell : cellOrdered,
								cellHeading : cellHeadingOrdered,
								header : serieHeaderText,
								headerParam : parser.classToJson(serieHeader),
								level : currentSerieLevel,
								GroupId : CurrentGroupingID,
								rowPos: parser.rowPos,
								isRejected: isRejected,
								rejectedRaison: rejectedRaison
							};
							if ((parser.tBodySeries.nbRowLevel <= currentSerieLevel || parser.tBodySeries.nbRowLevel === undefined) && !isRejected) {
								parser.tBodySeries.nbRowLevel = (currentSerieLevel + 1);
							}
							Series.series.push(serie);
							parser.rowPos += 1;
						});
						parser.tBodySeries.series.push(Series);
						return; // Only one tbody is supported anyway
					});
				},
				seriesHeadingLenght: 0,
				setSeriesHeadingLenght: function () {
					// Calculate once the width for the Series Heading
					$('tbody:first tr:first th', self).each(function () {
						var w = Number($(this).attr('colspan') !== undefined ? $(this).attr('colspan') : 1);
						parser.seriesHeadingLenght += w;
					});
				},
				rowPos: 0,
				cellID: 0,
				removeDuplicateElement: function (arrayName) {
					var newArray = [],
						i, _ilen,
						j, _jlen;
label:
					for (i = 0, _ilen = arrayName.length; i < _ilen; i += 1) {
						for (j = 0, _jlen = newArray.length; j < _jlen; j += 1) {
							if (newArray[j] === arrayName[i]) {
								continue label;
							}
						}
						newArray[newArray.length] = arrayName[i];
					}
					return newArray;
				},
				// Function to switch the series order, like make it as vertical series to horizontal series (see Task #2997)
				swapTable: function () {
					// function swapTable for request #2799, transforming horizontal table to virtical table; 
					// Government of Canada. Contact Qibo or Pierre for algorithm info and bug-fixing; 
					// important table element: id or class, th; 
					var sMatrix = [],
						i = 0,
						_ilen,
						j = 0,
						capVal = "Table caption tag is missing",
						maxRowCol = 10, //basic;
						s = 0,
						t,
						tMatrix = [],
						swappedTable,
						html2,
						headStr,
						arr,
						tr;
					capVal =  $("caption", self).text();
					$('tr ', self).each(function () {
						maxRowCol += 1;
						if (s < 1) {
							$('td,th', $(this)).each(function () {
								if ($(this).attr('colspan') === undefined) {
									$(this).attr('colspan', 1);
								}
								maxRowCol += Number($(this).attr("colspan"));
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
					$('tr ', self).each(function () {
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
							attrCol = Number($(this).attr("colspan"));
							attrRow = Number($(this).attr("rowspan"));
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
							ss1.attr("colspan", attrRow);
							ss1.attr("rowspan", attrCol);
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
					headStr = "<table id=\"swappedGraph\">" + "<caption>" + capVal + " (Horizontal to Virtical)</caption><thead>";
					html2 = html2.replace(/<tbody>/gi, headStr);
					html2 = html2.replace(/<\/tbody>/gi, "</tbody></table>");
					html2 = html2.replace(/\n/g, "");
					html2 = html2.replace(/<tr/gi, "\n<tr");
					arr = html2.split("\n");
					for (i = 0, _ilen = arr.length; i < _ilen; i += 1) {
						tr = arr[i];
						if (tr.match(/<td/i) !== null) {
							arr[i] = '</thead><tbody>' + tr;
							break;
						}
					}
					html2 = arr.join("\n");
					// alert(html2); // see the source 
					$(html2).insertAfter(self).hide(); //visible, for debugging and checking;
					return $(html2);
				}, //end of function; 
				// Compute the series value (see Task #2998)
				compute: function () {
					$.each(parser.tBodySeries.series, function () {
						// This loop is for each tbody section (series group)
						var grpMaxValue,
							grpMinValue,
							nbDataSerieLength; // To know and evaluate the table previously parsed)
						$.each(this.series, function () {
							if (!this.isRejected) {
								// This loop is for each individual serie
								var maxValue,
									minValue,
									nbData = 0;
								$.each(this.cell, function () {
									// This loop is for each cell into the serie, here we will compute the total value for the serie
									if (!this.isHeader) {
										// Evaluate max value
										if (this.value > maxValue || maxValue === undefined) {
											maxValue = this.value;
										}
										if (this.value < minValue || minValue === undefined) {
											minValue = this.value;
										}
										nbData += 1;
									}
								});
								this.maxValue = maxValue;
								this.minValue = minValue;
								this.length = nbData;
								if (nbDataSerieLength === undefined) {
									nbDataSerieLength = nbData;
								}
								if (nbData !== nbDataSerieLength) {
									// That series need to be rejected because the data are not properly structured
									this.isRejected = true;
									this.rejectedRaison = 'The data length need to be equal for all the series';
								}
								// Evaluate max value (for the group)
								if ((maxValue > grpMaxValue || grpMaxValue === undefined) && !this.isRejected) {
									grpMaxValue = maxValue;
								}
								if ((minValue < grpMinValue || grpMinValue === undefined) && !this.isRejected) {
									grpMinValue = minValue;
								}
							}
						});
						//if (grpMaxValue > 0) {
						//	grpMaxValue = grpMaxValue;
						//} else {
						//	grpMaxValue = grpMaxValue;
						//}
						//if (grpMinValue > 0) {
						//	grpMinValue = grpMinValue;
						//} else {
						//	grpMinValue = grpMinValue;
						//}
						this.maxValue = grpMaxValue;
						this.minValue = grpMinValue;
						this.dataLength = nbDataSerieLength;
					});
				},
				getCellValue: function (cellRawValue) {
					//trim spaces in the string; 
					cellRawValue = cellRawValue.replace(/\s\s+/g, " ");
					cellRawValue = cellRawValue.replace(/^\s+|\s+$/g, "");
					// Return the result
					var result = {
						cellUnit:  cellRawValue.match(/[^\+\-\.\, 0-9]+[^\-\+0-9]*/), // Type: Float - Hint: You can use the JS function "parseFloat(string)"
						cellValue: parseFloat(cellRawValue.match(/[\+\-0-9]+[0-9,\. ]*/)) // Type: String
					};
					return result;
				},
				// Function to Convert Class instance to JSON
				classToJson: function (el, namespace) {
					var strClass = "";
					if (typeof (el) === 'string') {
						strClass = el;
					} else {
						strClass = ($(el).attr('class') !== undefined ? $(el).attr('class') : ""); // Get the content of class attribute
					}
					return parser.setClassOptions(jQuery.extend(true, o.optionsClass, o.axis2dgraph), strClass, namespace);
				},
				setClassOptions: function (sourceOptions, strClass, namespace) {
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
				},
				tBodySeries: {
					series: [],
					nbRowLevel: undefined,
					nbColLevel: undefined
				}
			};
			// Set the new class options if defined
			o = parser.setClassOptions(o, ($(self).attr('class') !== undefined ? $(self).attr('class') : ""));
			parser.param = o;
			//
			// Performance Strategy
			//
			// Do the first graphic without stacking
			// Add somewhere in the PE Object that the first graphic is done
			// If the first graphic are done or near to be fully processed, we would stack the other table for 1500 milisecond later
			if (_pe.fn.charts.graphprocessed && !_pe.fn.charts.graphdelayed) {
				// There is alreay a graphic that is ongoing, we would stack this one
				if (!_pe.fn.charts.graphstacked) {
					_pe.fn.charts.graphstacked = [];
				}
				_pe.fn.charts.graphstacked.push(elm);
				// Check if the delay was already set
				if (!_pe.fn.charts.graphdelayedset) {
					_pe.fn.charts.graphdelayedset = true;
					// Fix the delayed processing
					var tick,
						iteration = 0;
					(function ticker() {
						if (iteration > 0) {
							_pe.fn.charts.graphdelayed = true;
						}
						// Clear the timer if all the object is processed
						if (_pe.fn.charts.graphstacked.length === 0) {
							clearTimeout(tick);
							return;
						}
						_pe.fn.charts._exec(_pe.fn.charts.graphstacked.shift());
						iteration += 1;
						var delayedExecTime = 200;
						if (o.execdelay) {
							delayedExecTime = o.execdelay;
						}
						tick = setTimeout(ticker, delayedExecTime);
					})();
					// settimeout(, 1500);
				}
				return;
			}
			_pe.fn.charts.graphprocessed = true;
			//
			// END of Performance Strategy
			//

			//
			// Type of serie and graph in general
			//
			//	wb-graph-type-line : Linear graphic
			//	wb-graph-type-bar : Single Bar Alone
			//	wb-graph-type-stacked : Same as the Bar but if the previous serie are stacked [line or pie are ignored] would be at the same place over it
			//	wb-graph-type-pie : Pie Chart for that serie [The Pie need to have it's own sqare space]

			//
			// Old parser
			//
			parser.parse();
			// 
			// New Parser
			//
			// 1. Parse the table with the new parser
			if (!$(self).data().tblparser) {
				_pe.fn.parsertable._exec($(self));
			}
			// 2. Build the ColHeading
			//$(self).
			fnNewParser = function () {
				// parser.tBodySeries.oldColHeading = jQuery.extend(true, {}, parser.tBodySeries.ColHeading);
				// parser.tBodySeries.ColHeading = [];
				var tblParserData = $(self).data().tblparser,
					currLevel = 0,
					lastId = -1;
				$.each(tblParserData.theadRowStack, function () {
					$.each(this.cell, function () {
						if (this.uid > lastId) {
							lastId = this.uid;
							var colheadingCell = {
								id: this.uid,
								uniqueID: this.uid,
								level: currLevel,
								width: this.width,
								height: this.height,
								header: $(this.elem).text(),
								groupId: 0,
								isGroup: (this.width > 1 ? true : false),
								colPos: this.colpos - 1,
								param: parser.classToJson($(this.elem))
							};
							/*
						// Get the Id is exist, otherwise create a new one if is an header
						var	cellHeaderId = "chartcheidcol" + (this.colpos -1); // Generate a new unique ID

						if (!('id' in this.elem) || this.elem['id'] === "") {
							$(this.elem).attr('id', cellHeaderId); // Add the new ID to the table
						} else {
							cellHeaderId = this.elem['id'];
						}	
						
						colheadingCell.uniqueID = cellHeaderId;
						*/
							if (!parser.tBodySeries.ColHeading) {
								parser.tBodySeries.ColHeading = [];
							}
							parser.tBodySeries.ColHeading.push(colheadingCell);
						}
					});
					currLevel += 1;
				});
				parser.tBodySeries.nbColLevel = tblParserData.theadRowStack.length;
				parser.rowPos = tblParserData.theadRowStack.length - 1;
			};
			fnNewParser();
			// $(self).data().ColHeading = parser.tBodySeries.ColHeading;
			// $(self).data().oldColHeading = parser.tBodySeries.oldColHeading;
			// TODO: Instead of parsing the table, use the new parser and adapt the data found in the old model.
			parser.compute(); // Compute the parsed data	
			// var graphTableParsedTime = new Date().getTime();
			// console.log('Table Parsed exec time ' + graphTableParsedTime);
			// console.log('Elapsed : ' + (graphTableParsedTime - graphStartExecTime));
			//
			// Validate the parameter
			//
			//reset width, height to numbers
			o.width = parseFloat((parser.param.width ? parser.param.width - o.widthPadding : o.width - o.widthPadding));
			o.width = parseFloat(o.width > (o.maxwidth - o.widthPadding) ? o.maxwidth - o.widthPadding : o.width);
			o.height = parseFloat(parser.param.height || o.height);
			// 0 => Nearest of the serie, 1 > series grouping if any
			DesignerHeadingLevel = parser.tBodySeries.nbRowLevel;
			// Get the default Graph Type [Table level]
			if (parser.param.graph) { // Check for table defined param
				GraphTypeTableDefault = parser.param.graph;
			} else if (parser.param.type) { // Overide the default if the type is clearly defined
				GraphTypeTableDefault = parser.param.type;
			} else { // Fall back to the setting
				GraphTypeTableDefault = o.type;
			}
			// console.log(parser);
			// For each tbody (Graphic Zone)
			$.each(parser.tBodySeries.series, function () {
				//
				// Determine Type of Graph, if "2d axis graph" or "Circle Graph"
				//
				var nb2dAxisGraph = 0,
					Series2dAxis = [],
					nbCircleGraph = 0,
					SeriesCircle = [],
					i, _ilen,
				// Get the default Graph Type [Table Level]
					GraphTypeTBody = 'line', // Default of the Param default
					LastHeaderId = -1,
					SeriesCellCumulative = [],
					PreviousGraphType,
					PreviousGraphGroup = '',
					PreviousParam = {},
					PreviousHeading = {},
					SerieCells = [],
					seriesObj,
					fullSerieRejected = true,
					MasterSeriesCell = [],
					Group2dSeriesObj,
					GroupCircleSeriesObj,
					paperContainer,
					paper,
					tableHtmlCaption,
					lstSvgElement = [],
					lstpaperSubContainer,
					// Function to set the accessibility on the svg or vml generated image
					setSvgAccessibility,
					subPaper,
					graphDesc,
					descId,
					captionParsed,
					graphTitle,
					tblSelfDescID,
					tblSrcContainer,
					tblSrcContainerSummary;
				if (parser.param.type) { // Overide the default if the type is clearly defined
					GraphTypeTBody = parser.param.type;
				}
				// Get the default Graph Type [Tbody Level]
				if (this.param.graph) { // Check for table defined param
					GraphTypeTBody = this.param.graph;
				}
				// Check for Series Definied Graph [Row level or Serie level]
				PreviousGraphType = GraphTypeTBody;
				$.each(this.series, function () {
					if (this.cellHeading.length === 0) {
						this.isRejected = true;
					}
					if (!this.isRejected) {
						fullSerieRejected = false;
						var isCumulative = false,
						// Get the param for the appropriate designer heading level
							SerieObj = {},
							MasterSeriesCell = [],
							GraphType = '';
						if (this.cellHeading.length > DesignerHeadingLevel) {
							// This implicate data cumulation for the series grouping
							SerieObj = this.cellHeading[DesignerHeadingLevel];
							if (LastHeaderId === SerieObj.id) {
								SeriesCellCumulative.push(jQuery.extend(true, {}, SerieObj));
							} else {
								// Compile the series
								// Sum of each cell for each series
								$.each(SeriesCellCumulative, function () {
									for (i = 0, _ilen < this.cell.length; i < _ilen; i += 1) {
										if (MasterSeriesCell.length <= i) {
											MasterSeriesCell.push(this.cell[i]);
										} else {
											MasterSeriesCell[i] += this.cell[i];
										}
									}
								});
								// Get the average
								for (i = 0, _ilen = MasterSeriesCell.length; i < _ilen; i += 1) {
									MasterSeriesCell[i] = MasterSeriesCell[i] / SeriesCellCumulative.length;
								}
								if (PreviousGraphGroup === '2daxis') {
									seriesObj = {
										cell: MasterSeriesCell,
										type: PreviousGraphType,
										param: PreviousParam,
										header: PreviousHeading
									};
									Series2dAxis.push(seriesObj);
								} else if (PreviousGraphGroup === 'cicle') {
									seriesObj = {
										cell: MasterSeriesCell,
										type: PreviousGraphType,
										param: PreviousParam,
										header: PreviousHeading
									};
									SeriesCircle.push(seriesObj);
								}
								// SerieCells = MasterSeriesCell;
								// That is the SerieCells for the previous item ????   not the current one :-(
								SeriesCellCumulative = []; // Reset the cumulative system
								SeriesCellCumulative.push(jQuery.extend(true, {}, SerieObj)); // Add the current series
								PreviousParam = SerieObj.param;
							}
						} else {
							// This the lowest serie base on the table
							// console.log(this.cellHeading);
							SerieObj = this.cellHeading[this.cellHeading.length - 1];
							// Add the Previous SeriesCells
							if (PreviousGraphGroup === '2daxis') {
								seriesObj = {
									cell: SerieCells,
									type: PreviousGraphType,
									param: PreviousParam,
									header: PreviousHeading
								};
								Series2dAxis.push(seriesObj);
							} else if (PreviousGraphGroup === 'cicle') {
								seriesObj = {
									cell: SerieCells,
									type: PreviousGraphType,
									param: PreviousParam,
									header: PreviousHeading
								};
								SeriesCircle.push(seriesObj);
							}
							SerieCells = this.cell;
							PreviousParam = SerieObj.param;
						}
						PreviousHeading = SerieObj;
						if (SerieObj.param.type) {
							GraphType = SerieObj.param.type;
						} else {
							GraphType = GraphTypeTBody;
						}
						if (GraphType === 'bar' || GraphType === 'stacked' || GraphType === 'line' || GraphType === 'area') {
							nb2dAxisGraph += 1;
							PreviousGraphGroup = '2daxis';
							PreviousGraphType = GraphType;
						} else if (GraphType === 'pie') {
							nbCircleGraph += 1;
							PreviousGraphGroup = 'cicle';
							PreviousGraphType = GraphType;
						}
						LastHeaderId = SerieObj.id;
					}
				});
				// Sum of each cell for each series
				$.each(SeriesCellCumulative, function () {
					for (i = 0, _ilen = this.cell.length; i < _ilen; i += 1) {
						if (MasterSeriesCell.length <= i) {
							MasterSeriesCell.push(this.cell[i]);
						} else {
							MasterSeriesCell[i] += this.cell[i];
						}
					}
				});
				// Get the average
				for (i = 0, _ilen = MasterSeriesCell.length; i < _ilen; i += 1) {
					MasterSeriesCell[i] = MasterSeriesCell[i] / SeriesCellCumulative.length;
				}
				if (MasterSeriesCell.length !== 0) {
					SerieCells = MasterSeriesCell;
				}
				if (PreviousGraphGroup === '2daxis') {
					seriesObj = {
						cell: SerieCells,
						type: PreviousGraphType,
						param: PreviousParam,
						header: PreviousHeading
					};
					Series2dAxis.push(seriesObj);
				} else if (PreviousGraphGroup === 'cicle') {
					seriesObj = {
						cell: SerieCells,
						type: PreviousGraphType,
						param: PreviousParam,
						header: PreviousHeading
					};
					SeriesCircle.push(seriesObj);
				}
				Group2dSeriesObj = {
					heading: parser.tBodySeries.ColHeading,
					nbRowLevel: parser.tBodySeries.nbRowLevel,
					nbColLevel: parser.tBodySeries.nbColLevel,
					series: Series2dAxis
				};
				GroupCircleSeriesObj = {
					heading: parser.tBodySeries.ColHeading,
					nbRowLevel: parser.tBodySeries.nbRowLevel,
					nbColLevel: parser.tBodySeries.nbColLevel,
					series: SeriesCircle
				};
				if (Group2dSeriesObj.series.length > 0) {
					// console.log(parser);
					// console.log(Group2dSeriesObj);
					// Initiate the Graph zone
					charts.graph2dAxis.init(Group2dSeriesObj, o);
				}
				if (GroupCircleSeriesObj.series.length > 0) {
					// Initiate the Graph Circle zone
					charts.circleGraph.init(GroupCircleSeriesObj, o);
				}
				// Create a container next to the table (Use Section for an HTML5 webpage)
				// TODO: do something if the person have specified the container
				// var paperContainer = (container || $('<div style="margin-top:10px; margin-bottom:10px" \/>').insertAfter(self));
				// var paperContainer = $('<div style="margin-top:10px; margin-bottom:10px" \/>').insertAfter(parser.sourceTblSelf);
				paperContainer = $('<figure />').insertAfter(parser.sourceTblSelf);
				// $(paperContainer).addClass(
				// Set the width of the container
				$(paperContainer).width(o.width + o.widthPadding);
				//
				// Add the container class
				//
				$(paperContainer).addClass(o["default-namespace"]);
				// Set the container class if required, by default the namespace is use as a class
				if (parser.param.graphclass) {
					if ($.isArray(parser.param.graphclass)) {
						for (i = 0, _ilen = parser.param.graphclass.length; i < _ilen; i += 1) {
							$(paperContainer).addClass(parser.param.graphclass[i]);
						}
					} else {
						$(paperContainer).addClass(parser.param.graphclass);
					}
				}
				// console.log(parser.param);
				// Create the drawing object
				tableHtmlCaption = $('caption', parser.sourceTblSelf).html();
				// Function to set the accessibility on the svg or vml generated image
				setSvgAccessibility = function (caption, container) {
					// Get the svg or vml Object
					var drawingObject = $(container).children((Raphael.svg ? 'svg:eq(0)' : 'div:eq(0)'));
					lstSvgElement.push(drawingObject);
					// Add the role="img" to the svg or vml
					$(drawingObject).attr('role', 'img');
					// Add a aria label to the svg build from the table caption with the following text prepends " Chart. Details in table following."
					$(drawingObject).attr('aria-label', (caption ? $(caption).text() + ' ' : '') + _pe.dic.get('%table-following')); // 'Chart. Details in table following.'
				};
				if (GroupCircleSeriesObj.series.length === 1 && GroupCircleSeriesObj.series[0].header.rawValue === tableHtmlCaption) {
					// Use only one container, sub-container are not required
					paper = [];
					lstpaperSubContainer = [];
					lstpaperSubContainer.push(paperContainer);
					subPaper = new Raphael($(paperContainer).get(0), charts.circleGraph.width, charts.circleGraph.height);
					paper.push(subPaper);
					charts.circleGraph.generateGraph(lstpaperSubContainer, paper);
				} else if (GroupCircleSeriesObj.series.length > 0) {
					// For the circle Graph, use Separate Paper for each Series, that would fix a printing issue (graph cutted when printed)
					paper = [];
					lstpaperSubContainer = [];
					$.each(GroupCircleSeriesObj.series, function () {
						// var subContainer = $(paperContainer).append('<div />');
						// Add the caption for the series
						var serieCaption = $('<figcaption />'),
							subContainer = $('<figure />'),
							subPaper;
						// 
						$(serieCaption).append(this.header.rawValue); // Set the caption text
						// var serieCaptionID = 'graphcaption' + paper.length + new Date().getTime(); // Generate a new ID
						// $(serieCaption).attr('id', serieCaptionID); // Add the new ID to the title
						// var subContainer = $('<div />');
						$(paperContainer).append(subContainer);
						lstpaperSubContainer.push(subContainer);
						//
						// Amélioré l'accessibility avec l'images
						//
						// $(subContainer).attr('role', 'img'); // required if is a div element
						//$(subContainer).attr('aria-labelledby', serieCaptionID);
						subPaper = new Raphael($(subContainer).get(0), charts.circleGraph.width, charts.circleGraph.height);
						// Add the caption
						$(serieCaption).prependTo($(subContainer));
						// $(serieCaption).insertBefore($(subPaper));
						//$(paperContainer).append(serieCaption);
						paper.push(subPaper);
						// charts.circleGraph.generateGraph(subContainer, subPaper);
						setSvgAccessibility(this.header.obj, subContainer);
					});
					charts.circleGraph.generateGraph(lstpaperSubContainer, paper);
					// charts.circleGraph.generateGraph(paperContainer, paper);
				}
				if (Group2dSeriesObj.series.length > 0) {
					paper = new Raphael($(paperContainer).get(0), o.width, o.height);
					charts.graph2dAxis.generateGraph(paperContainer, paper);
					// Use the viewBox to set the zoom function
					// paper.setViewBox(0,0,4000,o.height,true);
				}
				//
				// Add the Graph Title and Make it Accessible
				//
				// Get the VML or SVG tag and/or object
				if (!fullSerieRejected) {
					// var paperDOM = $(paperContainer).children();
					// Create the Graph Caption
					// Transpose any inner element
					// $(graphTitle).append(tableHtmlCaption);
					// Set the Graph Title
					// $(paperContainer).prepend(graphTitle);
					// Set the Chart Accessibility
					// See: http://lists.w3.org/Archives/Public/w3c-wai-ig/2012JulSep/0176.html
					tblSelfDescID = $(self).attr('aria-describedby');
					// Create the Chart Caption and Description if provided
					captionParsed = $('caption', self).data().tblparser;
					if (captionParsed.caption) {
						graphTitle = $('<figcaption />');
						$(paperContainer).prepend(graphTitle);
						// Add the caption
						if ($(captionParsed.caption).get(0).nodeType !== 3) {
							if ($(captionParsed.caption).get(0).nodeName.toLowerCase() === 'caption') {
								// Get the inner HTML
								$(graphTitle).append($(captionParsed.caption).html());
							} else {
								// Take that element 
								$(graphTitle).append($(captionParsed.caption).clone());
							}
						} else {
							// Just grab the text and wrap it with a strong element
							$(graphTitle).append($('<strong></strong>').append($(captionParsed.caption).text()));
						}
						// Add the description if any
						// If the a description are provided inside the table, use the same description for the graphic
						if (captionParsed.description) {
							graphDesc = captionParsed.description;
							// If the description are build from more than one element we wrap it in a div
							if (graphDesc.length > 1) {
								graphDesc = $(graphDesc).wrapAll('<div></div>').parent();
							}
							descId = $(graphDesc).attr('id');
							if (descId === undefined || descId === '') {
								descId = 'graphsourcedesc' + new Date().getTime(); // Generate a new ID
								$(graphDesc).attr('id', descId); // Add the new ID to the description container
							}
							$(graphTitle).append(graphDesc);
							// Set the aria-describedby attribute if required on the table, no overwrite
							if (tblSelfDescID === undefined || tblSelfDescID === '') {
								$(self).attr('aria-describedby', descId);
							}
						}
					}
					setSvgAccessibility(captionParsed.caption, paperContainer);
					// Set the description to the image if any on the table
					if (descId) {
						$.each(lstSvgElement, function () {
							$(this).attr('aria-describedby', descId);
						});
					}
					if ($(self).attr('aria-label') === undefined || $(self).attr('aria-label') === '') {
						$(self).attr('aria-label', (captionParsed.caption ? $(captionParsed.caption).text() + ' ' : '') + _pe.dic.get('%table-mention')); // Table
					}
					// Add a aria-label to the table
					if (!parser.param.noencapsulation) { // eg of use:  wb-charts-noencapsulation-true
						// Use a details/summary to encapsulate the table
						// Add a aria label to the table element, build from his caption prepend the word " Table"
						// For the details summary, use the table caption prefixed with Table.
						tblSrcContainer = $('<details />');
						tblSrcContainerSummary = $('<summary />');
						$(tblSrcContainer).appendTo(paperContainer);
						// set the title for the ability to show or hide the table as a data source
						$(tblSrcContainerSummary).text((captionParsed.caption ? $(captionParsed.caption).text() + ' ' : '') + _pe.dic.get('%table-mention'))
							.appendTo(tblSrcContainer)
							.after(self);

						if ($('html').hasClass('polyfill-detailssummary')) {
							$(tblSrcContainer).details();
						}
						
					} else {
						// Move the table inside the figure element
						$(self).appendTo(paperContainer);
					}
				} else {
					// Destroy the paper container
					$(paperContainer).remove();
				}
			});
			// var graphTableENDTime = new Date().getTime(); 
			// console.log('Table Graphed END exec time ' + graphTableENDTime);
			// console.log('Elapsed : ' + (graphTableENDTime - graphTableParsedTime));
			// designer.init();
			// $(self).data().tBodySeries = parser.tBodySeries;
			// console.log(parser);
			// The graphic are draw, hide if requested the source table
			/*if (parser.param.hide) {
		parser.sourceTblSelf.hide();
	}*/
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
