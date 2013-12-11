/**
 * @title data-picture Plugin Unit Tests
 * @overview Test the data-picture plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, after, sinon */
/* jshint unused:vars */
(function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "[data-pic] test suite", function() {
	var spy;

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function() {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sinon.spy( $.prototype, "trigger" );

		// Trigger the plugin's initialization
		$( "[data-pic]" ).trigger( "wb-init.wb-pic" );
	});

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		$.prototype.trigger.restore();

		// Remove test data from the page
		$( ".test[data-pic]" ).remove();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have a picfill.wb-pic event", function() {
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		});

		it( "should have been triggered on a [data-pic] element", function() {
			var len = spy.thisValues.length,
				isSelector = false;
			while ( !isSelector && len-- ) {
				isSelector = spy.thisValues[len].selector === "[data-pic]";
			}
			expect( isSelector ).to.equal( true );
		});
	});

	/*
	 * Test that onresize, the plugin reacts correctly
	 */
	describe( "resize events", function() {

		it( "should have txt-rsz.wb event handler", function() {
			wb.doc.trigger( "txt-rsz.wb" );
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		});

		it( "should have win-rsz-width.wb event handler", function() {
			wb.doc.trigger( "win-rsz-width.wb" );
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		});

		it( "should have win-rsz-height.wb event handler", function() {
			wb.doc.trigger( "win-rsz-height.wb" );
			expect( spy.calledWith( "picfill.wb-pic" ) ).to.equal( true );
		});
	});

	/*
	 * Test that the plugin creates responsive images as expected
	 */
	describe( "responsive images", function() {

		it( "should have created one responsive image that matches one of the span[data-src] elements", function() {
			var $elm, $img, $span;
			$( "[data-pic]" ).each(function() {
				$elm = $( this );
				$img = $elm.find( "img" );
				$span = $elm.find( "[data-src='" + $img.attr("src") + "']" );
				expect( $img ).to.have.length( 1 );
				expect( $span.length ).to.be.greaterThan( 0 );
			});
		});

		it( "should have set the responsive image alt attribute", function() {
			var $elm;
			$( "[data-pic]" ).each(function() {
				$elm = $( this );
				expect( $elm.find( "img" ).attr( "alt" ) ).to.equal( $elm.data( "alt" ) );
			});
		});

		it( "should create a responsive image after the picfill.wb-pic event", function() {
			var $img = $(
					"<span data-pic data-alt='foo' class='test'>" +
					"<span data-src='bar.jpg'></span>" +
					"</span>" );
				$img = $img.appendTo( wb.doc.find( "body" ) );

			// Sanity check
			expect( $img.find( "img" ) ).to.have.length( 0 );

			// Confirm image was created
			$img.trigger( "picfill.wb-pic" );
			expect( $img.find( "img" ) ).to.have.length( 1 );
		});

		it( "should create a responsive image with src for the matching media query", function() {
			var $img = $(
					"<span data-pic data-alt='foo' class='test'>" +
					"<span data-src='baz.jpg' data-media='screen'></span>" +
					"<span data-src='bar.jpg' data-media='print'></span>" +
					"</span>" );
				$img = $img.appendTo( wb.doc.find( "body" ) );

			$img.trigger( "picfill.wb-pic" );
			expect( $img.find( "img" ) ).to.have.length( 1 );
			expect( $img.find( "img" ).attr( "src" ) ).to.equal( "baz.jpg" );
		});

		it( "should not create a responsive image when no matching media query", function() {
			var $img = $(
					"<span data-pic data-alt='foo' class='test'>" +
					"<span data-src='bar.jpg' data-media='print'></span>" +
					"</span>" );
				$img = $img.appendTo( wb.doc.find( "body" ) );

			$img.trigger( "picfill.wb-pic" );
			expect( $img.find( "img" ) ).to.have.length( 0 );
		});

		it( "should not create a responsive image when no span[data-src]", function() {
			var $img = $( "<span data-pic data-alt='foo' class='test'>" );
				$img = $img.appendTo( wb.doc.find( "body" ) );

			$img.trigger( "picfill.wb-pic" );
			expect( $img.find( "img" ) ).to.have.length( 0 );
		});
	});

});

}( jQuery, wb ));
