/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*
 * Pagination plugin / Plugiciel de pagination
 */
/*global wet_boew_pagination*/
(function($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* Local reference */
	_pe.fn.pagination = {
		type : 'plugin',
		depends : (['simplePagination']),
		_exec : function(elm) {
			var $items = elm.children('div'),
				pageCount = 0,
				opts,
				overrides,
				itemOverride;

			// Options
			opts = {
				itemsOnPage: 1,
				cssStyle: elm.hasClass('pagination-dark') ? 'pagination-dark' : 'pagination-accent',
				prevText: _pe.dic.get('%previous'),
				nextText: _pe.dic.get('%next'),
				displayedPages: 3,
				edges: 1,
				numberOfItemOnPage: 5,
				onPageClick: function(pageNumber) {
					$('.hide-page').hide();
					$("#page-"+pageNumber).show();
				},
				onInit: function(pageNumber) {
					$('.hide-page').hide();
					$("#page-1").show();
				}
			};


			// Class-based overrides
			itemOverride = elm.attr('class').match(/items-per-page-([0-9]*)/);

			overrides = {
				numberOfItemOnPage: itemOverride ? parseInt(itemOverride[1], 10) : opts.numberOfItemOnPage
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_lightbox), class-based overrides and the data-wet-boew attribute /
			$.extend(opts, (typeof wet_boew_pagination !== 'undefined' ? wet_boew_pagination : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			for (var i = 0, len = $items.length; i < len; i += opts.numberOfItemOnPage) {
				pageCount++;
				$items.slice(i, i + opts.numberOfItemOnPage).wrapAll("<div class='hide-page' id='page-" + pageCount + "'></div>");
			}

			opts.items = pageCount;

			//Add default pager, should look at options first
			elm.prepend('<div class="page-selector pagination-accent float-right">');

			elm.find('.page-selector').pagination($.extend({}, opts));

			return elm;
		} // end of exec

	};
	window.pe = _pe;
	return _pe;
}(jQuery));
