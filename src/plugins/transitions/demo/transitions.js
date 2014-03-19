/**
 * @title WET-BOEW v4.0 Plugin template
 * @overview Explain the plug-in or any third party lib that it is inspired by
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @YOU or WET Community
 */

/**

(function ( $, window, wb ) {
"use strict";

// Variable and function definitions.
// These are global to the plugin - meaning that they will be initialized once per page,
// not once per instance of plugin on the page. So, this is a good place to define
// variables that are common to all instances of the plugin on a page.
var pluginName = "wb-transitions",
    selector = "." + pluginName,
    initedClass = pluginName + "-inited",
    initEvent = "wb-init" + selector,
    otherEvent = "otherevent" + selector,
    $document = wb.doc,
                i18n,
                i18nText,
    // Plugin users can override these defaults by setting attributes on the html elements
    // that the selector matches. For example, adding the attribute data-option1="false"
    // will override option1 for that plugin instance.
    defaults = {
        option1: true,
        option2: false,
        debug: false
    },

     // Init runs once per plugin element on the page. There may be multiple elements.
     // It will run more than once per plugin if you don't remove the selector from the timer.
     // @method init
     // @param {jQuery DOM element} $elm The plugin element being initialized
    init = function( $elm ) {

        // Only initialize the element once
        if ( !$elm.hasClass( initedClass ) ) {

            // All plugins need to remove their reference from the timer in the
            // init sequence unless they have a requirement to be poked every 0.5 seconds
            wb.remove( selector );
            $elm.addClass( initedClass );

            // Read the selector node for parameters
            var modeJS = wb.getMode() + ".js",

            // Merge default settings with overrides from the selected plugin element.
            // There may be more than one, so don't override defaults globally!
            settings = $.extend( {}, defaults, $elm.data() );

            // Only initialize the i18nText once
            if ( !i18nText ) {
                i18n = wb.i18n;
                i18nText = {
                    placeholder: i18n( "%placeholdertext" ),
                    noVideo: i18n( "%no-video" )
                };
            }

            // More Code ......

            // Bind the merged settings to the element node for faster access in other events.
            $elm.data({ settings: settings });

            window.Modernizr.load({

                // For loading multiple dependencies
                both: [
                    "site!deps/dep1" + modeJS,
                    "site!deps/dep2" + modeJS
                ],
                complete: function () {

                    // Trigger next event
                    $elm.trigger( otherEvent );
                }
            });
        }
    },

    // We start the logic for what the plugin truly does
    // For demonstration purposes lets display some text with an alert
    // @method otherEvent
    // @param {jQuery DOM element} $elm The plugin element
    // @param {jQuery Event} event The event that triggered this method call
    otherEvent = function( $elm, event ) {

        // Lets get the settings
        var settings = $elm.data( "settings" ),
            $target = $( event.target ),
            myAddition = "<span class='message'>" + ( !settings.option1 ? i18nText.placeholderText : i18nText.noVideo ) + "</span>";

        // Now lets add it to the target of the event
        $target.append( myAddition );
    },

    // We start the logic for what the plugin truly does
    // For demonstration purposes lets display the user's current location with an alert
    // @method onClick
    // @param {jQuery DOM element} $elm The plugin element
    // @param {jQuery Event} event The event that triggered this method call
    // @returns {Boolean} Control propagation of the event
    onClick = function( $elm, event ) {
        var url = wb.pageUrlParts,
            which = event.which;

        // Leverage the object returned from wb
        $elm.append( ( which === 1 ? url.href : $url.params.feedback ) );

        // Is equal to event.stopPropagation() and event.preventDefault();
        return false;
    };

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent + " " + otherEvent + " click", selector, function( event ) {
    var eventTarget = event.target,
        eventType = event.type,
        $elm;

    // Filter out any events triggered by descendants
    if ( event.currentTarget === eventTarget ) {
        $elm = $( eventTarget );

        switch ( eventType ) {
        case "timerpoke":
        case "wb-init":
            init( $elm );
            break;
        case "otherevent":
            otherEvent( $elm, event );
            break;
        case "click":
            onClick( $elm, event );
            break;
        }
    }

     // Since we are working with events we want to ensure that we are being passive
     // about our control, so returning true allows for events to always continue
    return true;
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );

/**/
