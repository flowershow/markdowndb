import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import knex from "knex";

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
${
  includeArgs
    ? 'console.log(`${ok ? "ok" : "missing"}:${rest.join(",")}`);'
    : 'console.log(ok ? "ok" : "missing");'
}
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

  test("waits for the db to settle before exec", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-cli-exec-"));
    const tmpScript = path.join(tmpDir, "exec.mjs");
    fs.writeFileSync(tmpScript, execScript(false));

    try {
      const sampleDir = path.resolve("examples", "basic-example", "projects");
      const build = spawnSync(process.execPath, [cliPath, sampleDir], {
        encoding: "utf8",
        cwd: tmpDir,
      });
      expect(build.status).toBe(0);

      const dbPath = path.join(tmpDir, "markdown.db");

      const measureExec = (extraArgs: string[]) => {
        const now = new Date();
        fs.utimesSync(dbPath, now, now);
        const start = Date.now();
        const result = spawnSync(
          process.execPath,
          [cliPath, "--exec", ...extraArgs, tmpScript, sampleDir],
          {
            encoding: "utf8",
            cwd: tmpDir,
          }
        );
        return { duration: Date.now() - start, result };
      };

      const baseline = measureExec([]);
      expect(baseline.result.status).toBe(0);
      expect(baseline.result.stdout.trim()).toBe("ok");

      const waitMs = 600;
      const waited = measureExec(["--wait-db-ms", String(waitMs)]);
      expect(waited.result.status).toBe(0);
      expect(waited.result.stdout.trim()).toBe("ok");

      // The waited run should take at least waitMs longer than the baseline,
      // proving the wait actually elapsed (not just startup overhead).
      expect(waited.duration - baseline.duration).toBeGreaterThanOrEqual(
        waitMs - 100
      );
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

  test("indexes multiple directories into a single database", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-cli-"));
    const dir1 = path.join(tmpDir, "dir1");
    const dir2 = path.join(tmpDir, "dir2");
    const dbPath = path.join(tmpDir, "markdown.db");

    fs.mkdirSync(dir1);
    fs.mkdirSync(dir2);
    fs.writeFileSync(
      path.join(dir1, "file1.md"),
      "---\ntitle: File 1\n---\n\n# File 1"
    );
    fs.writeFileSync(
      path.join(dir2, "file2.md"),
      "---\ntitle: File 2\n---\n\n# File 2"
    );

    try {
      const result = spawnSync(process.execPath, [cliPath, dir1, dir2], {
        cwd: tmpDir,
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(fs.existsSync(dbPath)).toBe(true);

      // Verify both files are in the database
      const db = knex({
        client: "sqlite3",
        connection: { filename: dbPath },
        useNullAsDefault: true,
      });

      return db("files")
        .select("file_path")
        .then((files: { file_path: string }[]) => {
          expect(files.length).toBe(2);
          const filePaths = files.map((f) => f.file_path).sort();
          expect(filePaths[0]).toContain("dir1/file1.md");
          expect(filePaths[1]).toContain("dir2/file2.md");
          return db.destroy();
        })
        .finally(() => {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        });
    } catch (error) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      throw error;
    }
  });
});
