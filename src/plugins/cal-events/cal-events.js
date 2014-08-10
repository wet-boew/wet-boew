/**
 * @title WET-BOEW Events Calendar
 * @overview Dynamically generates a calendar interface for navigating a list of events.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-calevt",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	evDetails = "ev-details",
	$document = wb.doc,
	i18n, i18nText,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm;

		if ( elm ) {
			$elm = $( elm );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					monthNames: i18n( "mnths" ),
					calendar: i18n( "cal" )
				};
			}

			// Load ajax content
			$.when.apply( $, $.map( $elm.find( "[data-calevt]" ), getAjax ) )
				.always( function() {
					processEvents( $elm );

					// Identify that initialization has completed
					wb.ready( $elm, componentName );
				});
		}
	},

	getAjax = function( ajaxContainer ) {
		var $ajaxContainer = $( ajaxContainer ),
			urls = $ajaxContainer.data( "calevt" ).split( /\s+/ ),
			dfd = $.Deferred(),
			len = urls.length,
			promises = [],
			i, appendData;

		appendData = function( data ) {
			$ajaxContainer.append( $.trim( data ) );
		};

		for ( i = 0; i < len; i += 1 ) {
			promises.push( $.get( urls[ i ], appendData, "html" ) );
		}

		$.when.apply( $, promises ).always(function() {
			dfd.resolve();
		});

		return dfd.promise();
	},

	processEvents = function( $elm ) {
		var date = new Date(),
			year = date.getFullYear(),
			month = date.getMonth(),
			elmYear = $elm.find( ".year" ),
			elmMonth = $elm.find( ".month" ),
			events, containerId, $container;

		if ( elmYear.length > 0 && elmMonth.length > 0 ) {

			// We are going to assume this is always a number.
			year = elmYear.text();

			month = elmMonth.hasClass( "textformat" ) ? $.inArray( elmMonth.text(), i18nText.monthNames ) : elmMonth.text() - 1;
		}

		events = getEvents( $elm );
		containerId = $elm.data( "calevtSrc" );
		$container = $( "#" + containerId )
			.addClass( componentName + "-cal" )
			.data( "calEvents", events );

		$document.trigger( "create.wb-cal", [
				containerId,
				year,
				month,
				true,
				events.minDate,
				events.maxDate
			]
		);
		$container.attr( "aria-label", i18nText.calendar );
	},

	daysBetween = function( dateLow, dateHigh ) {

		// Simplified conversion to date object
		var date1 = wb.date.convert( dateLow ),
			date2 = wb.date.convert( dateHigh ),
			dstAdjust = 0,
			oneMinute = 1000 * 60,
			oneDay = oneMinute * 60 * 24,
			diff;

		// Equalize times in case date objects have them
		date1.setHours( 0 );
		date1.setMinutes( 0 );
		date1.setSeconds( 0 );
		date2.setHours( 0 );
		date2.setMinutes( 0 );
		date2.setSeconds( 0 );

		// Take care of spans across Daylight Saving Time changes
		if ( date2 > date1 ) {
			dstAdjust = ( date2.getTimezoneOffset() - date1.getTimezoneOffset() ) * oneMinute;
		} else {
			dstAdjust = ( date1.getTimezoneOffset() - date2.getTimezoneOffset() ) * oneMinute;
		}
		diff = Math.abs( date2.getTime() - date1.getTime() ) - dstAdjust;
		return Math.ceil( diff / oneDay );
	},

	getEvents = function( obj ) {
		var directLinking = !( $( obj ).hasClass( "evt-anchor" ) ),
			events = {
				minDate: null,
				maxDate: null,
				iCount: 0,
				list: [
					{
						a: 1
					}
				]
			},
			objEventsList = null;

		if ( obj.find( "ol" ).length > 0 ) {
			objEventsList = obj.find( "ol" );
		} else if ( obj.find( "ul" ).length > 0 ) {
			objEventsList = obj.find( "ul" );
		}

		if ( objEventsList.length > 0 ) {
			objEventsList.children( "li" ).each(function() {
				var event = $( this ),
					objTitle = event.find( "*:header:first" ),
					title = objTitle.text(),
					origLink = event.find( "a" ).first(),
					link = origLink.attr( "href" ),
					linkId, date, tCollection, $tCollection, tCollectionTemp,
					strDate1, strDate2, strDate, z, zLen, className;

				/*
				 * Modification direct-linking or page-linking
				 *	- added the ability  to have class set the behaviour of the links
				 *	- default is to use the link of the item as the event link in the calendar
				 *	- 'evt-anchor' class dynamically generates page anchors on the links it maps to the event
				 */
				if ( !directLinking ) {
					linkId = event.attr( "id" ) || wb.guid();
					event.attr( "id", linkId );

					/*
					 * Fixes IE tabbing error:
					 * http://www.earthchronicle.com/ECv1point8/Accessibility01IEAnchoredKeyboardNavigation.aspx
					 */
					if ( wb.ie ) {
						event.attr( "tabindex", "-1" );
					}
					link = "#" + linkId;
				}

				date = new Date();
				date.setHours( 0, 0, 0, 0 );
				tCollection = event.find( "time" );

				/*
				 * Date spanning capability
				 *   - since there maybe some dates that are capable of spanning over months we need to identify them
				 *     the process is see how many time nodes are in the event. 2 nodes will trigger a span
				 */
				if ( tCollection.length > 1 ) {

					// This is a spanning event
					tCollectionTemp = tCollection[ 0 ];
					strDate1 = tCollectionTemp.nodeName.toLowerCase() === "time" ?
						$( tCollectionTemp ).attr( "datetime" ).substr( 0, 10 ).split( "-" ) :
						$( tCollectionTemp ).attr( "class" ).match( /datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/ )[ 1 ].substr( 0, 10 ).split( "-" );

					tCollectionTemp = tCollection[ 1 ];
					strDate2 = tCollectionTemp.nodeName.toLowerCase() === "time" ?
						$( tCollectionTemp ).attr( "datetime" ).substr( 0, 10 ).split( "-" ) :
						$( tCollectionTemp ).attr( "class" ).match( /datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/ )[ 1 ].substr( 0, 10 ).split( "-" );

					// Convert to zero-base month
					strDate1[ 1 ] = strDate1[ 1 ] - 1;
					strDate2[ 1 ] = strDate2[ 1 ] - 1;

					date.setFullYear( strDate1[ 0 ], strDate1[ 1 ], strDate1[ 2 ] );

					// Now loop in events to load up all the days that it would be on tomorrow.setDate(tomorrow.getDate() + 1);
					for ( z = 0, zLen = daysBetween( strDate1, strDate2 ); z <= zLen; z += 1 ) {
						if ( events.minDate === null || date < events.minDate ) {
							events.minDate = date;
						}
						if ( events.maxDate === null || date > events.maxDate ) {
							events.maxDate = date;
						}

						events.list[ events.iCount ] = {
							title: title,
							date: new Date( date.getTime() ),
							href: link
						};

						date = new Date( date.setDate( date.getDate() + 1 ) );

						// Add a viewfilter
						className = "filter-" + ( date.getFullYear() ) + "-" +
							wb.string.pad( date.getMonth() + 1, 2 );
						if ( !objTitle.hasClass( className ) ) {
							objTitle.addClass( className );
						}
						events.iCount += 1;
					}
				} else if ( tCollection.length === 1 ) {
					$tCollection = $( tCollection[ 0 ] );
					strDate = ( $tCollection.get( 0 ).nodeName.toLowerCase() === "time" ) ?
						$tCollection.attr( "datetime" ).substr( 0, 10 ).split( "-" ) :
						$tCollection.attr( "class" ).match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[ 1 ].substr( 0, 10 ).split( "-" );

					date.setFullYear( strDate[ 0 ], strDate[ 1 ] - 1, strDate[ 2 ] );

					if ( events.minDate === null || date < events.minDate ) {
						events.minDate = date;
					}
					if ( events.maxDate === null || date > events.maxDate ) {
						events.maxDate = date;
					}
					events.list[ events.iCount ] = {
						title: title,
						date: date,
						href: link
					};

					// Add a viewfilter
					className = "filter-" + ( date.getFullYear() ) + "-" + wb.string.pad( date.getMonth() + 1, 2 );
					if ( !objTitle.hasClass( className ) ) {
						objTitle.addClass( className );
					}
					events.iCount += 1;
				}

			// End of loop through objects/events
			});
		}

		window.events = events;
		return events;
	},

	addEvents = function( year, month, days, containerId, eventsList ) {
		var i, eLen, date, day, dayEvents, content;

		// Fix required to make up with the IE z-index behaviour mismatch
		for ( i = 0, eLen = days.length; i !== eLen; i += 1 ) {
			days.eq( i ).css( "z-index", 31 - i );
		}

		/*
		 * Determines for each event, if it occurs in the display month
		 * Modification - the author used a jQuery native $.each function for
		 * looping. This is a great function, but has a tendency to like
		 * HTMLELEMENTS and jQuery objects better. We have modified this
		 * to a for loop to ensure that all the elements are accounted for.
		 */
		for ( i = 0, eLen = eventsList.length; i !== eLen; i += 1 ) {
			date = new Date( eventsList[ i ].date );

			if ( date.getMonth() === month && date.getFullYear() === year ) {
				day = $( days[ date.getDate() - 1 ] );

				// Lets see if the cell is empty. If so lets create the cell
				if ( day.children( "a" ).length === 0 ) {
					dayEvents = $( "<ul class='wb-inv'></ul>" );
					content = day.children( "div" ).html();
					day
						.empty()
						.append(
							"<a href='#ev-" + day.attr( "id" ) +
								"' class='cal-evt' tabindex='-1'>" +
								content + "</a>",
							dayEvents
						);
				} else {

					/*
					 * Modification - added an else to the date find due to
					 * event collisions not being handled. So the pointer was
					 * getting lost.
					 */
					dayEvents = day.find( "ul.wb-inv" );
				}

				dayEvents.append( "<li><a tabindex='-1' class='cal-evt-lnk' href='" +
					eventsList[ i ].href + "'>" + eventsList[ i ].title + "</a></li>" );
				day.data( "dayEvents", dayEvents );
			}
		}

		days.find( ".cal-evt" ).first().attr( "tabindex", "0" );
	},

	showOnlyEventsFor = function( year, month, calendarId ) {
		$( "." + calendarId + " li.cal-disp-onshow" )
			.addClass( "wb-inv" )
			.has( ":header[class*=filter-" + year + "-" +
				wb.string.pad( parseInt( month, 10 ) + 1, 2 ) + "]" )
			.removeClass( "wb-inv" );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

$document.on( "displayed.wb-cal", selector + "-cal", function( event, year, month, days, day ) {

	// Filter out any events triggered by descendants
	if ( event.currentTarget === event.target ) {
		var target = event.target,
			$target = $( target ),
			containerId = target.id,
			events = $target.data( "calEvents" );

		addEvents( year, month, days, containerId, events.list );
		showOnlyEventsFor( year, month, containerId );
		$target.find( ".cal-index-" + day + " .cal-evt" ).trigger( "setfocus.wb" );

		$target.trigger( "wb-updated" + selector );
	}
});

$document.on( "focusin focusout", ".wb-calevt-cal .cal-days a", function( event ) {
	var eventType = event.type,
		dayEvents = $( event.target ).closest( "td" ).data( "dayEvents" );

	switch ( eventType ) {
	case "focusin":
		dayEvents
			.closest( ".cal-days" )
				.find( "a[tabindex=0]" )
					.attr( "tabindex", "-1" );
		dayEvents
			.removeClass( "wb-inv" )
			.addClass( evDetails )
			.find( "a" )
				.attr( "tabindex", "0" );
		dayEvents.prev( "a" ).attr( "tabindex", "0" );
		break;

	case "focusout":
		setTimeout(function() {
			if ( dayEvents.find( "a:focus" ).length === 0 ) {
				dayEvents.removeClass( evDetails )
					.addClass( "wb-inv" )
					.find( "a" )
						.attr( "tabindex", "-1" );
			}
		}, 5 );
		break;
	}
});

$document.on( "mouseover mouseout", ".wb-calevt-cal .cal-days td", function( event ) {
	var target = event.currentTarget,
		eventType = event.type,
		dayEvents;

	// Only handle calendar cells with events
	if ( target.getElementsByTagName( "a" ).length !== 0 ) {
		dayEvents = $( target ).data( "dayEvents" );

		switch ( eventType ) {
		case "mouseover":
			dayEvents.dequeue()
				.removeClass( "wb-inv" )
				.addClass( evDetails );
			break;

		case "mouseout":
			dayEvents.delay( 100 ).queue(function() {
				$( this ).removeClass( evDetails )
					.addClass( "wb-inv" )
					.dequeue();
			});
			break;
		}
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
