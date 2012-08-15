/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Accessible footnotes
 */
/*global jQuery: false*/
(function ($) {
	"use strict";
    var _pe = window.pe || {
		fn: {}
	};
    /* local reference */
    _pe.fn.footnotes = {
		type: 'plugin',
		_exec: function (elm) {
			/*if (pe.mobile) {
				return; //we do not want this on mobile devices
			}*/
			var _ctn = $("#wb-main-in").not(".wet-boew-footnotes"), //reference to the content area (which needs to be scanned for footnote references)
				_elm = $(elm), //reference to the contents of the footnotes block
				resetRtnLink, _rtnLink, _rtnLinkDestDflt, _rtnLinkDestCurr; //persistent details about the current footnote's return link

			//remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
			_elm.find("p.footnote-return a span span").remove();

			//listen for footnote reference links that get clicked
			_ctn.find("sup a.footnote-link").on("click", function () {
				//captures certain information about the clicked link
				var $this = $(this),
					_refLinkDest = $this.attr("href"),
					_refLinkId = "#" + $this.parent().attr("id");

				//proceeds as long as the user isn't clicking the same link over and over
				if (_refLinkId !== _rtnLinkDestCurr) {
					//resets the destination footnote's return link before moving on...
					resetRtnLink();

					//captures certain information about the destination footnote's return link
					_rtnLink = _elm.find(_refLinkDest + " + dd p.footnote-return a");
					_rtnLinkDestCurr = _refLinkDest;
					_rtnLinkDestDflt = _rtnLink.attr("href");
			
					//if needed, changes the href of the destination footnote's return link to the ID of the clicked link
					if (_rtnLinkDestCurr !== _rtnLinkDestDflt) {
						_rtnLink.attr("href", _refLinkId);
					}
			
				}
			});

			//listen for footnote return links that get clicked
			_elm.find("dd p.footnote-return a").on("click", function () {
				//resets the return link *after* the user has been brought back to the proper footnote reference
				$(this).on("focusout", function () {
					resetRtnLink();
				});
			});
	
			//resets the stored footnote return link to its default destination
			resetRtnLink = function () {
				//only proceeds if there's actually a need to reset a link
				if (_rtnLinkDestCurr !== _rtnLinkDestDflt) {
					_rtnLink.attr("href", _rtnLinkDestDflt);
					_rtnLinkDestCurr = _rtnLinkDestDflt;
				}
			};
		} // end of exec
    };
	window.pe = _pe;
	return _pe;
}(jQuery));