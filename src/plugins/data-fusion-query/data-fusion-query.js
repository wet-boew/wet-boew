/**
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Data Fusion Query
 * @overview Map a query parameter value into an input value
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 *
 */
( function( document, $, wb ) {
"use strict";

/**
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-data-fusion-query",
	selector = "[data-fusion-query][name]",
	initEvent = "wb-init." + componentName,


	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm,
			inputName,
			queryParamValue;

		if ( elm ) {
			$elm = $( elm );

			// Retrieve the query parameter value and set it on the input
			inputName = $elm.attr( "name" );
			queryParamValue = wb.pageUrlParts.params[ inputName ];
			if ( queryParamValue ) {
				$elm.val( queryParamValue.replace( /\+/g, " " ) );
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	};

// Bind the init event of the plugin
wb.doc.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( document, jQuery, wb );
