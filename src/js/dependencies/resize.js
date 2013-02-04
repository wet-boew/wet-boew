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
var ResizeEvents = {
	baseTextHeight: null,
	currentTextHeight: null,
	baseWindowWidth: null,
	baseWindowHeight: null,
	currentWindowWidth: null,
	currentWindowHeight: null,
	initialised: false,
	intervalReference: null,
	textSizeTestElement: null,
	eventElement: jQuery(document),
	conf: {
		textResizeEvent: 'x-text-resize',
		windowResizeEvent: 'x-window-resize',
		windowWidthResizeEvent: 'x-window-width-resize',
		windowHeightResizeEvent: 'x-window-height-resize',
		initialResizeEvent: 'x-initial-sizes',
		pollFrequency: 500,
		textSizeTestElId: 'text-resize'
	}
};

// start closure (protects variables from global scope)
(function ($) {


	/**
	* A simple way to add a listener for resize events.
	*
	* @param String events A space delimited list of events that should trigger this handler.
	* @param function handler The handler function to be called when an event occurs.
	*/
	ResizeEvents.bind = function (events, handler) {

		// on DOMReady
		$(function () {
			// initialise if it hasn't happened already
			if (ResizeEvents.initialised !== true) {
				ResizeEvents.initialise();
			}
		});

		ResizeEvents.eventElement.bind(
			events,
			handler
		);
	};

	/**
	* Initialisation
	*/
	ResizeEvents.initialise = function () {

		if (ResizeEvents.initialised === true) {
			return; // already initialised
		}

		// create text resize control element, and push it offscreen
		ResizeEvents.textSizeTestElement = $(
				'<span id="' + ResizeEvents.conf.textSizeTestElId + '" style="position: absolute; ' + ((pe.rtl) ? "right" : "left") + ': -9999px; bottom: 0; ' +
				'font-size: 100%; font-family: Courier New, mono; margin: 0; padding: 0;">&nbsp;</span>'
			).get(0);

		// append control element
		$('body').append(ResizeEvents.textSizeTestElement);

		// initialise variables
		windowWidthNow = $(window).width();
		windowHeightNow = $(window).height();
		textHeightNow = getTextHeight();
		ResizeEvents.baseTextHeight = textHeightNow;
		ResizeEvents.currentTextHeight = textHeightNow;
		ResizeEvents.baseWindowWidth = windowWidthNow;
		ResizeEvents.currentWindowWidth = windowWidthNow;
		ResizeEvents.baseWindowHeight = windowHeightNow;
		ResizeEvents.currentWindowHeight = windowHeightNow;

		// start polling
		if (ResizeEvents.intervalReference == null) {
			ResizeEventsPoll();
			ResizeEvents.intervalReference = window.setInterval('ResizeEventsPoll()', ResizeEvents.conf.pollFrequency);
		}

		// trigger onload
		ResizeEvents.eventElement.trigger(ResizeEvents.conf.initialResizeEvent, [emPixelNow, textHeightNow, windowWidthNow, windowHeightNow]);

		// flag initialisation complete
		ResizeEvents.initialised = true;


	};

	/**
	* This function is called a number of times each second to check if text size
	* or window size has changed
	*/
	ResizeEventsPoll = function () {

		// get current values
		windowWidthNow = $(window).width();
		windowHeightNow = $(window).height();
		textHeightNow = getTextHeight();
		emPixelNow = windowWidthNow / textHeightNow;
		widthChanged = false;

		// test for window width change
		if (ResizeEvents.currentWindowWidth != windowWidthNow) {
			// Send custom event
			ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowWidthResizeEvent, [emPixelNow, textHeightNow, windowWidthNow, windowHeightNow]);
			ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowResizeEvent, [emPixelNow, textHeightNow, windowWidthNow, windowHeightNow]);
			// update current height
			ResizeEvents.currentWindowWidth = windowWidthNow;
			widthChanged = true;
		}

		// test for window height change
		if (ResizeEvents.currentWindowHeight != windowHeightNow) {
			// Send custom event
			ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowHeightResizeEvent, [emPixelNow, textHeightNow, windowWidthNow, windowHeightNow]);
			if (!widthChanged) { // don't send window-resize event twice
				ResizeEvents.eventElement.trigger(ResizeEvents.conf.windowResizeEvent, [emPixelNow, textHeightNow, windowWidthNow, windowHeightNow]);
			}
			// update current height
			ResizeEvents.currentWindowHeight = windowHeightNow;
		}


		// test for text size change
		if (ResizeEvents.currentTextHeight != textHeightNow) {
			// Send custom event (with new text size)
			ResizeEvents.eventElement.trigger(ResizeEvents.conf.textResizeEvent, [emPixelNow, textHeightNow, windowWidthNow, windowHeightNow]);
			// update current height
			ResizeEvents.currentTextHeight = textHeightNow;
		}
	};

	/**
	* @return The current text height in pixels
	*/
	getTextHeight = function () {
		return ResizeEvents.textSizeTestElement.offsetHeight + '';
	};

})(jQuery); /* end closure */
