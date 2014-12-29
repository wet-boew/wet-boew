/**
 * @title WET-BOEW Sticky table of contents
 * @overview Provides a sticky table of contents to the right of the content
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard, @zachfalsetto
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-tableofcontents",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	tocIDPrefix = "wb-toc-",
	contentClasses = "col-md-9 col-md-pull-3",
	navClasses = "col-md-3 col-md-push-9",
	pageTitle = "#wb-cont",
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
			$elm, $toc, $secList, c;

		if ( elm ) {
			$elm = $( elm );

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					toc: i18n( "toc" )
				};
			}

			$toc = $( "<nav class=\"" + navClasses + "\"></nav>" );
			$( "<h2>" + i18nText.toc + "</h2>" ).appendTo( $toc );
			$secList = $( "<ol>" );
			c = 0;

			$elm.find( "h2, h3, h4, h5, h6" ).each( function() {
				var $this = $( this );

				if ( typeof $this.attr( "id" ) === "undefined" ) {
					c += 1;
					$this.attr( "id", tocIDPrefix + c );
				}

				$( "<li><a href=\"#" + $this.attr( "id" ) + "\">" + $this.text() + "</a></li>" ).appendTo( $secList );
			} );

			$toc.append( $secList ).insertAfter( pageTitle );
			$( pageTitle ).siblings().wrapAll( "<div class=\"row\"></div>" );
			$toc.siblings().wrapAll( "<div class=\"" + contentClasses + "\"></div>" );

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	};

$document.on( "timerpoke.wb " + initEvent, selector, function( event ) {
	var eventType = event.type/*,
		which = event.which,
		eventTarget = event.target,
		eventTurrentTarget = event.currentTarget*/;

	switch ( eventType ) {
	case "timerpoke":
	case "wb-init":
		init( event );
		break;
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
