/*!
* Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
* www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
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
		language: ($('html').attr('lang').length > 0 ? $('html').attr('lang') : 'en'),
		touchscreen: 'ontouchstart' in document.documentElement,
		mobileview: (wet_boew_theme !== null && typeof wet_boew_theme.mobileview === 'function'),
		suffix: $('body script[src*="/pe-ap-min.js"]').length > 0 ? '-min' : '', // determine if pe is minified
		header: $('#wb-head'),
		main: $('#wb-main'),
		secnav: $('#wb-sec'),
		footer: $('#wb-foot'),
		urlquery: '',
		svg: ($('<svg xmlns="http://www.w3.org/2000/svg" />').get(0).ownerSVGElement !== undefined),
		document: $(document),

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
			var hlinks, hlinks_same, hlinks_other, $this, url, target, init_on_mobileinit = false;

			// Load polyfills that need to be loaded before anything else
			pe.polyfills.init();

			// Get the query parameters from the URL
			pe.urlquery = pe.url(window.location.href).params;

			// Identify whether or not the device supports JavaScript and has a touchscreen
			$('html').removeClass('no-js').addClass(wet_boew_theme !== null ? wet_boew_theme.theme : '').addClass(pe.touchscreen ? 'touchscreen' : '');

			hlinks = pe.main.find("a").filter(function () {
				return this.href.indexOf('#') !== -1;
			});
			hlinks_other = hlinks.filter(function () {
				return this.href.indexOf('#') !== 0; // Other page links with hashes
			});
			hlinks_same = hlinks.filter(function () {
				return this.href.indexOf('#') === 0; // Same page links with hashes
			});

			// Is this a mobile device?
			if (pe.mobilecheck()) {
				pe.mobile = true;
				$('body > div').attr('data-role', 'page').addClass('ui-page-active');

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

				// Replace hash with ?hashtarget= for links to other pages
				hlinks_other.each(function () {
					$this = $(this);
					url = pe.url($this.attr('href'));
					if (($this.attr('data-replace-hash') === undefined && (url.hash.length > 0 && window.location.hostname === url.host)) || ($this.attr('data-replace-hash') !== undefined && $this.attr('data-replace-hash') === true)) {
						$this.attr('href', url.removehash() + (url.params.length > 0 ? '&amp;' : '?') + 'hashtarget=' + url.hash);
					}
				});

				pe.document.on('pageinit', function () {
					// On click, puts focus on and scrolls to the target of same page links
					hlinks_same.off('click vclick').on('click vclick', function () {
						$this = $($(this).attr("href"));
						$this.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
						if ($this.length > 0) {
							$.mobile.silentScroll(pe.focus($this).offset().top);
						}
					});

					// If hashtarget is in the query string then put focus on and scroll to the target
					if (pe.urlquery.hashtarget !== undefined) {
						target = pe.main.find('#' + pe.urlquery.hashtarget);
						target.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
						if (target.length > 0) {
							setTimeout(function () {
								$.mobile.silentScroll(pe.focus(target).offset().top);
							}, 0);
						}
					}
				});
				pe.add.css([pe.add.themecsslocation + 'jquery.mobile' + pe.suffix + '.css']);
				pe.add._load([pe.add.liblocation + 'jquery.mobile/jquery.mobile.min.js']);
			} else {
				// On click, puts focus on the target of same page links (fix for browsers that don't do this automatically)
				hlinks_same.on("click vclick", function () {
					$this = $($(this).attr('href'));
					$this.filter(':not(a, button, input, textarea, select)').attr('tabindex', '-1');
					if ($this.length > 0) {
						pe.focus($this);
					}
				});

				// Puts focus on the target of a different page link with a hash (fix for browsers that don't do this automatically)
				if (window.location.hash.length > 0) {
					$this = $(window.location.hash);
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
						if (pe.mobile === true) {
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
					} else if (pe.mobile === true) {
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
			return (pe.mobileview && (screen.width < 768 || window.innerWidth < 768 && (window.outerWidth - window.innerWidth < 50)) && !(pe.ie > 0 && pe.ie < 9));
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
				*    returns 'www.canada.ca'
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
				*    returns '?a=1&b=2'
				*/
				query: a.search,
				/**
				* A collection of the parameters of the query string part of the URL.
				* @memberof pe.url
				* @type {object (key/value map of strings)}
				* @see #query
				* @example
				* pe.url('http://www.canada.ca?a=1&b=2').params
				*    returns
				*       {
				*          a: '1',
				*          b: '2'
				*       }
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
				*    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').file
				*       returns 'menu-eng.html'
				*/
				file: a.pathname.match(/\/([^\/?#]+)$/i) ? a.pathname.match(/\/([^\/?#]+)$/i)[1] : '',
				/**
				* The anchor of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*    pe.url('http://www.canada.ca#wb-main-in').hash
				*       returns 'wb-main-in'
				*/
				hash: a.hash.replace('#', ''),
				/**
				* The path of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').path
				*       returns '/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*/
				path: a.pathname.replace(/^([^\/])/, '/$1'),
				/**
				* The relative path of the URL.
				* @memberof pe.url
				* @type {string}
				* @example
				*    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').relative
				*       returns '/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*/
				relative: a.href.match(/tps?:\/\/[^\/]+(.+)/) ? a.href.match(/tps?:\/\/[^\/]+(.+)/)[1] : '',
				/**
				* The path of the URL broken up into an array.
				* @memberof pe.url
				* @type {string[]}
				* @example
				*    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').segments
				*       returns ['aboutcanada-ausujetcanada', 'hist', 'menu-eng.html']
				*/
				segments: a.pathname.replace(/^\//, '').split('/'),
				/**
				* The URL minus the anchor.
				* @memberof pe.url
				* @type {string}
				* @function
				* @example
				*    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html#wb-main-in').removehash()
				*       returns 'http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*    pe.url( pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html#wb-main-in').removehash() ).relative
				*       returns '/aboutcanada-ausujetcanada/hist/menu-eng.html'
				*/
				removehash: function () {
					return this.source.replace(/#([A-Za-z0-9\-_=&]+)/, '');
				}
			};
		},
		/**
		* @memberof pe
		* @function
		* @return {boolean}
		*/
		cssenabled: function () {
			return $('link').get(0).disabled;
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
					* pe.string.ify.clean('@ded the cdn url is http://cdn.enderjs.com')
					*    returns '@&lt;a href="http://twitter.com/ded"&gt;ded&lt;/a&gt; the cdn url is &lt;a href="http://cdn.enderjs.com"&gt;http://cdn.enderjs.com&lt;/a&gt;'
					*        ie. '@<a href="http://twitter.com/ded">ded</a> the cdn url is <a href="http://cdn.enderjs.com">http://cdn.enderjs.com</a>'
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
			/**
			* Cross-browser safe way of translating a date to iso format
			* @memberof pe.date
			* @function
			* @param {Date | number[] | number | string | object} d
			* @param {boolean} timepresent Optional. Whether to include the time in the result, or just the date. False if blank.
			* @return {string}
			* @example
			* pe.date.to_iso_format(new Date())
			*    returns '2012-04-27'
			* pe.date.to_iso_format(new Date(), true)
			*    returns '2012-04-27 13:46'
			*/
			to_iso_format: function (d, timepresent) {
				var date;
				date = this.convert(d);
				if (timepresent) {
					return date.getFullYear() + '-' + pe.string.pad(date.getMonth() + 1, 2, '0') + '-' + pe.string.pad(date.getDate(), 2, '0') + ' ' + pe.string.pad(date.getHours(), 2, '0') + ':' + pe.string.pad(date.getMinutes(), 2, '0');
				}
				return date.getFullYear() + '-' + pe.string.pad(date.getMonth() + 1, 2, "0") + '-' + pe.string.pad(date.getDate(), 2, '0');
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
				li = document.createElement('li');
			if ((pe.ie > 0 && pe.ie < 7 && disable !== "false") || disable === "true") {
				$('html').addClass('no-js pe-disable');
				if (lsenabled) {
					localStorage.setItem('pedisable', 'true'); // Set PE to be disable in localStorage
				}
				li.innerHTML = '<a href="?pedisable=false">' + pe.dic.get('%pe-enable') + '</a>';
				tphp.appendChild(li); // Add link to re-enable PE
				return true;
			} else if (disable === "false" || disablels !== null) {
				if (lsenabled) {
					localStorage.setItem('pedisable', 'false'); // Set PE to be enabled in localStorage
				}
			}
			li.innerHTML = '<a href="?pedisable=true">' + pe.dic.get('%pe-disable') + '</a>';
			tphp.appendChild(li); // Add link to disable PE
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
				var navlink,
					navurl,
					navtext,
					i,
					_len,
					pageurl = pe.url(window.location.href).removehash(),
					bcurl = [],
					bctext = [],
					match;
				menusrc = (typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc));
				bcsrc = $((typeof bcsrc.jquery !== 'undefined' ? bcsrc : $(bcsrc)).find('a').get().reverse());
				navclass = (typeof navclass === 'undefined') ? 'nav-current' : navclass;
				// Retrieve the path and link text for each breacrumb link
				bcsrc.each(function (index) {
					var $this = $(this);
					bcurl[index] = $this.attr('href');
					bctext[index] = $this.text();
				});

				$(menusrc.find('a').get().reverse()).each(function () {
					navlink = $(this);
					navurl = navlink.attr('href');
					navtext = navlink.text();
					match = (pageurl.indexOf(navurl) !== -1);
					for (i = 0, _len = bcurl.length; !match && i !== _len; i += 1) {
						if (bcurl[i] !== "#" && (bcurl[i] === navurl || bctext[i] === navtext)) {
							match = true;
							break;
						}
					}
					if (match) {
						navlink.addClass(navclass);
						return false;
					}
				});
				return (match ? navlink : $());
			},
			/**
			* Builds jQuery Mobile nested accordion menus from an existing menu
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Existing menu to process
			* @param {number} hlevel Heading level to process (e.g., h3 = 3)
			* @param {string} theme Letter representing the jQuery Mobile theme
			* @param {boolean} menubar Optional. Is the heading level to process in a menu bar? Defaults to false.
			* @function
			* @return {jQuery object} Mobile menu
			*/
			buildmobile: function (menusrc, hlevel, theme, mbar, expandall) {
				var menu = $('<div data-role="controlgroup"></div>'),
					heading = 'h' + hlevel,
					headingOpen = '<' + heading + '>',
					headingClose = '</' + heading + '>',
					headingNext = 'h' + hlevel + 1,
					menuitems = (typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc)).find('> div, > ul, ' + heading),
					next,
					subsection,
					hlink,
					nested,
					menubar = (mbar !== undefined ? mbar : false),
					expand = (expandall !== undefined ? expandall : false),
					allText = pe.dic.get('%all'),
					collapsibleSet = '<div data-role="collapsible-set" data-theme="' + theme + '"></div>',
					listView = '<ul data-role="listview" data-theme="' + theme + '"></ul>';
				if (menuitems.get(0).tagName.toLowerCase() === 'ul') {
					menu.append($(listView).append(menuitems.first().children('li')));
				} else {
					menuitems.each(function () {
						var $this = $(this);
						// If the menu item is a heading
						if (this.tagName.toLowerCase() === heading) {
							hlink = $this.children('a');
							subsection = $('<div data-role="collapsible"' + (expand || hlink.hasClass('nav-current') ? ' data-collapsed="false"' : '') + '>' + headingOpen + $this.text() + headingClose + '</div>');
							// If the original menu item was in a menu bar
							if (menubar) {
								$this = $this.parent().find('a').eq(1).closest('ul, div, ' + headingNext).first();
								next = $this;
							} else {
								next = $this.next();
							}

							if (next.get(0).tagName.toLowerCase() === 'ul') {
								// The original menu item was not in a menu bar
								if (!menubar) {
									next.append($('<li></li>').append($this.children('a').html(allText + ' - ' + hlink[0].innerHTML)));
								}
								nested = next.find('li ul');
								// If a nested list is detected
								nested.each(function (index) {
									var $this = $(this),
										hlink_html,
										headingIndexOpen = '<h' + hlevel + 1 + index + '>',
										headingIndexClose = '</h' + hlevel + 1 + index + '>';
									if ((hlevel + 1 + index) < 7) {
										// Make the nested list into a collapsible section
										hlink = $this.prev('a');
										hlink_html = hlink[0].innerHTML;
										$this.attr({ 'data-role': 'listview', 'data-theme': theme }).wrap('<div data-role="collapsible"' + (expand || hlink.hasClass('nav-current') ? ' data-collapsed="false"' : '') + '></div>');
										$this.parent().prepend(headingIndexOpen + hlink_html + headingIndexClose);
										$this.append('<li><a href="' + hlink.attr('href') + '">' + allText + ' - ' + hlink_html + '</a></li>');
										hlink.remove();
									} else {
										$this.attr({ 'data-role': 'listview', 'data-theme': theme });
									}
								});
								subsection.append($(listView).append(next.children('li')));
								subsection.find('ul').wrap('<div data-role="controlgroup">' + (nested.length > 0 ? collapsibleSet : '') + '</div>');
							} else {
								// If the section contains sub-sections
								subsection.append(pe.menu.buildmobile($this.parent(), hlevel + 1, theme, false, expand));
								// If the original menu item was not in a menu bar
								if (!menubar) {
									subsection.find('div[data-role="collapsible-set"]').eq(0).append($this.children('a').html(allText + ' - ' + hlink[0].innerHTML).attr({'data-role': 'button', 'data-theme': theme, 'data-icon': 'arrow-r', 'data-iconpos': 'right'}));
								}
							}
							menu.append(subsection);
						} else if (this.tagName.toLowerCase() === 'div') { // If the menu item is a div
							menu.append($this.children('a').attr({ 'data-role': 'button', 'data-theme': theme, 'data-icon': 'arrow-r', 'data-iconpos': 'right' }));
						}
					});
					menu.children().wrapAll(collapsibleSet);
				}
				return menu;
			},
			/**
			* Closes collapsible menus built by pe.menu.mobile that have a descendant matching the selector
			* @memberof pe.menu
			* @param {jQuery object | DOM object} menusrc Mobile menu to correct
			* @param {string} selector Selector for the link(s) to expand/collapse.
			* @param {boolean} expand Expand (true) or collapse (false) the selected collapsible menus.
			* @param {boolean} allparents Expand/collapse all ancestor collapsible menus (true) or just the nearest parent (false).
			* @function
			* @return {void} Mobile menu
			*/
			expandcollapsemobile: function (menusrc, selector, expand, allparents) {
				var elm = $((typeof menusrc.jquery !== 'undefined' ? menusrc : $(menusrc))).find(selector);
				if (allparents) {
					elm.parents('div[data-role="collapsible"]').attr('data-collapsed', expand);
				} else {
					elm.closest('div[data-role="collapsible"]').attr('data-collapsed', expand);
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
					parent = original.parent();
				original.detach().find('.ui-collapsible-set').each(function () {
					var $this = $(this);
					if ($this.find('> ul .ui-collapsible').length > 0) {
						$this = $this.children('ul');
					}
					$this.children().each(function () {
						var $this = $(this),
							target = (this.tagName.toLowerCase() === 'a' ? $this : $this.find('a').first());
						if ($this.prev().length > 0) {
							target.removeClass('ui-corner-top');
						} else {
							target.addClass('ui-corner-top');
						}
						if ($this.next().length > 0) {
							target.removeClass('ui-corner-bottom');
						} else {
							target.addClass('ui-corner-bottom');
						}
					});
				});
				original.appendTo(parent);
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
				// localstorage
				var lib = pe.add.liblocation;
				if (!window.localStorage) {
					pe.add._load(lib + 'polyfills/localstorage' + pe.suffix + '.js', 'localstorage-loaded');
					$('html').addClass('polyfill-localstorage');
				} else {
					$('html').addClass('localstorage');
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
					_len;

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
									$('html').addClass('polyfill-' + polyname);
									elms.addClass('polyfill'); // Add the 'polyfill' class to each element to be affected by the polyfill
								} else { // Native support
									$('html').addClass(polyname);
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
					load: 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=MML_HTMLorMML',
					/*update: function (elms) {
					MathJax.Hub.Queue(["Typeset",MathJax.Hub,elms]);
					},*/
					support_check: function () {
						// MathML
						// http://www.w3.org/Math/
						// By Addy Osmani
						// Based on work by Davide (@dpvc) and David (@davidcarlisle)
						// in https://github.com/mathjax/MathJax/issues/182
						var hasMathML = false,
							ns,
							div,
							mfrac;
						if (document.createElementNS) {
							ns = 'http://www.w3.org/1998/Math/MathML';
							div = document.createElement('div');
							div.style.position = 'absolute';
							div.style.color = '#fff';
							mfrac = div.appendChild(document.createElementNS(ns, 'math')).appendChild(document.createElementNS(ns, 'mfrac'));
							mfrac.appendChild(document.createElementNS(ns, 'mi')).appendChild(document.createTextNode('xx'));
							mfrac.appendChild(document.createElementNS(ns, 'mi')).appendChild(document.createTextNode('yy'));
							document.body.appendChild(div);
							hasMathML = div.offsetHeight > div.offsetWidth;
							div.parentNode.removeChild(div);
						}
						return hasMathML;
					}
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
				* Adds a javascript link for i18n to the head. It picks the file in pe.add.liblocation + "i18n/" whose prefix matches the page language.
				* @memberof pe.add
				* @function
				* @param {string} lang The two (iso 639-1) or three (iso 639-2) letter language code of the page.
				* @return {void}
				*/
				language: function (lang) {
					var url = pe.add.liblocation + 'i18n/' + lang + pe.suffix + '.js';
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
				settings = (typeof wet_boew_properties !== 'undefined' && wet_boew_properties !== null) ? wet_boew_properties : false,
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
