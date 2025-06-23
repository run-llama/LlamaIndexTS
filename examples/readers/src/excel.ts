import { ExcelReader } from "@llamaindex/excel";

async function main() {
  // Load PDF
  const reader = new ExcelReader({
    sheetSpecifier: 0,
    concatRows: true,
    fieldSeparator: ",",
    keyValueSeparator: ":",
  });

  const documents = await reader.loadData("../data/sample_excel_sheet.xls");

  for (const doc of documents) {
    console.log(doc.text);
    console.log("----");
  }
}

main().catch(console.error);
