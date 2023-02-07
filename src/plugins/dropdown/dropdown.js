/**
 * @title WET-BOEW Dropdown
 * @overview Dropdown functionality
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @garneauma
 * Adapted from W3C's Actions Menu Button Example Using aria-activedescendant
 * Link: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-links/
 * License: https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
( function( $, wb ) {
"use strict";

/*
* Variable and function definitions.
* These are global to the plugin - meaning that they will be initialized once per page,
* not once per instance of plugin on the page. So, this is a good place to define
* variables that are common to all instances of the plugin on a page.
*/
var componentName = "dropdown",
	selector = "." + componentName,
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
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {
			wb.ready( $( elm ), componentName );

			new Dropdown( elm );
		}
	};

class Dropdown {
	constructor( dropdown ) {
		this.dropdown = dropdown;
		this.buttonNode = dropdown.querySelector( ".dropdown-toggle" );
		this.menuNode = dropdown.querySelector( ".dropdown-menu" );
		this.menuitemNodes = [];
		this.firstMenuitem = false;
		this.lastMenuitem = false;
		this.firstChars = [];

		this.buttonNode.addEventListener( "keydown", this.onButtonKeydown.bind( this ) );
		this.buttonNode.addEventListener( "click", this.onButtonClick.bind( this ) );

		// Set ID's
		this.buttonNode.id = this.buttonNode.id || wb.getId();
		this.menuNode.id = this.menuNode.id || wb.getId();

		// Set attributes for accessibility
		this.menuNode.setAttribute( "role", "menu" );
		this.menuNode.setAttribute( "aria-labelledby", this.buttonNode.id );
		this.buttonNode.setAttribute( "aria-controls", this.menuNode.id );
		this.buttonNode.setAttribute( "aria-haspopup", "true" );

		var nodes = dropdown.querySelectorAll( "li a, li button" );

		for ( var i = 0; i < nodes.length; i++ ) {
			var menuitem = nodes[ i ];
			this.menuitemNodes.push( menuitem );
			menuitem.tabIndex = -1;
			this.firstChars.push( menuitem.textContent.trim()[ 0 ].toLowerCase() );

			menuitem.parentElement.setAttribute( "role", "none" );
			menuitem.setAttribute( "role", "menuitem" );
			menuitem.id = menuitem.id || wb.getId();

			menuitem.addEventListener( "keydown", this.onMenuitemKeydown.bind( this ) );
			menuitem.addEventListener( "mouseover", this.onMenuitemMouseover.bind( this ) );

			if ( !this.firstMenuitem ) {
				this.firstMenuitem = menuitem;
			}
			this.lastMenuitem = menuitem;
		}

		dropdown.addEventListener( "focusin", this.onFocusin.bind( this ) );
		dropdown.addEventListener( "focusout", this.onFocusout.bind( this ) );
		window.addEventListener( "mousedown", this.onBackgroundMousedown.bind( this ), true );
	}

	setFocusToMenuitem( newMenuitem ) {
		this.menuitemNodes.forEach( function( item ) {
			if ( item === newMenuitem ) {
				item.tabIndex = 0;
				newMenuitem.focus();
			} else {
				item.tabIndex = -1;
			}
		} );
	}

	setFocusToFirstMenuitem() {
		this.setFocusToMenuitem( this.firstMenuitem );
	}

	setFocusToLastMenuitem() {
		this.setFocusToMenuitem( this.lastMenuitem );
	}

	setFocusToPreviousMenuitem( currentMenuitem ) {
		var newMenuitem, index;

		if ( currentMenuitem === this.firstMenuitem ) {
			newMenuitem = this.lastMenuitem;
		} else {
			index = this.menuitemNodes.indexOf( currentMenuitem );
			newMenuitem = this.menuitemNodes[ index - 1 ];
		}

		this.setFocusToMenuitem( newMenuitem );

		return newMenuitem;
	}

	setFocusToNextMenuitem( currentMenuitem ) {
		var newMenuitem, index;

		if ( currentMenuitem === this.lastMenuitem ) {
			newMenuitem = this.firstMenuitem;
		} else {
			index = this.menuitemNodes.indexOf( currentMenuitem );
			newMenuitem = this.menuitemNodes[ index + 1 ];
		}
		this.setFocusToMenuitem( newMenuitem );

		return newMenuitem;
	}

