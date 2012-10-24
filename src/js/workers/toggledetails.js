/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Toggle details plugin
 */
/*global jQuery: false, wet_boewtoggledetails: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.toggledetails = {
		type : 'plugin',
		_open : false,	// Globally track the toggle state to allow for multiple controls on a page
		_togglers : [],	// All toggler elements on a page.  Allows for easy title attribute update on state change.
		_exec : function (elm) {		
			var opts,
				overrides,				
				$details = $('details'),
				$summary = $details.find('summary');
				
			// Default options
			opts = { 
				onlyOpen: false,	// Only toggle open
				onlyClose: false,	// Only toggle closed
				printOpen: false,	// Toggle open before print
				title: {			// Title attribute text
					open: _pe.dic.get('%toggle-open'),
					close: _pe.dic.get('%toggle-close')
				}
			};				
				
			// Check for overrides from CSS classes
			overrides = {					
				onlyOpen: elm.hasClass('only-open') ? true : undefined,
				onlyClose: elm.hasClass('only-close') ? true : undefined,
				printOpen: elm.hasClass('print-open') ? true : undefined					
			};
			
			// Extend the defaults with settings passed through settings.js (wet_boewtoggledetails) and class-based overrides
			if (typeof wet_boewtoggledetails !== 'undefined' && wet_boewtoggledetails !== null) {
				$.extend(opts, wet_boewtoggledetails, overrides);
			} else {
				$.extend(opts, overrides);
			}	
			
			this._togglers.push({elm: elm, opts: opts});
			this._setTitle(elm, opts);			
			
			// Handle toggle control clicks
			elm.on('click', function(e) {
				var open = _pe.fn.toggledetails.isOpen();	
				
				e.preventDefault();
				
				if((opts.onlyOpen && open) || (opts.onlyClose && !open)) {
					return;
				}
				_pe.fn.toggledetails.toggle($details, $summary);
			});				
			
			// Open details on print.
			// TODO Add support for Opera and WebKit
			if(opts.printOpen){
				$(window).on('beforeprint', function(){
					_pe.fn.toggledetails.setOpen(false);
					_pe.fn.toggledetails.toggle($details, $summary);	
				});			
			}			
			return elm;	
			
			
		}, // end of exec
		
		isOpen : function() {				
			return this.open === true;
		},	
		
		setOpen : function(open) {
			this.open = open;
		},
		
		toggle : function($details, $summary) {
			var i, l = this._togglers.length;
			
			$details.attr('open', (this.isOpen() ? 'open' : null));
			$summary.trigger('click');	
			
			this.setOpen(!this.isOpen());			
			for(i = 0; i < l; i++) {
				this._setTitle(this._togglers[i].elm, this._togglers[i].opts);
			}
		},

		_setTitle : function(elm, opts) {
			elm.attr('title', (opts.onlyClose || (!opts.onlyOpen && this.isOpen()) ? opts.title.close : opts.title.open));
		}		
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));