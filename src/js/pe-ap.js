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
/*global ResizeEvents: false, jQuery: false, wet_boew_properties: false, file: false, wet_boew_theme: false*/
(function ($) {
	var pe, _pe;
	/**
	* pe object
	* @namespace pe
	* @version 3.0
	*/
	pe = (typeof window.pe !== "undefined" && window.pe !== null) ? window.pe : {
		fn: {}
	};
	_pe = {
		/** Global object init properties */
		/**
		 * @memberof pe
		 * @type {string} Page language, defaults to "en" if not available
		 */
		language: ($("html").attr("lang").length > 0 ? $("html").attr("lang") : "en"),
		touchscreen: 'ontouchstart' in document.documentElement,
		theme: "",
		suffix: $('body script[src*="/pe-ap-min.js"]').length > 0 ? '-min' : '', // determine if pe is minified
		header: $('#wb-head'),
		main: $('#wb-main'),
		secnav: $('#wb-sec'),
		footer: $('#wb-foot'),
		urlquery: "",
		/**
		 * Detects the doctype of the document (loosely)
		 * @function
		 * @memberof pe
		 * @returns {boolean}
		 */
		html5: (function () {
			var res = false,
				re = /\s+(X?HTML)\s+([\d\.]+)\s*([^\/]+)*\//gi;
			/*********************************************
			Just check for internet explorer.
			**********************************************/
			if (typeof document.namespaces !== "undefined") {
				res = (document.all[0].nodeType === 8) ? re.test(document.all[0].nodeValue) : false;
			} else {
				res = (document.doctype !== null) ? re.test(document.doctype.publicId) : false;
			}
			return (res) ? false : true;
		}
		()),

		svg: ($('<svg xmlns="http://www.w3.org/2000/svg" />').get(0).ownerSVGElement !== undefined),

		/**
		 * @memberof pe
		 * @type {number} - IE major number if browser is IE, 0 otherwise
		 */
		ie: $.browser.msie ? $.browser.version : 0,
		/**
		 * A private function for initializing for pe.
		 * @function
		 * @memberof pe
		 * @returns {void}
		 */
		_init: function () {
			var $lch3, $o, hlinks, hlinks_same, hlinks_other, $this, url, target, init_on_mobileinit = false;

			// Identify whether or not the device supports JavaScript and has a touchscreen
			$('html').removeClass('no-js').addClass(pe.theme + ((pe.touchscreen) ? ' touchscreen' : ''));

			// Get the query parameters from the URL
			pe.urlquery = pe.url(document.location).params;

			hlinks = pe.main.find("a[href*='#']");
			hlinks_other = hlinks.filter(":not([href^='#'])"); // Other page links with hashes
			hlinks_same = hlinks.filter("[href^='#']"); // Same page links with hashes

			// Is this a mobile device?
			if (pe.mobilecheck()) {
				pe.mobile = true;
				$('body > div').attr('data-role', 'page').addClass('ui-page-active');

				$(document).on("mobileinit", function () {
					$.extend($.mobile, {
						ajaxEnabled: false,
						pushStateEnabled: false,
						autoInitializePage: (init_on_mobileinit ? true : false)
					});
				});

				// Replace hash with ?hashtarget= for links to other pages
				hlinks_other.each(function () {
					$this = $(this);
					url = pe.url($this.attr('href'));
					if (($this.attr('data-replace-hash') === undefined && (url.hash.length > 0 && window.location.hostname === url.host)) || ($this.attr('data-replace-hash') !== undefined && $this.attr('data-replace-hash') === true)) {
						$this.attr('href', url.removehash() + (url.params.length > 0 ? "&amp;" : "?") + 'hashtarget=' + url.hash);
					}
				});

				$(document).on("pageinit", function () {
					// On click, puts focus on and scrolls to the target of same page links
					hlinks_same.off("click vclick").on("click vclick", function () {
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
					$this = $($(this).attr("href"));
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

			//Load ajax content
			$.when.apply($, $.map($("*[data-ajax-replace], *[data-ajax-append]"), function (o) {
				$o = $(o);
				var replace = false, url;
				if ($o.attr("data-ajax-replace") !== undefined) {
					replace = true;
					url = $o.attr("data-ajax-replace");
				} else if ($o.attr("data-ajax-append") !== undefined) {
					url = $o.attr("data-ajax-append");
				}
				return $.get(url, function (data) {
					if (replace) {
						$o.empty();
					}
					$o.append($(data));
				}, "html");
			})).always(function () {
				//Wait for localisation and ajax content to load plugins
				$(document).on("languageloaded", function () {
					if (wet_boew_theme !== null) {
						// Initialize the theme
						wet_boew_theme.init();

						//Load the mobile view
						if (pe.mobile === true) {
							$(document).on("mobileviewloaded", function () {
								if ($.mobile !== undefined) {
									$.mobile.initializePage();
								} else {
									init_on_mobileinit = true;
								}
							});
							wet_boew_theme.mobileview();
						}
					} else if (pe.mobile === true) {
						if ($.mobile !== undefined) {
							$.mobile.initializePage();
						} else {
							init_on_mobileinit = true;
						}
					}
					pe.dance();
				});
				pe.add.language(pe.language);
			});

			pe.polyfills();
		},
		/**
		 * @namespace pe.depends
		 */
		depends: {
			/**
			 * Internal list for tracking dependencies.
			 * @memberof pe.depends
			 * @type {string[]}
			 */
			_ind: [],
			/**
			 * Checks if a dependency exists in the depends object.
			 * @memberof pe.depends
			 * @function
			 * @param {string} name The name of the dependency
			 * @return {number} The index of given dependency in the depends object. -1 if not found.
			 */
			is: function (name) {
				return -1 !== $.inArray(name, pe.depends._ind);
			},
			/**
			 * Adds a dependency to the depends object.
			 * @memberof pe.depends
			 * @function
			 * @param {string} drone The name of the dependency
			 * @return {void}
			 */
			put: function (drone) {
				pe.depends._ind[pe.depends._ind.length] = drone;
			},
			/**
			 * Binds a listener for the wet-boew-dependecy-loaded event.
			 * @memberof pe.depends
			 * @function
			 * @return {Array} An empty array.
			 */
			on: (function () {
				// lets bind a scan function to the drones property
				$(document).on('wet-boew-dependency-loaded', function () {
					var i, d;
					for (i = 0, d = pe.depends.on.length; i < d; i += 1) {
						pe.depends.on[i](i);
					}
				});
				return []; // overwrite property to become a simple array
			}())
		},
		/**
		 * Mobile identification
		 * @memberof pe
		 * @type {boolean} true if browser is not IE < 9 and browser window size is less than 767px wide.
		 */
		mobile: false,
		mobilecheck: function () {
			return (window.innerWidth < 768 && !(pe.ie > 0 && pe.ie < 9));
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
		 * Internal function that discovers parameters for the element against which a plugin will run.
		 * @memberof pe
		 * @function
		 * @param {string} key The parameter to look for.
		 * @param {jQuery object} jqElm The element to look for the parameter on.
		 * @return {string} The value of the parameter asked for.
		 */
		parameter: function (key, jqElm) {
			return (pe.html5) ? jqElm.data(key) : jqElm.attr('class').replace('/.*' + key + '-([a-z0-9_]+).*/i', "$1");
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
			ResizeEvents.eventElement.bind("x-text-resize x-zoom-resize x-window-resize", function () {
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
			var a;
			a = document.createElement('a');
			a.href = uri;
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
				 *    returns "www.canada.ca"
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
				 *    returns "?a=1&b=2"
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
				 *          a: "1",
				 *          b: "2"
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
				 *       returns "menu-eng.html"
				 */
				file: a.pathname.match(/\/([^\/?#]+)$/i) ? a.pathname.match(/\/([^\/?#]+)$/i)[1] : '',
				/**
				 * The anchor of the URL.
				 * @memberof pe.url
				 * @type {string}
				 * @example
				 *    pe.url('http://www.canada.ca#wb-main-in').hash
				 *       returns "wb-main-in"
				 */
				hash: a.hash.replace('#', ''),
				/**
				 * The path of the URL.
				 * @memberof pe.url
				 * @type {string}
				 * @example
				 *    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').path
				 *       returns "/aboutcanada-ausujetcanada/hist/menu-eng.html"
				 */
				path: a.pathname.replace(/^([^\/])/, '/$1'),
				/**
				 * The relative path of the URL.
				 * @memberof pe.url
				 * @type {string}
				 * @example
				 *    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').relative
				 *       returns "/aboutcanada-ausujetcanada/hist/menu-eng.html"
				 */
				relative: a.href.match(/tps?:\/\/[^\/]+(.+)/) ? a.href.match(/tps?:\/\/[^\/]+(.+)/)[1] : '',
				/**
				 * The path of the URL broken up into an array.
				 * @memberof pe.url
				 * @type {string[]}
				 * @example
				 *    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html').segments
				 *       returns ["aboutcanada-ausujetcanada", "hist", "menu-eng.html"]
				 */
				segments: a.pathname.replace(/^\//, '').split('/'),
				/**
				 * The URL minus the anchor.
				 * @memberof pe.url
				 * @type {string}
				 * @function
				 * @example
				 *    pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html#wb-main-in').removehash()
				 *       returns "http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html"
				 *    pe.url( pe.url('http://www.canada.gc.ca/aboutcanada-ausujetcanada/hist/menu-eng.html#wb-main-in').removehash() ).relative
				 *       returns "/aboutcanada-ausujetcanada/hist/menu-eng.html"
				 */
				removehash: function () {
					return this.source.replace(/#([A-Za-z0-9-_=&]+)/, "");
				}
			};
		},
		/**
		 * Internal method to bind a plugin to a code block
		 * @memberof pe
		 * @function
		 * @param {function} fn_obj The plugin to run the _exec method of.
		 * @param {jQuery object} elm The jQuery object(s) to run the plugin against.
		 * @return {void}
		 */
		_execute : function (fn_obj, elm) {
			if (fn_obj !== undefined) {
				var exec = (typeof fn_obj._exec !== "undefined") ? fn_obj._exec : fn_obj.exec;
				if (typeof fn_obj.depends !== "undefined") {
					pe.add.js(fn_obj.depends, function () {
						exec(elm);
					});
				//delete fn_obj.depends;
				} else {
					// execute function since it has no depends and we can safely execute
					exec(elm);
				}
			}
			return;
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
			count = $(elm).attr("class").match(/\blimit-\d+/);
			if (!count) {
				return 0;
			}
			return Number(count[0].replace(/limit-/i, ""));
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
				return (typeof elm.jquery !== "undefined" ? elm.focus() : $(elm).focus());
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
					"link": function (t) {
						return t.replace(/[a-z]+:\/\/[a-z0-9-_]+\.[a-z0-9-_@:~%&\?\+#\/.=]+[^:\.,\)\s*$]/ig, function (m) {
							return '<a href="' + m + '">' + ((m.length > 25) ? m.substr(0, 24) + '...' : m) + '</a>';
						});
					},
					"at": function (t) {
						return t.replace(/(^|[^\w]+)\@([a-zA-Z0-9_]{1,15}(\/[a-zA-Z0-9-_]+)*)/g, function (m, m1, m2) {
							return m1 + '@<a href="http://twitter.com/' + m2 + '">' + m2 + '</a>';
						});
					},
					"hash": function (t) {
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
					"clean": function (tweet) {
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
					str = "0" + str;
				}
				return str;
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
			 * <li>an array:		Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
			 * <li>a number:		Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
			 * <li>a string:		Any format supported by the javascript engine, like "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.</li>
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
				if (typeof d === "object") {
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
			 *    returns "2012-04-27"
			 * pe.date.to_iso_format(new Date(), true)
			 *    returns "2012-04-27 13:46"
			 */
			to_iso_format: function (d, timepresent) {
				var date;
				date = this.convert(d);
				if (timepresent) {
					return date.getFullYear() + "-" + pe.string.pad(date.getMonth() + 1, 2, "0") + "-" + pe.string.pad(date.getDate(), 2, "0") + " " + pe.string.pad(date.getHours(), 2, "0") + ":" + pe.string.pad(date.getMinutes(), 2, "0");
				}
				return date.getFullYear() + "-" + pe.string.pad(date.getMonth() + 1, 2, "0") + "-" + pe.string.pad(date.getDate(), 2, "0");
			}
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
					pageurl = pe.url(window.location.href).removehash(),
					bcurl = [],
					bctext = [],
					match;
				menusrc = (typeof menusrc.jquery !== "undefined" ? menusrc : $(menusrc));
				bcsrc = $((typeof bcsrc.jquery !== "undefined" ? bcsrc : $(bcsrc)).find('a').get().reverse());
				navclass = (typeof navclass === "undefined") ? 'nav-current' : navclass;
				// Retrieve the path and link text for each breacrumb link
				bcsrc.each(function (index) {
					bcurl[index] = $(this).attr('href');
					bctext[index] = $(this).text();
				});

				$(menusrc.find('a').get().reverse()).each(function () {
					navlink = $(this);
					navurl = navlink.attr('href');
					navtext = navlink.text();
					match = (navurl === pageurl);
					for (i = 0; !match && i < bcurl.length; i += 1) {
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
					menuitems = (typeof menusrc.jquery !== "undefined" ? menusrc : $(menusrc)).find('> div, > ul, h' + hlevel),
					next,
					subsection,
					hlink,
					nested,
					menubar = (mbar !== undefined ? mbar : false),
					expand = (expandall !== undefined ? expandall : false);
				if (menuitems.first().is('ul')) {
					menu.append($('<ul data-role="listview" data-theme="' + theme + '"></ul>').append(menuitems.first().children('li')));
				} else {
					menuitems.each(function (index) {
						var $this = $(this);
						// If the menu item is a heading
						if ($this.is('h' + hlevel)) {
							hlink = $this.children('a');
							subsection = $('<div data-role="collapsible"' + (expand || hlink.hasClass('nav-current') ? " data-collapsed=\"false\"" : "") + '><h' + hlevel + '>' + $this.text() + '</h' + hlevel + '></div>');
							// If the original menu item was in a menu bar
							if (menubar) {
								$this = $this.parent().find('a').eq(1).closest('ul, div, h' + hlevel + 1).first();
								next = $this;
							} else {
								next = $this.next();
							}

							if (next.is('ul')) {
								// The original menu item was not in a menu bar
								if (!menubar) {
									next.append($('<li></li>').append($this.children('a').html(pe.dic.get('%all') + ' - ' + hlink.html())));
								}
								nested = next.find('li ul');
								// If a nested list is detected
								nested.each(function (index) {
									var $this = $(this);
									hlink = $this.prev('a');
									if ((hlevel + 1 + index) < 7) {
										// Make the nested list into a collapsible section
										$this.attr('data-role', 'listview').attr('data-theme', theme).wrap('<div data-role="collapsible"' + (expand || hlink.hasClass('nav-current') ? " data-collapsed=\"false\"" : "") + '></div>');
										$this.parent().prepend('<h' + (hlevel + 1 + index) + '>' + hlink.html() + '</h' + (hlevel + 1 + index) + '>');
										$this.append('<li><a href="' + hlink.attr('href') + '">' + pe.dic.get('%all') + ' - ' + hlink.html() + '</a></li>');
										hlink.remove();
									} else {
										$this.attr('data-role', 'listview').attr('data-theme', theme);
									}
								});
								subsection.append($('<ul data-role="listview" data-theme="' + theme + '"></ul>').append(next.children('li')));
								subsection.find('ul').wrap('<div data-role="controlgroup">' + (nested.length > 0 ? "<div data-role=\"collapsible-set\" data-theme=\"" + theme + "\"></div>" : "") + '</div>');
							} else {
								// If the section contains sub-sections
								subsection.append(pe.menu.buildmobile($this.parent(), hlevel + 1, theme, false, expand));
								// If the original menu item was not in a menu bar
								if (!menubar) {
									subsection.find('div[data-role="collapsible-set"]').eq(0).append($this.children('a').html(pe.dic.get('%all') + ' - ' + hlink.html()).attr('data-role', 'button').attr('data-theme', theme).attr('data-icon', 'arrow-r').attr('data-iconpos', 'right'));
								}
							}
							menu.append(subsection);
						} else if ($this.is('div')) { // If the menu item is a div
							menu.append($this.children('a').attr('data-role', 'button').attr('data-theme', theme).attr('data-icon', 'arrow-r').attr('data-iconpos', 'right'));
						}
					});
					menu.children().wrapAll('<div data-role="collapsible-set" data-theme="' + theme + '"></div>');
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
				var elm = $((typeof menusrc.jquery !== "undefined" ? menusrc : $(menusrc))).find(selector);
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
				$((typeof menusrc.jquery !== "undefined" ? menusrc : $(menusrc))).find('.ui-collapsible-set').each(function () {
					var $this = $(this);
					if ($this.find('> ul .ui-collapsible').length > 0) {
						$this = $this.children('ul');
					}
					$this.children().each(function () {
						var $this = $(this), target = $this.is('a') ? $this : $this.find('a').first();
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
			}
		},
		/**
		 * A function to load required polyfills, @TODO: set up a single loader method to streamline
		 * @memberof pe
		 * @function
		 * @return {void}
		 */
		polyfills: function () {
			var lib = pe.add.liblocation,
				// modernizer test for detailsummary support
				details = (function (doc) {
					var el = doc.createElement('details'),
						fake,
						root,
						diff;
					if (typeof el.open === "undefined") {
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
				}(document));
			// localstorage
			if (!window.localStorage) {
				pe.add._load(lib + 'polyfills/localstorage' + pe.suffix + '.js');
			}
			// process
			if (typeof document.createElement('progress').position === "undefined") {
				pe.add._load(lib + 'polyfills/progress' + pe.suffix + '.js');
				$("progress").addClass("polyfill");
			}
			// details + summary
			if (!details) {
				pe.add._load(lib + 'polyfills/detailssummary' + pe.suffix + '.js');
				$("details").addClass("polyfill");
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
				head: document.head || document.getElementsByTagName("head"),
				/**
				 * The path to the root folder of the javascript files (same folder as pe-ap.js).
				 * @memberof pe.add
				 * @type {string}
				 */
				liblocation: (function () {
					var pefile = $('body script[src*="/pe-ap"]').attr('src');
					return pefile.substr(0, pefile.lastIndexOf("/") + 1);
				}()),
				themecsslocation: (function () {
					var themecss = $('head link[rel="stylesheet"][href*="' + wet_boew_theme.themename() + '"]');
					return themecss.length > 0 ? themecss.attr('href').substr(0, themecss.attr('href').lastIndexOf("/") + 1) : "theme-not-found/";
				}()),
				staged: [],
				/**
				 * A loading algorthim borrowed from labjs. Thank you!
				 * @memberof pe.add
				 * @function
				 * @param {string} js Path and filename of the javascript file to asynchronously load.
				 * @return {object} A reference to pe.add
				 */
				_load: function (js, message) {
					var head = pe.add.head,
						msg = (message !== undefined ? message : 'wet-boew-dependency-loaded');
					// - lets prevent double loading of dependencies
					if ($.inArray(js, this.staged) > -1) {
						return this;
					}
					// - now lets bind the events
					setTimeout(function () {
						if (typeof head.item !== "undefined") { // check if ref is still a live node list
							if (!head[0]) { // append_to node not yet ready
								setTimeout(arguments.callee, 25);
								return;
							}
							head = head[0]; // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
						}
						var scriptElem = document.createElement("script"),
							scriptdone = false;
						pe.add.set(scriptElem, 'async', 'async');
						scriptElem.onload = scriptElem.onreadystatechange = function () {
							if ((scriptElem.readyState && scriptElem.readyState !== "complete" && scriptElem.readyState !== "loaded") || scriptdone) {
								return false;
							}
							scriptElem.onload = scriptElem.onreadystatechange = null;
							scriptdone = true;
							// now add to dependency list
							pe.depends.put(js);
							$(document).trigger({type: msg, js: js});
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
						$(styleElement).appendTo($(head)).attr("href", css);
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
					var url = pe.add.liblocation + "i18n/" + lang + pe.suffix + ".js";
					pe.add._load(url);
				},
				/**
				 * Adds a javascript link to the head.
				 * @memberof pe.add
				 * @function
				 * @param {string} js The path and filename of the javascript file OR just the name (minus the path and extension).
				 * @param {function} fn A callback to execute after the script is loaded.
				 * @return {object} A reference to pe.add
				 */
				js: function (js, fn) {
					var i;
					js = pe.add.depends(js); // lets translate this to an array
					for (i = 0; i < js.length; i += 1) {
						if (!pe.depends.is(js[i])) {
							pe.add._load(js[i]);
						}
					}
					// now create the binding for dependencies
					pe.depends.on[pe.depends.on.length] = function (index) {
						var execute = true;
						for (i = 0; i < js.length; i += 1) {
							if (!pe.depends.is(js[i])) {
								execute = false;
							}
						}
						if (execute) {
							pe.depends.on[index] = function () {};
							fn();
						}
					};
					// now trigger an update event to ensure plugins are filtered
					$(document).trigger('wet-boew-dependency-loaded');
					return this;
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
		 * Follows the _init function and i18n initialization.
		 * @memberof pe
		 * @function
		 * @return {void}
		 * @todo pass an element as the context for the recursion.
		 */
		dance: function () {
			// global plugins
			var i,	settings = (typeof wet_boew_properties !== 'undefined' && wet_boew_properties !== null) ? wet_boew_properties : false;
			$('[class^="wet-boew-"]').each(function () {
				var _node = $(this),
					_fcall = _node.attr("class").split(" "),
					i;
				for (i = 0; i < _fcall.length; i += 1) {
					if (_fcall[i].indexOf('wet-boew-') === 0) {
						_fcall[i] = _fcall[i].substr(9).toLowerCase();
						if (typeof pe.fn[_fcall[i]] !== "undefined") {
							pe._execute(pe.fn[_fcall[i]], _node);
						}
					}
				}
			// lets safeguard the execution to only functions we have
			});
			// globals
			if (settings) {
				// loop throught globals adding functions
				for (i = 0; i < settings.globals.length; i += 1) {
					pe._execute(pe.fn[settings.globals[i]], document);
				}
			}
			window.onresize = function () { // TODO: find a better way to switch back and forth between mobile and desktop modes.
				if (pe.mobile !== pe.mobilecheck()) {
					window.location.href = pe.url(window.location.href).removehash();
				}
			};
		}
	};
	/* window binding */
	window.pe = $.extend(true, pe, _pe);
	return window.pe;
}
(jQuery))._init();