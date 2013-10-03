/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * WET-BOEW Text highlighting
 */
 (function ( $, window, document, vapour ) {
	"use strict";

	var selector = ".wb-texthighlight",
		$document = vapour.doc,
		plugin = {
			init: function ( $elm ) {
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

					newText = $elm.html().replace( new RegExp( searchCriteria, "gi" ), function ( match, group1, group2, group3 ) {
						return ( !group2 ? "" : group2 ) + "<span class='texthighlight'><mark>" + group3 + "</mark></span>";
					});
					$elm.html( newText );
				}
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function () {
		// "this" is cached for all events to utilize
		plugin.init.apply( this, [ $( this ) ] );
		return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, document, vapour );