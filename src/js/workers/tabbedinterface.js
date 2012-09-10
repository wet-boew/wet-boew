/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Tabbed interface plugin
 */
/*global jQuery: false, pe: false, wet_boew_tabbedinterface: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.tabbedinterface = {
		type : 'plugin',
		depends : (pe.mobile ? [] : ['metadata', 'easytabs', 'equalheights']),
		mobile : function (elm, nested) {
			// Process any nested tabs
			if (typeof nested === 'undefined' || !nested) {
				elm.find('.wet-boew-tabbedinterface').each(function () {
					_pe.fn.tabbedinterface.mobile($(this), true);
				});
			}

			var $tabs = elm.children('.tabs').children('li'),
				$tab,
				$panels = elm.children('.tabs-panel').children('div'),
				accordion = '<div data-role="collapsible-set" data-content-theme="b" data-theme="b">',
				needh = (elm.hasClass('tabs-style-4') || elm.hasClass('tabs-style-5')),
				prevh,
				hlevel,
				hopen,
				hclose,
				$parent,
				$children;

			// Convert html elements and attributes into the format the jQuery mobile accordian plugin expects.
			// Get the content out of the html structure tabbedinterface usually expects.
			// Create the accordion structure to move the content to.
			if (needh) {
				prevh = elm.closest('section').find(':header:first');
				hlevel = (prevh.length > 0 ? (parseInt(prevh.prop('tagName').substr(1), 10) + 1) : 3);
				hopen = '<h' + hlevel + '>';
				hclose = '</h' + hlevel + '>';
			}
			$panels.each(function (index) {
				$tab = $tabs.eq(index);
				$parent = $(this);
				$children = $parent.children();
				if ($children.length !== 0) {
					accordion += '<div data-role="collapsible"' + ($tab.hasClass('default') ? ' data-collapsed="false"' : '') + '>';
					if (needh) {
						accordion += hopen + $tab.children('a').html() + hclose + this.innerHTML;
					} else {
						// Find the actual content then append
						while ($children.length === 1) {
							$parent = $children;
							$children = $parent.children();
						}
						if ($children.length !== 0) {
							accordion += $parent.html();
						}
					}
					accordion += '</div>';
				}
			});
			accordion += '</div>';
			elm.html(accordion);
			return elm;
		},
		_exec : function (elm) {
			if (pe.mobile) {
				return _pe.fn.tabbedinterface.mobile(elm).trigger('create');
			}
			var $default_tab,
				$nav = elm.children('.tabs'),
				$tabs = $nav.find('a').filter(':not(.tabs-toggle)'),
				$tabsPanel = elm.children('.tabs-panel'),
				$panels = $tabsPanel.children(),
				$toggleButton,
				$toggleRow,
				cycle,
				opts,
				overrides,
				getNextTab,
				getPrevTab,
				selectTab,
				stopText = pe.dic.get('%pause'),
				stopHiddenText = pe.dic.get('%tab-rotation', 'disable'),
				startText = pe.dic.get('%play'),
				startHiddenText = pe.dic.get('%tab-rotation', 'enable'),
				stopCycle,
				toggleCycle,
				tabsPanelId,
				tabSuffix = "-link";

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
				updateHash: false
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				defaultTab : ((elm.find('.default').length) ? '.default' : undefined),
				autoHeight : elm.hasClass('auto-height-none') ? false : undefined,
				cycle : (elm.hasClass('cycle-slow') ? 8000 : (elm.hasClass('cycle-fast') ? 2000 : (elm.hasClass('cycle') ? 6000 : undefined))),
				carousel : elm.hasClass('style-carousel') ? true : undefined,
				autoPlay : elm.hasClass('auto-play') ? true : undefined,
				animate : (elm.hasClass('animate') || elm.hasClass('animate-slow') || elm.hasClass('animate-fast')) ? true : undefined,
				animationSpeed : (elm.hasClass('animate-slow') ? 'slow' : (elm.hasClass('animate-fast') ? 'fast' : undefined))
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_tabbedinterface), class-based overrides and the data attribute
			$.metadata.setType('attr', 'data-wet-boew');
			if (typeof wet_boew_tabbedinterface !== 'undefined' && wet_boew_tabbedinterface !== null) {
				$.extend(opts, wet_boew_tabbedinterface, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}
			$nav.attr('role', 'tablist').children('li').attr('role', 'presentation');
			$tabs.attr({'role': 'tab', 'aria-selected': 'false'}).each(function () {
				var $this = $(this),
					href = $this.attr('href').substring(1);
			});
			$tabsPanel.attr('id', $panels.eq(0).attr('id') + '-parent');
			$panels.attr({'tabindex': '-1', 'role': 'tabpanel', 'aria-hidden': 'true'}).each(function () {
				var $this = $(this);
				if (pe.ie > 0) {
					$this.attr('aria-labelledby', $this.attr('id') + tabSuffix);
				}
			});
			$default_tab = ($nav.find('.default').length > 0 ? $nav.find('.default') : $nav.find('li:first-child'));
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
							pe.focus($panels.filter($target.attr('href')));
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
					$panel = $panels.filter($target.attr('href'));
					if (!$panel.data('easytabs').lastHeight) {
						$panel.data('easytabs').lastHeight = $panel.outerHeight();
					}
				}
			});
			$default_tab.children("a").each(function () {
				var $this = $(this);
				$this.attr('aria-selected', 'true');
				return $('#' + $this.attr('href').substring(1)).attr('aria-hidden', 'false');
			});
			getNextTab = function ($tabs) {
				var $next = $tabs.filter('.' + opts.tabActiveClass).parent().next(':not(.tabs-toggle)');
				return ($next.length === 0 ? $tabs.first() : $next.children());
			};
			getPrevTab = function ($tabs) {
				var $prev = $tabs.filter('.' + opts.tabActiveClass).parent().prev();
				return ($prev.length === 0 ? $tabs.last() : $prev.children());
			};
			selectTab = function ($selection, $tabs, $panels, opts, keepFocus) {
				var cycleButton, activePanel, nextPanel;
				$panels.stop(true, true);
				if (opts.animate) {
					activePanel = $panels.filter('.' + opts.panelActiveClass).removeClass(opts.panelActiveClass).attr("aria-hidden", "true");
					nextPanel = $panels.filter('#' + $selection.attr('href').substr(1));
					activePanel.fadeOut(opts.animationSpeed, function () {
						return nextPanel.fadeIn(opts.animationSpeed, function () {
							return $(this).addClass(opts.panelActiveClass).attr('aria-hidden', 'false');
						});
					});
				} else {
					$panels.removeClass(opts.panelActiveClass).attr('aria-hidden', 'true').hide();
					$panels.filter('#' + $selection.attr('href').substr(1)).show().addClass(opts.panelActiveClass).attr('aria-hidden', 'false');
				}
				$tabs.parent().removeClass(opts.tabActiveClass).children().removeClass(opts.tabActiveClass).attr('aria-selected', 'false');
				$selection.parent().addClass(opts.tabActiveClass).children().addClass(opts.tabActiveClass).attr('aria-selected', 'true');
				cycleButton = $selection.parent().siblings(".tabs-toggle");
				if (!keepFocus && (cycleButton.length === 0 || cycleButton.data('state') === 'stopped')) {
					return pe.focus($selection);
				}
			};
			toggleCycle = function () {
				if ($toggleRow.data('state') === 'stopped') {
					cycle($tabs, $panels, opts);
					$toggleButton.removeClass('tabs-start').addClass('tabs-stop').html(stopText + '<span class="wb-invisible">' + stopHiddenText + '</span>').attr('aria-pressed', true);
					return $('.wb-invisible', $toggleButton).text(stopHiddenText);
				}
				if ($toggleRow.data('state') === 'started') {
					return stopCycle();
				}
			};
			if (opts.autoHeight && !elm.hasClass('tabs-style-4') && !elm.hasClass('tabs-style-5')) {
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
					$toggleButton.removeClass('tabs-stop').addClass('tabs-start').html(startText + '<span class="wb-invisible">' + startHiddenText + '</span>').attr('aria-pressed', false);
					return $('.wb-invisible', $toggleButton).text(startHiddenText);
				};
				//
				// creates a play/pause, prev/next buttons, and lets the user toggle the stateact as PREV button MB
				tabsPanelId = $tabsPanel.attr('id');
				$nav.append('<li class="tabs-toggle"><a class="tabs-prev" href="javascript:;" role="button">&nbsp;&nbsp;&nbsp;<span class="wb-invisible">' + pe.dic.get('%previous') + '</span></a></li>');
				// lets the user jump to the previous tab by clicking on the PREV button
				$nav.find('.tabs-prev').on('click', function () {
					selectTab(getPrevTab($tabs), $tabs, $panels, opts, true);
				});
				//
				//End PREV button
				//Create duplicate of Play/pause button to act as NEXT button MB
				//
				$nav.append('<li class="tabs-toggle"><a class="tabs-next" href="javascript:;" role="button">&nbsp;&nbsp;&nbsp;<span class="wb-invisible">' + pe.dic.get('%next') + '</span></a></li>');
				// lets the user jump to the next tab by clicking on the NEXT button
				$nav.find('.tabs-next').on('click', function () {
					selectTab(getNextTab($tabs), $tabs, $panels, opts, true);
				});
				//End animation
				//
				//End NEXT button
				//
				$toggleRow = $('<li class="tabs-toggle"><a class="tabs-stop" href="javascript:;" role="button" aria-pressed="true">' + stopText + '<span class="wb-invisible">' + stopHiddenText + '</span></a></li>');
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
					if (pe.ie > 0 && pe.ie < 8) {
						$('.tabs-style-2 .tabs, .tabs-style-2 .tabs li').css('filter', '');
					}
					return $(this).parent().append($pbar);
				});
				cycle($tabs, $panels, opts);
				if (!opts.autoPlay) {
					stopCycle();
				}
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
			return elm.attr('class', elm.attr('class').replace(/\bwidget-style-/, "style-"));
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
