/*
Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
plugin :	Expand/collapse all details
author :	@patheard
notes:		Plugin that allows links to expand/collapse all details
			elements on the page.
licence:	wet-boew.github.io/wet-boew/License-en.html /
			wet-boew.github.io/wet-boew/Licence-fr.html
*/
(function( $, window, document ) {
	"use strict";
	var plugin = {
		css: ".wb-expand-collapse-all",
		links: null,
		isOpen: { global: false },
		isPolyfill: false,

		/**
		 * Initialize the plugin
		 */
		init: function() {
			window._timer.remove( plugin.css );

			plugin.links = $( plugin.css );
			plugin.isPolyfill = !window.Modernizr.details;
			plugin.initAriaControls();
			if ( plugin.links.data( "print-open" ) === true ) {
				plugin.initPrint();
			}
		},

		/**
		 * Sets the aria-controls attribute of the toggle control elements
		 */
		initAriaControls: function() {
			var $detail, $details, $link, ariaControls, j,
				lenDetails, lenLinks, parent,
				cache = {},
				i = 0;

			// Loop through links to determine which details elements they control
			for ( lenLinks = plugin.links.length; i < lenLinks; i++ ) {
				$link = plugin.links.eq( i );
				parent = $link.data( "parent" ) !== undefined ?
					$link.data( "parent" ) :
					"global";

				// If no cache, get space separated details IDs the link controls
				if ( !cache.hasOwnProperty( parent ) ) {
					ariaControls = "";
					$details = parent !== "global" ?
						$( parent ).find( "details" ) :
						$( "details" );

					for ( j = 0, lenDetails = $details.length; j < lenDetails; j++ ) {
						$detail = $details.eq( j );
						if ( $detail.attr( "id" ) === undefined ) {
							$detail.attr( "id", "details_" + j );
						}
						ariaControls += $detail.attr( "id" ) + " ";
					}
					cache[ parent ] = ariaControls.slice( 0, -1 );
				}
				$link.attr( "aria-controls", cache[ parent ] );
			}
		},

		/**
		 * Setup the before print behaviour that opens all details on the
		 * page when printing
		 */
		initPrint: function() {
			var mediaQuery,
				$details = $( "details" ),
				$window = $( window );

			// Native event support: open details on the page when printed
			$window.on( "beforeprint", function() {
				plugin.setDetailsOpen( $details, true );
				plugin.setOpen( null, true );
			});

			// Fallback for browsers that don't support print event
			if ( typeof window.matchMedia !== "undefined" ) {
				mediaQuery = window.matchMedia( "print" );
				if ( typeof mediaQuery.addListener !== "undefined" ) {
					mediaQuery.addListener(function( query ) {
						if ( query.matches ) {
							$window.trigger( "beforeprint" );
						}
					});
				}
			}

			// Polyfill open using CSS
			$details.addClass( "print-open" );
		},

		/**
		 * Handle click events on a toggle control element
		 * @param {DOM element} link The link that was clicked
		 * @param {jQuery event} event
		 */
		click: function( link, event ) {
			var $link = $( link ),
				type = $link.data( "type" ),
				parent = $link.data( "parent" ),
				open = !plugin.getOpen( parent, type ),
				$details = typeof parent === "string" ?
					$( parent ).find( "details" ) :
					$( "details" );

			plugin.setDetailsOpen( $details, open );
			plugin.setOpen( parent, open );

			event.preventDefault();
			event.target.focus();
		},

		/**
		 * Sets the open property of passed in details element(s)
		 * @param {jQuery DOM object} $details Details elements to open/close
		 * @param {boolean} open Value to set the details open property
		 */
		setDetailsOpen: function( $details, open ) {
			if ( plugin.isPolyfill ) {
				$details.prop( "open", !open );
				$details.find( "summary" ).click();
			} else {
				$details.prop( "open", open );
			}
		},

		/**
		 * Gets the open state of the page's details elements.
		 * @param {string} parent Property key for the plugin's isOpen object.
		 * @param {string} type The type of toggle control that was clicked.
		 */
		getOpen: function( parent, type ) {
			var open;

			if ( type === "open" ) {
				open = false;
			} else if ( type === "close" ) {
				open = true;
			} else {
				open = typeof parent === "string" && plugin.isOpen.hasOwnProperty( parent ) ?
					plugin.isOpen[ parent ] :
					plugin.isOpen.global;
			}
			return open;
		},

		/**
		 * Sets the open state of the page's details elements.
		 * @param {string} parent Property key for the plugin's isOpen object.
		 * @param {boolean} open State to set the isOpen property key to
		 */
		setOpen: function( parent, open ) {
			var prop;

			// If there's a parent, set its open property (this creates the
			// property if it doesn't already exist)
			if ( typeof parent === "string" ) {
				plugin.isOpen[ parent ] = open;

			// No parent spec'd means set all open properties.  This is because
			// global toggle controls change the state of toggle controls that
			// are restricted by parent (but not vice versa).
			} else {
				for ( prop in plugin.isOpen ) {
					if ( plugin.isOpen.hasOwnProperty( prop ) ) {
						plugin.isOpen[ prop ] = open;
					}
				}
			}
		},
	};

	// Bind the event handlers to initialize the plugin and handle clicks
	$( document ).on( "wb.timerpoke click", plugin.css, function( event ) {
		if ( event.type === "click" ) {
			plugin.click( this, event );
		} else {
			plugin.init();
		}
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( plugin.css );

}( jQuery, window, document ));
