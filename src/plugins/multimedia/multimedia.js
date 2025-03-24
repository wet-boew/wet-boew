/**
 * @title WET-BOEW Multimedia PLayer
 * @overview An accessible multimedia player for <audio> and <video> tags
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
/* globals YT */
( function( $, DOMPurify, window, wb, undef ) {
"use strict";

/* Local scoped variables*/
var componentName = "wb-mltmd",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	ctrls = selector + " .wb-mm-ctrls",
	dispCtrls = selector + " .display," + ctrls,
	template,
	i18n, i18nText,
	youtubeReadyEvent = "ready.youtube",
	captionsLoadedEvent = "ccloaded" + selector,
	captionsLoadFailedEvent = "ccloadfail" + selector,
	captionsVisibleChangeEvent = "ccvischange" + selector,
	renderUIEvent = "renderui" + selector,
	initializedEvent = "inited" + selector,
	youtubeEvent = "youtube" + selector,
	resizeEvent = "resize" + selector,
	templateLoadedEvent = "templateloaded" + selector,
	cuepointEvent = "cuepoint" + selector,
	captionClass = "cc_on",
	multimediaEvents = [
		"durationchange",
		"playing",
		"pause",
		"ended",
		"volumechange",
		"timeupdate",
		"waiting",
		"canplay",
		"seeked",
		"progress",
		captionsLoadedEvent,
		captionsLoadFailedEvent,
		captionsVisibleChangeEvent,
		cuepointEvent
	].join( " " ),
	$document = wb.doc,
	$window = wb.win,

	/**
	 * @function init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var eventTarget = wb.init( event, componentName, selector );

		if ( eventTarget ) {

			// Only initialize the i18nText once
			if ( !i18nText ) {

				// YT workaround for when played inside a modal dialog, like with lightbox
				//
				// the issue is when the iFrame is moved, it reloads and then it doesn't emit the right event to
				// adjust the WET multimedia controller to represent its current state.
				//
				// This needs to be executed only once, that is why it is in the i18nText conditional
				window.addEventListener( "message", function( e ) {
					var data, frames, i, i_len, i_cache;

					// Ensure we don't conflict with other postMessage listener
					try {
						data = JSON.parse( e.data );

						// Only for a specific YT message
						if ( data.event && data.event === "infoDelivery" && data.info && data.info.playerState ) {

							// Find the iFrame and evaluate if it needs to be reposted
							frames = document.getElementsByTagName( "iframe" );

							i_len = frames.length;
							for ( i = 0; i < i_len; i++ ) {
								i_cache = frames[ i ];
								if ( i_cache.dataset.L2 && i_cache.contentWindow === e.source  ) {

									// Prepare the event data and emulate the YT object for our event management need
									youTubeEvents.call( i_cache, {
										target: i_cache.parentElement.parentElement.object,
										data: data.info.playerState
									} );
									break;
								}
							}
						}
					} catch ( err ) {

						/* swallow error */
					}
				} );

				//
				// END YT workaround
				//

				i18n = wb.i18n;
				i18nText = {
					play: i18n( "mmp-play" ),
					pause: i18n( "pause" ),
					volume: i18n( "volume" ),
					cc_on: i18n( "cc", "on" ),
					cc_off: i18n( "cc", "off" ),
					cc_error: i18n( "cc-err" ),
					fs: i18n( "fs" ),
					mute_on: i18n( "mute", "on" ),
					mute_off: i18n( "mute", "off" ),
					duration: i18n( "dur" ),
					position: i18n( "pos" )
				};
			}

			if ( template === undef ) {
				template = "";
				$( eventTarget ).trigger( {
					type: "ajax-fetch.wb",
					fetch: {
						url: wb.getPath( "/assets" ) + "/mediacontrols.html"
					}
				} );
			} else if ( template !== "" ) {
				$( eventTarget ).trigger( templateLoadedEvent );
			}
		}
	},

	/* helper functions*/

	/**
	 * @method formatTime
	 * @description format a number of seconds to SMTPE Timecode format (HH:MM:SS.FF)
	 * @param {Float} time The time to format
	 * @returns {String} the formatted time
	 */
	formatTime = function( time ) {
		var index = 2,
			timecode = "",
			secondsIn, current, pad;

		pad = function( number, digits ) {
			return new Array( Math.max( digits - String( number ).length + 1, 0 ) ).join( 0 ) + number;
		};

		time = Math.floor( time );

		//Loop to extract hours, minutes and seconds
		while ( index >= 0 ) {

			//Get the number of seconds for the current iteration (hour, minute or second)
			secondsIn = Math.pow( 60, index );
			current = Math.floor( time / secondsIn );

			if ( timecode !== "" ) {
				timecode += ":";
			}

			timecode += pad( current, 2 );
			time -= secondsIn * current;
			index -= 1;
		}
		return timecode;
	},

	/**
	 * @method parseTime
	 * @description parse an SMTPE Timecode string (HH:MM:SS.FF) or duration (45s) and returns the number of seconds for the timecode
	 * @param {String} time The timecode or duration string to parse
	 * @returns {Float} the number of seconds in time
	 */
	parseTime = function( time ) {
		var i, parts, timeStringPortion, partLength, seconds;

		if ( time !== undef ) {
			if ( time.charAt( time.length - 1 ) === "s" ) {

				//Duration parsing
				return parseFloat( time.substring( 0, time.length - 1 ) );
			} else {

				//SMTPE Timecode Parsing
				parts = time.split( ":" ).reverse();
				seconds = 0;

				for ( i = 0, partLength = parts.length; i < partLength; i += 1 ) {
					timeStringPortion = i === 0 ?
						parseFloat( parts[ i ] ) :
						parseInt( parts[ i ], 10 );
					seconds += timeStringPortion * Math.pow( 60, i );
				}
				return seconds;
			}
		}
		return -1;
	},

	/*
	 * Performant micro templater
	 * @credit: https://github.com/premasagar/tim/blob/master/tinytim.js
	 * @todo: caching
	 */
	tmpl = ( function() {
		var start = "{{",
			end = "}}",

			// e.g. config.person.name
			path = "[a-z0-9_$][\\.a-z0-9_]*",
			pattern = new RegExp( start + "\\s*(" + path + ")\\s*" + end, "gi" );
		return function( template, data ) {

			// Merge data into the template string
			return template.replace( pattern, function( tag, token ) {
				var path = token.split( "." ),
					len = path.length,
					lookup = data,
					i = 0;
				for ( ; i < len; i += 1 ) {
					lookup = lookup[ path[ i ] ];

					// Property not found
					if ( lookup === undef ) {
						throw "tim: '" + path[ i ] + "' not found in " + tag;
					}

					// Return the required value
					if ( i === len - 1 ) {
						return lookup;
					}
				}
			} );
		};
	}() ),

	/**
	 * @method parseHtml
	 * @description parse an HTML fragment and extract embed captions
	 * @param {String} content The HTML fragment containing the captions
	 * @returns {Array} An array of captions objects (ex: {text: "Caption", begin: 0, end :10})
	 */
	parseHtml = function( content ) {
		var captions = [],
			captionSelector = ".wb-tmtxt",
			captionElements = content.find( captionSelector ),
			len = captionElements.length,
			i, captionElement, json, begin, end;

		for ( i = 0; i !== len; i += 1 ) {
			captionElement = $( captionElements[ i ] );
			begin = -1;
			end = -1;

			if ( captionElement.attr( "data-begin" ) !== undef ) {
				begin = parseTime( captionElement.attr( "data-begin" ) );
				end = captionElement.attr( "data-end" ) !== undef ?
					parseTime( captionElement.attr( "data-end" ) ) :
					parseTime( captionElement.attr( "data-dur" ) ) + begin;
			} else if ( captionElement.attr( "data" ) !== undef ) {
				json = captionElement.attr( "data" )
					.replace( /(begin|dur|end)/g, "\"$1\"" )
					.replace( /'/g, "\"" );
				json = $.parseJSON( json );
				begin = parseTime( json.begin );
				end = json.end !== undef ?
					parseTime( json.end ) :
					parseTime( json.dur ) + begin;
			}

			//Removes nested captions if an
			captionElement = captionElement.clone();
			captionElement.find( captionSelector ).detach();

			captions[ captions.length ] = {
				text: captionElement.html(),
				begin: begin,
				end: end
			};
		}
		return captions;
	},

	/**
	 * @method parseXml
	 * @description parse an TTML (Xml) document and extract captions
	 * @param {String} content The TTML fragment containing the captions
	 * @returns {Array} An array of captions objects (ex: {text: "Caption", begin: 0, end :10})
	 */
	parseXml = function( content ) {
		var captions = [],
			captionSelector = "[begin]",
			parser = new DOMParser(),
			doc = parser.parseFromString( content, "application/xml" ),
			captionElements = doc.querySelectorAll( captionSelector ),
			len = captionElements.length,
			i, captionElement, begin, end;

		for ( i = 0; i !== len; i += 1 ) {
			captionElement = captionElements[ i ];

			begin = parseTime( captionElement.getAttribute( "begin" ) + "" );
			end = captionElement.hasAttribute( "end" ) ?
				parseTime( captionElement.getAttribute( "end" ) + "" ) :
				parseTime( captionElement.getAttribute( "dur" ) + "" ) + begin;

			captions[ captions.length ] = {
				text: DOMPurify.sanitize( captionElement.textContent ),
				begin: begin,
				end: end
			};
		}
		return captions;
	},

	/**
	 * @method loadCaptionsExternal
	 * @description Loads captions from an external source (HTML embed or TTML)
	 * @param {Object} elm The jQuery object for the multimedia player loading the captions
	 * @param {String} url The url for the captions resource to load
	 * @fires ccloaded.wb-mltmd
	 * @fires ccloadfail.wb-mltmd
	 */
	loadCaptionsExternal = function( elm, url ) {
		$.ajax( {
			url: url,
			dataType: "html",

			//Filters out images and objects from the content to avoid loading them
			dataFilter: function( data ) {
				return data.replace( /<img|object [^>]*>/g, "" );
			},
			success: function( data ) {

				var captionItems;

				if ( data.indexOf( "<html" ) !== -1 ) {

					// Sanitize the response
					captionItems = parseHtml( $( DOMPurify.sanitize( data, { WHOLE_DOCUMENT: true } ) ) );
				} else {

					// Response is sanitized in the XML parser function
					captionItems = parseXml( data );
				}

				if ( captionItems.length ) {
					elm.trigger( {
						type: captionsLoadedEvent,
						captions: captionItems
					} );
				} else {
					elm.trigger( {
						type: captionsLoadFailedEvent
					} );
				}
			},
			error: function( response, textStatus, errorThrown ) {
				elm.trigger( {
					type: captionsLoadFailedEvent,
					error: errorThrown
				} );
			}
		} );
	},

	/**
	 * @method loadCaptionsInternal
	 * @description Loads same page captions embedded in HTML
	 * @param {Object} elm The jQuery object for the multimedia player loading the captions
	 * @param {Object} obj The jQUery object containing the captions
	 * @fires ccloaded.wb-mltmd
	 */
	loadCaptionsInternal = function( elm, obj ) {
		var captionItems = parseHtml( obj );

		if ( captionItems.length ) {
			elm.trigger( {
				type: captionsLoadedEvent,
				captions: captionItems
			} );
		} else {
			elm.trigger( {
				type: captionsLoadFailedEvent
			} );
		}
	},

	/**
	 * @method updateCaptions
	 * @description Update the captions for a multimedia player (called from the timeupdate event of the HTML5 media API)
	 * @param {Object} area The jQuery object for the element where captions are displayed
	 * @param {Float} seconds The current time of the media (use to sync the captions)
	 * @param {Object} captions The JavaScript object containing the captions
	 */
	updateCaptions = function( area, seconds, captions ) {
		var caption, i,
			captionsLength = captions.length;

		// added &#160; (non-breaking space) to prevent caption space from collapsing
		// Used .html() instead of .append for performance purposes
		// https://jsperf.com/jquery-append-vs-html-list-performance/2
		area.html( "&#160;" );

		for ( i = 0; i < captionsLength; i += 1 ) {
			caption = captions[ i ];
			if ( seconds >= caption.begin && seconds <= caption.end ) {
				area.html( $( "<div>" + caption.text + "</div>" ) );
			}
		}
	},

	/**
	 * @method playerApi
	 * @description Normalizes the calls to the HTML5 media API
	 * @param {String} fn The function to call
	 * @param {object} args The arguments to send to the function call
	 */
	playerApi = function( fn, args ) {
		var $this, method;

		switch ( fn ) {
			case "play":
				try {
					this.object.play();
				} catch ( ex ) {
					this.object.doPlay();
				}
				break;
			case "pause":
				try {
					this.object.pause();
				} catch ( ex ) {
					this.object.doPause();
				}
				break;
			case "getCaptionsVisible":
				return $( this ).hasClass( captionClass );
			case "setCaptionsVisible":
				$this = $( this );
				if ( args ) {
					$this.addClass( captionClass );
				} else {
					$this.removeClass( captionClass );
				}
				$this.trigger( captionsVisibleChangeEvent );
				break;
			case "fullscreen":
				if ( this.object.requestFullscreen ) {
					this.object.requestFullscreen();
				} else if ( this.object.webkitRequestFullscreen ) { /* Safari */
					this.object.webkitRequestFullscreen();
				} else if ( this.object.msRequestFullscreen ) { /* IE11 */
					this.object.msRequestFullscreen();
				}
				break;
			case "getBuffering":
				return this.object.buffering || false;
			case "setBuffering":
				this.object.buffering = args;
				break;
			case "getPreviousTime":
				return this.object.previousTime;
			case "setPreviousTime":
				this.object.previousTime = args;
				break;
			default:
				method = fn.charAt( 3 ).toLowerCase() + fn.substr( 4 );
				switch ( fn.substr( 0, 3 ) ) {
					case "get":
						return typeof this.object[ method ] !== "function" ?
							this.object[ method ] :
							this.object[ method ]();
					case "set":
						typeof this.object[ method ] !== "function" ?
							this.object[ method ] = args :
							this.object[ fn ]( args );
				}
		}
	},

	/**
	 * @method youTubeApi
	 * @description Normalizes the calls to the YouTube API
	 * @param {String} fn The function to call
	 * @param {object} args The arguments to send to the function call
	 */
	youTubeApi = function( fn, args ) {
		var $media = $( this.object.getIframe() ),
			state;

		switch ( fn ) {
			case "play":
				this.object.wasMutedPlay = this.object.isMuted();
				return this.object.playVideo();
			case "pause":
				return this.object.pauseVideo();
			case "getPaused":
				state = this.object.getPlayerState();
				return state === -1 || state === 0 || state === 2 || state === 5;
			case "getPlayed":
				return this.object.getPlayerState() > -1;
			case "getEnded":
				return this.object.getPlayerState() === 0;
			case "getDuration":
				return this.object.getDuration();
			case "getCurrentTime":
				return this.object.getCurrentTime();
			case "setCurrentTime":
				return this.object.seekTo( args, true );
			case "fullscreen":
				return this.object.getIframe().requestFullscreen();
			case "getMuted":
				if ( !this.object.playedOnce && this.object.wasMutedPlay ) {
					state = this.object.wasMutedPlay;
					this.object.playedOnce = true;
					return state;
				} else {
					return this.object.isMuted();
				}
			case "setMuted":
				if ( args ) {
					this.object.mute();
				} else {
					this.object.unMute();
				}
				setTimeout( function() {
					$media.trigger( "volumechange" );
				}, ( wb.isReady ? 50 : 500 ) );
				break;
			case "getVolume":
				return this.object.getVolume() / 100;
			case "setVolume":
				this.object.setVolume( args * 100 );
				setTimeout( function() {
					$media.trigger( "volumechange" );
				}, 50 );
				break;
			case "getCaptionsVisible":
				return $( this ).hasClass( captionClass );
			case "setCaptionsVisible":
				if ( args ) {
					$( this ).addClass( captionClass );
					try {
						this.object.loadModule( "cc" );
						this.object.setOption( "cc", "track", { languageCode: this.object.getOption( "cc", "tracklist" )[ 0 ].languageCode } );
					} catch ( e ) {
						this.object.loadModule( "captions" );
						this.object.setOption( "captions", "track", { languageCode: this.object.getOption( "captions", "tracklist" )[ 0 ].languageCode } );
					}
				} else {
					$( this ).removeClass( captionClass );
					this.object.unloadModule( "cc" );
					this.object.unloadModule( "captions" );
				}
				$media.trigger( "ccvischange" );
		}
	},

	/**
	 * @method youTubeEvents
	 * @description YouTube API event manager
	 * @param {object} event The event object for the triggered event
	 */
	youTubeEvents = function( event ) {
		var media = event.target.getIframe(),
			$media = $( media ),
			timeline = function() {
				$media.trigger( "timeupdate" );
			},
			$mltmPlayerElm,
			mltmPlayerElm,
			isMuted;

		switch ( event.data ) {
			case null: // init
				$media
					.trigger( "canplay" )
					.trigger( "durationchange" );

				// Put video on mute if the video is muted on init, run once
				$mltmPlayerElm = $media.parentsUntil( selector ).parent();

				// Mute the player, GUI
				if ( $mltmPlayerElm.data( "putMutedOnInit" ) ) {
					youTubeApi.call( $mltmPlayerElm.get( 0 ), "setMuted", true );
					$mltmPlayerElm.data( "putMutedOnInit", false );
				}
				break;
			case -1:
				event.target.unMute();
				$media.trigger( "durationchange" );
				break;
			case 0:
				$media.trigger( "ended" );
				media.timeline = clearInterval( media.timeline );
				break;
			case 1: // play

				// Get the media player
				$mltmPlayerElm = $media.parentsUntil( selector ).parent();
				mltmPlayerElm = $mltmPlayerElm.get( 0 );

				// Need to be muted here
				isMuted = mltmPlayerElm.player( "getMuted" );

				// Reset the close caption state when iframe was reloaded
				if ( media.dataset.L2 ) {
					youTubeApi.call( mltmPlayerElm, "setCaptionsVisible", $mltmPlayerElm.hasClass( captionClass ) );
				}

				// Play
				$media
					.trigger( "canplay" )
					.trigger( "play" )
					.trigger( "playing" );

				// Reset muted as needed because youtube onMute by default when playing
				if ( isMuted ) {
					youTubeApi.call( mltmPlayerElm, "setMuted", true );
				}

				media.timeline = setInterval( timeline, 250 );
				break;
			case 2:
				$media.trigger( "pause" );
				media.timeline = clearInterval( media.timeline );
				break;
			case 3:
				media.timeline = clearInterval( media.timeline );
				break;
		}
	},

	youTubeAPIReady = function() {
		var youTube = window.youTube;
		youTube.ready = true;
		$document.trigger( youtubeReadyEvent );
	},

	onResize = function() {
		$( selector + " object, " + selector + " iframe, " +  selector + " video" ).trigger( resizeEvent );
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

$window.on( "resize", onResize );

$document.on( "ajax-fetched.wb " + templateLoadedEvent, selector, function( event ) {
	var $this = $( this );

	if ( event.type === "ajax-fetched" ) {
		template = event.fetch.pointer.html();

		//Notify all player waiting for the controls to load
		$this = $( selector );
	}

	$this.trigger( {
		type: initializedEvent
	} );
} );

$document.on( initializedEvent, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var $this = $( this ),
			$media = $this.children( "audio, video" ).eq( 0 ),
			captions = $media.children( "track[kind='captions']" ).attr( "src" ) || undef,
			id = $this.attr( "id" ),
			mId = $media.attr( "id" ) || id + "-md",
			type = $media.is( "audio" ) ? "audio" : "video",
			title = $media.attr( "title" ) || "",
			width = type === "video" ? $media.attr( "width" ) || $media.width() : 0,
			height = type === "video" ? $media.attr( "height" ) || $media.height() : 0,
			settings = wb.getData( $this, componentName ),
			data = $.extend( {
				media: $media,
				captions: captions,
				id: id,
				mId: mId,
				type: type,
				title: title,
				height: height,
				width: width
			}, i18nText ),
			media = $media.get( 0 ),
			youTube = window.youTube,
			url,
			i18n = wb.i18n;

		if ( $media.attr( "id" ) === undef ) {
			$media.attr( "id", mId );
		}

		if ( settings !== undef ) {
			data.shareUrl = settings.shareUrl;
			data.fullscreen = settings.fullscreenBtn || false;
		}

		$this.addClass( type );

		if ( $media.find( "[type='video/youtube']" ).length > 0 ) {

			// lets tweak some variables and start the load sequence
			url = wb.getUrlParts( $this.find( "[type='video/youtube']" ).attr( "src" ) );

			// lets set the flag for the call back
			data.youTubeId = url.params.v ? url.params.v : url.pathname.substr( 1 );

			// Defaults config set on the video element
			data.isInitMuted = $media.get( 0 ).muted;

			if ( youTube.ready === false ) {
				$document.one( youtubeReadyEvent, function() {
					$this.trigger( youtubeEvent, data );
				} );
			} else {
				$this.trigger( youtubeEvent, data );
			}

			// finally lets load safely
			return Modernizr.load( {
				load: "https://www.youtube.com/iframe_api",

				//possible solution for multimedia and doaction conflict in corporate network
				complete: function() {

					// Ensure that YouTube API is loading the iframe and if it fails, ensure that it will show a message, like accessing the web via our GC network.
					setTimeout( function() {
						var resources, arrIframesYt, $notifText;

						resources = window.performance.getEntriesByType( "resource" );

						/* get all the iframe initiators that have the same YT url id */
						arrIframesYt  = resources.filter( function( obj ) {

							return obj.initiatorType === "iframe" && obj.name.includes( data.youTubeId );

						} );


						/* if none found, most probably wb is loaded in restricted network so wb.ready() is triggered for not preventing other wb components to load*/
						if ( arrIframesYt.length < 1 ) {
							if ( !wb.isReady ) {

								// show the video notification error
								$notifText = $( "<div aria-live='polite' class='pstn-lft-xs bg-dark text-white'><p class='mrgn-tp-md mrgn-rght-md mrgn-bttm-md mrgn-lft-md'>" + i18n( "msgYoutubeNotLoad" ) + "</p></div>" );
								$this.prepend( $notifText );
								data.notifyText = $notifText;
								wb.ready( $this, componentName );
							}
						}
					}, 1000 );

				}
			} );

		} else if ( media.error === null && media.currentSrc !== "" && media.currentSrc !== undef ) {
			$this.trigger( renderUIEvent, [ type, data ] );
			onResize();

			// Identify that initialization has completed
			wb.ready( $this, componentName );
		}
	}
} );

