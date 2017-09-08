/**
 * @title WET-BOEW Tabbed interface
 * @overview Dynamically stacks multiple sections of content, transforming them into a tabbed interface.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
( function( $, window, wb ) {
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
	controls = selector + " ul[role=tablist] a, " + selector + " ul[role=tablist] .tab-count",
	initialized = false,
	tabsAccordionClass = "tabs-acc",
	nestedTglPanelSelector = "> .tabpanels > details > .tgl-panel",
	activePanel = "-activePanel",
	activateEvent = "click keydown",
	pagePath = wb.pageUrlParts.pathname + "#",
	$document = wb.doc,
	i18n, i18nText,

	// Includes "smallview", "xsmallview" and "xxsmallview"
	smallViewPattern = "smallview",
	isSmallView, oldIsSmallView,

	defaults = {
		excludePlay: false,
		interval: 6,
		updateHash: false,
		ignoreSession: false
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
			isCarousel = true,
			open = "open",
			hashTargetLen = 0,
			$panels, $tablist, activeId, $openPanel, $elm, elmId, $hashTarget,
			settings, $panel, i, len, tablist, isOpen, hashFocus,
			newId, positionY, groupClass, $tabPanels, openByHash;

		if ( elm ) {
			$elm = $( elm );

			// For backwards compatibility. Should be removed in WET v4.1
			if ( $elm.children( ".tabpanels" ).length === 0 ) {
				$elm.children( "[role=tabpanel], details" ).wrapAll( "<div class='tabpanels'/>" );
			}

			$panels = $elm.find( "> .tabpanels > [role=tabpanel], > .tabpanels > details" );
			$tablist = $elm.children( "[role=tablist]" );
			isCarousel = $tablist.length !== 0;

			// If a carousel contains only 1 panel, remove its controls, visually-hide its thumbnails and prevent it from attempting to play
			if ( isCarousel && $panels.length === 1 ) {

				$elm.removeClass( "show-thumbs playing" );
				$elm.addClass( "exclude-controls" );
			}

			activeId = wb.jqEscape( wb.pageUrlParts.hash.substring( 1 ) );
			hashFocus = activeId.length !== 0;
			$openPanel = hashFocus ? $panels.filter( "#" + activeId ) : undefined;
			openByHash = $openPanel && $openPanel.length !== 0;
			elmId = elm.id;

			settings = $.extend(
				true,
				{},
				defaults,
				{
					interval: $elm.hasClass( "slow" ) ?
								9 : $elm.hasClass( "fast" ) ?
									3 : defaults.interval,
					excludeControls: $elm.hasClass( "exclude-controls" ),
					excludePlay: $elm.hasClass( "exclude-play" ),
					updateHash: $elm.hasClass( "update-hash" ),
					playing: $elm.hasClass( "playing" ),
					ignoreSession: $elm.hasClass( "ignore-session" )
				},
				window[ componentName ],
				wb.getData( $elm, componentName )
			);

			try {

				// If the panel was not set by URL hash
				if ( !openByHash ) {
					if ( hashFocus ) {
						$hashTarget = $panels.find( "#" + activeId );
						hashTargetLen = $hashTarget.length;
					}

					// If the anchor target is within a panel, then open that panel
					if ( hashTargetLen !== 0 ) {
						activeId = $hashTarget.closest( "[role=tabpanel]" ).attr( "id" );

					// Attempt to retrieve active panel from sessionStorage
					} else {
						if ( !settings.ignoreSession ) {
							activeId = sessionStorage.getItem( pagePath + elmId + activePanel );
						}
					}

					if ( activeId ) {
						$openPanel = $panels.filter( "#" + activeId );
					}

				// If the panel was set by URL hash, then store in sessionStorage
				} else {
					if ( !settings.ignoreSession ) {
						try {
							sessionStorage.setItem( pagePath + elmId + activePanel, activeId );
						} catch ( error ) {
						}
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
					tabCount: i18n( "lb-curr" )
				};
			}

			// Build the tablist and enhance the panels as needed for details/summary
			if ( !isCarousel ) {
				$elm.addClass( tabsAccordionClass );
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
						newId = wb.getId();
						$panel.attr( "id", newId );
					}
					isOpen = !!$panel.attr( open );

					if ( isSmallView ) {
						if ( !Modernizr.details ) {
							$panel.toggleClass( "open", isOpen );
						}
					} else {
						$panel.attr( {
							role: "tabpanel",
							open: open
						} );
						$panel.addClass( ( Modernizr.details ? "" :  open + " " ) +
							"fade " + ( isOpen ? "in" : "noheight out wb-inv" ) );
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
					.addClass( "out noheight" )
					.removeClass( "in" );
				$openPanel
					.addClass( "in" )
					.removeClass( "out noheight" );
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
			// not above the top of the viewport (if the panel was the target),
			// or the anchor is not above the top of viewport (if the anchor was
			// the target)
			if ( hashFocus ) {

				// Need a slight delay to allow for the reflow
				setTimeout( function() {
					if ( openByHash ) {
						positionY = $tablist.offset().top;
					} else if ( hashTargetLen !== 0 ) {
						positionY = $hashTarget.offset().top;
					} else {
						positionY = -1;
					}

					if ( positionY !== -1 && positionY < document.body.scrollTop ) {
						document.body.scrollTop = positionY;
					}
				}, 1 );
			}

			$elm.data( {
				"wb-tabs": {
					panels: $panels,
					tablist: $tablist,
					settings: settings,
					ctime: 0
				}
			} );

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
			excludeControls = settings.excludeControls,
			excludePlay = settings.excludePlay,
			isPlaying = !excludeControls && !excludePlay && settings.playing,
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

		if ( !excludeControls ) {
			$tablist.prepend( prevControl + tabCount + nextControl );
		}

		if ( !excludeControls && !excludePlay ) {
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
			isActive, item, link, panelId, activeFound;

		$panels.attr( "tabindex", "-1" );

		for ( ; tabCounter !== -1; tabCounter -= 1 ) {
			item = panels[ tabCounter ];
			isActive = item.className.indexOf( "out" ) === -1;

			if ( !isDetails || !isSmallView ) {
				item.setAttribute( "aria-hidden", isActive ? "false" : "true" );
				item.setAttribute( "aria-expanded", isActive ? "true" : "false" );
			}
			item.setAttribute( "aria-labelledby", item.id + "-lnk" );
		}

		activeFound = false;
		for ( ; listCounter !== -1; listCounter -= 1 ) {
			item = listItems[ listCounter ];
			item.setAttribute( "role", "presentation" );

			isActive = item.className.indexOf( "active" ) !== -1;
			if ( isActive ) {
				activeFound = true;
			} else if ( listCounter === 0 && !activeFound ) {
				isActive = true;
				item.className += " active";
			}

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

		wb.ignoreHashChange = true;
		elm.id += "-off";
		window.location.hash = elmId;
		elm.id = elmId;
		wb.ignoreHashChange = false;
	},

	updateNodes = function( $panels, $controls, $next, $control ) {
		var $tabs = $controls.find( "[role=tab]" ),
			newIndex = $tabs.index( $control ) + 1,
			$currPanel = $panels.filter( ".in" ),
			$container = $next.closest( selector ),
			tabSettings = $container.data( componentName ).settings,
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
			.addClass( "out noheight" )
			.attr( {
				"aria-hidden": "true",
				"aria-expanded": "false"
			} );

		// Pause all multimedia players in the current panel
		for ( i = 0; i !== mPlayersLen; i += 1 ) {
			mPlayer = mPlayers[ i ];
			if ( mPlayer.player ) {
				mPlayer.player( "pause" );
			}
		}

		$next
			.removeClass( "out noheight" )
			.addClass( "in" )
			.attr( {
				"aria-hidden": "false",
				"aria-expanded": "true"
			} );

		$controls
			.find( ".active" )
				.removeClass( "active" )
				.children( "a" )
					.attr( {
						"aria-selected": "false",
						tabindex: "-1"
					} );

		// Update the Item x of n
		$controls
			.find( ".curr-index" )
				.html( newIndex );

		$control
			.attr( {
				"aria-selected": "true",
				tabindex: "0"
			} )
			.parent()
				.addClass( "active" );

		// Update sessionStorage with the current active panel
		if ( !tabSettings.ignoreSession ) {
			try {
				sessionStorage.setItem(
					pagePath + $container.attr( "id" ) + activePanel,
					$next.attr( "id" )
				);
			} catch ( error ) {
			}
		}

		// Update the URL hash if needed
		if ( tabSettings.updateHash ) {
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
			autoCycle = !event.shiftto,
			next = current > len ? 0 : current + ( autoCycle ? 1 : event.shiftto );

		onSelect( $panels[ ( next > len - 1 ) ? 0 : ( next < 0 ) ? len - 1 : next ].id, autoCycle );
	},

	/**
	 * @method onSelect
	 * @param (string) id Id attribute of the panel
	 * @param (boolean) autoCycle Whether change is caused by an auto cycle
	 */
	onSelect = function( id, autoCycle ) {
		var panelSelector = "#" + id,
			$panel = $( panelSelector ),
			$panelSelectorLink;

		if ( isSmallView && $panel[ 0 ].nodeName.toLowerCase() === "details" ) {
			$panel.children( "summary" ).trigger( $panel.attr( "open" ) ? setFocusEvent : "click" );
		} else {
			$panelSelectorLink = $( panelSelector + "-lnk" );
			$panelSelectorLink.trigger( {
				type: "click",
				which: autoCycle ? undefined : 1
			} );

			// Don't change the focus if change is cause by an auto cycle
			if ( !autoCycle ) {
				$panelSelectorLink.trigger( setFocusEvent );
			}
		}
	},

	/**
	 * @method onCycle
	 * @param {jQuery DOM element} $elm The plugin element
	 * @param {integer} shifto The item to shift to
	 */
	onCycle = function( $elm, shifto ) {
		$elm.trigger( {
			type: shiftEvent,
			shiftto: shifto
		} );
	},

	/**
	 * @method onResize
	 * @param {jQuery Object} $currentElm Element being initialized (only during initialization process).
	 */
	onResize = function( $currentElm ) {
		var $elms, $elm, $tabPanels, $details, $detailsElm, $tablist,
			$openDetails, openDetailsId, activeId, $summary, $panelElm,
			i, len, j, len2, viewChange, isInit, isActive;

		if ( initialized ) {
			isSmallView = document.documentElement.className.indexOf( smallViewPattern ) !== -1;
			viewChange = isSmallView !== oldIsSmallView;
			isInit = $currentElm.length ? true : false;

			if ( viewChange || isInit ) {
				$elms = isInit ? $currentElm : $( selector );
				len = $elms.length;

				for ( i = 0; i !== len; i += 1 ) {
					$elm = $elms.eq( i );
					$tabPanels = $elm.children( ".tabpanels" );
					$details = $tabPanels.children( "details" );
					len2 = $details.length;

					if ( $details.length !== 0 ) {
						$tabPanels.detach();
						$summary = $details.children( "summary" );
						$tablist = $elm.children( "ul" );

						if ( isSmallView ) {

							// Switch to small view
							activeId = $tablist.find( ".active a" ).attr( "href" ).substring( 1 );
							for ( j = 0; j !== len2; j += 1 ) {
								$detailsElm = $details.eq( j );
								$panelElm = $detailsElm.children( ".tgl-panel" );
								isActive = $detailsElm.attr( "id" ) === activeId;

								$detailsElm
									.removeAttr( "role aria-expanded aria-hidden" )
									.removeClass( "fade out noheight in" )
									.toggleClass( "open", isActive );

								$panelElm
									.attr( "role", "tabpanel" )
									.removeAttr( "aria-expanded" )
									.removeAttr( "aria-hidden" );

								if ( isActive ) {
									$detailsElm.attr( "open", "open" );
								} else {
									$detailsElm.removeAttr( "open" );
								}

								if ( !isInit ) {
									$detailsElm
										.children( "summary" )
											.attr( {
												"aria-expanded": isActive,
												"aria-selected": isActive
											} );
								}
							}
						} else if ( oldIsSmallView ) {

							// Switch to large view
							$openDetails = $details.filter( "[open]" );
							openDetailsId = $openDetails.attr( "id" );

							$openDetails = ( $openDetails.length === 0 ? $details : $openDetails ).eq( 0 );

							$details
								.attr( {
									role: "tabpanel",
									open: "open"
								} )
								.not( $openDetails )
									.addClass( "fade out noheight wb-inv" )
									.attr( {
										"aria-hidden": "true",
										"aria-expanded": "false"
									} );

							$details.children( ".tgl-panel" ).removeAttr( "role" );

							$openDetails
								.addClass( "fade in" )
								.attr( {
									"aria-hidden": "false",
									"aria-expanded": "true"
								} );
						}

						$summary.attr( "aria-hidden", !isSmallView );
						$tablist.attr( "aria-hidden", isSmallView );

						$elm.append( $tabPanels );

						// Update the tablist role
						if ( isSmallView && !isInit ) {
							$elm.attr( "role", "tablist" );
						} else if ( oldIsSmallView ) {
							$elm
								.removeAttr( "role" )
								.find( nestedTglPanelSelector ).removeAttr( "role" );

							$elm.find( "> ul [href$='" + openDetailsId + "']" ).trigger( "click" );
						}
					}
				}

				// Need timeout to account for Toggle changes
				if ( isInit && !isSmallView && $elms.hasClass( tabsAccordionClass ) ) {
					setTimeout( function() {
						$elms
							.removeAttr( "role" )
							.find( nestedTglPanelSelector ).removeAttr( "role" );
					}, 1 );
				}
			}

			oldIsSmallView = isSmallView;
		}

		if ( viewChange || isInit ) {

			// Remove wb-inv from regular tabs that were used to prevent FOUC (after 300ms delay)
			setTimeout( function() {
				$( selector + " .tabpanels > details.wb-inv" ).removeClass( "wb-inv" );
			}, 300 );
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
} );

