/*
 * @title Current language identifier
 * @overview Identifies the current language of the page in the language selector.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
(function ( $, window, vapour ) {
	"use strict";

	/*
	 * Variable and function definitions.
	 * These are global to the plugin - meaning that they will be initialized once per page,
	 * not once per instance of plugin on the page. So, this is a good place to define
	 * variables that are common to all instances of the plugin on a page.
	 */
	var selector = ".wb-currentlanguage",
		$document = vapour.doc,
		$html = vapour.html,
		i18n,
		i18nText,

		/*
		 * Plugin users can override these defaults by setting attributes on the html elements that the
		 * selector matches.
		 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
		 */
		defaults = {
			langLink: "wb-lang-link",
			langCurrent: "wb-lang-current"
		},

		/*
		 * @class plugin name
		 */
		plugin = {
			/*
			 * Init runs once per plugin element on the page. There may be multiple elements.
			 * It will run more than once per plugin if you don't remove the selector from the timer.
			 * @method init
			 * @param {jQuery DOM element} $elm The plugin element being initialized
			 */
			init: function ( $elm ) {
				// Merge default settings with overrides from the selected plugin element. There may be more than one, so don't override defaults globally!
				var settings = $.extend( {}, defaults, $elm.data() );

				// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
				window._timer.remove( selector );

				// Only initialize the i18nText once
				if ( !i18nText ) {
					i18n = window.i18n;
					i18nText = {
						current: i18n( "%current" )
					};
				}

				$( "." + settings.langLink + "[lang=\"" + $html[0].lang + "\"]" ).addClass( settings.langCurrent ).append( i18nText.current );

				// Bind the merged settings to the element node for faster access in other events.
				$elm.data( { settings: settings } );
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function () {
		// "this" is cached for all events to utilize
		var $elm = $( this );

		plugin.init.apply( this, [ $elm ] );
		
		/*
		 * Since we are working with events we want to ensure that we are being passive about our control,
		 * so returning true allows for events to always continue
		 */
		 return true;
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, vapour );