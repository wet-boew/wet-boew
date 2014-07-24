/**
 * @title WET-BOEW Tables
 * @overview Integrates the DataTables plugin into WET providing searching, sorting, filtering, pagination and other advanced features for tables.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @andre-d
 */
(function( $, window, wb ) {
"use strict";

wb.plugin = {
	dependencies: [],
	idCount: 0,
	pluginName: "wb-baseplugin",
	initEvent: function() {
		return "wb-init" + this.selector();
	},
	selector: function() {
		return "." + this.pluginName;
	},
	initedClass: function() {
		return this.pluginName + "-inited";
	},
	eventInit: function(event) {
		var elm = event.target,
			elmId = elm.id,
			$elm, init;
		if ( event.currentTarget === elm &&
			elm.className.indexOf( this.initedClass() ) === -1 ) {
			wb.remove( this.selector() );
			elm.className += " " + this.initedClass();
			if ( !elmId ) {
				elmId = this.pluginName + "-id-" + this.idCount;
				this.idCount += 1;
				elm.id = elmId;
			}
			if ( !this.i18nText ) {
				this.i18nText = this.i18nTextSetup(wb.i18n);
			}
			$elm = $( elm );
			init = $.proxy(this.init, this, $elm);
			Modernizr.load({
				load: this.dependencies,
				complete: init
			});
		}
	},
	init: function() {},
	i18nTextSetup: function() {
		return {};
	},
	setup: function() {
		var eventInit = $.proxy(this.eventInit, this);
		wb.doc.on( "timerpoke.wb " + this.initEvent(), this.selector(), eventInit );
		wb.add( this.selector() );

	},
	extend: function(child) {
		var extended = {};
		$.extend(true, extended, this);
		if (child) {
			$.extend(true, extended, child);
		}
		extended.idCount = 0;
		return extended;
	}
};
wb.plugins = {};
})( jQuery, window, wb );
