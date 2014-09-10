/*
 * @title WET-BOEW Geomap English config file
 * @overview Exemple d'un fichier de configuration français pour Géocarte
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */

/*
 * Les composantes individuelles seront substituées par les compasantes globales
 *
 * Les couche de superpositions seront ajoutés dans l'ordre où ils sont fournis
 * (c'est à dire la première couche sera ajouté en premier, puis la suivante
 * sur le dessus, et ainsi de suite).
 *
 * Prennez note, la carte de base peut être définie globalement dans le fichier settings.js.
 */
/*jshint unused:false*/
var wet_boew_geomap = {
	// OPTIONNEL: Géomap va fournir une carte de base par défaut si aucune carte de base n"est spécifié ici.
	basemap: {
		title: "WMS-Toporama",
		type: "wms",
		url: "http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en",
		version: "1.1.1",
		format: "image/jpeg",
		layers: "WMS-Toporama",
		mapOptions: {
			maxExtent: "-141, 41, -52, 84",
			restrictedExtent: "-141, 41, -52, 84",
			maxResolution: "auto",
			projection: "EPSG:4269",
			units: "m",
			displayProjection: "EPSG:4269",
			aspectRatio: 0.8
		}
	},
	overlays: []
};
