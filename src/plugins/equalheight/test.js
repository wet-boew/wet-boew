/**
 * @title Equal Heights Plugin Unit Tests
 * @overview Test the equal heights plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, beforeEach, after */
/* jshint unused:vars */
(function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "equalheights test suite", function() {
	var $elm, $equalheights, $row1, $row2, $row3, height, minHeight, isInit, isSingleElm,
		$document = wb.doc,

		/*
		 * Used in $.each() to test the height of child elements in a given .wb-eqht element
		 */
		testHeight = function( idx ) {
			$elm = $( this );

			// Re-initialize the variables every 2 elements.  This works because the test
			// data only ever has 2 elements on a given baseline.
			isInit = idx % 2 === 0;

			// Is this a case where only one element exists on a baseline?
			isSingleElm = isInit && $elm.is( ":last-child" );

			height = isInit ? $elm.height() : height;
			minHeight = isInit ? parseInt( $elm.css( "min-height" ), 10 ) : minHeight;

			// When only a single element on a baseline, its min-height should be set to 0
			if ( isSingleElm ) {
				expect( minHeight ).to.equal( 0 );
			} else {
				expect( minHeight ).to.be.greaterThan( 0 );
			}
			expect( parseInt( $elm.css( "min-height" ), 10 ) ).to.equal( minHeight );
			expect( $elm.height() ).to.equal( height );
		};

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function() {
		// Add test data to the page
		wb.doc
			.find( "body" )
			.append(
				"<div class='wb-eqht row-1 test'>" +
					"<div style='width:49%; float:left'>foo</div>" +
					"<div style='width:49%; float:left'>bar</div>" +
				"</div>" +
				"<div class='wb-eqht row-2 test'>" +
					"<div style='width:49%; float:left'>all</div>" +
					"<div style='width:49%; float:left'>yours</div>" +
					"<div style='width:49%; float:left'>bases</div>" +
					"<div style='width:49%; float:left; height: 100px;'>are belong to us</div>" +
				"</div>" +
				"<div class='wb-eqht row-3 test'>" +
					"<div style='width:49%; display: inline-block; height: 25px'></div>" +
					"<div style='width:49%; display: inline-block; height: 50px'></div>" +
					"<div style='width:49%; display: inline-block; height: 75px'></div>" +
				"</div>" );

		$equalheights = $( ".wb-eqht.test" );
	});

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after(function() {
		// Remove test elements from the page
		$equalheights.remove();
	});

	/*
	 * Test resizing with all children on same baseline
	 */
	describe( "resize float on same baseline", function() {

		before(function() {
			$row1 = $equalheights.filter( ".row-1" ).children();
		});

		// Before each test, reset the height and min-height values of the elements
		beforeEach(function() {
			$row1.css( "min-height", "" );
			height = -1;
			minHeight = -1;
		});

		it( "should resize on txt-rsz.wb event", function() {
			$document.trigger( "txt-rsz.wb" );
			$row1.each( testHeight );
		});

		it( "should resize on win-rsz-width.wb event", function() {
			$document.trigger( "win-rsz-width.wb" );
			$row1.each( testHeight );
		});

		it( "should resize on win-rsz-height.wb event", function() {
			$document.trigger( "win-rsz-height.wb" );
			$row1.each( testHeight );
		});

		it( "should resize on wb-updated.wb-tables event", function() {
			$document.trigger( "wb-updated.wb-tables" );
			$row1.each( testHeight );
		});
	});

	/*
	 * Test resizing with children dropping to next baseline
	 */
	describe( "resize multiple floated baselines", function() {

		before(function() {
			$row2 = $equalheights.filter( ".row-2" ).children();
		});

		// Before each test, reset the height and min-height values of the elements
		beforeEach(function() {
			$row2.css( "min-height", "" );
			height = -1;
			minHeight = -1;
		});

		it( "should resize on txt-rsz.wb event", function() {
			$document.trigger( "txt-rsz.wb" );
			$row2.each( testHeight );
		});

		it( "should resize on win-rsz-width.wb event", function() {
			$document.trigger( "win-rsz-width.wb" );
			$row2.each( testHeight );
		});

		it( "should resize on win-rsz-height.wb event", function() {
			$document.trigger( "win-rsz-height.wb" );
			$row2.each( testHeight );
		});

		it( "should resize on wb-updated.wb-tables event", function() {
			$document.trigger( "wb-updated.wb-tables" );
			$row2.each( testHeight );
		});
	});

	/*
	 * Test resizing with children dropping to next baseline
	 */
	describe( "resize multiple inline-block baselines", function() {

		before(function() {
			$row3 = $equalheights.filter( ".row-3" ).children();
		});

		// Before each test, reset the height and min-height values of the elements
		beforeEach(function() {
			$row3.css( "min-height", "" );
			height = -1;
			minHeight = -1;
		});

		it( "should resize on txt-rsz.wb event", function() {
			$document.trigger( "txt-rsz.wb" );
			$row3.each( testHeight );
		});

		it( "should resize on win-rsz-width.wb event", function() {
			$document.trigger( "win-rsz-width.wb" );
			$row3.each( testHeight );
		});

		it( "should resize on win-rsz-height.wb event", function() {
			$document.trigger( "win-rsz-height.wb" );
			$row3.each( testHeight );
		});

		it( "should resize on wb-updated.wb-tables event", function() {
			$document.trigger( "wb-updated.wb-tables" );
			$row3.each( testHeight );
		});
	});
});

}( jQuery, wb ));
