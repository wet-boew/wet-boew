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
				correctWidth,
				container;
			
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
				options.not(visibleOptions).addClass('al-hide').attr('aria-hidden', 'true');
				visibleOptions.removeClass('al-hide').attr('aria-hidden', 'false');

				if (visibleOptions.length !== 0) {
					autolist.removeClass('al-hide').attr('aria-hidden', 'false');
					elm.attr('aria-expanded', 'true');
				} else {
					autolist.addClass('al-hide').attr('aria-hidden', 'true');
					elm.attr('aria-expanded', 'false');
				}
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
				datalist_items.push('<li class="al-hide al-option" aria-hidden="true" id="al-option-' + index + '-' + index2 + '"><a href="javascript:;"><span class="al-value">' + (value !== 'undefined' ? value : "") + '</span><span class="al-label">' + (label !== 'undefined' ? label : "") + '</span></a></li>');
			});

			elm.attr({"role": "combobox", "aria-expanded": "false", "aria-autocomplete": "list", "aria-owns": "wb-autolist-" + index}).wrap('<div class="wb-al-container"/>');

			autolist = $('<ul role="listbox" id="wb-autolist-' + index + '" class="wb-autolist al-hide" aria-hidden="true">' + datalist_items.join('') + '</ul>');
			options = autolist.find('li');
			elm.after(autolist);
			correctWidth();
			
			elm.on('keyup keydown click vclick', function (e) {
				var type = e.type,
					keycode = e.keyCode,
					target = e.target,
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
							} else if (keycode === 38 || keycode === 40) { // up or down arrow 
								visible_options = options.filter(':not(.al-hide)').find('a');
								if (visible_options.length > 0) {
									index = visible_options.index(target);
									if (keycode === 38) { // up arrow
										dest = visible_options.last();
									} else { // down arrow
										dest = visible_options.eq(0);
									}
									pe.focus(dest);
									elm.attr('aria-activedescendent', dest.attr('id'));
								}
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
							showOptions('~!!@@#$');
							return false;
						} else if (keycode === 9 || keycode === 27) { // tab or escape key
							pe.focus(elm);
							showOptions('~!!@@#$');
							elm.removeAttr('aria-activedescendent');
							if (keycode === 27) {
								return false;
							}
						} else if (keycode === 38 || keycode === 40) { // up or down arrow 
							visible_options = options.filter(':not(.al-hide)').find('a');
							if (visible_options.length > 0) {
								index = visible_options.index(target);
								if (keycode === 38) { // up arrow
									dest = ((index - 1) === -1 ? visible_options.last() : visible_options.eq(index - 1));
								} else { // down arrow
									dest = ((index + 1) === visible_options.length ? visible_options.eq(0) : visible_options.eq(index + 1));
								}
								pe.focus(dest);
								elm.attr('aria-activedescendent', dest.attr('id'));
							}
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
					showOptions('~!!@@#$');
					pe.focus(elm);
				}
			});

			$(document).on("click touchstart", function (e) {
				if (!autolist.hasClass('al-hide') && !$(e.target).is(elm)) {
					showOptions('~!!@@#$');
					elm.removeAttr('aria-activedescendent');
				}
			});
		});
	};
	$('input[list]').datalist();
}(jQuery));