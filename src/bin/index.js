#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { MarkdownDB } from "../lib/markdowndb.js";
import { processMarkdown } from "../lib/process.js";

// TODO get these from markdowndb.config.js or something
const dbPath = "markdown.db";
const ignorePatterns = [/Excalidraw/, /\.obsidian/, /DS_Store/];

let watchFlag;
const args = process.argv.slice(2);

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
