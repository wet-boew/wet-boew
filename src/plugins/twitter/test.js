/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Twitter Plugin Unit Tests
 * @overview Test the favicon plugin behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/* global jQuery, describe, it, expect, before, after */
/* jshint unused:vars */
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
    this.timeout( 5000 );

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

} );

}( jQuery, wb ) );
