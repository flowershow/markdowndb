import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const cliPath = path.join(process.cwd(), "dist", "src", "bin", "index.js");

describe("mddb CLI", () => {
  const execScript = (includeArgs: boolean) => `import fs from "fs";
import path from "path";
import { MarkdownDB } from "mddb";

const sampleDir = process.argv[2];
const rest = process.argv.slice(3);
const fileCount = fs
  .readdirSync(sampleDir)
  .filter((name) => name.endsWith(".md")).length;
const targetPath = path.join(sampleDir, "portaljs.md");

const mddb = await new MarkdownDB({
  client: "sqlite3",
  connection: { filename: "markdown.db" },
}).init();
const [{ count }] = await mddb.db("files").count({ count: "*" });
const target = await mddb
  .db("files")
  .select("file_path")
  .where("file_path", targetPath)
  .first();
const dbCount = Number(count);
const ok = Number.isFinite(dbCount) && dbCount >= fileCount && target;
${includeArgs ? 'console.log(`${ok ? "ok" : "missing"}:${rest.join(",")}`);' : 'console.log(ok ? "ok" : "missing");'}
await mddb.db.destroy();
`;

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
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-cli-"));
    const tmpFile = path.join(tmpDir, "not-markdown.txt");
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
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("executes a module with mddb available", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-cli-exec-"));
    const tmpScript = path.join(tmpDir, "exec.mjs");
    fs.writeFileSync(tmpScript, execScript(true));

    try {
      const build = spawnSync(
        process.execPath,
        [cliPath, path.resolve("examples", "basic-example", "projects")],
        {
          encoding: "utf8",
          cwd: tmpDir,
        }
      );
      expect(build.status).toBe(0);

      const sampleDir = path.resolve("examples", "basic-example", "projects");
      const result = spawnSync(
        process.execPath,
        [cliPath, "--exec", tmpScript, sampleDir, "foo", "bar"],
        {
          encoding: "utf8",
          cwd: tmpDir,
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("ok:foo,bar");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("executes a module from stdin with mddb available", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-cli-exec-"));

    try {
      const build = spawnSync(
        process.execPath,
        [cliPath, path.resolve("examples", "basic-example", "projects")],
        {
          encoding: "utf8",
          cwd: tmpDir,
        }
      );
      expect(build.status).toBe(0);

      const sampleDir = path.resolve("examples", "basic-example", "projects");
      const result = spawnSync(
        process.execPath,
        [cliPath, "--exec", "-", sampleDir],
        {
          encoding: "utf8",
          cwd: tmpDir,
          input: execScript(false),
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("ok");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
