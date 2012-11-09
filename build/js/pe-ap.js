/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: v3.1.0-a1
 *//*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Dependencies for pe
 * - desktop will more than likely be more intensive in terms of capabilities
 * - mobile will be thinner
 */
/*
 * pe, a progressive javascript library agnostic framework
 */
/*global ResizeEvents: false, jQuery: false, wet_boew_properties: false, wet_boew_theme: false, fdSlider: false, document: false, window: false, setTimeout: false, navigator: false, localStorage: false*/
(function ($) {
	"use strict";
	var pe, _pe;
	/**
	* pe object
	* @namespace pe
	* @version 3.0
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
		language: (document.getElementsByTagName('html')[0].lang ? document.getElementsByTagName('html')[0].lang : 'en'),
		languages: ['en','es','fr','pt-BR','pt'],
		touchscreen: 'ontouchstart' in document.documentElement,
		mobileview: (wet_boew_theme !== null && typeof wet_boew_theme.mobileview === 'function'),
		suffix: $('body script[src*="/pe-ap-min.js"]').length > 0 ? '-min' : '', // determine if pe is minified
		header: $('#wb-head'),
		bodydiv: $('body > div'),
		main: $('#wb-main'),
		secnav: $('#wb-sec'),
		footer: $('#wb-foot'),
		urlpage: '',
		urlhash: '',
		urlquery: '',
		svg: ($('<svg xmlns="http://www.w3.org/2000/svg" />').get(0).ownerSVGElement !== undefined),
		document: $(document),
		mobiletest: '',
		settings: (typeof wet_boew_properties !== 'undefined' && wet_boew_properties !== null) ? wet_boew_properties : false,

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
			var $html = $('html'), hlinks, hlinks_same, $this, target, test, init_on_mobileinit = false;

			// Append the mobile test to the body
			pe.mobiletest = document.createElement('div');
			pe.mobiletest.setAttribute('id', 'mobiletest'); // Used to detect CSS media queries result regarding mobile/desktop view
			document.body.appendChild(pe.mobiletest);

			// Load polyfills that need to be loaded before anything else
			pe.polyfills.init();

			// Get the hash and query parameters from the URL
			pe.urlpage = pe.url(window.location.href);
			pe.urlhash = pe.urlpage.hash;
			pe.urlquery = pe.urlpage.params;

			// Identify whether or not the device supports JavaScript and has a touchscreen
			$html.removeClass('no-js').addClass(wet_boew_theme !== null ? wet_boew_theme.theme : '').addClass(pe.touchscreen ? 'touchscreen' : '');

			hlinks = pe.bodydiv.find('#wb-main a, #wb-skip a').filter(function () {
				return this.href.indexOf('#') !== -1;
			});
			hlinks_same = hlinks.filter(function () {
				return $(this).attr('href').indexOf('#') === 0; // Same page links with hashes
			});

			// Is this a mobile device?
			if (pe.mobilecheck()) {
				pe.mobile = true;
				pe.bodydiv.attr('data-role', 'page').addClass('ui-page-active');
				
				// Detect if pre-OS7 BlackBerry device is being used
				test = navigator.userAgent.indexOf('BlackBerry');
				$html.addClass((test === 0 || (test !== -1 && navigator.userAgent.indexOf('Version/6') !== -1) ? 'bb-pre7' : ''));

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
					// On click, puts focus on and scrolls to the target of same page links
					hlinks_same.off('click vclick').on('click vclick', function () {
						$this = $($(this).attr("href").replace(/[.:]/, '\\$1'));
						$this.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
						if ($this.length > 0) {
							$.mobile.silentScroll(pe.focus($this).offset().top);
						}
					});

					// If the page URL includes a hash upon page load, then focus on and scroll to the target
					if (pe.urlhash.length !== 0) {
						target = pe.main.find('#' + pe.urlhash);
						target.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
						if (target.length > 0 && target.attr('data-role') !== 'page') {
							setTimeout(function () {
								$.mobile.silentScroll(pe.focus(target).offset().top);
							}, 200);
						}
					}
				});
				pe.add.css([pe.add.themecsslocation + 'jquery.mobile' + pe.suffix + '.css']);
				pe.add._load([pe.add.liblocation + 'jquerymobile/jquery.mobile.min.js']);
			} else {
				// On click, puts focus on the target of same page links (fix for browsers that don't do this automatically)
				hlinks_same.on("click vclick", function () {
					$this = $($(this).attr('href').replace(/[.:]/, '\\$1'));
					$this.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
					if ($this.length > 0) {
						pe.focus($this);
					}
				});

				// Puts focus on the target of a different page link with a hash (fix for browsers that don't do this automatically)
				if (pe.urlhash.length > 0) {
					$this = $(pe.urlhash.replace(/[.:]/, '\\$1'));
					$this.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
					if ($this.length > 0) {
						pe.focus($this);
					}
				}
			}

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
					$o.append($(data));
				}, 'html');
			})).always(function () {
				// Wait for localisation and ajax content to load plugins
				pe.document.one('languageloaded', function () {
					// Check to see if PE enhancements should be disabled
					if (pe.pedisable() === true) {
						return false; // Disable PE enhancements
					}
					if (wet_boew_theme !== null) {
						// Initialize the theme
						wet_boew_theme.init();

						//Load the mobile view
						if (pe.mobile) {
							pe.document.one('mobileviewloaded', function () {
								if (typeof $.mobile !== 'undefined') {
									pe.mobilelang();
									$.mobile.initializePage();
								} else {
									init_on_mobileinit = true;
								}
							});
							wet_boew_theme.mobileview();
						}
					} else if (pe.mobile) {
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
			return pe.mobiletest.offsetWidth === 1; // CSS (through media queries) sets to offsetWidth = 0 in desktop view and offsetWidth = 1 in mobile view
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
		},
		/**
		* The pe aware page query to append items to
		* @memberof pe
		* @function
		* @return {jQuery object}
		*/
		pagecontainer: function () {
			return $('#wb-body-sec-sup,#wb-body-sec,#wb-body').add('body').eq(0);
		},
		/**
		* Initializes the Resize dependency, and attaches a given function to various resize events.
		* @memberof pe
		* @function
		* @param {function} fn The function to run when a resize event fires.
		* @return {void}
		*/
		resize: function (fn) {
			ResizeEvents.initialise(); // ensure resize function initialized
			ResizeEvents.eventElement.bind('x-text-resize x-zoom-resize x-window-resize', function () {
				fn();
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
				* @type {string} If no port is specified, this will return "80".
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
					return this.source.replace(/#([A-Za-z0-9\-_=&]+.:)/, '');
				}
			};
		},
		/**
		* @memberof pe
		* @function
		* @return {boolean}
		*/
		cssenabled: function () {
			return pe.mobiletest.offsetWidth < 2; // pe.mobiletest will be either 0 or 1 if CSS is enabled
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
			}
		},
		/**
		* @namespace pe.array
		*/
		array: {
			/**
			* Eliminates duplicate strings in an array
			* @memberof pe.sarray
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
				return date.getFullYear() + '-' + pe.string.pad(date.getMonth() + 1, 2, "0") + '-' + pe.string.pad(date.getDate(), 2, '0');
			},
			
			from_iso_format: function(s){
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
				pedisable_link = (settings && typeof settings.pedisable_link === 'boolean' ? settings.pedisable_link : true);

			for (qparam in qparams) { // Rebuild the query string
				if (qparams.hasOwnProperty(qparam) && qparam !== 'pedisable') {
					newquery += qparam + '=' + qparams[qparam] + '&amp;';
				}
			}

			if ((pe.ie > 0 && pe.ie < 7 && disable !== "false") || disable === "true") {
				$('html').addClass('no-js pe-disable');
				if (lsenabled) {
					localStorage.setItem('pedisable', 'true'); // Set PE to be disable in localStorage
				}
				// Append the Standard version link version unless explicitly disabled in settings.js
				if (pedisable_link) {
					li.innerHTML = '<a href="' + newquery + 'pedisable=false">' + pe.dic.get('%pe-enable') + '</a>';
					tphp.appendChild(li); // Add link to re-enable PE
				}
				return true;
			} else if (disable === "false" || disablels !== null) {
				if (lsenabled) {
					localStorage.setItem('pedisable', 'false'); // Set PE to be enabled in localStorage
				}
			}

			// Append the Basic HTML version link version unless explicitly disabled in settings.js
			if (pedisable_link) {
				li.innerHTML = '<a href="' + newquery + 'pedisable=true">' + pe.dic.get('%pe-disable') + '</a>';
				tphp.appendChild(li); // Add link to disable PE
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
			* @param {string} navclass Optional. Class to apply. Defaults to "nav-current".
			* @function
			* @return {jQuery object} Link where match found
			*/
			navcurrent: function (menusrc, bcsrc, navclass) {
				var pageurl = window.location.hostname + window.location.pathname,
					pageurlquery = window.location.search,
					menulinks,
					menulink,
					menulinkurl,
					menulinkurllen,
					menulinkquery,
					menulinkquerylen,
					menulinkslen,
					bclinks,
					bclink,
					bclinkslen,
					bcindex,
					h1text = pe.main.find('h1').text(),
					match = false,
					hrefBug = pe.ie !== 0 && pe.ie < 8; // IE7 and below have an href bug so need a workaround
				menusrc = typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc);
				menulinks = menusrc.find('a').get();
				navclass = (typeof navclass === 'undefined') ? 'nav-current' : navclass;

				// Try to find a match with the page URL or h1
				menulinkslen = menulinks.length;
				while (menulinkslen--) {
					menulink = menulinks[menulinkslen];
					if ((!hrefBug && menulink.getAttribute('href').slice(0, 1) !== '#') || (hrefBug && (menulink.href.indexOf('#') === -1 || pageurl !== menulink.hostname + menulink.pathname.replace(/^([^\/])/, '/$1')))) {
						menulinkurl = menulink.hostname + menulink.pathname.replace(/^([^\/])/, '/$1');
						menulinkurllen = menulinkurl.length;
						menulinkquery = menulink.search;
						menulinkquerylen = menulinkquery.length;
						if ((pageurl.slice(-menulinkurllen) === menulinkurl && (menulinkquerylen === 0 || pageurlquery.slice(-menulinkquerylen) === menulinkquery)) || menulink.innerHTML === h1text) {
							match = true;
							break;
						}
					}
				}

				// No page URL match found, try a breadcrumb link match instead
				if (!match) {
					// Pre-process the breadcrumb links
					bcsrc = typeof bcsrc.jquery !== 'undefined' ? bcsrc : $(bcsrc);
					bclinks = bcsrc.find('a').get();
					bclinkslen = bclinks.length;
					bcindex = bclinkslen;
					while (bcindex--) {
						bclink = bclinks[bcindex];
						bclinks[bcindex] = bclink.hostname + bclink.pathname.replace(/^([^\/])/, '/$1');
					}

					// Try to match each breadcrumb link
					menulinkslen = menulinks.length;
					while (menulinkslen--) {
						menulink = menulinks[menulinkslen];
						if ((!hrefBug && menulink.getAttribute('href').slice(0, 1) !== '#') || (hrefBug && (menulink.href.indexOf('#') === -1 || pageurl !== menulink.hostname + menulink.pathname.replace(/^([^\/])/, '/$1')))) {
							menulinkurl = menulink.hostname + menulink.pathname.replace(/^([^\/])/, '/$1');
							menulinkurllen = menulinkurl.length;
							bcindex = bclinkslen;
							while (bcindex--) {
								if (bclinks[bcindex].slice(-menulinkurllen) === menulinkurl) {
									match = true;
									break;
								}
							}
							if (match) {
								break;
							}
						}
					}
				}
				return (match ? $(menulink).addClass(navclass) : $());
			},
			/**
			* Builds jQuery Mobile nested accordion menus from an existing menu
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Existing menu to process
			* @param {number} hlevel Heading level to process (e.g., h3 = 3)
			* @param {string} theme1 Letter representing the jQuery Mobile theme for menu items
			* @param {boolean} mbar Optional. Is the heading level to process in a menu bar? Defaults to false.
			* @param {boolean} expandall Optional. Expand all collapsible items by default? Defaults to false.
			* @param {string} theme2 Optional. Letter representing the jQuery Mobile theme to use for secondary menu items. Defaults to theme1 value.
			* @param {boolean} top Optional. Is the menu level being processed the top level? Defaults to true.
			* @function
			* @return {jQuery object} Mobile menu
			*/
			buildmobile: function (menusrc, hlevel, theme_1, mbar, expandall, theme_2, top) {
				var heading = 'h' + hlevel,
					headingOpen = '<' + heading + '>',
					headingClose = '</' + heading + '>',
					menuitems = (typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc)).find('> div, > ul, ' + heading),
					next,
					subsection,
					hlink,
					navCurrent,
					nested,
					hasHeading,
					menubar = (mbar !== undefined ? mbar : false),
					expand = (expandall !== undefined ? expandall : false),
					mainText = pe.dic.get('%main-page'),
					toplevel = (top !== undefined ? top : true),
					theme2 = (theme_2 !== undefined ? theme_2 : theme_1),
					theme1 = (toplevel ? theme_1 : theme_2),
					collapsibleSet = '<div data-role="collapsible-set" data-inset="false" data-theme="' + theme2 + '"></div>',
					listView = '<ul data-role="listview" data-theme="' + theme2 + '"></ul>',
					menu = toplevel ? $('<div data-role="controlgroup"></div>') : $('<div/>');
				if (menuitems.get(0).tagName.toLowerCase() === 'ul') {
					menu.append($(listView).append(menuitems.first().children('li')));
				} else {
					hasHeading = menuitems.filter(heading).length !== 0;
					if (menubar && !hasHeading) { // Menu bar without a mega menu
						subsection = '<ul data-role="listview" data-theme="' + theme1 + '">';
						menuitems = menuitems.find('a');
						menuitems.each(function () {
							subsection += '<li><a href="' + this.href + '">' + this.innerHTML + '</a></li>';
						});
						menu.append(subsection + '</ul>');
					} else {
						menuitems.each(function () {
							var $this = $(this),
								tagName = this.tagName.toLowerCase();
							// If the menu item is a heading
							if (tagName === heading) {
								hlink = $this.children('a');
								navCurrent = hlink.hasClass('nav-current');
								subsection = $('<div data-role="collapsible"' + ((expand && !menubar) || navCurrent ? ' data-collapsed="false" data-theme="' + theme1 + '"' : '') + (navCurrent ? ' class="nav-current"' : '') + '>' + headingOpen + $this.text() + headingClose + '</div>');
								next = $this.next();
								if (next.get(0).tagName.toLowerCase() === 'ul') {
									// The original menu item was not in a menu bar
									if (!menubar && hlink.length > 0) {
										next.append($('<li></li>').append($this.children('a').html(hlink[0].innerHTML + ' - ' + mainText)));
									}
									nested = next.find('li ul');
									// If a nested list is detected
									nested.each(function (index) {
										var $this = $(this),
											hlink_html,
											headingIndexOpen = '<h' + (hlevel + 1 + index) + '>',
											headingIndexClose = '</h' + (hlevel + 1 + index) + '>';
										if ((hlevel + 1 + index) < 7) {
											// Make the nested list into a collapsible section
											hlink = $this.prev('a');
											hlink_html = hlink[0].innerHTML;
											$this.attr({ 'data-role': 'listview', 'data-theme': theme2 }).wrap('<div data-role="collapsible"' + (expand || hlink.hasClass('nav-current') ? 'data-collapsed="false" data-theme="' + theme2 + '"' : '') + '></div>');
											$this.parent().prepend(headingIndexOpen + hlink_html + headingIndexClose);
											$this.append('<li><a href="' + hlink.attr('href') + '">' + hlink_html + ' - ' + mainText + '</a></li>');
											hlink.remove();
										} else {
											$this.attr({ 'data-role': 'listview', 'data-theme': theme2 });
										}
									});
									subsection.append($(listView).append(next.children('li')));
									if (!expand && nested.length > 0) {
										subsection.find('ul').wrap(collapsibleSet);
									}
								} else { // If the section contains sub-sections
									if (menubar) {
										subsection.append(pe.menu.buildmobile($this.parent().find('.mb-sm'), hlevel + 1, theme1, false, expand, theme2, false));
									} else {
										subsection.append(pe.menu.buildmobile($this.parent(), hlevel + 1, theme1, false, expand, theme2, false));
									}
									// If the original menu item was not in a menu bar
									if (!menubar && toplevel) {
										subsection.append($this.children('a').html(hlink[0].innerHTML + ' - ' + mainText).attr({'data-role': 'button', 'data-theme': theme2, 'data-icon': 'arrow-r', 'data-iconpos': 'right', 'data-corners': 'false'}));
									}
								}
								menu.append(subsection);
							} else if (tagName === 'div') { // If the menu item is a div
								next = $this.children('a, ul');
								if (next.length > 0) {
									if (next.get(0).tagName.toLowerCase() === 'a') {
										menu.append('<a href="' + next.attr('href') + '" data-role="button" data-theme="' + theme1 + '" data-icon="arrow-r" data-iconpos="right" data-corners="false">' + next.html() + '</a>');
									} else {
										menu.append($this.children('ul').attr({ 'data-role': 'listview', 'data-theme': (toplevel ? theme1 : theme2) }));
									}
								}
							}
						});
						if (toplevel || !expand) {
							menu.children().wrapAll('<div data-role="collapsible-set" data-inset="false" data-theme="' + theme1 + '"></div>');
						}
					}
				}
				return menu;
			},
			/**
			* Closes collapsible menus built by pe.menu.mobile that have a descendant matching the selector
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Mobile menu to correct
			* @param {string} selector Selector for the link(s) to expand/collapse.
			* @param {boolean} collapse Collapse (true) or expand (false) the selected collapsible menus.
			* @param {boolean} allparents Expand/collapse all ancestor collapsible menus (true) or just the nearest parent (false).
			* @function
			* @return {void} Mobile menu
			*/
			expandcollapsemobile: function (menusrc, selector, collapse, allparents) {
				var elm = $((typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc))).find(selector);
				if (allparents) {
					elm.parents('div[data-role="collapsible"]').attr('data-collapsed', collapse);
				} else {
					elm.closest('div[data-role="collapsible"]').attr('data-collapsed', collapse);
				}
			},
			/**
			* Correct the corners for each sections and sub-section in the menu build by pe.menu.buildmobile
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Mobile menu to correct
			* @function
			* @return {void}
			*/
			correctmobile: function (menusrc) {
				var original = (typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc)),
					menus = original.find('.ui-controlgroup-controls').children().get(),
					menu,
					menu_len = menus.length,
					children,
					child,
					children_len;
				while (menu_len--) {
					menu = menus[menu_len];
					menu.getElementsByTagName('a')[0].className += ' ui-corner-top';
					children = menu.childNodes;
					children_len = children.length;
					while (children_len--) {
						child = children[children_len];
						if (child.nodeType === 1) {
							child.getElementsByTagName('a')[0].className += ' ui-corner-bottom';
							break;
						}
					}
				}
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
					$html = $('html');
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
					$html = $('html');

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

				for (i = 0, _len = loadnow.length; i !== _len; i += 1) {
					polyprefs = polyfills[loadnow[i]];
					js[js.length] = (typeof polyprefs.load !== 'undefined' ? polyprefs.load : lib + 'polyfills/' + loadnow[i] + pe.suffix + '.js');
					if (typeof polyprefs.init !== 'undefined') {
						needsinit.push(loadnow[i]);
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
				if ($('html').hasClass('polyfill-' + poly_name)) {
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
					depends: ['resize', 'outside'],
					update: function (elms) {
						elms.datalist();
					},
					/* Based on check from Modernizr 2.6.1 | MIT & BSD */
					support_check: !!(document.createElement('datalist') && window.HTMLDataListElement)
				},
				'datepicker': {
					selector: 'input[type="date"]',
					depends: ['calendar', 'xregexp', 'outside'],
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
					depends: ['metadata'],
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
				head: document.head || document.getElementsByTagName('head'),
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
					return themecss.length > 0 ? themecss.attr('href').substr(0, themecss.attr('href').lastIndexOf("/") + 1) : 'theme-not-found/';
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
						var scriptElem = document.createElement("script"),
							scriptdone = false;
						pe.add.set(scriptElem, 'async', 'async');
						scriptElem.onload = scriptElem.onreadystatechange = function () {
							if ((scriptElem.readyState && scriptElem.readyState !== 'complete' && scriptElem.readyState !== 'loaded') || scriptdone) {
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
						msg_single = msg_all + "-single";
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
				* @return {string[]} NOTE: If d is a string, this returns a string array with 8 copies of the transformed string. If d is a string array, this returns a string array with just one entry; the transformed string.
				*/
				depends: function (d) {
					var lib = pe.add.liblocation,
						c_d = $.map(d, function (a) {
							return (/^http(s)?/i.test(a)) ? a : lib + 'dependencies/' + a + pe.suffix + '.js';
						});
					return c_d;
				},
				/**
				* Adds a JavaScript link for i18n to the head. It picks the file in pe.add.liblocation + "i18n/" whose prefix matches the page language.
				* @memberof pe.add
				* @function
				* @param {string} lang The two (iso 639-1)  code of the page.
				* @return {void}
				*/
				language: function (lang) {
					var d, url;
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
				}
			};
		}
		()),
		/**
		* Handles loading of the plugins, dependencies and polyfills
		* @function
		* @param {object} options Object containing the loader options. The following optional properties are supported: 
		* "plugins": {"plugin_name1": elms1, "plugin_name2": elms2, ...} - Names of plugins to load and the elements to load them on
		* "global": [plugin_name1, plugin_name2, ...] - Names of global plugins to load
		* "deps": [dependency_name1, dependenccy_name2, ...] - Names of dependences to load
		* "poly": [polyfill_name1, polyfill_name2, ...] - Names of polyfills to load
		* "checkdom": true/false - Enable/disable checking the DOM for "wet-boew-*" triggers
		* "polycheckdom": true/false - Enable/disable checking the DOM for elements to polyfill
		* @param {string} finished_event Name of the event to trigger when loading is complete (defai;t is "wb-loaded")
		* @return {void}
		*/
		wb_load: function (options, finished_event) {
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof finished_event === 'undefined') {
				finished_event = "wb-loaded";
			}
			var i, _len,
				settings = pe.settings,
				plugins = typeof options.plugins !== 'undefined' ? options.plugins : {},
				plug,
				pcalls = typeof options.global !== 'undefined' ? options.global : [],
				pcall,
				dep = typeof options.dep !== 'undefined' ? options.dep : [],
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
				
			// Push each of the "wet-boew-*" plugin calls into the pcalls array
			wetboew.each(function () {
				var _node = $(this),
					classes = _node.attr("class").split(" "),
					_pcalls = [];
				for (i = 0, _len = classes.length; i !== _len; i += 1) {
					if (classes[i].indexOf('wet-boew-') === 0) {
						_pcalls.push(classes[i].substr(9).toLowerCase()); // Push the plugin call into the local array
					}
				}
				_node.attr('data-load', _pcalls.join(',')); // Add the plugins to load to data-load for loading later
				pcalls.push.apply(pcalls, _pcalls); // Push the plugin calls into the pcall array
			});

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

						// Execute each of the node specific plugin calls
						wetboew.each(function () {
							var _node = $(this),
								_fcall = _node.attr('data-load').split(',');
							for (i = 0, _len = _fcall.length; i !== _len; i += 1) {
								if (typeof pe.fn[_fcall[i]] !== 'undefined') { // lets safeguard the execution to only functions we have
									pe.fn[_fcall[i]]._exec(_node);
								}
							}
						});

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
				pe.add._load_arr(pe.add.depends(pe.array.noduplicates(dep)), event_pcalldeps);
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
			var loading_finished = 'wb-init-loaded';
			pe.document.one(loading_finished, function () {
				pe.resize(function () {
					var mobilecheck = pe.mobilecheck();
					if (pe.mobile !== mobilecheck) {
						pe.mobile = mobilecheck;
						window.location.href = decodeURI(pe.url(window.location.href).removehash());
					}
				});
			});
			pe.wb_load({'dep': ['resize', 'equalheights'], 'checkdom': true, 'polycheckdom': true}, loading_finished);
		}
	};
	/* window binding */
	window.pe = $.extend(true, pe, _pe);
	return window.pe;
}
(jQuery))._init();



