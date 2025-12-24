import crypto from "crypto";
import fs from "fs";
import path from "path";

import { File, Task } from "./schema.js";
import { WikiLink, parseFile, ParsingOptions } from "./parseFile.js";
import { Root } from "remark-parse/lib/index.js";

export interface FileInfo extends File {
  tags: string[];
  links: WikiLink[];
  tasks: Task[];
}

/**
 * Core function to process markdown content from a source string.
 * This is used by both processFile (for file-based processing) and 
 * processMarkdown (for string-based processing).
 * 
 * @param source - The markdown content as a string
 * @param options - Parsing options to pass to parseFile
 * @param fileInfo - Optional FileInfo object to populate (for processFile)
 * @param computedFields - Optional array of functions to compute additional fields
 * @returns Object containing ast, metadata, links, tags, and tasks
 */
export function processMarkdownContent(
  source: string,
  options?: ParsingOptions,
  fileInfo?: FileInfo,
  computedFields?: ((fileInfo: FileInfo, ast: Root) => any)[]
) {
  const { ast, metadata, links } = parseFile(source, options);

  const filetype = metadata?.type || null;
  const tags = metadata?.tags || [];
  const tasks = metadata?.tasks || [];

  // Use provided fileInfo or create a minimal one
  const info: FileInfo = fileInfo || {
    _id: "",
    file_path: "",
    extension: "",
    url_path: null,
    filetype: null,
    metadata: {},
    tags: [],
    links: [],
    tasks: [],
  };

  // Update the fileInfo with parsed data
  info.metadata = metadata;
  info.links = links;
  info.filetype = filetype;
  info.tags = tags;
  info.tasks = tasks;

  // Apply computed fields if provided
  if (computedFields) {
    for (let index = 0; index < computedFields.length; index++) {
      const customFieldFunction = computedFields[index];
      customFieldFunction(info, ast);
    }
  }

  return {
    ast,
    fileInfo: info,
  };
}

// this file is an extraction of the file info parsing from markdowndb.ts without any sql stuff
// TODO: add back (as an option) - providing a "root folder" path for resolve
export function processFile(
  rootFolder: string,
  filePath: string,
  pathToUrlResolver: (filePath: string) => string,
  filePathsToIndex: string[],
  computedFields: ((fileInfo: FileInfo, ast: Root) => any)[]
) {
  // Remove rootFolder from filePath
  const relativePath = path.relative(rootFolder, filePath);

  // gets key file info if any e.g. extension (file size??)
  const encodedPath = Buffer.from(relativePath, "utf-8").toString();
  const id = crypto.createHash("sha1").update(encodedPath).digest("hex");

  // extension
  const extension = path.extname(relativePath).slice(1);

  const fileInfo: FileInfo = {
    _id: id,
    file_path: filePath,
    extension,
    url_path: pathToUrlResolver(relativePath),
    filetype: null,
    metadata: {},
    tags: [],
    links: [],
    tasks: [],
  };

  // if not a file type we can parse exit here ...
  // if (extension ! in list of supported extensions exit now ...)
  const isExtensionSupported = extension === "md" || extension === "mdx";
  if (!isExtensionSupported) {
    return fileInfo;
  }

  // Read file content
  const source: string = fs.readFileSync(filePath, {
    encoding: "utf8",
    flag: "r",
  });

  // Use the shared processing function, passing the fileInfo to be populated
  processMarkdownContent(
    source,
    {
      from: relativePath,
      permalinks: filePathsToIndex,
    },
    fileInfo,
    computedFields
  );

  // fileInfo has been updated in place by processMarkdownContent
  return fileInfo;
}
