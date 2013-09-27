/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Ajax Fetch [ ajax-fetch ]
    _author : World Wide Web
    _notes  : A basic AjaxLoader wrapper for WET-BOEW that appends to elements
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/

(function ( $, window, vapour ) {

"use strict";

$.ajaxSettings.cache = false;

var $document = vapour.doc,
    generateSerial;
    
generateSerial = function ( len ) { //internal core functions

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
        string_length = len,
        randomstring = "",
        counter = 0,
        letterOrNumber,
        newNum,
        rnum;

    while ( counter < string_length ) {
        letterOrNumber = Math.floor( Math.random( ) * 2 );
        if ( letterOrNumber === 0 ) {
            newNum = Math.floor( Math.random( ) * 9 );
            randomstring += newNum;
        }
        else {
            rnum = Math.floor( Math.random( ) * chars.length );
            randomstring += chars.substring( rnum, rnum + 1 );
        }
        counter++;
    }
    return randomstring;
};

//Event binding
$document.on( "ajax-fetch.wb", function ( event ) {
    var _caller = event.element,
        _url = event.fetch,
        _id = "wb" + ( generateSerial( 8 ) );

    $( "<div id='" + _id + "' />" )
        .load( _url, function () {
            $( _caller )
                .trigger( {
                    type: "ajax-fetched.wb",
                    pointer: $( this )
                } );
        } );

});

})( jQuery, window, vapour );
