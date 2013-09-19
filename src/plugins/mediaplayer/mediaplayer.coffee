


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


	$document.on "wb.timerpoke", $selector , (event) ->
		window._timer.remove $selector
		# self broadcasting
		console.log "#{vapour.getPath('/assets')}/mediacontrol-#{$lang}.txt"
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
		id= if $this.attr("id") isnt undef then $this.attr("id") else "wb-mediaplayer-#{$seed++}"
		$media= $this.children("audio, video").eq(0)
		media_id= if $media.attr("id") isnt undef then $media.attr('id') else "#{id}-media"
		$media_type= if $media.is("video") then "video" else "audio"
		width= if $media_type is "video" then $media.attr("width") else "0"
		height= if $media_type is "video" then $media.attr("height") else "0"
		captions= $media.children('track[kind="captions"]').attr("src")
		data = 
			id: id
			media: $media
			media_id: media_id
			media_type: $media_type
			width: width
			height: height
			captions: captions

		$this.data('properties', data)
		# ok lets find out what we are playing
		if data.media.get(0).nodeName.toLowerCase() is 'video'
			return $this.trigger('wb.mediaplayer.video')
		if data.media.get(0).nodeName.toLowerCase() is 'audio'
			return $this.trigger('wb.mediaplayer.audio')

		return $this.trigger('wb.mediaplayer.fallback')


		
	$document.on "wb.mediaplayer.fallback", $selector , (event) ->
		# play the fallback
		console.log "in fallback mode"

	$document.on "wb.mediaplayer.video", $selector , (event) ->
    	console.log "in HTML5 video mode"

    $document.on "wb.mediaplayer.audio", $selector , (event) ->
    	console.log "in HTLM5 audio mode"




	window._timer.add $selector
