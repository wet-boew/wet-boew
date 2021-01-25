/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * @title Test runner
 * @overview Test runner through puppeteer and chromium headless with mocha
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */

console.log( "Running unit testing" );

// Test runner setting
const baseFolder = "dist";
const webServerPort = 8000;
const webPageUrlToTest = "http://localhost:8000/unmin/test/test.html?txthl=just%20some%7Ctest";

// Import/required
const puppeteer = require( "puppeteer" );
const connect = require('connect');
const path = require('path');
const connectServer = connect();
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const basePath = path.resolve( baseFolder );

// Start the web server
connectServer.use( serveStatic( basePath ) );
connectServer.use( serveIndex( basePath ) );
webServer = connectServer.listen( webServerPort );
console.log( "Web server started" );

// Sleep utility function
function sleep( ms ) {
	ms = ms || 1000;
	return new Promise( resolve => setTimeout( resolve, ms) );
}

// Run the test into the headless chromiumn browser
puppeteer.launch( {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		],
		slowMo: 50
	} ).then( async browser => {

	// Wait a little to help concurent test
    await sleep( 1000 );

	console.log( "Puppeteer chrominium started, navigating to:\n" + webPageUrlToTest );
	const page = await browser.newPage();

	page.on( 'console', msg => {
		console.log( "LOG" );
		console.log( msg );
	} );
	page.on( 'pageerror', msg => {
		console.log( "ERR" );
		console.log( msg );
	} );

	await page.goto( webPageUrlToTest, { waitUntil: "domcontentloaded" } );

	// Wait for the result
	console.log( "Waiting for test completion" );
	const limit = 60;
	let counter = 0,
		mocha;
	while ( limit !== counter ) {

		await counter++;

		mocha = await page.evaluate( () => {

			// Get the test result from the global variable and use the mocha div container to test if the test are running or not
			return window.mochaResults || { body: document.getElementById( "mocha" ).innerHTML.trim() };
		} );

		if ( !mocha || !mocha.reports ) {
			console.log( "wait..." + counter );

			if ( mocha.body ) {
				console.log( "Test ongoing" );
			} else {
				console.log( "Nothing happening currently" );

				// Reload the page if nothing happen
				if ( !( counter % 3 ) ) {
					console.log( "Reload the page ... " + counter );
					await page.reload( { waitUntil: "domcontentloaded", timeout: 60000 } );
				}
			}

			await sleep( 1000 );
			console.log( "++++++++++++++++++++++++++++++++++++\n" );
		} else {
			break;
		}

	}
	if ( !mocha || !mocha.reports ) {
		console.log( "Error - Timeout or unable to retrieve the mocha test results" );
		console.log( mocha );
		process.exit( 1 );
	}

	// Close the browser and webserver
	await browser.close();
	await webServer.close( () => { console.log( "Web server terminated" ); } );

	// Print the stats
	console.log( "\n=== Test results ===\n" );
	console.log( "Test suites: " + mocha.suites );
	console.log( "Number of tests: " + mocha.tests );
	console.log( "Passes: " + mocha.passes );
	console.log( "Failures: " + mocha.failures );
	console.log( "Duration: " + mocha.duration + " ms" );
	console.log( "===\n" );

	// Print test error details if any
	mocha.reports.forEach( function( details ) {
		console.log( details.titles[ 0 ] );
		console.log( " -> " + details.name );
		console.log( " -> Error message: " + details.message + "\n" );
	} );

	// Test result summary
	if ( !mocha.reports.length ) {
		console.log( "Test PASS\n" );
	} else {
		console.log( "\n*******\nTest FAIL !!!!!\n*******\n" );
	}

	// Exit
	process.exit( mocha.reports.length );
} );
	