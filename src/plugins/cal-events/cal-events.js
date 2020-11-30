/**
 * @title WET-BOEW Events Calendar
 * @overview Dynamically generates a calendar interface for navigating a list of events.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
( function( $, window, wb ) {
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
	setFocusEvent = "focus",
	dataAttr = componentName,
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
					calendar: i18n( "cal" )
				};
			}

			// Load ajax content
			$.when.apply( $, $.map( $elm.find( "[data-calevt]" ), getAjax ) )
				.always( function() {
					processEvents( $elm );

					// Identify that initialization has completed
					wb.ready( $elm, componentName );
				} );
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

		$.when.apply( $, promises ).always( function() {
			dfd.resolve();
		} );

		return dfd.promise();
	},

	processEvents = function( $elm ) {
		var settings = $.extend( {}, window[ componentName ], $elm.data( dataAttr ) ),
			year, month, events, containerId, $container,
			minDate, maxDate, minDateTime, maxDateTime,
			currDate = new Date(),
			currDateTime = currDate.getTime();

		events = getEvents( $elm );
		containerId = $elm.data( "calevtSrc" );
		$container = $( "#" + containerId ).addClass( componentName + "-cal" );

		year = settings.year;
		month = settings.month;

		minDate = events.minDate;
		maxDate = events.maxDate;
		minDateTime = minDate.getTime();
		maxDateTime = maxDate.getTime();

		if ( !year && minDateTime < currDateTime && currDateTime < maxDateTime ) {
			year = currDate.getFullYear();
		} else if ( !year && currDateTime < minDateTime ) {
			year = minDate.getFullYear();
		} else if ( !year && maxDateTime < currDateTime ) {
			year = maxDate.getFullYear();
		}

		if ( !month && minDateTime < currDateTime && currDate.getTime() < maxDateTime ) {
			month = currDate.getMonth();
		} else if ( !month && currDateTime < minDateTime ) {
			month = minDate.getMonth();
		} else if ( !month && maxDateTime < currDateTime ) {
			month = maxDate.getMonth();
		}

		wb.calendar.create( $container, {
			year: year,
			month: month,
			minDate: minDate,
			maxDate: maxDate,
			daysCallback: addEvents,
			events: events.list,
			$events: $elm
		} );

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

	///TODO: Review this code
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
			objEventsList = obj.find( "ol > li, ul > li" ),
			iLen = objEventsList.length,
			dateTimeRegExp = /datetime\s+\{date:\s*(\d+-\d+-\d+)\}/,
			i, $event, event, $objTitle, title, link, href, target,
			linkId, date, tCollection, tCollectionTemp,	strDate1,
			strDate2, z, zLen, className, dateClass;

		for ( i = 0; i !== iLen; i += 1 ) {
			$event = objEventsList.eq( i );
			event = $event[ 0 ];
			$objTitle = $event.find( "*:header:first" );
			className = $objTitle.attr( "class" );
			title = $objTitle.text();
			link = $event.find( "a" )[ 0 ];
			href = link.getAttribute( "href" );
			target = link.getAttribute( "target" );
			zLen = 1;

			/*
			 * Modification direct-linking or page-linking
			 *	- added the ability  to have class set the behaviour of the links
			 *	- default is to use the link of the item as the event link in the calendar
			 *	- 'evt-anchor' class dynamically generates page anchors on the links it maps to the event
			 */
			if ( !directLinking ) {
				linkId = event.id || wb.getId();
				event.id = linkId;

				/*
				 * Fixes IE tabbing error:
				 * http://www.earthchronicle.com/ECv1point8/Accessibility01IEAnchoredKeyboardNavigation.aspx
				 */

				// TODO: Which versions of IE should this fix be limited to?
				if ( wb.ie ) {
					event.tabIndex = "-1";
				}
				href = "#" + linkId;
			}

			date = new Date();
			date.setHours( 0, 0, 0, 0 );
			tCollection = event.getElementsByTagName( "time" );

			/*
			 * Date spanning capability
			 *   - since there may be some dates that are capable of spanning over months we need to identify them
			 *     the process is see how many time nodes are in the event. 2 nodes will trigger a span
			 */
			if ( tCollection.length !== 0 ) {
				tCollectionTemp = tCollection[ 0 ];
				strDate1 = tCollectionTemp.nodeName.toLowerCase() === "time" ?
					tCollectionTemp.getAttribute( "datetime" ).substr( 0, 10 ).split( "-" ) :
					tCollectionTemp.className.match( dateTimeRegExp )[ 1 ].substr( 0, 10 ).split( "-" );

				// Convert to zero-based month
				strDate1[ 1 ] = strDate1[ 1 ] - 1;

				date.setFullYear( strDate1[ 0 ], strDate1[ 1 ], strDate1[ 2 ] );

				if ( tCollection.length !== 1 ) {

					// This is a spanning event
					tCollectionTemp = tCollection[ 1 ];
					strDate2 = tCollectionTemp.nodeName.toLowerCase() === "time" ?
						tCollectionTemp.getAttribute( "datetime" ).substr( 0, 10 ).split( "-" ) :
						tCollectionTemp.className.match( dateTimeRegExp )[ 1 ].substr( 0, 10 ).split( "-" );

					// Convert to zero-based month
					strDate2[ 1 ] = strDate2[ 1 ] - 1;

					zLen += daysBetween( strDate1, strDate2 );
				}

				// Now loop in events to load up all the days that it would be on tomorrow.setDate(tomorrow.getDate() + 1);
				for ( z = 0; z !== zLen; z += 1 ) {
					if ( z !== 0 ) {
						date = new Date( date.setDate( date.getDate() + 1 ) );
					}

					if ( events.minDate === null || date < events.minDate ) {
						events.minDate = date;
					}

					if ( events.maxDate === null || date > events.maxDate ) {
						events.maxDate = date;
					}

					events.list[ events.iCount ] = {
						title: title,
						date: new Date( date.getTime() ),
						href: href,
						target: target
					};

					// Add a viewfilter
					dateClass = "filter-" + ( date.getFullYear() ) + "-" +
						wb.string.pad( date.getMonth() + 1, 2 );
					if ( !className ) {
						className = dateClass;
					} else if ( className.indexOf( dateClass ) === -1 ) {
						className += " " + dateClass;
					}
					events.iCount += 1;
				}
				$objTitle.attr( "class", className );
			}

		// End of loop through objects/events
		}

		//Sort events
		events.list.sort( function( firstEvent, secondEvent ) {
			return firstEvent.date - secondEvent.date;
		} );

		return events;
	},

	addEvents = function( year, month, $days ) {
		var eventsList = this.events,
			i, eLen, date, dayIndex, $day, $dayEvents, event, eventMonth;

		// Fix required to make up with the IE z-index behaviour mismatch
		// TODO: Move ot IE CSS? Which versions of IE should this fix be limited to?
		if ( wb.ie ) {
			for ( i = 0, eLen = $days.length; i !== eLen; i += 1 ) {
				$days.eq( i ).css( "z-index", 31 - i );
			}
		}

		/*
		 * Determines for each event, if it occurs in the display month
		 */
		for ( i = 0, eLen = eventsList.length; i !== eLen; i += 1 ) {
			event = eventsList[ i ];
			date = event.date;

			if ( date.getFullYear() === year ) {
				eventMonth = date.getMonth();
				if ( eventMonth > month ) {

					//End the loop if the next event is in a future month because events are sorted chronologically
					break;
				} else if ( date.getMonth() === month ) {
					dayIndex = date.getDate() - 1;
					$day = $( $days[ dayIndex ] );

					//Get the appropriate day events if a day link exists
					if ( $day.parent().get( 0 ).nodeName !== "A" ) {
						$dayEvents = $day.next();
					} else {
						$dayEvents = $day.parent().next();
					}

					//Create the event list container if it doesn't exist
					if ( $dayEvents.length !== 1 ) {
						$dayEvents = $( "<ul></ul>" ).insertAfter( $day );

						//Determine the focus based on the day before
						if ( dayIndex && $days[ dayIndex - 1 ].parentNode.nodeName === "A" ) {
							$day.wrap( "<a href='javascript:;' class='cal-evt' tabindex='-1'></a>" );
						} else {
							$day.wrap( "<a href='javascript:;' class='cal-evt'></a>" );
						}
					}

					//Add the event to the list
					$dayEvents.append( "<li><a tabindex='-1' class='cal-evt-lnk' href='" + event.href + "'>" + event.title + "</a></li>" );
				}
			}
		}
	},

	filterEvents = function( year, month ) {
		this.find( "li.cal-disp-onshow" )
			.addClass( "wb-inv" )
			.has( ":header[class*=filter-" + year + "-" +
				wb.string.pad( parseInt( month, 10 ) + 1, 2 ) + "]" )
			.removeClass( "wb-inv" );
	},

	showEvents = function() {
		$( this )
			.next()
			.addClass( evDetails );
	},

	hideEvents = function() {
		var $link = $( this ),
			$cell = $link.closest( "td" );

		setTimeout( function() {
			if ( $cell.find( "a:focus" ).length === 0 ) {
				$cell.find( "ul" )
					.removeClass( evDetails )
					.find( "a" )
					.attr( "tabindex", "-1" );
			}
		}, 5 );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

$document.on( "wb-navigate.wb-clndr", ".wb-calevt-cal", function( event ) {
	var lib = event.target.lib,
		$calEvent;

	if ( lib ) {
		$calEvent = lib.$events;

		if ( $calEvent ) {
			filterEvents.call( $calEvent, event.year, event.month );

			//TODO: Added for backwards compatibility. Remove in previous versions
			$calEvent.trigger( "wb-updated" + selector );
		}
	}
} );

$document.on( "focusin focusout keydown", ".wb-calevt-cal .cal-days td > a", function( event ) {
	var eventType = event.type,
		$link;

	switch ( eventType ) {
	case "focusin":
		showEvents.call( event.target );
		break;
	case "focusout":
		hideEvents.call( event.target );
		break;
	case "keydown":
		$link = $( event.target );
		if ( ( event.which === 13 || event.which === 32 ) && $link.hasClass( "cal-evt" ) ) {
			$( event.target ).next().find( "a:first" ).trigger( setFocusEvent );
		}
		break;
	}
} );

$document.on( "keydown", ".wb-calevt-cal .cal-days td > ul li", function( event ) {
	var $item = $( event.currentTarget ),
		$toFocus, $itemParent;

	switch ( event.which ) {
	case 38:
		$toFocus = $item.prev().find( "a" );
		if ( $toFocus.length === 0 ) {
			$toFocus = $item.siblings( ":last" ).find( "a" );
		}
		$toFocus.trigger( setFocusEvent );
		break;
	case 40:
		$toFocus = $item.next().find( "a" );
		if ( $toFocus.length === 0 ) {
			$toFocus = $item.siblings( ":first" ).find( "a" );
		}
		$toFocus.trigger( setFocusEvent );
		break;
	case 27:
		$itemParent = $item.closest( "td" ).children( "a" );
		$itemParent.trigger( setFocusEvent );
		break;
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
