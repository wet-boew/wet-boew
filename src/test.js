/*global mocha */

// Test harness to run the full suite
mocha.setup( "bdd" );
wb.doc.on( "wb-ready.wb", function() {

	var runner = mocha.run(),
		failedTests = [];

	runner.on( "end", function() {
		window.mochaResults = runner.stats;
		window.mochaResults.reports = failedTests;
	} );

	runner.on( "fail", logFailure );

	function logFailure( test, err ) {

		var flattenTitles = function( test ) {
			var titles = [];
			while ( test.parent.title ) {
				titles.push( test.parent.title );
				test = test.parent;
			}
			return titles.reverse();
		};

		failedTests.push( {
			name: test.title,
			result: false,
			message: err.message,
			stack: err.message + "\n" + err.stack || "",
			titles: flattenTitles( test )
		} );
	}
} );
