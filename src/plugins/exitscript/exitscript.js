/**
* @title WET-BOEW Exit script plugin
* @overview Plugin redirects users to non secure site
* @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
* @author @ipaksc
*/
( function( $, window, wb ) {
"use strict";
var componentName = "wb-exitscript",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	exiturlparam = componentName + "-urlparam",
	moDalId = componentName + "-modal",
	i18n,
	i18nDict = {
		en: {
			"msgboxHeader": "Warning",
			"exitMsg": "You are about to leave a secure site, do you wish to continue?",
			"targetWarning": "The link will open in a new browser window.",
			"yesBtn": "Yes",
			"cancelBtn": "Cancel"

		},
		fr: {
			"msgboxHeader": "Avertissement",
			"exitMsg": "Vous êtes sur le point de quitter un site sécurisé. Voulez-vous continuer?",
			"targetWarning": "Le lien s'ouvrira dans une nouvelle fenêtre de navigateur.",
			"yesBtn": "Oui",
			"cancelBtn": "Annuler"

		}
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			settings,
			queryString = window.location.search,
			urlParams = new URLSearchParams( queryString ),
			originalURL = urlParams.get( "exturl" ),
			$elm;
		if ( elm ) {
			$elm = $( elm );
			settings = $.extend(
				true,
				window[ componentName ],
				wb.getData( $elm, componentName )

			);

			$elm.data( componentName, settings );

			if ( settings.url ) {
				$( this ).attr( "href", settings.url + "?exturl=" +  encodeURIComponent( this.href ) );
			}

			i18n = i18nDict[ wb.lang || "en" ];

			// This conditional statement for a middle static exit page, to retrieve the URL to the non-secure site.
			if ( $elm.hasClass( exiturlparam ) ) {
				this.outerHTML = "<a href='" + originalURL + "'>" + originalURL + "</a>";
			}
			wb.ready( $elm, componentName );
		}
	};

$document.on( "click", selector, function( event ) {

	var elm = event.currentTarget,
		$elm = $( elm ),
		wrapper,
		targetAttribute = "",
		moDal = document.createDocumentFragment(),
		tpl = document.createElement( "div" ),
		settings =  $elm.data( componentName ),
		msgboxHeader = i18n.msgboxHeader,
		yesBtn = i18n.yesBtn,
		cancelBtn = i18n.cancelBtn,
		exitMsg = i18n.exitMsg,
		targetWarning = i18n.targetWarning;

	if ( settings.i18n ) {
		msgboxHeader =  settings.i18n.msgboxHeader || i18n.msgboxHeader;
		yesBtn = settings.i18n.yesBtn || i18n.yesBtn;
		cancelBtn = settings.i18n.cancelBtn || i18n.cancelBtn;
		exitMsg = settings.i18n.exitMsg || i18n.exitMsg;
		targetWarning = settings.i18n.targetWarning || i18n.targetWarning;
	}

	if ( !settings.url ) {

		event.preventDefault();
	}

	if ( this.hasAttribute( "target" ) ) {
		targetAttribute = "target='" + this.getAttribute( "target" ) + "'";
	} else {
		targetAttribute = "target='" + targetAttribute + "'";
	}

	if ( this.getAttribute( "target" ) === "_blank" ) {
		exitMsg = exitMsg  + " " + targetWarning;
	}

	if ( document.getElementById( moDalId ) ) {
		document.getElementById( moDalId ).remove();

	}

	if ( !settings.url ) {
		tpl.innerHTML = "<section id='" + moDalId + "' " + "class='mfp-hide modal-dialog modal-content overlay-def'>" +
			"<header class='modal-header'><h2 class='modal-title'>" + msgboxHeader + "</h2></header>" +
			"<div class='modal-body'>" +
			"<p>" + exitMsg + "</p>" +
			"</div>" +
			"<div class='modal-footer'>" +
			"<ul class='list-inline text-center'>" +
			"<li><a class='btn btn-default pull-right popup-modal-dismiss'" + targetAttribute + " href='" + this.getAttribute( "href" ) + "'>" + yesBtn + "</a></li>" +
			"<li><button class='btn btn-primary popup-modal-dismiss pull-left'>" + cancelBtn + "</button></li>" +
			"</ul></div></section>";
		moDal.appendChild( tpl );
		wrapper = moDal.firstChild;
		wrapper = wrapper.firstChild;
		document.body.appendChild( wrapper );

		$( wrapper ).trigger( "open.wb-lbx", [
			[ {
				src: "#" + moDalId,
				type: "inline"
			} ],

			true

		] );

	}

} );

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
