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
         defaults = {},
         i18nDict = {
             en: {
                 "exitscript-warning": "Warning",
                 "exitscript-exitMsg": "You are about to leave a secure site, do you wish to continue?",
                 "exitscript-yesMsg": "Yes",
                 "exitscript-cancelMsg": "Cancel",
             },
             fr: {
                 "exitscript-warning": "Avertissement",
                 "exitscript-exitMsg": "Vous êtes sur le point de quitter un site sécurisé. Voulez-vous continuer?",
                 "exitscript-yesMsg": "Oui",
                 "exitscript-cancelMsg": "Annuler",
             }
         },
         /**
          * @method init
          * @param {jQuery Event} event Event that triggered the function call
          */
         init = function( event ) {

             var elm = wb.init( event, componentName, selector ),
                 $elm,
                 settings;
             if ( elm ) {
                 $elm = $( elm );
                 settings = $.extend(
                     true,
                     defaults, {},
                     window[ componentName ],
                     wb.getData( $elm, componentName )
                 );
                 i18nDict = i18nDict[ $( "html" ).attr( "lang" ) || "en" ];
                 i18nDict = {
                     warning: i18nDict[ "exitscript-warning" ],
                     exitMsg: i18nDict[ "exitscript-exitMsg" ],
                     yesMsg: i18nDict[ "exitscript-yesMsg" ],
                     cancelMsg: i18nDict[ "exitscript-cancelMsg" ]
                 };
                 $elm.trigger( "setModaldialog", settings );
                 var exitParam = "?" + encodeURIComponent( "targetUrl=" + String( this.href ) );
                 if ( settings.targetBlank ) {
                     exitParam = exitParam + encodeURIComponent( "&&targetBlank=true" );
                 }
                 // Set default properties
                 if ( settings.displayModal != false ) {
                     if ( !settings.targetBlank ) {
                         settings.targetBlank = ""
                     } else {
                         settings.targetBlank = "target='_blank'"
                     }
                     if ( !settings.exitMsg ) {
                         settings.exitMsg = i18nDict.exitMsg
                     }
                     if ( !settings.yesMsg ) {
                         settings.yesMsg = i18nDict.yesMsg
                     }
                     if ( !settings.cancelMsg ) {
                         settings.cancelMsg = i18nDict.cancelMsg
                     }
                     var tpl = document.createElement( "div" );
                     tpl.id = "tm";
                     tpl.innerHTML = "<section id='sExitModal' class='mfp-hide modal-dialog modal-content overlay-def'>" +
                         "<header class='modal-header'><h2 class='modal-title'>" + i18nDict.warning + "</h2></header>" +
                         "<div class='modal-body'>" +
                         "<p>" + settings.exitMsg + "</p>" +
                         "<ul class='list-inline text-center'>" +
                         "<li><button class='btn btn-primary popup-modal-dismiss pull-left' id='eCancel'>" + settings.cancelMsg + "</button></li>" +
                         "<li><a class='btn btn-default pull-right popup-modal-close' " + settings.targetBlank + " href='" + settings.exitURL + exitParam + "' type='button'>" + settings.yesMsg + "</a></li>" +
                         "</ul></div></section>";
                     var moDal = document.createDocumentFragment();
                     moDal.appendChild( tpl );
                     document.body.appendChild( moDal );

                     //Unwrap div id="tm"
                     var wrapper = document.querySelector( '#tm' );
                     wrapper.outerHTML = wrapper.innerHTML;
                 }
                 wb.ready( $elm, componentName );
             }
         };
     // Add your plugin event handler
     $document.on( "click", selector, function( ev ) {
         ev.preventDefault();

         var elm = event.currentTarget,
             $elm = $( elm );
         var settings = $.extend(
             defaults, {}
         );
         var exitParam = "?" + encodeURIComponent( "targetUrl=" + String( this.href ) );
         if ( settings.targetBlank ) {
             exitParam = exitParam + encodeURIComponent( "&&targetBlank=true" );
         }
         if ( settings.displayModal != false ) {
             $document.trigger("open.wb-lbx", [
                 [{
                     src: "#sExitModal",
                     type: "inline"
                 }],
                 true
             ]);

         } else {

             if ( settings.displayModal == false && settings.targetBlank != true ) {
                 self.location.href = ( settings.exitURL +  exitParam );
             } else {
                 window.open( settings.exitURL + exitParam );
             }

         }

     });
	 
     $( document ).on( "click", ".popup-modal-close", function( event ) {
         $.magnificPopup.close();
     });
	 
     // Bind the init event of the plugin
     $document.on( "timerpoke.wb " + initEvent, selector, init );
	 
     // Add the timer poke to initialize the plugin
     wb.add( selector );
	 
 })( jQuery, window, wb );