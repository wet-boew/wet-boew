/*
 * @title Tabbed Interface Plugin
 * @overview Rearanges HTML blocks into stacked panels that can be accessed via tabs and other controls.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function ( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-tabs",
	$document = vapour.doc,
	i18n, i18nText,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		option1: true,
		option2: false,
		debug: false
	},

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements. 
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var elm = event.target,
			$elm, modeJS, settings,	style, $controls, $tabs, $panels;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			$elm = $( elm );
			modeJS = vapour.getMode() + ".js";

			// Merge default settings with overrides from the selected plugin element. There may be more than one, so don't override defaults globally!
			settings = $.extend( {}, defaults, $elm.data( "tabs" ) );

			// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
			window._timer.remove( selector );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = window.i18n;
				i18nText = {
					prev: i18n( "%prv" ),
					next: i18n( "%nxt" ),
					play: i18n( "%play" ),
					rotStart: i18n( "%tab-rot" ).on,
					rotStop: i18n( "%tab-rot" ).off,
					space: i18n( "%space" ),
					hyphen: i18n( "%hyphen" ),
					tab: i18n( "%tab" )
				};
			}

			// Use the carousel plugin to do the cycling
			$elm.addClass( "wb-carousel stopped" );
			// Set up the stacked panels
			$panels = $elm.children( "div" ).addClass( "item" );
			// Set up the clickable tabs
			$tabs = buildTabs( $elm );
			$panels.eq( $elm.data( "tabs-default-index" ) * 1  ).addClass( "in" ); // defaults to first tab/panel
			// Only some of the tabs-style classes add prev/next/play/pause controls
			style = $elm.attr( "class" ).match( /tabs-style-(\d+)/ );
			// style is something like ["tabs-style-2", "2", index: 25, input: "wb-tabs tabs-style-2 cycle-slow animate slide-horz wb-carousel"]
			if ( style && $.inArray( style[1], ["2","3","4","5","6"] ) > -1 ) {
				$controls = $( "<li class='tabs-controls'><a class='prv' href='javascript:;' role='button'>&nbsp;&nbsp;&nbsp;<span class='wb-inv'>" +
					i18nText.prev + "</span></a></li><li class='tabs-controls'><a class='nxt' href='javascript:;' role='button'>&nbsp;&nbsp;&nbsp;<span class='wb-inv'>" +
					i18nText.next + "</span></a></li><li class='tabs-controls'><a class='plypause' href='javascript:;' role='button'>" +
					i18nText.play + "<span class='wb-inv'>" + i18nText.space +
					i18nText.hyphen + i18nText.space + i18nText.rotStart +
					"</span></a></li>" );
				$tabs.last().after( $controls );
			}
			$elm.prepend( $tabs );
			
			$elm.trigger( "init.wb-carousel" );

			// Bind the merged settings to the element node for faster access in other events.
			$elm.data( { settings: settings } );
		}
	},
	
	/*
	 * @method buildTabs
	 * @param {jQuery DOM element} $elm The plugin element
	 * @return {jQuery DOM element} The tabs element
	 */
	buildTabs = function ( $elm ) {
		var $tabs, $tab, $panels, $this, data;
		
		$tabs = $( "<ul class='tabs'/>" );
		$panels = $elm.find( ".item" );
		$panels.each( function( i ) {
			$this = $( this );
			data = $this.data( "panel" );
			if ( data ) {
				// create the actual tab to add to the page
				$tab = $( "<li/>" );
				if ( data[ "default" ] ) {
					// While we're scanning the panels, add the 0-based index to the plugin element, so it's easier to find.
					$elm.data( "tabs-default-index", i );
					$tab.addClass( "active" );
				}
				if ( data.image ) {
					if ( data.title ) {
						$tab.append( $( "<a href='javascript:;'><img src='" + data.image + "' alt='" + data.title + "' /></a>" ) );
					} else {
						$tab.append( $( "<a href='javascript:;'><img src='" + data.image + "' alt='" + i18nText.tab.replace( "#num#", i + 1 ) + "' /></a>" ) );
					}
				} else {
					if ( data.title ) {
						$tab.append( $( "<a href='javascript:;'>" + data.title + "</a>" ) );
					} else {
						$tab.text( $( "<a href='javascript:;'>" + i18nText.tab.replace( "#num#", i + 1 ) + "</a>" ) );
					}
				}
				$tabs.append( $tab );
			}
		} );
		return $tabs;
	},
	
	/*
	 * @method onTabClick
	 * @param {jQuery event} event The current event
	 */
	onTabClick = function( event ) {
		var $link = $( event.target ),
			$panel = $( $link.parent().data( "target" ) );
		// handle switching the active tab
		$link.parent().addClass( "active" ).siblings( ":not('tabs-controls')" ).removeClass( "active" );
		// let carousel handle the switching of the panels
		$link.trigger( "select.wb-carousel" );
	};
	
	// Bind the click event for the tabs
	$document.on( "click", selector + " .tabs li:not('.tabs-controls')", onTabClick );

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, init );
	
	// Add the timer poke to initialize the plugin
	window._timer.add( selector );

})( jQuery, window, vapour );
