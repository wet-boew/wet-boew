/*
 * @title WET-BOEW Geomap
 * @overview Displays a dynamic map over which information from additional sources can be overlaid.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, wb ) {
"use strict";

var componentName = "wb-geomap",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, modeJS;

		if ( elm ) {
			$elm = $( elm );
			modeJS = wb.getMode() + ".js";

			Modernizr.load([ {

				// For loading multiple dependencies
				both: [
					"site!deps/proj4" + modeJS,
					"site!deps/OpenLayers" + modeJS,
					"site!deps/geomap-lib" + modeJS
				],
				complete: function() {
					$elm.trigger( "geomap.wb" );
				}
			} ]);
		}
	};

// Bind the init function to the timerpoke event
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, wb );
