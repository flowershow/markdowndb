import crypto from "crypto";
import path from "path";

import { File, Task } from "./schema.js";
import { ParsingOptions, WikiLink, parseFile } from "./parseFile.js";
import { Root } from "remark-parse/lib/index.js";

export interface FileInfo extends File {
  tags: string[];
  links: WikiLink[];
  tasks: Task[];
}

export type MarkdownInput =
  | string
  | Buffer
  | Uint8Array
  | ArrayBuffer
  | NodeJS.ReadableStream
  | ReadableStream<Uint8Array>;

export interface ProcessMarkdownOptions extends ParsingOptions {
  filePath?: string;
  rootFolder?: string;
  pathToUrlResolver?: (filePath: string) => string;
  permalinks?: string[];
  computedFields?: Array<(fileInfo: FileInfo, ast: Root) => any>;
}

const defaultPathToUrlResolver = (inputPath: string) => inputPath;

const isWebReadableStream = (
  input: MarkdownInput
): input is ReadableStream<Uint8Array> =>
  typeof (input as ReadableStream<Uint8Array>).getReader === "function";

const decodeBytes = (bytes: Uint8Array) => {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder("utf-8").decode(bytes);
  }

  return Buffer.from(bytes).toString("utf8");
};

const readNodeStream = async (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | string>) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk, "utf8"));
    } else {
      chunks.push(Buffer.from(chunk));
    }
  }

  return Buffer.concat(chunks).toString("utf8");
};

const readWebStream = async (stream: ReadableStream<Uint8Array>) => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return decodeBytes(combined);
};

const readMarkdownInput = async (input: MarkdownInput) => {
  if (typeof input === "string") {
    return input;
  }

  if (Buffer.isBuffer(input)) {
    return input.toString("utf8");
  }

  if (input instanceof Uint8Array) {
    return decodeBytes(input);
  }

  if (input instanceof ArrayBuffer) {
    return decodeBytes(new Uint8Array(input));
  }

  if (isWebReadableStream(input)) {
    return readWebStream(input);
  }

  return readNodeStream(input);
};

const buildFileInfoFromSource = (
  source: string,
  options: ProcessMarkdownOptions
) => {
  const {
    filePath,
    rootFolder,
    pathToUrlResolver = defaultPathToUrlResolver,
    permalinks,
    computedFields = [],
    remarkPlugins,
    extractors,
  } = options;

  const relativePath = filePath
    ? rootFolder
      ? path.relative(rootFolder, filePath)
      : filePath
    : "<memory>";
  const resolvedFilePath = filePath || relativePath;
  const extension = filePath ? path.extname(relativePath).slice(1) : "md";
  const idSource = filePath ? relativePath : source;
  const encodedPath = Buffer.from(idSource, "utf-8").toString();
  const id = crypto.createHash("sha1").update(encodedPath).digest("hex");

  const fileInfo: FileInfo = {
    _id: id,
    file_path: resolvedFilePath,
    extension,
    url_path: pathToUrlResolver(relativePath),
    filetype: null,
    metadata: {},
    tags: [],
    links: [],
    tasks: [],
  };

  const isExtensionSupported = extension === "md" || extension === "mdx";
  if (!isExtensionSupported) {
    return fileInfo;
  }

  const { ast, metadata, links } = parseFile(source, {
    from: relativePath,
    permalinks,
    remarkPlugins,
    extractors,
  });

  fileInfo.metadata = metadata;
  fileInfo.links = links;
  fileInfo.filetype = metadata?.type || null;
  fileInfo.tags = metadata?.tags || [];

  for (let index = 0; index < computedFields.length; index++) {
    const customFieldFunction = computedFields[index];
    customFieldFunction(fileInfo, ast);
  }

  fileInfo.tasks = metadata?.tasks || [];

  return fileInfo;
};

export const processMarkdown = async (
  input: MarkdownInput,
  options: ProcessMarkdownOptions = {}
) => {
  const source = await readMarkdownInput(input);
  return buildFileInfoFromSource(source, options);
};

// Alias for legacy imports; keep in place for backward compatibility.
export const processFile = processMarkdown;
