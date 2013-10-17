/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Session Timeout Plugin Unit Tests
 * @overview Test the session timeout plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
/* global jQuery, describe, it, expect, before, after, sinon */
/* jshint unused:vars */
(function( $, vapour ) {

/*
 * Create a suite of related test cases using `describe`.  Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Session Timeout test suite", function() {

	var clock,
		server,
		spies = {};

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before(function( done ) {
		// Spy on jQuery's trigger and post methods
		spies.trigger = sinon.spy( $.prototype, "trigger" );
		spies.post = sinon.spy( $, "post" );

		// Fake server to test POST requests
		server = sinon.fakeServer.create();

		// Use a fake timer (allows for easy testing of setTimeout calls)
		clock = sinon.useFakeTimers();

		// Wait for the reset event from the plugin's init method before beginning the test
		$( ".wb-session-timeout" )
			.data( "wet-boew", {
				"inactivity": 10000,
				"sessionalive": 10000,
				"refreshOnClick": true,
				"refreshLimit": 42000
			})
			.on( "reset.wb-session-timeout", function() {
				done();
			});

		vapour.doc.on( "show.wb-modal", function() {
			$( ".wb-session-timeout-confirm.btn-primary" ).trigger( "click" );
		});
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after(function() {
		// Restore the original behaviour of trigger and post once the tests are finished
		$.prototype.trigger.restore();
		$.post.restore();

		// Restore server
		server.restore();

		// Restore the global clock
		clock.restore();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should trigger reset.wb-session-timeout event", function() {
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( true );
		});

		it( "should have been triggered on a .wb-session-timeout element", function() {
			var len = spies.trigger.thisValues.length,
				isSelector = false;
			while ( !isSelector && len-- ) {
				isSelector = spies.trigger.thisValues[len][0].className.indexOf( "wb-session-timeout" ) > -1;
			}
			expect( isSelector ).to.equal( true );
		});
	});

	describe( "inactivity", function() {

		before(function() {
			spies.trigger.reset();
		});

		it( "should trigger inactivity.wb-session-timeout after 10000ms", function() {
			clock.tick( 10010 );
			expect( spies.trigger.calledWith( "inactivity.wb-session-timeout" ) ).to.equal( true );
		});

		it( "should trigger keepalive.wb-session-timeout event after 10000ms", function() {
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
		});

		it( "should trigger reset.wb-session-timeout event after 10000ms", function() {
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( true );
		});

		it( "should trigger build.wb-modal event after 10000ms", function() {
			expect( spies.trigger.calledWith( "build.wb-modal" ) ).to.equal( true );
		});

		it( "should trigger show.wb-modal event after 10000ms", function() {
			expect( spies.trigger.calledWith( "show.wb-modal" ) ).to.equal( true );
		});

		it( "should not have triggered inactivity events 19950ms", function() {
			spies.trigger.reset();
			clock.tick( 9940 );
			expect( spies.trigger.calledWith( "inactivity.wb-session-timeout" ) ).to.equal( false );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( false );
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( false );
		});

		it( "should have triggered inactivity events after 20000ms", function() {
			spies.trigger.reset();
			clock.tick( 100 );
			expect( spies.trigger.calledWith( "inactivity.wb-session-timeout" ) ).to.equal( true );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( true );
		});

		it( "has no refreshCallbackUrl so should not call $.post", function() {
			expect( spies.post.called ).to.equal( false );
		});

	});

	describe( "refresh onclick", function() {

		before(function(){
			// Reset the state of the spies
			spies.trigger.reset();
			spies.post.reset();
		});

		it( "should trigger keepalive.wb-session-timeout on document click", function() {
			clock.tick( 42010 );
			vapour.doc.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
		});

		it( "should trigger reset.wb-session-timeout on document click", function() {
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( true );
		});

		it( "has no refreshCallbackUrl so should not call $.post", function() {
			expect( spies.post.called ).to.equal( false );
		});

		it( "should not trigger keepalive.wb-session-timeout on document click (refresh limit prevents)", function() {
			spies.trigger.reset();

			vapour.doc.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( false );
		});

		it( "should trigger keepalive.wb-session-timeout on document click (refresh limit allows)", function() {
			spies.trigger.reset();
			clock.tick( 42010 );

			vapour.doc.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
		});
	});

	describe( "refreshCallbackUrl", function() {

		before(function( done ){
			// Setup the fake server response for all POST requests to foo.html
			server.respondWith( "POST", "foo.html", "true" );

			$( ".wb-session-timeout" )
				.data( "wet-boew", {
					"sessionalive": 5000,
					"refreshCallbackUrl": "foo.html"
				})
				.on( "reset.wb-session-timeout", function() {
					done();
				})
				.trigger( "timerpoke.wb" );
		});

		it( "should trigger keepalive.wb-session-timeout after 5000ms", function() {
			spies.trigger.reset();
			spies.post.reset();

			clock.tick( 5010 );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
		});

		it( "has refreshCallbackUrl so should call $.post", function() {
			expect( spies.post.called ).to.equal( true );
			expect( spies.post.calledWith( "foo.html" ) ).to.equal( true );
		});

		it( "successful response triggers reset.wb-session-timeout event", function() {
			server.respond();
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( true );
		});
	});

});

}( jQuery, vapour ));
