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
	var spy, callback,
		$bar = $( "<section id='bar' class='wb-overlay' style='height:1px; overflow:hidden;'>" +
				"<h2>Test Bar</h2>" +
			"</section>" ),
		$content = $( "<section class='wb-inview bar-demo' data-inview='bar'>" +
				"<h2>Content</h2>" +
			"</section>" ),
		$document = wb.doc,
		$window = wb.win,
		$body  = $document.find( "body" ),
		sandbox = sinon.sandbox.create(),
		componentName = "wb-inview",
		selector = "." + componentName,
		initEvent = "wb-init" + selector,
		scrollEvent = "scroll" + selector;

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function( done ) {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );
		callback = done;

		$document.on( initEvent + " " + scrollEvent, selector, function( event ) {
			callback();
		});

		$bar.appendTo( $body );

		$content
			.appendTo( $body )
			.trigger( initEvent );
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

	describe( "inview bottom", function() {

		before( function() {
			$bar.addClass( "wb-bar-b" );
		});

		after( function() {
			$bar.removeClass( "wb-bar-b" );
		});

		/*
		 * Test that inview bottom works as expected
		 * Testing with PhantomJS is excluded because grunt-mocha doesn't provide a way
		 * to set the viewport height to completely show the $content element.
		 */
		if ( !/PhantomJS/.test( navigator.userAgent ) ) {

			describe( "'all'", function() {

				before( function( done ) {
					callback = done;
					$window.scrollTop( $content.offset().top );
				});

				it( "should not have an inview bottom bar visible", function() {
					expect( $content.attr( "data-inviewstate" ) ).to.equal( "all" );
					expect( $bar.hasClass( "open" ) ).to.equal( false );
					expect( $bar.is( ":visible" ) ).to.equal( false );
				});
			});
		}

		describe( "'partial'", function() {

			before(function( done ) {
				callback = done;
				$window.scrollTop( $content.offset().top + 50 );
			});

			it( "should have an inview bottom bar visible", function() {
				expect( $content.attr( "data-inviewstate" ) ).to.equal( "partial" );
				expect( $bar.hasClass( "open" ) ).to.equal( true );
				expect( $bar.is( ":visible" ) ).to.equal( true );
			});
		});

		describe( "'none'", function() {

			before(function( done ) {
				callback = done;
				$window.scrollTop( $content.offset().top + 500 );
			});

			it( "should have an inview bottom bar visible", function() {
				expect( $content.attr( "data-inviewstate" ) ).to.equal( "none" );
				expect( $bar.hasClass( "open" ) ).to.equal( true );
				expect( $bar.is( ":visible" ) ).to.equal( true );
			});
		});

	});

	describe( "inview top", function() {

		before( function() {
			$bar.addClass( "wb-bar-t" );
		});

		/*
		 * Test that inview top works as expected.
		 * Testing with PhantomJS is excluded because grunt-mocha doesn't provide a way
		 * to set the viewport height to completely show the $content element.
		 */
		if ( !/PhantomJS/.test( navigator.userAgent ) ) {

			describe( "'all'", function() {

				before(function( done ) {
					callback = done;
					$window.scrollTop( $content.offset().top );
				});

				it( "should not have an inview top bar visible", function() {
					expect( $content.attr( "data-inviewstate" ) ).to.equal( "all" );
					expect( $bar.hasClass( "open" ) ).to.equal( false );
					expect( $bar.is( ":visible" ) ).to.equal( false );
				});
			});
		}

		describe( "'partial'", function() {

			before(function( done ) {
				callback = done;
				$window.scrollTop( $content.offset().top + 50 );
			});

			it( "should not have an inview top bar visible (.show-none CSS class prevents it)", function() {
				expect( $content.attr( "data-inviewstate" ) ).to.equal( "partial" );
				expect( $bar.hasClass( "open" ) ).to.equal( false );
				expect( $bar.is( ":visible" ) ).to.equal( false );
			});
		});

		describe( "'none'", function() {

			before(function( done ) {
				callback = done;
				$window.scrollTop( $content.offset().top + 500 );
			});

			it( "should have an inview top bar visible", function() {
				expect( $content.attr( "data-inviewstate" ) ).to.equal( "none" );
				expect( $bar.hasClass( "open" ) ).to.equal( true );
				expect( $bar.is( ":visible" ) ).to.equal( true );
			});
		});
	});
});

}( jQuery, wb ));
