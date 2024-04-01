import { SimpleDirectoryReader } from "llamaindex/readers/SimpleDirectoryReader";
// or
// import { SimpleDirectoryReader } from 'llamaindex'

const reader = new SimpleDirectoryReader();
const documents = await reader.loadData("../data");

documents.forEach((doc) => {
  console.log(`document (${doc.id_}):`, doc.getText());
});
