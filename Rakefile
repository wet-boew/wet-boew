# encoding: utf-8

require "html/proofer"

task :default => [:test]

task :test do
	HTML::Proofer.new("dist/", {
		:href_ignore => [
			"#",
			# The additional anchor link is picked up from the Geomap JSON, but shouldn't be flagged
			"\\\"#\\\"",
			"/v4.0-ci/index.html",
			"/v4.0-ci/index-en.html",
			"/v4.0-ci/index-fr.html",
			"/v4.0-ci/unmin/index.html",
			"/v4.0-ci/unmin/index-en.html",
			"/v4.0-ci/unmin/index-fr.html",
			# The texthighlight plug-in has some non-escaped characters in the query string
			"texthighlight/texthighlight-fr.html?txthl=influenza%20aviaire+monde+suffis+symptômes%20semblables%20à%20ceux%20de%20l'influenza+À%20titre%20de%20rappel...+À%20de%20rares%20occasions,%20des%20humains%20ont%20été%20infectés%20par%20ce%20virus.",
			"../../../demos/texthighlight/texthighlight-en.html?txthl=influenza%20aviaire+monde+suffis+sympt%C3%B4mes%20semblables%20%C3%A0%20ceux%20de%20l'influenza+%C3%80%20titre%20de%20rappel...+%C3%80%20de%20rares%20occasions,%20des%20humains%20ont%20%C3%A9t%C3%A9%20infect%C3%A9s%20par%20ce%20virus.#exemple"
		],
		:disable_external => true,
		:ext => ".html"
	}).run
end
