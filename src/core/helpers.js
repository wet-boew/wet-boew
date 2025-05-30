/**
 * @title WET-BOEW JQuery Helper Methods
 * @overview Helper methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 * Credits: https://web.archive.org/web/20130826230640/http://kaibun.net/blog/2013/04/19/a-fully-fledged-coffeescript-boilerplate-for-jquery-plugins/
 */
( function( $, wb ) {

wb.getData = function( element, dataName ) {
	var elm = !element.jquery ? element : element[ 0 ],
		dataAttr = elm.getAttribute( "data-" + dataName ),
		dataObj;

	if ( dataAttr ) {
		try {
			dataObj = JSON.parse( dataAttr );
			$.data( elm, dataName, dataObj );
		} catch ( error ) {
			console.info( elm );
			$.error( "Bad JSON array in data-" + dataName + " attribute" );
		}
	}

	return dataObj;
};

/*
 * Initiate an in-browser download from a blob
 * @param blob: a reference to a blob object
 * @param filename: a suggested file name to save as under
 * @param title: (Optional) a title added to the link. Its use case is for web analytics tracking.
*/
wb.download = function( blob, filename, title ) {

	var objectURL = URL.createObjectURL( blob ),
		anchor = document.createElement( "a" );

	filename = filename || "unnamed"; // Ensure a filename is defined

	anchor.textContent = title || "";
	anchor.download = filename;

	anchor.hidden = true;
	document.body.appendChild( anchor ); // Added to the body for the web analytic tracking use case.

	if ( window.navigator.msSaveOrOpenBlob ) {

		// This is for IE11 support
		anchor.addEventListener( "click", function( ) {
			window.navigator.msSaveOrOpenBlob( blob, filename );
		} );
		anchor.setAttribute( "target", "_blank" );
	} else {
		anchor.href = objectURL;
	}

	anchor.click();

	// Clean the DOM, remove the accessory anchor at the next tick
	setTimeout( function() {
		document.body.removeChild( anchor );
	}, 1 );

	// Revoke the object, A setTimeout is used because Blob API don't have a download complete event.
	setTimeout( function() {
		if ( typeof objectURL === "string" ) {
			URL.revokeObjectURL( objectURL );
		} else {
			objectURL.remove();
		}
	}, 40000 ); // The revoking time is arbitrary

};

/* ---------------------------------
@extension: shuffleDOM
@returns: [list] shuffles a list of items randomly
-------------------------------- */
wb.shuffleDOM = function( $elm ) {
	var allElems = $elm.get(),
		shuffled = $.map( allElems, function() {
			var random = Math.floor( Math.random() * allElems.length ),
				randEl = $( allElems[ random ] ).clone( true )[ 0 ];
			allElems.splice( random, 1 );
			return randEl;
		} ),
		elm_len = $elm.length,
		i;

	for ( i = 0; i < elm_len; i++ ) {
		$( $elm[ i ] ).replaceWith( $( shuffled[ i ] ) );
	}

	return $( shuffled );
};

/* ---------------------------------
@extension: pickElements
@returns: [collection] of random elements
-------------------------------- */
wb.pickElements = function( $elm, numOfElm ) {
	var nbElm = $elm.size(),
		elmCopies,
		i, swap;

	numOfElm = numOfElm || 1;

	// Special cases
	if ( numOfElm > nbElm ) {
		return $elm.pushStack( $elm );
	} else if ( numOfElm === 1 ) {
		return $elm.filter( ":eq(" + Math.floor( Math.random() * nbElm ) + ")" );
	}

	// Create a randomized copy of the set of elements,
	// using Fisher-Yates sorting
	elmCopies = $elm.get();

	for ( i = 0; i < nbElm - 1; i++ ) {
		swap = Math.floor( Math.random() * ( nbElm - i ) ) + i;
		elmCopies[ swap ] = elmCopies.splice( i, 1, elmCopies[ swap ] )[ 0 ];
	}
	elmCopies = elmCopies.slice( 0, numOfElm );

	// Finally, filter jQuery stack
	return $elm.filter( function( idx ) {
		return $.inArray( $elm.get( idx ), elmCopies ) > -1;
	} );
};

/* ---------------------------------
Adds a link to the Skip links navigation
@param text: Text to display in the anchor or button
@param attr: JSO with { attribute: value, ... } to add attributes to the anchor or button. Minimum is { href: "#your-anchor" } for the anchor tag
@param isBtn: (Optional) Bool if true element is a button, otherwise it is an anchor by default
@param isLast: (Optional) Bool if true element will be inserted last in the list
-------------------------------- */
wb.addSkipLink = function( text, attr, isBtn, isLast ) {
	var list = document.getElementById( "wb-tphp" ),
		li = document.createElement( "li" ),
		elm = document.createElement( ( isBtn ? "button" : "a" ) ),
		key;

	// Add skip link's proprietary classes to new element
	li.className = "wb-slc";
	elm.className = "wb-sl";

	// Add given attributes to element
	for ( key in attr ) {
		elm.setAttribute( key, attr[ key ] );
	}

	// Append text and new element to the skip link list (after main content)
	elm.appendChild( document.createTextNode( text ) );
	li.appendChild( elm );

	if ( isLast ) {
		list.appendChild( li );
	} else {
		list.insertBefore( li, list.childNodes[ 2 ] );
	}

	return true;
};

} )( jQuery, wb );

