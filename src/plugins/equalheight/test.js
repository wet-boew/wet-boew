/**
 * @title Equal Heights Plugin Unit Tests
 * @overview Test the equal heights plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, wb, undef ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "equalheights test suite", function() {
	var $row, height, minHeight, callback, test,
		$document = wb.doc,
		$body = $document.find( "body" ),

		/*
		 * Used in $.each() to test the height of child elements in a given .wb-eqht element
		 */
		testHeight = function( idx ) {
			var $elm = $( this ),

				// Re-initialize the variables every 2 elements. This works because the test
				// data only ever has 2 elements on a given baseline.
				isInit = idx % 2 === 0;

			height = isInit ? $elm.height() : height;
			minHeight = isInit ? parseInt( $elm.css( "min-height" ), 10 ) : minHeight;

			expect( minHeight ).to.be.greaterThan( 0 );
			expect( parseInt( $elm.css( "min-height" ), 10 ) ).to.equal( minHeight );
			expect( $elm.height() ).to.equal( height );
		},

		defaultTest = function( done ) {
			$row.each( testHeight );
			done();
		},

		addFixture = function( $elm, done ) {
			callback = done;

			$row = $elm
				.appendTo( $body )
				.trigger( "wb-init.wb-eqht" )
				.children();
		},

		removeFixture = function() {
			$row.parent().remove();
			$row = undef;
		};

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before( function() {
		$document.on( "wb-updated.wb-eqht", function() {
			var currentTest = test || defaultTest;
			if ( $row !== undef && callback ) {
				currentTest( callback );
			}
		} );

		$document.on( "wb-ready.wb-eqht", function() {
			if ( callback ) {
				callback();
			}

		} );
	} );

	// Before each test, reset the height and min-height values of the elements
	beforeEach( function() {
		$row.css( "min-height", "" );
		height = -1;
		minHeight = -1;
	} );

	/*
	 * Test resizing with all children on same baseline
	 */
	describe( "resize float on same baseline", function() {

		before( function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
				"<div style='width:49%; float:left;'>foo</div>" +
				"<div style='width:49%; float:left;'>bar</div>" +
			"</div>" ), done );
		} );

		after( function() {
			removeFixture();
		} );

		it( "should resize on txt-rsz.wb event", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		} );

		it( "should resize on win-rsz-width.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-width.wb" );
		} );

		it( "should resize on win-rsz-height.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-height.wb" );
		} );

		it( "should resize on wb-updated.wb-tables event", function( done ) {
			callback = done;

			$document.trigger( "wb-updated.wb-tables" );
		} );
	} );

	/*
	 * Test resizing with children dropping to next baseline
	 */
	describe( "resize multiple floated baselines", function() {

		before( function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
				"<div style='width:49%; float:left'>all</div>" +
				"<div style='width:49%; float:left'>yours</div>" +
				"<div style='width:49%; float:left'>bases</div>" +
				"<div style='width:49%; float:left; height: 100px;'>are belong to us</div>" +
			"</div>" ), done );
		} );

		after( function() {
			removeFixture();
		} );

		it( "should resize on txt-rsz.wb event", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		} );

		it( "should resize on win-rsz-width.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-width.wb" );
		} );

		it( "should resize on win-rsz-height.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-height.wb" );
		} );

		it( "should resize on wb-updated.wb-tables event", function( done ) {
			callback = done;

			$document.trigger( "wb-updated.wb-tables" );
		} );
	} );

	/*
	 * Test resizing with children dropping to next baseline
	 */
	describe( "resize multiple inline-block baselines", function() {

		before( function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
					"<div style='width:49%; display: inline-block; height: 25px'></div>" +
					"<div style='width:49%; display: inline-block; height: 50px'></div>" +
					"<div style='width:49%; display: inline-block; height: 75px'></div>" +
				"</div>" ), done );
		} );

		after( function() {
			removeFixture();
		} );

		it( "should resize on txt-rsz.wb event", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		} );

		it( "should resize on win-rsz-width.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-width.wb" );
		} );

		it( "should resize on win-rsz-height.wb event", function( done ) {
			callback = done;

			$document.trigger( "win-rsz-height.wb" );
		} );

		it( "should resize on wb-updated.wb-tables event", function( done ) {
			callback = done;

			$document.trigger( "wb-updated.wb-tables" );
		} );
	} );

	describe( "resize nested elements", function() {

		before( function( done ) {
			addFixture( $( "<div class='wb-eqht test'>" +
				"<div style='width:49%; float:left; height: 50px'><div class='hght-inhrt'>foo</div></div>" +
				"<div style='width:49%; float:left;'><div>bar</div></div>" +
			"</div>" ), done );

			test = function( done ) {
				var $nestedBlocks = $row.find( ".hght-inhrt" ),
					$nestedNonEqBlocks = $row.find( ":not(.hght-inhrt)" ),
					nestedLength = $nestedBlocks.length,
					nestedNonEqLength = $nestedNonEqBlocks.length,
					$nested, n;

				expect( nestedLength ).to.be.greaterThan( 0 );
				expect( nestedNonEqLength ).to.be.greaterThan( 0 );

				for ( n = 0; n < nestedLength; n += 1 ) {
					$nested = $nestedBlocks.eq( n );
					expect( $nested.height() ).to.be.equal( $nested.parent().height() );
				}

				for ( n = 0; n < nestedNonEqLength; n += 1 ) {
					$nested = $nestedNonEqBlocks.eq( n );
					expect( $nested.height() ).to.be.lessThan( $nested.parent().height() );
				}

				done();
			};
		} );

		after( function() {
			removeFixture();

			test = undef;
		} );

		it( "should resize nested elements with the 'hght-inhrt' class", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		} );

	} );

	describe( "resize multiple equalheights", function() {
		var $first = $( "<div class='wb-eqht test'>" +
					"<div style='width:33%; display: inline-block; height: 25px'></div>" +
					"<div style='width:33%; display: inline-block; height: 50px'></div>" +
					"<div style='width:33%; display: inline-block; height: 75px'></div>" +
				"</div>" ),
			$second = $( "<div class='wb-eqht test'>" +
					"<div style='width:33%; display: inline-block; height: 125px'></div>" +
					"<div style='width:33%; display: inline-block; height: 150px'></div>" +
					"<div style='width:33%; display: inline-block; height: 175px'></div>" +
				"</div>" );

		before( function( done ) {
			test = function( done ) {
				expect( $first.height() ).to.be.within( 75, 76 );
				expect( $second.height() ).to.be.within( 175, 176 );

				done();
				callback = undef;
			};

			addFixture( $first.add( $second ), done );
		} );

		after( function() {
			removeFixture();

			test = undef;
		} );

		it( "should resize nested elements with the 'hght-inhrt' class", function( done ) {
			callback = done;

			$document.trigger( "txt-rsz.wb" );
		} );
	} );
} );

}( jQuery, wb ) );
