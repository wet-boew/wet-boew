/*!
 * Translated default messages for the jQuery validation plugin.
 * Locale: SK (Slovak; sloven�?ina, slovenský jazyk)
 */
(function ($) {
	$.extend($.validator.messages, {
		required: "Povinné zadať.",
		maxlength: $.validator.format("Maximálne {0} znakov."),
		minlength: $.validator.format("Minimálne {0} znakov."),
		rangelength: $.validator.format("Minimálne {0} a Maximálne {0} znakov."),
		email: "E-mailová adresa musí byť platná.",
		url: "URL musí byť platný.",
		date: "Musí byť dátum.",
		number: "Musí byť �?íslo.",
		digits: "Môže obsahovať iba �?íslice.",
		equalTo: "Dva hodnoty sa musia rovnať.",
		range: $.validator.format("Musí byť medzi {0} a {1}."),
		max: $.validator.format("Nemôže byť viac ako{0}."),
		min: $.validator.format("Nemôže byť menej ako{0}."),
		creditcard: "Číslo platobnej karty musí byť platné."
	});
}(jQuery));