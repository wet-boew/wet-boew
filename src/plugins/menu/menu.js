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
			// This is required for backwards compatibility. In previous versions, the menu was not integrated witht he data ajax plugin.
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
					onAjaxLoaded( $elm, $elm );
				}
			}
		}
	},

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

			$elm.attr( {
				"aria-posinset": ( i + 1 ),
				"aria-setsize": length,
				role: "menuitem"
			} );

			// if there is a submenu lets put in the aria for it
			if ( $subMenu.length !== 0 ) {

				$elm.attr( "aria-haspopup", "true" );

				$subMenu.attr( {
					"aria-expanded": "false",
					"aria-hidden": "true"
				} );

				// recurse into submenu
				drizzleAria( $subMenu.children( "li" ).find( menuItemSelector ) );
			}
		}
	},

	/**
	 * @method createCollapsibleSection
	 * @return {string}
	 */
	createCollapsibleSection = function( section, sectionIndex, sectionsLength, $items, itemsLength ) {

		// Use details/summary for the collapsible mechanism
		var k, $elm, elm, $item, $subItems, subItemsLength,
			$section = $( section ),
			posinset = "' aria-posinset='",
			menuitem = " role='menuitem' aria-setsize='",
			sectionHtml = "<li><details>" + "<summary class='mb-item" +
				( $section.hasClass( "wb-navcurr" ) || $section.children( ".wb-navcurr" ).length !== 0 ? " wb-navcurr'" : "'" ) +
				menuitem + sectionsLength + posinset + ( sectionIndex + 1 ) +
				"' aria-haspopup='true'>" + $section.text() + "</summary>" +
				"<ul class='list-unstyled mb-sm' role='menu' aria-expanded='false' aria-hidden='true'>";

		// Convert each of the list items into WAI-ARIA menuitems
		for ( k = 0; k !== itemsLength; k += 1 ) {
			$item = $items.eq( k );
			$elm = $item.find( menuItemSelector );
			elm = $elm[ 0 ];
			$subItems = $elm.parent().find( "> ul > li" );
			subItemsLength = $subItems.length;

			if ( elm && subItemsLength === 0 && elm.nodeName.toLowerCase() === "a" ) {
				sectionHtml += "<li>" + $item[ 0 ].innerHTML.replace(
						/(<a\s)/,
						"$1" + menuitem + itemsLength +
							posinset + ( k + 1 ) +
							"' tabindex='-1' "
					) + "</li>";
			} else {
				sectionHtml += createCollapsibleSection( elm, k, itemsLength, $subItems, $subItems.length );
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
		var panel = "",
			sectionHtml, properties, sections, section, parent, $items,
			href, linkHtml, i, j, len, sectionsLength, itemsLength;

		// Process the secondary and site menus
		len = allProperties.length;
		for ( i = 0; i !== len; i += 1 ) {
			properties = allProperties[ i ];
			sectionHtml = "";
			sections = properties[ 0 ];
			sectionsLength = sections.length;
			for ( j = 0; j !== sectionsLength; j += 1 ) {
				section = sections[ j ];
				href = section.getAttribute( "href" );
				$items = $( section.parentNode ).find( "> ul > li" );
				itemsLength = $items.length;

				// Collapsible section
				if ( itemsLength !== 0 ) {
					sectionHtml += createCollapsibleSection( section, j, sectionsLength, $items, itemsLength );
				} else {
					parent = section.parentNode;

					// Menu item without a section
					if ( parent.nodeName.toLowerCase() === "li" ) {
						linkHtml = parent.innerHTML;

					// Non-list menu item without a section
					} else {
						linkHtml = "<a href='" +
							parent.getElementsByTagName( "a" )[ 0 ].href + "'>" +
							section.innerHTML + "</a>";
					}

					// Convert the list item to a WAI-ARIA menuitem
					sectionHtml += "<li class='no-sect'>" +
						linkHtml.replace(
							/(<a\s)/,
							"$1 class='mb-item' " + "role='menuitem' aria-setsize='" +
								sectionsLength + "' aria-posinset='" + ( j + 1 ) +
								"' tabindex='-1' "
						) + "</li>";
				}
			}

			// Create the panel section
			panel += "<nav role='navigation' typeof='SiteNavigationElement' id='" +
				properties[ 1 ] + "' class='" + properties[ 1 ] + " wb-menu wb-menu-inited'>" +
				"<h3>" + properties[ 2 ] + "</h3>" +
				"<ul class='list-unstyled mb-menu' role='menu'>" +
				sectionHtml + "</ul></nav>";
		}

		return panel.replace( /['"]?list-group-item['"]?/gi, "\"\"" ) + "</div>";
	},

	/**
	 * @method onAjaxLoaded
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery DOM element} $ajaxResult The AJAXed in menu content to import
	 */
	onAjaxLoaded = function( $elm, $ajaxResult ) {
		var $ajaxed = $ajaxResult && $ajaxResult.attr( "data-type" ) === "string" ? $ajaxResult : $elm,
			$menubar = $ajaxed.find( ".menu" ),
			$menu = $menubar.find( "> li > a" ),
			target = $elm.data( "trgt" ),
			$secnav = $( "#wb-sec" ),
			$info = $( "#wb-info" ),
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
			if ( $secnav.length !== 0 ) {
				allProperties.push( [
					$secnav.find( "> ul > li > *:first-child" ).get(),
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
				if ( !$menubar.attr( "role" ) ) {
					$menubar.attr( "role", "menubar" );
				}

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
		$panel
			.trigger( "wb-init.wb-overlay" )
			.find( "summary" )
				.attr( "tabindex", "-1" );
		$panel
			.find( ".mb-menu > li:first-child" )
				.find( ".mb-item" )
					.attr( "tabindex", "0" );

		/*
		 * Build the regular mega menu
		 */
		$ajaxed
			.find( ":discoverable" )
				.attr( "tabindex", "-1" );

		if ( $menu.length !== 0 ) {
			$menu[ 0 ].setAttribute( "tabindex", "0" );
			drizzleAria( $menu );
			$menu
				.filter( "[aria-haspopup=true]" )
					.append( "<span class='expicon glyphicon glyphicon-chevron-down'></span>" );
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
			$menuItem = $panel.find( "#sec-pnl .wb-navcurr.mb-item" );
			if ( $menuItem.attr( "aria-haspopup" ) === "true" ) {
				$menuItem
					.trigger( "click" )
					.parent()
						.prop( "open", "open" );
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}, 1 );
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
		index = index === menuItemsLength ? 0 : index === -1 ? menuItemsLength - 1 : index;

		// Move to the new menu item
		$menuItems.eq( index ).trigger( focusEvent );
	},

	/**
	 * @method menuClose
	 * @param {jQuery DOM element} $elm Parent of the element to close
	 * @param {boolean} removeActive Whether or not to keep the active class
	 */
	menuClose = function( $elm, removeActive ) {
		$elm
			.removeClass( "sm-open" )
			.children( ".open" )
				.removeClass( "open" )
				.attr( {
					"aria-hidden": "true",
					"aria-expanded": "false"
				} );

		if ( removeActive ) {
			$elm.removeClass( "active" );
		}
	},

	/**
	 * @method menuDisplay
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery event} menu The menu to display
	 */
	menuDisplay = function( $elm, menu ) {
		var menuLink = menu.children( "a" );

		menuClose( $elm.find( ".active" ), true );

		// Ignore if doesn't have a submenu
		if ( menuLink.attr( "aria-haspopup" ) === "true" ) {

			// Add the open state classes
			menu
				.addClass( "active sm-open" )
				.children( ".sm" )
					.addClass( "open" )
					.attr( {
						"aria-hidden": "false",
						"aria-expanded": "true"
					} );
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

// Touchscreen "touches" on menubar items should close the submenu if it is open
$document.on( "touchstart click", selector + " .item[aria-haspopup=true]", function( event ) {
	var isTouchstart = event.type === "touchstart",
		which = event.which,
		$this, $parent;

	// Ignore middle and right mouse buttons
	if ( isTouchstart || ( !which || which === 1 ) ) {
		event.preventDefault();
		$this = $( this );
		$parent = $this.parent();

		// Open the submenu if it is closed
		if ( !$parent.hasClass( "sm-open" ) ) {
			$this.trigger( "focusin" );

		// Close the open submenu for a touch event
		} else if ( isTouchstart ) {
			menuClose( $parent, true );
		}
	}
} );

// Click on menu items with submenus should open and close those submenus
$document.on( "click", selector + " [role=menu] [aria-haspopup=true]", function( event ) {
	var menuItem = event.currentTarget,
		parent = menuItem.parentNode,
		submenu = parent.getElementsByTagName( "ul" )[ 0 ],
		isOpen = submenu.getAttribute( "aria-hidden" ) === "false",
		menuItemOffsetTop, menuContainer;

		// Close any other open menus
		if ( !isOpen ) {
			$( parent )
				.closest( "[role^='menu']" )
					.find( "[aria-hidden=false]" )
						.parent()
							.find( "[aria-haspopup=true]" )
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

	submenu.setAttribute( "aria-expanded", !isOpen );
	submenu.setAttribute( "aria-hidden", isOpen );
} );

// Clicks and touches outside of menus should close any open menus
$document.on( "click touchstart", function( event ) {
	var $openMenus,
		which = event.which;

	// Ignore middle and right mouse buttons
	if ( event.type === "touchstart" || ( !which || which === 1 ) ) {
		$openMenus = $( selector + " .sm-open" );
		if ( $openMenus.length !== 0 &&
			$( event.target ).closest( selector ).length === 0 ) {

			menuClose( $openMenus, true );
		}
	}
} );

$document.on( "mouseover focusin", selector + " .item", function( event ) {
	var $elm = $( event.currentTarget ),
		$parent = $elm.parent(),
		$container = $parent.closest( selector );

	// Clear the timeout for open/closing menus
	clearTimeout( globalTimeout );

	if ( event.type === "focusin" ) {
		menuDisplay( $container, $parent );
	} else {
		globalTimeout = setTimeout( function() {
			menuDisplay( $container, $parent );
		}, hoverDelay );
	}
} );

/*
 * Keyboard bindings
 */
$document.on( "keydown", selector + " [role=menuitem]", function( event ) {
	var menuItem = event.currentTarget,
		which = event.which,
		$menuItem = $( menuItem ),
		hasPopup = $menuItem.attr( "aria-haspopup" ) === "true",
		$menu = $menuItem.parent().closest( "[role^='menu']" ),
		inMenuBar = $menu.attr( "role" ) === "menubar",
		$menuLink, $parentMenu, $parent, $subMenu, result,
		menuitemSelector, isOpen, menuItemOffsetTop, menuContainer;

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {

		// Tab key = Hide all sub-menus
		if ( which === 9 ) {
			menuClose( $( selector + " .active" ), true );

		// Menu item is within a menu bar
		} else if ( inMenuBar ) {

			// Left / right arrow = Previous / next menu item
			if ( which === 37 || which === 39 ) {
				event.preventDefault();
				menuIncrement(
					$menu.find( "> li > a" ),
					$menuItem,
					which === 37 ? -1 : 1
				);

			// Enter sub-menu
			} else if ( hasPopup && ( which === 13 || which === 38 || which === 40 ) ) {
				event.preventDefault();
				$parent = $menuItem.parent();
				$subMenu = $parent.find( ".sm" );

				// Open the submenu if it is not already open
				if ( !$subMenu.hasClass( "open" ) ) {
					menuDisplay( $menu.closest( selector ), $parent );
				}

				// Set focus on the first submenu item
				$subMenu.children( "li" ).eq( 0 ).find( menuItemSelector ).trigger( focusEvent );

			// Hide sub-menus and set focus
			} else if ( which === 27 ) {
				event.preventDefault();
				menuClose( $menu.closest( selector ).find( ".active" ), false );

			// Letters only
			} else if ( which > 64 && which < 91 ) {
				event.preventDefault();
				selectByLetter(
					which,
					$menuItem.parent().find( "> ul > li > a" ).get()
				);
			}

		// Menu item is not within a menu bar
		} else {
			menuitemSelector = menuItemSelector;

			// Up / down arrow = Previous / next menu item
			if ( which === 38 || which === 40 ) {
				event.preventDefault();
				menuIncrement(
					$menu.children( "li" ).find( menuitemSelector ),
					$menuItem,
					which === 38 ? -1 : 1
				);

			// Enter or right arrow with a submenu
			} else if ( hasPopup && ( which === 13 || which === 39 ) ) {
				$parent = $menuItem.parent();

				if ( which === 39 ) {
					event.preventDefault();
				}

				// If the menu item is a summary element
				if ( menuItem.nodeName.toLowerCase( "summary" ) ) {
					isOpen = !!$parent.attr( "open" );

					// Close any other open menus
					if ( !isOpen ) {
						$( parent )
							.closest( "[role^='menu']" )
								.find( "[aria-hidden=false]" )
									.parent()
										.find( "[aria-haspopup=true]" )
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

					// Ensure the menu is opened or stays open
					if ( ( !isOpen && which === 39 ) || ( isOpen && which === 13 ) ) {
						$menuItem.trigger( "click" );
					}

					// Update the WAI-ARIA states and move focus to
					// the first submenu item
					$parent.children( "ul" )
						.attr( {
							"aria-expanded": "true",
							"aria-hidden": "false"
						} )
						.find( "[role=menuitem]:first" )
							.trigger( "setfocus.wb" );
				}

			// Escape, left / right arrow without a submenu
			} else if ( which === 27 || which === 37 || which === 39 ) {
				$parent = $menu.parent();
				$parentMenu = $parent.closest( "[role^='menu']" );
				if ( which === 37 || which === 39 ) {
					event.preventDefault();
				}

				// If the parent menu is a menubar
				if ( $parentMenu.attr( "role" ) === "menubar" ) {
					$menuLink = $parent.children( "[href=#" + $menu.attr( "id" ) + "]" );

					// Escape key = Close menu and return to menu bar item
					if ( which === 27 ) {
						event.preventDefault();
						$menuLink.trigger( focusEvent );

						// Close the menu but keep the referring link active
						setTimeout( function() {
							menuClose( $menuLink.parent(), false );
						}, 100 );

					// Left / right key = Next / previous menu bar item
					} else if ( $parentMenu.attr( "role" ) === "menubar" ) {
						menuIncrement(
							$parentMenu.find( "> li > a" ),
							$menuLink,
							which === 37 ? -1 : 1
						);
					}

				// Escape or left arrow: Go up a level if there is a higher-level
				// menu or close the current submenu if there isn't
				} else if ( which !== 39 ) {
					$subMenu = $parentMenu.length !== 0 ? $menu : $menuItem;

					// There is a higher-level menu
					if ( $parentMenu.length !== 0 ) {
						event.preventDefault();
						$menu.closest( "li" )
							.find( menuitemSelector )
								.trigger( "click" )
								.trigger( "setfocus.wb" );

					// No higher-level menu but the current submenu is open
					} else if ( $menuItem.parent().children( "ul" ).attr( "aria-hidden" ) === "false" ) {
						event.preventDefault();
						$menuItem
							.trigger( "click" )
							.trigger( "setfocus.wb" );
					}
				}

			// Select a menu item in the current menu by the first letter
			} else if ( which > 64 && which < 91 ) {
				event.preventDefault();
				$parent = $menuItem.closest( "li" );

				// Try to find a match in the next siblings
				result = selectByLetter(
					which,
					$parent.nextAll().find( menuitemSelector ).get()
				);

				// If couldn't find a match, try the previous siblings
				if ( !result ) {
					result = selectByLetter(
						which,
						$parent.prevAll().find( menuitemSelector ).get()
					);
				}
			}
		}
	}
} );

// Close the mobile panel if switching to medium, large or extra large view
$document.on( "mediumview.wb largeview.wb xlargeview.wb", function() {
	var mobilePanel = document.getElementById( "mb-pnl" );
	if ( mobilePanel && mobilePanel.getAttribute( "aria-hidden" ) === "false" ) {
		$( mobilePanel ).trigger( "close.wb-overlay" );
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
