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
			    media = elm.children("audio, video").eq(0),
				media_id;

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
			if (media.attr("id") !== undefined){
			    media_id = media.attr("id");
			}else{
			    media_id = id + "-media";
			    media.attr("id", media_id);
			}

			if (media.get(0).currentSrc !== "" && media.get(0).currentSrc !== undefined){
			    canPlay = true;
			}else{
			    //No nativly supported format provided, trying Flash fallback
			    //TODO:Add Flash detection
			    flash = true;

				var fbVideoType = "video/mp4";
				var fbAudioType = "audio/mpeg"; //MP3

				var $fbObject = $("<object id=\"" + media_id + "\" type=\"application/x-shockwave-flash\" data=\"" + _pe.add.liblocation + "bin/multimedia.swf\" tabindex=\"-1\"></object>");
				var $fbVars = $("<param name=\"flashvars\" value=\"id=" + elm.attr("id") +"\"/>");
				$fbObject.append($fbVars);
				if (flash && media.is("video") && media.find("source[type=\"" + fbVideoType + "\"]")){
					$fbObject.addClass("video");
					$fbObject.attr("width", media.width()).attr("height", media.height());
					$fbObject.append("<param value=\"always\" name=\"allowScriptAccess\"><param value=\"#000000\" name=\"bgcolor\"><param value=\"opaque\" name=\"wmode\">");
					$fbVars.attr("value", $fbVars.attr("value") + "&height=" + media.height() + "&width=" + media.width() + "&posterimg=" + escape(_pe.url(media.attr("poster")).source) + "&media=" + _pe.url(media.find("source[type=\"" + fbVideoType + "\"]").attr("src")).source);
					canPlay = true;
				}else if (flash && media.is("audio") && media.find("source[type=\"" + fbAudioType + "\"]")){
					$fbObject.addClass("audio");
					$fbVars.attr("value", $fbVars.attr("value") + "&media=" + _pe.url(media.find("source[type=\"" + fbAudioType + "\"]").attr("src")).source);
					$fbObject.append($fbVars);
					canPlay = true;
				}else{
					//TODO: Display when no HTML5 video or Flash
					canPlay = false;
				}
				//Can play using a fallback
				if (canPlay){
					media.before($fbObject);
					media.remove();
					media = $fbObject;
				}
			}

			if (canPlay){
			    //Add the interface
			    $.extend(elm.get(0), {object: media.get(0)}, _pe.fn.multimedia._intf);

				media.after(_pe.fn.multimedia._get_ui(media_id));

			    //Map UI mouse events
			    elm.on("click",function(e){
					$target = $(e.target);
					if ($target.hasClass("playpause") || e.target == this.object){
						if (this.getPaused() === true){
							this.play();
						}else{
							this.pause();
						}
					}

					if ($target.hasClass("cc")){
						this.setCaptionsVisible(!this.getCaptionsVisible());
					}

					if ($target.hasClass("mute")){
						this.setMuted(!this.getMuted());
					}

					if ($target.hasClass("wet-boew-mediaplayer-timeline") || $target.parent().is(".wet-boew-mediaplayer-timeline")){
						var t = $(this).find(".wet-boew-mediaplayer-timeline");
						var p = (e.pageX - t.offset().left) / t.width();
						this.setCurrentTime(this.getDuration() * p);
					}

					if ($target.hasClass("rewind") || $target.hasClass("fastforward")){
						var s = this.getDuration() * 0.05;
						if ($target.hasClass("rewind"))s*=-1;
						this.setCurrentTime(this.getCurrentTime() + s);
					}
				});

			    //Map UI keyboard events
			    elm.on("keypress", function(e){
					$target = $(e.target);
					$w = $(this);
					if ((e.which == 32 || e.which == 13) && e.target == this.object){
						$w.find(".wet-boew-button.playpause").click();
						return false;
					}
					if (e.keyCode == 37){
						$w.find(".wet-boew-button.rewind").click();
						return false;
					}
					if (e.keyCode == 39){
						$w.find(".wet-boew-button.fastforward").click();
						return false;
					}
					if (e.keyCode == 38){
						var v = Math.round(this.getVolume() * 10)/10 + 0.1;
						v = v < 1 ? v : 1;
						this.setVolume(v);
						return false;
					}
					if (e.keyCode == 40){
						var v = Math.round(this.getVolume() * 10)/10 - 0.1;
						v = v > 0 ? v : 0;
						this.setVolume(v);
						return false;
					}
				});

			    //Map media events (For flash, must use other element than object because it doesn't trigger or receive events)
			    var evtmgr = media.is("object") ? media.children(":first-child"): media;
			    evtmgr.on("loadeddata progress timeupdate seeked canplay play volumechange pause ended captionsloaded captionsloadfailed captionsshown captionshidden", $.proxy(function(e){
					$w = $(this);
					switch (e.type){
						case "play":
							$w.find(".playpause img").attr({
									alt: _pe.dic.get("%pause"),
									src: "" //player.icons.pause
							});
							break;
						case "pause":
							$w.find(".playpause img").attr({
								alt:_pe.dic.get("%play"),
								src: "" //player.icons.play
							});
							break;
						case "volumechange":
							if (this.getMuted() || this.getVolume() === 0){
								$w.find(".mute img").attr({
									alt: _pe.dic.get("%mute", "disable"),
									src: "" //player.icons.mute_on
								});
							}else{
								$w.find(".mute img").attr({
									alt: _pe.dic.get("%mute", "enable"),
									src:"" //player.icons.mute_off
								});
							}
							break;
						case "captionsvisiblechange":
							if (this.getCaptionsVisible()){
								$w.find(".cc img").attr({
									alt: _pe.dic.get("%closed-captions", "disable"),
									src: "" //player.icons.closedcaptions_on
								});
							}else{
								$w.find(".cc img").attr({
									alt: _pe.dic.get("%closed-captions", "enable"),
									src: "" //player.icons.closedcaptions_off
								});
							}
							break;
						case "timeupdate":
							var w = Math.round(this.getCurrentTime()/ this.getDuration() * 10000)/100 + "%";
							var o = $w.find(".wet-boew-mediaplayer-timeline").children("div").stop();
							if (this.getSeeking()){
								o.css("width", w);
							}else{
								o.animate({
									width: w
								},150, "linear");
							}
							break;
						case "progress":
							/*if (this.getBuffered() > 1){console.log(Math.round(this.getBuffered()/ this.getDuration() * 1000)/10);}*/
							break;
						case "captionsloaded":
							$(e.target).captions($w.find(".wet-boew-mediaplayer-captionsarea"), e.captions);
							break;
						case "captionsloadfailed":
							$w.find(".wet-boew-mediaplayer-captionsarea").empty().append("<p>" + player.dictionary.captionserror + "</p>");
							break;
					}
				}, elm.get(0)));
			}

			return elm;
		}, // end of exec

		_get_ui : function(id){
			var ui = $("<div class=\"wet-boew-mediaplayer-controls\">");
			var ui_start = $("<div class=\"wet-boew-mediaplayer-controls-start\">");
			var ui_timeline = $("<div class=\"wet-boew-mediaplayer-timeline\" tabindex=\"0\"><div class=\"outer\"><div class=\"inner\">")
			var ui_end = $("<div class=\"wet-boew-mediaplayer-controls-end\">");

			ui_start.append(
				$("<button>").attr({
					type:"button",
					"class":"rewind",
					"aria-controls":id
				}).append(
						$("<img>").attr({
							src:"",
							alt:_pe.dic.get("%rewind")
						})
				)
			);

			ui_start.append(
				$("<button>").attr({
					type:"button",
					"class":"playpause",
					"aria-controls":id
				}).append(
						$("<img>").attr({
							src:"",
							alt:_pe.dic.get("%play")
						})
				)
			);

			ui_start.append(
				$("<button>").attr({
					type:"button",
					"class":"fastforward",
					"aria-controls":id
				}).append(
						$("<img>").attr({
							src:"",
							alt:_pe.dic.get("%fast-forward")
						})
				)
			);

			ui_end.append(
				$("<button>").attr({
					type:"button",
					"class":"cc",
					"aria-controls":id
				}).append(
						$("<img>").attr({
							src:"",
							alt:_pe.dic.get("%closed-caption", "enable")
						})
				)
			);

			ui_end.append(
				$("<button>").attr({
					type:"button",
					"class":"mute",
					"aria-controls":id
				}).append(
						$("<img>").attr({
							src:"",
							alt:_pe.dic.get("%mute", "enable")
						})
				)
			);

			ui.append(ui_start).append(ui_timeline).append(ui_end);
			
			return ui;
		},
                
        //Standardized multimedia interface
		_intf : {
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
				this.object.currentTime !== undefined ? this.object.currentTime = t : this.object.setCurrentTime(t);
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