/*
 * @title Prettify Plugin Unit Tests
 * @overview Test the Prettify plugin behaviour
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
describe( "Prettify test suite", function() {
	var spy;

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before(function(done) {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sinon.spy( $.prototype, "trigger" );

		// Start the tests once the plugin has been initialized
		$( ".wb-prettify" ).removeClass( "all-pre" );
		vapour.doc.on( "prettyprint.wb-prettify", function() {
			done();
		});
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		$.prototype.trigger.restore();

		// Remove test data from the page
		$( "pre.test" ).remove();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have a prettyprint.wb-prettify event", function() {
			expect( spy.calledWith( "prettyprint.wb-prettify" ) ).to.equal( true );
		});

		it( "should have been triggered on a .wb-prettify element", function() {
			var len = spy.thisValues.length,
				isSelector = false;
			while ( !isSelector && len-- ) {
				isSelector = spy.thisValues[ len ].selector === ".wb-prettify";
			}
			expect( isSelector ).to.equal( true );
		});

		it( "should have created a window.prettyPrint function", function() {
			expect( typeof window.prettyPrint ).to.equal( "function" );
		});

		it( "should have added a .prettyprinted CSS class to pre.prettyprint elements", function() {
			$( "pre.prettyprint" ).each(function() {
				expect( this.className.indexOf( "prettyprinted" ) ).to.be.greaterThan( -1 );
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

			$( "body" ).append( "<pre class='test'>" );
			$(".wb-prettify")
				.addClass("lang-sql")
				.addClass("all-pre")
				.addClass("linenums")
				.trigger("timerpoke.wb");
			vapour.doc.on( "prettyprint.wb-prettify", function() {
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

			$( "body" ).append( "<pre class='test'>" );
			$(".wb-prettify")
				.data({
					"allpre": true,
					"linenums": true
				})
				.trigger("timerpoke.wb");
			vapour.doc.on( "prettyprint.wb-prettify", function() {
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

}( jQuery, vapour ));
