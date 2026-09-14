/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Twitter Plugin Unit Tests
 * @overview Test the favicon plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
*/

describe( "Twitter test suite", function() {

	/*
	 * Test the initialization and default behaviour of the plugin
	 */
	var $elm,
		$document = wb.doc,
		$body = $document.find( "body" );

	before( function( done ) {

		// The Twitter widget sometimes takes longer than two second to load
		this.timeout( 6000 );

		// Trigger plugin init
		$elm = $( "<div class='wb-twitter'><a class='twitter-timeline' href='https://twitter.com/search?q=%23WxT' data-widget-id='329066756620566528'>Tweets about '#WxT'</a></div>" )
			.appendTo( $body )
			.trigger( "wb-init.wb-twitter" );

		$document.on( "wb-ready.wb-twitter", ".wb-twitter", function() {
			done();
		} );
	} );

	after( function() {
		$elm.remove();
	} );

	/*
	* Test the initialization events of the plugin
	*/
	describe( "init event", function() {
		it( "should have added the wb-twitter-inited CSS class", function() {
			expect( $elm.hasClass( "wb-twitter-inited" ) ).to.equal( true );
		} );
	} );

	describe( "unavailable timeline", function() {
		it( "preserves the link and removes the message if the timeline loads later", function( done ) {
			const originalSetTimeout = window.setTimeout;
			let fallbackTimer;
			const timerStub = sinon.stub( window, "setTimeout" ).callsFake( function( callback, delay ) {
				if ( delay === 5000 ) {
					fallbackTimer = callback;
					return 0;
				}
				return originalSetTimeout.apply( window, arguments );
			} );
			const $fallbackElm = $( "<div class='wb-twitter'><a class='twitter-timeline' href='https://twitter.com/Example'>Tweets by @Example</a></div>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-twitter" );
			timerStub.restore();

			fallbackTimer();
			const fallback = $fallbackElm.find( ".wb-twitter-fallback" );
			expect( fallback.length ).to.equal( 1 );
			expect( fallback.attr( "role" ) ).to.equal( "status" );
			expect( fallback.text() ).to.equal( wb.i18n( "twitter-unavailable" ) );
			expect( $fallbackElm.find( "a.twitter-timeline" ).attr( "href" ) ).to.equal( "https://twitter.com/Example" );

			const iframeContainer = document.createElement( "div" );
			const iframe = document.createElement( "iframe" );
			iframeContainer.className = "twitter-timeline";
			iframe.id = "twitter-widget-late";
			iframe.src = "about:blank#/screen-name/Example";
			iframeContainer.appendChild( iframe );
			$fallbackElm.find( "a.twitter-timeline" )[ 0 ].replaceWith( iframeContainer );
			setTimeout( function() {
				try {
					expect( $fallbackElm.find( ".wb-twitter-fallback" ).length ).to.equal( 0 );
					expect( $fallbackElm.find( ".wb-twitter-skip" ).length ).to.equal( 2 );
					done();
				} catch ( error ) {
					done( error );
				} finally {
					$fallbackElm.remove();
				}
			}, 0 );
		} );
	} );

} );

}( jQuery, wb ) );
