/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Facebook Plugin Unit Tests
 * @overview Test the favicon plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
*/

describe( "Facebook test suite", function() {

	/*
	 * Test the initialization and default behaviour of the plugin
	 */
	var $elm,
		$document = wb.doc,
		$body = $document.find( "body" );

	before( function( done ) {

		// The facebook widget sometimes takes longer than two second to load
		this.timeout( 5000 );

		// Trigger plugin init
		$elm = $( "<div class='wb-facebook'><div class='fb-page' data-href='https://www.facebook.com/canada150th'></div></div>" )
			.appendTo( $body )
			.trigger( "wb-init.wb-facebook" );

		$document.on( "wb-ready.wb-facebook", ".wb-facebook", function() {
			done();
		} );
	} );

	after( function() {
		$elm.remove();
	} );

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init event", function() {
		it( "should have added the wb-facebook-inited CSS class", function() {
			expect( $elm.hasClass( "wb-facebook-inited" ) ).to.equal( true );
		} );
	} );

} );

}( jQuery, wb ) );
