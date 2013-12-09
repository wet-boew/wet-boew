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
var selector = ".wb-eqht",
	$document = wb.doc,
	vAlignCSS = "vertical-align",
	vAlignDefault = "top",
	minHeightCSS = "min-height",
	minHeightDefault = "0",
	cssValueSeparator = ":",
	cssPropertySeparator = ";",
	regexCSSValue = " ?[^;]+",
	regexVAlign = new RegExp( vAlignCSS + cssValueSeparator + regexCSSValue + cssPropertySeparator ),
	regexMinHeight = new RegExp( minHeightCSS + cssValueSeparator + regexCSSValue + cssPropertySeparator ),

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {

		// Filter out any events triggered by descendants
		if ( event.currentTarget === event.target ) {
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
		var $elms = $( selector );

		$elms.each( function() {
			var $children, $detachedChildren, currentChild, childCSS, minHeight, i,
				row = [ ],
				rowTop = -1,
				currentChildTop = -1,
				currentChildHeight = -1,
				tallestHeight = -1,
				$this = $( this );

			$children = $this.children();

			$detachedChildren = $children.detach();
			for ( i = $detachedChildren.length - 1; i !== -1; i -= 1 ) {
				currentChild = $detachedChildren[ i ];
				childCSS = currentChild.style.cssText;

				// Ensure all children that are on the same baseline have the same 'top' value.
				if ( childCSS.indexOf( vAlignCSS ) !== -1 ) {
					childCSS = childCSS.replace( regexVAlign, vAlignCSS + cssValueSeparator + vAlignDefault + cssPropertySeparator );
				} else {
					childCSS += " " + vAlignCSS + cssValueSeparator + vAlignDefault + cssPropertySeparator;
				}

				// Remove any previously set min height
				if ( childCSS.indexOf( minHeightCSS ) !== -1 ) {
					childCSS = childCSS.replace( regexMinHeight, minHeightCSS + cssValueSeparator + minHeightDefault + cssPropertySeparator );
				} else {
					childCSS += " " + minHeightCSS + cssValueSeparator + minHeightDefault + cssPropertySeparator;
				}

				currentChild.style.cssText = childCSS;
			}
			$detachedChildren.appendTo( $this );

			for ( i = $children.length - 1; i !== -1; i -= 1 ) {
				currentChild = $children[ i ];

				currentChildTop = currentChild.offsetTop;
				currentChildHeight = currentChild.offsetHeight;

				if ( currentChildTop !== rowTop ) {
					recordRowHeight( row, tallestHeight );

					rowTop = currentChildTop;
					tallestHeight = currentChildHeight;
				} else {
					tallestHeight = ( currentChildHeight > tallestHeight ) ? currentChildHeight : tallestHeight;
				}

				row.push( $children.eq( i ) );
			}
			recordRowHeight( row, tallestHeight );

			$detachedChildren = $children.detach();
			for ( i = $detachedChildren.length - 1; i !== -1; i -= 1 ) {
				minHeight = $detachedChildren.eq( i ).data( "min-height" );

				if ( minHeight ) {
					$detachedChildren[ i ].style.minHeight = minHeight;
				}
			}
			$detachedChildren.appendTo( $this );
		} );
	},

	/**
	 * @method recordRowHeight
	 * @param {array} row The elements for which to record the height
	 * @param {integer} height The height to record
	 */
	recordRowHeight = function( row, height ) {

		// only set a height if more than one element exists in the row
		if ( row.length > 1 ) {
			for ( var i = row.length - 1; i !== -1; i -= 1 ) {
				row[ i ].data( "min-height", height + "px" );
			}
		}
		row.length = 0;
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, init );

// Handle text and window resizing
$document.on( "txt-rsz.wb win-rsz-width.wb win-rsz-height.wb tables-draw.wb", onResize );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
