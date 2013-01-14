/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- Chinese dictionary (il8n) ---
 */
/*global jQuery: false, pe: false */
/*jshint bitwise: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	_pe.dic = {
		get: function (key, state, mixin) {
			var truthiness = (typeof key === 'string' && key !== '') | // eg. 000 or 001 ie. 0 or 1
				(typeof state === 'string' && state !== '') << 1 | // eg. 000 or 010 ie. 0 or 2
				(typeof mixin === 'string' && mixin !== '') << 2; // eg. 000 or 100 ie. 0 or 4
			switch (truthiness) {
				case 1:
					return this.ind[key]; // only key was provided.
				case 3:
					return this.ind[key][state]; // key and state were provided.
				case 7:
					return this.ind[key][state].replace('[MIXIN]', mixin); // key, state, and mixin were provided.
				default:
					return '';
			}
		},
		/*
		@dictionary function : pe.dic.ago()
		@returns: a human readable time difference text
		*/
		ago: function (time_value) {
			var delta,
				parsed_date,
				r,
				relative_to;
			parsed_date = pe.date.convert(time_value);
			relative_to = (arguments.length > 1 ? arguments[1] : new Date());
			delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);
			delta = delta + (relative_to.getTimezoneOffset() * 60);
			r = '';
			if (delta < 60) {
				r = this.get('%minute-ago');
			} else if (delta < 120) {
				r = this.get('%couple-of-minutes');
			} else if (delta < (45 * 60)) {
				r = this.get('%minutes-ago', 'mixin', (parseInt(delta / 60, 10)).toString());
			} else if (delta < (90 * 60)) {
				r = this.get('%hour-ago');
			} else if (delta < (24 * 60 * 60)) {
				r = this.get('%hours-ago', 'mixin', (parseInt(delta / 3600, 10)).toString());
			} else if (delta < (48 * 60 * 60)) {
				r = this.get('%yesterday');
			} else {
				r = this.get('%days-ago', 'mixin', (parseInt(delta / 86400, 10)).toString());
			}
			return r;
		},
		ind: {
			'%all': '全部',
			'%home': '首頁',
			'%main-page': 'Main page',
			'%top-of-page': '頁首',
			'%you-are-in': '你目前在 ',
			'%welcome-to': '歡迎 ',
			'%loading': '載入中..',
			'%search': '搜尋',
			'%search-for-terms': '搜尋項目',
			'%no-match-found': '找不到合適項目',
			'%matches-found': {
				'mixin': '[MIXIN] 找到 {}項目'
			},
			'%menu': '選單',
			'%hide': '隱藏',
			'%error': '錯誤',
			'%colon': '',
			'%start': '開始',
			'%stop': '停止',
			'%back': '返回',
			'%new-window': ' 用新視窗開的',
			'%minute-ago': '一分鐘前',
			'%couple-of-minutes': '數分鐘前',
			'%minutes-ago': {
				'mixin': '[MIXIN] {}分鐘前'
			},
			'%hour-ago': '一小時前',
			'%hours-ago': {
				'mixin': '[MIXIN] 數小時前'
			},
			'%days-ago': {
				'mixin': '[MIXIN] 數天前'
			},
			'%yesterday': '昨天',
			
			'%next': '下一軌',
			'%previous': '上一軌',
			
			/* Archived Web page template */
			'%archived-page': '此網頁已經封存',
			/* Menu bar */
			'%sub-menu-help': '使用"確定"鍵進入次選單, 離開請按Esc鍵',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': '停止定格鍵轉動',
				'enable': '開始定格鍵轉動'
			},
			'%tab-list': 'Tab list',
			/* Multimedia player */
			'%play': '播放',
			'%pause': '暫停',
			'%open': 'Open',
			'%close': '停止',
			'%rewind': '倒轉',
			'%fast-forward': '快轉 ',
			'%mute': {
				'enable': '靜音',
				'disable': '無靜音'
			},
			'%closed-caption': {
				'disable': '隱藏字幕',
				'enable': '顯示字幕'
			},
			'%captionserror': '載入字幕錯誤',
			'%audio-description': {
				'enable': '使用音訊說明',
				'disable': '取消音訊說明'
			},
			'%progress-bar': '使用左或右箭頭鍵來前走, 倒退視,音訊資料',
			'%no-video': '你的瀏覽器並不支援播放此視訊',
			'%position': '目前位置 ',
			'%percentage': 'Playback Percentage: ',
			'%duration': '所有時間 ',
			'%buffered': '緩衝中 ',
			/* Share widget */
			'%favourite': '最愛',
			'%email': '電子郵件',
			'%share-text': '分享此頁',
			'%share-hint': ' 使用時 {s}',
			'%share-email-subject': '有興趣網頁',
			'%share-email-body': '我想你對此網頁可能有興趣\n{t} ({u})',
			'%share-fav-title': ' (bookmark this page)',
			'%share-manual': '關閉對話框, 並用Ctrl-D標記此頁',
			'%share-showall': '顯示全部 ({n})',
			'%share-showall-title': '所有書籤網站',
			'%share-disclaimer': 'No endorsement of any products or services is expressed or implied.',
			/* Form validation */
			'%form-not-submitted': '本表格不能傳送因為 ',
			'%errors-found': ' 內有錯誤',
			'%error-found': ' 出現錯誤',
			/* Date picker */
			'%datepicker-hide': '隱藏行事曆',
			'%datepicker-show': '選擇一個日期 ',
			'%datepicker-selected': '選擇',
			/* Calendar */
			'%calendar-weekDayNames': ['星期天', '星期一', '星期二', '星期三', '星期四', ' 星期五', '星期六'],
			'%calendar-monthNames': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			'%calendar-currentDay': ' 現在日子',
			'%calendar-goToLink': 'Go To<span class="wb-invisible"> Month of Year</span>',
			'%calendar-goToTitle': '前往月份',
			'%calendar-goToMonth': '月',
			'%calendar-goToYear': '年',
			'%calendar-goToButton': '前往',
			'%calendar-cancelButton': '取消',
			'%calendar-previousMonth': '上一月 ',
			'%calendar-nextMonth': '下一月 ',
			/* Slideout */
			'%show-toc': 'Show',
			'%show-image': 'show.png',
			'%hide-image': 'hide.png',
			'%table-contents': ' 目錄',
			/* Lightbox */
			'%lb-current': '所有項目 {current} 的 {total}',
			'%lb-next': '下一項',
			'%lb-prev': '上一項',
			'%lb-xhr-error': '本內容無法入載入',
			'%lb-img-error': '圖形無法顯示',
			'%lb-slideshow': '幻燈片',
			/* jQuery Mobile */
			'%jqm-expand': ' 點擊打開內容',
			'%jqm-collapse': ' c點擊隱藏內容',
			'%jqm-clear-search': '搜尋新內容',
			'%jqm-filter': '過濾選項',
			/* Charts widget */
			'%table-mention': '表格',
			'%table-following': '圖表, 詳細內容在表格中',
			/* Session timeout */
			'%st-timeout-msg': 'Your session is about to expire, you have until #expireTime# to activate the "OK" button below to extend your session.',
			'%st-msgbox-title': 'Session timeout warning',
			'%st-already-timeout-msg': 'Sorry your session has already expired. Please login again.',
			/* Toggle details */
			'%td-toggle': 'Toggle all',
			'%td-open': 'Expand all',
			'%td-close': 'Collapse all',
			'%td-ttl-open': 'Expand all sections of content',
			'%td-ttl-close': 'Collapse all sections of content',
			/* Disable/enable PE */
			'%pe-disable': '基本HTML版本',
			'%pe-enable': '標準版本'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));
