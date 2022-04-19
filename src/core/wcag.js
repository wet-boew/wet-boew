/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title WCAG Script for testing purposes
 * @overview Test certain WCAG Success Criteria
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @ricokola @duboisp
 */

function( $, wb ) {

	// Execution of any action after WET is ready
	wb.doc.one( "wb-ready.wb", setTimeout( function( ) {
		var $pgbrk = $( ".pg-brk-aft" ),
			msg = "WCAG SC 2.4.13 - The page break (.pg-brk-aft) is not ";

		if ( $pgbrk.length > 0 ) {
			$pgbrk.each( function() {
				var id = $( this ).next().attr( "id" );
				if ( id ) {
					if ( !$( "a[href*=" + id + "]" ).length ) {
						console.warn( msg + "linked in current page for id: " + id );
					}
				} else {
					console.warn( msg + "linkable, no 'id' attribute found." );
				}
			} );
		}
	}, 250 );
})( jQuery, wb );
