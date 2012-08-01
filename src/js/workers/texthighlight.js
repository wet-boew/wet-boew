/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Text highlighting functionality 
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.texthighlight = {
		type: 'plugin',
		_exec: function (elm) {

/*
* addHighlight
*
* This function highlights any text within a pre-defined area that matches search criteria specified through the URL's query string.
*
* @param text string The text that we want to search for.
* @param target Object The DOM object to look into
* @param settings Object The plugins settings
*
* @return (nothing) Just updates the content directly
*
*/
			function addHighlight(searchCriteria, target) {
				var arrSearchCriteria, newText, i;
				searchCriteria = searchCriteria.replace(/^\s+|\s+$/g, '');
				searchCriteria = searchCriteria.replace(/\|+/g, ''); // don't let them use the | symbol
				// --------------------------------------------------------------------------------------------
				// Split the data into an array so that we can exclude anything smaller than the minimum length
				arrSearchCriteria = searchCriteria.split('+');
				if (arrSearchCriteria.length > 0) {
					searchCriteria = '';
					for (i = 0; i < arrSearchCriteria.length; i += 1) {
						searchCriteria += arrSearchCriteria[i] + " ";
					}
					searchCriteria = searchCriteria.replace(/^\s+|\s+$|\"|\(|\)/g, '');
				}
				searchCriteria = searchCriteria.replace(/\s+/g, '|'); // OR each value
				searchCriteria = decodeURIComponent(searchCriteria);
				searchCriteria = "(?=([^>]*<))([\\s'])?(" + searchCriteria + ")(?!>)"; // Make sure that we're not checking for text within a tag; only the text outside of tags.
				// --------------------------------------------------------------------------------------------
				newText = target.html().replace(new RegExp(searchCriteria, "gi"), function (match, grp1, grp2, grp3) {
					return (typeof grp2 === 'undefined' ? '' : grp2) + '<span class="texthighlight"><mark>' + grp3 + '</mark></span>';
				});
				target.html(newText);
				return null;
			} // end of addHighlight

			if (pe.urlquery.texthighlight !== undefined) {
				addHighlight(pe.urlquery.texthighlight, elm);
			}
			return this;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));