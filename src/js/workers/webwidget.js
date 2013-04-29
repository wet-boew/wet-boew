/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
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
				var cap, i, result = '', sorted, sorted_entry, username, displayname, image;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					a.created_at = a.created_at.replace(/\+\d{4} (\d{4})/, '$1 GMT');
					b.created_at = b.created_at.replace(/\+\d{4} (\d{4})/, '$1 GMT');
					return pe.date.compare(b.created_at, a.created_at);
				});
				for (i = 0; i < cap; i += 1) {
					sorted_entry = sorted[i];
					if (sorted_entry.user !== undefined) {
						username = sorted_entry.user.screen_name;
						displayname = sorted_entry.user.name;
						image = sorted_entry.user.profile_image_url;
					} else {
						username = sorted_entry.from_user;
						displayname = sorted_entry.from_user_name;
						image = sorted_entry.profile_image_url;
					}
					result += '<li><a class="float-left" href="http://www.twitter.com/' + username + '"><img class="widget-avatar" src="' + image  + '" alt="' + displayname + '" /></a> ' + pe.string.ify.clean(sorted_entry.text) + ' <span class="widget-datestamp-accent">' +  pe.dic.ago(sorted_entry.created_at) + '</span></li>';
				}
				return elm.empty().append(result);
			},
			_map_entries : function (data) {
				return data.results !== undefined ? data.results : data;
			},
			_json_request: function (url) {
				if (url.toLowerCase().indexOf('/search?q=') > -1) {
					return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/search\?q=([^&]*)/, function (str, p1) {
						return 'http://search.twitter.com/search.json?q=' + encodeURI(decodeURI(p1)) + '&callback=?';
					});
				} else if (url.toLowerCase().indexOf('!/search/') > -1) {
					//DEPRECATED
					return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/#!\/search\/(.+$)/, function (str, p1) {
						return 'http://search.twitter.com/search.json?q=' + encodeURI(decodeURI(p1)) + '&callback=?';
					});
				}
				return url.replace('http://', 'https://').replace(/https:\/\/twitter.com\/#!\/(.+$)/i, function (str, p1) {
					return 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + encodeURI(decodeURI(p1)) + '&callback=?';
				});
			}
		},
		weather: {
			_parse_entries: function (entries, limit, elm) {
				var entry = entries[1],
					result = '<li><a href="' + entry.link + '">' + entry.title + '</a><span class="widget-datestamp">[' + pe.date.to_iso_format(entry.publishedDate, true) + ']</span></li>';
				return elm.empty().append(result);
			},
			_map_entries : function (data) {
				return data.responseData.feed.entries;
			},
			_json_request: function (url, limit) {
				var rl;
				url = url.replace(/^.*?\.gc\.ca\/([a-z]+).+\/(.*?)_[a-z]+_([ef])\.html/i, 'http://weather.gc.ca/rss/$1/$2_$3.xml');
				rl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURI(decodeURI(url));
				if (limit > 0) {
					rl += "&num=" + limit;
				}
				return rl;
			}
		},
		rss: {
			_parse_entries: function (entries, limit, elm) {
				var cap, i, result = '', sorted, sorted_entry;
				cap = (limit > 0 && limit < entries.length ? limit : entries.length);
				sorted = entries.sort(function (a, b) {
					return pe.date.compare(b.publishedDate, a.publishedDate);
				});
				for (i = 0; i < cap; i += 1) {
					sorted_entry = sorted[i];
					result += '<li><a href="' + sorted_entry.link + '">' + sorted_entry.title + '</a>' + (sorted_entry.publishedDate !== '' ?  '<span class="widget-datestamp">[' + pe.date.to_iso_format(sorted_entry.publishedDate, true) + ']</span>' : '') + '</li>';
				}
				return elm.empty().append(result);
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
			var $loading, $content, feeds, limit, typeObj, entries, i, last, process_entries, parse_entries, _results, finalize, defered;
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
			$content.append($loading);

			typeObj = _pe.fn.webwidget[type];

			last = feeds.length - 1;
			entries = [];
			parse_entries = typeObj._parse_entries;
			i = feeds.length - 1;
			_results = [];

			process_entries = function (data) {
				var k, len;
				data = typeObj._map_entries(data);
				for (k = 0, len = data.length; k < len; k += 1) {
					entries.push(data[k]);
				}
				if (!last) {
					parse_entries(entries, limit, $content);
				}

				last -= 1;
				return last;
			};
			
			finalize = function () {
				$loading.remove();
				$content.find('li').show();
			};

			defered = [];
			while (i >= 0) {
				defered[i] = $.ajax({
					url: typeObj._json_request(feeds[i]),
					dataType: 'json',
					timeout: 1000
				}).done(process_entries);
				_results.push(i -= 1);
			}
			$.when.apply(null, defered).always(finalize);

			$.extend({}, _results);
			return;
		} // end of exec
	};
	window.pe = _pe;
	return window.pe;
}(jQuery));
