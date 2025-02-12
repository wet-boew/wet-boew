/**
* @title WET-BOEW Exit script plugin
* @overview Plugin redirects users to non secure site
* @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
* @author @ipaksc
*/
( function( $, window, wb, crypto ) {
"use strict";
var componentName = "wb-exitscript",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	exiturlparam = componentName + "-urlparam",
	keyForKeyHolder = componentName + "key",
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
			counterInUrl = wb.string.fromHexString( urlParams.get( "exturl" ) ),
			encryptedUrl = localStorage.getItem( componentName ),
			jwt = JSON.parse( localStorage.getItem( keyForKeyHolder ) ),
			$elm;
		if ( elm ) {
			$elm = $( elm );
			settings = $.extend(
				true,
				window[ componentName ],
				wb.getData( $elm, componentName )

			);

			$elm.data( componentName, settings );

			if ( settings.url && crypto ) {

				crypto.subtle.generateKey(
					{
						name: "AES-CTR",
						length: 256
					},
					true,
					[ "encrypt", "decrypt" ]
				).then( function( keyToEncrypt ) {

					var enc, messageEncoded, counter;

					// Save the key in the anchor
					crypto.subtle.exportKey( "jwk", keyToEncrypt )
						.then( function( exportedJwtKey ) {
							elm[ keyForKeyHolder ] = exportedJwtKey;
						} );

					// Encrypt the URL
					enc = new TextEncoder();
					messageEncoded = enc.encode( elm.href );
					counter = crypto.getRandomValues( new Uint8Array( 16 ) );
					crypto.subtle.encrypt(
						{
							name: "AES-CTR",
							counter: counter,
							length: 64
						},
						keyToEncrypt,
						messageEncoded
					).then( function( ciphertext ) {
						elm[ componentName ] = ciphertext;
					} );

					// Change the link URL by passing the counter as a key
					$elm.attr( "href", settings.url + "?exturl=" + wb.string.toHexString( counter ) );
				} );

			}

			i18n = i18nDict[ wb.lang || "en" ];

			// This conditional statement for a middle static exit page, to retrieve the URL to the non-secure site.
			if ( $elm.hasClass( exiturlparam ) && encryptedUrl !== null && jwt !== null ) {

				crypto.subtle.importKey(
					"jwk",
					jwt,
					{
						name: "AES-CTR",
						length: 256
					},
					true,
					[ "decrypt" ]
				).then( function( key ) {

					crypto.subtle.decrypt(
						{
							name: "AES-CTR",
							counter: counterInUrl,
							length: 64
						},
						key,
						wb.string.base64ToArrayBuffer( encryptedUrl )
					).then( function( decrypted ) {

						var dec = new TextDecoder(),
							urlToRedirect = dec.decode( decrypted );

						// Check if the decrypted message is an valid URL and silently fail if the pattern don't match
						if ( urlToRedirect.match( /^(http|https):\/\//g ) ) {
							elm.outerHTML = "<a href='" + urlToRedirect + "'>" + urlToRedirect + "</a>";
						}

					} );
				} );

			}

			// Remove the plugin data and ensure it is removed from the localstorage
			localStorage.removeItem( componentName );
			localStorage.removeItem( keyForKeyHolder );

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

	} else if ( crypto && this[ componentName ] ) {

		// Save to localstorage, the plugin init will ensure this data is only used once
		localStorage.setItem( componentName, wb.string.arrayBufferToBase64( this[ componentName ] ) );
		localStorage.setItem( keyForKeyHolder, JSON.stringify( this[ keyForKeyHolder ] ) );
	}

} );

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb, crypto );
