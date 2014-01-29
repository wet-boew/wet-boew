/**
 * @title Country Content Plugin Unit Tests
 * @overview Test the country content plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before */
/* jshint unused:vars */
(function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Country Content test suite", function() {
	var country;

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before(function( done ) {

		// Increase test timeout to allow http://freegeoip.net time to respond
		this.timeout( 5000 );

		// Lookup the country code for this test run.  Lookup times out before the test
		// to prevent a failed lookup from throwing a test error.
		$.ajax({
			url: "http://freegeoip.net/json/",
			dataType: "json",
			cache: true,
			timeout: 5000
		})
			.done(function( data ) {
				country = data && data.country_code ? data.country_code.toLowerCase() : "";
			})
			.always(function() {
				done();
			});
	});

	/*
	 * Test the initialization of the plugin
	 */
	describe( "init behaviour", function() {
		var $elm;

		before(function( done) {
			// Clear out any previously saved country code
			localStorage.removeItem( "countryCode" );

			// Trigger plugin init and give it time to load the content
			$elm = $( "<div data-ctrycnt='ajax/country-content-{country}-en.html'>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-ctrycnt" );
			setTimeout( done, 500 );
		});

		it( "should have added the wb-ctrycnt-inited CSS class", function() {
			expect( $elm.hasClass( "wb-ctrycnt-inited" ) ).to.equal( true );
		});

		it( "should have loaded the country specific content (or left it unchanged if no country match)", function() {
			if ( country === "ca" || country === "us" ) {
				expect( $elm.find( ".ajaxed-in" ).hasClass( country ) ).to.equal( true );
			} else {
				expect( $elm.find( ".ajaxed-in" ).length ).to.equal( 0 );
			}
		});
	});

	/*
	 * Test loading specific content
	 */
	describe( "load specific country content from localStorage", function() {
		var $elm;

		before(function( done) {

			// Load the US content
			localStorage.setItem( "countryCode", "us" );

			// Trigger plugin init and give it time to load the content
			$elm = $( "<div data-ctrycnt='ajax/country-content-{country}-en.html'>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-ctrycnt" );
			setTimeout( done, 500 );
		});

		before(function( done ) {
			localStorage.setItem( "countryCode", "us" );

			// Trigger plugin init and give it time to load the content
			$elm
				.attr( "data-ctrycnt", "ajax/country-content-{country}-en.html" )
				.removeClass( "wb-ctrycnt-inited" )
				.trigger( "wb-init.wb-ctrycnt" );
			setTimeout( done, 500 );
		});

		it( "should have loaded the US content", function() {
			expect( $elm.find( ".ajaxed-in" ).hasClass( "us" ) ).to.equal( true );
		});
	});
});

}( jQuery, wb ));
