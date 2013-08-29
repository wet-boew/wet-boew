/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*
* Embedded YouTube player with HTML-based accessible controls, optional interactive transcript and play list. 
* The original idea of accessible YouTube player controls belongs to Ken Petri, Web Accessibility Center, The Ohio State University 
* and his Accessible Controls for the YouTube Embedded Video Player library (http://wac.osu.edu/examples/youtube-player-controls/) 
* offered through Creative Commons Attribution-Share Alike 3.0 United States License (http://creativecommons.org/licenses/by-sa/3.0/us/). 
* This code uses Google YouTube JavaScript Player APIs (http://code.google.com/apis/youtube/js_api_reference.html), 
* which are bound by their Terms of Service: http://code.google.com/apis/youtube/terms.html 
* This code relies on SWFObject by Bobby van der Sluis (http://code.google.com/p/swfobject/), 
* XRegExp 2.0.0 (http://xregexp.com/), and 
* XRegExp.build v0.1.0 (http://xregexp.com/) 
* which all maintain an MIT License: http://www.opensource.org/licenses/mit-license.php
*/
/*global jQuery: false, window, XRegExp, swfobject, wet_boew_youtube: false*/
/*jslint bitwise: true, nomen: true, white: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, strict:true, undef:true, unused:true, curly:true, browser:true, jquery:true, maxerr:50, smarttabs:true, newcap: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.youtube = {
		type: 'plugin',
		// This is an example from tabbed interface, to show how to call required libraries when they are needed
		depends: (_pe.mobile ? ['xregexp'] : ['xregexp']),
		//Specifies polyfill needed by the plugin (for elements created at runtime)
		polyfills: [],

		seed: 0,

		TEMPLATE: {

			PLAYER_TEMPLATE: "<div class='background-light wet-boew-youtube-player-container align-center'>" +
										"<div id='{0}'></div>" +
									"</div>",

			CLEAR_DIV: "<div class='clear'></div>",

			PLAYER_CONTROL_BAR: "<div class='button-toolbar margin-bottom-none margin-top-small'>" +
										"<h4 class='wb-invisible'>{9}</h4>" + // another string
										"<span class='button-group margin-bottom-none margin-top-none margin-right-large indent-none'>" +
											"<button id='{0}-play' role='button' aria-controls='{1}' aria-pressed='false' class='wet-boew-youtube-play button-small button button-accent'>{2}</button>" +
											"<button id='{0}-forward' role='button' aria-controls='{1}' class='wet-boew-youtube-forward button-small button'>{3}</button>" +
											"<button id='{0}-back' role='button' aria-controls='{1}' class='wet-boew-youtube-back button-small button'>{4}</button>" +
											"<button id='{0}-stop' role='button' aria-controls='{1}' class='wet-boew-youtube-stop button-small button button-accent'>{5}</button>" +
										"</span>" +
										"<span class='button-group margin-bottom-none margin-top-none'>" +
											"<button id='{0}-volup' role='button' aria-controls='{1}' class='wet-boew-youtube-volup button-small button button-info'>{6}</button>" +
											"<button id='{0}-voldown' role='button' aria-controls='{1}' class='wet-boew-youtube-voldown button-small button button-info'>{7}</button>" +
											"<button id='{0}-mute' role='button' aria-controls='{1}' aria-pressed='false' class='wet-boew-youtube-mute button-small button'>{8}</button>" +
										"</span>" +
									"</div>",

			PLAYER_STATUS_BAR: "<div class='margin-bottom-medium'>" +
										"<h4 class='wb-invisible'>{2}</h4>" + // another string
										"<div class='width-30 align-left float-left margin-right-large'>" +
											"<span><strong>{0}</strong></span>" +
										"</div>" +
										"<div class='align-left float-left'>" +
											"<span class='wet-boew-youtube-status-title'></span>" +
										"</div>" +
										"<div class='clear'></div>" +
										"<div class='width-30 align-left float-left margin-right-large'>" +
											"<span><strong>{1}</strong></span>" +
										"</div>" +
										"<div class='align-left float-left'>" +
											"<span class='wet-boew-youtube-status-time'></span>" +
										"</div>" +
										"<div class='clear'></div>" +
									"</div>",

			TRACK_DIV: "<div>" +
										"<h4 class='margin-bottom-medium'>{0}</h4>" +
										"<ul class='wet-youtube-tracklist list-bullet-none margin-top-medium'></ul> " +
									"</div>",

			TRACK_LIST_RECORD: "<li class=''><a href='{0}-track-{1}'>{2}</a></li>",

			TRANSCRIPT_DIV: "<div>" +
										"<h4 class='margin-bottom-none'>{0}</h4>" +
										"<div class='wet-boew-youtube-transcript-container'>" +
											"<div class='wet-boew-youtube-transcript'></div>" +
										"</div>" +
									"</div>",

			TRANSCRIPT_CAPTION_BLOCK: "<p><strong class='margin-right-medium'>{0}</strong></p>",

			TRANSCRIPT_CAPTION: "<a href='{0}?start={1}&end={2}'>{3}</a>"

		},

		CONST: {
			playerLoadedClass: "wet-boew-youtube-loaded",
			captionActiveClass: "wet-boew-youtube-caption-active",
			trackActiveClass: "wet-boew-youtube-track-active background-accent",
			buttonDisabled: "button-disabled ui-disabled"
		},

		format: function (s) {
			var i,
				reg;

			for (i = 0; i < arguments.length - 1; i = i + 1) {
				reg = new RegExp("\\{" + i + "\\}", "gm");
				s = s.replace(reg, arguments[i + 1]);
			}

			return s;
		},

		// formats the number of seconds into [hours:minutes:seconds]
		formatTime: function (sec) {
			sec = Math.round(sec);
			var seconds = sec % 60,
				minutes = ((sec / 60) | 0) % 60,
				hours = (sec / 3600) | 0;

			return hours + (minutes < 10 ? ":0" : ":") +
					minutes + (seconds < 10 ? ":0" : ":") +
					seconds;
		},

		fullName: "wet-boew-youtube",

		_exec: function (elm) {

			if (window.swfobject !== undefined &&
					window.XRegExp !== undefined &&
					window.XRegExp.build !== undefined) {
				_pe.fn.youtube.fnExecutedOnDependencyLoad(elm);
				return;
			}

			// push the execution call into the stack if it exists
			if (_pe.fn.youtube.execStack) {
				_pe.fn.youtube.execStack.push(elm);
				return;
			}

			// create the stack on the first call
			_pe.fn.youtube.execStack = [];
			_pe.fn.youtube.execStack.push(elm);

			// wait for all dependencies to load
			_pe.document.one('youtube-dependencies-loaded', function () {
				//console.log("all dependencies loaded");
				// execute the stack
				while (_pe.fn.youtube.execStack.length > 0) {
					_pe.fn.youtube.fnExecutedOnDependencyLoad(_pe.fn.youtube.execStack.shift());
				}
			});

			// wait for wb to load and load dependencies
			_pe.document.one('wb-init-loaded', function () {
				_pe.add._load_arr(
					[
						"http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js",
						"http://xregexp.com/addons/build.js"
					],
					'youtube-dependencies-loaded');
			});
		},

		fnExecutedOnDependencyLoad: function (elm) {
			var opts,
				overrides,

				ytparams = {
					allowScriptAccess: "always",
					allowFullScreen: "true",
					cc_load_policy: "1",
					hd: "1"
				},
				ytatts = {
					id: null
				},

				parseCaptions, // function handle
				poolHandle, // setInterval handle

				loadedTrack, // pointer to currently playing track
				markedCaption, // pointer to currently playing caption
				loaded = false, // indicates if the player has fully loaded
				player = {
					node: null, // player DOM object
					containerNode: null,
					id: null
				},
				controls = {
					play: null,
					forward: null,
					back: null,
					stop: null,
					volumeUp: null,
					volumeDown: null,
					mute: null
				},
				status = {
					titleNode: null,
					timeNode: null
				},
				transcript = {
					section: null,
					container: null,
					page: null
				},
				tracks = [],
				id = 'wet-boew-youtube-';

			id += _pe.fn.youtube.seed;
			_pe.fn.youtube.seed += 1;

			// Defaults
			opts = {
				playerWidth: "640",
				playerHeight: "360"
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				//playerWidth: elm.attr("data-player-width") || undefined,
				playerHeight: elm.attr("data-player-height") || undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_youtube), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_youtube !== 'undefined' ? wet_boew_youtube : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			// Do plugin stuff here...
			if (!window.onYouTubePlayerReady) {
				// this global function is being called when the youtube player is loaded
				window.onYouTubePlayerReady = function (playerId) {
					//console.log("Player loaded: ", playerId.replace("-player", ""));
					$("#" + playerId.replace("-player", "")).addClass(_pe.fn.youtube.CONST.playerLoadedClass);
				};
			}

			function playerPlayPause() {
				if (player.node.getPlayerState() === 1) {
					player.node.pauseVideo();
				}
				else {
					player.node.playVideo();
				}
			}

			function playerForward() {
				var node = player.node,
					dur = node.getDuration(),
					nt;

				if (dur > 0) {
					nt = Math.floor(dur * 0.2) + node.getCurrentTime();
					if (nt < dur) {
						node.seekTo(nt);
					}
					else {
						node.seekTo(dur);
					}
				}
			}

			function playerBacward() {
				var node = player.node,
					dur = node.getDuration(),
					nt;

				if (dur > 0) {
					nt = Math.max(node.getCurrentTime() - Math.floor(dur * 0.2), 0);
					if (nt < dur) {
						node.seekTo(nt);
					}
					else {
						node.seekTo(dur);
					}
				}
			}

			function playerStop() {
				if (markedCaption) {
					markedCaption.node.removeClass(_pe.fn.youtube.CONST.captionActiveClass);
				}

				transcript.container.animate({
					scrollTop: 0
				}, 350);

				player.node.pauseVideo();
				player.node.seekTo("0");
			}

			function playerVolumeUp() {
				var node = player.node,
					vol = node.getVolume(),
					nvol;

				nvol = Math.min(vol + 20, 100);
				node.setVolume(nvol);
			}

			function playerVolumeDown() {
				var node = player.node,
					vol = node.getVolume(),
					nvol;

				nvol = Math.max(vol - 20, 0);
				node.setVolume(nvol);
			}

			function playerMute() {
				var node = player.node;

				if (node.isMuted()) {
					node.unMute();
				}
				else if (node.getVolume() === 0) {
					playerVolumeUp();
				}
				else {
					node.mute();
				}
			}

			function updateControls() {
				if (player.node.getPlayerState() === 1) {
					controls.play.text(_pe.dic.get("%you-pause"));
					controls.play.attr("aria-pressed", "true");
				} else {
					controls.play.text(_pe.dic.get("%you-play"));
					controls.play.attr("aria-pressed", "false");
				}

				if (player.node.getCurrentTime() === 0) {
					controls.stop.addClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.stop.attr("aria-disabled", "true");

					controls.back.addClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.back.attr("aria-disabled", "true");
					controls.forward.removeClass(_pe.fn.youtube.CONST.buttonDisabled);

				} else if (player.node.getCurrentTime() === player.node.getDuration()) {
					controls.forward.addClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.forward.attr("aria-disabled", "true");
					controls.back.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.back.attr("aria-disabled", "false");

				} else {
					controls.stop.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.stop.attr("aria-disabled", "false");

					controls.forward.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.forward.attr("aria-disabled", "false");
					controls.back.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.back.attr("aria-disabled", "false");
				}

				if (player.node.getVolume() === 0) {
					controls.volumeUp.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.volumeUp.attr("aria-disabled", "false");
					controls.volumeDown.addClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.volumeDown.attr("aria-disabled", "true");

					controls.mute.text(_pe.dic.get("%you-unmute"));
					controls.mute.attr("aria-pressed", "true");

				} else if (player.node.getVolume() === 100) {
					controls.volumeUp.addClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.volumeUp.attr("aria-disabled", "true");
					controls.volumeDown.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.volumeDown.attr("aria-disabled", "false");

					controls.mute.text(_pe.dic.get("%you-mute"));
					controls.mute.attr("aria-pressed", "false");

				} else {
					controls.volumeUp.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.volumeUp.attr("aria-disabled", "false");
					controls.volumeDown.removeClass(_pe.fn.youtube.CONST.buttonDisabled);
					controls.volumeDown.attr("aria-disabled", "false");

					controls.mute.text(_pe.dic.get("%you-mute"));
					controls.mute.attr("aria-pressed", "false");
				}
			}

			// constructs accessible player controls
			function constructPlayerControls() {
				var controlsNode = $(_pe.fn.youtube.format(_pe.fn.youtube.TEMPLATE.PLAYER_CONTROL_BAR,
					id,
					player.id,
					_pe.dic.get("%you-play"),
					_pe.dic.get("%you-forward"),
					_pe.dic.get("%you-back"),
					_pe.dic.get("%you-stop"),
					_pe.dic.get("%you-volumeup"),
					_pe.dic.get("%you-volumedown"),
					_pe.dic.get("%you-mute"),
					_pe.dic.get("%you-controls-heading")
				));

				controlsNode.click(function (event) {
					var target = $(event.target);

					event.preventDefault();
					if (target.hasClass(_pe.fn.youtube.fullName + "-play") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerPlayPause();
					}

					if (target.hasClass(_pe.fn.youtube.fullName + "-forward") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerForward();
					}

					if (target.hasClass(_pe.fn.youtube.fullName + "-back") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerBacward();
					}

					if (target.hasClass(_pe.fn.youtube.fullName + "-stop") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerStop();
					}

					if (target.hasClass(_pe.fn.youtube.fullName + "-volup") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerVolumeUp();
					}

					if (target.hasClass(_pe.fn.youtube.fullName + "-voldown") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerVolumeDown();
					}

					if (target.hasClass(_pe.fn.youtube.fullName + "-mute") &&
							!target.hasClass(_pe.fn.youtube.CONST.buttonDisabled)) {
						playerMute();
					}
				});

				controls = {
					play: controlsNode.find("." + _pe.fn.youtube.fullName + "-play"),
					forward: controlsNode.find("." + _pe.fn.youtube.fullName + "-forward"),
					back: controlsNode.find("." + _pe.fn.youtube.fullName + "-back"),
					stop: controlsNode.find("." + _pe.fn.youtube.fullName + "-stop"),
					volumeUp: controlsNode.find("." + _pe.fn.youtube.fullName + "-volup"),
					volumeDown: controlsNode.find("." + _pe.fn.youtube.fullName + "-voldown"),
					mute: controlsNode.find("." + _pe.fn.youtube.fullName + "-mute")
				};

				player.containerNode.append(controlsNode);
			}

			// constructs transcript section
			function constructTranscript() {
				var transcriptDiv = $(_pe.fn.youtube.format(
					_pe.fn.youtube.TEMPLATE.TRANSCRIPT_DIV,
					_pe.dic.get("%you-transcript-heading")
				));

				transcript = {
					section: transcriptDiv,
					container: transcriptDiv.find(".wet-boew-youtube-transcript-container"),
					page: transcriptDiv.find(".wet-boew-youtube-transcript")
				};

				if (tracks.length > 1) {
					elm.children().last().before(transcriptDiv);
				} else {
					elm.append(transcriptDiv);
				}
			}

			function hideTranscript() {
				if (transcript.section.is(':visible')) {
					transcript.section.slideToggle("slow");
				}
			}

			function showTranscript() {
				if (transcript.section.is(':hidden')) {
					transcript.section.slideToggle("slow");
				}
			}

			// loads caption data
			function loadCaptions(track) {
				$.get(track.captionUrl, function (data) {
					//console.log("Captions loaded: ", track.captionUrl);
					parseCaptions(data, track);
				}).fail(function () {
					//console.log("Captions failed: ", track.captionUrl);
					hideTranscript();
				});
			}

			// forwards to the clicked caption's time slot
			function captionClickHandler(event) {
				event.preventDefault();
				player.node.seekTo(event.data.caption.startSec, true);
				player.node.playVideo();
			}

			// updates transcript section with a specified track's captions
			function updateTrascript(track) {
				var i,
					caption,
					captionBlock,
					transcriptArea;

				if (track.captionUrl) {

					showTranscript();

					if (!track.captions) {
						loadCaptions(track);
					} else {

						transcriptArea = transcript.page;
						transcriptArea.empty();

						for (i = 0; i < track.captions.length; i += 1) {
							caption = track.captions[i];

							if (caption.timestamp) {
								if (captionBlock) {
									transcriptArea.append(captionBlock);
								}

								captionBlock = $(_pe.fn.youtube.format(_pe.fn.youtube.TEMPLATE.TRANSCRIPT_CAPTION_BLOCK, caption.timestamp));
							}

							caption.node.click(
								{ caption: caption },
								captionClickHandler
							);

							captionBlock.append(caption.node);
						}

						transcriptArea.append(captionBlock);

						transcript.container.animate({
							scrollTop: 0
						}, 350);
					}

				} else {
					hideTranscript();
				}
			}

			// parse caption file into individual snippets
			// supports YouTube caption format
			parseCaptions = function (data, track) {
				var lib = {
					hours: /[0-9]/,
					minutes: /[0-9][0-9]/,
					seconds: /[0-9][0-9]/,
					milisec: /[0-9][0-9][0-9]/
				},

					block = XRegExp(".*?[.]\n\n", "sg"),
					//block = XRegExp(".*?\n\n", "sg"),
					phrase = XRegExp.build("({{start}}),({{end}})\n({{text}})\n\n",
						{
							start: XRegExp.build("(?<sh>{{hours}}):(?<sm>{{minutes}}):(?<ss>{{seconds}}).(?<sms>{{milisec}})",
												lib, "sg"),
							end: XRegExp.build("(?<eh>{{hours}}):(?<em>{{minutes}}):(?<es>{{seconds}}).(?<ems>{{milisec}})",
												lib, "sg"),
							text: XRegExp.build(".*?")
						}, "sg"),
					caption,
					captions = [],
					blockpos = 0,
					phrasepos = 0,
					blockmatch,
					phrasematch,
					capStart;

				// normalize line breaks;
				data = data.replace(/\r?\n|\r/g, "\n");

				while ((blockmatch = XRegExp.exec(data, block, blockpos, true)) !== null) {

					phrasepos = 0;
					while ((phrasematch = XRegExp.exec(blockmatch[0], phrase, phrasepos, true)) !== null) {
						caption = {
							start: phrasematch.start,
							end: phrasematch.end,
							text: phrasematch.text + " ",
							startSec: phrasematch.sh * 3600 + phrasematch.sm * 60 + parseInt(phrasematch.ss, 10) + parseFloat("0." + phrasematch.sms, 10),
							endSec: phrasematch.eh * 3600 + phrasematch.em * 60 + parseInt(phrasematch.es, 10) + parseFloat("0." + phrasematch.ems, 10),
							node: $(_pe.fn.youtube.format(_pe.fn.youtube.TEMPLATE.TRANSCRIPT_CAPTION,
										id,
										phrasematch.start,
										phrasematch.end,
										phrasematch.text + " "
									)
							)
						};

						if (!capStart) {
							capStart = XRegExp.exec(phrasematch.start, /\d:\d\d:\d\d/);
							caption.timestamp = capStart;
						}

						captions.push(caption);
						phrasepos = phrasematch.index + phrasematch[0].length;
					}

					blockpos = blockmatch.index + blockmatch[0].length;
					capStart = null;
				}

				track.captions = captions;
				updateTrascript(track);
			};

			// constructs node indicated player's current status
			function constructPlayerStatus() {
				var statusNode = $(_pe.fn.youtube.format(
						_pe.fn.youtube.TEMPLATE.PLAYER_STATUS_BAR,
						_pe.dic.get("%you-playing"),
						_pe.dic.get("%you-time"),
						_pe.dic.get("%you-status-heading")
					)
				);

				status = {
					titleNode: statusNode.find("." + _pe.fn.youtube.fullName + "-status-title"),
					timeNode: statusNode.find("." + _pe.fn.youtube.fullName + "-status-time")
				};

				player.containerNode.prepend(statusNode);
			}

			// loads the selected video track into the player
			function trackClickHandler(event) {
				loadedTrack.node.removeClass(_pe.fn.youtube.CONST.trackActiveClass);
				loadedTrack = event.data.track;
				loadedTrack.node.addClass(_pe.fn.youtube.CONST.trackActiveClass);

				event.preventDefault();

				if (markedCaption) {
					markedCaption.node.removeClass(_pe.fn.youtube.CONST.captionActiveClass);
				}
				player.node.loadVideoById(loadedTrack.youtubeUrl, 0);
				playerStop();

				updateTrascript(loadedTrack);
			}

			// constructs track play list only if there is more than one track added to the player
			function constructTrackList() {
				var trackDiv,
					trackList,
					track,
					i;

				if (tracks.length > 1) {

					trackDiv = $(_pe.fn.youtube.format(_pe.fn.youtube.TEMPLATE.TRACK_DIV,
							_pe.dic.get("%you-playlist-heading"),
							id
						)
					);

					trackList = trackDiv.children("ul:first");

					for (i = 0; i < tracks.length; i += 1) {
						track = tracks[i];

						track.node.click(
							{ track: track },
							trackClickHandler
						);

						trackList.append(track.node);
					}

					elm.append(trackDiv);
				}
			}

			function scrollCaptionIntoView(caption) {
				var container = transcript.container,
					page = transcript.page,
					offsetTop,
					containerHeight = container.height(),
					upperLimit = containerHeight * 0.3, lowerLimit = containerHeight * 0.6,
					targetPosition = containerHeight * 0.35;

				offsetTop = caption.node.offset().top - page.offset().top;

				if ((offsetTop > container.scrollTop() + lowerLimit) ||
					(offsetTop < container.scrollTop() + upperLimit)) {

					//console.log(id, " offsetting transcript to " + parseInt((offsetTop - targetPosition), 10));
					container.animate({
						scrollTop: offsetTop - targetPosition
					}, 350);
				}
			}

			function markCurrentlyPlayed() {
				var i;

				//console.log(id, " current time: ", player.node.getCurrentTime());
				for (i = 0; i < loadedTrack.captions.length; i += 1) {
					loadedTrack.captions[i].node.removeClass(_pe.fn.youtube.CONST.captionActiveClass);
				}

				if (markedCaption) {
					markedCaption.node.addClass(_pe.fn.youtube.CONST.captionActiveClass);
					scrollCaptionIntoView(markedCaption);
				}
			}

			function findCurrentCaption() {
				var i,
					captions = loadedTrack.captions,
					time = player.node.getCurrentTime(),
					caption;

				if (loadedTrack.captionUrl && captions) {
					for (i = 0; i < captions.length; i += 1) {
						caption = captions[i];
						if (caption.startSec <= time && caption.endSec > time && caption !== markedCaption) {
							markedCaption = caption;
							markCurrentlyPlayed();
							return;
						}
					}
				}
			}

			// updates the player's current status
			function updateStatus() {
				status.titleNode.text(loadedTrack.title);
				status.timeNode.text(
					_pe.fn.youtube.formatTime(player.node.getCurrentTime()) +
					" / " +
					_pe.fn.youtube.formatTime(player.node.getDuration())
				);
			}

			// pools the player state tracking the current playing time
			function trackPlayerState() {
				if (loaded) {
					poolHandle = window.clearInterval(poolHandle);
					poolHandle = window.setInterval(
						function () {
							findCurrentCaption();
							updateStatus();
							updateControls();
						},
						500
					);
				}
			}

			// wait until the player is fully loaded
			function waitPlayerInit() {
				poolHandle = window.setInterval(
					function () {
						//console.log("init tick ", id);
						if ($("#" + id).hasClass(_pe.fn.youtube.CONST.playerLoadedClass)) {
							//console.log("Player registered ", player.id);
							poolHandle = window.clearInterval(poolHandle);

							loaded = true;

							constructPlayerControls();
							constructPlayerStatus();
							constructTrackList();
							constructTranscript();
							updateTrascript(loadedTrack);

							trackPlayerState();
						}
					},
					500
				);
			}

			// a callback when the player has been embedded
			function embedCallback() {
				player.node = $("#" + player.id).get(0);

				//Scale the UI when the video scales
				_pe.window.on('resize',
					{
						'player': player,
						'oldWidth': player.containerNode.width()
					},
					function (event) {
						var p = event.data.player,
						newWidth = p.containerNode.width();

						if (event.data.oldWidth !== newWidth) {
							p.node.setAttribute("width", newWidth);
							event.data.oldWidth = newWidth;
						}
					});

				waitPlayerInit();
			}

			//Add an id if an id is missing
			if (elm.attr('id') !== undefined) {
				id = elm.attr('id');
			} else {
				elm.attr('id', id);
			}

			// setting up youtube player
			player = {
				loaded: false,
				id: id + "-player",
				node: null
			};

			// get youtube tracks
			elm.children('span').each(function (index) {
				var track = $(this);
				tracks.push(
					{
						youtubeUrl: track.attr("data-youtube-src"),
						captionUrl: track.attr("data-youtube-caption"),
						title: track.text(),
						node: $(_pe.fn.youtube.format(_pe.fn.youtube.TEMPLATE.TRACK_LIST_RECORD,
										id,
										index,
										track.text()
								)
						)
					}
				);
				// remove span tag
				$(this).remove();
			});

			// add player if there's at least one track
			if (tracks.length > 0) {

				loadedTrack = tracks[0];
				loadedTrack.node.addClass(_pe.fn.youtube.CONST.trackActiveClass);

				player.containerNode = $(_pe.fn.youtube.format(
						_pe.fn.youtube.TEMPLATE.PLAYER_TEMPLATE,
						player.id
					)
				);
				elm.append(player.containerNode);

				opts.playerWidth = player.containerNode.width();

				ytatts.id = player.id;
				//console.log("Embed ", id);
				swfobject.embedSWF("http://www.youtube.com/v/" +
						loadedTrack.youtubeUrl + "?enablejsapi=1&playerapiid=" + player.id + "&hd=1&rel=0&fs=1",
						player.id, opts.playerWidth, opts.playerHeight, "8", null, null, ytparams, ytatts,
						embedCallback
				);
			}

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
} (jQuery));
