/**
 * @title Carousel
 * @overview Dynamically stacks multiple images and captions into a carousel (or slider) widget.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
 (function( $, window, wb ) {
 "use strict";

 /*
  * Variable and function definitions.
  * These are global to the plugin - meaning that they will be initialized once per page,
  * not once per instance of plugin on the page. So, this is a good place to define
  * variables that are common to all instances of the plugin on a page.
  */
var selector = ".wb-carousel",
	$document = wb.doc,
	i18n, i18nText,
	controls = selector + " [role=tablist] a",

	/**
	 * @method onTimerPoke
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onTimerPoke = function( $elm ) {
		var dataDelay = $elm.data( "delay" ),
			setting, delay;

		if ( !dataDelay ) {
			$elm.trigger( "init.wb-carousel" );
			return false;
		}

		// State playing
		if ( !$elm.hasClass( "playing" ) ) {
			return false;
		}

		// Add settings and counter
		setting = parseFloat( dataDelay );
		delay = parseFloat( $elm.data( "ctime" ) ) + 0.5;

		// Check if we need
		if ( setting < delay ) {
			$elm.trigger( "shift.wb-carousel" );
			delay = 0;
		}
		$elm.data( "ctime", delay );
	},

	/**
	 * @method createControls
	 * @param {jQuery DOM element} $tablist The plugin element
	 */
	createControls = function( $tablist ) {
		var $sldr = $tablist.parents( selector ),
			prevText = i18nText.prev,
			nextText = i18nText.next,
			spaceText = i18nText.space,
			isPlaying = $sldr.hasClass( "playing" ),
			state = isPlaying ? i18nText.pause : i18nText.play,
			hidden = isPlaying ? i18nText.rotStop : i18nText.rotStart,
			glyphiconStart = "<span class='glyphicon glyphicon-",
			wbInvStart = "<span class='wb-inv'>",
			tabsToggleStart = "<li class='control ",
			btnMiddle = "' href='javascript:;' role='button' title='",
			btnEnd = "</span></a></li> ",
			iconState = glyphiconStart + ( isPlaying ? "pause" : "play" ) + "'></span>",
			controls = tabsToggleStart + "prv'><a class='prv" + btnMiddle +
				prevText + "'>" + glyphiconStart + "chevron-left'></span>" +
				wbInvStart + prevText + btnEnd + tabsToggleStart +
				"plypause'><a class='plypause" + btnMiddle + state + "'>" +
				iconState + " <i>" + state + "</i>" + wbInvStart + spaceText +
				i18nText.hyphen + spaceText + hidden + "</span></a></li> " +
				tabsToggleStart + "nxt'><a class='nxt" + btnMiddle + nextText +
				"'>" + glyphiconStart + "chevron-right'></span>" + wbInvStart +
				nextText + btnEnd;

		$tablist.append( controls );
		$sldr.addClass( "inited" );
	},

	/**
	 * @method drizzleAria
	 * @param {jQuery DOM element} $tabs The tabpanel grouping
	 * @param {jQuery DOM element} $tabList The pointers to the groupings
	 */
	drizzleAria = function( $tabs, $tabList ) {

		// lets process the elements for aria
		var tabs = $tabs.get(),
			tabCounter = tabs.length - 1,
			listItems = $tabList.children().get(),
			listCounter = listItems.length - 1,
			isActive, item, link;

		for ( ; tabCounter !== -1; tabCounter -= 1 ) {
			item = tabs[ tabCounter ];
			isActive = item.className.indexOf( "in" ) !== -1;

			item.tabIndex = isActive ? "0" : "-1";
			item.setAttribute( "aria-hidden", isActive ? "false" : "true" );
			item.setAttribute( "aria-expanded", isActive ? "true" : "false" );
			item.setAttribute( "aria-labelledby", item.id + "-lnk" );
		}

		for ( ; listCounter !== -1; listCounter -= 1 ) {
			item = listItems[ listCounter ];
			item.setAttribute( "role", "presentation" );
			isActive = item.className.indexOf( "active" ) !== -1;

			link = item.getElementsByTagName( "a" )[ 0 ];
			link.tabIndex = isActive ? "0" : "-1";
			link.setAttribute( "role", "tab" );
			link.setAttribute( "aria-selected", isActive ? "true" : "false" );
			link.setAttribute( "aria-controls", link.getAttribute( "href" ).substring( 1 ) + "-lnk" );
		}
		$tabList.attr( "aria-live", "off" );
	},

	/**
	 * @method onInit
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onInit = function( $elm ) {
		var interval = 6,
			$tabs = $elm.find( "[role=tabpanel]" ),
			$tablist = $elm.find( "[role=tablist]" );

		// Only initialize the i18nText once
		if ( !i18nText ) {
			i18n = wb.i18n;
			i18nText = {
				prev: i18n( "prv" ),
				next: i18n( "nxt" ),
				play: i18n( "play" ),
				rotStart: i18n( "tab-rot" ).on,
				rotStop: i18n( "tab-rot" ).off,
				space: i18n( "space" ),
				hyphen: i18n( "hyphen" ),
				pause: i18n( "pause" )
			};
		}

		if ( $elm.hasClass( "slow" ) ) {
			interval = 9;
		} else if ( $elm.hasClass( "fast" ) ) {
			interval = 3;
		}

		$tabs.filter( ":not(.in)" )
			.addClass( "out" );
		$elm.data({
			delay: interval,
			ctime: 0
		});

		drizzleAria( $tabs, $tablist );
		createControls( $tablist );

		$elm.data({
			tabs: $tabs,
			tablist: $tablist
		});
	},

	/**
	 * @method onShift
	 * @param {jQuery DOM element} $sldr The plugin element
	 * @param {jQuery DOM element} $elm The selected link from the tablist
	 */
	onPick = function( $sldr, $elm ) {
		var $items = $sldr.data( "tabs" ),
			$controls = $sldr.data( "tablist" );

		$items.filter( ".in" )
			.removeClass( "in" )
			.addClass( "out" )
			.attr({
				"aria-hidden": "true",
				"aria-expanded": "false",
				tabindex: "-1"
			});

		$items.filter( "[aria-labelledby=" + $elm.attr( "aria-controls" ) + "]" )
			.removeClass( "out" )
			.addClass( "in" )
			.attr({
				"aria-hidden": "false",
				"aria-expanded": "true",
				tabindex: "0"
			});

		$controls.find( ".active" )
			.removeClass( "active" )
			.children( "a" )
				.attr({
					"aria-selected": "false",
					tabindex: "-1"
				})
			.end()
				.find( $elm )
					.attr({
						"aria-selected": "true",
						tabindex: "0"
					})
					.parent()
						.addClass( "active" );
	},

	/**
	 * @method onShift
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onShift = function( $elm, event ) {
		var $items = $elm.data( "tabs" ),
			$controls = $elm.data( "tablist" ),
			len = $items.length,
			current = $elm.find( ".in" ).prevAll( "[role=tabpanel]" ).length,
			shiftto = event.shiftto ? event.shiftto : 1,
			next = current > len ? 0 : current + shiftto,
			$next;

		next = ( next > len - 1 ) ? 0 : ( next < 0 ) ? len - 1 : next;

		$next = $items.eq( next );

		$items.eq( current )
			.removeClass( "in" )
			.addClass( "out" )
			.attr({
				"aria-hidden": "true",
				"aria-expanded": "false"
			});
		$next.removeClass( "out" )
			.addClass( "in" )
			.attr({
				"aria-hidden": "false",
				"aria-expanded": "true"
			});
		$controls.find( ".active" )
			.removeClass( "active" )
			.attr( "aria-selected", "false" )
			.end()
				.find( "[href=#" + $next.attr( "id" ) + "]" )
					.parent()
						.addClass( "active" )
						.attr( "aria-selected", "true" );
	},

	/**
	 * @method onShift
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {integer} shifto The item to shift to
	 */
	onCycle = function( $elm, shifto ) {
		$elm.trigger({
			type: "shift.wb-carousel",
			shiftto: shifto
		});
	};

 // Bind the init event of the plugin
 $document.on( "timerpoke.wb init.wb-carousel shift.wb-carousel", selector, function( event ) {
	var eventType = event.type,

		// "this" is cached for all events to utilize
		$elm = $( this );

	switch ( eventType ) {
	case "timerpoke":
		onTimerPoke( $elm );
		break;

	/*
	 * Init
	 */
	case "init":
		onInit( $elm );
		break;

	/*
	 * Change Slides
	 */
	case "shift":
		onShift( $elm, event );
		break;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
 });

 /*
  * Next / Prev
  */
 $document.on( "click vclick keydown", controls, function( event ) {
	var which = event.which,
		elm = event.currentTarget,
		className = elm.className,
		rotStopText = i18nText.rotStop,
		playText = i18nText.play,
		$elm, text, inv, $sldr;

	// Ignore middle and right mouse buttons
	if ( !which || which === 1 || which === 32 || ( which > 36 && which < 41 ) ) {
		event.preventDefault();
		$elm = $( elm );
		$sldr = $elm
			.parents( selector )
			.attr( "data-ctime", 0 );

		// Spacebar
		if ( which > 36 ) {
			onCycle( $elm, which < 39 ? -1 : 1 );
			$sldr.find( ".active a" ).trigger( "setfocus.wb" );
		} else {
			if ( elm.getAttribute( "role" ) === "tab" ) {
				onPick( $sldr, $elm );
				$( elm.getAttribute( "href" ) ).trigger( "setfocus.wb" );
			} else if ( className.indexOf( "plypause" ) !== -1 ) {
				$elm.find( ".glyphicon" ).toggleClass( "glyphicon-play glyphicon-pause" );
				$sldr.toggleClass( "playing" );

				text = elm.getElementsByTagName( "i" )[ 0 ];
				text.innerHTML = text.innerHTML === playText ? i18nText.pause : playText;

				inv = $elm.find( ".wb-inv" )[ 0 ];
				inv.innerHTML = inv.innerHTML === rotStopText ? i18nText.rotStart : rotStopText;
			} else {
				onCycle( $elm, className.indexOf( "prv" ) !== -1 ? -1 : 1 );
			}
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
 });

 // Add the timer poke to initialize the plugin
 wb.add( selector );

 })( jQuery, window, wb );
