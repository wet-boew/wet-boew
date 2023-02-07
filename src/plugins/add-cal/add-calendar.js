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
	selector = "." + componentName,
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

			let properties = elm.querySelectorAll( "[property]" ),
				addcalTarget = elm.dataset.addcalTarget,
				event_details = {},
				place_details = [],
				i18n = wb.i18n,
				addCalBtn,
				googleLink,
				outlookLink,
				yahooLink,
				office365Link,
				icsData;

			// Set date stamp with the date modified
			event_details.dtStamp = new Date().toISOString();

			elm.setAttribute( "typeof", "Event" );

			properties.forEach( function( prop ) {
				switch ( prop.getAttribute( "property" ) ) {
				case "name":

					// If the property=name is inside an element with typeof=Place defined
					if ( $( prop ).parentsUntil( ( "." + componentName ), "[typeof=Place]" ).length ) {
						event_details.placeName = prop.textContent;
					} else {
						event_details.name = prop.textContent;
					}
					break;
				case "description":
					event_details.description = prop.textContent.replace( /(\r\n|\n|\r)/gm, " " );
					break;
				case "startDate":
					event_details.sDate = dtToISOString( elm.querySelector( "time[property='startDate']" ), true );
					event_details.sDateAlt = dtToISOString( elm.querySelector( "time[property='startDate']" ), false );
					break;
				case "endDate":
					event_details.eDate = dtToISOString( elm.querySelector( "time[property='endDate']" ), true );
					event_details.eDateAlt = dtToISOString( elm.querySelector( "time[property='endDate']" ), false );
					break;
				case "location":

					// If the location doesn't have typeof defined OR has typeof=VirtualLocation without URL inside.
					if ( !prop.getAttribute( "typeof" ) || ( prop.getAttribute( "typeof" ) === "VirtualLocation" && !$( prop ).find( "[property=url]" ).length ) ) {
						event_details.placeName = prop.textContent;
					}
					break;
				case "streetAddress":
					event_details.placeAddress = prop.textContent;
					break;
				case "addressLocality":
					event_details.placeLocality = prop.textContent;
					break;
				case "addressRegion":
					event_details.placeRegion = prop.textContent;
					break;
				case "postalCode":
					event_details.placePostalCode = prop.textContent;
					break;
				case "url":

					// If the property=url is inside a property=location
					if ( $( prop ).parentsUntil( ( "." + componentName ), "[property=location]" ).length ) {
						event_details.placeName = prop.textContent;
					}
					break;
				}
			} );

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
			event_details.uid = window.location.href.replace( /\.|-|\/|:|[G-Zg-z]/g, "" ).toUpperCase().slice( 9 ) + "-" + event_details.sDate + "-" + event_details.dtStamp;

			// Set google calendar link
			googleLink = encodeURI( "https://www.google.com/calendar/render?action=TEMPLATE" +  "&text=" + event_details.name +  "&details=" +
			event_details.description +  "&dates=" + event_details.sDate + "/" + event_details.eDate + "&location=" + place_details.join( " " ).trim() );

			// Set Yahoo calendar link
			yahooLink = encodeURI( "https://calendar.yahoo.com/?desc=" + event_details.description + "&et=" + event_details.eDate + "&in_loc=" + place_details.join( " " ).trim() + "&title=" + event_details.name + "&st=" + event_details.sDate + "&v=60" );

			// Set Outlook.com calendar link
			outlookLink = encodeURI( "https://outlook.live.com/calendar/0/deeplink/compose?body=" + event_details.description + "&enddt=" + event_details.eDateAlt + "&location=" + place_details.join( " " ).trim() + "&subject=" + event_details.name + "&startdt=" + event_details.sDateAlt + "&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent" );

			// Set Office 365 calendar link
			office365Link = encodeURI( "https://outlook.office.com/calendar/0/deeplink/compose?body=" + event_details.description + "&enddt=" + event_details.eDateAlt + "&location=" + place_details.join( " " ).trim() + "&subject=" + event_details.name + "&startdt=" + event_details.sDateAlt + "&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent" );

			// Set ICS file for Outlook, Apple and other calendars
			icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WET-BOEW//Add to Calendar v4.0//\nBEGIN:VEVENT\nDTSTAMP:" + event_details.dtStamp + "\nSUMMARY:" + event_details.name +  "\nDESCRIPTION:" + event_details.description + "\nUID:" + event_details.uid + "\nDTSTART:" + event_details.sDate + "\nDTEND:" + event_details.eDate + "\nLOCATION:" + place_details.join( " " ).trim() + "\nEND:VEVENT\nEND:VCALENDAR";

			elm.dataset.ics = icsData;

			// Create Add to calendar dropdown button UI
			addCalBtn = "<div class='dropdown wb-addcal-dd'><button type='button' class='btn btn-primary dropdown-toggle'><span class='glyphicon glyphicon-calendar mrgn-rght-md'></span>" + i18n( "addToCal" ) + "</button><ul class='dropdown-menu'>";
			addCalBtn += "<li><a class='extrnl-lnk' href='" + office365Link.replace( /'/g, "%27" ) + "'><img src='img/office_365_icon.svg' alt='' width='16' class='mrgn-rght-md'>Office 365</a></li>";
			addCalBtn += "<li><a class='extrnl-lnk' href='" + outlookLink.replace( /'/g, "%27" ) + "'><img src='img/outlook_logo.svg' width='16' alt='' class='mrgn-rght-md'>Outlook.com</a></li>";
			addCalBtn += "<li><a class='extrnl-lnk' href='" + googleLink.replace( /'/g, "%27" ) + "'><img src='img/google_calendar_icon.svg' width='16' alt='' class='mrgn-rght-md'>Google</a></li>";
			addCalBtn += "<li><a class='extrnl-lnk' href='" + yahooLink.replace( /'/g, "%27" ) + "'><img src='img/yahoo_icon.svg' width='16' alt='' class='mrgn-rght-md'>Yahoo</a></li>";
			addCalBtn += "<li><button type='button' class='download-ics' data-addcal-id='" + elm.id + "'><span class='glyphicon glyphicon-calendar mrgn-rght-md'></span>iCal</button></li>";
			addCalBtn += "</ul></div>";

			if ( addcalTarget ) {
				$( "#" + addcalTarget ).append( addCalBtn );
			} else {
				$elm.append( addCalBtn );
			}
		}

		wb.ready( $( elm ), componentName );

	};

// Convert date to ISO string. Formatting differently if modify=true
// modify=true example: 20230127T120000Z
// modify=false example: 2023-01-27T12:00:00.000Z
var dtToISOString = function( dateElm, modify ) {
	let date = dateElm.getAttribute( "datetime" );

	if ( modify ) {
		return new Date( date ).toISOString().replace( /\..*[0-9]/g, "" ).replace( /-|:|\./g, "" );
	} else {
		return new Date( date ).toISOString();
	}
};

// Download ICS file
$document.on( "click", ".download-ics", function( event ) {
	let icsData = document.querySelector( "#" + event.target.getAttribute( "data-addcal-id" ) ).dataset.ics;

	wb.download( new Blob( [ icsData ], { type: "text/calendar;charset=utf-8" } ), "evenement-gc-event.ics" );
} );

// Close dropdown when an item is selected
$document.on( "click", ".wb-addcal-btn .list-group-item", function( event ) {
	$( event.target ).closest( ".wb-addcal-dd" ).find( "input[type=checkbox]" ).prop( "checked", false );
} );

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
