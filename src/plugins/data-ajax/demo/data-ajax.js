window["wb-data-ajax"] = {
	corsFallback: function( fetchObj ) {
		fetchObj.url = fetchObj.url.replace(".html", ".htmlp");
		return fetchObj;
	},
	forceCorsFallback: true
};
