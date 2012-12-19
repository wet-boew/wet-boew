/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Picture element plugin
 */
(function () {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.picture = {
		type : 'plugin',
		depends : ['picturefill', 'matchMedia', 'resize'],
		_exec : function (elm) {	
			var w = window;			

			// Remove the picturefill resize event listener and let pe.resize to do the work
			if(w.removeEventListener) {
				w.removeEventListener( "resize", w.picturefill, false );
			}
			_pe.resize(function() {
				w.picturefill();
			});	
			
			w.picturefill();	
			elm.find('img').css({visibility: 'visible'});				
			
			return elm;					
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
());
