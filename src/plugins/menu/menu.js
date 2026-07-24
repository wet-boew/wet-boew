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
	menuItemSelector = "> a, > details > summary",
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

	//TODO: Scrap this entirely since it's probably no longer needed
	/**
	 * Lets set some aria states and attributes
	 * @method drizzleAria
	 * @param {jQuery DOM elements} $elements The collection of elements
	 */
	drizzleAria = function( $elements ) {
		var length = $elements.length,
			$elm, $subMenu, i;

		// Lets tweak for aria
		for ( i = 0; i !== length; i += 1 ) {
			$elm = $elements.eq( i );
			$subMenu = $elm.siblings( "ul" );

			// if there is a submenu lets put in the aria for it
			if ( $subMenu.length !== 0 ) {

				// recurse into submenu
				drizzleAria( $subMenu.children( "li" ).find( menuItemSelector ) );
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
			inner = function() {
				var $ajaxed = $ajaxResult && $ajaxResult.attr( "data-type" ) === "string" ? $ajaxResult : $elm,
					$menubar = $ajaxed.find( ".menu" ),
					$menu = $menubar.find( "> li > a, > li > details > summary" ), //TODO: this might need to cover summaries too (via > li > details > summary)... but aren't 100% sure, adjusting it currently breaks things (like adding second dropdown arrows beside the hardcoded ones in the summaries and focus plugin console errors)... should it only be targeting DROPDOWN links? As in top-level summaries exclusively?
					target = $elm.data( "trgt" ),
					$secnav = $( "#wb-sec" ),
					$language = $( "#wb-lng" ),
					search = document.getElementById( "wb-srch" ),
					panel = "",
					panelDOM = document.getElementById( target ),
					$panel = $( panelDOM ),
					allProperties = [],
					$navCurr, $menuItem, $langItems, len, i;

				console.log("MY MENU:");
				console.log($menu);

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

						// Add the menubar role if it is missing
						// TODO: Turn this into something that *removes* the menubar role if it's present?

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
					$( document ).ajaxStop( function() {
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
					$menubar.children( "li" ).each(function() {
						const $topLevelLi = $( this );
						const $item = $topLevelLi.find( ".item" ).first();
						const $submenu = $item.next( ".sm" );
						const arrowIcon = "<span class='expicon glyphicon glyphicon-chevron-down' aria-hidden='true'></span>";

						// If the item has a submenu...
						if ( $item.length && $submenu.length ) {

							// Add an arrow icon
							$item.append( arrowIcon );

							// Transform link/submenu combination into a details/summary structure
							if ( $item.prop( "nodeName" ).toLowerCase() === "a" ) {

								// Create a details element, turn the link into a summary and add its submenu
								const $newDetails = $( "<details><summary class='item'>" + $item.html() + "</summary>" + $submenu[0].outerHTML + "</details>" );

								// Replace the item's contents with the details element
								$topLevelLi.empty().append($newDetails);
							}
						}
					});
				}

				// Replace elements
				$elm.html( $ajaxed.html() );

				// Trigger the navcurrent plugin
				setTimeout( function() {
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
					//This auto-expands the left nav's details element in the mobile menu (by fake clicking its summary and adding an open attribute... attribute is probably for the polyfill)
					$menuItem = $panel.find( "#sec-pnl .wb-navcurr.mb-item" );
					if ( $menuItem.length && $menuItem.prop( "nodeName" ).toLowerCase() === "summary" ) {
						console.log("auto-expanding the left nav's mobile details element...");
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
			inner();
		} else {
			$info.on( "wb-contentupdated ajax-failed.wb", function() {
				ajaxCount += 1;
				if ( ajaxCount === footerAjaxLength ) {
					inner();
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
		var menuItemsLength = $menuItems.length,
			index = $menuItems.index( $current ) + indexChange;

		// Correct out-of-range indexes
		//NOTE: this is the menu list looping logic... scrap it if I don't want it in the disclosure pattern... will need a little more logic though to trigger the focus event in a smarter manner
		index = index === menuItemsLength ? 0 : index === -1 ? menuItemsLength - 1 : index;

		// Move to the new menu item
		console.log("NEW: about to focus onto this via menuIncrement():");
		console.log($menuItems.eq( index )[0]);
		$menuItems.eq( index ).trigger( focusEvent );
	},

	/**
	 * @method menuClose
	 * @param {jQuery DOM element} $elm Parent of the element to close - btw this can potentially be an ARRAY of li elements (one call to it passes-in an $openMenus variable...)
	 * @param {boolean} removeActive Whether or not to keep the active class
	 */
	menuClose = function( $elm, removeActive ) {

		console.log("inside menuClose");

		// This logic is designed with li in mind
		console.log("my $elm:");
		console.log($elm);
		console.log($elm.get(0));

		//IDEA TO CONSIDER: Should I adjust this logic to only start running if the sm-open class exists in the first place?
		// Adjust top-level menu item's class and open attribute
		$elm
			.removeClass( "sm-open" )
			.children( "[open]" )
			.removeAttr( "open" ) // FMI: I don't this this part of the logic actually works... couldn't get Enter key presses that close the menu to work correctly without preventDefault (even though space worked fine as-is)

		// Close nested submenus... is that actually necessary? Is it desirable for users to have this mindlessly reset to closed?
		//TODO: If I keep this, remove preceding children and removeAttr method calls since there's no point removing the open attribute separately for the top-level vs deeper details elements (unless I want to do fake clicking...?)
			.find( "details" )
			.removeAttr( "open" );

		if ( removeActive ) {
			$elm.removeClass( "active" );
		}
	},

	/**
	 * @method menuDisplay
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery DOM element} $menu The menu to display
	 */
	menuDisplay = function( $elm, $menu ) {
		var $menuLink = $menu.find( "> a, > details > summary" ); //the issue seems to be that menu is getting passed as the mega menu UL (instead of LI.active) when hovering over an A element in the top-level mega menu items... which means some logic that calls this method is passing crap for $menu... ACTUALLY even though that's a bug, it's not causing any console errors in practice

		console.log("inside menuDisplay");

		if ($elm.find( ".active" ).not( $elm ).length) { //prevents menuClose from getting needlessly called (like if entering the menu for the first time or collapsing the current top-level menu item)
			console.log("yay!!!");
			menuClose( $elm.find( ".active" ), true );
		//} else {
		//	console.log("nah!!!");
		}
		console.log($elm);
		console.log($elm.find( ".active.sm-open" ));

		$menu.addClass( "active" );
		console.log("loggy loggy");
		console.log("$elm:");
		console.log($elm);
		console.log("$menu (added active class to it too):");
		console.log($menu);
		console.log("$menuLink:");
		console.log($menuLink);

		if (!$menuLink.length) {
			console.log("OH NOES, I have no length!!!");
		}

		// Ignore if doesn't have a submenu
		if ( $menuLink.length && $menuLink.prop( "nodeName" ).toLowerCase() === "summary" ) {

			console.log($menuLink);
			console.log($menuLink.get(0));
			console.log($menuLink.parent().get(0));

			// Add an open attribute to the menu link's parent details element
			$menuLink.parent().attr( "open", "open" ); //TODO: Should this be a fake click based on whether the details is already open?

			// Add the open state classes
			$menu
				.addClass( "sm-open" );
		}
	},

	/**
	 * Searches for the next link that has link text starting with a specific letter
	 * @method selectByLetter
	 * @param {integer} charCode The charCode of the letter to search for
	 * @param {DOM elements} links Collection of links to search
	 */
	selectByLetter = function( charCode, links ) {
		var len = links.length,
			keyChar = String.fromCharCode( charCode ),
			link, i;

		for ( i = 0; i !== len; i += 1 ) {
			link = links[ i ];
			if ( link.innerHTML.charAt( 0 ) === keyChar ) {
				$( link ).trigger( focusEvent );
				return true;
			}
		}

		return false;
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

	// Clear the timeout for open/closing menus
	clearTimeout( globalTimeout );

	globalTimeout = setTimeout( function() {
		menuClose( $currentTarget.find( ".active" ), true );
	}, hoverDelay );
} );

// Prevent opening another menu if mouse re-enters already opened menu
$document.on( "mouseenter", selector + " .sm", function() {
	if ( $( this ).hasClass( "open" ) ) {
		clearTimeout( globalTimeout );
	}
} );

// Touchscreen "touches" on menubar items should close the submenu if it is open
//NOTE: This is pointless now... scrapped it
//Would I need to restore it to bring back the arrow icon when in a collapsed+focused state?

// Click on menu items with submenus should open and close those submenus
$document.on( "click", selector + " summary", function( event ) {

	//When opening a details in the mobile menu overlay, this is what auto-closes other open details elements (basically a fake accordion)... it MIGHT work in the mega menu too... consider scrapping it if I go with native accordions
	console.log("Closing other submenus");

	var menuItem = event.currentTarget,
		parent = menuItem.parentNode,
		isOpen = parent.hasAttribute( "open" ),
		menuItemOffsetTop, menuContainer;

	// Close any other open menus
	if ( !isOpen ) {
		$( parent )
			.closest( "ul" )
			.find( "[open]" )
			.find( "summary" )
			.not( menuItem )
			.trigger( "click" );

		// Ensure the opened menu is in view if in a mobile panel
		menuContainer = document.getElementById( "mb-pnl" );
		menuItemOffsetTop = menuItem.offsetTop;
		if ( $.contains( menuContainer, menuItem ) &&
			menuItemOffsetTop < menuContainer.scrollTop ) {

			menuContainer.scrollTop = menuItemOffsetTop;
		}
	}
} );

// Clicks and touches outside of menus should close any open menus
$document.on( "click", function( event ) {
	var $openMenus,
		which = event.which;

	// Ignore middle and right mouse buttons
	if ( event.type === "" || ( !which || which === 1 ) ) {
		$openMenus = $( selector + " .sm-open" );
		if ( $openMenus.length !== 0 &&
			$( event.target ).closest( selector ).length === 0 ) {

			menuClose( $openMenus, true );
		}
	}
} );

$document.on( "mouseover focusin", selector + " .item", function( event ) {
	var $elm = $( event.currentTarget ),
		$parentLi = $elm.closest( "li" ), //closest() is the best compromise between a vs summary elements.... unless I want to do an terniary element check or something (don't see a need for it)
		$container = $parentLi.closest( selector );

	console.log("mousing over something...");

	// Clear the timeout for open/closing menus
	clearTimeout( globalTimeout );

	if ( event.type === "focusin" ) {
		console.log("NEW: ---");
		console.log("NEW: focusin...");
		console.log("NEW: $container:");
		console.log($container);
		console.log("NEW: $parentLi");
		console.log($parentLi);
		console.log("NEW: ---");
		menuDisplay( $container, $parentLi );
	} else {
		globalTimeout = setTimeout( function() {
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
		$menuLink, $parentMenu, $parent, $subMenu, result,
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

		// Many strange issues will likely occur as a result of the ARIA roles/etc I scrapped

		// Tab key = Hide all sub-menus
		//Auto-closes the mega menu when tabbing over it (the open top-level link has the active class)... runs in the mobile menu too, but is pointless in that context
		if ( which === TAB_KC ) {
			//commenting-out since this makes it impossible to tab into the mega menu's submenu dropdowns
			//console.log("Tab key = Hide all sub-menus... calling menuClose");
			//menuClose( $( selector + " .active" ), true );

		//Enter or spacebar on a link = follow the link and close menus
		//Always runs when clicking links in either the mega or mobile menu (regardless of anchor vs page)
		} else if ( menuItem.nodeName === "A" && menuItem.hasAttribute( "href" ) &&
			( which === ENTER_KC || which === SPACE_KC ) ) {

			console.log("Enter or spacebar on a link = follow the link and close menus... fake link click + calling menuClose");
			event.preventDefault();
			menuItem.click();
			menuClose( $( selector + " .active" ), true );

		// Menu item is within a menu bar
		} else if ( inMenuBar ) {

			console.log("In inMenuBar if");

			// Left-up / right-down arrow = Previous / next menu item
			if ( which === LEFT_KC || which === UP_KC || which === RIGHT_KC || which === DOWN_KC ) {
				event.preventDefault();
				//const advancing = RIGHT_KC || DOWN_KC ? true : false;
				console.log("Moving left-up/right-down on mega menu bar");

				// If the focused menu item is a summary for an open details element and the user is trying to advance via the right/down arrows... focus onto its submenu's first item
				if ( hasPopup && $menuItem.parent().attr( "open" ) && ( which === RIGHT_KC || which === DOWN_KC ) ) {
					console.log("GOING TO FIRST SUBMENU ITEM!!! Pressed right/down on an expanded summary in the mega menu...");
					console.log($menuItem.parent().attr( "open" ));
					event.preventDefault(); //this is pointless... it's already in the parent if condition
					let $parentLi = $menuItem.closest( "li" );
					$subMenu = $parentLi.find( ".sm" );

					// Set focus on the first submenu item
					$subMenu.children( "li" ).eq( 0 ).find( menuItemSelector ).trigger( focusEvent );
				} else {

					console.log("going left/right...");
					menuIncrement(
						$menu.find( "> li > a, > li > details > summary" ),
						$menuItem,
						which === LEFT_KC || which === UP_KC ? -1 : 1
					);
				}

			// HOME / END keys = First / last menu item
			//NOTE: Only works on top menu bar atm
			} else if ( which === HOME_KC || which === END_KC ) {
				event.preventDefault();
				console.log("Pressed HOME or END on mega menu bar");
				const $menuItems = $menu.children( "li" ).find( menuItemSelector );
				//TODO: Add a condition here (or in menuIncrement itself) to not needlessly call menuIncrement if curreny focus is already on the first or last item in the array (like by comparing $menuItem vs $menuItems.first() or $menuItems.last()
				menuIncrement(
					$menuItems,
					which === HOME_KC ? $menuItems.first() : $menuItems.last(),
					which === 0
				);

			// Toggle sub-menu
			} else if ( hasPopup && ( which === ENTER_KC || which === SPACE_KC ) ) {
				event.preventDefault(); // Absolutely need this for Enter key compatibility!!!
				console.log("inside mystery mega menu submenu logic");
				let $parentDetails = $menuItem.parent();
				let $parentLi = $menuItem.closest( "li" );
				$subMenu = $parentLi.find( ".sm" );

				// Open the submenu if it is not already open
				if ( !$parentDetails.attr( "open" ) ) {
					console.log("opening the mega menu submenu");
					menuDisplay( $menu.closest( selector ), $parentLi );
				} else {
					console.log("closing the mega menu submenu");
					menuClose( $menu.closest( selector ).find( ".active" ), false );
				}

				// Set focus on the first submenu item
				// Nerfed this to prevent pressing top-level mega menu items from auto-focusing onto the first submenu item
				//$subMenu.children( "li" ).eq( 0 ).find( menuItemSelector ).trigger( focusEvent ); //oooooooooooooooooooooooooo

			// Hide sub-menus and set focus
			//NOTE: Very similar to aforementioned else if, but doesn't toggle (if I try porting it there I'd need to ensure ESC never toggles)
			} else if ( which === ESC_KC ) {
				event.preventDefault();
				menuClose( $menu.closest( selector ).find( ".active" ), false );

			// Letters only
			} else if ( which > 64 && which < 91 ) {
				event.preventDefault();
				selectByLetter(
					which,
					$menuItem.parent().find( "> ul > li > a, > ul > li > details > summary" ).get()
				);
			}

		// Menu item is not within a menu bar
		} else {
			console.log("In else");

			// Left-up / right-down arrow = Previous / next menu item
			if ( which === LEFT_KC || which === UP_KC || which === RIGHT_KC || which === DOWN_KC ) {
				event.preventDefault();
				console.log("Up-left / down-right arrow = Previous / next menu item... calling menuIncrement");

				//const advancing = RIGHT_KC || DOWN_KC ? true : false;
				console.log("Moving left-up/right-down on mobile menu");

				// In the mobile menu... if the focused menu item is a summary for an open details element and the user is trying to advance via the right/down arrows... focus onto its submenu's first item
				if ( hasPopup && $menuItem.parent().attr( "open" ) && ( which === RIGHT_KC || which === DOWN_KC ) ) {
					console.log("GOING TO FIRST SUBMENU ITEM!!! Pressed right/down on an expanded summary in the mobile menu...");
					console.log($menuItem);
					console.log($menuItem.parent().attr( "open" ));
					event.preventDefault(); //this is pointless... it's already in the parent if condition
					let $parentLi = $menuItem.closest( "li" );
					$subMenu = $parentLi.find( ".mb-sm" ); //NOTE: This is the same as the mega menu logic's selector, but targets a mobile flavour of its class name

					// Set focus on the first submenu item
					$subMenu.children( "li" ).eq( 0 ).find( menuItemSelector ).trigger( focusEvent );
				} else {

					console.log("going left/right in the mobile menu...");
					menuIncrement(
						$menu.children( "li" ).find( menuItemSelector ),
						$menuItem,
						which === LEFT_KC || which === UP_KC ? -1 : 1
						//TODO: This should do the job for fixing up/down arrow support... but still need to look into the latter conditions beyond here to look into removing more right/left variable checks
					);
				}

			// HOME / END keys = First / last menu item
			//NOTE: Copy of the top menu bar's logic for "not within a menu bar" scenarios, logic hasn't changed at all... so maybe only provide the logic once
			} else if ( which === HOME_KC || which === END_KC ) {
				event.preventDefault();
				console.log("Pressed HOME or END on when not within a menu bar");
				const $menuItems = $menu.children( "li" ).find( menuItemSelector );
				//TODO: Add a condition here (or in menuIncrement itself) to not needlessly call menuIncrement if curreny focus is already on the first or last item in the array (like by comparing $menuItem vs $menuItems.first() or $menuItems.last()
				menuIncrement(
					$menuItems,
					which === HOME_KC ? $menuItems.first() : $menuItems.last(),
					which === 0
				);

			// Enter or space arrow with a submenu
			} else if ( hasPopup && ( which === ENTER_KC || which === SPACE_KC ) ) {
				$parent = $menuItem.parent(); //shouldn't need to use closest() for this part since the else if condition's hasPopup check will guarantee this can only run against summaries that are top-level mega menu items

				// Prevent handling by details.js polyfill
				event.stopImmediatePropagation();
				event.preventDefault();

				console.log("Enter or space arrow with a submenu... does misc stuff");
				console.log(menuItem);
				console.log(menuItem.nodeName.toLowerCase() === "summary");

				// If the menu item is a summary element
				if ( menuItem.nodeName.toLowerCase() === "summary" ) {
					isOpen = !!$parent.attr( "open" );

					//this is is where things are spiralling out of control... the old logic never got into this if when left/right pressing while deep inside a mega menu dropdown
					console.log("summary element check... works in mobile menu and mega menu");

					// Close any other open menus
					// BRAINDUMP: This is misleading... I don't see any logic here that would actually close other open menus... I think it's because that line comment was copied from somewhere else that actually does what it's supposed to
					// TODO: Did I mess around with this part of the logic in my pending aria-expanded PR? Maybe I just forgot to revise the comment after gutting some of its logic? In any case, revise the comment to make sense!
					if ( !isOpen ) {

						// Ensure the opened menu is in view if in a mobile panel
						menuContainer = document.getElementById( "mb-pnl" );
						menuItemOffsetTop = menuItem.offsetTop;
						if ( $.contains( menuContainer, menuItem ) &&
							menuItemOffsetTop < menuContainer.scrollTop ) {

							menuContainer.scrollTop = menuItemOffsetTop;
						}

						// Ensure the menu is opened or stays open
						console.log("fake click triggered to open the clicked summary in mobile menu... runs in mega menu too");
						$menuItem.trigger( "click" );
					}

					// Move focus to the first submenu item
					//NOTE: Not needed anymore... autofocusing to the first submenu item only makes sense in the menu pattern
					/*$parent.children( "ul" )
						.find( "a[href], summary" )
						.first()
						.trigger( focusEvent );*/
				}

			// Escape, left / right arrow without a submenu
			} else if ( which === ESC_KC || which === LEFT_KC || which === RIGHT_KC ) {
				console.log("NEW: uh oh 1...");
				$parent = $menu.parent();
				$parentMenu = $parent.closest( "ul" );
				if ( which === LEFT_KC || which === RIGHT_KC ) {
					event.preventDefault();
					console.log("NEW: uh oh 2...");
				}

				// If the parent menu is a menubar
				if ( $parentMenu.hasClass( "menu" ) ) { //MINI TODO: Should this only be checking whether the direct parent UL has a menu class? Or any super high-level parent?
					$menuLink = $menu.siblings( "a, summary" );

					// Escape key = Close menu and return to menu bar item
					if ( which === ESC_KC ) {
						event.preventDefault();
						$menuLink.trigger( focusEvent );

						// Close the menu but keep the referring link active
						setTimeout( function() {
							menuClose( $menuLink.parent(), false );
						}, 100 );

					// Left / right key = Next / previous menu bar item
					} else if ( $parentMenu.hasClass( "menu" ) ) { //MINI TODO: Should this only be checking whether the direct parent UL has a menu class? Or any super high-level parent?
						console.log("NEW: about to increment...");
						console.log("$parentMenu:");
						console.log($parentMenu);
						console.log("$parentMenu.find( \"> li > a, > li > details > summary\" ):");
						console.log($parentMenu.find( "> li > a, > li > details > summary" )); //returns a 1 item array with "some random link" A element
						console.log("$menuLink:");
						console.log($menuLink); //returns a 0 length array... maybe because the summaries aren't being selected
						menuIncrement(
							$parentMenu.find( "> li > a, > li > details > summary" ), //I think my issue is that something's wrong with this selector... I think it should be going to a summary? Btw another selector variable earlier on is a duplicate of this selector... fixed it
							$menuLink,
							which === LEFT_KC ? -1 : 1
						);
					}

				// Escape or left arrow: Go up a level if there is a higher-level
				// menu or close the current submenu if there isn't
				} else if ( which !== RIGHT_KC ) {
					$subMenu = $parentMenu.length !== 0 ? $menu : $menuItem;

					// There is a higher-level menu
					if ( $parentMenu.length !== 0 ) {
						event.preventDefault();
						$menu.closest( "li" )
							.find( menuItemSelector )
							.trigger( "click" )
							.trigger( focusEvent );

					// No higher-level menu but the current submenu is open
					} else if ( $menuItem.parent().attr( "open" ) ) {
						event.preventDefault();
						$menuItem
							.trigger( "click" )
							.trigger( focusEvent );
					}
				}

			// Select a menu item in the current menu by the first letter
			} else if ( which > 64 && which < 91 ) {
				event.preventDefault();
				$parent = $menuItem.closest( "li" );

				// Try to find a match in the next siblings
				result = selectByLetter(
					which,
					$parent.nextAll().find( menuItemSelector ).get()
				);

				// If couldn't find a match, try the previous siblings
				if ( !result ) {
					result = selectByLetter(
						which,
						$parent.prevAll().find( menuItemSelector ).get()
					);
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
	event.preventDefault();
	return false;
} );

// Close the mobile panel if switching to medium, large or extra large view
//NOTE: These ARIA attributes come from the overlay plugin, so leave this logic as-is... no need to tamper with them
$document.on( "mediumview.wb largeview.wb xlargeview.wb", function() {
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
