/**
 * @title WET-BOEW Text highlighting
 * @overview Automatically highlights certain words on a Web page. The highlighted words can be selected via the query string.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-txthl",
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
			params = wb.pageUrlParts.params,
			searchCriteria, newText;

		if ( elm ) {
			if ( event.txthl ) {
				searchCriteria = $.isArray( event.txthl ) ? event.txthl.join( "|" ) : event.txthl;
			} else if ( params && params.txthl ) {
				searchCriteria = decodeURIComponent(
					wb.pageUrlParts.params.txthl
						.replace( /^\s+|\s+$|\|+|"|\(|\)/g, "" ).replace( /\++/g, "|" )
				);
			}

			if ( searchCriteria ) {

				// Strip html
				var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" };
				searchCriteria = searchCriteria.replace( /[&<>"']/g, function( m ) {
					return map[ m ];
				} );

				// Make sure that we're not checking for text within a tag; only the text outside of tags.
				searchCriteria = "(?=([^>]*<))([\\s'])?(" + searchCriteria + ")(?!>)";

				newText = elm.innerHTML.replace( new RegExp( searchCriteria, "gi" ), function( match, group1, group2, group3 ) {
					return ( !group2 ? "" : group2 ) + "<mark>" + group3 + "</mark>";
				} );
				elm.innerHTML = newText;
			}

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
