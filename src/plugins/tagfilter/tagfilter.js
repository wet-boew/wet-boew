/**
 * @title WET-BOEW Tag filter
 * @overview Filter based content tagging
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, document, wb ) {
"use strict";

let wait, i18n;

const componentName = "wb-tagfilter",
	selector = "." + componentName,
	selectorCtrl = "." + componentName + "-ctrl",
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	tgFilterOutClass = "wb-tgfltr-out",
	itemsWrapperClass = componentName + "-items",
	noResultWrapperClass =  componentName + "-noresult",
	statusWrapperClass = componentName + "-status",

	init = function( event ) {
		const elm = wb.init( event, componentName, selector );

		if ( elm ) {
			const filterControls = elm.querySelectorAll( selectorCtrl ),
				taggedItems = elm.querySelectorAll( "[data-wb-tags]" ),
				taggedItemsWrapper = elm.querySelector( "." + itemsWrapperClass ),
				noResultWrapper = elm.querySelector( "." + noResultWrapperClass );

			elm.items = [];
			elm.filters = {};
			elm.activeFilters = [];

			if ( taggedItemsWrapper ) {
				taggedItemsWrapper.id = taggedItemsWrapper.id || wb.getId(); // Ensure the element has an ID
			}

			// Initialize i18n
			i18n = wb.i18n;

			// Handle filters
			if ( filterControls.length ) {
				elm.filters = buildFiltersObj( filterControls );

				filterControls.forEach( function( item ) {
					item.setAttribute( "aria-controls", taggedItemsWrapper.id );
				} );
			}

			// Handle tagged items
			if ( taggedItems.length ) {
				elm.items = buildTaggedItemsArr( taggedItems );
			}

			// Build a status element if there's not already one (this element will be used to announce the number of items found)
			if ( !elm.querySelector( ".wb-fltr-info" ) && !elm.querySelector( "." + statusWrapperClass ) ) {

				// Build the wrapper for the status message
				const statusWrapper = document.createElement( "div" );
				statusWrapper.classList.add( statusWrapperClass, "wb-inv" );
				statusWrapper.setAttribute( "role", "status" );

				// Build the status message element
				const statusMessage = document.createElement( "p" );
				statusWrapper.appendChild( statusMessage );

				// Append status element after the no result wrapper if it exists, otherwise after the tagged items wrapper
				( noResultWrapper || taggedItemsWrapper ).after( statusWrapper );
			}

			// Update list of visible items (in case of predefined filters)
			update( elm );

			wb.ready( $( elm ), componentName );
		}
	},

	// Add every tagged item to an array of objects with their DOM ID, list of associated tags, and default isMatched attribute
	buildTaggedItemsArr = function( taggedItems ) {
		let taggedItemsArr = [];

		taggedItems.forEach( function( taggedItem ) {
			let tagsList = taggedItem.dataset.wbTags.split( " " ),
				timeElm = taggedItem.querySelector( "time" ),
				dateStr = timeElm ? timeElm.getAttribute( "datetime" ) : null;

			if ( !taggedItem.id ) {
				taggedItem.setAttribute( "id", wb.getId() );
			}

			taggedItemsArr.push( {
				id: taggedItem.id,
				tags: tagsList,
				isMatched: true,
				itemText: taggedItem.innerText.toLowerCase(),
				date: dateStr
			} );
		} );
		return taggedItemsArr;
	},

	// Build list of available filters using all filters grouped by filter name
	buildFiltersObj = function( filterControls ) {
		let filtersObj = {};

		filterControls.forEach( function( control ) {
			if ( !control.name ) {
				console.error( componentName + ": Filter controls require an attribute 'name'." );
			}

			switch ( control.type ) {
				case "checkbox":
				case "radio":
					if ( !( control.name in filtersObj ) ) {
						filtersObj[ control.name ] = [ ];
					}

					filtersObj[ control.name ].push( {
						isChecked: control.checked,
						type: control.type,
						value: control.value
					} );

					break;
				case "select-one":
				case "date":
					filtersObj[ control.name ] = [ {
						type: control.type,
						value: control.value
					} ];
					break;
			}
		} );

		return filtersObj;
	},

	// Update array of active filters according to UI selected controls
	refineFilters = function( instance ) {
		instance.activeFilters = [ ]; // Clear active filters

		for ( let filterGroupName in instance.filters ) {

			// Skip date filters here
			if ( filterGroupName === "startDate" || filterGroupName === "endDate" ) {
				continue;
			}

			let filterGroup = instance.filters[ filterGroupName ],
				type = filterGroup[ 0 ].type, // All types in a group should be the same, so we can just check the first one
				selectedFilters = [ ];


			switch ( type ) {
				case "checkbox":
					selectedFilters = filterGroup
						.filter( item => item.isChecked )
						.map( item => item.value );
					break;

				case "radio":
				{
					let selectedItem = filterGroup.find( item => item.isChecked );

					if ( !selectedItem ) {
						console.warn( componentName + ": Radio button groups must have a default selected value. If you want to display all items, add an option called \"All\" with an empty value." );
						break;
					} else if ( selectedItem.value === "" ) { // If the "All" option is selected
						break;
					} else {
						selectedFilters.push( selectedItem.value );
						break;
					}
				}

				case "select-one":
					if ( filterGroup[ 0 ].value !== "" ) {
						selectedFilters.push( filterGroup[ 0 ].value );
					}
					break;
			}
			instance.activeFilters.push( selectedFilters );
		}
	},

	// Match tagged items to active filters and only return items that have an active filter in every filter group
	matchItemsToFilters = function( instance ) {

		// Count tag filter groups only (ignore dates here)
		let filtersGroups = instance.activeFilters.length,
			startDate = ( instance.filters.startDate && instance.filters.startDate[ 0 ] && instance.filters.startDate[ 0 ].value ) || "",
			endDate   = ( instance.filters.endDate && instance.filters.endDate[ 0 ] && instance.filters.endDate[ 0 ].value ) || "";

		instance.items.forEach( item => {
			let matchCount = 0,
				dateMatch = true; // Default is true unless proven otherwise

			// --- DATE FILTERING ---
			if ( item.date ) {

				// If only startDate is set, item must be after or on the startDate
				if ( startDate !== "" && endDate === "" ) {
					dateMatch = wb.date.compare( item.date, startDate ) >= 0;
				}

				// If only endDate is set, item must be before or on the endDate
				if ( endDate !== "" && startDate === "" ) {
					dateMatch = wb.date.compare( item.date, endDate ) <= 0;
				}

				// If both startDate and endDate are set, item must be between startDate and endDate (inclusive)
				if ( startDate !== "" && endDate !== "" ) {
					dateMatch = (
						wb.date.compare( item.date, startDate ) >= 0 &&
						wb.date.compare( item.date, endDate ) <= 0
					);
				}
			}

			// --- TAG FILTERING ---
			if ( dateMatch ) {
				instance.activeFilters.forEach( ( filterGroup ) => {
					if ( filterGroup.length === 0 || filterGroup.some( filter => {
						return item.tags.includes( filter );
					} ) ) {
						matchCount++;
					}
				} );
			}

			// Show item if it matches any filter and is within date range
			item.isMatched = ( matchCount === filtersGroups && dateMatch );
		} );
	},

	// Update list of visible items according to their "isMatched" property
	updateDOMItems = function( instance ) {
		const updatedItemsList = instance.items.forEach( function( item ) {
			let domItem = instance.querySelector( "#" + item.id );

			if ( item.isMatched ) {
				domItem.classList.remove( tgFilterOutClass );
			} else {
				domItem.classList.add( tgFilterOutClass );
			}
		} );
		return updatedItemsList;
	},

	// Update the status message element with the number of items found or no items found
	updateStatusMessage = function( instance ) {
		const statusWrapper = instance.querySelector( "." + statusWrapperClass ),
			noResultWrapper = instance.querySelector( "." + noResultWrapperClass ),
			statusMessageElm = statusWrapper ? statusWrapper.querySelector( "p" ) : null,
			itemsFoundText = i18n ? i18n( "items-found" ) : "items found out of / éléments trouvés sur";

		if ( statusWrapper && statusMessageElm ) {
			const matchedCount = instance.items.filter( item => item.isMatched ).length,
				totalCount = instance.items.length;

			let statusMessageText;

			//  If there are no items and the no result wrapper exists, copy its message to the screen reader status message, otherwise build a new message
			//  Note: Since the no result wrapper text is not dynamic, it wouldn't get announced by screen readers when the filter changes.
			//  This is why we copy it to the status message element.
			if ( matchedCount === 0 ) {
				statusMessageText = noResultWrapper ? noResultWrapper.textContent : i18n ? i18n( "no-items-found" ) : "No items found / Aucun élément trouvé";
			} else {
				statusMessageText = `${ matchedCount } ${ itemsFoundText } ${ totalCount }`;
			}
			statusMessageElm.textContent = statusMessageText;
		}
	},

	// Utility method to update stored active filters, update stored items, update visibility of tagged items and update status message
	update = function( instance ) {
		refineFilters( instance );
		matchItemsToFilters( instance );
		updateDOMItems( instance );
		updateStatusMessage( instance );

		$( instance ).trigger( "wb-filtered", [ { source: componentName } ] );
	};

// When a filter is updated
$document.on( "change", selectorCtrl, function( event )  {
	let control = event.currentTarget,
		filterType = control.type,
		filterName = control.name,
		filterValue = control.value,
		elm = control.closest( selector ),
		filterGroup = elm.filters[ filterName ];

	switch ( filterType ) {
		case "checkbox":

			// Update virtual filter to the new state
			filterGroup.find( function( filter ) {
				return filter.value === filterValue;
			} ).isChecked = !!control.checked;
			break;

		case "radio":

			// Set all virtual radio items to unchecked
			filterGroup.forEach( function( filterItem ) {
				filterItem.isChecked = false;
			} );

			// Set selected radio button's associated virtual filter to checked
			filterGroup.find( function( filter ) {
				return filter.value === filterValue;
			} ).isChecked = true;
			break;

		case "select-one":
		case "date":

			// Update virtual filter to the new value
			filterGroup[ 0 ].value = filterValue;
			break;
	}

	// Update list of visible items
	update( elm );
} );

// Reinitialize tagfilter if content on the page has been updated by another plugin
$document.on( "wb-contentupdated", selector + ", " + selector + " *", function()  {
	let that = this;

	if ( wait ) {
		clearTimeout( wait );
	}

	wait = setTimeout( function() {
		that.classList.remove( "wb-init", componentName + "-inited" );
		$( that ).trigger( "wb-init." + componentName );
	}, 100 );
} );

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );

} )( jQuery, window, document, wb );
