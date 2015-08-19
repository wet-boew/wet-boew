/**
 * @title WET-BOEW Dismissable content plugin
 * @overview Enables content to be dismissed
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the event - meaning that they will be initialized once per page,
 * not once per instance of event on the page.
 */
var componentName = "wb-dismissable",
	selector = "." + componentName,
	initEvent = "wb-init." + componentName,
	containerClass = "wb-dismissable-container",
	wrapperClass = "wb-dismissable-wrapper",
	dismissClass = "content-dismiss",
	idKey = "dismissable-item-id",
	$document = wb.doc,
	i18n, i18nText,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			itemId, dismissedState, contentContainer, contentWrapper, dismissButton;

		if ( elm ) {

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					dismiss: i18n( "dismiss" )
				};
			}

			// Give the dismissable element a unique ID
			if ( elm.hasAttribute( "id" ) ) {
				itemId = elm.getAttribute( "id" );

				// Ignore an ID assigned by wb
				if ( itemId.indexOf( "wb-auto-" ) === 0 ) {
					itemId = undefined;
				}
			}
			if ( itemId === undefined ) {
				itemId = wb.hashString( wb.stripWhitespace( elm.innerHTML ) );
			}

			dismissedState = getDismissedState( itemId );

			if ( dismissedState === "true" ) {

				// Remove the element if it has been dismissed
				if ( elm.parentNode ) {
					elm.parentNode.removeChild( elm );
				}
			} else {
				$( elm ).wrap( "<div class='" + wrapperClass + "'>" );
				contentWrapper = elm.parentNode;

				$( contentWrapper ).wrap( "<div class='" + containerClass + "'>" );
				contentContainer = contentWrapper.parentNode;

				dismissButton = "<button type='button' class='mfp-close " + dismissClass +
					"' title='" + i18nText.dismiss + "'>&#xd7;<span class='wb-inv'> " +
					i18nText.dismiss + "</span></button>";
				$( contentContainer ).append( dismissButton );

				contentContainer.setAttribute( "data-" + idKey, itemId );
			}

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	},

	getDismissedState = function( id ) {
		var dismissState = localStorage.getItem( id );

		if ( dismissState === null ) {
			return false;
		}

		return dismissState;
	},

	dismissContent = function( elm ) {
		localStorage.setItem( elm.getAttribute( "data-" + idKey ), true );
		elm.parentNode.removeChild( elm );
		$document.trigger( "refresh.wb" );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Handler for clicking on the dismiss button
$document.on( "click vclick", "." + dismissClass, function( event ) {
	var elm = event.currentTarget,
		which = event.which;

	// Ignore middle/right mouse buttons
	if ( !which || which === 1 ) {
		dismissContent( elm.parentNode );
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
