/**
 * @title WET-BOEW Responsive equal height
 * @overview Sets the same height for all elements in a container that are rendered on the same baseline (row). Adapted from http://codepen.io/micahgodbolt/pen/FgqLc.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-equalheight",
	$document = wb.doc,

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Filter out any events triggered by descendants
		if ( event.currentTarget === event.target ) {

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			wb.remove( selector );

			// Remove the event handler since only want init fired once per page (not per element)
			$document.off( "timerpoke.wb", selector );

			onResize();
		}
	},

	/**
	 * Re-equalise any time the window/document or a child element of 'selector' is resized.
	 * @method onResize
	 */
	onResize = function() {
		var $elm = $( selector ),
			$children = $elm.children(),
			row = [ ],
			rowTop = -1,
			currentChild,
			currentChildTop = -1,
			currentChildHeight = -1,
			tallestHeight = -1,
			i;

		if ( $elm.data( "imagecheck" ) && $elm.length !== 0 && !areImagesLoaded( $elm[ 0 ] ) ) {
			window._timer.add( selector );

			return;
		}

		for ( i = $children.length - 1; i >= 0; i-- ) {
			currentChild = $children[ i ];

			// Ensure all children that are on the same baseline have the same 'top' value.
			currentChild.style.verticalAlign = "top";

			// Remove any previously set min height
			currentChild.style.minHeight = 0;

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

	/**
	 * @method setRowHeight
	 * @param {array} row The rows to be updated
	 * @param {integer} height The new row height
	 */
	setRowHeight = function( row, height ) {
		for ( var i = row.length - 1; i >= 0; i-- ) {
			row[ i ].style.minHeight = height + "px";
		}
		row.length = 0;
	},

	/*
	 * @method areImagesLoaded
	 * @param {HTMLElement} container The container to verify
	 */
	areImagesLoaded = function( container ) {
		var nodes = [],
			currNode, currNodeChildren, i;

		nodes = Array.prototype.slice.call( container.children );

		while ( nodes.length !== 0 ) {
			currNode = nodes.pop();
			currNodeChildren = currNode.children;

			if ( isImage( currNode ) && !isImageLoaded( currNode ) ) {
				return false;
			} else {
				for ( i = currNodeChildren.length - 1; i >= 0; i--) {
					nodes.push( currNodeChildren[i] );
				}
			}
		}

		return true;
	},

	/*
	 * @method IsImage
	 * @param {HTMLElement} node The node to verify
	 */
	isImage = function( node ) {
		return node instanceof HTMLImageElement;
	},

	/*
	 * @method isImageLoaded
	 * @param {HTMLImageElement} img The image to verify
	 */
	isImageLoaded = function( img ) {
		if ( !img.complete || img.naturalWidth === 0 ) {
			return false;
		}

		return true;
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, init );

// Handle text and window resizing
$document.on( "text-resize.wb window-resize-width.wb window-resize-height.wb tables-draw.wb", onResize );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
