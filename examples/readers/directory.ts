import { SimpleDirectoryReader } from "@llamaindex/readers/directory";

function callback(
  category: string,
  name: string,
  status: unknown,
  message?: string,
): boolean {
  console.log(category, name, status, message);
  if (name.endsWith(".pdf")) {
    console.log("I DON'T WANT PDF FILES!");
    return false;
  }
  return true;
}

async function main() {
  // Load page
  const reader = new SimpleDirectoryReader(callback);
  const params = { directoryPath: "./data" };
  await reader.loadData(params);
}

main().catch(console.error);
