import { createWriteStream, promises } from "fs";
import got from "got";
import { tmpdir } from "os";
import { join } from "path";
import { Stream } from "stream";
import tar from "tar";
import { promisify } from "util";
import { makeDir } from "./make-dir";

export type RepoInfo = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

const pipeline = promisify(Stream.pipeline);

async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `next.js-cna-example.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

export async function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo,
) {
  await makeDir(root);

  const tempFile = await downloadTar(
    `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`,
  );

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: filePath ? filePath.split("/").length + 1 : 1,
    filter: (p) =>
      p.startsWith(
        `${name}-${branch.replace(/\//g, "-")}${
          filePath ? `/${filePath}/` : "/"
        }`,
      ),
  });

  await promises.unlink(tempFile);
}

export async function getRepoRootFolders(
  owner: string,
  repo: string,
): Promise<string[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents`;

  const response = await got(url, {
    responseType: "json",
  });

  const data = response.body as any[];
  const folders = data.filter((item) => item.type === "dir");
  return folders.map((item) => item.name);
}
