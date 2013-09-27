/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : JavaScript Carousel
    _author : World Wide Web
    _notes  : A JavaScript carousel for WET-BOEW
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function ( $, window, vapour) {

"use strict";

var $document = vapour.doc,
    selector = ".wb-carousel",
    controls = selector + " .prv, " + selector + " .nxt, " + selector + " .plypause",
    carousel;

carousel = {
    onTimerPoke: function( _elm ) {
        var _setting,
            _delay;

        if ( _elm.attr( "data-delay" ) === undefined ) {
            _elm.trigger( "carousel-init.wb" );
            return false;
        }
        /* state stopped*/
        if ( _elm.hasClass( "stopped" ) ) {
            return false;
        }
        /* continue;*/

        /* add settings and counter*/
        _setting = parseFloat( _elm.attr( "data-delay" ) );
        _delay = parseFloat( _elm.attr( "data-ctime" ) );
        _delay += 0.5;

        /* check if we need*/

        if ( _setting < _delay ) {
            _elm.trigger( "shift.wb" );
            _delay = 0;
        }
        _elm.attr( "data-ctime", _delay );
    },

    onInit: function ( _elm ) {
        var _interval = 6;

        if ( _elm.hasClass( "slow" ) ) {
            _interval = 9;
        }
        if ( _elm.hasClass( "fast" ) ) {
            _interval = 3;
        }
        _elm.find( ".item:not(.in)" )
            .addClass( "out" );
        _elm.attr( "data-delay", _interval )
            .attr( "data-ctime", 0 );
    },

    onShift: function ( _elm ) {
        var _items = _elm.find( ".item" ),
            _current = _elm.find( ".item.in" ).prevAll( ".item" ).length,
            _shiftto = ( event.shiftto ) ? event.shiftto : 1,
            _next = _current > _items.length ? 0 : _current + _shiftto;

        _next = ( _next > _items.length - 1 || _next < 0 ) ? 0 : _next;
        _items.eq( _current ).removeClass( "in" ).addClass( "out" );
        _items.eq( _next ).removeClass( "out" ).addClass( "in" );
    },

    onCycle: function ( _elm, shifto ) {
        _elm.trigger( "shift.wb", {
            shiftto: shifto
        } );
    }


};

$document.on( "timerpoke.wb carousel-init.wb shift.wb", selector, function ( event ) {

    var eventType = event.type,
        _elm = $( this );

    switch ( eventType ) {
    case "timerpoke":
        carousel.onTimerPoke.apply(this, _elm);
        break;

        /* ------ Init --------------*/
    case "carousel-init":
        carousel.onInit.apply(this, _elm);
        break;

        /* ------ Change Slides --------------*/
    case "shift":
        carousel.onShift.apply(this, _elm);
        break;
    }
    return false;
} );

/* ------ Next / Prev --------------*/
$document.on( "click", controls, function ( event ) {
    event.preventDefault( );
    var _elm = $( this ),
        _sldr = _elm.parents( ".wb-carousel" ),
        _action = _elm.attr( "class" );

    switch ( _action ) {
    case "prv":
        carousel.onCycle.apply(this, _elm, 1);
        break;
    case "nxt":
        carousel.onCycle.apply(this, _elm, -1);
        break;
    default:
        _sldr.toggleClass( "stopped" );
    }
    _sldr.attr( "data-ctime", 0 );
    return false;
} );

/* ------ Register carousel --------------*/
window._timer.add( ".wb-carousel" );

})( jQuery, window, vapour );
