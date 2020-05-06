/**
 * @title WET-BOEW wb-postback
 * @overview This plugin implements AJAX request for form data to submit on same page without refresh
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @masterbee, @namjohn920, @GormFrank
 **/
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-postback",
	selector = ".provisional." + componentName,
	initEvent = "wb-init" + selector,
	defaults = {},

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {
			var $elm = $( elm ),
				settings = $.extend(
					true,
					{},
					defaults,
					wb.getData( $elm, componentName )
				),
				attrClick = "data-wb-clicked",
				$buttons = $( "[type=submit]", $elm ),
				classToggle = settings.toggle || "hide",
				selectorContent = settings.content,
				selectorSuccess = settings.success,
				selectorFailure;

			// Success selector is strict minimum
			if ( !selectorContent ) {
				throw componentName + " success setting is mandatory";
			}

			// Use success selector if no failure selector is provided
			selectorFailure = settings.failure || selectorSuccess;

			// Set "clicked" attribute on element that initiated the form submit
			$buttons.on( "click", function() {
				$buttons.removeAttr( attrClick );
				$( this ).attr( attrClick, "" );
			} );

			elm.addEventListener( "submit", function( e ) {

				// Prevent regular form submit
				e.preventDefault();

				var data = $elm.serializeArray(),
					$btn = $( "[type=submit][" + attrClick + "]", $elm ),
					$selectorSuccess = $( selectorSuccess ),
					$selectorFailure = $( selectorFailure );

				if ( $btn ) {
					data.push( { name: $btn.attr( "name" ), value: $btn.val() } );
				}

				$.ajax( {
					type: this.method,
					url: this.action,
					data: $.param( data )
				} )
				.done( function() {
					$selectorFailure.addClass( classToggle );
					$selectorSuccess.removeClass( classToggle );
				} )
				.fail( function() {
					$selectorSuccess.addClass( classToggle );
					$selectorFailure.removeClass( classToggle );
				} )
				.always( function() {
					if ( selectorContent ) {
						$( selectorContent ).addClass( classToggle );
					}
				} );
			} );

			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
