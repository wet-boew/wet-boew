/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title findPotentialPII Unit Tests
 * @overview Test the findPotentialPII helper function behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @polmih @duboisp
 */
( function( $, wb ) {

/*
 * Create a suite of related test cases using `describe`. Test suites can also be
 * nested in other test suites if you want to use the same setup `before()` and
 * teardown `after()` for more than one test suite (as is the case below.)
 */
describe( "wb.core helpers test suite", function() {
	var sandbox = sinon.createSandbox();

	before( function() {
	} );

	after( function() {
		sandbox.restore();
	} );

	/*
	 * Test PII patterns match
	 */
	describe( "PII patterns match", function() {

		before( function() {
		} );

		after( function() {
		} );

		it( "should match 8 or more digits", function() {
			expect( wb.findPotentialPII( "master:5428735149026050, phone:514-514-5144, SIN:123 123-123, driving license:P12345678912345, bank account: 003-1234567", true ) ).to.equal( "master:, phone:, SIN:, driving license:P, bank account: " );
		} );

		it( "should match canadian nr passport", function() {
			expect( wb.findPotentialPII( "passport Nr:AB123456, passport Nr:AB 123456, passport Nr:AB-123456", true ) ).to.equal( "passport Nr:, passport Nr:, passport Nr:" );
		} );

		it( "should match email pattern", function() {
			expect( wb.findPotentialPII( "email:1@example.com", true ) ).to.equal( "email:" );
		} );

		it( "should match email pattern", function() {
			expect( wb.findPotentialPII( "email:1%40example.com", true ) ).to.equal( "email:" );
		} );
		it( "should match email pattern", function() {
			expect( wb.findPotentialPII( "email:1%2540example.com", true ) ).to.equal( "email:" );
		} );

		it( "should match postal code pattern", function() {
			expect( wb.findPotentialPII( "postal code:K2C3N2, postal code:K2C 3N2, postal code:K2C-3N2", true ) ).to.equal( "postal code:, postal code:, postal code:" );
		} );

		it( "should match username = value", function() {
			expect( wb.findPotentialPII( "username:John, username=John, user:John, user=John", true ) ).to.equal( "   " );
		} );

		it( "should match password = value", function() {
			expect( wb.findPotentialPII( "password:P123456, password=P123456, pass:P123456, pass=P123456", true ) ).to.equal( "   " );
		} );

		it( "should return true", function() {
			expect( wb.findPotentialPII( "phone:514-514-5144, email:1@example.com" ) ).to.equal( true );
		} );

		it( "should return false", function() {
			expect( wb.findPotentialPII( "date:2022-02-02, case number:1234" ) ).to.equal( false );
		} );

		it( "should match the all the default patterns and the custom case passed as parameter", function() {
			expect( wb.findPotentialPII( "email:1@example.com, phone:514-514-5144, postal code:K2C-3N2, my-custom-rule: case number:123456", { myCustomRule: /\b(?:case[\s-]?number[\s\-\\.:]?(?:\d{5,10}))/ig }, { useFullBlock: 1 } ) ).to.equal( "email:█████████████, phone:████████████, postal code:███████, my-custom-rule: ██████████████████" );
		} );

		it( "should match only the custom case passed as parameter", function() {
			expect( wb.findPotentialPII( "email:1@example.com, phone:514-514-5144, postal code:K2C-3N2, my-custom-rule: case number:123456", { myCustomRule: /\b(?:case[\s-]?number[\s\-\\.:]?(?:\d{5,10}))/ig }, { isCustomExclusive: 1, useFullBlock: 1 } ) ).to.equal( "email:1@example.com, phone:514-514-5144, postal code:K2C-3N2, my-custom-rule: ██████████████████" );
		} );

		it( "should replace removed content with this string: [REDACTED/CAVIARDÉ]", function() {
			expect( wb.findPotentialPII( "email:1@example.com, phone:514-514-5144, postal code:K2C-3N2", true, { replaceWith: "[REDACTED/CAVIARDÉ]" } ) ).to.equal( "email:[REDACTED/CAVIARDÉ], phone:[REDACTED/CAVIARDÉ], postal code:[REDACTED/CAVIARDÉ]" );
		} );

		it( "should replace the scrubbed characters with the █ symbol", function() {
			expect( wb.findPotentialPII( "email:1@example.com, phone:514-514-5144, postal code:K2C-3N2", true, { useFullBlock: 1 } ) ).to.equal( "email:█████████████, phone:████████████, postal code:███████" );
		} );

		it( "should find and replace content matching a specific pattern e.g 'email' and 'postalCode' that is present in the list of the default patterns", function() {
			expect( wb.findPotentialPII( "email:1@example.com, phone:514-514-5144, postal code:K2C-3N2, case number:123456", { email: 1, postalCode: 1 }, { useFullBlock: 1 } ) ).to.equal( "email:█████████████, phone:514-514-5144, postal code:███████, case number:123456" );
		} );


	} );

	/*
	 * Test external links after DOMPurify sanitization
	 */
	describe( "External links", function() {
		before( function() {
			$( "body" ).append( `<div class='external-links-test'>
				<a id='externalLinkTest1' href='http://www.canada.ca' target='_blank' rel='noreferrer'>Valid link 1</a>
				<a id='externalLinkTest2' href='http://www.canada.ca' target='_blank' rel='noreferrer noopener'>Valid link 2</a>
				<a id='externalLinkTest3' href='http://www.canada.ca' target='_blank'>Invalid link 1</a>
				<a id='externalLinkTest4' href='http://www.canada.ca' target='_blank' rel='hellonoreferrerworld'>Invalid link 2</a>
				<!-- This one should be valid according to spec because the token are case insensitive but this is a limitation of relList DOM anchor function implemented in browser -->
				<!-- No need to test, but let's keep it here as a documentation item for future reference -->
				<!-- <a id='externalLinkTest5' href='http://www.canada.ca' target='_blank' rel='external noReferrer nofollow'>Valid link 3</a> -->
			</div>` );
		} );

		after( function() {
		} );

		it( "valid external links have a target attribute", function() {
			expect( $( "#externalLinkTest1" ).attr( "target" ) ).to.equal( "_blank" );
			expect( $( "#externalLinkTest2" ).attr( "target" ) ).to.equal( "_blank" );
		} );

		it( "invalid external links don't have a target attribute", function() {
			expect( $( "#externalLinkTest3" ).attr( "target" ) ).to.equal( undefined );
			expect( $( "#externalLinkTest4" ).attr( "target" ) ).to.equal( undefined );
		} );
	} );

	/*
	 * Test wb string helpers
	 */
	describe( "wb.string helpers", function() {

		before( function() {
		} );

		after( function() {
		} );

		// arrayBufferToBase64
		it( "arrayBufferToBase64: Should convert arrayBuffer into Base64", function() {
			expect( wb.string.arrayBufferToBase64( new Uint8Array( [ 21, 31 ] ) ) ).to.equal( "FR8=" );
		} );

		// base64ToArrayBuffer
		it( "base64ToArrayBuffer: Should convert base64 string into array buffer", function() {
			var retValue = wb.string.base64ToArrayBuffer( "FR8=" );
			expect( retValue.byteLength ).to.equal( 2 ); // Valid its return an ArrayBuffer

			// Check the integrity
			var arr = new Uint8Array( retValue );
			expect( arr[ 0 ] ).to.equal( 21 );
			expect( arr[ 1 ] ).to.equal( 31 );
			expect( arr[ 2 ] ).to.be.an( "undefined" );
		} );

		// toHexString
		it( "toHexString: Should convert arrayBuffer into hexadecimal string", function() {
			expect( wb.string.toHexString( new Uint8Array( [ 21, 31 ] ) ) ).to.equal( "151f" );
		} );

		// fromHexString
		it( "fromHexString: should convert hexadecimal string into array buffer", function() {
			var retValue = wb.string.fromHexString( "151f" );
			expect( retValue.byteLength ).to.equal( 2 ); // Valid its return an ArrayBuffer
			expect( retValue.buffer.byteLength ).to.equal( 2 ); // Valid its inheriting from ArrayBuffer

			// Check the integrity
			expect( retValue[ 0 ] ).to.equal( 21 );
			expect( retValue[ 1 ] ).to.equal( 31 );
			expect( retValue[ 2 ] ).to.be.an( "undefined" );
		} );

		// fromHexString (param is null)
		it( "fromHexString: Should return null when passing a null parameter", function() {
			expect( wb.string.fromHexString( null ) ).to.be.equal( null );
		} );

	} );

} );

}( jQuery, wb ) );
