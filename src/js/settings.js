/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
WET-BOEW-Settings
 */
var wet_boew_properties = {
	/** global plugins are called via an array of dependency names **/
	globals : ['deselectradio', 'datemodified']
};

/*
Global overrides for individual components
 */

// Share widget
var wet_boew_share = {
	sites : ['del.icio.us', 'digg', 'facebook', 'google', 'linkedin', 'reddit', 'stumbleupon', 'twitter', 'yahoobuzz']
};

// Chart and graph
var wet_boew_charts = {
	preset: {
		donnut: {
			// Donnut setting
			type: 'pie',
			height: 250,
			percentlegend: true,
			pieinnerradius: 45,
			pietilt: 50,
			piehoverable: true,
			decimal: 1,
			piethreshold: 8,
			legendinline: true,
			piestartangle: 100
		},
		usnumber: {
			getcellvalue: function(elem){
				return $(elem).text().match(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/);
			}
		},
		germannumber: {
			getcellvalue: function(elem){
				return $(elem).text().match(/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/);
			}
		}
	}
}