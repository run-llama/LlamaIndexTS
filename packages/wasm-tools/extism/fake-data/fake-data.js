/* eslint-disable @typescript-eslint/no-var-requires */
const { wiki } = require("wikipedia");

function fakeData() {
  const todoIndex = Host.inputString();
	const request = {
		method: "GET",
    url: `https://jsonplaceholder.typicode.com/todos/${todoIndex}`,
	};
	const response = Http.request(request);
	if (response.status != 200) throw new Error(`Got non 200 response ${response.status}`);
	Host.outputString(response.body);
}

module.exports = { fakeData };
