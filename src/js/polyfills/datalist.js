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
				showOptions;
			
			showOptions = function (string) {
				var comparator = string.toLowerCase(),
					visibleOptions = options.filter(function () {
						var $this = $(this),
							value = $this.find('span.al-value').html();
						if (value.length === 0) {
							value = $this.find('span.al-label').html();
						}
						return (comparator.length === 0 || value.toLowerCase().indexOf(comparator) === 0);
					});
				options.not(visibleOptions).addClass('al-hide');
				visibleOptions.removeClass('al-hide');
				if (visibleOptions.length !== 0) {
					autolist.removeClass('al-hide');
					elm.attr('aria-expanded', 'true');
				} else {
					autolist.addClass('al-hide');
					elm.attr('aria-expanded', 'false');
				}
			};

			correctWidth = function () {
				autolist.css('min-width', elm.innerWidth());
			}

			pe.resize(correctWidth);

			$datalist.find('option').each(function (index2) {
				var $this = $(this),
					value = $this.attr('value'),
					label = $this.attr('label');
				if (value === 'undefined') {
					value = $this.text();
				}	
				datalist_items.push('<li class="al-hide al-option" tabindex="-1" id="al-option-' + index + '-' + index2 + '"><span class="al-value">' + (value !== 'undefined' ? value : "") + '</span><span class="al-label">' + (label !== 'undefined' ? label : "") + '</span></li>');
			});

			elm.attr({"role": "combobox", "aria-expanded": "false", "aria-autocomplete": "list", "aria-owns": "wb-autolist-" + index});
			autolist = $('<ul role="listbox" id="wb-autolist-' + index + '" class="wb-autolist al-hide">' + datalist_items.join('') + '</ul>').css('min-width', elm.innerWidth());
			options = autolist.find('li');
			elm.after(autolist);

			elm.on('keyup keydown click vclick', function (e) {
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
						if (!e.altKey && elm.attr('aria-expanded') === "true") {
							if (keycode === 9 || keycode === 27) { // tab or escape key
								showOptions('~!!@@#$');
								elm.removeAttr('aria-activedescendent');
								if (keycode === 27) {
									return false;
								}
							} else if (keycode === 38) { // up arrow
								dest = options.filter(':not(.al-hide)').last();
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
								return false;
							} else if (keycode === 40) { // down arrow
								dest = options.filter(':not(.al-hide)').eq(0).last();
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
								return false;
							} else if (keycode === 38 || keycode === 40) { // up or down arrow (with or without alt)
								showOptions('');
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
					if (elm.attr('aria-expanded') === "true") {
						showOptions('~!!@@#$');
					} else {
						showOptions('');
					}
					return false;
				}
			});

			autolist.on('keyup keydown click vclick', 'li, span', function (e) {
				var type = e.type,
					keycode = e.keyCode,
					target = $(e.target),
					dest,
					val = elm.val(),
					value;
				if (type === 'keyup') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if ((keycode > 47 && keycode < 58) || (keycode > 64 && keycode < 91) || keycode === 32 || keycode === 8) { // Number keys, letter keys, spacebar or backspace
							pe.focus(elm);
							showOptions(elm.val());
						} else if (keycode === 8 && elm.val().length > 0) {
							elm.val(val.substring(0, val.length - 1));
							pe.focus(elm);
							showOptions(elm.val());
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
							showOptions('~!!@@#$');
							return false;
						} else if (keycode === 9 || keycode === 27) { // tab or escape key
							pe.focus(elm);
							showOptions('~!!@@#$');
							elm.removeAttr('aria-activedescendent');
							if (keycode === 27) {
								return false;
							}
						} else if (keycode === 38) { // up arrow
							dest = target.prev();
							if (dest.length > 0) {
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
							} else {
								dest = options.last();
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
							}
							return false;
						} else if (keycode === 40) { // down arrow
							dest = target.next();
							if (dest.length > 0) {
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
							} else {
								dest = options.eq(0);
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
							}
							return false;
						} else if (keycode === 38 || keycode === 40) { // up or down arrow (with or without alt)
							showOptions('');
							return false;
						}
					}
				} else if (type === 'click' || type === 'vclick') {
					if (!target.hasClass('al-option')) {
						target = target.parent();
					}
					value = target.find('span.al-value').html();
					if (value.length === 0) {
						value = target.find('span.al-label').html();
					}
					elm.val(value);
					pe.focus(elm);
					showOptions('~!!@@#$');
					return false;
				}
			});

			$(document).on("click touchstart", function () {
				if (elm.attr('aria-expanded') === "true") {
					showOptions('~!!@@#$');
					elm.removeAttr('aria-activedescendent');
				}
			});
		});
	};
	$('input[list]').datalist();
}(jQuery));