/*
 * @title Tabbed Interface Plugin
 * @overview Explain the plug-in or any third party lib that it is inspired by
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @YOU or WET Community
 */
/*jshint unused: false */
/*global console */
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
			$elm, modeJS, settings,	style, controls, tabs, defaultTab,
			panels, defaultPanel;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === elm ) {
			$elm = $( elm );
			modeJS = vapour.getMode() + ".js";

			// Merge default settings with overrides from the selected plugin element. There may be more than one, so don't override defaults globally!
			settings = $.extend( {}, defaults, $elm.data() );

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
					hyphen: i18n( "%hyphen" )
				};
			}

			// Use the carousel plugin to do the cycling
			$elm.addClass( "wb-carousel" );
			// Set up the clickable tabs
			tabs = $elm.find( ".tabs li" );
			defaultTab = $elm.find( ".tabs li.default" ).addClass( "active" );
			// Set up the stacked panels
			panels = $elm.children( ".tabs-panel" ).children();
			panels.addClass( "item fade" );
			defaultPanel = panels.filter( function( index ) {
				return index === tabs.index( defaultTab );
			} );
			defaultPanel.addClass( "in" );
			style = $elm.attr( "class" ).match( /tabs-style-(\d+)/ );
			// style is something like ["tabs-style-2", "2", index: 25, input: "wet-boew-tabbedinterface tabs-style-2 cycle-slow animate slide-horz wb-carousel"]
			if ( style && $.inArray( style[1], ["2","3","4","5","6"] ) > -1 ) {
				controls = $( "<ul class='tabs-controls'><li class='tabs-toggle'><a class='prv' href='javascript:;' role='button'>&nbsp;&nbsp;&nbsp;<span class='wb-inv'>" +
					i18nText.prev + "</span></a></li><li class='tabs-toggle'><a class='nxt' href='javascript:;' role='button'>&nbsp;&nbsp;&nbsp;<span class='wb-inv'>" +
					i18nText.next + "</span></a></li><li class='tabs-toggle'><a class='plypause' href='javascript:;' role='button'>" +
					i18nText.play + "<span class='wb-inv'>" + i18nText.space +
					i18nText.hyphen + i18nText.space + i18nText.rotStart +
					"</span></a></li></ul>" );
				$elm.append( controls );
			}
			
			$elm.trigger( "carousel.init.wb" );

			// Bind the merged settings to the element node for faster access in other events.
			$elm.data({ settings: settings });
		}
	};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, init );
	
	// Add the timer poke to initialize the plugin
	window._timer.add( selector );

})( jQuery, window, vapour );
