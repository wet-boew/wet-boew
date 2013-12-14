/*
 * @title Toggle Plugin Unit Tests
 * @overview Test the Toggle plugin behaviour
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
describe( "Toggle test suite", function() {
	var spy,
		sandbox = sinon.sandbox.create();

	/*
	 * Before begining the test suite, this function is exectued once.
	 */
	before(function() {
		// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
		spy = sandbox.spy( $.prototype, "trigger" );

		$( ".wb-toggle" )
			.removeClass( "wb-toggle-inited" )
			.trigger( "wb-init.wb-toggle" );
	});

	/*
	 * After finishing the test suite, this function is exectued once.
	 */
	after(function() {
		// Restore the original behaviour of trigger once the tests are finished
		sandbox.restore();
	});

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "init events", function() {

		it( "should have a aria.wb-toggle event", function() {
			expect( spy.calledWith( "aria.wb-toggle" ) ).to.equal( true );
		});

		it( "should have been triggered on a .wb-toggle element", function() {
			var call, i, j, lenCalls, lenElms,
				isSelector = false;

			// Loop over calls made on the trigger() spy
			for ( i = 0, lenCalls = spy.callCount; !isSelector && i < lenCalls; i++ ) {
				call = spy.getCall( i );
				// There may be multiple `this` objects for each call
				for ( j = 0, lenElms = call.thisValue.length; !isSelector && j < lenElms; j++ ) {
					isSelector = call.thisValue[ j ].className.indexOf( "wb-toggle" ) > -1;
				}
			}
			expect( isSelector ).to.equal( true );
		});
	});

	/*
	 * Test default initialization of the plugin
	 */
	describe( "init elements", function() {

		it( "should have merged default settings with .wb-toggle element's data", function() {
			var data;
			$( ".wb-toggle" ).each( function() {
				data = $( this ).data( "toggle" );
				expect( data.stateOn ).to.equal( "on" );
				expect( data.stateOff ).to.equal( "off" );
			});
		});

		it( "should have aria-controls attribute set if not a tablist", function() {
			var $elm, ariaControls, data, isTablist, selector;
			$( ".wb-toggle" ).each( function() {
				$elm = $( this );
				data = $elm.data( "toggle" );
				isTablist = data.group && data.parent;

				if ( !isTablist ) {
					selector = data.selector;
					if ( selector ) {
						ariaControls = "";
						$( selector ).each( function() {
							ariaControls += this.id + " ";
						});
						expect( $elm.attr( "aria-controls" ) ).to.equal( $.trim( ariaControls ) );
					} else {
						expect( $elm.attr( "aria-controls" ) ).to.equal( $elm.attr( "id" ) );
					}
				}
			});
		});

		it( "should have aria tablist attributes if a tablist", function() {
			var $elm, $panel, $parent, data, isTablist;
			$( ".wb-toggle" ).each( function() {
				$elm = $( this );
				data = $elm.data( "toggle" );
				isTablist = data.group && data.parent;

				if ( isTablist ) {
					$parent = $( data.parent );
					expect( $parent.attr( "role" ) ).to.equal( "tablist" );

					$parent.find( ".tgl-tab" ).each( function() {
						expect( this.getAttribute( "role" ) ).to.equal( "tab" );
					});
					$parent.find( ".tgl-panel" ).each( function() {
						expect( this.getAttribute( "role" ) ).to.equal( "tabpanel" );
					});
					$parent.find( data.group ).each( function() {
						$panel = $( this );
						expect( $panel.find( ".tgl-panel" ).attr( "aria-labelledby" )  ).to.equal( $panel.find( ".tgl-tab" ).attr( "id" ) );
					});
				}
			});
		});
	});

	/*
	 * Test plugin click event
	 */
	describe( "click event", function() {

		before(function() {
			spy.reset();
			$( ".wb-toggle" ).trigger( "click" );
		});

		it( "should trigger toggle.wb-toggle", function() {
			expect( spy.calledWith( "toggle.wb-toggle" ) ).to.equal( true );
		});

		it( "should trigger toggled.wb-toggle", function() {
			expect( spy.calledWith( "toggled.wb-toggle" ) ).to.equal( true );
		});

		it( "should trigger focus.wb", function() {
			expect( spy.calledWith( "setfocus.wb" ) ).to.equal( true );
		});

	});

	/*
	 * Test specific toggle element
	 */
	describe( "toggle on/off states of selector", function() {
		var $toggler, $toggledElm;

		before(function() {
			// Create the toggle element and start testing once it has been initialized
			$toggledElm = $( "<div id='foo' class='test'/>" ).appendTo( wb.doc.find( "body" ) );
			$toggler = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \"#foo\"}'/>" ).appendTo( wb.doc.find( "body" ) );
			$toggler.trigger( "wb-init.wb-toggle" );
		});

		after(function() {
			$( ".wb-toggle.test" ).remove();
		});

		it( "should have been toggled on", function() {
			$toggler.trigger( "click" );
			expect( $toggledElm.hasClass( "on" ) ).to.equal( true );
			expect( $toggledElm.data( "state" ) ).to.equal( "on" );
		});

		it( "should have been toggled off", function() {
			$toggler.trigger( "click" );
			expect( $toggledElm.hasClass( "off" ) ).to.equal( true );
			expect( $toggledElm.data( "state" ) ).to.equal( "off" );
		});
	});

	/*
	 * Test toggle of self
	 */
	describe( "toggle on/off states of self", function() {
		var $toggler;

		before(function() {
			// Create the toggle element and start testing once it has been initialized
			$toggler = $( "<button type='button' class='wb-toggle test'/>" ).appendTo( wb.doc.find( "body" ) );
			$toggler.trigger( "wb-init.wb-toggle" );
		});

		after(function() {
			$toggler.remove();
		});

		it( "should have been toggled on", function() {
			$toggler.trigger( "click" );
			expect( $toggler.hasClass( "on" ) ).to.equal( true );
			expect( $toggler.data( "state" ) ).to.equal( "on" );
		});

		it( "should have been toggled off", function() {
			$toggler.trigger( "click" );
			expect( $toggler.hasClass( "off" ) ).to.equal( true );
			expect( $toggler.data( "state" ) ).to.equal( "off" );
		});
	});

	/*
	 * Test toggle type with custom on/off state CSS classes
	 */
	describe( "toggle type togglers with custom states", function() {
		var $togglerOn, $togglerOff;

		before(function() {
			// Create the toggle elements and start testing once it has been initialized
			$togglerOn = $( "<button type='button' class='wb-toggle test' data-toggle='{\"type\": \"open\", \"stateOn\": \"open\"}'/>" ).appendTo( wb.doc.find( "body" ) );
			$togglerOn.trigger( "wb-init.wb-toggle" );

			$togglerOff = $( "<button type='button' class='wb-toggle test' data-toggle='{\"type\": \"close\", \"stateOff\": \"close\"}'/>" ).appendTo( wb.doc.find( "body" ) );
			$togglerOff.trigger( "wb-init.wb-toggle" );
		});

		after(function() {
			$( ".wb-toggle.test" ).remove();
		});

		it( "should have been toggled on", function() {
			$togglerOn.trigger( "click" );
			expect( $togglerOn.hasClass( "open" ) ).to.equal( true );
			expect( $togglerOn.data( "state" ) ).to.equal( "open" );
		});

		it( "should remain toggled on", function() {
			$togglerOn.trigger( "click" );
			expect( $togglerOn.hasClass( "open" ) ).to.equal( true );
			expect( $togglerOn.data( "state" ) ).to.equal( "open" );
		});

		it( "should have been toggled off", function() {
			$togglerOff.trigger( "click" );
			expect( $togglerOff.hasClass( "close" ) ).to.equal( true );
			expect( $togglerOff.data( "state" ) ).to.equal( "close" );
		});

		it( "should remain toggled off", function() {
			$togglerOff.trigger( "click" );
			expect( $togglerOff.hasClass( "close" ) ).to.equal( true );
			expect( $togglerOff.data( "state" ) ).to.equal( "close" );
		});
	});

	/*
	 * Grouped toggles
	 */
	describe( "Group toggle elements", function() {
		var $toggle1, $toggle2, $toggle3, $toggler1, $toggler2, $toggler3;

		before(function() {
			// Create the toggle elements and start testing once it has been initialized
			$toggler1 = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \"#toggle1\", \"group\": \".grouped\", \"type\": \"on\"}'/>" ).appendTo( wb.doc.find( "body" ) );
			$toggler2 = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \"#toggle2\", \"group\": \".grouped\", \"type\": \"on\"}'/>" ).appendTo( wb.doc.find( "body" ) );
			$toggler3 = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \"#toggle3\", \"group\": \".grouped\", \"type\": \"on\"}'/>" ).appendTo( wb.doc.find( "body" ) );

			$toggle1 = $( "#toggle1" );
			$toggle2 = $( "#toggle2" );
			$toggle3 = $( "#toggle3" );

			$toggler1.trigger( "wb-init.wb-toggle" );
			$toggler2.trigger( "wb-init.wb-toggle" );
			$toggler3.trigger( "wb-init.wb-toggle" );
		});

		after(function() {
			$( ".wb-toggle.test" ).remove();
		});

		it( "should open the first example only", function() {
			$toggler1.trigger( "click" );
			expect( $toggle1.hasClass( "on" ) ).to.equal( true );
			expect( $toggle2.hasClass( "off" ) ).to.equal( true );
			expect( $toggle3.hasClass( "off" ) ).to.equal( true );
		});

		it( "should open the second example only", function() {
			$toggler2.trigger( "click" );
			expect( $toggle1.hasClass( "off" ) ).to.equal( true );
			expect( $toggle2.hasClass( "on" ) ).to.equal( true );
			expect( $toggle3.hasClass( "off" ) ).to.equal( true );
		});

		it( "should open the third example only", function() {
			$toggler3.trigger( "click" );
			expect( $toggle1.hasClass( "off" ) ).to.equal( true );
			expect( $toggle2.hasClass( "off" ) ).to.equal( true );
			expect( $toggle3.hasClass( "on" ) ).to.equal( true );
		});
	});

	/*
	 * Details elements
	 */
	describe( "Toggle details elements", function() {
		var $details, $toggler;

		before(function() {
			spy.reset();

			// Create the toggle elements and start testing once it has been initialized
			$toggler = $( "<button type='button' class='wb-toggle test' data-toggle='{\"selector\": \".test-details\"}'/>" ).appendTo( wb.doc.find( "body" ) );
			$details = $( "<details class=\"test test-details\"><summary></summary></details>" ).appendTo( wb.doc.find( "body" ) );
			$toggler.trigger( "wb-init.wb-toggle" );
		});

		after(function() {
			$toggler.remove();
			$details.remove();
		});

		it( "should open details element", function() {
			$toggler.trigger( "click" );
			expect( $details.hasClass( "on" ) ).to.equal( true );

			// Test must account for browser with and without details element native support
			if ( Modernizr.details ) {
				expect( $details.prop( "open" ) ).to.equal( true );
			} else {
				expect( $details.attr( "open" ) ).to.equal( "open" );
				expect( spy.calledWith( "toggle.wb-details" ) ).to.equal( true );
			}
		});

		it( "should close details element", function() {
			$toggler.trigger( "click" );
			expect( $details.hasClass( "off" ) ).to.equal( true );

			// Test must account for browser with and without details element native support
			if ( Modernizr.details ) {
				expect( $details.prop( "open" ) ).to.equal( false );
			} else {
				expect( $details.attr( "open" ) ).to.equal( undefined );
				expect( spy.calledWith( "toggle.wb-details" ) ).to.equal( true );
			}
		});
	});

	/*
	 * Accordion
	 */
	describe( "Accordion", function() {
		var $accordion, $details, $panels, $tabs,
			testAccordionClosed = function( idx ) {
				expect( $details.eq( idx ).hasClass( "off" ) ).to.equal( true );
				expect( $tabs.eq( idx ).attr( "aria-selected" ) ).to.equal( "false" );
				expect( $panels.eq( idx ).attr( "aria-expanded" ) ).to.equal( "false" );
				expect( $panels.eq( idx ).attr( "aria-hidden" ) ).to.equal( "true" );
			},
			testAccordionOpen = function( idx ) {
				expect( $details.eq( idx ).hasClass( "on" ) ).to.equal( true );
				expect( $tabs.eq( idx ).attr( "aria-selected" ) ).to.equal( "true" );
				expect( $panels.eq( idx ).attr( "aria-expanded" ) ).to.equal( "true" );
				expect( $panels.eq( idx ).attr( "aria-hidden" ) ).to.equal( "false" );
			};

		before(function() {
			$accordion = $( ".accordion" );
			$details = $accordion.find( "details" );
			$panels = $accordion.find( ".tgl-panel" );
			$tabs = $accordion.find( ".tgl-tab" );
		});

		it( "should open the first accordion panel", function() {
			$tabs.eq( 0 ).trigger( "click" );
			testAccordionOpen( 0 );
			testAccordionClosed( 1 );
			testAccordionClosed( 2 );
		});

		it( "should open the second accordion panel", function() {
			$tabs.eq( 1 ).trigger( "click" );
			testAccordionOpen( 1 );
			testAccordionClosed( 0 );
			testAccordionClosed( 2 );
		});

		it( "should close the second accordion panel", function() {
			$tabs.eq( 1 ).trigger( "click" );
			testAccordionClosed( 0 );
			testAccordionClosed( 1 );
			testAccordionClosed( 2 );
		});
	});
});

}( jQuery, wb ));
