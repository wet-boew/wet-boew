/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Data Inview Plugin v1.0
    _author : WET Community
    _notes  : A simplified data-attribute driven plugin that responds to moving in and out of the viewport.
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function ( $, window, vapour ) {

"use strict";

var $document = vapour.doc;

$document.on( "timerpoke.wb", ".wb-inview", function () {
    window._timer.remove( ".wb-inview" );

    var $window = vapour.win,
        $this = $( this ),
        $message = $this.find( ".pg-banner, .pg-panel" )
            .attr( "role", "toolbar" )
            .attr( "aria-hidden", "true" );

    $window.on( "scroll scrollstop resize", function () {
        $this.trigger( "scroll.wb-inview" );
    });

    $this.on( "scroll.wb-inview", function () {
        var _elm = $( this ),
            _viewport = $window,
            elementWidth = _elm.outerWidth(),
            elementHeight = _elm.outerHeight(),
            viewportHeight = _viewport.height(),
            scrollTop = _viewport.scrollTop(),
            scrollLeft = _viewport.scrollLeft(),
            scrollRight = scrollLeft + elementWidth,
            scrollBottom = scrollTop + viewportHeight,
            x1 = _elm.offset()
                .left,
            x2 = x1 + elementWidth,
            y1 = _elm.offset()
                .top,
            y2 = y1 + elementHeight;
        if ( ( scrollBottom < y1 || scrollTop > y2 ) || ( scrollRight < x1 ||
            scrollRight > x2 ) ) {
            $message.removeClass( "in" )
                .addClass( "out" )
                .wb( "hide", true );
        }
        else {
            $message.removeClass( "out" )
                .addClass( "in" )
                .wb( "show", true );
        }
        return false;
    });

    $this.trigger( "scroll.wb-inview" );

    return false;
});

window._timer.add( ".wb-inview" );

})( jQuery, window, vapour );