( function( wb, window ) {

"use strict";

// Escapes the characters in a string for use in a jQuery selector
// Based on https://totaldev.com/content/escaping-characters-get-valid-jquery-id
wb.jqEscape = function( selector ) {
	// eslint-disable-next-line no-useless-escape
	return selector.replace( /([;&,\.\+\*\~':"\\\!\^\/#$%@\[\]\(\)=>\|])/g, "\\$1" );
};

// RegEx used by formattedNumCompare
wb.formattedNumCompareRegEx = /(<[^>]*>|[^\d.])/g;

// Compares two formatted numbers (e.g., 1.2.12 or 1,000,345)
wb.formattedNumCompare = function( a, b ) {
	var regEx = wb.formattedNumCompareRegEx,
		aMultiple = a.indexOf( "-" ) === -1 ? 1 : -1,
		aNumbers = ( ( a === "-" || a === "" ) ? "0" : a.replace( regEx, "" ) ).split( "." ),
		bMultiple = b.indexOf( "-" ) === -1 ? 1 : -1,
		bNumbers = ( ( b === "-" || b === "" ) ? "0" : b.replace( regEx, "" ) ).split( "." ),
		len = aNumbers.length,
		i, result;

	for ( i = 0; i !== len; i += 1 ) {
		result = parseInt( aNumbers[ i ], 10 ) * aMultiple - parseInt( bNumbers[ i ], 10 ) * bMultiple;
		if ( result !== 0 ) {
			break;
		}
	}
	return result;
};

// Compare two strings with special characters (e.g., Cyrillic or Chinese characters)
wb.i18nTextCompare = function( a, b ) {
	return wb.normalizeDiacritics( a ).localeCompare( wb.normalizeDiacritics( b ) );
};

// Based upon https://gist.github.com/instanceofme/1731620
// Licensed under WTFPL v2 http://sam.zoy.org/wtfpl/COPYING
wb.normalizeDiacritics = function( str ) {
	var diacritics = {
			"\u24B6": "A",
			"\uFF21": "A",
			"\u00C0": "A",
			"\u00C1": "A",
			"\u00C2": "A",
			"\u1EA6": "A",
			"\u1EA4": "A",
			"\u1EAA": "A",
			"\u1EA8": "A",
			"\u00C3": "A",
			"\u0100": "A",
			"\u0102": "A",
			"\u1EB0": "A",
			"\u1EAE": "A",
			"\u1EB4": "A",
			"\u1EB2": "A",
			"\u0226": "A",
			"\u01E0": "A",
			"\u00C4": "A",
			"\u01DE": "A",
			"\u1EA2": "A",
			"\u00C5": "A",
			"\u01FA": "A",
			"\u01CD": "A",
			"\u0200": "A",
			"\u0202": "A",
			"\u1EA0": "A",
			"\u1EAC": "A",
			"\u1EB6": "A",
			"\u1E00": "A",
			"\u0104": "A",
			"\u023A": "A",
			"\u2C6F": "A",
			"\uA732": "AA",
			"\u00C6": "AE",
			"\u01FC": "AE",
			"\u01E2": "AE",
			"\uA734": "AO",
			"\uA736": "AU",
			"\uA738": "AV",
			"\uA73A": "AV",
			"\uA73C": "AY",
			"\u24B7": "B",
			"\uFF22": "B",
			"\u1E02": "B",
			"\u1E04": "B",
			"\u1E06": "B",
			"\u0243": "B",
			"\u0182": "B",
			"\u0181": "B",
			"\u24B8": "C",
			"\uFF23": "C",
			"\u0106": "C",
			"\u0108": "C",
			"\u010A": "C",
			"\u010C": "C",
			"\u00C7": "C",
			"\u1E08": "C",
			"\u0187": "C",
			"\u023B": "C",
			"\uA73E": "C",
			"\u24B9": "D",
			"\uFF24": "D",
			"\u1E0A": "D",
			"\u010E": "D",
			"\u1E0C": "D",
			"\u1E10": "D",
			"\u1E12": "D",
			"\u1E0E": "D",
			"\u0110": "D",
			"\u018B": "D",
			"\u018A": "D",
			"\u0189": "D",
			"\uA779": "D",
			"\u01F1": "DZ",
			"\u01C4": "DZ",
			"\u01F2": "Dz",
			"\u01C5": "Dz",
			"\u24BA": "E",
			"\uFF25": "E",
			"\u00C8": "E",
			"\u00C9": "E",
			"\u00CA": "E",
			"\u1EC0": "E",
			"\u1EBE": "E",
			"\u1EC4": "E",
			"\u1EC2": "E",
			"\u1EBC": "E",
			"\u0112": "E",
			"\u1E14": "E",
			"\u1E16": "E",
			"\u0114": "E",
			"\u0116": "E",
			"\u00CB": "E",
			"\u1EBA": "E",
			"\u011A": "E",
			"\u0204": "E",
			"\u0206": "E",
			"\u1EB8": "E",
			"\u1EC6": "E",
			"\u0228": "E",
			"\u1E1C": "E",
			"\u0118": "E",
			"\u1E18": "E",
			"\u1E1A": "E",
			"\u0190": "E",
			"\u018E": "E",
			"\u24BB": "F",
			"\uFF26": "F",
			"\u1E1E": "F",
			"\u0191": "F",
			"\uA77B": "F",
			"\u24BC": "G",
			"\uFF27": "G",
			"\u01F4": "G",
			"\u011C": "G",
			"\u1E20": "G",
			"\u011E": "G",
			"\u0120": "G",
			"\u01E6": "G",
			"\u0122": "G",
			"\u01E4": "G",
			"\u0193": "G",
			"\uA7A0": "G",
			"\uA77D": "G",
			"\uA77E": "G",
			"\u24BD": "H",
			"\uFF28": "H",
			"\u0124": "H",
			"\u1E22": "H",
			"\u1E26": "H",
			"\u021E": "H",
			"\u1E24": "H",
			"\u1E28": "H",
			"\u1E2A": "H",
			"\u0126": "H",
			"\u2C67": "H",
			"\u2C75": "H",
			"\uA78D": "H",
			"\u24BE": "I",
			"\uFF29": "I",
			"\u00CC": "I",
			"\u00CD": "I",
			"\u00CE": "I",
			"\u0128": "I",
			"\u012A": "I",
			"\u012C": "I",
			"\u0130": "I",
			"\u00CF": "I",
			"\u1E2E": "I",
			"\u1EC8": "I",
			"\u01CF": "I",
			"\u0208": "I",
			"\u020A": "I",
			"\u1ECA": "I",
			"\u012E": "I",
			"\u1E2C": "I",
			"\u0197": "I",
			"\u24BF": "J",
			"\uFF2A": "J",
			"\u0134": "J",
			"\u0248": "J",
			"\u24C0": "K",
			"\uFF2B": "K",
			"\u1E30": "K",
			"\u01E8": "K",
			"\u1E32": "K",
			"\u0136": "K",
			"\u1E34": "K",
			"\u0198": "K",
			"\u2C69": "K",
			"\uA740": "K",
			"\uA742": "K",
			"\uA744": "K",
			"\uA7A2": "K",
			"\u24C1": "L",
			"\uFF2C": "L",
			"\u013F": "L",
			"\u0139": "L",
			"\u013D": "L",
			"\u1E36": "L",
			"\u1E38": "L",
			"\u013B": "L",
			"\u1E3C": "L",
			"\u1E3A": "L",
			"\u0141": "L",
			"\u023D": "L",
			"\u2C62": "L",
			"\u2C60": "L",
			"\uA748": "L",
			"\uA746": "L",
			"\uA780": "L",
			"\u01C7": "LJ",
			"\u01C8": "Lj",
			"\u24C2": "M",
			"\uFF2D": "M",
			"\u1E3E": "M",
			"\u1E40": "M",
			"\u1E42": "M",
			"\u2C6E": "M",
			"\u019C": "M",
			"\u24C3": "N",
			"\uFF2E": "N",
			"\u01F8": "N",
			"\u0143": "N",
			"\u00D1": "N",
			"\u1E44": "N",
			"\u0147": "N",
			"\u1E46": "N",
			"\u0145": "N",
			"\u1E4A": "N",
			"\u1E48": "N",
			"\u0220": "N",
			"\u019D": "N",
			"\uA790": "N",
			"\uA7A4": "N",
			"\u01CA": "NJ",
			"\u01CB": "Nj",
			"\u24C4": "O",
			"\uFF2F": "O",
			"\u00D2": "O",
			"\u00D3": "O",
			"\u00D4": "O",
			"\u1ED2": "O",
			"\u1ED0": "O",
			"\u1ED6": "O",
			"\u1ED4": "O",
			"\u00D5": "O",
			"\u1E4C": "O",
			"\u022C": "O",
			"\u1E4E": "O",
			"\u014C": "O",
			"\u1E50": "O",
			"\u1E52": "O",
			"\u014E": "O",
			"\u022E": "O",
			"\u0230": "O",
			"\u00D6": "O",
			"\u022A": "O",
			"\u1ECE": "O",
			"\u0150": "O",
			"\u01D1": "O",
			"\u020C": "O",
			"\u020E": "O",
			"\u01A0": "O",
			"\u1EDC": "O",
			"\u1EDA": "O",
			"\u1EE0": "O",
			"\u1EDE": "O",
			"\u1EE2": "O",
			"\u1ECC": "O",
			"\u1ED8": "O",
			"\u01EA": "O",
			"\u01EC": "O",
			"\u00D8": "O",
			"\u01FE": "O",
			"\u0186": "O",
			"\u019F": "O",
			"\uA74A": "O",
			"\uA74C": "O",
			"\u0152": "OE",
			"\u01A2": "OI",
			"\uA74E": "OO",
			"\u0222": "OU",
			"\u24C5": "P",
			"\uFF30": "P",
			"\u1E54": "P",
			"\u1E56": "P",
			"\u01A4": "P",
			"\u2C63": "P",
			"\uA750": "P",
			"\uA752": "P",
			"\uA754": "P",
			"\u24C6": "Q",
			"\uFF31": "Q",
			"\uA756": "Q",
			"\uA758": "Q",
			"\u024A": "Q",
			"\u24C7": "R",
			"\uFF32": "R",
			"\u0154": "R",
			"\u1E58": "R",
			"\u0158": "R",
			"\u0210": "R",
			"\u0212": "R",
			"\u1E5A": "R",
			"\u1E5C": "R",
			"\u0156": "R",
			"\u1E5E": "R",
			"\u024C": "R",
			"\u2C64": "R",
			"\uA75A": "R",
			"\uA7A6": "R",
			"\uA782": "R",
			"\u24C8": "S",
			"\uFF33": "S",
			"\u015A": "S",
			"\u1E64": "S",
			"\u015C": "S",
			"\u1E60": "S",
			"\u0160": "S",
			"\u1E66": "S",
			"\u1E62": "S",
			"\u1E68": "S",
			"\u0218": "S",
			"\u015E": "S",
			"\u2C7E": "S",
			"\uA7A8": "S",
			"\uA784": "S",
			"\u1E9E": "SS",
			"\u24C9": "T",
			"\uFF34": "T",
			"\u1E6A": "T",
			"\u0164": "T",
			"\u1E6C": "T",
			"\u021A": "T",
			"\u0162": "T",
			"\u1E70": "T",
			"\u1E6E": "T",
			"\u0166": "T",
			"\u01AC": "T",
			"\u01AE": "T",
			"\u023E": "T",
			"\uA786": "T",
			"\uA728": "TZ",
			"\u24CA": "U",
			"\uFF35": "U",
			"\u00D9": "U",
			"\u00DA": "U",
			"\u00DB": "U",
			"\u0168": "U",
			"\u1E78": "U",
			"\u016A": "U",
			"\u1E7A": "U",
			"\u016C": "U",
			"\u00DC": "U",
			"\u01DB": "U",
			"\u01D7": "U",
			"\u01D5": "U",
			"\u01D9": "U",
			"\u1EE6": "U",
			"\u016E": "U",
			"\u0170": "U",
			"\u01D3": "U",
			"\u0214": "U",
			"\u0216": "U",
			"\u01AF": "U",
			"\u1EEA": "U",
			"\u1EE8": "U",
			"\u1EEE": "U",
			"\u1EEC": "U",
			"\u1EF0": "U",
			"\u1EE4": "U",
			"\u1E72": "U",
			"\u0172": "U",
			"\u1E76": "U",
			"\u1E74": "U",
			"\u0244": "U",
			"\u24CB": "V",
			"\uFF36": "V",
			"\u1E7C": "V",
			"\u1E7E": "V",
			"\u01B2": "V",
			"\uA75E": "V",
			"\u0245": "V",
			"\uA760": "VY",
			"\u24CC": "W",
			"\uFF37": "W",
			"\u1E80": "W",
			"\u1E82": "W",
			"\u0174": "W",
			"\u1E86": "W",
			"\u1E84": "W",
			"\u1E88": "W",
			"\u2C72": "W",
			"\u24CD": "X",
			"\uFF38": "X",
			"\u1E8A": "X",
			"\u1E8C": "X",
			"\u24CE": "Y",
			"\uFF39": "Y",
			"\u1EF2": "Y",
			"\u00DD": "Y",
			"\u0176": "Y",
			"\u1EF8": "Y",
			"\u0232": "Y",
			"\u1E8E": "Y",
			"\u0178": "Y",
			"\u1EF6": "Y",
			"\u1EF4": "Y",
			"\u01B3": "Y",
			"\u024E": "Y",
			"\u1EFE": "Y",
			"\u24CF": "Z",
			"\uFF3A": "Z",
			"\u0179": "Z",
			"\u1E90": "Z",
			"\u017B": "Z",
			"\u017D": "Z",
			"\u1E92": "Z",
			"\u1E94": "Z",
			"\u01B5": "Z",
			"\u0224": "Z",
			"\u2C7F": "Z",
			"\u2C6B": "Z",
			"\uA762": "Z",
			"\u24D0": "a",
			"\uFF41": "a",
			"\u1E9A": "a",
			"\u00E0": "a",
			"\u00E1": "a",
			"\u00E2": "a",
			"\u1EA7": "a",
			"\u1EA5": "a",
			"\u1EAB": "a",
			"\u1EA9": "a",
			"\u00E3": "a",
			"\u0101": "a",
			"\u0103": "a",
			"\u1EB1": "a",
			"\u1EAF": "a",
			"\u1EB5": "a",
			"\u1EB3": "a",
			"\u0227": "a",
			"\u01E1": "a",
			"\u00E4": "a",
			"\u01DF": "a",
			"\u1EA3": "a",
			"\u00E5": "a",
			"\u01FB": "a",
			"\u01CE": "a",
			"\u0201": "a",
			"\u0203": "a",
			"\u1EA1": "a",
			"\u1EAD": "a",
			"\u1EB7": "a",
			"\u1E01": "a",
			"\u0105": "a",
			"\u2C65": "a",
			"\u0250": "a",
			"\uA733": "aa",
			"\u00E6": "ae",
			"\u01FD": "ae",
			"\u01E3": "ae",
			"\uA735": "ao",
			"\uA737": "au",
			"\uA739": "av",
			"\uA73B": "av",
			"\uA73D": "ay",
			"\u24D1": "b",
			"\uFF42": "b",
			"\u1E03": "b",
			"\u1E05": "b",
			"\u1E07": "b",
			"\u0180": "b",
			"\u0183": "b",
			"\u0253": "b",
			"\u24D2": "c",
			"\uFF43": "c",
			"\u0107": "c",
			"\u0109": "c",
			"\u010B": "c",
			"\u010D": "c",
			"\u00E7": "c",
			"\u1E09": "c",
			"\u0188": "c",
			"\u023C": "c",
			"\uA73F": "c",
			"\u2184": "c",
			"\u24D3": "d",
			"\uFF44": "d",
			"\u1E0B": "d",
			"\u010F": "d",
			"\u1E0D": "d",
			"\u1E11": "d",
			"\u1E13": "d",
			"\u1E0F": "d",
			"\u0111": "d",
			"\u018C": "d",
			"\u0256": "d",
			"\u0257": "d",
			"\uA77A": "d",
			"\u01F3": "dz",
			"\u01C6": "dz",
			"\u24D4": "e",
			"\uFF45": "e",
			"\u00E8": "e",
			"\u00E9": "e",
			"\u00EA": "e",
			"\u1EC1": "e",
			"\u1EBF": "e",
			"\u1EC5": "e",
			"\u1EC3": "e",
			"\u1EBD": "e",
			"\u0113": "e",
			"\u1E15": "e",
			"\u1E17": "e",
			"\u0115": "e",
			"\u0117": "e",
			"\u00EB": "e",
			"\u1EBB": "e",
			"\u011B": "e",
			"\u0205": "e",
			"\u0207": "e",
			"\u1EB9": "e",
			"\u1EC7": "e",
			"\u0229": "e",
			"\u1E1D": "e",
			"\u0119": "e",
			"\u1E19": "e",
			"\u1E1B": "e",
			"\u0247": "e",
			"\u025B": "e",
			"\u01DD": "e",
			"\u24D5": "f",
			"\uFF46": "f",
			"\u1E1F": "f",
			"\u0192": "f",
			"\uA77C": "f",
			"\u24D6": "g",
			"\uFF47": "g",
			"\u01F5": "g",
			"\u011D": "g",
			"\u1E21": "g",
			"\u011F": "g",
			"\u0121": "g",
			"\u01E7": "g",
			"\u0123": "g",
			"\u01E5": "g",
			"\u0260": "g",
			"\uA7A1": "g",
			"\u1D79": "g",
			"\uA77F": "g",
			"\u24D7": "h",
			"\uFF48": "h",
			"\u0125": "h",
			"\u1E23": "h",
			"\u1E27": "h",
			"\u021F": "h",
			"\u1E25": "h",
			"\u1E29": "h",
			"\u1E2B": "h",
			"\u1E96": "h",
			"\u0127": "h",
			"\u2C68": "h",
			"\u2C76": "h",
			"\u0265": "h",
			"\u0195": "hv",
			"\u24D8": "i",
			"\uFF49": "i",
			"\u00EC": "i",
			"\u00ED": "i",
			"\u00EE": "i",
			"\u0129": "i",
			"\u012B": "i",
			"\u012D": "i",
			"\u00EF": "i",
			"\u1E2F": "i",
			"\u1EC9": "i",
			"\u01D0": "i",
			"\u0209": "i",
			"\u020B": "i",
			"\u1ECB": "i",
			"\u012F": "i",
			"\u1E2D": "i",
			"\u0268": "i",
			"\u0131": "i",
			"\u24D9": "j",
			"\uFF4A": "j",
			"\u0135": "j",
			"\u01F0": "j",
			"\u0249": "j",
			"\u24DA": "k",
			"\uFF4B": "k",
			"\u1E31": "k",
			"\u01E9": "k",
			"\u1E33": "k",
			"\u0137": "k",
			"\u1E35": "k",
			"\u0199": "k",
			"\u2C6A": "k",
			"\uA741": "k",
			"\uA743": "k",
			"\uA745": "k",
			"\uA7A3": "k",
			"\u24DB": "l",
			"\uFF4C": "l",
			"\u0140": "l",
			"\u013A": "l",
			"\u013E": "l",
			"\u1E37": "l",
			"\u1E39": "l",
			"\u013C": "l",
			"\u1E3D": "l",
			"\u1E3B": "l",
			"\u0142": "l",
			"\u019A": "l",
			"\u026B": "l",
			"\u2C61": "l",
			"\uA749": "l",
			"\uA781": "l",
			"\uA747": "l",
			"\u01C9": "lj",
			"\u24DC": "m",
			"\uFF4D": "m",
			"\u1E3F": "m",
			"\u1E41": "m",
			"\u1E43": "m",
			"\u0271": "m",
			"\u026F": "m",
			"\u24DD": "n",
			"\uFF4E": "n",
			"\u01F9": "n",
			"\u0144": "n",
			"\u00F1": "n",
			"\u1E45": "n",
			"\u0148": "n",
			"\u1E47": "n",
			"\u0146": "n",
			"\u1E4B": "n",
			"\u1E49": "n",
			"\u019E": "n",
			"\u0272": "n",
			"\u0149": "n",
			"\uA791": "n",
			"\uA7A5": "n",
			"\u01CC": "nj",
			"\u24DE": "o",
			"\uFF4F": "o",
			"\u00F2": "o",
			"\u00F3": "o",
			"\u00F4": "o",
			"\u1ED3": "o",
			"\u1ED1": "o",
			"\u1ED7": "o",
			"\u1ED5": "o",
			"\u00F5": "o",
			"\u1E4D": "o",
			"\u022D": "o",
			"\u1E4F": "o",
			"\u014D": "o",
			"\u1E51": "o",
			"\u1E53": "o",
			"\u014F": "o",
			"\u022F": "o",
			"\u0231": "o",
			"\u00F6": "o",
			"\u022B": "o",
			"\u1ECF": "o",
			"\u0151": "o",
			"\u01D2": "o",
			"\u020D": "o",
			"\u020F": "o",
			"\u01A1": "o",
			"\u1EDD": "o",
			"\u1EDB": "o",
			"\u1EE1": "o",
			"\u1EDF": "o",
			"\u1EE3": "o",
			"\u1ECD": "o",
			"\u1ED9": "o",
			"\u01EB": "o",
			"\u01ED": "o",
			"\u00F8": "o",
			"\u01FF": "o",
			"\u0254": "o",
			"\uA74B": "o",
			"\uA74D": "o",
			"\u0275": "o",
			"\u0153": "oe",
			"\u0276": "oe",
			"\u01A3": "oi",
			"\u0223": "ou",
			"\uA74F": "oo",
			"\u24DF": "p",
			"\uFF50": "p",
			"\u1E55": "p",
			"\u1E57": "p",
			"\u01A5": "p",
			"\u1D7D": "p",
			"\uA751": "p",
			"\uA753": "p",
			"\uA755": "p",
			"\u24E0": "q",
			"\uFF51": "q",
			"\u024B": "q",
			"\uA757": "q",
			"\uA759": "q",
			"\u24E1": "r",
			"\uFF52": "r",
			"\u0155": "r",
			"\u1E59": "r",
			"\u0159": "r",
			"\u0211": "r",
			"\u0213": "r",
			"\u1E5B": "r",
			"\u1E5D": "r",
			"\u0157": "r",
			"\u1E5F": "r",
			"\u024D": "r",
			"\u027D": "r",
			"\uA75B": "r",
			"\uA7A7": "r",
			"\uA783": "r",
			"\u24E2": "s",
			"\uFF53": "s",
			"\u015B": "s",
			"\u1E65": "s",
			"\u015D": "s",
			"\u1E61": "s",
			"\u0161": "s",
			"\u1E67": "s",
			"\u1E63": "s",
			"\u1E69": "s",
			"\u0219": "s",
			"\u015F": "s",
			"\u023F": "s",
			"\uA7A9": "s",
			"\uA785": "s",
			"\u017F": "s",
			"\u1E9B": "s",
			"\u00DF": "ss",
			"\u24E3": "t",
			"\uFF54": "t",
			"\u1E6B": "t",
			"\u1E97": "t",
			"\u0165": "t",
			"\u1E6D": "t",
			"\u021B": "t",
			"\u0163": "t",
			"\u1E71": "t",
			"\u1E6F": "t",
			"\u0167": "t",
			"\u01AD": "t",
			"\u0288": "t",
			"\u2C66": "t",
			"\uA787": "t",
			"\uA729": "tz",
			"\u24E4": "u",
			"\uFF55": "u",
			"\u00F9": "u",
			"\u00FA": "u",
			"\u00FB": "u",
			"\u0169": "u",
			"\u1E79": "u",
			"\u016B": "u",
			"\u1E7B": "u",
			"\u016D": "u",
			"\u00FC": "u",
			"\u01DC": "u",
			"\u01D8": "u",
			"\u01D6": "u",
			"\u01DA": "u",
			"\u1EE7": "u",
			"\u016F": "u",
			"\u0171": "u",
			"\u01D4": "u",
			"\u0215": "u",
			"\u0217": "u",
			"\u01B0": "u",
			"\u1EEB": "u",
			"\u1EE9": "u",
			"\u1EEF": "u",
			"\u1EED": "u",
			"\u1EF1": "u",
			"\u1EE5": "u",
			"\u1E73": "u",
			"\u0173": "u",
			"\u1E77": "u",
			"\u1E75": "u",
			"\u0289": "u",
			"\u24E5": "v",
			"\uFF56": "v",
			"\u1E7D": "v",
			"\u1E7F": "v",
			"\u028B": "v",
			"\uA75F": "v",
			"\u028C": "v",
			"\uA761": "vy",
			"\u24E6": "w",
			"\uFF57": "w",
			"\u1E81": "w",
			"\u1E83": "w",
			"\u0175": "w",
			"\u1E87": "w",
			"\u1E85": "w",
			"\u1E98": "w",
			"\u1E89": "w",
			"\u2C73": "w",
			"\u24E7": "x",
			"\uFF58": "x",
			"\u1E8B": "x",
			"\u1E8D": "x",
			"\u24E8": "y",
			"\uFF59": "y",
			"\u1EF3": "y",
			"\u00FD": "y",
			"\u0177": "y",
			"\u1EF9": "y",
			"\u0233": "y",
			"\u1E8F": "y",
			"\u00FF": "y",
			"\u1EF7": "y",
			"\u1E99": "y",
			"\u1EF5": "y",
			"\u01B4": "y",
			"\u024F": "y",
			"\u1EFF": "y",
			"\u24E9": "z",
			"\uFF5A": "z",
			"\u017A": "z",
			"\u1E91": "z",
			"\u017C": "z",
			"\u017E": "z",
			"\u1E93": "z",
			"\u1E95": "z",
			"\u01B6": "z",
			"\u0225": "z",
			"\u0240": "z",
			"\u2C6C": "z",
			"\uA763": "z",
			"\uFF10": "0",
			"\u2080": "0",
			"\u24EA": "0",
			"\u2070": "0",
			"\u00B9": "1",
			"\u2474": "1",
			"\u2081": "1",
			"\u2776": "1",
			"\u24F5": "1",
			"\u2488": "1",
			"\u2460": "1",
			"\uFF11": "1",
			"\u00B2": "2",
			"\u2777": "2",
			"\u2475": "2",
			"\uFF12": "2",
			"\u2082": "2",
			"\u24F6": "2",
			"\u2461": "2",
			"\u2489": "2",
			"\u00B3": "3",
			"\uFF13": "3",
			"\u248A": "3",
			"\u2476": "3",
			"\u2083": "3",
			"\u2778": "3",
			"\u24F7": "3",
			"\u2462": "3",
			"\u24F8": "4",
			"\u2463": "4",
			"\u248B": "4",
			"\uFF14": "4",
			"\u2074": "4",
			"\u2084": "4",
			"\u2779": "4",
			"\u2477": "4",
			"\u248C": "5",
			"\u2085": "5",
			"\u24F9": "5",
			"\u2478": "5",
			"\u277A": "5",
			"\u2464": "5",
			"\uFF15": "5",
			"\u2075": "5",
			"\u2479": "6",
			"\u2076": "6",
			"\uFF16": "6",
			"\u277B": "6",
			"\u2086": "6",
			"\u2465": "6",
			"\u24FA": "6",
			"\u248D": "6",
			"\uFF17": "7",
			"\u2077": "7",
			"\u277C": "7",
			"\u24FB": "7",
			"\u248E": "7",
			"\u2087": "7",
			"\u247A": "7",
			"\u2466": "7",
			"\u2467": "8",
			"\u248F": "8",
			"\u24FC": "8",
			"\u247B": "8",
			"\u2078": "8",
			"\uFF18": "8",
			"\u277D": "8",
			"\u2088": "8",
			"\u24FD": "9",
			"\uFF19": "9",
			"\u2490": "9",
			"\u277E": "9",
			"\u247C": "9",
			"\u2089": "9",
			"\u2468": "9",
			"\u2079": "9"
		},
		chars = str.split( "" ),
		len = chars.length,
		normalized = false,
		i, character;
	for ( i = 0; i !== len; i += 1 ) {
		character = chars[ i ];
		if ( Object.prototype.hasOwnProperty.call( diacritics, character ) ) {
			chars[ i ] = diacritics[ character ];
			normalized = true;
		}
	}
	return ( normalized ? chars.join( "" ) : str );
};

/**
 * @namespace wb.string
 */
wb.string = {

	/*
	 * Left-pads a number with zeros.
	 * @memberof wb.string
	 * @param {number} number The original number to pad.
	 * @param {number} length The width of the resulting padded number, not the number of zeros to add to the front of the string.
	 * @return {string} The padded string
	 */
	pad: function( number, length ) {
		var str = number + "",
			diff = length - str.length,
			i;
		for ( i = 0; i !== diff; i += 1 ) {
			str = "0" + str;
		}
		return str;
	},

	/*
	 * Convert a base64 string into an ArrayBuffer (Note: this function are not fully UTF-8 supported and may create interoperability issue)
	 * ref. https://www.isummation.com/blog/convert-arraybuffer-to-base64-string-and-vice-versa/
	 * @memberof wb.string
	 * @param {string} Base64 browser encoded
	 * @return {ArrayBuffer} string converted into ArrayBuffer
	 */
	base64ToArrayBuffer: function( base64 ) {
		var binary_string = window.atob( base64 ),
			len = binary_string.length,
			bytes = new Uint8Array( len ),
			i;
		for ( i = 0; i < len; i++ ) {
			bytes[ i ] = binary_string.charCodeAt( i );
		}
		return bytes.buffer;
	},

	/*
	 * Convert an ArrayBuffer into base64 string (Note: this function are not fully UTF-8 supported and may create interoperability issue)
	 * ref. https://www.isummation.com/blog/convert-arraybuffer-to-base64-string-and-vice-versa/
	 * @memberof wb.string
	 * @param {ArrayBuffer}
	 * @return {string} ArrayBuffer converted into base64 string
	 */
	arrayBufferToBase64: function( buffer ) {
		var binary = "",
			bytes = new Uint8Array( buffer ),
			len = bytes.byteLength,
			i;
		for ( i = 0; i < len; i++ ) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	},

	/*
	 * Convert an hexadecimal string into an ArrayBuffer
	 * ref. https://stackoverflow.com/questions/38987784/how-to-convert-a-hexadecimal-string-to-uint8array-and-back-in-javascript/50868276#50868276
	 * @memberof wb.string
	 * @param {string} Encoded string in hexadecimal
	 * @return {Uint8Array} Binary array buffer
	 */
	fromHexString: function( hexString ) {
		return hexString === null ? null : Uint8Array.from( hexString.match( /.{1,2}/g ).map( function( byte ) {
			return parseInt( byte, 16 );
		} ) );
	},

	/*
	 * Convert an ArrayBuffer into an hexadecimal string
	 * ref. https://stackoverflow.com/questions/38987784/how-to-convert-a-hexadecimal-string-to-uint8array-and-back-in-javascript/50868276#50868276
	 * @memberof wb.string
	 * @param {Uint8Array} Binary array buffer
	 * @return {string} Encoded string in hexadecimal
	 */
	toHexString: function( bytes ) {
		return bytes.reduce( function( str, byte ) {
			return str + byte.toString( 16 ).padStart( 2, "0" );
		}, "" );
	}

};

/*
 * A suite of date related functions for easier parsing of dates
 * @namespace wb.date
 */
wb.date = {

	/*
	 * Converts the date to a date-object. The input can be:
	 * <ul>
	 * <li>a Date object: returned without modification.</li>
	 * <li>an array: Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
	 * <li>a number: Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
	 * <li>a string: Any format supported by the javascript engine, like 'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.</li>
	 * <li>an object: Interpreted as an object with year, month and date attributes. **NOTE** month is 0-11.</li>
	 * </ul>
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue
	 * @return {Date | NaN}
	 */
	convert: function( dateValue ) {
		var dateConstructor = dateValue.constructor;

		switch ( dateConstructor ) {
			case Date:
				return dateConstructor;
			case Array:
				return new Date( dateValue[ 0 ], dateValue[ 1 ], dateValue[ 2 ] );
			case Number:
			case String:
				return new Date( dateValue );
			default:
				return typeof dateValue === "object" ? new Date( dateValue.year, dateValue.month, dateValue.date ) : NaN;
		}
	},

	/*
	 * Compares two dates (input can be any type supported by the convert function).
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue1
	 * @param {Date | number[] | number | string | object} dateValue2
	 * @return {number | NaN}
	 * @example returns
	 * -1 if dateValue1 < dateValue2
	 * 0 if dateValue1 = dateValue2
	 * 1 if dateValue1 > dateValue2
	 * NaN if dateValue1 or dateValue2 is an illegal date
	 */
	compare: function( dateValue1, dateValue2 ) {
		var convert = wb.date.convert;

		if ( isFinite( dateValue1 = convert( dateValue1 ).valueOf() ) && isFinite( dateValue2 = convert( dateValue2 ).valueOf() ) ) {
			return ( dateValue1 > dateValue2 ) - ( dateValue1 < dateValue2 );
		}
		return NaN;
	},

	/*
	 * Cross-browser safe way of translating a date to ISO format
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue
	 * @param {boolean} withTime Optional. Whether to include the time in the result, or just the date. False if blank.
	 * @return {string}
	 * @example
	 * toDateISO( new Date() )
	 * returns "2012-04-27"
	 * toDateISO( new Date(), true )
	 * returns "2012-04-27 13:46"
	 */
	toDateISO: function( dateValue, withTime ) {
		var date = wb.date.convert( dateValue ),
			pad = wb.string.pad;

		return date.getFullYear() + "-" + pad( date.getMonth() + 1, 2, "0" ) + "-" + pad( date.getDate(), 2, "0" ) +
			( withTime ? " " + pad( date.getHours(), 2, "0" ) + ":" + pad( date.getMinutes(), 2, "0" ) : "" );
	},

	/*
	 * Cross-browser safe way of creating a date object from a date string in ISO format
	 * @memberof wb.date
	 * @param {string} dateISO Date string in ISO format
	 * @return {Date}
	 */
	fromDateISO: function( dateISO ) {
		var date = null;

		if ( dateISO && /\d{4}-\d{2}-\d{2}/.test( dateISO ) ) {
			date = new Date( dateISO.substr( 0, 4 ), dateISO.substr( 5, 2 ) - 1, dateISO.substr( 8, 2 ), 0, 0, 0, 0 );
		}
		return date;
	}
};

/*
 * Returns a RFC4122 compliant Global Unique ID (GUID).
 * Originally from https://stackoverflow.com/a/2117523/455535
 */
wb.guid = function() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function( replacementChar ) {
		var rand = Math.random() * 16 | 0,
			newChar = replacementChar === "x" ? rand : ( rand & 0x3 | 0x8 );
		return newChar.toString( 16 );
	} );
};

wb.escapeAttribute = function( str ) {
	return str.replace( /'/g, "&#39;" ).replace( /"/g, "&#34;" );
};

/*
 * Returns an escaped HTML string
 */
wb.escapeHTML = function( str ) {
	return wb.escapeAttribute( str
		.replace( /&/g, "&#38;" )
		.replace( /</g, "&#60;" )
		.replace( />/g, "&#62;" ) );
};

/*
 * Returns a UTF-8 output from Base64
 * Reference: https://developer.mozilla.org/fr/docs/Glossary/Base64 (To be reviewed later because escape function is deprecated)
 */
wb.decodeUTF8Base64 = function( str ) {
	return decodeURIComponent( escape( atob( str ) ) );
};

/*
* Find most common Personal Identifiable Information (PII) in a string and return either the cleaned string either true/false
* @param {string} str (required) - the content that needs to be verified
*
* @param {boolean} scope - if true will scrub the content
* @param {object} (optional) the 2nd param (scope) can also be an object having the following properties (optional):
* 	{string} any key name of the default patterns e.g. email, digits, etc. with the value 1. The function will only scrub the content that match the regex of the default patterns passed in this object
* 	{regex} customCase - this param is a regex. It will search and replace the values corresponding that pattern
*
* @param {object} opts (optional) - the 3rd param of the function that can contain the following properties (optional):
* 	{boolean} isCustomExclusive - if true, it will scrub only the custom regex if the regex is the only property of the "scope" object
* 	{boolean} useFullBlock - if true, it will replace the scrubbed characters with the "█" symbol;
* 	{string} replaceWith - this string will replace the scrubbed content
*

* @return {string | true | false}
* @example
* wb.findPotentialPII( "email:test@test.com, phone:123 123 1234", true )
* returns "email:, phone:",
*
* wb.findPotentialPII( "email:test@test.com, phone:123 123 1234", false )
* returns true
*
* wb.findPotentialPII( "email:test@test.com, phone:123 123 1234", { email:1 }{ replaceWith: [REDACTED/CAVIARDÉ] } )
* returns "email:[REDACTED/CAVIARDÉ], phone:123 123 1234"
*
* wb.findPotentialPII( "email:test@test.com, phone:123 123 1234, numéro de cas 12345678", { "customCase":/\b(?:case[\s-]?number[\s\-\\.]?(?:\d{5,10}))|(?:numéro[\s-]?de[\s-]?cas[\s\-\\.]?(?:\d{5,10}))/ig }, { useFullBlock:1})
* returns "phone:████████████, email:█████████████, postalCode:██████, ██████████████████████"
*/
wb.findPotentialPII = function( str, scope, opts ) {
	if ( str && typeof str  !== "string" ) {
		return false;
	}
	var oRegEx = {

			/*
			* Digits:
			* 9 digits or more
			*/
			digits: /\d(?:[\s\-\\.\\/]?\d){8,}(?!\d)/ig,

			/*
			* Phone:
			* Any international phone number format
			*/
			phone: /\+?(\d{1,3})?[-._\s]?(\(?\d{3}\)?)[-._\s]?(\d{3})[-._\s]?(\d{4})/ig,

			/*
			* Passport:
			* 2 letters followed by either a " ", a "/", a ".", or a "-" any amount of times, followed by 6 digits
			*/
			passport: /\b[A-Za-z]{2}[\s\\.-]*?\d{6}\b/ig,

			/*
			* Email:
			* valid email format
			*/
			email: /\b(?:[a-zA-Z0-9_\-\\.]+)(?:@|%40|%2540)(?:[a-zA-Z0-9_\-\\.]+)\.(?:[a-zA-Z]{2,5})\b/ig,

			/*
			* Loose email:
			* email address that has one or more whitespaces before the "@" sign and either a "." or "," after the domain name
			*/
			looseEmail: /([a-zA-Z0-9_\-.]+)\s*@([\sa-zA-Z0-9_\-.]+)[.,]([a-zA-Z]{1,5})/g,

			/*
			* Loose email 2:
			* matches probable email format that the user tried to hide
			* any amount of letters, numbers, ".", "_", "%", "+", or "-", followed by 0 or 1 whitespace,
			* followed by "@", followed by 0 or 1 whitespace, followed by "gmail", "outlook", "hotmail", or "yahoo".
			*/
			looseEmail2: /([a-zA-Z0-9._%+-]+)\s?@\s?(gmail|outlook|icloud|hotmail|yahoo)(\s?\.?\s?(com|ca))?/ig,

			/*
			* Postal code:
			* valid Canadian postal code
			*/
			postalCode: /\b[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d\b/ig,

			/*
			* Username:
			* "username" or "user",
			* followed by a colon or an equals sign,
			* followed by any character that is not a " " or a "&"
			*/
			username: /(?:(username|user)[%20]?([:=]|(%EF%BC%9A))[^\s&]*)/ig,

			/*
			* Password:
			* "password" or "pass",
			* followed by a ":" or a "=",
			* followed by any character that is not a " " or a "&"
			*/
			password: /(?:(password|pass)[%20]?([:=]|(%EF%BC%9A))[^\s&]*)/ig
		},
		isFound = false,
		txtMarker = opts && opts.replaceWith ? opts.replaceWith : "",
		toClean = typeof scope === "object" ? true : scope,
		arMatchedStr,
		settings = opts || {},
		defaultSettings = {
			isCustomExclusive: false,
			useFullBlock: false,
			replaceWith: ""
		},
		isFullBlock = settings.useFullBlock || false,
		validatedScope = typeof scope === "object" ? {} : oRegEx;
	settings = $.extend( {}, defaultSettings, settings );

	if ( Object.keys( validatedScope ).length === 0 ) {
		if ( settings.isCustomExclusive ) {
			for ( var key in scope ) {
				if ( scope[ key ] instanceof RegExp ) {
					validatedScope[ key ] = scope[ key ];
				}
			}
		} else {
			if ( Object.keys( scope ).length === 1 && Object.values( scope )[ 0 ] instanceof RegExp ) {
				validatedScope = oRegEx;
				validatedScope[ Object.keys( scope )[ 0 ] ] = Object.values( scope )[ 0 ];
			} else {
				for ( var keyScope in scope ) {
					if ( Object.prototype.hasOwnProperty.call( oRegEx, keyScope ) ) {
						validatedScope [ keyScope ] = oRegEx [ keyScope ];
					} else {
						if ( scope[ keyScope ]  instanceof RegExp ) {
							validatedScope [ keyScope ] = scope [ keyScope ];
						}
					}
				}
			}
		}
	}

	for ( var valKey in validatedScope ) {
		arMatchedStr = str.match( validatedScope[ valKey ] );
		if ( arMatchedStr ) {
			isFound = true;
			if ( toClean ) {
				txtMarker = isFullBlock ? "█".repeat( arMatchedStr[ 0 ].length ) : txtMarker;
				str = str.replaceAll( validatedScope[ valKey ], txtMarker );
			}
		}
	}

	return toClean && isFound ? str : isFound;
};

} )( wb, window );

( function( $, undef ) {
"use strict";

var methods,
	settings = {
		"default": "wet-boew"
	};

methods = {

	init: function( options ) {
		return $.extend( settings, options || {} );
	},

	show: function( onlyAria ) {
		$( this ).each( function() {
			var $elm = $( this );
			$elm.attr( "aria-hidden", "false" );
			if ( onlyAria === undef ) {
				$elm.removeClass( "wb-inv" );
			}
		} );
	},

	hide: function( onlyAria ) {
		$( this )
			.each( function() {
				var $elm = $( this );
				$elm.attr( "aria-hidden", "true" );
				if ( onlyAria === undef ) {
					return $elm.addClass( "wb-inv" );
				}
			} );
	},

	toggle: function( to, from ) {
		$( this )
			.addClass( to )
			.removeClass( from );
	}
};

$.fn.wb = function( method ) {

	if ( methods[ method ] ) {
		methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
	} else if ( typeof method === "object" || !method ) {
		methods.init.apply( this, arguments );
	} else {
		$.error( "Method " + method + " does not exist on jquery.wb" );
	}
};

} )( jQuery );

/*
:focusable and :tabable jQuery helper expressions - https://github.com/jquery/jquery-ui/blob/24756a978a977d7abbef5e5bce403837a01d964f/ui/jquery.ui.core.js
*/
( function( $ ) {

"use strict";

function focusable( element, isTabIndexNotNaN, visibility ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase( );
	if ( nodeName === "area" ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase( ) !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[ 0 ];
		return !!img && visible( img );
	}
	if ( visibility ) {
		return ( /input|select|textarea|button|object|summary/.test( nodeName ) ? !element.disabled :
			nodeName === "a" ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN ) &&
		visible( element ); /* the element and all of its ancestors must be visible */
	} else {
		return ( /input|select|textarea|button|object|summary/.test( nodeName ) ? !element.disabled :
			nodeName === "a" ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN );
	}
}

function visible( element ) {
	return $.expr.filters.visible( element ) && !$( element )
		.parents( )
		.addBack( )
		.filter( function() {
			return $.css( this, "visibility" ) === "hidden";
		} )
		.length;
}

$.extend( $.expr.pseudos, {
	data: function( elem, index, match ) {
		return !!$.data( elem, match[ 3 ] );
	},
	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ), true );
	},
	discoverable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},
	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
} );

} )( jQuery );
