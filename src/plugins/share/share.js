/**
 * @title WET-BOEW Share widget
 * @overview Facilitates sharing Web content on social media platforms.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-share",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	shareLink = "shr-lnk",
	panelCount = 0,
	$document = wb.doc,
	i18n, i18nText,

	/*
	 * Plugin users can override these defaults by setting attributes on the html elements that the
	 * selector matches.
	 */
	defaults = {
		hdLvl: "h2",

		// Supported types are: "page", "video" and "audio"
		type: "page",

		// For custom types
		// custType = " this comment" results in "Share this comment"
		custType: "",

		url: wb.pageUrlParts.href,
		title: document.title || $document.find( "h1:first" ).text(),

		pnlId: "",
		lnkClass: "",
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
			blogger: {
				name: "Blogger",
				url: "https://www.blogger.com/blog_this.pyra?t=&amp;u={u}&amp;n={t}"
			},
			diigo: {
				name: "Diigo",
				url: "https://www.diigo.com/post?url={u}&amp;title={t}"
			},
			facebook: {
				name: "Facebook",
				url: "https://www.facebook.com/sharer.php?u={u}&amp;t={t}"
			},
			gmail: {
				name: "Gmail",
				url: "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su={t}&body={u}%0A{d}"
			},
			linkedin: {
				name: "LinkedIn®",
				url: "https://www.linkedin.com/shareArticle?mini=true&amp;url={u}&amp;title={t}&amp;ro=false&amp;summary={d}&amp;source="
			},
			myspace: {
				name: "MySpace",
				url: "https://www.myspace.com/Modules/PostTo/Pages/?u={u}&amp;t={t}"
			},
			pinterest: {
				name: "Pinterest",
				url: "https://www.pinterest.com/pin/create/button/?url={u}&amp;media={i}&amp;description={t}"
			},
			reddit: {
				name: "reddit",
				url: "https://reddit.com/submit?url={u}&amp;title={t}"
			},
			tinyurl: {
				name: "TinyURL",
				url: "https://tinyurl.com/create.php?url={u}"
			},
			tumblr: {
				name: "tumblr",
				url: "https://www.tumblr.com/share/link?url={u}&amp;name={t}&amp;description={d}"
			},
			twitter: {
				name: "Twitter",
				url: "https://twitter.com/intent/tweet?text={t}&url={u}"
			},
			yahoomail: {
				name: "Yahoo! Mail",
				url: "https://compose.mail.yahoo.com/?to=&subject={t}&body={u}%0A{d}"
			},
			whatsapp: {
				name: "Whatsapp",
				url: "https://api.whatsapp.com/send?text={t}%0A{d}%0A{u}"
			}
		}
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
			sites, heading, settings, panel, link, $share, $elm,
			pageHref, pageTitle, pageImage, pageDescription,
			siteProperties, url, shareText, id, pnlId, regex,
			filter, i, len, keys, key;

		if ( elm ) {

			// Only initialize the i18nText once
			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					shareText: i18n( "shr-txt" ),
					page: i18n( "shr-pg" ),
					video: i18n( "shr-vid" ),
					audio: i18n( "shr-aud" ),
					disclaimer: i18n( "shr-disc" ),
					email: i18n( "email" )
				};

				// Add an email mailto option
				defaults.sites.email = {
					name: i18nText.email,
					url: "mailto:?to=&subject={t}&body={u}%0A{d}",
					isMailto: true
				};
			}

			$elm = $( elm );
			settings = $.extend(
				true,
				{},
				defaults,
				window[ componentName ],
				wb.getData( $elm, componentName )
			);
			sites = settings.sites;
			filter = settings.filter;
			heading = settings.hdLvl;

			shareText = i18nText.shareText + ( settings.custType.length !== 0 ? settings.custType : i18nText[ settings.type ] );
			pnlId = settings.pnlId;
			id = "shr-pg" + ( pnlId.length !== 0 ? "-" + pnlId : panelCount );
			pageHref = encodeURIComponent( settings.url );

			regex = /'|&#39;|&apos;/g;
			pageTitle = encodeURIComponent( settings.title )
				.replace( regex, "%27" );
			pageImage = encodeURIComponent( settings.img );
			pageDescription = encodeURIComponent( settings.desc )
				.replace( regex, "%27" );

			// Don't create the panel for the second link (class="link-only")
			if ( elm.className.indexOf( "link-only" ) === -1 ) {
				panel = "<section id='" + id  + "' class='shr-pg mfp-hide modal-dialog modal-content overlay-def" +
					"'><header class='modal-header'><" + heading + " class='modal-title'>" +
					shareText + "</" + heading + "></header><div class='modal-body'>" +
					"<ul class='list-unstyled colcount-xs-2'>";

				// If there is no filter array of site keys, then generate an array of site keys
				if ( !filter || filter.length === 0 ) {
					keys = [];
					for ( key in sites ) {
						if ( Object.prototype.hasOwnProperty.call( sites, key ) ) {
							keys.push( key );
						}
					}
				} else {
					keys = filter;
				}

				// i18n-friendly sort of the site keys
				keys.sort( function( x, y ) {
					return wb.normalizeDiacritics( x ).localeCompare( wb.normalizeDiacritics( y ) );
				} );
				len = keys.length;

				// Generate the panel
				for ( i = 0; i !== len; i += 1 ) {
					key = keys[ i ];
					siteProperties = sites[ key ];
					url = siteProperties.url
						.replace( /\{u\}/, pageHref )
						.replace( /\{t\}/, pageTitle )
						.replace( /\{i\}/, pageImage )
						.replace( /\{d\}/, pageDescription );
					panel += "<li><a href='" + url + "' class='" + shareLink +
						" " + ( siteProperties.isMailto ? "email" : key ) +
						" btn btn-default' target='_blank' rel='noreferrer noopener'>" +
						siteProperties.name + "</a></li>";
				}

				panel += "</ul><p class='col-sm-12 shr-dscl'>" + i18nText.disclaimer +
					"</p><div class='clearfix'></div></div></section>";
				panelCount += 1;
			}
			link = "<a href='#" + id + "' aria-controls='" + id +
				"' class='shr-opn wb-lbx " + settings.lnkClass +
				"'><span class='glyphicon glyphicon-share'></span>" +
				shareText + "</a>";

			$share = $( ( panel ? panel : "" ) + link );

			$elm.append( $share );

			$share
				.trigger( "wb-init.wb-lbx" );

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );
