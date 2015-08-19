/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Feeds Unit Tests
 * @overview Test the web feeds plugin behaviour
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
describe( "Feeds test suite", function() {
	var sandbox = sinon.sandbox.create(),
		ajaxEvent = "ajax-fetch.wb",
		fetchedEvent = "ajax-fetched.wb",
		$document = wb.doc,
		ajaxCalls, callback;

	before( function() {

		//Replaces the ajax-fetch event handler with a simulated one
		$document.off( ajaxEvent );

		$document.on( ajaxEvent, function( event ) {
			ajaxCalls.push( event.fetch );
			$( event.target ).trigger( {
				type: fetchedEvent,
				fetch: {
					response: {
						responseData: {
							feed: {
								entries: [
									{
										title: "Test entry 1",
										link: "http://foo.com",
										publishedDate: "Mon, 27 Jan 2014 21:00:00 -0500"
									},
									{
										title: "Test entry 2",
										link: "http://bar.com",
										publishedDate: "Wed, 29 Jan 2014 21:00:00 -0500"
									},
									{
										title: "Test entry 3",
										link: "http://baz.com",
										publishedDate: "Fri, 31 Jan 2014 21:00:00 -0500"
									}
								]
							}
						}
					}
				}
			}, event.fetch.context );
		} );

		$document.on( "wb-feed-ready.wb-feeds", ".wb-feeds .feeds-cont", function() {
			callback();
		} );
	} );

	after( function() {
		sandbox.restore();
	} );

	/*
	 * Test the initialization of the plugin
	 */
	describe( "plugin init", function() {
		var $elm;

		before( function( done ) {
			ajaxCalls = [];
			callback = done;

			// Create the feed element
			$elm = $( "<div class='wb-feeds'><ul class='feeds-cont'>" +
				"<li><a href='http://foobar.com/'></a></li>" +
				"</ul></div>" )
				.appendTo( $document.find( "body" ) )
				.trigger( "wb-init.wb-feeds" );

		} );

		after( function() {
			$elm.remove();
		} );

		it( "should have added the plugin init class to the element", function() {
			expect( $elm.hasClass( "wb-feeds-inited" ) ).to.equal( true );
		} );

		it( "should have made an ajax call to load the feed entries", function() {
			var i = 0,
				len = ajaxCalls.length,
				isLookup = false,
				feedurl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
					encodeURIComponent( decodeURIComponent( "http://foobar.com/" ) );

			for ( ; i !== len && !isLookup; i += 1 ) {
				isLookup = ajaxCalls.length && ajaxCalls[ i ].url === feedurl;
			}
			expect( isLookup ).to.equal( true );
		} );

		it( "should have populated .feeds-cont with 3 feed links", function() {
			expect( $elm.find( ".feeds-cont > li" ).length ).to.equal( 3 );
		} );
	} );

	/*
	 * Test limiting feed entries
	 */
	describe( "feed entries limit", function() {
		var $elm;

		before( function( done ) {
			ajaxCalls = [];
			callback = done;

			// Create the feed element
			$elm = $( "<div class='wb-feeds limit-2'><ul class='feeds-cont'>" +
				"<li><a href='http://foobar.com/'></a></li>" +
				"</ul></div>" )
				.appendTo( $document.find( "body" ) )
				.trigger( "wb-init.wb-feeds" );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should have limited to 2 feed entries", function() {
			expect( $elm.find( ".feeds-cont > li" ).length ).to.equal( 2 );
		} );
	} );

	/*
	 * Test loading multiple feeds
	 */
	describe( "multiple feed links", function() {
		var $elm;

		before ( function( done ) {
			ajaxCalls = [];
			callback = done;

			// Create the feed element
			$elm = $( "<div class='wb-feeds'><ul class='feeds-cont'>" +
				"<li><a href='http://foobar.com/'></a></li>" +
				"<li><a href='http://bazbam.com/'></a></li>" +
				"</ul></div>" )
				.appendTo( $document.find( "body" ) )
				.trigger( "wb-init.wb-feeds" );
		} );

		after( function() {
			$elm.remove();
		} );

		it( "should have made two ajax calls to load the feed entries", function() {
			var i = 0,
				len = ajaxCalls.length,
				isLookup1 = false,
				isLookup2 = false,
				feedurl1 = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
					encodeURIComponent( decodeURIComponent( "http://foobar.com/" ) ),
				feedurl2 = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" +
					encodeURIComponent( decodeURIComponent( "http://bazbam.com/" ) );

			for ( ; i !== len; i += 1 ) {
				isLookup1 = isLookup1 || ( ajaxCalls.length && ajaxCalls[ i ].url === feedurl1 );
				isLookup2 = isLookup2 || ( ajaxCalls.length && ajaxCalls[ i ].url === feedurl2 );
			}
			expect( isLookup1 ).to.equal( true );
			expect( isLookup2 ).to.equal( true );
		} );

		it( "should have populated .feeds-cont with 6 feed links", function() {
			expect( $elm.find( ".feeds-cont > li" ).length ).to.equal( 6 );
		} );
	} );
} );

}( jQuery, wb ) );
