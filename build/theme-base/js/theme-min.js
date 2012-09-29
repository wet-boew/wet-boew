/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: v3.1a1
 */
(function(c){var b,a;b=(typeof window.wet_boew_theme!=="undefined"&&window.wet_boew_theme!==null)?window.wet_boew_theme:{fn:{}};a={theme:"theme-base",init:function(){b.bcrumb=pe.header.find("#base-bc");if(pe.secnav.length>0){pe.menu.navcurrent(pe.secnav,b.bcrumb)}},mobileview:function(){var f,d,e,j=pe.dic.get("%menu"),i,k,h="",g;if(pe.secnav.length>0){f='<div data-role="page" id="jqm-wb-mb"><div data-role="header">';i=pe.secnav.find("h2").eq(0);d=i;e=d[0].innerHTML;f+="<h1>"+j+'</h1></div><div data-role="content" data-inset="true"><nav role="navigation">';if(b.bcrumb.length>0){f+='<section><div id="jqm-mb-location-text">'+b.bcrumb[0].innerHTML+"</div></section>";b.bcrumb.remove()}else{f+='<div id="jqm-mb-location-text"></div>'}k=pe.menu.buildmobile(pe.secnav.find(".wb-sec-def"),3,"c",false,true);pe.menu.expandcollapsemobile(k,(pe.secnav.find("h3.top-section").length>0?"h4":"h3"),true,false);pe.menu.expandcollapsemobile(k,".nav-current",false,true);f+="<section><div><h2>"+i[0].innerHTML+'</h2><div data-role="controlgroup">'+k[0].innerHTML+"</div></div></section>";pe.secnav.remove();f+="</nav></div></div></div>";pe.pagecontainer().append(f);d.wrapInner('<a href="#jqm-wb-mb" data-rel="dialog"></a>');g=c('<div data-role="navbar" data-iconpos="right"><ul class="wb-hide"><li><a data-rel="dialog" data-theme="a" data-icon="site-menu" href="#jqm-wb-mb">'+j+"</a></li></ul></div>");pe.header.append(g)}c(document).on("pagecreate",function(){function l(n,m,q,p){var o;c.mobile.showPageLoadingMsg();o=c.mobile.transitionHandlers.simultaneous("pop",m,q,p);o.done(function(){c.mobile.hidePageLoadingMsg()});return o}c.mobile.transitionHandlers.loadingTransition=l;c.mobile.defaultDialogTransition="loadingTransition"});c(document).on("pageinit",function(){});c(document).trigger("mobileviewloaded");return}};window.wet_boew_theme=c.extend(true,b,a);return window.wet_boew_theme}(jQuery));