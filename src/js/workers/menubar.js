/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Menu bar plugin
 */
/*jshint bitwise: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.menubar = {
		type : 'plugin',
		depends : (_pe.mobile ? [] : ['hoverintent']),
		ignoreMenuBarClicks : false,
		_exec : function (elm) {
			/*
			@notes: the mega menu will use custom events to better manage its events.
			.: Events :.
			- close : this will close open menu
			- reset : this will clear all the menu's to closed state
			- open : this will open the child menu item
			*/
			/* bind plugin scope element */
			if (_pe.mobile) {
				return;
			}
			var $menu,
				$menuBoundary,
				$scope = elm,
				$elms,
				elmslen,
				$scopeParent = $scope.parent(),
				correctheight,
				hidesubmenu,
				showsubmenu,
				submenuHelp = _pe.dic.get('%sub-menu-help');

			/* functions that would be necessary for helpers */
			showsubmenu = function (toplink) {
				var _node = $(toplink).closest('li'),
					_sm = _node.find('.mb-sm');
				if (_sm.length !== 0) {
					hidesubmenu();
					_sm.attr({'aria-expanded':'true', 'aria-hidden':'false'}).toggleClass('mb-sm mb-sm-open').find('a').attr('tabindex', '0');
					if (_pe.rtl) {
						if ((Math.floor(_sm.offset().left) - Math.floor($menuBoundary.offset().left)) <= 0) {
							_sm.css('left', '0');
						}
					} else {
						if ((Math.floor(_sm.offset().left + _sm.width()) - Math.floor($menuBoundary.offset().left + $menuBoundary.width())) >= -1) {
							_sm.css('right', '0');
						}
					}
					_node.addClass('mb-active');
				}
				return;
			};
			/* hidemenu worker function */
			hidesubmenu = function (toplink) {
				var _sm = toplink === undefined ? $menu.find('.mb-sm-open') : $(toplink).find('.mb-sm-open');
				_sm.attr({'aria-expanded':'false', 'aria-hidden':'true'}).toggleClass('mb-sm mb-sm-open').css('right', '');
				if (_pe.cssenabled) {
					_sm.find('a').attr('tabindex', '-1');
				}
				return _sm.closest('li').removeClass('mb-active');
			};
			/* function to correct the height of the menu on resize */
			correctheight = function () {
				var _lastmenuli = $menu.children('li:last'),
					newouterheight = (_lastmenuli.offset().top + _lastmenuli.outerHeight()) - $scope.offset().top;
				return $scope.css('min-height', newouterheight);
			};
			/*
			/// End of Functions ///
			*/

			/* establish boundaries */
			$menuBoundary = $scope.children('div');
			$menu = $menuBoundary.children('ul');

			/* Detach $scope to minimize reflow while enhancing the menu */
			$scope.detach();

			/* ARIA additions */
			$scope.find('> div > ul').attr('role', 'menubar');
			_pe.resize(correctheight);

			/* [Main] parse mega menu and establish all ARIA and Navigation classes */
			$elms = $scope.find('ul.mb-menu > li').find('a:eq(0)');
			elmslen = $elms.length;
			$elms.each(function (index, value) {
				var $elm = $(value).addClass('knav-' + index + '-0-0').attr({'role': 'menuitem', 'aria-posinset': (index + 1), 'aria-setsize': elmslen}),
					$childmenu = $elm.closest('li').find('.mb-sm'),
					$nodes,
					$node,
					nodeName,
					$link,
					link,
					links,
					i,
					j,
					len,
					len2,
					itemnum;
				if ($childmenu.length > 0) {
					$elm.attr('aria-haspopup', 'true').addClass('mb-has-sm').attr('href', '#').wrapInner('<span class="expandicon"><span class="sublink"></span></span>');
					$childmenu.attr({'role': 'menu', 'aria-expanded': 'false', 'aria-hidden': 'true'}).find(':has(:header) ul').attr('role', 'menu');
					$elm.append('<span class="wb-invisible"> ' + submenuHelp + '</span>');
					$elm.closest('li').hoverIntent({
						over: function () {
							return showsubmenu(this);
						},
						out: function () {
							return hidesubmenu(this);
						},
						timeout: 500
					});
					/* now recurse all focusable to be able to navigate */
					$nodes = $childmenu.find('h3, h4, div.top-level, li.top-level, div.mb-main-link');
					for (i = 0, len = $nodes.length; i !== len; i += 1) {
						$node = $nodes.eq(i);
						nodeName = $node[0].nodeName.toLowerCase();
						$link = $node.children('a');
						itemnum = i + 1;
						if ($link.length !== 0) {
							$link.addClass('knav-' + index + '-' + itemnum + '-0');
						} else {
							$node.addClass('no-link');
							$link = $node;
						}
						$link.attr({'role': 'menuitem', 'aria-posinset': itemnum, 'aria-setsize': len});

						if (nodeName === 'h3' || nodeName === 'h4') {
							$node.children('a').attr('aria-haspopup', 'true');
							links = $node.next('ul').find('a').get();
							for (j = 0, len2 = links.length; j !== len2; j += 1) {
								link = links[j];
								itemnum = j + 1;
								link.className += ' knav-' + index + '-' + (i + 1) + '-' + (j + 1);
								link.setAttribute('role', 'menuitem');
								link.setAttribute('aria-posinset', itemnum);
								link.setAttribute('aria-setsize', len2);
							}
						}
					}
					links = $childmenu.find('> ul li, > div > ul li').filter(':not(.top-level)').children('a').get();
					for (i = 0, len = links.length; i !== len; i += 1) {
						link = links[i];
						itemnum = i + 1;
						link.className += ' knav-' + index + '-0-' + (i + 1);
						link.setAttribute('role', 'menuitem');
						link.setAttribute('aria-posinset', itemnum);
						link.setAttribute('aria-setsize', len);
					}
				}
			});

			/* if CSS is enabled we want to ensure a correct tabbing response */
			if (_pe.cssenabled) {
				$scope.find('.mb-sm a').attr('tabindex', '-1');
			}

			// Reattach $scope now that enhancements are complete
			$scope.appendTo($scopeParent);

			// Adjust the height
			correctheight();

			// Handles opening and closing of a submenu on click of a menu bar item but prevents any changes on click of the empty area in the submenu
			$scope.on('click vclick touchstart focusin', function (event) {
				var button = event.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}
				}
			}).parent().on('click vclick touchstart mouseenter mouseleave', '> :header a', function (e) {
				var type = e.type,
					button = e.button;
				switch (type) {
				case 'mouseenter':
					_pe.fn.menubar.ignoreMenuBarClicks = true;
					break;
				case 'mouseleave':
					_pe.fn.menubar.ignoreMenuBarClicks = false;
					break;
				default:
					if ($(this).closest('li').hasClass('mb-active')) {
						if (type !== 'click' || ((typeof button === 'undefined' || button === _pe.leftMouseButton) && !_pe.fn.menubar.ignoreMenuBarClicks)) { // Ignore clicks on the menu bar if menu opened by hover or if middle or right button click
							hidesubmenu(this);
						}
					} else {
						showsubmenu(this);
					}
					return false;
				}
			});

			/* bind all custom events and triggers to menu */
			$scope.on('keydown focusin section-next section-previous item-next item-previous close', 'li', function (e) {
				var next,
					prev,
					target = e.target,
					_elm = $(target),
					_activemenu = $scope.find('.mb-active'),
					_id = $.map(/\bknav-(\d+)-(\d+)-(\d+)/.exec(_elm.attr('class')), function (n) {
						return parseInt(n, 10);
					}),
					keyCode = e.keyCode,
					type = e.type,
					keychar,
					sublink,
					elmtext,
					matches,
					match,
					level = !!_id[2] << 1 | !!_id[3],
					i,
					len;
				switch (type) {
				case 'keydown':
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						switch (keyCode) {
						case 13: // enter key
						case 32: // spacebar
							if (level === 0 && _elm.attr('aria-haspopup') === 'true') {
								_elm.trigger('item-next');
							} else {
								window.location = _elm.attr('href');
							}
							return false;
						case 27: // escape key
							_elm.trigger('close');
							return false;
						case 37: // left arrow
							_elm.trigger('section-previous');
							return false;
						case 38: // up arrow
							if (level === 0) {
								_elm.trigger('item-next');
							} else {
								_elm.trigger('item-previous');
							}
							return false;
						case 39: // right arrow
							_elm.trigger('section-next');
							return false;
						case 40: // down arrow
							_elm.trigger('item-next');
							return false;
						default:
							// 0 - 9, a - z keys, punctuation and symbols
							if ((keyCode > 47 && keyCode < 91) || (keyCode > 95 && keyCode < 112) || (keyCode > 185 && keyCode < 223))  {
								keychar = String.fromCharCode(keyCode).toLowerCase();
								sublink = (_id[2] !== 0 || _id[3] !== 0);
								elmtext = _elm.text();
								matches = _activemenu.find('.mb-sm-open a').filter(function () {
									var $this = $(this);
									return ($this.text().substring(0, 1).toLowerCase() === keychar || (sublink && $this.text() === elmtext));
								});
								if (matches.length !== 0) {
									if (sublink) {
										match = matches.length;
										for (i = 0, len = match; i !== len; i += 1) {
											if (matches.eq(i).text() === elmtext) {
												match = i;
												break;
											}
										}
										if (match < (matches.length - 1)) {
											_pe.focus(matches.eq(match + 1));
											return false;
										}
									}
									_pe.focus(matches.eq(0));
								}
								return false;
							}
							break;
						}
					}
					break;
				case 'close':
					if (level === 0) { // top-level menu link has focus so close menus and put focus after menu bar
						_pe.focus(_pe.main.find('#wb-cont').attr('tabindex', '-1'));
					} else { // submenu link has focus so close menu and put focus on the parent menu bar link
						_pe.focus(_activemenu.find('.knav-' + _id[1] + '-0-0'));
					}
					setTimeout(function () {
						return hidesubmenu();
					}, 5);
					break;
				case 'section-previous':
					switch (level) {
					case 0: // top-level menu link has focus
					case 1: // 3rd level menu link has focus, but the popup menu doesn't have sub-sections
						prev = $scope.find('.knav-' + (_id[1] - 1) + '-0-0');
						if (prev.length > 0) {
							_pe.focus(prev);
						} else {
							_pe.focus($scope.find('ul.mb-menu > li:last').find('a:eq(0)')); // wrap around at the top level
						}
						break;
					case 2: // sub-section link has focus
					case 3: // 3rd level link (child of a sub-section) has focus
						prev = _activemenu.find('.knav-' + (_id[1]) + '-' + (_id[2] - 1) + '-0, .knav-' + (_id[1]) + '-' + (_id[2] - 1) + '-1').first();
						if (prev.length > 0 && _id[2] > 1) {
							_pe.focus(prev);
						} else {
							prev = $scope.find('.knav-' + (_id[1] - 1) + '-0-0'); // wrap around at the sub-section level
							if (prev.length > 0) {
								_pe.focus(prev);
							} else {
								_pe.focus($scope.find('ul.mb-menu > li:last').find('a:eq(0)')); // wrap around at the top level
							}
						}
						break;
					}
					break;
				case 'section-next':
					switch (level) {
					case 0: // top-level menu link has focus
					case 1: // 3rd level menu link has focus, but the popup menu doesn't have sub-sections
						next = $scope.find('.knav-' + (_id[1] + 1) + '-0-0');
						if (next.length > 0) {
							_pe.focus(next);
						} else {
							_pe.focus($scope.find('.knav-0-0-0')); // wrap around at the top level
						}
						break;
					case 2: // sub-section link has focus
					case 3: // 3rd level link (child of a sub-section) has focus
						next = _activemenu.find('.knav-' + (_id[1]) + '-' + (_id[2] + 1) + '-0, .knav-' + (_id[1]) + '-' + (_id[2] + 1) + '-1').first();
						if (next.length > 0) {
							_pe.focus(next);
						} else {
							next = $scope.find('.knav-' + (_id[1] + 1) + '-0-0'); // wrap around at the sub-section level
							if (next.length > 0) {
								_pe.focus(next);
							} else {
								_pe.focus($scope.find('.knav-0-0-0')); // wrap around at the top level
							}
						}
						break;
					}
					break;
				case 'item-next':
					if (level === 0) {
						showsubmenu(target);
					}
					next = _activemenu.find('.knav-' + _id[1] + '-' + (_id[2]) + '-' + (_id[3] + 1)); // move to next item
					if (next.length === 0) {
						next = _activemenu.find('.knav-' + _id[1] + '-' + (_id[2] + 1) + '-0, .knav-' + _id[1] + '-' + (_id[2] + 1) + '-1').first(); // move to next section
					}
					if (next.length !== 0) {
						_pe.focus(next);
					} else {
						_pe.focus(_activemenu.find('.knav-' + _id[1] + '-0-1, .knav-' + _id[1] + '-1-0, .knav-' + _id[1] + '-1-1').first()); // move to first item in the submenu
					}
					break;
				case 'item-previous':
					prev = (level === 3 || (level === 1 && _id[3] > 1) ? _activemenu.find('.knav-' + _id[1] + '-' + (_id[2]) + '-' + (_id[3] - 1)) : ''); // move to previous item
					if (prev.length === 0) {
						prev = (_id[2] !== 0 ? _activemenu.find('a').filter('[class*="knav-' + _id[1] + '-' + (_id[2] - 1) + '-"]:not(.knav-' + _id[1] + '-0-0)').last() : ''); // move to last item of the previous section
					}
					if (prev.length !== 0) {
						_pe.focus(prev);
					} else {
						_pe.focus(_activemenu.find('[class*="knav-"]').last()); // move to last item in the submenu
					}
					break;
				case 'focusin':
					if (level === 0) {
						hidesubmenu();
						if (_elm.find('.expandicon').length > 0) {
							showsubmenu(e.target);
						}
					}
					break;
				}
			});
			_pe.document.on('touchstart focusin', function () {
				return hidesubmenu();
			});

			return $scope;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
