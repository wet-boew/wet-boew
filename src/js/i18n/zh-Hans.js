/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- Chinese (Simplified) dictionary (il8n) ---
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
			'%home': '首页',
			'%main-page': 'Main page',
			'%top-of-page': '页首',
			'%you-are-in': '您在： ',
			'%welcome-to': '欢迎到： ',
			'%loading': '连接中……',
			'%search': '搜索',
			'%search-for-terms': '搜索短语',
			'%no-match-found': '无匹配结果',
			'%matches-found': {
				'mixin': '[MIXIN] 搜索结果'
			},
			'%menu': '菜单',
			'%hide': '隐藏',
			'%error': '错误',
			'%colon': ':',
			'%start': '开始',
			'%stop': '停止',
			'%back': '返回',
			'%new-window': ' 以新窗口打开',
			'%minute-ago': '一分钟前',
			'%couple-of-minutes': '一两分钟前',
			'%minutes-ago': {
				'mixin': '[MIXIN] 数分钟前'
			},
			'%hour-ago': '一小时前',
			'%hours-ago': {
				'mixin': '[MIXIN] 数小时前'
			},
			'%days-ago': {
				'mixin': '[MIXIN] 数天前'
			},
			'%yesterday': '昨天',
			
			'%next': '下一个',
			'%previous': '上一个',
			
			/* Archived Web page template */
			'%archived-page': '该网页已过期',
			/* Menu bar */
			'%sub-menu-help': '（以输入键打开子菜单，退出键退出）',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': '停止标签旋转',
				'enable': '开始标签旋转'
			},
			'%tab-list': 'Tab list',
			/* Multimedia player */
			'%play': '播放',
			'%pause': '暂停',
			'%open': 'Open',
			'%close': '关闭',
			'%rewind': '回放',
			'%fast-forward': '快进 ',
			'%mute': {
				'enable': '静音',
				'disable': '打开声音'
			},
			'%closed-caption': {
				'disable': '隐藏字幕',
				'enable': '打开字幕'
			},
			'%captionserror': '加载字母错误',
			'%audio-description': {
				'enable': '使用音频描述',
				'disable': '停止音频描述'
			},
			'%progress-bar': '使用左和右箭头前进和后退',
			'%no-video': '您的浏览器无法播放该视频，请下载。',
			'%position': '现在位置 ',
			'%percentage': 'Playback Percentage: ',
			'%duration': '总时间 ',
			'%buffered': '缓冲 ',
			/* Share widget */
			'%favourite': '喜爱',
			'%email': '电釉',
			'%share-text': '分享该页面',
			'%share-hint': ' 使用時 {s}',
			'%share-email-subject': '有趣的页面',
			'%share-email-body': '我认为您也许觉得这个页面不错\n{t} ({u})',
			'%share-fav-title': ' (bookmark this page)',
			'%share-manual': '请关闭对话框，并按Ctrl-D收藏此页面',
			'%share-showall': '展示全部 ({n})',
			'%share-showall-title': '所有收藏的页面',
			'%share-disclaimer' : 'No endorsement of any products or services is expressed or implied.',
			/* Form validation */
			'%form-not-submitted': '表格无法提交，因为 ',
			'%errors-found': ' 找到错误',
			'%error-found': ' 找到错误',
			/* Date picker */
			'%datepicker-hide': '隐藏日历',
			'%datepicker-show': '从日历选择一个日期 ',
			'%datepicker-selected': '选中',
			/* Calendar */
			'%calendar-weekDayNames': ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
			'%calendar-monthNames': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			'%calendar-currentDay': ' 当天',
			'%calendar-goToLink': 'Go To<span class="wb-invisible"> Month of Year</span>',
			'%calendar-goToTitle': '到月份',
			'%calendar-goToMonth': '月份',
			'%calendar-goToYear': '年份',
			'%calendar-goToButton': '去',
			'%calendar-cancelButton': '取消',
			'%calendar-previousMonth': '上个月 ',
			'%calendar-nextMonth': '下个月 ',
			/* Slideout */
			'%show-toc': '展示',
			'%show-image': 'show.png',
			'%hide-image': 'hide.png',
			'%table-contents': ' 内容表',
			/* Lightbox */
			'%lb-current': '项目 {current} 的 {total}',
			'%lb-next': '下一个项目',
			'%lb-prev': '上一个项目',
			'%lb-xhr-error': '该内容无法下载',
			'%lb-img-error': '该图像无法下载',
			'%lb-slideshow': '幻灯片',
			/* jQuery Mobile */
			'%jqm-expand': ' 点击打开更多',
			'%jqm-collapse': ' 点击收回更多',
			'%jqm-clear-search': '清除搜索历史',
			'%jqm-filter': '过滤项目',
			/* Charts widget */
			'%table-mention': '表格',
			'%table-following': '图表。详细资料表如下。',
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
			'%pe-disable': '基本网页格式',
			'%pe-enable': '标准格式'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));
