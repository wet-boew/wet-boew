/*!
 * Multimedia player v1.3 / Lecteur multimédia v1.3
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
(function($){
	$.fn.captions = function(area, captions){
		$video = $(this)
		var update = function(area, seconds, captions){
			$area = $(area);
			$area.empty();
			for(c=0; c<captions.length; c++){
				var caption = captions[c]
				if (seconds >= caption.begin && seconds <= caption.end){
					$area.append($('<div>' + caption.text + '</div>'))
				}
			}
		}
		
		$video.on("timeupdate", {area: area, captions:captions}, function(e){
			if (e.data.captions === undefined){$(e.target).off("timeupdate")}
			update(e.data.area, this.currentTime, e.data.captions);
		});
	}
})( jQuery );
