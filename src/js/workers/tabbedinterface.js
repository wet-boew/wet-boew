/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
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

			var $tabs = elm.children('.tabs').children('li'),
				$panels = elm.children('.tabs-panel').children('div'),
				$activeTab,
				tabListIdx = $('.wet-boew-tabbedinterface').index(elm),
				defaultTab = 0,
				accordion = '<div data-role="collapsible-set" data-mini="true" data-content-theme="b" data-theme="b">',
				hlevel,
				hopen,
				hclose,
				index,
				len;

			// Check if there's an active tab from the user's session
			$activeTab = $tabs.find('a[href="' + this._get_active_panel(tabListIdx) + '"]');
			if ($activeTab.length) {
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

			$panels.each(function (index) {
				var $link = $tabs.eq(index).children('a'),
					text = $link.text();
				if (text === ''){
					text = $tabs.eq(index).find('span').text();					
				}
				accordion += '<div data-role="collapsible"' + (index === defaultTab ? ' data-collapsed="false"' : '') + ' data-tab="' + _pe.fn.tabbedinterface._get_hash($link.attr('href')) + '">' + hopen + text + hclose + this.innerHTML + '</div>';
			});
			accordion += '</div>';
			elm.html(accordion);

			// Track the active panel during the user's session
			elm.find('[data-role="collapsible"]').on('expand', function () {
				_pe.fn.tabbedinterface._set_active_panel($(this).data('tab'), tabListIdx);
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

			$nav.attr('role', 'tablist').children('li').attr('role', 'presentation');
			$tabs.attr({'role': 'tab', 'aria-selected': 'false'});
			$tabsPanel.attr('id', $panels.eq(0).attr('id') + '-parent');
			$panels.attr({'tabindex': '-1', 'role': 'tabpanel', 'aria-hidden': 'true'}).each(function () {
				if (_pe.ie !== 0) {
					this.setAttribute('aria-labelledby', this.id + tabSuffix);
				}
			});

			// Find the default tab: precendence given to the active tab from sessionStorage
			$default_tab = $tabs.filter('[href="' + this._get_active_panel(tabListIdx) + '"]');
			if ($default_tab.length > 0) {
				opts.defaultTab = '.default';
				$nav.find('li').removeClass('default');
				$default_tab.parent('li').addClass('default');
			} else {
				$default_tab = $tabs.filter('[href="*#'+_pe.urlhash+'"]');
				if ($default_tab.length === 0) {
					$default_tab = $nav.find('.default a');
					if ($default_tab.length === 0) {
						$default_tab = $nav.find('li:first-child a');
					}
				}
			}
			$default_tab.attr('aria-selected', 'true');
			href = $default_tab.attr('href');
			$panels.filter(href.substring(href.indexOf('#'))).attr('aria-hidden', 'false');

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
					nextPanel,
					hash = _pe.fn.tabbedinterface._get_hash($selection.attr('href'));
				$panels.stop(true, true);
				if (opts.animate) {
					activePanel = $panels.filter('.' + opts.panelActiveClass).removeClass(opts.panelActiveClass).attr('aria-hidden', 'true');
					nextPanel = $panels.filter(hash);	
					
					if (isSlider()){
						$panels.show();
						$viewport.stop().animate(getSlideTo(nextPanel), opts.animationSpeed, function () {							
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
					$panels.filter(hash).show().addClass(opts.panelActiveClass).attr('aria-hidden', 'false');
				}
				_pe.fn.tabbedinterface._set_active_panel(hash, tabListIdx);
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
			getMaxPanelSize = function () {
				var maxHeight = 0;

				// Remove position and size to allow content to determine max size of panels
				$tabsPanel.css({width: '', height: ''});
				$panels.css({width: '', height: ''});
				$panels.each(function() {
					maxHeight = Math.max(maxHeight, $(this).outerHeight());
				});
				return {width: $tabsPanel.width(), height: maxHeight};
			};
			getSlideTo = function (panel) {
				var slideTo = {left: 0, top: 0}, pos;
				if(panel && typeof panel.jquery !== 'undefined'){
					pos = panel.parent().position();
					slideTo = {left: pos.left * -1, top: pos.top * -1};
				}
				return slideTo;
			};
			isSlider = function () { 
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
			if (isSlider()) {	
				_pe.window.resize(positionPanels);
				positionPanels();

				// Override the tab transition with our slide animation
				// TODO: slide transitions should be added to easytabs lib
				elm.on('easytabs:before', function(e, $tab) {
					selectTab($tab, $tabs, $panels, opts, true);
					return false;
				});					
			}

			// Trigger panel change if a link within a panel is clicked and matches a tab
			$panels.find('a').filter('[href^="#"]').each(function () {
				var $tab,
					$this = $(this),
					hash = _pe.fn.tabbedinterface._get_hash($this.attr('href'));
				if (hash.length > 1) {
					$tab = $tabs.filter('[href="' + hash + '"]');
					if ($tab.length) {
						$this.off('click.hlinks vclick.hlinks').on('click vclick', function () {
							$tab.trigger('click');
							if (opts.cycle) {
								stopCycle();
							}
							return false;
						});
					}
				}
			});

			return elm.attr('class', elm.attr('class').replace(/\bwidget-style-/, "style-"));
		}, // end of exec

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
