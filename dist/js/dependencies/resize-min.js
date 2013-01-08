/*!
* Resize Events
* @version 0.7
* Changelog:
*	* 0.5 Added API bind() function to make it easier to add listeners.
*	* 0.6 Added support for window height changes
*	* 0.7 Clean up outstanding bugs (duplicate event firing) and refactor.
*
* There is no standard event for when a user resizes the text in their browser.
* There is also no consistency between browser implementations of the window resize event
* (some trigger as the window is resized, some only trigger as the user drops the resize handle).
* This extension polls to detect these changes, and reports them immediately as custom events
* ('x-text-resize' and 'x-window-resize') that other code can listen for and react to accordingly.
* Resize Events also send an 'x-initial-size' event on load.
*
* The custom events triggered are sent with emPixels, textHeight and windowWidth variables.
* emPixels is a unit that estimates much space you have to work with but is resolution, text size
* and zoom level independant. Use this value to base layout decisions on, and the layout will
* always fit.
*
* This extension is based on the 'text resize' events work of Lawrence Carvalho <http://www.alistapart.com/articles/fontresizing/>.
*
* @author Lawrence Carvalho <carvalho@uk.yahoo-inc.com>
* @author Andrew Ramsden <http://irama.org/>
*
* @see http://irama.org/web/dhtml/resize-events/
* @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
* @requires jQuery (tested with 1.4.2) <http://jquery.com/>
*/
var ResizeEvents={baseTextHeight:null,currentTextHeight:null,baseWindowWidth:null,baseWindowHeight:null,currentWindowWidth:null,currentWindowHeight:null,initialised:false,intervalReference:null,textSizeTestElement:null,eventElement:jQuery(document),conf:{textResizeEvent:"x-text-resize",windowResizeEvent:"x-window-resize",windowWidthResizeEvent:"x-window-width-resize",windowHeightResizeEvent:"x-window-height-resize",initialResizeEvent:"x-initial-sizes",pollFrequency:500,textSizeTestElId:"text-resize"}};(function(a){ResizeEvents.bind=function(b,c){a(function(){if(ResizeEvents.initialised!==true){ResizeEvents.initialise()}});ResizeEvents.eventElement.bind(b,c)};ResizeEvents.initialise=function(){if(ResizeEvents.initialised===true){return}ResizeEvents.textSizeTestElement=a('<span id="'+ResizeEvents.conf.textSizeTestElId+'" style="position: absolute; '+((pe.rtl)?"right":"left")+': -9999px; bottom: 0; font-size: 100%; font-family: Courier New, mono; margin: 0; padding: 0;">&nbsp;</span>').get(0);a("body").append(ResizeEvents.textSizeTestElement);windowWidthNow=a(window).width();windowHeightNow=a(window).height();textHeightNow=getTextHeight();ResizeEvents.baseTextHeight=textHeightNow;ResizeEvents.currentTextHeight=textHeightNow;ResizeEvents.baseWindowWidth=windowWidthNow;ResizeEvents.currentWindowWidth=windowWidthNow;ResizeEvents.baseWindowHeight=windowHeightNow;ResizeEvents.currentWindowHeight=windowHeightNow;if(ResizeEvents.intervalReference==null){ResizeEventsPoll();ResizeEvents.intervalReference=window.setInterval("ResizeEventsPoll()",ResizeEvents.conf.pollFrequency)}ResizeEvents.eventElement.trigger(ResizeEvents.conf.initialResizeEvent,[emPixelNow,textHeightNow,windowWidthNow,windowHeightNow]);ResizeEvents.initialised=true};ResizeEventsPoll=function(){windowWidthNow=a(window).width();windowHeightNow=a(window).height();textHeightNow=getTextHeight();emPixelNow=windowWidthNow/textHeightNow;widthChanged=false;if(ResizeEvents.currentWindowWidth!=windowWidthNow){ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowWidthResizeEvent,[emPixelNow,textHeightNow,windowWidthNow,windowHeightNow]);ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowResizeEvent,[emPixelNow,textHeightNow,windowWidthNow,windowHeightNow]);ResizeEvents.currentWindowWidth=windowWidthNow;widthChanged=true}if(ResizeEvents.currentWindowHeight!=windowHeightNow){ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowHeightResizeEvent,[emPixelNow,textHeightNow,windowWidthNow,windowHeightNow]);if(!widthChanged){ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowResizeEvent,[emPixelNow,textHeightNow,windowWidthNow,windowHeightNow])}ResizeEvents.currentWindowHeight=windowHeightNow}if(ResizeEvents.currentTextHeight!=textHeightNow){ResizeEvents.eventElement.trigger(ResizeEvents.conf.textResizeEvent,[emPixelNow,textHeightNow,windowWidthNow,windowHeightNow]);ResizeEvents.currentTextHeight=textHeightNow}};getTextHeight=function(){return ResizeEvents.textSizeTestElement.offsetHeight+""}})(jQuery);