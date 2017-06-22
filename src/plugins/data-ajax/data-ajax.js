/**
 * @title WET-BOEW Data Ajax [data-ajax-after], [data-ajax-append],
 * [data-ajax-before], [data-ajax-prepend] and [data-ajax-replace]
 * @overview A basic AjaxLoader wrapper that inserts AJAXed-in content
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once
 * per page, not once per instance of plugin on the page. So, this is a good
 * place to define variables that are common to all instances of the plugin on a
 * page.
 */
var componentName = "wb-data-ajax",
	shortName = "wb-ajax",
	selectors = [
		"[data-ajax-after]",
		"[data-ajax-append]",
		"[data-ajax-before]",
		"[data-ajax-prepend]",
		"[data-ajax-replace]",
		"[data-" + shortName + "]"
	],
	ajaxTypes = [
		"before",
		"replace",
		"after",
		"append",
		"prepend"
	],
	selectorsLength = selectors.length,
	selector = selectors.join( "," ),
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	contentUpdatedEvent = "wb-contentupdated",
	$document = wb.doc,
	s,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {string} ajaxType The type of AJAX operation, either after, append, before or replace
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var ajxInfo = getAjxInfo( event.target ),
			ajaxType = ajxInfo.type,
			elm = wb.init( event, componentName + "-" + ajaxType, selector );

		if ( elm && ajxInfo.url ) {

			ajax.call( this, event, ajxInfo );

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName, [ ajaxType ] );
		}
	},

	ajax = function( event, ajxInfo ) {
		var elm = event.target,
			$elm = $( elm ),
			settings = window[ componentName ],
			url,
			fetchObj,
			urlParts;

		if ( !ajxInfo ) {
			ajxInfo = getAjxInfo( elm );
		}
		url = ajxInfo.url;
		fetchObj = {
			url: url,
			nocache: ajxInfo.nocache,
			nocachekey: ajxInfo.nocachekey
		};

		// Detect CORS requests
		if ( settings && ( url.substr( 0, 4 ) === "http" || url.substr( 0, 2 ) === "//" ) ) {
			urlParts = wb.getUrlParts( url );
			if ( ( wb.pageUrlParts.protocol !== urlParts.protocol || wb.pageUrlParts.host !== urlParts.host ) && ( !Modernizr.cors || settings.forceCorsFallback ) ) {
				if ( typeof settings.corsFallback === "function" ) {
					fetchObj.dataType = "jsonp";
					fetchObj.jsonp = "callback";
					fetchObj = settings.corsFallback( fetchObj );
				}
			}
		}

		$elm.trigger( {
			type: "ajax-fetch.wb",
			fetch: fetchObj
		} );
	},

	// Get Info and return { "url": "the/ajax/URL", "atype" }
	getAjxInfo = function( elm ) {
		var ajaxType,
			len = ajaxTypes.length,
			i, url, dtAttr, nocache, nocachekey;

		for ( i = 0; i !== len; i += 1 ) {
			ajaxType = ajaxTypes[ i ];
			url = elm.getAttribute( "data-ajax-" + ajaxType );
			if ( url ) {
				break;
			}
		}

		if ( !url ) {
			dtAttr = wb.getData( $( elm ), shortName );

			// Abort the init when called on an invalid element (related to #8058)
			if ( !dtAttr ) {
				return {};
			}

			url = getURL( dtAttr.url, dtAttr.httpref );
			if ( !url ) {
				return {};
			}
			ajaxType = dtAttr.type;
			if ( ajaxTypes.indexOf( ajaxType ) === -1 ) {
				throw "Invalid ajax type";
			}
			nocache = dtAttr.nocache;
			nocachekey = dtAttr.nocachekey;
		}

		return {
			"url": url,
			"type": ajaxType,
			"nocache": nocache,
			"nocachekey": nocachekey
		};
	},

	// Return url for conditional display if regexp match http refer
	getURL = function( url, referer ) {
		var refers, httpRef, regHttpRef,
			i, i_len;

		if ( referer ) {
			if ( !$.isArray( referer ) ) {
				refers = [];
				refers.push( referer );
			} else {
				refers = referer;
			}

			httpRef = window.document.referrer;
			i_len = refers.length;
			for ( i = 0; i !== i_len; i += 1 ) {
				regHttpRef = new RegExp( refers[ i ] );
				if ( regHttpRef.test( httpRef ) ) {
					if ( $.isArray( url ) && url.length === i_len ) {
						return url[ i ];
					} else {
						return url;
					}
				}
			}
		} else {
			return url;
		}
		return "";
	},

	ajxFetched = function( elm, fetchObj ) {
		var $elm = $( elm ),
			ajxInfo = getAjxInfo( elm ),
			ajaxType = ajxInfo.type,
			content, jQueryCaching;

		// ajax-fetched event
		content = fetchObj.response;
		if ( content &&  content.length > 0 ) {

			//Prevents the force caching of nested resources
			jQueryCaching = jQuery.ajaxSettings.cache;
			jQuery.ajaxSettings.cache = true;

			// "replace" is the only event that doesn't map to a jQuery function
			if ( ajaxType === "replace" ) {
				$elm.html( content );
			} else {
				$elm[ ajaxType ]( content );
			}

			//Resets the initial jQuery caching setting
			jQuery.ajaxSettings.cache = jQueryCaching;

			$elm.trigger( contentUpdatedEvent, { "ajax-type": ajaxType, "content": content } );
		}
	};

$document.on( "timerpoke.wb " + initEvent + " " + updateEvent + " ajax-fetched.wb", selector, function( event ) {
	var eventTarget = event.target;

	switch ( event.type ) {

	case "timerpoke":
	case "wb-init":
		init( event );
		break;
	case "wb-update":
		ajax( event );
		break;
	default:

		// Filter out any events triggered by descendants
		if ( event.currentTarget === eventTarget ) {
			ajxFetched( eventTarget, event.fetch );
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being
	 * passive about our control, so returning true allows for events to always
	 * continue
	 */
	return true;
} );

// Add the timerpoke to initialize the plugin
for ( s = 0; s !== selectorsLength; s += 1 ) {
	wb.add( selectors[ s ] );
}

} )( jQuery, window, wb );
