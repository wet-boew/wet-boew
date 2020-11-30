/**
 * @title Calendar library Unit Tests
 * @overview Test the calendar library behaviour
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @LaurentGoderre
 */
( function( $, wb ) {

describe( "calendar test suite", function() {
	var sandbox = sinon.sandbox.create(),
		trigger = sandbox.spy( $.prototype, "trigger" ),
		$document = wb.doc,
		$elm;

	before( function() {
		$elm = $( "<div id='test'></div>" ).appendTo( $document.find( "body" ) );
	} );

	after( function() {
		$elm.remove();

		sandbox.restore();
	} );

	describe( "create a calendar", function() {
		var settings = {
				year: 2012,
				month: 1,
				minDate: new Date( 2011, 0, 1 ),
				maxDate: new Date( 2015, 0, 1 )
			},
			calendar, $calendarObj;

		before( function() {
			calendar = wb.calendar.create( $elm, settings );
			$calendarObj = calendar.$o;
		} );

		after( function() {
			$calendarObj.remove();
		} );

		it( "should create a calendar", function() {
			expect( $calendarObj.length ).to.be( 1 );
			expect( $calendarObj.find( ".cal-nav" ).length ).to.be( 1 );
			expect( $calendarObj.find( ".cal-days" ).length ).to.be( 1 );
		} );

		it( "should populate the year field", function() {
			var yearField = $calendarObj.find( ".cal-year" ).get( 0 );

			expect( yearField.options.length ).to.be( 5 );
		} );

		it( "should select the specified year in the year navigation field", function() {
			var yearField = $calendarObj.find( ".cal-year" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( "2012" );
		} );

		it( "should select the specified month in the month navigation field", function() {
			var monthField = $calendarObj.find( ".cal-month" ).get( 0 ),
				val = monthField.selectedIndex;

			expect( val ).to.be( 1 );
			expect( monthField.options[ val ].text ).to.be( "February" );
		} );

		it( "should create the days", function() {
			var $days = $calendarObj.find( ".cal-days td:not(.cal-empty)" ),
				firstDay = $days.filter( ":first" ).prevAll().length,
				lastDay = 7 - $days.filter( ":last" ).nextAll().length;

			expect( $days.length ).to.be( 29 );
			expect( firstDay ).to.be( 3 );
			expect( lastDay ).to.be( 4 );
		} );

		it( "should use the HTML5 time element and specify the date in ISO format", function() {
			var $times = $calendarObj.find( ".cal-days time" );

			expect( $times.length ).to.be( 29 );
			expect( $times.filter( ":eq(0)" ).attr( "datetime" ) ).to.be( "2012-02-01" );
		} );

		it( "should format the dates", function() {
			expect( $calendarObj.find( ".cal-days td:not(.cal-empty):eq(0)" ).text() ).to.be( "Wednesday, February 1, 2012" );
		} );

		it( "should store the calendar settings in the calendar", function() {
			expect( calendar.year ).to.be( 2012 );
			expect( calendar.month ).to.be( 1 );
			expect( +calendar.minDate ).to.equal( +new Date( 2011, 0, 1 ) );
			expect( +calendar.maxDate ).to.equal( +new Date( 2015, 0, 1 ) );
		} );
	} );

	describe( "reinitialize a calendar", function() {
		var minDate = new Date( 2011, 0, 1 ),
			maxDate = new Date( 2015, 0, 1 ),
			settings = {
				year: 2012,
				month: 1,
				minDate: minDate,
				maxDate: maxDate
			},
			calendar, $calendarObj;

		before( function() {
			calendar = wb.calendar.create( $elm );
			$calendarObj = calendar.$o;
			calendar.reInit( settings );
		} );

		after( function() {
			$calendarObj.remove();

			trigger.reset();
		} );

		it( "should update the year setting", function() {
			expect( calendar.year ).to.be( 2012 );
		} );

		it( "should update the month setting", function() {
			expect( calendar.month ).to.be( 1 );
		} );

		it( "should update the minDate setting", function() {
			expect( calendar.minDate ).to.be( minDate );
		} );

		it( "should update the maxDate setting", function() {
			expect( calendar.maxDate ).to.be( maxDate );
		} );

		it( "should update the list of years", function() {
			var $yearField = $calendarObj.find( ".cal-year" ),
				$years = $yearField.children();

			expect( $years.length ).to.be( 5 );
			expect( $years.get( 0 ).value ).to.be( "2011" );
		} );

		it( "should trigger a wb-navigate event with the new year and month", function() {
			expect( trigger.calledWith( {
				type: "wb-navigate.wb-clndr",
				year: 2012,
				month: 1
			} ) ).to.be( true );
		} );
	} );

	describe( "wb-navigate event navigation", function() {
		var settings = {
				year: 2012,
				month: 1,
				minDate: new Date( 2011, 0, 1 ),
				maxDate: new Date( 2015, 0, 1 )
			},
			calendar, $calendarObj;

		before( function() {
			calendar = wb.calendar.create( $elm, settings );
			$calendarObj = calendar.$o;

			$calendarObj.trigger( {
				type: "wb-navigate.wb-clndr",
				year: 2014,
				month: 6
			} );
		} );

		after( function() {
			$calendarObj.remove();
		} );

		it( "should update the month setting", function() {
			expect( calendar.month ).to.be( 6 );
		} );

		it( "should update the month field", function() {
			var monthField = $calendarObj.find( ".cal-month" ).get( 0 ),
				val = monthField.selectedIndex;

			expect( val ).to.be( 6 );
			expect( monthField.options[ val ].text ).to.be( "July" );
		} );

		it( "should update the year setting", function() {
			expect( calendar.year ).to.be( 2014 );
		} );

		it( "should update the year field", function() {
			var yearField = $calendarObj.find( ".cal-year" ).get( 0 );

			expect( yearField.options[ yearField.selectedIndex ].text ).to.be( "2014" );
		} );

		it( "should update the days", function() {
			var $days = $calendarObj.find( ".cal-days td:not(.cal-empty)" ),
				firstDay = $days.filter( ":first" ).prevAll().length,
				lastDay = 7 - $days.filter( ":last" ).nextAll().length;

			expect( $days.length ).to.be( 31 );
			expect( firstDay ).to.be( 2 );
			expect( lastDay ).to.be( 5 );
		} );
	} );

	describe( "arrow navigation", function() {

		describe( "previous month arrow", function() {
			var calendar, $calendarObj, $arrowLink, arrowLink;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2012,
					month: 0,
					minDate: new Date( 2011, 0, 1 )
				} );
				$calendarObj = calendar.$o;

				$arrowLink = $calendarObj.find( ".cal-month-prev" );
				arrowLink = $arrowLink.get( 0 );
				arrowLink.click();
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event with the new year and month", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 11
				} ) ).to.be( true );
			} );

			it( "should be disabled if the lower limit is reached", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 0
				} );

				expect( $arrowLink.attr( "disabled" ) ).to.be( "disabled" );
			} );

			it( "should be enabled if leaving the lower limit month", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 1
				} );

				expect( $arrowLink.attr( "disabled" ) ).not.to.be( "disabled" );
			} );
		} );

		describe( "next month arrow", function() {
			var calendar, $calendarObj, $arrowLink, arrowLink;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2012,
					month: 11,
					maxDate: new Date( 2013, 11, 31 )
				} );
				$calendarObj = calendar.$o;

				$arrowLink = $calendarObj.find( ".cal-month-next" );
				arrowLink = $arrowLink.get( 0 );
				arrowLink.click();
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event with the new year and month", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2013,
					month: 0
				} ) ).to.be( true );
			} );

			it( "should be disabled if the lower limit is reached", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2013,
					month: 11
				} );

				expect( $arrowLink.attr( "disabled" ) ).to.be( "disabled" );
			} );

			it( "should be enabled if leaving the lower limit month", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 10
				} );

				expect( $arrowLink.attr( "disabled" ) ).not.to.be( "disabled" );
			} );
		} );

	} );

	describe( "field navigation", function() {

		describe( "year field", function() {
			var calendar, $calendarObj, $yearField;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2013,
					month: 0,
					minDate: new Date( 2011, 0, 1 )
				} );
				$calendarObj = calendar.$o;

				$yearField = $calendarObj.find( ".cal-year" );
				$yearField.get( 0 ).selectedIndex = 0;
				$yearField.trigger( "change" );
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event with the new year and month", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 0
				} ) ).to.be( true );
			} );
		} );

		describe( "month field", function() {
			var calendar, $calendarObj, $monthField;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2013,
					month: 0,
					minDate: new Date( 2011, 0, 1 )
				} );
				$calendarObj = calendar.$o;

				$monthField = $calendarObj.find( ".cal-month" );
				$monthField.get( 0 ).selectedIndex = 4;
				$monthField.trigger( "change" );

			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event with the new year and month", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2013,
					month: 4
				} ) ).to.be( true );
			} );
		} );

	} );

	describe( "basic keyboard navigation", function() {

		describe( "page up key", function() {
			var calendar, $calendarObj;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2013,
					month: 0,
					minDate: new Date( 2012, 11, 15 )
				} );
				$calendarObj = calendar.$o;

				$calendarObj.trigger( {
					type: "keydown",
					which: 33
				} );
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event to the previous month", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2012,
					month: 11
				} ) ).to.be( true );
			} );
		} );

		describe( "(shift|ctrl) + page up key", function() {
			var calendar, $calendarObj;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2013,
					month: 0,
					minDate: new Date( 2011, 0, 15 )
				} );
				$calendarObj = calendar.$o;

				$calendarObj
					.trigger( {
						type: "keydown",
						which: 33,
						shiftKey: true
					} )
					.trigger( {
						type: "keydown",
						which: 33,
						ctrlKey: true
					} );
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event to the previous year", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 0
				} ) ).to.be( true );
			} );
		} );

		describe( "page down key", function() {
			var calendar, $calendarObj;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2013,
					month: 11,
					maxDate: new Date( 2014, 0, 15 )
				} );
				$calendarObj = calendar.$o;

				$calendarObj.trigger( {
					type: "keydown",
					which: 34
				} );
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event to the next month", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 0
				} ) ).to.be( true );
			} );
		} );

		describe( "(shift|ctrl) + page down key", function() {
			var calendar, $calendarObj;

			before( function() {
				calendar = wb.calendar.create( $elm,  {
					year: 2010,
					month: 0,
					maxDate: new Date( 2012, 0, 15 )
				} );
				$calendarObj = calendar.$o;

				$calendarObj
					.trigger( {
						type: "keydown",
						which: 34,
						shiftKey: true
					} )
					.trigger( {
						type: "keydown",
						which: 34,
						ctrlKey: true
					} );
			} );

			after( function() {
				$calendarObj.remove();

				trigger.reset();
			} );

			it( "should trigger a wb-navigate event to the next year", function() {
				expect( trigger.calledWith( {
					type: "wb-navigate.wb-clndr",
					year: 2012,
					month: 0
				} ) ).to.be( true );
			} );
		} );
	} );

	describe( "days callback", function() {
		var  callback = sinon.spy(),
			settings = {
				year: 2010,
				month: 0,
				minDate: new Date( 2010, 0, 12 ),
				maxDate: new Date( 2010, 0, 24 ),
				daysCallback: callback
			},
			calendar, $calendarObj, call, args;

		before( function() {
			calendar = wb.calendar.create( $elm, settings );
			$calendarObj = calendar.$o;
		} );

		after( function() {
			$calendarObj.remove();
		} );

		it( "should call the days callback when creating a calendar", function() {
			expect( callback.called ).to.be( true );
		} );

		it( "should call the days callback with the calendar as the 'this' context", function() {
			call = callback.lastCall;

			expect( call.thisValue ).to.be( calendar );
		} );

		it( "should call the callback with an integer for the year", function() {
			var year;

			args = call.args;
			year = args[ 0 ];

			expect( typeof year ).to.be( "number" );
			expect( year ).to.be( 2010 );
		} );

		it( "should call the callback with an integer for the month", function() {
			var month = args[ 1 ];

			expect( typeof month ).to.be( "number" );
			expect( month ).to.be( 0 );
		} );

		it( "should call the callback with a jQuery object with the list of days in the month", function() {
			var $days = args[ 2 ];

			expect( typeof $days ).to.be( "object" );
			expect( $days.length ).to.be( 31 );
		} );

		it( "should call the callback with an object specifying the days in range of the min and max dates", function() {
			var range = args[ 3 ];

			expect( typeof range ).to.be( "object" );
			expect( range.min ).to.be( 11 );
			expect( range.max ).to.be( 23 );
		} );

		describe( "callback on navigate", function() {
			before( function() {
				callback.reset();
				calendar.reInit( settings );
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2010,
					month: 1
				} );
			} );

			it( "should call the days callback when navigating to a new month calendar", function() {
				expect( callback.called ).to.be( true );
			} );
		} );

		describe( "callback exception", function() {
			before( function() {
				calendar.daysCallback = function() {
					throw "Exception";
				};

				try {
					$calendarObj.trigger( {
						type: "wb-navigate.wb-clndr",
						year: 2010,
						month: 4
					} );
				} catch ( e ) {
					/* swallow error */}
			} );

			it( "should update the calendar even if the callback throws an exception", function() {
				var monthField = $calendarObj.find( ".cal-month" ).get( 0 );

				expect( calendar.month ).to.be( 4 );
				expect( monthField.options[ monthField.selectedIndex ].text ).to.be( "May" );
			} );
		} );
	} );

	describe( "advanced keyboard navigation", function() {
		var settings = {
				year: 2013,
				month: 0,
				minDate: new Date( 2010, 0, 12 ),
				maxDate: new Date( 2014, 11, 25 ),
				daysCallback: function( year, month, days, range ) {
					var inRange = days;

					if ( range ) {
						if ( range.max ) {
							inRange = inRange.filter( ":lt(" + ( range.max + 1 ) + ")" );
						} else if ( range.min ) {
							inRange = inRange.filter( ":gt(" + ( range.min - 1 ) + ")" );
						}
					}

					inRange.wrap( "<a href='javascript:;' tabindex='-1'></a>" ).filter( ":eq(0)" ).parent().removeAttr( "tabindex" );
				}
			},
			calendar, $calendarObj, $daysArea, $focused;

		describe( "up arrow key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-2 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 38
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the same day of the week in the previous week in the previous week", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-26" );
			} );

			it( "should not navigate past the minimum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2010,
					month: 0
				} );

				$focused = $daysArea.find( ".cal-index-18 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 38
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-18" );
			} );
		} );

		describe( "down arrow key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-29 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 40
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the same day of the week in the previous week in the previous week", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-5" );
			} );

			it( "should not navigate past the maximum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 11
				} );

				$focused = $daysArea.find( ".cal-index-19 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 40
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-19" );
			} );
		} );

		describe( "left arrow key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-1 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 37
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to previous day", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-31" );
			} );

			it( "should not navigate past the minimum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2010,
					month: 0
				} );

				$focused = $daysArea.find( ".cal-index-12 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 37
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-12" );
			} );
		} );

		describe( "right arrow key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-31 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 39
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to next day", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-1" );
			} );

			it( "should not navigate past the maximum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 11
				} );

				$focused = $daysArea.find( ".cal-index-25 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 39
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-25" );
			} );
		} );

		describe( "home key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-15 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 36
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to first day of the month", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-1" );
			} );

			it( "should not navigate past the minimum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2010,
					month: 0
				} );

				$focused = $daysArea.find( ".cal-index-19 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 36
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-12" );
			} );
		} );

		describe( "end key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-15 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 35
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the last day of the month", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-31" );
			} );

			it( "should not navigate past the maximum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 11
				} );

				$focused = $daysArea.find( ".cal-index-19 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 35
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-25" );
			} );
		} );

		describe( "page up key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-15 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 33
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the same day in the previous month", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-15" );
				expect( calendar.year ).to.be( 2012 );
				expect( calendar.month ).to.be( 11 );
			} );

			it( "should not navigate past the minimum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2010,
					month: 1
				} );

				$focused = $daysArea.find( ".cal-index-11 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 33
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-11" );
				expect( calendar.month ).to.be( 1 );
			} );

			it( "should go to the last day of the month if coming from a month with 31 days to one with less than 31", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 2
				} );

				$focused = $daysArea.find( ".cal-index-31 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 33
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-28" );
			} );
		} );

		describe( "page down key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-15 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 34
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the same day in the next month", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-15" );
				expect( calendar.month ).to.be( 1 );
			} );

			it( "should not navigate past the maximum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 10
				} );

				$focused = $daysArea.find( ".cal-index-26 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 34
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-26" );
				expect( calendar.month ).to.be( 10 );
			} );

			it( "should go to the last day of the month if coming from a month with 31 days to one with less than 31", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2014,
					month: 0
				} );

				$focused = $daysArea.find( ".cal-index-31 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 34
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-28" );
			} );
		} );

		describe( "(shift|ctrl) + page up key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days" );

				$focused = $daysArea.find( ".cal-index-2 a" );
				$focused.get( 0 ).focus();

				$focused.trigger( {
					type: "keydown",
					which: 33,
					shiftKey: true
				} );
				$focused = $( document.activeElement );

				$focused.trigger( {
					type: "keydown",
					which: 33,
					ctrlKey: true
				} );
				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the same day and month in the previous year", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-2" );
				expect( calendar.year ).to.be( 2011 );
				expect( calendar.month ).to.be( 0 );
			} );

			it( "should not navigate past the minimum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2011,
					month: 0
				} );

				$focused = $daysArea.find( ".cal-index-11 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 33,
					shiftKey: true
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-11" );
				expect( calendar.year ).to.be( 2011 );
				expect( calendar.month ).to.be( 0 );
			} );
		} );

		describe( "(shift|ctrl) + page down key", function() {
			before( function() {
				calendar = wb.calendar.create( $elm, $.extend( {}, settings, { year: 2010 } ) );
				$calendarObj = calendar.$o;
				$daysArea = $calendarObj.find( ".cal-days " );

				$focused = $daysArea.find( ".cal-index-15 a" );
				$focused.get( 0 ).focus();

				$focused.trigger( {
					type: "keydown",
					which: 34,
					shiftKey: true
				} );
				$focused = $( document.activeElement );

				$focused.trigger( {
					type: "keydown",
					which: 34,
					ctrlKey: true
				} );

				$focused = $( document.activeElement );
			} );

			after( function() {
				$calendarObj.remove();
			} );

			it( "should go to the same day and month in the next year", function() {
				expect( $focused.length ).to.be( 1 );
				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-15" );
				expect( calendar.year ).to.be( 2012 );
				expect( calendar.month ).to.be( 0 );
			} );

			it( "should not navigate past the maximum date", function() {
				$calendarObj.trigger( {
					type: "wb-navigate.wb-clndr",
					year: 2013,
					month: 11
				} );

				$focused = $daysArea.find( ".cal-index-26 a" );
				$focused.get( 0 ).focus();
				$focused.trigger( {
					type: "keydown",
					which: 34,
					shiftKey: true
				} );

				$focused = $( document.activeElement );

				expect( $focused.parent().attr( "class" ) ).to.be( "cal-index-26" );
				expect( calendar.year ).to.be( 2013 );
				expect( calendar.month ).to.be( 11 );
			} );
		} );
	} );
} );

}( jQuery, wb ) );
