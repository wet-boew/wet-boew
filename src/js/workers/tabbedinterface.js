/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*
 * Tabbed interface plugin
 */
/*global jQuery: false, wet_boew_tabbedinterface: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};

	_pe.fn.tabbedinterface = {
		type : 'plugin',
		depends : (_pe.mobile ? [] : ['easytabs']),
		mobile : function (elm, nested) {
			// Process any nested tabs
			if (typeof nested === 'undefined' || !nested) {
				elm.find('.wet-boew-tabbedinterface').each(function () {
					_pe.fn.tabbedinterface.mobile($(this), true);
				});
			}

			var $accordion,
				$panelElms,
				$panels = elm.children('.tabs-panel').children('div'),
				$tabs = elm.children('.tabs').children('li'),
				$activeTab,
				tabListIdx = $('.wet-boew-tabbedinterface').index(elm),
				accordion = '<div data-role="collapsible-set" data-mini="true" data-content-theme="b" data-theme="b">',
				defaultTab = 0,
				$link,
				hlevel,
				hopen,
				hclose,
				index,
				len;

			// Check if there's a default tab specified by the URL hash or in the user's session
			$activeTab = $tabs.find('a[href="#' + _pe.urlhash + '"]');
			if ($activeTab.length === 0) {
				$activeTab = $tabs.find('a[href="' + this._get_active_panel(tabListIdx) + '"]');
			}
			if ($activeTab.length > 0) {
				$tabs.removeClass('default');
				$activeTab.parent('li').addClass('default');
			}

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
			hlevel = this._get_heading_level(elm);
			hopen = '<h' + hlevel + '>';
			hclose = '</h' + hlevel + '>';

			// Create the accordion panels
			for (index = 0, len = $panels.length; index < len; index += 1) {
				$link = $tabs.eq(index).children('a');
				accordion += '<div data-role="collapsible"' + (index === defaultTab ? ' data-collapsed="false"' : '') + ' data-tab="' + this._get_hash($link.attr('href')) + '">' + hopen + $link.text() + hclose + '</div>';
			}
			$accordion = $(accordion);

			// Append tab panel content to its accordion panel
			$panelElms = $accordion.find('div');
			while (len--) {
				$panelElms.eq(len).append($panels.eq(len));
			}
			elm.empty().append($accordion);

			this._init_panel_links($panelElms, $panelElms, 'data-tab', function (event) {
				event.data.tab.trigger('expand');
				return false;
			});

			// Track the active panel during the user's session
			$panelElms.on('expand', function () {
				_pe.fn.tabbedinterface._set_active_panel($(this).data('tab'), tabListIdx);
				setTimeout(function() {
					_pe.window.trigger('resize');
				}, 1);
			});
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
				$tabbedInterfaces = $('.wet-boew-tabbedinterface'),
				$tabListHeading,
				$panels = $tabsPanel.children(),
				panelsDOM = $panels.get(),
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
				mouse = {pressed: false, timeout: null},
				positionPanels,
				selectTab,
				stopText = _pe.dic.get('%pause'),
				stopHiddenText = _pe.dic.get('%tab-rotation', 'disable'),
				startText = _pe.dic.get('%play'),
				startHiddenText = _pe.dic.get('%tab-rotation', 'enable'),
				stopCycle,
				toggleCycle,
				tabListIdx = $tabbedInterfaces.index(elm),
				tabListCount = $tabbedInterfaces.length > 1 ? ' ' + (tabListIdx + 1) : '',
				tabsPanelId,
				tabSuffix = '-link',
				href,
				tallest,
				height,
				len;

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

			// Extend the defaults with settings passed through settings.js (wet_boew_tabbedinterface), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_tabbedinterface !== 'undefined' ? wet_boew_tabbedinterface : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			// Add hidden tab list heading
			$tabListHeading = $('<h'+ this._get_heading_level(elm) + ' class="wb-invisible">').text(_pe.dic.get('%tab-list') + tabListCount);
			if (_pe.ie > 0 && _pe.ie < 9) {
				$tabListHeading.wrap('<div>'); // Stop empty text nodes from moving the tabs around
			}
			$tabListHeading.insertBefore($nav);

			// End of panel text to notify screen reader users that there are more tab panels available
			if ($panels.length > 1) {
				$panels.append('<p class="panel-end"><span class="wb-invisible">' + _pe.dic.get('%tab-panel-end-1') + ($tabsPanel.prev().hasClass('tabs') ? '</span><a href="javascript:;" class="wb-show-onfocus button button-accent position-bottom-medium position-left">' + _pe.dic.get('%tab-panel-end-2') + '</a><span class="wb-invisible">' + _pe.dic.get('%tab-panel-end-3') : '') + '</span></p>').find('.panel-end a').on('click', function(e) {
					_pe.focus($tabs.filter('.' + opts.tabActiveClass));
					e.preventDefault();
				});
			}

			// Set ARIA attributes on the tabs and panels
			$nav.attr('role', 'tablist').children('li').attr('role', 'presentation');
			$tabs.attr({'role': 'tab', 'aria-selected': 'false'}).each(function () {
				var hash = _pe.fn.tabbedinterface._get_hash(this.href),
					id = hash.length > 0 ? hash.substring(1) : false;
				if (id !== false) {
					this.setAttribute('aria-controls', id);
					this.setAttribute('id', id + tabSuffix);
				}
			});
			$tabsPanel.attr('id', $panels.eq(0).attr('id') + '-parent');
			$panels.attr({'tabindex': '-1', 'role': 'tabpanel', 'aria-hidden': 'true', 'aria-expanded': 'false'}).each(function () {
				this.setAttribute('aria-labelledby', this.id + tabSuffix);
			});

			// Updates ARIA attributes of the tabs and panels after a change
			elm.on('easytabs:after', function(e, $tab, $panel) {
				$panels.not($panel).attr({'aria-hidden': 'true', 'aria-expanded': 'false'});
				$panel.attr({'aria-hidden': 'false', 'aria-expanded': 'true'});
				$tabs.not($tab).attr({'aria-selected': 'false', 'tabindex': '-1'});
				$tab.attr({'aria-selected': 'true', 'tabindex': '0'});

				// Focus active tab if tabs have been initialized and cycle isn't active
				if (elm.data('easytabs') !== undefined && !$nav.hasClass('started')) {
					_pe.focus($tab);
				}
			});

			// Find the default tab: precendence given to the URL hash
			$default_tab = $tabs.filter('[href="#' + _pe.urlhash + '"]');
			if ($default_tab.length === 0) {
				$default_tab = $tabs.filter('[href="' + this._get_active_panel(tabListIdx) + '"]');
				if ($default_tab.length > 0) {
					opts.defaultTab = '.default';
					$nav.find('li').removeClass('default');
					$default_tab.parent('li').addClass('default');
				} else {
					$default_tab = $nav.find('.default a');
					if ($default_tab.length === 0) {
						$default_tab = $nav.find('li:first-child a');
					}
				}
			}
			href = $default_tab.attr('href');
			elm.trigger('easytabs:after', [$default_tab, $panels.filter(href.substring(href.indexOf('#')))]);

			// easytabs IE7 bug: using images as tabs breaks easytabs.activateDefaultTab().
			if (_pe.ie > 0 && _pe.ie < 8) {
				if ($tabs.parent().hasClass('img')) {
					$tabs.parent().removeClass('img');
					$tabs.find('span').removeClass('wb-invisible');
					$tabs.find('img').remove();
				}
			}

			$tabs.off('click vclick').on('keydown click', function (e) {
				var $target = $(e.target),
					$panel,
					$link,
					hash;
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
							hash = _pe.fn.tabbedinterface._get_hash($target.attr('href'));
							_pe.focus($panels.filter(hash));
						}
					} else if (e.keyCode === 37 || e.keyCode === 38) { // left or up
						selectTab(getPrevTab($tabs), $tabs, $panels, opts, false);
						e.preventDefault();
					} else if (e.keyCode === 39 || e.keyCode === 40) { // right or down
						selectTab(getNextTab($tabs), $tabs, $panels, opts, false);
						e.preventDefault();
					}
				} else {
					// Make sure working with a link since it's possible for an image to be the target of a mouse click
					$link = (e.target.tagName.toLowerCase() !== 'a') ? $target.closest('a') : $target;
					hash = _pe.fn.tabbedinterface._get_hash($link.attr('href'));

					// Shift focus to the panel if the tab is already active
					if ($link.is($tabs.filter('.' + opts.tabActiveClass))) {
						_pe.focus($panels.filter($link.attr('href')));
					}

					// Workaround for broken EasyTabs getHeightForHidden function where it misreports the panel height when the panel is first shown
					// TODO: Issue should be fixed in EasyTabs
					$link.parents('a:first');

					// Get the panel to display
					$panel = $panels.filter(hash);
					if ($panel.data('easytabs') && !$panel.data('easytabs').lastHeight) {
						$panel.data('easytabs').lastHeight = $panel.outerHeight();
					}
				}

				if (hash !== undefined) {
					_pe.fn.tabbedinterface._set_active_panel(hash, tabListIdx);
				}
			});

			// Change panel on user swipe (disabled for mouse users)
			$panels.on('swipeleft swiperight', function (e) {
				if (!mouse.pressed) {
					e.preventDefault();
					selectTab(e.type === 'swipeleft' ? getNextTab($tabs) : getPrevTab($tabs), $tabs, $panels, opts, false);
				}
			}).on('mousedown mouseup', function (e) {
				if (e.type === 'mousedown') {
					clearTimeout(mouse.timeout);
					mouse.pressed = true;
				} else {
					// Prevent the mouse press from being marked as finished before the swipe event fires
					mouse.timeout = setTimeout(function () {
						mouse.pressed = false;
					}, $.event.special.swipe.durationThreshold);
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
				var cycleButton,
					activePanel,
					hash = _pe.fn.tabbedinterface._get_hash($selection.attr('href')),
					nextPanel = $panels.filter(hash);
				$panels.stop(true, true);
				if (opts.animate) {
					activePanel = $panels.filter('.' + opts.panelActiveClass).removeClass(opts.panelActiveClass);
					if (isSlider()) {
						$panels.show();
						$viewport.stop().animate(getSlideTo(nextPanel), opts.animationSpeed, function () {
							nextPanel.addClass(opts.panelActiveClass);
							$panels.filter(':not(.'+opts.panelActiveClass+')').hide();
						});
					} else {
						activePanel.fadeOut(opts.animationSpeed, function () {
							return nextPanel.fadeIn(opts.animationSpeed, function () {
								nextPanel.addClass(opts.panelActiveClass);
								return nextPanel;
							});
						});
					}
				} else {
					$panels.removeClass(opts.panelActiveClass).hide();
					nextPanel.addClass(opts.panelActiveClass).show();
				}
				_pe.fn.tabbedinterface._set_active_panel(hash, tabListIdx);
				$tabs.removeClass(opts.tabActiveClass).parent().removeClass(opts.tabActiveClass);
				$selection.addClass(opts.tabActiveClass).parent().addClass(opts.tabActiveClass);
				elm.trigger('easytabs:after', [$selection, nextPanel]);
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
			getMaxPanelSize = function () {
				var $panel,
					len = $panels.length,
					maxHeight = 0;

				// Allow the content to set the width/height of each panel
				$panels.css({width: '', height: '', minHeight: ''});
				while (len--) {
					// Make sure the panel is visible when determining its height
					$panel = $panels.eq(len).addClass('display-block');
					maxHeight = Math.max(maxHeight, $panel.outerHeight());
					$panel.removeClass('display-block');
				}
				return {width: $tabsPanel.width(), height: maxHeight};
			};
			getSlideTo = function (panel) {
				var slideTo = {left: 0, top: 0}, pos;
				if (panel && typeof panel.jquery !== 'undefined') {
					pos = panel.parent().position();
					slideTo = {left: pos.left * -1, top: pos.top * -1};
				}
				return slideTo;
			};
			isSlider = function () {
				return opts.transition === 'slide-horz' || opts.transition === 'slide-vert';
			};
			positionPanels = function() {
				var $hiddenParents = $tabsPanel.parents('.tabs-panel > div').filter(':hidden'),
					isSlideHorz = opts.transition === 'slide-horz',
					viewportSize = {width: 0, height: 0},
					panelSize;

				// Create the viewport that holds the sliding panels
				if (typeof $viewport === 'undefined') {
					$panels.wrapAll('<div class="viewport">').wrap('<div class="panel">');
					$viewport = $panels.closest('.viewport');

				// Reset the size of the viewport and panels so everything can be resized properly
				} else {
					$viewport.css({width: '', height: ''});
					$tabsPanel.css({width: '', height: ''});
				}

				// Hidden parents must be temporarily visible so that the panel width, height and position can be calculated
				$hiddenParents.addClass('display-block');

				panelSize = getMaxPanelSize();
				for(var i = 0, len = $panels.length; i < len; i++) {
					$panels.eq(i).parent().css($.extend({
						position: 'absolute',
						top: viewportSize.height,
						left: viewportSize.width
						}, panelSize));
					if (isSlideHorz) {
						viewportSize.width += panelSize.width;
					} else {
						viewportSize.height += panelSize.height;
					}
				}

				$tabsPanel.css(panelSize);
				if (isSlideHorz) {
					$viewport.css($.extend({
						width: viewportSize.width,
						height: panelSize.height
					}, getSlideTo($panels.filter('.' + opts.panelActiveClass))));
				} else {
					$viewport.css($.extend({
						width: panelSize.width,
						height: viewportSize.height
					}, getSlideTo($panels.filter('.' + opts.panelActiveClass))));
				}

				$hiddenParents.removeClass('display-block');
			};
			if (isSlider() || (opts.autoHeight && !elm.hasClass('tabs-style-4') && !elm.hasClass('tabs-style-5'))) {
				$panels.show();
				tallest = 0;
				len = panelsDOM.length;
				while (len--) {
					height = panelsDOM[len].offsetHeight;
					if (height > tallest) {
						tallest = height;
					}
				}
				$panels.css({ 'min-height': tallest });
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
					$nav.addClass('started');
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
					$nav.removeClass('started');
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

				_pe.document.keyup(function (e) {
					if (e.keyCode === 27) { // Escape
						if (elm.find('.tabs-toggle').data('state') === 'started') {
							elm.find('.tabs .' + opts.tabActiveClass).focus();
						}
						stopCycle();
					}
				});
			}

			elm.find('a').filter('[href^="#"]').each(function () {
				var $this = $(this),
					anchor,
					hash = _pe.fn.tabbedinterface._get_hash($this.attr('href'));
				if (hash.length > 1) {
					anchor = $(hash, $panels);
					if (anchor.length) {
						return $this.on('click', function (e) {
							var panel,
								panelId;
							panel = anchor.parents('[role="tabpanel"]:hidden');
							if (panel.length !== 0) {
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
			if (isSlider()) {
				_pe.window.on('resize', positionPanels);
				positionPanels();

				// Override the tab transition with our slide animation
				// TODO: slide transitions should be added to easytabs lib
				elm.on('easytabs:before', function(e, $tab) {
					selectTab($tab, $tabs, $panels, opts, true);
					return false;
				});
			}

			this._init_panel_links($panels, $tabs, 'href', function (event) {
				event.data.tab.trigger('click');
				if (opts.cycle) {
					stopCycle();
				}
				return false;
			});

			return elm.attr('class', elm.attr('class').replace(/\bwidget-style-/, "style-"));
		}, // end of exec

		/**
		* Setup links in the tab panel content that cause the tabbed interface to change panels
		* @memberof pe.fn.tabbedinterface
		* @param {jQuery object} $panels Tab panels of the tabbed interface
		* @param {jQuery object} $tabs Tab links of the tabbed interface
		* @param {string} attr HTML attribute used to check if there is a matching tab for a given link
		* @param {function} clickHandler Function that handles clicks on tab panel content links with a matching tab
		*/
		_init_panel_links : function ($panels, $tabs, attr, clickHandler) {
			var $tab,
				hash,
				links = $panels.find('a').filter('[href^="#"]'),
				len = links.length;

			while (len--) {
				hash = this._get_hash(links[len].href);
				if (hash.length > 1) {
					$tab = $tabs.filter('['+ attr + '="' + hash + '"]');
					if ($tab.length !== 0) {
						$(links[len]).off('click.hlinks vclick.hlinks').on('click vclick', {tab: $tab}, clickHandler);
					}
				}
			}
		},

		/**
		 * Given an element, find the appropriate heading level for its content
		 */
		_get_heading_level : function(elm) {
			var heading = elm.find(':header'),
				hlevel,
				parent;

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
			return hlevel;
		},

		/**
		 * Track the currently active tab for the user's session
		 */
		_set_active_panel : function(id, tabListIdx) {
			if (typeof window.sessionStorage !== 'undefined') {
				window.sessionStorage.setItem('activePanel-' + tabListIdx, id);
			}
		},

		_get_active_panel : function(tabListIdx) {
			if (typeof window.sessionStorage !== 'undefined') {
				return window.sessionStorage.getItem('activePanel-' + tabListIdx);
			}
			return null;
		},

		/**
		 * Returns the URL hash given a link's href attribute
		 */
		_get_hash : function(href) {
			return href !== null ? href.substring(href.indexOf('#')) : '';
		}
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
