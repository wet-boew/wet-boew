/**
 * @title WET-BOEW Responsive equal height
 * @overview Sets the same height for all elements in a container that are rendered on the same baseline (row). Adapted from http://codepen.io/micahgodbolt/pen/FgqLc.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-eqht",
	selector = "." + componentName,
	$document = wb.doc,
	eventTimerpoke = "timerpoke.wb",
	initEvent = "wb-init" + selector,
	vAlignCSS = "vertical-align",
	vAlignDefault = "top",
	contentUpdatedEvent = "wb-contentupdated",
	minHeightCSS = "min-height",
	minHeightDefault = "0",
	cssValueSeparator = ":",
	cssPropertySeparator = ";",
	regexCSSValue = " ?[^;]+",
	regexVAlign = new RegExp( vAlignCSS + cssValueSeparator + " ?" + regexCSSValue + cssPropertySeparator + "?", "i" ),
	regexMinHeight = new RegExp( minHeightCSS + cssValueSeparator + " ?" + regexCSSValue + cssPropertySeparator + "?", "i" ),

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {

			// Remove the event handler since only want init fired once per page (not per element)
			$document.off( eventTimerpoke, selector );

			onResize();

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	},

	/**
	 * Re-equalise any time the window/document or a child element of 'selector' is resized.
	 * @method onResize
	 */
	onResize = function() {
		var $elm, $children, $anchor, currentChild, childCSS, i, j,
			$elms = $( selector ),
			row = [],
			rowTop = -1,
			currentChildTop = -1,
			currentChildHeight = -1,
			tallestHeight = -1;

		for ( i = $elms.length - 1; i !== -1; i -= 1 ) {
			$elm = $elms.eq( i );
			$children = $elm.find( ".eqht-trgt" );
			if ( !$children.length ) {
				$children = $elm.children();
			}

			// Reinitialize the row at the beginning of each section of equal height
			row = [];

			$anchor = detachElement( $elm );
			for ( j = $children.length - 1; j !== -1; j -= 1 ) {
				currentChild = $children[ j ];
				childCSS = currentChild.style.cssText.toLowerCase();

				//Ensure the CSS string ends by a seperator
				if ( childCSS.length > 0 && childCSS.substr( childCSS.length - 1 ) !== cssPropertySeparator ) {
					childCSS += cssPropertySeparator;
				}

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
				$children.eq( j ).data( minHeightCSS, minHeightDefault );
			}
			$elm = reattachElement( $anchor );

			// set the top and tallest to the first element
			rowTop = $children[ 0 ] ? $children[ 0 ].offsetTop : 0;
			tallestHeight = $children[ 0 ] ? $children[ 0 ].offsetHeight : 0;

			// first, the loop MUST be from start to end to work.
			for ( j = 0; j < $children.length; j++ ) {
				currentChild = $children[ j ];

				currentChildTop = currentChild.offsetTop;
				currentChildHeight = currentChild.offsetHeight;

				if ( currentChildTop !== rowTop ) {

					// as soon as we find an element not on this row (not the same offsetTop)
					// we need to equalize each items in that row to align the next row.
					equalize( row, tallestHeight );

					// since the elements of the previous row was equalized
					// we need to get the new offsetTop of the current element
					currentChildTop = currentChild.offsetTop;

					// reset the row, rowTop and tallestHeight
					row.length = 0;
					rowTop = currentChildTop;
					tallestHeight = currentChildHeight;
				}

				tallestHeight = Math.max( currentChildHeight, tallestHeight );
				row.push( $children.eq( j ) );
			}

			// equalize the last row
			equalize( row, tallestHeight );

			// Identify that the height equalization was updated
			$document.trigger( "wb-updated" + selector );
		}
	},

	/**
	* @method equalize
	* @param {array} row the array of items to be equalized
	* @param {int} tallestHeight the talest height to use to equalize
	*/
	equalize = function( row, tallestHeight ) {
		for ( var i = 0; i < row.length; i++ ) {

			// added a +1 because some floated element got stuck if the
			// shortest element was the last element in the row
			var minHeight = tallestHeight + 1;
			row[ i ][ 0 ].style.minHeight = minHeight + "px";
		}
	},

	/**
	 * @method detachElement
	 * @param {jQuery object} $elm The element to detach
	 * @returns {object} The detached element
	 */
	detachElement = function( $elm ) {
		var $prev = $elm.prev(),
			$next = $elm.next(),
			$parent = $elm.parent();

		if ( $prev.length ) {
			$elm.data( { anchor: $prev, anchorRel: "prev" } );
		} else if ( $next.length ) {
			$elm.data( { anchor: $next, anchorRel: "next" } );
		} else if ( $parent.length ) {
			$elm.data( { anchor: $parent, anchorRel: "parent" } );
		}

		return $elm.detach();
	},

	/**
	 * @method reattachElement
	 * @param {jQuery object} $elm The element to reattach
	 * @returns {object} The reattached element
	 */
	reattachElement = function( $elm ) {
		var $anchor = $elm.data( "anchor" ),
			anchorRel = $elm.data( "anchorRel" );

		switch ( anchorRel ) {
		case "prev":
			$anchor.after( $elm );
			break;
		case "next":
			$anchor.before( $elm );
			break;
		case "parent":
			$anchor.append( $elm );
			break;
		}

		return $elm;
	};

// Bind the init event of the plugin
$document.on( eventTimerpoke + " " + initEvent, selector, init );

// Handle text and window resizing
$document.on( "txt-rsz.wb win-rsz-width.wb win-rsz-height.wb " + contentUpdatedEvent + " wb-updated.wb-tables wb-update" + selector, onResize );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
