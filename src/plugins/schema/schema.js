/**
* @title WET-BOEW Schema Plugin
* @overview Automatically add links to telephone numbers in a Web page on a extra small screen (mobile phones).
* @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
* @author @atamsingh
*/

/**********************************************************************************
*	 						WET 4.0 Schema Plugin
*						   ```````````````````````
*	The plugin aims to give an easy way to create Schema compatible
*	@authour - Atamjeet Singh (atamjeet.singh2@canada.ca)
**********************************************************************************/


( function( $, window, document, wb ) {
	"use strict";


	var componentName = "wb-telLink",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,

	/**
	* @method init
	* @param {jQuery Event} event Event that triggered the function call
	*/
	init = function( event ) {
		findSchema();
		wb.ready( $( elm ), componentName );

	};
//	Schema Maker
// ``````````````
function findSchema(){
	var counter = 0;
	$(".schema").each(function(){
		if($(this).hasClass("sc-event")){
			//console.log("found event");
			eventTODO($(this),counter);
			counter++;
		}
	});
}
function addRDFaToElem(elem, thisEvent){
	var toReturn = '';
	if ($(elem).hasClass("schema")){
		$(elem).attr("vocab","http://schema.org/");
	}
	if($(elem).hasClass("sc-event")){
		$(elem).attr("typeof","Event");
	}

	if($(elem).find(".name")){
		$(elem).find(".name").first().attr("property","name");
	}

	if($(elem).find(".name a")){
		$(elem).find(".name a").first().attr("property","url");
	}

	if($(elem).find("img")){
		$(elem).find("img").first().attr("property","image");
	}

	if($(elem).find(".start")){
		$(elem).find(".start").first().attr("property","startDate");

		toReturn =  ('0' + thisEvent.sy.toString()).slice(-4);
		toReturn += '-';
		toReturn += ('0' + thisEvent.smon.toString()).slice(-2);
		toReturn += '-';
		toReturn += ('0' + thisEvent.sd.toString()).slice(-2);
		toReturn += 'T';
		toReturn += printdate(thisEvent.sh, thisEvent.smin, thisEvent.sp);
		toReturn += ':00Z';

		$(elem).find(".start").first().attr("content",toReturn);
	}

	if($(elem).find(".end")){
		$(elem).find(".end").first().attr("property","endDate");

		toReturn = ('0' + thisEvent.ey.toString()).slice(-4);
		toReturn += '-';
		toReturn += ('0' + thisEvent.emon.toString()).slice(-2);
		toReturn += '-';
		toReturn += ('0' + thisEvent.ed.toString()).slice(-2);
		toReturn += 'T';
		toReturn += printdate(thisEvent.eh, thisEvent.emin, thisEvent.ep);
		toReturn += ':00Z';

		$(elem).find(".end").first().attr("content",toReturn);
	}

	if($(elem).find(".location")){
		$(elem).find(".location").first().attr("property","location");
		$(elem).find(".location").first().attr("typeof","Place");

		toReturn = '<span property="name">'+thisEvent.eln+'</span>,';
		if(thisEvent.ela || thisEvent.ell || thisEvent.elr || thisEvent.elc || thisEvent.elpos){
			toReturn += '<span property="address" typeof="PostalAddress">';
			if(thisEvent.ela){toReturn 		+= ' <span property="streetAddress">'+thisEvent.ela+'</span>,';}
			if(thisEvent.ell){toReturn 		+= ' <span property="addressLocality">'+thisEvent.ell+'</span>,';}
			if(thisEvent.elr){toReturn 		+= ' <span property="addressRegion">'+thisEvent.elr+'</span>,';}
			if(thisEvent.elc){toReturn 		+= ' <span property="addressCountry">'+thisEvent.elc+'</span>,';}
			if(thisEvent.elpos){toReturn 	+= ' <span property="postalcode">'+thisEvent.elpos+'</span>';}
			toReturn += '</span>';
		}

		$(elem).find(".location").first().html(toReturn);
	}
}
// EVENT
// Name, URL,
function makeEvent(eventElem, counter){
	// Other - Required
	var name 			= $(eventElem).find(".name").first().text();
	var url 			= $(eventElem).find(".name a").first().attr('href');

	// Start Info - Required
	var startDate 		= $(eventElem).find(".start .date").first().text();
	var startDateSplit  = startDate.split("-");
	var startDay 		= startDateSplit[0].trim();
	var startMonth 		= startDateSplit[1].trim();
	var startYear 		= startDateSplit[2].trim();
	var startTime 		= $(eventElem).find(".start .time").first().html();
	var startTimeSplit  = startTime.split(":");
	var startHour 		= startTimeSplit[0];
	var startMinute 	= startTimeSplit[1].split(" ")[0];
	var startAMPM 		= startTimeSplit[1].split(" ")[1];

	//Optional
	var synopsis 		= $(eventElem).find(".synopsis").first().html();
	var image 			= $(eventElem).find("img").first().attr("src");
	var imageAlt 		= $(eventElem).find("img").first().attr("alt");

	// End Info -Optional + Recommended
	var endDate 		= $(eventElem).find(".end .date").first().html();
	var endDateSplit 	= endDate.split("-");
	var endDay 			= endDateSplit[0].trim();
	var endMonth 		= endDateSplit[1].trim();
	var endYear 		= endDateSplit[2].trim();
	var endTime 		= $(eventElem).find(".end .time").first().html();
	var endTimeSplit  	= endTime.split(":");
	var endHour 		= endTimeSplit[0];
	var endMinute 		= endTimeSplit[1].split(" ")[0];
	var endAMPM 		= endTimeSplit[1].split(" ")[1];



	// Location Info - Required
	var locFormat 		= $(eventElem).find(".location").first().attr('data-wb-share').split(",");
	var locInfo 		= $(eventElem).find(".location").first().text().split(",");

	var locName,locCity,locAddress,locProvince,locCountry,locPostal;
	for (var i = 0; i < locFormat.length; i++) {
		if (locFormat[i].trim().toLowerCase() === "name"){
			 locName 	= locInfo[i].trim();
		}else if (locFormat[i].trim().toLowerCase() === "street"){
			 locAddress 	= locInfo[i].trim();
		}else if (locFormat[i].trim().toLowerCase() === "city"){
			 locCity 	= locInfo[i].trim();
		}else if (locFormat[i].trim().toLowerCase() === "province"){
			 locProvince	= locInfo[i].trim();
		}else if (locFormat[i].trim().toLowerCase() === "country"){
			 locCountry 	= locInfo[i].trim();
		}else if (locFormat[i].trim().toLowerCase() === "postal"){
			 locPostal 	= locInfo[i].trim();
		}
	}

	// Buttons - Optional
	var registerButton 	= $(eventElem).find(".register").first().attr('href');
	var calendarButton 	= $(eventElem).find(".addToCalendar").first().attr('href');

	if(name, url, startMonth, startDay, startYear, startHour, startMinute, startAMPM, locName){
		// Create JSON
		var eventCurrent 	= makeEventArray(name,url,synopsis,startMonth,startDay,startYear,startHour,startMinute,startAMPM,endMonth,endDay,endYear,endHour,endMinute,endAMPM,locName,locAddress,locCity,locProvince,locCountry,locPostal,counter,synopsis,image,imageAlt,registerButton,calendarButton);

		return eventCurrent;
	}

	return;
}
/*DONE
	// CallParams(
	// name, url, synposisIF, labelIF,
	// startMon, startDay, startYear,startHour, startMin, startAMorPM,
	// [SAMEforEnd],
	// loc-Name, loc-Address, loc-Locality, loc-Region, loc-Country, loc-PostalCode)*/
function makeEventArray(eventName, eventURL, eventSynopsis, eventStartMonth, eventStartDay, eventStartYear, eventStartHour, eventStartMinute, eventStartAMPM, eventEndMonth, eventEndDay,eventEndYear, eventEndHour, eventEndMinute,eventEndAMPM,eventLocationName,eventLocationAddress, eventLocationLocality, eventLocationRegion, eventLocationCountry, eventLocationPostal,eventCount,synopsis,image,imageAlt,register,shareButton,calendarButton) {
	var eventToReturn = {
	n: eventName,
	url: eventURL,
	syn: eventSynopsis,
	smon: eventStartMonth,
	sd: eventStartDay,
	sy: eventStartYear,
	sh: eventStartHour,
	smin: eventStartMinute,
	sp: eventStartAMPM,
	emon: eventEndMonth,
	ed: eventEndDay,
	ey: eventEndYear,
	eh: eventEndHour,
	emin: eventEndMinute,
	ep: eventEndAMPM,
	eln: eventLocationName,
	ela: eventLocationAddress,
	ell: eventLocationLocality,
	elr: eventLocationRegion,
	elc: eventLocationCountry,
	elpos: eventLocationPostal,
	count: eventCount,
	img: image,
	imgAlt: imageAlt,
	regis: register,
	cal: calendarButton
	};

	return eventToReturn;
}
//DONE
function makeEventJSON(thisEvent){
	var toReturn = '{"@context":"http:\/\/schema.org",';
	toReturn += '"@type": "Event",';
	toReturn += '"name": "'+thisEvent.n+'",';
	toReturn += '"startDate" : "';
	toReturn += ('0' + thisEvent.sy.toString()).slice(-4);
	toReturn += '-';
	toReturn += ('0' + thisEvent.smon.toString()).slice(-2);
	toReturn += '-';
	toReturn += ('0' + thisEvent.sd.toString()).slice(-2);
	toReturn += 'T';
	toReturn += printdate(thisEvent.sh, thisEvent.smin, thisEvent.sp);
	toReturn += ':00Z",';
	if(thisEvent.ey){
		toReturn += '"endDate" : "';
		toReturn += ('0' + thisEvent.ey.toString()).slice(-4);
		toReturn += '-';
		toReturn += ('0' + thisEvent.emon.toString()).slice(-2);
		toReturn += '-';
		toReturn += ('0' + thisEvent.ed.toString()).slice(-2);
		toReturn += 'T';
		toReturn += printdate(thisEvent.eh, thisEvent.emin, thisEvent.ep);
		toReturn += ':00Z",';
	}
	toReturn += '"url" : "'+thisEvent.url+'",';
	toReturn += '"image" : "'+thisEvent.img+'",';
	toReturn += '"location" : {"@type" : "Place",';
	toReturn += '"name" : "'+thisEvent.eln+'",';
	if(thisEvent.ela || thisEvent.ell || thisEvent.elr || thisEvent.elc || thisEvent.elpos){
		toReturn += '"address" : {"@type" : "PostalAddress",';
		if(thisEvent.ela){toReturn += '"streetAddress" : "'+thisEvent.ela+'",';}
		if(thisEvent.ell){toReturn += '"addressLocality" : "'+thisEvent.ell+'",';}
		if(thisEvent.elr){toReturn += '"addressRegion" : "'+thisEvent.elr+'",';}
		if(thisEvent.elc){toReturn += '"addressCountry" : "'+thisEvent.elc+'",';}
		if(thisEvent.elpos){toReturn += '"postalCode" : "'+thisEvent.elpos+'"';}
		toReturn += '}';
	}
	toReturn += '}}';

	return toReturn;
}
/*
*	 Helper Functions
* ```````````````````
*/

function eventTODO(elem, counter){
	// Make Event Array
	var eventArray = makeEvent(elem,counter);
	if(eventArray){
		// Make JSON from event Array
		var jsonLDToReturn 	= makeEventJSON(eventArray);

		// Inject JSON into header
		injectLD(jsonLDToReturn);

		// Add RDFa Syntax to Event
		addRDFaToElem(elem,eventArray);
		// Create new RDFa compatible HTML for
		//var printEventHTML = printEvent(eventArray);
		//replaceHTML(elem,printEventHTML);
	}
}
function injectLD(schemaLD){
	var scriptTag = document.createElement('script');
	scriptTag.setAttribute('type','application/ld+json');
	scriptTag.text = schemaLD;
	document.head.appendChild(scriptTag);
}

function printdate(hour, m, ampm){
	//console.log("printdate: " + hour + " " + m + " " + ampm);
	if(ampm.trim().toLowerCase() === "pm"){
		hour = parseInt(hour,10) + 12;
	}

	var toReturn = ('0' + hour.toString()).slice(-2);
	toReturn += ':';
	toReturn += ('0' + m.toString()).slice(-2);

	//console.log("		" + toReturn);
	return toReturn;
}
/*
	function replaceHTML(elem,htmlSyntax){
		$(elem).removeClass("schema").html(htmlSyntax);
		return;
	}
	function getDetails(x) {
		var className = "."+x;
		var eventDet = $(".events").find(className).find('.eventDetails:first');//console.log(eventDet.html());
		var url = $(".events").find(className).find('a:first').attr('href');//console.log(url);

		if(eventDet.html() == "..."){
			$.get( url, function( data ) {
				$(data).find("*").each(function() {
					if($(this).attr("property") == "mainContentOfPage")
					{
						$( eventDet ).html( $(this).html());
					}
				});
			});
		}
	}

	function printEvent(thisEvent){
		var answer = '<span class="row" typeof="Event" vocab="http://schema.org/"><section><header class="panel-heading"><div class="row"><!-- IMAGE --><div class="col-lg-3">';

		if(thisEvent.img){
			answer += '<img src="'+thisEvent.img+'" alt="'+thisEvent.imageAlt+'" class="img-responsive" style="max-height: 10em; width: auto;">';
		}else{
			// thisEvent.img = Google API Call
			answer += '<img src="'+thisEvent.img+'" alt="This is a google image." class="img-responsive" style="max-height: 10em; width: auto;">';
		}
		answer += 	'</div><!-- DETAILS --><div class="col-lg-9"><div class="row"><h2 class="panel-title" property="name"><a property="url" href="'+thisEvent.url+'">'+thisEvent.n+'</a></h2></div><div class="row"><div class="col-lg-6"><span class="completeDate" property="startDate" content="'+('0' + thisEvent.sy.toString()).slice(-2)+'-'+('0' + thisEvent.smon.toString()).slice(-2)+'-'+('0' + thisEvent.sd.toString()).slice(-2)+'T'+printdate(thisEvent.sh, thisEvent.smin, thisEvent.sp)+'"></span><p><span>Start Date: </span><span class="monthNum">'+('0' + thisEvent.smon.toString()).slice(-2)+'</span><span>-</span><span class="dateNum">'+('0' + thisEvent.sd.toString()).slice(-2)+'</span><span>-</span><span class="yearNum">'+('0' + thisEvent.sy.toString()).slice(-2)+'</span><span> at </span><span class="hourNum">'+('0' + thisEvent.sh.toString()).slice(-2)+'</span><span>:</span><span class="minuteNum">'+('0' + thisEvent.smin.toString()).slice(-2)+'</span><span class="ampm"> '+thisEvent.sp+'</span></p></div>';

		if(thisEvent.ey){
			answer += '<div class="col-lg-6"><span class="completeDate col-md-6" property="endDate" content="'+thisEvent.ey+'-'+thisEvent.emon+'-'+thisEvent.ed+'T'+printdate(thisEvent.eh, thisEvent.emin, thisEvent.ep)+'"></span><p><span>End Date: </span><span class="monthNum">'+('0' + thisEvent.emon.toString()).slice(-2)+'</span><span>-</span><span class="dateNum">'+('0' + thisEvent.ed.toString()).slice(-2)+'</span><span>-</span><span class="yearNum">'+('0' + thisEvent.ey.toString()).slice(-2)+'</span><span> at </span><span class="hourNum">'+('0' + thisEvent.eh.toString()).slice(-2)+'</span><span>:</span><span class="minuteNum">'+('0' + thisEvent.emin.toString()).slice(-2)+'</span><span class="ampm"> '+thisEvent.ep+'</span></p></div>';
		}
		answer += '</div></div></div></header>';

		answer += '<div class="panel-body">';
		if(thisEvent.syn){
			answer += '<div class="row"><!-- Details --><p>'+thisEvent.syn+'</p></div>';
		}
		answer += '<div class="row"><div class="col-lg-8"><div class="row">';

		answer += '<div class="col-md-6">';
		if(thisEvent.regis){
			answer += '<a class="btn btn-block btn-success pull-right" type="button"href="'+thisEvent.regis+'">Register</a>';
		}
		answer += '</div>';
		answer += '<div class="col-md-6">';
		if(thisEvent.cal){
			answer += '<a class="btn btn-block btn-success pull-right" type="button"href="#">ICS FILE - NA</a>';
		}
		answer += '</div></div></div><div class="col-lg-4"><!--Share button--><a class="wb-share btn btn-block btn-default pull-right" data-wb-share=\'{"pnlId": "pnl'+thisEvent.count+'","url": "'+thisEvent.url+'"}\'></a></div></div></div></section></span>';

		return answer;
	}
*/
// findSchema()

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );





//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

( function( $, window, document, wb ) {
	"use strict";



	var componentName = "wb-telLink",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,

	/**
	* @method init
	* @param {jQuery Event} event Event that triggered the function call
	*/
	init = function( event ) {
		if( screen.width < 650 ) {
			var regex = /(|\()(\d{3}).{0,2}(\d{3}).{0,1}(\d{4})(?!([^<]*>)|(((?!<a).)*<\/a>))/g;
			var text = $( "main" ).html();

			text = text.replace( regex, "<a href=\"tel:$&\">$&</a>" );
			//console.log(text);
			$( "main" ).html( text );
		}
		wb.ready( $( elm ), componentName );

	};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb " + initEvent, selector, init );

	// Add the timer poke to initialize the plugin
	wb.add( selector );

} )( jQuery, window, document, wb );
