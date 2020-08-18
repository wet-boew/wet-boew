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
				attrEngaged = "data-wb-engaged",
				$buttons = $( "[type=submit]", $elm ),
				multiple = typeof $elm.data( componentName + "-multiple" ) !== "undefined",
				classToggle = settings.toggle || "hide",
				selectorSuccess = settings.success,
				selectorFailure = settings.failure || selectorSuccess;

			// Set "clicked" attribute on element that initiated the form submit
			$buttons.on( "click", function() {
				$buttons.removeAttr( attrEngaged );
				$( this ).attr( attrEngaged, "" );
			} );

			elm.addEventListener( "submit", function( e ) {

				// Prevent regular form submit
				e.preventDefault();

				if ( !$( this ).attr( attrEngaged ) ) {
					var data = $elm.serializeArray(),
						$btn = $( "[type=submit][" + attrEngaged + "]", $elm ),
						$selectorSuccess = $( selectorSuccess ),
						$selectorFailure = $( selectorFailure );

					if ( $btn ) {
						data.push( { name: $btn.attr( "name" ), value: $btn.val() } );
					}
					$( this ).attr( attrEngaged, true );

					// Hide feedback messages
					$selectorFailure.addClass( classToggle );
					$selectorSuccess.addClass( classToggle );

					$.ajax( {
						type: this.method,
						url: this.action,
						data: $.param( data )
					} )
					.done( function() {
						$selectorSuccess.removeClass( classToggle );
					} )
					.fail( function() {
						$selectorFailure.removeClass( classToggle );
					} )
					.always( function() {

						// Make the form submittable again if multiple submits are allowed or hide
						if ( multiple ) {
							$elm.removeAttr( attrEngaged );
						} else {
							$elm.addClass( classToggle );
						}
					} );
				}
			} );

			wb.ready( $( elm ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
