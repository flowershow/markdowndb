import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const cliPath = path.join(process.cwd(), "dist", "src", "bin", "index.js");

describe("mddb CLI", () => {
  test("prints JSON for a single markdown file", () => {
    const filePath = path.join("__mocks__", "content", "index.mdx");

    const stdout = execFileSync(process.execPath, [cliPath, filePath], {
      encoding: "utf8",
    });

    const parsed = JSON.parse(stdout);
    expect(parsed.file_path).toBe(path.resolve(filePath));
    expect(parsed.extension).toBe("mdx");
  });

  test("warns when file extension is not markdown", () => {
    const tmpFile = path.join("__mocks__", "content", "not-markdown.txt");
    fs.writeFileSync(tmpFile, "# title");

    try {
      const result = spawnSync(process.execPath, [cliPath, tmpFile], {
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toContain(
        "Is this a markdown file? Expected .md, .markdown, or .mdx."
      );

      const parsed = JSON.parse(result.stdout || "");
      expect(parsed.file_path).toBe(path.resolve(tmpFile));
    } finally {
      fs.rmSync(tmpFile, { force: true });
    }
  });
});
