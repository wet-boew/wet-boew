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
	i18n, i18nText,
	btnPrevious, btnNext, btnSubmit,

	/**
	 * @method init
	 * @param {jQuery Event} evt Event that triggered the function call
	 */
	init = function( evt ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( evt, componentName, selector );

		if ( elm ) {

			// Ensure there is a unique id on the element
			if ( !elm.id ) {
				elm.id = wb.getId();
			}

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					prv: i18n( "prv" ),
					nxt: i18n( "nxt" )
				};
			}

			/*
			 * Variable and function definitions
			 * These will be initialized once per instance of plugin.
			 */
			var form = elm.getElementsByTagName( "FORM" )[ 0 ],
				fieldsets = ( form ) ? $( form ).children( "fieldset" ) : 0,
				hasStepsInitialized;

			// Initialize navigation buttons
			btnPrevious = createStepsButton( "A", "prev", "mrgn-rght-sm mrgn-bttm-md", i18nText.prv );
			btnNext = createStepsButton( "A", "next", "mrgn-bttm-md", i18nText.nxt );
			btnSubmit = form.querySelector( "input[type=submit], button[type=submit]" );
			btnSubmit.classList.add( "mrgn-bttm-md" );

			/*
			 * Determines if html is correctly formatted and initialize all fieldsets/legend combinations into steps.
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
					div = ( legend && legend.tagName === "LEGEND" ) ? legend.nextElementSibling : false;

				if ( div && div.tagName === "DIV" ) {
					var btnClone;
					hasStepsInitialized = true;

					if ( !isFirstFieldset ) {
						btnClone = btnPrevious.cloneNode( true );

						setStepsBtnEvent( btnClone );
						div.appendChild( btnClone );
					}

					if ( !isLastFieldset ) {
						btnClone = btnNext.cloneNode( true );

						setStepsBtnEvent( btnClone );
						div.appendChild( btnClone );
					} else {
						div.appendChild( btnSubmit );
					}

					fieldset.classList.add( "wb-tggle-fildst" );
					div.classList.add( "hidden" );

					if ( isFirstFieldset ) {
						legend.classList.add( "wb-steps-active" );
						div.classList.remove( "hidden" );
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
	 * @returns {Object} A ready-to-use button element
	 */
	createStepsButton = function( tagName, type, style, text ) {
		var control = document.createElement( tagName ),
			btnPrimary = "btn btn-md btn-primary",
			btnDefault = "btn btn-md btn-default";

		// set default attributes
		control.className = ( type === "prev" ? btnDefault : btnPrimary ) + " " + style;
		control.href = "#";
		control.setAttribute( "aria-labelby", text );
		control.setAttribute( "rel", type );
		control.setAttribute( "role", "button" );
		control.innerHTML = text;

		return control;
	},

	/**
	 * @method setStepsBtnEvent
	 * @param {JavaScript element} elm
	 */
	setStepsBtnEvent = function( elm ) {
		elm.addEventListener( "click", function( evt ) {
			evt.preventDefault();

			var classes = ( this.className ) ? this.className : false,
				isNext = ( classes && classes.indexOf( "btn-primary" ) > -1 ),
				isFormValid = true;

			// confirm if form is valid
			if ( isNext && jQuery.validator && jQuery.validator !== "undefined" ) {
				isFormValid =  $( "#" + this.parentElement.parentElement.parentElement.id ).valid();
			}

			// continue if valid
			if ( isFormValid ) {
				showSteps( this.parentElement, isNext );
				if ( isNext ) {
					this.parentElement.previousElementSibling.classList.remove( "wb-steps-error" );
				}
			} else if ( isNext && !isFormValid ) {
				this.parentElement.previousElementSibling.classList.add( "wb-steps-error" );
			}
		} );
	},

	/**
	 * @method showSteps
	 * @param {JavaScript element} elm and {boolean var} isNext
	 */
	showSteps = function( elm, isNext ) {
		var fieldset, legend;

		if ( elm ) {
			elm.classList.add( "hidden" );

			legend = ( elm.previousElementSibling ) ? elm.previousElementSibling : false;
			if ( legend ) {
				legend.classList.remove( "wb-steps-active" );
			}

			fieldset = ( !isNext ) ? elm.parentElement.previousElementSibling : elm.parentElement.nextElementSibling;
			if ( fieldset ) {
				legend = fieldset.getElementsByTagName( "LEGEND" )[ 0 ];
				elm = fieldset.getElementsByTagName( "DIV" )[ 0 ];
				if ( legend ) {
					legend.classList.add( "wb-steps-active" );
				}
				if ( elm ) {
					elm.classList.remove( "hidden" );
				}
			}
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
