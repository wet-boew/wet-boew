/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
* Multimedia player
*/
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.multimedia = {
		type: 'plugin',
                
		_exec: function (elm) {
			var opts,
				aVariable,
				anotherVariable;
			opts = {
				// This is an example from tabbedinterface, to show how to pass configuration parameters from the html element to the plugin.
				// There are some simple examples here, along with some more complicated ones.
				defaultElm: ((elm.find(".default").length) ? ".default" : "li:first-child"),
				autoHeight: (elm.hasClass("auto-height-none") ? false : true),
				cycle: (elm.hasClass("cycle-slow") ? 8000 : (elm.hasClass("cycle-fast") ? 2000 : (elm.hasClass("cycle") ? 6000 : false))),
				carousel: (/style-carousel/i.test(elm.attr('class'))) ? true : false,
				autoPlay: (elm.hasClass("auto-play") ? true : false),
				animate: (elm.hasClass("animate") || elm.hasClass("animate-slow") || elm.hasClass("animate-fast") ? true : false),
				animationSpeed: (elm.hasClass("animate-slow") ? "slow" : (elm.hasClass("animate-fast") ? "fast" : "normal"))
			};
			// Do plugin stuff here...
			return elm;
		}, // end of exec
                
                //Standardized multimedia interface
                intf : {
                    // Methods 
                    play: function(){
                        this.object.play();
                    },
                    pause: function(){
                        this.object.pause();
                    },

                    // Properties
                    getPaused: function(){
                        return (typeof(this.object.paused) !== "function" ? this.object.paused : this.object.paused());
                    },

                    getPlayed: function(){
                        return (typeof(this.object.played) !== "function" ? this.object.played : this.object.played());
                    },

                    getEnded: function(){
                        return (typeof(this.object.ended) !== "function" ? this.object.ended : this.object.ended());
                    },

                    getSeeking: function(){
                        return (typeof(this.object.seeking) !== "function" ? this.object.seeking : this.object.seeking());
                    },

                    getDuration: function(){
                        return (typeof(this.object.duration) !== "function" ? this.object.duration : this.object.duration());
                    },

                    getBuffered: function(){
                        return (typeof(this.object.buffered) !== "function" ? (this.object.buffered.length > 0 ? this.object.buffered.end(0) : 0) : this.object.buffered());
                    },

                    getCurrentTime: function(){
                        return (typeof(this.object.currentTime) !== "function" ? this.object.currentTime : this.object.currentTime());
                    },

                    setCurrentTime: function(t){
                    this.object.pause !== undefined ? this.object.currentTime = t : this.object.setCurrentTime(t);
                    },

                    getCaptionsVisible: function(){
                        return $(this).parent().find(".wet-boew-mediaplayer-captionsarea").is(":visible");
                    },

                    setCaptionsVisible : function(v){
                        if (v){
                            $(this).parent().find(".wet-boew-mediaplayer-captionsarea").show();
                            $(this.object).trigger("captionsshown");
                        }else{
                            $(this).parent().find(".wet-boew-mediaplayer-captionsarea").hide();
                            $(this.object).trigger("captionshidden");
                        }
                    },

                    getMuted : function(){
                        return (typeof(this.object.muted) !== "function" ? this.object.muted : this.object.muted());
                    },

                    setMuted : function(m){
                        this.object.muted !== undefined ? this.object.muted = m : this.object.setMuted(m);
                    },

                    getVolume : function(){
                        return (typeof(this.object.volume) !== "function" ? this.object.volume : this.object.volume());
                    },

                    setVolume : function(v){
                        this.object.volume !== undefined ?  this.object.volume = v : this.object.setVolume(v);
                    }
                }
	};
	window.pe = _pe;
	return _pe;
}(jQuery));