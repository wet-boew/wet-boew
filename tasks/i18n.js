module.exports = function(grunt) {
	'use strict';

	var fs = require('fs');
	var csv = require('csv');

	grunt.registerTask('i18n', 'Build the i18n dictionaries from the csv file', function() {
		/*jshint node: true, es5: true */

		//Tell grunt that this is an async task
		var i18nDone = this.async();

		grunt.log.write('Begining i18n transforms\n');

		var targetFiles = grunt.task.filesSrc;

		var options = this.options({
			template: '',
			csv: ''
		});

		var basei18n = grunt.file.read(options.template);

		grunt.verbose.writeflags(options, 'Options');

		// Generate dictionary files from CSV
		var langFiles = [],
			outputNames = [],
			wetLanguages = [];

		csv().from.stream(
				fs.createReadStream(options.csv)
			).on(
				'error',
				function(error) {
					grunt.log.error(error.message);
					i18nDone();
				}
			).on(
				'record',
				function(row, index) {
					//Skip the header row
					if (index > 0) {
						var i,
							len = row.length;
						// Copy and load the files on the line with the ISO 639-1 code
						if (index === 1) {
							grunt.log.write('Creating i18n dictionary files\n');
							for (i = 2; i < len; i++) {
								var filename = 'dist/js/i18n/' + row[i] + '.js';
								wetLanguages[i-2] = row[i];
								langFiles[i] = basei18n;
								var messagesFile = 'lib/jquery.validation/localization/messages_' + row[i] + '.js'
								if (grunt.file.exists(messagesFile)) {
									langFiles[i] += grunt.file.read(messagesFile);
								} else {
									grunt.verbose.write(messagesFile + ' not found\n')
								}
								var methodFile = 'lib/jquery.validation/localization/methods_' + row[i] + '.js'
								if (grunt.file.exists(methodFile)) {
									langFiles[i] += grunt.file.read(methodFile);
								} else {
									grunt.verbose.write(methodFile + ' not found\n')
								}
								outputNames[i] = filename;
							}
						}
						//Replace the language strings with a fallback to the English if the token is missing
						for (i = 2; i < len; i++) {
							langFiles[i] = langFiles[i].replace('@' + row[1] + '@', row[i] === '' ? row[2] : row[i]);
						}
					}
				}
			).on(
				'end',
				function(count) {
					for (var i = 2, len = langFiles.length; i < len; i++) {
						grunt.file.write(outputNames[i], langFiles[i]);
					}

					//Tell grunt we're done executing
					grunt.log.write('Finished i18n transforms');
					i18nDone();
				}
			);

	});
}
