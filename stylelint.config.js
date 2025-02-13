/** @type {import('stylelint').Config} */
module.exports = {

	plugins: [ "@double-great/stylelint-a11y" ],
	rules: {

		"alpha-value-notation": "number",

		// Suppress stylelint-config-recommended errors
		"font-family-no-duplicate-names": [
			true,
			{
				ignoreFontFamilyNames: [
					"monospace" // Issue from Bootstrap-sass/normalize.scss
				]
			}
		],
		"font-family-no-missing-generic-family-keyword": [
			true,
			{
				ignoreFontFamilies: [
					"Glyphicons Halflings", // Icons don't need fallbacks
					"/a/" // Weird buggy thing from text-hide mixin from Bootstrap 3
				]
			}
		],

		"media-feature-range-notation": "prefix", // Uses legacy syntax

		// Partially-enable stylelint-a11y rules
		"a11y/content-property-no-static-value": null,
		"a11y/font-size-is-readable": null,
		"a11y/line-height-is-vertical-rhythmed": null,
		"a11y/media-prefers-reduced-motion": null,
		"a11y/media-prefers-color-scheme": null,
		"a11y/no-display-none": null,
		"a11y/no-obsolete-attribute": true,
		"a11y/no-obsolete-element": null, // Treats menu and hgroup as false positives
		"a11y/no-spread-text": true,
		"a11y/no-outline-none": null,
		"a11y/no-text-align-justify": null, // Bootstrap 3.4.x comes with a .text-justify class
		"a11y/selector-pseudo-class-focus": null
	},
	overrides: [
		{
			files: [
				"**/*.css"
			],
			extends: [
				"stylelint-config-standard"
			],
			rules: {
				"function-no-unknown": null,
				"media-feature-name-no-unknown": null,
				"no-descending-specificity": null, // Extremely slow
				"no-duplicate-selectors": null,
				"no-irregular-whitespace": null,

				// Suppress stylelint-config-standard errors
				"at-rule-empty-line-before": null,
				"at-rule-no-vendor-prefix": null,
				"color-function-notation": null,
				"color-hex-length": null,
				"comment-empty-line-before": null,
				"comment-whitespace-inside": null,
				"declaration-block-no-redundant-longhand-properties": null,
				"declaration-block-no-duplicate-properties": null, // Needed to fix build because of bootstrap-sass/assets/stylesheets/bootstrap/normalize line 113
				"declaration-property-value-no-unknown": null, // Uses legacy syntax
				"declaration-property-value-keyword-no-deprecated": null, // Fix use of break-word
				"function-name-case": null,
				"function-url-quotes": null,
				"length-zero-no-unit": null,
				"media-feature-name-no-vendor-prefix": null,
				"number-max-precision": null,
				"property-no-vendor-prefix": null,
				"rule-empty-line-before": null,
				"selector-attribute-quotes": null,
				"selector-class-pattern": null,
				"selector-id-pattern": null,
				"selector-not-notation": null,
				"selector-no-vendor-prefix": null,
				"selector-pseudo-element-colon-notation": null,
				"shorthand-property-no-redundant-values": null,
				"value-no-vendor-prefix": null
			}
		},
		{
			files: [
				"**/*.scss"
			],
			extends: [
				"stylelint-config-standard-scss"
			],
			rules: {
				"at-rule-empty-line-before": null,
				"at-rule-no-vendor-prefix": null,
				"color-function-notation": null,
				"comment-empty-line-before": null,
				"comment-whitespace-inside": null,
				"declaration-block-no-redundant-longhand-properties": null,
				"no-descending-specificity": null, // Extremely slow
				"no-duplicate-selectors": null,
				"no-invalid-position-at-import-rule": null, // Fixable, need to run sass migrator
				"property-no-vendor-prefix": null,
				"rule-empty-line-before": null,
				"scss/comment-no-empty": null,
				"scss/dollar-variable-pattern": null, // Fixable
				"scss/no-global-function-names": null, // Fixable, need to run sass migrator
				"selector-attribute-quotes": null,
				"selector-class-pattern": null,
				"selector-id-pattern": null,
				"selector-not-notation": null,
				"selector-pseudo-element-colon-notation": null,
				"shorthand-property-no-redundant-values": null
			}
		}
	],
	ignoreFiles: [
		"**/*.min.css",
		"src/plugins/share/sprites/_sprites_share.scss", // Ignore generated file
		"lib/**"
	]
};
