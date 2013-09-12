/*!
 *
 * Web Experience Toolkit (WET) / Bo�te � outils de l'exp�rience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Jaws WAI-ARIA fixes
 */

(function ($) {
	"use strict";
	var nodes = $('nav, section, article, aside, main').get(),
		node,
		headings = $('h1, h2, h3, h4, h5, h6').get(),
		heading,
		i,
		len = nodes.length,
		id,
		idPrefix = 'wb-h-aria-';

	// Use aria-labelledby to fix the Jaws sectioning element/heading element association bug
	for (i = 0; i !== len; i += 1) {
		node = nodes[i];
		heading = (node.firstElementChild || node.firstChild);
		if (heading.nodeName.match(/h[1-6]/i) !== null) {
			id = heading.id;
			if (id.length === 0) {
				id = idPrefix + i;
				heading.id = id;
			}
			node.setAttribute('aria-labelledby', id);
		}
	}

	// Use role="heading" and aria-level to fix the Jaws sectioning element/heading level bug
	len = headings.length;
	for (i = 0; i !== len; i += 1) {
		heading = headings[i];
		heading.setAttribute('role', 'heading');
		heading.setAttribute('aria-level', heading.nodeName.substring(1));
	}
}(jQuery));