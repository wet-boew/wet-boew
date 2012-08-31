/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
(function(c){var b,a;b=(typeof window.wet_boew_theme!=="undefined"&&window.wet_boew_theme!==null)?window.wet_boew_theme:{fn:{}};a={theme:"theme-clf2-nsi2",psnb:null,search:null,bcrumb:null,wmms:c("#cn-wmms"),init:function(){b.psnb=pe.header.find("#cn-psnb");b.bcrumb=pe.header.find("#cn-bc");if(b.psnb.length>0){pe.menu.navcurrent(b.psnb,b.bcrumb)}if(pe.secnav.length>0){pe.menu.navcurrent(pe.secnav,b.bcrumb)}}};window.wet_boew_theme=c.extend(true,b,a);return window.wet_boew_theme}(jQuery));