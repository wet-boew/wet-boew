/*!
 * Translated default messages for the jQuery validation plugin.
 * Locale: ZH (Chinese, 中文 (Zh�?ngwén), 汉语, 漢語)
 */
(function ($) {
	$.extend($.validator.messages, {
        required: "必选字段",
		remote: "请修正该字段",
		email: "请输入正确格�?的电�?邮件",
		url: "请输入�?�法的网�?�",
		date: "请输入�?�法的日期",
		dateISO: "请输入�?�法的日期 (ISO).",
		number: "请输入�?�法的数字",
		digits: "�?�能输入整数",
		creditcard: "请输入�?�法的信用�?��?�",
		equalTo: "请�?次输入相�?�的值",
		accept: "请输入拥有�?�法�?�缀�??的字符串",
		maxlength: $.validator.format("请输入一个长度最多是 {0} 的字符串"),
		minlength: $.validator.format("请输入一个长度最少是 {0} 的字符串"),
		rangelength: $.validator.format("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
		range: $.validator.format("请输入一个介于 {0} 和 {1} 之间的值"),
		max: $.validator.format("请输入一个最大为 {0} 的值"),
		min: $.validator.format("请输入一个最�?为 {0} 的值")
	});
}(jQuery));