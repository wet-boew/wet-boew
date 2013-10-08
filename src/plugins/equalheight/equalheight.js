/*
 * @title WET-BOEW Responsive equal height
 * @overview Sets the same height for all elements in a container that are rendered on the same baseline (row). Adapted from http://codepen.io/micahgodbolt/pen/FgqLc.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
(function ( $, window, vapour ) {
	"use strict";

	/* 
	 * Variable and function definitions. 
	 * These are global to the plugin - meaning that they will be initialized once per page,
	 * not once per instance of plugin on the page. So, this is a good place to define
	 * variables that are common to all instances of the plugin on a page.
	 */
	var selector = ".wb-equalheight",
		$document = vapour.doc,

		init = function () {

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			onResize();
		},

		// Re-equalise any time the window/document or a child element of 'selector' is resized.
		onResize = function () {
			var $elm = $( selector ),
				$children = $elm.children(),
				row = [ ],
				rowTop = -1,
				currentChild,
				currentChildTop = -1,
				currentChildHeight = -1,
				tallestHeight = -1,
				i;

			for ( i = $children.length - 1; i >= 0; i-- ) {
				currentChild = $children[ i ];

				// Ensure all children that are on the same baseline have the same 'top' value.
				currentChild.style.verticalAlign = "top";

				currentChildTop = currentChild.offsetTop;
				currentChildHeight = currentChild.offsetHeight;

				if ( currentChildTop !== rowTop ) {
					setRowHeight( row, tallestHeight );

					rowTop = currentChildTop;
					tallestHeight = currentChildHeight;
				} else {
					tallestHeight = (currentChildHeight > tallestHeight) ? currentChildHeight : tallestHeight;
				}

				row.push( currentChild );
			}

			if ( row.length !== 0 ) {
				setRowHeight( row, tallestHeight );
			}
		},

		setRowHeight = function ( row, height ) {
			for ( var i = row.length - 1; i >= 0; i-- ) {
				row[ i ].style.height = height + "px";
			}
			row.length = 0;
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, init );

	// Handle text and window resizing
	$document.on( "text-resize.wb window-resize-width.wb window-resize-height.wb", onResize );

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );

} )( jQuery, window, vapour );
