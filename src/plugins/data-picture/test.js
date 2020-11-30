/**
 * @title data-picture Plugin Unit Tests
 * @overview Test the data-picture plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "[data-pic] test suite", function() {
	var sandbox = sinon.sandbox.create(),
		selector = "[data-pic]",
		$document = wb.doc,
		$body = $document.find( "body" ),
		$elm, spy;

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before( function( done ) {

		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );

		$document.on( "wb-init.wb-pic", selector, function() {
			done();
		} );

		$elm = $(
			"<span data-pic data-alt='foo' data-class='foo' class='test'>" +
			"<span data-src='baz.jpg' data-media='screen'></span>" +
			"<span data-src='bar.jpg' data-media='print'></span>" +
			"</span>" );

		$elm.appendTo( $body );

		$( selector ).trigger( "wb-init.wb-pic" );
	} );

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after( function() {

		// Restore the original behaviour of trigger once the tests are finished
		sandbox.restore();

		// Remove test data from the page
		$elm.remove();
	} );

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have a picfill.wb-pic event", function() {
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		} );

		it( "should have been triggered on a [data-pic] element", function() {
			var len = spy.thisValues.length,
				isSelector = false;
			while ( !isSelector && len-- ) {
				isSelector = spy.thisValues[ len ].selector === "[data-pic]";
			}
			expect( isSelector ).to.equal( true );
		} );
	} );

	/*
	 * Test that onresize, the plugin reacts correctly
	 */
	describe( "resize events", function() {

		it( "should have txt-rsz.wb event handler", function() {
			$document.trigger( "txt-rsz.wb" );
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		} );

		it( "should have win-rsz-width.wb event handler", function() {
			$document.trigger( "win-rsz-width.wb" );
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		} );

		it( "should have win-rsz-height.wb event handler", function() {
			$document.trigger( "win-rsz-height.wb" );
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		} );
	} );

	/*
	 * Test that the plugin creates responsive images as expected
	 */
	describe( "responsive images", function() {
		var $img;

		before( function() {
			$img = $elm.find( "img" );
		} );

		it( "should have created one responsive image that matches one of the span[data-src] elements", function() {
			var $span;

			$span = $elm.find( "[data-src='" + $img.attr( "src" ) + "']" );
			expect( $img ).to.have.length( 1 );
			expect( $span.length ).to.be.greaterThan( 0 );
		} );

		it( "should create a responsive image with src for the matching media query", function() {
			expect( $img ).to.have.length( 1 );
			expect( $img.attr( "src" ) ).to.equal( "baz.jpg" );
		} );

		it( "should have set the responsive image alt attribute", function() {
			expect( $img.attr( "alt" ) ).to.equal( $elm.data( "alt" ) );
		} );

		it( "should have set the responsive image's class attribute", function() {
			expect( $img.attr( "class" ) ).to.equal( $elm.data( "class" ) );
		} );
	} );

	describe( "responsive images with no matching media query", function() {
		var $img;

		before( function() {
			$img = $(
				"<span data-pic data-alt='foo' class='test'>" +
					"<span data-src='bar.jpg' data-media='print'></span>" +
					"</span>" )
				.appendTo( $body )
				.trigger( "picfill.wb-pic" );
		} );

		after( function() {
			$img.remove();
		} );

		it( "should not create a responsive image when no matching media query", function() {
			expect( $img.find( "img" ) ).to.have.length( 0 );
		} );
	} );

	describe( "responsive images with no source", function() {
		var $img;

		before( function() {
			$img = $( "<span data-pic data-alt='foo' class='test'>" )
				.appendTo( $body )
				.trigger( "picfill.wb-pic" );
		} );

		after( function() {
			$img.remove();
		} );

		it( "should not create a responsive image when no span[data-src]", function() {
			expect( $img.find( "img" ) ).to.have.length( 0 );
		} );
	} );

} );

}( jQuery, wb ) );
