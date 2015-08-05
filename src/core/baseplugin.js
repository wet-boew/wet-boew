( function( $, window, wb ) {
  "use strict";

  wb.BasePlugin = Base.extend({
    componentName: "wb-base",
    idCount: 0,
    initialized: false,
    deps: [],

    constructor: function() {
      this.selector =  "." + this.componentName;
      this.initEvent = "wb-init" + this.selector;
      wb.add( this.selector );
      wb.doc.on( "timerpoke.wb " + this.initEvent, this.selector, $.proxy( this.baseinit, this ) );
      console.log(this.selector)
    },

    init: function ( elm ) {},

    i18n: function ( i18n ) {
      return {}
    },

    initonce: function() {

    },

    basereadyinit: function ( elmId ) {
      if ( !this.initialized ) {
        this.initonce();
      }

      if ( elmId ) {
        var elm = document.getElementById( elmId );

        if (elm) {
          this.init( elm );
        }
      }

      this.initialized = true;
      wb.ready( elm ? $( elm ) : undefined, this.componentName );
    },

    setup: function ( elmId ) {
      if ( !this.i18nText ) {
        this.i18nText = this.i18n(wb.i18n);
      }

      Modernizr.load( {
        load: this.deps,
        complete: $.proxy( this.basereadyinit, this, elmId )
      } );
    },

    baseinit: function( event ) {
      var elm = wb.init( event, this.componentName, this.selector ), elmId;
      if ( elm ) {
        elmId = elm.id;

        if ( !elmId ) {
          elmId = this.componentName + "-id-" + this.idCount;
          this.idCount += 1;
          elm.id = elmId;
        }

        this.setup( elmId )
      }
    }
  });
} )( jQuery, window, wb );
