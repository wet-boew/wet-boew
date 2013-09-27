/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Ajax Loader [ data-append ]
    _author : World Wide Web
    _notes  : A basic AjaxLoader wrapper for WET-BOEW that appends to elements
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function($, window, vapour) {
    "use strict";

    $.ajaxSettings.cache = false;
    var $document = vapour.doc;
    $document.on("timerpoke.wb ajax-fetched.wb", "[data-ajax-before]", function(event) {

        var eventType = event.type,
            _elm = $(this);

        switch (eventType) {
            case "timerpoke":
                window._timer.remove("[data-ajax-before]");
                var _url = _elm.data("ajax-before");

                $document.trigger({
                    type: "ajax-fetch.wb",
                    element: _elm,
                    fetch: _url
                });

                break;
            case "ajax-fetched":
                _elm.before(event.pointer.html());
                _elm.trigger("ajax-after-loaded.wb");
                break;
        }
        return false;
    });
    window._timer.add("[data-ajax-before]");
})(jQuery, window, vapour);
