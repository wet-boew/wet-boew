/*!
 * Localized default methods for the jQuery validation plugin.
 * Locale: PT_BR
 */
jQuery.extend(jQuery.validator.methods,{date:function(b,a){return this.optional(a)||/^\d\d?\/\d\d?\/\d\d\d?\d?$/.test(b)}});