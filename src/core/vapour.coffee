###
    WET-BOEW Vapour loader
###
###
 Lets establish the base path to be more flexiable in terms of WCMS where JS can reside in theme folders and not in the root of sites
###
((yepnope) ->
  yepnope.addPrefix "site", (resourceObj) ->
    _path = $('script[src$="vapour.js"],script[src$="vapour.min.js"]').last().prop("src").split('?')[0].split('/').slice(0, -1).join('/')
    resourceObj.url = _path +  "/" + resourceObj.url
    resourceObj

) yepnope
###
 Our Base timer for all event driven plugins
###
;window._timer =
  _elms: []
  _cache : [] # this is performace boast to allow for body targetting.

  add: (_rg) ->
    # simple init pattern to ensure body element is available to the window timer
    if @_cache.length < 1 then @_cache = $(document.body)
    # continue
    _obj = @_cache.find(_rg)
    @_elms.push _obj if (_obj.length > 0)
    undefined

  remove: (_rg) ->
    i = @_elms.length - 1

    while i >= 0
      @_elms.splice i, 1  if @_elms[i].selector is _rg
      i--
    undefined
  start : ()->
    #console.log "[PloyFills loaded lets start]"
    setInterval (->
      window._timer.touch()
    ), 500
    undefined
  touch: ->
    i = @_elms.length - 1

    while i >= 0
      #console.log(this._elms[i].text());
      @_elms[i].trigger "wb.timerpoke"
      i--
    undefined


# Using Modernizer to load the polyfills
;Modernizr.load [

        ## test for Canvas support
        test: Modernizr.canvas,
        nope: "site!polyfills/excanvas.min.js"
    ,
        test: Modernizr.details,
        nope: "site!polyfills/detailssummary.min.js"
    ,
        test: Modernizr.input.list,
        nope : "site!polyfills/datalist.min.js"
    ,
        test: Modernizr.inputtypes["range"],
        nope : "site!polyfills/slider.min.js"
    ,
        test: Modernizr.sessionstorage,
        nope : "site!polyfills/sessionstorage.min.js"
    ,
        test: Modernizr.progress,
        nope : "site!polyfills/progress.min.js"
    ,
        test: Modernizr.meter
        nope : "site!/polyfills/meter.min.js"
    ,
        test: Modernizr.localstorage,
        nope : "site!polyfills/sessionstorage.min.js"
    ,
        test: Modernizr.touch,
        yep : "site!polyfills/mobile.min.js"
    ,
        complete: ()->
            window._timer.start()
]