/*
 *  YouTube Video mode Event
 */
$document.on( youtubeEvent, selector, function( event, data ) {
	if ( event.namespace === componentName ) {
		var mId = data.mId,
			$this = $( event.currentTarget ),
			$media, ytPlayer;

		ytPlayer = new YT.Player( mId, {
			videoId: data.youTubeId,
			width: data.width,
			height: data.height,
			playerVars: {
				autoplay: 0,
				controls: 0,
				hl: wb.lang,
				origin: wb.pageUrlParts.host,
				rel: 0,
				cc_load_policy: 1
			},
			events: {
				onReady: function( event ) {
					if ( data.notifyText ) {
						data.notifyText.hide();
					}
					onResize();
					youTubeEvents( event );
					if ( !wb.isReady ) {
						wb.ready( $this, componentName );
					}
				},
				onStateChange: youTubeEvents,
				onApiChange: function() {

					//If captions were enabled before the module was ready, re-enable them
					var t = $this.get( 0 );
					t.player( "setCaptionsVisible", t.player( "getCaptionsVisible" ) );
				},
				onError: function() {
					console.warn( "There is an issue loading the YouTube player" );
				}
			}
		} );

		$this.addClass( "youtube" );

		$media = $this.find( "#" + mId );

		data.media = $media;
		data.ytPlayer = ytPlayer;

		// The fullscreen button is not visible by default because there are no controls when in full screen.
		if ( data.fullscreen ) {
			$this.attr( "data-fullscreen-btn", true );
		}

		// Detect if the YT player reloads, like when magnific Popup show the modal, because it moves the iframe
		// and then the iframe gets refreshed and reloaded. So the issue is that the iframe stops emitting the event
		// needed to adjust the multimedia player controller, like the "onStateChange" event.
		$media.on( "load", function( evt ) {

			var elm = evt.currentTarget,
				ds = elm.dataset;

			// Do nothing on the first load and add a flag to indicate it is loaded a second time
			if ( ds.L1 ) {
				ds.L2 = true;
			} else {
				ds.L1 = true;
			}
		} );

		$this.trigger( renderUIEvent, [ "youtube", data ] );
	}
} );

