import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { processMarkdown } from "../lib/process";

describe("processMarkdown", () => {
  const pathToContentFixture = "__mocks__/content";

  test("parses markdown source into FileInfo", async () => {
    const filePath = "index.mdx";
    const fullPath = path.join(pathToContentFixture, filePath);
    const source = fs.readFileSync(fullPath, "utf8");

    const fileInfo = await processMarkdown(source, {
      filePath: fullPath,
      rootFolder: pathToContentFixture,
      pathToUrlResolver: (inputPath) => inputPath,
      permalinks: [],
      computedFields: [],
    });

    expect(fileInfo.file_path).toBe(fullPath);
    expect(fileInfo.url_path).toBe("index.mdx");
    expect(fileInfo.extension).toBe("mdx");
    expect(fileInfo.tags).toEqual([
      "tag1",
      "tag2",
      "tag3",
      "日本語タグ",
      "标签名",
      "метка",
      "태그이름",
      "tag_فارسی",
      "Tag_avec_éèç-_öäüßñ",
    ]);
    expect(fileInfo.metadata).toEqual({
      title: "Homepage",
      tags: [
        "tag1",
        "tag2",
        "tag3",
        "日本語タグ",
        "标签名",
        "метка",
        "태그이름",
        "tag_فارسی",
        "Tag_avec_éèç-_öäüßñ",
      ],
      tasks: [
        {
          checked: false,
          description: "uncompleted task 2",
          metadata: {},
          created: null,
          due: null,
          completion: null,
          start: null,
          scheduled: null,
          list: null,
        },
        {
          checked: true,
          description: "completed task 1",
          metadata: {},
          created: null,
          due: null,
          completion: null,
          start: null,
          scheduled: null,
          list: null,
        },
        {
          checked: true,
          description: "completed task 2",
          metadata: {},
          created: null,
          due: null,
          completion: null,
          start: null,
          scheduled: null,
          list: null,
        },
      ],
    });
    expect(fileInfo.links).toEqual([
      {
        embed: false,
        from: "index.mdx",
        internal: true,
        text: "link",
        to: "blog0.mdx",
        toRaw: "blog0.mdx",
      },
    ]);
  });

  test("accepts Node.js Readable streams", async () => {
    const filePath = "index.mdx";
    const fullPath = path.join(pathToContentFixture, filePath);
    const source = fs.readFileSync(fullPath, "utf8");

    const fileInfo = await processMarkdown(Readable.from([source]), {
      filePath: fullPath,
      rootFolder: pathToContentFixture,
      pathToUrlResolver: (inputPath) => inputPath,
      permalinks: [],
      computedFields: [],
    });

    expect(fileInfo.url_path).toBe("index.mdx");
  });

  test("accepts ArrayBuffer input", async () => {
    const filePath = "index.mdx";
    const fullPath = path.join(pathToContentFixture, filePath);
    const source = fs.readFileSync(fullPath, "utf8");
    const buffer = new TextEncoder().encode(source).buffer;

    const fileInfo = await processMarkdown(buffer, {
      filePath: fullPath,
      rootFolder: pathToContentFixture,
      pathToUrlResolver: (inputPath) => inputPath,
      permalinks: [],
      computedFields: [],
    });

    expect(fileInfo.url_path).toBe("index.mdx");
  });
});
