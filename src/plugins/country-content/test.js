/**
 * @title Country Content Plugin Unit Tests
 * @overview Test the country content plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Country Content test suite", function() {

	/*
	 * Test the initialization and default behaviour of the plugin
	 */
	describe( "init behaviour", function() {
		var $elm,
			stubs = {},
			sandbox = sinon.createSandbox();

		before( function() {

			// Stub the $.ajax method to return data.country = "CA" on success.
			// This must be used instead of Sinon's fakeServer because the plugin uses
			// JSON-P for the request: https://sinonjs.org/docs/#json-p
			stubs.ajax = sandbox.stub( $, "ajax" ).yieldsTo( "success", { country: "CA" } );
			stubs.load = sandbox.stub( $.prototype, "load" );

			// Clear out any previously saved country code
			localStorage.removeItem( "countryCode" );

			// Trigger plugin init
			$elm = $( "<div data-ctrycnt='ajax/country-content-{country}-en.html'>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-ctrycnt" );
		} );

		after( function() {

			// Restore original behaviour of $.ajax
			sandbox.restore();
			$elm.remove();
		} );

		it( "should have added the wb-ctrycnt-inited CSS class", function() {
			expect( $elm.hasClass( "wb-ctrycnt-inited" ) ).to.equal( true );
		} );

		it( "should have performed a geo IP lookup", function() {
			var i = 0,
				args = stubs.ajax.args,
				len = args.length,
				isLookup = false;

			for ( ; i !== len && !isLookup; i += 1 ) {
				if ( args[ i ] instanceof Array ) {
					isLookup = args[ i ].length && args[ i ][ 0 ].url === "https://api.country.is/";
				}
			}
			expect( isLookup ).to.equal( true );
		} );

		it( "should have saved the country code", function() {
			expect( localStorage.getItem( "countryCode" ) ).to.equal( "CA" );
		} );
	} );

	/*
	 * Test loading specific content
	 */
	describe( "load specific country content from localStorage", function() {
		var $elm,
			stubs = {},
			sandbox = sinon.createSandbox();

		before( function( done ) {

			stubs.load = sandbox.stub( $.prototype, "load" );

			// Load the US content
			localStorage.setItem( "countryCode", "US" );

			// Trigger plugin init
			$elm = $( "<div data-ctrycnt='ajax/country-content-{country}-en.html'>" )
				.appendTo( wb.doc.find( "body" ) )
				.trigger( "wb-init.wb-ctrycnt" );

			// Give the content time to load
			setTimeout( done, 100 );
		} );

		after( function() {
			sandbox.restore();
			$elm.remove();
		} );

		it( "should have saved the country code", function() {
			expect( localStorage.getItem( "countryCode" ) ).to.equal( "US" );
		} );

		it( "should have loaded the country specific content", function() {
			expect( stubs.load.calledWith( "ajax/country-content-us-en.html" ) ).to.equal( true );
		} );

	} );
} );

}( jQuery, wb ) );
