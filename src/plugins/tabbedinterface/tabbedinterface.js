/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * tabbedinterface plugin
 */
/*jshint unused: false */
/*global console */
(function( $, win, vapour ) {
	"use strict";
	var selector = ".wet-boew-tabbedinterface, .wb-tabbedinterface",
		$doc = vapour.doc,
		init = function() {
			var $widget = $(this),
				style,
				controls;
			win._timer.remove( selector );
			
			$widget.addClass('wb-carousel');
			$widget.children('.tabs-panel').children().addClass('item').first().addClass('in');
			style = $widget.attr('class').match(/tabs-style-(\d+)/);
			// style is something like ["tabs-style-2", "2", index: 25, input: "wet-boew-tabbedinterface tabs-style-2 cycle-slow animate slide-horz wb-carousel"]
			if (style && style[1] > 1) {
				controls = $('<ul class="tabs-controls"><li class="tabs-toggle"><a class="prv" href="javascript:;" role="button">&nbsp;&nbsp;&nbsp;<span class="wb-invisible">Previous</span></a></li><li class="tabs-toggle"><a class="nxt" href="javascript:;" role="button">&nbsp;&nbsp;&nbsp;<span class="wb-invisible">Next</span></a></li><li class="tabs-toggle"><a class="plypause" href="javascript:;" role="button">Play<span class="wb-invisible">  -  Start tab rotation</span></a></li></ul>');
				$widget.append(controls);
			}
			$widget.trigger('carousel.init.wb');
			//console.log(this);
		};
	
	// Bind the init event of the plugin
	$doc.on( "wb.timerpoke", selector, init );

	// Add the timer poke to initialize the plugin
	win._timer.add( selector );

}( jQuery, window, vapour ));

/*
For reference, vapour is an object:
{
	"/": "file:///C:/Users/Dave/Documents/GitHub/schindld/wet-boew/dist/js", 
	"/assets": "file:///C:/Users/Dave/Documents/GitHub/schindld/wet-boew/dist/js/assets", 
	"/templates": "file:///C:/Users/Dave/Documents/GitHub/schindld/wet-boew/dist/js/assets/templates", 
	"/deps": "file:///C:/Users/Dave/Documents/GitHub/schindld/wet-boew/dist/js/deps", 
	"mode": ".min",
	"doc": $(document),
	"getMode": function (){return this.mode},
	"getPath": function (a){var b;return b=this.hasOwnProperty(a)?this[a]:c},
	"mode": ".min"
}
*/