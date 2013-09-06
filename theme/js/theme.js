/*!
*
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
*
* Version: @wet-boew-build.version@
*
*/
/*global jQuery: false, document: false, window: false*/
/*jshint bitwise: false, evil: true, scripturl: true */
(function ($) {
	var theme = {
		previousBreakPoint: -1,
		
		onResize: function(){
			var breakpoint = parseInt($('html').css('margin-bottom'), 10);
			if (breakpoint !== theme.previousBreakPoint) {
				if (breakpoint < 4) {
					// Mobile
					theme.onMobileView();
				} else {
					// Desktop
					theme.onDesktopView();
				}
			}
			theme.previousBreakPoint = breakpoint;
		},
		
		onDesktopView: function(){
			var languageSelect= document.querySelector('#wb-lang'),
				header = document.querySelector('header .container');

			header.insertBefore(languageSelect, header.firstChild);
		},
		
		onMobileView: function(){
			//Disable transitions during the reflow
			$(document.body).addClass('notransition'); //TODO convert to native DOM
			setTimeout(function(){
				$(document.body).removeClass('notransition');
			}, 0);
			
			var languageSelect= document.querySelector('#wb-lang'),
			footer = document.querySelector('footer');
			
			footer.insertBefore(languageSelect, footer.querySelector('.nav-close').nextSibling);
		}
	};
	
	$(document).on('ready', theme.onResize);
	$(window).on('resize', theme.onResize);
}(jQuery));