/*
 * @title WET-BOEW Modal
 * @overview Uses the Magnific Popup library to create a modal dialog
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, document, vapour ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var selector = ".wb-modal",
	$document = vapour.doc,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		modal: false,		// When true, force a modal-like behaviour (no close button and escape key or overlay click won't close)
		mainClass: "mfp",	// CSS class for the modal wrapper element
		removalDelay: 0		// Number of milliseconds to wait before removing modal element from DOM (use with closing animations)
	},

	/*
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @function init
	 */
	init = function() {

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		// Load the magnific popup dependency
		Modernizr.load({
			load: "site!deps/jquery.magnific-popup" + vapour.getMode() + ".js",
			complete: function() {
				$document.trigger( "ready.wb-modal" );
			}
		});
	},

	/*
	 * Opens a popup defined by the settings object
	 * @function show
	 * @param {jQuery Event} event `modal.wb-session-timeout` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	show = function( event, settings ) {
		$.magnificPopup.open( $.extend( {}, defaults, settings ) );
	},

	/*
	 * Closes a popup defined by the settings object
	 * @function hide
	 * @param {jQuery Event} event `modal.wb-session-timeout` event that triggered the function call
	 * @param {Object} settings Key-value object
	 */
	hide = function() {
		$.magnificPopup.close();
	},

	/*
	 * Creates a modal dialog for use with the Magnific Popup library.
	 * @function build
	 * @param {Object} settings Key-value object used to build the modal dialog
	 * @returns {jQuery Object} The modal jQuery DOM object
	 */
	build = function( event, settings ) {
		// TODO: Add random serial to `id` attribute to prevent collisions
		var $modal = $(	"<div class='modal-dialog'><article class='modal-content'>" +
			"<div class='modal-body' id='lb-desc'>" + settings.content + "</div></article></div>" ),
			$content = $modal.find( ".modal-content" );

		// Add modal's ID if it exists
		if ( settings.id != null ) {
			$modal.attr( "id", settings.id );
		}

		// Add modal's title if it exists
		if ( settings.title != null ) {
			$content.prepend( "<header class='modal-header'><h1 class='modal-title'>" + settings.title + "</h1></header>" );
			$modal.attr( "aria-labelledby", "lb-title" );
		}

		// Add the buttons
		if ( settings.buttons != null ) {
			$content.append( "<div class='modal-footer'>" );
			$content.find( ".modal-footer" ).append( settings.buttons );
		}

		// Set modal's accessibility attributes
		// TODO: Better if dealt with upstream by Magnific popup
		$modal.attr({
			"role": "dialog",
			"aria-live": "polite",
			"aria-describedby": "lb-desc"
		});

		// Let the triggering process know that the modal has been built
		if ( settings.deferred != null ) {
			settings.deferred.resolve( $modal, true );
		}

		return $modal;
	};

// Bind the plugin events
$document
	.on( "timerpoke.wb", selector, init )
	.on( "build.wb-modal show.wb-modal hide.wb-modal", function( event, settings ) {
		var eventType = event.type;

		switch ( eventType ) {
		case "build":
			build( event, settings );
			break;
		case "show":
			show( event, settings );
			break;
		case "hide":
			hide( event, settings );
			break;
		}
	});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );
