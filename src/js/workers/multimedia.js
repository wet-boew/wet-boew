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

		icons: $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20"   height="20"><g id="play"><path d="M 14.299775,10.18788 5.7002247,4.610169 5.7867772,15.389831 14.299775,10.18788 z" /></g><g id="pause" style="display:inline"><path d="M 5.3405667,4.610169 5.3405667,15.389831 8.9169966,15.389831 8.9169966,4.610169 5.3405667,4.610169 z M 11.083003,4.610169 11.083003,15.389831 14.659433,15.389831 14.659433,4.610169 11.083003,4.610169 z" /></g><g id="rewind" transform="matrix(-1,0,0,-1,20,20)"><path d="M 8.4182018,15.389831 16.924761,10.187472 8.3244655,4.610169 8.3478995,8.03154 3.0752388,4.610169 3.168975,15.389831 8.3947677,12.202801 8.4182018,15.389831 z" /></g><g id="ff"><path  d="M 16.929004,10.187879 8.3294498,4.610169 8.4160023,15.389831 16.929004,10.187879 z M 11.67055,10.187879 3.0709963,4.610169 3.157549,15.389831 11.67055,10.187879 z" /></g><g id="mute_off"><path d="M 12.476712,4.599486 9.3409347,7.735268 5.5431537,7.735268 5.5431537,12.22989 9.3235137,12.22989 12.476712,15.400514 12.476712,4.599486 z"/></g><g id="muted_on"><path  d="M 12.466782,4.5994858 9.3309993,7.7352682 5.5332183,7.7352682 5.5332183,12.22989 9.3135782,12.22989 12.466782,15.400514 12.466782,4.5994858 z" /><path d="M 10,1.75 C 5.454363,1.75 1.78125,5.4543629 1.78125,10 1.78125,14.545637 5.454363,18.25 10,18.25 14.545637,18.25 18.25,14.545637 18.25,10 18.25,5.4543629 14.545637,1.75 10,1.75 z M 10,3.25 C 11.602784,3.25 13.062493,3.7896774 14.21875,4.71875 L 4.71875,14.21875 C 3.8057703,13.065541 3.28125,11.593619 3.28125,10 3.28125,6.2650231 6.2650232,3.25 10,3.25 z M 15.25,5.8125 C 16.169282,6.9656383 16.75,8.4065929 16.75,10 16.75,13.734977 13.734977,16.75 10,16.75 8.4063811,16.75 6.9279359,16.200753 5.78125,15.28125 L 15.25,5.8125 z"/></g><g id="cc"><path d="M 9.2241211,6.4042969 9.2241211,8.4003906 C 8.8914318,8.1725317 8.5564712,8.0039121 8.2192383,7.8945312 7.88655,7.7851623 7.5401961,7.7304748 7.1801758,7.7304687 6.4965774,7.7304748 5.9633748,7.9309955 5.5805664,8.3320313 5.2023079,8.7285207 5.0131804,9.2845097 5.0131836,10 5.0131804,10.715498 5.2023079,11.273766 5.5805664,11.674805 5.9633748,12.071291 6.4965774,12.269533 7.1801758,12.269531 7.5629826,12.269533 7.9252869,12.212567 8.2670898,12.098633 8.6134373,11.984702 8.9324474,11.816083 9.2241211,11.592773 L 9.2241211,13.595703 C 8.8413016,13.736979 8.4516536,13.841797 8.0551758,13.910156 7.6632429,13.983073 7.2690376,14.019531 6.8725586,14.019531 5.4916956,14.019531 4.4116185,13.666341 3.6323242,12.959961 2.8530264,12.249025 2.4633783,11.262372 2.4633789,10 2.4633783,8.7376353 2.8530264,7.7532613 3.6323242,7.046875 4.4116185,6.335945 5.4916956,5.9804766 6.8725586,5.9804687 7.2735948,5.9804766 7.6678002,6.0169349 8.0551758,6.0898437 8.4470963,6.1582108 8.8367443,6.2630284 9.2241211,6.4042969" /><path d="M 17.536621,6.4042969 17.536621,8.4003906 C 17.203932,8.1725317 16.868971,8.0039121 16.531738,7.8945312 16.19905,7.7851623 15.852696,7.7304748 15.492676,7.7304687 14.809077,7.7304748 14.275875,7.9309955 13.893066,8.3320313 13.514808,8.7285207 13.32568,9.2845097 13.325684,10 13.32568,10.715498 13.514808,11.273766 13.893066,11.674805 14.275875,12.071291 14.809077,12.269533 15.492676,12.269531 15.875483,12.269533 16.237787,12.212567 16.57959,12.098633 16.925937,11.984702 17.244947,11.816083 17.536621,11.592773 L 17.536621,13.595703 C 17.153802,13.736979 16.764154,13.841797 16.367676,13.910156 15.975743,13.983073 15.581538,14.019531 15.185059,14.019531 13.804196,14.019531 12.724119,13.666341 11.944824,12.959961 11.165526,12.249025 10.775878,11.262372 10.775879,10 10.775878,8.7376353 11.165526,7.7532613 11.944824,7.046875 12.724119,6.335945 13.804196,5.9804766 15.185059,5.9804687 15.586095,5.9804766 15.9803,6.0169349 16.367676,6.0898437 16.759596,6.1582108 17.149244,6.2630284 17.536621,6.4042969" /></g></svg>'),

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
				if (flash && media.is("video") && media.find("source[type=\"" + fbVideoType + "\"]").length > 0) {
					fbClass = "video";
					fbWidth = media.width() > 0 ? media.width() : media.attr("width");
					fbHeight = media.height() > 0 ? media.height() : media.attr("height");
					fbVars +=  "&height=" + media.height() + "&width=" + media.width() + "&posterimg=" + escape(_pe.url(media.attr("poster")).source) + "&media=" + escape(_pe.url(media.find("source[type=\"" + fbVideoType + "\"]").attr("src")).source);
					canPlay = true;
				} else if (flash && media.is("audio") && media.find("source[type=\"" + fbAudioType + "\"]").length > 0) {
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
					$fbObject = $("<object play=\"\" id=\"" + media_id + "\" width=\"" + fbWidth + "\" height=\"" + fbHeight + "\" class=\"" + fbClass + "\" type=\"application/x-shockwave-flash\" data=\"" + fbBin + "\" tabindex=\"-1\"><param name=\"movie\" value=\"" + fbBin + "\"/><param name=\"flashvars\" value=\"" + fbVars + "\"/><param name=\"allowScriptAccess\" value=\"always\"/><param name=\"bgcolor\" value=\"#000000\"/><param name=\"wmode\" value=\"opaque\"/>");
					media.before($fbObject);
					media.remove();
					media = $fbObject;
				} else {
					media.before("<img src=\"" + media.attr("poster") + "\" width=\"" + fbWidth + "\" height=\"" + fbHeight + "\" alt=\"" + media.attr("title") + "\"/>");
					media.remove();
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