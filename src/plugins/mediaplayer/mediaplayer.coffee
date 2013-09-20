


do ($ = jQuery, window, document, vapour, undef = undefined) ->

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
	   t

	parse_time = (string) ->
	  seconds = 0
	  if string isnt undef
	    if string.substring(string.length - 1) is "s"

	      #offset-time
	      return parseFloat(string.substring(0, string.length - 1))
	    else

	      #clock time
	      parts = string.split(":").reverse()
	      p = 0
	      _plen = parts.length

	      while p < _plen
	        v = (if (p is 0) then parseFloat(parts[p]) else parseInt(parts[p], 10))
	        seconds += v * Math.pow(60, p)
	        p += 1
	      return seconds
	  -1


	expand = (elm, withPlayer)->
		$this = $(elm)
		$data = $this.data('properties')
		if withPlayer isnt undef
			$player = $data.player
			return [$this, $data, $player]
		else
			return [$this, $this.data('properties')]

	## caption tools ##

	parse_html = (content) ->
	    s = ".wet-boew-tt"
	    te = content.find(s)
	    captions = []
	    te.each ->
	      e = $(this)
	      begin = -1
	      end = -1
	      if e.attr("data-begin") isnt undef

	        #HTML5 captions (seperate attributes)
	        begin = parse_time(e.attr("data-begin"))
	        end = (if e.attr("data-end") isnt undef then parse_time(e.attr("data-end")) else parse_time(e.attr("data-dur")) + begin)
	      else if e.attr("data") isnt undef
	        json = e.attr("data")

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
		  s = "[begin]"
		  te = content.find(s)
		  captions = []
		  te.each ->
		    e = $(this)
		    begin = -1
		    end = -1
		    begin = parse_time(e.attr("begin"))
		    end = (if e.attr("end") isnt `undefined` then parse_time(e.attr("end")) else parse_time(e.attr("dur")) + begin)

		    #Removes nested captions if any
		    e = e.clone()
		    e.find(s).detach()
		    captions[captions.length] =
		      text: e.html()
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
		      eventObj = type: "wb.mediaplayer.captionsloaded"
		      if data.indexOf("<html") > -1
		        eventObj.captions = parse_html($(data))
		      else
		        eventObj.captions = parse_xml($(data))
		      $(elm).trigger eventObj

		    error: (response, textStatus, errorThrown) ->
		      $(elm).trigger
		        type: "captionsloadfailed"
		        error: errorThrown

	load_captions_internal = (elm,obj) ->
		  eventObj =
		    type: "wb.mediaplayer.captionsloaded"
		    captions: parse_html(obj)

		  $(elm).trigger eventObj


	update_captions = (area, seconds, captions) ->
		  area.empty()
		  c = 0
		  _clen = captions.length

		  while c < _clen
		    caption = captions[c]
		    area.append $("<div>" + caption.text + "</div>")  if seconds >= caption.begin and seconds <= caption.end
		    c += 1

	$document.on "wb.timerpoke", $selector , (event) ->
		window._timer.remove $selector
		# self broadcasting
		if (!$templatetriggered)
			$templatetriggered = true # we only want one call out
			$document.trigger
				type: "wb.ajax-fetch"
				element: $($selector) # lets broadcast to all elements we have the template
				fetch: "#{vapour.getPath('/assets')}/mediacontrol-#{$lang}.txt"

	$document.on "wb.ajax-fetched", $selector , (event) ->
		# ok this is our true init
		$this = $(@)
		$template = event.pointer.html()
		# store the template
		$this.data('template', $template)
		$this.trigger
			type: "wb.mediaplayer.init"

	$document.on "wb.mediaplayer.init", $selector , (event) ->
		$this = $(@)
		#ok lets set some variables
		$id= if $this.attr("id") isnt undef then $this.attr("id") else "wb-mediaplayer-#{$seed++}"
		$media= $this.children("audio, video").eq(0)
		$m_id= if $media.attr("id") isnt undef then $media.attr('id') else "#{$id}-media"
		$type = if $media.is('video') then 'video' else 'audio'
		$width = if $type is 'video' then $media.attr('width') else '0'
		$height = if $type is 'video' then $media.attr('height') else '0'

		data =
			id: $id
			media: $media
			m_id: $m_id
			type: $type
			height: $height
			width: $width
			object: ''

		$this.data('properties', data)
		# ok lets find out what we are playing and if we can play it
		if $media.get(0).error is null && $media.get(0).currentSrc isnt '' && $media.get(0).currentSrc isnt undef
			# ok we can play the media mentioned
			#return $this.trigger("wb.mediaplayer.#{$type}")
			return $this.trigger('wb.mediaplayer.fallback')
		else
			return $this.trigger('wb.mediaplayer.fallback')

		$.error "[web-boew] Mediaplayer :: error - mp003 :: Cannot play listed media"

	$document.on "wb.mediaplayer.fallback", $selector , (event) ->
		# play the fallback
		[$this, $data] = expand(@)
		$data.flashvars = 'id=' + $data.id
		$playerresource = vapour.getPath('/assets') + '/multimedia.swf?' + $data.flashvars
		$data.poster = ''
		if $data.type is 'video'
			$data.poster = '<img src="' + $data.media.attr("poster") + '" class="img-responsive" height="' + $data.height + '" width="' + $data.width + '" alt="' + $data.media.attr("title") + '"/>';
			$data.flashvars =  '&height=' + $data.media.height() + '&width=' + $data.media.width() + '&posterimg=' + encodeURI(vapour.getUrlParts($data.media.attr('poster')).absolute) + '&media=' + encodeURI(vapour.getUrlParts($data.media.find('source').filter('[type="video/mp4"]').attr('src')).absolute)
		else
			$data.flashvars = '&media=' + encodeURI(vapour.getUrlParts($data.media.find('source').filter('[type="audio/mp3"]').attr('src')).absolute)
		# add in objectstring
		$data.sObject = '<object id="' + $data.m_id + '" width="' + $data.width + '" height="' + $data.height + '" class="' + $data.type + '" type="application/x-shockwave-flash" data="' + $playerresource + '" tabindex="-1"><param name="movie" value="' + $playerresource + '"/><param name="flashvars" value="' + $data.flashvars + '"/><param name="allowScriptAccess" value="always"/><param name="bgcolor" value="#000000"/><param name="wmode" value="opaque"/>' + $data.poster + '</object>'
		# add in the new vars back to data
		$this.data('properties', $data)
		# trigger the renderevent
		$this.trigger "wb.mediaplayer.renderui"

	$document.on "wb.mediaplayer.video", $selector , (event) ->
		[$this, $data] = expand(@)


	$document.on "wb.mediaplayer.audio", $selector , (event) ->
    	[$this, $data] = expand(@)

    $document.on "wb.mediaplayer.renderui", $selector, (event)->
    	[$this, $data] = expand(@)
    	# lets get our template and start the output
    	$this.html(tmpl($this.data('template'), $data))
    	# lets bind the player object for our events	
    	$data.player = $("##{$data.m_id}").get(0)
    	$this.data('properties', $data)

    ###
	UI Bindings
    ###
	 $document.on "click", $selector, (e) ->
	   [$this, $data, $player] = expand(@,true)
	   $target = $(e.target)
	   console.log $player
	   return false if e.which is 2 or e.which is 3 # we only want left click
	   
	   if $target.hasClass("playpause") or $target.is('object') or $target.hasClass("wb-mm-overlay")
	      if $player.getPaused() is true
	         $player.play()
	      else
	         $player.pause()
	   if $target.hasClass("cc")
	       $player.setCaptionsVisible not $player.getCaptionsVisible()
	   if $target.hasClass("mute")
	       $player.setMuted not $player.getMuted()
	   if $target.is("progress") or $target.hasClass("wb-progress-inner") or $target.hasClass("wb-progress-outer")
	      p = (e.pageX - $target.offset().left) / $target.width()
	      $player.setCurrentTime $player.getDuration() * p
	   if $target.hasClass("rewind") or $target.hasClass("fastforward")
	      s = $player.getDuration() * 0.05
	      s *= -1  if $target.hasClass("rewind")
	      $player.setCurrentTime $player.getCurrentTime() + s
	   true


    #Map UI keyboard events
	$document.on "keydown", $selector, (e) ->
		  [$this, $data, $player] = expand(@, true)
		  v = 0
		  if (e.which is 32 or e.which is 13) and e.target is $player
		    $this.find(".wb-mm-controls .playpause").click()
		    return false
		  if e.keyCode is 37
		    $this.find(".wb-mm-controls .rewind").click()
		    return false
		  if e.keyCode is 39
		    $this.find(".wb-mm-controls .fastforward").click()
		    return false
		  if e.keyCode is 38
		    v = Math.round($player.getVolume() * 10) / 10 + 0.10
		    v = (if v < 1 then v else 1)
		    $player.setVolume v
		    return false
		  if e.keyCode is 40
		    v = Math.round($player.getVolume() * 10) / 10 - 0.1
		    v = (if v > 0 then v else 0)
		    $player.setVolume v
		    return false
		   true

    $document.on "wb.mediaplayer.loadcaptions", $selector, (event)->
    	[$this, $data] = expand(@)




	window._timer.add $selector
