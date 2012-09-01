/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Datalist polyfill (Autocomplete for text input fields)
 * @author: Paul Jackson (TBS)
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	$.fn.datalist = function () {
		return $(this).each(function (index) {
			var elm = $(this),
				$datalist = $('#' + elm.attr('list')),
				autolist,
				options,
				datalist_items = [],
				showOptions,
				closeOptions,
				correctWidth,
				container;
			
			showOptions = function (string) {
				var comparator, visibleOptions;

				if (string.length !== 0) {
					comparator = string.toLowerCase();
					visibleOptions = options.filter(function () {
						var $this = $(this),
							value = $this.find('span.al-value').html();
						if (value.length === 0) {
							value = $this.find('span.al-label').html();
						}
						return (comparator.length === 0 || value.toLowerCase().indexOf(comparator) === 0);
					});
				} else {
					visibleOptions = options;
				}

				autolist.empty().append(visibleOptions); // Add the visible options to the autolist

				if (visibleOptions.length !== 0) {
					autolist.removeClass('al-hide');
					elm.attr('aria-expanded', 'true');
				} else {
					autolist.addClass('al-hide');
					elm.attr('aria-expanded', 'false');
				}
			};
		
			closeOptions = function () {
				autolist.addClass('al-hide').empty();
				elm.attr({'aria-expanded': 'false', 'aria-activedescendent': ''});
			};

			correctWidth = function () {
				autolist.css('width', elm.innerWidth());
				if (pe.ie > 0 && pe.ie < 8) {
					autolist.css('top', elm.innerHeight() + 13);
				}
			};

			pe.resize(correctWidth);

			$datalist.find('option').each(function (index2) {
				var $this = $(this),
					value = $this.attr('value'),
					label = $this.attr('label');
				if (value === 'undefined') {
					value = $this.text();
				}	
				datalist_items.push('<li class="al-option" id="al-option-' + index + '-' + index2 + '"><a href="javascript:;"><span class="al-value">' + (value !== 'undefined' ? value : "") + '</span><span class="al-label">' + (label !== 'undefined' ? label : "") + '</span></a></li>');
			});

			elm.attr({'autocomplete': 'off', 'role': 'textbox', 'aria-haspopup': 'true', 'aria-autocomplete': 'list', 'aria-owns': 'wb-autolist-' + index, 'aria-activedescendent': ''}).wrap('<div class="wb-al-container" role="application"/>');
			container = elm.parent();
			autolist = $('<ul role="listbox" id="wb-autolist-' + index + '" class="wb-autolist al-hide" aria-hidden="true" aria-live="polite"></ul>');
			options = $(datalist_items.join(''));
			elm.after(autolist);
			correctWidth();
			
			elm.on('keyup keydown click vclick touchstart focus', function (e) {
				var type = e.type,
					keycode = e.keyCode,
					dest;
				if (type === 'keyup') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if ((keycode > 47 && keycode < 58) || (keycode > 64 && keycode < 91) || keycode === 32 || keycode === 8) { // Number keys, letter keys, spacebar or backspace
							showOptions(elm.val());
						}
					}
				} else if (type === 'keydown') {
					if (!(e.ctrlKey || e.metaKey)) {
						if (!e.altKey && !autolist.hasClass('al-hide')) {
							if (keycode === 27) { // escape key
								closeOptions();
								return false;
							} else if ((keycode === 38 || keycode === 40) && elm.attr('aria-activedescendent') === "") { // up or down arrow (aria-activedescendent check for IE7)
								if (keycode === 38) { // up arrow
									dest = autolist.find('a').last();
								} else { // down arrow
									dest = autolist.find('a').eq(0);
								}
								elm.attr('aria-activedescendent', dest.parent().attr('id'));
								pe.focus(dest);
								return false;
							}
						} else {
							if (keycode === 38 || keycode === 40) { // up or down arrow (with or without alt)
								showOptions('');
								return false;
							}
						}
					}
				} else if (type === 'click' || type === 'vclick') {
					if (!autolist.hasClass('al-hide')) {
						closeOptions();
					} else {
						showOptions('');
					}
					return false;
				} else if (type === 'focus' && pe.ie > 0 && pe.ie < 8) {
					autolist.addClass('al-hide').empty();
				}
			});

			autolist.on('keyup keydown click vclick touchstart', 'a, span', function (e) {
				var type = e.type,
					keycode = e.keyCode,
					target = $(e.target),
					visible_options,
					index,
					dest,
					val = elm.val(),
					value;
				if (type === 'keyup') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if ((keycode > 47 && keycode < 58) || (keycode > 64 && keycode < 91) || keycode === 32) { // Number keys, letter keys or spacebar
							elm.val(val + String.fromCharCode(keycode));
							pe.focus(elm);
							showOptions(elm.val());
						} else if (keycode === 8) { // Backspace
							if (elm.val().length > 0) {
								elm.val(val.substring(0, val.length - 1));
								showOptions(elm.val());
							}
							pe.focus(elm);
						}
					}
				} else if (type === 'keydown') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if (keycode === 13) { // enter key
							value = target.find('span.al-value').html();
							if (value.length === 0) {
								value = target.find('span.al-label').html();
							}
							elm.val(value);
							pe.focus(elm);
							closeOptions();
							return false;
						} else if (keycode === 9 || keycode === 27) { // escape key
							pe.focus(elm);
							closeOptions();
							return false;
						} else if (keycode === 38 || keycode === 40) { // up or down arrow 
							visible_options = autolist.find('a');
							if (visible_options.length !== 0) {
								index = visible_options.index(target);
								if (keycode === 38) { // up arrow
									dest = ((index - 1) === -1 ? visible_options.last() : visible_options.eq(index - 1));
								} else { // down arrow
									dest = ((index + 1) === visible_options.length ? visible_options.eq(0) : visible_options.eq(index + 1));
								}
								elm.attr('aria-activedescendent', dest.parent().attr('id'));
								pe.focus(dest);
							}
							return false;
						}
					}
				} else if (type === 'click' || type === 'vclick' || type === 'touchstart') {
					if (!target.hasClass('al-option')) {
						target = target.parent();
					}
					value = target.find('span.al-value').html();
					if (value.length === 0) {
						value = target.find('span.al-label').html();
					}
					elm.val(value);
					pe.focus(elm);
					closeOptions();
				}
			});

			$(container).on("focusoutside", function (e) {
				closeOptions();
			});

			$(document).on("click vclick touchstart", function (e) {
				if (!autolist.hasClass('al-hide') && !$(e.target).is(elm)) {
					closeOptions();
				}
			});
		});
	};
	$('input[list]').datalist();
}(jQuery));