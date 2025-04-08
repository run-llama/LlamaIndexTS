import { uploadFile } from "@llamaindex/cloud/reader-workflow";

async function main() {
  const job = await uploadFile({
    file: "../data/basic.pdf",
  });
  console.log("job id", job.jobId);

  job.signal.addEventListener("abort", () => {
    console.error("ERROR:", job.signal.reason);
  });

  const markdown = await job.markdown();
  console.log("--markdown--");
  console.log(markdown);

  const text = await job.text();
  console.log("--text--");
  console.log(text);

  const json = await job.json();
  console.log("--json--");
  console.log(json);
}

main();
