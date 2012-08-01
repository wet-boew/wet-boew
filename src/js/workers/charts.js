/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Chart  functionality WET
 */
/*global jQuery: false*/
(function ($) {
    var _pe = window.pe || {
        fn: {}
    }; /* local reference */
    _pe.fn.charts = {
        type: 'plugin',
        depends: ['raphael'],
        _exec: function (elm) {
            
            
            
	function colourNameToHex(colour)
		{
			var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff","beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887","cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff","darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f","darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1","darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff","firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff","gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f","honeydew":"#f0fff0","hotpink":"#ff69b4","indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c","lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2","lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de","lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6","magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee","mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5","navajowhite":"#ffdead","navy":"#000080","oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6","palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1","saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4","tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0","violet":"#ee82ee","wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5","yellow":"#ffff00","yellowgreen":"#9acd32"};

			return (typeof colours[colour.toLowerCase()] != 'undefined' ? colours[colour.toLowerCase()] : ($.isArray(o.colors)? o.colors[0]: o.colors));
		}

	// return $(this).each(function(){
		// Requirement : Each cell need an appropriate col header and row header (one of the header [col|row] need to be unique to the serie)

		// console.log(options);

		options = {}; //TODO: Change this for the pe setting
		
		//configuration
		var o = $.extend({
			
			
			"default-namespace": "wb-charts",
			
			"graphclass-autocreate": true, // This add the ability to set custom css class to the figure container.
			"graphclass-overwrite-array-mode": true,
			"graphclass-typeof": "string",
			
			"noenhancement-autocreate": true,

			
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
				
				// "wb-graph-topvalue"-[Number]
				// wb-graph-topvaluenegative-[true | false]
				// wb-graph-bottomvalue-[Number]
				// wb-graph-bottomvaluenegative-[true | false]
			
			
			// This is to set a decimal precision for the pie chart
			"decimal-autocreate": true,
			"decimal-typeof": "number",
			
			
			/*
			general: {
				type: 'line', // line, bar, stacked, pie
				width: $(this).width(), // This will be re-adjusted to the best fit as a lower value
				height: $(this).height(), // This will be re-adjusted to the best fit as a lower value
				maxWidth: 598, // Will overwrite the 'width' value if the width are larger
				parseDirection: 'x', // 'x' | 'y' => That is the way to inteprete the table serie if is vertical or horizontal
				foregroundColor: 'black', // Color used to draw the label and line (HTML color name or hexa Color value like #000000 				
				hide: false // Indicate if the Table need to be hidden
			},*/
			
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
			type: 'bar', // TODO: Can be one of or an array of: area, pie, line, bar, stacked
			"type-autocreate": true,
			
			"endcaption-autocreate": true,
			"endcaption-typeof": "boolean",
			
			// Generate Graph ID automatic
			// TODO: Enable this feature behaviour
			generateids: true, // This will ovewrite any headers attribute set
			"generateids-typeof": "boolean",
			
			
			optionsClass: {
				'default-option': 'type', // Default CSS Options
				"type-autocreate": true,
				"color-autocreate": true,
				"overcolor-autocreate": true,
				"default-namespace": "wb-graph",
				"dasharray-autocreate": true,
				"noenhancement-autocreate": true,
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
			maxwidth: '590',// '590',
			// "maxwidth-typeof": "locked", //Remove the lock, that will allow zomming feature in the canvas to fit it in the webpage
			"maxwidth-typeof": "number", 
			
			widthPadding: 2, // That is to fix the svg positioning offset (left: -0.5px; top: -0.56665px)
			
			//
			// Colors
			//
			colors: ['#be1e2d','#666699','#92d5ea','#ee8310','#8d10ee','#5a3b16','#26a4ed','#f45a90','#e9e744'], // Serie colors set
			textColors: [], //corresponds with colors array. null/undefined items will fall back to CSS
			
			//
			// Data Table and Graph Orientation
			//
			parseDirection: 'x', // which direction to parse the table data
			drawDirection: 'x', // TODO NEW v2.0 - which direction are the dependant axis
			
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
			



			// // //
			// Not longer supported Options
			// // //
			// For acessibility and comprehension, a caption is always required
			// appendTitle: true, // table caption text is added to chart
			// title: null, // grabs from table caption if null
			// // //
			// Because the Key (header) of the serie are invisible the key (legend) is always added
			// appendKey: true, //color key is added to chart
			// // //
			// In a future version that would be replaced by th class attribute to specify the column and/or row are descriptive only
			// rowFilter: ' ',
			// colFilter: ' ',
			// // //
			// Replaced by font.height
			// yLabelInterval: 30 //distance between y labels
			// // //
		},options);

		if (typeof wet_boew_charts !== 'undefined' && wet_boew_charts !== null) {
			o = $.extend(true, o, wet_boew_charts);
		} 
		
		
		
		var self = $(elm);
		
		var graphStartExecTime = new Date().getTime(); // This variable is used to autogenerate ids for the given tables.
		
		//
		// Performance Strategy
		//
		
		// Do the first graphic without stacking
		// Add somewhere in the PE Object that the first graphic is done
		// If the first graphic are done or near to be fully processed, we would stack the other table for 1500 milisecond later
		
		if(_pe.fn.charts.graphprocessed && !_pe.fn.charts.graphdelayed){
			// There is alreay a graphic that is ongoing, we would stack this one
		
			if(!_pe.fn.charts.graphstacked)_pe.fn.charts.graphstacked = [];
			_pe.fn.charts.graphstacked.push(elm);
			
			
			// Check if the delay was already set
			if(!_pe.fn.charts.graphdelayedset){
				
				_pe.fn.charts.graphdelayedset = true;
				
				// Fix the delayed processing
				var tick;
				var iteration = 0;
				(function ticker() {
					if(iteration > 0){
						_pe.fn.charts.graphdelayed = true;
					}
					
					// Clear the timer if all the object is processed
					if(_pe.fn.charts.graphstacked.length == 0){
						clearTimeout(tick);
						return;
					}
					
					_pe.fn.charts._exec(_pe.fn.charts.graphstacked.shift());
					
					iteration ++;
					tick = setTimeout(ticker, 200);
					
                })();
				
				// settimeout(, 1500);
			}
			
			return;
		}
		_pe.fn.charts.graphprocessed = true;
		
		
		// console.log('graph start exec time ' + graphStartExecTime);
		
		var charts = {};
		
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
			fontSize:10,
			
		
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
			series:{},
			options: {},
			
			// Legend Info
			legendContainer: undefined,

			
			init: function(series, options){
				
				charts.circleGraph.width = undefined; // Reset to the default value [That fix an issue for the second Pie chart generated]
				charts.circleGraph.minWidth = 150; // Reset to the default value [That fix an issue for the second Pie chart generated]
				charts.circleGraph.minLevelWidth = 25; // Reset to the default value [That fix an issue for the second Pie chart generated]
				charts.circleGraph.levelPadding = 10; // Reset to the default value [That fix an issue for the second Pie chart generated]
				
				
				charts.circleGraph.series = series;
				charts.circleGraph.options = options;
				charts.circleGraph.width = charts.circleGraph.options.width;
				
				
				var pieByRow = 1; // For the time being use 1 pie by Row (in the future try to calculate how many pie can be by row)
				charts.circleGraph.pieByRow = pieByRow;
				
				var nbExtraLevel = charts.circleGraph.series.nbColLevel-1;
				
				// Adapt the sector with based on the available space,
				
				var XtraLevelWidth = (nbExtraLevel * ((charts.circleGraph.minLevelWidth*2) + (charts.circleGraph.levelPadding * 2)) + (nbExtraLevel * (charts.circleGraph.strokeWidth * 2)));
				var centerWidth = charts.circleGraph.minWidth + (charts.circleGraph.levelPadding*2) + (charts.circleGraph.strokeWidth *2);
				
				var minWidth = XtraLevelWidth + centerWidth;
				
				// console.log('charts.circleGraph.width:' + charts.circleGraph.width + ' minWidth:' + minWidth + ' XtraLevelWidth:' + XtraLevelWidth + ' centerWidth:' + centerWidth);

				
				if(!charts.circleGraph.width || minWidth > charts.circleGraph.width){
					// Set the minimal width for the graphic
					charts.circleGraph.width = minWidth;
				} else {
					// TODO: Add the choice of strategy of growing [like ExtraLevel only, keep a specific ratio, stop at a maximum grow, ....
					
					// Adap the sector width proportionally

					var centerRatio = charts.circleGraph.minWidth / minWidth;
					var XtraLevelRatio = charts.circleGraph.minLevelWidth / minWidth;
					
					charts.circleGraph.minWidth = Math.floor(centerRatio * (charts.circleGraph.width));
					charts.circleGraph.minLevelWidth = Math.floor(XtraLevelRatio * (charts.circleGraph.width));
					
					
				}
				
				// Calculate the height
				charts.circleGraph.height = charts.circleGraph.width;
				/*
				// Note: Each pie are in a separate Paper
				// console.log(charts.circleGraph);
				if(!charts.circleGraph.height || charts.circleGraph.height < ((charts.circleGraph.width + (charts.circleGraph.levelPadding*2) + charts.circleGraph.options.font.height) * charts.circleGraph.series.series.length) / charts.circleGraph.series.series.length){
					
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
				if(pieByRow == 0){
					// Force the change of the width for the minimum requirement
					charts.circleGraph.width = minPieWidth + (2* charts.circleGraph.graphPadding); 
				} else {
					// Check what kind of strategy is used, like take full width or keep it as minimal space
					
					if(charts.circleGraph.sizeMode == 'minimal'){
						charts.circleGraph.width = (pieByRow * minPieWidth) + (2* charts.circleGraph.graphPadding);
						charts.circleGraph.height = Math.floor(NbPie / pieByRow * minPieWidth + (2* charts.circleGraph.graphPadding));
					} else if(charts.circleGraph.sizeMode == 'maximal'){
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
			
			generateGraph: function(paperContainer, paper){
				
				charts.circleGraph.paperContainer = paperContainer;
				charts.circleGraph.paper = paper;
				
				
				
				
				
				
				
				// For each series,
				//	- Get his center position
				//	- For each cell calculate their percentage
				//	- Draw the first level
				
				var currPosition = 1;
				var currRowPos = 1;
				var currColPos = 0;
				var currRowPos2 = 0;
				// console.log(charts.circleGraph.series);
				
				
				
				
				var legendGenerated = false;
				
				
				
				
				$.each(charts.circleGraph.series.series, function(){

					var chartsLabels = []; 
					var lastPathObj; // This represent the last created item in the pie chart, it's used to ordered the text label on mouse over and to do overlap with each pie quarter					
					
					legendGenerated = false;
					
					var legendList = $('<ul>').appendTo(($.isArray(charts.circleGraph.paperContainer) ?  $(charts.circleGraph.paperContainer[currRowPos -1]) : charts.circleGraph.paperContainer));
				
					charts.circleGraph.legendContainer = legendList;

					// var currentPaper = charts.circleGraph.paper[charts.circleGraph.series.series.length - currRowPos];
					var currentPaper = ($.isArray(charts.circleGraph.paper) ? charts.circleGraph.paper[currRowPos -1] : charts.circleGraph.paper);
					
					currRowPos ++;
					if(currPosition >= (charts.circleGraph.pieByRow  * (currRowPos + 1))){
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
					var total = 0;
					
					var InvalidSerie = false;
					
					// Get Top and Bottom Serie value
					$.each(this.cell, function(){
						if(this.value < 0){
							InvalidSerie = true;
						}
						
						// Check if the decimal precision was added
						if(charts.circleGraph.options.decimal){
							this.value = Math.floor(this.value * Math.pow(10, charts.circleGraph.options.decimal)); 
						}
						
						total += this.value;
						
					});
					
					if(InvalidSerie){
						alert('This series are invalid, only positive number are acceptable');
					}
					
					var cx = (charts.circleGraph.width/2) + (charts.circleGraph.width * currColPos),
						cy = (charts.circleGraph.width/2) + (charts.circleGraph.width * currColPos);

					/*
					var cx = (charts.circleGraph.width/2) + (charts.circleGraph.width * currColPos),
						cy = (charts.circleGraph.width/2) + ((charts.circleGraph.width + charts.circleGraph.levelPadding + charts.circleGraph.options.font.height) * currRowPos2);
					*/
					
					// console.log('cx:' + cx + ' cy:' + cy);
						
					var	r = undefined,
						stroke = '#000';
					
					var start = 0,
						angle = 90,// 0,
						rad = Math.PI / 180,
						lastEndAngle = undefined,
						ms = 500; // animation time
					
			
					function getRBottom(level, height){
						var r1 = (charts.circleGraph.minWidth/2) + // CenterPie
								charts.circleGraph.strokeWidth + // CenterPie Stroke
								charts.circleGraph.levelPadding + // CenterPie Padding
								(charts.circleGraph.series.nbColLevel - level - height -1 ) // Number of under existing Level
								* (charts.circleGraph.levelPadding + (charts.circleGraph.strokeWidth * 2) + charts.circleGraph.minLevelWidth) ;
						return r1;
					}
					
					function getRTop(level, height){
						return (getRBottom(level, height) + charts.circleGraph.minLevelWidth + charts.circleGraph.strokeWidth);
					}
					
					
					var CurrentLevel = charts.circleGraph.series.nbColLevel;
					
					var GroupingSeries = [];
										
					// For each cell get the Total value base on SerieRange
					$.each(this.cell, function(){
						
						// Get the Cell Heading
						var cellColPos = this.colPos;
						
						var currentHeading = '';
						var HeadingLevel = CurrentLevel;
						
						var SuperiorHeading = []; // List containing the appropriate Path for the supperior existing heading
						
						// Current Heading
						$.each(charts.circleGraph.series.heading, function(){
							
							// Check if the Heading correspond with the colPos and the rowPos
							if(this.colPos < cellColPos && cellColPos <= (this.colPos + this.width)) {
								
								// Get the information for the current heading
								if(this.level <= CurrentLevel && CurrentLevel <= (this.level + this.height)){
									currentHeading = this.header;
									HeadingLevel = this.level;
								} else { // if(this.level < CurrentLevel) {
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
						
						var path = [];
						// Add the center Pos
						path.push("M", cx, cy);
						
						// Get the pie Angle
						var angleplus = 360 * this.value/total;
						
						// Check if the pie quarter need to be expend in some level
						r = (charts.circleGraph.minWidth/2);
						
						if(HeadingLevel < (CurrentLevel - 1)){
							//charts.circleGraph.levelPadding
							r += ((charts.circleGraph.minLevelWidth + charts.circleGraph.levelPadding + (charts.circleGraph.strokeWidth * 2)) * 
								((CurrentLevel-1)-HeadingLevel));
						}
						
						// Calculate the pos of the first segment
						var startAngle = angle,
							x1 = cx + r * Math.cos(-startAngle * rad),
							y1 = cy + r * Math.sin(-startAngle * rad);
						
						// Draw the line
						path.push("L", x1, y1);
						
						// Calculate the pos of the second segment
						var endAngle = angle + angleplus,
							x2 = cx + r * Math.cos(-endAngle * rad),
							y2 = cy + r * Math.sin(-endAngle * rad);
						
						lastEndAngle = endAngle;
						
						// Draw the Curve (Elipsis)
						path.push("A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2);
						
						// Close the path
						path.push("z");
						
						
						$.each(SuperiorHeading, function(){
							// This cell have a supperior heading
							var supHeading = this;
							supHeading.still = false; // Just a flag to know if is computed or not
							
							var AddToIt = true;
							// Check if can be computed
							$.each(GroupingSeries, function(){
								
								if(this.id == supHeading.id){
									// Compute the data, add the new point to the path
									
									supHeading.still = true;
									this.still = true;
									AddToIt = false;
									
									return false;
								}
								
								
							});
							

								
							if(!this.topX1){
							
								var r2 = getRBottom(this.level, this.height),
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
								
								this.color = Raphael.hsb(start, .75, 1);
								this.start = start;
								start += .05;
								
							}
							
							if(AddToIt){
								// Add it to the GroupingSeries
								this.still = true;
								GroupingSeries.push(this);
							}

						});
						
						$.each(GroupingSeries, function(){
							// There are currently existing superior heading
							
							
							// console.log(this.endAngle);
							
							if(!this.still  && !this.ignoreMe){
								// console.log(this);
								// Draw this group
								var r2 = getRBottom(this.level, this.height),
									r1 = getRTop(this.level, this.height);

								var topX2 = cx + r1 * Math.cos(-startAngle * rad);
								var topY2 = cy + r1 * Math.sin(-startAngle * rad);
								
								var bottomX2 = cx + r2 * Math.cos(-startAngle * rad);
								var bottomY2 = cy + r2 * Math.sin(-startAngle * rad);
								
								// console.log('Start r: ' + this.r1 + ', ' + this.r2 + '  End r:' + r1 + ', ' + r2 + ' Header:'  + this.header);
								
								var p = [];
								p.push("M", this.topX1, this.topY1);
								
								p.push("A", r1, r1, 0, +(startAngle - this.startAngle > 180), 0, Math.ceil(topX2), Math.ceil(topY2));
								
								p.push("L", Math.ceil(bottomX2), Math.ceil(bottomY2));
								
								p.push("A", r2, r2, 0, +(startAngle - this.startAngle > 180), 1, Math.ceil(this.bottomX1), Math.ceil(this.bottomY1));
								
								p.push("z");
								// console.log('p:' + p);
								var percent = (startAngle - this.startAngle) / 360 * 100;
								// Adjust the percent to the precision requested
								if(charts.circleGraph.options.decimal){
									percent = percent * (Math.pow(10, charts.circleGraph.options.decimal));
								} 
									
								percent = Math.ceil(percent * 1000);
								percent = Math.floor(percent/1000);
								
								if(charts.circleGraph.options.decimal){
									percent = percent / (Math.pow(10, charts.circleGraph.options.decimal));
								}
								
								var fillColor = "90-" + this.bcolor + "-" + this.color;
								if(this.param.color){
									fillColor = colourNameToHex(this.param.color);
								}

								if(!legendGenerated){
									var legendItem = $('<li></li>').appendTo($(legendList));
									var legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
									var legendPaper = Raphael($(legendPaperEle).get(0), charts.circleGraph.options.font.size, charts.circleGraph.options.font.size);
									var legendRect = legendPaper.rect(2,2, charts.circleGraph.options.font.size - (2*2) + (2/2), charts.circleGraph.options.font.size - (2*2) + (2/2));
									
									$(legendItem).append(this.header);
									legendRect.attr("fill", fillColor);
								}
								
								var PaperPath = currentPaper.path(p).attr({fill: fillColor, stroke: stroke, "stroke-width": 3, "title": this.header + ' (' + percent + '%)'});
								
								
								
								// That the following was replaced by the Tooltip functionality
								var popangle = ((startAngle - this.startAngle)/2) + this.startAngle;

								// Old Caption : this.header + ' (' + percent + '%)'
								var txt = currentPaper.text(cx + (r1 * Math.cos(-popangle * rad)), cy + (r1 * Math.sin(-popangle * rad)), percent + '%').attr({fill: '#000', stroke: "none", opacity: 1, "font-size": charts.circleGraph.fontSize});
								
								var txtBorder = txt.getBBox();
								
								var txtBackGround = currentPaper.rect(txtBorder.x - 10, txtBorder.y - 10, txtBorder.width+ (2*10), txtBorder.height + (2*10)).attr({fill: '#FFF', stroke: "black", "stroke-width": "1", opacity: 1});
								
								chartsLabels.push({txt: txt, bg: txtBackGround});
								
								var startColor = this.start;
								var fillOverColor = Raphael.hsb(startColor, 1, .3);
								if(this.param.overcolor){
									fillOverColor = colourNameToHex(this.param.overcolor);
								}
									

								PaperPath.mouseover(function(){
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
								txtBackGround.mouseover(function(){
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
								txt.mouseover(function(){
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
						var bcolor = Raphael.hsb(start, 1, 1),
							color = Raphael.hsb(start, .75, 1);
						var percent = (endAngle - startAngle) / 360 * 100;
						
						// Adjust the percent to the precision requested
						if(charts.circleGraph.options.decimal){
							percent = percent * (Math.pow(10, charts.circleGraph.options.decimal));
						} 
							
						percent = Math.ceil(percent * 1000);
						percent = Math.floor(percent/1000);
						
						if(charts.circleGraph.options.decimal){
							percent = percent / (Math.pow(10, charts.circleGraph.options.decimal));
						}
						
						

						
						
						var fillColor = "90-" + bcolor + "-" + color;
						if(this.param.color){
							fillColor = colourNameToHex(this.param.color);
						}
						// console.log(this);
						
						// USE this.colPos if defined
						// and get charts.circleGraph.series.ColHeading for the default color, and to build the legend.
						
						
						var PaperPath = currentPaper.path(path).attr({fill: fillColor, stroke: stroke, "stroke-width": 3, "title": currentHeading + ' (' + percent + '%)'});
						
						if(!legendGenerated){
							// Create the legend
							var legendItem = $('<li></li>').appendTo($(legendList));
							var legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
							var legendPaper = Raphael($(legendPaperEle).get(0), charts.circleGraph.options.font.size, charts.circleGraph.options.font.size);
							var legendRect = legendPaper.rect(2,2, charts.circleGraph.options.font.size - (2*2) + (2/2), charts.circleGraph.options.font.size - (2*2) + (2/2));
							
							$(legendItem).append(currentHeading);
							legendRect.attr("fill", fillColor);
						}
						// var currentHeading = '';
						// var HeadingLevel = CurrentLevel;
						
						
						
						// Replaced by the Tooltip functionality
						
						var popangle = angle + (angleplus/2);
						// old caption : currentHeading + ' (' + percent + '%)'
						var txt = currentPaper.text(cx + (r * Math.cos(-popangle * rad)), cy + (r * Math.sin(-popangle * rad)), percent + '%').attr({fill: '#000', stroke: "none", opacity: 1, "font-size": charts.circleGraph.fontSize});
						
						var txtBorder = txt.getBBox();
						
						var txtBackGround = currentPaper.rect(txtBorder.x - 10, txtBorder.y - 10, txtBorder.width+ (2*10), txtBorder.height + (2*10)).attr({fill: '#FFF', stroke: "black", "stroke-width": "1", opacity: 1});
						
						chartsLabels.push({txt: txt, bg: txtBackGround});
						
						var startColor = start;
						var fillOverColor = Raphael.hsb(startColor, 1, .3);
						if(this.param.overcolor){
							fillOverColor = colourNameToHex(this.param.overcolor);
						}
						PaperPath.mouseover(function(){
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
						txtBackGround.mouseover(function(){
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
						txt.mouseover(function(){
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
						start += .1;
						
						currPosition++;
						currColPos ++;
					});
					
					// Close any pending grouping
					$.each(GroupingSeries, function(){
						// There are currently existing superior heading
						
						
						// console.log(this.endAngle);
						
						if(!this.ignoreMe){
							// Draw this group
							var r2 = getRBottom(this.level, this.height),
								r1 = getRTop(this.level, this.height);

							
							var topX2 = cx + r1 * Math.cos(-lastEndAngle * rad);
							var topY2 = cy + r1 * Math.sin(-lastEndAngle * rad);
							
							var bottomX2 = cx + r2 * Math.cos(-lastEndAngle * rad);
							var bottomY2 = cy + r2 * Math.sin(-lastEndAngle * rad);
							
							var p = [];
							p.push("M", this.topX1, this.topY1);
							
							p.push("A", r1, r1, 0, +(lastEndAngle - this.startAngle > 180), 0, Math.ceil(topX2), Math.ceil(topY2));
							
							p.push("L", Math.ceil(bottomX2), Math.ceil(bottomY2));
							
							p.push("A", r2, r2, 0, +(lastEndAngle - this.startAngle > 180), 1, Math.ceil(this.bottomX1), Math.ceil(this.bottomY1));
							
							p.push("z");
							var percent = (lastEndAngle - this.startAngle) / 360 * 100;
							// Adjust the percent to the precision requested
							if(charts.circleGraph.options.decimal){
								percent = percent * (Math.pow(10, charts.circleGraph.options.decimal));
							} 
								
							percent = Math.ceil(percent * 1000);
							percent = Math.floor(percent/1000);
							
							if(charts.circleGraph.options.decimal){
								percent = percent / (Math.pow(10, charts.circleGraph.options.decimal));
							}
							
							var fillColor = "90-" + this.bcolor + "-" + this.color;
							if(this.param.color){
								fillColor = colourNameToHex(this.param.color);
							}
							
							if(!legendGenerated){
								var legendItem = $('<li></li>').appendTo($(legendList));
								var legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
								var legendPaper = Raphael($(legendPaperEle).get(0), charts.circleGraph.options.font.size, charts.circleGraph.options.font.size);
								var legendRect = legendPaper.rect(2,2, charts.circleGraph.options.font.size - (2*2) + (2/2), charts.circleGraph.options.font.size - (2*2) + (2/2));
								
								$(legendItem).append(this.header);
								legendRect.attr("fill", fillColor);
							}
							
							var PaperPath = currentPaper.path(p).attr({fill: fillColor, stroke: stroke, "stroke-width": 3, "title": this.header + ' (' + percent + '%)'});
							
							
							
							// Replaced by the tooltip functionality
							var popangle = ((lastEndAngle - this.startAngle)/2) + this.startAngle;
							
								
							// old caption: this.header + ' (' + percent + '%)'
							var txt = currentPaper.text(cx + (r1 * Math.cos(-popangle * rad)), cy + (r1 * Math.sin(-popangle * rad)), percent + '%').attr({fill: '#000', stroke: "none", opacity: 1, "font-size": charts.circleGraph.fontSize});
							
							var txtBorder = txt.getBBox();
							
							var txtBackGround = currentPaper.rect(txtBorder.x - 10, txtBorder.y - 10, txtBorder.width+ (2*10), txtBorder.height + (2*10)).attr({fill: '#FFF', stroke: "black", "stroke-width": "1", opacity: 1});
							
							chartsLabels.push({txt: txt, bg: txtBackGround});
							
							var startColor = this.start;
							var fillOverColor = Raphael.hsb(startColor, 1, .3);
							if(this.param.overcolor){
								fillOverColor = colourNameToHex(this.param.overcolor);
							}
							PaperPath.mouseover(function(){
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
							txtBackGround.mouseover(function(){
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
							txt.mouseover(function(){
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
					
					$.each(chartsLabels, function(){
						this.txt.insertAfter(lastPathObj);
						this.bg.insertBefore(this.txt);
						
					});
					
					// Set the realy last object
					lastPathObj = chartsLabels[chartsLabels.length -1].txt;
					
					chartsLabels = [];
					
					
					legendGenerated = true;
					
				});	

				
			}
		};
		
		
		
/**
 * Chart plugin v2.0.2 a;pha
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
			top:undefined,
			bottom:undefined,
			
			
			// Graphic itself
			graphTitle: undefined,
			legendContainer: undefined,
			paperContainer: undefined,
			paper: undefined,
			paperDOM: undefined,
			
			
			// Series Information
			series:{},
			options: {},

			setNbColumnHeading: function(){
				
				// Adapted for Horizontal Drawing
				
				charts.graph2dAxis.NbColumnHeading = 0;
				charts.graph2dAxis.NbColumnHeaderLevel = 0;
				
				var headingSize = undefined;
				var headingWidth = [];
				
				
				// Count the number of unique column
				$.each(charts.graph2dAxis.series.heading, function(){
					if(!this.isGroup && (this.colPos + this.width) > charts.graph2dAxis.series.nbRowLevel){
						charts.graph2dAxis.NbColumnHeading ++;
						if(!headingWidth[this.level] || (this.header.length * charts.graph2dAxis.options.font.width) > (headingWidth[this.level] * charts.graph2dAxis.options.font.width)){
							headingWidth[this.level] = this.header.length * charts.graph2dAxis.options.font.width;
						}
					}
					if(this.level > charts.graph2dAxis.NbColumnHeaderLevel || charts.graph2dAxis.NbColumnHeaderLevel == undefined){
						charts.graph2dAxis.NbColumnHeaderLevel = this.level;
					}
				});
				charts.graph2dAxis.NbColumnHeaderLevel ++; // Increment to get the count value;

				// headingSize: would be Top or Bottom Offset depend of client param or Negative/Positive data
				headingSize = (charts.graph2dAxis.options.font.height * charts.graph2dAxis.NbColumnHeaderLevel) + (charts.graph2dAxis.options.axis.top.padding != null ? charts.graph2dAxis.options.axis.top.padding : charts.graph2dAxis.options.axis.padding);
				
				charts.graph2dAxis.layout.headingMinSize = headingSize;
				
			},
			
			utils: {
				topRound: function(val){
					if(val >= 0){
						return Math.ceil(val);
					} else {
						return Math.floor(val);
					}
				}

				
			},
			
				
			setHeightXLabel: function(){
					// There are no Maximum regarding the height of the graph, just a minimum
					
					// Top Offset, half size of the Font height
					charts.graph2dAxis.offset.top = (charts.graph2dAxis.options.font.height / 2);
					
					// Get the available Height for the draw area
					var nbVerticalStep = Math.ceil((charts.graph2dAxis.options.height-charts.graph2dAxis.layout.headingMinSize) / charts.graph2dAxis.options.font.height);
					
					// Remove the number of step required for drawing the label
					var nbNumberVertical = nbVerticalStep - charts.graph2dAxis.NbColumnHeaderLevel;
					
					// Check if we meet the minimum requirement regarding the height size
					if(nbNumberVertical < charts.graph2dAxis.options.axis.minNbIncrementStep){
						// Force a minimum height
						nbNumberVertical = charts.graph2dAxis.options.axis.minNbIncrementStep;
						nbVerticalStep = charts.graph2dAxis.options.axis.minNbIncrementStep + charts.graph2dAxis.NbColumnHeaderLevel;
						
					}
					
					// console.log('nbNumberVertical:' + nbNumberVertical + ' charts.graph2dAxis.options.font.height:' + charts.graph2dAxis.options.font.height);
					
		
		
					// Set Nb Of Incrementing Available Step
					charts.graph2dAxis.nbStep = nbNumberVertical;

					
					// Reset the height of the graphic
					charts.graph2dAxis.options.height = (charts.graph2dAxis.options.font.height * nbVerticalStep);// + charts.graph2dAxis.layout.headingMinSize;

					// Overload the result, now calculated base on nbStep
					// charts.graph2dAxis.options.height = (charts.graph2dAxis.options.font.height * charts.graph2dAxis.nbStep) + charts.graph2dAxis.layout.headingMinSize;



					// console.log('new height:' + charts.graph2dAxis.options.height + ' font.height:' + charts.graph2dAxis.options.font.height + ' headingMinSize:' + charts.graph2dAxis.layout.headingMinSize + ' nbVerticalStep:' + nbVerticalStep);
					

			},
			setLeftOffset: function(){
				// Calculate the space used for the Y-Label
				if(charts.graph2dAxis.top.toString().length > charts.graph2dAxis.bottom.toString().length){
					charts.graph2dAxis.offset.left = charts.graph2dAxis.options.font.width * charts.graph2dAxis.top.toString().length;
				} else {
					charts.graph2dAxis.offset.left = charts.graph2dAxis.options.font.width * charts.graph2dAxis.bottom.toString().length;
				}
			},
			setBottomOffset: function(){
				// The Bottom Offset is base on the number of y Incrementation
				
				
				charts.graph2dAxis.offset.bottom = charts.graph2dAxis.options.height - (charts.graph2dAxis.nbStep * charts.graph2dAxis.options.font.height);
				
				if(charts.graph2dAxis.cuttingPos > 0){
					charts.graph2dAxis.offset.bottom -= (2*charts.graph2dAxis.options.font.height);
				}
				
			},
			
			
			setMetric: function(){
			
				
				
			
				var TopValue = undefined; // Max Value of the axe
				var BottomValue = undefined; // Min Value of the axe
				var interval = undefined; // Incrementation Step Between Max to Min
				var zeroPos = undefined; // Position into the axes of the 0 Value
				var cutingPos = 0; // If needed, Axe cutting Postion, Before of After the 0 Value, 0 Position = no cut
				
				
				//alert( charts.graph2dAxis.series.series[0].param.topvalue);
				
								
				// Set TopValue and BottomValue if defined in the table parameter
				if(charts.graph2dAxis.options.topvalue){
					if(charts.graph2dAxis.options.topvaluenegative){
						TopValue = - (charts.graph2dAxis.options.topvalue);
					} else {
						TopValue = charts.graph2dAxis.options.topvalue;
					}
				}
				if(charts.graph2dAxis.options.bottomvalue){
					if(charts.graph2dAxis.options.bottomvaluenegative){
						BottomValue = - (charts.graph2dAxis.options.bottomvalue);
					} else {
						BottomValue = charts.graph2dAxis.options.bottomvalue;
					}
				}
				
				
				// Get Top and Bottom Serie value
				$.each(charts.graph2dAxis.series.series, function(){
					$.each(this.cell, function(){
						if(TopValue == undefined){
							TopValue = this.value;
						}
						if(TopValue < this.value){
							TopValue = this.value;
						}
						if(BottomValue == undefined){
							BottomValue = this.value;
						}
						if(BottomValue > this.value){
							BottomValue = this.value;
						}
						
						
					});
				});
				
				// console.log('TopValue:' + TopValue + ' BottomValue:' + BottomValue);

				// Initial Top and Bottom Value
				if(TopValue > 0){
					var idealTopValue = Math.floor(TopValue);
					TopValue = (TopValue - idealTopValue > 0 ? idealTopValue+1: idealTopValue);
					// TopValue = Math.floor(TopValue);
				} else {
					TopValue = Math.ceil(TopValue);
				}
				BottomValue = Math.floor(BottomValue);
				
				if(TopValue == BottomValue){ // See Issue #4278
					if(TopValue > 0){
						BottomValue = 0;
					} else if(TopValue < 0){
						TopValue = 0;
					} else {
						BottomValue = -5;
						TopValue = 5;
					}
				}
				
				// console.log('TopValue:' + TopValue + ' BottomValue:' + BottomValue);
				

				// Get Ìntitial Range and Interval
				var range = charts.graph2dAxis.utils.topRound(TopValue - BottomValue);
				interval = charts.graph2dAxis.utils.topRound(range/ charts.graph2dAxis.nbStep);
				// TODO, Validate the Precision, currently no decimal are authorized for the interval
				
				
				
				
				
				
				// Set the Zero Position 
				zeroPos = Math.round(charts.graph2dAxis.nbStep * TopValue / range);
				if(zeroPos > charts.graph2dAxis.nbStep){
					zeroPos = charts.graph2dAxis.nbStep;
				}
				if(zeroPos < 0){
					zeroPos = 1;
				}
				
				
				
				// Get Best TopValue and BottomValue Interval
				var IntervalTop = charts.graph2dAxis.utils.topRound(TopValue/(zeroPos - 1));
				var IntervalBottom = Math.abs(charts.graph2dAxis.utils.topRound(BottomValue/(charts.graph2dAxis.nbStep-zeroPos)));
				// Set the Interval
				// Positive and negative Or Positive only table
				if(IntervalTop > interval && (BottomValue >= 0 || (TopValue > 0 && 0 > BottomValue))){
					interval = IntervalTop;
				}
				// Positive and negative Or Negative only table
				if(IntervalBottom > interval && (TopValue <= 0 || (TopValue > 0 && 0 > BottomValue))){
					interval = IntervalBottom;
				}
				
				
				
				// Check if we can cut the Axe
				var IntervalWithAxeCut = charts.graph2dAxis.utils.topRound(range/(charts.graph2dAxis.nbStep - 2)); // Minus 2 because we don't count the 0 position plus the cutting point
				
				
				if(! charts.graph2dAxis.options.nocutaxis) {
				
					// Positive Table with Small range posibility
					if(IntervalWithAxeCut < IntervalTop && BottomValue > 0){
						cutingPos = (charts.graph2dAxis.nbStep - 1);
						//
						// Change the NbIncrementStep Variable for charts.graph2dAxis.nbStep
						//
						charts.graph2dAxis.nbStep = charts.graph2dAxis.nbStep - 2; // 2 step are lose for the 0 position and the cut
						interval = IntervalWithAxeCut;
					}
					// Negative Table with Small range posibility
					if(IntervalWithAxeCut < IntervalBottom && TopValue < 0){
						cutingPos = 2;
						//
						// Change the NbIncrementStep Variable for charts.graph2dAxis.nbStep
						//
						charts.graph2dAxis.nbStep = charts.graph2dAxis.nbStep - 2; // 2 step are lose for the 0 position and the cut
						interval = IntervalWithAxeCut;
					}
				
				}
				
				
				// Overwrite the Interval if requested
				if(charts.graph2dAxis.options.steps) {
					interval = charts.graph2dAxis.options.steps;
				}
				
				// Set the new Top and Bottom Value with the new interval found
				if(cutingPos == 0){
					TopValue = charts.graph2dAxis.utils.topRound((zeroPos - 1) * interval);
					BottomValue = Math.floor(TopValue - ((charts.graph2dAxis.nbStep - 1) * interval));
				} else {
					TopValue = TopValue;
					BottomValue = Math.floor(TopValue - ((charts.graph2dAxis.nbStep - 1) * interval));
				}
				
				
				
				
				
				// Set the Object Property
				charts.graph2dAxis.top = TopValue;
				charts.graph2dAxis.bottom = BottomValue;
				charts.graph2dAxis.zeroPos = zeroPos;
				charts.graph2dAxis.cuttingPos = cutingPos;
				charts.graph2dAxis.incrementation = interval;
			
				// console.log(charts.graph2dAxis);
			},
			
			init: function(series, options){
				
				
				charts.graph2dAxis.series = series;
				charts.graph2dAxis.options = options;
				

				// Get Nb of Row Heading [Used to label the x Axis]
				
				// Get the available remaining space height for the y axis [minimum of 3 step are required]
				
				// Determine the width of the y axis
				


				charts.graph2dAxis.setNbColumnHeading();
				
				
				if(charts.graph2dAxis.drawDirection == 'x'){
					
					charts.graph2dAxis.setHeightXLabel();
				
					charts.graph2dAxis.setMetric();
					
					// return; // For debug only
					
					// Set the Cutting Pos Offset if needed
					charts.graph2dAxis.cuttingOffset = 0;
					if(charts.graph2dAxis.cuttingPos == (charts.graph2dAxis.nbStep - 1) ){
						charts.graph2dAxis.cuttingOffset = charts.graph2dAxis.options.font.height;
					}
				}
			},
			
			generateGraph: function(paperContainer, paper){
				
				// return; // For debug only
				
				charts.graph2dAxis.paperContainer = paperContainer;
				charts.graph2dAxis.paper = paper;
				
				if(charts.graph2dAxis.drawDirection == 'x'){
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


					
				} else {
					// There are a Maximum and a Minimum regarding the width of the graph, 
					// 		If is not possible to meet that requirement check if we can reverse the draw of the graphic, if not that graph are invalid

				

				}
				
				
				/*if(nbCircleGraph > 0){
					
					// Prepare the Drawing Zone
					
					
					charts.graph2dAxis.paperContainer = $('<div style="margin-top:10px; margin-bottom:10px" \/>').insertAfter(parser.sourceTblSelf);
					// Create the drawing object
					charts.graph2dAxis.paper = Raphael($(charts.graph2dAxis.paperContainer).get(0), charts.graph2dAxis.options.width, charts.graph2dAxis.options.height);
					
					// Draw the graph
					charts.graph2dAxis.graph();
				}*/
			},
			
				
			xAxis: function(){
				// 
				// Draw the x-axis
				//
			
			
				//
				// TODO: Developper NOTE:
				//	 Here they are a glitch when we draw the x axis, because his lenght is too long regarding the graph generated,
				//   :-|
				// 
			
				
				charts.graph2dAxis.xAxisOffset = (charts.graph2dAxis.options.font.height*(charts.graph2dAxis.zeroPos-1) + charts.graph2dAxis.offset.top + charts.graph2dAxis.cuttingOffset);
				
				/*
				var DrawXaxisTick = true;
				var xAxisTickTop = 4; // Number of Pixel for the line up on the x axis;
				var xAxisTickDown = 4; // Number of Pixel for the line down on the x axis;
				*/
				
				var xAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
				
				var maxPos;
				
				for(i=1; i<=(charts.graph2dAxis.NbColumnHeading); i++){
					
					// Valeur Maximale
					maxPos = (i * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading));
					if(charts.graph2dAxis.options.axis.tick || (charts.graph2dAxis.options.axis.top.tick != null ? charts.graph2dAxis.options.axis.top.tick : false) || (charts.graph2dAxis.options.axis.bottom.tick != null ? charts.graph2dAxis.options.axis.bottom.tick : false)){
						// Calculer la position centrale
						var minPos = ((i-1) * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading));
						var centerPos = ((maxPos - minPos) / 2) + minPos;
						
						// Add the Calculated Left Padding
						centerPos += charts.graph2dAxis.offset.left;
						
						// Ligne Droite
						xAxisPath += 'L ' + centerPos + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
						
						// Draw the Top Tick
						if(charts.graph2dAxis.options.axis.top.tick != null ? charts.graph2dAxis.options.axis.top.tick : charts.graph2dAxis.options.axis.tick){
							xAxisPath += 'L ' + centerPos + ' ' + (charts.graph2dAxis.xAxisOffset - (charts.graph2dAxis.options.axis.top.lenght != null ? charts.graph2dAxis.options.axis.top.lenght : charts.graph2dAxis.options.axis.lenght))  + ' ';
						}
						
						// Draw the Bottom Tick
						if(charts.graph2dAxis.options.axis.bottom.tick != null ? charts.graph2dAxis.options.axis.bottom.tick : charts.graph2dAxis.options.axis.tick){
							xAxisPath += 'L ' + centerPos + ' ' + (charts.graph2dAxis.xAxisOffset + (charts.graph2dAxis.options.axis.bottom.lenght != null ? charts.graph2dAxis.options.axis.bottom.lenght : charts.graph2dAxis.options.axis.lenght))  + ' ';
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
					console.log('Error xAxisPath: ' + xAxisPath);
				}
			},
			
			xLabel: function(){
				
				//
				// Draw the X Label
				//
				
				// TODO
				// for(i=0; i<tBodySeries.nbRowLevel; i++){
				// 	// Draw a background for each row
				// }
				
				// For each column Header, calculate his position and add the label
				$.each(charts.graph2dAxis.series.heading, function(){
					
					// Min Pos + Max Pos
					var xMinPos = this.colPos;
					var xMaxPos = (this.colPos + this.width);
					
					if(xMinPos >= charts.graph2dAxis.series.nbRowLevel){
						
						// Get the starting x-axis position of the header area
						xMinPos -= charts.graph2dAxis.series.nbRowLevel;
						xMaxPos = xMaxPos - charts.graph2dAxis.series.nbRowLevel;
						var xMinPosPaper = Math.floor((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / (charts.graph2dAxis.NbColumnHeading) * xMinPos);
						var xMaxPosPaper = Math.floor((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / (charts.graph2dAxis.NbColumnHeading) * xMaxPos);

						//console.log('header:' + this.header);
						//console.log('    xMinPos: ' + xMinPos + ' xMaxPos: ' + xMaxPos + ' xMinPosPaper: ' + xMinPosPaper + ' xMaxPosPaper: ' + xMaxPosPaper);

						
						// Get the middle position
						var xPos = xMinPosPaper;
						xPos = Math.floor((xMaxPosPaper - xMinPosPaper) / 2) + xMinPosPaper;
						var textAnchor = 'middle';
						
						// Add the Offset
						xPos += charts.graph2dAxis.offset.left;
						
						
						// Calculate the Label position into the Y perpective
						
						// TODO NOTE: for draw-x use nbColLevel, and for draw-y use nbRowLevel
						var hMin = (charts.graph2dAxis.series.nbColLevel - this.height - this.level);
						// var hMax = hMin + (this.height-1);
						// console.log(charts.graph2dAxis.series);
						// console.log('hMin:' + hMin + ' nbRowLevel:' + charts.graph2dAxis.series.nbRowLevel + ' height' + this.height + ' level:' + this.level);
						

						// Get the Top and Bottom Position;
						// var topPos = (charts.graph2dAxis.options.height - charts.graph2dAxis.offset.bottom) + (charts.graph2dAxis.options.font.height * hMin);
						var topPos = (charts.graph2dAxis.options.height - charts.graph2dAxis.layout.headingMinSize) + (charts.graph2dAxis.options.font.height * hMin);
						var bottomPos = topPos + (this.height * charts.graph2dAxis.options.font.height);

						// console.log('topPos:' + topPos + ' bottomPos:' + bottomPos + ' height:' + charts.graph2dAxis.options.height + ' headingMinSize:' + charts.graph2dAxis.layout.headingMinSize + ' FontHeight:' + charts.graph2dAxis.options.font.height + ' hMin:' + hMin);

						
						// Get the Middle pos for the label
						var middlePos = topPos + ((bottomPos-topPos) / 2);

						//console.log('    hMin: ' + hMin + ' nbColLevel:' + charts.graph2dAxis.series.nbRowLevel + ' height:' + this.height + ' level:' + this.level);
						
						// var h = ((charts.graph2dAxis.options.height -30) + ((((hMax-hMin) / 2) + hMin) * charts.graph2dAxis.options.font.height) - charts.graph2dAxis.options.font.height + charts.graph2dAxis.offset.top + charts.graph2dAxis.cuttingOffset + (4 * 2));
						// var h = (charts.graph2dAxis.options.height + ((((hMax-hMin) / 2) + hMin) * charts.graph2dAxis.options.font.height) - charts.graph2dAxis.options.font.height - charts.graph2dAxis.offset.top - charts.graph2dAxis.cuttingOffset - (4 * 2));
						
						
						
						// TopPos => offset.top + 
						
						//console.log('    topPos: ' + topPos + ' bottomPos:' + bottomPos + ' charts.graph2dAxis.options.height:' + charts.graph2dAxis.options.height + ' offset.top:' + charts.graph2dAxis.offset.top + ' offset.bottom:' + charts.graph2dAxis.offset.bottom);
						
						
						var leftPos = xMinPosPaper + charts.graph2dAxis.offset.left;
						// var topPos = (charts.graph2dAxis.options.height + (hMin * charts.graph2dAxis.options.font.height) -charts.graph2dAxis.options.font.height + charts.graph2dAxis.offset.top + charts.graph2dAxis.cuttingOffset);
						// var topPos = (charts.graph2dAxis.options.height + (hMin * charts.graph2dAxis.options.font.height) -charts.graph2dAxis.options.font.height - charts.graph2dAxis.offset.top - charts.graph2dAxis.cuttingOffset);
						
						
						var width = ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / (charts.graph2dAxis.NbColumnHeading)) * (this.width);
						var height = bottomPos - topPos;
						
						
						// Draw a background
						// var fillColor = '90-#ee7-#ddd'; //'lightgreen';
						var fillColor = '50-#F4F4F4-#FFF'; //'lightgreen';
						
						//var fillOverColor = colourNameToHex('lightblue');
						// var fillOverColor = '90-#ddd-#7ee';
						var fillOverColor = '90-#FFF-#F4F4F4';
						if(this.param.fill){
							fillColor = colourNameToHex(this.param.fill);
						}
						if(this.param.fillover){
							fillOverColor = colourNameToHex(this.param.fillover);
						}
						var YLabelBg = charts.graph2dAxis.paper.rect(leftPos, topPos, width, height);
						YLabelBg.attr('fill', fillColor);
						YLabelBg.attr('stroke-width', '0');
						
						
						// var YLabel = paper.text(xPos, h, (this.level == 1 ? this.header.substring(0,1):this.header) ); // Test Only for (2lines-eng) by default use the second commented instruction.
						
						var headingText = this.header;
						
						// TODO: replace in the headingTest any "<br />" or "<br>" by "\n" (if the SVG context are keeped vs Canvas)
						// TODO: calculate the heading lenght based on the longer line when the heading is breaked in serveral lineHeight
						// TODO: when the heading box size are calculated, do that based on the hightest number of breaked line for a given series
						
						// Check if the heading text fit in the area
						if((headingText.length * charts.graph2dAxis.options.font.width) > width){
							// Set the best width
							headingText = headingText.substring(0, Math.floor(width/charts.graph2dAxis.options.font.width));
						}
						
						var YLabel = charts.graph2dAxis.paper.text(xPos, middlePos, headingText);
						YLabel.attr("text-anchor", textAnchor);
						YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
						YLabel.attr('title', this.header);
						


						YLabelBg.mouseover(function(){
								YLabelBg.attr('fill', fillOverColor);
						}).mouseout(function() {
								YLabelBg.attr('fill', fillColor);
						});				
						YLabel.mouseover(function(){
								YLabelBg.attr('fill', fillOverColor);
						}).mouseout(function() {
								YLabelBg.attr('fill', fillColor);
						});				
					
					}
					
				});
			},
			
			yAxisLabel: function(){
				
		
				var yAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.offset.top + ' ';
				charts.graph2dAxis.cuttingPosPaper = 0;
				
				
				if(charts.graph2dAxis.top < 0){
					// Draw the 0 label
					var YLabel = charts.graph2dAxis.paper.text(charts.graph2dAxis.offset.left - 4, charts.graph2dAxis.offset.top, 0);
					YLabel.attr("text-anchor", "end");
					YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
					
					// Draw the 0 axis line
					yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.offset.top + ' '; // Bas
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 4) + ' ' + charts.graph2dAxis.offset.top + ' '; // Droite
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 2) + ' ' + charts.graph2dAxis.offset.top + ' '; // Gauche
					yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + charts.graph2dAxis.offset.top + ' '; // Retour
					
					// Draw a axis Top cut line
					yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height/4)) + ' '; // Bas
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + (charts.graph2dAxis.options.font.height)) + ' '; // Droite
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + (charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height/2)) + ' '; // Gauche

					charts.graph2dAxis.paper.path(yAxisPath); // axis-end
					
					// Draw a axis Down cut
					yAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height + (charts.graph2dAxis.options.font.height/4)) + ' '; // Depart
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height + (charts.graph2dAxis.options.font.height/2)) + ' '; // Bas Gauche
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height) + ' '; // Haut Droite
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left) + ' ' + (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height+ (charts.graph2dAxis.options.font.height/4)) + ' '; // Retour Centre
					
					charts.graph2dAxis.cuttingPosPaper = (charts.graph2dAxis.offset.top + charts.graph2dAxis.options.font.height);
					
					// Adjust the charts.graph2dAxis.offset.top
					charts.graph2dAxis.offset.top += (2*charts.graph2dAxis.options.font.height);
				}

				
				
				for(i=0; i < charts.graph2dAxis.nbStep; i++){
					
					
					if(charts.graph2dAxis.cuttingPos == 0 || (charts.graph2dAxis.cuttingPos > i && charts.graph2dAxis.bottom > 0) || charts.graph2dAxis.top < 0){
								
						// No Cutting currently normal way to do the data
						
						// y axis label
						var YLabel = charts.graph2dAxis.paper.text(charts.graph2dAxis.offset.left - 4, charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height), (charts.graph2dAxis.top - (i* charts.graph2dAxis.incrementation)));
						YLabel.attr("text-anchor", "end");
						YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
						
						// y axis line
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Bas
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 4) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Droite
						yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 2) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Gauche
						
						yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Retour
					}

				}
				
				if(charts.graph2dAxis.cuttingPos > charts.graph2dAxis.nbStep && charts.graph2dAxis.bottom > 0){
						
					// Draw a axis Top cut
					yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height/4)) + ' '; // Bas
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Droite
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) - (charts.graph2dAxis.options.font.height/2)) + ' '; // Gauche

					charts.graph2dAxis.paper.path(yAxisPath); // axis-end
					
					// Draw a axis Down cut
					yAxisPath = 'M ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) + (charts.graph2dAxis.options.font.height/4)) + ' '; // Depart
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height) + (charts.graph2dAxis.options.font.height/2)) + ' '; // Bas Gauche
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 10) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)) + ' '; // Haut Droite
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left) + ' ' + (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height)+ (charts.graph2dAxis.options.font.height/4)) + ' '; // Retour Centre
					
					// Draw the 0 label
					var YLabel = charts.graph2dAxis.paper.text(charts.graph2dAxis.offset.left - 4, charts.graph2dAxis.offset.top + ((i+1) * charts.graph2dAxis.options.font.height), 0);
					YLabel.attr("text-anchor", "end");
					YLabel.attr('font-size', charts.graph2dAxis.options.font.size + 'px');
					
					// Draw the 0 y-axis point
					
					yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + ((i+1) * charts.graph2dAxis.options.font.height)) + ' '; // Bas
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left + 4) + ' ' + (charts.graph2dAxis.offset.top + ((i+1) * charts.graph2dAxis.options.font.height)) + ' '; // Droite
					yAxisPath += 'L ' + (charts.graph2dAxis.offset.left - 2) + ' ' + (charts.graph2dAxis.offset.top + ((i+1) * charts.graph2dAxis.options.font.height)) + ' '; // Gauche
					yAxisPath += 'L ' + charts.graph2dAxis.offset.left + ' ' + (charts.graph2dAxis.offset.top + ((i+1) * charts.graph2dAxis.options.font.height)) + ' '; // Retour
					
					charts.graph2dAxis.cuttingPosPaper = (charts.graph2dAxis.offset.top + (i * charts.graph2dAxis.options.font.height));
					
					charts.graph2dAxis.options.height -= (2*charts.graph2dAxis.options.font.height); // Remove the 0 level and the cutting point to the drawing graph area
					
				}
				
				var yAxis = charts.graph2dAxis.paper.path(yAxisPath);

				
			},

			graph: function(){
				
				
				//
				// Calculate the space required for bar and stacked
				//
				var nbGraphBarSpace = 0;
				var PreviousGraphType = undefined;

				var GraphType = 'line'; // That is the default
				

				$.each(charts.graph2dAxis.series.series, function(){
					
					GraphType = this.type; // The first row are the default
					
					
					if(GraphType == 'bar'){ // && (PreviousGraphType != 'bar' || PreviousGraphType == undefined)){
						nbGraphBarSpace ++;
						PreviousGraphType = 'bar';
					}
					if(GraphType == 'stacked'  && (PreviousGraphType != 'stacked' || PreviousGraphType == undefined)){
						nbGraphBarSpace ++;
						PreviousGraphType = 'stacked';
					}		
				});
				
				
				
				PreviousGraphType = undefined;
				var currGraphTypePos = -1;
				
				var legendList = $('<ul>').appendTo($(charts.graph2dAxis.paperContainer));
				
				charts.graph2dAxis.legendContainer = legendList;
				
				var CurrentSerieID = 0;
				
				$.each(charts.graph2dAxis.series.series, function(){
					
					var currentSerie = this;
				
					var legendItem = $('<li></li>').appendTo($(legendList));
					var legendPaperEle = $('<span style="margin-right:7px;"></span>').appendTo($(legendItem));
					var legendPaper = Raphael($(legendPaperEle).get(0), charts.graph2dAxis.options.font.size, charts.graph2dAxis.options.font.size);
					var legendRect = legendPaper.rect(2,2, charts.graph2dAxis.options.font.size - (2*2) + (2/2), charts.graph2dAxis.options.font.size - (2*2) + (2/2));
					
					
					
					
					GraphType = this.type;

					
					var Color = undefined;
					var StrokeDashArray = "";

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
					
					if(charts.graph2dAxis.options.colors[CurrentSerieID]){
						Color = charts.graph2dAxis.options.colors[CurrentSerieID];
					} else {
						Color = charts.graph2dAxis.options.colors[0];
					}
					
					
					
					if(currentSerie.param.color){
						Color = colourNameToHex(currentSerie.param.color);
					}
					
					if(currentSerie.param.dasharray){
						StrokeDashArray = currentSerie.param.dasharray.toLowerCase();
						// Do the appropriate find and replace in the string
						StrokeDashArray = StrokeDashArray.replace("space", " ").replace("dash", "-").replace("dot", ".").replace("none", "");
						
					}
					
					
					var dataCellPos = 0;
					var WorkingSpace = undefined;
					var HeaderText = undefined;
					if(HeaderText == undefined){
						HeaderText = currentSerie.header.rawValue;
					}
					// For each value calculate the path
					$.each(this.cell, function(){
						
						var minPos = (dataCellPos * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading));
						var maxPos = ((dataCellPos+1) * ((charts.graph2dAxis.options.width - charts.graph2dAxis.offset.left) / charts.graph2dAxis.NbColumnHeading));
						var centerPos = ((maxPos-minPos)/2) + minPos + charts.graph2dAxis.offset.left;
						
						if(!this.isHeader){
							
							this.graphMinPos = minPos;
							this.graphMaxPos = maxPos;
							this.graphCenterPos = centerPos;
							/*
							this.debugNbStep = charts.graph2dAxis.nbStep;
							this.debugTop = charts.graph2dAxis.top;
							this.debugBottom = charts.graph2dAxis.bottom;
							*/
							this.graphValue = (((charts.graph2dAxis.top - this.value) * (charts.graph2dAxis.options.font.height*(charts.graph2dAxis.nbStep-1)) / (charts.graph2dAxis.top-charts.graph2dAxis.bottom))+ charts.graph2dAxis.offset.top);
							
							if(WorkingSpace == undefined){
								WorkingSpace = maxPos - minPos;
							}
							
							

							dataCellPos ++;
						}
					});
					
					$(legendItem).append(HeaderText);
					
					
					// Draw the appropriate graph
					if(GraphType == 'line' || GraphType == 'area'){
						
						// TODO: area graphic
						// - Relay the area zone always to the 0 axis
						// - Consider the cut axis pos if applicable
						// - Consider the GraphValue can be positive and negative in the same series (Always relay the area to the 0 axis)
						
						var path = undefined;
						
						var firstPos = undefined;
						var lastPos = undefined;
						
						$.each(this.cell, function(){
							if(!this.isHeader){
								if(path == undefined){
									path = 'M ' + this.graphCenterPos + ' ';
								} else {
									path += 'L ' + this.graphCenterPos + ' ';
								}
								path +=  this.graphValue + ' ';
								
								if(firstPos == undefined){
									firstPos = this.graphCenterPos;
								}
								lastPos = this.graphCenterPos;
							}
						});
						
						if(GraphType == 'area'){
							
							// Check if an axis cut exist
							if(charts.graph2dAxis.cuttingPosPaper == 0){
								// Finish the draw
								path += 'L ' + lastPos + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
								path += 'L ' + firstPos + ' ' + charts.graph2dAxis.xAxisOffset + ' ';
								path += 'z'
							} else {
								// Find the cut position and cut the bar
								if(charts.graph2dAxis.top < 0){
									// Negative Table
									path += ' L ' + lastPos + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height/2));
									path += ' L ' + firstPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
									path += ' z';
									
									var c = charts.graph2dAxis.paper.path(path);
									c.attr("stroke", Color);
									c.attr("stroke-dasharray", StrokeDashArray);
									
									if(GraphType == 'area'){
										c.attr("fill", Color);
										c.attr("fill-opacity", (30 / 100));
									}
									
									// Second bar
									path = 'M ' + firstPos + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height/2));
									path += ' L ' + lastPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
									path += ' L ' + lastPos + ' ' + charts.graph2dAxis.xAxisOffset;
									path += ' L ' + firstPos + ' ' + charts.graph2dAxis.xAxisOffset;
									path += ' z';
																	
								} else {
									// Positive Table
									path += ' L ' + lastPos + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height/2));
									path += ' L ' + firstPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
									path += ' z';

									var c = charts.graph2dAxis.paper.path(path);
									c.attr("stroke", Color);
									c.attr("stroke-dasharray", StrokeDashArray);
									
									if(GraphType == 'area'){
										c.attr("fill", Color);
										c.attr("fill-opacity", (30 / 100));
									}
									
									// Second bar
									path = 'M ' + firstPos + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height/2));
									path += ' L ' + lastPos + ' ' + charts.graph2dAxis.cuttingPosPaper;
									path += ' L ' + lastPos + ' ' + charts.graph2dAxis.xAxisOffset;
									path += ' L ' + firstPos + ' ' + charts.graph2dAxis.xAxisOffset;
									path += ' z';
								}
							}
							
						}
						
						var c = charts.graph2dAxis.paper.path(path);
						
						
						c.attr("stroke", Color);
						legendRect.attr("stroke", Color);
						c.attr("stroke-dasharray", StrokeDashArray);
						legendRect.attr("stroke-dasharray", StrokeDashArray);
						
						if(GraphType == 'area'){
							c.attr("fill", Color);
							legendRect.attr("fill", Color);
							c.attr("fill-opacity", (30 / 100));
							legendRect.attr("fill-opacity", (30 / 100));
						} else {
							legendRect.attr("fill", Color);
						}
						
					}
					
					if(GraphType == 'bar' || GraphType == 'stacked'){
						
						
						
						if(PreviousGraphType != 'stacked' && GraphType != 'stacked' || PreviousGraphType != GraphType){
							currGraphTypePos ++;
						}
						// console.log('PreviousGraphType:' + PreviousGraphType + ' GraphType:' + GraphType + ' currGraphTypePos:' + currGraphTypePos);
						PreviousGraphType = GraphType;


						
						// Calculare the space for the bar
						// 0 Bar space between each bar [That can be set to something else (May be a percentage of the real bar space)]
						// 1/4 bar space at the begin [That can be set to something else (May be a percentage of the real bar space)]
						// 1/4 bar space at the end [That can be set to something else (May be a percentage of the real bar space)]
						
						// (nbGraphBarSpace * 4) + 1 + 1 = Nombre Total de segment
						// (nbGraphBarSpace * 100) + 25 + 25 = Nombre Total de petit-segment sur une base de 100 pour 1 segment
						var percentPaddingStart = 50;
						var percentPaddingEnd = 50;
						var nbSmallSegment = (nbGraphBarSpace * 100) + percentPaddingStart + percentPaddingEnd; // Ou 25 = EmptyStartWorkingspace et l'autre 25 = empty end working space
						var EmptyStartWorkingSpace = (percentPaddingStart * WorkingSpace / nbSmallSegment);
						var EmptyEndWorkingSpace = (percentPaddingEnd * WorkingSpace / nbSmallSegment);
						
						var RealWorkingSpace = WorkingSpace - EmptyStartWorkingSpace - EmptyEndWorkingSpace;
						
						var SegmentWidth = RealWorkingSpace/nbGraphBarSpace;
						
						var StartPos = SegmentWidth * currGraphTypePos;
						var EndPos = StartPos + SegmentWidth;
						
						// console.log('id:' + $(self).attr('id') + ' nbGraphBarSpace:' + nbGraphBarSpace + ' nbSmallSegment:' + nbSmallSegment);
						// console.log('id:' + $(self).attr('id') + ' WorkingSpace:' + WorkingSpace + ' EmptyStartWorkingSpace:' + EmptyStartWorkingSpace + ' EmptyEndWorkingSpace:' + EmptyEndWorkingSpace);
						// console.log('id:' + $(self).attr('id') + ' RealWorkingSpace:' + RealWorkingSpace + ' SegmentWidth:' + SegmentWidth + ' StartPos:' + StartPos + ' EndPos:' + EndPos);
						
						
						
						
						$.each(this.cell, function(){
							if(!this.isHeader){
								
								var xTopLeft = this.graphMinPos + StartPos + EmptyStartWorkingSpace+ charts.graph2dAxis.offset.left; // That never change
								var yTopLeft = undefined;
								var height = undefined;
								var width = SegmentWidth; // That never change
								
								
								// Check if the graphValue are below the 0 axis or top of 
								if(charts.graph2dAxis.xAxisOffset >= this.graphValue){
									// The Point are below the 0 axis
									yTopLeft = this.graphValue;
									height = charts.graph2dAxis.xAxisOffset - this.graphValue;
								} else {
									// The Point are upper the 0 axis
									yTopLeft = charts.graph2dAxis.xAxisOffset;
									height = this.graphValue - charts.graph2dAxis.xAxisOffset;
								}
								
								var path = "";
								// Check if the y-axis is cut, if true cut the bar also
								

								if(charts.graph2dAxis.cuttingPosPaper == 0){
									// Draw it the none cut bar
									path = 'M ' + xTopLeft + ' ' + yTopLeft;
									path += ' L ' + (xTopLeft + width) + ' ' + yTopLeft;
									path += ' L ' + (xTopLeft + width) + ' ' + (yTopLeft + height);
									path += ' L ' + xTopLeft + ' ' + (yTopLeft + height);
									path += ' z';
								
								} else {
									// Find the cut position and cut the bar
									if(charts.graph2dAxis.top < 0){
										// Negative Table
										path = 'M ' + xTopLeft + ' ' + yTopLeft;
										path += ' L ' + (xTopLeft + width) + ' ' + yTopLeft;
										path += ' L ' + (xTopLeft + width) + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' L ' + xTopLeft + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height/2));
										path += ' z';
										var bar = charts.graph2dAxis.paper.path(path);
										bar.attr("fill", Color);
										
										
										if(currentSerie.param.fillopacity){
											bar.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
										}
										
										
										// Second bar
										path = 'M ' + xTopLeft + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' L ' + (xTopLeft + width) + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height/2));
										path += ' L ' + (xTopLeft + width) + ' ' + (yTopLeft + height);
										path += ' L ' + xTopLeft + ' ' + (yTopLeft + height);
										path += ' z';
																		
									} else {
										// Positive Table
										path = 'M ' + xTopLeft + ' ' + yTopLeft;
										path += ' L ' + (xTopLeft + width) + ' ' + yTopLeft;
										path += ' L ' + (xTopLeft + width) + ' ' + (charts.graph2dAxis.cuttingPosPaper - (charts.graph2dAxis.options.font.height/2));
										path += ' L ' + xTopLeft + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' z';
										var bar = charts.graph2dAxis.paper.path(path);
										bar.attr("fill", Color);
										
										
										if(currentSerie.param.fillopacity){
											bar.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
										}
										
										
										// Second bar
										path = 'M ' + xTopLeft + ' ' + (charts.graph2dAxis.cuttingPosPaper + (charts.graph2dAxis.options.font.height/2));
										path += ' L ' + (xTopLeft + width) + ' ' + charts.graph2dAxis.cuttingPosPaper;
										path += ' L ' + (xTopLeft + width) + ' ' + (yTopLeft + height);
										path += ' L ' + xTopLeft + ' ' + (yTopLeft + height);
										path += ' z';
									}
									
								}
								var bar = charts.graph2dAxis.paper.path(path);
								bar.attr("fill", Color);
								legendRect.attr("fill", Color);
								
								
								if(currentSerie.param.fillopacity){
									bar.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
									legendRect.attr("fill-opacity", (currentSerie.param.fillopacity / 100));
								}
								
								
							}
						});
						
						

						
						/*
						if(GraphType == 'bar' && (PreviousGraphType != 'bar' || PreviousGraphType == undefined)){
							currGraphTypePos ++;
							PreviousGraphType = 'bar';
						}
						if(GraphType == 'stacked'  && (PreviousGraphType != 'stacked' || PreviousGraphType == undefined)){
							currGraphTypePos ++;
							PreviousGraphType = 'stacked';
						}	*/
						
					}
					
					
					CurrentSerieID++;
				});
			}
		};
		
		


		// Table Parser Object
		var parser = {
			sourceTblSelf: undefined,
			param: {}, // TO BE ELIMINATED WITH THE DEFAULT JS OPTIONS
			parse: function(){
				
				
				
				
				parser.sourceTblSelf = self;
				
				// Swap the table is requested
				if((parser.param.parseDirection? parser.param.parseDirection: o.parseDirection) == 'y'){
					self = parser.swapTable(parser.sourceTblSelf);
				}
				
				parser.setSeriesHeadingLenght();
				
				
				// The following variable is used for auto add ids/headers to the table
				var columnIds = []; // The array lenght must equal of parser.seriesHeadingLenght and each item are ids separated by space
				
				/*	 	// Parse the Table Heading
				$('thead', self).each(function(){
					
					var ColumnHeading = [];
					var SpannedRow = [];
					
					
					parser.rowPos = 0; // re-init the row numbering

					
					// FOR EACH row get the series
					$('tr', this).each(function(){

						
						var currentSerieLevel = 0;
						
						var CurrColPosition = 0;	
					
						
						// Check if the first cell was spanned
						$.each(SpannedRow, function(){
							if(this.colpos == CurrColPosition && this.rowspan > 0){
								
								// Calculate the width of the spanned row
								var w = (($(this.ele).attr('colspan') != undefined ? $(this.ele).attr('colspan') : 1) * 1);
								
								CurrColPosition += w;
								
								this.rowspan --;
								
							}
						});
						
						
						
						
						var serieHeader = ''; // That would contain the current on process serie header
						
						// Get the Row heading Width
						$('td, th', this).each(function(){
							
							parser.cellID ++;
							
							
							var IgnoreCurrentCell = false; // TODO check if wet-graph-ignore class is set, if yes use the cell value data as non numerical data
							

							// Get the dimension for the cell
							var w = (($(this).attr('colspan') != undefined ? $(this).attr('colspan') : 1) * 1);
							var RowSpan = (($(this).attr('rowspan') != undefined ? $(this).attr('rowspan') : 1) * 1);
							
												
							// Check if is a rowspan, if that row span are an header (th) that mean it a grouping of series
							if(RowSpan > 1){
								var NbRowToBeSpan = RowSpan - 1;
								// Add the row to the list to be spanned
								SpannedRow.push({ele: $(this), rowspan: NbRowToBeSpan, colpos: CurrColPosition});
							}
							
							
							// If is the second or more row, check for a group ID
							CurrentGroupingID = 0;
							if(parser.rowPos > 0){
								var headerList = '';
								$.each(ColumnHeading, function(){
									if(CurrColPosition >= this.colPos && 
										CurrColPosition < (this.colPos + this.width) && 
										this.isGroup &&
										this.level < parser.rowPos){
										// That is a Header group
										CurrentGroupingID = this.id;
										// Get the associate header for that cell
										// headerList = (columnIds[this.colPos] != undefined ? columnIds[this.colPos]: '') + (this.uniqueID != '' ? ' ' + this.uniqueID : '');
										
										
									}
								});
								
								// $(this).attr('headers', headerList); // Set the header and overwrite if any exist

							}
							
							
							
							// Check for Column Header spanned
							var isGroup = false;
							if(this.nodeName.toLowerCase() == 'th' && w > 1) {
								isGroup = true;
							}
							
							if(columnIds[CurrColPosition] != undefined){
								$(this).attr('headers', columnIds[CurrColPosition]);
							}
							
							
							// If this is an heading and there are no id, we create a new one
							var cellId = '';
							if(this.nodeName.toLowerCase() == 'th' && $(this).text().replace(/ /g,'') != ""){ 
								cellId = $(this).attr('id');
								//console.log(cellId);
								if(cellId == undefined || cellId == ''){
									cellId = 'graphcellid'+ graphStartExecTime + 'row' + parser.rowPos + 'col' + CurrColPosition; // Generate a new unique ID
									$(this).attr('id', cellId); // Add the new ID to the table
								}			
								//console.log(cellId);
								
								// This loop make sur all column have their column set
								for(i=0; i<w; i++){
									var cellPos = i + CurrColPosition;
									if(columnIds[cellPos] == undefined){
										columnIds[cellPos] = cellId;
									} else {
										columnIds[cellPos] = columnIds[cellPos] + ' ' + cellId;
									}
								}
								
							}
							
							
							
							var tblId = $(parser.sourceTblSelf).attr('id');
					
							
							

							var header = {
								id : parser.cellID,
								uniqueID: cellId,
								level : parser.rowPos,
								width : w,
								height: RowSpan,
								header : $(this).text(),
								groupId : CurrentGroupingID,
								isGroup : isGroup,
								colPos: CurrColPosition,
								param: parser.classToJson(this)
							};
							ColumnHeading.push(header);

							if(parser.tBodySeries.nbColLevel <= parser.rowPos || parser.tBodySeries.nbColLevel == undefined){
								parser.tBodySeries.nbColLevel = (parser.rowPos + 1);
							}

							
							
							CurrColPosition += w; // Increment the Current ColPos

							
							
							// Check for span row
							$.each(SpannedRow, function(){
								if(this.colpos == CurrColPosition && this.rowspan > 0){
									var w = (($(this.ele).attr('colspan') != undefined ? $(this.ele).attr('colspan') : 1) * 1);
									CurrColPosition += w;
									this.rowspan --;
								}
							});
							
							
						// console.log(CurrColPosition);							

						});
							
						
										
						parser.rowPos ++;

						
					});
					
			
					parser.tBodySeries.ColHeading = ColumnHeading;
					
				});
				
				
				*/
				
				
				
			
				
				
				
				
				
				
				
				
				
				
				
				
				// console.log(columnIds);
				
				var rowsIds = [];
				
				// Parse the Table Cell Data and Serie Heading
				$('tbody', self).each(function(){
					var maxValue;
					var minValue;
					var unit;
					var SpannedRow = [];
					var Series = {
						headerList: [],
						series: [],
						param: parser.classToJson(this)
					};
					
					// FOR EACH row get the series
					$('tr', this).each(function(){
						var currentSerieLevel = 0;
						var CurrColPosition = 0;
						var CurrentGroupingID = 0;		
						var arrAllCell = $(this).children();
						var cellOrdered = [];
						var cellHeadingOrdered = [];
						
						
						// Check if the first cell was spanned
						$.each(SpannedRow, function(){
							if(this.colpos == CurrColPosition && this.rowspan > 0){
								// Calculate the width of the spanned row
								var w = (($(this.ele.obj).attr('colspan') != undefined ? $(this.ele.obj).attr('colspan') : 1) * 1);
								for(i=1; i<=w; i++){
									this.ele.colPos = i+CurrColPosition;
									if(this.ele.isHeader){
										cellHeadingOrdered.push(jQuery.extend(true, {}, this.ele));
									} else {
										cellOrdered.push(jQuery.extend(true, {}, this.ele));
									}
								}
								CurrColPosition += w;
								if($(this.ele.obj).get(0).nodeName.toLowerCase() == 'th' && parser.seriesHeadingLenght > CurrColPosition){
									currentSerieLevel ++; // That would say on witch heading level we are
									
									if(this.rowspan >= 1){
										// Change the Grouping ID on the next iteration
										CurrentGroupingID = this.ele.id;
									}
								}
								
								this.rowspan --;
							}
						});
						
						var serieHeaderText = ''; // That would contain the current on process serie header
						var serieHeader; // JQuery object of the native Header for the current serie
						var isRejected = false;
						var rejectedRaison = "";
						
						// Get the Row heading Width
						$('th, td', this).each(function(){
							
							parser.cellID ++;
							
							var IgnoreCurrentCell = false; // TODO check if wet-graph-ignore class is set, if yes use the cell value data as non numerical data
							
							// Get the cell Value
							var cellValueObj = parser.getCellValue($(this).text());
							
							var cellInfo = {
								id : parser.cellID,
								isHeader: false,
								rowPos: parser.rowPos,
								rawValue: $(this).text(),
								value: cellValueObj.cellValue,
								unit: cellValueObj.cellUnit,
								obj: $(this),
								param: parser.classToJson(this)
							};
							
							// Get the dimension for the cell
							var w = (($(this).attr('colspan') != undefined ? $(this).attr('colspan') : 1) * 1);
							var RowSpan = (($(this).attr('rowspan') != undefined ? $(this).attr('rowspan') : 1) * 1);


							//
							// DO something when colspan and *row span*
							//
							//
							
							// Set the header for the cells, if applicable
							// console.log('CurrColPosition: ' + CurrColPosition + ' width: ' + w);
							// console.log('rowpos:' + parser.rowPos + ' CurrColPosition:' + CurrColPosition );
							var cellColHeaders = "";
							for(i = CurrColPosition; i<(CurrColPosition+w); i++){
								if(columnIds[i] != undefined){
									if(cellColHeaders == ''){
										// Normal cell
										cellColHeaders = columnIds[i];
									} else {
										// This is for about colspaned cell
										var tblCellColHeaders = parser.removeDuplicateElement(cellColHeaders.split(' ').concat(columnIds[i].split(' ')));
										cellColHeaders  = tblCellColHeaders.join(' ');
									}
								}
							}

							var cellRowHeaders = "";
							if(rowsIds[parser.rowPos] != undefined){
								cellRowHeaders = rowsIds[parser.rowPos];
							}
							
							$(this).attr('headers', cellColHeaders + (cellColHeaders != "" && cellRowHeaders != ""? ' ': '') + cellRowHeaders);
							
							
							// cellUnit will be use as global for the entire row group
							if(this.nodeName.toLowerCase() == 'th'){
								// Mark the current cell as Header 
								cellInfo.isHeader = true;
								
								// Generate a cell ID if none + add it inside the heading list
								
								
								cellId = $(this).attr('id');
								if(cellId == undefined || cellId == ''){
									cellId = 'graphcellid'+ graphStartExecTime + 'row' + parser.rowPos + 'col' + CurrColPosition; // Generate a new unique ID
									$(this).attr('id', cellId); // Add the new ID to the table
								}			
								//console.log(cellId);
								
								// This loop make sur all column have their column set
								for(i=0; i<RowSpan; i++){
									var cellPos = i + parser.rowPos;
									// console.log(cellPos);
									if(rowsIds[cellPos] == undefined){
										rowsIds[cellPos] = cellId;
									} else {
										rowsIds[cellPos] = rowsIds[cellPos] + ' ' + cellId;
									}
								}
								
								
							}
							
							


							// Check if is a rowspan, if that row span are an header (th) that mean it a grouping of series
							if(RowSpan > 1){

								var NbRowToBeSpan = RowSpan - 1;
								// Add the row to the list to be spanned
								SpannedRow.push({ele: cellInfo, rowspan: NbRowToBeSpan, colpos: CurrColPosition, groupId : CurrentGroupingID});

								// Check if is a header, if yes this series would be a inner series and that header are a goup header
								if(cellInfo.isHeader && parser.seriesHeadingLenght > CurrColPosition) {
									// This represent a sub row grouping
									currentSerieLevel ++; // Increment the heading level
									
									// Mark the current cell as Header 
									cellInfo.isHeader = true;
									
									var header = {
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
							for(i=1; i<=w; i++){
								cellInfo.colPos = i+CurrColPosition;
								if(cellInfo.isHeader){
									cellHeadingOrdered.push(jQuery.extend(true, {}, cellInfo));
								} else {
									cellOrdered.push(jQuery.extend(true, {}, cellInfo));
								}
							}
							
							CurrColPosition += w; // Increment the Current ColPos

							if(parser.seriesHeadingLenght == CurrColPosition){
								// That should correspond to a th element, if not that is a error
								if(!cellInfo.isHeader){
									isRejected = true;
									rejectedRaison = 'Serie heading not good, current cell value:' + $(this).text();
								}
								serieHeaderText = $(this).text();
								serieHeader = $(this);
								
								// Add it to header listing
								var header = {
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
							$.each(SpannedRow, function(){
								if(this.colpos == CurrColPosition && this.rowspan > 0){
									// Calculate the width of the spanned row
									var w = (($(this.ele.obj).attr('colspan') != undefined ? $(this.ele.obj).attr('colspan') : 1) * 1);
									for(i=1; i<=w; i++){
										this.ele.colPos = i+CurrColPosition;
										if(this.ele.isHeader){
											cellHeadingOrdered.push(jQuery.extend(true, {}, this.ele));
										} else {
											cellOrdered.push(jQuery.extend(true, {}, this.ele));
										}
									}
									CurrColPosition += w;
									
									// Concat the new row heading as needed
									var CurrCellHeaders = ($(this.ele.obj).attr('headers') != undefined? $(this.ele.obj).attr('headers'): '');
									var tblCellColHeaders = parser.removeDuplicateElement(CurrCellHeaders.split(' ').concat(rowsIds[parser.rowPos].split(' ')));
									$(this.ele.obj).attr('headers', tblCellColHeaders.join(' '));
									
									this.rowspan --;
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
						}
						
						if((parser.tBodySeries.nbRowLevel <= currentSerieLevel || parser.tBodySeries.nbRowLevel == undefined) && !isRejected){
							parser.tBodySeries.nbRowLevel = (currentSerieLevel + 1);
						}
						
						Series.series.push(serie);
						
						
						
						parser.rowPos ++;
						

						
					});
					
					
					parser.tBodySeries.series.push(Series);
					
					
				});
				
				// console.log(rowsIds);
			
				// TODO: Parse the Table Foot (Check if an option set it at cumulative data or just suplementary data
				
				// var stringParser = JSON.stringify(parser);
				// $('<p />').insertAfter($(self)).text(stringParser);
				
				//console.log();
			},

			seriesHeadingLenght: 0,
			setSeriesHeadingLenght: function(){
				// Calculate once the width for the Series Heading
				$('tbody:first tr:first th', self).each(function(){
					var w = (($(this).attr('colspan') != undefined ? $(this).attr('colspan') : 1) * 1);
					parser.seriesHeadingLenght += w;
				});
			},
			rowPos: 0,
			cellID: 0,
			
			removeDuplicateElement: function (arrayName) {
				var newArray=new Array();
				label:for(var i=0; i<arrayName.length;i++){  
					for(var j=0; j<newArray.length;j++){
						if(newArray[j]==arrayName[i])
							continue label;
					}
					newArray[newArray.length] = arrayName[i];
				}
				return newArray;
			},
			
			// Function to switch the series order, like make it as vertical series to horizontal series (see Task #2997)
			swapTable: function(){

				// function swapTable for request #2799, transforming horizontal table to virtical table; 
				// Government of Canada. Contact Qibo or Pierre for algorithm info and bug-fixing; 
				// important table element: id or class, th; 
				var sMatrix = [];  
				var i=0;  
				var j=0;  
				var capVal="Table caption tag is missing"; 
				capVal =  $("caption", self).text(); 

				var maxRowCol=10; //basic;  
				var s=0; 

				$('tr ', self).each(function(){
						maxRowCol++; 
                                              if(s<1){
                                                       $('td,th', $(this)).each(function(){

                                                               if($(this).attr('colspan') != undefined) {
                                                               }else{
                                                                       $(this).attr('colspan', 1);
                                                               }
                                                               maxRowCol += Number($(this).attr("colspan"));
                                                               // block change, 20120118 fix for defect #3226, jquery 1.4 problem about colspan attribute, qibo; 
                                                       })
                                               }
                                               s++;
                                       }) ;

                                       var tMatrix = [];
                                       // prepare the place holding matrix;
                                       for (var s=0; s<maxRowCol; s++){
                                               tMatrix[s] = [];
                                               for (var t=0; t<maxRowCol; t++){
                                                       tMatrix[s][t] = 0;
                                               }
                                       }


                                       $('tr ', self).each(function(){
                                               j= 0;
                                               var attrCol = 1;
                                               var attrRow = 1;

                                               $('td,th', $(this)).each(function(){

                                                       if($(this).attr('colspan') != undefined) {
                                                       }else{
                                                               $(this).attr('colspan', 1);
                                                       }
                                                       if($(this).attr('rowspan') != undefined) {
                                                       }else{
                                                               $(this).attr('rowspan', 1);
                                                       }

                                                       attrCol = Number($(this).attr("colspan"));
                                                       attrRow = Number($(this).attr("rowspan"));
                                                       // block change, 20120118 fix for defect #3226, jquery 1.4 problem about colspan attribute, qibo; 


						       while (tMatrix[i][j] == 3){
						       j++; 
						       }

						       if(attrRow >1 && attrCol>1){
						       var ii=i; 
						       var jj=j; 
						       var stopRow = i+ attrRow -1; 
						       var stopCol = j+ attrCol -1; 
						       for(jj=j;jj<=stopCol; jj++){
							       for(ii=i;ii<=stopRow; ii++){
								       tMatrix[ii][jj]=3; //random number as place marker; 
							       }
						       }
						       }else if(attrRow >1){
							       var ii=i; 
							       var stopRow = i+ attrRow -1; 
							       for(ii=i;ii<=stopRow; ii++){
								       tMatrix[ii][j]=3; // place holder; 
							       }
						       }

						       var ss1= $(this).clone(); // have a copy of it, not destroying the look of the original table; 
						       // transforming rows and cols and their properties; 
						       ss1.attr("colspan", attrRow);
						       ss1.attr("rowspan", attrCol);
						       (sMatrix[j] = sMatrix[j] || [])[i] = ss1;
						       j=j+attrCol;   
					       })  
					       i++;  
				       });

				       // now creating the swapped table from the transformed matrix;
				       var swappedTable = $('<table>');  
				       $.each(sMatrix, function(s){  
						       var oneRow = $('<tr>'); 
						       swappedTable.append(oneRow);  
						       $.each(sMatrix[s], function(ind, val){  
							       oneRow.append(val); 
							       }); 
						       });  

				       // now adding the missing thead; 
				       var html2=swappedTable.html();
				       var headStr="<table id=\"swappedGraph\">" + "<caption>" + capVal + " (Horizontal to Virtical)</caption><thead>";
				       html2=html2.replace(/<tbody>/gi, headStr);
				       html2=html2.replace(/<\/tbody>/gi, "</tbody></table>");
				       html2=html2.replace(/\n/g,"");
				       html2=html2.replace(/<tr/gi,"\n<tr");
				       var arr=html2.split("\n"); 
				       for(i=0;i<arr.length; i++){
					       var tr=arr[i];
					       if(tr.match(/<td/i) != null){
						       arr[i]= '</thead><tbody>' + tr; 
						       break; 
					       }
				       }
				       html2=arr.join("\n"); 
				       // alert(html2); // see the source 
				       $(html2).insertAfter(self).hide(); //visible, for debugging and checking;

				       return $(html2);   
			}, //end of function; 
			

			// Compute the series value (see Task #2998)
			compute: function(){
				$.each(parser.tBodySeries.series, function(){
					// This loop is for each tbody section (series group)
					
					var grpMaxValue = undefined;
					var grpMinValue = undefined;
					
					var nbDataSerieLength = undefined; // To know and evaluate the table previously parsed)
					
					$.each(this.series, function(){
						if(!this.isRejected) {
							
						// This loop is for each individual serie
						var maxValue = undefined;
						var minValue = undefined;
						var nbData = 0;
						$.each(this.cell, function(){
							// This loop is for each cell into the serie, here we will compute the total value for the serie
							
							if(!this.isHeader){
								// Evaluate max value
								if(this.value > maxValue || maxValue == undefined){
									maxValue = this.value;
								}
								if(this.value < minValue || minValue == undefined){
									minValue = this.value;
								}
								
								nbData ++;
							}
						});
						
						this.maxValue = maxValue;
						this.minValue = minValue;
						this.length = nbData;
						
						if(nbDataSerieLength == undefined){
							nbDataSerieLength = nbData;
						}
						
						if(nbData != nbDataSerieLength){
							// That series need to be rejected because the data are not properly structured
							this.isRejected = true;
							this.rejectedRaison = 'The data length need to be equal for all the series';
						}
						
						// Evaluate max value (for the group)
						if((maxValue > grpMaxValue || grpMaxValue == undefined) && !this.isRejected){
							grpMaxValue = maxValue;
						}
						if((minValue < grpMinValue || grpMinValue == undefined) && !this.isRejected){
							grpMinValue = minValue;
						}
						
						}
					});
					
					if(grpMaxValue > 0){
						grpMaxValue = grpMaxValue 
					} else {
						grpMaxValue = grpMaxValue;
					}
					
					if(grpMinValue > 0){
						grpMinValue = grpMinValue;
					} else {
						grpMinValue = grpMinValue;
					}
					

					this.maxValue = grpMaxValue;
					this.minValue = grpMinValue;
					this.dataLength = nbDataSerieLength;
				});
			},

			getCellValue: function (cellRawValue){
				//trim spaces in the string; 
				var cellRawValue=cellRawValue.replace(/\s\s+/g," ");
				var cellRawValue=cellRawValue.replace(/^\s+|\s+$/g,"");
				// Return the result
				var result = {
					cellUnit:  cellRawValue.match(/[^\+\-\.\, 0-9]+[^\-\+0-9]*/), // Type: Float - Hint: You can use the JS function "parseFloat(string)"
					cellValue: parseFloat(cellRawValue.match(/[\+\-0-9]+[0-9,\. ]*/)) // Type: String
				}
				return result;
			},
			
			// Function to Convert Class instance to JSON
			classToJson: function (el, namespace){
				var strClass = "";
				if(typeof(el) == 'string'){
					strClass = el;
				} else {
					strClass = ($(el).attr('class') != undefined ? $(el).attr('class') : ""); // Get the content of class attribute
				}
				
				return parser.setClassOptions(jQuery.extend(true, o.optionsClass, o.axis2dgraph), strClass, namespace);
			},
			setClassOptions: function(sourceOptions, strClass, namespace){

				
					// Test: optSource
					if(typeof(sourceOptions) != "object"){
						console.log("Empty source");
						return {};
					}
					
					// Get a working copy for the sourceOptions
					sourceOptions = jQuery.extend(true, {}, sourceOptions);
					
					/*
					// Check if some option need to be removed
					function unsetOption(opt, currLevel, maxLevel){
						if(currLevel > maxLevel || !$.isArray(opt)){
							return;
						}
						var arrToRemove = [];
						for(key in opt){
							// if the key are ending "-remove", get the key to remove
							if(key.lenght > 7 && key.substr(key.lenght - 7) == "-remove"){
								arrToRemove.push(key.substr(0, key.lenght - 7));
							} else {
								// get it deeper if applicable
								if(typeof(opt[key])) == "object"){
									currLevel ++;
									if(currLevel < maxLevel){
										unsetOption(opt[key], currLevel, maxLevel);
									}
								}
							}
						}
						for(i=0;i<arrToRemove.lenght;i++){
							delete opt[arrToRemove[i]];
						}
					}
					
					// Check for an unsetOptionsLevel, if defined to the unset
					if(sourceOptions['default-unsetoptionlevel'] && typeof(sourceOptions['default-unsetoptionlevel']) == "number"){
						unsetOption(sourceOptions, 1, sourceOptions['default-unsetoptionlevel']);
					}*/
					

					// Test: strClass
					if(typeof(strClass) != "string" || strClass.lenght == 0){
						console.log("no string class");
						return sourceOptions;
					}

					// Test: namespace
					if (typeof(namespace) != "string" || namespace.lenght == 0) {
						
						// Try to get the default namespace
						if(sourceOptions['default-namespace'] && typeof(sourceOptions['default-namespace']) == "string"){
							namespace = sourceOptions['default-namespace'];
						} else {
							// This a not a valid namespace
							console.log("no namespace");
							return sourceOptions;
						}
					}
					
					// Get the namespace separator if defined (optional)
					var separatorNS = "";
					if(sourceOptions['default-namespace-separator'] && typeof(sourceOptions['default-namespace-separator']) == "string"){
						separatorNS = sourceOptions['default-namespace-separator'];
					} else {
						separatorNS = "-"; // Use the default
					}
					
					// Get the option separator if defined (optional)
					var separator = "";
					if(sourceOptions['default-separator'] && typeof(sourceOptions['default-separator']) == "string"){
						separator = sourceOptions['default-separator'];
					} else {
						separator = " "; // Use the default
					}
					
					// Check if the the Auto Json option creation are authorized from class
					var autoCreate = false;
					if(sourceOptions['default-autocreate']){
						 autoCreate = true;
					}
					

					
					var arrNamespace = namespace.split(separatorNS);
					

					var arrClass = strClass.split(separator); // Get each defined class
					$.each(arrClass, function(){
						
						// Get only the item larger than the namespace and remove the namespace
						if(namespace == (this.length > namespace.length+separatorNS.length ? this.slice(0, namespace.length): "")){
							// This is a valid parameter, start the convertion to a JSON object
							
							
							// Get all defined parameter
							var arrParameter = this.split(separatorNS).slice(arrNamespace.length);
							
							// That variable is use for synchronization
							var currObj = sourceOptions;
							
							// Set the default property name (this can be overwrited later)
							var propName = arrNamespace[arrNamespace.length - 1];
							
							
							for(i=0; i<arrParameter.length; i++){
								
								var valIsNext = (i+2 == arrParameter.length ? true: false);
								var isVal = (i+1 == arrParameter.length ? true: false);
								

								// console.log('propName:' + propName + ' value:' + arrParameter[i] + ' valIsNext:' + valIsNext + ' isVal:' + isVal);
								
								// Check if that is the default value and make a reset to the parameter name if applicable
								if(isVal && arrParameter.length == 1 && sourceOptions['default-option']){
									propName = sourceOptions['default-option'];
								} else if(!isVal) {
									propName = arrParameter[i];
								}
								
								
								
								
								// Get the type of the current option (if available)
								// (Note: an invalid value are defined by "undefined" value)
								
								// Check if the type are defined
								if(currObj[propName + '-typeof']){
									
									// Repair the value if needed
									var arrValue = [];
									for(j=(i+1); j<arrParameter.length; j++){
										arrValue.push(arrParameter[j]);
									}
									arrParameter[i] = arrValue.join(separatorNS);
									valIsNext = false;
									isVal = true;								
								
									switch(currObj[propName + '-typeof']){
										case "boolean":
											if(arrParameter[i] == "true" || arrParameter[i] == "1" || arrParameter[i] == "vrai" || arrParameter[i] == "yes" || arrParameter[i] == "oui"){
												arrParameter[i] = true;
											} else if(arrParameter[i] == "false" || arrParameter[i] == "0" || arrParameter[i] == "faux" || arrParameter[i] == "no" || arrParameter[i] == "non"){
												arrParameter[i] = false;
											} else {
												arrParameter[i] = undefined;
											}
											break;
										case "number":
											// console.log(arrParameter[i]);
											
											if(!isNaN(parseInt(arrParameter[i]))){
												arrParameter[i] = parseInt(arrParameter[i]);
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
								var arrayOverwrite = false;
								if(currObj[propName + '-overwrite-array-mode']){
									arrayOverwrite = true;
								}
								
								// Check if this unique option can be autocreated
								var autoCreateMe = false;
								if(currObj[propName + '-autocreate']){
									autoCreateMe = true;
								}
								
								// console.log('After propName:' + propName + ' value:' + arrParameter[i] + ' valIsNext:' + valIsNext + ' isVal:' + isVal);
								
								
								if(valIsNext && arrParameter[i] !== undefined){
									// Keep the Property Name
									propName = arrParameter[i];
								} else if(isVal && arrParameter[i] !== undefined){
																	
									if(currObj[propName] && arrayOverwrite){
										// Already one object defined and array overwriting authorized
										if($.isArray(currObj[propName])){
											currObj[propName].push(arrParameter[i]);
										} else {
											var val = currObj[propName];
											currObj[propName] = [];
											currObj[propName].push(val);
											currObj[propName].push(arrParameter[i]);
										}
									} else if(currObj[propName] || autoCreate || autoCreateMe || currObj[propName] == 0 || currObj[propName] == false) {
										// Set the value by extending the options
										
										var jsonString = '';
										if(typeof(arrParameter[i]) == "boolean" || typeof(arrParameter[i]) == "number"){
											jsonString = '{\"' + propName + '\": ' + arrParameter[i] + '}';
										} else {
											jsonString = '{\"' + propName + '\": \"' + arrParameter[i] + '\"}';
										}
										currObj = jQuery.extend(true, currObj, jQuery.parseJSON(jsonString));
									}
									
									i = arrParameter.length; // Make sur we don't iterate again
								} else {
									// Create a sub object
									if(arrParameter[i] !== undefined && currObj[arrParameter[i]]){
										// The object or property already exist, just get the reference of it
										currObj = currObj[arrParameter[i]];
										propName = arrParameter[i];
									} else if((autoCreate || autoCreateMe) && arrParameter[i] !== undefined) {
										var jsonString = '{\"' + arrParameter[i] + '\": {}}';
										currObj = jQuery.extend(true, currObj, jQuery.parseJSON(jsonString));
										currObj = currObj[arrParameter[i]];
									} else {
										// This configuration are rejected
										i = arrParameter.length; // We don't iterate again
									}
								}
								
							}
								
								
							
						}
					});
					
					return sourceOptions;
			
			},
			/*// Function to Convert Class instance to JSON
			classToJson: function (el, namespace){
				if (namespace === undefined ) {
				  namespace = 'wb-graph';
				}
				
				// Binded directly with the current option
				// If the option are not exist, refuse the parameter
				// this function check into the options if a typeof are defined (if available) to get the good type for the parameter
				//
				// an options file like
				//		{color: 'blue'}
				//	would be intreprated as a string only
				// but
				// if an options file like
				//		{color: 'blue', "color-typeof": ['string', 'array']}
				//	first instance would be a string, the second or subsequent would be stacked into an array of string
				//		"wb-graph-color-black-blue" would be {color: 'black-blue'}
				//		"wb-graph-color-black wb-graph-color-blue" would be {color: ['black', 'blue']}
				// if an options file like
				//		{color: null, "color-typeof": 'json'}
				//  would create a json object for each param as the number of dash, like wb-graph-color-black-blue would be {color: {black: 'blue'}}
				// 		"wb-graph-color-black-blue" would be {color: {black: 'blue'}}
				
				// This function would try to best inteprete the options type in his best.
				
				
				var sourceOptions = o; // Change the "o" variable for your own option variable (if needed)
				
				var arrNamespace = namespace.split('-');
				
				var strClass = "";
				if(typeof(el) == 'string'){
					strClass = el;
				} else {
					strClass = ($(el).attr('class') != undefined ? $(el).attr('class') : ""); // Get the content of class attribute
				}
				
				var jsonClass = {};

				if(strClass.lenght == 0){
					return jsonClass;
				}

				var arrClass = strClass.split(' '); // Get each defined class
				$.each(arrClass, function(){
					
					// This is for each class defined
					
					if(this.length > namespace.length+1){
					var extractNamespace  = this.slice(0, namespace.length);
					if(extractNamespace == namespace){

						// This is a valid parameter, convert to JSON object for options setup
						var arrParameter = this.split('-').slice(arrNamespace.length),
							currObj = jsonClass,
							navOptions = sourceOptions,
							propName = arrNamespace[arrNamespace.length - 1], // use the last namespace element to define the property by default
							ignoreMe = false,
							ignoreOptionExist = false;
						for(i=0; i<arrParameter.length; i++){
							
							var isEndNode = (i+1 == arrParameter.length ? true : false);
							
							var valeur = arrParameter[i];
							
							
							// Check for the default case (eg. wb-graph-line => default are wb-graph-type-line)
							if(isEndNode && arrParameter.length == 1){
								// Default option need to be defined in the options
								if(navOptions['default-option']){
									var opt = navOptions['default-option'];
									var jsonString = "";
									jsonString = '{\"' + opt + '\": \"' + valeur + '\"}';
								}
							}
							
							if(!isEndNode){
								// Check the corresponding type if exist
								if(!ignoreOptionExist && navOptions[valeur]){
									// Check if a typeof are defined for this options
									
									var typeofDefined = (navOptions[valeur + '-typeof'] ? navOptions[valeur + '-typeof'] : "");
									
									var typeofOption = typeof(navOptions[valeur]); // Get the typeof
									
									// Check if the option are a function, if true ignore the replacement
									if(typeofOption == "function"){
										ignoreMe = true;
									}
									
									
									// a typeof undefined will be intrepreted as "json" or "array" object and will ignore subsequant check for props existance
									if((typeofDefined == "" | typeofDefined == "json" | typeofDefined == "array") && (typeofOption == "object" || typeofOption == "undefined")){
										ignoreOptionExist = true;
									} else {
										
										// Get the rest of the value
										var arrValue = [];
										for(j=(i+1); j<arrParameter.length; j++){
											arrValue.push(arrParameter[j]);
										}
										var val = arrValue.join("-");
										// Parse the value are the proper typeof if possible
										if(val == "true"){
											val = true;
										}
										if(val == "false"){
											val = false;
										}
										if(!isNaN(parseInt(val))){
											val = parseInt(val);
										}
										
										var typeofVal = typeof(val);
										
										if(typeofVal == typeofDefined){ // Possible value: boolean, number or string
											// Set or Add the value
											
										}
										
									}
									
									
									// For an Array object, get the first itm and that would define the type we search
									// eg. Options => {color: ["black"]} == Array of String
									// eg. Options => {color: ["back"], 'color-typeof': 'number'} == Array of number
									
									
									
									
									
									
								} else {
									// Not a valid value, set it to ignoreMe
									ignoreMe = true;
								}
								
							}
							
							
							var valIsNext = false;
							if(i+2 == arrParameter.length){
								valIsNext = true;
							}
							
							var isVal = false;
							if(i+1 == arrParameter.length){
								isVal = true;

								
								// // Fix for boolean value
								// if(arrParameter[i] == "true"){
								//	arrParameter[i] = true;
								// }
								// if(arrParameter[i] == "false"){
								//	arrParameter[i] = false;
								// }
								// if(!isNaN(parseInt(arrParameter[i]))){
								// 	arrParameter[i] = parseInt(arrParameter[i]);
								// }
								
							}
							
							
							// Get the value of the Property
							propName = arrParameter[i];
							
							
							if(valIsNext){
								// Keep the Property Name
								propName = arrParameter[i];
							} else if(isVal){
								
								// Check if they are already an existing value, if yes change the value for an array
								if(!currObj[propName]){
									// Set the value
									var jsonString = '';
									if(arrParameter[i] === true || arrParameter[i] === false || !isNaN(parseInt(arrParameter[i]))){
										jsonString = '{\"' + propName + '\": ' + arrParameter[i] + '}';
									} else {
										jsonString = '{\"' + propName + '\": \"' + arrParameter[i] + '\"}';
									}
									currObj = jQuery.extend(true, currObj, jQuery.parseJSON(jsonString));
								} else {
									if($.isArray(currObj[propName])){
										currObj[propName].push(arrParameter[i]);
									} else {
										var val = currObj[propName];
										currObj[propName] = [];
										currObj[propName].push(val);
										currObj[propName].push(arrParameter[i]);
									}
								}
							} else {
								// Create a sub object
								if(!currObj[arrParameter[i]]){
									var jsonString = '{\"' + arrParameter[i] + '\": {}}';
									currObj = jQuery.extend(true, currObj, jQuery.parseJSON(jsonString));
									// parentObj = jQuery.extend(true, parentObj, currObj));
									currObj = currObj[arrParameter[i]];
								} else {
									// The object or property already exist, just set the reference of
									currObj = currObj[arrParameter[i]];
								}
							}
						}
					}}
				});
				
				return jsonClass;
			
			},*/
			
			tBodySeries: {
				series: [],
				nbRowLevel: undefined,
				nbColLevel: undefined
			}
		};
		
		// Set the new class options if defined
		o = parser.setClassOptions(o, ($(self).attr('class') != undefined ? $(self).attr('class') : ""));

		parser.param = o;

		
		//
		// Type of serie and graph in general
		//
		//	wb-graph-type-line : Linear graphic
		//	wb-graph-type-bar : Single Bar Alone
		//	wb-graph-type-stacked : Same as the Bar but if the previous serie are stacked [line or pie are ignored] would be at the same place over it
		//	wb-graph-type-pie : Pie Chart for that serie [The Pie need to have it's own sqare space]

		// NOTE:
		// class example: wet-graph-color-[color partern]-percent
		// wet-graph-color-rgb255000000 => rgb(255,0,0)
		// wet-graph-color-red => red
		// wet-graph-color-f00 => #f00
		// wet-graph-color-ffffff => #ffffff
		// wet-graph-line
		// TODO: for IE compatibility, translate color name to the appropriate hex code
		

		//
		// Old parser
		//
		
		parser.parse();
		
		// 
		// New Parser
		//
		
		// 1. Parse the table with the new parser
		_pe.fn.parsertable._exec($(self));
		
		// 2. Build the ColHeading
		//$(self).
		var fnNewParser = function(){
			
			
			//parser.tBodySeries.oldColHeading = jQuery.extend(true, {}, parser.tBodySeries.ColHeading);
			//parser.tBodySeries.ColHeading = [];
		
			var tblParserData = $(self).data()['tblparser'];
			
			var currLevel = 0;
			var lastId = -1;
			$.each(tblParserData.theadRowStack, function(){
				
				$.each(this.cell, function(){
					if(this.uid > lastId){
						
						lastId = this.uid;
					
						var colheadingCell = {
							
							uniqueID: this.uid,
							level: currLevel,
							width: this.width,
							height: this.height,
							header: $(this.elem).text(),
							groupId:0,
							isGroup: (this.width > 1?true:false),
							colPos: this.colpos -1,
							param: parser.classToJson($(this.elem))
						};
						
						if(!parser.tBodySeries.ColHeading)parser.tBodySeries.ColHeading=[];
						
						parser.tBodySeries.ColHeading.push(colheadingCell);
					}
				
				});
				
				currLevel ++;
			});
			
			
			// **** Still miss something to be set as when the old parser was parsing the table header ****
			
			parser.tBodySeries.nbColLevel = tblParserData.theadRowStack.length;
			parser.rowPos = tblParserData.theadRowStack.length - 1 ;
		
		};
		fnNewParser();
		//$(self).data().ColHeading = parser.tBodySeries.ColHeading;
		//$(self).data().oldColHeading = parser.tBodySeries.oldColHeading;
		
		// TODO: Instead of parsing the table, use the new parser and adapt the data found in the old model.
				
		parser.compute(); // Compute the parsed data	
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		// var graphTableParsedTime = new Date().getTime();
		// console.log('Table Parsed exec time ' + graphTableParsedTime);
		// console.log('Elapsed : ' + (graphTableParsedTime - graphStartExecTime));
		
		//
		// Validate the parameter
		//
		
		//reset width, height to numbers
		o.width = parseFloat((parser.param.width? parser.param.width - o.widthPadding: o.width - o.widthPadding));
		o.width = parseFloat(o.width > (o.maxwidth - o.widthPadding) ? o.maxwidth - o.widthPadding : o.width);
		o.height = parseFloat((parser.param.height? parser.param.height: o.height));

		
		
		// 0 => Nearest of the serie, 1 > series grouping if any
		var DesignerHeadingLevel = parser.tBodySeries.nbRowLevel;
		
		// Get the default Graph Type [Table level]
		
		var GraphTypeTableDefault = '';
		if(parser.param.graph){ // Check for table defined param
			GraphTypeTableDefault = parser.param.graph;
		} else if(parser.param.type){ // Overide the default if the type is clearly defined
			GraphTypeTableDefault = parser.param.type;
		} else { // Fall back to the setting
			GraphTypeTableDefault = o.type;
		}
		
		
		// console.log(parser);
				
		// For each tbody (Graphic Zone)
		$.each(parser.tBodySeries.series, function(){
			
		
			//
			// Determine Type of Graph, if "2d axis graph" or "Circle Graph"
			//
			var nb2dAxisGraph = 0;
			var Series2dAxis = [];
			
			var nbCircleGraph = 0;
			var SeriesCircle = [];
			
			
			
			// Get the default Graph Type [Table Level]
			var GraphTypeTBody = 'line'; // Default of the Param default
			if(parser.param.type){ // Overide the default if the type is clearly defined
				GraphTypeTBody = parser.param.type;
			}
			// Get the default Graph Type [Tbody Level]
			if(this.param.graph){ // Check for table defined param
				GraphTypeTBody = this.param.graph;
			}

			
			
			
			// Check for Series Definied Graph [Row level or Serie level]
			var LastHeaderId = -1;
			var SeriesCellCumulative = [];
			var PreviousGraphType = GraphTypeTBody;
			var PreviousGraphGroup = '';
			var PreviousParam = {};
			var PreviousHeading = {};
			
			var SerieCells = [];
			var fullSerieRejected = true;
			
			$.each(this.series, function(){
				if(this.cellHeading.length == 0){
					this.isRejected = true;
				}
				if(!this.isRejected){
					fullSerieRejected = false;
					
					var isCumulative = false;
					
					// Get the param for the appropriate designer heading level
					var SerieObj = {}
					
					if(this.cellHeading.length > DesignerHeadingLevel){
						// This implicate data cumulation for the series grouping
						SerieObj = this.cellHeading[DesignerHeadingLevel];
						
						
						if(LastHeaderId == SerieObj.id){
							SeriesCellCumulative.push(jQuery.extend(true, {}, SerieObj));
						} else {
							// Compile the series
							var MasterSeriesCell = [];
							
							// Sum of each cell for each series
							$.each(SeriesCellCumulative, function(){
								for(i=0; i<this.cell.length; i++){
									
									if(MasterSeriesCell.length <= i){
										MasterSeriesCell.push(this.cell[i]);
									} else {
										MasterSeriesCell[i] += this.cell[i];
									}
								}
							});
							
							// Get the average
							for(i=0; i<MasterSeriesCell.length; i++){
								MasterSeriesCell[i] = MasterSeriesCell[i]/SeriesCellCumulative.length;
							}
							
							
							if(PreviousGraphGroup=='2daxis'){
								
								var seriesObj={
									cell: MasterSeriesCell,
									type: PreviousGraphType,
									param: PreviousParam,
									header: PreviousHeading
								};
								
								Series2dAxis.push(seriesObj);
							} else if(PreviousGraphGroup=='cicle'){
								var seriesObj={
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
						if(PreviousGraphGroup=='2daxis'){
							var seriesObj={
								cell: SerieCells,
								type: PreviousGraphType,
								param: PreviousParam,
								header: PreviousHeading
							};
							
							Series2dAxis.push(seriesObj);
						} else if(PreviousGraphGroup=='cicle'){
							var seriesObj={
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
					
					
					var GraphType = '';
					if(SerieObj.param.type){
						GraphType = SerieObj.param.type;
					} else {
						GraphType = GraphTypeTBody;
					}
					
					
					
					if(GraphType == 'bar' || GraphType == 'stacked' || GraphType == 'line' || GraphType == 'area'){
						nb2dAxisGraph ++;
						PreviousGraphGroup = '2daxis';
						PreviousGraphType = GraphType;
					} else if(GraphType == 'pie'){
						nbCircleGraph ++;
						PreviousGraphGroup = 'cicle';
						PreviousGraphType = GraphType;
					} else {
						// Not suppose to happen, TODO later do something in case of....
					}
					
					LastHeaderId = SerieObj.id;
				
				}
			});
			
			
			
			
			var MasterSeriesCell = [];

			
			// Sum of each cell for each series
			$.each(SeriesCellCumulative, function(){
				for(i=0; i<this.cell.length; i++){
					
					if(MasterSeriesCell.length <= i){
						MasterSeriesCell.push(this.cell[i]);
					} else {
						MasterSeriesCell[i] += this.cell[i];
					}
				}
			});
			
			
			
			// Get the average
			for(i=0; i<MasterSeriesCell.length; i++){
				MasterSeriesCell[i] = MasterSeriesCell[i]/SeriesCellCumulative.length;
			}
			
			
			
			if(MasterSeriesCell.length != 0){
				SerieCells = MasterSeriesCell;
			}
			
			
			if(PreviousGraphGroup=='2daxis'){
				var seriesObj={
					cell: SerieCells,
					type: PreviousGraphType,
					param: PreviousParam,
					header: PreviousHeading
				};
				
				Series2dAxis.push(seriesObj);
			} else if(PreviousGraphGroup=='cicle'){
				var seriesObj={
					cell: SerieCells,
					type: PreviousGraphType,
					param: PreviousParam,
					header: PreviousHeading
				};
				
				SeriesCircle.push(seriesObj);
			}
			
			
			
			var Group2dSeriesObj = {
				heading: parser.tBodySeries.ColHeading,
				nbRowLevel: parser.tBodySeries.nbRowLevel,
				nbColLevel: parser.tBodySeries.nbColLevel,
				series: Series2dAxis
			};
			var GroupCircleSeriesObj = {
				heading: parser.tBodySeries.ColHeading,
				nbRowLevel: parser.tBodySeries.nbRowLevel,
				nbColLevel: parser.tBodySeries.nbColLevel,
				series: SeriesCircle
			};
			
			
			if(Group2dSeriesObj.series.length > 0){
				// console.log(parser);
				// console.log(Group2dSeriesObj);
				
				// Initiate the Graph zone
				charts.graph2dAxis.init(Group2dSeriesObj, o);
			}
			
			
			if(GroupCircleSeriesObj.series.length > 0){
				// Initiate the Graph Circle zone
				charts.circleGraph.init(GroupCircleSeriesObj, o);
			}
	
			// Create a container next to the table (Use Section for an HTML5 webpage)
			// TODO: do something if the person have specified the container
			// var paperContainer = (container || $('<div style="margin-top:10px; margin-bottom:10px" \/>').insertAfter(self));
			
			
			
			
			// var paperContainer = $('<div style="margin-top:10px; margin-bottom:10px" \/>').insertAfter(parser.sourceTblSelf);
			var paperContainer = $('<figure />').insertAfter(parser.sourceTblSelf);
			
			// $(paperContainer).addClass(
			
			// Set the width of the container
			$(paperContainer).width(o.width + o.widthPadding);
			
			//
			// Add the container class
			//
			$(paperContainer).addClass(o["default-namespace"]);
			
			
			
			// Set the container class if required, by default the namespace is use as a class
			if(parser.param.graphclass){
				if($.isArray(parser.param.graphclass)){
					for(i=0;i<parser.param.graphclass.length;i++){
						$(paperContainer).addClass(parser.param.graphclass[i]);
					}
				} else {
					$(paperContainer).addClass(parser.param.graphclass);
				}
			} 
			
			
			
			// console.log(parser.param);
			
			
			
			// Create the drawing object
			var paper;
			
			var tableHtmlCaption = $('caption', parser.sourceTblSelf).html();
			
			
			if(GroupCircleSeriesObj.series.length == 1 && GroupCircleSeriesObj.series[0].header.rawValue == tableHtmlCaption){
				
				// Use only one container, sub-container are not required
				
				paper = [];
				var lstpaperSubContainer = [];
				
				lstpaperSubContainer.push(paperContainer);
				
				
				var subPaper = Raphael($(paperContainer).get(0), charts.circleGraph.width, charts.circleGraph.height);
				
				paper.push(subPaper);
				
				charts.circleGraph.generateGraph(lstpaperSubContainer, paper);
				
			} else if(GroupCircleSeriesObj.series.length > 0){
			
				// For the circle Graph, use Separate Paper for each Series, that would fix a printing issue (graph cutted when printed)
				paper = [];
				var lstpaperSubContainer = [];
				
				$.each(GroupCircleSeriesObj.series, function(){
					// var subContainer = $(paperContainer).append('<div />');
				
			
					// Add the caption for the series
					var serieCaption = $('<figcaption />');
					
					// 
					
					$(serieCaption).append(this.header.rawValue); // Set the caption text
					// var serieCaptionID = 'graphcaption' + paper.length + new Date().getTime(); // Generate a new ID
					// $(serieCaption).attr('id', serieCaptionID); // Add the new ID to the title
					
				
					
					// var subContainer = $('<div />');
					var subContainer = $('<figure />');
					
					$(paperContainer).append(subContainer);
					
					lstpaperSubContainer.push(subContainer);
					
					//
					// Amélioré l'accessibility avec l'images
					//

					// $(subContainer).attr('role', 'img'); // required if is a div element
					//$(subContainer).attr('aria-labelledby', serieCaptionID);


					var subPaper = Raphael($(subContainer).get(0), charts.circleGraph.width, charts.circleGraph.height);
					
					// Add the caption
					$(serieCaption).prependTo($(subContainer));
					
					// $(serieCaption).insertBefore($(subPaper));
					//$(paperContainer).append(serieCaption);
					
					paper.push(subPaper);
					
					
					// charts.circleGraph.generateGraph(subContainer, subPaper);
					
				});
				
				charts.circleGraph.generateGraph(lstpaperSubContainer, paper);
				// charts.circleGraph.generateGraph(paperContainer, paper);
			}
			
			
			
			if(Group2dSeriesObj.series.length > 0){
				paper = Raphael($(paperContainer).get(0), o.width, o.height);
				charts.graph2dAxis.generateGraph(paperContainer, paper);
				// Use the viewBox to set the zoom function
				// paper.setViewBox(0,0,4000,o.height,true);
			}
			
			
	
			

			
			
			
			//
			// Add the Graph Title and Make it Accessible
			//
			
			// Get the VML or SVG tag and/or object
			
			
			if(!fullSerieRejected){
				// var paperDOM = $(paperContainer).children();

				
				
				// Create the Graph Caption
				var graphTitle = $('<figcaption />')
				// Transpose any inner element
				$(graphTitle).append(tableHtmlCaption);

				// Set the Graph Title
				if(parser.param.endcaption){
					$(paperContainer).append(graphTitle); // Put the caption at the end
				} else {
					$(paperContainer).prepend(graphTitle); // Default
				}
				
				
				var setAccessiblity = function(){
					
					// Generate a unique id for the Graph Title
					// var TitleID = 'graphtitle'+ new Date().getTime(); // Generate a new ID
					// $(graphTitle).attr('id', TitleID); // Add the new ID to the title
					
					// Check if the source Table have an id, if not generate a new one
					
					var tblId = $(parser.sourceTblSelf).attr('id');
					if(tblId == undefined || tblId == ''){
						tblId = 'graphsource'+ new Date().getTime(); // Generate a new ID
						$(parser.sourceTblSelf).attr('id', tblId); // Add the new ID to the table
					}
					
					// $(paperContainer).attr('role', 'img'); This are not needed because the Container are set to Figure element
					// $(paperContainer).attr('aria-labelledby', TitleID);
					$(paperContainer).attr('aria-describedby', tblId);

					//console.log(charts.graph2dAxis.paperDOM);
					
					// $(paperDOM).attr('role', 'presentation');
					// $(charts.graph2dAxis.legendContainer).attr('role', 'presentation');
					
				};

				// Make the graph Accessible
				setAccessiblity();
				
				if(!parser.param.noenhancement){
					var tblSrcContainer = $('<details />').appendTo(paperContainer);
					var tblSrcContainerSummary = $('<summary />');
					$(tblSrcContainerSummary).text(pe.dic.get('%table-source')) // Text for the ability to show the table as a data source
							.appendTo(tblSrcContainer)
							.after(self); 
					
					// Make this new details elements working
					if (typeof tblSrcContainer.open === "undefined") {
						// We need to run the pollyfill for this new details elements
						$(tblSrcContainer).details();
					}
				}
				
				
			} else {
				// Destroy the paper container
				$(paperContainer).remove();
			}
			
			
			
			// Create the Drawing Zone
			
			// Draw the graphic
			
			
			// console.log(SeriesCircle);
			
			// console.log(charts.graph2dAxis);
			

			
		});
				
		
		// var graphTableENDTime = new Date().getTime(); 
		// console.log('Table Graphed END exec time ' + graphTableENDTime);
		// console.log('Elapsed : ' + (graphTableENDTime - graphTableParsedTime));
		
		
		// designer.init();
		
		
		
		
		


	
	// console.log(parser);
	
	// The graphic are draw, hide if requested the source table
	/*if(parser.param.hide){
		parser.sourceTblSelf.hide();
	}*/
        } // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));
