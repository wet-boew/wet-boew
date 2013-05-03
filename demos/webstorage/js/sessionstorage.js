(function ($) {
	/* Based on the demo for http://code.google.com/p/sessionstorage/ */
	var update = document.getElementById('update'),
		$document = $(document);
	$document.on('sessionstorage-loaded', function() {
		if(typeof sessionStorage === 'undefined' || sessionStorage.disabled)
			update.innerHTML = '<strong>Error:</strong> The sessionStorage polyfill does not work with cookies disabled.';
		else {
			update.setAttribute('role', 'timer');
			if(sessionStorage.getItem('sessionStarted')){
				function showInfo(){
					update.innerHTML = 'Your session started ' + Math.floor((new Date - sessionStarted) / 1000) + ' seconds ago.';
					return showInfo;
				};
				var sessionStarted  = new Date(parseInt(sessionStorage.getItem('sessionStarted'), 0));
				setInterval(showInfo(), 250);
			}
			else {
				sessionStorage.clear();
				sessionStorage.setItem('sessionStarted', new Date().getTime());
			}
		}
	});
	if(window.sessionStorage) {
		$document.trigger('sessionstorage-loaded');
	}
}(jQuery));