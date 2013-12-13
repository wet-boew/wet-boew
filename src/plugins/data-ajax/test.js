/**
 * @title data-ajax Plugin Unit Tests
 * @overview Test the data-ajax plugin behaviour
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
describe( "data-ajax test suite", function() {
	var spy,
		sandbox = sinon.sandbox.create();

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function( done ) {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );
		
		$( "[data-ajax-replace]" ).on( "ajax-replace-loaded.wb", function() {
			done();
		});
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

		it( "should trigger an ajax-fetch.wb event", function() {
			var arg,
				len = spy.args.length,
				isEvent = false;
			while ( len-- && !isEvent ) {
				arg = spy.args[len][0];
				isEvent = typeof arg === "object" && arg.type === "ajax-fetch.wb";
			}
			expect( isEvent ).to.equal( true );
		});
		
		it( "should triger ajax-type-loaded.wb events", function() {
			var i,
				ajaxTypes = [
					"before",
					"replace",
					"after",
					"append",
					"prepend"
				],
				len = ajaxTypes.length;
			for ( i = 0; i !== len; i += 1 ) {
				expect( spy.calledWith( "ajax-" + ajaxTypes[ i ] + "-loaded.wb" ) ).to.equal( true );
			}
		});
	});
	
	/*
	 * Test data-ajax-before
	 */
	describe( "data-ajax-before", function() {
		it( "should load an element before itself", function() {
			var $before, $elm;
			
			$( ".wb-ajaxbefore-inited" ).each(function() {
				$elm = $( this );
				$before = $elm.prev( ".ajaxed-in" );
				
				expect( $elm.length ).to.be.greaterThan( 0 );
				expect( $before.length ).to.be.greaterThan( 0 );
				expect( $before.children().length ).to.be.greaterThan( 0 );
			});
		});
	});
	
	/*
	 * Test data-ajax-after
	 */
	describe( "data-ajax-after", function() {
		it( "should load an element after itself", function() {
			var $after, $elm;
			
			$( ".wb-ajaxafter-inited" ).each(function() {
				$elm = $( this );
				$after = $elm.next( ".ajaxed-in" );
				
				expect( $elm.length ).to.be.greaterThan( 0 );
				expect( $after.length ).to.be.greaterThan( 0 );
				expect( $after.children().length ).to.be.greaterThan( 0 );
			});
		});
	});
	
	/*
	 * Test data-ajax-replace
	 */
	describe( "data-ajax-replace", function() {
		it( "should replace its content", function() {
			var $replace, $elm;
			
			$( ".wb-ajaxreplace-inited" ).each(function() {
				$elm = $( this );
				$replace = $elm.find( ".ajaxed-in" );
				
				expect( $elm.length ).to.be.greaterThan( 0 );
				expect( $elm.children().first()[0] ).to.equal( $replace[0] );
				expect( $replace.length ).to.be.greaterThan( 0 );
				expect( $replace.children().length ).to.be.greaterThan( 0 );
			});
		});
	});
	
	/*
	 * Test data-ajax-prepend
	 */
	describe( "data-ajax-prepend", function() {
		it( "should prepend to its content", function() {
			var $prepend, $elm;
			
			$( ".wb-ajaxprepend-inited" ).each(function() {
				$elm = $( this );
				$prepend = $elm.find( ".ajaxed-in" );
				
				expect( $elm.length ).to.be.greaterThan( 0 );
				expect( $elm.children().first()[0] ).to.equal( $prepend[0] );
				expect( $prepend.length ).to.be.greaterThan( 0 );
				expect( $prepend.children().length ).to.be.greaterThan( 0 );
			});
		});
	});
			
	/*
	 * Test data-ajax-append
	 */
	describe( "data-ajax-append", function() {
		it( "should append to its content", function() {
			var $append, $elm;
			
			$( ".wb-ajaxappend-inited" ).each(function() {
				$elm = $( this );
				$append = $elm.find( ".ajaxed-in" );
				
				expect( $elm.length ).to.be.greaterThan( 0 );
				expect( $elm.children().last()[0] ).to.equal( $append[0] );
				expect( $append.length ).to.be.greaterThan( 0 );
				expect( $append.children().length ).to.be.greaterThan( 0 );
			});
		});
	});
});

}( jQuery, wb ));
