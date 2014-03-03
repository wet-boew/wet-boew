/**
 * @title Prettify Plugin Unit Tests
 * @overview Test the Prettify plugin behaviour
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
describe( "Prettify test suite", function() {
	var spy, $prettify,
		$body = wb.doc.find( "body" ),
		sandbox = sinon.sandbox.create();

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function(done) {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );

		// Start the tests once the plugin has been initialized
		wb.doc.on( "prettyprint.wb-prettify", function() {
			done();
		});

		// Add the test elements
		$prettify = $( "<span class='wb-prettify lang-css'>" )
			.appendTo( $body )
			.trigger( "wb-init.wb-prettify" );

		$body.append( "<pre class='test prettyprint'>" );
		$body.append( "<pre class='test noprettify'>" );
	});

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		sandbox.restore();

		// Remove test elements from the page
		$prettify.remove();
		$( "pre.test" ).remove();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have marked the element as initialized", function() {
			expect( $prettify.hasClass( "wb-prettify-inited" ) ).to.equal( true );
		});

		it( "should have created a window.prettyPrint function", function() {
			expect( typeof window.prettyPrint ).to.equal( "function" );
		});

		it( "should have added a .prettyprinted CSS class to pre.prettyprint elements", function() {
			$( "pre.prettyprint" ).each(function() {
				expect( this.className.indexOf( "prettyprinted" ) ).to.be.greaterThan( -1 );
			});
		});

		it( "should not have added a .prettyprinted CSS class to pre elements without a .prettyprint class", function() {
			$( "pre.noprettify" ).each(function() {
				expect( this.className.indexOf( "prettyprinted" ) ).to.equal( -1 );
			});
		});
	});

	/*
	 * Test default plugin settings
	 */
	describe( "dependency loading", function() {

		it( "should have loaded prettify.js file", function() {
			expect( $("script[src*='deps/prettify']") ).to.have.length( 1 );
		});

		it( "should have loaded lang-css.js syntax file", function() {
			expect( $("script[src*='/lang-css']") ).to.have.length( 1 );
		});

		it( "should have not have loaded lang-sql.js syntax file", function() {
			expect( $("script[src*='/lang-sql']") ).to.have.length( 0 );
		});
	});

	/*
	 * Test plugin settings
	 */
	describe( "override plugin settings with CSS classes", function() {

		before(function( done ) {

			$body.append( "<pre class='test'>" );
			$prettify
				.removeClass( "wb-prettify-inited" )
				.addClass( "lang-sql" )
				.addClass( "all-pre" )
				.addClass( "linenums" )
				.trigger( "wb-init.wb-prettify" );
			wb.doc.on( "prettyprint.wb-prettify", function() {
				done();
			});
		});

		it( "should have loaded lang-sql.js syntax file", function() {
			expect( $("script[src*='/lang-sql']") ).to.have.length( 1 );
		});

		it( "should have added a .prettyprinted CSS class to all pre elements", function() {
			$( "pre:visible" ).each(function() {
				expect( this.className.indexOf( "prettyprinted" ) ).to.be.greaterThan( -1 );
			});
		});

		it( "should have added a .linenums CSS class to all pre elements", function() {
			$( "pre:visible" ).each(function() {
				expect( this.className.indexOf( "linenums" ) ).to.be.greaterThan( -1 );
			});
		});
	});

	/*
	 * Test plugin settings
	 */
	describe( "override plugin settings with data attributes", function() {

		before(function( done ) {

			$body.append( "<pre class='test'>" );
			$prettify
				.removeClass( "wb-prettify-inited" )
				.data({
					allpre: true,
					linenums: true
				})
				.trigger( "wb-init.wb-prettify" );
			wb.doc.on( "prettyprint.wb-prettify", function() {
				done();
			});
		});

		it( "should have added a .prettyprinted CSS class to all pre elements", function() {
			$( "pre:visible" ).each(function() {
				expect( this.className.indexOf( "prettyprinted" ) ).to.be.greaterThan( -1 );
			});
		});

		it( "should have added a .linenums CSS class to all pre elements", function() {
			$( "pre:visible" ).each(function() {
				expect( this.className.indexOf( "linenums" ) ).to.be.greaterThan( -1 );
			});
		});
	});
});

}( jQuery, wb ));
