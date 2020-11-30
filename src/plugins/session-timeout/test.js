/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Session Timeout Plugin Unit Tests
 * @overview Test the session timeout plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Session Timeout test suite", function() {

	var clock, server, $session,
		spies = {},
		sandbox = sinon.sandbox.create(),
		$document = wb.doc,
		callback;

	this.timeout( 5000 );

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before( function( done ) {

		// Spy on jQuery's trigger and ajax methods
		spies.trigger = sandbox.spy( $.prototype, "trigger" );
		spies.ajax = sandbox.spy( $, "ajax" );

		callback = done;

		$document.on( "inactivity.wb-sessto", function() {
			$( ".wb-sessto-confirm.btn-primary" ).trigger( "click" );
		} );

		$document.on( "wb-ready.wb-sessto", ".wb-sessto", function() {
			if ( callback ) {
				callback();
			}
		} );

		$session = $( "<span class='wb-sessto'></span>" )
			.data( "wet-boew", {
				inactivity: 10000,
				sessionalive: 10000,
				refreshLimit: 42000,
				refreshOnClick: true
			} )
			.appendTo( $document.find( "body" ) )
			.trigger( "wb-init.wb-sessto" );
	} );

	/*
	 * After finishing the test suite, this function is executed once.
	 */
	after( function() {

		// Cleanup the test element
		$session.remove();
		$( "#wb-sessto-modal" ).remove();

		// Restore the original behaviour of spies, server and timer
		sandbox.restore();
	} );

	/*
	 * Test initialization of the plugin
	 */
	describe( "init plugin", function() {
		it( "should trigger reset.wb-sessto event", function() {
			expect( spies.trigger.calledWith( "reset.wb-sessto" ) ).to.equal( true );
		} );

		it( "should have marked the element as initialized", function() {
			expect( $session.hasClass( "wb-sessto-inited" ) ).to.equal( true );
		} );
	} );

	describe( "inactivity", function() {

		before( function( done ) {

			// Allow time for magnificPopup dependency to load
			setTimeout( function() {

				// Use a fake timer (allows for easy testing of setTimeout calls)
				clock = sandbox.useFakeTimers();

				// Reset the plugin timeouts and the trigger spy (prevents false positives from previous tests)
				$session.trigger( "reset.wb-sessto", $session.data( "wet-boew" ) );
				spies.trigger.reset();

				done();
			}, 500 );
		} );

		it( "should trigger inactivity.wb-sessto after 10000ms", function() {
			clock.tick( 10010 );
			expect( spies.trigger.calledWith( "inactivity.wb-sessto" ) ).to.equal( true );
		} );

		it( "should trigger keepalive.wb-sessto event after 10000ms", function() {
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( true );
		} );

		it( "should trigger reset.wb-sessto event after 10000ms", function() {
			expect( spies.trigger.calledWith( "reset.wb-sessto" ) ).to.equal( true );
		} );

		it( "should not have triggered inactivity events 19950ms", function() {
			spies.trigger.reset();
			clock.tick( 9940 );
			expect( spies.trigger.calledWith( "inactivity.wb-sessto" ) ).to.equal( false );
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( false );
			expect( spies.trigger.calledWith( "reset.wb-sessto" ) ).to.equal( false );
		} );

		it( "should have triggered inactivity events after 20000ms", function() {
			spies.trigger.reset();
			clock.tick( 100 );
			expect( spies.trigger.calledWith( "inactivity.wb-sessto" ) ).to.equal( true );
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( true );
			expect( spies.trigger.calledWith( "reset.wb-sessto" ) ).to.equal( true );
		} );

		it( "has no refreshCallbackUrl so should not call $.ajax", function() {
			expect( spies.ajax.called ).to.equal( false );
		} );

	} );

	describe( "refresh onclick", function() {

		before( function() {

			// Reset the state of the spies
			spies.trigger.reset();
			spies.ajax.reset();
		} );

		it( "should trigger keepalive.wb-sessto on document click", function() {
			clock.tick( 42010 );
			$document.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( true );
		} );

		it( "should trigger reset.wb-sessto on document click", function() {
			expect( spies.trigger.calledWith( "reset.wb-sessto" ) ).to.equal( true );
		} );

		it( "has no refreshCallbackUrl so should not call $.ajax", function() {
			expect( spies.ajax.called ).to.equal( false );
		} );

		it( "should not trigger keepalive.wb-sessto on document click (refresh limit prevents)", function() {
			spies.trigger.reset();

			$document.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( false );
		} );

		it( "should trigger keepalive.wb-sessto on document click (refresh limit allows)", function() {
			spies.trigger.reset();
			clock.tick( 42010 );

			$document.trigger( "click" );
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( true );
		} );
	} );

	describe( "refreshCallbackUrl", function() {

		before( function( done ) {

			// Setup the fake server response for all POST requests to foo.html
			server = sandbox.useFakeServer();
			server.respondWith( "POST", "foo.html", "true" );

			callback = done;

			// Add the session timeout element and trigger it's init'
			$session.data( "wet-boew", {
				sessionalive: 5000,
				refreshCallbackUrl: "foo.html"
			} )
				.removeClass( "wb-sessto-inited" )
				.trigger( "wb-init.wb-sessto" );
		} );

		it( "should trigger keepalive.wb-sessto after 5000ms", function() {
			spies.trigger.reset();
			spies.ajax.reset();

			clock.tick( 5010 );
			expect( spies.trigger.calledWith( "keepalive.wb-sessto" ) ).to.equal( true );
		} );

		it( "has refreshCallbackUrl so should call $.ajax", function() {
			expect( spies.ajax.called ).to.equal( true );
		} );

		it( "successful response triggers reset.wb-sessto event", function() {
			server.respond();
			expect( spies.trigger.calledWith( "reset.wb-sessto" ) ).to.equal( true );
		} );
	} );

} );

}( jQuery, wb ) );
