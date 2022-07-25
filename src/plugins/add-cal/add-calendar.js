/**
 * @title WET-BOEW Add to calendar
 * @overview Create an add to calendar button for an event
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @ricokola
 */
( function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-addcal",
	selector = ".provisional." + componentName,
	initEvent = "wb-init." + componentName,
	$document = wb.doc,

	/**
	* @method init
	* @param {jQuery Event} event Event that triggered the function call
	*/
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm = $( elm );

		if ( elm ) {

			wb.ready( $( elm ), componentName );

			var properties = elm.querySelectorAll( "[property]" ),
				event_details = new Object(),
				place_details = [],
				i,
				i_len,
				prop_cache,
				googleLink,
				icsFile,
				i18nDict = {
					en: {
						"addcal-addto": "Add to",
						"addcal-calendar": "calendar",
						"addcal-other": "Other (Outlook, Apple, etc.)"
					},
					fr: {
						"addcal-addto": "Ajouter au",
						"addcal-calendar": "calendrier",
						"addcal-other": "Autre (Outlook, Apple, etc.)"
					}
				};

			// Initiate dictionary
			i18nDict = i18nDict[ $( "html" ).attr( "lang" ) || "en" ];
			i18nDict = {
				addto: i18nDict[ "addcal-addto" ],
				calendar: i18nDict[ "addcal-calendar" ],
				ical: i18nDict[ "addcal-other" ]
			};

			// Set date stamp with the date modified
			event_details.dtStamp = dtToISOString( $( "time[property='dateModified']" ) );

			i_len = properties.length;
			for ( i = 0; i < i_len; i++ ) {
				prop_cache = properties[ i ];
				switch ( prop_cache.getAttribute( "property" ) ) {
				case "name":

					// If the property=name is inside an element with typeof=Place defined
					if ( $( prop_cache ).parentsUntil( ( "." + componentName ), "[typeof=Place]" ).length ) {
						event_details.placeName = prop_cache.textContent;
					} else {
						event_details.name = prop_cache.textContent;
					}
					break;
				case "description":
					event_details.description = prop_cache.textContent.replace( /(\r\n|\n|\r)/gm, " " );
					break;
				case "startDate":
					event_details.sDate = dtToISOString( $( "time[property='startDate']", $elm ) );
					break;
				case "endDate":
					event_details.eDate = dtToISOString( $( "time[property='endDate']", $elm ) );
					break;
				case "location":

					// If the location doesn't have typeof defined OR has typeof=VirtualLocation without URL inside.
					if ( !prop_cache.getAttribute( "typeof" ) || ( prop_cache.getAttribute( "typeof" ) === "VirtualLocation" && !$( prop_cache ).find( "[property=url]" ).length ) ) {
						event_details.placeName = prop_cache.textContent;
					}
					break;
				case "streetAddress":
					event_details.placeAddress = prop_cache.textContent;
					break;
				case "addressLocality":
					event_details.placeLocality = prop_cache.textContent;
					break;
				case "addressRegion":
					event_details.placeRegion = prop_cache.textContent;
					break;
				case "postalCode":
					event_details.placePostalCode = prop_cache.textContent;
					break;
				case "url":

					// If the property=url is inside a property=location
					if ( $( prop_cache ).parentsUntil( ( "." + componentName ), "[property=location]" ).length ) {
						event_details.placeName = prop_cache.textContent;
					}
					break;
				}
			}

			place_details.push( ( event_details.placeName || "" ), ( event_details.placeAddress || "" ), ( event_details.placeLocality || "" ), ( event_details.placeRegion || "" ), ( event_details.placePostalCode || "" ) );

			// Error handling
			if ( !event_details.name ) {
				throw componentName + ": Event title is missing.";
			} else if ( !event_details.sDate ) {
				throw componentName + ": Start date is missing.";
			} else if ( !event_details.eDate ) {
				throw componentName + ": End date is missing.";
			}

			// Set Unique Identifier (UID) and Date Stamp (DSTAMP)
			event_details.uid = window.location.href.replace( /\.|-|\/|:|[G-Zg-z]/g, "" ).toUpperCase().substr( -10 ) + "-" + event_details.sDate + "-" + event_details.dtStamp;

			// Set google calendar link
			googleLink = encodeURI( "https://www.google.com/calendar/render?action=TEMPLATE" +  "&text=" + event_details.name +  "&details=" +
			event_details.description +  "&dates=" + event_details.sDate + "/" + event_details.eDate + "&location=" + place_details.join( " " ) );

			// Set ICS file for Outlook, Apple and other calendars
			icsFile = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WET-BOEW//Add to Calendar v4.0//\nBEGIN:VEVENT\nDTSTAMP:" + event_details.dtStamp + "\nSUMMARY:" + event_details.name +  "\nDESCRIPTION:" + event_details.description + "\nUID:" + event_details.uid + "\nDTSTART:" + event_details.sDate + "\nDTEND:" + event_details.eDate + "\nLOCATION:" + place_details.join( " " ) + "\nEND:VEVENT\nEND:VCALENDAR";

			elm.dataset.icsFile = icsFile;

			// Create and add details summary to the wb-addcal event and initiate the unordered list
			$elm.append( "<details class='max-content " + componentName + "-buttons'><summary>" + i18nDict.addto + " " + i18nDict.calendar +
			"</summary><ul class='list-unstyled mrgn-bttm-0'><li><a class='btn btn-link' href='" + googleLink.replace( /'/g, "%27" ) + "' target='_blank' rel='noreferrer noopener'>Google<span class='wb-inv'>" + i18nDict.calendar + "</span></a></li><li><button class='btn btn-link download-ics'>" + i18nDict.ical +
			"<span class='wb-inv'>Calendar</span></button></li></ul></details>" );
		}

		wb.ready( $( elm ), componentName );

	};

// Convert date to ISO string and formating for ICS file
var dtToISOString = function( date ) {
	if ( date.is( "[datetime]" ) ) {
		date = date.attr( "datetime" );
	} else {
		date = date.text();
	}

	return new Date( date ).toISOString().replace( /\..*[0-9]/g, "" ).replace( /-|:|\./g, "" );
};

$document.on( "click", ".download-ics", function( event ) {
	var icsFile = $( event.currentTarget ).parentsUntil( "." + componentName ).parent()[ 0 ];
	icsFile =  $( icsFile ).attr( "data-ics-file" );
	wb.download( new Blob( [ icsFile ], { type: "text/calendar;charset=utf-8" } ), "evenement-gc-event.ics" );
} );

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
