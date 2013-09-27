/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Ajax Loader [ data-append ]
    _author : World Wide Web
    _notes  : A basic AjaxLoader wrapper for WET-BOEW that appends to elements
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function ( $, window, vapour ) {

"use strict";

$.ajaxSettings.cache = false;

var $document = vapour.doc;

$document.on( "timerpoke.wb ajax-fetched.wb", "[data-ajax-append]", function (
    event ) {
    var eventType = event.type,
        _elm = $( this ),
        _url;

    switch ( eventType ) {
    case "timerpoke":
        window._timer.remove( "[data-ajax-after]" );
        _url = _elm.data( "ajax-after" );
        $document.trigger({
            type: "ajax-fetch.wb",
            element: _elm,
            fetch: _url
        });
        break;
    case "ajax-fetched":
        _elm.after( event.pointer.html() );
        _elm.trigger( "ajax-after-loaded.wb" );
        break;

    }
    return false;
} );

window._timer.add( "[data-ajax-after]" );

})( jQuery, window, vapour );
