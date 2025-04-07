import { read } from "@llamaindex/cloud/reader-workflow";

read({
  input: "../data/basic.pdf",
}).then((md) => console.log("md", md));
