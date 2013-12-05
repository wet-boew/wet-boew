/**
 * @title WET-BOEW Modal
 * @overview Uses the Magnific Popup library to create a modal dialog
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @patheard
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var pluginName = "wb-modal",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	buildEvent = "build" + selector,
	showEvent = "show" + selector,
	hideEvent = "hide" + selector,
	readyEvent = "ready" + selector,
	$document = wb.doc,

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

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @function init
	 * @param {jQuery Event} event Event that triggered this handler
	 */
	init = function( event ) {
		var eventTarget = event.target;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === eventTarget &&
			eventTarget.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			eventTarget.className += " " + initedClass;

			// Load the magnific popup dependency
			Modernizr.load({
				load: "site!deps/jquery.magnific-popup" + wb.getMode() + ".js",
				complete: function() {
					$document.trigger( readyEvent );
				}
			});
		}
	},

	/**
	 * Opens a popup defined by the settings object
	 * @function show
	 * @param {Object} settings Key-value object
	 */
	show = function( settings ) {
		$.magnificPopup.open( $.extend( {}, defaults, settings ) );
	},

	/**
	 * Closes a popup
	 * @function hide
	 */
	hide = function() {
		$.magnificPopup.close();
	},

	/**
	 * Creates a modal dialog for use with the Magnific Popup library.
	 * @function build
	 * @param {Object} settings Key-value object used to build the modal dialog
	 * @returns {jQuery Object} The modal jQuery DOM object
	 */
	build = function( settings ) {
		// TODO: Add random serial to `id` attribute to prevent collisions
		var $modal = $( "<section class='modal-dialog modal-content overlay-def'>" +
			"<div class='modal-body' id='lb-desc'>" + settings.content + "</div></section>" );

		// Add modal's ID if it exists
		if ( settings.id != null ) {
			$modal.attr( "id", settings.id );
		}

		// Add modal's title if it exists
		if ( settings.title != null ) {
			$modal
				.prepend( "<header class='modal-header'><h2 class='modal-title'>" + settings.title + "</h2></header>" )
				.attr( "aria-labelledby", "lb-title" );
		}

		// Add the buttons
		if ( settings.buttons != null ) {
			$modal
				.append( "<div class='modal-footer'>" )
				.find( ".modal-footer" )
					.append( settings.buttons );
		}

		// Set modal's accessibility attributes
		// TODO: Better if dealt with upstream by Magnific popup
		$modal.attr({
			role: "dialog",
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
	.on( "timerpoke.wb " + initEvent, selector, init )
	.on( buildEvent + " " + showEvent + " " + hideEvent, function( event, settings ) {
		var eventType = event.type;

		// Filter out any events triggered by descendants
		if ( event.currentTarget === event.target ) {
			switch ( eventType ) {
			case "build":
				build( settings );
				break;
			case "show":
				show( settings );
				break;
			case "hide":
				hide();
				break;
			}
		}
	});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
