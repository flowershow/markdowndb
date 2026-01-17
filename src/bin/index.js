#!/usr/bin/env node
import fs from "fs";
import os from "os";
import path from "path";
import { MarkdownDB } from "../lib/markdowndb.js";
import { processMarkdown } from "../lib/process.js";
import { runExecScript } from "../lib/runExecScript.js";

// TODO get these from markdowndb.config.js or something
const dbPath = "markdown.db";
const ignorePatterns = [/Excalidraw/, /\.obsidian/, /DS_Store/];

let watchFlag;
const args = process.argv.slice(2);
const showHelp = args.length === 0 || args.includes("-h") || args.includes("--help");

const printHelp = () => {
  console.log(`mddb - MarkdownDB CLI

Usage:
  mddb <content-path> [config-path] [--watch]
  mddb --exec script.mjs [arg...]
  mddb <markdown-file>
  mddb --help

Examples:
  mddb ./content
  mddb ./content ./markdowndb.config.js --watch
  mddb ./notes/todo.md

Options:
  --watch     Watch for changes and keep the process running
  --exec      Execute a JS module (path to .mjs/.js or - for stdin)
  -h, --help  Show this help message
`);
};

if (showHelp) {
  printHelp();
  process.exit(0);
}

if (args[0] === "--exec") {
  const execScriptPath = args[1];
  if (!execScriptPath) {
    console.error("Missing path after --exec");
    process.exit(1);
  }
  const execScriptArgs = args.slice(2);
  const resolvedExecPath =
    execScriptPath === "-"
      ? (() => {
          const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-exec-"));
          const tmpScript = path.join(tmpDir, "exec.mjs");
          fs.writeFileSync(tmpScript, fs.readFileSync(0, "utf8"));
          process.on("exit", () => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          });
          return tmpScript;
        })()
      : path.resolve(execScriptPath);
  if (!fs.existsSync(resolvedExecPath)) {
    console.error(`Exec script not found: ${resolvedExecPath}`);
    process.exit(1);
  }
  const status = runExecScript(resolvedExecPath, execScriptArgs);
  process.exit(status);
}

// Check for the watch flag and its position
const watchIndex = args.indexOf("--watch");
if (watchIndex !== -1) {
  watchFlag = args[watchIndex];
  args.splice(watchIndex, 1); // Remove the watch flag from the array
}

// Assign values to contentPath and configFilePath based on their positions
const [contentPath, configFilePath] = args;

if (!contentPath) {
  console.error("Invalid/Missing path to markdown content folder");
  process.exit(1);
}

const resolvedContentPath = path.resolve(contentPath);
const stats = fs.statSync(resolvedContentPath);

if (stats.isFile()) {
  const extension = path.extname(resolvedContentPath).toLowerCase();
  if (extension !== ".md" && extension !== ".markdown" && extension !== ".mdx") {
    console.error(
      "Is this a markdown file? Expected .md, .markdown, or .mdx."
    );
  }

  const stream = fs.createReadStream(resolvedContentPath);
  const fileInfo = await processMarkdown(stream, {
    filePath: resolvedContentPath,
    rootFolder: path.dirname(resolvedContentPath),
    pathToUrlResolver: (inputPath) => inputPath,
  });

  console.log(JSON.stringify(fileInfo, null, 2));
  process.exit(0);
}

const client = new MarkdownDB({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
});

await client.init();

await client.indexFolder({
  folderPath: resolvedContentPath,
  ignorePatterns: ignorePatterns,
  watch: watchFlag,
  configFilePath: configFilePath,
});

if (!watchFlag) {
  process.exit();
}
