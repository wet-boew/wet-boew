/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Template for WET-BOEW v3.x plugins
 */
/*global jQuery: false, pe: false, wet_boew_lightbox: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.lightbox = {
		type: 'plugin',
		// This is an example from tabbed interface, to show how to call required libraries
		depends: ['fancybox'],
		// Don't include a mobile function if your plugin shouldn't run in mobile mode.

		_exec: function (elm) {
			
			// Variables
			var 
				$lb_group, 
				$lb_single, 
				$lb_item,
				$fb_wrap;
			
			$fb_wrap = elm.find('.fancybox-wrap');
			
			$lb_single = elm.find('.lightbox').each(function(){
				$(this).attr('role','dialog').attr('tabindex','0');
			});
			
			$lb_group = elm.find('.lightbox-group').each(function(){
			    $(this).attr('role','dialog').attr('tabindex','0');
			    $(this).prepend('<span title="Press enter on the images to open the photo gallery. To navigate through the gallery use the up and down arrows and press escape to close the gallery." role="dialog" tabindex="0"></span>');
				
				return $(this);
			});

			$lb_item = elm.find('.lightbox-item').fancybox().each(function(){
				$(this).attr('role','button').attr('tabindex','0').click(function(){
					
					$fb_wrap.attr('tabindex','0');
					return $fb_wrap;
				});
				return $(this);
			})
			
			
			// Fancybox dependencies modifications
			//$fb_wrap = elm.find('.fancybox-wrap').each(function(){
			//	$(this).attr('tabindex','0');
			//	return $(this);
			//});

			
			
			//return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));