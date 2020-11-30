/**
 * @title Calendar of events unit tests
 * @overview Test the calendar of events behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, wb ) {

describe( "event calendar test suite", function() {
	var sandbox = sinon.sandbox.create(),
		$body = wb.doc.find( "body" ),
		$elm,
		todayDate = new Date(),
		thisYear = "" + todayDate.getFullYear(),
		thisMonth = todayDate.getMonth(),
		$calElm;

	before( function() {
		$calElm = $( "<div id='test'></div>" ).appendTo( $body );
	} );

	after( function() {
		$calElm.remove();
		sandbox.restore();
	} );

	// Create a event calendar
	function createEvtCalendar( lstEvents ) {

		// Create the calendar of events
		var elm = "<div class='wb-calevt' data-calevt-src='test'><ol>",
			i, i_len = lstEvents.length, evt,
			j, j_len, j_cache;

		for ( i = 0; i !== i_len; i += 1 ) {
			evt = lstEvents[ i ];
			elm += "<li><section><h2><a href='" + evt.lnk + "'>" + evt.lnk + "</a></h2><p>";

			j_len = evt.dates.length;
			for ( j = 0; j !== j_len; j += 1 ) {
				j_cache = evt.dates[ j ];
				elm += "<time datetime='" + j_cache + "'>" + j_cache + "</time>";
			}
			elm += "</p><p>Event Description</p></section></li>";
		}
		elm += "</ol></div>";

		return $( elm )
			.appendTo( $body )
			.trigger( "wb-init.wb-calevt" );
	}

	describe( "past events", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2003-03-11" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2004-11-05" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "event calendar should be initialized", function() {
			expect( $elm.hasClass( "wb-calevt-inited" ) ).to.equal( true );
		} );

		it( "a calendar should be initialized", function() {
			expect( $calElm.hasClass( "wb-calevt-cal" ) ).to.equal( true );
		} );

		it( "Calendar date should be the maxDate", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( "2004" );
			expect( monthField.selectedIndex ).to.be( 10 );
		} );
	} );

	describe( "past events with range", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2003-03-11" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2004-11-05", "2006-09-08" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the maxDate", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( "2006" );
			expect( monthField.selectedIndex ).to.be( 8 );
		} );
	} );

	describe( "future events", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2203-03-11" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2204-11-05" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the minDate", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( "2203" );
			expect( monthField.selectedIndex ).to.be( 2 );
		} );
	} );


	describe( "future events with range", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2203-03-11", "2203-04-25" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2204-11-05" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the minDate", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( "2203" );
			expect( monthField.selectedIndex ).to.be( 2 );
		} );
	} );

	describe( "past and future events", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2010-01-30" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2075-07-16" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the today", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( thisYear );
			expect( monthField.selectedIndex ).to.be( thisMonth );
		} );
	} );

	describe( "past and future events with range", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2010-01-30", "2040-01-30" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2005-04-16", "2075-07-16" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the today", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( thisYear );
			expect( monthField.selectedIndex ).to.be( thisMonth );
		} );
	} );

	describe( "Only one event on current month", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ thisYear + "-" + ( thisMonth + 1 ) + "-15" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the today", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( thisYear );
			expect( monthField.selectedIndex ).to.be( thisMonth );
		} );
	} );

	describe( "Event on current month and future", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ thisYear + "-" + ( thisMonth + 1 ) + "-15" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2120-09-15" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the today", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( thisYear );
			expect( monthField.selectedIndex ).to.be( thisMonth );
		} );
	} );

	describe( "Event on current month and past", function() {

		before( function( ) {
			$elm = createEvtCalendar( [
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ thisYear + "-" + ( thisMonth + 1 ) + "-15" ] },
				{ lnk: "https://www.canada.ca", txt: "Day event", dates: [ "2000-09-15" ] }
			] );
		} );

		after( function() {
			$calElm.empty();
			$elm.remove();
		} );

		it( "Calendar date should be the today", function() {
			var yearField = $calElm.find( ".cal-year" ).get( 0 ),
				monthField = $calElm.find( ".cal-month" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( thisYear );
			expect( monthField.selectedIndex ).to.be( thisMonth );
		} );
	} );

} );

}( jQuery, wb ) );
