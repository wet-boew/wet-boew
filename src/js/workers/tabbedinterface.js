/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Tabbed interface plugin
 */
/*global jQuery: false, pe: false, wet_boew_tabbedinterface: false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.tabbedinterface = {
		type : 'plugin',
		depends : (pe.mobile ? [] : ['metadata', 'easytabs', 'equalheights']),
		mobile : function (elm) {
			var $tabs = elm.find(".tabs > li"),
				$panels = elm.find(".tabs-panel > div"),
				$accordion = $('<div data-role="collapsible-set" data-content-theme="b" data-theme="b"/>'),
				$collapsible,
				needh = (elm.hasClass('tabs-style-4') || elm.hasClass('tabs-style-5')),
				prevh,
				hlevel,
				defaulttab = false;

			// Convert html elements and attributes into the format the jQuery mobile accordian plugin expects.
			// Get the content out of the html structure tabbedinterface usually expects.
			// Create the accordion structure to move the content to.
			elm.removeClass();
			if (needh) {
				prevh = elm.closest('section').find(':header:first');
				hlevel = (prevh.length > 0 ? (parseInt(prevh.prop('tagName').substr(1), 10) + 1) : 3);
			}
			$panels.each(function (index) {
				$collapsible = $('<div data-role="collapsible"/>');
				if (needh) {
					$collapsible.append('<h' + hlevel + '>' + $tabs.eq(index).children('a').html() + '</h' + hlevel + '>' + $(this).html());
				} else {
					$collapsible.append($(this).find(":header:first").parent().html());
				}
				if ($tabs.eq(index).hasClass('default')) {
					$collapsible.attr('data-collapsed', 'false');
					defaulttab = true;
				}
				$accordion.append($collapsible);
			});
			if (!defaulttab) {
				$accordion.children().eq(0).attr('data-collapsed', 'false');
			}
			$tabs.remove();
			elm.empty().append($accordion);
			return elm;
		},
		_exec : function (elm) {
			if (pe.mobile) {
				return _pe.fn.tabbedinterface.mobile(elm).trigger('create');
			}
			var $default_tab,
				$nav = elm.find(".tabs"),
				$tabs = $nav.find('a:not(.tabs-toggle)'),
				$tabsPanel = elm.find('.tabs-panel'),
				$panels = $tabsPanel.children(),
				$toggleButton,
				$toggleRow,
				cycle,
				opts,
				overrides,
				getNextTab,
				getPrevTab,
				selectTab,
				start,
				stop,
				stopCycle,
				toggleCycle,
				$toggleRowPrev,
				$toggleRowNext,
				$toggleButtonPrev,
				$toggleButtonNext,
				prev,
				next,
				tabSuffix = "-link";

			// Defaults
			opts = {
				panelActiveClass : "active",
				tabActiveClass : "active",
				defaultTab : "li:first-child",
				autoHeight : true,
				cycle : false,
				carousel : false,
				autoPlay : false,
				animate : false,
				animationSpeed : "normal",
				updateHash : false
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				defaultTab : ((elm.find(".default").length) ? ".default" : undefined),
				autoHeight : elm.hasClass("auto-height-none") ? false : undefined,
				cycle : (elm.hasClass("cycle-slow") ? 8000 : (elm.hasClass("cycle-fast") ? 2000 : (elm.hasClass("cycle") ? 6000 : undefined))),
				carousel : elm.hasClass("style-carousel") ? true : undefined,
				autoPlay : elm.hasClass("auto-play") ? true : undefined,
				animate : (elm.hasClass("animate") || elm.hasClass("animate-slow") || elm.hasClass("animate-fast")) ? true : undefined,
				animationSpeed : (elm.hasClass("animate-slow") ? "slow" : (elm.hasClass("animate-fast") ? "fast" : undefined))
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_tabbedinterface), class-based overrides and the data attribute
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_tabbedinterface !== 'undefined' && wet_boew_tabbedinterface !== null) {
				$.extend(opts, wet_boew_tabbedinterface, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			$nav.attr("role", "tablist").children("li").attr("role", "presentation");
			$tabs.attr("role", "tab").attr("aria-selected", "false").each(function () {
				var $this = $(this),
					href = $this.attr('href').substring(1);
				$this.attr('aria-controls', href).attr('id', href + tabSuffix);
			});
			$tabsPanel.attr('id', $panels.eq(0).attr('id') + '-parent');
			$panels.attr('tabindex', '-1').attr("role", "tabpanel").attr("aria-hidden", "true").each(function () {
				var $this = $(this);
				if (pe.ie > 0) {
					$this.attr('aria-labelledby', $this.attr('id') + tabSuffix);
				}
			});
			$default_tab = ($nav.find(".default").length > 0 ? $nav.find(".default") : $nav.find("li:first-child"));
			$tabs.on("keydown", function (e) {
				var $target = $(e.target);
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
			});
			$default_tab.children("a").each(function () {
				$(this).attr("aria-selected", "true");
				return $("#" + $(this).attr("href").substring(1)).attr("aria-hidden", "false");
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
				var cycleButton;
				$panels.stop(true, true);
				if (opts.animate) {
					$panels.filter("." + opts.panelActiveClass).removeClass(opts.panelActiveClass).attr("aria-hidden", "true").fadeOut(opts.animationSpeed, function () {
						return $panels.filter("#" + $selection.attr("href").substr(1)).fadeIn(opts.animationSpeed, function () {
							return $(this).addClass(opts.panelActiveClass).attr("aria-hidden", "false");
						});
					});
				} else {
					$panels.removeClass(opts.panelActiveClass).attr("aria-hidden", "true").hide();
					$panels.filter("#" + $selection.attr("href").substr(1)).show().addClass(opts.panelActiveClass).attr("aria-hidden", "false");
				}
				$tabs.parent().removeClass(opts.tabActiveClass).children().removeClass(opts.tabActiveClass).filter("a").attr("aria-selected", "false");
				$selection.parent().addClass(opts.tabActiveClass).children().addClass(opts.tabActiveClass).filter("a").attr("aria-selected", "true");
				cycleButton = $selection.parent().siblings(".tabs-toggle");
				if (!keepFocus && (cycleButton.length === 0 || cycleButton.data("state") === "stopped")) {
					return pe.focus($selection);
				}
			};
			toggleCycle = function () {
				if ($toggleRow.data("state") === "stopped") {
					selectTab(getNextTab($tabs), $tabs, $panels, opts, true);
					cycle($tabs, $panels, opts);
					$toggleButton.removeClass(start["class"]).addClass(stop["class"]).html(stop.text + '<span class="wb-invisible">' + stop["hidden-text"] + '</span>').attr("aria-pressed", true);
					return $(".wb-invisible", $toggleButton).text(stop["hidden-text"]);
				}
				if ($toggleRow.data("state") === "started") {
					return stopCycle();
				}
			};
			if (opts.autoHeight && !elm.hasClass("tabs-style-4") && !elm.hasClass("tabs-style-5")) {
				$panels.show();
				$(".tabs-panel", elm).equalHeights(true);
			}
			elm.easytabs($.extend({}, opts, {
				cycle : false
			}));
			if (opts.cycle) {
				cycle = function ($tabs, $panels, opts) {
					var $current,
						$pbar;
					$current = $tabs.filter(function () {
						return $(this).is("." + opts.tabActiveClass);
					});
					$tabsPanel.attr('aria-live', 'polite');
					$pbar = $current.siblings(".tabs-roller");
					elm.find(".tabs-toggle").data("state", "started");
					return $pbar.show().animate({
						width : $current.parent().width()
					}, opts.cycle - 200, "linear", function () {
						$(this).width(0).hide();
						selectTab(getNextTab($tabs), $tabs, $panels, opts, true);
						return elm.data("interval", setTimeout(function () {
							return cycle($tabs, $panels, opts);
						}, 0));
					});
				};
				stopCycle = function () {
					clearTimeout(elm.data("interval"));
					$tabsPanel.attr('aria-live', 'off');
					elm.find(".tabs-roller").width(0).hide().stop();
					elm.find(".tabs-toggle").data("state", "stopped");
					$toggleButton.removeClass(stop["class"]).addClass(start["class"]).html(start.text + '<span class="wb-invisible">' + start["hidden-text"] + '</span>').attr("aria-pressed", false);
					return $(".wb-invisible", $toggleButton).text(start["hidden-text"]);
				};
				//
				// creates a play/pause, prev/next buttons, and lets the user toggle the stateact as PREV button MB
				$tabsPanel.attr('role', 'marquee').attr('aria-live', 'off');
				$toggleRowPrev = $('<li class="tabs-toggle">');
				prev = {
					"class" : "tabs-prev",
					"text" : '&nbsp;&nbsp;&nbsp;',
					"hidden-text" : pe.dic.get('%previous')
				};
				$toggleButtonPrev = $('<a class="' + prev["class"] + '" href="javascript:;" role="button" aria-controls="' + $tabsPanel.attr('id') + '">' + prev.text + '<span class="wb-invisible">' + prev["hidden-text"] + '</span></a>');
				$nav.append($toggleRowPrev.append($toggleButtonPrev));
				// lets the user jump to the previous tab by clicking on the PREV button
				$toggleButtonPrev.on("click", function () {
					selectTab(getPrevTab($tabs), $tabs, $panels, opts, true);
				});
				//
				//End PREV button
				//Create duplicate of Play/pause button to act as NEXT button MB
				//
				$toggleRowNext = $("<li class='tabs-toggle'>");
				next = {
					"class" : "tabs-next",
					"text" : '&nbsp;&nbsp;&nbsp;',
					"hidden-text" : pe.dic.get('%next')
				};
				$toggleButtonNext = $('<a class="' + next["class"] + '" href="javascript:;" role="button" aria-controls="' + $tabsPanel.attr('id') + '">' + next.text + '<span class="wb-invisible">' + next["hidden-text"] + '</span></a>');
				$nav.append($toggleRowNext.append($toggleButtonNext));
				// lets the user jump to the next tab by clicking on the NEXT button
				$toggleButtonNext.on("click", function () {
					selectTab(getNextTab($tabs), $tabs, $panels, opts, true);
				});
				//End animation
				//
				//End NEXT button
				//
				$toggleRow = $('<li class="tabs-toggle">');
				stop = {
					"class" : "tabs-stop",
					text : pe.dic.get('%pause'),
					"hidden-text" : pe.dic.get('%tab-rotation', 'disable')
				};
				start = {
					"class" : "tabs-start",
					text : pe.dic.get('%play'),
					"hidden-text" : pe.dic.get('%tab-rotation', 'enable')
				};
				$toggleButton = $('<a class="' + stop["class"] + '" href="javascript:;" role="button" aria-pressed="true" aria-controls="' + $tabsPanel.attr('id') + '">' + stop.text + '<span class="wb-invisible">' + stop["hidden-text"] + '</span></a>');
				$nav.append($toggleRow.append($toggleButton));
				$toggleRow.click(toggleCycle).on("keydown", function (e) {
					if (e.keyCode === 32) {
						toggleCycle();
						return e.preventDefault();
					}
				});
				$nav.find("li a").not($toggleRow.find("a")).click(function () {
					return stopCycle();
				});
				$tabs.each(function () {
					var $pbar;
					$pbar = $('<div class="tabs-roller">').hide().click(function () {
						return $(this).siblings("a").click();
					}).hover(function () {
						return $(this).css("cursor", "text");
					});
					if (pe.ie > 0 && pe.ie < 8) {
						$(".tabs-style-2 .tabs, .tabs-style-2 .tabs li").css("filter", "");
					}
					return $(this).parent().append($pbar);
				});
				cycle($tabs, $panels, opts);
				if (!opts.autoPlay) {
					stopCycle();
				}
			}
			elm.find('a[href^="#"]').each(function () {
				var anchor,
					hash;
				hash = $(this).attr("href");
				if (hash.length > 1) {
					anchor = $(hash, $panels);
					if (anchor.length) {
						return $(this).click(function (e) {
							var panel,
								panelId;
							panel = anchor.parents('[role="tabpanel"]:hidden');
							if (panel) {
								e.preventDefault();
								panelId = panel.attr("id");
								panel.parent().siblings(".tabs").find('a[href="#' + panelId + '"]').trigger('click');
								return anchor.get(0).scrollIntoView(true);
							}
						});
					}
				}
			});
			return elm.attr("class", elm.attr("class").replace(/\bwidget-style-/, "style-"));
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));