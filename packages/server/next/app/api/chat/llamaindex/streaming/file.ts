import fs from "node:fs";
import https from "node:https";
import path from "node:path";

export async function downloadFile(
  urlToDownload: string,
  filename: string,
  folder = "output/uploaded",
) {
  try {
    const downloadedPath = path.join(folder, filename);

    // Check if file already exists
    if (fs.existsSync(downloadedPath)) return;

    const file = fs.createWriteStream(downloadedPath);
    https
      .get(urlToDownload, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            console.log("File downloaded successfully");
          });
        });
      })
      .on("error", (err) => {
        fs.unlink(downloadedPath, () => {
          console.error("Error downloading file:", err);
          throw err;
        });
      });
  } catch (error) {
    throw new Error(`Error downloading file: ${error}`);
  }
}
