/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*
 * Responsive image plugin
 */
(function () {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};

	_pe.fn.responsiveimg = {
		type : 'plugin',
		depends : ['picturefill', 'matchMedia'],
		_initialized : false,
		_exec : function (elm) {
			var w = window;

			// Prevent multiple initializations of the plugin
			if(this._initialized === false) {

				// Remove the picturefill resize event listener and let pe.resize to do the work
				if(w.removeEventListener) {
					w.removeEventListener( "resize", w.picturefill, false );
				}
				_pe.resize(function() {
					w.picturefill();
				});
				w.picturefill();

				this._initialized = true;
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
());
