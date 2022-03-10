/**
 * @title WET-BOEW wb-data-scrub
 * @overview This plugin delete Personal Identifiable Information (PII) from the flagged form fields before form submit
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @polmih, @duboisp, @GormFrank
 **/
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-data-scrub",
	selector = "[data-rule-wbscrub]",
	initEvent = "wb-init" + componentName,
	wrapper,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		if ( elm && $( elm.form ).data( "scrub-inited" ) !== "" ) {

			var	form = elm.form;

			$( elm.form ).data( "scrub-inited", "" );

			form.addEventListener( "submit", function( event ) {
				event.preventDefault();
				var isPii = false,
					moDalId = componentName + "-modal",
					i18nDict = {
						en: {
							"msgboxHeader": "Remove Personal information",
							"msgBodyIntro": "Some information added in the following fields is identified as personal information and it will be removed and submitted as follows:",
							// eslint-disable-next-line max-len
							"msgBodyViewMore": "<p>Please note that any information that corresponds to the cases from the list below, is considered as personal information and is removed from the form prior its submission:</p> <ul><li>Any 8 or more digits separated or not by the following characters: ' ', '/', '-', '.'</li><li>Passport serial number</li><li>Email</li><li>Postal Code</li><li>Certain parametres considered non secured in a url</li></ul>",
							"yesBtn": "I agree, remove personal information and submit",
							"cancelBtn": "Go back to the form",
							"viewMoreLink": "Find out more"
						},
						fr: {
							"msgboxHeader": "Supprimer les informations personnelles",
							"msgBodyIntro": "Certaines informations ajoutées dans les champs suivants sont identifiées comme des informations personnelles et seront supprimées et soumises comme suit:",
							// eslint-disable-next-line max-len
							"msgBodyViewMore": "<p>Veuillez noter que toute information correspondant aux cas de la liste ci-dessous est considérée comme une information personnelle et est supprimé du formulaire avant sa soumission:</p> <ul><li>8 chiffres ou plus séparés ou non par les caractères suivants : ' ', '/', '-', '.'</li><li>Numéro de série du passeport</li><li>E-mail</li><li>Code Postal</li><li>Des paramètres considérés comme non sécurisés dans une url</li></ul>",
							"yesBtn": "J'accepte, supprime les informations personnelles et soumettre",
							"cancelBtn": "Retourner au formulaire",
							"viewMoreLink": "En savoir plus"
						}
					},
					i18n = i18nDict[ wb.lang || "en" ],
					moDal = document.createDocumentFragment(),
					tpl = document.createElement( "div" ),
					msgboxHeader = i18n.msgboxHeader,
					yesBtn = i18n.yesBtn,
					cancelBtn = i18n.cancelBtn,
					msgBodyIntro = i18n.msgBodyIntro,
					msgBodyListFields = "<dl class='dl-horizontal'>",
					msgBodyViewMore = i18n.msgBodyViewMore,
					viewMoreLink = i18n.viewMoreLink,
					countPiifield = 0,
					labelText = "",
					checkFormValues = function( scrubData ) {

						// identify form elements that were assigned to be scrubbed
						$( selector, form ).each( function() {
							var $elmInput = $( this ),
								elmInputVal = $elmInput.val(),
								scrubbedVal = wb.findPotentialPII( elmInputVal, true );
							$elmInput.removeAttr( "data-first-to-scrub" );

							// if the helper find any PII values clean the PII and assign new value to the form element with the output string
							if ( scrubbedVal !== false ) {
								countPiifield++;
								if ( countPiifield === 1 ) {
									$elmInput.focus();
								}
								labelText = $( "[for=" + $elmInput.attr( "id" ) + "] > span.field-name" ).text() !== "" ? $( "[for=" + $elmInput.attr( "id" ) + "] > span.field-name" ).text() : $( "[for=" + $elmInput.attr( "id" ) + "]" ).text();
								msgBodyListFields = msgBodyListFields + "<dt>" + labelText + "</dt><dd>: <code>" + ( scrubbedVal !== "" ? scrubbedVal : "" ) + "</code></dd>";
								isPii = true;
								if ( scrubData ) {
									$elmInput.val( scrubbedVal === false ? elmInputVal : scrubbedVal );
									isPii = false;
								}
							}
						} );
						msgBodyListFields += "</dl>";
					};
				if ( document.getElementById( moDalId ) ) {
					document.getElementById( moDalId ).remove();
				}
				checkFormValues();
				tpl.innerHTML = "<section id='" + moDalId + "' " + "class='modal-dialog modal-content overlay-def'>" +
										"<header class='modal-header'><h2 class='modal-title'>" + msgboxHeader + "</h2></header>" +
										"<div class='modal-body'>" +
										"<p>" + msgBodyIntro + "</p>" + msgBodyListFields +
										"<details class='mrgn-tp-md mrgn-bttm-md'>" +
										"<summary>" + viewMoreLink + "</summary>" +
											msgBodyViewMore +
											"</details>" +
										"</div>" +
										"<div class='modal-footer'>" +
										"<ul class='list-inline pull-left text-left'>" +
											"<li><button class='btn btn-primary popup-modal-dismiss'>" + cancelBtn + "</button></li>" +
											"<li><button class='btn btn-link popup-modal-dismiss' data-wbscrub-submit>" + yesBtn + "</button></li>" +
										"</ul></div></section>";
				moDal.appendChild( tpl );
				wrapper = moDal.firstChild;
				wrapper = wrapper.firstChild;
				document.body.appendChild( wrapper );

				if ( isPii ) {
					$( wrapper ).trigger( "open.wb-lbx", [
						[ {
							src: "#" + moDalId,
							type: "inline"
						} ],
						true
					] );
				}

				$( "[data-wbscrub-submit]", wrapper ).click( function() {
					if ( !isPii ) {
						event.target.submit();
					} else {
						checkFormValues( true );
						event.target.submit();
					}
				} );
				if ( !isPii ) {
					event.currentTarget.submit();
				}
			} );

			wb.ready( $( elm ), componentName );

		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
