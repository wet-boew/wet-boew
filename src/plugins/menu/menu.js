/*
    Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
    _plugin : Menu Plugin
    _author : World Wide Web
    _notes  : A Menu plugin for WET
    _licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
*/
(function ( $, window, vapour ) {

"use strict";

var $document = vapour.doc;

//Lets leverage JS assigment deconstruction to reduce the code output
var expand = function ( elment, scopeitems ) {
    var $elm = $( elment ),
        _elm = $elm.hasClass( "wb-menu" ) ? $elm.data() : $elm.parents( ".wb-menu" )
            .first()
            .data(),
        _items = scopeitems ? _elm.items.has( elment ) : _elm.items;
    return [ _elm.self, _elm.menu, _items, $elm ];
};


$document.on(
    "ajax-replace-loaded.wb mouseleave focusout select.wb increment.wb reset.wb display.wb",
    ".wb-menu", function ( event ) {

        var eventType = event.type,
            $container = $( this );

        switch ( eventType ) {
        case "ajax-replace-loaded":
            event.stopPropagation();

            //Some hooks for post transformation
            // - @data-post-remove : removes the space delimited class for the element. This is more a feature to fight the FOUC

            if ( $container.has( "[data-post-remove]" ) ) {
                $container.removeClass( $container.data( "post-remove" ) )
                    .removeAttr( "data-post-remove" );
            }

            var $menu = $container.find( ".menu :focusable" ),
                $items = $container.find( ".item" );

            $container.find( ":discoverable" )
                .attr( "tabindex", "-1" )
                .eq( 0 )
                .attr( "tabindex", "0" );

            $menu.filter( "[href^='#']" )
                .append( "<span class='expandicon'></span>" );

            $container.data( {
                "self": $container,
                "menu": $menu,
                "items": $items
            });

            return false;
        case "mouseleave":
        case "focusout":
            $container.trigger( "reset.wb" );
            break;
        case "select":
            event.stopPropagation();
            var $elm = event.goto;
            setTimeout( (function () {
                return $elm.focus();
            } ), 1);
            break;
        case "increment":
            event.stopPropagation();
            var $links = event.cnode,
                $next = event.current + event.increment,
                $index = $next;
            if ( $next >= $links.length ) {
                $index = 0;
            }
            if ( $next < 0 ) {
                $index = $links.length - 1;
            }
            $container.trigger( {
                type: "select.wb",
                goto: $links.eq( $index )
            } );
            break;
        case "reset":
            event.stopPropagation();
            $container.find( ".open" )
                .removeClass( "open" );
            $container.find( ".active" )
                .removeClass( "active" );
            break;
        case "display":
            event.stopPropagation();
            $container.trigger( {
                type: "reset.wb"
            } );
            $container.find( ".menu [href='" + event.ident + "']" )
                .addClass( "active" );
            $container.find( event.ident )
                .addClass( "open" );
            break;
        }

    } );
/*
Menu Keyboard bindings
*/

$document.on( "mouseover focusin", ".wb-menu .menu :focusable", function (
    event ) {

    event.stopPropagation();
    var _ref = expand( event.target ),
        $menu = _ref[ 1 ],
        $elm = _ref[ 3 ];

    $menu.trigger( "reset.wb" );
    if ( $elm.find( ".expandicon" ).length > 0 ) {
        $menu.trigger( {
            type: "display.wb",
            ident: $elm.attr( "href" )
        });
    }
});

$document.on( "keydown", ".wb-menu .menu", function ( event ) {

    event.stopPropagation();
    var _ref = expand( event.target ),
        $container = _ref[ 0 ],
        $menu = _ref[ 1 ],
        $items = _ref[ 2 ],
        $elm = _ref[ 3 ],
        $code = event.which,
        $index = $menu.index( $elm.get( 0 ) );

    switch ( $code ) {
    case 13:
    case 40:
        if ( $elm.find( ".expandicon" ).length > 0 ) {
            event.preventDefault();
            var $anchor = $elm.attr( "href" )
                .slice( 1 ),
                $goto = $items.filter( "[id='" + $anchor + "']" )
                    .find( ":discoverable" )
                    .first();

            $container.trigger( {
                type: "display.wb",
                ident: $elm.attr( "href" )
            })
                .trigger( {
                    type: "select.wb",
                    goto: $goto
                });
        }
        break;
    case 9:
        $container.trigger( {
            type: "reset.wb"
        });
        break;
    case 37:
        event.preventDefault();
        $container.trigger( {
            type: "increment.wb",
            cnode: $menu,
            increment: -1,
            current: $index
        } );
        break;
    case 39:
        event.preventDefault();
        $container.trigger( {
            type: "increment.wb",
            cnode: $menu,
            increment: 1,
            current: $index
        });
        break;
    }
} );
/*
 Item Keyboard bindings
*/

$document.on( "keydown", ".wb-menu .item", function ( event ) {

    event.stopPropagation();
    var _ref = expand( event.target, true ),
        $container = _ref[ 0 ],
        $menu = _ref[ 1 ],
        $items = _ref[ 2 ],
        $elm = _ref[ 3 ],
        $code = event.which,
        $links = $items.find( ":focusable" ),
        $index = $links.index( $elm.get( 0 ) );

    switch ( $code ) {
    case 27:
    case 37:
        event.preventDefault( );
        var $goto = $menu.filter( "[href='#" + $items.attr( "id" ) + "']" );
        $container.trigger( {
            type: "select.wb",
            goto: $goto
        } );
        break;
    case 38:
        event.preventDefault();
        $container.trigger( {
            type: "increment.wb",
            cnode: $links,
            increment: -1,
            current: $index
        } );
        break;
    case 40:
        event.preventDefault();
        $container.trigger( {
            type: "increment.wb",
            cnode: $links,
            increment: 1,
            current: $index
        } );
        break;
    }
});

})( jQuery, window, vapour );
