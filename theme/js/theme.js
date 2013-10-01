/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
(function ( $, vapour ) {
	"use strict";

	var theme = {
		previousBreakPoint: -1,

		// Theme onResize handler
		onResize: function() {
			var $document = vapour.doc,
				breakpoint = parseInt( $( "html" ).css( "margin-bottom" ), 10 );

			if ( breakpoint !== theme.previousBreakPoint ) {
				switch ( breakpoint ) {
				case 4:
					$document.trigger( "xlargeview" );
					break;
				case 3:
					$document.trigger( "largeview" );
					break;
				case 2:
					$document.trigger( "mediumview" );
					break;
				case 1:
					$document.trigger( "smallview" );
					break;
				case 0:
					$document.trigger( "xsmallview" );
					break;
				}
			}
			theme.previousBreakPoint = breakpoint;
		},

		onLargeView: function() {
			return;
		},
		
		onMediumSmallView: function() {
			return;
		},
		
		onMediumView: function() {
			return;
		},
		
		onSmallView: function() {
			return;
		},

		onXSmallView: function() {
			return;
		}
	};

	vapour.doc.on( "xlargeview largeview mediumview smallview xsmallview text-resize.wb window-resize-width.wb window-resize-height.wb", function( event ) {
		var eventType = event.type;

		switch ( eventType ) {
		case "xlargeview":
		case "largeview":
			theme.onLargeView();
			break;
		case "mediumview":
			theme.onMediumSmallView();
			theme.onMediumView();
			break;
		case "smallview":
		case "xsmallview":
			theme.onMediumSmallView();
			theme.onSmallView();
			break;
		// Listen for the WET resize handler events
		case "text-resize":
		case "window-resize-width":
		case "window-resize-height":
			theme.onResize();
			break;
		}
	});

	// Trigger the initial onResize
	theme.onResize();
}( jQuery, vapour ));