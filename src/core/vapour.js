/*
    WET-BOEW Vapour loader
*/
/*
 Vapour Object that will store tombstone data for plugins to leverage
*/
( function ( $, window, document, undef ) {

"use strict";

var $src = $( "script[src$='vapour.js'],script[src$='vapour.min.js']" )
    .last( ),

    $homepath = $src.prop( "src" )
        .split( "?" )[ 0 ].split( "/" )
        .slice( 0, -1 )
        .join( "/" ),

    $mode = $src.prop( "src" )
        .indexOf( ".min" ) < 0 ? "" : ".min",

    vapour = {
        "/": $homepath,
        "/assets": "" + $homepath + "/assets",
        "/templates": "" + $homepath + "/assets/templates",
        "/deps": "" + $homepath + "/deps",
        "mode": $mode,
        "doc": $( document ),
        "win": $( window ),

        getPath: function ( prty ) {
            var res;
            res = this.hasOwnProperty( prty ) ? this[ prty ] : undef;
            return res;
        },

        getMode: function ( ) {
            return this.mode;
        },

        getUrlParts: function ( url ) {
            var a;
            a = document.createElement( "a" );
            a.href = url;
            return {
                href: a.href,
                absolute: a.href,
                host: a.host,
                hostname: a.hostname,
                port: a.port,
                pathname: a.pathname,
                protocol: a.protocol,
                hash: a.hash,
                search: a.search
            };
        }
    };

window.vapour = vapour;

})( jQuery, window, document );
/*
 Establish the base path to be more flexible in terms of WCMS where JS can reside in theme folders and not in the root of sites
*/
(function ( yepnope, vapour ) {

"use strict";

yepnope.addPrefix( "site", function ( resourceObj ) {
    var _path = vapour.getPath( "/" );
    resourceObj.url = _path + "/" + resourceObj.url;
    return resourceObj;
});

})( yepnope, vapour );
/*
 Modernizr Load call
 */
(function ( Modernizr, window, vapour ) {

"use strict";

//Our Base timer for all event driven plugins
window._timer = {
    _elms: [ ],
    _cache: [ ],

    add: function ( _rg ) {
        var _obj;
        if ( this._cache.length < 1 ) {
            this._cache = $( document.body );
        }
        _obj = this._cache.find( _rg );
        if ( _obj.length > 0 ) {
            this._elms.push( _obj );
        }
    },

    remove: function ( _rg ) {
        var i;
        i = this._elms.length - 1;
        while ( i >= 0 ) {
            if ( this._elms[ i ].selector === _rg ) {
                this._elms.splice( i, 1 );
            }
            i--;
        }
    },

    start: function ( ) {
        setInterval( function ( ) {
            window._timer.touch( );
        }, 500 );
    },

    touch: function ( ) {
        var i;
        i = this._elms.length - 1;
        while ( i >= 0 ) {
            this._elms[ i ].trigger( "timerpoke.wb" );
            i--;
        }
    }
};

/* ------- Modernizr Load call -----------*/

Modernizr.load( [{

    test: Modernizr.canvas,
    nope: "site!polyfills/excanvas" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.details,
    nope: "site!polyfills/detailssummary" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.input.list,
    nope: "site!polyfills/datalist" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.inputtypes.range,
    nope: "site!polyfills/slider" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.sessionstorage,
    nope: "site!polyfills/sessionstorage" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.progress,
    nope: "site!polyfills/progress" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.meter,
    nope: "site!/polyfills/meter" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.localstorage,
    nope: "site!polyfills/sessionstorage" + ( vapour.getMode() ) + ".js"
}, {

    test: Modernizr.touch,
    yep: "site!polyfills/mobile" + ( vapour.getMode() ) + ".js"
}, {

    test: navigator.userAgent.indexOf( "Win" ) !== -1 && navigator.userAgent.match(
        /^((?!mobi|tablet).)*$/i ) !== null,
    yep: "site!polyfills/jawsariafixes" + ( vapour.getMode() ) + ".js"
}, {

    load: "site!i18n/" + document.documentElement.lang + ".js",
    complete: function () {
        window._timer.start();
    }
}]);

})( Modernizr, window, vapour );
