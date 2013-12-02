/**
 * @title Tabbed Interface
 * @overview Dynamically stacks multiple sections of content, transforming them into a tabbed interface
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-tabs",
	$document = wb.doc,
	$window = wb.win,
	tablistProps = { role: "tablist", class: "btn-group", "aria-live": "off" },
	panelProps = { role: "tabpanel" },

	// Includes "xsmallview" and "xxsmallview"
	mobileViewPattern = "xsmallview",
	mobile = {
		summaryProps: { "aria-hidden": false, role: "button", tabindex: 0 },
		tabProps: { tabindex: -1 }
	},
	desktop = {
		summaryProps: { "aria-hidden": true, role: "presentation", tabindex: -1 },
		tabProps: { role: "tab", tabindex: -1 }
	},
	// wb.pageUrlParts.hash is a string - empty or otherwise.
	// hash.match will return null if hash is empty or if no match is found.
	hash = wb.pageUrlParts.hash.match( /#t(\d+)-p(\d+)/ ),

	// boolean to disable hashchange event listener on tab click,
	// but re-enable it for any other case
	ignoreHashChange = false,

	/**
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	init = function( $elm ) {
		var $tablist = $( "<div/>", tablistProps ),
			$panels = $elm.children( "details" ),
			isMobile = document.documentElement.className.indexOf( mobileViewPattern ) !== -1,
			classes = $elm.data( "btnClass" ) || "btn btn-default",
			$tab, $tabs, $open;

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		wb.remove( selector );

		if ( !$panels.length ) {
			return false;
		}

		// Transform each details/summary into tab/panel.
		$panels
			.each(function() {
				var $summary = $( this ).children( "summary" );
				$tab = $( "<button/>", { type: "button", role: "tab", class: classes, tabindex: -1 } )
					.text( $summary.text() );
				$tablist.append( $tab );
				$summary.attr( isMobile ? mobile.summaryProps : desktop.summaryProps );
			})
			.attr( panelProps );
		$elm.prepend( $tablist );
		$tabs = $tablist.children();

		// Make sure other events have access to this plugin instance's tabs and panels.
		// $elm will be passed as event data when triggering events.
		$elm.data({
			"tabs": $tabs,
			"panels": $panels
		});

		// Check if the developer set a details element to open by default.
		// If they set more than one to open, pick the first one only.
		$open = $panels.filter( "[open]" ).eq( 0 );

		// Default panel to show. Order of precedence is: 1. hash 2. open attribute 3. first panel.
		if ( hash ) {

			// 1. hash
			if ( $( selector ).index( $elm ) === hash[ 1 ] - 1 ) {
				$tab = $tabs.eq( hash[ 2 ] - 1 );
			}
		} else if ( $open.length ) {

			// 2. open attribute
			$tab = $tabs.eq( $panels.index( $open ) );
		} else {

			// 3. first panel
			$tab = $tabs.eq( 0 );
		}

		$tab.trigger({
			type: "click",
			elm: "$elm"
		});
	},

	onClick = function( event ) {
		var $tab = $( event.currentTarget ),
			$elm = $tab.parent().parent(),
			$tabs = $elm.data( "tabs" ),
			tabsIndex = $tabs.index( $tab ),
			$panels = $tabs.parent().parent().find( "[role=tabpanel]" ),
			$panel = $panels.eq( tabsIndex ),
			classes = $elm.data( "btnClass" ) || "btn btn-default",
			isMobile = document.documentElement.className.indexOf( mobileViewPattern ) !== -1,
			hasEqualize = $elm.hasClass( "equalize" );

		$tabs.not( $tab ).attr({
			class: classes,
			tabindex: -1
		});
		$tab.attr({
			class: classes + " active",
			tabindex: 0
		});

		$panel
			.children( "summary" )
				.trigger( "click" );
		if ( !isMobile ) {
			$panels
				.not( $panel )
					.attr( "open", false );
			$panel.attr( "open", true );
		}

		// Don't trigger onHashChange
		ignoreHashChange = true;
		window.location.hash = "#t" +
			( 1 + $( selector ).index( $tab.parent().parent() ) ) +
			"-p" +
			( 1 + tabsIndex );

		// Handle equalizing panel heights
		if ( !isMobile && hasEqualize ) {
			$panels.height( getMaxHeight( $panels ) );
		} else if ( hasEqualize ) {
			$panels.height( "auto" );
		}
		event.preventDefault();
	},

	onBtnKeyDown = function( event ) {
		var which = event.which,
			$tab = $( event.currentTarget ),
			$tabs = $tab.parent().children(),
			tabsIndex = $tabs.index( $tab ),
			tabsLength = $tabs.length,
			next;

		switch ( which ) {

		// Left / up / right / down
		case 37:
		case 38:
		case 39:
		case 40:

			next = $tabs.eq( ( tabsIndex + ( which < 39 ? -1 : 1 ) ) % tabsLength );
			next
				.trigger( "click" )
				.trigger( "setfocus.wb" );
			event.preventDefault();
			break;

		// Enter / spacebar
		case 13:
		case 32:
			$tabs
				.parent()
					.parent()
					.find( "[role=tabpanel]" )
						.eq( tabsIndex )
							.trigger( "setfocus.wb" );
			event.preventDefault();
			break;
		}
	},

	onHashChange = function( event ) {
		var pluginNum, panelNum;
		hash = window.location.hash.match( /#t(\d+)-p(\d+)/ );

		// Use a virtual hash of the form #wb-tabs2-panel4 to figure out which panel to open.
		// Only use hash to click if click didn't trigger hash change. Ignore otherwise.
		if ( !ignoreHashChange && hash ) {
			pluginNum = hash[ 1 ];
			panelNum = hash[ 2 ];

			// There can be multiple instance of the plugin on the page.
			$( selector )
				.eq( pluginNum - 1 )
				.find( "[role=tablist] button" )
					.eq( panelNum - 1 )
						.trigger({
							type: "click",
							elm: "$elm"
						});
		}

		// Make sure listener is re-enabled
		ignoreHashChange = false;
		event.preventDefault();
	},

	onResize = function( event ) {
		var eventType = event.type,
			$elms = $document.find( selector ),
			$summaries = $(),
			$tabs = $(),
			len = $elms.length,
			i, $elm;

		for ( i = 0; i !== len; i += 1 ) {
			$elm = $elms.eq( i );
			$summaries = $summaries.add( $elm.data( "panels" ).children( "summary" ) );
			$tabs = $tabs.add( $elm.data( "tabs" ) );
		}

		switch ( eventType ) {
		case "xxsmallview":
		case "xsmallview":

			// Switch to mobile view
			$summaries
				.attr( mobile.summaryProps )
				.parent()
					.height( "auto" );
			$tabs.attr( mobile.tabProps );
			break;

		case "smallview":
		case "mediumview":
		case "largeview":
		case "xlargeview":

			// Switch to desktop view
			$summaries.attr( desktop.summaryProps );
			$tabs
				.attr( desktop.tabProps )
				.filter( ".active" )
					.attr( "tabindex", 0 );
			break;
		}
	},

	getHeight = function( elm ) {
		var style = elm.style,
			open = elm.open,
			visibility = style.visibility,
			position = style.position,
			display = style.display,
			height;
		style.visibility = "hidden";
		style.position = "absolute";
		style.display = "block";
		elm.open = true;
		height = $( elm ).height();
		elm.open = open;
		style.display = display;
		style.position = position;
		style.visibility = visibility;
		return height;
	},

	getMaxHeight = function( elms ) {
		var i, height,
			len = elms.length,
			maxHeight = null;
		for ( i = 0; i !== len; i += 1 ) {
		    height = getHeight( elms[ i ] );
		    maxHeight = height > maxHeight ? height : maxHeight;
		}
		return maxHeight;
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function( event ) {
	if ( event.currentTarget === event.target ) {
		init( $( this ) );
	}
});

$document.on( "click vclick keydown", selector + " [role=tab]", function( event ) {
	if ( event.type === "keydown" ) {
		onBtnKeyDown( event );
	} else {
		onClick( event );
	}
});

// These events only fire at the document level
$document.on( "xxsmallview.wb xsmallview.wb smallview.wb mediumview.wb largeview.wb xlargeview.wb", onResize );

// This event only fires on the window
$window.on( "hashchange", onHashChange );

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
