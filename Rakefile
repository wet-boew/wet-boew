require "html/proofer"

task :default => [:test]

task :test do
	HTML::Proofer.new("dist/", {
		:href_ignore => [
			"#",
			"/v4.0-ci/index.html",
			"/v4.0-ci/index-en.html",
			"/v4.0-ci/index-fr.html",
			"/v4.0-ci/unmin/index.html",
			"/v4.0-ci/unmin/index-en.html",
			"/v4.0-ci/unmin/index-fr.html",
		],
		:disable_external => true,
		:ext => ".html"
	}).run
end
