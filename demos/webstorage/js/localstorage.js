(function ($) {
	var $status = $('#process-status'),
		$document = $(document);
	$document.on('localstorage-loaded status-change', function() {
		var processStatus = localStorage.getItem('processStatus');
		if (processStatus && processStatus === 'deactivated') {
			$status.html('<div class="module-attention span-4"><section><h2>Attention</h2><p>Processus désactivé <a class="button button-confirm">Activer le processus</a></p></section></div><div class="clear"></div>');
		} else {
			$status.html('<div class="module-note span-4"><section><h2>Nota</h2><p>Processus activé <a class="button button-attention">Déactiver le process</a></p></section></div><div class="clear"></div>');
		}
		$status.find('a').one('click vclick', function() {
			var processStatus = localStorage.getItem('processStatus');
			if (processStatus && processStatus === 'deactivated') {
				localStorage.setItem('processStatus', 'activated');
			} else {
				localStorage.setItem('processStatus', 'deactivated');
			}
			$document.trigger('status-change');
		});
	});
	if (window.localStorage) {
		$document.trigger('localstorage-loaded');
	}
}(jQuery));