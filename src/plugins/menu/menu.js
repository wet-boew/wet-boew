/**
 * @title WET-BOEW Menu plugin
 * @overview A Menu plugin for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-menu",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	breadcrumb = document.getElementById( "wb-bc" ),
	navCurrentEvent = "navcurr.wb",
	focusEvent = "setfocus.wb",
	detailsInitEvent = "wb-init.wb-details",
	menuItemSelectorA = "> a",
	menuItemSelectorSummary = "> details > summary",
	menuItemSelector = menuItemSelectorA + ", " + menuItemSelectorSummary,
	stillInMenu = false,
	$document = wb.doc,

	// Used for half second delay on showing/hiding menus because of mouse hover
	hoverDelay = 500,
	menuCount = 0,
	globalTimeout,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, ajaxFetch;

		if ( elm ) {
			$elm = $( elm );

			// Ensure the container has an id attribute
			if ( !$elm.attr( "id" ) ) {
				$elm.attr( "id", componentName + "-" + menuCount );
			}
			menuCount += 1;

			// Lets test to see if we have any menus to fetch
			// This is required for backwards compatibility. In previous versions, the menu was not integrated with the data ajax plugin.
			ajaxFetch = $elm.data( "ajax-fetch" );
			if ( ajaxFetch ) {
				$elm.trigger( {
					type: "ajax-fetch.wb",
					fetch: {
						url: ajaxFetch
					}
				} );
			} else {

				//Enhance menus that don't rely on the data-ajax plugin
				ajaxFetch = $elm.data( "ajax-replace" ) || $elm.data( "ajax-append" ) || $elm.data( "ajax-prepend" );
				if ( !ajaxFetch ) {
					onAjaxLoaded( $elm, $elm ); //NOTE TO SELF: this is the logic that upgrades hardcoded mega menus that don't use AJAX fragments
				}
			}
		}
	},

	/**
	 * @method createCollapsibleSection
	 * @return {string}
	 */
	createCollapsibleSection = function( section, $items, itemsLength ) {

		// Got rid of *most* ARIA attributes in the mobile menu by nuking this method... only remainders are tabindex=0/-1 on the summaries and role=menu on the top-level UL

		// Use details/summary for the collapsible mechanism
		var k, $elm, elm, $item, $subItems, subItemsLength,
			$section = $( section ),
			sectionHtml = "<li><details>" + "<summary class='mb-item" +
				( $section.hasClass( "wb-navcurr" ) || $section.children( ".wb-navcurr" ).length !== 0 ? " wb-navcurr'" : "'" ) +
				">" + $section.text() + "</summary>" +
				"<ul class='list-unstyled mb-sm'>";

		// Convert each of the list items into WAI-ARIA menuitems
		for ( k = 0; k !== itemsLength; k += 1 ) {
			$item = $items.eq( k );
			$elm = $item.find( menuItemSelector );
			elm = $elm[ 0 ];
			$subItems = $elm.parent().find( "> ul > li" );
			subItemsLength = $subItems.length;

			if ( elm && subItemsLength === 0 && elm.nodeName.toLowerCase() === "a" ) {
				sectionHtml += "<li>" + $item[ 0 ].innerHTML + "</li>";
			} else {
				sectionHtml += createCollapsibleSection( elm, $subItems, $subItems.length );
			}
		}

		return sectionHtml + "</ul></details></li>";
	},

	/**
	 * @method createMobilePanelMenu
	 * @param {array} allProperties Properties used to build the menu system
	 * @return {string}
	 */
	createMobilePanelMenu = function( allProperties ) {

		// Got rid of role=menu from the top-level UL in the mobile menu

		var panel = "",
			sectionHtml, properties, sections, section, parent, $items,
			linkHtml, i, j, len, itemsLength;

		// Process the secondary and site menus
		len = allProperties.length;
		for ( i = 0; i !== len; i += 1 ) {
			properties = allProperties[ i ];
			sectionHtml = "";
			sections = properties[ 0 ];
			for ( j = 0; j !== sections.length; j += 1 ) {
				section = sections[ j ];
				$items = $( section.parentNode ).find( "> ul > li" );
				itemsLength = $items.length;

				// Collapsible section
				if ( itemsLength !== 0 ) {
					sectionHtml += createCollapsibleSection( section, $items, itemsLength );
				} else {
					parent = section.parentNode;

					// Menu item without a section
					if ( parent.nodeName.toLowerCase() === "li" ) {
						linkHtml = parent.innerHTML;

					// Non-list menu items without a section and that contain their own link
					} else if ( parent.getElementsByTagName( "a" )[ 0 ] === section.getElementsByTagName( "a" )[ 0 ] ) {
						linkHtml = section.innerHTML;

					// Non-list menu item without a section and whose siblings contain a link
					} else {
						linkHtml = "<a href='" +
							parent.getElementsByTagName( "a" )[ 0 ].href + "'>" +
							section.innerHTML + "</a>";
					}

					// Convert the list item to a menuitem
					sectionHtml += "<li class='no-sect'>" + linkHtml + "</li>";
				}
			}

			// Create the panel section
			panel += "<nav typeof='SiteNavigationElement' id='" +
				properties[ 1 ] + "' class='" + properties[ 1 ] + " wb-menu wb-menu-inited'>" +
				"<h3>" + properties[ 2 ] + "</h3>" +
				"<ul class='list-unstyled mb-menu'>" +
				sectionHtml + "</ul></nav>";
		}

		return panel.replace( /['"]?list-group-item['"]?/gi, "\"\"" );
	},

	/**
	 * @method onAjaxLoaded
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery DOM element} $ajaxResult The AJAXed in menu content to import
	 */
	onAjaxLoaded = function( $elm, $ajaxResult ) {
		var $info = $( "#wb-info" ),
			inner = function( ) {
				var $ajaxed = $ajaxResult && $ajaxResult.attr( "data-type" ) === "string" ? $ajaxResult : $elm,
					$menubar = $ajaxed.find( ".menu" ),
					$menu = $menubar.find( "> li " + menuItemSelectorA + ", > li " + menuItemSelectorSummary ),
					target = $elm.data( "trgt" ),
					$secnav = $( "#wb-sec" ),
					$language = $( "#wb-lng" ),
					search = document.getElementById( "wb-srch" ),
					panel = "",
					panelDOM = document.getElementById( target ),
					$panel = $( panelDOM ),
					allProperties = [],
					$navCurr, $menuItem, $langItems, len, i;

				/*
				 * Build the mobile panel
				 */

				// Add search
				if ( search !== null ) {
					panel += "<section class='srch-pnl'>" +
						search.innerHTML
							.replace( /h2>/i, "h3>" )
							.replace( /(for|id)="([^"]+)"/gi, "$1='$2-imprt'" ) +
						"</section>";
				}

				// Add active language offer
				if ( $language.length !== 0 ) {
					$langItems = $language.find( "li:not(.curr)" );
					len = $langItems.length;
					panel += "<section class='lng-ofr'>" +
						"<h3>" + $language.children( "h2" ).html() + "</h3>" +
						"<ul class='list-inline'>";
					for ( i = 0; i !== len; i += 1 ) {
						panel += $langItems[ i ].innerHTML
							.replace( /(<a\s.*<\/a>?)/, "<li>$1</li>" );
					}
					panel += "</ul></section>";
				}

				// Create menu system
				if ( $secnav.length !== 0 || $menubar.length !== 0 || $info.length !== 0 ) {

					// Add the secondary menu
					//This logic looks for a left nav and replicates it in the mobile menu
					if ( $secnav.length !== 0 ) {
						allProperties.push( [
							$secnav.find( "ul" ).filter( ":not(li > ul)" ).find( " > li > *:first-child" ).get(),
							"sec-pnl",
							$secnav.find( "h2" ).html()
						] );

						if ( $secnav.find( ".wb-navcurr" ).length === 0 ) {

							// Trigger the navcurrent plugin
							$secnav.trigger( navCurrentEvent, breadcrumb );
						}
					}

					// Add the site menu
					if ( $menubar.length !== 0 ) {

						allProperties.push( [
							$menu.get(),
							"sm-pnl",
							$ajaxed.find( "h2" ).html()
						] );
					}

					// Add the site information
					if ( $info.length !== 0 ) {
						allProperties.push( [
							$info.find( "h3, a" ).not( "section a" ),
							"info-pnl",
							$info.find( "h2" ).html()
						] );

						if ( $info.find( ".wb-navcurr" ).length === 0 ) {

							// Trigger the navcurrent plugin
							$info.trigger( navCurrentEvent, breadcrumb );
						}
					}

					panel += createMobilePanelMenu( allProperties );
				}

				// Let's now populate the DOM since we have done all the work in a documentFragment
				panelDOM.innerHTML = "<header class='modal-header'><div class='modal-title'>" +
						document.getElementById( "wb-glb-mn" )
							.getElementsByTagName( "h2" )[ 0 ]
							.innerHTML +
						"</div></header><div class='modal-body'>" + panel + "</div>";
				panelDOM.className += " wb-overlay modal-content overlay-def wb-panel-r";

				// fix #8241
				if ( $.active > 0 ) {
					$( document ).ajaxStop( function( ) {
						initOverlay( $panel );
					} );
				} else {
					initOverlay( $panel );
				}

				// I think this is the spot I want... the entire mobile menu has already been built by this point and a mega menu copy/paste from the AJAX fragment seems to be in place by now...

				// Challenges would be... do I want this at a later point? In order to support scenarios where the mega menu was hardcoded into the page...

				// What would happen to mobile menu creation if the details/summary mega menu was hardcoded OR was already coded like that in an AJAX fragment?

				// How does the menu plugin behave when the mega menu is hardcoded - WITHOUT an AJAX fragment? Do its roles/etc get set/managed? Does the mobile menu still get generated? Yes, yes and yes... everything works perfectly in all scenarios with hardcoded mega menus :S

				// Don't forget about noscript and basic HTML modes

				// Don't forget to remove orphaned variables (like params for some of the methods I nuked)

				// Don't forget to ensure navcurr still works correctly

				// Don't forget about mobile menu scrolling offset functionality (or scrap it?)

				// Should scrap the menu's keystroke search feature... don't want random letter key presses doing anything interactive if nothing else will

				// Don't forget about Home/End support (btw the JS for them doesn't run in NVDA)

				// APG disclosure pattern talks about aria-current="page" for links to the current page...

				// NOTE: aria-setsize and aria-posinset don't cause anything to be announced by default... seems to only work when using certain ARIA roles

				// NOTE: Remove createCollapsibleSection's unused params at some point... and params from any other similar situations

				/*
				 * Build the regular mega menu
				 */

				//drizzleAria( $menu ); //don't need any ARIA attributes... except the mega menu blows up without this ugh lol

				// Revise the menu bar's structure as needed
				if ( $menubar.length ) {

					// Remove hardcoded role attributes (menu/menubar pattern leftovers...)
					$ajaxed.find( "ul[role]" ).removeAttr( "role" );

					// Loop over top-level menu items
					$menubar.children( "li" ).each( function( ) {
						const $topLevelLi = $( this );
						const $item = $topLevelLi.find( ".item" ).first( );
						const $submenu = $item.next( ".sm" );
						const arrowIcon = "<span class='expicon glyphicon glyphicon-chevron-down' aria-hidden='true'></span>";

						// If the item has a submenu...
						if ( $item.length && $submenu.length ) {

							// Add an arrow icon
							$item.append( arrowIcon );

							// Transform link/submenu combination into a details/summary structure
							if ( $item.prop( "nodeName" ).toLowerCase() === "a" ) {

								// Create a details element, turn the link into a summary and add its submenu
								const $newDetails = $( "<details><summary class='item'>" + $item.html() + "</summary>" + $submenu[ 0 ].outerHTML + "</details>" );

								// Replace the item's contents with the details element
								$topLevelLi.empty().append( $newDetails );
							}
						}
					} );
				}

				// Replace elements
				$elm.html( $ajaxed.html() );

				// Trigger the navcurrent plugin
				setTimeout( function( ) {
					$elm.trigger( navCurrentEvent, breadcrumb );
					$panel.find( "#sm-pnl" ).trigger( navCurrentEvent, breadcrumb );

					// Ensure that wb-navcurr is reflected in the top level
					$navCurr = $panel.find( ".wb-navcurr" );
					len = $navCurr.length;
					for ( i = 0; i !== len; i += 1 ) {
						$menuItem = $navCurr.eq( i );

						// If not at the top level, then add wb-navcurr to the top level
						if ( !$menuItem.hasClass( ".mb-item" ) ) {
							$menuItem = $menuItem
								.closest( "details" )
								.children( "summary" )
								.addClass( "wb-navcurr" );
						}
					}

					// Open up the secondary menu if it has wb-navcurr and has a submenu
					$menuItem = $panel.find( "#sec-pnl .wb-navcurr.mb-item" );
					if ( $menuItem.length && $menuItem.prop( "nodeName" ).toLowerCase() === "summary" ) {
						$menuItem
							.trigger( "click" )
							.parent()
							.prop( "open", "open" );
					}

					// Identify that initialization has completed
					wb.ready( $elm, componentName );
				}, 1 );
			},
			$footerAjax  = $info.find( "[data-ajax-replace],[data-ajax-append],[data-ajax-prepend]" ),
			footerAjaxLength = $footerAjax.length,
			ajaxCount = 0;

		//Delay the execution the menu until any ajaxed footer content is in
		if ( footerAjaxLength === 0 ) {
			inner( );
		} else {
			$info.on( "wb-contentupdated ajax-failed.wb", function( ) {
				ajaxCount += 1;
				if ( ajaxCount === footerAjaxLength ) {
					inner( );
				}
			} );
		}
	},

	// fix #8517
	/**
	 * @method initOverlay
	 * @param {jQuery object} $panel Current panel
	 */
	initOverlay = function( $panel ) {

		// Got rid of summary tabindex attributes in the mobile menu by nuking this method

		$panel
			.trigger( "wb-init.wb-overlay" )
			.find( "summary" )
			.trigger( detailsInitEvent );
	},

	/**
	 * @method menuIncrement
	 * @param {jQuery object} $menuItems Collection of of menu items to move between
	 * @param {jQuery object} $current Current menu item
	 * @param {integer} indexChange Requested relative change to the menu item index
	 */
	menuIncrement = function( $menuItems, $current, indexChange ) {
		const oldIndex = $menuItems.index( $current );
		let newIndex = oldIndex + indexChange;

		// Clamp out-of-range indexes
		// Credit: Stack Overflow answer (https://stackoverflow.com/a/11409978) by CAFxX (cafxx)
		newIndex = Math.max( 0, Math.min( newIndex, $menuItems.length - 1 ) );

		// Move to the new menu item
		if ( oldIndex !== newIndex ) {
			$menuItems.eq( newIndex ).trigger( focusEvent );
		}
	},

	/**
	 * @method menuClose
	 * @param {jQuery DOM element} $elm Parent LI(s) of the element(s) to close
	 * @param {boolean} removeActive Whether or not to keep the active class
	 */
	menuClose = function( $elm, removeActive ) {

		// Adjust top-level menu item's class and open attribute
		$elm
			.children( "[open]" )
			.removeAttr( "open" ) // FMI: I don't this this part of the logic actually works... couldn't get Enter key presses that close the menu to work correctly without preventDefault (even though space worked fine as-is)

			// Close nested submenus
			.find( "details" )
			.removeAttr( "open" );

		// Remove active class
		if ( removeActive ) {
			$elm.removeClass( "active" );
		}
	},

	/**
	 * @method menuDisplay
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery DOM element} $menu The menu to display
	 * @param {boolean} autoExpand (Optional) Whether to open the menu's dropdown (default is true)
	 * @param {string} eventType (Optional) Type of event that was triggered (default is undefined)
	 */
	menuDisplay = function( $elm, $menu, autoExpand = true, eventType ) {
		var $menuLink = $menu.find( menuItemSelector );

		// If another dropdown was already active, close it
		if ( $elm.find( ".active" ).not( $menu ).length ) {

			// Exclude dropdowns that are already open (so their top-level menu items don't lose their highlight effects when reverse-tabbing)
			const $activeLis = $elm.find( ".active" );
			const $filteredActiveLis = eventType === "focusin" ? $activeLis.not( ":has([open])" ) : $activeLis;

			menuClose( $filteredActiveLis, true );
		}

		$menu.addClass( "active" );

		// Ignore if doesn't have a submenu or isn't meant to auto-expand
		if ( $menuLink.length && $menuLink.prop( "nodeName" ).toLowerCase() === "summary" && autoExpand ) {

			// Expand the submenu
			$menuLink.parent().attr( "open", "open" );

			// Set a stillInMenu flag
			// Notes:
			// * When hovering from a submenu dropdown with an open nested details element to another top-level menu bar item... prevents the latter from auto-closing right as its submenu is trying to auto-expand
			// * Prevents similar unexpected auto-closing behaviour when clicking into the top/bottom spaces near nested details elements that are expanded
			stillInMenu = true;
		}
	};

