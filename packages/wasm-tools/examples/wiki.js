import createPlugin from "@extism/extism";

async function main() {
	const plugin = await createPlugin("../extism/wiki/wiki.wasm", {
		useWasi: true,
		functions: {},
		runInWorker: true,
		allowedHosts: ["*.wikipedia.org"],
		memory: { maxHttpResponseBytes: 100 * 1024 * 1024 },
	});

	try {
		const params = { query: "Ho Chi Minh City" };
		const data = await plugin.call("wikiCall", JSON.stringify(params));
		console.log(data.json()); 
	} catch (e) {
		console.error(e);
	} finally {
		await plugin.close();
	}
}

void main();
