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
	 * @param {jQuery DOM element} $elm The plugin element being initialized
	 */
	init = function( $elm ) {

		// read the selector node for parameters
		var modeJS = vapour.getMode() + ".js",

			// Merge default settings with overrides from the selected plugin element. There may be more than one, so don't override defaults globally!
			settings = $.extend( {}, defaults, $elm.data() ),
			style,
			controls,
			tabs,
			defaultTab,
			panels,
			defaultPanel;

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		// Only initialize the i18nText once
		/*if ( !i18nText ) {
			i18n = window.i18n;
			i18nText = {
				placeholder: i18n( "%placeholdertext" ),
				noVideo: i18n( "%no-video" )
			};
		}*/
		// Use the carousel plugin to do the cycling
		$elm.addClass( "wb-carousel" );
		// Set up the clickable tabs
		tabs = $elm.find( ".tabs li" );
		defaultTab = $elm.find( ".tabs li.default" ).addClass( "active" );
		// Set up the stacked panels
		panels = $elm.children( ".tabs-panel" ).children();
		panels.addClass( "item fade" );
		defaultPanel = panels.filter( function( index ) {
			return index === tabs.index(defaultTab);
		} );
		defaultPanel.addClass( "in" );
		style = $elm.attr( "class" ).match( /tabs-style-(\d+)/ );
		// style is something like ["tabs-style-2", "2", index: 25, input: "wet-boew-tabbedinterface tabs-style-2 cycle-slow animate slide-horz wb-carousel"]
		if ( style && $.inArray( style[1], ["2","3","4","5","6"] ) > -1 ) {
			controls = $( "<ul class='tabs-controls'><li class='tabs-toggle'><a class='prv' href='javascript:;' role='button'>&nbsp;&nbsp;&nbsp;<span class='wb-invisible'>Previous</span></a></li><li class='tabs-toggle'><a class='nxt' href='javascript:;' role='button'>&nbsp;&nbsp;&nbsp;<span class='wb-invisible'>Next</span></a></li><li class='tabs-toggle'><a class='plypause' href='javascript:;' role='button'>Play<span class='wb-invisible'>  -  Start tab rotation</span></a></li></ul>" );
			$elm.append( controls );
		}
		
		$elm.trigger( "carousel.init.wb" );
		//console.log(this);

		// Bind the merged settings to the element node for faster access in other events.
		$elm.data({ settings: settings });
	};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb"/* otherevent.wb-pluginname click"*/, selector, function( event ) {
		var eventType = event.type,
			$elm = $( this );
		switch ( eventType ) {
		case "timerpoke":
			init( $elm );
			break;
		}
	
		/*
		 * Since we are working with events we want to ensure that we are being passive about our control, 
		 * so returning true allows for events to always continue
		 */
		return true;
	});
	
	// Add the timer poke to initialize the plugin
	window._timer.add( selector );

})( jQuery, window, vapour );
