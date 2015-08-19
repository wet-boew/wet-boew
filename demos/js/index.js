/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*global jQuery: false*/
(function ($) {
	"use strict";
	$('#wb-main-in #rde a').each(function () {
		var $this = $(this),
			url = window.location.href;
		$this.attr('href', $this.attr('href') + '?' + url.substring(0, url.lastIndexOf('/') + 1) + $this.attr('data-url'));
	});
}(jQuery));
