/**
 * @title WET-BOEW URL mapping
 * @overview Execute pre-configured action based on url query string
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-doaction",
	selector = "a[data-" + componentName + "],button[data-" + componentName + "]",
	runActions = "do.wb-actionmng",
	$document = wb.doc;

$document.on( "click", selector, function( event ) {

	var elm = event.target,
		$elm = $( elm );

	// Get the selector when click on a child of it, like click on a figure wrapped in a anchor with doaction.
	if ( event.currentTarget !== event.target ) {
		$elm = $elm.parentsUntil( "main", selector );
		elm = $elm[ 0 ];
	}

	// Ensure that we only execute for anchor and button
	if ( elm.nodeName === "BUTTON" || elm.nodeName === "A" ) {

		if ( !elm.id ) {
			elm.id = wb.getId();
		}

		if ( wb.isReady ) {

			// Execute actions if any.
			$elm.trigger( {
				type: runActions,
				actions: wb.getData( $elm, componentName )
			} );
		} else {

			// Execution of the action after WET will be ready
			$document.one( "wb-ready.wb", function( ) {
				$elm.trigger( {
					type: runActions,
					actions: wb.getData( $elm, componentName )
				} );
			} );
		}
		return false;
	}
} );


} )( jQuery, window, wb );
