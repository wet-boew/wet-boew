/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
(function( $, document, wb ) {
"use strict";

var $document = wb.doc,
	pluginSelector = "#plugin",
	dataList = $( "#issues" );

$document.on( "change", pluginSelector, function( event ) {
	var pluginName = event.target.value;

	$document.trigger({
		type: "ajax-fetch.wb",
		element: this,
		fetch: {
			url: encodeURI("https://api.github.com/repos/wet-boew/wet-boew/issues?labels=Plugin: " + pluginName)
		}
	});
});

$document.on( "ajax-fetched.wb", pluginSelector, function( event ) {
	var issues = event.fetch.response,
		lenIssues = issues.length,
		indIssue, issue;

	dataList.empty();

	dataList.append( "<!--[if lte IE 9]><select><![endif]-->" );

	for ( indIssue = 0; indIssue < lenIssues; indIssue += 1 ) {
		issue = issues[ indIssue ];

		dataList.append( "<option value=\"" + issue.id + "\">" + issue.title + "</option>" );
	}

	dataList.append( "<!--[if lte IE 9]></select><![endif]-->" );
	dataList.trigger( "wb-update.wb-datalist" );
});

})( jQuery, document, wb );
