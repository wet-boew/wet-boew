/**
 * @title WET-BOEW Set background image
 * @overview to be replaced by CSS 4: background-image:attr(data-bgimg, url)
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,
	componentName = "wb-bgimg",
	selector = ".provisional[data-bgimg], .provisional [data-bgimg], [data-bgimg]",

	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {

			//to be replaced by CSS 4: background-image:attr(data-bgimg, url)
			elm.style.backgroundImage = "url(" + elm.dataset.bgimg + ")";

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb wb-init." + componentName, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
