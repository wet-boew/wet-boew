/**
 * @title WET-BOEW Share widget
 * @overview Facilitates sharing Web content on social media platforms.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var pluginName = "wb-share",
	selector = "." + pluginName,
	initedClass = pluginName + "-inited",
	initEvent = "wb-init" + selector,
	shareLink = "shr-lnk",
	panelCount = 0,
	$document = wb.doc,
	i18n, i18nText,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 * For example, adding the attribute data-option1="false", will override option1 for that plugin instance.
	 */
	defaults = {
		hdLvl: "h2",

		// Supported types are: "page" and "video"
		type: "page",

		// For custom types
		// custType = " this comment" results in "Share this comment"
		custType: "",

		url: wb.pageUrlParts.href,
		title: document.title || $document.find( "h1:first" ).text(),

		pnlId: "",
		img: "",
		desc: "",

		// For filtering the sites that area displayed and controlling the order
		// they are displayed. Empty array displays all sites in the default order.
		// Otherwise, it displays the sites in the order in the array using the
		// keys used by the sites object.
		filter: [],

		sites: {

			// The definitions of the available bookmarking sites, in URL use
			// '{u}' for the page URL, '{t}' for the page title, {i} for the image, and '{d}' for the description
			bitly: {
				name: "bitly",
				url: "https://bitly.com/a/bitmarklet?u={u}"
			},
			blogger: {
				name: "Blogger",
				url: "http://www.blogger.com/blog_this.pyra?t=&amp;u={u}&amp;n={t}"
			},
			delicious: {
				name: "Delicious",
				url: "http://delicious.com/post?url={u}&amp;title={t}"
			},
			digg: {
				name: "Digg",
				url: "http://digg.com/submit?phase=2&amp;url={u}&amp;title={t}"
			},
			diigo: {
				name: "Diigo",
				url: "http://www.diigo.com/post?url={u}&amp;title={t}"
			},
			dzone: {
				name: "DZone",
				url: "http://www.dzone.com/links/add.html?url={u}&amp;title={t}"
			},
			facebook: {
				name: "Facebook",
				url: "http://www.facebook.com/sharer.php?u={u}&amp;t={t}"
			},
			googleplus: {
				name: "Google+",
				url: "https://plus.google.com/share?url={u}&amp;hl=" + document.documentElement.lang
			},
			linkedin: {
				name: "LinkedIn®",
				url: "http://www.linkedin.com/shareArticle?mini=true&amp;url={u}&amp;title={t}&amp;ro=false&amp;summary={d}&amp;source="
			},
			myspace: {
				name: "MySpace",
				url: "http://www.myspace.com/Modules/PostTo/Pages/?u={u}&amp;t={t}"
			},
			pinterest: {
				name: "Pinterest",
				url: "http://www.pinterest.com/pin/create/link/?url={u}&amp;media={i}&amp;description={t}"
			},
			reddit: {
				name: "reddit",
				url: "http://reddit.com/submit?url={u}&amp;title={t}"
			},
			stumbleupon: {
				name: "StumbleUpon",
				url: "http://www.stumbleupon.com/submit?url={u}&amp;title={t}"
			},
			technorati: {
				name: "Technorati",
				url: "http://www.technorati.com/faves?add={u}"
			},
			tumblr: {
				name: "tumblr",
				url: "http://www.tumblr.com/share/link?url={u}&amp;name={t}&amp;description={d}"
			},
			twitter: {
				name: "Twitter",
				url: "http://twitter.com/home?status={t}%20{u}"
			}
		}
	},

	/**
	 * Init runs once per plugin element on the page. There may be multiple elements.
	 * It will run more than once per plugin if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery Event} event `timerpoke.wb` event that triggered the function call
	 */
	init = function( event ) {
		var elm = event.target,
			sites, heading, settings, panel, link, $share, $elm,
			pageHref, pageTitle, pageImage, pageDescription, site,
			siteProperties, url, shareText, id, pnlId, regex,
			filter, filterLen, filteredSites, i;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( event.currentTarget === elm &&
			elm.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			elm.className += " " + initedClass;

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					shareText: i18n( "shr-txt" ),
					page: i18n( "shr-pg" ),
					video: i18n( "shr-vid" ),
					disclaimer: i18n( "shr-disc" )
				};
			}

			$elm = $( elm );
			settings = $.extend( true, defaults, wb.getData( $elm, "wet-boew" ) );
			sites = settings.sites;
			filter = settings.filter;
			filterLen = filter ? filter.length : 0;
			heading = settings.hdLvl;

			shareText = i18nText.shareText + ( settings.custType.length !== 0 ? settings.custType : i18nText[ settings.type ] );
			pnlId = settings.pnlId;
			id = "shr-pg" + ( pnlId.length !== 0 ? "-" + pnlId : panelCount );
			pageHref = encodeURIComponent( settings.url );

			regex = /\'|&#39;|&apos;/;
			pageTitle = encodeURIComponent( settings.title )
							.replace( regex, "%27" );
			pageImage = encodeURIComponent( settings.img );
			pageDescription = encodeURIComponent( settings.desc )
								.replace( regex, "%27" );

			// Don't create the panel for the second link (class="link-only")
			if ( elm.className.indexOf( "link-only" ) === -1 ) {
				panel = "<section id='" + id  + "' class='shr-pg wb-overlay modal-content overlay-def wb-panel-r" +
					"'><header class='modal-header'><" + heading + " class='modal-title'>" +
					shareText + "</" + heading + "></header><ul class='colcount-xs-2'>";

				// If there is a site filter, then filter the sites in advance
				if ( filterLen !== 0 ) {
					filteredSites = {};
					for ( i = 0; i !== filterLen; i += 1 ) {
						site = filter[ i ];
						filteredSites[ site ] = sites[ site ];
					}
					sites = filteredSites;
				}

				// Generate the panel
				for ( site in sites ) {
					siteProperties = sites[ site ];
					url = siteProperties.url
							.replace( /\{u\}/, pageHref )
							.replace( /\{t\}/, pageTitle )
							.replace( /\{i\}/, pageImage )
							.replace( /\{d\}/, pageDescription );
					panel += "<li><a href='" + url + "' class='" + shareLink + " " + site + " btn btn-default' target='_blank'>" + siteProperties.name + "</a></li>";
				}

				panel += "</ul><div class='clearfix'></div><p class='col-sm-12'>" + i18nText.disclaimer + "</p></section>";
				panelCount += 1;
			}
			link = "<a href='#" + id + "' aria-controls='" + id + "' class='shr-opn overlay-lnk'><span class='glyphicon glyphicon-share'></span> " +
				shareText + "</a>";

			$share = $( ( panel ? panel : "" ) + link );

			$elm.append( $share );

			$share
				.trigger( initEvent )
				.trigger( "wb-init.wb-overlay" );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

$document.on( "click vclick", "." + shareLink, function( event) {
	var which = event.which;

	// Ignore middle and right mouse buttons
	if ( !which || which === 1 ) {

		// Close the overlay
		$( event.target ).trigger( "close.wb-overlay" );
	}
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, document, wb );
