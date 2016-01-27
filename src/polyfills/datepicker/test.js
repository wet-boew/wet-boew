/**
 * @title Date Picker Unit Tests
 * @overview Test the date picker behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @LaurentGoderre
 */
/* global jQuery, describe, it, expect, before, after, sinon */
/* jshint unused:vars */
( function( $, wb ) {

var runTest = Modernizr.inputtypes.date ? describe.skip : describe;

runTest( "Input type=\"date\" polyfill (date picker)", function() {
	var sandbox = sinon.sandbox.create(),
		selector = "input[type=date]",
		$document = wb.doc,
		$body = $document.find( "body" ),
		calendarSelector = "#wb-picker",
		$formGroup, $calendar, $elm, spy, callback,
		beforeFactory = function( elm, label ) {
			elm = elm || "<input type=\"date\" id=\"appointment\"/>";
			label = label || "<label for=\"appointment\">Appointment Date</label>";
			return function( done ) {

				// Spy on jQuery's trigger method to see how it's called during the plugin's initialization
				spy = sandbox.spy( $.prototype, "trigger" );

				if ( !callback ) {
					callback = done;
				}

				$formGroup = $(
					"<div>" + label + "</div>"
				)
					.prependTo( $body );

				$elm = $( elm )
					.appendTo( $formGroup );

				$elm.trigger( "wb-init.wb-date" );
			};
		},
		defaultAfter = function() {

			// Restore the original behaviour of trigger once the tests are finished
			sandbox.restore();

			// Remove test data from the page
			$formGroup.remove();

			callback = null;
		};

	before( function() {
		$document.on( "wb-init.wb-date", selector, function() {
			$calendar = $( calendarSelector );
			if ( callback ) {
				callback();
			}
		} );
	} );

	describe( "initialization", function() {
		before( beforeFactory() );
		after( defaultAfter );

		it( "should have marked the element as initialized", function() {
			expect( $elm.hasClass( "wb-date-inited" ) ).to.equal( true );
		} );

		it( "should have created the date picker toggle button", function() {
			var $toggle = $elm.next().find( "a" );
			expect( $toggle.attr( "class" ) ).to.contain( "picker-toggle" );
			expect( $toggle.attr( "id" ) ).to.equal( "appointment-picker-toggle" );
		} );

		it( "should have created an instance of the calendar plugin", function() {
			expect( $calendar.length ).to.equal( 1 );
			expect( $calendar.find( ".wb-clndr" ).length ).to.equal( 1 );
		} );

		it( "should have created a close icon", function() {
			expect( $calendar.find( ".picker-close" ).length ).to.equal( 1 );
		} );

		it( "should have hidden the calendar", function() {
			expect( $calendar.css( "display" ) ).to.equal( "none" );
			expect( $calendar.attr( "aria-hidden" ) ).to.equal( "true" );
		} );

		it( "should have added links to the calendar", function() {
			var lastDay = new Date();
			lastDay.setMonth( lastDay.getMonth() + 1, 0 );
			expect( $calendar.find( ".cal-days a" ).length ).to.equal( lastDay.getDate() );
		} );

		it( "should have stored a state object in the field element", function() {
			var field = $elm.get( 0 ),
				state = field.state,
				today = new Date();

			expect( typeof state ).to.equal( "object" );
			expect( state.labelText ).to.equal( "Appointment Date" );
			expect( state.field ).to.equal( field );
			expect( state.$field.get( 0 ) ).to.equal( $elm.get( 0 ) );
			expect( state.minDate.toString() ).to.equal( new Date( 1800, 0, 1 ).toString() );
			expect( state.maxDate.toString() ).to.equal( new Date( 2100, 0, 1 ).toString() );
			expect( state.year ).to.equal( today.getFullYear() );
			expect( state.month ).to.equal( today.getMonth() );
			expect( typeof state.daysCallback ).to.equal( "function" );
		} );
	} );

	describe( "with a date format and error in the label", function() {
		var label = "<label for=\"appointment\">" +
				"<span class=\"field-name\">Appointment Date</span>" +
				"<span class=\"datepicker-format\">(YYYY-MM-DD)</span>" +
				"<strong class=\"error\" id=\"appointment-error\">" +
					"<span class=\"label label-danger\">" +
						"<span class=\"prefix\">Error 1: </span>Please enter a valid date" +
					"</span>" +
				"</strong>" +
			"</label>";

		before( beforeFactory( null, label ) );
		after( defaultAfter );

		it( "should have stored only the field name in the label", function() {
			var state = $elm.get( 0 ).state;
			expect( state.labelText ).to.equal( "Appointment Date" );
		} );
	} );

	describe( "with a populated date", function() {
		before( beforeFactory( "<input type=\"date\" id=\"appointment\" value=\"2014-08-07\"/>" ) );
		after( defaultAfter );

		it( "should have stored the date in the state object", function() {
			var state = $elm.get( 0 ).state;
			expect( state.date.toString() ).to.equal( new Date( 2014, 7, 7 ).toString() );
		} );
	} );

	describe( "toggle button", function() {
		var hiddenAltText = "Pick a date from a calendar for field: Appointment Date";

		before( beforeFactory() );
		after( defaultAfter );

		it( "should have added alternative text indentifying the parent control", function() {
			var $toggle = $elm.next().find( "a" );
			expect( $toggle.text() ).to.equal( hiddenAltText );
			expect( $toggle.attr( "title" ) ).to.equal( hiddenAltText );
		} );

		describe( "click while calendar is closed", function() {
			before( function() {
				$elm.next().find( "a" ).click();
			} );

			after( function() {
				$elm.next().find( "a" ).click();
			} );

			it( "should have opened the calendar", function() {
				expect( $calendar.hasClass( "open" ) ).to.equal( true );
				expect( $calendar.css( "display" ) ).to.equal( "block" );
			} );

			it( "should have updated the alternative text on open", function() {
				var $toggle = $elm.next().find( "a" );
				var altText = "Hide calendar  (escape key)";
				expect( $toggle.text() ).to.equal( altText );
				expect( $toggle.attr( "title" ) ).to.equal( altText );
			} );
		} );

		describe( "click while calendar is opened", function() {
			before( function() {
				$elm.next().find( "a" ).click().click();
			} );

			it( "should have closed the calendar on a second click", function() {
				expect( $calendar.hasClass( "open" ) ).to.equal( false );
				expect( $calendar.css( "display" ) ).to.equal( "none" );
			} );

			it( "should have updated the alternative text on close", function() {
				var $toggle = $elm.next().find( "a" );
				expect( $toggle.text() ).to.equal( hiddenAltText );
				expect( $toggle.attr( "title" ) ).to.equal( hiddenAltText );
			} );
		} );
	} );

	describe( "toggle button for disabled date field", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" readonly id=\"appointment\"/>" )();
		} );
		after( function() {

			//Avoids breaking subsequent tests if the test fails.
			$elm.next().find( "a" ).click();

			defaultAfter();
		} );

		it( "should not have opend the calendar on click", function() {
			expect( $calendar.hasClass( "open" ) ).to.equal( false );
			expect( $calendar.css( "display" ) ).to.equal( "none" );
		} );
	} );

	describe( "toggle button for read-only date field", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" readonly id=\"appointment\"/>" )();
		} );
		after( function() {

			//Avoids breaking subsequent tests if the test fails.
			$elm.next().find( "a" ).click();

			defaultAfter();
		} );

		it( "should not have opend the calendar on click", function() {
			expect( $calendar.hasClass( "open" ) ).to.equal( false );
			expect( $calendar.css( "display" ) ).to.equal( "none" );
		} );
	} );

	describe( "close button", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$( ".picker-close" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\"/>" )();
		} );
		after( defaultAfter );

		it( "should have closed the calendar on click", function() {
			expect( $calendar.hasClass( "open" ) ).to.equal( false );
			expect( $calendar.css( "display" ) ).to.equal( "none" );
		} );
	} );

	describe( "keyboard shortcut", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$calendar.trigger( {
					type: "keydown",
					which: 27
				} );
				done();
			};
			beforeFactory()();
		} );
		after( defaultAfter );

		it( "should have close the calendar on pressing the escape key", function() {
			expect( $calendar.hasClass( "open" ) ).to.equal( false );
			expect( $calendar.css( "display" ) ).to.equal( "none" );
		} );
	} );

	describe( "opening the calendar", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"test\" min=\"2014-03-04\" max=\"2014-03-18\"/>", "<label for=\"test\">Test Date</label>" )();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have update the calendar settings object with the field state object", function() {
			var state = $elm.get( 0 ).state,
				calSettings = $calendar.get( 0 ).firstChild.lib,
				key;

			for ( key in state ) {
				expect( calSettings[ key ] ).to.equal( state[ key ] );
			}
		} );

		it( "should have updated the aria-hidden attribute", function() {
			expect( $calendar.attr( "aria-hidden" ) ).to.equal( "false" );
		} );

		it( "should have updated the aria-controls to the date field", function() {
			expect( $calendar.attr( "aria-controls" ) ).to.equal( "test" );
		} );

		it( "should have updated the aria-labelled-by to the toggle button", function() {
			expect( $calendar.attr( "aria-labelledby" ) ).to.equal( "test-picker-toggle" );
		} );

		it( "should have positioned the date picker immediately under the control", function() {
			var calendarPosition = $calendar.offset(),
				fieldPosition = $elm.offset();

			expect( Math.floor( calendarPosition.left ) ).to.equal( Math.floor( fieldPosition.left ) );
			expect( Math.floor( calendarPosition.top ) ).to.equal( Math.floor( fieldPosition.top + $elm.outerHeight() ) );
		} );
	} );

	describe( "opening the calendar when the field has no date and the current date is inside the date range", function() {
		var today = new Date();

		before( function( done ) {
			var minDate = new Date(),
				maxDate = new Date();

			minDate.setMonth( -1 );
			maxDate.setMonth( 1 );

			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\"" +
				" min=\"" + minDate.toISOString().split( "T" )[ 0 ] +
				" max=\"" + maxDate.toISOString().split( "T" )[ 0 ] +
				" \"/>"
			)();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have set the month and year to the current month and year", function() {
			var settings = $calendar.get( 0 ).firstChild.lib;
			expect( settings.year ).to.equal( today.getFullYear() );
			expect( settings.month ).to.equal( today.getMonth() );
		} );
	} );

	describe( "opening the calendar when the field has no date and the current date is outside the date range", function() {
		var maxDate = new Date();

		before( function( done ) {
			var minDate = new Date();

			minDate.setMonth( -2 );
			maxDate.setMonth( -1 );

			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" " +
				"min=\"" + minDate.toISOString().split( "T" )[ 0 ] + "\" " +
				"max=\"" + maxDate.toISOString().split( "T" )[ 0 ] + "\" />"
			)();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have set the month and year to the maximum data's month and year", function() {
			var settings = $calendar.get( 0 ).firstChild.lib;
			expect( settings.year ).to.equal( maxDate.getFullYear() );
			expect( settings.month ).to.equal( maxDate.getMonth() );
		} );
	} );

	describe( "opening the calendar when the associated field has a date that is inside the date range", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" min=\"2014-03-18\" max=\"2015-03-18\" value=\"2014-08-07\"/>" )();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );
		it( "should have set the calendar to the same month as the field's date", function() {
			var settings = $calendar.get( 0 ).firstChild.lib;
			expect( settings.year ).to.equal( 2014 );
			expect( settings.month ).to.equal( 7 );
		} );

		it( "should have highlighted the selected date", function() {
			expect( $calendar.find( ".cal-index-7 > a" ).attr( "aria-selected" ) ).to.equal( "true" );
		} );
	} );

	describe( "closing the calendar", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click().click();
				done();
			};
			beforeFactory()();
		} );
		after( defaultAfter );

		it( "should have updated the aria-hidden attribute", function() {
			expect( $calendar.attr( "aria-hidden" ) ).to.equal( "true" );
		} );
	} );

	describe( "minimum date", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$( ".cal-year" ).val( 2014 ).trigger( "change" );
				$( ".cal-month" ).val( 2 ).trigger( "change" );
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" min=\"2014-03-18\"/>" )();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have been added to the state object", function() {
			expect( $elm.get( 0 ).state.minDate.toString() ).to.equal( new Date( 2014, 2, 18 ).toString() );
		} );

		it( "should have been passed the minimum to the calendar plugin", function() {
			expect( $calendar.get( 0 ).firstChild.lib.minDate.toString() ).to.equal( new Date( 2014, 2, 18 ).toString() );
		} );

		it( "should have prevented the creation of links before the minimum date", function() {
			expect( $calendar.find( ".cal-days a" ).length ).to.equal( 14 );
		} );
	} );

	describe( "maximum date", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$( ".cal-year" ).val( 2014 ).trigger( "change" );
				$( ".cal-month" ).val( 2 ).trigger( "change" );
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" max=\"2014-03-18\"/>" )();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have been added to the state object", function() {
			expect( $elm.get( 0 ).state.maxDate.toString() ).to.equal( new Date( 2014, 2, 18 ).toString() );
		} );

		it( "should have been passed the minimum to the calendar plugin", function() {
			expect( $calendar.get( 0 ).firstChild.lib.maxDate.toString() ).to.equal( new Date( 2014, 2, 18 ).toString() );
		} );

		it( "should have prevented the creation of links past the maximum date", function() {
			expect( $calendar.find( ".cal-days a" ).length ).to.equal( 18 );
		} );
	} );

	describe( "minimum and maximum dates in same month", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" min=\"2014-03-04\" max=\"2014-03-18\"/>" )();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have been passed the minimum and maximum to the calendar plugin", function() {
			var settings = $calendar.get( 0 ).firstChild.lib;
			expect( settings.minDate.toString() ).to.equal( new Date( 2014, 2, 4 ).toString() );
			expect( settings.maxDate.toString() ).to.equal( new Date( 2014, 2, 18 ).toString() );
		} );

		it( "should have prevented the creation of links before the minimum date and past the maximum date", function() {
			expect( $( calendarSelector ).find( ".cal-days a" ).length ).to.equal( 15 );
		} );
	} );

	describe( "selecting a date", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$calendar.find( ".cal-days a" ).eq( 5 ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" min=\"2014-03-01\" max=\"2014-03-31\"/>" )();
		} );
		after( defaultAfter );

		it( "should have populated the from field with the selected date", function() {
			expect( $elm.val() ).to.equal( "2014-03-06" );
		} );

		it( "should have triggered the change event on the form field", function() {
			expect( spy.calledWith( "change" ) ).to.equal( true );
			expect( spy.calledOn( $elm ) ).to.equal( true );
		} );

		it( "should have closed the calendar", function() {
			expect( $calendar.hasClass( "open" ) ).to.equal( false );
			expect( $calendar.css( "display" ) ).to.equal( "none" );
		} );
	} );

	describe( "selecting a date for a disabled field", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$elm.attr( "disabled", "true" );
				$calendar.find( ".cal-days a" ).eq( 5 ).click();
				done();
			};
			beforeFactory()();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should not have populated the form field", function() {
			expect( $elm.val() ).to.equal( "" );
		} );

		it( "should not have triggered the change event on the form field", function() {
			expect( spy.calledWith( "change" ) ).to.equal( false );
		} );
	} );

	describe( "selecting a date for a read-only field", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click();
				$elm.attr( "readonly", "true" );
				$calendar.find( ".cal-days a" ).eq( 5 ).click();
				done();
			};
			beforeFactory()();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should not have populated the form field", function() {
			expect( $elm.val() ).to.equal( "" );
		} );

		it( "should not have triggered the change event on the form field", function() {
			expect( spy.calledWith( "change" ) ).to.equal( false );
		} );
	} );

	describe( "updating the min and max date of the field after the creation of the element", function() {
		before( function( done ) {
			callback = function() {
				$elm.next().find( "a" ).click().click();
				$elm.attr( "min", "2014-03-12" );
				$elm.attr( "max", "2014-03-17" );
				$elm.next().find( "a" ).click();
				done();
			};
			beforeFactory( "<input type=\"date\" id=\"appointment\" min=\"2014-03-08\" max=\"2014-03-22\"/>" )();
		} );
		after( function() {
			$elm.next().find( "a" ).click();
			defaultAfter();
		} );

		it( "should have update the field's state", function() {
			var field = $elm.get( 0 ),
				state = field.state;

			expect( state.minDate.toString() ).to.equal( new Date( 2014, 2, 12 ).toString() );
			expect( state.maxDate.toString() ).to.equal( new Date( 2014, 2, 17 ).toString() );
		} );

		it( "should have update the min and max date of the date picker", function() {
			expect( $( calendarSelector ).find( ".cal-days a" ).length ).to.equal( 6 );
		} );
	} );
} );

}( jQuery, wb ) );
