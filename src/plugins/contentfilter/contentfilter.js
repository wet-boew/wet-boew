/**
 * @title WET-BOEW Content filter
 * @overview Filter based content tagging
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, document, wb ) {
"use strict";

var componentName = "wb-contentfilter",
	selector = "." + componentName,
	controlerName = componentName + "-ctrl",
	selectorCtrl = "." + controlerName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	filterOutClass = "wb-fltr-out",
	filterInClass = "wb-fltr-in",
	filterExclusiveClass = "wb-fltr-exclusive",

	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm;

		if ( elm ) {
			$elm = $( elm );

			// Find the controlers, this element must have an id. It assume the controller only control one content-filtering section
			var controlers = $.find( "[aria-controls=" + elm.id + "]" );

			if ( controlers.length === 0 ) {
				console.warn( "Need to add a default controller" );
			}

			// Add a class for event binding.
			$( controlers ).addClass( controlerName );

			wb.ready( $elm, componentName );
		}
	};

// Add or Remove filter when the checkbox is selected
$document.on( "click", "input:checkbox" + selectorCtrl, function( event )  {

	var elm = event.currentTarget,
		filterTag = elm.value,
		state = !!elm.checked,
		controlsId = elm.getAttribute( "aria-controls" ),
		relatedPotential = document.querySelectorAll( "#" + controlsId + " [data-wb5-tags*=" + filterTag + "]" ),
		related = [],
		relatedExclusive = [],
		relatedNot = [],
		relatedExclusiveRem = [],
		i, i_len, j, j_len,
		currentElm, tagList, tag, lastIndex;

	// Filter down the ones that matched the initial DOM search
	i_len = relatedPotential.length;
	for ( i = 0; i < i_len; i = i + 1 ) {
		currentElm = relatedPotential[ i ];

		tagList = currentElm.dataset.wb5Tags.split( " " );

		j_len = tagList.length;
		for ( j = 0; j < j_len; j = j + 1 ) {

			tag = tagList[ j ];
			lastIndex = tag.lastIndexOf( filterTag );

			// Go next, in the case the elements have multiple tags
			if ( lastIndex === -1 ) {
				continue;
			}

			// Validate the type of filter
			if ( ( state && filterTag === tag ) || ( !state && "!" + filterTag === tag ) ) {
				related.push( currentElm );
				break;
			} else if ( ( !state && filterTag === tag ) || ( state && "!" + filterTag === tag ) ) {
				relatedNot.push( currentElm );
				break;
			} else if ( state && "*" + filterTag === tag ) {
				relatedExclusive.push( currentElm );
				break;
			} else if ( !state && "*" + filterTag === tag ) {
				relatedExclusiveRem.push( currentElm );
				break;
			}
		}
	}

	// Apply exclusive filter
	// Hide each sibling that is not scoped in the related Exclusive
	i_len = relatedExclusive.length;
	for ( i = 0; i < i_len; i = i + 1 ) {
		currentElm = relatedExclusive[ i ];
		currentElm.classList.add( filterInClass );
		currentElm.parentNode.classList.add( filterExclusiveClass );
	}

	// Remove Exclusive filter
	i_len = relatedExclusiveRem.length;
	for ( i = 0; i < i_len; i = i + 1 ) {
		currentElm = relatedExclusiveRem[ i ];
		currentElm.classList.remove( filterInClass );

		// Remove the parent CSS selector only if this was the last one
		if ( !currentElm.parentNode.getElementsByClassName( filterInClass ).length ) {
			$( currentElm.parentNode ).removeClass( filterExclusiveClass );
		}
	}

	// Apply filter out
	$( relatedNot ).addClass( filterOutClass );

	// Apply filter in
	$( related ).removeClass( filterOutClass );
} );

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );

} )( jQuery, window, document, wb );
