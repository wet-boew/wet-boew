/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Web Accessibility Assessment Methodology
 */
(function( $, document ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-wamethod",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	$checklist = $( selector ),
	$summary = $checklist.find( "#summary" ),
	$summaryTd = $summary.find( "td" ),
	$input = $checklist.find( "input" ),
	rsltA = document.getElementById( "rsltA" ),
	percA =	document.getElementById( "percA" ),
	rsltAA = document.getElementById( "rsltAA" ),
	percAA = document.getElementById( "percAA" ),
	naTotal = document.getElementById( "naTotal" ),
	evalTotal = document.getElementById( "evalTotal" ),
	percEvalTotal = document.getElementById( "percEvalTotal" ),
	rsltTotal = document.getElementById( "rsltTotal" ),
	percTotal = document.getElementById( "percTotal" ),
	percNATotal = document.getElementById( "percNATotal" ),
	rsltAAA = document.getElementById( "rsltAAA" ),
	percAAA = document.getElementById( "percAAA" ),
	aaaIncluded = rsltAAA !== null,
	successCriteriaDivideBy = aaaIncluded ? 0.61 : 0.38,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {

			// Initialize the summary fields
			$input.eq( 0 ).trigger( "change" );

			// Apply WAI-ARIA
			$summaryTd.attr({
				"aria-live": "polite",
				"aria-relevant": "text",
				"aria-atomic": "true",
				"aria-busy": "false"
			});

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Input field event handler
$document.on( "change", selector + " input", function() {
	var aPassed = $input.filter( "[id^='ap']:checked, [id^='an']:checked" ).length,
		aEvaluated = aPassed + $input.filter( "[id^='af']:checked" ).length,
		aaPassed = $input.filter( "[id^='aap']:checked, [id^='aan']:checked" ).length,
		aaEvaluated = aaPassed + $input.filter( "[id^='aaf']:checked" ).length,
		aaaPassed = $input.filter( "[id^='aaap']:checked, [id^='aaan']:checked" ).length,
		aaaEvaluated = aaaPassed + $input.filter( "[id^='aaaf']:checked" ).length,
		naChecked = $input.filter( "[id^='an']:checked, [id^='aan']:checked, [id^='aaan']:checked" ).length;

	// Update number of Success Criteria evaluated and passed
	$summaryTd.attr( "aria-busy", "true" );
	rsltA.innerHTML = aPassed;
	percA.innerHTML = Math.round( aPassed / 0.25 );
	rsltAA.innerHTML = aaPassed;
	percAA.innerHTML = Math.round( aaPassed / 0.13 );
	naTotal.innerHTML = naChecked;
	if ( aaaIncluded ) {
		rsltAAA.innerHTML = aaaPassed;
		percAAA.innerHTML = Math.round( aaaPassed / 0.23 );
	}
	evalTotal.innerHTML = aEvaluated + aaEvaluated + aaaEvaluated;
	percEvalTotal.innerHTML = Math.round( ( aEvaluated + aaEvaluated + aaaEvaluated ) / successCriteriaDivideBy );
	rsltTotal.innerHTML = aPassed + aaPassed + aaaPassed;
	percTotal.innerHTML = Math.round( ( aPassed + aaPassed + aaaPassed ) / successCriteriaDivideBy );
	percNATotal.innerHTML = Math.round( naChecked / successCriteriaDivideBy );
	$summaryTd.attr( "aria-busy", "false" );
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, document );
