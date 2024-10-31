/**
 * @title WET-BOEW Tag filter
 * @overview Filter based content tagging
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, document, wb ) {
"use strict";

let wait;

const componentName = "wb-tagfilter",
	selector = ".provisional." + componentName,
	selectorCtrl = "." + componentName + "-ctrl",
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	filterOutClass = "wb-fltr-out",
	tgFilterOutClass = "wb-tgfltr-out",
	itemsWrapperClass = "wb-tagfilter-items",
	noResultWrapperClass = "wb-tagfilter-noresult",
	defaults = {
		live: true
	},

	init = function( event ) {
		const elm = wb.init( event, componentName, selector );

		if ( elm ) {
			const filterControls = elm.querySelectorAll( selectorCtrl ),
				taggedItems = elm.querySelectorAll( "[data-wb-tags]" ),
				taggedItemsWrapper = elm.querySelector( "." + itemsWrapperClass ),
				noResultWrapper = elm.querySelector( "." + noResultWrapperClass ),
				$elm = $( elm ),
				data = $.extend( {}, defaults, $elm.data( componentName ) );

			elm.items = [];
			elm.filters = {};
			elm.activeFilters = [];

			$elm.data( componentName, data );

			if ( taggedItemsWrapper ) {
				taggedItemsWrapper.id = taggedItemsWrapper.id || wb.getId(); // Ensure the element has an ID
				taggedItemsWrapper.setAttribute( "aria-live", "polite" );
			}

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

			// Add accessibility to no result element
			if ( noResultWrapper ) {
				noResultWrapper.setAttribute( "role", "status" );
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
			let tagsList = taggedItem.dataset.wbTags.split( " " );

			if ( !taggedItem.id ) {
				taggedItem.setAttribute( "id", wb.getId() );
			}

			taggedItemsArr.push( {
				id: taggedItem.id,
				tags: tagsList,
				isMatched: true,
				itemText: taggedItem.innerText.toLowerCase()
			} );
		} );

		return taggedItemsArr;
	},

	// Build list of available filters using all filters grouped by filter name
	buildFiltersObj = function( filterControls ) {
		let filtersObj = {};

		filterControls.forEach( function( control ) {
			const filterKey = getControlFilterName( control );

			if ( !filterKey ) {
				console.error( componentName + ": Filter controls require an attribute 'name'." );
			}

			if ( !( filterKey in filtersObj ) ) {
				filtersObj[ filterKey ] = [ ];
			}

			switch ( control.type ) {
				case "checkbox":
				case "radio":
					filtersObj[ filterKey ].push( {
						isChecked: control.checked,
						type: control.type,
						value: control.value,
						name: control.name
					} );

					break;
				case "select-one":
					filtersObj[ filterKey ].push( {
						type: control.type,
						value: control.value,
						name: control.name
					} );
					break;
			}
		} );

		return filtersObj;
	},

	// Update array of active filters according to UI selected controls
	refineFilters = function( instance ) {
		instance.activeFilters = [ ]; // Clear active filters

		for ( let filterGroupName in instance.filters ) {
			let filterGroup = instance.filters[ filterGroupName ],
				filterGroupChkCnt = filterGroup.filter( function( o ) {
					return o.isChecked === true;
				} ).length,
				filterGroupActiveFilters = [ ];

			if ( filterGroup[ 0 ].type === "radio" && filterGroupChkCnt < 1 ) {
				console.warn( componentName + ": Radio button groups must have a default selected value. If you want to display all items, add an option called \"All\" with an empty value." );
			}

			filterGroup.forEach( function( filterItem ) {
				if ( ( filterItem.isChecked || filterItem.type === "select-one" ) && filterItem.value !== "" ) {
					filterGroupActiveFilters.push( filterItem.value );
				}
			} );

			instance.activeFilters.push( filterGroupActiveFilters );
		}
	},

	// Match tagged items to active filters and only return items that have an active filter in every filter group
	matchItemsToFilters = function( instance ) {
		let filtersGroups = instance.activeFilters.length;

		instance.items.forEach( function( item ) {
			let matchCount = 0;

			instance.activeFilters.forEach( function( filterGroup ) {
				if ( filterGroup.length === 0 ) {
					matchCount++;
				} else {
					let itemIncludesFilter = filterGroup.filter( function( f ) {
						return item.tags.includes( f );
					} ).length;

					if ( itemIncludesFilter ) {
						matchCount++;
					}
				}
			} );

			matchCount === filtersGroups ? item.isMatched = true : item.isMatched = false;
		} );
	},

	// Update list of visible items according to their "isMatched" property
	updateDOMItems = function( instance ) {
		const updatedItemsList = instance.items.forEach( function( item ) {
			let domItem = instance.querySelector( "#" + item.id ),
				matched = item.isMatched;

			if ( matched ) {
				if ( domItem.classList.contains( tgFilterOutClass ) ) {
					domItem.classList.remove( tgFilterOutClass );
				}
			} else {
				if ( !domItem.classList.contains( tgFilterOutClass ) ) {
					domItem.classList.add( tgFilterOutClass );
				}
			}
		} );

		return updatedItemsList;
	},

	getControlFilterName = function( control ) {
		const controlSettings = wb.getData( control, componentName );
		if ( controlSettings !== undefined ) {
			return controlSettings.group || control.name;
		}
		return control.name;
	},

	// Utility method to update stored active filters, update stored items and update visibility of tagged items
	update = function( instance ) {
		refineFilters( instance );
		matchItemsToFilters( instance );
		updateDOMItems( instance );

		$( instance ).trigger( "wb-contentupdated", [ { source: componentName } ] );
	};

// When a filter is updated
$document.on( "change", selectorCtrl, function( event )  {
	let control = event.currentTarget,
		filterType = control.type,
		filterName = getControlFilterName( control ),
		filterValue = control.value,
		controlName = control.name,
		elm = control.closest( selector ),
		live = $( elm ).data( componentName ).live,
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
				if ( controlName === filterItem.name ) {
					filterItem.isChecked = false;
				}
			} );

		// Set selected radio button's associated virtual filter to checked
		filterGroup.find( function( filter ) {
			return filter.value === filterValue;
		} ).isChecked = true;
		break;

	case "select-one":

			// Update virtual filter to the new value
			filterGroup.find( function( filterItem ) {
				return filterItem.name === controlName;
			} ).value = filterValue;
	
			break;
	}

	// Update list of visible items
	if ( live ) {
		update( elm );
	}
} );

//	Trigger on form submit if not live changes
$document.on( "submit", selector + " form", function( event )  {
	const elm = event.currentTarget.closest( selector ),
		live = $( elm ).data( componentName ).live;

	if ( !live ) {
		update( elm );
	}
	event.preventDefault();
} );

$document.on( "wb-contentupdated", selector, function( event, data )  {
	let that = this,
		wrapper = $( this ).find( "." + itemsWrapperClass ),
		visibleItems = this.querySelectorAll( "." + itemsWrapperClass + " " + "[data-wb-tags]:not(." + tgFilterOutClass + ", ." + filterOutClass + ")" ),
		supportsHas = window.getComputedStyle( document.documentElement ).getPropertyValue( "--supports-has" ); // Get "--supports-has" CSS property

	// Reinitialize tagfilter if content on the page has been updated by another plugin
	if ( data && data.source !== componentName ) {
		if ( wait ) {
			clearTimeout( wait );
		}

		wait = setTimeout( function() {
			that.classList.remove( "wb-init", componentName + "-inited" );
			$( that ).trigger( "wb-init." + componentName );
		}, 100 );
	}

	// Show no result message if on Firefox -- Remove once Firefox supports ":has()"
	if ( supportsHas === "false" ) {
		let noResultItem = this.querySelector( "." + noResultWrapperClass );

		if ( noResultItem && this.items.length > 0 ) {
			if ( visibleItems.length < 1 ) {
				noResultItem.style.display = "block";
			} else {
				noResultItem.style.display = "none";
			}
		}
	}

	//	Filter events are bound before tag filter so it hides the container
	if ( visibleItems.length > 0 && wrapper.hasClass( filterOutClass ) ) {
		wrapper.removeClass( filterOutClass );
	}
} );

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );

} )( jQuery, window, document, wb );
