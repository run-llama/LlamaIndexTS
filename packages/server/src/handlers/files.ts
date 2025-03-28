import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import { promisify } from "util";
import { sendJSONResponse } from "../utils/request";

export const handleServeFiles = async (
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
) => {
  const filePath = pathname.substring("/api/files/".length);
  if (!filePath.startsWith("output") && !filePath.startsWith("data")) {
    return sendJSONResponse(res, 400, { error: "No permission" });
  }
  const decodedFilePath = decodeURIComponent(filePath);
  const fileExists = await promisify(fs.exists)(decodedFilePath);
  if (fileExists) {
    const fileStream = fs.createReadStream(decodedFilePath);
    fileStream.pipe(res);
  } else {
    return sendJSONResponse(res, 404, { error: "File not found" });
  }
};
