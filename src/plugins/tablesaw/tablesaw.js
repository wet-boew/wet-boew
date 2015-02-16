/**
 * @title WET-BOEW TableSaw
 * @overview Integrates the TableSaw plugin into WET providing responsiveness for tables.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
(function( $, window, wb ) {
"use strict";

/**
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
 var componentName = "wb-tablesaw",
	selector = "table",
	pluginSelector = "." + componentName,
	pluginTableSaw = "table",
	initEvent = "wb-init" + pluginSelector,
	$document = wb.doc,
	tablesawInitSelector = "table[data-tablesaw-mode],table[data-tablesaw-sortable]",
	idCount,
	i18n, i18nText,
	deps = [ // stack only mode
		"site!deps/tablesaw.stackonly" + wb.getMode() + ".js"
	],
	depCss = "site!deps/tablesaw.css",
	depsColResponsive = [
		"site!deps/tablesaw.customresponsive" + wb.getMode() + ".js"
	],
	depsSortable = [
		"site!deps/tablesaw.customresponsive" + wb.getMode() + ".js",
		"site!deps/tablesaw.sortable" + wb.getMode() + ".js"
	],

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			elmId;

		if ( elm ) {
			elmId = elm.id;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = componentName + "-id-" + idCount;
				idCount += 1;
				elm.id = elmId;
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					tableMention: i18n( "hyphen" ) + i18n( "tbl-txt" ),
					tableFollowing: i18n( "hyphen" ) + i18n( "tbl-dtls" )
				};
			}
			
			// Load the default Library - stack only
			Modernizr.load({
				load: deps,
				complete: function() {
					var $elm = $( "#" + elmId ),
					config = wb.getData($elm, "tablesaw");

					// Evaluate if we are in default mode or if we need to move into an enhanced mode like swipe or toggle.
					if ( $elm.is( tablesawInitSelector ) ) {
						console.log("Swap CONFIG triggered");
						$elm.trigger("swapConfig" + pluginSelector);
					} else if ( config && config.mode === "swipe" ) {
						console.log("Swipe Mode triggered");
						$elm.trigger("swipe" + pluginSelector);
					} else if ( config && config.mode === "columntoggle" ) {
						console.log("Toggle Mode triggered");
						$elm.trigger("toggle" + pluginSelector);
					} else {
						console.log("Stack Mode triggered");
						$elm.trigger("stack" + pluginSelector);
					}
					
					if ( config && config.sorting ) {
						console.log("Sorting triggered");
						$elm.trigger("sorting" + pluginSelector);
					}
				}
			});
			Modernizr.load(depCss);
			
		}
	};


// Swipe Mode
$document.on( "swipe" + pluginSelector, selector, function( event ) {
	var eventTarget = event.target,
		$eventTarget = $( eventTarget );
	
	// TODO: Run the table parser to know the nature of each cell, vector and group
	// For now, Just do a simple test
	//   Assumed, The first row define the column and the data row start at the second row.
	//   Assumed, that no cell span more than one column
	
	// Get the length of the column header.
	var trs = $eventTarget.find( 'tr' ),
		firstRowCells = trs.get(0).childNodes,
		secondRowCells = trs.get(1).childNodes,
		i, i_len,
		
		nbDataCell = 1;
	
	
	// Get How many cell represent the column header, that is for persistance
	for ( i = 0, i_len = secondRowCells.length; i <  i_len; i += 1 ) {
		var nodeName = secondRowCells[ i ].nodeName.toLowerCase();
		if ( nodeName === "th" ) {
			$( firstRowCells[ i ] ).attr('data-tablesaw-priority', 'persist');
		} else if ( nodeName === "td" ) {
			$( firstRowCells[ i ] ).attr('data-tablesaw-priority', nbDataCell);
			nbDataCell += 1;
		}
	}
	
	// Add what require to enable table swap mode
	$eventTarget.addClass( 'tablesaw' ).
		attr('data-tablesaw-mode', 'swipe').
		attr('data-minimap');
	
	// Load additional plugin and start the plugin
	Modernizr.load({
		load: depsColResponsive,
		complete: function() {
			$eventTarget[ pluginTableSaw ]();
			// Identify that initialization has completed
			wb.ready( $eventTarget, componentName );
		}
	});
});

// Toggle Mode
$document.on( "toggle" + pluginSelector, selector, function( event ) {
	var eventTarget = event.target,
		$eventTarget = $( eventTarget );
	
	// Prepare the table to be enhanced 
	
	
	// Load additional plugin and start the plugin
	Modernizr.load({
		load: depsColResponsive,
		complete: function() {
			$eventTarget[ pluginTableSaw ]();
			// Identify that initialization has completed
			wb.ready( $eventTarget, componentName );
		}
	});
});

// Sorting Mode
$document.on( "sorting" + pluginSelector, selector, function( event ) {
	var eventTarget = event.target,
		$eventTarget = $( eventTarget );
	
	// Prepare the table to be sortable
	
	// Load additional plugin and start the plugin
	Modernizr.load({
		load: depsSortable,
		complete: function() {
			$eventTarget[ pluginTableSaw ]();
			// Identify that initialization has completed
			wb.ready( $eventTarget, componentName );
		}
	});
	
	// $( eventTarget ).trigger( 'run' + pluginSelector );
});

// Stack Mode, Default mode
$document.on( "stack" + pluginSelector, selector, function( event ) {
	var eventTarget = event.target,
		$eventTarget = $( eventTarget );

	// Add required tablesaw parameter
	$eventTarget.addClass( 'tablesaw tablesaw-stack' ).
		attr('data-tablesaw-mode', 'stack')
	
	// Run the tableSaw plugin
	$eventTarget[ pluginTableSaw ]();

	// Identify that initialization has completed
	wb.ready( $eventTarget, componentName );
});


/*// Load deps and run the third party plugin
$document.on( 'run' + pluginSelector, selector, function( event ) {
	var eventTarget = event.target;
	
	// Load the required dependencies
	Modernizr.load({

		// For loading multiple dependencies
		load: deps,
		complete: function() {

			// Transpose the attribute data-tablesaw={} into a format that the plugin use
			//if ($elm.data().tablesaw) {
			//	console.log("Data Attribute");
			//	console.log($elm.data().tablesaw);
			//}

			// Evaluate if we are in default mode or if we need to move into an enhanced mode like swipe or toggle.

			

			// Run tableSaw plugin
			//$document.trigger( 'enhance.tablesaw');
			$( eventTarget ).trigger( 'enhance.tablesaw' );
		}
	});

});
*/

// TODO: Complete the following function
// Swap the config
$document.on( "swapConfig" + pluginSelector, selector, function( event ) {
	var eventTarget = event.target;
	
	// Triggered if we have found that the editor has used the Current Filament group docs, in order to control the widget.
	// The intend of this events is to map, the tablesaw config into WET architecture, then remove reference to it
	// Then lunch the widget.
	
});

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, function( event ) {
	var eventTarget = event.target;

	switch ( event.type ) {

	/*
	 * Init
	 */
	case "timerpoke":
	case "wb-init":
		init( event );
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

})( jQuery, window, wb );
