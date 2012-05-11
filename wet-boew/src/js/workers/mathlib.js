/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Mathlib
 */
/*global jQuery: false, pe: false*/
(function ($) {
    var _pe = window.pe || {
        fn: {}
    }; /* local reference */
    _pe.fn.mathlib = {
        type: 'plugin',
        support: (function () {
            var hasMathML = false, ns, div, mfrac;
            if (document.createElementNS) {
                ns = "http://www.w3.org/1998/Math/MathML";
				div = document.createElement("div");
                div.style.position = "absolute";
                div.style.color = "#fff";
                mfrac = div.appendChild(document.createElementNS(ns, "math")).appendChild(document.createElementNS(ns, "mfrac"));
                mfrac.appendChild(document.createElementNS(ns, "mi")).appendChild(document.createTextNode("xx"));
                mfrac.appendChild(document.createElementNS(ns, "mi")).appendChild(document.createTextNode("yy"));
                document.body.appendChild(div);
                hasMathML = div.offsetHeight > div.offsetWidth;
                div.style.display = "none";
            }
            return hasMathML;
        }()),
        _exec: function (elm) {
            if (pe.mobile || pe.fn.mathlib.support) {
				return; // we do not want this on mobile devices or Mathml capable browsers
			}
            pe.add._load('http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML');
        } // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));