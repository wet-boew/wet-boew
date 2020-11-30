/*
 * @title Toggle Plugin Unit Tests
 * @overview Test the Toggle plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Toggle test suite", function() {
	var spy,
		sandbox = sinon.sandbox.create(),
		$body = wb.doc.find( "body" );

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before( function() {

		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );
	} );

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after( function() {

		// Restore the original behaviour of trigger once the tests are finished
		sandbox.restore();
	} );

	/*
	 * Test initialization of the plugin
	 */
	describe( "initialization", function() {
		var $test, $toggleSelf, $toggleOthers, $accordion, $toggleTabs;

		before( function() {

			// Create test element
			$test = $( "<div class='toggle-test'>" )
				.appendTo( $body );

			// Create toggle elements and trigger plugin init
			$toggleSelf = $( "<div class='wb-toggle'>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );

			$toggleOthers = $( "<div class='wb-toggle' data-toggle='{\"selector\": \".toggle-test\"}'>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );

			$accordion = $( "<div class='toggle-test-accordion'>" +
					"<details class='toggle-test-acc'>" +
						"<summary class='wb-toggle tgl-tab' data-toggle='{\"parent\": \".toggle-test-accordion\", \"group\": \".toggle-test-acc\"}'></summary>" +
						"<div class='tgl-panel'></div>" +
					"</details>" +
					"<details class='toggle-test-acc'>" +
						"<summary class='wb-toggle tgl-tab' data-toggle='{\"parent\": \".toggle-test-accordion\", \"group\": \".toggle-test-acc\"}'></summary>" +
						"<div class='tgl-panel'></div>" +
					"</details>" +
				"</div>" )
				.appendTo( $body );
			$toggleTabs = $accordion.find( ".wb-toggle" )
				.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$test.remove();
			$toggleSelf.remove();
			$toggleOthers.remove();
			$accordion.remove();
		} );

		it( "should have been marked toggle elements as initialized", function() {
			expect( $toggleSelf.hasClass( "wb-toggle-inited" ) ).to.equal( true );
			expect( $toggleOthers.hasClass( "wb-toggle-inited" ) ).to.equal( true );
			$toggleTabs.each( function() {
				expect( $( this ).hasClass( "wb-toggle-inited" ) ).to.equal( true );
			} );
		} );

		it( "should have merged default settings with toggle element's data", function() {
			var data = $toggleSelf.data( "toggle" );
			expect( data.stateOn ).to.equal( "on" );
			expect( data.stateOff ).to.equal( "off" );
		} );

		it( "$toggleSelf should have aria-controls attribute set to own ID", function() {
			expect( $toggleSelf.attr( "aria-controls" ) ).to.equal( $toggleSelf.attr( "id" ) );
		} );

		it( "$toggleOthers should have aria-controls attribute set to controlled elements", function() {
			var ariaControls = "",
				selector = $toggleOthers.data( "toggle" ).selector;

			$( selector ).each( function() {
				ariaControls += this.id + " ";
			} );
			expect( $toggleOthers.attr( "aria-controls" ) ).to.equal( $.trim( ariaControls ) );
		} );

		it( "should have aria tablist attributes if a tablist", function() {
			var data, $panel, $parent;

			$toggleTabs.each( function() {
				data = $( this ).data( "toggle" );
				$parent = $( data.parent );
				expect( $parent.attr( "role" ) ).to.equal( "tablist" );
				$parent.find( "div.tgl-tab" ).each( function() {
					expect( this.getAttribute( "role" ) ).to.equal( "tab" );
				} );
				$parent.find( ".tgl-panel" ).each( function() {
					expect( this.getAttribute( "role" ) ).to.equal( "tabpanel" );
				} );
				$parent.find( data.group ).each( function() {
					$panel = $( this );
					expect( $panel.find( ".tgl-panel" ).attr( "aria-labelledby" )  ).to.equal( $panel.find( ".tgl-tab" ).attr( "id" ) );
				} );
			} );
		} );
	} );

	/*
	 * Test plugin click event
	 */
	describe( "click event", function() {
		var $toggle;

		before( function() {
			spy.reset();

			// Create toggle element and trigger plugin init
			$toggle = $( "<div class='wb-toggle'>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" )
				.trigger( "click" );
		} );

		after( function() {
			$toggle.remove();
		} );

		it( "should trigger toggle.wb-toggle", function() {
			expect( spy.calledWith( "toggle.wb-toggle" ) ).to.equal( true );
		} );

		it( "should trigger toggled.wb-toggle", function() {
			expect( spy.calledWith( "toggled.wb-toggle" ) ).to.equal( true );
		} );

		it( "should trigger focus.wb", function() {
			expect( spy.calledWith( "setfocus.wb" ) ).to.equal( true );
		} );
	} );

	/*
	 * Test specific toggle element
	 */
	describe( "toggle on/off states of selector", function() {
		var $toggler, $toggledElm;

		before( function() {

			// Create the toggle element and start testing once it has been initialized
			$toggledElm = $( "<div id='foo' class='test'/>" ).appendTo( $body );
			$toggler = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \"#foo\"}'/>" ).appendTo( $body );
			$toggler.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$toggler.remove();
			$toggledElm.remove();
		} );

		it( "should have been toggled on", function() {
			$toggler.trigger( "click" );
			expect( $toggledElm.hasClass( "on" ) ).to.equal( true );
			expect( $toggledElm.data( "wb-toggle-state" ) ).to.equal( "on" );
		} );

		it( "should have been toggled off", function() {
			$toggler.trigger( "click" );
			expect( $toggledElm.hasClass( "off" ) ).to.equal( true );
			expect( $toggledElm.data( "wb-toggle-state" ) ).to.equal( "off" );
		} );
	} );

	/*
	 * Test toggle of self
	 */
	describe( "toggle on/off states of self", function() {
		var $toggler;

		before( function() {

			// Create the toggle element and start testing once it has been initialized
			$toggler = $( "<button type='button' class='wb-toggle test'/>" ).appendTo( $body );
			$toggler.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$toggler.remove();
		} );

		it( "should have been toggled on", function() {
			$toggler.trigger( "click" );
			expect( $toggler.hasClass( "on" ) ).to.equal( true );
			expect( $toggler.data( "wb-toggle-state" ) ).to.equal( "on" );
		} );

		it( "should have been toggled off", function() {
			$toggler.trigger( "click" );
			expect( $toggler.hasClass( "off" ) ).to.equal( true );
			expect( $toggler.data( "wb-toggle-state" ) ).to.equal( "off" );
		} );
	} );

	/*
	 * Test toggle type with custom on/off state CSS classes
	 */
	describe( "toggle type togglers with custom states", function() {
		var $togglerOn, $togglerOff;

		before( function() {

			// Create the toggle elements and start testing once it has been initialized
			$togglerOn = $( "<button type='button' class='wb-toggle test' data-toggle='{\"type\": \"on\", \"stateOn\": \"open\"}'/>" ).appendTo( $body );
			$togglerOn.trigger( "wb-init.wb-toggle" );

			$togglerOff = $( "<button type='button' class='wb-toggle test' data-toggle='{\"type\": \"off\", \"stateOff\": \"close\"}'/>" ).appendTo( $body );
			$togglerOff.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$togglerOn.remove();
			$togglerOff.remove();
		} );

		it( "should have been toggled on", function() {
			$togglerOn.trigger( "click" );
			expect( $togglerOn.hasClass( "open" ) ).to.equal( true );
			expect( $togglerOn.data( "wb-toggle-state" ) ).to.equal( "open" );
		} );

		it( "should remain toggled on", function() {
			$togglerOn.trigger( "click" );
			expect( $togglerOn.hasClass( "open" ) ).to.equal( true );
			expect( $togglerOn.data( "wb-toggle-state" ) ).to.equal( "open" );
		} );

		it( "should have been toggled off", function() {
			$togglerOff.trigger( "click" );
			expect( $togglerOff.hasClass( "close" ) ).to.equal( true );
			expect( $togglerOff.data( "wb-toggle-state" ) ).to.equal( "close" );
		} );

		it( "should remain toggled off", function() {
			$togglerOff.trigger( "click" );
			expect( $togglerOff.hasClass( "close" ) ).to.equal( true );
			expect( $togglerOff.data( "wb-toggle-state" ) ).to.equal( "close" );
		} );
	} );

	/*
	 * Grouped toggles
	 */
	describe( "Group toggle elements", function() {
		var $toggle1, $toggle2, $toggle3, $toggler1, $toggler2, $toggler3;

		before( function() {

			// Create the toggle elements and start testing once it has been initialized
			$toggler1 = $( "<button type='button' class='wb-toggle' data-toggle='{\"selector\": \"#test-toggle1\", \"group\": \".grouped\", \"type\": \"on\"}'/>" ).appendTo( $body );
			$toggler2 = $( "<button type='button' class='wb-toggle' data-toggle='{\"selector\": \"#test-toggle2\", \"group\": \".grouped\", \"type\": \"on\"}'/>" ).appendTo( $body );
			$toggler3 = $( "<button type='button' class='wb-toggle' data-toggle='{\"selector\": \"#test-toggle3\", \"group\": \".grouped\", \"type\": \"on\"}'/>" ).appendTo( $body );

			$toggle1 = $( "<div id='test-toggle1' class='grouped'>" ).appendTo( $body );
			$toggle2 = $( "<div id='test-toggle2' class='grouped'>" ).appendTo( $body );
			$toggle3 = $( "<div id='test-toggle3' class='grouped'>" ).appendTo( $body );

			$toggler1.trigger( "wb-init.wb-toggle" );
			$toggler2.trigger( "wb-init.wb-toggle" );
			$toggler3.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$toggler1.remove();
			$toggler2.remove();
			$toggler3.remove();

			$toggle1.remove();
			$toggle2.remove();
			$toggle3.remove();
		} );

		it( "should open the first example only", function() {
			$toggler1.trigger( "click" );
			expect( $toggle1.hasClass( "on" ) ).to.equal( true );
			expect( $toggle2.hasClass( "on" ) ).to.equal( false );
			expect( $toggle3.hasClass( "on" ) ).to.equal( false );
		} );

		it( "should open the second example only", function() {
			$toggler2.trigger( "click" );
			expect( $toggle1.hasClass( "on" ) ).to.equal( false );
			expect( $toggle2.hasClass( "on" ) ).to.equal( true );
			expect( $toggle3.hasClass( "on" ) ).to.equal( false );
		} );

		it( "should open the third example only", function() {
			$toggler3.trigger( "click" );
			expect( $toggle1.hasClass( "on" ) ).to.equal( false );
			expect( $toggle2.hasClass( "on" ) ).to.equal( false );
			expect( $toggle3.hasClass( "on" ) ).to.equal( true );
		} );
	} );

	/*
	 * Details elements
	 */
	describe( "Toggle details elements", function() {
		var $details, $toggler;

		before( function() {
			spy.reset();

			// Create the toggle elements and start testing once it has been initialized
			$toggler = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \".test-details\"}'/>" ).appendTo( $body );
			$details = $( "<details class=\"test test-details\"><summary></summary></details>" ).appendTo( $body );
			$toggler.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$toggler.remove();
			$details.remove();
		} );

		it( "should open details element", function() {
			$toggler.trigger( "click" );
			expect( $details.hasClass( "on" ) ).to.equal( true );
			expect( $details.prop( "open" ) ).to.equal( true );
		} );

		it( "should close details element", function() {
			$toggler.trigger( "click" );
			expect( $details.hasClass( "off" ) ).to.equal( true );
			expect( $details.prop( "open" ) ).to.equal( false );
		} );
	} );

	/*
	 * Accordion
	 */
	describe( "Accordion", function() {
		var $accordion, $details, $panels, $tabs, $wrapper,
			testAccordionClosed = function( idx ) {
				expect( $details.eq( idx ).hasClass( "on" ) ).to.equal( false );
				expect( $wrapper.eq( idx ).attr( "aria-selected" ) ).to.equal( "false" );
				expect( $panels.eq( idx ).attr( "aria-expanded" ) ).to.equal( "false" );
				expect( $panels.eq( idx ).attr( "aria-hidden" ) ).to.equal( "true" );
			},
			testAccordionOpen = function( idx ) {
				expect( $details.eq( idx ).hasClass( "on" ) ).to.equal( true );
				expect( $wrapper.eq( idx ).attr( "aria-selected" ) ).to.equal( "true" );
				expect( $panels.eq( idx ).attr( "aria-expanded" ) ).to.equal( "true" );
				expect( $panels.eq( idx ).attr( "aria-hidden" ) ).to.equal( "false" );
			};

		before( function() {
			$accordion = $( "<div class='test-accordion'>" +
					"<details class='test-acc'>" +
						"<summary class='wb-toggle tgl-tab' data-toggle='{\"parent\": \".test-accordion\", \"group\": \".test-acc\"}'></summary>" +
						"<div class='tgl-panel'></div>" +
					"</details>" +
					"<details class='test-acc'>" +
						"<summary class='wb-toggle tgl-tab' data-toggle='{\"parent\": \".test-accordion\", \"group\": \".test-acc\"}'></summary>" +
						"<div class='tgl-panel'></div>" +
					"</details>" +
				"</div>" )
				.appendTo( $body );

			$tabs = $accordion.find( ".tgl-tab" )
				.trigger( "wb-init.wb-toggle" );
			$details = $accordion.find( "details" );
			$panels = $accordion.find( ".tgl-panel" );
			$wrapper = $accordion.find( "div.tgl-tab" );


			if ( !Modernizr.details ) {
				$tabs.trigger( "wb-init.wb-details" );
			}
		} );

		after( function() {
			$accordion.remove();
		} );

		it( "should open the first accordion panel", function() {
			$tabs.eq( 0 ).trigger( "click" );
			testAccordionOpen( 0 );
			testAccordionClosed( 1 );
		} );

		it( "should open the second accordion panel", function() {
			$tabs.eq( 1 ).trigger( "click" );
			testAccordionOpen( 1 );
			testAccordionClosed( 0 );
		} );

		it( "should close the second accordion panel", function() {
			$tabs.eq( 1 ).trigger( "click" );
			testAccordionClosed( 0 );
			testAccordionClosed( 1 );
		} );
	} );

	/*
	 * Test onbeforeprint behaviour
	 */
	describe( "Printing toggle elements", function() {
		var $detailsOn, $detailsOff;

		before( function() {
			spy.reset();

			$detailsOn = $( "<details class=\"wb-toggle\" data-toggle='{\"print\": \"on\"}'><summary></summary></details>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );
			$detailsOff = $( "<details class=\"wb-toggle\" data-toggle='{\"print\": \"off\"}'><summary></summary></details>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );

			wb.win.trigger( "beforeprint" );
		} );

		after( function() {
			$detailsOn.remove();
			$detailsOff.remove();
		} );

		it( "should trigger toggle.wb-toggle", function() {
			expect( spy.calledWith( "toggle.wb-toggle" ) ).to.equal( true );
		} );

		it( "should toggle on the $detailsOn element", function() {
			expect( $detailsOn.hasClass( "on" ) ).to.equal( true );
		} );

		it( "should toggle off the $detailsOff element", function() {
			expect( $detailsOff.hasClass( "off" ) ).to.equal( true );
		} );
	} );

	/*
	 * Test persistence behaviour
	 */
	describe( "Persist toggle state: no saved state", function() {
		var $detailsLocal, $detailsSession,
			keyLocal = "wb-toggletest-local",
			keySession = "wb-toggletest-session";

		before( function() {
			spy.reset();
			localStorage.removeItem( keyLocal );
			sessionStorage.removeItem( keySession );

			$detailsLocal = $( "<details class=\"wb-toggle\" id=\"test-local\" data-toggle='{\"persist\": \"local\"}'><summary></summary></details>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );

			$detailsSession = $( "<details class=\"wb-toggle\" id=\"test-session\" data-toggle='{\"persist\": \"session\"}'><summary></summary></details>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$detailsLocal.remove();
			$detailsSession.remove();
		} );

		it( "should not trigger toggle.wb-toggle when initialized", function() {
			expect( spy.calledWith( "toggle.wb-toggle" ) ).to.equal( false );
			expect( localStorage.getItem( keyLocal ) ).to.equal( null );
			expect( sessionStorage.getItem( keySession ) ).to.equal( null );
		} );

		it( "should save the toggle 'on' state in localStorage", function() {
			$detailsLocal.trigger( "click" );
			expect( localStorage.getItem( keyLocal ) ).to.equal( "on" );
		} );

		it( "should save the toggle 'off' state in localStorage", function() {
			$detailsLocal.trigger( "click" );
			expect( localStorage.getItem( keyLocal ) ).to.equal( "off" );
		} );

		it( "should save the toggle 'on' state in sessionStorage", function() {
			$detailsSession.trigger( "click" );
			expect( sessionStorage.getItem( keySession ) ).to.equal( "on" );
		} );

		it( "should save the toggle 'off' state in sessionStorage", function() {
			$detailsSession.trigger( "click" );
			expect( sessionStorage.getItem( keySession ) ).to.equal( "off" );
		} );
	} );

	describe( "Persist toggle state: saved state", function() {
		var $details,
			key = "wb-toggletest-session";

		before( function() {
			spy.reset();
			sessionStorage.setItem( key, "on" );

			$details = $( "<details class=\"wb-toggle\" id=\"test-session\" data-toggle='{\"persist\": \"session\"}'><summary></summary></details>" )
				.appendTo( $body )
				.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$details.remove();
		} );

		it( "should trigger toggle.wb-toggle when initialized", function() {
			expect( spy.calledWith( "toggle.wb-toggle" ) ).to.equal( true );
			expect( sessionStorage.getItem( key ) ).to.equal( "on" );
		} );

		it( "should save the toggle 'off' state in sessionStorage", function() {
			$details.trigger( "click" );
			expect( sessionStorage.getItem( key ) ).to.equal( "off" );
		} );
	} );

	describe( "Persist toggle state: group toggle", function() {
		var $details1, $details2,
			key1 = "wb-toggle.test-grouptest-1",
			key2 = "wb-toggle.test-grouptest-2";

		before( function() {
			spy.reset();
			sessionStorage.removeItem( key1 );
			sessionStorage.removeItem( key2 );

			$details1 = $( "<details class=\"wb-toggle test-group\" id=\"test-1\" data-toggle='{\"persist\": \"session\", \"group\": \".test-group\"}'><summary></summary></details>" )
				.appendTo( $body );
			$details2 = $( "<details class=\"wb-toggle test-group\" id=\"test-2\" data-toggle='{\"persist\": \"session\", \"group\": \".test-group\"}'><summary></summary></details>" )
				.appendTo( $body );

			$details1.trigger( "wb-init.wb-toggle" );
			$details2.trigger( "wb-init.wb-toggle" );
		} );

		after( function() {
			$details1.remove();
			$details2.remove();
		} );

		it( "should save the 'on' state for $details1 and clear the state for $details2", function() {
			$details1.trigger( "click" );
			expect( sessionStorage.getItem( key1 ) ).to.equal( "on" );
			expect( sessionStorage.getItem( key2 ) ).to.equal( null );
		} );

		it( "should save the 'off' state for $details1 and clear the state for $details2", function() {
			$details1.trigger( "click" );
			expect( sessionStorage.getItem( key1 ) ).to.equal( "off" );
			expect( sessionStorage.getItem( key2 ) ).to.equal( null );
		} );

		it( "should clear the state for $details1 and save the 'on' state for $details2", function() {
			$details2.trigger( "click" );
			expect( sessionStorage.getItem( key1 ) ).to.equal( null );
			expect( sessionStorage.getItem( key2 ) ).to.equal( "on" );
		} );
	} );
} );

}( jQuery, wb ) );
