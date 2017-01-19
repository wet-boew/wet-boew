/**
 * @title WET-BOEW Plugiciel bonjour le monde
 * @overview Plugiciel démontrant un example de comment créer votre propre plugiciel BOEW personalisé
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, wb ) {
"use strict";

/*
 * Définition de variable et de fonction.
 * Ceux-ci sont généraux au plugiciel - cela veux dire qu'ils seront initialisé une fois par page,
 * et non à chaque fois que le plugiciel sera instancié sur la page. Donc, ici c'est un bon endroit
 * enfin de définir des variables qui sont communes à toutes les instance du plugiciel sur la page.
 */
var nomComposant = "wb-bonjour",
	selecteur = "." + nomComposant,
	initEvenement = "wb-init" + selecteur,
	$document = wb.doc,
	defauts = {},

	/**
	 * @method init
	 * @param {jQuery Evenement} Evenement L'object événement lors du déclanchement de la fonction
	 */
	init = function( Evenement ) {

		// Début de l'initialisation
		// retourne un objet DOM = procéder avec l'initialisation
		// retourne undefined = ne pas procéder avec l'initialisation (ex., il est déjà initialisé)
		var elm = wb.init( Evenement, nomComposant, selecteur ),
			$elm,
			parametres;

		if ( elm ) {
			$elm = $( elm );

			// ... Faire l'initialisation du plugiciel

			// Obtenir les paramètres JSON du plugiciel tel que définie par l'attribut data-wb-bonjour
			parametres = $.extend(
				true,
				{},
				defauts,
				window[ nomComposant ],
				wb.getData( $elm, nomComposant )
			);

			// Appel d'un événement personalisé
			$elm.trigger( "nom.de.votre.evenement", parametres );

			// Annonce que l'initialisation de l'instance a été complélté
			wb.ready( $elm, nomComposant );
		}
	};

// Ajouter votre code pour gérer les événement de votre plugiciel
$document.on( "nom.de.votre.evenement", selecteur, function( evenenment, donnee ) {
	var elm = evenenment.currentTarget,
		$elm = $( elm );

	$elm.append( "Bonjour le monde" );

	if ( donnee && donnee.surpassetoi ) {
		$elm.prepend( "Surpasse toi" );
	}
} );

// Liaison à l'événement init du plugiciel
$document.on( "timerpoke.wb " + initEvenement, selecteur, init );

// Ajouter notre poke pour que l'initialisation des instances
wb.add( selecteur );

} )( jQuery, window, wb );
