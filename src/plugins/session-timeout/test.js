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
		spies = {},
		stubs = {};

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before(function( done ) {
		// Spy on jQuery's trigger and post methods
		spies.trigger = sinon.spy( $.prototype, "trigger" );
		spies.post = sinon.spy( $, "post" );

		// Stub for window.confirm() method:
		// Empty function declaration for IE8 and below allows it to be stubbed
		window.confirm = typeof window.confirm === "function" ? window.confirm : function() {};
		stubs.confirm = sinon.stub( window, "confirm", function() {
			return true;
		});

		// Fake server to test POST requests
		server = sinon.fakeServer.create();

		// Trigger the plugin's initialization
		setTimeout(function() {
			$( ".wb-session-timeout" ).trigger( "timerpoke.wb" );
			done();
		}, 500 );

		// Use a fake timer (allows for easy testing of setTimeout calls)
		clock = sinon.useFakeTimers();
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after(function() {
		// Restore the original behaviour of trigger and post once the tests are finished
		$.prototype.trigger.restore();
		$.post.restore();

		// Restore the window.confirm stub
		stubs.confirm.restore();

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
				isSelector = spies.trigger.thisValues[len].selector === ".wb-session-timeout";
			}
			expect( isSelector ).to.equal( true );
		});
	});

	describe( "inactivity", function() {

		before(function() {
			spies.trigger.reset();
			$( ".wb-session-timeout" )
				.data({
					"inactivity": 10000
				})
				.trigger( "timerpoke.wb" );
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

		it( "has no keepalive URL so should not call $.post", function() {
			expect( spies.post.called ).to.equal( false );
		});

	});

	describe( "refresh onclick", function() {

		before(function(){

			// Reset the state of the spies
			spies.trigger.reset();
			spies.post.reset();

			// Re-initialize the session timeout element
			$( ".wb-session-timeout" )
				.data({
					"refreshonclick": true,
					"refreshlimit": 42000
				})
				.trigger( "timerpoke.wb" );
		});

		it( "should trigger keepalive.wb-session-timeout on document click", function() {
			vapour.doc.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
		});

		it( "should trigger reset.wb-session-timeout on document click", function() {
			expect( spies.trigger.calledWith( "reset.wb-session-timeout" ) ).to.equal( true );
		});

		it( "has no keepalive URL so should not call $.post", function() {
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

	describe( "keepalive", function() {

		before(function(){

			// Setup the fake server response for all POST requests to foo.html
			server.respondWith( "POST", "foo.html", "true" );

			// Re-initialize the session timeout element
			$( ".wb-session-timeout" )
				.data({
					"keepalive": 5000,
					"keepaliveurl": "foo.html",
					"refreshonclick": true
				})
				.trigger( "timerpoke.wb" );
		});

		it( "should trigger keepalive.wb-session-timeout after 5000ms", function() {
			spies.trigger.reset();
			spies.post.reset();

			clock.tick( 5010 );
			expect( spies.trigger.calledWith( "keepalive.wb-session-timeout" ) ).to.equal( true );
		});

		it( "has a keepalive URL so should call $.post", function() {
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
