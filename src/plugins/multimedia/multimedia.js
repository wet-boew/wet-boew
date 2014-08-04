/**
 * @title WET-BOEW Multimedia PLayer
 * @overview An accessible multimedia player for <audio> and <video> tags, including a Flash fallback
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
/* globals YT */
(function( $, window, wb, undef ) {
"use strict";

/* Local scoped variables*/
var componentName = "wb-mltmd",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	uniqueCount = 0,
	template,
	i18n, i18nText,
	captionsLoadedEvent = "ccloaded" + selector,
	captionsLoadFailedEvent = "ccloadfail" + selector,
	captionsVisibleChangeEvent = "ccvischange" + selector,
	renderUIEvent = "renderui" + selector,
	initializedEvent = "inited" + selector,
	fallbackEvent = "fallback" + selector,
	youtubeEvent = "youtube" + selector,
	resizeEvent = "resize" + selector,
	templateLoadedEvent = "templateloaded" + selector,
	captionClass = "cc_on",
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
		var eventTarget = wb.init( event, componentName, selector ),
			elmId;

		if ( eventTarget ) {
			elmId = eventTarget.id;

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					play: i18n( "play" ),
					pause: i18n( "pause" ),
					volume: i18n( "volume" ),
					cc_on: i18n( "cc", "on" ),
					cc_off: i18n( "cc", "off" ),
					cc_error: i18n ( "cc-err" ),
					mute_on: i18n( "mute", "on" ),
					mute_off: i18n( "mute", "off" ),
					duration: i18n( "dur" ),
					position: i18n( "pos" )
				};
			}

			// Ensure there is an id on the element
			if ( !elmId ) {
				elmId = "wb-mm-" + uniqueCount;
				eventTarget.id = elmId;
				uniqueCount += 1;
			}

			if ( template === undef ) {
				template = "";
				$document.trigger({
					type: "ajax-fetch.wb",
					element: selector,
					fetch: {
						url: wb.getPath( "/assets" ) + "/mediacontrols.html"
					}
				});
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

	// TODO: Document this function
	expand = function( elm, withPlayer ) {
		var $this = $( elm ),
			data = $this.data( "properties" );

		return withPlayer !== undef ?
			[ $this, data, data.player ] :
			[ $this, data ];
	},

	/*
	 * Peformant micro templater
	 * @credit: https://github.com/premasagar/tim/blob/master/tinytim.js
	 * @todo: caching
	 */
	tmpl = (function() {
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
			});
		};
	}()),

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
			captionElements = content.find( captionSelector ),
			len = captionElements.length,
			i, captionElement, begin, end;

		for ( i = 0; i !== len; i += 1 ) {
			captionElement = $( captionElements[ i ] );
			begin = parseTime( captionElement.attr( "begin" ) );
			end = captionElement.attr( "end" ) !== undef ?
				parseTime( captionElement.attr( "end" ) ) :
				parseTime( captionElement.attr( "dur" ) ) + begin;

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
	 * @method loadCaptionsExternal
	 * @description Loads captions from an external source (HTML embed or TTML)
	 * @param {Object} elm The jQuery object for the multimedia player loading the captions
	 * @param {String} url The url for the captions resource to load
	 * @fires ccloaded.wb-mltmd
	 * @fires ccloadfail.wb-mltmd
	 */
	loadCaptionsExternal = function( elm, url ) {
		$.ajax({
			url: url,
			dataType: "html",
			//Filters out images and objects from the content to avoid loading them
			dataFilter: function( data ) {
				return data.replace( /<img|object [^>]*>/g, "" );
			},
			success: function( data ) {
				elm.trigger({
					type: captionsLoadedEvent,
					captions: data.indexOf( "<html" ) !== -1 ?
						parseHtml( $( data ) ) :
						parseXml( $( data ) )
				});
			},
			error: function( response, textStatus, errorThrown ) {
				elm.trigger({
					type: captionsLoadFailedEvent,
					error: errorThrown
				});
			}
		});
	},

	/**
	 * @method loadCaptionsInternal
	 * @description Loads same page captions emebed in HTML
	 * @param {Object} elm The jQuery object for the multimedia player loading the captions
	 * @param {Object} obj The jQUery object containing the captions
	 * @fires ccloaded.wb-mltmd
	 */
	loadCaptionsInternal = function( elm, obj ) {
		elm.trigger({
			type: captionsLoadedEvent,
			captions: parseHtml( obj )
		});
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
		// http://jsperf.com/jquery-append-vs-html-list-performance/2
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
	 * @description Normalizes the calls to the HTML5 media API and Flash Fallback
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
		var $player = $( this.object.a ),
			state;

		switch ( fn ) {
		case "play":
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
		case "getMuted":
			return this.object.isMuted();
		case "setMuted":
			if ( args ) {
				this.object.mute();
			} else {
				this.object.unMute();
			}
			setTimeout( function() {
				$player.trigger( "volumechange" );
			}, 50 );
			break;
		case "getVolume":
			return this.object.getVolume() / 100;
		case "setVolume":
			this.object.setVolume( args * 100 );
			setTimeout( function() {
				$player.trigger( "volumechange" );
			}, 50 );
			break;
		case "getCaptionsVisible":
			return $( this ).hasClass( captionClass );
		case "setCaptionsVisible":
			if ( args ) {
				$( this).addClass( captionClass );
				if ( this.object.getOptions().length > 0 ) {
					this.object.setOption( "captions", "track", this.object.getOption( "captions", "tracklist" )[ 0 ] );
				}
			} else {
				$( this ).removeClass( captionClass );
				if ( this.object.getOptions().length > 0 ) {
					this.object.setOption( "captions", "track", {} );
				}
			}
			$player.trigger( "ccvischange" );
		}
	},

	/**
	 * @method youTubeEvents
	 * @description Youtube API event manager
	 * @param {object} event The event object fior the triggered event
	 */
	youTubeEvents = function( event ) {
		var target = event.target.a,
			$target = $( event.target.a ),
			timeline = function() {
				$target.trigger( "timeupdate" );
			};

		switch ( event.data ) {
		case null:
			$target.trigger( "canplay" );
			break;
		case -1:
			event.target.unMute();
			$target.trigger( "durationchange" );
			break;
		case 0:
			$target.trigger( "ended" );
			target.timeline = clearInterval( target.timeline );
			break;
		case 1:
			$target.trigger( "canplay" );
			$target.trigger( "durationchange" );
			$target.trigger( "play" );
			target.timeline = setInterval( timeline, 250 );
			break;
		case 2:
			$target.trigger( "pause" );
			target.timeline = clearInterval( target.timeline );
			break;
		case 3:
			target.timeline = clearInterval( target.timeline );
			break;
		}
	},

	youTubeAPIReady = function() {
		var youTube = window.youTube;
		youTube.ready = true;
		youTube.waitingPlayers.trigger( youtubeEvent );
	},

	onResize = function() {
		$( selector + " object, " + selector + " iframe, " +  selector + " video" ).trigger( resizeEvent );
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

$window.on( "resize", onResize );

$document.on( "ready", onResize );

$document.on( "ajax-fetched.wb " + templateLoadedEvent, selector, function( event ) {
	var $this = $( this );

	if ( event.type === "ajax-fetched" ) {
		template = event.fetch.pointer.html();
	}

	$this.data( "template", template );
	$this.trigger({
		type: initializedEvent
	});
});

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
			data = $.extend({
				media: $media,
				captions: captions,
				id: id,
				mId: mId,
				type: type,
				title: title,
				height: height,
				width: width
			}, i18nText),
			media = $media.get( 0 ),
			youTube = window.youTube,
			url;

		if ( $media.attr( "id" ) === undef ) {
			$media.attr( "id", mId );
		}

		if ( settings !== undef ) {
			data.shareUrl = settings.shareUrl;
		}

		$this.addClass( type );

		$this.data( "properties", data );

		if ( $media.find( "[type='video/youtube']" ).length > 0 ) {
			// lets tweak some variables and start the load sequence
			url = wb.getUrlParts( $this.find( "[type='video/youtube']").attr( "src") );

			// lets set the flag for the call back
			$this.data( "youtube", url.params.v );

			// Method called the the YouTUbe API when ready

			if ( youTube.ready === false ) {
				if ( youTube.waitingPlayers === undef ) {
					youTube.waitingPlayers = $this;
				} else {
					youTube.waitingPlayers = youTube.waitingPlayers.add( $this );
				}
			} else {
				$this.trigger( youtubeEvent );
			}

			// finally lets load safely
			return Modernizr.load( {
				load: "https://www.youtube.com/iframe_api"
			} );

		} else if ( media.error === null && media.currentSrc !== "" && media.currentSrc !== undef ) {
			$this.trigger( type + selector );
		} else {
			$this.trigger( fallbackEvent );
		}

		// Identify that initialization has completed
		wb.ready( $this, componentName );
	}
});

