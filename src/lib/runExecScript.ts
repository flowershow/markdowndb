import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL, fileURLToPath } from "url";

export const runExecScript = (scriptPath: string, scriptArgs: string[]) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-exec-"));
  const require = createRequire(import.meta.url);
  
  // Try to resolve "mddb" package, fall back to local dist if not found
  let mddbEntry: string;
  let usingLocalBuild = false;
  try {
    mddbEntry = require.resolve("mddb");
  } catch (error) {
    // Only handle MODULE_NOT_FOUND errors, throw others
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      (error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND'
    ) {
      throw error;
    }
    // When running in development/testing, resolve to the local built version
    // This file is at dist/src/lib/runExecScript.js, so go up to project root
    const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
    mddbEntry = path.join(projectRoot, 'dist', 'src', 'index.js');
    usingLocalBuild = true;
    
    // Verify the built file exists
    if (!fs.existsSync(mddbEntry)) {
      throw new Error(
        `Cannot find mddb module. The package is not installed and the local build is missing.\n` +
        `Please run 'npm run build' first to create the local build at: ${mddbEntry}`
      );
    }
  }
  
  const loaderPath = path.join(tmpDir, "loader.mjs");
  fs.writeFileSync(
    loaderPath,
    `import { pathToFileURL } from "node:url";
export function resolve(specifier, context, defaultResolve) {
  if (specifier === "mddb") {
    return { url: pathToFileURL(${JSON.stringify(
      mddbEntry
    )}).href, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
`
  );

  const baseUrl = pathToFileURL(process.cwd() + path.sep).href;
  const registerSource = `import { register } from "node:module";
import { pathToFileURL } from "node:url";
register(${JSON.stringify(loaderPath)}, pathToFileURL(${JSON.stringify(
    baseUrl
  )}));
`;
  const registerUrl = `data:text/javascript,${encodeURIComponent(
    registerSource
  )}`;
  const result = spawnSync(
    process.execPath,
    ["--import", registerUrl, scriptPath, ...scriptArgs],
    { stdio: "inherit" }
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (typeof result.status === "number") {
    return result.status;
  }

  return 1;
};
