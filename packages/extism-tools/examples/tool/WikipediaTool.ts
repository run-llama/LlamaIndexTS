import { WikipediaTool } from "../../src/WikipediaTool";

const wikiTool = new WikipediaTool();
void wikiTool.call({ query: "Ho Chi Minh City" }).then(console.log);
