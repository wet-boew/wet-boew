/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*global jQuery: false, console: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.geomap_debug = {
		messages: {
			en: {
				debugMode: 'WET-Geomap: running in DEBUG mode',
				debugMess:'When running in debug mode Geomap will provide inline error and help messages and write useful debugging information into the console. Disable debug mode by removing the <em>debug</em> class.',
				overlayLoad: 'WET-Geomap: overlays were loaded successfully',
				overlayNotLoad: 'WET-Geomap: an error occurred while loading overlays',
				basemapDefault: 'WET-Geomap: using default basemap',
				projection: 'WET-Geomap: using projection',
				error: 'WET-Geomap ERROR',
				errorSelect: 'This cell has the <em>select</em> class but no link was found. Please add a link to this cell.',
				errorNoSelect: 'This table contains rows that do not have a cell with the <em>select</em> class. Please ensure that each row has exactly one cell with the <em>select</em> class and that the cell includes a link.',
				warning: 'WET-Geomap WARNING',
				warningLegend: 'No div element with a class of <em>wet-boew-geomap-legend</em> was found. If you require a legend either add a div with a class of <em>wet-boew-geomap-legend</em>.',
				overlayNotSpecify: 'WET-Geomap: overlays file not specified',
				baseMapMapOptionsLoadError: "WET-Geomap: an error occurred when loading the mapOptions in your basemap configuration. Please ensure that you have the following options set: maxExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), maxResolution (e.g. 'auto'), projection (e.g. 'EPSG:3978'), restrictedExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), units (e.g. 'm'), displayProjection: (e.g. 'EPSG:4269'), numZoomLevels: (e.g. 12).",
				warningTab: 'No class <em>tab</em> in wet-boew-geomap but a table has tab attribute set to true.'
			},
			fr: {
				debugMode: 'BOEW-Géocarte : mode débogage activé',
				debugMess:'Lors de l\'exécution en mode débogage Geomap donne des messages d\'erreur, des messages d\'aide et donneras de l\'information utile dans la console de débogage. Désactiver le mode débogage en supprimant la classe <em>debug</em>.',
				overlayLoad: 'BOEW-Géocarte : Les couches de superpositions ont été chargées avec succès',
				overlayNotLoad: 'BOEW-Géocarte : une erreur est survenue lors du chargement des couches de superpositions',
				basemapDefault: 'BOEW-Géocarte : la carte de base par défaut est utilisée',
				projection: 'BOEW-Géocarte : la projection utilisée est',
				error: 'BOEW-Géocarte ERREUR',
				errorSelect: 'Cette cellule a la classe <em>select</em> mais aucun lien n\'a été trouvé. S\'il vous plaît, ajouter un lien à cette cellule.',
				errorNoSelect: 'Cette table contient des lignes qui n\'ont pas de cellule avec la classe <em>select</em>. S\'il vous plaît, assurer vous que chaque ligne a exactement une cellule avec la classe <em>select</em> et celle-ci doit contenir un lien.',
				warning: 'BOEW-Geomap AVERTISSEMENT',
				warningLegend: 'Aucun élément div comportant une classe <em>wet-boew-geomap-legend</em> n\' été trouvé. Si vous avez besoin d\'une légende, vous pouvez ajouter un élément div avec une classe <em>wet-boew-geomap-legend</em> .',
				overlayNotSpecify: 'BOEW-Géocarte : fichier des couches de superpositions non spécifié',
				baseMapMapOptionsLoadError: 'BOEW-Géocarte : une erreur est survenue lors du chargement des options de configuration de votre carte de base. S\'il vous plaît, vérifiez que vous avez l\'ensemble des options suivantes: maxExtent (ex: \'-3000000,0, -800000,0, 4000000,0, 3900000,0\'), maxResolution (ex: \'auto\'), projection (ex: \'EPSG: 3978\'), restrictedExtent (ex: \'-3000000,0 , -800000,0, 4000000,0, 3900000,0\'), units (ex: \'m\'), displayProjection (ex: \'EPSG: 4269\'), numZoomLevels (ex: 12).',	
				warningTab: 'Il n\'y a pas de classe <em>tab</em> dans wet-boew-geomap mais une table a l\'attribut égal vrai.'
			}
		},
		init: function() {
			var messages = _pe.fn.geomap_debug.messages[_pe.language],
				$wb_main_in = $('#wb-main-in'),
				debugMode = messages.debugMode,
				msg_start = '<div class="module-attention span-8"><h3>',
				msg_middle = '</h3><p>',
				msg_end = '</p></div>',
				warning_start,
				error_start;

			if (typeof messages === 'undefined') {
				messages = _pe.fn.geomap_debug.messages.en;
			}
			warning_start = msg_start + messages.warning + msg_middle;
			error_start = '<div class="module-alert"><h3>' + messages.error + msg_middle;
			
			console.log(debugMode);
			$wb_main_in.prepend(msg_start + debugMode + msg_middle + messages.debugMess + msg_end);

			_pe.document.on('geomap-overlayLoad geomap-overlayNotLoad geomap-overlayNotSpecify geomap-warningLegend geomap-warningTab geomap-errorSelect geomap-errorNoSelect geomap-basemapDefault geomap-baseMapMapOptionsLoadError geomap-projection', function(e, param1) {
				var type = e.type;

				if (type === 'geomap-overlayLoad') {
					console.log(messages.overlayLoad);
				} else if (type === 'geomap-overlayNotLoad') {
					console.log(messages.overlayNotLoad);
				} else if (type === 'geomap-overlayNotSpecify') {
					console.log(messages.overlayNotSpecify);
				} else if (type === 'geomap-warningLegend') {
					$wb_main_in.prepend(warning_start + messages.warningLegend + msg_end);
				} else if (type === 'geomap-warningTab') {
					$wb_main_in.prepend(warning_start + messages.warningTab + msg_end);
				} else if (type === 'geomap-errorSelect') {
					param1.append(error_start + messages.errorSelect + msg_end);
				} else if (type === 'geomap-errorNoSelect') {
					param1.before(error_start + messages.errorNoSelect + msg_end);
				} else if (type === 'geomap-basemapDefault') {
					console.log(messages.basemapDefault);
				} else if (type === 'geomap-baseMapMapOptionsLoadError') {
					console.log(messages.baseMapMapOptionsLoadError);
				} else if (type === 'geomap-projection') {
					console.log(messages.projection + ' ' + param1);
				}
			});
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));