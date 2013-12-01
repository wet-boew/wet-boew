/*
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
	tablistProps = { role: "tablist", class: "btn-group", "aria-live": "off" },
	panelProps = { role: "tabpanel" },
	mobileWidth = 767,
	mobile = {
		summaryProps: { "aria-hidden": false, role: "button", tabindex: 0 },
		tabProps: { tabindex: -1 }
	},
	desktop = {
		summaryProps: { "aria-hidden": true, role: "presentation", tabindex: -1 },
		tabProps: { tabindex: -1 }
	},
	// wb.pageUrlParts.hash is a string - empty or otherwise.
	// hash.match will return null if hash is empty or if no match is found.
	hash = wb.pageUrlParts.hash.match( /#t(\d+)-p(\d+)/ ),
	
	// boolean to disable hashchange event listener on tab click,
	// but re-enable it for any other case
	ignoreHashChange = false,
	
	/*
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	init = function( $elm ) {
		var $tablist = $( "<div/>", tablistProps ),
			$tab,
			$tabs,
			$panels = $elm.children( "details" ),
			isMobile = $document.width() < mobileWidth,
			$open,
			classes = $elm.data( "btnClass" ) || "btn btn-default";
		
		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		wb.remove( selector );
		
		if ( !$panels.length ) {
			return false;
		}

		// Transform each details/summary into tab/panel.
		$panels
			.each(function() {
				var $summary = $( this ).children( "summary" );
				$tab = $( "<button/>", { type: "button", class: classes, tabindex: -1 } )
					.text( $summary.text() )
					.on( "click vclick", { elm: $elm }, onClick )
					.on( "keydown", { elm: $elm }, onBtnKeyDown);
				$tablist.append( $tab );
				$summary
					.attr( isMobile ? mobile.summaryProps : desktop.summaryProps )
					.on( "click", { tab: $tab }, function( event ) {
						event.data.tab.trigger({
							type: "click",
							elm: "$elm"
						});
						event.preventDefault();
					})
					.on( "keydown",
						{ tabs: $summary.add( $summary.parent().siblings( "details" ).children( "summary" ) ) },
						onBtnKeyDown );
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
				$tabs.eq( hash[ 2 ] - 1 ).trigger({
					type: "click",
					elm: "$elm"
				});
			}
		} else if ( $open.length ) {
			// 2. open attribute
			$tabs.eq( $panels.index( $open ) ).trigger({
				type: "click",
				elm: "$elm"
			});
		} else {
			// 3. first panel
			$tabs.eq( 0 ).trigger({
				type: "click",
				elm: "$elm"
			});
		}
	},
	
	onClick = function( event ) {
		var $elm = event.data.elm,
			$tab = $( event.target ),
			$tabs = $elm.data( "tabs" ),
			$panels = $elm.data( "panels" ),
			$panel = $panels.eq( $tabs.index( $tab ) ),
			width,
			classes = $elm.data( "btnClass" ) || "btn btn-default";
		$tabs.not( $tab ).attr( { class: classes, tabindex: -1 } );
		$tab.attr( { class: classes + " active", tabindex: 0 } );
		$panels.not( $panel ).attr( "open", false );
		$panel.attr( "open", true );
		
		// don't trigger onHashChange
		ignoreHashChange = true;
		window.location.hash = "#t" +
			( 1 + $( selector ).index( $tab.parent().parent() ) ) +
			"-p" +
			( 1+ $tabs.index( $tab ) );
		
		// handle equalizing panel heights
		width = $document.width();
		if ( width > mobileWidth && $elm.hasClass( "equalize" ) ) {
			$panels.height( getMaxHeight( $panels ) );
		} else if ( width <= mobileWidth && $elm.hasClass( "equalize" ) ) {
			$panels.height( "auto" );
		}
		event.preventDefault();
	},
	
	onBtnKeyDown = function( event ) {
		var next, $tab, $tabs, $panels,
			key = event.which;
		$tab = $( event.target );
		$tabs = event.data.elm ? event.data.elm.data( "tabs" ) : event.data.tabs;
		$panels = event.data.elm ? event.data.elm.data( "panels" ) : event.data.tabs.parent();
		switch (key) {
		case 37: // left
		case 38: // up
			next = $tabs.eq( ( $tabs.index( $tab ) - 1 ) % $tabs.length );
			next.trigger({
				type: "click",
				elm: "$elm"
			}).trigger( "setfocus.wb" );
			event.preventDefault();
			break;
		case 39: // right
		case 40: // down
			next = $tabs.eq( ( $tabs.index( $tab ) + 1 ) % $tabs.length );
			next.trigger({
				type: "click",
				elm: "$elm"
			}).trigger( "setfocus.wb" );
			event.preventDefault();
			break;
		case 13: // enter
		case 32: // space
			$panels.eq( $tabs.index( $tab ) ).trigger( "setfocus.wb" );
			event.preventDefault();
			break;
		}
	},
	
	onHashChange = function( event ) {
		var pluginNum, panelNum, $plugin, $tab;
		hash = window.location.hash.match( /#t(\d+)-p(\d+)/ );
		// Use a virtual hash of the form #wb-tabs2-panel4 to figure out which panel to open.
		// Only use hash to click if click didn't trigger hash change. Ignore otherwise.
		if ( !ignoreHashChange && hash ) {
			pluginNum = hash[ 1 ];
			panelNum = hash[ 2 ];
			// There can be multiple instance of the plugin on the page.
			$plugin = $( selector ).eq( pluginNum - 1 );
			$tab = $plugin
				.children( "[role=tablist]" )
					.children( "button" )
						.eq( panelNum - 1 );
			$tab.trigger({
				type: "click",
				elm: "$elm"
			});
		}
		// make sure listener is re-enabled
		ignoreHashChange = false;
		event.preventDefault();
	},
	
	onResize = function( event, $elms ) {
		var eventType = event.type,
			width = $document.width(),
			$summaries = $(),
			$tabs = $();
		
		$elms.each(function() {
			$summaries = $summaries.add( $( this ).data( "panels" ).children( "summary" ) );
			$tabs = $tabs.add( $( this ).data( "tabs" ) );
		});
		switch( eventType ) {
		case "xxsmallview":
		case "xsmallview":
		case "smallview":
			// width === movileWidth seems to be ignored/skipped by the resize plugin, so < > suffices.
			if ( width < mobileWidth ) {
				// switch to mobile view
				$summaries.attr( mobile.summaryProps );
				$tabs.attr( mobile.tabProps );
				$summaries.parent().height( "auto" );
			}
			break;
		case "mediumview":
		case "largeview":
		case "xlargeview":
			if ( width > mobileWidth ) {
				// switch to desktop view
				$summaries.attr( desktop.summaryProps );
				$tabs.attr( desktop.tabProps );
				$tabs.filter( ".active" ).attr( "tabindex", 0 );
			}
			break;
		}
	},
	
	getHeight = function( elm ) {
		var s = elm.style,
			o = elm.open,
			v = s.visibility,
			p = s.position,
			d = s.display,
			h;
		s.visibility = "hidden";
		s.position = "absolute";
		s.display = "block";
		elm.open = true;
		h = $( elm ).height();
		elm.open = o;
		s.display = d;
		s.position = p;
		s.visibility = v;
		return h;
	},
	
	getMaxHeight = function( elms ) {
		var i, h,
			m = null;
		for ( i = 0; i < elms.length; i++ ) {
		    h = getHeight( elms[ i ] );
		    m = ( h > m ) ? h : m;
		}
		return m;
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function( event ) {
	var eventType = event.type,
		// "this" is cached for all events to utilize
		$elm = $( this );

	switch( eventType ) {
	case "timerpoke":

		// Filter out any events triggered by descendants (nested plugins)
		if ( event.currentTarget === event.target ) {
			init( $elm );
		}
		break;
	}
});

//These events only fire at the document level
$document.on( "xxsmallview.wb xsmallview.wb smallview.wb mediumview.wb largeview.wb xlargeview.wb", function( event ) {
	onResize( event, $document.find( selector ) );
	return true;
});
 
//This event only fires on the window
$( window ).on( "hashchange", onHashChange);
 
// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