// Bind the events of the plugin
$document.on( "timerpoke.wb " + initEvent + " ajax-fetched.wb ajax-failed.wb", selector, function( event ) {

	var eventType = event.type,
		elm, $elm;

	switch ( eventType ) {
		case "ajax-fetched":
		case "ajax-failed":
			elm = event.target;

			// Filter out any events triggered by descendants
			if ( event.currentTarget === elm ) {
				$elm = $( elm );

				// Only replace the menu if there isn't an error
				onAjaxLoaded(
					$elm,
					eventType === "ajax-fetched" ? event.fetch.pointer : $elm
				);
			}
			return false;

		case "timerpoke":
		case "wb-init":
			init( event );
			break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
} );

$document.on( "mouseleave", selector + " .menu", function( event ) {
	var $currentTarget = $( event.currentTarget );

	// Prevent hovering out of a focused menu from causing auto-reopening behaviour on focusin (i.e. mixed keyboard/mouse usage)
	stillInMenu = false;

	// Clear the timeout for open/closing menus
	clearTimeout( globalTimeout );

	globalTimeout = setTimeout( function( ) {
		menuClose( $currentTarget.find( ".active" ), true );
	}, hoverDelay );
} );

//Focusout equivalent for mouseleave
//Prevents active (highlight) effect from getting "stuck" when tabbing beyond top-level mega menu links
$document.on( "focusout", selector + " .menu:has(.active)", function( event ) {
	var $currentTarget = $( event.currentTarget );

	// Close the active mega menu dropdown only if focus landed outside of it
	// Notes:
	// * event.relatedTarget should correspond to the interactive element that's gaining focus
	// * When pressing the Escape key to close nested dropdowns, event.relatedTarget is inexplicably null... using a flag variable (stillInMenu) to work around it
	if ( $currentTarget.find( event.relatedTarget ).length === 0 && !stillInMenu ) {
		menuClose( $currentTarget.find( ".active" ), true );
	}

	stillInMenu = false;
} );

// Prevent opening another menu if mouse re-enters already opened menu
$document.on( "mouseenter", selector + " .sm", function( ) {
	if ( $( this ).hasClass( "open" ) ) {
		clearTimeout( globalTimeout );
	}
} );

// Click on menu items with submenus should open and close those submenus
$document.on( "click", selector + " summary", function( event ) {

	var menuItem = event.currentTarget,
		parent = menuItem.parentNode,
		isOpen = parent.hasAttribute( "open" ),
		menuItemOffsetTop, menuContainer;

	// Close any other open submenus
	if ( !isOpen ) {

		//Call menuClose for real instead of trying to rehash its functionality... and exclude current submenu and any other open ones
		menuClose(
			$( parent )
				.closest( "ul" )
				.find( "[open]" )
				.find( "summary" )
				.not( menuItem )
				.closest( "li" ),
			true
		);

		// Ensure the opened menu is in view if in a mobile panel
		menuContainer = document.getElementById( "mb-pnl" );
		menuItemOffsetTop = menuItem.offsetTop;
		if ( $.contains( menuContainer, menuItem ) &&
			menuItemOffsetTop < menuContainer.scrollTop ) {

			menuContainer.scrollTop = menuItemOffsetTop;
		}
	}
} );

$document.on( "mouseover focusin", selector + " .item", function( event ) {
	var $elm = $( event.currentTarget ),
		$parentLi = $elm.closest( "li" ),
		$container = $parentLi.closest( selector );

	// Clear the timeout for open/closing menus
	clearTimeout( globalTimeout );

	if ( event.type === "focusin" && !stillInMenu ) {

		// Highlight the top-level mega menu item... but don't auto-expand it for keyboard users
		// Note: Also passes over an event type to prevent open dropdowns from auto-closing when reverse-tabbing
		menuDisplay( $container, $parentLi, false, event.type );
	} else {
		globalTimeout = setTimeout( function( ) {
			menuDisplay( $container, $parentLi );
		}, hoverDelay );
	}
} );

/*
 * Keyboard bindings
 */
$document.on( "keydown", selector + " a[href], " + selector + " summary", function( event ) {
	var menuItem = event.currentTarget,
		which = event.which,
		$menuItem = $( menuItem ),
		hasPopup = menuItem.nodeName.toLowerCase() === "summary",
		$menu = $menuItem.parent().closest( "ul" ),
		inMenuBar = $menu.hasClass( "menu" ),
		$menuLink, $parentMenu, $parent, $subMenu,
		isOpen, menuItemOffsetTop, menuContainer;

	// Define keycodes. (Make const when WET supports ES6)
	var TAB_KC = 9,
		END_KC = 35,
		ENTER_KC = 13,
		ESC_KC = 27,
		HOME_KC = 36,
		LEFT_KC = 37,
		UP_KC = 38,
		RIGHT_KC = 39,
		DOWN_KC = 40,
		SPACE_KC = 32;

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {

		// Tab key = Hide all sub-menus
		//Auto-closes the mega menu when tabbing over it (the open top-level link has the active class)... runs in the mobile menu too, but is pointless in that context
		if ( which === TAB_KC ) {

		//Enter or spacebar on a link = follow the link and close menus
		//Always runs when clicking links in either the mega or mobile menu (regardless of anchor vs page)
		} else if ( menuItem.nodeName === "A" && menuItem.hasAttribute( "href" ) &&
			( which === ENTER_KC || which === SPACE_KC ) ) {

			event.preventDefault( );
			menuItem.click( );
			menuClose( $( selector + " .active" ), true );

		// Menu item is within a menu
		} else {

			// Left-up / right-down arrow (or opposite for RTL) = Previous / next menu item
			if ( which === LEFT_KC || which === UP_KC || which === RIGHT_KC || which === DOWN_KC ) {
				event.preventDefault( );

				// Setup variables to track forward arrow key actions
				// Note: Inverts left/right arrow keys in right-to-left (RTL) scenarios
				const isRTL = menuItem.closest( "[dir=rtl]" ) ? true : false;
				const arrowKeyForward = ( !isRTL && which === RIGHT_KC ) || ( isRTL && which === LEFT_KC ) || which === DOWN_KC ? true : false;

				// If the focused menu item is a summary for an open details element and the user is trying to advance... focus onto its submenu's first item
				if ( hasPopup && $menuItem.parent().attr( "open" ) && arrowKeyForward ) {
					let $parentLi = $menuItem.closest( "li" );
					$subMenu = $parentLi.find( "ul" );

					// Set focus on the first submenu item
					$subMenu.children( "li" ).eq( 0 ).find( menuItemSelector ).trigger( focusEvent );

				// Otherwise, focus onto the previous menu item
				} else {
					menuIncrement(
						$menu.children( "li" ).find( menuItemSelector ),
						$menuItem,
						arrowKeyForward ? 1 : -1
					);
				}

			// HOME / END keys = First / last menu item
			} else if ( which === HOME_KC || which === END_KC ) {
				event.preventDefault( );
				const $menuItems = $menu.children( "li" ).find( menuItemSelector );
				const index = $menuItems.index( $menuItem );

				menuIncrement(
					$menuItems,
					$menuItem,
					which === HOME_KC ? -index : $menuItems.length - 1 - index
				);

			// Toggle sub-menu
			// Enter, space or Escape key with a submenu
			} else if ( hasPopup && ( ( which === ENTER_KC || which === SPACE_KC ) || ( which === ESC_KC && $menuItem.parent().attr( "open" ) ) ) ) {
				$parent = $menuItem.parent( );

				// Prevent handling by details.js polyfill
				event.stopImmediatePropagation( );
				event.preventDefault( );

				// If the menu item is a summary element
				if ( menuItem.nodeName.toLowerCase() === "summary" ) {
					let menuBarJustOpened = false;
					isOpen = !!$parent.attr( "open" );

					// Display collapsed details element
					if ( !isOpen ) {

						// Display collapsed submenu for non-active focused menu bar item
						// If a collapsed submenu's parent menu bar item is being opened in mixed keyboard/mouse scenarios, call menuDisplay on it to avoid the risk of multiple submenus becoming open at the same time
						// Example of a scenario this helps with: Tab to the menu demo page's section 1, hover to section 3, press space (will open section 1 and close section 3), then hover to section 2... without this logic, both section 1+2's dropdowns will appear simultaneously
						//TODO: This is breaking simple mixed keyboard/mouse scenarios... like tabbing to a dropdown menu bar item, expanding it, then clicking outside of the menu (submenu won't collapse)... need to refine logic to account for both the simple + advanced scenarios
						if ( inMenuBar && !$menuItem.parent().attr( "open" ) && which !== ESC_KC ) {
							menuDisplay( $menuItem.closest( selector ), $menuItem.closest( "li" ) );
							menuBarJustOpened = true;
						}

						// Ensure the opened menu is in view if in a mobile panel
						menuContainer = document.getElementById( "mb-pnl" );
						menuItemOffsetTop = menuItem.offsetTop;
						if ( $.contains( menuContainer, menuItem ) &&
							menuItemOffsetTop < menuContainer.scrollTop ) {

							menuContainer.scrollTop = menuItemOffsetTop;
						}
					}

					// Ensure the menu is opened or stays open
					if ( !menuBarJustOpened ) {
						$menuItem.trigger( "click" );
					}
				}

			// Escape key
			} else if ( which === ESC_KC ) {
				$parent = $menu.parent( );
				$parentMenu = $parent.closest( "ul" );

				// If the parent menu is a menubar
				if ( $parentMenu.hasClass( "menu" ) ) {
					$menuLink = $menu.siblings( "a, summary" );

					// Close menu and return to menu bar item
					event.preventDefault( );
					$menuLink.trigger( focusEvent );

					// Close the menu but keep the referring link active
					setTimeout( function( ) {
						menuClose( $menuLink.parent().closest( "li" ), false );
					}, 100 );

				// Go up a level if there is a higher-level menu
				} else if ( $parentMenu.length !== 0 ) {
					event.preventDefault( );
					stillInMenu = true;
					$menu.closest( "li" )
						.find( menuItemSelectorSummary )
						.trigger( "click" )
						.trigger( focusEvent );
				}
			}
		}
	}
} );

// Prevent Firefox from double-triggering menu behaviour
//Leave this alone apart from the tweaked selector
//NOTE: Unable to replicate the issue this logic claims to be resolving in Firefox... AFAIK FF+Chromium currently behave identically
//Maybe caused by https://stackoverflow.com/a/45169196 (claims Firefox fires click events upon releasing keys) OR https://community.adobe.com/questions-652/keydown-eventlistener-firing-twice-for-some-keys-796664 (one reply says Windows works fine and others experiencing the issue say they're on macOS)
//Guessing the mindset behind this logic was to take in the first keydown normally, then disable subsequent events after the first keyup
$document.on( "keyup", selector + " a[href], " + selector + " summary", function( event ) {
	event.preventDefault( );
	return false;
} );

// Close the mobile panel if switching to medium, large or extra large view
//NOTE: These ARIA attributes come from the overlay plugin, so leave this logic as-is... no need to tamper with them
$document.on( "mediumview.wb largeview.wb xlargeview.wb", function( ) {
	var mobilePanel = document.getElementById( "mb-pnl" );
	if ( mobilePanel && mobilePanel.getAttribute( "aria-hidden" ) === "false" ) {
		$( mobilePanel ).trigger( {
			type: ( "close" ),
			namespace: "wb-overlay",
			noFocus: true
		} );
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
