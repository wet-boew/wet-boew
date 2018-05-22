/* This jQuery summariser counts the chosen radio buttons,
 * posts statistics inside the summary table,
 * and is easier to customise.
 * There is no value hard-coded inside the html file it manipulates
 * and variables are as self-explanatory as possible.
 * Created in May 2018
 * by Armagan Tekdoner
 * grifare.net
 */

$( document ).ready( function() {

	// total criteria counts posted before testing begins
	var rsltACount = $( "input[id^='a']" ).length / 3;
	$( "#rsltACount" ).text( rsltACount );
	var rsltBCount = $( "input[id^='b']" ).length / 3;
	$( "#rsltBCount" ).text( rsltBCount );
	var rsltCCount = $( "input[id^='c']" ).length / 3;
	$( "#rsltCCount" ).text( rsltCCount );
	var rsltDCount = $( "input[id^='d']" ).length / 3;
	$( "#rsltDCount" ).text( rsltDCount );
	var rsltECount = $( "input[id^='e']" ).length / 3;
	$( "#rsltECount" ).text( rsltECount );
	var totalItems = $( "legend" ).length;
	$( ".totalItems" ).text( totalItems );

	// reassigns values on each radio button select event
	$( "input[type=radio]" ).change( function() {

	// variables to store number of clicks
		var zoomVoiceDisabledPassed = $( "input[id^='ap']:checked, [id^='an']:checked" ).length,
			voiceEnabledPassed = $( "input[id^='bp']:checked, [id^='bn']:checked" ).length,
			zoomEnabledPassed = $( "input[id^='cp']:checked, [id^='cn']:checked" ).length,
			zoomVoiceEnabledPassed = $( "input[id^='dp']:checked, [id^='dn']:checked" ).length,
			inverseColoursPassed = $( "input[id^='ep']:checked, [id^='en']:checked" ).length,
			itemsPassed = $( "input[id*='p']:checked, [id*='n']:checked" ).length,
			itemsEvaluated = $( "input:checked" ).length,
			itemsNotApplicable = $( "input[id*='n']:checked" ).length,
			percA = zoomVoiceDisabledPassed / rsltACount * 100,
			percB = voiceEnabledPassed / rsltBCount * 100,
			percC = zoomEnabledPassed / rsltCCount * 100,
			percD = zoomVoiceEnabledPassed / rsltDCount * 100,
			percE = inverseColoursPassed / rsltECount * 100,
			percPassed = itemsPassed / totalItems * 100,
			percEval = itemsEvaluated / totalItems * 100,
			percNA = itemsNotApplicable / totalItems * 100;

		// values posted to their respective elements
		$( "#rsltA" ).text( zoomVoiceDisabledPassed );
		$( "#percA" ).text( Math.round( percA ) );
		$( "#rsltB" ).text( voiceEnabledPassed );
		$( "#percB" ).text( Math.round( percB ) );
		$( "#rsltC" ).text( zoomEnabledPassed );
		$( "#percC" ).text( Math.round( percC ) );
		$( "#rsltD" ).text( zoomVoiceEnabledPassed );
		$( "#percD" ).text( Math.round( percD ) );
		$( "#rsltE" ).text( inverseColoursPassed );
		$( "#percE" ).text( Math.round( percE ) );
		$( "#itemsPassed" ).text( itemsPassed );
		$( "#percPassed" ).text( Math.round( percPassed ) );
		$( "#itemsEvaluated" ).text( itemsEvaluated );
		$( "#percEval" ).text( Math.round( percEval ) );
		$( "#itemsNotApplicable" ).text( itemsNotApplicable );
		$( "#percNA" ).text( Math.round( percNA ) );
	} );// close on change function

} );// close doc dot ready
