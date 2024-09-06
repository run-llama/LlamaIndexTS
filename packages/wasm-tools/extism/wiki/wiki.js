function wikiCall() {
	const params = JSON.parse(Host.inputString());
	const query = params.query;
	const request = {
		method: "GET",
		url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
	};
	const response = Http.request(request);
	if (response.status != 200) throw new Error(`Got non 200 response ${response.status}`);
	Host.outputString(response.body);
}

module.exports = { wikiCall };
