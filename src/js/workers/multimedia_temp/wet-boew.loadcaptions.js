/*!
 * Multimedia player v1.3 / Lecteur multimédia v1.3
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
(function($){
	$.fn.loadcaptions = function(src){
		$video = $(this);
		/*-------------------------------------------*/
		/* Caption parsing, can be moved to a web service */
		var _parse_time = function(string){
			if (string !== undefined){
				if (string.substring(string.length-1) == "s"){
					//offset-time
					return parseFloat(string.substring(0,string.length-1));
				}else{
					//clock time
					var parts = string.split(":").reverse();
					var s = 0;
					for (p=0;p<parts.length;p++){
						var v = (p==0) ? parseFloat(parts[p]) : parseInt(parts[p])
						s += v * Math.pow(60,p)
					}
					return s;
				}
			}
			return -1;
		}
		
		var _parse_html = function(content){
			var s = ".wet-boew-tt"
			var te = content.find(s);
			var captions = []
			te.each(function(){
				var e = $(this).clone();
				e.find(s).detach();
				var start=-1;
				var begin=-1;
				
				if (e.attr("data-begin") !== undefined){
					//HTML5 captions (seperate attributes)
					begin = _parse_time(e.attr("data-begin"));
					end = e.attr("data-end") !== undefined ? _parse_time(e.attr("data-end")) : _parse_time(e.attr("data-dur")) + begin
				}else{
					var json;
					if (e.attr("data")){
						//HTML5 captions JSON in data attribute
						json = e.attr("data");
					}else{
						//XHTML cations (inside the class attribute)
						var c = e.attr("class");
						json = c.substring(c.indexOf("{"));
					}
					
					//Sanitze the JSON
					json = json.replace(/(begin|dur|end)/gi, "\"$1\"").replace(/'/g, "\"");
					json = $.parseJSON(json);
					
					begin = _parse_time(json.begin);
					end = json.end !== undefined ? _parse_time(json.end) : _parse_time(json.dur) + begin
					
				}
				captions[captions.length] = {text:e.html(),begin:begin,end:end};
			})
			return captions;
		}
		
		var _parse_xml = function(content){
			var s = "[begin]"
			var te = content.find(s);
			var captions = []
			te.each(function(){
				var e = $(this).clone();
				e.find(s).detach();
				var begin = _parse_time(e.attr("begin"));
				var end = e.attr("end") !== undefined ? _parse_time(e.attr("end")) : _parse_time(e.attr("dur")) + begin
				captions[captions.length] = {text:e.html(),begin:begin,end:end};
			})
			return captions;
		}
		/*-------------------------------------------*/
		
		var loadedevent = "captionsloaded";
		var failevent = "captionsloadfailed"
		
		var _load_captions_internal = function(obj){
			var eventObj = {type:loadedevent,captions:_parse_html(obj)}
			$video.trigger(eventObj);
		}
		
		var _load_captions_external = function(url){
			$.ajax({
				url:url,
				context:$video,
				crossDomain:true,
				dataType: "html",
				success:function(data, status, response){
					var eventObj = {type:loadedevent};
					if (data.indexOf("<html") > -1){
						eventObj.captions = _parse_html($(data));
					}else{
						eventObj.captions = _parse_xml($(data));
					}
					$(this).trigger(eventObj);
				},
				error:function(reponse, textStatus, errorThrown){
					$(this).trigger({type:failevent, error: errorThrown})
				}
			})
		}
		
		if (src !== undefined){
			var curUrl = PE.url();
			var srcUrl = PE.url(src);
			
			if (srcUrl.absolute.replace("#" + srcUrl.anchor,"") == curUrl.absolute.replace("#" + curUrl.anchor, "")){
				//Same page HTML captions
				var c = $("#" + srcUrl.anchor);
				if (c.length > 0){
					_load_captions_internal(c);return;
				}
				
				$(this).trigger({type:failevent, error: new Error("Object with id '" + srcUrl.anchor + "' not found")});return
			}else{
				//External HTML or XML captions
				_load_captions_external(srcUrl.absolute);return;
			}
		}
		$(this).trigger({type:failevent, error: new Error("Caption source is missing")})
	}
})( jQuery );