	setFocusByFirstCharacter( currentMenuitem, char ) {
		var start, index;

		if ( char.length > 1 ) {
			return;
		}

		char = char.toLowerCase();

		// Get start index for search based on position of currentItem
		start = this.menuitemNodes.indexOf( currentMenuitem ) + 1;
		if ( start >= this.menuitemNodes.length ) {
			start = 0;
		}

		// Check remaining slots in the menu
		index = this.firstChars.indexOf( char, start );

		// If not found in remaining slots, check from beginning
		if ( index === -1 ) {
			index = this.firstChars.indexOf( char, 0 );
		}

		// If match was found...
		if ( index > -1 ) {
			this.setFocusToMenuitem( this.menuitemNodes[ index ] );
		}
	}

	// Utilities

	getIndexFirstChars( startIndex, char ) {
		for ( var i = startIndex; i < this.firstChars.length; i++ ) {
			if ( char === this.firstChars[ i ] ) {
				return i;
			}
		}
		return -1;
	}

	// Popup menu methods

	openPopup() {
		this.dropdown.classList.add( "open" );
		this.buttonNode.setAttribute( "aria-expanded", "true" );
	}

	closePopup() {
		if ( this.isOpen() ) {
			this.buttonNode.removeAttribute( "aria-expanded" );
			this.dropdown.classList.remove( "open" );
		}
	}

	isOpen() {
		return this.buttonNode.getAttribute( "aria-expanded" ) === "true";
	}

	// Menu event handlers

	onFocusin() {
		this.dropdown.classList.add( "focus" );
	}

	onFocusout() {
		this.dropdown.classList.remove( "focus" );
	}

	onButtonKeydown( event ) {
		var key = event.key,
			flag = false;

		switch ( key ) {
		case " ":
		case "Enter":
		case "ArrowDown":
		case "Down":
			this.openPopup();
			this.setFocusToFirstMenuitem();
			flag = true;
			break;

		case "Esc":
		case "Escape":
			this.closePopup();
			this.buttonNode.focus();
			flag = true;
			break;

		case "Up":
		case "ArrowUp":
			this.openPopup();
			this.setFocusToLastMenuitem();
			flag = true;
			break;

		default:
			break;
		}

		if ( flag ) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onButtonClick( event ) {
		if ( this.isOpen() ) {
			this.closePopup();
			this.buttonNode.focus();
		} else {
			this.openPopup();
			this.setFocusToFirstMenuitem();
		}
		event.stopPropagation();
		event.preventDefault();
	}

	onMenuitemKeydown( event ) {
		var tgt = event.currentTarget,
			key = event.key,
			flag = false;

		function isPrintableCharacter( str ) {
			return str.length === 1 && str.match( /\S/ );
		}

		if ( event.ctrlKey || event.altKey || event.metaKey ) {
			return;
		}

		if ( event.shiftKey ) {
			if ( isPrintableCharacter( key ) ) {
				this.setFocusByFirstCharacter( tgt, key );
				flag = true;
			}

			if ( event.key === "Tab" ) {
				this.buttonNode.focus();
				this.closePopup();
				flag = true;
			}
		} else {
			switch ( key ) {
			case " ":
				window.location.href = tgt.href;
				break;
			case "Esc":
			case "Escape":
				this.closePopup();
				this.buttonNode.focus();
				flag = true;
				break;

			case "Up":
			case "ArrowUp":
				this.setFocusToPreviousMenuitem( tgt );
				flag = true;
				break;

			case "ArrowDown":
			case "Down":
				this.setFocusToNextMenuitem( tgt );
				flag = true;
				break;

			case "Home":
			case "PageUp":
				this.setFocusToFirstMenuitem();
				flag = true;
				break;

			case "End":
			case "PageDown":
				this.setFocusToLastMenuitem();
				flag = true;
				break;

			case "Tab":
				this.closePopup();
				break;

			default:
				if ( isPrintableCharacter( key ) ) {
					this.setFocusByFirstCharacter( tgt, key );
					flag = true;
				}
				break;
			}
		}

		if ( flag ) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onMenuitemMouseover( event ) {
		var tgt = event.currentTarget;
		tgt.focus();
	}

	onBackgroundMousedown( event ) {
		if ( !this.dropdown.contains( event.target ) ) {
			if ( this.isOpen() ) {
				this.closePopup();
				this.buttonNode.focus();
			}
		}
	}
}

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
