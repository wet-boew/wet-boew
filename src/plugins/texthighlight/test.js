/*
 * @title Toggle Plugin Unit Tests
 * @overview Test the Toggle plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, beforeEach, after, afterEach, sinon */
/* jshint unused:vars */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Text highlighting test suite", function() {
	var sandbox = sinon.sandbox.create(),
		$document = wb.doc,
		$body = $document.find( "body" ),
		componentName = "wb-txthl",
		selector = "." + componentName,
		initEvent = "wb-init" + selector,
		defaultInitEventObj = {
			type: initEvent
		},
		initEventObj, callback, $elm;

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before( function() {
		$document.on( "wb-ready" + selector, selector, function() {
			if ( callback ) {
				callback();
			}
		} );
	} );

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after( function() {
		sandbox.restore();
	} );

	beforeEach( function( done ) {
		callback = done;

		$elm = $( "<div class='wb-txthl'><p>This is a test. It's just some testing.</p></div>" )
			.appendTo( $body )
			.trigger( initEventObj );
	} );

	afterEach( function() {
		$elm.remove();
	} );

	/*
	 * Test initialization of the plugin
	 */
	describe( "init plugin", function() {
		before( function() {
			initEventObj = defaultInitEventObj;
		} );

		it( "should have marked the element as initialized", function() {
			expect( $elm.hasClass( "wb-txthl-inited" ) ).to.equal( true );
		} );
	} );

	( wb.pageUrlParts.params.txthl ? describe : describe.skip )( "search query from the querystring", function() {
		var $matches;

		before( function() {
			initEventObj = defaultInitEventObj;
		} );

		it( "should have highlighted words matching the query", function() {
			var matchesLength;

			$matches = $elm.find( "mark.txthl" );
			matchesLength = $matches.length;

			expect( matchesLength ).to.equal( 3 );

			expect( $matches.eq( 0 ).text() ).to.equal( "test" );
			expect( $matches.eq( 1 ).text() ).to.equal( "just some" );
			expect( $matches.eq( 2 ).text() ).to.equal( "test" );
		} );
	} );

	describe( "dynamic search query", function() {
		var $matches;

		describe( "simple query", function() {
			before( function() {
				initEventObj = defaultInitEventObj;
				initEventObj.txthl = "test";
			} );

			it( "should have highlighted words matching the query", function() {
				var matchesLength, m;

				$matches = $elm.find( "mark.txthl" );
				matchesLength = $matches.length;

				expect( matchesLength ).to.equal( 2 );

				for ( m = 0; m < matchesLength; m += 1 ) {
					expect( $matches.eq( m ).text() ).to.equal( "test" );
				}
			} );
		} );

		describe( "complex query as a string", function() {
			before( function() {
				initEventObj = defaultInitEventObj;
				initEventObj.txthl = "just some|test";
			} );

			it( "should have highlighted words matching the query", function() {
				var matchesLength;

				$matches = $elm.find( "mark.txthl" );
				matchesLength = $matches.length;

				expect( matchesLength ).to.equal( 3 );

				expect( $matches.eq( 0 ).text() ).to.equal( "test" );
				expect( $matches.eq( 1 ).text() ).to.equal( "just some" );
				expect( $matches.eq( 2 ).text() ).to.equal( "test" );
			} );
		} );

		describe( "complex query as an array", function() {
			before( function() {
				initEventObj = defaultInitEventObj;
				initEventObj.txthl = [
					"just some",
					"test"
				];
			} );

			it( "should have highlighted words matching the query", function() {
				var matchesLength;

				$matches = $elm.find( "mark.txthl" );
				matchesLength = $matches.length;

				expect( matchesLength ).to.equal( 3 );

				expect( $matches.eq( 0 ).text() ).to.equal( "test" );
				expect( $matches.eq( 1 ).text() ).to.equal( "just some" );
				expect( $matches.eq( 2 ).text() ).to.equal( "test" );
			} );
		} );
	} );
} );

}( jQuery, wb ) );
