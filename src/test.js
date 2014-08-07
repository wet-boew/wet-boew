/*global mocha */

// Test harness to run the full suite
mocha.setup( "bdd" );
wb.doc.on( "ready", function() {

	var runner = mocha.run(),
		tests = [];

	runner.on( "end", function() {
		window.global_test_results = {
			passed: runner.stats.passes,
			failed: runner.stats.failures,
			total: runner.stats.tests,
			duration: runner.stats.duration,
			tests: tests
		};
	});

	runner.on( "pass", function( test ) {
		tests.push({
			name: test.fullTitle(),
			result: true,
			duration: test.duration
		});
	});

	runner.on( "fail", function( test, err ) {
		tests.push({
			name: test.fullTitle(),
			result: false,
			duration: test.duration,
			message: err.stack
		});
	});
});
