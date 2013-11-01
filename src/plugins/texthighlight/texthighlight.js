/*
 * @title WET-BOEW Text highlighting
 * @overview Automatically highlights certain words on a Web page. The highlighted words can be selected via the query string.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-texthighlight",
	$document = vapour.doc,

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {
		// all plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		var searchCriteria = vapour.pageUrlParts.params.texthighlight,
			newText;

		if ( searchCriteria ) {
			// clean up the search criteria and OR each value
			searchCriteria = searchCriteria.replace( /^\s+|\s+$|\|+|\"|\(|\)/g, "" ).replace( /\++/g, "|" );
			searchCriteria = decodeURIComponent( searchCriteria );

			// Make sure that we're not checking for text within a tag; only the text outside of tags.
			searchCriteria = "(?=([^>]*<))([\\s'])?(" + searchCriteria + ")(?!>)";

			newText = $elm.html().replace( new RegExp( searchCriteria, "gi" ), function( match, group1, group2, group3 ) {
				return ( !group2 ? "" : group2 ) + "<span class='txthlt'><mark>" + group3 + "</mark></span>";
			});
			$elm.html( newText );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function() {
	init( $( this ) );

	return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );