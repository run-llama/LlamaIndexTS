import { parse } from "csv-parse/browser/esm";

import { CSVReader } from "./base";
CSVReader.parse = parse;

export { CSVReader };