(function ($) {
	"use strict";
	var _pe = window.pe || {fn: {} };
	
	_pe.fn.archived = {
		type: 'plugin',
		_exec: function (elm) {
			if (pe.mobile) {
				return; // we do not want this on mobile devices
			}
			// create the toolbar
			var notice = $('<div class="archived" role="toolbar"><a class="archived-top-page" href="#archived" role="link">' + pe.dic.get('%archived-page') + '</a></div>'),
				$window = $(window),
				scrollTop = $window.scrollTop();
			// lets bind the scrolls
			$window.on('scroll', function () {
				if ($(this).scrollTop() > 10) {
					notice.fadeIn('normal').attr('aria-hidden', 'false');
				} else {
					notice.fadeOut('normal').attr('aria-hidden', 'true');
				}
			});

			// Ensure that the archived notice does not overlap a link that gains focus
			$(document).on('focusin', function (e) {
				var target = $(e.target);
				if (notice.attr('aria-hidden') === 'false' && (target.offset().top + target.outerHeight()) <= (notice.offset().top + notice.outerHeight())) {
					$window.scrollTop($window.scrollTop() - notice.outerHeight());
				}
			});

			// now test to ensure that we have this correctly placed
			if (scrollTop < 10 || scrollTop === 'undefined') {
				notice.attr('aria-hidden', 'true');
			} else {
				notice.fadeIn('normal').attr('aria-hidden', 'false');
			}
			// add to page
			pe.pagecontainer().append(notice);
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; 
	_pe.fn.charts = {
		type: 'plugin',
		depends: ['raphael', 'parserTable', 'charts'],
		polyfills: ['detailssummary'],
		_exec: function (elm) {
			_pe.fn.chartsGraph.generate(elm);
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.css3ie = {
		type : 'plugin',
		depends : (pe.ie > 0 && pe.ie < 9 ? ['pie', 'resize'] : []),
		_exec : function (elm) {
			if (pe.mobile || !(pe.ie > 0 && pe.ie < 9)) {
				return;
			}

			var $enhance = $('.rounded, .pie-enhance'),
				pieEnabled = false,
				$wbcore = $('#wb-core'),
				$wbcorein = $wbcore.children('#wb-core-in'),
				wbcoremb = $wbcore.css('margin-bottom'),
				body,
				r,
				setupPIE,
				cleanup;

			setupPIE = function () {
				$enhance.each(function () {
					PIE.attach(this);
				});
				return true;
			};
			cleanup = function () {
				$enhance.each(function () {
					PIE.detach(this);
				});
				return false;
			};

			// now attach PIE to bound objects
			if (window.PIE) {
				$enhance.filter(function () {
					return $(this).css('position') === 'static';
				}).css('position', 'relative');

				if (pe.ie === 7) {
					body = document.body;
					r = body.getBoundingClientRect();
					if ((r.left - r.right) / body.offsetWidth === -1) {
						pieEnabled = setupPIE();
					} else {
						$wbcore.css('margin-bottom', ($wbcorein.offset().top + $wbcorein.height()) - ($wbcore.offset().top + $wbcore.height()));
					}
				} else {
					pieEnabled = setupPIE();
				}

				pe.resize(function () {
					if (pe.ie === 7) {
						var body = document.body,
							r = body.getBoundingClientRect();
						if ((r.left - r.right) / body.offsetWidth !== -1) {
							pieEnabled = cleanup($enhance);
							$wbcore.css('margin-bottom', ($wbcorein.offset().top + $wbcorein.height()) - ($wbcore.offset().top + $wbcore.height()));
						} else {
							if (!pieEnabled) {
								setupPIE();
							}
							$wbcore.css('margin-bottom', wbcoremb);
						}
					}
				});
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.datemodified = {
		type: 'plugin',
		_exec: function (elm) {
			var opts,
				timeholder,
				modifiedMeta = document.getElementsByName('dcterms.modified')[0];

			//escape early if meta tag is missing
			if (typeof modifiedMeta === 'undefined' || modifiedMeta === null) {
				return false;
			}
			
			opts = {
				updateNonEmpty : false,// Should the Date Modified value be overwritten even if there is a value already
				modifiedId: 'gcwu-date-mod' //What is the container ID of the data modified section
			};
			
			if (typeof wet_boew_datemodified !== 'undefined' && wet_boew_datemodified !== null) {
				$.extend(opts, wet_boew_datemodified);
			}
			
			//
			timeholder =  document.getElementById(opts.modifiedId);
			if (typeof timeholder === 'undefined' || timeholder === null) {
				return false; //No Date modified section at all, like the splash pages
			} 
			
			timeholder = timeholder.getElementsByTagName('time')[0];
			if (typeof timeholder === 'undefined' || timeholder === null) {
				return false; //Date modified section is being used for a version string as per section 2.2.6.2  of the Standard on Web Usability
			} 
			
			if ( timeholder.innerHTML === '' ||  opts.updateNonEmpty){
				timeholder.innerHTML = modifiedMeta.content;
			}
			return false;
		} 
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.deselectradio = {
		type : 'plugin',
		depends : [],
		_exec : function (elm) {
			var inputs = document.getElementsByTagName('input'),
				inputs_len = inputs.length,
				input;
			// Functionality can be disabled by applying deselect-off to the radio button
			while (inputs_len--) {
				input = inputs[inputs_len];
				if (input.type === 'radio' && input.className.indexOf('deselect-off') === -1) {
					input.className += ' deselectable' + (input.checked ? ' checked' : '');
				}
			}
			$(document).on('click vclick', 'input[type="radio"].deselectable', function () {
				if (this.className.indexOf(' checked') !== -1) { // Already selected so deselect and remember that it is no longer selected
					this.checked = false;
					this.className = this.className.replace(' checked', '');
				} else { // Not selected previously so remember that it is now selected
					var name = this.getAttribute('name'),
						inputs,
						input,
						inputs_len;
					if (name !== undefined) {
						inputs = document.getElementsByName(name);
						inputs_len = inputs.length;
						while (inputs_len--) {
							input = inputs[inputs_len];
							if (input.className.indexOf(' checked') !== -1) {
								input.className = input.className.replace(' checked', '');
							}
						}
						this.className += ' checked';
					}
				}
			});
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.equalize = {
		type : 'plugin',
		depends : (pe.mobile ? [] : ['equalheights', 'resize']),
		_exec : function (elm) {
			if (pe.mobile) {
				return;
			}

			$('.equalize').children().css('min-height', '').parent().equalHeights(true);
			pe.resize(function () {
				$('.equalize').children().css('min-height', '').parent().equalHeights(true);
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.eventscalendar = {
		type: 'plugin',
		depends: ['calendar', 'xregexp'],
		_exec: function (elm) {
			var date = new Date(),
				calendar = _pe.fn.calendar,
				year = date.getFullYear(),
				month = date.getMonth(),
				elm_year = elm.find('.year'),
				elm_month = elm.find('.month'),
				digit,
				events,
				containerid,
				getEvents,
				randomId,
				addEvents,
				showOnlyEventsFor,
				keyboardNavEvents,
				keyboardNavCalendar,
				mouseOnDay,
				mouseOutDay,
				focusDay,
				blurDay,
				blurEvent,
				focusEvent;

			getEvents = function (obj) {
				// set some defaults due to classing over-rides
				var direct_linking = !($(obj).hasClass('event-anchoring')), // do we want to link to event calendar or not - this will forced the links in the calendar to be page id if true
					events = {
						minDate: null,
						maxDate: null,
						iCount: 0,
						list: [
							{
								a: 1
							}
						]
					},
					objEventsList = null;

				if (obj.find('ol').length > 0) {
					objEventsList = obj.find('ol');
				} else if (obj.find('ul').length > 0) {
					objEventsList = obj.find('ul');
				}

				if (objEventsList.length > 0) {
					objEventsList.children('li').each(function () {
						var event = $(this),
							_objTitle = event.find('*:header:first'),
							title = _objTitle.text(),
							_origLink = event.find('a').first(),
							link = _origLink.attr('href'),
							link_id,
							date,
							tCollection,
							strDate1,
							strDate2,
							strDate,
							z,
							_zlen;

						
						if (!direct_linking) {
							link_id = (event.attr('id') !== undefined) ? event.attr('id') : randomId(6);
							event.attr('id', link_id);

							//Fixes IE tabbing error (http://www.earthchronicle.com/ECv1point8/Accessibility01IEAnchoredKeyboardNavigation.aspx)
							if (pe.ie > 0) {
								event.attr('tabindex', '-1');
							}
							link = '#' + link_id;
						}
						
						date = new Date();
						tCollection = event.find('time, span.datetime');
						
						if (tCollection.length > 1) {
							// this is a spanning event
							strDate1 = ($(tCollection[0]).get(0).nodeName.toLowerCase() === 'time') ? $(tCollection[0]).attr('datetime').substr(0, 10).split('-') :  $(tCollection[0]).attr('class').match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split('-');
							strDate2 = ($(tCollection[1]).get(0).nodeName.toLowerCase() === 'time') ? $(tCollection[1]).attr('datetime').substr(0, 10).split('-') :  $(tCollection[1]).attr('class').match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split('-');

							date.setFullYear(strDate1[0], strDate1[1] - 1, strDate1[2]);

							// now loop in events to load up all the days that it would be on tomorrow.setDate(tomorrow.getDate() + 1);
							for (z = 0, _zlen = pe.date.daysBetween(strDate1, strDate2) + 1; z <= _zlen; z += 1) {
								if (events.minDate === null || date < events.minDate) {
									events.minDate = date;
								}
								if (events.maxDate === null || date > events.maxDate) {
									events.maxDate = date;
								}

								events.list[events.iCount] = { 'title': title, 'date': new Date(date.getTime()), 'href': link };
								date = new Date(date.setDate(date.getDate() + 1));
								// add a viewfilter
								if (!_objTitle.hasClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2))) {
									_objTitle.addClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2));
								}
								events.iCount += 1;
							}

						} else if (tCollection.length === 1) {
							// this is a single day event
							strDate = ($(tCollection[0]).get(0).nodeName.toLowerCase() === 'time') ? $(tCollection[0]).attr('datetime').substr(0, 10).split('-') : $(tCollection[0]).attr('class').match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split('-');

							date.setFullYear(strDate[0], strDate[1] - 1, strDate[2]);

							if (events.minDate === null || date < events.minDate) {
								events.minDate = date;
							}
							if (events.maxDate === null || date > events.maxDate) {
								events.maxDate = date;
							}
							events.list[events.iCount] = {'title' : title, 'date' : date, 'href' : link};
							// add a viewfilter
							if (!_objTitle.hasClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2))) {
								_objTitle.addClass('filter-' + (date.getFullYear()) + '-' + pe.string.pad(date.getMonth() + 1, 2));
							}
							events.iCount += 1;
						}

					// end of loop through objects/events
					});
				}

				window.events = events;
				return events;
			};
			randomId = function (sint) {
				var s = '',
					randomchar,
					n;
				randomchar = function () {
					n = Math.floor(Math.random() * 62);
					if (n < 10) {
						return n; //1-10
					}
					if (n < 36) {
						return String.fromCharCode(n + 55); //A-Z
					}
					return String.fromCharCode(n + 61); //a-z
				};
				while (s.length < sint) {
					s += randomchar();
				}
				return 'id' + s;
			};

			keyboardNavCalendar = function (event) {
				var i, evt;
				switch (event.keyCode) {
				case 13: // enter key
				case 32: // spacebar
				case 38: // up arrow
				case 40: // down arrow
					pe.focus(event.data.details.find('a').first());
					return false;
				case 37: // left arrow
					i = $(this).closest('li').index();
					evt = $(this).closest('ol').children('li:lt(' + i + ')').children('a').last();
					pe.focus(evt);
					return false;
				case 39: // right arrow
					i = $(this).closest('li').index();
					evt = $(this).closest('ol').children('li:gt(' + i + ')').children('a').first();
					pe.focus(evt);
					return false;
				case 27: // escape
					$(this).siblings('.ev-details').removeClass('ev-details').addClass('wb-invisible');
					return false;
				}
			};

			keyboardNavEvents = function (event) {
				var i, evt, length;
				switch (event.keyCode) {
				case 38: // up arrow
					i = $(this).closest('li').index();
					length = $(this).closest('ul').children('li').length;
					pe.focus($(this).closest('ul').children('li').eq((i - 1) % length).children('a'));
					// $(this).trigger('focus');
					return false;
				case 40: // down arrow
					i = $(this).closest('li').index();
					length = $(this).closest('ul').children('li').length;
					pe.focus($(this).closest('ul').children('li').eq((i + 1) % length).children('a'));
					return false;
				case 37: // left arrow
					i = $(this).closest('li[id^=cal-]').index();
					evt = $(this).closest('ol').children('li:lt(' + i + ')').children('a').last();
					pe.focus(evt);
					return false;
				case 39: // right arrow
					i = $(this).closest('li[id^=cal-]').index();
					evt = $(this).closest('ol').children('li:gt(' + i + ')').children('a').first();
					pe.focus(evt);
					return false;
				case 27: // escape
					pe.focus($(this).closest('li[id^=cal-]').children('a.calEvent'));
					return false;
				}
			};

			mouseOnDay = function (event) {
				event.data.details.dequeue();
				event.data.details.removeClass('wb-invisible');
				event.data.details.addClass('ev-details');
			};

			mouseOutDay = function (event) {
				event.data.details.delay(100).queue(function () {
					$(this).removeClass('ev-details');
					$(this).addClass('wb-invisible');
					$(this).dequeue();
				});
			};

			focusDay = function (event) {
				event.data.details.removeClass('wb-invisible');
				event.data.details.addClass('ev-details');
			};

			blurDay = function (event) {
				setTimeout(function () {
					if (event.data.details.find('a:focus').length === 0) {
						event.data.details.removeClass('ev-details');
						event.data.details.addClass('wb-invisible');
					}
				}, 5);
			};

			blurEvent = function (event) {
				setTimeout(function () {
					if (event.data.details.find('a:focus').length === 0) {
						event.data.details.removeClass('ev-details');
						event.data.details.addClass('wb-invisible');
					}
				}, 5);
			};

			focusEvent = function (event) {
				event.data.details.removeClass('wb-invisible');
				event.data.details.addClass('ev-details');
			};

			addEvents = function (year, month, days, containerid, eventslist) {
				var e,
					_elen,
					date,
					day,
					content,
					dayEvents,
					link,
					eventDetails,
					item_link;

				//Fix required to make up with the IE z-index behavior mismatch
				days.each(function (index, day) {
					$(day).css('z-index', 31 - index);
				});
				//Determines for each event, if it occurs in the display month
				//@modification - the author used a jQuery native $.each function for looping. This is a great function, but has a tendency to like HTMLELEMENTS and jQuery objects better. We have modified this to a for loop to ensure that all the elements are accounted for.
				for (e = 0, _elen = eventslist.length; e !== _elen; e += 1) {
					date = new Date(eventslist[e].date);

					if (date.getMonth() === month && date.getFullYear() === year) {
						day = $(days[date.getDate() - 1]);
						//Gets the day cell to display an event
						content = day.children('div').html();

						// lets see if the cell is empty is so lets create the cell
						if (day.children('a').length < 1) {
							day.empty();
							link = $('<a href="#ev-' + day.attr('id') + '" class="calEvent">' + content + '</a>');
							day.append(link);
							dayEvents = $('<ul class="wb-invisible"></ul>');

							link.on('keydown', {details: dayEvents}, keyboardNavCalendar);

							//Show day events on mouse over
							day.on('mouseover', {details: dayEvents}, mouseOnDay);

							//Hide days events on mouse out
							day.on('mouseout', {details: dayEvents}, mouseOutDay);

							//Show day events when tabbing in
							link.on('focus', {details: dayEvents}, focusDay);
							//hide day events when tabbing out
							link.on('blur', {details: dayEvents}, blurDay);

							day.append(dayEvents);
						} else {
							// Modification - added and else to the date find due to event collisions not being handled. So the pointer was getting lost
							dayEvents = day.find('ul.wb-invisible');
						}

						eventDetails = $('<li><a href="' + eventslist[e].href +  '">' + eventslist[e].title + '</a></li>');

						if (pe.cssenabled) {
							eventDetails.children('a').attr('tabindex', '-1');
						}

						dayEvents.append(eventDetails);

						item_link = eventDetails.children('a');

						item_link.on('keydown', keyboardNavEvents);

						//Hide day events when the last event for the day loose focus
						item_link.on('blur', {details: dayEvents}, blurEvent);

						//Show day events when tabbing in
						item_link.on('focus', {details: dayEvents}, focusEvent);
					} // end of date range visible
				} // end of event list loop
			};
			showOnlyEventsFor = function (year, month, calendarid) {
				$('.' + calendarid + ' li.calendar-display-onshow').addClass('wb-invisible');
				$('.' + calendarid + ' li.calendar-display-onshow').has(':header[class*=filter-' + year + '-' + pe.string.pad(parseInt(month, 10) + 1, 2) + ']').removeClass('wb-invisible');
			};

			if (elm_year.length > 0 && elm_month.length > 0) {
				year = elm_year.text(); // we are going to assume this is always a number
				if (elm_month.hasClass('textformat')) {
					digit = $.inArray(elm_month.text(), pe.dic.get('%calendar-monthNames'));
					month = digit;
				} else {
					month = elm_month.text() - 1;
				}
			}

			events = getEvents(elm);
			containerid = $(elm).attr('class').split(' ').slice(-1);

			if ($('#wb-main-in').css('padding-left') === '0px') {
				$('#' + containerid).css('margin-left', '10px');
			}

			$('#' + containerid).on('calendarDisplayed', function (e, year, month, days) {
				addEvents(year, month, days, containerid, events.list);
				showOnlyEventsFor(year, month, containerid);
			});
			calendar.create(containerid, year, month, true, events.minDate, events.maxDate);

			$('#' + containerid).attr('role', 'application');
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.feedback = {
		type: 'plugin',
		depends: [],
		_exec: function (elm) {
			var feedback = elm.find('#feedback'),
				web = elm.find('#web'),
				access = web.find('#access'),
				mobile = web.find('#mobile'),
				computer = web.find('#computer'),
				contact_coord = elm.find('#contact-coord'),
				contact1 = contact_coord.find('#contact1'),
				contact2 = contact_coord.find('#contact2'),
				info = contact_coord.find('#info'),
				referrerUrl = document.referrer,
				urlParams = pe.url(window.location.href).params,
				load;

			// Web Questions
			feedback.attr('aria-controls', 'web').on('keyup click load', function (e) {
				load = (e.type === 'load');
				if (!load && this.value === 'web') {
					this.setAttribute('aria-hidden', 'false');
					web.show('slow');
				} else {
					this.setAttribute('aria-hidden', 'true');
					if (load) {
						web.css('display', 'none');
					} else {
						web.hide('slow');
					}
				}
			});
			// Automatically select the reason if specified in the query string

			if (urlParams.submit === undefined && urlParams.feedback !== undefined) {
				feedback.find('option[value="' + urlParams.feedback + '"]').attr('selected', 'selected');
			}
			feedback.trigger('load');

			// Computer and Mobile
			access.attr('aria-controls', 'mobile computer').on('keyup click load', function (e) {
				load = (e.type === "load");
				if (!load && this.value === 'mobile') {
					mobile.attr('aria-hidden', 'false').show('slow');
					computer.attr('aria-hidden', 'true').hide('slow');
				} else {
					computer.attr('aria-hidden', 'false');
					mobile.attr('aria-hidden', 'true');
					if (load) {
						computer.css('display', 'block');
						mobile.css('display', 'none');
					} else {
						computer.show('slow');
						mobile.hide('slow');
					}
				}
			}).trigger('load');

			// Contact info first selection
			contact1.on("keyup click load", function (e) {
				load = (e.type === "load");
				if (!load && this.value === 'yes') {
					info.attr('aria-hidden', 'false').show('slow');
				} else if (load || ((this.value === 'no' || this.value === null) && (contact2.val() === 'no' || contact2.val() === null))) {
					info.attr('aria-hidden', 'true');
					if (load) {
						info.css('display', 'none');
					} else {
						info.hide('slow');
					}
				}
			}).trigger('load');

			// Contact info second selection
			contact2.on("keyup click load", function (e) {
				load = (e.type === "load");
				if (!load && this.value === 'yes') {
					info.attr('aria-hidden', 'false').show('slow');
				} else if (load || ((this.value === 'no' || this.value === null) && (contact1.val() === 'no' || contact1.val() === null))) {
					info.attr('aria-hidden', 'true');
					if (load) {
						info.css('display', 'none');
					} else {
						info.hide('slow');
					}
				}
			}).trigger('load');

			// Prepopulates URL form field with referrer
			web.find('#page').attr('value', referrerUrl);

			// Return to the form defaults when the reset button is activated
			elm.find('input[type=reset]').on('click', function () {
				feedback.trigger('load');
				access.trigger('load');
				contact1.trigger('load');
				contact2.trigger('load');
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.footnotes = {
		type: 'plugin',
		_exec: function (elm) {
			var _ctn = $('#wb-main-in').not('.wet-boew-footnotes'), //reference to the content area (which needs to be scanned for footnote references)
				footnote_dd = elm.find('dd').attr('tabindex', '-1');

			// Apply aria-labelledby and set initial event handlers for return to referrer links
			footnote_dd.each(function () {
				var $this = $(this),
					dtid = this.id + '-dt';
				$this.attr('aria-labelledby', dtid).prev().attr('id', dtid);
			});

			//remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
			footnote_dd.find('p.footnote-return a').each(function () {
				var $this = $(this);
				$this.find('span span').remove();
				$this.off('click vclick').on('click vclick', function () {
					var referrer = _ctn.find($(this).attr('href')).find('a');
					if (pe.mobile) {
						$.mobile.silentScroll(pe.focus(referrer).offset().top);
					} else {
						pe.focus(referrer);
					}
					return false;
				});
			});

			//listen for footnote reference links that get clicked
			_ctn.find('sup a.footnote-link').on('click vclick', function () {
				//captures certain information about the clicked link
				var _refLinkDest = elm.find($(this).attr('href'));

				_refLinkDest.find('p.footnote-return a').attr('href', '#' + this.parentNode.id).off('click vclick').on('click vclick', function () {
					var referrer = _ctn.find($(this).attr('href')).find('a');
					if (pe.mobile === true) {
						$.mobile.silentScroll(pe.focus(referrer).offset().top);
					} else {
						pe.focus(referrer);
					}
					return false;
				});
				if (pe.mobile) {
					$.mobile.silentScroll(pe.focus(_refLinkDest).offset().top);
				} else {
					pe.focus(_refLinkDest);
				}
				if (pe.ie > 0 && pe.ie < 8) {
					_refLinkDest.addClass('footnote-focus').one('blur', function () {
						$(this).removeClass('footnote-focus');
					});
				}
				return false;
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery)); 




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.formvalid = {
		type: 'plugin',
		depends: ['validate', 'validateAdditional', 'metadata'],
		languages: ['ar','bg','ca','cs','da','de','el','es','et','eu','fa','fi','fr','he','hr','hu','it','ja','ka','kk','lt','lv','nl','no','pl','pt','pt_BR','pt_PT','ro','ru','si','sk','sl','sr','sv','th','tr','uk','vi','zh','zh_TW'],
		methods: ['de','nl','pt'],
		_exec: function (elm) {
			var form = elm.find('form'),
				formDOM = form.get(0),
				labels = formDOM.getElementsByTagName('label'),
				labels_len = labels.length,
				inputs = formDOM.getElementsByTagName('input'),
				$inputs = $(inputs),
				inputs_len = inputs.length,
				input,
				len,
				nativeAttribute,
				submitted = false,
				required = form.find('[required]').attr('aria-required', 'true'),
				$errorFormId = 'errors-' + (form.attr('id') === undefined ? 'default' : form.attr('id')),
				validator,
				vlang = pe.language.replace('-', '_'),
				lang = pe.get_language(vlang, _pe.fn.formvalid.languages, '_'),
				mthdlang = pe.get_language(vlang, _pe.fn.formvalid.methods, '_'),
				d;

			// Load different language strings if page is not in English
			if (lang !== null) {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/messages_' + lang + pe.suffix + '.js');
			}
<<<<<<< HEAD
			if (lang === "de" || lang === "nl" || lang === "pt_PT" || lang === "pt_BR") {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/methods_' + lang.substr(0,2) + pe.suffix + '.js');
=======
			
			if (mthdlang !== null) {
				pe.add._load(pe.add.liblocation + 'i18n/formvalid/methods_' + mthdlang + pe.suffix + '.js');
>>>>>>> v3.0
			}

			// Add space to the end of the labels (so separation between label and error when CSS turned off)
			len = labels_len;
			while (len--) {
				labels[len].innerHTML += ' ';
			}

			function addValidation(target, key, value) {
				var targetclass = target.attr('class'),
					index1 = (targetclass !== undefined ? targetclass.search(/validate\s?:\s?\{/) : -1),
					valstring;
				if (index1 > -1) { // validate:{ already exists
					if (targetclass.search("/" + key + "\\s?:/") === -1) {
						valstring = targetclass.substring(index1, targetclass.indexOf('{', index1) + 1);
						target.attr('class', targetclass.replace(valstring, valstring + key + ':' + value + ', '));
					}
				} else { // validate:{ doesn't exist
					target.addClass('{validate:{' + key + ':' + value + '}}');
				}
				return;
			}

			// Remove the pattern attribute until it is safe to use with jQuery Validation
			len = inputs_len;
			if (len !== 0 && inputs[0].hasAttribute !== undefined) {
				while (len--) {
					input = inputs[len];
					if (nativeAttribute) {
						if (input.hasAttribute('pattern')) {
							input.removeAttribute('pattern');
						}
					} else {
						$(input).removeAttr('pattern');
					}
				}
			}

			// Change form attributes and values that intefere with validation in IE7/8
			if (pe.ie > 0 && pe.ie < 9) {
				required.removeAttr('required').each(function () {
					addValidation($(this), 'required', 'true'); // Adds required:true to validation:{}
				});
				$inputs.filter('[type="date"]').each(function () {
					var $this = $(this),
						parent = $this.wrap('<div/>').parent(),
						newelm = $(parent.html().replace('type=' + $this.attr('type'), 'type=text'));
					parent.replaceWith(newelm);
				});
			}

			// Special handling for mobile
			if (pe.mobile) {
				formDOM.setAttribute('data-ajax', 'false');
				$inputs.filter('[type="checkbox"]').closest('fieldset').attr('data-role', 'controlgroup');
			}

			// The jQuery validation plug-in in action
			validator = form.validate({
				meta: 'validate',
				focusInvalid: false,

				//Set the element which will wrap the inline error messages
				errorElement: 'strong',

				// Location for the inline error messages
				// In this case we will place them in the associated label element
				errorPlacement: function (error, element) {
					error.appendTo(form.find('label[for="' + element.attr('id') + '"]'));
				},

				// Create our error summary that will appear before the form
				showErrors: function (errorMap, errorList) {
					this.defaultShowErrors();
					var errors = form.find('strong.error').filter(':not(:hidden)'),
						errorfields = form.find('input.error, select.error, textarea.error'),
						summaryContainer = form.find('#' + $errorFormId),
						prefixStart = '<span class="prefix">' + pe.dic.get("%error") + '&#160;',
						prefixEnd = pe.dic.get("%colon") + ' </span>',
						summary;

					form.find('[aria-invalid="true"]').removeAttr("aria-invalid");
					if (errors.length > 0) {
						// Create our container if one doesn't already exist
						if (summaryContainer.length === 0) {
							summaryContainer = $('<div id="' + $errorFormId + '" class="errorContainer" role="alert" tabindex="-1"/>').prependTo(form);
						} else {
							summaryContainer.empty();
						}

						// Post process
						summary = '<p>' + pe.dic.get('%form-not-submitted') + errors.length + (errors.length !== 1 ? pe.dic.get('%errors-found') : pe.dic.get('%error-found')) + '</p><ul>';
						errorfields.attr('aria-invalid', 'true');
						errors.each(function (index) {
							var $this = $(this),
								prefix = prefixStart + (index + 1) + prefixEnd,
								label = $this.closest('label');
							$this.find('span.prefix').detach();
							summary += '<li><a href="#' + label.attr('for') + '">' + prefix + label.find('.field-name').html() + ' - ' + this.innerHTML + '</a></li>';
							$this.prepend(prefix);
						});
						summary += '</ul>';

						// Output our error summary and place it in the error container
						summaryContainer.append(summary);

						// Put focus on the error if the errors are generated by an attempted form submission
						if (submitted) {
							pe.focus(summaryContainer);
						}

						// Move the focus to the associated input when error message link is triggered
						// a simple href anchor link doesnt seem to place focus inside the input
						if (pe.ie === 0 || pe.ie > 7) {
							form.find('.errorContainer a').on('click vclick', function () {
								var label_top = pe.focus($($(this).attr("href"))).prev().offset().top;
								if (pe.mobile) {
									$.mobile.silentScroll(label_top);
								} else {
									$(document).scrollTop(label_top);
								}
								return false;
							});
						}

						submitted = false;
					} else {
						summaryContainer.detach();
					}
				}, //end of showErrors()
				invalidHandler: function (form, validator) {
					submitted = true;
				}
			}); //end of validate()

			// Clear the form and remove error messages on reset
			$inputs.filter('[type="reset"]').on('click vclick touchstart', function () {
				validator.resetForm();
				var summaryContainer = form.find('#' + $errorFormId);
				if (summaryContainer.length > 0) {
					summaryContainer.empty();
				}
				form.find('[aria-invalid="true"]').removeAttr('aria-invalid');
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {} 
	};
	
	_pe.fn.langselect = {
		type: 'plugin',
		_exec: function (elm) {
			elm.on('click', function () {
				var url = window.location.toString();

				if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1)) {
					url = url.replace(/_f\./, "_e.").replace(/-fra\./, "-eng.");
				} else {
					url = url.replace(/_e\./, "_f.").replace(/-eng\./, "-fra.");
				}
				if (url.search(/lang=eng/) > -1) {
					url = url.replace(/lang=eng/, "lang=fra");
				} else {
					url = url.replace(/lang=fra/, "lang=eng");
				}
				window.location = url;
				return false;
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.lightbox = {
		type : 'plugin',
		// This is an example from tabbed interface, to show how to call
		// required libraries
		depends : ['colorbox', 'metadata'],
		groupindex : 0,

		// Don't include a mobile function if your plugin shouldn't run in
		// mobile mode.

		_exec : function (elm) {
			// Variables
			var opts,
				opts2 = {},
				overrides,
				$lb,
				$lbContent,
				$lbLoadedContent,
				$lbNext,
				$lbPrev,
				$lbClose,
				open = false;

			// Defaults
			opts = {
				transition : 'elastic',
				loop : true,
				current : pe.dic.get('%lb-current'),
				previous : pe.dic.get('%lb-prev'),
				next : pe.dic.get('%lb-next'),
				close : pe.dic.get('%close'),
				xhrError : pe.dic.get('%lb-xhr-error'),
				imgError : pe.dic.get('%lb-img-error'),
				maxWidth : '100%',
				maxHeight : '100%',
				slideshowStart : pe.dic.get('%start') + ' ' + pe.dic.get('%lb-slideshow'),
				slideshowStop : pe.dic.get('%stop') + ' ' + pe.dic.get('%lb-slideshow'),
				slideshow : false,
				slideshowAuto : false,
				onLoad : function () {
					var $lbTitle = $lbContent.find('#cboxTitle'),
						$lbCurrent = $lbTitle.next();
					$lbTitle.addClass('wb-hide');
					$lbCurrent.addClass('wb-hide');
				},
				onComplete : function () {
					var $lbTitle = $lbContent.find('#cboxTitle'),
						$lbCurrent = $lbTitle.next();

					$lbLoadedContent = $lbContent.find('#cboxLoadedContent').attr('tabindex', '0');
					$lbLoadedContent.attr('aria-label', $lbTitle.text() + ' ' + $lbCurrent.text());
					if ($lbLoadedContent.children('.cboxPhoto').length === 0) {
						$lbLoadedContent.attr('role', 'document');
					} else {
						$lbLoadedContent.children().attr('alt', $lbTitle.text());
					}
					$lbTitle.removeClass('wb-hide');
					$lbCurrent.removeClass('wb-hide');
					pe.focus($lbLoadedContent);
					open = true;
				},
				onClosed : function () {
					open = false;
				}
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				transition : (elm.hasClass('transition-fade') ? 'fade' : (elm.hasClass('transition-none') ? 'none' : undefined)),
				loop : elm.hasClass('loop-none') ? false : undefined,
				slideshow : elm.hasClass('slideshow') ? true : undefined,
				slideshowAuto : elm.hasClass('slideshow-auto') ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_lightbox), class-based overrides and the data attribute
			$.metadata.setType('attr', 'data-wet-boew');
			if (typeof wet_boew_lightbox !== 'undefined' && wet_boew_lightbox !== null) {
				$.extend(opts, wet_boew_lightbox, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			// Add touchscreen support for launching the lightbox
			$lb = elm.find('.lb-item, .lb-gallery, .lb-hidden-gallery').on('vclick', function () {
				$.colorbox.launch(this);
			});

			// Create options object for inline content
			$.extend(opts2, opts, {inline: 'true'});

			// Build single images, inline content and AJAXed content
			$lb.filter('.lb-item').attr('aria-haspopup', 'true').each(function () {
				var $this = $(this);
				$this.colorbox($this.attr('href').substring(0, 1) !== '#' ? opts : opts2);
			});

			// Build galleries
			$lb.filter('.lb-gallery, .lb-hidden-gallery').each(function () {
				var group = {rel: 'group' + (pe.fn.lightbox.groupindex += 1)};
				$.extend(opts, group);
				$.extend(opts2, group);
				$(this).find('.lb-item-gal').attr('aria-haspopup', 'true').each(function () {
					var $this = $(this);
					$this.colorbox($this.attr('href').substring(0, 1) !== '#' ? opts : opts2);
				});
			});

			// Add WAI-ARIA
			$lbContent = $('#colorbox #cboxContent').attr('role', 'dialog');
			$lbContent.find('#cboxNext, #cboxPrevious, #cboxClose').attr({'tabindex': '0', 'role': 'button', 'aria-controls': 'cboxLoadedContent'});
			$lbNext = $lbContent.find('#cboxNext');
			$lbPrev = $lbContent.find('#cboxPrevious');
			$lbClose = $lbContent.find('#cboxClose');

			// Add extra keyboard support (handling for tab, enter and space)
			$lbContent.on('keydown', function (e) {
				var target_id = e.target.id;
				if (!(e.ctrlKey || e.altKey || e.metaKey)) {
					if (e.keyCode === 9) {
						if (e.shiftKey && target_id === 'cboxLoadedContent') {
							pe.focus($lbClose);
							e.preventDefault();
						} else if (!e.shiftKey && target_id === 'cboxClose') {
							pe.focus($lbLoadedContent);
							e.preventDefault();
						}
					} else if (e.keyCode === 13 || e.keyCode === 32) {
						if (target_id === 'cboxLoadedContent' || target_id === 'cboxNext') {
							$.colorbox.next();
							e.preventDefault();
						} else if (target_id === 'cboxPrevious') {
							$.colorbox.prev();
							e.preventDefault();
						} else if (target_id === 'cboxClose') {
							$.colorbox.close();
							e.preventDefault();
						}
					}
				}
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.menubar = {
		type : 'plugin',
		depends : (_pe.mobile ? [] : ['resize', 'equalheights', 'hoverintent', 'outside']),
		_exec : function (elm) {
			
			
			if (pe.mobile) {
				return;
			}
			var $menu,
				$menuBoundary,
				$scope = elm,
				$scopeParent = $scope.parent(),
				correctheight,
				gotosubmenu,
				hideallsubmenus,
				hidesubmenu,
				showsubmenu,
				submenuHelp = pe.dic.get('%sub-menu-help'),
				menuelms,
				menuelm,
				menulen;

			
			showsubmenu = function (toplink) {
				hideallsubmenus();
				var _node = $(toplink).closest('li'),
					_sm = _node.find('.mb-sm');
				_sm.attr({'aria-expanded':'true', 'aria-hidden':'false'}).toggleClass('mb-sm mb-sm-open');

				if ((Math.floor(_sm.offset().left + _sm.width()) - Math.floor($menuBoundary.offset().left + $menuBoundary.width())) >= -1) {
					_sm.css('right', '0px');
				}
				_node.addClass('mb-active');
				return;
			};
			
			gotosubmenu = function (toplink) {
				var _node = $(toplink),
					_sm = _node.closest('li').find('.mb-sm-open');
				if (pe.cssenabled) {
					_sm.find('a').attr('tabindex', '0');
				}
				_node.trigger('item-next');
				return;
			};
			
			hidesubmenu = function (toplink) {
				var _node = $(toplink).closest('li'),
					_sm = _node.find('.mb-sm-open');
				_sm.attr({'aria-expanded':'false', 'aria-hidden':'true'}).toggleClass('mb-sm mb-sm-open').css('right', '');
				if (pe.cssenabled) {
					_sm.find('a').attr('tabindex', '-1');
				}
				_node.removeClass('mb-active');
				return;
			};
			
			hideallsubmenus = function () {
				$menu.find('.mb-sm-open').each(function () {
					var _menu = $(this).closest('li');
					return hidesubmenu(_menu);
				});
				return;
			};
			
			correctheight = function () {
				var _lastmenuli = $menu.children('li:last'),
					newouterheight = (_lastmenuli.offset().top + _lastmenuli.outerHeight()) - $scope.offset().top;
				return $scope.css('min-height', newouterheight);
			};
			

			
			$menuBoundary = $scope.children('div');
			$menu = $menuBoundary.children('ul');
			
			
			$scope.detach();
			
			
			$scope.attr('role', 'application');
			menuelms = $scope.find('> div > ul').attr('role', 'menubar').get(0).getElementsByTagName('*');
			menulen = menuelms.length;
			while (menulen--) {
				menuelm = menuelms[menulen];
				if (menuelm.tagName.toLowerCase() === 'a') {
					menuelm.setAttribute('role', 'menuitem');
				} else {
					menuelm.setAttribute('role', 'presentation');
				}
			}
			pe.resize(correctheight);

			
			$scope.find('ul.mb-menu > li').find('a:eq(0)').each(function (index, value) {
				var $elm = $(value).addClass('knav-' + index + '-0-0'),
					$childmenu = $elm.closest('li').find('.mb-sm');
				if ($childmenu.length > 0) {
					$elm.attr('aria-haspopup', 'true').addClass('mb-has-sm').wrapInner('<span class="expandicon"><span class="sublink"></span></span>');
					$childmenu.attr({'role': 'menu', 'aria-expanded': 'false', 'aria-hidden': 'true'}).find(':has(:header) ul').attr('role', 'menu');
					$elm.append('<span class="wb-invisible">' + submenuHelp + '</span>');
					$elm.closest('li').hoverIntent({
						over: function () {
							return showsubmenu(this);
						},
						out: function () {
							return hidesubmenu(this);
						},
						timeout: 500
					});
					
					$childmenu.find('h3 a, h4 a, div.top-level > a, li.top-level a, div.mb-main-link > a').each(function (i) {
						var $this = $(this),
							$parent = $this.parent();
						this.className += ' knav-' + index + '-' + (i + 1) + '-0';
						if ($parent.is('h3, h4')) {
							$this.parent().next('ul').find('a').each(function (j) {
								this.className += ' knav-' + index + '-' + (i + 1) + '-' + (j + 1);
							});
						}
						return;
					});
					$childmenu.find('> ul li, > div > ul li').filter(':not(.top-level)').children('a').each(function (i) {
						this.className += ' knav-' + index + '-0-' + (i + 1);
					});
				}
			});

			
			if (pe.cssenabled) {
				$scope.find('.mb-sm a').attr('tabindex', '-1');
			}

			// Reattach $scope now that enhancements are complete
			$scope.appendTo($scopeParent);

			// Adjust the height
			correctheight();

			// Handles opening and closing of a submenu on click of a menu bar item but prevents any changes on click of the empty area in the submenu
			$scope.find('.mb-sm').on('click vclick touchstart', function (event) {
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
			}).parent().on('click vclick touchstart', '> :header a', function () {
				if ($(this).closest('li').hasClass('mb-active')) {
					hidesubmenu(this);
				} else {
					showsubmenu(this);
				}
				return false;
			});

			
			$scope.on('keydown focusin section-next section-previous item-next item-previous close', 'li', function (e) {
				var next,
					prev,
					_elm = $(e.target),
					_activemenu = $scope.find('.mb-active'),
					_id,
					keycode = e.keyCode,
					type = e.type,
					keychar,
					sublink,
					elmtext,
					matches,
					match,
					level;
				_id = $.map(/\bknav-(\d+)-(\d+)-(\d+)/.exec(_elm.attr('class')), function (n) {
					return parseInt(n, 10);
				});
				if (type === 'keydown') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if (keycode === 13) { // enter key
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
								return false;
							}
						} else if (keycode === 27) { // escape key
							_elm.trigger('close');
							return false;
						} else if (keycode === 32) { // spacebar
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
							} else {
								window.location = _elm.attr('href');
							}
							return false;
						} else if (keycode === 37) { // left arrow
							_elm.trigger('section-previous');
							return false;
						} else if (keycode === 38) { // up arrow
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
							} else {
								_elm.trigger('item-previous');
							}
							return false;
						} else if (keycode === 39) { // right arrow
							_elm.trigger('section-next');
							return false;
						} else if (keycode === 40) { // down arrow
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
							} else {
								_elm.trigger('item-next');
							}
							return false;
						} else {
							// 0 - 9 and a - z keys
							if ((keycode > 47 && keycode < 58) || (keycode > 64 && keycode < 91)) {
								keychar = String.fromCharCode(keycode).toLowerCase();
								sublink = (_id[2] !== 0 || _id[3] !== 0);
								elmtext = _elm.text();
								matches = _activemenu.find('.mb-sm-open a').filter(function () {
									var $this = $(this);
									return ($this.text().substring(0, 1).toLowerCase() === keychar || (sublink && $this.text() === elmtext));
								});
								if (matches.length > 0) {
									if (sublink) {
										matches.each(function (index) {
											if ($(this).text() === elmtext) {
												match = index;
												return false;
											}
										});
										if (match < (matches.length - 1)) {
											pe.focus(matches.eq(match + 1));
											return false;
										}
									}
									pe.focus(matches.eq(0));
								}
								return false;
							}
						}
					}
				} else if (type === 'close') {
					pe.focus(_activemenu.find('.knav-' + _id[1] + '-0-0'));
					setTimeout(function () {
						return hideallsubmenus();
					}, 5);
				} else if (type === 'section-previous') {
					level = !!_id[2] << 1 | !!_id[3];
					switch (level) {
					case 0: // top-level menu link has focus
					case 1: // 3rd level menu link has focus, but the popup menu doesn't have sub-sections
						prev = $scope.find('.knav-' + (_id[1] - 1) + '-0-0');
						if (prev.length > 0) {
							pe.focus(prev);
						} else {
							pe.focus($scope.find('ul.mb-menu > li:last').find('a:eq(0)')); // wrap around at the top level
						}
						break;
					case 2: // sub-section link has focus
					case 3: // 3rd level link (child of a sub-section) has focus
						prev = _activemenu.find('.knav-' + (_id[1]) + '-' + (_id[2] - 1) + '-0');
						if (prev.length > 0 && _id[2] > 1) {
							pe.focus(prev);
						} else {
							prev = $scope.find('.knav-' + (_id[1] - 1) + '-0-0'); // wrap around at the sub-section level
							if (prev.length > 0) {
								pe.focus(prev);
							} else {
								pe.focus($scope.find('ul.mb-menu > li:last').find('a:eq(0)')); // wrap around at the top level
							}
						}
						break;
					}
					return false;
				} else if (type === 'section-next') {
					level = !!_id[2] << 1 | !!_id[3];
					switch (level) {
					case 0: // top-level menu link has focus
					case 1: // 3rd level menu link has focus, but the popup menu doesn't have sub-sections
						next = $scope.find('.knav-' + (_id[1] + 1) + '-0-0');
						if (next.length > 0) {
							pe.focus(next);
						} else {
							pe.focus($scope.find('.knav-0-0-0')); // wrap around at the top level
						}
						break;
					case 2: // sub-section link has focus
					case 3: // 3rd level link (child of a sub-section) has focus
						next = _activemenu.find('.knav-' + (_id[1]) + '-' + (_id[2] + 1) + '-0');
						if (next.length > 0) {
							pe.focus(next);
						} else {
							next = $scope.find('.knav-' + (_id[1] + 1) + '-0-0'); // wrap around at the sub-section level
							if (next.length > 0) {
								pe.focus(next);
							} else {
								pe.focus($scope.find('.knav-0-0-0')); // wrap around at the top level
							}
						}
						break;
					}
					return false;
				} else if (type === 'item-next') {
					next = _activemenu.find('.knav-' + _id[1] + '-' + (_id[2]) + '-' + (_id[3] + 1)); // move to next item
					if (next.length === 0) {
						next = _activemenu.find('.knav-' + _id[1] + '-' + (_id[2] + 1) + '-0'); // move to next section
					}
					if (next.length !== 0) {
						pe.focus(next);
					} else {
						pe.focus(_activemenu.find('.knav-' + _id[1] + '-0-1, .knav-' + _id[1] + '-1-0').first()); // move to first item in the submenu
					}
					return false;
				} else if (type === 'item-previous') {
					prev = ((_id[2] !== 0 && _id[3] !== 0) || (_id[2] === 0 && _id[3] > 1) ? _activemenu.find('.knav-' + _id[1] + '-' + (_id[2]) + '-' + (_id[3] - 1)) : ''); // move to previous item
					if (prev.length === 0) {
						prev = (_id[2] !== 0 ? _activemenu.find('a').filter('[class*="knav-' + _id[1] + '-' + (_id[2] - 1) + '-"]:not(.knav-' + _id[1] + '-0-0)').last() : ''); // move to last item of the previous section
					}
					if (prev.length !== 0) {
						pe.focus(prev);
					} else {
						pe.focus(_activemenu.find('[class*="knav-"]').last()); // move to last item in the submenu
					}
					return false;
				} else if (type === 'focusin' && _id[2] === 0 && _id[3] === 0) {
					hideallsubmenus();
					if (_elm.find('.expandicon').length > 0) {
						showsubmenu(e.target);
					}
				}
			});
			$(document).on('click vclick touchstart', function () {
				$scope.trigger('focusoutside');
			});
			$scope.on('focusoutside', function () {
				return hideallsubmenus();
			});

			return $scope;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.multimedia = {
		type: 'plugin',

		polyfills: ['progress'],

		icons: $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g id="play"><path d="M 14.299775,10.18788 5.7002247,4.610169 5.7867772,15.389831 14.299775,10.18788 z" /></g><g id="pause" style="display:inline"><path d="M 5.3405667,4.610169 5.3405667,15.389831 8.9169966,15.389831 8.9169966,4.610169 5.3405667,4.610169 z M 11.083003,4.610169 11.083003,15.389831 14.659433,15.389831 14.659433,4.610169 11.083003,4.610169 z" /></g><g id="rewind" transform="matrix(-1,0,0,-1,20,20)"><path d="M 8.4182018,15.389831 16.924761,10.187472 8.3244655,4.610169 8.3478995,8.03154 3.0752388,4.610169 3.168975,15.389831 8.3947677,12.202801 8.4182018,15.389831 z" /></g><g id="ff"><path  d="M 16.929004,10.187879 8.3294498,4.610169 8.4160023,15.389831 16.929004,10.187879 z M 11.67055,10.187879 3.0709963,4.610169 3.157549,15.389831 11.67055,10.187879 z" /></g><g id="mute_off"><path d="M 12.476712,4.599486 9.3409347,7.735268 5.5431537,7.735268 5.5431537,12.22989 9.3235137,12.22989 12.476712,15.400514 12.476712,4.599486 z"/></g><g id="mute_on"><path  d="M 12.466782,4.5994858 9.3309993,7.7352682 5.5332183,7.7352682 5.5332183,12.22989 9.3135782,12.22989 12.466782,15.400514 12.466782,4.5994858 z" /><path d="M 10,1.75 C 5.454363,1.75 1.78125,5.4543629 1.78125,10 1.78125,14.545637 5.454363,18.25 10,18.25 14.545637,18.25 18.25,14.545637 18.25,10 18.25,5.4543629 14.545637,1.75 10,1.75 z M 10,3.25 C 11.602784,3.25 13.062493,3.7896774 14.21875,4.71875 L 4.71875,14.21875 C 3.8057703,13.065541 3.28125,11.593619 3.28125,10 3.28125,6.2650231 6.2650232,3.25 10,3.25 z M 15.25,5.8125 C 16.169282,6.9656383 16.75,8.4065929 16.75,10 16.75,13.734977 13.734977,16.75 10,16.75 8.4063811,16.75 6.9279359,16.200753 5.78125,15.28125 L 15.25,5.8125 z"/></g><g id="cc"><path d="M 9.2241211,6.4042969 9.2241211,8.4003906 C 8.8914318,8.1725317 8.5564712,8.0039121 8.2192383,7.8945312 7.88655,7.7851623 7.5401961,7.7304748 7.1801758,7.7304687 6.4965774,7.7304748 5.9633748,7.9309955 5.5805664,8.3320313 5.2023079,8.7285207 5.0131804,9.2845097 5.0131836,10 5.0131804,10.715498 5.2023079,11.273766 5.5805664,11.674805 5.9633748,12.071291 6.4965774,12.269533 7.1801758,12.269531 7.5629826,12.269533 7.9252869,12.212567 8.2670898,12.098633 8.6134373,11.984702 8.9324474,11.816083 9.2241211,11.592773 L 9.2241211,13.595703 C 8.8413016,13.736979 8.4516536,13.841797 8.0551758,13.910156 7.6632429,13.983073 7.2690376,14.019531 6.8725586,14.019531 5.4916956,14.019531 4.4116185,13.666341 3.6323242,12.959961 2.8530264,12.249025 2.4633783,11.262372 2.4633789,10 2.4633783,8.7376353 2.8530264,7.7532613 3.6323242,7.046875 4.4116185,6.335945 5.4916956,5.9804766 6.8725586,5.9804687 7.2735948,5.9804766 7.6678002,6.0169349 8.0551758,6.0898437 8.4470963,6.1582108 8.8367443,6.2630284 9.2241211,6.4042969" /><path d="M 17.536621,6.4042969 17.536621,8.4003906 C 17.203932,8.1725317 16.868971,8.0039121 16.531738,7.8945312 16.19905,7.7851623 15.852696,7.7304748 15.492676,7.7304687 14.809077,7.7304748 14.275875,7.9309955 13.893066,8.3320313 13.514808,8.7285207 13.32568,9.2845097 13.325684,10 13.32568,10.715498 13.514808,11.273766 13.893066,11.674805 14.275875,12.071291 14.809077,12.269533 15.492676,12.269531 15.875483,12.269533 16.237787,12.212567 16.57959,12.098633 16.925937,11.984702 17.244947,11.816083 17.536621,11.592773 L 17.536621,13.595703 C 17.153802,13.736979 16.764154,13.841797 16.367676,13.910156 15.975743,13.983073 15.581538,14.019531 15.185059,14.019531 13.804196,14.019531 12.724119,13.666341 11.944824,12.959961 11.165526,12.249025 10.775878,11.262372 10.775879,10 10.775878,8.7376353 11.165526,7.7532613 11.944824,7.046875 12.724119,6.335945 13.804196,5.9804766 15.185059,5.9804687 15.586095,5.9804766 15.9803,6.0169349 16.367676,6.0898437 16.759596,6.1582108 17.149244,6.2630284 17.536621,6.4042969" /></g><g id="overlay"><rect rx="3" ry="3" width="20" height="20" style="fill:#000;opacity:0.4"/><polygon points="5,5 15,10, 5,15" fill="#FFF" style="fill:#FFF;" /></g><g id="loading"><rect rx="3" ry="3" width="20" height="20" style="fill:#000;opacity:0.4"/><g id="spinner" style="stroke-linecap:round;stroke:#FFF;stroke-width:1.5px" transform="translate(9.8,9.8)"><line x1="0" y1="5" x2="0" y2="7" transform="rotate(0,0,0)" opacity="0.09"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(30,0,0)" opacity="0.17"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(60,0,0)" opacity="0.25"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(90,0,0)" opacity="0.33"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(120,0,0)" opacity="0.42"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(150,0,0)" opacity="0.50"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(180,0,0)" opacity="0.58"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(210,0,0)" opacity="0.66"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(240,0,0)" opacity="0.75"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(270,0,0)" opacity="0.83"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(300,0,0)" opacity="0.91"/><line x1="0" y1="5" x2="0" y2="7" transform="rotate(330,0,0)" opacity="1"/></g></g></svg>'),

		get_image: function (id, alt, height, width) {
			var icon, g;

			height = height !== undefined ? height : 20;
			width = width !== undefined ? width : 20;

			if (pe.svg) {
				icon = _pe.fn.multimedia.icons.clone();
				icon.attr({'height': height, 'width': width});
				icon.prepend('<title>' + alt + '</title>');
				icon.children(':not(g[id="' + id + '"])').remove();
				g = icon.children('g');
				g.removeAttr('id');
				if (height !== 20 || width !== 20) {
					g.attr('transform', 'scale(' + width / 20 + ',' + height / 20 + ')');
				}
				return icon.attr({'role' : 'img', 'aria-label' : alt});
			}

			return $('<img src="' + _pe.add.liblocation + 'images/multimedia/' + id + '.png" alt="' + alt + '" height="' + height + '" width="' + width + '" />');
		},

		_exec: function (elm) {
			var id,
				canPlay = false,
				media = elm.children('audio, video').eq(0),
				media_type = media.is('video') ? 'video' : 'audio',
				media_id,
				width = media_type === 'video' ? media.attr('width') : '0',
				height = media_type === 'video' ? media.attr('height') : '0',
				captions,
				flash = true,
				$fbObject,
				poster,
				fbVideoType = 'video/mp4',
				fbAudioType = 'audio/mp3', //MP3
				fbBin = _pe.add.liblocation + 'binary/multimedia.swf?seed=' + Math.random(),
				fbVars,
				evtmgr;

			//Add an id if an id is missing
			if (elm.attr('id') !== undefined) {
				id = elm.attr('id');
			} else {
				id = 'wet-boew-mediaplayer' + elm.index();
				elm.attr('id', id);
			}
			if (media.attr('id') !== undefined) {
				media_id = media.attr('id');
			} else {
				media_id = id + '-media';
				media.attr('id', media_id);
			}

			//Extract the captions file
			if (media.children('track[kind="captions"]')) {
				captions = media.children('track[kind="captions"]').attr("src");
			}

			if (media.get(0).error === null && media.get(0).currentSrc !== '' && media.get(0).currentSrc !== undefined) {
				canPlay = true;
			} else {
				//No nativly supported format provided, trying Flash fallback
				//TODO:Add Flash detection
				fbVars = 'id=' + elm.attr('id');
				if (media_type === 'video') {
					poster = '<img src="' + media.attr("poster") + '" width="' + width + '" height="' + height + '" alt="' + media.attr("title") + '"/>';
					if (flash && media.find('source').filter('[type="' + fbVideoType + '"]').length > 0) {
						fbVars +=  '&height=' + media.height() + '&width=' + media.width() + '&posterimg=' + encodeURI(_pe.url(media.attr('poster')).source) + '&media=' + encodeURI(_pe.url(media.find('source').filter('[type="' + fbVideoType + '"]').attr('src')).source);
						canPlay = true;
					}
				} else if (flash && media_type === 'audio' && media.find('source').filter('[type="' + fbAudioType + '"]').length > 0) {
					fbVars += '&media=' + _pe.url(media.find('source').filter('[type="' + fbAudioType + '"]').attr('src')).source;
					canPlay = true;
				} else {
					canPlay = false;
				}
				//Can play using a fallback
				if (canPlay) {
					$fbObject = $('<object play="" pause="" id="' + media_id + '" width="' + width + '" height="' + height + '" class="' + media_type + '" type="application/x-shockwave-flash" data="' + fbBin + '" tabindex="-1"><param name="movie" value="' + fbBin + '"/><param name="flashvars" value="' + fbVars + '"/><param name="allowScriptAccess" value="always"/><param name="bgcolor" value="#000000"/><param name="wmode" value="opaque"/>' + (typeof poster === 'string' ? poster : ''));
					media.before($fbObject);
					media.remove();
					media = $fbObject;
				} else {
					if (poster !== undefined) {
						media.before($(poster));
						media.remove();
					}
				}
			}

			if (canPlay) {
				evtmgr = media.is('object') ? media.children(':first-child') : media;

				//Add the interface
				$.extend(elm.get(0), {object: media.get(0), evtmgr: evtmgr}, _pe.fn.multimedia._intf);
				if (media_type === 'video') {
					media.before($('<button class="wb-mm-overlay"/>').append(_pe.fn.multimedia.get_image('overlay', _pe.dic.get('%play'), 100, 100)).attr('title', _pe.dic.get('%play')));
				}
				media.after(_pe.fn.multimedia._get_ui(media_id, media_type === 'video' ? true : false));
				if ($('html').hasClass('polyfill-progress')) {
					elm.find('progress').progress();
				}

				//Scale the UI when the video scales
				$(window).on('resize', {'media' : media, ratio : height / width}, function (e) {
					var h = e.data.media.parent().width() * e.data.ratio;
					e.data.media.height(h);
					media.parent().find('.wb-mm-overlay').height(h);
				});
				$(window).trigger('resize');

				//Map UI mouse events
				elm.on('click', function (e) {
					var $target = $(e.target),
						p,
						s;

					if ($target.hasClass('playpause') || e.target === this.object || $target.hasClass('wb-mm-overlay')) {
						if (this.getPaused() === true) {
							this.play();
						} else {
							this.pause();
						}
					}

					if ($target.hasClass('cc')) {
						this.setCaptionsVisible(!this.getCaptionsVisible());
					}

					if ($target.hasClass('mute')) {
						this.setMuted(!this.getMuted());
					}

					if ($target.is('progress') || $target.hasClass('wb-progress-inner') || $target.hasClass('wb-progress-outer')) {
						p = (e.pageX - $target.offset().left) / $target.width();
						this.setCurrentTime(this.getDuration() * p);
					}

					if ($target.hasClass('rewind') || $target.hasClass('fastforward')) {
						s = this.getDuration() * 0.05;
						if ($target.hasClass('rewind')) {
							s *= -1;
						}
						this.setCurrentTime(this.getCurrentTime() + s);
					}
				});

				//Map UI keyboard events
				elm.on('keydown', function (e) {
					var $w = $(this),
						v = 0;

					if ((e.which === 32 || e.which === 13) && e.target === this.object) {
						$w.find('.wb-mm-controls .playpause').click();
						return false;
					}
					if (e.keyCode === 37) {
						$w.find('.wb-mm-controls .rewind').click();
						return false;
					}
					if (e.keyCode === 39) {
						$w.find('.wb-mm-controls .fastforward').click();
						return false;
					}
					if (e.keyCode === 38) {
						v = Math.round(this.getVolume() * 10) / 10 + 0.1;
						v = v < 1 ? v : 1;
						this.setVolume(v);
						return false;
					}
					if (e.keyCode === 40) {
						v = Math.round(this.getVolume() * 10) / 10 - 0.1;
						v = v > 0 ? v : 0;
						this.setVolume(v);
						return false;
					}

					return true;
				});

				//Map media events (For flash, must use other element than object because it doesn't trigger or receive events)
				evtmgr.on('timeupdate seeked canplay play volumechange pause ended waiting captionsloaded captionsloadfailed captionsvisiblechange progress', $.proxy(function (e) {
					var $w = $(this),
						b,
						p,
						o,
						timeline;
					switch (e.type) {
					case 'play':
						b = $w.find('.playpause');
						b.empty().append(_pe.fn.multimedia.get_image('pause', _pe.dic.get('%pause')));
						b.attr('title', _pe.dic.get('%pause'));
						$w.find('.wb-mm-overlay').hide();
						break;
					case 'pause':
					case 'ended':
						b = $w.find('.playpause');
						b.empty().append(_pe.fn.multimedia.get_image('play', _pe.dic.get('%play')));
						b.attr('title', _pe.dic.get('%play'));
						o = $w.find('.wb-mm-overlay');
						o.empty().append(_pe.fn.multimedia.get_image('overlay', _pe.dic.get('%play'), 100, 100)).attr('title', _pe.dic.get('%play'));
						o.show();
						
						// Prevent loading from appearing
						clearTimeout(this.loading);
						this.loading = false;
						break;
					case 'volumechange':
						b = $w.find('.mute').empty();
						if (this.getMuted()) {
							b.append(_pe.fn.multimedia.get_image('mute_on', _pe.dic.get('%mute', 'disable')));
							b.attr('title', _pe.dic.get('%mute', 'disable'));
						} else {
							b.append(_pe.fn.multimedia.get_image('mute_off', _pe.dic.get('%mute', 'enable')));
							b.attr('title', _pe.dic.get('%mute', 'enable'));
						}
						break;
					case 'captionsvisiblechange':
						b = $w.find('.cc').empty();
						if (this.getCaptionsVisible()) {
							b.append(_pe.fn.multimedia.get_image('cc', _pe.dic.get('%closed-caption', 'disable')));
							b.attr('title', _pe.dic.get('%closed-caption', 'disable'));
						} else {
							b.append(_pe.fn.multimedia.get_image('cc', _pe.dic.get('%closed-caption', 'enable')));
							b.attr('title', _pe.dic.get('%closed-caption', 'enable'));
						}
						break;
					case 'timeupdate':
						p = Math.round(this.getCurrentTime() / this.getDuration() * 1000) / 10;
						timeline = $w.find('.wb-mm-timeline progress');
						timeline.attr('value', p);

						$w.find('.wb-mm-timeline-current span:not(.wb-invisible)').text(_pe.fn.multimedia._format_time(this.getCurrentTime()));
						$w.find('.wb-mm-timeline-total span:not(.wb-invisible)').text(_pe.fn.multimedia._format_time(this.getDuration()));

						//Update captions
						if ($.data(e.target, 'captions') !== undefined) {
							_pe.fn.multimedia._update_captions($w.find('.wb-mm-captionsarea'), this.getCurrentTime(), $.data(e.target, 'captions'));
						}
						break;
					case 'captionsloaded':
						//Store the captions
						$.data(e.target, 'captions', e.captions);
						break;
					case 'captionsloadfailed':
						$w.find('.wb-mm-captionsarea').append('<p>' + _pe.dic.get('%captionserror') + '</p>');
						break;
					// Determine when the loading icon should be shown. 
					case 'waiting':
						//Prevents the loading icon to show up when waiting for less than half a second
						if(this.getPaused() === false && !this.loading){
							this.loading = setTimeout(function () {
								o = $w.find('.wb-mm-overlay');
								o.empty().append(_pe.fn.multimedia._get_loading_ind(this, 'loading', _pe.dic.get('%loading'), 100, 100));
								o.show();
							}, 500);
						}
						break;
					case 'canplay':
						clearTimeout(this.loading);
						this.loading = false;
						if (this.getPaused() === false) {
							o = $w.find('.wb-mm-overlay');
							o.empty().append(_pe.fn.multimedia.get_image('overlay', _pe.dic.get('%play'), 100, 100)).attr('title', _pe.dic.get('%play'));
							o.hide();
						}
						break;		
					// Fallback for browsers that don't implement the waiting/canplay events
					case 'progress':
						// Waiting detected, display the loading icon
						if (this.getWaiting() === true) {
							if (this.getBuffering() === false) {
								this.setBuffering(true);
								evtmgr.trigger('waiting');								
							}								
						// Waiting has ended, but icon is still visible - remove it.
						} else if (this.getBuffering() === true) {							
							this.setBuffering(false);
							evtmgr.trigger('canplay');
						}
						this.setPreviousTime(this.getCurrentTime());
						break;
					}
				}, elm.get(0)));

				if (captions !== undefined) {
					media.after($('<div class="wb-mm-captionsarea"/>').hide());
					_pe.fn.multimedia._load_captions(evtmgr, captions);
				}
			}

			return elm;
		}, // end of exec

		_get_loading_ind : function (media, id, title, w, h) {
			var img = _pe.fn.multimedia.get_image(id, title, w, h).attr('title', title),
				angle = 0,
				spinner,
				t;

			if (img.is('svg')) {
				spinner = img.find('#spinner');
				t = spinner.attr('transform');
				clearInterval(media.spin);
				media.spin = setInterval(function () {
					spinner.attr('transform', t + ',rotate(' + (angle += 20) + ' 0 0)');
				}, 50);
			}
			return img;
		},

		_get_ui : function (id, cc) {
			var ui = $('<div class="wb-mm-controls">'),
				ui_start = $('<div class="wb-mm-controls-start">'),
				ui_timeline = $('<div class="wb-mm-timeline" tabindex="0"><p class="wb-mm-timeline-current"><span class="wb-invisible">' + _pe.dic.get('%position') + '</span><span>00:00:00</span></p><p class="wb-mm-timeline-total"><span class="wb-invisible">' + _pe.dic.get('%duration') + '</span><span>--:--:--</span></p><p class="wb-mm-timeline-inner"><span class="wb-invisible">' + _pe.dic.get('%percentage') + '</span><progress value="0" max="100" aria-live="off" /></p>'),
				ui_end = $('<div class="wb-mm-controls-end">');

			ui_start.append(
				$('<button>').attr({
					type: 'button',
					'class': 'rewind',
					'aria-controls': id,
					'title': _pe.dic.get('%rewind')
				}).append(_pe.fn.multimedia.get_image('rewind', _pe.dic.get('%rewind')))
			);

			ui_start.append(
				$('<button>').attr({
					type: 'button',
					'class': 'playpause',
					'aria-controls': id,
					'title': _pe.dic.get('%play')
				}).append(_pe.fn.multimedia.get_image('play', _pe.dic.get('%play')))
			);

			ui_start.append(
				$('<button>').attr({
					type: 'button',
					'class': 'fastforward',
					'aria-controls': id,
					'title': _pe.dic.get('%fast-forward')
				}).append(_pe.fn.multimedia.get_image('ff', _pe.dic.get('%fast-forward')))
			);

			if (cc === true) {
				ui_end.append(
					$('<button>').attr({
						type: 'button',
						'class': 'cc',
						'aria-controls': id,
						'title': _pe.dic.get('%closed-caption', 'enable')
					}).append(_pe.fn.multimedia.get_image('cc', _pe.dic.get('%closed-caption', 'enable')))
				);
			} else {
				ui.addClass('wb-mm-no-cc');
			}

			ui_end.append(
				$('<button>').attr({
					type: 'button',
					'class': 'mute',
					'aria-controls': id,
					'title': _pe.dic.get('%mute', 'enable')
				}).append(_pe.fn.multimedia.get_image('mute_off', _pe.dic.get('%mute', 'enable')))
			);

			ui.append(ui_start).append(ui_timeline).append(ui_end);

			return ui;
		},

		//Standardized multimedia interface
		_intf : {
			// Methods
			play: function () {
				try {
					this.object.play();
				} catch (e) {
					this.object.doPlay();
				}
			},
			pause: function () {
				try {
					this.object.pause();
				} catch (e) {
					this.object.doPause();
				}
			},

			// Properties
			getPaused: function () {
				return (typeof this.object.paused !== 'function' ? this.object.paused : this.object.paused());
			},

			getPlayed: function () {
				return (typeof this.object.played !== 'function' ? this.object.played : this.object.played());
			},

			getEnded: function () {
				return (typeof this.object.ended !== 'function' ? this.object.ended : this.object.ended());
			},

			getSeeking: function () {
				return (typeof this.object.seeking !== 'function' ? this.object.seeking : this.object.seeking());
			},

			getDuration: function () {
				return (typeof this.object.duration !== 'function' ? this.object.duration : this.object.duration());
			},

			getBuffered: function () {
				return (typeof this.object.buffered !== 'function' ? (this.object.buffered.length > 0 ? this.object.buffered.end(0) : 0) : this.object.buffered());
			},

			getCurrentTime: function () {
				return (typeof this.object.currentTime !== 'function' ? this.object.currentTime : this.object.currentTime());
			},

			setCurrentTime: function (t) {
				if (typeof this.object.currentTime !== 'function') {this.object.currentTime = t; } else {this.object.setCurrentTime(t); }
			},

			getPreviousTime: function () {
				return (typeof this.object.previousTime !== 'undefined' ? this.object.previousTime : 0);
			},

			setPreviousTime: function (t) {
				this.object.previousTime = t;
			},			
			
			getCaptionsVisible: function () {
				return $(this).find('.wb-mm-captionsarea').is(':visible');
			},

			setCaptionsVisible : function (v) {
				if (v) {
					$(this).find('.wb-mm-captionsarea').show();
				} else {
					$(this).find('.wb-mm-captionsarea').hide();
				}
				$(this.evtmgr).trigger('captionsvisiblechange');
			},

			getMuted : function () {
				return (typeof this.object.muted !== 'function' ? this.object.muted : this.object.muted());
			},

			setMuted : function (m) {
				if (typeof this.object.muted !== 'function') {this.object.muted = m; } else {this.object.setMuted(m); }
			},

			getVolume : function () {
				return (typeof this.object.volume !== 'function' ? this.object.volume : this.object.volume());
			},

			setVolume : function (v) {
				if (typeof this.object.volume !== 'function') {this.object.volume = v; } else {this.object.setVolume(v); }
			},
			
			getWaiting : function () {
				return this.getPaused() === false && this.getCurrentTime() === this.getPreviousTime();
			},
			
			getBuffering : function () {
				return (typeof this.object.buffering !== 'undefined' ? this.object.buffering : false);
			},

			setBuffering : function (b) {
				this.object.buffering = b;
			}			
		},

		_format_time : function (current) {
			var t = "",
				i,
				c,
				p;
			current = Math.floor(current);

			for (i = 2; i >= 0; i -= 1) {
				p = Math.pow(60, i);
				c = Math.floor(current / p);
				if (t !== "") {t += ":"; }
				t += _pe.string.pad(c, 2);
				current -= p * c;
			}

			return t;
		},

		_load_captions : function (evtmgr, src) {
			var parse_time,
				parse_html,
				parse_xml,
				load_captions_internal,
				load_captions_external,
				curUrl,
				srcUrl,
				c;

			
			
			parse_time = function (string) {
				var parts,
					s = 0,
					p,
					_plen,
					v;

				if (string !== undefined) {
					if (string.substring(string.length - 1) === 's') {
						//offset-time
						return parseFloat(string.substring(0, string.length - 1));
					} else {
						//clock time
						parts = string.split(':').reverse();
						for (p = 0, _plen = parts.length; p < _plen; p += 1) {
							v = (p === 0) ? parseFloat(parts[p]) : parseInt(parts[p], 10);
							s += v * Math.pow(60, p);
						}
						return s;
					}
				}
				return -1;
			};

			parse_html = function (content) {
				var s = '.wet-boew-tt',
					te = content.find(s),
					captions = [];

				te.each(function () {
					var e = $(this),
						begin = -1,
						end = -1,
						json;

					if (e.attr('data-begin') !== undefined) {
						//HTML5 captions (seperate attributes)
						begin = parse_time(e.attr('data-begin'));
						end = e.attr('data-end') !== undefined ? parse_time(e.attr('data-end')) : parse_time(e.attr('data-dur')) + begin;
					} else if (e.attr('data') !== undefined) {
						json = e.attr('data');

						//Sanitze the JSON
						json = json.replace(/(begin|dur|end)/gi, '"$1"').replace(/'/g, '"');
						json = $.parseJSON(json);

						begin = parse_time(json.begin);
						end = json.end !== undefined ? parse_time(json.end) : parse_time(json.dur) + begin;
					}
					//Removes nested captions if any
					e = e.clone();
					e.find(s).detach();

					captions[captions.length] = {
						text : e.html(),
						begin : begin,
						end : end
					};


				});
				return captions;
			};

			parse_xml = function (content) {
				var s = '[begin]',
					te = content.find(s),
					captions = [];

				te.each(function () {
					var e = $(this),
						begin = -1,
						end = -1;

					begin = parse_time(e.attr('begin'));
					end = e.attr('end') !== undefined ? parse_time(e.attr('end')) : parse_time(e.attr('dur')) + begin;

					//Removes nested captions if any
					e = e.clone();
					e.find(s).detach();

					captions[captions.length] = {
						text : e.html(),
						begin : begin,
						end : end
					};
				});
				return captions;
			};
			

			load_captions_internal = function (obj) {
				var eventObj = {
					type : 'captionsloaded',
					captions : parse_html(obj)
				};
				evtmgr.trigger(eventObj);
			};

			load_captions_external = function (url) {
				$.ajax({
					url : url,
					context : evtmgr,
					dataType : 'html',
					success : function (data) {
						var eventObj = {type: 'captionsloaded'};
						if (data.indexOf('<html') > -1) {
							eventObj.captions = parse_html($(data));
						} else {
							eventObj.captions = parse_xml($(data));
						}
						$(this).trigger(eventObj);
					},
					error : function (response, textStatus, errorThrown) {
						$(this).trigger({type: 'captionsloadfailed', error: errorThrown});
					}
				});
			};

			if (src !== undefined) {
				curUrl = _pe.url(window.location.href);
				srcUrl = _pe.url(src);

				if (srcUrl.removehash() === curUrl.source) {
					//Same page HTML captions
					c = $('#' + srcUrl.hash);
					if (c.length > 0) {
						load_captions_internal(c);
						return;
					}

					evtmgr.trigger({
						type: 'captionsloadfailed',
						error: new Error('Object with id "' + srcUrl.anchor + '" not found')
					});
					return;
				} else {
					//External HTML or XML captions
					load_captions_external(srcUrl.source);
					return;
				}
			}
			evtmgr.trigger({
				type: 'captionsloadfailed',
				error: new Error('Caption source is missing')
			});
		},

		_update_captions : function (area, seconds, captions) {
			var c, _clen, caption;
			area.empty();
			for (c = 0, _clen = captions.length; c < _clen; c += 1) {
				caption = captions[c];
				if (seconds >= caption.begin && seconds <= caption.end) {
					area.append($('<div>' + caption.text + '</div>'));
				}
			}
		}
	};

	//Method to allow the flash player to trigger the media events
	_pe.triggermediaevent = function (id, event) {
		$('#' + id).find('param:eq(0)').trigger(event);
	};

	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; 
	_pe.fn.prettify = {
		type: 'plugin',
		depends : ['prettify'],
		executed : false,
		_exec: function (elm) {
			// Make sure only executes once
			if (!pe.fn.prettify.executed) {
				var opts,
					overrides,
					pre = $('body').find('pre'),
					classes = elm.attr('class').split(' '),
					i,
					_ilen,
					currClass,
					lib = pe.add.liblocation;

				// Load language extensions as needed (called by adding lang-* in class, e.g., lang-css)
				for (i = 0, _ilen = classes.length; i < _ilen; i += 1) {
					currClass = classes[i];
					if (currClass.length < 12 && currClass.indexOf('lang-') === 0) {
						pe.add._load([lib + 'dependencies/prettify/' + currClass + pe.suffix + '.js']);
					}
				}

				// Defaults
				opts = {
					linenums : false,
					allpre : false
				};

				// Class-based overrides - use undefined where no override of defaults or settings.js should occur
				overrides = {
					linenums : elm.hasClass("linenums") ? true : undefined,
					allpre : elm.hasClass("all-pre") ? true : undefined
				};

				// Extend the defaults with settings passed through settings.js (wet_boew_prettify) and class-based overrides
				if (typeof wet_boew_prettify !== 'undefined' && wet_boew_prettify !== null) {
					$.extend(opts, wet_boew_prettify, overrides);
				} else {
					$.extend(opts, overrides);
				}

				if (opts.allpre) {
					pre.addClass('prettyprint');
				}
				if (opts.linenums) {
					pre.filter('.prettyprint').addClass('linenums');
				}

				prettyPrint();
				pe.fn.prettify.executed = true;
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.sessiontimeout = {
		type : 'plugin',
		depends : ['metadata'],
		_exec : function (elm) {
			var opts,
				// An overlay over the screen when showing the dialog message
				// Added &nbsp; to fix Chrome bug (received from Charlie Lavers - PWGSC)
				overLay = '<div class="sOverlay jqmOverlay">&#160;</div>',
				liveTimeout,
				sessionTimeout,
				keep_session,
				start_liveTimeout,
				displayTimeoutMessage,
				logout,
				getCurrentTimeMs,
				redirect,
				stay_logged_in,
				timeParse,
				getExpireTime;

			// Defaults
			opts = {
				inactivity: 1200000,		// default inactivity period 20 minutes
				reactionTime: 30000,		// default confirmation period of 30 seconds
				sessionalive: 1200000,		// default session alive period 20 minutes
				logouturl: './',			// can't really set a default logout URL
				refreshOnClick: true,		// refresh session if user clicks on the page
				// Ajax call back url function to server to keep the session alive, this has to return true or false from server on success
				refreshCallbackUrl: './',	// Can't really set a default callbackurl
				regex:	/^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
				powers:	{'ms': 1, 'cs': 10, 'ds': 100, 's': 1000, 'das': 10000, 'hs': 100000, 'ks': 1000000}
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_sessiontimeout), class-based overrides and the data attribute
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_sessiontimeout !== 'undefined' && wet_boew_sessiontimeout !== null) {
				$.extend(opts, wet_boew_sessiontimeout, elm.metadata());
			} else {
				$.extend(opts, elm.metadata());
			}
		
			//------------------------------------------------------ Main functions

			keep_session = function () {
				clearTimeout(sessionTimeout);
				// If the refreshCallbackUrl not present then dont show any error
				if (opts.refreshCallbackUrl.length > 2) {
					$.post(opts.refreshCallbackUrl,	function (responseData) {
						// if the response data returns "false", we should display that the session has timed out.
						if (responseData && responseData.replace(/\s/g, "") !== "false") {
							sessionTimeout = setTimeout(keep_session, timeParse(opts.sessionalive));
						} else {
							alert(pe.dic.get('%st-already-timeout-msg'));
							redirect();
						}	
					});
				}
			};

			start_liveTimeout = function () {
				clearTimeout(liveTimeout);
				liveTimeout = setTimeout(logout, timeParse(opts.inactivity));
				if (opts.sessionalive) {
					keep_session();
				}
			};

			// code to display the alert message
			displayTimeoutMessage = function () {
				var expireTime = getExpireTime(),
					$where_was_i = document.activeElement, // Grab where the focus in the page was BEFORE the modal dialog appears
					result;

				$(document.body).append(overLay);
				result = confirm(pe.dic.get('%st-timeout-msg').replace("#expireTime#", expireTime));
				$where_was_i.focus();
				$('.jqmOverlay').detach();
				return result;
			};

			logout = function () {
				var start = getCurrentTimeMs();

				// because of short circuit evaluation, this statement 
				// will show the dialog before evaluating the time, thus the 
				// getCurrentTimeMs() will return the time after the alert
				// box is shown.
				if (displayTimeoutMessage() && getCurrentTimeMs() - start <= opts.reactionTime) {
					stay_logged_in();
				} else {
					redirect();
				}
			};

			//--------------------------------------------------- Utility functions
	
			getCurrentTimeMs = function () {
				return (new Date()).getTime();
			};

			redirect = function () {
				window.location.href = opts.logouturl;
			};

			stay_logged_in = start_liveTimeout;
		
			// Parsing function for time period
			timeParse = function (value) {
				var result, num, mult;
				if (typeof value === 'undefined' || value === null) {
					return null;
				}

				result = opts.regex.exec($.trim(value.toString()));
				if (result[2]) {
					num = parseFloat(result[1]);
					mult = opts.powers[result[2]] || 1;
					return num * mult;
				} else {
					return value;
				}
			};

			getExpireTime = function () {
				var expire = new Date(getCurrentTimeMs() + opts.reactionTime),
					hours = expire.getHours(), 
					minutes = expire.getMinutes(), 
					seconds = expire.getSeconds(),
					timeformat = hours < 12 ? " AM" : " PM";
					
				hours = hours % 12;
				if (hours === 0) {
					hours = 12;
				}

				// Add a zero if needed in the time
				hours = hours < 10 ? '0' + hours : hours;
				minutes = minutes < 10 ? '0' + minutes : minutes;
				seconds = seconds < 10 ? '0' + seconds : seconds;

				return hours + ":" + minutes + ":" + seconds + timeformat;
			};
		
			start_liveTimeout();
			if (opts.refreshOnClick) {
				$(document).on('click', start_liveTimeout);
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.share = {
		type : 'plugin',
		depends : ['metadata', 'bookmark', 'outside'],
		_exec : function (elm) {
			var opts, overrides, $popup, $popupText, $popupLinks, popupLink, popupLinksLen, popupLinkSpan, target, leftoffset, keychar, elmtext, matches, match;

			// Defaults
			opts = {
				url: '', // The URL to bookmark, leave blank for the current page
				sourceTag: '', // Extra tag to add to URL to indicate source when it returns
				title: '', // The title to bookmark, leave blank for the current one
				description: '', // A longer description of the site
				sites: [], // List of site IDs or language selectors (lang:xx) or
					// category selectors (category:xx) to use, empty for all
				compact: false, // True if a compact presentation should be used, false for full
				hint: pe.dic.get('%share-text') + pe.dic.get('%share-hint') + pe.dic.get('%new-window'), // Popup hint for links, {s} is replaced by display name
				popup: true, // True to have it popup on demand, false to show always
				popupTag: 'h2', // Parent tag for the popup link (should be either h2 or h3)
				popupText: pe.dic.get('%share-text'), // Text for the popup trigger
				includeDisclaimer: true, // True to include the popup disclaimer (at the bottom)
				popupDisclaimer: pe.dic.get('%share-disclaimer'), // Text for the popup disclaimer
				hideText: (pe.dic.get('%hide') + " - "), // Text to prepend to the popup trigger when popup is open
				addFavorite: false,  // True to add a 'add to favourites' link, false for none
				favoriteText: pe.dic.get('%favourite'),  // Display name for the favourites link
				addEmail: false, // True to add a 'e-mail a friend' link, false for none
				emailText: pe.dic.get('%email'), // Display name for the e-mail link
				emailSubject: pe.dic.get('%share-email-subject'), // The subject for the e-mail
				emailBody: pe.dic.get('%share-email-body'), // The body of the e-mail,
					// use '{t}' for the position of the page title, '{u}' for the page URL,
					// '{d}' for the description, and '\n' for new lines
				manualBookmark: pe.dic.get('%share-manual'), // Instructions for manually bookmarking the page
				addShowAll: false, // True to show listed sites first, then all on demand
				showAllText: pe.dic.get('%share-showall'), // Display name for show all link, use '{n}' for the number of sites
				showAllTitle: pe.dic.get('%share-showall-title'), // Title for show all popup
				addAnalytics: false, // True to include Google Analytics for links
				analyticsName: '/share/{r}/{s}' // The "URL" that is passed to the Google Analytics,
					// use '{s}' for the site code, '{n}' for the site name,
					// '{u}' for the current full URL, '{r}' for the current relative URL,
					// or '{t}' for the current title
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				compact: elm.hasClass('compact') ? true : undefined,
				popup: elm.hasClass('popup-none') ? false : undefined,
				addFavorite: elm.hasClass('favourite') ? true : undefined,
				addEmail: elm.hasClass('email') ? true : undefined,
				addShowAll: elm.hasClass('showall') ? true : undefined,
				addAnalytics: elm.hasClass('analytics') ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_share), class-based overrides and the data attribute
			$.metadata.setType('attr', 'data-wet-boew');
			if (typeof wet_boew_share !== 'undefined' && wet_boew_share !== null) {
				$.extend(opts, wet_boew_share, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			elm.bookmark(opts);
			if (opts.popup && pe.cssenabled) {
				elm.attr('role', 'application');
				if (opts.popupTag.substring(0, 1) === 'h') { // If a heading element is used for the popup tag, then wrap the contents in a section element
					elm.wrapInner('<section />');
				}
				$popup = elm.find('.bookmark_popup').detach();
				$popup.attr({'id': 'bookmark_popup', 'aria-hidden': 'true', 'role': 'menu'}).prepend('<p class="popup_title">' + opts.popupText + '</p>');
				$popupLinks = $popup.find('ul').attr('role', 'presentation').find('a').get();
				popupLinksLen = $popupLinks.length;
				while (popupLinksLen--) {
					popupLink = $popupLinks[popupLinksLen];
					popupLink.setAttribute('role', 'menuitem');
					popupLink.setAttribute('rel', 'external');
					popupLink.parentNode.setAttribute('role', 'presentation');
					// TODO: Should work with author to fix in bookmark.js rather than maintain this workaround (fix needed otherwise some screen readers read the link twice)
					popupLinkSpan = popupLink.getElementsByTagName('span');
					if (popupLinkSpan.length > 0) {
						popupLinkSpan = popupLinkSpan[0];
						popupLink.title = popupLinkSpan.title;
						popupLinkSpan.removeAttribute('title');
					}
				}
				if (opts.addEmail) { // Removes target attribute and opens in new window warning from email link
					match = $popup.find('a[href*="mailto:"]').removeAttr('target').removeAttr('rel');
					match.attr('title', match.attr('title').replace(pe.dic.get('%new-window'), ''));
				}
				if (opts.addFavorite) { // Removes target attribute and makes title more relevant for favorite link
					match = $popup.find('a[href*="#"]').removeAttr('target').removeAttr('rel').attr('title', opts.favoriteText + pe.dic.get('%share-fav-title'));
				}
				if (opts.includeDisclaimer) { // Append the disclaimer
					$popup.append('<p class="popup_disclaimer">' + opts.popupDisclaimer + '</p>');
				}
				elm.append($popup);

				$popup.on('click vclick touchstart', function (e) {
					if (e.stopPropagation) {
						e.stopImmediatePropagation();
					} else {
						e.cancelBubble = true;
					}
				}).on('click vclick touchstart', 'a', function () { // Workaround for some touchscreen devices that don't 
					window.open(this.href, '_blank');
					$popup.trigger('close');
					return false;
				});

				$popupText = elm.find('.bookmark_popup_text').off('click vclick touchstart keydown').wrap('<' + opts.popupTag + ' />');
				$popupText.attr({'role': 'button', 'aria-controls': 'bookmark_popup'}).on('click vclick touchstart keydown', function (e) {
					if (e.type === "keydown") {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							if (e.keyCode === 13 || e.keyCode === 32) { // enter or space
								e.preventDefault();
								if ($popup.attr('aria-hidden') === 'true') {
									$popup.trigger('open');
								} else {
									$popup.trigger('close');
								}
							} else if (e.keyCode === 38 || e.keyCode === 40) { // up or down arrow
								e.preventDefault();
								$popup.trigger('open');
							}
						}
					} else {
						if ($popup.attr('aria-hidden') === 'true') {
							$popup.trigger('open');
						} else {
							$popup.trigger('close');
						}
						return false;
					}
				});
				$popup.on('keydown focusoutside open close closenofocus', function (e) {
					if (e.type === 'keydown') {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							switch (e.keyCode) {
							case 27: // escape key (close the popup)
								$popup.trigger("close");
								return false;
							case 37: // left arrow (go on link left, or to the right-most link in the previous row, or to the right-most link in the last row)
								target = $(e.target).closest('li').prev().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								pe.focus(target.last());
								return false;
							case 38: // up arrow (go one link up, or to the bottom-most link in the previous column, or to the bottom-most link of the last column)
								leftoffset = $(e.target).offset().left;
								target = $(e.target).closest('li').prevAll().find('a').filter(function () {
									return ($(this).offset().left === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return ($(this).offset().left < leftoffset);
									});
									if (target.length > 0) {
										pe.focus(target.last());
									} else {
										leftoffset = $popupLinks.last().offset().left;
										target = $popupLinks.filter(function () {
											return ($(this).offset().left > leftoffset);
										});
										if (target.length > 0) {
											pe.focus(target.last());
										} else {
											pe.focus($popupLinks.last());
										}
									}
								}
								return false;
							case 39: // right arrow (go one link right, or to the left-most link in the next row, or to the left-most link in the first row)
								target = $(e.target).closest('li').next().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								pe.focus(target.first());
								return false;
							case 40: // down arrow (go one link down, or to the top-most link in the next column, or to the top-most link of the first column)
								leftoffset = $(e.target).offset().left;
								target = $(e.target).closest('li').nextAll().find('a').filter(function () {
									return ($(this).offset().left === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return ($(this).offset().left > leftoffset);
									});
									if (target.length > 0) {
										pe.focus(target.first());
									} else {
										pe.focus($popupLinks.first());
									}
								}
								return false;
							default:
								// 0 - 9 and a - z keys (go to the next link that starts with that key)
								if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
									keychar = String.fromCharCode(e.keyCode).toLowerCase();
									elmtext = $(e.target).text();
									matches = $popupLinks.filter(function () {
										return ($(this).text().substring(1, 2).toLowerCase() === keychar || $(this).text() === elmtext);
									});
									if (matches.length > 0) {
										if ($(e.target).hasClass('bookmark_popup_text')) {
											pe.focus(matches.eq(0));
										} else {
											matches.each(function (index) {
												if ($(this).text() === elmtext) {
													match = index;
													return false;
												}
											});
											if (match < (matches.length - 1)) {
												pe.focus(matches.eq(match + 1));
												return false;
											}
											pe.focus(matches.eq(0));
										}
									}
									return false;
								}
							}
						}
					} else if (e.type === 'focusoutside' && !$(e.target).is($popupText)) { // Close the popup menu if focus goes outside
						if ($popup.attr('aria-hidden') === 'false') {
							$popup.trigger('closenofocus');
						}
					} else if (e.type === 'open') { // Open the popup menu an put the focus on the first link
						$popupText.text(opts.hideText + opts.popupText);
						$popup.attr('aria-hidden', 'false').show();
						pe.focus($popup.show().find('li a').first());
					} else if (e.type === 'close' || e.type === 'closenofocus') { // Close the popup menu
						$popupText.text(opts.popupText);
						$popup.attr('aria-hidden', 'true').hide();
						if (e.type === 'close') {
							pe.focus($popupText.first());
						}
					}
				});

				$(document).on('click vclick touchstart', function () {
					if ($popup.attr('aria-hidden') === 'false') {
						$popup.trigger('close');
					}
				});
			} else {
				elm.addClass('popup-none');
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.slideout = {
		type: 'plugin',
		depends: ['resize', 'metadata'],
		opened: false,
		_exec: function (elm) {
			var borderWidth = 10,
				tocText = pe.dic.get('%table-contents'),
				hideText = pe.dic.get('%hide'),
				closeLink = hideText + '<span class="wb-invisible">' + tocText + '</span>',
				focusOutlineAllowance = 2,
				opened = false,
				reposition,
				rmCurrLink = true,
				scroll = true,
				toggle,
				toggleLink,
				slideoutClose,
				ttlHeight = 0,
				wrapper,
				container,
				innerWrapper,
				keyhandler,
				tocLinks,
				documentToggle,
				opts,
				ie7 = pe.ie > 0 && pe.ie < 8,
				$wbcorein = $('#wb-core-in'),
				imagesDir = pe.add.liblocation + 'images/slideout/';

			$.metadata.setType('attr', 'data-wet-boew');
			opts = {
				imgShow: {
					src: imagesDir + pe.dic.get('%show-image'),
					height: 147,
					width: 30,
					alt: pe.dic.get('%show-toc') + tocText
				},
				imgHide: {
					src: imagesDir + pe.dic.get('%hide-image'),
					height: 147,
					width: 30,
					alt: hideText + tocText
				}
			};
			$.extend(opts, elm.metadata());

			// Don't do anything if CSS is disabled
			if (!pe.cssenabled()) {
				return;
			}

			// Add the wrappers
			innerWrapper = elm.wrap('<div><div id="slideoutWrapper" role="application"><div id="slideoutInnerWrapper"></div></div></div>').parent(); // This is used for overflow: hidden and animate.
			wrapper = innerWrapper.parent();
			container = wrapper.parent();

			// Detach the tab content to reduce execution time
			wrapper.detach();

			// Add WAI-ARIA
			elm.attr({'role': 'menu', 'id': 'slideout-body'}).find('ul, li').attr('role', 'presentation');

			// Remove the link off the page we're on if we're asked to
			if (rmCurrLink) {
				elm.find('a[href="' + window.location.href + '"]').replaceWith('<span class="so-active">' + $(this).text() + '</span>');
			}

			// Find all the TOC links
			tocLinks = elm.find('a').attr('role', 'menuitem');

			// Recalculate the slideout's position
			reposition = function () {
				if (!opened) { // Only when slideout is closed
					var newPosition = $wbcorein.offset().left;

					if (newPosition <= borderWidth) {
						newPosition = 0;
					}

					// Vertical
					wrapper.css('top', $wbcorein.offset().top);
					// Horizontal
					wrapper.css('right', newPosition);
				}
			};

			toggle = function (e) {
				toggleLink.off('click vclick touchstart', toggle);
				tocLinks.off('click vclick touchstart', toggle);
				slideoutClose.off('click vclick touchstart', toggle);
				wrapper.off('keydown', keyhandler);
				elm.off('keydown', keyhandler);
				$(document).off('click vclick touchstart', documentToggle);

				if (!opened) {
					var position = wrapper.position();
					if (pe.ie <= 0 || document.documentMode !== undefined) {
						wrapper.removeClass('slideoutWrapper')
							.addClass('slideoutWrapperRel')
							.css({'top': position.top - $wbcorein.offset().top, 'right': borderWidth - 10});
					}
					// Give the tab time to move out of view to prevent overlap
					setTimeout(function () {
						elm.show();
					}, 50);
					pe.focus(tocLinks.eq(0));
				}

				opened = !opened;
				wrapper.animate({
					width: parseInt(wrapper.css('width'), 10) === (opts.imgShow.width + focusOutlineAllowance) ? elm.outerWidth() + (opts.imgShow.width + focusOutlineAllowance) : (opts.imgShow.width + focusOutlineAllowance) + 'px'
				}, function () {
					// Animation complete.
					if (!opened) {
						elm.hide(); // Hide the widget content if the widget was just closed
						wrapper.find('#slideoutInnerWrapper').css('width', opts.imgHide.width);

						if (pe.ie <= 0 || document.documentMode !== undefined) {
							wrapper.addClass('slideoutWrapper');
							wrapper.removeClass('slideoutWrapperRel');
							wrapper.css('width', (opts.imgShow.width + focusOutlineAllowance) + 'px').css('top', $wbcorein.offset().top);
							reposition();
						}
					} else { // Slideout just opened
						if (ie7 && document.documentMode === undefined) { // Just true IE7
							elm.find('ul').html(elm.find('ul').html()); // Ugly fix for #4312 (post #11)
						}
					}
					toggleLink.on('click vclick touchstart', toggle);
					tocLinks.on('click vclick touchstart', toggle);
					slideoutClose.on('click vclick touchstart', toggle);
					wrapper.on('keydown', keyhandler);
					elm.on('keydown', keyhandler);
					$(document).on('click vclick touchstart', documentToggle);
				});

				if (opened) {
					wrapper.find('#slideoutToggle a img').attr({'src': opts.imgHide.src,
						'title': opts.imgHide.alt,
						'alt': opts.imgHide.alt});
					wrapper.find('#slideoutToggle a');
					elm.attr('aria-hidden', 'false');
					wrapper.find('#slideoutInnerWrapper').css('width', '');
				} else {
					wrapper.find('#slideoutToggle a img').attr({'src': opts.imgShow.src,
						'title': opts.imgShow.alt,
						'alt': opts.imgShow.alt});
					wrapper.find('#slideoutToggle a');
					elm.attr('aria-hidden', 'true');
				}

				if (typeof e !== 'undefined' && $(e.target).is(slideoutClose)) {
					return false;
				}
			};

			// Handles specialized keyboard input
			keyhandler = function (e) {
				var target = $(e.target),
					menuitem = target.is('[role="menuitem"]'),
					tocLink,
					keychar,
					elmtext,
					match,
					matches;

				if (menuitem) {
					tocLinks.each(function (i) {
						if ($(this).is(target)) {
							tocLink = i;
							return false;
						}
					});
				}

				if (!(e.ctrlKey || e.altKey || e.metaKey)) {
					switch (e.keyCode) {
					case 9: // tab key
						if (opened && ((e.shiftKey && target.is(toggleLink)) || (!e.shiftKey && target.is(slideoutClose)))) {
							toggleLink.trigger('click');
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 13: // enter key
						target.trigger('click');
						if (target.is(slideoutClose)) {
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 27: // escape key
						if (opened) {
							toggle();
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 32: // spacebar
						target.trigger('click');
						if (target.is(slideoutClose)) {
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 38: // up arrow
						if (!menuitem) {
							if (opened) {
								pe.focus(tocLinks.eq(tocLinks.length - 1));
							} else {
								toggleLink.trigger('click');
							}
						} else {
							if (tocLink === 0) {
								pe.focus(tocLinks.eq(tocLinks.length - 1));
							} else {
								pe.focus(tocLinks.eq(tocLink - 1));
							}
						}
						return false;
					case 40: // down arrow
						if (!menuitem) {
							if (opened) {
								pe.focus(tocLinks.eq(0));
							} else {
								toggleLink.trigger('click');
							}
						} else {
							if (tocLink === tocLinks.length - 1) {
								pe.focus(tocLinks.eq(0));
							} else {
								pe.focus(tocLinks.eq(tocLink + 1));
							}
						}
						return false;
					default:
						// 0 - 9 and a - z keys
						if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
							keychar = String.fromCharCode(e.keyCode).toLowerCase();
							elmtext = $(e.target).text();
							matches = elm.find('a').filter(function () {
								return ($(this).text().substring(0, 1).toLowerCase() === keychar || $(this).text() === elmtext);
							});

							if (matches.length > 0) {
								matches.each(function (index) {
									if ($(this).text() === elmtext) {
										match = index;
										return false;
									}
								});
								if (match < (matches.length - 1)) {
									pe.focus(matches.eq(match + 1));
									return false;
								}
								pe.focus(matches.eq(0));
							}
							return false;
						}
					}
				} else if (e.metaKey && e.keycode === 9) { // Shift + Tab
					if (target.is(toggleLink)) {
						toggleLink.trigger('click');
						return false;
					}
				}
			};

			// Close slideout after clicking on a link
			tocLinks.on('click vclick touchstart', toggle);
			wrapper.on('keydown', keyhandler);
			elm.on('keydown', keyhandler);

			// Close slideout if clicking outside of the slideout area
			documentToggle = function (e) {
				var $target = $(e.target);
				if (opened && !$target.is(elm) && !$target.is(wrapper) && $target.closest(elm).length === 0) {
					toggle();
				}
			};
			$(document).on('click vclick touchstart', documentToggle);

			// Add the 'Hide' link
			elm.append('<a href="#" id="slideoutClose" role="button" aria-controls="slideout-body">' + closeLink + '</a>');
			slideoutClose = elm.find('#slideoutClose');

			// Add the slideout toggle
			innerWrapper.css('padding', (focusOutlineAllowance / 2) + 'px').prepend('<div id="slideoutToggle" class="slideoutToggle"><a id="toggleLink" role="button" aria-controls="slideout-body" aria-label="' + opts.imgShow.alt + '" href="#" onclick="return false;"><img width="' + opts.imgShow.width + 'px' + '" height="' + opts.imgShow.height + 'px' + '" src="' + opts.imgShow.src + '" alt="' + opts.imgShow.alt + '" /></a></div>');
			toggleLink = innerWrapper.find('#toggleLink');
			wrapper.find('#slideoutToggle').css({'width' : opts.imgShow.width, 'height' : opts.imgShow.height}); // Resize the toggle to correct dimensions

			// Apply the CSS
			elm.addClass('tabbedSlideout');
			// Since we're hiding div#slideout, its height will be zero so we cache it now
			ttlHeight = elm.outerHeight();

			// Set vertical position and hide the slideout on load -- we don't want it to animate so we can't call slideout.toggle()
			wrapper.css('width', (opts.imgShow.width + focusOutlineAllowance) + 'px').css('top', $wbcorein.offset().top);

			// Hide widget content so we don't tab through the links when the slideout is closed
			elm.hide().attr('aria-hidden', 'true');
			innerWrapper.css('width', opts.imgHide.width);

			// IE6 and lower don't support position: fixed.
			// IE7's zoom messes up document dimensions (IE8 compat. view isn't affected)
			if (ie7 && document.documentMode === undefined) { // IE7 and lower (not including IE8 compat. view)
				scroll = false;
			}

			if (scroll) {
				wrapper.addClass('slideoutWrapper');
				// Handle window resize and zoom in/out events
				pe.resize(reposition);
				reposition();
			} else {
				wrapper.addClass('so-ie7');
				wrapper.addClass('slideoutWrapperRel').css({'right': borderWidth - 10, 'top': '0'});
			}

			// Toggle slideout
			toggleLink.on('click vclick touchstart', toggle);
			slideoutClose.on('click vclick touchstart', toggle);

			// Append the tab contents and remove the parent container
			container.append(wrapper);
			wrapper.unwrap();

			// Fix scrolling issue in some versions of IE (#4051)
			if (ie7) {
				$('html').css('overflowY', 'auto');
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	
	_pe.fn.tabbedinterface = {
		type : 'plugin',
		depends : (_pe.mobile ? [] : ['metadata', 'easytabs', 'equalheights']),
		mobile : function (elm, nested) {
			// Process any nested tabs
			if (typeof nested === 'undefined' || !nested) {
				elm.find('.wet-boew-tabbedinterface').each(function () {
					_pe.fn.tabbedinterface.mobile($(this), true);
				});
			}

			var $tabs = elm.children('.tabs').children('li'),
				$panels = elm.children('.tabs-panel').children('div'),
				defaultTab = 0,
				accordion = '<div data-role="collapsible-set" data-mini="true" data-content-theme="b" data-theme="b">',
				heading,
				parent,
				hlevel,
				hopen,
				hclose,
				index,
				len;

			// Find the default tab
			for (index = 0, len = $tabs.length; index < len; index += 1) {
				if ($tabs.eq(index).hasClass('default')) {
					defaultTab = index;
					break;
				}
			}

			// Convert html elements and attributes into the format the jQuery mobile accordian plugin expects.
			// Get the content out of the html structure tabbedinterface usually expects.
			// Create the accordion structure to move the content to.
			heading = elm.find(':header');
			if (heading.length !== 0) {
				hlevel = parseInt(heading.prop('tagName').substr(1), 10);
			} else {
				parent = elm;
				while (heading.length === 0) {
					parent = parent.parent();
					heading = parent.find(':header');
				}
				hlevel = parseInt(heading.prop('tagName').substr(1), 10) + 1;
			}
			hopen = '<h' + hlevel + '>';
			hclose = '</h' + hlevel + '>';

			$panels.each(function (index) {
				var text = $tabs.eq(index).children('a').text();
				if(text === ''){
					text = $tabs.eq(index).find('span').text();					
				}
				accordion += '<div data-role="collapsible"' + (index === defaultTab ? ' data-collapsed="false"' : '') + '>' + hopen + text + hclose + this.innerHTML + '</div>';
			});
			accordion += '</div>';
			elm.html(accordion);

			return elm;
		},
		_exec : function (elm) {
			if (_pe.mobile) {
				return _pe.fn.tabbedinterface.mobile(elm).trigger('create');
			}
			var $default_tab,
				$nav = elm.children('.tabs'),
				$tabs = $nav.find('a').filter(':not(.tabs-toggle)'),
				$tabsPanel = elm.children('.tabs-panel'),
				$panels = $tabsPanel.children(),
				$toggleButton,
				$toggleRow,
				$viewport,
				cycle,
				opts,
				overrides,
				getMaxPanelSize,
				getNextTab,
				getPrevTab,		
				getSlideTo,
				isSlider,
				positionPanels,
				selectTab,
				stopText = _pe.dic.get('%pause'),
				stopHiddenText = _pe.dic.get('%tab-rotation', 'disable'),
				startText = _pe.dic.get('%play'),
				startHiddenText = _pe.dic.get('%tab-rotation', 'enable'),
				stopCycle,
				toggleCycle,
				tabsPanelId,
				tabSuffix = '-link';				
				
			// Defaults
			opts = {
				panelActiveClass: 'active',
				tabActiveClass: 'active',
				defaultTab: 'li:first-child',
				autoHeight: true,
				cycle: false,
				carousel: false,
				autoPlay: false,
				animate: false,
				animationSpeed: 'normal',
				updateHash: false,
				transition: false
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				defaultTab : ((elm.find('.default').length) ? '.default' : undefined),
				autoHeight : elm.hasClass('auto-height-none') ? false : undefined,
				cycle : (elm.hasClass('cycle-slow') ? 8000 : (elm.hasClass('cycle-fast') ? 2000 : (elm.hasClass('cycle') ? 6000 : undefined))),
				carousel : elm.hasClass('style-carousel') ? true : undefined,
				autoPlay : elm.hasClass('auto-play') ? true : undefined,
				animate : (elm.hasClass('animate') || elm.hasClass('animate-slow') || elm.hasClass('animate-fast')) ? true : undefined,
				animationSpeed : (elm.hasClass('animate-slow') ? 'slow' : (elm.hasClass('animate-fast') ? 'fast' : undefined)),
				transition :  (elm.hasClass('fade') ? 'fade' : (elm.hasClass('slide-vert') ? 'slide-vert' : (elm.hasClass('slide-horz') ? 'slide-horz' : undefined)))
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_tabbedinterface), class-based overrides and the data attribute
			$.metadata.setType('attr', 'data-wet-boew');
			if (typeof wet_boew_tabbedinterface !== 'undefined' && wet_boew_tabbedinterface !== null) {
				$.extend(opts, wet_boew_tabbedinterface, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			$nav.attr('role', 'tablist').children('li').attr('role', 'presentation');
			$tabs.attr({'role': 'tab', 'aria-selected': 'false'});
			$tabsPanel.attr('id', $panels.eq(0).attr('id') + '-parent');
			$panels.attr({'tabindex': '-1', 'role': 'tabpanel', 'aria-hidden': 'true'}).each(function () {
				if (_pe.ie !== 0) {
					this.setAttribute('aria-labelledby', this.id + tabSuffix);
				}
			});

			// Find the default tab: give precedence to the URL hash
			$default_tab = $tabs.filter('[href="#'+_pe.urlhash+'"]');
			if ($default_tab.length === 0) {
				$default_tab = $nav.find('.default a');
				if($default_tab.length === 0) {
					$default_tab = $nav.find('li:first-child a');
				}
			}
			$default_tab.attr('aria-selected', 'true');
			$panels.filter($default_tab.attr('href')).attr('aria-hidden', 'false');

			// easytabs IE7 bug: using images as tabs breaks easytabs.activateDefaultTab().
			if(_pe.ie > 0 && _pe.ie < 8) {
				if($tabs.parent().hasClass('img')) {
					$tabs.parent().removeClass('img');
					$tabs.find('span').removeClass('wb-invisible');
					$tabs.find('img').remove();
				}
			}		
			
			$tabs.on('keydown click', function (e) {
				var $target = $(e.target),
					$panel;
				if (e.type === 'keydown') {
					if (e.keyCode === 13 || e.keyCode === 32) {
						if (e.stopPropagation) {
							e.stopImmediatePropagation();
						} else {
							e.cancelBubble = true;
						}
						e.preventDefault();
						if (!$target.is($tabs.filter('.' + opts.tabActiveClass))) {
							selectTab($target, $tabs, $panels, opts, false);
						} else {
							_pe.focus($panels.filter($target.attr('href')));
						}
					} else if (e.keyCode === 37 || e.keyCode === 38) { // left or up
						selectTab(getPrevTab($tabs), $tabs, $panels, opts, false);
						e.preventDefault();
					} else if (e.keyCode === 39 || e.keyCode === 40) { // right or down
						selectTab(getNextTab($tabs), $tabs, $panels, opts, false);
						e.preventDefault();
					}
				} else {
				
					// Workaround for broken EasyTabs getHeightForHidden function where it misreports the panel height when the panel is first shown
					// TODO: Issue should be fixed in EasyTabs
					
					// Make sure we're dealing with a link
					if(!$target.is('a')){
						$target = $target.parents('a:first');
					}					
					
					// Get the panel to display
					$panel = $panels.filter($target.attr('href'));
					if ($panel.data('easytabs') && !$panel.data('easytabs').lastHeight) {
						$panel.data('easytabs').lastHeight = $panel.outerHeight();
					}
				}
			});

			getNextTab = function ($tabs) {
				var $next = $tabs.filter('.' + opts.tabActiveClass).parent().next(':not(.tabs-toggle)');
				return ($next.length === 0 ? $tabs.first() : $next.children('a'));
			};
			getPrevTab = function ($tabs) {
				var $prev = $tabs.filter('.' + opts.tabActiveClass).parent().prev();
				return ($prev.length === 0 ? $tabs.last() : $prev.children('a'));
			};
			selectTab = function ($selection, $tabs, $panels, opts, keepFocus) {
				var cycleButton, activePanel, nextPanel;
				$panels.stop(true, true);
				if (opts.animate) {
				
					activePanel = $panels.filter('.' + opts.panelActiveClass).removeClass(opts.panelActiveClass).attr("aria-hidden", "true");
					nextPanel = $panels.filter($selection.attr('href'));	
					
					if(isSlider()){
						$panels.show();
						$viewport.stop().animate(getSlideTo(nextPanel), opts.animationSpeed, function(){							
							nextPanel.addClass(opts.panelActiveClass).attr('aria-hidden', 'false');
							$panels.filter(':not(.'+opts.panelActiveClass+')').hide();							
						});		
						
					} else {					
						activePanel.fadeOut(opts.animationSpeed, function () {
							return nextPanel.fadeIn(opts.animationSpeed, function () {
								return $(this).addClass(opts.panelActiveClass).attr('aria-hidden', 'false');
							});
						});
					}
					
				} else {
					$panels.removeClass(opts.panelActiveClass).attr('aria-hidden', 'true').hide();
					$panels.filter($selection.attr('href')).show().addClass(opts.panelActiveClass).attr('aria-hidden', 'false');
				}
				$tabs.removeClass(opts.tabActiveClass).attr('aria-selected', 'false').parent().removeClass(opts.tabActiveClass);
				$selection.addClass(opts.tabActiveClass).attr('aria-selected', 'true').parent().addClass(opts.tabActiveClass);
				cycleButton = $selection.parent().siblings('.tabs-toggle');
				if (!keepFocus && (cycleButton.length === 0 || cycleButton.data('state') === 'stopped')) {
					return _pe.focus($selection);
				}
			};
			toggleCycle = function () {
				if ($toggleRow.data('state') === 'stopped') {
					cycle($tabs, $panels, opts);
					$toggleButton.removeClass('tabs-start').addClass('tabs-stop').html(stopText + '<span class="wb-invisible">' + stopHiddenText + '</span>');
					return $('.wb-invisible', $toggleButton).text(stopHiddenText);
				}
				if ($toggleRow.data('state') === 'started') {
					return stopCycle();
				}
			};
			getMaxPanelSize = function() {
				var maxHeight = 0;
				
				// Remove position and size to allow content to determine max size of panels
				$tabsPanel.css({width: '', height: ''});
				$panels.css({width: '', height: ''});
				$panels.each(function() {
					maxHeight = Math.max(maxHeight, $(this).outerHeight());
				});
				return {width: $tabsPanel.width(), height: maxHeight};
			};
			getSlideTo = function(panel) {
				var slideTo = {left: 0, top: 0}, pos;
				if(panel && typeof panel.jquery !== 'undefined'){
					pos = panel.parent().position();
					slideTo = {left: pos.left * -1, top: pos.top * -1};
				}				
				return slideTo;
			};
			isSlider = function(){
				return opts.transition === 'slide-horz' || opts.transition === 'slide-vert';
			};
			positionPanels = function() {			

				var isSlideHorz = opts.transition === 'slide-horz',
					viewportSize = {width: 0, height: 0},
					panelSize;		
				
				if($viewport === undefined) {					
					$panels.wrapAll('<div class="viewport">').wrap('<div class="panel">');
					$viewport = $('.viewport', $tabsPanel);
				}				
				
				panelSize = getMaxPanelSize();
				$panels.each(function() {
					$(this).parent().css($.extend({position: 'absolute', top: viewportSize.height, left: viewportSize.width}, panelSize));					
					if(isSlideHorz){
						viewportSize.width += panelSize.width;
					} else {
						viewportSize.height += panelSize.height;
					}
				});
				
				$tabsPanel.css(panelSize);
				if(isSlideHorz) {
					$viewport.css($.extend({width: viewportSize.width, height: panelSize.height}, getSlideTo($panels.filter('.' + opts.panelActiveClass))));					
				} else {
					$viewport.css($.extend({width: panelSize.width, height: viewportSize.height}, getSlideTo($panels.filter('.' + opts.panelActiveClass))));
				}
		
			};
			if (isSlider() || (opts.autoHeight && !elm.hasClass('tabs-style-4') && !elm.hasClass('tabs-style-5'))) {
				$panels.show();
				$tabsPanel.equalHeights(true);
			}
	
			elm.easytabs($.extend({}, opts, {
				cycle : false
			}));

			if (opts.cycle) {
				cycle = function ($tabs, $panels, opts) {
					var $current,
						$pbar;
					$current = $tabs.filter('.' + opts.tabActiveClass);
					$pbar = $current.siblings('.tabs-roller');
					elm.find('.tabs-toggle').data('state', 'started');
					return $pbar.show().animate({
						width : $current.parent().width()
					}, opts.cycle - 200, 'linear', function () {
						$(this).width(0).hide();
						selectTab(getNextTab($tabs), $tabs, $panels, opts, true);
						return elm.data('interval', setTimeout(function () {
							return cycle($tabs, $panels, opts);
						}, 0));
					});
				};
				stopCycle = function () {
					clearTimeout(elm.data('interval'));
					elm.find('.tabs-roller').width(0).hide().stop();
					elm.find('.tabs-toggle').data('state', 'stopped');
					$toggleButton.removeClass('tabs-stop').addClass('tabs-start').html(startText + '<span class="wb-invisible">' + startHiddenText + '</span>');
					return $('.wb-invisible', $toggleButton).text(startHiddenText);
				};
				//
				// creates a play/pause, prev/next buttons, and lets the user toggle the stateact as PREV button MB
				tabsPanelId = $tabsPanel.attr('id');
				$nav.append('<li class="tabs-toggle"><a class="tabs-prev" href="javascript:;" role="button">&nbsp;&nbsp;&nbsp;<span class="wb-invisible">' + _pe.dic.get('%previous') + '</span></a></li>');
				// lets the user jump to the previous tab by clicking on the PREV button
				$nav.find('.tabs-prev').on('click', function () {
					selectTab(getPrevTab($tabs), $tabs, $panels, opts, true);
				});
				//
				//End PREV button
				//Create duplicate of Play/pause button to act as NEXT button MB
				//
				$nav.append('<li class="tabs-toggle"><a class="tabs-next" href="javascript:;" role="button">&nbsp;&nbsp;&nbsp;<span class="wb-invisible">' + _pe.dic.get('%next') + '</span></a></li>');
				// lets the user jump to the next tab by clicking on the NEXT button
				$nav.find('.tabs-next').on('click', function () {
					selectTab(getNextTab($tabs), $tabs, $panels, opts, true);
				});
				//End animation
				//
				//End NEXT button
				//
				$toggleRow = $('<li class="tabs-toggle"><a class="tabs-stop" href="javascript:;" role="button">' + stopText + '<span class="wb-invisible">' + stopHiddenText + '</span></a></li>');
				$toggleButton = $toggleRow.find('a');
				$nav.append($toggleRow);
				$toggleRow.click(toggleCycle).on('keydown', function (e) {
					if (e.keyCode === 32) {
						toggleCycle();
						return e.preventDefault();
					}
				});
				$nav.find('li a').not($toggleRow.find('a')).on('click', function () {
					return stopCycle();
				});
				$tabs.each(function () {
					var $pbar;
					$pbar = $('<div class="tabs-roller">').hide().on('click', function () {
						return $(this).siblings('a').trigger('click');
					}).on('hover', function () {
						return $(this).css('cursor', 'text');
					});
					if (_pe.ie > 0 && _pe.ie < 8) {
						$('.tabs-style-2 .tabs, .tabs-style-2 .tabs li').css('filter', '');
					}
					return $(this).parent().append($pbar);
				});
				cycle($tabs, $panels, opts);
				if (!opts.autoPlay) {
					stopCycle();
				}
				
				$(document).keyup(function(e) {
					if (e.keyCode === 27) { // Escape	
						if(elm.find('.tabs-toggle').data('state') === 'started') {
							elm.find('.tabs .' + opts.tabActiveClass).focus();
						}
						stopCycle();						
					}
				});	
			}
						
			elm.find('a').filter('[href^="#"]').each(function () {
				var $this = $(this),
					anchor,
					hash;
				hash = $this.attr('href');
				if (hash.length > 1) {
					anchor = $(hash, $panels);
					if (anchor.length) {
						return $this.on('click', function (e) {
							var panel,
								panelId;
							panel = anchor.parents('[role="tabpanel"]:hidden');
							if (panel) {
								e.preventDefault();
								panelId = panel.attr('id');
								panel.parent().siblings('.tabs').find('a').filter('[href="#' + panelId + '"]').trigger('click');
								return anchor.get(0).scrollIntoView(true);
							}
						});
					}
				}
			});		
	
			
			// Setup sliding panel behaviour
			if(isSlider()){	
			
				$(window).resize(positionPanels);
				positionPanels();
				
				// Prevent focus event from prematurely showing the active panel
				$panels.bind('focus', function(e){
					if(!$(this).hasClass(opts.panelActiveClass)){
						e.preventDefault();
					}
				});					
				
				// Override the tab transition with our slide animation
				// TODO: slide transitions should be added to easytabs lib
				elm.bind('easytabs:before', function(e, $tab) {
					selectTab($tab, $tabs, $panels, opts, false);
					return false;
				});					
			}				
			
			return elm.attr('class', elm.attr('class').replace(/\bwidget-style-/, "style-"));
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	}; 
	_pe.fn.texthighlight = {
		type: 'plugin',
		_exec: function (elm) {
			
			function addHighlight(searchCriteria, target) {
				var arrSearchCriteria, newText, i, _ilen;
				searchCriteria = searchCriteria.replace(/^\s+|\s+$/g, '');
				searchCriteria = searchCriteria.replace(/\|+/g, ''); // don't let them use the | symbol
				// --------------------------------------------------------------------------------------------
				// Split the data into an array so that we can exclude anything smaller than the minimum length
				arrSearchCriteria = searchCriteria.split('+');
				if (arrSearchCriteria.length > 0) {
					searchCriteria = '';
					for (i = 0, _ilen = arrSearchCriteria.length; i < _ilen; i += 1) {
						searchCriteria += arrSearchCriteria[i] + " ";
					}
					searchCriteria = searchCriteria.replace(/^\s+|\s+$|\"|\(|\)/g, '');
				}
				searchCriteria = searchCriteria.replace(/\s+/g, '|'); // OR each value
				searchCriteria = decodeURIComponent(searchCriteria);
				searchCriteria = "(?=([^>]*<))([\\s'])?(" + searchCriteria + ")(?!>)"; // Make sure that we're not checking for text within a tag; only the text outside of tags.
				// --------------------------------------------------------------------------------------------
				newText = target.html().replace(new RegExp(searchCriteria, "gi"), function (match, grp1, grp2, grp3) {
					return (typeof grp2 === 'undefined' ? '' : grp2) + '<span class="texthighlight"><mark>' + grp3 + '</mark></span>';
				});
				target.html(newText);
				return null;
			} // end of addHighlight

			if (pe.urlquery.texthighlight !== undefined) {
				addHighlight(pe.urlquery.texthighlight, elm);
			}
			return this;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




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
			return this._open === true;
		},
		
		setOpen : function(open) {
			this._open = open;
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



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.wamethod = {
		type: 'plugin',
		_exec: function (elm) {
			var summary = elm.find('#summary'),
				summarytd = summary.find('td'),
				input = elm.find('#checklist input'),
				calcfields = summary.find('span').html('0'),
				aaaIncluded = calcfields.filter('#rsltAAA').length > 0; // Test to see if AAA Success Criteria are included

			// Apply WAI-ARIA
			summarytd.find('td').attr('aria-live', 'polite').attr('aria-relevant', 'text').attr('aria-atomic', 'true').attr('aria-busy', 'false');

			// Event handler
			input.on('change', function () {
				var a = input.filter('[id^="ap"]:checked, [id^="an"]:checked').length,
					aeval = a + input.filter('[id^="af"]:checked').length,
					aa = input.filter('[id^="aap"]:checked, [id^="aan"]:checked').length,
					aaeval = aa + input.filter('[id^="aaf"]:checked').length,
					aaa = input.filter('[id^="aaap"]:checked, [id^="aaan"]:checked').length,
					aaaeval = aaa + input.filter('[id^="aaaf"]:checked').length,
					na = input.filter('[id^="an"]:checked, [id^="aan"]:checked, [id^="aaan"]:checked').length;

				//Update number of Success Criteria evaluated and passed
				summarytd.attr('aria-busy', 'true');
				calcfields.filter('#rsltA').html(a);
				calcfields.filter('#percA').html(Math.round(a / 0.25));
				calcfields.filter('#rsltAA').html(aa);
				calcfields.filter('#percAA').html(Math.round(aa / 0.13));
				calcfields.filter('#naTotal').html(na);
				if (aaaIncluded) {
					calcfields.filter('#rsltAAA').html(aaa);
					calcfields.filter('#percAAA').html(Math.round(aaa / 0.23));
				}
				calcfields.filter('#evalTotal').html(aeval + aaeval + aaaeval);
				calcfields.filter('#percEvalTotal').html(Math.round((aeval + aaeval + aaaeval) / 0.61));
				calcfields.filter('#rsltTotal').html(a + aa + aaa);
				calcfields.filter('#percTotal').html(Math.round((a + aa + aaa) / 0.61));
				calcfields.filter('#percNATotal').html(Math.round(na / 0.61));
				summarytd.attr('aria-busy', 'false');
			});

			function removeCorners() {
				elm.find('h2, #checklist h3, .last').each(function () {
					var $this = $(this);
					$this.before('<' + $this.get(0).tagName + ' class="print">' + $this.text() + '</' + $this.get(0).tagName + '>');
					$this.hide();
				});
			}

			function restoreCorners() {
				elm.find('h2, #checklist h3, .last').each(function () {
					elm.find('.print').remove();
					elm.find('h2, #checklist h3, .last').show();
				});
			}

			// Disable rounded corners before printing and restore after printing (rounded corners do not print well in IE6 - IE8)
			if (pe.ie > 0 && pe.ie < 9) {
				window.onbeforeprint = removeCorners;
				window.onafterprint = restoreCorners;
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));




(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.webwidget = {
		type: 'plugin',
		twitter: {
			_parse_entries: function (entries, limit, elm) {
				var cap, i, result = '', sorted, sorted_entry;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.created_at.replace('+0000 ', '') + ' GMT', a.created_at.replace('+0000 ', '') + ' GMT');
				});
				for (i = 0; i < cap; i += 1) {
					sorted_entry = sorted[i];
					if (sorted_entry.user !== undefined) {
						result += '<li><a class="float-left" href="http://www.twitter.com/' + sorted_entry.user.screen_name + '"><img class="widget-avatar" src="' + sorted_entry.user.profile_image_url + '" alt="' + sorted_entry.user.name + '" /></a> ' + pe.string.ify.clean(sorted_entry.text) + ' <span class="widget-datestamp-accent">' + pe.dic.ago(sorted_entry.created_at) + '</span></li>';
					} else {
						result += '<li><a class="float-left" href="http://www.twitter.com/' + sorted_entry.from_user + '"><img class="widget-avatar" src="' + sorted_entry.profile_image_url + '" alt="' + sorted_entry.from_user_name + '" /></a> ' + pe.string.ify.clean(sorted_entry.text) + ' <span class="widget-datestamp-accent">' + pe.dic.ago(sorted_entry.created_at) + '</span></li>';
					}
				}
				return elm.empty().append(result);
			},
			_map_entries : function (data) {
				return data.results !== undefined ? data.results : data;
			},
			_json_request: function (url) {
				if (url.toLowerCase().indexOf('!/search/') > -1) {
					return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/#!\/search\/(.+$)/, function (str, p1) {
						return 'http://search.twitter.com/search.json?q=' + encodeURI(decodeURI(p1)) + '&callback=?';
					});
				}
				return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/#!\/(.+$)/i, function (str, p1) {
					return 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + encodeURI(decodeURI(p1)) + '&callback=?';
				});
			}
		},
		weather: {
			_parse_entries: function (entries, limit, elm) {
				var entry = entries[1],
					result = '<li><a href="' + entry.link + '">' + entry.title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(entry.publishedDate, true) + ']</span></li>';
				return elm.empty().append(result);
			},
			_map_entries : function (data) {
				return data.responseData.feed.entries;
			},
			_json_request: function (url, limit) {
				var rl;
				url = url.replace(/^.*?\.gc\.ca\/([a-z]+).+\/(.*?)_[a-z]+_([ef])\.html/i, 'http://www.weatheroffice.gc.ca/rss/$1/$2_$3.xml');
				rl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURI(decodeURI(url));
				if (limit > 0) {
					rl += "&num=" + limit;
				}
				return rl;
			}
		},
		rss: {
			_parse_entries: function (entries, limit, elm) {
				var cap, i, result = '', sorted, sorted_entry;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.publishedDate, a.publishedDate);
				});
				for (i = 0; i < cap; i += 1) {
					sorted_entry = sorted[i];
					result += '<li><a href="' + sorted_entry.link + '">' + sorted_entry.title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(sorted_entry.publishedDate, true) + ']</span></li>';
				}
				return elm.empty().append(result);
			},

			_map_entries : function (data) {
				return data.responseData.feed.entries;
			},
			_json_request: function (url, limit) {
				var rl;
				rl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURI(decodeURI(url));
				if (limit > 0) {
					rl += '&num=' + limit;
				}
				return rl;
			}
		},
		_exec: function (elm, type) {
			var $loading, $content, feeds, limit, typeObj, entries, i, last, process_entries, parse_entries, _results, finalize;
			limit = _pe.limit(elm);
			feeds = elm.find('a').map(function () {
				var a = this.href;
				if (!type && /twitter.com/i.test(a)) {
					type = "twitter";
				}
				if (!type && /weatheroffice.gc.ca/i.test(a)) {
					type = "weather";
				}
				if (!type) {
					type = "rss";
				}
				return a;
			});

			$loading = $('<li class="widget-state-loading"><img src="' + pe.add.liblocation + 'images/webfeeds/ajax-loader.gif" alt="' + pe.dic.get('%loading') + '" /></li>');
			$content = elm.find('.widget-content');
			$content.append($loading);

			typeObj = _pe.fn.webwidget[type];

			last = feeds.length - 1;
			entries = [];
			parse_entries = typeObj._parse_entries;
			i = feeds.length - 1;
			_results = [];

			process_entries = function (data) {
				var k, len;
				data = typeObj._map_entries(data);
				for (k = 0, len = data.length; k < len; k += 1) {
					entries.push(data[k]);
				}
				if (!last) {
					parse_entries(entries, limit, $content);
				}

				last -= 1;
				return last;
			};
			
			finalize = function () {
				$loading.remove();
				$content.find('li').show();
			};

			while (i >= 0) {
				$.ajax({
					url: typeObj._json_request(feeds[i]),
					dataType: 'json',
					success: process_entries,
					timeout: 1000
				}).complete(finalize);
				_results.push(i -= 1);
			}

			$.extend({}, _results);
			return;
		} // end of exec
	};
	window.pe = _pe;
	return window.pe;
}(jQuery));



(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	
	_pe.fn.zebra = {
		type: 'plugin',
		fnZebraComplexTable: function (elem, opts) {

			var tblparser,
				i,
				j,
				getCellHeaders,
				autoRemoveTimeout,
				$trs,
				$cols;

			// Parse the table
			if (!$(elem).data().tblparser) {
				_pe.fn.parsertable.parse($(elem));
			}
			tblparser = $(elem).data().tblparser; // Create an alias
			// Key Cell
			if (tblparser.keycell) {
				for (i = 0; i < tblparser.keycell.length; i += 1) {
					$(tblparser.keycell[i].elem).addClass('table-keycell');
				}
			}
			// Description Cell
			if (tblparser.desccell) {
				for (i = 0; i < tblparser.desccell.length; i += 1) {
					$(tblparser.desccell[i].elem).addClass('table-desccell');
				}
			}
			// Layout Cell
			if (tblparser.layoutCell) {
				for (i = 0; i < tblparser.layoutCell.length; i += 1) {
					$(tblparser.layoutCell[i].elem).addClass('table-layoutCell');
				}
			}
			// Summary Cell
			if (tblparser.row) {
				for (i = 0; i < tblparser.row.length; i += 1) {
					for (j = 0; j < tblparser.row[i].cell.length; j += 1) {
						if (tblparser.row[i].cell[j].type === 3) {
							if (tblparser.row[i].cell[j].col.type === 3) {
								$(tblparser.row[i].cell[j].elem).addClass('table-summarycol' + tblparser.row[i].cell[j].collevel); // collevel is a number
							}
							if (tblparser.row[i].type === 3) {
								$(tblparser.row[i].cell[j].elem).addClass('table-summaryrow' + tblparser.row[i].cell[j].rowlevel); // rowlevel is a number
								if (tblparser.row[i].level === 0 && tblparser.row[i].header.elem) {
									// Special case for heading in that row
									$(tblparser.row[i].header.elem).addClass('table-summaryrow' + tblparser.row[i].cell[j].rowlevel); // rowlevel is a number
								}
							}
						}
					}
					// Summary group styling
					if (tblparser.row[i].type && tblparser.row[i].type === 3 && tblparser.row[i].rowgroup.elem && i > 0 && tblparser.row[i - 1].type && tblparser.row[i - 1].type === 3 && tblparser.row[i - 1].rowgroup.uid !== tblparser.row[i].rowgroup.uid) {
						$(tblparser.row[i].rowgroup.elem).addClass('table-rowgroupmarker');
					}
				}
			}
			// Header Group
			$('th', elem).each(function () {
				var $this = $(this);
				if ($this.data().tblparser.type === 7) {
					$this.addClass('table-headgroup' + $this.data().tblparser.scope + $this.data().tblparser.level);  // level is a number, scope either "row" || "col"
				}
			});

			// Data Column Group
			if (tblparser.colgroup) {
				for (i = 0; i < tblparser.colgroup.length; i += 1) {
					if (tblparser.colgroup[i].elem && ((i > 0 && tblparser.colgroup[i].type === 3 && tblparser.colgroup[i - 1].type === 3 && tblparser.colgroup[i - 1].level > tblparser.colgroup[i].level) ||
						(tblparser.colgroup[i].type === 2 && ((i > 0 && tblparser.colgroup[0].type === 2) || (i > 1 && tblparser.colgroup[0].type === 1))))) {
						$(tblparser.colgroup[i].elem).addClass('table-colgroupmarker');
					}
				}
			}

			// Data Row Group
			if (tblparser.lstrowgroup) {
				for (i = 0; i < tblparser.lstrowgroup.length; i += 1) {
					if (tblparser.lstrowgroup[i].elem && tblparser.lstrowgroup[i].type === 2 && i > 0) {
						$(tblparser.lstrowgroup[i].elem).addClass('table-rowgroupmarker');
					}
				}
			}

			
			if (!opts.noheaderhighlight || opts.columnhighlight) {
				getCellHeaders = function (elem) {
					var cellsheader = [],
						tblparser = $(elem).data().tblparser;
					if (tblparser.row && tblparser.row.header && !opts.norowheaderhighlight) {
						for (i = 0; i < tblparser.row.header.length; i += 1) {
							cellsheader.push(tblparser.row.header[i].elem);
						}
						if (tblparser.addrowheaders) {
							for (i = 0; i < tblparser.addrowheaders.length; i += 1) {
								cellsheader.push(tblparser.addrowheaders[i].elem);
							}
						}
					}
					if (tblparser.col && tblparser.col.header && !opts.nocolheaderhighlight) {
						for (i = 0; i < tblparser.col.header.length; i += 1) {
							cellsheader.push(tblparser.col.header[i].elem);
						}
						if (tblparser.addcolheaders) {
							for (i = 0; i < tblparser.addcolheaders.length; i += 1) {
								cellsheader.push(tblparser.addcolheaders[i].elem);
							}
						}
					}
					$(elem).data().cellsheader = cellsheader;
				};

				// Cell Header Highlight
				$('td, th', elem).on('mouseenter focusin', function () {
					var tblparser = $(this).data().tblparser,
						oldThHover,
						$this = $(this);
					if (!opts.noheaderhighlight) {
						clearTimeout(autoRemoveTimeout);
						oldThHover = $('th.table-hover', elem);
						if (tblparser.type !== 1) {
							if (!$this.data().cellsheader) {
								getCellHeaders(this);
							}
							//$($this.data().cellsheader).addClass('table-hover');
							$.each($this.data().cellsheader, function () {
								var $cheader = $(this);
								$cheader.addClass('table-hover');
								$cheader.data().zebrafor = tblparser.uid;
							});
						} else {
							if (tblparser.scope === "row" && !opts.norowheaderhighlight) {
								$this.addClass('table-hover');
								$this.data().zebrafor = tblparser.uid;
							}
						}
						// Remove previous highlight, if required
						$.each(oldThHover, function () {
							var $old = $(this);
							if ($old.data().zebrafor && $old.data().zebrafor !== tblparser.uid) {
								$old.removeClass('table-hover');
								delete $old.data().zebrafor;
							}
						});
					}
					if (opts.columnhighlight && tblparser.col && tblparser.col.elem) {
						$(tblparser.col.elem).addClass('table-hover');
					}
				});
				$('td, th', elem).on('mouseleave focusout', function () {
					var tblparser = $(this).data().tblparser,
						elem = this;
					if (!opts.noheaderhighlight) {
						autoRemoveTimeout = setTimeout(function () {
							var i;
							if (tblparser.type === 1) {
								$(elem).removeClass('table-hover');
								delete $(elem).data().zebrafor;
								return;
							}
							for (i = 0; i < $(elem).data().cellsheader.length; i += 1) {
								if ($($(elem).data().cellsheader[i]).data().zebrafor === tblparser.uid) {
									$($(elem).data().cellsheader[i]).removeClass('table-hover');
									delete $($(elem).data().cellsheader[i]).data().zebrafor;
								}
							}
						}, 25);
					}
					if (opts.columnhighlight && tblparser.col && tblparser.col.elem) {
						$(tblparser.col.elem).removeClass('table-hover');
					}
				});
			}


			// Default Zebra
			$trs = (elem.children('tr').add(elem.children('tbody').children('tr'))).filter(function () {
				return $(this).children('td').length > 0;
			});

			$trs.on('mouseleave focusout', function (e) {
				e.stopPropagation();
				$(this).removeClass('table-hover');
			});
			$trs.on('mouseenter focusin', function (e) {
				e.stopPropagation();
				$(this).addClass('table-hover');
			});

			if (opts.vectorstripe) {
				if (!opts.columnhighlight) {
					// note: even/odd's indices start at 0
					$trs.filter(':odd').addClass('table-even');
					$trs.filter(':even').addClass('table-odd');
				} else {
					$cols = [];
					for (i = 0; i < tblparser.col.length; i += 1) {
						if (tblparser.col[i].elem) {
							$cols.push(tblparser.col[i].elem);
						}
					}
					$($cols).filter(':odd').addClass('table-even');
					$($cols).filter(':even').addClass('table-odd');
				}
			}

		},
		_exec: function (elem) {
			var $trs,
				$cols,
				$lis,
				parity,
				isSimpleTable = true,
				i,
				opts,
				overrides,
				lstDlItems = [],
				isodd = false,
				dlitem = [];
			// Defaults Options
			opts = {
				noheaderhighlight: false,
				norowheaderhighlight: false,
				nocolheaderhighlight: false,
				columnhighlight: false,
				nohover: false,
				vectorstripe: false,
				complextableparsing: false // Option to force simple table detection to be anaylsed as a complex table
			};
			// Option to force to do not get header highlight
			overrides = {
				noheaderhighlight: elem.hasClass("noheaderhighlight") ? true : undefined,
				norowheaderhighlight: elem.hasClass("norowheaderhighlight") ? true : undefined,
				nocolheaderhighlight: elem.hasClass("nocolheaderhighlight") ? true : undefined,
				columnhighlight: elem.hasClass("columnhighlight") ? true : undefined,
				nohover: elem.hasClass("nohover") ? true : undefined,
				vectorstripe: elem.hasClass("vectorstripe") ? true : undefined,
				complextableparsing: elem.hasClass("complextableparsing") ? true : undefined
			};
			// Extend the defaults with settings passed through settings.js (wet_boew_zebra), class-based overrides and the data attribute
			//$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_zebra !== 'undefined' && wet_boew_zebra !== null) {
				$.extend(opts, wet_boew_zebra, overrides); //, elem.metadata());
			} else {
				$.extend(opts, overrides); //, elem.metadata());
			}
			if (opts.norowheaderhighlight && opts.nocolheaderhighlight) {
				opts.noheaderhighlight = true;
			}
			if (elem.is('table')) {

				// Perform a test to know if we need to completly parse the table
				//
				// Simple Table Condition :
				// * No CSS Options set
				// * 0-1 row for the columns
				// * 0-1 row in the thead
				// * 0-1 tbody row group
				// * 0-1 cell headers per row. That cell headers would need to be located at the first column position
				// * 0-2 colgroup
				// * n col element
				// * 0-1 tfoot row group

				if (opts.complextableparsing || opts.noheaderhighlight || opts.norowheaderhighlight || opts.nocolheaderhighlight || opts.nohover || opts.vectorstripe) {
					isSimpleTable = false;
				}



				// This condifition for simple table are not supported by IE
				// 
				// if (isSimpleTable && $('th[rowspan], th[colspan], td[rowspan], td[colspan], colgroup[span]', elem).length > 0) {
				//	isSimpleTable = false;
				// }
				// console.log('2 Zebra, isSimpleTable:' + isSimpleTable);
				// console.log($('th[rowspan]', elem).length + '  ' + $('th[colspan]', elem).length + '  ' + $('td[rowspan]', elem).length + '  ' + $('td[colspan]', elem).length + '  ' + $('colgroup[span]', elem).length);

				if (isSimpleTable && (elem.children('tbody').length > 1 || elem.children('thead').children('tr').length > 1 || elem.children('colgroup').length > 2)) {
					isSimpleTable = false;
				}

				if (isSimpleTable && (elem.children('colgroup').length === 2 && elem.children('colgroup:first').children('col').length > 1)) {
					isSimpleTable = false;
				}

				if (isSimpleTable && ($('tr:first th, tr:first td, tr', elem).length) < $('th', elem).length) {
					isSimpleTable = false;
				}

				i = 0;
				$('tr:eq(2)', elem).children().each(function () {
					var nn = this.nodeName.toLowerCase();
					if (!isSimpleTable) {
						return;
					}
					if (nn === 'th' && i > 0) {
						isSimpleTable = false;
						return;
					}
					i += 1;
				});


				if (isSimpleTable) {
					// Default Zebra
					$trs = (elem.children('tr').add(elem.children('tbody').children('tr'))).filter(function () {
						return $(this).children('td').length > 0;
					});

					$trs.on('mouseleave focusout', function (e) {
						e.stopPropagation();
						$(this).removeClass('table-hover');
					});
					$trs.on('mouseenter focusin', function (e) {
						e.stopPropagation();
						$(this).addClass('table-hover');
					});


					if (!opts.columnhighlight) {
						// note: even/odd's indices start at 0
						$trs.filter(':odd').addClass('table-even');
						$trs.filter(':even').addClass('table-odd');
					} else {
						$cols = elem.children('colgroup:last').children('col');

						$($cols).filter(':odd').addClass('table-even');
						$($cols).filter(':even').addClass('table-odd');

					}
					
					return; // Simple Table Zebra Striping done
				}






				if (_pe.fn.parsertable) {
					_pe.fn.zebra.fnZebraComplexTable(elem, opts);
					return;
				}

				if (_pe.fn.zebra.complexTblStack) {
					_pe.fn.zebra.complexTblStack.push(elem);
					_pe.fn.zebra.complexTblOptsStack.push(jQuery.extend(true, {}, opts));
					return;
				}

				_pe.fn.zebra.complexTblStack = [];
				_pe.fn.zebra.complexTblOptsStack = [];
				_pe.fn.zebra.complexTblStack.push(elem);
				_pe.fn.zebra.complexTblOptsStack.push(jQuery.extend(true, {}, opts));


				$(document).on('depsTableParserLoaded', function () {
					while (_pe.fn.zebra.complexTblStack.length > 0) {
						_pe.fn.zebra.fnZebraComplexTable(_pe.fn.zebra.complexTblStack.shift(), _pe.fn.zebra.complexTblOptsStack.shift());
					}
				});

				_pe.wb_load({'dep': ['parserTable']}, 'depsTableParserLoaded');

			} else if (elem.is('dl')) {
				// Create a list based on "dt" element with their one or more "dd" after each of them
				$(elem).children().each(function () {
					var $this = $(this);
					switch (this.nodeName.toLowerCase()) {
					case 'dt':
						if (isodd) {
							isodd = false;
							$this.addClass('list-even');
						} else {
							isodd = true;
							$this.addClass('list-odd');
						}
						dlitem = [];
						lstDlItems.push($this.get(0));
						$this.data().dlitem = dlitem;
						dlitem.push($this.get(0));
						break;
					case 'dd':
						if (isodd) {
							$this.addClass('list-odd');
						} else {
							$this.addClass('list-even');
						}
						lstDlItems.push($this.get(0));
						$this.data().dlitem = dlitem;
						dlitem.push($this.get(0));
						break;
					default:
						break;
					}
				});

				if (!opts.nohover) {
					$(lstDlItems).on('mouseleave focusout', function (e) {
						e.stopPropagation();
						$($(this).data().dlitem).removeClass('list-hover');
					});
					$(lstDlItems).on('mouseenter focusin', function (e) {
						e.stopPropagation();
						$($(this).data().dlitem).addClass('list-hover');
					});
				}
			} else {
				$lis = elem.children('li');
				parity = (elem.parents('li').length + 1) % 2;
				$lis.filter(':odd').addClass(parity === 0 ? 'list-odd' : 'list-even');
				$lis.filter(':even').addClass(parity === 1 ? 'list-odd' : 'list-even');
				if (!opts.nohover) {
					$lis.on('mouseleave focusout', function (e) {
						e.stopPropagation();
						$(this).removeClass('list-hover');
					});
					$lis.on('mouseenter focusin', function (e) {
						e.stopPropagation();
						$(this).addClass('list-hover');
					});
				}
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

