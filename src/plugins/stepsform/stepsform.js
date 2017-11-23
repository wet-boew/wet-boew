/**
 * @title WET-BOEW Form validation
 * @overview Provide ability for a form to be broken into steps.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @kodecount
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-steps",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	idCount = 0,
	i18n, i18nText,
	btnPrevious, btnNext, btnSubmit,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var eventTarget = wb.init( event, componentName, selector ),
			elmId;

		if ( eventTarget ) {
			elmId = eventTarget.id;

			// Ensure there is a unique id on the element
			if ( !elmId ) {
				elmId = componentName + "-id-" + idCount;
				idCount += 1;
				eventTarget.id = elmId;
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					prv: i18n( "prv" ),
					nxt: i18n( "nxt" )
				};
			}

			// Only initialize the buttons once
			if ( !btnPrevious || !btnNext || !btnSubmit ) {
				btnPrevious = createStepsButton( "a", "button", "mrgn-rght-sm mrgn-bttm-md", i18nText.prv );
				btnNext = createStepsButton( "a", "submit", "mrgn-bttm-md", i18nText.nxt );
				btnSubmit = createStepsButton( "input", "submit", "mrgn-bttm-md" );
			}

			/*
			 * Variable and function definitions
			 * These well be initialized once per instance of plugin.
			 */
			var form = eventTarget.getElementsByTagName( "FORM" )[ 0 ],
				fieldsets = ( form ) ? $( form ).children( "fieldset" ) : 0,
				settings = wb.getData( eventTarget, componentName ),
				hasStepsInitialized;

			/*
			 * Determines if html is correctly formatted and initialize all fieldsets/legend combitions into steps.
			 */
			for ( var i = 0, len = fieldsets.length; i < len; i++ ) {

				/*
				 * Variable and function definitions
				 * These well be initialized once per instance of each fieldset.
				 * Determines the following business rules:
				 *  -Only allow steps if elements are in proper order fieldset -> legend -> div
				 *  -Only allow NEXT button on first step
				 *  -Only allow final SUBMIT button on last step
				 */
				var fieldset = fieldsets[ i ],
					isFirstFieldset = ( i === 0 ) ? true : false,
					isLastFieldset = ( i === ( len - 1 ) ) ? true : false,
					legend = fieldset.firstElementChild,
					div = ( legend && legend.tagName.toUpperCase() === "LEGEND" ) ? legend.nextElementSibling : false;

				if ( div && div.tagName.toUpperCase() === "DIV" ) {
					var btnClone;
					hasStepsInitialized = true;

					if ( !isFirstFieldset ) {
						btnClone = btnPrevious.cloneNode( true );
						btnClone.id = componentName + "-btn-" + idCount;
						idCount += 1;

						setStepsBtnEvent( btnClone );
						div.appendChild( btnClone );
					}

					if ( !isLastFieldset ) {
						btnClone = btnNext.cloneNode( true );
						btnClone.id = componentName + "-btn-" + idCount;
						idCount += 1;

						setStepsBtnEvent( btnClone );
						div.appendChild( btnClone );
					} else {
						var btnValue = ( settings && settings.submitBtnVal ) ? settings.submitBtnVal : "X",
							btnName = ( settings && settings.submitBtnNme ) ? settings.submitBtnNme : "";

						btnClone = btnSubmit.cloneNode( true );
						btnClone.id = componentName + "-btn-" + idCount;
						idCount += 1;

						btnClone.value = btnValue;
						if ( btnName ) {
							btnClone.name = btnName;
						}
						div.appendChild( btnClone );
					}

					fieldset.setAttribute( "class", "wb-tggle-fildst" );
					div.setAttribute( "class", "hidden" );

					if ( isFirstFieldset ) {
						legend.setAttribute( "class", "wb-steps-active" );
						div.removeAttribute( "class" );
					}
				}
			}

			/*
			 * if steps has initialized hide any precreated submit or reset buttons
			 */
			if ( form && hasStepsInitialized ) {
				$( form ).children( "input" ).hide();
			}
		}
	},

	/**
	 * @method createStepsButton
	 * @param {string var} tagName, {string var} type, {boolean var} isPrimary, {string var} style, {string var} text
	 */
	createStepsButton = function( tagName, type, style, text ) {
		var isInput = (  tagName && tagName.toUpperCase() === "INPUT" ) ? true : false,
			control = document.createElement( tagName ),
			btnPrimary = "btn btn-md btn-primary",
			btnDefault = "btn btn-md btn-default";

		// set default attributes
		control.className = ( ( type && type.toUpperCase() === "SUBMIT" ) ? btnPrimary : btnDefault ) + " " + style;

		// set default attributes based on tagName
		if ( isInput ) {
			control.setAttribute( "type", "submit" );
		} else {
			control.href = "#";
			control.setAttribute( "aria-labelby", text );
			control.setAttribute( "role", type );
			control.innerHTML = text;
		}

		return control;
	},

	/**
	 * @method setStepsBtnEvent
	 * @param {JavaScript element} div
	 */
	setStepsBtnEvent = function( element ) {
		element.addEventListener( "click", function( evt ) {
			evt.preventDefault();

			var classes = ( this.className ) ? this.className.toUpperCase() : false,
				isNext = ( classes && classes.indexOf( "BTN-PRIMARY" ) > -1 ) ? true : false,
				isFormValid = true;

			// confirm if form is valid
			if ( isNext && jQuery.validator && jQuery.validator !== "undefined" ) {
				isFormValid =  $( "#" + this.parentElement.parentElement.parentElement.id ).valid();
			}

			// continue if valid
			if ( isFormValid ) {
				showSteps( this.parentElement, isNext );
				if ( isNext ) {
					this.parentElement.previousElementSibling.removeAttribute( "class" );
				}
			} else if ( isNext && !isFormValid ) {
				this.parentElement.previousElementSibling.setAttribute( "class", "wb-steps-error" );
			}
		} );
	},

	/**
	 * @method showSteps
	 * @param {JavaScript element} div and {boolean var} isNext
	 */
	showSteps = function( div, isNext ) {
		var fieldset, legend;

		if ( div ) {
			div.setAttribute( "class", "hidden" );

			legend = ( div.previousElementSibling ) ? div.previousElementSibling : false;
			if ( legend ) {
				legend.removeAttribute( "class" );
			}

			fieldset = ( !isNext ) ? div.parentElement.previousElementSibling : div.parentElement.nextElementSibling;
			if ( fieldset ) {
				legend = fieldset.getElementsByTagName( "LEGEND" )[ 0 ];
				div = fieldset.getElementsByTagName( "DIV" )[ 0 ];
				if ( legend ) {
					legend.setAttribute( "class", "wb-steps-active" );
				}
				if ( div ) {
					div.removeAttribute( "class" );
				}
			}
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
