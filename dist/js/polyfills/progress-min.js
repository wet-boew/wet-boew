/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: v3.1.0-b2 Build: 2013-02-11 05:00 AM
 *
 */
(function(a){a.fn.progress=function(){return a(this).each(function(){var d=a(this),c=d.children(".wb-progress-outer, .wb-progress-undefined"),e,f,b={role:"progressbar"};d.off("DOMAttrModified propertychange");if(d.is("[value]")){if(c.length<1){c=a('<div class="wb-progress-outer"><div class="wb-progress-inner"/></div>');d.append(c)}e=a([d.attr("max")||"1.0",d.attr("value")]).map(function(){try{return parseFloat(this)}catch(g){return null}});b["aria-valuemin"]=0;b["aria-valuemax"]=e[0];b["aria-valuenow"]=e[1];if(b["aria-valuenow"]>b["aria-valuemax"]){b["aria-valuenow"]=b["aria-valuemax"]}f=(b["aria-valuenow"]/b["aria-valuemax"])*100;c.children(".wb-progress-inner").css("width",f+"%")}else{if(d.not("[value]")&&c.length<1){c=a('<div class="wb-progress-undefined"/>');d.append(c)}}d.attr(b);setTimeout(function(){d.on("DOMAttrModified propertychange",function(){d.progress()})},0)})};a("progress").progress()}(jQuery));