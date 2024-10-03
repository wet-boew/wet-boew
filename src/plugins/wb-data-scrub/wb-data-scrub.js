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
	attrBlocked = "data-wb-blocked",
	attrScrubForm = "data-wbscrub-form",
	piiModalID = componentName + "-modal",
	i18n, i18nText,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {
			var	form = elm.form;

			// Initialize i18n strings
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					header: i18n( "pii-header" ),
					intro: i18n( "pii-intro" ),
					viewMore: i18n( "pii-view-more" ),
					viewMoreIntro: i18n( "pii-view-more-intro" ),
					viewMoreitem1: i18n( "pii-view-more-item-1" ),
					viewMoreitem2: i18n( "pii-view-more-item-2" ),
					viewMoreitem3: i18n( "pii-view-more-item-3" ),
					viewMoreitem4: i18n( "pii-view-more-item-4" ),
					viewMoreitem5: i18n( "pii-view-more-item-5" ),
					yesBtn: i18n( "pii-yes-btn" ),
					cancelBtn: i18n( "pii-cancel-btn" )
				};
			}

			// Block form submission for Postback forms by default
			form.setAttribute( attrBlocked, "true" );

			// Ensure the form has an ID
			form.id = form.id ? form.id : wb.getId();

			if ( !form.isPIIinited ) {
				form.addEventListener( "submit", function( event ) {
					event.preventDefault();

					// Go through form values
					checkFormValues( form );

					// Open modal
					if ( form.PIIFields.length > 0 ) {
						generateModal( form );

						$( "#" + piiModalID ).trigger( "open.wb-lbx", [
							[ {
								src: "#" + piiModalID,
								type: "inline"
							} ],
							true
						] );
					} else {

						// Unblock form submission if no PII is found
						form.removeAttribute( attrBlocked );

						// Submit the form if it isn't a Postback form else trigger the postback submit
						if ( !form.classList.contains( "wb-postback" ) ) {
							event.currentTarget.submit();
						} else {
							$( form ).trigger( "wb-postback.submit", { event } );
						}
					}
				} );

				// This is to prevent this event listener to be added for
				// every field with the attribute "data-rule-wbscrub"
				form.isPIIinited = true;
			}

			wb.ready( $( elm ), componentName );
		}
	},

	/*
	* Log all PII positive fields inside the form's "PIIFields" property
	* @param form: a reference to the form containing PII fields
	*/
	checkFormValues = function( form ) {
		let fieldsToScrub = form.querySelectorAll( selector );

		form.PIIFields = [];

		// identify form elements that were assigned to be scrubbed
		fieldsToScrub.forEach( ( field ) => {

			// If the field contains PII add field to list
			if ( wb.findPotentialPII( field.value, false ) ) {
				let currFieldValue = field.value,
					scrubbedFieldValue = wb.findPotentialPII( field.value, true, { replaceWith: "********" } ),
					fieldLabel = form.querySelector( "[for=" + field.id + "] > span.field-name" ),
					fieldLabelText = fieldLabel ? fieldLabel.innerText : form.querySelector( "[for=" + field.id + "]" ).innerText;

				form.PIIFields.push( {
					id: field.id,
					currVal: currFieldValue,
					scrubVal: scrubbedFieldValue,
					label: fieldLabelText
				} );
			}
		} );

		if ( form.PIIFields.length === 1 ) {
			document.getElementById( form.PIIFields[ 0 ].id ).focus();
		}

		// If PII is found, block Postback form submission
		form.PIIFields.length > 0 ? form.setAttribute( attrBlocked, "true" ) : form.setAttribute( attrBlocked, "false" );
	},

	/*
	* Scrub all PII positive fields
	* @param form: a reference to the form containing PII fields
	*/
	scrubFormValues = function( form ) {

		// Scrub the value of each PII positive fields
		form.PIIFields.forEach( ( field ) => {
			let fieldElm = document.getElementById( field.id );

			fieldElm.value = field.scrubVal;
		} );

		// Clear PII fields as their value has been replaced by the scrubbed value
		form.PIIFields = [];

		// Unblock form submission as there are no longer PII concerns
		form.removeAttribute( attrBlocked );
	},

	/*
	* Generate the modal UI
	* @param form: a reference to the form containing PII fields
	*/
	generateModal = function( form ) {
		let piiModalFields = "",
			piiModal = document.createElement( "section" );

		// Destroy modal if present
		if ( document.getElementById( piiModalID ) ) {
			document.getElementById( piiModalID ).remove();
		}

		// Generate PII fields list
		form.PIIFields.forEach( ( field ) => {
			piiModalFields += "<dt>" + field.label + "</dt><dd><code>" + field.scrubVal + "</code></dd>";
		} );

		piiModal.id = piiModalID;
		piiModal.className = "modal-dialog modal-content overlay-def";
		piiModal.innerHTML = `<header class="modal-header">
				<h2 class="modal-title">${i18nText.header}</h2>
			</header>
			<div class="modal-body">
				<p>${i18nText.intro}</p>
				<dl class="dl-horizontal">${piiModalFields}</dl>
				<details class="mrgn-tp-md">
					<summary>${i18nText.viewMore}</summary>
					<p>${i18nText.viewMoreIntro}</p>
					<ul>
						<li>${i18nText.viewMoreitem1}</li>
						<li>${i18nText.viewMoreitem2}</li>
						<li>${i18nText.viewMoreitem3}</li>
						<li>${i18nText.viewMoreitem4}</li>
						<li>${i18nText.viewMoreitem5}</li>
					</ul>
				</details>
			</div>
			<div class="modal-footer">
				<div class="row">
					<div class="col-xs-12 col-sm-5 mrgn-tp-sm"><button class="btn btn-primary btn-block popup-modal-dismiss">${i18nText.cancelBtn}</button></div>
					<div class="col-xs-12 col-sm-7 mrgn-tp-sm"><button class="btn btn-link btn-block popup-modal-dismiss" ${attrScrubForm}="${form.id}">${i18nText.yesBtn}</button></div>
				</div>
			</div>`;

		document.body.appendChild( piiModal );
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Scrub the form fields on click of the "Confirm" button
$document.on( "click", "[" + attrScrubForm + "]", function( event ) {
	let form = document.getElementById( event.target.dataset.wbscrubForm );

	scrubFormValues( form );
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );
