/*
 * @title Tabbed Interface Plugin
 * @overview Explain the plug-in or any third party lib that it is inspired by
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @YOU or WET Community
 */
 (function( $, window, vapour ) {
 "use strict";

 /*
  * Variable and function definitions.
  * These are global to the plugin - meaning that they will be initialized once per page,
  * not once per instance of plugin on the page. So, this is a good place to define
  * variables that are common to all instances of the plugin on a page.
  */
 var selector = ".wb-tabs",
	$document = vapour.doc,
	
	/*
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	init = function( $elm ) {
		var $tabs = $elm.find( "[role=tablist]" ).children(),
			$panels = $elm.find( "[role=tabpanel]" ),
			$activeTab = $tabs.filter( ".active" ).length ? $tabs.filter( ".active" ).eq( 0 ) : $tabs.eq( 0 ),
			$activePanel = $panels.eq( $activeTab.index() );
		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		$panels.attr( "open", false )
			.addClass( "out" );
		$activePanel.attr( "open", true)
			.removeClass( "out" )
			.addClass( "in" );

		//drizzleAria( $panels, $tabs );

		$elm.data({
			"tabs": $tabs,
			"panels": $panels
		});
	},

	/*
	 * Click handler for the toggle links. Most of the click functionality is handled by the wb-toggle
	 * plugin's click handler. This just toggles some extra classes that are used for tabs only.
	 * @param {jQuery Event} event The event that triggered this invocation
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	click = function( event, $elm ) {
		var $button = $( event.target );
		if ( $button.data( "toggle" ) && $button.data( "toggle" ).selector ) {
			// A toggle link or button was clicked
			$button.addClass( "active" ).siblings().removeClass( "active" );
			$elm.find( "[role=tabpanel]" ).removeClass( "in" ).addClass( "out" );
			$( $button.data( "toggle" ).selector ).removeClass( "out" ).addClass( "in" );
			event.preventDefault();
		} else if ( $button.get( 0 ).tagName.toLowerCase() === "summary" ) {
			// A summary element was clicked (small screen)
			// This check keeps tabs & panel states consistent for users who change screen size from narrow to wide
			if ( !$button.parent().attr( "open") ) {
				// open it
				$button.parent().removeClass( "out" ).addClass( "in" )
					.siblings().removeClass( "in" ).addClass( "out" ).attr( "open", false );
			}
		}
	};

	/*
	 * @method drizzleAria
	 * @param {2 jQuery DOM element} $tabs for the tabpanel grouping, and $tablist for the pointers to the groupings
	 */
	/*drizzleAria = function( $tabs, $tabslist ) {

		// lets process the elements for aria
		var tabscounter = $tabs.length - 1,
			$listitems = $tabslist.children(),
			listcounter = $listitems.length - 1,
			$item;


		for ( tabscounter; tabscounter >= 0; tabscounter-- ) {
			$item = $tabs.eq( tabscounter );
			$item.attr({
				tabindex: "-1",
				"aria-hidden": "true",
				"aria-expanded": "false",
				"aria-labelledby": $item.attr( "id" ) + "-lnk"
			});
		 }

		 for ( listcounter; listcounter >= 0; listcounter-- ) {
			$item = $listitems.eq( listcounter ).find( "a" );
			$item.attr({
				tabindex: "0",
				"aria-selected": "false",
				"aria-controls": $item.attr( "href" ).replace( "#", "" ) + "-lnk",
			});
			$item.parent().attr( "role", "presentation" );
		  }

		 $tabslist.attr( "aria-live", "off" );
	};*/

 // Bind the init event of the plugin
 $document.on( "timerpoke.wb click", selector, function( event ) {
	var eventType = event.type,
		// "this" is cached for all events to utilize
		$elm = $( this );

	switch ( eventType ) {
	case "timerpoke":
		init( $elm );
		break;
	case "click":
		click( event, $elm );
		break;
	}
	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
 });

 // Add the timer poke to initialize the plugin
 window._timer.add( ".wb-tabs" );

 })( jQuery, window, vapour );
