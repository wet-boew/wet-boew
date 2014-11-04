( function( $, wb ) {
	"use strict";

	var $document = wb.doc,
		selector = ".wb-mltmd",

		//TODO: Investigate integrating in gaTracking to avoid collission
		vid_per = 0,
		vid_sent_per = [],
		endedSent = false,
		pt;

	function trackEvent( player, vaction ) {
		window.console.log( vaction + " + " + player.gaTracking.title );
		/*if(!(typeof dataLayer === "undefined" || dataLayer === null)){
					dataLayer.push({'event': 'dynamicevent', 'dleventaction': vaction, 'dleventlabel': vtitle, 'dleventcategory': 'Video'});
		}
		if(!(typeof dataLayer1 === "undefined" || dataLayer1 === null)){
				dataLayer1.push({'event': 'dynamicevent', 'dleventaction': vaction, 'dleventlabel': vtitle, 'dleventcategory': 'Video'});
		}*/

	}

	function configureTracking( player ) {
		var $player = $( player ),
			title = $player.find( "video[title], iframe[title]" ).attr("title"),
			duration, minutes, seconds;

		if ( !title || title === "YouTube video player" ) {

			//TODO: Add better logic to detect YouTube title
			title = $player.find( "source" ).eq( 0 ).attr( "src" );
		}

		duration = parseInt( player.player( "getDuration" ), 10 );
		minutes = Math.floor( duration / 60 );
		seconds = duration % 60;

		//TODO: replace with WET core logic for timeoutput when exposed
		title = "(" + minutes + ":" + seconds + ") - " + title;

		player.gaTracking = { title: title };
	}

	$document.on( "play pause ended timeupdate durationchange", selector, function( event ) {
		var player = event.currentTarget,
			currentTime, totalTime, i, sent, tenPenMark;

		//get current time
		currentTime = Math.floor( player.player( "getCurrentTime" ) );
		//get total time
		totalTime = Math.floor( player.player( "getDuration" ) );

		tenPenMark = Math.floor(totalTime / 10);

		switch ( event.type ) {
		case "durationchange":
			configureTracking( player );
			break;
		case "play":
			trackEvent( player, "play" );
		break;
		case "pause":
			if ( currentTime !== totalTime ) {
				trackEvent( player, "pause" );
			}
		break;
		case "ended":
			if ( !endedSent ) {
				endedSent = true;
				trackEvent( player, "Ended" );
				if ( vid_sent_per.length !== 10 ) {
					for ( i = 1; i <= 10; i += 1 ) {
						sent = jQuery.inArray( i * 10, vid_sent_per );
						if ( sent < 0 ) {
							vid_sent_per.push(i * 10);
							trackEvent( player, ( i * 10 ).toString() + "%" );
						}
					}
					endedSent = false;
				}
				vid_sent_per.length = 0;
			}
		break;
		case "timeupdate":
			if ( currentTime !== 0 ) {
				if ( currentTime % tenPenMark === 0 ) {
					for ( i = 1; i <= 10; i += 1 ) {
						if ( currentTime === ( tenPenMark * i ) ) {
							vid_per = 10 * i;
							i += 1;
						}
					}
					sent = jQuery.inArray( vid_per, vid_sent_per );
					if ( sent < 0 ) {
						vid_sent_per.push( vid_per );
						trackEvent( player, vid_per.toString() + "%" );
					}
				}
				if ( currentTime > ( pt + 1 ) )
				{
					trackEvent( player, "Fast Forward" );
				} else if ( currentTime < pt ) {
					trackEvent( player, "Rewind" );
				}
				pt = currentTime;
			}
		break;
		}
	});

	$( window ).on( "beforeunload", function() {
		var players = $( selector ),
			playersLength = players.length,
			playerIndex, player, cMarker, totalTime, currentTime, i, sent;

		for ( playerIndex = 0; playerIndex < playersLength; playerIndex += 1 ) {
			player = players[ playerIndex ];

			currentTime = Math.floor( player.player( "getCurrentTime" ) );
			totalTime = Math.floor( player.player( "getDuration" ) );

			if ( currentTime > 0 && currentTime !== totalTime ) {
				cMarker = Math.floor( ( currentTime / totalTime ) * 10 );
				for ( i = 1; i <= cMarker; i++) {
					sent = jQuery.inArray( i * 10, vid_sent_per );
					if ( sent < 0 ) {
						vid_sent_per.push( i * 10 );
						trackEvent( player, ( i * 10 ).toString() + "%" );
					}
				}
			}
		}
	});

})(jQuery, wb);
