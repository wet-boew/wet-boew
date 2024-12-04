/**
 * jQuery fixes
 *
 * Note: The following analysis and/or changes was required also to be applied in our code base:
 *	- Ensure there is no JSONP ajax call
 *	- Ensure to not use self closing tag when a closing tag is usally needed.
 *		ex: `<div />` need to change for `<div></div>`
 *		This is applicable to all tags except the one in this list: area|br|col|embed|hr|img|input|link|meta|param
 *	- Review how `<tr>`, `<td>`, `<script>` and `<link>` are inserted with `$()`.
 *		Their insersion need to be completed differently like the by using the javascript DOM interface.
 *	- All content that related to jQuery DOM manipulation are sanitized with DOMPurify
 *	- You can't use jQuery for parsing XML document, you can use DOMParser() as an alternative
 *	- Ensure AJAX and fetch are sanitized before they response are used
 */
/*

// Test case for the jQuery fixes bellow

Test: jQuery()

	- Run in your browser console
	> $( "<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>" ).appendTo( "#wb-cont" );
	result: No iframe inserted around the heading level 1

Test:
jQuery.html()
jQuery.append()
jQuery.prepend()
jQuery.before()
jQuery.after()

	- Use the data-ajax demo page: /demos/data-ajax/data-ajax-en.html
	- Insert the following in the ajaxed in file: <p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>
	- Check if the dirty HTML are cleaned for the example: "append", "prepend", "before", "after"
	- The data-ajax-replace will also test the jQuery.html() function.

Test: jQuery.replaceWith()

	- Run in your browser console
	> $("#wb-cont").replaceWith( "<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>" );
	result: No iframe inserted around the heading level 1

Test: jQuery.parseHTML()

	- Run in your browser console, pass unsafe HTML and it should return sanitized HTML
	> jQuery.parseHTML( "<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>" );
	result: return an array with 1 element, [ p ]

Test: jQuery.htmlPrefilter()

	- Run in your browser console
	> jQuery.htmlPrefilter( "<tr/>" );
	result: return <tr/>

Test: jQuery.extend

	- Run in your browser console
	> var dataFromAPI = JSON.parse( '{ "new": "property", "__proto__": { "polluted": "true" } }' );
	> var myObject = jQuery.extend( '{ "new": "property" }', dataFromAPI );
	> console.log( myObject.polluted );
	result: > undefined

*/

( function( jQuery, DOMPurify, window ) {
"use strict";

/**
 * Copied from: https://git.drupalcode.org/project/drupal/-/commit/d2f26902ef5d6de58caaf2a7c766eb2115b1c17e
 *
 * This is almost verbatim copied from jQuery 3.4.0.
 *
 * Now compatible with jQuery 4.
 *
 */
jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function" ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		options = arguments[ i ];
		if ( options !== undefined || options !== null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

/**
 * Security advisories: https://github.com/jquery/jquery/security/advisories/GHSA-gxr4-xjj5-5px2
 */
jQuery.htmlPrefilter = function( html ) {
	return html;
};

/**
 * Security advisories: https://github.com/jquery/jquery/security/advisories/GHSA-jpcq-cgw6-v4j6
 *
 * This implementation leverage DOMPurify for filtering every string prior DOM manipulation by jQuery
 *
 */

// START: add hooks to DOMPurify to allow external links when they meet certain conditions as defined here: https://owasp.org/www-community/attacks/Reverse_Tabnabbing
DOMPurify.addHook( "beforeSanitizeAttributes", function( node ) {

	// Add "data-wb-external-link" to all <a> with a target="_blank" and rel="noreferrer"
	if (
		node.tagName === "A" &&
		node.getAttribute( "target" ) &&
		node.getAttribute( "target" ) === "_blank" &&
		node.getAttribute( "rel" ) &&
		node.relList.contains( "noreferrer" )
	) {
		node.setAttribute( "data-wb-external-link", "true" );
	}
} );

DOMPurify.addHook( "afterSanitizeAttributes", function( node ) {

	// Put back the target="_blank" to all <a> with attribute "data-wb-external-link"
	if ( node.tagName === "A" && node.getAttribute( "data-wb-external-link" ) ) {
		node.setAttribute( "target", "_blank" );
		node.removeAttribute( "data-wb-external-link" );
	}
} );

// END

var localParseHTML = jQuery.parseHTML,
	append = jQuery.fn.append,
	prepend = jQuery.fn.prepend,
	before = jQuery.fn.before,
	after = jQuery.fn.after,
	replaceWith = jQuery.fn.replaceWith,
	jqInit = jQuery.fn.init,
	dataTableAllowedTag = [
		"<tbody/>",
		"<tr/>",
		"<td />",
		"<td/>"
	],
	sanitize = function( html ) {

		// Add an exception for DataTable plugin
		if ( window.DataTable && dataTableAllowedTag.indexOf( html ) !== -1 ) {
			return html;
		}

		return DOMPurify.sanitize( html );
	};

jQuery.parseHTML = function( data, context, keepScripts ) {
	return localParseHTML( sanitize( data ), context, keepScripts );
};

jQuery.domManip = null;

jQuery.append = jQuery.fn.append = function() {
	var args = arguments,
		value = args[ 0 ];
	if ( typeof value === "string" ) {
		value = sanitize( value );
		args[ 0 ] = value;
	}
	return append.apply( this, args );
};

jQuery.prepend = jQuery.fn.prepend = function() {
	var args = arguments,
		value = args[ 0 ];
	if ( typeof value === "string" ) {
		value = sanitize( value );
		args[ 0 ] = value;
	}
	return prepend.apply( this, args );
};

jQuery.before = jQuery.fn.before = function() {
	var args = arguments,
		value = args[ 0 ];
	if ( typeof value === "string" ) {
		value = sanitize( value );
		args[ 0 ] = value;
	}
	return before.apply( this, args );
};

jQuery.after = jQuery.fn.after = function() {
	var args = arguments,
		value = args[ 0 ];
	if ( typeof value === "string" ) {
		value = sanitize( value );
		args[ 0 ] = value;
	}
	return after.apply( this, args );
};

jQuery.replaceWith = jQuery.fn.replaceWith = function() {
	var args = arguments,
		value = args[ 0 ];
	if ( typeof value === "string" ) {
		value = sanitize( value );
		args[ 0 ] = value;
	}
	return replaceWith.apply( this, args );
};

jQuery.fn.init = function( selector, context, root ) {
	if ( typeof selector === "string" ) {
		selector = sanitize( selector );
	}
	return new jqInit( selector, context, root );
};

jQuery.html = function( value ) {
	return jQuery.html( sanitize( value ) );
};

} )( jQuery, DOMPurify, window );
