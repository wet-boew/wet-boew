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
	selectEvent = "sel" + selector,
	incrementEvent = "inc" + selector,
	displayEvent = "disp" + selector,
	navCurrentEvent = "navcurr.wb",
	i18n, i18nText,
	$document = wb.doc,

	// Used for half second delay on showing/hiding menus because of mouse hover
	hoverDelay = 500,
	menuCount = 0,
	globalTimeout = {},

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

			// Lets test to see if we have any
			if ( $elm.data( "ajax-fetch" ) ) {
				$document.trigger({
					type: "ajax-fetch.wb",
					element: $elm,
					fetch: $elm.data( "ajax-fetch" )
				});
			} else {

				// Trigger the navcurrent plugin
				$elm.trigger( navCurrentEvent, breadcrumb );
				$( "#wb-sec" ).trigger( navCurrentEvent, breadcrumb );
			}
		}
	},

	/**
	 * Lets leverage JS assigment deconstruction to reduce the code output
	 * @method expand
	 * @param {DOM element} element The plugin element
	 * @param {boolean} scopeitems ***Description needed***
	 */
	expand = function( element, scopeitems ) {
		var $elm = $( element ),
			elm = $elm.hasClass( pluginName ) ? $elm.data() : $elm.parents( selector )
				.first()
				.data(),
			items = scopeitems ? elm.items.has( element ) : elm.items;
		return [ elm.self, elm.menu, items, $elm ];
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
	 * @method onAjaxLoaded
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery DOM element} $ajaxed The AJAX'd in menu content to import
	 */
	onAjaxLoaded = function( $elm, $ajaxed ) {
		var $menubar = $ajaxed.find( "[role='menubar']" ),
			$menu = $menubar.find( ".item" ),

			// Optimized the code block to look to see if we need to import anything instead
			// of just doing a query with which could result in no result
			sectionPrefix = "mb-pnl-id-",
			target = $elm.data( "trgt" ),
			info = document.getElementById( "wb-info" ),
			secnav = document.getElementById( "wb-sec" ),
			$language = $( "#wb-lng" ),
			search = document.getElementById( "wb-srch" ),
			panel = "",
			navOpen = "<nav role='navigation'",
			siteNavElement = " typeof='SiteNavigationElement'",
			navClose = "</nav>",
			infoHtml = "",
			$onlypnl, $panel, sectionId, infoSections, i, len;

		/*
		 * Build the mobile panel
		 */

		// Add search
		if ( search !== null ) {
			panel += "<section class='srch-pnl'>" + search.innerHTML + "</section>";
		}
		
		// Add active language offer
		if ( $language.length !== 0 ) {
			panel += "<section class='lng-ofr'>" +
				"<h3>" + $language.children( "h2" ).html() + "</h3>" +
				$language.find( "li:not(.curr)" ).html() +
				"</section>";
		}

		// Add the secondary navigation
		if ( secnav !== null ) {
			panel += navOpen + siteNavElement + " class='sec-pnl'>" +
				secnav.innerHTML.replace( /list-group-item/gi, "" ) + navClose;
		}

		// Add the site menu
		if ( $menubar.length !== 0 ) {
			panel += navOpen + siteNavElement + " class='sm-pnl'>" +
				"<h3>" + $ajaxed.find( "h2" ).html() + "</h3>" +
				"<ul class='list-unstyled menu'>" +
				$menubar.html()
					.replace(
						/(id="|href="#)([^"]+)"/gi,
						"$1" + sectionPrefix + "$2\""
					) +
				"</ul>" + navClose;
		}

		// Add the site information
		if ( info !== null ) {
			infoSections = info.getElementsByTagName( "section" );
			len = infoSections.length;
			for ( i = 0; i !== len; i += 1 ) {
				sectionId = sectionPrefix + i;
				infoHtml += "<li>" +
					infoSections[ i ].innerHTML
						.replace( /<h3.*?>/, "<a href='#" + sectionId + "' class='item'>" )
						.replace( /<ul/, "<ul id='" + sectionId + "'" )
						.replace( /<\/h3>/, "</a>" ) +
					"</li>";
			}

			panel += navOpen + " class='info-pnl'>" +
				"<h3>" + info.getElementsByTagName( "h2" )[ 0 ].innerHTML + "</h3>" +
				"<ul class='list-unstyled menu'>" + infoHtml + "</ul>" + navClose;
		}

		// Sanitize the DOM
		panel = panel
			.replace( /(for|id)="([^"]+)"/gi, "$1='$2-imprt'" )
			.replace( /href="#([^"]+)"/gi, "href='#$1-imprt'" )
			.replace( /\srole="menu.*"/gi, "" )
			.replace( /h2>/gi, "h3>" );

		// Let's create the DOM Element
		$panel = $( "<div id='" + target +
				"' class='wb-overlay modal-content overlay-def wb-panel-r'>" +
				"<header class='modal-header'><div class='modal-title'>" +
				i18nText.menu  + "</div>" + "</header><div class='modal-body'>" +
				panel + "</div>" + "</div>" );

		// Let's add some features
		$panel.find( "[href^='#']" )
			.prepend( "<span class='expicon'></span>" );

		// Let's now populate the DOM since we have done all the work in a documentFragment
		$( "#" + target ).replaceWith( $panel );

		$panel.trigger( "wb-init.wb-overlay" );

		
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

		$onlypnl = $ajaxed.find( ".only-pnl" );

		// Lets ensure that we are only adding the navigation at this point
		if ( $onlypnl.length !== 0 ){
			$onlypnl.remove();
		}
		// Replace elements
		$elm.html( $ajaxed.html() );

		// Recalibrate context
		$elm.data({
			self: $elm,
			menu: $elm.find( "[role=menubar] .item" ),
			items: $elm.find( ".sm" )
		});

		// Trigger the navcurrent plugin
		$elm.trigger( navCurrentEvent, breadcrumb );
	},

	/**
	 * @method onSelect
	 * @param {jQuery event} event The current event
	 */
	onSelect = function( event ) {
		var $goTo = event.goTo,
			special = event.special;

		$goTo.trigger( "setfocus.wb" );
		if ( special || ( $goTo.hasClass( "item" ) && !$goTo.attr( "aria-haspopup" ) ) ) {
			onReset( $goTo.parents( selector ), true, special );
		}

	},

	/**
	 * @method onIncrement
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery event} event The current event
	 */
	onIncrement = function( $elm, event ) {
		var $links = event.cnode,
			next = event.current + event.increment,
			index = next >= $links.length ? 0 : next < 0 ? $links.length - 1 : next;

		$elm.trigger({
			type: selectEvent,
			goTo: $links.eq( index )
		});
	},

	/**
	 * @method onReset
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {boolean} cancelDelay Whether or not to delay the closing of the menus (false by default)
	 * @param {boolean} keepActive Whether or not to leave the active class alone (false by default)
	 */
	onReset = function( $elm, cancelDelay, keepActive ) {
		var id = $elm.attr( "id" ),
			$active = $elm.find( ".active" );

		// Clear any timeouts for open/closing menus
		clearTimeout( globalTimeout[ id ] );

		if ( cancelDelay ) {
			onClose( $active, !keepActive );
		} else {

			// Delay the closing of the menus
			globalTimeout[ id ] = setTimeout( function() {
				onClose( $active, true );
			}, hoverDelay );
		}
	},

	/**
	 * @method onClose
	 * @param {jQuery DOM element} $elm Parent of the element to close
	 * @param {boolean} removeActive Whether or not to keep the active class
	 */
	onClose = function( $elm, removeActive ) {
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
	 * @method onDisplay
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {jQuery event} event The current event
	 */
	onDisplay = function( $elm, event ) {
		var menuItem = event.ident,
			menuLink = menuItem.children( "a" );

		// Lets reset the menus with no delay to ensure no overlap
		onClose( $elm.find( ".active" ), true );

		// Ignore if doesn't have a submenu
		if ( menuLink.attr( "aria-haspopup" ) === "true" ) {

			// Add the open state classes
			menuItem
				.addClass( "active sm-open" )
				.find( ".sm" )
					.addClass( "open" )
					.attr({
						"aria-hidden": "false",
						"aria-expanded": "true"
					});
		}
	},

	/**
	 * @method onHoverFocus
	 * @param {jQuery event} event The current event
	 */
	onHoverFocus = function( event ) {
		var ref = expand( event.target ),
			$container = ref[ 0 ],
			$elm = ref[ 3 ];

		if ( $container ) {

			// Clear any timeouts for open/closing menus
			clearTimeout( globalTimeout[ $container.attr( "id" ) ] );

			$container.trigger({
				type: displayEvent,
				ident: $elm.parent(),
				cancelDelay: event.type === "focusin"
			});
		}
	},

	/**
	 * Causes clicks on panel menu items to open and close submenus (except for mouse)
	 * @method onPanelClick
	 * @param {jQuery event} event The current event
	 */
	onPanelClick = function( event ) {
		var which = event.which,
			$this;

		if ( which === 1 ) {
			event.preventDefault();
		} else if ( !which ) {
			event.preventDefault();
			$this = $( this );
			if ( $( "#wb-sm" ).find( ".nav-close" ).is( ":visible" ) ) {
				$this.trigger( "focusin" );
			} else if ( !which ) {
				event.preventDefault();
				onReset( $this, true );
			}
		}
	},

	/**
	 * Searches for the next link that has link text starting with a specific letter
	 * @method selectByLetter
	 * @param {integer} charCode The charCode of the letter to search for
	 * @param {DOM elements} links Collection of links to search
	 * @param {jQuery DOM element} $container Plugin element
	 */
	selectByLetter = function( charCode, links, $container ) {
		var len = links.length,
			keyChar = String.fromCharCode( charCode ),
			link, i;

		for ( i = 0; i !== len; i += 1 ) {
			link = links[ i ];
			if ( link.innerHTML.charAt( 0 ) === keyChar ) {
				$container.trigger({
					type: selectEvent,
					goTo: $( link )
				});
				return true;
			}
		}

		return false;
	};

// Bind the events of the plugin
$document.on( "timerpoke.wb " + initEvent  + " " + selectEvent + " ajax-fetched.wb " + incrementEvent + " " + displayEvent, selector, function( event ) {
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

	case "sel":
		onSelect( event );
		break;

	case "timerpoke":
	case "wb-init":

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			init( $elm );
		}
		break;

	case "inc":
		onIncrement( $elm, event );
		break;

	case "disp":
		if ( event.cancelDelay ) {
			onDisplay( $elm, event );
		} else {
			globalTimeout[ $elm.attr( "id" ) ] = setTimeout( function() {
				onDisplay( $elm, event );
			}, hoverDelay );
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
	onReset( $( event.target ).closest( ".wb-menu" ) );
});

// Panel clicks on menu items should open submenus
$document.on( "click vclick", selector + " .item[aria-haspopup]", onPanelClick );

/*
 * Menu Keyboard bindings
 */
$document.on( "mouseover focusin", selector + " .item", onHoverFocus );

$document.on( "keydown", selector + " .item", function( event ) {
	var elm = event.target,
		which = event.which,
		ref = expand( elm ),
		$container = ref[ 0 ],
		$menu = ref[ 1 ],
		$elm = ref[ 3 ],
		$parent, $subMenu;

	switch ( which ) {

	// Enter key, up/down arrow
	case 13:
	case 38:
	case 40:
		if ( $elm.find( ".expicon" ).length !== 0 ) {
			event.preventDefault();
			$parent = $elm.parent();
			$subMenu = $parent.find( ".sm" );

			// Open the submenu if it is not already open
			if ( !$subMenu.hasClass( "open" ) ) {
				$container.trigger({
					type: displayEvent,
					ident: $parent,
					cancelDelay: true
				});
			}

			$container.trigger({
				type: selectEvent,
				goTo: $subMenu.find( "a" ).first()
			});
		}
		break;

	// Tab/escape key
	case 9:
	case 27:
		onReset( $container, true, ( which === 27 ) );
		break;

	// Left/right arrow
	case 37:
	case 39:
		event.preventDefault();
		$container.trigger({
			type: incrementEvent,
			cnode: $menu,
			increment: ( which === 37 ? -1 : 1 ),
			current: $menu.index( $elm )
		});
		break;

	default:

		// Letters only
		if ( which > 64 && which < 91 ) {
			event.preventDefault();
			selectByLetter(
				which,
				$elm.parent().find( "ul a" ).get(),
				$container
			);
		}
	}
});

/*
 * Item Keyboard bindings
 */
$document.on( "keydown", selector + " [role=menu]", function( event ) {
	var elm = event.target,
		which = event.which,
		ref = expand( elm, true ),
		$container = ref[ 0 ],
		$menu = ref[ 1 ],
		$items = ref[ 2 ],
		$elm = ref[ 3 ],
		$links = $items.find( ":focusable" ),
		selector = "[href=#" + $items.attr( "id" ) + "]",
		$parent, result;

	switch ( which ) {

	// Escape key/left arrow
	case 27:
		event.preventDefault();
		$container.trigger({
			type: selectEvent,
			goTo: $menu.filter( selector ),
			special: "reset"
		});
		break;

	// Left/right arrow
	case 37:
	case 39:
		event.preventDefault();
		$container.trigger({
			type: incrementEvent,
			cnode: $menu,
			increment: ( which === 37 ? -1 : 1 ),
			current: $menu.index( $menu.filter( selector ) )
		});
		break;

	// Up/down arrow
	case 38:
	case 40:
		event.preventDefault();
		$container.trigger({
			type: incrementEvent,
			cnode: $links,
			increment: ( which === 38 ? -1 : 1 ),
			current: $links.index( $elm )
		});
		break;

	// Tab key
	case 9:
		onReset( $container, true );
		break;

	default:

		// Letters only
		if ( which > 64 && which < 91 ) {
			event.preventDefault();
			$parent = $elm.parent();

			// Try to find a match in the next siblings
			result = selectByLetter(
				which,
				$parent.nextAll().find( "a" ).get(),
				$container
			);

			// If couldn't find a match, try the previous siblings
			if ( !result ) {
				result = selectByLetter(
					which,
					$parent.prevAll().find( "a" ).get(),
					$container
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

// Handle clicks in the mobile panel
$document.on( "click vclick", "#mb-pnl a[href^=#]", function() {
	var $elm = $( this ),
		$parent = $elm.parent(),
		$panel = $parent.closest( "#mb-pnl" ),
		state = $parent.hasClass( "active" );

	onClose( $panel.find( ".active" ), true );

	if ( !state ) {
		$panel
			.find( $elm.attr( "href" ) )
				.addClass( "open" )
				.attr({
					"aria-hidden": "false",
					"aria-expanded": "true"
				})
				.parent()
					.addClass( "active" );
	}

	return false;
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
