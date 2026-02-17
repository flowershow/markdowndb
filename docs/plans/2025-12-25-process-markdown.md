# ProcessMarkdown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `processMarkdown` API that parses a single markdown input (string/stream/buffer) with shared parsing logic, and refactor internal usage to the new syntax.

**Architecture:** Extract a shared helper in `src/lib/process.ts` that builds `FileInfo` from source + path context. `processMarkdown` normalizes inputs to a string and calls the helper. `processFile` becomes a thin alias for backward compatibility. Internal callers and tests move to `processMarkdown`.

**Tech Stack:** TypeScript, Node.js streams, unified/remark, gray-matter.

### Task 0: Sync worktree with main

**Files:**
- Modify: none

**Step 1: Fetch latest main**

Run: `git fetch origin`

Expected: fetch completes with no errors.

**Step 2: Merge main into this branch**

Run: `git merge origin/main`

Expected: merge completes cleanly (no conflicts).

### Task 1: Add failing test for processMarkdown (string input)

**Files:**
- Create: `src/tests/processMarkdown.spec.ts`

**Step 1: Write the failing test**

```ts
import fs from "fs";
import path from "path";
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
      pathToUrlResolver: (p) => p,
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
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/tests/processMarkdown.spec.ts`

Expected: FAIL (e.g. `processMarkdown is not a function`).

### Task 2: Implement processMarkdown with shared helper

**Files:**
- Modify: `src/lib/process.ts`

**Step 1: Add input/option types and input normalization helper**

```ts
export type MarkdownInput = string | Buffer | Uint8Array | ArrayBuffer | NodeJS.ReadableStream | ReadableStream<Uint8Array>;

export interface ProcessMarkdownOptions extends ParsingOptions {
  filePath?: string;
  rootFolder?: string;
  pathToUrlResolver?: (filePath: string) => string;
  permalinks?: string[];
  computedFields?: Array<(fileInfo: FileInfo, ast: Root) => any>;
}
```

Add a helper `readMarkdownInput(input)` that returns a UTF-8 string and handles:
- string/Buffer/Uint8Array/ArrayBuffer
- Node.js Readable stream
- Web ReadableStream

**Step 2: Extract shared `buildFileInfoFromSource` helper**

Move common logic that:
- determines `relativePath`, `extension`, `id`, and base `fileInfo`
- calls `parseFile(source, { from, permalinks, remarkPlugins, extractors })`
- applies computed fields and tasks

Behavior specifics:
- If `filePath` provided and `rootFolder` provided: use `path.relative(rootFolder, filePath)` as `relativePath`.
- If `filePath` provided without `rootFolder`: treat `filePath` as `relativePath`.
- If no `filePath`: set `relativePath` to `"<memory>"` and `file_path` to `"<memory>"`.
- If no `filePath`, set `extension` to `"md"` so parsing still happens.
- Use hash of `relativePath` when present; otherwise hash of `source` to keep ids stable for in-memory input.

**Step 3: Implement `processMarkdown`**

```ts
export async function processMarkdown(input: MarkdownInput, options: ProcessMarkdownOptions = {}) {
  const source = await readMarkdownInput(input);
  return buildFileInfoFromSource(source, options);
}
```

**Step 4: Keep `processFile` as a thin alias**

```ts
export const processFile = processMarkdown;
```

**Step 5: Run test to verify it passes**

Run: `npm test src/tests/processMarkdown.spec.ts`

Expected: PASS.

### Task 3: Add light tests for alternate inputs

**Files:**
- Modify: `src/tests/processMarkdown.spec.ts`

**Step 1: Add Readable stream input test**

```ts
import { Readable } from "stream";
// ...
const stream = Readable.from([source]);
const fileInfo = await processMarkdown(stream, { filePath: fullPath, rootFolder: pathToContentFixture, pathToUrlResolver: (p) => p });
expect(fileInfo.url_path).toBe("index.mdx");
```

**Step 2: Run test to verify it fails**

Run: `npm test src/tests/processMarkdown.spec.ts`

Expected: FAIL (stream not supported yet, if not already implemented).

**Step 3: Implement minimal stream handling if needed**

Update `readMarkdownInput` to consume a Node Readable stream.

**Step 4: Run test to verify it passes**

Run: `npm test src/tests/processMarkdown.spec.ts`

Expected: PASS.

**Step 5: Add ArrayBuffer input test**

```ts
const buffer = new TextEncoder().encode(source).buffer;
const fileInfo = await processMarkdown(buffer, { filePath: fullPath, rootFolder: pathToContentFixture, pathToUrlResolver: (p) => p });
expect(fileInfo.url_path).toBe("index.mdx");
```

**Step 6: Run test to verify it fails**

Run: `npm test src/tests/processMarkdown.spec.ts`

Expected: FAIL if ArrayBuffer not yet supported.

**Step 7: Implement minimal ArrayBuffer handling if needed**

Update `readMarkdownInput` to handle `ArrayBuffer`.

**Step 8: Run test to verify it passes**

Run: `npm test src/tests/processMarkdown.spec.ts`

Expected: PASS.

### Task 4: Refactor internal usage to new API

**Files:**
- Modify: `src/lib/indexFolder.ts`
- Modify: `src/lib/markdowndb.ts`
- Modify: `src/tests/process.spec.ts`

**Step 1: Update tests and callers to use `processMarkdown`**

Change imports/usages from `processFile` to `processMarkdown` and pass `{ filePath, rootFolder, pathToUrlResolver, permalinks, computedFields }` via the options object.

**Step 2: Run the related tests to verify they fail**

Run: `npm test src/tests/process.spec.ts`

Expected: FAIL until code is updated.

**Step 3: Update `processFile` alias and type exports as needed**

Ensure the alias in `src/lib/process.ts` keeps existing imports working.

**Step 4: Run the targeted tests to verify they pass**

Run: `npm test src/tests/process.spec.ts`

Expected: PASS.

### Task 5: Export processMarkdown in public API

**Files:**
- Modify: `src/index.ts`

**Step 1: Export the new API**

```ts
export * from "./lib/markdowndb.js";
export { processMarkdown, processFile } from "./lib/process.js";
```

**Step 2: Run a quick type/build check**

Run: `npm run build`

Expected: build succeeds.

### Task 6: Document the new API

**Files:**
- Modify: `README.md`

**Step 1: Add a single-file processing example**

Include a snippet showing:
- `processMarkdown` with a raw string
- A note about passing `filePath/rootFolder` for link resolution
- Mention that backlinks are not computed without folder context

**Step 2: Sanity check docs**

No command required; ensure example is consistent with the API.

