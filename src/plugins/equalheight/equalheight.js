/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * Plugin	: Responsive equal height
 * Author	: @thomasgohard
 * Notes	: Sets the same height for all elements in a container that are
 * 			  rendered on the same baseline (row).
 * 			  Adapted from http://codepen.io/micahgodbolt/pen/FgqLc.
 * Licence	: wet-boew.github.io/wet-boew/License-en.html /
 * 			  wet-boew.github.io/wet-boew/Licence-fr.html
 */

(function ( $, window, vapour ) {
	"use strict";

	var selector = ".wb-equalheight",
		$document = vapour.doc,
		plugin = {
			init: function ( $elm ) {
				// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
				window._timer.remove( selector );

				plugin.onResize( $elm );
			},

			// Re-equalise any time the window/document or a child element of 'selector' is resized.
			onResize: function ( $elm ) {
				var $children = $elm.children(),
					row = [],
					rowTop = -1,
					currentChild,
					currentChildTop = -1,
					currentChildHeight = -1,
					tallestHeight = -1,
					i;

				for ( i = $children.length - 1; i >= 0; i-- ) {
					currentChild = $children[i];
					// Ensure all children that are on the same baseline have the same 'top' value.
					currentChild.style.verticalAlign = "top";

					currentChildTop = currentChild.offsetTop;
					currentChildHeight = currentChild.offsetHeight;

					if ( currentChildTop !== rowTop ) {
						plugin.setRowHeight( row, tallestHeight );

						rowTop = currentChildTop;
						tallestHeight = currentChildHeight;
					} else {
						tallestHeight = (currentChildHeight > tallestHeight) ? currentChildHeight : tallestHeight;
					}

					row.push(currentChild);
				}

				if ( row.length !== 0 ) {
					plugin.setRowHeight( row, tallestHeight );
				}
			},

			setRowHeight: function ( row, height ) {
				for ( var i = row.length - 1; i >= 0; i-- ) {
					row[i].style.height = height + "px";
				}
				row.length = 0;
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function () {
		// "this" is cached for all events to utilize
		var $elm = $( this );

		plugin.init.apply( this, [ $elm ] );

		// since we are working with events we want to ensure that we are being passive about our control, so returning true allows for events to always continue
		return true;
	});

	$document.on( "text-resize.wb window-resize-width.wb window-resize-height.wb", function () {
		// "this" is cached for all events to utilize
		var $elm = $( this );

		plugin.onResize.apply( this, [ $elm ] );

		// since we are working with events we want to ensure that we are being passive about our control, so returning true allows for events to always continue
		return true;
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, vapour );