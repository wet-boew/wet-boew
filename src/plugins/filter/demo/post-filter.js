( function() {
window[ "wb-filter" ] = {
	filterCallback: function( $field, $elm, settings ) {
		var $sections =	$elm.find( "section" ),
			sectionsLength = $sections.length,
			s, $section;

		for ( s = 0; s < sectionsLength; s += 1 ) {
			$section = $sections.eq( s );

			if ( $section.find( settings.selector + ":visible" ).length === 0 ) {
				$section.addClass( "wb-fltr-out" );
			}
		}
	}
};
} )();
