/*
 * @title Lightbox Plugin Unit Tests
 * @overview Test the Lightbox plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @Gabriel-Dalton
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Lightbox test suite", function() {
	var $body = wb.doc.find( "body" ),
		$outside, $nested, $link;

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before( function( done ) {
		$outside = $( "<div class='lbx-test-outside' aria-hidden='false'>Outside</div>" )
			.appendTo( $body );

		$nested = $( "<div class='lbx-test-nested'>" +
				"<div class='row'>" +
					"<main class='col-md-9'>" +
						"<a href='#lbx-test-modal' class='wb-lbx lbx-modal'>Open</a>" +
						"<section id='lbx-test-modal' class='mfp-hide modal-dialog modal-content overlay-def'>" +
							"<header class='modal-header'><h2 class='modal-title'>Lightbox test</h2></header>" +
							"<div class='modal-body'><p>Lightbox content</p></div>" +
						"</section>" +
					"</main>" +
					"<nav class='wb-sec col-md-3'><a href='#'>Section menu</a></nav>" +
				"</div>" +
			"</div>" )
			.appendTo( $body );

		$link = $nested.find( ".wb-lbx" );
		$link
			.one( "wb-ready.wb-lbx", function() {
				$link
					.trigger( "focus" )
					.trigger( "click" );
				setTimeout( done, 500 );
			} )
			.trigger( "wb-init.wb-lbx" );
	} );

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after( function() {
		$.magnificPopup.close();
		$outside.remove();
		$nested.remove();
	} );

	/*
	 * Test the open state of a modal lightbox
	 */
	describe( "open modal lightbox", function() {

		it( "should hide nested background content from assistive technologies", function() {
			expect( $nested.attr( "aria-hidden" ) ).to.equal( "true" );
			expect( $outside.attr( "aria-hidden" ) ).to.equal( "true" );
		} );

		it( "should not hide the lightbox itself", function() {
			expect( $( ".mfp-wrap" ).closest( "[aria-hidden='true']" ).length ).to.equal( 0 );
		} );

		it( "should mark the dialog as modal and name it with the title", function() {
			var $dialog = $( ".mfp-wrap dialog" );

			expect( $dialog.attr( "aria-modal" ) ).to.equal( "true" );
			expect( $dialog.attr( "aria-labelledby" ) ).to.equal( "lbx-title" );
			expect( $( "#lbx-title" ).text() ).to.equal( "Lightbox test" );
		} );

		it( "should move focus inside the lightbox content", function() {
			expect( $( document.activeElement ).closest( ".mfp-content" ).length ).to.equal( 1 );
		} );
	} );

	/*
	 * Test the closed state of a modal lightbox
	 */
	describe( "close modal lightbox", function() {

		before( function( done ) {
			$.magnificPopup.close();
			setTimeout( done, 100 );
		} );

		it( "should restore the original aria-hidden values", function() {
			expect( $nested.attr( "aria-hidden" ) ).to.equal( undefined );
			expect( $outside.attr( "aria-hidden" ) ).to.equal( "false" );
		} );

		it( "should return focus to the link that opened the lightbox", function() {
			expect( document.activeElement ).to.equal( $link[ 0 ] );
		} );
	} );
} );

}( jQuery, wb ) );
