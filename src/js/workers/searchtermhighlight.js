/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Search term highlighting functionality 
 */
/*global jQuery: false, pe: false, dictionary: false*/
(function ($) {
	var _pe = window.pe || {
		fn: {}
	}; /* local reference */
	_pe.fn.searchtermhighlight = {
		type: 'plugin',
		_exec: function (elm) {
			var terms, target, form, $this = $(elm), settings = {
				termlength : pe.parameter('minlength', $this) || 3,
				passed: pe.url(document.location).param || ""
			};
			//console.log('minlength :: ' + pe.parameter('minlength',$this));
			// console.log('limit :: ' + pe.parameter('limit',$this));
			//  console.log('unknown :: ' + pe.parameter('unknown',$this));
			//var dictionary = {
			//    label: (PE.language == "eng") ? 'Search for term(s):' : 'Recherche de terme(s):',
			//    noMatch: (PE.language == "eng") ? 'No match found' : 'Aucune correspondance trouvée',
			//    oneMatch: (PE.language == "eng") ? '1 match found' : '1 correspondance trouvée',
			//    multiMatch: (PE.language == "eng") ? ' matches found' : ' correspondances trouvées'
			//}
			terms = (typeof settings.passed === "string") ? settings.passed : settings.passed.terms;
			form = $('<form class="wet-boew-termSearch"><label for="term">' + pe.dic.get('%search-for-terms') + '</label> <input type="text" id="term" name="term" value="' + terms + '" role="textbox" aria-multiline="false" />&#160;<span class="matches-found" role="status" aria-live="polite" aria-relevant="additions text"></span></form>');
			$this.before(form);
			// Event handling
			form.on("change keypress click", "input", function (event) {
				setTimeout(function () {
					terms = $(event.delegateTarget).find("input[type=text]").attr("value");
					target = $(event.delegateTarget).next();
					if (terms.length >= settings.minLength) {
						clearHighlightedTerms(target);
						highlightTerms(terms, target, settings);
					} else {
						clearHighlightedTerms(target);
					}
				}, 50);
			});
			//Prevents the form from submitting
			form.submit(function () {
				return false;
			});
			$this.bind("searchComplete", function (event, matchesCount) {
				var message;
				if (matchesCount < 1) {
					message = dictionary.noMatch;
				} else if (matchesCount === 1) {
					message = dictionary.oneMatch;
				} else {
					message = matchesCount + dictionary.multiMatch;
				}
				$(event.target).prev().find(".matches-found").text(message);
			});
			//Initialize with query parameter
			if (terms.length >= settings.minLength) {
				highlightTerms(terms, $(this), settings);
			}
/*
* highlightTerms
*
* This function will search the content within an element(s) of the page and hightlight
* matches found based on the search term(s) entered by the user
*
* @param searchTerms string The keywords that we want to search on.
* @param target Object The DOM object to look into
* @param settings Object The plugins settings
*
* @return (nothing) Just updates the content directly
*
*/

			function highlightTerms(searchTerms, target, settings) {
				var arrTerms, newText, i, matches = 0;
				searchTerms = searchTerms.replace(/^\s+|\s+$/g, '');
				searchTerms = searchTerms.replace(/\|+/g, ''); // don't let them use the | symbol
				// --------------------------------------------------------------------------------------------
				// Split the data into an array so that we can exclude anything smaller than the minimum length
				arrTerms = searchTerms.split(' ');
				if (arrTerms.length > 0) {
					searchTerms = '';
					for (i = 0; i < arrTerms.length; i += 1) {
						if (arrTerms[i].length >= settings.minLength) {
							searchTerms += arrTerms[i] + " ";
						}
					}
					searchTerms = searchTerms.replace(/^\s+|\s+$|\"|\(|\)/g, '');
				}
				searchTerms = searchTerms.replace(/\s+/g, '|'); // OR each value
				searchTerms = "(?=([^>]*<))([\\s'])?(" + searchTerms + ")(?!>)"; // Make sure that we're not checking for terms within a tag; only the text outside of tags.
				// --------------------------------------------------------------------------------------------
				newText = target.html().replace(new RegExp(searchTerms, "gi"), function (match, grp1, grp2, grp3) {
					matches += 1;
					return grp2 + '<span class="wet-boew-highlight-term">' + grp3 + '</span>';
				});
				target.trigger("searchComplete", [matches]);
				target.html(newText);
				return null;
			} // end of highlightTerms
/*
* clearHighlightedTerms
*
* This function will clear out any terms that were highlighted before hand that are not in the list of terms anymore
*
* @param target Object The DOM object to clear
* @return (nothing) Just updates the content directly
*
*/

			function clearHighlightedTerms(target) {
				target.find('span.wet-boew-highlight-term').each(function () {
					var text = $(this).text();
					$(this).replaceWith(text);
				});
				target.prev().find(".matches-found").text("");
			} // end of clearHighlightedTerms
			return this;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));