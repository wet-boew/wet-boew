/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Feeds Unit Tests
 * @overview Test the web feeds plugin behaviour
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
describe( "Feeds test suite", function() {
	var stubs = {},
		sandbox = sinon.sandbox.create();

	before(function() {

		// Stub the $.ajax method to return test feed data to the done() handler.
		// This must be used instead of Sinon's fakeServer because the plugin uses
		// JSON-P for the request: http://sinonjs.org/docs/#json-p
		stubs.ajax = sandbox.stub( $, "ajax" ).returns((function() {
			var deferred = $.Deferred();
			deferred.resolve( { responseData:	{
				feed: {
					entries: [ {
						title: "Test entry 1",
						link: "http://foo.com",
						publishedDate: "Mon, 27 Jan 2014 21:00:00 -0500"
					},{
						title: "Test entry 2",
						link: "http://bar.com",
						publishedDate: "Wed, 29 Jan 2014 21:00:00 -0500"
					},{
						title: "Test entry 3",
						link: "http://baz.com",
						publishedDate: "Fri, 31 Jan 2014 21:00:00 -0500"
					} ]
				} } } );
			return deferred;
		}()));
	});

	after(function() {
		sandbox.restore();
	});

	/*
	 * Test the initialization of the plugin
	 */
	describe( "plugin init", function() {
		var $elm;

		before(function() {

			// Create the feed element
			$elm = $( "<div class='wb-feeds'><ul class='feeds-cont'>" +
				"<li><a href='http://foobar.com/'></a></li>" +
				"</ul></div>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-feeds" );
		});

		after(function() {
			$elm.remove();
		});

		it( "should have added the plugin init class to the element", function() {
			expect( $elm.hasClass( "wb-feeds-inited" ) ).to.equal( true );
		});

		it( "should have made an ajax call to load the feed entries", function() {
			var i = 0,
				args = stubs.ajax.args,
				len = args.length,
				isLookup = false,
				feedurl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
					encodeURIComponent( decodeURIComponent( "http://foobar.com/" ) );

			for ( ; i !== len && !isLookup; i += 1 ) {
				if ( args[ i ] instanceof Array ) {
					isLookup = args[ i ].length && args[ i ][ 0 ].url === feedurl;
				}
			}
			expect( isLookup ).to.equal( true );
		});

		it( "should have populated .feeds-cont with 3 feed links", function() {
			expect( $elm.find( ".feeds-cont > li" ).length ).to.equal( 3 );
		});
	});

	/*
	 * Test limiting feed entries
	 */
	describe( "feed entries limit", function() {
		var $elm;

		before(function() {

			// Create the feed element
			$elm = $( "<div class='wb-feeds limit-2'><ul class='feeds-cont'>" +
				"<li><a href='http://foobar.com/'></a></li>" +
				"</ul></div>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-feeds" );
		});

		after(function() {
			$elm.remove();
		});

		it( "should have limited to 2 feed entries", function() {
			expect( $elm.find( ".feeds-cont > li" ).length ).to.equal( 2 );
		});
	});

	/*
	 * Test loading multiple feeds
	 */
	describe( "multiple feed links", function() {
		var $elm;

		before(function() {
			stubs.ajax.reset();

			// Create the feed element
			$elm = $( "<div class='wb-feeds'><ul class='feeds-cont'>" +
				"<li><a href='http://foobar.com/'></a></li>" +
				"<li><a href='http://bazbam.com/'></a></li>" +
				"</ul></div>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-feeds" );
		});

		after(function() {
			$elm.remove();
		});

		it( "should have made two ajax calls to load the feed entries", function() {
			var i = 0,
				args = stubs.ajax.args,
				len = args.length,
				isLookup1 = false,
				isLookup2 = false,
				feedurl1 = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
					encodeURIComponent( decodeURIComponent( "http://foobar.com/" ) ),
				feedurl2 = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
					encodeURIComponent( decodeURIComponent( "http://bazbam.com/" ) );

			for ( ; i !== len; i += 1 ) {
				if ( args[ i ] instanceof Array ) {
					isLookup1 = isLookup1 || ( args[ i ].length && args[ i ][ 0 ].url === feedurl1 );
					isLookup2 = isLookup2 || ( args[ i ].length && args[ i ][ 0 ].url === feedurl2 );
				}
			}
			expect( isLookup1 ).to.equal( true );
			expect( isLookup2 ).to.equal( true );
		});

		it( "should have populated .feeds-cont with 6 feed links", function() {
			expect( $elm.find( ".feeds-cont > li" ).length ).to.equal( 6 );
		});
	});
});

}( jQuery, wb ));
