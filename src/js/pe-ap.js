/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Dependencies for pe
 * - desktop will more than likely be more intensive in terms of capabilities
 * - mobile will be thinner
 */
/*
 * pe, a progressive javascript library agnostic framework
 */
/*global jQuery: false, wet_boew_properties: false, wet_boew_theme: false, fdSlider: false, document: false, window: false, setTimeout: false, navigator: false, localStorage: false, makeMeter: false*/
/*jshint bitwise: false, evil: true, scripturl: true */
(function ($) {
	"use strict";
	var pe, _pe;
	/**
	* pe object
	* @namespace pe
	*/
	pe = (typeof window.pe !== 'undefined' && window.pe !== null) ? window.pe : {
		fn: {}
	};
	_pe = {
		/** Global object init properties */
		/**
		* @memberof pe
		* @type {string} Page language, defaults to 'en' if not available
		*/
		language: 'en',
		languages: ['@wet-boew-build.languagelist@'],
		rtl: false,
		touchscreen: 'ontouchstart' in document.documentElement,
		mobileview: (wet_boew_theme !== null && typeof wet_boew_theme.mobileview === 'function'),
		suffix: $('body script[src*="/pe-ap"]').attr('src').indexOf('-min') !== -1 ? '-min' : '', // determine if pe is minified
		header: $('#wb-head'),
		bodydiv: $('body > div'),
		main: $('#wb-main'),
		secnav: $('#wb-sec'),
		footer: $('#wb-foot'),
		html: $('html'),
		document: $(document),
		window: $(window),
		urlpage: '',
		urlhash: '',
		urlquery: '',
		svg: ($('<svg xmlns="http://www.w3.org/2000/svg" />').get(0).ownerSVGElement !== undefined),
		svgfix: false,
		viewtest: '',
		resizetest: '',
		settings: (typeof wet_boew_properties !== 'undefined' && wet_boew_properties !== null) ? wet_boew_properties : false,
		scrollTopInit: window.pageYOffset || document.documentElement.scrollTop,
		activeElement: null,

		/**
		* @namespace pe.dic
		*/
		dic: {
			get: function (key, state, mixin) {
				var truthiness = (typeof key === 'string' && key !== '') | // eg. 000 or 001 ie. 0 or 1
					(typeof state === 'string' && state !== '') << 1 | // eg. 000 or 010 ie. 0 or 2
					(typeof mixin === 'string' && mixin !== '') << 2; // eg. 000 or 100 ie. 0 or 4
				switch (truthiness) {
					case 1:
						return this.ind[key]; // only key was provided.
					case 3:
						return this.ind[key][state]; // key and state were provided.
					case 7:
						return this.ind[key][state].replace('[MIXIN]', mixin); // key, state, and mixin were provided.
					default:
						return '';
				}
			},
			/*
			@dictionary function : pe.dic.ago()
			@returns: a human readable time difference text
			*/
			ago: function (time_value) {
				var delta,
					parsed_date,
					r,
					relative_to;
				parsed_date = pe.date.convert(time_value);
				relative_to = (arguments.length > 1 ? arguments[1] : new Date());
				delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);
				delta = delta + (relative_to.getTimezoneOffset() * 60);
				r = '';
				if (delta < 60) {
					r = this.get('%minute-ago');
				} else if (delta < 120) {
					r = this.get('%couple-of-minutes');
				} else if (delta < (45 * 60)) {
					r = this.get('%minutes-ago', 'mixin', (parseInt(delta / 60, 10)).toString());
				} else if (delta < (90 * 60)) {
					r = this.get('%hour-ago');
				} else if (delta < (24 * 60 * 60)) {
					r = this.get('%hours-ago', 'mixin', (parseInt(delta / 3600, 10)).toString());
				} else if (delta < (48 * 60 * 60)) {
					r = this.get('%yesterday');
				} else {
					r = this.get('%days-ago', 'mixin', (parseInt(delta / 86400, 10)).toString());
				}
				return r;
			}
		},

		/**
		* @memberof pe
		* @type {number} - IE major number if browser is IE, 0 otherwise
		*/
		ie: (/(MSIE) ([\w.]+)/.exec(navigator.userAgent) || [])[2] || '0',
		/**
		* A private function for initializing for pe.
		* @function
		* @memberof pe
		* @returns {void}
		*/
		_init: function () {
			var $html = pe.html,
				hlinks_same = [],
				target,
				classes = '',
				test,
				test_elms,
				silentscroll_fired = false,
				pageinit_fired = false,
				init_on_mobileinit = false;

			// Determine the page language and if the text direction is right to left (rtl)
			test = $html.attr('lang');
			if (typeof test !== 'undefined' && test.length > 0) {
				pe.language = test;
			}
			test = $html.attr('dir');
			if (typeof test !== 'undefined' && test.length > 0) {
				pe.rtl = (test === 'rtl');
			}

			// View test: Used to detect CSS media query result regarding screen size and mobile/desktop view
			pe.viewtest = document.createElement('div');
			pe.viewtest.setAttribute('id', 'viewtest');

			// Resize test element: Used to detect changes in text size and window size
			pe.resizetest = document.createElement('span');
			pe.resizetest.innerHTML = '&#160;';
			pe.resizetest.setAttribute('id', 'resizetest');

			// Append the various tests to the body
			test_elms = document.createElement('div');
			test_elms.appendChild(pe.viewtest);
			test_elms.appendChild(pe.resizetest);
			document.body.appendChild(test_elms);

			// Load polyfills that need to be loaded before anything else
			pe.polyfills.init();

			// Get the hash and query parameters from the URL
			pe.urlpage = pe.url(window.location.href);
			pe.urlhash = pe.urlpage.hash;
			pe.urlquery = pe.urlpage.params;

			// Identify whether or not the device supports JavaScript, the current theme, the current view and screen size, and if the device has a touchscreen
			pe.mobile = pe.mobilecheck();
			pe.medium = pe.mediumcheck();
			pe.print = (pe.mobile ? false : pe.printcheck());

			// Add theme specific CSS classes and favicon
			if (wet_boew_theme !== null) {
				classes += wet_boew_theme.theme + (pe.mobile ? (' mobile-view' + (pe.medium ? ' medium-screen' : ' small-screen')) : (pe.print ? ' print-view' : ' desktop-view large-screen'));
				if (typeof wet_boew_theme.favicon !== 'undefined') {
					pe.add.favicon(pe.add.themecsslocation.replace(/css\/$/, wet_boew_theme.favicon.href), wet_boew_theme.favicon.rel, wet_boew_theme.favicon.sizes);
				}
			}
			classes += (pe.touchscreen ? ' touchscreen' : '');
			classes += (pe.svg ? ' svg' : ' no-svg');
			classes += (pe.ie > 8 ? ' ie' + parseInt(pe.ie, 10) : (pe.ie < 1 ? ' no-ie' : ''));

			// Check for browsers that needs SVG loaded through an object element removed
			test = navigator.userAgent.match(/WebKit\/53(\d)\.(\d{1,2})/i);
			pe.svgfix = (!(test === null || parseInt(test[1], 10) > 4 || (parseInt(test[1], 10) === 4 && parseInt(test[2], 10) >= 46)));

			// Is this a mobile device?
			if (pe.mobile) {
				// Detect if pre-OS7 BlackBerry device is being used
				test = navigator.userAgent.indexOf('BlackBerry');
				if (test === 0) {
					classes += ' bb-pre6 bb-pre7';
				} else if (test !== -1 && navigator.userAgent.indexOf('Version/6') !== -1) {
					classes += ' bb-pre7';
				}
			}

			// Remove the "no-js" class and add the identification classes to the HTML element.
			$html.removeClass('no-js').addClass(classes);

			pe.bodydiv.attr('data-role', 'page').addClass('ui-page-active');

			// If the page URL includes a hash upon page load, then focus on and scroll to the target
			// pe.scrollTopInit is a workaround for jQuery Mobile scrolling to the top by restoring the original scroll point
			// TODO: Find an elegant way (preferably in jQuery Mobile) to prevent the scroll to top except where needed or at least restore the original scroll point
			pe.window.on('scroll.wbinit', function() {
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				if (scrollTop > 1) {
					pe.scrollTopInit = scrollTop;
				}
			});
			pe.document.on('focus.wbinit blur.wbinit', function(e) {
				var target = e.target;
				if (e.type === 'focus.wbinit' && target.nodeName.toLowerCase() !== 'body' && target.getAttribute('data-role') !== 'page') {
					pe.activeElement = target;
				} else {
					pe.activeElement = null;
				}
			});
			pe.document.on('silentscroll.wbinit', function() {
				var scrollTop = pe.scrollTopInit,
					activeElement = pe.activeElement;

				silentscroll_fired = true;
				// Remove event handlers
				if (pageinit_fired) {
					pe.document.off('silentscroll.wbinit');
				}
				pe.window.off('scroll.wbinit');
				pe.document.off('focus.wbinit blur.wbinit');

				// Restore the original focus and/or scroll position
				if (activeElement !== null) {
					target = $(activeElement);
				} else if (pe.urlhash.length !== 0) {
					target = pe.main.find('#' + pe.string.jqescape(pe.urlhash));
					target.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
				}
				if (typeof target !== 'undefined' && target.length !== 0) {					
					pe.focus(target);
					$.mobile.silentScroll(scrollTop > 1 ? scrollTop : target.offset().top);
				} else if (scrollTop > 1) {
					$.mobile.silentScroll(scrollTop);
				}
			});

			pe.document.on('mobileinit', function () {
				$.extend($.mobile, {
					ajaxEnabled: false,
					pushStateEnabled: false,
					autoInitializePage: (init_on_mobileinit ? true : false)
				});
				if (init_on_mobileinit) {
					pe.mobilelang();
				}
			});

			pe.document.on('pageinit', function () {
				pageinit_fired = true;
				// Remove the silentscroll handling for determining scrollTop if the silentscroll event has already fired
				if (silentscroll_fired) {
					pe.document.off('silentscroll.wbinit');
				}

				// Removes tabindex="0" from the first div within the body element (workaround for jQuery Mobile applying tabindex="0" which results in focus shifting to the first div on mouse click)
				// TODO: Find a more elegant way to address this in jQuery Mobile
				pe.bodydiv.removeAttr('tabindex');
			
				// On click, puts focus on and scrolls to the target of same page links
				$(hlinks_same).off('click vclick').on('click.hlinks vclick.hlinks', function () {
					var hash = this.hash,
						node = document.getElementById(hash.substring(1)),
						$node,
						nodeName,
						role;

					if (node !== null) {
						$node = $(node);
						nodeName = node.nodeName.toLowerCase();
						if (nodeName !== 'a' && nodeName !== 'button' && nodeName !== 'input' && nodeName !== 'textarea' && nodeName !== 'select') {
							node.setAttribute('tabindex', '-1');
						}

						pe.focus($node);
						role = $node.jqmData('role');
						if (role === undefined || (role !== 'page' && role !== 'dialog' && role !== 'popup')) {
							window.location.hash = hash;
						}
					}
				});

				// Workaround to ensure that the expanded area of a jQuery Mobile accordion doesn't disappear off the top of the viewport
				pe.document.on('expand', function(e) {
					var yPos = $(e.target).offset().top;
					if (yPos < _pe.window.scrollTop()) {
						$.mobile.silentScroll(yPos);
					}
				});
			});

			// Load ajax content
			$.when.apply($, $.map($('*[data-ajax-replace], *[data-ajax-append]'), function (o) {
				var $o = $(o),
					replace = false,
					url;
				if ($o.attr('data-ajax-replace') !== undefined) {
					replace = true;
					url = $o.attr('data-ajax-replace');
				} else if ($o.attr('data-ajax-append') !== undefined) {
					url = $o.attr('data-ajax-append');
				}
				return $.get(url, function (data) {
					if (replace) {
						$o.empty();
					}
					$o.append($.trim(data));
				}, 'html');
			})).always(function () {
				var hlinks = document.getElementsByTagName('a'),
					hlink,
					pathname = window.location.pathname,
					search = window.location.search,
					len = hlinks.length,
					href;
				while (len--) {
					hlink = hlinks[len];
					href = hlink.getAttribute('href');
					if (href !== null && href.length !== 1 && href.indexOf('#') !== -1 && hlink.getAttribute('data-rel') === null && (pathname.indexOf(hlink.pathname) !== -1) && hlink.search === search) {
						hlinks_same.push(hlink);
					}
				}

				// Wait for localisation and ajax content to load plugins
				pe.document.one('languageloaded', function () {
					if (wet_boew_theme !== null) {
						// Initialize the theme
						wet_boew_theme.init();
					}

					// Check to see if PE enhancements should be disabled
					if (pe.pedisable() === true) {
						return false; // Disable PE enhancements
					}

					if (wet_boew_theme !== null) {
						pe.document.one('themeviewloaded', function () {
							if (typeof $.mobile !== 'undefined') {
								pe.mobilelang();
								$.mobile.initializePage();
							} else {
								init_on_mobileinit = true;
							}
						});

						// Load the mobile or desktop view
						if (pe.mobile) {
							wet_boew_theme.mobileview();
						} else {
							wet_boew_theme.desktopview();
						}
					} else {
						if (typeof $.mobile !== 'undefined') {
							pe.mobilelang();
							$.mobile.initializePage();
						} else {
							init_on_mobileinit = true;
						}
					}
					pe.dance();
				});
				pe.add.language(pe.language);
			});
		},
		/**
		* Mobile identification
		* @memberof pe
		* @type {boolean} true if browser is not IE < 9 and browser window size is less than 767px wide.
		*/
		mobile: false,
		mobilecheck: function () {
			return pe.viewtest.offsetWidth > 1; // CSS (through media queries) sets to offsetWidth = 0 in print view, offsetWidth = 1 desktop view (large screen), offsetWidth = 2 or 3 mobile view (2 = small screen, 3 = medium screen)
		},
		print: false,
		printcheck: function () {
			return pe.viewtest.offsetWidth === 0; // CSS (through media queries) sets to offsetWidth = 0 in print view
		},
		medium: false,
		mediumcheck: function () {
			return pe.viewtest.offsetWidth === 3; // CSS (through media queries) sets to offsetWidth = 3 for medium screen
		},
		mobilelang: function () {
			// Apply internationalization to jQuery Mobile
			$.mobile.collapsible.prototype.options.expandCueText = pe.dic.get('%jqm-expand');
			$.mobile.collapsible.prototype.options.collapseCueText = pe.dic.get('%jqm-collapse');
			$.mobile.dialog.prototype.options.closeBtnText = pe.dic.get('%close');
			$.mobile.page.prototype.options.backBtnText = pe.dic.get('%back');
			$.mobile.textinput.prototype.options.clearSearchButtonText = pe.dic.get('%jqm-clear-search');
			$.mobile.selectmenu.prototype.options.closeText = pe.dic.get('%close');
			$.mobile.listview.prototype.options.filterPlaceholder = pe.dic.get('%jqm-filter');
			$.mobile.table.prototype.options.columnBtnText = pe.dic.get('%jqm-tbl-col-toggle');
		},
		/**
		* The pe aware page query to append items to
		* @memberof pe
		* @function
		* @return {jQuery object}
		*/
		pagecontainer: function () {
			return $('#wb-body-sec-sup, #wb-body-sec, #wb-body-secr, #wb-body').add('body').eq(0);
		},

		/**
		* Manages custom events for text and window resizing
		* Based on http://alistapart.com/article/fontresizing
		* @namespace pe.resizeutil
		*/
		resizeutil: {
			sizes: [],
			events: ['wb-text-resize', 'wb-window-resize-width', 'wb-window-resize-height'],
			events_all: '',
			initialized: false,
			/**
			* Sets up the testing interval
			* @memberof pe.resizeutil
			* @function
			*/
			init: function () {
				var ru = pe.resizeutil;
				if (!ru.initialized) {
					ru.sizes = [pe.resizetest.offsetHeight, pe.window.width(), pe.window.height()];
					ru.events_all = ru.events.join(' ');
					window.setInterval(function () {
						pe.resizeutil.test();
					}, 500);
					ru.initialized = true;
				}
			},
			/**
			* Tests for text size, window width and window height changes and triggers an event when a change is found
			* @memberof pe.resizeutil
			* @function
			*/
			test: function () {
				var curr_sizes = [pe.resizetest.offsetHeight, pe.window.width(), pe.window.height()],
					i, len,
					ru = pe.resizeutil;
				for (i = 0, len = curr_sizes.length; i !== len; i += 1) {
					if (curr_sizes[i] !== ru.sizes[i]) {
						pe.document.trigger(ru.events[i], curr_sizes);
					}
				}
				ru.sizes = curr_sizes;
				return;
			}
		},
		/**
		* Registers callbacks for the custom resize events managed in pe.resizeutil
		* @memberof pe
		* @function
		* @param (string) callback Function that will be bound to the custom resize events.
		*/
		resize: function (callback) {
			pe.document.on(pe.resizeutil.events_all, function (e, sizes) {
				callback(e, sizes);
			});
			return;
		},
		/**
		* URL swiss-army knife helper function for developers.
		* @memberof pe
		* @see pe.url
		* @function pe.url(1)
		* @param {string} uri A relative or absolute URL to manipulate.
		*/
		url: function (uri) {
			var el = document.createElement('div'), a;
			el.innerHTML = '<a href="' + uri + '">x</a>';
			a = el.firstChild;
			return {
				/**
				* @namespace pe.url
				*/
				/**
				* The original URL converted to an absolute URL.
				* @memberof pe.url
				* @type {string}
				*/
				source: a.href,
				/**
				* The protocol of the URL. eg. http or https
				* @memberof pe.url
				* @type {string}
				*/
				protocol: a.protocol.replace(':', ''),
				/**
				* The full host name of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				* pe.url('http://www.canada.ca/index.html').host
				*	returns 'www.canada.ca'
				*/
				host: a.hostname,
				/**
				* The port of the URL.
				* @memberof pe.url
				* @type {string} If no port is specified, this will return '80'.
				*/
				port: a.port === '0' ? '80' : a.port,
				/**
				* The query string part of the URL.
				* @memberof pe.url
				* @type {string}
				* @see #params
				* @example
				* pe.url('http://www.canada.ca?a=1&b=2').query
				*	returns '?a=1&b=2'
				*/
				query: a.search,
				/**
				* A collection of the parameters of the query string part of the URL.
				* @memberof pe.url
				* @type {object (key/value map of strings)}
				* @see #query
				* @example
				*	pe.url('http://www.canada.ca?a=1&b=2').params
				*		returns
				*			{
				*				a: '1',
				*				b: '2'
				*			}
				*/
				params: (function () {
					var key, ret, s, seg, _i, _len;
					ret = {};
					seg = a.search.replace(/^\?/, '').split('&');
					for (_i = 0, _len = seg.length; _i < _len; _i += 1) {
						key = seg[_i];
						if (key) {
							s = key.split('=');
							ret[s[0]] = s[1];
						}
					}
					return ret;
				}
				()),
				/**
				* The file name, if any, of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*	pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').file
				*		returns 'menu-eng.html'
				*/
				file: a.pathname.match(/\/([^\/?#]+)$/i) ? a.pathname.match(/\/([^\/?#]+)$/i)[1] : '',
				/**
				* The anchor of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*	pe.url('http://www.canada.ca#wb-main-in').hash
				*		returns 'wb-main-in'
				*/
				hash: a.hash.replace('#', ''),
				/**
				* The path of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*	pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').path
				*		returns '/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*/
				path: a.pathname.replace(/^([^\/])/, '/$1'),
				/**
				* The relative path of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*	pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').relative
				*		returns '/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*/
				relative: a.href.match(/tps?:\/\/[^\/]+(.+)/) ? a.href.match(/tps?:\/\/[^\/]+(.+)/)[1] : '',
				/**
				* The path of the URL broken up into an array.
				* @memberof pe.url
				* @type {string[]}
				* @example
				*	pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').segments
				*		returns ['aboutcanada-ausujetcanada', 'hist', 'menu-eng.html']
				*/
				segments: a.pathname.replace(/^\//, '').split('/'),
				/**
				* The URL minus the anchor.
				* @memberof pe.url
				* @type {string}
				* @function
				* @example
				*	pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html#wb-main-in').removehash()
				*		returns 'http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*	pe.url( pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html#wb-main-in').removehash() ).relative
				*		returns '/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*/
				removehash: function () {
					return this.source.replace(/#([A-Za-z0-9\-_=&\.:]+)/, '');
				}
			};
		},
		/**
		* @memberof pe
		* @function
		* @return {boolean}
		*/
		cssenabled: function () {
			return pe.viewtest.offsetWidth < 2; // pe.viewtest will be either 0 or 1 if CSS is enabled
		},
		/**
		* Returns a class-based set limit on plugin instances
		* @memberof pe
		* @function
		* @param {DOM object} elm The element to search for a class of the form blimit-5
		* @return {number} 0 if none found, which means the plugin default
		*/
		limit: function (elm) {
			var count;
			count = $(elm).attr('class').match(/\blimit-\d+/);
			if (!count) {
				return 0;
			}
			return Number(count[0].replace(/limit-/i, ''));
		},
		/**
		* A generic function to focus elements in the DOM in a screen reader compatible way / selector or object.
		* @memberof pe
		* @function
		* @param {jQuery object | DOM object} elm The element to recieve focus.
		* @return {jQuery object | DOM object} elm For chainability.
		*/
		focus: function (elm) {
			setTimeout(function () {
				return (typeof elm.jquery !== 'undefined' ? elm.focus() : $(elm).focus());
			}, 0);
			return elm;
		},
		/**
		* @namespace pe.string
		*/
		string: {
			/*
			@returns: modified text with htmlified text into a HTML links ( mailto, anchors, etc )
			@credits: Dustin Diaz | http://www.dustindiaz.com/basement/ify.html
			@license: public BSD
			*/
			ify: (function () {
				return {
					'link': function (t) {
						return t.replace(/[a-z]+:\/\/[a-z0-9\-_]+\.[a-z0-9\-_@:~%&\?\+#\/.=]+[^:\.,\)\s*$]/ig, function (m) {
							return '<a href="' + m + '">' + ((m.length > 25) ? m.substr(0, 24) + '...' : m) + '</a>';
						});
					},
					'at': function (t) {
						return t.replace(/(^|[^\w]+)\@([a-zA-Z0-9_]{1,15}(\/[a-zA-Z0-9\-_]+)*)/g, function (m, m1, m2) {
							return m1 + '@<a href="http://twitter.com/' + m2 + '">' + m2 + '</a>';
						});
					},
					'hash': function (t) {
						return t.replace(/(^|[^&\w'"]+)\#([a-zA-Z0-9_]+)/g, function (m, m1, m2) {
							return m1 + '#<a href="http://search.twitter.com/search?q=%23' + m2 + '">' + m2 + '</a>';
						});
					},
					/**
					* Formats tweets for display on a webpage. Adds markup for links in the tweet. Adds markup for user names (@). Adds markup for topics (#).
					* @memberof pe.string
					* @function ify.clean
					* @param {string} tweet The tweet to format.
					* @return {string}
					* @example
					*	pe.string.ify.clean('@ded the cdn url is http://cdn.enderjs.com')
					*		returns '@&lt;a href="http://twitter.com/ded"&gt;ded&lt;/a&gt; the cdn url is &lt;a href="http://cdn.enderjs.com"&gt;http://cdn.enderjs.com&lt;/a&gt;'
					*		ie. '@<a href="http://twitter.com/ded">ded</a> the cdn url is <a href="http://cdn.enderjs.com">http://cdn.enderjs.com</a>'
					*/
					'clean': function (tweet) {
						return this.hash(this.at(this.link(tweet)));
					}
				};
			}
			()),
			/**
			* Left-pads a number with zeros.
			* @memberof pe.string
			* @function
			* @param {number} number The original number to pad.
			* @param {number} length The width of the resulting padded number, not the number of zeros to add to the front of the string.
			* @return {string} The padded string
			*/
			pad: function (number, length) {
				var str;
				str = String(number);
				while (str.length < length) {
					str = '0' + str;
				}
				return str;
			},
			/**
			* Escapes the characters in a string for use in a jQuery selector
			* Based on http://totaldev.com/content/escaping-characters-get-valid-jquery-id
			* @memberof pe.string
			* @function
			* @param (string) str The string to escape.
			* @return (string) The escaped string.
			* @example
			*	pe.string.jqescape('alpha.beta:delta_gamma-omgega=sigma')
			*		returns 'alpha\.beta\:delta_gamma-omega\=sigma')
			*/
			jqescape: function (str) {
				return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
			}
		},
		/**
		* @namespace pe.array
		*/
		array: {
			/**
			* Eliminates duplicate strings in an array
			* @memberof pe.array
			* @function
			* @param {array} arr Array of strings or primitives
			* @return {array} Array with duplicate strings or primitives removed
			*/
			noduplicates: function (arr) {
				var i,
					_ilen,
					j,
					out = [],
					obj = {};
				for (i = 0, _ilen = arr.length; i !== _ilen; i += 1) {
					obj[arr[i]] = 0;
				}
				for (j in obj) {
					if (obj.hasOwnProperty(j)) {
						out.push(j);
					}
				}
				return out;
			},
			/**
			* Creates a new string array with the differences between two other string arrays
			* @memberof pe.array
			* @function
			* @param {array} arr1 Array of strings
			* @param {array} arr2 Array of strings
			* @return {array} Array with differences between arr1 and arr2
			*/
			diff: function (arr1, arr2) {
				var i,
					_ilen,
					_iarr,
					j,
					_jlen,
					match,
					out = [];
				for (i = 0, _ilen = arr1.length; i !== _ilen; i += 1) {
					_iarr = arr1[i];
					match = false;
					for (j = 0, _jlen = arr2.length; j !== _jlen; j += 1) {
						if (arr2[j] === _iarr) {
							match = true;
							break;
						}
					}
					if (!match) {
						out.push(_iarr);
					}
				}
			},
			/**
			* Returns the keys in an associative array
			* @memberof pe.array
			* @function
			* @param {object} obj The associative array
			* @return {array} Keys of the associative array
			*/
			keys: function (obj) {
				var keys = [];
				$.each(obj, function (key) {
					keys.push(key);
				});
				return keys;
			}
		},
		/**
		* A suite of date related functions for easier parsing of dates
		* @namespace pe.date
		*/
		date: {
			/**
			* Converts the date to a date-object. The input can be:
			* <ul>
			* <li>a Date object:	returned without modification.</li>
			* <li>an array:			Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
			* <li>a number:			Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
			* <li>a string:			Any format supported by the javascript engine, like 'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.</li>
			* <li>an object:		Interpreted as an object with year, month and date attributes. **NOTE** month is 0-11.</li>
			* </ul>
			* @memberof pe.date
			* @function
			* @param {Date | number[] | number | string | object} d
			* @return {Date | NaN}
			*/
			convert: function (d) {
				if (d.constructor === Date) {
					return d;
				}
				if (d.constructor === Array) {
					return new Date(d[0], d[1], d[2]);
				}
				if (d.constructor === Number) {
					return new Date(d);
				}
				if (d.constructor === String) {
					return new Date(d);
				}
				if (typeof d === 'object') {
					return new Date(d.year, d.month, d.date);
				}
				return NaN;
			},
			/**
			* Compares two dates (input can be any type supported by the convert function). NOTE: This function uses pe.date.isFinite, and the code inside isFinite does an assignment (=).
			* @memberof pe.date
			* @function
			* @param {Date | number[] | number | string | object} a
			* @param {Date | number[] | number | string | object} b
			* @return {number | NaN}
			* @example returns
			* -1 if a < b
			* 0 if a = b
			* 1 if a > b
			* NaN if a or b is an illegal date
			*/
			compare: function (a, b) {
				if (isFinite(a = this.convert(a).valueOf()) && isFinite(b = this.convert(b).valueOf())) {
					return (a > b) - (a < b);
				}
				return NaN;
			},
			/**
			* Checks if date in d is between dates in start and end. NOTE: This function uses pe.date.isFinite, and the code inside isFinite does an assignment (=).
			* @memberof pe.date
			* @function
			* @param {Date | number[] | number | string | object} d
			* @param {Date | number[] | number | string | object} start
			* @param {Date | number[] | number | string | object} end
			* @return {boolean | NaN}
			*/
			in_range: function (d, start, end) {
				if (isFinite(d = this.convert(d).valueOf()) && isFinite(start = this.convert(start).valueOf()) && isFinite(end = this.convert(end).valueOf())) {
					return start <= d && d <= end;
				}
				return NaN;
			},

			daysInMonth: function (iYear, iMonth) {
				// Simplfied function to allow for us to get the days in specific months
				return 32 - new Date(iYear, iMonth, 32).getDate();
			},

			daysBetween: function (datelow, datehigh) {
				// simplified conversion to date object
				var date1 = pe.date.convert(datelow),
					date2 = pe.date.convert(datehigh),
					DSTAdjust = 0,
					oneMinute = 1000 * 60,
					oneDay = oneMinute * 60 * 24,
					diff;
				// equalize times in case date objects have them
				date1.setHours(0);
				date1.setMinutes(0);
				date1.setSeconds(0);
				date2.setHours(0);
				date2.setMinutes(0);
				date2.setSeconds(0);
				// take care of spans across Daylight Saving Time changes
				if (date2 > date1) {
					DSTAdjust = (date2.getTimezoneOffset() - date1.getTimezoneOffset()) * oneMinute;
				} else {
					DSTAdjust = (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * oneMinute;
				}
				diff = Math.abs(date2.getTime() - date1.getTime()) - DSTAdjust;
				return Math.ceil(diff / oneDay);
			},

			/**
			* Cross-browser safe way of translating a date to iso format
			* @memberof pe.date
			* @function
			* @param {Date | number[] | number | string | object} d
			* @param {boolean} timepresent Optional. Whether to include the time in the result, or just the date. False if blank.
			* @return {string}
			* @example
			*	pe.date.to_iso_format(new Date())
			*		returns '2012-04-27'
			*	pe.date.to_iso_format(new Date(), true)
			*		returns '2012-04-27 13:46'
			*/
			to_iso_format: function (d, timepresent) {
				var date;
				date = this.convert(d);
				if (timepresent) {
					return date.getFullYear() + '-' + pe.string.pad(date.getMonth() + 1, 2, '0') + '-' + pe.string.pad(date.getDate(), 2, '0') + ' ' + pe.string.pad(date.getHours(), 2, '0') + ':' + pe.string.pad(date.getMinutes(), 2, '0');
				}
				return date.getFullYear() + '-' + pe.string.pad(date.getMonth() + 1, 2, '0') + '-' + pe.string.pad(date.getDate(), 2, '0');
			},

			from_iso_format: function (s) {
				var date = null;
				if (s) {
					if (s.match(/\d{4}-\d{2}-\d{2}/)) {
						date = new Date();
						date.setFullYear(s.substr(0, 4), s.substr(5, 2) - 1, s.substr(8, 2) - 1);
					}
					return date;
				}
				return null;
			}
		},
		/**
		* @namespace pe.data
		*/
		data: {
			/**
			* Retrieves data from a 'data-' attribute
			* @memberof pe.data
			* @function
			* @param {jQuery object | DOM object} elm Object with the 'data-' attribute
			* @param {string} data_name Name after 'data-' in the 'data-' attribute (e.g., 'wet-boew')
			* @return {data} Object containing the retrieved data
			*/
			getData: function (elm, data_name) {
				var $elm = typeof elm.jquery !== 'undefined' ? elm : $(elm),
					dataAttr = $elm.attr('data-' + data_name),
					dataObj = null;
				if (dataAttr) {
					dataObj = this.toObject(dataAttr);
				}
				$.data(elm, data_name, dataObj);
				return dataObj;
			},
			/**
			* Converts a string to an object
			* @memberof pe.data
			* @function
			* @param {string} data_string String to convert to an object (recommend JSON)
			* @return {data} Object created by converting the string
			*/
			toObject: function (data_string) {
				var obj = null;
				try {
					obj = $.parseJSON(data_string);
				} catch (e) {
					// Fallback if data_string is a malformed JSON string (less secure than with a JSON string)
					if (data_string.indexOf('{') === -1) {
						data_string = '{' + data_string + '}';
					}
					obj = eval('(' + data_string + ')');
				}
				return obj;
			}
		},
		/**
		* A generic function for enabling/disabling PE enhancements
		* @memberof pe
		* @function
		* @return true if PE enhancements should be disabled, false if should be enabled
		*/
		pedisable: function () {
			// Prevent PE from loading if IE6 or ealier (unless overriden) or pedisable=true is in the query string or localStorage
			var lsenabled = (typeof localStorage !== 'undefined'),
				disablels = (lsenabled ? localStorage.getItem('pedisable') : null),
				disable = (pe.urlquery.pedisable !== undefined ? pe.urlquery.pedisable : disablels),
				tphp = document.getElementById('wb-tphp'),
				li = document.createElement('li'),
				qparams = pe.urlquery,
				qparam,
				newquery = '?',
				settings = pe.settings,
				$html = pe.html,
				pedisable_link = (settings && typeof settings.pedisable_link === 'boolean' ? settings.pedisable_link : true);

			if (tphp !== null) {
				for (qparam in qparams) { // Rebuild the query string
					if (qparams.hasOwnProperty(qparam) && qparam !== 'pedisable') {
						newquery += qparam + '=' + qparams[qparam] + '&amp;';
					}
				}

				if (disable === 'true' || (((pe.ie > 0 && pe.ie < 7) || $html.hasClass('bb-pre6')) && disable !== 'false')) {
					$html.addClass('no-js pe-disable');
					if (lsenabled) {
						localStorage.setItem('pedisable', 'true'); // Set PE to be disable in localStorage
					}
					// Append the Standard version link version unless explicitly disabled in settings.js
					if (pedisable_link) {
						li.innerHTML = '<a href="' + newquery + 'pedisable=false">' + pe.dic.get('%pe-enable') + '</a>';
						tphp.appendChild(li); // Add link to re-enable PE
					}
					return true;
				} else if (disable === 'false' || disablels !== null) {
					if (lsenabled) {
						localStorage.setItem('pedisable', 'false'); // Set PE to be enabled in localStorage
					}
				}

				// Append the Basic HTML version link version unless explicitly disabled in settings.js
				if (pedisable_link) {
					li.innerHTML = '<a href="' + newquery + 'pedisable=true">' + pe.dic.get('%pe-disable') + '</a>';
					tphp.appendChild(li); // Add link to disable PE
				}
			}
			return false;
		},
		/**
		* A suite of menu related functions for easier handling of menus
		* @namespace pe.menu
		*/
		menu: {
			/**
			* Applies a specific class to the current link/section in a menu based on the current URL or the links in a breadcrumb trail.
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Menu to apply the class to
			* @param {jQuery object | DOM object} bc Breadcrumb trail
			* @param {string} navclass Optional. Class to apply. Defaults to 'nav-current'.
			* @function
			* @return {jQuery object} Link where match found
			*/
			navcurrent: function (menusrc, bcsrc, navclass) {
				var pageurl = window.location.hostname + window.location.pathname.replace(/^([^\/])/, '/$1'),
					pageurlquery = window.location.search,
					link,
					linkhref,
					linkurl,
					linkurllen,
					linkquery,
					linkquerylen,
					linkindex,
					menulinks,
					menulink = [],
					menulinkurl = [],
					menulinkslen,
					bclinks,
					bclinkslen,
					bcindex,
					bclink,
					bclinkurl,
					match = false,
					hrefBug = pe.ie > 0 && pe.ie < 8; // IE7 and below have an href bug so need a workaround
				menusrc = typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc);
				menulinks = menusrc.find('a').get();
				navclass = (typeof navclass === 'undefined') ? 'nav-current' : navclass;

				// Try to find a match with the page URL and cache link + URL for later if no match found
				menulinkslen = menulinks.length;
				while (menulinkslen--) {
					link = menulinks[menulinkslen];
					linkhref = link.getAttribute('href');
					if (linkhref !== null) {
						if (hrefBug && linkhref !== window.location.href) {
							linkhref = linkhref.replace(window.location.href, '');
						}
						if (linkhref.length !== 0 && linkhref.slice(0, 1) !== '#') {
							linkurl = link.hostname + link.pathname.replace(/^([^\/])/, '/$1');
							linkquery = link.search;
							linkquerylen = linkquery.length;
							if (pageurl.slice(-linkurl.length) === linkurl && (linkquerylen === 0 || pageurlquery.slice(-linkquerylen) === linkquery)) {
								match = true;
								break;
							}
							menulink.push(link);
							menulinkurl.push(linkurl);
						}
					}
				}

				// No page URL match found, try a breadcrumb link match instead
				if (!match) {
					// Pre-process the breadcrumb links
					bclink = [];
					bclinkurl = [];
					bcsrc = typeof bcsrc.jquery !== 'undefined' ? bcsrc : $(bcsrc);
					bclinks = bcsrc.find('a').get();
					bclinkslen = bclinks.length;
					for (bcindex = 0; bcindex !== bclinkslen; bcindex += 1) {
						link = bclinks[bcindex];
						linkhref = link.getAttribute('href');
						if (hrefBug && linkhref !== window.location.href) {
							linkhref = linkhref.replace(window.location.href, '');
						}
						if (linkhref.length !== 0 && linkhref.slice(0, 1) !== '#') {
							bclink.push(link);
							bclinkurl.push(link.hostname + link.pathname.replace(/^([^\/])/, '/$1'));
						}
					}
					bclinkslen = bclinkurl.length;

					// Try to match each breadcrumb link
					for (linkindex = 0, menulinkslen = menulink.length; linkindex !== menulinkslen; linkindex += 1) {
						link = menulink[linkindex];
						linkurl = menulinkurl[linkindex];
						linkurllen = linkurl.length;
						linkquery = link.search;
						linkquerylen = linkquery.length;
						bcindex = bclinkslen;
						while (bcindex--) {
							if (bclinkurl[bcindex].slice(-linkurllen) === linkurl && (linkquerylen === 0 || bclink[bcindex].search.slice(-linkquerylen) === linkquery)) {
								match = true;
								break;
							}
						}
						if (match) {
							break;
						}
					}
				}
				return (match ? $(link).addClass(navclass) : $());
			},
			/**
			* Builds jQuery Mobile nested accordion menus from an existing menu
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Existing menu to process
			* @param {number} hlevel Heading level to process (e.g., h3 = 3)
			* @param {string} theme1 Letter representing the jQuery Mobile theme for menu items
			* @param {boolean} mbar Optional. Is the heading level to process in a menu bar? Defaults to false.
			* @param {boolean} collapseTopOnly Optional. Collapse only the top level sections? Defaults to true.
			* @param {string} theme2 Optional. Letter representing the jQuery Mobile theme to use for secondary menu items. Defaults to theme1 value.
			* @param {boolean} top Optional. Is the menu level being processed the top level? Defaults to true.
			* @param {boolean} returnString Optional. Return a string instead of a jQuery object.
			* @param {boolean} collapsible Optional. Collapse the sections at the current hierarchy level (override for collapseTopOnly = true).
			* @function
			* @return {jQuery object | string} Mobile menu
			*/
			buildmobile: function (menusrc, hlevel, theme_1, mbar, collapseTopOnly, theme_2, top, returnString, collapsible) {
				var heading = 'h' + hlevel,
					headingOpen = '<' + heading + '>',
					headingClose = '</' + heading + '>',
					m = (typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc)),
					mDOM = m[0].parentNode,
					mItems = m.find('> div, > ul, > ' + heading + ', > section > ' + heading),
					mItemsDOM = mItems.get(),
					mItems_i,
					mItems_len,
					mItem,
					mItemDOM,
					mItemTag,
					nextDOM,
					prevDOM,
					hlink,
					hlinkDOM,
					navCurrent,
					navCurrentNoCSS,
					nested,
					nested_i,
					nested_len,
					hnestDOM,
					hnestTag,
					hnestLinkDOM,
					hnestLinkDOM2,
					menubar = (mbar !== undefined ? mbar : false),
					mainText = pe.dic.get('%main-page'),
					toplevel = (top !== undefined ? top : true),
					secnav2Top = false,
					theme2 = (theme_2 !== undefined ? theme_2 : theme_1),
					theme1 = (toplevel ? theme_1 : theme_2),
					listView = '<ul data-role="listview" data-theme="' + theme2 + '">',
					listItems,
					listItem,
					listItem2,
					sectionOpenStart = '<div data-theme="',
					sectionOpenEnd = '" class="wb-nested-menu',
					sectionOpen1 = sectionOpenStart + theme1 + sectionOpenEnd,
					sectionOpen2 = sectionOpenStart + theme2 + sectionOpenEnd,
					sectionLinkStart = '<a data-role="button" data-theme="',
					sectionLinkEnd = '" data-icon="arrow-d" data-iconpos="left" data-corners="false" href="',
					sectionLinkOpen1 = '">' + headingOpen + sectionLinkStart + theme1 + sectionLinkEnd,
					sectionLinkOpen2 = sectionLinkStart + theme2 + sectionLinkEnd,
					sectionLinkClose = '</a>' + headingClose,
					link = '<a data-role="button" data-icon="arrow-r" data-iconpos="right" data-corners="false" href="',
					disableLink = 'javascript:;" class="ui-disabled',
					menu,
					url,
					i,
					len;
				collapseTopOnly = (collapseTopOnly !== undefined ? collapseTopOnly : true);
				collapsible = (collapsible !== undefined ? collapsible : false);
				returnString = (returnString !== undefined ? returnString : false);
				if (mItemsDOM.length !== 0) {
					if (menubar && mDOM.getElementsByTagName(heading).length === 0) { // Menu bar without a mega menu
						menu = sectionOpen1 + '"><ul data-role="listview" data-theme="' + theme1 + '">';
						mItemsDOM = mDOM.getElementsByTagName('a');
						for (mItems_i = 0, mItems_len = mItemsDOM.length; mItems_i < mItems_len; mItems_i += 1) {
							mItemDOM = mItemsDOM[mItems_i];
							menu += '<li><a href="' + mItemDOM.href + '">' + mItemDOM.innerHTML + '</a></li>';
						}
						menu += '</ul></div>';
					} else {
						menu = '';
						for (mItems_i = 0, mItems_len = mItemsDOM.length; mItems_i < mItems_len; mItems_i += 1) {
							mItemDOM = mItemsDOM[mItems_i];
							mItem = $(mItemDOM);
							mItemTag = mItemDOM.tagName.toLowerCase();

							// If the menu item is a heading
							if (mItemTag === heading) {
								menu += sectionOpen1;
								hlink = mItem.children('a');
								if (hlink.length !== 0) {
									hlinkDOM = hlink[0];
									url = hlinkDOM.getAttribute('href');
									navCurrent = (hlinkDOM.className.indexOf('nav-current') !== -1);
									navCurrentNoCSS = (hlinkDOM.className.indexOf('nav-current-nocss') !== -1);
									menu += (navCurrent && !navCurrentNoCSS ? ' nav-current' : '');
								} else {
									navCurrent = false;
									url = disableLink;
								}
								if (toplevel) {
									secnav2Top = (mItemDOM.className.indexOf('top-section') !== -1);
								}

								// Use collapsible content for a top level section, all sections are to be collapsed (collapseTopOnly = false) or collapsible content is forced (collapsible = true); otherwise use a button
								if (toplevel || collapsible || !collapseTopOnly) {
									menu += '" data-role="collapsible"' + (secnav2Top || navCurrent ? ' data-collapsed="false">' : '>') + headingOpen + mItem.text() + headingClose;
								} else {
									menu += sectionLinkOpen1 + url + '">' + mItem.text() + sectionLinkClose;
								}
								nextDOM = mItem.next()[0];
								// Don't try to build mobile menu for headings with no sub-items
								if (typeof nextDOM !== 'undefined') {
									if (nextDOM.tagName.toLowerCase() === 'ul') {
										menu += listView;
										nested = nextDOM.querySelector('li ul');
										if (nested !== null && nested.length !== 0) { // Special handling for a nested list
											hnestTag = 'h' + (hlevel + 1);
											listItems = nextDOM.children;
											for (i = 0, len = listItems.length; i !== len; i += 1) {
												listItem = listItems[i];
												hnestDOM = listItem.getElementsByTagName('li');
												menu += '<li>';
												if (hnestDOM.length !== 0) {
													hnestLinkDOM = listItem.children[0];
													menu += sectionOpen2 + '"><' + hnestTag + ' class="wb-nested-li-heading">' + sectionLinkOpen2 + hnestLinkDOM.href + '">' + hnestLinkDOM.innerHTML + '</a></' + hnestTag + '>' + listView;
													for (nested_i = 0, nested_len = hnestDOM.length; nested_i !== nested_len; nested_i += 1) {
														listItem2 = hnestDOM[nested_i];
														hnestLinkDOM2 = listItem2.querySelector('a');
														menu += '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-icon="arrow-r" data-iconpos="right"><a href="' + hnestLinkDOM2.href + '">' + hnestLinkDOM2.innerHTML + '</a></li>';
													}
													menu += '</ul></div>';
												} else {
													menu += listItem.innerHTML;
												}
												menu += '</li>';
											}
										} else {
											menu += nextDOM.innerHTML;
										}
										menu += '</ul>';
									} else { // If the section contains sub-sections
										if (menubar) {
											menu += pe.menu.buildmobile(mItem.parent().find('.mb-sm'), hlevel + 1, theme1, false, collapseTopOnly, theme2, false, true);
										} else {
											menu += pe.menu.buildmobile(mItem.parent(), hlevel + 1, theme1, false, collapseTopOnly, theme2, false, true, secnav2Top);
										}
									}
								}

								// The original menu item was not in a menu bar and is a top level section, all sections are to be collapsed (collapseTopOnly = false) or collapsible content is forced (collapsible = true)
								if (!menubar && hlink.length > 0 && (toplevel || collapsible || !collapseTopOnly)) {
									menu += link + hlinkDOM.href + '">' + hlinkDOM.innerHTML + ' - ' + mainText + '</a>';
								}
								menu += '</div>';
							} else if (mItemTag === 'ul') { // If the menu item is a ul
								// Don't try to build mobile menu for ul with a preceding heading or that is directly nested within an li
								prevDOM = mItem.prev()[0];
								if ((typeof prevDOM === 'undefined' || prevDOM.tagName.toLowerCase() !== heading) && mItemDOM.parentNode.tagName.toLowerCase() !== 'li') {
									menu += listView + mItemDOM.innerHTML + '</ul>';
								}
							} else if (mItemTag === 'div') { // If the menu item is a div
								hnestDOM = mItem.children('a').get();
								if (hnestDOM.length !== 0) {
									for (i = 0, len = hnestDOM.length; i !== len; i += 1) {
										hnestLinkDOM = hnestDOM[i];
										menu += link + hnestLinkDOM.href + '" data-theme="' + (toplevel ? theme1 : theme2) + '">' + hnestLinkDOM.innerHTML + '</a>';
									}
								} else if (mItemDOM.children.length !== 0) {
									menu += pe.menu.buildmobile(mItemDOM, hlevel, theme1, false, collapseTopOnly, theme2, false, true, secnav2Top);
								}
							}
						}
						// Is a top level section, all sections are to be collapsed (collapseTopOnly = false) or collapsible content is forced (collapsible = true)
						if (toplevel || collapsible || !collapseTopOnly) {
							menu = '<div data-role="collapsible-set" data-inset="false" data-theme="' + theme1 + '"' + (toplevel ? ' class="ui-corner-all"' : '') + '>' + menu + '</div>';
						}
					}
					if (toplevel) {
						menu = '<div data-role="controlgroup" data-theme="' + theme1 + '">' + menu + '</div>';
					}
				}
				return returnString ? menu : $(menu);
			}
		},
		/**
		* Functions for loading required polyfills
		* @memberof pe
		* @function
		* @return {void}
		*/
		polyfills: {
			/**
			* Polyfills to be loaded before everything else (pre-kill switch)
			* @memberof pe.polyfills
			*/
			init: function () {
				// localStorage
				var lib = pe.add.liblocation,
					$html = pe.html;
				if (!window.localStorage) {
					pe.add._load(lib + 'polyfills/localstorage' + pe.suffix + '.js', 'localstorage-loaded');
					$html.addClass('polyfill-localstorage');
				} else {
					$html.addClass('localstorage');
				}

				// sessionStorage
				if (!window.sessionStorage) {
					pe.add._load(lib + 'polyfills/sessionstorage' + pe.suffix + '.js', 'sessionstorage-loaded');
					$html.addClass('polyfill-sessionstorage');
				} else {
					$html.addClass('sessionstorage');
				}
			},
			/**
			* Determines which polyfills need to be loaded then loads them if they don't have dependencies
			* Polyfills with dependencies are passed in the msg event's event.payload[0] and polyfills that need to be initalized are passed in event.payload[1]
			* @memberof pe.polyfills
			* @param {array} force Array of polyfills to force loading for if native support does not exist (because required by plugins to be loaded)
			* @param {string} msg Message to inclue in the event that is triggered when the non-dependency polyfills are loaded
			* @function
			*/
			polyload: function (force, msg, checkdom) {
				var polyfills = this.polyfill,
					polyname,
					polyprefs,
					elms,
					polydep = {},
					loadnow = [],
					deps,
					dep_paths,
					dep_needed,
					lib = pe.add.liblocation,
					payload = [],
					needsinit = [],
					js = [],
					i,
					_len,
					$html = pe.html;

				// Process each polyfill
				for (polyname in polyfills) {
					if (polyfills.hasOwnProperty(polyname)) {
						polyprefs = polyfills[polyname];
						elms = checkdom ? $(polyprefs.selector) : $();
						// Check to see if the polyfill might be needed
						if (elms.length !== 0 || $.inArray(polyname, force) !== -1) {
							if (typeof polyprefs.supported === 'undefined') { // Native support hasn't been checked yet
								polyprefs.supported = (typeof polyprefs.support_check === 'function' ? polyprefs.support_check() : polyprefs.support_check);
								// Check to see if there is native support
								if (!polyprefs.supported) { // No native support
									deps = polyprefs.depends;
									if (typeof deps !== 'undefined') { // Polyfill has dependencies
										// Check to see if dependencies are already loaded
										dep_paths = pe.add.depends(deps);
										dep_needed = [];
										for (i = 0, _len = deps.length; i !== _len; i += 1) {
											if ($.inArray(deps[i], pe.add.staged) === -1) {
												dep_needed.push(deps[i]);
											}
										}
										if (dep_needed.length !== 0) {
											// Polyfill is needed but has unloaded dependencies so load later
											polydep[polyname] = dep_needed;
										} else {
											// Polyfill is needed and all dependencies are loaded so load now
											loadnow.push(polyname);
										}
									} else { // Polyfill has no dependencies
										// Polyfill is needed and has no dependencies so load now
										loadnow.push(polyname);
									}
									$html.addClass('polyfill-' + polyname);
									elms.addClass('polyfill'); // Add the 'polyfill' class to each element to be affected by the polyfill
								} else { // Native support
									$html.addClass(polyname);
								}
							} else if (!polyprefs.supported && typeof polyprefs.loaded === 'undefined') { // No native support and polyfill hasn't been loaded yet
								// Polyfill is needed and hasn't been loaded yet (any dependencies assumed to be taken care of already since at least second time through)
								loadnow.push(polyname);
							}
						}
					}
				}

				// Load polyfills in reverse order to better deal with nested polyfill calls
				_len = loadnow.length;
				while (_len--) {
					polyprefs = polyfills[loadnow[_len]];
					js[js.length] = (typeof polyprefs.load !== 'undefined' ? polyprefs.load : lib + 'polyfills/' + loadnow[_len] + pe.suffix + '.js');
					if (typeof polyprefs.init !== 'undefined') {
						needsinit.push(loadnow[_len]);
					}
					polyprefs.loaded = true;
				}

				// Push the polydep object and needsinit array into payload
				payload.push(polydep);
				payload.push(needsinit);

				// Load the polyfill scripts
				pe.add._load_arr(js, msg, payload);
			},
			/**
			* Enhances one or more elements with an already loaded polyfill
			* @memberof pe.polyfills
			* @param {string} poly_name Name of the polyfill
			* @param {jQuery object|DOM object} objs Objects to enhance
			* @function
			*/
			enhance: function (poly_name, objs) {
				if (pe.html.hasClass('polyfill-' + poly_name)) {
					objs = (typeof objs.jquery !== 'undefined' ? objs.get() : objs);
					var polyobj = this.polyfill[poly_name],
						objs_len = objs.length;
					while (objs_len--) {
						polyobj.update($(objs[objs_len]).addClass('polyfill'));
					}
				}
			},
			/**
			* Details for each of the polyfills.
			* selector: Selector used to find elements that would be affected by the polyfill
			* supported: Check for determining if polyfill is needed (false = polyfill needed). Can be either a function or a property.
			* load (optional): path for the script to load (defaults to "lib + '/polyfills/' + polyfill_name + pe.suffix + '.js'")
			* @memberof pe.polyfills
			*/
			polyfill: {
				'datalist': {
					selector: 'input[list]',
					update: function (elms) {
						elms.datalist();
					},
					/* Based on check from Modernizr 2.6.1 | MIT & BSD */
					support_check: !!(document.createElement('datalist') && window.HTMLDataListElement)
				},
				'datepicker': {
					selector: 'input[type="date"]',
					depends: ['calendar', 'xregexp'],
					update: function (elms) {
						elms.datepicker();
					},
					support_check: function () {
						/* Based on check from Modernizr 2.6.1 | MIT & BSD */
						var el = document.createElement('input'),
							supported;
						el.setAttribute('type', 'date');
						el.value = ':)';
						el.style.cssText = 'position:absolute;visibility:hidden;';
						document.body.appendChild(el);
						supported = (el.value !== ':)');
						document.body.removeChild(el);
						return supported;
					}
				},
				'detailssummary': {
					selector: 'details',
					init: function () { // Needs to be initialized manually
						$('details').details();
					},
					update: function (elms) {
						elms.details();
					},
					support_check: function () {
						// By @mathias, based on http://mths.be/axh
						var doc = document,
							el = doc.createElement('details'),
							fake,
							root,
							diff;
						if (typeof el.open === 'undefined') {
							return false;
						}
						root = doc.body || (function () {
							var de = doc.documentElement;
							fake = true;
							return de.insertBefore(doc.createElement('body'), de.firstElementChild || de.firstChild);
						}
						());
						el.innerHTML = '<summary>a</summary>b';
						el.style.display = 'block';
						root.appendChild(el);
						diff = el.offsetHeight;
						el.open = true;
						diff = diff !== el.offsetHeight;
						root.removeChild(el);
						if (fake) {
							root.parentNode.removeChild(root);
						}
						return diff;
					}
				},
				'mathml': {
					selector: 'math',
					load: 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=Accessible',
					support_check: function () {
						// MathML
						// http://www.w3.org/Math/
						// Based on work by Addy Osmani which is based on work by Davide (@dpvc) and David (@davidcarlisle) in https://github.com/mathjax/MathJax/issues/182
						var hasMathML = false,
							ns,
							divParent,
							div,
							divCompare,
							mrow,
							mo,
							mfrac;
						if (document.createElementNS) {
							ns = 'http://www.w3.org/1998/Math/MathML';
							divParent = document.createElement('div');
							div = divParent.appendChild(document.createElement('div'));
							div.style.position = 'absolute';
							div.style.color = '#fff';
							mrow = div.appendChild(document.createElementNS(ns, 'math')).appendChild(document.createElementNS(ns, 'mrow'));
							mo = mrow.appendChild(document.createElementNS(ns, 'mo'));
							mo.appendChild(document.createTextNode('|'));
							mfrac = mrow.appendChild(document.createElementNS(ns, 'mfrac'));
							mfrac.appendChild(document.createElementNS(ns, 'mi')).appendChild(document.createTextNode('xx'));
							mfrac.appendChild(document.createElementNS(ns, 'mi')).appendChild(document.createTextNode('yy'));
							mrow.appendChild(document.createElementNS(ns, 'mo')).appendChild(document.createTextNode('|'));

							// For testing ability to render stretched vertical bars (Safari and Opera test)
							divCompare = divParent.appendChild(document.createElement('div'));
							divCompare.style.color = '#fff';
							divCompare.style.display = 'inline';
							divCompare.appendChild(document.createTextNode('|xx|'));

							document.body.appendChild(divParent);
							hasMathML = div.offsetHeight > div.offsetWidth; // Can MathML be rendered?
							div.style.position = 'static';
							div.style.display = 'inline';
							hasMathML = hasMathML && div.offsetWidth < divCompare.offsetWidth; // Can stretched vertical bars be rendered well? (catches Safari and Opera)
							divParent.parentNode.removeChild(divParent);
						}
						return hasMathML;
					}
				},
				'meter': {
					selector: 'meter',
					/* Based on check from Modernizr 2.6.1 | MIT & BSD */
					update: function (elms) {
						var meters = elms.get(),
							i = meters.length;

						while (i--) {
							makeMeter(meters[i]);
						}
					},
					support_check: document.createElement('meter').max !== undefined
				},
				'progress': {
					selector: 'progress',
					update: function (elms) {
						elms.progress();
					},
					/* Based on check from Modernizr 2.6.1 | MIT & BSD */
					support_check: document.createElement('progress').position !== undefined
				},
				'slider': {
					selector: 'input[type="range"]',
					init: function () { // Needs to be initialized manually
						fdSlider.onDomReady();
					},
					update: function () {
						fdSlider.onDomReady();
					},
					support_check: function () {
						/* Based on check from Modernizr 2.6.1 | MIT & BSD */
						var el = document.createElement('input'),
							defaultView,
							bool;
						el.setAttribute('type', 'range');
						el.value = ':)';
						el.style.cssText = 'position:absolute;visibility:hidden;';
						document.body.appendChild(el);
						defaultView = document.defaultView;
						bool = el.style.WebkitAppearance !== undefined && defaultView.getComputedStyle && defaultView.getComputedStyle(el, null).WebkitAppearance !== 'textfield' && (el.offsetHeight !== 0);
						document.body.removeChild(el);
						return bool;
					}
				}
			}
		},

		/**
		* A method to get a languages from a list of supported language.
		* @namespace pe.add
		*/
		get_language: function (lang, supported, sep) {
			var d;
			sep = (typeof sep === 'undefined') ? '-' : sep;

			//Add barebone function for IE < 9
			if (typeof supported.indexOf === 'undefined') {
				supported.indexOf = function (val) {
					var i, len;
					for (i = 0, len = this.length; i < len; i += 1) {
						if (this[i] === val) {
							return i;
						}
					}
					return -1;
				};
			}

			if (supported.indexOf(lang) !== -1) {
				return lang;
			} else {
				d = lang.indexOf(sep);
				if (d !== -1) {
					lang = lang.substr(0, d);
					if (supported.indexOf(lang) !== -1) {
						return lang;
					}
				}
			}
			return null;
		},
		/**
		* A series of chainable methods to add elements to the head ( async )
		* @namespace pe.add
		*/
		add: (function () {
			return {
				/**
				* A reference to the document's head element.
				* @memberof pe.add
				* @type {DOM object}
				*/
				head: document.head || document.getElementsByTagName('head')[0],
				/**
				* The path to the root folder of the javascript files (same folder as pe-ap.js).
				* @memberof pe.add
				* @type {string}
				*/
				liblocation: (function () {
					var pefile = $('body script[src*="/pe-ap"]').attr('src');
					return pefile.substr(0, pefile.lastIndexOf('/') + 1);
				} ()),
				themecsslocation: (function () {
					var themecss = (wet_boew_theme !== null ? $('head link[rel="stylesheet"][href*="' + wet_boew_theme.theme + '"]') : '');
					return themecss.length > 0 ? themecss.attr('href').substr(0, themecss.attr('href').lastIndexOf('/') + 1) : 'theme-not-found/';
				} ()),
				staged: [], // Tracks loaded dependencies and polyfills
				/**
				* A loading algorithm borrowed from labjs. Thank you!
				* @memberof pe.add
				* @function
				* @param {string} js Path and filename of the javascript file to asynchronously load.
				* @param {string} message Message to include in the event triggered once load completed
				* @return {object} A reference to pe.add
				*/
				_load: function (js, message) {
					var head = pe.add.head,
						msg = (message !== undefined ? message : 'wet-boew-dependency-loaded');
					// - lets prevent double loading of JavaScript files but still trigger an event indicating the file was loaded
					if ($.inArray(js, this.staged) > -1) {
						pe.document.trigger({ type: msg, js: js });
						return this;
					}
					setTimeout(function timeout() {
						if (typeof head.item !== 'undefined') { // check if ref is still a live node list
							if (!head[0]) { // append_to node not yet ready
								setTimeout(timeout, 25);
								return;
							}
							head = head[0]; // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
						}
						var scriptElem = document.createElement('script'),
							scriptdone = false;
						pe.add.set(scriptElem, 'async', 'async');
						scriptElem.onload = scriptElem.onreadystatechange = function () {
							if (scriptdone || (scriptElem.readyState && scriptElem.readyState !== 'complete' && scriptElem.readyState !== 'loaded')) {
								return false;
							}
							scriptElem.onload = scriptElem.onreadystatechange = null;
							scriptdone = true;
							pe.document.trigger({ type: msg, js: js });
						};
						scriptElem.src = js;
						if ((pe.ie > 0 && pe.ie < 9) || !head.insertBefore) {
							$(scriptElem).appendTo($(head)).delay(100);
						} else {
							head.insertBefore(scriptElem, head.firstChild);
						}
					}, 0);
					this.staged[this.staged.length] = js;
					return this;
				},
				/**
				* A loading algorithm for for multiple JavaScript files
				* @memberof pe.add
				* @function
				* @param {array} arr Array of paths and filenames of the javascript files to asynchronously load.
				* @param {string} message Message to include in the event triggered once all the loading is completed
				* @param {object} payload Optional. Object to include in the event when the loading is completed
				* @param {array} needsinit Optional. Names of scripts that need to be initialized manually (mainly used for polyfills)
				* @return {object} A reference to pe.add
				*/
				_load_arr: function (js, msg_all, payload) {
					var js_loaded = 0, i, _len,
						msg_single = msg_all + '-single';
					pe.document.on(msg_single, function () {
						js_loaded += 1;
						if (js_loaded === js.length) {
							pe.document.off(msg_single);
							pe.document.trigger({ type: msg_all, payload: payload });
						}
					});
					// Load each of the JavaScript files or trigger the completion event if there are none
					if (js.length > 0) {
						for (i = 0, _len = js.length; i < _len; i += 1) {
							pe.add._load(js[i], msg_single);
						}
					} else {
						pe.document.off(msg_single);
						pe.document.trigger({ type: msg_all, payload: payload });
					}

					return this;
				},
				/**
				* Sets element attributes
				* @memberof pe.add
				* @function
				* @param {DOM object} elm The element to modify.
				* @param {string} name The name of the attribute to add or change.
				* @param {string} value The value of the attribute.
				* @return {object} A reference to pe.add
				*/
				set: function (elm, name, value) {
					elm.setAttribute(name, value);
					return this;
				},
				/**
				* Adds a stylesheet link to the head.
				* @memberof pe.add
				* @function
				* @param {string} css The path and filename of the stylesheet to add to the page.
				* @return {object} A reference to pe.add
				*/
				css: function (css) {
					var head = pe.add.head,
						styleElement = document.createElement('link');
					pe.add.set(styleElement, 'rel', 'stylesheet').set(styleElement, 'href', css);
					if ((pe.ie > 0 && pe.ie < 10) || !head.insertBefore) {
						$(styleElement).appendTo($(head)).attr('href', css);
					} else {
						head.insertBefore(styleElement, head.firstChild);
					}
					return this;
				},
				/**
				* A completed library array.
				* @memberof pe.add
				* @function
				* @param {string | string[]} d The path and filename of the dependency OR just the name (minus the path and extension).
				* @param {boolean} css Optional. Is the dependency a CSS file? (default: false)
				* @return {string[]} NOTE: If d is a string, this returns a string array with 8 copies of the transformed string. If d is a string array, this returns a string array with just one entry; the transformed string.
				*/
				depends: function (d, css) {
					var iscss = typeof css !== 'undefined' ? css : false,
						extension = pe.suffix + (iscss ? '.css' : '.js'),
						dir = pe.add.liblocation + 'dependencies/' + (iscss ? 'css/' : ''),
						c_d = $.map(d, function (a) {
							return (/^http(s)?/i.test(a)) ? a : dir + a + extension;
						});
					return c_d;
				},
				/**
				* Adds a JavaScript link for i18n to the head. It picks the file in pe.add.liblocation + 'i18n/' whose prefix matches the page language.
				* @memberof pe.add
				* @function
				* @param {string} lang The two (iso 639-1) code of the page.
				* @return {void}
				*/
				language: function (lang) {
					var url;
					lang = pe.get_language(lang, pe.languages);
					url = pe.add.liblocation + 'i18n/' + (lang !== null ? lang : 'en') + pe.suffix + '.js';
					pe.add._load(url);
				},
				/**
				* Adds a metadata element (with given name and content attributes) to the head of the document. NOTE: Use this in conjuntion with pe.add.set if you need other attributes set.
				* @memberof pe.add
				* @function
				* @param {string} name The value of the name attribute of the meta tag being created.
				* @param {string} content The value of the content attribute of the meta tag being created.
				* @return {object} A reference to pe.add
				*/
				meta: function (name, content) {
					var styleElement;
					styleElement = document.createElement('meta');
					pe.add.set(styleElement, 'name', name).set(styleElement, 'content', content);
					pe.add.head.appendChild(styleElement);
					return this;
				},
				/**
				* Adds a mobile favicon to the head of the document.
				* @memberof pe.add
				* @function
				* @param {string} href Path of the favicon to add
				* @param {string} rel Value of the favicon's rel attribute
				* @param {string} sizes Value of the favicon's sizes attribute
				* @return {object} A reference to pe.add
				*/
				favicon: function(href, rel, sizes) {
					var favicon = document.createElement('link');
					pe.add.set(favicon, 'href', href).set(favicon, 'rel', rel).set(favicon, 'sizes', sizes);
					pe.add.head.appendChild(favicon);
					return this;
				}
			};
		}
		()),
		/**
		* Handles loading of the plugins, dependencies and polyfills
		* @function
		* @param {object} options Object containing the loader options. The following optional properties are supported:
		* 'plugins': {'plugin_name1': elms1, 'plugin_name2': elms2, ...} - Names of plugins to load and the elements to load them on
		* 'global': [plugin_name1, plugin_name2, ...] - Names of global plugins to load
		* 'deps': [dependency_name1, dependency_name2, ...] - Names of dependences to load
		* 'poly': [polyfill_name1, polyfill_name2, ...] - Names of polyfills to load
		* 'checkdom': true/false - Enable/disable checking the DOM for 'wet-boew-*' triggers
		* 'polycheckdom': true/false - Enable/disable checking the DOM for elements to polyfill
		* @param {string} finished_event Name of the event to trigger when loading is complete (default is 'wb-loaded')
		* @return {void}
		*/
		wb_load: function (options, finished_event) {
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof finished_event === 'undefined') {
				finished_event = 'wb-loaded';
			}
			var i,
				j,
				_len,
				_len2,
				settings = pe.settings,
				plugins = typeof options.plugins !== 'undefined' ? options.plugins : {},
				plug,
				_pcalls,
				pcalls = typeof options.global !== 'undefined' ? options.global : [],
				pcall,
				node,
				classes,
				dep = typeof options.dep !== 'undefined' ? options.dep : [],
				depcss = typeof options.depcss !== 'undefined' ? options.depcss : [],
				poly = typeof options.poly !== 'undefined' ? options.poly : [],
				checkdom = typeof options.checkdom !== 'undefined' ? options.checkdom : false,
				polycheckdom = typeof options.polycheckdom !== 'undefined' ? options.polycheckdom : false,
				wetboew = checkdom ? $('[class^="wet-boew-"]') : $(),
				time = (new Date()).getTime(),
				event_polyinit = 'wb-polyinit-loaded-' + time,
				event_pcalldeps = 'wb-pcalldeps-loaded-' + time,
				event_polydep = 'wb-polydeps-loaded-' + time;

			// Prepare manually specified plugins for processing
			for (plug in plugins) {
				if (plugins.hasOwnProperty(plug)) {
					wetboew = wetboew.add(plugins[plug].addClass('wet-boew-' + plug));
				}
			}

			// Push each of the 'wet-boew-*' plugin calls into the pcalls array
			for (j = 0, _len2 = wetboew.length; j !== _len2; j += 1) {
				node = wetboew[j];
				classes = node.className.split(' ');
				_pcalls = [];
				for (i = 0, _len = classes.length; i !== _len; i += 1) {
					if (classes[i].indexOf('wet-boew-') === 0) {
						_pcalls.push(classes[i].substr(9).toLowerCase()); // Push the plugin call into the local array
					}
				}
				node.setAttribute('data-load', _pcalls.join(',')); // Add the plugins to load to data-load for loading later
				pcalls.push.apply(pcalls, _pcalls); // Push the plugin calls into the pcall array
			}

			// Push each of the global plugin calls into the pcall array
			if (settings) {
				pcalls.push(settings.globals);
			}

			// Eliminate duplicate plugin calls
			pcalls = pe.array.noduplicates(pcalls);

			// Push each required polyfill and dependency into the poly and dep arrays
			for (i = 0, _len = pcalls.length; i !== _len; i += 1) {
				pcall = pcalls[i];
				if (typeof pe.fn[pcall] !== 'undefined') {
					if (typeof pe.fn[pcall].polyfills !== 'undefined') {
						poly.push.apply(poly, pe.fn[pcall].polyfills);
					}
					if (typeof pe.fn[pcall].depends !== 'undefined') {
						dep.push.apply(dep, pe.fn[pcall].depends);
						if (typeof pe.fn[pcall].dependscss !== 'undefined') {
							dep.push.apply(depcss, pe.fn[pcall].dependscss);
						}
					}
				}
			}

			pe.document.one(event_polyinit, function (e) {
				var polyfills = pe.polyfills.polyfill,
					polydeps = e.payload[0],
					polyinit = e.payload[1],
					polydeps_load = [],
					polyname;

				// Initiate any polyfills that need to be initiated manually
				for (i = 0, _len = polyinit.length; i !== _len; i += 1) {
					polyfills[polyinit[i]].init();
				}

				// Push the polyfill dependencies into the dep array and create a new array of polyfills to load
				for (polyname in polydeps) {
					if (polydeps.hasOwnProperty(polyname)) {
						dep.push.apply(dep, polydeps[polyname]);
						polydeps_load.push(polyname);
					}
				}

				pe.document.one(event_pcalldeps, function () {
					pe.document.one(event_polydep, function (e) {
						// Initiate any polyfills that need to be initiated manually
						polyinit = typeof e.payload !== 'undefined' ? e.payload[1] : [];
						for (i = 0, _len = polyinit.length; i !== _len; i += 1) {
							polyfills[polyinit[i]].init();
						}

						// Execute each of the node specific plugin calls in reverse order (to execute nested plugin calls first)
						var _len2 = wetboew.length,
							_node,
							_fcall;
						while (_len2--) {
							_node = wetboew.eq(_len2);
							_fcall = _node.attr('data-load').split(',');
							for (i = 0, _len = _fcall.length; i !== _len; i += 1) {
								if (typeof pe.fn[_fcall[i]] !== 'undefined') { // lets safeguard the execution to only functions we have
									pe.fn[_fcall[i]]._exec(_node);
								}
							}
						}

						// Execute each of the global plugin calls
						if (settings) {
							for (i = 0, _len = settings.globals.length; i !== _len; i += 1) {
								pe.fn[settings.globals[i]]._exec(document);
							}
						}

						// Loading completed, trigger the finished event
						pe.document.trigger(finished_event);
					});

					// Load the polyfills with dependencies
					if (polydeps_load.length !== 0) {
						pe.polyfills.polyload(polydeps_load, event_polydep, false);
					} else {
						pe.document.trigger(event_polydep);
					}
				});

				// Load each of the dependencies (eliminating duplicates)
				if (dep.length !== 0) {
					if (depcss.length > 0) {
						depcss = pe.add.depends(pe.array.noduplicates(depcss), true);
						_len = depcss.length;
						while (_len--) {
							pe.add.css(depcss[_len]);
						}
					}
					pe.add._load_arr(pe.add.depends(pe.array.noduplicates(dep)), event_pcalldeps);
				} else {
					pe.document.trigger(event_pcalldeps);
				}
			});

			// Load the polyfills without dependencies and return the polyfills with dependencies (eliminating duplicates first)
			pe.polyfills.polyload(pe.array.noduplicates(poly), event_polyinit, polycheckdom);
		},
		/**
		* Follows the _init function and i18n initialization.
		* @memberof pe
		* @function
		* @return {void}
		* @todo pass an element as the context for the recursion.
		*/
		dance: function () {
			var loading_finished = 'wb-init-loaded',
				plugins = {};
			pe.document.one(loading_finished, function () {
				if (!(pe.ie > 0 && pe.ie < 9)) {
					pe.resize(function () {
						var mobilecheck = pe.mobilecheck(),
							mediumcheck;
						if (pe.mobile !== mobilecheck) {
							pe.mobile = mobilecheck;
							window.location.reload();
						} else {
							mediumcheck = pe.mediumcheck();
							if (pe.medium !== mediumcheck) {
								pe.html.toggleClass('medium-screen small-screen');
							}
							pe.medium = mediumcheck;
						}
					});
				}
			});

			// Figure out if we need to load plugins for IE
			if (pe.ie > 0) {
				plugins.equalize = pe.main;
				if (pe.ie < 9) {
					plugins.css3ie = pe.main;
				}
			}
			pe.resizeutil.init();
			pe.wb_load({'plugins': plugins, 'checkdom': true, 'polycheckdom': true}, loading_finished);
		}
	};
	/* window binding */
	window.pe = $.extend(true, pe, _pe);
	return window.pe;
}
(jQuery))._init();