/*
 * Tabs, next, previous and play/pause
 */
$document.on( activateEvent, controls, function( event ) {
	var which = event.which,
		elm = event.currentTarget,
		className = elm.className,
		spaceText = i18nText.space,
		$elm, $sldr, sldrId, plypause, buttonText, data, isPlaying, isPlayPause;

	// No control, alt or meta keys and only left mouse button, enter key,
	// space bar, escape key and arrow keys
	if ( !( event.ctrlKey || event.altKey || event.metaKey ) &&
			( !which || which === 1 || which === 13 || which === 27 ||
			which === 32 || ( which > 36 && which < 41 ) ) ) {

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
		isPlaying = $sldr.hasClass( "playing" );
		isPlayPause = className.indexOf( "plypause" ) !== -1;

		// Reset ctime to 0
		data = $sldr.data( componentName );
		data.ctime = 0;
		$sldr.data( componentName, data );

		// Stop the slider from playing unless it is already stopped
		// and the play button is activated
		if ( ( isPlaying && which ) || ( isPlayPause && !( which > 36 && which < 41 ) ) ) {
			if ( isPlaying ) {
				wb.remove( "#" + sldrId + selector );
			} else {
				wb.add( "#" + sldrId + selector );
			}

			$sldr.toggleClass( "playing" );
			isPlaying = !isPlaying;
			buttonText = isPlaying ? i18nText.pause : i18nText.play;

			plypause = $sldr.find( "a.plypause" )[ 0 ];
			plypause.setAttribute( "title", buttonText );
			plypause.innerHTML = "<span class='glyphicon glyphicon-" +
				( isPlaying ? "pause" : "play" ) + "'></span> " +
				"<span>" + buttonText + "</span><span class='wb-inv'>" +
				spaceText + i18nText.hyphen + spaceText +
				( isPlaying ? i18nText.rotStop : i18nText.rotStart ) + "</span>";
		}

		// Arrow keys
		if ( which > 36 ) {
			onCycle( $sldr, which < 39 ? -1 : 1 );
			$sldr.find( "> [role=tablist] .active a" ).trigger( setFocusEvent );

		// Not the escape key
		} else if ( which !== 27 ) {

			// If the target is a tab
			if ( elm.getAttribute( "role" ) === "tab" ) {

				// Only change the tabpanel if the tab is not currently selected
				if ( elm.getAttribute( "aria-selected" ) !== "true" ) {
					onPick( $sldr, $elm );
				}

				// Put focus on the tab panel if the enter key or space bar are used
				if ( which === 13 || which === 32 ) {
					$sldr.find( elm.getAttribute( "href" ) )
						.trigger( setFocusEvent );
				}

			// If the target is next, previous or tab count
			} else if ( !isPlayPause ) {
				onCycle( $sldr, className.indexOf( "prv" ) !== -1 ? -1 : 1 );
			}
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
} );

$document.on( activateEvent, selector + " [role=tabpanel]", function( event ) {
	var currentTarget = event.currentTarget,
		which = event.which,
		$container;

	// Stop propagation of the click/keydown event
	if ( event.stopPropagation ) {
		event.stopImmediatePropagation();
	} else {
		event.cancelBubble = true;
	}

	// Ctrl + Up arrow
	if ( event.ctrlKey && event.which === 38 ) {

		// Move focus to the tab or summary element
		if ( isSmallView ) {
			$( currentTarget ).prev().trigger( setFocusEvent );
		} else {
			$( currentTarget )
				.closest( selector )
					.find( "[href$='#" + currentTarget.id + "']" )
						.trigger( setFocusEvent );
		}

	// Left mouse button click or escape key
	} else if ( !which || which === 1 || which === 27 ) {
		$container = $( event.currentTarget ).closest( selector );

		// Stop the carousel
		if ( $container.hasClass( "playing" ) ) {
			$container.find( ".plypause" ).trigger( "click" );
		}
	}
} );

// Handling for links to tabs from within a panel
$document.on( "click", selector + " [role=tabpanel] a", function( event ) {
	var currentTarget = event.currentTarget,
		href = currentTarget.getAttribute( "href" ),
		which = event.which,
		$tabpanels, $panel, $summary;

	// Ignore middle and right mouse buttons
	if ( ( !which || which === 1 ) && href.charAt( 0 ) === "#" ) {
		$tabpanels = $( currentTarget ).closest( ".tabpanels" );
		$panel = $tabpanels.children( "#" + wb.jqEscape( href.substring( 1 ) ) );
		if ( $panel.length !== 0 ) {
			event.preventDefault();
			$summary = $panel.children( "summary" );
			if ( $summary.length !== 0 && $summary.attr( "aria-hidden" ) !== "true" ) {
				$summary.trigger( "click" );
			} else {
				$tabpanels.parent().find( href + "-lnk" ).trigger( "click" );
			}
		}
	}
} );

// These events only fire at the document level
$document.on( wb.resizeEvents, onResize );

$document.on( activateEvent, selector + " > .tabpanels > details > summary", function( event ) {
	var which = event.which,
		details = event.currentTarget.parentNode,
		$details, $container, tabSettings;

	if ( !( event.ctrlKey || event.altKey || event.metaKey ) &&
		( !which || which === 1 || which === 13 || which === 32 ) ) {

		$container = $( details.parentNode.parentNode );
		$details = $( details );
		tabSettings = $container.data( componentName ).settings;

		// Update sessionStorage with the current active panel
		if ( !tabSettings.ignoreSession ) {
			try {
				sessionStorage.setItem(
					pagePath + $container.attr( "id" ) + activePanel,
					details.id
				);
			} catch ( error ) {
			}
		}

		// Update the URL hash if needed
		if ( tabSettings.updateHash ) {
			updateHash( details );
		}

		// Identify that the tabbed interface accordion was updated
		// if the panel was not already open
		if ( !$details.attr( "open" ) ) {
			$container.trigger( updatedEvent, [ $details ] );
		}
	}
} );

// Change the panel based upon an external link click
$document.on( "click", ".wb-tabs-ext", function( event ) {
	var which = event.which;

	// Ignore middle and right mouse buttons
	if ( !which || which === 1 ) {
		event.preventDefault();
		onSelect( event.currentTarget.getAttribute( "href" ).substring( 1 ) );
	}
} );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
