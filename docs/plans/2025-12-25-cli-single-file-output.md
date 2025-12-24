# CLI Single-File Output Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the CLI so `mddb <path>` prints parsed JSON for single files and keeps existing indexing behavior for directories, with README docs.

**Architecture:** Add a file-path branch in `src/bin/index.js` that detects a file, warns on non-markdown extensions, calls `processMarkdown` with a stream, and prints pretty JSON. Add a CLI test that spawns the built CLI and asserts stdout/stderr. Update README with the new CLI behavior.

**Tech Stack:** Node.js CLI, TypeScript build output, Jest, child_process.

### Task 1: Add failing CLI test for file input

**Files:**
- Create: `src/tests/cli.spec.ts`

**Step 1: Write the failing test**

```ts
import { execFileSync } from "child_process";
import path from "path";

const cliPath = path.join(process.cwd(), "dist", "src", "bin", "index.js");

describe("mddb CLI", () => {
  test("prints JSON for a single markdown file", () => {
    const filePath = path.join("__mocks__", "content", "index.mdx");

    const stdout = execFileSync(process.execPath, [cliPath, filePath], {
      encoding: "utf8",
    });

    const parsed = JSON.parse(stdout);
    expect(parsed.file_path).toBe(filePath);
    expect(parsed.extension).toBe("mdx");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/cli.spec.ts --runTestsByPath`

Expected: FAIL (no JSON output yet).

### Task 2: Implement CLI single-file mode

**Files:**
- Modify: `src/bin/index.js`

**Step 1: Add file detection and JSON output**

Implement:
- Resolve input path to absolute/normalized (if needed).
- If `fs.statSync(inputPath).isFile()`:
  - If extension is not `.md` or `.markdown`, log warning to stderr: `Is this a markdown file? Expected .md or .markdown.`
  - Create a read stream (`fs.createReadStream(inputPath)`).
  - Call `processMarkdown(stream, { filePath: inputPath, rootFolder: path.dirname(inputPath), pathToUrlResolver: (p) => p })`.
  - `console.log(JSON.stringify(fileInfo, null, 2))` and `process.exit(0)`.
- Otherwise, keep existing directory indexing behavior unchanged.

**Step 2: Run test to verify it passes**

Run: `npm test -- src/tests/cli.spec.ts --runTestsByPath`

Expected: PASS.

### Task 3: Add warning test for non-markdown extension

**Files:**
- Modify: `src/tests/cli.spec.ts`

**Step 1: Add warning test**

```ts
import fs from "fs";
// ... existing imports

test("warns when file extension is not markdown", () => {
  const tmpFile = path.join("__mocks__", "content", "not-markdown.txt");
  fs.writeFileSync(tmpFile, "# title");

  let stderr = "";
  const stdout = execFileSync(process.execPath, [cliPath, tmpFile], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  // execFileSync returns stdout; capture stderr by re-running with spawnSync if needed.
});
```

Replace with `spawnSync` to capture stderr reliably.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/cli.spec.ts --runTestsByPath`

Expected: FAIL until warning is implemented.

**Step 3: Implement minimal warning logic if needed**

Update `src/bin/index.js` to write warning to `process.stderr`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/cli.spec.ts --runTestsByPath`

Expected: PASS.

### Task 4: Update README CLI usage

**Files:**
- Modify: `README.md`

**Step 1: Add CLI examples**

Add examples near the CLI section:
- `mddb ./content` indexes a directory (existing behavior).
- `mddb ./content/post.md` prints JSON to stdout.
- Note about warning for non-markdown extensions.

**Step 2: Sanity check docs**

No command required.

### Task 5: Verify full test suite

**Files:**
- Modify: none

**Step 1: Run full test suite**

Run: `npm test`

Expected: PASS.

### Task 6: Commit changes

**Files:**
- Modify: `src/bin/index.js`
- Modify: `src/tests/cli.spec.ts`
- Modify: `README.md`

**Step 1: Commit**

```bash
git add src/bin/index.js src/tests/cli.spec.ts README.md
git commit -m "feat: add CLI single-file JSON output"
```
