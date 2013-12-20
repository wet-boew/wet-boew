/**
 * @title WET-BOEW Menu plugin
 * @overview A Menu plugin for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var pluginName = "wb-menu",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	breadcrumb = document.getElementById( "wb-bc" ),
	navCurrentEvent = "navcurr.wb",
	focusEvent = "setfocus.wb",
	i18n, i18nText,
	$document = wb.doc,

	// Used for half second delay on showing/hiding menus because of mouse hover
	hoverDelay = 500,
	menuCount = 0,
	globalTimeout,

	/**
	 * Lets set some aria states and attributes
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	init = function( $elm ) {

		// Only initialize the element once
		if ( !$elm.hasClass( initedClass ) ) {
			wb.remove( selector );
			$elm.addClass( initedClass );

			// Ensure the container has an id attribute
			if ( !$elm.attr( "id" ) ) {
				$elm.attr( "id", pluginName + "-" + menuCount );
			}
			menuCount += 1;

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					menu: i18n( "menu" )
				};
			}

			// Lets test to see if we have any menus to fetch
			if ( $elm.data( "ajax-fetch" ) ) {
				$document.trigger({
					type: "ajax-fetch.wb",
					element: $elm,
					fetch: $elm.data( "ajax-fetch" )
				});
			} else {
				onAjaxLoaded( $elm, $elm );
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
			$subMenu = $elm.siblings( ".sm" );

			$elm.attr({
				"aria-posinset": ( i + 1 ),
				"aria-setsize": length,
				role: "menuitem"
			});

			// if there is a submenu lets put in the aria for it
			if ( $subMenu.length !== 0 ) {

				$elm.attr( "aria-haspopup", "true" );

				$subMenu.attr({
					"aria-expanded": "false",
					"aria-hidden": "true"
				});

				// recurse into submenu
				drizzleAria( $subMenu.find( ":discoverable" ) );
			}
		}
	},

	/**
	 * @method createMobilePanelMenu
	 * @param {array} allProperties Properties used to build the menu system
	 * @return {string}
	 */
	createMobilePanelMenu = function( allProperties ) {
		var navOpen = "<nav role='navigation'",
			siteNavElement = " typeof='SiteNavigationElement'",
			navClose = "</nav>",
			detailsOpen = "<li><details>",
			detailsClose = "</details></li>",
			listOpen = "<ul class='list-unstyled ",
			menuItemReplace1 = "role='menuitem' aria-setsize='",
			menuItemReplace2 = "' aria-posinset='",
			menuItemReplace3 = "' tabindex='-1' ",
			summaryOpen = "<summary class='mb-item' " + menuItemReplace1,
			summaryClose = "</summary>",
			panel = "",
			sectionHtml, properties, sections, section, parent, items,
			href, linkHtml, i, j, k, len, len2, len3;
	
		// Process the secondary and site menus
		len = allProperties.length;
		for ( i = 0; i !== len; i += 1 ) {
			properties = allProperties[ i ];
			sectionHtml = "";
			sections = properties[ 0 ];
			len2 = sections.length;
			for ( j = 0; j !== len2; j += 1 ) {
				section = sections[ j ];
				href = section.getAttribute( "href" );
				items = section.parentNode.getElementsByTagName( "li" );
				len3 = items.length;

				// Collapsible section
				if ( len3 !== 0 && ( !href || href.charAt( 0 ) === "#" ) ) {

					// Use details/summary for the collapsible mechanism
					sectionHtml += detailsOpen +
						summaryOpen + len2 + menuItemReplace2 +
						( j + 1 ) + "' aria-haspopup='true'>" +
						section.innerHTML + summaryClose +
						listOpen + "mb-sm' role='menu' aria-expanded='false' aria-hidden='true'>";

					// Convert each of the list items in WAI-ARIA menuitems
					for ( k = 0; k !== len3; k += 1 ) {
						sectionHtml += "<li>" + items[ k ].innerHTML.replace(
								/(<a\s)/,
								"$1 " + menuItemReplace1 + len3 +
									menuItemReplace2 + ( k + 1 ) +
									menuItemReplace3
							) + "</li>";
					}

					sectionHtml += "</ul>" + detailsClose;
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
							"$1 class='mb-item' " + menuItemReplace1 +
								len2 + menuItemReplace2 + ( j + 1 ) +
								menuItemReplace3
						) + "</li>";
				}
			}

			// Create the panel section
			panel += navOpen + siteNavElement + " id='" + properties[ 1 ] +
				"' class='" + properties[ 1 ] + " wb-menu'>" +
				"<h3>" + properties[ 2 ] + "</h3>" +
				listOpen + "mb-menu' role='menu'>" +
				sectionHtml + "</ul>" + navClose;
		}

		return panel.replace( /list-group-item/gi, "" ) + "</div>";
	},
	
	/**
	 * @method onAjaxLoaded
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery DOM element} $ajaxed The AJAX'd in menu content to import
	 */
	onAjaxLoaded = function( $elm, $ajaxed ) {
		var $menubar = $ajaxed.find( ".menu" ),
			$menu = $menubar.find( "> li > a" ),
			target = $elm.data( "trgt" ),
			$secnav = $( "#wb-sec" ),
			$info = $( "#wb-info" ),
			$language = $( "#wb-lng" ),
			search = document.getElementById( "wb-srch" ),
			panel = "",
			allProperties = [],
			$panel, $navCurr, $menuItem, len, i;

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
			panel += "<section class='lng-ofr'>" +
				"<h3>" + $language.children( "h2" ).html() + "</h3>" +
				"<ul class='list-inline'>" +
				$language.find( "li:not(.curr)" ).html()
					.replace( /(<a\s.*<\/a>?)/, "<li>$1</li>" ) +
				"</ul></section>";
		}

		// Create menu system
		if ( $secnav.length !== 0 || $menubar.length !== 0 || $info.length !== 0 ) {

			// Add the secondary menu
			if ( $secnav.length !== 0 ) {
				allProperties.push([
					$secnav.find( "> ul > li > a" ).get(),
					"sec-pnl",
					$secnav.find( "h2" ).html()
				]);

				if ( $secnav.find( ".wb-navcurr" ).length === 0 ) {

					// Trigger the navcurrent plugin
					$secnav.trigger( navCurrentEvent, breadcrumb );
				}
			}

			// Add the site menu
			if ( $menubar.length !== 0 ) {
				allProperties.push([
					$menu.get(),
					"sm-pnl",
					$ajaxed.find( "h2" ).html()
				]);
			}

			// Add the site information
			if ( $info.length !== 0 ) {
				allProperties.push([
					$info.find( "h3" ),
					"info-pnl",
					$info.find( "h2" ).html()
				]);

				if ( $info.find( ".wb-navcurr" ).length === 0 ) {

					// Trigger the navcurrent plugin
					$info.trigger( navCurrentEvent, breadcrumb );
				}
			}
			
			panel += createMobilePanelMenu( allProperties );
		}

		// Let's create the DOM Element
		$panel = $( "<div id='" + target +
				"' class='wb-overlay modal-content overlay-def wb-panel-r'>" +
				"<header class='modal-header'><div class='modal-title'>" +
				i18nText.menu  + "</div></header><div class='modal-body'>" +
				panel + "</div></div>" );

		// Let's now populate the DOM since we have done all the work in a documentFragment
		$( "#" + target ).replaceWith( $panel );

		$panel
			.trigger( "wb-init.wb-overlay" )
			.find( "summary" )
				.trigger( "wb-init.wb-details" )
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

		$menu.eq( 0 ).attr( "tabindex", "0" );
		$menu
			.filter( "[href^=#]" )
				.append( "<span class='expicon'></span>" );

		drizzleAria( $menu );

		// Replace elements
		$elm.html( $ajaxed.html() );

		// Trigger the navcurrent plugin
		setTimeout(function() {
			$elm.trigger( navCurrentEvent, breadcrumb );
			$panel.find( "#sm-pnl" ).trigger( navCurrentEvent, breadcrumb );

			// Open up each menu with the wb-navcurr class
			$navCurr = $panel.find( ".wb-navcurr" );
			len = $navCurr.length;
			for ( i = 0; i !== len; i += 1 ) {
				$menuItem = $navCurr.eq( i );

				// If not at the top level, check to see if the parent menu
				// link has the wb-navcurr class already. If not, then
				// click on the parent menu item.
				if ( !$menuItem.hasClass( ".mb-item" ) ) {
					$menuItem = $menuItem
									.closest( "details" )
										.children( "summary" )
											.addClass( "wb-navcurr" );
				}

				// Only click on the menu item if it has a submenu
				if ( $menuItem.attr( "aria-haspopup" ) === "true" ) {
					$menuItem.trigger( "click" );
				}
			}
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
				.attr({
					"aria-hidden": "true",
					"aria-expanded": "false"
				});

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
					.attr({
						"aria-hidden": "false",
						"aria-expanded": "true"
					});
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
$document.on( "timerpoke.wb " + initEvent + " ajax-fetched.wb", selector, function( event ) {

	var elm = event.target,
		eventType = event.type,
		$elm = $( elm );

	switch ( eventType ) {
	case "ajax-fetched":

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			onAjaxLoaded( $elm, event.pointer );
		}
		return false;

	case "timerpoke":
	case "wb-init":

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			init( $elm );
		}
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

$document.on( "mouseleave", selector + " .menu", function( event ) {
	// Clear the timeout for open/closing menus
	clearTimeout( globalTimeout );

	globalTimeout = setTimeout( function() {
		menuClose( $( event.currentTarget ).find( ".active" ), true );
	}, hoverDelay );
});

// Touchscreen "touches" on menubar items should close the submenu if it is open
$document.on( "touchstart click", selector + " .item[aria-haspopup=true]", function( event ) {
	var isTouchstart = event.type === "touchstart",
		$this, $parent;

	// Ignore middle and right mouse buttons
	if ( isTouchstart || event.which === 1 ) {
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
});

// Click on menu items with submenus should open and close those submenus
$document.on( "click", selector + " [role=menu] [aria-haspopup=true]", function( event ) {
	var submenu = event.currentTarget.parentNode.getElementsByTagName( "ul" )[ 0 ],
		isOpen = submenu.getAttribute( "aria-hidden" ) === "false";

	submenu.setAttribute( "aria-expanded", !isOpen );
	submenu.setAttribute( "aria-hidden", isOpen );
});

// Clicks and touches outside of menus should close any open menus
$document.on( "click touchstart", function( event ) {
	var $openMenus;

	// Ignore middle and right mouse buttons
	if ( event.type === "touchstart" || event.which === 1 ) {
		$openMenus = $( selector + " .sm-open" );
		if ( $openMenus.length !== 0 &&
			$( event.target ).closest( selector ).length === 0 ) {

			menuClose( $openMenus, true );
		}
	}
});

$document.on( "mouseover focusin", selector + " .item", function(event) {
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
});

/*
 * Keyboard bindings
 */
$document.on( "keydown", selector + " [role=menuitem]", function( event ) {
	var elm = event.currentTarget,
		which = event.which,
		$elm = $( elm ),
		hasPopup = $elm.attr( "aria-haspopup" ) === "true",
		$menu = $elm.parent().closest( "[role^='menu']" ),
		inMenuBar = $menu.attr( "role" ) === "menubar",
		$menuLink, $parentMenu, $parent, $subMenu, result,
		menuitemSelector, isOpen;

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
				$elm,
				which === 37 ? -1 : 1
			);

		// Enter sub-menu
		} else if ( hasPopup && ( which === 13 || which === 38 || which === 40 ) ) {
			event.preventDefault();
			$parent = $elm.parent();
			$subMenu = $parent.find( ".sm" );

			// Open the submenu if it is not already open
			if ( !$subMenu.hasClass( "open" ) ) {
				menuDisplay( $menu.closest( selector ), $parent );
			}

			// Set focus on the first submenu item
			$subMenu.find( "a:first" ).trigger( focusEvent );
		
		// Hide sub-menus and set focus
		} else if ( which === 27 ) {
			event.preventDefault();
			menuClose( $menu.closest( selector ).find( ".active" ), false );

		// Letters only
		} else if ( which > 64 && which < 91 ) {
			event.preventDefault();
			selectByLetter(
				which,
				$elm.parent().find( "> ul > li > a" ).get()
			);
		}

	// Menu item is not within a menu bar
	} else {
		menuitemSelector = "> a, > details > summary";
	
		// Up / down arrow = Previous / next menu item
		if ( which === 38 || which === 40 ) {
			event.preventDefault();
			menuIncrement(
				$menu.children( "li" ).find( menuitemSelector ),
				$elm,
				which === 38 ? -1 : 1
			);

		// Enter or right arrow with a submenu
		} else if ( hasPopup && ( which === 13 || which === 39 ) ) {
			$parent = $elm.parent();

			if ( which === 39 ) {
				event.preventDefault();
			}

			// If the menu item is a summary element
			if ( elm.nodeName.toLowerCase( "summary" ) ) {
				isOpen = !!$parent.attr( "open" );

				// Ensure the menu is opened or stays open
				if ( ( !isOpen && which === 39 ) || ( isOpen && which === 13 ) ) {
					$elm.trigger( "click" );
				}

				// Update the WAI-ARIA states and move focus to
				// the first submenu item
				$parent.children( "ul" )
					.attr({
						"aria-expanded": "true",
						"aria-hidden": "false"
					})
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
					setTimeout(function() {
						menuClose( $menuLink.parent(), false );
					}, 1 );
				
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
				$subMenu = $parentMenu.length !== 0 ? $menu : $elm;

				// There is a higher-level menu
				if ( $parentMenu.length !== 0 ) {
					event.preventDefault();
					$menu.closest( "li" )
						.find( menuitemSelector )
							.trigger( "click" )
							.trigger( "setfocus.wb" );

				// No higher-level menu but the current submenu is open
				} else if ( $elm.parent().children( "ul" ).attr( "aria-hidden" ) === "false" ) {
					event.preventDefault();
					$elm
						.trigger( "click" )
						.trigger( "setfocus.wb" );
				}
			}

		// Select a menu item in the current menu by the first letter
		} else if ( which > 64 && which < 91 ) {
			event.preventDefault();
			$parent = $elm.closest( "li" );

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
});

// Close the mobile panel if switching to medium, large or extra large view
$document.on( "mediumview.wb largeview.wb xlargeview.wb", function() {
	var mobilePanel = document.getElementById( "mb-pnl" );
	if ( mobilePanel && mobilePanel.getAttribute( "aria-hidden" ) === "false" ) {
		$( mobilePanel ).trigger( "close.wb-overlay" );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
