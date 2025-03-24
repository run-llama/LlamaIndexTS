import { Document } from "llamaindex";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getExtractors } from "../../engine/loader";
import { DocumentFile } from "../streaming/annotations";

const MIME_TYPE_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export const UPLOADED_FOLDER = "output/uploaded";

export async function storeAndParseFile(
  name: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<DocumentFile> {
  const file = await storeFile(name, fileBuffer, mimeType);
  const documents: Document[] = await parseFile(fileBuffer, name, mimeType);
  // Update document IDs in the file metadata
  file.refs = documents.map((document) => document.id_ as string);
  return file;
}

export async function storeFile(
  name: string,
  fileBuffer: Buffer,
  mimeType: string,
) {
  const fileExt = MIME_TYPE_TO_EXT[mimeType];
  if (!fileExt) throw new Error(`Unsupported document type: ${mimeType}`);

  const fileId = crypto.randomUUID();
  const newFilename = `${sanitizeFileName(name)}_${fileId}.${fileExt}`;
  const filepath = path.join(UPLOADED_FOLDER, newFilename);
  const fileUrl = await saveDocument(filepath, fileBuffer);
  return {
    id: fileId,
    name: newFilename,
    size: fileBuffer.length,
    type: fileExt,
    url: fileUrl,
    refs: [] as string[],
  } as DocumentFile;
}

export async function parseFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
) {
  const documents = await loadDocuments(fileBuffer, mimeType);
  for (const document of documents) {
    document.metadata = {
      ...document.metadata,
      file_name: filename,
      private: "true", // to separate private uploads from public documents
    };
  }
  return documents;
}

async function loadDocuments(fileBuffer: Buffer, mimeType: string) {
  const extractors = getExtractors();
  const reader = extractors[MIME_TYPE_TO_EXT[mimeType]];

  if (!reader) {
    throw new Error(`Unsupported document type: ${mimeType}`);
  }
  console.log(`Processing uploaded document of type: ${mimeType}`);
  return await reader.loadDataAsContent(fileBuffer);
}

// Save document to file server and return the file url
export async function saveDocument(filepath: string, content: string | Buffer) {
  if (path.isAbsolute(filepath)) {
    throw new Error("Absolute file paths are not allowed.");
  }
  if (!process.env.FILESERVER_URL_PREFIX) {
    throw new Error("FILESERVER_URL_PREFIX environment variable is not set.");
  }

  const dirPath = path.dirname(filepath);
  await fs.promises.mkdir(dirPath, { recursive: true });

  if (typeof content === "string") {
    await fs.promises.writeFile(filepath, content, "utf-8");
  } else {
    await fs.promises.writeFile(filepath, content);
  }

  const fileurl = `${process.env.FILESERVER_URL_PREFIX}/${filepath}`;
  console.log(`Saved document to ${filepath}. Reachable at URL: ${fileurl}`);
  return fileurl;
}

function sanitizeFileName(fileName: string) {
  // Remove file extension and sanitize
  return fileName.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, "_");
}
