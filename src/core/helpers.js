/*
JQuery Helper Methods v1.0
Release: 31/07/2013
Author: WET Community
Credits: http://kaibun.net/blog/2013/04/19/a-fully-fledged-coffeescript-boilerplate-for-jquery-plugins/


Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/
(function ($, window, document, undef) {
    "use strict";
    var methods,
        _settings = {
            "default": "wet-boew"
        };
    methods = {
        init: function (options) {
            return $.extend(_settings, options || {});
        },
        show: function (onlyAria) {
            var $this = $(this);
            $this.each(function () {
                var elm;
                elm = $(this);
                elm.attr("aria-hidden", "false");
                if (onlyAria === undef) {
                    elm.removeClass("wb-invisible");
                }
            });
        },
        hide: function (onlyAria) {
            $(this).each(function () {
                var elm;
                elm = $(this);
                elm.attr("aria-hidden", "true");
                if (onlyAria === undef) {
                    return elm.addClass("wb-invisible");
                }
            });
        },
        toggle: function (to, from) {
            $(this).addClass(to).removeClass(from);
        }
    };
    $.fn.wb = function (method) {
        if (methods[method]) {
            methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jquery.wb");
        }
    };
})(jQuery, window, document);
/*
:focusable and :tabable jQuery helper expressions - https://github.com/jquery/jquery-ui/blob/24756a978a977d7abbef5e5bce403837a01d964f/ui/jquery.ui.core.js
*/
(function ($) {
    "use strict";
    function focusable(element, isTabIndexNotNaN, visibility) {
        var map, mapName, img,
            nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        if (visibility) {
            return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled :
                "a" === nodeName ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
            // the element and all of its ancestors must be visible
            visible(element);
        } else {
            return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled :
                "a" === nodeName ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN);
        }
    }

    function visible(element) {
        return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
            return $.css(this, "visibility") === "hidden";
        }).length;
    }
    $.extend($.expr[":"], {
        data: $.expr.createPseudo ? $.expr.createPseudo(function (dataName) {
            return function (elem) {
                return !!$.data(elem, dataName);
            };
        }) :
        // support: jQuery <1.8

        function (elem, i, match) {
            return !!$.data(elem, match[3]);
        },
        focusable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },
        discoverable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },
        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex"),
                isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });
})(jQuery);
/*
Peformant micro templater
@credit: https://github.com/premasagar/tim/blob/master/tinytim.js
@todo: caching
*/
(function ($, window, undef) {
    "use strict";
    var tmpl = (function () {
        var start = "{{",
            end = "}}",
            path = "[a-z0-9_$][\\.a-z0-9_]*", // e.g. config.person.name
            pattern = new RegExp(start + "\\s*(" + path + ")\\s*" + end, "gi");
        return function (template, data) {
            // Merge data into the template string
            return template.replace(pattern, function (tag, token) {
                var path = token.split("."),
                    len = path.length,
                    lookup = data,
                    i = 0;
                for (; i < len; i++) {
                    lookup = lookup[path[i]];
                    // Property not found
                    if (lookup === undef) {
                        throw "tim: '" + path[i] + "' not found in " + tag;
                    }
                    // Return the required value
                    if (i === len - 1) {
                        return lookup;
                    }
                }
            });
        };
    }());
    window.tmpl = tmpl;
})(jQuery, window);