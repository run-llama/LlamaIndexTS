import { readdirSync, writeFileSync, statSync } from "fs";

function checkDir(dir: string): string[] {
  return readdirSync(dir).reduce((a: string[], n) => {
    const f = `${dir}/${n}`;

    const s = statSync(f);

    if (s.isFile() && n.endsWith(".test.ts")) {
      a.push(f);
    }

    if (s.isDirectory()) {
      a.push(...checkDir(f));
    }

    return a;
  }, []);
}

writeFileSync(
  "./test/index.ts",
  checkDir("./test")
    .map((f) => `import "./${f.slice(7, -3)}.js"`)
    .join("\n"),
  "utf-8",
);
