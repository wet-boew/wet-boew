/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Expand/Collapse All Content plugin
 */
/*global jQuery: false, wet_boew_expandcollapseall: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.expandcollapseall = {
		type : 'plugin',
		_open : false,			// Globally track the toggle state to support multiple controls on a page
		_togglers : [],			// Reference to all toggle controls
		_aria_controls : null,	// Space separated ID list of <details> elements for toggle control aria-controls attribute
		_exec : function (elm) {		
			var opts,
				overrides,
				$window;
				
			// Default options
			opts = { 
				togglers: {			// Define the toggle controls to create
					toggle: false,	// Toggle open and close
					open: false,	// Toggle open only
					close: false	// Toggle close only
				},	 
				accentFirst: false,	// Add 'button-accent' class to first toggle control
				printOpen: false,	// Toggle open before print
				text: {				// Button text and titles
					toggle: _pe.dic.get('%td-toggle'),
					open: _pe.dic.get('%td-open'),
					close: _pe.dic.get('%td-close'),
					titleOpen: _pe.dic.get('%td-ttl-open'),
					titleClose: _pe.dic.get('%td-ttl-close')
				}
			};				
				
			// Check for overrides from CSS classes
			overrides = {
				togglers: {
					toggle: elm.hasClass('toggle') ? true : false,
					open: elm.hasClass('toggle-open') ? true : false,
					close: elm.hasClass('toggle-close') ? true : false
				},
				accentFirst: elm.hasClass('accent-first') ? true : undefined,
				printOpen: elm.hasClass('print-open') ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_expandcollapseall) and class-based overrides
			$.extend(opts, (typeof wet_boew_expandcollapseall !== 'undefined' ? wet_boew_expandcollapseall : {}), overrides, _pe.data.getData(elm, 'wet-boew'));
			
			// Create the toggle controls and add them to the page
			this._initTogglers(elm, opts);
			
			// Open details on print
			if(opts.printOpen) {
				$window = _pe.window;
				
				// Native event support
				$window.on('beforeprint', $.proxy(function() {
					this.setOpen(false);
					this.toggle();	
				}, this));		
				
				// Fallback for browsers that don't support print event
				if (window.matchMedia) {	
					window.matchMedia('print').addListener(function(query) {						
						if (query.matches) {
							$window.trigger('beforeprint');
						}
					});
				}
				
				// Polyfill open using CSS
				$('details').addClass('print-open');			
			}			
			return elm;					
		}, // end of exec
				
		isOpen : function() {				
			return this._open === true;
		},
		
		setOpen : function(open) {
			this._open = open;
		},
		
		toggle : function() {
			var $details = $('details');
			
			// Set the state we're currently in and trigger the change
			$details.prop('open', this.isOpen());
			$details.find('summary').click();	
			
			// Update our state and the title of the toggler controls
			this.setOpen(!this.isOpen());
			for(var i = 0, length = this._togglers.length; i < length; i++) {
				this._setTitle(this._togglers[i]);
			}
		},
			
		_initTogglers : function(elm, opts) {
			var li,
				toggler,
				types,				
				ul = document.createElement('ul'); 
			
			// Make sure there is at least one toggle control 
			if(!opts.togglers || (!opts.togglers.toggle && !opts.togglers.open && !opts.togglers.close)){
				opts.togglers.toggle = true;
			}
							
			// Create the requested togglers and add to the page
			types = _pe.array.keys(opts.togglers);
			for(var i = 0, length = types.length; i < length; i++) {
				if(opts.togglers[types[i]] === true) {
					toggler = this._createToggler(types[i], opts);
					li = document.createElement('li');
					li.appendChild(toggler[0]);
					ul.appendChild(li);
					this._togglers.push(toggler);
				}
			}
			ul.className = 'menu-horizontal';
			elm.append(ul);	
			
			if(opts.accentFirst === true) {
				this._togglers[0].addClass('button-accent');
			}			
		},
		
		_createToggler : function(type, opts) {
			var $toggler = $('<a>').attr({
					'href': '#',
					'role': 'button',
					'class': 'button',
					'aria-controls': this._getAriaControls(),
					'data-type': type,
					'data-title-close': opts.text.titleClose,
					'data-title-open': opts.text.titleOpen
				}).text(opts.text[type]);
			
			$toggler.on('click', $.proxy(function(e) {
				this.setOpen(type === 'open' ? false : type === 'close' ? true : this.isOpen());
				this.toggle();
				e.preventDefault();
				e.target.focus();		
			}, this));			
			
			this._setTitle($toggler);
			return $toggler;
		},
		
		_getAriaControls : function() {
			var ids = '';
			
			// Init with a space separated list of <details> element IDs
			if(this._aria_controls === null) {
				$('details').each(function(idx) {
					if(this.id === '') {
						this.id = 'details_' + idx;
					}
					ids += this.id + ' ';
				});
				this._aria_controls = $.trim(ids);
			}
			return this._aria_controls;
		},			
		
		_setTitle : function(toggler) {
			var type = toggler.data('type');
			toggler[0].title = type === 'close' || (type !== 'open' && this.isOpen()) ? toggler.data('title-close') : toggler.data('title-open');
		}		
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
