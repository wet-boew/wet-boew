/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Ajax Loader [ data-replace ]
    _author : World Wide Web
    _notes  : A basic AjaxLoader wrapper for WET-BOEW
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function ( $, window, vapour ) {
"use strict";

$.ajaxSettings.cache = false;

var $document = vapour.doc;

$document.on( "timerpoke.wb", "[data-ajax-replace]", function () {
    window._timer.remove( "[data-ajax-replace]" );

    var _elm = $( this ),
        _url = _elm.data( "ajax-replace" );

    _elm.load( _url, function () {
        _elm.removeAttr( "data-ajax-replace" )
            .trigger( "ajax-replace-loaded.wb" );
    });
    return false;
});

window._timer.add( "[data-ajax-replace]" );

})( jQuery, window, vapour );
