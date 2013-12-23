/**
 * @title data-inview Plugin Unit Tests
 * @overview Test the data-inview plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, beforeEach, after, sinon */
/* jshint unused:vars */
(function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "data-inview test suite", function() {
	var spy,
		$inviewBottom = $( ".wb-inview[data-inview='bottom-bar'], .wb-inview[data-inview='barre-bas']" ),
		$inviewTop = $( ".wb-inview[data-inview='top-bar'], .wb-inview[data-inview='barre-haut']" ),
		$bottomBar = $( "#" + $inviewBottom.data( "inview" ) ),
		$topBar = $( "#" + $inviewTop.data( "inview" ) ),
		$document = wb.doc,
		$window = wb.win,
		sandbox = sinon.sandbox.create();

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function( done ) {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );

		// Init the plugin and give it 1ms before starting the tests
		$( ".wb-inview" ).trigger( "wb-init.wb-inview" );
		setTimeout( done, 1 );
	});

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		sandbox.restore();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have been triggered on a .wb-inview element", function() {
			var elm,
				isSelector = false,
				len = spy.thisValues.length;
			while ( !isSelector && len-- ) {
				elm = spy.thisValues[len][0];
				isSelector = elm && elm.className && elm.className.indexOf( "wb-inview" ) > -1;
			}
			expect( isSelector ).to.equal( true );
		});
	});

	/*
	 * Test triggering of the 'scroll.wb-inview' event
	 */
	describe( "scroll.wb-inview event triggering", function() {

		beforeEach(function() {
			spy.reset();
		});

		it( "window 'scroll' event should trigger a scroll.wb-inview event", function() {
			$window.trigger( "scroll" );
			expect( spy.calledWith( "scroll.wb-inview" ) ).to.equal( true );
		});

		it( "window 'scrollstop' event should trigger a scroll.wb-inview event", function() {
			$window.trigger( "scrollstop" );
			expect( spy.calledWith( "scroll.wb-inview" ) ).to.equal( true );
		});

		it( "document 'txt-rsz.wb' event should trigger a scroll.wb-inview event", function() {
			$document.trigger( "txt-rsz.wb" );
			expect( spy.calledWith( "scroll.wb-inview" ) ).to.equal( true );
		});

		it( "document 'win-rsz-width.wb' event should trigger a scroll.wb-inview event", function() {
			$document.trigger( "win-rsz-width.wb" );
			expect( spy.calledWith( "scroll.wb-inview" ) ).to.equal( true );
		});

		it( "document 'win-rsz-height.wb' event should trigger a scroll.wb-inview event", function() {
			$document.trigger( "win-rsz-height.wb" );
			expect( spy.calledWith( "scroll.wb-inview" ) ).to.equal( true );
		});
	});

	/*
	 * Test that inview bottom works as expected
	 * Testing with PhantomJS is excluded because grunt-mocha doesn't provide a way
	 * to set the viewport height to completely show the $inviewBottom element.
	 */
	if ( !/PhantomJS/.test( navigator.userAgent ) ) {

		describe( "inview bottom 'all'", function() {

			before(function( done ) {
				$inviewBottom.one( "scroll.wb-inview", function() {
					done();
				});
				$window.scrollTop( $inviewBottom.offset().top );
			});

			it( "should not have an inview bottom bar visible", function() {
				expect( $inviewBottom.attr( "data-inviewstate" ) ).to.equal( "all" );
				expect( $bottomBar.hasClass( "open" ) ).to.equal( false );
				expect( $bottomBar.is( ":visible" ) ).to.equal( false );
			});
		});
	}

	describe( "inview bottom 'partial'", function() {

		before(function( done ) {
			$inviewBottom.one( "scroll.wb-inview", function() {
				done();
			});
			$window.scrollTop( $inviewBottom.offset().top + 50 );
		});

		it( "should have an inview bottom bar visible", function() {
			expect( $inviewBottom.attr( "data-inviewstate" ) ).to.equal( "partial" );
			expect( $bottomBar.hasClass( "open" ) ).to.equal( true );
			expect( $bottomBar.is( ":visible" ) ).to.equal( true );
		});
	});

	describe( "inview bottom 'none'", function() {

		before(function( done ) {
			$inviewBottom.one( "scroll.wb-inview", function() {
				done();
			});
			$window.scrollTop( $inviewBottom.offset().top + 500 );
		});

		it( "should have an inview bottom bar visible", function() {
			expect( $inviewBottom.attr( "data-inviewstate" ) ).to.equal( "none" );
			expect( $bottomBar.hasClass( "open" ) ).to.equal( true );
			expect( $bottomBar.is( ":visible" ) ).to.equal( true );
		});
	});

	/*
	 * Test that inview top works as expected.
	 * Testing with PhantomJS is excluded because grunt-mocha doesn't provide a way
	 * to set the viewport height to completely show the $inviewTop element.
	 */
	if ( !/PhantomJS/.test( navigator.userAgent ) ) {

		describe( "inview top 'all'", function() {

			before(function( done ) {
				$inviewTop.one( "scroll.wb-inview", function() {
					done();
				});
				$window.scrollTop( $inviewTop.offset().top );
			});

			it( "should not have an inview top bar visible", function() {
				expect( $inviewTop.attr( "data-inviewstate" ) ).to.equal( "all" );
				expect( $topBar.hasClass( "open" ) ).to.equal( false );
				expect( $topBar.is( ":visible" ) ).to.equal( false );
			});
		});
	}

	describe( "inview top 'partial'", function() {

		before(function( done ) {
			$inviewTop.one( "scroll.wb-inview", function() {
				done();
			});
			$window.scrollTop( $inviewTop.offset().top + 50 );
		});

		it( "should not have an inview top bar visible (.show-none CSS class prevents it)", function() {
			expect( $inviewTop.attr( "data-inviewstate" ) ).to.equal( "partial" );
			expect( $topBar.hasClass( "open" ) ).to.equal( false );
			expect( $topBar.is( ":visible" ) ).to.equal( false );
		});
	});

	describe( "inview top 'none'", function() {

		before(function( done ) {
			$inviewTop.one( "scroll.wb-inview", function() {
				done();
			});
			$window.scrollTop( $inviewTop.offset().top + 500 );
		});

		it( "should have an inview top bar visible", function() {
			expect( $inviewTop.attr( "data-inviewstate" ) ).to.equal( "none" );
			expect( $topBar.hasClass( "open" ) ).to.equal( true );
			expect( $topBar.is( ":visible" ) ).to.equal( true );
		});
	});
});

}( jQuery, wb ));
