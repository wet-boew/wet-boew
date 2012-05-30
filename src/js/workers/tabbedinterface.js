/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Tabbed interface plugin
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.tabbedinterface = {
		type : 'plugin',
		depends : ['easytabs', 'equalheights'],
		mobile : function (elm) {
			var $tabs,
				$panels,
				$accordion,
				i,
				$collapsible;
			// Convert html elements and attributes into the format the jQuery mobile accordian plugin expects.
			// Get the content out of the html structure tabbedinterface usually expects.
			$tabs = elm.find(".tabs li > a");
			$panels = elm.find(".tabs-panel").children();
			// Create the accordion structure to move the content to.
			$accordion = $('<div data-role="collapsible-set"/>');
			for (i = 0; i < $tabs.length; i += 1) {
				$collapsible = $('<div data-role="collapsible" data-theme="b" data-content-theme="b"/>');
				$collapsible.append('<h1>' + $tabs.eq(i).text() + '</h1>');
				$collapsible.append($panels.eq(i).html());
				if ($tabs.eq(i).parent().hasClass('default')) {
					$collapsible.attr('data-collapsed', 'false');
				}
				$accordion.append($collapsible);
			}
			elm.replaceWith($accordion);
			return elm;
		},
		_exec : function (elm) {
			if (pe.mobile) {
				return _pe.fn.tabbedinterface.mobile(elm);
			}
			var $default_tab,
				$nav,
				$panels,
				$tabs,
				$toggleButton,
				$toggleRow,
				cycle,
				opts,
				selectNext,
				selectPrev,
				start,
				stop,
				stopCycle,
				toggleCycle,
				$toggleRowPrev,
				$toggleRowNext,
				$toggleButtonPrev,
				$toggleButtonNext,
				prev,
				next;
			opts = {
				panelActiveClass : "active",
				tabActiveClass : "active",
				defaultTab : ((elm.find(".default").length) ? ".default" : "li:first-child"),
				autoHeight : (elm.hasClass("auto-height-none") ? false : true),
				cycle : (elm.hasClass("cycle-slow") ? 8000 : (elm.hasClass("cycle-fast") ? 2000 : (elm.hasClass("cycle") ? 6000 : false))),
				carousel : (/style-carousel/i.test(elm.attr('class'))) ? true : false,
				autoPlay : (elm.hasClass("auto-play") ? true : false),
				animate : (elm.hasClass("animate") || elm.hasClass("animate-slow") || elm.hasClass("animate-fast") ? true : false),
				animationSpeed : (elm.hasClass("animate-slow") ? "slow" : (elm.hasClass("animate-fast") ? "fast" : "normal")),
				updateHash : false
			};
			$nav = elm.find(".tabs");
			$tabs = $nav.find("li > a");
			$panels = elm.find(".tabs-panel").children();
			$default_tab = ($nav.find(".default").length > 0 ? $nav.find(".default") : $nav.find("li:first-child"));
			$nav.attr("role", "tablist");
			$nav.find("li").each(function () {
				$(this).attr("role", "presentation");
				return $(this).children("a").each(function () {
					return $(this).attr("role", "tab").attr("aria-selected", "false").attr("id", $(this).attr("href").substring(1) + "-link").bind("click", function () {
						$(this).parent().parent().children("." + opts.tabActiveClass).children("a").each(function () {
							$(this).attr("aria-selected", "false");
							return $("#" + $(this).attr("href").substring(1)).attr("aria-hidden", "true");
						});
						$(this).attr("aria-selected", "true");
						return $("#" + $(this).attr("href").substring(1)).attr("aria-hidden", "false");
					});
				});
			});
			$panels.each(function () {
				return $(this).attr("role", "tabpanel").attr("aria-hidden", "true").attr("aria-labelledby", $("a[href*=\"#" + $(this).attr("id") + "\"]").attr("id"));
			});
			$default_tab.children("a").each(function () {
				$(this).attr("aria-selected", "true");
				return $("#" + $(this).attr("href").substring(1)).attr("aria-hidden", "false");
			});
			$nav.find("li a").bind("focus", function () {
				$panels.stop(true, true);
				$(this).click();
			});
			$nav.find("li a").keyup(function (e) {
				if (e.keyCode === 13 || e.keyCode === 32) {
					var $current = $panels.filter(function () {
							return $(this).is("." + opts.tabActiveClass);
						});
					$current.attr("tabindex", "0");
					if (e.stopPropagation) {
						e.stopImmediatePropagation();
					} else {
						e.cancelBubble = true;
					}
					return setTimeout(function () {
						return $current.focus();
					}, 0);
				}
			});
			elm.keyup(function (e) {
				if (e.which === 37) { // left
					selectPrev($tabs, $panels, opts, true);
					e.preventDefault();
				} else if (e.which === 39) { // right
					selectNext($tabs, $panels, opts, true);
					e.preventDefault();
				}
			});
			selectPrev = function ($tabs, $panels, opts, keepFocus) {
				var $current,
					$prev,
					cycleButton;
				$panels.stop(true, true);
				$current = $tabs.filter(function () {
					return $(this).is("." + opts.tabActiveClass);
				});
				$prev = $tabs.eq(($tabs.index($current) - 1) + $tabs.size() % $tabs.size());
				if (opts.animate) {
					$panels.filter("." + opts.panelActiveClass).removeClass(opts.panelActiveClass).attr("aria-hidden", "true").fadeOut(opts.animationSpeed, function () {
						return $panels.filter("#" + $prev.attr("href").substr(1)).fadeIn(opts.animationSpeed, function () {
							return $(this).addClass(opts.panelActiveClass).attr("aria-hidden", "false");
						});
					});
				} else {
					$panels.removeClass(opts.panelActiveClass).attr("aria-hidden", "true").hide();
					$panels.filter("#" + $prev.attr("href").substr(1)).show().addClass(opts.panelActiveClass).attr("aria-hidden", "false");
				}
				$tabs.parent().removeClass(opts.tabActiveClass).children().removeClass(opts.tabActiveClass).filter("a").attr("aria-selected", "false");
				$prev.parent().addClass(opts.tabActiveClass).children().addClass(opts.tabActiveClass).filter("a").attr("aria-selected", "true");
				cycleButton = $current.parent().siblings(".tabs-toggle");
				if (!keepFocus && (cycleButton.length === 0 || cycleButton.data("state") === "stopped")) {
					return $prev.focus();
				}
			};
			selectNext = function ($tabs, $panels, opts, keepFocus) {
				var $current,
					$next,
					cycleButton;
				$panels.stop(true, true);
				$current = $tabs.filter(function () {
					return $(this).is("." + opts.tabActiveClass);
				});
				$next = $tabs.eq(($tabs.index($current) + 1) % $tabs.size());
				if (opts.animate) {
					$panels.filter("." + opts.panelActiveClass).removeClass(opts.panelActiveClass).attr("aria-hidden", "true").fadeOut(opts.animationSpeed, function () {
						return $panels.filter("#" + $next.attr("href").substr(1)).fadeIn(opts.animationSpeed, function () {
							return $(this).addClass(opts.panelActiveClass).attr("aria-hidden", "false");
						});
					});
				} else {
					$panels.removeClass(opts.panelActiveClass).attr("aria-hidden", "true").hide();
					$panels.filter("#" + $next.attr("href").substr(1)).show().addClass(opts.panelActiveClass).attr("aria-hidden", "false");
				}
				$tabs.parent().removeClass(opts.tabActiveClass).children().removeClass(opts.tabActiveClass).filter("a").attr("aria-selected", "false");
				$next.parent().addClass(opts.tabActiveClass).children().addClass(opts.tabActiveClass).filter("a").attr("aria-selected", "true");
				cycleButton = $current.parent().siblings(".tabs-toggle");
				if (!keepFocus && (cycleButton.length === 0 || cycleButton.data("state") === "stopped")) {
					return $next.focus();
				}
			};
			toggleCycle = function () {
				if ($toggleRow.data("state") === "stopped") {
					selectNext($tabs, $panels, opts, true);
					cycle($tabs, $panels, opts);
					$toggleButton.removeClass(start["class"]).addClass(stop["class"]).html(stop.text + "<span class='wb-invisible'>" + stop["hidden-text"] + "</span>").attr("aria-pressed", true);
					return $(".wb-invisible", $toggleButton).text(stop["hidden-text"]);
				}
				if ($toggleRow.data("state") === "started") {
					return stopCycle();
				}
			};
			if (opts.autoHeight) {
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
					$pbar = $current.siblings(".tabs-roller");
					elm.find(".tabs-toggle").data("state", "started");
					return $pbar.show().animate({
						width : $current.parent().width()
					}, opts.cycle - 200, "linear", function () {
						$(this).width(0).hide();
						selectNext($tabs, $panels, opts, true);
						return elm.data("interval", setTimeout(function () {
							return cycle($tabs, $panels, opts);
						}, 0));
					});
				};
				stopCycle = function () {
					clearTimeout(elm.data("interval"));
					elm.find(".tabs-roller").width(0).hide().stop();
					elm.find(".tabs-toggle").data("state", "stopped");
					$toggleButton.removeClass(stop["class"]).addClass(start["class"]).html(start.text + "<span class='wb-invisible'>" + start["hidden-text"] + "</span>").attr("aria-pressed", false);
					return $(".wb-invisible", $toggleButton).text(start["hidden-text"]);
				};
				//
				// creates a play/pause, prev/next buttons, and lets the user toggle the stateact as PREV button MB
				$toggleRowPrev = $("<li class='tabs-toggle'>");
				prev = {
					"class" : "tabs-prev",
					"text" : '&nbsp;&nbsp;&nbsp;',
					"hidden-text" : pe.dic.get('%previous')
				};
				$toggleButtonPrev = $("<a class='" + prev["class"] + "' href='javascript:;' role='button' aria-pressed='true'>" + prev.text + "<span class='wb-invisible'>" + prev["hidden-text"] + "</span></a>");
				$nav.append($toggleRowPrev.append($toggleButtonPrev));
				// lets the user jump to the previous tab by clicking on the PREV button
				$toggleButtonPrev.click(function () {
					selectPrev($tabs, $panels, opts, true);
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
				$toggleButtonNext = $("<a class='" + next["class"] + "' href='javascript:;' role='button' aria-pressed='true'>" + next.text + "<span class='wb-invisible'>" + next["hidden-text"] + "</span></a>");
				$nav.append($toggleRowNext.append($toggleButtonNext));
				// lets the user jump to the next tab by clicking on the NEXT button
				$toggleButtonNext.click(function () {
					selectNext($tabs, $panels, opts, true);
				});
				//End animation
				//
				//End NEXT button
				//
				$toggleRow = $("<li class='tabs-toggle'>");
				stop = {
					"class" : "tabs-stop",
					text : pe.dic.get('%stop'),
					"hidden-text" : pe.dic.get('%tab-rotation', 'disable')
				};
				start = {
					"class" : "tabs-start",
					text : pe.dic.get('%play'),
					"hidden-text" : pe.dic.get('%tab-rotation', 'enable')
				};
				$toggleButton = $("<a class='" + stop["class"] + "' href='javascript:;' role='button' aria-pressed='true'>" + stop.text + "<span class='wb-invisible'>" + stop["hidden-text"] + "</span></a>");
				$nav.append($toggleRow.append($toggleButton));
				$toggleRow.click(toggleCycle).bind("keydown", function (e) {
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
					$pbar = $("<div class=\"tabs-roller\">").hide().click(function () {
						return $(this).siblings("a").click();
					}).hover(function () {
						return $(this).css("cursor", "text");
					});
					if ($.browser.msie && $.browser.version < 8) {
						$(".tabs-style-2 .tabs, .tabs-style-2 .tabs li").css("filter", "");
					}
					return $(this).parent().append($pbar);
				});
				cycle($tabs, $panels, opts);
				if (!opts.autoPlay) {
					stopCycle();
				}
			}
			elm.find("a[href^=\"#\"]").each(function () {
				var anchor,
					hash;
				hash = $(this).attr("href");
				if (hash.length > 1) {
					anchor = $(hash, $panels);
					if (anchor.length) {
						//console.log("anchor found:", anchor, ", for link:", $(this));
						return $(this).click(function (e) {
							var panel,
								panelId;
							panel = anchor.parents("[role=\"tabpanel\"]:hidden");
							if (panel) {
								e.preventDefault();
								panelId = panel.attr("id");
								panel.parent().siblings(".tabs").find("a[href=\"#" + panelId + "\"]").click();
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