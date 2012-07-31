/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Accessible footnotes
 */
/*global jQuery: false, pe: false*/
( function($) {
    var _pe = window.pe || {fn: {} };
    /* local reference */
    _pe.fn.footnotes = {
      type : 'plugin',
      _exec: function (elm) {
        /*if (pe.mobile) {
          return; //we do not want this on mobile devices
        }*/
        var _ctn = $("#wb-main-in"); //reference to the content area (which needs to be scanned for footnote references)
        var _elm = $(elm); //reference to the footnotes block
        
        //remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
        _elm.find("p.footnote-return a span span").remove();
        
        //captures certain linking details when a footnote reference link is clicked
        _ctn.find("sup a.footnote-link").click(function(){
          var _originRefId = "#" + $(this).parent().attr("id"),
              _footnoteId = $(this).attr("href"),
              _footnoteRtnLink = _elm.find(_footnoteId + " + dd p.footnote-return a"),
              _defaultRefId = _footnoteRtnLink.attr("href");
          
          //link management actions; only proceeds if the ID of the clicked link's parent sup doesn't match the destination of the associated footnote's return link
          if (_originRefId !== _defaultRefId) {
            
            //changes the return link destination to the ID of the origin reference
            _footnoteRtnLink.attr("href", _originRefId);
            
            //reverts the return link to its original destination after it gets clicked and loses focus
            _footnoteRtnLink.click(function(){
              $(this).focusout(function(){
                $(this).attr("href", _defaultRefId);
              });
            });
          }
        });
      } // end of exec
    };
    window.pe = _pe;
    return _pe;
  }(jQuery));