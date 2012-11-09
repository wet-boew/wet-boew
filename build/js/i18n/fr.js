/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: v3.1.0-a1
 *//*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
----- French dictionary (il8n) ---
 */
/*global jQuery: false, pe: false */
/*jshint bitwise: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	_pe.dic = {
		get: function (key, state, mixin) {
			var truthiness = (typeof key === 'string' && key !== '') | // eg. 000 or 001 ie. 0 or 1
				(typeof state === 'string' && state !== '') << 1 | // eg. 000 or 010 ie. 0 or 2
				(typeof mixin === 'string' && mixin !== '') << 2; // eg. 000 or 100 ie. 0 or 4
			switch (truthiness) {
				case 1:
					return this.ind[key]; // only key was provided.
				case 3:
					return this.ind[key][state]; // key and state were provided.
				case 7:
					return this.ind[key][state].replace('[MIXIN]', mixin); // key, state, and mixin were provided.
				default:
					return '';
			}
		},
/*
 @dictionary function : pe.dic.ago()
 @returns: a human readable time difference text
 */
		ago: function (time_value) {
			var delta, parsed_date, r, relative_to;
			parsed_date = pe.date.convert(time_value);
			relative_to = (arguments.length > 1 ? arguments[1] : new Date());
			delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);
			delta = delta + (relative_to.getTimezoneOffset() * 60);
			r = '';
			if (delta < 60) {
				r = this.get('%minute-ago');
			} else if (delta < 120) {
				r = this.get('%couple-of-minutes');
			} else if (delta < (45 * 60)) {
				r = this.get('%minutes-ago', 'mixin', (parseInt(delta / 60, 10)).toString());
			} else if (delta < (90 * 60)) {
				r = this.get('%hour-ago');
			} else if (delta < (24 * 60 * 60)) {
				r = this.get('%hours-ago', 'mixin', (parseInt(delta / 3600, 10)).toString());
			} else if (delta < (48 * 60 * 60)) {
				r = this.get('%yesterday');
			} else {
				r = this.get('%days-ago', 'mixin', (parseInt(delta / 86400, 10)).toString());
			}
			return r;
		},
		ind: {
			'%all': 'Tous',
			'%home': 'Accueil',
			'%main-page': 'Page principale',
			'%top-of-page': 'Haut de la page',
			'%you-are-in': 'Vous êtes dans :',
			'%welcome-to': 'Bienvenue à : ' + $('#gcwu-title').text(),
			'%loading': 'chargement...',
			'%search': 'Recherche',
			'%search-for-terms': 'Recherche de terme(s) :',
			'%no-match-found': 'Aucune correspondance trouvée',
			'%matches-found': {
				'mixin': '[MIXIN] correspondance(s) trouvées'
			},
			'%menu': 'Menu',
			'%hide': 'Masquer',
			'%error': 'Erreur',
			'%colon': '&#160;:',
			'%start': 'Lancer',
			'%stop': 'Arrêter',
			'%back': 'Précédent',
			'%new-window': ' (Ouvre dans une nouvelle fenêtre)',
			'%minute-ago': 'il y a une minute',
			'%couple-of-minutes': 'il y a quelques minutes',
			'%minutes-ago': {
				'mixin': 'il y a [MIXIN] minutes'
			},
			'%hour-ago': 'il y a une heure',
			'%hours-ago': {
				'mixin': 'il y a [MIXIN] heures'
			},
			'%days-ago': {
				'mixin': 'il y a [MIXIN] jours'
			},
			'%yesterday': 'hier',
			/* Archived Web page template */
			'%archived-page': 'Cette page Web a été archivée dans le Web.',
			/* Menu bar */
			'%sub-menu-help': '(ouvrir le sous-menu avec la touche d\'entrée et le fermer avec la touche d\'échappement)',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': 'Arrêter la rotation d\'onglets',
				'enable': 'Lancer la rotation d\'onglets'
			},
			/* Multimedia player */
			'%play': 'Jouer',
			'%pause': 'Pause',
			'%close': 'Fermer',
			'%rewind': 'Reculer',
			'%next': 'Prochaine',
			'%previous': 'Précedent',
			'%fast-forward': 'Avancer ',
			'%mute': {
				'enable': 'Activer le mode muet',
				'disable': 'Désactiver le mode muet'
			},
			'%closed-caption': {
				'disable': 'Masquer le sous-titrage',
				'enable': 'Afficher le sous-titrage'
			},
			'%captionserror': 'Erreur dans le chargement des sous-titres',
			'%audio-description': {
				'enable': 'Activer l\'audiodescription',
				'disable': 'Désactiver l\'audiodescription'
			},
			'%progress-bar': 'utilisez les touches GAUCHE ou DROITE pour avancer ou reculer le progrès des médias',
			'%no-video': 'Votre navigateur ne semble pas avoir les capacité nécessaires pour lire cette vidéo, s\'il vous plaît télécharger la vidéo ci-dessous',
			'%position': 'Position actuelle&#160;: ',
			'%percentage': 'Pourcentage de lecture&#160;: ',
			'%duration': 'Temps total&#160;: ',
			'%buffered': 'Mis en mémoire-tampon&#160;: ',
			/* Share widget */
			'%favourite': 'Lien préféré',
			'%email': 'Courriel',
			'%share-text': 'Partagez cette page',
			'%share-hint': ' avec {s}',
			'%share-email-subject': 'Page qui est intéressante',
			'%share-email-body': 'J\'espère que cette page vous intéresse :\n{t} ({u})',
			'%share-fav-title': ' (ajouter cette page à vos signets)',
			'%share-manual': 'S\'il vous plaît fermer ce dialogue et\nappuyer sur Ctrl-D pour ajouter cette page à vos signets.',
			'%share-showall': 'Tous montrer ({n})',
			'%share-showall-title': 'Tout les sites de mise en signet',
			'%share-disclaimer': 'Aucun appui n’est accordé, soit de façon expresse ou tacite, à aucun produit ou service.',
			/* Form validation */
			'%form-not-submitted': 'Le formulaire n\'a pu être soumis car ',
			'%errors-found': ' erreurs ont été trouvées.',
			'%error-found': ' erreur a été trouvée.',
			/* Date picker */
			'%datepicker-hide': 'Masquer le calendrier',
			'%datepicker-show': 'Sélectionner une date à partir d\'un calendrier pour le champ: ',
			'%datepicker-selected': 'Sélectionné',
			/* Calendar */
			'%calendar-weekDayNames': ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
			'%calendar-monthNames': ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
			'%calendar-currentDay': ' (Jour courrant)',
			'%calendar-goToLink': 'Aller au <span class="wb-invisible"> mois de l\'année</span>',
			'%calendar-goToTitle': 'Aller au mois de l\'année',
			'%calendar-goToMonth': 'Mois : ',
			'%calendar-goToYear': 'Année : ',
			'%calendar-goToButton': 'Aller',
			'%calendar-cancelButton': 'Annuler',
			'%calendar-previousMonth': 'Mois précédent : ',
			'%calendar-nextMonth': 'Mois suivant : ',
			/* Slideout */
			'%show-toc': 'Afficher',
			'%show-image': 'afficher.png',
			'%hide-image': 'cacher.png',
			'%table-contents': ' la table des matières',
			/* Lightbox */
			'%lb-current': 'Article {current} de {total}',
			'%lb-next': 'Article suivant',
			'%lb-prev': 'Article précédent',
			'%lb-xhr-error': 'Le chargement de ce contenu a échoué.',
			'%lb-img-error': 'Le chargement de cette image a échoué.',
			'%lb-slideshow': 'la diaporama',
			/* jQuery Mobile */
			'%jqm-expand': ' cliquer pour afficher le contenu',
			'%jqm-collapse': ' cliquer pour masquer le contenu',
			'%jqm-clear-search': 'effacer le texte',
			'%jqm-filter': 'Filtrer des articles...',
			/* Charts widget */
			'%table-mention': '- Tableau',
			'%table-following': '- Graphique. Plus de détails dans le tableau suivant.',
			/* Session timeout */
			'%st-timeout-msg': 'Votre session est sur le point d\'expirer, vous avez jusqu\'a #expireTime# pour sélectionnez "OK" ci-dessous pour prolonger votre session.',
			'%st-msgbox-title': 'Avertissement d\'expiration de la session',
			'%st-already-timeout-msg': 'Désolé, votre session a déjà expiré. S\'il vous plaît vous connecter à nouveau.',
			/* Toggle details */
			'%toggle-open': 'Basculer: ouvrir',
			'%toggle-close': 'Basculer: fermé',	
			/* Disable/enable PE */
			'%pe-disable': 'Version HTML simplifiée',
			'%pe-enable': 'Version standard'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));
