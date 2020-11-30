/**
 * @title WET-BOEW Details/summary polyfill
 * @overview The <details> and <summary> elements allows content to be expanded and collapsed.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var componentName = "wb-details",
	selector = "summary",
	initEvent = "wb-init." + componentName,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var summary = wb.init( event, componentName, selector ),
			details;

		if ( summary ) {
			details = summary.parentNode;
			Object.defineProperty( details, "open", {
				get: isOpen,
				set: setOpen
			} );
			details.summary = summary;
			summary.setAttribute( "aria-expanded", ( details.getAttribute( "open" ) !== null ) );

			if ( !summary.getAttribute( "role" ) ) {
				summary.setAttribute( "role", "button" );
			}
			if ( !summary.getAttribute( "tabindex" ) ) {
				summary.setAttribute( "tabindex", "0" );
			}

			// Identify that initialization has completed
			wb.ready( $( summary ), componentName );
		}
	},

	isOpen = function() {
		return this.getAttribute( "open" ) !== null;
	},

	open = function() {
		this.setAttribute( "open", "open" );
		this.className += " open";
		saveState.call( this );
	},

	close = function() {
		this.removeAttribute( "open" );
		this.className = this.className.replace( " open", "" );
		saveState.call( this );
	},

	setOpen = function( isOpen ) {
		if ( typeof isOpen === "boolean" ) {
			if ( isOpen ) {
				open.call( this );
			} else {
				close.call( this );
			}
		}
		this.summary.setAttribute( "aria-expanded", isOpen );
		$( this ).trigger( "toggle" );
	},

	//TODO: Move to the alerts plugin
	saveState = function() {
		var key;

		if ( this.className.indexOf( "alert" ) !== -1 ) {
			key = "alert-collapsible-state-" + this.getAttribute( "id" );
		}

		if ( key ) {
			try {
				localStorage.setItem( key, this.open ? "open" : "closed" );
			} catch ( e ) {
				/* swallow error */}
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Bind the the event handlers of the plugin
$document.on( "click keydown toggle." + componentName, selector, function( event ) {
	var which = event.which,
		currentTarget = event.currentTarget,
		details;

	// Ignore middle/right mouse buttons and wb-toggle enhanced summary elements (except for toggle)
	if ( ( !which || which === 1 ) &&
		( currentTarget.className.indexOf( "wb-toggle" ) === -1 ||
		( event.type === "toggle" && event.namespace === componentName ) ) ) {
		details = currentTarget.parentNode;
		details.open = !details.open;
	} else if ( which === 13 || which === 32 ) {
		event.preventDefault();
		$( currentTarget ).trigger( "click" );
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
