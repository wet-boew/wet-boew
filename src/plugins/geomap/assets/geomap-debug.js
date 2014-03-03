/*
 * @title WET-BOEW Geomap debug
 * @overview Debug messages for Geomap
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, wb ) {
"use strict";

var	$document = wb.doc,
	$wbMainIn, warningStart, errorStart, msgEnd, messages,
	debugMessages = {
		en: {
			debugMode: "WET-Geomap: running in DEBUG mode",
			debugMess: "When running in debug mode Geomap will provide inline error and help messages and write useful debugging information into the console. Disable debug mode by removing the <em>debug</em> class.",
			overlayLoad: "WET-Geomap: overlays were loaded successfully",
			overlayNotLoad: "WET-Geomap: an error occurred while loading overlays",
			basemapDefault: "WET-Geomap: using default basemap",
			projection: "WET-Geomap: using projection",
			error: "WET-Geomap ERROR",
			warning: "WET-Geomap WARNING",
			warningLegend: "No div element with a class of <em>wet-boew-geomap-legend</em> was found. If you require a legend either add a div with a class of <em>wet-boew-geomap-legend</em>.",
			overlayNotSpecify: "WET-Geomap: overlays file not specified",
			baseMapMapOptionsLoadError: "WET-Geomap: an error occurred when loading the mapOptions in your basemap configuration. Please ensure that you have the following options set: maxExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), maxResolution (e.g. 'auto'), projection (e.g. 'EPSG:3978'), restrictedExtent (e.g. '-3000000.0, -800000.0, 4000000.0, 3900000.0'), units (e.g. 'm'), displayProjection: (e.g. 'EPSG:4269'), numZoomLevels: (e.g. 12), aspectRatio: (e.g. 0.8).",
			warningTab: "No class <em>tab</em> in wet-boew-geomap but a table has tab attribute set to true.",
			layersNotSpecify: "No div with id <em>wet-boew-geomap-layers</em> have been found. You need to add one."
		},
		fr: {
			debugMode: "BOEW-Géocarte : mode débogage activé",
			debugMess: "Lors de l'exécution en mode débogage Geomap donne des messages d'erreur, des messages d'aide et donneras de l'information utile dans la console de débogage. Désactiver le mode débogage en supprimant la classe <em>debug</em>.",
			overlayLoad: "BOEW-Géocarte : Les couches de superpositions ont été chargées avec succès",
			overlayNotLoad: "BOEW-Géocarte : une erreur est survenue lors du chargement des couches de superpositions",
			basemapDefault: "BOEW-Géocarte : la carte de base par défaut est utilisée",
			projection: "BOEW-Géocarte : la projection utilisée est",
			error: "BOEW-Géocarte ERREUR",
			warning: "BOEW-Geomap AVERTISSEMENT",
			warningLegend: "Aucun élément div comportant une classe <em>wet-boew-geomap-legend</em> n'a été trouvé. Si vous avez besoin d'une légende, vous pouvez ajouter un élément div avec une classe <em>wet-boew-geomap-legend</em>.",
			overlayNotSpecify: "BOEW-Géocarte : fichier des couches de superpositions non spécifié",
			baseMapMapOptionsLoadError: "BOEW-Géocarte : une erreur est survenue lors du chargement des options de configuration de votre carte de base. S'il vous plaît, vérifiez que vous avez l'ensemble des options suivantes: maxExtent (ex: '-3000000,0, -800000,0, 4000000,0, 3900000,0'), maxResolution (ex: 'auto'), projection (ex: 'EPSG: 3978'), restrictedExtent (ex: '-3000000,0 , -800000,0, 4000000,0, 3900000,0'), units (ex: 'm'), displayProjection (ex: 'EPSG: 4269'), numZoomLevels (ex: 12), aspectRatio: (ex: 0.8).",
			warningTab: "Il n'y a pas de classe <em>tab</em> dans wet-boew-geomap mais une table a l'attribut égal vrai.",
			layersNotSpecify: "Il n'y a pas de div avec le id <em>wet-boew-geomap-layers</em>. Vous devez en ajouter un."
		}
	},

	init = function() {
		messages = debugMessages[ ( document.documentElement.lang === "fr" ? "fr" : "en" ) ];

		var debugMode = messages.debugMode,
			msgStart = "<div style='border: 3px dashed #000; padding: 10px; color: #000; background: #fff;'><h3>",
			msgMiddle = "</h3><p>",

		msgEnd = "</p></div>";
		$wbMainIn = $( "#wb-main-in" );
		warningStart = msgStart + messages.warning + msgMiddle;
		errorStart = "<div style='border: 3px dashed #000; padding: 10px; color: #C00; font-weight: 700; background: #fff;'><h3>" + messages.error + msgMiddle;

		window.console.log( debugMode );
		$wbMainIn.prepend( msgStart + debugMode + msgMiddle + messages.debugMess + msgEnd );
	};

$document.on( "debug.wb-geomap overlayLoad.wb-geomap overlayNotLoad.wb-geomap overlayNotSpecify.wb-geomap warningLegend.wb-geomap warningTab.wb-geomap errorSelect.wb-geomap errorNoSelect.wb-geomap basemapDefault.wb-geomap baseMapMapOptionsLoadError.wb-geomap projection.wb-geomap layersNotSpecify.wb-geomap", function( event, param1 ) {
	var type = event.type,
		console = window.console;

	switch ( type ) {
	case "debug":
		init();
		break;
	case "overlayLoad":
		console.log( messages.overlayLoad );
		break;
	case "overlayNotLoad":
		console.log( messages.overlayNotLoad );
		break;
	case "overlayNotSpecify":
		console.log( messages.overlayNotSpecify );
		break;
	case "warningLegend":
		$wbMainIn.prepend( warningStart + messages.warningLegend + msgEnd );
		break;
	case "warningTab":
		$wbMainIn.prepend( warningStart + messages.warningTab + msgEnd );
		break;
	case "errorSelect":
		param1.append( errorStart + messages.errorSelect + msgEnd );
		break;
	case "errorNoSelect":
		param1.before( errorStart + messages.errorNoSelect + msgEnd );
		break;
	case "basemapDefault":
		console.log( messages.basemapDefault );
		break;
	case "baseMapMapOptionsLoadError":
		console.log( messages.baseMapMapOptionsLoadError );
		break;
	case "projection":
		console.log( messages.projection + " " + param1 );
		break;
	case "layersNotSpecify":
		$wbMainIn.prepend( warningStart + messages.layersNotSpecify + msgEnd );
		break;
	}
});

})( jQuery, window, wb );