$document.on( fallbackEvent, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var ref = expand( this ),
			$this = ref[ 0 ],
			data = ref[ 1 ],
			$media = data.media,
			type = data.type,
			source = $media.find( ( type === "video" ? "[type='video/mp4']" : "[type='audio/mp3']" ) ).attr( "src" ),
			poster = $media.attr( "poster" ),
			flashvars = "id=" + data.mId,
			width = data.width,
			height = data.height > 0 ? data.height : Math.round( data.width / 1.777 ),
			playerresource = wb.getPath( "/assets" ) + "/multimedia.swf?" + new Date().getTime();

		flashvars += "&amp;media=" + encodeURI( wb.getUrlParts( source ).absolute );
		if ( type === "video" ) {
			data.poster = "<img src='" + poster + "' class='img-responsive' height='" +
				height + "' width='" + width + "' alt='" + $media.attr( "title" ) + "'/>";

			flashvars += "&amp;height=" + height + "&amp;width=" +
				width + "&amp;posterimg=" + encodeURI( wb.getUrlParts( poster ).absolute );
		}

		$this.find( "video, audio" ).replaceWith( "<object id='" + data.mId + "' width='" + width +
			"' height='" + height + "' class='" + type +
			"' type='application/x-shockwave-flash' data='" +
			playerresource + "' tabindex='-1' play='' pause=''>" +
			"<param name='movie' value='" + playerresource + "'/>" +
			"<param name='flashvars' value='" + flashvars + "'/>" +
			"<param name='allowScriptAccess' value='always'/>" +
			"<param name='bgcolor' value='#000000'/>" +
			"<param name='wmode' value='opaque'/>" +
			data.poster + "</object>" );
		$this.data( "properties", data );
		$this.trigger( renderUIEvent, type );
	}
});

