/**
 * @title WET-BOEW Set background image
 * @overview Apply a background image or detects the change in screen width and replace the background image accordingly
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @namjohn920, @duboisp
 */
( function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,
	$window = wb.win,
	componentName = "wb-bgimg",
	selector = "[data-bgimg-srcset], [data-bgimg]",
	bgViews = {},
	ids = [],

	init = function( event ) {

		var elm, elmId,
			bgImg, bgimgSrcset, bgRawViews,
			i, i_len, i_views,
			imgSrc, imgSize;

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		elm = wb.init( event, componentName, selector );

		if ( elm ) {

			// Ensure the feature have an ID.
			if ( !elm.id ) {
				elm.id = wb.getId();
			}
			elmId = elm.id;

			// Apply default background image
			bgImg = elm.dataset.bgimg;
			if ( bgImg ) {
				elm.style.backgroundImage = "url(" + bgImg + ")";
			}

			// Apply background image set if defined
			bgimgSrcset = elm.dataset.bgimgSrcset;
			if ( bgimgSrcset ) {
				ids.push( elm.id );
				bgRawViews = elm.dataset.bgimgSrcset.split( "," );
				i_len = bgRawViews.length;
				bgViews[ elmId ] = [];

				for ( i = 0; i < i_len; i++ ) {
					i_views = bgRawViews[ i ].trim().split( " " );

					imgSrc = i_views[ 0 ];
					imgSize =  i_views[ i_views.length - 1 ];

					imgSize = parseInt( imgSize.substring( 0, imgSize.length - 1 ) );
					bgViews[ elmId ].push( [ imgSrc, imgSize ] );
				}

				bgViews[ elmId ].sort(
					function( a, b ) {
						return a[ 1 ] > b[ 1 ] ? 1 : -1;
					}
				);

				selectImage();

				// Add the resize listener
				$window.on( "resize", selectImage );
			}

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName );
		}
	},

	selectImage = function() {
		var screenWidth = window.innerWidth,
			optimizedLink = {},
			i, i_len = ids.length, j,
			optimizedSize, currentId, currentId_len,
			currentInput,
			link, elm;

		for ( i = 0; i < i_len; i++ ) {
			optimizedSize = Infinity;
			currentId = bgViews[ ids[ i ] ];
			currentId_len = currentId.length;

			for ( j = 0; j < currentId_len; j++ ) {
				currentInput = currentId[ j ];
				if ( currentInput[ 1 ] >= screenWidth ) {
					if ( optimizedSize > currentInput[ 1 ] ) {
						optimizedSize = currentInput[ 1 ];
						optimizedLink[ ids[ i ] ] = currentInput[ 0 ];
					}
				}
			}
			if ( optimizedSize === Infinity ) {
				optimizedLink[ ids[ i ] ] = currentId[ currentId_len - 1 ][ 0 ];
			}
		}

		for ( link in optimizedLink ) {
			elm = document.getElementById( link );
			elm.style.backgroundImage = "url(" + optimizedLink[ link ] + ")";
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb wb-init." + componentName, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
