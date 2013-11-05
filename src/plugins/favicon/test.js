/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Favion Plugin Unit Tests
 * @overview Test the favicon plugin behaviour
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
describe( "Favicon test suite", function() {

	var spies = {};

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before(function( done ) {
		// Spy on jQuery's trigger methods
		spies.trigger = sinon.spy( $.prototype, "trigger" );

		vapour.doc.on( "mobile.wb-favicon", "link[rel='shortcut icon']", function() {
			done();
		});
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		$.prototype.trigger.restore();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should trigger mobile.wb-favicon event", function() {
			expect( spies.trigger.calledWith( "mobile.wb-favicon" ) ).to.equal( true );
		});

		it( "should have been triggered on a link[rel='shortcut icon'] element", function() {
			var len = spies.trigger.thisValues.length,
				isSelector = false;
			while ( !isSelector && len-- ) {
				isSelector = spies.trigger.thisValues[len].selector === "link[rel='shortcut icon']";
			}
			expect( isSelector ).to.equal( true );
		});
	});

	/*
	 * Test that a mobile favicon was added with the correct attributes
	 */
	describe( "create default mobile favicon", function() {

		var $favicon, $faviconMobile, href, path;
		before(function() {
			$favicon = $( "link[rel='shortcut icon']" );
			$faviconMobile = $( ".wb-favicon" );
			href = $favicon.attr( "href" );
			path = href.substring( 0, href.lastIndexOf( "/" ) + 1 );
		});

		it( "should have created a mobile favicon", function() {
			expect( $faviconMobile ).to.have.length( 1 );
		});

		it( "should have set a default 'rel' attribute", function() {
			expect( $faviconMobile.attr( "rel" ) ).to.equal( "apple-touch-icon" );
		});

		it( "should have set a default 'sizes' attribute", function() {
			expect( $faviconMobile.attr( "sizes" ) ).to.equal( "57x57 72x72 114x114 144x144 150x150" );
		});

		it( "should have set a default 'href' attribute", function() {
			expect( $faviconMobile.attr( "href" ) ).to.equal( path + "favicon-mobile.png" );
		});
	});

	/*
	 * Test that a mobile favicon can be created with custom data
	 */
	describe( "create custom mobile favicon", function() {

		var $favicon, $faviconMobile;
		before(function( done ) {
			$( ".wb-favicon" ).remove();

			vapour.doc.on( "mobile.wb-favicon", "link[rel='shortcut icon']", function() {
				$faviconMobile = $( ".wb-favicon" );
				done();
			});

			$favicon = $( "link[rel='shortcut icon']" );
			$favicon.data({
				rel: "apple-touch-icon-precompossed",
				sizes: "57x57",
				path: "foo/",
				filename: "bar"
			}).trigger( "timerpoke.wb" );


		});

		it( "should have created a mobile favicon", function() {
			expect( $faviconMobile ).to.have.length( 1 );
		});

		it( "should have set a custom 'rel' attribute", function() {
			expect( $faviconMobile.attr( "rel" ) ).to.equal( "apple-touch-icon-precompossed" );
		});

		it( "should have set a custom 'sizes' attribute", function() {
			expect( $faviconMobile.attr( "sizes" ) ).to.equal( "57x57" );
		});

		it( "should have set a custom 'href' attribute", function() {
			expect( $faviconMobile.attr( "href" ) ).to.equal( "foo/bar" );
		});
	});

	/*
	 * Test update of favicon
	 */
	describe( "update favicon", function() {

		var $favicon;
		before(function() {
			$( ".wb-favicon" ).remove();
			$favicon = $( "link[rel='shortcut icon']" );
			$favicon.trigger( "icon.wb-favicon", {
				path: "foobar/",
				filename: "baz"
			});
		});

		it( "should not have created a mobile favicon", function() {
			expect( $( ".wb-favicon" ) ).to.have.length( 0 );
		});

		it( "should have set a custom 'href' attribute", function() {
			expect( $favicon.attr( "href" ) ).to.equal( "foobar/baz" );
		});
	});
});

}( jQuery, vapour ));
