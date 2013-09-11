/*!
*
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*
* Version: @wet-boew-build.version@
*
*/
(function ($) {
	var theme = {
		previousBreakPoint: -1,
		
		onResize: function(){
			var breakpoint = parseInt($('html').css('margin-bottom'), 10);
			if (breakpoint !== theme.previousBreakPoint) {
				if (breakpoint >= 4) {
					theme.onLargeView();
				} else {
					theme.onMediumSmallView();
					if (breakpoint > 1) {
							theme.onMediumView();
					} else {
							theme.onSmallView();
					}
				}
			}
			theme.previousBreakPoint = breakpoint;
		},
		
		onLargeView: function(){
			return;
		},
		
		onMediumSmallView: function(){
			return;
		},
		
		onMediumView: function(){
			return;
		},
		
		onSmallView: function(){
			return;
		}
	};
	
	$(document).on('ready', theme.onResize);
	$(window).on('resize', theme.onResize);
}(jQuery));