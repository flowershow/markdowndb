import fs from "fs";
import os from "os";
import path from "path";
import { FileInfo } from "../lib/process";
import { Root } from "mdast";
import { MarkdownDB } from "../lib/markdowndb";
import { z } from "zod";

describe("Document Types Schema Validate Testing", () => {
  const pathToContentFixture = "__mocks__/content";
  let mddb: MarkdownDB;
  let dbPath: string;

  beforeAll(async () => {
    dbPath = createTempDbPath("mddb-document-types");
    const dbConfig = {
      client: "sqlite3",
      connection: {
        filename: dbPath,
      },
    };
    mddb = new MarkdownDB(dbConfig);
    await mddb.init();
  });

  afterAll(async () => {
    await mddb.db.destroy();
    fs.rmSync(dbPath, { force: true });
  });
  
  test("Should check if the title field is created and save in db", async () => {
    await mddb.indexFolder({
      folderPath: pathToContentFixture,
      customConfig: {
        computedFields: [
          (fileInfo: FileInfo, ast: Root) => {
            fileInfo.title = "Hello";
          },
        ],
        schemas: {
          blog: z.object({
            title: z.string(),
          }),
        },
      },
    });
    const dbFiles = await mddb.getFiles({ filetypes: ["blog"] });
    for (const file of dbFiles) {
      expect(file.title).toBe("Hello");
    }
  });

  test("Test that the 'indexFolder' function throws a validation error for a missing field in the blog schema.", async () => {
    await expect(
      mddb.indexFolder({
        folderPath: pathToContentFixture,
        customConfig: {
          schemas: {
            blog: z.object({
              missingField: z.string(),
            }),
          },
        },
      })
    ).rejects.toThrow(
      "Validation Failed: Unable to validate files against the specified scheme."
    );
  });
});

function createTempDbPath(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  return path.join(dir, "markdown.db");
}
