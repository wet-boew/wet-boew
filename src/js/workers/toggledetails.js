/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Toggle details plugin
 */
/*global jQuery: false, wet_boew_toggledetails: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.toggledetails = {
		type : 'plugin',
		_open : false,	// Globally track the toggle state to support multiple controls on a page
		_togglers : [],	// Reference to all toggle controls. Allows for easy title attribute update on state change.
		_exec : function (elm) {		
			var opts,
				overrides;
				
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
				printOpen: elm.hasClass('print-open') ? true : undefined,
				title : elm.hasClass('no-title') ? false : opts.title
			};
			
			// Extend the defaults with settings passed through settings.js (wet_boewtoggledetails) and class-based overrides
			if (typeof wet_boew_toggledetails !== 'undefined' && wet_boew_toggledetails !== null) {
				$.extend(opts, wet_boew_toggledetails, overrides);
			} else {
				$.extend(opts, overrides);
			}	
			
			this._togglers.push({elm: elm, opts: opts});
			this._setTitle(elm, opts);			
			
			// Handle toggle control clicks
			elm.on('click', $.proxy(function(e) {				
				this.setOpen(opts.onlyOpen ? false : opts.onlyClose ? true : this.isOpen());
				this.toggle();
				e.preventDefault();
				e.target.focus();
			}, this));				
			
			// Open details on print.
			// TODO Add support for Opera and WebKit
			if(opts.printOpen) {
				$(window).on('beforeprint', $.proxy(function() {
					this.setOpen(false);
					this.toggle();	
				}, this));			
			}
			
			return elm;					
		}, // end of exec
				
		isOpen : function() {				
			return this.open === true;
		},
		
		setOpen : function(open) {
			this.open = open;
		},
		
		toggle : function() {
			var i = 0, 
				l = this._togglers.length,
				$details = $('details');
			
			// Set the state we're currently in and trigger the change
			$details.prop('open', this.isOpen());
			$details.find('summary').click();	
			
			// Update our state and the title of the togglers
			this.setOpen(!this.isOpen());
			for(; i < l; i++) {
				this._setTitle(this._togglers[i].elm, this._togglers[i].opts);
			}
		},

		_setTitle : function(elm, opts) {
			if(opts.title !== false) {
				elm[0].title = opts.onlyClose || (!opts.onlyOpen && this.isOpen()) ? opts.title.close : opts.title.open;
			}
		}		
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));