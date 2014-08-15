/**
 * @title Equal Heights Plugin Unit Tests
 * @overview Test the equal heights plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, beforeEach, after */
/* jshint unused:vars */
(function( $, wb, undef ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "equalheights test suite", function() {
	var $row, height, minHeight, callback,
		$document = wb.doc,
		$body = $document.find( "body" ),

		/*
		 * Used in $.each() to test the height of child elements in a given .wb-eqht element
		 */
		testHeight = function( idx ) {
			var $elm = $( this ),

				// Re-initialize the variables every 2 elements. This works because the test
				// data only ever has 2 elements on a given baseline.
				isInit = idx % 2 === 0,

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
		},

		addFixture = function( $elm, done ) {
			callback = done;

			$row = $elm
				.appendTo( $body )
				.trigger("wb-init.wb-eqht")
				.children();
		},

		removeFixture = function() {
			$row.parent().remove();
			$row = undef;
		};

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function() {

		$document.on( "wb-updated.wb-eqht", function() {
			if ($row !== undef) {
				$row.each( testHeight );
				callback();
			}
		});

		$document.on( "wb-ready.wb-eqht", function() {
			callback();
		});
	});

	// Before each test, reset the height and min-height values of the elements
	beforeEach(function() {
		$row.css( "min-height", "" );
		height = -1;
		minHeight = -1;
	});

	/*
	 * Test resizing with all children on same baseline
	 */
	describe( "resize float on same baseline", function() {

		before(function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
				"<div style='width:49%; float:left;'>foo</div>" +
				"<div style='width:49%; float:left;'>bar</div>" +
			"</div>" ), done );
		});

		after(function() {
			removeFixture();
		});

		it( "should resize on txt-rsz.wb event", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		});

		it( "should resize on win-rsz-width.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-width.wb" );
		});

		it( "should resize on win-rsz-height.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-height.wb" );
		});

		it( "should resize on wb-updated.wb-tables event", function( done ) {
			callback = done;

			$document.trigger( "wb-updated.wb-tables" );
		});
	});

	/*
	 * Test resizing with children dropping to next baseline
	 */
	describe( "resize multiple floated baselines", function() {

		before(function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
				"<div style='width:49%; float:left'>all</div>" +
				"<div style='width:49%; float:left'>yours</div>" +
				"<div style='width:49%; float:left'>bases</div>" +
				"<div style='width:49%; float:left; height: 100px;'>are belong to us</div>" +
			"</div>" ), done );
		});

		after(function() {
			removeFixture();
		});

		it( "should resize on txt-rsz.wb event", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		});

		it( "should resize on win-rsz-width.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-width.wb" );
		});

		it( "should resize on win-rsz-height.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-height.wb" );
		});

		it( "should resize on wb-updated.wb-tables event", function( done ) {
			callback = done;

			$document.trigger( "wb-updated.wb-tables" );
		});
	});

	/*
	 * Test resizing with children dropping to next baseline
	 */
	describe( "resize multiple inline-block baselines", function() {

		before(function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
					"<div style='width:49%; display: inline-block; height: 25px'></div>" +
					"<div style='width:49%; display: inline-block; height: 50px'></div>" +
					"<div style='width:49%; display: inline-block; height: 75px'></div>" +
				"</div>" ), done );
		});

		after(function() {
			removeFixture();
		});

		it( "should resize on txt-rsz.wb event", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		});

		it( "should resize on win-rsz-width.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-width.wb" );
		});

		it( "should resize on win-rsz-height.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-height.wb" );
		});

		it( "should resize on wb-updated.wb-tables event", function( done ) {
			callback = done;

			$document.trigger( "wb-updated.wb-tables" );
		});
	});
});

}( jQuery, wb ));
