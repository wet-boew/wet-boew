/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Web feeds widget
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.webwidget = {
		type: 'plugin',
		twitter: {
			_parse_entries: function (entries, limit, elm) {
				var cap, i, result, sorted, sorted_entry;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.created_at.replace('+0000 ', '') + ' GMT', a.created_at.replace('+0000 ', '') + ' GMT');
				});
				result = '<ul class="widget-content">';
				for (i = 0; i < cap; i += 1) {
					sorted_entry = sorted[i];
					result += '<li><a class="float-left" href="http://www.twitter.com/' + sorted_entry.user.name + '/status/' + sorted_entry.user.id + '"><img class="widget-avatar" src="' + sorted_entry.user.profile_image_url + '" alt="' + sorted_entry.user.name + '" /></a> ' + pe.string.ify.clean(sorted_entry.text) + ' <span class="widget-datestamp-accent">' + pe.dic.ago(sorted_entry.created_at) + '</span></li>';
				}
				result += '</ul>';
				return elm.replaceWith(result);
			},
			_map_entries : function (data) {
				return data;
			},
			_json_request: function (url) {
				if (url.toLowerCase().indexOf('!/search/') > -1) {
					return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/#!\/search\/(.+$)/, function (str, p1) {
						return 'http://search.twitter.com/search.json?q=' + encodeURI(decodeURI(p1));
					});
				}
				return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/#!\/(.+$)/i, function (str, p1) {
					return 'http://twitter.com/status/user_timeline/' + encodeURI(decodeURI(p1)) + '.json?callback=?';
				});
			}
		},
		weather: {
			_parse_entries: function (entries, limit, elm) {
				var entry = entries[1],
					result = '<ul class="widget-content"><li><a href="' + entry.link + '">' + entry.title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(entry.publishedDate, true) + ']</span></li></ul>';
				return elm.replaceWith(result);
			},
			_map_entries : function (data) {
				return data.responseData.feed.entries;
			},
			_json_request: function (url, limit) {
				var rl;
				url = url.replace(/^.*?\.gc\.ca\/([a-z]+).+\/(.*?)_[a-z]+_([ef])\.html/i, 'http://www.weatheroffice.gc.ca/rss/$1/$2_$3.xml');
				rl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURI(decodeURI(url));
				if (limit > 0) {
					rl += "&num=" + limit;
				}
				return rl;
			}
		},
		rss: {
			_parse_entries: function (entries, limit, elm) {
				var cap, i, result, sorted, sorted_entry;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.publishedDate, a.publishedDate);
				});
				result = '<ul class="widget-content">';
				for (i = 0; i < cap; i += 1) {
					sorted_entry = sorted[i];
					result += '<li><a href="' + sorted_entry.link + '">' + sorted_entry.title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(sorted_entry.publishedDate, true) + ']</span></li>';
				}
				result += '</ul>';
				return elm.replaceWith(result);
			},

			_map_entries : function (data) {
				return data.responseData.feed.entries;
			},
			_json_request: function (url, limit) {
				var rl;
				rl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURI(decodeURI(url));
				if (limit > 0) {
					rl += '&num=' + limit;
				}
				return rl;
			}
		},
		_exec: function (elm, type) {
			var $loading, $content, feeds, limit, typeObj, entries, i, last, process_entries, parse_entries, _results;
			limit = _pe.limit(elm);
			feeds = elm.find('a').map(function () {
				var a = this.href;
				if (!type && /twitter.com/i.test(a)) {
					type = "twitter";
				}
				if (!type && /weatheroffice.gc.ca/i.test(a)) {
					type = "weather";
				}
				if (!type) {
					type = "rss";
				}
				return a;
			});

			$loading = $('<li class="widget-state-loading"><img src="' + pe.add.liblocation + 'images/webfeeds/ajax-loader.gif" alt="' + pe.dic.get('%loading') + '" /></li>');
			$content = elm.find('.widget-content');
			$content.find('li').hide();
			$content.append($loading);

			typeObj = _pe.fn.webwidget[type];

			last = feeds.length - 1;
			entries = [];
			parse_entries = typeObj._parse_entries;
			i = feeds.length - 1;
			_results = [];

			process_entries = function (data) {
				var k, len;
				try{
					data = typeObj._map_entries(data);
					for (k = 0, len = data.length; k < len; k += 1) {
						entries.push(data[k]);
					}
					if (!last) {
						parse_entries(entries, limit, $content);
					}
					
					last -= 1;
					return last;
				}finally{
					$loading.remove();
					$content.find('li').show();
				}
			};

			while (i >= 0) {
				$.getJSON(typeObj._json_request(feeds[i]), process_entries);
				_results.push(i -= 1);
			}

			$.extend({}, _results);
			return;
		} // end of exec
	};
	window.pe = _pe;
	return window.pe;
}(jQuery));