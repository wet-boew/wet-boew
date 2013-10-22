/*
 * @title WET-BOEW Progress polyfill
 * @overview The <progress> element displays the progress of a task.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var selector = "progress",
	$document = vapour.doc,

	/*
	 * Init runs once per polyfill element on the page. There may be multiple elements. 
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {DOM element} _input The input field to be polyfilled
	 */
	init = function( _elm ) {
		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		progress( _elm );
	},

	progress = function( _elm ) {
		var $elm = $( _elm ),
			$progress = $elm.children( ".outer, .undef" ),
			ariaValueMax = 1.0,
			ariaValueNow;

		$elm.off( "DOMAttrModified propertychange" );
		_elm.setAttribute( "role", "progressbar" );

		if ( _elm.getAttribute( "value" ) !== null ) {
			if ( $progress.length === 0 ) {
				$progress = $( "<div class='outer'><div class='inner'/></div>" );
				$elm.append( $progress );
			}

			try {
				ariaValueMax = parseFloat( _elm.getAttribute( "max" ) );
			} catch ( error ) {
			}

			ariaValueNow = _elm.getAttribute( "value" );
			if ( ariaValueNow > ariaValueMax ) {
				ariaValueNow = ariaValueMax;
			}

			$progress.children( ".inner" ).css( "width", ( ( ariaValueNow / ariaValueMax ) * 100 ) + "%" );

			_elm.setAttribute( "aria-valuemin", 0 );
			_elm.setAttribute( "aria-valuemax", ariaValueMax );
			_elm.setAttribute( "aria-valuenow", ariaValueNow );
		} else if ( $progress.length === 0 ) {
			$elm.append( "<div class='undef'/>" );
		}

		setTimeout(function () {
			$elm.on( "DOMAttrModified propertychange", function() {
				progress( this );
			});
		}, 0 );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function( event ) {
	init( event.target );

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control, 
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, vapour );