/*
 *  Youtube Video mode Event
 */
$document.on( youtubeEvent, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var ref = expand( this ),
			ytPlayer,
			$this = ref[ 0 ],
			data = ref[ 1 ],
			$media = data.media,
			id = $media.get( 0 ).id;

		$media.replaceWith( "<div id=" + id + "/>" );
		ytPlayer = new YT.Player( id, {
			videoId: $this.data( "youtube" ),
			playerVars: {
				autoplay: 0,
				controls: 1,
				origin: wb.pageUrlParts.host,
				modestbranding: 1,
				rel: 0,
				showinfo: 0,
				html5: 1,
				cc_load_policy: 1
			},
			events: {
				onReady: function( event ) {
					onResize();
					youTubeEvents( event );
				},
				onStateChange: youTubeEvents,
				onApiChange: function() {
					//If captions were enabled before the module was ready, re-enable them
					var t = $this.get( 0 );
					t.player( "setCaptionsVisible", t.player( "getCaptionsVisible" ) );
				}
			}
		});

		$this.addClass( "youtube" );

		$this.find( "iframe" ).attr( "tabindex", -1 );

		data.poster = "<img src='" + $media.attr( "poster" ) +
			"' class='img-responsive' height='" + data.height +
			"' width='" + data.width + "' alt='" + data.media.attr( "title" ) + "'/>";
		data.ytPlayer = ytPlayer;

		$this.data( "properties", data );
		$this.trigger( renderUIEvent, "youtube" );
	}
});

/*
 *  Native Video mode Event
 */
$document.on( "video" + selector, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var ref = expand( this ),
			$this = ref[ 0 ],
			data = ref[ 1 ];

		data.poster = "<img src='" + data.media.attr( "poster" ) +
			"' class='img-responsive' height='" + data.height +
			"' width='" + data.width + "' alt='" + data.media.attr( "title" ) + "'/>";

		$this.data( "properties", data );

		$this.trigger( renderUIEvent, "video" );
	}
});

