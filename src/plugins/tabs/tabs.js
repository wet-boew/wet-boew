/**
 * @title WET-BOEW Tabbed interface
 * @overview Dynamically stacks multiple sections of content, transforming them into a tabbed interface.
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
var pluginName = "wb-tabs",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	shiftEvent = "shift" + selector,
	setFocusEvent = "setfocus.wb",
	controls = selector + " [role=tablist] a",
	uniqueCount = 0,
	initialized = false,
	equalHeightClass = "wb-eqht",
	equalHeightOffClass = equalHeightClass + "-off",
	activePanel = "-activePanel",
	activateEvent = "click vclick keydown",
	$document = wb.doc,
	$window = wb.win,
	i18n, i18nText,

	// Includes "smallview", "xsmallview" and "xxsmallview"
	smallViewPattern = "smallview",
	isSmallView,

	defaults = {
		addControls: true,
		excludePlay: false
	},

	/*
	 * @method init
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	init = function( $elm ) {

		// Only initialize the element once
		if ( !$elm.hasClass( initedClass ) ) {
			$elm.addClass( initedClass );

			var interval = $elm.hasClass( "slow" ) ? 9 : $elm.hasClass( "fast" ) ? 3 : 6,
				$panels = $elm.children( "[role=tabpanel], details" ),
				$tablist = $elm.children( "[role=tablist]" ),
				addControls = defaults.addControls,
				excludePlay = defaults.excludePlay,
				activeId = wb.pageUrlParts.hash.substring( 1 ),
				$openPanel = activeId.length !== 0 ? $panels.filter( "#" + activeId ) : undefined,
				elmId = $elm.attr( "id" ),
				hashFocus = false,
				open = "open",
				$panel, i, len, tablist, isOpen, newId, positionY, groupClass;

			// Ensure there is an id on the element
			if ( !elmId ) {
				elmId = "tabs-cnt-" + uniqueCount;
				$elm.attr( "id", elmId );
				uniqueCount += 1;
			}

			try {

				// If the panel was not set by URL hash, then attempt to
				// retrieve from sessionStorage
				if ( !$openPanel || $openPanel.length === 0 ) {
					activeId = sessionStorage.getItem( elmId + activePanel );
					if ( activeId ) {
						$openPanel = $panels.filter( "#" + activeId );
					}

				// If the panel was set by URL hash, then store in sessionStorage
				} else {
					hashFocus = true;
					sessionStorage.setItem( elmId + activePanel, activeId );
				}
			} catch ( error ) {
			}

			// Determine the current view
			isSmallView = document.documentElement.className.indexOf( smallViewPattern ) !== -1;

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

			// Build the tablist and enhance the panels as needed for details/summary
			if ( $tablist.length === 0 ) {
				$elm.addClass( "tabs-acc" );
				groupClass = elmId + "-grp";
				addControls = false;
				$panels = $elm.children();
				len = $panels.length;

				// Ensure there is only one panel open
				// Order of priority is hash, open property, first details
				if ( !$openPanel || $openPanel.length === 0 ) {
					$openPanel = $panels.filter( "[open]" ).first();
					if ( $openPanel.length === 0 ) {
						$openPanel = $panels.eq( 0 );
					}
				}
				$panels.removeAttr( open );
				$openPanel.attr( open, open );

				// Hide the tablist in small view and the summary elements in large view
				tablist = "<ul role='tablist' aria-live='off'>";
				if ( isSmallView && $elm.hasClass( equalHeightClass ) ) {
					$elm.toggleClass( equalHeightClass + " " + equalHeightOffClass );
				}

				for ( i = 0; i !== len; i += 1 ) {
					$panel = $panels.eq( i );
					$panel
						.addClass( groupClass )
						.html(
							$panel.html()
								.replace( /(<\/summary>)/i, "$1<div class='tgl-panel'>" ) +
							"</div>"
						);

					newId = $panel.attr( "id" );
					if ( !newId ) {
						newId = "tabpanel" + uniqueCount;
						uniqueCount += 1;
						$panel.attr( "id", newId );
					}
					isOpen = !!$panel.attr( open );

					if ( isSmallView ) {
						if ( !Modernizr.details ) {
							$panel.toggleClass( "open", !isOpen );
						}
					} else {
						$panel.attr({
							role: "tabpanel",
							open: open
						});
						$panel.addClass( ( Modernizr.details ? "" :  open + " " ) +
							"fade " + ( isOpen ? "in" : "out" ) );
					}

					tablist += "<li" + ( isOpen ? " class='active'" : "" ) +
						"><a id='" + newId + "-lnk' href='#" + newId + "'>" +
						$panel.children( "summary" ).html() + "</a></li>";
				}

				$tablist = $( tablist + "</ul>" );
				$elm
					.prepend( $tablist )
					.find( "> details > summary" )
						.addClass( "wb-toggle tgl-tab" )
						.attr( "data-toggle", "{\"parent\": \"#" + elmId +
							"\", \"group\": \"." + groupClass + "\"}" )
						.trigger( "wb-init.wb-toggle" );
			} else if ( $openPanel && $openPanel.length !== 0 ) {
				$panels.filter( ".in" )
					.addClass( "out" )
					.removeClass( "in" );
				$openPanel
					.addClass( "in" )
					.removeClass( "out" );
				$tablist.find( ".active" )
					.removeClass( "active" );
				$tablist.find( "a" )
					.filter( "[href$='" + activeId + "']" )
					.parent()
						.addClass( "active" );
			}

			drizzleAria( $panels, $tablist );

			if ( addControls ) {
				createControls( $tablist, excludePlay );
			}

			// If focus is being set by the URL hash, then ensure the tabs are
			// not above the top of the viewport
			if ( hashFocus ) {

				// Need a slight delay to allow for the reflow
				setTimeout(function() {
					positionY = $tablist.offset().top;
					if ( positionY < document.body.scrollTop ) {
						document.body.scrollTop = positionY;
					}
				}, 1 );
			}

			$elm.data({
				panels: $panels,
				tablist: $tablist,
				delay: interval,
				ctime: 0
			});

			initialized = true;
		}
	},

	/*
	 * @method onTimerPoke
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onTimerPoke = function( $elm ) {
		var dataDelay = $elm.data( "delay" ),
			setting, delay;

		if ( !dataDelay ) {
			$elm.trigger( initEvent );
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
			$elm.trigger( shiftEvent );
			delay = 0;
		}
		$elm.data( "ctime", delay );
	},

	/*
	 * @method createControls
	 * @param {jQuery DOM element} $tablist The plugin element
	 * @param {boolean} excludePlay Whether or not to exclude the play/pause control
	 */
	createControls = function( $tablist, excludePlay ) {
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
			prevControl = tabsToggleStart + "prv'><a class='prv" + btnMiddle +
				prevText + "'>" + glyphiconStart + "chevron-left'></span>" +
				wbInvStart + prevText + btnEnd,
			playControl =  tabsToggleStart + "plypause'><a class='plypause" +
				btnMiddle + state + "'>" + iconState + " <i>" + state +
				"</i>" + wbInvStart + spaceText + i18nText.hyphen + spaceText +
				hidden + btnEnd,
			nextControl = tabsToggleStart + "nxt'><a class='nxt" + btnMiddle +
				nextText + "'>" + glyphiconStart + "chevron-right'></span>" +
				wbInvStart + nextText + btnEnd;

		$tablist.append( prevControl + ( excludePlay ? "" : playControl ) + nextControl );
	},

	/*
	 * @method drizzleAria
	 * @param {2 jQuery DOM element} $panels for the tabpanel grouping, and $tablist for the pointers to the groupings
	 */
	drizzleAria = function( $panels, $tabList ) {

		// lets process the elements for aria
		var panels = $panels.get(),
			tabCounter = panels.length - 1,
			listItems = $tabList.children().get(),
			listCounter = listItems.length - 1,
			isDetails = $panels[ 0 ].nodeName.toLowerCase() === "details",
			isActive, item, link;

		$panels.attr( "tabindex", "-1" );

		for ( ; tabCounter !== -1; tabCounter -= 1 ) {
			item = panels[ tabCounter ];
			isActive = item.className.indexOf( "in" ) !== -1;

			if ( !isDetails || !isSmallView ) {
				item.setAttribute( "aria-hidden", isActive ? "false" : "true" );
				item.setAttribute( "aria-expanded", isActive ? "true" : "false" );
			}
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
			link.setAttribute( "aria-controls", link.getAttribute( "href" ).substring( 1 ) );
		}
		$tabList.attr( "aria-live", "off" );
	},

	updateNodes = function( $panels, $controls, $next, $control ) {
		$panels
			.filter( ".in" )
				.removeClass( "in" )
				.addClass( "out" )
				.attr({
					"aria-hidden": "true",
					"aria-expanded": "false"
				});

		$next
			.removeClass( "out" )
			.addClass( "in" )
			.attr({
				"aria-hidden": "false",
				"aria-expanded": "true"
			});

		$controls
			.find( ".active" )
				.removeClass( "active" )
				.children( "a" )
					.attr({
						"aria-selected": "false",
						tabindex: "-1"
					});

		$control
			.attr({
				"aria-selected": "true",
				tabindex: "0"
			})
			.parent()
				.addClass( "active" );

		// Update sessionStorage with the current active panel
		try {
			sessionStorage.setItem(
				$next.parent().attr( "id" ) + activePanel,
				$next.attr( "id" )
			);
		} catch ( error ) {
		}
	},

	/*
	 * @method onPick
	 * @param {jQuery DOM element} $sldr The plugin element
	 * @param {jQuery DOM element} $elm The selected link from the tablist
	 */
	onPick = function( $sldr, $elm ) {
		var $panels = $sldr.data( "panels" ),
			$controls =  $sldr.data( "tablist" ),
			$next = $panels.filter( "#" + $elm.attr( "aria-controls" ) );

		updateNodes( $panels, $controls, $next, $elm );
	},

	/*
	 * @method onShift
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param (jQuery event} event Current event
	 */
	onShift = function( $elm, event ) {
		var $panels = $elm.data( "panels" ),
			$controls = $elm.data( "tablist" ),
			len = $panels.length,
			current = $elm.find( ".in" ).prevAll( "[role=tabpanel]" ).length,
			shiftto = event.shiftto ? event.shiftto : 1,
			next = current > len ? 0 : current + shiftto,
			$next = $panels.eq( ( next > len - 1 ) ? 0 : ( next < 0 ) ? len - 1 : next );

		updateNodes(
			$panels, $controls, $next,
			$controls.find( "[href=#" + $next.attr( "id" ) + "]" )
		);
	},

	/*
	 * @method onShift
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {integer} shifto The item to shift to
	 */
	onCycle = function( $elm, shifto ) {
		$elm.trigger({
			type: shiftEvent,
			shiftto: shifto
		});
	},

	onHashChange = function( event ) {
		if ( initialized ) {
			var hash = window.location.hash,
				$hashTarget = $( hash );

			if ( $hashTarget.length !== 0 ) {
				event.preventDefault();
				if ( isSmallView && $hashTarget[ 0 ].nodeName.toLowerCase() === "details" ) {
					$hashTarget
						.children( "summary" )
							.trigger( "click" );
				} else {
					$hashTarget
						.parent()
							.find( "> ul [href$='" + hash + "']" )
								.trigger( "click" );
				}
			}
		}
	},

	onResize = function() {
		var oldIsSmallView = isSmallView,
			$elm, $details, $tablist, $openDetails, $nonOpenDetails, $active;

		isSmallView = document.documentElement.className.indexOf( smallViewPattern ) !== -1;

		if ( initialized && isSmallView !== oldIsSmallView ) {
			$elm = $( selector );
			$details = $elm.children( "details" );
			$tablist = $elm.children( "ul" );

			// Disable equal heights for small view and enable for large view
			if ( $elm.attr( "class" ).indexOf( equalHeightClass ) !== -1 ) {
				$elm.toggleClass( equalHeightClass + " " + equalHeightOffClass );
			}

			if ( isSmallView ) {

				// Switch to small view
				$active = $tablist.find( ".active a" );
				$openDetails = $details.filter( "#" + $active.attr( "href" ).substring( 1 ) );
				$nonOpenDetails = $details
					.removeAttr( "role" )
					.removeClass( "fade out in" )
					.not( $openDetails )
						.removeAttr( "open" );
				if ( !Modernizr.details ) {
					$nonOpenDetails
						.attr({
							"aria-expanded": "false",
							"aria-hidden": "true"
						});
					$openDetails.attr({
						"aria-expanded": "true",
						"aria-hidden": "false"
					});
				}
			} else {

				// Switch to large view
				$openDetails = $details.filter( "[open]" );
				if ( $openDetails.length === 0 ) {
					$openDetails = $details.eq( 0 );
				}

				$details
					.attr({
						role: "tabpanel",
						open: "open"
					})
					.not( $openDetails )
						.addClass( "fade out" );

				$openDetails
					.addClass( "fade in" )
					.parent()
						.find( "> ul [href$='" + $openDetails.attr( "id" ) + "']" )
							.trigger( "click" );
			}

			$tablist.attr( "aria-hidden", isSmallView );
		}
	};

 // Bind the init event of the plugin
 $document.on( "timerpoke.wb " + initEvent + " " + shiftEvent, selector, function( event ) {
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
	case "wb-init":
		init( $elm );
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
  * Tabs, next, previous and play/pause
  */
 $document.on( activateEvent, controls, function( event ) {
	var which = event.which,
		elm = event.currentTarget,
		className = elm.className,
		rotStopText = i18nText.rotStop,
		playText = i18nText.play,
		$elm, text, inv, $sldr, $plypause;

	// Ignore middle and right mouse buttons
	if ( !which || which === 1 || which === 13 || which === 32 || ( which > 36 && which < 41 ) ) {
		event.preventDefault();
		$elm = $( elm );
		$sldr = $elm
			.parents( selector )
			.attr( "data-ctime", 0 );

		// Stop the slider from playing unless it is already stopped and the play button is activated
		if ( $sldr.hasClass( "playing" ) || ( which < 37 && className.indexOf( "plypause" ) !== -1 ) ) {
			$plypause = $sldr.find( "a.plypause" );
			$plypause.find( ".glyphicon" ).toggleClass( "glyphicon-play glyphicon-pause" );
			$sldr.toggleClass( "playing" );

			text = $plypause[ 0 ].getElementsByTagName( "i" )[ 0 ];
			text.innerHTML = text.innerHTML === playText ? i18nText.pause : playText;

			inv = $plypause.find( ".wb-inv" )[ 0 ];
			inv.innerHTML = inv.innerHTML === rotStopText ? i18nText.rotStart : rotStopText;
		}

		if ( which > 36 ) {
			onCycle( $elm, which < 39 ? -1 : 1 );
			$sldr.find( ".active a" ).trigger( setFocusEvent );
		} else {
			if ( elm.getAttribute( "role" ) === "tab" ) {
				onPick( $sldr, $elm );
				if ( which > 1 ) {
					$sldr.find( $elm.attr( "href" ) ).trigger( "setfocus.wb" );
				}
			} else if ( !$sldr.hasClass( "playing" ) ) {
				onCycle( $elm, className.indexOf( "prv" ) !== -1 ? -1 : 1 );
			}
		}
		return false;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

$document.on( "keydown", selector + " [role=tabpanel]", function( event ) {
	var currentTarget = event.currentTarget;

	// Ctrl + Up arrow
	if ( event.ctrlKey && event.which === 38 ) {

		// Move focus to the summary element
		$( currentTarget )
			.parents( selector )
				.find( "[href$='#" + currentTarget.id + "']" )
					.trigger( "setfocus.wb" );
	}
});

// These events only fire at the document level
$document.on( wb.resizeEvents, onResize );

// This event only fires on the window
$window.on( "hashchange", onHashChange );

$document.on( activateEvent, selector + " > details > summary", function( event ) {
	var which = event.which,
		details = event.currentTarget.parentNode;

	if ( !which || which === 1 || which === 13 || which === 32 ) {

		// Update sessionStorage with the current active panel
		try {
			sessionStorage.setItem(
				details.parentNode.id + activePanel,
				details.id
			);
		} catch ( error ) {
		}
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
