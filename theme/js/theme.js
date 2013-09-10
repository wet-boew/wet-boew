/*!
*
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
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
					theme.onMediumSmallView();
				} else {
					// Desktop
					theme.onLargeView();
				}
			}
			theme.previousBreakPoint = breakpoint;
		},
		
		onLargeView: function(){
			/*var languageSelect= document.querySelector('#wb-lang'),
				header = document.querySelector('header .container');

			header.insertBefore(languageSelect, header.firstChild);*/
		},
		
		onMediumSmallView: function(){
			//Disable transitions during the reflow
			$(document.body).addClass('notransition'); //TODO convert to native DOM
			setTimeout(function(){
				$(document.body).removeClass('notransition');
			}, 0);
			
			/*var languageSelect= document.querySelector('#wb-lang'),
			footer = document.querySelector('footer');
			
			footer.insertBefore(languageSelect, footer.querySelector('.nav-close').nextSibling);*/
		}
	};
	
	$(document).on('ready', theme.onResize);
	$(window).on('resize', theme.onResize);
}(jQuery));