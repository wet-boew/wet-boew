/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	pluginSelector = "#plugin",
	issueInput = $( "#issue" );

$document.on( "change", pluginSelector, function( event ) {
	var componentName = event.target.value;

	$( this ).trigger( {
		type: "ajax-fetch.wb",
		fetch: {
			url: encodeURI( "https://api.github.com/repos/wet-boew/wet-boew/issues?labels=Feature: " + componentName ),
			dataType: wb.ielt10 ? "jsonp" : "json",
			jsonp: wb.ielt10 ? "callback" : null
		}
	} );

	issueInput.get( 0 ).value = "";
} );

$document.on( "ajax-fetched.wb", pluginSelector, function( event ) {
	var dataList = $( "#" + issueInput.attr( "list" ) ),
		issues = wb.ielt10 ? event.fetch.response.data : event.fetch.response,
		lenIssues = issues.length,
		options = "",
		indIssue, issue;

	dataList.empty();

	for ( indIssue = 0; indIssue !== lenIssues; indIssue += 1 ) {
		issue = issues[ indIssue ];

		options += "<option label=\"" + issue.title + "\" value=\"" + issue.title + "\"></option>";
	}

	if ( wb.ielt10 ) {
		options = "<select>" + options + "</select>";
	}

	dataList.append( options );

	issueInput.trigger( "wb-update.wb-datalist" );
} );

} )( jQuery, wb );
