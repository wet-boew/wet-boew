/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * WET-BOEW Footnotes plugin
 */
(function ( $, window, document, vapour ) {
	"use strict";

	var selector = ".wb-footnotes",
		$document = vapour.doc,
		plugin = {
			init: function ( $elm ) {
				// all plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
				window._timer.remove( selector );

				var $contentArea = $document.find( "main" ).not( ".wb-footnotes" ), //reference to the content area (which needs to be scanned for footnote references)
					footnote_dd = this.getElementsByTagName( "dd" ),
					footnote_dt = this.getElementsByTagName( "dt" ),
					i, len, dd, dt, dtId, button, $returnLinks, $returnLink, refId;

				// Apply aria-labelledby and set initial event handlers for return to referrer links
				len = footnote_dd.length;
				for ( i = 0; i !== len; i += 1 ) {
					dd = footnote_dd[ i ];
					dt = footnote_dt[ i ];
					dtId = dd.id + "-dt";
					dd.setAttribute( "tabindex", "-1" );
					dd.setAttribute( "aria-labelledby", dtId );
					dt.id = dtId ;
				}

				//remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
				$returnLinks = $elm.find( "dd p.footnote-return a" );
				len = $returnLinks.length;
				for ( i = 0; i !== len; i += 1 ) {
					$returnLink = $returnLinks.eq( i );
					$returnLink.find( "span span" ).remove();
				}

				$returnLinks.off( "click vclick" ).on( "click.wb-footnotes vclick.wb-footnotes", function( event ) {
					button = event.which;
					if ( !button || button === 1 ) { // Ignore middle/right mouse buttons
						refId = vapour.jqEscape( this.getAttribute( "href" ) ).substring( 1 );
						//TODO: Replace with global focus function
						setTimeout( function () {
							$contentArea.find( refId + " a" ).focus();
						}, 0 );
							return false;
					}
				});

				//listen for footnote reference links that get clicked
				$contentArea.find( "sup a.footnote-link" ).on( "click vclick", function ( event ) {
					//captures certain information about the clicked link
					var $refLinkDest = $elm.find( vapour.jqEscape( this.getAttribute( "href" ) ).substring( 1 ) ),
						button = event.which;
					if ( !button || button === 1 ) { // Ignore middle/right mouse buttons
						$refLinkDest.find( "p.footnote-return a" )
									.attr( "href", "#" + this.parentNode.id )
									.off( "click vclick" )
									.on( "click.wb-footnotes vclick.wb-footnotes", function ( event ) {
							var button = event.which,
								refId;
							if ( !button || button === 1 ) { // Ignore middle/right mouse buttons
								refId = vapour.jqEscape( this.getAttribute( "href" ) ).substring( 1 );
								//TODO: Replace with global focus function
								setTimeout( function () {
									$contentArea.find( refId + " a" ).focus();
								}, 0 );

								return false;
							}
						});

						//TODO: Replace with global focus function
						setTimeout( function () {
							$refLinkDest.focus();
						}, 0 );

						return false;
					}
				});
			}
		};

	// Bind the init event of the plugin
	$document.on( "timerpoke.wb", selector, function () {
		plugin.init.apply( this, [ $( this ) ] );
		return true; // since we are working with events we want to ensure that we are being passive about out control, so return true allows for events to always continue
	});

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, document, vapour );