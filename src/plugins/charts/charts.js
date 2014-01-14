/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Charts and Graph
 * @overview Draw charts from an html simple and complex data table 
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 *
 */
(function( $, window, document, wb ) {
"use strict";

/**
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
 var pluginName = "wb-charts",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	tableParsingEvent = "pasiveparse.wb-table.wb",
	tableParsingCompleteEvent = "parsecomplete.wb-table.wb",
	
	/**
	 * Main Entry function to create the charts
	 * @method createCharts
	 * @param {jQuery DOM element} $elm table element use to create the chart
	 */
	createCharts = function( $elm ) {
		var allSeries = [],
			chartslabels = [],
			dataSeries = [],
			i18n = wb.i18n,
			nbBarChart = 0,
			options = {},
			pieChartLabelText = "",
			lowestFlotDelta,
			valueCumul = 0,
			$imgContainer, $placeHolder, $subfigCaptionElem, $subFigureElem,
			barDelta, cellValue,
			datacolgroupfound, dataGroup, figCaptionElem, figureElem, header,
			i, j, mainFigureElem, parsedData,
			pieLabelFormater, rIndex,
			currVectorOptions, tblCaptionHTML, tblCaptionText,
			valuePoint,
			currentRowGroup, reverseTblParsing, dataGroupVector,
			dataCell, previousDataCell, currDataVector,
			optionsFlotGlobal, optionsFlotSeries, optionCurrent = {}, optionsTick,
			pieQuaterFlotSeries,
			optionsCharts;

		if ( !window.chartsGraphOpts ){
			
			// 2. Global "setting.js"
			if ( window.wet_boew_charts !== undefined ) {

				// a. if exisit copy and take care of preset separatly (Move away before extending)
				if ( window.wet_boew_charts.preset ) {
					window.chartsGraphOpts = $.extend( true, {}, window.wet_boew_charts.preset );
					delete window.wet_boew_charts.preset;
				}

				// b. Overwrite the chart default setting
				$.extend( true, options, window.wet_boew_charts );

				// c. Separatly extend the preset to at the current chart default seting
				if ( window.chartsGraphOpts ) {
					$.extend( true, options.preset, window.chartsGraphOpts );
				}
			}

			// ---- Save the setting here in a case of a second graphic on the same page
			window.chartsGraphOpts = options;
		}

		/**
		 * A little function to ease the web editor life
		 * 
		 * Apply preset defined by a set of space-separated tokens from a baseline json object
		 * 
		 * @method applyPreset
		 * @param {json object} baseline - Base line json object that includes predefined and userdefined preset 
		 * @param {jQuery} $elem - Element on which the class attribute will be taken for a set of space-separated tokens
		 * @param {string=} prefix - Prefix espected to define a valid token. Can be useful in case of conflict token name.
		 * @return {json object} - Return a new object build from the ```baseline``` or ```baseline.default``` object with the preset applied.
		 */
		function applyPreset( baseline, $elem, prefix, attribute ) {
			
			var config = $.extend( true, {}, baseline.defaults || baseline ),
				fn = $.extend( true, {}, baseline.defaults && baseline.defaults.fn || { } ),
				tokens = $elem.attr( "class" ) || "",
				tblTokens,
				i, iLength,
				token, tokenLength,
				prefixLength = prefix.length,
				key, tblFn, localKey, currObj;
			
			if ( tokens.length ) {
				// split the set of space-separated tokens
				tblTokens = tokens.split( " " );
				
				for ( i = 0, iLength = tblTokens.length; i < iLength; i += 1 ) {
					
					// Get the current token
					token = tblTokens[i];
					tokenLength = token.length;
					
					// Remove the token is used
					if ( tokenLength <= prefixLength ) {
						continue;
					}
					token = token.slice(prefixLength, tokenLength);
					
					// Apply the preset
					if ( baseline[ token ] ) {
						config = $.extend( true, config, baseline[ token ] );
						fn = $.extend( true, fn, baseline[ token ].fn || { } );
					}
				}
			}

			
			// Extend the config from the element @data attribute
			config = $.extend( true, config, wb.getData( $elem, attribute ) );
			
			// Merge and Overide the function.
			for ( key in fn ) {
				if ( fn.hasOwnProperty( key ) ) {
					tblFn = key.split( "/" );
					currObj = config;
					for ( i = 0, iLength = tblFn.length; i < iLength - 1; i += 1 ) {
						localKey = tblFn.shift();
						if ( localKey === "" ) {
							continue;
						}
						if ( !currObj[ localKey ] ) {
							currObj[ localKey ] = { };
						}
						currObj = currObj[ localKey ];
					}
					localKey = tblFn.shift();
					currObj[ localKey ] = fn[ key ];
				}
			}
			return config;
		}

		optionsFlotGlobal = {
			prefix: "wb-charts-",
			defaults: {
				colors: [ "#8d201c",
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
						"#999999" ],
				canvas: true
			},
			line: { },
			area: {
				lines: {
					show: true,
					fill: true
				}
			},
			bar: {
				bars: {
					show: true,
					barWidth: 1,
					align: "center"
				}
			},
			pie: {
				series: {
					pie: {
						show: true
					}
				}
			},
			donut: {
				series: {
					pie: {
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 1,
							threshold: 0.08
						},
						tilt: 0.5,
						innerRadius: 0.45,
						startAngle: 1
					}
				},
				grid: {
					hoverable: true
				}
			}
		};

		optionsFlotSeries = {
			prefix: "wb-charts-",
			defaults: { },
			line: { },
			area: {
				lines: {
					show: true,
					fill: true
				}
			},
			bar: {
				bars: {
					show: true,
					barWidth: 1,
					align: "center"
				}
			},
			stacked: {
				bars: {
					show: true,
					barWidth: 1,
					align: "center"
				}
			}
		};
		
		optionsCharts = {
			prefix: "wb-charts-",
			defaults: {
				graphclass: "wb-graph", // [string] Class name added at the figure element container
				noencapsulation: false, // [boolean] Wrap or not the table in a details/summary elements
				labelposition: false, // [number] false means the deepest vector will be used for labeling
				referencevalue: false, // [number] false means the deepest vector will be used for calculate the reference
				legendinline: false, // [boolean] false means to move the legend from inside the charts to next to it 
				nolegend: false, // [boolean] true means that the legend will be destroyed and the label for pie chart will include the legend
				decimal: 0, // [number] Literal number of displayed decimal for a pie charts 
				width: $elm.width(), // [number] Provide a default width for the charts that will be rendered
				height: $elm.height(), // [number] Provide a default height for the charts that will be rendered
				reversettblparsing: false, // [boolean] Flag for defining if the data table should be read in reverse compared to HTML spec
				fn: {
					"/getcellvalue": function( elem ) {
						// Default Cell value extraction
						var cellRawValue = $.trim( $( elem ).text() ).replace( /\s/g, "" );

						return [ parseFloat( cellRawValue.match( /[\+\-0-9]+[0-9,\. ]*/ ) ), cellRawValue.match (/[^\+\-\.\, 0-9]+[^\-\+0-9]*/ ) ];
					}
				}
				
			},
			donut: {
				decimal: 1
			},
			usnumber: {
				fn: {
					"/getcellvalue": function( elem ) {
						var raw = $.trim( $( elem ).text() ).replace( /,/g, "" );
						return [ parseFloat( raw.match( /[\+\-0-9]+[0-9,\. ]*/ ) ), raw.match( /[^\+\-\.\, 0-9]+[^\-\+0-9]*/ ) ];
					}
				}
			},
			
			germannumber: {
				fn: {
					"/getcellvalue": function( elem ) {
						var raw = $.trim( $( elem ).text() ).replace( /\./g, "" );
						return [ parseFloat( raw.match( /[\+\-0-9]+[0-9,\. ]*/ ) ), raw.match( /[^\+\-\.\, 0-9]+[^\-\+0-9]*/ ) ];
					}
				}
			}
		};
		// TODO: Check for Global setting and merge it in optionsFlotGlobal, Series, Force the preset strategy
		
		// Apply any preset
		optionCurrent = applyPreset( optionsFlotGlobal, $elm, optionsFlotGlobal.prefix || "", "flot" );

		// Apply any preset
		options = applyPreset( optionsCharts, $elm, optionsCharts.prefix || "", "wet-boew" );

		// Fix default width and height in case the table is hidden.
		options.width = options.width | 250;
		options.height = options.height | 250;

		/** 
		 * @method getColumnGroupHeaderCalculateSteps
		 * @param {object} colGroupHead - Column Group Header Object from the table parser
		 * @param {number} referenceValuePosition - Vector position use as reference for defining the steps, zero based position
		 */
		function getColumnGroupHeaderCalculateSteps( colGroupHead, referenceValuePosition ) {
			// Get the appropriate ticks
			var headerCell, i, _ilen,
				calcStep = 1;
				
				
			if ( !colGroupHead ) {
				return; // There is an error, may be each series do not have an header
			}

			for ( i = 0, _ilen = colGroupHead.col[ referenceValuePosition ].cell.length; i < _ilen; i += 1 ) {

				headerCell = colGroupHead.col[ referenceValuePosition ].cell[ i ];

				if ( i === 0 || ( i > 0 && colGroupHead.col[ 0 ].cell[ i - 1 ].uid !== headerCell.uid ) ) {

					if ( headerCell.rowgroup && headerCell.rowgroup.type === 3 ) {
						// We only process the first column data group
						break;
					}

					if ( headerCell.type === 1 || headerCell.type === 7 ) {
						if ( headerCell.child.length > 0 ) {
							calcStep = calcStep * groupHeaderCalculateStepsRecursive( headerCell, 1 );
						}
					}
				}
			}

			return calcStep;
		}

		/** 
		 * @method getRowGroupHeaderCalculateSteps
		 * @param {object} rowGroupHead - Row Group Header Object from the table parser
		 * @param {number} referenceValuePosition - Vector position use as reference for defining the steps, zero based position
		 * @param {number} dataColgroupStart - Column position where the column data group start 
		 */
		function getRowGroupHeaderCalculateSteps( rowGroupHead, referenceValuePosition, dataColgroupStart ) {
			// Find the range of the first data colgroup
			var headerCell, i, _ilen,
				calcStep = 1;

			for ( i = 0, _ilen = rowGroupHead[ referenceValuePosition ].elem.cells.length; i < _ilen; i += 1 ) {

				headerCell = $( rowGroupHead[ referenceValuePosition ].elem.cells[ i ] ).data().tblparser;

				if ( headerCell.colgroup && headerCell.colgroup.type === 3 ) {
					// We only process the first column data group
					break;
				}

				if ( headerCell.colpos >= dataColgroupStart && ( headerCell.type === 1 || headerCell.type === 7 ) ) {
					if ( headerCell.child.length > 0 ) {
						calcStep = calcStep * headerCell.child.length;
						calcStep = calcStep * groupHeaderCalculateStepsRecursive( headerCell, 1 );
						
					}
				}
			}
			
			return calcStep;
		}

		/**
		 * @method groupHeaderCalculateStepsRecursive
		 * @param {object} headerCell - Header cell object from the table parser
		 * @param {number} refValue - Reference Value (Dénominateur) of headerCell
		 */
		function groupHeaderCalculateStepsRecursive( headerCell, refValue ) {
			var childLength = headerCell.child.length,
				kIndex,
				subRefValue,
				calcStep = 1;

			if ( childLength === 0 ) {
				return calcStep;
			}
					
			subRefValue = childLength * refValue;
			
			calcStep = calcStep * subRefValue;

			for ( kIndex = 0; kIndex < childLength; kIndex += 1 ) {
				if ( headerCell.child[ kIndex ].child.length > 0 ) {
					calcStep = calcStep * groupHeaderCalculateStepsRecursive( headerCell.child[ kIndex ], subRefValue );
				}
			}
			return calcStep;
		}

		/**
		 * Set the inner step value (divisor) of an header cell and for his child
		 * 
		 * @method setInnerStepValues
		 * @param {object} vectorHead - Group Header Object from the table parser
		 * @param {number} headerLevel - Hiearchical Level of heading
		 * @param {number} stepsValue - Step Value for the reference value vector
		 * @param {number} referenceValue - Reference Value Vector ID
		 * @param {number} dataColgroupStart - Column position where the column data group start 
		 * 
		 */
		function setInnerStepValues( vectorHead, headerLevel, stepsValue, referenceValue, dataColgroupStart ) {
			var i,
				headerCell,
				cumulativeValue = 0;

			for ( i = 0; i < vectorHead.cell.length; i += 1 ) {
				headerCell = vectorHead.cell[ i ];
				if ( i > 0 && headerCell.uid === vectorHead.cell[ i - 1 ].uid || ( dataColgroupStart && headerCell.colpos < dataColgroupStart ) ) {
					continue;
				}
				// Only process the first data group
				if ( !reverseTblParsing ) {
					if ( headerCell.colgroup && headerCell.colgroup.type === 3 ) {
						break;
					}
				} else {
					if ( headerCell.rowgroup && headerCell.rowgroup.type === 3 ) {
						break;
					}
				}
				if ( headerCell.child > 0 && headerLevel < referenceValue ) {
					headerCell.flotDelta = stepsValue * headerCell.child.length;
				} else {
					headerCell.flotDelta = stepsValue;
				}
				if ( headerCell.type === 1 || headerCell.type === 7  ) {

					if ( !lowestFlotDelta || headerCell.flotDelta < lowestFlotDelta ) {
						lowestFlotDelta = headerCell.flotDelta;
					}
					headerCell.flotValue = cumulativeValue;
					
					cumulativeValue = cumulativeValue + stepsValue;
					
					if ( headerCell.child.length > 0 ) {
						setInnerStepValuesChildRecursive( headerCell, headerLevel, stepsValue, referenceValue );
					}
				}
			}
		}
		
		/**
		 * Recursize - Set the inner step value (divisor) of an sub header cell  
		 * 
		 * @method setInnerStepValuesChildRecursive
		 * @param {object} headerCell - Header cell object from the table parser
		 * @param {number} headerLevel - Hiearchical Level of heading
		 * @param {number} stepsValue - Specific Step Value applied for current headerCell
		 * @param {number} referenceValue - Reference Value Vector ID
		 */
		function setInnerStepValuesChildRecursive( headerCell, headerLevel, stepsValue, referenceValue ) {
			var i,
				flotDelta, // Step Values for childs header in headerCell
				cumulativeValue = 0,
				currentHeaderCellChild;

			headerLevel += 1;
			cumulativeValue = headerCell.flotValue;
			flotDelta = stepsValue / headerCell.child.length;

			// Use to calculate the largest width for a bar in a bar chart
			if ( !lowestFlotDelta || flotDelta < lowestFlotDelta ) {
				lowestFlotDelta = flotDelta;
			}

			for ( i = 0; i < headerCell.child.length; i += 1 ) {
				currentHeaderCellChild = headerCell.child[ i ];
				if ( headerLevel < referenceValue ) {
					currentHeaderCellChild.flotDelta = flotDelta * currentHeaderCellChild.child.length;
				} else {
					currentHeaderCellChild.flotDelta = flotDelta;
				}
				currentHeaderCellChild.flotValue = cumulativeValue;
				if ( currentHeaderCellChild.child.length > 0 ) {
					setInnerStepValuesChildRecursive( currentHeaderCellChild, headerLevel, flotDelta, referenceValue );
				}
				cumulativeValue = cumulativeValue + flotDelta;
			}
		}

		/**
		 * Set the header cell step value (flotDelta) for vector that regroup more than one reference 
		 * 
		 * @method setUpperStepValues
		 * @param {object} vectorHead - Group Header Object from the table parser
		 * @param {number} referenceValue - Reference Value Vector ID
		 */
		function setUpperStepValues( vectorHead, referenceValue ) {
			var i, k, m, _klen, _mlen,
				cumulativeValue,
				currentCell,
				currentCellChild;
			
			// Calculate upper-step for cells that are less preceise than the reference value vector
			for ( i = referenceValue - 1; i >= 0; i -= 1 ){
				
				for ( k = 0, _klen = vectorHead[ i ].cell.length; k < _klen; k += 1 ) {
					currentCell = vectorHead[ i ].cell[ k ];
					
					if ( currentCell.flotDelta || k > 0 && currentCell.uid === vectorHead[ i ].cell[ k - 1 ].uid ){
						continue;
					}

					if ( !( currentCell.type === 1 || currentCell.type === 7 ) ) {
						continue;
					}

					cumulativeValue = 0;
					for ( m = 0, _mlen = currentCell.child.length; m < _mlen; m += 1 ) {
						currentCellChild = currentCell.child[ m ];
						
						cumulativeValue = currentCellChild.flotDelta;
						if ( currentCell.flotValue === undefined ) {
							currentCell.flotValue = currentCellChild.flotValue;
						}
					}
					currentCell.flotDelta = cumulativeValue;
					
				}
			}
		}

		/**
		 * Get lebels for a specific vector
		 * 
		 * @method getLabels
		 * @param {object} labelVector - Vector Header Object from the table parser
		 * @param {number} dataColgroupStart - Column position where the column data group start 
		 */
		function getLabels( labelVector, dataColgroupStart ) {
			var i, _ilen,
				labels = [],
				currentCell;

			for ( i = 0, _ilen = labelVector.cell.length; i < _ilen; i += 1 ) {
				currentCell = labelVector.cell[ i ];
				
				if ( ( i > 0 && currentCell.uid === labelVector.cell[ i - 1 ].uid ) ||
						( !( currentCell.type === 1 || currentCell.type === 7 ) ) ||
						( dataColgroupStart && currentCell.colpos < dataColgroupStart ) ) {
					continue;
				}

				labels.push( [ currentCell.flotValue, $( currentCell.elem ).text() ] );
			}
			return labels;
		}

		/**
		 * Get the vector that would be used for labeling x-axis
		 * 
		 * @method getlabelsVectorPosition
		 * @param {object[]} arrVectorHeaders - Collection of vector headers
		 */
		function getlabelsVectorPosition( arrVectorHeaders ) {
			return ( !options.labelposition || ( options.labelposition && options.labelposition > arrVectorHeaders.length ) ? parsedData.theadRowStack.length : options.labelposition ) - 1;
		}

		/**
		 * Get the vertical label and set the appropriate header cell x-axis Value
		 * 
		 * @method verticalLabels
		 * @param {object} parsedData - Generic object generated by the table parser
		 */
		function verticalLabels( parsedData ) {

			// Get the appropriate ticks
			var headerlevel = 0,
				labelsVectorPosition,
				stepsValue,
				columnReferenceValue;

			if ( !reverseTblParsing || ( reverseTblParsing && options.referencevalue === false ) ) {
				columnReferenceValue = parsedData.colgrouphead.col.length;
			} else {
				columnReferenceValue = options.referencevalue;
			}
			
			columnReferenceValue = columnReferenceValue - 1;
			
			stepsValue = getColumnGroupHeaderCalculateSteps( parsedData.colgrouphead, columnReferenceValue );

			if ( !reverseTblParsing ) {
				labelsVectorPosition = parsedData.colgrouphead.col.length - 1;
			} else {
				labelsVectorPosition = getlabelsVectorPosition( parsedData.colgrouphead.col );
			}

			headerlevel = columnReferenceValue;
			
			// Calculate inner-step for cells that are more precise than the reference value vector 
			setInnerStepValues( parsedData.colgrouphead.col[ columnReferenceValue ], headerlevel, stepsValue, columnReferenceValue );
			
			// Calculate upper-step for cells that are less preceise than the reference value vector
			setUpperStepValues( parsedData.colgrouphead.col, columnReferenceValue );

			// Get the labeling
			return getLabels( parsedData.colgrouphead.col[ labelsVectorPosition ] );
		}

		/**
		 * Get the horizontal label and set the appropriate header cell x-axis Value
		 * 
		 * @method horizontalLabels
		 * @param {object} parsedData - Generic object generated by the table parser
		 */
		function horizontalLabels( parsedData ) {
			// Find the range of the first data colgroup
			var dataColgroupStart = -1,
				headerlevel = 0,
				i,
				labelsVectorPosition,
				stepsValue,
				rowReferenceValue;

			if ( !parsedData.theadRowStack ) {
				return;
			}

			for ( i = 0; i < parsedData.colgroup.length; i += 1 ) {
				if ( parsedData.colgroup[ i ].type === 2 ) {
					dataColgroupStart = parsedData.colgroup[ i ].start;
					break;
				}
			}

			if ( ( !reverseTblParsing && options.referencevalue === false ) || reverseTblParsing ) {
				rowReferenceValue = parsedData.theadRowStack.length;
			} else {
				rowReferenceValue = options.referencevalue;
			}

			rowReferenceValue = rowReferenceValue - 1;

			stepsValue = getRowGroupHeaderCalculateSteps( parsedData.theadRowStack, rowReferenceValue, dataColgroupStart );

			if ( !reverseTblParsing ) {
				labelsVectorPosition = getlabelsVectorPosition( parsedData.theadRowStack );
				
			} else {
				labelsVectorPosition = parsedData.theadRowStack.length - 1;
			}

			headerlevel = rowReferenceValue;

			// Calculate inner-step for cells that are more precise than the reference value vector 
			setInnerStepValues( parsedData.theadRowStack[ rowReferenceValue ], headerlevel, stepsValue, rowReferenceValue, dataColgroupStart );

			// Calculate upper-step for cells that are less preceise than the reference value vector
			setUpperStepValues( parsedData.theadRowStack, rowReferenceValue );

			// Get the labeling
			return getLabels( parsedData.theadRowStack[ labelsVectorPosition ], dataColgroupStart );
			
		}

		/**
		 * Wrap the table into a smart details/summary element
		 * 
		 * @method wrapTableIntoDetails
		 * @param {jQuery object} $figElement - JQuery element that represent a figure element
		 * @param {string} tableCaptionHTML - HTML caption of the table, used as the summary content
		 */
		function wrapTableIntoDetails( $figElement, tableCaptionHTML ) {
			var $details, $summary;
			$details = $( "<details />" );
			$summary = $( "<summary />" );
			$details.appendTo( $figElement );
			// set the title for the ability to show or hide the table as a data source
			$summary.text( tableCaptionHTML + " " + i18n( "%table-mention" ) )
				.appendTo( $details )
				.after( $elm );
		}
		
		parsedData = $( $elm ).data().tblparser; // Retrieve the parsed data
		reverseTblParsing = options.reversettblparsing; // Reverse table parsing
		currentRowGroup = parsedData.lstrowgroup[ 0 ]; // first data row group

		if ( optionCurrent.series && optionCurrent.series.pie ) {
			// Use Reverse table axes
			// Create a chart/ place holder, by series
			mainFigureElem = $( "<figure />" ).insertAfter( $elm );

			pieLabelFormater = function( label, series ) {
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
			
			// Inject the pie label formater function
			if (optionCurrent.series.pie.label) {
				optionCurrent.series.pie.label.formatter = pieLabelFormater;
			}
					
			// Default
			mainFigureElem;
			if ( options.graphclass ) {
				mainFigureElem.addClass( options.graphclass );
			}

			figCaptionElem = $( "<figcaption />" );

			$( mainFigureElem ).append( figCaptionElem );
			tblCaptionHTML = $( "caption", $elm ).html();
			tblCaptionText = $( "caption", $elm ).text();
			$( figCaptionElem ).append( tblCaptionHTML );

			if ( !reverseTblParsing ) {
				// If normal parsing
				dataGroup = parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ] : parsedData.colgroup[ 0 ];

				rIndex = currentRowGroup.row.length - 1;
			} else {
				// If reverse parsing
				dataGroup = currentRowGroup;
				rIndex = ( parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ].col.length : parsedData.colgroup[ 0 ].col.length ) - 1;
			}

			for ( rIndex; rIndex >= 0; rIndex -= 1 ) {

				dataGroupVector = !reverseTblParsing ? dataGroup.col : dataGroup.row;

				// For each row or column
				for ( i = 0; i < dataGroupVector.length; i += 1 ) {
					dataSeries = [];
					valueCumul = 0;

					// For each cells
					for ( j = 0; j < dataGroupVector[ i ].cell.length; j += 1 ) {
						
						dataCell = dataGroupVector[ i ].cell[ j ];
						
						// Skip the column if 
						if ( reverseTblParsing && dataCell.col.type === 1 ) {
							continue;
						}

						previousDataCell = undefined;
						if ( j > 0 ) {
							previousDataCell = dataGroupVector[ i ].cell[ j - 1 ];
						}

						// Verify if the selected cell still in the scope of a data group in his another axes (eg. row/col)
						// Verify if we are still in the same datagroup as the previous data cell
						if ( ( !reverseTblParsing && ( dataCell.row.type !== 2  || ( previousDataCell &&
								previousDataCell.rowgroup.uid !== dataCell.rowgroup.uid ) ) ) ||
								( reverseTblParsing && ( dataCell.col.type !== 2 ) || ( previousDataCell &&
								previousDataCell.col.type !== 1 &&
								previousDataCell.col.groupstruct.uid !== dataCell.col.groupstruct.uid ) ) ) {
							break;
						}

						// Get"s the value
						header = !reverseTblParsing ? dataCell.row.header : dataCell.col.header;

						cellValue = options.getcellvalue( !reverseTblParsing ? dataGroupVector[ i ].cell[ rIndex ].elem : dataGroupVector[ i ].datacell[ rIndex ].elem );

						dataSeries.push(
							[
								valueCumul,
								typeof cellValue === "object" ? cellValue[ 0 ] : cellValue
							]);

						valueCumul += header[ header.length - 1 ].flotDelta;

						break;
					}
					
					pieQuaterFlotSeries = { };
					
					// Get the setting from the associative cell header
					dataCell =  !reverseTblParsing ? dataGroupVector[ i ].cell[ rIndex ] : dataGroupVector[ i ].datacell[ rIndex ];
					header = !reverseTblParsing ? dataCell.col.header : dataCell.row.header;
					header = header[ header.length - 1 ];
					
					// Apply any preset
					pieQuaterFlotSeries = applyPreset( optionsFlotSeries, $(header.elem), optionsFlotSeries.prefix || "", "flot" );
					
					// Set the data issue from the table
					pieQuaterFlotSeries.data = dataSeries;
					pieQuaterFlotSeries.label = ( !reverseTblParsing ? $( dataGroupVector[ i ].dataheader[ dataGroupVector[ i ].dataheader.length - 1 ].elem ).text() :
								$( dataGroupVector[ i ].header[ dataGroupVector[ i ].header.length - 1 ].elem ).text() );
					
					// Add the series
					allSeries.push(pieQuaterFlotSeries);
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

					$( mainFigureElem ).append( $imgContainer );

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

				
				// Create the graphic
				$.plot( $placeHolder, allSeries, optionCurrent );

				if ( options.nolegend ) {
					// Remove the legend
					$( ".legend", $placeHolder ).remove();
				}
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

			if ( !options.noencapsulation ) {
				wrapTableIntoDetails( mainFigureElem, tblCaptionHTML );
			} else {
				// Move the table inside the figure element
				$( $elm ).appendTo( mainFigureElem );
			}
			return;
		}

		if ( !reverseTblParsing ) {
			// If normal parsing
			dataGroup = currentRowGroup;
			rIndex = ( parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ].col.length : parsedData.colgroup[ 0 ].col.length ) - 1;
			chartslabels = horizontalLabels( parsedData );
		} else {
			// If reverse parsing
			dataGroup = parsedData.colgroup[ 0 ].type === 1 ? parsedData.colgroup[ 1 ] : parsedData.colgroup[ 0 ];
			rIndex = currentRowGroup.row.length - 1;
			chartslabels = verticalLabels( parsedData );
		}

		// Set the Global Options => xaxis => tick options
		optionsTick = {
			xaxis: {
				ticks: chartslabels
			}
		};
		
		optionCurrent = $.extend( true, optionCurrent, optionsTick);

		dataGroupVector = !reverseTblParsing ? dataGroup.row : dataGroup.col;

		// Count the number of bar charts,
		for ( i = 0; i < dataGroupVector.length; i++ ) {
			currDataVector = dataGroupVector[ i ].header[ dataGroupVector[ i ].header.length - 1 ];
			
			
			// Apply any preset
			currVectorOptions = applyPreset( optionsFlotSeries, $(currDataVector.elem), optionsFlotSeries.prefix || "", "flot" );
			

			if ( currVectorOptions.bars || ( optionCurrent.bars && !currVectorOptions.lines ) ) {
				nbBarChart += 1;
				currVectorOptions.barPos = nbBarChart;
				barDelta = true;
			}

			currDataVector.chartOption = currVectorOptions;
		}

		// First rowgroup assume is a data row group.
		// For all row....
		for ( i = 0; i < dataGroupVector.length; i++ ) {
			dataSeries = [];
			datacolgroupfound = 0;
			valueCumul = 0;
			currDataVector = dataGroupVector[ i ];

			currVectorOptions = currDataVector.header[ currDataVector.header.length - 1 ].chartOption;

			// For each cells
			for ( j = 0; j < currDataVector.cell.length; j++ ) {

				dataCell = currDataVector.cell[ j ];
				
				if ( datacolgroupfound > 1 && dataCell.col.groupstruct.type !== 2 ) {
					break;
				}

				if ( ( !reverseTblParsing && dataCell.col.groupstruct.type === 2 ) ||
						( reverseTblParsing && dataCell.row.rowgroup.type === 2 ) ) {

					// Get's the value
					header = !reverseTblParsing ? dataCell.col.header : dataCell.row.header;
					valuePoint = valueCumul;

					// Bar chart case, re-evaluate the calculated point
					if ( barDelta && currVectorOptions.barPos ) {
						// Position bar
						valuePoint = valueCumul - ( lowestFlotDelta / 2 ) + ( lowestFlotDelta / nbBarChart * ( currVectorOptions.barPos - 1 ) );

						if ( nbBarChart === 1 ) {
							valuePoint = valueCumul;
						}

					}

					cellValue = options.getcellvalue( dataCell.elem );

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

			currVectorOptions.data = dataSeries;
			currVectorOptions.label = $( currDataVector.header[ currDataVector.header.length - 1 ].elem ).text();
			
			if ( currVectorOptions.bars ) {
				currVectorOptions.bars.barWidth = currVectorOptions.bars.barWidth * ( 1 / nbBarChart );
			}
			
			allSeries.push( currVectorOptions );

		}
		
		if ( optionCurrent.bars ) {
			optionCurrent.bars.barWidth = optionCurrent.bars.barWidth * ( 1 / nbBarChart );
		}

		figureElem = $( "<figure />" ).insertAfter( $elm );

		figureElem; // Default
		if ( options.graphclass ) {
			figureElem.addClass( options.graphclass );
		}

		figCaptionElem = $( "<figcaption />" );

		$( figureElem ).append( figCaptionElem );
		tblCaptionHTML = $( "caption", $elm ).html();
		$( figCaptionElem ).append( tblCaptionHTML );

		// Create the placeholder
		$placeHolder = $( "<div />" );

		$( figureElem ).append( $placeHolder );

		// Canvas Size
		$placeHolder.css( "height", options.height ).css( "width", "100%" );

		$placeHolder.attr( "role", "img" );
		// Add a aria label to the svg build from the table caption with the following text prepends " Chart. Details in table following."
		$placeHolder.attr( "aria-label", $( "caption", $elm ).text() + " " + i18n( "%table-following" ) ); // "Chart. Details in table following."

		if ( !options.noencapsulation ) {
			wrapTableIntoDetails( figureElem, tblCaptionHTML );
		} else {
			// Move the table inside the figure element
			$( $elm ).appendTo( figureElem );
		}

		// Create the graphic
		$.plot( $placeHolder, allSeries, optionCurrent );

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

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {DOM element} elm The plugin element being initialized
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( elm, $elm ) {
		var modeJS = wb.getMode() + ".js",
			deps = [
				"site!deps/jquery.flot" + modeJS,
				"site!deps/jquery.flot.pie" + modeJS,
				"site!deps/jquery.flot.canvas" + modeJS
			];
	
		if ( elm.className.indexOf( initedClass ) === -1 ) {
				
			wb.remove( selector );

			elm.className += " " + initedClass;

			// Load the required dependencies and prettify the code once finished
			Modernizr.load({

				// For loading multiple dependencies
				load: deps,
				complete: function() {
					// Let parse the table
					$elm.trigger( tableParsingEvent );
				}
			});
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + tableParsingCompleteEvent, selector, function( event ) {
	var eventType = event.type,
		elm = event.target,
		// "this" is cached for all events to utilize
		$elm = $( this );
	
	if ( event.currentTarget !== elm ) {
		return true;
	}
	
	switch ( eventType ) {

	/*
	 * Init
	 */
	case "timerpoke":
		init( elm, $elm );
		break;
	
	/*
	 * Data Table Parsed
	 */
	case "parsecomplete":
		createCharts( $elm );
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
