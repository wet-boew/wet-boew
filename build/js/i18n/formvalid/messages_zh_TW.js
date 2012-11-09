/*!
 * Translated default messages for the jQuery validation plugin.
 * Locale: ZH (Chinese; 中文 (Zh�?ngwén), 汉语, 漢語)
 * Region: TW (Taiwan)
 */
(function ($) {
	$.extend($.validator.messages, {
			required: "必填",
			remote: "請修正此欄�?",
			email: "請輸入正確的電�?信箱",
			url: "請輸入�?�法的URL",
			date: "請輸入�?�法的日期",
			dateISO: "請輸入�?�法的日期 (ISO).",
			number: "請輸入數字",
			digits: "請輸入整數",
			creditcard: "請輸入�?�法的信用�?�號碼",
			equalTo: "請�?複輸入一次",
			accept: "請輸入有效的後缀字串",
			maxlength: $.validator.format("請輸入長度�?大於{0} 的字串"),
			minlength: $.validator.format("請輸入長度�?�?於 {0} 的字串"),
			rangelength: $.validator.format("請輸入長度介於 {0} 和 {1} 之間的字串"),
			range: $.validator.format("請輸入介於 {0} 和 {1} 之間的數值"),
			max: $.validator.format("請輸入�?大於 {0} 的數值"),
			min: $.validator.format("請輸入�?�?於 {0} 的數值")
	});
}(jQuery));