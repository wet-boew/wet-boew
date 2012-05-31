/*!
 * Multimedia player v1.3 / Lecteur multimédia v1.3
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/**
 * @name : Multimedia Player Plugin
 * @author : Government of Canada 
 */

var pe = PE;
 
/*
  * Load helper libraries
  */
PE.load('multimedia/wet-boew.captions.js');
PE.load('multimedia/wet-boew.loadcaptions.js');
PE.load('jquery.template.js');

PE.triggermediaevent = function(id, event, test){
    var o = $("#" + id).find("object :first-child").trigger(event);
}

Utils.addCSSSupportFile(Utils.getSupportPath() + '/multimedia/themes/default/style.css');


(function($){
    var player = {
        dictionary : {
            play : (PE.language === 'eng') ? "Play " : "Démarrer ",
            pause : "Pause ",
            closewindow : (PE.language === 'eng') ? "Close" : "Fermer",
            rewind : (PE.language === 'eng') ? "Rewind " : "Reculer ",
            fastforward : (PE.language === 'eng') ? "Fast forward " : "Avancer ",
            mute_on: (PE.language === 'eng') ? "Unmute" : "Désactiver le mode muet",
            mute_off: (PE.language === 'eng') ? "Mute" : "Activer le mode muet",
            closedcaptions_on: (PE.language === 'eng') ? "Hide Closed captioning " : "Masquer le sous-titrage ",
            closedcaptions_off: (PE.language === 'eng') ? "Show Closed captioning" : "Afficher le sous-titrage ",
            audiodescription_on: (PE.language === 'eng') ? "Disable Audio Description " : "Désactiver l'audiodescription ",
            audiodescription_off: (PE.language === 'eng') ? "Enable Audio Description" : "Activer l'audiodescription ",
            novideo : (PE.language === 'eng') ? "Your browser does not appear to have the capabilities to play this video, please download the video below":
            "Votre navigateur ne semble pas avoir les capacité nécessaires pour lire cette vidéo, s'il vous plaît télécharger la vidéo ci-dessous",
            position: (PE.language === 'eng') ? "Current Position: " : "Position actuelle : ",
            duration: (PE.language === 'eng') ? "Total Time: " : "Temps total : ",
            buffered: (PE.language === 'eng') ? "Buffered: " : "Mis en mémoire-tampon : ",
            captionserror: (PE.language === 'eng') ? "Error loading captions" : "Erreur dans le chargement des sous-titres"
        },

        icons : {
            background : Utils.getSupportPath() + '/multimedia/themes/default/images/background-toolbar.png',
            play: Utils.getSupportPath() + '/multimedia/themes/default/images/play-control.png',
            pause : Utils.getSupportPath() + '/multimedia/themes/default/images/pause-control.png',
            rewind : Utils.getSupportPath() + '/multimedia/themes/default/images/rewind-control.png',
            fastforward : Utils.getSupportPath() + '/multimedia/themes/default/images/fastforward-control.png',
            closedcaptions_off : Utils.getSupportPath() + '/multimedia/themes/default/images/cc-off-control.png',
            closedcaptions_on : Utils.getSupportPath() + '/multimedia/themes/default/images/cc-on-control.png',
            audiodescription_off : Utils.getSupportPath() + '/multimedia/themes/default/images/descriptive-off-control.png',
            audiodescription_on : Utils.getSupportPath() + '/multimedia/themes/default/images/descriptive-on-control.png',
            mute_on : Utils.getSupportPath() + '/multimedia/themes/default/images/mute-control.png',
            mute_off : Utils.getSupportPath() + '/multimedia/themes/default/images/sound-control.png'
			
        //Utils.getSupportPath() + '/multimedia/themes/default/images/play-button-overlay.png'
        },
		
        intf : {
            /* Methods */
            play: function(){
                this.object.play();
            },
            pause: function(){
                this.object.pause();
            },
			
            /*Properties*/
            getPaused: function(){
                return (typeof(this.object.paused) !== "function" ? this.object.paused : this.object.paused());
            },
			
            getPlayed: function(){
                return (typeof(this.object.played) !== "function" ? this.object.played : this.object.played());
            },
			
            getEnded: function(){
                return (typeof(this.object.ended) !== "function" ? this.object.ended : this.object.ended());
            },
			
            getSeeking: function(){
                return (typeof(this.object.seeking) !== "function" ? this.object.seeking : this.object.seeking());
            },
			
            getDuration: function(){
                return (typeof(this.object.duration) !== "function" ? this.object.duration : this.object.duration());
            },
			
            getBuffered: function(){
                return (typeof(this.object.buffered) !== "function" ? (this.object.buffered.length > 0 ? this.object.buffered.end(0) : 0) : this.object.buffered());
            },
			
            getCurrentTime: function(){
                return (typeof(this.object.currentTime) !== "function" ? this.object.currentTime : this.object.currentTime());
            },
			
            setCurrentTime: function(t){
               this.object.pause !== undefined ? this.object.currentTime = t : this.object.setCurrentTime(t);
            },
			
            getCaptionsVisible: function(){
                return $(this).parent().find(".wet-boew-mediaplayer-captionsarea").is(":visible");
            },
			
            setCaptionsVisible : function(v){
                if (v){
                    $(this).parent().find(".wet-boew-mediaplayer-captionsarea").show();
                    $(this.object).trigger("captionsshown");
                }else{
                    $(this).parent().find(".wet-boew-mediaplayer-captionsarea").hide();
                    $(this.object).trigger("captionshidden");
                }
            },
			
            getMuted : function(){
                return (typeof(this.object.muted) !== "function" ? this.object.muted : this.object.muted());
            },
			
            setMuted : function(m){
                this.object.muted !== undefined ? this.object.muted = m : this.object.setMuted(m);
            },
			
            getVolume : function(){
                return (typeof(this.object.volume) !== "function" ? this.object.volume : this.object.volume());
            },
			
            setVolume : function(v){
                this.object.volume !== undefined ?  this.object.volume = v : this.object.setVolume(v);
            }
        }
    }
 
    $.fn.mediaPlayer = function(index) {
        $media = this;
        $wrapper = $media.wrap("<div class=\"wet-boew-mediaplayer\" />").parent();
		
        var id;
        //Add an id if an id is missing
        if ($wrapper.attr("id") !== undefined){
            id = $wrapper.attr("id");
        }else{
            id = "wet-boew-mediaplayer" + index;
            $wrapper.attr("id", id);
        }
        
        //TODO: Bring back the properties object
        var properties = {
            captions: $media.find("track[kind=\"captions\"]").attr("src"),
            captionstype: $media.find("track[kind=\"captions\"]").attr("data-type")
        }

        //Fallback
        var canPlay = true;
        if ($media.get(0).currentSrc == "" || $media.get(0).currentSrc == undefined){
            //No nativly supported format provided, trying Flash fallback
            //TODO:Add Flash detection
            flash = true;
            
            var fbVideoType = "video/mp4";
            var fbAudioType = "audio/mpeg"; //MP3
            
            var canFB = false;
            var $fbObject = $("<object type=\"application/x-shockwave-flash\" data=\"" + Utils.getSupportPath() + "/multimedia/mp-jm.swf\" tabindex=\"-1\"></object>");
            var $fbVars = $("<param name=\"flashvars\" value=\"id=" + $wrapper.attr("id") +"\"/>");
            $fbObject.append($fbVars);
            if (flash && $media.is("video") && $media.find("source[type=\"" + fbVideoType + "\"]")){
                $fbObject.addClass("video");
                $fbObject.attr("width", $media.width()).attr("height", $media.height());
                $fbObject.append("<param value=\"always\" name=\"allowScriptAccess\"><param value=\"#000000\" name=\"bgcolor\"><param value=\"opaque\" name=\"wmode\">");
                $fbVars.attr("value", $fbVars.attr("value") + "&height=" + $media.height() + "&width=" + $media.width() + "&posterimg=" + escape($media.attr("poster")) + "&media=" + PE.url($media.find("source[type=\"" + fbVideoType + "\"]").attr("src")).absolute);
                canFB = true;
            }else if (flash && $media.is("audio") && $media.find("source[type=\"" + fbAudioType + "\"]")){
                $fbObject.addClass("audio");
                $fbVars.attr("value", $fbVars.attr("value") + "&media=" + PE.url($media.find("source[type=\"" + fbAudioType + "\"]").attr("src")).absolute);
                $fbObject.append($fbVars);
                canFB = true;
            }else{
                //TODO: Display when no HTML5 video or Flash
                canPlay = false;
            }
            
            if (canFB){               
                $media.before($fbObject);
                $media.remove();
                $media = $fbObject;
            }
        }
        
        if (canPlay){
            var ht_ml = "\n<!-- Autogenerated code by mediaplayer plugin -->\n\n";
            // Add the tool bar
            ht_ml += '<div class="wet-boew-toolbar">'
            + '<div class="wet-boew-controls-start">'
            + '<button type="button" id="${jsId}RewindButton" class="wet-boew-button rewind" title="${dictionary.rewind}" aria-controls="${jsId}"><img src="${icons.rewind}" alt="${dictionary.rewind}" /></button>'
            + '<button type="button" id="${jsId}PlayStopButton" class="wet-boew-button playpause" title="${dictionary.play}" aria-controls="${jsId}"><img src="${icons.play}" alt="${dictionary.play}" /></button>'
            + '<button type="button" id="${jsId}FastForwardButton" class="wet-boew-button fastforward" title="${dictionary.fastforward}" aria-controls="${jsId}"><img src="${icons.fastforward}" alt="${dictionary.fastforward}" /></button>'
            + '</div><div class="wet-boew-controls-middle">'
            + '<div class="wet-boew-mediaplayer-timeline" tabindex="0"><div class="outer"><div class="inner"></div></div></div>'
            + '</div><div class="wet-boew-controls-end">'
            //+ (properties.audiodescription != "" ? '<button type="button" id="${jsId}AudioDescriptionOnOffButton" class="wet-boew-button" title="${dictionary.audiodescription_off}" aria-controls="${jsId}"><img src="${icons.audiodescription_off}" alt="${dictionary.audiodescription_off}" /></button>' : '')
            + '<button type="button" id="${jsId}CaptionOnOffButton" class="wet-boew-button cc" title="${dictionary.closedcaptions_off}" aria-controls="${jsId}"><img src="${icons.closedcaptions_off}" alt="${dictionary.closedcaptions_off}" /></button>'
            + '<button type="button" id="${jsId}MuteUnmuteButton" class="wet-boew-button ui-button-last mute" title="${dictionary.mute_off}" aria-controls="${jsId}"><img src="${icons.mute_off}" alt="${dictionary.mute_off}" /></button>'
            + '</div></div>';

            ht_ml = ht_ml + "\n\n<!-- End of Autogenerated code by mediaplayer plugin -->\n";
            // Cache the complete object code and into the Template
            $.template("mpmarkup", ht_ml);
            var template = $.extend({id : id}, player);
            var $ctrls = $.tmpl('mpmarkup', template);
            $wrapper.append($ctrls);
            $ctrls.find(".wet-boew-mediaplayer-timeline").css("margin-left", $ctrls.find(".wet-boew-controls-start").width() + 5).css("margin-right", $ctrls.find(".wet-boew-controls-end").width() + 5);
            
            //Add captions and resize functionality for video only
            if ($media.is("video, .video")){
                /*$(window).resize({video:video}, $.proxy(function(e) {
                    var ratio = e.data.video.width() / e.data.video.height();
                    var newWidth = $(this).children("img.wet-boew-mediaplayer-poster").width();
                    video.width(newWidth).height(newWidth / ratio);
                }, $this));*/
                
                var $captionArea = $("<div class=\"wet-boew-mediaplayer-captionsarea\" style=\"display:none\"></div>");
                $media.loadcaptions(properties.captions);
                $media.after($captionArea);
            }

            //Add the interface
            $.extend($wrapper.get(0), {object: $media.get(0)}, player.intf);

            //Map UI mouse events
            $wrapper.on("click",function(e){
                $target = $(e.target);
                if ($target.hasClass("playpause") || e.target == this.object){
                    if (this.getPaused() === true){
                        this.play();
                    }else{
                        this.pause();
                    }
                };

                if ($target.hasClass("cc")){
                    this.setCaptionsVisible(!this.getCaptionsVisible());
                }

                if ($target.hasClass("mute")){
                    this.setMuted(!this.getMuted());
                }

                if ($target.hasClass("wet-boew-mediaplayer-timeline") || $target.parent().is(".wet-boew-mediaplayer-timeline")){
                    var t = $(this).find(".wet-boew-mediaplayer-timeline");
                    var p = (e.pageX - t.offset().left) / t.width();
                    this.setCurrentTime(this.getDuration() * p);
                }

                if ($target.hasClass("rewind") || $target.hasClass("fastforward")){
                    var s = this.getDuration() * 0.05;
                    if ($target.hasClass("rewind"))s*=-1;
                    this.setCurrentTime(this.getCurrentTime() + s);
                }
            })

            //Map UI keyboard events
            $wrapper.on("keypress", function(e){
                $target = $(e.target);
                $w = $(this);
                if ((e.which == 32 || e.which == 13) && e.target == this.object){
                    $w.find(".wet-boew-button.playpause").click();
                    return false;
                }
                if (e.keyCode == 37){
                    $w.find(".wet-boew-button.rewind").click();
                    return false;
                }
                if (e.keyCode == 39){
                    $w.find(".wet-boew-button.fastforward").click();
                    return false;
                }
                if (e.keyCode == 38){
                    var v = Math.round(this.getVolume() * 10)/10 + 0.1; 
                    v = v < 1 ? v : 1;
                    this.setVolume(v);
                    return false;
                }
                if (e.keyCode == 40){
                    var v = Math.round(this.getVolume() * 10)/10 - 0.1; 
                    v = v > 0 ? v : 0;
                    this.setVolume(v);
                    return false;
                }
            })

            //Map media events (For flash, must use other element than object because it doesn't trigger or recieve events)
            var evtmgr = $media.is("object") ? $media.children(":first-child"): $media;
            evtmgr.on("loadeddata progress timeupdate seeked canplay play volumechange pause ended captionsloaded captionsloadfailed captionsshown captionshidden", $.proxy(function(e){
                $w = $(this);
                switch (e.type){
                    case "play":
                        var $button = $w.find(".wet-boew-button.playpause").attr('title', player.dictionary.pause);
                        $button.children("img").attr("alt", player.dictionary.pause).attr("src", player.icons.pause);
                        break;
                    case "pause":
                        var $button = $w.find(".wet-boew-button.playpause").attr('title', player.dictionary.play);
                        $button.children("img").attr("alt", player.dictionary.play).attr("src", player.icons.play);
                        break;
                    case "volumechange":
                        if (this.getMuted() || this.getVolume() === 0){
                            var $button = $w.find(".wet-boew-button.mute").attr('title', player.dictionary.mute_on);
                            $button.children("img").attr("alt", player.dictionary.mute_on).attr("src", player.icons.mute_on);
                        }else{
                            var $button = $w.find(".wet-boew-button.mute").attr('title', player.dictionary.mute_off);
                            $button.children("img").attr("alt", player.dictionary.mute_off).attr("src", player.icons.mute_off);
                        }
                        break;
                    case "timeupdate":
                        var w = Math.round(this.getCurrentTime()/ this.getDuration() * 10000)/100 + "%";
                        var o = $w.find(".wet-boew-mediaplayer-timeline").children("div").stop();
                        if (this.getSeeking()){
                            o.css("width", w);
                        }else{
                            o.animate({width: w},150, "linear");
                        }
                        break;
                    case "progress":
                        /*if (this.getBuffered() > 1)
                            console.log(Math.round(this.getBuffered()/ this.getDuration() * 1000)/10);*/
                        break;
                    case "captionsloaded":
                        $(e.target).captions($w.find(".wet-boew-mediaplayer-captionsarea"), e.captions);
                        break;
                    case "captionsloadfailed":
                        $w.find(".wet-boew-mediaplayer-captionsarea").empty().append("<p>" + player.dictionary.captionserror + "</p>");
                        break;
                    case "captionsshown":
                        var $button = $w.find(".wet-boew-button.cc").attr('title', player.dictionary.closedcaptions_on);
                        $button.children("img").attr("alt", player.dictionary.closedcaptions_on).attr("src", player.icons.closedcaptions_on);
                        break
                    case "captionshidden":
                        var $button = $w.find(".wet-boew-button.cc").attr('title', player.dictionary.closedcaptions_off);
                        $button.children("img").attr("alt", player.dictionary.closedcaptions_off).attr("src", player.icons.closedcaptions_off);
                        break;
                }
            }, $wrapper.get(0)));
        }

        return $media;
    };
	 

    $(document).ready( function(){
        // Load the mediaplayer
        $('audio, video').each(function(index){
            $(this).mediaPlayer(index);
        });
    });
})( jQuery );