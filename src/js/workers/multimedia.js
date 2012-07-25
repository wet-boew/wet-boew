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

		/*images: ($('<svg xmlns="http://www.w3.org/2000/svg" />').get(0).ownerSVGElement !== undefined ?
		{
			play: $('<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/></svg>'),
			pause: $('<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><g><rect y="2" x="4" width="5" height="15" style="fill:#000;" /><rect y="2" x="12" width="5" height="15" style="fill:#000;" /></g></svg>'),
			ff: $('<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><g><path transform="translate(-3,0)" d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/><path transform="translate(4,0)" d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/></g></svg>'),
			cc: $('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g><text font-weight="bold" xml:space="preserve" text-anchor="middle" font-family="Sans-serif" font-size="14" id="svg_1" y="14.079744" x="10.214848" stroke-width="0" fill="#000000">cc</text></g></svg>')
		}	
		:	
		{
			play:'images/multimedia/play-control.png',
			pause:'images/multimedia/pause-control.png'
		}
		),*/

		get_image: function () {
			return false;
		},

		_exec: function (elm) {
			var id,
				canPlay = false,
				media = elm.children("audio, video").eq(0),
				media_id,
				flash = true,
				$fbObject,
				fbVideoType = "video/mp4",
				fbAudioType = "audio/mpeg", //MP3
				fbBin = _pe.add.liblocation + "bin/multimedia.swf",
				fbClass,
				fbWidth,
				fbHeight,
				fbVars,
				evtmgr;

			//Add an id if an id is missing
			if (elm.attr("id") !== undefined) {
				id = elm.attr("id");
			} else {
				id = "wet-boew-mediaplayer" + elm.index();
				elm.attr("id", id);
			}
			if (media.attr("id") !== undefined) {
				media_id = media.attr("id");
			} else {
				media_id = id + "-media";
				media.attr("id", media_id);
			}

			if (media.get(0).currentSrc !== "" && media.get(0).currentSrc !== undefined) {
				canPlay = true;
			} else {
				//No nativly supported format provided, trying Flash fallback
				//TODO:Add Flash detection
				fbVars = "id=" + elm.attr("id");
				if (flash && media.is("video") && media.find("source[type=\"" + fbVideoType + "\"]")) {
					fbClass = "video";
					fbWidth = media.width() > 0 ? media.width() : media.attr("width");
					fbHeight = media.height() > 0 ? media.height() : media.attr("height");
					fbVars +=  "&height=" + media.height() + "&width=" + media.width() + "&posterimg=" + escape(_pe.url(media.attr("poster")).source) + "&media=" + _pe.url(media.find("source[type=\"" + fbVideoType + "\"]").attr("src")).source;
					canPlay = true;
				} else if (flash && media.is("audio") && media.find("source[type=\"" + fbAudioType + "\"]")) {
					fbClass = "audio";
					fbWidth = 0;
					fbHeight = 0;
					fbVars += "&media=" + _pe.url(media.find("source[type=\"" + fbAudioType + "\"]").attr("src")).source;
					canPlay = true;
				} else {
					//TODO: Display when no HTML5 video or Flash
					canPlay = false;
				}
				//Can play using a fallback
				if (canPlay) {
					$fbObject = $("<object id=\"" + media_id + "\" width=\"" + fbWidth + "\" height=\"" + fbHeight + "\" class=\"" + fbClass + "\" type=\"application/x-shockwave-flash\" data=\"" + fbBin + "\" tabindex=\"-1\"><param name=\"movie\" value=\"" + fbBin + "\"/><param name=\"flashvars\" value=\"" + fbVars + "\"/><param name=\"allowScriptAccess\" value=\"always\"/><param name=\"bgcolor\" value=\"#000000\"/><param name=\"wmode\" value=\"opaque\"/>");
					media.before($fbObject);
					media.remove();
					media = $fbObject;
				}
			}

			if (canPlay) {
				//Add the interface
				$.extend(elm.get(0), {object: media.get(0)}, _pe.fn.multimedia._intf);

				media.after(_pe.fn.multimedia._get_ui(media_id).width((media.width() > 0 ? media.width() : media.attr("width"))));

				//Scale the UI when the video scales
				$(window).bind("resize", function () {
					media.next().width(media.width());
				});

				//Map UI mouse events
				elm.on("click", function (e) {
					var $target = $(e.target),
						t,
						p,
						s;

					if ($target.hasClass("playpause") || e.target === this.object) {
						if (this.getPaused() === true) {
							this.play();
						} else {
							this.pause();
						}
					}

					if ($target.hasClass("cc")) {
						this.setCaptionsVisible(!this.getCaptionsVisible());
					}

					if ($target.hasClass("mute")) {
						this.setMuted(!this.getMuted());
					}

					if ($target.is("progress")) {
						p = (e.pageX - $target.offset().left) / $target.width();
						this.setCurrentTime(this.getDuration() * p);
					}

					if ($target.hasClass("rewind") || $target.hasClass("fastforward")) {
						s = this.getDuration() * 0.05;
						if ($target.hasClass("rewind")) {
							s *= -1;
						}
						this.setCurrentTime(this.getCurrentTime() + s);
					}
				});

				//Map UI keyboard events
				elm.on("keypress", function (e) {
					var $w = $(this),
						v = 0;

					if ((e.which === 32 || e.which === 13) && e.target === this.object) {
						$w.find(".wet-boew-button.playpause").click();
						return false;
					}
					if (e.keyCode === 37) {
						$w.find(".wet-boew-button.rewind").click();
						return false;
					}
					if (e.keyCode === 39) {
						$w.find(".wet-boew-button.fastforward").click();
						return false;
					}
					if (e.keyCode === 38) {
						v = Math.round(this.getVolume() * 10) / 10 + 0.1;
						v = v < 1 ? v : 1;
						this.setVolume(v);
						return false;
					}
					if (e.keyCode === 40) {
						v = Math.round(this.getVolume() * 10) / 10 - 0.1;
						v = v > 0 ? v : 0;
						this.setVolume(v);
						return false;
					}

					return true;
				});

				//Map media events (For flash, must use other element than object because it doesn't trigger or receive events)
				evtmgr = media.is("object") ? media.children(":first-child") : media;
				evtmgr.on("loadeddata progress timeupdate seeked canplay play volumechange pause ended captionsloaded captionsloadfailed captionsshown captionshidden", $.proxy(function (e) {
					var $w = $(this),
						p,
						timeline;
					switch (e.type) {
					case "play":
						$w.find(".playpause img").attr({
							alt: _pe.dic.get("%pause"),
							src: "" //player.icons.pause
						});
						break;
					case "pause":
					case "ended":
						$w.find(".playpause img").attr({
							alt: _pe.dic.get("%play"),
							src: _pe.fn.multimedia.images.play
						});
						break;
					case "volumechange":
						if (this.getMuted()) {
							$w.find(".mute img").attr({
								alt: _pe.dic.get("%mute", "disable"),
								src: "" //player.icons.mute_on
							});
						} else {
							$w.find(".mute img").attr({
								alt: _pe.dic.get("%mute", "enable"),
								src: "" //player.icons.mute_off
							});
						}
						break;
					case "captionsvisiblechange":
						if (this.getCaptionsVisible()) {
							$w.find(".cc img").attr({
								alt: _pe.dic.get("%closed-captions", "disable"),
								src: "" //player.icons.closedcaptions_on
							});
						} else {
							$w.find(".cc img").attr({
								alt: _pe.dic.get("%closed-captions", "enable"),
								src: "" //player.icons.closedcaptions_off
							});
						}
						break;
					case "timeupdate":
						p = this.getCurrentTime() / this.getDuration();
						timeline = $w.find(".wet-boew-multimedia-timeline progress");
						timeline.stop();
						if (this.getSeeking()) {
							timeline.attr("value", p);
						} else {
							timeline.animate({"value": p}, 150, "linear");
						}
						break;
					case "progress":
						/*if (this.getBuffered() > 1){console.log(Math.round(this.getBuffered()/ this.getDuration() * 1000)/10);}*/
						break;
					case "captionsloaded":
						$(e.target).captions($w.find(".wet-boew-multimedia-captionsarea"), e.captions);
						break;
					case "captionsloadfailed":
						$w.find(".wet-boew-mediaplayer-captionsarea").empty().append("<p>" + _pe.dict.captionserror + "</p>");
						break;
					}
				}, elm.get(0)));
			}

			return elm;
		}, // end of exec

		_get_ui : function (id) {
			var ui = $("<div class=\"wet-boew-multimedia-controls\">"),
				ui_start = $("<div class=\"wet-boew-multimedia-controls-start\">"),
				ui_timeline = $("<div class=\"wet-boew-multimedia-timeline\" tabindex=\"0\"><progress value=\"0\" />"),
				ui_end = $("<div class=\"wet-boew-multimedia-controls-end\">");

			ui_start.append(
				$("<button>").attr({
					type: "button",
					"class": "rewind",
					"aria-controls": id
				}).append(
					/*$("<img>").attr({
							src: '',
							alt: _pe.dic.get("%rewind")
						})*/
					'<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-180 10 10)"><path transform="translate(-4,0)" d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/><path transform="translate(3,0)" d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/></g></svg>'
				)
			);

			ui_start.append(
				$("<button>").attr({
					type: "button",
					"class": "playpause",
					"aria-controls": id
				}).append(
					/*$("<img>").attr({
							src: _pe.fn.multimedia.images.play,
							alt: _pe.dic.get("%play")
						})*/
					'<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g><path d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/></g></svg>'
				)
			);

			ui_start.append(
				$("<button>").attr({
					type: "button",
					"class": "fastforward",
					"aria-controls": id
				}).append(
					/*$("<img>").attr({
							src: "",
							alt: _pe.dic.get("%fast-forward")
						})*/
					'<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g><path transform="translate(-4,0)" d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/><path transform="translate(3,0)" d="m17.023165,10.250381l-11.447638,-7.424991l0.115218,14.349777l11.33242,-6.924786z" fill="#000000"/></g></svg>'
				)
			);

			ui_end.append(
				$("<button>").attr({
					type: "button",
					"class": "cc",
					"aria-controls": id
				}).append(
					/*$("<img>").attr({
						src: "",
						alt: _pe.dic.get("%closed-caption", "enable")
					})*/
					'<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g><text font-weight="bold" xml:space="preserve" text-anchor="middle" font-family="Sans-serif" font-size="14" id="svg_1" y="14.079744" x="10.214848" stroke-width="0" fill="#000000">cc</text></g></svg>'
				)
			);

			ui_end.append(
				$("<button>").attr({
					type: "button",
					"class": "mute",
					"aria-controls": id
				}).append(
					/*$("<img>").attr({
						src: "",
						alt: _pe.dic.get("%mute", "enable")
					})*/
					'<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g><rect height="8.070175" width="12.440169" y="5.998068" x="3.776589" fill="#000000"/><path transform="rotate(-180, 13.3815, 16.8807)" d="m10.539844,19.720558l0,-5.679615l5.679601,5.679615l-5.679601,0z" fill="#000000"/><path transform="rotate(-90, 13.3805, 3.20703)" d="m10.540461,6.047394l0,-5.679615l5.679605,5.679615l-5.679605,0z" fill="#000000"/></g></svg>'
				)
			);

			ui.append(ui_start).append(ui_end).append(ui_timeline);

			return ui;
		},

		//Standardized multimedia interface
		_intf : {
			// Methods
			play: function () {
				this.object.play();
			},
			pause: function () {
				this.object.pause();
			},

			// Properties
			getPaused: function () {
				return (typeof this.object.paused !== "function" ? this.object.paused : this.object.paused());
			},

			getPlayed: function () {
				return (typeof this.object.played !== "function" ? this.object.played : this.object.played());
			},

			getEnded: function () {
				return (typeof this.object.ended !== "function" ? this.object.ended : this.object.ended());
			},

			getSeeking: function () {
				return (typeof this.object.seeking !== "function" ? this.object.seeking : this.object.seeking());
			},

			getDuration: function () {
				return (typeof this.object.duration !== "function" ? this.object.duration : this.object.duration());
			},

			getBuffered: function () {
				return (typeof this.object.buffered !== "function" ? (this.object.buffered.length > 0 ? this.object.buffered.end(0) : 0) : this.object.buffered());
			},

			getCurrentTime: function () {
				return (typeof this.object.currentTime !== "function" ? this.object.currentTime : this.object.currentTime());
			},

			setCurrentTime: function (t) {
				if (typeof this.object.currentTime !== "function") { this.object.currentTime = t; } else { this.object.setCurrentTime(t); }
			},

			getCaptionsVisible: function () {
				return $(this).parent().find(".wet-boew-mediaplayer-captionsarea").is(":visible");
			},

			setCaptionsVisible : function (v) {
				if (v) {
					$(this).parent().find(".wet-boew-mediaplayer-captionsarea").show();
					$(this.object).trigger("captionsshown");
				} else {
					$(this).parent().find(".wet-boew-mediaplayer-captionsarea").hide();
					$(this.object).trigger("captionshidden");
				}
			},

			getMuted : function () {
				return (typeof this.object.muted !== "function" ? this.object.muted : this.object.muted());
			},

			setMuted : function (m) {
				if (typeof this.object.muted !== "function") { this.object.muted = m; } else { this.object.setMuted(m); }
			},

			getVolume : function () {
				return (typeof this.object.volume !== "function" ? this.object.volume : this.object.volume());
			},

			setVolume : function (v) {
				if (typeof this.object.volume !== "function") { this.object.volume = v; } else { this.object.setVolume(v); }
			}
		}
	};

	//Method to allow the flash player to trigger the media events
	_pe.triggermediaevent = function (id, event) {
		var o = $("#" + id).find("object :first-child").trigger(event);
	};

	window.pe = _pe;
	return _pe;
}(jQuery));