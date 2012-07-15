/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Menu bar plugin
 */
/*global jQuery: false, pe:false */
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.menubar = {
		type : 'plugin',
		depends : (_pe.mobile ? [] : ['resize', 'equalheights', 'hoverintent', 'outside']),
		_exec : function (elm) {
			/*
			@notes: the mega menu will use custom events to better manage its events.
			.: Events :.
			- close : this will close open menu
			- reset : this will clear all the menu's to closed state
			- open : this will open the child menu item
			*/
			/* bind plugin scope element */
			if (pe.mobile) {
				return;
			}
			var $menu,
				$menuBoundary,
				$scope = elm,
				correctheight,
				gotosubmenu,
				hideallsubmenus,
				hidesubmenu,
				showsubmenu;

			/* functions that would be necessary for helpers */
			showsubmenu = function (toplink) {
				var _node,
					_sm;
				_node = $(toplink).closest("li");
				hideallsubmenus();
				_sm = _node.find(".mb-sm");
				_sm.attr("aria-expanded", "true").attr("aria-hidden", "false").toggleClass("mb-sm mb-sm-open");
				if ((Math.floor(_sm.offset().left + _sm.width()) - Math.floor($menuBoundary.offset().left + $menuBoundary.width())) >= -1) {
					_sm.css("right", "0px");
				}
				_node.addClass("mb-active");
				return;
			};
			/* action function to go to menu */
			gotosubmenu = function (toplink) {
				var _node, _sm;
				_node = $(toplink);
				_sm = _node.closest("li").find(".mb-sm-open");
				if (pe.cssenabled) {
					_sm.find("a").attr("tabindex", "0");
				}
				_node.trigger("item-next");
				return;
			};
			/* hidemenu worker function */
			hidesubmenu = function (toplink) {
				var _node,
					_sm;
				_node = $(toplink).closest("li");
				_sm = _node.find(".mb-sm-open");
				_sm.attr("aria-expanded", "false").attr("aria-hidden", "true").toggleClass("mb-sm mb-sm-open").css("right", "auto");
				if (pe.cssenabled) {
					_sm.find("a").attr("tabindex", "-1");
				}
				_node.removeClass("mb-active");
				return;
			};
			/* hide all the submenus */
			hideallsubmenus = function () {
				$menu.find(".mb-sm-open").each(function () {
					var _menu;
					_menu = $(this).closest("li");
					return hidesubmenu(_menu);
				});
				return;
			};
			/* function to correct the hieght of the menu on resize */
			correctheight = function () {
				var newouterheight, _lastmenuli;
				_lastmenuli = $menu.children("li:last");
				newouterheight = (_lastmenuli.offset().top + _lastmenuli.outerHeight()) - $scope.offset().top;
				return $scope.css("min-height", newouterheight);
			};
			/*
			/// End of Functions ///
			*/

			/* establish boundaries */
			$menuBoundary = $scope.children("div");
			$menu = $menuBoundary.children("ul");
			/* ARIA additions */
			$scope.attr("role", "application");
			$menu.attr("role", "menubar").find("a").attr("role", "menuitem");
			pe.resize(correctheight);
			/* Handles opening and closing of a submenu on click of a menu bar item
			   but prevents any changes on click of the empty area in the submenu */
			$scope.find('.mb-sm').on("click vclick", function (event) {
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
			}).parent().find('> :header a').on("click vclick", function (event) {
				if ($(this).closest("li").hasClass("mb-active")) {
					hidesubmenu(this);
				} else {
					showsubmenu(this);
				}
				return false;
			});

			/* bind all custom events and triggers to menu */
			$scope.on("keydown focusin section-next section-previous item-next item-previous close", "li", function (e) {
				var next,
					_elm = $(e.target),
					_activemenu = $scope.find('.mb-active'),
					_id,
					keychar,
					sublink,
					elmtext,
					matches,
					match,
					level;
				_id = $.map(/\bknav-(\d+)-(\d+)-(\d+)/.exec(_elm.attr('class')), function (n) {
					return parseInt(n, 10);
				});
				if (e.type === "keydown") {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						switch (e.keyCode) {
						case 13: // enter key
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
								return false;
							}
							break;
						case 27: // escape key
							_elm.trigger('close');
							return false;
						case 32: // spacebar
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
							} else {
								window.location = _elm.attr('href');
							}
							return false;
						case 37: // left arrow
							_elm.trigger('section-previous');
							return false;
						case 38: // up arrow
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
							} else {
								_elm.trigger('item-previous');
							}
							return false;
						case 39: // right arrow
							_elm.trigger('section-next');
							return false;
						case 40: // down arrow
							if (_id[2] === 0 && _id[3] === 0) {
								gotosubmenu(e.target);
							} else {
								_elm.trigger('item-next');
							}
							return false;
						default:
							// 0 - 9 and a - z keys
							if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
								keychar = String.fromCharCode(e.keyCode).toLowerCase();
								sublink = (_id[2] !== 0 || _id[3] !== 0);
								elmtext = _elm.text();
								matches = _activemenu.find('.mb-sm-open a').filter(function () {
									return ($(this).text().substring(0, 1).toLowerCase() === keychar || (sublink && $(this).text() === elmtext));
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
				} else if (e.type === "close") {
					pe.focus(_activemenu.find(".knav-" + _id[1] + "-0-0"));
					setTimeout(function () {
						return hideallsubmenus();
					}, 5);
				} else if (e.type === "section-previous") {
					level = !!_id[2] << 1 | !!_id[3];
					switch (level) {
					case 0: // top-level menu link has focus
					case 1: // 3rd level menu link has focus, but the popup menu doesn't have sub-sections
						next = $scope.find(".knav-" + (_id[1] - 1) + "-0-0");
						if (next.length > 0) {
							pe.focus(next);
						} else {
							pe.focus($scope.find('ul.mb-menu > li:last').find('a:eq(0)')); // wrap around at the top level
						}
						break;
					case 2: // sub-section link has focus
					case 3: // 3rd level link (child of a sub-section) has focus
						next = _activemenu.find(".knav-" + (_id[1]) + "-" + (_id[2] - 1) + "-0");
						if (next.length > 0 && _id[2] > 1) {
							pe.focus(next);
						} else {
							next = $scope.find(".knav-" + (_id[1] - 1) + "-0-0"); // wrap around at the sub-section level
							if (next.length > 0) {
								pe.focus(next);
							} else {
								pe.focus($scope.find('ul.mb-menu > li:last').find('a:eq(0)')); // wrap around at the top level
							}
						}
						break;
					}
				} else if (e.type === "section-next") {
					level = !!_id[2] << 1 | !!_id[3];
					switch (level) {
					case 0: // top-level menu link has focus
					case 1: // 3rd level menu link has focus, but the popup menu doesn't have sub-sections
						next = $scope.find(".knav-" + (_id[1] + 1) + "-0-0");
						if (next.length > 0) {
							pe.focus(next);
						} else {
							pe.focus($scope.find(".knav-0-0-0")); // wrap around at the top level
						}
						break;
					case 2: // sub-section link has focus
					case 3: // 3rd level link (child of a sub-section) has focus
						next = _activemenu.find(".knav-" + (_id[1]) + "-" + (_id[2] + 1) + "-0");
						if (next.length > 0) {
							pe.focus(next);
						} else {
							next = $scope.find(".knav-" + (_id[1] + 1) + "-0-0"); // wrap around at the sub-section level
							if (next.length > 0) {
								pe.focus(next);
							} else {
								pe.focus($scope.find(".knav-0-0-0")); // wrap around at the top level
							}
						}
						break;
					}
				} else if (e.type === "item-next") {
					next = _activemenu.find(".knav-" + _id[1] + "-" + (_id[2]) + "-" + (_id[3] + 1)); // move to next item
					if (next.length > 0) {
						pe.focus(next);
					} else {
						next = _activemenu.find(".knav-" + _id[1] + "-" + (_id[2] + 1) + "-0"); // move to next section
						if (next.length > 0) {
							pe.focus(next);
						} else {
							pe.focus(_activemenu.find(".knav-" + _id[1] + "-1-0, .knav-" + _id[1] + "-0-1,")); // move to first item in the submenu
						}
					}
				} else if (e.type === "item-previous") {
					next = ((_id[2] > 0 || _id[3] > 1) ? _activemenu.find(".knav-" + _id[1] + "-" + (_id[2]) + "-" + (_id[3] - 1)) : ''); // move to previous item
					if ((_id[2] > 0 || _id[3] > 1) && next.length > 0) {
						pe.focus(next);
					} else {
						next = ((_id[2] > 1 || _id[3] > 0) ? _activemenu.find("[class*='knav-" + _id[1] + "-" + (_id[2] - 1) + "-']").last() : ''); // move to last item of the previous section
						if ((_id[2] > 1 || _id[3] > 0) && next.length > 0) {
							pe.focus(next);
						} else {
							pe.focus(_activemenu.find("[class*='knav-']").last()); // move to last item in the submenu
						}
					}
				} else if (e.type === "focusin" && _id[2] === 0 && _id[3] === 0) {
					hideallsubmenus();
					if (_elm.find('.expandicon').length > 0) {
						showsubmenu(e.target);
					}
				}
			});
			$(document).on("click touchstart", function () {
				$scope.trigger("focusoutside");
			});
			$scope.on("focusoutside", function () {
				return hideallsubmenus();
			});

			/* [Main] parse mega menu and establish all ARIA and Navigation classes */
			$scope.find('ul.mb-menu > li').find('a:eq(0)').each(function (index, value) {
				var $childmenu, $elm;
				$elm = $(value);
				$elm.addClass("knav-" + index + "-0-0");
				$childmenu = $elm.closest("li").find(".mb-sm");
				if ($childmenu.size() > 0) {
					$elm.attr("aria-haspopup", "true").addClass("mb-has-sm").wrapInner("<span class=\"expandicon\"><span class=\"sublink\"></span></span>");
					$childmenu.attr("role", "menu").attr("aria-expanded", "false").attr("aria-hidden", "true").find(":has(:header) ul").attr("role", "menu");
					$elm.append("<span class=\"wb-invisible\">" + (pe.dic.get('%sub-menu-help')) + "</span>");
					$elm.closest("li").hoverIntent({
						over: function () {
							return showsubmenu(this);
						},
						out: function () {
							return hidesubmenu(this);
						},
						timeout: 500
					});
					/* now recurse all focusable to be able to navigate */
					$childmenu.find("h3 a, h4 a").each(function (i) {
						$(this).addClass("knav-" + index + "-" + (i + 1) + "-0");
						$(this).parent().next("ul").find("a").each(function (j) {
							$(this).addClass("knav-" + index + "-" + (i + 1) + "-" + (j + 1));
							return;
						});
						return;
					});
					$childmenu.find("> ul a, > div > ul a").each(function (i) {
						$(this).addClass("knav-" + index + "-0-" + (i + 1));
					});
				}
			});

			/* if CSS is enabled we want to ensure a correct tabbing response */
			if (pe.cssenabled) {
				$scope.find(".mb-sm a").attr("tabindex", "-1");
			}
			correctheight();
			return $scope;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