$document.on( renderUIEvent, selector, function( event, type, data ) {
	if ( event.namespace === componentName ) {
		var $this = $( event.currentTarget ),
			captionsUrl = wb.getUrlParts( data.captions ),
			currentUrl = wb.getUrlParts( window.location.href ),
			$media = data.media,
			$eventReceiver;

		$media
			.after( tmpl( template, data ) )
			.wrap( "<div class=\"display\"></div>" );

		$eventReceiver = $media.is( "object" ) ? $media.children( ":first-child" ) : $media;

		// Create an adapter for the event management
		$eventReceiver.on( multimediaEvents, function( event ) {
			$this.trigger( event );
		} );

		this.object = data.ytPlayer || $media.get( 0 );
		this.player = ( data.ytPlayer ) ? youTubeApi : playerApi;

		// Trigger the duration change for cases where the event was called before the event binding
		if ( type !== "youtube" && !isNaN( this.player( "getDuration" ) ) ) {
			$eventReceiver.trigger( "durationchange" );
		}

		// Load the progress polyfill if needed
		$this.find( "progress" ).trigger( "wb-init.wb-progress" );

		// Load the slider polyfill if needed
		$this.find( "input[type='range']" ).trigger( "wb-init.wb-slider" );

		// Create the share widgets if needed
		if ( data.shareUrl !== undef ) {
			$( "<div class='wb-share' data-wb-share='{\"type\": \"" +
				( type === "audio" ? type : "video" ) + "\", \"title\": \"" +
				data.title.replace( /'/g, "&apos;" ) + "\", \"url\": \"" + data.shareUrl +
				"\", \"pnlId\": \"" + data.id + "-shr\"}'></div>" )
				.insertBefore( $media.parent() )
				.trigger( "wb-init.wb-share" );
		}

		if ( data.isInitMuted ) {
			$this.data( "putMutedOnInit", true );
		} else if ( !data.ytPlayer && this.object.muted ) {
			$media.trigger( "volumechange" );
		}

		if ( data.captions === undef ) {
			return 1;
		}

		// Load the captions
		if ( currentUrl.absolute.replace( currentUrl.hash || "#", "" ) !== captionsUrl.absolute.replace( captionsUrl.hash || "#", "" ) ) {
			loadCaptionsExternal( $media, captionsUrl.absolute );
		} else {
			loadCaptionsInternal( $media, $( "#" + wb.jqEscape( captionsUrl.hash.substring( 1 ) ) ) );
		}

		// The fullscreen button is not visible by default because there are no controls when in full screen.
		if ( data.fullscreen ) {
			$this.attr( "data-fullscreen-btn", true );
		}
	}
} );

/*
 * UI Bindings
 */

$document.on( "click", selector, function( event ) {
	var $target = $( event.target ),
		className = $target.attr( "class" ) || "";

	// Ignore middle and right mouse buttons
	if ( event.which === 2 || event.which === 3 ) {
		return true;
	}

	// Optimized multiple class tests to include child glyphicon because Safari was reporting the click event
	// from the child span not the parent button, forcing us to have to check for both elements
	// JSPerf for multiple class matching https://jsperf.com/hasclass-vs-is-stackoverflow/7
	if (  /playpause|-play|-pause|display/.test( className ) || $target.is( "object" ) || $target.is( "video" ) ) {
		this.player( "getPaused" ) || this.player( "getEnded" ) ? this.player( "play" ) : this.player( "pause" );
	} else if ( /(^|\s)cc\b|-subtitles/.test( className ) && !$target.attr( "disabled" ) && !$target.parent().attr( "disabled" ) ) {
		this.player( "setCaptionsVisible", !this.player( "getCaptionsVisible" ) );
	} else if ( /\bmute\b|-volume-(up|off)/.test( className ) ) {
		this.player( "setMuted", !this.player( "getMuted" ) );
	} else if ( $target.is( "progress" ) || $target.hasClass( "progress" ) || $target.hasClass( "progress-bar" ) ) {
		this.player( "setCurrentTime", this.player( "getDuration" ) * ( ( event.pageX - $target.offset().left ) / $target.width() ) );
	} else if ( /\brewind\b|-backward/.test( className ) ) {
		this.player( "setCurrentTime", this.player( "getCurrentTime" ) - this.player( "getDuration" ) * 0.05 );
	} else if ( /\bfastforward\b|-forward/.test( className ) ) {
		this.player( "setCurrentTime", this.player( "getCurrentTime" ) + this.player( "getDuration" ) * 0.05 );
	} else if ( className.includes( "cuepoint" ) ) {
		$( this ).trigger( { type: "cuepoint", cuepoint: $target.data( "cuepoint" ) } );
	} else if ( /fullscreen|fs/.test( className ) ) {
		this.player( "fullscreen" );
	}
} );

$document.on( "input change", selector, function( event ) {
	var target = event.target;

	if ( $( target ).hasClass( "volume" ) ) {
		event.currentTarget.player( "setMuted", false );
		event.currentTarget.player( "setVolume", target.value / 100 );
	}
} );

$document.on( "keydown", dispCtrls, function( event ) {
	var playerTarget = event.currentTarget.parentNode,
		which = event.which,
		volume = 0,
		step = 0.05,
		$playerTarget = $( playerTarget );

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {
		switch ( which ) {
			case 32:

				// Mute/unmute if focused on the mute/unmute button or volume input.
				if ( $( event.target ).hasClass( "mute" ) || event.target.nodeName === "INPUT" ) {
					$playerTarget.find( ".mute" ).trigger( "click" );
				} else if ( $( event.target ).hasClass( "fs" ) ) {

					// Enter full screen if focused on the full screen button
					$playerTarget.find( ".fs" ).trigger( "click" );
				} else if ( $( event.target ).hasClass( "cc" ) ) {

					// Show/hide captions if focused on the closed captions button.
					$playerTarget.find( ".cc" ).trigger( "click" );
				} else {

					// Play/pause if focused on anything else (i.e. the video itself, play/pause button or progress bar).
					$playerTarget.find( ".playpause" ).trigger( "click" );
				}
				break;

			case 37:
				playerTarget.player( "setCurrentTime", this.parentNode.player( "getCurrentTime" ) - this.parentNode.player( "getDuration" ) * 0.05 );
				break;

			case 39:
				playerTarget.player( "setCurrentTime", this.parentNode.player( "getCurrentTime" ) + this.parentNode.player( "getDuration" ) * 0.05 );
				break;

			case 38:
				volume = Math.round( playerTarget.player( "getVolume" ) * 100 ) / 100 + step;
				playerTarget.player( "setVolume", volume < 1 ? volume : 1 );
				break;

			case 40:
				volume = Math.round( playerTarget.player( "getVolume" ) * 100 ) / 100 - step;
				playerTarget.player( "setVolume", volume > 0 ? volume : 0 );
				break;

			default:
				return true;
		}
		return false;
	}
} );

$document.on( "keyup", ctrls, function( event ) {
	if ( event.which === 32 && !( event.ctrlKey || event.altKey || event.metaKey ) ) {

		// Allows the spacebar to be used for play/pause without double triggering
		return false;
	}
} );

$document.on( "wb-activate", selector, function() {
	this.player( "play" );
} );

$document.on( "closed.wb-overlay", ".wb-overlay", function( event ) {
	var mltmdPlayer = event.currentTarget.querySelector( selector );
	if ( mltmdPlayer ) {
		mltmdPlayer.player( "pause" );
	}
} );

$document.on( multimediaEvents, selector, function( event, simulated ) {
	var eventTarget = event.currentTarget,
		eventType = event.type,
		eventNamespace = event.namespace,
		$this = $( eventTarget ),
		invStart = "<span class='wb-inv'>",
		invEnd = "</span>",
		currentTime, $button, $slider, buttonData, isPlay, isMuted, isCCVisible, skipTo, volume;
	switch ( eventType ) {
		case "playing":
		case "pause":
		case "ended":
			isPlay = eventType === "playing";
			$button = $this.find( ".playpause" );
			buttonData = $button.data( "state-" + ( isPlay ? "off" : "on" ) );
			if ( isPlay ) {
				$this.addClass( "playing" );
				$this.find( ".progress" ).addClass( "active" );
			} else {
				if ( eventType === "ended" ) {
					this.loading = clearTimeout( this.loading );
				}
				$this.removeClass( "playing" );
			}
			$button
				.attr( "title", buttonData )
				.children( "span" )
				.toggleClass( "glyphicon-play", !isPlay )
				.toggleClass( "glyphicon-pause", isPlay )
				.html( invStart + buttonData + invEnd );
			break;

		case "volumechange":
			isMuted = eventTarget.player( "getMuted" );
			$button = $this.find( ".mute" );
			buttonData = $button.data( "state-" + ( isMuted ? "off" : "on" ) );
			volume = eventTarget.player( "getVolume" ) * 100;
			$button
				.attr( {
					title: buttonData,
					"aria-pressed": isMuted
				} )
				.children( "span" )
				.toggleClass( "glyphicon-volume-up", !isMuted )
				.toggleClass( "glyphicon-volume-off", isMuted )
				.html( invStart + buttonData + invEnd );
			$slider = $this.find( "input[type='range']" );
			$slider[ 0 ].value = isMuted ? 0 : volume;
			$slider.trigger( "wb-update.wb-slider" );
			break;

		case "timeupdate":
			currentTime = eventTarget.player( "getCurrentTime" );
			$this.find( "progress" )
				.attr(
					"value",
					Math.round( currentTime / eventTarget.player( "getDuration" ) * 1000 ) / 10
				).trigger( "wb-update.wb-progress" );

			$this.find( ".wb-mm-tmln-crrnt span:nth-child(2)" )
				.text( formatTime( currentTime ) );

			if ( $this.hasClass( captionClass ) && $.data( eventTarget, "captions" ) !== undef ) {
				updateCaptions(
					$this.find( ".wb-mm-cc" ),
					currentTime,
					$.data( eventTarget, "captions" )
				);
			}
			break;

		case "durationchange":
			$this.find( ".wb-mm-tmln-ttl span:nth-child(2)" )
				.text( formatTime( eventTarget.player( "getDuration" ) ) );

			// Skip to pointer from the querystring
			skipTo = wb.pageUrlParts.params[ event.target.id ];
			if ( skipTo ) {
				skipTo = parseTime( skipTo );
				eventTarget.player( "setCurrentTime", skipTo );
			}
			break;

		case "ccloaded":
			if ( eventNamespace === componentName ) {
				$.data( eventTarget, "captions", event.captions );
			}
			break;

		case "ccloadfail":
			if ( eventNamespace === componentName ) {
				if ( !$this.hasClass( "errmsg" ) ) {
					$this.addClass( "cc_on errmsg" )
						.find( ".wb-mm-cc" )
						.append( "<div>" + i18nText.cc_error + "</div>" )
						.end()
						.find( ".cc" )
						.attr( "disabled", "" )
						.removeAttr( "aria-pressed" );
				}
			}
			break;

		case "ccvischange":
			if ( eventNamespace === componentName ) {
				isCCVisible = eventTarget.player( "getCaptionsVisible" );
				$button = $this.find( ".cc" );
				buttonData = $button.data( "state-" + ( isCCVisible ? "off" : "on" ) );
				$button.attr( {
					title: buttonData,
					"aria-pressed": isCCVisible
				} ).children( "span" ).html( invStart + buttonData + invEnd );
			}
			break;

		case "waiting":
			if ( !simulated ) {
				$document.off( "progress", selector );
			}
			this.loading = setTimeout( function() {
				$this.addClass( "waiting" );
			}, 500 );
			break;

		case "canplay":
		case "seeked":
			this.loading = clearTimeout( this.loading );
			$this.removeClass( "waiting" );
			break;
		case "cuepoint":
			eventTarget.player( "setCurrentTime", parseTime( event.cuepoint ) );
			break;
	}
} );

// Fallback for browsers that don't implement the waiting events
$document.on( "progress", selector, function( event ) {
	var eventTarget = event.currentTarget,
		$this = $( eventTarget );

	// Waiting detected
	if ( this.player( "getPaused" ) === false && this.player( "getCurrentTime" ) === this.player( "getPreviousTime" ) ) {
		if ( eventTarget.player( "getBuffering" ) === false ) {
			eventTarget.player( "setBuffering", true );
			$this.trigger( "waiting", true );
		}

	// Waiting has ended
	} else if ( eventTarget.player( "getBuffering" ) === true ) {
		eventTarget.player( "setBuffering", false );
		$this.trigger( "canplay", true );
	}
	eventTarget.player( "setPreviousTime", eventTarget.player( "getCurrentTime" ) );
} );

$document.on( resizeEvent, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var media = event.target,
			$media = $( media ),
			figure = event.currentTarget,
			ratio, newHeight,
			heightDiff;

		ratio = $media.attr( "height" ) / $media.attr( "width" );

		// Calculate the new height based on the specified ratio or assume a default 16:9 ratio
		newHeight = Math.round( $media.width() * ( !isNaN( ratio ) ? ratio : 0.5625 ) );

		if ( newHeight > window.innerHeight ) {
			heightDiff = figure.offsetHeight - window.innerHeight;
			newHeight = $media.height() - heightDiff;
		}

		$media.css( "height", newHeight + "px" );
	}
} );

window.onYouTubeIframeAPIReady = youTubeAPIReady;

window.youTube = {
	ready: false
};

wb.add( selector );

} )( jQuery, DOMPurify, window, wb );
