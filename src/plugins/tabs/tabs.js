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
var componentName = "wb-tabs",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	shiftEvent = "wb-shift" + selector,
	selectEvent = "wb-select" + selector,
	updatedEvent = "wb-updated" + selector,
	setFocusEvent = "setfocus.wb",
	controls = selector + " [role=tablist] a, " + selector + " [role=tablist] .tab-count",
	uniqueCount = 0,
	initialized = false,
	equalHeightClass = "wb-eqht",
	equalHeightOffClass = equalHeightClass + "-off",
	activePanel = "-activePanel",
	activateEvent = "click keydown",
	ignoreHashChange = false,
	pagePath = wb.pageUrlParts.pathname + "#",
	$document = wb.doc,
	$window = wb.win,
	i18n, i18nText,

	// Includes "smallview", "xsmallview" and "xxsmallview"
	smallViewPattern = "smallview",
	isSmallView, oldIsSmallView,

	defaults = {
		excludePlay: false,
		interval: 6,
		updateHash: false
	},

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			hashFocus = false,
			isCarousel = true,
			open = "open",
			$panels, $tablist, activeId, $openPanel, $elm, elmId,
			settings, $panel, i, len, tablist, isOpen,
			newId, positionY, groupClass, $tabPanels;

		if ( elm ) {
			$elm = $( elm );

			// For backwards compatibility. Should be removed in WET v4.1
			if ( $elm.children( ".tabpanels" ).length === 0 ) {
				$elm.children( "[role=tabpanel], details" ).wrapAll( "<div class='tabpanels'/>" );
			}

			$panels = $elm.find( "> .tabpanels > [role=tabpanel], > .tabpanels > details" );
			$tablist = $elm.children( "[role=tablist]" );
			isCarousel = $tablist.length !== 0;
			activeId = wb.pageUrlParts.hash.substring( 1 );
			$openPanel = activeId.length !== 0 ? $panels.filter( "#" + activeId ) : undefined;
			elmId = elm.id;
			settings = $.extend(
				true,
				{},
				defaults,
				{
					interval: $elm.hasClass( "slow" ) ?
								9 : $elm.hasClass( "fast" ) ?
									3 : defaults.interval,
					excludePlay: $elm.hasClass( "exclude-play" ),
					updateHash: $elm.hasClass( "update-hash" ),
					playing: $elm.hasClass( "playing" )
				},
				window[ componentName ],
				wb.getData( $elm, componentName )
			);

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
					activeId = sessionStorage.getItem( pagePath + elmId + activePanel );
					if ( activeId ) {
						$openPanel = $panels.filter( "#" + activeId );
					}

				// If the panel was set by URL hash, then store in sessionStorage
				} else {
					hashFocus = true;
					try {
						sessionStorage.setItem( pagePath + elmId + activePanel, activeId );
					} catch ( error ) {
					}
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
					play: i18n( "tab-play" ),
					rotStart: i18n( "tab-rot" ).on,
					rotStop: i18n( "tab-rot" ).off,
					space: i18n( "space" ),
					hyphen: i18n( "hyphen" ),
					pause: i18n( "pause" ),
					tabCount: i18n( "lb-curr")
				};
			}

			// Build the tablist and enhance the panels as needed for details/summary
			if ( !isCarousel ) {
				$elm.addClass( "tabs-acc" );
				groupClass = elmId + "-grp";
				$tabPanels = $elm.children( ".tabpanels" );
				$panels = $tabPanels.children( "details" );
				len = $panels.length;

				$tabPanels.detach();

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
				tablist = "<ul role='tablist' aria-live='off' class='generated'>";

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
							$panel.toggleClass( "open", isOpen );
						}
					} else {
						$panel.attr({
							role: "tabpanel",
							open: open
						});
						$panel.addClass( ( Modernizr.details ? "" :  open + " " ) +
							"fade " + ( isOpen ? "in" : "out wb-inv" ) );
					}

					tablist += "<li" + ( isOpen ? " class='active'" : "" ) +
						"><a id='" + newId + "-lnk' href='#" + newId + "'>" +
						$panel.children( "summary" ).html() + "</a></li>";
				}

				$tablist = $( tablist + "</ul>" );
				$tabPanels.find( "> details > summary" )
					.addClass( "wb-toggle tgl-tab" )
					.attr( "data-toggle", "{\"parent\": \"#" + elmId +
						"\", \"group\": \"." + groupClass + "\"}" );

				$elm
					.prepend( $tablist )
					.append( $tabPanels )
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

			if ( isCarousel ) {

				// Returns true if the tabs should be rotating automatically
				if ( createControls( $tablist, settings ) ) {

					// Register this specific tabs instance for timerpoke.wb events
					wb.add( "#" + elmId + selector );
				}
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
				"wb-tabs": {
					panels: $panels,
					tablist: $tablist,
					settings: settings,
					ctime: 0
				}
			});

			initialized = true;
			onResize( $elm );

			// Update the URL hash if needed
			if ( settings.updateHash ) {
				updateHash( $openPanel[ 0 ] );
			}

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	},

	/**
	 * @method onTimerPoke
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onTimerPoke = function( $elm ) {
		var data = $elm.data( componentName ),
			delayCurrent = parseFloat( data.ctime ) + 0.5;

		// Check if we need to rotate panels
		if ( parseFloat( data.settings.interval ) <= delayCurrent ) {
			$elm.trigger( shiftEvent );
			delayCurrent = 0;
		}

		data.ctime = delayCurrent;
		$elm.data( componentName, data );
	},

	/**
	 * @method createControls
	 * @param {jQuery DOM element} $tablist The plugin element
	 * @param {object} settings Settings for the tabs instance
	 * @returns {boolean} Whether or not the tabs should be rotating initially
	 */
	createControls = function( $tablist, settings ) {
		var prevText = i18nText.prev,
			nextText = i18nText.next,
			spaceText = i18nText.space,
			excludePlay = settings.excludePlay,
			isPlaying = !excludePlay && settings.playing,
			state = isPlaying ? i18nText.pause : i18nText.play,
			hidden = isPlaying ? i18nText.rotStop : i18nText.rotStart,
			glyphiconStart = "<span class='glyphicon glyphicon-",
			wbInvStart = "<span class='wb-inv'>",
			tabsToggleStart = "<li class='control ",
			btnMiddle = "' href='javascript:;' role='button' title='",
			btnEnd = "</span></a></li> ",
			iconState = glyphiconStart + ( isPlaying ? "pause" : "play" ) + "'></span>",
			$tabs = $tablist.find( "[role=tab]" ),
			currentIndex = $tabs.index( $tabs.filter( "[aria-selected=true]" ) ) + 1,
			i18nTabCount = i18nText.tabCount,
			firstReplaceIndex = i18nTabCount.indexOf( "%" ),
			lastReplaceIndex = i18nTabCount.lastIndexOf( "%" ) + 1,
			prevControl = tabsToggleStart + "prv'><a class='prv" + btnMiddle +
				prevText + "'>" + glyphiconStart + "chevron-left'></span>" +
				wbInvStart + prevText + btnEnd,
			tabCount = tabsToggleStart + " tab-count' tabindex='0'><div>" +
				i18nTabCount.substring( 0, firstReplaceIndex ) +
				"<div class='curr-count'>" +
				i18nTabCount.substring( firstReplaceIndex, lastReplaceIndex )
					.replace( "%curr%", "<span class='curr-index'>" + currentIndex + "</span>" )
					.replace( "%total%", $tabs.length ) +
				"</div>" + i18nTabCount.substring( lastReplaceIndex ) +
				"</div></li>",
			nextControl = tabsToggleStart + "nxt'><a class='nxt" + btnMiddle +
				nextText + "'>" + glyphiconStart + "chevron-right'></span>" +
				wbInvStart + nextText + btnEnd,
			playControl =  tabsToggleStart + "plypause'><a class='plypause" +
				btnMiddle + state + "'>" + iconState + " <span>" + state +
				"</span>" + wbInvStart + spaceText + i18nText.hyphen + spaceText +
				hidden + btnEnd;

		$tablist.prepend( prevControl + tabCount + nextControl );
		if ( !excludePlay ) {
			$tablist.append( playControl );
		}

		return isPlaying;
	},

	/**
	 * @method drizzleAria
	 * @param {jQuery DOM element} $panels Tabpanel groupings
	 * @param {jQuery DOM element} $tablist Pointers to the groupings
	 */
	drizzleAria = function( $panels, $tabList ) {

		// Let's process the elements for aria
		var panels = $panels.get(),
			tabCounter = panels.length - 1,
			listItems = $tabList.children().get(),
			listCounter = listItems.length - 1,
			isDetails = $panels[ 0 ].nodeName.toLowerCase() === "details",
			isActive, item, link, panelId;

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
			panelId = link.getAttribute( "href" ).substring( 1 );

			link.tabIndex = isActive ? "0" : "-1";
			link.setAttribute( "role", "tab" );
			link.setAttribute( "aria-selected", isActive ? "true" : "false" );
			link.setAttribute( "aria-controls", panelId );
			link.id = panelId + "-lnk";
		}
		$tabList.attr( "aria-live", "off" );
	},

	/**
	 * @method updateHash
	 * @param {DOM element} elm Tabpanel to be referenced in the URL hash
	 */
	updateHash = function( elm ) {
		var elmId = elm.id;

		ignoreHashChange = true;
		elm.id += "-off";
		window.location.hash = elmId;
		elm.id = elmId;
		ignoreHashChange = false;
	},

	updateNodes = function( $panels, $controls, $next, $control ) {
		var $tabs = $controls.find( "[role=tab]" ),
			newIndex = $tabs.index( $control ) + 1,
			$currPanel = $panels.filter( ".in" ),
			$container = $next.closest( selector ),
			mPlayers = $currPanel.find( ".wb-mltmd-inited" ).get(),
			mPlayersLen = mPlayers.length,
			mPlayer, i, j, last;

		// Handle the direction of the slide transitions
		if ( $currPanel[ 0 ].className.indexOf( "slide" ) !== -1 ) {
			i = $panels.index( $currPanel );
			j = $panels.index( $next );
			last = $panels.length - 1;

			$panels.toggleClass(
				"reverse",
				( i > j && ( i !== last || j !== 0 ) ) || ( i === 0 && j === last )
			);
		}

		$currPanel
			.removeClass( "in" )
			.addClass( "out" )
			.attr({
				"aria-hidden": "true",
				"aria-expanded": "false"
			});

		// Pause all multimedia players in the current panel
		for ( i = 0; i !== mPlayersLen; i += 1 ) {
			mPlayer = mPlayers[ i ];
			if ( mPlayer.player ) {
				mPlayer.player( "pause" );
			}
		}

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

		// Update the Item x of n
		$controls
			.find( ".curr-index" )
				.html( newIndex );

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
				pagePath + $container.attr( "id" ) + activePanel,
				$next.attr( "id" )
			);
		} catch ( error ) {
		}

		// Update the URL hash if needed
		if ( $container.data( componentName ).settings.updateHash ) {
			updateHash( $next[ 0 ] );
		}

		// Identify that the tabbed interface/carousel was updated
		$container.trigger( updatedEvent, [ $next ] );
	},

	/**
	 * @method onPick
	 * @param {jQuery DOM element} $sldr The plugin element
	 * @param {jQuery DOM element} $elm The selected link from the tablist
	 */
	onPick = function( $sldr, $elm ) {
		var data = $sldr.data( componentName ),
			$panels = data.panels,
			$controls = data.tablist,
			$next = $panels.filter( "#" + $elm.attr( "aria-controls" ) );

		updateNodes( $panels, $controls, $next, $elm );
	},

	/**
	 * @method onShift
	 * @param (jQuery event} event Current event
	 * @param {jQuery DOM element} $elm The plugin element
	 */
	onShift = function( event, $elm ) {
		var data = $elm.data( componentName ),
			$panels = data.panels,
			len = $panels.length,
			current = $elm.find( "> .tabpanels > .in" ).prevAll( "[role=tabpanel]" ).length,
			next = current > len ? 0 : current + ( event.shiftto ? event.shiftto : 1 );

		onSelect( $panels[ ( next > len - 1 ) ? 0 : ( next < 0 ) ? len - 1 : next ].id );
	},

	/**
	 * @method onSelect
	 * @param (string) id Id attribute of the panel
	 */
	onSelect = function( id ) {
		var panelSelector = "#" + id,
			$panel = $( panelSelector );

		if ( isSmallView && $panel[ 0 ].nodeName.toLowerCase() === "details" ) {
			$panel.children( "summary" ).trigger( $panel.attr( "open" ) ? setFocusEvent : "click" );
		} else {
			$( panelSelector + "-lnk" )
				.trigger( "click" )
				.trigger( setFocusEvent );
		}
	},

	/**
	 * @method onCycle
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {integer} shifto The item to shift to
	 */
	onCycle = function( $elm, shifto ) {
		$elm.trigger({
			type: shiftEvent,
			shiftto: shifto
		});
	},

	/**
	 * @method onHashChange
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	onHashChange = function( event ) {
		if ( initialized && !ignoreHashChange ) {
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
							.parent()
								.find( "> ul [href$='" + hash + "']" )
									.trigger( "click" );
				}
			}
		}
	},

	/**
	 * @method onResize
	 * @param {jQuery Object} $currentElm Element being initialized (only during initialization process).
	 */
	onResize = function( $currentElm ) {
		var $elms, $elm, $tabPanels, $details, $tablist, $openDetails, openDetailsId,
			$nonOpenDetails, $active, $summary, i, len;

		if ( initialized ) {
			isSmallView = document.documentElement.className.indexOf( smallViewPattern ) !== -1;

			if ( isSmallView !== oldIsSmallView ) {
				$elms = $currentElm.length ? $currentElm : $( selector );
				len = $elms.length;

				for ( i = 0; i !== len; i += 1 ) {
					$elm = $elms.eq( i );
					$tabPanels = $elm.children( ".tabpanels" );
					$details = $tabPanels.children( "details" );

					if ( $details.length !== 0 ) {
						$tabPanels.detach();
						$summary = $details.children( "summary" );
						$tablist = $elm.children( "ul" );

						if ( isSmallView ) {

							// Switch to small view
							$active = $tablist.find( ".active a" );
							$details
								.removeAttr( "role aria-expanded aria-hidden" )
								.removeClass( "fade out in" );
							$openDetails = $details
												.filter( "#" + $active.attr( "href" ).substring( 1 ) )
													.attr( "open", "open" )
													.addClass( "open" );
							$nonOpenDetails = $details.not( $openDetails )
														.removeAttr( "open" )
														.removeClass( "open" );
						} else if ( oldIsSmallView ) {

							// Switch to large view
							$openDetails = $details.filter( "[open]" );
							openDetailsId = $openDetails.attr( "id" );

							$openDetails = ( $openDetails.length === 0 ? $details : $openDetails ).eq( 0 );

							$details
								.attr({
									role: "tabpanel",
									open: "open"
								})
								.not( $openDetails )
									.addClass( "fade out wb-inv" )
									.attr({
										"aria-hidden": "true",
										"aria-expanded": "false"
									});

							$openDetails
								.addClass( "fade in" )
								.attr({
										"aria-hidden": "false",
										"aria-expanded": "true"
									});
						}

						// Enable equal heights for large view or disable for small view
						if ( isSmallView !== $elm.hasClass( equalHeightOffClass ) ) {
							$elm.toggleClass( equalHeightClass + " " + equalHeightOffClass );
						}

						$summary.attr( "aria-hidden", !isSmallView );
						$tablist.attr( "aria-hidden", isSmallView );

						$elm.append( $tabPanels );

						if ( oldIsSmallView ) {
							$elm.find( "> ul [href$='" + openDetailsId + "']" ).trigger( "click" );
						}
					}
				}

				// Remove wb-inv from regular tabs that were used to prevent FOUC (after 300ms delay)
				setTimeout(function() {
					$( selector + " .tabpanels > details.wb-inv" ).removeClass( "wb-inv" );
				}, 300 );
			}
			oldIsSmallView = isSmallView;
		}
	};

 // Bind the init event of the plugin
 $document.on( "timerpoke.wb " + initEvent + " " + shiftEvent + " " + selectEvent, selector, function( event ) {
	var eventTarget = event.target,
		eventCurrentTarget = event.currentTarget,
		$elm;

		// Filter out any events triggered by descendants
		if ( eventCurrentTarget === eventTarget ) {
			switch ( event.type ) {
			case "timerpoke":
				$elm = $( eventTarget );
				if ( !$elm.hasClass( componentName + "-inited" ) ) {
					init( event );
				} else if ( $elm.hasClass( "playing" ) ) {
					onTimerPoke( $elm );
				}
				break;

			/*
			 * Init
			 */
			case "wb-init":
				init( event );
				break;

			/*
			 * Change tab panels by a delta
			 */
			case "wb-shift":
				onShift( event, $( eventTarget ) );
				break;

			/*
			 * Select a specific tab panel
			 */
			case "wb-select":
				onSelect( event.id );
				break;
			}
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
		$elm, text, inv, $sldr, sldrId, $plypause, data, isPlaying, isPlayPause;

	// Ignore middle and right mouse buttons and modified keys
	if ( !( event.ctrlKey || event.altKey || event.metaKey ) &&
			( !which || which === 1 || which === 13 || which === 32 ||
			( which > 36 && which < 41 ) ) ) {

		// Stop propagation of the activate event
		event.preventDefault();
		if ( event.stopPropagation ) {
			event.stopImmediatePropagation();
		} else {
			event.cancelBubble = true;
		}

		$elm = $( elm );
		$sldr = $elm.closest( selector );
		sldrId = $sldr[ 0 ].id;
		isPlaying = $sldr.hasClass( "playing" ),
		isPlayPause = className.indexOf( "plypause" ) !== -1;

		// Reset ctime to 0
		data = $sldr.data( componentName );
		data.ctime = 0;
		$sldr.data( componentName, data );

		// Stop the slider from playing unless it is already stopped
		// and the play button is activated
		if ( isPlaying || ( which < 37 && isPlayPause ) ) {
			if ( isPlaying ) {
				wb.remove( "#" + sldrId + selector );
			} else {
				wb.add( "#" + sldrId + selector );
			}

			$plypause = $sldr.find( "a.plypause" );
			$plypause
				.find( ".glyphicon" )
					.toggleClass( "glyphicon-play glyphicon-pause" );

			$sldr.toggleClass( "playing" );
			isPlaying = !isPlaying;

			text = $plypause[ 0 ].getElementsByTagName( "span" )[ 1 ];
			text.innerHTML = text.innerHTML === playText ?
				i18nText.pause :
				playText;

			inv = $plypause.find( ".wb-inv" )[ 0 ];
			inv.innerHTML = inv.innerHTML === rotStopText ?
				i18nText.rotStart :
				rotStopText;
		}

		if ( which > 36 ) {
			onCycle( $sldr, which < 39 ? -1 : 1 );
			$sldr.find( "> [role=tablist] .active a" ).trigger( setFocusEvent );
		} else {
			if ( elm.getAttribute( "role" ) === "tab" ) {
				onPick( $sldr, $elm );
				if ( which > 1 ) {
					$sldr.find( elm.getAttribute( "href" ) )
						.trigger( setFocusEvent );
				}
			} else if ( !isPlaying && !isPlayPause ) {
				onCycle( $sldr, className.indexOf( "prv" ) !== -1 ? -1 : 1 );
			}
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Pause on escape
$document.on( "keydown", selector + ", " + selector + " [role=tabpanel]", function( event ) {

	// Escape key
	if ( event.which === 27 ) {
		var $sldr = $( event.target ).closest( selector );

		event.preventDefault();

		if ( $sldr.hasClass( "playing" ) ) {
			$sldr.find( ".plypause" ).trigger( "click" );
		}
	}
});

$document.on( "click keydown", selector + " [role=tabpanel]", function( event ) {
	var currentTarget = event.currentTarget,
		which = event.which,
		$container;

	// Stop propagation of the click/keydown event
	if ( event.stopPropagation ) {
		event.stopImmediatePropagation();
	} else {
		event.cancelBubble = true;
	}

	if ( event.target === "click" ) {

		// Ignore middle and right mouse buttons
		if ( !which || which === 1 ) {
			$container = $( event.currentTarget ).closest( selector );

			// Stop the carousel if there is a click within a panel
			if ( $container.hasClass( "playing" ) ) {
				$container.find( ".plypause" ).trigger( "click" );
			}
		}
	} else {

		// Ctrl + Up arrow
		if ( event.ctrlKey && event.which === 38 ) {

			// Move focus to the summary element
			$( currentTarget )
				.closest( selector )
					.find( "[href$='#" + currentTarget.id + "']" )
						.trigger( setFocusEvent );
		}
	}
});

// Handling for links to tabs from within a panel
$document.on( "click", selector + " [role=tabpanel] a", function( event ) {
	var currentTarget = event.currentTarget,
		href = currentTarget.getAttribute( "href" ),
		which = event.which,
		$tabpanels, $panel, $summary;

	// Ignore middle and right mouse buttons
	if ( ( !which || which === 1 ) && href.charAt( 0 ) === "#" ) {
		$tabpanels = $( currentTarget ).closest( ".tabpanels" );
		$panel = $tabpanels.children( href );
		if ( $panel.length !== 0 ) {
			event.preventDefault();
			$summary = $panel.children( "summary" );
			if ( $summary.length !== 0 && $summary.attr( "aria-hidden" ) !== "true" ) {
				$summary.trigger( "click" );
			} else {
				$tabpanels.find( href + "-lnk" ).trigger( "click" );
			}
		}
	}
});

// These events only fire at the document level
$document.on( wb.resizeEvents, onResize );

// This event only fires on the window
$window.on( "hashchange", onHashChange );

$document.on( activateEvent, selector + " > .tabpanels > details > summary", function( event ) {
	var which = event.which,
		details = event.currentTarget.parentNode,
		$details, $container;

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) &&
		( !which || which === 1 || which === 13 || which === 32 ) ) {

		$details = $( details );

		// Update sessionStorage with the current active panel
		try {
			sessionStorage.setItem(
				pagePath + $details.closest( selector ).attr( "id" ) + activePanel,
				details.id
			);
		} catch ( error ) {
		}

		$container = $details.closest( selector );

		// Update the URL hash if needed
		if ( $container.data( componentName ).settings.updateHash ) {
			updateHash( details );
		}

		// Identify that the tabbed interface was updated
		$container.trigger( updatedEvent, [ $details ] );
	}
});

// Change the panel based upon an external link click
$document.on( "click", ".wb-tabs-ext", function( event ) {
	var which = event.which;

	// Ignore middle and right mouse buttons
	if ( !which || which === 1 ) {
		event.preventDefault();
		onSelect( event.currentTarget.getAttribute( "href" ).substring( 1 ) );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );
