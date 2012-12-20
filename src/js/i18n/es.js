/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- Spanish dictionary (il8n) ---
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
			var delta,
				parsed_date,
				r,
				relative_to;
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
			'%all': 'Todo',
			'%home': 'Página de Inicio',
			'%main-page': 'Página Principal',
			'%top-of-page': 'Arriba',
			'%you-are-in': 'Usted está en: ',
			'%welcome-to': 'Bienvenido/a  a: ' + $('#gcwu-title').text(),
			'%loading': 'cargando...',
			'%search': 'Búsqueda',
			'%search-for-terms': 'Buscar por palabra(s):',
			'%no-match-found': '0 resultados encontrados',
			'%matches-found': {
				'mixin': '[MIXIN] resultado(s) encontrados'
			},
			'%menu': 'Menú',
			'%hide': 'Ocultar',
			'%error': 'Error',
			'%colon': ':',
			'%start': 'Iniciar',
			'%stop': 'Detener',
			'%back': 'Volver',
			'%new-window': ' (Abrir nueva ventana)',
			'%minute-ago': 'hace un minuto',
			'%couple-of-minutes': 'hace algunos minutos',
			'%minutes-ago': {
				'mixin': 'hace [MIXIN] minutos'
			},
			'%hour-ago': 'hace una hora',
			'%hours-ago': {
				'mixin': 'hace [MIXIN] horas'
			},
			'%days-ago': {
				'mixin': 'hace [MIXIN] días'
			},
			'%yesterday': 'ayer',
			/* Archived Web page template */
			'%archived-page': 'Esta página Web ha estado archivada en la red.',
			/* Menu bar */
			'%sub-menu-help': '(Aprete "enter" para abrir el sub-menú y ciérrelo con la tecla "esc")',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': 'Detener rotación de tabs',
				'enable': 'Comenzar rotación de tabs'
			},
			'%tab-list': 'Lista de pestañas',
			/* Multimedia player */
			'%play': 'Reproducir',
			'%pause': 'Pausa',
			'%open': 'Abrir',
			'%close': 'Cerrar',
			'%rewind': 'Retroceder',
			'%next': 'Siguiente',
			'%previous': 'Previo',
			'%fast-forward': 'Avance rápido ',
			'%mute': {
				'enable': 'Silenciar',
				'disable': 'Habilitar Sonido'
			},
			'%closed-caption': {
				'disable': 'Ocultar subtítulos',
				'enable': 'Mostrar subtítulos'
			},
			'%captionserror': 'Error al cargar subtítulos',
			'%audio-description': {
				'enable': 'Habilitar Audio Descripción',
				'disable': 'Deshabilitar Audio Descripción'
			},
			'%progress-bar': 'Usar las teclas de flechas IZQUIERDA y DERECHA para avanzar o retroceder la presentación multimedia',
			'%no-video': 'Su browser no es compatible con este video, por favor descargue el video que aparece abajo',
			'%position': 'Posición actual: ',
			'%percentage': 'Porcentaje de Playback: ',
			'%duration': 'Tiempo Total: ',
			'%buffered': 'Buffered: ',
			/* Share widget */
			'%favourite': 'Favorito',
			'%email': 'Email',
			'%share-text': 'Compartir esta página',
			'%share-hint': ' con {s}',
			'%share-email-subject': 'Página de interés',
			'%share-email-body': 'Pienso que encontrarás interesante esta página:\n{t} ({u})',
			'%share-fav-title': ' (colocar esta página como bookmark)',
			'%share-manual': 'Por favor cierre este diálogo y  pulse Ctrl-D para colocar esta página como bookmark.',
			'%share-showall': 'Mostrar todo ({n})',
			'%share-showall-title': 'Todos los sitios marcados como bookmark',
			'%share-disclaimer' : 'No implica la promoción ni recomendación de ningún producto o servicio.',
			/* Form validation */
			'%form-not-submitted': 'El formulario no pudo ser enviado debido a ',
			'%errors-found': ' se hallaron errores.',
			'%error-found': ' se hallo un error.',
			/* Date picker */
			'%datepicker-hide': 'Ocultar Calendario',
			'%datepicker-show': 'Seleccionar una fecha del calendario por tema: ',
			'%datepicker-selected': 'Seleccionado',
			/* Calendar */
			'%calendar-weekDayNames': ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
			'%calendar-monthNames': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
			'%calendar-currentDay': ' (Hoy)',
			'%calendar-goToLink': 'Ir a<span class="wb-invisible"> Mes del Año</span>',
			'%calendar-goToTitle': 'Ir al Mes del Año',
			'%calendar-goToMonth': 'Mes:',
			'%calendar-goToYear': 'Año:',
			'%calendar-goToButton': 'Ir',
			'%calendar-cancelButton': 'Cancelar',
			'%calendar-previousMonth': 'Mes Anterior: ',
			'%calendar-nextMonth': 'Mes Siguiente: ',
			/* Slideout */
			'%show-toc': 'Mostrar',
			'%show-image': 'mostrar.png',
			'%hide-image': 'ocultar.png',
			'%table-contents': ' índice',
			/* Lightbox */
			'%lb-current': 'Ítem {current} de {total}',
			'%lb-next': 'Ítem siguiente',
			'%lb-prev': 'Ítem previo',
			'%lb-xhr-error': 'Este contenido no pudo ser cargado.',
			'%lb-img-error': 'Esta imagen no pudo ser cargada.',
			'%lb-slideshow': 'slideshow',
			/* jQuery Mobile */
			'%jqm-expand': ' click para expandir contenidos',
			'%jqm-collapse': ' click para achicar contenidos',
			'%jqm-clear-search': 'nueva búsqueda',
			'%jqm-filter': 'Filtrar ítems',
			/* Charts widget */
			'%table-mention': 'Tabla',
			'%table-following': 'Gráfico. Detalles en la siguiente tabla.',
			/* Session timeout */
			'%st-timeout-msg': 'Su sesión está próxima a expirar, tiene hasta #expireTime# para activar el botón "OK" y así extender su sesión.',
			'%st-msgbox-title': 'Aviso de finalización de sesión',
			'%st-already-timeout-msg': 'Lamentablemente su sesión ha expirado. Por favor ingrese nuevamente.',
			/* Toggle details */
			'%td-toggle': 'Alternar todo',
			'%td-open': 'Expandir todo',
			'%td-close': 'Plegar todo',
			'%td-ttl-open': 'Expandir todas las secciones de contenido',
			'%td-ttl-close': 'Plegar todas las secciones de contenido',
			/* Disable/enable PE */
			'%pe-disable': 'Versión básica HTML',
			'%pe-enable': 'Versión standard'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));
