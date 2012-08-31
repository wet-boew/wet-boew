/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
* Multimedia player
*/
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.multimedia = {
		type: 'plugin',

		polyfills: ['progress'],

		icons: $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g id="play"><path d="M 14.299775,10.18788 5.7002247,4.610169 5.7867772,15.389831 14.299775,10.18788 z" /></g><g id="pause" style="display:inline"><path d="M 5.3405667,4.610169 5.3405667,15.389831 8.9169966,15.389831 8.9169966,4.610169 5.3405667,4.610169 z M 11.083003,4.610169 11.083003,15.389831 14.659433,15.389831 14.659433,4.610169 11.083003,4.610169 z" /></g><g id="rewind" transform="matrix(-1,0,0,-1,20,20)"><path d="M 8.4182018,15.389831 16.924761,10.187472 8.3244655,4.610169 8.3478995,8.03154 3.0752388,4.610169 3.168975,15.389831 8.3947677,12.202801 8.4182018,15.389831 z" /></g><g id="ff"><path  d="M 16.929004,10.187879 8.3294498,4.610169 8.4160023,15.389831 16.929004,10.187879 z M 11.67055,10.187879 3.0709963,4.610169 3.157549,15.389831 11.67055,10.187879 z" /></g><g id="mute_off"><path d="M 12.476712,4.599486 9.3409347,7.735268 5.5431537,7.735268 5.5431537,12.22989 9.3235137,12.22989 12.476712,15.400514 12.476712,4.599486 z"/></g><g id="mute_on"><path  d="M 12.466782,4.5994858 9.3309993,7.7352682 5.5332183,7.7352682 5.5332183,12.22989 9.3135782,12.22989 12.466782,15.400514 12.466782,4.5994858 z" /><path d="M 10,1.75 C 5.454363,1.75 1.78125,5.4543629 1.78125,10 1.78125,14.545637 5.454363,18.25 10,18.25 14.545637,18.25 18.25,14.545637 18.25,10 18.25,5.4543629 14.545637,1.75 10,1.75 z M 10,3.25 C 11.602784,3.25 13.062493,3.7896774 14.21875,4.71875 L 4.71875,14.21875 C 3.8057703,13.065541 3.28125,11.593619 3.28125,10 3.28125,6.2650231 6.2650232,3.25 10,3.25 z M 15.25,5.8125 C 16.169282,6.9656383 16.75,8.4065929 16.75,10 16.75,13.734977 13.734977,16.75 10,16.75 8.4063811,16.75 6.9279359,16.200753 5.78125,15.28125 L 15.25,5.8125 z"/></g><g id="cc"><path d="M 9.2241211,6.4042969 9.2241211,8.4003906 C 8.8914318,8.1725317 8.5564712,8.0039121 8.2192383,7.8945312 7.88655,7.7851623 7.5401961,7.7304748 7.1801758,7.7304687 6.4965774,7.7304748 5.9633748,7.9309955 5.5805664,8.3320313 5.2023079,8.7285207 5.0131804,9.2845097 5.0131836,10 5.0131804,10.715498 5.2023079,11.273766 5.5805664,11.674805 5.9633748,12.071291 6.4965774,12.269533 7.1801758,12.269531 7.5629826,12.269533 7.9252869,12.212567 8.2670898,12.098633 8.6134373,11.984702 8.9324474,11.816083 9.2241211,11.592773 L 9.2241211,13.595703 C 8.8413016,13.736979 8.4516536,13.841797 8.0551758,13.910156 7.6632429,13.983073 7.2690376,14.019531 6.8725586,14.019531 5.4916956,14.019531 4.4116185,13.666341 3.6323242,12.959961 2.8530264,12.249025 2.4633783,11.262372 2.4633789,10 2.4633783,8.7376353 2.8530264,7.7532613 3.6323242,7.046875 4.4116185,6.335945 5.4916956,5.9804766 6.8725586,5.9804687 7.2735948,5.9804766 7.6678002,6.0169349 8.0551758,6.0898437 8.4470963,6.1582108 8.8367443,6.2630284 9.2241211,6.4042969" /><path d="M 17.536621,6.4042969 17.536621,8.4003906 C 17.203932,8.1725317 16.868971,8.0039121 16.531738,7.8945312 16.19905,7.7851623 15.852696,7.7304748 15.492676,7.7304687 14.809077,7.7304748 14.275875,7.9309955 13.893066,8.3320313 13.514808,8.7285207 13.32568,9.2845097 13.325684,10 13.32568,10.715498 13.514808,11.273766 13.893066,11.674805 14.275875,12.071291 14.809077,12.269533 15.492676,12.269531 15.875483,12.269533 16.237787,12.212567 16.57959,12.098633 16.925937,11.984702 17.244947,11.816083 17.536621,11.592773 L 17.536621,13.595703 C 17.153802,13.736979 16.764154,13.841797 16.367676,13.910156 15.975743,13.983073 15.581538,14.019531 15.185059,14.019531 13.804196,14.019531 12.724119,13.666341 11.944824,12.959961 11.165526,12.249025 10.775878,11.262372 10.775879,10 10.775878,8.7376353 11.165526,7.7532613 11.944824,7.046875 12.724119,6.335945 13.804196,5.9804766 15.185059,5.9804687 15.586095,5.9804766 15.9803,6.0169349 16.367676,6.0898437 16.759596,6.1582108 17.149244,6.2630284 17.536621,6.4042969" /></g><g id="overlay"><rect rx="3" ry="3" width="20" height="20" style="fill:#000;opacity:0.4"/><polygon points="5,5 15,10, 5,15" fill="#FFF" style="fill:#FFF;" /></g></svg>'),

		get_image: function (id, alt, height, width) {
			var icon, g;

			height = height !== undefined ? height : 20;
			width = width !== undefined ? width : 20;

			if (pe.svg) {
				icon = _pe.fn.multimedia.icons.clone();
				icon.attr({'height': height, 'width': width});
				icon.prepend('<title>' + alt + '</title>');
				icon.children(':not(g[id="' + id + '"])').remove();
				g = icon.children('g');
				g.removeAttr('id');
				if (height !== 20 || width !== 20) {
					g.attr('transform', 'scale(' + width / 20 + ',' + height / 20 + ')');
				}
				return icon.attr({'role' : 'img', 'aria-label' : alt});
			}

			return $('<img src="' + _pe.add.liblocation + 'images/multimedia/' + id + '.png" alt="' + alt + '" height="' + height + '" width="' + width + '" />');
		},

		_exec: function (elm) {
			var id,
				canPlay = false,
				media = elm.children('audio, video').eq(0),
				media_type = media.is('video') ? 'video' : 'audio',
				media_id,
				width = media_type === 'video' ? media.attr('width') : '0',
				height = media_type === 'video' ? media.attr('height') : '0',
				captions,
				flash = true,
				$fbObject,
				fbVideoType = 'video/mp4',
				fbAudioType = 'audio/mp3', //MP3
				fbBin = _pe.add.liblocation + 'bin/multimedia.swf?seed=' + Math.random(),
				fbVars,
				evtmgr;

			//Add an id if an id is missing
			if (elm.attr('id') !== undefined) {
				id = elm.attr('id');
			} else {
				id = 'wet-boew-mediaplayer' + elm.index();
				elm.attr('id', id);
			}
			if (media.attr('id') !== undefined) {
				media_id = media.attr('id');
			} else {
				media_id = id + '-media';
				media.attr('id', media_id);
			}

			//Extract the captions file
			if (media.children('track[kind="captions"]')) {
				captions = media.children('track[kind="captions"]').attr("src");
			}

			if (media.get(0).currentSrc !== '' && media.get(0).currentSrc !== undefined) {
				canPlay = true;
			} else {
				//No nativly supported format provided, trying Flash fallback
				//TODO:Add Flash detection
				fbVars = 'id=' + elm.attr('id');
				if (flash && media_type === 'video' && media.find('source').filter('[type="' + fbVideoType + '"]').length > 0) {
					fbVars +=  '&height=' + media.height() + '&width=' + media.width() + '&posterimg=' + encodeURI(_pe.url(media.attr('poster')).source) + '&media=' + encodeURI(_pe.url(media.find('source').filter('[type="' + fbVideoType + '"]').attr('src')).source);
					canPlay = true;
				} else if (flash && media_type === 'audio' && media.find('source').filter('[type="' + fbAudioType + '"]').length > 0) {
					fbVars += '&media=' + _pe.url(media.find('source').filter('[type="' + fbAudioType + '"]').attr('src')).source;
					canPlay = true;
				} else {
					canPlay = false;
				}
				//Can play using a fallback
				if (canPlay) {
					$fbObject = $('<object play="" pause="" id="' + media_id + '" width="' + width + '" height="' + height + '" class="' + media_type + '" type="application/x-shockwave-flash" data="' + fbBin + '" tabindex="-1"><param name="movie" value="' + fbBin + '"/><param name="flashvars" value="' + fbVars + '"/><param name="allowScriptAccess" value="always"/><param name="bgcolor" value="#000000"/><param name="wmode" value="opaque"/>');
					media.before($fbObject);
					media.remove();
					media = $fbObject;
				} else {
					if (media.is('video')) {
						media.before('<img src="' + media.attr("poster") + '" width="' + width + '" height="' + height + '" alt="' + media.attr("title") + '"/>');
						media.remove();
					}
				}
			}

			if (canPlay) {
				evtmgr = media.is('object') ? media.children(':first-child') : media;

				//Add the interface
				$.extend(elm.get(0), {object: media.get(0), evtmgr: evtmgr}, _pe.fn.multimedia._intf);
				if (media_type === 'video') {
					media.before($('<button class="wb-mm-overlay"/>').append(_pe.fn.multimedia.get_image('overlay', _pe.dic.get('%play'), 100, 100)).attr('title', _pe.dic.get('%play')));
				}
				media.after(_pe.fn.multimedia._get_ui(media_id, media_type === 'video' ? true : false));
				if ($('html').hasClass('polyfill-progress')) {
					elm.find('progress').progress();
				}

				//Scale the UI when the video scales
				$(window).on('resize', {'media' : media, ratio : height / width}, function (e) {
					var h = e.data.media.parent().width() * e.data.ratio;
					e.data.media.height(h);
					media.parent().find('.wb-mm-overlay').height(h);
				});
				$(window).trigger('resize');

				//Map UI mouse events
				elm.on('click', function (e) {
					var $target = $(e.target),
						p,
						s;

					if ($target.hasClass('playpause') || e.target === this.object || $target.hasClass('wb-mm-overlay')) {
						if (this.getPaused() === true) {
							this.play();
						} else {
							this.pause();
						}
					}

					if ($target.hasClass('cc')) {
						this.setCaptionsVisible(!this.getCaptionsVisible());
					}

					if ($target.hasClass('mute')) {
						this.setMuted(!this.getMuted());
					}

					if ($target.is('progress') || $target.hasClass('wb-progress-inner') || $target.hasClass('wb-progress-outer')) {
						p = (e.pageX - $target.offset().left) / $target.width();
						this.setCurrentTime(this.getDuration() * p);
					}

					if ($target.hasClass('rewind') || $target.hasClass('fastforward')) {
						s = this.getDuration() * 0.05;
						if ($target.hasClass('rewind')) {
							s *= -1;
						}
						this.setCurrentTime(this.getCurrentTime() + s);
					}
				});

				//Map UI keyboard events
				elm.on('keydown', function (e) {
					var $w = $(this),
						v = 0;

					if ((e.which === 32 || e.which === 13) && e.target === this.object) {
						$w.find('.wb-mm-controls .playpause').click();
						return false;
					}
					if (e.keyCode === 37) {
						$w.find('.wb-mm-controls .rewind').click();
						return false;
					}
					if (e.keyCode === 39) {
						$w.find('.wb-mm-controls .fastforward').click();
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
				evtmgr.on('timeupdate seeked canplay play volumechange pause ended captionsloaded captionsloadfailed captionsvisiblechange', $.proxy(function (e) {
					var $w = $(this),
						b,
						p,
						timeline;
					switch (e.type) {
					case 'play':
						b = $w.find('.playpause');
						b.empty().append(_pe.fn.multimedia.get_image('pause', _pe.dic.get('%pause')));
						b.attr('title', _pe.dic.get('%pause'));
						$w.find('.wb-mm-overlay').hide();
						break;
					case 'pause':
					case 'ended':
						b = $w.find('.playpause');
						b.empty().append(_pe.fn.multimedia.get_image('play', _pe.dic.get('%play')));
						b.attr('title', _pe.dic.get('%play'));
						$w.find('.wb-mm-overlay').show();
						break;
					case 'volumechange':
						b = $w.find('.mute').empty();
						if (this.getMuted()) {
							b.append(_pe.fn.multimedia.get_image('mute_on', _pe.dic.get('%mute', 'disable')));
							b.attr('title', _pe.dic.get('%mute', 'disable'));
						} else {
							b.append(_pe.fn.multimedia.get_image('mute_off', _pe.dic.get('%mute', 'enable')));
							b.attr('title', _pe.dic.get('%mute', 'enable'));
						}
						break;
					case 'captionsvisiblechange':
						b = $w.find('.cc').empty();
						if (this.getCaptionsVisible()) {
							b.append(_pe.fn.multimedia.get_image('cc', _pe.dic.get('%closed-caption', 'disable')));
							b.attr('title', _pe.dic.get('%closed-caption', 'disable'));
						} else {
							b.append(_pe.fn.multimedia.get_image('cc', _pe.dic.get('%closed-caption', 'enable')));
							b.attr('title', _pe.dic.get('%closed-caption', 'enable'));
						}
						break;
					case 'timeupdate':
						p = Math.round(this.getCurrentTime() / this.getDuration() * 1000) / 10;
						timeline = $w.find('.wb-mm-timeline progress');
						timeline.attr('value', p);

						$w.find('.wb-mm-timeline-current span:not(.wb-invisible)').text(_pe.fn.multimedia._format_time(this.getCurrentTime()));
						$w.find('.wb-mm-timeline-total span:not(.wb-invisible)').text(_pe.fn.multimedia._format_time(this.getDuration()));

						//Update captions
						if ($.data(e.target, 'captions') !== undefined) {
							_pe.fn.multimedia._update_captions($w.find('.wb-mm-captionsarea'), this.getCurrentTime(), $.data(e.target, 'captions'));
						}
						break;
					case 'captionsloaded':
						//Store the captions
						$.data(e.target, 'captions', e.captions);
						break;
					case 'captionsloadfailed':
						$w.find('.wb-mm-captionsarea').append('<p>' + _pe.dic.get('%captionserror') + '</p>');
						break;
					}
				}, elm.get(0)));

				if (captions !== undefined) {
					media.after($('<div class="wb-mm-captionsarea"/>').hide());
					_pe.fn.multimedia._load_captions(evtmgr, captions);
				}
			}

			return elm;
		}, // end of exec

		_get_ui : function (id, cc) {
			var ui = $('<div class="wb-mm-controls">'),
				ui_start = $('<div class="wb-mm-controls-start">'),
				ui_timeline = $('<div class="wb-mm-timeline" tabindex="0"><p class="wb-mm-timeline-current"><span class="wb-invisible">' + _pe.dic.get('%position') + '</span><span>00:00:00</span></p><p class="wb-mm-timeline-total"><span class="wb-invisible">' + _pe.dic.get('%duration') + '</span><span>--:--:--</span></p><p class="wb-mm-timeline-inner"><span class="wb-invisible">' + _pe.dic.get('%percentage') + '</span><progress value="0" max="100" aria-live="off" /></p>'),
				ui_end = $('<div class="wb-mm-controls-end">');

			ui_start.append(
				$('<button>').attr({
					type: 'button',
					'class': 'rewind',
					'aria-controls': id,
					'title': _pe.dic.get('%rewind')
				}).append(_pe.fn.multimedia.get_image('rewind', _pe.dic.get('%rewind')))
			);

			ui_start.append(
				$('<button>').attr({
					type: 'button',
					'class': 'playpause',
					'aria-controls': id,
					'title': _pe.dic.get('%play')
				}).append(_pe.fn.multimedia.get_image('play', _pe.dic.get('%play')))
			);

			ui_start.append(
				$('<button>').attr({
					type: 'button',
					'class': 'fastforward',
					'aria-controls': id,
					'title': _pe.dic.get('%fast-forward')
				}).append(_pe.fn.multimedia.get_image('ff', _pe.dic.get('%fast-forward')))
			);

			if (cc === true) {
				ui_end.append(
					$('<button>').attr({
						type: 'button',
						'class': 'cc',
						'aria-controls': id,
						'title': _pe.dic.get('%closed-caption', 'enable')
					}).append(_pe.fn.multimedia.get_image('cc', _pe.dic.get('%closed-caption', 'enable')))
				);
			} else {
				ui.addClass('wb-mm-no-cc');
			}

			ui_end.append(
				$('<button>').attr({
					type: 'button',
					'class': 'mute',
					'aria-controls': id,
					'title': _pe.dic.get('%mute', 'enable')
				}).append(_pe.fn.multimedia.get_image('mute_off', _pe.dic.get('%mute', 'enable')))
			);

			ui.append(ui_start).append(ui_end).append(ui_timeline);

			return ui;
		},

		//Standardized multimedia interface
		_intf : {
			// Methods
			play: function () {
				try {
					this.object.play();
				} catch (e) {
					this.object.doPlay();
				}
			},
			pause: function () {
				try {
					this.object.pause();
				} catch (e) {
					this.object.doPause();
				}
			},

			// Properties
			getPaused: function () {
				return (typeof this.object.paused !== 'function' ? this.object.paused : this.object.paused());
			},

			getPlayed: function () {
				return (typeof this.object.played !== 'function' ? this.object.played : this.object.played());
			},

			getEnded: function () {
				return (typeof this.object.ended !== 'function' ? this.object.ended : this.object.ended());
			},

			getSeeking: function () {
				return (typeof this.object.seeking !== 'function' ? this.object.seeking : this.object.seeking());
			},

			getDuration: function () {
				return (typeof this.object.duration !== 'function' ? this.object.duration : this.object.duration());
			},

			getBuffered: function () {
				return (typeof this.object.buffered !== 'function' ? (this.object.buffered.length > 0 ? this.object.buffered.end(0) : 0) : this.object.buffered());
			},

			getCurrentTime: function () {
				return (typeof this.object.currentTime !== 'function' ? this.object.currentTime : this.object.currentTime());
			},

			setCurrentTime: function (t) {
				if (typeof this.object.currentTime !== 'function') {this.object.currentTime = t; } else {this.object.setCurrentTime(t); }
			},

			getCaptionsVisible: function () {
				return $(this).find('.wb-mm-captionsarea').is(':visible');
			},

			setCaptionsVisible : function (v) {
				if (v) {
					$(this).find('.wb-mm-captionsarea').show();
				} else {
					$(this).find('.wb-mm-captionsarea').hide();
				}
				$(this.evtmgr).trigger('captionsvisiblechange');
			},

			getMuted : function () {
				return (typeof this.object.muted !== 'function' ? this.object.muted : this.object.muted());
			},

			setMuted : function (m) {
				if (typeof this.object.muted !== 'function') {this.object.muted = m; } else {this.object.setMuted(m); }
			},

			getVolume : function () {
				return (typeof this.object.volume !== 'function' ? this.object.volume : this.object.volume());
			},

			setVolume : function (v) {
				if (typeof this.object.volume !== 'function') {this.object.volume = v; } else {this.object.setVolume(v); }
			}
		},

		_format_time : function (current) {
			var t = "",
				i,
				c,
				p;
			current = Math.floor(current);

			for (i = 2; i >= 0; i -= 1) {
				p = Math.pow(60, i);
				c = Math.floor(current / p);
				if (t !== "") {t += ":"; }
				t += _pe.string.pad(c, 2);
				current -= p * c;
			}

			return t;
		},

		_load_captions : function (evtmgr, src) {
			var parse_time,
				parse_html,
				parse_xml,
				load_captions_internal,
				load_captions_external,
				curUrl,
				srcUrl,
				c;

			/*-------------------------------------------*/
			/* Caption parsing, can be moved to a web service */
			parse_time = function (string) {
				var parts,
					s = 0,
					p,
					_plen,
					v;

				if (string !== undefined) {
					if (string.substring(string.length - 1) === 's') {
						//offset-time
						return parseFloat(string.substring(0, string.length - 1));
					} else {
						//clock time
						parts = string.split(':').reverse();
						for (p = 0, _plen = parts.length; p < _plen; p += 1) {
							v = (p === 0) ? parseFloat(parts[p]) : parseInt(parts[p], 10);
							s += v * Math.pow(60, p);
						}
						return s;
					}
				}
				return -1;
			};

			parse_html = function (content) {
				var s = '.wet-boew-tt',
					te = content.find(s),
					captions = [];

				te.each(function () {
					var e = $(this),
						begin = -1,
						end = -1,
						json;

					if (e.attr('data-begin') !== undefined) {
						//HTML5 captions (seperate attributes)
						begin = parse_time(e.attr('data-begin'));
						end = e.attr('data-end') !== undefined ? parse_time(e.attr('data-end')) : parse_time(e.attr('data-dur')) + begin;
					} else if (e.attr('data') !== undefined) {
						json = e.attr('data');

						//Sanitze the JSON
						json = json.replace(/(begin|dur|end)/gi, '"$1"').replace(/'/g, '"');
						json = $.parseJSON(json);

						begin = parse_time(json.begin);
						end = json.end !== undefined ? parse_time(json.end) : parse_time(json.dur) + begin;
					}
					//Removes nested captions if any
					e = e.clone();
					e.find(s).detach();

					captions[captions.length] = {
						text : e.html(),
						begin : begin,
						end : end
					};


				});
				return captions;
			};

			parse_xml = function (content) {
				var s = '[begin]',
					te = content.find(s),
					captions = [];

				te.each(function () {
					var e = $(this),
						begin = -1,
						end = -1;

					begin = parse_time(e.attr('begin'));
					end = e.attr('end') !== undefined ? parse_time(e.attr('end')) : parse_time(e.attr('dur')) + begin;

					//Removes nested captions if any
					e = e.clone();
					e.find(s).detach();

					captions[captions.length] = {
						text : e.html(),
						begin : begin,
						end : end
					};
				});
				return captions;
			};
			/*-------------------------------------------*/

			load_captions_internal = function (obj) {
				var eventObj = {
					type : 'captionsloaded',
					captions : parse_html(obj)
				};
				evtmgr.trigger(eventObj);
			};

			load_captions_external = function (url) {
				$.ajax({
					url : url,
					context : evtmgr,
					dataType : 'html',
					success : function (data) {
						var eventObj = {type: 'captionsloaded'};
						if (data.indexOf('<html') > -1) {
							eventObj.captions = parse_html($(data));
						} else {
							eventObj.captions = parse_xml($(data));
						}
						$(this).trigger(eventObj);
					},
					error : function (response, textStatus, errorThrown) {
						$(this).trigger({type: 'captionsloadfailed', error: errorThrown});
					}
				});
			};

			if (src !== undefined) {
				curUrl = _pe.url(window.location.href);
				srcUrl = _pe.url(src);

				if (srcUrl.removehash() === curUrl.source) {
					//Same page HTML captions
					c = $('#' + srcUrl.hash);
					if (c.length > 0) {
						load_captions_internal(c);
						return;
					}

					evtmgr.trigger({
						type: 'captionsloadfailed',
						error: new Error('Object with id "' + srcUrl.anchor + '" not found')
					});
					return;
				} else {
					//External HTML or XML captions
					load_captions_external(srcUrl.source);
					return;
				}
			}
			evtmgr.trigger({
				type: 'captionsloadfailed',
				error: new Error('Caption source is missing')
			});
		},

		_update_captions : function (area, seconds, captions) {
			var c, _clen, caption;
			area.empty();
			for (c = 0, _clen = captions.length; c < _clen; c += 1) {
				caption = captions[c];
				if (seconds >= caption.begin && seconds <= caption.end) {
					area.append($('<div>' + caption.text + '</div>'));
				}
			}
		}
	};

	//Method to allow the flash player to trigger the media events
	_pe.triggermediaevent = function (id, event) {
		$('#' + id).find('param:eq(0)').trigger(event);
	};

	window.pe = _pe;
	return _pe;
}(jQuery));
