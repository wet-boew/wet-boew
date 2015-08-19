/**
 * @title data-ajax Plugin Unit Tests
 * @overview Test the data-ajax plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, after, sinon */
/* jshint unused:vars */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "data-ajax test suite", function() {
	var spy,
		sandbox = sinon.sandbox.create(),
		$document = wb.doc,
		$body = $document.find( "body" ),
		ajax = {
			"/data-ajax.html": "<!DOCTYPE html><html lang='en'><section class='ajaxed-in'><p>Ajaxed In</p></section></html>",
			"/data-ajax-update.html": "<!DOCTYPE html><html lang='en'><section class='ajaxed-updated'><p>Ajax Updated</p></section></html>",
			"/data-ajax-filtered.html": "<!DOCTYPE html><html lang='en'><section class='outer'><p>Lorem Ipsum</p><p id='inner'>Hash Filtered Element</p><p class='filter'>Class Filtered Element</p><p class='filter'>Class Filtered Element</p></section></html>"
		},
		createElm = function( type, url, done ) {
			var $elm = $( "<div class='ajax' data-ajax-" + type + "='" + url + "'>test</div>" );

			callback = done;
			$elm
				.appendTo( $body )
				.trigger( "wb-init.wb-data-ajax" );

			server.respond();

			return $elm;
		},
		server, callback;

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before( function() {

		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );

		server = sinon.fakeServer.create();

		server.respondWith( "/data-ajax.html", ajax[ "/data-ajax.html" ] );
		server.respondWith( "/data-ajax-update.html", ajax[ "/data-ajax-update.html" ] );
		server.respondWith( "/data-ajax-filtered.html", ajax[ "/data-ajax-filtered.html" ] );

		$document.on( "ajax-fetched.wb ajax-failed.wb", ".ajax", function() {
			if ( typeof callback === "function" ) {
				callback();
			}
		} );
	} );

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after( function() {

		// Restore the original behaviour of trigger once the tests are finished
		sandbox.restore();
	} );

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {
		var $elm;

		before( function() {
			$elm = createElm( "replace", "/data-ajax.html" );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should trigger an ajax-fetch.wb event", function() {
			var arg,
				len = spy.args.length,
				isEvent = false;
			while ( len-- && !isEvent ) {
				arg = spy.args[ len ][ 0 ];
				isEvent = typeof arg === "object" && arg.type === "ajax-fetch.wb";
			}
			expect( isEvent ).to.equal( true );
		} );
	} );

	/*
	 * Test data-ajax-before
	 */
	describe( "data-ajax-before", function() {
		var $elm, $before;

		before( function( done ) {
			$elm = createElm( "before", "/data-ajax.html", done );
		} );

		after( function() {
			$elm.remove();
			$before.remove();
		} );

		it( "should add the .wb-data-ajax-before-inited class", function() {
			expect( $elm.hasClass( "wb-data-ajax-before-inited" ) ).to.equal( true );
		} );

		it( "should load an element before itself", function() {
			$before = $elm.prev( ".ajaxed-in" );
			expect( $before.length ).to.be.greaterThan( 0 );
			expect( $before.children().length ).to.be.greaterThan( 0 );
		} );
	} );

	/*
	 * Test data-ajax-after
	 */
	describe( "data-ajax-after", function() {
		var $elm, $after;

		before( function( done ) {
			$elm = createElm( "after", "/data-ajax.html", done );
		} );

		after( function() {
			$elm.remove();
			$after.remove();
		} );

		it( "should add the .wb-data-ajax-after-inited class", function() {
			expect( $elm.hasClass( "wb-data-ajax-after-inited" ) ).to.equal( true );
		} );

		it( "should load an element after itself", function() {
			$after = $elm.next( ".ajaxed-in" );
			expect( $after.length ).to.be.greaterThan( 0 );
			expect( $after.children().length ).to.be.greaterThan( 0 );
		} );
	} );

	/*
	 * Test data-ajax-replace
	 */
	describe( "data-ajax-replace", function() {
		var $elm;

		before( function( done ) {
			$elm = createElm( "replace", "/data-ajax.html", done );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should add the .wb-data-ajax-replace-inited class", function() {
			expect( $elm.hasClass( "wb-data-ajax-replace-inited" ) ).to.equal( true );
		} );

		it( "should replace its content", function() {
			var $replace = $elm.find( ".ajaxed-in" );
			expect( $elm.children().first()[ 0 ] ).to.equal( $replace[ 0 ] );
			expect( $replace.length ).to.be.greaterThan( 0 );
			expect( $replace.children().length ).to.be.greaterThan( 0 );
		} );
	} );

	/*
	 * Test data-ajax-prepend
	 */
	describe( "data-ajax-prepend", function() {
		var $elm;

		before( function( done ) {
			$elm = createElm( "prepend", "/data-ajax.html", done );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should add the .wb-data-ajax-prepend-inited class", function() {
			expect( $elm.hasClass( "wb-data-ajax-prepend-inited" ) ).to.equal( true );
		} );

		it( "should prepend to its content", function() {
			var $prepend = $elm.find( ".ajaxed-in" );
			expect( $elm.children().first()[ 0 ] ).to.equal( $prepend[ 0 ] );
			expect( $prepend.length ).to.be.greaterThan( 0 );
			expect( $prepend.children().length ).to.be.greaterThan( 0 );
		} );
	} );

	/*
	 * Test data-ajax-append
	 */
	describe( "data-ajax-append", function() {
		var $elm;

		before( function( done ) {
			$elm = createElm( "append", "/data-ajax.html", done );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should add the .wb-data-ajax-append-inited class", function() {
			expect( $elm.hasClass( "wb-data-ajax-append-inited" ) ).to.equal( true );
		} );

		it( "should append to its content", function() {
			var $append = $elm.find( ".ajaxed-in" );
			expect( $elm.children().last()[ 0 ] ).to.equal( $append[ 0 ] );
			expect( $append.length ).to.be.greaterThan( 0 );
			expect( $append.children().length ).to.be.greaterThan( 0 );
		} );
	} );

	/*
	 * Test filtered data-ajax
	 */
	describe( "filtered data-ajax", function() {
		var $elm;

		describe( "with a hash selector", function() {
			before( function( done ) {
				$elm = createElm( "replace", "/data-ajax-filtered.html#inner", done );

			} );

			after( function() {
				$elm.remove();
			} );

			it( "should add the .wb-data-ajax-replace-inited class", function() {
				expect( $elm.hasClass( "wb-data-ajax-replace-inited" ) ).to.equal( true );
			} );

			it( "should append to its content", function() {
				expect( $elm.find( ".outer" ).length ).to.equal( 0 );
				expect( $elm.find( "#inner" ).length ).to.be.greaterThan( 0 );
			} );
		} );

		describe( "with a class selector", function() {
			before( function( done ) {
				$elm = createElm( "replace", "/data-ajax-filtered.html .filter+.filter", done );

			} );

			after( function() {
				$elm.remove();
			} );

			it( "should add the .wb-data-ajax-replace-inited class", function() {
				expect( $elm.hasClass( "wb-data-ajax-replace-inited" ) ).to.equal( true );
			} );

			it( "should append to its content", function() {
				expect( $elm.find( ".outer, #inner" ).length ).to.equal( 0 );
				expect( $elm.find( ".filter" ).length ).to.be( 1 );
			} );
		} );

		describe( "with a complex selector", function() {
			before( function( done ) {
				$elm = createElm( "replace", "/data-ajax-filtered.html .filter", done );

			} );

			after( function() {
				$elm.remove();
			} );

			it( "should add the .wb-data-ajax-replace-inited class", function() {
				expect( $elm.hasClass( "wb-data-ajax-replace-inited" ) ).to.equal( true );
			} );

			it( "should append to its content", function() {
				expect( $elm.find( ".outer, #inner" ).length ).to.equal( 0 );
				expect( $elm.find( ".filter" ).length ).to.be( 2 );
			} );
		} );

		describe( "without filtered content", function() {
			before( function( done ) {
				$elm = createElm( "replace", "/data-ajax-filtered.html#invalid", done );

			} );

			after( function() {
				$elm.remove();
			} );

			it( "should add the .wb-data-ajax-replace-inited class", function() {
				expect( $elm.hasClass( "wb-data-ajax-replace-inited" ) ).to.equal( true );
			} );

			it( "should ignore the request if no filtered content is found", function() {
				expect( $elm.text() ).to.equal( "test" );
			} );
		} );
	} );

	/*
	 * Test dynamic data-ajax
	 */
	describe( "dynamic data-ajax", function() {
		var $elm;

		before( function( done ) {
			$elm = createElm( "append", "/data-ajax.html", done );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should use the updated URL", function( done ) {
			callback = done;

			$elm
				.attr( "data-ajax-append", "/data-ajax-update.html" )
				.trigger( "wb-update.wb-data-ajax" );
			server.respond();

			callback = function() {
				expect( $elm.find( ".ajaxed-updated" ).length ).to.be.greaterThan( 0 );
				done();
			};
		} );
	} );
} );

}( jQuery, wb ) );
