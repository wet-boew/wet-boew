/**
 * @title WET-BOEW wb-pii-scrub
 * @overview This plugin delete Personal Identifiable Information (PII) from the flagged form fields before form submit
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @polmih, @duboisp, @GormFrank
 **/
( function( $, wb ) {
"use strict";

var $document = wb.doc,
	componentName = "wb-pii-scrub",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	attrPIIBlocked = "data-wb-pii-blocked",
	attrScrubField = "data-scrub-field",
	attrScrubSubmit = "data-scrub-submit",
	piiModalID = componentName + "-modal",
	defaults = {
		scrubChar: "********"
	},
	i18n, i18nText,
	currSubmitter,
	btnAsInput,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector ),
			$elm = $( elm );

		if ( elm ) {
			var settings = elm.getAttribute( "data-" + componentName );

			// Initialize i18n strings
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					header: i18n( "pii-header" ),
					intro: i18n( "pii-intro" ),
					viewMore: i18n( "pii-view-more" ),
					viewMoreInfo: i18n( "pii-view-more-info" ),
					confirmBtn: i18n( "pii-yes-btn" ),
					cancelBtn: i18n( "pii-cancel-btn" ),
					redacted: i18n( "redacted" )
				};
			}

			// Parse settings defined on element
			if ( settings ) {
				settings = JSON.parse( settings );
			}

			// Initialize settings
			elm.settings = { ...defaults, ...settings };

			// Ensure the form has an ID
			elm.id = elm.id ? elm.id : wb.getId();

			// Block form submission for Postback forms by default
			elm.setAttribute( attrPIIBlocked, "true" );

			elm.addEventListener( "submit", function( e ) {
				e.preventDefault(); // This is needed because of the setTimeout

				// Go through form values
				checkFormValues( elm );

				// Check if form has validation errors before showing PII popup or submitting
				setTimeout( function() {
					let errorElm = elm.querySelector( ".error .label.label-danger" );

					if ( !errorElm ) {
						currSubmitter = e.submitter;

						// Add submitter data if it is present (only if not a Postback form as it has its own method)
						if ( currSubmitter.name && !elm.classList.contains( "wb-postback" ) ) {
							btnAsInput = document.createElement( "input" );
							btnAsInput.type = "hidden";
							btnAsInput.name = currSubmitter.name;
							btnAsInput.value = currSubmitter.value;
							elm.appendChild( btnAsInput );
						}

						// Open modal
						if ( elm.PIIFields.length > 0 ) {
							generateModal( elm );

							$( "#" + piiModalID ).trigger( "open.wb-lbx", [
								[ {
									src: "#" + piiModalID,
									type: "inline"
								} ],
								true
							] );
						} else {
							if ( elm.classList.contains( "wb-postback" ) ) {
								$( elm ).trigger( "wb-postback.submit", currSubmitter );
							} else {
								elm.submit();
							}
						}
					}
				}, 50 );
			} );

			wb.ready( $elm, componentName );
		}
	},

	/*
	* Log all PII positive fields inside the form's "PIIFields" property
	* @param form: a reference to the form containing PII fields
	*/
	checkFormValues = function( form ) {
		let fieldsToScrub = form.querySelectorAll( "[" + attrScrubField + "]" );

		form.PIIFields = [];

		// identify form elements that were assigned to be scrubbed
		fieldsToScrub.forEach( ( field ) => {

			// If the field contains PII add field to list
			if ( wb.findPotentialPII( field.value, false ) ) {
				let fieldLabel = form.querySelector( "[for=" + field.id + "] > span.field-name" ),
					fieldLabelText = fieldLabel ? fieldLabel.innerText : form.querySelector( "[for=" + field.id + "]" ).innerText,
					scrubbedFieldValue = wb.findPotentialPII( field.value, true, { replaceWith: form.settings.scrubChar } ),
					scrubValHTML = wb.findPotentialPII( field.value.replace( /</g, "&lt;" ), true, { replaceWith: "<span role='img' aria-label='" + i18nText.redacted + "'>" + form.settings.scrubChar + "</span>" } );

				form.PIIFields.push( {
					elm: field,
					scrubVal: scrubbedFieldValue,
					scrubValHTML: scrubValHTML,
					label: fieldLabelText
				} );
			}
		} );

		if ( form.PIIFields.length === 1 ) {
			document.getElementById( form.PIIFields[ 0 ].elm.id ).focus();
		}

		// If PII is found, block Postback form submission
		form.PIIFields.length > 0 ? form.setAttribute( attrPIIBlocked, "true" ) : form.setAttribute( attrPIIBlocked, "false" );
	},

	/*
	* Scrub all PII positive fields
	* @param form: a reference to the form containing PII fields
	*/
	scrubFormValues = function( form ) {

		// Scrub the value of each PII positive fields
		form.PIIFields.forEach( ( field ) => {
			field.elm.value = field.scrubVal;
		} );

		// Clear PII fields as their value has been replaced by the scrubbed value
		form.PIIFields = [];
	},

	/*
	* Generate the modal UI
	* @param form: a reference to the form containing PII fields
	*/
	generateModal = function( form ) {
		let piiModalFields = "",
			piiModal = document.createElement( "section" ),
			moreInfoContent = form.settings.moreInfo ? form.settings.moreInfo : i18nText.viewMoreInfo,
			modalTemplate = form.querySelector( "template" + form.settings.modalTemplate );

		// Destroy modal if present
		if ( document.getElementById( piiModalID ) ) {
			document.getElementById( piiModalID ).remove();
		}

		// Generate PII fields list
		if ( form.PIIFields.length > 1 ) {
			piiModalFields += "<dl>";
			form.PIIFields.forEach( ( field ) => {
				piiModalFields += "<dt>" + field.label + "</dt><dd class=\"well well-sm\">" + field.scrubValHTML.replace( /\n/g, "<br>" ) + "</dd>";
			} );
			piiModalFields += "</dl>";
		} else {
			piiModalFields += "<div class=\"well well-sm\">" + form.PIIFields[ 0 ].scrubValHTML.replace( /\n/g, "<br>" ) + "</div>";
		}

		piiModal.id = piiModalID;
		piiModal.className = "modal-dialog modal-content overlay-def";
		piiModal.setAttribute( "data-form", form.id );

		if ( modalTemplate ) {
			piiModal.appendChild( modalTemplate.content.cloneNode( true ) );
		} else {
			piiModal.innerHTML = `<header class="modal-header">
					<h2 class="modal-title">${ i18nText.header }</h2>
				</header>
				<div class="modal-body">
					<p>${ i18nText.intro }</p>
					${ piiModalFields }
					<details class="mrgn-tp-md">
						<summary>${ i18nText.viewMore }</summary>
						${ moreInfoContent }
					</details>
				</div>
				<div class="modal-footer">
					<div class="row">
						<div class="col-xs-12 col-sm-5 mrgn-tp-sm"><button type="button" class="btn btn-link btn-block popup-modal-dismiss">${ i18nText.cancelBtn }</button></div>
						<div class="col-xs-12 col-sm-7 mrgn-tp-sm"><button type="button" class="btn btn-primary btn-block" ${ attrScrubSubmit }>${ i18nText.confirmBtn }</button></div>
					</div>
				</div>`;
		}

		// Using jQuery here to pass the content through DOMpurify
		$( "body" ).append( piiModal );

		// Add PII fields HTML if using a custom UI template
		if ( modalTemplate ) {

			// Fix for implementers that added the "popup-modal-dismiss" class to the submit button
			$( ".popup-modal-dismiss[" + attrScrubSubmit + "]" ).removeClass( "popup-modal-dismiss" );

			$( "#" + piiModalID + " [data-scrub-modal-fields]" ).html( piiModalFields );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Scrub the form fields on click of the "Confirm" button
$document.on( "click", "#" + piiModalID + " [" + attrScrubSubmit + "]", function( ) {
	let modal = document.getElementById( piiModalID ),
		form = document.getElementById( modal.dataset.form );

	scrubFormValues( form );

	if ( form.classList.contains( "wb-postback" ) ) {
		$( form ).trigger( "wb-postback.submit", currSubmitter );
	} else {
		form.submit();
	}

	$.magnificPopup.close();
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
