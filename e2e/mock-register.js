import { register } from "node:module";

register("./mock-module.js", import.meta.url);