/*
 *  Native Audio mode Event
 */
$document.on( "audio" + selector, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var ref = expand (this ),
			$this = ref[ 0 ],
			data = ref[ 1 ];

		data.poster = "";

		$this.data( "properties", data );

		$this.trigger( renderUIEvent, "audio" );
	}
});

$document.on( renderUIEvent, selector, function( event, type ) {
	if ( event.namespace === componentName ) {
		var ref = expand( this ),
			$this = ref[ 0 ],
			data = ref[ 1 ],
			captionsUrl = wb.getUrlParts( data.captions ),
			currentUrl = wb.getUrlParts( window.location.href ),
			$media = $this.find( "video, audio, iframe, object" ),
			$player, $overlay, $share;

		$media.after( tmpl( $this.data( "template" ), data ) );
		$overlay = $media.next().find( ".wb-mm-ovrly" ).after( $media );

		$player = $( "#" + data.mId );
		data.player = $player.is( "object" ) ? $player.children( ":first-child" ) : $player;

		// Create an adapter for the event management
		data.player.on( "durationchange play pause ended volumechange timeupdate " +
			captionsLoadedEvent + " " + captionsLoadFailedEvent + " " +
			captionsVisibleChangeEvent + " waiting canplay progress", function( event ) {
			$this.trigger( event );
		});

		this.object = data.ytPlayer || $player.get( 0 );
		this.player = ( data.ytPlayer ) ? youTubeApi : playerApi;
		$this.data( "properties", data );

		// Trigger the duration change for cases where the event was called before the event binding
		if ( type !== "youtube" && !isNaN( this.player( "getDuration" ) ) ) {
			data.player.trigger( "durationchange" );
		}

		// Load the progress polyfill if needed
		$this.find( "progress" ).trigger( "wb-init.wb-progress" );

		// Load the slider polyfill if needed
		$this.find( "input[type='range']" ).trigger( "wb-init.wb-slider" );

		// Create the share widgets if needed
		// TODO: Remove .parent() when getting rid of the overlay
		if ( data.shareUrl !== undef ) {
			$share = $( "<div class='wb-share' data-wb-share=\'{\"type\": \"" +
				( type === "audio" ? type : "video" ) + "\", \"title\": \"" +
				data.title + "\", \"url\": \"" + data.shareUrl +
				"\", \"pnlId\": \"" + data.id + "-shr\"}\'></div>" );
			$media.parent().before( $share );
			wb.add( $share );
		}

		if ( data.captions === undef ) {
			return 1;
		}

		// Load the captions
		if ( currentUrl.absolute.replace( currentUrl.hash, "" ) !== captionsUrl.absolute.replace( captionsUrl.hash, "" ) ) {
			loadCaptionsExternal( $player, captionsUrl.absolute );
		} else {
			loadCaptionsInternal( $player, $( captionsUrl.hash ) );
		}
	}
});

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
	// JSPerf for multiple class matching http://jsperf.com/hasclass-vs-is-stackoverflow/7
	if ( className.match( /playpause|-play|-pause|wb-mm-ovrly/ ) || $target.is( "object" ) ) {
		this.player( "getPaused" ) ? this.player( "play" ) : this.player( "pause" );
	} else if ( className.match( /\bcc\b|-subtitles/ )  ) {
		this.player( "setCaptionsVisible", !this.player( "getCaptionsVisible" ) );
	} else if ( className.match( /\bmute\b|-volume-(up|off)/ ) ) {
		this.player( "setMuted", !this.player( "getMuted" ) );
	} else if ( $target.is( "progress" ) || $target.hasClass( "progress" ) || $target.hasClass( "progress-bar" ) ) {
		this.player( "setCurrentTime", this.player( "getDuration" ) * ( ( event.pageX - $target.offset().left ) / $target.width() ) );
	} else if ( className.match( /\brewind\b|-backward/ ) ) {
		this.player( "setCurrentTime", this.player( "getCurrentTime" ) - this.player( "getDuration" ) * 0.05);
	} else if ( className.match( /\bfastforward\b|-forward/ ) ) {
		this.player( "setCurrentTime", this.player( "getCurrentTime" ) + this.player( "getDuration" ) * 0.05);
	}
});

