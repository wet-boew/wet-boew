/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Chart  functionality WET
 */
/*global jQuery: false*/
(function ($) {
    var _pe = window.pe || {
        fn: {}
    }; /* local reference */
    _pe.fn.charts = {
        type: 'plugin',
        depends: ['excanvas', 'flot'],
        _exec: function (elm) {
            var $elm, cols, data, rows, _canvas, _table;
            $elm = $(elm);
            _canvas = $elm.find(".chart-canvas");
            if (!_canvas.hasClass("fixed-size")) {
                _canvas.height(Math.round(_canvas.width() / 1.61663));
            }
            _table = $(elm).find("table").eq(0);
            data = [];
            cols = rows = [];
            _table.find("thead td, thead th").each(function () {
                return cols.push($(this).text());
            });
            _table.find("tbody tr").each(function () {
                var _data;
                _data = {
                    label: "",
                    data: []
                };
                _data.label = $(this).find("th").eq(0).text();
                $(this).find("td").each(function (index) {
                    return _data.data.push([cols[index + 1], $(this).text()]);
                });
                return data.push(_data);
            });
            $.plot(_canvas, data, {
                xaxis: {
                    tickDecimals: 0
                }
            });
        } // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));