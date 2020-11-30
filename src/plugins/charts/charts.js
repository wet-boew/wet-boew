/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Charts and Graph
 * @overview Draw charts from an html simple and complex data table
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 *
 */
( function( $, window, document, wb ) {
"use strict";

/**
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-charts",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	tableParsingEvent = "passiveparse.wb-tableparser",
	tableParsingCompleteEvent = "parsecomplete.wb-tableparser",
	$document = wb.doc,
	i18n, i18nText,

	/**
	 * Main Entry function to create the charts
	 * @method createCharts
	 * @param {jQuery DOM element} $elm table element use to create the chart
	 */
	createCharts = function( $elm ) {
		var allSeries = [],
			chartslabels = [],
			dataSeries = [],
			nbBarChart = 0,
			$caption = $( "caption", $elm ),
			captionHtml = $caption.html() || "",
			captionText = $caption.text() || "",
			valuePoint = 0,
			dataCellUnitRegExp = /[^+\-., 0-9]+[^\-+0-9]*/,
			lowestFlotDelta, $imgContainer, $placeHolder,
			$wetChartContainer, htmlPlaceHolder, figurehtml,
			cellValue, datacolgroupfound, dataGroup, header,
			i, iLength, j, jLength, parsedData, rIndex, currVectorOptions,
			currentRowGroup, reverseTblParsing, dataGroupVector,
			currentDataGroupVector, dataCell, previousDataCell, currDataVector,
			pieQuaterFlotSeries, optionFlot, optionsCharts, globalOptions,
			defaultsOptions = {

				// Flot Global Options
				flot: {
					prefix: "wb-charts-",
					defaults: {
						colors: wb.drawColours,
						canvas: true,
						xaxis: {
							ticks: { }
						}
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
						},
						fn: {
							"/series/pie/label/formatter": function( label, series ) {
								var textlabel;
								if ( !optionsCharts.decimal ) {
									textlabel = Math.round( series.percent );
								} else {
									textlabel = Math.round( series.percent * Math.pow( 10, optionsCharts.decimal ) );
									textlabel = textlabel / Math.pow( 10, optionsCharts.decimal );
								}

								if ( optionsCharts.nolegend ) {

									// Add the series label
									textlabel = label + "<br />" + textlabel;
								}
								return textlabel + "%";
							}
						}
					},
					donut: {
						base: "pie",
						series: {
							pie: {
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
					},
					slicelegend: {
						base: "pie",
						series: {
							pie: {
								radius: 1,
								label: {
									radius: 1,
									show: true,
									threshold: 0.05
								},
								combine: {
									threshold: 0.05,
									color: "#555",
									label: i18nText.slicelegend
								}
							}
						},
						fn: {
							"/series/pie/label/formatter": function( label ) {
								return label;
							}
						}
					}
				},

				// Flot Series Options
				series: {
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
						base: "bar"
					}
				},

				// Wet-boew Charts Options
				charts: {
					prefix: "wb-charts-",
					defaults: {

						// [string] Class name added at the figure element container
						graphclass: "wb-graph",

						// [boolean] Wrap or not the table in a details/summary elements
						noencapsulation: false,

						// [number] false means the deepest vector will be used for labelling
						labelposition: false,

						// [number] false means the deepest vector will be used for calculate the reference
						referencevalue: false,

						// [boolean] false means to move the legend from inside the charts to next to it
						legendinline: false,

						// [boolean] true means that the legend will be destroyed and the label for pie chart will include the legend
						nolegend: false,

						// [number] Literal number of displayed decimal for a pie charts
						decimal: 0,

						// [number] Provide a default width for the charts that will be rendered
						width: $elm.width(),

						// [number] Provide a default height for the charts that will be rendered
						height: $elm.height(),

						// [boolean] Flag for defining if the data table should be read in reverse compared to HTML spec
						reversettblparsing: false,
						fn: {
							"/getcellvalue": function( elem ) {

								// Get the number from the data cell, #3267
								var cellValue = $.trim( elem.dataset.wbChartsValue || $( elem ).text() );
								return [
									parseFloat( cellValue.replace( /(\d{1,3}(?:(?: |,)\d{3})*)(?:(?:.|,)(\d{1,2}))?$/, function( a, b, c ) {
										return b.replace( / |,/g, "" ) + "." + c || "0";
									} ), 10 ),
									cellValue.match( dataCellUnitRegExp )
								];
							}
						}
					},
					donut: {
						decimal: 1
					}
				}
			};

		/**
		 * A little function to overwrite and add preset into the default options
		 *
		 * @method overwriteDefaultsOptions
		 * @param {string} scopekey - Key that represent the subject of the setting, [flot, charts, series,...]
		 * @param {json object} target - DefaultOptions that will be overwritten
		 * @param {json object} object - User defined object for overwriting options
		 * @return {json object} - Return the new object
		 */
		function overwriteDefaultsOptions( scopekey, target, object ) {
			var cachedObj, key;

			cachedObj = object[ scopekey ];
			if ( !cachedObj ) {
				return target;
			}
			for ( key in cachedObj ) {
				if ( !Object.prototype.hasOwnProperty.call( cachedObj, key ) ) {
					continue;
				}
				target[ scopekey ][ key ] = cachedObj[ key ];
			}
			return target;
		}

		// User defined options
		if ( !window.chartsGraphOpts ) {
			globalOptions = window[ componentName ];

			// Global setting
			if ( globalOptions ) {
				overwriteDefaultsOptions( "flot", defaultsOptions, globalOptions );
				overwriteDefaultsOptions( "series", defaultsOptions, globalOptions );
				overwriteDefaultsOptions( "charts", defaultsOptions, globalOptions );
			}

			// Save the setting here in a case of a second graphic on the same page
			window.chartsGraphOpts = defaultsOptions;
		}
		defaultsOptions = window.chartsGraphOpts;

		/**
		 * A little function to ease the web editor life
		 *
		 * Apply preset defined by a set of space-separated tokens from a baseline json object and at the same time extend the result by using the HTML5 data attribute
		 *
		 * @method applyPreset
		 * @param {json object} baseline - Base line json object that includes predefined and userdefined preset
		 * @param {jQuery} $elem - Element on which the class attribute will be taken for a set of space-separated tokens
		 * @param {string} attribute - Name of the HTML5 data attribute for extending the object at the end
		 * @return {json object} - Return a new object build from the ```baseline``` or ```baseline.default``` object with the preset applied.
		 */
		function applyPreset( baseline, $elem, attribute ) {

			var config = $.extend( true, {}, baseline.defaults || baseline ),
				fn = $.extend( true, {}, baseline.defaults && baseline.defaults.fn || { } ),
				tokens = $elem.attr( "class" ) || "",
				tblTokens, i, iLength, token, tokenLength,

				// Prefix used in front of the token
				prefix, prefixLength,
				preset, key, tblFn, localKey, currObj;

			if ( tokens.length ) {

				prefix = ( baseline.prefix || "" );
				prefixLength = prefix.length;

				// split the set of space-separated tokens
				tblTokens = tokens.split( " " );

				for ( i = 0, iLength = tblTokens.length; i !== iLength; i += 1 ) {

					// Get the current token
					token = tblTokens[ i ];
					tokenLength = token.length;

					// Remove the token is used
					if ( tokenLength <= prefixLength || token.slice( 0, prefixLength ) !== prefix ) {
						continue;
					}
					token = token.slice( prefixLength, tokenLength );

					preset = baseline[ token ];

					// Apply the preset
					if ( preset ) {
						if ( preset.base ) {

							// Like setting herited from a parent config
							config = $.extend( true, config, baseline[ preset.base ] );
							fn = $.extend( true, fn, baseline[ preset.base ].fn || { } );
						}
						config = $.extend( true, config, preset );
						fn = $.extend( true, fn, preset.fn || { } );
					}
				}
			}

			// Extend the config from the element @data attribute
			config = $.extend( true, config, wb.getData( $elem, attribute ) );

			// Merge and override the function.
			for ( key in fn ) {
				if ( !Object.prototype.hasOwnProperty.call( fn, key ) ) {
					continue;
				}
				tblFn = key.split( "/" );
				currObj = config;
				for ( i = 0, iLength = tblFn.length - 1; i !== iLength; i += 1 ) {
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
			return config;
		}

		// Apply any preset
		optionFlot = applyPreset( defaultsOptions.flot, $elm, "flot" );

		// Apply any preset
		optionsCharts = applyPreset( defaultsOptions.charts, $elm, componentName );

		// Fix default width and height in case the table is hidden or too small.
		optionsCharts.width = ( optionsCharts.width && optionsCharts.width > 250 ? optionsCharts.width : 250 );
		optionsCharts.height = ( optionsCharts.height && optionsCharts.height > 250 ? optionsCharts.height : 250 );

		/**
		 * @method getColumnGroupHeaderCalculateSteps
		 * @param {object} colGroupHead - Column Group Header Object from the table parser
		 * @param {number} referenceValuePosition - Vector position use as reference for defining the steps, zero based position
		 */
		function getColumnGroupHeaderCalculateSteps( colGroupHead, referenceValuePosition ) {

			// Get the appropriate ticks
			var headerCell, i, iLen,
				calcStep = 1,
				colRefValue, colCurent;

			if ( !colGroupHead ) {

				// There is an error. Possibly the series are missing a header.
				return;
			}

			colRefValue = colGroupHead.col[ referenceValuePosition ];
			colCurent = colGroupHead.col[ 0 ];

			for ( i = 0, iLen = colRefValue.cell.length; i !== iLen; i += 1 ) {

				headerCell = colRefValue.cell[ i ];

				if ( i === 0 || ( i > 0 && colCurent.cell[ i - 1 ].uid !== headerCell.uid ) ) {

					if ( headerCell.rowgroup && headerCell.rowgroup.type === 3 ) {

						// We only process the first column data group
						break;
					}

					if ( headerCell.type === 1 || headerCell.type === 7 ) {
						if ( headerCell.child.length !== 0 ) {
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
			var headerCell, i, iLen,
				calcStep = 1,
				rowRefValueCells = rowGroupHead[ referenceValuePosition ].elem.cells;

			for ( i = 0, iLen = rowRefValueCells.length; i !== iLen; i += 1 ) {

				headerCell = $( rowRefValueCells[ i ] ).data().tblparser;

				if ( headerCell.colgroup && headerCell.colgroup.type === 3 ) {

					// We only process the first column data group
					break;
				}

				if ( headerCell.colpos >= dataColgroupStart && ( headerCell.type === 1 || headerCell.type === 7 ) ) {
					if ( headerCell.child.length !== 0 ) {
						calcStep = calcStep * headerCell.child.length * groupHeaderCalculateStepsRecursive( headerCell, 1 );
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
				calcStep = 1,
				kIndex, subRefValue, headerCellChild;

			if ( childLength === 0 ) {
				return calcStep;
			}

			subRefValue = childLength * refValue;

			calcStep = calcStep * subRefValue;

			for ( kIndex = 0; kIndex !== childLength; kIndex += 1 ) {
				headerCellChild = headerCell.child[ kIndex ];
				if ( headerCellChild.child.length !== 0 ) {
					calcStep = calcStep * groupHeaderCalculateStepsRecursive( headerCellChild, subRefValue );
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
			var i, iLength,
				headerCell,
				cumulativeValue = 0;

			for ( i = 0, iLength = vectorHead.cell.length; i !== iLength; i += 1 ) {
				headerCell = vectorHead.cell[ i ];
				if ( i !== 0 && headerCell.uid === vectorHead.cell[ i - 1 ].uid || ( dataColgroupStart && headerCell.colpos < dataColgroupStart ) ) {
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
			var cumulativeValue = 0,

				// Step Values for childs header in headerCell
				flotDelta,
				i, iLength,	currentHeaderCellChild;

			headerLevel += 1;
			cumulativeValue = headerCell.flotValue;
			flotDelta = stepsValue / headerCell.child.length;

			// Use to calculate the largest width for a bar in a bar chart
			if ( !lowestFlotDelta || flotDelta < lowestFlotDelta ) {
				lowestFlotDelta = flotDelta;
			}

			for ( i = 0, iLength = headerCell.child.length; i !== iLength; i += 1 ) {
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
			var i, k, m, kLen, mLen,
				cumulativeValue,
				currentCell,
				currentCellChild,
				currentVectorHead;

			// Calculate upper-step for cells that are
			// less precise than the reference value vector
			for ( i = referenceValue - 1; i !== -1; i -= 1 ) {
				currentVectorHead = vectorHead[ i ];

				for ( k = 0, kLen = currentVectorHead.cell.length; k !== kLen; k += 1 ) {
					currentCell = currentVectorHead.cell[ k ];

					if ( currentCell.flotDelta || k > 0 &&
						currentCell.uid === currentVectorHead.cell[ k - 1 ].uid ) {

						continue;
					}

					if ( !( currentCell.type === 1 || currentCell.type === 7 ) ) {
						continue;
					}

					cumulativeValue = 0;
					for ( m = 0, mLen = currentCell.child.length; m !== mLen; m += 1 ) {
						currentCellChild = currentCell.child[ m ];

						cumulativeValue = currentCellChild.flotDelta;
						if ( !currentCell.flotValue ) {
							currentCell.flotValue = currentCellChild.flotValue;
						}
					}
					currentCell.flotDelta = cumulativeValue;
				}
			}
		}

		/**
		 * Get labels for a specific vector
		 *
		 * @method getLabels
		 * @param {object} labelVector - Vector Header Object from the table parser
		 * @param {number} dataColgroupStart - Column position where the column data group start
		 */
		function getLabels( labelVector, dataColgroupStart ) {
			var labels = [],
				i, iLen, currentCell;

			for ( i = 0, iLen = labelVector.cell.length; i !== iLen; i += 1 ) {
				currentCell = labelVector.cell[ i ];

				if ( ( i !== 0 && currentCell.uid === labelVector.cell[ i - 1 ].uid ) ||
						( !( currentCell.type === 1 || currentCell.type === 7 ) ) ||
						( dataColgroupStart && currentCell.colpos < dataColgroupStart ) ) {
					continue;
				}

				labels.push( [ currentCell.flotValue, $( currentCell.elem ).text() ] );
			}
			return labels;
		}

		/**
		 * Get the vector that would be used for labelling x-axis
		 *
		 * @method getlabelsVectorPosition
		 * @param {object[]} arrVectorHeaders - Collection of vector headers
		 */
		function getlabelsVectorPosition( arrVectorHeaders ) {
			var labelPosition = optionsCharts.labelposition;
			return ( !labelPosition || ( labelPosition && labelPosition > arrVectorHeaders.length ) ?
				parsedData.theadRowStack.length : labelPosition ) - 1;
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
				labelsVectorPosition, stepsValue, columnReferenceValue;

			if ( !reverseTblParsing || ( reverseTblParsing && optionsCharts.referencevalue === false ) ) {
				columnReferenceValue = parsedData.colgrouphead.col.length;
			} else {
				columnReferenceValue = optionsCharts.referencevalue;
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

			// Calculate upper-step for cells that are less precise than the reference value vector
			setUpperStepValues( parsedData.colgrouphead.col, columnReferenceValue );

			// Get the labelling
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
				theadRowStack = parsedData.theadRowStack,
				i, iLength, labelsVectorPosition,
				stepsValue, rowReferenceValue;

			if ( !theadRowStack ) {
				return;
			}

			for ( i = 0, iLength = parsedData.colgroup.length; i !== iLength; i += 1 ) {
				if ( parsedData.colgroup[ i ].type === 2 ) {
					dataColgroupStart = parsedData.colgroup[ i ].start;
					break;
				}
			}

			if ( ( !reverseTblParsing && optionsCharts.referencevalue === false ) || reverseTblParsing ) {
				rowReferenceValue = theadRowStack.length;
			} else {
				rowReferenceValue = optionsCharts.referencevalue;
			}

			rowReferenceValue = rowReferenceValue - 1;

			stepsValue = getRowGroupHeaderCalculateSteps( theadRowStack, rowReferenceValue, dataColgroupStart );

			if ( !reverseTblParsing ) {
				labelsVectorPosition = getlabelsVectorPosition( theadRowStack );
			} else {
				labelsVectorPosition = theadRowStack.length - 1;
			}

			headerlevel = rowReferenceValue;

			// Calculate inner-step for cells that are more precise than the reference value vector
			setInnerStepValues( theadRowStack[ rowReferenceValue ], headerlevel, stepsValue, rowReferenceValue, dataColgroupStart );

			// Calculate upper-step for cells that are less precise than the reference value vector
			setUpperStepValues( theadRowStack, rowReferenceValue );

			// Get the labelling
			return getLabels( theadRowStack[ labelsVectorPosition ], dataColgroupStart );

		}

		/**
		 * Wrap the table into a smart details/summary element
		 *
		 * @method wrapTableIntoDetails
		 */
		function wrapTableIntoDetails() {
			var $summary;

			if ( !captionHtml.length ) {
				return;
			}

			$summary = $( "<summary>" + captionHtml + i18nText.tableMention + "</summary>" );
			$elm
				.wrap( "<details/>" )
				.before( $summary );

			$summary.trigger( "wb-init.wb-details" );
		}

		function createContainer( withDimension ) {
			$elm
				.wrap( "<figure class='" + optionsCharts.graphclass + "'/>" )
				.before(

					// Copy to the inner table caption
					( captionHtml.length ? "<figcaption>" + captionHtml + "</figcaption>" : "" ) +

					// Image Container
					"<div role='img' aria-label='" + captionText + i18nText.tableFollowing + "'" +

					// Add Dimension
					( withDimension ? "style='height:" + optionsCharts.height +
					"px; width:" + optionsCharts.width + "px'" : "" ) + "></div>"
				);

			return $( "div:eq(0)", $elm.parent() );
		}

		// Retrieve the parsed data
		parsedData = $elm.data().tblparser;

		// Reverse table parsing
		reverseTblParsing = optionsCharts.reversettblparsing;

		// first data row group
		currentRowGroup = parsedData.lstrowgroup[ 0 ];

		if ( optionFlot.series && optionFlot.series.pie ) {

			// WET Charts placeholder
			$wetChartContainer = createContainer( false );

			// Flot pie chart placeholder
			htmlPlaceHolder = "<div style='height:" + optionsCharts.height +
				"px; width:" + optionsCharts.width + "px'></div>";

			if ( !reverseTblParsing ) {

				// If normal parsing
				dataGroup = parsedData.colgroup[ 0 ].type === 1 ?
					parsedData.colgroup[ 1 ] :
					parsedData.colgroup[ 0 ];

				rIndex = currentRowGroup.row.length - 1;
			} else {

				// If reverse parsing
				dataGroup = currentRowGroup;
				rIndex = ( parsedData.colgroup[ 0 ].type === 1 ?
					parsedData.colgroup[ 1 ].col.length :
					parsedData.colgroup[ 0 ].col.length ) - 1;
			}

			for ( rIndex; rIndex >= 0; rIndex -= 1 ) {

				dataGroupVector = !reverseTblParsing ? dataGroup.col : dataGroup.row;

				// For each row or column
				for ( i = 0, iLength = dataGroupVector.length; i !== iLength; i += 1 ) {
					dataSeries = [];
					valuePoint = 0;
					currentDataGroupVector = dataGroupVector[ i ];

					// For each cells
					for ( j = 0, jLength = currentDataGroupVector.cell.length; j !== jLength; j += 1 ) {

						dataCell = currentDataGroupVector.cell[ j ];

						// Skip the column if
						if ( reverseTblParsing && dataCell.col.type === 1 ) {
							continue;
						}

						previousDataCell = undefined;
						if ( j !== 0 ) {
							previousDataCell = currentDataGroupVector.cell[ j - 1 ];
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

						// Gets the value
						header = !reverseTblParsing ? dataCell.row.header : dataCell.col.header;

						cellValue = optionsCharts.getcellvalue( !reverseTblParsing ?
							currentDataGroupVector.cell[ rIndex ].elem :
							currentDataGroupVector.datacell[ rIndex ].elem );

						dataSeries.push(
							[
								valuePoint,
								typeof cellValue === "object" ?
									cellValue[ 0 ] :
									cellValue
							]
						);

						valuePoint += header[ header.length - 1 ].flotDelta;

						break;
					}

					pieQuaterFlotSeries = { };

					// Get the setting from the associative cell header
					dataCell = !reverseTblParsing ?
						currentDataGroupVector.cell[ rIndex ] :
						currentDataGroupVector.datacell[ rIndex ];
					header = !reverseTblParsing ?
						dataCell.col.header :
						dataCell.row.header;
					header = header[ header.length - 1 ];

					// Apply any preset
					pieQuaterFlotSeries = applyPreset( defaultsOptions.series, $( header.elem ), "flot" );

					// Set the data issue from the table
					pieQuaterFlotSeries.data = dataSeries;
					pieQuaterFlotSeries.label = ( !reverseTblParsing ?
						$( currentDataGroupVector.dataheader[ currentDataGroupVector.dataheader.length - 1 ].elem ).text() :
						$( currentDataGroupVector.header[ currentDataGroupVector.header.length - 1 ].elem ).text() );

					// Add the series
					allSeries.push( pieQuaterFlotSeries );
				}

				// Create a sub Figure or use the main one
				if ( currentRowGroup.row.length === 1 &&
					( currentRowGroup.row[ 0 ].header[ 0 ].elem.innerHTML === captionHtml ||
					currentRowGroup.row[ 0 ].header.length === 0 ) ) {

					$placeHolder = $wetChartContainer;
					$placeHolder.css( {
						height: optionsCharts.height,
						width: optionsCharts.width
					} );

				} else {

					header = currentRowGroup.row[ rIndex ].header;

					figurehtml = "<figure><figcaption>" +
						header[ header.length - 1 ].elem.innerHTML +
						"</figcaption>" + htmlPlaceHolder + "</figure>";

					$wetChartContainer.append( $( figurehtml ) );

					$placeHolder = $( "div:last()", $wetChartContainer );
				}

				// Create the graphic
				$.plot( $placeHolder, allSeries, optionFlot );

				if ( !optionsCharts.legendinline ) {

					// Move the legend under the graphic
					$( ".legend", $placeHolder ).appendTo( $wetChartContainer );
				}

				allSeries = [];
			}

			if ( optionsCharts.nolegend ) {

				// Remove the legend
				$( ".legend", $wetChartContainer ).remove();
			}
			if ( !optionsCharts.legendinline ) {

				// Fix the legend that appear under the graphic
				$( ".legend > div", $wetChartContainer ).remove();
				$( ".legend > table", $wetChartContainer ).removeAttr( "style" ).addClass( "font-small" );
				$( ".legend", $placeHolder ).appendTo( $imgContainer );
			}

			// Remove any "pieLabel" ids set by the flotPie.js plugin at line #457
			$( ".pieLabel" ).removeAttr( "id" );

			if ( !optionsCharts.noencapsulation ) {
				wrapTableIntoDetails();
			}

			return;
		}

		if ( !reverseTblParsing ) {

			// If normal parsing
			dataGroup = currentRowGroup;
			rIndex = ( parsedData.colgroup[ 0 ].type === 1 ?
				parsedData.colgroup[ 1 ].col.length :
				parsedData.colgroup[ 0 ].col.length ) - 1;
			chartslabels = horizontalLabels( parsedData );
		} else {

			// If reverse parsing
			dataGroup = parsedData.colgroup[ 0 ].type === 1 ?
				parsedData.colgroup[ 1 ] :
				parsedData.colgroup[ 0 ];
			rIndex = currentRowGroup.row.length - 1;
			chartslabels = verticalLabels( parsedData );
		}

		// Add the labels at the Flot options
		optionFlot.xaxis.ticks = chartslabels;

		dataGroupVector = !reverseTblParsing ? dataGroup.row : dataGroup.col;

		// Count the number of bar charts,
		for ( i = 0, iLength = dataGroupVector.length; i !== iLength; i += 1 ) {
			currentDataGroupVector = dataGroupVector[ i ];
			currDataVector = currentDataGroupVector.header[ currentDataGroupVector.header.length - 1 ];

			// Apply any preset
			currVectorOptions = applyPreset( defaultsOptions.series, $( currDataVector.elem ), "flot" );

			if ( currVectorOptions.bars || ( optionFlot.bars && !currVectorOptions.lines ) ) {

				// Count number of bars, this number is use to calculate the bar width.
				nbBarChart += 1;

				// Set a default setting specially for bar charts
				if ( !currVectorOptions.bars ) {
					currVectorOptions.bars = { show: true, barWidth: 0.9 };
				}

				// Set a default order for orderBars flot plugin
				if ( !currVectorOptions.bars.order ) {
					currVectorOptions.bars.order = nbBarChart;
				}
			}

			// cache the compiled setting
			currDataVector.chartOption = currVectorOptions;
		}

		// First rowgroup assume is a data row group.
		// For all row....
		for ( i = 0, iLength = dataGroupVector.length; i !== iLength; i += 1 ) {
			dataSeries = [];
			datacolgroupfound = 0;
			valuePoint = 0;
			currDataVector = dataGroupVector[ i ];

			currVectorOptions = currDataVector.header[ currDataVector.header.length - 1 ].chartOption;

			// For each cells
			for ( j = 0, jLength = currDataVector.cell.length; j !== jLength; j += 1 ) {

				dataCell = currDataVector.cell[ j ];

				if ( datacolgroupfound > 1 && dataCell.col.groupstruct.type !== 2 ) {
					break;
				}

				if ( ( !reverseTblParsing && dataCell.col.groupstruct.type === 2 ) ||
						( reverseTblParsing && dataCell.row.rowgroup.type === 2 ) ) {

					// Gets the value
					header = !reverseTblParsing ? dataCell.col.header : dataCell.row.header;

					cellValue = optionsCharts.getcellvalue( dataCell.elem );

					// Add the data point
					dataSeries.push(
						[
							valuePoint,
							typeof cellValue === "object" ?
								cellValue[ 0 ] :
								cellValue
						]
					);
					valuePoint += header[ header.length - 1 ].flotDelta;
					datacolgroupfound += 1;
				}
			}

			currVectorOptions.data = dataSeries;
			currVectorOptions.label = $( currDataVector.header[ currDataVector.header.length - 1 ].elem ).text();

			if ( currVectorOptions.bars ) {

				// Adjust the bars width
				currVectorOptions.bars.barWidth = currVectorOptions.bars.barWidth * ( 1 / nbBarChart );
			}

			allSeries.push( currVectorOptions );

		}

		if ( optionFlot.bars ) {

			// Adjust the bars width
			optionFlot.bars.barWidth = optionFlot.bars.barWidth * ( 1 / nbBarChart );
		}

		// WET Charts Placeholder
		$placeHolder = createContainer( true );

		// Maximum width
		$placeHolder.css( "width", "100%" );

		// Create the graphic
		$.plot( $placeHolder, allSeries, optionFlot );

		if ( !optionsCharts.legendinline ) {

			// Move the legend under the graphic
			$( ".legend > div", $placeHolder ).remove();
			$( ".legend > table", $placeHolder ).removeAttr( "style" ).addClass( "font-small" );
			$placeHolder.css( "height", "auto" );
		}
		if ( optionsCharts.nolegend ) {

			// Remove the legend
			$( ".legend", $placeHolder ).remove();
		}

		if ( !optionsCharts.noencapsulation ) {
			wrapTableIntoDetails();
		}

		$( "canvas:eq(1)", $placeHolder ).css( "position", "static" );
		$( "canvas:eq(0)", $placeHolder ).css( "width", "100%" );

		$elm.trigger( "wb-updated" + selector );
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			settings = window[ componentName ],
			elmId, modeJS, deps;

		if ( elm ) {
			elmId = elm.id;
			modeJS = wb.getMode() + ".js";
			deps = [
				"site!deps/jquery.flot" + modeJS,
				"site!deps/jquery.flot.pie" + modeJS,
				"site!deps/jquery.flot.canvas" + modeJS,
				"site!deps/jquery.flot.orderBars" + modeJS,
				"site!deps/tableparser" + modeJS
			];

			//TODO: Revist this in the new plugin structure
			if ( settings && settings.plugins ) {
				deps = deps.concat( settings.plugins );
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					tableMention: i18n( "hyphen" ) + i18n( "tbl-txt" ),
					tableFollowing: i18n( "hyphen" ) + i18n( "tbl-dtls" ),
					slicelegend: i18n( "chrt-cmbslc" )
				};
			}

			// Load the required dependencies
			Modernizr.load( {

				// For loading multiple dependencies
				load: deps,
				complete: function() {
					var $elm = $( "#" + elmId );

					// Let's parse the table
					$elm.trigger( tableParsingEvent );

					// Identify that initialization has completed
					wb.ready( $elm, componentName );
				}
			} );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + tableParsingCompleteEvent, selector, function( event ) {
	var eventType = event.type,
		elm = event.target;

	switch ( eventType ) {

	/*
	 * Init
	 */
	case "timerpoke":
	case "wb-init":
		init( event );
		break;

	/*
	 * Data table parsed
	 */
	case "parsecomplete":
		if ( event.currentTarget === elm ) {
			createCharts( $( elm ) );
		}
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
