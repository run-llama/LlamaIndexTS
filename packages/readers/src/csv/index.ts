import { parse } from "csv-parse";

import { CSVReader } from "./base";
CSVReader.parse = parse;

export { CSVReader };
