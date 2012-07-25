/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * CSS3 for IE plugin
 */
/*global jQuery: false, pe:false, PIE:false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.css3ie = {
		type : 'plugin',
		depends : (pe.ie > 0 && pe.ie < 9 ? ['pie', 'resize'] : []),
		_exec : function (elm) {
			if (pe.mobile || !(pe.ie > 0 && pe.ie < 9)) {
				return;
			}

			var $enhance = $(".rounded, .pie-enhance"),
				pieEnabled = false,
				$wbcore = $("#wb-core"),
				$wbcorein = $wbcore.children("#wb-core-in"),
				wbcoremb = $wbcore.css("margin-bottom"),
				body,
				r,
				setupPIE,
				cleanup;

			setupPIE = function () {
				$enhance.each(function () {
					PIE.attach(this);
				});
				return true;
			};
			cleanup = function () {
				$enhance.each(function () {
					PIE.detach(this);
				});
				return false;
			};

			// now attach PIE to bound objects
			if (window.PIE) {
				$enhance.filter(function () {
					return $(this).css("position") === "static";
				}).css("position", "relative");

				if (pe.ie === 7) {
					body = document.body;
					r = body.getBoundingClientRect();
					if ((r.left - r.right) / body.offsetWidth === -1) {
						pieEnabled = setupPIE();
					} else {
						$wbcore.css("margin-bottom", ($wbcorein.offset().top + $wbcorein.height()) - ($wbcore.offset().top + $wbcore.height()));
					}
				} else if (pe.ie === 8) {
					/*if (screen.deviceXDPI / screen.logicalXDPI === 1) {}*/
					pieEnabled = setupPIE();
				} else {
					pieEnabled = setupPIE();
				}

				pe.resize(function () {
					if (pe.ie === 7) {
						var body = document.body,
							r = body.getBoundingClientRect();
						if ((r.left - r.right) / body.offsetWidth !== -1) {
							pieEnabled = cleanup($enhance);
							$wbcore.css("margin-bottom", ($wbcorein.offset().top + $wbcorein.height()) - ($wbcore.offset().top + $wbcore.height()));
						} else {
							if (!pieEnabled) {
								setupPIE();
							}
							$wbcore.css("margin-bottom", wbcoremb);
						}
					} /*else if (pe.ie === 8)) {
						if (screen.deviceXDPI / screen.logicalXDPI != 1) {
							pieEnabled = cleanup();
						}
						else if (!pieEnabled) {
							pieEnabled = setupPIE();
						}
					}*/
				});
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));