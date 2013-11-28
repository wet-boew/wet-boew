/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Charts and Graph
 * @overview Draw charts
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 *
 */
(function ( $, window, vapour ) {
"use strict";


/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var wet_boew_charts,
	selector = ".wb-charts",
	$document = vapour.doc,

	/*
	 * Main Entry function to create the charts
	 * @method createCharts
	 * @param {jQuery DOM element} $elm table element use to create the chart
	 */
	createCharts = function ( $elm ) {
		var allSeries = [],
			calcTick = [],
			dataSeries = [],
			i18n = window.i18n,
			isPieChart,
			nbBarChart = 0,
			options = {},
			pieChartLabelText = "",
			self = $elm,
			smallestHorizontalFlotDelta,
			smallestVerticalFlotDelta,
			srcTbl = self,
			tblMultiplier = [],
			valueCumul = 0,
			$imgContainer, $placeHolder, $subfigCaptionElem, $subFigureElem,
			graphClassLength, graphClassLength2, barDelta, cellValue,
			datacolgroupfound, dataGroup, figCaptionElem, figureElem, header,
			horizontalCalcTick, i, j, mainFigureElem, parsedData,
			pieLabelFormater, pieOptions, plotParameter, rIndex,
			rowDefaultOptions, rowOptions, tblCaptionHTML, tblCaptionText,
			tblSrcContainer, tblSrcContainerSummary, tdOptions, uniformCumul,
			useHeadRow, valuePoint, verticalCalcTick,
			currentRowGroup, currentRowGroupRow, reverseTblParsing, dataGroupVector,
			dataCell;

		// Function to Convert Class instance to JSON
		function setClassOptions ( sourceOptions, strClass, namespace ) {
			var autoCreate = false,
				arrayOverwrite = false,
				autoCreateMe = false,
				detectedNamespaceLength, arrClass, arrParameter, arrParameters,
				arrValue, i, iLength, j, jsonString,
				m, mLength, parameter, val, propName, propValue;
				
			// Test: optSource
			if ( typeof sourceOptions !== "object" ) {

				// Empty source
				return {};
			}

			// Get a working copy for the sourceOptions
			sourceOptions = $.extend( true, {}, sourceOptions );

			// Test: strClass
			if ( typeof strClass !== "string" || strClass.length === 0 ) {
				// no string class;
				return sourceOptions;
			} else if ( typeof namespace !== "string" || namespace.length === 0 ) {

				// Try to get the default namespace
				if ( sourceOptions[ "default-namespace" ] &&
					( typeof sourceOptions[ "default-namespace" ] === "string" ) ) {
					namespace = sourceOptions[ "default-namespace" ];
				} else {
					// This a not a valid namespace (no namespace)
					return sourceOptions;
				}
			}

			if (namespace.length > 0) {
				namespace = namespace + "-";
			}
			detectedNamespaceLength = namespace.length;

			// Check if the the Auto Json option creation are authorized from class
			// Espected returning value True | False
			autoCreate = !!sourceOptions[ "default-autocreate" ];

			arrClass = strClass.split( " " ); // Get each defined class
			for ( m = 0, mLength = arrClass.length; m < mLength; m +=1 ) {
				parameter = arrClass[m];

				// Get the parameter without the namespace
				arrParameters = parameter.slice( detectedNamespaceLength ).split( "-" );

				// Is the parameter are in scope, if not just skip me
				if ( !arrParameters.length || parameter.slice( 0, detectedNamespaceLength ) !== namespace ) {
					continue;
				}

				// Get the name of the parameter
				propName = arrParameters[ 0 ];
				iLength = arrParameters.length;

				// If only One parameter
				if (iLength === 1 && (sourceOptions[ propName + "-autocreate" ] ||
								( sourceOptions[ propName ] &&
								sourceOptions[ propName + "-typeof" ] &&
								sourceOptions[ propName + "-typeof" ] === "boolean" ))) {
					// The parameter is boolean value
					arrParameters.push("true");
				} else if (iLength === 1 && (sourceOptions.preset && sourceOptions.preset[ propName ]) ) {
					// Apply a predefined preset
					sourceOptions = $.extend( true, sourceOptions, sourceOptions.preset[ propName ] );
					continue;
				} else if (iLength === 1) {
					// Use the default option
					arrParameters.push(propName);
					arrParameters[ 0 ] = sourceOptions[ "default-option" ];
				}

				// two parameter & more
				if (arrParameters.length === 2) {

					propName = arrParameters[ 0 ];
					propValue = arrParameters[ 1 ];

					// test the kind of value that propName is
					if (sourceOptions[ propName + "-typeof" ] ) {

						switch ( sourceOptions[ propName + "-typeof" ] ) {
						case "boolean":
							// Test the textual value used the CSS Option
							if ( propValue === "true" || propValue === "vrai" || propValue === "yes" || propValue === "oui" ) {
								propValue = true;
							} else if ( propValue === "false" || propValue === "faux" || propValue === "no" || propValue === "non") {
								propValue =  false;
							} else {
								propValue = undefined;
							}
							break;
						case "number":
							if ( !isNaN( parseInt( propValue, 10 ) ) ) {
								propValue = parseInt( propValue, 10 );
							} else {
								propValue = undefined;
							}
							break;
						case "string":
							// Repair the value if needed
							if (i < iLength - 1) {
								arrValue = [];
								for ( j = i + 1; j < iLength; j += 1 ) {
									arrValue.push( arrParameters[ j ] );
								}
								propValue = arrValue.join( "-" );
							}
							break;
						case "color":
							if ( !isNaN( parseInt( propValue, 16 ) ) ) {
								propValue = "#" + propValue; // Add the pound sign for 0x number
							}
							break;
						case "undefined":
						case "function":
						case "locked":
							propValue = undefined;
							break;
						}
					}
					
					// We do not overwrite any option when there is no value
					if (propValue === undefined) {
						break;
					}
					
					// Get the type of overwritting, default are replacing the value
					arrayOverwrite = !!sourceOptions[ propName + "-array-mode" ];

					// Check if this unique option can be autocreated
					autoCreateMe = !!sourceOptions[ propName + "-autocreate" ];
					
					// Overwride the value
					if ( sourceOptions[propName] && arrayOverwrite ) {
						// Already one object defined and array overwriting authorized
						if ( $.isArray( sourceOptions[ propName ] ) ) {
							sourceOptions[ propName ].push( arrParameter );
						} else {
							val = sourceOptions[ propName ];
							sourceOptions[ propName ] = [];
							sourceOptions[ propName ].push( val );
							sourceOptions[ propName ].push( arrParameter );
						}
					} else if ( sourceOptions[ propName ] || autoCreate || autoCreateMe ) {

						// Set the value by extending the options
						jsonString = "";
						if ( typeof propValue === "boolean" || typeof propValue === "number" ) {
							jsonString = "{\"" + propName + "\": " + propValue + "}";
						} else {
							jsonString = "{\"" + propName + "\": \"" + propValue + "\"}";
						}
						sourceOptions = $.extend( true, sourceOptions, $.parseJSON( jsonString ) );
					}
				} else {
					for ( i = 1; i < iLength; i += 1 ) {
						
						// Create a sub object
						if ( arrParameter !== undefined && sourceOptions[ arrParameter ] ) {
							// The object or property already exist, just get the reference of it
							sourceOptions = sourceOptions[ arrParameter ];
							propName = arrParameter;
						} else if ( ( autoCreate || autoCreateMe ) && arrParameter !== undefined ) {
							jsonString = "{\"" + arrParameter[i] + "\": {}}";
							sourceOptions = $.extend( true, sourceOptions, $.parseJSON( jsonString ) );
							sourceOptions = sourceOptions[ arrParameter ];
						} else {
							// This configuration are rejected
							// We don't iterate again
							i = iLength;
						}

					}
				}
			}
			return sourceOptions;
		}


		if ( !window.chartsGraphOpts ){
			// 1. Charts Default Setting
			options = {
				"default-namespace": "wb-charts",

				// This adds the ability to set custom css class to the figure container.
				"graphclass-autocreate": true,
				"graphclass-array-mode": true,
				"graphclass-typeof": "string",
				"noencapsulation-autocreate": true,
				"noencapsulation-typeof": "boolean",

				// Colors - Accent Profile (Defaults)
				"colors-typeof": "color",
				"colors-array-mode": true,
				"colors": ["#8d201c",
						"#EE8310",
						"#2a7da6",
						"#5a306b",
						"#285228",
						"#154055",
						"#555555",
						"#f6d200",
						"#d73d38",
						"#418541",
						"#87aec9",
						"#23447e",
						"#999999"],

				// Force to have an uniform tick
				uniformtick: true,
				"uniformtick-typeof": "boolean",
				"uniformtick-autocreate": true,

				// Force to use which row in the thead for the label
				"labelposition-typeof": "number",
				"labelposition-autocreate": true,

				// Legend Management
				"legendinline-typeof": "boolean",
				"legendinline-autocreate": true,
				"nolegend-typeof": "boolean",
				"nolegend-autocreate": true,
				"percentlegend-typeof": "boolean",
				"percentlegend-autocreate": true,

				// Force the Top and Bottom Value for a graph
				"topvalue-autocreate": true,
				"topvalue-typeof": "number",
				"topvaluenegative-autocreate": true,
				"topvaluenegative-typeof": "boolean",
				"bottomvalue-autocreate": true,
				"bottomvalue-typeof": "number",
				"bottomvaluenegative-autocreate": true,
				"bottomvaluenegative-typeof": "boolean",

				// Ticks => Number of ticks for the y-axis
				"ticks-autocreate": true,
				"ticks-typeof": "number",

				// Pie chart option
				// set a decimal precision
				"decimal-autocreate": true,
				"decimal-typeof": "number",
				"pieradius": 100, // Pie radius
				"pieradius-typeof": "number",
				"pielblradius": 100, // Pie label radius
				"pielblradius-typeof": "number",
				"piethreshold-autocreate": true, // Hides the labels of any pie slice that is smaller than the specified percentage (ranging from 0 to 100)
				"piethreshold-typeof": "number",
				"pietilt-autocreate": true, // Percentage of tilt ranging from 0 and 100, where 100 has no change (fully vertical) and 0 is completely flat (fully horizontal -- in which case nothing actually gets drawn)
				"pietilt-typeof": "number",
				"pieinnerradius-autocreate": true, // Sets the radius of the donut hole. If value is between 0 and 100 (inclusive) then it will use that as a percentage of the radius, otherwise it will use the value as a direct pixel length.
				"pieinnerradius-typeof": "number",
				"piestartangle-autocreate": true, // Factor of PI used for the starting angle (in radians) It can range between 0 and 200 (where 0 and 200 have the same result).
				"piestartangle-typeof": "number",
				"piehighlight-autocreate": true, // Opacity of the highlight overlay on top of the current pie slice. (Range from 0 to 100) Currently this just uses a white overlay, but support for changing the color of the overlay will also be added at a later date.
				"piehighlight-typeof": "number",
				"piehoverable-autocreate": true, // Hoverable pie slice
				"piehoverable-typeof": "boolean",

				// General option: Default CSS Options
				"default-option": "type",

				// Graph Type: this be one of or an array of: area, pie, line, bar, stacked
				type: "bar",
				"type-autocreate": true,

				//
				// Graph Layout
				//

				// width of canvas - defaults to table height
				width: $elm.width(),
				"width-typeof": "number",

				// height of canvas - defaults to table height
				height: $elm.height(),
				"height-typeof": "number",

				//
				// Data Table and Graph Orientation
				//

				// which direction to parse the table data
				parsedirection: "x",
				"parsedirection-typeof": "string",
				"parsedirection-autocreate": true,

				// Parameter: elem = HTML DOM node (td element)
				//
				// If this function return an array, it would be assume that the first item correspond at the cell numbered value and the second item correspond at the cell unit
				// Example
				// return 25.14
				// return 44
				// return [44, "%"]
				// return [5.1, "g"]
				getcellvalue: function( elem ) {

					// Default Cell value extraction
					var cellRawValue = $.trim( $( elem ).text() ).replace( /\s/g, "" );

					return [ parseFloat( cellRawValue.match( /[\+\-0-9]+[0-9,\. ]*/ ) ), cellRawValue.match (/[^\+\-\.\, 0-9]+[^\-\+0-9]*/ ) ];
				},
				preset: {
					donnut: {
						// Donnut setting
						type: "pie",
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
						getcellvalue: function( elem ) {
							var raw = $.trim( $( elem ).text() ).replace( /,/g, "" );
							return [ parseFloat( raw.match( /[\+\-0-9]+[0-9,\. ]*/ ) ), raw.match( /[^\+\-\.\, 0-9]+[^\-\+0-9]*/ ) ];
						}
					},
					germannumber: {
						getcellvalue: function( elem ) {
							var raw = $.trim( $( elem ).text() ).replace( /\./g, "" );
							return [ parseFloat( raw.match( /[\+\-0-9]+[0-9,\. ]*/ ) ), raw.match( /[^\+\-\.\, 0-9]+[^\-\+0-9]*/ ) ];
						}
					}
				}
			};

			// 2. Global "setting.js"
			if ( wet_boew_charts !== undefined ) {

				// a. if exisit copy and take care of preset separatly (Move away before extending)
				if ( wet_boew_charts.preset ) {
					window.chartsGraphOpts = $.extend( true, {}, wet_boew_charts.preset );
					delete wet_boew_charts.preset;
				}

				// b. Overwrite the chart default setting
				$.extend( true, options, wet_boew_charts );

				// c. Separatly extend the preset to at the current chart default seting
				if ( window.chartsGraphOpts ) {
					$.extend( true, options.preset, window.chartsGraphOpts );
				}
			}

			// ---- Save the setting here in a case of a second graphic on the same page
			window.chartsGraphOpts = options;
		}
		options = window.chartsGraphOpts;
		options.height = $elm.height();
		options.width = $elm.width();

		// Fix default width and height in case the table is hidden.
		options.width = options.width | 250;
		options.height = options.height | 250;

		// 3. [Table element] CSS Overwrite - [Keep a list of required plugin "defaultnamespace-plugin" eg. wb-charts-donnut]
		options = setClassOptions( options, self.attr( "class" ) || "" );

		// 4. [Table element] HTML5 Data Overwrite property
		for ( i in self.data() ) {
			// Check if the prefix "wbcharts" is used
			if ( i.slice( 0, 8 ) === "wbcharts" ) {
				options[ i.slice( 8 ) ] = self.data()[ i ];
			}
		}

		// 5. Load the requested preset
		// a. If the preset are a string => Use that as an url where it could find the setting
		// ---- Keep the url and his content for future reference for example second chart.
		// b. If the preset are an object => Overwrite the default.

		function calculateVerticalTick( parsedData ) {

			// Get the appropriate ticks
			var parsedDataCell, i, totalRowValue,
			nbCells = 0,
			headerlevel = 0,
			cumulFlotValue = 0;

			tblMultiplier = [];

			if ( !parsedData.colgrouphead ) {
				return;
			}

			for ( i = 0; i < parsedData.colgrouphead.col[ 0 ].cell.length; i += 1 ) {

				parsedDataCell = parsedData.colgrouphead.col[ 0 ].cell[ i ];

				if ( i === 0 || ( i > 0 && parsedData.colgrouphead.col[ 0 ].cell[ i - 1 ].uid !== parsedDataCell.uid ) ) {

					if ( parsedDataCell.rowgroup && parsedDataCell.rowgroup.type === 3 ) {
						// We only process the first column data group
						break;
					}

					if ( parsedDataCell.type === 1 || parsedDataCell.type === 7 ) {
						nbCells += 1;

						if ( parsedDataCell.child.length > 0 ) {
							headerlevel = calcVTick( parsedDataCell, headerlevel );
						}
					}
				}
			}

			tblMultiplier.push([
				nbCells,
				headerlevel
			]);

			totalRowValue = tblMultiplier[ 0 ][ 0 ];

			for ( i = 1; i < tblMultiplier.length; i += 1 ){
				totalRowValue = totalRowValue * tblMultiplier[ i ][ 0 ];
			}


			//
			// Get the tick
			//
			// From an option that would choose the appropriate row.
			// useHeadRow get a number that represent the row to use to draw the label

			useHeadRow = parsedData.colgrouphead.col.length - 1;

			calcTick = [];

			headerlevel = 0;
			// Set the associate tick value along with the headers
			for ( i = 0; i < parsedData.colgrouphead.col[ 0 ].cell.length; i += 1 ) {

				parsedDataCell = parsedData.colgrouphead.col[ 0 ].cell[ i ];

				if ( i === 0 || ( i > 0 && parsedData.colgrouphead.col[ 0 ].cell[ i - 1 ].uid !== parsedDataCell.uid ) ){

					if ( parsedDataCell.rowgroup && parsedDataCell.rowgroup.type === 3 ) {
						// We only process the first column data group
						break;
					}

					if ( parsedDataCell.type === 1 || parsedDataCell.type === 7 ) {

						parsedDataCell.flotDelta = ( totalRowValue / nbCells );


						if ( !smallestVerticalFlotDelta || parsedDataCell.flotDelta < smallestVerticalFlotDelta ){
							smallestVerticalFlotDelta = parsedDataCell.flotDelta;
						}

						cumulFlotValue += parsedDataCell.flotDelta;

						parsedDataCell.flotValue = cumulFlotValue;
						if ( headerlevel === useHeadRow ||
							( ( parsedDataCell.colpos - 1 < useHeadRow ) && ( useHeadRow <= parsedDataCell.colpos + parsedDataCell.width - 2 ) ) ) {
							calcTick.push([
								parsedDataCell.flotValue - parsedDataCell.flotDelta,
								$( parsedDataCell.elem ).text()
							]);
						}

						if ( parsedDataCell.child.length > 0 ){
							helper2CalcVTick( parsedDataCell, headerlevel );
						}
					}
				}
			}
			return calcTick;

			// Determine an appropriate tick for the colgroup head (first colgroup)
			function calcVTick( parsedDataCell, headerlevel ) {
				var childLength, kIndex;

				headerlevel += 1;
				tblMultiplier.push( [ parsedDataCell.child.length, headerlevel ] );
				for ( kIndex = 0, childLength = parsedDataCell.child.length; kIndex < childLength; kIndex += 1 ) {
					if ( parsedDataCell.child[ kIndex ].child.length > 0 ){
						headerlevel = calcVTick( parsedDataCell.child[ kIndex ], headerlevel );
					}
				}
				return headerlevel - 1;
			}

			function helper2CalcVTick( parsedDataCell, headerlevel ) {
				var internalCumul = parsedDataCell.flotValue - parsedDataCell.flotDelta,
					kIndex, flotDelta;

				headerlevel += 1;

				flotDelta = parsedDataCell.flotDelta / parsedDataCell.child.length;
				if ( !smallestVerticalFlotDelta || flotDelta < smallestVerticalFlotDelta ) {
					smallestVerticalFlotDelta = flotDelta;
				}
				for ( kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1 ) {
					parsedDataCell.child[ kIndex ].flotDelta = flotDelta;
					internalCumul = internalCumul + flotDelta;
					parsedDataCell.child[ kIndex ].flotValue = internalCumul;

					if ( headerlevel === useHeadRow ) {
						calcTick.push([
							parsedDataCell.child[ kIndex ].flotValue - flotDelta,
							$( parsedDataCell.child[ kIndex ].elem ).text()
						]);
					}
					if ( parsedDataCell.child[ kIndex ].child.length > 0 ){
						helper2CalcVTick( parsedDataCell.child[ kIndex ], headerlevel );
					}
				}
				headerlevel -= 1;
			}
		}

		// Determine an appropriate tick for the rowgroup head (thead)
		function calculateHorisontalTick( parsedData ) {
			// Find the range of the first data colgroup
			var dataColgroupStart = -1,
				dataColgroupEnd = -1,
				nbCells = 0,
				parsedDataCell,
				nbTotSlots = 0,
				headerlevel = 0,
				cumulFlotValue = 0,
				i, totalRowValue;

			if ( !parsedData.theadRowStack ) {
				return;
			}

			for ( i = 0; i < parsedData.colgroup.length; i += 1 ) {
				if ( parsedData.colgroup[ i ].type === 2 ){
					dataColgroupStart = parsedData.colgroup[ i ].start;
					dataColgroupEnd = parsedData.colgroup[ i ].end;
					break;
				}
			}

			// Get the appropriate ticks
			tblMultiplier = [];
			for ( i = 0; i < parsedData.theadRowStack[ 0 ].elem.cells.length; i += 1 ) {

				parsedDataCell = $( parsedData.theadRowStack[ 0 ].elem.cells[ i ] ).data().tblparser;

				if ( parsedDataCell.colgroup && parsedDataCell.colgroup.type === 3 ) {
					// We only process the first column data group
					break;
				}

				if ( parsedDataCell.colpos >= dataColgroupStart && ( parsedDataCell.type === 1 || parsedDataCell.type === 7 ) ) {
					nbCells += 1;

					nbTotSlots += parsedDataCell.width;

					helper1CalcHTick( parsedDataCell, headerlevel );
				}
			}
			tblMultiplier.push( [ nbCells, headerlevel ] );

			totalRowValue = tblMultiplier[ 0 ][ 0 ];

			for ( i = 1; i < tblMultiplier.length; i += 1 ){
				totalRowValue = totalRowValue * tblMultiplier[ i ][ 0 ];
			}

			//
			// Get the tick
			//
			// From an option that would choose the appropriate row.
			// useHeadRow get a number that represent the row to use to draw the label

			useHeadRow = ( !options.labelposition || ( options.labelposition && options.labelposition > parsedData.theadRowStack.length ) ? parsedData.theadRowStack.length : options.labelposition ) - 1;

			calcTick = [];

			uniformCumul = 0;

			headerlevel = 0;
			// Set the associate tick value along with the headers
			for ( i = 0; i < parsedData.theadRowStack[ 0 ].elem.cells.length; i += 1 ) {

				parsedDataCell = $( parsedData.theadRowStack[ 0 ].elem.cells[ i ]).data().tblparser;

				if ( parsedDataCell.colgroup && parsedDataCell.colgroup.type === 3 ) {
					// We only process the first column data group
					break;
				}

				if ( parsedDataCell.colpos >= dataColgroupStart && ( parsedDataCell.type === 1 || parsedDataCell.type === 7 ) ) {

					parsedDataCell.flotDelta = !options.uniformtick ? ( totalRowValue / nbCells ) : 1;


					if ( !smallestHorizontalFlotDelta || parsedDataCell.flotDelta < smallestHorizontalFlotDelta ){
						smallestHorizontalFlotDelta = parsedDataCell.flotDelta;
					}
					parsedDataCell.flotValue = cumulFlotValue;

					if ( headerlevel === useHeadRow || ( ( parsedDataCell.rowpos - 1 ) < useHeadRow && useHeadRow <= ( ( parsedDataCell.rowpos - 1 ) + ( parsedDataCell.height - 1 ) ) ) ) {
						calcTick.push( [ ( !options.uniformtick ? cumulFlotValue : uniformCumul ), $( parsedDataCell.elem ).text() ] );
					}

					if ( headerlevel === ( parsedData.theadRowStack.length - 1 ) ||

						( ( parsedDataCell.rowpos - 1 ) < ( parsedData.theadRowStack.length - 1 ) &&
						( parsedData.theadRowStack.length - 1 ) <= ( ( parsedDataCell.rowpos - 1 ) + ( parsedDataCell.height - 1 ) ) ) ||

						( parsedData.theadRowStack.length - 1 ) === ( ( parsedDataCell.rowpos - 1 ) + ( parsedDataCell.height - 1 ) ) ){

						uniformCumul += parsedDataCell.flotDelta;

					}

					cumulFlotValue += parsedDataCell.flotDelta;

					helper2CalcHTick( parsedDataCell, headerlevel );
				}
			}
			return calcTick;
			function helper1CalcHTick( parsedDataCell, headerlevel ) {
				var kIndex;
				if ( parsedDataCell.child.length === 0 ) {
					return;
				}
				headerlevel += 1;
				tblMultiplier.push( [ parsedDataCell.child.length, headerlevel ] );
				for ( kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1 ) {
					helper1CalcHTick( parsedDataCell.child[ kIndex ], headerlevel );
				}
				headerlevel -= 1;
			}


			function helper2CalcHTick( parsedDataCell, headerlevel ) {
				var kIndex, flotDelta,
					internalCumul = 0,
					theadRowStackLength = parsedDataCell.groupZero.theadRowStack.length - 1;
				if ( parsedDataCell.child.length === 0 ) {
					return;
				}
				headerlevel += 1;

				internalCumul = parsedDataCell.flotValue;

				flotDelta = !options.uniformtick ? ( parsedDataCell.flotDelta / parsedDataCell.child.length ) : 1;
				if ( !smallestHorizontalFlotDelta || flotDelta < smallestHorizontalFlotDelta ) {
					smallestHorizontalFlotDelta = flotDelta;
				}
				for ( kIndex = 0; kIndex < parsedDataCell.child.length; kIndex += 1 ) {
					parsedDataCell.child[ kIndex ].flotDelta = flotDelta;

					if ( headerlevel === useHeadRow ) {
						calcTick.push([
							!options.uniformtick ?
								internalCumul :
								uniformCumul,
							$( parsedDataCell.child[ kIndex ].elem ).text()
						]);
					}

					if ( headerlevel === theadRowStackLength ||
						( ( parsedDataCell.rowpos - 1 ) < theadRowStackLength &&
						theadRowStackLength <= ( ( parsedDataCell.rowpos - 1 ) + ( parsedDataCell.height - 1 ) ) ) ||
						theadRowStackLength === ( ( parsedDataCell.rowpos - 1 ) + ( parsedDataCell.height - 1 ) ) ) {

						uniformCumul += flotDelta;
					}

					parsedDataCell.child[ kIndex ].flotValue = internalCumul;
					internalCumul = internalCumul + flotDelta;

					helper2CalcHTick( parsedDataCell.child[ kIndex ], headerlevel );
				}
				headerlevel -= 1;
			}
		}

		// Retrieve the parsed data
		parsedData = $( self ).data().tblparser;

		if ( options.parsedirection === "y" ) {
			reverseTblParsing = true;
		}


		rowDefaultOptions = {
			"default-option": "type", // Default CSS Options
			"default-namespace": "wb-charts",
			"type-autocreate": true,
			"color-typeof": "color",
			"color-autocreate": true
		};

		//
		// Calculate the tick for a table where x is horizontal
		//
		horizontalCalcTick = calculateHorisontalTick( parsedData );

		//
		// Reverse the axis for the data table
		//
		verticalCalcTick = calculateVerticalTick( parsedData );

		currentRowGroup = parsedData.lstrowgroup[ 0 ];

		if ( options.type === "pie" ) {
			// Use Reverse table axes
			// Create a chart/ place holder, by series
			mainFigureElem = $( "<figure />" ).insertAfter( srcTbl );

			pieLabelFormater = function ( label, series ) {
				var textlabel;
				if ( !options.decimal ) {
					textlabel = Math.round( series.percent );
				} else {
					textlabel = Math.round( series.percent * Math.pow( 10, options.decimal ) );
					textlabel = textlabel / Math.pow( 10, options.decimal );
				}
				if ( options.nolegend ) {
					// Add the series label
					textlabel = label + "<br/>" + textlabel;
				}
				return textlabel + "%";
			};
			// Default
			mainFigureElem.addClass("wb-charts");
			if ( options.graphclass ) {
				if ( $.isArray( options.graphclass ) ) {
					for ( i = 0, graphClassLength = options.graphclass.length; i < graphClassLength; i += 1 ) {
						mainFigureElem.addClass( options.graphclass[ i ] );
					}
				} else {
					mainFigureElem.addClass( options.graphclass );
				}
			}

			figCaptionElem = $( "<figcaption />" );

			$( mainFigureElem ).append( figCaptionElem );
			tblCaptionHTML = $( "caption", srcTbl ).html();
			tblCaptionText = $( "caption", srcTbl ).text();
			$( figCaptionElem ).append( tblCaptionHTML );

			if ( !reverseTblParsing ) {
				// If normal parsing
				dataGroup = parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ] : parsedData.colgroup[ 0 ];

				rIndex = currentRowGroup.row.length - 1;
			} else {
				// If reverse parsing
				dataGroup = currentRowGroup;
				rIndex = (parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ].col.length : parsedData.colgroup[ 0 ].col.length) - 1;
			}

			for ( rIndex; rIndex >= 0; rIndex -= 1 ) {

				dataGroupVector = !reverseTblParsing ? dataGroup.col : dataGroup.row;

				// For each row or column
				for ( i = 0; i < dataGroupVector.length; i += 1 ) {
					dataSeries = [];
					valueCumul = 0;

					// For each cells
					for( j = 0; j < dataGroupVector[ i ].cell.length; j += 1 ){
						
						dataCell = dataGroupVector[ i ].cell[ j ];
						
						// Skip the column if 
						if (reverseTblParsing && dataCell.col.type === 1) {
							continue;
						}

						// Verify if the selected cell still in the scope of a data group in his another axes (eg. row/col)
						// Verify if we are still in the same datagroup as the previous data cell
						if ( !reverseTblParsing && ( dataCell.row.type !==2  || ( j > 0 &&
								dataGroupVector[ i ].cell[ j -1 ].rowgroup.uid !== dataCell.rowgroup.uid ) ) ) {
							break;
						} else if (reverseTblParsing && ( dataCell.col.type !== 2 ) || ( j > 0 &&
								dataGroupVector[ i ].cell[ j -1 ].col.type !== 1 &&
								dataGroupVector[ i ].cell[ j -1 ].col.groupstruct.uid !== dataCell.col.groupstruct.uid ) ) {
							break;
						}

						// Get"s the value
						header = !reverseTblParsing ? dataCell.row.header : dataCell.col.header;

						cellValue = options.getcellvalue(!reverseTblParsing ? dataGroupVector[ i ].cell[ rIndex ].elem : dataGroupVector[ i ].datacell[ rIndex ].elem );

						dataSeries.push(
							[
								valueCumul,
								typeof cellValue === "object" ? cellValue[ 0 ] : cellValue
							]);

						valueCumul += header[ header.length - 1 ].flotDelta;

						break;
					}
					if ( !reverseTblParsing ) {
						tdOptions = setClassOptions( rowDefaultOptions,
							( $( dataGroupVector[ i ].cell[ rIndex ].elem ).attr( "class" ) !== undefined ?
								$( dataGroupVector[ i ].cell[ rIndex ].elem ).attr( "class" ) :
								""
							)
						);
					} else {
						tdOptions = setClassOptions( rowDefaultOptions,
							( $( dataGroupVector[ i ].datacell[ rIndex ].elem ).attr( "class" ) !== undefined ?
								$( dataGroupVector[ i ].datacell[ rIndex ].elem ).attr( "class" ) :
								""
							)
						);
					}
					allSeries.push( {
						data: dataSeries,
						label: (!reverseTblParsing ? $( dataGroupVector[ i ].dataheader[ dataGroupVector[ i ].dataheader.length - 1 ].elem ).text() :
								$( dataGroupVector[ i ].header[ dataGroupVector[ i ].header.length - 1 ].elem ).text()),
						color: (!tdOptions.color ? options.colors[ i ] : tdOptions.color)
					} );
				}



				// Create the Canvas
				$placeHolder = $( "<div />" );

				// Charts Container
				$imgContainer = $( "<div />" );

				// Create a sub Figure or use the main one
				if ( currentRowGroup.row.length === 1 &&
					( $( currentRowGroup.row[ 0 ].header[ 0 ].elem ).html() === tblCaptionHTML ||
					currentRowGroup.row[ 0 ].header.length === 0 ) ) {

					pieChartLabelText = tblCaptionText;

					$(mainFigureElem).append($imgContainer);

				} else {
					// Use a sub container
					$subFigureElem = $( "<figure />" ).appendTo( mainFigureElem );
					$subfigCaptionElem = $( "<figcaption />" );

					header = currentRowGroup.row[ rIndex ].header;

					pieChartLabelText = $( header[ header.length - 1 ].elem ).text();

					$subFigureElem.append( $subfigCaptionElem );
					$subfigCaptionElem.append( $( header[ header.length - 1 ].elem ).html() );

					$subFigureElem.append( $imgContainer );
				}

				$imgContainer.append( $placeHolder );

				// Canvas Size
				$placeHolder.css( "height", options.height ).css( "width", options.width );



				$imgContainer.attr( "role", "img" );
				// Add a aria label to the svg build from the table caption with the following text prepends " Chart. Details in table following."
				$imgContainer.attr( "aria-label", pieChartLabelText + " " + i18n( "%table-following" ) ); // "Chart. Details in table following."

				//
				// Pie Charts Options
				//
				pieOptions = {
					series: {
						pie: {
							show: true
						}
					}
				};
				// Hide the legend,
				if ( options.nolegend ) {
					pieOptions.legend = { show: false };
				}
				// Add pie chart percentage label on slice
				if ( options.percentlegend ) {
					pieOptions.series.pie.radius = options.pieradius / 100;
					pieOptions.series.pie.label = {
						show: true,
						radius: options.pielblradius / 100,
						formatter: pieLabelFormater
					};
					// Hides the labels of any pie slice that is smaller than the specified percentage (ranging from 0 to 100)
					if ( options.piethreshold ) {
						pieOptions.series.pie.label.threshold = options.piethreshold / 100;
					}
				}
				// Percentage of tilt ranging from 0 and 100, where 100 has no change (fully vertical) and 0 is completely flat (fully horizontal -- in which case nothing actually gets drawn)
				if ( options.pietilt ) {
					pieOptions.series.pie.tilt = options.pietilt / 100;
				}
				// Sets the radius of the donut hole. If value is between 0 and 100 (inclusive) then it will use that as a percentage of the radius, otherwise it will use the value as a direct pixel length.
				if ( options.pieinnerradius ) {
					pieOptions.series.pie.innerRadius = options.pieinnerradius / 100;
				}
				// Factor of PI used for the starting angle (in radians) It can range between 0 and 200 (where 0 and 200 have the same result).
				if ( options.piestartangle ) {
					pieOptions.series.pie.startAngle = options.piestartangle / 100;
				}
				//	Opacity of the highlight overlay on top of the current pie slice. (Range from 0 to 100) Currently this just uses a white overlay, but support for changing the color of the overlay will also be added at a later date.
				if ( options.piehighlight ) {
					pieOptions.series.pie.highlight = options.piehighlight / 100;
				}
				// hoverable
				if ( options.piehoverable ) {
					pieOptions.grid = {
						hoverable: true
					};
				}

				// Create the graphic
				$.plot( $placeHolder, allSeries, pieOptions );

				if ( !options.legendinline ) {
					// Move the legend under the graphic
					$( ".legend > div", $placeHolder ).remove();
					$( ".legend > table", $placeHolder ).removeAttr( "style" ).addClass( "font-small" );
					$( ".legend", $placeHolder ).appendTo( $imgContainer );
				}

				// Remove any "pieLabel" ids set by the flotPie.js plugin at line #457
				$( ".pieLabel" ).removeAttr( "id" );

				allSeries = [];
			}

			if ( !options.noencapsulation ) { // eg of use:	wb-charts-noencapsulation-true
				// Use a details/summary to encapsulate the table
				// Add a aria label to the table element, build from his caption prepend the word " Table"
				// For the details summary, use the table caption prefixed with Table.
				tblSrcContainer = $( "<details />" );
				tblSrcContainerSummary = $( "<summary />" );
				$( tblSrcContainer ).appendTo( mainFigureElem );
				// set the title for the ability to show or hide the table as a data source
				$( tblSrcContainerSummary ).text( tblCaptionHTML + " " + i18n( "%table-mention" ) )
					.appendTo( tblSrcContainer )
					.after( srcTbl );


			} else {
				// Move the table inside the figure element
				$( srcTbl ).appendTo( mainFigureElem );
			}
			return;
		}



		if ( !reverseTblParsing ) {
			// If normal parsing
			dataGroup = currentRowGroup;
			rIndex = (parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ].col.length : parsedData.colgroup[ 0 ].col.length) - 1;
			calcTick = horizontalCalcTick;
		} else {
			// If reverse parsing
			dataGroup = parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ] : parsedData.colgroup[ 0 ];
			rIndex = currentRowGroup.row.length - 1;
			calcTick = verticalCalcTick;
		}

		dataGroupVector = !reverseTblParsing ? dataGroup.row : dataGroup.col;

		// Count the number of bar charts,
		for ( i = 0; i < dataGroupVector.length; i++ ) {
			currentRowGroupRow = dataGroupVector[ i ];
			
			rowOptions = setClassOptions( rowDefaultOptions,
			( $ ( currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].elem ).attr( "class" ) !== undefined ?
			$( currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].elem ).attr( "class" ) : "" ) );

			if ( ( !rowOptions.type && ( options.type === "bar" || options.type === "stacked" ) ) || ( rowOptions.type && ( rowOptions.type === "bar" || rowOptions.type === "stacked" ) ) ) {
				nbBarChart += 1;
				rowOptions.chartBarOption = nbBarChart;
				if ( !barDelta && ( ( rowOptions.type && rowOptions.type === "bar" ) || ( !rowOptions.type && options.type === "bar" ) ) ) {
					barDelta = true;
				}
			}


			currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].chartOption = rowOptions;
		}

		// First rowgroup assume is a data row group.
		// For all row....
		for ( i = 0; i < dataGroupVector.length; i++ ) {
			dataSeries = [];
			datacolgroupfound = 0;
			valueCumul = 0;
			currentRowGroupRow = dataGroupVector[ i ];

			rowOptions = currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].chartOption;

			// For each cells
			for( j = 0; j < currentRowGroupRow.cell.length; j++ ){

				dataCell = currentRowGroupRow.cell[ j ];
				
				if( datacolgroupfound > 1 && dataCell.col.groupstruct.type !== 2 ){
					break;
				}

				if ( (!reverseTblParsing && dataCell.col.groupstruct.type === 2 ) ||
						(reverseTblParsing && dataCell.row.rowgroup.type === 2 ) ) {

					// Get's the value
					header = !reverseTblParsing ? dataCell.col.header : dataCell.row.header;
					valuePoint = valueCumul;

					// Bar chart case, re-evaluate the calculated point
					if ( barDelta && rowOptions.chartBarOption ) {
						// Position bar
						valuePoint = valueCumul - ( smallestHorizontalFlotDelta / 2 ) + ( smallestHorizontalFlotDelta / nbBarChart * ( rowOptions.chartBarOption - 1) );

						if ( nbBarChart === 1 ) {
							valuePoint = valueCumul;
						}

					}

					cellValue = options.getcellvalue( dataCell.elem);

					// Add the data point
					dataSeries.push(
						[
							valuePoint,
							typeof cellValue === "object" ? cellValue[ 0 ] : cellValue
						]
					);
					valueCumul += header[ header.length - 1 ].flotDelta;
					datacolgroupfound++;
				}
			}



			// Get the graph type

			if ( !rowOptions.type ) {
				rowOptions.type = options.type;
			}

			if ( rowOptions.type === "line" ) {
				allSeries.push( {
					data: dataSeries,
					label: $( currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].elem ).text(),
					color: (!rowOptions.color ? options.colors[ i ] : rowOptions.color)
				} );
			} else if ( rowOptions.type === "area" ) {
				allSeries.push( {
					data: dataSeries,
					label: $( currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].elem ).text(),
					color: (!rowOptions.color ? options.colors[ i ] : rowOptions.color),
					lines: {
						show: true,
						fill: true
					}
				});
			} else if ( rowOptions.type === "bar" || ( barDelta && rowOptions.type === "stacked" ) ) {
				allSeries.push( {
					data: dataSeries,
					label: $( currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].elem ).text(),
					color: (!rowOptions.color ? options.colors[ i ] : rowOptions.color),
					bars: {
						show: true,
						barWidth: ( 1 / nbBarChart * 0.9 ),
						align: "center"
					}
				} );

			} else if ( rowOptions.type === "stacked" ) {
				allSeries.push( {
					data: dataSeries,
					label: $( currentRowGroupRow.header[ currentRowGroupRow.header.length - 1 ].elem ).text(),
					color: (!rowOptions.color ? options.colors[ i ] : rowOptions.color),
					bars: {
						show: true,
						barWidth: 0.9,
						align: "center"
					}
				} );
			} else if ( rowOptions.type === "pie" ) {

				allSeries.push( {
					data: dataSeries,
					label: $(currentRowGroupRow.header[currentRowGroupRow.header.length - 1].elem).text(),
					color: (!rowOptions.color ? options.colors[ i ] : rowOptions.color)
				} );

				isPieChart = true;
			}
		}


		figureElem = $( "<figure />" ).insertAfter( srcTbl );

		figureElem.addClass( "wb-charts" ); // Default
		if ( options.graphclass ) {
			if ( $.isArray( options.graphclass ) ) {
				for ( i = 0, graphClassLength2 = options.graphclass.length; i < graphClassLength2; i += 1 ) {
					figureElem.addClass( options.graphclass[ i ] );
				}
			} else {
				figureElem.addClass( options.graphclass );
			}
		}

		figCaptionElem = $( "<figcaption />" );

		$( figureElem ).append( figCaptionElem );
		tblCaptionHTML = $( "caption", srcTbl ).html();
		$( figCaptionElem ).append( tblCaptionHTML );

		// Create the placeholder
		$placeHolder = $( "<div />" );

		$( figureElem ).append( $placeHolder );

		// Canvas Size
		$placeHolder.css( "height", options.height ).css( "width", "100%" );


		$placeHolder.attr( "role", "img" );
		// Add a aria label to the svg build from the table caption with the following text prepends " Chart. Details in table following."
		$placeHolder.attr( "aria-label", $( "caption", srcTbl ).text() + " " + i18n( "%table-following" ) ); // "Chart. Details in table following."


		if ( !options.noencapsulation ) { // eg of use:	wb-charts-noencapsulation-true
			// Use a details/summary to encapsulate the table
			// Add a aria label to the table element, build from his caption prepend the word " Table"
			// For the details summary, use the table caption prefixed with Table.
			tblSrcContainer = $( "<details />" );
			tblSrcContainerSummary = $( "<summary />" );
			$( tblSrcContainer ).appendTo( figureElem );
			// set the title for the ability to show or hide the table as a data source
			$( tblSrcContainerSummary ).text( tblCaptionHTML + " " + i18n( "%table-mention" ) )
				.appendTo( tblSrcContainer )
				.after( srcTbl );

		} else {
			// Move the table inside the figure element
			$( srcTbl ).appendTo( figureElem );
		}

		// Create the graphic
		plotParameter = {
			canvas: true,
			xaxis: ( calcTick.length > 0 ? { ticks: calcTick } : {} )
		};

		if ( options.topvalue ) {
			if ( !plotParameter.yaxis ) {
				plotParameter.yaxis = {};
			}
			if ( options.topvaluenegative ) {
				options.topvalue *= -1;
			}
			plotParameter.yaxis.max = options.topvalue;
		}
		if ( options.bottomvalue ) {
			if ( !plotParameter.yaxis ) {
				plotParameter.yaxis = {};
			}
			if ( options.bottomvaluenegative ) {
				options.bottomvalue *= -1;
			}
			plotParameter.yaxis.min = options.bottomvalue;
		}
		if ( options.steps ) {
			if ( !plotParameter.yaxis ) {
				plotParameter.yaxis = {};
			}
			plotParameter.yaxis.ticks = options.steps;
		}

		$.plot( $placeHolder, allSeries, plotParameter );


		if ( !options.legendinline ) {
			// Move the legend under the graphic
			$( ".legend > div", $placeHolder ).remove();
			$( ".legend > table", $placeHolder ).removeAttr( "style" ).addClass( "font-small" );
			$placeHolder.css( "height", "auto" );
		}
		if ( options.nolegend ) {
			// Remove the legend
			$( ".legend", $placeHolder ).remove();
		}

		$( "canvas:eq(1)", $placeHolder ).css( "position", "static" );
		$( "canvas:eq(0)", $placeHolder ).css( "width", "100%" );

	},

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {
		window._timer.remove( selector );

		var modeJS = vapour.getMode() + ".js";

		// Load the required dependencies and prettify the code once finished
		Modernizr.load({

			// For loading multiple dependencies
			both: [
				"site!deps/jquery.flot" + modeJS,
				"site!deps/jquery.flot.pie" + modeJS,
				"site!deps/jquery.flot.canvas" + modeJS
			],
			complete: function() {
				// Let parse the table
				$elm.trigger( "pasiveparse.wb-table.wb" );
			}
		});
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb parsecomplete.wb-table.wb", selector, function( event ) {
	var eventTarget = event.target,
		eventType = event.type,
		$elm;

	// Filter out any events triggered by descendants
	if ( event.currentTarget === eventTarget ) {
		$elm = $( eventTarget );

		switch ( eventType ) {
		case "timerpoke":
			init( $elm );
			break;
		case "parsecomplete":
			createCharts( $elm );
			break;
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
