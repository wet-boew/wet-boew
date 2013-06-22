/*! Unobtrusive Slider Control / HTML5 Input Range polyfill - MIT/GPL2 @freqdec */
/*jshint sub:true, evil:true, boss:true */
var fdSlider = (function() {
    var sliders           = {},
        uniqueid          = 0,
        mouseWheelEnabled = true,
        fullARIA          = true,
        describedBy       = "fd-slider-describedby",
        varSetRules       = {
            onfocus:true,
            onvalue:true
        },
        noRangeBar        = false,
        html5Animation    = "jump",
        useDOMAttrModEvt  = false,
        isOpera           = Object.prototype.toString.call(window.opera) === "[object Opera]",
        fpRegExp          = /^([\-]{0,1}[0-9]+(\.[0-9]+){0,1})$/,
        stepRegExp        = /^([0-9]+(\.[0-9]+){0,1})$/;

    var parseJSON = function(str) {
        if(typeof str !== "string" || str === "") {
            return {};
        }
        try {
            // Does a JSON (native or not) Object exist
            if(typeof JSON === "object" && typeof(JSON.parse) === "function") {
                return JSON.parse(str);
            // Genious code taken from: http://kentbrewster.com/badges/
            } else if(/mousewheelenabled|fullaria|describedby|norangebar|html5animation|varsetrules/.test(str.toLowerCase())) {
                var f = Function(['var document,top,self,window,parent,Number,Date,Object,Function,',
                    'Array,String,Math,RegExp,Image,ActiveXObject;',
                    'return (' , str.replace(/<\!--.+-->/gim,'').replace(/\bfunction\b/g,'function-') , ');'].join(''));
                return f();
            }
        } catch (e) { }

        return {"err":"Could not parse the JSON object"};
    };

    var affectJSON = function(json) {
        if(typeof json !== "object") {
            return;
        }
        for(var key in json) {
            value = json[key];
            switch(key.toLowerCase()) {
                case "mousewheelenabled":
                    mouseWheelEnabled = !!value;
                    break;
                case "fullaria":
                    fullARIA = !!value;
                    break;
                case "describedby":
                    describedBy = String(value);
                    break;
                case "norangebar":
                    noRangeBar = !!value;
                    break;
                case "html5animation":
                    html5Animation = String(value).search(/^(jump|tween|timed)$/i) != -1 ? String(value).toLowerCase() : "jump";
                    break;
                case "watchattributes":
                    useDOMAttrModEvt = !!value;
                    break;
                case "varsetrules":
                    if("onfocus" in value) {
                        varSetRules.onfocus = !!value.onfocus;
                    }
                    if("onvalue" in value) {
                        varSetRules.onvalue = !!value.onvalue;
                    }
                    break;
            }
        }
    };
    var addEvent = function(obj, type, fn) {
        if(obj.addEventListener) {
            obj.addEventListener(type, fn, true);
        } else if(obj.attachEvent) {
            obj.attachEvent("on"+type, fn);
        }
    };
    var removeEvent = function(obj, type, fn) {
        try {
            if(obj.removeEventListener) {
                obj.removeEventListener(type, fn, true);
            } else if(obj.detachEvent) {
                obj.detachEvent("on"+type, fn);
            }
        } catch(err) {}
    };
    var stopEvent = function(e) {
        e = e || window.event;
        if(e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }

        /*@cc_on@*/
        /*@if(@_win32)
        e.cancelBubble = true;
        e.returnValue = false;
        /*@end@*/

        return false;
    };
    var preventDefault = function(e) {
        e = e || window.event;
        if(e.preventDefault) {
            e.preventDefault();
            return;
        }
        e.returnValue = false;
    };
    // Add/Remove classname utility functions
    var addClass = function(e,c) {
        if(new RegExp("(^|\\s)" + c + "(\\s|$)").test(e.className)) {
            return;
        }
        e.className += ( e.className ? " " : "" ) + c;
    };
    var removeClass = function(e,c) {
        e.className = !c ? "" : e.className.replace(new RegExp("(^|\\s)" + c + "(\\s|$)"), " ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
    // Returns an Object of key value pairs indicating which sliders have values
    // that have been "set" by the user. Normally used within form validation code
    var getValueSet = function() {
        var obj = {};
        for(var id in sliders) {
            obj[id] = sliders[id].getValueSet();
        }
        return obj;
    };
    // Sets the valueSet variable for a specific slider
    var setValueSet = function(sliderId, tf) {
        sliders[sliderId].setValueSet(!!tf);
    };
    // Does the slider exist in memory
    var sliderExists = function(slider) {
        return !!(slider in sliders && sliders.hasOwnProperty(slider));
    };
    // Javascript instantiation of a slider (input type="text|range" or select list)
    var createSlider = function(options) {
        if(!options || !options.inp || !options.inp.tagName || options.inp.tagName.search(/^input|select/i) == -1) { return false; }

        options.html5Shim = false;

        if(options.inp.tagName.toLowerCase() == "select") {
            if(options.inp.options.length < 2) {
                return false;
            }
            options.min             = 0;
            options.max             = options.inp.options.length - 1;
            options.step            = 1;
            options.precision       = 0;
            options.scale           = false;
            options.forceValue      = true;
        } else {
            if(String(options.inp.type).search(/^(text|range)$/i) == -1) {
                return false;
            }
            options.min        = options.min && String(options.min).search(fpRegExp) != -1 ? +options.min : 0;
            options.max        = options.max && String(options.max).search(fpRegExp) != -1 ? +options.max : 100;
            options.step       = options.step && String(options.step).search(stepRegExp) != -1 ? options.step : 1;
            options.precision  = options.precision && String(options.precision).search(/^[0-9]+$/) != -1 ? options.precision : (String(options.step).search(/\.([0-9]+)$/) != -1 ? String(options.step).match(/\.([0-9]+)$/)[1].length : 0);
            options.scale      = options.scale || false;
            options.forceValue = ("forceValue" in options) ? !!options.forceValue : false;
            options.userSnap   = ("userSnap" in options) ? !!options.userSnap : false;
        }
        options.ariaFormat = ("ariaFormat" in options) && typeof options.ariaFormat == "function" ? options.ariaFormat : false;
        options.maxStep    = options.maxStep && String(options.maxStep).search(stepRegExp) != -1 ? +options.maxStep : +options.step * 2;
        options.classNames = options.classNames || "";
        options.callbacks  = options.callbacks || false;

        destroySingleSlider(options.inp.id);
        sliders[options.inp.id] = new fdRange(options);
        return true;
    };
    var getAttribute = function(elem, att) {
        return elem.getAttribute(att) || "";
    };
    // HTML5 input type="range" shim - called onload or onDomReady
    var init = function() {
        var inputs = document.getElementsByTagName("input"),
            options,
            defs;

        for(var i = 0, inp; inp = inputs[i]; i++) {

            if(inp.tagName.toLowerCase() == "input" &&
               (getAttribute(inp,"type") && getAttribute(inp,"type").toLowerCase() == "range") &&
               (getAttribute(inp, "min") && getAttribute(inp, "min").search(fpRegExp) != -1 ||
                getAttribute(inp, "max") && getAttribute(inp, "max").search(fpRegExp) != -1 ||
                getAttribute(inp, "step") && getAttribute(inp, "step").search(/^(any|([0-9]+(\.[0-9]+){0,1}))$/i) != -1
               )) {

                // Skip elements that have already been created are are resident in the DOM
                if(inp.id && document.getElementById("fd-slider-"+inp.id)) {
                    continue;
                // Destroy elements that have already been created but not resident in the DOM
                } else if(inp.id && !document.getElementById("fd-slider-"+inp.id)) {
                    destroySingleSlider(inp.id);
                }

                // Create an id for the form element if necessary
                if(!inp.id) {
                    inp.id = "fd-slider-form-elem-" + uniqueid++;
                }

                // Basic option Object
                options = {
                    inp:            inp,
                    callbacks:      [],
                    animation:      html5Animation,
                    vertical:       getAttribute(inp, "data-fd-slider-vertical") ? true : (inp.offsetHeight > inp.offsetWidth),
                    classNames:     getAttribute(inp, "data-fd-slider-vertical"),
                    html5Shim:      true
                };

                if(options.vertical && !getAttribute(inp, "data-fd-slider-vertical")) {
                    options.inpHeight = inp.offsetHeight;
                }

                defs = getInputAttributes(inp);

                options.min             = defs.min;
                options.max             = defs.max;
                options.step            = defs.step;
                options.precision       = String(options.step).search(/\.([0-9]+)$/) != -1 ? String(options.step).match(/\.([0-9]+)$/)[1].length : 0;
                options.maxStep         = options.step * 2;

                destroySingleSlider(options.inp.id);
                sliders[options.inp.id] = new fdRange(options);
            }
        }

        return true;
    };
    var getInputAttributes = function(inp) {
        return {
            "min":+(getAttribute(inp, "min") || 0),
            "max":+(getAttribute(inp, "max") || 100),
            "step":+(getAttribute(inp, "step").search(stepRegExp) != -1 ? inp.getAttribute("step") : 1)
        };
    };
    var destroySingleSlider = function(id) {
        if(id in sliders && sliders.hasOwnProperty(id)) {
            sliders[id].destroy();
            delete sliders[id];
            return true;
        };
        return false;
    };
    var destroyAllsliders = function(e) {
        for(var slider in sliders) {
            if(sliders.hasOwnProperty(slider)) {
                sliders[slider].destroy();
            }
        }
        sliders = [];
    };
    var unload = function(e) {
        destroyAllsliders();
        sliders = null;
    };
    var resize = function(e) {
        for(var slider in sliders) {
            if(sliders.hasOwnProperty(slider)) {
                sliders[slider].onResize();
            }
        }
    };
    var rescanAttributes = function() {
        for(var slider in sliders) {
            if(sliders.hasOwnProperty(slider)) {
                sliders[slider].rescan();
            }
        }
    };
    var onDomReady = function() {
        removeOnLoadEvent();
        init();
    };
    var removeOnLoadEvent = function() {
        removeEvent(window, "load",   init);
    };
    function fdRange(options) {
        var inp         = options.inp,
            disabled    = false,
            tagName     = inp.tagName.toLowerCase(),
            min         = +options.min,
            max         = +options.max,
            rMin        = +options.min,
            rMax        = +options.max,
            range       = Math.abs(max - min),
            step        = tagName == "select" ? 1 : +options.step,
            maxStep     = options.maxStep ? +options.maxStep : step * 2,
            precision   = options.precision || 0,
            steps       = Math.ceil(range / step),
            scale       = options.scale || false,
            hideInput   = !!options.hideInput,
            animation   = options.animation || "",
            vertical    = !!options.vertical,
            callbacks   = options.callbacks || {},
            classNames  = options.classNames || "",
            html5Shim   = !!options.html5Shim,
            defaultVal  = max < min ? min : min + ((max - min) / 2),
            resetDef    = tagName == "select" ? inp.selectedIndex : inp.defaultValue || defaultVal,
            forceValue  = html5Shim || !!options.forceValue,
            inpHeight   = html5Shim && vertical && ("inpHeight" in options) ? options.inpHeight : false,
            ariaFormat  = !html5Shim && options.ariaFormat ? options.ariaFormat : false,
            userSnap    = !html5Shim && !(tagName == "select") && ("userSnap" in options) ? !!options.userSnap : false,
            userInput   = false,
            timer       = null,
            kbEnabled   = true,
            initialVal  = tagName == "select" ? inp.selectedIndex : inp.value,
            sliderH     = 0,
            sliderW     = 0,
            tweenX      = 0,
            tweenB      = 0,
            tweenC      = 0,
            tweenD      = 0,
            frame       = 0,
            x           = 0,
            y           = 0,
            rMaxPx      = 0,
            rMinPx      = 0,
            handlePos   = 0,
            destPos     = 0,
            mousePos    = 0,
            stepPx      = 0,
            userSet     = false,
            touchEvents = false,
            outerWrapper,
            innerWrapper,
            ieBlur,
            handle,
            rangeBar,
            bar;

        // For the reset event to work we have to set a defaultValue
        if(tagName == "input" && forceValue && !inp.defaultValue) {
            inp.defaultValue = getWorkingValueFromInput();
        }

        // Make sure we have a negative step if the max < min
        if(max < min) {
            step    = -Math.abs(step);
            maxStep = -Math.abs(maxStep);
        }

        // Add the 100% scale mark if needs be. This is hacky.
        if(scale) {
            scale[100] = max;
        }

        // Set the "userSet" variable programmatically for this slider
        function valueSet(tf) {
            tf = !!tf;
            if(tf != userSet) {
                userSet = tf;
                valueToPixels(getWorkingValueFromInput());
            }
        }

        function rescanAttrs() {
            if(!useDOMAttrModEvt || tagName == "select") {
                return;
            }
            
            var defs = getInputAttributes(inp);

            if(defs.min == min && defs.max == max && defs.step == step) {
                return;
            }
            
            min         = +defs.min;
            max         = +defs.max;
            rMin        = min;
            rMax        = max;
            step        = +defs.step;
            range       = Math.abs(max - min);
            maxStep     = step * 2;
            steps       = Math.ceil(range / step);
            userSet     = false;
            setSliderRange(min, max);
        }
        
        function disableSlider(noCallback) {
            if(disabled && !noCallback) {
                return;
            }

            try {
                setTabIndex(handle, -1);
                removeEvent(handle, "focus", onFocus);
                removeEvent(handle, "blur",  onBlur);

                if(!isOpera) {
                    removeEvent(handle, "keydown",   onKeyDown);
                    removeEvent(handle, "keypress",  onKeyPress);
                } else {
                    removeEvent(handle, "keypress",  onKeyDown);
                }

                removeEvent(outerWrapper, "mouseover",  onMouseOver);
                removeEvent(outerWrapper, "mouseout",   onMouseOut);
                removeEvent(outerWrapper, "mousedown",  onMouseDown);
                removeEvent(outerWrapper, "touchstart", onMouseDown);

                if(mouseWheelEnabled) {
                    if (window.addEventListener && !window.devicePixelRatio) window.removeEventListener('DOMMouseScroll', trackMouseWheel, false);
                    else {
                        removeEvent(document, "mousewheel", trackMouseWheel);
                        removeEvent(window,   "mousewheel", trackMouseWheel);
                    }
                }
            } catch(err) {}

            removeClass(innerWrapper, "fd-slider-focused");
            removeClass(innerWrapper, "fd-slider-active");

            addClass(innerWrapper, "fd-slider-disabled");
            outerWrapper.setAttribute("aria-disabled", true);
            inp.disabled = disabled = true;
            clearTimeout(timer);

            if(!noCallback) {
                callback("disable");
            }
        }

        function enableSlider(noCallback) {
            if(!disabled && !noCallback) {
                return;
            }

            setTabIndex(handle, 0);
            addEvent(handle, "focus", onFocus);
            addEvent(handle, "blur",  onBlur);

            if(!isOpera) {
                addEvent(handle, "keydown",   onKeyDown);
                addEvent(handle, "keypress",  onKeyPress);
            } else {
                addEvent(handle, "keypress",  onKeyDown);
            }

            addEvent(outerWrapper, "touchstart", onMouseDown);
            addEvent(outerWrapper, "mousedown",  onMouseDown);
            addEvent(outerWrapper, "mouseover",  onMouseOver);
            addEvent(outerWrapper, "mouseout",   onMouseOut);

            removeClass(innerWrapper, "fd-slider-disabled");
            outerWrapper.setAttribute("aria-disabled", false);
            inp.disabled = disabled = touchEvents = false;

            if(!noCallback) {
                callback("enable");
            }
        }

        // Destroys a slider
        function destroySlider() {
            clearTimeout(timer);
            ieBlur = bar = handle = outerWrapper = innerWrapper = timer = null;
            callback("destroy");
            callbacks = null;
        }

        // Calculates the pixel increment etc
        function redraw() {
            locate();
            // Internet Explorer requires the try catch as hidden
            // elements throw errors
            try {
                var sW  = outerWrapper.offsetWidth,
                    sH  = outerWrapper.offsetHeight,
                    hW  = handle.offsetWidth,
                    hH  = handle.offsetHeight,
                    bH  = bar.offsetHeight,
                    bW  = bar.offsetWidth,
                    mPx = vertical ? sH - hH : sW - hW;

                stepPx = mPx / steps;
                rMinPx = Math.max(scale ? percentToPixels(valueToPercent(rMin)) : Math.abs((rMin - min) / step) * stepPx, 0);
                rMaxPx = Math.min(scale ? percentToPixels(valueToPercent(rMax)) : Math.abs((rMax - min) / step) * stepPx, Math.floor(vertical ? sH - hH : sW - hW));

                sliderW = sW;
                sliderH = sH;

                valueToPixels(forceValue ? getWorkingValueFromInput() : (tagName == "select" ? inp.selectedIndex : parseFloat(inp.value)), false);

            } catch(err) {}
            callback("redraw");
        }

        // Calls a callback function
        function callback(type) {
            if(!html5Shim) {
                if(callbacks.hasOwnProperty(type)) {
                    var cbObj = {"userSet":userSet, "disabled":disabled, "elem":inp, "value":tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value};

                    // Call all functions in sequence
                    for(var i = 0, func; func = callbacks[type][i]; i++) {
                        func.call(inp, cbObj);
                    }
                }
            } else if(type.match(/^(blur|focus|change)$/i)) {
                var e;
                if(typeof(document.createEvent) != 'undefined') {
                    e = document.createEvent('HTMLEvents');
                    e.initEvent(type, true, true);
                    inp.dispatchEvent(e);
                } else if(typeof(document.createEventObject) != 'undefined') {
                    try {
                        e = document.createEventObject();
                        inp.fireEvent('on' + type.toLowerCase(), e);
                    } catch(err){ }
                }
            }
        }

        // FOCUS & BLUR events
        function onFocus(e) {
            addClass(innerWrapper, 'fd-slider-focused');

            // Is the value said to have been set by the user onfocus
            if(varSetRules.onfocus) {
                userSet = true;
                valueToPixels(getWorkingValueFromInput());
            }

            // If mousewheel events required then add them
            if(mouseWheelEnabled) {
                addEvent(window, 'DOMMouseScroll', trackMouseWheel);
                addEvent(document, 'mousewheel', trackMouseWheel);
                if(!isOpera) {
                    addEvent(window,   'mousewheel', trackMouseWheel);
                }
            }

            callback("focus");
            return true;
        }

        function onBlur(e) {
            removeClass(innerWrapper, 'fd-slider-focused');

            // Remove mousewheel events if necessary
            if(mouseWheelEnabled) {
                removeEvent(document, 'mousewheel', trackMouseWheel);
                removeEvent(window, 'DOMMouseScroll', trackMouseWheel);
                if(!isOpera) {
                    removeEvent(window,   'mousewheel', trackMouseWheel);
                }
            }

            kbEnabled = true;
            callback("blur");
        }

        // MOUSEWHEEL events
        function trackMouseWheel(e) {
            if(!kbEnabled) {
                return;
            }

            e = e || window.event;
            var delta = 0,
                value;

            if (e.wheelDelta) {
                delta = e.wheelDelta/120;
                // Older versions of Opera require a small hack to inverse the delta
                if (isOpera && window.opera.version() < 9.2) {
                    delta = -delta;
                }
            } else if(e.detail) {
                delta = -e.detail/3;
            }

            if(vertical) {
                delta = -delta;
            }

            if(delta) {
                value = getWorkingValueFromInput();
                value += (delta < 0) ? -step : step;
                userSet = true;
                valueToPixels(getValidValue(value));
            }

            preventDefault(e);
        }

        // KEYBOARD events
        function onKeyPress(e) {
            e = e || window.event;
            // Let all non-hijacked keyboard events pass
            if((e.keyCode >= 33 && e.keyCode <= 40) || !kbEnabled || e.keyCode == 45 || e.keyCode == 46) {
                return stopEvent(e);
            }
            return true;
        }

        function onKeyDown(e) {
            if(!kbEnabled) {
                return true;
            }

            e = e || window.event;
            var kc = e.keyCode !== null ? e.keyCode : e.charCode,
                value;

            if(kc < 33 || (kc > 40 && (kc != 45 && kc != 46))) {
                return true;
            }

            value = getWorkingValueFromInput();

            if( kc == 37 || kc == 40 || kc == 46 || kc == 34) {
                // left, down, ins, page down
                value -= (e.ctrlKey || kc == 34 ? +maxStep : +step);
            } else if( kc == 39 || kc == 38 || kc == 45 || kc == 33) {
                // right, up, del, page up
                value += (e.ctrlKey || kc == 33 ? +maxStep : +step);
            } else if( kc == 35 ) {
                // max
                value = rMax;
            } else if( kc == 36 ) {
                // min
                value = rMin;
            }

            userSet = true;
            valueToPixels(getValidValue(value));

            callback("update");

            // Opera doesn't let us cancel key events so the up/down arrows and home/end buttons will scroll the screen - which sucks
            preventDefault(e);
        }

        // MOUSE & TOUCH events

        function onMouseOver(e) {
            addClass(innerWrapper, 'fd-slider-hover');
        }

        function onMouseOut(e) {
            // Should really check we are not still in the slider
            removeClass(innerWrapper, 'fd-slider-hover');
        }

        // Mousedown on the slider
        function onMouseDown(e) {
            e = e || window.event;

            // Stop page scrolling
            preventDefault(e);

            // Grab the event target
            var targ;
            if (e.target) {
                targ = e.target;
            } else if (e.srcElement) {
                targ = e.srcElement;
            }
            if(targ && targ.nodeType == 3) {
                targ = targ.parentNode;
            }

            // Are we using touchEvents
            if(e.touches) {
                // Skip gestures
                if(e.targetTouches && e.targetTouches.length != 1) {
                    return false;
                }

                e = e.touches[0];
                touchEvents = true;
            }

            // Stop any animation timers
            clearTimeout(timer);
            timer = null;

            // Not keyboard enabled
            kbEnabled = false;

            // User has set a value
            userSet   = true;

            // Handle mousedown - initiate drag
            if(targ.className.search("fd-slider-handle") != -1) {
                mousePos  = vertical ? e.clientY : e.clientX;
                handlePos = parseInt(vertical ? handle.offsetTop : handle.offsetLeft)||0;

                // Set a value on first click even if no movement
                trackMouse(e);

                if(!touchEvents) {
                    addEvent(document, 'mousemove', trackMouse);
                    addEvent(document, 'mouseup', stopDrag);
                } else {
                    addEvent(document, 'touchmove', trackMouse);
                    addEvent(document, 'touchend', stopDrag);
                    // Remove mouseEvents to stop them firing after the touch event
                    removeEvent(outerWrapper, "mousedown", onMouseDown);
                }

                addClass(innerWrapper, 'fd-slider-active');
                addClass(document.body, "fd-slider-drag-" + (vertical ? "vertical" : "horizontal"));

                callback("dragstart");

            // Wrapper mousedown - initiate animation to click point
            } else {
                locate();

                var posx = 0;

                if(e.pageX || e.pageY) {
                    posx = vertical ? e.pageY : e.pageX;
                } else if (e.clientX || e.clientY) {
                    posx = vertical ? e.clientY + document.body.scrollTop + document.documentElement.scrollTop : e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                }

                posx -= vertical ? y + Math.round(handle.offsetHeight / 2) : x + Math.round(handle.offsetWidth / 2);
                posx = snapToPxValue(posx);

                // Tween animation to click point
                if(animation == "tween") {
                    addClass(innerWrapper, 'fd-slider-active');
                    tweenTo(posx);
                // Progressive increment to click point
                } else if(animation == "timed") {
                    addClass(innerWrapper, 'fd-slider-active');
                    addEvent(document, touchEvents ? 'touchend' : 'mouseup', onDocMouseUp);
                    destPos = posx;
                    onTimer();
                // Immediate jump to click point
                } else {
                    pixelsToValue(posx);
                    //addEvent(document, touchEvents ? 'touchend' : 'mouseup', onMouseUp);
                }
            }

            return false;
        }

        // Progressive increment to click point - clear the animation timer and remove the mouseup/touchend event
        function onDocMouseUp( e ) {
            e = e || window.event;

            preventDefault(e);
            removeEvent(document, touchEvents ? 'touchend' : 'mouseup', onDocMouseUp);
            removeClass(innerWrapper, "fd-slider-active");

            clearTimeout(timer);
            timer     = null;
            kbEnabled = true;

            return false;
        }

        // Mouseup or touchend event on the document to stop drag
        function stopDrag(e) {
            e = e || window.event;

            preventDefault(e);

            if(touchEvents) {
                removeEvent(document, 'touchmove', trackMouse);
                removeEvent(document, 'touchend',   stopDrag);
            } else {
                removeEvent(document, 'mousemove', trackMouse);
                removeEvent(document, 'mouseup',   stopDrag);
            }

            kbEnabled   = true;
            removeClass(document.body, "fd-slider-drag-" + (vertical ? "vertical" : "horizontal"));
            removeClass(innerWrapper, "fd-slider-active");

            callback("dragend");

            return false;
        }

        // Mousemove or touchmove event on the drag handle
        function trackMouse(e) {
            e = e || window.event;

            preventDefault(e);

            if(e.touches) {
                // Skip gestures
                if(e.targetTouches && e.targetTouches.length != 1) {
                    return false;
                }
                e = e.touches[0];
            }

            pixelsToValue(snapToPxValue(handlePos + (vertical ? e.clientY - mousePos : e.clientX - mousePos)));

            return false;
        }

        // Increments the slider by "inc" steps
        function increment(inc) {
            var value = getWorkingValueFromInput();
            userSet   = true;
            value += inc * step;
            valueToPixels(getValidValue(value));
        }

        // Attempts to locate the on-screen position of the slider
        function locate(){
            var curleft = 0,
                curtop  = 0,
                obj     = outerWrapper;

            // Try catch for IE's benefit
            try {
                do {
                    curleft += obj.offsetLeft;
                    curtop  += obj.offsetTop;
                } while(obj = obj.offsetParent);
            } catch(err) {}
            x = curleft;
            y = curtop;
        }

        // Used during the progressive animation to click point
        function onTimer() {
            var xtmp = parseInt(vertical ? handle.offsetTop : handle.offsetLeft, 10);
            xtmp = Math.round((destPos < xtmp) ? Math.max(destPos, Math.floor(xtmp - stepPx)) : Math.min(destPos, Math.ceil(xtmp + stepPx)));

            pixelsToValue(snapToPxValue(xtmp));
            if(xtmp != destPos) {
                timer = setTimeout(onTimer, steps > 20 ? 50 : 100);
            } else {
                kbEnabled = true;
                removeClass(innerWrapper, "fd-slider-active");
                callback("finalise");
            }
        }

        var tween = function(){
            frame++;
            var c = tweenC,
                d = 20,
                t = frame,
                b = tweenB,
                x = Math.ceil((t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b);

            pixelsToValue(t == d ? tweenX : x);

            if(t!=d) {
                // Call the "move" callback on each animation increment
                callback("move");
                timer = setTimeout(tween, 20);
            } else {
                clearTimeout(timer);
                timer     = null;
                kbEnabled = true;

                removeClass(innerWrapper, "fd-slider-focused");
                removeClass(innerWrapper, "fd-slider-active");

                // Call the "finalise" callback whenever the animation is complete
                callback("finalise");
            }
        };

        function tweenTo(tx){
            kbEnabled = false;
            tweenX    = parseInt(tx, 10);
            tweenB    = parseInt(vertical ? handle.offsetTop : handle.offsetLeft, 10);
            tweenC    = tweenX - tweenB;
            tweenD    = 20;
            frame     = 0;

            if(!timer) {
                timer = setTimeout(tween, 20);
            }
        }

        // Returns a value within the range & sets the userSet var
        // i.e. has the user entered a valid value
        function checkValue(value) {
            if(isNaN(value) || value === "" || typeof value == "undefined") {
                userSet = false;
                return defaultVal;
            } else if(value < Math.min(rMin,rMax)) {
                userSet = false;
                return Math.min(rMin,rMax);
            } else if(value > Math.max(rMin,rMax)) {
                userSet = false;
                return Math.max(rMin,rMax);
            }
            userSet = true;
            return value;
        }

        // Returns a value within a range - uses the form element value as base
        function getWorkingValueFromInput() {
            return getValidValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);
        }

        // Returns a value within the range
        function getValidValue(value) {
            return (isNaN(value) || value === "" || typeof value == "undefined") ? defaultVal : Math.min(Math.max(value, Math.min(rMin,rMax)), Math.max(rMin,rMax));
        }

        // Calculates value according to pixel position of slider handle
        function pixelsToValue(px) {
            var val = getValidValue(scale ? percentToValue(pixelsToPercent(px)) : vertical ? max - (Math.round(px / stepPx) * step) : min + (Math.round(px / stepPx) * step));

            handle.style[vertical ? "top" : "left"] = (px || 0) + "px";
            redrawRange();
            setInputValue((tagName == "select" || step == 1) ? Math.round(val) : val);
        }

        // Calculates pixel position according to form element value
        function valueToPixels(val, updateInputValue) {
            var clearVal = false,
                value;

            // Allow empty values for non-polyfill sliders
            if((typeof val === "undefined" || isNaN(val) || val === "") && tagName == "input" && !forceValue) {
                value    = defaultVal;
                clearVal = true;
                userSet  = false;
            } else {
                value = checkValue(val);
            }

            handle.style[vertical ? "top" : "left"] = (scale ? percentToPixels(valueToPercent(value)) : vertical ? Math.round(((max - value) / step) * stepPx) : Math.round(((value - min) / step) * stepPx)) + "px";
            redrawRange();
            if(typeof updateInputValue !== false) {
                setInputValue(clearVal ? "" : value);
            }
        }

        // Rounds a pixel value to the nearest "snap" point on the slider scale
        function snapToPxValue(px) {
            if(scale) {
                return Math.max(Math.min(rMaxPx, px), rMinPx);
            } else {
                var rem = px % stepPx;
                if(rem && rem >= (stepPx / 2)) {
                    px += (stepPx - rem);
                } else {
                    px -= rem;
                }

                if(px < Math.min(Math.abs(rMinPx), Math.abs(rMaxPx))) {
                    px = Math.min(Math.abs(rMinPx), Math.abs(rMaxPx));
                } else if(px > Math.max(Math.abs(rMinPx), Math.abs(rMaxPx))) {
                    px = Math.max(Math.abs(rMinPx), Math.abs(rMaxPx));
                }

                return Math.min(Math.max(px, 0), rMaxPx);
            }
        }

        // Calculates a value according to percentage of distance handle has travelled
        function percentToValue(pct) {
            var st = 0,
                fr = min,
                value;

            for(var s in scale) {
                if(!scale.hasOwnProperty(s)) {
                    continue;
                }

                if(pct >= st && pct <= +s ) {
                    value = fr + ((pct - st) * (+scale[s] - fr) ) / (+s - st);
                }

                st = +s;
                fr = +scale[s];
            }

            return value;
        }

        // Calculates the percentage handle position according to form element value
        function valueToPercent(value) {
            var st  = 0,
                fr  = min,
                pct = 0;

            for(var s in scale) {
                if(!scale.hasOwnProperty(s)) {
                    continue;
                }

                if(value >= fr && value <= +scale[s]){
                    pct = st + (value - fr) * (+s - st) / (+scale[s] - fr);
                }

                st = +s;
                fr = +scale[s];
            }

            return pct;
        }

        function percentToPixels(percent) {
            return ((outerWrapper[vertical ? "offsetHeight" : "offsetWidth"] - handle[vertical ? "offsetHeight" : "offsetWidth"]) / 100) * percent;
        }

        function pixelsToPercent(pixels) {
            return pixels / ((outerWrapper[vertical ? "offsetHeight" : "offsetWidth"] - outerWrapper[handle ? "offsetHeight" : "offsetWidth"]) / 100);
        }

        // Sets the form element with a valid value
        function setInputValue(val) {
            // The update callback doesn't mean the input value has changed
            callback("update");

            // If the user has not set this value or has entered an incorrect value then set a class
            // to enable styling of the slider
            if(!userSet) {
                addClass(innerWrapper, "fd-slider-no-value");
            } else {
                removeClass(innerWrapper, "fd-slider-no-value");
            }

            if(tagName == "select") {
                try {
                    val = parseInt(val, 10);
                    if(inp.selectedIndex === val) {
                        updateAriaValues();
                        return;
                    }
                    inp.options[val].selected = true;
                } catch (err) {}
            } else {
                if(val !== "" && !userInput) {
                    val = (min + (Math.round((+val - min) / step) * step)).toFixed(precision);
                }
                if(inp.value === val) {
                    updateAriaValues();
                    return;
                }
                inp.value = val;
            }

            updateAriaValues();
            callback("change");
        }

        function checkInputValue(value) {
            return !(isNaN(value) || value === "" || value < Math.min(rMin,rMax) || value > Math.max(rMin,rMax));
        }

        function setSliderRange(newMin, newMax) {
            if(rMin > rMax) {
                newMin = Math.min(min, Math.max(newMin, newMax));
                newMax = Math.max(max, Math.min(newMin, newMax));
                rMin   = Math.max(newMin, newMax);
                rMax   = Math.min(newMin, newMax);
            } else {
                newMin = Math.max(min, Math.min(newMin, newMax));
                newMax = Math.min(max, Math.max(newMin, newMax));
                rMin   = Math.min(newMin, newMax);
                rMax   = Math.max(newMin, newMax);
            }

            if(defaultVal < Math.min(rMin, rMax)) {
                defaultVal = Math.min(rMin, rMax);
            } else if(defaultVal > Math.max(rMin, rMax)) {
                defaultVal = Math.max(rMin, rMax);
            }

            handle.setAttribute("aria-valuemin",  rMin);
            handle.setAttribute("aria-valuemax",  rMax);

            checkValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);
            redraw();
        }

        function redrawRange() {
            if(noRangeBar) {
                return;
            }
            if(vertical) {
                rangeBar.style["height"] = Math.max(1, (bar.offsetHeight - handle.offsetTop)) + "px";
            } else {
                rangeBar.style["width"] = Math.max(1, handle.offsetLeft) + "px";
            }
        }

        function findLabel() {
            var label = false,
                labelList = document.getElementsByTagName('label');
            // loop through label array attempting to match each 'for' attribute to the id of the current element
            for(var i = 0, lbl; lbl = labelList[i]; i++) {
                // Internet Explorer requires the htmlFor test
                if((lbl['htmlFor'] && lbl['htmlFor'] == inp.id) || (lbl.getAttribute('for') == inp.id)) {
                    label = lbl;
                    break;
                }
            }

            if(label && !label.id) {
                label.id = inp.id + "_label";
            }

            return label;
        }

        function updateAriaValues() {
            var val    = tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value,
                valTxt = ariaFormat ? ariaFormat(val) : tagName == "select" ? (inp.options[inp.selectedIndex].text ? inp.options[inp.selectedIndex].text : val) : val;

            handle.setAttribute("aria-valuenow",  val);
            handle.setAttribute("aria-valuetext", valTxt);
        }

        function onInputChange(e) {
            userSet = true;
            userInput = userSnap;
            valueToPixels(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);
            updateAriaValues();
            userInput = false;
        }

        function onReset(e) {
            if(tagName == "input") {
                inp.value = inp.defaultValue;
            } else {
                inp.selectedIndex = resetDef;
            }
            checkValue(tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value);
            redraw();
            updateAriaValues();
        }

        // Sets a tabindex attribute on an element, bends over for IE.
        function setTabIndex(e, i) {
            e.setAttribute(!/*@cc_on!@*/false ? "tabIndex" : "tabindex", i);
            e.tabIndex = i;
        }

        (function() {
            if(html5Shim || hideInput) {
                addClass(inp, "fd-form-element-hidden");
                try {
                    // FF21 hack to change input type to text
                    if(inp.type != "range"
                       &&
                       getAttribute(inp, "type") == "range"
                       &&
                       document.defaultView.getComputedStyle(inp, null).getPropertyValue("display") == "inline-block") {
                        inp.type="number";
                    }
                } catch(err){};
            } else {
                addEvent(inp, 'change', onInputChange);
            }

            // Add stepUp & stepDown methods to input element if using the html5Shim
            if(html5Shim) {
                inp.setAttribute("fd-range-enabled", 1);
                inp.stepUp   = function(n) { increment(n||1); };
                inp.stepDown = function(n) { increment(n||-1); };
                
                if(useDOMAttrModEvt) {
                    addEvent(inp, typeof(inp.onpropertychange) == "object" ? "propertychange" : "DOMAttrModified", rescanAttrs);
                }
            }

            outerWrapper              = document.createElement('span');
            outerWrapper.className    = "fd-slider" + (vertical ? "-vertical " : " ") + classNames;
            outerWrapper.id           = "fd-slider-" + inp.id;

            if(vertical && inpHeight) {
                outerWrapper.style.height = inpHeight + "px";
            }

            innerWrapper              = document.createElement('span');
            innerWrapper.className    = "fd-slider-wrapper" + (!html5Shim ? " fd-slider-no-value" : "");

            ieBlur                    = document.createElement('span');
            ieBlur.className          = "fd-slider-inner";

            bar                       = document.createElement('span');
            bar.className             = "fd-slider-bar";

            if(fullARIA) {
                handle            = document.createElement('span');
            } else {
                handle            = document.createElement('a');
                handle.setAttribute("href", "#");
                addEvent(handle, "click", stopEvent);
            }

            setTabIndex(handle, 0);

            handle.className          = "fd-slider-handle";
            handle.appendChild(document.createTextNode(String.fromCharCode(160)));

            innerWrapper.appendChild(ieBlur);

            if(!noRangeBar) {
                rangeBar                  = document.createElement('span');
                rangeBar.className        = "fd-slider-range";
                innerWrapper.appendChild(rangeBar);
            }

            innerWrapper.appendChild(bar);
            innerWrapper.appendChild(handle);
            outerWrapper.appendChild(innerWrapper);

            inp.parentNode.insertBefore(outerWrapper, inp);

            if(isOpera || /*@cc_on!@*/!true) {
                handle.unselectable       = "on";
                bar.unselectable          = "on";
                ieBlur.unselectable       = "on";
                outerWrapper.unselectable = "on";
                innerWrapper.unselectable = "on";
                if(!noRangeBar) {
                    rangeBar.unselectable     = "on";
                }
            }

            // Add ARIA accessibility info programmatically
            outerWrapper.setAttribute("role", "application");

            handle.setAttribute("role",           "slider");
            handle.setAttribute("aria-valuemin",  tagName == "select" ? inp.options[0].value : min);
            handle.setAttribute("aria-valuemax",  tagName == "select" ? inp.options[inp.options.length - 1].value : max);

            var lbl = findLabel();
            if(lbl) {
                handle.setAttribute("aria-labelledby", lbl.id);
                handle.id = "fd-slider-handle-" + inp.id;
                /*@cc_on@*/
                /*@if(@_win32)
                lbl.setAttribute("htmlFor", handle.id);
                @else @*/
                lbl.setAttribute("for", handle.id);
                /*@end@*/
            }

            // Are there page instructions
            if(document.getElementById(describedBy)) {
                handle.setAttribute("aria-describedby", describedBy);
            }

            // Is the form element initially disabled
            if(inp.getAttribute("disabled") == true || inp.getAttribute("disabled") == "disabled") {
                disableSlider(true);
            } else {
                enableSlider(true);
            }

            // Does an initial form element value mean the user has set a valid value?
            // Also called onload in case browsers have automatically set the input value
            if(varSetRules.onvalue) {
                userSet = true;
                checkValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);
            }

            // Catch form reset events
            if(inp.form) {
                addEvent(inp.form, "reset", onReset);
            }

            updateAriaValues();
            callback("create");
            redraw();
        })();

        return {
            onResize:       function(e) { if(outerWrapper.offsetHeight != sliderH || outerWrapper.offsetWidth != sliderW) { redraw(); } },
            destroy:        function() { destroySlider(); },
            reset:          function() { valueToPixels(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex); },
            stepUp:         function(n) { increment(Math.abs(n)||1); },
            stepDown:       function(n) { increment(-Math.abs(n)||-1); },
            increment:      function(n) { increment(n); },
            disable:        function() { disableSlider(); },
            enable:         function() { enableSlider(); },
            setRange:       function(mi, mx) { setSliderRange(mi, mx); },
            getValueSet:    function() { return !!userSet; },
            setValueSet:    function(tf) { valueSet(tf); },
            rescan:         function() { rescanAttrs(); },
            checkValue:     function() { if(varSetRules.onvalue) { userSet = true; checkValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex); } updateAriaValues(); redraw(); }
        };
    }

    addEvent(window, "load",   init);
    addEvent(window, "load",   function() { setTimeout(function() { var slider; for(slider in sliders) { sliders[slider].checkValue(); } }, 0); });
    addEvent(window, "resize", resize);
    addEvent(window, "unload", unload);

    // Have we been passed JSON within the including script tag
    (function() {
        var scriptFiles       = document.getElementsByTagName('script'),
            json              = parseJSON(String(scriptFiles[scriptFiles.length - 1].innerHTML).replace(/[\n\r\s\t]+/g, " ").replace(/^\s+/, "").replace(/\s+$/, ""));

        if(typeof json === "object" && !("err" in json)) {
            affectJSON(json);
        }
    })();

    // Add oldie class if needed for IE < 9
    /*@cc_on@*/
    /*@if (@_jscript_version < 9)
    addClass(document.documentElement, "oldie");
    /*@end@*/

    return {
        rescanDocument:         init,
        createSlider:           function(opts) { return createSlider(opts); },
        onDomReady:             function() { onDomReady(); },
        destroyAll:             function() { destroyAllsliders(); },
        destroySlider:          function(id) { return destroySingleSlider(id); },
        redrawAll:              function() { resize(); },
        addEvent:               addEvent,
        removeEvent:            removeEvent,
        stopEvent:              stopEvent,
        increment:              function(id, numSteps) { if(!sliderExists(id)) { return false; } sliders[id].increment(numSteps); },
        stepUp:                 function(id, n) { if(!sliderExists(id)) { return false; } sliders[id].stepUp(Math.abs(n)||1); },
        stepDown:               function(id, n) { if(!sliderExists(id)) { return false; } sliders[id].stepDown(-Math.abs(n)||-1); },
        setRange:               function(id, newMin, newMax) { if(!sliderExists(id)) { return false; } sliders[id].setRange(newMin, newMax); },
        updateSlider:           function(id) { if(!sliderExists(id)) { return false; } sliders[id].onResize(); sliders[id].reset(); },
        disable:                function(id) { if(!sliderExists(id)) { return false; } sliders[id].disable(); },
        enable:                 function(id) { if(!sliderExists(id)) { return false; } sliders[id].enable(); },
        getValueSet:            function() { return getValueSet(); },
        setValueSet:            function(a, tf) { if(!sliderExists(id)) { return false; } setValueSet(a, tf); },
        setGlobalVariables:     function(json) { affectJSON(json); },
        removeOnload:           function() { removeOnLoadEvent(); },
        rescanAttributes:       rescanAttributes
    };
})();
