/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Feedback Unit Tests
 * @overview Test the feedback plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "Feedback test suite", function() {

	var $document = wb.doc,
		$body = $document.find( "body" ),
		$elm, $form, $reason, $reasonWeb, $access, $accessComp, $accessMobile, $info, $contact1, $contact2,

		// Tests sections for visibility.  Not using the ":visible" jQuery selector
		// because it is giving inconsistent results in PhantomJS.
		expectVisible = function( $elm ) {
			expect( $elm.hasClass( "hide" ) ).to.equal( false );
			expect( $elm.hasClass( "show" ) ).to.equal( true );
			expect( $elm.attr( "aria-hidden" ) ).to.equal( "false" );
		},
		expectHidden = function( $elm ) {
			expect( $elm.hasClass( "hide" ) ).to.equal( true );
			expect( $elm.hasClass( "show" ) ).to.equal( false );
			expect( $elm.attr( "aria-hidden" ) ).to.equal( "true" );
		};

	/*
	 * Before beginning the test suite, this function is executed once.
	 */
	before( function( done ) {
		$elm = $( "<div class='feedback'></div>" )
			.appendTo( $body );

		$elm.trigger( {
			type: "ajax-fetch.wb",
			fetch: {
				url: "../demos/feedback/feedback-en.html"
			}
		} );

		$document.on( "ajax-fetched.wb ajax-failed.wb", ".feedback", function( event ) {
			if ( event.type === "ajax-fetched" ) {
				$( "<script src='../demos/feedback/demo/feedback.js'></script>" )
					.appendTo( $elm );
				$form = event.fetch.pointer.find( ".wb-fdbck" )
					.appendTo( $elm )
					.trigger( "wb-init.wb-fdbck" );
				$reason = $form.find( "#fbrsn" );
				$reasonWeb = $form.find( "#fbweb" );
				$access = $form.find( "#fbaxs" );
				$accessComp = $form.find( "#fbcomp" );
				$accessMobile = $form.find( "#fbmob" );
				$info = $form.find( "#fbinfo" );
				$contact1 = $form.find( "#fbcntc1" );
				$contact2 = $form.find( "#fbcntc2" );
			} else {
				done( event.fetch.error );
			}
		} );

		$document.on( "wb-init.wb-fdbck", ".wb-fdbck", function() {
			done();
		} );
	} );

	after( function() {
		$elm.remove();
	} );

	/*
	 * Test the initialization events of the plugin
	 */
	describe( "plugin init", function() {
		it( "should have added the plugin init class to the form", function() {
			expect( $form.hasClass( "wb-fdbck-inited" ) ).to.equal( true );
		} );

		it( "should have set aria-controls attributes", function() {
			expect( $reason.attr( "aria-controls" ) ).to.equal( "fbweb" );
			expect( $access.attr( "aria-controls" ) ).to.equal( "fbmob fbcomp" );
		} );

		it( "should have set the referrer", function() {
			expect( $( "#fbpg" ).val() ).to.equal( document.referrer );
		} );
	} );

	/*
	 * Test showHide Web behaviour
	 */
	describe( "showHide Web", function() {

		before( function() {
			$reasonWeb.hide();
		} );

		it( "should hide the 'Web' section when reason is not 'web'", function() {
			$reason.val( "" ).trigger( "change" );
			expectHidden( $reasonWeb );
		} );

		it( "should show the 'Web' section when reason is 'web'", function() {
			$reason.val( "web" ).trigger( "change" );
			expectVisible( $reasonWeb );
		} );
	} );

	/*
	 * Test showHide Access behaviour
	 */
	describe( "showHide Access", function() {

		before( function() {
			$accessComp.hide();
			$accessMobile.hide();
		} );

		it( "should hide the 'Mobile' section when reason is not 'mobile'", function() {
			$access.val( "desktop" ).trigger( "change" );
			expectVisible( $accessComp );
			expectHidden( $accessMobile );
		} );

		it( "should show the 'Mobile' section when reason is 'mobile'", function() {
			$access.val( "mobile" ).trigger( "change" );
			expectVisible( $accessMobile );
		} );
	} );

	/*
	 * Test showHide Info behaviour
	 */
	describe( "showHide Info", function() {

		before( function() {
			$info.hide();
		} );

		it( "should hide the 'Info' section when contacts are not checked", function() {
			$contact1.prop( "checked", false );
			$contact2.prop( "checked", false ).trigger( "change" );
			expectHidden( $info );
		} );

		it( "should show the 'Info' section when contact1 is checked", function() {
			$contact1.prop( "checked", true ).trigger( "change" );
			expectVisible( $info );
		} );

		it( "should show the 'Info' section when contact2 is checked", function() {
			$contact1.prop( "checked", false ).trigger( "change" );
			$contact2.prop( "checked", true ).trigger( "change" );
			expectVisible( $info );
		} );
	} );

	/*
	 * Test reset button behaviour
	 */
	describe( "Reset button click", function() {

		before( function() {
			$reason.val( "web" );
			$contact1.prop( "checked", true ).trigger( "change" );
		} );

		it( "should hide all sections when reset is clicked", function() {
			expectVisible( $info );
			expectVisible( $reasonWeb );

			$( "input[type='reset']" ).trigger( "click" );

			expectHidden( $info );
			expectHidden( $reasonWeb );
		} );
	} );
} );

}( jQuery, wb ) );
