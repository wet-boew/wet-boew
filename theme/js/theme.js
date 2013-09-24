/*!
*
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*
* Version: @wet-boew-build.version@
*
*/
(function ($, vapour) {
	var theme = {
		previousBreakPoint: -1,
		
		onResize: function(){
			var breakpoint = parseInt($('html').css('margin-bottom'), 10);
			if (breakpoint !== theme.previousBreakPoint) {
				switch (breakpoint){
					case 4:
						vapour.doc.trigger('xlargeview');
						break;
					case 3:
						vapour.doc.trigger('largeview');
						break;
					case 2:
						vapour.doc.trigger('mediumview');
						break;
					case 1:
						vapour.doc.trigger('smallview');
						break;
					case 0:
						vapour.doc.trigger('xsmallview');
						break;
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

	vapour.doc.on('xlargeview largeview mediumview smallview xsmallview', function(event) {
		if (event.type === 'xlargeview' || event.type === 'largeview') {
			theme.onLargeView();
		}else if (event.type === 'mediumview') {
			theme.onMediumSmallView();
			theme.onMediumView();
		}else if (event.type === 'xsmallview' || event.type === 'smallview') {
			theme.onMediumSmallView();
			theme.onSmallView();
		}
	});
	
	vapour.win.on('resize', theme.onResize);
	theme.onResize();
}(jQuery, vapour));