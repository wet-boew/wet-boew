###
 @plugin - Media player
 @todo - Captions code port
       - Youtube Chrome API hooks
###
do ($ = jQuery, window, document, vapour, undef = undefined) ->
	"use strict"
	### Local scoped variables ###
	$document = $(document)
	$selector = ".wet-boew-multimedia, .wb-multimedia"
	$seed = 0
	$templatetriggered= false
	$lang = document.documentElement.lang

	### helper functions ###
	format_time = (current) ->
		# local scoped helper function
		pad = (number, digits) ->
  			Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number

	  time = ""
	  current = Math.floor(current)
	  i = 2
	  while i >= 0
	    p = Math.pow(60, i)
	    c = Math.floor(current / p)
	    time += ":"  if time isnt ""
	    time += pad(c, 2)
	    current -= p * c
	    i -= 1
	   time

	parse_time = (timestring) ->
	  seconds = 0
	  if timestring isnt undef
	    if timestring.charAt(timestring.length - 1) is "s"

	      #offset-time
	      return parseFloat(timestring.substring(0, timestring.length - 1))
	    else

	      #clock time
	      parts = timestring.split(":").reverse()
	      p = 0
	      _plen = parts.length

	      while p < _plen
	        timestringportion = (if (p is 0) then parseFloat(parts[p]) else parseInt(parts[p], 10))
	        seconds += timestringportion * Math.pow(60, p)
	        p += 1
	      return seconds
	  -1


	expand = (elm, withPlayer)->
		$this = $(elm)
		$data = $this.data("properties")
		if withPlayer isnt undef
			$player = $data.player
			return [$this, $data, $player]
		else
			return [$this, $this.data("properties")]

	## caption tools ##

	parse_html = (content) ->
	    selector = ".wet-boew-tt"
	    te = content.find(selector)
	    captions = []
	    te.each ->
	      elm = $(this)
	      begin = -1
	      end = -1
	      if elm.attr("data-begin") isnt undef

	        #HTML5 captions (seperate attributes)
	        begin = parse_time(elm.attr("data-begin"))
	        end = (if elm.attr("data-end") isnt undef then parse_time(elm.attr("data-end")) else parse_time(elm.attr("data-dur")) + begin)
	      else if elm.attr("data") isnt undef
	        json = elm.attr("data") 

	        #Sanitze the JSON
	        json = json.replace(/(begin|dur|end)/g, "\"$1\"").replace(/'/g, "\"")
	        json = $.parseJSON(json)
	        begin = parse_time(json.begin)
	        end = (if json.end isnt `undefined` then parse_time(json.end) else parse_time(json.dur) + begin)

	      #Removes nested captions if any
	      e = e.clone()
	      e.find(s).detach()
	      captions[captions.length] =
	        text: e.html()
	        begin: begin
	        end: end

	    captions

	 parse_xml = (content) ->
		  selector = "[begin]"
		  te = content.find(selector)
		  captions = []
		  te.each ->
		    elm = $(this)
		    begin = -1
		    end = -1
		    begin = parse_time(elm.attr("begin"))
		    end = (if elm.attr("end") isnt undef then parse_time(elm.attr("end")) else parse_time(elm.attr("dur")) + begin)

		    #Removes nested captions if any
		    elm = e.clone()
		    elm.find(selector).detach()
		    captions[captions.length] =
		      text: elm.html()
		      begin: begin
		      end: end

		  captions

	load_captions_external = (elm,url) ->

		  $.ajax
		    url: url
		    context: evtmgr
		    dataType: "html"
		    dataFilter: (data) ->
		      data.replace /<img [^>]*>/g, "" #Remove images to prevent them from being loaded

		    success: (data) ->
		      eventObj = type: "captionsloaded.mediaplayer.wb"
		      if data.indexOf("<html") > -1
		        eventObj.captions = parse_html($(data))
		      else
		        eventObj.captions = parse_xml($(data))
		      $(elm).trigger eventObj

		    error: (response, textStatus, errorThrown) ->
		      $(elm).trigger
		        type: "captionsloadfailed.mediaplayer.wb"
		        error: errorThrown

	load_captions_internal = (elm,obj) ->
		  eventObj =
		    type: "captionsloaded.mediaplayer.wb"
		    captions: parse_html(obj)

		  $(elm).trigger eventObj


	update_captions = (area, seconds, captions) ->
		  area.empty()
		  counter = 0
		  _clen = captions.length

		  while counter < _clen
		    caption = captions[counter]
		    area.append $("<div>" + caption.text + "</div>")  if seconds >= caption.begin and seconds <= caption.end
		    counter += 1

	playerapi = (fn, args)->
		  switch fn
		   when 'play'
		    try
		     @object.play()
		    catch e
		     @object.doPlay()

		   when 'pause'
		    try
		     @object.pause()
		    catch e
		     @object.doPause()

		   when 'getCaptionsVisible'
		    $this = $(this)
		    $this.find(".wb-mm-captionsarea").is ":visible"

		   when 'setCaptionsVisible'
		    $this = $(this)
		    if args
		     $this.find(".wb-mm-captionsarea").show()
		    else
		     $this.find(".wb-mm-captionsarea").hide()
		    $this.trigger "captionsvisiblechange.mediaplayer.wb"

		   when 'setPreviousTime'
		     @object.previousTime = args

		   when 'setBuffering'
			    @object.buffering = args
		   else
		   	 prefix = fn.substr(0,3)
		   	 method = fn.substr(3)
		   	 method = method.substr(0,1).toLowerCase() + method.substr(1)
		   	 if prefix is 'get'
		     	(if typeof @object[method] isnt "function" then @object[method] else @object[method]())
		     else if prefix is 'set'
		     	(if typeof @object[method] isnt "function" then @object[method] = args else @object[fn](args))


	$document.on "timerpoke.wb", $selector , (event) ->
		window._timer.remove $selector
		# self broadcasting
		if (!$templatetriggered)
			$templatetriggered = true # we only want one call out
			$document.trigger
				type: "ajax-fetch.wb"
				element: $($selector) # lets broadcast to all elements we have the template
				fetch: "#{vapour.getPath('/assets')}/mediacontrol-#{$lang}.txt"

	$document.on "ajax-fetched.wb", $selector , (event) ->
		# ok this is our true init
		$this = $(@)
		$template = event.pointer.html()
		# store the template
		$this.data('template', $template)
		$this.trigger
			type: "init.mediaplayer.wb"

	$document.on "init.mediaplayer.wb", $selector , (event) ->
		$this = $(@)
		#ok lets set some variables
		$id= if $this.attr("id") isnt undef then $this.attr("id") else "wb-mediaplayer-#{$seed++}"
		$media= $this.children("audio, video").eq(0)
		$m_id= if $media.attr("id") isnt undef then $media.attr('id') else "#{$id}-media"
		$type = if $media.is("video") then "video" else "audio"
		$width = if $type is "video" then $media.attr("width") else "0"
		$height = if $type is "video" then $media.attr("height") else "0"
		$captions = if $media.children("track[kind='captions']") then $media.children("track[kind='captions']").attr("src") else undef
		#$.extend @, _intf
		data =
			id: $id
			media: $media
			m_id: $m_id
			type: $type
			height: $height
			width: $width
			object: ''

		if $media.attr("id") is undef
        	$media.attr "id", $m_id

		$this.data("properties", data)

		# ok lets find out what we are playing and if we can play it
		if $media.get(0).error is null && $media.get(0).currentSrc isnt '' && $media.get(0).currentSrc isnt undef
			# ok we can play the media mentioned
			return $this.trigger("#{$type}.mediaplayer.wb")
			#return $this.trigger('wb.mediaplayer.fallback')
		else
			return $this.trigger("fallback.mediaplayer.wb")

		$.error "[web-boew] Mediaplayer :: error - mp003 :: Cannot play listed media"

	$document.on "fallback.mediaplayer.wb", $selector , (event) ->
		# play the fallback
		[$this, $data] = expand(@)
		$data.flashvars = "id=" + $data.id
		$playerresource = vapour.getPath("/assets") + "/multimedia.swf?" + $data.flashvars
		$data.poster = ""
		if $data.type is "video"
			$data.poster = '<img src="' + $data.media.attr("poster") + '" class="img-responsive" height="' + $data.height + '" width="' + $data.width + '" alt="' + $data.media.attr("title") + '"/>';
			$data.flashvars =  '&height=' + $data.media.height() + '&width=' + $data.media.width() + '&posterimg=' + encodeURI(vapour.getUrlParts($data.media.attr("poster")).absolute) + '&media=' + encodeURI(vapour.getUrlParts($data.media.find('source').filter('[type="video/mp4"]').attr("src")).absolute)
		else
			$data.flashvars = '&media=' + encodeURI(vapour.getUrlParts($data.media.find("source").filter("[type='audio/mp3']").attr("src")).absolute)
		# add in objectstring
		$data.sObject = '<object id="' + $data.m_id + '" width="' + $data.width + '" height="' + $data.height + '" class="' + $data.type + '" type="application/x-shockwave-flash" data="' + $playerresource + '" tabindex="-1"><param name="movie" value="' + $playerresource + '"/><param name="flashvars" value="' + $data.flashvars + '"/><param name="allowScriptAccess" value="always"/><param name="bgcolor" value="#000000"/><param name="wmode" value="opaque"/>' + $data.poster + '</object>'
		# add in the new vars back to data
		$this.data("properties", $data)
		# trigger the renderevent
		$this.trigger "wb.mediaplayer.renderui"

	$document.on "video.mediaplayer.wb", $selector , (event) ->
		[$this, $data] = expand(@)
		$data.sObject = $data.media.wrap("<div />").parent().html()
		$data.poster = '<img src="' + $data.media.attr("poster") + '" class="img-responsive" height="' + $data.height + '" width="' + $data.width + '" alt="' + $data.media.attr("title") + '"/>'
		$this.data("properties", $data)
		$this.trigger "renderui.mediaplayer.wb"

	$document.on "audio.mediaplayer.wb", $selector , (event) ->
    	[$this, $data] = expand(@)

    $document.on "renderui.mediaplayer.wb", $selector, (event)->
    	[$this, $data] = expand(@)

    	# lets get our template and start the output
    	$this.html(tmpl($this.data("template"), $data))
    	# lets bind the player object for our events
    	$player = $("##{$data.m_id}")
    	$data.player = if $player.is("object") then $player.children(":first-child") else $player.load()
    	# HTML5 Non bubble event bug workaround - Event Proxy Pattern
    	$data.player.on "durationchange play pause ended volumechange timeupdate captionsloaded captionsloadfailed captionsvisiblechange waiting canplay progress", (e) ->
    		$this.trigger(e)
    	@object = $player.get(0)
    	@player = playerapi
    	$this.data("properties", $data)
    	### bind your events ###



    ###
	UI Bindings
    ###
	 $document.on "click", $selector, (e) ->
	   $target = $(e.target)
	   return false if e.which is 2 or e.which is 3 # we only want left click

	   if $target.hasClass("playpause") or $target.is("object") or $target.hasClass("wb-mm-overlay")
	      if @player("getPaused") is true
	         @player("play")
	      else
	      	 @player("pause")
	   if $target.hasClass("cc")
	       @player("setCaptionsVisible", not @player("getCaptionsVisible"))
	   if $target.hasClass("mute")
	       @player("setMuted", not @player("getMuted"))
	   if $target.is("progress") or $target.hasClass("wb-progress-inner") or $target.hasClass("wb-progress-outer")
	      p = (e.pageX - $target.offset().left) / $target.width()
	      @player("setCurrentTime", @player("getDuration") * p)
	   if $target.hasClass("rewind") or $target.hasClass("fastforward")
	      s = @player("getDuration") * 0.05
	      s *= -1  if $target.hasClass("rewind")
	      @player("setCurrentTime", @player("getCurrentTime") + s)
	   true


    #Map UI keyboard events
	$document.on "keydown", $selector, (e) ->
		  [$this, $data] = expand(@)
		  v = 0
		  if (e.which is 32 or e.which is 13) and e.target is @player
		    $this.find(".wb-mm-controls .playpause").click()
		    return false
		  if e.keyCode is 37
		    $this.find(".wb-mm-controls .rewind").click()
		    return false
		  if e.keyCode is 39
		    $this.find(".wb-mm-controls .fastforward").click()
		    return false
		  if e.keyCode is 38
		    v = Math.round(@player.getVolume() * 10) / 10 + 0.10
		    v = (if v < 1 then v else 1)
		    $player.setVolume v
		    return false
		  if e.keyCode is 40
		    v = Math.round(@player.getVolume() * 10) / 10 - 0.1
		    v = (if v > 0 then v else 0)
		    @player.setVolume v
		    return false
		   true


	# MEDIA Events
	$document.on "durationchange play pause ended volumechange timeupdate captionsloaded captionsloadfailed captionsvisiblechange waiting canplay progress", $selector, (e) ->
	  $w = $(this)

	  switch e.type
	    when "play"
	      @player("play")
	      b = $w.find(".playpause .glyphicon")
	      b.removeClass("glyphicon-play").addClass("glyphicon-pause").end().attr("title", b.data("state-off"))
	      $w.find(".wb-mm-overlay img").css("visibility", "hidden")
	      $w.find(".progress").addClass("active")
	    when "pause"
	      @player("pause")
	      b = $w.find(".playpause .glyphicon")
	      b.removeClass("glyphicon-pause").addClass("glyphicon-play").end().attr("title", b.data("state-on"))
	      $w.find(".progress").removeClass("active")

	    when "ended"
	      b = $w.find(".playpause .glyphicon")
	      b.removeClass("glyphicon-pause").addClass("glyphicon-play").end().attr("title", b.data("state-on"))
	      $w.find(".wb-mm-overlay").css("visibility", "show")

	    when "volumechange"
	      b = $w.find(".mute .glyphicon")
	      if @player("getMuted")
	      	b.removeClass("glyphicon-volume-up").addClass("glyphicon-volume-off").end().attr("title", b.data("state-on"))
	      else
	        b.removeClass("glyphicon-volume-off").addClass("glyphicon-volume-up").end().attr("title", b.data("state-off"))
	    when "timeupdate"
	      percentage = Math.round(@player("getCurrentTime") / @player("getDuration") * 1000) / 10
	      timeline = $w.find("progress")
	      timeline.attr("value", percentage)
	      $w.find(".wb-mm-timeline-current span:not(.wb-invisible)").text format_time(@player("getCurrentTime"))
	      #Update captions
	      update_captions $w.find(".wb-mm-captionsarea"), @player("getCurrentTime"), $.data(e.target, "captions")  if $.data(e.target, "captions") isnt undef
	    when "captionsloaded"
	      #Store the captions
	      $.data e.target, "captions", e.captions
	    when "captionsloadfailed"
	      $w.find(".wb-mm-captionsarea").append "<p>ERROR: WB0342</p>"
	    when "captionsvisiblechange"
	      b = $w.find(".cc .glyphicon")
	      if @player("getCaptionsVisible")
	        b.attr("title", b.data("state-on")).css("opacity", "1")

	      else
	        b.attr("title", b.data("state-off")).css("opacity", ".5")


    $document.on "loadcaptions.mediaplayer.wb", $selector, (event)->
    	[$this, $data] = expand(@)






	window._timer.add $selector
