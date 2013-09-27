/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : JavaScript Carousel
    _author : World Wide Web
    _notes  : A JavaScript carousel for WET-BOEW
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function($, window, vapour, undef) {
    "use strict";
    var $document = vapour.doc,
        selector = ".wb-carousel",
        controls = selector + " .prv, " + selector + " .nxt, " + selector + " .plypause";


    $document.on("timerpoke.wb carousel-init.wb shift.wb", selector, function(event) {
        var eventType = event.type,
            _sldr = $(this);

        switch (eventType) {
            case "timerpoke":
                if (_sldr.attr("data-delay") === undef) {
                    _sldr.trigger("carousel-init.wb");
                    return false;
                }
                /* state stopped*/
                if (_sldr.hasClass("stopped")) {
                    return false;
                }
                /* continue;*/

                /* add settings and counter*/
                var _setting = parseFloat(_sldr.attr("data-delay")),
                    _delay = parseFloat(_sldr.attr("data-ctime"));
                _delay += 0.5;

                /* check if we need*/

                if (_setting < _delay) {
                    _sldr.trigger("shift.wb");
                    _delay = 0;
                }
                _sldr.attr("data-ctime", _delay);
                break;

                /* ------ Init --------------*/
            case "carousel-init":
                var _interval = 6;
                if (_sldr.hasClass("slow")) {
                    _interval = 9;
                }
                if (_sldr.hasClass("fast")) {
                    _interval = 3;
                }
                _sldr.find(".item:not(.in)").addClass("out");
                _sldr.attr("data-delay", _interval).attr("data-ctime", 0);
                break;

                /* ------ Change Slides --------------*/
            case "shift":
                var _items = _sldr.find(".item"),
                    _current = _sldr.find(".item.in").prevAll(".item").length,
                    _shiftto = (event.shiftto) ? event.shiftto : 1,
                    _next = _current > _items.length ? 0 : _current + _shiftto;
                _next = (_next > _items.length - 1 || _next < 0) ? 0 : _next;
                _items.eq(_current).removeClass("in").addClass("out");
                _items.eq(_next).removeClass("out").addClass("in");
                break;
        }
        return false;
    });

    /* ------ Next / Prev --------------*/
    $document.on("click", controls, function(event) {
        event.preventDefault();
        var _elm = $(this),
            _sldr = _elm.parents(".wb-carousel"),
            _action = _elm.attr("class");

        switch (_action) {
            case "prv":
                _elm.trigger("shift.wb", {
                    shiftto: 1
                });
                break;
            case "nxt":
                _elm.trigger("shift.wb", {
                    shiftto: -1
                });
                break;
            default:
                _sldr.toggleClass("stopped");
        }
        _sldr.attr("data-ctime", 0);
        return false;
    });

    /* ------ Register carousel --------------*/
    window._timer.add(".wb-carousel");
})(jQuery, window, vapour);
