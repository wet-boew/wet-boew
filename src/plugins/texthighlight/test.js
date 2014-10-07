/*
 * @title Toggle Plugin Unit Tests
 * @overview Test the Toggle plugin behaviour
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
describe( "Text highlighting test suite", function() {
	var sandbox = sinon.sandbox.create(),
		$document = wb.doc,
		$body = $document.find( "body" ),
		componentName = "wb-txthl",
		selector = "." + componentName,
		initEvent = "wb-init" + selector,
		callback;

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before( function() {
		$document.on( "wb-ready" + selector, selector, function() {
			if ( callback ) {
				callback();
			}
		});
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after( function() {
		sandbox.restore();
	});

	/*
	 * Test initialization of the plugin
	 */
	describe( "init plugin", function() {
		var $elm;

		before( function( done ) {
			callback = done;

			$elm = $( "<div class='wb-txthl'></div>" )
				.appendTo( $body )
				.trigger( initEvent );
		});

		after( function() {
			$elm.remove();
		});

		it( "should have marked the element as initialized", function() {
			expect( $elm.hasClass( "wb-txthl-inited" ) ).to.equal( true );
		});
	});

	(wb.pageUrlParts.params.txthl ? describe : describe.skip)( "search query from the querystring", function() {

		var $elm, $matches;

		before( function( done ) {
			callback = done;

			$elm = $( "<div class='wb-txthl'><p>This is a test. It's just some testing.</p></div>" )
				.appendTo( $body )
				.trigger( initEvent );
		});

		after( function() {
			$elm.remove();
		});

		it( "should have highlighted words matching the query", function() {
			var matchesLength, m;

			$matches = $elm.find( ".txthl > mark" );
			matchesLength = $matches.length;

			expect( matchesLength ).to.equal( 2 );

			for ( m = 0; m < matchesLength; m += 1 ) {
				expect( $matches.eq( m ).text() ).to.equal( "test" );
			}
		});
	});

	describe( "dynamic search query", function() {
		var $elm, $matches;

		before( function( done ) {
			callback = done;

			$elm = $( "<div class='wb-txthl'><p>This is a test. It's just some testing.</p></div>" )
				.appendTo( $body )
				.trigger( {
					type: initEvent,
					txthl: "test"
				} );
		});

		after( function() {
			$elm.remove();
		});

		it( "should have highlighted words matching the query", function() {
			var matchesLength, m;

			$matches = $elm.find( ".txthl > mark" );
			matchesLength = $matches.length;

			expect( matchesLength ).to.equal( 2 );

			for ( m = 0; m < matchesLength; m += 1 ) {
				expect( $matches.eq( m ).text() ).to.equal( "test" );
			}
		});
	});
});

}( jQuery, wb ));
