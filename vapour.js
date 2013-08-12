/*
    WET-BOEW Vapour loader
*/

/*
 Lets establish the base path to be more flexiable in terms of WCMS where JS can reside in theme folders and not in the root of sites
*/

(function(yepnope) {
  return yepnope.addPrefix("site", function(resourceObj) {
    var _path;
    _path = $('script[src$="vapour.js"],script[src$="vapour.min.js"]').last().prop("src").split('?')[0].split('/').slice(0, -1).join('/');
    resourceObj.url = _path + "/" + resourceObj.url;
    return resourceObj;
  });
})(this.yepnope);

/*
 Our Base timer for all event driven plugins
*/


window._timer = {
  _elms: [],
  _cache: $('body'),
  add: function(_rg) {
    var _obj;
    _obj = this._cache.find(_rg);
    if (_obj.length > 0) {
      this._elms.push(_obj);
    } 
    return void 0;
  },
  remove: function(_rg) {
    var i;
    i = this._elms.length - 1;
    while (i >= 0) {
      if (this._elms[i].selector === _rg) {
        this._elms.splice(i, 1);
      }
      i--;
    }
    return void 0;
  },
  start: function() {
    setInterval((function() {
      return window._timer.touch();
    }), 500);
    return void 0;
  },
  touch: function() {
    var i;
    i = this._elms.length - 1;
    while (i >= 0) {
      this._elms[i].trigger("wb.timerpoke");
      i--;
    }
    return void 0;
  }
};

/*Modernizr.load([
  {
    test: Modernizr.canvas,
    nope: ""
  }, {
    test: Modernizr.input.list,
    nope: ""
  }, {
    test: Modernizr.inputtypes["range"],
    nope: ""
  }, {
    test: Modernizr.sessionstorage,
    nope: ""
  }, {
    test: Modernizr.progress,
    nope: ""
  }, {
    test: Modernizr.meter,
    nope: ""
  }, {
    test: Modernizr.localstorage,
    nope: ""
  }, {
    test: Modernizr.lastchild,
    nope: ""
  }, {
    complete: function() {
      return window._timer.start();
    }
  }
]);*/

$(document).ready(function(){
window._timer.start();
});