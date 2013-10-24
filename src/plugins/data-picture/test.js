/*
 * @title data-picture Plugin Unit Tests
 * @overview Test the data-picture plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, after, sinon */
/* jshint unused:vars */
(function( $, vapour ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "[data-picture] test suite", function() {
	var spy;

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before(function() {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sinon.spy( $.prototype, "trigger" );

		// Trigger the plugin's initialization
		$( "[data-picture]" ).trigger( "timerpoke.wb" );
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		$.prototype.trigger.restore();

		// Remove test data from the page
		$( ".test[data-picture]" ).remove();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have a picturefill.wb-data-picture event", function() {
			expect( spy.calledWith( "picturefill.wb-data-picture" ) ).to.equal( true );
		});

		it( "should have been triggered on a [data-picture] element", function() {
			var len = spy.thisValues.length,
				isSelector = false;
			while ( !isSelector && len-- ) {
				isSelector = spy.thisValues[len].selector === "[data-picture]";
			}
			expect( isSelector ).to.equal( true );
		});
	});

	/*
	 * Test that onresize, the plugin reacts correctly
	 */
	describe( "resize events", function() {

		it( "should have text-resize.wb event handler", function() {
			vapour.doc.trigger( "text-resize.wb" );
			expect( spy.calledWith( "picturefill.wb-data-picture" ) ).to.equal( true );
		});

		it( "should have window-resize-width.wb event handler", function() {
			vapour.doc.trigger( "window-resize-width.wb" );
			expect( spy.calledWith( "picturefill.wb-data-picture" ) ).to.equal( true );
		});

		it( "should have window-resize-height.wb event handler", function() {
			vapour.doc.trigger( "window-resize-height.wb" );
			expect( spy.calledWith( "picturefill.wb-data-picture" ) ).to.equal( true );
		});
	});

	/*
	 * Test that the plugin creates responsive images as expected
	 */
	describe( "responsive images", function() {

		it( "should have created one responsive image that matches one of the span[data-src] elements", function() {
			var $elm, $img, $span;
			$( "[data-picture]" ).each(function() {
				$elm = $( this );
				$img = $elm.find( "img" );
				$span = $elm.find( "[data-src='" + $img.attr("src") + "']" );
				expect( $img ).to.have.length( 1 );
				expect( $span.length ).to.be.greaterThan( 0 );
			});
		});

		it( "should have set the responsive image alt attribute", function() {
			var $elm;
			$( "[data-picture]" ).each(function() {
				$elm = $( this );
				expect( $elm.find( "img" ).attr( "alt" ) ).to.equal( $elm.data( "alt" ) );
			});
		});

		it( "should create a responsive image after the picturefill.wb-data-picture event", function() {
			var $img = $(
					"<span data-picture data-alt='foo' class='test'>" +
					"<span data-src='bar.jpg'></span>" +
					"</span>" );
				$img = $img.appendTo( vapour.doc.find( "body" ) );

			// Sanity check
			expect( $img.find( "img" ) ).to.have.length( 0 );

			// Confirm image was created
			$img.trigger( "picturefill.wb-data-picture" );
			expect( $img.find( "img" ) ).to.have.length( 1 );
		});

		it( "should create a responsive image with src for the matching media query", function() {
			var $img = $(
					"<span data-picture data-alt='foo' class='test'>" +
					"<span data-src='baz.jpg' data-media='screen'></span>" +
					"<span data-src='bar.jpg' data-media='print'></span>" +
					"</span>" );
				$img = $img.appendTo( vapour.doc.find( "body" ) );

			$img.trigger( "picturefill.wb-data-picture" );
			expect( $img.find( "img" ) ).to.have.length( 1 );
			expect( $img.find( "img" ).attr( "src" ) ).to.equal( "baz.jpg" );
		});

		it( "should not create a responsive image when no matching media query", function() {
			var $img = $(
					"<span data-picture data-alt='foo' class='test'>" +
					"<span data-src='bar.jpg' data-media='print'></span>" +
					"</span>" );
				$img = $img.appendTo( vapour.doc.find( "body" ) );

			$img.trigger( "picturefill.wb-data-picture" );
			expect( $img.find( "img" ) ).to.have.length( 0 );
		});

		it( "should not create a responsive image when no span[data-src]", function() {
			var $img = $( "<span data-picture data-alt='foo' class='test'>" );
				$img = $img.appendTo( vapour.doc.find( "body" ) );

			$img.trigger( "picturefill.wb-data-picture" );
			expect( $img.find( "img" ) ).to.have.length( 0 );
		});
	});

});

}( jQuery, vapour ));