$document.on( "input change", selector, function(event) {
	var target = event.target;

	if ( $( target ).hasClass( "volume" ) ) {
		event.currentTarget.player( "setMuted", false );
		event.currentTarget.player( "setVolume", target.value / 100 );
	}
});

$document.on( "keydown", selector, function( event ) {
	var playerTarget = event.currentTarget,
		which = event.which,
		ctrls = ".wb-mm-ctrls",
		ref = expand( playerTarget ),
		$this = ref[ 0 ],
		volume = 0,
		step = 0.05;

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) ) {
		switch ( which ) {
		case 32:
			$this.find( ctrls + " .playpause" ).trigger( "click" );
			break;

		case 37:
			playerTarget.player( "setCurrentTime", this.player( "getCurrentTime" ) - this.player( "getDuration" ) * 0.05);
			break;

		case 39:
			playerTarget.player( "setCurrentTime", this.player( "getCurrentTime" ) + this.player( "getDuration" ) * 0.05);
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
});

$document.on( "keyup", selector, function( event ) {
	if ( event.which === 32 && !( event.ctrlKey || event.altKey || event.metaKey ) ) {

		// Allows the spacebar to be used for play/pause without double triggering
		return false;
	}
});

$document.on( "durationchange play pause ended volumechange timeupdate " +
	captionsLoadedEvent + " " + captionsLoadFailedEvent + " " +
	captionsVisibleChangeEvent +
	" waiting canplay", selector, function( event, simulated ) {

	var eventTarget = event.currentTarget,
		eventType = event.type,
		eventNamespace = event.namespace,
		$this = $( eventTarget ),
		invStart = "<span class='wb-inv'>",
		invEnd = "</span>",
		currentTime, $button, $slider, buttonData, isPlay, isMuted, isCCVisible, ref, skipTo, volume;
	switch ( eventType ) {
	case "play":
	case "pause":
	case "ended":
		isPlay = eventType === "play";
		$button = $this.find( ".playpause" );
		buttonData = $button.data( "state-" + ( isPlay ? "off" : "on" ) );
		if ( isPlay ) {
			$this.find( ".wb-mm-ovrly" ).addClass( "playing" );
			$this.find( ".progress" ).addClass( "active" );
		} else if ( eventType === "ended" ) {
			this.loading = clearTimeout( this.loading );
			$this.find( ".wb-mm-ovrly" ).removeClass( "playing" );
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
		$slider[0].value = isMuted ? 0 : volume;
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
		ref = expand( this );
		skipTo = wb.pageUrlParts.params[ ref[ 1 ].id ];
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
			$this.find( ".wb-mm-cc" )
				.append( "<p class='errmsg'><span>" + i18nText.cc_error + "</span></p>" )
				.end()
				.find( ".cc" )
				.attr( "disabled", "" );
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
			$this.find( ".display" ).addClass( "waiting" );
		}, 500 );
		break;

	case "canplay":
		this.loading = clearTimeout( this.loading );
		$this.find( ".display" ).removeClass( "waiting" );
		break;
	}
});

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
});

$document.on( resizeEvent, selector, function( event ) {
	if ( event.namespace === componentName ) {
		var player = event.target,
			$player = $( player ),
			ratio, newHeight;

		if ( $player.hasClass( "video" ) ) {
			if ( player.videoWidth === 0 || player.videoWidth === undef ) {
				ratio = $player.attr( "height" ) / $player.attr( "width" );

				// Calculate the new height based on the specified ratio or assume a default 16:9 ratio
				newHeight = Math.round( $player.width() * ( !isNaN( ratio ) ? ratio : 0.5625 ) );

				//TODO: Remove this when captions works in chromeless api with controls
				if ( $player.is( "iframe") ) {
					newHeight += 30;
				}
				$player.css( "height", newHeight + "px" );
			} else {
				$player.css( "height", "" );
			}
		}
	}
});

window.onYouTubeIframeAPIReady = youTubeAPIReady;

window.youTube = {
	ready: false
};

wb.add( selector );

})( jQuery, window, wb );
