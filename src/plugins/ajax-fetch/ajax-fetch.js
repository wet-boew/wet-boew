/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Ajax Fetch [ ajax-fetch ]
    _author : World Wide Web
    _notes  : A basic AjaxLoader wrapper for WET-BOEW that appends to elements
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function($, window, vapour) {
    "use strict";
    $.ajaxSettings.cache = false;

    var $document = vapour.doc;

    /* internal core functions*/

    var generateSerial = function(len) {

        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
            string_length = len,
            randomstring = "",
            counter = 0;

        while (counter < string_length) {
            var letterOrNumber = Math.floor(Math.random() * 2);
            if (letterOrNumber === 0) {
                var newNum = Math.floor(Math.random() * 9);
                randomstring += newNum;
            } else {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
            counter++;
        }
        return randomstring;
    };

    $document.on("ajax-fetch.wb", function(event) {
        var _caller = event.element,
            _url = event.fetch,
            _id = "wb" + (generateSerial(8));

        $("<div id='" + _id + "' />").load(_url, function() {
            $(_caller).trigger({
                type: "ajax-fetched.wb",
                pointer: $(this)
            });
        });

    });
})(jQuery, window, vapour);
