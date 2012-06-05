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
			var id,
			    canPlay = false,
			    media = elm.children("audio, video").eq(0);

			/*opts = {
				// This is an example from tabbedinterface, to show how to pass configuration parameters from the html element to the plugin.
				// There are some simple examples here, along with some more complicated ones.
				defaultElm: ((elm.find(".default").length) ? ".default" : "li:first-child"),
				autoHeight: (elm.hasClass("auto-height-none") ? false : true),
				cycle: (elm.hasClass("cycle-slow") ? 8000 : (elm.hasClass("cycle-fast") ? 2000 : (elm.hasClass("cycle") ? 6000 : false))),
				carousel: (/style-carousel/i.test(elm.attr('class'))) ? true : false,
				autoPlay: (elm.hasClass("auto-play") ? true : false),
				animate: (elm.hasClass("animate") || elm.hasClass("animate-slow") || elm.hasClass("animate-fast") ? true : false),
				animationSpeed: (elm.hasClass("animate-slow") ? "slow" : (elm.hasClass("animate-fast") ? "fast" : "normal"))
			};*/

			var id;
			//Add an id if an id is missing
			if (elm.attr("id") !== undefined){
			    id = elm.attr("id");
			}else{
			    id = "wet-boew-mediaplayer" + elm.index();
			    elm.attr("id", id);
			}

			if (media.get(0).currentSrc !== "" && media.get(0).currentSrc !== undefined){
			    canPlay = true;
			}else{
			    //No nativly supported format provided, trying Flash fallback
			    //TODO:Add Flash detection
			    flash = true;

			    var fbVideoType = "video/mp4";
			    var fbAudioType = "audio/mpeg"; //MP3

			    var canFB = false;
			    var $fbObject = $("<object type=\"application/x-shockwave-flash\" data=\"" + _pe.add.liblocation + "/bin/multimedia.swf\" tabindex=\"-1\"></object>");
			    var $fbVars = $("<param name=\"flashvars\" value=\"id=" + elm.attr("id") +"\"/>");
			    $fbObject.append($fbVars);
			    if (flash && media.is("video") && media.find("source[type=\"" + fbVideoType + "\"]")){
				$fbObject.addClass("video");
				$fbObject.attr("width", media.width()).attr("height", media.height());
				$fbObject.append("<param value=\"always\" name=\"allowScriptAccess\"><param value=\"#000000\" name=\"bgcolor\"><param value=\"opaque\" name=\"wmode\">");
				$fbVars.attr("value", $fbVars.attr("value") + "&height=" + media.height() + "&width=" + media.width() + "&posterimg=" + escape(_pe.url(media.attr("poster")).relative) + "&media=" + _pe.url(media.find("source[type=\"" + fbVideoType + "\"]").attr("src")).relative);
				canFB = true;
			    }else if (flash && media.is("audio") && media.find("source[type=\"" + fbAudioType + "\"]")){
				$fbObject.addClass("audio");
				$fbVars.attr("value", $fbVars.attr("value") + "&media=" + _pe.url(media.find("source[type=\"" + fbAudioType + "\"]").attr("src")).relative);
				$fbObject.append($fbVars);
				canFB = true;
			    }else{
				//TODO: Display when no HTML5 video or Flash
				canPlay = false;
			    }

			    if (canFB){
				media.before($fbObject);
				media.remove();
				media = $fbObject;
			    }
			}

			if (canPlay){

			}

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

	//Method to allow the flash player to trigger the media events
	_pe.triggermediaevent = function(id, event, test){
	    var o = $("#" + id).find("object :first-child").trigger(event);
	}

	window.pe = _pe;
	return _pe;
}(jQuery));