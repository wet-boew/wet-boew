/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
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
				var cap, i, result, sorted;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.created_at.replace('+0000 ', '') + ' GMT', a.created_at.replace('+0000 ', '') + ' GMT');
				});
				result = '<ul class="widget-content">';
				i = 0;
				while (i < cap) {
					result += '<li><a class="float-left" href="http://www.twitter.com/';
					result += sorted[i].user.name + '/status/' + sorted[i].user.id + '"><img class="widget-avatar" src="' + sorted[i].user.profile_image_url + '" alt="' + sorted[i].user.name + '" /></a> ';
					result += pe.string.ify.clean(sorted[i].text);
					result += ' <span class="widget-datestamp-accent">' + pe.dic.ago(sorted[i].created_at) + '</span></li>';
					i += 1;
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
				var result;
				result = '<ul class="widget-content">';
				result += '<li><a href="' + entries[1].link + '">' + entries[1].title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(entries[1].publishedDate, true) + ']</span></li>';
				result += '</ul>';
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
				var cap, i, result, sorted;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.publishedDate, a.publishedDate);
				});
				result = '<ul class="widget-content">';
				i = 0;
				while (i < cap) {
					result += '<li><a href="' + sorted[i].link + '">' + sorted[i].title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(sorted[i].publishedDate, true) + ']</span></li>';
					i += 1;
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
			var $elm, $response, feeds, limit, typeObj, entries, i, last, process_entries, parse_entries, _results;
			$elm = $(elm);
			limit = _pe.limit($elm);
			feeds = $elm.find("a").map(function () {
				var a;
				a = $(this).attr("href");
				if (!type && /twitter.com/i.test(a)) {
					type = "twitter";
				}
				if (!type && /weatheroffice.gc.ca/i.test(a)) {
					type = "weather";
				}
				if (!type) {
					type = "rss";
				}
				return $(this).attr("href");
			});
			$response = $('<ul class="widget-content"><li class="widget-state-loading"><img src="' + pe.add.liblocation + '/images/webfeeds/ajax-loader.gif" alt="' + pe.dic.get('%loading') + '" /></li></ul>');
			$elm.find('.widget-content').replaceWith($response);

			typeObj = _pe.fn.webwidget[type];

			last = feeds.length - 1;
			entries = [];
			parse_entries = typeObj._parse_entries;
			i = feeds.length - 1;
			_results = [];

			process_entries = function (data) {
				var k;
				k = 0;
				data = typeObj._map_entries(data);
				while (k < data.length) {
					entries.push(data[k]);
					k += 1;
				}
				if (!last) {
					parse_entries(entries, limit, $response);
				}
				last -= 1;
				return last;
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