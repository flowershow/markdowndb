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
  mddb <content-path> [additional-paths...] [config-path] [--watch]
  mddb --exec script.mjs [arg...]
  mddb <markdown-file>
  mddb --help

Examples:
  mddb ./content
  mddb ./content ./markdowndb.config.js --watch
  mddb ./content ./more-content
  mddb ./dir1 ./dir2 ./dir3
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

// Separate content paths from config file
// Config files end with .js or .json
let configFilePath;
const contentPaths = [];

for (const arg of args) {
  if (arg.endsWith('.js') || arg.endsWith('.json')) {
    configFilePath = arg;
  } else {
    contentPaths.push(arg);
  }
}

if (contentPaths.length === 0) {
  console.error("Invalid/Missing path to markdown content folder");
  process.exit(1);
}

// Check if the first path is a single file
const resolvedFirstPath = path.resolve(contentPaths[0]);
const stats = fs.statSync(resolvedFirstPath);

if (stats.isFile()) {
  if (contentPaths.length > 1) {
    console.error("Cannot process multiple paths when the first path is a file");
    process.exit(1);
  }

  const extension = path.extname(resolvedFirstPath).toLowerCase();
  if (extension !== ".md" && extension !== ".markdown" && extension !== ".mdx") {
    console.error(
      "Is this a markdown file? Expected .md, .markdown, or .mdx."
    );
  }

  const stream = fs.createReadStream(resolvedFirstPath);
  const fileInfo = await processMarkdown(stream, {
    filePath: resolvedFirstPath,
    rootFolder: path.dirname(resolvedFirstPath),
    pathToUrlResolver: (inputPath) => inputPath,
  });

  console.log(JSON.stringify(fileInfo, null, 2));
  process.exit(0);
}

// Resolve all content paths
const resolvedContentPaths = contentPaths.map(p => path.resolve(p));

const client = new MarkdownDB({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
});

await client.init();

await client.indexFolders({
  folderPaths: resolvedContentPaths,
  ignorePatterns: ignorePatterns,
  watch: watchFlag,
  configFilePath: configFilePath,
});

if (!watchFlag) {
  process.exit();
}
